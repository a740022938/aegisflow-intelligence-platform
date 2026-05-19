// Audit Log Preview Registry — static readonly model for future audit events
// Does not write audit logs, call APIs, write to databases, or control external tools.

export type AuditEventSource =
  | 'runtime_registry'
  | 'dry_run_plan'
  | 'permission_evaluator'
  | 'connector_center'
  | 'advanced_hub'
  | 'governance_center'
  | 'git'
  | 'database'
  | 'external_tool'
  | 'stage_c';

export type AuditEventType =
  | 'view'
  | 'plan_generated'
  | 'dry_run_preview'
  | 'permission_evaluated'
  | 'human_approval_required'
  | 'blocked_action'
  | 'external_control_attempt'
  | 'db_write_attempt'
  | 'stage_c_transition_attempt'
  | 'tag_release_attempt';

export type AuditEventRisk = 'low' | 'medium' | 'high' | 'critical';

export type AuditRetentionClass =
  | 'ephemeral_preview'
  | 'report_only'
  | 'future_db_audit'
  | 'blocked_no_write';

export interface AuditLogPreviewItem {
  id: string;
  label: string;
  source: AuditEventSource;
  eventType: AuditEventType;
  risk: AuditEventRisk;
  retentionClass: AuditRetentionClass;
  writeNow: boolean;
  allowedNow: boolean;
  requiresDbWrite: boolean;
  requiresExternalControl: boolean;
  requiresStageC: boolean;
  requiresHumanApproval: boolean;
  relatedRuntimeTarget?: string;
  relatedDryRunPlan?: string;
  relatedPermissionRule?: string;
  previewPayloadFields: string[];
  redactedFields: string[];
  blockedActions: string[];
  gates: string[];
  reason: string;
  nextAction: string;
}

