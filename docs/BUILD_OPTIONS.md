# PixivFlow 构建选项总览

本文档概述了 PixivFlow WebUI 的所有构建选项,包括 Web、桌面和移动平台。

## 📋 目录

- [Web 应用](#web-应用)
- [桌面应用 (Electron)](#桌面应用-electron)
- [移动应用 (Android/iOS)](#移动应用-androidios)
- [构建脚本对比](#构建脚本对比)

---

## 🌐 Web 应用

### 开发模式

```bash
npm run dev
```

- 启动开发服务器 (默认端口: 5173)
- 支持热模块替换 (HMR)
- 适合本地开发和调试

### 生产构建

```bash
npm run build
```

- 构建优化的生产版本
- 输出到 `dist/` 目录
- 可部署到任何静态文件服务器

### 预览生产构建

```bash
npm run preview
```

- 在本地预览生产构建
- 用于发布前测试

---

## 🖥️ 桌面应用 (Electron)

### 开发模式

```bash
npm run electron:dev
```

- 启动 Electron 开发模式
- 适合桌面应用开发

### 构建所有平台

```bash
npm run electron:build
```

- 构建当前平台的 Electron 应用

### 特定平台构建

#### Windows

```bash
npm run electron:build:win
```

- 输出: `.exe` 安装程序

#### macOS

```bash
npm run electron:build:mac
```

- 输出: `.dmg` 安装包
- 支持 ARM64 (Apple Silicon)

#### Linux

```bash
npm run electron:build:linux
```

- 输出: `.AppImage`, `.deb`, `.rpm`

### 高级构建选项

```bash
# macOS 详细构建
npm run electron:build:mac:verbose

# macOS 简化构建
npm run electron:build:mac:simple

# macOS 增强构建
npm run electron:build:mac:enhanced

# 检查构建环境
npm run electron:check

# 打包但不创建安装程序
npm run electron:pack
```

---

## 📱 移动应用 (Android/iOS)

### Android

#### 快速构建 (推荐)

**macOS/Linux:**
```bash
./build-android.sh
```

**Windows:**
```bash
build-android.bat
```

#### 使用 npm 脚本

```bash
# 首次构建: 初始化 Android 项目
npm run android:init

# 同步资源
npm run android:sync

# 构建 Debug APK
npm run android:build:debug

# 构建 Release APK (需要配置签名)
npm run android:build

# 在 Android Studio 中打开
npm run android:open
```

#### 输出文件

- **Debug APK**: `pixivflow-debug.apk`
  - 可直接安装
  - 用于测试

- **Release APK**: `pixivflow-release-unsigned.apk`
  - 需要签名
  - 用于发布

### iOS

```bash
# 同步资源
npm run ios:sync

# 在 Xcode 中打开
npm run ios:open
```

然后在 Xcode 中:
1. 选择开发团队
2. 选择目标设备
3. 点击 Run 或 Archive

### 同步所有移动平台

```bash
npm run mobile:sync
```

---

## 🔄 构建脚本对比

### Web 构建

| 命令 | 用途 | 输出 |
|------|------|------|
| `npm run dev` | 开发服务器 | 无 (内存) |
| `npm run build` | 生产构建 | `dist/` |
| `npm run preview` | 预览构建 | 无 (本地服务器) |

### Electron 构建

| 命令 | 平台 | 输出格式 | 大小 |
|------|------|----------|------|
| `electron:build:win` | Windows | `.exe` | ~150MB |
| `electron:build:mac` | macOS | `.dmg` | ~200MB |
| `electron:build:linux` | Linux | `.AppImage`, `.deb`, `.rpm` | ~180MB |

### Android 构建

| 方法 | 平台 | 优点 | 输出 |
|------|------|------|------|
| `./build-android.sh` | macOS/Linux | 自动化,交互式 | `.apk` |
| `build-android.bat` | Windows | 自动化,交互式 | `.apk` |
| `npm run android:build:debug` | 所有 | 快速,无需签名 | `app-debug.apk` (~10MB) |
| `npm run android:build` | 所有 | 生产就绪 | `app-release.apk` (~8MB) |

### iOS 构建

| 方法 | 要求 | 输出 |
|------|------|------|
| Xcode Archive | macOS + Xcode | `.ipa` |
| Xcode Run | macOS + Xcode | 直接安装到设备 |

---

## 📦 构建产物大小对比

| 平台 | Debug | Release | 压缩后 |
|------|-------|---------|--------|
| **Web** | - | ~2MB | ~500KB (gzip) |
| **Electron (Windows)** | - | ~150MB | ~50MB (安装包) |
| **Electron (macOS)** | - | ~200MB | ~60MB (DMG) |
| **Electron (Linux)** | - | ~180MB | ~55MB (AppImage) |
| **Android** | ~10MB | ~8MB | ~8MB |
| **iOS** | ~15MB | ~12MB | ~12MB |

---

## 🚀 推荐构建流程

### 开发阶段

1. **Web 开发**: `npm run dev`
2. **测试**: `npm test` + `npm run test:e2e`
3. **预览**: `npm run preview`

### 测试阶段

1. **构建 Web**: `npm run build`
2. **构建 Android Debug**: `./build-android.sh` (选择 Debug)
3. **在设备上测试**

### 发布阶段

1. **构建所有平台**:
   ```bash
   # Web
   npm run build
   
   # Electron
   npm run electron:build:win
   npm run electron:build:mac
   npm run electron:build:linux
   
   # Android
   ./build-android.sh  # 选择 Release
   
   # iOS
   npm run ios:open  # 然后在 Xcode 中 Archive
   ```

2. **签名和发布**:
   - Android: 使用 `keystore` 签名
   - iOS: 通过 App Store Connect
   - Electron: 可选代码签名

---

## 🔧 环境要求总结

### 所有平台

- Node.js 18+
- npm

### Electron

- 无额外要求 (跨平台构建需要对应平台)

### Android

- Java JDK 17+
- Android SDK
- Android Studio (推荐)

### iOS

- macOS
- Xcode 14+
- Apple 开发者账号

---

## 📚 相关文档

- [开发指南](./DEVELOPMENT_GUIDE.md)
- [Electron 构建指南](../BUILD_GUIDE.md)
- [移动应用快速入门](./MOBILE_QUICK_START.md)
- [Android 构建指南](./ANDROID_BUILD_GUIDE.md)

---

## 💡 提示

1. **首次构建**: 建议先构建 Web 版本,确保应用正常工作
2. **测试**: 使用 Debug 版本进行测试,更快且易于调试
3. **发布**: Release 版本更小,性能更好,但需要签名
4. **CI/CD**: 可以使用 GitHub Actions 自动化构建流程

---

需要帮助? 查看对应平台的详细构建指南或在 GitHub 上提交 Issue!

