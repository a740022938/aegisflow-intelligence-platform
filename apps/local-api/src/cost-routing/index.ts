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
type StrategyMode = 'save_money' | 'stable_first' | 'quality_first' | 'local_first' | 'balanced';
type ExecutionMode = 'read_only' | 'ask_first' | 'dry_run' | 'human_confirm_required' | 'local_only' | 'cloud_allowed' | 'blocked';
type ModelTier = 'economy' | 'balanced' | 'premium' | 'local' | 'toolchain' | 'blocked';
type ConfidenceLevel = 'low' | 'medium' | 'high';

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
  recommendedModelTier?: ModelTier;
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
  executionMode?: ExecutionMode;
  matchedRules?: string[];
  requiredConfirmations?: string[];
  readOnlyPrechecks?: string[];
  rollbackPlan?: string[];
  deniedActions?: string[];
  confidence?: ConfidenceLevel;
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
    auditSchemaVersion: string;
    mode: 'preview_only';
    wouldExecute: false;
    wouldWriteFiles: false;
    databaseWrite: false;
    fileWrite: false;
    externalWrite: false;
    timestamp: string;
    taskSummary: string;
    rawInput: Record<string, unknown>;
    selectedPolicy: StrategyMode;
    detectedCategory: string;
    actionType: string;
    riskLevel: PracticalRiskLevel;
    executionMode: ExecutionMode;
    confidence: ConfidenceLevel;
    matchedRiskRules: string[];
    recommendedRoute: RouteType;
    recommendedModelTier: ModelTier;
    deniedActions: string[];
    readOnlyPrechecks: string[];
    nextSafeStep: string;
    rollbackRequired: boolean;
    auditMode: 'preview_only';
    requiredConfirmations: string[];
    rollbackPlan: string[];
    auditIdPreview: string;
    persistenceMode: 'preview_only';
    selectedModelRoute: ModelTier;
    selectedToolchainRoute: string;
  };
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

const STRATEGY_MODES: Record<StrategyMode, {
  id: StrategyMode;
  name: string;
  description: string;
  costBias: number;
  qualityBias: number;
  speedBias: number;
  localBias: number;
  riskTolerance: 'low' | 'medium' | 'high';
  suitable_for: string;
  recommendedFor: string[];
  avoidFor: string[];
  recommended_channel: string;
  cost_bias: string;
  risk_control: string;
  fallback_plan: string;
  fallbackPlan: string;
}> = {
  save_money: {
    id: 'save_money',
    name: '省钱优先',
    description: '把预算和本地低成本路线放在第一位，适合可容忍普通质量的轻量任务。',
    costBias: 0.95,
    qualityBias: 0.45,
    speedBias: 0.55,
    localBias: 0.9,
    riskTolerance: 'low',
    suitable_for: '普通聊天、摘要改写、只读巡检、低预算解释任务。',
    recommendedFor: ['普通聊天/问答', '文档总结/改写', '项目只读巡检'],
    avoidFor: ['强推理代码调试', '发布动作', '覆盖文件'],
    recommended_channel: 'local_cpu / local_low_cost / openclaw_stable_2026_3_23',
    cost_bias: '优先免费或低成本，本地可完成时不建议云端强模型。',
    risk_control: '仅建议低风险本地路线，高风险动作转人工确认。',
    fallback_plan: '质量不足时升级到 stable_first，再考虑 quality_first。',
    fallbackPlan: '低成本路线失败后先升稳定优先，不直接切到真实执行。',
  },
  stable_first: {
    id: 'stable_first',
    name: '稳定优先',
    description: '优先选择成熟、可回滚、可解释的路线，适合封板和生产前检查。',
    costBias: 0.62,
    qualityBias: 0.68,
    speedBias: 0.6,
    localBias: 0.75,
    riskTolerance: 'low',
    suitable_for: '封板检查、版本基线、可靠性优先的生产前验证。',
    recommendedFor: ['项目只读巡检', 'Git 发布/版本封板', 'AIP 运行态验证'],
    avoidFor: ['实验 sidecar 覆盖', '全局进程操作'],
    recommended_channel: 'local_balanced / openclaw_stable_2026_3_23',
    cost_bias: '接受少量成本换稳定，不优先使用实验 sidecar。',
    risk_control: '稳定版只读使用，不覆盖全局 OpenClaw，不自动发布。',
    fallback_plan: '稳定路线失败时转 manual_confirm，由人工决定是否升级。',
    fallbackPlan: '稳定路线失败后进入人工确认和回滚方案生成。',
  },
  quality_first: {
    id: 'quality_first',
    name: '质量优先',
    description: '优先解决复杂推理和高质量要求，允许建议强模型，但不自动产生费用。',
    costBias: 0.35,
    qualityBias: 0.96,
    speedBias: 0.72,
    localBias: 0.35,
    riskTolerance: 'medium',
    suitable_for: '复杂代码调试、架构审查、高质量生成和强推理任务。',
    recommendedFor: ['代码修改/调试', '复杂方案评审', '高质量文档生成'],
    avoidFor: ['低预算批量任务', '禁止外部调用任务'],
    recommended_channel: 'cloud_reasoning_model / cloud_high_capability',
    cost_bias: '可接受中高成本，但必须先解释预算和人工确认。',
    risk_control: '云端或高能力路线只做建议，不自动产生费用或执行发布。',
    fallback_plan: '强模型不可用时退回 stable_first 的本地平衡路线。',
    fallbackPlan: '强模型不可用时退回本地平衡路线，并保留人工确认。',
  },
  local_first: {
    id: 'local_first',
    name: '本地优先',
    description: '优先使用本机和本地工具链，适合本地文件、数据、GPU 和 sidecar 能力。',
    costBias: 0.82,
    qualityBias: 0.68,
    speedBias: 0.58,
    localBias: 0.98,
    riskTolerance: 'medium',
    suitable_for: '涉及本机文件、数据集、训练准备、ComfyUI/OpenClaw 本地能力的任务。',
    recommendedFor: ['图像生成/ComfyUI', '数据集/YOLO/Mahjong', '本地只读检查'],
    avoidFor: ['覆盖稳定版 OpenClaw', '直接覆盖模型文件'],
    recommended_channel: 'local_cpu / local_gpu / comfyui_8000 / openclaw_sidecar_2026_5_12',
    cost_bias: '优先本地资源，避免外部调用和云成本。',
    risk_control: '本地写入、训练、删除、覆盖均需人工确认。',
    fallback_plan: '本地能力不足时只建议人工升级，不自动切云端。',
    fallbackPlan: '本地能力不足时只输出人工升级建议，不自动调用外部服务。',
  },
  balanced: {
    id: 'balanced',
    name: '平衡模式',
    description: '在成本、质量、速度和风险之间取中位路线，适合没有明显偏好的常规任务。',
    costBias: 0.68,
    qualityBias: 0.72,
    speedBias: 0.66,
    localBias: 0.72,
    riskTolerance: 'medium',
    suitable_for: '常规问答、普通代码分析、轻量任务编排和一般巡检。',
    recommendedFor: ['普通聊天/问答', '代码修改/调试', '项目只读巡检'],
    avoidFor: ['明确高风险动作', '要求极致质量或极低成本的任务'],
    recommended_channel: 'local_balanced / local_cpu',
    cost_bias: '默认控制成本，必要时允许中等能力路线。',
    risk_control: '所有风险命中均降级为人工确认。',
    fallback_plan: '失败后根据原因分别转省钱优先、质量优先或人工确认。',
    fallbackPlan: '平衡路线失败后按失败原因选择低成本、本地或强推理建议。',
  },
};

const TASK_CONSOLE_TYPES = [
  { id: 'chat_qa', label: '普通聊天/问答', maps_to: 'text_inference', default_strategy: 'save_money', description: '轻量问答和解释任务。', defaultRisk: 'low', suggestedRoute: 'local_cpu', forbiddenAutoActions: [], recommendedPolicy: 'save_money' },
  { id: 'document_summary', label: '文档总结/改写', maps_to: 'text_inference', default_strategy: 'save_money', description: '文档摘要、改写和结构化提炼。', defaultRisk: 'low', suggestedRoute: 'local_cpu', forbiddenAutoActions: [], recommendedPolicy: 'save_money' },
  { id: 'code_debug', label: '代码修改/调试', maps_to: 'code_analysis', default_strategy: 'quality_first', description: '复杂代码分析、调试和修复建议。', defaultRisk: 'medium', suggestedRoute: 'cloud_reasoning_model', forbiddenAutoActions: ['auto_apply_without_review'], recommendedPolicy: 'quality_first' },
  { id: 'readonly_project_audit', label: '项目只读巡检', maps_to: 'readonly_audit', default_strategy: 'stable_first', description: '只读检查运行态、源码状态和报告。', defaultRisk: 'low', suggestedRoute: 'local_cpu', forbiddenAutoActions: ['file_write'], recommendedPolicy: 'stable_first' },
  { id: 'git_release_seal', label: 'Git 发布/版本封板', maps_to: 'github_release', default_strategy: 'stable_first', description: 'commit、tag、push、release 前的封板建议。', defaultRisk: 'high', suggestedRoute: 'manual_confirm', forbiddenAutoActions: ['git_push', 'git_tag', 'github_release'], recommendedPolicy: 'stable_first' },
  { id: 'image_comfyui', label: '图像生成/ComfyUI', maps_to: 'image_generation', default_strategy: 'local_first', description: '生图链路建议和本地工具选择。', defaultRisk: 'medium', suggestedRoute: 'openclaw_sidecar_2026_5_12', forbiddenAutoActions: ['auto_generate_without_confirm'], recommendedPolicy: 'local_first' },
  { id: 'dataset_yolo_mahjong', label: '数据集/YOLO/Mahjong', maps_to: 'dataset_operation', default_strategy: 'local_first', description: '数据集、YOLO、Mahjong 相关检查和训练准备。', defaultRisk: 'high', suggestedRoute: 'local_cpu', forbiddenAutoActions: ['overwrite_model', 'touch_protected_project'], recommendedPolicy: 'local_first' },
  { id: 'high_risk_system_ops', label: '高风险系统操作', maps_to: 'file_cleanup', default_strategy: 'stable_first', description: '删除、移动、杀进程、覆盖文件等危险动作。', defaultRisk: 'high', suggestedRoute: 'manual_confirm', forbiddenAutoActions: ['delete', 'move', 'taskkill', 'overwrite'], recommendedPolicy: 'stable_first' },
  { id: 'memory_hub_knowledge', label: 'Memory Hub / 知识检索', maps_to: 'memory_update', default_strategy: 'stable_first', description: '长期记忆和知识检索建议。', defaultRisk: 'high', suggestedRoute: 'manual_confirm', forbiddenAutoActions: ['memory_write', 'sqlite_write'], recommendedPolicy: 'stable_first' },
  { id: 'openclaw_agent_task', label: 'OpenClaw 代理任务', maps_to: 'code_analysis', default_strategy: 'local_first', description: 'OpenClaw 能力选择和代理路线建议。', defaultRisk: 'medium', suggestedRoute: 'openclaw_stable_2026_3_23', forbiddenAutoActions: ['overwrite_openclaw_stable'], recommendedPolicy: 'local_first' },
] as const;

