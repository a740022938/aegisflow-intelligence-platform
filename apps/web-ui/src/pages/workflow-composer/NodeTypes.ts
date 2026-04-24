// ============================================================
// NodeTypes.ts — 节点视觉与端口工具（单一注册表派生）
// ============================================================

import { NODE_REGISTRY, type NodeType } from './workflowSchema';

export interface NodeTypeConfig {
  type: NodeType;
  label: string;
  category: 'input' | 'process' | 'output' | 'utility';
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  inputs: PortConfig[];
  outputs: PortConfig[];
  collapsible: boolean;
  frozen?: boolean;
  frozenHint?: string;
}

export interface PortConfig {
  name: string;
  label: string;
  type: string;
  required: boolean;
  description?: string;
}

// 类型配色系统 — ComfyUI 风格
export const TYPE_COLORS: Record<string, { bg: string; border: string; glow: string }> = {
  video: { bg: 'rgba(59, 130, 246, 0.15)', border: '#3B82F6', glow: 'rgba(59, 130, 246, 0.4)' },
  image_batch: { bg: 'rgba(14, 165, 233, 0.15)', border: '#0EA5E9', glow: 'rgba(14, 165, 233, 0.4)' },
  dataset: { bg: 'rgba(59, 130, 246, 0.15)', border: '#3B82F6', glow: 'rgba(59, 130, 246, 0.4)' },
  labels: { bg: 'rgba(168, 85, 247, 0.15)', border: '#A855F7', glow: 'rgba(168, 85, 247, 0.4)' },
  annotations: { bg: 'rgba(217, 70, 239, 0.15)', border: '#D946EF', glow: 'rgba(217, 70, 239, 0.4)' },
  split_manifest: { bg: 'rgba(99, 102, 241, 0.15)', border: '#6366F1', glow: 'rgba(99, 102, 241, 0.4)' },
  train_config: { bg: 'rgba(245, 158, 11, 0.15)', border: '#F59E0B', glow: 'rgba(245, 158, 11, 0.4)' },
  checkpoint: { bg: 'rgba(251, 146, 60, 0.15)', border: '#FB923C', glow: 'rgba(251, 146, 60, 0.4)' },
  metrics: { bg: 'rgba(16, 185, 129, 0.15)', border: '#10B981', glow: 'rgba(16, 185, 129, 0.4)' },
  badcases: { bg: 'rgba(220, 38, 38, 0.15)', border: '#DC2626', glow: 'rgba(220, 38, 38, 0.4)' },
  artifact: { bg: 'rgba(249, 115, 22, 0.15)', border: '#F97316', glow: 'rgba(249, 115, 22, 0.4)' },
  image: { bg: 'rgba(139, 92, 246, 0.15)', border: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.4)' },
  mask: { bg: 'rgba(236, 72, 153, 0.15)', border: '#EC4899', glow: 'rgba(236, 72, 153, 0.4)' },
  detection: { bg: 'rgba(16, 185, 129, 0.15)', border: '#10B981', glow: 'rgba(16, 185, 129, 0.4)' },
  model: { bg: 'rgba(245, 158, 11, 0.15)', border: '#F59E0B', glow: 'rgba(245, 158, 11, 0.4)' },
  report: { bg: 'rgba(99, 102, 241, 0.15)', border: '#6366F1', glow: 'rgba(99, 102, 241, 0.4)' },
  archive: { bg: 'rgba(107, 114, 128, 0.15)', border: '#6B7280', glow: 'rgba(107, 114, 128, 0.4)' },
  any: { bg: 'rgba(255, 255, 255, 0.08)', border: '#9CA3AF', glow: 'rgba(255, 255, 255, 0.2)' },
};

export const IMPLICIT_COMPAT: Record<string, string[]> = {
  dataset: ['image'],
  train_config: ['dataset'],
  model: ['dataset', 'report'],
  detection: ['image'],
  detections: ['image'],
  mask: ['image'],
  masks: ['image'],
  classifications: ['detections'],
};

const TYPE_ALIAS: Record<string, string> = {
  tracks: 'detection',
};

