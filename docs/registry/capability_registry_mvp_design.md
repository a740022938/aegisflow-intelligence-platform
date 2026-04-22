# 能力注册自动化 — MVP 设计冻结

> 日期: 2026-04-19
> 版本: v0.1-draft
> 状态: 设计冻结（不落地到运行页面）

---

## 一、推荐最小链路

### 🎯 唯一推荐路径：编排器 NodePalette 从 /api/plugins/catalog 渲染

**理由**:
1. PluginPool 已验证"从统一 API 渲染"可行
2. `/api/plugins/catalog` 已返回画布节点所需的核心字段
3. NodePalette 数据结构与 catalog 返回高度重合
4. 不改执行层、不改 ModuleCenter、不改 PluginPool 行为
5. 只改编排器内部数据流，影响面最小

**不做的事**:
- ❌ 不合并两套注册体系为一个大 registry
- ❌ 不改 ModuleCenter
- ❌ 不改 PluginPool
- ❌ 不改执行层
- ❌ 不创建新插件来覆盖硬编码节点

---

## 二、MVP 方案设计

### 2.1 数据流（目标态）

```
manifest.json
    ↓
PluginLoader.loadBuiltinPlugins()
    ↓
PluginManager (内存)
    ↓
GET /api/plugins/catalog (扩展字段)
    ↓
┌─────────────────────────────────────────┐
│          CapabilityAdapter              │
│  catalog item → ComposerNodeConfig      │
│  (填充缺失字段 + 兜底硬编码)              │
└─────────────────────────────────────────┘
    ↓
NodePalette / ContextMenu / NodeSearchModal / NodeParamPanel / ConnectionValidator
```

### 2.2 CapabilityAdapter 草案

```typescript
// packages/web-ui/src/adapters/capabilityAdapter.ts

import type { ComposerNodeConfig } from './types';

// 从 /api/plugins/catalog 返回的单条记录
interface CatalogItem {
  plugin_id: string;
  name: string;
  version: string;
  category: string;
  status: string;
  execution_mode: string;
  risk_level: string;
  enabled: boolean;
  requires_approval: boolean;
  dry_run_supported: boolean;
  ui_node_type: string;
  icon: string;
  color: string;
  description: string;
  capabilities: string[];
  permissions: string[];
  allowed_upstream: string[];
  allowed_downstream: string[];
  input_schema: any | null;
  output_schema: any | null;
  tags: string[];
}

// 编排器需要的统一格式
interface ComposerNodeConfig {
  type: string;
  label: string;
  labelZh: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  description: string;
  category: 'input' | 'process' | 'output' | 'utility';
  inputs: PortDef[];
  outputs: PortDef[];
  params: ParamDef[];
  frozen: boolean;
  frozenHint?: string;
  source: 'registry' | 'hardcoded';
}

interface PortDef {
  name: string;
  label: string;
  type: string;
  required: boolean;
  description?: string;
}

interface ParamDef {
  key: string;
  label: string;
  labelZh: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'text';
  required: boolean;
  default?: unknown;
  options?: { value: string; label: string }[];
  placeholder?: string;
  description?: string;
}

// 核心转换函数
function catalogToComposerConfig(item: CatalogItem): ComposerNodeConfig | null {
  // 1. 过滤：只展示 enabled + active 的插件
  if (!item.enabled || item.status !== 'active') return null;
  
  // 2. 过滤：只展示有 ui_node_type 的插件
  if (!item.ui_node_type) return null;

  // 3. 推导 category (domain/subdomain → input/process/output/utility)
  const domain = item.category?.split('/')[0] || 'other';
  const categoryMap: Record<string, 'input' | 'process' | 'output' | 'utility'> = {
    'data': 'input',
    'vision': 'process',
    'report': 'output',
    'export': 'output',
    'system': 'utility',
  };
  const category = categoryMap[domain] || 'process';

  // 4. 推导颜色
  const bgColor = hexToRgba(item.color || '#6b7280', 0.08);
  const borderColor = item.color || '#6b7280';
  const glowColor = hexToRgba(item.color || '#6b7280', 0.4);

  // 5. 从 input/output_schema 提取端口
  const inputs = extractPorts(item.input_schema, 'in');
  const outputs = extractPorts(item.output_schema, 'out');

  // 6. 从 input_schema 提取参数
  const params = extractParams(item.input_schema);

  // 7. 冻结判断
  const frozen = item.status === 'frozen' || !item.dry_run_supported;
  const frozenHint = frozen ? (item.status === 'frozen' ? '插件已冻结' : '暂不支持执行') : undefined;

  return {
    type: item.plugin_id,        // 用 plugin_id 作为 node type
    label: item.name,
    labelZh: item.name,          // 暂无 nameZh 字段，回退到 name
    icon: item.icon || '🔌',
    color: item.color || '#6b7280',
    bgColor,
    borderColor,
    glowColor,
    description: item.description || '',
    category,
    inputs,
    outputs,
    params,
    frozen,
    frozenHint,
    source: 'registry',
  };
}

// 从 JSON Schema 提取端口定义
function extractPorts(schema: any | null, prefix: string): PortDef[] {
  if (!schema?.properties) return [];
  return Object.entries(schema.properties).map(([name, prop]: [string, any]) => ({
    name: `${prefix}_${name}`,
    label: prop.title || name,
    type: prop.type || 'any',
    required: schema.required?.includes(name) || false,
    description: prop.description,
  }));
}

// 从 JSON Schema 提取参数定义
function extractParams(schema: any | null): ParamDef[] {
  if (!schema?.properties) return [];
  return Object.entries(schema.properties).map(([key, prop]: [string, any]) => ({
    key,
    label: prop.title || key,
    labelZh: prop.title || key,    // 暂无 labelZh
    type: prop.enum ? 'select' : prop.type === 'string' ? 'string' 
        : prop.type === 'number' || prop.type === 'integer' ? 'number'
        : prop.type === 'boolean' ? 'boolean' : 'string',
    required: schema.required?.includes(key) || false,
    default: prop.default,
    options: prop.enum?.map((v: string) => ({ value: v, label: v })),
    placeholder: prop.description,
    description: prop.description,
  }));
}
```

