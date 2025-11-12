#!/bin/bash

# Electron 应用测试脚本
# 用于测试新的登录流程

set -e

echo "🚀 启动 Electron 应用进行测试..."
echo ""

# 切换到 webui-frontend 目录
cd "$(dirname "$0")"

# 检查构建产物
if [ ! -d "dist" ]; then
    echo "❌ 错误: dist 目录不存在，请先运行 npm run build"
    exit 1
fi

if [ ! -d "../dist" ]; then
    echo "❌ 错误: 后端 dist 目录不存在，请先构建后端"
    exit 1
fi

echo "✅ 构建产物检查通过"
echo ""
echo "📝 启动 Electron 应用..."
echo "   - 开发模式: NODE_ENV=development"
echo "   - 主进程文件: electron/main.cjs"
echo ""
echo "💡 提示:"
echo "   1. 应用启动后，点击登录按钮"
echo "   2. 系统浏览器会自动打开 Pixiv 登录页面"
echo "   3. 同时会显示授权码输入对话框"
echo "   4. 完成登录后，从浏览器地址栏复制授权码"
echo "   5. 粘贴到对话框中完成登录"
echo ""
echo "按 Ctrl+C 停止应用"
echo ""

# 启动 Electron
NODE_ENV=development electron electron/main.cjs


























