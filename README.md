# PixivFlow WebUI Frontend

> Modern, responsive web interface for PixivFlow - A powerful Pixiv content downloader.

PixivFlow 的现代化、响应式 Web 界面 - 强大的 Pixiv 内容下载器。

**独立前端项目**：这是一个独立的前端项目，与后端完全分离。后端 API 服务器是独立的 npm 包，可以通过 HTTP API 与前端通信。

**Independent Frontend Project**: This is an independent frontend project, completely separated from the backend. The backend API server is a separate npm package that communicates with the frontend via HTTP API.

> 📖 **English Version**: See [README_EN.md](./README_EN.md) for the English translation.

## 📋 目录 (Table of Contents)

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [文档](#文档)
- [项目结构](#项目结构)
- [贡献指南](#贡献指南)

## ✨ 功能特性 (Features)

- **🎨 现代化 UI (Modern UI)**: 基于 Ant Design 构建的简洁直观界面
- **🌍 国际化支持 (Internationalization)**: 完整支持英文和中文
- **📱 响应式设计 (Responsive)**: 在桌面、平板和移动设备上完美运行
- **⚡ 实时更新 (Real-time Updates)**: 实时下载进度和状态更新
- **🔍 高级搜索 (Advanced Search)**: 强大的筛选和搜索功能
- **📊 统计信息 (Statistics)**: 全面的下载统计和分析
- **🎯 类型安全 (Type-Safe)**: 完整的 TypeScript 支持，提供更好的开发体验
- **♿ 无障碍访问 (Accessible)**: 符合 WCAG 2.1 无障碍标准

## 🛠 技术栈 (Tech Stack)

- **React 18** - UI 库 (UI library)
- **TypeScript** - 类型安全的 JavaScript (Type-safe JavaScript)
- **Ant Design 5** - UI 组件库 (UI component library)
- **React Router 6** - 客户端路由 (Client-side routing)
- **React Query** - 服务器状态管理 (Server state management)
- **Axios** - HTTP 客户端 (HTTP client)
- **i18next** - 国际化框架 (Internationalization framework)
- **Vite** - 构建工具和开发服务器 (Build tool and dev server)
- **Socket.IO** - 实时通信 (Real-time communication)

## 📁 项目结构 (Project Structure)

```
pixivflow-webui/
├── src/
│   ├── components/          # 可复用的 React 组件 (Reusable React components)
│   │   ├── common/         # 通用组件 (Common components)
│   │   ├── forms/          # 表单组件 (Form components)
│   │   ├── tables/         # 表格组件 (Table components)
│   │   ├── modals/         # 模态框组件 (Modal components)
│   │   ├── Layout/         # 布局组件 (Layout components)
│   │   ├── ErrorBoundary.tsx
│   │   ├── I18nProvider.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/               # 页面组件 (Page components)
│   │   ├── Dashboard.tsx    # 概览和统计 (Overview and statistics)
│   │   ├── Config/          # 配置管理 (Configuration management)
│   │   ├── Download/        # 下载管理 (Download management)
│   │   ├── History/         # 下载历史 (Download history)
│   │   ├── Files/           # 文件浏览 (File browser)
│   │   ├── Logs/            # 应用日志 (Application logs)
│   │   └── Login/           # 身份认证 (Authentication)
│   ├── services/            # API 服务 (API services)
│   │   ├── api/            # API 模块 (API modules)
│   │   ├── authService.ts
│   │   ├── configService.ts
│   │   ├── downloadService.ts
│   │   ├── fileService.ts
│   │   ├── logsService.ts
│   │   └── statsService.ts
│   ├── hooks/               # 自定义 React Hooks (Custom React hooks)
│   │   ├── useAuth.ts
│   │   ├── useConfig.ts
│   │   ├── useDownload.ts
│   │   ├── useFiles.ts
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   └── usePagination.ts
│   ├── stores/             # 状态管理 (State management)
│   │   ├── authStore.ts
│   │   └── uiStore.ts
│   ├── utils/               # 工具函数 (Utility functions)
│   │   ├── dateUtils.ts
│   │   ├── errorCodeTranslator.ts
│   │   ├── formatters.ts
│   │   └── validators.ts
│   ├── constants/           # 应用常量 (Application constants)
│   │   ├── theme.ts
│   │   └── index.ts
│   ├── types/               # TypeScript 类型定义 (TypeScript types)
│   │   ├── api.ts
│   │   └── errors.ts
│   ├── locales/             # i18n 翻译文件 (i18n translations)
│   │   ├── zh-CN.json
│   │   └── en-US.json
│   ├── i18n/                # i18n 配置 (i18n configuration)
│   │   └── config.ts
│   ├── __tests__/           # 测试文件 (Test files)
│   ├── App.tsx              # 根组件 (Root component)
│   ├── AppRoutes.tsx        # 路由配置 (Route configuration)
│   ├── main.tsx             # 应用入口点 (Application entry point)
│   └── index.css            # 全局样式 (Global styles)
├── electron/                # Electron 主进程代码 (Electron main process)
├── e2e/                     # E2E 测试 (End-to-end tests)
├── docs/                    # 文档 (Documentation)
├── public/                  # 静态资源 (Static assets)
├── check-translations.js    # 翻译完整性检查工具 (Translation completeness checker)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── playwright.config.ts     # Playwright 配置 (Playwright configuration)
└── README.md
```

## 🚀 快速开始 (Quick Start)

### 前置要求 (Prerequisites)

- Node.js 18+ 和 npm
- 运行中的后端 API 服务器（需要先安装并启动后端：`npm install -g pixivflow && pixivflow webui`）
- Backend API server running (install and start backend first: `npm install -g pixivflow && pixivflow webui`)

### 安装步骤 (Installation)

1. 克隆仓库 (Clone the repository):
```bash
git clone <repository-url>
cd pixivflow-webui
```

2. 安装依赖 (Install dependencies):
```bash
npm install
```

3. 启动开发服务器 (Start the development server):
```bash
npm run dev
```

4. 在浏览器中打开 `http://localhost:5173` (Open your browser and navigate to `http://localhost:5173`)

### 构建生产版本 (Build for Production)

```bash
npm run build
```

构建产物将输出到 `dist/` 目录，可以部署到任何静态文件服务器（如 Nginx、CDN 等）。

The build output will be in the `dist/` directory and can be deployed to any static file server (e.g., Nginx, CDN).

### 与后端集成 (Integration with Backend)

前端通过 HTTP API 与后端通信。默认情况下：
- 开发模式：连接到 `http://localhost:3001`（可通过 `VITE_DEV_API_PORT` 环境变量配置）
- 生产模式：连接到当前域名（可通过 `VITE_API_URL` 环境变量配置）

The frontend communicates with the backend via HTTP API. By default:
- Development mode: Connects to `http://localhost:3001` (configurable via `VITE_DEV_API_PORT` env var)
- Production mode: Connects to current domain (configurable via `VITE_API_URL` env var)

更多开发相关的信息，请参阅 [开发指南](./docs/DEVELOPMENT_GUIDE.md)。  
For more development information, see [Development Guide](./docs/DEVELOPMENT_GUIDE.md).

## 📚 文档 (Documentation)

完整的文档位于 [`docs/`](./docs/) 目录：  
Comprehensive documentation is available in the [`docs/`](./docs/) directory:

### 📖 开发文档 (Development)

- [开发指南](./docs/DEVELOPMENT_GUIDE.md) - 开发环境设置和工作流程 (Development setup and workflow)
- [组件使用指南](./docs/COMPONENT_GUIDE.md) - 通用组件使用方法 (Component usage guide)
- [E2E 测试指南](./docs/E2E_TESTING_GUIDE.md) - 端到端测试指南 (End-to-end testing guide)
- [性能优化指南](./docs/PERFORMANCE_GUIDE.md) - 性能优化策略 (Performance optimization guide)

### 🏗️ 构建文档 (Building)

- [构建指南](./BUILD_GUIDE.md) - Electron 应用构建说明 (Electron app build instructions)

## 🤝 贡献指南 (Contributing)

我们欢迎贡献！请参阅 [开发指南](./docs/DEVELOPMENT_GUIDE.md) 了解详细信息：  
We welcome contributions! Please see the [Development Guide](./docs/DEVELOPMENT_GUIDE.md) for detailed information on:

- 开发环境设置 (Development environment setup)
- 代码风格和约定 (Code style and conventions)
- 开发工作流程 (Development workflow)
- 测试指南 (Testing guidelines)
- 提交 Pull Request (Submitting pull requests)

## 📝 许可证 (License)

详细信息请参阅主项目的 LICENSE 文件。  
See the main project LICENSE file for details.

## 🙏 致谢 (Acknowledgments)

- [Ant Design](https://ant.design/) - UI 组件库 (UI component library)
- [React Query](https://tanstack.com/query) - 数据获取和缓存 (Data fetching and caching)
- [i18next](https://www.i18next.com/) - 国际化框架 (Internationalization framework)
- [Vite](https://vitejs.dev/) - 构建工具 (Build tool)

## 📧 支持 (Support)

遇到问题或需要帮助：  
For issues and questions:

- 在 GitHub 上提交 Issue (Open an issue on GitHub)
- 查阅现有文档 (Check existing documentation)
- 查看已关闭的 Issue 寻找解决方案 (Review closed issues for solutions)

---

由 PixivFlow 团队用 ❤️ 构建  
Built with ❤️ by the PixivFlow team
