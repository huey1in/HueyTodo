// 初始化待办事项功能
async function initTodoFunctionality() {
  const addTodoBtn = document.getElementById('add-todo-btn');
  const saveTodoBtn = document.getElementById('save-todo-btn');
  const cancelTodoBtn = document.getElementById('cancel-todo-btn');
  const todoList = document.querySelector('.todo-list');
  const filterBtns = document.querySelectorAll('.filter-btn');

  // 打开新建待办表单
  if (addTodoBtn) {
    addTodoBtn.addEventListener('click', () => {
      const todoDialog = document.getElementById('todo-dialog');
      if (todoDialog) {
        // 安全设置日期选择器
        const dueDatePicker = document.getElementById('todo-due-date');
        setDatePickerValue(dueDatePicker, null); // 清空日期选择器

        todoDialog.showed = true;
        // 聚焦到标题输入框
        setTimeout(() => {
          const titleInput = document.getElementById('todo-title');
          if (titleInput) {
            titleInput.focus();
          }
        }, 200);
      }
    });
  }

  // 初始化优先级选择器
  initPrioritySelector();

  // 取消新建待办
  if (cancelTodoBtn) {
    cancelTodoBtn.addEventListener('click', () => {
      const todoDialog = document.getElementById('todo-dialog');
      if (todoDialog) {
        todoDialog.showed = false;
        clearTodoForm();
      }
    });
  }

  // 保存新建待办
  if (saveTodoBtn) {
    saveTodoBtn.addEventListener('click', async () => {
      const titleField = document.getElementById('todo-title');
      const dueDatePicker = document.getElementById('todo-due-date');
      const descField = document.getElementById('todo-desc');
      const disableAutoFill = document.getElementById('disable-auto-fill');
      
      let title = titleField.value.trim();
      const priority = document.getElementById('todo-priority').value;
      const dueDate = dueDatePicker.value;
      const desc = descField.value;

      // 如果标题为空且没有勾选"不自动填充"选项，则自动填充日期和时间
      if (!title && !disableAutoFill.checked) {
        const now = new Date();
        const dateStr = now.toLocaleDateString();
        const timeStr = now.toLocaleTimeString();
        title = `待办事项 - ${dateStr} ${timeStr}`;
        titleField.value = title;
      }
      
      if (!title) {
        showSnackbar(window.i18n ? window.i18n.t('message.enterTitle') : '请输入待办标题或允许自动填充');
        return;
      }

      // 获取分类
      const category = document.getElementById('todo-category').value;

      // 创建新待办对象（最外层todo）
      const todoData = {
        title,
        description: desc,
        priority,
        dueDate,
        type: 'root', // 最外层todo
        parentId: null,
        level: 0,
        category,
        tags: [],
        progress: 0,
        status: 'pending'
      };

      try {
        // 保存到数据管理器
        const todo = await dataManager.addTodo(todoData);

        // 重新加载整个列表以保持正确的顺序
        await loadExistingTodos();

        // 关闭对话框并清空表单
        const todoDialog = document.getElementById('todo-dialog');
        if (todoDialog) {
          todoDialog.showed = false;
        }
        clearTodoForm();

        // 显示成功提示
        showSnackbar(window.i18n ? window.i18n.t('message.todoAdded') : '待办事项已创建');

        // 更新统计数据
        await updateStatsDisplay();
      } catch (error) {
        console.error('创建待办事项失败:', error);
        showSnackbar(window.i18n ? window.i18n.t('message.todoCreateFailed') : '创建待办事项失败');
      }
    });
  }

  // 编辑待办事件处理
  const editTodoDialog = document.getElementById('edit-todo-dialog');
  const cancelEditTodoBtn = document.getElementById('cancel-edit-todo-btn');
  const saveEditTodoBtn = document.getElementById('save-edit-todo-btn');

  // 取消编辑待办
  if (cancelEditTodoBtn) {
    cancelEditTodoBtn.addEventListener('click', () => {
      if (editTodoDialog) {
        editTodoDialog.showed = false;
        // 清空表单
        clearEditForm();
      }
    });
  }

  // 保存编辑待办
  if (saveEditTodoBtn) {
    saveEditTodoBtn.addEventListener('click', async () => {
      const todoId = editTodoDialog._editingTodoId;
      if (!todoId) return;

      const titleField = document.getElementById('edit-todo-title');
      const dueDatePicker = document.getElementById('edit-todo-due-date');
      const descField = document.getElementById('edit-todo-desc');
      const priorityField = document.getElementById('edit-todo-priority');
      const categoryField = document.getElementById('edit-todo-category');

      const title = titleField.value.trim();
      const priority = priorityField.value;
      const dueDate = dueDatePicker.value;
      const desc = descField.value;
      const category = categoryField.value;

      if (!title) {
        showSnackbar(window.i18n ? window.i18n.t('message.titleRequired') : '请输入待办标题');
        titleField.focus();
        return;
      }

      try {
        // 更新待办事项
        const updatedTodo = await dataManager.updateTodo(todoId, {
          title,
          priority,
          dueDate: dueDate || null,
          description: desc,
          category
        });

        if (updatedTodo) {
          // 关闭对话框
          editTodoDialog.showed = false;
          clearEditForm();

          // 重新加载待办列表
          await loadExistingTodos();

          // 刷新今日待办页面的数据
          await refreshTodayPageData();

          // 更新统计数据
          await updateStatsDisplay();

          showSnackbar(window.i18n ? window.i18n.t('message.todoUpdated') : '待办事项已更新');
        } else {
          showSnackbar(window.i18n ? window.i18n.t('message.updateFailed') : '更新待办事项失败');
        }
      } catch (error) {
        console.error('更新待办事项失败:', error);
        showSnackbar(window.i18n ? window.i18n.t('message.updateFailed') : '更新待办事项失败');
      }
    });
  }

  // 过滤器点击事件
  if (filterBtns) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // 移除所有按钮的active类
        filterBtns.forEach(filterBtn => {
          filterBtn.classList.remove('active');
        });

        // 为当前点击的按钮添加active类
        btn.classList.add('active');

        // 应用过滤器
        const filter = btn.getAttribute('data-filter');
        filterTodos(filter);
      });
    });
  }

  // 加载保存的折叠状态
  loadCollapsedState();

  // 加载现有待办项
  await loadExistingTodos();

  // 添加现有待办项的事件处理
  if (todoList) {
    setupExistingTodoEvents();
  }

  // 设置空状态按钮事件
  const emptyStateAddBtn = document.getElementById('empty-state-add-btn');
  if (emptyStateAddBtn) {
    emptyStateAddBtn.addEventListener('click', () => {
      // 触发新建待办按钮的点击事件
      const addTodoBtn = document.getElementById('add-todo-btn');
      if (addTodoBtn) {
        addTodoBtn.click();
      }
    });
  }

  // 设置默认选中状态为"待办"
  const defaultFilter = document.querySelector('.filter-btn[data-filter="pending"]');
  if (defaultFilter) {
    // 移除所有active类
    filterBtns.forEach(btn => btn.classList.remove('active'));
    // 设置待办为active
    defaultFilter.classList.add('active');
  }

  // 默认应用"待办"过滤器
  filterTodos('pending');

  // 启动倒计时更新定时器
  startCountdownTimer();

  // 初始化搜索功能
  initTodoSearch();

  // 初始化问候语和一言
  initGreetingAndHitokoto();
}

