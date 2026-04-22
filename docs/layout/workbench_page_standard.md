# 工作台页接入标准

## 概述
本文档定义如何将一个页面接入"可编辑工作台页"体系，基于 WorkspaceGrid + layoutStorage + react-grid-layout 技术栈。

## 适用场景

### 适合接入的页面特征
- 页面由多个**独立卡片**组成
- 卡片内容**相对独立**，无强顺序依赖
- 用户可能需要**按个人习惯调整**卡片位置和大小
- 存在**挤压/出界**问题，需要灵活布局

### 不适合接入的页面
- 长表格页（如 Audit 日志列表）
- 纯表单页（如 CostRouting 配置）
- 强结构详情页（如 Deployments 运行时详情）
- 专用画布页（如 WorkflowCanvas DAG）

## 接入步骤

### 步骤 1：导入依赖

```typescript
import React, { useState, useEffect, useMemo } from 'react';
import WorkspaceGrid from '../layout/WorkspaceGrid';
import { clearLayout, loadLayout, saveLayout, type LayoutConfig } from '../layout/layoutStorage';
import '../layout/workspace-grid.css';
```

### 步骤 2：定义布局配置

```typescript
// 页面唯一标识
const LAYOUT_KEY = 'page-name';

// 优化后的默认布局
const DEFAULT_LAYOUTS: LayoutConfig = {
  lg: [
    // 桌面端：12 列网格
    { i: 'card-1', x: 0, y: 0, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'card-2', x: 4, y: 0, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'card-3', x: 8, y: 0, w: 4, h: 6, minW: 3, minH: 4 },
  ],
  md: [
    // 平板端：8 列网格
    { i: 'card-1', x: 0, y: 0, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'card-2', x: 4, y: 0, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'card-3', x: 0, y: 6, w: 4, h: 6, minW: 3, minH: 4 },
  ],
  sm: [
    // 移动端：单列堆叠
    { i: 'card-1', x: 0, y: 0, w: 1, h: 6, minW: 1, minH: 4 },
    { i: 'card-2', x: 0, y: 6, w: 1, h: 6, minW: 1, minH: 4 },
    { i: 'card-3', x: 0, y: 12, w: 1, h: 6, minW: 1, minH: 4 },
  ],
};
```

### 步骤 3：状态管理

```typescript
export default function PageName() {
  // 编辑模式开关
  const [layoutEdit, setLayoutEdit] = useState(false);
  
  // 布局状态（从 localStorage 加载或使用默认）
  const [layouts, setLayouts] = useState<LayoutConfig>(
    () => loadLayout(LAYOUT_KEY) || DEFAULT_LAYOUTS
  );
  
  // 持久化：布局变化自动保存
  useEffect(() => {
    saveLayout(LAYOUT_KEY, layouts);
  }, [layouts]);
  
  // ... 其他业务逻辑
}
```

### 步骤 4：定义卡片内容

```typescript
const cards = useMemo(() => [
  {
    id: 'card-1',
    content: (
      <SectionCard title="卡片标题" description="描述">
        {/* 卡片内容 */}
      </SectionCard>
    ),
  },
  {
    id: 'card-2',
    content: (
      <SectionCard title="卡片标题 2" description="描述 2">
        {/* 卡片内容 */}
      </SectionCard>
    ),
  },
  // ... 更多卡片
], [/* 依赖项 */]);
```

### 步骤 5：渲染布局

```typescript
return (
  <div className="page-root">
    <PageHeader
      title="页面标题"
      subtitle="副标题"
      actions={
        <div className="page-actions">
          {/* 编辑模式切换按钮 */}
          <button
            className={`ui-btn ui-btn-sm ${layoutEdit ? 'ui-btn-warning' : 'ui-btn-outline'}`}
            onClick={() => setLayoutEdit((v) => !v)}
          >
            {layoutEdit ? '退出布局编辑' : '布局编辑'}
          </button>
          
          {/* 重置布局按钮 */}
          <button
            className="ui-btn ui-btn-outline ui-btn-sm"
            onClick={() => {
              clearLayout(LAYOUT_KEY);
              setLayouts(DEFAULT_LAYOUTS);
            }}
          >
            重置布局
          </button>
        </div>
      }
    />
    
    {/* 工作台网格 */}
    <WorkspaceGrid
      editable={layoutEdit}
      layouts={layouts}
      cards={cards}
      onChange={setLayouts}
    />
  </div>
);
```

## 布局设计原则

### 1. 默认布局要合理
- 首次访问用户看到合理的初始布局
- 避免卡片挤压、出界
- 重要卡片放在显眼位置

### 2. 最小尺寸限制
- 每个卡片必须设置 `minW` 和 `minH`
- 确保缩放后内容仍可读
- 推荐最小尺寸：3x4（桌面）、2x3（平板）、1x4（移动）

### 3. 响应式设计
- **lg (>=1200px)**：12 列，多列并排
- **md (>=900px)**：8 列，多列并排
- **sm (<900px)**：1 列，堆叠

### 4. 卡片 ID 规范
- 使用小写 + 下划线命名
- 确保全站唯一（建议前缀页面名）
- 示例：`dashboard_factory_status`, `module_center_health_score`

## 注意事项

### Drilldown 面板处理
浮动面板（如详情弹窗、抽屉）不应参与布局编辑：
```typescript
{showDrilldown && (
  <DrilldownPanel ...>
    {/* 内容 */}
  </DrilldownPanel>
)}
```

### 性能优化
- 使用 `useMemo` 缓存 cards 数组
- 避免在 cards 中创建内联函数
- 大数据量卡片考虑虚拟滚动

### 类型安全
WorkspaceGrid 有既有类型错误（Layout[] vs LayoutItem[]），不影响运行时，可忽略或后续统一修复。

## 验收标准

| # | 验收项 | 检查方式 |
|---|--------|----------|
| 1 | 支持进入/退出编辑布局模式 | 点击"布局编辑"按钮 |
| 2 | 卡片可拖拽 | 编辑模式下拖拽手柄可用 |
| 3 | 卡片可鼠标改大小 | 编辑模式下缩放手柄可用 |
| 4 | 布局自动保存 | 刷新页面后恢复上次布局 |
| 5 | 可恢复默认布局 | "重置布局"按钮功能正常 |
| 6 | 响应式正常 | lg/md/sm 三档切换正常 |
| 7 | TypeScript 通过 | 无新增错误 |
| 8 | Vite build 通过 | 构建成功 |

## 示例参考

- **ModuleCenter.tsx** — 完整工作台页示例
- **Dashboard.tsx** — 多卡片仪表盘示例
- **FactoryStatus.tsx** — 工厂状态页示例
