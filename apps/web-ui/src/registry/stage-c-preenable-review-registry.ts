// Stage C Pre-Enable Review Registry — static readonly review pack for Stage C activation
// Does not enable Stage C, modify configuration, execute actions, or write to databases.

export type StageCReviewArea =
  | 'permission'
  | 'runtime_contract'
  | 'dry_run'
  | 'audit_store'
  | 'human_approval'
  | 'evidence'
  | 'rollback'
  | 'db_write'
  | 'external_control'
  | 'secret_handling'
  | 'final_seal';

export type StageCReviewStatus =
  | 'ready_for_review'
  | 'blocked'
  | 'requires_human_owner'
  | 'future_only';

export type StageCReviewRisk = 'low' | 'medium' | 'high' | 'critical';

export interface StageCPreEnableReviewItem {
  id: string;
  label: string;
  area: StageCReviewArea;
  status: StageCReviewStatus;
  risk: StageCReviewRisk;
  allowedNow: boolean;
  canEnableStageC: boolean;
  requiresHumanOwnerApproval: boolean;
  requiresFinalSeal: boolean;
  requiresEvidence: boolean;
  requiresRollback: boolean;
  requiresAudit: boolean;
  requiresDbPolicy: boolean;
  requiresExternalControlPolicy: boolean;
  requiredDocs: string[];
  requiredValidators: string[];
  blockers: string[];
  gates: string[];
  blockedActions: string[];
  reason: string;
  nextAction: string;
}