const HIGH_RISK_FIREWALL_RULES = [
  { id: 'git_push', label: 'git push', patterns: ['git push'] },
  { id: 'git_tag', label: 'git tag', patterns: ['git tag'] },
  { id: 'github_release', label: 'GitHub Release', patterns: ['github release', 'release', '发布'] },
  { id: 'delete_files', label: '删除文件', patterns: ['delete', 'remove', '删除'] },
  { id: 'move_files', label: '移动文件', patterns: ['move', '移动'] },
  { id: 'overwrite_files', label: '覆盖文件', patterns: ['overwrite', '覆盖', 'replace file'] },
  { id: 'taskkill', label: 'taskkill', patterns: ['taskkill', 'stop-process'] },
  { id: 'kill_node', label: 'kill node', patterns: ['kill node', '杀 node', '全局杀'] },
  { id: 'sqlite_write', label: '修改 sqlite', patterns: ['sqlite'] },
  { id: 'candidate_write', label: '修改 candidate', patterns: ['candidate'] },
  { id: 'lan_share_write', label: '修改 LAN_SHARE', patterns: ['lan_share'] },
  { id: 'mahjong_project_touch', label: '修改 Mahjong_V1_Project', patterns: ['mahjong_v1_project'] },
  { id: 'openclaw_stable_override', label: '覆盖 OpenClaw 稳定版', patterns: ['openclaw 2026.3.23', '覆盖 openclaw', 'upgrade openclaw'] },
  { id: 'start_training', label: '启动训练', patterns: ['train', 'training', '训练'] },
  { id: 'overwrite_model_weights', label: '覆盖 best.pt / last.pt', patterns: ['best.pt', 'last.pt', 'overwrite model', '覆盖模型'] },
  { id: 'env_write', label: '修改 .env', patterns: ['.env'] },
  { id: 'secret_leak', label: 'token / secret / key 泄漏', patterns: ['token', 'secret', 'api key', 'key 泄漏'] },
  { id: 'large_dependency_change', label: 'npm/pnpm install 大范围依赖变更', patterns: ['npm install', 'pnpm install', '大依赖', '大型依赖'] },
  { id: 'large_dataset_scan', label: '数据集大扫描', patterns: ['scan dataset', '数据集大扫描', '全量扫描'] },
  { id: 'backup_delete', label: '备份目录删除', patterns: ['delete backup', '删除备份', '备份目录删除'] },
  { id: 'model_file_delete', label: '模型文件删除', patterns: ['delete model', '删除模型', '删除 .pt', 'remove .pt'] },
  { id: 'unconfirmed_cleanup_path', label: '未确认路径的清理操作', patterns: ['cleanup unknown path', '未确认路径', '清理旧文件'] },
  { id: 'auto_candidate_decision', label: '自动 approve/reject/archive candidate', patterns: ['approve candidate', 'reject candidate', 'archive candidate', '自动审批', '自动归档'] },
  { id: 'production_db_write', label: '直接写入生产数据库', patterns: ['write production database', '生产数据库', '直接写库', 'prod db'] },
] as const;

const MODEL_ROUTE_REGISTRY = [
  {
    id: 'economy',
    name: 'Economy',
    description: '便宜、快速，适合普通问答、简单总结、低风险任务。',
    costLevel: 'low',
    qualityLevel: 0.45,
    speedLevel: 0.72,
    riskFit: 'low',
    recommendedFor: ['普通聊天/问答', '文档总结/改写', '低预算解释任务'],
    avoidFor: ['强推理代码分析', '发布动作', '高风险操作'],
    fallbackTo: 'balanced',
    safetyNotes: ['低成本优先，不做大规模推理。', '仅建议不自动调用。'],
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: '成本和质量均衡，适合常规代码、常规分析、普通工程任务。',
    costLevel: 'medium',
    qualityLevel: 0.72,
    speedLevel: 0.66,
    riskFit: 'low',
    recommendedFor: ['常规问答', '代码修改/调试', '项目只读巡检'],
    avoidFor: ['明确高风险动作', '要求极致质量或极低成本的任务'],
    fallbackTo: 'economy',
    safetyNotes: ['默认控制成本，必要时允许中等能力路线。', '所有风险命中降级为人工确认。'],
  },
  {
    id: 'premium',
    name: 'Premium',
    description: '高质量、高成本，适合复杂代码、发布规划、高风险前置分析。',
    costLevel: 'high',
    qualityLevel: 0.96,
    speedLevel: 0.78,
    riskFit: 'medium',
    recommendedFor: ['复杂代码分析/调试', '强推理架构审查', '发布前复查'],
    avoidFor: ['低预算批量任务', '禁止外部调用任务'],
    fallbackTo: 'balanced',
    safetyNotes: ['只做建议，不产生真实费用。', '必须人工确认预算后才可升级到 premium。'],
  },
  {
    id: 'local',
    name: 'Local',
    description: '本地优先，适合只读检查、本地脚本、本地模型、隐私任务。',
    costLevel: 'free',
    qualityLevel: 0.6,
    speedLevel: 0.58,
    riskFit: 'low',
    recommendedFor: ['只读健康检查', '本地数据集检查', '隐私任务'],
    avoidFor: ['覆盖稳定版 OpenClaw', '直接覆盖模型文件'],
    fallbackTo: 'economy',
    safetyNotes: ['优先使用本地资源，避免外部调用和云成本。', '本地写入、训练、删除均需人工确认。'],
  },
  {
    id: 'toolchain',
    name: 'Toolchain',
    description: '工具链路线，适合 AIP API、OpenClaw、ComfyUI、Memory Hub、GitHub release-prep 等工具协作任务。',
    costLevel: 'low',
    qualityLevel: 0.7,
    speedLevel: 0.5,
    riskFit: 'medium',
    recommendedFor: ['图像生成/ComfyUI', 'Memory Hub 候选管理', 'Git 发布预检'],
    avoidFor: ['直接覆盖生产系统', '自动 approve/reject candidate'],
    fallbackTo: 'manual_confirm',
    safetyNotes: ['工具链执行需要环境和准入确认。', '所有真实写入必须先人工确认。'],
  },
  {
    id: 'blocked',
    name: 'Blocked',
    description: '禁止自动执行，适合删除、覆盖、taskkill、写库、发布、训练覆盖模型等高风险任务。',
    costLevel: 'unknown',
    qualityLevel: 0,
    speedLevel: 0,
    riskFit: 'blocked',
    recommendedFor: [],
    avoidFor: ['所有自动执行场景'],
    fallbackTo: 'manual_confirm',
    safetyNotes: ['禁止自动执行。', '高风险任务必须先改写为只读检查。', '必须先获取人工确认和回滚方案。'],
  },
] as const;

const TOOLCHAIN_REGISTRY = [
  {
    id: 'aip_readonly_check',
    name: 'AIP Readonly Check',
    description: 'AIP 只读健康检查，检查运行态、源码状态、审计日志。',
    executionMode: 'read_only',
    readOnlyFirst: true,
    dryRunFirst: false,
    requiresHuman: false,
    forbiddenActions: ['file_write', 'db_write', 'process_kill'],
    safePrechecks: ['确认只读边界', '确认报告输出路径'],
    rollbackRequired: false,
    integrationStatus: 'preview_only',
  },
  {
    id: 'github_release_prep',
    name: 'GitHub Release-Prep',
    description: '只做 release-prep / gate check，不 tag、不 push、不 release。',
    executionMode: 'dry_run',
    readOnlyFirst: true,
    dryRunFirst: true,
    requiresHuman: true,
    forbiddenActions: ['git_push', 'git_tag', 'github_release'],
    safePrechecks: ['确认版本号和发布范围', '确认未提交文件状态', '做 diff check'],
    rollbackRequired: true,
    integrationStatus: 'preview_only',
  },
  {
    id: 'openclaw_sidecar_preview',
    name: 'OpenClaw Sidecar Preview',
    description: '只作为未来入口说明，不启动、不修改、不覆盖 OpenClaw。',
    executionMode: 'ask_first',
    readOnlyFirst: true,
    dryRunFirst: true,
    requiresHuman: true,
    forbiddenActions: ['overwrite_openclaw_stable', 'modify_openclaw_config'],
    safePrechecks: ['确认当前 OpenClaw 版本', '确认不覆盖稳定版'],
    rollbackRequired: true,
    integrationStatus: 'preview_only',
  },
  {
    id: 'comfyui_generation_preview',
    name: 'ComfyUI Generation Preview',
    description: '只作为未来入口说明，不启动、不生成图。',
    executionMode: 'ask_first',
    readOnlyFirst: true,
    dryRunFirst: true,
    requiresHuman: true,
    forbiddenActions: ['auto_generate_without_confirm', 'start_comfyui'],
    safePrechecks: ['确认 ComfyUI 端口状态', '确认 prompt 安全'],
    rollbackRequired: false,
    integrationStatus: 'preview_only',
  },
  {
    id: 'memory_hub_candidate_dry_run',
    name: 'Memory Hub Candidate Dry-Run',
    description: '只作为未来入口说明，不 approve/reject/archive，不写 sqlite。',
    executionMode: 'dry_run',
    readOnlyFirst: true,
    dryRunFirst: true,
    requiresHuman: true,
    forbiddenActions: ['sqlite_write', 'approve_candidate', 'reject_candidate', 'archive_candidate'],
    safePrechecks: ['确认 candidate 当前状态', '生成候选更新说明'],
    rollbackRequired: true,
    integrationStatus: 'preview_only',
  },
  {
    id: 'mahjong_dataset_readonly_audit',
    name: 'Mahjong Dataset Readonly Audit',
    description: '只读检查说明，不扫描大文件、不移动、不删除、不修改。',
    executionMode: 'read_only',
    readOnlyFirst: true,
    dryRunFirst: false,
    requiresHuman: false,
    forbiddenActions: ['delete', 'move', 'modify', 'scan_large_files'],
    safePrechecks: ['确认目标目录为 Mahjong_V1_Project', '确认只读边界'],
    rollbackRequired: false,
    integrationStatus: 'preview_only',
  },
  {
    id: 'local_script_dry_run',
    name: 'Local Script Dry-Run',
    description: '本地脚本 dry-run，不真实写入。',
    executionMode: 'dry_run',
    readOnlyFirst: true,
    dryRunFirst: true,
    requiresHuman: true,
    forbiddenActions: ['write_to_production', 'delete_files'],
    safePrechecks: ['确认脚本路径', '确认脚本内容安全'],
    rollbackRequired: true,
    integrationStatus: 'preview_only',
  },
  {
    id: 'blocked_system_operation',
    name: 'Blocked System Operation',
    description: 'taskkill、删除、覆盖、写库、训练覆盖模型等默认 blocked 或 human_confirm_required。',
    executionMode: 'blocked',
    readOnlyFirst: true,
    dryRunFirst: true,
    requiresHuman: true,
    forbiddenActions: ['taskkill', 'delete', 'overwrite', 'db_write', 'train_overwrite'],
    safePrechecks: ['必须改写为只读检查任务', '获取人工确认和回滚方案'],
    rollbackRequired: true,
    integrationStatus: 'preview_only',
  },
] as const;

