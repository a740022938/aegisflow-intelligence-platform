# Workflow Composer Phase 1E 技术文档

**版本**: v6.7.0  
**阶段**: Phase 1E — 编排结果转模板 + Dry-run Only  
**文档日期**: 2026-04-19

---

## 概述

Phase 1E 在 Phase 1D 的基础上增加了**编译预览**能力，将可视化的工作流编排转换为结构化的 Workflow Template，并提供完整的 dry-run 校验。

---

## 架构

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  WorkflowCanvas │────▶│  workflowCompiler │────▶│  CompilePreview │
│   (React Flow)  │     │   (编译核心)      │     │   (预览面板)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │  Dry-run Validate │
                        │   (校验逻辑)      │
                        └─────────────────┘
```

---

## 核心模块

### 1. workflowCompiler.ts

#### 拓扑排序 (topologicalSort)
使用 Kahn 算法，时间复杂度 O(V+E)。

```typescript
const order = topologicalSort(nodes, edges);
// 返回: ['node_1', 'node_2', 'node_3', ...]
```

#### 深度计算 (computeDepths)
动态规划计算每个节点在 DAG 中的层级。

```typescript
const depths = computeDepths(nodes, edges);
// 返回: { node_1: 0, node_2: 1, node_3: 1, ... }
```

#### 类型链路 (buildTypeLinks)
构建节点间的数据流映射，检查类型兼容性。

```typescript
const links = buildTypeLinks(nodes, edges);
// 返回: [{ fromNode, fromOutput, toNode, toInput, typeMatched }]
```

#### 输入闭合检查 (checkInputClosure)
验证每个节点的输入是否被上游节点提供。

#### 编译工作流 (compileWorkflow)
入口函数，返回完整的编译结果。

#### Dry-run 校验 (dryRunValidate)
对编译结果进行深度校验，返回错误和警告列表。

#### 模板导出 (exportAsTemplate)
将编译结果转换为标准 Workflow Template v2.0 格式。

---

### 2. CompilePreviewPanel.tsx

#### Props
```typescript
interface CompilePreviewPanelProps {
  compiled: CompiledWorkflow | null;
  dryRun: DryRunValidation | null;
  onExportTemplate: () => void;
  onRecompile: () => void;
}
```

#### 标签页

| Tab | 组件 | 说明 |
|-----|------|------|
| steps | 步骤列表 | 拓扑排序后的执行顺序 |
| deps | 依赖关系 | 数据流可视化，类型匹配状态 |
| params | 参数快照 | 每个节点的参数配置 |
| output | 输出摘要 | 预计输出、冻结节点 |

---

## 数据结构

### Workflow Template v2.0

```typescript
{
  version: "2.0",
  kind: "WorkflowTemplate",
  metadata: {
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
  },
  spec: {
    steps: Step[];
    execution_order: string[];
    entrypoint: string;
  },
  status: {
    compiled: boolean;
    validated: boolean;
    dry_run_only: boolean;  // Phase 1E 标记
  }
}
```

### CompiledStep

```typescript
interface CompiledStep {
  order: number;           // 执行顺序
  nodeId: string;          // 节点 ID
  nodeType: NodeType;      // 节点类型
  label: string;           // 显示名称
  inputs: string[];        // 输入类型列表
  outputs: string[];       // 输出类型列表
  params: Record<string, unknown>;  // 参数值
  paramSnapshot: ParamSnapshot[];   // 参数快照
  dependencies: string[];  // 依赖的节点 ID
  depth: number;           // 层级深度
  executable: boolean;     // 是否可执行
  frozenHint?: string;     // 冻结提示
}
```

---

## Dry-run 校验规则

| Code | Severity | Description |
|------|----------|-------------|
| TYPE_MISMATCH | error | 连接的类型不兼容 |
| MISSING_INPUT | error | 节点输入未被提供 |
| SELF_DEPENDENCY | error | 节点依赖自身 |
| MISSING_PARAM | error | 必填参数未提供 |
| FROZEN_NODE | warning | 节点处于冻结态 |

---

## 使用流程

1. **编排工作流**: 在画布上拖拽节点、连线
2. **配置参数**: 在右侧面板设置每个节点的参数
3. **点击编译**: 顶部工具栏「🔧 编译」按钮
4. **查看预览**: 右侧面板切换为编译预览
5. **检查校验**: 查看 Dry-run 结果
6. **导出模板**: 校验通过后导出 JSON

---

## 约束

- 所有节点 `executable=false`
- YOLO/SAM 节点保持冻结态
- 不调用后端 executor
- 不扩展插件门禁

---

## 扩展建议

### Phase 1F 方向
- 模板持久化（后端存储）
- 模板版本管理
- 与 `/api/workflow-templates` 集成
- 模板 marketplace

### 性能优化
- 大工作流虚拟滚动
- 编译结果缓存
- 增量编译
