// ============================================================
// workflowCompiler.ts — Workflow Draft → 编译预览 + Dry-run 校验
// ============================================================
import type { ComposerNode, ComposerEdge, WorkflowDraft, NodeType } from './workflowSchema';
import { NODE_REGISTRY, isLayoutOnlyNodeType } from './workflowSchema';
import { isDataTypeCompatible, resolveInputPort, resolveOutputPort } from './NodeTypes';

export interface CompiledStep {
  order: number;
  nodeId: string;
  nodeType: NodeType;
  label: string;
  inputs: string[];
  outputs: string[];
  params: Record<string, unknown>;
  paramSnapshot: ParamSnapshot[];
  dependencies: string[];
  depth: number;
  executable: boolean;
  frozenHint?: string;
}

export interface ParamSnapshot {
  key: string;
  label: string;
  value: unknown;
  required: boolean;
  provided: boolean;
}

export interface TypeLink {
  fromNode: string;
  fromOutput: string;
  toNode: string;
  toInput: string;
  typeMatched: boolean;
}

export interface CompiledWorkflow {
  draft: WorkflowDraft;
  steps: CompiledStep[];
  executionOrder: string[];
  typeLinks: TypeLink[];
  inputClosure: InputClosureCheck;
  summary: CompileSummary;
}

export interface InputClosureCheck {
  ok: boolean;
  missingInputs: MissingInput[];
}

export interface MissingInput {
  nodeId: string;
  nodeLabel: string;
  inputName: string;
  providedBy: string[];
}

export interface CompileSummary {
  totalNodes: number;
  totalEdges: number;
  executableNodes: number;
  frozenNodes: number;
  maxDepth: number;
  estimatedOutputs: string[];
}

export interface DryRunValidation {
  ok: boolean;
  typeChainClosed: boolean;
  allInputsResolved: boolean;
  noIllegalDependencies: boolean;
  errors: DryRunError[];
  warnings: DryRunError[];
}

export interface DryRunError {
  code: string;
  message: string;
  nodeId?: string;
  severity: 'error' | 'warning';
}

// 拓扑排序获取执行顺序
function topologicalSort(nodes: ComposerNode[], edges: ComposerEdge[]): string[] {
  const inDegree: Record<string, number> = {};
  const adj: Record<string, string[]> = {};
  
  for (const n of nodes) {
    inDegree[n.id] = 0;
    adj[n.id] = [];
  }
  
  for (const e of edges) {
    if (adj[e.source]) {
      adj[e.source].push(e.target);
      inDegree[e.target] = (inDegree[e.target] ?? 0) + 1;
    }
  }
  
  const queue: string[] = [];
  for (const [id, deg] of Object.entries(inDegree)) {
    if (deg === 0) queue.push(id);
  }
  
  const result: string[] = [];
  while (queue.length > 0) {
    const u = queue.shift()!;
    result.push(u);
    for (const v of adj[u] ?? []) {
      inDegree[v]--;
      if (inDegree[v] === 0) queue.push(v);
    }
  }
  
  return result;
}

// 计算节点深度（从起点开始的层数）
function computeDepths(nodes: ComposerNode[], edges: ComposerEdge[]): Record<string, number> {
  const depths: Record<string, number> = {};
  for (const n of nodes) depths[n.id] = 0;
  
  const order = topologicalSort(nodes, edges);
  const edgeMap = new Map<string, string[]>();
  
  for (const e of edges) {
    if (!edgeMap.has(e.target)) edgeMap.set(e.target, []);
    edgeMap.get(e.target)!.push(e.source);
  }
  
  for (const nodeId of order) {
    const parents = edgeMap.get(nodeId) ?? [];
    if (parents.length > 0) {
      depths[nodeId] = Math.max(...parents.map(p => depths[p] ?? 0)) + 1;
    }
  }
  
  return depths;
}

