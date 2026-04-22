# NodeParamPanel 参数表单自动生成 MVP v1 设计文档

## 概述

本模块为能力注册自动化 MVP v2 的核心实现：让 registry 节点在 NodeParamPanel 中拥有最小可用的自动参数表单。

## 核心设计

### 参数获取流程

```
/api/plugins/catalog (8s timeout)
    ↓
CatalogItem[]
    ↓
input_schema (JSON Schema)
    ↓
extractParamsFromSchema()
    ↓
ParamConfig[] (表单配置组)
    ↓
NodeParamPanel (双源读取)
    ↓
handleParamChange → setNodes (ReactFlow 状态)
```

### JSON Schema 解析策略

| Schema 类型 | 映射到 | 备注 |
|------------|--------|------|
| `type: string` | `ParamConfig.type = 'string'` | 文本输入 |
| `type: number` | `ParamConfig.type = 'number'` | 数字输入 |
| `type: integer` | `ParamConfig.type = 'number'` | 同上 |
| `type: boolean` | `ParamConfig.type = 'boolean'` | Toggle |
| `enum: [...]` | `ParamConfig.type = 'select'` | 下拉 |
| `type: object` | `null` | 暂不支持 |
| `type: array` | `null` | 暂不支持 |

**推导字段**：`schema.title` → label/labelZh，`schema.default` → default，`schema.description` → description，`schema.required` → required

### 双源读取策略

```typescript
// NodeParamPanel 内部
const paramConfigs = useMemo(() => {
  // 1. 优先从 registry 查
  const regParams = getRegistryParams(nodeType);
  if (regParams) return regParams;

  // 2. Fallback 到 NODE_REGISTRY（hardcoded 节点）
  const config = NODE_REGISTRY[nodeType];
  if (config) return config.params;

  // 3. Safe fallback（schema 无效或未加载）
  return [];
}, [nodeType]);
```

### 安全 Fallback 设计

任何环节失败都不会崩溃：

1. `ensureCatalogLoaded()` 失败 → `_catalogLoaded = false` → `getRegistryParams()` 返回 `undefined` → NodeParamPanel 显示 "此插件暂未提供可编辑参数"
2. `input_schema` 为 null → `extractParamsFromSchema()` 返回 `[]` → safe fallback 提示
3. schema 字段类型不支持 → `schemaPropertyToParam()` 返回 `null` → 该字段被跳过

## 架构图

```
CapabilityAdapter
  ├── ensureCatalogLoaded()  ← startup时调用一次，8s timeout
  ├── _catalogMap: Map<string, CatalogItem>
  ├── getRegistryParams(type)  ← 同步查询，返回 ParamConfig[] | undefined
  └── extractParamsFromSchema() ← JSON Schema → ParamConfig[]

WorkflowComposer
  ├── useEffect → ensureCatalogLoaded() ← 启动时
  ├── handleParamChange → setNodes  ← 参数变更时
  └── NodeParamPanel → selectedNodeIds + nodes + handleParamChange

NodeParamPanel
  ├── getRegistryParams(nodeType)  ← 查 registry
  ├── NODE_REGISTRY[nodeType]    ← 查 hardcoded
  └── fallback → safe hint
```

## 未完成项

1. **嵌套对象/数组** — JSON Schema 支持不完整
2. **labelZh** — 仍用 `name` 代替
3. **参数校验** — 未实现 min/max 校验
4. **动态依赖字段** — 未实现

## 扩展路径

### 下一步：参数校验与执行联动
- 按 pipeline 顺序执行 registry 节点
- 前序节点输出自动填充后序节点参数
- dry-run 验证参数正确性
