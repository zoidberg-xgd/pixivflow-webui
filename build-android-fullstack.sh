#!/bin/bash

# PixivFlow Android 全栈 APK 构建脚本
# 构建包含前端和后端的完整 Android 应用

set -e

echo "======================================"
echo "PixivFlow 全栈 Android APK 构建"
echo "======================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 检查是否安装了 nodejs-mobile
echo "检查 nodejs-mobile-capacitor..."
if ! npm list nodejs-mobile-capacitor > /dev/null 2>&1; then
    echo -e "${YELLOW}未找到 nodejs-mobile-capacitor${NC}"
    echo ""
    echo "要构建包含后端的完整应用,需要安装 nodejs-mobile-capacitor"
    echo ""
    read -p "是否现在安装? (y/n): " INSTALL_NODEJS_MOBILE
    
    if [ "$INSTALL_NODEJS_MOBILE" = "y" ] || [ "$INSTALL_NODEJS_MOBILE" = "Y" ]; then
        echo "安装 nodejs-mobile-capacitor..."
        npm install nodejs-mobile-capacitor
        echo -e "${GREEN}✓ 安装完成${NC}"
    else
        echo -e "${RED}取消构建${NC}"
        echo ""
        echo "提示: 如果只需要前端 APK,请使用 ./build-android.sh"
        exit 1
    fi
fi

echo -e "${GREEN}✓ nodejs-mobile-capacitor 已安装${NC}"
echo ""

# 询问后端代码位置
echo "======================================"
echo "后端代码配置"
echo "======================================"
echo ""
echo "请选择后端代码来源:"
echo "1) 使用 npm 包 (pixivflow)"
echo "2) 使用本地后端代码目录"
echo "3) 跳过后端配置 (仅构建前端)"
read -p "请选择 (1/2/3): " BACKEND_SOURCE

NODEJS_PROJECT_DIR="nodejs-assets/nodejs-project"

if [ "$BACKEND_SOURCE" = "1" ]; then
    echo ""
    echo "配置使用 npm 包..."
    
    # 创建 Node.js 项目目录
    mkdir -p "$NODEJS_PROJECT_DIR"
    cd "$NODEJS_PROJECT_DIR"
    
    # 初始化 package.json (如果不存在)
    if [ ! -f "package.json" ]; then
        cat > package.json << 'EOF'
{
  "name": "pixivflow-backend-mobile",
  "version": "1.0.0",
  "description": "PixivFlow backend for Android",
  "main": "main.js",
  "dependencies": {}
}
EOF
    fi
    
    # 询问包名
    read -p "请输入后端 npm 包名 (默认: pixivflow): " BACKEND_PACKAGE
    BACKEND_PACKAGE=${BACKEND_PACKAGE:-pixivflow}
    
    echo "安装 $BACKEND_PACKAGE..."
    npm install "$BACKEND_PACKAGE"
    
    # 创建启动脚本
    cat > main.js << 'EOF'
// PixivFlow 后端启动脚本 (Android)
const http = require('http');

console.log('[Backend] Starting PixivFlow backend on Android...');

try {
  // 导入后端包
  const pixivflow = require('pixivflow');
  
  // 启动配置
  const PORT = 3001;
  const HOST = '127.0.0.1';
  
  // 启动后端
  pixivflow.start({
    port: PORT,
    host: HOST,
  }).then(() => {
    console.log(`[Backend] Running on http://${HOST}:${PORT}`);
    
    // 通知前端
    if (typeof rn_bridge !== 'undefined') {
      rn_bridge.channel.send('backend-ready');
    }
  }).catch(err => {
    console.error('[Backend] Failed to start:', err);
  });
  
  // 接收前端消息
  if (typeof rn_bridge !== 'undefined') {
    rn_bridge.channel.on('message', (msg) => {
      console.log('[Backend] Message from frontend:', msg);
    });
  }
} catch (error) {
  console.error('[Backend] Error:', error);
}
EOF
    
    cd ../..
    echo -e "${GREEN}✓ 后端配置完成${NC}"
    
