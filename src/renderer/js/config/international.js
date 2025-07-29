// 初始化国际化功能
async function initI18n() {
  // 等待国际化管理器初始化完成
  if (window.i18n) {
    await window.i18n.init();

    // 初始化语言选择器
    const languagePicker = document.getElementById('language-picker');
    if (languagePicker) {
      // 设置当前语言
      languagePicker.value = window.i18n.getCurrentLanguage();

      // 监听语言变化
      languagePicker.addEventListener('change', async (event) => {
        const newLanguage = event.target.value;
        const success = await window.i18n.changeLanguage(newLanguage);
        if (success) {
          // 更新动态生成的内容
          updateDynamicI18nContent();
          showSnackbar(window.i18n.t('message.languageChanged'));
        }
      });
    }
  }
}

// 更新动态生成内容的国际化
function updateDynamicI18nContent() {
  // 更新展开按钮的状态和提示
  updateExpandButtonStates();

  // 重新加载待办列表以更新所有动态内容
  loadExistingTodos();
}

// 初始化侧边栏收起功能
function initSidebarToggle() {
  const toggleBtn = document.getElementById('toggle-sidebar');
  const sidebar = document.querySelector('.sidebar');
  const toggleIcon = document.querySelector('.toggle-icon');

  if (!toggleBtn || !sidebar || !toggleIcon) {
    console.warn('侧边栏元素未找到');
    return;
  }

  // 更新侧边栏状态的函数
  function updateSidebarState(isCollapsed) {
    // 更新侧边栏类名
    if (isCollapsed) {
      sidebar.classList.add('collapsed');
    } else {
      sidebar.classList.remove('collapsed');
    }

    // 更新切换按钮图标
    toggleIcon.src = isCollapsed
      ? 'assets/icons/sidebar-toggle-collapsed.svg'
      : 'assets/icons/sidebar-toggle.svg';

    // 更新导航图标显示状态（CSS已经处理了这部分，不需要手动设置opacity）

    // 保存状态到本地存储
    localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
  }

  // 检查本地存储中的侧边栏状态并应用
  const savedState = localStorage.getItem('sidebarCollapsed');
  const isSidebarCollapsed = savedState === 'true';

  // 应用保存的状态
  updateSidebarState(isSidebarCollapsed);

  // 添加点击事件监听器
  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    // 获取当前状态并切换
    const isCurrentlyCollapsed = sidebar.classList.contains('collapsed');
    const willBeCollapsed = !isCurrentlyCollapsed;

    // 更新状态
    updateSidebarState(willBeCollapsed);
  });
}

// 初始化待办搜索功能
function initTodoSearch() {
  const searchInput = document.getElementById('todo-search');

  if (!searchInput) return;

  // 搜索输入事件（防抖处理）
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const searchTerm = e.target.value.toLowerCase().trim();
      searchTodos(searchTerm);
    }, 300); // 300ms防抖
  });

  // 清除搜索时重置显示
  searchInput.addEventListener('clear', () => {
    searchTodos('');
  });
}

// 搜索待办项
function searchTodos(searchTerm) {
  const todoItems = document.querySelectorAll('.todo-item');
  let visibleCount = 0;
  let totalCount = todoItems.length;

  todoItems.forEach(item => {
    const shouldShow = matchesSearch(item, searchTerm);

    if (shouldShow) {
      item.style.display = '';
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
      visibleCount++;
    } else {
      item.style.display = 'none';
      item.style.opacity = '0';
      item.style.transform = 'translateY(-10px)';
    }
  });

  // 显示搜索结果统计
  if (searchTerm) {
    console.log(`搜索 "${searchTerm}" 找到 ${visibleCount} / ${totalCount} 个待办项`);
  }
}

// 检查待办项是否匹配搜索条件
function matchesSearch(todoItem, searchTerm) {
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

// 一言缓存
let internationalHitokotoCache = {
  content: null,
  timestamp: 0,
  duration: 10 * 60 * 1000 // 10分钟缓存
};

// 初始化问候语和一言功能
function initGreetingAndHitokoto() {
  updateGreeting();
  loadHitokoto();

  // 每分钟检查一次问候语
  setInterval(updateGreeting, 60 * 1000);

  // 每小时更新一次一言
  setInterval(loadHitokoto, 60 * 60 * 1000);
}

// 更新时间问候语
function updateGreeting() {
  const greetingElement = document.querySelector('.greeting-time');
  const emojiElement = document.querySelector('.greeting-emoji');

  if (!greetingElement || !emojiElement) return;

  const now = new Date();
  const hour = now.getHours();

  let greetingKey, emoji;

  if (hour >= 5 && hour < 12) {
    greetingKey = 'greeting.morning';
    emoji = '🌅';
  } else if (hour >= 12 && hour < 14) {
    greetingKey = 'greeting.noon';
    emoji = '☀️';
  } else if (hour >= 14 && hour < 18) {
    greetingKey = 'greeting.afternoon';
    emoji = '🌤️';
  } else if (hour >= 18 && hour < 22) {
    greetingKey = 'greeting.evening';
    emoji = '🌆';
  } else {
    greetingKey = 'greeting.night';
    emoji = '🌙';
  }

  // 获取新的问候语文本
  let newGreetingText;
  if (window.i18n) {
    newGreetingText = window.i18n.t(greetingKey);
  } else {
    // 默认中文
    const greetings = {
      'greeting.morning': '早上好！',
      'greeting.noon': '中午好！',
      'greeting.afternoon': '下午好！',
      'greeting.evening': '晚上好！',
      'greeting.night': '夜深了！'
    };
    newGreetingText = greetings[greetingKey];
  }

  // 检查是否需要更新
  if (greetingElement.textContent === newGreetingText && emojiElement.textContent === emoji) {
    return;
  }

  // 添加淡出效果
  greetingElement.style.opacity = '0';
  emojiElement.style.opacity = '0';

  // 延迟更新内容并淡入
  setTimeout(() => {
    greetingElement.textContent = newGreetingText;
    emojiElement.textContent = emoji;

    greetingElement.style.opacity = '1';
    emojiElement.style.opacity = '1';
  }, 200);
}

// 打字效果函数
function typewriterEffect(element, text, speed = 50) {
  return new Promise((resolve) => {
    element.textContent = '';
    element.classList.add('typing');
    let index = 0;

    const timer = setInterval(() => {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
      } else {
        clearInterval(timer);
        element.classList.remove('typing');
        resolve();
      }
    }, speed);
  });
}

