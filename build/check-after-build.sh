#!/bin/bash

# 构建后验证脚本
# 检查构建产物是否正确生成

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_section() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo ""
}

# 错误计数器
ERROR_COUNT=0
WARNING_COUNT=0

# 获取脚本所在目录（项目根目录）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

print_section "构建后验证"

# 确定应用路径（可能是 Electron.app 或 PixivFlow.app）
APP_PATH=""
if [ -d "release/mac-arm64/PixivFlow.app" ]; then
    APP_PATH="release/mac-arm64/PixivFlow.app"
    print_success "找到应用: PixivFlow.app"
elif [ -d "release/mac-arm64/Electron.app" ]; then
    APP_PATH="release/mac-arm64/Electron.app"
    print_warning "应用名称仍为 Electron.app，afterPack 钩子可能未执行"
    WARNING_COUNT=$((WARNING_COUNT + 1))
else
    print_error "未找到构建的应用 (release/mac-arm64/PixivFlow.app 或 Electron.app)"
    ERROR_COUNT=$((ERROR_COUNT + 1))
    exit 1
fi

RESOURCES_PATH="$APP_PATH/Contents/Resources"

# 1. 检查 app.asar
print_info "检查 app.asar..."
if [ -f "$RESOURCES_PATH/app.asar" ]; then
    ASAR_SIZE=$(ls -lh "$RESOURCES_PATH/app.asar" | awk '{print $5}')
    print_success "app.asar 存在 (大小: $ASAR_SIZE)"
    
    # 检查 app.asar 内容
    if command -v asar &> /dev/null; then
        ASAR_FILE_COUNT=$(asar list "$RESOURCES_PATH/app.asar" 2>/dev/null | wc -l | tr -d ' ' || echo "0")
        if [ "$ASAR_FILE_COUNT" -gt 0 ]; then
            print_success "app.asar 包含 $ASAR_FILE_COUNT 个文件/目录"
            
            # 检查关键文件
            if asar list "$RESOURCES_PATH/app.asar" 2>/dev/null | grep -q "package.json"; then
                print_success "app.asar 包含 package.json"
            else
                print_error "app.asar 不包含 package.json"
                ERROR_COUNT=$((ERROR_COUNT + 1))
            fi
            
            if asar list "$RESOURCES_PATH/app.asar" 2>/dev/null | grep -q "electron/main.cjs"; then
                print_success "app.asar 包含 electron/main.cjs"
            else
                print_error "app.asar 不包含 electron/main.cjs"
                ERROR_COUNT=$((ERROR_COUNT + 1))
            fi
            
            # dist 文件现在在 extraResources/webui-dist 中，不在 app.asar 中
            # 检查 app.asar 中是否有 dist 目录（旧配置）或检查 webui-dist（新配置）
            if asar list "$RESOURCES_PATH/app.asar" 2>/dev/null | grep -q "dist/index.html"; then
                print_success "app.asar 包含 dist/index.html"
            elif [ -f "$RESOURCES_PATH/webui-dist/index.html" ]; then
                print_success "前端文件在 webui-dist 目录中（extraResources）"
            else
                print_warning "app.asar 不包含 dist/index.html，且 webui-dist 也不存在"
                print_info "  前端文件应该在 extraResources/webui-dist 中"
                WARNING_COUNT=$((WARNING_COUNT + 1))
            fi
        else
            print_warning "app.asar 似乎是空的"
            WARNING_COUNT=$((WARNING_COUNT + 1))
        fi
    else
        print_warning "未安装 asar 工具，无法检查 app.asar 内容"
        print_info "  安装方法: npm install -g asar"
    fi
else
    print_error "app.asar 不存在！"
    print_error "  路径: $RESOURCES_PATH/app.asar"
    ERROR_COUNT=$((ERROR_COUNT + 1))
    
    # 检查是否有 app 目录（未打包为 asar）
    if [ -d "$RESOURCES_PATH/app" ]; then
        print_warning "发现 app 目录（未打包为 asar），asar 配置可能未生效"
        WARNING_COUNT=$((WARNING_COUNT + 1))
    fi
fi

