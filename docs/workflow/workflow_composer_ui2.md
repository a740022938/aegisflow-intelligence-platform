# Workflow Composer UI 2.0 技术文档

**版本**: v6.7.0  
**阶段**: UI 2.0 — ComfyUI 风格升级版  
**文档日期**: 2026-04-19

---

## 概述

UI 2.0 将 Workflow Composer 从工业控制台风格升级为 ComfyUI 风格的节点工作台，提供更直观的可视化编排体验。

---

## 架构

```
┌─────────────────────────────────────────────────────────────┐
│                     WorkflowComposer                        │
├─────────────────────────────────────────────────────────────┤
│  Toolbar (顶部)                                             │
│  ├─ 新建/打开/保存                                          │
│  ├─ 编译/导出/导入                                          │
│  └─ 草稿名称编辑                                            │
├─────────────────────────────────────────────────────────────┤
│  Canvas (画布)                                              │
│  ├─ ReactFlow 无限网格                                      │
│  ├─ ComfyNode 类型节点                                      │
│  ├─ 双击 → NodeSearchModal                                  │
│  └─ Controls + MiniMap                                      │
├─────────────────────────────────────────────────────────────┤
│  Sidebar (右侧，可选)                                       │
│  └─ CompilePreviewPanel                                     │
├─────────────────────────────────────────────────────────────┤
│  StatusBar (底部)                                           │
│  ├─ 节点/连接统计                                           │
│  ├─ 校验状态                                                │
│  └─ 缩放控制                                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 核心组件

### 1. NodeTypes.ts

**类型配色系统**:
```typescript
TYPE_COLORS: Record<string, { bg: string; border: string; glow: string }>
```

**节点配置**:
```typescript
NodeTypeConfig {
  type: NodeType;
  category: 'input' | 'process' | 'output' | 'utility';
  color: string;
  inputs: PortConfig[];
  outputs: PortConfig[];
  collapsible: boolean;
  frozen?: boolean;
}
```

### 2. ComfyNode.tsx

**Props**:
```typescript
interface ComfyNodeData {
  label: string;
  nodeType: string;
  params: Record<string, unknown>;
  collapsed?: boolean;
}
```

**功能**:
- 类型配色边框/背景
- 输入端口（左侧）
- 输出端口（右侧）
- 折叠/展开按钮
- 帮助面板 (?)
- 冻结标识 (❄️)

### 3. NodeSearchModal.tsx

**触发**: `onPaneDoubleClick`

**功能**:
- 模糊搜索（名称/类型/分类）
- 分类分组展示
- 键盘导航（↑↓ Enter ESC）
- 冻结节点标记

### 4. StatusBar.tsx

**显示**:
- 节点数 / 连接数
- 阻断错误数 / 警告数
- Dry-run Ready 指示灯
- 视口坐标
- 缩放控制 (+/-/fit)

---

## 样式系统

### CSS 变量（通过 Tailwind 扩展）

```css
/* 主色调 */
--primary: #38BDF8;      /* 电路蓝 */
--primary-glow: rgba(56, 189, 248, 0.3);

/* 背景 */
--bg-base: #0A0A0A;
--bg-elevated: #141414;

/* 边框 */
--border: #252525;
```

### 类型配色

| 类型 | 颜色 | 用途 |
|------|------|------|
| dataset | #3B82F6 | 数据集 |
| image | #8B5CF6 | 图像 |
| mask | #EC4899 | 掩码 |
| detection | #10B981 | 检测 |
| model | #F59E0B | 模型 |
| report | #6366F1 | 报告 |
| archive | #6B7280 | 归档 |
| any | #9CA3AF | 任意 |

---

## 快捷键

| 快捷键 | 功能 | 实现位置 |
|--------|------|----------|
| Ctrl+S | 保存草稿 | window keydown |
| Ctrl+Enter | 编译 | window keydown |
| Delete | 删除选中 | window keydown |
| ESC | 关闭弹窗 | NodeSearchModal |
| ↑↓ | 搜索导航 | NodeSearchModal |
| Enter | 确认选择 | NodeSearchModal |

---

## 数据流

```
User Action → ReactFlow State → syncToDraft → Validation
                                    ↓
                              localStorage (草稿)
                                    ↓
                              compileWorkflow
                                    ↓
                              CompilePreviewPanel
```

---

## 扩展指南

### 添加新节点类型

1. 在 `NodeTypes.ts` 添加配置:
```typescript
'new-node': {
  type: 'new-node',
  label: 'New Node',
  category: 'process',
  icon: '🔧',
  color: '#XXYYZZ',
  inputs: [...],
  outputs: [...],
}
```

2. 在 `workflowSchema.ts` NODE_REGISTRY 添加定义

### 自定义类型配色

修改 `TYPE_COLORS` 添加新类型颜色映射。

---

## 性能优化

- 使用 `useMemo` 缓存过滤结果
- 防抖校验（500ms）
- ReactFlow `onlyRenderVisibleElements`（默认开启）

---

## 约束

- 所有节点 `executable=false`（冻结态）
- YOLO/SAM 节点显示冻结提示
- 不调用后端 executor API
