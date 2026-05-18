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
  { item: 'Dedicated Stage C design package', status: 'not-implemented', notes: '需独立 Stage C 设计包' },
  { item: 'Governance data model reviewed', status: 'ready-design-only', notes: '7 个数据模型已定义（只读规格）' },
  { item: 'Audit evidence model reviewed', status: 'ready-design-only', notes: 'GovernanceEvidence 模型已定义' },
  { item: 'Rollback plan required', status: 'deferred', notes: 'GovernanceRollbackPlan 已定义' },
  { item: 'Dry-run mode required', status: 'deferred', notes: 'Execution Gate 需要 dry-run' },
  { item: 'Manual approval policy required', status: 'deferred', notes: 'Approval Gate 需要人工审批策略' },
  { item: 'External write policy required', status: 'deferred', notes: 'External Write Gate 需要外部写入策略' },
  { item: 'Emergency stop policy required', status: 'deferred', notes: 'Emergency Stop Gate 需要紧急停止策略' },
  { item: 'Final safety audit required', status: 'not-implemented', notes: 'Stage C 启用前需最终安全审计' },
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

// ── Approval Gate Design Spec ──

export interface ApprovalField {
  fieldName: string;
  purpose: string;
  status: string;
  runtimeEffect: string;
  writePath: string;
  stageGate: string;
  futureRequirement: string;
}

export const APPROVAL_DESIGN_FIELDS: ApprovalField[] = [
  { fieldName: 'ApprovalRequest', purpose: '审批请求 — 记录待审批操作详情', status: 'design-only', runtimeEffect: 'none', writePath: 'disabled', stageGate: 'Stage C deferred', futureRequirement: '人工提交审批请求' },
  { fieldName: 'ApprovalEvidence', purpose: '审批证据 — 附上审计证据供审批参考', status: 'design-only', runtimeEffect: 'none', writePath: 'disabled', stageGate: 'Stage C deferred', futureRequirement: '证据上传+摘要生成' },
  { fieldName: 'ApprovalPolicy', purpose: '审批策略 — 定义审批条件与通过规则', status: 'design-only', runtimeEffect: 'none', writePath: 'disabled', stageGate: 'Stage C deferred', futureRequirement: '策略引擎+条件匹配' },
  { fieldName: 'ApprovalRiskReview', purpose: '风险审查 — 评估操作风险等级', status: 'design-only', runtimeEffect: 'none', writePath: 'disabled', stageGate: 'Stage C deferred', futureRequirement: '风险评分+建议措施' },
  { fieldName: 'ApprovalRollbackPlan', purpose: '回滚计划 — 定义审批失败后的回退策略', status: 'design-only', runtimeEffect: 'none', writePath: 'disabled', stageGate: 'Stage C deferred', futureRequirement: '回滚步骤+验证方法' },
  { fieldName: 'ApprovalAuditRecord', purpose: '审计记录 — 完整记录审批全链路', status: 'design-only', runtimeEffect: 'none', writePath: 'disabled', stageGate: 'Stage C deferred', futureRequirement: '审计追踪+不可篡改' },
  { fieldName: 'ApprovalExpiration', purpose: '审批过期 — 审批超时自动失效', status: 'design-only', runtimeEffect: 'none', writePath: 'disabled', stageGate: 'Stage C deferred', futureRequirement: '超时策略+通知机制' },
  { fieldName: 'ApprovalScopeBoundary', purpose: '审批边界 — 定义审批范围与权限', status: 'design-only', runtimeEffect: 'none', writePath: 'disabled', stageGate: 'Stage C deferred', futureRequirement: '权限模型+范围校验' },
];

// ── Approval Evidence Types ──

export interface ApprovalEvidenceType {
  evidence: string;
  purpose: string;
  status: string;
}

export const APPROVAL_EVIDENCE_TYPES: ApprovalEvidenceType[] = [
  { evidence: 'Diff evidence', purpose: '变更差异对比', status: 'design-only' },
  { evidence: 'Dry-run result', purpose: '模拟执行结果', status: 'design-only' },
  { evidence: 'Risk assessment', purpose: '风险评估报告', status: 'design-only' },
  { evidence: 'Rollback plan', purpose: '回滚策略说明', status: 'design-only' },
  { evidence: 'Owner note', purpose: '操作负责人说明', status: 'design-only' },
  { evidence: 'Validator snapshot', purpose: '当前 validator 快照', status: 'design-only' },
  { evidence: 'Secret scan result', purpose: '密钥扫描结果', status: 'design-only' },
  { evidence: 'DB doctor result', purpose: '数据库健康检查结果', status: 'design-only' },
  { evidence: 'Smoke test status', purpose: '冒烟测试状态', status: 'design-only' },
  { evidence: 'Manual approval note', purpose: '人工审批备注', status: 'design-only' },
];

// ── Approval Rollback Plan Spec ──

export interface RollbackField {
  field: string;
  purpose: string;
  status: string;
}

export const APPROVAL_ROLLBACK_FIELDS: RollbackField[] = [
  { field: 'Rollback target', purpose: '回滚目标 — 定义回滚到哪个基线', status: 'design-only' },
  { field: 'Restore point', purpose: '恢复点 — 定义可恢复的快照标识', status: 'design-only' },
  { field: 'Affected scope', purpose: '影响范围 — 回滚操作影响哪些系统', status: 'design-only' },
  { field: 'Manual rollback owner', purpose: '手动回滚负责人 — 指定执行回滚的人', status: 'design-only' },
  { field: 'Verification command', purpose: '验证命令 — 回滚后验证成功的命令', status: 'design-only' },
  { field: 'Audit evidence', purpose: '审计证据 — 回滚操作证据记录', status: 'design-only' },
  { field: 'Blocked automation', purpose: '禁止自动化 — 明确不允许自动回滚的操作', status: 'design-only' },
];

