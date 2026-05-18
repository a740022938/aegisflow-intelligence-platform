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

export interface ApprovalRollbackField {
  field: string;
  purpose: string;
  status: string;
}

export const APPROVAL_ROLLBACK_FIELDS: ApprovalRollbackField[] = [
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

// ── P7 Deployment Gate Design Spec ──

export interface DeploymentField {
  fieldName: string;
  purpose: string;
  status: string;
  runtimeEffect: string;
  deploymentPermission: string;
  releasePermission: string;
  externalWritePath: string;
  stageGate: string;
  blockedActions: string;
  futureRequirement: string;
}

export const DEPLOYMENT_DESIGN_FIELDS: DeploymentField[] = [
  { fieldName: 'DeploymentRequest', purpose: '部署请求 — 记录部署操作详情', status: 'design-only', runtimeEffect: 'none', deploymentPermission: 'disabled', releasePermission: 'disabled', externalWritePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no deploy/release/tag/push', futureRequirement: '人工提交部署请求' },
  { fieldName: 'DeploymentScope', purpose: '部署范围 — 定义部署影响哪些系统/模块', status: 'design-only', runtimeEffect: 'none', deploymentPermission: 'disabled', releasePermission: 'disabled', externalWritePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no scope deploy/release', futureRequirement: '范围选择+影响预估' },
  { fieldName: 'DeploymentTarget', purpose: '部署目标 — 指定部署目标环境/服务', status: 'design-only', runtimeEffect: 'none', deploymentPermission: 'disabled', releasePermission: 'disabled', externalWritePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no target write/deploy', futureRequirement: '目标选择+健康检查' },
  { fieldName: 'DeploymentPlan', purpose: '部署计划 — 详细的部署步骤与时间线', status: 'design-only', runtimeEffect: 'none', deploymentPermission: 'disabled', releasePermission: 'disabled', externalWritePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no plan execute/deploy', futureRequirement: '步骤生成+审批' },
  { fieldName: 'DeploymentEvidence', purpose: '部署证据 — 附上构建/测试证据', status: 'design-only', runtimeEffect: 'none', deploymentPermission: 'disabled', releasePermission: 'disabled', externalWritePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no evidence upload/write', futureRequirement: '证据上传+摘要' },
  { fieldName: 'ReleasePlan', purpose: '发布计划 — 定义发布策略与回退方案', status: 'design-only', runtimeEffect: 'none', deploymentPermission: 'disabled', releasePermission: 'disabled', externalWritePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no release/tag/push', futureRequirement: '发布策略+版本号' },
  { fieldName: 'ApprovalDependency', purpose: '审批依赖 — 关联 Approval Gate 记录', status: 'design-only', runtimeEffect: 'none', deploymentPermission: 'disabled', releasePermission: 'disabled', externalWritePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no cross-gate deploy', futureRequirement: '审批门禁关联' },
  { fieldName: 'ExecutionDependency', purpose: '执行依赖 — 关联 Execution Gate 记录', status: 'design-only', runtimeEffect: 'none', deploymentPermission: 'disabled', releasePermission: 'disabled', externalWritePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no execute without gate', futureRequirement: '执行门禁关联' },
  { fieldName: 'RollbackDependency', purpose: '回滚依赖 — 关联 Rollback Gate 记录', status: 'design-only', runtimeEffect: 'none', deploymentPermission: 'disabled', releasePermission: 'disabled', externalWritePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no rollback without gate', futureRequirement: '回滚门禁关联' },
  { fieldName: 'DeploymentAuditRecord', purpose: '审计记录 — 完整记录部署全链路', status: 'design-only', runtimeEffect: 'none', deploymentPermission: 'disabled', releasePermission: 'disabled', externalWritePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no audit write', futureRequirement: '不可篡改审计追踪' },
  { fieldName: 'DeploymentExpiry', purpose: '部署过期 — 部署请求超时失效', status: 'design-only', runtimeEffect: 'none', deploymentPermission: 'disabled', releasePermission: 'disabled', externalWritePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no auto-expire yet', futureRequirement: '超时策略+通知机制' },
];

// ── P7 Deployment Request Model ──

export interface DeploymentRequestField {
  field: string;
  purpose: string;
  status: string;
  persisted: string;
}

export const DEPLOYMENT_REQUEST_FIELDS: DeploymentRequestField[] = [
  { field: 'Request ID', purpose: '部署请求唯一标识', status: 'design-only', persisted: 'not persisted' },
  { field: 'Deployment target', purpose: '部署目标环境/服务', status: 'design-only', persisted: 'not persisted' },
  { field: 'Deployment scope', purpose: '部署影响范围', status: 'design-only', persisted: 'not persisted' },
  { field: 'Requested artifact', purpose: '请求部署的构建产物', status: 'design-only', persisted: 'not persisted' },
  { field: 'Release note', purpose: '发布说明', status: 'design-only', persisted: 'not persisted' },
  { field: 'Preflight requirement', purpose: '预检要求', status: 'design-only', persisted: 'not persisted' },
  { field: 'Approval dependency', purpose: '依赖的审批门禁', status: 'design-only', persisted: 'not persisted' },
  { field: 'Execution dependency', purpose: '依赖的执行门禁', status: 'design-only', persisted: 'not persisted' },
  { field: 'Rollback dependency', purpose: '依赖的回滚门禁', status: 'design-only', persisted: 'not persisted' },
  { field: 'Risk class', purpose: '风险等级分类', status: 'design-only', persisted: 'not persisted' },
  { field: 'Expiration policy', purpose: '过期策略', status: 'design-only', persisted: 'not persisted' },
];

// ── P7 Deployment Boundary Matrix ──

export interface DeploymentBoundaryRow {
  area: string;
  currentMode: string;
  deploy: string;
  release: string;
  tag: string;
  push: string;
  externalIO: string;
  stageGate: string;
  status: string;
}

export const DEPLOYMENT_BOUNDARY_ROWS: DeploymentBoundaryRow[] = [
  { area: 'Web UI', currentMode: 'readonly', deploy: 'no', release: 'no', tag: 'no', push: 'no', externalIO: 'none', stageGate: 'Stage C deferred', status: 'design-only' },
  { area: 'API service', currentMode: 'readonly', deploy: 'no', release: 'no', tag: 'no', push: 'no', externalIO: 'none', stageGate: 'Stage C deferred', status: 'design-only' },
  { area: 'Gateway', currentMode: 'readonly', deploy: 'no', release: 'no', tag: 'no', push: 'no', externalIO: 'none', stageGate: 'Stage C deferred', status: 'design-only' },
  { area: 'Connector metadata', currentMode: 'readonly', deploy: 'no', release: 'no', tag: 'no', push: 'no', externalIO: 'none', stageGate: 'Stage C deferred', status: 'design-only' },
  { area: 'LAN_SHARE', currentMode: 'disabled', deploy: 'no', release: 'no', tag: 'no', push: 'no', externalIO: 'local gated', stageGate: 'Stage C deferred', status: 'disabled' },
  { area: 'GitHub Release', currentMode: 'disabled', deploy: 'no', release: 'no', tag: 'no', push: 'no', externalIO: 'gated', stageGate: 'manual only', status: 'disabled' },
  { area: 'Service restart', currentMode: 'disabled', deploy: 'no', release: 'no', tag: 'no', push: 'no', externalIO: 'local gated', stageGate: 'Stage C deferred', status: 'disabled' },
];

// ── P7 Deployment Evidence / Release Plan Matrix ──

export interface DeploymentEvidenceType {
  evidence: string;
  purpose: string;
  status: string;
}

export const DEPLOYMENT_EVIDENCE_TYPES: DeploymentEvidenceType[] = [
  { evidence: 'Build result', purpose: '构建结果 — 构建是否成功', status: 'readonly / design-only' },
  { evidence: 'Typecheck result', purpose: '类型检查结果', status: 'readonly / design-only' },
  { evidence: 'Lint result', purpose: '代码规范检查结果', status: 'readonly / design-only' },
  { evidence: 'DB doctor result', purpose: '数据库健康检查结果', status: 'readonly / design-only' },
  { evidence: 'Secret scan result', purpose: '密钥扫描结果', status: 'readonly / design-only' },
  { evidence: 'Smoke status', purpose: '冒烟测试状态', status: 'readonly / design-only' },
  { evidence: 'Release note', purpose: '发布说明', status: 'readonly / design-only' },
  { evidence: 'Artifact summary', purpose: '构建产物摘要', status: 'readonly / design-only' },
  { evidence: 'Rollback plan', purpose: '回滚计划', status: 'readonly / design-only' },
  { evidence: 'Manual reviewer note', purpose: '人工审查备注', status: 'readonly / design-only' },
];

// ── P7 Rollback Gate Design Spec ──

export interface RollbackField {
  fieldName: string;
  purpose: string;
  status: string;
  runtimeEffect: string;
  rollbackPermission: string;
  restorePath: string;
  stageGate: string;
  blockedActions: string;
  futureRequirement: string;
}

export const ROLLBACK_DESIGN_FIELDS: RollbackField[] = [
  { fieldName: 'RollbackRequest', purpose: '回滚请求 — 记录回滚操作详情', status: 'design-only', runtimeEffect: 'none', rollbackPermission: 'disabled', restorePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no rollback/restore/reset/revert/checkout', futureRequirement: '人工提交回滚请求' },
  { fieldName: 'RestoreTarget', purpose: '恢复目标 — 定义回滚到哪个基线版本', status: 'design-only', runtimeEffect: 'none', rollbackPermission: 'disabled', restorePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no restore/reset/revert', futureRequirement: '基线选择+版本验证' },
  { fieldName: 'RestorePoint', purpose: '恢复点 — 定义可恢复的快照标识', status: 'design-only', runtimeEffect: 'none', rollbackPermission: 'disabled', restorePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no restore point write', futureRequirement: '快照标识+恢复验证' },
  { fieldName: 'RollbackScope', purpose: '回滚范围 — 定义回滚影响哪些系统/模块', status: 'design-only', runtimeEffect: 'none', rollbackPermission: 'disabled', restorePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no scope rollback/restore', futureRequirement: '范围选择+影响预估' },
  { fieldName: 'RollbackEvidence', purpose: '回滚证据 — 附上回滚操作审计证据', status: 'design-only', runtimeEffect: 'none', rollbackPermission: 'disabled', restorePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no evidence write/upload', futureRequirement: '证据上传+摘要' },
  { fieldName: 'VerificationPlan', purpose: '验证计划 — 回滚后的验证步骤', status: 'design-only', runtimeEffect: 'none', rollbackPermission: 'disabled', restorePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no verification execute', futureRequirement: '验证命令+成功标准' },
  { fieldName: 'FailureHandling', purpose: '失败处理 — 回滚失败时的升级策略', status: 'design-only', runtimeEffect: 'none', rollbackPermission: 'disabled', restorePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no fallback execute', futureRequirement: '升级策略+通知' },
  { fieldName: 'ManualOwner', purpose: '手动负责人 — 指定执行回滚的人员', status: 'design-only', runtimeEffect: 'none', rollbackPermission: 'disabled', restorePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no auto rollback', futureRequirement: '负责人分配+通知' },
  { fieldName: 'AuditRecord', purpose: '审计记录 — 完整记录回滚全链路', status: 'design-only', runtimeEffect: 'none', rollbackPermission: 'disabled', restorePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no audit write', futureRequirement: '不可篡改审计追踪' },
  { fieldName: 'ExpiryPolicy', purpose: '过期策略 — 回滚请求超时失效', status: 'design-only', runtimeEffect: 'none', rollbackPermission: 'disabled', restorePath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no auto-expire yet', futureRequirement: '超时策略+通知机制' },
];

// ── P7 Rollback Plan Model ──

export interface RollbackPlanField {
  field: string;
  purpose: string;
  status: string;
  persisted: string;
}

export const ROLLBACK_PLAN_FIELDS: RollbackPlanField[] = [
  { field: 'Restore target', purpose: '恢复目标 — 恢复到哪个基线版本', status: 'design-only', persisted: 'not persisted' },
  { field: 'Restore source', purpose: '恢复源 — 从哪个备份/快照恢复', status: 'design-only', persisted: 'not persisted' },
  { field: 'Affected services', purpose: '受影响服务 — 回滚会影响哪些服务', status: 'design-only', persisted: 'not persisted' },
  { field: 'Affected data', purpose: '受影响数据 — 回滚会影响哪些数据', status: 'design-only', persisted: 'not persisted' },
  { field: 'Manual owner', purpose: '手动回滚负责人', status: 'design-only', persisted: 'not persisted' },
  { field: 'Verification command', purpose: '验证命令 — 回滚后验证成功的命令', status: 'design-only', persisted: 'not persisted' },
  { field: 'Risk level', purpose: '风险等级分类', status: 'design-only', persisted: 'not persisted' },
  { field: 'Failure fallback', purpose: '失败回退 — 回滚失败时的应急策略', status: 'design-only', persisted: 'not persisted' },
  { field: 'Audit evidence', purpose: '审计证据 — 回滚操作证据记录', status: 'design-only', persisted: 'not persisted' },
  { field: 'Closure review', purpose: '关闭审查 — 回滚完成后的审查', status: 'design-only', persisted: 'not persisted' },
];

// ── P7 Deployment / Rollback Guardrail Matrix ──

export interface DeploymentRollbackGuardrailRow {
  risk: string;
  currentExposure: string;
  activeRisk: number;
  guardrail: string;
  status: string;
}

export const DEPLOYMENT_ROLLBACK_GUARDRAIL_MATRIX: DeploymentRollbackGuardrailRow[] = [
  { risk: 'Deployment action', currentExposure: 'none', activeRisk: 0, guardrail: 'no deploy path', status: 'safe' },
  { risk: 'GitHub Release', currentExposure: 'none', activeRisk: 0, guardrail: 'no release path', status: 'safe' },
  { risk: 'Git tag', currentExposure: 'none', activeRisk: 0, guardrail: 'no tag operation', status: 'safe' },
  { risk: 'Push/upload', currentExposure: 'none', activeRisk: 0, guardrail: 'external writes disabled', status: 'safe' },
  { risk: 'Service restart', currentExposure: 'none', activeRisk: 0, guardrail: 'no restart/taskkill', status: 'safe' },
  { risk: 'Rollback action', currentExposure: 'none', activeRisk: 0, guardrail: 'no restore/reset/revert', status: 'safe' },
  { risk: 'DB restore', currentExposure: 'none', activeRisk: 0, guardrail: 'no DB restore path', status: 'safe' },
  { risk: 'LAN sync', currentExposure: 'none', activeRisk: 0, guardrail: 'sync disabled', status: 'safe' },
];

// ── P7 Deployment / Rollback Lifecycle Stages ──

export interface DeploymentRollbackLifecycleStage {
  stage: string;
  purpose: string;
  status: string;
}

export const DEPLOYMENT_ROLLBACK_LIFECYCLE_STAGES: DeploymentRollbackLifecycleStage[] = [
  { stage: 'Draft deployment request', purpose: '草拟部署请求', status: 'design-only / no runtime effect' },
  { stage: 'Attach build evidence', purpose: '附上构建证据', status: 'design-only / no runtime effect' },
  { stage: 'Attach release plan', purpose: '附上发布计划', status: 'design-only / no runtime effect' },
  { stage: 'Attach rollback plan', purpose: '附上回滚计划', status: 'design-only / no runtime effect' },
  { stage: 'Approval gate pending', purpose: '等待审批门禁', status: 'design-only / no runtime effect' },
  { stage: 'Execution gate pending', purpose: '等待执行门禁', status: 'design-only / no runtime effect' },
  { stage: 'Deployment deferred', purpose: '部署延后 — 待条件满足', status: 'design-only / no runtime effect' },
  { stage: 'Rollback readiness reviewed', purpose: '回滚就绪审查', status: 'design-only / no runtime effect' },
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

// ── P8: Emergency Stop Gate Design Fields ──

export interface EmergencyStopField {
  field: string;
  purpose: string;
  status: string;
  runtimeEffect: string;
  stopPermission: string;
  serviceControl: string;
  taskkillPath: string;
  stageGate: string;
  blockedActions: string;
  futureRequirement: string;
}

export const EMERGENCY_STOP_DESIGN_FIELDS: EmergencyStopField[] = [
  { field: 'EmergencyStopRequest', purpose: '紧急停止请求 — 记录停止操作的详情', status: 'design-only', runtimeEffect: 'none', stopPermission: 'disabled', serviceControl: 'disabled', taskkillPath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no stop/pause/kill/taskkill/restart', futureRequirement: '人工提交紧急停止请求' },
  { field: 'StopScope', purpose: '停止范围 — 定义停止操作影响哪些系统', status: 'design-only', runtimeEffect: 'none', stopPermission: 'disabled', serviceControl: 'disabled', taskkillPath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no stop/pause/kill/restart', futureRequirement: '范围选择+影响预估' },
  { field: 'StopTarget', purpose: '停止目标 — 定义停止的具体服务/进程', status: 'design-only', runtimeEffect: 'none', stopPermission: 'disabled', serviceControl: 'disabled', taskkillPath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no process stop/kill', futureRequirement: '目标选择+确认' },
  { field: 'StopReason', purpose: '停止原因 — 记录停止操作的理由', status: 'design-only', runtimeEffect: 'none', stopPermission: 'disabled', serviceControl: 'disabled', taskkillPath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no stop without reason', futureRequirement: '原因填写+分类' },
  { field: 'TriggerPolicy', purpose: '触发策略 — 手动或自动触发', status: 'design-only', runtimeEffect: 'none', stopPermission: 'disabled', serviceControl: 'disabled', taskkillPath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no auto-trigger', futureRequirement: '策略选择+确认' },
  { field: 'ManualApprovalRequirement', purpose: '人工审批要求 — 停止前需要谁批准', status: 'design-only', runtimeEffect: 'none', stopPermission: 'disabled', serviceControl: 'disabled', taskkillPath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no auto-stop without approval', futureRequirement: '审批人配置+通知' },
  { field: 'RecoveryPlan', purpose: '恢复计划 — 停止后的恢复步骤', status: 'design-only', runtimeEffect: 'none', stopPermission: 'disabled', serviceControl: 'disabled', taskkillPath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no recovery execute', futureRequirement: '恢复步骤+验证' },
  { field: 'RollbackDependency', purpose: '回滚依赖 — 停止是否需要回滚', status: 'design-only', runtimeEffect: 'none', stopPermission: 'disabled', serviceControl: 'disabled', taskkillPath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no rollback trigger', futureRequirement: '依赖检查+通知' },
  { field: 'AuditEvidenceRequirement', purpose: '审计证据要求 — 停止操作需要保存证据', status: 'design-only', runtimeEffect: 'none', stopPermission: 'disabled', serviceControl: 'disabled', taskkillPath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no evidence write/upload', futureRequirement: '证据收集+保存' },
  { field: 'NotificationPolicy', purpose: '通知策略 — 停止后通知相关人员', status: 'design-only', runtimeEffect: 'none', stopPermission: 'disabled', serviceControl: 'disabled', taskkillPath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no notification send', futureRequirement: '通知配置+发送' },
  { field: 'ExpiryPolicy', purpose: '过期策略 — 停止请求超时失效', status: 'design-only', runtimeEffect: 'none', stopPermission: 'disabled', serviceControl: 'disabled', taskkillPath: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no auto-expire yet', futureRequirement: '超时策略+通知机制' },
];

// ── P8: Emergency Stop Policy Model ──

export interface EmergencyStopPolicyItem {
  policy: string;
  purpose: string;
  status: string;
  runtimeEffect: string;
  serviceControl: string;
  stageGate: string;
}

export const EMERGENCY_STOP_POLICY_ITEMS: EmergencyStopPolicyItem[] = [
  { policy: 'Trigger source policy', purpose: '触发来源策略 — 谁可以触发紧急停止', status: 'not active', runtimeEffect: 'none', serviceControl: 'disabled', stageGate: 'Stage C deferred' },
  { policy: 'Manual confirmation policy', purpose: '人工确认策略 — 停止前需要人工确认', status: 'not active', runtimeEffect: 'none', serviceControl: 'disabled', stageGate: 'Stage C deferred' },
  { policy: 'Blast radius policy', purpose: '爆炸半径策略 — 定义停止操作的影响范围', status: 'not active', runtimeEffect: 'none', serviceControl: 'disabled', stageGate: 'Stage C deferred' },
  { policy: 'Recovery ownership policy', purpose: '恢复归属策略 — 谁负责恢复', status: 'not active', runtimeEffect: 'none', serviceControl: 'disabled', stageGate: 'Stage C deferred' },
  { policy: 'Notification policy', purpose: '通知策略 — 停止后通知链', status: 'not active', runtimeEffect: 'none', serviceControl: 'disabled', stageGate: 'Stage C deferred' },
  { policy: 'Audit evidence policy', purpose: '审计证据策略 — 停止操作证据保存要求', status: 'not active', runtimeEffect: 'none', serviceControl: 'disabled', stageGate: 'Stage C deferred' },
  { policy: 'Rollback dependency policy', purpose: '回滚依赖策略 — 停止是否需要回滚', status: 'not active', runtimeEffect: 'none', serviceControl: 'disabled', stageGate: 'Stage C deferred' },
  { policy: 'False-positive handling policy', purpose: '误报处理策略 — 错误触发的处理流程', status: 'not active', runtimeEffect: 'none', serviceControl: 'disabled', stageGate: 'Stage C deferred' },
  { policy: 'Service isolation policy', purpose: '服务隔离策略 — 是否需要隔离受影响服务', status: 'not active', runtimeEffect: 'none', serviceControl: 'disabled', stageGate: 'Stage C deferred' },
  { policy: 'Final safety review policy', purpose: '最终安全审查策略 — 停止前最终安全确认', status: 'not active', runtimeEffect: 'none', serviceControl: 'disabled', stageGate: 'Stage C deferred' },
];

// ── P8: Emergency Stop Boundary Matrix ──

export interface EmergencyStopBoundaryRow {
  boundaryArea: string;
  currentMode: string;
  stop: string;
  pause: string;
  kill: string;
  restart: string;
  disable: string;
  serviceIO: string;
  stageGate: string;
  status: string;
}

export const EMERGENCY_STOP_BOUNDARY_ROWS: EmergencyStopBoundaryRow[] = [
  { boundaryArea: 'Web UI', currentMode: 'readonly', stop: 'no', pause: 'no', kill: 'no', restart: 'no', disable: 'no', serviceIO: 'no', stageGate: 'Stage C deferred', status: 'design-only' },
  { boundaryArea: 'API service', currentMode: 'readonly', stop: 'no', pause: 'no', kill: 'no', restart: 'no', disable: 'no', serviceIO: 'no', stageGate: 'Stage C deferred', status: 'design-only' },
  { boundaryArea: 'Gateway', currentMode: 'readonly', stop: 'no', pause: 'no', kill: 'no', restart: 'no', disable: 'no', serviceIO: 'no', stageGate: 'Stage C deferred', status: 'design-only' },
  { boundaryArea: 'Connector writes', currentMode: 'disabled', stop: 'no', pause: 'no', kill: 'no', restart: 'no', disable: 'no', serviceIO: 'gated', stageGate: 'Stage C deferred', status: 'disabled' },
  { boundaryArea: 'Lab execution', currentMode: 'disabled', stop: 'no', pause: 'no', kill: 'no', restart: 'no', disable: 'no', serviceIO: 'no', stageGate: 'Stage C deferred', status: 'disabled' },
  { boundaryArea: 'Deployment actions', currentMode: 'disabled', stop: 'no', pause: 'no', kill: 'no', restart: 'no', disable: 'no', serviceIO: 'gated', stageGate: 'Stage C deferred', status: 'disabled' },
  { boundaryArea: 'Service restart', currentMode: 'disabled', stop: 'no', pause: 'no', kill: 'no', restart: 'no', disable: 'no', serviceIO: 'local gated', stageGate: 'Stage C deferred', status: 'disabled' },
];

// ── P8: Audit Evidence Gate Design Fields ──

export interface AuditEvidenceField {
  field: string;
  purpose: string;
  status: string;
  runtimeEffect: string;
  writePath: string;
  uploadExportPath: string;
  persistence: string;
  stageGate: string;
  blockedActions: string;
  futureRequirement: string;
}

export const AUDIT_EVIDENCE_DESIGN_FIELDS: AuditEvidenceField[] = [
  { field: 'EvidenceBundle', purpose: '证据包 — 收集所有审计证据的容器', status: 'design-only', runtimeEffect: 'none', writePath: 'disabled', uploadExportPath: 'disabled', persistence: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no evidence write/upload/export/persist', futureRequirement: '证据包创建+收集' },
  { field: 'EvidenceSource', purpose: '证据来源 — 定义证据的来源系统/工具', status: 'design-only', runtimeEffect: 'none', writePath: 'disabled', uploadExportPath: 'disabled', persistence: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no source read/write', futureRequirement: '来源选择+注册' },
  { field: 'EvidenceType', purpose: '证据类型 — validator/db-doctor/secret-scan/build/smoke', status: 'design-only', runtimeEffect: 'none', writePath: 'disabled', uploadExportPath: 'disabled', persistence: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no type write/upload', futureRequirement: '类型定义+验证' },
  { field: 'EvidenceHash', purpose: '证据哈希 — 确保证据完整性', status: 'design-only', runtimeEffect: 'none', writePath: 'disabled', uploadExportPath: 'disabled', persistence: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no hash compute/write', futureRequirement: '哈希算法+验证' },
  { field: 'EvidenceTimestamp', purpose: '证据时间戳 — 记录证据生成时间', status: 'design-only', runtimeEffect: 'none', writePath: 'disabled', uploadExportPath: 'disabled', persistence: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no timestamp write', futureRequirement: '时间戳生成+验证' },
  { field: 'EvidenceOwner', purpose: '证据所有者 — 谁生成/负责该证据', status: 'design-only', runtimeEffect: 'none', writePath: 'disabled', uploadExportPath: 'disabled', persistence: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no owner write', futureRequirement: '所有者分配+通知' },
  { field: 'EvidenceRetentionPolicy', purpose: '证据保留策略 — 保留时间和删除规则', status: 'design-only', runtimeEffect: 'none', writePath: 'disabled', uploadExportPath: 'disabled', persistence: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no retention policy write/execute', futureRequirement: '保留策略配置' },
  { field: 'EvidenceIntegrityCheck', purpose: '证据完整性检查 — 验证证据未被篡改', status: 'design-only', runtimeEffect: 'none', writePath: 'disabled', uploadExportPath: 'disabled', persistence: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no integrity check write/execute', futureRequirement: '完整性算法+验证' },
  { field: 'EvidenceAccessScope', purpose: '证据访问范围 — 谁可以查看/下载证据', status: 'design-only', runtimeEffect: 'none', writePath: 'disabled', uploadExportPath: 'disabled', persistence: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no scope write', futureRequirement: '访问控制配置' },
  { field: 'EvidenceExportPolicy', purpose: '证据导出策略 — 导出格式和限制', status: 'design-only', runtimeEffect: 'none', writePath: 'disabled', uploadExportPath: 'disabled', persistence: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no export path', futureRequirement: '导出格式+限制' },
  { field: 'EvidenceAuditRecord', purpose: '证据审计记录 — 记录证据的所有操作', status: 'design-only', runtimeEffect: 'none', writePath: 'disabled', uploadExportPath: 'disabled', persistence: 'disabled', stageGate: 'Stage C deferred', blockedActions: 'no audit write', futureRequirement: '审计追踪+不可篡改' },
];

// ── P8: Audit Evidence Retention Matrix ──

export interface AuditEvidenceRetentionRow {
  evidenceType: string;
  currentMode: string;
  persist: string;
  upload: string;
  export: string;
  hash: string;
  retention: string;
  integrity: string;
  status: string;
}

export const AUDIT_EVIDENCE_RETENTION_ROWS: AuditEvidenceRetentionRow[] = [
  { evidenceType: 'Validator snapshot', currentMode: 'readonly', persist: 'no', upload: 'no', export: 'no', hash: 'future', retention: 'future', integrity: 'future', status: 'design-only' },
  { evidenceType: 'DB doctor result', currentMode: 'readonly', persist: 'no', upload: 'no', export: 'no', hash: 'future', retention: 'future', integrity: 'future', status: 'design-only' },
  { evidenceType: 'Secret scan result', currentMode: 'readonly', persist: 'no', upload: 'no', export: 'no', hash: 'future', retention: 'future', integrity: 'future', status: 'design-only' },
  { evidenceType: 'Build result', currentMode: 'readonly', persist: 'no', upload: 'no', export: 'no', hash: 'future', retention: 'future', integrity: 'future', status: 'design-only' },
  { evidenceType: 'Smoke status', currentMode: 'readonly', persist: 'no', upload: 'no', export: 'no', hash: 'future', retention: 'future', integrity: 'future', status: 'design-only' },
  { evidenceType: 'Manual reviewer note', currentMode: 'design-only', persist: 'no', upload: 'no', export: 'no', hash: 'future', retention: 'future', integrity: 'future', status: 'deferred' },
  { evidenceType: 'Rollback evidence', currentMode: 'design-only', persist: 'no', upload: 'no', export: 'no', hash: 'future', retention: 'future', integrity: 'future', status: 'deferred' },
  { evidenceType: 'Emergency stop evidence', currentMode: 'design-only', persist: 'no', upload: 'no', export: 'no', hash: 'future', retention: 'future', integrity: 'future', status: 'deferred' },
];

// ── P8: Emergency Stop + Audit Guardrail Matrix ──

export interface EmergencyStopAuditGuardrailRow {
  risk: string;
  currentExposure: string;
  activeRisk: string;
  guardrail: string;
  status: string;
}

export const EMERGENCY_STOP_AUDIT_GUARDRAIL_MATRIX: EmergencyStopAuditGuardrailRow[] = [
  { risk: 'Emergency stop action', currentExposure: 'none', activeRisk: '0', guardrail: 'no stop path', status: 'safe' },
  { risk: 'Taskkill / service restart', currentExposure: 'none', activeRisk: '0', guardrail: 'no system command', status: 'safe' },
  { risk: 'Service disable', currentExposure: 'none', activeRisk: '0', guardrail: 'no service control', status: 'safe' },
  { risk: 'Audit evidence write', currentExposure: 'none', activeRisk: '0', guardrail: 'persistence disabled', status: 'safe' },
  { risk: 'Evidence upload/export', currentExposure: 'none', activeRisk: '0', guardrail: 'external writes disabled', status: 'safe' },
  { risk: 'Evidence tampering', currentExposure: 'none', activeRisk: '0', guardrail: 'design-only, no persisted evidence', status: 'safe' },
  { risk: 'False emergency trigger', currentExposure: 'none', activeRisk: '0', guardrail: 'no trigger path', status: 'safe' },
  { risk: 'Stage C activation', currentExposure: 'none', activeRisk: '0', guardrail: 'deferred', status: 'safe' },
];

// ── P8: Emergency Stop + Audit Lifecycle Stages ──

export interface EmergencyStopAuditLifecycleStage {
  stage: string;
  purpose: string;
  status: string;
}

export const EMERGENCY_STOP_AUDIT_LIFECYCLE_STAGES: EmergencyStopAuditLifecycleStage[] = [
  { stage: 'Draft emergency policy', purpose: '草拟应急策略', status: 'design-only / no runtime effect' },
  { stage: 'Define stop scope', purpose: '定义停止范围', status: 'design-only / no runtime effect' },
  { stage: 'Define recovery owner', purpose: '定义恢复负责人', status: 'design-only / no runtime effect' },
  { stage: 'Attach audit evidence requirement', purpose: '附上审计证据要求', status: 'design-only / no runtime effect' },
  { stage: 'Attach rollback dependency', purpose: '附上回滚依赖', status: 'design-only / no runtime effect' },
  { stage: 'Manual review required', purpose: '需要人工审查', status: 'design-only / no runtime effect' },
  { stage: 'Emergency stop deferred', purpose: '紧急停止延后 — 待条件满足', status: 'design-only / no runtime effect' },
  { stage: 'Audit evidence model reviewed', purpose: '审计证据模型已审查', status: 'design-only / no runtime effect' },
  { stage: 'Integrity policy required', purpose: '需要完整性策略', status: 'design-only / no runtime effect' },
  { stage: 'Final safety audit required', purpose: '需要最终安全审计', status: 'design-only / no runtime effect' },
  { stage: 'Closure review', purpose: '关闭审查', status: 'design-only / no runtime effect' },
];

// ── P9: Gate Coverage Overview ──

export interface GateCoverageEntry {
  gate: string;
  coveredBy: string;
  currentMode: string;
  runtimeEffect: string;
  realControls: string;
  writePath: string;
  stageGate: string;
  coverageStatus: string;
  remainingBlocker: string;
}

export const GATE_COVERAGE_OVERVIEW: GateCoverageEntry[] = [
  { gate: 'Approval Gate', coveredBy: 'P3', currentMode: 'design-only', runtimeEffect: 'none', realControls: '0', writePath: 'disabled', stageGate: 'Stage C deferred', coverageStatus: 'complete-design', remainingBlocker: 'runtime authorization model missing' },
  { gate: 'Mutation Gate', coveredBy: 'P4', currentMode: 'design-only', runtimeEffect: 'none', realControls: '0', writePath: 'disabled', stageGate: 'Stage C deferred', coverageStatus: 'complete-design', remainingBlocker: 'mutation write path not implemented' },
  { gate: 'Execution Gate', coveredBy: 'P5', currentMode: 'design-only', runtimeEffect: 'none', realControls: '0', writePath: 'disabled', stageGate: 'Stage C deferred', coverageStatus: 'complete-design', remainingBlocker: 'dry-run engine not implemented' },
  { gate: 'External Write Gate', coveredBy: 'P6', currentMode: 'design-only', runtimeEffect: 'none', realControls: '0', writePath: 'disabled', stageGate: 'Stage C deferred', coverageStatus: 'complete-design', remainingBlocker: 'external write sandbox not implemented' },
  { gate: 'Connector Write Policy', coveredBy: 'P6', currentMode: 'design-only', runtimeEffect: 'none', realControls: '0', writePath: 'disabled', stageGate: 'Stage C deferred', coverageStatus: 'complete-design', remainingBlocker: 'connector write engine not implemented' },
  { gate: 'Deployment Gate', coveredBy: 'P7', currentMode: 'design-only', runtimeEffect: 'none', realControls: '0', writePath: 'disabled', stageGate: 'Stage C deferred', coverageStatus: 'complete-design', remainingBlocker: 'deployment runtime not implemented' },
  { gate: 'Rollback Gate', coveredBy: 'P7', currentMode: 'design-only', runtimeEffect: 'none', realControls: '0', writePath: 'disabled', stageGate: 'Stage C deferred', coverageStatus: 'complete-design', remainingBlocker: 'rollback execution path not implemented' },
  { gate: 'Emergency Stop Gate', coveredBy: 'P8', currentMode: 'design-only', runtimeEffect: 'none', realControls: '0', writePath: 'disabled', stageGate: 'Stage C deferred', coverageStatus: 'complete-design', remainingBlocker: 'emergency stop runtime not implemented' },
  { gate: 'Audit Evidence Gate', coveredBy: 'P8', currentMode: 'design-only', runtimeEffect: 'none', realControls: '0', writePath: 'disabled', stageGate: 'Stage C deferred', coverageStatus: 'complete-design', remainingBlocker: 'audit evidence persistence not implemented' },
];

// ── P9: P1–P8 Design Spec Coverage Audit ──

export interface CoverageAuditEntry {
  pack: string;
  scope: string;
  designSpec: string;
  dataModel: string;
  boundary: string;
  evidence: string;
  rollback: string;
  runtimeControl: string;
  status: string;
}

export const COVERAGE_AUDIT_MATRIX: CoverageAuditEntry[] = [
  { pack: 'P1', scope: 'Governance model + Stage C design spec', designSpec: 'yes', dataModel: 'yes', boundary: 'yes', evidence: 'partial', rollback: 'partial', runtimeControl: 'no', status: 'complete-design' },
  { pack: 'P3', scope: 'Approval gate', designSpec: 'yes', dataModel: 'yes', boundary: 'yes', evidence: 'yes', rollback: 'yes', runtimeControl: 'no', status: 'complete-design' },
  { pack: 'P4', scope: 'Mutation gate', designSpec: 'yes', dataModel: 'yes', boundary: 'yes', evidence: 'yes', rollback: 'yes', runtimeControl: 'no', status: 'complete-design' },
  { pack: 'P5', scope: 'Execution gate', designSpec: 'yes', dataModel: 'yes', boundary: 'yes', evidence: 'yes', rollback: 'yes', runtimeControl: 'no', status: 'complete-design' },
  { pack: 'P6', scope: 'External write gate + connector write policy', designSpec: 'yes', dataModel: 'yes', boundary: 'yes', evidence: 'yes', rollback: 'yes', runtimeControl: 'no', status: 'complete-design' },
  { pack: 'P7', scope: 'Deployment gate + rollback gate', designSpec: 'yes', dataModel: 'yes', boundary: 'yes', evidence: 'yes', rollback: 'yes', runtimeControl: 'no', status: 'complete-design' },
  { pack: 'P8', scope: 'Emergency stop gate + audit evidence gate', designSpec: 'yes', dataModel: 'yes', boundary: 'yes', evidence: 'yes', rollback: 'yes', runtimeControl: 'no', status: 'complete-design' },
];

// ── P9: Stage C Readiness Blocker Matrix ──

export interface StageCBlockerEntry {
  blocker: string;
  category: string;
  currentState: string;
  requiredFutureWork: string;
  riskIfIgnored: string;
  activationImpact: string;
}

export const STAGE_C_BLOCKER_MATRIX: StageCBlockerEntry[] = [
  { blocker: 'Runtime authorization model missing', category: 'auth', currentState: 'not implemented', requiredFutureWork: 'implement approval/reject runtime model', riskIfIgnored: 'unauthorized gate bypass', activationImpact: 'blocking' },
  { blocker: 'Persistent governance state not implemented', category: 'persistence', currentState: 'not implemented', requiredFutureWork: 'add governance state DB + API', riskIfIgnored: 'no audit trail', activationImpact: 'blocking' },
  { blocker: 'Approval storage not implemented', category: 'persistence', currentState: 'not implemented', requiredFutureWork: 'add approval table + evidence store', riskIfIgnored: 'no approval record', activationImpact: 'blocking' },
  { blocker: 'Audit evidence persistence not implemented', category: 'persistence', currentState: 'not implemented', requiredFutureWork: 'add evidence storage + integrity', riskIfIgnored: 'no audit evidence', activationImpact: 'blocking' },
  { blocker: 'Rollback execution path not implemented', category: 'runtime', currentState: 'not implemented', requiredFutureWork: 'implement rollback runtime engine', riskIfIgnored: 'unrecoverable deployment failure', activationImpact: 'blocking' },
  { blocker: 'Dry-run engine not implemented', category: 'runtime', currentState: 'not implemented', requiredFutureWork: 'add dry-run simulation engine', riskIfIgnored: 'unvalidated execution', activationImpact: 'blocking' },
  { blocker: 'External write sandbox not implemented', category: 'runtime', currentState: 'not implemented', requiredFutureWork: 'add external write sandbox + policy engine', riskIfIgnored: 'uncontrolled external write', activationImpact: 'blocking' },
  { blocker: 'Emergency stop runtime not implemented', category: 'runtime', currentState: 'not implemented', requiredFutureWork: 'add emergency stop + service control runtime', riskIfIgnored: 'no emergency response', activationImpact: 'blocking' },
  { blocker: 'Manual approval policy not finalized', category: 'policy', currentState: 'not finalized', requiredFutureWork: 'finalize manual approval policy + procedure', riskIfIgnored: 'unclear approval flow', activationImpact: 'delaying' },
  { blocker: 'Security review not completed', category: 'security', currentState: 'not completed', requiredFutureWork: 'complete security review + penetration test', riskIfIgnored: 'security vulnerability', activationImpact: 'blocking' },
  { blocker: 'Live smoke environment not validated', category: 'qa', currentState: 'not validated', requiredFutureWork: 'validate smoke environment + test suite', riskIfIgnored: 'undetected integration failure', activationImpact: 'delaying' },
  { blocker: 'Operator training not completed', category: 'ops', currentState: 'not completed', requiredFutureWork: 'complete operator training + runbook', riskIfIgnored: 'operator error', activationImpact: 'delaying' },
  { blocker: 'Final activation audit not completed', category: 'audit', currentState: 'not completed', requiredFutureWork: 'complete final activation audit + sign-off', riskIfIgnored: 'unreviewed activation risk', activationImpact: 'blocking' },
];

// ── P9: Missing Gate / Overlap / Duplicate Audit ──

export interface MissingGateAuditEntry {
  area: string;
  covered: string;
  notes: string;
}

export const MISSING_GATE_AUDIT: MissingGateAuditEntry[] = [
  { area: 'Approval coverage', covered: 'yes (P3)', notes: 'design-only, no runtime' },
  { area: 'Mutation coverage', covered: 'yes (P4)', notes: 'design-only, no runtime' },
  { area: 'Execution coverage', covered: 'yes (P5)', notes: 'design-only, no runtime' },
  { area: 'External write coverage', covered: 'yes (P6)', notes: 'design-only, no runtime' },
  { area: 'Connector write coverage', covered: 'yes (P6)', notes: 'design-only, no runtime' },
  { area: 'Deployment coverage', covered: 'yes (P7)', notes: 'design-only, no runtime' },
  { area: 'Rollback coverage', covered: 'yes (P7)', notes: 'design-only, no runtime' },
  { area: 'Emergency stop coverage', covered: 'yes (P8)', notes: 'design-only, no runtime' },
  { area: 'Audit evidence coverage', covered: 'yes (P8)', notes: 'design-only, no runtime' },
];

export const MISSING_GATE_STATS = {
  missingGateCount: 0,
  overlapConcernCount: 1,
  duplicateConcernCount: 0,
  acceptedOverlap: 'evidence shared across gates (execution, external write, deployment, rollback, emergency stop, audit evidence)',
  acceptedByDesign: true,
  reason: 'shared evidence contract — all gates reference the same audit evidence model',
  requiresFollowUp: false,
} as const;

// ── P9: Cross-Gate Dependency Matrix ──

export interface CrossGateDependencyEntry {
  sourceGate: string;
  dependentGate: string;
  dependencyReason: string;
  currentMode: string;
  runtimeEffect: string;
  futureRequirement: string;
}

export const CROSS_GATE_DEPENDENCIES: CrossGateDependencyEntry[] = [
  { sourceGate: 'Approval Gate', dependentGate: 'Mutation / Execution / External Write / Deployment', dependencyReason: 'approval required before gate action', currentMode: 'design-only', runtimeEffect: 'none', futureRequirement: 'implement approval runtime' },
  { sourceGate: 'Mutation Gate', dependentGate: 'Write actions', dependencyReason: 'mutation gate must pass before write', currentMode: 'design-only', runtimeEffect: 'none', futureRequirement: 'implement mutation runtime' },
  { sourceGate: 'Execution Gate', dependentGate: 'Runtime action', dependencyReason: 'execution gate must pass before run', currentMode: 'design-only', runtimeEffect: 'none', futureRequirement: 'implement dry-run + execution' },
  { sourceGate: 'External Write Gate', dependentGate: 'Connector write / Upload / Sync', dependencyReason: 'external write gate must pass before external IO', currentMode: 'design-only', runtimeEffect: 'none', futureRequirement: 'implement write sandbox' },
  { sourceGate: 'Deployment Gate', dependentGate: 'Build evidence + Approval', dependencyReason: 'deployment gate requires evidence + approval', currentMode: 'design-only', runtimeEffect: 'none', futureRequirement: 'implement deployment runtime' },
  { sourceGate: 'Rollback Gate', dependentGate: 'Deployment', dependencyReason: 'rollback plan required before deployment', currentMode: 'design-only', runtimeEffect: 'none', futureRequirement: 'implement rollback runtime' },
  { sourceGate: 'Emergency Stop Gate', dependentGate: 'Runtime control', dependencyReason: 'emergency stop gate required before any runtime control', currentMode: 'design-only', runtimeEffect: 'none', futureRequirement: 'implement stop runtime' },
  { sourceGate: 'Audit Evidence Gate', dependentGate: 'All Stage C actions', dependencyReason: 'audit evidence required across all Stage C actions', currentMode: 'design-only', runtimeEffect: 'none', futureRequirement: 'implement evidence persistence' },
];

// ── P9: Control Boundary Final Matrix ──

export interface ControlBoundaryFinalEntry {
  controlArea: string;
  count: string;
  status: string;
}

export const CONTROL_BOUNDARY_FINAL: ControlBoundaryFinalEntry[] = [
  { controlArea: 'Approval / Reject controls', count: '0', status: 'disabled' },
  { controlArea: 'Mutation / Write controls', count: '0', status: 'disabled' },
  { controlArea: 'Execution / Run controls', count: '0', status: 'disabled' },
  { controlArea: 'External write / Upload / Sync controls', count: '0', status: 'disabled' },
  { controlArea: 'Deployment / Release / Tag controls', count: '0', status: 'disabled' },
  { controlArea: 'Rollback / Restore controls', count: '0', status: 'disabled' },
  { controlArea: 'Emergency Stop / Kill / Restart controls', count: '0', status: 'disabled' },
  { controlArea: 'Audit Evidence Write / Export controls', count: '0', status: 'disabled' },
  { controlArea: 'DB write paths', count: '0', status: 'disabled' },
  { controlArea: 'External system writes', count: '0', status: 'disabled' },
  { controlArea: 'Memory Hub candidate mutations', count: '0', status: 'disabled' },
  { controlArea: 'LAN_SHARE sync paths', count: '0', status: 'disabled' },
  { controlArea: 'Training / inference triggers', count: '0', status: 'disabled' },
];

// ── v7.24.0-P1: Stage C Activation Planning Overview ──

export interface ActivationPlanningEntry {
  area: string;
  currentStatus: string;
  detail: string;
}

export const STAGE_C_ACTIVATION_PLANNING: ActivationPlanningEntry[] = [
  { area: 'Activation status', currentStatus: 'disabled', detail: 'Stage C is not enabled. No activation toggle exists.' },
  { area: 'Runtime authorization', currentStatus: 'not implemented', detail: 'Runtime authorization model is design-only. No approval/reject runtime exists.' },
  { area: 'Runtime control packages', currentStatus: '0', detail: 'No runtime control package has been implemented across all 9 gates.' },
  { area: 'Real control buttons', currentStatus: '0', detail: 'No real approve/reject/execute/write/deploy/rollback/stop button exists.' },
  { area: 'Activation blockers', currentStatus: '13 (8 blocking, 5 delaying)', detail: '13 blockers remain unresolved. Stage C cannot be enabled.' },
  { area: 'Planning mode', currentStatus: 'design-only / planning review', detail: 'This is a planning-only design review. Not ready for activation.' },
];

// ── v7.24.0-P1: Runtime Authorization Design Fields ──

export interface RuntimeAuthorizationField {
  fieldName: string;
  purpose: string;
  currentStatus: string;
  runtimeEffect: string;
  persistence: string;
  approvalDependency: string;
  stageGate: string;
  blockedActions: string;
  futureRequirement: string;
}

export const RUNTIME_AUTHORIZATION_FIELDS: RuntimeAuthorizationField[] = [
  { fieldName: 'AuthorizationRequest', purpose: '授权请求 — 记录授权操作详情', currentStatus: 'design-only', runtimeEffect: 'none', persistence: 'disabled', approvalDependency: 'future', stageGate: 'Stage C deferred', blockedActions: 'no auth request write/approve/reject', futureRequirement: 'implement auth request + approval flow' },
  { fieldName: 'AuthorizationScope', purpose: '授权范围 — 定义授权的目标域和资源', currentStatus: 'design-only', runtimeEffect: 'none', persistence: 'disabled', approvalDependency: 'future', stageGate: 'Stage C deferred', blockedActions: 'no scope write/mutate', futureRequirement: 'scope selection + validation' },
  { fieldName: 'AuthorizationSubject', purpose: '授权主体 — 定义谁可以发起/审批/执行操作', currentStatus: 'design-only', runtimeEffect: 'none', persistence: 'disabled', approvalDependency: 'future', stageGate: 'Stage C deferred', blockedActions: 'no subject write/assign', futureRequirement: 'subject registry + role binding' },
  { fieldName: 'AuthorizationAction', purpose: '授权动作 — 定义需要授权的具体操作', currentStatus: 'design-only', runtimeEffect: 'none', persistence: 'disabled', approvalDependency: 'future', stageGate: 'Stage C deferred', blockedActions: 'no action execute/write', futureRequirement: 'action catalog + permission mapping' },
  { fieldName: 'AuthorizationRiskClass', purpose: '风险等级 — 定义操作的风险分类', currentStatus: 'design-only', runtimeEffect: 'none', persistence: 'disabled', approvalDependency: 'future', stageGate: 'Stage C deferred', blockedActions: 'no risk class write/bypass', futureRequirement: 'risk scoring + classification engine' },
  { fieldName: 'AuthorizationEvidence', purpose: '授权证据 — 附上审计证据供授权参考', currentStatus: 'design-only', runtimeEffect: 'none', persistence: 'disabled', approvalDependency: 'future', stageGate: 'Stage C deferred', blockedActions: 'no evidence write/upload', futureRequirement: 'evidence bundle + integrity check' },
  { fieldName: 'AuthorizationDecision', purpose: '授权决策 — approve/reject/defer', currentStatus: 'design-only', runtimeEffect: 'none', persistence: 'disabled', approvalDependency: 'future', stageGate: 'Stage C deferred', blockedActions: 'no decision write/execute', futureRequirement: 'decision engine + policy binding' },
  { fieldName: 'AuthorizationExpiry', purpose: '授权过期 — 授权超时自动失效', currentStatus: 'design-only', runtimeEffect: 'none', persistence: 'disabled', approvalDependency: 'future', stageGate: 'Stage C deferred', blockedActions: 'no expiry auto-execute', futureRequirement: 'expiry policy + notification' },
  { fieldName: 'AuthorizationRevocationPolicy', purpose: '撤销策略 — 定义授权撤销条件', currentStatus: 'design-only', runtimeEffect: 'none', persistence: 'disabled', approvalDependency: 'future', stageGate: 'Stage C deferred', blockedActions: 'no revocation write/execute', futureRequirement: 'revocation trigger + audit' },
  { fieldName: 'AuthorizationAuditRecord', purpose: '审计记录 — 完整记录授权全链路', currentStatus: 'design-only', runtimeEffect: 'none', persistence: 'disabled', approvalDependency: 'future', stageGate: 'Stage C deferred', blockedActions: 'no audit write/delete', futureRequirement: 'immutable audit trail' },
  { fieldName: 'AuthorizationFallbackPolicy', purpose: '回退策略 — 授权系统故障时的降级策略', currentStatus: 'design-only', runtimeEffect: 'none', persistence: 'disabled', approvalDependency: 'future', stageGate: 'Stage C deferred', blockedActions: 'no fallback auto-execute', futureRequirement: 'fallback rules + manual override' },
];

// ── v7.24.0-P1: Runtime Permission Entries ──

export interface RuntimePermissionEntry {
  permission: string;
  futurePurpose: string;
  currentValue: string;
  runtimeImplemented: string;
  requiredGate: string;
  blockedAction: string;
  riskIfEnabledPrematurely: string;
}

export const RUNTIME_PERMISSION_ENTRIES: RuntimePermissionEntry[] = [
  { permission: 'canApprove', futurePurpose: '允许审批操作', currentValue: 'false', runtimeImplemented: 'false', requiredGate: 'Stage C + Approval Runtime', blockedAction: 'no approve/approve_candidate', riskIfEnabledPrematurely: 'unauthorized approval without audit' },
  { permission: 'canReject', futurePurpose: '允许拒绝操作', currentValue: 'false', runtimeImplemented: 'false', requiredGate: 'Stage C + Approval Runtime', blockedAction: 'no reject/reject_candidate', riskIfEnabledPrematurely: 'unauthorized rejection without review' },
  { permission: 'canMutate', futurePurpose: '允许变更数据/配置', currentValue: 'false', runtimeImplemented: 'false', requiredGate: 'Stage C + Mutation Runtime', blockedAction: 'no mutate/write/archive', riskIfEnabledPrematurely: 'uncontrolled data mutation' },
  { permission: 'canExecute', futurePurpose: '允许执行操作/运行任务', currentValue: 'false', runtimeImplemented: 'false', requiredGate: 'Stage C + Execution Runtime', blockedAction: 'no run/start/stop/execute', riskIfEnabledPrematurely: 'unvalidated execution' },
  { permission: 'canExternalWrite', futurePurpose: '允许写入外部系统', currentValue: 'false', runtimeImplemented: 'false', requiredGate: 'Stage C + External Write Runtime', blockedAction: 'no external write/push/upload/sync', riskIfEnabledPrematurely: 'uncontrolled external data leak' },
  { permission: 'canDeploy', futurePurpose: '允许部署/发布', currentValue: 'false', runtimeImplemented: 'false', requiredGate: 'Stage C + Deployment Runtime', blockedAction: 'no deploy/release/tag/push', riskIfEnabledPrematurely: 'unreviewed deployment to production' },
  { permission: 'canRollback', futurePurpose: '允许回滚操作', currentValue: 'false', runtimeImplemented: 'false', requiredGate: 'Stage C + Rollback Runtime', blockedAction: 'no rollback/restore/reset/revert', riskIfEnabledPrematurely: 'unrecoverable rollback without plan' },
  { permission: 'canEmergencyStop', futurePurpose: '允许紧急停止服务', currentValue: 'false', runtimeImplemented: 'false', requiredGate: 'Stage C + Emergency Stop Runtime', blockedAction: 'no stop/pause/kill/taskkill/restart', riskIfEnabledPrematurely: 'accidental service shutdown' },
  { permission: 'canWriteAuditEvidence', futurePurpose: '允许写入审计证据', currentValue: 'false', runtimeImplemented: 'false', requiredGate: 'Stage C + Audit Evidence Runtime', blockedAction: 'no evidence write/upload/export/persist', riskIfEnabledPrematurely: 'tampered audit trail' },
  { permission: 'canSyncLANShare', futurePurpose: '允许同步 LAN 共享目录', currentValue: 'false', runtimeImplemented: 'false', requiredGate: 'Stage C + External Write Runtime', blockedAction: 'no LAN sync/share write', riskIfEnabledPrematurely: 'uncontrolled LAN data propagation' },
  { permission: 'canTriggerTraining', futurePurpose: '允许触发训练任务', currentValue: 'false', runtimeImplemented: 'false', requiredGate: 'Stage C + Execution Runtime', blockedAction: 'no training trigger', riskIfEnabledPrematurely: 'unbudgeted training cost' },
  { permission: 'canTriggerInference', futurePurpose: '允许触发推理任务', currentValue: 'false', runtimeImplemented: 'false', requiredGate: 'Stage C + Execution Runtime', blockedAction: 'no inference trigger', riskIfEnabledPrematurely: 'unbudgeted inference cost' },
];

// ── v7.24.0-P1: Operator Roles ──

export interface OperatorRoleEntry {
  role: string;
  futurePurpose: string;
  currentStatus: string;
  runtimePermissions: string;
  writePermissions: string;
  controlPermissions: string;
  scope: string;
}

export const OPERATOR_ROLES: OperatorRoleEntry[] = [
  { role: 'Viewer', futurePurpose: '只读查看所有治理面板和报告', currentStatus: 'design-only', runtimePermissions: '0', writePermissions: '0', controlPermissions: '0', scope: 'readonly review — all gates' },
  { role: 'Reviewer', futurePurpose: '审查治理请求并附上意见', currentStatus: 'design-only', runtimePermissions: '0', writePermissions: '0', controlPermissions: '0', scope: 'review — approval/mutation/execution design' },
  { role: 'Approver', futurePurpose: '审批或拒绝治理请求', currentStatus: 'design-only', runtimePermissions: '0', writePermissions: '0', controlPermissions: '0', scope: 'approve/reject — all gates' },
  { role: 'Operator', futurePurpose: '执行已授权的治理操作', currentStatus: 'design-only', runtimePermissions: '0', writePermissions: '0', controlPermissions: '0', scope: 'execute — mutation/execution/deployment' },
  { role: 'Emergency Operator', futurePurpose: '执行紧急停止和恢复操作', currentStatus: 'design-only', runtimePermissions: '0', writePermissions: '0', controlPermissions: '0', scope: 'emergency stop/rollback/restore' },
  { role: 'Auditor', futurePurpose: '审计所有治理操作记录', currentStatus: 'design-only', runtimePermissions: '0', writePermissions: '0', controlPermissions: '0', scope: 'audit — all gates, readonly' },
  { role: 'Admin', futurePurpose: '管理角色、策略和系统配置', currentStatus: 'design-only', runtimePermissions: '0', writePermissions: '0', controlPermissions: '0', scope: 'admin — role/policy/config, no execution' },
  { role: 'System', futurePurpose: '系统级自动化操作', currentStatus: 'design-only', runtimePermissions: '0', writePermissions: '0', controlPermissions: '0', scope: 'system — automated preflight/dry-run' },
];

// ── v7.24.0-P1: Approval Scope Entries ──

export interface ApprovalScopeEntry {
  scope: string;
  viewer: string;
  reviewer: string;
  approver: string;
  operator: string;
  emergencyOp: string;
  auditor: string;
  admin: string;
  system: string;
}

export const APPROVAL_SCOPE_ENTRIES: ApprovalScopeEntry[] = [
  { scope: 'readonly review', viewer: '✅', reviewer: '✅', approver: '✅', operator: '✅', emergencyOp: '✅', auditor: '✅', admin: '✅', system: '✅' },
  { scope: 'approval design', viewer: '✅', reviewer: '✅', approver: '✅', operator: '—', emergencyOp: '—', auditor: '✅', admin: '✅', system: '—' },
  { scope: 'mutation design', viewer: '✅', reviewer: '✅', approver: '✅', operator: '—', emergencyOp: '—', auditor: '✅', admin: '✅', system: '—' },
  { scope: 'execution design', viewer: '✅', reviewer: '✅', approver: '✅', operator: '—', emergencyOp: '—', auditor: '✅', admin: '✅', system: '—' },
  { scope: 'external write design', viewer: '✅', reviewer: '✅', approver: '✅', operator: '—', emergencyOp: '—', auditor: '✅', admin: '✅', system: '—' },
  { scope: 'deployment design', viewer: '✅', reviewer: '✅', approver: '✅', operator: '—', emergencyOp: '—', auditor: '✅', admin: '✅', system: '—' },
  { scope: 'rollback design', viewer: '✅', reviewer: '✅', approver: '✅', operator: '—', emergencyOp: '—', auditor: '✅', admin: '✅', system: '—' },
  { scope: 'emergency stop design', viewer: '✅', reviewer: '✅', approver: '✅', operator: '—', emergencyOp: '—', auditor: '✅', admin: '✅', system: '—' },
  { scope: 'audit evidence design', viewer: '✅', reviewer: '✅', approver: '✅', operator: '—', emergencyOp: '—', auditor: '✅', admin: '✅', system: '—' },
];

// ── v7.24.0-P1: Activation Preconditions ──

export interface ActivationPreconditionEntry {
  precondition: string;
  category: string;
  currentState: string;
  requiredImplementation: string;
  validationMethod: string;
  riskIfSkipped: string;
  activationImpact: string;
}

export const ACTIVATION_PRECONDITIONS: ActivationPreconditionEntry[] = [
  { precondition: 'Runtime authorization model implementation', category: 'auth', currentState: 'not implemented', requiredImplementation: 'implement approval/reject runtime + permission model', validationMethod: 'integration test + security review', riskIfSkipped: 'unauthorized gate bypass', activationImpact: 'blocking' },
  { precondition: 'Persistent governance state', category: 'persistence', currentState: 'not implemented', requiredImplementation: 'add governance state DB + API', validationMethod: 'data integrity test', riskIfSkipped: 'no audit trail', activationImpact: 'blocking' },
  { precondition: 'Approval storage', category: 'persistence', currentState: 'not implemented', requiredImplementation: 'add approval table + evidence store', validationMethod: 'CRUD test + backup verification', riskIfSkipped: 'no approval record', activationImpact: 'blocking' },
  { precondition: 'Audit evidence persistence', category: 'persistence', currentState: 'not implemented', requiredImplementation: 'add evidence storage + integrity check', validationMethod: 'hash verification + retention test', riskIfSkipped: 'no audit evidence', activationImpact: 'blocking' },
  { precondition: 'Rollback execution path', category: 'runtime', currentState: 'not implemented', requiredImplementation: 'implement rollback runtime engine', validationMethod: 'rollback simulation + restore test', riskIfSkipped: 'unrecoverable deployment failure', activationImpact: 'blocking' },
  { precondition: 'Dry-run engine', category: 'runtime', currentState: 'not implemented', requiredImplementation: 'add dry-run simulation engine', validationMethod: 'simulation accuracy test', riskIfSkipped: 'unvalidated execution', activationImpact: 'blocking' },
  { precondition: 'External write sandbox', category: 'runtime', currentState: 'not implemented', requiredImplementation: 'add external write sandbox + policy engine', validationMethod: 'sandbox isolation test', riskIfSkipped: 'uncontrolled external write', activationImpact: 'blocking' },
  { precondition: 'Emergency stop runtime', category: 'runtime', currentState: 'not implemented', requiredImplementation: 'add emergency stop + service control runtime', validationMethod: 'stop simulation + recovery test', riskIfSkipped: 'no emergency response', activationImpact: 'blocking' },
  { precondition: 'Manual approval policy', category: 'policy', currentState: 'not finalized', requiredImplementation: 'finalize manual approval policy + procedure', validationMethod: 'policy review + drill', riskIfSkipped: 'unclear approval flow', activationImpact: 'delaying' },
  { precondition: 'Security review', category: 'security', currentState: 'not completed', requiredImplementation: 'complete security review + penetration test', validationMethod: 'pen test + vulnerability scan', riskIfSkipped: 'security vulnerability', activationImpact: 'blocking' },
  { precondition: 'Live smoke environment', category: 'qa', currentState: 'not validated', requiredImplementation: 'validate smoke environment + test suite', validationMethod: 'smoke test run', riskIfSkipped: 'undetected integration failure', activationImpact: 'delaying' },
  { precondition: 'Operator training', category: 'ops', currentState: 'not completed', requiredImplementation: 'complete operator training + runbook', validationMethod: 'training completion + drill', riskIfSkipped: 'operator error', activationImpact: 'delaying' },
  { precondition: 'Final activation audit', category: 'audit', currentState: 'not completed', requiredImplementation: 'complete final activation audit + sign-off', validationMethod: 'audit review + sign-off', riskIfSkipped: 'unreviewed activation risk', activationImpact: 'blocking' },
];

// ── v7.24.0-P1: Runtime Control Packages ──

export interface RuntimeControlPackage {
  packageName: string;
  currentStatus: string;
  runtimeControls: string;
  dbWrites: string;
  externalWrites: string;
  serviceControls: string;
  stageGate: string;
  blockedActions: string;
}

export const RUNTIME_CONTROL_PACKAGES: RuntimeControlPackage[] = [
  { packageName: 'Approval Runtime', currentStatus: 'not implemented', runtimeControls: '0', dbWrites: '0', externalWrites: '0', serviceControls: '0', stageGate: 'future activation package', blockedActions: 'no approve/reject/approve_candidate/reject_candidate' },
  { packageName: 'Mutation Runtime', currentStatus: 'not implemented', runtimeControls: '0', dbWrites: '0', externalWrites: '0', serviceControls: '0', stageGate: 'future activation package', blockedActions: 'no mutate/write/archive' },
  { packageName: 'Execution Runtime', currentStatus: 'not implemented', runtimeControls: '0', dbWrites: '0', externalWrites: '0', serviceControls: '0', stageGate: 'future activation package', blockedActions: 'no run/start/stop/execute' },
  { packageName: 'External Write Runtime', currentStatus: 'not implemented', runtimeControls: '0', dbWrites: '0', externalWrites: '0', serviceControls: '0', stageGate: 'future activation package', blockedActions: 'no external write/push/upload/sync' },
  { packageName: 'Deployment Runtime', currentStatus: 'not implemented', runtimeControls: '0', dbWrites: '0', externalWrites: '0', serviceControls: '0', stageGate: 'future activation package', blockedActions: 'no deploy/release/tag/push' },
  { packageName: 'Rollback Runtime', currentStatus: 'not implemented', runtimeControls: '0', dbWrites: '0', externalWrites: '0', serviceControls: '0', stageGate: 'future activation package', blockedActions: 'no rollback/restore/reset/revert' },
  { packageName: 'Emergency Stop Runtime', currentStatus: 'not implemented', runtimeControls: '0', dbWrites: '0', externalWrites: '0', serviceControls: '0', stageGate: 'future activation package', blockedActions: 'no stop/pause/kill/taskkill/restart' },
  { packageName: 'Audit Evidence Runtime', currentStatus: 'not implemented', runtimeControls: '0', dbWrites: '0', externalWrites: '0', serviceControls: '0', stageGate: 'future activation package', blockedActions: 'no evidence write/upload/export/persist' },
  { packageName: 'Authorization Runtime', currentStatus: 'not implemented', runtimeControls: '0', dbWrites: '0', externalWrites: '0', serviceControls: '0', stageGate: 'future activation package', blockedActions: 'no auth write/approve/reject/decide' },
];

// ── v7.24.0-P1: Blocker Resolution Plan ──

export interface BlockerResolutionEntry {
  blocker: string;
  resolutionPackage: string;
  requiredDeliverable: string;
  requiredValidation: string;
  dependency: string;
  targetStatus: string;
}

export const BLOCKER_RESOLUTION_ITEMS: BlockerResolutionEntry[] = [
  { blocker: 'Runtime authorization model', resolutionPackage: 'v7.24.x Authorization Runtime', requiredDeliverable: 'authorization request + decision engine', requiredValidation: 'auth flow integration test + security review', dependency: 'v7.24.0-P1 design', targetStatus: 'future' },
  { blocker: 'Persistent governance state', resolutionPackage: 'v7.24.x Governance Persistence', requiredDeliverable: 'governance state DB schema + API', requiredValidation: 'data integrity + migration test', dependency: 'v7.24.0-P1 design', targetStatus: 'future' },
  { blocker: 'Approval storage', resolutionPackage: 'v7.24.x Governance Persistence', requiredDeliverable: 'approval table + evidence store', requiredValidation: 'CRUD + backup test', dependency: 'governance state', targetStatus: 'future' },
  { blocker: 'Audit evidence persistence', resolutionPackage: 'v7.24.x Audit Runtime', requiredDeliverable: 'evidence storage + integrity hash', requiredValidation: 'hash verification + retention test', dependency: 'governance state', targetStatus: 'future' },
  { blocker: 'Rollback execution path', resolutionPackage: 'v7.24.x Rollback Runtime', requiredDeliverable: 'rollback engine + restore verification', requiredValidation: 'rollback simulation + restore test', dependency: 'Deployment Runtime', targetStatus: 'future' },
  { blocker: 'Dry-run engine', resolutionPackage: 'v7.24.x Execution Runtime', requiredDeliverable: 'dry-run simulation + result summary', requiredValidation: 'simulation accuracy test', dependency: 'Authorization Runtime', targetStatus: 'future' },
  { blocker: 'External write sandbox', resolutionPackage: 'v7.24.x External Write Runtime', requiredDeliverable: 'write sandbox + policy engine', requiredValidation: 'sandbox isolation test', dependency: 'Authorization Runtime', targetStatus: 'future' },
  { blocker: 'Emergency stop runtime', resolutionPackage: 'v7.24.x Emergency Stop Runtime', requiredDeliverable: 'stop engine + recovery procedure', requiredValidation: 'stop simulation + recovery test', dependency: 'Authorization Runtime', targetStatus: 'future' },
  { blocker: 'Manual approval policy', resolutionPackage: 'v7.24.x Policy Package', requiredDeliverable: 'approval policy document + procedure', requiredValidation: 'policy review + drill', dependency: 'Authorization Runtime', targetStatus: 'future' },
  { blocker: 'Security review', resolutionPackage: 'v7.24.x Security Package', requiredDeliverable: 'security audit report + pen test results', requiredValidation: 'pen test + vulnerability scan', dependency: 'all runtime packages', targetStatus: 'future' },
  { blocker: 'Live smoke environment', resolutionPackage: 'v7.24.x QA Package', requiredDeliverable: 'smoke test suite + environment', requiredValidation: 'smoke test run', dependency: 'all runtime packages', targetStatus: 'future' },
  { blocker: 'Operator training', resolutionPackage: 'v7.24.x Ops Package', requiredDeliverable: 'training materials + runbook', requiredValidation: 'training completion + drill', dependency: 'all runtime packages', targetStatus: 'future' },
  { blocker: 'Final activation audit', resolutionPackage: 'v7.24.x Audit Package', requiredDeliverable: 'activation audit report + sign-off', requiredValidation: 'audit review + sign-off', dependency: 'all preconditions met', targetStatus: 'future' },
];

// ── v7.24.0-P1: Authorization Evidence Types ──

export interface AuthorizationEvidenceType {
  evidence: string;
  purpose: string;
  currentStatus: string;
}

export const AUTHORIZATION_EVIDENCE_TYPES: AuthorizationEvidenceType[] = [
  { evidence: 'Operator identity evidence', purpose: '操作人员身份验证证据', currentStatus: 'design-only' },
  { evidence: 'Scope evidence', purpose: '授权范围证明', currentStatus: 'design-only' },
  { evidence: 'Risk evidence', purpose: '风险评估报告', currentStatus: 'design-only' },
  { evidence: 'Approval chain evidence', purpose: '审批链完整性证明', currentStatus: 'design-only' },
  { evidence: 'Preflight evidence', purpose: '预检结果', currentStatus: 'design-only' },
  { evidence: 'Dry-run evidence', purpose: 'Dry-run 模拟执行结果', currentStatus: 'design-only' },
  { evidence: 'Rollback evidence', purpose: '回滚计划', currentStatus: 'design-only' },
  { evidence: 'Secret scan evidence', purpose: '密钥扫描结果', currentStatus: 'design-only' },
  { evidence: 'DB doctor evidence', purpose: '数据库健康检查结果', currentStatus: 'design-only' },
  { evidence: 'Smoke evidence', purpose: '冒烟测试状态', currentStatus: 'design-only' },
  { evidence: 'Manual note evidence', purpose: '人工审查备注', currentStatus: 'design-only' },
];
