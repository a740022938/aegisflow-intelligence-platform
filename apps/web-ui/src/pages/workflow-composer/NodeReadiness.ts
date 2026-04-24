// ============================================================
// NodeReadiness.ts — 节点就绪状态计算
// ComfyUI化升级 v1: F4 缺参数/缺输入即时提示
// ============================================================

import type { Node, Edge } from '@xyflow/react';
import { NODE_REGISTRY, isLayoutOnlyNodeType } from './workflowSchema';
import type { NodeType } from './workflowSchema';
import { NODE_TYPE_CONFIGS, isDataTypeCompatible } from './NodeTypes';

export type NodeReadinessState =
  | 'ready'          // 所有必填参数已填，所有输入端口已连接
  | 'missing_input'  // 有必填输入端口未连接
  | 'missing_param'  // 有必填参数未填
  | 'invalid_link'   // 连接的端口类型不兼容
  | 'idle';         // 节点未被验证（初始状态）

export interface NodeReadinessResult {
  state: NodeReadinessState;
  missingInputs: string[];   // 未连接的必填输入端口
  missingParams: string[];    // 未填的必填参数
  invalidLinks: Array<{ edgeId: string; sourcePort: string; targetPort: string; reason: string }>;
}

/** 获取节点所有可用的输出端口类型（通过连接的边） */
function getConnectedOutputTypes(
  nodeId: string,
  edges: Edge[]
): Map<string, string> {
  const portTypes = new Map<string, string>();
  for (const edge of edges) {
    if (edge.target === nodeId && edge.targetHandle) {
      // targetHandle 格式为 "in_{portName}"，提取 portName
      const portName = edge.targetHandle.replace(/^in_/, '');
      portTypes.set(portName, edge.sourceHandle?.replace(/^out_/, '') || 'any');
    }
  }
  return portTypes;
}

/** 获取节点连接的源节点输出类型 */
function getConnectedSourceOutputType(
  nodeId: string,
  edges: Edge[]
): { portName: string; sourceOutputType: string } | null {
  for (const edge of edges) {
    if (edge.target === nodeId) {
      const portName = edge.targetHandle?.replace(/^in_/, '') || '';
      const sourceOutputType = edge.sourceHandle?.replace(/^out_/, '') || 'any';
      return { portName, sourceOutputType };
    }
  }
  return null;
}

/**
 * 计算单个节点的就绪状态
 */
