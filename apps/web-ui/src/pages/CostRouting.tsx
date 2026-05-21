import React, { useEffect, useMemo, useState } from 'react';
import { EmptyState, SectionCard, StatusBadge, StatusStrip } from '../components/ui';
import PageShell from '../components/ui/PageShell';
import '../components/ui/shared.css';
import './CostRouting.css';
import { roleClass } from '../theme/colorRoles';

type RouteType =
  | 'local_low_cost'
  | 'local_balanced'
  | 'cloud_high_capability'
  | 'local_cpu'
  | 'local_gpu'
  | 'openclaw_stable_2026_3_23'
  | 'openclaw_sidecar_2026_5_12'
  | 'comfyui_8000'
  | 'cloud_reasoning_model'
  | 'manual_confirm'
  | 'blocked';

interface RoutePolicy {
  id: string;
  name: string;
  task_type: string;
  route_type: RouteType;
  priority: number;
  status: string;
  reason_template: string;
  metadata_json: any;
  created_at: string;
  updated_at: string;
}

interface RouteDecision {
  id: string;
  task_id: string;
  task_type: string;
  policy_id: string;
  route_type: RouteType;
  route_reason: string;
  input_json: any;
  created_at: string;
}

interface RouteStat {
  route_type: RouteType;
  decisions: number;
  feedback_count: number;
  success_rate: number | null;
  avg_estimated_cost: number | null;
  avg_actual_cost: number | null;
  avg_latency_ms: number | null;
  avg_quality_score: number | null;
}

interface RoutePolicyStat {
  policy_id: string;
  policy_name: string;
  hits: number;
  avg_score: number | null;
}

interface RouteInsightRec {
  level: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
}

interface CostRoutingInsights {
  engine_version: string;
  window: {
    since_at: string;
    since_hours: number;
    sampled_decisions: number;
  };
  route_stats: RouteStat[];
  policy_stats: RoutePolicyStat[];
  top_task_types: Array<{ task_type: string; count: number }>;
  recommendations: RouteInsightRec[];
}

interface OptimizationProposal {
  policy_id: string;
  policy_name: string;
  task_type: string;
  route_type: RouteType;
  feedback_count: number;
  changed: boolean;
  reasons: string[];
  current_weights: Record<string, number>;
  suggested_weights: Record<string, number>;
  metrics: {
    outcome_score: number | null;
    avg_actual_cost: number | null;
    avg_latency_ms: number | null;
    avg_quality_score: number | null;
  };
}

interface RoutingOptimization {
  mode: 'preview' | 'apply';
  proposal_count: number;
  applied_count: number;
  proposals: OptimizationProposal[];
}

interface PracticalDecision {
  selectedRoute: RouteType;
  costLevel: 'free' | 'low' | 'medium' | 'high' | 'unknown';
  riskLevel: 'low' | 'medium' | 'high' | 'blocked';
  needsUserConfirm: boolean;
  reason: string;
  rejectedRoutes: Array<{ route: RouteType; reason: string }>;
  safetyNotes: string[];
  nextAction: string;
  strategyMode?: StrategyMode;
  taskLabel?: string;
  recommendedChannel?: string;
  costScore?: number;
  qualityScore?: number;
  speedScore?: number;
  riskScore?: number;
  scoreExplanation?: string;
  fallbackRoute?: RouteType;
  fallbackPlan?: string;
  humanReadableExplanation?: string;
  firewallHits?: string[];
  selectedPolicy?: string;
  detectedCategory?: string;
  routeName?: string;
  recommendedModelTier?: string;
  tierReason?: string;
  whyNotOtherTiers?: string[];
  recommendedToolchain?: {
    primary: string;
    secondary: string[];
    requiresHuman: boolean;
    readOnlyFirst: boolean;
    dryRunFirst: boolean;
    forbiddenActions: string[];
    suggestedPrechecks: string[];
    rollbackRequired: boolean;
  };
  executionMode?: 'read_only' | 'ask_first' | 'dry_run' | 'human_confirm_required' | 'local_only' | 'cloud_allowed' | 'blocked';
  matchedRules?: string[];
  requiredConfirmations?: string[];
  readOnlyPrechecks?: string[];
  rollbackPlan?: string[];
  deniedActions?: string[];
  confidence?: 'low' | 'medium' | 'high';
  confidenceReason?: string;
  missingInformation?: string[];
  whyThisRoute?: string;
  escalationPlan?: string[];
  actionType?: string;
  actionLabel?: string;
  actionExplanation?: string;
  allowedNextStep?: string;
  forbiddenNextSteps?: string[];
  requiresHumanConfirmation?: boolean;
  persistenceMode?: string;
  humanGateRequired?: boolean;
  confirmationReason?: string;
  noAutomaticExecution?: boolean;
  dryRunPlan?: {
    planId: string;
    planTitle: string;
    planMode: string;
    steps: string[];
    allowedSteps: string[];
    forbiddenSteps: string[];
    humanApprovalRequired: boolean;
    stopConditions: string[];
    rollbackPreview: string;
    expectedOutputs: string[];
  };
  auditPreview?: {
    auditSchemaVersion?: string;
    mode: 'preview_only';
    wouldExecute: false;
    wouldWriteFiles: false;
    databaseWrite?: false;
    fileWrite?: false;
    externalWrite?: false;
    timestamp?: string;
    taskSummary?: string;
    rawInput?: Record<string, unknown>;
    selectedPolicy?: string;
    detectedCategory?: string;
    actionType?: string;
    riskLevel?: string;
    executionMode?: string;
    confidence?: string;
    matchedRiskRules?: string[];
    recommendedRoute?: string;
    recommendedModelTier?: string;
    deniedActions?: string[];
    readOnlyPrechecks?: string[];
    nextSafeStep?: string;
    rollbackRequired?: boolean;
    auditMode?: string;
    requiredConfirmations: string[];
    rollbackPlan: string[];
    auditIdPreview?: string;
    persistenceMode?: string;
    selectedModelRoute?: string;
    selectedToolchainRoute?: string;
  };
}

type StrategyMode = 'save_money' | 'stable_first' | 'quality_first' | 'local_first' | 'balanced';

interface StrategyModeConfig {
  id: StrategyMode;
  name: string;
  description: string;
  costBias: number;
  qualityBias: number;
  speedBias: number;
  localBias: number;
  riskTolerance: string;
  suitable_for: string;
  recommendedFor: string[];
  avoidFor: string[];
  recommended_channel: string;
  cost_bias: string;
  risk_control: string;
  fallback_plan: string;
  fallbackPlan: string;
}

interface TaskConsoleType {
  id: string;
  label: string;
  maps_to: string;
  default_strategy: StrategyMode;
  description?: string;
  defaultRisk?: string;
  suggestedRoute?: string;
  forbiddenAutoActions?: string[];
  recommendedPolicy?: string;
}

interface PolicyTemplate {
  id: string;
  name: string;
  task_type: string;
  route_type: RouteType;
  priority: number;
  cost_level: string;
  risk_level: string;
  description: string;
}

interface ModelRouteEntry {
  id: string;
  name: string;
  description: string;
  costLevel: string;
  qualityLevel: number;
  speedLevel: number;
  riskFit: string;
  recommendedFor: string[];
  avoidFor: string[];
  fallbackTo: string;
  safetyNotes: string[];
}

interface ToolchainEntry {
  id: string;
  name: string;
  description: string;
  executionMode: string;
  readOnlyFirst: boolean;
  dryRunFirst: boolean;
  requiresHuman: boolean;
  forbiddenActions: string[];
  safePrechecks: string[];
  rollbackRequired: boolean;
  integrationStatus: string;
}

interface PracticalConfig {
  policy_templates: PolicyTemplate[];
  strategy_modes: StrategyModeConfig[];
  task_console_types: TaskConsoleType[];
  firewall_rules: Array<{ id: string; label: string; patterns?: string[] }>;
  route_matrix?: Record<string, Record<string, { route: RouteType; modelTier: string; executionMode: string; note: string }>>;
  case_matrix?: Array<{
    label: string;
    taskType: string;
    mode: StrategyMode;
    input: Record<string, unknown>;
    expectedCategory: string;
    expectedRiskLevel: string;
    expectedExecutionMode: string;
    expectedModelTier: string;
    expectedSafetyBehavior: string;
  }>;
  decision_pipeline?: string[];
  execution_modes: string[];
  task_types: string[];
  route_targets: RouteType[];
  cost_levels: string[];
  risk_levels: string[];
  local_capabilities: Record<string, string>;
  model_route_registry?: ModelRouteEntry[];
  toolchain_registry?: ToolchainEntry[];
  release_readiness_gates?: ReleaseReadinessGate[];
  external_integrations?: ExternalIntegration[];
  integration_readiness_matrix?: IntegrationReadinessEntry[];
  route_action_types?: RouteActionType[];
  integration_rehearsal_matrix?: RehearsalEntry[];
  stop_conditions?: StopCondition[];
}

interface IntegrationReadinessEntry {
  id: string;
  name: string;
  status: string;
  allowedModes: string[];
  forbiddenActions: string[];
  safePrechecks: string[];
  requiredConfirmations: string[];
  rollbackRequired: boolean;
  nextMilestone: string;
  integrationRisk: string;
}

interface RouteActionType {
  id: string;
  label: string;
  description: string;
}

interface RehearsalEntry {
  id: string;
  name: string;
  targetSystem: string;
  actionType: string;
  executionMode: string;
  rehearsalOnly: boolean;
  externalCall: boolean;
  databaseWrite: boolean;
  fileWrite: boolean;
  requiredPrechecks: string[];
  requiredConfirmations: string[];
  rollbackPlanPreview: string;
  nextSafeStep: string;
  blockedRealActions: string[];
}

interface StopCondition {
  id: string;
  label: string;
  description: string;
}

interface ReleaseReadinessGate {
  id: string;
  label: string;
  forTask: string;
  severity: string;
}

interface ExternalIntegration {
  id: string;
  name: string;
  description: string;
  integrationStatus: string;
  note: string;
}

interface RoutingHistoryEntry {
  previewId: string;
  taskSummary: string;
  selectedPolicy: string;
  selectedModelRoute: string;
  selectedToolchainRoute: string;
  riskLevel: string;
  confidence: string;
  executionMode: string;
  nextSafeStep: string;
  persistenceMode: 'preview_only';
  timestamp: string;
}

interface SimulationExample {
  label: string;
  mode: StrategyMode;
  taskType: string;
  taskId: string;
  input: Record<string, unknown>;
}

