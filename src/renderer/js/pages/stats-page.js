// 初始化统计页面
async function initStatsView() {
  // 重置进度条，准备动画
  resetProgressBars();

  // 监听统计页面的显示事件
  const statsView = document.getElementById('stats-view');
  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach(item => {
    if (item.dataset.view === 'stats-view') {
      item.addEventListener('click', async () => {
        // 当点击统计导航项时，重置并启动进度条动画
        resetProgressBars();
        setTimeout(async () => {
          await updateStatsDisplay();
        }, 100);
      });
    }
  });

  // 初始加载时启动动画
  setTimeout(async () => {
    await updateStatsDisplay();
  }, 300);
}

// 更新统计显示
async function updateStatsDisplay() {
  try {
    const stats = await dataManager.getStats();

    if (!stats) {
      console.error('无法获取统计数据');
      return;
    }

    const { pending, completed, overdue } = stats.totals;
    const total = pending + completed;

    // 计算百分比
    const pendingPercent = total > 0 ? Math.round((pending / total) * 100) : 0;
    const completedPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const overduePercent = total > 0 ? Math.round((overdue / total) * 100) : 0;

    // 启动数字和进度条动画
    const statsCards = document.querySelectorAll('.stats-linear-card');

    if (statsCards.length >= 3) {
      // 使用延时来创建错开的动画效果
      setTimeout(() => {
        // 待办任务
        const pendingCountEl = statsCards[0].querySelector('.stats-value-small');
        const pendingProgress = document.querySelector('.pending-progress');
        if (pendingProgress) pendingProgress.setAttribute('value', pendingPercent.toString());
        animateCountUp(pendingCountEl, pending, 200);
      }, 100);

      setTimeout(() => {
        // 已完成任务
        const completedCountEl = statsCards[1].querySelector('.stats-value-small');
        const completedProgress = document.querySelector('.completed-progress');
        if (completedProgress) completedProgress.setAttribute('value', completedPercent.toString());
        animateCountUp(completedCountEl, completed, 200);
      }, 200);

      setTimeout(() => {
        // 超期任务
        const overdueCountEl = statsCards[2].querySelector('.stats-value-small');
        const overdueProgress = document.querySelector('.overdue-progress');
        if (overdueProgress) overdueProgress.setAttribute('value', overduePercent.toString());
        animateCountUp(overdueCountEl, overdue, 200);
      }, 300);
    }

  } catch (error) {
    console.error('更新统计显示失败:', error);
  }
}

// 重置进度条状态
function resetProgressBars() {
  // 重置线性进度条
  const linearProgressBars = document.querySelectorAll('s-linear-progress');
  linearProgressBars.forEach(progressBar => {
    progressBar.setAttribute('value', '0');
  });
}

// 启动进度条动画（已被updateStatsDisplay替代）
function animateProgressBars() {
  // 这个函数已被updateStatsDisplay替代，保留以防兼容性问题
  updateStatsDisplay();
}

// 数字计数动画函数
function animateCountUp(element, targetValue, duration) {
  if (!element) return;

  let startValue = 0;
  const increment = targetValue / (duration / 16);

  const animation = setInterval(() => {
    startValue += increment;

    if (startValue >= targetValue) {
      startValue = targetValue;
      clearInterval(animation);
    }

    const roundedValue = Math.round(startValue);
    element.textContent = roundedValue.toString();
  }, 16);
}