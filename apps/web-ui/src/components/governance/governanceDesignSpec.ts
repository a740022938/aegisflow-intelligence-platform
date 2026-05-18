export interface GovernanceDataModelSpec {
  modelName: string;
  purpose: string;
  status: string;
  writePath: string;
  runtimeEffect: string;
  stageGate: string;
  requiredEvidence: string[];
  blockedActions: string[];
}

export interface StageCDesignModule {
  moduleName: string;
  purpose: string;
  currentStatus: string;
  runtimeControl: string;
  writePermission: string;
  requiredFutureGate: string;
  blockedUntil: string;
}

export interface LifecycleStage {
  stage: string;
  purpose: string;
  currentCapability: string;
  futureRequirement: string;
  blockedActions: string[];
  riskNote: string;
}

export interface ReadinessChecklistItem {
  item: string;
  status: string;
  notes: string;
}

export interface RiskAcceptanceRow {
  risk: string;
  currentExposure: string;
  activeRisk: number;
  guardrail: string;
  status: string;
}

export const GOVERNANCE_DATA_MODELS: GovernanceDataModelSpec[] = [
  { modelName: 'GovernanceDecision', purpose: '记录治理审批决定（approve/reject/defer）', status: 'design-only', writePath: 'disabled', runtimeEffect: 'none', stageGate: 'Stage C deferred', requiredEvidence: ['审批记录', '决策依据', '干系人签名'], blockedActions: ['write_database', 'approve_candidate', 'reject_candidate'] },
  { modelName: 'GovernanceGate', purpose: '定义治理门禁条件与通过策略', status: 'design-only', writePath: 'disabled', runtimeEffect: 'none', stageGate: 'Stage C deferred', requiredEvidence: ['门禁条件定义', '通过策略文档', '失败回退计划'], blockedActions: ['write_database', 'modify_layout', 'enable_stage_c'] },
  { modelName: 'GovernanceRequest', purpose: '提交需要治理审批的操作请求', status: 'design-only', writePath: 'disabled', runtimeEffect: 'none', stageGate: 'Stage C deferred', requiredEvidence: ['操作描述', '影响范围', '风险等级'], blockedActions: ['write_database', 'execute_action', 'approve_candidate'] },
  { modelName: 'GovernanceEvidence', purpose: '附加到治理请求的审计证据', status: 'design-only', writePath: 'disabled', runtimeEffect: 'none', stageGate: 'Stage C deferred', requiredEvidence: ['证据类型', '证据内容', '时间戳'], blockedActions: ['write_database', 'modify_layout'] },
  { modelName: 'GovernanceAuditRecord', purpose: '记录治理操作的完整审计跟踪', status: 'design-only', writePath: 'disabled', runtimeEffect: 'none', stageGate: 'Stage C deferred', requiredEvidence: ['操作者', '操作类型', '变更前内容', '变更后内容'], blockedActions: ['write_database', 'delete_audit_log'] },
  { modelName: 'GovernanceRollbackPlan', purpose: '定义治理操作的回滚策略', status: 'design-only', writePath: 'disabled', runtimeEffect: 'none', stageGate: 'Stage C deferred', requiredEvidence: ['回滚步骤', '影响评估', '验证方法'], blockedActions: ['write_database', 'execute_rollback'] },
  { modelName: 'GovernanceRiskAcceptance', purpose: '记录已批准的风险接受决策', status: 'design-only', writePath: 'disabled', runtimeEffect: 'none', stageGate: 'Stage C deferred', requiredEvidence: ['风险评估', '接受理由', '有效期'], blockedActions: ['write_database', 'modify_risk_level'] },
];

