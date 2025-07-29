// 日期处理辅助函数
function formatDateForPicker(dateValue) {
  if (!dateValue) return '';

  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date value:', dateValue);
      return '';
    }

    // 返回 YYYY-MM-DD 格式
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

// 安全设置日期选择器的值
function setDatePickerValue(picker, dateValue) {
  if (!picker) return;

  try {
    const formattedDate = formatDateForPicker(dateValue);

    // 设置最小日期为今天（避免选择过去的日期）
    const today = new Date().toISOString().split('T')[0];
    picker.setAttribute('min', today);

    // 检查是否是过去的日期
    if (formattedDate && isPastDate(formattedDate)) {
      console.warn('尝试设置过去的日期:', formattedDate);
      picker.value = '';
      const message = window.i18n ?
        window.i18n.t('message.pastDateNotAllowed') :
        '不能选择过去的日期，请选择今天或未来的日期';
      showDateErrorMessage(message);
      return;
    }

    // 只有在有有效日期时才设置值
    if (formattedDate) {
      picker.value = formattedDate;
    } else {
      picker.value = '';
    }
  } catch (error) {
    console.error('Error setting date picker value:', error);
    picker.value = '';
  }
}

// 显示用户友好的提示消息
function showDateErrorMessage(message) {
  // 尝试使用现有的 snackbar 功能
  if (typeof showSnackbar === 'function') {
    showSnackbar(message);
  } else {
    // 降级到 alert
    alert(message);
  }
}

// 验证日期是否为过去的日期
function isPastDate(dateValue) {
  if (!dateValue) return false;

  try {
    const selectedDate = new Date(dateValue);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 重置时间为当天开始

    return selectedDate.getTime() < today.getTime();
  } catch (error) {
    return false;
  }
}

// 全局日期错误处理
window.addEventListener('error', function(event) {
  if (event.message && event.message.includes('invalid date')) {
    console.warn('捕获到日期错误，已自动处理:', event.message);

    // 检查所有日期选择器并处理错误
    document.querySelectorAll('s-date-picker').forEach(picker => {
      try {
        const currentValue = picker.value;

        if (currentValue) {
          // 检查是否是过去的日期
          if (isPastDate(currentValue)) {
            picker.value = '';
            const message = window.i18n ?
              window.i18n.t('message.pastDateNotAllowed') :
              '不能选择过去的日期，请选择今天或未来的日期';
            showDateErrorMessage(message);
          }
          // 检查是否是无效日期格式
          else if (isNaN(new Date(currentValue).getTime())) {
            picker.value = '';
            const message = window.i18n ?
              window.i18n.t('message.invalidDateFormat') :
              '日期格式无效，请重新选择';
            showDateErrorMessage(message);
          }
        }
      } catch (e) {
        // 忽略重置过程中的错误
        console.warn('处理日期选择器时出错:', e);
      }
    });

    // 阻止错误继续传播
    event.preventDefault();
    return true;
  }
});

// 初始化日期选择器验证
function initDatePickerValidation() {
  // 为所有现有的日期选择器添加验证
  document.querySelectorAll('s-date-picker').forEach(addDatePickerValidation);

  // 监听新添加的日期选择器
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.tagName === 'S-DATE-PICKER') {
            addDatePickerValidation(node);
          } else {
            // 检查子元素中是否有日期选择器
            const pickers = node.querySelectorAll && node.querySelectorAll('s-date-picker');
            if (pickers) {
              pickers.forEach(addDatePickerValidation);
            }
          }
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// 为单个日期选择器添加验证
function addDatePickerValidation(picker) {
  if (picker._validationAdded) return; // 避免重复添加

  picker.addEventListener('change', function(event) {
    const selectedValue = event.target.value;

    if (selectedValue && isPastDate(selectedValue)) {
      // 延迟重置，确保组件完成内部处理
      setTimeout(() => {
        event.target.value = '';
        const message = window.i18n ?
          window.i18n.t('message.pastDateNotAllowed') :
          '不能选择过去的日期，请选择今天或未来的日期';
        showDateErrorMessage(message);
      }, 100);
    }
  });

  picker._validationAdded = true;
}

// 页面加载完成后初始化验证
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDatePickerValidation);
} else {
  initDatePickerValidation();
}

function getCategoryStyle(category) {
  const categoryStyles = {
    'general': 'background-color: #e3f2fd; color: #1976d2; border-color: #bbdefb;',
    'work': 'background-color: #fce4ec; color: #c2185b; border-color: #f8bbd9;',
    'personal': 'background-color: #fff3e0; color: #f57c00; border-color: #ffcc02;',
    'life': 'background-color: #f3e5f5; color: #7b1fa2; border-color: #ce93d8;',
    'study': 'background-color: #e8f5e8; color: #388e3c; border-color: #a5d6a7;',
    'health': 'background-color: #ffebee; color: #d32f2f; border-color: #ffcdd2;',
    'yearly': 'background-color: #e0f2f1; color: #00695c; border-color: #80cbc4;',
    'monthly': 'background-color: #fff8e1; color: #f57f17; border-color: #ffecb3;',
    'daily': 'background-color: #e1f5fe; color: #0277bd; border-color: #81d4fa;'
  };
  return categoryStyles[category] || 'background-color: #f5f5f5; color: #666; border-color: #ddd;';
}

