# Workflow Composer Phase 2A 文档

## 概述
基础交互打底阶段，实现右键添加节点、连线校验、空画布引导。

## 功能清单

### 右键画布添加节点
在画布空白处右键，弹出节点菜单：
- 分类展示：输入、处理、输出、工具
- 搜索过滤：支持节点名称、类型、分类
- 键盘导航：上下选择，Enter 确认，Esc 关闭
- 位置计算：节点落在鼠标位置，菜单防溢出

### 连线交互优化
- **校验规则**：
  - 禁止自连
  - 禁止重复连接
  - 类型兼容检查（同类型/any/隐式兼容）
  - 循环依赖检测（DFS）
- **错误提示**：顶部 Toast，2 秒自动消失
- **安全取消**：松手未连接时静默取消
- **删除支持**：Delete / Backspace 删除选中边

### 空画布引导
画布无节点时显示引导浮层：
- 图标 + "开始构建工作流" 标题
- 三个操作提示：右键 / 双击 / 顶部按钮
- 半透明深色主题，不干扰操作

## 文件结构

```
pages/workflow-composer/
├── WorkflowComposer.tsx      # 主组件（集成所有功能）
├── WorkflowComposerUI2.css   # 主样式 + 空引导 + 错误提示
├── ContextMenu.tsx           # 右键菜单组件
├── ContextMenu.css           # 菜单样式
├── ConnectionValidator.ts    # 连线校验逻辑
├── NodeSearchModal.tsx       # 双击搜索弹窗（已有）
├── ...
```

## API 变更

### 新增 Props
```typescript
// WorkflowComposer 内部状态
const [contextMenuOpen, setContextMenuOpen] = useState(false);
const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
const [contextMenuFlowPos, setContextMenuFlowPos] = useState({ x: 0, y: 0 });
const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
const [connectionError, setConnectionError] = useState<string | null>(null);
const [selectedEdges, setSelectedEdges] = useState<string[]>([]);
```

### 新增回调
```typescript
onPaneContextMenu={onPaneContextMenu}  // 右键画布
onConnectStart={onConnectStart}        // 开始连线
onConnectEnd={onConnectEnd}            // 结束连线
```

## 使用示例

### 右键添加节点
1. 在画布空白处右键
2. 输入关键词搜索（如 "yolo"）
3. 按 Enter 或点击节点
4. 节点出现在鼠标位置

### 连接节点
1. 从源节点输出端拖线
2. 拖到目标节点输入端
3. 兼容类型：自动连接
4. 不兼容类型：显示错误提示

### 删除连线
1. 点击连线选中（变蓝色）
2. 按 Delete 或 Backspace

## 注意事项
- 右键菜单使用 position: fixed，z-index 1100
- 连线错误提示使用绝对定位，z-index 100
- 空画布引导使用 pointer-events: none

## 后续计划
Phase 2B: 节点参数面板 + 边详情面板
