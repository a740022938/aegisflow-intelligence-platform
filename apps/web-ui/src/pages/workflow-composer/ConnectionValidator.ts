// ============================================================
// ConnectionValidator.ts — 连线交互校验
// Phase 2A: 端口类型兼容 + 循环检测 + 非法连接提示
// ============================================================

import type { Node, Edge } from '@xyflow/react';
import { NODE_TYPE_CONFIGS, isDataTypeCompatible, resolveInputPort, resolveOutputPort } from './NodeTypes';
import type { NodeType } from './workflowSchema';

export interface ConnectionCheckResult {
  valid: boolean;
  reason?: string;
  severity: 'error' | 'warning';
}

/**
 * 检查两个端口是否类型兼容
 */
export function isPortCompatible(
  sourceNodeType: NodeType,
  sourceHandle: string | null,
  targetNodeType: NodeType,
  targetHandle: string | null
): ConnectionCheckResult {
  if (!NODE_TYPE_CONFIGS[sourceNodeType] || !NODE_TYPE_CONFIGS[targetNodeType]) {
    return { valid: false, reason: '未知的节点类型', severity: 'error' };
  }

  const srcPort = resolveOutputPort(sourceNodeType, sourceHandle);
  const tgtPort = resolveInputPort(targetNodeType, targetHandle);

  if (!srcPort || !tgtPort) {
    return { valid: false, reason: '端口不存在', severity: 'error' };
  }
  // 如果没有明确 handle，允许“任一输出端口 -> 任一输入端口”匹配，避免首端口误判
  if (!sourceHandle && !targetHandle) {
    const srcPorts = NODE_TYPE_CONFIGS[sourceNodeType]?.outputs || [];
    const tgtPorts = NODE_TYPE_CONFIGS[targetNodeType]?.inputs || [];
    const anyCompatible = srcPorts.some((s) => tgtPorts.some((t) => isDataTypeCompatible(s.type, t.type)));
    if (anyCompatible) return { valid: true, severity: 'warning' };
  }

  if (isDataTypeCompatible(srcPort.type, tgtPort.type)) return { valid: true, severity: 'warning' };

  return {
    valid: false,
    reason: `类型不兼容：${srcPort.type} → ${tgtPort.type}`,
    severity: 'error',
  };
}

/**
 * 检查连线是否会形成环
 */
export function wouldCreateCycle(
  nodes: Node[],
  edges: Edge[],
  sourceId: string,
  targetId: string
): boolean {
  const adj: Record<string, string[]> = {};
  for (const e of edges) {
    if (!adj[e.source]) adj[e.source] = [];
    adj[e.source].push(e.target);
  }
  // 加上待连的边
  if (!adj[sourceId]) adj[sourceId] = [];
  adj[sourceId].push(targetId);

  // 从 source 出发 BFS/DFS，看能否回到 source
  // 等效于：在加了 source→target 后的图中，从 target 出发能否到达 source
  const visited2 = new Set<string>();
  function dfs2(nodeId: string): boolean {
    if (nodeId === sourceId) return true;
    if (visited2.has(nodeId)) return false;
    visited2.add(nodeId);
    for (const next of adj[nodeId] || []) {
      if (dfs2(next)) return true;
    }
    return false;
  }

  return dfs2(targetId);
}

/**
 * 检查重复连线
 */
export function isDuplicateEdge(
  edges: Edge[],
  sourceId: string,
  targetId: string,
  sourceHandle: string | null,
  targetHandle: string | null
): boolean {
  return edges.some(
    e => e.source === sourceId && e.target === targetId &&
      e.sourceHandle === sourceHandle && e.targetHandle === targetHandle
  );
}

/**
 * 检查自连
 */
export function isSelfConnection(sourceId: string, targetId: string): boolean {
  return sourceId === targetId;
}

/**
 * 完整连线校验入口
 */
export function validateConnection(
  nodes: Node[],
  edges: Edge[],
  sourceId: string,
  targetId: string,
  sourceHandle: string | null,
  targetHandle: string | null
): ConnectionCheckResult {
  // 1. 自连
  if (isSelfConnection(sourceId, targetId)) {
    return { valid: false, reason: '不允许自连接', severity: 'error' };
  }

  // 2. 重复
  if (isDuplicateEdge(edges, sourceId, targetId, sourceHandle, targetHandle)) {
    return { valid: false, reason: '连线已存在', severity: 'error' };
  }

  // 3. 端口类型兼容
  const sourceNode = nodes.find(n => n.id === sourceId);
  const targetNode = nodes.find(n => n.id === targetId);
  if (!sourceNode || !targetNode) {
    return { valid: false, reason: '节点不存在', severity: 'error' };
  }

  const sourceNodeType = sourceNode.data?.nodeType as NodeType;
  const targetNodeType = targetNode.data?.nodeType as NodeType;

  const portResult = isPortCompatible(sourceNodeType, sourceHandle, targetNodeType, targetHandle);
  if (!portResult.valid) return portResult;

  // 4. 环检测
  if (wouldCreateCycle(nodes, edges, sourceId, targetId)) {
    return { valid: false, reason: '连线会形成循环依赖', severity: 'error' };
  }

  return { valid: true, severity: 'warning' };
}
