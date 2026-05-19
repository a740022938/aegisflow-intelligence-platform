// Human Approval Registry — static readonly model for approval workflow preview
// Does not create approval queue, process candidates, execute actions, write DB, or control external tools.

export type ApprovalRequestKind =
  | 'runtime_preview'
  | 'dry_run_preview'
  | 'audit_preview'
  | 'permission_review'
  | 'governance_transition'
  | 'candidate_review'
  | 'external_control'
  | 'db_write'
  | 'stage_c_transition'
  | 'tag_release';

export type ApprovalState =
  | 'draft'
  | 'preview_only'
  | 'pending_human_review'
  | 'approved_for_preview'
  | 'approved_for_dry_run'
  | 'approved_for_execution'
  | 'rejected'
  | 'expired'
  | 'revoked'
  | 'blocked';

export type ApprovalDecision =
  | 'view_only'
  | 'request_review'
  | 'approve_preview'
  | 'approve_dry_run'
  | 'approve_execution'
  | 'reject'
  | 'expire'
  | 'revoke'
  | 'block';

export type ApprovalRisk = 'low' | 'medium' | 'high' | 'critical';

export interface HumanApprovalWorkflowItem {
  id: string;
  label: string;
  requestKind: ApprovalRequestKind;
  currentState: ApprovalState;
  decision: ApprovalDecision;
  risk: ApprovalRisk;
  allowedNow: boolean;
  createsQueueItem: boolean;
  processesCandidate: boolean;
  executesAction: boolean;
  writesDb: boolean;
  controlsExternalTool: boolean;
  requiresStageC: boolean;
  requiresAuditLog: boolean;
  requiresEvidence: boolean;
  requiresRollbackPlan: boolean;
  requiredEvidence: string[];
  blockedActions: string[];
  gates: string[];
  reason: string;
  nextAction: string;
}

