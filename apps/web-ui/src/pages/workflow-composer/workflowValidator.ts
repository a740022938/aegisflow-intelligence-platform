// ============================================================
// workflowValidator.ts — Workflow Composer 校验逻辑
// ============================================================
import type { ComposerNode, ComposerEdge, WorkflowDraft } from './workflowSchema';
import { NODE_REGISTRY } from './workflowSchema';
import { isDataTypeCompatible, resolveInputPort, resolveOutputPort } from './NodeTypes';

export interface ValidationResult {
  ok: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface ValidationError {
  type: 'error' | 'warning';
  code: string;
  message: string;
  nodeId?: string;
  edgeId?: string;
}

function buildDegreeMap(edges: ComposerEdge[]) {
  const inDegree: Record<string, number> = {};
  const outDegree: Record<string, number> = {};
  for (const edge of edges) {
    inDegree[edge.target] = (inDegree[edge.target] ?? 0) + 1;
    outDegree[edge.source] = (outDegree[edge.source] ?? 0) + 1;
  }
  return { inDegree, outDegree };
}

function hasCycle(nodes: ComposerNode[], edges: ComposerEdge[]): { hasCycle: boolean; cyclePath?: string[] } {
  const adj: Record<string, string[]> = {};
  for (const n of nodes) adj[n.id] = [];
  for (const e of edges) {
    if (adj[e.source]) adj[e.source].push(e.target);
  }

  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color: Record<string, number> = {};
  for (const n of nodes) color[n.id] = WHITE;
  const path: string[] = [];

  function dfs(u: string): boolean {
    color[u] = GRAY;
    path.push(u);
    for (const v of adj[u] ?? []) {
      if (color[v] === GRAY) { path.push(v); return true; }
      if (color[v] === WHITE) { if (dfs(v)) return true; }
    }
    path.pop();
    color[u] = BLACK;
    return false;
  }

  for (const n of nodes) {
    if (color[n.id] === WHITE && dfs(n.id)) {
      return { hasCycle: true, cyclePath: [...path] };
    }
  }
  return { hasCycle: false };
}

function canConnect(sourceNode: ComposerNode, targetNode: ComposerNode, edge: ComposerEdge): boolean {
  const sourceHandle = edge.sourceHandle || null;
  const targetHandle = edge.targetHandle || null;
  const srcPort = resolveOutputPort(sourceNode.type, sourceHandle);
  const tgtPort = resolveInputPort(targetNode.type, targetHandle);
  if (!srcPort || !tgtPort) return false;

  // 无端口句柄时，按“任一输出端口 -> 任一输入端口”判定，避免首端口误判
  if (!sourceHandle && !targetHandle) {
    const srcCfg = NODE_REGISTRY[sourceNode.type];
    const tgtCfg = NODE_REGISTRY[targetNode.type];
    if (srcCfg && tgtCfg) {
      const anyCompatible = srcCfg.outputs.some((so) =>
        tgtCfg.inputs.some((ti) => isDataTypeCompatible(so, ti))
      );
      if (anyCompatible) return true;
    }
  }

  return isDataTypeCompatible(srcPort.type, tgtPort.type);
}

export function validateWorkflow(draft: WorkflowDraft): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const { nodes, edges } = draft;

  if (nodes.length === 0) {
    errors.push({ type: 'error', code: 'EMPTY_CANVAS', message: '画布为空，请至少添加一个节点' });
    return { ok: false, errors, warnings };
  }

  const { inDegree, outDegree } = buildDegreeMap(edges);
  const hasDatasetLoader = nodes.some(n => n.type === 'dataset-loader');

  if (!hasDatasetLoader && edges.length === 0) {
    errors.push({ type: 'error', code: 'NO_START_NODE', message: '缺少起点，数据流必须从 Dataset Loader 开始' });
  }

  for (const node of nodes) {
    const inDeg = inDegree[node.id] ?? 0;
    const outDeg = outDegree[node.id] ?? 0;
    if (inDeg === 0 && outDeg === 0 && node.type !== 'dataset-loader') {
      warnings.push({ type: 'warning', code: 'ORPHAN_NODE', message: `节点 [${node.label}] 孤立，请连接数据流`, nodeId: node.id });
    }
  }

  for (const edge of edges) {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    if (!sourceNode || !targetNode) continue;
    if (!canConnect(sourceNode, targetNode, edge)) {
      errors.push({ type: 'error', code: 'INVALID_CONNECTION', message: `节点 [${sourceNode.label}] 不能连接到 [${targetNode.label}]（类型不兼容）`, edgeId: edge.id, nodeId: edge.target });
    }
  }

  const cycleResult = hasCycle(nodes, edges);
  if (cycleResult.hasCycle) {
    const pathLabel = (cycleResult.cyclePath ?? []).map(id => nodes.find(n => n.id === id)?.label ?? id).join(' → ');
    errors.push({ type: 'error', code: 'CYCLE_DETECTED', message: `检测到循环依赖，画布不支持环状结构：${pathLabel}` });
  }

  for (const node of nodes) {
    const config = NODE_REGISTRY[node.type];
    for (const param of config.params) {
      if (param.required) {
        const val = node.params[param.key];
        if (val === undefined || val === null || val === '') {
          errors.push({ type: 'error', code: 'MISSING_REQUIRED_PARAM', message: `节点 [${node.label}] 的参数 [${param.labelZh}] 为必填`, nodeId: node.id });
        }
      }
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}
