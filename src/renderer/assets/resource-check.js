/**
 * 资源检查脚本
 * 用于在开发模式下检查关键资源是否正确加载
 */

(function() {
  'use strict';

  // 等待DOM加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkResources);
  } else {
    checkResources();
  }

  function checkResources() {
    console.log('🔍 开始检查资源加载状态...');
    
    const resources = [
      { name: 'CSS样式', path: 'css/main.css', type: 'css' },
      { name: 'SoberUI库', path: 'assets/libs/sober.min.js', type: 'js' },
      { name: '数据管理器', path: 'js/core/data-manager.js', type: 'js' },
      { name: '通知服务', path: 'js/services/notification-service.js', type: 'js' },
      { name: '国际化配置', path: 'js/config/i18n.js', type: 'js' },
      { name: '主应用', path: 'js/core/app.js', type: 'js' }
    ];

    let allResourcesLoaded = true;
    const results = [];

    resources.forEach(resource => {
      const isLoaded = checkResourceLoaded(resource);
      results.push({
        ...resource,
        loaded: isLoaded
      });
      
      if (!isLoaded) {
        allResourcesLoaded = false;
        console.warn(`⚠️ 资源加载失败: ${resource.name} (${resource.path})`);
      } else {
        console.log(`✅ 资源加载成功: ${resource.name}`);
      }
    });

    // 检查图标资源
    checkIconResources();

    if (allResourcesLoaded) {
      console.log('🎉 所有关键资源加载成功！');
    } else {
      console.error('❌ 部分资源加载失败，应用可能无法正常工作');
      showResourceWarning(results.filter(r => !r.loaded));
    }
  }

  function checkResourceLoaded(resource) {
    if (resource.type === 'css') {
      // 检查CSS是否加载
      const links = document.querySelectorAll('link[rel="stylesheet"]');
      for (let link of links) {
        if (link.href.includes(resource.path)) {
          return link.sheet !== null;
        }
      }
      return false;
    } else if (resource.type === 'js') {
      // 检查JavaScript是否加载
      const scripts = document.querySelectorAll('script[src]');
      for (let script of scripts) {
        if (script.src.includes(resource.path)) {
          return !script.hasAttribute('data-failed');
        }
      }
      return false;
    }
    return true;
  }

  function checkIconResources() {
    const iconPaths = [
      'assets/icons/sidebar-toggle.svg',
      'assets/icons/stats.svg',
      'assets/icons/today.svg',
      'assets/icons/todo.svg',
      'assets/icons/settings.svg',
      'assets/icon.png'
    ];

    iconPaths.forEach(path => {
      fetch(path)
        .then(response => {
          if (response.ok) {
            console.log(`✅ 图标资源存在: ${path}`);
          } else {
            console.warn(`⚠️ 图标资源不存在: ${path}`);
          }
        })
        .catch(() => {
          console.warn(`⚠️ 图标资源检查失败: ${path}`);
        });
    });
  }

  function showResourceWarning(failedResources) {
    if (failedResources.length === 0) return;

    const warningDiv = document.createElement('div');
    warningDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
      padding: 16px;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.4;
    `;

    const title = document.createElement('div');
    title.style.cssText = `
      font-weight: 600;
      color: #856404;
      margin-bottom: 8px;
    `;
    title.textContent = '⚠️ 资源加载警告';

    const message = document.createElement('div');
    message.style.color = '#856404';
    message.innerHTML = `
      以下资源加载失败：<br>
      ${failedResources.map(r => `• ${r.name}`).join('<br>')}
    `;

    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      font-size: 16px;
      cursor: pointer;
      color: #856404;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    closeBtn.textContent = '×';
    closeBtn.onclick = () => warningDiv.remove();

    warningDiv.appendChild(title);
    warningDiv.appendChild(message);
    warningDiv.appendChild(closeBtn);
    document.body.appendChild(warningDiv);

    // 5秒后自动关闭
    setTimeout(() => {
      if (warningDiv.parentNode) {
        warningDiv.remove();
      }
    }, 5000);
  }

  // 监听脚本加载错误
  window.addEventListener('error', function(e) {
    if (e.target.tagName === 'SCRIPT') {
      console.error(`❌ 脚本加载失败: ${e.target.src}`);
      e.target.setAttribute('data-failed', 'true');
    } else if (e.target.tagName === 'LINK') {
      console.error(`❌ 样式表加载失败: ${e.target.href}`);
    }
  }, true);

})();
