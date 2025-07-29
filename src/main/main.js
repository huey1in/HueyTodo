const { app, BrowserWindow, Menu, ipcMain, nativeImage, Notification } = require('electron')
const path = require('path')
const fs = require('fs')

// 保持对window对象的全局引用，如果不这样做的话，当JavaScript对象被
// 垃圾回收的时候，window对象将会自动的关闭
let mainWindow

function createWindow() {
  // 根据平台设置应用图标
  let iconPath;
  if (process.platform === 'win32') {
    iconPath = path.join(__dirname, 'assets', 'favicon.ico');
  } else if (process.platform === 'darwin') {
    iconPath = path.join(__dirname, 'assets', 'favicon.ico');
  } else {
    iconPath = path.join(__dirname, 'assets', 'favicon.ico');
  }

  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    frame: false, // 无边框窗口
    resizable: false, // 禁止调整窗口大小
    maximizable: false, // 禁止最大化
    fullscreenable: false, // 禁止全屏
    transparent: false, // 不使用透明窗口背景
    hasShadow: true, // 添加阴影
    titleBarStyle: 'hiddenInset', // 隐藏标题栏但显示交通灯控制按钮
    icon: iconPath, // 设置应用图标
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // 删除菜单栏
  Menu.setApplicationMenu(null)

  // 加载index.html文件
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))

  // 设置窗口图标
  const windowIconPath = path.join(__dirname, '../renderer/assets', 'favicon.ico')
  if (fs.existsSync(windowIconPath)) {
    const icon = nativeImage.createFromPath(windowIconPath)
    mainWindow.setIcon(icon)
  }

  // 开发模式下打开开发者工具
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // 当window被关闭时，触发事件
  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

// 当Electron完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(() => {
  // 设置应用程序ID
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.hueytodo.app')
  }

  createWindow()

  app.on('activate', function () {
    // 在macOS上，当点击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 当所有窗口关闭时退出应用
app.on('window-all-closed', function () {
  // 在macOS上，除非用户用Cmd + Q确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') app.quit()
})

// 处理窗口控制命令
ipcMain.on('window-control', (event, command) => {
  if (!mainWindow) return

  switch (command) {
    case 'minimize':
      mainWindow.minimize()
      break
    case 'close':
      mainWindow.close()
      break
    case 'toggle-pin':
      const isAlwaysOnTop = mainWindow.isAlwaysOnTop()
      mainWindow.setAlwaysOnTop(!isAlwaysOnTop)
      // 返回新的置顶状态给渲染进程
      mainWindow.webContents.send('pin-status-changed', !isAlwaysOnTop)
      break
  }
})

// 处理通知相关命令
ipcMain.on('notification-action', (event, action, data) => {
  if (!mainWindow) return

  switch (action) {
    case 'show':
      // 发送系统通知
      if (Notification.isSupported()) {
        const notification = new Notification({
          title: data.title,
          body: data.body,
          icon: data.icon || path.join(__dirname, 'assets', 'icon-64.png'),
          silent: data.silent || false
        })

        notification.on('click', () => {
          // 点击通知时聚焦窗口
          if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
            mainWindow.show()
          }
        })

        notification.show()
      }
      break
    case 'focus-window':
      // 聚焦窗口
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
      mainWindow.show()
      break
  }
})