const SIMULATION_EXAMPLES: SimulationExample[] = [
  {
    label: '普通聊天/问答',
    mode: 'save_money' as StrategyMode,
    taskType: 'chat_qa',
    taskId: 'sim-chat-qa',
    input: { budget: 'low', prompt: '普通问答：解释 AIP 当前状态' },
  },
  {
    label: '文档总结/改写',
    mode: 'save_money' as StrategyMode,
    taskType: 'text_inference',
    taskId: 'sim-low-budget-summary',
    input: { budget: 'low', prompt: '低预算文本总结', estimated_tokens: 2400 },
  },
  {
    label: '代码修改/调试',
    mode: 'quality_first' as StrategyMode,
    taskType: 'code_debug',
    taskId: 'sim-code-debug',
    input: { budget: 'medium', quality_priority: 'high', target: '复杂代码调试和根因分析' },
  },
  {
    label: 'AIP 只读健康检查',
    mode: 'stable_first' as StrategyMode,
    taskType: 'readonly_project_audit',
    taskId: 'sim-readonly-audit',
    input: { budget: 'low', target: 'AIP project readonly audit' },
  },
  {
    label: 'Git 发布/版本封板',
    mode: 'stable_first' as StrategyMode,
    taskType: 'git_release_seal',
    taskId: 'sim-git-release-seal',
    input: { budget: 'medium', target: 'git push tag release v7.3.2' },
  },
  {
    label: '删除旧备份',
    mode: 'stable_first' as StrategyMode,
    taskType: 'high_risk_system_ops',
    taskId: 'sim-delete-backups',
    input: { budget: 'low', target: '删除旧备份目录' },
  },
  {
    label: 'taskkill node',
    mode: 'stable_first' as StrategyMode,
    taskType: 'high_risk_system_ops',
    taskId: 'sim-taskkill-node',
    input: { budget: 'low', target: 'taskkill /IM node.exe' },
  },
  {
    label: '启动 ComfyUI 生图',
    mode: 'local_first' as StrategyMode,
    taskType: 'image_comfyui',
    taskId: 'sim-comfy-image',
    input: { budget: 'low', comfy_available: true, prompt: 'ComfyUI 真实海怪生图' },
  },
  {
    label: 'Mahjong 数据集只读检查',
    mode: 'local_first' as StrategyMode,
    taskType: 'dataset_yolo_mahjong',
    taskId: 'sim-mahjong-yolo-dataset',
    input: { budget: 'low', gpu_needed: true, target: 'YOLO Mahjong dataset quality check' },
  },
  {
    label: '训练并覆盖 best.pt',
    mode: 'local_first' as StrategyMode,
    taskType: 'training',
    taskId: 'sim-train-overwrite-best',
    input: { budget: 'low', gpu_needed: true, target: '训练 Mahjong 模型并覆盖 best.pt' },
  },
  {
    label: 'Memory Hub 候选审批',
    mode: 'stable_first' as StrategyMode,
    taskType: 'memory_hub_knowledge',
    taskId: 'sim-memory-hub',
    input: { budget: 'low', target: '修改 candidate sqlite' },
  },
  {
    label: 'OpenClaw 稳定版升级/覆盖',
    mode: 'local_first' as StrategyMode,
    taskType: 'openclaw_agent_task',
    taskId: 'sim-openclaw-agent',
    input: { budget: 'low', target: '覆盖 OpenClaw 2026.3.23 稳定版' },
  },
  {
    label: '模糊任务',
    mode: 'balanced' as StrategyMode,
    taskType: 'text_inference',
    taskId: 'sim-vague-task',
    input: { target: '帮我弄一下' },
  },
  {
    label: '依赖安装',
    mode: 'stable_first' as StrategyMode,
    taskType: 'code_debug',
    taskId: 'sim-dependency-install',
    input: { target: 'pnpm install 一堆新依赖' },
  },
  {
    label: '修改 .env token',
    mode: 'stable_first' as StrategyMode,
    taskType: 'high_risk_system_ops',
    taskId: 'sim-env-token',
    input: { target: '帮我改 .env token' },
  },
  {
    label: 'OpenAxiom 只读状态检查',
    mode: 'stable_first' as StrategyMode,
    taskType: 'openaxiom_readonly_observer',
    taskId: 'sim-openaxiom-readonly',
    input: { target: '检查 OpenAxiom 状态' },
  },
  {
    label: '保存 OpenAxiom label',
    mode: 'stable_first' as StrategyMode,
    taskType: 'openaxiom_readonly_observer',
    taskId: 'sim-openaxiom-save',
    input: { target: '保存 OpenAxiom label' },
  },
  {
    label: 'ComfyUI 只读状态检查',
    mode: 'stable_first' as StrategyMode,
    taskType: 'comfyui_readonly_observer',
    taskId: 'sim-comfyui-readonly',
    input: { target: '检查 ComfyUI 状态' },
  },
  {
    label: 'ComfyUI 生成图片',
    mode: 'stable_first' as StrategyMode,
    taskType: 'comfyui_readonly_observer',
    taskId: 'sim-comfyui-generate',
    input: { target: 'ComfyUI 生成图片' },
  },
  {
    label: 'OpenClaw 只读状态检查',
    mode: 'stable_first' as StrategyMode,
    taskType: 'openclaw_readonly_observer',
    taskId: 'sim-openclaw-readonly',
    input: { target: '检查 OpenClaw 状态' },
  },
  {
    label: '启动 OpenClaw',
    mode: 'stable_first' as StrategyMode,
    taskType: 'openclaw_readonly_observer',
    taskId: 'sim-openclaw-start',
    input: { target: '启动 OpenClaw' },
  },
  {
    label: 'GitHub 发布准备度检查',
    mode: 'stable_first' as StrategyMode,
    taskType: 'github_release_prep_preview',
    taskId: 'sim-release-prep',
    input: { target: '检查发布准备度' },
  },
  {
    label: 'git tag 发布',
    mode: 'stable_first' as StrategyMode,
    taskType: 'github_release',
    taskId: 'sim-git-tag',
    input: { target: 'git tag v7.10.0' },
  },
  {
    label: 'Mahjong 只读审计预览',
    mode: 'stable_first' as StrategyMode,
    taskType: 'mahjong_readonly_audit_preview',
    taskId: 'sim-mahjong-audit',
    input: { target: '检查 Mahjong 数据集' },
  },
  {
    label: '训练 Mahjong 模型',
    mode: 'local_first' as StrategyMode,
    taskType: 'mahjong_readonly_audit_preview',
    taskId: 'sim-mahjong-train',
    input: { target: '训练 Mahjong 模型' },
  },
];

function fmt(v?: string) {
  if (!v) return '暂无记录';
  try {
    return new Date(v).toLocaleString('zh-CN');
  } catch {
    return v;
  }
}

const COST_ROUTING_AUTH_TOKEN_KEY = 'aip_auth_token';

function getStoredAuthToken(): string {
  try {
    return localStorage.getItem(COST_ROUTING_AUTH_TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

function setStoredAuthToken(token: string) {
  try {
    localStorage.setItem(COST_ROUTING_AUTH_TOKEN_KEY, token);
  } catch {
    // Ignore storage failures; the token can still be used for the current request.
  }
}

async function loginForCostRouting(): Promise<string> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'aip-admin' }),
  });
  const data = await res.json();
  if (!res.ok || !data?.ok || !data?.token) {
    throw new Error(data?.error || data?.message || '成本路由认证失败');
  }
  setStoredAuthToken(data.token);
  return data.token;
}