function getCategoryIcon(category) {
  const categoryIcons = {
    'general': '📋',
    'work': '💼',
    'personal': '👤',
    'life': '🏠',
    'study': '📚',
    'health': '💪',
    'yearly': '📅',
    'monthly': '🗓️',
    'daily': '📝'
  };
  return categoryIcons[category] || '📌';
}

// 添加待办项到UI（支持层级结构）
function addTodoToUI(todo, parentContainer = null) {
  const todoList = parentContainer || document.querySelector('.todo-list');
  if (!todoList) return;

  // 创建待办项元素
  const todoItem = document.createElement('div');
  todoItem.className = `todo-item ${todo.type || 'task'}`;
  todoItem.setAttribute('data-id', todo.id);
  todoItem.setAttribute('data-level', todo.level || 0);
  todoItem.setAttribute('data-type', todo.type || 'task');

  // 为子项添加父项ID属性
  if (todo.parentId) {
    todoItem.setAttribute('data-parent-id', todo.parentId);
  }



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

  // 获取倒计时文本和紧急程度
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

  // 检查是否有子项
  const hasChildren = todo.children && todo.children.length > 0;

  // 设置待办项HTML
  todoItem.innerHTML = `
    ${hasChildren ? `
      <button class="todo-expand-btn" title="${window.i18n ? window.i18n.t('tooltip.expand') : '展开子项'}" data-expanded="false">
        <span style="font-size: 14px; color: #666;">▶</span>
      </button>
    ` : '<div style="width: 24px;"></div>'}

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
        ${todo.level === 0 && todo.category ? `<span class="todo-category-badge" style="${getCategoryStyle(todo.category)}"><span class="category-icon">${getCategoryIcon(todo.category)}</span>${getCategoryDisplayName(todo.category)}</span>` : ''}
        ${hasChildren ? `<span class="child-count-badge">${todo.children.length} ${window.i18n ? window.i18n.t('todo.childCount') : '个子项'}</span>` : ''}
      </div>
    </div>

    <div class="todo-actions">
      ${todo.level === 0 ? `
        <button class="action-btn add-child-btn" title="${window.i18n ? window.i18n.t('tooltip.addChild') : '添加子项'}">
          <img src="assets/icons/add-child.svg" alt="${window.i18n ? window.i18n.t('tooltip.addChild') : '添加子项'}" width="20" height="20">
        </button>
      ` : ''}
      <button class="action-btn edit-btn" title="${window.i18n ? window.i18n.t('tooltip.edit') : '编辑'}">
        <img src="assets/icons/edit.svg" alt="${window.i18n ? window.i18n.t('tooltip.edit') : '编辑'}" width="20" height="20">
      </button>
      <button class="action-btn delete-btn" title="${window.i18n ? window.i18n.t('tooltip.delete') : '删除'}">
        <img src="assets/icons/delete.svg" alt="${window.i18n ? window.i18n.t('tooltip.delete') : '删除'}" width="20" height="20">
      </button>
    </div>
  `;
  
  // 添加到列表末尾（保持顺序）
  todoList.appendChild(todoItem);
  
  // 设置事件监听
  const statusBtn = todoItem.querySelector('.todo-status-btn');
  statusBtn.addEventListener('click', async function() {
    const isCurrentlyCompleted = this.classList.contains('completed');
    const newCompletedState = !isCurrentlyCompleted;
    const todoContent = todoItem.querySelector('.todo-content');

    try {
      // 添加过渡动画类
      todoItem.classList.add('status-changing');

      // 更新数据
      await dataManager.updateTodo(todo.id, { completed: newCompletedState });

      // 如果有子项，同时更新所有子项
      if (todo.children && todo.children.length > 0) {
        showSnackbar(window.i18n ? window.i18n.t('message.updatingChildren') : '正在更新子项状态...');
        await updateChildrenCompletion(todo.id, newCompletedState);
      }

      // 更新UI状态
      if (newCompletedState) {
        this.classList.remove('pending');
        this.classList.add('completed');
        this.title = '标记为未完成';
        todoContent.classList.add('completed');

        // 更新状态指示器
        const indicator = this.querySelector('.status-indicator');
        indicator.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';

        // 创建完成动画
        createCompletionAnimation(todoItem);
      } else {
        this.classList.remove('completed');
        this.classList.add('pending');
        this.title = '标记为已完成';
        todoContent.classList.remove('completed');

        // 更新状态指示器
        const indicator = this.querySelector('.status-indicator');
        indicator.innerHTML = '<div class="pending-dot"></div>';
      }

      // 移除过渡动画类
      setTimeout(() => {
        todoItem.classList.remove('status-changing');
      }, 300);

      // 更新统计数据
      await updateStatsDisplay();

      // 刷新今日待办页面的数据，确保状态同步
      await refreshTodayPageData();

      // 检查是否需要更新父项状态
      await checkAndUpdateParentStatus(todo.id, newCompletedState);

      // 重新应用当前过滤器（带动画）
      setTimeout(() => {
        reapplyCurrentFilter();
      }, 300);

    } catch (error) {
      console.error('更新待办事项状态失败:', error);
      // 移除过渡动画类
      todoItem.classList.remove('status-changing');
      showSnackbar(window.i18n ? window.i18n.t('message.updateStatusFailed') : '更新待办事项状态失败');
    }
  });
  
  // 展开/折叠按钮事件
  const expandBtn = todoItem.querySelector('.todo-expand-btn');
  if (expandBtn) {
    expandBtn.addEventListener('click', function() {
      toggleChildrenVisibility(todo.id);
    });
  }

  // 删除按钮事件
  const deleteBtn = todoItem.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', function() {
    handleTodoDelete(todo);
  });

  // 添加子项按钮事件（只有顶级项目才有此按钮）
  const addChildBtn = todoItem.querySelector('.add-child-btn');
  if (addChildBtn) {
    addChildBtn.addEventListener('click', function() {
      showAddChildDialog(todo);
    });
  }

  // 编辑按钮事件
  const editBtn = todoItem.querySelector('.edit-btn');
  editBtn.addEventListener('click', function() {
    showEditTodoDialog(todo);
  });
}

