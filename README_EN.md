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
│   ├── components/          # React components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── hooks/              # Custom hooks
│   ├── stores/             # State management
│   ├── utils/              # Utility functions
│   ├── locales/            # i18n translations
│   └── types/              # TypeScript types
├── electron/               # Electron main process (⚠️ Work in progress, not complete)
├── e2e/                    # E2E tests
├── docs/                   # Documentation
└── public/                 # Static assets
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

- [Build Guide](./BUILD_GUIDE.md) - Electron app build instructions (⚠️ Work in progress, not complete)

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