### 2.3 Registry 结构草案（manifest 扩展）

在 manifest.json 中新增 `composer` 字段，用于存放编排器特有配置：

```json
{
  "plugin_id": "dataset-viewer",
  "name": "Dataset Viewer",
  "composer": {
    "labelZh": "数据集查看器",
    "descriptionZh": "数据集预览插件，返回数据集摘要和样本记录",
    "params": [
      {
        "key": "dataset_id",
        "label": "Dataset ID",
        "labelZh": "数据集 ID",
        "type": "string",
        "required": true,
        "placeholder": "e.g. coco-2017"
      },
      {
        "key": "sample_count",
        "label": "Sample Count",
        "labelZh": "样本数量",
        "type": "number",
        "required": false,
        "default": 10,
        "description": "返回的样本记录数"
      }
    ],
    "ports": {
      "inputs": [
        { "name": "query", "label": "Query", "type": "string", "required": false }
      ],
      "outputs": [
        { "name": "dataset", "label": "Dataset", "type": "dataset", "required": true }
      ]
    },
    "executorType": "dataset_loader"
  }
}
```

**设计原则**:
- `composer` 是可选字段，缺省时从 `input_schema`/`output_schema` 自动推导
- `composer.params` 优先级高于 `input_schema` 推导
- `composer.ports` 优先级高于 schema 提取
- 向后兼容：旧插件无 `composer` 字段，自动推导仍然可用

### 2.4 API 扩展草案

```typescript
// /api/plugins/catalog 返回新增字段
{
  // ... 现有字段 ...
  
  // 新增
  documentation_url: string | null;
  composer?: {
    labelZh?: string;
    descriptionZh?: string;
    params?: ParamDef[];
    ports?: { inputs: PortDef[]; outputs: PortDef[] };
    executorType?: string;
  };
}
```

### 2.5 前端集成点变更

