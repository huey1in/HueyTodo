// 初始化设置页面
function initSettingsView() {
  // 主题色选择
  const themeColorOptions = document.querySelectorAll('.theme-color-option');
  if (themeColorOptions.length) {
    themeColorOptions.forEach(option => {
      option.addEventListener('click', () => {
        // 移除其他选项的选中状态
        themeColorOptions.forEach(opt => opt.classList.remove('selected'));
        
        // 添加当前选项的选中状态
        option.classList.add('selected');
        
        // 应用主题色
        const color = option.getAttribute('data-color');
        applyThemeColor(color);
      });
    });
  }
  
  // 父项同步开关
  const autoParentSyncSwitch = document.getElementById('auto-parent-sync');
  if (autoParentSyncSwitch) {
    autoParentSyncSwitch.addEventListener('change', () => {
      const isEnabled = autoParentSyncSwitch.checked;
      const message = isEnabled
        ? (window.i18n ? window.i18n.t('message.autoParentSyncEnabled') : '父项自动同步已启用')
        : (window.i18n ? window.i18n.t('message.autoParentSyncDisabled') : '父项自动同步已禁用');
      showSnackbar(message);
    });
  }

  // 通知设置
  initNotificationSettings();

  // 保存设置按钮
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', async () => {
      try {
        await saveUserSettings();
        showSnackbar(window.i18n ? window.i18n.t('message.settingsSaved') : '设置已保存');
      } catch (error) {
        showSnackbar(window.i18n ? window.i18n.t('message.settingsSaveFailed') : '保存设置失败');
      }
    });
  }
  
  // 重置设置按钮
  const resetSettingsBtn = document.getElementById('reset-settings-btn');
  if (resetSettingsBtn) {
    resetSettingsBtn.addEventListener('click', () => {
      resetUserSettings();
      showSnackbar(window.i18n ? window.i18n.t('message.settingsReset') : '设置已重置');
    });
  }
}

// 应用主题色
function applyThemeColor(color) {
  document.documentElement.style.setProperty('--theme-color', color);
  
  // 计算主题色的亮色和暗色变体
  const lightColor = getLighterColor(color, 0.9);
  const darkColor = getDarkerColor(color, 0.2);
  
  document.documentElement.style.setProperty('--theme-color-light', lightColor);
  document.documentElement.style.setProperty('--theme-color-dark', darkColor);
}

// 获取更亮的颜色
function getLighterColor(hex) {
  return `rgba(${hexToRgb(hex).join(', ')}, 0.1)`;
}

// 获取更暗的颜色
function getDarkerColor(hex, factor) {
  const rgb = hexToRgb(hex);
  const darker = rgb.map(c => Math.max(0, Math.floor(c * (1 - factor))));
  return rgbToHex(darker);
}

// HEX转RGB
function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

