# Android APK 快速参考

## 🚀 快速构建

### 仅前端 APK (~10MB)

```bash
./build-android.sh
```

**输出**: `pixivflow-debug.apk`  
**需要**: 外部后端服务器

### 全栈 APK (~50MB)

```bash
./build-android-fullstack.sh
```

**输出**: `pixivflow-fullstack-debug.apk`  
**需要**: 无,完全独立运行

---

## 📋 前置要求

| 软件 | 版本 | 下载链接 |
|------|------|----------|
| Node.js | 18+ | https://nodejs.org/ |
| Java JDK | 17+ | https://adoptium.net/ |
| Android Studio | 最新 | https://developer.android.com/studio |

### 环境变量

```bash
# macOS/Linux
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Windows (系统环境变量)
ANDROID_HOME=C:\Users\你的用户名\AppData\Local\Android\Sdk
```

---

## [object Object] 脚本

```bash
# Android
npm run android:init          # 初始化项目
npm run android:sync          # 同步资源
npm run android:build:debug   # 构建 Debug APK
npm run android:build         # 构建 Release APK
npm run android:open          # 打开 Android Studio

# iOS
npm run ios:sync              # 同步资源
npm run ios:open              # 打开 Xcode

# 通用
npm run mobile:sync           # 同步所有平台
```

---

## 📱 安装 APK

### 方法 1: ADB

```bash
adb install pixivflow-debug.apk
```

### 方法 2: 直接安装

1. 传输 APK 到设备
2. 启用"未知来源"安装
3. 点击 APK 安装

---

## 🔐 签名 Release APK

### 1. 生成密钥

```bash
keytool -genkey -v -keystore pixivflow-release-key.keystore \
  -alias pixivflow -keyalg RSA -keysize 2048 -validity 10000
```

### 2. 配置签名

创建 `android/keystore.properties`:

```properties
storePassword=你的密码
keyAlias=pixivflow
keyPassword=你的密码
storeFile=../pixivflow-release-key.keystore
```

### 3. 构建

```bash
npm run android:build
```

---

## 🐛 常见问题

### ANDROID_HOME 未设置

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
```

### Java 版本不兼容

```bash
brew install openjdk@17
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

### Gradle 构建失败

```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

### 后端启动失败 (全栈)

```bash
# 检查后端代码
ls -la nodejs-assets/nodejs-project/

# 查看日志
adb logcat | grep -i backend
```

---

## 📊 方案对比

| 特性 | 仅前端 | 全栈 |
|------|--------|------|
| APK 大小 | ~10MB | ~50MB |
| 启动时间 | 1-2秒 | 5-15秒 |
| 离线可用 | ❌ | ✅ |
| 需要服务器 | ✅ | ❌ |

---

## 📚 文档链接

- [Android 构建指南](./docs/ANDROID_BUILD_GUIDE.md)
- [全栈应用指南](./docs/ANDROID_FULL_STACK_GUIDE.md)
- [使用说明](./docs/ANDROID_FULLSTACK_USAGE.md)
- [快速入门](./docs/MOBILE_QUICK_START.md)

---

## 💡 提示

- 首次构建需要 5-10 分钟
- 使用 Debug APK 进行测试
- Release APK 需要签名
- 全栈 APK 首次启动较慢

---

**需要帮助?** 查看详细文档或在 GitHub 上提交 Issue!