// ── Approval Audit Trail Spec ──

export interface AuditTrailField {
  field: string;
  purpose: string;
  status: string;
  persisted: string;
}

export const APPROVAL_AUDIT_TRAIL_FIELDS: AuditTrailField[] = [
  { field: 'Request ID', purpose: '审批请求唯一标识', status: 'design-only', persisted: 'not persisted' },
  { field: 'Requested action', purpose: '请求的具体操作描述', status: 'design-only', persisted: 'not persisted' },
  { field: 'Requester', purpose: '发起审批的用户', status: 'design-only', persisted: 'not persisted' },
  { field: 'Review state', purpose: '当前审批状态', status: 'design-only', persisted: 'not persisted' },
  { field: 'Evidence summary', purpose: '已附证据摘要', status: 'design-only', persisted: 'not persisted' },
  { field: 'Risk level', purpose: '操作风险等级', status: 'design-only', persisted: 'not persisted' },
  { field: 'Decision state', purpose: '审批决策（approve/reject/defer）', status: 'design-only', persisted: 'not persisted' },
  { field: 'Timestamp', purpose: '操作时间戳', status: 'design-only', persisted: 'not persisted' },
  { field: 'Rollback link', purpose: '关联回滚计划链接', status: 'design-only', persisted: 'not persisted' },
  { field: 'Final audit note', purpose: '最终审计备注', status: 'design-only', persisted: 'not persisted' },
];

// ── Approval Gate Matrix ──

export interface ApprovalGateMatrixRow {
  area: string;
  currentMode: string;
  approval: string;
  reject: string;
  write: string;
  execute: string;
  evidence: string;
  status: string;
}

export const APPROVAL_GATE_MATRIX: ApprovalGateMatrixRow[] = [
  { area: 'Navigation exposure', currentMode: 'readonly', approval: 'no', reject: 'no', write: 'no', execute: 'no', evidence: 'validator snapshot', status: 'design-only' },
  { area: 'Memory candidate', currentMode: 'preview', approval: 'deferred', reject: 'deferred', write: 'no', execute: 'no', evidence: 'candidate diff', status: 'deferred' },
  { area: 'Connector write', currentMode: 'preview', approval: 'deferred', reject: 'deferred', write: 'no', execute: 'no', evidence: 'endpoint + risk', status: 'deferred' },
  { area: 'Lab execution', currentMode: 'preview', approval: 'deferred', reject: 'deferred', write: 'no', execute: 'no', evidence: 'dry-run + report', status: 'deferred' },
  { area: 'Deployment', currentMode: 'disabled', approval: 'deferred', reject: 'deferred', write: 'no', execute: 'no', evidence: 'release plan', status: 'disabled' },
  { area: 'Service control', currentMode: 'disabled', approval: 'deferred', reject: 'deferred', write: 'no', execute: 'no', evidence: 'recovery plan', status: 'disabled' },
];

// ── Mutation Gate Design Spec ──

export interface MutationField {
  fieldName: string;
  purpose: string;
  status: string;
  runtimeEffect: string;
  writePath: string;
  stageGate: string;
  futureRequirement: string;
}

export const MUTATION_DESIGN_FIELDS: MutationField[] = [
  { fieldName: 'MutationRequest', purpose: '变更请求 — 记录待变更操作详情', status: 'design-only', runtimeEffect: 'none', writePath: 'disabled', stageGate: 'Stage C deferred', futureRequirement: '人工提交变更请求' },
  { fieldName: 'MutationScope', purpose: '变更范围 — 定义变更影响哪些系统/模块', status: 'design-only', runtimeEffect: 'none', writePath: 'disabled', stageGate: 'Stage C deferred', futureRequirement: '范围选择+影响预估' },
  { fieldName: 'MutationDiff', purpose: '变更差异 — 记录变更前后差异', status: 'design-only', runtimeEffect: 'none', writePath: 'disabled', stageGate: 'Stage C deferred', futureRequirement: '差异对比+可视化' },
  { fieldName: 'MutationImpact', purpose: '变更影响 — 评估变更的潜在影响', status: 'design-only', runtimeEffect: 'none', writePath: 'disabled', stageGate: 'Stage C deferred', futureRequirement: '影响评分+风险标识' },
  { fieldName: 'MutationRollbackPlan', purpose: '回滚计划 — 变更失败后的回退策略', status: 'design-only', runtimeEffect: 'none', writePath: 'disabled', stageGate: 'Stage C deferred', futureRequirement: '回滚步骤+成功验证' },
  { fieldName: 'MutationEvidence', purpose: '变更证据 — 附上审计证据', status: 'design-only', runtimeEffect: 'none', writePath: 'disabled', stageGate: 'Stage C deferred', futureRequirement: '证据上传+摘要' },
  { fieldName: 'MutationApprovalLink', purpose: '审批链接 — 关联 Approval Gate 记录', status: 'design-only', runtimeEffect: 'none', writePath: 'disabled', stageGate: 'Stage C deferred', futureRequirement: '跨门禁关联' },
  { fieldName: 'MutationAuditRecord', purpose: '审计记录 — 完整记录变更全链路', status: 'design-only', runtimeEffect: 'none', writePath: 'disabled', stageGate: 'Stage C deferred', futureRequirement: '不可篡改审计追踪' },
  { fieldName: 'MutationExpiry', purpose: '变更过期 — 变更请求超时失效', status: 'design-only', runtimeEffect: 'none', writePath: 'disabled', stageGate: 'Stage C deferred', futureRequirement: '超时策略+通知' },
  { fieldName: 'MutationOwner', purpose: '变更负责人 — 指定执行变更的人员', status: 'design-only', runtimeEffect: 'none', writePath: 'disabled', stageGate: 'Stage C deferred', futureRequirement: '负责人分配+通知' },
];

