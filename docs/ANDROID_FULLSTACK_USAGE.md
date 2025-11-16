# Android 全栈应用使用指南

本指南说明如何使用和配置包含前后端的完整 PixivFlow Android 应用。

## 📋 目录

- [快速开始](#快速开始)
- [构建全栈 APK](#构建全栈-apk)
- [配置说明](#配置说明)
- [使用方法](#使用方法)
- [故障排除](#故障排除)

---

## 🚀 快速开始

### 方案选择

在构建 Android APK 之前,请先选择适合您的方案:

| 方案 | 适用场景 | APK 大小 | 是否需要外部服务器 |
|------|----------|----------|-------------------|
| **仅前端** | 有固定服务器,局域网使用 | ~10MB | ✅ 需要 |
| **全栈应用** | 完全离线使用,独立运行 | ~50MB | ❌ 不需要 |

### 推荐方案

- **个人使用 + 有电脑**: 使用仅前端方案,在电脑上运行后端
- **完全移动端**: 使用全栈方案,手机独立运行
- **多设备共享**: 使用仅前端方案,多个设备连接同一后端

---

## [object Object]APK

### 前置要求

除了基本的 Android 构建要求外,还需要:

1. **后端代码或 npm 包**
   - 如果后端是 npm 包: 知道包名 (如 `pixivflow`)
   - 如果后端是本地代码: 准备好后端代码目录

2. **额外的 npm 包**
   ```bash
   npm install nodejs-mobile-capacitor
   ```

### 构建步骤

#### 方法 1: 使用自动化脚本 (推荐)

```bash
./build-android-fullstack.sh
```

脚本会引导您:
1. 检查并安装 `nodejs-mobile-capacitor`
2. 选择后端代码来源:
   - 选项 1: 使用 npm 包
   - 选项 2: 使用本地代码目录
   - 选项 3: 跳过后端 (仅构建前端)
3. 自动构建并打包

#### 方法 2: 手动构建

```bash
# 1. 安装 nodejs-mobile
npm install nodejs-mobile-capacitor

# 2. 创建 Node.js 项目目录
mkdir -p nodejs-assets/nodejs-project
cd nodejs-assets/nodejs-project

# 3. 初始化并安装后端
npm init -y
npm install pixivflow  # 或复制您的后端代码

# 4. 创建启动脚本 main.js
# (参考下面的示例)

# 5. 返回项目根目录并构建
cd ../..
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

### 后端启动脚本示例

创建 `nodejs-assets/nodejs-project/main.js`:

```javascript
// PixivFlow 后端启动脚本
console.log('[Backend] Starting PixivFlow on Android...');

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
    // 其他配置...
  }).then(() => {
    console.log(`[Backend] Running on http://${HOST}:${PORT}`);
    
    // 通知前端后端已就绪
    if (typeof rn_bridge !== 'undefined') {
      rn_bridge.channel.send('backend-ready');
    }
  }).catch(err => {
    console.error('[Backend] Failed to start:', err);
  });
} catch (error) {
  console.error('[Backend] Error:', error);
}
```

---

## ⚙️ 配置说明

### 1. 环境变量配置

创建 `.env` 文件:

```bash
# 是否使用嵌入式后端 (Android)
VITE_USE_EMBEDDED_BACKEND=true

# 外部后端 URL (非 Android 或禁用嵌入式后端时使用)
# VITE_API_BASE_URL=http://192.168.1.100:3001
```

### 2. Capacitor 配置

`capacitor.config.ts` 已自动配置,无需修改。

### 3. 后端配置

在 `nodejs-assets/nodejs-project/` 中可以添加配置文件:

```
nodejs-assets/nodejs-project/
├── main.js              # 启动脚本
├── package.json         # 依赖配置
├── config/              # 配置文件 (可选)
│   └── default.json
└── node_modules/        # 依赖包
```

---

## 📱 使用方法

### 首次启动

1. **安装 APK**
   ```bash
   adb install pixivflow-fullstack-debug.apk
   ```

2. **启动应用**
   - 首次启动需要 5-15 秒初始化后端
   - 会显示进度条和状态信息

3. **等待就绪**
   - 看到 "后端已就绪" 提示后即可使用

### 日常使用

- **启动**: 直接打开应用,后端会自动启动
- **关闭**: 关闭应用,后端会自动停止
- **后台运行**: 应用在后台时,后端继续运行

### 功能说明

全栈应用包含完整功能:

- ✅ 用户登录和认证
- ✅ 下载管理
- ✅ 文件浏览
- ✅ 配置管理
- ✅ 统计信息
- ✅ 日志查看
- ✅ 完全离线运行

### 数据存储

- **配置文件**: 存储在应用私有目录
- **下载文件**: 存储在 Android 公共目录或应用目录
- **数据库**: SQLite 数据库存储在应用目录

---

## 🔧 故障排除

### 问题 1: 后端启动失败

**症状**: 应用显示 "后端启动失败"

**可能原因**:
1. 后端代码未正确打包
2. Node.js 运行时初始化失败
3. 端口 3001 被占用

**解决方案**:
```bash
# 1. 检查后端代码是否存在
ls -la nodejs-assets/nodejs-project/

# 2. 检查依赖是否安装
cd nodejs-assets/nodejs-project/
npm install
cd ../..

# 3. 重新构建
./build-android-fullstack.sh
```

### 问题 2: 应用启动很慢

**症状**: 首次启动需要很长时间

**原因**: 这是正常现象,Node.js 需要初始化

**优化方案**:
1. 减少后端依赖包数量
2. 使用 Release 构建 (更快)
3. 优化后端启动逻辑

### 问题 3: 应用耗电严重

**症状**: 电池消耗快

**原因**: Node.js 后端持续运行

**解决方案**:
1. 不使用时关闭应用
2. 实现后端空闲自动休眠
3. 考虑使用仅前端方案

### 问题 4: APK 体积太大

**症状**: APK 超过 100MB

**原因**: 包含了过多的依赖

**解决方案**:
```bash
# 1. 检查依赖大小
cd nodejs-assets/nodejs-project/
npm ls --depth=0

# 2. 移除不必要的依赖
npm uninstall <package-name>

# 3. 使用生产依赖
npm install --production

# 4. 重新构建
cd ../..
./build-android-fullstack.sh
```

### 问题 5: 无法连接到后端

**症状**: 前端显示网络错误

**检查步骤**:
1. 查看应用日志 (adb logcat)
2. 检查后端是否启动成功
3. 验证 API 地址配置

**解决方案**:
```bash
# 查看日志
adb logcat | grep -i "backend\|nodejs"

# 检查配置
cat src/services/api/client.ts
```

### 问题 6: 构建失败

**症状**: Gradle 构建报错

**常见错误**:
1. `Duplicate files` - 文件冲突
2. `Out of memory` - 内存不足
3. `SDK not found` - SDK 未配置

**解决方案**:
```bash
# 1. 清理构建缓存
cd android
./gradlew clean

# 2. 增加 Gradle 内存
# 编辑 android/gradle.properties
org.gradle.jvmargs=-Xmx4096m

# 3. 重新构建
./gradlew assembleDebug
```

---

## 📊 性能对比

| 指标 | 仅前端 | 全栈应用 |
|------|--------|----------|
| APK 大小 | ~10MB | ~50MB |
| 首次启动时间 | 1-2秒 | 5-15秒 |
| 后续启动时间 | 1-2秒 | 3-5秒 |
| 内存占用 | ~100MB | ~200MB |
| 电池消耗 | 低 | 中等 |
| 离线可用 | ❌ | ✅ |

---

## 🎯 最佳实践

### 1. 开发阶段

- 使用仅前端方案,连接电脑上的后端
- 快速迭代,方便调试

### 2. 测试阶段

- 构建全栈 Debug APK
- 在真实设备上测试完整功能
- 测试离线场景

### 3. 发布阶段

- 根据用户需求选择方案
- 全栈应用: 构建 Release APK 并签名
- 仅前端: 提供后端部署文档

### 4. 用户使用

- 提供清晰的使用说明
- 说明首次启动较慢是正常现象
- 提供故障排除指南

---

## 📚 相关文档

- [Android 构建指南](./ANDROID_BUILD_GUIDE.md)
- [移动应用快速入门](./MOBILE_QUICK_START.md)
- [全栈方案技术指南](./ANDROID_FULL_STACK_GUIDE.md)

---

## 💡 提示

1. **首次构建**: 建议先构建仅前端版本,确保基本功能正常
2. **测试**: 全栈应用务必在真实设备上充分测试
3. **优化**: 根据实际使用情况优化后端启动和资源使用
4. **文档**: 为用户提供清晰的使用说明

---

需要帮助? 查看详细的技术指南或在 GitHub 上提交 Issue!

