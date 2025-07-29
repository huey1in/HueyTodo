// 窗口控制功能
function initWindowControls() {
  // 获取窗口控制按钮
  const minimizeBtn = document.getElementById('minimize-btn');
  const closeBtn = document.getElementById('close-btn');

  // 添加窗口控制事件
  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', () => {
      window.api.send('window-control', 'minimize');
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      window.api.send('window-control', 'close');
    });
  }

  // 禁用标题栏双击全屏
  const titlebar = document.querySelector('.titlebar');
  if (titlebar) {
    titlebar.addEventListener('dblclick', (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    });
  }

  // 置顶按钮功能
  const pinBtn = document.getElementById('pin-btn');
  if (pinBtn) {
    pinBtn.addEventListener('click', () => {
      window.api.send('window-control', 'toggle-pin');
    });
  }

  // 监听置顶状态变化
  if (window.api && window.api.receive) {
    window.api.receive('pin-status-changed', (isPinned) => {
      const pinBtn = document.getElementById('pin-btn');
      if (pinBtn) {
        if (isPinned) {
          pinBtn.classList.add('active');
          pinBtn.title = window.i18n ? window.i18n.t('window.unpin') : '取消置顶';
        } else {
          pinBtn.classList.remove('active');
          pinBtn.title = window.i18n ? window.i18n.t('window.pin') : '置顶窗口';
        }
      }
    });
  }
}

// 导航菜单功能
function initNavigation() {
  // 获取所有导航项
  const navItems = document.querySelectorAll('.nav-item');
  
  // 为每个导航项添加点击事件
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // 移除所有导航项的active类
      navItems.forEach(navItem => {
        navItem.classList.remove('active');
      });
      
      // 为当前点击的导航项添加active类
      item.classList.add('active');
      
      // 切换视图
      const viewId = item.getAttribute('data-view');
      switchView(viewId);
    });
  });
}

// 切换视图函数
function switchView(viewId) {
  // 隐藏所有视图
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  
  // 显示指定视图
  const currentView = document.getElementById(viewId);
  if (currentView) {
    currentView.classList.add('active');
  }
}