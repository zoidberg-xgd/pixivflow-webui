# Android 全栈应用构建指南

本指南说明如何构建一个**同时包含前端和后端**的 Android APK,使应用可以独立运行,无需外部服务器。

## 📋 目录

- [方案概述](#方案概述)
- [方案对比](#方案对比)
- [推荐方案: Node.js on Android](#推荐方案-nodejs-on-android)
- [替代方案](#替代方案)
- [实施步骤](#实施步骤)

---

## 🎯 方案概述

由于 PixivFlow 的前端和后端是分离的,要在 Android 上运行完整应用,我们有以下几种方案:

### 当前状况

- **前端**: React + TypeScript Web 应用
- **后端**: 独立的 Node.js API 服务器 (npm 包)
- **通信**: HTTP API + WebSocket

### 挑战

Android 原生不支持运行 Node.js 后端,需要特殊方案。

---

## 🔄 方案对比

| 方案 | 优点 | 缺点 | 复杂度 | 推荐度 |
|------|------|------|--------|--------|
| **1. Node.js on Android** | 完整功能,真实后端 | APK 较大 (~50MB) | 中等 | ⭐⭐⭐⭐⭐ |
| **2. 原生 Android 后端** | 性能好,APK 小 | 需要重写后端 | 很高 | ⭐⭐ |
| **3. 混合方案** | 灵活 | 维护复杂 | 高 | ⭐⭐⭐ |
| **4. 仅前端 + 远程后端** | 简单 | 需要网络连接 | 低 | ⭐⭐⭐⭐ |

---

## 🚀 推荐方案: Node.js on Android

使用 **nodejs-mobile** 在 Android 上运行 Node.js 后端。

### 方案架构

```
Android APK
├── WebView (Capacitor)
│   └── React 前端应用
└── Node.js Runtime
    └── PixivFlow 后端 API
    
通信: localhost:3001
```

### 优点

- ✅ 完整的前后端功能
- ✅ 无需重写代码
- ✅ 离线可用
- ✅ 真实的 Node.js 环境

### 缺点

- ❌ APK 体积较大 (~50-80MB)
- ❌ 首次启动较慢
- ❌ 电池消耗较高

---

## 📦 实施步骤

### 步骤 1: 安装 nodejs-mobile

```bash
# 安装 Capacitor 插件
npm install nodejs-mobile-capacitor

# 同步到 Android
npx cap sync android
```

### 步骤 2: 准备后端代码

创建 `nodejs-assets/nodejs-project/` 目录结构:

```bash
mkdir -p nodejs-assets/nodejs-project
cd nodejs-assets/nodejs-project

# 初始化 Node.js 项目
npm init -y

# 安装 PixivFlow 后端 (假设后端包名为 pixivflow)
npm install pixivflow

# 或者如果后端代码在本地
# 将后端代码复制到这里
```

### 步骤 3: 创建启动脚本

创建 `nodejs-assets/nodejs-project/main.js`:

```javascript
// Node.js 后端启动脚本
const http = require('http');
const path = require('path');

// 导入 PixivFlow 后端
// 根据实际后端结构调整
const pixivflow = require('pixivflow');

// 启动后端服务器
const PORT = 3001;

console.log('Starting PixivFlow backend on Android...');

// 初始化并启动后端
pixivflow.start({
  port: PORT,
  host: '127.0.0.1',
  // 其他配置...
}).then(() => {
  console.log(`Backend running on http://127.0.0.1:${PORT}`);
  
  // 通知前端后端已就绪
  if (typeof rn_bridge !== 'undefined') {
    rn_bridge.channel.send('backend-ready');
  }
}).catch(err => {
  console.error('Failed to start backend:', err);
});

// 处理来自前端的消息
if (typeof rn_bridge !== 'undefined') {
  rn_bridge.channel.on('message', (msg) => {
    console.log('Message from frontend:', msg);
  });
}
```

### 步骤 4: 修改前端配置

更新 `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pixivflow.webui',
  appName: 'PixivFlow',
  webDir: 'dist',
  server: {
    // 在 Android 上连接到本地 Node.js 后端
    androidScheme: 'http',
    hostname: '127.0.0.1',
    iosScheme: 'http',
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true,
  },
};

export default config;
```

### 步骤 5: 创建 Capacitor 插件桥接

创建 `src/services/nodejsBridge.ts`:

```typescript
import { Capacitor } from '@capacitor/core';

export class NodeJSBridge {
  private static instance: NodeJSBridge;
  private backendReady = false;

  static getInstance(): NodeJSBridge {
    if (!NodeJSBridge.instance) {
      NodeJSBridge.instance = new NodeJSBridge();
    }
    return NodeJSBridge.instance;
  }

  async initialize(): Promise<void> {
    if (Capacitor.getPlatform() !== 'android') {
      console.log('Not on Android, skipping Node.js initialization');
      return;
    }

    try {
      // 导入 nodejs-mobile 插件
      const { NodeJS } = await import('nodejs-mobile-capacitor');
      
      // 启动 Node.js
      await NodeJS.start('main.js');
      
      // 监听后端就绪消息
      NodeJS.channel.addListener('message', (msg: any) => {
        if (msg === 'backend-ready') {
          this.backendReady = true;
          console.log('Backend is ready!');
        }
      });

      // 等待后端启动
      await this.waitForBackend();
    } catch (error) {
      console.error('Failed to start Node.js backend:', error);
      throw error;
    }
  }

  private async waitForBackend(timeout = 30000): Promise<void> {
    const startTime = Date.now();
    
    while (!this.backendReady) {
      if (Date.now() - startTime > timeout) {
        throw new Error('Backend startup timeout');
      }
      
      // 尝试连接后端
      try {
        const response = await fetch('http://127.0.0.1:3001/health');
        if (response.ok) {
          this.backendReady = true;
          return;
        }
      } catch (e) {
        // 继续等待
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  isBackendReady(): boolean {
    return this.backendReady;
  }

  getBackendUrl(): string {
    return 'http://127.0.0.1:3001';
  }
}
```

### 步骤 6: 在应用启动时初始化

修改 `src/main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import App from './App';
import { NodeJSBridge } from './services/nodejsBridge';
import './index.css';

async function startApp() {
  // 如果在 Android 上,先启动后端
  if (Capacitor.getPlatform() === 'android') {
    console.log('Initializing Node.js backend...');
    
    try {
      const bridge = NodeJSBridge.getInstance();
      await bridge.initialize();
      console.log('Backend initialized successfully');
    } catch (error) {
      console.error('Failed to initialize backend:', error);
      // 可以显示错误提示
    }
  }

  // 渲染应用
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

startApp();
```

### 步骤 7: 更新 API 配置

修改 `src/services/api.ts` 以使用本地后端:

```typescript
import { Capacitor } from '@capacitor/core';
import { NodeJSBridge } from './nodejsBridge';

function getApiBaseUrl(): string {
  // 在 Android 上使用本地后端
  if (Capacitor.getPlatform() === 'android') {
    const bridge = NodeJSBridge.getInstance();
    return bridge.getBackendUrl();
  }
  
  // 在其他平台使用环境变量或默认值
  return import.meta.env.VITE_API_URL || 'http://localhost:3001';
}

export const API_BASE_URL = getApiBaseUrl();
```

### 步骤 8: 构建完整 APK

创建 `build-android-fullstack.sh`:

```bash
#!/bin/bash

echo "构建包含前后端的完整 Android APK..."

# 1. 构建前端
echo "步骤 1/5: 构建前端..."
npm run build

# 2. 准备后端代码
echo "步骤 2/5: 准备后端代码..."
mkdir -p nodejs-assets/nodejs-project
cd nodejs-assets/nodejs-project

# 如果还没有安装后端依赖
if [ ! -d "node_modules" ]; then
    npm install
fi

cd ../..

# 3. 同步到 Android
echo "步骤 3/5: 同步到 Android..."
npx cap sync android

# 4. 构建 APK
echo "步骤 4/5: 构建 APK..."
cd android
./gradlew assembleDebug
cd ..

# 5. 复制 APK
echo "步骤 5/5: 复制 APK..."
cp android/app/build/outputs/apk/debug/app-debug.apk pixivflow-fullstack-debug.apk

echo "✓ 构建完成! APK: pixivflow-fullstack-debug.apk"
```

---

## 🔄 替代方案

### 方案 2: 原生 Android 后端

如果 Node.js 方案不适合,可以考虑用 Kotlin/Java 重写后端核心功能。

**优点:**
- APK 更小
- 性能更好
- 电池友好

**缺点:**
- 需要完全重写后端
- 开发工作量大
- 维护两套代码

### 方案 3: 混合方案

部分功能用原生实现,复杂功能仍使用 Node.js。

### 方案 4: 仅前端 + 配置远程后端

最简单的方案:APK 只包含前端,用户需要:
1. 在电脑上运行后端服务器
2. 在应用中配置后端地址

**这是目前已实现的方案**,适合:
- 个人使用
- 局域网环境
- 有固定服务器的场景

---

## 📊 方案选择建议

### 选择 Node.js on Android,如果:
- ✅ 需要完全离线运行
- ✅ 用户不想配置服务器
- ✅ 可以接受较大的 APK
- ✅ 后端逻辑复杂,不想重写

### 选择原生后端,如果:
- ✅ 追求最佳性能
- ✅ 需要最小的 APK
- ✅ 有 Android 开发经验
- ✅ 后端逻辑相对简单

### 选择仅前端,如果:
- ✅ 主要在局域网使用
- ✅ 有固定的服务器
- ✅ 追求最简单的实现
- ✅ APK 体积要最小

---

## 📦 预期 APK 大小

| 方案 | Debug APK | Release APK |
|------|-----------|-------------|
| 仅前端 | ~10MB | ~8MB |
| Node.js + 前端 | ~60MB | ~50MB |
| 原生后端 + 前端 | ~15MB | ~12MB |

---

## 🔧 所需依赖

### Node.js on Android 方案

```json
{
  "dependencies": {
    "nodejs-mobile-capacitor": "^1.0.0"
  }
}
```

### 额外配置

在 `android/app/build.gradle` 中:

```gradle
android {
    packagingOptions {
        pickFirst 'lib/x86/libc++_shared.so'
        pickFirst 'lib/x86_64/libc++_shared.so'
        pickFirst 'lib/armeabi-v7a/libc++_shared.so'
        pickFirst 'lib/arm64-v8a/libc++_shared.so'
    }
}
```

---

## 🚦 下一步

1. **评估需求**: 确定是否真的需要完整的离线应用
2. **选择方案**: 根据上述对比选择合适的方案
3. **原型测试**: 先用小规模测试验证可行性
4. **完整实施**: 按照步骤实施完整方案
5. **性能优化**: 优化启动时间和资源使用

---

## 📚 参考资源

- [nodejs-mobile](https://github.com/nodejs-mobile/nodejs-mobile)
- [nodejs-mobile-capacitor](https://github.com/hampoelz/capacitor-nodejs)
- [Capacitor 文档](https://capacitorjs.com/)

---

## ⚠️ 重要提示

1. **首次启动**: 包含 Node.js 的 APK 首次启动需要 5-15 秒
2. **权限**: 需要网络权限和存储权限
3. **电池**: Node.js 后端会持续运行,注意电池消耗
4. **测试**: 务必在真实设备上充分测试

---

需要帮助实施? 请参考具体的实施步骤或在 GitHub 上提交 Issue!

