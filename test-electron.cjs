#!/usr/bin/env node

/**
 * Electron 应用测试脚本
 * 测试应用是否能正常启动和关闭
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 启动 Electron 应用测试...\n');

const electronPath = path.join(__dirname, 'node_modules', '.bin', 'electron');
const mainPath = path.join(__dirname, 'electron', 'main.cjs');

const electron = spawn(electronPath, [mainPath], {
  env: {
    ...process.env,
    NODE_ENV: 'development',
    ELECTRON_ENABLE_LOGGING: '1',
  },
  stdio: 'pipe',
});

let output = '';
let errorOutput = '';
let hasError = false;

electron.stdout.on('data', (data) => {
  const text = data.toString();
  output += text;
  process.stdout.write(text);
});

electron.stderr.on('data', (data) => {
  const text = data.toString();
  errorOutput += text;
  
  // 检查是否有严重错误
  if (text.includes('Error:') || text.includes('TypeError:') || text.includes('ReferenceError:')) {
    hasError = true;
  }
  
  process.stderr.write(text);
});

electron.on('error', (error) => {
  console.error('\n❌ 启动失败:', error.message);
  process.exit(1);
});

// 5秒后自动关闭
setTimeout(() => {
  console.log('\n⏱️  测试时间到，关闭应用...');
  electron.kill();
}, 5000);

electron.on('close', (code) => {
  console.log(`\n📊 测试结果:`);
  console.log(`   退出码: ${code}`);
  console.log(`   是否有错误: ${hasError ? '是' : '否'}`);
  
  if (hasError) {
    console.log('\n❌ 测试失败：检测到错误');
    process.exit(1);
  } else if (code === 0 || code === null) {
    console.log('\n✅ 测试成功：应用正常启动和关闭');
    process.exit(0);
  } else {
    console.log(`\n⚠️  应用退出码异常: ${code}`);
    process.exit(code);
  }
});

