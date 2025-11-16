# PixivFlow 移动应用快速入门

本指南将帮助您快速构建 PixivFlow 的 Android 和 iOS 移动应用。

## 🚀 快速构建 Android APK

### 前置要求

1. **Node.js 18+** - [下载](https://nodejs.org/)
2. **Java JDK 17+** - [下载 OpenJDK](https://adoptium.net/)
3. **Android Studio** - [下载](https://developer.android.com/studio)

### 环境配置

#### macOS/Linux

```bash
# 设置 Android SDK 路径
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
# 或
export ANDROID_HOME=$HOME/Android/Sdk          # Linux

# 添加到 PATH
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
```

将上述命令添加到 `~/.bashrc` 或 `~/.zshrc` 以永久生效。

#### Windows

1. 打开"系统属性" > "高级" > "环境变量"
2. 添加系统变量:
   - 变量名: `ANDROID_HOME`
   - 变量值: `C:\Users\<你的用户名>\AppData\Local\Android\Sdk`
3. 编辑 `Path` 变量,添加:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\cmdline-tools\latest\bin`

### 一键构建 (推荐)

#### macOS/Linux

```bash
# 1. 克隆项目
git clone https://github.com/zoidberg-xgd/pixivflow-webui.git
cd pixivflow-webui

# 2. 安装依赖
npm install

# 3. 运行构建脚本
./build-android.sh
```

脚本会自动:
- ✅ 检查所有依赖
- ✅ 构建 Web 应用
- ✅ 初始化 Android 项目
- ✅ 生成 APK 文件

构建完成后,APK 文件位于: `pixivflow-debug.apk`

#### Windows

```bash
# 1. 克隆项目
git clone https://github.com/zoidberg-xgd/pixivflow-webui.git
cd pixivflow-webui

# 2. 安装依赖
npm install

# 3. 初始化 Android 项目
npm run android:init

# 4. 构建 Debug APK
npm run android:build:debug
```

APK 文件位于: `android/app/build/outputs/apk/debug/app-debug.apk`

### 手动构建步骤

如果自动脚本失败,可以尝试手动构建:

```bash
# 1. 安装依赖
npm install

# 2. 构建 Web 应用
npm run build

# 3. 添加 Android 平台 (仅首次)
npx cap add android

# 4. 同步资源
npx cap sync android

# 5. 打开 Android Studio
npx cap open android

# 6. 在 Android Studio 中:
#    - 等待 Gradle 同步完成
#    - 点击 Build > Build Bundle(s) / APK(s) > Build APK(s)
```

---

## 📱 安装到设备

### 方法 1: 直接安装

1. 将 APK 文件传输到 Android 设备
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

---

## 🍎 构建 iOS 应用

### 前置要求

- macOS 系统
- Xcode 14+
- CocoaPods

### 构建步骤

```bash
# 1. 安装依赖
npm install

# 2. 构建 Web 应用
npm run build

# 3. 同步到 iOS (如果还没有 ios 目录,先运行 npx cap add ios)
npm run ios:sync

# 4. 打开 Xcode
npm run ios:open

# 5. 在 Xcode 中:
#    - 选择开发团队 (需要 Apple 开发者账号)
#    - 选择目标设备或模拟器
#    - 点击 Run 按钮
```

---

## 🔧 常见问题

### Android 构建失败

**问题**: `ANDROID_HOME not set`
```bash
# 解决: 设置环境变量
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
export ANDROID_HOME=$HOME/Android/Sdk          # Linux
```

**问题**: `Java version not compatible`
```bash
# 解决: 安装 JDK 17+
# macOS (使用 Homebrew)
brew install openjdk@17

# 设置 JAVA_HOME
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

**问题**: `Gradle build failed`
```bash
# 解决: 清理并重新构建
cd android
./gradlew clean
./gradlew assembleDebug
```

### iOS 构建失败

**问题**: `Pod install failed`
```bash
# 解决: 更新 CocoaPods
cd ios/App
pod repo update
pod install
```

**问题**: `Signing certificate not found`
- 在 Xcode 中,选择项目 > Signing & Capabilities
- 选择您的开发团队
- 或使用"自动管理签名"

---

## 📦 构建发布版本

### Android Release APK

详细步骤请参考: [Android 构建指南](./ANDROID_BUILD_GUIDE.md)

简要步骤:
1. 生成签名密钥
2. 配置 `android/keystore.properties`
3. 运行 `npm run android:build`

### iOS App Store

1. 在 Xcode 中选择 `Product > Archive`
2. 上传到 App Store Connect
3. 提交审核

---

## 🔄 更新应用

当您更新了 Web 代码后,需要重新同步:

```bash
# 构建新的 Web 应用
npm run build

# 同步到移动平台
npm run mobile:sync  # 同步到所有平台
# 或
npm run android:sync  # 仅 Android
npm run ios:sync      # 仅 iOS

# 然后重新构建 APK/IPA
```

---

## 📚 更多资源

- [Android 详细构建指南](./ANDROID_BUILD_GUIDE.md)
- [Capacitor 官方文档](https://capacitorjs.com/)
- [Android 开发者文档](https://developer.android.com/)
- [iOS 开发者文档](https://developer.apple.com/)

---

## 💡 提示

1. **Debug vs Release**
   - Debug APK: 用于测试,可直接安装
   - Release APK: 用于发布,需要签名

2. **应用权限**
   - 应用需要网络权限来连接后端 API
   - 在 `android/app/src/main/AndroidManifest.xml` 中配置

3. **后端连接**
   - 确保移动应用能访问您的后端 API
   - 可能需要配置 CORS 和网络权限
   - 在 `capacitor.config.ts` 中配置 API 地址

4. **性能优化**
   - 移动设备性能有限,注意优化资源加载
   - 考虑使用懒加载和代码分割

---

需要帮助? 请在 GitHub 上提交 Issue!