elif [ "$BACKEND_SOURCE" = "2" ]; then
    echo ""
    read -p "请输入后端代码目录路径: " BACKEND_PATH
    
    if [ ! -d "$BACKEND_PATH" ]; then
        echo -e "${RED}错误: 目录不存在${NC}"
        exit 1
    fi
    
    echo "复制后端代码..."
    mkdir -p "$NODEJS_PROJECT_DIR"
    cp -r "$BACKEND_PATH"/* "$NODEJS_PROJECT_DIR/"
    
    # 安装依赖
    cd "$NODEJS_PROJECT_DIR"
    if [ -f "package.json" ]; then
        echo "安装后端依赖..."
        npm install
    fi
    cd ../..
    
    echo -e "${GREEN}✓ 后端代码已复制${NC}"
    
elif [ "$BACKEND_SOURCE" = "3" ]; then
    echo -e "${YELLOW}跳过后端配置${NC}"
    echo "将构建仅包含前端的 APK"
else
    echo -e "${RED}无效选项${NC}"
    exit 1
fi

echo ""
echo "======================================"
echo "开始构建流程"
echo "======================================"
echo ""

# 步骤 1: 安装前端依赖
echo "步骤 1/6: 安装前端依赖..."
npm install
echo -e "${GREEN}✓ 完成${NC}"
echo ""

# 步骤 2: 构建前端
echo "步骤 2/6: 构建前端应用..."
npm run build
echo -e "${GREEN}✓ 完成${NC}"
echo ""

# 步骤 3: 检查 Android 项目
echo "步骤 3/6: 检查 Android 项目..."
if [ ! -d "android" ]; then
    echo "初始化 Android 项目..."
    npx cap add android
fi
echo -e "${GREEN}✓ 完成${NC}"
echo ""

# 步骤 4: 同步到 Android
echo "步骤 4/6: 同步到 Android..."
npx cap sync android
echo -e "${GREEN}✓ 完成${NC}"
echo ""

# 步骤 5: 构建 APK
echo "步骤 5/6: 构建 APK..."
cd android

read -p "构建类型 (1=Debug, 2=Release, 默认=1): " BUILD_TYPE
BUILD_TYPE=${BUILD_TYPE:-1}

if [ "$BUILD_TYPE" = "2" ]; then
    ./gradlew assembleRelease
    APK_PATH="app/build/outputs/apk/release/app-release-unsigned.apk"
    OUTPUT_NAME="pixivflow-fullstack-release-unsigned.apk"
else
    ./gradlew assembleDebug
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    OUTPUT_NAME="pixivflow-fullstack-debug.apk"
fi

cd ..
echo -e "${GREEN}✓ 完成${NC}"
echo ""

# 步骤 6: 复制 APK
echo "步骤 6/6: 复制 APK..."
if [ -f "android/$APK_PATH" ]; then
    cp "android/$APK_PATH" "$OUTPUT_NAME"
    
    APK_SIZE=$(du -h "$OUTPUT_NAME" | cut -f1)
    
    echo ""
    echo -e "${GREEN}======================================"
    echo "✓ 构建成功!"
    echo "======================================${NC}"
    echo ""
    echo "APK 文件: $OUTPUT_NAME"
    echo "文件大小: $APK_SIZE"
    echo ""
    
    if [ "$BACKEND_SOURCE" != "3" ]; then
        echo -e "${BLUE}这是一个包含前后端的完整应用!${NC}"
        echo ""
        echo "功能:"
        echo "  ✓ 前端 React 应用"
        echo "  ✓ 后端 Node.js API"
        echo "  ✓ 完全离线运行"
        echo ""
        echo "注意事项:"
        echo "  - 首次启动需要 5-15 秒初始化后端"
        echo "  - 后端运行在 http://127.0.0.1:3001"
        echo "  - 需要网络和存储权限"
    else
        echo -e "${YELLOW}这是仅包含前端的 APK${NC}"
        echo "需要连接到外部后端服务器"
    fi
    
    echo ""
    echo "安装方法:"
    echo "  adb install $OUTPUT_NAME"
    echo ""
else
    echo -e "${RED}错误: APK 文件未找到${NC}"
    exit 1
fi

echo -e "${GREEN}======================================"
echo "构建完成!"
echo "======================================${NC}"

