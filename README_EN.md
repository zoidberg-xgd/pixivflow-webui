# PixivFlow WebUI Frontend

Modern, responsive web interface for PixivFlow - A powerful Pixiv content downloader.

> **中文版本**: 查看 [README.md](./README.md) 获取中文文档。

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## Features

- **Modern UI**: Clean, intuitive interface built with Ant Design
- **Internationalization**: Full support for English and Chinese
- **Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Updates**: Live download progress and status updates
- **Advanced Search**: Powerful filtering and search capabilities
- **Statistics**: Comprehensive download statistics and analytics
- **Type-Safe**: Full TypeScript support for better developer experience
- **Accessible**: WCAG 2.1 compliant for accessibility

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Ant Design 5** - UI component library
- **React Router 6** - Client-side routing
- **React Query** - Server state management
- **Axios** - HTTP client
- **i18next** - Internationalization framework
- **Vite** - Build tool and dev server
- **Socket.IO** - Real-time communication

## Project Structure

```
pixivflow-webui/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── common/         # Common components
│   │   ├── forms/          # Form components
│   │   ├── tables/         # Table components
│   │   ├── modals/         # Modal components
│   │   ├── Layout/         # Layout components
│   │   ├── ErrorBoundary.tsx
│   │   ├── I18nProvider.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/               # Page components
│   │   ├── Dashboard.tsx    # Overview and statistics
│   │   ├── Config/          # Configuration management
│   │   ├── Download/        # Download management
│   │   ├── History/         # Download history
│   │   ├── Files/           # File browser
│   │   ├── Logs/            # Application logs
│   │   └── Login/           # Authentication
│   ├── services/            # API services
│   │   ├── api/            # API modules
│   │   ├── authService.ts
│   │   ├── configService.ts
│   │   ├── downloadService.ts
│   │   ├── fileService.ts
│   │   ├── logsService.ts
│   │   └── statsService.ts
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useConfig.ts
│   │   ├── useDownload.ts
│   │   ├── useFiles.ts
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   └── usePagination.ts
│   ├── stores/             # State management
│   │   ├── authStore.ts
│   │   └── uiStore.ts
│   ├── utils/               # Utility functions
│   │   ├── dateUtils.ts
│   │   ├── errorCodeTranslator.ts
│   │   ├── formatters.ts
│   │   └── validators.ts
│   ├── constants/           # Application constants
│   │   ├── theme.ts
│   │   └── index.ts
│   ├── types/               # TypeScript type definitions
│   │   ├── api.ts
│   │   └── errors.ts
│   ├── locales/             # i18n translations
│   │   ├── zh-CN.json
│   │   └── en-US.json
│   ├── i18n/                # i18n configuration
│   │   └── config.ts
│   ├── __tests__/           # Test files
│   ├── App.tsx              # Root component
│   ├── AppRoutes.tsx        # Route configuration
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── electron/                # Electron main process code
├── e2e/                     # End-to-end tests
├── docs/                    # Documentation
├── public/                  # Static assets
├── check-translations.js    # Translation completeness checker
├── package.json
├── tsconfig.json
├── vite.config.ts
├── playwright.config.ts     # Playwright configuration
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Backend API server running (install and start backend first: `npm install -g pixivflow && pixivflow webui`)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/zoidberg-xgd/pixivflow-webui.git
cd pixivflow-webui
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

For more development information, see [Development Guide](./docs/DEVELOPMENT_GUIDE.md).

## Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

### Development

- [Development Guide](./docs/DEVELOPMENT_GUIDE.md) - Development environment setup and workflow
- [Component Guide](./docs/COMPONENT_GUIDE.md) - Component usage guide
- [E2E Testing Guide](./docs/E2E_TESTING_GUIDE.md) - End-to-end testing guide
- [Performance Guide](./docs/PERFORMANCE_GUIDE.md) - Performance optimization strategies

### Building

- [Build Guide](./BUILD_GUIDE.md) - Electron app build instructions

## Contributing

We welcome contributions! Please see the [Development Guide](./docs/DEVELOPMENT_GUIDE.md) for detailed information on:

- Development environment setup
- Code style and conventions
- Development workflow
- Testing guidelines
- Submitting pull requests

## License

This project is licensed under the MIT License. See the LICENSE file in the root directory for details (if available).

## Acknowledgments

- [Ant Design](https://ant.design/) - UI component library
- [React Query](https://tanstack.com/query) - Data fetching and caching
- [i18next](https://www.i18next.com/) - Internationalization framework
- [Vite](https://vitejs.dev/) - Build tool

## Support

For issues and questions:

- Open an issue on GitHub
- Check existing documentation
- Review closed issues for solutions

---