# 2. 检查 pixivflow
print_info "检查 pixivflow 后端..."
PIXIVFLOW_PATH="$RESOURCES_PATH/pixivflow"
if [ -d "$PIXIVFLOW_PATH" ]; then
    PIXIVFLOW_SIZE=$(du -sh "$PIXIVFLOW_PATH" 2>/dev/null | cut -f1)
    print_success "pixivflow 目录存在 (大小: $PIXIVFLOW_SIZE)"
    
    # 检查关键文件
    if [ -f "$PIXIVFLOW_PATH/package.json" ]; then
        print_success "pixivflow/package.json 存在"
        
        # 检查入口文件（pixivflow 的入口文件在 dist/index.js）
        PIXIVFLOW_MAIN=$(node -e "console.log(require('$PIXIVFLOW_PATH/package.json').main || 'index.js')" 2>/dev/null || echo "dist/index.js")
        
        if [ -f "$PIXIVFLOW_PATH/$PIXIVFLOW_MAIN" ]; then
            print_success "pixivflow 入口文件存在: $PIXIVFLOW_MAIN"
        else
            # 尝试查找 dist/index.js（pixivflow 的实际入口）
            if [ -f "$PIXIVFLOW_PATH/dist/index.js" ]; then
                print_success "pixivflow 入口文件存在: dist/index.js"
            else
                print_error "pixivflow 入口文件不存在 (main: $PIXIVFLOW_MAIN)"
                ERROR_COUNT=$((ERROR_COUNT + 1))
            fi
        fi
        
        # 检查关键目录
        if [ -d "$PIXIVFLOW_PATH/dist" ]; then
            print_success "pixivflow/dist 目录存在"
        else
            print_warning "pixivflow/dist 目录不存在"
            WARNING_COUNT=$((WARNING_COUNT + 1))
        fi
    else
        print_error "pixivflow/package.json 不存在"
        ERROR_COUNT=$((ERROR_COUNT + 1))
    fi
    
    # 检查文件数量
    PIXIVFLOW_FILE_COUNT=$(find "$PIXIVFLOW_PATH" -type f | wc -l | tr -d ' ')
    print_info "  pixivflow 包含 $PIXIVFLOW_FILE_COUNT 个文件"
    
    if [ "$PIXIVFLOW_FILE_COUNT" -lt 10 ]; then
        print_warning "pixivflow 文件数量过少，可能未完整复制"
        WARNING_COUNT=$((WARNING_COUNT + 1))
    fi
else
    print_error "pixivflow 目录不存在！"
    print_error "  路径: $PIXIVFLOW_PATH"
    ERROR_COUNT=$((ERROR_COUNT + 1))
    
    # 检查是否在其他位置
    if [ -d "$RESOURCES_PATH/../app.asar.unpacked/pixivflow" ]; then
        print_warning "pixivflow 在 app.asar.unpacked 目录中"
        WARNING_COUNT=$((WARNING_COUNT + 1))
    fi
fi

# 3. 检查可执行文件
print_info "检查可执行文件..."
EXECUTABLE_PATH="$APP_PATH/Contents/MacOS"
if [ -d "$EXECUTABLE_PATH" ]; then
    EXECUTABLE_NAME=$(ls "$EXECUTABLE_PATH" 2>/dev/null | head -1)
    if [ -n "$EXECUTABLE_NAME" ]; then
        if [ "$EXECUTABLE_NAME" = "PixivFlow" ]; then
            print_success "可执行文件名称正确: $EXECUTABLE_NAME"
        elif [ "$EXECUTABLE_NAME" = "Electron" ]; then
            print_warning "可执行文件名称仍为 Electron，应重命名为 PixivFlow"
            WARNING_COUNT=$((WARNING_COUNT + 1))
        else
            print_warning "可执行文件名称: $EXECUTABLE_NAME"
            WARNING_COUNT=$((WARNING_COUNT + 1))
        fi
        
        if [ -x "$EXECUTABLE_PATH/$EXECUTABLE_NAME" ]; then
            print_success "可执行文件有执行权限"
        else
            print_error "可执行文件没有执行权限"
            ERROR_COUNT=$((ERROR_COUNT + 1))
        fi
    else
        print_error "未找到可执行文件"
        ERROR_COUNT=$((ERROR_COUNT + 1))
    fi
else
    print_error "MacOS 目录不存在"
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

# 4. 检查前端静态文件（webui-dist）
print_info "检查前端静态文件..."
WEBUI_DIST_PATH="$RESOURCES_PATH/webui-dist"
if [ -d "$WEBUI_DIST_PATH" ]; then
    if [ -f "$WEBUI_DIST_PATH/index.html" ]; then
        print_success "webui-dist/index.html 存在（extraResources）"
    else
        print_warning "webui-dist 目录存在，但 index.html 不存在"
        WARNING_COUNT=$((WARNING_COUNT + 1))
    fi
else
    print_warning "webui-dist 目录不存在（前端文件可能在 app.asar 中）"
    WARNING_COUNT=$((WARNING_COUNT + 1))
fi

# 5. 检查应用大小
print_info "检查应用大小..."
APP_SIZE=$(du -sh "$APP_PATH" 2>/dev/null | cut -f1)
print_info "应用总大小: $APP_SIZE"

# 总结
print_section "验证结果"

if [ $ERROR_COUNT -eq 0 ] && [ $WARNING_COUNT -eq 0 ]; then
    print_success "所有检查通过！应用构建成功。"
    exit 0
elif [ $ERROR_COUNT -eq 0 ]; then
    print_warning "构建完成，但有 $WARNING_COUNT 个警告。"
    exit 0
else
    print_error "构建失败！发现 $ERROR_COUNT 个错误，$WARNING_COUNT 个警告。"
    print_error "请检查 electron-builder.yml 配置和构建日志。"
    exit 1
fi