export const HUMAN_APPROVAL_WORKFLOW_ITEMS: HumanApprovalWorkflowItem[] = [
  {
    id: 'runtime-preview-view',
    label: 'Runtime Registry Preview View',
    requestKind: 'runtime_preview',
    currentState: 'preview_only',
    decision: 'view_only',
    risk: 'low',
    allowedNow: true,
    createsQueueItem: false,
    processesCandidate: false,
    executesAction: false,
    writesDb: false,
    controlsExternalTool: false,
    requiresStageC: false,
    requiresAuditLog: false,
    requiresEvidence: false,
    requiresRollbackPlan: false,
    requiredEvidence: [],
    blockedActions: ['enable_stage_c', 'write_database', 'control_external_tools', 'execute_runtime'],
    gates: ['readonly_only'],
    reason: 'Runtime Registry Preview is a readonly view. No approval needed for read-only access.',
    nextAction: 'Keep preview. Do not add runtime execution.',
  },
  {
    id: 'dry-run-preview-view',
    label: 'Dry-Run Plan Preview View',
    requestKind: 'dry_run_preview',
    currentState: 'preview_only',
    decision: 'view_only',
    risk: 'low',
    allowedNow: true,
    createsQueueItem: false,
    processesCandidate: false,
    executesAction: false,
    writesDb: false,
    controlsExternalTool: false,
    requiresStageC: false,
    requiresAuditLog: false,
    requiresEvidence: false,
    requiresRollbackPlan: false,
    requiredEvidence: [],
    blockedActions: ['enable_stage_c', 'write_database', 'execute_dry_run', 'control_external_tools'],
    gates: ['readonly_only'],
    reason: 'Dry-Run Plan Preview is a readonly view. No approval needed for read-only access.',
    nextAction: 'Keep preview. Do not add dry-run execution.',
  },
  {
    id: 'audit-preview-view',
    label: 'Audit Log Preview View',
    requestKind: 'audit_preview',
    currentState: 'preview_only',
    decision: 'view_only',
    risk: 'low',
    allowedNow: true,
    createsQueueItem: false,
    processesCandidate: false,
    executesAction: false,
    writesDb: false,
    controlsExternalTool: false,
    requiresStageC: false,
    requiresAuditLog: false,
    requiresEvidence: false,
    requiresRollbackPlan: false,
    requiredEvidence: [],
    blockedActions: ['enable_stage_c', 'write_database', 'write_audit_log', 'control_external_tools'],
    gates: ['readonly_only'],
    reason: 'Audit Log Preview is a readonly view. No approval needed for read-only access.',
    nextAction: 'Keep preview. Do not add audit log writes.',
  },
  {
    id: 'permission-review-view',
    label: 'Permission Evaluator Preview View',
    requestKind: 'permission_review',
    currentState: 'preview_only',
    decision: 'view_only',
    risk: 'low',
    allowedNow: true,
    createsQueueItem: false,
    processesCandidate: false,
    executesAction: false,
    writesDb: false,
    controlsExternalTool: false,
    requiresStageC: false,
    requiresAuditLog: false,
    requiresEvidence: false,
    requiresRollbackPlan: false,
    requiredEvidence: [],
    blockedActions: ['enable_stage_c', 'write_database', 'execute_permission', 'control_external_tools'],
    gates: ['readonly_only'],
    reason: 'Permission Evaluator Preview is a readonly view. No approval needed for read-only access.',
    nextAction: 'Keep preview. Do not add permission execution.',
  },
  {
    id: 'governance-transition-view',
    label: 'Governance State Machine Preview View',
    requestKind: 'governance_transition',
    currentState: 'preview_only',
    decision: 'view_only',
    risk: 'low',
    allowedNow: true,
    createsQueueItem: false,
    processesCandidate: false,
    executesAction: false,
    writesDb: false,
    controlsExternalTool: false,
    requiresStageC: false,
    requiresAuditLog: false,
    requiresEvidence: false,
    requiresRollbackPlan: false,
    requiredEvidence: [],
    blockedActions: ['enable_stage_c', 'write_database', 'execute_state_transition', 'control_external_tools'],
    gates: ['readonly_only'],
    reason: 'Governance State Machine Preview is a readonly view. No approval needed for read-only access.',
    nextAction: 'Keep preview. Do not add state transitions.',
  },
  {
    id: 'request-human-review-preview',
    label: 'Request Human Review (Preview)',
    requestKind: 'governance_transition',
    currentState: 'pending_human_review',
    decision: 'request_review',
    risk: 'low',
    allowedNow: true,
    createsQueueItem: false,
    processesCandidate: false,
    executesAction: false,
    writesDb: false,
    controlsExternalTool: false,
    requiresStageC: false,
    requiresAuditLog: false,
    requiresEvidence: true,
    requiresRollbackPlan: false,
    requiredEvidence: ['registry_snapshot', 'validator_summary'],
    blockedActions: ['enable_stage_c', 'write_database', 'execute_action', 'control_external_tools'],
    gates: ['readonly_only', 'no_queue_creation'],
    reason: 'Requesting human review is a preview concept. No real queue item is created. No action is executed.',
    nextAction: 'Keep preview only. Do not implement approval queue.',
  },
  {
    id: 'request-dry-run-approval-preview',
    label: 'Request Dry-Run Approval (Preview)',
    requestKind: 'dry_run_preview',
    currentState: 'pending_human_review',
    decision: 'approve_dry_run',
    risk: 'medium',
    allowedNow: false,
    createsQueueItem: false,
    processesCandidate: false,
    executesAction: false,
    writesDb: false,
    controlsExternalTool: false,
    requiresStageC: false,
    requiresAuditLog: true,
    requiresEvidence: true,
    requiresRollbackPlan: true,
    requiredEvidence: ['registry_snapshot', 'dry_run_plan', 'validator_summary'],
    blockedActions: ['execute_dry_run', 'write_database', 'enable_stage_c'],
    gates: ['readonly_only', 'no_approval_queue', 'no_dry_run_execution'],
    reason: 'Dry-run approval is a preview concept. No real approval is processed. No dry-run is executed.',
    nextAction: 'Keep blocked. Do not enable dry-run approval.',
  },
  {
    id: 'request-execution-approval-blocked',
    label: 'Request Execution Approval (Blocked)',
    requestKind: 'governance_transition',
    currentState: 'blocked',
    decision: 'approve_execution',
    risk: 'critical',
    allowedNow: false,
    createsQueueItem: true,
    processesCandidate: false,
    executesAction: true,
    writesDb: true,
    controlsExternalTool: true,
    requiresStageC: true,
    requiresAuditLog: true,
    requiresEvidence: true,
    requiresRollbackPlan: true,
    requiredEvidence: ['registry_snapshot', 'dry_run_plan', 'audit_preview', 'human_note', 'validator_summary'],
    blockedActions: ['execute_action', 'write_database', 'control_external_tools', 'enable_stage_c', 'create_queue'],
    gates: ['stage_c_disabled', 'no_db_write', 'no_external_control', 'no_approval_queue', 'no_candidate_processing'],
    reason: 'Execution approval requires Stage C, DB write, external control, and approval queue — all disabled in current version.',
    nextAction: 'Keep blocked. Do not enable execution approval.',
  },
  {
    id: 'approve-preview-readonly',
    label: 'Approve Preview (Readonly)',
    requestKind: 'governance_transition',
    currentState: 'approved_for_preview',
    decision: 'approve_preview',
    risk: 'low',
    allowedNow: true,
    createsQueueItem: false,
    processesCandidate: false,
    executesAction: false,
    writesDb: false,
    controlsExternalTool: false,
    requiresStageC: false,
    requiresAuditLog: false,
    requiresEvidence: false,
    requiresRollbackPlan: false,
    requiredEvidence: [],
    blockedActions: ['enable_stage_c', 'write_database', 'execute_action', 'control_external_tools', 'create_queue'],
    gates: ['readonly_only', 'no_approval_queue'],
    reason: 'Preview approval is a readonly concept. No queue item, no action execution, no DB write.',
    nextAction: 'Keep readonly. Do not enable real approval.',
  },
  {
    id: 'approve-dry-run-blocked',
    label: 'Approve Dry-Run (Blocked)',
    requestKind: 'dry_run_preview',
    currentState: 'approved_for_dry_run',
    decision: 'approve_dry_run',
    risk: 'high',
    allowedNow: false,
    createsQueueItem: false,
    processesCandidate: false,
    executesAction: true,
    writesDb: false,
    controlsExternalTool: false,
    requiresStageC: false,
    requiresAuditLog: true,
    requiresEvidence: true,
    requiresRollbackPlan: true,
    requiredEvidence: ['dry_run_plan', 'validator_summary', 'human_note'],
    blockedActions: ['execute_dry_run', 'write_database', 'enable_stage_c', 'control_external_tools'],
    gates: ['readonly_only', 'no_dry_run_execution', 'no_approval_queue'],
    reason: 'Dry-run approval would execute a dry-run action. Not implemented in current version.',
    nextAction: 'Keep blocked. Do not enable dry-run approval.',
  },
  {
    id: 'approve-execution-blocked',
    label: 'Approve Execution (Blocked)',
    requestKind: 'governance_transition',
    currentState: 'blocked',
    decision: 'approve_execution',
    risk: 'critical',
    allowedNow: false,
    createsQueueItem: true,
    processesCandidate: false,
    executesAction: true,
    writesDb: true,
    controlsExternalTool: true,
    requiresStageC: true,
    requiresAuditLog: true,
    requiresEvidence: true,
    requiresRollbackPlan: true,
    requiredEvidence: ['registry_snapshot', 'dry_run_plan', 'audit_preview', 'human_note', 'validator_summary', 'rollback_plan'],
    blockedActions: ['execute_action', 'write_database', 'control_external_tools', 'enable_stage_c', 'create_queue', 'modify_sidebar'],
    gates: ['stage_c_disabled', 'no_db_write', 'no_external_control', 'no_approval_queue', 'no_candidate_processing', 'no_execution'],
    reason: 'Execution approval requires Stage C, DB write, external control, and queue + candidate processing — all disabled.',
    nextAction: 'Keep blocked. Do not enable execution approval.',
  },
  {
    id: 'reject-candidate-blocked',
    label: 'Reject Candidate (Blocked)',
    requestKind: 'candidate_review',
    currentState: 'blocked',
    decision: 'reject',
    risk: 'high',
    allowedNow: false,
    createsQueueItem: false,
    processesCandidate: true,
    executesAction: false,
    writesDb: true,
    controlsExternalTool: false,
    requiresStageC: false,
    requiresAuditLog: true,
    requiresEvidence: true,
    requiresRollbackPlan: false,
    requiredEvidence: ['human_note', 'validator_summary'],
    blockedActions: ['process_candidate', 'write_database', 'enable_stage_c', 'modify_state'],
    gates: ['no_candidate_processing', 'no_db_write', 'stage_c_disabled'],
    reason: 'Candidate rejection requires candidate processing and DB write — both disabled in current version.',
    nextAction: 'Keep blocked. Do not enable candidate processing.',
  },
  {
    id: 'archive-candidate-blocked',
    label: 'Archive Candidate (Blocked)',
    requestKind: 'candidate_review',
    currentState: 'blocked',
    decision: 'reject',
    risk: 'high',
    allowedNow: false,
    createsQueueItem: false,
    processesCandidate: true,
    executesAction: false,
    writesDb: true,
    controlsExternalTool: false,
    requiresStageC: false,
    requiresAuditLog: true,
    requiresEvidence: true,
    requiresRollbackPlan: false,
    requiredEvidence: ['human_note', 'validator_summary'],
    blockedActions: ['process_candidate', 'write_database', 'enable_stage_c', 'modify_state'],
    gates: ['no_candidate_processing', 'no_db_write', 'stage_c_disabled'],
    reason: 'Candidate archiving requires candidate processing and DB write — both disabled in current version.',
    nextAction: 'Keep blocked. Do not enable candidate processing.',
  },
  {
    id: 'expire-approval-preview',
    label: 'Expire Approval (Preview)',
    requestKind: 'governance_transition',
    currentState: 'expired',
    decision: 'expire',
    risk: 'medium',
    allowedNow: false,
    createsQueueItem: false,
    processesCandidate: false,
    executesAction: false,
    writesDb: true,
    controlsExternalTool: false,
    requiresStageC: false,
    requiresAuditLog: true,
    requiresEvidence: false,
    requiresRollbackPlan: false,
    requiredEvidence: ['audit_preview'],
    blockedActions: ['write_database', 'enable_stage_c', 'modify_state'],
    gates: ['no_db_write', 'stage_c_disabled'],
    reason: 'Approval expiration requires DB write to update state — disabled in current version.',
    nextAction: 'Keep blocked. Do not enable expiration.',
  },
  {
    id: 'revoke-approval-preview',
    label: 'Revoke Approval (Preview)',
    requestKind: 'governance_transition',
    currentState: 'revoked',
    decision: 'revoke',
    risk: 'high',
    allowedNow: false,
    createsQueueItem: false,
    processesCandidate: false,
    executesAction: false,
    writesDb: true,
    controlsExternalTool: false,
    requiresStageC: false,
    requiresAuditLog: true,
    requiresEvidence: true,
    requiresRollbackPlan: false,
    requiredEvidence: ['human_note', 'audit_preview'],
    blockedActions: ['write_database', 'enable_stage_c', 'modify_state', 'execute_action'],
    gates: ['no_db_write', 'stage_c_disabled'],
    reason: 'Approval revocation requires DB write — disabled in current version.',
    nextAction: 'Keep blocked. Do not enable revocation.',
  },
  {
    id: 'external-control-approval-blocked',
    label: 'External Control Approval (Blocked)',
    requestKind: 'external_control',
    currentState: 'blocked',
    decision: 'block',
    risk: 'critical',
    allowedNow: false,
    createsQueueItem: true,
    processesCandidate: false,
    executesAction: true,
    writesDb: true,
    controlsExternalTool: true,
    requiresStageC: true,
    requiresAuditLog: true,
    requiresEvidence: true,
    requiresRollbackPlan: true,
    requiredEvidence: ['registry_snapshot', 'human_note', 'validator_summary', 'rollback_plan'],
    blockedActions: ['control_external_tools', 'write_database', 'execute_action', 'enable_stage_c', 'create_queue'],
    gates: ['stage_c_disabled', 'no_db_write', 'no_external_control', 'no_approval_queue', 'no_execution'],
    reason: 'External tool control requires Stage C, DB write, queue, and runtime execution — all disabled.',
    nextAction: 'Keep blocked. Do not enable external control.',
  },
  {
    id: 'db-write-approval-blocked',
    label: 'Database Write Approval (Blocked)',
    requestKind: 'db_write',
    currentState: 'blocked',
    decision: 'block',
    risk: 'critical',
    allowedNow: false,
    createsQueueItem: true,
    processesCandidate: false,
    executesAction: true,
    writesDb: true,
    controlsExternalTool: false,
    requiresStageC: true,
    requiresAuditLog: true,
    requiresEvidence: true,
    requiresRollbackPlan: true,
    requiredEvidence: ['registry_snapshot', 'human_note', 'validator_summary', 'rollback_plan'],
    blockedActions: ['write_database', 'enable_stage_c', 'create_queue', 'execute_action'],
    gates: ['stage_c_disabled', 'no_db_write', 'no_approval_queue', 'no_execution'],
    reason: 'Database write requires Stage C, queue, and execution — all disabled in current version.',
    nextAction: 'Keep blocked. Do not enable DB write approval.',
  },
  {
    id: 'stage-c-transition-approval-blocked',
    label: 'Stage C Transition Approval (Blocked)',
    requestKind: 'stage_c_transition',
    currentState: 'blocked',
    decision: 'block',
    risk: 'critical',
    allowedNow: false,
    createsQueueItem: false,
    processesCandidate: false,
    executesAction: true,
    writesDb: true,
    controlsExternalTool: true,
    requiresStageC: true,
    requiresAuditLog: true,
    requiresEvidence: true,
    requiresRollbackPlan: true,
    requiredEvidence: ['registry_snapshot', 'human_note', 'validator_summary', 'rollback_plan', 'stage_c_checklist'],
    blockedActions: ['enable_stage_c', 'write_database', 'control_external_tools', 'execute_action', 'create_queue'],
    gates: ['stage_c_disabled', 'no_db_write', 'no_external_control', 'no_execution'],
    reason: 'Stage C transition is permanently disabled in current version.',
    nextAction: 'Keep blocked. Do not enable Stage C.',
  },
  {
    id: 'git-tag-release-approval-blocked',
    label: 'Git Tag / Release Approval (Blocked)',
    requestKind: 'tag_release',
    currentState: 'blocked',
    decision: 'block',
    risk: 'high',
    allowedNow: false,
    createsQueueItem: true,
    processesCandidate: false,
    executesAction: true,
    writesDb: false,
    controlsExternalTool: true,
    requiresStageC: false,
    requiresAuditLog: true,
    requiresEvidence: true,
    requiresRollbackPlan: false,
    requiredEvidence: ['human_note', 'validator_summary', 'git_commit'],
    blockedActions: ['create_tag', 'create_release', 'push_tag', 'control_external_tools', 'create_queue'],
    gates: ['no_approval_queue', 'no_external_control', 'no_execution'],
    reason: 'Git tag/release requires queue, external control (git), and execution — all disabled.',
    nextAction: 'Keep blocked. Do not enable tag/release approval.',
  },
  {
    id: 'rollback-approval-preview',
    label: 'Rollback Approval (Preview)',
    requestKind: 'governance_transition',
    currentState: 'preview_only',
    decision: 'approve_preview',
    risk: 'high',
    allowedNow: false,
    createsQueueItem: false,
    processesCandidate: false,
    executesAction: true,
    writesDb: true,
    controlsExternalTool: false,
    requiresStageC: false,
    requiresAuditLog: true,
    requiresEvidence: true,
    requiresRollbackPlan: true,
    requiredEvidence: ['rollback_plan', 'registry_snapshot', 'human_note'],
    blockedActions: ['execute_action', 'write_database', 'enable_stage_c', 'create_queue'],
    gates: ['no_db_write', 'no_execution', 'stage_c_disabled'],
    reason: 'Rollback requires DB write and execution — both disabled in current version.',
    nextAction: 'Keep blocked. Do not enable rollback approval.',
  },
];

