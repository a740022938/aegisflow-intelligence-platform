// Lab registry — static definitions for Lab Center
// Covers all 13 MOVE_TO_LAB items from P1g governance decision.
// NOT used for execution. Readonly metadata only.

export type LabCategory = 'intelligence' | 'automation' | 'experiment' | 'other';
export type LabStatus = 'active' | 'preview' | 'placeholder' | 'needs_spec' | 'blocked' | 'deprecated' | 'archive_candidate' | 'promotion_candidate';
export type LabMaturity = 'lab' | 'preview';
export type LabRiskLevel = 'low' | 'medium' | 'high';
export type SafetyBoundaryTag = 'readonly' | 'dry_run' | 'approval_required' | 'external_write_blocked' | 'dangerous_action_blocked';

const ALLOWED_TAGS: SafetyBoundaryTag[] = ['readonly', 'dry_run', 'approval_required', 'external_write_blocked', 'dangerous_action_blocked'];
const ALLOWED_STATUSES: LabStatus[] = ['active', 'preview', 'placeholder', 'needs_spec', 'blocked', 'deprecated', 'archive_candidate', 'promotion_candidate'];

export interface LabActionPolicy {
  allowedActions: string[];
  forbiddenActions: string[];
}

export interface LabPromotionCriteria {
  prerequisites: string[];
  estimatedMilestone?: string;
}

export interface LabArchiveCriteria {
  triggers: string[];
  gracePeriodDays?: number;
}

export interface LabItemDefinition {
  id: string;
  displayName: string;
  description: string;
  currentGroup: string;
  path: string;
  labelKey: string;
  category: LabCategory;
  status: LabStatus;
  maturity: LabMaturity;
  riskLevel: LabRiskLevel;
  safetyBoundaryTags: SafetyBoundaryTag[];
  reasonForLab: string;
  migrationStage: number;
  actionPolicy: LabActionPolicy;
  promotionCriteria?: LabPromotionCriteria;
  archiveCriteria?: LabArchiveCriteria;
  notes: string;
}