const categoryOf = (type: NodeType): NodeTypeConfig['category'] => {
  if (type === 'dataset-loader' || type === 'video-source') return 'input';
  if (type === 'output-archive' || type === 'eval-report' || type === 'archive-model') return 'output';
  if (type === 'reroute' || type === 'universal-node' || type === 'metadata-node' || type === 'workspace-group') return 'utility';
  return 'process';
};

const displayName = (portType: string) =>
  portType.replaceAll('_', ' ').replace(/\b\w/g, (m) => m.toUpperCase());

const normalizePortType = (portType: string) => TYPE_ALIAS[portType] || portType;

const toPortConfig = (portType: string, isInput: boolean): PortConfig => {
  const normalized = normalizePortType(portType);
  return {
    name: portType,
    label: displayName(portType),
    type: normalized,
    required: isInput && normalized !== 'any',
  };
};

export const NODE_TYPE_CONFIGS: Record<NodeType, NodeTypeConfig> = (
  Object.keys(NODE_REGISTRY) as NodeType[]
).reduce((acc, type) => {
  const reg = NODE_REGISTRY[type];
  const primaryType = normalizePortType(reg.outputs[0] || reg.inputs[0] || 'any');
  const colors = getTypeColor(primaryType);

  acc[type] = {
    type,
    label: reg.label,
    category: categoryOf(type),
    icon: reg.icon,
    color: reg.color,
    bgColor: colors.bg,
    borderColor: colors.border,
    glowColor: colors.glow,
    inputs: reg.inputs.map((p) => toPortConfig(p, true)),
    outputs: reg.outputs.map((p) => toPortConfig(p, false)),
    collapsible: type !== 'reroute',
    frozen: false,
    frozenHint: reg.frozenHint,
  };
  return acc;
}, {} as Record<NodeType, NodeTypeConfig>);

// 获取类型颜色
export function getTypeColor(type: string) {
  return TYPE_COLORS[normalizePortType(type)] || TYPE_COLORS.any;
}

// 获取节点配置
export function getNodeConfig(type: NodeType | string): NodeTypeConfig {
  const found = (NODE_TYPE_CONFIGS as Record<string, NodeTypeConfig>)[type];
  if (found) return found;
  return {
    type: 'reroute',
    label: String(type || 'Unknown Node'),
    category: 'utility',
    icon: '🧩',
    color: '#9CA3AF',
    bgColor: TYPE_COLORS.any.bg,
    borderColor: TYPE_COLORS.any.border,
    glowColor: TYPE_COLORS.any.glow,
    inputs: [{ name: 'input', label: 'Input', type: 'any', required: false, description: '动态节点输入' }],
    outputs: [{ name: 'output', label: 'Output', type: 'any', required: false, description: '动态节点输出' }],
    collapsible: true,
    frozen: false,
    frozenHint: '未知节点类型（兼容模式）',
  };
}

export function isDataTypeCompatible(outputType: string, inputType: string): boolean {
  const out = normalizePortType(outputType);
  const inp = normalizePortType(inputType);
  if (out === 'any' || inp === 'any') return true;
  if (out === inp) return true;
  return (IMPLICIT_COMPAT[out] || []).includes(inp);
}

export function resolveOutputPort(nodeType: NodeType, sourceHandle?: string | null): PortConfig | undefined {
  const config = NODE_TYPE_CONFIGS[nodeType];
  if (!config) return undefined;
  if (sourceHandle) {
    const byHandle = config.outputs.find((o) => `out_${o.name}` === sourceHandle);
    if (byHandle) return byHandle;
  }
  return config.outputs[0];
}

export function resolveInputPort(nodeType: NodeType, targetHandle?: string | null): PortConfig | undefined {
  const config = NODE_TYPE_CONFIGS[nodeType];
  if (!config) return undefined;
  if (targetHandle) {
    const byHandle = config.inputs.find((i) => `in_${i.name}` === targetHandle);
    if (byHandle) return byHandle;
  }
  return config.inputs[0];
}