export function getHumanApprovalWorkflowItems(): HumanApprovalWorkflowItem[] {
  return HUMAN_APPROVAL_WORKFLOW_ITEMS;
}

export function getHumanApprovalWorkflowSummary(): {
  total: number;
  allowedNow: number;
  blocked: number;
  critical: number;
  requiresStageC: number;
  writesDb: number;
  controlsExternalTool: number;
  processesCandidate: number;
  createsQueueItem: number;
  executesAction: number;
} {
  const items = HUMAN_APPROVAL_WORKFLOW_ITEMS;
  return {
    total: items.length,
    allowedNow: items.filter(i => i.allowedNow).length,
    blocked: items.filter(i => !i.allowedNow).length,
    critical: items.filter(i => i.risk === 'critical').length,
    requiresStageC: items.filter(i => i.requiresStageC).length,
    writesDb: items.filter(i => i.writesDb).length,
    controlsExternalTool: items.filter(i => i.controlsExternalTool).length,
    processesCandidate: items.filter(i => i.processesCandidate).length,
    createsQueueItem: items.filter(i => i.createsQueueItem).length,
    executesAction: items.filter(i => i.executesAction).length,
  };
}

export function getHumanApprovalItemsByRequestKind(kind: ApprovalRequestKind): HumanApprovalWorkflowItem[] {
  return HUMAN_APPROVAL_WORKFLOW_ITEMS.filter(i => i.requestKind === kind);
}

export function getHumanApprovalItemsByState(state: ApprovalState): HumanApprovalWorkflowItem[] {
  return HUMAN_APPROVAL_WORKFLOW_ITEMS.filter(i => i.currentState === state);
}

export function getHumanApprovalItemsByRisk(risk: ApprovalRisk): HumanApprovalWorkflowItem[] {
  return HUMAN_APPROVAL_WORKFLOW_ITEMS.filter(i => i.risk === risk);
}

export function getHumanApprovalBlockedItems(): HumanApprovalWorkflowItem[] {
  return HUMAN_APPROVAL_WORKFLOW_ITEMS.filter(i => !i.allowedNow);
}

export function getHumanApprovalItemCount(): number {
  return HUMAN_APPROVAL_WORKFLOW_ITEMS.length;
}
