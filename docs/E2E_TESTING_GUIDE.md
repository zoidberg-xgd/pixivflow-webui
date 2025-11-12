# 🧪 E2E 测试指南

本文档介绍如何使用 Playwright 进行端到端（E2E）测试。

## 📋 目录

- [概述](#概述)
- [环境设置](#环境设置)
- [运行测试](#运行测试)
- [编写测试](#编写测试)
- [最佳实践](#最佳实践)
- [故障排除](#故障排除)

---

## 概述

E2E 测试使用 Playwright 框架，测试整个应用程序的用户流程，从用户界面到后端 API。

### 测试覆盖范围

- ✅ 认证流程（登录、登出）
- ✅ 导航和路由
- ✅ 配置管理
- ✅ 下载管理
- ✅ 文件浏览
- ✅ 仪表板功能

---

## 环境设置

### 安装依赖

E2E 测试依赖已包含在 `package.json` 中：

```bash
npm install
```

### 安装浏览器

首次运行测试前，需要安装 Playwright 浏览器：

```bash
npx playwright install
```

### 配置文件

E2E 测试配置位于 `playwright.config.ts`：

- **测试目录**: `./e2e`
- **基础 URL**: `http://localhost:5173` (Vite 开发服务器)
- **自动启动服务器**: 测试运行前会自动启动开发服务器
- **浏览器**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari

---

## 运行测试

### 基本命令

```bash
# 运行所有 E2E 测试
npm run test:e2e

# 运行测试并显示 UI（推荐用于调试）
npm run test:e2e:ui

# 运行测试并显示浏览器窗口
npm run test:e2e:headed

# 调试模式（逐步执行）
npm run test:e2e:debug

# 查看测试报告
npm run test:e2e:report
```

### 运行特定测试

```bash
# 运行特定测试文件
npx playwright test e2e/auth.spec.ts

# 运行特定测试套件
npx playwright test --grep "Authentication"

# 运行特定浏览器
npx playwright test --project=chromium
```

### CI/CD 模式

在 CI 环境中，测试会自动：
- 使用无头模式
- 失败时重试 2 次
- 生成 HTML 报告
- 保存失败时的截图和视频

---

## 编写测试

### 测试文件结构

测试文件位于 `e2e/` 目录，使用 `.spec.ts` 扩展名：

```typescript
import { test, expect } from '@playwright/test';

test.describe('功能名称', () => {
  test.beforeEach(async ({ page }) => {
    // 每个测试前的设置
    await page.goto('/path');
  });

  test('测试描述', async ({ page }) => {
    // 测试代码
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

### 常用操作

#### 导航

```typescript
// 导航到页面
await page.goto('/dashboard');

// 等待页面加载完成
await page.waitForLoadState('networkidle');
```

#### 查找元素

```typescript
// 通过文本查找
await page.locator('text=Login').click();

// 通过选择器查找
await page.locator('[data-testid="button"]').click();

// 通过角色查找
await page.getByRole('button', { name: 'Submit' }).click();
```

#### 交互

```typescript
// 点击
await page.locator('button').click();

// 输入文本
await page.locator('input').fill('text');

// 选择选项
await page.locator('select').selectOption('value');
```

#### 断言

```typescript
// 可见性
await expect(page.locator('element')).toBeVisible();

// 文本内容
await expect(page.locator('element')).toHaveText('expected text');

// URL
await expect(page).toHaveURL(/.*dashboard/);

// 属性
await expect(page.locator('input')).toHaveAttribute('type', 'text');
```

### 等待策略

```typescript
// 等待元素可见
await page.waitForSelector('selector');

// 等待网络请求完成
await page.waitForResponse(response => response.url().includes('/api'));

// 等待超时
await page.waitForTimeout(1000);
```

### API Mocking

```typescript
// 拦截 API 请求
await page.route('**/api/config', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ data: { /* mock data */ } }),
  });
});
```

---

## 最佳实践

### 1. 使用数据测试 ID

在组件中添加 `data-testid` 属性：

```tsx
<button data-testid="submit-button">Submit</button>
```

在测试中使用：

```typescript
await page.locator('[data-testid="submit-button"]').click();
```

### 2. 等待策略

优先使用显式等待而非固定延迟：

```typescript
// ❌ 不好
await page.waitForTimeout(5000);

// ✅ 好
await page.waitForSelector('[data-testid="element"]');
await page.waitForLoadState('networkidle');
```

### 3. 测试隔离

每个测试应该是独立的，不依赖其他测试的状态：

```typescript
test.beforeEach(async ({ page }) => {
  // 重置状态
  await page.goto('/');
  // 清理数据（如果需要）
});
```

### 4. 错误处理

使用 Playwright 的自动重试机制，但也要处理预期错误：

```typescript
test('should handle error gracefully', async ({ page }) => {
  await page.goto('/page');
  
  // 模拟错误
  await page.route('**/api/error', route => route.fulfill({ status: 500 }));
  
  // 验证错误处理
  await expect(page.locator('.error-message')).toBeVisible();
});
```

### 5. 测试组织

按功能组织测试文件：

```
e2e/
  ├── auth.spec.ts          # 认证相关
  ├── dashboard.spec.ts     # 仪表板
  ├── config.spec.ts        # 配置管理
  ├── download.spec.ts      # 下载管理
  ├── files.spec.ts         # 文件浏览
  └── navigation.spec.ts    # 导航
```

---

## 故障排除

### 常见问题

#### 1. 测试超时

**问题**: 测试在超时前无法完成

**解决方案**:
- 增加测试超时时间：`test.setTimeout(60000)`
- 检查网络请求是否完成
- 确保开发服务器已启动

#### 2. 元素未找到

**问题**: `locator.click()` 找不到元素

**解决方案**:
- 使用 `waitForSelector` 等待元素出现
- 检查选择器是否正确
- 确认元素在 DOM 中（可能被条件渲染）

#### 3. 浏览器未安装

**问题**: `Error: Executable doesn't exist`

**解决方案**:
```bash
npx playwright install
```

#### 4. 开发服务器未启动

**问题**: 无法连接到 `http://localhost:5173`

**解决方案**:
- 确保 `npm run dev` 可以正常启动
- 检查端口是否被占用
- 在 CI 中确保设置了正确的环境变量

### 调试技巧

#### 1. 使用 UI 模式

```bash
npm run test:e2e:ui
```

这提供了可视化的测试运行界面，可以：
- 查看每个步骤
- 暂停和继续执行
- 检查元素选择器

#### 2. 使用调试模式

```bash
npm run test:e2e:debug
```

在调试模式下，可以：
- 逐步执行测试
- 使用浏览器 DevTools
- 检查网络请求

#### 3. 查看截图和视频

测试失败时，Playwright 会自动保存：
- 截图：`test-results/`
- 视频：`test-results/`
- 跟踪：使用 `--trace on` 选项

#### 4. 查看测试报告

```bash
npm run test:e2e:report
```

打开 HTML 报告，查看：
- 测试结果
- 执行时间
- 失败原因
- 截图和视频

---

## 持续集成

### GitHub Actions 示例

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 参考资源

- [Playwright 文档](https://playwright.dev/)
- [Playwright API 参考](https://playwright.dev/docs/api/class-playwright)
- [最佳实践](https://playwright.dev/docs/best-practices)
- [调试指南](https://playwright.dev/docs/debug)

---

## 更新日志

- **2025-01-XX**: 初始版本 - E2E 测试指南创建

