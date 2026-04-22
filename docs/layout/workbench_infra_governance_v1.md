# 工作台基础设施治理文档 v1.0.0

## 概述

本文档描述 AGI Model Factory 工作台基础设施的治理规范，包括 WorkspaceGrid 使用规范、布局存储约定、类型与兼容策略。

## 组件架构

```
┌─────────────────────────────────────────────────────────────┐
│                      WorkspaceGrid                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              react-grid-layout                       │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐             │   │
│  │  │ Card 1  │  │ Card 2  │  │ Card 3  │  ...        │   │
│  │  └─────────┘  └─────────┘  └─────────┘             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    layoutStorage.ts                         │
│  - loadLayout(pageKey): LayoutConfig | null                 │
│  - saveLayout(pageKey, layout): void                        │
│  - clearLayout(pageKey): void                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      localStorage                           │
│  Key: agi_layout_v1:{pageKey}                               │
│  Value: { version, data, savedAt }                          │
└─────────────────────────────────────────────────────────────┘
```

## WorkspaceGrid 使用规范

### 基本用法

```tsx
import WorkspaceGrid from '../layout/WorkspaceGrid';
import { loadLayout, saveLayout, clearLayout, type LayoutConfig } from '../layout/layoutStorage';

const DEFAULT_LAYOUTS: LayoutConfig = {
  lg: [
    { i: 'card1', x: 0, y: 0, w: 6, h: 5, minW: 4, minH: 4 },
    { i: 'card2', x: 6, y: 0, w: 6, h: 5, minW: 4, minH: 4 },
  ],
  md: [
    { i: 'card1', x: 0, y: 0, w: 4, h: 5, minW: 3, minH: 4 },
    { i: 'card2', x: 4, y: 0, w: 4, h: 5, minW: 3, minH: 4 },
  ],
  sm: [
    { i: 'card1', x: 0, y: 0, w: 1, h: 5, minW: 1, minH: 4 },
    { i: 'card2', x: 0, y: 5, w: 1, h: 5, minW: 1, minH: 4 },
  ],
};

function MyPage() {
  const [layoutEdit, setLayoutEdit] = useState(false);
  const [layouts, setLayouts] = useState<LayoutConfig>(DEFAULT_LAYOUTS);

  // Load saved layout on mount
  useEffect(() => {
    const saved = loadLayout('my-page');
    if (saved) setLayouts(saved);
  }, []);

  // Save layout on change
  const handleLayoutChange = useCallback((next: LayoutConfig) => {
    setLayouts(next);
    saveLayout('my-page', next);
  }, []);

  // Reset to default
  const handleResetLayout = useCallback(() => {
    setLayouts(DEFAULT_LAYOUTS);
    clearLayout('my-page');
  }, []);

  const cards = [
    { id: 'card1', content: <div>Card 1 Content</div> },
    { id: 'card2', content: <div>Card 2 Content</div> },
  ];

  return (
    <>
      <button onClick={() => setLayoutEdit(v => !v)}>
        {layoutEdit ? '完成编辑' : '编辑布局'}
      </button>
      {layoutEdit && <button onClick={handleResetLayout}>恢复默认</button>}
      <WorkspaceGrid
        editable={layoutEdit}
        layouts={layouts}
        cards={cards}
        onChange={handleLayoutChange}
      />
    </>
  );
}
```

### Props 接口

