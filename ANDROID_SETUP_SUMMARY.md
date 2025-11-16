# Android APK 构建功能 - 设置总结

本文档总结了为 PixivFlow WebUI 项目添加的 Android APK 构建功能。

## 📦 新增文件

### 1. 构建脚本

#### `build-android.sh` (macOS/Linux)
- 自动化 Android APK 构建脚本
- 功能:
  - ✅ 检查所有依赖 (Node.js, Java, Android SDK)
  - ✅ 自动安装 npm 依赖
  - ✅ 构建 Web 应用
  - ✅ 初始化/同步 Android 项目
  - ✅ 交互式选择构建类型 (Debug/Release)
  - ✅ 自动复制 APK 到项目根目录
- 使用方法: `./build-android.sh`

#### `build-android.bat` (Windows)
- Windows 版本的构建脚本
- 功能与 shell 脚本相同
- 使用方法: `build-android.bat`

### 2. 文档

#### `docs/ANDROID_BUILD_GUIDE.md`
详细的 Android 构建指南,包括:
- 前置要求和环境配置
- 快速构建步骤
- 手动构建流程
- Release APK 签名详细说明
- 设备安装方法

#### `docs/MOBILE_QUICK_START.md`
移动应用快速入门指南,包括:
- Android 和 iOS 快速构建
- 环境配置 (macOS/Linux/Windows)
- 常见问题解决方案
- 应用更新流程
- 后端连接配置

#### `docs/BUILD_OPTIONS.md`
所有构建选项总览,包括:
- Web、Electron、Android、iOS 构建对比
- 构建脚本对比表
- 构建产物大小对比
- 推荐构建流程
- 环境要求总结

#### `ANDROID_README.md`
Android 专用快速参考文档,包括:
- 一键构建说明
- 前置要求
- 安装方法
- 签名配置
- 常见问题

## 🔧 修改的文件

### 1. `package.json`
添加的依赖:
```json
"@capacitor/android": "^6.0.0",
"@capacitor/cli": "^6.0.0",
"@capacitor/core": "^6.0.0",
"@capacitor/ios": "^6.0.0"
```

添加的脚本:
```json
"android:init": "npm run build && npx cap add android",
"android:sync": "npm run build && npx cap sync android",
"android:open": "npx cap open android",
"android:build": "npm run build && npx cap sync android && cd android && ./gradlew assembleRelease",
"android:build:debug": "npm run build && npx cap sync android && cd android && ./gradlew assembleDebug",
"ios:sync": "npm run build && npx cap sync ios",
"ios:open": "npx cap open ios",
"mobile:sync": "npm run build && npx cap sync"
```

### 2. `capacitor.config.ts`
增强的 Android 配置:
```typescript
android: {
  allowMixedContent: true,
  webContentsDebuggingEnabled: true,
  buildOptions: {
    keystorePath: undefined,
    keystoreAlias: undefined,
  },
}
```

### 3. `.gitignore`
添加的忽略规则:
```
# Android
android/
*.apk
*.aab
*.keystore
android/keystore.properties
android/app/release/
android/app/build/
android/.gradle/
android/local.properties

# iOS (additional)
ios/App/Podfile.lock
ios/App/Pods/
ios/App/build/

# Capacitor
.capacitor/
```

### 4. `README.md`
添加的章节:
- 移动应用快速构建说明
- Android/iOS 构建步骤
- 前置要求
- 文档链接

## 🚀 使用方法

### 快速开始 (推荐)

#### macOS/Linux
```bash
./build-android.sh
```

#### Windows
```bash
build-android.bat
```

### 使用 npm 脚本

```bash
# 1. 首次构建: 初始化 Android 项目
npm run android:init

# 2. 后续构建: 构建 Debug APK
npm run android:build:debug

# 3. 或构建 Release APK (需要签名)
npm run android:build
```

## 📱 输出文件

构建成功后,APK 文件位于:

- **Debug**: `pixivflow-debug.apk` (~10MB)
  - 可直接安装到设备
  - 用于测试

- **Release**: `pixivflow-release-unsigned.apk` (~8MB)
  - 需要签名后才能安装
  - 用于发布

## 🔐 签名配置 (Release)

### 1. 生成密钥

