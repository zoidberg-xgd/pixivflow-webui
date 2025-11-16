# PixivFlow WebUI Frontend

PixivFlow 的现代化、响应式 Web 界面 - 强大的 Pixiv 内容下载器。

> **English Version**: See [README_EN.md](./README_EN.md) for the English translation.

**独立前端项目**：这是一个独立的前端项目，与后端完全分离。后端 API 服务器是独立的 npm 包，可以通过 HTTP API 与前端通信。

## 📊 平台支持状态

| 平台 | 状态 | 说明 |
|------|------|------|
| 🌐 **Web UI** | ✅ **可用** | 完全可用，推荐使用 |
| 🖥️ **Electron 桌面应用** | ❌ **未实现** | 功能仍在开发中，尚未完成 |
| 🤖 **Android 应用** | ❌ **未实现** | 功能仍在开发中，尚未完成 |
| 📱 **iOS 应用** | ❌ **未实现** | 功能仍在开发中，尚未完成 |

> **建议**：目前请使用 **Web UI** 版本，这是最稳定和功能最完整的版本。

## 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [移动应用](#移动应用)
- [文档](#文档)
- [项目结构](#项目结构)
- [贡献指南](#贡献指南)

## 功能特性

- **现代化 UI**：基于 Ant Design 构建的简洁直观界面
- **URL 直接下载**：无需配置，通过 URL 或作品 ID 直接下载
- **国际化支持**：完整支持英文和中文
- **响应式设计**：在桌面、平板和移动设备上完美运行
- **实时更新**：实时下载进度和状态更新
- **高级搜索**：强大的筛选和搜索功能
- **统计信息**：全面的下载统计和分析
- **类型安全**：完整的 TypeScript 支持，提供更好的开发体验
- **无障碍访问**：符合 WCAG 2.1 无障碍标准

## 技术栈

- **React 18** - UI 库
- **TypeScript** - 类型安全的 JavaScript
- **Ant Design 5** - UI 组件库
- **React Router 6** - 客户端路由
- **React Query** - 服务器状态管理
- **Axios** - HTTP 客户端
- **i18next** - 国际化框架
- **Vite** - 构建工具和开发服务器
- **Socket.IO** - 实时通信

## 项目结构

```
pixivflow-webui/
├── src/
│   ├── components/          # React 组件
│   ├── pages/              # 页面组件
│   ├── services/           # API 服务
│   ├── hooks/              # 自定义 Hooks
│   ├── stores/             # 状态管理
│   ├── utils/              # 工具函数
│   ├── locales/            # 国际化翻译
│   └── types/              # TypeScript 类型
├── electron/               # Electron 主进程 (⚠️ 开发中，未完成)
├── e2e/                    # E2E 测试
├── docs/                   # 文档
└── public/                 # 静态资源
```

## 快速开始

### 前置要求

- Node.js 18+ 和 npm
- 运行中的后端 API 服务器（需要先安装并启动后端：`npm install -g pixivflow && pixivflow webui`）

### 安装步骤

1. 克隆仓库：
```bash
git clone https://github.com/zoidberg-xgd/pixivflow-webui.git
cd pixivflow-webui
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm run dev
```

4. 在浏览器中打开 `http://localhost:5173`

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录，可以部署到任何静态文件服务器（如 Nginx、CDN 等）。

### 与后端集成

前端通过 HTTP API 与后端通信。默认情况下：
- 开发模式：连接到 `http://localhost:3001`（可通过 `VITE_DEV_API_PORT` 环境变量配置）
- 生产模式：连接到当前域名（可通过 `VITE_API_URL` 环境变量配置）

更多开发相关的信息，请参阅 [开发指南](./docs/DEVELOPMENT_GUIDE.md)。

## 移动应用

> ⚠️ **重要提示**：Android 和 iOS 应用功能目前**尚未实现**，仍在开发中。以下文档仅供参考，实际功能可能不完整或存在已知问题。

PixivFlow 计划支持构建为 Android 和 iOS 原生应用，但目前仍在开发中。

### Android 应用方案

#### 方案 1: 仅前端 APK (推荐)

适合有固定服务器或局域网使用的场景。

```bash
# 使用自动化脚本 (macOS/Linux)
./build-android.sh

# 或使用 npm 脚本
npm install
npm run android:init      # 首次构建时
npm run android:build:debug
```

- **APK 大小**: ~10MB
- **需要**: 外部后端服务器
- **适用**: 个人使用,局域网环境

#### 方案 2: 全栈 APK (包含前后端)

完全独立运行,无需外部服务器。

```bash
# 使用全栈构建脚本
./build-android-fullstack.sh
```

- **APK 大小**: ~50MB
- **需要**: 无,完全离线运行
- **适用**: 完全移动端使用

构建完成后,APK 文件位于项目根目录,可直接安装到 Android 设备。

### iOS 应用

```bash
npm install
npm run build
npm run ios:sync
npm run ios:open  # 在 Xcode 中打开
```

### 详细文档

- 📱 [移动应用快速入门](./docs/MOBILE_QUICK_START.md) - 快速构建指南
- 🤖 [Android 构建指南](./docs/ANDROID_BUILD_GUIDE.md) - 仅前端 APK 构建
- 🚀 [Android 全栈指南](./docs/ANDROID_FULL_STACK_GUIDE.md) - 包含前后端的完整应用
- 📖 [全栈应用使用说明](./docs/ANDROID_FULLSTACK_USAGE.md) - 使用和故障排除

### 前置要求

**Android:**
- Node.js 18+
- Java JDK 17+
- Android Studio 和 Android SDK

**iOS:**
- macOS 系统
- Xcode 14+
- Apple 开发者账号 (用于真机测试和发布)

## 文档

完整的文档位于 [`docs/`](./docs/) 目录：

### 开发文档

- [开发指南](./docs/DEVELOPMENT_GUIDE.md) - 开发环境设置和工作流程
- [组件使用指南](./docs/COMPONENT_GUIDE.md) - 通用组件使用方法
- [E2E 测试指南](./docs/E2E_TESTING_GUIDE.md) - 端到端测试指南
- [性能优化指南](./docs/PERFORMANCE_GUIDE.md) - 性能优化策略

### 构建文档

- [构建指南](./BUILD_GUIDE.md) - Electron 应用构建说明 (❌ 未实现)
- [移动应用快速入门](./docs/MOBILE_QUICK_START.md) - Android/iOS 应用构建 (❌ 未实现)
- [Android 构建指南](./docs/ANDROID_BUILD_GUIDE.md) - Android 详细构建说明 (❌ 未实现)

## 贡献指南

我们欢迎贡献！请参阅 [开发指南](./docs/DEVELOPMENT_GUIDE.md) 了解详细信息：

- 开发环境设置
- 代码风格和约定
- 开发工作流程
- 测试指南
- 提交 Pull Request

## 许可证

本项目采用 MIT 许可证。详细信息请参阅项目根目录的 LICENSE 文件（如果存在）。

## 致谢

- [Ant Design](https://ant.design/) - UI 组件库
- [React Query](https://tanstack.com/query) - 数据获取和缓存
- [i18next](https://www.i18next.com/) - 国际化框架
- [Vite](https://vitejs.dev/) - 构建工具

## 支持

遇到问题或需要帮助：

- 在 GitHub 上提交 Issue
- 查阅现有文档
- 查看已关闭的 Issue 寻找解决方案

---
