#!/bin/bash

# 构建前检查脚本
# 确保所有必要的文件存在，并在构建后验证打包结果

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印函数
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

# 检查函数
check_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        print_success "$description 存在: $file"
        return 0
    else
        print_error "$description 不存在: $file"
        ERROR_COUNT=$((ERROR_COUNT + 1))
        return 1
    fi
}

check_directory() {
    local dir=$1
    local description=$2
    
    if [ -d "$dir" ]; then
        print_success "$description 存在: $dir"
        return 0
    else
        print_error "$description 不存在: $dir"
        ERROR_COUNT=$((ERROR_COUNT + 1))
        return 1
    fi
}

# 获取脚本所在目录（项目根目录）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

print_section "构建前检查"

# 1. 检查基本文件
print_info "检查基本文件..."
check_file "package.json" "package.json"
check_file "electron/main.cjs" "Electron 主入口文件"
check_file "electron-builder.yml" "electron-builder 配置文件"

# 2. 检查构建产物
print_info "检查构建产物..."
if [ ! -d "dist" ]; then
    print_warning "dist 目录不存在，需要先运行 npm run build"
    ERROR_COUNT=$((ERROR_COUNT + 1))
else
    check_file "dist/index.html" "前端构建产物 (dist/index.html)"
    
    # 检查 dist 目录是否有内容
    if [ -z "$(ls -A dist 2>/dev/null)" ]; then
        print_error "dist 目录为空"
        ERROR_COUNT=$((ERROR_COUNT + 1))
    else
        print_success "dist 目录有内容"
        DIST_FILE_COUNT=$(find dist -type f | wc -l | tr -d ' ')
        print_info "  dist 目录包含 $DIST_FILE_COUNT 个文件"
    fi
fi

# 3. 检查 pixivflow 后端
print_info "检查 pixivflow 后端..."
if [ ! -d "node_modules/pixivflow" ]; then
    print_error "node_modules/pixivflow 不存在"
    print_info "  请运行: npm install"
    ERROR_COUNT=$((ERROR_COUNT + 1))
else
    print_success "node_modules/pixivflow 存在"
    check_file "node_modules/pixivflow/package.json" "pixivflow package.json"
    
    # 检查 pixivflow 的入口文件
    if [ -f "node_modules/pixivflow/package.json" ]; then
        PIXIVFLOW_MAIN=$(node -e "console.log(require('./node_modules/pixivflow/package.json').main || 'index.js')" 2>/dev/null || echo "index.js")
        PIXIVFLOW_BIN=$(node -e "const pkg = require('./node_modules/pixivflow/package.json'); console.log(pkg.bin ? (typeof pkg.bin === 'string' ? pkg.bin : (pkg.bin.pixivflow || 'index.js')) : 'index.js')" 2>/dev/null || echo "index.js")
        
        if [ -f "node_modules/pixivflow/$PIXIVFLOW_MAIN" ] || [ -f "node_modules/pixivflow/$PIXIVFLOW_BIN" ]; then
            print_success "pixivflow 入口文件存在"
        else
            print_warning "pixivflow 入口文件可能不存在 (main: $PIXIVFLOW_MAIN, bin: $PIXIVFLOW_BIN)"
        fi
        
        PIXIVFLOW_SIZE=$(du -sh "node_modules/pixivflow" 2>/dev/null | cut -f1)
        print_info "  pixivflow 大小: $PIXIVFLOW_SIZE"
    fi
fi

# 4. 检查 electron-builder 配置
print_info "检查 electron-builder 配置..."
if [ -f "electron-builder.yml" ]; then
    # 检查 asar 配置
    if grep -q "^asar: true" electron-builder.yml || grep -q "^asar:true" electron-builder.yml; then
        print_success "asar 配置为 true"
    else
        print_error "asar 配置未设置为 true"
        ERROR_COUNT=$((ERROR_COUNT + 1))
    fi
    
    # 检查 files 配置
    if grep -q "^files:" electron-builder.yml; then
        print_success "files 配置存在"
        print_info "  files 配置内容:"
        grep -A 10 "^files:" electron-builder.yml | head -15 | sed 's/^/    /'
    else
        print_warning "files 配置不存在，将使用默认配置"
    fi
    
    # 检查 extraResources 配置
    if grep -q "^extraResources:" electron-builder.yml; then
        print_success "extraResources 配置存在"
        print_info "  extraResources 配置内容:"
        grep -A 5 "^extraResources:" electron-builder.yml | head -10 | sed 's/^/    /'
    else
        print_warning "extraResources 配置不存在，pixivflow 可能不会被复制"
        ERROR_COUNT=$((ERROR_COUNT + 1))
    fi
