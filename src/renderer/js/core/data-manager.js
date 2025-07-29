class DataManager {
  constructor() {
    this.storageKeys = {
      todos: 'huey_todo_todos',
      settings: 'huey_todo_settings',
      stats: 'huey_todo_stats'
    };

    // 初始化标志
    this.initialized = false;

    // 异步初始化
    this.init();
  }

  /**
   * 异步初始化
   */
  async init() {
    try {
      // 测试localStorage可用性
      this.testLocalStorage();

      // 初始化默认数据
      await this.initializeDefaultData();

      this.initialized = true;
      console.log('DataManager 初始化完成 - 使用localStorage');
    } catch (error) {
      console.error('数据管理器初始化失败:', error);
    }
  }

  /**
   * 等待初始化完成
   */
  async waitForInit() {
    while (!this.initialized) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  /**
   * 测试localStorage可用性
   */
  testLocalStorage() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        throw new Error('localStorage不可用');
      }

      // 测试读写
      const testKey = 'huey_todo_test';
      localStorage.setItem(testKey, 'test');
      const testValue = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      if (testValue !== 'test') {
        throw new Error('localStorage读写测试失败');
      }

      // 清理旧的用户数据（如果存在）
      this.cleanupUserData();

      console.log('localStorage可用，数据将持久化存储');
    } catch (error) {
      console.error('localStorage不可用:', error);
      throw error;
    }
  }

  /**
   * 清理localStorage中的用户数据
   */
  cleanupUserData() {
    try {
      // 移除旧的用户数据
      const userDataKey = 'huey_todo_users.json';
      if (localStorage.getItem(userDataKey)) {
        localStorage.removeItem(userDataKey);
        console.log('已清理旧的用户数据');
      }
    } catch (error) {
      console.warn('清理用户数据失败:', error);
    }
  }

  /**
   * 从localStorage读取数据
   */
  async readData(key) {
    try {
      const storageKey = this.storageKeys[key];
      if (!storageKey) {
        throw new Error(`未知的数据键: ${key}`);
      }

      const data = localStorage.getItem(storageKey);
      const result = data ? JSON.parse(data) : null;
      console.log(`从localStorage读取数据: ${storageKey}`, result ? `有数据` : '无数据');
      return result;
    } catch (error) {
      if (error.name === 'SyntaxError') {
        console.warn(`localStorage数据格式错误: ${key}`, error);
        return null;
      }
      throw error;
    }
  }

  /**
   * 向localStorage写入数据
   */
  async writeData(key, data) {
    try {
      const storageKey = this.storageKeys[key];
      if (!storageKey) {
        throw new Error(`未知的数据键: ${key}`);
      }

      const jsonData = JSON.stringify(data, null, 2);
      localStorage.setItem(storageKey, jsonData);
      console.log(`数据已保存到localStorage: ${storageKey}`, data);
    } catch (error) {
      console.error(`写入localStorage失败: ${key}`, error);
      throw error;
    }
  }

  /**
   * 初始化默认数据
   */
  async initializeDefaultData() {
    // 初始化待办事项数据
    const todos = await this.readData('todos');
    if (!todos) {
      await this.writeData('todos', {
        items: [],
        lastId: 0
      });
    }

    // 初始化设置数据
    const settings = await this.readData('settings');
    if (!settings) {
      await this.writeData('settings', {
        theme: {
          color: '#0078d4',
          mode: 'light'
        },
        startup: {
          view: 'stats-view'
        },
        features: {
          notifications: true
        }
      });
    }

    // 初始化统计数据
    const stats = await this.readData('stats');
    if (!stats) {
      await this.writeData('stats', {
        lastUpdated: new Date().toISOString(),
        totals: {
          pending: 0,
          completed: 0,
          overdue: 0
        }
      });
    }
  }

  /**
   * 获取所有待办事项
   */
  async getTodos() {
    await this.waitForInit();
    const data = await this.readData('todos');
    return data ? data.items : [];
  }

  /**
   * 添加待办事项
   */
  async addTodo(todo) {
    await this.waitForInit();
    const data = await this.readData('todos') || { items: [], lastId: 0 };
    
    const newTodo = {
      id: (data.lastId + 1).toString(),
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority || 'medium',
      dueDate: todo.dueDate || null,
      completed: false,

      // 层级结构字段
      type: todo.type || 'task', // 'project', 'task', 'subtask'
      parentId: todo.parentId || null, // 父级待办事项ID
      level: todo.level || 0, // 层级深度 0=项目, 1=任务, 2=子任务
      children: [], // 子项目/任务列表

      // 分类字段
      category: todo.category || 'general', // 'life', 'yearly', 'monthly', 'daily', 'work', 'personal', 'general'
      tags: todo.tags || [], // 标签数组

      // 进度和状态
      progress: todo.progress || 0, // 0-100的进度百分比
      status: todo.status || 'pending', // 'pending', 'in-progress', 'completed', 'cancelled'

      // 时间字段
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      startDate: todo.startDate || null,
      estimatedHours: todo.estimatedHours || null
    };

    data.items.push(newTodo);
    data.lastId += 1;

    await this.writeData('todos', data);
    await this.updateStats();
    
    return newTodo;
  }

  /**
   * 更新待办事项
   */
  async updateTodo(id, updates) {
    await this.waitForInit();
    const data = await this.readData('todos');
    if (!data) return null;

    const todoIndex = data.items.findIndex(item => item.id === id);
    if (todoIndex === -1) return null;

    data.items[todoIndex] = {
      ...data.items[todoIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await this.writeData('todos', data);
    await this.updateStats();
    
    return data.items[todoIndex];
  }

  /**
   * 删除待办事项（支持级联删除子项）
   */
  async deleteTodo(id) {
    await this.waitForInit();
    const data = await this.readData('todos');
    if (!data) return false;

    // 收集所有需要删除的ID（包括子项）
    const idsToDelete = new Set();

    // 递归收集子项ID
    function collectChildIds(parentId) {
      idsToDelete.add(parentId);

      // 查找所有以当前ID为父项的子项
      data.items.forEach(item => {
        if (item.parentId === parentId) {
          collectChildIds(item.id);
        }
      });
    }

    // 从目标ID开始收集
    collectChildIds(id);

    // 删除所有收集到的项目
    const originalLength = data.items.length;
    data.items = data.items.filter(item => !idsToDelete.has(item.id));

    // 检查是否有项目被删除
    const deletedCount = originalLength - data.items.length;
    if (deletedCount === 0) return false;

    await this.writeData('todos', data);
    await this.updateStats();

    return { success: true, deletedCount };
  }

  /**
   * 获取用户信息
   */
  async getUserInfo() {
    throw new Error('用户功能正在开发中，将通过后端数据库实现');
  }

  /**
   * 更新用户信息
   */
  async updateUserInfo(updates) {
    console.log('用户更新请求:', updates); // 临时日志
    throw new Error('用户功能正在开发中，将通过后端数据库实现');
  }

  /**
   * 获取设置
   */
  async getSettings() {
    await this.waitForInit();
    return await this.readData('settings');
  }

  /**
   * 更新设置
   */
  async updateSettings(updates) {
    await this.waitForInit();
    const data = await this.readData('settings');
    if (!data) return null;

    const newSettings = {
      ...data,
      ...updates
    };

    await this.writeData('settings', newSettings);
    return newSettings;
  }

  /**
   * 获取统计数据
   */
  async getStats() {
    await this.waitForInit();
    return await this.readData('stats');
  }

  /**
   * 获取层级结构的待办事项
   */
  async getHierarchicalTodos() {
    await this.waitForInit();
    const todos = await this.getTodos();

    // 构建层级结构
    const todoMap = new Map();
    const rootTodos = [];

    // 首先创建所有待办事项的映射
    todos.forEach(todo => {
      todoMap.set(todo.id, { ...todo, children: [] });
    });

    // 然后构建层级关系
    todos.forEach(todo => {
      const todoWithChildren = todoMap.get(todo.id);

      if (todo.parentId && todoMap.has(todo.parentId)) {
        // 有父级，添加到父级的children中
        const parent = todoMap.get(todo.parentId);
        parent.children.push(todoWithChildren);
      } else {
        // 没有父级，是根级项目
        rootTodos.push(todoWithChildren);
      }
    });

    return rootTodos;
  }

  /**
   * 根据分类获取待办事项
   */
  async getTodosByCategory(category) {
    await this.waitForInit();
    const todos = await this.getTodos();
    return todos.filter(todo => todo.category === category);
  }

  /**
   * 获取项目及其所有子任务
   */
  async getProjectWithSubtasks(projectId) {
    await this.waitForInit();
    const todos = await this.getTodos();
    const project = todos.find(todo => todo.id === projectId);

    if (!project) return null;

    const subtasks = todos.filter(todo => todo.parentId === projectId);
    return {
      ...project,
      subtasks
    };
  }

  /**
   * 获取今日待办事项（所有未完成的待办，按截止日期排序）
   */
  async getTodayTodos() {
    await this.waitForInit();
    const todos = await this.getTodos();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 设置为今天的开始时间

    // 只返回未完成的待办事项
    const uncompletedTodos = todos.filter(todo => !todo.completed);

    // 综合排序：优先级 + 截止日期
    return uncompletedTodos.sort((a, b) => {
      const dueDateA = a.dueDate ? new Date(a.dueDate) : null;
      const dueDateB = b.dueDate ? new Date(b.dueDate) : null;

      if (dueDateA) dueDateA.setHours(0, 0, 0, 0);
      if (dueDateB) dueDateB.setHours(0, 0, 0, 0);

      // 判断是否逾期
      const isOverdueA = dueDateA && dueDateA < today;
      const isOverdueB = dueDateB && dueDateB < today;

      // 优先级权重
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      const priorityA = priorityOrder[a.priority] || 2;
      const priorityB = priorityOrder[b.priority] || 2;

      // 第一优先级：逾期状态
      if (isOverdueA && !isOverdueB) return -1;
      if (!isOverdueA && isOverdueB) return 1;

      // 第二优先级：在同样的逾期状态下，按优先级排序
      if (isOverdueA && isOverdueB) {
        // 都是逾期任务，高优先级在前
        if (priorityA !== priorityB) return priorityB - priorityA;
        // 优先级相同，按逾期时间排序（越早逾期越靠前）
        return dueDateA - dueDateB;
      }

      // 都不是逾期任务的情况
      if (!isOverdueA && !isOverdueB) {
        // 有截止日期的任务优先于无截止日期的任务
        if (!dueDateA && !dueDateB) {
          // 都没有截止日期，按优先级排序
          return priorityB - priorityA;
        }
        if (!dueDateA) return 1;  // A没有截止日期，排在后面
        if (!dueDateB) return -1; // B没有截止日期，排在后面

        // 都有截止日期，计算综合得分
        // 日期越近得分越高，优先级越高得分越高
        const daysUntilA = Math.ceil((dueDateA - today) / (1000 * 60 * 60 * 24));
        const daysUntilB = Math.ceil((dueDateB - today) / (1000 * 60 * 60 * 24));

        // 今日任务额外加权
        const todayBonusA = daysUntilA === 0 ? 10 : 0;
        const todayBonusB = daysUntilB === 0 ? 10 : 0;

        // 综合得分：优先级权重 + 时间紧急度 + 今日任务加成
        const scoreA = priorityA * 2 + Math.max(0, 10 - daysUntilA) + todayBonusA;
        const scoreB = priorityB * 2 + Math.max(0, 10 - daysUntilB) + todayBonusB;

        if (scoreA !== scoreB) return scoreB - scoreA;

        // 得分相同，按日期排序
        return dueDateA - dueDateB;
      }

      return 0;
    });
  }

  /**
   * 获取逾期待办事项
   */
  async getOverdueTodos() {
    await this.waitForInit();
    const todos = await this.getTodos();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 设置为今天的开始时间

    return todos.filter(todo => {
      if (!todo.dueDate || todo.completed) return false;

      const dueDate = new Date(todo.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      return dueDate < today;
    });
  }

  /**
   * 获取今日统计数据
   */
  async getTodayStats() {
    await this.waitForInit();
    const todayTodos = await this.getTodayTodos();
    const overdueTodos = await this.getOverdueTodos();

    const scheduledCount = todayTodos.length;
    const overdueCount = overdueTodos.length;
    const completedCount = todayTodos.filter(todo => todo.completed).length;
    const pendingCount = scheduledCount - completedCount;

    return {
      scheduled: scheduledCount,
      overdue: overdueCount,
      completed: completedCount,
      pending: pendingCount,
      total: scheduledCount + overdueCount
    };
  }

  /**
   * 更新统计数据
   */
  async updateStats() {
    await this.waitForInit();
    const todos = await this.getTodos();
    const now = new Date();
    
    let pending = 0;
    let completed = 0;
    let overdue = 0;

    todos.forEach(todo => {
      if (todo.completed || todo.status === 'completed') {
        completed++;
      } else {
        pending++;

        // 检查是否过期
        if (todo.dueDate) {
          const dueDate = new Date(todo.dueDate);
          if (dueDate < now) {
            overdue++;
          }
        }
      }
    });

    // 计算项目统计
    const projects = todos.filter(todo => todo.type === 'project');
    const tasks = todos.filter(todo => todo.type === 'task');
    const subtasks = todos.filter(todo => todo.type === 'subtask');

    // 按分类统计
    const categoryStats = {};
    todos.forEach(todo => {
      const category = todo.category || 'general';
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, completed: 0, pending: 0 };
      }
      categoryStats[category].total++;
      if (todo.completed || todo.status === 'completed') {
        categoryStats[category].completed++;
      } else {
        categoryStats[category].pending++;
      }
    });

    const stats = {
      lastUpdated: now.toISOString(),
      totals: {
        pending,
        completed,
        overdue
      },
      hierarchy: {
        projects: projects.length,
        tasks: tasks.length,
        subtasks: subtasks.length
      },
      categories: categoryStats
    };

    await this.writeData('stats', stats);
    return stats;
  }
}

// 创建全局数据管理器实例
const dataManager = new DataManager();

// 导出数据管理器
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataManager;
} else if (typeof window !== 'undefined') {
  window.DataManager = DataManager;
  window.dataManager = dataManager;
}