// 创建完成动画（跳到已完成按钮）
function createCompletionAnimation(todoItem) {
  const todoTitle = todoItem.querySelector('.todo-title').textContent;
  // 获取todo项目的位置
  const todoRect = todoItem.getBoundingClientRect();

  // 获取已完成按钮的位置
  const completedBtn = document.querySelector('.filter-btn[data-filter="completed"]');
  if (!completedBtn) return;

  const completedRect = completedBtn.getBoundingClientRect();

  // 创建动画元素
  const animationEl = document.createElement('div');
  animationEl.className = 'todo-completion-animation';
  animationEl.textContent = `✓ ${todoTitle}`;

  // 设置初始位置（todo项目的位置）
  animationEl.style.left = `${todoRect.left}px`;
  animationEl.style.top = `${todoRect.top + todoRect.height / 2 - 20}px`;

  // 添加到页面
  document.body.appendChild(animationEl);

  // 启动动画
  setTimeout(() => {
    animationEl.classList.add('animate');

    // 移动到已完成按钮位置
    animationEl.style.left = `${completedRect.left + completedRect.width / 2 - animationEl.offsetWidth / 2}px`;
    animationEl.style.top = `${completedRect.top - 40}px`;
  }, 50);

  // 在已完成按钮位置停留一会儿，然后淡出
  setTimeout(() => {
    animationEl.classList.add('fade-out');

    // 动画结束后移除元素
    setTimeout(() => {
      if (animationEl.parentNode) {
        animationEl.parentNode.removeChild(animationEl);
      }
    }, 300);
  }, 800);

  // 让已完成按钮闪烁一下
  setTimeout(() => {
    completedBtn.style.transform = 'scale(1.1)';
    completedBtn.style.transition = 'transform 0.2s ease';

    setTimeout(() => {
      completedBtn.style.transform = 'scale(1)';
    }, 200);
  }, 600);
}