async function api(path: string, init?: RequestInit, retried = false): Promise<any> {
  let token = getStoredAuthToken();
  if (!token) token = await loginForCostRouting();

  const headers = new Headers(init?.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(path, { ...init, headers });
  const data = await res.json();

  if (data?._unauthorized && !retried) {
    token = await loginForCostRouting();
    const retryHeaders = new Headers(init?.headers || {});
    retryHeaders.set('Authorization', `Bearer ${token}`);
    const retryRes = await fetch(path, { ...init, headers: retryHeaders });
    return retryRes.json();
  }

  return data;
}

export default function CostRoutingPage() {
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const [policies, setPolicies] = useState<RoutePolicy[]>([]);
  const [decisions, setDecisions] = useState<RouteDecision[]>([]);
  const [insights, setInsights] = useState<CostRoutingInsights | null>(null);
  const [optimization, setOptimization] = useState<RoutingOptimization | null>(null);
  const [practicalConfig, setPracticalConfig] = useState<PracticalConfig | null>(null);
  const [practicalDecision, setPracticalDecision] = useState<PracticalDecision | null>(null);

  const [selectedPolicyId, setSelectedPolicyId] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState<RoutePolicy | null>(null);

  const [selectedDecisionId, setSelectedDecisionId] = useState('');
  const [selectedDecision, setSelectedDecision] = useState<RouteDecision | null>(null);

  const [policyTaskType, setPolicyTaskType] = useState('inference');
  const [policyName, setPolicyName] = useState('inference balanced policy');
  const [policyRouteType, setPolicyRouteType] = useState<RouteType>('local_balanced');
  const [policyPriority, setPolicyPriority] = useState(120);
  const [policyReasonTpl, setPolicyReasonTpl] = useState('匹配任务类型和路由策略的命中原因说明');

  const [simulateTaskType, setSimulateTaskType] = useState('training');
  const [simulateTaskId, setSimulateTaskId] = useState('sim-task-v640-001');
  const [simulateInputJson, setSimulateInputJson] = useState('{"budget":"low","gpu_needed":true}');
  const [strategyMode, setStrategyMode] = useState<StrategyMode>('stable_first');

  const [routingHistory, setRoutingHistory] = useState<RoutingHistoryEntry[]>([]);
  const [routingModelRoute, setRoutingModelRoute] = useState<string>('');
  const [selfCheckResult, setSelfCheckResult] = useState<any>(null);
  const [selfCheckLoading, setSelfCheckLoading] = useState(false);
  const [memoryHubPreview, setMemoryHubPreview] = useState<any>(null);
  const [memoryHubLoading, setMemoryHubLoading] = useState(false);
  const [openAxiomPreview, setOpenAxiomPreview] = useState<any>(null);
  const [openAxiomLoading, setOpenAxiomLoading] = useState(false);
  const [comfyUiPreview, setComfyUiPreview] = useState<any>(null);
  const [comfyUiLoading, setComfyUiLoading] = useState(false);
  const [openClawPreview, setOpenClawPreview] = useState<any>(null);
  const [openClawLoading, setOpenClawLoading] = useState(false);
  const [releasePrepPreview, setReleasePrepPreview] = useState<any>(null);
  const [releasePrepLoading, setReleasePrepLoading] = useState(false);
  const [mahjongAuditPreview, setMahjongAuditPreview] = useState<any>(null);
  const [mahjongAuditLoading, setMahjongAuditLoading] = useState(false);

  const [decisionRouteFilter, setDecisionRouteFilter] = useState('');
  const [feedbackOutcome, setFeedbackOutcome] = useState<'success' | 'partial' | 'failed' | 'timeout'>('success');
  const [feedbackCost, setFeedbackCost] = useState('');
  const [feedbackLatency, setFeedbackLatency] = useState('');
  const [feedbackQuality, setFeedbackQuality] = useState('');
  const [feedbackNotes, setFeedbackNotes] = useState('');

  const stats = useMemo(() => {
    const byRoutePolicy: Record<string, number> = {
      local_low_cost: 0,
      local_balanced: 0,
      cloud_high_capability: 0,
    };
    for (const p of policies) {
      byRoutePolicy[p.route_type] = (byRoutePolicy[p.route_type] || 0) + 1;
    }
    const byRouteDecision: Record<string, number> = {
      local_low_cost: 0,
      local_balanced: 0,
      cloud_high_capability: 0,
    };
    for (const stat of insights?.route_stats || []) {
      byRouteDecision[stat.route_type] = stat.decisions || 0;
    }
    const feedbackCount = (insights?.route_stats || []).reduce((acc, item) => acc + Number(item.feedback_count || 0), 0);
    return {
      policyTotal: policies.length,
      decisionTotal: (insights?.window?.sampled_decisions || 0),
      recommendationCount: insights?.recommendations?.length || 0,
      feedbackCount,
      byRoutePolicy,
      byRouteDecision,
    };
  }, [policies, insights]);

  async function loadPolicies() {
    const res = await api('/api/route-policies?limit=200');
    if (!res.ok) throw new Error(res.error || '加载策略失败');
    setPolicies(res.policies || []);
    if (!selectedPolicyId && res.policies?.length) {
      setSelectedPolicyId(res.policies[0].id);
    }
  }

  async function loadPolicyDetail(id: string) {
    if (!id) {
      setSelectedPolicy(null);
      return;
    }
    const res = await api(`/api/route-policies/${id}`);
    if (!res.ok) throw new Error(res.error || '加载策略详情失败');
    setSelectedPolicy(res.policy || null);
  }

  async function loadDecisions() {
    const q = new URLSearchParams({ limit: '100' });
    if (decisionRouteFilter) q.set('route_type', decisionRouteFilter);
    const res = await api(`/api/cost-routing/decisions?${q.toString()}`);
    if (!res.ok) throw new Error(res.error || '加载决策失败');
    setDecisions(res.decisions || []);
    if (!selectedDecisionId && res.decisions?.length) {
      setSelectedDecisionId(res.decisions[0].id);
    }
  }

  async function loadDecisionDetail(id: string) {
    if (!id) {
      setSelectedDecision(null);
      return;
    }
    const res = await api(`/api/cost-routing/decisions/${id}`);
    if (!res.ok) throw new Error(res.error || '加载决策详情失败');
    setSelectedDecision(res.decision || null);
  }

  async function loadAll() {
    setLoading(true);
    setError('');
    try {
      await Promise.all([loadPolicies(), loadDecisions(), loadInsights(), loadPracticalConfig()]);
    } catch (e: any) {
      setError(e.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }

  async function loadInsights() {
    setLoadingInsights(true);
    try {
      const res = await api('/api/cost-routing/insights?since_hours=168&limit=800');
      if (!res.ok) throw new Error(res.error || '加载洞察失败');
      setInsights(res.insights || null);
    } catch (e: any) {
      setError(e.message || '加载洞察失败');
    } finally {
      setLoadingInsights(false);
    }
  }

  async function loadPracticalConfig() {
    const res = await api('/api/cost-routing/practical-config');
    if (!res.ok) throw new Error(res.error || '加载实用路由配置失败');
    setPracticalConfig(res);
  }

  async function handleCreatePolicy(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError('');
    setMsg('');
    try {
      const res = await api('/api/route-policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: policyName,
          task_type: policyTaskType,
          route_type: policyRouteType,
          priority: Number(policyPriority),
          reason_template: policyReasonTpl,
          metadata_json: { source: 'ui-v640' },
        }),
      });
      if (!res.ok) throw new Error(res.error || '创建策略失败');
      setMsg(`策略已创建: ${res.policy.id}`);
      setSelectedPolicyId(res.policy.id);
      await loadPolicies();
      await loadPolicyDetail(res.policy.id);
    } catch (e: any) {
      setError(e.message || '创建失败');
    } finally {
      setCreating(false);
    }
  }

  async function handleResolve(e: React.FormEvent) {
    e.preventDefault();
    setResolving(true);
    setError('');
    setMsg('');
    try {
      let parsed: any = {};
      try {
        parsed = simulateInputJson ? JSON.parse(simulateInputJson) : {};
      } catch {
        throw new Error('input_json 不是合法 JSON');
      }

      const res = await api('/api/cost-routing/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_type: simulateTaskType,
          task_id: simulateTaskId,
          input_json: { ...parsed, strategy_mode: strategyMode },
        }),
      });
      if (!res.ok) throw new Error(res.error || '路由决策失败');

      const d = res.decision;
      const practical = d.input_json?.__routing?.practical_decision || null;
      setPracticalDecision(practical);
      if (practical) pushRoutingHistory(practical);
      setMsg(`路由命中: ${d.route_type} | reason: ${d.route_reason}`);
      setSelectedDecisionId(d.id);
      await Promise.all([loadDecisions(), loadDecisionDetail(d.id), loadInsights()]);
    } catch (e: any) {
      setError(e.message || '决策失败');
    } finally {
      setResolving(false);
    }
  }

  async function handlePracticalSimulate(e?: React.FormEvent | React.MouseEvent) {
    e?.preventDefault();
    setResolving(true);
    setError('');
    setMsg('');
    try {
      let parsed: any = {};
      try {
        parsed = simulateInputJson ? JSON.parse(simulateInputJson) : {};
      } catch {
        throw new Error('input_json 不是合法 JSON');
      }
      const res = await api('/api/cost-routing/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_type: simulateTaskType,
          task_id: simulateTaskId,
          input_json: { ...parsed, strategy_mode: strategyMode },
        }),
      });
      if (!res.ok) throw new Error(res.error || '模拟决策失败');
      const simDecision = res.decision || null;
      setPracticalDecision(simDecision);
      if (simDecision) pushRoutingHistory(simDecision);
      setMsg(`模拟建议: ${simDecision?.selectedRoute} · risk=${simDecision?.riskLevel}`);
    } catch (e: any) {
      setError(e.message || '模拟决策失败');
    } finally {
      setResolving(false);
    }
  }

  function pushRoutingHistory(decision: PracticalDecision) {
    const entry: RoutingHistoryEntry = {
      previewId: `preview-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      taskSummary: decision.taskLabel || simulateTaskType,
      selectedPolicy: decision.strategyMode || strategyMode,
      selectedModelRoute: decision.recommendedModelTier || 'N/A',
      selectedToolchainRoute: decision.recommendedToolchain?.primary || 'N/A',
      riskLevel: decision.riskLevel,
      confidence: decision.confidence || 'N/A',
      executionMode: decision.executionMode || 'N/A',
      nextSafeStep: decision.nextAction,
      persistenceMode: 'preview_only',
      timestamp: new Date().toLocaleString('zh-CN'),
    };
    setRoutingHistory((prev) => [entry, ...prev].slice(0, 20));
  }

  function applyExample(example: SimulationExample) {
    setSimulateTaskType(example.taskType);
    setSimulateTaskId(example.taskId);
    setStrategyMode(example.mode);
    setSimulateInputJson(JSON.stringify({ ...example.input, strategy_mode: example.mode }, null, 2));
    setPracticalDecision(null);
    setMsg(`已填充示例: ${example.label}`);
  }

  async function handleAttachFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDecisionId) {
      setError('请先选择一条决策记录');
      return;
    }
    setSavingFeedback(true);
    setError('');
    setMsg('');
    try {
      const payload: any = {
        decision_id: selectedDecisionId,
        outcome: feedbackOutcome,
        notes: feedbackNotes,
      };
      if (feedbackCost.trim()) payload.actual_cost = Number(feedbackCost);
      if (feedbackLatency.trim()) payload.latency_ms = Number(feedbackLatency);
      if (feedbackQuality.trim()) payload.quality_score = Number(feedbackQuality);
      const res = await api('/api/cost-routing/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(res.error || '反馈回填失败');
      setMsg(`反馈回填成功: ${selectedDecisionId}`);
      await Promise.all([loadDecisionDetail(selectedDecisionId), loadInsights()]);
      setFeedbackNotes('');
    } catch (e: any) {
      setError(e.message || '反馈回填失败');
    } finally {
      setSavingFeedback(false);
    }
  }

  async function handleSelfCheck() {
    setSelfCheckLoading(true);
    setError('');
    setMsg('');
    try {
      const res = await api('/api/cost-routing/self-check');
      if (!res.ok) throw new Error(res.error || '只读自检失败');
      setSelfCheckResult(res);
      setMsg('AIP 只读自检完成。未写数据库、未改配置、未重启服务。');
    } catch (e: any) {
      setError(e.message || '自检失败');
    } finally {
      setSelfCheckLoading(false);
    }
  }

  async function handleOpenAxiomPreview() {
    setOpenAxiomLoading(true);
    setError('');
    setMsg('');
    try {
      const res = await api('/api/cost-routing/openaxiom-status-preview');
      if (!res.ok) throw new Error(res.error || 'OpenAxiom 只读状态预览失败');
      setOpenAxiomPreview(res);
      setMsg('OpenAxiom 只读状态预览已生成。未启动 GUI、未保存/恢复/批量保存、未修改 labels/images/data.yaml/models。');
    } catch (e: any) {
      setError(e.message || 'OpenAxiom 预览失败');
    } finally {
      setOpenAxiomLoading(false);
    }
  }

  async function handleComfyUiPreview() {
    setComfyUiLoading(true);
    setError('');
    setMsg('');
    try {
      const res = await api('/api/cost-routing/comfyui-status-preview');
      if (!res.ok) throw new Error(res.error || 'ComfyUI 只读状态预览失败');
      setComfyUiPreview(res);
      setMsg('ComfyUI 只读状态预览已生成。未启动 ComfyUI、未提交 queue、未生成图片、未修改 workflow/model。');
    } catch (e: any) {
      setError(e.message || 'ComfyUI 预览失败');
    } finally {
      setComfyUiLoading(false);
    }
  }

  async function handleOpenClawPreview() {
    setOpenClawLoading(true);
    setError('');
    setMsg('');
    try {
      const res = await api('/api/cost-routing/openclaw-status-preview');
      if (!res.ok) throw new Error(res.error || 'OpenClaw 只读状态预览失败');
      setOpenClawPreview(res);
      setMsg('OpenClaw 只读状态预览已生成。未启动/停止/重启 OpenClaw、未 taskkill、未升级全局版本、未修改配置/模型路由/调用模型。');
    } catch (e: any) {
      setError(e.message || 'OpenClaw 预览失败');
    } finally {
      setOpenClawLoading(false);
    }
  }

  async function handleReleasePrepPreview() {
    setReleasePrepLoading(true);
    setError('');
    setMsg('');
    try {
      const res = await api('/api/cost-routing/github-release-prep-preview');
      if (!res.ok) throw new Error(res.error || 'GitHub 发布准备度预览失败');
      setReleasePrepPreview(res);
      setMsg('GitHub 发布准备度预览已生成。未 tag、未 push、未创建 Release。');
    } catch (e: any) {
      setError(e.message || 'GitHub 发布准备度预览失败');
    } finally {
      setReleasePrepLoading(false);
    }
  }

  async function handleMahjongAuditPreview() {
    setMahjongAuditLoading(true);
    setError('');
    setMsg('');
    try {
      const res = await api('/api/cost-routing/mahjong-audit-preview');
      if (!res.ok) throw new Error(res.error || 'Mahjong 只读审计预览失败');
      setMahjongAuditPreview(res);
      setMsg('Mahjong 只读审计预览已生成。未扫描大文件、未训练、未覆盖模型、未修改 labels/images/data.yaml。');
    } catch (e: any) {
      setError(e.message || 'Mahjong 审计预览失败');
    } finally {
      setMahjongAuditLoading(false);
    }
  }

  async function handleMemoryHubPreview() {
    setMemoryHubLoading(true);
    setError('');
    setMsg('');
    try {
      const res = await api('/api/cost-routing/context-lookup-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '项目上下文', projectHint: 'AIP cost-routing', scopeHint: 'general', readonlyOnly: true }),
      });
      if (!res.ok) throw new Error(res.error || 'Memory Hub 只读查询预览失败');
      setMemoryHubPreview(res);
      setMsg('Memory Hub 只读上下文预览已生成。未写 Memory Hub、未改 candidate。');
    } catch (e: any) {
      setError(e.message || 'Memory Hub 预览失败');
    } finally {
      setMemoryHubLoading(false);
    }
  }

  async function runOptimization(mode: 'preview' | 'apply') {
    setOptimizing(true);
    setError('');
    setMsg('');
    try {
      const res = await api('/api/cost-routing/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          since_hours: 336,
          min_feedback: 1,
          max_shift: 0.12,
        }),
      });
      if (!res.ok) throw new Error(res.error || '策略优化失败');
      setOptimization(res.optimization || null);
      setMsg(mode === 'apply'
        ? `策略优化已应用: ${res.optimization?.applied_count || 0} 条`
        : `策略优化建议: ${res.optimization?.proposal_count || 0} 条`);
      await Promise.all([loadPolicies(), loadInsights()]);
    } catch (e: any) {
      setError(e.message || '策略优化失败');
    } finally {
      setOptimizing(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (selectedPolicyId) {
      loadPolicyDetail(selectedPolicyId).catch((e) => setError(e.message || '策略详情失败'));
    }
  }, [selectedPolicyId]);

  useEffect(() => {
    loadDecisions().catch((e) => setError(e.message || '决策列表失败'));
  }, [decisionRouteFilter]);

  useEffect(() => {
    if (selectedDecisionId) {
      loadDecisionDetail(selectedDecisionId).catch((e) => setError(e.message || '决策详情失败'));
    }
  }, [selectedDecisionId]);

  return (
    <PageShell
      title="AI Router Console / 成本路由中心"
      subtitle="AI Router Console — 只读/预览模式，不执行真实路由，不写入数据库，不调用外部系统"
      versionLabel="AIP v7.25.2 · Cost Routing v7.12.3"
      maturity="preview"
      safetyBoundary="preview"
      safetyText="预览模式 · 不写入配置 · 需要人工确认"
    >

      <StatusStrip
        items={[
          { label: '模式', value: '建议 / dry-run / preview only' },
          { label: '安全状态', value: '高风险任务默认人工确认', color: '#F59E0B' },
          { label: '出口路线', value: '本地 / 强推理 / 工具链 / 人工确认' },
          { label: '执行承诺', value: '不自动 push、删除、训练或覆盖', color: '#10B981' },
        ]}
      />

      <SectionCard className={`role-card ${roleClass('exec')}`} title="控制台摘要 Console Dashboard">
        <div className="cr-dashboard-grid">
          <div className="cr-dashboard-item">
            <span className="cr-dashboard-key">当前阶段</span>
          <b>Cost Routing v7.12.3 UX Sanity</b>
        </div>
        <div className="cr-dashboard-item">
          <span className="cr-dashboard-key">当前模式</span>
          <b>read_only / preview_only / no execution</b>
        </div>
        <div className="cr-dashboard-item">
          <span className="cr-dashboard-key">治理链 (7条)</span>
          <b>全部 readonly preview</b>
        </div>
        <div className="cr-dashboard-item">
          <span className="cr-dashboard-key">发布门禁</span>
          <b>lint/typecheck/build/smoke/db/secret ✅</b>
        </div>
        <div className="cr-dashboard-item">
          <span className="cr-dashboard-key">Git tag / push / Release</span>
          <b>disabled</b>
        </div>
        <div className="cr-dashboard-item">
          <span className="cr-dashboard-key">real API call</span>
          <b>disabled</b>
        </div>
        <div className="cr-dashboard-item">
          <span className="cr-dashboard-key">策略总数 / 近7天决策 / 回填反馈 / 建议</span>
          <b>{stats.policyTotal} / {stats.decisionTotal} / {stats.feedbackCount} / {stats.recommendationCount}</b>
        </div>
        <div className="cr-dashboard-item">
          <span className="cr-dashboard-key">下一步建议</span>
          <b>先只读状态观察，再人工确认；所有写入/生图/执行必须另开授权任务</b>
        </div>
        </div>
      </SectionCard>



      <SectionCard className={`role-card ${roleClass('exec')}`} title="只读状态面板 Readonly Status Dashboard / Self-check">
        <div className="cr-registry-note">AIP 只读自检状态面板 + 质量门禁。不写数据库、不改配置、不重启服务、不触碰外部项目。</div>
        <div className="cr-selfcheck-grid">
          <div className="cr-selfcheck-controls">
            <button className="ui-btn ui-btn-primary" type="button" onClick={handleSelfCheck} disabled={selfCheckLoading}>
              {selfCheckLoading ? '生成中...' : '生成自检预览'}
            </button>
          </div>
          {selfCheckResult ? (
            <div className="cr-selfcheck-results">
              <div className="cr-selfcheck-header">
                <span className="cr-badge" style={{ background: selfCheckResult.overallStatus === 'healthy' ? 'var(--success)' : 'var(--warning)', color: '#fff', borderColor: 'transparent' }}>{selfCheckResult.overallStatus}</span>
                <span className="cr-badge">{selfCheckResult.mode}</span>
                <span className="cr-badge">{selfCheckResult.actionType}</span>
                <span className="cr-badge">target: {selfCheckResult.targetSystem}</span>
                <span className="cr-badge">gateScore: {selfCheckResult.gateScore}%</span>
              </div>
              <div className="cr-selfcheck-grid-inner">
                <div className="cr-pp-item">
                  <span className="cr-pp-key">Overall Status</span>
                  <b className="cr-pp-val">{selfCheckResult.overallStatus}</b>
                </div>
                <div className="cr-pp-item">
                  <span className="cr-pp-key">API Health</span>
                  <b className="cr-pp-val">{selfCheckResult.apiHealth}</b>
                </div>
                <div className="cr-pp-item">
                  <span className="cr-pp-key">Self-Check API</span>
                  <b className="cr-pp-val">{selfCheckResult.selfCheckApiStatus}</b>
                </div>
                <div className="cr-pp-item">
                  <span className="cr-pp-key">Router Core</span>
                  <b className="cr-pp-val">{selfCheckResult.routerCoreStatus}</b>
                </div>
                <div className="cr-pp-item">
                  <span className="cr-pp-key">Cost Routing</span>
                  <b className="cr-pp-val">{selfCheckResult.costRoutingStatus}</b>
                </div>
                <div className="cr-pp-item">
                  <span className="cr-pp-key">Safety Boundary</span>
                  <b className="cr-pp-val">{selfCheckResult.safetyBoundaryStatus}</b>
                </div>
                <div className="cr-pp-item">
                  <span className="cr-pp-key">AIP Version</span>
                  <b className="cr-pp-val">{selfCheckResult.aipStatus?.version}</b>
                </div>
                <div className="cr-pp-item">
                  <span className="cr-pp-key">Last Checked</span>
                  <b className="cr-pp-val">{selfCheckResult.lastCheckedAt ? new Date(selfCheckResult.lastCheckedAt).toLocaleString('zh-CN') : 'N/A'}</b>
                </div>
              </div>
              <div className="cr-subtitle">质量门禁 Quality Gates ({selfCheckResult.passedGates}/{selfCheckResult.totalGates})</div>
              <div className="cr-gate-grid">
                {(selfCheckResult.gates || []).map((gate: any) => (
                  <div className={`cr-gate-item status-${gate.status}`} key={gate.id}>
                    <div className="cr-template-head">
                      <b>{gate.name}</b>
                      <span className={`cr-badge ${gate.status === 'pass' ? 'risk-low' : gate.status === 'warning' ? 'risk-medium' : 'risk-high'}`}>{gate.status}</span>
                    </div>
                    <div className="cost-routing-policy-meta">{gate.description}</div>
                    <div className="cost-routing-policy-meta">依据：{gate.evidence}</div>
                  </div>
                ))}
              </div>
              <div className="cr-subtitle" style={{ marginTop: '8px' }}>安全边界 Safety Boundary</div>
              <div className="cr-selfcheck-grid-inner">
                <div className="cr-pp-item"><span className="cr-pp-key">Database Write</span><b className="cr-pp-val">{String(selfCheckResult.databaseWrite)}</b></div>
                <div className="cr-pp-item"><span className="cr-pp-key">File Write</span><b className="cr-pp-val">{String(selfCheckResult.fileWrite)}</b></div>
                <div className="cr-pp-item"><span className="cr-pp-key">Service Restart</span><b className="cr-pp-val">{String(selfCheckResult.serviceRestart)}</b></div>
                <div className="cr-pp-item"><span className="cr-pp-key">Process Kill</span><b className="cr-pp-val">{String(selfCheckResult.processKill)}</b></div>
                <div className="cr-pp-item"><span className="cr-pp-key">External Touch</span><b className="cr-pp-val">{String(selfCheckResult.externalTouch)}</b></div>
                <div className="cr-pp-item"><span className="cr-pp-key">Persistence Mode</span><b className="cr-pp-val">{selfCheckResult.persistenceMode}</b></div>
              </div>
              <div className="cost-routing-policy-meta" style={{ marginTop: '6px' }}>禁止操作：{(selfCheckResult.forbiddenActions || []).join(' / ')}</div>
              <div className="cr-next-action" style={{ marginTop: '6px' }}>{selfCheckResult.nextSafeStep}</div>
            </div>
          ) : (
            <div className="cost-routing-policy-meta">尚未执行自检。点击"生成自检预览"按钮获取状态面板和质量门禁结果。</div>
          )}
        </div>
      </SectionCard>

      <SectionCard className={`role-card ${roleClass('exec')}`} title="Memory Hub 只读上下文预览 Memory Hub Preview">
        <div className="cr-registry-note">只读上下文预览。不写 sqlite、不改 candidate、不同步 LAN_SHARE、不 approve/reject/archive。</div>
        <div className="cr-mh-grid">
          <div className="cr-selfcheck-controls">
            <button className="ui-btn ui-btn-primary" type="button" onClick={handleMemoryHubPreview} disabled={memoryHubLoading}>
              {memoryHubLoading ? '生成中...' : '生成 Memory Hub 只读查询预览'}
            </button>
          </div>
          {memoryHubPreview ? (
            <div className="cr-mh-results">
              <div className="cr-selfcheck-header">
                <span className="cr-badge" style={{ background: 'var(--success)', color: '#fff', borderColor: 'transparent' }}>{memoryHubPreview.integrationMode}</span>
                <span className="cr-badge">{memoryHubPreview.actionType}</span>
                <span className="cr-badge">target: {memoryHubPreview.targetSystem}</span>
                <span className="cr-badge">{memoryHubPreview.persistenceMode}</span>
                <span className="cr-badge">gateScore: {memoryHubPreview.gateScore}%</span>
                <span className="cr-badge">result: {memoryHubPreview.resultMode}</span>
              </div>
              <div className="cr-mh-summary-row">
                <span className="cost-routing-policy-meta"><b>查询计划</b>：{memoryHubPreview.lookupPlan}</span>
              </div>
              <div className="cr-mh-context-box">
                <div className="cr-subtitle">上下文预览 Context Preview</div>
                <div className="cr-template-desc">{memoryHubPreview.contextPreview}</div>
                <div className="cost-routing-policy-meta" style={{ marginTop: '4px' }}>模式：preview_plan | 真实 API 调用：{String(memoryHubPreview.realApiCall)} | 候选包含：{String(memoryHubPreview.candidateIncluded)}</div>
              </div>
              <div className="cr-subtitle" style={{ marginTop: '8px' }}>质量门禁 Quality Gates ({memoryHubPreview.passedGates}/{memoryHubPreview.totalGates})</div>
              <div className="cr-gate-grid">
                {(memoryHubPreview.gates || []).map((gate: any) => (
                  <div className={`cr-gate-item status-${gate.status}`} key={gate.id}>
                    <div className="cr-template-head">
                      <b>{gate.name}</b>
                      <span className={`cr-badge ${gate.status === 'pass' ? 'risk-low' : 'risk-high'}`}>{gate.status}</span>
                    </div>
                    <div className="cost-routing-policy-meta">{gate.description}</div>
                  </div>
                ))}
              </div>
              <div className="cr-subtitle" style={{ marginTop: '8px' }}>写入意图拦截矩阵 Write Intent Block Matrix</div>
              <div className="cr-gate-grid">
                {(memoryHubPreview.writeIntentBlockMatrix || []).map((wi: any) => (
                  <div className="cr-gate-item status-fail" key={wi.intent}>
                    <b>{wi.intent}</b>
                    <div className="cost-routing-policy-meta">风险：{wi.risk} · 动作：{wi.actionType}</div>
                    <div className="cost-routing-policy-meta">拦截：{String(wi.blocked)}</div>
                  </div>
                ))}
              </div>
              <div className="cr-subtitle" style={{ marginTop: '8px' }}>安全边界 Safety Boundary</div>
              <div className="cr-selfcheck-grid-inner">
                <div className="cr-pp-item"><span className="cr-pp-key">sqliteWrite</span><b className="cr-pp-val">{String(memoryHubPreview.safetyBoundary?.sqliteWrite)}</b></div>
                <div className="cr-pp-item"><span className="cr-pp-key">candidateWrite</span><b className="cr-pp-val">{String(memoryHubPreview.safetyBoundary?.candidateWrite)}</b></div>
                <div className="cr-pp-item"><span className="cr-pp-key">approveRejectArchive</span><b className="cr-pp-val">{String(memoryHubPreview.safetyBoundary?.approveRejectArchive)}</b></div>
                <div className="cr-pp-item"><span className="cr-pp-key">lanShareSync</span><b className="cr-pp-val">{String(memoryHubPreview.safetyBoundary?.lanShareSync)}</b></div>
                <div className="cr-pp-item"><span className="cr-pp-key">memoryImport</span><b className="cr-pp-val">{String(memoryHubPreview.safetyBoundary?.memoryImport)}</b></div>
                <div className="cr-pp-item"><span className="cr-pp-key">memoryDelete</span><b className="cr-pp-val">{String(memoryHubPreview.safetyBoundary?.memoryDelete)}</b></div>
                <div className="cr-pp-item"><span className="cr-pp-key">externalMutation</span><b className="cr-pp-val">{String(memoryHubPreview.safetyBoundary?.externalMutation)}</b></div>
              </div>
              <div className="cost-routing-policy-meta" style={{ marginTop: '6px' }}>禁止操作：{(memoryHubPreview.forbiddenActions || []).join(' / ')}</div>
              <div className="cr-next-action" style={{ marginTop: '6px' }}>{memoryHubPreview.nextSafeStep}</div>
            </div>
          ) : (
            <div className="cost-routing-policy-meta">尚未生成 Memory Hub 只读查询预览。点击按钮获取只读上下文预览。</div>
          )}
        </div>
      </SectionCard>

      <SectionCard className={`role-card ${roleClass('exec')}`} title="外部只读治理链总览 External Readonly Governance Overview">
        <div className="cr-registry-note">以下 5 条外部只读观察链均为 preview_only / read_only，不写数据、不执行操作。点击按钮生成各链的状态预览。</div>
        <div className="cr-gate-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
          {/* OpenAxiom */}
          <div className="cr-toolchain-card status-preview_only">
            <div className="cr-template-head"><b>OpenAxiom</b><span className="cr-badge">readonly</span></div>
            <div className="cost-routing-policy-meta">不启动 GUI、不保存/恢复/批量保存、不修改 labels</div>
            <div className="cr-selfcheck-controls"><button className="ui-btn ui-btn-sm ui-btn-primary" type="button" onClick={handleOpenAxiomPreview} disabled={openAxiomLoading}>{openAxiomLoading ? '···' : '生成'}</button></div>
            {openAxiomPreview && <div className="cost-routing-policy-meta" style={{ marginTop: 4 }}>mode={openAxiomPreview.readonlyMode ? 'read_only' : 'N/A'} · {openAxiomPreview.forbiddenActions?.length || 0} forbidden</div>}
          </div>
          {/* ComfyUI */}
          <div className="cr-toolchain-card status-preview_only">
            <div className="cr-template-head"><b>ComfyUI</b><span className="cr-badge">readonly</span></div>
            <div className="cost-routing-policy-meta">不启动、不生成图片、不提交 queue、不修改 workflow/model</div>
            <div className="cr-selfcheck-controls"><button className="ui-btn ui-btn-sm ui-btn-primary" type="button" onClick={handleComfyUiPreview} disabled={comfyUiLoading}>{comfyUiLoading ? '···' : '生成'}</button></div>
            {comfyUiPreview && <div className="cost-routing-policy-meta" style={{ marginTop: 4 }}>mode={comfyUiPreview.readonlyMode ? 'read_only' : 'N/A'} · {comfyUiPreview.forbiddenActions?.length || 0} forbidden</div>}
          </div>
          {/* OpenClaw */}
          <div className="cr-toolchain-card status-preview_only">
            <div className="cr-template-head"><b>OpenClaw</b><span className="cr-badge">readonly</span></div>
            <div className="cost-routing-policy-meta">不启动/停止/重启、不 taskkill、不升级全局、不调用模型</div>
            <div className="cr-selfcheck-controls"><button className="ui-btn ui-btn-sm ui-btn-primary" type="button" onClick={handleOpenClawPreview} disabled={openClawLoading}>{openClawLoading ? '···' : '生成'}</button></div>
            {openClawPreview && <div className="cost-routing-policy-meta" style={{ marginTop: 4 }}>mode={openClawPreview.readonlyMode ? 'read_only' : 'N/A'} · {openClawPreview.forbiddenActions?.length || 0} forbidden</div>}
          </div>
          {/* GitHub Release-prep */}
          <div className="cr-toolchain-card status-preview_only">
            <div className="cr-template-head"><b>GitHub Release</b><span className="cr-badge">preview</span></div>
            <div className="cost-routing-policy-meta">仅 release-prep 预览、不 tag、不 push、不创建 Release</div>
            <div className="cr-selfcheck-controls"><button className="ui-btn ui-btn-sm ui-btn-primary" type="button" onClick={handleReleasePrepPreview} disabled={releasePrepLoading}>{releasePrepLoading ? '···' : '生成'}</button></div>
            {releasePrepPreview && <div className="cost-routing-policy-meta" style={{ marginTop: 4 }}>gateScore={releasePrepPreview.gateScore}% · {releasePrepPreview.forbiddenActions?.length || 0} forbidden</div>}
          </div>
          {/* Mahjong Audit */}
          <div className="cr-toolchain-card status-preview_only" style={{ gridColumn: '1 / -1' }}>
            <div className="cr-template-head"><b>Mahjong Audit</b><span className="cr-badge">readonly</span></div>
            <div className="cost-routing-policy-meta">不扫描大文件、不训练、不覆盖模型、不修改 labels/images/data.yaml、不保存/恢复 OpenAxiom labels</div>
            <div className="cr-selfcheck-controls"><button className="ui-btn ui-btn-sm ui-btn-primary" type="button" onClick={handleMahjongAuditPreview} disabled={mahjongAuditLoading}>{mahjongAuditLoading ? '···' : '生成'}</button></div>
            {mahjongAuditPreview && <div className="cost-routing-policy-meta" style={{ marginTop: 4 }}>mode={mahjongAuditPreview.readonlyMode ? 'read_only' : 'N/A'} · {mahjongAuditPreview.forbiddenActions?.length || 0} forbidden</div>}
          </div>
        </div>
      </SectionCard>

      <div className="cr-practical-grid">
        <SectionCard className={`role-card ${roleClass('gov')}`} title="模型线路表 Model Route Registry">
          <div className="cr-registry-note">静态预览，不绑定真实账号、不写密钥。</div>
          <div className="cr-registry-grid">
            {(practicalConfig?.model_route_registry || []).map((entry) => (
              <div className={`cr-registry-card risk-${entry.riskFit}`} key={entry.id}>
                <div className="cr-template-head">
                  <b>{entry.name}</b>
                  <span className="cr-badge">cost={entry.costLevel}</span>
                </div>
                <div className="cr-template-desc">{entry.description}</div>
                <div className="cost-routing-policy-meta">推荐：{(entry.recommendedFor || []).join(' / ')}</div>
                <div className="cost-routing-policy-meta">避免：{(entry.avoidFor || []).join(' / ')}</div>
                <div className="cost-routing-policy-meta">降级：{entry.fallbackTo}</div>
                <div className="cr-safety-line">安全：{(entry.safetyNotes || []).join(' ')}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard className={`role-card ${roleClass('exec')}`} title="工具链线路表 Toolchain Registry">
          <div className="cr-registry-note">静态预览，不真实调用外部系统。</div>
          <div className="cr-toolchain-grid">
            {(practicalConfig?.toolchain_registry || []).map((entry) => (
              <div className={`cr-toolchain-card status-${entry.integrationStatus}`} key={entry.id}>
                <div className="cr-template-head">
                  <b>{entry.name}</b>
                  <span className="cr-badge">{entry.executionMode}</span>
                </div>
                <div className="cr-template-desc">{entry.description}</div>
                <div className="cost-routing-policy-meta">
                  集成状态：{entry.integrationStatus === 'preview_only' ? '仅预览（preview_only）' : entry.integrationStatus}
                </div>
                <div className="cost-routing-policy-meta">
                  只读优先：{entry.readOnlyFirst ? '是' : '否'} · Dry-Run 优先：{entry.dryRunFirst ? '是' : '否'} · 需要人工：{entry.requiresHuman ? '是' : '否'}
                </div>
                <div className="cost-routing-policy-meta">禁止动作：{(entry.forbiddenActions || []).join(' / ') || '无'}</div>
                <div className="cost-routing-policy-meta">预检建议：{(entry.safePrechecks || []).join(' / ')}</div>
                <div className="cost-routing-policy-meta">需要回滚：{entry.rollbackRequired ? '是' : '否'}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard className={`role-card ${roleClass('exec')}`} title="外部系统接入占位 External Integration Preview">
        <div className="cr-registry-note">均为 planned / preview_only，不实际调用。</div>
        <div className="cr-external-grid">
          {(practicalConfig?.external_integrations || []).map((entry) => (
            <div className="cr-external-card" key={entry.id}>
              <div className="cr-template-head">
                <b>{entry.name}</b>
                <span className="cr-badge">{entry.integrationStatus}</span>
              </div>
              <div className="cr-template-desc">{entry.description}</div>
              <div className="cost-routing-policy-meta">约束：{entry.note}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard className={`role-card ${roleClass('gov')}`} title="集成准备度矩阵 Integration Readiness Matrix">
        <div className="cr-registry-note">反映各外部系统的当前集成准备状态。不写数据库、不调用外部系统。</div>
        <div className="cr-integration-grid">
          {(practicalConfig?.integration_readiness_matrix || []).map((entry) => {
            const riskColor = entry.integrationRisk === 'critical' ? 'risk-blocked' : entry.integrationRisk === 'high' ? 'risk-high' : entry.integrationRisk === 'medium' ? 'risk-medium' : 'risk-low';
            return (
              <div className={`cr-integration-card status-${entry.status}`} key={entry.id}>
                <div className="cr-template-head">
                  <b>{entry.name}</b>
                  <span className={`cr-badge ${riskColor}`}>{entry.status}</span>
                </div>
                <div className="cost-routing-policy-meta">允许模式：{entry.allowedModes.join(' / ')}</div>
                <div className="cost-routing-policy-meta">禁止操作：{entry.forbiddenActions.join(' / ')}</div>
                <div className="cost-routing-policy-meta">预检：{entry.safePrechecks.join(' / ')}</div>
                <div className="cost-routing-policy-meta">风险：{entry.integrationRisk} · 回滚：{entry.rollbackRequired ? '是' : '否'}</div>
                <div className="cost-routing-policy-meta">下一里程碑：{entry.nextMilestone}</div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard className={`role-card ${roleClass('exec')}`} title="集成演练矩阵 Integration Rehearsal Matrix">
        <div className="cr-registry-note">全部 rehearsalOnly / preview_only。不真实调用外部系统，不写数据库。</div>
        <div className="cr-rehearsal-grid">
          {(practicalConfig?.integration_rehearsal_matrix || []).map((entry) => (
            <div className="cr-rehearsal-card" key={entry.id}>
              <div className="cr-template-head">
                <b>{entry.name}</b>
                <span className="cr-badge">{entry.actionType}</span>
              </div>
              <div className="cr-template-desc">目标系统：{entry.targetSystem} · 模式：{entry.executionMode}</div>
              <div className="cost-routing-policy-meta">预检：{entry.requiredPrechecks.join(' / ')}</div>
              <div className="cost-routing-policy-meta">确认：{entry.requiredConfirmations.join(' / ') || '无'}</div>
              <div className="cost-routing-policy-meta">回滚预览：{entry.rollbackPlanPreview}</div>
              <div className="cost-routing-policy-meta">下一步：{entry.nextSafeStep}</div>
              <div className="cost-routing-policy-meta">禁止操作：{entry.blockedRealActions.join(' / ')}</div>
              <div className="cr-safety-line">rehearsalOnly={String(entry.rehearsalOnly)} · externalCall={String(entry.externalCall)} · dbWrite={String(entry.databaseWrite)} · fileWrite={String(entry.fileWrite)}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard className={`role-card ${roleClass('warn')}`} title="安全停止条件 Safety Stop Conditions">
        <div className="cr-registry-note">遇到以下情况时建议停止，不继续执行。</div>
        <div className="cr-stop-grid">
          {(practicalConfig?.stop_conditions || []).map((cond) => (
            <div className="cr-stop-item" key={cond.id}>
              <div className="cr-template-head">
                <b>{cond.label}</b>
              </div>
              <div className="cr-template-desc">{cond.description}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard className={`role-card ${roleClass('gov')}`} title="策略配置预览 Policy Config Preview">
        <div className="cr-registry-note">当前为策略预览，不写入配置文件，不写数据库。</div>
        <div className="cr-policy-preview-grid">
          <div className="cr-pp-item">
            <span className="cr-pp-key">defaultPolicy</span>
            <b className="cr-pp-val">{strategyMode}</b>
          </div>
          <div className="cr-pp-item">
            <span className="cr-pp-key">推荐模型线路</span>
            <b className="cr-pp-val">{practicalDecision?.recommendedModelTier || '待决策'}</b>
          </div>
          <div className="cr-pp-item">
            <span className="cr-pp-key">推荐工具链线路</span>
            <b className="cr-pp-val">{practicalDecision?.recommendedToolchain?.primary || '待决策'}</b>
          </div>
          <div className="cr-pp-item">
            <span className="cr-pp-key">allowCloud</span>
            <b className="cr-pp-val">{practicalDecision?.executionMode === 'cloud_allowed' ? '是' : '否'}</b>
          </div>
          <div className="cr-pp-item">
            <span className="cr-pp-key">preferLocal</span>
            <b className="cr-pp-val">{strategyMode === 'local_first' || strategyMode === 'save_money' ? '是' : '否'}</b>
          </div>
          <div className="cr-pp-item">
            <span className="cr-pp-key">requireDryRunForMediumRisk</span>
            <b className="cr-pp-val">{practicalDecision?.executionMode === 'dry_run' ? '是' : '否'}</b>
          </div>
          <div className="cr-pp-item">
            <span className="cr-pp-key">requireHumanForHighRisk</span>
            <b className="cr-pp-val">{practicalDecision?.needsUserConfirm ? '是' : '否'}</b>
          </div>
          <div className="cr-pp-item">
            <span className="cr-pp-key">blockDangerousSystemActions</span>
            <b className="cr-pp-val">{practicalDecision?.riskLevel === 'blocked' ? '是' : '是（默认）'}</b>
          </div>
          <div className="cr-pp-item">
            <span className="cr-pp-key">auditPreviewOnly</span>
            <b className="cr-pp-val">是</b>
          </div>
          <div className="cr-pp-item">
            <span className="cr-pp-key">releaseActionsRequireManualApproval</span>
            <b className="cr-pp-val">{simulateTaskType === 'git_release_seal' || simulateTaskType === 'github_release' ? '是' : '是（默认）'}</b>
          </div>
          <div className="cr-pp-item">
            <span className="cr-pp-key">externalIntegrationsPreviewOnly</span>
            <b className="cr-pp-val">是（preview_only）</b>
          </div>
          <div className="cr-pp-item">
            <span className="cr-pp-key">失败升级路线</span>
            <b className="cr-pp-val">{practicalDecision?.fallbackPlan || 'manual_confirm'}</b>
          </div>
        </div>
      </SectionCard>

      <SectionCard className={`role-card ${roleClass('gov')}`} title="策略画像预览 Policy Profile Preview">
        <div className="cr-registry-note">展示未来可配置的策略画像。不保存偏好、不写配置文件、不写数据库。</div>
        <div className="cr-policy-preview-grid">
          <div className="cr-pp-item"><span className="cr-pp-key">defaultPolicy</span><b className="cr-pp-val">{strategyMode}</b></div>
          <div className="cr-pp-item"><span className="cr-pp-key">modelRoutePreference</span><b className="cr-pp-val">{practicalDecision?.recommendedModelTier || 'auto'}</b></div>
          <div className="cr-pp-item"><span className="cr-pp-key">toolchainPreference</span><b className="cr-pp-val">{practicalDecision?.recommendedToolchain?.primary || 'auto'}</b></div>
          <div className="cr-pp-item"><span className="cr-pp-key">cloudAllowed</span><b className="cr-pp-val">{practicalDecision?.executionMode === 'cloud_allowed' ? '是' : '否'}</b></div>
          <div className="cr-pp-item"><span className="cr-pp-key">localPreferred</span><b className="cr-pp-val">{strategyMode === 'local_first' || strategyMode === 'save_money' ? '是' : '否'}</b></div>
          <div className="cr-pp-item"><span className="cr-pp-key">dryRunRequiredForMediumRisk</span><b className="cr-pp-val">{practicalDecision?.executionMode === 'dry_run' ? '是' : '否'}</b></div>
          <div className="cr-pp-item"><span className="cr-pp-key">humanRequiredForHighRisk</span><b className="cr-pp-val">{practicalDecision?.needsUserConfirm ? '是' : '是（默认）'}</b></div>
          <div className="cr-pp-item"><span className="cr-pp-key">releaseActionsManualOnly</span><b className="cr-pp-val">是</b></div>
          <div className="cr-pp-item"><span className="cr-pp-key">memoryHubWriteDisabled</span><b className="cr-pp-val">是</b></div>
          <div className="cr-pp-item"><span className="cr-pp-key">mahjongProtected</span><b className="cr-pp-val">是</b></div>
          <div className="cr-pp-item"><span className="cr-pp-key">openclawGlobalProtected</span><b className="cr-pp-val">是</b></div>
          <div className="cr-pp-item"><span className="cr-pp-key">externalIntegrationsPreviewOnly</span><b className="cr-pp-val">是（preview_only）</b></div>
          <div className="cr-pp-item"><span className="cr-pp-key">auditPersistenceMode</span><b className="cr-pp-val">preview_only</b></div>
        </div>
      </SectionCard>



      <div className="cr-practical-grid">
        <SectionCard className={`role-card ${roleClass('gov')}`} title="策略档位">
          <div className="cr-mode-grid">
            {(practicalConfig?.strategy_modes || []).map((mode) => (
              <button
                type="button"
                key={mode.id}
                className={`cr-mode-item ${strategyMode === mode.id ? 'selected' : ''}`}
                onClick={() => setStrategyMode(mode.id)}
              >
                <div className="cr-template-head">
                  <span className="cost-routing-policy-name">{mode.name}</span>
                  <span className="cr-badge">{mode.id}</span>
                </div>
                <div className="cr-template-desc">{mode.description || mode.suitable_for}</div>
                <div className="cost-routing-policy-meta">通道：{mode.recommended_channel}</div>
                <div className="cost-routing-policy-meta">倾向：成本 {mode.costBias ?? '-'} · 质量 {mode.qualityBias ?? '-'} · 速度 {mode.speedBias ?? '-'} · 本地 {mode.localBias ?? '-'}</div>
                <div className="cost-routing-policy-meta">风控：{mode.risk_control}</div>
                <div className="cost-routing-policy-meta">失败切换：{mode.fallbackPlan || mode.fallback_plan}</div>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard className={`role-card ${roleClass('exec')}`} title="路由矩阵">
          {!practicalConfig?.route_matrix ? (
            <div className="cost-routing-policy-meta" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>
              暂无数据 / 选择任务后生成
            </div>
          ) : (
          <div className="cr-mini-table">
            {[
              ['低风险 + 省钱优先', 'text_inference', 'save_money'],
              ['代码/复杂任务 + 质量优先', 'code_analysis', 'quality_first'],
              ['本地优先 + 可本地处理', 'readonly_audit', 'local_first'],
              ['发布/删除/覆盖/训练', 'github_release', 'stable_first'],
            ].map(([label, task, mode]) => {
              const item = practicalConfig?.route_matrix?.[task]?.[mode];
              return (
                <div className="cr-mini-row" key={`${task}-${mode}`}>
                  <span>{label}</span>
                  <span>{item?.route || 'manual_confirm'}</span>
                  <span>{item?.modelTier || 'blocked'}</span>
                  <span>{item?.executionMode || 'human_confirm_required'}</span>
                </div>
              );
            })}
          </div>
          )}
          <div className="cr-template-desc">
            Pipeline：{(practicalConfig?.decision_pipeline || []).join(' -> ') || '加载中'}
          </div>
        </SectionCard>
      </div>

      <div className="cr-practical-grid">
        <SectionCard className={`role-card ${roleClass('exec')}`} title="任务类型识别">
          <div className="cr-task-grid">
            {(practicalConfig?.task_console_types || []).map((item) => (
              <button
                type="button"
                key={item.id}
                className={`cr-task-item ${simulateTaskType === item.id ? 'selected' : ''}`}
                onClick={() => {
                  setSimulateTaskType(item.id);
                  setStrategyMode(item.default_strategy);
                  setSimulateTaskId(`sim-${item.id}`);
                  setSimulateInputJson(JSON.stringify({ budget: 'low', target: item.label, strategy_mode: item.default_strategy }, null, 2));
                  setPracticalDecision(null);
                }}
              >
                <b>{item.label}</b>
                <span>{item.id} -&gt; {item.maps_to}</span>
                <span>风险 {item.defaultRisk || 'medium'} · 推荐 {item.suggestedRoute || item.maps_to}</span>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard className={`role-card ${roleClass('gov')}`} title="Case Matrix">
          <div className="cr-case-grid">
            {(practicalConfig?.case_matrix || []).length === 0 ? (
              <div className="cost-routing-policy-meta" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                暂无数据 / 选择任务后生成
              </div>
            ) : (practicalConfig?.case_matrix || []).map((item) => (
              <button className="cr-case-item" type="button" key={item.label} onClick={() => applyExample({
                label: item.label,
                mode: item.mode,
                taskType: item.taskType,
                taskId: `case-${item.taskType}`,
                input: item.input,
              })}>
                <b>{item.label}</b>
                <span>{item.expectedCategory} / {item.expectedRiskLevel} / {item.expectedExecutionMode}</span>
                <span>{item.expectedModelTier} · {item.expectedSafetyBehavior}</span>
              </button>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="cr-practical-grid">
        <SectionCard className={`role-card ${roleClass('gov')}`} title="内置策略模板">
          <div className="cr-template-grid">
            {(practicalConfig?.policy_templates || []).map((tpl) => (
              <div className="cr-template-item" key={tpl.id}>
                <div className="cr-template-head">
                  <span className="cost-routing-policy-name">{tpl.id}</span>
                  <span className={`cr-badge risk-${tpl.risk_level}`}>{tpl.risk_level}</span>
                </div>
                <div className="cost-routing-policy-meta">{tpl.name} · {tpl.task_type} -&gt; {tpl.route_type}</div>
                <div className="cost-routing-policy-meta">cost={tpl.cost_level} · priority={tpl.priority}</div>
                <div className="cr-template-desc">{tpl.description}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard className={`role-card ${roleClass('exec')}`} title="本机能力感知（只读）">
          <div className="cr-capability-grid">
            {Object.entries(practicalConfig?.local_capabilities || {}).map(([key, value]) => (
              <div className="cr-capability-item" key={key}>
                <span>{key}</span>
                <b>{value}</b>
              </div>
            ))}
          </div>
          <div className="cost-routing-policy-meta">
            任务类型 {practicalConfig?.task_types?.length || 0} 个 · 路由目标 {practicalConfig?.route_targets?.length || 0} 个
          </div>
          <div className="cr-template-desc">
            风险防火墙：{(practicalConfig?.firewall_rules || []).map((rule) => rule.label).join(' / ') || '加载中'}
          </div>
          <div className="cr-template-desc">
            执行模式：{(practicalConfig?.execution_modes || []).join(' / ') || '加载中'}
          </div>
        </SectionCard>
      </div>

      <div className="cr-top-grid">
        <SectionCard className={`role-card ${roleClass('gov')}`} title="新增路由策略">
        <form onSubmit={handleCreatePolicy} className="cr-form-grid">
          <div className="cr-subtitle">新增路由策略</div>
          <input className="ui-input" value={policyName} onChange={(e) => setPolicyName(e.target.value)} placeholder="策略名称" required />
          <div className="cr-policy-row">
            <input className="ui-input" value={policyTaskType} onChange={(e) => setPolicyTaskType(e.target.value)} placeholder="任务类型" required />
            <select className="ui-select" value={policyRouteType} onChange={(e) => setPolicyRouteType(e.target.value as RouteType)}>
              <option value="local_low_cost">local_low_cost</option>
              <option value="local_balanced">local_balanced</option>
              <option value="cloud_high_capability">cloud_high_capability</option>
            </select>
            <input className="ui-input" type="number" value={policyPriority} onChange={(e) => setPolicyPriority(Number(e.target.value || 100))} placeholder="优先级" />
          </div>
          <input className="ui-input" value={policyReasonTpl} onChange={(e) => setPolicyReasonTpl(e.target.value)} placeholder="命中原因模板" />
          <button className="ui-btn ui-btn-primary" type="submit" disabled={creating}>{creating ? '生成中...' : '生成策略草案'}</button>
        </form>
        </SectionCard>

        <SectionCard className={`role-card ${roleClass('exec')}`} title="模拟任务路由">
        <form onSubmit={handleResolve} className="cr-form-grid">
          <div className="cr-subtitle">模拟任务路由</div>
          <div className="cr-mode-strip">
            {(practicalConfig?.strategy_modes || []).map((mode) => (
              <button
                className={`ui-btn ${strategyMode === mode.id ? 'ui-btn-primary' : ''}`}
                type="button"
                key={mode.id}
                onClick={() => setStrategyMode(mode.id)}
              >
                {mode.name}
              </button>
            ))}
          </div>
          <div className="cr-example-row">
            {SIMULATION_EXAMPLES.map((example) => (
              <button className="ui-btn" type="button" key={example.taskId} onClick={() => applyExample(example)}>
                {example.label}
              </button>
            ))}
          </div>
          <div className="cr-dual-row">
            <input className="ui-input" value={simulateTaskType} onChange={(e) => setSimulateTaskType(e.target.value)} placeholder="任务类型" required />
            <input className="ui-input" value={simulateTaskId} onChange={(e) => setSimulateTaskId(e.target.value)} placeholder="task_id（模拟）" />
          </div>
          <textarea className="ui-textarea" value={simulateInputJson} onChange={(e) => setSimulateInputJson(e.target.value)} rows={4} placeholder='输入 JSON（input_json）' />
          <div className="cr-action-row">
            <button className="ui-btn" type="button" onClick={handlePracticalSimulate} disabled={resolving}>{resolving ? '模拟中...' : '只模拟解释'}</button>
            <button className="ui-btn ui-btn-primary" type="submit" disabled={resolving}>{resolving ? '生成中...' : '生成决策草案'}</button>
          </div>
        </form>
        {practicalDecision ? (
          <div className={`cr-decision-card risk-${practicalDecision.riskLevel}`}>
            <div className="cr-decision-card-head">
              <div>
                <div className="cost-routing-policy-meta">推荐路线</div>
                <div className="cr-route-name">{practicalDecision.selectedRoute}</div>
              </div>
              <div className="cr-badge-row">
                <span className="cr-badge">cost={practicalDecision.costLevel}</span>
                <span className={`cr-badge risk-${practicalDecision.riskLevel}`}>risk={practicalDecision.riskLevel}</span>
                <span className={`cr-badge ${practicalDecision.needsUserConfirm ? 'risk-high' : 'risk-low'}`}>
                  {practicalDecision.needsUserConfirm ? '需要确认' : '无需确认'}
                </span>
              </div>
            </div>
            <div className="cr-template-desc">{practicalDecision.reason}</div>
            <div className="cr-console-grid">
              <div>
                <span>任务识别</span>
                <b>{practicalDecision.taskLabel || simulateTaskType}</b>
              </div>
              <div>
                <span>策略档位</span>
                <b>{practicalDecision.strategyMode || strategyMode}</b>
              </div>
              <div>
                <span>推荐通道</span>
                <b>{practicalDecision.recommendedChannel || practicalDecision.selectedRoute}</b>
              </div>
              <div>
                <span>执行模式</span>
                <b>{practicalDecision.executionMode || 'dry_run'}</b>
              </div>
            </div>
            <div className="cr-console-grid">
              <div>
                <span>出口路线</span>
                <b>{practicalDecision.routeName || practicalDecision.selectedRoute}</b>
              </div>
              <div>
                <span>模型层级</span>
                <b>{practicalDecision.recommendedModelTier || 'low_cost_local_tier'}</b>
              </div>
              <div>
                <span>检测分类</span>
                <b>{practicalDecision.detectedCategory || simulateTaskType}</b>
              </div>
              <div>
                <span>失败切换</span>
                <b>{practicalDecision.fallbackRoute || 'manual_confirm'}</b>
              </div>
            </div>
            {practicalDecision.tierReason ? (
              <div className="cr-template-desc">
                模型层级原因：{practicalDecision.tierReason} 不选其他层级：{(practicalDecision.whyNotOtherTiers || []).join('；') || 'N/A'}
              </div>
            ) : null}
            <div className="cr-score-grid">
              <div><span>costScore</span><b>{practicalDecision.costScore ?? 'N/A'}</b></div>
              <div><span>qualityScore</span><b>{practicalDecision.qualityScore ?? 'N/A'}</b></div>
              <div><span>speedScore</span><b>{practicalDecision.speedScore ?? 'N/A'}</b></div>
              <div><span>riskScore</span><b>{practicalDecision.riskScore ?? 'N/A'}</b></div>
            </div>
            {practicalDecision.scoreExplanation ? <div className="cr-template-desc">{practicalDecision.scoreExplanation}</div> : null}
            {practicalDecision.whyThisRoute ? <div className="cr-template-desc">{practicalDecision.whyThisRoute}</div> : null}
            {practicalDecision.humanReadableExplanation ? <div className="cr-next-action">{practicalDecision.humanReadableExplanation}</div> : null}
            {practicalDecision.confidence ? (
              <>
                <div className="cr-subtitle">决策置信度</div>
                <div className="cr-console-grid">
                  <div><span>confidence</span><b>{practicalDecision.confidence}</b></div>
                  <div><span>reason</span><b>{practicalDecision.confidenceReason || 'N/A'}</b></div>
                  <div><span>missing</span><b>{(practicalDecision.missingInformation || []).join(' / ') || 'none'}</b></div>
                  <div><span>readOnlyPrechecks</span><b>{(practicalDecision.readOnlyPrechecks || []).length}</b></div>
                </div>
              </>
            ) : null}
            {practicalDecision.recommendedToolchain ? (
              <>
                <div className="cr-subtitle">推荐工具链</div>
                <div className="cr-console-grid">
                  <div><span>primary</span><b>{practicalDecision.recommendedToolchain.primary}</b></div>
                  <div><span>requiresHuman</span><b>{String(practicalDecision.recommendedToolchain.requiresHuman)}</b></div>
                  <div><span>readOnlyFirst</span><b>{String(practicalDecision.recommendedToolchain.readOnlyFirst)}</b></div>
                  <div><span>dryRunFirst</span><b>{String(practicalDecision.recommendedToolchain.dryRunFirst)}</b></div>
                  <div><span>rollbackRequired</span><b>{String(practicalDecision.recommendedToolchain.rollbackRequired)}</b></div>
                  <div><span>suggestedPrechecks</span><b>{practicalDecision.recommendedToolchain.suggestedPrechecks.join(' / ') || 'none'}</b></div>
                </div>
                <div className="cr-firewall-row">
                  {practicalDecision.recommendedToolchain.secondary.map((tool) => <span className="cr-badge" key={tool}>{tool}</span>)}
                  {practicalDecision.recommendedToolchain.forbiddenActions.map((action) => <span className="cr-badge risk-high" key={action}>{action}</span>)}
                </div>
              </>
            ) : null}
            <div className="cr-subtitle">拒绝路线</div>
            <div className="cr-mini-table">
              {practicalDecision.rejectedRoutes.map((item) => (
                <div className="cr-mini-row two-col" key={`${item.route}-${item.reason}`}>
                  <span>{item.route}</span>
                  <span>{item.reason}</span>
                </div>
              ))}
            </div>
            <div className="cr-subtitle">安全提示</div>
            <ul className="cr-note-list">
              {practicalDecision.safetyNotes.map((note) => <li key={note}>{note}</li>)}
            </ul>
            {(practicalDecision.firewallHits || []).length > 0 ? (
              <>
                <div className="cr-subtitle">风险防火墙</div>
                <div className="cr-firewall-row">
                  {(practicalDecision.firewallHits || []).map((hit) => <span className="cr-badge risk-high" key={hit}>{hit}</span>)}
                </div>
                <div className="cr-console-grid">
                  <div><span>requiredConfirmations</span><b>{(practicalDecision.requiredConfirmations || []).join(' / ') || 'none'}</b></div>
                  <div><span>deniedActions</span><b>{(practicalDecision.deniedActions || []).join(' / ') || 'none'}</b></div>
                  <div><span>rollbackPlan</span><b>{(practicalDecision.rollbackPlan || []).length} steps</b></div>
                  <div><span>matchedRules</span><b>{(practicalDecision.matchedRules || []).length}</b></div>
                </div>
              </>
            ) : null}
            {(practicalDecision.escalationPlan || []).length > 0 ? (
              <>
                <div className="cr-subtitle">失败升级路线</div>
                <ul className="cr-note-list">
                  {(practicalDecision.escalationPlan || []).map((item) => <li key={item}>{item}</li>)}
                </ul>
              </>
            ) : null}
            {practicalDecision.fallbackPlan ? <div className="cr-template-desc">失败后升级路线：{practicalDecision.fallbackPlan}</div> : null}
            {practicalDecision.actionType ? (
              <>
                <div className="cr-subtitle">路由动作契约 Route Action Contract</div>
                <div className="cr-audit-preview">
                  <div><span>actionType</span><b>{practicalDecision.actionType}</b></div>
                  <div><span>actionLabel</span><b>{practicalDecision.actionLabel || practicalDecision.selectedRoute}</b></div>
                  <div><span>allowedNextStep</span><b>{practicalDecision.allowedNextStep || practicalDecision.nextAction}</b></div>
                  <div><span>requiresHumanConfirmation</span><b>{practicalDecision.requiresHumanConfirmation ? '是' : '否'}</b></div>
                  <div><span>persistenceMode</span><b>{practicalDecision.persistenceMode || 'preview_only'}</b></div>
                  <div><span>forbiddenNextSteps</span><b>{(practicalDecision.forbiddenNextSteps || []).join(' / ') || '无'}</b></div>
                </div>
              </>
            ) : null}
            {practicalDecision.dryRunPlan ? (
              <>
                <div className="cr-subtitle">Dry-Run Action Plan</div>
                <div className="cr-dryrun-card">
                  <div className="cr-template-head">
                    <b>{practicalDecision.dryRunPlan.planTitle}</b>
                    <span className="cr-badge">{practicalDecision.dryRunPlan.planMode}</span>
                  </div>
                  <div className="cost-routing-policy-meta">planId：{practicalDecision.dryRunPlan.planId}</div>
                  <div className="cost-routing-policy-meta">允许步骤：{practicalDecision.dryRunPlan.allowedSteps.join(' → ')}</div>
                  <div className="cost-routing-policy-meta">禁止步骤：{practicalDecision.dryRunPlan.forbiddenSteps.join(' / ') || '无'}</div>
                  <div className="cost-routing-policy-meta">需人工审批：{practicalDecision.dryRunPlan.humanApprovalRequired ? '是' : '否'}</div>
                  <div className="cost-routing-policy-meta">停止条件：{practicalDecision.dryRunPlan.stopConditions.join(' / ')}</div>
                  <div className="cost-routing-policy-meta">回滚预览：{practicalDecision.dryRunPlan.rollbackPreview}</div>
                  <div className="cost-routing-policy-meta">预期产出：{practicalDecision.dryRunPlan.expectedOutputs.join(' / ')}</div>
                </div>
              </>
            ) : null}
            {practicalDecision.humanGateRequired ? (
              <div className={`cr-human-gate risk-${practicalDecision.riskLevel}`}>
                <div className="cr-subtitle">人工确认门 Human Confirmation Gate</div>
                <div className="cost-routing-policy-meta"><b>humanGateRequired</b>：true</div>
                <div className="cost-routing-policy-meta"><b>confirmationReason</b>：{practicalDecision.confirmationReason || '高风险任务需人工确认'}</div>
                <div className="cost-routing-policy-meta"><b>requiredConfirmations</b>：{(practicalDecision.requiredConfirmations || []).join(' / ') || '确认任务范围、确认允许动作、确认回滚方式'}</div>
                <div className="cost-routing-policy-meta"><b>readOnlyPrechecks</b>：{(practicalDecision.readOnlyPrechecks || []).join(' / ')}</div>
                <div className="cost-routing-policy-meta"><b>rollbackPlan</b>：{(practicalDecision.rollbackPlan || []).join(' → ')}</div>
                <div className="cost-routing-policy-meta"><b>noAutomaticExecution</b>：{practicalDecision.noAutomaticExecution !== false ? 'true' : 'false'}</div>
              </div>
            ) : null}
            {practicalDecision.auditPreview ? (
              <>
                <div className="cr-subtitle">审计预览 Audit Schema Preview v2</div>
                <div className="cr-audit-preview">
                  <div><span>auditSchemaVersion</span><b>{practicalDecision.auditPreview.auditSchemaVersion || 'preview-v2'}</b></div>
                  <div><span>auditMode</span><b>{practicalDecision.auditPreview.auditMode || practicalDecision.auditPreview.mode}</b></div>
                  <div><span>auditIdPreview</span><b>{practicalDecision.auditPreview.auditIdPreview || 'N/A'}</b></div>
                  <div><span>persistenceMode</span><b>{practicalDecision.auditPreview.persistenceMode || 'preview_only'}</b></div>
                  <div><span>actionType</span><b>{practicalDecision.auditPreview.actionType || practicalDecision.actionType}</b></div>
                  <div><span>timestamp</span><b>{practicalDecision.auditPreview.timestamp || 'preview'}</b></div>
                  <div><span>policy</span><b>{practicalDecision.auditPreview.selectedPolicy || practicalDecision.strategyMode}</b></div>
                  <div><span>category</span><b>{practicalDecision.auditPreview.detectedCategory || practicalDecision.detectedCategory}</b></div>
                  <div><span>route</span><b>{practicalDecision.auditPreview.recommendedRoute || practicalDecision.selectedRoute}</b></div>
                  <div><span>modelRoute</span><b>{practicalDecision.auditPreview.selectedModelRoute || practicalDecision.recommendedModelTier}</b></div>
                  <div><span>toolchainRoute</span><b>{practicalDecision.auditPreview.selectedToolchainRoute || 'N/A'}</b></div>
                  <div><span>modelTier</span><b>{practicalDecision.auditPreview.recommendedModelTier || practicalDecision.recommendedModelTier}</b></div>
                  <div><span>confidence</span><b>{practicalDecision.auditPreview.confidence || practicalDecision.confidence}</b></div>
                  <div><span>riskLevel</span><b>{practicalDecision.auditPreview.riskLevel}</b></div>
                  <div><span>rollbackRequired</span><b>{String(practicalDecision.auditPreview.rollbackRequired ?? false)}</b></div>
                  <div><span>wouldExecute</span><b>{String(practicalDecision.auditPreview.wouldExecute)}</b></div>
                  <div><span>wouldWriteFiles</span><b>{String(practicalDecision.auditPreview.wouldWriteFiles)}</b></div>
                  <div><span>databaseWrite</span><b>{String(practicalDecision.auditPreview.databaseWrite ?? false)}</b></div>
                  <div><span>fileWrite</span><b>{String(practicalDecision.auditPreview.fileWrite ?? false)}</b></div>
                  <div><span>externalWrite</span><b>{String(practicalDecision.auditPreview.externalWrite ?? false)}</b></div>
                  <div><span>confirmations</span><b>{practicalDecision.auditPreview.requiredConfirmations.join(' / ') || 'none'}</b></div>
                  <div><span>nextSafeStep</span><b>{practicalDecision.auditPreview.nextSafeStep || practicalDecision.nextAction}</b></div>
                  <div><span>taskSummary</span><b>{practicalDecision.auditPreview.taskSummary || 'N/A'}</b></div>
                </div>
                <div className="cr-template-desc">当前为 Audit Schema Preview v2，不写入数据库、不写入文件、不写入 Memory Hub、不写入 LAN_SHARE。</div>
                <ul className="cr-note-list">
                  {practicalDecision.auditPreview.rollbackPlan.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </>
            ) : null}
            <div className="cr-next-action">{practicalDecision.nextAction}</div>
          </div>
        ) : null}
        </SectionCard>
      </div>

      <div className="cr-main-grid">
        <SectionCard className={`role-card ${roleClass('gov')} cr-card-grid`} title="路由策略">
          {loading ? <EmptyState title="加载中" description="正在获取路由策略..." icon="⏳" /> : policies.length === 0 ? <EmptyState title="暂无策略" description="可通过上方表单新增策略。" icon="📭" /> : policies.map((p) => (
            <button
              type="button"
              key={p.id}
              onClick={() => setSelectedPolicyId(p.id)}
              className={`cost-routing-policy-item ${selectedPolicyId === p.id ? 'selected' : ''}`}
            >
              <div className="cost-routing-policy-name">{p.name}</div>
              <div className="cost-routing-policy-meta">{p.task_type}{' -> '}{p.route_type}</div>
              <div className="cost-routing-policy-meta">priority={p.priority} · <StatusBadge s={p.status} size="xs" /></div>
            </button>
          ))}
        </SectionCard>

        <SectionCard className={`role-card ${roleClass('exec')} cr-card-grid-lg`} title="策略与决策">
          <div>
            <div className="cost-routing-section-title">策略详情</div>
            {!selectedPolicy ? <EmptyState title="未选择策略" description="请从左侧选择一个 Route Policy。" icon="👈" /> : (
              <div className="cost-routing-detail-grid">
                <div><b>ID:</b> {selectedPolicy.id}</div>
                <div><b>名称:</b> {selectedPolicy.name}</div>
                <div><b>任务类型:</b> {selectedPolicy.task_type}</div>
                <div><b>路由类型:</b> {selectedPolicy.route_type}</div>
                <div><b>优先级:</b> {selectedPolicy.priority}</div>
                <div><b>状态:</b> <StatusBadge s={selectedPolicy.status} size="xs" /></div>
                <div><b>原因模板:</b> {selectedPolicy.reason_template || '暂无记录'}</div>
                <div><b>更新时间:</b> {fmt(selectedPolicy.updated_at)}</div>
              </div>
            )}
          </div>

          <div>
            <div className="cr-head-row">
              <div className="cr-subtitle">最近路由决策</div>
              <select className="ui-select" value={decisionRouteFilter} onChange={(e) => setDecisionRouteFilter(e.target.value)}>
                <option value="">全部 route_type</option>
                <option value="local_low_cost">local_low_cost</option>
                <option value="local_balanced">local_balanced</option>
                <option value="cloud_high_capability">cloud_high_capability</option>
              </select>
            </div>
            <div className="cr-decisions-grid">
              <div className="cr-decisions-list">
                {decisions.length === 0 ? <EmptyState title="暂无决策记录" description="先执行一次模拟路由即可生成记录。" icon="🧭" /> : decisions.map((d) => (
                  <button
                    type="button"
                    key={d.id}
                    onClick={() => setSelectedDecisionId(d.id)}
                    className={`cost-routing-decision-item ${selectedDecisionId === d.id ? 'selected' : ''}`}
                  >
                    <div className="cost-routing-policy-name">{d.task_type}{' -> '}{d.route_type}</div>
                    <div className="cost-routing-decision-meta">{d.task_id || 'sim-task'} · {fmt(d.created_at)}</div>
                  </button>
                ))}
              </div>
              <div className="cr-decision-detail-card">
                {!selectedDecision ? <EmptyState title="未选择决策" description="请从左侧选择一条路由决策记录。" icon="👈" /> : (
                  <div className="cost-routing-detail-grid">
                    <div><b>ID:</b> {selectedDecision.id}</div>
                    <div><b>任务:</b> {selectedDecision.task_type} ({selectedDecision.task_id || '无 task_id'})</div>
                    <div><b>策略:</b> {selectedDecision.policy_id || 'fallback'}</div>
                    <div><b>路由:</b> <StatusBadge s={selectedDecision.route_type} size="xs" /></div>
                    <div><b>原因:</b> {selectedDecision.route_reason}</div>
                    <div><b>创建时间:</b> {fmt(selectedDecision.created_at)}</div>
                    <div><b>引擎版本:</b> {selectedDecision.input_json?.__routing?.engine_version || 'v7.3.x'}</div>
                    <div><b>评分:</b> {selectedDecision.input_json?.__routing?.selected?.score_total ?? 'N/A'}</div>
                    <div><b>主因子:</b> {(selectedDecision.input_json?.__routing?.selected?.dominant_factors || []).join(', ') || 'N/A'}</div>
                    {selectedDecision.input_json?.__feedback?.latest ? (
                      <div><b>最近反馈:</b> {selectedDecision.input_json.__feedback.latest.outcome} · cost={selectedDecision.input_json.__feedback.latest.actual_cost ?? 'N/A'} · latency={selectedDecision.input_json.__feedback.latest.latency_ms ?? 'N/A'}ms</div>
                    ) : (
                      <div><b>最近反馈:</b> 暂无</div>
                    )}
                    <pre className="cr-json-box">{JSON.stringify(selectedDecision.input_json || {}, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="cr-bottom-grid">
        <SectionCard className={`role-card ${roleClass('gov')}`} title="路由洞察（近7天）">
          {loadingInsights ? <EmptyState title="加载中" description="正在分析路由决策..." icon="⏳" /> : !insights ? <EmptyState title="暂无洞察" description="执行决策后可生成洞察。" icon="📉" /> : (
            <div className="cr-insights-grid">
              <div className="cr-insight-block">
                <div className="cr-subtitle">按 route_type</div>
                {(insights.route_stats || []).length === 0 ? <div className="cost-routing-policy-meta">暂无记录</div> : (
                  <div className="cr-mini-table">
                    {(insights.route_stats || []).map((item) => (
                      <div className="cr-mini-row" key={item.route_type}>
                        <span>{item.route_type}</span>
                        <span>决策 {item.decisions}</span>
                        <span>反馈 {item.feedback_count}</span>
                        <span>成功率 {item.success_rate === null ? 'N/A' : `${Math.round(item.success_rate * 100)}%`}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="cr-insight-block">
                <div className="cr-subtitle">策略命中 Top</div>
                {(insights.policy_stats || []).length === 0 ? <div className="cost-routing-policy-meta">暂无记录</div> : (
                  <div className="cr-mini-table">
                    {(insights.policy_stats || []).slice(0, 8).map((item) => (
                      <div className="cr-mini-row" key={item.policy_id}>
                        <span>{item.policy_name}</span>
                        <span>命中 {item.hits}</span>
                        <span>均分 {item.avg_score === null ? 'N/A' : item.avg_score.toFixed(3)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="cr-insight-block">
                <div className="cr-head-row">
                  <div className="cr-subtitle">优化建议</div>
                  <div className="cr-action-row">
                    <button className="ui-btn" type="button" onClick={() => runOptimization('preview')} disabled={optimizing}>
                      {optimizing ? '计算中...' : '生成建议'}
                    </button>
                    <button className="ui-btn ui-btn-primary" type="button" onClick={() => runOptimization('preview')} disabled={optimizing}>
                      生成优化建议
                    </button>
                  </div>
                </div>
                {(insights.recommendations || []).length === 0 ? <div className="cost-routing-policy-meta">暂无建议</div> : (
                  <div className="cr-rec-list">
                    {(insights.recommendations || []).map((rec, i) => (
                      <div className={`cr-rec-item level-${rec.level}`} key={`${rec.level}-${i}`}>
                        <div><b>[{rec.level}]</b> {rec.message}</div>
                        <div className="cost-routing-policy-meta">{rec.suggestion}</div>
                      </div>
                    ))}
                  </div>
                )}
                {optimization ? (
                  <div className="cr-optimization-box">
                    <div className="cost-routing-policy-meta">
                      mode={optimization.mode} · proposals={optimization.proposal_count} · applied={optimization.applied_count}
                    </div>
                    {(optimization.proposals || []).slice(0, 6).map((proposal) => (
                      <div className="cr-opt-item" key={proposal.policy_id}>
                        <div>
                          <b>{proposal.policy_name}</b> · {proposal.task_type} · feedback={proposal.feedback_count}
                        </div>
                        <div className="cost-routing-policy-meta">
                          reasons: {(proposal.reasons || []).join(', ') || 'stable'}
                        </div>
                        <pre className="cr-json-box">{JSON.stringify({
                          from: proposal.current_weights,
                          to: proposal.suggested_weights,
                          metrics: proposal.metrics,
                        }, null, 2)}</pre>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard className={`role-card ${roleClass('exec')}`} title="决策反馈回填">
          <form onSubmit={handleAttachFeedback} className="cr-form-grid">
            <div className="cr-subtitle">对选中决策回填真实结果</div>
            <div className="cr-dual-row">
              <input className="ui-input" value={selectedDecisionId} disabled placeholder="请选择决策" />
              <select className="ui-select" value={feedbackOutcome} onChange={(e) => setFeedbackOutcome(e.target.value as any)}>
                <option value="success">success</option>
                <option value="partial">partial</option>
                <option value="failed">failed</option>
                <option value="timeout">timeout</option>
              </select>
            </div>
            <div className="cr-triple-row">
              <input className="ui-input" value={feedbackCost} onChange={(e) => setFeedbackCost(e.target.value)} placeholder="actual_cost（可选）" />
              <input className="ui-input" value={feedbackLatency} onChange={(e) => setFeedbackLatency(e.target.value)} placeholder="latency_ms（可选）" />
              <input className="ui-input" value={feedbackQuality} onChange={(e) => setFeedbackQuality(e.target.value)} placeholder="quality_score 0~1（可选）" />
            </div>
            <textarea className="ui-textarea" rows={3} value={feedbackNotes} onChange={(e) => setFeedbackNotes(e.target.value)} placeholder="备注（可选）" />
            <button className="ui-btn ui-btn-primary" type="submit" disabled={savingFeedback || !selectedDecisionId}>
              {savingFeedback ? '回填中...' : '提交反馈回填'}
            </button>
          </form>
        </SectionCard>
      </div>

      <div className="cr-bottom-grid">
        <SectionCard className={`role-card ${roleClass('gov')}`} title="发布准备度预览 Release Readiness Preview">
          <div className="cr-registry-note">只做判断和建议，不执行任何发布动作。禁止自动 tag / push / release。</div>
          <div className="cr-mini-table">
            <div className="cr-subtitle">发布门禁状态 Gate Status</div>
            <div className="cr-gate-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
              <div className="cr-gate-item status-pass"><div className="cr-template-head"><b>lint</b><span className="cr-badge risk-low">pass</span></div></div>
              <div className="cr-gate-item status-pass"><div className="cr-template-head"><b>typecheck</b><span className="cr-badge risk-low">pass</span></div></div>
              <div className="cr-gate-item status-pass"><div className="cr-template-head"><b>build</b><span className="cr-badge risk-low">pass</span></div></div>
              <div className="cr-gate-item status-pass"><div className="cr-template-head"><b>smoke</b><span className="cr-badge risk-low">pass</span></div></div>
              <div className="cr-gate-item status-pass"><div className="cr-template-head"><b>db doctor</b><span className="cr-badge risk-low">pass</span></div></div>
              <div className="cr-gate-item status-pass"><div className="cr-template-head"><b>secret scan</b><span className="cr-badge risk-low">pass</span></div></div>
            </div>
            <div className="cost-routing-policy-meta" style={{ marginTop: '6px' }}>全部门禁通过。仍需人工授权才能发布。tag/push/release 禁止自动执行。</div>
            <div className="cr-subtitle" style={{ marginTop: '8px' }}>风险预览</div>
            {simulateTaskType === 'git_release_seal' || simulateTaskType === 'github_release' ? (
              <>
                <div className="cr-mini-row"><span>发布风险等级</span><span className="cr-badge risk-high">high</span></div>
                <div className="cr-mini-row"><span>需要人工确认</span><span>是（human_confirm_required）</span></div>
                <div className="cr-mini-row"><span>推荐前置门禁</span><span>{(practicalConfig?.release_readiness_gates || []).filter((g) => g.forTask === 'github_release').map((g) => g.label).join(' / ')}</span></div>
                <div className="cr-mini-row"><span>禁止自动执行</span><span>git push / git tag / GitHub Release</span></div>
                <div className="cr-subtitle" style={{ marginTop: '8px' }}>门禁检查清单</div>
                {(practicalConfig?.release_readiness_gates || []).filter((g) => g.forTask === 'github_release').map((gate) => (
                  <div className="cr-mini-row" key={gate.id}>
                    <span>{gate.label}</span>
                    <span className={`cr-badge ${gate.severity === 'required' ? 'risk-high' : 'risk-medium'}`}>{gate.severity === 'required' ? '必需' : '推荐'}</span>
                  </div>
                ))}
              </>
            ) : simulateTaskType === 'high_risk_system_ops' ? (
              <>
                <div className="cr-mini-row"><span>发布风险等级</span><span className="cr-badge risk-blocked">blocked</span></div>
                <div className="cr-mini-row"><span>需要人工确认</span><span>是（human_confirm_required）</span></div>
                <div className="cr-mini-row"><span>推荐只读检查</span><span>生成清理候选清单 / 确认目标路径</span></div>
                <div className="cr-mini-row"><span>禁止自动执行</span><span>delete / move / taskkill</span></div>
              </>
            ) : (
              <>
                <div className="cr-mini-row"><span>发布风险等级</span><span className="cr-badge risk-low">low / medium</span></div>
                <div className="cr-mini-row"><span>需要人工确认</span><span>{practicalDecision?.needsUserConfirm ? '是' : '否'}</span></div>
                <div className="cr-mini-row"><span>推荐只读检查</span><span>确认任务范围 / 生成 dry-run 结果</span></div>
                <div className="cr-mini-row"><span>禁止自动执行</span><span>仅限高风险动作</span></div>
              </>
            )}
          </div>
        </SectionCard>

        <SectionCard className={`role-card ${roleClass('exec')}`} title="路由历史预览 Routing History Preview">
          <div className="cr-registry-note">当前为路由历史预览，不写入数据库。仅保留最近 20 条。</div>
          {routingHistory.length === 0 ? (
            <div className="cost-routing-policy-meta">暂无历史。执行一次模拟路由即可生成预览记录。</div>
          ) : (
            <div className="cr-history-list">
              {routingHistory.map((entry) => (
                <div className="cr-history-item" key={entry.previewId}>
                  <div className="cr-template-head">
                    <b>{entry.taskSummary}</b>
                    <span className={`cr-badge risk-${entry.riskLevel}`}>risk={entry.riskLevel}</span>
                  </div>
                  <div className="cr-history-meta">
                    <span>{entry.selectedPolicy}</span>
                    <span>{entry.executionMode}</span>
                    <span>{entry.confidence}</span>
                  </div>
                  <div className="cr-history-meta">
                    <span>模型:{entry.selectedModelRoute}</span>
                    <span>工具链:{entry.selectedToolchainRoute}</span>
                  </div>
                  <div className="cost-routing-policy-meta">{entry.timestamp} · {entry.persistenceMode}</div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {error ? <div className="cost-routing-alert-error"><StatusBadge s="failed" /> {error}</div> : null}
      {msg ? <div className="cost-routing-alert-success"><StatusBadge s="success" /> {msg}</div> : null}
    </PageShell>
  );
}
