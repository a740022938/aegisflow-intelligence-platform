// Permission Evaluator Registry — static readonly evaluation rules
// Does not execute permissions, modify menus, write to databases, or control external tools.

export type PermissionTargetKind =
  | 'page'
  | 'center'
  | 'connector'
  | 'lab'
  | 'governance'
  | 'action'
  | 'route';

export type PermissionDecision =
  | 'allow_primary_nav'
  | 'allow_sidebar_visible'
  | 'allow_hidden_direct'
  | 'allow_advanced_hub'
  | 'allow_launchpad_card'
  | 'hold_review'
  | 'deny';

export type PermissionRisk = 'low' | 'medium' | 'high';

export type PermissionSeverity = 'info' | 'notice' | 'warning' | 'blocking';

export type PermissionEnforcementStage = 'preview_only' | 'manual_review' | 'blocked' | 'future';

export type PermissionTargetCenter =
  | 'primary_nav'
  | 'advanced_hub'
  | 'connector_center'
  | 'lab_center'
  | 'governance_center'
  | 'navigation_preview'
  | 'internal';

export type PermissionEvidenceSource = 'registry' | 'route' | 'docs' | 'manual_policy' | 'derived';

export type PermissionUiSurface = 'sidebar' | 'advanced_hub' | 'hidden_route' | 'docs_only' | 'none';

export interface PermissionEvaluationRule {
  id: string;
  targetKind: PermissionTargetKind;
  targetId: string;
  label: string;
  currentExposure: string;
  recommendedDecision: PermissionDecision;
  risk: PermissionRisk;
  severity: PermissionSeverity;
  enforcementStage: PermissionEnforcementStage;
  targetCenter: PermissionTargetCenter;
  evidenceSource: PermissionEvidenceSource;
  uiSurface: PermissionUiSurface;
  allowedNow: boolean;
  gates: string[];
  blockingConditions: string[];
  requiredEvidence: string[];
  reason: string;
  nextAction: string;
}

