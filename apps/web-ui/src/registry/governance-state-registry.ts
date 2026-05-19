// Governance State Registry — static readonly model for runtime governance state machine
// Does not execute state transitions, call APIs, write to databases, or control external tools.

export type GovernanceState =
  | 'readonly_preview'
  | 'static_plan'
  | 'synthetic_plan'
  | 'dry_run_design'
  | 'human_review_required'
  | 'blocked'
  | 'future_stage_c';

export type GovernanceTransitionKind =
  | 'view'
  | 'promote_to_plan'
  | 'request_review'
  | 'approve_preview'
  | 'approve_dry_run'
  | 'approve_execution'
  | 'block'
  | 'rollback_preview'
  | 'stage_c_transition';

export type GovernanceTransitionRisk = 'low' | 'medium' | 'high' | 'critical';

export type GovernanceTarget =
  | 'runtime_registry'
  | 'dry_run_plan'
  | 'audit_log'
  | 'permission_evaluator'
  | 'connector_center'
  | 'governance_center'
  | 'memory_hub_candidate'
  | 'external_tool'
  | 'database'
  | 'stage_c';

export interface GovernanceStateItem {
  id: string;
  label: string;
  state: GovernanceState;
  risk: GovernanceTransitionRisk;
  allowedNow: boolean;
  requiresHumanApproval: boolean;
  requiresStageC: boolean;
  requiresDbWrite: boolean;
  requiresExternalControl: boolean;
  requiresRollbackPlan: boolean;
  gates: string[];
  blockedActions: string[];
  evidence: string[];
  reason: string;
  nextAction: string;
}

export interface GovernanceTransitionItem {
  id: string;
  label: string;
  fromState: GovernanceState;
  toState: GovernanceState;
  kind: GovernanceTransitionKind;
  target: GovernanceTarget;
  risk: GovernanceTransitionRisk;
  allowedNow: boolean;
  requiresHumanApproval: boolean;
  requiresStageC: boolean;
  requiresDbWrite: boolean;
  requiresExternalControl: boolean;
  requiresRollbackPlan: boolean;
  gates: string[];
  blockedActions: string[];
  reason: string;
  nextAction: string;
}

