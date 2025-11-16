#!/bin/bash

# 构建脚本 - 带进度显示和优化
# 使用方法: ./build-with-progress.sh [mac|win|linux]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 进度显示函数
print_step() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}▶ $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# 计时函数
start_timer() {
    START_TIME=$(date +%s)
}

end_timer() {
    END_TIME=$(date +%s)
    ELAPSED=$((END_TIME - START_TIME))
    echo -e "\n${GREEN}⏱  耗时: ${ELAPSED}秒${NC}\n"
}

# 获取平台参数
PLATFORM=${1:-mac}

print_step "[object Object]PixivFlow WebUI - $PLATFORM 平台"
start_timer

# 步骤 1: 清理旧的构建
print_step "步骤 1/5: 清理旧的构建文件"
print_info "清理 dist 目录..."
rm -rf dist
print_info "清理 release 目录..."
rm -rf release
print_success "清理完成"

# 步骤 2: 检查依赖
print_step "步骤 2/5: 检查依赖"
if [ ! -d "node_modules/pixivflow" ]; then
    print_warning "pixivflow 未安装，正在安装..."
    npm install --save-dev pixivflow
    print_success "pixivflow 安装完成"
else
    print_success "pixivflow 已安装"
fi

# 步骤 3: 构建前端
print_step "步骤 3/5: 构建前端 (TypeScript + Vite)"
print_info "运行 TypeScript 编译..."
npm run build 2>&1 | while IFS= read -r line; do
    echo "  $line"
done
print_success "前端构建完成"

# 步骤 4: 验证 pixivflow
print_step "步骤 4/5: 验证 pixivflow 后端"
if [ -d "node_modules/pixivflow" ]; then
    PIXIVFLOW_VERSION=$(node -p "require('./node_modules/pixivflow/package.json').version" 2>/dev/null || echo "未知")
    print_success "pixivflow 版本: $PIXIVFLOW_VERSION"
    
    # 显示 pixivflow 大小
    PIXIVFLOW_SIZE=$(du -sh node_modules/pixivflow 2>/dev/null | cut -f1 || echo "未知")
    print_info "pixivflow 大小: $PIXIVFLOW_SIZE"
else
    print_error "pixivflow 未找到！"
    exit 1
fi

# 步骤 5: 打包 Electron 应用
print_step "步骤 5/5: 打包 Electron 应用 - $PLATFORM"

case $PLATFORM in
    mac)
        print_info "目标平台: macOS (arm64)"
        print_info "使用 electron-builder 打包..."
        npx electron-builder --mac --arm64 2>&1 | while IFS= read -r line; do
            # 过滤并美化输出
            if [[ $line == *"packaging"* ]]; then
                echo -e "${CYAN}  📦 $line${NC}"
            elif [[ $line == *"building"* ]]; then
                echo -e "${BLUE}  🔨 $line${NC}"
            elif [[ $line == *"completed"* ]]; then
                echo -e "${GREEN}  ✓ $line${NC}"
            elif [[ $line == *"error"* ]] || [[ $line == *"Error"* ]]; then
                echo -e "${RED}  ✗ $line${NC}"
            elif [[ $line == *"warning"* ]] || [[ $line == *"Warning"* ]]; then
                echo -e "${YELLOW}  ⚠ $line${NC}"
            else
                echo "  $line"
            fi
        done
        ;;
    win)
        print_info "目标平台: Windows"
        npx electron-builder --win 2>&1 | while IFS= read -r line; do
            echo "  $line"
        done
        ;;
    linux)
        print_info "目标平台: Linux"
        npx electron-builder --linux 2>&1 | while IFS= read -r line; do
            echo "  $line"
        done
        ;;
    *)
        print_error "未知平台: $PLATFORM"
        print_info "支持的平台: mac, win, linux"
        exit 1
        ;;
esac

print_success "Electron 应用打包完成"

# 修复应用名称（electron-builder 有时会生成 Electron.app 而不是 PixivFlow.app）
if [ "$PLATFORM" = "mac" ]; then
    OLD_APP_PATH="release/mac-arm64/Electron.app"
    NEW_APP_PATH="release/mac-arm64/PixivFlow.app"
    
    if [ -d "$OLD_APP_PATH" ] && [ ! -d "$NEW_APP_PATH" ]; then
        print_info "重命名应用: Electron.app -> PixivFlow.app"
        mv "$OLD_APP_PATH" "$NEW_APP_PATH"
        print_success "✓ 应用重命名成功"
    fi
fi

# 验证构建结果
print_step "📊 构建结果验证"

if [ "$PLATFORM" = "mac" ]; then
    APP_PATH="release/mac-arm64/PixivFlow.app"
    if [ -d "$APP_PATH" ]; then
        print_success "应用已生成: $APP_PATH"
        
        # 检查应用大小
        APP_SIZE=$(du -sh "$APP_PATH" 2>/dev/null | cut -f1 || echo "未知")
        print_info "应用大小: $APP_SIZE"
        
        # 检查 Resources 目录
        RESOURCES_PATH="$APP_PATH/Contents/Resources"
        if [ -d "$RESOURCES_PATH/pixivflow" ]; then
            print_success "✓ pixivflow 后端已复制到 Resources"
            BACKEND_SIZE=$(du -sh "$RESOURCES_PATH/pixivflow" 2>/dev/null | cut -f1 || echo "未知")
            print_info "  后端大小: $BACKEND_SIZE"
        else
            print_warning "⚠ pixivflow 后端未找到在 Resources 中"
            print_info "  检查路径: $RESOURCES_PATH"
            print_info "  可用文件:"
            ls -la "$RESOURCES_PATH" 2>/dev/null | head -10 || echo "  无法列出文件"
        fi
        
        # 检查前端文件
        if [ -d "$RESOURCES_PATH/app.asar" ] || [ -d "$RESOURCES_PATH/app" ]; then
            print_success "✓ 前端文件已打包"
        fi
    else
        print_error "应用未生成: $APP_PATH"
        print_info "检查 release 目录:"
        ls -la release/ 2>/dev/null || echo "  release 目录为空"
    fi
fi

end_timer

print_step "🎉 构建完成！"
print_info "输出目录: release/"

# 显示下一步操作
echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}下一步操作:${NC}"
echo -e "  1. 测试应用: open release/mac-arm64/PixivFlow.app"
echo -e "  2. 查看日志: 应用内查看控制台输出"
echo -e "  3. 分发应用: 将 .app 文件分发给用户"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