export const PERMISSION_EVALUATION_RULES: PermissionEvaluationRule[] = [
  {
    id: 'pe-advanced-mode',
    targetKind: 'center',
    targetId: 'advanced-mode-readonly',
    label: 'Advanced Mode Preview',
    currentExposure: 'primary_nav',
    recommendedDecision: 'allow_primary_nav',
    risk: 'low',
    severity: 'info',
    enforcementStage: 'preview_only',
    targetCenter: 'primary_nav',
    evidenceSource: 'registry',
    uiSurface: 'sidebar',
    allowedNow: true,
    gates: ['readonly_only', 'no_stage_c'],
    blockingConditions: [],
    requiredEvidence: ['readonly_ui_verified', 'no_exec_buttons', 'sidebar_exposure_approved'],
    reason: 'Advanced Mode Preview is the primary readonly gate for center-level navigation. Already in sidebar with safetyBoundary=readonly.',
    nextAction: 'Maintain current exposure. No change needed.',
  },
  {
    id: 'pe-connector-center',
    targetKind: 'center',
    targetId: 'connector-center-readonly',
    label: 'Connector Center',
    currentExposure: 'primary_nav',
    recommendedDecision: 'allow_primary_nav',
    risk: 'low',
    severity: 'info',
    enforcementStage: 'preview_only',
    targetCenter: 'connector_center',
    evidenceSource: 'registry',
    uiSurface: 'sidebar',
    allowedNow: true,
    gates: ['readonly_only', 'no_stage_c', 'no_external_control'],
    blockingConditions: [],
    requiredEvidence: ['readonly_ui_verified', 'no_external_api_calls', 'sidebar_exposure_approved'],
    reason: 'Connector Center is a readonly capability overview. No real connector control, no API calls, no token input.',
    nextAction: 'Maintain current exposure. No change needed.',
  },
  {
    id: 'pe-lab-center',
    targetKind: 'center',
    targetId: 'lab-center-readonly',
    label: 'Lab Center',
    currentExposure: 'hidden_direct_route',
    recommendedDecision: 'allow_hidden_direct',
    risk: 'medium',
    severity: 'notice',
    enforcementStage: 'preview_only',
    targetCenter: 'lab_center',
    evidenceSource: 'registry',
    uiSurface: 'hidden_route',
    allowedNow: false,
    gates: ['readonly_only', 'no_stage_c', 'no_training', 'no_inference', 'no_label_save'],
    blockingConditions: ['No training/inference/label-save runtime verification'],
    requiredEvidence: ['readonly_ui_verified', 'hidden_direct_only'],
    reason: 'Lab Center is a readonly experiment overview. No training, inference, or label-save capabilities. Hidden direct route only.',
    nextAction: 'Keep hidden direct. Evaluate launchpad_card readiness after UI polish.',
  },
  {
    id: 'pe-governance-center',
    targetKind: 'center',
    targetId: 'governance-center',
    label: 'Governance Center',
    currentExposure: 'hidden_direct_route',
    recommendedDecision: 'hold_review',
    risk: 'medium',
    severity: 'warning',
    enforcementStage: 'manual_review',
    targetCenter: 'governance_center',
    evidenceSource: 'route',
    uiSurface: 'hidden_route',
    allowedNow: false,
    gates: ['readonly_only', 'governance_center_enabled', 'stage_c_disabled'],
    blockingConditions: ['No governance_center_enabled gate clearance', 'Stage C deferred'],
    requiredEvidence: ['governance_center_enabled_flag', 'stage_c_gate_clearance'],
    reason: 'Governance Center is a readonly metadata hub with 13 modules and 12 gates. Stage C deferred. Hold review until governance center flag is ready.',
    nextAction: 'Keep hidden direct. Do not expose to sidebar. Re-evaluate when governance_center_enabled flag is active.',
  },
  {
    id: 'pe-navigation-preview',
    targetKind: 'center',
    targetId: 'navigation-preview-readonly',
    label: 'Navigation Preview',
    currentExposure: 'hidden_direct_route',
    recommendedDecision: 'allow_hidden_direct',
    risk: 'low',
    severity: 'info',
    enforcementStage: 'preview_only',
    targetCenter: 'navigation_preview',
    evidenceSource: 'registry',
    uiSurface: 'hidden_route',
    allowedNow: false,
    gates: ['readonly_only', 'no_menu_change'],
    blockingConditions: ['Navigation Preview is audit-only, not a real center.'],
    requiredEvidence: ['readonly_ui_verified', 'no_sidebar_mutation'],
    reason: 'Navigation Preview is a readonly audit readout of current navigation state. Does not change real menu. Low risk.',
    nextAction: 'Keep hidden direct. No sidebar exposure planned.',
  },
  {
    id: 'pe-cost-routing',
    targetKind: 'page',
    targetId: 'cost-routing',
    label: 'Cost Routing',
    currentExposure: 'primary_nav',
    recommendedDecision: 'allow_primary_nav',
    risk: 'low',
    severity: 'info',
    enforcementStage: 'preview_only',
    targetCenter: 'primary_nav',
    evidenceSource: 'registry',
    uiSurface: 'sidebar',
    allowedNow: true,
    gates: ['readonly_only', 'preview_only', 'no_db_write'],
    blockingConditions: [],
    requiredEvidence: ['readonly_ui_verified', 'button_semantics_hardened', 'no_real_execution'],
    reason: 'Cost Routing is a readonly preview/simulation page. No real routing, no DB writes, no external calls. Button semantics hardened in v7.25.3.',
    nextAction: 'Maintain current exposure. Continue readonly-only semantics.',
  },
  {
    id: 'pe-assistant-center',
    targetKind: 'page',
    targetId: 'assistant-center',
    label: 'Assistant Center',
    currentExposure: 'primary_nav',
    recommendedDecision: 'allow_primary_nav',
    risk: 'low',
    severity: 'info',
    enforcementStage: 'preview_only',
    targetCenter: 'primary_nav',
    evidenceSource: 'registry',
    uiSurface: 'sidebar',
    allowedNow: true,
    gates: ['readonly_only', 'preview_only'],
    blockingConditions: [],
    requiredEvidence: ['readonly_ui_verified'],
    reason: 'Assistant Center is a readonly overview of AIP local services and external assistants. Readonly-first with safetyBoundary=preview.',
    nextAction: 'Maintain current exposure.',
  },
  {
    id: 'pe-memory-hub',
    targetKind: 'page',
    targetId: 'memory-hub-readonly',
    label: 'Memory Hub Readonly',
    currentExposure: 'primary_nav',
    recommendedDecision: 'allow_sidebar_visible',
    risk: 'low',
    severity: 'info',
    enforcementStage: 'preview_only',
    targetCenter: 'primary_nav',
    evidenceSource: 'registry',
    uiSurface: 'sidebar',
    allowedNow: true,
    gates: ['readonly_only', 'no_stage_c', 'no_db_write'],
    blockingConditions: [],
    requiredEvidence: ['readonly_ui_verified', 'no_candidate_processing'],
    reason: 'Memory Hub is a readonly integration page. No candidate processing, no DB write, no external control.',
    nextAction: 'Maintain current sidebar exposure.',
  },
  {
    id: 'pe-openaxiom',
    targetKind: 'page',
    targetId: 'openaxiom-readonly',
    label: 'OpenAxiom Readonly',
    currentExposure: 'primary_nav',
    recommendedDecision: 'allow_sidebar_visible',
    risk: 'low',
    severity: 'info',
    enforcementStage: 'preview_only',
    targetCenter: 'primary_nav',
    evidenceSource: 'registry',
    uiSurface: 'sidebar',
    allowedNow: true,
    gates: ['readonly_only', 'no_label_save'],
    blockingConditions: [],
    requiredEvidence: ['readonly_ui_verified', 'no_label_mutation'],
    reason: 'OpenAxiom Readonly is a readonly diagnostic overview. No label save, no model file changes.',
    nextAction: 'Maintain current sidebar exposure.',
  },
  {
    id: 'pe-permission-evaluator',
    targetKind: 'center',
    targetId: 'permission-evaluator',
    label: 'Permission Evaluator Preview',
    currentExposure: 'internal_preview',
    recommendedDecision: 'allow_hidden_direct',
    risk: 'low',
    severity: 'info',
    enforcementStage: 'preview_only',
    targetCenter: 'internal',
    evidenceSource: 'registry',
    uiSurface: 'hidden_route',
    allowedNow: false,
    gates: ['readonly_only'],
    blockingConditions: [],
    requiredEvidence: ['readonly_ui_verified'],
    reason: 'Permission Evaluator Preview is a readonly assessment of all permission evaluation rules. Hidden direct route. Not in sidebar. No real permission execution.',
    nextAction: 'Keep hidden direct. No sidebar exposure planned.',
  },
  {
    id: 'pe-inference',
    targetKind: 'action',
    targetId: 'inference',
    label: 'Inference Execution',
    currentExposure: 'primary_nav_blocked',
    recommendedDecision: 'hold_review',
    risk: 'high',
    severity: 'blocking',
    enforcementStage: 'blocked',
    targetCenter: 'advanced_hub',
    evidenceSource: 'derived',
    uiSurface: 'none',
    allowedNow: false,
    gates: ['stage_c_disabled', 'runtime_not_ready'],
    blockingConditions: ['Stage C not enabled', 'No runtime evaluator', 'No permission function'],
    requiredEvidence: ['runtime_evaluator_ready', 'permission_function_ready', 'stage_c_activated'],
    reason: 'Inference execution is a high-risk action. Runtime evaluator not implemented. Stage C disabled. Permission evaluator design-only.',
    nextAction: 'Keep blocked. Do not allow. Re-evaluate when runtime evaluator is implemented and Stage C is activated.',
  },
  {
    id: 'pe-scheduler',
    targetKind: 'action',
    targetId: 'scheduler',
    label: 'Scheduler Execution',
    currentExposure: 'primary_nav_blocked',
    recommendedDecision: 'hold_review',
    risk: 'high',
    severity: 'blocking',
    enforcementStage: 'blocked',
    targetCenter: 'advanced_hub',
    evidenceSource: 'derived',
    uiSurface: 'none',
    allowedNow: false,
    gates: ['stage_c_disabled', 'runtime_not_ready'],
    blockingConditions: ['Stage C not enabled', 'No runtime evaluator'],
    requiredEvidence: ['runtime_evaluator_ready', 'stage_c_activated'],
    reason: 'Scheduler execution is high-risk. Requires runtime evaluator and Stage C activation. Currently all blocked-future.',
    nextAction: 'Keep blocked. Do not allow.',
  },
  {
    id: 'pe-deploy-v2',
    targetKind: 'action',
    targetId: 'deploy-v2',
    label: 'Deploy v2 Execution',
    currentExposure: 'primary_nav_blocked',
    recommendedDecision: 'hold_review',
    risk: 'high',
    severity: 'blocking',
    enforcementStage: 'blocked',
    targetCenter: 'advanced_hub',
    evidenceSource: 'derived',
    uiSurface: 'none',
    allowedNow: false,
    gates: ['stage_c_disabled', 'runtime_not_ready'],
    blockingConditions: ['Stage C not enabled', 'Deployment Gate design-only'],
    requiredEvidence: ['runtime_evaluator_ready', 'deployment_gate_implemented', 'stage_c_activated'],
    reason: 'Deploy v2 is high-risk. Deployment Gate is design-only. Stage C disabled.',
    nextAction: 'Keep blocked. Do not allow.',
  },
  {
    id: 'pe-stage-c',
    targetKind: 'action',
    targetId: 'stage-c',
    label: 'Stage C Enablement',
    currentExposure: 'not_exposed',
    recommendedDecision: 'deny',
    risk: 'high',
    severity: 'blocking',
    enforcementStage: 'blocked',
    targetCenter: 'internal',
    evidenceSource: 'manual_policy',
    uiSurface: 'none',
    allowedNow: false,
    gates: ['stage_c_denied', 'permanently_disabled'],
    blockingConditions: ['Stage C permanently disabled by policy', 'No activation package created'],
    requiredEvidence: ['project_lead_decision', 'runtime_evaluator_ready', 'permission_function_ready'],
    reason: 'Stage C is permanently disabled. No activation package has been created. All v7.24.0+ work is planning/design-only.',
    nextAction: 'Keep denied. Do not activate without project lead decision.',
  },
  {
    id: 'pe-candidate-processing',
    targetKind: 'action',
    targetId: 'candidate-processing',
    label: 'Memory Hub Candidate Processing',
    currentExposure: 'not_exposed',
    recommendedDecision: 'deny',
    risk: 'high',
    severity: 'blocking',
    enforcementStage: 'blocked',
    targetCenter: 'primary_nav',
    evidenceSource: 'derived',
    uiSurface: 'none',
    allowedNow: false,
    gates: ['stage_c_disabled', 'no_db_write'],
    blockingConditions: ['Memory Hub candidate processing requires DB write', 'Stage C not enabled'],
    requiredEvidence: ['db_write_clearance', 'stage_c_activated', 'candidate_processing_approved'],
    reason: 'Candidate processing requires DB write and is high-risk. Currently blocked by design.',
    nextAction: 'Keep denied. Do not enable candidate processing in readonly mode.',
  },
  {
    id: 'pe-external-tool-control',
    targetKind: 'action',
    targetId: 'external-tool-control',
    label: 'External Tool Control',
    currentExposure: 'not_exposed',
    recommendedDecision: 'deny',
    risk: 'high',
    severity: 'blocking',
    enforcementStage: 'blocked',
    targetCenter: 'connector_center',
    evidenceSource: 'manual_policy',
    uiSurface: 'none',
    allowedNow: false,
    gates: ['stage_c_disabled', 'no_external_control'],
    blockingConditions: ['External tool control requires Stage C', 'No runtime authorization'],
    requiredEvidence: ['stage_c_activated', 'runtime_evaluator_ready', 'external_control_approved'],
    reason: 'External tool control is permanently denied. No OpenClaw/ComfyUI/OpenAxiom/HuggingFace/Hermes/CC Switch/Claude Proxy control in readonly mode.',
    nextAction: 'Keep denied. Do not enable.',
  },
  {
    id: 'pe-runtime-registry-preview',
    targetKind: 'center',
    targetId: 'runtime-registry-preview',
    label: 'Runtime Registry Preview',
    currentExposure: 'internal_preview',
    recommendedDecision: 'allow_hidden_direct',
    risk: 'low',
    severity: 'info',
    enforcementStage: 'preview_only',
    targetCenter: 'internal',
    evidenceSource: 'registry',
    uiSurface: 'hidden_route',
    allowedNow: true,
    gates: ['readonly_only', 'no_stage_c', 'no_external_control', 'no_db_write'],
    blockingConditions: [],
    requiredEvidence: ['readonly_ui_verified', 'no_runtime_implementation_verified'],
    reason: 'Runtime Registry Preview is a readonly assessment of all runtime registry targets, action levels, gates, and risk status. Hidden direct route. Not in sidebar. No real runtime execution.',
    nextAction: 'Keep hidden direct. No sidebar exposure planned.',
  },
  {
    id: 'pe-dry-run-plan-preview',
    targetKind: 'center',
    targetId: 'dry-run-plan-preview',
    label: 'Dry-run Plan Preview',
    currentExposure: 'internal_preview',
    recommendedDecision: 'allow_hidden_direct',
    risk: 'low',
    severity: 'info',
    enforcementStage: 'preview_only',
    targetCenter: 'internal',
    evidenceSource: 'registry',
    uiSurface: 'hidden_route',
    allowedNow: true,
    gates: ['readonly_only', 'no_stage_c', 'no_external_control', 'no_db_write'],
    blockingConditions: [],
    requiredEvidence: ['readonly_ui_verified', 'no_dry_run_execution_verified'],
    reason: 'Dry-run Plan Preview is a readonly assessment of all dry-run plans, modes, gates, risk status. Hidden direct route. Not in sidebar. No real dry-run execution.',
    nextAction: 'Keep hidden direct. No sidebar exposure planned.',
  },
  {
    id: 'pe-audit-log-preview',
    targetKind: 'center',
    targetId: 'audit-log-preview',
    label: 'Audit Log Preview',
    currentExposure: 'internal_preview',
    recommendedDecision: 'allow_hidden_direct',
    risk: 'medium',
    severity: 'info',
    enforcementStage: 'preview_only',
    targetCenter: 'internal',
    evidenceSource: 'registry',
    uiSurface: 'hidden_route',
    allowedNow: true,
    gates: ['readonly_only', 'no_stage_c', 'no_external_control', 'no_db_write', 'no_audit_write'],
    blockingConditions: [],
    requiredEvidence: ['readonly_ui_verified', 'no_audit_write_verified'],
    reason: 'Audit Log Preview is a readonly assessment of all audit event models, sources, retention classes, and traceability. Hidden direct route. Not in sidebar. No real audit logging.',
    nextAction: 'Keep hidden direct. No sidebar exposure planned.',
  },
  {
    id: 'pe-audit-write-now',
    targetKind: 'action',
    targetId: 'audit-write-now',
    label: 'Audit Write Now',
    currentExposure: 'not_exposed',
    recommendedDecision: 'deny',
    risk: 'high',
    severity: 'blocking',
    enforcementStage: 'blocked',
    targetCenter: 'internal',
    evidenceSource: 'manual_policy',
    uiSurface: 'none',
    allowedNow: false,
    gates: ['no_audit_write', 'no_db_write', 'stage_c_disabled'],
    blockingConditions: ['Audit write requires DB write', 'No audit logger implemented'],
    requiredEvidence: ['audit_logger_implemented', 'db_write_authorized', 'project_lead_decision'],
    reason: 'Audit log writing is permanently denied. No audit logger implementation. No DB write in readonly mode.',
    nextAction: 'Keep denied. Do not enable audit write.',
  },
  {
    id: 'pe-governance-state-machine-preview',
    targetKind: 'page',
    targetId: 'governance-state-machine-preview',
    label: 'Governance State Machine Preview',
    currentExposure: 'direct_route',
    recommendedDecision: 'allow_hidden_direct',
    risk: 'medium',
    severity: 'info',
    enforcementStage: 'preview_only',
    targetCenter: 'governance_center',
    evidenceSource: 'registry',
    uiSurface: 'hidden_route',
    allowedNow: true,
    gates: ['readonly_only', 'no_state_transition', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockingConditions: ['Readonly only', 'No state transition execution', 'No DB write', 'No external control', 'Stage C disabled'],
    requiredEvidence: ['validator_summary', 'registry_snapshot'],
    reason: 'Governance State Machine Preview is readonly. Displays state machine model without executing transitions.',
    nextAction: 'Keep readonly preview. Do not enable state transitions.',
  },
  {
    id: 'pe-human-approval-workflow-preview',
    targetKind: 'page',
    targetId: 'human-approval-workflow-preview',
    label: 'Human Approval Workflow Preview',
    currentExposure: 'direct_route',
    recommendedDecision: 'allow_hidden_direct',
    risk: 'medium',
    severity: 'info',
    enforcementStage: 'preview_only',
    targetCenter: 'governance_center',
    evidenceSource: 'registry',
    uiSurface: 'hidden_route',
    allowedNow: true,
    gates: ['readonly_only', 'no_approval_queue', 'no_candidate_processing', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockingConditions: ['Readonly only', 'No approval queue', 'No candidate processing', 'No DB write', 'No external control', 'Stage C disabled'],
    requiredEvidence: ['validator_summary', 'registry_snapshot'],
    reason: 'Human Approval Workflow Preview is readonly. Displays approval workflow model without creating queues, processing candidates, or executing actions.',
    nextAction: 'Keep readonly preview. Do not enable approval queue or candidate processing.',
  },
  {
    id: 'pe-evidence-schema-preview',
    targetKind: 'page',
    targetId: 'evidence-schema-preview',
    label: 'Evidence Schema Preview',
    currentExposure: 'direct_route',
    recommendedDecision: 'allow_hidden_direct',
    risk: 'medium',
    severity: 'info',
    enforcementStage: 'preview_only',
    targetCenter: 'governance_center',
    evidenceSource: 'registry',
    uiSurface: 'hidden_route',
    allowedNow: true,
    gates: ['readonly_only', 'no_evidence_capture', 'no_secret_storage', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockingConditions: ['Readonly only', 'No evidence capture', 'No secret storage', 'No DB write', 'No external control', 'Stage C disabled'],
    requiredEvidence: ['validator_summary', 'registry_snapshot'],
    reason: 'Evidence Schema Preview is readonly. Displays evidence schema model without capturing evidence, storing secrets, or writing to DB.',
    nextAction: 'Keep readonly preview. Do not enable evidence capture or secret storage.',
  },
  {
    id: 'pe-rollback-preview',
    targetKind: 'page',
    targetId: 'rollback-preview',
    label: 'Rollback Preview',
    currentExposure: 'direct_route',
    recommendedDecision: 'allow_hidden_direct',
    risk: 'medium',
    severity: 'info',
    enforcementStage: 'preview_only',
    targetCenter: 'governance_center',
    evidenceSource: 'registry',
    uiSurface: 'hidden_route',
    allowedNow: true,
    gates: ['readonly_only', 'no_rollback_execution', 'no_file_modification', 'no_git_mutation', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockingConditions: ['Readonly only', 'No rollback execution', 'No file modification', 'No git mutation', 'No DB write', 'No external control', 'Stage C disabled'],
    requiredEvidence: ['validator_summary', 'registry_snapshot'],
    reason: 'Rollback Preview is readonly. Displays rollback risk assessment model without executing rollbacks, restoring files, or mutating git.',
    nextAction: 'Keep readonly preview. Do not enable rollback executor, file restore, or git mutation.',
  },
  {
    id: 'pe-db-write',
    targetKind: 'action',
    targetId: 'db-write',
    label: 'Database Write',
    currentExposure: 'not_exposed',
    recommendedDecision: 'deny',
    risk: 'high',
    severity: 'blocking',
    enforcementStage: 'blocked',
    targetCenter: 'internal',
    evidenceSource: 'manual_policy',
    uiSurface: 'none',
    allowedNow: false,
    gates: ['stage_c_disabled', 'no_db_write'],
    blockingConditions: ['DB write requires Stage C', 'No DB write authorization'],
    requiredEvidence: ['stage_c_activated', 'db_write_authorized', 'project_lead_decision'],
    reason: 'Database write is permanently denied in readonly mode. All current operations are dry-run/synthetic only.',
    nextAction: 'Keep denied. Do not allow DB writes in readonly mode.',
  },
];

export function getPermissionEvaluationRuleCount(): number {
  return PERMISSION_EVALUATION_RULES.length;
}

export function getPermissionEvaluationRulesByDecision(decision: PermissionDecision): PermissionEvaluationRule[] {
  return PERMISSION_EVALUATION_RULES.filter(r => r.recommendedDecision === decision);
}

export function getPermissionEvaluationRulesByRisk(risk: PermissionRisk): PermissionEvaluationRule[] {
  return PERMISSION_EVALUATION_RULES.filter(r => r.risk === risk);
}

export function getPermissionEvaluationDeniedRules(): PermissionEvaluationRule[] {
  return PERMISSION_EVALUATION_RULES.filter(r => r.recommendedDecision === 'deny');
}

export function getPermissionEvaluationHoldReviewRules(): PermissionEvaluationRule[] {
  return PERMISSION_EVALUATION_RULES.filter(r => r.recommendedDecision === 'hold_review');
}

export function getPermissionEvaluationRulesBySeverity(severity: PermissionSeverity): PermissionEvaluationRule[] {
  return PERMISSION_EVALUATION_RULES.filter(r => r.severity === severity);
}

export function getPermissionEvaluationRulesByEnforcementStage(stage: PermissionEnforcementStage): PermissionEvaluationRule[] {
  return PERMISSION_EVALUATION_RULES.filter(r => r.enforcementStage === stage);
}

export function getPermissionEvaluationRulesByTargetCenter(center: PermissionTargetCenter): PermissionEvaluationRule[] {
  return PERMISSION_EVALUATION_RULES.filter(r => r.targetCenter === center);
}

export function getPermissionEvaluationMatrixSummary(): {
  total: number;
  allowedPrimaryNav: number;
  holdReview: number;
  denied: number;
  blocking: number;
  warning: number;
  highRiskAllowedNow: number;
} {
  return {
    total: PERMISSION_EVALUATION_RULES.length,
    allowedPrimaryNav: PERMISSION_EVALUATION_RULES.filter(r => r.recommendedDecision === 'allow_primary_nav').length,
    holdReview: PERMISSION_EVALUATION_RULES.filter(r => r.recommendedDecision === 'hold_review').length,
    denied: PERMISSION_EVALUATION_RULES.filter(r => r.recommendedDecision === 'deny').length,
    blocking: PERMISSION_EVALUATION_RULES.filter(r => r.severity === 'blocking').length,
    warning: PERMISSION_EVALUATION_RULES.filter(r => r.severity === 'warning').length,
    highRiskAllowedNow: PERMISSION_EVALUATION_RULES.filter(r => r.risk === 'high' && r.allowedNow).length,
  };
}

export function getPermissionEvaluationSummary(): {
  total: number;
  allowedPrimaryNav: number;
  sidebarVisible: number;
  hiddenDirect: number;
  advancedHub: number;
  launchpadCard: number;
  holdReview: number;
  denied: number;
  highRisk: number;
} {
  return {
    total: PERMISSION_EVALUATION_RULES.length,
    allowedPrimaryNav: PERMISSION_EVALUATION_RULES.filter(r => r.recommendedDecision === 'allow_primary_nav').length,
    sidebarVisible: PERMISSION_EVALUATION_RULES.filter(r => r.recommendedDecision === 'allow_sidebar_visible').length,
    hiddenDirect: PERMISSION_EVALUATION_RULES.filter(r => r.recommendedDecision === 'allow_hidden_direct').length,
    advancedHub: PERMISSION_EVALUATION_RULES.filter(r => r.recommendedDecision === 'allow_advanced_hub').length,
    launchpadCard: PERMISSION_EVALUATION_RULES.filter(r => r.recommendedDecision === 'allow_launchpad_card').length,
    holdReview: PERMISSION_EVALUATION_RULES.filter(r => r.recommendedDecision === 'hold_review').length,
    denied: PERMISSION_EVALUATION_RULES.filter(r => r.recommendedDecision === 'deny').length,
    highRisk: PERMISSION_EVALUATION_RULES.filter(r => r.risk === 'high').length,
  };
}