```bash
keytool -genkey -v -keystore pixivflow-release-key.keystore \
  -alias pixivflow -keyalg RSA -keysize 2048 -validity 10000
```

### 2. 配置签名

创建 `android/keystore.properties`:

```properties
storePassword=你的密钥库密码
keyAlias=pixivflow
keyPassword=你的密钥密码
storeFile=../pixivflow-release-key.keystore
```

### 3. 重新构建

```bash
npm run android:build
```

## 📋 前置要求

### 必需软件

1. **Node.js 18+**
   - 下载: https://nodejs.org/

2. **Java JDK 17+**
   - 下载: https://adoptium.net/

3. **Android Studio**
   - 下载: https://developer.android.com/studio
   - 通过 SDK Manager 安装 Android SDK

### 环境变量

#### macOS/Linux

在 `~/.bashrc` 或 `~/.zshrc` 中添加:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
# 或
export ANDROID_HOME=$HOME/Android/Sdk          # Linux

export PATH=$PATH:$ANDROID_HOME/platform-tools
```

#### Windows

1. 系统属性 > 环境变量
2. 新建系统变量:
   - `ANDROID_HOME` = `C:\Users\你的用户名\AppData\Local\Android\Sdk`
3. 编辑 Path,添加:
   - `%ANDROID_HOME%\platform-tools`

## 🔄 构建流程

```
开始
  ↓
检查依赖 (Node.js, Java, Android SDK)
  ↓
安装 npm 依赖
  ↓
构建 Web 应用 (npm run build)
  ↓
初始化 Android 项目 (首次) 或 同步资源
  ↓
选择构建类型 (Debug/Release)
  ↓
构建 APK (Gradle)
  ↓
复制 APK 到项目根目录
  ↓
完成!
```

## 📚 文档结构

```
pixivflow-webui/
├── build-android.sh           # macOS/Linux 构建脚本
├── build-android.bat          # Windows 构建脚本
├── ANDROID_README.md          # Android 快速参考
├── docs/
│   ├── ANDROID_BUILD_GUIDE.md    # 详细构建指南
│   ├── MOBILE_QUICK_START.md     # 移动应用快速入门
│   └── BUILD_OPTIONS.md          # 所有构建选项
└── README.md                  # 主文档 (已更新)
```

## 🎯 主要功能

1. **一键构建**: 自动化脚本简化构建流程
2. **跨平台**: 支持 macOS、Linux、Windows
3. **交互式**: 脚本提供友好的交互界面
4. **环境检查**: 自动检测并提示缺失的依赖
5. **灵活构建**: 支持 Debug 和 Release 两种模式
6. **完整文档**: 详细的构建和签名说明

## 🔧 常见问题

### Q: 构建失败,提示 ANDROID_HOME 未设置?
A: 请按照文档配置 ANDROID_HOME 环境变量

### Q: Java 版本不兼容?
A: 请安装 JDK 17 或更高版本

### Q: Gradle 构建失败?
A: 尝试清理并重新构建:
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

### Q: 首次构建很慢?
A: 正常现象,Gradle 需要下载依赖 (5-10 分钟),后续构建会快很多

## 📞 获取帮助

- 查看 [移动应用快速入门](./docs/MOBILE_QUICK_START.md)
- 查看 [Android 构建指南](./docs/ANDROID_BUILD_GUIDE.md)
- 在 GitHub 上提交 Issue
- 查看 [Capacitor 官方文档](https://capacitorjs.com/)

## ✅ 验证清单

构建完成后,请验证:

- [ ] APK 文件已生成
- [ ] 文件大小合理 (Debug ~10MB, Release ~8MB)
- [ ] 可以安装到 Android 设备
- [ ] 应用可以正常启动
- [ ] 可以连接到后端 API
- [ ] 所有功能正常工作

## 🎉 下一步

1. **测试**: 在 Android 设备上安装并测试 Debug APK
2. **优化**: 根据需要调整 Capacitor 配置
3. **签名**: 为 Release 版本配置签名
4. **发布**: 上传到应用商店或直接分发

---

**注意**: 
- Android 项目文件夹 (`android/`) 已添加到 `.gitignore`,不会提交到版本库
- 签名密钥文件 (`.keystore`) 也已忽略,请妥善保管
- APK 文件已忽略,不会提交到版本库

祝您构建顺利! 🚀

