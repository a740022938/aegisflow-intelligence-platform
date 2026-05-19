// Runtime Registry — static readonly model for connector runtime targets
// Does not execute runtimes, call APIs, write to databases, or control external tools.

export type RuntimeTargetKind =
  | 'connector'
  | 'external_tool'
  | 'local_file'
  | 'git'
  | 'database'
  | 'stage_gate'
  | 'memory_hub'
  | 'model_platform'
  | 'workflow_engine';

export type RuntimeActionLevel =
  | 'L0_VIEW_STATIC'
  | 'L1_VIEW_RUNTIME_STATUS'
  | 'L2_GENERATE_TASK_PACKAGE'
  | 'L3_DRY_RUN_PLAN'
  | 'L4_HUMAN_APPROVED_EXECUTE'
  | 'L5_AUTONOMOUS_EXECUTE'
  | 'L6_DESTRUCTIVE_OR_EXTERNAL_WRITE';

export type RuntimeExposure = 'readonly_preview' | 'hidden_route' | 'docs_only' | 'blocked' | 'future_stage_c';

export type RuntimeRisk = 'low' | 'medium' | 'high' | 'critical';

export type RuntimeReadiness = 'available_preview' | 'design_only' | 'blocked' | 'future';

export interface RuntimeRegistryItem {
  id: string;
  label: string;
  targetKind: RuntimeTargetKind;
  actionLevel: RuntimeActionLevel;
  exposure: RuntimeExposure;
  risk: RuntimeRisk;
  readiness: RuntimeReadiness;
  allowedNow: boolean;
  requiresHumanApproval: boolean;
  requiresStageC: boolean;
  requiresAuditLog: boolean;
  requiresRollbackPlan: boolean;
  currentCapability: string[];
  futureCapability: string[];
  blockedActions: string[];
  gates: string[];
  evidence: string[];
  reason: string;
  nextAction: string;
}

