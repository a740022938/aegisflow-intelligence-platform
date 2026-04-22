// CapabilityAdapter.ts - Plugin registry adapter with param schema extraction
import type { NodeConfig, NodeType } from './workflowSchema';

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
  input_schema: JsonSchema | null;
  output_schema: JsonSchema | null;
  tags: string[];
  documentation_url?: string | null;
}

interface CatalogResponse {
  ok: boolean;
  catalog: CatalogItem[];
  grouped: Record<string, CatalogItem[]>;
}

interface JsonSchema {
  type?: string;
  title?: string;
  description?: string;
  default?: unknown;
  enum?: unknown[];
  minimum?: number;
  maximum?: number;
  properties?: Record<string, JsonSchema>;
  required?: string[];
}

export interface ComposerNodeEntry {
  type: string;
  label: string;
  labelZh: string;
  category: 'input' | 'process' | 'output' | 'utility';
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  frozen: boolean;
  frozenHint?: string;
  source: 'registry' | 'hardcoded';
}

export interface ParamConfig {
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

const TYPE_COLORS: Record<string, { bg: string; border: string; glow: string }> = {
  dataset:   { bg: 'rgba(59,130,246,0.15)',    border: '#3B82F6',  glow: 'rgba(59,130,246,0.4)' },
  image:     { bg: 'rgba(139,92,246,0.15)',   border: '#8B5CF6',  glow: 'rgba(139,92,246,0.4)' },
  mask:      { bg: 'rgba(236,72,153,0.15)',   border: '#EC4899',  glow: 'rgba(236,72,153,0.4)' },
  detection: { bg: 'rgba(16,185,129,0.15)',   border: '#10B981',  glow: 'rgba(16,185,129,0.4)' },
  model:     { bg: 'rgba(245,158,11,0.15)',  border: '#F59E0B',  glow: 'rgba(245,158,11,0.4)' },
  report:    { bg: 'rgba(99,102,241,0.15)',  border: '#6366F1',  glow: 'rgba(99,102,241,0.4)' },
  archive:   { bg: 'rgba(107,114,128,0.15)', border: '#6B7280',  glow: 'rgba(107,114,128,0.4)' },
  any:       { bg: 'rgba(255,255,255,0.08)',border: '#9CA3AF',  glow: 'rgba(255,255,255,0.2)' },
};

function getTypeColor(type: string) {
  return TYPE_COLORS[type] || TYPE_COLORS.any;
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  if (clean.length < 6) return 'rgba(107,114,128,0.15)';
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return 'rgba(107,114,128,0.15)';
  return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}

function inferComposerCategory(catalogCategory: string | undefined): ComposerNodeEntry['category'] {
  if (!catalogCategory) return 'process';
  const domain = catalogCategory.split('/')[0] || '';
  const mapping: Record<string, ComposerNodeEntry['category']> = {
    data: 'input', dataset: 'input',
    vision: 'process', image: 'process', audio: 'process',
    video: 'process', text: 'process', model: 'process',
    report: 'output', export: 'output', archive: 'output', storage: 'output',
    system: 'utility', tool: 'utility', utils: 'utility',
  };
  return mapping[domain] || 'process';
}

function inferCategoryFromHardcoded(type: NodeType): ComposerNodeEntry['category'] {
  const map: Record<string, ComposerNodeEntry['category']> = {
    'dataset-loader': 'input',
    'yolo-detect': 'process',
    'sam-segment': 'process',
    'classifier-verify': 'process',
    tracker: 'process',
    'eval-report': 'output',
    'output-archive': 'output',
    reroute: 'utility',
  };
  return map[type] || 'process';
}

// JSON Schema to ParamConfig[]
export function extractParamsFromSchema(schema: JsonSchema | null): ParamConfig[] {
  if (!schema || schema.type !== 'object' || !schema.properties) return [];
  const requiredSet = new Set(schema.required || []);
  const params: ParamConfig[] = [];
  for (const [key, prop] of Object.entries(schema.properties)) {
    const param = schemaPropertyToParam(key, prop, requiredSet.has(key));
    if (param) params.push(param);
  }
  return params;
}

function schemaPropertyToParam(key: string, prop: JsonSchema, required: boolean): ParamConfig | null {
  const type = prop.type || 'string';
  const label = prop.title || key;

  if (type === 'boolean') {
    return {
      key, label, labelZh: label,
      type: 'boolean',
      required,
      default: prop.default ?? false,
      description: prop.description,
    };
  }

  if (prop.enum && Array.isArray(prop.enum)) {
    return {
      key, label, labelZh: label,
      type: 'select',
      required,
      default: prop.default ?? prop.enum[0],
      options: prop.enum.map((v) => ({ value: String(v), label: String(v) })),
      description: prop.description,
    };
  }

  if (type === 'string') {
    return {
      key, label, labelZh: label,
      type: 'string',
      required,
      default: prop.default ?? '',
      placeholder: prop.description,
      description: prop.description,
    };
  }

  if (type === 'number' || type === 'integer') {
    return {
      key, label, labelZh: label,
      type: 'number',
      required,
      default: prop.default ?? '',
      description: prop.description,
    };
  }

  return null;
}

// Catalog map for sync access
let _catalogMap: Map<string, CatalogItem> = new Map();
let _catalogLoaded = false;
let _catalogLoadPromise: Promise<void> | null = null;

export function ensureCatalogLoaded(): Promise<void> {
  if (_catalogLoaded) return Promise.resolve();
  if (_catalogLoadPromise) return _catalogLoadPromise;
  _catalogLoadPromise = fetch('/api/plugins/catalog', { signal: AbortSignal.timeout(8000) })
    .then((r) => r.json())
    .then((data: CatalogResponse) => {
      if (data.catalog) {
        for (const item of data.catalog) {
          _catalogMap.set('plugin:' + item.plugin_id, item);
        }
        _catalogLoaded = true;
        console.info('[CapabilityAdapter] catalog map loaded: ' + data.catalog.length + ' items');
      }
    })
    .catch((err) => {
      console.warn('[CapabilityAdapter] catalog map load failed: ' + (err instanceof Error ? err.message : String(err)));
    });
  return _catalogLoadPromise;
}

export function getCatalogItem(nodeType: string): CatalogItem | undefined {
  if (!nodeType.startsWith('plugin:')) return undefined;
  return _catalogMap.get(nodeType);
}

export function getRegistryParams(nodeType: string): ParamConfig[] | undefined {
  const item = getCatalogItem(nodeType);
  if (!item) return undefined;
  const params = extractParamsFromSchema(item.input_schema);
  return params.length > 0 ? params : undefined;
}

// ComposerNodeEntry conversion
function isComposerEligible(item: CatalogItem): boolean {
  return (
    item.enabled === true &&
    (item.status === 'active' || item.status === 'gated') &&
    !!item.ui_node_type &&
    item.execution_mode !== 'resource_intensive'
  );
}

function catalogToComposerNode(item: CatalogItem): ComposerNodeEntry {
  const color = item.color || '#6B7280';
  const tc = getTypeColor(color.replace('#', '').toLowerCase());
  const frozen = false;
  const frozenHint = !item.dry_run_supported
    ? '当前插件仅支持校验模式'
    : item.status === 'frozen'
    ? '当前插件暂不可执行'
    : undefined;
  return {
    type: 'plugin:' + item.plugin_id,
    label: item.name,
    labelZh: item.name,
    category: inferComposerCategory(item.category),
    description: item.description || '',
    icon: item.icon || '🔌',
    color,
    bgColor: item.color ? hexToRgba(color, 0.08) : tc.bg,
    borderColor: item.color || tc.border,
    glowColor: item.color ? hexToRgba(color, 0.4) : tc.glow,
    frozen,
    frozenHint,
    source: 'registry',
  };
}

// Registry loading with cache
export interface RegistryLoadResult {
  registryNodes: ComposerNodeEntry[];
  registryLoaded: boolean;
  registryError?: string;
  fellback: boolean;
}

let _registryCache: ComposerNodeEntry[] | null = null;
let _cacheTime = 0;
const CACHE_TTL = 30_000;

export async function loadRegistryNodes(): Promise<RegistryLoadResult> {
  const now = Date.now();
  if (_registryCache && now - _cacheTime < CACHE_TTL) {
    return { registryNodes: _registryCache, registryLoaded: true, fellback: false };
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const resp = await fetch('/api/plugins/catalog', { signal: controller.signal });
    clearTimeout(timeout);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const data: CatalogResponse = await resp.json();
    if (!data.ok) throw new Error('catalog response not ok');
    const nodes = data.catalog.filter(isComposerEligible).map(catalogToComposerNode);
    _registryCache = nodes;
    _cacheTime = now;
    console.info('[CapabilityAdapter] registry loaded: ' + nodes.length + ' nodes from ' + data.catalog.length + ' plugins');
    return { registryNodes: nodes, registryLoaded: true, fellback: false };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[CapabilityAdapter] registry load failed: ' + msg + '. Using hardcoded fallback.');
    return { registryNodes: [], registryLoaded: false, registryError: msg, fellback: true };
  }
}

export function clearRegistryCache() { _registryCache = null; _cacheTime = 0; }

export interface MergedNodeResult extends RegistryLoadResult {
  allNodes: ComposerNodeEntry[];
  hardcodedCount: number;
  registryCount: number;
  byCategory: Record<ComposerNodeEntry['category'], ComposerNodeEntry[]>;
}

function groupByCategory(nodes: ComposerNodeEntry[]): Record<ComposerNodeEntry['category'], ComposerNodeEntry[]> {
  const cats: Record<ComposerNodeEntry['category'], ComposerNodeEntry[]> = { input: [], process: [], output: [], utility: [] };
  for (const n of nodes) { if (cats[n.category]) cats[n.category].push(n); }
  return cats;
}

export async function getMergedNodes(hardcoded: ComposerNodeEntry[]): Promise<MergedNodeResult> {
  const regResult = await loadRegistryNodes();
  if (regResult.registryLoaded) {
    const merged = [...hardcoded];
    for (const regNode of regResult.registryNodes) {
      const idx = merged.findIndex((n) => n.type === regNode.type);
      if (idx >= 0) merged[idx] = regNode;
      else merged.push(regNode);
    }
    const byCategory = groupByCategory(merged);
    return { ...regResult, allNodes: merged, hardcodedCount: hardcoded.length, registryCount: regResult.registryNodes.length, byCategory };
  } else {
    const byCategory = groupByCategory(hardcoded);
    console.info('[CapabilityAdapter] fellback to ' + hardcoded.length + ' hardcoded nodes');
    return { ...regResult, allNodes: hardcoded, hardcodedCount: hardcoded.length, registryCount: 0, byCategory };
  }
}

export function hardcodedNodeToComposerEntry(config: NodeConfig, type: NodeType): ComposerNodeEntry {
  return {
    type,
    label: config.label,
    labelZh: config.labelZh,
    category: inferCategoryFromHardcoded(type),
    description: config.description,
    icon: config.icon,
    color: config.color,
    bgColor: config.bgColor,
    borderColor: config.color,
    glowColor: hexToRgba(config.color, 0.4),
    frozen: false,
    frozenHint: config.frozenHint,
    source: 'hardcoded',
  };
}