export const STAGE_C_PREENABLE_REVIEW_ITEMS: StageCPreEnableReviewItem[] = [
  {
    id: 'stage-c-global-disabled',
    label: 'Stage C Global Disabled',
    area: 'final_seal',
    status: 'blocked',
    risk: 'critical',
    allowedNow: true,
    canEnableStageC: false,
    requiresHumanOwnerApproval: false,
    requiresFinalSeal: false,
    requiresEvidence: false,
    requiresRollback: false,
    requiresAudit: false,
    requiresDbPolicy: false,
    requiresExternalControlPolicy: false,
    requiredDocs: ['AIP_STAGE_C_FINAL_GATE_POLICY.md'],
    requiredValidators: [],
    blockers: ['Stage C permanently disabled by project policy'],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockedActions: ['enable_stage_c', 'override_stage_c', 'bypass_stage_c_gate', 'activate_stage_c', 'approve_stage_c'],
    reason: 'Stage C is globally disabled by permanent project policy. No activation package has been created. All v7.x work is planning/design-only.',
    nextAction: 'Keep disabled. Do not enable Stage C without human project owner decision and Final Seal.',
  },
  {
    id: 'stage-c-human-owner-required',
    label: 'Stage C Human Owner Required',
    area: 'final_seal',
    status: 'requires_human_owner',
    risk: 'critical',
    allowedNow: true,
    canEnableStageC: false,
    requiresHumanOwnerApproval: true,
    requiresFinalSeal: false,
    requiresEvidence: false,
    requiresRollback: false,
    requiresAudit: false,
    requiresDbPolicy: false,
    requiresExternalControlPolicy: false,
    requiredDocs: ['AIP_STAGE_C_FINAL_GATE_POLICY.md', 'AIP_V7_30_ACCELERATION_PACK.md'],
    requiredValidators: [],
    blockers: ['Human project owner approval required', 'No activation package reviewed'],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled', 'human_owner_required'],
    blockedActions: ['enable_stage_c', 'approve_stage_c', 'create_activation_package', 'deploy_runtime', 'release', 'tag'],
    reason: 'Stage C activation requires human project owner decision. No assistant may enable Stage C. All v7.x work requires human owner sign-off.',
    nextAction: 'Keep disabled. Await human project owner decision. Do not enable without explicit human approval.',
  },
  {
    id: 'stage-c-final-seal-required',
    label: 'Stage C Final Seal Required',
    area: 'final_seal',
    status: 'requires_human_owner',
    risk: 'high',
    allowedNow: true,
    canEnableStageC: false,
    requiresHumanOwnerApproval: true,
    requiresFinalSeal: true,
    requiresEvidence: false,
    requiresRollback: false,
    requiresAudit: false,
    requiresDbPolicy: false,
    requiresExternalControlPolicy: false,
    requiredDocs: ['AIP_VERSION_SEAL_HANDBOOK.md', 'AIP_VALIDATION_AND_SEAL_PROCESS.md'],
    requiredValidators: [],
    blockers: ['Final Seal not yet created', 'No v7.30 Final Seal Recheck completed'],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockedActions: ['enable_stage_c', 'create_final_seal', 'tag', 'release', 'deploy_runtime'],
    reason: 'Stage C activation requires a Final Seal Recheck to confirm all v7.30 phases are complete and no blockers remain.',
    nextAction: 'Complete v7.30 Final Seal Recheck. Do not enable Stage C without Final Seal.',
  },
  {
    id: 'stage-c-permission-gate-required',
    label: 'Stage C Permission Gate Required',
    area: 'permission',
    status: 'ready_for_review',
    risk: 'high',
    allowedNow: true,
    canEnableStageC: false,
    requiresHumanOwnerApproval: true,
    requiresFinalSeal: false,
    requiresEvidence: false,
    requiresRollback: false,
    requiresAudit: false,
    requiresDbPolicy: false,
    requiresExternalControlPolicy: false,
    requiredDocs: ['AIP_PERMISSION_MATRIX.md', 'AIP_PERMISSION_EVALUATOR_PREVIEW.md'],
    requiredValidators: ['permission-evaluator-validator.ts'],
    blockers: ['Permission evaluator not implemented as runtime', 'All permissions are static design-only'],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockedActions: ['enable_stage_c', 'implement_runtime_permission_evaluator', 'deploy_permission_function'],
    reason: 'Permission gate requires a runtime permission evaluator. Current permission model is static design-only. No runtime evaluator exists.',
    nextAction: 'Keep design-only. Do not implement runtime permission without Stage C.',
  },
  {
    id: 'stage-c-runtime-contract-required',
    label: 'Stage C Runtime Contract Required',
    area: 'runtime_contract',
    status: 'ready_for_review',
    risk: 'high',
    allowedNow: true,
    canEnableStageC: false,
    requiresHumanOwnerApproval: true,
    requiresFinalSeal: false,
    requiresEvidence: false,
    requiresRollback: false,
    requiresAudit: false,
    requiresDbPolicy: false,
    requiresExternalControlPolicy: false,
    requiredDocs: ['AIP_RUNTIME_API_CONTRACT_FREEZE.md', 'AIP_RUNTIME_READONLY_STATUS_API_PREVIEW.md', 'AIP_RUNTIME_API_IMPLEMENTATION_FREEZE_CHECKLIST.md'],
    requiredValidators: ['runtime-readonly-status-api-validator.ts'],
    blockers: ['Runtime API contract frozen (v1.freeze)', 'All endpoints contract_only or not_implemented'],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockedActions: ['enable_stage_c', 'implement_runtime_endpoint', 'deploy_api', 'create_mock_server'],
    reason: 'Runtime API contract is frozen at v1.freeze. All 12 endpoints are contract_only or not_implemented. No backend implementation exists.',
    nextAction: 'Keep frozen. Do not implement runtime endpoints without Stage C.',
  },
  {
    id: 'stage-c-dry-run-contract-required',
    label: 'Stage C Dry-run Contract Required',
    area: 'dry_run',
    status: 'ready_for_review',
    risk: 'high',
    allowedNow: true,
    canEnableStageC: false,
    requiresHumanOwnerApproval: true,
    requiresFinalSeal: false,
    requiresEvidence: false,
    requiresRollback: false,
    requiresAudit: false,
    requiresDbPolicy: false,
    requiresExternalControlPolicy: false,
    requiredDocs: ['AIP_RUNTIME_DRY_RUN_CONTRACT_PREVIEW.md'],
    requiredValidators: ['runtime-dry-run-contract-validator.ts'],
    blockers: ['Dry-run contract is readonly preview only', 'No dry-run execution possible'],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockedActions: ['enable_stage_c', 'execute_dry_run', 'implement_dry_run_runtime', 'deploy_dry_run_service'],
    reason: 'Dry-run contract is a readonly preview. No dry-run execution possible without Stage C.',
    nextAction: 'Keep preview. Do not execute dry-run without Stage C.',
  },
  {
    id: 'stage-c-audit-store-contract-required',
    label: 'Stage C Audit Store Contract Required',
    area: 'audit_store',
    status: 'ready_for_review',
    risk: 'high',
    allowedNow: true,
    canEnableStageC: false,
    requiresHumanOwnerApproval: true,
    requiresFinalSeal: false,
    requiresEvidence: false,
    requiresRollback: false,
    requiresAudit: false,
    requiresDbPolicy: false,
    requiresExternalControlPolicy: false,
    requiredDocs: ['AIP_RUNTIME_AUDIT_STORE_CONTRACT_PREVIEW.md'],
    requiredValidators: ['runtime-audit-store-contract-validator.ts'],
    blockers: ['Audit store contract is readonly preview only', 'No audit store implementation exists'],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockedActions: ['enable_stage_c', 'create_audit_store', 'write_audit_log', 'implement_audit_service'],
    reason: 'Audit store contract is a readonly preview. No audit store implementation without Stage C.',
    nextAction: 'Keep preview. Do not implement audit store without Stage C.',
  },
  {
    id: 'stage-c-human-approval-required',
    label: 'Stage C Human Approval Required',
    area: 'human_approval',
    status: 'blocked',
    risk: 'critical',
    allowedNow: true,
    canEnableStageC: false,
    requiresHumanOwnerApproval: true,
    requiresFinalSeal: false,
    requiresEvidence: false,
    requiresRollback: false,
    requiresAudit: false,
    requiresDbPolicy: false,
    requiresExternalControlPolicy: false,
    requiredDocs: ['AIP_HUMAN_APPROVAL_WORKFLOW_SPEC.md', 'AIP_HUMAN_APPROVAL_WORKFLOW_PREVIEW.md'],
    requiredValidators: [],
    blockers: ['Human approval queue not implemented', 'No approval workflow runtime'],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled', 'human_approval_required'],
    blockedActions: ['enable_stage_c', 'create_approval_queue', 'process_approval_candidate', 'approve', 'reject', 'archive'],
    reason: 'Human approval workflow is design-only. No approval queue, no candidate processing, no approve/reject without Stage C.',
    nextAction: 'Keep design-only. Do not implement approval queue without Stage C.',
  },
  {
    id: 'stage-c-evidence-required',
    label: 'Stage C Evidence Required',
    area: 'evidence',
    status: 'ready_for_review',
    risk: 'high',
    allowedNow: true,
    canEnableStageC: false,
    requiresHumanOwnerApproval: true,
    requiresFinalSeal: false,
    requiresEvidence: true,
    requiresRollback: false,
    requiresAudit: false,
    requiresDbPolicy: false,
    requiresExternalControlPolicy: false,
    requiredDocs: ['AIP_EVIDENCE_SCHEMA_PREVIEW.md', 'AIP_RUNTIME_EVIDENCE_SCHEMA_SPEC.md'],
    requiredValidators: [],
    blockers: ['Evidence store not implemented', 'No evidence capture possible'],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled', 'no_evidence_capture'],
    blockedActions: ['enable_stage_c', 'capture_evidence', 'store_evidence', 'implement_evidence_service', 'access_secret_material'],
    reason: 'Evidence schema is design-only. No evidence capture, no evidence store, no secret handling without Stage C.',
    nextAction: 'Keep design-only. Do not implement evidence store without Stage C.',
  },
  {
    id: 'stage-c-rollback-required',
    label: 'Stage C Rollback Required',
    area: 'rollback',
    status: 'ready_for_review',
    risk: 'high',
    allowedNow: true,
    canEnableStageC: false,
    requiresHumanOwnerApproval: true,
    requiresFinalSeal: false,
    requiresEvidence: false,
    requiresRollback: true,
    requiresAudit: false,
    requiresDbPolicy: false,
    requiresExternalControlPolicy: false,
    requiredDocs: ['AIP_ROLLBACK_PREVIEW.md', 'AIP_RUNTIME_ROLLBACK_IDEMPOTENCY_SPEC.md'],
    requiredValidators: [],
    blockers: ['Rollback executor not implemented', 'No rollback possible'],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled', 'no_rollback_execution'],
    blockedActions: ['enable_stage_c', 'execute_rollback', 'restore_file', 'git_mutation', 'implement_rollback_executor'],
    reason: 'Rollback preview is design-only. No rollback executor, no file restore, no git mutation without Stage C.',
    nextAction: 'Keep design-only. Do not implement rollback executor without Stage C.',
  },
  {
    id: 'stage-c-db-policy-required',
    label: 'Stage C DB Policy Required',
    area: 'db_write',
    status: 'blocked',
    risk: 'critical',
    allowedNow: true,
    canEnableStageC: false,
    requiresHumanOwnerApproval: true,
    requiresFinalSeal: false,
    requiresEvidence: false,
    requiresRollback: false,
    requiresAudit: false,
    requiresDbPolicy: true,
    requiresExternalControlPolicy: false,
    requiredDocs: ['AIP_PERMISSION_MATRIX.md', 'AIP_STAGE_C_FINAL_GATE_POLICY.md'],
    requiredValidators: [],
    blockers: ['DB write permanently denied by policy', 'No DB write authorization', 'Stage C required for DB write'],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockedActions: ['enable_stage_c', 'write_db', 'create_db_schema', 'migrate_db', 'seed_data', 'modify_database'],
    reason: 'DB write is permanently denied by project policy. No database operation is permitted without Stage C activation and DB write authorization.',
    nextAction: 'Keep denied. Do not enable DB write without Stage C and human approval.',
  },
  {
    id: 'stage-c-external-control-policy-required',
    label: 'Stage C External Control Policy Required',
    area: 'external_control',
    status: 'blocked',
    risk: 'critical',
    allowedNow: true,
    canEnableStageC: false,
    requiresHumanOwnerApproval: true,
    requiresFinalSeal: false,
    requiresEvidence: false,
    requiresRollback: false,
    requiresAudit: false,
    requiresDbPolicy: false,
    requiresExternalControlPolicy: true,
    requiredDocs: ['AIP_TOOL_CONTROL_BOUNDARY_PLAN.md', 'AIP_CONNECTOR_ACTION_TAXONOMY.md', 'AIP_CONNECTOR_PERMISSION_GATE_MODEL.md'],
    requiredValidators: [],
    blockers: ['External control permanently blocked by policy', 'No runtime authorization', 'Stage C required'],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockedActions: ['enable_stage_c', 'control_external_tool', 'call_external_api', 'implement_runtime_connector', 'deploy_connector_service'],
    reason: 'External control is permanently blocked by project policy. No external tool control without Stage C and runtime authorization.',
    nextAction: 'Keep blocked. Do not enable external control without Stage C and human approval.',
  },
  {
    id: 'stage-c-secret-handling-required',
    label: 'Stage C Secret Handling Required',
    area: 'secret_handling',
    status: 'blocked',
    risk: 'critical',
    allowedNow: true,
    canEnableStageC: false,
    requiresHumanOwnerApproval: true,
    requiresFinalSeal: false,
    requiresEvidence: false,
    requiresRollback: false,
    requiresAudit: false,
    requiresDbPolicy: false,
    requiresExternalControlPolicy: false,
    requiredDocs: ['AIP_EVIDENCE_SCHEMA_PREVIEW.md', 'AIP_RUNTIME_EVIDENCE_SCHEMA_SPEC.md'],
    requiredValidators: [],
    blockers: ['No secret handling policy implemented', 'No token/API key safe storage'],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled', 'no_secret_storage'],
    blockedActions: ['enable_stage_c', 'store_secret', 'capture_token', 'access_credential', 'implement_secret_service'],
    reason: 'Secret handling is blocked. No token, API key, password, secret, private key, or credential may be stored without Stage C.',
    nextAction: 'Keep blocked. Do not implement secret handling without Stage C.',
  },
  {
    id: 'stage-c-candidate-processing-blocked',
    label: 'Stage C Candidate Processing Blocked',
    area: 'human_approval',
    status: 'blocked',
    risk: 'critical',
    allowedNow: true,
    canEnableStageC: false,
    requiresHumanOwnerApproval: true,
    requiresFinalSeal: false,
    requiresEvidence: false,
    requiresRollback: false,
    requiresAudit: false,
    requiresDbPolicy: false,
    requiresExternalControlPolicy: false,
    requiredDocs: ['AIP_HUMAN_APPROVAL_WORKFLOW_SPEC.md'],
    requiredValidators: [],
    blockers: ['Candidate processing requires DB write', 'No approval queue'],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockedActions: ['enable_stage_c', 'process_candidate', 'create_approval_queue', 'approve', 'reject', 'archive', 'write_db'],
    reason: 'Candidate processing is blocked. Requires DB write and approval queue, both disabled without Stage C.',
    nextAction: 'Keep blocked. Do not process candidates without Stage C.',
  },
  {
    id: 'stage-c-execution-blocked',
    label: 'Stage C Execution Blocked',
    area: 'final_seal',
    status: 'blocked',
    risk: 'critical',
    allowedNow: true,
    canEnableStageC: false,
    requiresHumanOwnerApproval: false,
    requiresFinalSeal: false,
    requiresEvidence: false,
    requiresRollback: false,
    requiresAudit: false,
    requiresDbPolicy: false,
    requiresExternalControlPolicy: false,
    requiredDocs: ['AIP_RUNTIME_API_CONTRACT_FREEZE.md'],
    requiredValidators: [],
    blockers: ['No runtime execution possible', 'All actions blocked without Stage C'],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockedActions: ['enable_stage_c', 'execute_any_action', 'run_inference', 'run_scheduler', 'deploy_v2', 'execute_runtime', 'execute_dry_run', 'execute_rollback'],
    reason: 'All runtime execution is blocked. No action may be executed without Stage C. This includes inference, scheduler, deploy, dry-run, and rollback.',
    nextAction: 'Keep blocked. Do not execute any action without Stage C.',
  },
  {
    id: 'stage-c-git-tag-release-blocked',
    label: 'Stage C Git Tag/Release Blocked',
    area: 'final_seal',
    status: 'blocked',
    risk: 'critical',
    allowedNow: true,
    canEnableStageC: false,
    requiresHumanOwnerApproval: false,
    requiresFinalSeal: false,
    requiresEvidence: false,
    requiresRollback: false,
    requiresAudit: false,
    requiresDbPolicy: false,
    requiresExternalControlPolicy: false,
    requiredDocs: ['AIP_VERSION_SEAL_HANDBOOK.md'],
    requiredValidators: [],
    blockers: ['No tag/release without Final Seal', 'Tagging requires human approval'],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockedActions: ['enable_stage_c', 'create_tag', 'create_release', 'push_tag', 'publish_release', 'github_release'],
    reason: 'Git tag and release are blocked. No tag or release may be created without Final Seal and human project owner approval.',
    nextAction: 'Keep blocked. Do not tag or release without Final Seal.',
  },
  {
    id: 'stage-c-file-restore-blocked',
    label: 'Stage C File Restore Blocked',
    area: 'rollback',
    status: 'blocked',
    risk: 'critical',
    allowedNow: true,
    canEnableStageC: false,
    requiresHumanOwnerApproval: false,
    requiresFinalSeal: false,
    requiresEvidence: false,
    requiresRollback: true,
    requiresAudit: false,
    requiresDbPolicy: false,
    requiresExternalControlPolicy: false,
    requiredDocs: ['AIP_ROLLBACK_PREVIEW.md'],
    requiredValidators: [],
    blockers: ['No file restore possible without rollback executor', 'Rollback requires Stage C'],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled', 'no_rollback_execution'],
    blockedActions: ['enable_stage_c', 'restore_file', 'recover_file', 'git_reset', 'git_revert', 'git_checkout', 'overwrite_file'],
    reason: 'File restore is blocked. No file may be restored without rollback executor and Stage C.',
    nextAction: 'Keep blocked. Do not restore files without Stage C.',
  },
  {
    id: 'stage-c-readiness-final-review',
    label: 'Stage C Readiness Final Review',
    area: 'final_seal',
    status: 'ready_for_review',
    risk: 'high',
    allowedNow: true,
    canEnableStageC: false,
    requiresHumanOwnerApproval: true,
    requiresFinalSeal: true,
    requiresEvidence: true,
    requiresRollback: true,
    requiresAudit: true,
    requiresDbPolicy: true,
    requiresExternalControlPolicy: true,
    requiredDocs: [
      'AIP_V7_30_ROADMAP.md',
      'AIP_V7_30_D2_CONTRACT_FREEZE_REPORT.md',
      'AIP_V7_30_ACCELERATION_PACK.md',
      'AIP_VALIDATION_AND_SEAL_PROCESS.md',
      'AIP_VERSION_SEAL_HANDBOOK.md',
      'AIP_STAGE_C_FINAL_GATE_POLICY.md',
    ],
    requiredValidators: [
      'runtime-readonly-status-api-validator.ts',
      'runtime-dry-run-contract-validator.ts',
      'runtime-audit-store-contract-validator.ts',
      'stage-c-preenable-review-validator.ts',
    ],
    blockers: [
      'All 17 previous blockers must be resolved',
      'Human project owner approval required',
      'Final Seal Recheck required',
    ],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockedActions: ['enable_stage_c', 'approve_stage_c', 'create_activation_package', 'deploy_runtime', 'tag', 'release'],
    reason: 'Stage C readiness final review requires all 17 previous items to be reviewed and resolved by the human project owner. This is the final checklist before any Stage C discussion.',
    nextAction: 'Present to human project owner. Do not enable Stage C without explicit human approval after final review.',
  },
];