```typescript
interface WorkspaceGridProps {
  /** 是否启用编辑模式（拖拽/缩放） */
  editable: boolean;
  
  /** 布局配置（lg/md/sm 三断点） */
  layouts: LayoutConfig;
  
  /** 卡片列表 */
  cards: GridCard[];
  
  /** 布局变化回调 */
  onChange: (next: LayoutConfig) => void;
}

interface GridCard {
  /** 卡片唯一标识，需与 layouts 中的 i 对应 */
  id: string;
  
  /** 卡片内容 */
  content: React.ReactNode;
}

interface LayoutConfig {
  lg: LayoutItem[];  // >= 1200px, 12 columns
  md: LayoutItem[];  // >= 996px, 8 columns
  sm: LayoutItem[];  // < 996px, 1 column
}

interface LayoutItem {
  i: string;      // 唯一标识
  x: number;      // 列位置（0-based）
  y: number;      // 行位置
  w: number;      // 宽度（列数）
  h: number;      // 高度（行数，每行40px）
  minW?: number;  // 最小宽度
  minH?: number;  // 最小高度
}
```

### 断点定义

| 断点 | 宽度 | 列数 | 典型卡片宽度 |
|------|------|------|--------------|
| lg | >= 1200px | 12 | 6（半宽）/ 12（全宽）|
| md | >= 996px | 8 | 4（半宽）/ 8（全宽）|
| sm | < 996px | 1 | 1（全宽）|

### 行高

- 固定行高：`40px`
- 卡片高度 = `h * 40px + (h - 1) * 12px`（margin 补偿）

## 页面接入约定

### A 类页面（整页工作台化）

```typescript
// layout key 命名
const LAYOUT_KEY = 'modulecenter';  // 或 'dashboard', 'factorystatus' 等

// 整页使用 WorkspaceGrid
return (
  <WorkspaceGrid
    editable={layoutEdit}
    layouts={layouts}
    cards={workspaceCards}
    onChange={handleLayoutChange}
  />
);
```

### B 类页面（局部工作台化）

```typescript
// layout key 命名
const LAYOUT_KEY = 'models-detail';  // 或 'datasets-detail', 'tasks-detail' 等

// 仅在 Overview Tab 中使用 WorkspaceGrid
{activeTab === 'overview' && (
  <>
    <div className="workspace-toolbar">
      <button onClick={() => setLayoutEdit(v => !v)}>
        {layoutEdit ? '✓ 完成编辑' : '✎ 编辑布局'}
      </button>
      {layoutEdit && (
        <button onClick={handleResetLayout}>⟲ 恢复默认</button>
      )}
    </div>
    <WorkspaceGrid
      editable={layoutEdit}
      layouts={layouts}
      cards={workspaceCards}
      onChange={handleLayoutChange}
    />
  </>
)}
```

## 布局存储约定

### Storage Key 格式

```
agi_layout_v1:{pageKey}
```

### 示例

| 页面 | Storage Key |
|------|-------------|
| ModuleCenter | `agi_layout_v1:modulecenter` |
| Dashboard | `agi_layout_v1:dashboard` |
| Models | `agi_layout_v1:models-detail` |
| Datasets | `agi_layout_v1:datasets-detail` |

### 存储数据结构

```typescript
{
  version: '1.0.0',           // 布局数据版本
  data: {
    lg: [...],                // lg 断点布局
    md: [...],                // md 断点布局
    sm: [...],                // sm 断点布局
  },
  savedAt: '2026-04-19T06:00:00.000Z',  // 保存时间
}
```

### 兼容性策略

1. **版本检查**
   - 加载时检查 version 字段
   - 版本不匹配时自动重置为默认布局

2. **数据验证**
   - 验证 layout item 的必要字段（i, x, y, w, h）
   - 验证坐标和尺寸为正数
   - 验证失败时自动重置

3. **旧格式迁移**
   - 支持直接存储的 LayoutConfig（无 version 包装）
   - 新保存的数据使用 version 包装格式

4. **重置机制**
   - 用户可手动点击"恢复默认"重置
   - 数据损坏时自动重置
   - 重置后清除 localStorage 中的保存记录

## 类型与兼容策略

### 类型定义

```typescript
// layoutStorage.ts
export type LayoutBreakpoint = 'lg' | 'md' | 'sm';

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export interface LayoutConfig {
  lg: LayoutItem[];
  md: LayoutItem[];
  sm: LayoutItem[];
}
```

