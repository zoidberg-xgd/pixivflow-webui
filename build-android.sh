#!/bin/bash

# PixivFlow Android APK 构建脚本
# 用于构建 Android 应用的 APK 文件

set -e  # 遇到错误时退出

echo "======================================"
echo "PixivFlow Android APK 构建脚本"
echo "======================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Node.js
echo "检查 Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: 未找到 Node.js${NC}"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Node.js 版本: $(node -v)${NC}"

# 检查 npm
echo "检查 npm..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}错误: 未找到 npm${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm 版本: $(npm -v)${NC}"

# 检查 Java (Android 构建需要)
echo "检查 Java..."
if ! command -v java &> /dev/null; then
    echo -e "${RED}错误: 未找到 Java${NC}"
    echo "请安装 JDK 17 或更高版本"
    echo "推荐使用 OpenJDK: https://adoptium.net/"
    exit 1
fi
JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
echo -e "${GREEN}✓ Java 版本: $(java -version 2>&1 | head -n 1)${NC}"

if [ "$JAVA_VERSION" -lt 17 ]; then
    echo -e "${YELLOW}警告: 建议使用 Java 17 或更高版本${NC}"
fi

# 检查 Android SDK
echo "检查 Android SDK..."
if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
    echo -e "${YELLOW}警告: 未设置 ANDROID_HOME 或 ANDROID_SDK_ROOT 环境变量${NC}"
    echo "Android SDK 路径未配置,将尝试使用默认路径"
    
    # 尝试常见的 Android SDK 路径
    if [ -d "$HOME/Android/Sdk" ]; then
        export ANDROID_HOME="$HOME/Android/Sdk"
        echo -e "${GREEN}✓ 找到 Android SDK: $ANDROID_HOME${NC}"
    elif [ -d "$HOME/Library/Android/sdk" ]; then
        export ANDROID_HOME="$HOME/Library/Android/sdk"
        echo -e "${GREEN}✓ 找到 Android SDK: $ANDROID_HOME${NC}"
    else
        echo -e "${RED}错误: 未找到 Android SDK${NC}"
        echo "请安装 Android Studio 或 Android SDK"
        echo "下载地址: https://developer.android.com/studio"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Android SDK: ${ANDROID_HOME:-$ANDROID_SDK_ROOT}${NC}"
fi

echo ""
echo "======================================"
echo "开始构建流程"
echo "======================================"
echo ""

# 步骤 1: 安装依赖
echo "步骤 1/5: 安装依赖..."
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "依赖已安装,跳过..."
fi
echo -e "${GREEN}✓ 依赖安装完成${NC}"
echo ""

# 步骤 2: 构建 Web 应用
echo "步骤 2/5: 构建 Web 应用..."
npm run build
echo -e "${GREEN}✓ Web 应用构建完成${NC}"
echo ""

# 步骤 3: 检查/初始化 Android 项目
echo "步骤 3/5: 检查 Android 项目..."
if [ ! -d "android" ]; then
    echo "Android 项目不存在,正在初始化..."
    npx cap add android
    echo -e "${GREEN}✓ Android 项目初始化完成${NC}"
else
    echo "Android 项目已存在"
fi
echo ""

# 步骤 4: 同步到 Android 项目
echo "步骤 4/5: 同步到 Android 项目..."
npx cap sync android
echo -e "${GREEN}✓ 同步完成${NC}"
echo ""

# 步骤 5: 构建 APK
echo "步骤 5/5: 构建 APK..."
cd android

# 询问构建类型
echo ""
echo "请选择构建类型:"
echo "1) Debug APK (调试版本,可直接安装)"
echo "2) Release APK (发布版本,需要签名)"
read -p "请输入选项 (1 或 2, 默认为 1): " BUILD_TYPE
BUILD_TYPE=${BUILD_TYPE:-1}

if [ "$BUILD_TYPE" = "2" ]; then
    echo "构建 Release APK..."
    ./gradlew assembleRelease
    
    APK_PATH="app/build/outputs/apk/release/app-release-unsigned.apk"
    if [ -f "$APK_PATH" ]; then
        echo ""
        echo -e "${GREEN}======================================"
        echo "✓ 构建成功!"
        echo "======================================${NC}"
        echo ""
        echo "APK 位置: android/$APK_PATH"
        echo ""
        echo -e "${YELLOW}注意: 这是一个未签名的 Release APK${NC}"
        echo "在发布前需要进行签名,请参考 ANDROID_BUILD_GUIDE.md"
        echo ""
        
        # 复制到项目根目录
        cp "$APK_PATH" "../pixivflow-release-unsigned.apk"
        echo "已复制到: pixivflow-release-unsigned.apk"
    else
        echo -e "${RED}错误: APK 文件未找到${NC}"
        exit 1
    fi
else
    echo "构建 Debug APK..."
    ./gradlew assembleDebug
    
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    if [ -f "$APK_PATH" ]; then
        echo ""
        echo -e "${GREEN}======================================"
        echo "✓ 构建成功!"
        echo "======================================${NC}"
        echo ""
        echo "APK 位置: android/$APK_PATH"
        echo ""
        echo "这是一个 Debug APK,可以直接安装到设备上进行测试"
        echo ""
        
        # 复制到项目根目录
        cp "$APK_PATH" "../pixivflow-debug.apk"
        echo "已复制到: pixivflow-debug.apk"
        echo ""
        echo "安装方法:"
        echo "1. 将 APK 文件传输到 Android 设备"
        echo "2. 在设备上启用'未知来源'安装"
        echo "3. 点击 APK 文件进行安装"
        echo ""
        echo "或使用 adb 安装:"
        echo "adb install pixivflow-debug.apk"
    else
        echo -e "${RED}错误: APK 文件未找到${NC}"
        exit 1
    fi
fi

cd ..

echo ""
echo -e "${GREEN}======================================"
echo "构建流程完成!"
echo "======================================${NC}"

