import { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/builtin-sqlite.js';

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
type RuleKind = 'exact' | 'fallback';
type FeedbackOutcome = 'success' | 'partial' | 'failed' | 'timeout';

const ROUTE_TYPES: RouteType[] = [
  'local_low_cost',
  'local_balanced',
  'cloud_high_capability',
  'local_cpu',
  'local_gpu',
  'openclaw_stable_2026_3_23',
  'openclaw_sidecar_2026_5_12',
  'comfyui_8000',
  'cloud_reasoning_model',
  'manual_confirm',
  'blocked',
];
const STATUS_TYPES = ['active', 'disabled'];
const PRACTICAL_TASK_TYPES = [
  'text_inference',
  'code_analysis',
  'training',
  'image_generation',
  'image_to_video',
  'readonly_audit',
  'file_cleanup',
  'github_release',
  'memory_update',
  'dataset_operation',
] as const;
type PracticalTaskType = typeof PRACTICAL_TASK_TYPES[number];
type CostLevel = 'free' | 'low' | 'medium' | 'high' | 'unknown';
type PracticalRiskLevel = 'low' | 'medium' | 'high' | 'blocked';

type WeightKey = 'cost' | 'capability' | 'latency' | 'risk' | 'reliability' | 'load';
type RouteWeightSet = Record<WeightKey, number>;
type BudgetTier = 'low' | 'medium' | 'high' | 'unlimited';
type PriorityTier = 'low' | 'medium' | 'high' | 'critical';
type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
type DataSensitivity = 'public' | 'internal' | 'restricted';
type OptimizeMode = 'preview' | 'apply';

interface RouteProfile {
  route_type: RouteType;
  cost_index: number;
  capability_index: number;
  latency_ms: number;
  risk_isolation: number;
  reliability: number;
  throughput: number;
  gpu_capacity: boolean;
}

interface RoutingContext {
  task_type: string;
  task_kind: 'inference' | 'training' | 'evaluation' | 'other';
  budget_tier: BudgetTier;
  budget_limit: number;
  estimated_cost: number;
  estimated_tokens: number;
  estimated_runtime_ms: number;
  latency_sla_ms: number;
  gpu_needed: boolean;
  quality_priority: PriorityTier;
  risk_level: RiskLevel;
  data_sensitivity: DataSensitivity;
  require_reliability: boolean;
  tenant_id: string;
  project_id: string;
}

interface CandidateBreakdown {
  policy_id: string;
  policy_name: string;
  route_type: RouteType;
  task_type: string;
  rule_kind: RuleKind;
  priority: number;
  score_total: number;
  blocked: boolean;
  block_reasons: string[];
  components: RouteWeightSet;
  weights: RouteWeightSet;
  dominant_factors: string[];
}

interface PracticalDecision {
  selectedRoute: RouteType;
  costLevel: CostLevel;
  riskLevel: PracticalRiskLevel;
  needsUserConfirm: boolean;
  reason: string;
  rejectedRoutes: Array<{ route: RouteType; reason: string }>;
  safetyNotes: string[];
  nextAction: string;
}

const ROUTE_PROFILES: Record<RouteType, RouteProfile> = {
  local_low_cost: {
    route_type: 'local_low_cost',
    cost_index: 0.2,
    capability_index: 0.45,
    latency_ms: 900,
    risk_isolation: 0.93,
    reliability: 0.85,
    throughput: 0.68,
    gpu_capacity: false,
  },
  local_balanced: {
    route_type: 'local_balanced',
    cost_index: 0.55,
    capability_index: 0.72,
    latency_ms: 520,
    risk_isolation: 0.88,
    reliability: 0.9,
    throughput: 0.82,
    gpu_capacity: true,
  },
  cloud_high_capability: {
    route_type: 'cloud_high_capability',
    cost_index: 0.9,
    capability_index: 0.96,
    latency_ms: 360,
    risk_isolation: 0.74,
    reliability: 0.96,
    throughput: 0.95,
    gpu_capacity: true,
  },
  local_cpu: {
    route_type: 'local_cpu',
    cost_index: 0.08,
    capability_index: 0.42,
    latency_ms: 950,
    risk_isolation: 0.94,
    reliability: 0.86,
    throughput: 0.58,
    gpu_capacity: false,
  },
  local_gpu: {
    route_type: 'local_gpu',
    cost_index: 0.18,
    capability_index: 0.78,
    latency_ms: 720,
    risk_isolation: 0.9,
    reliability: 0.88,
    throughput: 0.84,
    gpu_capacity: true,
  },
  openclaw_stable_2026_3_23: {
    route_type: 'openclaw_stable_2026_3_23',
    cost_index: 0.12,
    capability_index: 0.7,
    latency_ms: 780,
    risk_isolation: 0.9,
    reliability: 0.92,
    throughput: 0.72,
    gpu_capacity: false,
  },
  openclaw_sidecar_2026_5_12: {
    route_type: 'openclaw_sidecar_2026_5_12',
    cost_index: 0.16,
    capability_index: 0.76,
    latency_ms: 860,
    risk_isolation: 0.86,
    reliability: 0.82,
    throughput: 0.74,
    gpu_capacity: true,
  },
  comfyui_8000: {
    route_type: 'comfyui_8000',
    cost_index: 0.14,
    capability_index: 0.74,
    latency_ms: 880,
    risk_isolation: 0.84,
    reliability: 0.84,
    throughput: 0.7,
    gpu_capacity: true,
  },
  cloud_reasoning_model: {
    route_type: 'cloud_reasoning_model',
    cost_index: 0.85,
    capability_index: 0.98,
    latency_ms: 520,
    risk_isolation: 0.72,
    reliability: 0.95,
    throughput: 0.9,
    gpu_capacity: false,
  },
  manual_confirm: {
    route_type: 'manual_confirm',
    cost_index: 0,
    capability_index: 0.5,
    latency_ms: 0,
    risk_isolation: 1,
    reliability: 1,
    throughput: 0.1,
    gpu_capacity: false,
  },
  blocked: {
    route_type: 'blocked',
    cost_index: 0,
    capability_index: 0,
    latency_ms: 0,
    risk_isolation: 1,
    reliability: 1,
    throughput: 0,
    gpu_capacity: false,
  },
};

const BUILTIN_POLICY_TEMPLATES = [
  {
    id: 'cheap_text_inference',
    name: '低成本文本推理',
    task_type: 'text_inference',
    route_type: 'local_cpu',
    priority: 180,
    cost_level: 'free',
    risk_level: 'low',
    description: '预算低、风险低的文本摘要、改写和轻量推理优先走本地 CPU 或便宜路线。',
  },
  {
    id: 'strong_reasoning',
    name: '强推理任务',
    task_type: 'code_analysis',
    route_type: 'cloud_reasoning_model',
    priority: 150,
    cost_level: 'medium',
    risk_level: 'medium',
    description: '复杂代码分析或强推理可建议云端强模型，但默认不自动调用。',
  },
  {
    id: 'local_gpu_training',
    name: '本地 GPU 训练',
    task_type: 'training',
    route_type: 'local_gpu',
    priority: 170,
    cost_level: 'low',
    risk_level: 'medium',
    description: '需要 GPU 的小训练优先建议 RTX 3060/CUDA 本地路径，必须用户确认。',
  },
  {
    id: 'comfy_image_generation',
    name: 'ComfyUI 生图',
    task_type: 'image_generation',
    route_type: 'openclaw_sidecar_2026_5_12',
    priority: 165,
    cost_level: 'low',
    risk_level: 'medium',
    description: '生图建议走 OpenClaw sidecar 或 ComfyUI 8000，只给建议不自动执行。',
  },
  {
    id: 'readonly_audit',
    name: '只读审计',
    task_type: 'readonly_audit',
    route_type: 'local_cpu',
    priority: 190,
    cost_level: 'free',
    risk_level: 'low',
    description: '只读摸底、报告和候选清单优先本地 CPU，禁止隐式写入。',
  },
  {
    id: 'high_risk_manual_confirm',
    name: '高风险人工确认',
    task_type: '*',
    route_type: 'manual_confirm',
    priority: 200,
    cost_level: 'unknown',
    risk_level: 'high',
    description: '发布、删除、移动、Memory 写入、训练等高风险动作必须先人工确认。',
  },
];

const LOCAL_CAPABILITIES = {
  aip: 'AIP v7.3.1 local seal',
  local_gpu_available: 'unknown/mock: RTX 3060 / CUDA available',
  openclaw_stable: '2026.3.23',
  openclaw_sidecar: '2026.5.12 / 18799',
  comfyui: '127.0.0.1:8000',
  memory_hub: 'readonly',
  openaxiom: 'readonly',
};

const DEFAULT_WEIGHTS: RouteWeightSet = {
  cost: 0.26,
  capability: 0.24,
  latency: 0.16,
  risk: 0.16,
  reliability: 0.12,
  load: 0.06,
};

const RISK_RANK: Record<RiskLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const PRIORITY_RANK: Record<PriorityTier, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

function genId(prefix = 'rt'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

function now(): string {
  return new Date().toISOString();
}

function parseJson(raw: any): any {
  if (!raw) return {};
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return {};
  }
}

function stringifyJson(v: any): string {
  if (typeof v === 'string') return v;
  try {
    return JSON.stringify(v ?? {});
  } catch {
    return '{}';
  }
}

function normalizeRouteType(v: any): RouteType {
  if (ROUTE_TYPES.includes(v as RouteType)) return v as RouteType;
  return 'local_balanced';
}

function normalizeFeedbackOutcome(v: any): FeedbackOutcome {
  const value = String(v || '').trim().toLowerCase();
  if (value === 'success') return 'success';
  if (value === 'partial') return 'partial';
  if (value === 'timeout') return 'timeout';
  return 'failed';
}

function normalizeStatus(v: any): string {
  return STATUS_TYPES.includes(v) ? v : 'active';
}

function clamp(v: number, min = 0, max = 1): number {
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}

function asNumber(v: any, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function asOptionalNumber(v: any): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function asBoolean(v: any, fallback = false): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const t = v.trim().toLowerCase();
    if (['1', 'true', 'yes', 'y', 'on'].includes(t)) return true;
    if (['0', 'false', 'no', 'n', 'off'].includes(t)) return false;
  }
  if (typeof v === 'number') return v !== 0;
  return fallback;
}