export function computeNodeReadiness(
  node: Node,
  nodes: Node[],
  edges: Edge[]
): NodeReadinessResult {
  const nodeType = (node.data?.nodeType || node.type) as NodeType;
  if (isLayoutOnlyNodeType(nodeType)) {
    return {
      state: 'idle',
      missingInputs: [],
      missingParams: [],
      invalidLinks: [],
    };
  }
  const config = NODE_REGISTRY[nodeType];

  if (!config) {
    return {
      state: 'idle',
      missingInputs: [],
      missingParams: [],
      invalidLinks: [],
    };
  }

  const params = (node.data?.params || {}) as Record<string, unknown>;

  // ── 1. 检查必填参数 ──────────────────────────────────────────────
  const missingParams: string[] = [];
  for (const p of config.params) {
    if (p.required) {
      const value = params[p.key];
      if (value === undefined || value === null || value === '' || String(value).trim() === '') {
        missingParams.push(p.key);
      }
    }
  }

  // ── 2. 检查输入端口连接 ───────────────────────────────────────────
  const missingInputs: string[] = [];
  const inputPorts = NODE_TYPE_CONFIGS[nodeType]?.inputs || [];

  for (const port of inputPorts) {
    if (port.required) {
      // 检查是否有边连接到该端口
      const hasConnection = edges.some(
        e => e.target === node.id && e.targetHandle === `in_${port.name}`
      );
      if (!hasConnection) {
        missingInputs.push(port.name);
      }
    }
  }

  // ── 3. 检查连线类型兼容性 ─────────────────────────────────────────
  const invalidLinks: NodeReadinessResult['invalidLinks'] = [];
  for (const edge of edges) {
    if (edge.target === node.id && edge.targetHandle && edge.sourceHandle) {
      const targetPortName = edge.targetHandle.replace(/^in_/, '');
      const sourcePortName = edge.sourceHandle.replace(/^out_/, '');

      // 获取目标节点该输入端口的期望类型
      const targetPort = inputPorts.find(p => p.name === targetPortName);
      if (!targetPort) continue;

      // 获取源节点该输出端口的实际类型
      const sourceNode = nodes.find(n => n.id === edge.source);
      const sourceNodeType = (sourceNode?.data?.nodeType || sourceNode?.type) as NodeType;
      const sourcePort = NODE_TYPE_CONFIGS[sourceNodeType]?.outputs.find(p => p.name === sourcePortName);

      if (targetPort && sourcePort) {
        if (!isDataTypeCompatible(sourcePort.type, targetPort.type)) {
          invalidLinks.push({
            edgeId: edge.id,
            sourcePort: sourcePortName,
            targetPort: targetPortName,
            reason: `类型不兼容: ${sourcePort.type} → ${targetPort.type}`,
          });
        }
      }
    }
  }

  // ── 4. 综合判断状态 ───────────────────────────────────────────────
  if (invalidLinks.length > 0) {
    return { state: 'invalid_link', missingInputs, missingParams, invalidLinks };
  }
  if (missingInputs.length > 0) {
    return { state: 'missing_input', missingInputs, missingParams, invalidLinks: [] };
  }
  if (missingParams.length > 0) {
    return { state: 'missing_param', missingInputs: [], missingParams, invalidLinks: [] };
  }
  return { state: 'ready', missingInputs: [], missingParams: [], invalidLinks: [] };
}

/**
 * 计算所有节点就绪状态
 */
export function computeAllNodesReadiness(
  nodes: Node[],
  edges: Edge[]
): Map<string, NodeReadinessResult> {
  const results = new Map<string, NodeReadinessResult>();
  for (const node of nodes) {
    results.set(node.id, computeNodeReadiness(node, nodes, edges));
  }
  return results;
}

/**
 * 获取状态徽章信息
 */
export function getReadinessBadge(state: NodeReadinessState): {
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
} {
  switch (state) {
    case 'ready':
      return { label: '就绪', shortLabel: '✓', color: '#86efac', bgColor: 'rgba(34,197,94,0.15)', borderColor: 'rgba(34,197,94,0.5)' };
    case 'idle':
      return { label: '空闲', shortLabel: '○', color: '#9CA3AF', bgColor: 'rgba(100,116,139,0.15)', borderColor: 'rgba(100,116,139,0.4)' };
    case 'missing_input':
      return { label: '缺输入', shortLabel: '?', color: '#fcd34d', bgColor: 'rgba(245,158,11,0.15)', borderColor: 'rgba(245,158,11,0.5)' };
    case 'missing_param':
      return { label: '缺参数', shortLabel: '!', color: '#fb923c', bgColor: 'rgba(249,115,22,0.15)', borderColor: 'rgba(249,115,22,0.5)' };
    case 'invalid_link':
      return { label: '连线错误', shortLabel: '✗', color: '#fca5a5', bgColor: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.5)' };
  }
}

/**
 * 获取缺失输入端口的详细描述
 */
export function formatMissingInputs(missingInputs: string[]): string {
  if (missingInputs.length === 0) return '';
  const names = missingInputs.map(n => n.replace(/_/g, ' ')).join(', ');
  return `缺少输入: ${names}`;
}

/**
 * 获取缺失参数的详细描述
 */
export function formatMissingParams(missingParams: string[], nodeType: NodeType): string {
  if (missingParams.length === 0) return '';
  const config = NODE_REGISTRY[nodeType];
  if (!config) return `缺少参数: ${missingParams.join(', ')}`;

  const names = missingParams.map(key => {
    const param = config.params.find(p => p.key === key);
    return param?.labelZh || param?.label || key;
  });
  return `缺少参数: ${names.join(', ')}`;
}