export const RUNTIME_REGISTRY: RuntimeRegistryItem[] = [
  {
    id: 'openclaw-status-read',
    label: 'OpenClaw — 状态只读',
    targetKind: 'connector',
    actionLevel: 'L0_VIEW_STATIC',
    exposure: 'readonly_preview',
    risk: 'low',
    readiness: 'available_preview',
    allowedNow: true,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresAuditLog: false,
    requiresRollbackPlan: false,
    currentCapability: ['view_connector_list', 'view_basic_status'],
    futureCapability: ['view_runtime_metrics', 'view_health_history'],
    blockedActions: ['connect', 'disconnect', 'configure', 'update_credentials', 'control'],
    gates: ['readonly_only', 'no_external_control'],
    evidence: ['static_registry_data', 'design_spec'],
    reason: 'OpenClaw connector basic status read. Currently static preview data only. No real connection or control.',
    nextAction: 'Maintain readonly preview. No real connector API calls.',
  },
  {
    id: 'openclaw-task-package-handoff',
    label: 'OpenClaw — 任务包生成',
    targetKind: 'connector',
    actionLevel: 'L2_GENERATE_TASK_PACKAGE',
    exposure: 'readonly_preview',
    risk: 'medium',
    readiness: 'available_preview',
    allowedNow: false,
    requiresHumanApproval: true,
    requiresStageC: false,
    requiresAuditLog: true,
    requiresRollbackPlan: false,
    currentCapability: ['generate_synthetic_task_package', 'preview_task_structure'],
    futureCapability: ['real_task_package_generation', 'task_submission', 'progress_tracking'],
    blockedActions: ['submit_to_connector', 'execute_task', 'modify_connector_state'],
    gates: ['human_approval_required', 'audit_log_required', 'no_direct_control'],
    evidence: ['task_package_design', 'synthetic_generation_only'],
    reason: 'Task package generation is allowed in synthetic mode only. No real submission to OpenClaw. Requires human approval for future real execution.',
    nextAction: 'Keep synthetic-only. No real task submission.',
  },
  {
    id: 'openclaw-controlled-execution',
    label: 'OpenClaw — 受控执行',
    targetKind: 'connector',
    actionLevel: 'L4_HUMAN_APPROVED_EXECUTE',
    exposure: 'future_stage_c',
    risk: 'high',
    readiness: 'blocked',
    allowedNow: false,
    requiresHumanApproval: true,
    requiresStageC: true,
    requiresAuditLog: true,
    requiresRollbackPlan: true,
    currentCapability: [],
    futureCapability: ['controlled_execution', 'progress_monitoring', 'result_collection'],
    blockedActions: ['execute', 'control', 'write_back', 'modify_remote'],
    gates: ['stage_c_disabled', 'human_approval_required', 'audit_log_required', 'rollback_plan_required'],
    evidence: ['design_spec', 'runtime_boundary_plan'],
    reason: 'Controlled execution requires Stage C activation, human approval, audit log, and rollback plan. Currently blocked by design.',
    nextAction: 'Keep blocked. Re-evaluate when Stage C and runtime evaluation are ready.',
  },
  {
    id: 'comfyui-workflow-read',
    label: 'ComfyUI — 工作流只读',
    targetKind: 'workflow_engine',
    actionLevel: 'L0_VIEW_STATIC',
    exposure: 'readonly_preview',
    risk: 'low',
    readiness: 'available_preview',
    allowedNow: true,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresAuditLog: false,
    requiresRollbackPlan: false,
    currentCapability: ['view_workflow_list', 'view_node_structure'],
    futureCapability: ['view_workflow_status', 'view_execution_history'],
    blockedActions: ['run_workflow', 'modify_nodes', 'connect_inputs'],
    gates: ['readonly_only', 'no_external_control'],
    evidence: ['static_registry_data'],
    reason: 'ComfyUI workflow static preview. No real workflow execution or node modification.',
    nextAction: 'Maintain readonly preview.',
  },
  {
    id: 'comfyui-workflow-dry-run',
    label: 'ComfyUI — 工作流 Dry-Run',
    targetKind: 'workflow_engine',
    actionLevel: 'L3_DRY_RUN_PLAN',
    exposure: 'readonly_preview',
    risk: 'medium',
    readiness: 'design_only',
    allowedNow: false,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresAuditLog: true,
    requiresRollbackPlan: false,
    currentCapability: [],
    futureCapability: ['simulate_workflow_execution', 'validate_node_connections', 'preview_output_metadata'],
    blockedActions: ['run_real_workflow', 'execute_on_remote', 'save_results'],
    gates: ['readonly_only', 'audit_log_required', 'no_external_control'],
    evidence: ['design_spec'],
    reason: 'Workflow dry-run is design-only. No real simulation implemented. Requires audit log for future readiness.',
    nextAction: 'Design dry-run interface. Do not connect to real ComfyUI instance.',
  },
  {
    id: 'comfyui-workflow-execute',
    label: 'ComfyUI — 工作流执行',
    targetKind: 'workflow_engine',
    actionLevel: 'L4_HUMAN_APPROVED_EXECUTE',
    exposure: 'future_stage_c',
    risk: 'high',
    readiness: 'blocked',
    allowedNow: false,
    requiresHumanApproval: true,
    requiresStageC: true,
    requiresAuditLog: true,
    requiresRollbackPlan: true,
    currentCapability: [],
    futureCapability: ['execute_workflow', 'monitor_execution', 'collect_results'],
    blockedActions: ['execute', 'control', 'write_outputs', 'modify_environment'],
    gates: ['stage_c_disabled', 'human_approval_required', 'audit_log_required', 'rollback_plan_required'],
    evidence: ['design_spec', 'runtime_boundary_plan'],
    reason: 'Workflow execution requires Stage C, human approval, audit trail, and rollback plan. Currently blocked.',
    nextAction: 'Keep blocked. No real workflow execution.',
  },
  {
    id: 'openaxiom-read',
    label: 'OpenAxiom — 只读诊断',
    targetKind: 'external_tool',
    actionLevel: 'L0_VIEW_STATIC',
    exposure: 'readonly_preview',
    risk: 'low',
    readiness: 'available_preview',
    allowedNow: true,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresAuditLog: false,
    requiresRollbackPlan: false,
    currentCapability: ['view_tool_status', 'view_version_info'],
    futureCapability: ['view_diagnostic_history', 'view_health_metrics'],
    blockedActions: ['write_labels', 'modify_config', 'control_tool'],
    gates: ['readonly_only', 'no_external_control'],
    evidence: ['static_registry_data', 'existing_page'],
    reason: 'OpenAxiom readonly diagnostic overview. Already has a dedicated readonly page. No label writing or tool control.',
    nextAction: 'Maintain readonly preview. Keep existing page.',
  },
  {
    id: 'openaxiom-write-label',
    label: 'OpenAxiom — 写入标签',
    targetKind: 'external_tool',
    actionLevel: 'L6_DESTRUCTIVE_OR_EXTERNAL_WRITE',
    exposure: 'blocked',
    risk: 'critical',
    readiness: 'blocked',
    allowedNow: false,
    requiresHumanApproval: true,
    requiresStageC: true,
    requiresAuditLog: true,
    requiresRollbackPlan: true,
    currentCapability: [],
    futureCapability: ['label_write_under_control', 'batch_label_operation'],
    blockedActions: ['write_labels', 'modify_tool_state', 'overwrite_data'],
    gates: ['stage_c_disabled', 'human_approval_required', 'audit_log_required', 'rollback_plan_required'],
    evidence: ['manual_policy', 'design_spec'],
    reason: 'Label writing is a destructive external write. Permanently blocked. Requires Stage C, human approval, audit log, and rollback plan.',
    nextAction: 'Keep denied. Do not enable label writing in readonly mode.',
  },
  {
    id: 'huggingface-model-metadata-read',
    label: 'Hugging Face — 模型元数据读取',
    targetKind: 'model_platform',
    actionLevel: 'L0_VIEW_STATIC',
    exposure: 'readonly_preview',
    risk: 'low',
    readiness: 'available_preview',
    allowedNow: false,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresAuditLog: false,
    requiresRollbackPlan: false,
    currentCapability: [],
    futureCapability: ['view_model_list', 'view_model_metadata', 'search_models'],
    blockedActions: ['download_model', 'upload_model', 'modify_repo'],
    gates: ['readonly_only', 'no_external_api_call'],
    evidence: ['design_spec'],
    reason: 'Hugging Face model metadata preview is design-only. No real API calls. No model download or upload.',
    nextAction: 'Design static preview data. Do not call Hugging Face API.',
  },
  {
    id: 'huggingface-upload',
    label: 'Hugging Face — 上传模型',
    targetKind: 'model_platform',
    actionLevel: 'L6_DESTRUCTIVE_OR_EXTERNAL_WRITE',
    exposure: 'blocked',
    risk: 'critical',
    readiness: 'blocked',
    allowedNow: false,
    requiresHumanApproval: true,
    requiresStageC: true,
    requiresAuditLog: true,
    requiresRollbackPlan: true,
    currentCapability: [],
    futureCapability: ['controlled_upload', 'versioned_publish'],
    blockedActions: ['upload_model', 'modify_repo', 'publish_release'],
    gates: ['stage_c_disabled', 'human_approval_required', 'audit_log_required', 'rollback_plan_required'],
    evidence: ['manual_policy', 'design_spec'],
    reason: 'Model upload is an external write with high impact. Permanently blocked in v7.x.',
    nextAction: 'Keep denied. Do not allow upload.',
  },
  {
    id: 'memory-hub-read',
    label: 'Memory Hub — 只读',
    targetKind: 'memory_hub',
    actionLevel: 'L0_VIEW_STATIC',
    exposure: 'readonly_preview',
    risk: 'low',
    readiness: 'available_preview',
    allowedNow: true,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresAuditLog: false,
    requiresRollbackPlan: false,
    currentCapability: ['view_memory_list', 'view_candidate_overview'],
    futureCapability: ['view_memory_detail', 'view_processing_history'],
    blockedActions: ['process_candidate', 'archive_candidate', 'reject_candidate', 'sync_lan_share'],
    gates: ['readonly_only', 'no_candidate_processing'],
    evidence: ['static_registry_data', 'existing_page'],
    reason: 'Memory Hub readonly overview. Already has dedicated readonly page. No candidate processing, no DB write.',
    nextAction: 'Maintain readonly preview. Keep existing page.',
  },
  {
    id: 'memory-hub-candidate-process',
    label: 'Memory Hub — Candidate 处理',
    targetKind: 'memory_hub',
    actionLevel: 'L5_AUTONOMOUS_EXECUTE',
    exposure: 'blocked',
    risk: 'high',
    readiness: 'blocked',
    allowedNow: false,
    requiresHumanApproval: true,
    requiresStageC: true,
    requiresAuditLog: true,
    requiresRollbackPlan: true,
    currentCapability: [],
    futureCapability: ['approve_candidate', 'reject_candidate', 'archive_candidate', 'sync_to_lan'],
    blockedActions: ['approve', 'reject', 'archive', 'sync', 'write_database'],
    gates: ['stage_c_disabled', 'human_approval_required', 'audit_log_required', 'rollback_plan_required'],
    evidence: ['manual_policy', 'design_spec'],
    reason: 'Candidate processing requires DB write and Stage C. Currently blocked by policy.',
    nextAction: 'Keep denied. Do not enable candidate processing.',
  },
  {
    id: 'cc-switch-config-read',
    label: 'CC Switch — 配置只读',
    targetKind: 'external_tool',
    actionLevel: 'L0_VIEW_STATIC',
    exposure: 'readonly_preview',
    risk: 'low',
    readiness: 'design_only',
    allowedNow: false,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresAuditLog: false,
    requiresRollbackPlan: false,
    currentCapability: [],
    futureCapability: ['view_switch_config', 'view_routing_rules'],
    blockedActions: ['modify_config', 'switch_tool', 'control_routing'],
    gates: ['readonly_only', 'no_external_control'],
    evidence: ['design_spec'],
    reason: 'CC Switch config preview is design-only. No real config reading or switch control.',
    nextAction: 'Design static preview data. Do not call CC Switch API.',
  },
  {
    id: 'cc-switch-config-write',
    label: 'CC Switch — 配置写入',
    targetKind: 'external_tool',
    actionLevel: 'L6_DESTRUCTIVE_OR_EXTERNAL_WRITE',
    exposure: 'blocked',
    risk: 'critical',
    readiness: 'blocked',
    allowedNow: false,
    requiresHumanApproval: true,
    requiresStageC: true,
    requiresAuditLog: true,
    requiresRollbackPlan: true,
    currentCapability: [],
    futureCapability: ['controlled_config_write', 'routing_rule_update'],
    blockedActions: ['write_config', 'modify_routing', 'control_switch'],
    gates: ['stage_c_disabled', 'human_approval_required', 'audit_log_required', 'rollback_plan_required'],
    evidence: ['manual_policy', 'design_spec'],
    reason: 'CC Switch config write is a destructive external write. Permanently blocked in v7.x.',
    nextAction: 'Keep denied. Do not allow config write.',
  },
  {
    id: 'claude-proxy-config-read',
    label: 'Claude Proxy — 配置只读',
    targetKind: 'external_tool',
    actionLevel: 'L0_VIEW_STATIC',
    exposure: 'readonly_preview',
    risk: 'low',
    readiness: 'design_only',
    allowedNow: false,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresAuditLog: false,
    requiresRollbackPlan: false,
    currentCapability: [],
    futureCapability: ['view_proxy_config', 'view_endpoint_status'],
    blockedActions: ['modify_config', 'switch_endpoint', 'control_proxy'],
    gates: ['readonly_only', 'no_external_control'],
    evidence: ['design_spec'],
    reason: 'Claude Proxy config preview is design-only. No real proxy control or endpoint modification.',
    nextAction: 'Design static preview data. Do not call Claude Proxy API.',
  },
  {
    id: 'claude-proxy-config-write',
    label: 'Claude Proxy — 配置写入',
    targetKind: 'external_tool',
    actionLevel: 'L6_DESTRUCTIVE_OR_EXTERNAL_WRITE',
    exposure: 'blocked',
    risk: 'critical',
    readiness: 'blocked',
    allowedNow: false,
    requiresHumanApproval: true,
    requiresStageC: true,
    requiresAuditLog: true,
    requiresRollbackPlan: true,
    currentCapability: [],
    futureCapability: ['controlled_proxy_config_write', 'endpoint_switch'],
    blockedActions: ['write_config', 'switch_endpoint', 'control_proxy'],
    gates: ['stage_c_disabled', 'human_approval_required', 'audit_log_required', 'rollback_plan_required'],
    evidence: ['manual_policy', 'design_spec'],
    reason: 'Claude Proxy config write is a destructive external write. Permanently blocked in v7.x.',
    nextAction: 'Keep denied. Do not allow config write.',
  },
  {
    id: 'git-commit-push',
    label: 'Git — Commit & Push',
    targetKind: 'git',
    actionLevel: 'L5_AUTONOMOUS_EXECUTE',
    exposure: 'docs_only',
    risk: 'high',
    readiness: 'design_only',
    allowedNow: false,
    requiresHumanApproval: true,
    requiresStageC: false,
    requiresAuditLog: true,
    requiresRollbackPlan: false,
    currentCapability: [],
    futureCapability: ['controlled_git_operations', 'auto_commit_with_review'],
    blockedActions: ['force_push', 'modify_remote', 'delete_branch'],
    gates: ['human_approval_required', 'audit_log_required', 'preview_only'],
    evidence: ['manual_policy', 'design_spec'],
    reason: 'Git commit and push is already available through standard git workflow. Runtime registry preview does not implement git operations.',
    nextAction: 'Keep docs-only. No git operations in runtime registry.',
  },
  {
    id: 'git-tag-release',
    label: 'Git — Tag & Release',
    targetKind: 'git',
    actionLevel: 'L6_DESTRUCTIVE_OR_EXTERNAL_WRITE',
    exposure: 'blocked',
    risk: 'critical',
    readiness: 'blocked',
    allowedNow: false,
    requiresHumanApproval: true,
    requiresStageC: false,
    requiresAuditLog: true,
    requiresRollbackPlan: true,
    currentCapability: [],
    futureCapability: ['controlled_tag_creation', 'release_pipeline'],
    blockedActions: ['create_tag', 'publish_release', 'delete_tag', 'modify_release'],
    gates: ['human_approval_required', 'audit_log_required', 'rollback_plan_required'],
    evidence: ['manual_policy'],
    reason: 'Git tag and release creation is blocked. Tags and releases require explicit human approval. No runtime registry operation creates tags or releases.',
    nextAction: 'Keep denied. Do not create tags or releases.',
  },
  {
    id: 'db-write',
    label: '数据库 — 写入',
    targetKind: 'database',
    actionLevel: 'L6_DESTRUCTIVE_OR_EXTERNAL_WRITE',
    exposure: 'blocked',
    risk: 'critical',
    readiness: 'blocked',
    allowedNow: false,
    requiresHumanApproval: true,
    requiresStageC: true,
    requiresAuditLog: true,
    requiresRollbackPlan: true,
    currentCapability: [],
    futureCapability: ['controlled_db_write', 'audited_data_mutation'],
    blockedActions: ['write', 'update', 'delete', 'alter_schema', 'migrate'],
    gates: ['stage_c_disabled', 'human_approval_required', 'audit_log_required', 'rollback_plan_required'],
    evidence: ['manual_policy'],
    reason: 'Database write is permanently denied. Runtime registry does not write to any database.',
    nextAction: 'Keep denied. Do not allow DB writes.',
  },
  {
    id: 'stage-c-transition',
    label: 'Stage C — 状态转换',
    targetKind: 'stage_gate',
    actionLevel: 'L5_AUTONOMOUS_EXECUTE',
    exposure: 'blocked',
    risk: 'critical',
    readiness: 'blocked',
    allowedNow: false,
    requiresHumanApproval: true,
    requiresStageC: true,
    requiresAuditLog: true,
    requiresRollbackPlan: true,
    currentCapability: [],
    futureCapability: ['stage_c_activation_preview', 'stage_c_readiness_check'],
    blockedActions: ['enable_stage_c', 'activate_stage_c', 'modify_stage_c_state'],
    gates: ['stage_c_disabled', 'human_approval_required', 'audit_log_required', 'rollback_plan_required'],
    evidence: ['manual_policy'],
    reason: 'Stage C is permanently disabled. No transition to Stage C is allowed. This applies to all runtime targets.',
    nextAction: 'Keep denied. Do not enable Stage C.',
  },
];