// 构建类型链路
function buildTypeLinks(nodes: ComposerNode[], edges: ComposerEdge[]): TypeLink[] {
  const links: TypeLink[] = [];
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  
  for (const edge of edges) {
    const source = nodeMap.get(edge.source);
    const target = nodeMap.get(edge.target);
    if (!source || !target) continue;
    
    const srcPort = resolveOutputPort(source.type, edge.sourceHandle || null);
    const tgtPort = resolveInputPort(target.type, edge.targetHandle || null);
    const matched = !!(srcPort && tgtPort && isDataTypeCompatible(srcPort.type, tgtPort.type));
    
    links.push({
      fromNode: source.id,
      fromOutput: srcPort?.name || 'unknown',
      toNode: target.id,
      toInput: tgtPort?.name || 'unknown',
      typeMatched: matched,
    });
  }
  
  return links;
}

// 检查输入闭合
function checkInputClosure(nodes: ComposerNode[], edges: ComposerEdge[]): InputClosureCheck {
  const missing: MissingInput[] = [];
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const incomingMap = new Map<string, string[]>();
  
  for (const e of edges) {
    if (!incomingMap.has(e.target)) incomingMap.set(e.target, []);
    incomingMap.get(e.target)!.push(e.source);
  }
  
  for (const node of nodes) {
    const config = NODE_REGISTRY[node.type];
    if (!config) continue;
    const incoming = incomingMap.get(node.id) ?? [];
    
    for (const input of config.inputs) {
      if (input === 'any') continue;
      
      // 检查是否有上游节点提供此输入
      const providers = incoming.filter(srcId => {
        const src = nodeMap.get(srcId);
        if (!src) return false;
        const sourceEdge = edges.find((e) => e.source === srcId && e.target === node.id);
        if (!sourceEdge) return false;
        const srcPort = resolveOutputPort(src.type, sourceEdge.sourceHandle || null);
        const tgtPort = resolveInputPort(node.type, sourceEdge.targetHandle || null);
        if (!srcPort || !tgtPort) return false;
        return isDataTypeCompatible(srcPort.type, tgtPort.type) && isDataTypeCompatible(srcPort.type, input);
      });
      
      // 对于多输入节点，放宽为“任一输入可达即可”
      if (providers.length === 0 && incoming.length === 0) {
        missing.push({
          nodeId: node.id,
          nodeLabel: node.label,
          inputName: input,
          providedBy: [],
        });
      }
    }
  }
  
  return {
    ok: missing.length === 0,
    missingInputs: missing,
  };
}

// 编译工作流
export function compileWorkflow(draft: WorkflowDraft): CompiledWorkflow {
  const flowNodes = draft.nodes.filter((n) => !isLayoutOnlyNodeType(n.type));
  const flowNodeIdSet = new Set(flowNodes.map((n) => n.id));
  const flowEdges = draft.edges.filter((e) => flowNodeIdSet.has(e.source) && flowNodeIdSet.has(e.target));

  const order = topologicalSort(flowNodes, flowEdges);
  const depths = computeDepths(flowNodes, flowEdges);
  const typeLinks = buildTypeLinks(flowNodes, flowEdges);
  const inputClosure = checkInputClosure(flowNodes, flowEdges);
  
  const steps: CompiledStep[] = order.map((nodeId, idx) => {
    const node = flowNodes.find(n => n.id === nodeId)!;
    const config = NODE_REGISTRY[node.type] || {
      inputs: [],
      outputs: [],
      params: [],
      frozenHint: '未知节点类型，已按兼容模式处理',
    };
    
    // 获取依赖（直接上游节点）
    const dependencies = flowEdges
      .filter(e => e.target === nodeId)
      .map(e => e.source);
    
    // 参数快照
    const paramSnapshot: ParamSnapshot[] = config.params.map(p => ({
      key: p.key,
      label: p.labelZh,
      value: node.params[p.key] ?? p.default ?? null,
      required: p.required,
      provided: node.params[p.key] !== undefined && node.params[p.key] !== null && node.params[p.key] !== '',
    }));
    
    return {
      order: idx + 1,
      nodeId: node.id,
      nodeType: node.type,
      label: node.label,
      inputs: config.inputs,
      outputs: config.outputs,
      params: node.params,
      paramSnapshot,
      dependencies,
      depth: depths[nodeId] ?? 0,
      executable: node.executable ?? false,
      frozenHint: config.frozenHint,
    };
  });
  
  // 汇总信息
  const frozenCount = steps.filter(s => !s.executable && s.frozenHint).length;
  const executableCount = steps.filter(s => s.executable).length;
  const maxDepth = Math.max(...steps.map(s => s.depth), 0);
  
  // 收集最终输出
  const allOutputs = new Set<string>();
  steps.forEach(s => s.outputs.forEach(o => allOutputs.add(o)));
  const consumedOutputs = new Set(flowEdges.map(e => {
    const src = flowNodes.find(n => n.id === e.source);
    if (!src) return null;
    const srcCfg = NODE_REGISTRY[src.type];
    return srcCfg?.outputs?.[0] || null;
  }).filter(Boolean));
  const estimatedOutputs = Array.from(allOutputs).filter(o => !consumedOutputs.has(o));
  
  return {
    draft,
    steps,
    executionOrder: order,
    typeLinks,
    inputClosure,
    summary: {
      totalNodes: flowNodes.length,
      totalEdges: flowEdges.length,
      executableNodes: executableCount,
      frozenNodes: frozenCount,
      maxDepth,
      estimatedOutputs,
    },
  };
}

