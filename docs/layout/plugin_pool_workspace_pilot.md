# PluginPool Workbench Layout Pilot v1 文档

## 概述
PluginPool 页面从传统表格布局升级为可编辑工作台布局，支持卡片拖拽、缩放、布局持久化。

## 页面结构

### 卡片清单

| 卡片 ID | 名称 | 内容 |
|---------|------|------|
| stats_overview | 📊 统计概览 | 插件数量统计（启用/试运行/冻结/规划中） |
| trial_warning | ⚠️ 试运行警告 | 试运行插件列表和警告信息 |
| quick_actions | ⚡ 快捷操作 | Canvas 链接、刷新按钮、搜索框 |
| active_plugins | 🟢 启用插件 | 已启用插件列表 |
| trial_plugins | 🟡 试运行 | 试运行插件列表 |
| frozen_plugins | 🔵 冻结/规划 | 冻结和规划中插件列表 |
| execution_stats | 📈 执行统计 | 成功/失败/阻断统计 |
| capability_breakdown | 🧩 能力分布 | 按能力标签统计 |
| risk_distribution | ⚠️ 风险分布 | 按风险等级统计 |

### 布局配置

#### 桌面端 (lg >= 1200px)
```
┌─────────┬─────────────┬─────────┐
│  Stats  │ Trial Warn  │ Actions │
├─────────┴─────────────┴─────────┤
│         Active Plugins          │
├─────────┬───────────┬───────────┤
│ Active  │  Trial    │  Frozen   │
├─────────┴───────────┴───────────┤
│  Exec   │ Capability│   Risk    │
└─────────┴───────────┴───────────┘
```

#### 平板端 (md >= 900px)
```
┌──────┬──────────┬──────┐
│Stats │Trial Warn│Action│
├──────┴──────────┴──────┤
│     Active Plugins     │
├────────┬───────┬───────┤
│ Active │ Trial │ Frozen│
├────────┴───────┴───────┤
│  Exec  │ Capab │ Risk  │
└────────┴───────┴───────┘
```

#### 移动端 (sm < 900px)
单列堆叠，从上到下依次显示所有卡片。

## 功能特性

### 1. 编辑布局模式
- 点击"✏️ 编辑布局"进入编辑模式
- 拖拽手柄出现，可拖动卡片位置
- 缩放手柄出现，可改变卡片大小
- 点击"✓ 完成编辑"退出编辑模式

### 2. 布局持久化
- 布局自动保存到 localStorage
- key: `agi_layout_v1_plugin_pool`
- 刷新页面后恢复上次布局

### 3. 重置布局
- 点击"↺ 重置布局"恢复默认布局
- 清除 localStorage 中的保存数据

### 4. 详情面板
- 点击插件卡片显示浮动详情面板
- 面板不参与布局编辑（固定位置）
- 支持信息/审计两个标签页

## 技术实现

### 依赖
- `react-grid-layout` — 网格布局
- `react-resizable` — 缩放功能
- `WorkspaceGrid` — 封装组件
- `layoutStorage` — 持久化工具

### 关键代码

```typescript
// 布局状态
const [layoutEdit, setLayoutEdit] = useState(false);
const [layouts, setLayouts] = useState<LayoutConfig>(
  () => loadLayout('plugin_pool') || DEFAULT_LAYOUTS
);

// 持久化
useEffect(() => {
  saveLayout('plugin_pool', layouts);
}, [layouts]);

// 渲染
<WorkspaceGrid
  editable={layoutEdit}
  layouts={layouts}
  cards={cards}
  onChange={setLayouts}
/>
```

## 与旧版对比

| 特性 | 旧版 | 新版 |
|------|------|------|
| 布局 | 固定表格 | 可编辑网格 |
| 拖拽 | ❌ | ✅ |
| 缩放 | ❌ | ✅ |
| 持久化 | ❌ | ✅ |
| 响应式 | 简单适配 | 三档断点 |
| 自定义 | ❌ | ✅ |

## 注意事项

1. **卡片最小尺寸** — 避免缩放后内容挤压
2. **布局 key 唯一** — 确保不与其他页面冲突
3. **详情面板浮动** — 不参与布局编辑
4. **移动端单列** — sm 断点体验一般

## 参考

- `ModuleCenter.tsx` — 工作台布局参考实现
- `Dashboard.tsx` — 多卡片布局参考
- `FactoryStatus.tsx` — 复杂卡片布局参考
