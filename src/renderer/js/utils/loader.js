// 今日待办相关变量 (加载器模块)
let loaderTodayDateTimer = null;

// 通知管理器变量
let notificationManager = null;

// 页面加载后执行
document.addEventListener('DOMContentLoaded', async () => {
  // 获取DOM元素
  const navItems = document.querySelectorAll('.nav-item');
  const userInfo = document.querySelector('.user-info');
  const views = document.querySelectorAll('.view');

  
  // 侧边栏切换功能已在 initSidebarToggle() 中处理
  
  // 导航项点击事件
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const viewId = item.dataset.view;
      
      // 移除所有导航项的active类
      navItems.forEach(navItem => {
        navItem.classList.remove('active');
      });
      
      // 移除所有视图的active类
      views.forEach(view => {
        view.classList.remove('active');
      });
      
      // 添加当前导航项和视图的active类
      item.classList.add('active');
      document.getElementById(viewId).classList.add('active');
    });
  });
  
  // 用户信息点击事件
  userInfo.addEventListener('click', () => {
    const viewId = userInfo.dataset.view;
    
    // 移除所有导航项的active类
    navItems.forEach(navItem => {
      navItem.classList.remove('active');
    });
    
    // 移除所有视图的active类
    views.forEach(view => {
      view.classList.remove('active');
    });
    
    // 添加当前视图的active类
    document.getElementById(viewId).classList.add('active');
  });
  
  // 添加用户信息区域的焦点处理
  userInfo.addEventListener('blur', () => {
    // 确保鼠标移出后移除焦点状态
    userInfo.blur();
  });
  
  userInfo.addEventListener('mouseleave', () => {
    // 鼠标离开时移除焦点
    userInfo.blur();
  });
  

  
  // 用户页面取消按钮点击事件
  const cancelProfileBtn = document.querySelector('.cancel-btn');
  if (cancelProfileBtn) {
    cancelProfileBtn.addEventListener('click', () => {
      // 切换回统计页面
      views.forEach(view => {
        view.classList.remove('active');
      });
      document.getElementById('stats-view').classList.add('active');
      
      // 重置导航项激活状态
      navItems.forEach(navItem => {
        if (navItem.dataset.view === 'stats-view') {
          navItem.classList.add('active');
        } else {
          navItem.classList.remove('active');
        }
      });
    });
  }

  // 初始化窗口控制
  initWindowControls();

  // 初始化导航菜单
  initNavigation();

  // 初始化侧边栏收起功能
  initSidebarToggle();

  // 初始化待办事项功能
  await initTodoFunctionality();

  // 初始化子项对话框
  initChildTodoDialog();

  // 初始化国际化
  await initI18n();

  // 初始化统计页面
  await initStatsView();

  // 初始化设置页面
  initSettingsView();

  // 初始化今日待办页面
  await initTodayView();

  // 加载用户信息
  await loadUserInfo();

  // 加载用户设置
  await loadUserSettings();

  // 初始化通知管理器
  await initNotificationManager();

  // 测试启动页面设置（可以在控制台看到当前设置）
  console.log('应用启动完成');
});