// 清空待办表单
function clearTodoForm() {
  const titleField = document.getElementById('todo-title');
  const dueDatePicker = document.getElementById('todo-due-date');
  const descField = document.getElementById('todo-desc');
  const disableAutoFill = document.getElementById('disable-auto-fill');
  
  if (titleField) titleField.value = '';
  if (dueDatePicker) dueDatePicker.value = '';
  if (descField) descField.value = '';
  
  // 重置优先级为中
  const priorityPicker = document.getElementById('todo-priority');
  if (priorityPicker) {
    try {
      priorityPicker.value = 'medium';
    } catch (e) {
      console.error('重置优先级选择器失败:', e);
    }
  }

  // 重置分类为常规
  const categoryPicker = document.getElementById('todo-category');
  if (categoryPicker) {
    try {
      categoryPicker.value = 'general';
    } catch (e) {
      console.error('重置分类选择器失败:', e);
    }
  }
  
  // 重置自动填充复选框
  if (disableAutoFill) {
    disableAutoFill.checked = false;
  }
}

// 清空编辑待办表单
function clearEditForm() {
  const titleField = document.getElementById('edit-todo-title');
  const dueDatePicker = document.getElementById('edit-todo-due-date');
  const descField = document.getElementById('edit-todo-desc');

  if (titleField) titleField.value = '';
  if (dueDatePicker) dueDatePicker.value = '';
  if (descField) descField.value = '';

  // 重置优先级为中
  const priorityPicker = document.getElementById('edit-todo-priority');
  if (priorityPicker) {
    try {
      priorityPicker.value = 'medium';
    } catch (e) {
      console.error('重置优先级选择器失败:', e);
    }
  }

  // 重置分类为常规
  const categoryPicker = document.getElementById('edit-todo-category');
  if (categoryPicker) {
    try {
      categoryPicker.value = 'general';
    } catch (e) {
      console.error('重置分类选择器失败:', e);
    }
  }
}

// 显示编辑待办对话框
function showEditTodoDialog(todo) {
  const editDialog = document.getElementById('edit-todo-dialog');
  if (!editDialog) return;

  // 存储正在编辑的待办ID
  editDialog._editingTodoId = todo.id;

  // 填充表单数据
  const titleField = document.getElementById('edit-todo-title');
  const descField = document.getElementById('edit-todo-desc');
  const priorityField = document.getElementById('edit-todo-priority');
  const categoryField = document.getElementById('edit-todo-category');
  const dueDateField = document.getElementById('edit-todo-due-date');

  if (titleField) titleField.value = todo.title || '';
  if (descField) descField.value = todo.description || '';
  if (priorityField) priorityField.value = todo.priority || 'medium';
  if (categoryField) categoryField.value = todo.category || 'general';

  // 安全设置日期
  setDatePickerValue(dueDateField, todo.dueDate);

  // 打开对话框
  editDialog.showed = true;

  // 聚焦到标题输入框
  setTimeout(() => {
    if (titleField) {
      titleField.focus();
    }
  }, 200);
}

// 当前活动的过滤器 (工具模块)
let toolsCurrentFilter = 'pending';

// 过滤待办事项
function filterTodos(filter) {
  toolsCurrentFilter = filter; // 保存当前过滤器

  // 直接调用updateChildrenVisibility，它现在会处理过滤和折叠逻辑
  updateChildrenVisibility();
}

// 重新应用当前过滤器
function reapplyCurrentFilter() {
  filterTodos(toolsCurrentFilter);
}