// 初始化子项对话框
function initChildTodoDialog() {
  const cancelChildBtn = document.getElementById('cancel-child-btn');
  const saveChildBtn = document.getElementById('save-child-btn');
  const childDialog = document.getElementById('child-todo-dialog');

  // 取消按钮
  if (cancelChildBtn) {
    cancelChildBtn.addEventListener('click', () => {
      if (childDialog) {
        childDialog.showed = false;
        clearChildForm();
      }
    });
  }

  // 保存按钮
  if (saveChildBtn) {
    saveChildBtn.addEventListener('click', async () => {
      const title = document.getElementById('child-title').value.trim();
      const description = document.getElementById('child-description').value.trim();
      const priority = document.getElementById('child-priority').value;
      const dueDate = document.getElementById('child-due-date').value;

      if (!title) {
        showSnackbar(window.i18n ? window.i18n.t('message.enterChildTitle') : '请输入子项标题');
        return;
      }

      const parentTodo = childDialog._parentTodo;
      if (!parentTodo) {
        showSnackbar(window.i18n ? window.i18n.t('message.parentInfoLost') : '父级信息丢失');
        return;
      }

      try {
        // 创建子项数据（固定为第1层）
        const childData = {
          title,
          description,
          priority,
          dueDate: dueDate || null,
          type: 'child',
          parentId: parentTodo.id,
          level: 1, // 固定为第1层
          category: parentTodo.category, // 继承父级分类
          tags: [],
          progress: 0,
          status: 'pending'
        };

        // 保存子项
        const childTodo = await dataManager.addTodo(childData);

        // 关闭对话框并清空表单
        childDialog.showed = false;
        clearChildForm();

        // 自动展开父项及其所有祖先项以显示新子项
        await expandToShowNewChild(parentTodo.id);

        // 重新加载待办事项列表以显示新的层级结构
        await loadExistingTodos();

        // 滚动到新添加的子项（在父项下方）
        setTimeout(() => {
          scrollToNewChild(parentTodo.id);
        }, 100);

        // 更新统计数据
        await updateStatsDisplay();

        showSnackbar(window.i18n ? window.i18n.t('message.childAdded') : '子项已创建');

      } catch (error) {
        console.error('创建子项失败:', error);
        showSnackbar(window.i18n ? window.i18n.t('message.childCreateFailed') : '创建子项失败');
      }
    });
  }
}

// 清空子项表单
function clearChildForm() {
  const titleInput = document.getElementById('child-title');
  const descInput = document.getElementById('child-description');
  const priorityPicker = document.getElementById('child-priority');
  const dueDatePicker = document.getElementById('child-due-date');

  if (titleInput) titleInput.value = '';
  if (descInput) descInput.value = '';
  if (priorityPicker) priorityPicker.value = 'medium';
  if (dueDatePicker) dueDatePicker.value = '';
}

// 显示添加子项对话框
function showAddChildDialog(parentTodo) {
  const childDialog = document.getElementById('child-todo-dialog');
  if (!childDialog) return;

  // 检查父项层级，只允许顶级项目（level 0）添加子项
  if (parentTodo.level !== 0) {
    showSnackbar(window.i18n ? window.i18n.t('message.onlyTopLevelCanHaveChildren') : '只有顶级待办事项可以添加子项');
    return;
  }

  // 存储父级todo信息
  childDialog._parentTodo = parentTodo;

  // 安全设置子项日期选择器
  const childDueDatePicker = document.getElementById('child-due-date');
  setDatePickerValue(childDueDatePicker, null); // 清空日期选择器

  // 打开对话框
  childDialog.showed = true;

  // 聚焦到标题输入框
  setTimeout(() => {
    const titleInput = document.getElementById('child-title');
    if (titleInput) {
      titleInput.focus();
    }
  }, 100);
}



