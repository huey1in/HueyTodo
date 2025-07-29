// 资源加载性能监控
function logResourcePerformance() {
  if (window.performance && window.performance.getEntriesByType) {
    const resources = window.performance.getEntriesByType('resource');
    const scripts = resources.filter(r => r.name.includes('.js'));
    const styles = resources.filter(r => r.name.includes('.css'));

    console.group('📊 资源加载性能');
    console.log(`脚本文件: ${scripts.length}个, 平均加载时间: ${(scripts.reduce((sum, s) => sum + s.duration, 0) / scripts.length).toFixed(2)}ms`);
    console.log(`样式文件: ${styles.length}个, 平均加载时间: ${(styles.reduce((sum, s) => sum + s.duration, 0) / styles.length).toFixed(2)}ms`);

    // 检查本地资源加载情况
    const localSober = resources.find(r => r.name.includes('assets/libs/sober.min.js'));
    const fallbackSober = resources.find(r => r.name.includes('node_modules/sober'));

    if (localSober) {
      console.log(`✅ SoberUI本地加载: ${localSober.duration.toFixed(2)}ms`);
    } else if (fallbackSober) {
      console.log(`⚠️ SoberUI降级加载: ${fallbackSober.duration.toFixed(2)}ms`);
    }
    console.groupEnd();
  }
}

// 今日待办相关变量
let todayDateTimer = null;

// 通知管理器变量
let notificationManager = null;

// 页面加载后执行
document.addEventListener('DOMContentLoaded', async () => {
  // 记录性能信息
  setTimeout(logResourcePerformance, 1000);
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
      
      // 为当前导航项添加active类
      item.classList.add('active');
      
      // 切换视图
      switchView(viewId);
    });
  });

  // 初始化各个功能模块
  try {
    // 初始化窗口控制
    initWindowControls();
    
    // 初始化导航菜单
    initNavigation();
    
    // 初始化侧边栏收起功能
    initSidebarToggle();
    
    // 初始化国际化
    await initI18n();
    
    // 加载用户信息
    await loadUserInfo();
    
    // 加载用户设置
    await loadUserSettings();
    
    // 初始化待办事项功能
    await initTodoFunctionality();
    
    // 初始化统计页面
    await initStatsView();
    
    // 初始化设置页面
    initSettingsView();
    
    // 初始化今日待办页面
    await initTodayView();
    
    // 初始化通知管理器
    await initNotificationManager();
    
    // 初始化通知设置
    initNotificationSettings();
    
    // 启动倒计时定时器
    startCountdownTimer();
    
    // 应用启动页面设置
    const settings = await dataManager.getSettings();
    const startupView = settings?.ui?.startupView || 'stats-view';
    applyStartupView(startupView);
    
    // 在开发模式下添加通知测试按钮
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      addNotificationTestButton();
    }
    
  } catch (error) {
    console.error('应用初始化失败:', error);
  }
  
  // 测试启动页面设置（可以在控制台看到当前设置）
  console.log('应用启动完成');
});