export const AUDIT_LOG_PREVIEW_ITEMS: AuditLogPreviewItem[] = [
  {
    id: 'runtime-registry-view',
    label: 'Runtime Registry 查看事件',
    source: 'runtime_registry',
    eventType: 'view',
    risk: 'low',
    retentionClass: 'ephemeral_preview',
    writeNow: false,
    allowedNow: true,
    requiresDbWrite: false,
    requiresExternalControl: false,
    requiresStageC: false,
    requiresHumanApproval: false,
    previewPayloadFields: ['targetId', 'actionLevel', 'risk', 'gates'],
    redactedFields: [],
    blockedActions: [],
    gates: ['readonly_only'],
    reason: 'Runtime registry view events are low-risk read-only access. No audit logging needed at this stage.',
    nextAction: 'Keep readonly. No audit write required.',
  },
  {
    id: 'dry-run-plan-view',
    label: 'Dry-run Plan 查看事件',
    source: 'dry_run_plan',
    eventType: 'view',
    risk: 'low',
    retentionClass: 'ephemeral_preview',
    writeNow: false,
    allowedNow: true,
    requiresDbWrite: false,
    requiresExternalControl: false,
    requiresStageC: false,
    requiresHumanApproval: false,
    previewPayloadFields: ['planId', 'mode', 'risk', 'target'],
    redactedFields: [],
    blockedActions: [],
    gates: ['readonly_only'],
    reason: 'Dry-run plan view events are low-risk. No audit logging needed.',
    nextAction: 'Keep readonly. No audit write required.',
  },
  {
    id: 'dry-run-plan-generated-preview',
    label: 'Dry-run Plan 生成预览事件',
    source: 'dry_run_plan',
    eventType: 'plan_generated',
    risk: 'medium',
    retentionClass: 'future_db_audit',
    writeNow: false,
    allowedNow: false,
    requiresDbWrite: true,
    requiresExternalControl: false,
    requiresStageC: false,
    requiresHumanApproval: false,
    relatedDryRunPlan: 'dry-run-plan-view',
    previewPayloadFields: ['planId', 'target', 'mode', 'generatedAt', 'generatedBy'],
    redactedFields: ['generatedBy'],
    blockedActions: ['write_audit_log', 'store_in_db', 'persist_event'],
    gates: ['no_db_write', 'readonly_only'],
    reason: 'Plan generation events require DB write for audit logging. DB write is currently denied.',
    nextAction: 'Keep blocked. Re-evaluate when audit DB is available.',
  },
  {
    id: 'permission-evaluator-view',
    label: 'Permission Evaluator 查看事件',
    source: 'permission_evaluator',
    eventType: 'view',
    risk: 'low',
    retentionClass: 'ephemeral_preview',
    writeNow: false,
    allowedNow: true,
    requiresDbWrite: false,
    requiresExternalControl: false,
    requiresStageC: false,
    requiresHumanApproval: false,
    previewPayloadFields: ['ruleId', 'decision', 'risk', 'severity'],
    redactedFields: [],
    blockedActions: [],
    gates: ['readonly_only'],
    reason: 'Permission evaluator view events are low-risk. No audit logging needed.',
    nextAction: 'Keep readonly. No audit write required.',
  },
  {
    id: 'permission-rule-evaluated',
    label: '权限规则评估事件',
    source: 'permission_evaluator',
    eventType: 'permission_evaluated',
    risk: 'medium',
    retentionClass: 'future_db_audit',
    writeNow: false,
    allowedNow: false,
    requiresDbWrite: true,
    requiresExternalControl: false,
    requiresStageC: false,
    requiresHumanApproval: false,
    relatedPermissionRule: 'permission-evaluator-view',
    previewPayloadFields: ['ruleId', 'decision', 'risk', 'severity', 'evaluatedAt', 'matchedGates'],
    redactedFields: [],
    blockedActions: ['write_audit_log', 'store_in_db'],
    gates: ['no_db_write', 'readonly_only'],
    reason: 'Rule evaluation events require DB write for audit trail. DB write is denied.',
    nextAction: 'Keep blocked. Re-evaluate when audit DB is available.',
  },
  {
    id: 'connector-center-runtime-snapshot-view',
    label: 'Connector Center 运行时快照查看',
    source: 'connector_center',
    eventType: 'view',
    risk: 'low',
    retentionClass: 'ephemeral_preview',
    writeNow: false,
    allowedNow: true,
    requiresDbWrite: false,
    requiresExternalControl: false,
    requiresStageC: false,
    requiresHumanApproval: false,
    previewPayloadFields: ['connectorId', 'status', 'risk', 'readiness'],
    redactedFields: [],
    blockedActions: [],
    gates: ['readonly_only'],
    reason: 'Connector center snapshot view is low-risk. No audit logging needed.',
    nextAction: 'Keep readonly. No audit write required.',
  },
  {
    id: 'advanced-hub-runtime-link-view',
    label: 'Advanced Hub 运行时链接查看',
    source: 'advanced_hub',
    eventType: 'view',
    risk: 'low',
    retentionClass: 'ephemeral_preview',
    writeNow: false,
    allowedNow: true,
    requiresDbWrite: false,
    requiresExternalControl: false,
    requiresStageC: false,
    requiresHumanApproval: false,
    previewPayloadFields: ['summaryType', 'targetCount', 'riskLevels'],
    redactedFields: [],
    blockedActions: [],
    gates: ['readonly_only'],
    reason: 'Advanced hub runtime link view is low-risk. No audit logging needed.',
    nextAction: 'Keep readonly. No audit write required.',
  },
  {
    id: 'human-approval-required-preview',
    label: '需人工批准事件预览',
    source: 'governance_center',
    eventType: 'human_approval_required',
    risk: 'high',
    retentionClass: 'future_db_audit',
    writeNow: false,
    allowedNow: false,
    requiresDbWrite: true,
    requiresExternalControl: false,
    requiresStageC: false,
    requiresHumanApproval: true,
    previewPayloadFields: ['approvalId', 'requestType', 'requestedAction', 'requestedAt', 'requestedBy', 'riskLevel'],
    redactedFields: ['requestedBy'],
    blockedActions: ['write_audit_log', 'store_in_db', 'approve', 'reject'],
    gates: ['no_db_write', 'readonly_only', 'human_approval_required'],
    reason: 'Human approval events require DB write and approval system. Both are denied.',
    nextAction: 'Keep blocked. Re-evaluate when audit DB and approval system are available.',
  },
  {
    id: 'blocked-external-control-attempt',
    label: '外部工具控制阻断事件',
    source: 'external_tool',
    eventType: 'blocked_action',
    risk: 'critical',
    retentionClass: 'blocked_no_write',
    writeNow: false,
    allowedNow: false,
    requiresDbWrite: false,
    requiresExternalControl: true,
    requiresStageC: false,
    requiresHumanApproval: false,
    previewPayloadFields: ['toolName', 'action', 'attemptedAt', 'blockedBy'],
    redactedFields: [],
    blockedActions: ['control_external_tool', 'write_audit_log'],
    gates: ['no_external_control', 'readonly_only', 'stage_c_disabled'],
    reason: 'External control is permanently denied. Blocked action events are preview only.',
    nextAction: 'Keep blocked. Do not allow external control.',
  },
  {
    id: 'blocked-db-write-attempt',
    label: '数据库写入阻断事件',
    source: 'database',
    eventType: 'db_write_attempt',
    risk: 'critical',
    retentionClass: 'blocked_no_write',
    writeNow: false,
    allowedNow: false,
    requiresDbWrite: true,
    requiresExternalControl: false,
    requiresStageC: false,
    requiresHumanApproval: false,
    previewPayloadFields: ['targetTable', 'operation', 'attemptedAt', 'blockedBy'],
    redactedFields: [],
    blockedActions: ['write_database', 'write_audit_log'],
    gates: ['no_db_write', 'readonly_only'],
    reason: 'DB write is permanently denied. Blocked action events are preview only.',
    nextAction: 'Keep blocked. Do not allow DB write.',
  },
  {
    id: 'blocked-stage-c-transition-attempt',
    label: 'Stage C 转态阻断事件',
    source: 'stage_c',
    eventType: 'stage_c_transition_attempt',
    risk: 'critical',
    retentionClass: 'blocked_no_write',
    writeNow: false,
    allowedNow: false,
    requiresDbWrite: false,
    requiresExternalControl: false,
    requiresStageC: true,
    requiresHumanApproval: true,
    previewPayloadFields: ['targetState', 'transitionType', 'attemptedAt', 'blockedBy'],
    redactedFields: [],
    blockedActions: ['enable_stage_c', 'write_audit_log', 'transition_state'],
    gates: ['stage_c_disabled', 'readonly_only', 'human_approval_required'],
    reason: 'Stage C is permanently disabled. Blocked transition events are preview only.',
    nextAction: 'Keep blocked. Stage C remains disabled.',
  },
  {
    id: 'blocked-tag-release-attempt',
    label: '标签发布阻断事件',
    source: 'git',
    eventType: 'tag_release_attempt',
    risk: 'high',
    retentionClass: 'blocked_no_write',
    writeNow: false,
    allowedNow: false,
    requiresDbWrite: false,
    requiresExternalControl: false,
    requiresStageC: false,
    requiresHumanApproval: true,
    previewPayloadFields: ['tagName', 'releaseType', 'attemptedAt', 'blockedBy'],
    redactedFields: [],
    blockedActions: ['create_tag', 'create_release', 'write_audit_log'],
    gates: ['human_approval_required', 'readonly_only'],
    reason: 'Tag and release require human approval. Blocked events are preview only.',
    nextAction: 'Keep blocked. Re-evaluate with human approval process.',
  },
  {
    id: 'blocked-candidate-process-attempt',
    label: 'Memory Hub Candidate 处理阻断事件',
    source: 'governance_center',
    eventType: 'blocked_action',
    risk: 'high',
    retentionClass: 'blocked_no_write',
    writeNow: false,
    allowedNow: false,
    requiresDbWrite: true,
    requiresExternalControl: false,
    requiresStageC: false,
    requiresHumanApproval: true,
    previewPayloadFields: ['candidateId', 'operation', 'attemptedAt', 'blockedBy'],
    redactedFields: ['candidateId'],
    blockedActions: ['process_candidate', 'write_database', 'write_audit_log'],
    gates: ['no_db_write', 'readonly_only', 'human_approval_required'],
    reason: 'Candidate processing requires DB write and human approval. Both are denied.',
    nextAction: 'Keep blocked. Re-evaluate with DB write and approval system.',
  },
  {
    id: 'git-commit-push-report-only',
    label: 'Git 提交推送事件（仅报告）',
    source: 'git',
    eventType: 'view',
    risk: 'low',
    retentionClass: 'report_only',
    writeNow: false,
    allowedNow: true,
    requiresDbWrite: false,
    requiresExternalControl: false,
    requiresStageC: false,
    requiresHumanApproval: false,
    previewPayloadFields: ['commitHash', 'branch', 'message', 'committedAt'],
    redactedFields: [],
    blockedActions: [],
    gates: ['readonly_only'],
    reason: 'Git commit/push events are report-only. No audit logging needed at this stage.',
    nextAction: 'Keep readonly. No audit write required.',
  },
  {
    id: 'git-tag-release-blocked',
    label: 'Git 标签发布阻断（审计预览）',
    source: 'git',
    eventType: 'tag_release_attempt',
    risk: 'high',
    retentionClass: 'blocked_no_write',
    writeNow: false,
    allowedNow: false,
    requiresDbWrite: false,
    requiresExternalControl: false,
    requiresStageC: false,
    requiresHumanApproval: true,
    previewPayloadFields: ['tagName', 'targetCommit', 'releaseType', 'attemptedAt'],
    redactedFields: [],
    blockedActions: ['create_tag', 'create_release', 'write_audit_log'],
    gates: ['human_approval_required', 'readonly_only'],
    reason: 'Tag and release require human approval. Preview only.',
    nextAction: 'Keep blocked. Re-evaluate with human approval process.',
  },
  {
    id: 'memory-hub-candidate-review-preview',
    label: 'Memory Hub Candidate 评审预览',
    source: 'governance_center',
    eventType: 'view',
    risk: 'low',
    retentionClass: 'ephemeral_preview',
    writeNow: false,
    allowedNow: true,
    requiresDbWrite: false,
    requiresExternalControl: false,
    requiresStageC: false,
    requiresHumanApproval: false,
    previewPayloadFields: ['candidateId', 'summary', 'risk', 'score'],
    redactedFields: ['candidateId'],
    blockedActions: [],
    gates: ['readonly_only'],
    reason: 'Candidate review preview is low-risk read-only. No audit logging needed.',
    nextAction: 'Keep readonly. No audit write required.',
  },
  {
    id: 'comfyui-dry-run-preview-blocked',
    label: 'ComfyUI Dry-run 预览阻断事件',
    source: 'connector_center',
    eventType: 'dry_run_preview',
    risk: 'high',
    retentionClass: 'blocked_no_write',
    writeNow: false,
    allowedNow: false,
    requiresDbWrite: false,
    requiresExternalControl: true,
    requiresStageC: false,
    requiresHumanApproval: false,
    relatedDryRunPlan: 'dry-run-plan-view',
    previewPayloadFields: ['connectorId', 'workflowType', 'previewStatus', 'blockedReason'],
    redactedFields: [],
    blockedActions: ['control_external_tool', 'execute_dry_run', 'write_audit_log'],
    gates: ['no_external_control', 'readonly_only', 'stage_c_disabled'],
    reason: 'ComfyUI dry-run is blocked. Requires external control which is permanently denied.',
    nextAction: 'Keep blocked. Do not allow external control.',
  },
  {
    id: 'openclaw-task-package-preview-audit',
    label: 'OpenClaw 任务包预览审计事件',
    source: 'connector_center',
    eventType: 'plan_generated',
    risk: 'medium',
    retentionClass: 'future_db_audit',
    writeNow: false,
    allowedNow: false,
    requiresDbWrite: true,
    requiresExternalControl: false,
    requiresStageC: false,
    requiresHumanApproval: false,
    relatedDryRunPlan: 'dry-run-plan-view',
    previewPayloadFields: ['taskId', 'packageType', 'generatedAt', 'fileCount', 'targetConnector'],
    redactedFields: ['taskId'],
    blockedActions: ['write_audit_log', 'store_in_db'],
    gates: ['no_db_write', 'readonly_only'],
    reason: 'Task package preview events require DB write for audit. DB write is denied.',
    nextAction: 'Keep blocked. Re-evaluate when audit DB is available.',
  },
];