export const GOVERNANCE_STATES: GovernanceStateItem[] = [
  {
    id: 'state-readonly-preview',
    label: 'Readonly Preview',
    state: 'readonly_preview',
    risk: 'low',
    allowedNow: true,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresDbWrite: false,
    requiresExternalControl: false,
    requiresRollbackPlan: false,
    gates: ['readonly_only'],
    blockedActions: ['execute', 'write', 'control_external', 'enable_stage_c'],
    evidence: ['registry_snapshot', 'validator_summary'],
    reason: 'Default state. All runtime items view-only. No execution or mutation.',
    nextAction: 'View registry or generate static plan',
  },
  {
    id: 'state-static-plan',
    label: 'Static Plan',
    state: 'static_plan',
    risk: 'low',
    allowedNow: true,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresDbWrite: false,
    requiresExternalControl: false,
    requiresRollbackPlan: false,
    gates: ['readonly_only'],
    blockedActions: ['execute', 'write', 'control_external', 'enable_stage_c'],
    evidence: ['registry_snapshot', 'validator_summary', 'dry_run_plan'],
    reason: 'A static plan has been generated but not reviewed. No execution.',
    nextAction: 'Promote to synthetic plan or request human review',
  },
  {
    id: 'state-synthetic-plan',
    label: 'Synthetic Plan',
    state: 'synthetic_plan',
    risk: 'medium',
    allowedNow: true,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresDbWrite: false,
    requiresExternalControl: false,
    requiresRollbackPlan: false,
    gates: ['readonly_only', 'no_external_control'],
    blockedActions: ['execute', 'write', 'control_external', 'enable_stage_c', 'dry_run_execute'],
    evidence: ['registry_snapshot', 'validator_summary', 'dry_run_plan', 'audit_preview'],
    reason: 'A synthetic plan exists with simulated steps. No real execution.',
    nextAction: 'Request dry-run approval or human review',
  },
  {
    id: 'state-dry-run-design',
    label: 'Dry-Run Design',
    state: 'dry_run_design',
    risk: 'medium',
    allowedNow: true,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresDbWrite: false,
    requiresExternalControl: false,
    requiresRollbackPlan: false,
    gates: ['readonly_only', 'stage_c_disabled'],
    blockedActions: ['execute', 'write', 'control_external', 'enable_stage_c', 'dry_run_real', 'approve_execution'],
    evidence: ['registry_snapshot', 'validator_summary', 'dry_run_plan', 'audit_preview'],
    reason: 'A dry-run plan has been designed but not executed. Readonly.',
    nextAction: 'Request human approval for execution',
  },
  {
    id: 'state-human-review-required',
    label: 'Human Review Required',
    state: 'human_review_required',
    risk: 'high',
    allowedNow: false,
    requiresHumanApproval: true,
    requiresStageC: false,
    requiresDbWrite: false,
    requiresExternalControl: false,
    requiresRollbackPlan: true,
    gates: ['readonly_only', 'human_approval_required', 'no_db_write'],
    blockedActions: ['execute', 'write', 'control_external', 'enable_stage_c', 'auto_approve', 'auto_reject'],
    evidence: ['registry_snapshot', 'validator_summary', 'dry_run_plan', 'audit_preview', 'human_note'],
    reason: 'Human review is needed before any action. No auto-approval.',
    nextAction: 'Human reviewer must evaluate and decide',
  },
  {
    id: 'state-blocked',
    label: 'Blocked',
    state: 'blocked',
    risk: 'high',
    allowedNow: false,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresDbWrite: false,
    requiresExternalControl: false,
    requiresRollbackPlan: false,
    gates: ['stage_c_disabled', 'no_external_control'],
    blockedActions: ['execute', 'write', 'control_external', 'enable_stage_c', 'approve_execution', 'run_dry_run', 'run_rollback'],
    evidence: ['registry_snapshot', 'validator_summary'],
    reason: 'Action is blocked by gate or risk threshold. No operation permitted.',
    nextAction: 'View blocking gates and resolve constraints',
  },
  {
    id: 'state-future-stage-c',
    label: 'Future Stage C',
    state: 'future_stage_c',
    risk: 'critical',
    allowedNow: false,
    requiresHumanApproval: true,
    requiresStageC: true,
    requiresDbWrite: true,
    requiresExternalControl: true,
    requiresRollbackPlan: true,
    gates: ['stage_c_disabled', 'no_external_control', 'no_db_write', 'human_approval_required', 'readonly_only'],
    blockedActions: ['enable_stage_c', 'execute', 'write', 'control_external', 'approve_execution', 'run_dry_run', 'run_rollback', 'tag_release', 'deploy_production'],
    evidence: ['registry_snapshot', 'validator_summary', 'git_commit'],
    reason: 'State reserved for Stage C enabled operations. Permanently locked in current version.',
    nextAction: 'Wait for Stage C readiness review',
  },
];

