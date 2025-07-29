// 加载用户信息
async function loadUserInfo() {
  try {
    const userInfo = await dataManager.getUserInfo();

    if (!userInfo) {
      console.error('无法加载用户信息');
      return;
    }

    // 更新UI
    const userName = document.querySelector('.user-name');
    const userEmail = document.querySelector('.user-email');

    if (userName) {
      userName.textContent = userInfo.name;
    }

    if (userEmail) {
      userEmail.textContent = userInfo.email;
    }

    // 更新用户页面的表单
    const userNameField = document.getElementById('user-name');
    const userEmailField = document.getElementById('user-email');

    if (userNameField) {
      userNameField.value = userInfo.name;
    }

    if (userEmailField) {
      userEmailField.value = userInfo.email;
    }

    // 如果有头像URL，可以在这里设置头像
    if (userInfo.avatar) {
      const userAvatar = document.querySelector('.user-avatar');
      if (userAvatar) {
        // 替换默认的图标为图片
        userAvatar.innerHTML = `<img src="${userInfo.avatar}" alt="${userInfo.name}" />`;
      }
    }
  } catch (error) {
    // 用户功能正在开发中
    console.log('用户功能正在开发中，使用默认用户信息');
  }
}