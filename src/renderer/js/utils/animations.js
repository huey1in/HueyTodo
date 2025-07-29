// 创建增强版爆炸粒子效果
function createExplosionEffect(element) {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // 创建主要粒子群
  const mainParticleCount = 15 + Math.floor(Math.random() * 10); // 15-25个主粒子
  const particles = [];

  // 粒子类型和动画类型
  const particleTypes = ['small', 'medium', 'large', 'star'];
  const animationTypes = ['anim-1', 'anim-2', 'anim-3'];
  const colors = [
    '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336',
    '#00BCD4', '#FFEB3B', '#E91E63', '#3F51B5', '#8BC34A'
  ];

  for (let i = 0; i < mainParticleCount; i++) {
    const particle = document.createElement('div');

    // 随机粒子类型
    const particleType = particleTypes[Math.floor(Math.random() * particleTypes.length)];
    const animationType = animationTypes[Math.floor(Math.random() * animationTypes.length)];
    particle.className = `explosion-particle ${particleType} ${animationType}`;

    // 更自然的随机分布
    const angle = (i / mainParticleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const distance = 40 + Math.random() * 80; // 40-120px
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    // 设置粒子初始位置
    particle.style.left = centerX + 'px';
    particle.style.top = centerY + 'px';
    particle.style.setProperty('--dx', dx + 'px');
    particle.style.setProperty('--dy', dy + 'px');

    // 随机颜色
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];

    document.body.appendChild(particle);
    particles.push(particle);
  }

  // 创建额外的小粒子群（更密集）
  const smallParticleCount = 20 + Math.floor(Math.random() * 15); // 20-35个小粒子

  for (let i = 0; i < smallParticleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'explosion-particle small anim-1';

    // 更随机的分布
    const angle = Math.random() * Math.PI * 2;
    const distance = 20 + Math.random() * 60; // 20-80px
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    // 添加一些随机偏移
    const offsetX = (Math.random() - 0.5) * 20;
    const offsetY = (Math.random() - 0.5) * 20;

    particle.style.left = (centerX + offsetX) + 'px';
    particle.style.top = (centerY + offsetY) + 'px';
    particle.style.setProperty('--dx', dx + 'px');
    particle.style.setProperty('--dy', dy + 'px');

    // 小粒子使用更亮的颜色
    const brightColors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
    particle.style.background = brightColors[Math.floor(Math.random() * brightColors.length)];

    document.body.appendChild(particle);
    particles.push(particle);

    // 小粒子延迟启动
    setTimeout(() => {
      if (particle.parentNode) {
        particle.style.opacity = '1';
      }
    }, Math.random() * 100);
  }

  // 创建闪烁星星效果
  createSparkleEffect(centerX, centerY);

  // 清理所有粒子
  setTimeout(() => {
    particles.forEach(particle => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    });
  }, 1200);
}

// 创建闪烁星星效果
function createSparkleEffect(centerX, centerY) {
  const sparkleCount = 8 + Math.floor(Math.random() * 6); // 8-14个星星

  for (let i = 0; i < sparkleCount; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle-effect';

    // 随机位置（在爆炸中心周围）
    const offsetX = (Math.random() - 0.5) * 100;
    const offsetY = (Math.random() - 0.5) * 100;

    sparkle.style.left = (centerX + offsetX) + 'px';
    sparkle.style.top = (centerY + offsetY) + 'px';

    // 随机延迟
    sparkle.style.animationDelay = (Math.random() * 0.3) + 's';

    document.body.appendChild(sparkle);

    // 清理星星
    setTimeout(() => {
      if (sparkle.parentNode) {
        sparkle.parentNode.removeChild(sparkle);
      }
    }, 600 + Math.random() * 200);
  }
}

// 触发任务完成动画 - 随机过渡效果
function animateTaskCompletion(todoItem) {
  return new Promise((resolve) => {
    // 随机选择一种过渡动画
    const animations = [
      'anim-fade-scale',
      'anim-slide-right',
      'anim-slide-left',
      'anim-flip-out',
      'anim-fly-up',
      'anim-spin-shrink',
      'anim-bounce-out',
      'anim-fold-up'
    ];

    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];

    // 获取动画持续时间
    const animationDurations = {
      'anim-fade-scale': 600,
      'anim-slide-right': 700,
      'anim-slide-left': 700,
      'anim-flip-out': 800,
      'anim-fly-up': 900,
      'anim-spin-shrink': 700,
      'anim-bounce-out': 1000,
      'anim-fold-up': 600
    };

    const duration = animationDurations[randomAnimation];

    // 1. 添加预备动画（轻微高亮）
    todoItem.style.transition = 'box-shadow 0.2s ease';
    todoItem.style.boxShadow = '0 0 20px rgba(76, 175, 80, 0.5)';

    // 2. 短暂延迟后开始主要动画
    setTimeout(() => {
      todoItem.classList.add(randomAnimation);

      // 同时触发下方任务上移动画
      setTimeout(() => {
        triggerSiblingSlideUp(todoItem);
      }, duration * 0.3); // 在主动画进行30%时开始上移

    }, 200);

    // 3. 动画完成后移除元素
    setTimeout(() => {
      if (todoItem.parentNode) {
        todoItem.parentNode.removeChild(todoItem);
      }
      resolve();
    }, duration + 200);
  });
}

// 触发后续任务上移动画
function triggerSiblingSlideUp(todoItem) {
  // 获取当前任务后面的所有任务
  let nextSibling = todoItem.nextElementSibling;
  const siblingElements = [];

  while (nextSibling) {
    if (nextSibling.classList.contains('today-todo-item')) {
      siblingElements.push(nextSibling);
    }
    nextSibling = nextSibling.nextElementSibling;
  }

  // 为后续任务添加上移动画
  siblingElements.forEach((sibling, index) => {
    const delay = index * 80; // 80ms间隔
    setTimeout(() => {
      sibling.classList.add('slide-up');

      setTimeout(() => {
        sibling.classList.remove('slide-up');
      }, 500);
    }, delay);
  });
}

// 创建弹跳效果
function createBounceEffect(element) {
  const bounceElements = [];
  const rect = element.getBoundingClientRect();

  // 创建几个小的弹跳元素
  for (let i = 0; i < 3; i++) {
    const bouncer = document.createElement('div');
    bouncer.style.position = 'absolute';
    bouncer.style.width = '6px';
    bouncer.style.height = '6px';
    bouncer.style.background = '#4CAF50';
    bouncer.style.borderRadius = '50%';
    bouncer.style.left = (rect.left + rect.width * Math.random()) + 'px';
    bouncer.style.top = (rect.top + rect.height * 0.5) + 'px';
    bouncer.style.zIndex = '1002';
    bouncer.style.pointerEvents = 'none';

    // 弹跳动画
    bouncer.style.animation = `bounce-${i + 1} 0.6s ease-out forwards`;

    document.body.appendChild(bouncer);
    bounceElements.push(bouncer);
  }

  // 清理弹跳元素
  setTimeout(() => {
    bounceElements.forEach(bouncer => {
      if (bouncer.parentNode) {
        bouncer.parentNode.removeChild(bouncer);
      }
    });
  }, 600);
}