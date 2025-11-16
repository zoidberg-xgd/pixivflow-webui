# PixivFlow Android 应用

快速构建 PixivFlow 的 Android APK 版本。

## 🚀 一键构建

### macOS / Linux

```bash
./build-android.sh
```

### Windows

```bash
build-android.bat
```

## 📋 前置要求

在开始之前,请确保已安装:

1. **Node.js 18+** - [下载](https://nodejs.org/)
2. **Java JDK 17+** - [下载](https://adoptium.net/)
3. **Android Studio** - [下载](https://developer.android.com/studio)

### 环境变量配置

#### macOS/Linux

在 `~/.bashrc` 或 `~/.zshrc` 中添加:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
# 或
export ANDROID_HOME=$HOME/Android/Sdk          # Linux

export PATH=$PATH:$ANDROID_HOME/platform-tools
```

#### Windows

1. 打开"系统属性" > "环境变量"
2. 新建系统变量:
   - 变量名: `ANDROID_HOME`
   - 变量值: `C:\Users\你的用户名\AppData\Local\Android\Sdk`

## 📦 构建步骤

### 方法 1: 使用自动化脚本 (推荐)

```bash
# macOS/Linux
./build-android.sh

# Windows
build-android.bat
```

脚本会自动:
- ✅ 检查所有依赖
- ✅ 安装 npm 包
- ✅ 构建 Web 应用
- ✅ 初始化 Android 项目
- ✅ 生成 APK 文件

### 方法 2: 使用 npm 命令

```bash
# 1. 安装依赖
npm install

# 2. 首次构建: 初始化 Android 项目
npm run android:init

# 3. 构建 Debug APK (测试用)
npm run android:build:debug

# 4. 或构建 Release APK (发布用,需要签名)
npm run android:build
```

## 📥 安装到设备

### 方法 1: 直接安装

1. 将生成的 APK 文件传输到 Android 设备
2. 在设备上启用"允许安装未知来源的应用"
   - 设置 > 安全 > 未知来源
3. 点击 APK 文件进行安装

### 方法 2: 使用 ADB

```bash
# 确保设备已连接并启用 USB 调试
adb devices

# 安装 APK
adb install pixivflow-debug.apk
```

## 📂 输出文件

构建成功后,APK 文件会被复制到项目根目录:

- **Debug 版本**: `pixivflow-debug.apk` (~10MB)
  - 可直接安装
  - 用于测试

- **Release 版本**: `pixivflow-release-unsigned.apk` (~8MB)
  - 需要签名才能安装
  - 用于发布

## 🔐 签名 Release APK (可选)

如果要发布应用,需要对 Release APK 进行签名。

### 1. 生成签名密钥

```bash
keytool -genkey -v -keystore pixivflow-release-key.keystore \
  -alias pixivflow -keyalg RSA -keysize 2048 -validity 10000
```

### 2. 配置签名

创建 `android/keystore.properties` 文件:

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

详细签名步骤请参考: [Android 构建指南](./docs/ANDROID_BUILD_GUIDE.md)

## 🔧 常见问题

### 问题: `ANDROID_HOME not set`

**解决方案**: 设置 ANDROID_HOME 环境变量

```bash
# macOS/Linux
export ANDROID_HOME=$HOME/Library/Android/sdk

# Windows: 在系统环境变量中设置
```

### 问题: `Java version not compatible`

**解决方案**: 安装 JDK 17 或更高版本

```bash
# macOS (使用 Homebrew)
brew install openjdk@17

# 设置 JAVA_HOME
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

### 问题: `Gradle build failed`

**解决方案**: 清理并重新构建

```bash
cd android
./gradlew clean
./gradlew assembleDebug
cd ..
```

### 问题: Android 项目不存在

**解决方案**: 运行初始化命令

```bash
npm run android:init
```

## 📱 应用功能

Android 应用包含完整的 PixivFlow WebUI 功能:

- ✅ 用户登录和认证
- ✅ 下载管理
- ✅ 文件浏览
- ✅ 配置管理
- ✅ 统计信息
- ✅ 日志查看
- ✅ 多语言支持 (中文/英文)

## 🔗 连接后端

应用需要连接到 PixivFlow 后端 API。

### 开发模式

在 `capacitor.config.ts` 中配置:

```typescript
server: {
  url: 'http://你的电脑IP:3001',
  cleartext: true
}
```

### 生产模式

应用会自动连接到配置的 API 地址。

## 📚 详细文档

- 📖 [移动应用快速入门](./docs/MOBILE_QUICK_START.md)
- 🤖 [Android 构建指南](./docs/ANDROID_BUILD_GUIDE.md)
- 🔧 [所有构建选项](./docs/BUILD_OPTIONS.md)
- 💻 [开发指南](./docs/DEVELOPMENT_GUIDE.md)

## 🆘 获取帮助

- 查看 [常见问题](./docs/MOBILE_QUICK_START.md#常见问题)
- 在 GitHub 上 [提交 Issue](https://github.com/zoidberg-xgd/pixivflow-webui/issues)
- 查看 [Capacitor 文档](https://capacitorjs.com/)

---

**提示**: 首次构建可能需要较长时间 (5-10 分钟),因为需要下载 Gradle 依赖。后续构建会快很多。

祝您构建顺利! 🎉
