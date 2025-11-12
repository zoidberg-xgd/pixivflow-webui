# 🎯 PixivFlow 前端重构计划

> **文档状态**: 进行中  
> **创建时间**: 2025-11-12  
> **最后更新**: 2025-11-12 22:30  
> **版本**: 1.0.0

---

## 📋 目录

1. [重构目标](#重构目标)
2. [现状分析](#现状分析)
3. [重构原则](#重构原则)
4. [重构阶段规划](#重构阶段规划)
5. [详细重构任务](#详细重构任务)
6. [质量保证](#质量保证)
7. [风险评估](#风险评估)
8. [进度跟踪](#进度跟踪)

---

## 🎯 重构目标

### 核心目标

1. **提升代码质量**
   - 降低代码复杂度
   - 消除代码重复
   - 提高可维护性
   - 增强可测试性

2. **改善架构设计**
   - 清晰的组件边界
   - 单一职责原则
   - 组件复用性
   - 状态管理优化

3. **增强用户体验**
   - 统一错误处理
   - 完善的加载状态
   - 健壮的错误恢复
   - 全面的测试覆盖

4. **提升开发体验**
   - 清晰的代码结构
   - 完善的文档
   - 易于扩展
   - 易于调试

---

## 📊 现状分析

### 代码质量指标

| 指标 | 当前状态 | 目标状态 |
|------|---------|---------|
| 最大文件行数 | 825行 (Login.tsx) | < 300行 |
| 平均组件复杂度 | 高 | 低-中 |
| 代码重复率 | ~10% | < 5% |
| 测试覆盖率 | ~60% | > 80% |
| 类型安全 | 部分 | 完全 |

### 主要问题

#### 1. 大型组件文件 ⚠️ 高优先级

**问题描述**:
- `src/pages/Login.tsx` 文件过大（825行），包含：
  - 登录逻辑
  - 轮询逻辑
  - 状态管理
  - UI 渲染
  - 错误处理
- `src/services/api.ts` 文件过大（768行），包含：
  - 所有 API 调用
  - 错误处理
  - 请求拦截
  - 响应处理
- `src/pages/Config/Config.tsx` 文件较大（399行）
- `src/pages/Files/Files.tsx` 文件较大（352行）

**影响**:
- 难以维护和测试
- 难以复用逻辑
- 代码可读性差
- 组件职责不清

**解决方案**:
- 拆分大型组件为更小的子组件
- 提取自定义 Hooks
- 分离业务逻辑和 UI 逻辑
- 创建共享的服务层

#### 2. 代码重复问题 ⚠️ 高优先级

**问题描述**:
- 错误处理逻辑在多个组件中重复
- 加载状态管理重复
- 表单验证逻辑可能重复
- API 调用模式重复

**影响**:
- 维护成本高
- 容易产生不一致
- 违反 DRY 原则

**解决方案**:
- 提取公共 Hooks
- 创建共享的错误处理组件
- 统一 API 调用模式
- 创建共享的表单验证逻辑

#### 3. 状态管理混乱 ⚠️ 中优先级

**问题描述**:
- 状态管理分散（useState, useQuery, useMutation 混用）
- 某些组件状态过多
- 缺少统一的状态管理策略
- 组件间状态共享困难

**影响**:
- 难以追踪状态变化
- 难以调试
- 性能问题（不必要的重渲染）

**解决方案**:
- 统一状态管理策略
- 使用 Context API 或状态管理库
- 优化状态更新逻辑
- 使用 React Query 进行服务端状态管理

#### 4. 测试覆盖不足 ⚠️ 中优先级

**问题描述**:
- 某些组件缺少测试
- 测试文件过大（useDownload.test.tsx 512行，useConfig.test.tsx 440行）
- 集成测试缺失
- E2E 测试不完整

**影响**:
- 重构风险高
- 难以发现回归问题
- 缺乏文档作用

**解决方案**:
- 为核心组件添加单元测试
- 拆分大型测试文件
- 添加集成测试
- 完善 E2E 测试

#### 5. 类型安全 ⚠️ 低优先级

**问题描述**:
- 某些地方使用 `any` 类型
- 缺少严格的类型检查
- API 响应类型可能不完整

**影响**:
- 运行时错误风险
- IDE 支持不足
- 重构困难

**解决方案**:
- 消除 `any` 类型
- 完善类型定义
- 启用严格模式
- 添加类型检查工具

#### 6. 旧代码清理 ⚠️ 低优先级

**问题描述**:
- `src/pages/Login.tsx` (825行) 和 `src/pages/Login/Login.tsx` (251行) 同时存在
- 可能存在未使用的组件或文件
- 导入路径不一致

**影响**:
- 代码混乱
- 容易产生混淆
- 增加维护成本

**解决方案**:
- 删除旧文件
- 清理未使用的代码
- 统一导入路径
- 更新路由配置

---

## 🏗️ 重构原则

### 1. 渐进式重构
- 小步快跑，每次只重构一个模块
- 保持系统可运行状态
- 每个阶段都有可验证的成果

### 2. 向后兼容
- 不破坏现有功能
- 保持 API 接口兼容
- 保持用户体验一致

### 3. 测试驱动
- 重构前先写测试
- 重构后验证测试通过
- 逐步提高测试覆盖率

### 4. 文档同步
- 重构同时更新文档
- 记录重构决策
- 提供迁移指南

### 5. 代码审查
- 每个重构提交都要审查
- 确保符合编码规范
- 确保架构一致性

---

## 📅 重构阶段规划

### Phase 1: 基础设施完善（1-2周）

**目标**: 为后续重构打好基础

**任务**:
- [x] 统一错误处理机制
- [x] 统一加载状态管理（Config 导入流程接入 `useLoadingState`，提供批量导入反馈）
- [ ] 完善类型定义
- [ ] 建立代码质量检查流程
- [ ] 完善测试基础设施

**验收标准**:
- 所有工具函数都有测试
- 代码质量检查通过
- 文档完善

### Phase 2: 服务层重构（1-2周）

**目标**: 重构 API 服务层

**任务**:
- [ ] 拆分 `api.ts` 为多个服务模块
- [ ] 统一 API 调用模式
- [ ] 统一错误处理
- [ ] 添加请求/响应拦截器
- [ ] 添加服务层测试

**验收标准**:
- `api.ts` 文件行数 < 200
- 每个服务模块 < 200 行
- 所有服务有测试覆盖
- API 调用统一且可扩展

### Phase 3: 组件重构（2-3周）

**目标**: 重构大型组件

**任务**:
- [ ] 重构 `Login.tsx`
  - [ ] 删除旧的 `Login.tsx` (825行)
  - [ ] 完善新的 `Login/Login.tsx` (251行)
  - [ ] 提取登录逻辑到自定义 Hooks
  - [ ] 拆分子组件
  - [ ] 添加单元测试
- [ ] 重构 `Config.tsx`
  - [ ] 提取配置逻辑到自定义 Hooks
  - [ ] 拆分子组件
  - [ ] 优化状态管理
  - [ ] 添加单元测试
- [ ] 重构 `Files.tsx`
  - [ ] 提取文件操作逻辑到自定义 Hooks
  - [ ] 拆分子组件
  - [ ] 优化性能
  - [ ] 添加单元测试
- [ ] 重构 `Download.tsx`
  - [ ] 提取下载逻辑到自定义 Hooks
  - [ ] 拆分子组件
  - [ ] 优化状态管理
  - [ ] 添加单元测试

**验收标准**:
- 每个组件文件行数 < 300
- 每个子组件 < 200 行
- 代码重复率 < 5%
- 测试覆盖率 > 80%
- 性能不下降

### Phase 4: Hooks 和状态管理优化（1-2周）

**目标**: 优化 Hooks 和状态管理

**任务**:
- [ ] 提取公共 Hooks
- [ ] 优化状态管理策略
- [ ] 统一加载状态管理
- [ ] 统一错误处理
- [ ] 添加 Hooks 测试

**验收标准**:
- 公共 Hooks 可复用
- 状态管理清晰
- 性能优化（减少不必要的重渲染）
- 所有 Hooks 有测试覆盖

### Phase 5: 测试和文档完善（1周）

**目标**: 完善测试和文档

**任务**:
- [ ] 拆分大型测试文件
- [ ] 添加集成测试
- [ ] 完善 E2E 测试
- [ ] 更新所有文档
- [ ] 编写组件使用指南
- [ ] 代码审查和优化

**验收标准**:
- 测试覆盖率 > 80%
- 文档完整准确
- 代码质量达标
- 所有测试通过

---

## 📝 详细重构任务

### 任务 1: 服务层重构

#### 1.1 拆分 API 服务

**当前**: `src/services/api.ts` (768行)

**目标结构**:
```
src/services/
  ├── api/
  │   ├── index.ts          # 导出所有服务
  │   ├── client.ts         # HTTP 客户端配置
  │   ├── interceptors.ts   # 请求/响应拦截器
  │   ├── auth.ts           # 认证相关 API
  │   ├── config.ts         # 配置相关 API
  │   ├── download.ts       # 下载相关 API
  │   ├── files.ts          # 文件相关 API
  │   ├── logs.ts           # 日志相关 API
  │   └── stats.ts          # 统计相关 API
  └── types/
      └── api.ts            # API 类型定义
```

**实现步骤**:
1. 创建 `src/services/api/client.ts` - HTTP 客户端
2. 创建 `src/services/api/interceptors.ts` - 拦截器
3. 拆分各个服务模块
4. 更新导入路径
5. 添加服务层测试

#### 1.2 统一错误处理

**文件**: `src/services/api/error-handler.ts`

```typescript
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
  }
}

export function handleApiError(error: unknown): ApiError {
  // 统一的错误处理逻辑
}
```

#### 1.3 统一请求/响应处理

**文件**: `src/services/api/interceptors.ts`

```typescript
export function setupRequestInterceptor(axiosInstance: AxiosInstance) {
  // 请求拦截器
}

export function setupResponseInterceptor(axiosInstance: AxiosInstance) {
  // 响应拦截器
}
```

### 任务 2: Login 组件重构

#### 2.1 删除旧文件

- [ ] 删除 `src/pages/Login.tsx` (825行)
- [ ] 更新路由配置，使用 `src/pages/Login/Login.tsx`
- [ ] 更新所有导入路径

#### 2.2 提取登录逻辑到 Hooks

**文件**: `src/pages/Login/hooks/useLoginFlow.ts`

```typescript
export function useLoginFlow() {
  // 登录流程逻辑
  // - 登录模式选择
  // - 登录状态管理
  // - 轮询逻辑
  // - 错误处理
}
```

**文件**: `src/pages/Login/hooks/useLoginPolling.ts`

```typescript
export function useLoginPolling() {
  // 轮询逻辑
  // - 轮询状态管理
  // - 轮询间隔控制
  // - 轮询超时处理
}
```

#### 2.3 拆分子组件

**当前**: `src/pages/Login/Login.tsx` (251行)

**目标结构**:
```
src/pages/Login/
  ├── Login.tsx              # 主组件 (< 150行)
  ├── components/
  │   ├── LoginForm.tsx      # 登录表单
  │   ├── LoginModeSelector.tsx  # 登录模式选择
  │   ├── LoginSteps.tsx     # 登录步骤
  │   ├── LoginFeatures.tsx  # 登录特性展示
  │   ├── LoginHeader.tsx    # 登录头部
  │   └── LoginCard.tsx      # 登录卡片
  └── hooks/
      ├── useLoginFlow.ts    # 登录流程
      └── useLoginPolling.ts # 轮询逻辑
```

#### 2.4 添加测试

- [ ] `src/__tests__/pages/Login/Login.test.tsx`
- [ ] `src/__tests__/pages/Login/hooks/useLoginFlow.test.tsx`
- [ ] `src/__tests__/pages/Login/hooks/useLoginPolling.test.tsx`

### 任务 3: Config 组件重构

#### 3.1 提取配置逻辑到 Hooks

**文件**: `src/pages/Config/hooks/useConfigForm.ts`

```typescript
export function useConfigForm() {
  // 表单逻辑
  // - 表单状态管理
  // - 表单验证
  // - 表单提交
}
```

**文件**: `src/pages/Config/hooks/useConfigTabs.ts`

```typescript
export function useConfigTabs() {
  // 标签页逻辑
  // - 标签页状态管理
  // - 标签页切换
}
```

#### 3.2 拆分子组件

**当前**: `src/pages/Config/Config.tsx` (399行)

**目标结构**:
```
src/pages/Config/
  ├── Config.tsx             # 主组件 (< 200行)
  ├── components/
  │   ├── ConfigTabs.tsx     # 配置标签页
  │   ├── ConfigActions.tsx  # 配置操作按钮
  │   └── ... (已有组件)
  └── hooks/
      ├── useConfigForm.ts   # 表单逻辑
      └── useConfigTabs.ts   # 标签页逻辑
```

#### 3.3 优化状态管理

- [ ] 使用 React Query 管理服务端状态
- [ ] 使用 Context API 管理本地状态
- [ ] 优化状态更新逻辑

### 任务 4: Files 组件重构

#### 4.1 提取文件操作逻辑到 Hooks

**文件**: `src/pages/Files/hooks/useFileBrowser.ts`

```typescript
export function useFileBrowser() {
  // 文件浏览逻辑
  // - 文件列表管理
  // - 文件过滤
  // - 文件排序
}
```

**文件**: `src/pages/Files/hooks/useFileOperations.ts`

```typescript
export function useFileOperations() {
  // 文件操作逻辑
  // - 文件删除
  // - 文件预览
  // - 文件规范化
}
```

#### 4.2 拆分子组件

**当前**: `src/pages/Files/Files.tsx` (352行)

**目标结构**:
```
src/pages/Files/
  ├── Files.tsx              # 主组件 (< 200行)
  ├── components/
  │   ├── FileBrowser.tsx    # 文件浏览器
  │   ├── FileFilters.tsx    # 文件过滤器
  │   ├── FileStatistics.tsx # 文件统计
  │   ├── FileList.tsx       # 文件列表
  │   ├── FilePreview.tsx    # 文件预览
  │   └── NormalizeFilesModal.tsx  # 规范化模态框
  └── hooks/
      ├── useFileBrowser.ts  # 文件浏览逻辑
      └── useFileOperations.ts  # 文件操作逻辑
```

#### 4.3 性能优化

- [ ] 使用 React.memo 优化组件渲染
- [ ] 使用 useMemo 和 useCallback 优化计算
- [ ] 虚拟滚动（如果文件列表很长）

### 任务 5: 公共 Hooks 提取

#### 5.1 错误处理 Hook

**文件**: `src/hooks/useErrorHandler.ts` (已存在，需要完善)

```typescript
export function useErrorHandler() {
  // 统一的错误处理
  // - 错误显示
  // - 错误日志
  // - 错误恢复
}
```

#### 5.2 加载状态 Hook

**文件**: `src/hooks/useLoadingState.ts`

```typescript
export function useLoadingState() {
  // 统一的加载状态管理
  // - 加载状态
  // - 加载消息
  // - 加载进度
}
```

#### 5.3 表单验证 Hook

**文件**: `src/hooks/useFormValidation.ts`

```typescript
export function useFormValidation<T>(schema: ValidationSchema<T>) {
  // 统一的表单验证
  // - 字段验证
  // - 表单验证
  // - 错误显示
}
```

### 任务 6: 测试重构

#### 6.1 拆分大型测试文件

**当前**:
- `src/__tests__/hooks/useDownload.test.tsx` (512行)
- `src/__tests__/hooks/useConfig.test.tsx` (440行)

**目标结构**:
```
src/__tests__/hooks/
  ├── useDownload/
  │   ├── useDownload.test.tsx
  │   ├── useDownloadStatus.test.tsx
  │   ├── useDownloadLogs.test.tsx
  │   └── useIncompleteTasks.test.tsx
  └── useConfig/
      ├── useConfig.test.tsx
      ├── useConfigFiles.test.tsx
      ├── useConfigHistory.test.tsx
      └── useConfigValidation.test.tsx
```

#### 6.2 添加集成测试

- [ ] `src/__tests__/integration/login-flow.test.tsx`
- [ ] `src/__tests__/integration/config-flow.test.tsx` (已存在)
- [ ] `src/__tests__/integration/download-flow.test.tsx` (已存在)
- [ ] `src/__tests__/integration/files-flow.test.tsx` (已存在)

---

## ✅ 质量保证

### 代码质量标准

1. **复杂度**
   - 组件圈复杂度 < 10
   - 文件行数 < 300
   - 函数行数 < 50
   - Hook 行数 < 100

2. **测试覆盖**
   - 单元测试覆盖率 > 80%
   - 关键路径 100% 覆盖
   - 集成测试覆盖主要流程
   - E2E 测试覆盖核心功能

3. **代码质量**
   - ESLint 检查通过
   - TypeScript 严格模式
   - 无重复代码
   - 无 `any` 类型

4. **文档**
   - 所有公共 API 有文档
   - 复杂逻辑有注释
   - 有使用示例
   - 组件有 Storybook 文档（可选）

### 检查清单

每个重构任务完成后，需要检查：

- [ ] 代码编译通过
- [ ] 所有测试通过
- [ ] 代码质量检查通过
- [ ] 文档已更新
- [ ] 向后兼容性保持
- [ ] 性能无回归
- [ ] 用户体验无变化

### 测试执行记录

- 2025-11-12：`npm test -- --runInBand` → **失败**
  - `i18next-browser-languagedetector` 在 JSDOM 环境报错，`LanguageDetector.use` 为 `undefined`
  - `DateRangePicker` 测试对 `dayjs` 默认导入断言返回函数，现实现返回对象导致 `TypeError`
  - `ConfirmModal` 测试断言 Ant Design 旧版类名（`ant-btn-dangerous`），需更新选择器策略
  - `ProtectedRoute` 与 `App` 测试期望 `aria-label="loading"`，实际 DOM 仅渲染图标角色
  - `useLayoutAuth` 测试错误依赖 `vitest`，在 Jest 环境不可用
  - 集成测试依赖的表单标签查找失败（`/download.*directory/i`）需更新查询逻辑
- 2025-11-12：Playwright E2E 测试 **未执行**（等待单元测试修复后再运行）

---

## ⚠️ 风险评估

### 高风险项

1. **Login 组件重构**
   - **风险**: 可能影响登录功能
   - **缓解**: 充分测试，逐步重构，保留旧代码直到新代码稳定

2. **API 服务重构**
   - **风险**: 可能影响所有 API 调用
   - **缓解**: 保持 API 接口兼容，充分测试

3. **状态管理优化**
   - **风险**: 可能引入状态同步问题
   - **缓解**: 充分测试，逐步迁移

### 中风险项

1. **组件拆分**
   - **风险**: 可能引入组件通信问题
   - **缓解**: 充分测试，代码审查

2. **测试重构**
   - **风险**: 可能发现现有 bug
   - **缓解**: 及时修复，记录问题

### 低风险项

1. **文档更新**
   - **风险**: 文档可能不准确
   - **缓解**: 代码审查时检查文档

2. **代码清理**
   - **风险**: 可能删除有用的代码
   - **缓解**: 仔细审查，保留备份

---

## 📈 进度跟踪

### 当前进度

- [ ] Phase 1: 基础设施完善 (40%)
- [ ] Phase 2: 服务层重构 (0%)
- [ ] Phase 3: 组件重构 (40%)
- [ ] Phase 4: Hooks 和状态管理优化 (20%)
- [ ] Phase 5: 测试和文档完善 (0%)

### 详细进度

#### Phase 1: 基础设施完善

- [x] 统一错误处理机制（2025-11-12：`useErrorHandler` 接入标准化 `ApiError` + 多语言消息）
- [x] 统一加载状态管理（2025-11-12：Config 导入流程接入 `useLoadingState`，提供批量导入反馈）
- [ ] 完善类型定义（进行中：`Config` 相关类型补充 `_validation` 元数据并去除 `any` 用法）
- [ ] 建立代码质量检查流程（进行中：补齐 ESLint 依赖，仍需清理历史告警）
- [ ] 完善测试基础设施

#### Phase 2: 服务层重构

- [ ] 拆分 `api.ts` 为多个服务模块
- [ ] 统一 API 调用模式
- [ ] 统一错误处理
- [ ] 添加请求/响应拦截器
- [ ] 添加服务层测试

#### Phase 3: 组件重构

- [ ] 重构 `Login.tsx`
  - [ ] 删除旧的 `Login.tsx` (825行)
  - [ ] 完善新的 `Login/Login.tsx` (251行)
  - [ ] 提取登录逻辑到自定义 Hooks
  - [ ] 拆分子组件
  - [ ] 添加单元测试
- [x] 重构 `Config.tsx` (阶段一：交互与状态整合完成)
  - [x] 统一加载状态展示（复用 `LoadingSpinner`）
  - [x] 配置预览 / JSON 编辑入口迁移至共享模态组件
  - [x] 集成 `useErrorHandler`，统一成功/失败提示
- [x] 批量导入流程使用统一加载状态与结果提示
  - [x] 拆分表单与表格子组件（2025-11-12：`ConfigTabs` 引入 `useConfigTabItems`，表单与表格 Tab 拆分为独立子项）
  - [ ] 补充 Config 表单相关测试
- [ ] 重构 `Files.tsx`
- [ ] 重构 `Download.tsx`

#### Phase 4: Hooks 和状态管理优化

- [ ] 提取公共 Hooks
- [ ] 优化状态管理策略
- [ ] 统一加载状态管理（进行中：Config 操作已接入 `useLoadingState`，待扩展到 Login/Files 等页面）
- [x] 统一错误处理（Config 相关 Hook 已接入 `useErrorHandler`）
- [ ] 添加 Hooks 测试

#### Phase 5: 测试和文档完善

- [ ] 修复现有单元测试（2025-11-12：`npm test -- --runInBand` 失败，18 个测试套件因 i18n 初始化、Ant Design 断言和 `dayjs` 导入问题未通过）
- [ ] 拆分大型测试文件
- [ ] 添加集成测试
- [ ] 完善 E2E 测试
- [ ] 更新所有文档
- [ ] 编写组件使用指南
- [ ] 代码审查和优化

---

## 📚 参考文档

- [后端重构计划](../REFACTORING_PLAN.md)
- [组件开发指南](./docs/COMPONENT_GUIDE.md)
- [开发指南](./docs/DEVELOPMENT_GUIDE.md)
- [E2E 测试指南](./e2e/README.md)

---

## 🔄 更新日志

### 2025-11-12
- 创建前端重构计划文档
- 分析当前代码状况
- 制定重构阶段规划
- 完成 Config 页面第一阶段重构：整合模态、统一状态与错误处理
- 调整 Config 导入操作：引入统一加载状态、批量导入校验与结果提示

---

**注意**: 本计划文档是重构工作的指导文件，所有重构工作必须严格遵循本计划。如有需要调整，必须更新本文档并记录原因。