// 存储折叠状态 
const coreCollapsedTodos = new Set();

// 防抖机制 - 避免快速连续操作导致卡死 
let coreIsUpdating = false;
const coreOperationQueue = [];

// 标记最近展开的父项（用于在刷新后保持展开状态）
const recentlyExpandedParents = new Set();

// 当前活动的过滤器 
let currentFilter = 'pending';

// 折叠状态持久化
const COLLAPSED_TODOS_KEY = 'huey-todo-collapsed-state';
const PARENT_TODOS_KEY = 'huey-todo-parent-ids'; // 保存所有见过的父项ID

// 保存折叠状态到localStorage
function saveCollapsedState() {
  try {
    const collapsedArray = Array.from(coreCollapsedTodos);
    localStorage.setItem(COLLAPSED_TODOS_KEY, JSON.stringify(collapsedArray));
  } catch (error) {
    console.error('保存折叠状态失败:', error);
  }
}

// 保存所有父项ID到localStorage
function saveParentIds(parentIds) {
  try {
    const parentArray = Array.from(parentIds);
    localStorage.setItem(PARENT_TODOS_KEY, JSON.stringify(parentArray));
  } catch (error) {
    console.error('保存父项ID失败:', error);
  }
}

// 从localStorage加载折叠状态
function loadCollapsedState() {
  try {
    const saved = localStorage.getItem(COLLAPSED_TODOS_KEY);
    if (saved) {
      const collapsedArray = JSON.parse(saved);
      collapsedArray.forEach(id => coreCollapsedTodos.add(id));
    }
  } catch (error) {
    console.error('加载折叠状态失败:', error);
  }
}

// 从localStorage加载已知的父项ID
function loadKnownParentIds() {
  try {
    const saved = localStorage.getItem(PARENT_TODOS_KEY);
    if (saved) {
      return new Set(JSON.parse(saved));
    }
  } catch (error) {
    console.error('加载父项ID失败:', error);
  }
  return new Set();
}

// 清理无效的折叠状态ID
function cleanupCollapsedState(validTodoIds) {
  const validIds = new Set(validTodoIds);
  const toRemove = [];

  coreCollapsedTodos.forEach(id => {
    if (!validIds.has(id)) {
      toRemove.push(id);
    }
  });

  toRemove.forEach(id => coreCollapsedTodos.delete(id));

  if (toRemove.length > 0) {
    saveCollapsedState();
  }
}

// 清理无效的父项ID
function cleanupParentIds(validParentIds) {
  const knownParentIds = loadKnownParentIds();
  const validIds = new Set(validParentIds);
  const cleanedIds = new Set();

  knownParentIds.forEach(id => {
    if (validIds.has(id)) {
      cleanedIds.add(id);
    }
  });

  saveParentIds(cleanedIds);
}

// 自动展开父项及其祖先项以显示新添加的子项
async function expandToShowNewChild(parentId) {
  try {
    // 获取层级数据
    const hierarchicalTodos = await dataManager.getHierarchicalTodos();

    // 查找父项及其所有祖先项
    const ancestorIds = [];

    function findAncestors(todos, targetId, currentPath = []) {
      for (const todo of todos) {
        const newPath = [...currentPath, todo.id];

        if (todo.id === targetId) {
          // 找到目标，记录路径上的所有祖先
          ancestorIds.push(...currentPath);
          return true;
        }

        if (todo.children && todo.children.length > 0) {
          if (findAncestors(todo.children, targetId, newPath)) {
            return true;
          }
        }
      }
      return false;
    }

    findAncestors(hierarchicalTodos, parentId);

    // 展开所有祖先项和父项本身
    ancestorIds.forEach(ancestorId => {
      coreCollapsedTodos.delete(ancestorId);
      recentlyExpandedParents.add(ancestorId);
    });
    coreCollapsedTodos.delete(parentId);
    recentlyExpandedParents.add(parentId);

    // 保存折叠状态
    saveCollapsedState();

  } catch (error) {
    console.error('展开父项失败:', error);
  }
}

