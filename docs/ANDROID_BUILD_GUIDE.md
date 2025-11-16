# PixivFlow Android 构建指南

本文档提供了为 PixivFlow WebUI 构建 Android APK 的详细步骤,包括环境准备、构建调试版本和构建用于发布的签名版本。

## 目录

- [前置要求](#前置要求)
- [快速构建 (使用脚本)](#快速构建-使用脚本)
- [手动构建步骤](#手动构建步骤)
- [构建发布 (Release) APK](#构建发布-release-apk)
  - [1. 生成签名密钥](#1-生成签名密钥)
  - [2. 配置签名信息](#2-配置签名信息)
  - [3. 构建签名的 APK](#3-构建签名的-apk)
- [在设备上安装](#在设备上安装)

---

## 前置要求

在开始之前,请确保您的开发环境满足以下要求:

1.  **Node.js 和 npm**
    - Node.js 18 或更高版本。

2.  **Java Development Kit (JDK)**
    - JDK 17 或更高版本。推荐使用 [OpenJDK](https://adoptium.net/)。

3.  **Android Studio**
    - 安装最新版本的 [Android Studio](https://developer.android.com/studio)。
    - 通过 Android Studio 的 SDK Manager 安装 **Android SDK Platform** (推荐最新版本) 和 **Android SDK Command-line Tools**。

4.  **配置环境变量**
    - 设置 `ANDROID_HOME` (或 `ANDROID_SDK_ROOT`) 环境变量,指向您的 Android SDK 安装路径。
      - **macOS/Linux**: `export ANDROID_HOME=$HOME/Library/Android/sdk`
      - **Windows**: 在系统环境变量中设置 `ANDROID_HOME` 为 `C:\Users\<Your-User>\AppData\Local\Android\Sdk`
    - 将 Android SDK 的 `platform-tools` 和 `cmdline-tools` 添加到系统 `PATH`。

---

## 快速构建 (使用脚本)

项目提供了一个自动化构建脚本 `build-android.sh`,可以简化构建过程 (仅限 macOS/Linux)。

1.  **授予执行权限** (只需一次)
    ```bash
    chmod +x build-android.sh
    ```

2.  **运行构建脚本**
    ```bash
    ./build-android.sh
    ```

脚本将引导您完成以下步骤:
- 检查环境依赖
- 安装 npm 依赖
- 构建 Web 应用
- 初始化或同步 Android 项目
- 选择构建 `Debug` 或 `Release` APK

构建成功后,APK 文件将被复制到项目根目录:
- **Debug**: `pixivflow-debug.apk`
- **Release**: `pixivflow-release-unsigned.apk` (未签名)

---

## 手动构建步骤

如果您想手动执行构建流程,请按以下步骤操作:

1.  **安装 npm 依赖**
    ```bash
    npm install
    ```

2.  **构建 Web 项目**
    ```bash
    npm run build
    ```

3.  **添加 Android 平台** (仅在首次构建时需要)
    ```bash
    npx cap add android
    ```

4.  **同步 Web 资源到 Android 项目**
    ```bash
    npx cap sync android
    ```

5.  **打开 Android Studio**
    ```bash
    npx cap open android
    ```

6.  **在 Android Studio 中构建**
    - 在 Android Studio 中,等待 Gradle 同步完成。
    - 通过菜单 `Build` > `Build Bundle(s) / APK(s)` > `Build APK(s)` 来构建 APK。
    - 构建完成后,可以在 `android/app/build/outputs/apk/debug/` 目录下找到 `app-debug.apk`。

---

## 构建发布 (Release) APK

要创建一个可以发布到应用商店的 APK,您需要对其进行签名。

### 1. 生成签名密钥

如果您还没有签名密钥,请使用 `keytool` 命令生成一个。此命令将包含在 JDK 中。

```bash
keytool -genkey -v -keystore pixivflow-release-key.keystore -alias pixivflow -keyalg RSA -keysize 2048 -validity 10000
```

- 系统会提示您输入密钥库密码、密钥密码以及一些个人信息。
- **请务必妥善保管生成的 `pixivflow-release-key.keystore` 文件,并记住您的密码。如果丢失,您将无法更新您的应用。**

### 2. 配置签名信息

为了让 Gradle 在构建时自动签名,您可以创建一个 `keystore.properties` 文件。

1.  **创建 `android/keystore.properties` 文件** (此文件已被 `.gitignore` 忽略,不会提交到版本库)。

2.  **在文件中添加以下内容**,并替换为您的实际信息:

    ```properties
    storePassword=<您的密钥库密码>
    keyAlias=pixivflow
    keyPassword=<您的密钥密码>
    storeFile=../pixivflow-release-key.keystore
    ```

    - `storeFile` 的路径是相对于 `android/app` 目录的,所以我们使用 `../` 来指向位于 `android` 目录下的密钥文件。

3.  **将密钥文件移动到 `android/` 目录**
    - 将您在步骤 1 中生成的 `pixivflow-release-key.keystore` 文件移动到 `android/` 目录下。

### 3. 构建签名的 APK

现在,您可以运行 Gradle 命令来构建签名的 Release APK。

```bash
npm run android:build
```

或者进入 `android` 目录手动执行:

```bash
cd android
./gradlew assembleRelease
cd ..
```

构建成功后,签名的 APK 将位于 `android/app/build/outputs/apk/release/app-release.apk`。

---

## 在设备上安装

- **Debug APK**: 可以直接安装在任何启用了“允许安装未知来源应用”的 Android 设备上进行测试。
- **Release APK**: 签名的 APK 可以上传到 Google Play Store 或其他应用商店,也可以直接分发给用户安装。

您可以使用 Android Debug Bridge (adb) 来安装 APK:

```bash
adb install path/to/your/app.apk
```