// ── Mutation Request Model ──

export interface MutationRequestField {
  field: string;
  purpose: string;
  status: string;
  persisted: string;
}

export const MUTATION_REQUEST_FIELDS: MutationRequestField[] = [
  { field: 'Request ID', purpose: '变更请求唯一标识', status: 'design-only', persisted: 'not persisted' },
  { field: 'Requested mutation', purpose: '请求的具体变更操作描述', status: 'design-only', persisted: 'not persisted' },
  { field: 'Target domain', purpose: '变更目标域', status: 'design-only', persisted: 'not persisted' },
  { field: 'Target resource', purpose: '变更目标资源', status: 'design-only', persisted: 'not persisted' },
  { field: 'Requester note', purpose: '发起人备注', status: 'design-only', persisted: 'not persisted' },
  { field: 'Approval dependency', purpose: '依赖的审批门禁', status: 'design-only', persisted: 'not persisted' },
  { field: 'Evidence bundle', purpose: '证据包引用', status: 'design-only', persisted: 'not persisted' },
  { field: 'Rollback requirement', purpose: '回滚要求', status: 'design-only', persisted: 'not persisted' },
  { field: 'Risk class', purpose: '风险等级分类', status: 'design-only', persisted: 'not persisted' },
  { field: 'Expiration policy', purpose: '过期策略', status: 'design-only', persisted: 'not persisted' },
];

// ── Mutation Diff / Impact Matrix ──

export interface MutationDiffRow {
  area: string;
  currentMode: string;
  diffRequired: string;
  impactRequired: string;
  write: string;
  execute: string;
  externalIO: string;
  status: string;
}

export const MUTATION_DIFF_MATRIX: MutationDiffRow[] = [
  { area: 'Navigation exposure', currentMode: 'readonly', diffRequired: 'future', impactRequired: 'future', write: 'no', execute: 'no', externalIO: 'no', status: 'design-only' },
  { area: 'Center access', currentMode: 'readonly', diffRequired: 'future', impactRequired: 'future', write: 'no', execute: 'no', externalIO: 'no', status: 'design-only' },
  { area: 'Memory candidate', currentMode: 'preview', diffRequired: 'required future', impactRequired: 'required future', write: 'no', execute: 'no', externalIO: 'no', status: 'deferred' },
  { area: 'Connector metadata', currentMode: 'readonly', diffRequired: 'required future', impactRequired: 'required future', write: 'no', execute: 'no', externalIO: 'no', status: 'deferred' },
  { area: 'Lab capability metadata', currentMode: 'readonly', diffRequired: 'required future', impactRequired: 'required future', write: 'no', execute: 'no', externalIO: 'no', status: 'deferred' },
  { area: 'External connector write', currentMode: 'disabled', diffRequired: 'required future', impactRequired: 'required future', write: 'no', execute: 'no', externalIO: 'gated', status: 'disabled' },
  { area: 'Deployment config', currentMode: 'disabled', diffRequired: 'required future', impactRequired: 'required future', write: 'no', execute: 'no', externalIO: 'gated', status: 'disabled' },
];

// ── Mutation Rollback Contract ──

export interface MutationRollbackContractField {
  field: string;
  purpose: string;
  status: string;
}

export const MUTATION_ROLLBACK_CONTRACT: MutationRollbackContractField[] = [
  { field: 'Restore target', purpose: '恢复目标 — 恢复到哪个基线版本', status: 'design-only' },
  { field: 'Rollback command placeholder', purpose: '回滚命令占位 — 未来可执行的回滚命令', status: 'design-only' },
  { field: 'Manual owner', purpose: '手动回滚负责人', status: 'design-only' },
  { field: 'Verification command', purpose: '验证命令 — 回滚后验证成功的命令', status: 'design-only' },
  { field: 'Affected scope', purpose: '影响范围 — 回滚操作影响的模块', status: 'design-only' },
  { field: 'Data safety note', purpose: '数据安全说明', status: 'design-only' },
  { field: 'Audit evidence', purpose: '审计证据 — 回滚证据记录', status: 'design-only' },
  { field: 'Failure handling', purpose: '失败处理 — 回滚失败时的升级策略', status: 'design-only' },
];

// ── Mutation Evidence Types ──

export interface MutationEvidenceType {
  evidence: string;
  purpose: string;
  status: string;
}

export const MUTATION_EVIDENCE_TYPES: MutationEvidenceType[] = [
  { evidence: 'Before snapshot', purpose: '变更前快照', status: 'design-only' },
  { evidence: 'After preview', purpose: '变更后预览', status: 'design-only' },
  { evidence: 'Diff summary', purpose: '差异汇总', status: 'design-only' },
  { evidence: 'Risk assessment', purpose: '风险评估', status: 'design-only' },
  { evidence: 'Approval reference', purpose: '审批引用', status: 'design-only' },
  { evidence: 'Rollback plan', purpose: '回滚计划', status: 'design-only' },
  { evidence: 'Validator snapshot', purpose: '当前 validator 快照', status: 'design-only' },
  { evidence: 'DB doctor result', purpose: '数据库健康检查结果', status: 'design-only' },
  { evidence: 'Secret scan result', purpose: '密钥扫描结果', status: 'design-only' },
  { evidence: 'Manual reviewer note', purpose: '人工审查备注', status: 'design-only' },
];

// ── Mutation Risk Guardrail Matrix ──

export interface MutationGuardrailRow {
  risk: string;
  currentExposure: string;
  activeRisk: number;
  guardrail: string;
  status: string;
}

