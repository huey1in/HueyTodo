# HueyTodo

[![GitHub repo](https://img.shields.io/badge/GitHub-hueytodo-blue?logo=github)](https://github.com/1ingg/hueytodo)
[![License](https://img.shields.io/badge/License-ISC-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![Electron](https://img.shields.io/badge/Electron-Desktop%20App-9feaf9.svg)](https://www.electronjs.org/)

一个现代化的桌面待办事项应用，基于 Electron 构建。

**仓库地址**: https://github.com/huey1in/HueyTodo.git

## 特性

- **智能待办管理** - 支持层级结构、优先级设置
- **今日待办** - 专注于当天任务，提高效率
- **数据统计** - 可视化展示任务完成情况
- **智能提醒** - 桌面通知，不错过重要任务
- **多语言支持** - 中英文界面切换
- **主题定制** - 多种主题色彩选择
- **本地存储** - 数据安全，离线可用

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 克隆项目

```bash
git clone https://github.com/huey1in/HueyTodo.git
cd hueytodo
```

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建应用

```bash
# 构建所有平台
npm run build

# 构建 Windows 版本
npm run build:win

# 构建 macOS 版本
npm run build:mac

# 构建 Linux 版本
npm run build:linux
```

## 项目结构

```
Hueytodo/
├── src/                          # 源代码目录
│   ├── main/                     # 主进程代码
│   │   ├── main.js               # 主进程入口
│   │   └── preload.js            # 预加载脚本
│   ├── renderer/                 # 渲染进程代码
│   │   ├── index.html            # 主页面
│   │   ├── css/                  # 样式文件
│   │   ├── js/                   # JavaScript模块
│   │   │   ├── core/             # 核心功能
│   │   │   ├── pages/            # 页面控制器
│   │   │   ├── services/         # 业务服务
│   │   │   ├── utils/            # 工具函数
│   │   │   └── config/           # 配置文件
│   │   └── assets/               # 静态资源
├── build/                        # 构建配置
└── docs/                         # 项目文档
```

## 技术栈

- **框架**: Electron
- **UI库**: SoberUI
- **构建工具**: electron-builder

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库 ([https://github.com/huey1in/HueyTodo.git](https://github.com/huey1in/HueyTodo.git))
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 ISC 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 作者

**1ing** - [2926957031@qq.com](mailto:2926957031@qq.com)

项目链接: [https://github.com/1ingg/hueytodo](https://github.com/1ingg/hueytodo)