| 文件 | 现在 | MVP 目标 |
|------|------|----------|
| `workflowSchema.ts` NODE_REGISTRY | 7 个硬编码节点 | registry 节点 + hardcoded fallback 合并 |
| `workflowSchema.ts` NodeType | 8 个固定字符串 | `string`（动态，不再枚举） |
| `NodeTypes.ts` NODE_TYPE_CONFIGS | 7 个硬编码 | 同上，动态生成 |
| `NodePalette.tsx` | 读 NODE_REGISTRY | 读合并后的 registry |
| `ContextMenu.tsx` | 读 NODE_TYPE_CONFIGS | 读合并后的 registry |
| `NodeSearchModal.tsx` | 读 NODE_TYPE_CONFIGS | 读合并后的 registry |
| `NodeParamPanel.tsx` | 读 NODE_REGISTRY | 读合并后的 registry |
| `ConnectionValidator.tsx` | 读 NODE_TYPE_CONFIGS | 读合并后的 registry |

**合并策略**:
```typescript
// registry 节点优先，hardcoded 兜底
const mergedRegistry = {
  ...HARDCODED_NODE_REGISTRY,      // fallback
  ...registryNodesFromCatalog,     // 覆盖（plugin_id 作为 key）
};
```

---

## 三、缺失字段处理策略

| 缺失字段 | 处理策略 | 优先级 |
|----------|----------|--------|
| nameZh | 暂回退到 name，manifest 新增 composer.labelZh | P1 |
| descriptionZh | 暂回退到 description | P2 |
| params (ParamDef[]) | 优先读 composer.params，fallback 从 input_schema 推导，再 fallback 到空数组 | P0 |
| ports (PortDef[]) | 优先读 composer.ports，fallback 从 schema 提取 | P0 |
| frozenHint | 从 status/execution_mode 推导，manifest 可选覆盖 | P1 |
| executorType | 可选，暂不影响 MVP | P2 |
| showIn* | 统一默认 true，暂不需要 | P3 |

---

## 四、风险评估

| 风险 | 等级 | 缓解措施 |
|------|------|----------|
| NodeType 从枚举变 string 破坏类型安全 | 中 | 保留 NodeType 基础类型，扩展为 `string` |
| 从 input_schema 推导的 UI 表单不够丰富 | 中 | manifest 新增 `composer.params` 精确控制 |
| API 扩展破坏 PluginPool | 低 | catalog 端点独立于 pool 端点 |
| 动态节点列表导致连线校验变复杂 | 中 | ConnectionValidator 改为查 registry Map 而非 Record |
| 4 个内置插件只有 4 个节点 vs 硬编码 7 个 | 低 | hardcoded fallback 保留未覆盖的节点 |

---

## 五、MVP 里程碑

### Phase A: Adapter 基础（不落地）
1. ✅ 预检完成（本轮）
2. ✅ 字段映射完成（本轮）
3. ✅ MVP 设计冻结（本轮）
4. ⬜ Adapter 代码草案（仅 types + 转换函数）

### Phase B: API 扩展（不落地）
1. ⬜ /api/plugins/catalog 返回 documentation_url
2. ⬜ /api/plugins/catalog 返回 composer 字段（可选）
3. ⬜ manifest.json composer 字段规范

### Phase C: 前端集成（落地，最小改动）
1. ⬜ CapabilityAdapter 实现
2. ⬜ WorkflowComposer 启动时 fetch /api/plugins/catalog
3. ⬜ registry + hardcoded 合并为统一数据源
4. ⬜ NodeType 类型扩展
5. ⬜ 冒烟验证

### Phase D: Manifest 补全（后续）
1. ⬜ 4 个 builtin 插件添加 composer 字段
2. ⬜ 创建缺少的 5 个 builtin 插件（可选，或保留 hardcoded）
3. ⬜ 新插件注册自动进编排器

---

## 六、结论

**核心发现**: Plugin Manifest 体系已足够成熟，只需：
1. 新增可选 `composer` 字段（params/ports/labelZh）
2. API 扩展返回该字段
3. 前端 Adapter 做转换 + hardcoded fallback
4. **不需要创建统一 registry 表/服务**

**风险最低路径**: 先让编排器从 `/api/plugins/catalog` 读取节点列表，用 Adapter 转换，hardcoded 节点作为 fallback。不改执行层，不改 PluginPool，不改 ModuleCenter。这是一条**单向读取**路径，任何失败都会 fallback 到现有行为。