function normalizeBudgetTier(v: any): BudgetTier {
  const raw = String(v || '').trim().toLowerCase();
  if (raw === 'low') return 'low';
  if (raw === 'high') return 'high';
  if (raw === 'unlimited') return 'unlimited';
  return 'medium';
}

function normalizePriorityTier(v: any, fallback: PriorityTier = 'medium'): PriorityTier {
  const raw = String(v || '').trim().toLowerCase();
  if (raw === 'low') return 'low';
  if (raw === 'high') return 'high';
  if (raw === 'critical') return 'critical';
  if (raw === 'medium') return 'medium';
  return fallback;
}

function normalizeRiskLevel(v: any): RiskLevel {
  const raw = String(v || '').trim().toLowerCase();
  if (raw === 'low') return 'low';
  if (raw === 'high') return 'high';
  if (raw === 'critical') return 'critical';
  return 'medium';
}

function normalizeDataSensitivity(v: any): DataSensitivity {
  const raw = String(v || '').trim().toLowerCase();
  if (raw === 'public') return 'public';
  if (raw === 'restricted') return 'restricted';
  return 'internal';
}

function normalizeStringArray(v: any): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => String(item || '').trim())
    .filter(Boolean);
}

function inferTaskKind(taskType: string): RoutingContext['task_kind'] {
  const text = taskType.toLowerCase();
  if (text.includes('train') || text.includes('finetune') || text.includes('retrain')) return 'training';
  if (text.includes('eval') || text.includes('validate') || text.includes('score')) return 'evaluation';
  if (text.includes('infer') || text.includes('serve') || text.includes('predict')) return 'inference';
  return 'other';
}

function buildRoutingContext(taskType: string, rawInput: any): RoutingContext {
  const input = rawInput && typeof rawInput === 'object' ? rawInput : {};
  return {
    task_type: taskType,
    task_kind: inferTaskKind(taskType),
    budget_tier: normalizeBudgetTier(input.budget_tier || input.budget),
    budget_limit: Math.max(0, asNumber(input.budget_limit, 0)),
    estimated_cost: Math.max(0, asNumber(input.estimated_cost, 0)),
    estimated_tokens: Math.max(0, asNumber(input.estimated_tokens, 0)),
    estimated_runtime_ms: Math.max(0, asNumber(input.estimated_runtime_ms || input.estimated_runtime, 0)),
    latency_sla_ms: Math.max(0, asNumber(input.latency_sla_ms || input.sla_ms || input.latency_sla, 0)),
    gpu_needed: asBoolean(input.gpu_needed || input.requires_gpu, false),
    quality_priority: normalizePriorityTier(input.quality_priority, 'medium'),
    risk_level: normalizeRiskLevel(input.risk_level),
    data_sensitivity: normalizeDataSensitivity(input.data_sensitivity),
    require_reliability: asBoolean(input.require_reliability, false),
    tenant_id: String(input.tenant_id || '').trim(),
    project_id: String(input.project_id || '').trim(),
  };
}

function normalizeWeights(raw: any, fallback: RouteWeightSet): RouteWeightSet {
  const merged: RouteWeightSet = { ...fallback };
  for (const key of Object.keys(fallback) as WeightKey[]) {
    const value = asNumber(raw?.[key], NaN);
    if (Number.isFinite(value) && value >= 0) merged[key] = value;
  }
  const sum = (Object.values(merged) as number[]).reduce((acc, item) => acc + item, 0);
  if (!Number.isFinite(sum) || sum <= 0) return { ...fallback };
  const normalized: RouteWeightSet = { ...fallback };
  for (const key of Object.keys(normalized) as WeightKey[]) {
    normalized[key] = merged[key] / sum;
  }
  return normalized;
}

function deriveDefaultWeights(context: RoutingContext): RouteWeightSet {
  const tuned: RouteWeightSet = { ...DEFAULT_WEIGHTS };
  if (context.task_kind === 'training') {
    tuned.capability += 0.08;
    tuned.load += 0.04;
    tuned.cost -= 0.07;
    tuned.latency -= 0.03;
  }
  if (context.task_kind === 'inference' && context.latency_sla_ms > 0 && context.latency_sla_ms < 600) {
    tuned.latency += 0.12;
    tuned.cost -= 0.05;
    tuned.load -= 0.02;
  }
  if (context.budget_tier === 'low') {
    tuned.cost += 0.12;
    tuned.capability -= 0.06;
    tuned.reliability -= 0.02;
  }
  if (context.risk_level === 'critical' || context.data_sensitivity === 'restricted') {
    tuned.risk += 0.12;
    tuned.cost -= 0.04;
    tuned.latency -= 0.02;
    tuned.load -= 0.01;
  }
  return normalizeWeights({}, tuned);
}

function costScore(context: RoutingContext, profile: RouteProfile): number {
  const budgetTarget: Record<BudgetTier, number> = {
    low: 0.2,
    medium: 0.5,
    high: 0.75,
    unlimited: 1,
  };
  let score = 1 - Math.abs(profile.cost_index - budgetTarget[context.budget_tier]);
  if (context.estimated_cost > 0 && context.budget_limit > 0) {
    const over = (context.estimated_cost - context.budget_limit) / Math.max(context.budget_limit, 1e-6);
    if (over > 0) score -= clamp(over, 0, 0.9);
  }
  return clamp(score, 0, 1);
}

function capabilityScore(context: RoutingContext, profile: RouteProfile): number {
  const qualityTarget: Record<PriorityTier, number> = {
    low: 0.35,
    medium: 0.62,
    high: 0.84,
    critical: 0.96,
  };
  let target = qualityTarget[context.quality_priority];
  if (context.gpu_needed) target = Math.max(target, 0.78);
  let score = 1 - Math.abs(profile.capability_index - target);
  if (context.gpu_needed && !profile.gpu_capacity) score *= 0.15;
  return clamp(score, 0, 1);
}

function latencyScore(context: RoutingContext, profile: RouteProfile): number {
  if (context.latency_sla_ms <= 0) {
    const penalty = Math.max(profile.latency_ms - 700, 0) / 1500;
    return clamp(1 - penalty, 0, 1);
  }
  if (profile.latency_ms <= context.latency_sla_ms) {
    return clamp(1 - (profile.latency_ms / Math.max(context.latency_sla_ms, 1)) * 0.2, 0.8, 1);
  }
  const overRatio = (profile.latency_ms - context.latency_sla_ms) / Math.max(context.latency_sla_ms, 1);
  return clamp(1 - overRatio, 0, 0.79);
}

