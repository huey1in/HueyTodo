// 初始化通知管理器
async function initNotificationManager() {
  try {
    // 确保NotificationManager类已加载
    if (typeof NotificationManager === 'undefined') {
      console.error('NotificationManager类未找到，请确保notification.js已正确加载');
      return;
    }

    // 等待dataManager初始化完成
    if (typeof dataManager === 'undefined') {
      console.error('dataManager未找到，无法初始化通知管理器');
      return;
    }

    await dataManager.waitForInit();

    // 创建通知管理器实例
    notificationManager = new NotificationManager(dataManager);

    console.log('通知管理器初始化完成');

    // 添加测试按钮（开发模式）
    if (window.location.protocol === 'file:' || window.location.hostname === 'localhost') {
      addNotificationTestButton();
    }
  } catch (error) {
    console.error('初始化通知管理器失败:', error);
  }
}

// 添加通知测试按钮（仅开发模式）
function addNotificationTestButton() {
  // 检查是否已存在测试按钮
  if (document.getElementById('test-notification-btn')) {
    return;
  }

  const testBtn = document.createElement('button');
  testBtn.id = 'test-notification-btn';
  testBtn.textContent = '测试通知';
  testBtn.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 10000;
    padding: 8px 12px;
    background: #0078d4;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  `;

  testBtn.addEventListener('click', async () => {
    if (notificationManager) {
      await notificationManager.triggerManualCheck();
      showSnackbar('已触发通知检查');
    } else {
      showSnackbar('通知管理器未初始化');
    }
  });

  document.body.appendChild(testBtn);
}

// 初始化通知设置
function initNotificationSettings() {
  // 启用通知开关
  const enableNotificationsSwitch = document.getElementById('enable-notifications');
  if (enableNotificationsSwitch) {
    enableNotificationsSwitch.addEventListener('change', async () => {
      const isEnabled = enableNotificationsSwitch.checked;

      if (notificationManager) {
        await notificationManager.updateSettings({ enabled: isEnabled });

        const message = isEnabled
          ? (window.i18n ? window.i18n.t('message.notificationsEnabled') : '桌面通知已启用')
          : (window.i18n ? window.i18n.t('message.notificationsDisabled') : '桌面通知已禁用');
        showSnackbar(message);

        // 如果启用通知，请求权限
        if (isEnabled) {
          await notificationManager.requestPermission();
        }
      }
    });
  }

  // 每日提醒时间
  const dailyReminderTimeInput = document.getElementById('daily-reminder-time');
  if (dailyReminderTimeInput) {
    dailyReminderTimeInput.addEventListener('change', async () => {
      const time = dailyReminderTimeInput.value;

      if (notificationManager) {
        await notificationManager.updateSettings({ dailyReminderTime: time });
        showSnackbar(window.i18n ? window.i18n.t('message.reminderTimeUpdated') : `提醒时间已更新为 ${time}`);
      }
    });
  }

  // 逾期提醒提前天数
  const overdueWarningDaysPicker = document.getElementById('overdue-warning-days');
  if (overdueWarningDaysPicker) {
    overdueWarningDaysPicker.addEventListener('change', async () => {
      const days = parseInt(overdueWarningDaysPicker.value);

      if (notificationManager) {
        await notificationManager.updateSettings({ overdueWarningDays: days });
        const message = days === 0
          ? (window.i18n ? window.i18n.t('message.overdueWarningSameDay') : '将在任务逾期当天提醒')
          : (window.i18n ? window.i18n.t('message.overdueWarningDaysUpdated', {days}) : `将在任务逾期前 ${days} 天提醒`);
        showSnackbar(message);
      }
    });
  }



  // 测试通知按钮
  const testNotificationBtn = document.getElementById('test-notification-btn');
  if (testNotificationBtn) {
    testNotificationBtn.addEventListener('click', async () => {
      if (notificationManager) {
        await notificationManager.triggerManualCheck();
        showSnackbar(window.i18n ? window.i18n.t('message.testNotificationSent') : '测试通知已发送');
      } else {
        showSnackbar(window.i18n ? window.i18n.t('message.notificationManagerNotReady') : '通知管理器未就绪');
      }
    });
  }
}