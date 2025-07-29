// 刷新待办页面数据，确保与其他页面同步
async function refreshTodoPageData() {
  try {
    // 重新加载待办页面的数据
    await loadExistingTodos();

    // 重新应用当前的过滤器
    if (typeof currentFilter !== 'undefined') {
      filterTodos(currentFilter);
    }
  } catch (error) {
    console.error('刷新待办页面数据失败:', error);
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