function riskScore(context: RoutingContext, profile: RouteProfile): number {
  const riskTarget: Record<RiskLevel, number> = {
    low: 0.55,
    medium: 0.72,
    high: 0.87,
    critical: 0.96,
  };
  let target = riskTarget[context.risk_level];
  if (context.data_sensitivity === 'restricted') target = Math.max(target, 0.95);
  if (context.data_sensitivity === 'public') target = Math.min(target, 0.78);
  return clamp(1 - Math.abs(profile.risk_isolation - target), 0, 1);
}

function reliabilityScore(context: RoutingContext, profile: RouteProfile): number {
  let score = profile.reliability;
  if (context.require_reliability && score < 0.9) {
    score -= 0.2;
  }
  return clamp(score, 0, 1);
}

function loadScore(context: RoutingContext, profile: RouteProfile): number {
  const heavy = context.estimated_tokens >= 120_000 || context.estimated_runtime_ms >= 300_000;
  const target = heavy ? 0.92 : 0.65;
  return clamp(1 - Math.abs(profile.throughput - target), 0, 1);
}

function topFactors(components: RouteWeightSet, weights: RouteWeightSet): string[] {
  const merged = (Object.keys(components) as WeightKey[]).map((key) => ({
    key,
    score: components[key] * weights[key],
  }));
  merged.sort((a, b) => b.score - a.score);
  return merged.slice(0, 3).map((item) => item.key);
}

function evaluatePolicyConstraints(policy: any, context: RoutingContext, profile: RouteProfile): { blocked: boolean; reasons: string[] } {
  const metadata = parseJson(policy?.metadata_json);
  const constraints = metadata?.constraints && typeof metadata.constraints === 'object'
    ? metadata.constraints
    : {};

  const blockedReasons: string[] = [];
  const allowTasks = normalizeStringArray(constraints.allow_task_types);
  const blockTasks = normalizeStringArray(constraints.block_task_types);
  const allowTenants = normalizeStringArray(constraints.tenant_allowlist);
  const blockTenants = normalizeStringArray(constraints.tenant_blocklist);
  const budgetIn = normalizeStringArray(constraints.budget_tier_in).map((item) => item.toLowerCase());
  const maxEstimatedCost = asOptionalNumber(constraints.max_estimated_cost);
  const minCapabilityIndex = asOptionalNumber(constraints.min_capability_index);
  const rawMaxRiskLevel = String(constraints.max_risk_level || '').trim();
  const maxRiskLevel = rawMaxRiskLevel ? normalizeRiskLevel(rawMaxRiskLevel) : null;
  const maxLatencyMs = asOptionalNumber(constraints.max_latency_ms);
  const requireGpu = asBoolean(constraints.require_gpu, false);

  if (allowTasks.length && !allowTasks.includes(context.task_type)) blockedReasons.push('task_type_not_allowed');
  if (blockTasks.includes(context.task_type)) blockedReasons.push('task_type_blocked');
  if (allowTenants.length && context.tenant_id && !allowTenants.includes(context.tenant_id)) blockedReasons.push('tenant_not_allowed');
  if (context.tenant_id && blockTenants.includes(context.tenant_id)) blockedReasons.push('tenant_blocked');
  if (budgetIn.length && !budgetIn.includes(context.budget_tier)) blockedReasons.push('budget_tier_mismatch');
  if (maxEstimatedCost !== null && context.estimated_cost > maxEstimatedCost) blockedReasons.push('estimated_cost_exceeds_policy');
  if (minCapabilityIndex !== null && profile.capability_index < minCapabilityIndex) blockedReasons.push('capability_below_min');
  if (requireGpu && !profile.gpu_capacity) blockedReasons.push('gpu_required_by_policy');
  if (context.gpu_needed && !profile.gpu_capacity) blockedReasons.push('gpu_needed_but_unavailable');
  if (maxRiskLevel && RISK_RANK[context.risk_level] > RISK_RANK[maxRiskLevel]) blockedReasons.push('risk_level_exceeds_policy');
  if (maxLatencyMs !== null && profile.latency_ms > maxLatencyMs) blockedReasons.push('latency_exceeds_policy');

  return { blocked: blockedReasons.length > 0, reasons: blockedReasons };
}

function evaluateCandidate(policy: any, context: RoutingContext, ruleKind: RuleKind): CandidateBreakdown {
  const routeType = normalizeRouteType(policy?.route_type);
  const profile = ROUTE_PROFILES[routeType];
  const derivedWeights = deriveDefaultWeights(context);
  const metadata = parseJson(policy?.metadata_json);
  const weights = normalizeWeights(metadata?.weights, derivedWeights);
  const constraints = evaluatePolicyConstraints(policy, context, profile);

  const components: RouteWeightSet = {
    cost: costScore(context, profile),
    capability: capabilityScore(context, profile),
    latency: latencyScore(context, profile),
    risk: riskScore(context, profile),
    reliability: reliabilityScore(context, profile),
    load: loadScore(context, profile),
  };

  const weightedBase = (Object.keys(components) as WeightKey[])
    .reduce((acc, key) => acc + (components[key] * weights[key]), 0);
  const priorityBoost = clamp((asNumber(policy?.priority, 100) - 100) / 240, -0.2, 0.28);
  const scoreTotal = constraints.blocked ? -1 : clamp(weightedBase + priorityBoost, 0, 1);

  return {
    policy_id: String(policy?.id || ''),
    policy_name: String(policy?.name || ''),
    route_type: routeType,
    task_type: String(policy?.task_type || ''),
    rule_kind: ruleKind,
    priority: asNumber(policy?.priority, 100),
    score_total: scoreTotal,
    blocked: constraints.blocked,
    block_reasons: constraints.reasons,
    components,
    weights,
    dominant_factors: topFactors(components, weights),
  };
}

function summarizeReasons(candidate: CandidateBreakdown): string {
  if (candidate.blocked) return `blocked: ${candidate.block_reasons.join(', ') || 'constraint'}`;
  return `score=${candidate.score_total.toFixed(3)}; factors=${candidate.dominant_factors.join(',')}`;
}

function auditLog(action: string, target: string, result: 'success' | 'failed', detail: any) {
  try {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at)
      VALUES (?, 'cost_routing', ?, ?, ?, ?, ?)
    `).run(genId('audit'), action, target, result, stringifyJson(detail), now());
  } catch (e) {
    console.error('[cost-routing audit] failed:', e);
  }
}

function fail(action: string, target: string, error: string, detail: any = {}) {
  auditLog('route_failed', target, 'failed', { action, error, ...detail });
  return { ok: false, error };
}

function rowToPolicy(row: any) {
  return {
    id: row.id,
    name: row.name,
    task_type: row.task_type,
    route_type: row.route_type,
    priority: row.priority,
    status: row.status,
    reason_template: row.reason_template,
    metadata_json: parseJson(row.metadata_json),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function rowToDecision(row: any) {
  return {
    id: row.id,
    task_id: row.task_id,
    task_type: row.task_type,
    policy_id: row.policy_id,
    route_type: row.route_type,
    route_reason: row.route_reason,
    input_json: parseJson(row.input_json),
    created_at: row.created_at,
  };
}

function listPolicies(query: any) {
  try {
    const db = getDatabase();
    const limit = Math.min(Number(query.limit || 100), 500);
    const offset = Number(query.offset || 0);
    const conditions: string[] = [];
    const params: any[] = [];

    if (query.task_type) {
      conditions.push('task_type = ?');
      params.push(query.task_type);
    }
    if (query.route_type) {
      conditions.push('route_type = ?');
      params.push(normalizeRouteType(query.route_type));
    }
    if (query.status) {
      conditions.push('status = ?');
      params.push(normalizeStatus(query.status));
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const total = (db.prepare(`SELECT COUNT(*) as n FROM route_policies ${where}`).get(...params) as any)?.n || 0;
    const rows = db.prepare(`
      SELECT * FROM route_policies ${where}
      ORDER BY priority DESC, updated_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    const policies = rows.map(rowToPolicy);
    auditLog('route_policy_view', 'route-policies', 'success', { route: 'list', total, limit, offset });
    return { ok: true, policies, total };
  } catch (e: any) {
    return fail('list_policies', 'route-policies', e.message || 'list policies failed');
  }
}

function getPolicyById(id: string) {
  try {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM route_policies WHERE id = ?').get(id) as any;
    if (!row) return fail('get_policy', id, 'Policy not found');
    auditLog('route_policy_view', id, 'success', { route: 'detail' });
    return { ok: true, policy: rowToPolicy(row) };
  } catch (e: any) {
    return fail('get_policy', id, e.message || 'get policy failed');
  }
}