export const LAB_REGISTRY: LabItemDefinition[] = [
  // ── Intelligence (8 items) ──
  {
    id: 'digital-employee',
    displayName: '数字员工',
    description: 'AI 机器学习工程师，可接收任务、自动拆解、执行工作流、主动汇报。目前为 ModulePage 占位页。',
    currentGroup: '智能增强',
    path: '/digital-employee',
    labelKey: 'nav.digitalEmployee',
    category: 'intelligence',
    status: 'placeholder',
    maturity: 'lab',
    riskLevel: 'medium',
    safetyBoundaryTags: ['readonly', 'approval_required', 'external_write_blocked'],
    reasonForLab: 'ModulePage 占位页，无独立页面或真实 AI employee 集成',
    migrationStage: 0,
    actionPolicy: {
      allowedActions: ['view-status-preview'],
      forbiddenActions: ['execute-task', 'modify-workflow', 'write-config', 'start-agent'],
    },
    promotionCriteria: { prerequisites: ['独立页面实现', 'PageShell 接入', 'i18n 完成', '真实 AI agent API'], estimatedMilestone: 'v7.15.0' },
    archiveCriteria: { triggers: ['3 个 release 无使用', '被具体工具页面替代'] },
    notes: '无真实实现前不进入主线菜单',
  },
  {
    id: 'training-v2',
    displayName: '训练中心 v2',
    description: '13 种架构支持，预设 8 种训练配方，HPO/distill/merge 支持。目前为 ModulePage 占位页。',
    currentGroup: '智能增强',
    path: '/training-v2',
    labelKey: 'nav.trainingV2',
    category: 'intelligence',
    status: 'placeholder',
    maturity: 'lab',
    riskLevel: 'medium',
    safetyBoundaryTags: ['readonly', 'dry_run', 'approval_required', 'dangerous_action_blocked'],
    reasonForLab: 'ModulePage 占位页；training v2 尚未与 v1 区分',
    migrationStage: 0,
    actionPolicy: {
      allowedActions: ['view-status', 'view-metrics'],
      forbiddenActions: ['execute-training', 'write-models', 'modify-datasets', 'start-job'],
    },
    promotionCriteria: { prerequisites: ['独立页面实现', '与 /training 明确区分', 'PageShell 接入', 'i18n 完成', 'API 硬化'], estimatedMilestone: 'v7.15.0' },
    archiveCriteria: { triggers: ['与 /training 合并', 'v2 概念废弃'] },
    notes: 'v7.14 晋级候选，优先级最高',
  },
  {
    id: 'hpo',
    displayName: '超参搜索',
    description: '随机搜索 + 自适应搜索空间。目前为 ModulePage 占位页。',
    currentGroup: '智能增强',
    path: '/hpo',
    labelKey: 'nav.hpo',
    category: 'intelligence',
    status: 'placeholder',
    maturity: 'lab',
    riskLevel: 'low',
    safetyBoundaryTags: ['readonly', 'approval_required'],
    reasonForLab: 'ModulePage 占位页；HPO 是训练子功能',
    migrationStage: 0,
    actionPolicy: {
      allowedActions: ['view-status'],
      forbiddenActions: ['execute-hpo', 'modify-search-space', 'start-job'],
    },
    promotionCriteria: { prerequisites: ['作为 /training 子标签集成'] },
    archiveCriteria: { triggers: ['被 training v2 替代'] },
    notes: '可能合并到 training v2，不独立存在',
  },
  {
    id: 'distill',
    displayName: '知识蒸馏',
    description: 'Teacher→Student 任意架构组合蒸馏。目前为 ModulePage 占位页。',
    currentGroup: '智能增强',
    path: '/distill',
    labelKey: 'nav.distill',
    category: 'intelligence',
    status: 'placeholder',
    maturity: 'lab',
    riskLevel: 'low',
    safetyBoundaryTags: ['readonly', 'approval_required'],
    reasonForLab: 'ModulePage 占位页；蒸馏是训练子功能',
    migrationStage: 0,
    actionPolicy: {
      allowedActions: ['view-status'],
      forbiddenActions: ['execute-distill', 'modify-teacher-model', 'start-job'],
    },
    promotionCriteria: { prerequisites: ['集成到 training pipeline'] },
    archiveCriteria: { triggers: ['合并到 training v2'] },
    notes: '可能合并，非独立功能',
  },
  {
    id: 'model-merge',
    displayName: '模型合并',
    description: '5 种合并方法: avg/task_vectors/model_soup/ties/dare。目前为 ModulePage 占位页。',
    currentGroup: '智能增强',
    path: '/model-merge',
    labelKey: 'nav.modelMerge',
    category: 'intelligence',
    status: 'placeholder',
    maturity: 'lab',
    riskLevel: 'medium',
    safetyBoundaryTags: ['readonly', 'approval_required', 'dangerous_action_blocked'],
    reasonForLab: 'ModulePage 占位页；合并是模型生命周期功能',
    migrationStage: 0,
    actionPolicy: {
      allowedActions: ['view-status', 'view-methods'],
      forbiddenActions: ['execute-merge', 'overwrite-model', 'write-files', 'start-job'],
    },
    promotionCriteria: { prerequisites: ['独立页面实现', '真实合并 API', '安全评审'], estimatedMilestone: 'v7.15.0' },
    archiveCriteria: { triggers: ['合并到模型管理 section'] },
    notes: '可能成为 /models 或 /training-v2 下的标签',
  },
  {
    id: 'inference',
    displayName: '模型推理',
    description: '用已训练模型跑推理。目前为 ModulePage 占位页。',
    currentGroup: '智能增强',
    path: '/inference',
    labelKey: 'nav.inference',
    category: 'intelligence',
    status: 'placeholder',
    maturity: 'lab',
    riskLevel: 'medium',
    safetyBoundaryTags: ['readonly', 'dry_run', 'approval_required', 'dangerous_action_blocked'],
    reasonForLab: 'ModulePage 占位页；推理是模型服务功能',
    migrationStage: 0,
    actionPolicy: {
      allowedActions: ['view-models', 'view-endpoints'],
      forbiddenActions: ['run-inference', 'deploy-model', 'modify-endpoints', 'start-job'],
    },
    promotionCriteria: { prerequisites: ['真实推理 API', '与 /models 集成', 'PageShell 接入', 'i18n 完成'], estimatedMilestone: 'v7.15.0' },
    archiveCriteria: { triggers: ['由 /deployments 完全处理'] },
    notes: 'v7.14 晋级候选',
  },
  {
    id: 'annotation',
    displayName: '数据标注',
    description: '图片标注 + SAM 半自动辅助。目前为 ModulePage 占位页。',
    currentGroup: '智能增强',
    path: '/annotation',
    labelKey: 'nav.annotation',
    category: 'intelligence',
    status: 'placeholder',
    maturity: 'lab',
    riskLevel: 'low',
    safetyBoundaryTags: ['readonly', 'approval_required', 'external_write_blocked'],
    reasonForLab: 'ModulePage 占位页；标注是数据预处理功能',
    migrationStage: 0,
    actionPolicy: {
      allowedActions: ['view-projects', 'mock-label-preview'],
      forbiddenActions: ['save-labels', 'modify-datasets', 'export', 'start-annotation'],
    },
    promotionCriteria: { prerequisites: ['真实标注 pipeline', '与数据集管理集成'] },
    archiveCriteria: { triggers: ['由独立标注工具替代'] },
    notes: '可能成为 /datasets 下的标签',
  },
  {
    id: 'huggingface',
    displayName: 'HuggingFace',
    description: '从 HuggingFace Hub 搜索、拉取预训练模型。目前为 ModulePage 占位页。',
    currentGroup: '智能增强',
    path: '/huggingface',
    labelKey: 'nav.huggingface',
    category: 'intelligence',
    status: 'placeholder',
    maturity: 'lab',
    riskLevel: 'low',
    safetyBoundaryTags: ['readonly', 'dry_run', 'approval_required', 'external_write_blocked'],
    reasonForLab: 'ModulePage 占位页；也是 Connector 候选',
    migrationStage: 0,
    actionPolicy: {
      allowedActions: ['search', 'list-pulled', 'check-status'],
      forbiddenActions: ['download-model', 'upload', 'modify-cache', 'write-files', 'start-download'],
    },
    promotionCriteria: { prerequisites: ['双路线：Connector Center 集成 + Lab 实验', '真实 HF API 集成'] },
    archiveCriteria: { triggers: ['由其他模型来源方式替代'] },
    notes: '可能进入 Connector Center 而非从 Lab 晋级',
  },
  // ── Automation (5 items) ──
  {
    id: 'backflow-v2',
    displayName: '智能回流',
    description: '漂移检测→错误分析→重训建议→自动触发。目前为 ModulePage 占位页。',
    currentGroup: '自动化',
    path: '/backflow-v2',
    labelKey: 'nav.backflowV2',
    category: 'automation',
    status: 'placeholder',
    maturity: 'lab',
    riskLevel: 'medium',
    safetyBoundaryTags: ['readonly', 'approval_required', 'dangerous_action_blocked'],
    reasonForLab: 'ModulePage 占位页；回流是漂移检测概念',
    migrationStage: 0,
    actionPolicy: {
      allowedActions: ['view-status', 'mock-detection-preview'],
      forbiddenActions: ['execute-detection', 'modify-baseline', 'trigger-retrain', 'start-job'],
    },
    promotionCriteria: { prerequisites: ['真实漂移检测 API', '与 /evaluations 或 /monitor 集成'] },
    archiveCriteria: { triggers: ['由 model-monitor 替代'] },
    notes: '可能与 model-monitor 合并',
  },
  {
    id: 'scheduler',
    displayName: '任务调度器',
    description: 'Cron/Interval/事件驱动调度。目前为 ModulePage 占位页。',
    currentGroup: '自动化',
    path: '/scheduler',
    labelKey: 'nav.scheduler',
    category: 'automation',
    status: 'placeholder',
    maturity: 'lab',
    riskLevel: 'medium',
    safetyBoundaryTags: ['readonly', 'approval_required', 'dangerous_action_blocked'],
    reasonForLab: 'ModulePage 占位页；调度是系统级功能',
    migrationStage: 0,
    actionPolicy: {
      allowedActions: ['view-jobs', 'mock-schedule-preview'],
      forbiddenActions: ['create-schedule', 'modify-cron', 'execute-trigger', 'start-job'],
    },
    promotionCriteria: { prerequisites: ['真实调度 API', '与 workflow 引擎集成'] },
    archiveCriteria: { triggers: ['由 OS 级工具处理'] },
    notes: '可能成为系统管理功能',
  },
  {
    id: 'alerting',
    displayName: '告警中心',
    description: '飞书/钉钉/Webhook 渠道 + 自动健康巡检。目前为 ModulePage 占位页。',
    currentGroup: '自动化',
    path: '/alerting',
    labelKey: 'nav.alerting',
    category: 'automation',
    status: 'placeholder',
    maturity: 'lab',
    riskLevel: 'medium',
    safetyBoundaryTags: ['readonly', 'approval_required', 'external_write_blocked'],
    reasonForLab: 'ModulePage 占位页；告警需要真实通知渠道',
    migrationStage: 0,
    actionPolicy: {
      allowedActions: ['view-channels', 'view-history'],
      forbiddenActions: ['send-alert', 'modify-channel', 'write-webhook-config', 'start-job'],
    },
    promotionCriteria: { prerequisites: ['真实通知 API（飞书/钉钉/Webhook）', '与监控集成'] },
    archiveCriteria: { triggers: ['由外部监控工具替代'] },
    notes: '需要 Webhook 配置后端',
  },
  {
    id: 'model-monitor',
    displayName: '模型监控',
    description: '生产模型质量监控，漂移检测+阈值告警+自动重训。目前为 ModulePage 占位页。',
    currentGroup: '自动化',
    path: '/model-monitor',
    labelKey: 'nav.modelMonitor',
    category: 'automation',
    status: 'placeholder',
    maturity: 'lab',
    riskLevel: 'medium',
    safetyBoundaryTags: ['readonly', 'approval_required', 'dangerous_action_blocked'],
    reasonForLab: 'ModulePage 占位页；监控需要生产基线数据',
    migrationStage: 0,
    actionPolicy: {
      allowedActions: ['view-deployments', 'view-metrics'],
      forbiddenActions: ['start-monitoring', 'modify-thresholds', 'trigger-retrain', 'start-job'],
    },
    promotionCriteria: { prerequisites: ['真实监控 API', '基线数据采集', '与 /evaluations 集成'] },
    archiveCriteria: { triggers: ['由外部 ML 监控工具替代'] },
    notes: '',
  },
  {
    id: 'deploy-v2',
    displayName: '发布管道',
    description: 'Canary 金丝雀发布 + 版本回滚 + A/B 测试。目前为 ModulePage 占位页。',
    currentGroup: '自动化',
    path: '/deploy-v2',
    labelKey: 'nav.deployV2',
    category: 'automation',
    status: 'placeholder',
    maturity: 'lab',
    riskLevel: 'high',
    safetyBoundaryTags: ['readonly', 'dry_run', 'approval_required', 'dangerous_action_blocked'],
    reasonForLab: 'ModulePage 占位页；发布操作高风险',
    migrationStage: 0,
    actionPolicy: {
      allowedActions: ['view-endpoints', 'view-releases'],
      forbiddenActions: ['execute-deploy', 'rollback', 'modify-endpoint', 'canary-release', 'start-job'],
    },
    promotionCriteria: { prerequisites: ['全面安全评审', '人工门禁', '与 /deployments 集成'], estimatedMilestone: 'v7.15.0' },
    archiveCriteria: { triggers: ['由 /deployments v1 扩展替代'] },
    notes: 'Lab 中最高风险项，晋级需格外谨慎',
  },
];

export function getLabStats() {
  const total = LAB_REGISTRY.length;
  const byCategory: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const byRisk: Record<string, number> = {};
  let placeholderCount = 0;
  let needsSpecCount = 0;
  let promotionCount = 0;
  let archiveCount = 0;

  for (const item of LAB_REGISTRY) {
    byCategory[item.category] = (byCategory[item.category] || 0) + 1;
    byStatus[item.status] = (byStatus[item.status] || 0) + 1;
    byRisk[item.riskLevel] = (byRisk[item.riskLevel] || 0) + 1;
    if (item.status === 'placeholder') placeholderCount++;
    if (item.status === 'needs_spec') needsSpecCount++;
    if (item.status === 'promotion_candidate') promotionCount++;
    if (item.status === 'archive_candidate') archiveCount++;
  }

  return { total, byCategory, byStatus, byRisk, placeholderCount, needsSpecCount, promotionCount, archiveCount, highRiskCount: byRisk['high'] || 0 };
}
