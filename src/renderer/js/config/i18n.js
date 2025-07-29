/**
 * 国际化管理器
 * 支持多语言切换和文本翻译
 */

class I18nManager {
  constructor() {
    this.currentLanguage = 'zh-CN'; // 默认中文
    this.translations = {};
    this.storageKey = 'huey_todo_language';
    
    // 初始化
    this.init();
  }

  async init() {
    // 加载保存的语言设置
    this.loadLanguagePreference();
    
    // 加载翻译文件
    await this.loadTranslations();
    
    // 应用翻译
    this.applyTranslations();
  }

  // 加载语言偏好设置
  loadLanguagePreference() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.currentLanguage = saved;
      } else {
        // 检测浏览器语言
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('en')) {
          this.currentLanguage = 'en-US';
        } else if (browserLang.startsWith('ja')) {
          this.currentLanguage = 'ja-JP';
        }
      }
    } catch (error) {
      console.warn('加载语言设置失败:', error);
    }
  }

  // 保存语言偏好设置
  saveLanguagePreference() {
    try {
      localStorage.setItem(this.storageKey, this.currentLanguage);
    } catch (error) {
      console.error('保存语言设置失败:', error);
    }
  }

  // 加载翻译文件
  async loadTranslations() {
    this.translations = {
      'zh-CN': {
        // 导航
        'nav.stats': '统计',
        'nav.today': '今日待办',
        'nav.todos': '待办',
        'nav.settings': '设置',
        
        // 用户信息
        'user.guest': '访客用户',
        'user.clickToView': '点击查看个人信息',
        
        // 统计页面
        'stats.title': '数据统计',
        'stats.pending': '待办',
        'stats.completed': '已完成',
        'stats.overdue': '逾期',
        'stats.total': '总计',
        'stats.completionRate': '完成率',
        'stats.productivity': '生产力',
        'stats.trend': '趋势',
        'stats.up': '上升',
        'stats.down': '下降',
        'stats.stable': '稳定',
        
        // 待办页面
        'todo.title': '待办事项',
        'todo.addNew': '新建待办',
        'todo.filter.all': '全部',
        'todo.filter.pending': '待办',
        'todo.filter.completed': '已完成',
        'today.filter.overdue': '逾期',
        'todo.priority.high': '高',
        'todo.priority.medium': '中',
        'todo.priority.low': '低',
        'todo.category.general': '常规',
        'todo.category.work': '工作',
        'todo.category.personal': '个人',
        'todo.category.life': '人生',
        'todo.category.yearly': '年度',
        'todo.category.monthly': '月度',
        'todo.category.study': '学习',
        'todo.category.health': '健康',
        'todo.category.daily': '日常',
        'todo.dueDate': '截止',
        'todo.dueDateNotSet': '未设置',
        'todo.childCount': '个子项',
        'todo.overdue1Day': '逾期1天',
        'todo.overdueDays': '逾期{days}天',
        'todo.weeksLeft': '{weeks}周后',
        'todo.weeksAndDaysLeft': '{weeks}周{days}天后',
        'todo.daysLeft': '{days}天后',
        'todo.tomorrow': '明天',
        'todo.hoursLeft': '{hours}小时后',
        'todo.minutesLeft': '{minutes}分钟后',
        'todo.soon': '即将到期',

        // 空状态
        'todo.empty.title': '还没有待办事项',
        'todo.empty.description': '创建您的第一个待办事项，开始高效管理您的任务和目标。',
        'todo.empty.addFirst': '创建第一个待办',

        // 搜索功能
        'search.placeholder': '搜索待办...',

        // 窗口控制
        'window.pin': '置顶窗口',
        'window.unpin': '取消置顶',

        // 问候语
        'greeting.morning': '早上好！',
        'greeting.noon': '中午好！',
        'greeting.afternoon': '下午好！',
        'greeting.evening': '晚上好！',
        'greeting.night': '夜深了！',

        // 一言
        'hitokoto.loading': '正在加载一言...',

        // 对话框
        'dialog.newTodo': '新建待办事项',
        'dialog.editTodo': '编辑待办事项',
        'dialog.addChild': '添加子项',
        'dialog.title': '标题',
        'dialog.description': '描述',
        'dialog.priority': '优先级',
        'dialog.category': '分类',
        'dialog.dueDate': '截止日期',
        'dialog.cancel': '取消',
        'dialog.save': '保存',
        'dialog.confirmDelete': '确认删除',
        'dialog.deleteMessage': '确定要删除这个待办事项吗？此操作无法撤销。',
        'dialog.deleteWithChildren': '这个待办事项包含 {count} 个子项。删除后，所有子项也将被删除。\n\n确定要删除吗？此操作无法撤销。',
        'dialog.delete': '删除',
        'dialog.deleteAll': '删除全部',
        
        // 设置页面
        'settings.title': '设置',
        'settings.theme': '主题设置',
        'settings.themeColor': '主题色',
        'settings.language': '语言设置',
        'settings.selectLanguage': '选择语言',
        'settings.startup': '启动设置',
        'settings.startupView': '启动页面',
        'settings.todoSync': '待办同步',
        'settings.autoParentSync': '自动父项同步',
        'settings.autoParentSyncDesc': '当所有子项完成时自动完成父项，当任何子项取消完成时自动取消父项完成',
        'settings.notifications': '通知设置',
        'settings.enableNotifications': '启用桌面通知',
        'settings.enableNotificationsDesc': '允许应用发送桌面通知提醒',
        'settings.dailyReminderTime': '每日提醒时间',
        'settings.overdueWarningDays': '逾期提醒提前天数',
        'settings.testNotification': '测试通知',
        'settings.reset': '重置设置',
        'settings.save': '保存设置',
        'settings.resetConfirm': '确定要重置所有设置吗？',
        
        // 个人信息页面
        'profile.title': '个人信息',
        'profile.developing': '功能正在开发中',
        'profile.description': '个人信息管理功能正在开发中，我们计划使用后端数据库来实现用户账户系统，包括：',
        'profile.features.register': '用户注册与登录',
        'profile.features.profile': '个人资料管理',
        'profile.features.avatar': '头像上传',
        'profile.features.password': '密码修改',
        'profile.features.sync': '数据同步',
        'profile.footer': '敬请期待！目前您可以正常使用待办事项功能，所有数据都会安全保存在本地。',
        
        // 消息提示
        'message.todoAdded': '待办事项已创建',
        'message.todoUpdated': '待办事项已更新',
        'message.childAdded': '子项已创建',
        'message.todoDeleted': '待办事项已删除',
        'message.todosDeleted': '已删除 {count} 个待办事项',
        'message.updatingChildren': '正在更新子项状态...',
        'message.parentAutoCompleted': '父项已自动完成',
        'message.parentAutoUncompleted': '父项已自动取消完成',
        'message.autoParentSyncEnabled': '父项自动同步已启用',
        'message.autoParentSyncDisabled': '父项自动同步已禁用',
        'message.notificationsEnabled': '桌面通知已启用',
        'message.notificationsDisabled': '桌面通知已禁用',
        'message.reminderTimeUpdated': '提醒时间已更新为 {time}',
        'message.overdueWarningSameDay': '将在任务逾期当天提醒',
        'message.overdueWarningDaysUpdated': '将在任务逾期前 {days} 天提醒',
        'message.testNotificationSent': '测试通知已发送',
        'message.notificationManagerNotReady': '通知管理器未就绪',
        'message.deletingItems': '正在删除 {count} 个项目...',
        'message.editDeveloping': '编辑功能正在开发中',
        'message.languageChanged': '语言已切换',
        'message.settingsSaved': '设置已保存',
        'message.settingsSaveFailed': '保存设置失败',
        'message.settingsReset': '设置已重置',
        'message.enterTitle': '请输入待办标题或允许自动填充',
        'message.todoCreateFailed': '创建待办事项失败',
        'message.updateFailed': '更新待办事项失败',
        'message.titleRequired': '请输入待办标题',
        'message.enterChildTitle': '请输入子项标题',
        'message.parentInfoLost': '父级信息丢失',
        'message.childCreateFailed': '创建子项失败',
        'message.updateStatusFailed': '更新待办事项状态失败',
        'message.deleteFailed': '删除待办事项失败',
        'message.pastDateNotAllowed': '不能选择过去的日期，请选择今天或未来的日期',
        'message.invalidDateFormat': '日期格式无效，请重新选择',

        // 日期选择器
        'datePicker.today': '今天',
        'datePicker.clear': '清除',
        'datePicker.cancel': '取消',
        'datePicker.confirm': '确定',
        'datePicker.selectDate': '选择日期',
        'datePicker.year': '年',
        'datePicker.month': '月',
        'datePicker.day': '日',
        'datePicker.yearSuffix': '年',
        'datePicker.monthSuffix': '月',
        'datePicker.daySuffix': '日',

        // 按钮提示
        'tooltip.delete': '删除',
        'tooltip.edit': '编辑',
        'tooltip.addChild': '添加子项',
        'tooltip.expand': '展开',
        'tooltip.collapse': '收起',
        'tooltip.toggle': '收起/展开',
        'tooltip.markComplete': '标记为已完成',
        'tooltip.markIncomplete': '标记为未完成',

        // 今日待办
        'today.title': '今日待办',
        'today.empty.title': '暂无待办事项',
        'today.empty.description': '您已经完成了所有待办事项，或者还没有创建任何待办事项。',
        
        // 语言名称
        'language.zh-CN': '简体中文',
        'language.en-US': 'English',
        'language.ja-JP': '日本語'
      },
      
      'en-US': {
        // Navigation
        'nav.stats': 'Stats',
        'nav.today': 'Today',
        'nav.todos': 'Todos',
        'nav.settings': 'Settings',
        
        // User info
        'user.guest': 'Guest User',
        'user.clickToView': 'Click to view profile',
        
        // Stats page
        'stats.title': 'Statistics',
        'stats.pending': 'Pending',
        'stats.completed': 'Completed',
        'stats.overdue': 'Overdue',
        'stats.total': 'Total',
        'stats.completionRate': 'Completion Rate',
        'stats.productivity': 'Productivity',
        'stats.trend': 'Trend',
        'stats.up': 'Up',
        'stats.down': 'Down',
        'stats.stable': 'Stable',
        
        // Todo page
        'todo.title': 'Todo List',
        'todo.addNew': 'Add Todo',
        'todo.filter.all': 'All',
        'todo.filter.pending': 'Pending',
        'todo.filter.completed': 'Completed',
        'today.filter.overdue': 'Overdue',
        'todo.priority.high': 'High',
        'todo.priority.medium': 'Medium',
        'todo.priority.low': 'Low',
        'todo.category.general': 'General',
        'todo.category.work': 'Work',
        'todo.category.personal': 'Personal',
        'todo.category.life': 'Life',
        'todo.category.yearly': 'Yearly',
        'todo.category.monthly': 'Monthly',
        'todo.category.study': 'Study',
        'todo.category.health': 'Health',
        'todo.category.daily': 'Daily',
        'todo.dueDate': 'Due',
        'todo.dueDateNotSet': 'Not set',
        'todo.childCount': 'subtasks',
        'todo.overdue1Day': '1 day overdue',
        'todo.overdueDays': '{days} days overdue',
        'todo.weeksLeft': 'in {weeks} weeks',
        'todo.weeksAndDaysLeft': 'in {weeks}w {days}d',
        'todo.daysLeft': 'in {days} days',
        'todo.tomorrow': 'tomorrow',
        'todo.hoursLeft': 'in {hours} hours',
        'todo.minutesLeft': 'in {minutes} minutes',
        'todo.soon': 'due soon',

        // Empty state
        'todo.empty.title': 'No todos yet',
        'todo.empty.description': 'Create your first todo to start managing your tasks and goals efficiently.',
        'todo.empty.addFirst': 'Create first todo',

        // Search functionality
        'search.placeholder': 'Search todos...',

        // Window control
        'window.pin': 'Pin window',
        'window.unpin': 'Unpin window',

        // Greetings
        'greeting.morning': 'Good morning!',
        'greeting.noon': 'Good noon!',
        'greeting.afternoon': 'Good afternoon!',
        'greeting.evening': 'Good evening!',
        'greeting.night': 'Good night!',

        // Hitokoto
        'hitokoto.loading': 'Loading quote...',

        // Dialogs
        'dialog.newTodo': 'New Todo',
        'dialog.editTodo': 'Edit Todo',
        'dialog.addChild': 'Add Subtask',
        'dialog.title': 'Title',
        'dialog.description': 'Description',
        'dialog.priority': 'Priority',
        'dialog.category': 'Category',
        'dialog.dueDate': 'Due Date',
        'dialog.cancel': 'Cancel',
        'dialog.save': 'Save',
        'dialog.confirmDelete': 'Confirm Delete',
        'dialog.deleteMessage': 'Are you sure you want to delete this todo? This action cannot be undone.',
        'dialog.deleteWithChildren': 'This todo contains {count} subtasks. All subtasks will also be deleted.\n\nAre you sure you want to delete? This action cannot be undone.',
        'dialog.delete': 'Delete',
        'dialog.deleteAll': 'Delete All',
        
        // Settings page
        'settings.title': 'Settings',
        'settings.theme': 'Theme Settings',
        'settings.themeColor': 'Theme Color',
        'settings.language': 'Language Settings',
        'settings.selectLanguage': 'Select Language',
        'settings.startup': 'Startup Settings',
        'settings.startupView': 'Startup Page',
        'settings.todoSync': 'Todo Sync',
        'settings.autoParentSync': 'Auto Parent Sync',
        'settings.autoParentSyncDesc': 'Automatically complete parent when all children are completed, and uncomplete parent when any child is uncompleted',
        'settings.notifications': 'Notification Settings',
        'settings.enableNotifications': 'Enable Desktop Notifications',
        'settings.enableNotificationsDesc': 'Allow the app to send desktop notification reminders',
        'settings.dailyReminderTime': 'Daily Reminder Time',
        'settings.overdueWarningDays': 'Overdue Warning Days',
        'settings.testNotification': 'Test Notification',
        'settings.reset': 'Reset Settings',
        'settings.save': 'Save Settings',
        'settings.resetConfirm': 'Are you sure you want to reset all settings?',
        
        // Profile page
        'profile.title': 'Profile',
        'profile.developing': 'Feature Under Development',
        'profile.description': 'Profile management features are under development. We plan to implement a user account system with backend database, including:',
        'profile.features.register': 'User registration and login',
        'profile.features.profile': 'Profile management',
        'profile.features.avatar': 'Avatar upload',
        'profile.features.password': 'Password change',
        'profile.features.sync': 'Data synchronization',
        'profile.footer': 'Stay tuned! You can currently use the todo features normally, and all data will be safely stored locally.',
        
        // Messages
        'message.todoAdded': 'Todo created',
        'message.todoUpdated': 'Todo updated',
        'message.childAdded': 'Subtask created',
        'message.todoDeleted': 'Todo deleted',
        'message.todosDeleted': 'Deleted {count} todos',
        'message.updatingChildren': 'Updating subtask status...',
        'message.parentAutoCompleted': 'Parent automatically completed',
        'message.parentAutoUncompleted': 'Parent automatically uncompleted',
        'message.autoParentSyncEnabled': 'Auto parent sync enabled',
        'message.autoParentSyncDisabled': 'Auto parent sync disabled',
        'message.notificationsEnabled': 'Desktop notifications enabled',
        'message.notificationsDisabled': 'Desktop notifications disabled',
        'message.reminderTimeUpdated': 'Reminder time updated to {time}',
        'message.overdueWarningSameDay': 'Will remind on the day tasks are overdue',
        'message.overdueWarningDaysUpdated': 'Will remind {days} days before tasks are overdue',
        'message.testNotificationSent': 'Test notification sent',
        'message.notificationManagerNotReady': 'Notification manager not ready',
        'message.deletingItems': 'Deleting {count} items...',
        'message.editDeveloping': 'Edit feature under development',
        'message.languageChanged': 'Language changed',
        'message.settingsSaved': 'Settings saved',
        'message.settingsSaveFailed': 'Failed to save settings',
        'message.settingsReset': 'Settings reset',
        'message.enterTitle': 'Please enter todo title or allow auto-fill',
        'message.todoCreateFailed': 'Failed to create todo',
        'message.updateFailed': 'Failed to update todo',
        'message.titleRequired': 'Please enter todo title',
        'message.enterChildTitle': 'Please enter subtask title',
        'message.parentInfoLost': 'Parent information lost',
        'message.childCreateFailed': 'Failed to create subtask',
        'message.updateStatusFailed': 'Failed to update todo status',
        'message.deleteFailed': 'Failed to delete todo',
        'message.pastDateNotAllowed': 'Cannot select past dates, please choose today or a future date',
        'message.invalidDateFormat': 'Invalid date format, please select again',

        // Date picker
        'datePicker.today': 'Today',
        'datePicker.clear': 'Clear',
        'datePicker.cancel': 'Cancel',
        'datePicker.confirm': 'OK',
        'datePicker.selectDate': 'Select Date',
        'datePicker.year': 'Year',
        'datePicker.month': 'Month',
        'datePicker.day': 'Day',
        'datePicker.yearSuffix': '',
        'datePicker.monthSuffix': '',
        'datePicker.daySuffix': '',

        // Button tooltips
        'tooltip.delete': 'Delete',
        'tooltip.edit': 'Edit',
        'tooltip.addChild': 'Add Subtask',
        'tooltip.expand': 'Expand',
        'tooltip.collapse': 'Collapse',
        'tooltip.toggle': 'Toggle Sidebar',
        'tooltip.markComplete': 'Mark as Complete',
        'tooltip.markIncomplete': 'Mark as Incomplete',

        // Today's Todos
        'today.title': 'Today\'s Todos',
        'today.empty.title': 'No pending todos',
        'today.empty.description': 'You have completed all your todos or haven\'t created any yet.',
        
        // Language names
        'language.zh-CN': '简体中文',
        'language.en-US': 'English',
        'language.ja-JP': '日本語'
      },
      
      'ja-JP': {
        // ナビゲーション
        'nav.stats': '統計',
        'nav.today': '今日のタスク',
        'nav.todos': 'タスク',
        'nav.settings': '設定',
        
        // ユーザー情報
        'user.guest': 'ゲストユーザー',
        'user.clickToView': 'プロフィールを表示',
        
        // 統計ページ
        'stats.title': '統計',
        'stats.pending': '未完了',
        'stats.completed': '完了',
        'stats.overdue': '期限切れ',
        'stats.total': '合計',
        'stats.completionRate': '完了率',
        'stats.productivity': '生産性',
        'stats.trend': 'トレンド',
        'stats.up': '上昇',
        'stats.down': '下降',
        'stats.stable': '安定',
        
        // タスクページ
        'todo.title': 'タスクリスト',
        'todo.addNew': 'タスク追加',
        'todo.filter.all': 'すべて',
        'todo.filter.pending': '未完了',
        'todo.filter.completed': '完了',
        'today.filter.overdue': '期限切れ',
        'todo.priority.high': '高',
        'todo.priority.medium': '中',
        'todo.priority.low': '低',
        'todo.category.general': '一般',
        'todo.category.work': '仕事',
        'todo.category.personal': '個人',
        'todo.category.life': '人生',
        'todo.category.yearly': '年間',
        'todo.category.monthly': '月間',
        'todo.category.study': '学習',
        'todo.category.health': '健康',
        'todo.category.daily': '日常',
        'todo.dueDate': '期限',
        'todo.dueDateNotSet': '未設定',
        'todo.childCount': 'サブタスク',
        'todo.overdue1Day': '1日遅れ',
        'todo.overdueDays': '{days}日遅れ',
        'todo.weeksLeft': '{weeks}週間後',
        'todo.weeksAndDaysLeft': '{weeks}週{days}日後',
        'todo.daysLeft': '{days}日後',
        'todo.tomorrow': '明日',
        'todo.hoursLeft': '{hours}時間後',
        'todo.minutesLeft': '{minutes}分後',
        'todo.soon': 'まもなく期限',

        // 空の状態
        'todo.empty.title': 'まだタスクがありません',
        'todo.empty.description': '最初のタスクを作成して、効率的にタスクと目標を管理しましょう。',
        'todo.empty.addFirst': '最初のタスクを作成',

        // 検索機能
        'search.placeholder': 'タスクを検索...',

        // ウィンドウ制御
        'window.pin': 'ウィンドウを固定',
        'window.unpin': '固定を解除',

        // 挨拶
        'greeting.morning': 'おはようございます！',
        'greeting.noon': 'こんにちは！',
        'greeting.afternoon': 'こんにちは！',
        'greeting.evening': 'こんばんは！',
        'greeting.night': 'お疲れ様でした！',

        // 一言
        'hitokoto.loading': '名言を読み込み中...',

        // ダイアログ
        'dialog.newTodo': '新しいタスク',
        'dialog.editTodo': 'タスク編集',
        'dialog.addChild': 'サブタスク追加',
        'dialog.title': 'タイトル',
        'dialog.description': '説明',
        'dialog.priority': '優先度',
        'dialog.category': 'カテゴリ',
        'dialog.dueDate': '期限',
        'dialog.cancel': 'キャンセル',
        'dialog.save': '保存',
        'dialog.confirmDelete': '削除確認',
        'dialog.deleteMessage': 'このタスクを削除してもよろしいですか？この操作は元に戻せません。',
        'dialog.deleteWithChildren': 'このタスクには{count}個のサブタスクが含まれています。すべてのサブタスクも削除されます。\n\n削除してもよろしいですか？この操作は元に戻せません。',
        'dialog.delete': '削除',
        'dialog.deleteAll': 'すべて削除',
        
        // 設定ページ
        'settings.title': '設定',
        'settings.theme': 'テーマ設定',
        'settings.themeColor': 'テーマカラー',
        'settings.language': '言語設定',
        'settings.selectLanguage': '言語を選択',
        'settings.startup': 'スタートアップ設定',
        'settings.startupView': 'スタートアップページ',
        'settings.todoSync': 'タスク同期',
        'settings.autoParentSync': '親項目自動同期',
        'settings.autoParentSyncDesc': 'すべての子項目が完了したときに親項目を自動完了し、子項目が未完了になったときに親項目を自動未完了にします',
        'settings.notifications': '通知設定',
        'settings.enableNotifications': 'デスクトップ通知を有効にする',
        'settings.enableNotificationsDesc': 'アプリがデスクトップ通知リマインダーを送信することを許可します',
        'settings.dailyReminderTime': '毎日のリマインダー時間',
        'settings.overdueWarningDays': '期限切れ警告日数',
        'settings.testNotification': 'テスト通知',
        'settings.reset': '設定をリセット',
        'settings.save': '設定を保存',
        'settings.resetConfirm': 'すべての設定をリセットしてもよろしいですか？',
        
        // プロフィールページ
        'profile.title': 'プロフィール',
        'profile.developing': '機能開発中',
        'profile.description': 'プロフィール管理機能は開発中です。バックエンドデータベースを使用したユーザーアカウントシステムの実装を計画しており、以下の機能を含みます：',
        'profile.features.register': 'ユーザー登録とログイン',
        'profile.features.profile': 'プロフィール管理',
        'profile.features.avatar': 'アバターアップロード',
        'profile.features.password': 'パスワード変更',
        'profile.features.sync': 'データ同期',
        'profile.footer': 'お楽しみに！現在はタスク機能を正常にご利用いただけ、すべてのデータはローカルに安全に保存されます。',
        
        // メッセージ
        'message.todoAdded': 'タスクを作成しました',
        'message.todoUpdated': 'タスクを更新しました',
        'message.childAdded': 'サブタスクを作成しました',
        'message.todoDeleted': 'タスクを削除しました',
        'message.todosDeleted': '{count}個のタスクを削除しました',
        'message.updatingChildren': 'サブタスクの状態を更新中...',
        'message.parentAutoCompleted': '親項目が自動完了しました',
        'message.parentAutoUncompleted': '親項目が自動未完了になりました',
        'message.autoParentSyncEnabled': '親項目自動同期が有効になりました',
        'message.autoParentSyncDisabled': '親項目自動同期が無効になりました',
        'message.notificationsEnabled': 'デスクトップ通知が有効になりました',
        'message.notificationsDisabled': 'デスクトップ通知が無効になりました',
        'message.reminderTimeUpdated': 'リマインダー時間を{time}に更新しました',
        'message.overdueWarningSameDay': 'タスクが期限切れになった日に通知します',
        'message.overdueWarningDaysUpdated': 'タスクが期限切れになる{days}日前に通知します',
        'message.testNotificationSent': 'テスト通知を送信しました',
        'message.notificationManagerNotReady': '通知マネージャーの準備ができていません',
        'message.deletingItems': '{count}個のアイテムを削除中...',
        'message.editDeveloping': '編集機能は開発中です',
        'message.languageChanged': '言語を変更しました',
        'message.settingsSaved': '設定を保存しました',
        'message.settingsSaveFailed': '設定の保存に失敗しました',
        'message.settingsReset': '設定をリセットしました',
        'message.enterTitle': 'タスクのタイトルを入力するか、自動入力を許可してください',
        'message.todoCreateFailed': 'タスクの作成に失敗しました',
        'message.updateFailed': 'タスクの更新に失敗しました',
        'message.titleRequired': 'タスクのタイトルを入力してください',
        'message.enterChildTitle': 'サブタスクのタイトルを入力してください',
        'message.parentInfoLost': '親の情報が失われました',
        'message.childCreateFailed': 'サブタスクの作成に失敗しました',
        'message.updateStatusFailed': 'タスクの状態更新に失敗しました',
        'message.deleteFailed': 'タスクの削除に失敗しました',
        'message.pastDateNotAllowed': '過去の日付は選択できません。今日または未来の日付を選択してください',
        'message.invalidDateFormat': '日付形式が無効です。再度選択してください',

        // 日付選択
        'datePicker.today': '今日',
        'datePicker.clear': 'クリア',
        'datePicker.cancel': 'キャンセル',
        'datePicker.confirm': 'OK',
        'datePicker.selectDate': '日付を選択',
        'datePicker.year': '年',
        'datePicker.month': '月',
        'datePicker.day': '日',
        'datePicker.yearSuffix': '年',
        'datePicker.monthSuffix': '月',
        'datePicker.daySuffix': '日',

        // ボタンツールチップ
        'tooltip.delete': '削除',
        'tooltip.edit': '編集',
        'tooltip.addChild': 'サブタスク追加',
        'tooltip.expand': '展開',
        'tooltip.collapse': '折りたたみ',
        'tooltip.toggle': 'サイドバー切替',
        'tooltip.markComplete': '完了にする',
        'tooltip.markIncomplete': '未完了にする',

        // 今日のタスク
        'today.title': '今日のタスク',
        'today.empty.title': '未完了のタスクはありません',
        'today.empty.description': 'すべてのタスクが完了しているか、まだタスクが作成されていません。',
        
        // 言語名
        'language.zh-CN': '简体中文',
        'language.en-US': 'English',
        'language.ja-JP': '日本語'
      }
    };
  }

  // 获取翻译文本
  t(key, params = {}) {
    const translation = this.translations[this.currentLanguage]?.[key] || 
                       this.translations['zh-CN']?.[key] || 
                       key;
    
    // 替换参数
    return translation.replace(/\{(\w+)\}/g, (match, param) => {
      return params[param] !== undefined ? params[param] : match;
    });
  }

  // 切换语言
  async changeLanguage(language) {
    if (this.translations[language]) {
      this.currentLanguage = language;
      this.saveLanguagePreference();
      this.applyTranslations();
      return true;
    }
    return false;
  }

  // 应用翻译到页面
  applyTranslations() {
    // 查找所有带有 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);

      // 根据元素类型设置文本
      if (element.tagName === 'INPUT' && element.type === 'text') {
        element.placeholder = translation;
      } else if (element.tagName === 'INPUT' && element.type === 'button') {
        element.value = translation;
      } else {
        element.textContent = translation;
      }
    });

    // 查找所有带有 data-i18n-label 属性的元素（用于表单字段的label）
    document.querySelectorAll('[data-i18n-label]').forEach(element => {
      const key = element.getAttribute('data-i18n-label');
      const translation = this.t(key);

      // 设置label属性
      element.setAttribute('label', translation);
    });

    // 查找所有带有 data-i18n-alt 属性的元素（用于图片的alt属性）
    document.querySelectorAll('[data-i18n-alt]').forEach(element => {
      const key = element.getAttribute('data-i18n-alt');
      const translation = this.t(key);

      // 设置alt属性
      element.setAttribute('alt', translation);
    });

    // 配置Sober UI日期选择器的国际化
    this.configureSoberDatePicker();

    // 更新页面标题
    document.title = this.t('nav.todos') + ' - Huey Todo';
  }

  // 配置Sober UI日期选择器的国际化
  configureSoberDatePicker() {
    // 尝试配置Sober UI的国际化
    try {
      // 检查是否有全局的Sober配置
      if (typeof window.sober !== 'undefined') {
        if (window.sober.setLocale) {
          const locale = {
            today: this.t('datePicker.today'),
            clear: this.t('datePicker.clear'),
            cancel: this.t('datePicker.cancel'),
            confirm: this.t('datePicker.confirm'),
            selectDate: this.t('datePicker.selectDate'),
            year: this.t('datePicker.year'),
            month: this.t('datePicker.month'),
            day: this.t('datePicker.day'),
            months: this.getMonthNames(),
            weekdays: this.getWeekdayNames()
          };

          window.sober.setLocale(this.currentLanguage, locale);
        }
      }

      // 为所有日期选择器设置locale属性
      document.querySelectorAll('s-date-picker').forEach(picker => {
        picker.setAttribute('locale', this.currentLanguage);
        // 如果日期选择器有refresh方法，调用它来更新显示
        if (typeof picker.refresh === 'function') {
          picker.refresh();
        }
      });

    } catch (error) {
      console.log('Sober UI日期选择器国际化配置失败:', error);
    }
  }

  // 获取月份名称
  getMonthNames() {
    if (this.currentLanguage === 'en-US') {
      return ['January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'];
    } else if (this.currentLanguage === 'ja-JP') {
      return ['1月', '2月', '3月', '4月', '5月', '6月',
              '7月', '8月', '9月', '10月', '11月', '12月'];
    } else {
      return ['1月', '2月', '3月', '4月', '5月', '6月',
              '7月', '8月', '9月', '10月', '11月', '12月'];
    }
  }

  // 获取星期名称
  getWeekdayNames() {
    if (this.currentLanguage === 'en-US') {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    } else if (this.currentLanguage === 'ja-JP') {
      return ['日', '月', '火', '水', '木', '金', '土'];
    } else {
      return ['日', '一', '二', '三', '四', '五', '六'];
    }
  }

  // 获取当前语言
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  // 获取支持的语言列表
  getSupportedLanguages() {
    return [
      { code: 'zh-CN', name: this.t('language.zh-CN') },
      { code: 'en-US', name: this.t('language.en-US') },
      { code: 'ja-JP', name: this.t('language.ja-JP') }
    ];
  }
}

// 创建全局实例
window.i18n = new I18nManager();