export function getAuditLogPreviewCount(): number {
  return AUDIT_LOG_PREVIEW_ITEMS.length;
}

export function getAuditLogPreviewBySource(source: AuditEventSource): AuditLogPreviewItem[] {
  return AUDIT_LOG_PREVIEW_ITEMS.filter(item => item.source === source);
}

export function getAuditLogPreviewByRisk(risk: AuditEventRisk): AuditLogPreviewItem[] {
  return AUDIT_LOG_PREVIEW_ITEMS.filter(item => item.risk === risk);
}

export function getAuditLogPreviewBlockedItems(): AuditLogPreviewItem[] {
  return AUDIT_LOG_PREVIEW_ITEMS.filter(item => !item.allowedNow);
}

export function getAuditLogPreviewWriteNowItems(): AuditLogPreviewItem[] {
  return AUDIT_LOG_PREVIEW_ITEMS.filter(item => item.writeNow);
}

export function getAuditLogPreviewSummary(): {
  total: number;
  allowedNow: number;
  writeNow: number;
  blocked: number;
  highOrCritical: number;
  requiresDbWrite: number;
  requiresExternalControl: number;
  requiresStageC: number;
  requiresHumanApproval: number;
} {
  return {
    total: AUDIT_LOG_PREVIEW_ITEMS.length,
    allowedNow: AUDIT_LOG_PREVIEW_ITEMS.filter(p => p.allowedNow).length,
    writeNow: AUDIT_LOG_PREVIEW_ITEMS.filter(p => p.writeNow).length,
    blocked: AUDIT_LOG_PREVIEW_ITEMS.filter(p => !p.allowedNow).length,
    highOrCritical: AUDIT_LOG_PREVIEW_ITEMS.filter(p => p.risk === 'high' || p.risk === 'critical').length,
    requiresDbWrite: AUDIT_LOG_PREVIEW_ITEMS.filter(p => p.requiresDbWrite).length,
    requiresExternalControl: AUDIT_LOG_PREVIEW_ITEMS.filter(p => p.requiresExternalControl).length,
    requiresStageC: AUDIT_LOG_PREVIEW_ITEMS.filter(p => p.requiresStageC).length,
    requiresHumanApproval: AUDIT_LOG_PREVIEW_ITEMS.filter(p => p.requiresHumanApproval).length,
  };
}
