// 初始化今日待办页面
async function initTodayView() {
  // 启动今日日期时间更新
  startTodayDateTimer();

  // 监听今日待办页面的显示事件
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    if (item.dataset.view === 'today-view') {
      item.addEventListener('click', async () => {
        // 当切换到今日待办页面时，重新加载数据
        await loadTodayTodos();
      });
    }
  });

  // 监听今日待办页面的显示事件（使用MutationObserver）
  const todayView = document.getElementById('today-view');
  if (todayView) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (todayView.classList.contains('active')) {
            // 页面变为活跃状态时重新加载数据
            setTimeout(() => {
              loadTodayTodos();
            }, 100);
          }
        }
      });
    });

    observer.observe(todayView, { attributes: true });
  }

  // 初始化今日待办筛选器
  initTodayFilters();

  // 初始化今日待办搜索功能
  initTodaySearch();

  // 初始加载今日待办数据
  await loadTodayTodos();
}

// 初始化今日待办筛选器
function initTodayFilters() {
  const filterBtns = document.querySelectorAll('.today-filter-btn');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // 移除所有按钮的active类
      filterBtns.forEach(b => b.classList.remove('active'));
      // 为当前按钮添加active类
      btn.classList.add('active');
      
      // 执行筛选
      const filter = btn.getAttribute('data-filter');
      filterTodayTodos(filter);
    });
  });
}

// 初始化今日待办搜索功能
function initTodaySearch() {
  const searchInput = document.getElementById('today-search');
  if (!searchInput) return;

  let searchTimeout;
  
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const searchTerm = e.target.value.toLowerCase().trim();
      searchTodayTodos(searchTerm);
    }, 300); // 300ms防抖
  });

  // 清空搜索时重置显示
  searchInput.addEventListener('clear', () => {
    searchTodayTodos('');
  });
}

// 筛选今日待办事项
function filterTodayTodos(filter) {
  const todoItems = document.querySelectorAll('.today-todo-item');
  
  todoItems.forEach(item => {
    const statusBtn = item.querySelector('.todo-status-btn');
    const isCompleted = statusBtn && statusBtn.classList.contains('completed');
    const isOverdue = item.classList.contains('overdue-task');
    
    let shouldShow = false;
    
    switch (filter) {
      case 'all':
        shouldShow = true;
        break;
      case 'pending':
        shouldShow = !isCompleted;
        break;
      case 'completed':
        shouldShow = isCompleted;
        break;
      case 'overdue':
        shouldShow = isOverdue && !isCompleted;
        break;
    }
    
    if (shouldShow) {
      item.style.display = 'flex';
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
    } else {
      item.style.display = 'none';
      item.style.opacity = '0';
      item.style.transform = 'translateY(-10px)';
    }
  });
  
  // 更新空状态显示
  updateTodayEmptyState();
}

// 搜索今日待办事项
function searchTodayTodos(searchTerm) {
  const todoItems = document.querySelectorAll('.today-todo-item');
  let visibleCount = 0;
  
  todoItems.forEach(item => {
    const shouldShow = matchesTodaySearch(item, searchTerm);
    
    if (shouldShow) {
      item.style.display = 'flex';
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
      visibleCount++;
    } else {
      item.style.display = 'none';
      item.style.opacity = '0';
      item.style.transform = 'translateY(-10px)';
    }
  });
  
  // 更新空状态显示
  updateTodayEmptyState();
  
  // 显示搜索结果统计
  if (searchTerm) {
    console.log(`搜索 "${searchTerm}" 找到 ${visibleCount} 个今日待办项`);
  }
}

// 检查今日待办项是否匹配搜索条件
function matchesTodaySearch(todoItem, searchTerm) {
  if (!searchTerm) return true; // 空搜索显示所有项
  
  // 获取待办项的文本内容
  const titleElement = todoItem.querySelector('.todo-title');
  const descElement = todoItem.querySelector('.todo-desc');
  const categoryElement = todoItem.querySelector('.todo-category-badge');
  
  const title = titleElement?.textContent.toLowerCase() || '';
  const description = descElement?.textContent.toLowerCase() || '';
  const category = categoryElement?.textContent.toLowerCase() || '';
  
  // 检查标题、描述或分类是否包含搜索词
  return title.includes(searchTerm) ||
         description.includes(searchTerm) ||
         category.includes(searchTerm);
}