### 类型转换

WorkspaceGrid 内部使用 react-grid-layout 的类型，通过转换函数与我们的 LayoutConfig 兼容：

```typescript
// 我们的 LayoutItem -> react-grid-layout Layout
const toRglLayout = (items: LayoutItem[]): RglLayoutItem[] => {
  return items.map(item => ({
    i: item.i,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
    minW: item.minW,
    minH: item.minH,
  }));
};

// react-grid-layout Layout -> 我们的 LayoutItem
const fromRglLayout = (items: RglLayoutItem[]): LayoutItem[] => {
  return items.map(item => ({
    i: item.i,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
    minW: item.minW,
    minH: item.minH,
  }));
};
```

### 错误处理

| 场景 | 处理方式 |
|------|----------|
| localStorage 读取失败 | 返回 null，使用默认布局 |
| JSON 解析失败 | 清除损坏数据，返回 null |
| 数据格式无效 | 清除损坏数据，返回 null |
| 版本不匹配 | 返回 null，使用默认布局 |
| 保存失败 | 静默失败，不影响用户体验 |

## 移动端优化

### sm 断点优化策略

1. **布局调整**
   - 单列布局（1 column）
   - 卡片垂直堆叠
   - 减小 padding 和 margin

2. **交互优化**
   - 编辑模式视觉反馈减弱（无动画）
   - 缩放手柄缩小（16x16px）
   - 卡片内容区域可滚动

3. **样式调整**
   - 卡片圆角减小（8px）
   - 拖拽手柄 padding 减小
   - 整体 padding 减小

### CSS 媒体查询

```css
@media (max-width: 768px) {
  .workspace-grid-wrap {
    padding: 4px;
  }

  .workspace-grid-card {
    border-radius: 8px;
  }

  .workspace-drag-handle {
    padding: 6px 10px;
    font-size: 10px;
  }

  .workspace-grid-body {
    overflow: auto;
  }

  .workspace-grid-card.editing {
    box-shadow: 0 0 0 1px rgba(34, 211, 238, 0.5);
    animation: none;
  }

  .workspace-grid .react-resizable-handle {
    width: 16px;
    height: 16px;
  }
}
```

## API 参考

### layoutStorage

| 函数 | 签名 | 说明 |
|------|------|------|
| `loadLayout` | `(pageKey: string) => LayoutConfig \| null` | 加载保存的布局 |
| `saveLayout` | `(pageKey: string, layout: LayoutConfig) => void` | 保存布局 |
| `clearLayout` | `(pageKey: string) => void` | 清除保存的布局 |
| `loadSidebarWidth` | `(defaultWidth: number) => number` | 加载侧边栏宽度 |
| `saveSidebarWidth` | `(width: number) => void` | 保存侧边栏宽度 |
| `getSavedLayoutKeys` | `() => string[]` | 获取所有已保存的 layout key |
| `clearAllLayouts` | `() => void` | 清除所有保存的布局 |

## 最佳实践

1. **默认布局设计**
   - 信息密度高的卡片放上方
   - 高度较高的卡片放下方
   - 相关卡片相邻放置
   - 避免初始布局挤压/出界

2. **卡片 ID 管理**
   - 使用有意义的 ID（如 'task_summary', 'run_status'）
   - 确保 ID 唯一且稳定
   - ID 变更会导致用户布局丢失

3. **编辑模式 UX**
   - 编辑按钮放在工作台区域标题栏
   - 编辑态有清晰的视觉反馈
   - 提供"恢复默认"按钮

4. **性能优化**
   - 使用 useMemo 缓存 cards
   - 使用 useCallback 缓存 onChange
   - 避免频繁的状态更新

## 变更日志

### v1.0.0 (2026-04-19)

- 初始版本
- 支持 lg/md/sm 三断点
- 支持布局持久化
- 支持移动端基础优化
- 添加数据验证和兼容性策略