// RGB转HEX
function rgbToHex(rgb) {
  return '#' + rgb.map(c => {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// 保存用户设置
async function saveUserSettings() {
  try {
    const updates = {
      theme: {
        color: document.querySelector('.theme-color-option.selected')?.getAttribute('data-color') || '#0078d4',
        mode: 'light'
      },
      startup: {
        view: document.getElementById('startup-view')?.value || 'stats-view'
      },
      features: {
        notifications: true,
        autoParentSync: document.getElementById('auto-parent-sync')?.checked ?? true
      },
      notifications: {
        enabled: document.getElementById('enable-notifications')?.checked ?? true,
        dailyReminderTime: document.getElementById('daily-reminder-time')?.value || '20:00',
        overdueWarningDays: parseInt(document.getElementById('overdue-warning-days')?.value) || 1
      }
    };

    await dataManager.updateSettings(updates);
  } catch (error) {
    console.error('保存用户设置失败:', error);
    throw error;
  }
}

// 加载用户设置
async function loadUserSettings() {
  try {
    const settings = await dataManager.getSettings();

    if (settings) {
      // 应用主题色
      if (settings.theme && settings.theme.color) {
        applyThemeColor(settings.theme.color);

        // 选中对应的颜色选项
        const colorOption = document.querySelector(`.theme-color-option[data-color="${settings.theme.color}"]`);
        if (colorOption) {
          document.querySelectorAll('.theme-color-option').forEach(opt => opt.classList.remove('selected'));
          colorOption.classList.add('selected');
        }
      }

      // 应用启动视图设置
      if (settings.startup && settings.startup.view) {
        const startupViewPicker = document.getElementById('startup-view');
        if (startupViewPicker) {
          startupViewPicker.value = settings.startup.view;
        }

        // 应用启动页面设置
        applyStartupView(settings.startup.view);
      }

      // 应用父项同步设置
      if (settings.features) {
        const autoParentSyncSwitch = document.getElementById('auto-parent-sync');
        if (autoParentSyncSwitch) {
          autoParentSyncSwitch.checked = settings.features.autoParentSync ?? true;
        }
      }

      // 应用通知设置
      if (settings.notifications) {
        const enableNotificationsSwitch = document.getElementById('enable-notifications');
        if (enableNotificationsSwitch) {
          enableNotificationsSwitch.checked = settings.notifications.enabled ?? true;
        }

        const dailyReminderTimeInput = document.getElementById('daily-reminder-time');
        if (dailyReminderTimeInput) {
          dailyReminderTimeInput.value = settings.notifications.dailyReminderTime || '20:00';
        }

        const overdueWarningDaysPicker = document.getElementById('overdue-warning-days');
        if (overdueWarningDaysPicker) {
          overdueWarningDaysPicker.value = (settings.notifications.overdueWarningDays ?? 1).toString();
        }
      }
    } else {
      // 设置默认主题色
      const defaultThemeColor = '#0078d4';
      applyThemeColor(defaultThemeColor);

      // 选中默认颜色选项
      const defaultColorOption = document.querySelector(`.theme-color-option[data-color="${defaultThemeColor}"]`);
      if (defaultColorOption) {
        defaultColorOption.classList.add('selected');
      }
    }
  } catch (error) {
    console.error('加载设置时出错:', error);
  }
}

// 检查父项自动同步是否启用
function isAutoParentSyncEnabled() {
  const autoParentSyncSwitch = document.getElementById('auto-parent-sync');
  return autoParentSyncSwitch ? autoParentSyncSwitch.checked : true; // 默认启用
}

// 计算倒计时文本
function getCountdownText(dueDate) {
  if (!dueDate) {
    return window.i18n ? window.i18n.t('todo.dueDateNotSet') : '未设置';
  }

  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();

  // 如果已过期
  if (diffMs < 0) {
    const overdueDays = Math.ceil(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
    if (overdueDays === 1) {
      return window.i18n ? window.i18n.t('todo.overdue1Day') : '逾期1天';
    } else {
      return window.i18n ? window.i18n.t('todo.overdueDays', { days: overdueDays }) : `逾期${overdueDays}天`;
    }
  }

  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.ceil(diffMs / (1000 * 60));

  // 根据时间差返回不同的格式
  if (diffDays > 7) {
    const weeks = Math.floor(diffDays / 7);
    const remainingDays = diffDays % 7;
    if (remainingDays === 0) {
      return window.i18n ? window.i18n.t('todo.weeksLeft', { weeks }) : `${weeks}周后`;
    } else {
      return window.i18n ? window.i18n.t('todo.weeksAndDaysLeft', { weeks, days: remainingDays }) : `${weeks}周${remainingDays}天后`;
    }
  } else if (diffDays > 1) {
    return window.i18n ? window.i18n.t('todo.daysLeft', { days: diffDays }) : `${diffDays}天后`;
  } else if (diffDays === 1) {
    return window.i18n ? window.i18n.t('todo.tomorrow') : '明天';
  } else if (diffHours > 1) {
    return window.i18n ? window.i18n.t('todo.hoursLeft', { hours: diffHours }) : `${diffHours}小时后`;
  } else if (diffMinutes > 1) {
    return window.i18n ? window.i18n.t('todo.minutesLeft', { minutes: diffMinutes }) : `${diffMinutes}分钟后`;
  } else {
    return window.i18n ? window.i18n.t('todo.soon') : '即将到期';
  }
}

// 获取倒计时的紧急程度样式类
function getCountdownUrgencyClass(dueDate) {
  if (!dueDate) return '';

  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();

  if (diffMs < 0) {
    return 'overdue'; // 已过期
  } else if (diffMs < 24 * 60 * 60 * 1000) {
    return 'urgent'; // 24小时内
  } else if (diffMs < 3 * 24 * 60 * 60 * 1000) {
    return 'warning'; // 3天内
  } else {
    return 'normal'; // 正常
  }
}

// 启动倒计时更新定时器
function startCountdownTimer() {
  // 每分钟更新一次倒计时
  setInterval(() => {
    updateAllCountdowns();
  }, 60000); // 60秒
}

// 更新所有倒计时显示
function updateAllCountdowns() {
  const todoItems = document.querySelectorAll('.todo-item');

  todoItems.forEach(item => {
    const todoId = item.getAttribute('data-id');
    if (!todoId) return;

    // 从数据管理器获取todo数据
    dataManager.getTodoById(todoId).then(todo => {
      if (!todo) return;

      const dueDateElement = item.querySelector('.todo-due-date');
      if (!dueDateElement) return;

      // 更新倒计时文本和样式
      const countdownText = getCountdownText(todo.dueDate);
      const urgencyClass = getCountdownUrgencyClass(todo.dueDate);

      dueDateElement.textContent = countdownText;
      dueDateElement.className = `todo-due-date ${urgencyClass}`;
    }).catch(error => {
      console.error('更新倒计时失败:', error);
    });
  });
}

// 应用启动页面设置
function applyStartupView(viewId) {
  // 确保viewId是有效的
  const validViews = ['stats-view', 'todo-view', 'settings-view'];
  if (!validViews.includes(viewId)) {
    viewId = 'stats-view'; // 默认为统计页面
  }

  // 切换到指定页面
  setTimeout(() => {
    // 移除所有导航项的active类
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(navItem => {
      navItem.classList.remove('active');
    });

    // 移除所有视图的active类
    const views = document.querySelectorAll('.view');
    views.forEach(view => {
      view.classList.remove('active');
    });

    // 添加对应导航项的active类
    const targetNavItem = document.querySelector(`[data-view="${viewId}"]`);
    if (targetNavItem) {
      targetNavItem.classList.add('active');
    }

    // 显示对应的视图
    const targetView = document.getElementById(viewId);
    if (targetView) {
      targetView.classList.add('active');
    }
  }, 100); // 稍微延迟以确保页面已完全加载
}

// 重置用户设置
function resetUserSettings() {
  // 重置主题色
  const defaultThemeColor = '#0078d4';
  applyThemeColor(defaultThemeColor);
  
  // 重置颜色选项
  const colorOptions = document.querySelectorAll('.theme-color-option');
  colorOptions.forEach(opt => opt.classList.remove('selected'));
  const defaultColorOption = document.querySelector(`.theme-color-option[data-color="${defaultThemeColor}"]`);
  if (defaultColorOption) {
    defaultColorOption.classList.add('selected');
  }
  
  // 重置启动视图
  const startupViewPicker = document.getElementById('startup-view');
  if (startupViewPicker) {
    startupViewPicker.value = 'stats-view';
  }
}

// 显示对话框
function showDialog(title, content, cancelText, confirmText, onConfirm) {
  // 创建对话框容器
  const dialogOverlay = document.createElement('div');
  dialogOverlay.className = 'dialog-overlay';
  
  const dialogContainer = document.createElement('div');
  dialogContainer.className = 'dialog-container';
  
  dialogContainer.innerHTML = `
    <div class="dialog-header">${title}</div>
    <div class="dialog-content">${content}</div>
    <div class="dialog-actions">
      <button class="btn btn-text dialog-cancel-btn">${cancelText}</button>
      <button class="btn btn-filled dialog-confirm-btn">${confirmText}</button>
    </div>
  `;
  
  dialogOverlay.appendChild(dialogContainer);
  document.body.appendChild(dialogOverlay);
  
  // 显示对话框
  setTimeout(() => {
    dialogOverlay.classList.add('active');
  }, 10);

  // 点击遮罩层关闭对话框
  dialogOverlay.addEventListener('click', (e) => {
    if (e.target === dialogOverlay) {
      dialogOverlay.classList.remove('active');
      setTimeout(() => {
        if (document.body.contains(dialogOverlay)) {
          document.body.removeChild(dialogOverlay);
        }
      }, 300);
    }
  });
  
  // 取消按钮
  const cancelBtn = dialogContainer.querySelector('.dialog-cancel-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      dialogOverlay.classList.remove('active');
      setTimeout(() => {
        if (document.body.contains(dialogOverlay)) {
          document.body.removeChild(dialogOverlay);
        }
      }, 300);
    });
  } else {
    console.error('取消按钮未找到');
  }

  // 确认按钮
  const confirmBtn = dialogContainer.querySelector('.dialog-confirm-btn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      try {
        if (typeof onConfirm === 'function') {
          onConfirm();
        }
        dialogOverlay.classList.remove('active');
        setTimeout(() => {
          if (document.body.contains(dialogOverlay)) {
            document.body.removeChild(dialogOverlay);
          }
        }, 300);
      } catch (error) {
        console.error('确认操作执行失败:', error);
        // 即使出错也要关闭对话框
        dialogOverlay.classList.remove('active');
        setTimeout(() => {
          if (document.body.contains(dialogOverlay)) {
            document.body.removeChild(dialogOverlay);
          }
        }, 300);
      }
    });
  } else {
    console.error('确认按钮未找到');
  }
}

// 显示提示消息
function showSnackbar(message) {
  const snackbarContainer = document.createElement('div');
  snackbarContainer.className = 'snackbar';
  snackbarContainer.textContent = message;
  
  document.body.appendChild(snackbarContainer);
  
  // 显示提示
  setTimeout(() => {
    snackbarContainer.classList.add('active');
    
    // 自动隐藏
    setTimeout(() => {
      snackbarContainer.classList.remove('active');
      setTimeout(() => {
        document.body.removeChild(snackbarContainer);
      }, 300);
    }, 2000);
  }, 10);
} 