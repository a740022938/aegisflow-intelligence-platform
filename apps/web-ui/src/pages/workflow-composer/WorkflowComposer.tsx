// ============================================================
// WorkflowComposer.tsx — ComfyUI 风格升级版 UI 2.0
// Phase 2A: 右键添加节点 + 连线交互优化 + 空画布引导
// ============================================================

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  applyNodeChanges,
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ConnectionMode,
  Controls,
  Edge,
  MarkerType,
  MiniMap,
  Node,
  ReactFlow,
  ReactFlowProvider,
  SelectionMode,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type OnConnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { ComposerNode, ComposerEdge, NodeType, WorkflowDraft } from './workflowSchema';
import { NODE_REGISTRY, buildRuntimePayloadFromDraft, isLayoutOnlyNodeType } from './workflowSchema';
import { validateWorkflow, type ValidationResult } from './workflowValidator';
import { saveDraft, listDrafts, loadDraft, deleteDraft, newDraft, saveRecoveryDraft, loadRecoveryDraft, clearRecoveryDraft } from './draftStorage';
import { compileWorkflow, dryRunValidate, type CompiledWorkflow, type DryRunValidation } from './workflowCompiler';
import { getNodeConfig, isDataTypeCompatible } from './NodeTypes';
import { validateConnection } from './ConnectionValidator';
import { computeAllNodesReadiness } from './NodeReadiness';

import { ComfyNode, ComfyGroupNode } from './ComfyNode';
import { NodeSearchModal } from './NodeSearchModal';
import { ContextMenu } from './ContextMenu';
import NodeContextMenu from './NodeContextMenu';
import { StatusBar } from './StatusBar';
import NodeParamPanel from './NodeParamPanel';
import { ensureCatalogLoaded } from './CapabilityAdapter';
import ValidationBanner from './ValidationBanner';
import CompilePreviewPanel from './CompilePreviewPanel';
import { HelpModal } from './HelpModal';

import './ComfyNode.css';
import './NodeSearchModal.css';
import './ContextMenu.css';
import './StatusBar.css';
import './WorkflowComposerUI2.css';

// 节点类型注册
const NODE_TYPES: Record<string, React.ComponentType<any>> = {
  comfyNode: ComfyNode,
  comfyGroup: ComfyGroupNode,
};

// ID 生成器
let nodeCounter = 0;
const genId = (prefix = 'node') => `${prefix}_${Date.now()}_${++nodeCounter}`;
const resetCounter = (val: number) => { nodeCounter = val; };
const WORKSPACE_NODE_TYPE: NodeType = 'workspace-group';

const isWorkspaceNodeType = (type?: string | null) => String(type || '').trim() === WORKSPACE_NODE_TYPE;

const isWorkspaceNode = (node?: Node | null) => {
  if (!node) return false;
  return isWorkspaceNodeType(String(node.data?.nodeType || node.type || ''));
};

const getNodeSize = (node: Node) => ({
  width: Number(node.width || (node.style as any)?.width || 260),
  height: Number(node.height || (node.style as any)?.height || (node.data?.collapsed ? 74 : 180)),
});

const buildNodeIndex = (nodes: Node[]) => {
  const map = new Map<string, Node>();
  for (const n of nodes) map.set(n.id, n);
  return map;
};

const getAbsoluteNodePosition = (node: Node, nodeMap: Map<string, Node>) => {
  let x = Number(node.position.x || 0);
  let y = Number(node.position.y || 0);
  const seen = new Set<string>();
  let current: Node | undefined = node;

  while (current?.parentId) {
    const pid = String(current.parentId);
    if (seen.has(pid)) break;
    seen.add(pid);
    const parent = nodeMap.get(pid);
    if (!parent) break;
    x += Number(parent.position.x || 0);
    y += Number(parent.position.y || 0);
    current = parent;
  }

  return { x, y };
};

const getWorkspaceBounds = (workspaceNode: Node, nodeMap: Map<string, Node>) => {
  const abs = getAbsoluteNodePosition(workspaceNode, nodeMap);
  const size = getNodeSize(workspaceNode);
  return {
    x: abs.x,
    y: abs.y,
    width: size.width,
    height: size.height,
    area: Math.max(1, size.width * size.height),
  };
};

const findWorkspaceAtPosition = (nodes: Node[], pos: { x: number; y: number }) => {
  const nodeMap = buildNodeIndex(nodes);
  const candidates = nodes
    .filter((n) => isWorkspaceNode(n))
    .map((n) => ({ node: n, bounds: getWorkspaceBounds(n, nodeMap) }))
    .filter(({ bounds }) =>
      pos.x >= bounds.x &&
      pos.x <= bounds.x + bounds.width &&
      pos.y >= bounds.y &&
      pos.y <= bounds.y + bounds.height
    )
    .sort((a, b) => a.bounds.area - b.bounds.area);

  return candidates[0]?.node;
};

type QuickTemplateId =
  | 'vision_6step'        // 视觉6步完整流水线
  | 'det_eval'            // 检测→评估
  | 'sam_verify'          // SAM分割→分类验证
  | 'track_archive'       // 检测→追踪→归档
  | 'det_classify_eval'   // 检测→分类验证→评估
  | 'seg_eval'            // 分割→评估
  | 'full_monitor'        // 全链路生产监控
  | 'quick_detect'        // 单步快速检测
  | 'yolo_smart_flywheel'; // YOLO 智能飞轮一键闭环

interface QuickTemplate {
  id: QuickTemplateId;
  name: string;
  nameZh: string;
  category: '视觉流水线' | '评估' | '生产部署';
  description: string;
  tags: string[];
}

interface BackendTemplate {
  id: string;
  name?: string;
  code?: string;
  workflow_steps_json?: any;
}

const STEP_KEY_TO_NODE_TYPE: Record<string, NodeType> = Object.entries(NODE_REGISTRY).reduce((acc, [nodeType, cfg]) => {
  const stepKey = String((cfg as any)?.execution?.stepKey || '').trim();
  if (stepKey) acc[stepKey] = nodeType as NodeType;
  return acc;
}, {} as Record<string, NodeType>);

const QUICK_TEMPLATES: QuickTemplate[] = [
  {
    id: 'vision_6step',
    name: 'Vision 6-Step Pipeline',
    nameZh: '视觉6步流水线',
    category: '视觉流水线',
    description: '数据集加载→YOLO检测→SAM分割→分类验证→目标追踪→输出归档，覆盖完整视觉处理链路',
    tags: ['6步', '完整', '推荐'],
  },
  {
    id: 'det_eval',
    name: 'Detect → Evaluate',
    nameZh: '检测→评估',
    category: '评估',
    description: '加载数据→YOLO目标检测→生成评估报告，快速验证检测效果',
    tags: ['快速', '轻量'],
  },
  {
    id: 'sam_verify',
    name: 'SAM → Classify Verify',
    nameZh: 'SAM分割→分类验证',
    category: '视觉流水线',
    description: 'SAM图像分割→分类器验证，验证分割结果的类别准确性',
    tags: ['分割', '验证'],
  },
  {
    id: 'track_archive',
    name: 'Detect → Track → Archive',
    nameZh: '检测→追踪→归档',
    category: '视觉流水线',
    description: 'YOLO检测→多目标追踪→输出归档，适合视频流场景',
    tags: ['跟踪', '视频'],
  },
  {
    id: 'det_classify_eval',
    name: 'Detect → Classify → Evaluate',
    nameZh: '检测→分类验证→评估',
    category: '评估',
    description: 'YOLO检测→分类器验证→评估报告，检测+验证+量化评估三合一',
    tags: ['验证', '量化'],
  },
  {
    id: 'seg_eval',
    name: 'Segment → Evaluate',
    nameZh: '分割→评估',
    category: '评估',
    description: 'SAM分割→评估报告，快速量化分割质量',
    tags: ['分割', '轻量'],
  },
  {
    id: 'full_monitor',
    name: 'Full Monitor Pipeline',
    nameZh: '全链路生产监控',
    category: '生产部署',
    description: '6步全链+评估报告双重输出，适合生产环境持续监控',
    tags: ['生产', '完整', '监控'],
  },
  {
    id: 'quick_detect',
    name: 'Quick Detect',
    nameZh: '单步快速检测',
    category: '评估',
    description: '仅YOLO检测，最简配置快速验证模型可用性',
    tags: ['极简', '调试'],
  },
  {
    id: 'yolo_smart_flywheel',
    name: 'YOLO Smart Flywheel',
    nameZh: 'YOLO智能飞轮全链',
    category: '视觉流水线',
    description: '完整12步闭环：视频源→抽帧→清洗→注册→切分→训练配置→训练→评估→归档→发布→校验→反馈回流，一键闭环',
    tags: ['12步', '完整闭环', '训练', '推荐'],
  },
];