export const GOVERNANCE_TRANSITIONS: GovernanceTransitionItem[] = [
  {
    id: 'view-runtime-registry',
    label: 'View Runtime Registry',
    fromState: 'readonly_preview',
    toState: 'readonly_preview',
    kind: 'view',
    target: 'runtime_registry',
    risk: 'low',
    allowedNow: true,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresDbWrite: false,
    requiresExternalControl: false,
    requiresRollbackPlan: false,
    gates: ['readonly_only'],
    blockedActions: [],
    reason: 'Readonly view of runtime registry items.',
    nextAction: 'Continue viewing or generate static plan',
  },
  {
    id: 'view-dry-run-plan',
    label: 'View Dry-Run Plan',
    fromState: 'readonly_preview',
    toState: 'readonly_preview',
    kind: 'view',
    target: 'dry_run_plan',
    risk: 'low',
    allowedNow: true,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresDbWrite: false,
    requiresExternalControl: false,
    requiresRollbackPlan: false,
    gates: ['readonly_only'],
    blockedActions: [],
    reason: 'Readonly view of dry-run plan items.',
    nextAction: 'Continue viewing',
  },
  {
    id: 'view-audit-log',
    label: 'View Audit Log',
    fromState: 'readonly_preview',
    toState: 'readonly_preview',
    kind: 'view',
    target: 'audit_log',
    risk: 'low',
    allowedNow: true,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresDbWrite: false,
    requiresExternalControl: false,
    requiresRollbackPlan: false,
    gates: ['readonly_only', 'no_audit_write'],
    blockedActions: ['write_audit_log'],
    reason: 'Readonly view of audit log preview.',
    nextAction: 'Continue viewing',
  },
  {
    id: 'view-permission-evaluator',
    label: 'View Permission Evaluator',
    fromState: 'readonly_preview',
    toState: 'readonly_preview',
    kind: 'view',
    target: 'permission_evaluator',
    risk: 'low',
    allowedNow: true,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresDbWrite: false,
    requiresExternalControl: false,
    requiresRollbackPlan: false,
    gates: ['readonly_only'],
    blockedActions: [],
    reason: 'Readonly view of permission evaluator rules.',
    nextAction: 'Continue viewing',
  },
  {
    id: 'promote-readonly-to-static-plan',
    label: 'Promote to Static Plan',
    fromState: 'readonly_preview',
    toState: 'static_plan',
    kind: 'promote_to_plan',
    target: 'runtime_registry',
    risk: 'low',
    allowedNow: true,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresDbWrite: false,
    requiresExternalControl: false,
    requiresRollbackPlan: false,
    gates: ['readonly_only'],
    blockedActions: ['execute_plan', 'approve_execution'],
    reason: 'Generate a static plan from readonly preview.',
    nextAction: 'Review plan or promote to synthetic',
  },
  {
    id: 'promote-static-to-synthetic-plan',
    label: 'Promote to Synthetic Plan',
    fromState: 'static_plan',
    toState: 'synthetic_plan',
    kind: 'promote_to_plan',
    target: 'runtime_registry',
    risk: 'medium',
    allowedNow: true,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresDbWrite: false,
    requiresExternalControl: false,
    requiresRollbackPlan: false,
    gates: ['readonly_only', 'no_external_control'],
    blockedActions: ['execute_plan', 'approve_execution', 'control_external'],
    reason: 'Promote static plan to synthetic plan with simulated steps.',
    nextAction: 'Review synthetic plan or request human review',
  },
  {
    id: 'request-human-review',
    label: 'Request Human Review',
    fromState: 'synthetic_plan',
    toState: 'human_review_required',
    kind: 'request_review',
    target: 'governance_center',
    risk: 'high',
    allowedNow: false,
    requiresHumanApproval: true,
    requiresStageC: false,
    requiresDbWrite: false,
    requiresExternalControl: false,
    requiresRollbackPlan: true,
    gates: ['readonly_only', 'human_approval_required', 'no_db_write'],
    blockedActions: ['auto_approve', 'auto_reject', 'execute', 'write'],
    reason: 'Human review required before proceeding. No auto-approval.',
    nextAction: 'Human reviewer must evaluate and decide',
  },
  {
    id: 'request-dry-run-approval',
    label: 'Request Dry-Run Approval',
    fromState: 'dry_run_design',
    toState: 'human_review_required',
    kind: 'request_review',
    target: 'dry_run_plan',
    risk: 'high',
    allowedNow: false,
    requiresHumanApproval: true,
    requiresStageC: false,
    requiresDbWrite: false,
    requiresExternalControl: false,
    requiresRollbackPlan: true,
    gates: ['readonly_only', 'human_approval_required', 'stage_c_disabled'],
    blockedActions: ['auto_approve', 'execute_dry_run', 'control_external'],
    reason: 'Dry-run execution requires human approval.',
    nextAction: 'Human reviewer must approve dry-run',
  },
  {
    id: 'request-execution-approval-blocked',
    label: 'Request Execution Approval',
    fromState: 'human_review_required',
    toState: 'blocked',
    kind: 'approve_execution',
    target: 'runtime_registry',
    risk: 'critical',
    allowedNow: false,
    requiresHumanApproval: true,
    requiresStageC: true,
    requiresDbWrite: true,
    requiresExternalControl: true,
    requiresRollbackPlan: true,
    gates: ['readonly_only', 'human_approval_required', 'stage_c_disabled', 'no_db_write', 'no_external_control'],
    blockedActions: ['execute', 'write', 'control_external', 'enable_stage_c', 'approve_execution', 'deploy_production'],
    reason: 'Execution approval requires Stage C, DB write, and external control — all blocked in current version.',
    nextAction: 'Cannot proceed until Stage C is enabled',
  },
  {
    id: 'rollback-preview',
    label: 'Rollback to Preview',
    fromState: 'blocked',
    toState: 'readonly_preview',
    kind: 'rollback_preview',
    target: 'runtime_registry',
    risk: 'low',
    allowedNow: true,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresDbWrite: false,
    requiresExternalControl: false,
    requiresRollbackPlan: false,
    gates: ['readonly_only'],
    blockedActions: [],
    reason: 'Rollback to readonly preview state. No data mutation.',
    nextAction: 'Continue viewing registry',
  },
  {
    id: 'blocked-preview-to-execute',
    label: 'Preview to Execute',
    fromState: 'readonly_preview',
    toState: 'blocked',
    kind: 'block',
    target: 'runtime_registry',
    risk: 'high',
    allowedNow: false,
    requiresHumanApproval: false,
    requiresStageC: true,
    requiresDbWrite: true,
    requiresExternalControl: true,
    requiresRollbackPlan: true,
    gates: ['stage_c_disabled', 'no_db_write', 'no_external_control'],
    blockedActions: ['execute', 'write', 'control_external', 'enable_stage_c'],
    reason: 'Direct preview-to-execute transition is blocked. Must pass through governance states.',
    nextAction: 'Follow governance workflow instead of direct execution',
  },
  {
    id: 'blocked-dry-run-to-real-dry-run',
    label: 'Dry-Run Design to Real Dry-Run',
    fromState: 'dry_run_design',
    toState: 'blocked',
    kind: 'block',
    target: 'dry_run_plan',
    risk: 'high',
    allowedNow: false,
    requiresHumanApproval: true,
    requiresStageC: false,
    requiresDbWrite: false,
    requiresExternalControl: false,
    requiresRollbackPlan: true,
    gates: ['readonly_only', 'human_approval_required', 'stage_c_disabled'],
    blockedActions: ['execute_dry_run', 'control_external', 'write_output'],
    reason: 'Real dry-run execution from design state is blocked. Must obtain approval first.',
    nextAction: 'Submit for human review',
  },
  {
    id: 'blocked-audit-preview-to-audit-write',
    label: 'Audit Preview to Audit Write',
    fromState: 'readonly_preview',
    toState: 'blocked',
    kind: 'block',
    target: 'audit_log',
    risk: 'high',
    allowedNow: false,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresDbWrite: true,
    requiresExternalControl: false,
    requiresRollbackPlan: false,
    gates: ['no_db_write', 'stage_c_disabled'],
    blockedActions: ['write_audit_log', 'persist_audit_event'],
    reason: 'Audit log write is blocked. Current version only supports preview.',
    nextAction: 'Wait for DB write capability',
  },
  {
    id: 'blocked-hidden-direct-to-sidebar',
    label: 'Hidden Direct to Sidebar',
    fromState: 'readonly_preview',
    toState: 'blocked',
    kind: 'block',
    target: 'governance_center',
    risk: 'medium',
    allowedNow: false,
    requiresHumanApproval: true,
    requiresStageC: false,
    requiresDbWrite: false,
    requiresExternalControl: false,
    requiresRollbackPlan: false,
    gates: ['human_approval_required', 'readonly_only'],
    blockedActions: ['add_to_sidebar', 'modify_layout', 'change_menu'],
    reason: 'Promoting governance state preview to sidebar is blocked. Must await Governance Center readiness.',
    nextAction: 'Keep as hidden direct route',
  },
  {
    id: 'blocked-db-write',
    label: 'Database Write',
    fromState: 'readonly_preview',
    toState: 'blocked',
    kind: 'block',
    target: 'database',
    risk: 'critical',
    allowedNow: false,
    requiresHumanApproval: true,
    requiresStageC: true,
    requiresDbWrite: true,
    requiresExternalControl: false,
    requiresRollbackPlan: true,
    gates: ['stage_c_disabled', 'no_db_write', 'human_approval_required'],
    blockedActions: ['write_database', 'migrate_schema', 'persist_state', 'save_record'],
    reason: 'Database write is permanently blocked in current version.',
    nextAction: 'Wait for Stage C enablement',
  },
  {
    id: 'blocked-external-control',
    label: 'External Tool Control',
    fromState: 'readonly_preview',
    toState: 'blocked',
    kind: 'block',
    target: 'external_tool',
    risk: 'critical',
    allowedNow: false,
    requiresHumanApproval: true,
    requiresStageC: true,
    requiresDbWrite: false,
    requiresExternalControl: true,
    requiresRollbackPlan: true,
    gates: ['stage_c_disabled', 'no_external_control', 'human_approval_required'],
    blockedActions: ['control_external_tool', 'send_command', 'write_external', 'execute_remote'],
    reason: 'External tool control is permanently blocked in current version.',
    nextAction: 'Wait for Stage C enablement',
  },
  {
    id: 'blocked-stage-c-transition',
    label: 'Stage C Transition',
    fromState: 'readonly_preview',
    toState: 'blocked',
    kind: 'stage_c_transition',
    target: 'stage_c',
    risk: 'critical',
    allowedNow: false,
    requiresHumanApproval: true,
    requiresStageC: true,
    requiresDbWrite: true,
    requiresExternalControl: true,
    requiresRollbackPlan: true,
    gates: ['stage_c_disabled', 'no_db_write', 'no_external_control', 'human_approval_required', 'readonly_only'],
    blockedActions: ['enable_stage_c', 'write_database', 'control_external', 'approve_execution', 'deploy_production', 'tag_release'],
    reason: 'Stage C transition is permanently blocked. All Stage C items remain disabled.',
    nextAction: 'Complete Stage C readiness checklist',
  },
  {
    id: 'blocked-candidate-processing',
    label: 'Candidate Processing',
    fromState: 'readonly_preview',
    toState: 'blocked',
    kind: 'block',
    target: 'memory_hub_candidate',
    risk: 'critical',
    allowedNow: false,
    requiresHumanApproval: true,
    requiresStageC: true,
    requiresDbWrite: true,
    requiresExternalControl: false,
    requiresRollbackPlan: true,
    gates: ['stage_c_disabled', 'no_db_write', 'human_approval_required'],
    blockedActions: ['approve_candidate', 'reject_candidate', 'archive_candidate', 'process_candidate', 'sync_lan_share'],
    reason: 'Memory Hub candidate processing is blocked. No approval, rejection, or archiving.',
    nextAction: 'Wait for Stage C enablement',
  },
];