// 更新所有展开按钮的状态
function updateExpandButtonStates() {
  document.querySelectorAll('.todo-expand-btn').forEach(btn => {
    const todoItem = btn.closest('.todo-item');
    if (!todoItem) return;

    const todoId = todoItem.getAttribute('data-id');
    const isCollapsed = coreCollapsedTodos.has(todoId);

    if (isCollapsed) {
      btn.setAttribute('data-expanded', 'false');
      btn.innerHTML = '<span style="font-size: 14px; color: #666;">▶</span>';
      btn.title = window.i18n ? window.i18n.t('tooltip.expand') : '展开子项';
    } else {
      btn.setAttribute('data-expanded', 'true');
      btn.innerHTML = '<span style="font-size: 14px; color: #666;">▼</span>';
      btn.title = window.i18n ? window.i18n.t('tooltip.collapse') : '折叠子项';
    }
  });
}

// 滚动到新添加的子项位置
function scrollToNewChild(parentId) {
  const parentElement = document.querySelector(`[data-id="${parentId}"]`);
  if (!parentElement) return;

  // 查找父项后面的第一个子项（level比父项大1）
  const parentLevel = parseInt(parentElement.getAttribute('data-level'));
  let nextSibling = parentElement.nextElementSibling;

  while (nextSibling) {
    const siblingLevel = parseInt(nextSibling.getAttribute('data-level'));

    if (siblingLevel === parentLevel + 1) {
      // 找到第一个子项，滚动到它
      nextSibling.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      // 添加高亮效果
      nextSibling.style.backgroundColor = '#e3f2fd';
      setTimeout(() => {
        nextSibling.style.backgroundColor = '';
      }, 2000);

      break;
    } else if (siblingLevel <= parentLevel) {
      // 如果遇到同级或更高级的项目，说明没有子项
      break;
    }

    nextSibling = nextSibling.nextElementSibling;
  }
}

// 切换子项可见性 - 添加防抖机制
function toggleChildrenVisibility(parentId) {
  // 防止快速连续点击
  if (coreIsUpdating) {
    return;
  }

  const expandBtn = document.querySelector(`[data-id="${parentId}"] .todo-expand-btn`);
  if (!expandBtn) return;

  coreIsUpdating = true;

  const isExpanded = expandBtn.getAttribute('data-expanded') === 'true';

  if (isExpanded) {
    // 折叠：隐藏所有子项
    coreCollapsedTodos.add(parentId);
    expandBtn.setAttribute('data-expanded', 'false');
    expandBtn.innerHTML = '<span style="font-size: 14px; color: #666;">▶</span>';
    expandBtn.title = '展开子项';
  } else {
    // 展开：显示直接子项
    coreCollapsedTodos.delete(parentId);
    expandBtn.setAttribute('data-expanded', 'true');
    expandBtn.innerHTML = '<span style="font-size: 14px; color: #666;">▼</span>';
    expandBtn.title = '折叠子项';
  }

  // 保存折叠状态
  saveCollapsedState();

  // 更新子项可见性
  updateChildrenVisibility();

  // 短暂延迟后解除锁定
  setTimeout(() => {
    coreIsUpdating = false;
  }, 100);
}

// 简化的子项可见性更新 - 只处理两层级，同时考虑过滤状态
function updateChildrenVisibility() {
  const allTodos = document.querySelectorAll('.todo-item');

  allTodos.forEach(todoItem => {
    const level = parseInt(todoItem.getAttribute('data-level'));
    const statusBtn = todoItem.querySelector('.todo-status-btn');
    const isCompleted = statusBtn && statusBtn.classList.contains('completed');

    // 首先检查是否应该根据过滤器显示
    let shouldShowByFilter = false;
    if (currentFilter === 'all') {
      shouldShowByFilter = true;
    } else if (currentFilter === 'pending' && !isCompleted) {
      shouldShowByFilter = true;
    } else if (currentFilter === 'completed' && isCompleted) {
      shouldShowByFilter = true;
    }

    if (!shouldShowByFilter) {
      // 如果过滤器不允许显示，直接隐藏
      todoItem.style.display = 'none';
      todoItem.classList.add('todo-hidden');
      return;
    }

    // 过滤器允许显示，再检查折叠状态
    if (level === 0) {
      // 顶级项目，如果过滤器允许就显示
      todoItem.style.display = 'flex';
      todoItem.classList.remove('todo-hidden');
    } else if (level === 1) {
      // 子项，检查父项是否折叠
      const parentId = todoItem.getAttribute('data-parent-id');
      if (parentId && coreCollapsedTodos.has(parentId)) {
        todoItem.style.display = 'none';
        todoItem.classList.add('todo-hidden');
      } else {
        todoItem.style.display = 'flex';
        todoItem.classList.remove('todo-hidden');
      }
    }
  });
}