export const MUTATION_GUARDRAIL_MATRIX: MutationGuardrailRow[] = [
  { risk: 'DB mutation', currentExposure: 'none', activeRisk: 0, guardrail: 'no write path', status: 'safe' },
  { risk: 'Memory candidate mutation', currentExposure: 'none', activeRisk: 0, guardrail: 'Stage C deferred', status: 'safe' },
  { risk: 'Connector write', currentExposure: 'none', activeRisk: 0, guardrail: 'external writes disabled', status: 'safe' },
  { risk: 'LAN sync', currentExposure: 'none', activeRisk: 0, guardrail: 'sync disabled', status: 'safe' },
  { risk: 'Dataset mutation', currentExposure: 'none', activeRisk: 0, guardrail: 'no dataset writes', status: 'safe' },
  { risk: 'Navigation mutation', currentExposure: 'none', activeRisk: 0, guardrail: 'no Layout/menu changes', status: 'safe' },
  { risk: 'Release mutation', currentExposure: 'none', activeRisk: 0, guardrail: 'no tag/release', status: 'safe' },
  { risk: 'Service mutation', currentExposure: 'none', activeRisk: 0, guardrail: 'no taskkill/restart', status: 'safe' },
];

// ── Mutation Lifecycle Stages ──

export interface MutationLifecycleStage {
  stage: string;
  purpose: string;
  status: string;
}

export const MUTATION_LIFECYCLE_STAGES: MutationLifecycleStage[] = [
  { stage: 'Draft mutation request', purpose: '草拟变更请求', status: 'design-only' },
  { stage: 'Attach diff evidence', purpose: '附上变更差异证据', status: 'design-only' },
  { stage: 'Attach impact analysis', purpose: '附上影响分析', status: 'design-only' },
  { stage: 'Attach rollback plan', purpose: '附上回滚计划', status: 'design-only' },
  { stage: 'Approval gate pending', purpose: '等待审批门禁', status: 'design-only' },
  { stage: 'Dry-run required', purpose: '需要模拟执行验证', status: 'design-only' },
  { stage: 'Execution deferred', purpose: '执行延后 — 待条件满足', status: 'design-only' },
  { stage: 'Audit record required', purpose: '需要审计记录', status: 'design-only' },
  { stage: 'Closure review', purpose: '关闭审查', status: 'design-only' },
];

// ── Execution Gate Design Spec ──

export interface ExecutionField {
  fieldName: string;
  purpose: string;
  status: string;
  runtimeEffect: string;
  executePermission: string;
  writePath: string;
  stageGate: string;
  blockedActions: string;
  futureRequirement: string;
}