export function getGovernanceStateCount(): number {
  return GOVERNANCE_STATES.length;
}

export function getGovernanceTransitionCount(): number {
  return GOVERNANCE_TRANSITIONS.length;
}

export function getGovernanceStatesByRisk(risk: GovernanceTransitionRisk): GovernanceStateItem[] {
  return GOVERNANCE_STATES.filter(s => s.risk === risk);
}

export function getGovernanceTransitionsByTarget(target: GovernanceTarget): GovernanceTransitionItem[] {
  return GOVERNANCE_TRANSITIONS.filter(t => t.target === target);
}

export function getGovernanceTransitionsByRisk(risk: GovernanceTransitionRisk): GovernanceTransitionItem[] {
  return GOVERNANCE_TRANSITIONS.filter(t => t.risk === risk);
}

export function getGovernanceAllowedTransitions(): GovernanceTransitionItem[] {
  return GOVERNANCE_TRANSITIONS.filter(t => t.allowedNow);
}

export function getGovernanceBlockedTransitions(): GovernanceTransitionItem[] {
  return GOVERNANCE_TRANSITIONS.filter(t => !t.allowedNow);
}

export function getGovernanceCriticalTransitions(): GovernanceTransitionItem[] {
  return GOVERNANCE_TRANSITIONS.filter(t => t.risk === 'critical');
}

export function getGovernanceStateSummary(): {
  totalStates: number;
  totalTransitions: number;
  allowedTransitions: number;
  blockedTransitions: number;
  criticalTransitions: number;
  requiresHumanApproval: number;
  requiresStageC: number;
  requiresDbWrite: number;
  requiresExternalControl: number;
} {
  return {
    totalStates: GOVERNANCE_STATES.length,
    totalTransitions: GOVERNANCE_TRANSITIONS.length,
    allowedTransitions: GOVERNANCE_TRANSITIONS.filter(t => t.allowedNow).length,
    blockedTransitions: GOVERNANCE_TRANSITIONS.filter(t => !t.allowedNow).length,
    criticalTransitions: GOVERNANCE_TRANSITIONS.filter(t => t.risk === 'critical').length,
    requiresHumanApproval: GOVERNANCE_TRANSITIONS.filter(t => t.requiresHumanApproval).length,
    requiresStageC: GOVERNANCE_TRANSITIONS.filter(t => t.requiresStageC).length,
    requiresDbWrite: GOVERNANCE_TRANSITIONS.filter(t => t.requiresDbWrite).length,
    requiresExternalControl: GOVERNANCE_TRANSITIONS.filter(t => t.requiresExternalControl).length,
  };
}