// 更新今日待办空状态显示
function updateTodayEmptyState() {
  const todayList = document.querySelector('.today-list');
  const emptyState = document.getElementById('today-empty-state');
  
  if (!todayList || !emptyState) return;
  
  const visibleItems = todayList.querySelectorAll('.today-todo-item[style*="display: flex"], .today-todo-item:not([style*="display: none"])');
  
  if (visibleItems.length === 0) {
    emptyState.style.display = 'flex';
    todayList.style.display = 'none';
  } else {
    emptyState.style.display = 'none';
    todayList.style.display = 'block';
  }
}

// 重置今日待办筛选器状态
function resetTodayFilters() {
  // 获取当前激活的筛选器
  const activeFilter = document.querySelector('.today-filter-btn.active');
  const currentFilter = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
  
  // 应用当前筛选
  filterTodayTodos(currentFilter);
  
  // 清空搜索框
  const searchInput = document.getElementById('today-search');
  if (searchInput && searchInput.value) {
    searchInput.value = '';
  }
}

// 更新今日日期显示
function updateTodayDate() {
  const todayDateEl = document.getElementById('today-date-text');
  if (todayDateEl) {
    const today = new Date();

    // 根据当前语言设置选择合适的locale
    let locale = 'zh-CN';
    if (window.i18n && window.i18n.currentLanguage) {
      switch (window.i18n.currentLanguage) {
        case 'en':
          locale = 'en-US';
          break;
        case 'ja':
          locale = 'ja-JP';
          break;
        default:
          locale = 'zh-CN';
      }
    }

    // 格式化日期和时间
    const dateStr = today.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });

    const timeStr = today.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    todayDateEl.textContent = `${dateStr} ${timeStr}`;
  }
}

// 启动今日日期时间更新
function startTodayDateTimer() {
  // 清除现有定时器
  if (todayDateTimer) {
    clearInterval(todayDateTimer);
  }

  // 立即更新一次
  updateTodayDate();
  
  // 每秒更新时间
  todayDateTimer = setInterval(updateTodayDate, 1000);
}

// 停止今日日期时间更新
function stopTodayDateTimer() {
  if (todayDateTimer) {
    clearInterval(todayDateTimer);
    todayDateTimer = null;
  }
}

// 加载今日待办事项
async function loadTodayTodos() {
  try {
    const todayList = document.querySelector('.today-list');
    const emptyState = document.getElementById('today-empty-state');

    if (!todayList) return;

    // 清空现有列表
    todayList.innerHTML = '';

    // 获取今日待办数据
    const todayTodos = await dataManager.getTodayTodos();

    if (!todayTodos || todayTodos.length === 0) {
      // 显示空状态
      emptyState.style.display = 'flex';
      todayList.style.display = 'none';
      return;
    }

    // 隐藏空状态
    emptyState.style.display = 'none';
    todayList.style.display = 'block';

    // 添加所有今日待办项到UI
    todayTodos.forEach(todo => {
      addTodayTodoToUI(todo);
    });

    // 重置筛选器状态并应用当前筛选
    resetTodayFilters();

  } catch (error) {
    console.error('加载今日待办事项失败:', error);
  }
}

