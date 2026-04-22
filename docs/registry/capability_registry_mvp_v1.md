# 能力注册自动化 MVP v1 — 节点入口自动接入设计

## 概述

本文档记录能力注册自动化 MVP v1 的设计决策与实现细节。

## 目标

打通"插件注册后自动出现在编排器入口层"这条最小链路：

```
manifest.json
    ↓
PluginLoader → PluginManager（后端内存）
    ↓
GET /api/plugins/catalog
    ↓
CapabilityAdapter（前端）
    ↓
NodePalette / ContextMenu / NodeSearchModal
```

## 核心设计决策

### 决策 1: 新建 CapabilityAdapter 而非修改现有数据流

**选择**: 新建 `CapabilityAdapter.ts`，作为独立适配层

**理由**:
- 不修改 `workflowSchema.ts` 的 `NODE_REGISTRY`（保持原有硬编码节点不变）
- 不修改 `NodeTypes.ts` 的 `NODE_TYPE_CONFIGS`
- 不修改后端 PluginManager
- 新层透明，失败时自动 fallback

### 决策 2: registry 节点 type 前缀 `plugin:`

**选择**: registry 节点 type 格式为 `plugin:{plugin_id}`

**理由**:
- 与 hardcoded 节点 type 完全隔离（hardcoded 节点无此前缀）
- 不会发生冲突或覆盖
- Workflow 中实际使用时的 type 与 catalog 一致

**代价**: 旧 workflow 中硬编码的 type 不会变成 registry 节点（不可逆）

### 决策 3: 30s 内存缓存

**选择**: `_registryCache`，TTL = 30000ms

**理由**:
- 避免每次打开面板都请求后端
- TTL 足够短（30s），用户刷新页面即可更新
- 比不缓存（每次请求）好，比 Redux 全局状态轻量

### 决策 4: 5s 请求超时

**选择**: `AbortSignal.timeout(5000)`

**理由**:
- 网络慢时不阻塞 UI
- 超时后 fallback 到 hardcoded，不影响用户体验

## CapabilityAdapter API

```typescript
// 加载 registry（内部缓存）
loadRegistryNodes(): Promise<RegistryLoadResult>

// 清除缓存
clearRegistryCache(): void

// 获取合并后的完整节点列表（推荐）
getMergedNodes(hardcoded: ComposerNodeEntry[]): Promise<MergedNodeResult>

// 将硬编码节点转为统一格式
hardcodedNodeToComposerEntry(config, type): ComposerNodeEntry
```

## ComposerNodeEntry 格式

```typescript
interface ComposerNodeEntry {
  type: string;          // 'plugin:{id}' 或 'dataset-loader' 等
  label: string;          // 英文名
  labelZh: string;        // 中文名（暂无则用 label）
  category: 'input' | 'process' | 'output' | 'utility';
  description: string;
  icon: string;          // emoji
  color: string;          // hex
  bgColor: string;        // 半透明 rgba
  borderColor: string;
  glowColor: string;
  frozen: boolean;
  frozenHint?: string;
  source: 'registry' | 'hardcoded';
}
```

## Catalog → ComposerNodeEntry 转换规则

| Catalog 字段 | ComposerNodeEntry 字段 | 说明 |
|-------------|---------------------|------|
| plugin_id | type（加 `plugin:` 前缀）| 唯一标识 |
| name | label + labelZh | 暂无 nameZh，fallback |
| category | category | 按 domain 映射 |
| icon | icon | 无则 `🔌` |
| color | color/bgColor/borderColor/glowColor | 从 color 推导 |
| description | description | 直接映射 |
| status=frozen | frozen=true, frozenHint="插件已冻结" | |
| dry_run_supported=false | frozen=true, frozenHint="仅支持 dry-run" | |
| — | source='registry' | 标记来源 |

## 去重与合并策略

```typescript
// 合并逻辑（getMergedNodes）
1. 先获取 registry 节点列表
2. 若失败 → 完全使用 hardcoded
3. 若成功 → hardcoded 基础上：
   - registry 节点按 type 去重（理论上不会冲突）
   - 新增 hardcoded 中没有的 registry 节点
```

## 日志约定

| 场景 | console 级别 | 格式 |
|------|-------------|------|
| registry 加载成功 | info | `[CapabilityAdapter] registry loaded: N nodes from M plugins` |
| registry 加载失败 | warn | `[CapabilityAdapter] registry load failed: {err}. Using hardcoded fallback.` |
| fallback 到 hardcoded | info | `[CapabilityAdapter] fellback to N hardcoded nodes` |

## 消费者接入方式

### NodePalette

```typescript
useEffect(() => {
  getMergedNodes(HARDCODED_ENTRIES).then(result => {
    setNodes(result.allNodes);
    setSource(result.registryLoaded ? 'registry' : 'hardcoded');
  });
}, []);
```

### ContextMenu / NodeSearchModal

```typescript
// 同样使用 getMergedNodes
// 底部来源提示显示 source 状态
```

## 未完成项（不在本轮范围）

1. **NodeParamPanel 参数自动表单** — 依赖 params schema 字段
2. **ConnectionValidator 动态化** — 依赖 ports schema 字段
3. **PluginPool 双向同步** — PluginPool 修改状态后自动反映到 catalog
4. **新增插件热更新** — 30s TTL 外的手动刷新机制

## 扩展路径

### 下一步: NodeParamPanel 自动表单

```typescript
// 从 catalog item 提取 params
function extractParams(item: CatalogItem): ParamConfig[] {
  const schema = item.input_schema;
  if (!schema?.properties) return [];
  return Object.entries(schema.properties).map(([key, prop]) => ({
    key,
    label: prop.title || key,
    labelZh: prop.title || key,  // TODO: 后续支持 nameZh
    type: prop.enum ? 'select' : (prop.type === 'boolean' ? 'boolean' : 'string'),
    default: prop.default,
    options: prop.enum?.map(v => ({ value: v, label: v })),
    required: schema.required?.includes(key),
    description: prop.description,
  }));
}
```