export const STAGE_C_DESIGN_MODULES: StageCDesignModule[] = [
  { moduleName: 'Approval Gate', purpose: '审批门禁 — 人工审批治理操作', currentStatus: 'deferred / design-only', runtimeControl: 'disabled', writePermission: 'none', requiredFutureGate: 'Human Approval Gate', blockedUntil: 'Stage C design package approved' },
  { moduleName: 'Mutation Gate', purpose: '变更门禁 — 控制数据变更操作', currentStatus: 'deferred / design-only', runtimeControl: 'disabled', writePermission: 'none', requiredFutureGate: 'Mutation Policy Gate', blockedUntil: 'Diff + rollback plan available' },
  { moduleName: 'Execution Gate', purpose: '执行门禁 — 控制操作执行', currentStatus: 'deferred / design-only', runtimeControl: 'disabled', writePermission: 'none', requiredFutureGate: 'Dry-run + Approval Gate', blockedUntil: 'Dry-run verified' },
  { moduleName: 'External Write Gate', purpose: '外部写入门禁 — 控制对外部系统的写入', currentStatus: 'deferred / design-only', runtimeControl: 'disabled', writePermission: 'none', requiredFutureGate: 'External Write Policy Gate', blockedUntil: 'Endpoint + audit trail configured' },
  { moduleName: 'Deployment Gate', purpose: '部署门禁 — 控制发布操作', currentStatus: 'deferred / design-only', runtimeControl: 'disabled', writePermission: 'none', requiredFutureGate: 'Release Plan Gate', blockedUntil: 'Release plan + rollback available' },
  { moduleName: 'Rollback Gate', purpose: '回滚门禁 — 控制回滚操作', currentStatus: 'deferred / design-only', runtimeControl: 'disabled', writePermission: 'none', requiredFutureGate: 'Rollback Policy Gate', blockedUntil: 'Restore plan verified' },
  { moduleName: 'Audit Evidence Gate', purpose: '审计门禁 — 确保操作附有审计证据', currentStatus: 'deferred / design-only', runtimeControl: 'disabled', writePermission: 'none', requiredFutureGate: 'Evidence Policy Gate', blockedUntil: 'Evidence model implemented' },
  { moduleName: 'Emergency Stop Gate', purpose: '紧急停止门禁 — 控制紧急停止操作', currentStatus: 'deferred / design-only', runtimeControl: 'disabled', writePermission: 'none', requiredFutureGate: 'Emergency Policy Gate', blockedUntil: 'Emergency response plan approved' },
];

export const LIFECYCLE_STAGES: LifecycleStage[] = [
  { stage: 'Draft', purpose: '设计草案 — 初始构思', currentCapability: 'readonly / design-only', futureRequirement: '可编辑 draft', blockedActions: ['write_database', 'execute_action'], riskNote: '无运行时影响' },
  { stage: 'Review', purpose: '评审阶段 — 设计审查', currentCapability: 'readonly / design-only', futureRequirement: '人工 review 流程', blockedActions: ['write_database', 'approve_action'], riskNote: '需独立评审人' },
  { stage: 'Evidence Attached', purpose: '证据附加 — 附上审计证据', currentCapability: 'readonly / design-only', futureRequirement: '证据上传与验证', blockedActions: ['write_database', 'modify_evidence'], riskNote: '证据完整性待定义' },
  { stage: 'Dry-run Verified', purpose: 'Dry-run 验证 — 模拟执行', currentCapability: 'readonly / design-only', futureRequirement: 'dry-run 执行引擎', blockedActions: ['write_database', 'execute_live'], riskNote: '需 Dry-run 沙箱环境' },
  { stage: 'Approval Pending', purpose: '等待审批 — 人工审批', currentCapability: 'readonly / design-only', futureRequirement: '审批通知 + 超时机制', blockedActions: ['write_database', 'auto_approve'], riskNote: '超时需回退' },
  { stage: 'Execution Deferred', purpose: '执行延后 — 等待条件满足', currentCapability: 'readonly / design-only', futureRequirement: '条件检查 + 自动触发', blockedActions: ['write_database', 'force_execute'], riskNote: '条件变更风险' },
  { stage: 'Audit Recorded', purpose: '审计记录 — 操作已记录', currentCapability: 'readonly / design-only', futureRequirement: '审计追踪查询', blockedActions: ['write_database', 'delete_audit'], riskNote: '审计日志不可篡改' },
  { stage: 'Closed', purpose: '已关闭 — 操作完成', currentCapability: 'readonly / design-only', futureRequirement: '归档策略', blockedActions: ['write_database', 'reopen'], riskNote: '关闭后不可重新打开' },
];