// 添加今日待办项到UI
function addTodayTodoToUI(todo) {
  const todayList = document.querySelector('.today-list');
  if (!todayList) return;

  // 创建待办项元素
  const todoItem = document.createElement('div');
  todoItem.className = `today-todo-item ${todo.type || 'task'}`;
  todoItem.setAttribute('data-id', todo.id);
  todoItem.setAttribute('data-type', todo.type || 'task');

  // 获取优先级样式类和文本
  let priorityClass = 'priority-medium';
  let priorityText = window.i18n ? window.i18n.t('todo.priority.medium') : '中优先级';

  if (todo.priority === 'high') {
    priorityClass = 'priority-high';
    priorityText = window.i18n ? window.i18n.t('todo.priority.high') : '高优先级';
  } else if (todo.priority === 'low') {
    priorityClass = 'priority-low';
    priorityText = window.i18n ? window.i18n.t('todo.priority.low') : '低优先级';
  }

  // 获取倒计时文本
  const countdownText = getCountdownText(todo.dueDate);
  const urgencyClass = getCountdownUrgencyClass(todo.dueDate);

  // 判断是否逾期
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue = todo.dueDate && new Date(todo.dueDate) < today;

  // 为逾期任务添加特殊样式
  if (isOverdue) {
    todoItem.classList.add('overdue-task');
  }

  // 为不同优先级任务添加特殊样式
  if (todo.priority === 'high') {
    todoItem.classList.add('high-priority-task');
  } else if (todo.priority === 'medium') {
    todoItem.classList.add('medium-priority-task');
  } else if (todo.priority === 'low') {
    todoItem.classList.add('low-priority-task');
  }

  // 设置待办项HTML
  todoItem.innerHTML = `
    <button class="todo-status-btn ${todo.completed ? 'completed' : 'pending'}" title="${todo.completed ? '标记为未完成' : '标记为已完成'}">
      <div class="status-indicator">
        ${todo.completed ?
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' :
          '<div class="pending-dot"></div>'
        }
      </div>
    </button>

    <div class="todo-content ${todo.completed ? 'completed' : ''}">
      <h3 class="todo-title">${todo.title}</h3>
      ${todo.description ? `<div class="todo-desc">${todo.description}</div>` : ''}
      <div class="todo-meta">
        <span class="todo-badge ${priorityClass}">${priorityText}</span>
        <span class="todo-due-date ${urgencyClass}">${countdownText}</span>
        ${todo.category ? `<span class="todo-category-badge" style="${getCategoryStyle(todo.category)}"><span class="category-icon">${getCategoryIcon(todo.category)}</span>${getCategoryDisplayName(todo.category)}</span>` : ''}
      </div>
    </div>

    <div class="todo-actions">
      <button class="action-btn edit-btn" title="${window.i18n ? window.i18n.t('tooltip.edit') : '编辑'}">
        <img src="assets/icons/edit.svg" alt="${window.i18n ? window.i18n.t('tooltip.edit') : '编辑'}" width="20" height="20">
      </button>
    </div>
  `;

  // 添加到列表
  todayList.appendChild(todoItem);

  // 设置事件监听
  const statusBtn = todoItem.querySelector('.todo-status-btn');
  statusBtn.addEventListener('click', async function() {
    const isCurrentlyCompleted = this.classList.contains('completed');
    const newCompletedState = !isCurrentlyCompleted;
    const todoContent = todoItem.querySelector('.todo-content');

    try {
      if (newCompletedState) {
        // 任务完成 - 播放爆炸动画
        this.classList.remove('pending');
        this.classList.add('completed');
        this.title = window.i18n ? window.i18n.t('tooltip.markIncomplete') : '标记为未完成';
        todoContent.classList.add('completed');

        // 更新状态指示器
        const indicator = this.querySelector('.status-indicator');
        indicator.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';

        // 更新数据
        await dataManager.updateTodo(todo.id, { completed: newCompletedState });

        // 播放完成动画
        await animateTaskCompletion(todoItem);

        // 检查是否需要显示空状态
        const remainingTodos = document.querySelectorAll('.today-todo-item:not(.exploding):not(.collapsing)');
        if (remainingTodos.length === 0) {
          const emptyState = document.getElementById('today-empty-state');
          const todayList = document.querySelector('.today-list');
          if (emptyState && todayList) {
            todayList.style.display = 'none';
            emptyState.style.display = 'flex';
          }
        }

      } else {
        // 任务取消完成 - 普通更新
        this.classList.remove('completed');
        this.classList.add('pending');
        this.title = window.i18n ? window.i18n.t('tooltip.markComplete') : '标记为已完成';
        todoContent.classList.remove('completed');

        // 更新状态指示器
        const indicator = this.querySelector('.status-indicator');
        indicator.innerHTML = '<div class="pending-dot"></div>';

        // 更新数据
        await dataManager.updateTodo(todo.id, { completed: newCompletedState });
      }

      // 更新统计数据
      await updateStatsDisplay();

      // 刷新待办页面的数据，确保状态同步
      await refreshTodoPageData();

    } catch (error) {
      console.error('更新今日待办事项状态失败:', error);
      showSnackbar(window.i18n ? window.i18n.t('message.updateStatusFailed') : '更新待办事项状态失败');
    }
  });

  // 编辑按钮事件
  const editBtn = todoItem.querySelector('.edit-btn');
  if (editBtn) {
    editBtn.addEventListener('click', function() {
      showEditTodoDialog(todo);
    });
  }
}

// 刷新今日待办页面数据
async function refreshTodayPageData() {
  try {
    await loadTodayTodos();
  } catch (error) {
    console.error('刷新今日待办页面数据失败:', error);
  }
}