const RELEASE_READINESS_GATES = [
  { id: 'git_diff_check', label: 'git diff --check', forTask: 'github_release', severity: 'required' },
  { id: 'lint', label: 'lint', forTask: 'github_release', severity: 'required' },
  { id: 'build', label: 'build', forTask: 'github_release', severity: 'required' },
  { id: 'smoke_test', label: 'smoke test', forTask: 'github_release', severity: 'required' },
  { id: 'db_doctor', label: 'db doctor', forTask: 'github_release', severity: 'required' },
  { id: 'secret_scan', label: 'secret scan', forTask: 'github_release', severity: 'recommended' },
  { id: 'release_notes', label: 'release notes draft', forTask: 'github_release', severity: 'recommended' },
  { id: 'human_confirmation', label: 'human confirmation', forTask: 'github_release', severity: 'required' },
  { id: 'readonly_audit', label: '只读审计', forTask: 'readonly_audit', severity: 'required' },
  { id: 'risk_firewall_check', label: '风险防火墙检查', forTask: '*', severity: 'required' },
  { id: 'preview_only_confirm', label: 'preview_only 确认', forTask: '*', severity: 'required' },
] as const;

const EXTERNAL_INTEGRATIONS = [
  {
    id: 'openclaw',
    name: 'OpenClaw',
    description: '未来可接任务执行/只读观察；当前 preview_only。',
    integrationStatus: 'preview_only',
    note: '不启动、不修改、不覆盖 OpenClaw。',
  },
  {
    id: 'comfyui',
    name: 'ComfyUI',
    description: '未来可接生图工作流；当前 preview_only。',
    integrationStatus: 'preview_only',
    note: '不启动、不生成图。',
  },
  {
    id: 'memory_hub',
    name: 'Memory Hub',
    description: '未来可接知识检索/候选 dry-run；当前 preview_only。',
    integrationStatus: 'preview_only',
    note: '不 approve/reject/archive，不写 sqlite。',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: '未来可接 release-prep；当前禁止自动 tag/push/release。',
    integrationStatus: 'preview_only',
    note: '只做 release-prep / gate check。',
  },
  {
    id: 'mahjong',
    name: 'Mahjong',
    description: '未来可接数据集只读审计；当前不扫描、不修改。',
    integrationStatus: 'preview_only',
    note: '不扫描大文件、不移动、不删除、不修改。',
  },
] as const;

const INTEGRATION_READINESS_MATRIX = [
  {
    id: 'aip_readonly_api', name: 'AIP Readonly API', status: 'ready', allowedModes: ['read_only', 'dry_run'],
    forbiddenActions: ['write_db', 'delete', 'restart', 'train'], safePrechecks: ['health check', 'status check'],
    requiredConfirmations: [], rollbackRequired: false, nextMilestone: '已就绪', integrationRisk: 'low',
  },
  {
    id: 'github_release_prep', name: 'GitHub Release-Prep', status: 'guarded', allowedModes: ['read_only', 'dry_run'],
    forbiddenActions: ['git_push', 'git_tag', 'github_release'], safePrechecks: ['diff check', 'lint', 'build', 'smoke', 'release notes draft'],
    requiredConfirmations: ['确认版本号', '确认发布范围'], rollbackRequired: true, nextMilestone: 'guarded（release-prep only）', integrationRisk: 'high',
  },
  {
    id: 'openclaw_sidecar', name: 'OpenClaw Sidecar', status: 'preview_only', allowedModes: ['read_only'],
    forbiddenActions: ['start', 'overwrite', 'upgrade_global'], safePrechecks: ['确认当前版本', '确认不覆盖稳定版'],
    requiredConfirmations: ['确认不覆盖 OpenClaw'], rollbackRequired: true, nextMilestone: 'planned', integrationRisk: 'medium',
  },
  {
    id: 'comfyui_workflow', name: 'ComfyUI Workflow', status: 'preview_only', allowedModes: ['read_only'],
    forbiddenActions: ['start', 'invoke', 'generate', 'modify_model'], safePrechecks: ['确认端口状态'],
    requiredConfirmations: ['确认不自动生图'], rollbackRequired: false, nextMilestone: 'planned', integrationRisk: 'medium',
  },
  {
    id: 'memory_hub', name: 'Memory Hub', status: 'dry_run_only', allowedModes: ['dry_run'],
    forbiddenActions: ['sqlite_write', 'approve_candidate', 'reject_candidate', 'archive_candidate', 'sync_lan_share'],
    safePrechecks: ['确认 candidate 状态', '确认只读边界'], requiredConfirmations: ['确认不写 sqlite'],
    rollbackRequired: true, nextMilestone: 'dry_run_only', integrationRisk: 'high',
  },
  {
    id: 'mahjong_dataset', name: 'Mahjong Dataset', status: 'protected', allowedModes: ['read_only'],
    forbiddenActions: ['scan_large_files', 'move', 'delete', 'modify', 'train', 'overwrite_model'],
    safePrechecks: ['确认目标目录', '确认只读边界'], requiredConfirmations: ['确认不修改 Mahjong_V1_Project'],
    rollbackRequired: false, nextMilestone: 'protected / readonly_only', integrationRisk: 'high',
  },
  {
    id: 'local_script_dry_run', name: 'Local Script Dry-Run', status: 'dry_run_only', allowedModes: ['dry_run'],
    forbiddenActions: ['write_to_production', 'delete_files', 'overwrite'], safePrechecks: ['确认脚本路径', '确认脚本内容安全'],
    requiredConfirmations: ['确认不真实写入'], rollbackRequired: true, nextMilestone: 'planned', integrationRisk: 'medium',
  },
  {
    id: 'system_operations', name: 'System Operations', status: 'blocked', allowedModes: ['blocked'],
    forbiddenActions: ['taskkill', 'kill_node', 'delete_backup', 'modify_env', 'write_db', 'overwrite_model'],
    safePrechecks: ['改写为只读检查', '获取人工确认和回滚方案'], requiredConfirmations: ['人工确认', '回滚方案确认'],
    rollbackRequired: true, nextMilestone: 'blocked / human_confirm_required', integrationRisk: 'critical',
  },
] as const;

const INTEGRATION_REHEARSAL_MATRIX = [
  {
    id: 'aip_readonly_rehearsal', name: 'AIP Readonly Check Rehearsal', targetSystem: 'AIP Readonly API',
    actionType: 'read_only_check', executionMode: 'read_only', rehearsalOnly: true, externalCall: false,
    databaseWrite: false, fileWrite: false,
    requiredPrechecks: ['health check', 'status check'], requiredConfirmations: [],
    rollbackPlanPreview: '不操作任何数据，无需回滚。', nextSafeStep: '输出只读报告。',
    blockedRealActions: ['write_db', 'delete', 'restart', 'train'],
  },
  {
    id: 'github_release_prep_rehearsal', name: 'GitHub Release-Prep Rehearsal', targetSystem: 'GitHub',
    actionType: 'manual_release_prep', executionMode: 'dry_run', rehearsalOnly: true, externalCall: false,
    databaseWrite: false, fileWrite: false,
    requiredPrechecks: ['diff check', 'lint', 'build', 'smoke', 'secret scan', 'human confirmation'],
    requiredConfirmations: ['确认版本号', '确认发布范围'],
    rollbackPlanPreview: '仅做门禁检查，无回滚要求。', nextSafeStep: '生成 release notes draft，等待人工确认。',
    blockedRealActions: ['git push', 'git tag', 'github_release'],
  },
  {
    id: 'openclaw_sidecar_rehearsal', name: 'OpenClaw Sidecar Rehearsal', targetSystem: 'OpenClaw Sidecar',
    actionType: 'read_only_check', executionMode: 'read_only', rehearsalOnly: true, externalCall: false,
    databaseWrite: false, fileWrite: false,
    requiredPrechecks: ['确认当前 OpenClaw 版本', '确认不覆盖稳定版'],
    requiredConfirmations: ['确认不覆盖 OpenClaw'],
    rollbackPlanPreview: '不启动、不修改、不覆盖。', nextSafeStep: '输出只读观察报告。',
    blockedRealActions: ['start', 'overwrite', 'upgrade_global'],
  },
  {
    id: 'comfyui_workflow_rehearsal', name: 'ComfyUI Workflow Rehearsal', targetSystem: 'ComfyUI',
    actionType: 'local_safe_suggestion', executionMode: 'read_only', rehearsalOnly: true, externalCall: false,
    databaseWrite: false, fileWrite: false,
    requiredPrechecks: ['确认 ComfyUI 端口状态'], requiredConfirmations: ['确认不自动生图'],
    rollbackPlanPreview: '不启动、不调用、不生成图。', nextSafeStep: '输出生图工作流建议。',
    blockedRealActions: ['start', 'invoke', 'generate', 'modify_model'],
  },
  {
    id: 'memory_hub_dry_run_rehearsal', name: 'Memory Hub Dry-Run Rehearsal', targetSystem: 'Memory Hub',
    actionType: 'dry_run_plan', executionMode: 'dry_run', rehearsalOnly: true, externalCall: false,
    databaseWrite: false, fileWrite: false,
    requiredPrechecks: ['确认 candidate 状态', '确认只读边界'],
    requiredConfirmations: ['确认不写 sqlite', '确认不 approve/reject/archive'],
    rollbackPlanPreview: '不做任何持久化操作。', nextSafeStep: '生成候选更新说明（仅预览）。',
    blockedRealActions: ['sqlite_write', 'approve_candidate', 'reject_candidate', 'archive_candidate', 'sync_lan_share'],
  },
  {
    id: 'mahjong_readonly_audit_rehearsal', name: 'Mahjong Readonly Audit Rehearsal', targetSystem: 'Mahjong Dataset',
    actionType: 'read_only_check', executionMode: 'read_only', rehearsalOnly: true, externalCall: false,
    databaseWrite: false, fileWrite: false,
    requiredPrechecks: ['确认目标目录为 Mahjong_V1_Project', '确认只读边界'],
    requiredConfirmations: ['确认不修改 Mahjong_V1_Project', '确认不扫描大文件'],
    rollbackPlanPreview: '只读审计，无需回滚。', nextSafeStep: '输出数据集只读报告。',
    blockedRealActions: ['scan_large_files', 'move', 'delete', 'modify', 'train', 'overwrite_model'],
  },
] as const;