export const EXECUTION_DESIGN_FIELDS: ExecutionField[] = [
  { fieldName: 'ExecutionRequest', purpose: '执行请求 — 记录待执行操作详情', status: 'design-only', runtimeEffect: 'none', executePermission: 'disabled', writePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no run/start/stop/deploy', futureRequirement: '人工提交执行请求' },
  { fieldName: 'ExecutionScope', purpose: '执行范围 — 定义执行影响哪些系统/模块', status: 'design-only', runtimeEffect: 'none', executePermission: 'disabled', writePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no run outside scope', futureRequirement: '范围选择+影响预估' },
  { fieldName: 'ExecutionPreflight', purpose: '执行预检 — 执行前验证条件是否满足', status: 'design-only', runtimeEffect: 'none', executePermission: 'disabled', writePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no preflight execute', futureRequirement: '预检结果收集+展示' },
  { fieldName: 'ExecutionDryRunPolicy', purpose: 'Dry-run 策略 — 定义模拟执行方式', status: 'design-only', runtimeEffect: 'none', executePermission: 'disabled', writePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no dry-run execute', futureRequirement: 'dry-run 输出摘要' },
  { fieldName: 'ExecutionEvidence', purpose: '执行证据 — 附上审计证据', status: 'design-only', runtimeEffect: 'none', executePermission: 'disabled', writePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no evidence read/upload', futureRequirement: '证据上传+摘要' },
  { fieldName: 'ExecutionApprovalLink', purpose: '审批链接 — 关联 Approval Gate 记录', status: 'design-only', runtimeEffect: 'none', executePermission: 'disabled', writePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no cross-gate write', futureRequirement: '跨门禁关联' },
  { fieldName: 'ExecutionRollbackRequirement', purpose: '回滚要求 — 执行失败后的回退策略', status: 'design-only', runtimeEffect: 'none', executePermission: 'disabled', writePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no rollback execute', futureRequirement: '回滚步骤+成功验证' },
  { fieldName: 'ExecutionRuntimeBoundary', purpose: '运行时边界 — 定义执行的安全边界', status: 'design-only', runtimeEffect: 'none', executePermission: 'disabled', writePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no runtime override', futureRequirement: '边界策略+违规告警' },
  { fieldName: 'ExecutionAuditRecord', purpose: '审计记录 — 完整记录执行全链路', status: 'design-only', runtimeEffect: 'none', executePermission: 'disabled', writePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no audit write', futureRequirement: '不可篡改审计追踪' },
  { fieldName: 'ExecutionExpiry', purpose: '执行过期 — 执行请求超时失效', status: 'design-only', runtimeEffect: 'none', executePermission: 'disabled', writePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no auto-expire yet', futureRequirement: '超时策略+通知' },
];

// ── Execution Request Model ──

export interface ExecutionRequestField {
  field: string;
  purpose: string;
  status: string;
  persisted: string;
}

export const EXECUTION_REQUEST_FIELDS: ExecutionRequestField[] = [
  { field: 'Request ID', purpose: '执行请求唯一标识', status: 'design-only', persisted: 'not persisted' },
  { field: 'Requested execution', purpose: '请求的具体执行操作描述', status: 'design-only', persisted: 'not persisted' },
  { field: 'Target domain', purpose: '执行目标域', status: 'design-only', persisted: 'not persisted' },
  { field: 'Target resource', purpose: '执行目标资源', status: 'design-only', persisted: 'not persisted' },
  { field: 'Execution mode', purpose: '执行模式（manual/dry-run/auto）', status: 'design-only', persisted: 'not persisted' },
  { field: 'Preflight requirement', purpose: '预检要求', status: 'design-only', persisted: 'not persisted' },
  { field: 'Dry-run requirement', purpose: 'Dry-run 要求', status: 'design-only', persisted: 'not persisted' },
  { field: 'Approval dependency', purpose: '依赖的审批门禁', status: 'design-only', persisted: 'not persisted' },
  { field: 'Rollback dependency', purpose: '依赖的回滚计划', status: 'design-only', persisted: 'not persisted' },
  { field: 'Risk class', purpose: '风险等级分类', status: 'design-only', persisted: 'not persisted' },
  { field: 'Expiration policy', purpose: '过期策略', status: 'design-only', persisted: 'not persisted' },
];

// ── Execution Preflight / Dry-run Matrix ──

export interface ExecutionPreflightRow {
  area: string;
  currentMode: string;
  preflight: string;
  dryRun: string;
  execute: string;
  write: string;
  externalIO: string;
  status: string;
}

export const EXECUTION_PREFLIGHT_MATRIX: ExecutionPreflightRow[] = [
  { area: 'Navigation exposure', currentMode: 'readonly', preflight: 'future', dryRun: 'future', execute: 'no', write: 'no', externalIO: 'no', status: 'design-only' },
  { area: 'Center access', currentMode: 'readonly', preflight: 'future', dryRun: 'future', execute: 'no', write: 'no', externalIO: 'no', status: 'design-only' },
  { area: 'Memory candidate', currentMode: 'preview', preflight: 'required future', dryRun: 'required future', execute: 'no', write: 'no', externalIO: 'no', status: 'deferred' },
  { area: 'Connector write', currentMode: 'disabled', preflight: 'required future', dryRun: 'required future', execute: 'no', write: 'no', externalIO: 'gated', status: 'disabled' },
  { area: 'Lab experiment', currentMode: 'preview', preflight: 'required future', dryRun: 'required future', execute: 'no', write: 'no', externalIO: 'no', status: 'deferred' },
  { area: 'Training job', currentMode: 'disabled', preflight: 'required future', dryRun: 'required future', execute: 'no', write: 'no', externalIO: 'no', status: 'disabled' },
  { area: 'Deployment', currentMode: 'disabled', preflight: 'required future', dryRun: 'required future', execute: 'no', write: 'no', externalIO: 'gated', status: 'disabled' },
  { area: 'Service control', currentMode: 'disabled', preflight: 'required future', dryRun: 'required future', execute: 'no', write: 'no', externalIO: 'local gated', status: 'disabled' },
];

// ── Execution Evidence Types ──

export interface ExecutionEvidenceType {
  evidence: string;
  purpose: string;
  status: string;
}

export const EXECUTION_EVIDENCE_TYPES: ExecutionEvidenceType[] = [
  { evidence: 'Preflight result', purpose: '预检结果', status: 'design-only' },
  { evidence: 'Dry-run result', purpose: 'Dry-run 结果', status: 'design-only' },
  { evidence: 'Risk assessment', purpose: '风险评估', status: 'design-only' },
  { evidence: 'Approval reference', purpose: '审批引用', status: 'design-only' },
  { evidence: 'Rollback plan', purpose: '回滚计划', status: 'design-only' },
  { evidence: 'Validator snapshot', purpose: '当前 validator 快照', status: 'design-only' },
  { evidence: 'DB doctor result', purpose: '数据库健康检查结果', status: 'design-only' },
  { evidence: 'Secret scan result', purpose: '密钥扫描结果', status: 'design-only' },
  { evidence: 'Smoke status', purpose: '冒烟测试状态', status: 'design-only' },
  { evidence: 'Manual reviewer note', purpose: '人工审查备注', status: 'design-only' },
];

// ── Execution Boundary Items ──

export interface ExecutionBoundaryItem {
  item: string;
  purpose: string;
  status: string;
}

export const EXECUTION_BOUNDARY_ITEMS: ExecutionBoundaryItem[] = [
  { item: 'No real execution', purpose: '不执行任何真实操作', status: 'design-only' },
  { item: 'No run action', purpose: '不启动 run 操作', status: 'design-only' },
  { item: 'No start / stop action', purpose: '不启动/停止操作', status: 'design-only' },
  { item: 'No service control', purpose: '不执行服务控制', status: 'design-only' },
  { item: 'No deployment', purpose: '不执行部署', status: 'design-only' },
  { item: 'No connector write', purpose: '不写连接器', status: 'design-only' },
  { item: 'No LAN_SHARE sync', purpose: '不同步 LAN_SHARE', status: 'design-only' },
  { item: 'No lab execution', purpose: '不执行 lab 操作', status: 'design-only' },
  { item: 'No training trigger', purpose: '不触发训练', status: 'design-only' },
  { item: 'No inference trigger', purpose: '不触发推理', status: 'design-only' },
  { item: 'No DB write', purpose: '不写数据库', status: 'design-only' },
  { item: 'No external write', purpose: '不写外部系统', status: 'design-only' },
  { item: 'No Memory Hub mutation', purpose: '不变更 Memory Hub', status: 'design-only' },
  { item: 'No tag / GitHub Release', purpose: '不创建 tag 或 Release', status: 'design-only' },
];

// ── Execution Risk Guardrail Matrix ──

export interface ExecutionGuardrailRow {
  risk: string;
  currentExposure: string;
  activeRisk: number;
  guardrail: string;
  status: string;
}

export const EXECUTION_GUARDRAIL_MATRIX: ExecutionGuardrailRow[] = [
  { risk: 'Execution action', currentExposure: 'none', activeRisk: 0, guardrail: 'no execute path', status: 'safe' },
  { risk: 'Service control', currentExposure: 'none', activeRisk: 0, guardrail: 'no restart/taskkill', status: 'safe' },
  { risk: 'Deployment', currentExposure: 'none', activeRisk: 0, guardrail: 'no deploy trigger', status: 'safe' },
  { risk: 'Lab execution', currentExposure: 'none', activeRisk: 0, guardrail: 'Stage C deferred', status: 'safe' },
  { risk: 'Training trigger', currentExposure: 'none', activeRisk: 0, guardrail: 'disabled', status: 'safe' },
  { risk: 'Inference trigger', currentExposure: 'none', activeRisk: 0, guardrail: 'disabled', status: 'safe' },
  { risk: 'External write', currentExposure: 'none', activeRisk: 0, guardrail: 'disabled', status: 'safe' },
  { risk: 'Tag/release', currentExposure: 'none', activeRisk: 0, guardrail: 'no release path', status: 'safe' },
];

// ── P6 External Write Gate Design Spec ──

export interface ExternalWriteField {
  fieldName: string;
  purpose: string;
  status: string;
  runtimeEffect: string;
  externalWritePermission: string;
  writePath: string;
  stageGate: string;
  blockedActions: string;
  futureRequirement: string;
}

export const EXTERNAL_WRITE_DESIGN_FIELDS: ExternalWriteField[] = [
  { fieldName: 'ExternalWriteRequest', purpose: '外部写入请求 — 记录对外部系统的写入操作详情', status: 'design-only', runtimeEffect: 'none', externalWritePermission: 'disabled', writePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no external write/push/upload', futureRequirement: '人工提交外部写入请求' },
  { fieldName: 'TargetConnector', purpose: '目标连接器 — 指定写入目标系统（OpenClaw/GitHub/HuggingFace等）', status: 'design-only', runtimeEffect: 'none', externalWritePermission: 'disabled', writePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no connector write/sync', futureRequirement: '连接器选择+端点验证' },
  { fieldName: 'TargetEndpoint', purpose: '目标端点 — 具体的外部系统 API 端点', status: 'design-only', runtimeEffect: 'none', externalWritePermission: 'disabled', writePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no endpoint call/write', futureRequirement: '端点清单+健康检查' },
  { fieldName: 'PayloadPreview', purpose: '载荷预览 — 展示即将写入的数据内容', status: 'design-only', runtimeEffect: 'none', externalWritePermission: 'disabled', writePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no payload upload/send', futureRequirement: '载荷生成+差异对比' },
  { fieldName: 'WriteScope', purpose: '写入范围 — 定义写入影响哪些资源', status: 'design-only', runtimeEffect: 'none', externalWritePermission: 'disabled', writePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no scope write', futureRequirement: '范围选择+影响预估' },
  { fieldName: 'EndpointRiskClass', purpose: '端点风险等级 — 评估目标端点的风险分类', status: 'design-only', runtimeEffect: 'none', externalWritePermission: 'disabled', writePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no risk bypass', futureRequirement: '风险评分+分类策略' },
  { fieldName: 'ApprovalDependency', purpose: '审批依赖 — 关联 Approval Gate 记录', status: 'design-only', runtimeEffect: 'none', externalWritePermission: 'disabled', writePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no cross-gate write', futureRequirement: '审批门禁关联' },
  { fieldName: 'MutationDependency', purpose: '变更依赖 — 关联 Mutation Gate 记录', status: 'design-only', runtimeEffect: 'none', externalWritePermission: 'disabled', writePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no mutation without gate', futureRequirement: '变更门禁关联' },
  { fieldName: 'ExecutionDependency', purpose: '执行依赖 — 关联 Execution Gate 记录', status: 'design-only', runtimeEffect: 'none', externalWritePermission: 'disabled', writePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no execute without gate', futureRequirement: '执行门禁关联' },
  { fieldName: 'RollbackRequirement', purpose: '回滚要求 — 外部写入失败后的回退策略', status: 'design-only', runtimeEffect: 'none', externalWritePermission: 'disabled', writePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no rollback execute', futureRequirement: '回滚步骤+验证方法' },
  { fieldName: 'AuditEvidence', purpose: '审计证据 — 外部写入操作的审计记录', status: 'design-only', runtimeEffect: 'none', externalWritePermission: 'disabled', writePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no audit write', futureRequirement: '不可篡改审计追踪' },
  { fieldName: 'ExpiryPolicy', purpose: '过期策略 — 外部写入请求超时失效', status: 'design-only', runtimeEffect: 'none', externalWritePermission: 'disabled', writePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no auto-expire yet', futureRequirement: '超时策略+通知机制' },
];

// ── P6 Connector Write Policy Model ──

export interface ConnectorPolicyEntry {
  connectorName: string;
  currentWritePosture: string;
  externalIOPosture: string;
  allowedWrite: string;
  requiredFutureGate: string;
  riskClass: string;
  blockedActions: string;
  auditEvidenceRequired: string;
  rollbackRequirement: string;
}

export const CONNECTOR_POLICY_ENTRIES: ConnectorPolicyEntry[] = [
  { connectorName: 'AIP Core', currentWritePosture: 'readonly / design-only', externalIOPosture: 'no external IO', allowedWrite: 'no', requiredFutureGate: 'not required', riskClass: 'low', blockedActions: 'no write/sync/upload', auditEvidenceRequired: 'future', rollbackRequirement: 'future' },
  { connectorName: 'OpenClaw', currentWritePosture: 'not active / design-only', externalIOPosture: 'gated — observed only', allowedWrite: 'no', requiredFutureGate: 'External Write Gate', riskClass: 'high', blockedActions: 'no connector write/sync/deploy', auditEvidenceRequired: 'required future', rollbackRequirement: 'required future' },
  { connectorName: 'Memory Hub', currentWritePosture: 'readonly / design-only', externalIOPosture: 'no external IO', allowedWrite: 'no', requiredFutureGate: 'Stage C deferred', riskClass: 'medium', blockedActions: 'no memory write/mutate', auditEvidenceRequired: 'required future', rollbackRequirement: 'required future' },
  { connectorName: 'OpenAxiom', currentWritePosture: 'not active / design-only', externalIOPosture: 'gated — observe only', allowedWrite: 'no', requiredFutureGate: 'External Write Gate', riskClass: 'high', blockedActions: 'no external write/sync', auditEvidenceRequired: 'required future', rollbackRequirement: 'required future' },
  { connectorName: 'ComfyUI', currentWritePosture: 'planned / design-only', externalIOPosture: 'local gated only', allowedWrite: 'no', requiredFutureGate: 'Stage C deferred', riskClass: 'medium', blockedActions: 'no workflow write/execute', auditEvidenceRequired: 'future', rollbackRequirement: 'future' },
  { connectorName: 'Hugging Face', currentWritePosture: 'planned / design-only', externalIOPosture: 'gated — read planned only', allowedWrite: 'no', requiredFutureGate: 'Stage C deferred', riskClass: 'high', blockedActions: 'no upload/push/sync', auditEvidenceRequired: 'required future', rollbackRequirement: 'required future' },
  { connectorName: 'GitHub', currentWritePosture: 'readonly/manual / design-only', externalIOPosture: 'gated — manual only', allowedWrite: 'no', requiredFutureGate: 'manual only / Stage C deferred', riskClass: 'high', blockedActions: 'no push/tag/release/PR write', auditEvidenceRequired: 'required future', rollbackRequirement: 'required future' },
  { connectorName: 'LAN_SHARE', currentWritePosture: 'disabled / design-only', externalIOPosture: 'local network gated', allowedWrite: 'no', requiredFutureGate: 'Stage C deferred', riskClass: 'medium', blockedActions: 'no LAN sync/share write', auditEvidenceRequired: 'required future', rollbackRequirement: 'required future' },
  { connectorName: 'Local Models', currentWritePosture: 'readonly / design-only', externalIOPosture: 'no external IO', allowedWrite: 'no', requiredFutureGate: 'not required', riskClass: 'low', blockedActions: 'no model write/modify', auditEvidenceRequired: 'future', rollbackRequirement: 'future' },
  { connectorName: 'Stage C Governance', currentWritePosture: 'deferred / design-only', externalIOPosture: 'no external IO', allowedWrite: 'no', requiredFutureGate: 'Stage C package approved', riskClass: 'medium', blockedActions: 'no stageC enable/write', auditEvidenceRequired: 'required future', rollbackRequirement: 'required future' },
];

// ── P6 External IO Boundary Matrix ──

export interface ExternalIOBoundaryRow {
  connector: string;
  read: string;
  write: string;
  sync: string;
  upload: string;
  deploy: string;
  externalIO: string;
  stageGate: string;
  status: string;
}

export const EXTERNAL_IO_BOUNDARY_ROWS: ExternalIOBoundaryRow[] = [
  { connector: 'AIP Core', read: 'readonly', write: 'no', sync: 'no', upload: 'no', deploy: 'no', externalIO: 'none', stageGate: 'none', status: 'stable' },
  { connector: 'OpenClaw', read: 'observe only', write: 'no', sync: 'no', upload: 'no', deploy: 'no', externalIO: 'gated', stageGate: 'future', status: 'design-only' },
  { connector: 'Memory Hub', read: 'readonly', write: 'no', sync: 'no', upload: 'no', deploy: 'no', externalIO: 'none', stageGate: 'Stage C deferred', status: 'deferred' },
  { connector: 'OpenAxiom', read: 'observe only', write: 'no', sync: 'no', upload: 'no', deploy: 'no', externalIO: 'gated', stageGate: 'future', status: 'design-only' },
  { connector: 'ComfyUI', read: 'planned', write: 'no', sync: 'no', upload: 'no', deploy: 'no', externalIO: 'local gated', stageGate: 'future', status: 'planned' },
  { connector: 'Hugging Face', read: 'planned', write: 'no', sync: 'no', upload: 'no', deploy: 'no', externalIO: 'gated', stageGate: 'Stage C deferred', status: 'deferred' },
  { connector: 'GitHub', read: 'readonly/manual', write: 'no', sync: 'no', upload: 'no', deploy: 'no', externalIO: 'gated', stageGate: 'manual only', status: 'disabled' },
  { connector: 'LAN_SHARE', read: 'disabled', write: 'no', sync: 'no', upload: 'no', deploy: 'no', externalIO: 'local network gated', stageGate: 'Stage C deferred', status: 'disabled' },
  { connector: 'Local Models', read: 'readonly', write: 'no', sync: 'no', upload: 'no', deploy: 'no', externalIO: 'none', stageGate: 'none', status: 'stable' },
  { connector: 'Stage C Governance', read: 'readonly', write: 'no', sync: 'no', upload: 'no', deploy: 'no', externalIO: 'none', stageGate: 'Stage C deferred', status: 'deferred' },
];

// ── P6 External Write Evidence Matrix ──

export interface ExternalWriteEvidenceType {
  evidence: string;
  purpose: string;
  status: string;
}

export const EXTERNAL_WRITE_EVIDENCE_TYPES: ExternalWriteEvidenceType[] = [
  { evidence: 'Endpoint inventory', purpose: '目标端点清单 — 列出所有要写入的外部端点', status: 'readonly / design-only' },
  { evidence: 'Payload preview', purpose: '载荷预览 — 展示即将写入的数据', status: 'readonly / design-only' },
  { evidence: 'Diff summary', purpose: '差异汇总 — 写入内容的变更对比', status: 'readonly / design-only' },
  { evidence: 'Risk assessment', purpose: '风险评估 — 外部写入操作的风险评估', status: 'readonly / design-only' },
  { evidence: 'Approval reference', purpose: '审批引用 — 关联的审批记录', status: 'readonly / design-only' },
  { evidence: 'Mutation reference', purpose: '变更引用 — 关联的变更记录', status: 'readonly / design-only' },
  { evidence: 'Execution reference', purpose: '执行引用 — 关联的执行记录', status: 'readonly / design-only' },
  { evidence: 'Rollback plan', purpose: '回滚计划 — 外部写入失败后的回退策略', status: 'readonly / design-only' },
  { evidence: 'Validator snapshot', purpose: '当前 validator 快照', status: 'readonly / design-only' },
  { evidence: 'Secret scan result', purpose: '密钥扫描结果 — 检查载荷中是否包含密钥', status: 'readonly / design-only' },
  { evidence: 'DB doctor result', purpose: '数据库健康检查结果', status: 'readonly / design-only' },
  { evidence: 'Manual reviewer note', purpose: '人工审查备注', status: 'readonly / design-only' },
];

// ── P6 External Write Guardrail Matrix ──

export interface ExternalWriteGuardrailRow {
  risk: string;
  currentExposure: string;
  activeRisk: number;
  guardrail: string;
  status: string;
}

export const EXTERNAL_WRITE_GUARDRAIL_MATRIX: ExternalWriteGuardrailRow[] = [
  { risk: 'External write', currentExposure: 'none', activeRisk: 0, guardrail: 'no write path', status: 'safe' },
  { risk: 'Connector write', currentExposure: 'none', activeRisk: 0, guardrail: 'writes disabled', status: 'safe' },
  { risk: 'LAN sync', currentExposure: 'none', activeRisk: 0, guardrail: 'sync disabled', status: 'safe' },
  { risk: 'GitHub release/tag', currentExposure: 'none', activeRisk: 0, guardrail: 'no release path', status: 'safe' },
  { risk: 'Hugging Face upload', currentExposure: 'none', activeRisk: 0, guardrail: 'upload disabled', status: 'safe' },
  { risk: 'ComfyUI workflow write', currentExposure: 'none', activeRisk: 0, guardrail: 'local-gated only', status: 'safe' },
  { risk: 'Memory mutation', currentExposure: 'none', activeRisk: 0, guardrail: 'Stage C deferred', status: 'safe' },
  { risk: 'Deployment', currentExposure: 'none', activeRisk: 0, guardrail: 'deploy disabled', status: 'safe' },
  { risk: 'OpenAxiom write', currentExposure: 'none', activeRisk: 0, guardrail: 'observe only', status: 'safe' },
  { risk: 'Payload upload', currentExposure: 'none', activeRisk: 0, guardrail: 'no upload path', status: 'safe' },
];

// ── P6 Connector Write Lifecycle Stages ──

export interface ConnectorWriteLifecycleStage {
  stage: string;
  purpose: string;
  status: string;
}

export const CONNECTOR_WRITE_LIFECYCLE_STAGES: ConnectorWriteLifecycleStage[] = [
  { stage: 'Draft external write request', purpose: '草拟外部写入请求', status: 'design-only / no runtime effect' },
  { stage: 'Attach endpoint inventory', purpose: '附上目标端点清单', status: 'design-only / no runtime effect' },
  { stage: 'Attach payload preview', purpose: '附上载荷预览', status: 'design-only / no runtime effect' },
  { stage: 'Attach risk assessment', purpose: '附上风险评估', status: 'design-only / no runtime effect' },
  { stage: 'Attach approval reference', purpose: '附上审批引用', status: 'design-only / no runtime effect' },
  { stage: 'Attach mutation reference', purpose: '附上变更引用', status: 'design-only / no runtime effect' },
  { stage: 'Attach execution reference', purpose: '附上执行引用', status: 'design-only / no runtime effect' },
  { stage: 'Attach rollback plan', purpose: '附上回滚计划', status: 'design-only / no runtime effect' },
  { stage: 'External write deferred', purpose: '外部写入延后 — 待条件满足', status: 'design-only / no runtime effect' },
  { stage: 'Audit record required', purpose: '需要审计记录', status: 'design-only / no runtime effect' },
  { stage: 'Closure review', purpose: '关闭审查', status: 'design-only / no runtime effect' },
];

// ── Execution Lifecycle Stages ──

export interface ExecutionLifecycleStage {
  stage: string;
  purpose: string;
  status: string;
}

export const EXECUTION_LIFECYCLE_STAGES: ExecutionLifecycleStage[] = [
  { stage: 'Draft execution request', purpose: '草拟执行请求', status: 'design-only' },
  { stage: 'Attach preflight requirement', purpose: '附上预检要求', status: 'design-only' },
  { stage: 'Attach dry-run requirement', purpose: '附上 dry-run 要求', status: 'design-only' },
  { stage: 'Attach evidence bundle', purpose: '附上证据包', status: 'design-only' },
  { stage: 'Approval gate pending', purpose: '等待审批门禁', status: 'design-only' },
  { stage: 'Execution deferred', purpose: '执行延后 — 待条件满足', status: 'design-only' },
  { stage: 'Rollback requirement attached', purpose: '附上回滚要求', status: 'design-only' },
  { stage: 'Audit record required', purpose: '需要审计记录', status: 'design-only' },
  { stage: 'Closure review', purpose: '关闭审查', status: 'design-only' },
];