function createPolicy(body: any) {
  try {
    const name = String(body.name || '').trim();
    const taskType = String(body.task_type || '').trim();
    if (!name) return fail('create_policy', 'route-policies', 'name is required');
    if (!taskType) return fail('create_policy', 'route-policies', 'task_type is required');

    const db = getDatabase();
    const id = genId('rp');
    const routeType = normalizeRouteType(body.route_type);
    const priority = Number.isFinite(Number(body.priority)) ? Number(body.priority) : 100;
    const status = normalizeStatus(body.status);
    const reasonTemplate = String(body.reason_template || '').trim();
    const metadataJson = stringifyJson(body.metadata_json || {});
    const ts = now();

    db.prepare(`
      INSERT INTO route_policies (id, name, task_type, route_type, priority, status, reason_template, metadata_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, taskType, routeType, priority, status, reasonTemplate, metadataJson, ts, ts);

    auditLog('route_policy_create', id, 'success', {
      task_type: taskType,
      route_type: routeType,
      priority,
      status,
    });

    return getPolicyById(id);
  } catch (e: any) {
    return fail('create_policy', 'route-policies', e.message || 'create policy failed');
  }
}

function updatePolicy(id: string, body: any) {
  try {
    const db = getDatabase();
    const existing = db.prepare('SELECT * FROM route_policies WHERE id = ?').get(id) as any;
    if (!existing) return fail('update_policy', id, 'Policy not found');

    const updates: string[] = ['updated_at = ?'];
    const params: any[] = [now()];

    if (body.name !== undefined) { updates.push('name = ?'); params.push(String(body.name)); }
    if (body.task_type !== undefined) { updates.push('task_type = ?'); params.push(String(body.task_type)); }
    if (body.route_type !== undefined) { updates.push('route_type = ?'); params.push(normalizeRouteType(body.route_type)); }
    if (body.priority !== undefined) { updates.push('priority = ?'); params.push(Number(body.priority) || 100); }
    if (body.status !== undefined) { updates.push('status = ?'); params.push(normalizeStatus(body.status)); }
    if (body.reason_template !== undefined) { updates.push('reason_template = ?'); params.push(String(body.reason_template || '')); }
    if (body.metadata_json !== undefined) { updates.push('metadata_json = ?'); params.push(stringifyJson(body.metadata_json)); }

    params.push(id);
    db.prepare(`UPDATE route_policies SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    auditLog('route_policy_update', id, 'success', {
      route: 'update',
      updated_fields: Object.keys(body),
    });

    return getPolicyById(id);
  } catch (e: any) {
    return fail('update_policy', id, e.message || 'update policy failed');
  }
}

function listDecisions(query: any) {
  try {
    const db = getDatabase();
    const limit = Math.min(Number(query.limit || 50), 200);
    const offset = Number(query.offset || 0);
    const conditions: string[] = [];
    const params: any[] = [];

    if (query.task_type) {
      conditions.push('task_type = ?');
      params.push(String(query.task_type));
    }
    if (query.route_type) {
      conditions.push('route_type = ?');
      params.push(normalizeRouteType(query.route_type));
    }
    if (query.task_id) {
      conditions.push('task_id = ?');
      params.push(String(query.task_id));
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const total = (db.prepare(`SELECT COUNT(*) as n FROM route_decisions ${where}`).get(...params) as any)?.n || 0;
    const rows = db.prepare(`
      SELECT * FROM route_decisions ${where}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    const decisions = rows.map(rowToDecision);
    auditLog('route_decision_view', 'route-decisions', 'success', { route: 'list', total, limit, offset });
    return { ok: true, decisions, total };
  } catch (e: any) {
    return fail('list_decisions', 'route-decisions', e.message || 'list decisions failed');
  }
}

function getDecisionById(id: string) {
  try {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM route_decisions WHERE id = ?').get(id) as any;
    if (!row) return fail('get_decision', id, 'Decision not found');
    auditLog('route_decision_view', id, 'success', { route: 'detail' });
    return { ok: true, decision: rowToDecision(row) };
  } catch (e: any) {
    return fail('get_decision', id, e.message || 'get decision failed');
  }
}

function renderReason(policy: any, taskType: string, ruleKind: RuleKind, extras: Record<string, any> = {}): string {
  if (policy?.reason_template) {
    return String(policy.reason_template)
      .replaceAll('{task_type}', taskType)
      .replaceAll('{route_type}', policy.route_type)
      .replaceAll('{policy_id}', policy.id)
      .replaceAll('{rule_kind}', ruleKind)
      .replaceAll('{score}', String(extras.score ?? ''))
      .replaceAll('{budget_tier}', String(extras.budget_tier ?? ''))
      .replaceAll('{risk_level}', String(extras.risk_level ?? ''))
      .replaceAll('{top_factors}', String(extras.top_factors ?? ''));
  }
  return [
    `policy=${policy?.id || 'fallback'}`,
    `rule=${ruleKind}`,
    `task_type=${taskType}`,
    `route_type=${policy?.route_type || 'local_balanced'}`,
    extras.score !== undefined ? `score=${extras.score}` : '',
    extras.top_factors ? `factors=${extras.top_factors}` : '',
  ].filter(Boolean).join('; ');
}

function parseBodyInput(input: any): any {
  if (!input) return {};
  if (typeof input === 'string') return parseJson(input);
  if (typeof input === 'object') return input;
  return {};
}

function normalizePracticalTaskType(v: any): PracticalTaskType {
  const raw = String(v || '').trim().toLowerCase();
  if ((PRACTICAL_TASK_TYPES as readonly string[]).includes(raw)) return raw as PracticalTaskType;
  if (raw.includes('train')) return 'training';
  if (raw.includes('image') && raw.includes('video')) return 'image_to_video';
  if (raw.includes('image')) return 'image_generation';
  if (raw.includes('cleanup') || raw.includes('delete') || raw.includes('move')) return 'file_cleanup';
  if (raw.includes('release')) return 'github_release';
  if (raw.includes('memory')) return 'memory_update';
  if (raw.includes('audit')) return 'readonly_audit';
  if (raw.includes('code')) return 'code_analysis';
  return 'text_inference';
}

function targetText(input: any): string {
  return [
    input?.target,
    input?.path,
    input?.project,
    input?.project_id,
    input?.description,
    input?.prompt,
  ].map((item) => String(item || '').toLowerCase()).join(' ');
}

function buildPracticalDecision(taskTypeRaw: string, rawInput: any): PracticalDecision {
  const input = rawInput && typeof rawInput === 'object' ? rawInput : {};
  const taskType = normalizePracticalTaskType(taskTypeRaw);
  const budget = normalizeBudgetTier(input.budget_tier || input.budget);
  const text = targetText(input);
  const comfyAvailable = asBoolean(input.comfy_available, true);
  const gpuNeeded = asBoolean(input.gpu_needed || input.requires_gpu, taskType === 'training');
  const rejectedRoutes: PracticalDecision['rejectedRoutes'] = [];
  const safetyNotes: string[] = [
    '本接口只返回建议，不执行训练、推理、生图、发布、删除或写入。',
  ];

  if (text.includes('mahjong_v1_project')) {
    return {
      selectedRoute: 'blocked',
      costLevel: 'unknown',
      riskLevel: 'blocked',
      needsUserConfirm: true,
      reason: '目标命中受保护目录 Mahjong_V1_Project，本轮规则直接阻断。',
      rejectedRoutes: [
        { route: 'local_cpu', reason: '保护目录禁止修改、删除或移动。' },
        { route: 'manual_confirm', reason: '任务包要求 Mahjong_V1_Project 为硬保护目录。' },
      ],
      safetyNotes: [...safetyNotes, '禁止修改 Mahjong_V1_Project。'],
      nextAction: '停止该动作，仅允许生成只读审计报告。',
    };
  }

  if (text.includes('openclaw') && (text.includes('2026.3.23') || text.includes('stable') || text.includes('覆盖'))) {
    return {
      selectedRoute: 'blocked',
      costLevel: 'unknown',
      riskLevel: 'blocked',
      needsUserConfirm: true,
      reason: '请求可能覆盖 OpenClaw 2026.3.23 稳定版，按保护规则阻断。',
      rejectedRoutes: [
        { route: 'openclaw_stable_2026_3_23', reason: '稳定版只能作为已知能力展示，禁止覆盖。' },
      ],
      safetyNotes: [...safetyNotes, '禁止修改全局 OpenClaw 2026.3.23。'],
      nextAction: '改为 sidecar 或只读检查方案。',
    };
  }

  if (taskType === 'github_release') {
    return {
      selectedRoute: 'manual_confirm',
      costLevel: 'unknown',
      riskLevel: 'high',
      needsUserConfirm: true,
      reason: 'GitHub Release 属于发布动作，本轮禁止自动创建 Release。',
      rejectedRoutes: [
        { route: 'cloud_reasoning_model', reason: '不需要云模型参与发布。' },
        { route: 'local_cpu', reason: '发布动作需要人工确认和封板复验。' },
      ],
      safetyNotes: [...safetyNotes, '禁止 git push/tag/GitHub Release。'],
      nextAction: '生成发布前检查清单，等待人工确认。',
    };
  }

  if (taskType === 'memory_update') {
    return {
      selectedRoute: 'manual_confirm',
      costLevel: 'free',
      riskLevel: 'high',
      needsUserConfirm: true,
      reason: 'Memory Hub 写入会改变长期记忆，本轮只允许 readonly 展示。',
      rejectedRoutes: [
        { route: 'local_cpu', reason: '本地可分析，但写入需要人工确认。' },
      ],
      safetyNotes: [...safetyNotes, 'Memory Hub 当前能力标记为 readonly。'],
      nextAction: '先生成候选更新说明，不直接写入 Memory Hub。',
    };
  }

  if (taskType === 'file_cleanup') {
    return {
      selectedRoute: 'manual_confirm',
      costLevel: 'free',
      riskLevel: 'high',
      needsUserConfirm: true,
      reason: '删除/移动文件属于高风险动作，必须先人工确认。',
      rejectedRoutes: [
        { route: 'local_cpu', reason: '只可用于生成清理候选，不可直接执行删除/移动。' },
      ],
      safetyNotes: [...safetyNotes, '本轮禁止删除/移动 E 盘文件。'],
      nextAction: '输出只读候选清单和风险说明。',
    };
  }

  if (taskType === 'training') {
    return {
      selectedRoute: gpuNeeded ? 'local_gpu' : 'local_cpu',
      costLevel: budget === 'low' ? 'low' : 'medium',
      riskLevel: 'medium',
      needsUserConfirm: true,
      reason: gpuNeeded ? '训练任务需要 GPU，建议本地 RTX 3060/CUDA 路径，但不自动启动训练。' : '训练任务需人工确认后才可执行。',
      rejectedRoutes: [
        { route: 'cloud_reasoning_model', reason: '训练会产生额外成本且本轮禁止调用云模型。' },
        { route: 'local_cpu', reason: gpuNeeded ? 'GPU 需求不适合 CPU 路线。' : 'CPU 训练可能耗时较长。' },
      ],
      safetyNotes: [...safetyNotes, '训练任务 needsUserConfirm=true。'],
      nextAction: '准备训练前检查，不启动训练。',
    };
  }

  if (taskType === 'image_generation') {
    return {
      selectedRoute: comfyAvailable ? 'openclaw_sidecar_2026_5_12' : 'manual_confirm',
      costLevel: 'low',
      riskLevel: 'medium',
      needsUserConfirm: true,
      reason: comfyAvailable ? 'ComfyUI 8000 已作为已知能力展示，建议通过 OpenClaw sidecar 2026.5.12 协调。' : '未确认 ComfyUI 可用，需人工确认。',
      rejectedRoutes: [
        { route: 'openclaw_stable_2026_3_23', reason: '稳定版不作为生图小盒子，避免影响主力稳定版。' },
        { route: 'cloud_reasoning_model', reason: '本轮禁止真实云模型费用。' },
      ],
      safetyNotes: [...safetyNotes, '生图只给建议，不自动调用 ComfyUI。'],
      nextAction: '等待用户确认后再进入 sidecar/ComfyUI 执行链。',
    };
  }

  if (taskType === 'image_to_video') {
    return {
      selectedRoute: 'manual_confirm',
      costLevel: 'unknown',
      riskLevel: 'high',
      needsUserConfirm: true,
      reason: '图生视频成本和资源占用不确定，默认延后或人工确认。',
      rejectedRoutes: [
        { route: 'comfyui_8000', reason: '可能触发长耗时生成，本轮禁止图生视频。' },
        { route: 'cloud_reasoning_model', reason: '禁止真实云模型费用。' },
      ],
      safetyNotes: [...safetyNotes, '图生视频不自动执行。'],
      nextAction: '先确认预算、模型和输出规格。',
    };
  }

  if (taskType === 'readonly_audit' || taskType === 'dataset_operation') {
    return {
      selectedRoute: 'local_cpu',
      costLevel: 'free',
      riskLevel: taskType === 'dataset_operation' ? 'medium' : 'low',
      needsUserConfirm: taskType === 'dataset_operation',
      reason: taskType === 'readonly_audit' ? '只读审计适合本地 CPU 路线。' : '数据集操作可能涉及文件写入，先给本地规则建议并要求确认。',
      rejectedRoutes: [
        { route: 'cloud_reasoning_model', reason: '本地可完成规则判断，无需产生云成本。' },
      ],
      safetyNotes,
      nextAction: taskType === 'readonly_audit' ? '执行只读扫描并生成报告。' : '确认输出目录和写入范围后再执行。',
    };
  }

  if (taskType === 'code_analysis' && budget !== 'low') {
    return {
      selectedRoute: 'cloud_reasoning_model',
      costLevel: 'medium',
      riskLevel: 'medium',
      needsUserConfirm: true,
      reason: '强推理代码分析可建议云端强模型，但本轮只返回建议，不产生费用。',
      rejectedRoutes: [
        { route: 'local_cpu', reason: '复杂推理质量可能不足。' },
      ],
      safetyNotes: [...safetyNotes, '调用云模型前必须人工确认预算。'],
      nextAction: '先用本地规则缩小问题范围，再等待确认是否升级强推理。',
    };
  }

  return {
    selectedRoute: 'local_cpu',
    costLevel: budget === 'low' ? 'free' : 'low',
    riskLevel: 'low',
    needsUserConfirm: false,
    reason: '低风险文本推理优先使用本地 CPU 或便宜路线。',
    rejectedRoutes: [
      { route: 'cloud_reasoning_model', reason: '预算低或任务简单，暂不建议产生云成本。' },
      { route: 'local_gpu', reason: '任务不需要 GPU。' },
    ],
    safetyNotes,
    nextAction: '可直接进入本地 mock/规则验证，不调用外部模型。',
  };
}

export function getPracticalConfig() {
  return {
    ok: true,
    engine_version: 'v2-practical-rc1',
    policy_templates: BUILTIN_POLICY_TEMPLATES,
    task_types: PRACTICAL_TASK_TYPES,
    route_targets: ROUTE_TYPES,
    cost_levels: ['free', 'low', 'medium', 'high', 'unknown'],
    risk_levels: ['low', 'medium', 'high', 'blocked'],
    local_capabilities: LOCAL_CAPABILITIES,
  };
}

export function simulatePracticalRoute(body: any) {
  const taskType = String(body.task_type || '').trim();
  if (!taskType) return { ok: false, error: 'task_type is required' };
  const rawInput = parseBodyInput(body.input_json || body);
  const decision = buildPracticalDecision(taskType, rawInput);
  return {
    ok: true,
    engine_version: 'v2-practical-rc1',
    task_type: normalizePracticalTaskType(taskType),
    task_id: String(body.task_id || '').trim(),
    decision,
  };
}

export function resolveRoute(body: any) {
  try {
    const db = getDatabase();
    const taskType = String(body.task_type || '').trim();
    if (!taskType) return fail('resolve_route', 'route-decisions', 'task_type is required');

    const taskId = String(body.task_id || '').trim();
    const rawInput = parseBodyInput(body.input_json);
    const context = buildRoutingContext(taskType, rawInput);

    const policyRows = db.prepare(`
      SELECT * FROM route_policies
      WHERE status = 'active' AND (task_type = ? OR task_type = '*')
      ORDER BY priority DESC, updated_at DESC
    `).all(taskType) as any[];

    const candidates = policyRows.map((policy) => evaluateCandidate(
      policy,
      context,
      policy.task_type === taskType ? 'exact' : 'fallback',
    ));

    const viable = candidates.filter((item) => !item.blocked);
    let chosen: CandidateBreakdown | null = null;
    if (viable.length > 0) {
      viable.sort((a, b) => {
        if (b.score_total !== a.score_total) return b.score_total - a.score_total;
        if (b.priority !== a.priority) return b.priority - a.priority;
        if (a.rule_kind !== b.rule_kind) return a.rule_kind === 'exact' ? -1 : 1;
        return a.policy_id.localeCompare(b.policy_id);
      });
      chosen = viable[0];
    }

    const ts = now();
    let routeType: RouteType = 'local_balanced';
    let routeReason = `no active policy for task_type=${taskType}; fallback=local_balanced`;
    let policyId = '';
    let ruleKind: RuleKind = 'fallback';

    if (chosen) {
      routeType = chosen.route_type;
      policyId = chosen.policy_id;
      ruleKind = chosen.rule_kind;
      const policy = policyRows.find((row) => row.id === chosen?.policy_id) || {
        id: chosen.policy_id,
        route_type: chosen.route_type,
        reason_template: '',
      };
      routeReason = renderReason(policy, taskType, ruleKind, {
        score: chosen.score_total.toFixed(3),
        budget_tier: context.budget_tier,
        risk_level: context.risk_level,
        top_factors: chosen.dominant_factors.join(','),
      });
    } else if (candidates.length > 0) {
      const blockedSummary = candidates
        .slice(0, 3)
        .map((item) => `${item.policy_id || 'fallback'}(${item.block_reasons.join('|') || 'blocked'})`)
        .join('; ');
      routeReason = `all policies blocked for task_type=${taskType}; fallback=local_balanced; blocked=${blockedSummary}`;
    }

    const routingTrace = {
      engine_version: 'v2',
      resolved_at: ts,
      context,
      practical_decision: buildPracticalDecision(taskType, rawInput),
      selected: chosen
        ? {
            policy_id: chosen.policy_id,
            policy_name: chosen.policy_name,
            route_type: chosen.route_type,
            rule_kind: chosen.rule_kind,
            score_total: chosen.score_total,
            dominant_factors: chosen.dominant_factors,
          }
        : {
            policy_id: '',
            policy_name: 'fallback',
            route_type: routeType,
            rule_kind: 'fallback',
            score_total: 0.5,
            dominant_factors: ['reliability'],
          },
      candidates: candidates.map((item) => ({
        policy_id: item.policy_id,
        policy_name: item.policy_name,
        route_type: item.route_type,
        task_type: item.task_type,
        rule_kind: item.rule_kind,
        priority: item.priority,
        score_total: item.score_total,
        blocked: item.blocked,
        block_reasons: item.block_reasons,
        dominant_factors: item.dominant_factors,
        summary: summarizeReasons(item),
      })),
    };

    const persistedInput = {
      ...(rawInput && typeof rawInput === 'object' ? rawInput : {}),
      __routing: routingTrace,
    };

    const id = genId('rd');
    db.prepare(`
      INSERT INTO route_decisions (id, task_id, task_type, policy_id, route_type, route_reason, input_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, taskId, taskType, policyId, routeType, routeReason, stringifyJson(persistedInput), ts);

    auditLog('route_decision_resolve', id, 'success', {
      task_type: taskType,
      task_id: taskId,
      route_type: routeType,
      policy_id: policyId,
      rule_kind: ruleKind,
      candidate_count: candidates.length,
      context,
    });

    return getDecisionById(id);
  } catch (e: any) {
    return fail('resolve_route', 'route-decisions', e.message || 'resolve route failed');
  }
}

function attachDecisionFeedback(body: any) {
  try {
    const db = getDatabase();
    const decisionId = String(body.decision_id || '').trim();
    if (!decisionId) return fail('attach_feedback', 'route-decisions', 'decision_id is required');

    const row = db.prepare('SELECT * FROM route_decisions WHERE id = ?').get(decisionId) as any;
    if (!row) return fail('attach_feedback', decisionId, 'Decision not found');

    const input = parseJson(row.input_json) || {};
    const latest = {
      recorded_at: now(),
      outcome: normalizeFeedbackOutcome(body.outcome),
      actual_cost: asOptionalNumber(body.actual_cost),
      latency_ms: asOptionalNumber(body.latency_ms),
      quality_score: asOptionalNumber(body.quality_score),
      error_code: String(body.error_code || '').trim(),
      notes: String(body.notes || '').trim(),
      metadata: body.metadata && typeof body.metadata === 'object' ? body.metadata : {},
    };

    const existingHistory = Array.isArray(input?.__feedback?.history) ? input.__feedback.history : [];
    const history = [latest, ...existingHistory].slice(0, 30);

    input.__feedback = {
      latest,
      history,
      feedback_count: history.length,
    };

    db.prepare('UPDATE route_decisions SET input_json = ? WHERE id = ?').run(stringifyJson(input), decisionId);
    auditLog('route_decision_feedback', decisionId, 'success', {
      outcome: latest.outcome,
      has_cost: latest.actual_cost !== null,
      has_latency: latest.latency_ms !== null,
      has_quality: latest.quality_score !== null,
    });
    return getDecisionById(decisionId);
  } catch (e: any) {
    return fail('attach_feedback', 'route-decisions', e.message || 'attach feedback failed');
  }
}

function average(total: number, count: number): number | null {
  if (!Number.isFinite(total) || !Number.isFinite(count) || count <= 0) return null;
  return Number((total / count).toFixed(6));
}

function weightedAverage(total: number, weight: number): number | null {
  if (!Number.isFinite(total) || !Number.isFinite(weight) || weight <= 0) return null;
  return Number((total / weight).toFixed(6));
}

function buildInsights(query: any) {
  try {
    const db = getDatabase();
    const limit = Math.min(Math.max(asNumber(query.limit, 500), 1), 2000);
    const sinceHours = Math.min(Math.max(asNumber(query.since_hours, 24 * 7), 1), 24 * 90);
    const sinceAt = new Date(Date.now() - (sinceHours * 3600 * 1000)).toISOString();

    const rows = db.prepare(`
      SELECT * FROM route_decisions
      WHERE created_at >= ?
      ORDER BY created_at DESC
      LIMIT ?
    `).all(sinceAt, limit) as any[];

    const policyRows = db.prepare('SELECT id, name FROM route_policies').all() as any[];
    const policyNameMap = new Map<string, string>();
    for (const p of policyRows) policyNameMap.set(String(p.id), String(p.name || p.id));

    const routeStats = new Map<string, any>();
    const policyStats = new Map<string, any>();
    const taskStats = new Map<string, number>();
    for (const routeType of ROUTE_TYPES) {
      routeStats.set(routeType, {
        route_type: routeType,
        decisions: 0,
        feedback_count: 0,
        success_count: 0,
        estimated_cost_total: 0,
        estimated_cost_count: 0,
        actual_cost_total: 0,
        actual_cost_count: 0,
        latency_total: 0,
        latency_count: 0,
        quality_total: 0,
        quality_count: 0,
      });
    }

    for (const row of rows) {
      const decision = rowToDecision(row);
      const input = decision.input_json || {};
      const context = input?.__routing?.context || {};
      const feedback = input?.__feedback?.latest || null;

      const routeStat = routeStats.get(decision.route_type) || {
        route_type: decision.route_type,
        decisions: 0,
        feedback_count: 0,
        success_count: 0,
        estimated_cost_total: 0,
        estimated_cost_count: 0,
        actual_cost_total: 0,
        actual_cost_count: 0,
        latency_total: 0,
        latency_count: 0,
        quality_total: 0,
        quality_count: 0,
      };
      routeStat.decisions += 1;

      const estimatedCost = asOptionalNumber(context.estimated_cost);
      if (estimatedCost !== null && estimatedCost >= 0) {
        routeStat.estimated_cost_total += estimatedCost;
        routeStat.estimated_cost_count += 1;
      }

      if (feedback) {
        routeStat.feedback_count += 1;
        if (feedback.outcome === 'success') routeStat.success_count += 1;
        const actualCost = asOptionalNumber(feedback.actual_cost);
        if (actualCost !== null && actualCost >= 0) {
          routeStat.actual_cost_total += actualCost;
          routeStat.actual_cost_count += 1;
        }
        const latency = asOptionalNumber(feedback.latency_ms);
        if (latency !== null && latency >= 0) {
          routeStat.latency_total += latency;
          routeStat.latency_count += 1;
        }
        const quality = asOptionalNumber(feedback.quality_score);
        if (quality !== null && quality >= 0) {
          routeStat.quality_total += quality;
          routeStat.quality_count += 1;
        }
      }
      routeStats.set(decision.route_type, routeStat);

      const policyId = decision.policy_id || 'fallback';
      const policyStat = policyStats.get(policyId) || {
        policy_id: policyId,
        policy_name: policyId === 'fallback' ? 'fallback' : (policyNameMap.get(policyId) || policyId),
        hits: 0,
        score_total: 0,
        score_count: 0,
      };
      policyStat.hits += 1;
      const routingScore = asOptionalNumber(input?.__routing?.selected?.score_total);
      if (routingScore !== null) {
        policyStat.score_total += routingScore;
        policyStat.score_count += 1;
      }
      policyStats.set(policyId, policyStat);

      const taskType = String(decision.task_type || '').trim();
      if (taskType) taskStats.set(taskType, (taskStats.get(taskType) || 0) + 1);
    }

    const routeStatsOut = Array.from(routeStats.values()).map((stat: any) => ({
      route_type: stat.route_type,
      decisions: stat.decisions,
      feedback_count: stat.feedback_count,
      success_rate: stat.feedback_count > 0 ? Number((stat.success_count / stat.feedback_count).toFixed(4)) : null,
      avg_estimated_cost: average(stat.estimated_cost_total, stat.estimated_cost_count),
      avg_actual_cost: average(stat.actual_cost_total, stat.actual_cost_count),
      avg_latency_ms: average(stat.latency_total, stat.latency_count),
      avg_quality_score: average(stat.quality_total, stat.quality_count),
    })).sort((a, b) => b.decisions - a.decisions);

    const policyStatsOut = Array.from(policyStats.values()).map((stat: any) => ({
      policy_id: stat.policy_id,
      policy_name: stat.policy_name,
      hits: stat.hits,
      avg_score: average(stat.score_total, stat.score_count),
    })).sort((a, b) => b.hits - a.hits);

    const topTaskTypes = Array.from(taskStats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([task_type, count]) => ({ task_type, count }));

    const recommendations: Array<{ level: 'low' | 'medium' | 'high'; message: string; suggestion: string }> = [];
    const totalFeedback = routeStatsOut.reduce((acc, item) => acc + Number(item.feedback_count || 0), 0);
    if (totalFeedback === 0 && rows.length > 0) {
      recommendations.push({
        level: 'medium',
        message: '决策已产生但没有效果回填数据，路由学习仍是静态状态。',
        suggestion: '接入 /api/cost-routing/feedback 回填 success、cost、latency、quality。',
      });
    }
    for (const item of routeStatsOut) {
      if (item.feedback_count >= 5 && item.success_rate !== null && item.success_rate < 0.75) {
        recommendations.push({
          level: 'high',
          message: `${item.route_type} 近期成功率偏低(${item.success_rate})。`,
          suggestion: '检查策略约束与权重，必要时提升 capability/risk 权重或调整该路由使用边界。',
        });
      }
    }
    const cloud = routeStatsOut.find((item) => item.route_type === 'cloud_high_capability');
    const balanced = routeStatsOut.find((item) => item.route_type === 'local_balanced');
    if (
      cloud &&
      balanced &&
      cloud.avg_actual_cost !== null &&
      balanced.avg_actual_cost !== null &&
      cloud.avg_actual_cost > (balanced.avg_actual_cost * 1.8) &&
      cloud.avg_quality_score !== null &&
      balanced.avg_quality_score !== null &&
      cloud.avg_quality_score <= balanced.avg_quality_score + 0.05
    ) {
      recommendations.push({
        level: 'medium',
        message: 'cloud_high_capability 成本明显偏高但质量优势不明显。',
        suggestion: '对中低质量优先级任务增加本地路由约束，减少云路由占比。',
      });
    }
    if (recommendations.length === 0) {
      recommendations.push({
        level: 'low',
        message: '当前路由策略运行稳定。',
        suggestion: '保持反馈回填频率，持续观察 7~14 天趋势。',
      });
    }

    auditLog('route_insights_view', 'route-insights', 'success', {
      since_hours: sinceHours,
      window_size: rows.length,
      total_feedback: totalFeedback,
    });

    return {
      ok: true,
      insights: {
        engine_version: 'v2',
        window: {
          since_at: sinceAt,
          since_hours: sinceHours,
          sampled_decisions: rows.length,
        },
        route_stats: routeStatsOut,
        policy_stats: policyStatsOut,
        top_task_types: topTaskTypes,
        recommendations,
      },
    };
  } catch (e: any) {
    return fail('route_insights', 'route-insights', e.message || 'build insights failed');
  }
}

function normalizeOptimizeMode(v: any): OptimizeMode {
  return String(v || '').trim().toLowerCase() === 'apply' ? 'apply' : 'preview';
}

function feedbackOutcomeScore(outcome: any): number {
  const value = normalizeFeedbackOutcome(outcome);
  if (value === 'success') return 1;
  if (value === 'partial') return 0.62;
  if (value === 'timeout') return 0.25;
  return 0;
}

function plainWeights(weights: RouteWeightSet): RouteWeightSet {
  return {
    cost: Number(weights.cost.toFixed(4)),
    capability: Number(weights.capability.toFixed(4)),
    latency: Number(weights.latency.toFixed(4)),
    risk: Number(weights.risk.toFixed(4)),
    reliability: Number(weights.reliability.toFixed(4)),
    load: Number(weights.load.toFixed(4)),
  };
}

function shiftWeight(weights: RouteWeightSet, key: WeightKey, delta: number, maxShift: number): RouteWeightSet {
  const next: RouteWeightSet = { ...weights };
  next[key] = clamp(next[key] + clamp(delta, -maxShift, maxShift), 0.02, 0.72);
  return normalizeWeights(next, DEFAULT_WEIGHTS);
}

function buildOptimizerProposal(policy: any, decisions: any[], maxShift: number) {
  const metadata = parseJson(policy.metadata_json);
  const currentWeights = normalizeWeights(metadata?.weights, DEFAULT_WEIGHTS);
  let suggestedWeights = { ...currentWeights };
  const reasons: string[] = [];

  let outcomeTotal = 0;
  let outcomeCount = 0;
  let estimatedCostTotal = 0;
  let estimatedCostCount = 0;
  let actualCostTotal = 0;
  let actualCostCount = 0;
  let latencyTotal = 0;
  let latencyCount = 0;
  let qualityTotal = 0;
  let qualityCount = 0;
  let latencySlaTotal = 0;
  let latencySlaCount = 0;
  let highRiskCount = 0;
  let lowBudgetCount = 0;
  let gpuCount = 0;

  for (const decision of decisions) {
    const input = parseJson(decision.input_json);
    const context = input?.__routing?.context || {};
    const feedback = input?.__feedback?.latest;
    if (!feedback) continue;

    outcomeTotal += feedbackOutcomeScore(feedback.outcome);
    outcomeCount += 1;

    const estimatedCost = asOptionalNumber(context.estimated_cost);
    if (estimatedCost !== null && estimatedCost >= 0) {
      estimatedCostTotal += estimatedCost;
      estimatedCostCount += 1;
    }

    const actualCost = asOptionalNumber(feedback.actual_cost);
    if (actualCost !== null && actualCost >= 0) {
      actualCostTotal += actualCost;
      actualCostCount += 1;
    }

    const latency = asOptionalNumber(feedback.latency_ms);
    if (latency !== null && latency >= 0) {
      latencyTotal += latency;
      latencyCount += 1;
    }

    const quality = asOptionalNumber(feedback.quality_score);
    if (quality !== null && quality >= 0) {
      qualityTotal += quality;
      qualityCount += 1;
    }

    const latencySla = asOptionalNumber(context.latency_sla_ms);
    if (latencySla !== null && latencySla > 0) {
      latencySlaTotal += latencySla;
      latencySlaCount += 1;
    }

    if (RISK_RANK[normalizeRiskLevel(context.risk_level)] >= RISK_RANK.high) highRiskCount += 1;
    if (normalizeBudgetTier(context.budget_tier) === 'low') lowBudgetCount += 1;
    if (asBoolean(context.gpu_needed, false)) gpuCount += 1;
  }

  const successScore = weightedAverage(outcomeTotal, outcomeCount);
  const avgEstimatedCost = average(estimatedCostTotal, estimatedCostCount);
  const avgActualCost = average(actualCostTotal, actualCostCount);
  const avgLatency = average(latencyTotal, latencyCount);
  const avgQuality = average(qualityTotal, qualityCount);
  const avgLatencySla = average(latencySlaTotal, latencySlaCount);
  const highRiskRate = outcomeCount > 0 ? highRiskCount / outcomeCount : 0;
  const lowBudgetRate = outcomeCount > 0 ? lowBudgetCount / outcomeCount : 0;
  const gpuRate = outcomeCount > 0 ? gpuCount / outcomeCount : 0;

  if (successScore !== null && successScore < 0.72) {
    suggestedWeights = shiftWeight(suggestedWeights, 'reliability', 0.1, maxShift);
    suggestedWeights = shiftWeight(suggestedWeights, 'capability', 0.08, maxShift);
    reasons.push('recent_outcome_score_low');
  }

  if (avgQuality !== null && avgQuality < 0.78) {
    suggestedWeights = shiftWeight(suggestedWeights, 'capability', 0.12, maxShift);
    suggestedWeights = shiftWeight(suggestedWeights, 'reliability', 0.04, maxShift);
    reasons.push('quality_score_below_target');
  }

  if (
    avgEstimatedCost !== null &&
    avgActualCost !== null &&
    avgEstimatedCost > 0 &&
    avgActualCost > avgEstimatedCost * 1.18
  ) {
    suggestedWeights = shiftWeight(suggestedWeights, 'cost', 0.12, maxShift);
    reasons.push('actual_cost_exceeds_estimate');
  }

  if (
    avgLatency !== null &&
    avgLatencySla !== null &&
    avgLatencySla > 0 &&
    avgLatency > avgLatencySla * 1.12
  ) {
    suggestedWeights = shiftWeight(suggestedWeights, 'latency', 0.12, maxShift);
    suggestedWeights = shiftWeight(suggestedWeights, 'load', 0.04, maxShift);
    reasons.push('latency_sla_missed');
  }

  if (highRiskRate >= 0.45) {
    suggestedWeights = shiftWeight(suggestedWeights, 'risk', 0.1, maxShift);
    reasons.push('high_risk_workload_dominant');
  }

  if (lowBudgetRate >= 0.45) {
    suggestedWeights = shiftWeight(suggestedWeights, 'cost', 0.1, maxShift);
    reasons.push('low_budget_workload_dominant');
  }

  if (gpuRate >= 0.6) {
    suggestedWeights = shiftWeight(suggestedWeights, 'capability', 0.06, maxShift);
    suggestedWeights = shiftWeight(suggestedWeights, 'load', 0.04, maxShift);
    reasons.push('gpu_workload_dominant');
  }

  const currentPlain = plainWeights(currentWeights);
  const suggestedPlain = plainWeights(suggestedWeights);
  const changed = (Object.keys(currentPlain) as WeightKey[])
    .some((key) => Math.abs(currentPlain[key] - suggestedPlain[key]) >= 0.005);

  if (!changed && reasons.length === 0) {
    reasons.push('policy_weights_stable');
  }

  return {
    policy_id: policy.id,
    policy_name: policy.name,
    task_type: policy.task_type,
    route_type: normalizeRouteType(policy.route_type),
    feedback_count: outcomeCount,
    current_weights: currentPlain,
    suggested_weights: suggestedPlain,
    changed,
    reasons,
    metrics: {
      outcome_score: successScore,
      avg_estimated_cost: avgEstimatedCost,
      avg_actual_cost: avgActualCost,
      avg_latency_ms: avgLatency,
      avg_latency_sla_ms: avgLatencySla,
      avg_quality_score: avgQuality,
      high_risk_rate: Number(highRiskRate.toFixed(4)),
      low_budget_rate: Number(lowBudgetRate.toFixed(4)),
      gpu_rate: Number(gpuRate.toFixed(4)),
    },
  };
}

function optimizeRouting(body: any) {
  try {
    const db = getDatabase();
    const mode = normalizeOptimizeMode(body.mode);
    const limit = Math.min(Math.max(asNumber(body.limit, 1500), 1), 5000);
    const sinceHours = Math.min(Math.max(asNumber(body.since_hours, 24 * 14), 1), 24 * 120);
    const minFeedback = Math.min(Math.max(asNumber(body.min_feedback, 3), 1), 100);
    const maxShift = clamp(asNumber(body.max_shift, 0.12), 0.02, 0.25);
    const policyIdFilter = String(body.policy_id || '').trim();
    const taskTypeFilter = String(body.task_type || '').trim();
    const sinceAt = new Date(Date.now() - (sinceHours * 3600 * 1000)).toISOString();

    const where: string[] = [`created_at >= ?`];
    const params: any[] = [sinceAt];
    if (policyIdFilter) {
      where.push('policy_id = ?');
      params.push(policyIdFilter);
    }
    if (taskTypeFilter) {
      where.push('task_type = ?');
      params.push(taskTypeFilter);
    }

    const decisions = db.prepare(`
      SELECT *
      FROM route_decisions
      WHERE ${where.join(' AND ')}
      ORDER BY created_at DESC
      LIMIT ?
    `).all(...params, limit) as any[];

    const byPolicy = new Map<string, any[]>();
    for (const decision of decisions) {
      const input = parseJson(decision.input_json);
      if (!input?.__feedback?.latest) continue;
      const policyId = String(decision.policy_id || '').trim();
      if (!policyId) continue;
      const list = byPolicy.get(policyId) || [];
      list.push(decision);
      byPolicy.set(policyId, list);
    }

    const proposals: any[] = [];
    for (const [policyId, policyDecisions] of byPolicy.entries()) {
      if (policyDecisions.length < minFeedback) continue;
      const policy = db.prepare('SELECT * FROM route_policies WHERE id = ?').get(policyId) as any;
      if (!policy || policy.status !== 'active') continue;
      proposals.push(buildOptimizerProposal(policy, policyDecisions, maxShift));
    }

    const applied: any[] = [];
    if (mode === 'apply') {
      const ts = now();
      const update = db.prepare('UPDATE route_policies SET metadata_json = ?, updated_at = ? WHERE id = ?');
      for (const proposal of proposals) {
        if (!proposal.changed) continue;
        const policy = db.prepare('SELECT * FROM route_policies WHERE id = ?').get(proposal.policy_id) as any;
        if (!policy) continue;
        const metadata = parseJson(policy.metadata_json);
        const history = Array.isArray(metadata.optimization_history) ? metadata.optimization_history : [];
        const nextMetadata = {
          ...metadata,
          weights: proposal.suggested_weights,
          optimization: {
            last_applied_at: ts,
            engine_version: 'v2',
            feedback_count: proposal.feedback_count,
            reasons: proposal.reasons,
            metrics: proposal.metrics,
          },
          optimization_history: [
            {
              applied_at: ts,
              from: proposal.current_weights,
              to: proposal.suggested_weights,
              reasons: proposal.reasons,
              metrics: proposal.metrics,
            },
            ...history,
          ].slice(0, 20),
        };
        update.run(stringifyJson(nextMetadata), ts, proposal.policy_id);
        applied.push(proposal.policy_id);
      }
    }

    auditLog('route_optimizer_run', 'route-optimizer', 'success', {
      mode,
      since_hours: sinceHours,
      decision_count: decisions.length,
      proposal_count: proposals.length,
      applied_count: applied.length,
      policy_id: policyIdFilter,
      task_type: taskTypeFilter,
    });

    return {
      ok: true,
      optimization: {
        engine_version: 'v2',
        mode,
        window: {
          since_at: sinceAt,
          since_hours: sinceHours,
          sampled_decisions: decisions.length,
          min_feedback: minFeedback,
          max_shift: maxShift,
        },
        proposal_count: proposals.length,
        applied_count: applied.length,
        applied_policy_ids: applied,
        proposals,
      },
    };
  } catch (e: any) {
    return fail('route_optimizer', 'route-optimizer', e.message || 'optimize routing failed');
  }
}

export async function registerCostRoutingRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/route-policies', async (request: any) => listPolicies(request.query || {}));
  app.get('/api/route-policies/:id', async (request: any) => getPolicyById(request.params.id));
  app.post('/api/route-policies', async (request: any) => createPolicy(request.body || {}));
  app.put('/api/route-policies/:id', async (request: any) => updatePolicy(request.params.id, request.body || {}));

  app.post('/api/cost-routing/resolve', async (request: any) => resolveRoute(request.body || {}));
  app.get('/api/cost-routing/practical-config', async () => getPracticalConfig());
  app.post('/api/cost-routing/simulate', async (request: any) => simulatePracticalRoute(request.body || {}));
  app.get('/api/cost-routing/decisions', async (request: any) => listDecisions(request.query || {}));
  app.get('/api/cost-routing/decisions/:id', async (request: any) => getDecisionById(request.params.id));
  app.post('/api/cost-routing/feedback', async (request: any) => attachDecisionFeedback(request.body || {}));
  app.get('/api/cost-routing/insights', async (request: any) => buildInsights(request.query || {}));
  app.post('/api/cost-routing/optimize', async (request: any) => optimizeRouting(request.body || {}));

  app.get('/api/cost-routing/route-types', async () => ({
    ok: true,
    engine_version: 'v2',
    route_types: ROUTE_TYPES,
    route_profiles: ROUTE_PROFILES,
  }));
}
