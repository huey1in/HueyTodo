class NotificationManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.notificationTimer = null;
    this.dailyReminderTimer = null;
    this.isInitialized = false;
    
    // 通知设置
    this.settings = {
      enabled: true,
      dailyReminderTime: '20:00', // 每天晚上8点
      overdueWarningDays: 1 // 提前1天提醒即将逾期
    };
    
    this.init();
  }

  /**
   * 初始化通知管理器
   */
  async init() {
    try {
      // 加载通知设置
      await this.loadSettings();
      
      // 请求通知权限
      await this.requestPermission();
      
      // 设置定时提醒
      this.setupDailyReminder();
      
      this.isInitialized = true;
      console.log('通知管理器初始化完成');
    } catch (error) {
      console.error('通知管理器初始化失败:', error);
    }
  }

  /**
   * 加载通知设置
   */
  async loadSettings() {
    try {
      const settings = await this.dataManager.getSettings();
      if (settings && settings.notifications) {
        this.settings = { ...this.settings, ...settings.notifications };
      }
    } catch (error) {
      console.error('加载通知设置失败:', error);
    }
  }

  /**
   * 保存通知设置
   */
  async saveSettings() {
    try {
      const currentSettings = await this.dataManager.getSettings();
      const updatedSettings = {
        ...currentSettings,
        notifications: this.settings
      };
      await this.dataManager.updateSettings(updatedSettings);
    } catch (error) {
      console.error('保存通知设置失败:', error);
    }
  }

  /**
   * 请求通知权限
   */
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('此浏览器不支持桌面通知');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  /**
   * 发送桌面通知
   */
  async sendNotification(title, body, options = {}) {
    if (!this.settings.enabled) {
      return;
    }

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.warn('没有通知权限');
      return;
    }

    const defaultOptions = {
      icon: './assets/icon-64.png',
      badge: './assets/icon-64.png',
      tag: 'huey-todo-notification',
      requireInteraction: false,
      silent: false,
      ...options
    };

    try {
      const notification = new Notification(title, {
        body,
        ...defaultOptions
      });

      // 点击通知时聚焦到应用窗口
      notification.onclick = () => {
        if (window.electronAPI) {
          window.electronAPI.focusWindow();
        }
        notification.close();
      };

      // 自动关闭通知
      setTimeout(() => {
        notification.close();
      }, 8000);

      return notification;
    } catch (error) {
      console.error('发送通知失败:', error);
    }
  }

  /**
   * 检查即将逾期的待办事项
   */
  async checkOverdueTodos() {
    try {
      const todos = await this.dataManager.getTodos();
      const now = new Date();
      const warningTime = new Date(now.getTime() + (this.settings.overdueWarningDays * 24 * 60 * 60 * 1000));
      
      const overdueTodos = [];
      const soonOverdueTodos = [];

      todos.forEach(todo => {
        // 只处理未完成的任务
        if (todo.completed) {
          return;
        }

        if (todo.dueDate) {
          const dueDate = new Date(todo.dueDate);

          if (dueDate < now) {
            overdueTodos.push(todo);
          } else if (dueDate <= warningTime && dueDate > now) {
            soonOverdueTodos.push(todo);
          }
        }
      });

      return { overdueTodos, soonOverdueTodos };
    } catch (error) {
      console.error('检查逾期待办事项失败:', error);
      return { overdueTodos: [], soonOverdueTodos: [] };
    }
  }

  /**
   * 发送每日提醒通知
   */
  async sendDailyReminder() {
    const { overdueTodos, soonOverdueTodos } = await this.checkOverdueTodos();
    
    if (overdueTodos.length === 0 && soonOverdueTodos.length === 0) {
      // 如果没有逾期或即将逾期的任务，发送鼓励消息
      await this.sendNotification(
        '✅ Huey Todo 每日提醒',
        '太棒了！您没有逾期的待办事项，继续保持！',
        { tag: 'daily-reminder-good' }
      );
      return;
    }

    let notificationBody = '';
    
    if (overdueTodos.length > 0) {
      notificationBody += `⚠️ ${overdueTodos.length} 个任务已逾期`;
    }
    
    if (soonOverdueTodos.length > 0) {
      if (notificationBody) notificationBody += '\n';
      notificationBody += `⏰ ${soonOverdueTodos.length} 个任务即将逾期`;
    }

    // 添加具体任务信息（最多显示3个）
    const allTodos = [...overdueTodos, ...soonOverdueTodos];
    if (allTodos.length > 0) {
      notificationBody += '\n\n';
      const displayTodos = allTodos.slice(0, 3);
      displayTodos.forEach(todo => {
        const dueDate = new Date(todo.dueDate);
        const isOverdue = dueDate < new Date();
        const dateStr = dueDate.toLocaleDateString();
        notificationBody += `${isOverdue ? '🔴' : '🟡'} ${todo.title} (${dateStr})\n`;
      });
      
      if (allTodos.length > 3) {
        notificationBody += `...还有 ${allTodos.length - 3} 个任务`;
      }
    }

    await this.sendNotification(
      '📋 Huey Todo 每日提醒',
      notificationBody,
      { 
        tag: 'daily-reminder',
        requireInteraction: true // 需要用户交互才关闭
      }
    );
  }

  /**
   * 设置每日提醒定时器
   */
  setupDailyReminder() {
    // 清除现有定时器
    if (this.dailyReminderTimer) {
      clearTimeout(this.dailyReminderTimer);
    }

    const scheduleNextReminder = () => {
      const now = new Date();
      const [hours, minutes] = this.settings.dailyReminderTime.split(':').map(Number);
      
      // 设置今天的提醒时间
      const reminderTime = new Date();
      reminderTime.setHours(hours, minutes, 0, 0);
      
      // 如果今天的提醒时间已过，设置为明天
      if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }
      
      const timeUntilReminder = reminderTime.getTime() - now.getTime();
      
      console.log(`下次提醒时间: ${reminderTime.toLocaleString()}`);
      
      this.dailyReminderTimer = setTimeout(async () => {
        await this.sendDailyReminder();
        // 设置下一次提醒
        scheduleNextReminder();
      }, timeUntilReminder);
    };

    if (this.settings.enabled) {
      scheduleNextReminder();
    }
  }

  /**
   * 更新通知设置
   */
  async updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();
    
    // 重新设置定时器
    this.setupDailyReminder();
  }

  /**
   * 手动触发检查（用于测试）
   */
  async triggerManualCheck() {
    await this.sendDailyReminder();
  }

  /**
   * 销毁通知管理器
   */
  destroy() {
    if (this.dailyReminderTimer) {
      clearTimeout(this.dailyReminderTimer);
      this.dailyReminderTimer = null;
    }
    
    if (this.notificationTimer) {
      clearTimeout(this.notificationTimer);
      this.notificationTimer = null;
    }
    
    this.isInitialized = false;
  }
}

// 导出通知管理器类
window.NotificationManager = NotificationManager;