const STOP_CONDITIONS = [
  { id: 'unclear_path', label: '路径不明确', description: '目标路径不明确时停止并请求澄清。' },
  { id: 'delete_overwrite_write_db', label: '涉及删除/覆盖/写库', description: '涉及删除、覆盖、写库操作时必须停止并请求确认。' },
  { id: 'git_push_tag_release', label: '涉及 git push/tag/release', description: '涉及发布操作时必须停止，禁止自动执行。' },
  { id: 'taskkill_kill_node', label: '涉及 taskkill/kill node', description: '涉及进程终止操作时必须停止。' },
  { id: 'openclaw_global_override', label: '涉及 OpenClaw 全局覆盖', description: '涉及 OpenClaw 稳定版覆盖时必须停止。' },
  { id: 'memory_hub_sqlite_write', label: '涉及 Memory Hub sqlite 写入', description: '涉及 Memory Hub 持久化写入时必须停止。' },
  { id: 'mahjong_dataset_modify', label: '涉及 Mahjong 数据集修改', description: '涉及 Mahjong 数据集修改/移动/删除时必须停止。' },
  { id: 'train_overwrite_model', label: '涉及训练并覆盖模型', description: '涉及训练并覆盖 best.pt/last.pt 时必须停止。' },
  { id: 'secret_token_env_risk', label: '检测到 secret/token/.env 风险', description: '检测到敏感配置暴露风险时必须停止。' },
  { id: 'user_not_authorized', label: '用户未明确授权', description: '用户未明确授权时必须停止，不执行任何动作。' },
] as const;