export function getRuntimeRegistryCount(): number {
  return RUNTIME_REGISTRY.length;
}

export function getRuntimeRegistryByActionLevel(level: RuntimeActionLevel): RuntimeRegistryItem[] {
  return RUNTIME_REGISTRY.filter(item => item.actionLevel === level);
}

export function getRuntimeRegistryByRisk(risk: RuntimeRisk): RuntimeRegistryItem[] {
  return RUNTIME_REGISTRY.filter(item => item.risk === risk);
}

export function getRuntimeRegistryByTargetKind(kind: RuntimeTargetKind): RuntimeRegistryItem[] {
  return RUNTIME_REGISTRY.filter(item => item.targetKind === kind);
}

export function getRuntimeRegistryAllowedNowItems(): RuntimeRegistryItem[] {
  return RUNTIME_REGISTRY.filter(item => item.allowedNow);
}

export function getRuntimeRegistryBlockedItems(): RuntimeRegistryItem[] {
  return RUNTIME_REGISTRY.filter(item => item.readiness === 'blocked');
}

export function getRuntimeRegistryStageCItems(): RuntimeRegistryItem[] {
  return RUNTIME_REGISTRY.filter(item => item.requiresStageC);
}

export function getRuntimeRegistrySummary(): {
  total: number;
  allowedNow: number;
  blocked: number;
  highOrCritical: number;
  requiresStageC: number;
  requiresHumanApproval: number;
  externalWrite: number;
} {
  return {
    total: RUNTIME_REGISTRY.length,
    allowedNow: RUNTIME_REGISTRY.filter(i => i.allowedNow).length,
    blocked: RUNTIME_REGISTRY.filter(i => i.readiness === 'blocked').length,
    highOrCritical: RUNTIME_REGISTRY.filter(i => i.risk === 'high' || i.risk === 'critical').length,
    requiresStageC: RUNTIME_REGISTRY.filter(i => i.requiresStageC).length,
    requiresHumanApproval: RUNTIME_REGISTRY.filter(i => i.requiresHumanApproval).length,
    externalWrite: RUNTIME_REGISTRY.filter(i => i.actionLevel === 'L6_DESTRUCTIVE_OR_EXTERNAL_WRITE').length,
  };
}

export function getRuntimeRegistryTargetKindSummary(): Record<RuntimeTargetKind, number> {
  const result = {} as Record<RuntimeTargetKind, number>;
  for (const kind of ['connector', 'external_tool', 'local_file', 'git', 'database', 'stage_gate', 'memory_hub', 'model_platform', 'workflow_engine'] as RuntimeTargetKind[]) {
    result[kind] = RUNTIME_REGISTRY.filter(i => i.targetKind === kind).length;
  }
  return result;
}

export function getRuntimeRegistryActionLevelSummary(): Record<RuntimeActionLevel, number> {
  const result = {} as Record<RuntimeActionLevel, number>;
  for (const level of ['L0_VIEW_STATIC', 'L1_VIEW_RUNTIME_STATUS', 'L2_GENERATE_TASK_PACKAGE', 'L3_DRY_RUN_PLAN', 'L4_HUMAN_APPROVED_EXECUTE', 'L5_AUTONOMOUS_EXECUTE', 'L6_DESTRUCTIVE_OR_EXTERNAL_WRITE'] as RuntimeActionLevel[]) {
    result[level] = RUNTIME_REGISTRY.filter(i => i.actionLevel === level).length;
  }
  return result;
}