// 处理待办事项删除（包括级联删除确认）
async function handleTodoDelete(todo) {
  const hasChildren = todo.children && todo.children.length > 0;

  if (hasChildren) {
    // 计算总的子项数量（包括嵌套子项）
    const totalChildren = countAllChildren(todo);

    showDialog(
      window.i18n ? window.i18n.t('dialog.confirmDelete') : '确认删除',
      window.i18n ? window.i18n.t('dialog.deleteWithChildren', {count: totalChildren}) : `这个待办事项包含 ${totalChildren} 个子项。删除后，所有子项也将被删除。\n\n确定要删除吗？此操作无法撤销。`,
      window.i18n ? window.i18n.t('dialog.cancel') : '取消',
      window.i18n ? window.i18n.t('dialog.deleteAll') : '删除全部',
      async () => {
        try {
          // 显示删除进度
          showSnackbar(window.i18n ? window.i18n.t('message.deletingItems', {count: totalChildren + 1}) : `正在删除 ${totalChildren + 1} 个项目...`);

          // 添加延迟让用户看到提示
          await new Promise(resolve => setTimeout(resolve, 100));

          const result = await dataManager.deleteTodo(todo.id);

          if (result && result.success) {
            await loadExistingTodos(); // 重新加载列表
            showSnackbar(window.i18n ? window.i18n.t('message.todosDeleted', {count: result.deletedCount}) : `已删除 ${result.deletedCount} 个待办事项`);
            await updateStatsDisplay();
          } else {
            showSnackbar(window.i18n ? window.i18n.t('message.deleteFailed') : '删除待办事项失败');
          }
        } catch (error) {
          console.error('删除待办事项失败:', error);
          showSnackbar(window.i18n ? window.i18n.t('message.deleteFailed') : '删除待办事项失败');
        }
      }
    );
  } else {
    // 没有子项，正常删除
    showDialog(
      window.i18n ? window.i18n.t('dialog.confirmDelete') : '确认删除',
      window.i18n ? window.i18n.t('dialog.deleteMessage') : '确定要删除这个待办事项吗？此操作无法撤销。',
      window.i18n ? window.i18n.t('dialog.cancel') : '取消',
      window.i18n ? window.i18n.t('dialog.delete') : '删除',
      async () => {
        try {
          const result = await dataManager.deleteTodo(todo.id);

          if (result && result.success) {
            await loadExistingTodos(); // 重新加载列表
            showSnackbar(window.i18n ? window.i18n.t('message.todoDeleted') : '待办事项已删除');
            await updateStatsDisplay();
          } else {
            showSnackbar(window.i18n ? window.i18n.t('message.deleteFailed') : '删除待办事项失败');
          }
        } catch (error) {
          console.error('删除待办事项失败:', error);
          showSnackbar(window.i18n ? window.i18n.t('message.deleteFailed') : '删除待办事项失败');
        }
      }
    );
  }
}

// 递归计算所有子项数量
function countAllChildren(todo) {
  let count = 0;
  if (todo.children && todo.children.length > 0) {
    count += todo.children.length;
    todo.children.forEach(child => {
      count += countAllChildren(child);
    });
  }
  return count;
}