// ============================================================
// 主组件
// ============================================================
function WorkflowComposerInner() {
  const navigate = useNavigate();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, fitView, zoomIn, zoomOut, getViewport, setCenter } = useReactFlow();

  // 草稿状态
  const [currentDraft, setCurrentDraft] = useState<WorkflowDraft>(newDraft());
  const [drafts, setDrafts] = useState<WorkflowDraft[]>([]);
  const [showDraftList, setShowDraftList] = useState(false);
  const [backendTemplates, setBackendTemplates] = useState<BackendTemplate[]>([]);

  // React Flow 状态
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);

  // P2: 剪贴板状态
  const [clipboard, setClipboard] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null);

  // MVP v2: start catalog map on mount
  React.useEffect(() => {
    ensureCatalogLoaded();
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch('/api/workflow-templates');
        if (!resp.ok) return;
        const data = await resp.json();
        const list = Array.isArray(data?.templates) ? data.templates : [];
        if (!cancelled) setBackendTemplates(list);
      } catch {
        if (!cancelled) setBackendTemplates([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // UI 状态
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchPosition, setSearchPosition] = useState({ x: 0, y: 0 });
  const [validation, setValidation] = useState<ValidationResult>({ ok: true, errors: [], warnings: [] });
  const [compiledWorkflow, setCompiledWorkflow] = useState<CompiledWorkflow | null>(null);
  const [dryRunResult, setDryRunResult] = useState<DryRunValidation | null>(null);
  // MVP P0: dry-run submit result from backend
  const [dryRunSubmitResult, setDryRunSubmitResult] = useState<{
    ok: boolean;
    execution_mode: string;
    summary: { totalSteps: number; successSteps: number; failedSteps: number; blockedSteps: number };
    stepResults: Array<{
      stepOrder: number; stepName: string; stepKey: string; status: string; result: string; nodeId?: string; node_id?: string; blockedReason?: string;
      checkedItems: Array<{ code: string; item: string; status: string; message: string }>;
      envelope?: { ok: boolean; status: string; step_key: string; step_order: number; node_id?: string; output: any; error: null | { message: string }; artifacts: any[]; refs: Record<string, string>; metrics: Record<string, any>; trace: { mode: 'dry-run' } };
    }>;
    step_envelopes?: Array<{ ok: boolean; status: string; step_key: string; step_order: number; node_id?: string; output: any; error: null | { message: string }; artifacts: any[]; refs: Record<string, string>; metrics: Record<string, any>; trace: { mode: 'dry-run' } }>;
    envelope_summary?: { artifacts?: any[]; refs?: Record<string, string>; metrics?: Record<string, any> };
    errors: Array<{ code: string; message: string; nodeId?: string; node_id?: string; stepOrder?: number; step_order?: number; stepKey?: string; step_key?: string }>;
    warnings: Array<{ code: string; message: string; nodeId?: string; node_id?: string; stepOrder?: number; step_order?: number; stepKey?: string; step_key?: string }>;
    metadata: { template_name: string; executed_at: string };
  } | null>(null);
  const [dryRunLoading, setDryRunLoading] = useState(false);
  const [dryRunFocusedStepKey, setDryRunFocusedStepKey] = useState<string | null>(null);
  const [dryRunFocusedIssueKey, setDryRunFocusedIssueKey] = useState<string | null>(null);
  const [runLoading, setRunLoading] = useState(false);
  const [runResult, setRunResult] = useState<{ ok: boolean; message: string; jobId?: string } | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const stepNodeMapRef = useRef<Map<number, string>>(new Map());
  const [showCompilePanel, setShowCompilePanel] = useState(false);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [healthIssues, setHealthIssues] = useState<string[]>([]);

  // P6: 产品化状态
  const [showHelp, setShowHelp] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Phase 2A: 右键菜单状态
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuFlowPos, setContextMenuFlowPos] = useState({ x: 0, y: 0 });
  const [nodeContextOpen, setNodeContextOpen] = useState(false);
  const [nodeContextPosition, setNodeContextPosition] = useState({ x: 0, y: 0 });
  const [nodeContextTargetId, setNodeContextTargetId] = useState<string | null>(null);
  const [multiContextOpen, setMultiContextOpen] = useState(false);
  const [multiContextPosition, setMultiContextPosition] = useState({ x: 0, y: 0 });
  const [edgeContextOpen, setEdgeContextOpen] = useState(false);
  const [edgeContextPosition, setEdgeContextPosition] = useState({ x: 0, y: 0 });
  const [edgeContextTargetId, setEdgeContextTargetId] = useState<string | null>(null);

  // Phase 2A: 连线状态
  const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  // ComfyUI化 v1: F4 节点就绪状态
  const [readinessMap, setReadinessMap] = useState<Map<string, import('./NodeReadiness').NodeReadinessResult>>(new Map());
  const GRID = 20;
  const snap = useCallback((v: number) => Math.round(v / GRID) * GRID, []);
  const historyPastRef = useRef<string[]>([]);
  const historyFutureRef = useRef<string[]>([]);
  const applyingHistoryRef = useRef(false);

  const focusDryRunStepSafe = useCallback((stepKey?: string, stepOrder?: number) => {
    const key = String(stepKey || '').trim();
    const order = Number(stepOrder);
    const domId = key ? `dryrun-step-${key}` : (Number.isFinite(order) && order > 0 ? `dryrun-step-order-${order}` : '');
    if (!domId) return;
    setDryRunFocusedStepKey(key || `order:${order}`);
    setDryRunFocusedIssueKey(null);
    const el = document.getElementById(domId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  const focusDryRunIssueSafe = useCallback((issueKey: string) => {
    if (!issueKey) return;
    setDryRunFocusedIssueKey(issueKey);
    const el = document.getElementById(issueKey);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  // 同步 draft 到 ReactFlow
  const syncToReactFlow = useCallback((draft: WorkflowDraft) => {
    const rfNodes: Node[] = draft.nodes.map(n => {
      const nodeTypeRaw = String(n.type || '').trim();
      const isLegacyGroup = nodeTypeRaw === 'group' || nodeTypeRaw === 'comfyGroup';
      const nodeType = (isLegacyGroup ? WORKSPACE_NODE_TYPE : nodeTypeRaw) as NodeType;
      if (isWorkspaceNodeType(nodeType)) {
        const workspaceColor = String((n.params?.workspace_color || '#38BDF8'));
        return {
          id: n.id,
          type: 'comfyGroup',
          position: n.position,
          data: {
            label: n.label || String(n.params?.workspace_name || '工作区'),
            nodeType: WORKSPACE_NODE_TYPE,
            color: workspaceColor,
            params: n.params || {},
          },
          style: {
            width: Math.max(300, Number(n.size?.width || 520)),
            height: Math.max(220, Number(n.size?.height || 320)),
            zIndex: -1,
          },
          draggable: true,
          selectable: true,
        };
      }

      const config = getNodeConfig(nodeType);
      const collapsed = !!(n as any).collapsed;
      return {
        id: n.id,
        type: 'comfyNode',
        position: n.position,
        parentId: n.parentId,
        extent: n.extent,
        data: {
          label: n.label,
          nodeType,
          params: n.params,
          executable: n.executable,
          frozenHint: n.frozenHint,
          onFocusDryRunStep: focusDryRunStepSafe,
          collapsed,
          onToggleCollapse: () => {
            setNodes((nds) => nds.map((node) => node.id === n.id
              ? { ...node, data: { ...node.data, collapsed: !node.data?.collapsed } }
              : node));
          },
        },
        style: { width: n.size?.width || 260, height: n.size?.height || (collapsed ? 74 : 180), zIndex: 1 },
      };
    });

    const rfEdges: Edge[] = draft.edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
    }));

    setNodes(rfNodes);
    setEdges(rfEdges);
    resetCounter(draft.nodes.length);
  }, [setNodes, setEdges, focusDryRunStepSafe]);

  // ComfyUI化 v1: F4 将就绪状态应用到节点
  const applyReadinessToNodes = useCallback((nodes: Node[], readiness: Map<string, import('./NodeReadiness').NodeReadinessResult>) => {
    setNodes((nds) => nds.map((n) => {
      const r = readiness.get(n.id);
      if (!r) return n;
      return {
        ...n,
        data: {
          ...n.data,
          readinessState: r.state,
          readinessLabel: r.state === 'ready' ? '就绪' : r.state === 'idle' ? '空闲' : undefined,
          readinessMissingInputs: r.missingInputs,
          readinessMissingParams: r.missingParams,
        },
      };
    }));
    setReadinessMap(readiness);
  }, [setNodes]);

  // 初始化草稿列表
  React.useEffect(() => {
    const localDrafts = listDrafts();
    setDrafts(localDrafts);
    const recovery = loadRecoveryDraft();
    if (recovery && (!localDrafts.length || (new Date(recovery.updated_at || 0).getTime() >= new Date(localDrafts[0]?.updated_at || 0).getTime()))) {
      setCurrentDraft(recovery);
      syncToReactFlow(recovery);
    }
  }, [syncToReactFlow]);

  // ComfyUI化 v1: F4 节点/边变化时重新计算就绪状态
  React.useEffect(() => {
    if (!nodes.length) return;
    const readiness = computeAllNodesReadiness(nodes, edges);
    applyReadinessToNodes(nodes, readiness);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length, edges.length]);

  // 同步 ReactFlow 到 draft
  const syncToDraft = useCallback((): WorkflowDraft => {
    const composerNodes: ComposerNode[] = nodes.map(n => ({
      id: n.id,
      type: (isWorkspaceNode(n)
        ? WORKSPACE_NODE_TYPE
        : (n.data?.nodeType as NodeType)) || 'reroute',
      label: String(n.data?.label || ''),
      position: n.position,
      size: {
        width: getNodeSize(n).width,
        height: getNodeSize(n).height,
      },
      ...(n.parentId ? { parentId: n.parentId } : {}),
      ...(n.extent === 'parent' ? { extent: 'parent' as const } : {}),
      ...(n.data?.collapsed ? { collapsed: true } : {}),
      params: (n.data?.params || {}) as Record<string, unknown>,
      executable: n.data.executable as boolean,
      frozenHint: n.data.frozenHint as string | undefined,
    }));

    const composerEdges: ComposerEdge[] = edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle || undefined,
      targetHandle: e.targetHandle || undefined,
    }));

    return {
      ...currentDraft,
      nodes: composerNodes,
      edges: composerEdges,
      updated_at: new Date().toISOString(),
    };
  }, [nodes, edges, currentDraft]);

  const serializeDraft = useCallback((draft: WorkflowDraft) => JSON.stringify(draft), []);

  const restoreDraftFromSerialized = useCallback((serialized: string) => {
    try {
      const parsed = JSON.parse(serialized) as WorkflowDraft;
      applyingHistoryRef.current = true;
      setCurrentDraft(parsed);
      syncToReactFlow(parsed);
      setTimeout(() => { applyingHistoryRef.current = false; }, 0);
    } catch {}
  }, [syncToReactFlow]);

  const pushHistory = useCallback((draft: WorkflowDraft) => {
    const serialized = serializeDraft(draft);
    const past = historyPastRef.current;
    if (!past.length || past[past.length - 1] !== serialized) {
      historyPastRef.current = [...past.slice(-49), serialized];
      historyFutureRef.current = [];
    }
  }, [serializeDraft]);

  const onNodesChange = useCallback((changes: any[]) => {
    setNodes((nds) => {
      const changed = applyNodeChanges(changes, nds);
      return changed.map((n) => {
        const { width: widthRaw, height: heightRaw } = getNodeSize(n);
        const isWorkspace = isWorkspaceNode(n);
        const minWidth = isWorkspace ? 300 : 220;
        const minHeight = isWorkspace ? 220 : (n.data?.collapsed ? 74 : 120);
        return {
          ...n,
          style: {
            ...(n.style || {}),
            width: Math.max(minWidth, snap(widthRaw)),
            height: Math.max(minHeight, snap(heightRaw)),
            zIndex: isWorkspace ? -1 : 1,
          },
        };
      });
    });
  }, [setNodes, snap]);

  // 添加节点
  const addNode = useCallback((type: NodeType, position: { x: number; y: number }) => {
    const config = getNodeConfig(type);
    const id = genId(type);
    if (isWorkspaceNodeType(type)) {
      const workspaceName = `工作区 ${id.slice(-4)}`;
      const workspaceColor = '#38BDF8';
      const workspaceNode: Node = {
        id,
        type: 'comfyGroup',
        position,
        draggable: true,
        selectable: true,
        data: {
          label: workspaceName,
          nodeType: WORKSPACE_NODE_TYPE,
          color: workspaceColor,
          params: {
            workspace_name: workspaceName,
            workspace_desc: '',
            workspace_color: workspaceColor,
          },
        },
        style: {
          width: 520,
          height: 320,
          zIndex: -1,
        },
      };
      setNodes((nds) => [...nds, workspaceNode]);
      setSelectedNodes([id]);
      setSelectedEdges([]);
      return;
    }

    const paramDefaults = Object.fromEntries(
      (NODE_REGISTRY[type]?.params || []).map((p) => {
        let v: unknown = p.default;
        if (v === undefined) {
          if (p.type === 'string') v = '';
          else if (p.type === 'number') v = 0;
          else if (p.type === 'boolean') v = false;
          else if (p.type === 'text') v = '';
        }
        // 关键 ID 字段给可运行占位，减少“刚拖节点就必填报错”
        if ((p.key === 'dataset_id' || p.key === 'experiment_id' || p.key === 'segmentation_id' || p.key === 'handoff_id') && (v === '' || v === undefined)) {
          v = `demo_${p.key}`;
        }
        return [p.key, v];
      })
    );

    const newNode: Node = {
      id,
      type: 'comfyNode',
      position,
      data: {
        label: config.label,
        nodeType: type,
        params: paramDefaults,
        executable: !config.frozen,
        frozenHint: config.frozenHint,
        onFocusDryRunStep: focusDryRunStepSafe,
        collapsed: false,
      },
      style: { width: 260, height: 180, zIndex: 1 },
    };

    setNodes((nds) => {
      const targetWorkspace = findWorkspaceAtPosition(nds, position);
      if (!targetWorkspace) {
        return [...nds, newNode];
      }

      const workspaceAbs = getAbsoluteNodePosition(targetWorkspace, buildNodeIndex(nds));
      const relativeNode: Node = {
        ...newNode,
        parentId: targetWorkspace.id,
        extent: 'parent',
        position: {
          x: snap(position.x - workspaceAbs.x),
          y: snap(position.y - workspaceAbs.y),
        },
      };
      return [...nds, relativeNode];
    });
  }, [setNodes, snap]);

  // 从搜索添加节点
  const onNodeSelectFromSearch = useCallback((type: NodeType, screenPos: { x: number; y: number }) => {
    const bounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!bounds) return;

    const flowPos = screenToFlowPosition({
      x: screenPos.x - bounds.left,
      y: screenPos.y - bounds.top,
    });

    addNode(type, flowPos);
  }, [screenToFlowPosition, addNode]);

  // Phase 2A: 从右键菜单添加节点
  const onNodeSelectFromContextMenu = useCallback((type: NodeType) => {
    addNode(type, contextMenuFlowPos);
  }, [addNode, contextMenuFlowPos]);

  // Phase 2A: 连线校验
  const onConnect: OnConnect = useCallback((connection: Connection) => {
    const result = validateConnection(
      nodes,
      edges,
      connection.source!,
      connection.target!,
      connection.sourceHandle,
      connection.targetHandle
    );

    if (!result.valid) {
      setConnectionError(result.reason || '连接失败');
      setTimeout(() => setConnectionError(null), 2000);
      return;
    }

    setEdges(eds => addEdge({
      ...connection,
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
    }, eds));
    setConnectingNodeId(null);
  }, [nodes, edges, setEdges]);

  // Phase 2A: 连线开始
  const onConnectStart = useCallback((event: any, params: { nodeId: string; handleId: string | null; handleType: 'source' | 'target' }) => {
    setConnectingNodeId(params.nodeId);
  }, []);

  // Phase 2A: 连线结束（未连接时）
  const onConnectEnd = useCallback((event: any) => {
    if (connectingNodeId) {
      // 松手时如果没有连到节点，可以提示用户
      // 这里只做状态清理
      setConnectingNodeId(null);
    }
  }, [connectingNodeId]);

  // 选择变化
  const onSelectionChange = useCallback(({ nodes: selected, edges: selectedEdg }: { nodes: Node[]; edges: Edge[] }) => {
    setSelectedNodes(selected.map(n => n.id));
    setSelectedEdges(selectedEdg.map(e => e.id));
  }, []);

  // 移动时同步
  const onNodeDragStop = useCallback(() => {
    setNodes((nds) => nds.map((n) => ({
      ...n,
      position: { x: snap(n.position.x), y: snap(n.position.y) },
    })));
    setCurrentDraft(syncToDraft());
  }, [setNodes, snap, syncToDraft]);

  // 视口变化
  const onMove = useCallback((event: unknown, vp: { x: number; y: number; zoom: number }) => {
    setViewport(vp);
  }, []);

  // Phase 2A: 右键画布
  const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const bounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!bounds) return;

    const screenX = event.clientX;
    const screenY = event.clientY;
    const flowX = event.clientX - bounds.left;
    const flowY = event.clientY - bounds.top;

    const flowPos = screenToFlowPosition({ x: flowX, y: flowY });

    setNodeContextOpen(false);
    setEdgeContextOpen(false);
    if (selectedNodes.length > 1) {
      setMultiContextPosition({ x: screenX, y: screenY });
      setMultiContextOpen(true);
      setContextMenuOpen(false);
      return;
    }
    setMultiContextOpen(false);
    setContextMenuPosition({ x: screenX, y: screenY });
    setContextMenuFlowPos(flowPos);
    setContextMenuOpen(true);
  }, [screenToFlowPosition, selectedNodes.length]);

  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: any) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedNodes([node.id]);
    setSelectedEdges([]);
    setNodeContextTargetId(node.id);
    setNodeContextPosition({ x: event.clientX, y: event.clientY });
    setNodeContextOpen(true);
    setContextMenuOpen(false);
    setMultiContextOpen(false);
  }, []);

  const deleteNodeById = useCallback((nodeId: string) => {
    setNodes((nds) => {
      const target = nds.find((n) => n.id === nodeId);
      if (!target) return nds;
      if (!isWorkspaceNode(target)) return nds.filter((n) => n.id !== nodeId);

      const nodeMap = buildNodeIndex(nds);
      const workspaceAbs = getAbsoluteNodePosition(target, nodeMap);
      return nds.flatMap((n) => {
        if (n.id === nodeId) return [];
        if (n.parentId !== nodeId) return [n];
        return [{
          ...n,
          parentId: undefined,
          extent: undefined,
          style: { ...(n.style || {}), zIndex: 1 },
          position: {
            x: snap(workspaceAbs.x + n.position.x),
            y: snap(workspaceAbs.y + n.position.y),
          },
        }];
      });
    });
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }, [setEdges, setNodes, snap]);

  const clearNodeEdges = useCallback((nodeId: string) => {
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }, [setEdges]);

  const duplicateNodeById = useCallback((nodeId: string) => {
    const source = nodes.find((n) => n.id === nodeId);
    if (!source) return;
    const newId = genId(String(source.data?.nodeType || 'node'));
    const copied: Node = {
      ...source,
      id: newId,
      selected: false,
      position: { x: source.position.x + 40, y: source.position.y + 40 },
      data: { ...source.data, label: `${String(source.data?.label || '节点')} Copy` },
    };
    setNodes((nds) => [...nds, copied]);
    setSelectedNodes([newId]);
    setSelectedEdges([]);
  }, [nodes, setNodes]);

  const toggleNodeCollapsed = useCallback((nodeId: string) => {
    setNodes((nds) => nds.map((n) => {
      if (n.id !== nodeId) return n;
      const collapsed = !n.data?.collapsed;
      const nextHeight = collapsed ? 74 : Math.max(Number(n.height || (n.style as any)?.height || 180), 140);
      return {
        ...n,
        data: { ...n.data, collapsed },
        style: { ...(n.style || {}), height: nextHeight },
      };
    }));
  }, [setNodes]);

  const deleteSelectedNodes = useCallback(() => {
    if (!selectedNodes.length) return;
    const selectedSet = new Set(selectedNodes);
    setNodes((nds) => {
      const nodeMap = buildNodeIndex(nds);
      const releasedWorkspacePos = new Map<string, { x: number; y: number }>();
      for (const n of nds) {
        if (selectedSet.has(n.id) && isWorkspaceNode(n)) {
          releasedWorkspacePos.set(n.id, getAbsoluteNodePosition(n, nodeMap));
        }
      }

      return nds.flatMap((n) => {
        if (selectedSet.has(n.id)) return [];
        if (n.parentId && releasedWorkspacePos.has(String(n.parentId))) {
          const p = releasedWorkspacePos.get(String(n.parentId))!;
          return [{
            ...n,
            parentId: undefined,
            extent: undefined,
            style: { ...(n.style || {}), zIndex: 1 },
            position: {
              x: snap(p.x + n.position.x),
              y: snap(p.y + n.position.y),
            },
          }];
        }
        return [n];
      });
    });
    setEdges((eds) => eds.filter((e) => !selectedNodes.includes(e.source) && !selectedNodes.includes(e.target)));
    setSelectedNodes([]);
    setSelectedEdges([]);
  }, [selectedNodes, setEdges, setNodes, snap]);

  const alignSelectedLeft = useCallback(() => {
    if (selectedNodes.length < 2) return;
    const selected = nodes.filter((n) => selectedNodes.includes(n.id));
    if (!selected.length) return;
    const left = Math.min(...selected.map((n) => n.position.x));
    setNodes((nds) => nds.map((n) => selectedNodes.includes(n.id) ? { ...n, position: { ...n.position, x: left } } : n));
  }, [nodes, selectedNodes, setNodes]);

  const alignSelectedTop = useCallback(() => {
    if (selectedNodes.length < 2) return;
    const selected = nodes.filter((n) => selectedNodes.includes(n.id));
    if (!selected.length) return;
    const top = Math.min(...selected.map((n) => n.position.y));
    setNodes((nds) => nds.map((n) => selectedNodes.includes(n.id) ? { ...n, position: { ...n.position, y: top } } : n));
  }, [nodes, selectedNodes, setNodes]);

  const distributeSelectedHoriz = useCallback(() => {
    if (selectedNodes.length < 3) return;
    const selected = nodes.filter((n) => selectedNodes.includes(n.id)).sort((a, b) => a.position.x - b.position.x);
    const minX = selected[0].position.x;
    const maxX = selected[selected.length - 1].position.x;
    const gap = (maxX - minX) / (selected.length - 1);
    const orderIds = selected.map((n) => n.id);
    setNodes((nds) => nds.map((n) => {
      const idx = orderIds.indexOf(n.id);
      if (idx < 0) return n;
      return { ...n, position: { ...n.position, x: snap(minX + idx * gap) } };
    }));
  }, [nodes, selectedNodes, setNodes, snap]);

  // P2: 右对齐
  const alignSelectedRight = useCallback(() => {
    if (selectedNodes.length < 2) return;
    const selected = nodes.filter((n) => selectedNodes.includes(n.id));
    if (!selected.length) return;
    const right = Math.max(...selected.map((n) => n.position.x + (n.measured?.width || 260)));
    setNodes((nds) => nds.map((n) => {
      if (!selectedNodes.includes(n.id)) return n;
      const w = n.measured?.width || 260;
      return { ...n, position: { ...n.position, x: right - w } };
    }));
  }, [nodes, selectedNodes, setNodes]);

  // P2: 底对齐
  const alignSelectedBottom = useCallback(() => {
    if (selectedNodes.length < 2) return;
    const selected = nodes.filter((n) => selectedNodes.includes(n.id));
    if (!selected.length) return;
    const bottom = Math.max(...selected.map((n) => n.position.y + (n.measured?.height || 180)));
    setNodes((nds) => nds.map((n) => {
      if (!selectedNodes.includes(n.id)) return n;
      const h = n.measured?.height || 180;
      return { ...n, position: { ...n.position, y: bottom - h } };
    }));
  }, [nodes, selectedNodes, setNodes]);

  // P2: 纵向等距分布
  const distributeSelectedVert = useCallback(() => {
    if (selectedNodes.length < 3) return;
    const selected = nodes.filter((n) => selectedNodes.includes(n.id)).sort((a, b) => a.position.y - b.position.y);
    const minY = selected[0].position.y;
    const maxY = selected[selected.length - 1].position.y;
    const gap = (maxY - minY) / (selected.length - 1);
    const orderIds = selected.map((n) => n.id);
    setNodes((nds) => nds.map((n) => {
      const idx = orderIds.indexOf(n.id);
      if (idx < 0) return n;
      return { ...n, position: { ...n.position, y: snap(minY + idx * gap) } };
    }));
  }, [nodes, selectedNodes, setNodes, snap]);

  // P6: 圈选创建工作区（ComfyUI 风格）
  const handleAddGroup = useCallback((groupName?: string) => {
    if (selectedNodes.length < 1) return;
    const selectedSet = new Set(selectedNodes);
    const selected = nodes.filter((n) => selectedSet.has(n.id) && !isWorkspaceNode(n));
    if (!selected.length) return;

    const nodeMap = buildNodeIndex(nodes);
    const selectedBounds = selected.map((n) => {
      const abs = getAbsoluteNodePosition(n, nodeMap);
      const size = getNodeSize(n);
      return { node: n, abs, size };
    });

    const minX = Math.min(...selectedBounds.map((x) => x.abs.x));
    const minY = Math.min(...selectedBounds.map((x) => x.abs.y));
    const maxX = Math.max(...selectedBounds.map((x) => x.abs.x + x.size.width));
    const maxY = Math.max(...selectedBounds.map((x) => x.abs.y + x.size.height));

    const padX = 36;
    const padTop = 44;
    const padBottom = 28;
    const groupX = snap(minX - padX);
    const groupY = snap(minY - padTop);
    const groupW = Math.max(300, snap(maxX - minX + padX * 2));
    const groupH = Math.max(220, snap(maxY - minY + padTop + padBottom));
    const workspaceName = groupName || `工作区 ${selected.length} 节点`;
    const workspaceId = genId('workspace');
    const workspaceColor = '#38BDF8';

    const workspaceNode: Node = {
      id: workspaceId,
      type: 'comfyGroup',
      position: { x: groupX, y: groupY },
      draggable: true,
      selectable: true,
      data: {
        label: workspaceName,
        nodeType: WORKSPACE_NODE_TYPE,
        color: workspaceColor,
        params: {
          workspace_name: workspaceName,
          workspace_desc: '',
          workspace_color: workspaceColor,
        },
      },
      style: {
        width: groupW,
        height: groupH,
        zIndex: -1,
      },
    };

    setNodes((nds) => {
      const latestMap = buildNodeIndex(nds);
      const remapped = nds.map((n) => {
        if (!selectedSet.has(n.id) || isWorkspaceNode(n)) return n;
        const abs = getAbsoluteNodePosition(n, latestMap);
        return {
          ...n,
          parentId: workspaceId,
          extent: 'parent' as const,
          style: { ...(n.style || {}), zIndex: 1 },
          position: {
            x: snap(abs.x - groupX),
            y: snap(abs.y - groupY),
          },
        };
      });
      return [...remapped, workspaceNode];
    });
    setSelectedNodes([workspaceId]);
    setSelectedEdges([]);
  }, [nodes, selectedNodes, setNodes, snap]);

  const applyQuickTemplate = useCallback((templateId: QuickTemplateId) => {
    const baseX = 120;
    const baseY = 180;
    const makeNode = (
      id: string,
      type: NodeType,
      x: number,
      y: number,
      extraParams?: Record<string, unknown>,
    ): ComposerNode => ({
      id,
      type,
      label: getNodeConfig(type).label,
      position: { x, y },
      size: { width: 260, height: 180 },
      params: extraParams || {},
      executable: !getNodeConfig(type).frozen,
      frozenHint: getNodeConfig(type).frozenHint,
    });

    let nodesTpl: ComposerNode[] = [];
    let edgesTpl: ComposerEdge[] = [];

    if (templateId === 'yolo_smart_flywheel') {
      // 4泳道布局: 数据入口(1-3) | 数据治理(4-5) | 训练评估(6-8) | 归档发布回流(9-12)
      // 每个泳道 x 间隔 320px，泳道内 y 间隔 120px
      const lane1X = baseX;           // 数据入口区
      const lane2X = baseX + 400;     // 数据治理区
      const lane3X = baseX + 800;     // 训练评估区
      const lane4X = baseX + 1200;    // 归档发布回流区
      const rowY = baseY;
      const rowGapY = 130;

      nodesTpl = [
        // 泳道1: 数据入口区
        makeNode('tpl_video_source', 'video-source', lane1X, rowY, {
          source_path: 'E:/AGI_Factory/datasets/raw/demo.mp4',
          source_type: 'video',
        }),
        makeNode('tpl_frame_extract', 'frame-extract', lane1X, rowY + rowGapY, {
          fps: 2,
          max_frames: 200,
        }),
        makeNode('tpl_frame_clean', 'frame-clean', lane1X, rowY + rowGapY * 2, {
          blur_threshold: 80,
          dedupe: true,
        }),
        // 泳道2: 数据治理区
        makeNode('tpl_dataset_register', 'dataset-register', lane2X, rowY, {
          dataset_id: '',
          dataset_name: 'YOLO Smart Flywheel Dataset',
        }),
        makeNode('tpl_dataset_split', 'dataset-split', lane2X, rowY + rowGapY, {
          train_ratio: 0.8,
          val_ratio: 0.1,
          test_ratio: 0.1,
        }),
        // 泳道3: 训练评估区
        makeNode('tpl_train_config_builder', 'train-config-builder', lane3X, rowY, {
          framework: 'yolov8',
          model_variant: 'yolov8n',
          epochs: 10,
          template_version: '1.0.0',
        }),
        makeNode('tpl_train_model', 'train-model', lane3X, rowY + rowGapY, {
          experiment_id: '',
          dataset_id: '',
          template_version: '1.0.0',
        }),
        makeNode('tpl_evaluate_model', 'evaluate-model', lane3X, rowY + rowGapY * 2, {
          experiment_id: '',
          model_id: 'auto',
          dataset_id: '',
        }),
        // 泳道4: 归档发布回流区
        makeNode('tpl_archive_model', 'archive-model', lane4X, rowY, {
          model_id: 'auto',
        }),
        makeNode('tpl_release_model', 'release-model', lane4X, rowY + rowGapY, {
          model_id: 'auto',
          release_note: 'Auto release from smart flywheel',
        }),
        makeNode('tpl_release_validate', 'release-validate', lane4X, rowY + rowGapY * 2, {
          model_id: 'auto',
        }),
        makeNode('tpl_feedback_backflow', 'feedback-backflow', lane4X, rowY + rowGapY * 3, {
          model_id: 'auto',
        }),
      ];
      edgesTpl = [
        // 泳道1内部连线
        { id: 'tpl_e1', source: 'tpl_video_source', target: 'tpl_frame_extract' },
        { id: 'tpl_e2', source: 'tpl_frame_extract', target: 'tpl_frame_clean' },
        // 泳道1 → 泳道2
        { id: 'tpl_e3', source: 'tpl_frame_clean', target: 'tpl_dataset_register' },
        // 泳道2内部连线
        { id: 'tpl_e4', source: 'tpl_dataset_register', target: 'tpl_dataset_split' },
        // 泳道2 → 泳道3
        { id: 'tpl_e5', source: 'tpl_dataset_split', target: 'tpl_train_config_builder' },
        // 泳道3内部连线
        { id: 'tpl_e6', source: 'tpl_train_config_builder', target: 'tpl_train_model' },
        { id: 'tpl_e7', source: 'tpl_train_model', target: 'tpl_evaluate_model' },
        // 泳道3 → 泳道4
        { id: 'tpl_e8', source: 'tpl_evaluate_model', target: 'tpl_archive_model' },
        // 泳道4内部连线
        { id: 'tpl_e9', source: 'tpl_archive_model', target: 'tpl_release_model' },
        { id: 'tpl_e10', source: 'tpl_release_model', target: 'tpl_release_validate' },
        { id: 'tpl_e11', source: 'tpl_release_validate', target: 'tpl_feedback_backflow' },
      ];
    } else if (templateId === 'det_eval') {
      nodesTpl = [
        makeNode('tpl_yolo', 'yolo-detect', baseX, baseY, { experiment_id: 'exp_demo', dataset_id: 'ds_demo', model_name: 'yolo26n.pt', conf_threshold: 0.25 }),
        makeNode('tpl_cls', 'classifier-verify', baseX + 320, baseY, { segmentation_id: 'seg_demo', device: 'cpu' }),
      ];
      edgesTpl = [
        { id: 'tpl_e1', source: 'tpl_yolo', target: 'tpl_cls' },
      ];
    } else if (templateId === 'sam_verify') {
      nodesTpl = [
        makeNode('tpl_sam', 'sam-segment', baseX, baseY, { experiment_id: 'exp_demo', handoff_id: 'handoff_demo', model_type: 'vit_b' }),
        makeNode('tpl_cls', 'classifier-verify', baseX + 320, baseY, { segmentation_id: 'seg_demo', device: 'cpu' }),
      ];
      edgesTpl = [
        { id: 'tpl_e1', source: 'tpl_sam', target: 'tpl_cls' },
      ];
    } else {
      nodesTpl = [
        makeNode('tpl_yolo', 'yolo-detect', baseX, baseY, { experiment_id: 'exp_demo', dataset_id: 'ds_demo', model_name: 'yolo26n.pt' }),
        makeNode('tpl_sam', 'sam-segment', baseX + 300, baseY, { experiment_id: 'exp_demo', handoff_id: 'handoff_demo', model_type: 'vit_b' }),
        makeNode('tpl_cls', 'classifier-verify', baseX + 600, baseY, { segmentation_id: 'seg_demo', device: 'cpu' }),
        makeNode('tpl_track', 'tracker', baseX + 900, baseY, { segmentation_id: 'seg_demo', tracker_type: 'bytetrack' }),
      ];
      edgesTpl = [
        { id: 'tpl_e1', source: 'tpl_yolo', target: 'tpl_sam' },
        { id: 'tpl_e2', source: 'tpl_sam', target: 'tpl_cls' },
        { id: 'tpl_e3', source: 'tpl_cls', target: 'tpl_track' },
      ];
    }

    const draft = newDraft();
    draft.name = `模板-${QUICK_TEMPLATES.find((t) => t.id === templateId)?.name || templateId}`;
    draft.nodes = nodesTpl;
    draft.edges = edgesTpl;
    setCurrentDraft(draft);
    syncToReactFlow(draft);
    pushHistory(draft);
    setValidation({ ok: true, errors: [], warnings: [] });
    setContextMenuOpen(false);
    setNodeContextOpen(false);
    setMultiContextOpen(false);
    setEdgeContextOpen(false);
    setActiveJobId(null);
    setRunResult(null);
  }, [setCurrentDraft, syncToReactFlow, pushHistory]);

  const applyBackendTemplate = useCallback((templateId: string) => {
    const tpl = backendTemplates.find((t) => t.id === templateId);
    if (!tpl) return;
    const rawSteps = Array.isArray(tpl.workflow_steps_json)
      ? tpl.workflow_steps_json
      : (typeof tpl.workflow_steps_json === 'string' ? (() => {
        try { return JSON.parse(tpl.workflow_steps_json); } catch { return []; }
      })() : []);
    if (!Array.isArray(rawSteps) || !rawSteps.length) return;

    const steps = [...rawSteps]
      .filter((s: any) => s && typeof s === 'object')
      .sort((a: any, b: any) => Number(a.step_order || 0) - Number(b.step_order || 0));

    const makeNodeId = (idx: number, stepKey: string) => `tpl_${stepKey}_${idx + 1}`;
    const validSteps = steps
      .map((s: any, idx: number) => {
        const stepKey = String(s.step_key || '').trim();
        const nodeType = STEP_KEY_TO_NODE_TYPE[stepKey];
        if (!nodeType) return null;
        return { ...s, __idx: idx, __stepKey: stepKey, __nodeType: nodeType };
      })
      .filter(Boolean) as Array<any>;

    if (!validSteps.length) return;

    const laneGapX = 340;
    const laneGapY = 140;
    const baseX = 120;
    const baseY = 160;

    const nodesTpl: ComposerNode[] = validSteps.map((s: any, i: number) => {
      const nodeType = s.__nodeType as NodeType;
      const cfg = getNodeConfig(nodeType);
      const defaults = Object.fromEntries(((NODE_REGISTRY[nodeType]?.params || []) as any[]).map((p: any) => {
        const value = (p.default !== undefined ? p.default : p.defaultValue);
        return [p.key, value ?? ''];
      }));
      const paramsRaw = { ...defaults, ...(s.params || {}) } as Record<string, unknown>;
      const params: Record<string, unknown> = { ...paramsRaw };
      const paramDefs = (NODE_REGISTRY[nodeType]?.params || []) as any[];
      for (const p of paramDefs) {
        const key = String(p.key || '');
        const v = params[key];
        const hasDefault = p.default !== undefined || p.defaultValue !== undefined;
        const defaultVal = p.default !== undefined ? p.default : p.defaultValue;
        if ((v === '' || v === null || v === undefined) && hasDefault) params[key] = defaultVal;
        // 与 addNode 行为一致：关键 ID 字段给可运行占位，避免模板导入后直接阻断
        if ((key === 'dataset_id' || key === 'experiment_id' || key === 'segmentation_id' || key === 'handoff_id')
          && (params[key] === '' || params[key] === undefined || params[key] === null)) {
          params[key] = `demo_${key}`;
        }
      }
      return {
        id: makeNodeId(i, s.__stepKey),
        type: nodeType,
        label: cfg.label,
        position: { x: baseX + (i % 4) * laneGapX, y: baseY + Math.floor(i / 4) * laneGapY },
        size: { width: 260, height: 180 },
        params,
        executable: !cfg.frozen,
        frozenHint: cfg.frozenHint,
      };
    });

    const edgesTpl: ComposerEdge[] = [];
    const edgeSet = new Set<string>();
    const stepByNodeId = new Map(nodesTpl.map((n, i) => [n.id, validSteps[i]]));
    const nodeByStepKey = new Map(validSteps.map((s: any, i: number) => [String(s.__stepKey), nodesTpl[i]]));

    const addTypedEdge = (sourceNode: ComposerNode, targetNode: ComposerNode) => {
      const outCfg = getNodeConfig(sourceNode.type).outputs || [];
      const inCfg = getNodeConfig(targetNode.type).inputs || [];
      if (!outCfg.length || !inCfg.length) return false;
      let selectedOut = outCfg[0];
      let selectedIn = inCfg[0];
      let found = false;
      for (const input of inCfg) {
        for (const output of outCfg) {
          if (isDataTypeCompatible(output.type, input.type)) {
            selectedOut = output;
            selectedIn = input;
            found = true;
            break;
          }
        }
        if (found) break;
      }
      if (!found) return false;
      const sourceHandle = `out_${selectedOut.name}`;
      const targetHandle = `in_${selectedIn.name}`;
      const dedup = `${sourceNode.id}:${sourceHandle}->${targetNode.id}:${targetHandle}`;
      if (edgeSet.has(dedup)) return true;
      edgeSet.add(dedup);
      edgesTpl.push({
        id: `tpl_e_${edgesTpl.length + 1}`,
        source: sourceNode.id,
        target: targetNode.id,
        sourceHandle,
        targetHandle,
      });
      return true;
    };

    // 优先按模板显式依赖连线（若后端提供 depends_on/dependencies）
    for (let i = 0; i < nodesTpl.length; i += 1) {
      const targetNode = nodesTpl[i];
      const step = stepByNodeId.get(targetNode.id) as any;
      const depsRaw = Array.isArray(step?.depends_on) ? step.depends_on
        : (Array.isArray(step?.dependencies) ? step.dependencies : []);
      const deps = depsRaw.map((d: any) => String(d || '').trim()).filter(Boolean);
      for (const depKey of deps) {
        const sourceNode = nodeByStepKey.get(depKey);
        if (sourceNode) addTypedEdge(sourceNode, targetNode);
      }
    }

    // 若无显式依赖，则按“为每个输入寻找最近可兼容上游”自动布线
    if (edgesTpl.length === 0) {
      for (let i = 0; i < nodesTpl.length; i += 1) {
        const targetNode = nodesTpl[i];
        const targetCfg = getNodeConfig(targetNode.type);
        for (const input of targetCfg.inputs || []) {
          if (input.type === 'any') continue;
          let matched: ComposerNode | null = null;
          for (let j = i - 1; j >= 0; j -= 1) {
            const sourceNode = nodesTpl[j];
            const sourceCfg = getNodeConfig(sourceNode.type);
            const compatibleOut = (sourceCfg.outputs || []).find((o) => isDataTypeCompatible(o.type, input.type));
            if (compatibleOut) {
              matched = sourceNode;
              break;
            }
          }
          if (matched) {
            // 尽量按当前 input 对应 handle 建边
            const sourceCfg = getNodeConfig(matched.type);
            const out = (sourceCfg.outputs || []).find((o) => isDataTypeCompatible(o.type, input.type)) || sourceCfg.outputs?.[0];
            const sourceHandle = out ? `out_${out.name}` : undefined;
            const targetHandle = `in_${input.name}`;
            const dedup = `${matched.id}:${sourceHandle || ''}->${targetNode.id}:${targetHandle}`;
            if (!edgeSet.has(dedup)) {
              edgeSet.add(dedup);
              edgesTpl.push({
                id: `tpl_e_${edgesTpl.length + 1}`,
                source: matched.id,
                target: targetNode.id,
                ...(sourceHandle ? { sourceHandle } : {}),
                targetHandle,
              });
            }
          }
        }
      }
    }

    const draft = newDraft();
    draft.name = `模板-${tpl.name || tpl.code || tpl.id}`;
    draft.nodes = nodesTpl;
    draft.edges = edgesTpl;
    setCurrentDraft(draft);
    syncToReactFlow(draft);
    pushHistory(draft);
    setValidation({ ok: true, errors: [], warnings: [] });
    setContextMenuOpen(false);
    setNodeContextOpen(false);
    setMultiContextOpen(false);
    setEdgeContextOpen(false);
    setActiveJobId(null);
    setRunResult(null);
  }, [backendTemplates, syncToReactFlow, pushHistory]);

  const onEdgeContextMenu = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedNodes([]);
    setSelectedEdges([edge.id]);
    setEdgeContextTargetId(edge.id);
    setEdgeContextPosition({ x: event.clientX, y: event.clientY });
    setEdgeContextOpen(true);
    setContextMenuOpen(false);
    setNodeContextOpen(false);
    setMultiContextOpen(false);
  }, []);

  const deleteEdgeById = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    setSelectedEdges([]);
  }, [setEdges]);

  const disconnectBySameSource = useCallback((edgeId: string) => {
    const edge = edges.find((e) => e.id === edgeId);
    if (!edge) return;
    setEdges((eds) => eds.filter((e) => e.source !== edge.source));
    setSelectedEdges([]);
  }, [edges, setEdges]);

  const disconnectBySameTarget = useCallback((edgeId: string) => {
    const edge = edges.find((e) => e.id === edgeId);
    if (!edge) return;
    setEdges((eds) => eds.filter((e) => e.target !== edge.target));
    setSelectedEdges([]);
  }, [edges, setEdges]);

  const duplicateSelected = useCallback(() => {
    if (!selectedNodes.length) return;
    const selectedSet = new Set(selectedNodes);
    const shift = { x: 40, y: 40 };
    const idMap = new Map<string, string>();
    const nodeCopies: Node[] = [];

    for (const n of nodes) {
      if (!selectedSet.has(n.id)) continue;
      idMap.set(n.id, genId(String(n.data?.nodeType || 'node')));
    }

    for (const n of nodes) {
      if (!selectedSet.has(n.id)) continue;
      const newId = idMap.get(n.id) || genId(String(n.data?.nodeType || 'node'));
      const copiedParentId = n.parentId ? (idMap.get(String(n.parentId)) || String(n.parentId)) : undefined;
      const parentAlsoCopied = !!(n.parentId && selectedSet.has(String(n.parentId)));
      nodeCopies.push({
        ...n,
        id: newId,
        selected: false,
        parentId: copiedParentId,
        extent: copiedParentId ? 'parent' : undefined,
        position: parentAlsoCopied
          ? { x: n.position.x, y: n.position.y }
          : { x: n.position.x + shift.x, y: n.position.y + shift.y },
        data: { ...n.data, label: `${String(n.data?.label || '节点')} Copy` },
      });
    }

    const edgeCopies: Edge[] = edges
      .filter((e) => selectedSet.has(e.source) && selectedSet.has(e.target))
      .map((e) => ({
        ...e,
        id: genId('edge'),
        source: idMap.get(e.source) || e.source,
        target: idMap.get(e.target) || e.target,
        selected: false,
      }));

    setNodes((nds) => [...nds, ...nodeCopies]);
    setEdges((eds) => [...eds, ...edgeCopies]);
    setSelectedNodes(nodeCopies.map((n) => n.id));
    setSelectedEdges([]);
  }, [selectedNodes, nodes, edges, setNodes, setEdges]);

  // P2: 复制到剪贴板
  const copySelected = useCallback(() => {
    if (!selectedNodes.length) return;
    const selectedSet = new Set(selectedNodes);
    const nodeCopies = nodes.filter((n) => selectedSet.has(n.id));
    const edgeCopies = edges.filter((e) => selectedSet.has(e.source) && selectedSet.has(e.target));
    setClipboard({ nodes: nodeCopies, edges: edgeCopies });
  }, [selectedNodes, nodes, edges]);

  // P2: 从剪贴板粘贴
  const pasteFromClipboard = useCallback(() => {
    if (!clipboard || !clipboard.nodes.length) return;
    const shift = { x: 60, y: 60 };
    const idMap = new Map<string, string>();
    const nodeCopies: Node[] = [];

    for (const n of clipboard.nodes) {
      idMap.set(n.id, genId(String(n.data?.nodeType || 'node')));
    }

    for (const n of clipboard.nodes) {
      const newId = idMap.get(n.id) || genId(String(n.data?.nodeType || 'node'));
      const copiedParentId = n.parentId ? (idMap.get(String(n.parentId)) || String(n.parentId)) : undefined;
      const parentAlsoCopied = !!(n.parentId && clipboard.nodes.some((x) => x.id === n.parentId));
      nodeCopies.push({
        ...n,
        id: newId,
        selected: false,
        parentId: copiedParentId,
        extent: copiedParentId ? 'parent' : undefined,
        position: parentAlsoCopied
          ? { x: n.position.x, y: n.position.y }
          : { x: n.position.x + shift.x, y: n.position.y + shift.y },
        data: { ...n.data, label: `${String(n.data?.label || '节点')} Copy` },
      });
    }

    const edgeCopies: Edge[] = clipboard.edges.map((e) => ({
      ...e,
      id: genId('edge'),
      source: idMap.get(e.source) || e.source,
      target: idMap.get(e.target) || e.target,
      selected: false,
    }));

    setNodes((nds) => [...nds, ...nodeCopies]);
    setEdges((eds) => [...eds, ...edgeCopies]);
    setSelectedNodes(nodeCopies.map((n) => n.id));
    setSelectedEdges([]);
  }, [clipboard, setNodes, setEdges]);

  const groupSelectedNodes = useCallback(() => {
    handleAddGroup();
  }, [handleAddGroup]);

  const nudgeSelected = useCallback((dx: number, dy: number) => {
    if (!selectedNodes.length) return;
    setNodes((nds) => nds.map((n) => selectedNodes.includes(n.id)
      ? { ...n, position: { x: snap(n.position.x + dx), y: snap(n.position.y + dy) } }
      : n));
  }, [selectedNodes, setNodes, snap]);

  // P2: 自动布局 — 简单分层拓扑布局
  const autoLayout = useCallback(() => {
    const layoutNodes = nodes.filter((n) => !isLayoutOnlyNodeType(String(n.data?.nodeType || n.type || '')) && !n.parentId);
    if (!layoutNodes.length) return;
    const NODE_W = 260;
    const NODE_H = 180;
    const GAP_X = 80;
    const GAP_Y = 60;
    const layoutNodeSet = new Set(layoutNodes.map((n) => n.id));
    const layoutEdges = edges.filter((e) => layoutNodeSet.has(e.source) && layoutNodeSet.has(e.target));

    // 计算每个节点的入度
    const inDegree = new Map<string, number>();
    const outEdges = new Map<string, Edge[]>();
    for (const n of layoutNodes) inDegree.set(n.id, 0);
    for (const e of layoutEdges) {
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
      const arr = outEdges.get(e.source) || [];
      arr.push(e);
      outEdges.set(e.source, arr);
    }

    // 拓扑分层
    const layers: string[][] = [];
    const remaining = new Set(layoutNodes.map(n => n.id));
    const deg = new Map(inDegree);
    while (remaining.size > 0) {
      const layer: string[] = [];
      for (const id of remaining) {
        if ((deg.get(id) || 0) === 0) layer.push(id);
      }
      if (layer.length === 0) {
        // 有环，取剩余节点作为最后一层
        layers.push([...remaining]);
        break;
      }
      layers.push(layer);
      for (const id of layer) {
        remaining.delete(id);
        for (const e of outEdges.get(id) || []) {
          deg.set(e.target, (deg.get(e.target) || 1) - 1);
        }
      }
    }

    // 分配坐标
    const newPositions = new Map<string, { x: number; y: number }>();
    let x = 100;
    for (let li = 0; li < layers.length; li++) {
      const layer = layers[li];
      const y0 = 100;
      let y = y0;
      for (let ni = 0; ni < layer.length; ni++) {
        newPositions.set(layer[ni], { x: snap(x), y: snap(y) });
        y += NODE_H + GAP_Y;
      }
      x += NODE_W + GAP_X;
    }

    setNodes((nds) => nds.map((n) => {
      if (!layoutNodeSet.has(n.id)) return n;
      const pos = newPositions.get(n.id);
      return pos ? { ...n, position: pos } : n;
    }));

    // 布局后 fitView
    setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
  }, [nodes, edges, setNodes, snap, fitView]);

  // 校验
  const doValidate = useCallback(() => {
    const draft = syncToDraft();
    const result = validateWorkflow(draft);
    setValidation(result);
  }, [syncToDraft]);

  // 编译
  // MVP v2: param change handler
  const handleParamChange = React.useCallback((nodeId: string, params: Record<string, unknown>) => {
    setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, params } } : n));
  }, [setNodes]);

  const buildWorkflowJobPayload = React.useCallback(() => {
    if (!compiledWorkflow) return null;
    const draft = syncToDraft();
    const nodeParamsById = Object.fromEntries(draft.nodes.map((n) => [n.id, n.params]));
    const { payload, unsupported } = buildRuntimePayloadFromDraft({
      draftName: currentDraft.name,
      steps: compiledWorkflow.steps.map((s) => ({
        order: s.order,
        label: s.label,
        nodeType: s.nodeType,
        nodeId: s.nodeId,
        outputs: s.outputs,
        dependencies: s.dependencies,
      })),
      nodeParamsById,
    });
    if (unsupported.length > 0) {
      return {
        __error: `这些节点暂不支持真实执行：${unsupported.join('，')}。请仅保留可执行节点（YOLO/SAM/分类验证/追踪）。`,
      } as any;
    }
    return payload;
  }, [compiledWorkflow, syncToDraft, currentDraft.name]);

  const pickFirstId = React.useCallback((data: any, keys: string[]) => {
    const candidates = [
      ...(Array.isArray(data) ? data : []),
      ...(Array.isArray(data?.items) ? data.items : []),
      ...(Array.isArray(data?.list) ? data.list : []),
      ...(Array.isArray(data?.rows) ? data.rows : []),
      ...(Array.isArray(data?.experiments) ? data.experiments : []),
      ...(Array.isArray(data?.datasets) ? data.datasets : []),
      ...(Array.isArray(data?.segmentations) ? data.segmentations : []),
      ...(Array.isArray(data?.handoffs) ? data.handoffs : []),
      ...(Array.isArray(data?.results) ? data.results : []),
    ];
    for (const row of candidates) {
      for (const k of keys) {
        const v = row?.[k];
        if (v !== undefined && v !== null && String(v).trim()) return String(v);
      }
    }
    return '';
  }, []);

  const resolveDemoRefsInPayload = React.useCallback(async (payload: any) => {
    const steps = Array.isArray(payload?.steps) ? payload.steps : [];
    const needExp = steps.some((s: any) => String(s?.params?.experiment_id || '').startsWith('demo_'));
    const needDs = steps.some((s: any) => String(s?.params?.dataset_id || '').startsWith('demo_'));
    const needSeg = steps.some((s: any) => String(s?.params?.segmentation_id || '').startsWith('demo_'));
    const needHandoff = steps.some((s: any) => String(s?.params?.handoff_id || '').startsWith('demo_'));

    const cache: Record<string, string> = {};
    const tryFetch = async (url: string, keys: string[]) => {
      try {
        const r = await fetch(url);
        if (!r.ok) return '';
        const d = await r.json();
        return pickFirstId(d, keys);
      } catch {
        return '';
      }
    };

    if (needExp) cache.experiment_id = await tryFetch('/api/experiments?limit=1', ['id', 'experiment_id']);
    if (needDs) cache.dataset_id = await tryFetch('/api/datasets?limit=1', ['id', 'dataset_id']);
    if (needSeg) cache.segmentation_id = await tryFetch('/api/sam-segmentations?limit=1', ['segmentation_id', 'id']);
    if (needHandoff) cache.handoff_id = await tryFetch('/api/sam-handoffs?limit=1', ['handoff_id', 'id']);

    const missing: string[] = [];
    const resolvedSteps = steps.map((s: any) => {
      const params = { ...(s.params || {}) };
      for (const key of ['experiment_id', 'dataset_id', 'segmentation_id', 'handoff_id'] as const) {
        const raw = String(params[key] || '');
        if (raw.startsWith('demo_')) {
          const actual = cache[key] || '';
          if (actual) params[key] = actual;
          else missing.push(key);
        }
      }
      return { ...s, params };
    });

    if (missing.length > 0) {
      return {
        __error: `运行前自动补全失败：缺少可用资源 ${Array.from(new Set(missing)).join('、')}。请先在系统里创建对应资源。`,
      };
    }

    return { ...payload, steps: resolvedSteps };
  }, [pickFirstId]);

  const clearRunStateOnNodes = useCallback(() => {
    setNodes((nds) => nds.map((n) => ({
      ...n,
      data: {
        ...n.data,
        runStatus: undefined,
        runProgress: undefined,
        runMessage: undefined,
        runStepKey: undefined,
        runStepOrder: undefined,
        issueLevel: undefined,
        issueCount: 0,
        issueText: undefined,
        issueTrend: undefined,
        issueHistory: Array.isArray(n.data?.issueHistory) ? n.data.issueHistory : [],
      },
    })));
  }, [setNodes]);

  type EntityRef = { key: string; value: string; path: string };
  const ENTITY_PATH_BY_KEY: Record<string, string> = {
    dataset_id: '/datasets',
    experiment_id: '/training',
    model_id: '/models',
    evaluation_id: '/evaluations',
    report_id: '/evaluations',
    artifact_id: '/artifacts',
    job_id: '/workflow-jobs',
    workflow_job_id: '/workflow-jobs',
    deployment_id: '/deployments',
    revision_id: '/deployments',
    rollback_point_id: '/deployments',
  };

  const collectEntityRefs = useCallback((...sources: any[]): EntityRef[] => {
    const out: EntityRef[] = [];
    const seen = new Set<string>();
    const pushRef = (key: string, value: any) => {
      const k = String(key || '').trim();
      const v = String(value ?? '').trim();
      if (!k || !v || !ENTITY_PATH_BY_KEY[k]) return;
      const dedup = `${k}:${v}`;
      if (seen.has(dedup)) return;
      seen.add(dedup);
      out.push({ key: k, value: v, path: ENTITY_PATH_BY_KEY[k] });
    };
    for (const src of sources) {
      if (!src || typeof src !== 'object') continue;
      for (const [k, v] of Object.entries(src)) {
        if (ENTITY_PATH_BY_KEY[k]) pushRef(k, v);
      }
      const refs = (src as any).refs;
      if (refs && typeof refs === 'object') {
        for (const [k, v] of Object.entries(refs)) pushRef(k, v);
      }
      const output = (src as any).output;
      if (output && typeof output === 'object') {
        for (const [k, v] of Object.entries(output)) {
          if (ENTITY_PATH_BY_KEY[k]) pushRef(k, v);
        }
      }
    }
    return out;
  }, []);

  const goEntity = useCallback((ref: EntityRef) => {
    navigate(ref.path);
  }, [navigate]);

  const focusNodeFromDryRun = useCallback((hint?: { nodeId?: string; node_id?: string; stepOrder?: number; step_order?: number }) => {
    const order = Number(hint?.stepOrder ?? hint?.step_order);
    const nodeId = String(hint?.nodeId || hint?.node_id || '') || (Number.isFinite(order) ? stepNodeMapRef.current.get(order) : undefined);
    if (!nodeId) return;
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setSelectedNodes([nodeId]);
    setSelectedEdges([]);
    setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === nodeId })));
    const width = Number(node.width || (node.style as any)?.width || 260);
    const height = Number(node.height || (node.style as any)?.height || 180);
    const centerX = node.position.x + width / 2;
    const centerY = node.position.y + height / 2;
    void setCenter(centerX, centerY, { zoom: Math.max(1.05, viewport.zoom), duration: 280 });
  }, [nodes, setCenter, setNodes, setSelectedEdges, setSelectedNodes, viewport.zoom]);

  const applyDryRunStateToNodes = useCallback((result: {
    stepResults?: Array<{ stepOrder?: number; step_order?: number; status?: string; stepName?: string; step_name?: string; stepKey?: string; step_key?: string; nodeId?: string; node_id?: string; envelope?: { status?: string; step_key?: string; step_order?: number; node_id?: string; output?: any; error?: { message?: string } | null } }>;
    errors?: Array<{ nodeId?: string; node_id?: string; stepOrder?: number; step_order?: number }>;
    warnings?: Array<{ nodeId?: string; node_id?: string; stepOrder?: number; step_order?: number }>;
  }) => {
    const runtimeByNode = new Map<string, { status: string; message: string; progress: number; stepKey?: string; stepOrder?: number }>();
    const issuesByNode = new Map<string, { errorCount: number; warnCount: number; messages: string[] }>();
    const pushIssue = (nodeId: string, level: 'error' | 'warning', message: string) => {
      const prev = issuesByNode.get(nodeId) || { errorCount: 0, warnCount: 0, messages: [] };
      if (level === 'error') prev.errorCount += 1;
      else prev.warnCount += 1;
      const tagged = `${level === 'error' ? '[E]' : '[W]'} ${message || (level === 'error' ? 'Dry-Run error' : 'Dry-Run warning')}`;
      if (prev.messages.length < 3 && !prev.messages.includes(tagged)) prev.messages.push(tagged);
      issuesByNode.set(nodeId, prev);
    };
    const rows = Array.isArray(result?.stepResults) ? result.stepResults : [];
    const total = rows.length || 1;
    let done = 0;
    for (const r of rows) {
      const raw = String(r?.envelope?.status || r?.status || '').toLowerCase();
      if (['ok', 'success', 'mock', 'warning', 'blocked', 'error', 'failed'].includes(raw)) done++;
      const order = Number(r?.envelope?.step_order ?? r?.stepOrder ?? r?.step_order);
      const nodeId = String(r?.envelope?.node_id || r?.nodeId || r?.node_id || '') || stepNodeMapRef.current.get(order);
      if (!nodeId) continue;
      let status = 'pending';
      if (raw === 'blocked') status = 'blocked';
      else if (raw === 'warning') status = 'blocked';
      else if (raw === 'error' || raw === 'failed') status = 'failed';
      else if (raw === 'ok' || raw === 'success' || raw === 'mock') status = 'success';
      runtimeByNode.set(nodeId, {
        status,
        message: String(r?.stepName || r?.step_name || r?.envelope?.step_key || r?.stepKey || r?.step_key || ''),
        progress: Math.round((done / total) * 100),
        stepKey: String(r?.envelope?.step_key || r?.stepKey || r?.step_key || ''),
        stepOrder: order,
      });
      if (raw === 'warning' || raw === 'blocked') pushIssue(nodeId, 'warning', String(r?.envelope?.error?.message || r?.stepName || r?.step_key || 'Dry-Run warning'));
      if (raw === 'error' || raw === 'failed') pushIssue(nodeId, 'error', String(r?.envelope?.error?.message || r?.stepName || r?.step_key || 'Dry-Run error'));
    }

    const hardErrors = Array.isArray(result?.errors) ? result.errors : [];
    for (const e of hardErrors) {
      const order = Number(e?.stepOrder ?? e?.step_order);
      const nodeId = String(e?.nodeId || e?.node_id || '') || stepNodeMapRef.current.get(order);
      if (!nodeId) continue;
      pushIssue(nodeId, 'error', 'Dry-Run 错误');
      runtimeByNode.set(nodeId, {
        status: 'failed',
        message: 'Dry-Run 错误',
        progress: 100,
        stepOrder: order,
      });
    }
    const hardWarnings = Array.isArray(result?.warnings) ? result.warnings : [];
    for (const w of hardWarnings) {
      const order = Number(w?.stepOrder ?? w?.step_order);
      const nodeId = String(w?.nodeId || w?.node_id || '') || stepNodeMapRef.current.get(order);
      if (!nodeId) continue;
      pushIssue(nodeId, 'warning', 'Dry-Run 警告');
      if (!runtimeByNode.has(nodeId)) {
        runtimeByNode.set(nodeId, {
          status: 'blocked',
          message: 'Dry-Run 警告',
          progress: 100,
          stepOrder: order,
        });
      }
    }

    setNodes((nds) => nds.map((n) => {
      const rt = runtimeByNode.get(n.id);
      const issue = issuesByNode.get(n.id);
      const issueCount = issue ? issue.errorCount + issue.warnCount : 0;
      const issueLevel = issue && issue.errorCount > 0 ? 'error' : issue && issue.warnCount > 0 ? 'warning' : undefined;
      const issueText = issue && issue.messages.length > 0 ? issue.messages.join(' | ') : undefined;
      const prevHistory = Array.isArray(n.data?.issueHistory) ? n.data.issueHistory.filter((v: unknown) => Number.isFinite(Number(v))).map((v: unknown) => Number(v)) : [];
      const historyWindow = [...prevHistory, issueCount].slice(-5);
      const baselineSlice = historyWindow.slice(0, Math.max(0, historyWindow.length - 1));
      const baselineAvg = baselineSlice.length > 0 ? baselineSlice.reduce((a, b) => a + b, 0) / baselineSlice.length : issueCount;
      const delta = issueCount - baselineAvg;
      const issueTrend = delta > 0.35 ? 'up' : delta < -0.35 ? 'down' : 'same';
      if (!rt) return n;
      return {
        ...n,
        data: {
          ...n.data,
          runStatus: rt.status,
          runProgress: rt.progress,
          runMessage: rt.message,
          runStepKey: rt.stepKey,
          runStepOrder: rt.stepOrder,
          onFocusDryRunStep: focusDryRunStepSafe,
          issueLevel,
          issueCount,
          issueText,
          issueTrend,
          issueHistory: historyWindow,
        },
      };
    }));
  }, [setNodes, focusDryRunStepSafe]);

  const applyJobStepStateToNodes = useCallback((steps: any[] = []) => {
    if (!steps.length) return;
    const total = steps.length;
    const done = steps.filter((s: any) => ['success', 'succeeded', 'failed', 'skipped', 'cancelled'].includes(String(s.status || '').toLowerCase())).length;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;

    const runtimeByNode = new Map<string, { status: string; message: string; progress: number; stepKey?: string; stepOrder?: number }>();
    for (const s of steps) {
      const order = Number(s.step_order);
      const nodeId = stepNodeMapRef.current.get(order);
      if (!nodeId) continue;
      const raw = String(s.status || '').toLowerCase();
      let status = 'pending';
      if (raw === 'running' || raw === 'retrying') status = 'running';
      else if (raw === 'success' || raw === 'succeeded') status = 'success';
      else if (raw === 'failed') status = 'failed';
      else if (raw === 'blocked') status = 'blocked';
      else if (raw === 'skipped' || raw === 'cancelled') status = 'skipped';
      runtimeByNode.set(nodeId, {
        status,
        message: s.step_name || s.step_key || '',
        progress: percent,
        stepKey: String(s.step_key || ''),
        stepOrder: Number(s.step_order || 0),
      });
    }

    setNodes((nds) => nds.map((n) => {
      const rt = runtimeByNode.get(n.id);
      if (!rt) return n;
      return {
        ...n,
        data: {
          ...n.data,
          runStatus: rt.status,
          runProgress: rt.progress,
          runMessage: rt.message,
          runStepKey: rt.stepKey,
          runStepOrder: rt.stepOrder,
          onFocusDryRunStep: focusDryRunStepSafe,
        },
      };
    }));
  }, [setNodes, focusDryRunStepSafe]);

  // MVP P0: dry-run submit handler
  const handleDryRunSubmit = React.useCallback(async () => {
    if (!compiledWorkflow) return;
    const validation = dryRunValidate(compiledWorkflow);
    if (!validation.ok) {
      alert('请先修复编译错误：' + validation.errors.map(e => e.message).join('; '));
      return;
    }
    setDryRunLoading(true);
    setDryRunSubmitResult(null);
    clearRunStateOnNodes();
    try {
      if (compiledWorkflow?.steps?.length) {
        stepNodeMapRef.current = new Map(compiledWorkflow.steps.map((s: any) => [Number(s.order), String(s.nodeId)]));
      } else {
        stepNodeMapRef.current = new Map();
      }
      // Build payload from compiled workflow
      const payloadRaw = buildWorkflowJobPayload();
      const payload = payloadRaw ? await resolveDemoRefsInPayload(payloadRaw) : payloadRaw;
      if (!payload) return;
      if ((payload as any).__error) {
        setDryRunSubmitResult({
          ok: false,
          execution_mode: 'dry-run',
          summary: { totalSteps: 0, successSteps: 0, failedSteps: 0, blockedSteps: 0 },
          stepResults: [],
          errors: [{ code: 'UNSUPPORTED_STEP', message: String((payload as any).__error) }],
          warnings: [],
          metadata: { template_name: 'unknown', executed_at: new Date().toISOString() },
        } as any);
        return;
      }
      const resp = await fetch('/api/workflow-templates/dry-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload, execution_mode: 'dry-run' }),
      });
      const data = await resp.json();
      setDryRunSubmitResult(data);
      applyDryRunStateToNodes(data as Parameters<typeof applyDryRunStateToNodes>[0]);
    } catch (err) {
      const failed = {
        ok: false,
        execution_mode: 'dry-run',
        summary: { totalSteps: 0, successSteps: 0, failedSteps: 0, blockedSteps: 0 },
        stepResults: [],
        errors: [{ code: 'NETWORK_ERROR', message: String(err) }],
        warnings: [],
        metadata: { template_name: 'unknown', executed_at: new Date().toISOString() },
      };
      setDryRunSubmitResult(failed);
      applyDryRunStateToNodes(failed as Parameters<typeof applyDryRunStateToNodes>[0]);
    } finally {
      setDryRunLoading(false);
    }
  }, [compiledWorkflow, dryRunValidate, buildWorkflowJobPayload, resolveDemoRefsInPayload, clearRunStateOnNodes, applyDryRunStateToNodes]);

  const handleRunWorkflow = React.useCallback(async () => {
    if (!compiledWorkflow) {
      setRunResult({ ok: false, message: '请先点击“编译”生成可运行流程' });
      return;
    }
    const validation = dryRunValidate(compiledWorkflow);
    if (!validation.ok) {
      setRunResult({ ok: false, message: '流程校验未通过，请先修复错误' });
      return;
    }
    const payloadRaw = buildWorkflowJobPayload();
    const payload = payloadRaw ? await resolveDemoRefsInPayload(payloadRaw) : payloadRaw;
    if (!payload) return;
    if ((payload as any).__error) {
      setRunResult({ ok: false, message: String((payload as any).__error) });
      return;
    }

    setRunLoading(true);
    setRunResult(null);
    clearRunStateOnNodes();
    try {
      if (compiledWorkflow?.steps?.length) {
        stepNodeMapRef.current = new Map(compiledWorkflow.steps.map((s: any) => [Number(s.order), String(s.nodeId)]));
      } else {
        stepNodeMapRef.current = new Map();
      }
      const createResp = await fetch('/api/workflow-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const createData = await createResp.json();
      if (!createResp.ok || !createData?.ok || !createData?.job?.id) {
        throw new Error(createData?.error || `create failed: ${createResp.status}`);
      }

      const jobId = String(createData.job.id);
      const startResp = await fetch(`/api/workflow-jobs/${jobId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      const startData = await startResp.json();
      if (!startResp.ok || startData?.ok === false) {
        throw new Error(startData?.error || `start failed: ${startResp.status}`);
      }

      setActiveJobId(jobId);
      setRunResult({ ok: true, message: '已启动工作流任务', jobId });
    } catch (err) {
      setActiveJobId(null);
      setRunResult({ ok: false, message: `运行失败: ${String(err)}` });
    } finally {
      setRunLoading(false);
    }
  }, [compiledWorkflow, dryRunValidate, buildWorkflowJobPayload, resolveDemoRefsInPayload, clearRunStateOnNodes]);

  React.useEffect(() => {
    if (!activeJobId) return;
    let disposed = false;

    const poll = async () => {
      try {
        const resp = await fetch(`/api/workflow-jobs/${activeJobId}`);
        const data = await resp.json();
        const job = data?.job;
        if (!job) return;
        applyJobStepStateToNodes(Array.isArray(job.steps) ? job.steps : []);
        const status = String(job.status || '').toLowerCase();
        if (['completed', 'failed', 'cancelled'].includes(status)) {
          if (!disposed) {
            setActiveJobId(null);
            setRunResult((prev) => prev?.jobId === activeJobId ? {
              ok: status === 'completed',
              jobId: activeJobId,
              message: status === 'completed' ? '工作流执行完成' : `工作流已结束: ${status}`,
            } : prev);
          }
        }
      } catch {}
    };

    poll();
    const timer = setInterval(poll, 1200);
    return () => {
      disposed = true;
      clearInterval(timer);
    };
  }, [activeJobId, applyJobStepStateToNodes]);

  // P5: 暂停运行
  const handlePauseJob = React.useCallback(async () => {
    if (!activeJobId) return;
    try {
      const resp = await fetch(`/api/workflow-jobs/${activeJobId}/pause`, { method: 'POST' });
      if (resp.ok) {
        setRunResult((prev) => prev?.jobId === activeJobId ? { ...prev, message: '⏸ 已暂停' } : prev);
      }
    } catch (err) {
      console.error('Pause failed:', err);
    }
  }, [activeJobId]);

  // P5: 恢复运行
  const handleResumeJob = React.useCallback(async () => {
    if (!activeJobId) return;
    try {
      const resp = await fetch(`/api/workflow-jobs/${activeJobId}/resume`, { method: 'POST' });
      if (resp.ok) {
        setRunResult((prev) => prev?.jobId === activeJobId ? { ...prev, message: '▶ 已恢复' } : prev);
      }
    } catch (err) {
      console.error('Resume failed:', err);
    }
  }, [activeJobId]);

  // P5: 取消运行
  const handleCancelJob = React.useCallback(async () => {
    if (!activeJobId) return;
    try {
      const resp = await fetch(`/api/workflow-jobs/${activeJobId}/cancel`, { method: 'POST' });
      if (resp.ok) {
        setRunResult((prev) => prev?.jobId === activeJobId ? { ...prev, message: '✕ 已取消' } : prev);
        setActiveJobId(null);
      }
    } catch (err) {
      console.error('Cancel failed:', err);
    }
  }, [activeJobId]);

  // P5: 节点级重试（整个 job 从失败节点重试）
  const handleRetryFailedNode = React.useCallback(async (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const stepKey = node.data?.stepKey || node.data?.nodeType;
    if (!stepKey) return;

    const payloadRaw = buildWorkflowJobPayload();
    const payload = payloadRaw ? await resolveDemoRefsInPayload(payloadRaw) : payloadRaw;
    if (!payload) return;

    setRunLoading(true);
    clearRunStateOnNodes();
    try {
      if (compiledWorkflow?.steps?.length) {
        stepNodeMapRef.current = new Map(compiledWorkflow.steps.map((s: any) => [Number(s.order), String(s.nodeId)]));
      }
      const partialPayload = { ...payload, start_step: stepKey };
      const createResp = await fetch('/api/workflow-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partialPayload),
      });
      const createData = await createResp.json();
      const jobId = createData?.job?.id;
      if (!jobId) throw new Error('Failed to create retry job');
      const startResp = await fetch(`/api/workflow-jobs/${jobId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      if (!startResp.ok) throw new Error('Failed to start retry job');
      setActiveJobId(jobId);
      setRunResult({ ok: true, jobId, message: `重试 ${stepKey}` });
    } catch (err) {
      setRunResult({ ok: false, message: String(err) });
      setRunLoading(false);
    }
  }, [nodes, compiledWorkflow, buildWorkflowJobPayload, resolveDemoRefsInPayload, clearRunStateOnNodes]);

  // P5: 查看运行日志（跳转到日志页）
  const handleShowJobLogs = React.useCallback(() => {
    if (!activeJobId) return;
    window.open(`/workflow-runs?job=${activeJobId}`, '_blank');
  }, [activeJobId]);

  // P3: 单节点 Dry-Run
  const handleDryRunSingleNode = React.useCallback(async (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const stepKey = node.data?.stepKey || node.data?.nodeType;
    if (!stepKey) return;

    setDryRunLoading(true);
    clearRunStateOnNodes();
    try {
      const payloadRaw = buildWorkflowJobPayload();
      const payload = payloadRaw ? await resolveDemoRefsInPayload(payloadRaw) : payloadRaw;
      if (!payload) return;

      // 只运行指定 step
      const partialPayload = { ...payload, start_step: stepKey, end_step: stepKey };
      const resp = await fetch('/api/workflow-templates/dry-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: partialPayload, execution_mode: 'dry-run' }),
      });
      const data = await resp.json();
      setDryRunSubmitResult(data);
      applyDryRunStateToNodes(data as Parameters<typeof applyDryRunStateToNodes>[0]);
    } catch (err) {
      console.error('Single node dry-run failed:', err);
    } finally {
      setDryRunLoading(false);
    }
  }, [nodes, buildWorkflowJobPayload, resolveDemoRefsInPayload, clearRunStateOnNodes, applyDryRunStateToNodes]);

  // P3: 从某节点继续运行
  const handleRunFromNode = React.useCallback(async (nodeId: string) => {
    if (!compiledWorkflow) {
      setRunResult({ ok: false, message: '请先编译' });
      return;
    }
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const stepKey = node.data?.stepKey || node.data?.nodeType;
    if (!stepKey) return;

    const payloadRaw = buildWorkflowJobPayload();
    const payload = payloadRaw ? await resolveDemoRefsInPayload(payloadRaw) : payloadRaw;
    if (!payload) return;

    setRunLoading(true);
    setRunResult(null);
    clearRunStateOnNodes();
    try {
      if (compiledWorkflow?.steps?.length) {
        stepNodeMapRef.current = new Map(compiledWorkflow.steps.map((s: any) => [Number(s.order), String(s.nodeId)]));
      } else {
        stepNodeMapRef.current = new Map();
      }
      const partialPayload = { ...payload, start_step: stepKey };
      const createResp = await fetch('/api/workflow-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partialPayload),
      });
      const createData = await createResp.json();
      const jobId = createData?.job?.id;
      if (!jobId) throw new Error('Failed to create job');
      const startResp = await fetch(`/api/workflow-jobs/${jobId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      if (!startResp.ok) throw new Error('Failed to start job');
      setActiveJobId(jobId);
      setRunResult({ ok: true, jobId, message: `从 ${stepKey} 开始运行` });
    } catch (err) {
      setRunResult({ ok: false, message: String(err) });
      setRunLoading(false);
    }
  }, [compiledWorkflow, nodes, buildWorkflowJobPayload, resolveDemoRefsInPayload, clearRunStateOnNodes]);

  // P3: 只运行选中子链
  const handleRunSelectedSubchain = React.useCallback(async () => {
    if (selectedNodes.length === 0) return;
    if (!compiledWorkflow) {
      setRunResult({ ok: false, message: '请先编译' });
      return;
    }

    // 计算选中节点的 step 顺序范围
    const selectedNodeSet = new Set(selectedNodes);
    const selectedSteps = compiledWorkflow.steps.filter((s: any) => selectedNodeSet.has(s.nodeId));
    if (selectedSteps.length === 0) return;

    const orders = selectedSteps.map((s: any) => Number(s.order)).filter(o => Number.isFinite(o));
    const minOrder = Math.min(...orders);
    const maxOrder = Math.max(...orders);
    const startStep = selectedSteps.find((s: any) => Number(s.order) === minOrder)?.nodeType;
    const endStep = selectedSteps.find((s: any) => Number(s.order) === maxOrder)?.nodeType;
    if (!startStep || !endStep) return;

    const payloadRaw = buildWorkflowJobPayload();
    const payload = payloadRaw ? await resolveDemoRefsInPayload(payloadRaw) : payloadRaw;
    if (!payload) return;

    setRunLoading(true);
    setRunResult(null);
    clearRunStateOnNodes();
    try {
      if (compiledWorkflow?.steps?.length) {
        stepNodeMapRef.current = new Map(compiledWorkflow.steps.map((s: any) => [Number(s.order), String(s.nodeId)]));
      } else {
        stepNodeMapRef.current = new Map();
      }
      const partialPayload = { ...payload, start_step: startStep, end_step: endStep };
      const createResp = await fetch('/api/workflow-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partialPayload),
      });
      const createData = await createResp.json();
      const jobId = createData?.job?.id;
      if (!jobId) throw new Error('Failed to create job');
      const startResp = await fetch(`/api/workflow-jobs/${jobId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      if (!startResp.ok) throw new Error('Failed to start job');
      setActiveJobId(jobId);
      setRunResult({ ok: true, jobId, message: `子链运行: ${startStep} → ${endStep}` });
    } catch (err) {
      setRunResult({ ok: false, message: String(err) });
      setRunLoading(false);
    }
  }, [selectedNodes, compiledWorkflow, buildWorkflowJobPayload, resolveDemoRefsInPayload, clearRunStateOnNodes]);

  // P3: 定位第一个失败节点
  const focusFirstFailedNode = React.useCallback(() => {
    const failedNode = nodes.find(n => n.data?.runStatus === 'failed' || n.data?.issueLevel === 'error');
    if (!failedNode) return;
    setSelectedNodes([failedNode.id]);
    setCenter(failedNode.position.x + 130, failedNode.position.y + 90, { zoom: 1.2, duration: 300 });
  }, [nodes, setCenter]);

  const doCompile = useCallback(() => {
    const draft = syncToDraft();
    const compiled = compileWorkflow(draft);
    const dryRun = dryRunValidate(compiled);
    setCompiledWorkflow(compiled);
    setDryRunResult(dryRun);
    setShowCompilePanel(true);
  }, [syncToDraft]);

  // 保存
  const handleSave = useCallback(() => {
    const draft = syncToDraft();
    saveDraft(draft);
    clearRecoveryDraft();
    setCurrentDraft(draft);
    setDrafts(listDrafts());
    pushHistory(draft);
  }, [syncToDraft, pushHistory]);

  // 新建
  const handleNew = useCallback(() => {
    const draft = newDraft();
    setCurrentDraft(draft);
    syncToReactFlow(draft);
    setValidation({ ok: true, errors: [], warnings: [] });
    pushHistory(draft);
    setActiveJobId(null);
    setRunResult(null);
  }, [syncToReactFlow, pushHistory]);

  // 加载草稿
  const handleLoadDraft = useCallback((name: string) => {
    const draft = loadDraft(name);
    if (draft) {
      setCurrentDraft(draft);
      syncToReactFlow(draft);
      setShowDraftList(false);
      pushHistory(draft);
    }
  }, [syncToReactFlow, pushHistory]);

  // 删除草稿
  const handleDeleteDraft = useCallback((name: string) => {
    deleteDraft(name);
    setDrafts(listDrafts());
  }, []);

  // 导出
  const handleExport = useCallback(() => {
    const draft = syncToDraft();
    const data = JSON.stringify(draft, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${draft.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [syncToDraft]);

  // 导入
  const handleImport = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const draft = JSON.parse(e.target?.result as string) as WorkflowDraft;
        setCurrentDraft(draft);
        syncToReactFlow(draft);
        pushHistory(draft);
      } catch {
        alert('导入失败：无效的 JSON 文件');
      }
    };
    reader.readAsText(file);
  }, [syncToReactFlow, pushHistory]);

  // Phase 2A: 删除选中（节点或边）
  const deleteSelected = useCallback(() => {
    // 优先删除选中的边
    if (selectedEdges.length > 0) {
      setEdges(eds => eds.filter(e => !selectedEdges.includes(e.id)));
      setSelectedEdges([]);
      return;
    }
    // 删除选中的节点
    if (selectedNodes.length > 0) {
      setNodes(nds => nds.filter(n => !selectedNodes.includes(n.id)));
      setEdges(eds => eds.filter(e =>
        !selectedNodes.includes(e.source) && !selectedNodes.includes(e.target)
      ));
      setSelectedNodes([]);
    }
  }, [selectedNodes, selectedEdges, setNodes, setEdges]);

  const handleUndo = useCallback(() => {
    const past = historyPastRef.current;
    if (past.length <= 1) return;
    const current = past[past.length - 1];
    const prev = past[past.length - 2];
    historyPastRef.current = past.slice(0, -1);
    historyFutureRef.current = [current, ...historyFutureRef.current].slice(0, 50);
    restoreDraftFromSerialized(prev);
  }, [restoreDraftFromSerialized]);

  const handleRedo = useCallback(() => {
    const future = historyFutureRef.current;
    if (!future.length) return;
    const next = future[0];
    historyFutureRef.current = future.slice(1);
    historyPastRef.current = [...historyPastRef.current, next].slice(-50);
    restoreDraftFromSerialized(next);
  }, [restoreDraftFromSerialized]);

  const quickFixDanglingEdges = useCallback(() => {
    const nodeIds = new Set(nodes.map((n) => n.id));
    setEdges((eds) => eds.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target)));
  }, [nodes, setEdges]);

  // 键盘快捷键
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if ((selectedNodes.length > 0 || selectedEdges.length > 0) && !e.shiftKey) {
          deleteSelected();
        }
      }
      if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
      }
      if (e.key.toLowerCase() === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if (((e.key.toLowerCase() === 'z' && e.shiftKey) || e.key.toLowerCase() === 'y') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleRedo();
      }
      if (e.key.toLowerCase() === 'd' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        duplicateSelected();
      }
      if (e.key.toLowerCase() === 'c' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        copySelected();
      }
      if (e.key.toLowerCase() === 'v' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        pasteFromClipboard();
      }
      if (e.key.toLowerCase() === 'g' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        groupSelectedNodes();
      }
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        doCompile();
      }
      if (e.key === 'ArrowLeft' && selectedNodes.length > 0) {
        e.preventDefault();
        nudgeSelected(-GRID, 0);
      }
      if (e.key === 'ArrowRight' && selectedNodes.length > 0) {
        e.preventDefault();
        nudgeSelected(GRID, 0);
      }
      if (e.key === 'ArrowUp' && selectedNodes.length > 0) {
        e.preventDefault();
        nudgeSelected(0, -GRID);
      }
      if (e.key === 'ArrowDown' && selectedNodes.length > 0) {
        e.preventDefault();
        nudgeSelected(0, GRID);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedNodes, selectedEdges, deleteSelected, handleSave, doCompile, duplicateSelected, copySelected, pasteFromClipboard, groupSelectedNodes, nudgeSelected, handleUndo, handleRedo]);

  // 自动校验
  React.useEffect(() => {
    const timer = setTimeout(doValidate, 500);
    return () => clearTimeout(timer);
  }, [nodes, edges, doValidate]);

  // 自动保存（防丢失）
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const draft = syncToDraft();
      setAutoSaveStatus('saving');
      saveRecoveryDraft(draft);
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 900);
    }, 1500);
    return () => clearTimeout(timer);
  }, [nodes, edges, currentDraft.name, currentDraft.description, syncToDraft]);

  // 历史栈（Undo/Redo）
  React.useEffect(() => {
    if (applyingHistoryRef.current) return;
    pushHistory(syncToDraft());
  }, [nodes, edges, currentDraft.name, currentDraft.description, pushHistory, syncToDraft]);

  // 编排自检（页面稳定性）
  React.useEffect(() => {
    const issues: string[] = [];
    const nodeIds = new Set(nodes.map((n) => n.id));
    const knownNodeTypes = new Set(Object.keys(NODE_REGISTRY));
    const unknown = nodes.filter((n) => {
      const t = String(n.data?.nodeType || '');
      return !(t.startsWith('plugin:') || t === 'comfyGroup' || knownNodeTypes.has(t));
    });
    if (unknown.length > 0) issues.push(`发现 ${unknown.length} 个未知节点类型`);
    const dangling = edges.filter((e) => !nodeIds.has(e.source) || !nodeIds.has(e.target));
    if (dangling.length > 0) issues.push(`发现 ${dangling.length} 条悬挂连线`);
    if (nodes.length > 0 && edges.length === 0) issues.push('仅有节点无连线，建议检查流程闭环');
    setHealthIssues(issues);
  }, [nodes, edges]);

  const dryRunReady = validation.errors.length === 0 && nodes.length > 0;

  // Phase 2A: 空画布引导组件
  const EmptyCanvasGuide = () => {
    if (nodes.length > 0) return null;
    return (
      <div className="empty-canvas-guide">
        <div className="empty-guide-content">
          <div className="empty-guide-icon">🎨</div>
          <div className="empty-guide-title">开始构建工作流</div>
          <div className="empty-guide-hints">
            <div className="empty-guide-hint">
              <span className="empty-guide-key">右键</span>
              <span>在画布空白处添加节点</span>
            </div>
            <div className="empty-guide-hint">
              <span className="empty-guide-key">双击</span>
              <span>快速搜索添加节点</span>
            </div>
            <div className="empty-guide-hint">
              <span className="empty-guide-key">顶部</span>
              <span>新建/导入/导出工作流</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="comfy-workspace" ref={reactFlowWrapper}>
      {/* 顶部工具栏 */}
      <div className="comfy-toolbar">
        <div className="toolbar-left">
          <h1 className="toolbar-title">Workflow Composer</h1>
          <span className="toolbar-badge">UI 2.0</span>
        </div>

        <div className="toolbar-center">
          <input
            type="text"
            className="draft-name-input"
            value={currentDraft.name}
            onChange={e => setCurrentDraft(d => ({ ...d, name: e.target.value }))}
            placeholder="未命名工作流"
          />
        </div>

        <div className="toolbar-right">
          <button className="toolbar-btn" onClick={handleNew} title="新建 (Ctrl+N)">
            <span>➕</span> 新建
          </button>
          <label className="toolbar-btn" title="快速模板">
            <span>🧩</span> 模板
            <select
              style={{ marginLeft: 6, background: '#0f0f0f', color: '#cbd5e1', border: '1px solid #334155', borderRadius: 6, padding: '2px 6px' }}
              defaultValue=""
              onChange={(e) => {
                const v = e.target.value as string;
                if (!v) return;
                if (v.startsWith('quick:')) applyQuickTemplate(v.replace('quick:', '') as QuickTemplateId);
                else if (v.startsWith('backend:')) applyBackendTemplate(v.replace('backend:', ''));
                e.currentTarget.value = '';
              }}
            >
              <option value="">选择</option>
              <optgroup label="快速模板">
                {QUICK_TEMPLATES.map((t) => <option key={t.id} value={`quick:${t.id}`}>{t.name}</option>)}
              </optgroup>
              <optgroup label="系统模板">
                {backendTemplates.map((t) => (
                  <option key={t.id} value={`backend:${t.id}`}>
                    {t.name || t.code || t.id}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>
          <button
            className="toolbar-btn"
            onClick={() => setShowDraftList(v => !v)}
            title="打开草稿"
          >
            <span>📂</span> 打开
          </button>
          <button className="toolbar-btn" onClick={handleSave} title="保存 (Ctrl+S)">
            <span>💾</span> 保存
          </button>
          <button className="toolbar-btn" onClick={handleUndo} title="撤销 (Ctrl+Z)">
            <span>↶</span> 撤销
          </button>
          <button className="toolbar-btn" onClick={handleRedo} title="重做 (Ctrl+Y / Ctrl+Shift+Z)">
            <span>↷</span> 重做
          </button>
          <div className="toolbar-divider" />
          <button
            className={`toolbar-btn ${showCompilePanel ? 'active' : ''}`}
            onClick={() => setShowCompilePanel(v => !v)}
            title="编译预览"
          >
            <span>📋</span> 预览
          </button>
          <button
            className="toolbar-btn toolbar-btn--primary"
            onClick={doCompile}
            title="编译 (Ctrl+Enter)"
          >
            <span>🔧</span> 编译
          </button>
          <button
            className={`toolbar-btn ${dryRunLoading ? 'toolbar-btn--loading' : ''}`}
            onClick={handleDryRunSubmit}
            disabled={!compiledWorkflow || dryRunLoading}
            title="Dry-Run 验证（不真实执行）"
          >
            <span>{dryRunLoading ? '⏳' : '▶'}</span> {dryRunLoading ? '验证中...' : 'Dry-Run'}
          </button>
          <button
            className={`toolbar-btn ${runLoading ? 'toolbar-btn--loading' : ''}`}
            onClick={handleRunWorkflow}
            disabled={!compiledWorkflow || runLoading}
            title="创建并启动工作流任务"
          >
            <span>{runLoading ? '⏳' : '🚀'}</span> {runLoading ? '运行中...' : '运行'}
          </button>
          <button className="toolbar-btn" onClick={handleExport} title="导出 JSON">
            <span>⬇</span> 导出
          </button>
          <label className="toolbar-btn" title="导入 JSON">
            <span>⬆</span> 导入
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={e => e.target.files?.[0] && handleImport(e.target.files[0])}
            />
          </label>
          <button className={`toolbar-btn ${isReadOnly ? 'active' : ''}`} onClick={() => setIsReadOnly(v => !v)} title="只读演示模式">
            <span>{isReadOnly ? '👁' : '🔒'}</span> {isReadOnly ? '演示' : '锁定'}
          </button>
          <button className="toolbar-btn" onClick={() => setShowHelp(true)} title="快捷键帮助">
            <span>⌨️</span> 帮助
          </button>
          <span style={{ marginLeft: 8, fontSize: 11, color: autoSaveStatus === 'saved' ? '#34d399' : '#94a3b8' }}>
            {autoSaveStatus === 'saving' ? '自动保存中...' : autoSaveStatus === 'saved' ? '已自动保存' : '自动保存待命'}
          </span>
        </div>
      </div>

      {runResult && (
        <div style={{ margin: '8px 12px 0', padding: '8px 10px', border: runResult.ok ? '1px solid rgba(16,185,129,.35)' : '1px solid rgba(239,68,68,.35)', borderRadius: 8, background: runResult.ok ? 'rgba(16,185,129,.08)' : 'rgba(239,68,68,.08)', color: runResult.ok ? '#6ee7b7' : '#fca5a5', fontSize: 12 }}>
          {runResult.message}{runResult.jobId ? `（Job: ${runResult.jobId}）` : ''}
          {runResult.jobId && (
            <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="dryrun-entity-chip"
                onClick={() => navigate('/workflow-jobs')}
                title="跳转到 Workflow Jobs 页面查看任务详情"
              >
                打开任务页: {runResult.jobId}
              </button>
            </div>
          )}
        </div>
      )}

      {healthIssues.length > 0 && (
        <div style={{ margin: '8px 12px 0', padding: '8px 10px', border: '1px solid rgba(234,179,8,.35)', borderRadius: 8, background: 'rgba(234,179,8,.08)', color: '#fde68a', fontSize: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <span>编排器自检：{healthIssues.join('；')}</span>
          <button type="button" className="toolbar-btn" style={{ border: '1px solid rgba(253,224,71,.35)', borderRadius: 6 }} onClick={quickFixDanglingEdges}>一键修复悬挂连线</button>
        </div>
      )}

      {/* 草稿列表面板 */}
      {showDraftList && (
        <div className="draft-list-panel">
          <div className="draft-list-header">
            <span>草稿列表</span>
            <button className="draft-list-close" onClick={() => setShowDraftList(false)}>✕</button>
          </div>
          {drafts.length === 0 ? (
            <div className="draft-list-empty">暂无保存的草稿</div>
          ) : (
            <div className="draft-list-items">
              {drafts.map(d => (
                <div key={d.id} className="draft-list-item">
                  <span className="draft-name" onClick={() => handleLoadDraft(d.id)}>{d.name}</span>
                  <button className="draft-delete" onClick={() => handleDeleteDraft(d.id)}>🗑</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 主画布区 */}
      <div className="comfy-canvas-area">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onPaneClick={(event: React.MouseEvent) => {
            setNodeContextOpen(false);
            setMultiContextOpen(false);
            setEdgeContextOpen(false);
            // 双击检测 — onPaneDoubleClick 不存在于 v12，用 onPaneClick + 计时器
            const now = Date.now();
            const el = event.currentTarget as HTMLElement;
            const lastClick = Number(el.dataset.lastPaneClick || 0);
            if (now - lastClick < 350) {
              // 双击
              const bounds = reactFlowWrapper.current?.getBoundingClientRect();
              if (!bounds) return;
              const x = event.clientX;
              const y = event.clientY;
              setSearchPosition({ x, y });
              setSearchModalOpen(true);
              el.dataset.lastPaneClick = '0';
            } else {
              el.dataset.lastPaneClick = String(now);
            }
          }}
          onPaneContextMenu={onPaneContextMenu}
          onNodeContextMenu={onNodeContextMenu}
          onEdgeContextMenu={onEdgeContextMenu}
          onSelectionChange={onSelectionChange}
          onNodeDragStop={onNodeDragStop}
          onMove={onMove}
          nodeTypes={NODE_TYPES}
          isValidConnection={(connection) => {
            if (!connection.source || !connection.target) return false;
            const result = validateConnection(nodes, edges, connection.source, connection.target, connection.sourceHandle, connection.targetHandle);
            return result.valid;
          }}
          connectionLineStyle={{ stroke: '#38BDF8', strokeWidth: 2 }}
          connectionLineType={ConnectionLineType.SmoothStep}
          onNodeClick={(_event, node) => { setSelectedNodes([node.id]); }}
          connectionMode={ConnectionMode.Strict}
          selectionMode={SelectionMode.Full}
          selectionOnDrag={!isReadOnly}
          panOnDrag={!isReadOnly}
          nodesDraggable={!isReadOnly}
          nodesConnectable={!isReadOnly}
          elementsSelectable={!isReadOnly}
          zoomOnDoubleClick={false}
          fitView
          minZoom={0.1}
          maxZoom={2}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
          }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#333"
          />
          <Controls className="comfy-controls" />
          <MiniMap
            className="comfy-minimap"
            nodeStrokeWidth={3}
            nodeColor={(node) => getNodeConfig(node.data?.nodeType as NodeType)?.color || '#666'}
          />
        </ReactFlow>

        {/* ComfyUI化 v1: F1 节点参数编辑侧边栏 */}
        {selectedNodes.length > 0 && (
          <div className="comfy-sidebar comfy-sidebar--params">
            <NodeParamPanel
              selectedNodeIds={selectedNodes}
              nodes={nodes}
              dryRunResult={dryRunSubmitResult}
              onParamChange={(nodeId, params) => {
                setNodes((nds) => nds.map((n) =>
                  n.id === nodeId
                    ? {
                        ...n,
                        data: {
                          ...n.data,
                          params,
                          ...(isWorkspaceNode(n) ? {
                            label: String((params as any)?.workspace_name || n.data?.label || '工作区'),
                            color: String((params as any)?.workspace_color || n.data?.color || '#38BDF8'),
                          } : {}),
                        },
                      }
                    : n
                ));
                // F4: 参数变化后立即重新计算就绪状态（用 setNodes 回调保证读取最新 nodes）
                setNodes((nds) => {
                  const readiness = computeAllNodesReadiness(nds, edges);
                  applyReadinessToNodes(nds, readiness);
                  return nds;
                });
              }}
            />
          </div>
        )}

        {/* Phase 2A: 空画布引导 */}
        <EmptyCanvasGuide />

        {/* 编译预览侧边栏 */}
        {showCompilePanel && (
          <div className="comfy-sidebar">
            <CompilePreviewPanel
              compiled={compiledWorkflow}
              dryRun={dryRunResult}
              onExportTemplate={() => {
                if (!compiledWorkflow) return;
                const data = JSON.stringify(compiledWorkflow, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${currentDraft.name}_compiled.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              onRecompile={doCompile}
            />
          </div>
        )}

        {/* MVP P0: Dry-Run 结果面板 */}
        {dryRunSubmitResult && (
          <div className="comfy-sidebar comfy-sidebar--dryrun">
            <div className="dryrun-panel">
              <div className="dryrun-header">
                <h3 className="dryrun-title">▶ Dry-Run 结果</h3>
                <button className="dryrun-close" onClick={() => setDryRunSubmitResult(null)}>✕</button>
              </div>

              {/* 总体状态 */}
              <div className={`dryrun-summary ${dryRunSubmitResult.ok ? 'dryrun-summary--ok' : 'dryrun-summary--fail'}`}>
                <span className="dryrun-status-icon">{dryRunSubmitResult.ok ? '✅' : '❌'}</span>
                <span className="dryrun-status-text">
                  {dryRunSubmitResult.ok ? 'Dry-Run 通过' : `Dry-Run 失败 (${dryRunSubmitResult.errors.length} 错误)`}
                </span>
              </div>

              {/* 步骤汇总 */}
              <div className="dryrun-stats">
                <div className="dryrun-stat"><span className="stat-value">{dryRunSubmitResult.summary.totalSteps}</span><span className="stat-label">总步骤</span></div>
                <div className="dryrun-stat"><span className="stat-value stat-ok">{dryRunSubmitResult.summary.successSteps}</span><span className="stat-label">成功</span></div>
                <div className="dryrun-stat"><span className="stat-value stat-fail">{dryRunSubmitResult.summary.failedSteps}</span><span className="stat-label">失败</span></div>
                <div className="dryrun-stat"><span className="stat-value stat-block">{dryRunSubmitResult.summary.blockedSteps}</span><span className="stat-label">阻断</span></div>
              </div>

              {/* 步骤结果列表 */}
              <div className="dryrun-steps">
                {dryRunSubmitResult.stepResults.map((sr) => (
                  <div
                    key={sr.stepOrder}
                    id={`${(sr.envelope?.step_key || sr.stepKey) ? `dryrun-step-${sr.envelope?.step_key || sr.stepKey}` : `dryrun-step-order-${sr.envelope?.step_order || sr.stepOrder}`}`}
                    className={`dryrun-step dryrun-step--${sr.envelope?.status || sr.status} ${(dryRunFocusedStepKey && (dryRunFocusedStepKey === String(sr.envelope?.step_key || sr.stepKey || '') || dryRunFocusedStepKey === `order:${sr.envelope?.step_order || sr.stepOrder}`)) ? 'dryrun-step--focused' : ''}`}
                    style={{ cursor: (sr.nodeId || sr.node_id || sr.stepOrder) ? 'pointer' : 'default' }}
                    onClick={() => { focusNodeFromDryRun(sr as any); focusDryRunStepSafe(sr.envelope?.step_key || sr.stepKey, sr.envelope?.step_order || sr.stepOrder); }}
                    title={(sr.nodeId || sr.node_id) ? '点击定位到对应节点' : '无节点定位信息'}
                  >
                    <div className="dryrun-step-header">
                      <span className="dryrun-step-order">#{sr.envelope?.step_order || sr.stepOrder}</span>
                      <span className="dryrun-step-name">{sr.stepName}</span>
                      <span className={`dryrun-step-badge dryrun-step-badge--${sr.envelope?.status || sr.status}`}>
                        {(sr.envelope?.status || sr.status) === 'ok' || (sr.envelope?.status || sr.status) === 'success' ? '✓' : (sr.envelope?.status || sr.status) === 'mock' ? '◎' : (sr.envelope?.status || sr.status) === 'blocked' ? '⏸' : (sr.envelope?.status || sr.status) === 'warning' ? '⚠' : '✗'}
                      </span>
                    </div>
                    <div className="dryrun-step-result">{sr.result || sr.envelope?.error?.message || ''}</div>
                    {(sr.blockedReason || sr.envelope?.error?.message) && <div className="dryrun-step-blocked">⚠️ {sr.blockedReason || sr.envelope?.error?.message}</div>}
                    {sr.checkedItems && sr.checkedItems.length > 0 && (
                      <div className="dryrun-check-items">
                        {sr.checkedItems.map((ci: any, cii: number) => (
                          <div key={cii} className={"dryrun-check-item dryrun-check-item--" + ci.status}>
                            <span className="check-badge">{ci.status === 'ok' ? '[OK]' : ci.status === 'warning' ? '[WARN]' : '[ERR]'}</span>
                            <span className="check-code">{ci.code}</span>
                            <span className="check-msg">{ci.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {collectEntityRefs(sr, sr.envelope, sr.envelope?.output).length > 0 && (
                      <div className="dryrun-entity-links">
                        {collectEntityRefs(sr, sr.envelope, sr.envelope?.output).map((ref) => (
                          <button
                            type="button"
                            key={`${ref.key}:${ref.value}`}
                            className="dryrun-entity-chip"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              goEntity(ref);
                            }}
                            title={`跳转到 ${ref.path}`}
                          >
                            {ref.key}: {ref.value}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 错误列表 */}
              {dryRunSubmitResult.errors && dryRunSubmitResult.errors.length > 0 && (
                <div className="dryrun-errors">
                  <div className="dryrun-section-title">❌ 错误</div>
                  {dryRunSubmitResult.errors.map((e, i) => (
                    (() => {
                      const issueId = `dryrun-error-${i}`;
                      return (
                    <div
                      key={issueId}
                      id={issueId}
                      className={`dryrun-error-item ${dryRunFocusedIssueKey === issueId ? 'dryrun-issue--focused' : ''}`}
                      style={{ cursor: (e.nodeId || e.node_id || e.stepOrder || e.step_order) ? 'pointer' : 'default' }}
                      onClick={() => {
                        focusNodeFromDryRun(e as any);
                        focusDryRunStepSafe(e.stepKey || e.step_key, e.stepOrder || e.step_order);
                        focusDryRunIssueSafe(issueId);
                      }}
                      title={(e.nodeId || e.node_id || e.stepOrder || e.step_order) ? '点击定位到对应节点' : '无节点定位信息'}
                    >
                      {e.code}: {e.message}{(e.nodeId || e.node_id) ? ` [node:${e.nodeId || e.node_id}]` : ''}{(e.stepOrder || e.step_order) ? ` [step:${e.stepOrder || e.step_order}]` : ''}
                    </div>
                      );
                    })()
                  ))}
                </div>
              )}

              {/* 警告列表 */}
              {dryRunSubmitResult.warnings && dryRunSubmitResult.warnings.length > 0 && (
                <div className="dryrun-warnings">
                  <div className="dryrun-section-title">⚠️ 警告</div>
                  {dryRunSubmitResult.warnings.map((w, i) => (
                    (() => {
                      const issueId = `dryrun-warning-${i}`;
                      return (
                    <div
                      key={issueId}
                      id={issueId}
                      className={`dryrun-warning-item ${dryRunFocusedIssueKey === issueId ? 'dryrun-issue--focused' : ''}`}
                      style={{ cursor: (w.nodeId || w.node_id || w.stepOrder || w.step_order) ? 'pointer' : 'default' }}
                      onClick={() => {
                        focusNodeFromDryRun(w as any);
                        focusDryRunStepSafe(w.stepKey || w.step_key, w.stepOrder || w.step_order);
                        focusDryRunIssueSafe(issueId);
                      }}
                      title={(w.nodeId || w.node_id || w.stepOrder || w.step_order) ? '点击定位到对应节点' : '无节点定位信息'}
                    >
                      {w.code}: {w.message}{(w.nodeId || w.node_id) ? ` [node:${w.nodeId || w.node_id}]` : ''}{(w.stepOrder || w.step_order) ? ` [step:${w.stepOrder || w.step_order}]` : ''}
                    </div>
                      );
                    })()
                  ))}
                </div>
              )}

              {/* 元数据 */}
              <div className="dryrun-meta">
                <small>模板: {dryRunSubmitResult.metadata.template_name} | 时间: {dryRunSubmitResult.metadata.executed_at}</small>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Phase 2A: 连线错误提示 */}
      {connectionError && (
        <div className="connection-error-toast">
          <span className="connection-error-icon">⚠️</span>
          <span>{connectionError}</span>
        </div>
      )}

      {/* 校验横幅 */}
      {validation.errors.length > 0 && (
        <ValidationBanner result={validation} />
      )}

      {/* 底部状态栏 */}
      <StatusBar
        nodeCount={nodes.length}
        edgeCount={edges.length}
        validationErrors={validation.errors.length}
        validationWarnings={validation.warnings.length}
        dryRunReady={dryRunReady}
        zoom={viewport.zoom}
        position={{ x: -viewport.x / viewport.zoom, y: -viewport.y / viewport.zoom }}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onFitView={fitView}
        activeJobId={activeJobId}
        runLoading={runLoading}
        runResult={runResult}
        onPause={handlePauseJob}
        onResume={handleResumeJob}
        onCancel={handleCancelJob}
        onShowLogs={handleShowJobLogs}
      />

      {/* 节点搜索弹窗（双击） */}
      <NodeSearchModal
        isOpen={searchModalOpen}
        position={searchPosition}
        onClose={() => setSearchModalOpen(false)}
        onSelect={onNodeSelectFromSearch}
      />

      {/* Phase 2A: 右键上下文菜单 */}
      <ContextMenu
        isOpen={contextMenuOpen}
        position={contextMenuPosition}
        onClose={() => setContextMenuOpen(false)}
        onSelect={onNodeSelectFromContextMenu}
      />

      <NodeContextMenu
        isOpen={nodeContextOpen}
        position={nodeContextPosition}
        title={(() => {
          const n = nodes.find((x) => x.id === nodeContextTargetId);
          return n ? String(n.data?.label || n.id) : '节点菜单';
        })()}
        onClose={() => setNodeContextOpen(false)}
        actions={nodeContextTargetId ? (() => {
          const targetNode = nodes.find((n) => n.id === nodeContextTargetId);
          const workspace = isWorkspaceNode(targetNode);
          if (workspace) {
            return [
              {
                key: 'duplicate',
                label: '复制工作区',
                onClick: () => duplicateNodeById(nodeContextTargetId),
              },
              {
                key: 'dissolve-workspace',
                label: '解散工作区（保留节点）',
                onClick: () => deleteNodeById(nodeContextTargetId),
              },
            ];
          }

          return [
            {
              key: 'duplicate',
              label: '复制节点',
              onClick: () => duplicateNodeById(nodeContextTargetId),
            },
            {
              key: 'toggle',
              label: nodes.find((n) => n.id === nodeContextTargetId)?.data?.collapsed ? '展开节点' : '折叠节点',
              onClick: () => toggleNodeCollapsed(nodeContextTargetId),
            },
            {
              key: 'disconnect',
              label: '清空该节点连线',
              onClick: () => clearNodeEdges(nodeContextTargetId),
            },
            {
              key: 'delete',
              label: '删除节点',
              danger: true,
              onClick: () => deleteNodeById(nodeContextTargetId),
            },
            {
              key: 'divider-p3',
              label: '───',
              onClick: () => {},
            },
            {
              key: 'dryrun-single',
              label: 'Dry-Run 此节点',
              onClick: () => handleDryRunSingleNode(nodeContextTargetId),
            },
            {
              key: 'run-from',
              label: '从此节点开始运行',
              onClick: () => handleRunFromNode(nodeContextTargetId),
            },
            {
              key: 'retry-node',
              label: '重试此节点',
              onClick: () => handleRetryFailedNode(nodeContextTargetId),
            },
          ];
        })() : []}
      />

      <NodeContextMenu
        isOpen={multiContextOpen}
        position={multiContextPosition}
        title={`已选 ${selectedNodes.length} 个节点`}
        onClose={() => setMultiContextOpen(false)}
        actions={[
          { key: 'copy', label: '复制', onClick: copySelected },
          { key: 'paste', label: '粘贴', onClick: pasteFromClipboard },
          { key: 'divider1', label: '───', onClick: () => {} },
          { key: 'align-left', label: '左对齐', onClick: alignSelectedLeft },
          { key: 'align-right', label: '右对齐', onClick: alignSelectedRight },
          { key: 'align-top', label: '上对齐', onClick: alignSelectedTop },
          { key: 'align-bottom', label: '底对齐', onClick: alignSelectedBottom },
          { key: 'dist-h', label: '水平等距', onClick: distributeSelectedHoriz },
          { key: 'dist-v', label: '垂直等距', onClick: distributeSelectedVert },
          { key: 'divider2', label: '───', onClick: () => {} },
          { key: 'add-group', label: '🗂 圈为工作区', onClick: () => handleAddGroup() },
          { key: 'auto-layout', label: '自动布局', onClick: autoLayout },
          { key: 'run-subchain', label: '运行选中子链', onClick: handleRunSelectedSubchain },
          { key: 'focus-failed', label: '定位失败节点', onClick: focusFirstFailedNode },
          { key: 'delete-all', label: '批量删除', danger: true, onClick: deleteSelectedNodes },
        ]}
      />

      <NodeContextMenu
        isOpen={edgeContextOpen}
        position={edgeContextPosition}
        title={`连线 ${edgeContextTargetId ? edgeContextTargetId.slice(0, 10) : ''}`}
        onClose={() => setEdgeContextOpen(false)}
        actions={edgeContextTargetId ? [
          { key: 'edge-delete', label: '删除该连线', danger: true, onClick: () => deleteEdgeById(edgeContextTargetId) },
          { key: 'edge-source', label: '断开同源全部连线', onClick: () => disconnectBySameSource(edgeContextTargetId) },
          { key: 'edge-target', label: '断开同目标全部连线', onClick: () => disconnectBySameTarget(edgeContextTargetId) },
        ] : []}
      />

      {/* P6: 快捷键帮助面板 */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}

// 包装 Provider
export default function WorkflowComposer() {
  return (
    <ComposerErrorBoundary>
      <ReactFlowProvider>
        <WorkflowComposerInner />
      </ReactFlowProvider>
    </ComposerErrorBoundary>
  );
}

class ComposerErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; message: string }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, message: error instanceof Error ? error.message : 'unknown_error' };
  }

  private handleReset = () => {
    try { localStorage.removeItem('wf_composer_drafts'); } catch {}
    this.setState({ hasError: false, message: '' });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{ padding: 24, color: '#e5e7eb', background: '#0a0a0a', minHeight: '100vh' }}>
        <h2 style={{ marginTop: 0 }}>Workflow Composer 运行恢复模式</h2>
        <p style={{ opacity: 0.9 }}>检测到页面异常，通常由旧草稿或未知节点导致。</p>
        <p style={{ opacity: 0.7, fontSize: 12 }}>Error: {this.state.message}</p>
        <button
          type="button"
          onClick={this.handleReset}
          style={{ marginTop: 8, padding: '8px 12px', borderRadius: 6, border: '1px solid #38BDF8', background: '#111827', color: '#38BDF8', cursor: 'pointer' }}
        >
          清空编排草稿并重载
        </button>
      </div>
    );
  }
}
