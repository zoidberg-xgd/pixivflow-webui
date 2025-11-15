# PixivFlow WebUI Frontend

PixivFlow 的现代化、响应式 Web 界面 - 强大的 Pixiv 内容下载器。

> 📖 **English Version**: See [README_EN.md](./README_EN.md) for the English translation.

**独立前端项目**：这是一个独立的前端项目，与后端完全分离。后端 API 服务器是独立的 npm 包，可以通过 HTTP API 与前端通信。

## 📋 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [文档](#文档)
- [项目结构](#项目结构)
- [贡献指南](#贡献指南)

## ✨ 功能特性

- **现代化 UI**：基于 Ant Design 构建的简洁直观界面
- **国际化支持**：完整支持英文和中文
- **响应式设计**：在桌面、平板和移动设备上完美运行
- **实时更新**：实时下载进度和状态更新
- **高级搜索**：强大的筛选和搜索功能
- **统计信息**：全面的下载统计和分析
- **类型安全**：完整的 TypeScript 支持，提供更好的开发体验
- **无障碍访问**：符合 WCAG 2.1 无障碍标准

## 🛠 技术栈

- **React 18** - UI 库
- **TypeScript** - 类型安全的 JavaScript
- **Ant Design 5** - UI 组件库
- **React Router 6** - 客户端路由
- **React Query** - 服务器状态管理
- **Axios** - HTTP 客户端
- **i18next** - 国际化框架
- **Vite** - 构建工具和开发服务器
- **Socket.IO** - 实时通信

## 📁 项目结构

```
pixivflow-webui/
├── src/
│   ├── components/          # 可复用的 React 组件
│   │   ├── common/         # 通用组件
│   │   ├── forms/          # 表单组件
│   │   ├── tables/         # 表格组件
│   │   ├── modals/         # 模态框组件
│   │   ├── Layout/         # 布局组件
│   │   ├── ErrorBoundary.tsx
│   │   ├── I18nProvider.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/               # 页面组件
│   │   ├── Dashboard.tsx    # 概览和统计
│   │   ├── Config/          # 配置管理
│   │   ├── Download/        # 下载管理
│   │   ├── History/         # 下载历史
│   │   ├── Files/           # 文件浏览
│   │   ├── Logs/            # 应用日志
│   │   └── Login/           # 身份认证
│   ├── services/            # API 服务
│   │   ├── api/            # API 模块
│   │   ├── authService.ts
│   │   ├── configService.ts
│   │   ├── downloadService.ts
│   │   ├── fileService.ts
│   │   ├── logsService.ts
│   │   └── statsService.ts
│   ├── hooks/               # 自定义 React Hooks
│   │   ├── useAuth.ts
│   │   ├── useConfig.ts
│   │   ├── useDownload.ts
│   │   ├── useFiles.ts
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   └── usePagination.ts
│   ├── stores/             # 状态管理
│   │   ├── authStore.ts
│   │   └── uiStore.ts
│   ├── utils/               # 工具函数
│   │   ├── dateUtils.ts
│   │   ├── errorCodeTranslator.ts
│   │   ├── formatters.ts
│   │   └── validators.ts
│   ├── constants/           # 应用常量
│   │   ├── theme.ts
│   │   └── index.ts
│   ├── types/               # TypeScript 类型定义
│   │   ├── api.ts
│   │   └── errors.ts
│   ├── locales/             # i18n 翻译文件
│   │   ├── zh-CN.json
│   │   └── en-US.json
│   ├── i18n/                # i18n 配置
│   │   └── config.ts
│   ├── __tests__/           # 测试文件
│   ├── App.tsx              # 根组件
│   ├── AppRoutes.tsx        # 路由配置
│   ├── main.tsx             # 应用入口点
│   └── index.css            # 全局样式
├── electron/                # Electron 主进程代码
├── e2e/                     # E2E 测试
├── docs/                    # 文档
├── public/                  # 静态资源
├── check-translations.js    # 翻译完整性检查工具
├── package.json
├── tsconfig.json
├── vite.config.ts
├── playwright.config.ts     # Playwright 配置
└── README.md
```

## 🚀 快速开始

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

## 📚 文档

完整的文档位于 [`docs/`](./docs/) 目录：

### 📖 开发文档

- [开发指南](./docs/DEVELOPMENT_GUIDE.md) - 开发环境设置和工作流程
- [组件使用指南](./docs/COMPONENT_GUIDE.md) - 通用组件使用方法
- [E2E 测试指南](./docs/E2E_TESTING_GUIDE.md) - 端到端测试指南
- [性能优化指南](./docs/PERFORMANCE_GUIDE.md) - 性能优化策略

### 🏗️ 构建文档

- [构建指南](./BUILD_GUIDE.md) - Electron 应用构建说明

## 🤝 贡献指南

我们欢迎贡献！请参阅 [开发指南](./docs/DEVELOPMENT_GUIDE.md) 了解详细信息：

- 开发环境设置
- 代码风格和约定
- 开发工作流程
- 测试指南
- 提交 Pull Request

## 📝 许可证

本项目采用 MIT 许可证。详细信息请参阅项目根目录的 LICENSE 文件（如果存在）。

## 🙏 致谢

- [Ant Design](https://ant.design/) - UI 组件库
- [React Query](https://tanstack.com/query) - 数据获取和缓存
- [i18next](https://www.i18next.com/) - 国际化框架
- [Vite](https://vitejs.dev/) - 构建工具

## 📧 支持

遇到问题或需要帮助：

- 在 GitHub 上提交 Issue
- 查阅现有文档
- 查看已关闭的 Issue 寻找解决方案

---

用 ❤️ 构建