fi

# 5. 检查 package.json 配置
print_info "检查 package.json 配置..."
if [ -f "package.json" ]; then
    MAIN_FILE=$(node -e "console.log(require('./package.json').main || '')" 2>/dev/null || echo "")
    if [ -n "$MAIN_FILE" ]; then
        if [ -f "$MAIN_FILE" ]; then
            print_success "package.json main 字段指向的文件存在: $MAIN_FILE"
        else
            print_error "package.json main 字段指向的文件不存在: $MAIN_FILE"
            ERROR_COUNT=$((ERROR_COUNT + 1))
        fi
    else
        print_error "package.json 中缺少 main 字段"
        ERROR_COUNT=$((ERROR_COUNT + 1))
    fi
fi

# 6. 检查必要的依赖
print_info "检查必要的依赖..."
if [ -f "package.json" ]; then
    if grep -q '"electron"' package.json; then
        print_success "electron 依赖存在"
    else
        print_error "electron 依赖不存在"
        ERROR_COUNT=$((ERROR_COUNT + 1))
    fi
    
    if grep -q '"electron-builder"' package.json; then
        print_success "electron-builder 依赖存在"
    else
        print_error "electron-builder 依赖不存在"
        ERROR_COUNT=$((ERROR_COUNT + 1))
    fi
fi

# 7. 检查并安装 pixivflow 依赖
print_info "检查 pixivflow 依赖..."
PIXIVFLOW_PATH="node_modules/pixivflow"
PIXIVFLOW_NODE_MODULES="$PIXIVFLOW_PATH/node_modules"

if [ -d "$PIXIVFLOW_PATH" ]; then
    # 检查 node_modules 是否存在且有内容
    if [ ! -d "$PIXIVFLOW_NODE_MODULES" ] || [ -z "$(ls -A $PIXIVFLOW_NODE_MODULES 2>/dev/null)" ]; then
        print_warning "pixivflow/node_modules 不存在或为空，需要安装依赖"
        print_info "正在为 pixivflow 安装依赖..."
        
        if command -v npm &> /dev/null; then
            (cd "$PIXIVFLOW_PATH" && npm install --production --no-save)
            if [ $? -eq 0 ]; then
                print_success "pixivflow 依赖安装成功"
            else
                print_error "pixivflow 依赖安装失败"
                ERROR_COUNT=$((ERROR_COUNT + 1))
            fi
        else
            print_error "npm 未找到，无法安装 pixivflow 依赖"
            ERROR_COUNT=$((ERROR_COUNT + 1))
        fi
    else
        # 验证关键依赖是否存在
        REQUIRED_DEPS=("node-cron" "express" "axios" "better-sqlite3")
        MISSING_DEPS=()
        
        for dep in "${REQUIRED_DEPS[@]}"; do
            if [ ! -d "$PIXIVFLOW_NODE_MODULES/$dep" ]; then
                MISSING_DEPS+=("$dep")
            fi
        done
        
        if [ ${#MISSING_DEPS[@]} -eq 0 ]; then
            print_success "pixivflow 依赖完整"
        else
            print_warning "pixivflow 缺少依赖: ${MISSING_DEPS[*]}"
            print_info "正在重新安装 pixivflow 依赖..."
            (cd "$PIXIVFLOW_PATH" && npm install --production --no-save)
            if [ $? -eq 0 ]; then
                print_success "pixivflow 依赖安装成功"
            else
                print_error "pixivflow 依赖安装失败"
                ERROR_COUNT=$((ERROR_COUNT + 1))
            fi
        fi
    fi
else
    print_error "pixivflow 目录不存在"
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

# 总结
print_section "检查结果"

if [ $ERROR_COUNT -eq 0 ]; then
    print_success "所有检查通过！可以开始构建。"
    exit 0
else
    print_error "发现 $ERROR_COUNT 个问题，请先修复这些问题再构建。"
    exit 1
fi