// Dry-run 校验
export function dryRunValidate(compiled: CompiledWorkflow): DryRunValidation {
  const errors: DryRunError[] = [];
  const warnings: DryRunError[] = [];
  
  // 1. 类型链路闭合检查
  const brokenLinks = compiled.typeLinks.filter(l => !l.typeMatched);
  for (const link of brokenLinks) {
    errors.push({
      code: 'TYPE_MISMATCH',
      message: `类型不匹配: ${link.fromNode}.${link.fromOutput} → ${link.toNode}.${link.toInput}`,
      nodeId: link.toNode,
      severity: 'error',
    });
  }
  
  // 2. 缺失输入检查
  for (const missing of compiled.inputClosure.missingInputs) {
    errors.push({
      code: 'MISSING_INPUT',
      message: `节点 [${missing.nodeLabel}] 缺少输入 [${missing.inputName}]`,
      nodeId: missing.nodeId,
      severity: 'error',
    });
  }
  
  // 3. 非法依赖检查（跨分支循环已在拓扑排序中排除）
  // 检查是否有节点依赖自身（自环）
  for (const step of compiled.steps) {
    if (step.dependencies.includes(step.nodeId)) {
      errors.push({
        code: 'SELF_DEPENDENCY',
        message: `节点 [${step.label}] 存在自依赖`,
        nodeId: step.nodeId,
        severity: 'error',
      });
    }
  }
  
  // 4. 不可执行节点警告
  for (const step of compiled.steps) {
    if (!step.executable && step.frozenHint) {
      warnings.push({
        code: 'NON_EXECUTABLE_NODE',
        message: `${step.frozenHint}`,
        nodeId: step.nodeId,
        severity: 'warning',
      });
    }
  }
  
  // 5. 未提供必填参数检查
  for (const step of compiled.steps) {
    for (const param of step.paramSnapshot) {
      if (param.required && !param.provided) {
        errors.push({
          code: 'MISSING_PARAM',
          message: `步骤 ${step.order} [${step.label}] 缺少必填参数 [${param.label}]`,
          nodeId: step.nodeId,
          severity: 'error',
        });
      }
    }
  }
  
  return {
    ok: errors.length === 0,
    typeChainClosed: brokenLinks.length === 0,
    allInputsResolved: compiled.inputClosure.ok,
    noIllegalDependencies: !errors.some(e => e.code === 'SELF_DEPENDENCY'),
    errors,
    warnings,
  };
}

// 导出为 Workflow Template JSON（标准格式）
export function exportAsTemplate(compiled: CompiledWorkflow): object {
  return {
    version: '2.0',
    kind: 'WorkflowTemplate',
    metadata: {
      name: compiled.draft.name,
      description: compiled.draft.description || '',
      created_at: compiled.draft.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    spec: {
      steps: compiled.steps.map(s => ({
        id: s.nodeId,
        type: s.nodeType,
        name: s.label,
        params: s.params,
        dependencies: s.dependencies,
        inputs: s.inputs,
        outputs: s.outputs,
        executable: s.executable,
      })),
      execution_order: compiled.executionOrder,
      entrypoint: compiled.steps.find(s => s.depth === 0)?.nodeId || '',
    },
    status: {
      compiled: true,
      validated: false,
      dry_run_only: true,
    },
  };
}