// 优化的子项状态更新 - 使用批处理和缓存
async function updateChildrenCompletion(parentId, completed) {
  try {
    // 获取层级数据（缓存）
    const hierarchicalTodos = await dataManager.getHierarchicalTodos();

    // 收集所有需要更新的子项ID
    const childrenToUpdate = [];

    function collectChildren(todos, targetParentId, found = false) {
      for (const todo of todos) {
        if (found) {
          // 如果已经找到目标父项，收集所有后续的子项
          childrenToUpdate.push(todo.id);
          if (todo.children && todo.children.length > 0) {
            collectChildren(todo.children, null, true);
          }
        } else if (todo.id === targetParentId) {
          // 找到目标父项，开始收集其子项
          if (todo.children && todo.children.length > 0) {
            collectChildren(todo.children, null, true);
          }
          return true;
        } else if (todo.children && todo.children.length > 0) {
          // 继续在子项中查找
          if (collectChildren(todo.children, targetParentId, false)) {
            return true;
          }
        }
      }
      return false;
    }

    collectChildren(hierarchicalTodos, parentId);

    if (childrenToUpdate.length === 0) return;

    // 批量更新 - 使用Promise.all但限制并发数
    const batchSize = 10; // 限制并发数避免卡死
    const batches = [];

    for (let i = 0; i < childrenToUpdate.length; i += batchSize) {
      const batch = childrenToUpdate.slice(i, i + batchSize);
      batches.push(batch);
    }

    // 逐批处理，避免一次性处理太多
    for (const batch of batches) {
      // 先更新UI，让用户看到变化
      batch.forEach((childId, index) => {
        setTimeout(() => {
          updateChildUIStatus(childId, completed);
        }, index * 50); // 每个子项延迟50ms，创建波浪效果
      });

      // 然后更新数据库
      await Promise.all(
        batch.map(childId => dataManager.updateTodo(childId, { completed }))
      );

      // 在批次之间添加小延迟，让UI有机会响应
      if (batches.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

  } catch (error) {
    console.error('更新子项状态失败:', error);
    throw error;
  }
}

// 更新子项UI状态
function updateChildUIStatus(todoId, completed) {
  const todoItem = document.querySelector(`.todo-item[data-id="${todoId}"]`);
  if (!todoItem) return;

  const statusBtn = todoItem.querySelector('.todo-status-btn');
  const todoContent = todoItem.querySelector('.todo-content');

  if (!statusBtn || !todoContent) return;

  // 添加更新动画
  todoItem.classList.add('child-updating');

  if (completed) {
    // 标记为完成
    statusBtn.classList.remove('pending');
    statusBtn.classList.add('completed');
    statusBtn.title = '标记为未完成';
    todoContent.classList.add('completed');

    // 更新状态指示器
    const indicator = statusBtn.querySelector('.status-indicator');
    if (indicator) {
      indicator.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
    }
  } else {
    // 标记为待办
    statusBtn.classList.remove('completed');
    statusBtn.classList.add('pending');
    statusBtn.title = '标记为已完成';
    todoContent.classList.remove('completed');

    // 更新状态指示器
    const indicator = statusBtn.querySelector('.status-indicator');
    if (indicator) {
      indicator.innerHTML = '<div class="pending-dot"></div>';
    }
  }

  // 移除更新动画
  setTimeout(() => {
    todoItem.classList.remove('child-updating');
  }, 300);
}

// 检查并更新父项状态
async function checkAndUpdateParentStatus(todoId, childCompleted) {
  // 检查是否启用了父项自动同步
  if (!isAutoParentSyncEnabled()) {
    return;
  }

  try {
    // 获取层级数据
    const hierarchicalTodos = await dataManager.getHierarchicalTodos();

    // 查找当前todo的父项
    function findParent(todos, targetId, parent = null) {
      for (const todo of todos) {
        if (todo.id === targetId) {
          return parent;
        }
        if (todo.children && todo.children.length > 0) {
          const found = findParent(todo.children, targetId, todo);
          if (found) return found;
        }
      }
      return null;
    }

    const parentTodo = findParent(hierarchicalTodos, todoId);
    if (!parentTodo || !parentTodo.children || parentTodo.children.length === 0) {
      return; // 没有父项或父项没有子项
    }

    // 检查所有兄弟项的状态
    const allChildrenCompleted = parentTodo.children.every(child => {
      // 如果是当前修改的子项，使用新状态
      if (child.id === todoId) {
        return childCompleted;
      }
      // 否则检查UI中的状态
      const childElement = document.querySelector(`.todo-item[data-id="${child.id}"]`);
      const statusBtn = childElement?.querySelector('.todo-status-btn');
      return statusBtn?.classList.contains('completed') || false;
    });

    // 如果所有子项都完成了，自动完成父项
    if (allChildrenCompleted && !parentTodo.completed) {
      await dataManager.updateTodo(parentTodo.id, { completed: true });
      updateChildUIStatus(parentTodo.id, true);

      // 递归检查祖父项
      await checkAndUpdateParentStatus(parentTodo.id, true);
    }
    // 如果有子项未完成，且父项是完成状态，则取消父项完成
    else if (!allChildrenCompleted && parentTodo.completed) {
      await dataManager.updateTodo(parentTodo.id, { completed: false });
      updateChildUIStatus(parentTodo.id, false);

      // 递归检查祖父项
      await checkAndUpdateParentStatus(parentTodo.id, false);
    }

  } catch (error) {
    console.error('检查父项状态失败:', error);
  }
}

// 递归展平层级结构，将所有todo项作为独立卡片
// 确保子项紧跟在父项后面
function flattenTodos(todos, result = []) {
  todos.forEach(todo => {
    // 先添加父项
    result.push(todo);
    // 然后立即添加其子项（如果有的话）
    if (todo.children && todo.children.length > 0) {
      flattenTodos(todo.children, result);
    }
  });
  return result;
}

// 加载现有待办事项（支持层级结构）
async function loadExistingTodos() {
  try {
    const hierarchicalTodos = await dataManager.getHierarchicalTodos();
    const todoList = document.querySelector('.todo-list');
    const emptyState = document.getElementById('empty-state');

    if (!todoList) return;

    // 清空现有列表
    todoList.innerHTML = '';

    // 展平层级结构，获取所有todo项
    const flatTodos = flattenTodos(hierarchicalTodos);

    // 检查是否有待办事项
    if (flatTodos.length === 0) {
      // 显示空状态，隐藏待办列表
      if (emptyState) {
        emptyState.style.display = 'flex';
      }
      todoList.style.display = 'none';
      return;
    } else {
      // 隐藏空状态，显示待办列表
      if (emptyState) {
        emptyState.style.display = 'none';
      }
      todoList.style.display = 'block';
    }

    // 清理无效的折叠状态ID和父项ID
    const validTodoIds = flatTodos.map(todo => todo.id);
    const validParentIds = flatTodos.filter(todo => todo.children && todo.children.length > 0).map(todo => todo.id);
    cleanupCollapsedState(validTodoIds);
    cleanupParentIds(validParentIds);

    // 为新的父项设置默认折叠状态
    const currentParentIds = new Set();
    flatTodos.forEach(todo => {
      if (todo.children && todo.children.length > 0) {
        currentParentIds.add(todo.id);
      }
    });

    // 获取之前已知的父项ID
    const knownParentIds = loadKnownParentIds();

    // 为新的父项（之前从未见过的）设置默认折叠状态
    currentParentIds.forEach(parentId => {
      if (!knownParentIds.has(parentId)) {
        // 这是一个新的父项
        // 如果它不在最近展开的列表中，设置为默认折叠
        if (!recentlyExpandedParents.has(parentId)) {
          coreCollapsedTodos.add(parentId);
        }
      }
    });

    // 保存当前的父项ID列表
    saveParentIds(currentParentIds);

    // 添加所有todo项到UI（作为独立卡片）
    flatTodos.forEach(todo => {
      addTodoToUI(todo);
    });

    // 更新展开按钮状态
    updateExpandButtonStates();

    // 更新子项可见性
    updateChildrenVisibility();

    // 清理最近展开的父项列表（避免影响下次加载）
    setTimeout(() => {
      recentlyExpandedParents.clear();
    }, 1000);

  } catch (error) {
    console.error('加载待办事项失败:', error);
  }
}

// 初始化优先级选择器
function initPrioritySelector() {
  const prioritySegment = document.getElementById('priority-segment');
  const priorityInput = document.getElementById('todo-priority');
  
  if (prioritySegment && priorityInput) {
    const highSegment = document.getElementById('priority-high');
    const mediumSegment = document.getElementById('priority-medium');
    const lowSegment = document.getElementById('priority-low');
    
    highSegment.addEventListener('click', () => {
      priorityInput.value = 'high';
    });
    
    mediumSegment.addEventListener('click', () => {
      priorityInput.value = 'medium';
    });
    
    lowSegment.addEventListener('click', () => {
      priorityInput.value = 'low';
    });
  }
}

// 设置已有待办项的事件（复选框事件已在addTodoToUI中处理）
function setupExistingTodoEvents() {
  // 这个函数现在主要用于其他事件处理
  // 复选框事件已经在addTodoToUI中统一处理
}

// 获取分类显示名称和样式
function getCategoryDisplayName(category) {
  if (window.i18n) {
    return window.i18n.t(`todo.category.${category}`) || category;
  }

  // 回退到硬编码的中文名称
  const categoryNames = {
    'general': '常规',
    'work': '工作',
    'personal': '个人',
    'life': '人生',
    'yearly': '年度',
    'monthly': '月度',
    'daily': '日常'
  };
  return categoryNames[category] || category;
}