// 加载一言
async function loadHitokoto() {
  const hitokotoContent = document.querySelector('.hitokoto-content');
  const hitokotoLoading = document.querySelector('.hitokoto-loading');
  const hitokotoFrom = document.getElementById('hitokoto-from');
  const hitokotoAuthor = document.querySelector('.hitokoto-author');
  const hitokotoSource = document.querySelector('.hitokoto-source');

  if (!hitokotoContent) return;

  // 检查缓存
  const now = Date.now();
  if (internationalHitokotoCache.content && (now - internationalHitokotoCache.timestamp) < internationalHitokotoCache.duration) {
    // 使用缓存内容
    await typewriterEffect(hitokotoContent, internationalHitokotoCache.content.hitokoto, 60);

    // 更新来源信息
    if (hitokotoAuthor && hitokotoSource && hitokotoFrom) {
      if (internationalHitokotoCache.content.from_who) {
        hitokotoAuthor.textContent = internationalHitokotoCache.content.from_who;
      } else {
        hitokotoAuthor.textContent = '';
      }

      if (internationalHitokotoCache.content.from) {
        hitokotoSource.textContent = internationalHitokotoCache.content.from;
      } else {
        hitokotoSource.textContent = '';
      }

      if (internationalHitokotoCache.content.from_who || internationalHitokotoCache.content.from) {
        hitokotoFrom.style.display = 'block';
      }
    }
    return;
  }

  try {
    // 显示加载状态（直接显示，不使用打字效果）
    const loadingText = window.i18n ? window.i18n.t('hitokoto.loading') : '正在加载一言...';
    hitokotoContent.textContent = loadingText;
    if (hitokotoFrom) hitokotoFrom.style.display = 'none';
    if (hitokotoLoading) hitokotoLoading.style.display = 'inline';

    // 调用一言API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8秒超时

    const response = await fetch('https://international.v1.hitokoto.cn/?c=d&c=i&c=k&encode=json', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // 缓存数据
    internationalHitokotoCache.content = data;
    internationalHitokotoCache.timestamp = Date.now();

    // 隐藏加载动画
    if (hitokotoLoading) hitokotoLoading.style.display = 'none';

    // 使用打字效果显示一言内容
    await typewriterEffect(hitokotoContent, data.hitokoto, 60);

    // 更新来源信息
    if (hitokotoAuthor && hitokotoSource && hitokotoFrom) {
      if (data.from_who) {
        hitokotoAuthor.textContent = data.from_who;
      } else {
        hitokotoAuthor.textContent = '';
      }

      if (data.from) {
        hitokotoSource.textContent = data.from;
      } else {
        hitokotoSource.textContent = '';
      }

      // 只有在有作者或来源时才显示
      if (data.from_who || data.from) {
        hitokotoFrom.style.display = 'block';
      }
    }

  } catch (error) {
    console.warn('加载一言失败:', error);

    // 隐藏加载动画
    if (hitokotoLoading) hitokotoLoading.style.display = 'none';

    // 根据错误类型显示不同的处理
    if (error.name === 'AbortError') {
      console.log('一言请求超时，使用备用文案');
    } else if (error.message.includes('Failed to fetch')) {
      console.log('网络连接失败，使用备用文案');
    } else if (error.message.includes('403')) {
      console.log('一言API访问被拒绝，使用备用文案');
    } else {
      console.log('一言API响应异常，使用备用文案');
    }

    // 显示备用文案（使用打字效果，因为这是正式内容）
    const fallbackTexts = [
      '今天也要加油哦！',
      '每一个小目标都值得庆祝。',
      '专注当下，未来可期。',
      '进步不在于速度，而在于方向。',
      '今日事，今日毕。',
      '保持专注，你正在做得很好。',
      '每一步都是进步，每一天都是新的开始。',
      '相信自己，你比想象中更强大。'
    ];

    const randomText = fallbackTexts[Math.floor(Math.random() * fallbackTexts.length)];
    await typewriterEffect(hitokotoContent, randomText, 60);

    // 隐藏来源信息
    if (hitokotoFrom) hitokotoFrom.style.display = 'none';
  }
}