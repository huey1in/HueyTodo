// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// 向渲染进程暴露窗口控制API
contextBridge.exposeInMainWorld('api', {
  // 窗口控制功能
  send: (channel, data) => {
    // 允许的通道
    const validChannels = ['window-control', 'notification-action'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  // 监听主进程消息
  receive: (channel, func) => {
    const validChannels = ['pin-status-changed'];
    if (validChannels.includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
});

// 向渲染进程暴露Electron API
contextBridge.exposeInMainWorld('electronAPI', {
  // 通知相关功能
  showNotification: (title, body, options = {}) => {
    ipcRenderer.send('notification-action', 'show', {
      title,
      body,
      ...options
    });
  },

  // 窗口聚焦功能
  focusWindow: () => {
    ipcRenderer.send('notification-action', 'focus-window');
  },

  // 检查是否支持通知
  isNotificationSupported: () => {
    return 'Notification' in window;
  }
});