function buildDryRunPlan(taskType: PracticalTaskType, executionMode: ExecutionMode, riskLevel: PracticalRiskLevel, deniedActions: string[]) {
  const isHighRisk = riskLevel === 'high' || riskLevel === 'blocked' || executionMode === 'blocked' || executionMode === 'human_confirm_required';
  const planId = `plan-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const allowedSteps: string[] = ['确认任务范围', '确认目标路径'];
  const forbiddenSteps: string[] = [...deniedActions];
  const stopConditions: string[] = [];

  if (taskType === 'github_release') {
    allowedSteps.push('git diff --check', 'lint', 'build', 'smoke test', 'release notes draft');
    forbiddenSteps.push('git tag', 'git push', 'GitHub Release');
    stopConditions.push('涉及 git push/tag/release', '用户未明确授权');
  } else if (taskType === 'file_cleanup') {
    allowedSteps.push('生成清理候选清单', '路径确认');
    forbiddenSteps.push('delete', 'move', 'taskkill');
    stopConditions.push('涉及删除/覆盖/写库', '涉及 taskkill/kill node');
  } else if (taskType === 'training') {
    allowedSteps.push('训练准备检查', '输出目录确认');
    forbiddenSteps.push('start training', 'overwrite model');
    stopConditions.push('涉及训练并覆盖模型', '用户未明确授权');
  } else if (taskType === 'memory_update') {
    allowedSteps.push('候选状态检查');
    forbiddenSteps.push('sqlite_write', 'approve', 'reject', 'archive');
    stopConditions.push('涉及 Memory Hub sqlite 写入');
  } else if (taskType === 'image_generation') {
    allowedSteps.push('prompt 安全确认', '资源检查');
    forbiddenSteps.push('auto_generate', 'start comfyui');
    stopConditions.push('用户未明确授权');
  } else if (taskType === 'dataset_operation') {
    allowedSteps.push('数据集路径确认', '只读计数预览');
    forbiddenSteps.push('scan_large_files', 'modify', 'train');
    stopConditions.push('涉及 Mahjong 数据集修改');
  } else {
    allowedSteps.push('生成 dry-run 结果', '输出审计预览');
    stopConditions.push('路径不明确', '用户未明确授权');
  }

  if (isHighRisk) {
    forbiddenSteps.push('any automatic execution without confirmation');
    stopConditions.push('涉及删除/覆盖/写库');
  }

  return {
    planId,
    planTitle: `${taskType} dry-run plan`,
    planMode: isHighRisk ? 'read_only_first' : 'dry_run_only',
    steps: allowedSteps,
    allowedSteps,
    forbiddenSteps,
    humanApprovalRequired: isHighRisk,
    stopConditions,
    rollbackPreview: isHighRisk ? '必须先获取人工确认和回滚方案，再执行只读预检。' : '低风险 dry-run 无需回滚，仅做预览。',
    expectedOutputs: isHighRisk ? ['只读审计报告', '风险清单', '人工确认请求'] : ['dry-run 结果', '审计预览'],
  };
}

const ROUTE_MATRIX: Record<PracticalTaskType, Record<StrategyMode, { route: RouteType; modelTier: ModelTier; executionMode: ExecutionMode; note: string }>> = {
  text_inference: {
    save_money: { route: 'local_cpu', modelTier: 'economy', executionMode: 'cloud_allowed', note: '简单问答低风险，可建议 economy/cloud_allowed，但不自动真实调用。' },
    stable_first: { route: 'local_balanced', modelTier: 'balanced', executionMode: 'read_only', note: '稳定优先时使用本地平衡路线。' },
    quality_first: { route: 'cloud_reasoning_model', modelTier: 'premium', executionMode: 'cloud_allowed', note: '高质量文本推理可建议强推理，但只做建议。' },
    local_first: { route: 'local_cpu', modelTier: 'local', executionMode: 'read_only', note: '本地优先时避免外部调用。' },
    balanced: { route: 'local_balanced', modelTier: 'balanced', executionMode: 'read_only', note: '默认平衡成本和质量。' },
  },
  code_analysis: {
    save_money: { route: 'local_balanced', modelTier: 'balanced', executionMode: 'dry_run', note: '先用本地规则缩小问题。' },
    stable_first: { route: 'local_balanced', modelTier: 'balanced', executionMode: 'dry_run', note: '稳定路线先审查再改动。' },
    quality_first: { route: 'cloud_reasoning_model', modelTier: 'premium', executionMode: 'ask_first', note: '复杂代码可建议强推理，但必须先确认。' },
    local_first: { route: 'openclaw_stable_2026_3_23', modelTier: 'toolchain', executionMode: 'local_only', note: '本地工具链优先但不覆盖稳定版。' },
    balanced: { route: 'local_balanced', modelTier: 'balanced', executionMode: 'dry_run', note: '常规调试走平衡路线。' },
  },
  training: {
    save_money: { route: 'manual_confirm', modelTier: 'blocked', executionMode: 'human_confirm_required', note: '训练必须人工确认。' },
    stable_first: { route: 'manual_confirm', modelTier: 'blocked', executionMode: 'human_confirm_required', note: '训练先做只读预检。' },
    quality_first: { route: 'manual_confirm', modelTier: 'blocked', executionMode: 'human_confirm_required', note: '训练不能自动启动。' },
    local_first: { route: 'manual_confirm', modelTier: 'toolchain', executionMode: 'human_confirm_required', note: '本地 GPU 训练需要确认输出目录。' },
    balanced: { route: 'manual_confirm', modelTier: 'blocked', executionMode: 'human_confirm_required', note: '训练动作默认拦截。' },
  },
  image_generation: {
    save_money: { route: 'manual_confirm', modelTier: 'toolchain', executionMode: 'human_confirm_required', note: '生图有资源占用，先确认。' },
    stable_first: { route: 'manual_confirm', modelTier: 'toolchain', executionMode: 'human_confirm_required', note: '不触碰稳定 OpenClaw。' },
    quality_first: { route: 'manual_confirm', modelTier: 'toolchain', executionMode: 'human_confirm_required', note: '高质量生图仍需确认。' },
    local_first: { route: 'openclaw_sidecar_2026_5_12', modelTier: 'toolchain', executionMode: 'ask_first', note: '推荐 sidecar/ComfyUI 路线但不自动执行。' },
    balanced: { route: 'manual_confirm', modelTier: 'toolchain', executionMode: 'human_confirm_required', note: '默认人工确认。' },
  },
  image_to_video: {
    save_money: { route: 'blocked', modelTier: 'blocked', executionMode: 'blocked', note: '高成本长任务默认阻断。' },
    stable_first: { route: 'blocked', modelTier: 'blocked', executionMode: 'blocked', note: '资源占用不确定。' },
    quality_first: { route: 'manual_confirm', modelTier: 'premium', executionMode: 'human_confirm_required', note: '必须先确认预算和规格。' },
    local_first: { route: 'manual_confirm', modelTier: 'toolchain', executionMode: 'human_confirm_required', note: '本地长任务必须确认。' },
    balanced: { route: 'blocked', modelTier: 'blocked', executionMode: 'blocked', note: '默认不自动执行。' },
  },
  readonly_audit: {
    save_money: { route: 'local_cpu', modelTier: 'economy', executionMode: 'read_only', note: '只读检查适合本地低成本。' },
    stable_first: { route: 'local_cpu', modelTier: 'local', executionMode: 'read_only', note: '稳定只读检查。' },
    quality_first: { route: 'local_balanced', modelTier: 'balanced', executionMode: 'read_only', note: '更详细报告用平衡路线。' },
    local_first: { route: 'local_cpu', modelTier: 'local', executionMode: 'read_only', note: '本地只读优先。' },
    balanced: { route: 'local_balanced', modelTier: 'balanced', executionMode: 'read_only', note: '平衡扫描和解释。' },
  },
  file_cleanup: {
    save_money: { route: 'manual_confirm', modelTier: 'blocked', executionMode: 'human_confirm_required', note: '删除移动必须确认。' },
    stable_first: { route: 'manual_confirm', modelTier: 'blocked', executionMode: 'human_confirm_required', note: '先只读候选清单。' },
    quality_first: { route: 'manual_confirm', modelTier: 'blocked', executionMode: 'human_confirm_required', note: '高风险动作不因质量优先放行。' },
    local_first: { route: 'manual_confirm', modelTier: 'blocked', executionMode: 'human_confirm_required', note: '本地文件风险仍需确认。' },
    balanced: { route: 'manual_confirm', modelTier: 'blocked', executionMode: 'human_confirm_required', note: '默认人工确认。' },
  },
  github_release: {
    save_money: { route: 'manual_confirm', modelTier: 'blocked', executionMode: 'human_confirm_required', note: '发布链必须人工确认。' },
    stable_first: { route: 'manual_confirm', modelTier: 'blocked', executionMode: 'human_confirm_required', note: '先 release-prep/gate-check。' },
    quality_first: { route: 'manual_confirm', modelTier: 'blocked', executionMode: 'human_confirm_required', note: '强模型不能替代发布确认。' },
    local_first: { route: 'manual_confirm', modelTier: 'blocked', executionMode: 'human_confirm_required', note: '本地封板也不可自动 push/tag/release。' },
    balanced: { route: 'manual_confirm', modelTier: 'blocked', executionMode: 'human_confirm_required', note: '发布默认人工确认。' },
  },
  memory_update: {
    save_money: { route: 'manual_confirm', modelTier: 'blocked', executionMode: 'human_confirm_required', note: '记忆写入必须确认。' },
    stable_first: { route: 'manual_confirm', modelTier: 'blocked', executionMode: 'human_confirm_required', note: '先只读候选审批。' },
    quality_first: { route: 'manual_confirm', modelTier: 'blocked', executionMode: 'human_confirm_required', note: '长期记忆不自动写。' },
    local_first: { route: 'manual_confirm', modelTier: 'blocked', executionMode: 'human_confirm_required', note: '本地 sqlite 仍需确认。' },
    balanced: { route: 'manual_confirm', modelTier: 'blocked', executionMode: 'human_confirm_required', note: '默认人工审批。' },
  },
  dataset_operation: {
    save_money: { route: 'local_cpu', modelTier: 'local', executionMode: 'read_only', note: '只读数据集检查可本地执行。' },
    stable_first: { route: 'local_cpu', modelTier: 'local', executionMode: 'read_only', note: '先扫描清单，不写入。' },
    quality_first: { route: 'local_balanced', modelTier: 'balanced', executionMode: 'dry_run', note: '更高质量分析仍先 dry-run。' },
    local_first: { route: 'local_cpu', modelTier: 'local', executionMode: 'read_only', note: '本地只读检查优先。' },
    balanced: { route: 'local_balanced', modelTier: 'balanced', executionMode: 'dry_run', note: '平衡路线先预检。' },
  },
};

const CASE_MATRIX = [
  { label: '普通问答', taskType: 'chat_qa', mode: 'save_money', input: { budget: 'low', prompt: '普通问答：解释 AIP 当前状态' }, expectedCategory: 'text_inference', expectedRiskLevel: 'low', expectedExecutionMode: 'cloud_allowed', expectedModelTier: 'economy', expectedSafetyBehavior: '推荐低成本本地路线' },
  { label: '文档总结', taskType: 'document_summary', mode: 'save_money', input: { budget: 'low', prompt: '总结这份文档' }, expectedCategory: 'text_inference', expectedRiskLevel: 'low', expectedExecutionMode: 'cloud_allowed', expectedModelTier: 'economy', expectedSafetyBehavior: '低风险 economy/balanced 建议，不自动真实执行' },
  { label: '代码调试', taskType: 'code_debug', mode: 'quality_first', input: { budget: 'medium', target: '复杂代码调试' }, expectedCategory: 'code_analysis', expectedRiskLevel: 'medium', expectedExecutionMode: 'ask_first', expectedModelTier: 'premium', expectedSafetyBehavior: '预算确认后才可升级' },
  { label: 'AIP 只读健康检查', taskType: 'readonly_project_audit', mode: 'stable_first', input: { budget: 'low', target: 'AIP health readonly check' }, expectedCategory: 'readonly_audit', expectedRiskLevel: 'low', expectedExecutionMode: 'read_only', expectedModelTier: 'local', expectedSafetyBehavior: '只读检查' },
  { label: 'GitHub Release 发布', taskType: 'git_release_seal', mode: 'stable_first', input: { target: 'git push git tag GitHub Release' }, expectedCategory: 'github_release', expectedRiskLevel: 'high', expectedExecutionMode: 'human_confirm_required', expectedModelTier: 'blocked', expectedSafetyBehavior: '禁止自动发布' },
  { label: '删除旧备份', taskType: 'high_risk_system_ops', mode: 'stable_first', input: { target: '删除旧备份目录' }, expectedCategory: 'file_cleanup', expectedRiskLevel: 'high', expectedExecutionMode: 'human_confirm_required', expectedModelTier: 'blocked', expectedSafetyBehavior: '只生成候选清单' },
  { label: 'taskkill node', taskType: 'high_risk_system_ops', mode: 'stable_first', input: { target: 'taskkill /IM node.exe' }, expectedCategory: 'file_cleanup', expectedRiskLevel: 'blocked', expectedExecutionMode: 'blocked', expectedModelTier: 'blocked', expectedSafetyBehavior: '禁止全局杀 node' },
  { label: '启动 ComfyUI 生图', taskType: 'image_comfyui', mode: 'local_first', input: { comfy_available: true, prompt: '启动 ComfyUI 生图' }, expectedCategory: 'image_generation', expectedRiskLevel: 'medium', expectedExecutionMode: 'ask_first', expectedModelTier: 'toolchain', expectedSafetyBehavior: '推荐 sidecar 但不自动执行' },
  { label: 'Mahjong 数据集只读检查', taskType: 'dataset_yolo_mahjong', mode: 'local_first', input: { target: 'Mahjong dataset readonly check' }, expectedCategory: 'dataset_operation', expectedRiskLevel: 'medium', expectedExecutionMode: 'read_only', expectedModelTier: 'local', expectedSafetyBehavior: '不扫描受保护目录' },
  { label: '训练 Mahjong 模型并覆盖 best.pt', taskType: 'training', mode: 'local_first', input: { target: '训练 Mahjong 模型并覆盖 best.pt', gpu_needed: true }, expectedCategory: 'training', expectedRiskLevel: 'high', expectedExecutionMode: 'human_confirm_required', expectedModelTier: 'toolchain', expectedSafetyBehavior: '禁止自动训练和覆盖权重' },
  { label: 'Memory Hub 候选审批', taskType: 'memory_hub_knowledge', mode: 'stable_first', input: { target: '修改 candidate sqlite' }, expectedCategory: 'memory_update', expectedRiskLevel: 'high', expectedExecutionMode: 'human_confirm_required', expectedModelTier: 'blocked', expectedSafetyBehavior: '只读候选审批' },
  { label: 'OpenClaw 稳定版升级/覆盖', taskType: 'openclaw_agent_task', mode: 'local_first', input: { target: '覆盖 OpenClaw 2026.3.23 稳定版' }, expectedCategory: 'code_analysis', expectedRiskLevel: 'high', expectedExecutionMode: 'human_confirm_required', expectedModelTier: 'blocked', expectedSafetyBehavior: '要求旁路验证和回滚，不覆盖稳定版' },
  { label: '模糊任务', taskType: 'text_inference', mode: 'balanced', input: { target: '帮我弄一下' }, expectedCategory: 'text_inference', expectedRiskLevel: 'low', expectedExecutionMode: 'read_only', expectedModelTier: 'balanced', expectedSafetyBehavior: '低置信度并要求补充信息' },
  { label: '依赖安装', taskType: 'code_debug', mode: 'stable_first', input: { target: 'pnpm install 一堆新依赖' }, expectedCategory: 'code_analysis', expectedRiskLevel: 'high', expectedExecutionMode: 'human_confirm_required', expectedModelTier: 'blocked', expectedSafetyBehavior: '大范围依赖变更必须人工确认' },
  { label: '修改 .env token', taskType: 'high_risk_system_ops', mode: 'stable_first', input: { target: '帮我改 .env token' }, expectedCategory: 'file_cleanup', expectedRiskLevel: 'high', expectedExecutionMode: 'human_confirm_required', expectedModelTier: 'blocked', expectedSafetyBehavior: '敏感配置和密钥风险必须人工确认' },
] as const;

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
  const mapped = TASK_CONSOLE_TYPES.find((item) => item.id === raw || item.label.toLowerCase() === raw);
  if (mapped) return mapped.maps_to as PracticalTaskType;
  if (raw.includes('chat') || raw.includes('问答') || raw.includes('聊天')) return 'text_inference';
  if (raw.includes('document') || raw.includes('summary') || raw.includes('文档') || raw.includes('总结') || raw.includes('改写')) return 'text_inference';
  if (raw.includes('train')) return 'training';
  if (raw.includes('image') && raw.includes('video')) return 'image_to_video';
  if (raw.includes('image')) return 'image_generation';
  if (raw.includes('comfy')) return 'image_generation';
  if (raw.includes('dataset') || raw.includes('yolo') || raw.includes('mahjong') || raw.includes('数据集')) return 'dataset_operation';
  if (raw.includes('cleanup') || raw.includes('delete') || raw.includes('move')) return 'file_cleanup';
  if (raw.includes('release') || raw.includes('封板') || raw.includes('发布')) return 'github_release';
  if (raw.includes('memory')) return 'memory_update';
  if (raw.includes('audit')) return 'readonly_audit';
  if (raw.includes('巡检') || raw.includes('只读')) return 'readonly_audit';
  if (raw.includes('code') || raw.includes('代码') || raw.includes('debug') || raw.includes('调试')) return 'code_analysis';
  if (raw.includes('risk') || raw.includes('高风险') || raw.includes('system')) return 'file_cleanup';
  return 'text_inference';
}

function normalizeStrategyMode(v: any, taskType: PracticalTaskType): StrategyMode {
  const raw = String(v || '').trim().toLowerCase();
  if (raw === 'save_money' || raw.includes('省钱')) return 'save_money';
  if (raw === 'stable_first' || raw.includes('稳定')) return 'stable_first';
  if (raw === 'quality_first' || raw.includes('质量')) return 'quality_first';
  if (raw === 'local_first' || raw.includes('本地')) return 'local_first';
  if (raw === 'balanced' || raw.includes('平衡')) return 'balanced';
  const matched = TASK_CONSOLE_TYPES.find((item) => item.maps_to === taskType);
  return (matched?.default_strategy as StrategyMode | undefined) || 'stable_first';
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

function getTaskLabel(taskType: PracticalTaskType): string {
  const matched = TASK_CONSOLE_TYPES.find((item) => item.maps_to === taskType);
  if (matched) return matched.label;
  const labels: Record<PracticalTaskType, string> = {
    text_inference: '普通聊天/问答',
    code_analysis: '代码修改/调试',
    training: '数据集/YOLO/Mahjong',
    image_generation: '图像生成/ComfyUI',
    image_to_video: '高成本视频生成',
    readonly_audit: '项目只读巡检',
    file_cleanup: '高风险系统操作',
    github_release: 'Git 发布/版本封板',
    memory_update: '高风险系统操作',
    dataset_operation: '数据集/YOLO/Mahjong',
  };
  return labels[taskType];
}

function getTaskCategoryMeta(taskType: PracticalTaskType, input?: any) {
  const raw = String(input?.__raw_task_type || '').trim();
  const exact = TASK_CONSOLE_TYPES.find((item) => item.id === raw);
  if (exact) return exact;
  const matched = TASK_CONSOLE_TYPES.find((item) => item.maps_to === taskType);
  return matched || TASK_CONSOLE_TYPES[0];
}

function findFirewallHits(taskType: PracticalTaskType, input: any): string[] {
  const text = `${taskType} ${targetText(input)} ${JSON.stringify(input || {})}`.toLowerCase();
  return HIGH_RISK_FIREWALL_RULES
    .filter((rule) => rule.patterns.some((pattern) => text.includes(pattern)))
    .map((rule) => rule.label);
}

function routeQualityBase(route: RouteType): number {
  return ROUTE_PROFILES[route]?.capability_index ?? 0.5;
}

function routeSpeedBase(route: RouteType): number {
  const latency = ROUTE_PROFILES[route]?.latency_ms ?? 800;
  return clamp(1 - latency / 1600, 0.25, 1);
}

function routeCostBase(route: RouteType): number {
  const cost = ROUTE_PROFILES[route]?.cost_index ?? 0.5;
  return clamp(1 - cost, 0, 1);
}

function routeRiskBase(route: RouteType): number {
  return ROUTE_PROFILES[route]?.risk_isolation ?? 0.75;
}

function scorePracticalDecision(
  route: RouteType,
  taskType: PracticalTaskType,
  strategyMode: StrategyMode,
  riskLevel: PracticalRiskLevel,
  needsUserConfirm: boolean,
) {
  const qualityNeed = taskType === 'code_analysis' || strategyMode === 'quality_first' ? 0.92
    : taskType === 'image_generation' || taskType === 'training' || taskType === 'dataset_operation' ? 0.78
      : 0.55;
  const speedNeed = taskType === 'text_inference' ? 0.72 : strategyMode === 'stable_first' ? 0.62 : 0.55;
  const riskPenalty = riskLevel === 'blocked' ? 0.95 : riskLevel === 'high' ? 0.72 : riskLevel === 'medium' ? 0.42 : 0.12;
  const confirmPenalty = needsUserConfirm ? 0.12 : 0;
  const costScoreValue = route === 'blocked' ? 0 : Math.round(routeCostBase(route) * 100);
  const qualityScoreValue = Math.round((1 - Math.abs(routeQualityBase(route) - qualityNeed)) * 100);
  const speedScoreValue = Math.round((1 - Math.abs(routeSpeedBase(route) - speedNeed)) * 100);
  const riskScoreValue = Math.round(clamp(routeRiskBase(route) - riskPenalty - confirmPenalty + 0.18, 0, 1) * 100);
  return {
    costScore: costScoreValue,
    qualityScore: clamp(qualityScoreValue, 0, 100),
    speedScore: clamp(speedScoreValue, 0, 100),
    riskScore: clamp(riskScoreValue, 0, 100),
  };
}

function fallbackFor(route: RouteType, strategyMode: StrategyMode, blocked: boolean): { fallbackRoute: RouteType; fallbackPlan: string } {
  if (blocked) {
    return { fallbackRoute: 'manual_confirm', fallbackPlan: '保持阻断状态，先输出只读报告，由人工拆分为安全子任务。' };
  }
  if (route === 'manual_confirm') {
    return { fallbackRoute: strategyMode === 'quality_first' ? 'local_balanced' : 'local_cpu', fallbackPlan: '人工确认后先走只读预检，再按确认范围升级执行准备。' };
  }
  if (strategyMode === 'quality_first') {
    return { fallbackRoute: 'cloud_reasoning_model', fallbackPlan: '本地或稳定路线质量不足时，升级到强推理路线，但必须确认预算。' };
  }
  if (strategyMode === 'local_first') {
    return { fallbackRoute: 'manual_confirm', fallbackPlan: '本地能力不足时停止自动升级，改为人工确认 sidecar 或云端方案。' };
  }
  if (strategyMode === 'balanced') {
    return { fallbackRoute: 'local_balanced', fallbackPlan: '平衡路线失败后先做 dry-run 复核，再决定是否升级质量优先或人工确认。' };
  }
  return { fallbackRoute: 'local_balanced', fallbackPlan: '低成本路线失败后升级到本地平衡路线，仍不自动发布或写入。' };
}

function executionModeFor(taskType: PracticalTaskType, route: RouteType, riskLevel: PracticalRiskLevel, needsUserConfirm: boolean, firewallHits: string[]): ExecutionMode {
  if (route === 'blocked' || riskLevel === 'blocked') return 'blocked';
  if (firewallHits.some((hit) => hit === 'taskkill' || hit === 'kill node')) return 'blocked';
  if (firewallHits.length > 0 || riskLevel === 'high') return 'human_confirm_required';
  if (needsUserConfirm) return 'ask_first';
  if (taskType === 'readonly_audit' || taskType === 'text_inference') return 'read_only';
  if (route === 'cloud_reasoning_model' || route === 'cloud_high_capability') return 'cloud_allowed';
  if (route.startsWith('local') || route.startsWith('openclaw') || route === 'comfyui_8000') return 'local_only';
  return 'dry_run';
}

function routeDisplayName(route: RouteType): string {
  const names: Record<RouteType, string> = {
    local_low_cost: '本地低成本出口',
    local_balanced: '本地平衡出口',
    cloud_high_capability: '云端高能力出口',
    local_cpu: '本地 CPU 出口',
    local_gpu: '本地 GPU 出口',
    openclaw_stable_2026_3_23: 'OpenClaw 稳定出口',
    openclaw_sidecar_2026_5_12: 'OpenClaw 小盒子出口',
    comfyui_8000: 'ComfyUI 8000 出口',
    cloud_reasoning_model: '云端强推理出口',
    manual_confirm: '人工确认出口',
    blocked: '阻断出口',
  };
  return names[route];
}

function modelTierFor(route: RouteType, taskType: PracticalTaskType, strategyMode: StrategyMode): ModelTier {
  if (route === 'blocked') return 'blocked';
  if (route === 'manual_confirm' && (taskType === 'training' || taskType === 'image_generation' || taskType === 'dataset_operation')) return 'toolchain';
  if (route === 'manual_confirm') return 'blocked';
  const matrixTier = ROUTE_MATRIX[taskType]?.[strategyMode]?.modelTier;
  if (matrixTier) return matrixTier;
  if (route === 'cloud_reasoning_model' || route === 'cloud_high_capability') return 'premium';
  if (route === 'local_gpu' || route === 'local_cpu' || route === 'local_low_cost' || route === 'local_balanced') return 'local';
  if (route === 'openclaw_sidecar_2026_5_12' || route === 'comfyui_8000' || route === 'openclaw_stable_2026_3_23') return 'toolchain';
  return taskType === 'text_inference' ? 'economy' : 'balanced';
}

function deniedActionsFor(taskType: PracticalTaskType, firewallHits: string[]): string[] {
  const denied = new Set<string>();
  for (const hit of firewallHits) denied.add(hit);
  if (taskType === 'github_release') ['git push', 'git tag', 'GitHub Release without confirmation'].forEach((item) => denied.add(item));
  if (taskType === 'file_cleanup') ['delete files', 'move files', 'delete backups'].forEach((item) => denied.add(item));
  if (taskType === 'training') ['start training', 'overwrite best.pt', 'overwrite last.pt'].forEach((item) => denied.add(item));
  if (taskType === 'memory_update') ['write sqlite', 'modify candidate', 'modify LAN_SHARE'].forEach((item) => denied.add(item));
  return Array.from(denied);
}

function toolchainFor(route: RouteType, taskType: PracticalTaskType, executionMode: ExecutionMode, deniedActions: string[]) {
  const basePrechecks = ['确认任务范围', '确认目标路径', '生成 preview/dry-run 结果'];
  const rollbackRequired = executionMode === 'human_confirm_required' || executionMode === 'blocked' || deniedActions.length > 0;
  if (taskType === 'github_release') {
    return { primary: 'release-prep / gate-check', secondary: ['status audit', 'diff check', 'human approval'], requiresHuman: true, readOnlyFirst: true, dryRunFirst: true, forbiddenActions: deniedActions, suggestedPrechecks: [...basePrechecks, '确认版本号和发布范围'], rollbackRequired: true };
  }
  if (taskType === 'image_generation') {
    return { primary: route === 'openclaw_sidecar_2026_5_12' ? 'OpenClaw sidecar 2026.5.12' : 'ComfyUI route proposal', secondary: ['prompt audit', 'resource check'], requiresHuman: true, readOnlyFirst: true, dryRunFirst: true, forbiddenActions: deniedActions, suggestedPrechecks: [...basePrechecks, '确认不会启动或修改 ComfyUI'], rollbackRequired };
  }
  if (taskType === 'dataset_operation' || taskType === 'training') {
    return { primary: 'local dataset audit', secondary: ['YOLO preflight', 'new output directory check'], requiresHuman: executionMode !== 'read_only', readOnlyFirst: true, dryRunFirst: true, forbiddenActions: deniedActions, suggestedPrechecks: [...basePrechecks, '确认数据集路径和新输出目录'], rollbackRequired };
  }
  if (taskType === 'readonly_audit') {
    return { primary: 'read-only scanner', secondary: ['health probe', 'report writer'], requiresHuman: false, readOnlyFirst: true, dryRunFirst: false, forbiddenActions: deniedActions, suggestedPrechecks: ['确认只读边界', '确认报告输出路径'], rollbackRequired: false };
  }
  if (route === 'cloud_reasoning_model') {
    return { primary: 'premium reasoning proposal', secondary: ['local pre-triage', 'budget confirmation'], requiresHuman: true, readOnlyFirst: true, dryRunFirst: true, forbiddenActions: deniedActions, suggestedPrechecks: [...basePrechecks, '确认预算和外部调用许可'], rollbackRequired };
  }
  return { primary: 'local rules engine', secondary: ['audit preview'], requiresHuman: executionMode !== 'read_only', readOnlyFirst: true, dryRunFirst: executionMode !== 'read_only', forbiddenActions: deniedActions, suggestedPrechecks: basePrechecks, rollbackRequired };
}

function tierExplanation(tier: ModelTier, taskType: PracticalTaskType): { tierReason: string; whyNotOtherTiers: string[] } {
  const reasons: Record<ModelTier, string> = {
    economy: '任务低风险且成本敏感，适合便宜快速路线。',
    balanced: '任务需要比 economy 更稳的综合能力，但还不需要 premium。',
    premium: '任务需要复杂推理或高质量判断，但只建议不自动调用。',
    local: '任务可在本地只读或规则检查中完成，优先避免外部调用。',
    toolchain: '任务依赖 AIP/API/脚本/OpenClaw/ComfyUI/Memory Hub/GitHub 等工具链编排。',
    blocked: '任务命中高风险或保护边界，禁止自动执行。',
  };
  const whyNot: Record<ModelTier, string[]> = {
    economy: ['balanced/premium 成本更高，当前任务不需要。', 'toolchain/local 不是必要执行路径。'],
    balanced: ['economy 可能解释能力不足。', 'premium 成本更高，暂不直接升级。'],
    premium: ['economy/balanced 对复杂任务可能质量不足。', 'local/toolchain 只能先做预检或辅助。'],
    local: ['cloud/premium 会引入外部调用和成本。', 'blocked 不适用于低风险只读任务。'],
    toolchain: ['纯模型层不能代表本地工具链动作。', '真实工具执行仍需确认或 dry-run。'],
    blocked: ['其他模型层不应绕过风险防火墙。', '必须先改写为只读检查或取得人工确认。'],
  };
  return {
    tierReason: `${reasons[tier]} 任务类型=${taskType}。`,
    whyNotOtherTiers: whyNot[tier],
  };
}

function confidenceFor(taskTypeRaw: string, taskType: PracticalTaskType, input: any, riskLevel: PracticalRiskLevel): { confidence: ConfidenceLevel; confidenceReason: string; missingInformation: string[] } {
  const text = targetText(input);
  const missing: string[] = [];
  const vague = ['弄一下', '处理一下', '搞一下', 'fix it', 'help'].some((item) => text.includes(item));
  if (!taskTypeRaw || vague || text.length < 6) missing.push('任务目标不够具体');
  if (riskLevel === 'high' || riskLevel === 'blocked') missing.push('高风险任务需要确认允许动作和回滚边界');
  if (taskType === 'training') missing.push('需要确认数据集路径、输出目录、是否允许覆盖权重');
  if (taskType === 'github_release') missing.push('需要确认目标版本、提交范围、是否允许 tag/push/release');
  if (taskType === 'image_generation') missing.push('需要确认是否允许启动 ComfyUI/sidecar 真实执行');
  if (missing.length === 0) return { confidence: 'high', confidenceReason: '任务类型、策略档位和风险边界都清楚。', missingInformation: [] };
  if (riskLevel === 'high' || riskLevel === 'blocked') return { confidence: 'medium', confidenceReason: '分类明确，但高风险动作缺少人工确认。', missingInformation: missing };
  return { confidence: 'low', confidenceReason: '输入过于笼统，路由只能给低置信度建议。', missingInformation: missing };
}

function enrichPracticalDecision(decision: Omit<PracticalDecision,
  'strategyMode' | 'taskLabel' | 'recommendedChannel' | 'costScore' | 'qualityScore' | 'speedScore' | 'riskScore' |
  'scoreExplanation' | 'fallbackRoute' | 'fallbackPlan' | 'humanReadableExplanation' | 'firewallHits'
>, taskType: PracticalTaskType, input: any): PracticalDecision {
  const strategyMode = normalizeStrategyMode(input.strategy_mode || input.strategyMode, taskType);
  const strategy = STRATEGY_MODES[strategyMode];
  const matrix = ROUTE_MATRIX[taskType]?.[strategyMode];
  const category = getTaskCategoryMeta(taskType, input);
  const firewallHits = findFirewallHits(taskType, input);
  const highRiskFirewall = firewallHits.length > 0 && (
    taskType === 'github_release' ||
    taskType === 'file_cleanup' ||
    taskType === 'memory_update' ||
    decision.riskLevel === 'blocked' ||
    firewallHits.some((hit) => hit !== '训练/覆盖模型')
  );
  const processKillBlocked = firewallHits.some((hit) => hit === 'taskkill' || hit === 'kill node');
  const selectedRoute = processKillBlocked ? 'blocked' : (highRiskFirewall ? 'manual_confirm' : (matrix?.route || decision.selectedRoute));
  const riskLevel = processKillBlocked ? 'blocked' : (highRiskFirewall && decision.riskLevel !== 'blocked' ? 'high' : decision.riskLevel);
  const needsUserConfirm = highRiskFirewall || decision.needsUserConfirm;
  const blocked = selectedRoute === 'blocked' || riskLevel === 'blocked';
  const scores = scorePracticalDecision(selectedRoute, taskType, strategyMode, riskLevel, needsUserConfirm);
  const fallback = fallbackFor(selectedRoute, strategyMode, blocked);
  const executionMode = highRiskFirewall ? executionModeFor(taskType, selectedRoute, riskLevel, needsUserConfirm, firewallHits) : (matrix?.executionMode || executionModeFor(taskType, selectedRoute, riskLevel, needsUserConfirm, firewallHits));
  const deniedActions = deniedActionsFor(taskType, firewallHits);
  const confidence = confidenceFor(String(input.__raw_task_type || ''), taskType, input, riskLevel);
  const recommendedModelTier = modelTierFor(selectedRoute, taskType, strategyMode);
  const tier = tierExplanation(recommendedModelTier, taskType);
  const readOnlyPrechecks = [
    '确认 git status 和当前差异范围',
    '确认目标路径属于允许范围',
    '生成 dry-run / preview 结果',
  ];
  const rollbackPlan = [
    '本轮不执行真实动作，因此默认无需文件级回滚。',
    '若后续进入执行阶段，必须先记录精确路径、生成备份或 revert 方案。',
    '高风险动作必须拆成只读检查、人工确认、执行、复核四步。',
  ];
  const requiredConfirmations = needsUserConfirm || firewallHits.length > 0
    ? ['确认任务范围', '确认允许动作', '确认回滚方式']
    : [];
  const safetyNotes = Array.from(new Set([
    ...decision.safetyNotes,
    ...firewallHits.map((hit) => `风险防火墙命中：${hit}，只能建议人工确认。`),
    executionMode === 'human_confirm_required' ? '执行模式为 human_confirm_required，不允许自动执行。' : '',
    executionMode === 'blocked' ? '执行模式为 blocked，必须先改写为只读检查任务。' : '',
    'auditPreview 标记 wouldExecute=false，本轮仅做建议和预览。',
  ].filter(Boolean)));

  return {
    ...decision,
    selectedRoute,
    riskLevel,
    needsUserConfirm,
    safetyNotes,
    strategyMode,
    taskLabel: getTaskLabel(taskType),
    recommendedChannel: strategy.recommended_channel,
    ...scores,
    scoreExplanation: `策略档位=${strategy.name}；成本=${scores.costScore}，质量=${scores.qualityScore}，速度=${scores.speedScore}，风险控制=${scores.riskScore}。`,
    fallbackRoute: fallback.fallbackRoute,
    fallbackPlan: fallback.fallbackPlan,
    humanReadableExplanation: `${strategy.name}适合：${strategy.suitable_for} 当前任务识别为“${getTaskLabel(taskType)}”，推荐 ${selectedRoute}，原因是：${decision.reason}`,
    firewallHits,
    selectedPolicy: strategy.id,
    detectedCategory: category.id,
    routeName: routeDisplayName(selectedRoute),
    recommendedModelTier,
    tierReason: tier.tierReason,
    whyNotOtherTiers: tier.whyNotOtherTiers,
    recommendedToolchain: toolchainFor(selectedRoute, taskType, executionMode, deniedActions),
    executionMode,
    matchedRules: firewallHits,
    requiredConfirmations,
    readOnlyPrechecks,
    rollbackPlan,
    deniedActions,
    confidence: confidence.confidence,
    confidenceReason: confidence.confidenceReason,
    missingInformation: confidence.missingInformation,
    whyThisRoute: `${strategy.name}下，${getTaskLabel(taskType)}优先走${routeDisplayName(selectedRoute)}；风险等级=${riskLevel}，确认要求=${needsUserConfirm ? '需要人工确认' : '无需人工确认'}。`,
    escalationPlan: [
      fallback.fallbackPlan,
      `失败切换出口：${routeDisplayName(fallback.fallbackRoute)}`,
      highRiskFirewall ? '高风险命中时先只读检查，再生成回滚方案，最后等待人工确认。' : '低风险任务可先 dry-run，再根据质量结果升级。',
    ],
    actionType: selectedRoute === 'blocked' || riskLevel === 'blocked' ? 'blocked_action'
      : executionMode === 'human_confirm_required' ? 'ask_for_confirmation'
      : executionMode === 'blocked' ? 'blocked_action'
      : taskType === 'github_release' ? 'manual_release_prep'
      : executionMode === 'dry_run' ? 'dry_run_plan'
      : executionMode === 'read_only' ? 'read_only_check'
      : executionMode === 'ask_first' ? 'ask_for_confirmation'
      : 'local_safe_suggestion',
    actionLabel: routeDisplayName(selectedRoute),
    actionExplanation: decision.reason,
    allowedNextStep: decision.nextAction,
    forbiddenNextSteps: deniedActions,
    requiresHumanConfirmation: needsUserConfirm,
    persistenceMode: 'preview_only',
    humanGateRequired: needsUserConfirm || riskLevel === 'high' || riskLevel === 'blocked' || firewallHits.length > 0,
    confirmationReason: needsUserConfirm ? '高风险任务需人工确认后才能继续。' : '',
    noAutomaticExecution: executionMode === 'human_confirm_required' || executionMode === 'blocked',
    auditPreview: {
      auditSchemaVersion: 'preview-v2',
      mode: 'preview_only',
      wouldExecute: false,
      wouldWriteFiles: false,
      databaseWrite: false,
      fileWrite: false,
      externalWrite: false,
      timestamp: now(),
      taskSummary: targetText(input) || getTaskLabel(taskType),
      rawInput: input && typeof input === 'object' ? input : {},
      selectedPolicy: strategy.id,
      detectedCategory: category.id,
      actionType: selectedRoute === 'blocked' || riskLevel === 'blocked' ? 'blocked_action'
        : executionMode === 'human_confirm_required' ? 'ask_for_confirmation'
        : executionMode === 'blocked' ? 'blocked_action'
        : taskType === 'github_release' ? 'manual_release_prep'
        : executionMode === 'dry_run' ? 'dry_run_plan'
        : executionMode === 'read_only' ? 'read_only_check'
        : executionMode === 'ask_first' ? 'ask_for_confirmation'
        : 'local_safe_suggestion',
      riskLevel,
      executionMode,
      confidence: confidence.confidence,
      matchedRiskRules: firewallHits,
      recommendedRoute: selectedRoute,
      recommendedModelTier,
      deniedActions,
      readOnlyPrechecks,
      nextSafeStep: decision.nextAction,
      rollbackRequired: deniedActions.length > 0 || executionMode === 'human_confirm_required' || executionMode === 'blocked',
      auditMode: 'preview_only',
      requiredConfirmations,
      rollbackPlan,
      auditIdPreview: genId('audit-preview'),
      persistenceMode: 'preview_only',
      selectedModelRoute: recommendedModelTier,
      selectedToolchainRoute: selectedRoute === 'openclaw_sidecar_2026_5_12' ? 'openclaw_sidecar_preview'
        : selectedRoute === 'comfyui_8000' ? 'comfyui_generation_preview'
        : selectedRoute === 'openclaw_stable_2026_3_23' ? 'aip_readonly_check'
        : selectedRoute === 'manual_confirm' ? 'blocked_system_operation'
        : 'local_script_dry_run',
    },
    dryRunPlan: buildDryRunPlan(taskType, executionMode, riskLevel, deniedActions),
  };
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
      selectedRoute: 'manual_confirm',
      costLevel: 'unknown',
      riskLevel: 'high',
      needsUserConfirm: true,
      reason: '请求可能覆盖 OpenClaw 2026.3.23 稳定版，必须人工确认、旁路验证和回滚方案。',
      rejectedRoutes: [
        { route: 'openclaw_stable_2026_3_23', reason: '稳定版只能作为已知能力展示，禁止覆盖。' },
      ],
      safetyNotes: [...safetyNotes, '禁止修改全局 OpenClaw 2026.3.23。'],
      nextAction: '先做只读现状检查和 sidecar 旁路方案，不覆盖稳定版。',
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

  if (taskType === 'readonly_audit' && (text.includes('self') || text.includes('健康') || text.includes('health') || text.includes('状态') || text.includes('自检'))) {
    return {
      selectedRoute: 'local_cpu',
      costLevel: 'free',
      riskLevel: 'low',
      needsUserConfirm: false,
      reason: 'AIP 只读自检，使用本地 CPU 路线做只读 health/status 检查。',
      rejectedRoutes: [
        { route: 'cloud_reasoning_model', reason: '自检不需要云模型。' },
        { route: 'local_gpu', reason: '自检不需要 GPU。' },
      ],
      safetyNotes: [
        '本接口只做只读自检，不写数据库、不写文件、不改配置、不重启服务。',
        '不触碰 OpenClaw / ComfyUI / Mahjong / Memory Hub。',
      ],
      nextAction: '调用 GET /api/cost-routing/self-check 获取全量自检结果。',
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

  if (taskType === 'code_analysis' && (budget !== 'low' || normalizeStrategyMode(input.strategy_mode || input.strategyMode, taskType) === 'quality_first')) {
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

const ROUTE_ACTION_TYPES = [
  { id: 'preview_only', label: '仅预览', description: '不执行任何真实动作，仅展示建议。' },
  { id: 'read_only_check', label: '只读检查', description: '执行只读检查，不写数据、不改文件。' },
  { id: 'dry_run_plan', label: 'Dry-Run 计划', description: '模拟执行流程，不产生真实影响。' },
  { id: 'ask_for_confirmation', label: '请求人工确认', description: '需要用户确认后才能继续。' },
  { id: 'manual_release_prep', label: '手工发布准备', description: '只做 release-prep，不自动发布。' },
  { id: 'local_safe_suggestion', label: '本地安全建议', description: '仅给出本地可执行的建议。' },
  { id: 'blocked_action', label: '阻断动作', description: '高风险动作，禁止自动执行。' },
] as const;

export function getPracticalConfig() {
  return {
    ok: true,
    engine_version: 'v7.5.0-self-check-candidate',
    policy_templates: BUILTIN_POLICY_TEMPLATES,
    strategy_modes: Object.values(STRATEGY_MODES),
    task_console_types: TASK_CONSOLE_TYPES,
    firewall_rules: HIGH_RISK_FIREWALL_RULES.map((rule) => ({ id: rule.id, label: rule.label, patterns: rule.patterns })),
    route_matrix: ROUTE_MATRIX,
    case_matrix: CASE_MATRIX,
    decision_pipeline: [
      'normalizeInput',
      'detectTaskCategory',
      'selectPolicyPreset',
      'evaluateRiskFirewall',
      'computeScores',
      'chooseRoute',
      'buildRejectedRoutes',
      'buildEscalationPlan',
      'buildSafetyNotes',
      'buildAuditPreview',
      'returnDecision',
    ],
    execution_modes: ['read_only', 'ask_first', 'dry_run', 'human_confirm_required', 'local_only', 'cloud_allowed', 'blocked'],
    task_types: PRACTICAL_TASK_TYPES,
    route_targets: ROUTE_TYPES,
    cost_levels: ['free', 'low', 'medium', 'high', 'unknown'],
    risk_levels: ['low', 'medium', 'high', 'blocked'],
    local_capabilities: LOCAL_CAPABILITIES,
    model_route_registry: MODEL_ROUTE_REGISTRY,
    toolchain_registry: TOOLCHAIN_REGISTRY,
    release_readiness_gates: RELEASE_READINESS_GATES,
    external_integrations: EXTERNAL_INTEGRATIONS,
    integration_readiness_matrix: INTEGRATION_READINESS_MATRIX,
    route_action_types: ROUTE_ACTION_TYPES,
    integration_rehearsal_matrix: INTEGRATION_REHEARSAL_MATRIX,
    stop_conditions: STOP_CONDITIONS,
  };
}

export function simulatePracticalRoute(body: any) {
  const taskType = String(body.task_type || '').trim();
  if (!taskType) return { ok: false, error: 'task_type is required' };
  const rawInput = parseBodyInput(body.input_json || body);
  const enrichedInput = { ...rawInput, __raw_task_type: taskType };
  const normalizedTaskType = normalizePracticalTaskType(taskType);
  const decision = enrichPracticalDecision(buildPracticalDecision(taskType, enrichedInput), normalizedTaskType, enrichedInput);
  return {
    ok: true,
    engine_version: 'v7.5.0-self-check-candidate',
    task_type: normalizedTaskType,
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
      practical_decision: enrichPracticalDecision(buildPracticalDecision(taskType, { ...rawInput, __raw_task_type: taskType }), normalizePracticalTaskType(taskType), { ...rawInput, __raw_task_type: taskType }),
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

function selfCheckRoute() {
  const nowStr = now();
  const safetyBoundary = {
    databaseWrite: false,
    fileWrite: false,
    configModify: false,
    serviceRestart: false,
    serviceStop: false,
    taskkill: false,
    externalProjectTouch: ['OpenClaw', 'ComfyUI', 'Mahjong', 'Memory Hub'],
    releaseAction: false,
  };
  const forbiddenActions = [
    'restart', 'stop', 'taskkill', 'kill node',
    'write database', 'write config', 'write file',
    'git push', 'git tag', 'GitHub Release',
    'modify OpenClaw', 'modify ComfyUI', 'modify Mahjong', 'modify Memory Hub',
    'train model', 'overwrite best.pt', 'overwrite last.pt',
    'modify .env', 'modify token', 'modify secret',
  ];
  return {
    ok: true,
    mode: 'read_only',
    targetSystem: 'aip_self',
    actionType: 'read_only_check',
    rehearsalOnly: false,
    externalWrite: false,
    databaseWrite: false,
    fileWrite: false,
    serviceRestart: false,
    processKill: false,
    timestamp: nowStr,
    aipStatus: {
      version: 'v7.5.0-self-check-candidate',
      mode: 'preview_only',
      safety: 'readonly self-check only',
    },
    apiHealth: 'healthy (readonly)',
    costRoutingStatus: 'ready',
    safetyBoundary,
    forbiddenActions,
    nextSafeStep: '输出只读报告，不做任何修改。',
    auditPreview: {
      auditSchemaVersion: 'preview-v2',
      mode: 'preview_only',
      wouldExecute: false,
      wouldWriteFiles: false,
      databaseWrite: false,
      fileWrite: false,
      externalWrite: false,
      timestamp: nowStr,
      taskSummary: 'AIP readonly self-check',
      selectedPolicy: 'stable_first',
      detectedCategory: 'readonly_audit',
      actionType: 'read_only_check',
      riskLevel: 'low',
      executionMode: 'read_only',
      confidence: 'high',
      matchedRiskRules: [],
      recommendedRoute: 'local_cpu',
      recommendedModelTier: 'local',
      deniedActions: forbiddenActions,
      readOnlyPrechecks: ['确认只读边界', '确认不执行写入操作'],
      nextSafeStep: '输出只读健康报告',
      rollbackRequired: false,
      auditMode: 'preview_only',
      requiredConfirmations: [],
      rollbackPlan: ['本轮不执行任何真实动作，无需回滚。'],
      auditIdPreview: genId('audit-self-check'),
      persistenceMode: 'preview_only' as const,
      selectedModelRoute: 'local' as ModelTier,
      selectedToolchainRoute: 'aip_readonly_check',
    },
  };
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

  app.get('/api/cost-routing/self-check', async () => selfCheckRoute());

  app.get('/api/cost-routing/route-types', async () => ({
    ok: true,
    engine_version: 'v2',
    route_types: ROUTE_TYPES,
    route_profiles: ROUTE_PROFILES,
  }));
}
