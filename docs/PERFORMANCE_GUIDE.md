# ⚡ 性能优化指南

本文档介绍 PixivFlow WebUI 前端的性能优化策略和最佳实践。

## 📋 目录

1. [性能指标](#性能指标)
2. [优化策略](#优化策略)
3. [代码分割](#代码分割)
4. [懒加载](#懒加载)
5. [缓存策略](#缓存策略)
6. [性能监控](#性能监控)
7. [最佳实践](#最佳实践)

---

## 📊 性能指标

### 目标指标

- **首屏加载时间 (FCP)**: < 1.5s
- **最大内容绘制 (LCP)**: < 2.5s
- **首次输入延迟 (FID)**: < 100ms
- **累积布局偏移 (CLS)**: < 0.1
- **总阻塞时间 (TBT)**: < 300ms
- **构建产物大小**: 
  - 初始 JS 包: < 200KB (gzipped)
  - 总 JS 包: < 500KB (gzipped)
  - CSS 包: < 50KB (gzipped)

### 性能测试工具

- **Lighthouse**: 综合性能评分
- **Web Vitals**: Core Web Vitals 指标
- **React DevTools Profiler**: React 组件性能分析
- **Chrome DevTools Performance**: 运行时性能分析

---

## 🚀 优化策略

### 1. 代码分割 (Code Splitting)

#### 路由级代码分割

使用 React.lazy 和 Suspense 实现路由级代码分割：

```tsx
// src/App.tsx
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from './components/common/LoadingSpinner';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Config = lazy(() => import('./pages/Config'));
const Download = lazy(() => import('./pages/Download'));
const Files = lazy(() => import('./pages/Files'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/config" element={<Config />} />
        <Route path="/download" element={<Download />} />
        <Route path="/files" element={<Files />} />
      </Routes>
    </Suspense>
  );
}
```

#### 组件级代码分割

对于大型组件，使用动态导入：

```tsx
// 大型组件懒加载
const HeavyComponent = lazy(() => import('./components/HeavyComponent'));

function MyPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### 2. 懒加载 (Lazy Loading)

#### 图片懒加载

使用 Ant Design 的 Image 组件实现图片懒加载：

```tsx
import { Image } from 'antd';

function FilePreview({ src }: { src: string }) {
  return (
    <Image
      src={src}
      loading="lazy"
      placeholder={<LoadingSpinner />}
      preview={false}
    />
  );
}
```

#### 数据懒加载

使用虚拟滚动处理大量数据：

```tsx
import { List } from 'antd';

function FileList({ files }: { files: File[] }) {
  return (
    <List
      dataSource={files}
      renderItem={(item) => <FileItem file={item} />}
      pagination={{
        pageSize: 50,
        showSizeChanger: true,
      }}
    />
  );
}
```

### 3. 缓存策略

#### React Query 缓存配置

优化 React Query 的缓存策略：

```tsx
// src/main.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 分钟
      cacheTime: 10 * 60 * 1000, // 10 分钟
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});
```

#### HTTP 缓存

配置适当的 HTTP 缓存头：

```tsx
// src/services/api.ts
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Cache-Control': 'public, max-age=300', // 5 分钟
  },
});
```

#### 本地存储缓存

使用 localStorage 缓存用户偏好：

```tsx
import { useLocalStorage } from '../hooks/useLocalStorage';

function ConfigPage() {
  const [config, setConfig] = useLocalStorage('config', defaultConfig);
  // ...
}
```

---

## 🔧 代码分割

### Vite 配置优化

优化 Vite 构建配置：

```ts
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'antd-vendor': ['antd', '@ant-design/icons'],
          'query-vendor': ['@tanstack/react-query'],
          'utils': ['./src/utils'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

### 动态导入优化

使用命名导出和动态导入：

```tsx
// 使用命名导出
export { Dashboard } from './pages/Dashboard';
export { Config } from './pages/Config';

// 动态导入
const { Dashboard } = await import('./pages/Dashboard');
```

---

## 📦 懒加载

### 路由懒加载

所有页面组件使用懒加载：

```tsx
// src/App.tsx
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Config = lazy(() => import('./pages/Config'));
const Download = lazy(() => import('./pages/Download'));
const Files = lazy(() => import('./pages/Files'));
const History = lazy(() => import('./pages/History'));
const Logs = lazy(() => import('./pages/Logs'));
const Stats = lazy(() => import('./pages/Stats'));
```

### 组件懒加载

大型组件使用懒加载：

```tsx
// 代码编辑器懒加载
const CodeEditor = lazy(() => import('./components/common/CodeEditor'));

// 文件上传器懒加载
const FileUploader = lazy(() => import('./components/common/FileUploader'));
```

---

## 💾 缓存策略

### React Query 缓存

#### 查询缓存配置

```tsx
// src/hooks/useConfig.ts
export function useConfig() {
  return useQuery({
    queryKey: ['config'],
    queryFn: () => configService.getConfig(),
    staleTime: 5 * 60 * 1000, // 5 分钟
    cacheTime: 10 * 60 * 1000, // 10 分钟
  });
}
```

#### 预取数据

在用户可能访问的页面预取数据：

```tsx
// src/pages/Dashboard.tsx
useEffect(() => {
  // 预取配置数据
  queryClient.prefetchQuery({
    queryKey: ['config'],
    queryFn: () => configService.getConfig(),
  });
}, []);
```

### 浏览器缓存

#### Service Worker (可选)

使用 Service Worker 实现离线缓存：

```ts
// public/sw.js
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

---

## 📈 性能监控

### Web Vitals 监控

集成 Web Vitals 监控：

```tsx
// src/utils/performance.ts
import { onCLS, onFID, onLCP } from 'web-vitals';

export function reportWebVitals(metric: any) {
  console.log(metric);
  // 发送到分析服务
}

onCLS(reportWebVitals);
onFID(reportWebVitals);
onLCP(reportWebVitals);
```

### React Profiler

使用 React DevTools Profiler 分析组件性能：

```tsx
import { Profiler } from 'react';

function onRenderCallback(
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number
) {
  console.log('Component:', id, 'Phase:', phase, 'Duration:', actualDuration);
}

<Profiler id="Dashboard" onRender={onRenderCallback}>
  <Dashboard />
</Profiler>
```

### 性能分析工具

#### Lighthouse CI

在 CI/CD 中集成 Lighthouse：

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push, pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - uses: treosh/lighthouse-ci-action@v7
        with:
          urls: |
            http://localhost:3000
          uploadArtifacts: true
```

---

## ✅ 最佳实践

### 1. 组件优化

#### 使用 React.memo

对于纯展示组件，使用 React.memo：

```tsx
export const FileItem = React.memo(({ file }: { file: File }) => {
  return <div>{file.name}</div>;
});
```

#### 使用 useMemo 和 useCallback

避免不必要的重新计算和渲染：

```tsx
function ConfigPage() {
  const [config, setConfig] = useState(defaultConfig);

  const filteredTargets = useMemo(() => {
    return config.targets.filter(t => t.enabled);
  }, [config.targets]);

  const handleSave = useCallback(() => {
    saveConfig(config);
  }, [config]);

  return <div>{/* ... */}</div>;
}
```

### 2. 状态管理优化

#### 使用 Zustand 选择器

避免不必要的重新渲染：

```tsx
// ❌ 不好的做法
const state = useStore();

// ✅ 好的做法
const user = useStore((state) => state.user);
```

### 3. 网络请求优化

#### 请求去重

使用 React Query 的请求去重功能：

```tsx
// React Query 自动去重相同查询
const { data } = useQuery({
  queryKey: ['config'],
  queryFn: () => configService.getConfig(),
});
```

#### 请求合并

合并多个请求：

```tsx
// 使用 Promise.all 合并请求
const [config, stats] = await Promise.all([
  configService.getConfig(),
  statsService.getStats(),
]);
```

### 4. 渲染优化

#### 虚拟滚动

对于长列表，使用虚拟滚动：

```tsx
import { FixedSizeList } from 'react-window';

function FileList({ files }: { files: File[] }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={files.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <FileItem file={files[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

#### 防抖和节流

使用防抖和节流优化用户输入：

```tsx
import { useDebounce } from '../hooks/useDebounce';

function SearchInput() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />;
}
```

---

## 🧪 性能测试

### 运行性能测试

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 运行 Lighthouse
npx lighthouse http://localhost:4173 --view
```

### 性能基准测试

创建性能基准测试：

```tsx
// src/__tests__/performance/bundle-size.test.ts
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Bundle Size', () => {
  it('should have reasonable bundle size', () => {
    const distPath = join(__dirname, '../../dist');
    const stats = JSON.parse(
      readFileSync(join(distPath, 'stats.json'), 'utf-8')
    );

    const mainBundleSize = stats.assets
      .find((asset: any) => asset.name.includes('index'))
      ?.size;

    expect(mainBundleSize).toBeLessThan(500 * 1024); // 500KB
  });
});
```

---

## 📚 参考资源

- [React 性能优化](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [React Query 性能优化](https://tanstack.com/query/latest/docs/react/guides/performance)
- [Vite 性能优化](https://vitejs.dev/guide/performance.html)

---

## 📝 更新日志

- **2025-01-XX**: 初始版本