export const READINESS_CHECKLIST: ReadinessChecklistItem[] = [
  { item: 'Dedicated Stage C design package', status: 'not started', notes: '需独立 Stage C 设计包' },
  { item: 'Governance data model reviewed', status: 'design-only', notes: '7 个数据模型已定义（只读规格）' },
  { item: 'Audit evidence model reviewed', status: 'design-only', notes: 'GovernanceEvidence 模型已定义' },
  { item: 'Rollback plan required', status: 'deferred', notes: 'GovernanceRollbackPlan 已定义' },
  { item: 'Dry-run mode required', status: 'deferred', notes: 'Execution Gate 需要 dry-run' },
  { item: 'Manual approval policy required', status: 'deferred', notes: 'Approval Gate 需要人工审批策略' },
  { item: 'External write policy required', status: 'deferred', notes: 'External Write Gate 需要外部写入策略' },
  { item: 'Emergency stop policy required', status: 'deferred', notes: 'Emergency Stop Gate 需要紧急停止策略' },
  { item: 'Final safety audit required', status: 'not started', notes: 'Stage C 启用前需最终安全审计' },
];

export const RISK_ACCEPTANCE_MATRIX: RiskAcceptanceRow[] = [
  { risk: 'High-risk primary nav', currentExposure: 'accepted guarded', activeRisk: 0, guardrail: 'no allowedNow', status: 'accepted' },
  { risk: 'Stage C controls', currentExposure: 'none', activeRisk: 0, guardrail: 'deferred', status: 'safe' },
  { risk: 'Approval actions', currentExposure: 'none', activeRisk: 0, guardrail: 'no buttons', status: 'safe' },
  { risk: 'External writes', currentExposure: 'none', activeRisk: 0, guardrail: 'disabled', status: 'safe' },
  { risk: 'DB mutations', currentExposure: 'none', activeRisk: 0, guardrail: 'no write path', status: 'safe' },
  { risk: 'Service controls', currentExposure: 'none', activeRisk: 0, guardrail: 'no taskkill/restart', status: 'safe' },
  { risk: 'Release actions', currentExposure: 'none', activeRisk: 0, guardrail: 'no tag/release', status: 'safe' },
  { risk: 'Lab execution', currentExposure: 'none', activeRisk: 0, guardrail: 'disabled', status: 'safe' },
  { risk: 'Training triggers', currentExposure: 'none', activeRisk: 0, guardrail: 'disabled', status: 'safe' },
  { risk: 'Inference triggers', currentExposure: 'none', activeRisk: 0, guardrail: 'disabled', status: 'safe' },
];

export const GATE_MATRIX_ROWS = [
  { gate: 'Approval Gate', currentMode: 'design-only', approval: 'deferred', write: 'no', execute: 'no', externalIO: 'no', evidence: 'policy + audit evidence', stageStatus: 'deferred' },
  { gate: 'Mutation Gate', currentMode: 'design-only', approval: 'deferred', write: 'no', execute: 'no', externalIO: 'no', evidence: 'diff + rollback', stageStatus: 'deferred' },
  { gate: 'Execution Gate', currentMode: 'design-only', approval: 'deferred', write: 'no', execute: 'no', externalIO: 'no', evidence: 'dry-run + approval', stageStatus: 'deferred' },
  { gate: 'External Write Gate', currentMode: 'design-only', approval: 'deferred', write: 'no', execute: 'no', externalIO: 'gated', evidence: 'endpoint + audit', stageStatus: 'deferred' },
  { gate: 'Deployment Gate', currentMode: 'design-only', approval: 'deferred', write: 'no', execute: 'no', externalIO: 'gated', evidence: 'release plan', stageStatus: 'deferred' },
  { gate: 'Rollback Gate', currentMode: 'design-only', approval: 'deferred', write: 'no', execute: 'no', externalIO: 'no', evidence: 'restore plan', stageStatus: 'deferred' },
];