export function getStageCPreEnableReviewItems(): StageCPreEnableReviewItem[] {
  return STAGE_C_PREENABLE_REVIEW_ITEMS;
}

export function getStageCPreEnableReviewSummary(): {
  total: number;
  byArea: Record<string, number>;
  byStatus: Record<string, number>;
  byRisk: Record<string, number>;
  blocked: number;
  requiresHumanOwner: number;
  requiresFinalSeal: number;
} {
  const all = STAGE_C_PREENABLE_REVIEW_ITEMS;
  const byArea: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const byRisk: Record<string, number> = {};
  for (const item of all) {
    byArea[item.area] = (byArea[item.area] || 0) + 1;
    byStatus[item.status] = (byStatus[item.status] || 0) + 1;
    byRisk[item.risk] = (byRisk[item.risk] || 0) + 1;
  }
  return {
    total: all.length,
    byArea,
    byStatus,
    byRisk,
    blocked: all.filter(i => i.status === 'blocked').length,
    requiresHumanOwner: all.filter(i => i.requiresHumanOwnerApproval).length,
    requiresFinalSeal: all.filter(i => i.requiresFinalSeal).length,
  };
}

export function getStageCReviewItemsByArea(area: StageCReviewArea): StageCPreEnableReviewItem[] {
  return STAGE_C_PREENABLE_REVIEW_ITEMS.filter(i => i.area === area);
}

export function getStageCReviewItemsByStatus(status: StageCReviewStatus): StageCPreEnableReviewItem[] {
  return STAGE_C_PREENABLE_REVIEW_ITEMS.filter(i => i.status === status);
}

export function getStageCReviewItemsByRisk(risk: StageCReviewRisk): StageCPreEnableReviewItem[] {
  return STAGE_C_PREENABLE_REVIEW_ITEMS.filter(i => i.risk === risk);
}

export function getStageCBlockedReviewItems(): StageCPreEnableReviewItem[] {
  return STAGE_C_PREENABLE_REVIEW_ITEMS.filter(i => i.status === 'blocked');
}
