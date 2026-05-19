// Center Access Registry — static definitions for center access hub
// READONLY METADATA ONLY. Does not change navigation, enable features,
// or execute real operations.

export type CenterAccessKind =
  | 'advanced'
  | 'connector'
  | 'lab'
  | 'governance'
  | 'navigation_preview'
  | 'runtime_registry'
  | 'governance_state_machine'
  | 'human_approval'
  | 'evidence_schema'
  | 'rollback';

export type CenterAccessStatus =
  | 'available_route'
  | 'readonly'
  | 'hidden_direct'
  | 'blocked';

export type CenterAccessRisk = 'low' | 'medium' | 'high';

export type CenterAccessReadiness = 'ready' | 'preview_ready' | 'hold_review' | 'blocked';

export type CenterAccessExposureRecommendation =
  | 'keep_sidebar'
  | 'keep_hidden_direct'
  | 'consider_sidebar_later'
  | 'do_not_expose';

export type CenterAccessSidebarState = 'visible' | 'hidden_direct' | 'blocked';
export type CenterAccessOperationalMode = 'readonly' | 'preview' | 'hold_review' | 'disabled';
export type CenterAccessGroup = 'primary' | 'connector' | 'lab' | 'governance' | 'navigation';

export type AccessLevel =
  | 'primary_nav'
  | 'advanced_nav'
  | 'launchpad_card'
  | 'related_link'
  | 'direct_url_only'
  | 'hidden_internal'
  | 'deferred';

export type ExposureStage = 'design' | 'pilot' | 'stable' | 'retired';
export type ExposureDecision = 'approved' | 'hold' | 'rejected' | 'deferred';
export type CenterMaturity = 'stable' | 'preview' | 'lab' | 'external' | 'hold_review';

export interface CenterAccessQualityGate {
  readonly: boolean;
  noDbWrite: boolean;
  noExternalControl: boolean;
  noStageC: boolean;
  noDangerousActions: boolean;
  noRegistryMutation?: boolean;
}

export interface CenterAccessItem {
  id: string;
  name: string;
  kind: CenterAccessKind;
  route: string;
  status: CenterAccessStatus;
  risk: CenterAccessRisk;
  readiness: CenterAccessReadiness;
  exposureRecommendation: CenterAccessExposureRecommendation;
  visibleInSidebar: boolean;
  allowedNow: boolean;
  safetyBoundary: string[];
  allowedActions: string[];
  blockedActions: string[];
  requiredBeforeExposure: string[];
  releaseGate: string[];
  displayOrder: number;
  group: CenterAccessGroup;
  sidebarState: CenterAccessSidebarState;
  operationalMode: CenterAccessOperationalMode;
  readinessScore: number;
  qualityGate: CenterAccessQualityGate;
  statusBadges: string[];
  description: string;
  notes: string;
  accessLevel: AccessLevel;
  recommendedAccessLevel: AccessLevel;
  launchpadVisible: boolean;
  advancedHubVisible: boolean;
  directUrlAllowed: boolean;
  exposureStage: ExposureStage;
  exposureDecision: ExposureDecision;
  exposureReason: string;
  targetContainer: string;
  rollbackPlan: string;
  userImpact: string;
  maturity: CenterMaturity;
  owner: string;
}

export const CENTER_ACCESS_REGISTRY: CenterAccessItem[] = [
  {
    id: 'advanced-mode-readonly',
    name: 'Advanced Mode Preview',
    kind: 'advanced',
    route: '/advanced-mode-readonly',
    status: 'available_route',
    risk: 'low',
    readiness: 'ready',
    exposureRecommendation: 'keep_sidebar',
    visibleInSidebar: true,
    allowedNow: true,
    safetyBoundary: ['readonly', 'no_execute', 'no_stage_c'],
    allowedActions: ['view_status', 'view_report', 'view_related_route'],
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'release'],
    requiredBeforeExposure: [],
    releaseGate: [],
    displayOrder: 1,
    group: 'primary',
    sidebarState: 'visible',
    operationalMode: 'readonly',
    readinessScore: 100,
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true },
    statusBadges: ['已入菜单', '当前可开放', 'ready'],
    description: '只读门控页面。当前是唯一已入左侧菜单的高级入口。展示导航曝光建议和中心访问信息。',
    notes: 'Advanced Mode Preview — 已入左侧菜单。只读。不启用 Stage C。',
    accessLevel: 'primary_nav',
    recommendedAccessLevel: 'primary_nav',
    launchpadVisible: true,
    advancedHubVisible: true,
    directUrlAllowed: true,
    exposureStage: 'stable',
    exposureDecision: 'approved',
    exposureReason: 'Readonly gate page. Entered sidebar as safe pilot in v7.16.0-P3.',
    targetContainer: 'sidebar',
    rollbackPlan: 'Remove NavItem from Layout.tsx, update 4 registry files.',
    userImpact: 'Low — page is readonly, non-essential for daily work.',
    maturity: 'preview',
    owner: 'governance',
  },
  {
    id: 'connector-center-readonly',
    name: 'Connector Center',
    kind: 'connector',
    route: '/connector-center-readonly',
    status: 'available_route',
    risk: 'low',
    readiness: 'preview_ready',
    exposureRecommendation: 'keep_sidebar',
    visibleInSidebar: true,
    allowedNow: true,
    safetyBoundary: ['readonly', 'no_external_write', 'no_connector_control', 'no_api_call'],
    allowedActions: ['view_status', 'view_report', 'view_related_route'],
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'control_external_tools', 'call_external_api', 'release'],
    requiredBeforeExposure: ['no_real_connector_control', 'readonly_badge', 'manual_review'],
    releaseGate: ['connector_center_enabled_flag', 'no_write_verification'],
    displayOrder: 2,
    group: 'connector',
    sidebarState: 'visible',
    operationalMode: 'readonly',
    readinessScore: 85,
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true },
    statusBadges: ['已入菜单', '当前可开放', 'preview_ready'],
    description: '只读连接器中心。展示 OpenAxiom、Memory Hub、Hugging Face 等外部工具状态。已入左侧菜单。',
    notes: 'Connector Center — 已入左侧菜单。hidden direct route。不接真实控制。P1 sidebar pilot.',
    accessLevel: 'primary_nav',
    recommendedAccessLevel: 'primary_nav',
    launchpadVisible: true,
    advancedHubVisible: true,
    directUrlAllowed: true,
    exposureStage: 'pilot',
    exposureDecision: 'approved',
    exposureReason: 'Sidebar pilot since v7.19.0-P1. Readonly, no real control, no external writes.',
    targetContainer: 'sidebar',
    rollbackPlan: 'Revert commit that added NavItem to Layout.tsx and update 4 registry files.',
    userImpact: 'Medium — users rely on Connector Center for external tool status.',
    maturity: 'preview',
    owner: 'connector',
  },
  {
    id: 'lab-center-readonly',
    name: 'Lab Center',
    kind: 'lab',
    route: '/lab-center-readonly',
    status: 'hidden_direct',
    risk: 'medium',
    readiness: 'preview_ready',
    exposureRecommendation: 'keep_hidden_direct',
    visibleInSidebar: false,
    allowedNow: false,
    safetyBoundary: ['readonly', 'no_training', 'no_inference', 'no_label_save', 'no_dataset_write'],
    allowedActions: ['view_status', 'view_notes', 'generate_task_package'],
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'train_model', 'run_inference', 'save_labels', 'overwrite_dataset', 'release'],
    requiredBeforeExposure: ['no_training', 'no_inference', 'no_label_write', 'lab_warning'],
    releaseGate: ['lab_mode_flag', 'readonly_verification'],
    displayOrder: 3,
    group: 'lab',
    sidebarState: 'hidden_direct',
    operationalMode: 'readonly',
    readinessScore: 60,
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true },
    statusBadges: ['未入菜单', '当前不可开放', 'preview_ready'],
    description: '只读实验室中心。展示 Mahjong Debug 等实验工具状态。未入左侧菜单。',
    notes: 'Lab Center — 未入左侧菜单。hidden direct route。不运行训练/推理/标注。',
    accessLevel: 'direct_url_only',
    recommendedAccessLevel: 'launchpad_card',
    launchpadVisible: true,
    advancedHubVisible: true,
    directUrlAllowed: true,
    exposureStage: 'design',
    exposureDecision: 'hold',
    exposureReason: 'Preview ready but not user-ready. Recommended to expose via Center Launchpad.',
    targetContainer: 'launchpad',
    rollbackPlan: 'No sidebar entry to revert. Remove from launchpad if needed.',
    userImpact: 'Low — only used by advanced users for experimental debug.',
    maturity: 'preview',
    owner: 'lab',
  },
  {
    id: 'governance-center',
    name: 'Governance Center',
    kind: 'governance',
    route: '/governance-center',
    status: 'hidden_direct',
    risk: 'medium',
    readiness: 'hold_review',
    exposureRecommendation: 'do_not_expose',
    visibleInSidebar: false,
    allowedNow: false,
    safetyBoundary: ['readonly', 'no_database_write', 'no_menu_move', 'no_candidate_processing', 'no_stage_c'],
    allowedActions: ['view_status', 'view_report', 'view_risk', 'view_quality_gate', 'view_related_route'],
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'approve_candidate', 'reject_candidate', 'archive_candidate', 'sync_lan_share', 'publish_release', 'create_tag', 'force_push'],
    requiredBeforeExposure: ['stage_c_remains_disabled', 'no_execution_buttons', 'readonly_validator_pass', 'human_approval'],
    releaseGate: ['governance_center_enabled_flag', 'stage_c_disabled_gate', 'readonly_verification'],
    displayOrder: 4,
    group: 'governance',
    sidebarState: 'hidden_direct',
    operationalMode: 'hold_review',
    readinessScore: 40,
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true },
    statusBadges: ['未入菜单', '当前不可开放', 'hold_review'],
    description: '只读治理中心。展示 13 个治理模块、12 个门禁、风险边界。Stage C deferred。未入左侧菜单。',
    notes: 'Governance Center — 未入左侧菜单。readonly。Stage C deferred。不处理 candidate。',
    accessLevel: 'direct_url_only',
    recommendedAccessLevel: 'launchpad_card',
    launchpadVisible: true,
    advancedHubVisible: true,
    directUrlAllowed: true,
    exposureStage: 'design',
    exposureDecision: 'hold',
    exposureReason: 'hold_review readiness. do_not_expose until Stage C disabled and human approval.',
    targetContainer: 'launchpad',
    rollbackPlan: 'No sidebar entry to revert. Remove from launchpad if needed.',
    userImpact: 'Low — governance dashboard primarily for audit and monitoring.',
    maturity: 'hold_review',
    owner: 'governance',
  },
  {
    id: 'navigation-preview-readonly',
    name: 'Navigation Preview',
    kind: 'navigation_preview',
    route: '/navigation-preview-readonly',
    status: 'hidden_direct',
    risk: 'low',
    readiness: 'preview_ready',
    exposureRecommendation: 'keep_hidden_direct',
    visibleInSidebar: false,
    allowedNow: false,
    safetyBoundary: ['readonly', 'no_menu_move', 'no_sidebar_change'],
    allowedActions: ['view_status', 'view_report'],
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'move_menu', 'release'],
    requiredBeforeExposure: ['no_menu_apply', 'no_layout_write', 'no_persistence'],
    releaseGate: [],
    displayOrder: 5,
    group: 'navigation',
    sidebarState: 'hidden_direct',
    operationalMode: 'readonly',
    readinessScore: 70,
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true },
    statusBadges: ['未入菜单', '当前不可开放', 'preview_ready'],
    description: '只读导航预览。展示未来 Connector/Lab/Governance/Advanced 分组结构。未入左侧菜单。',
    notes: 'Navigation Preview — 未入左侧菜单。hidden direct route。不改变真实菜单。',
    accessLevel: 'direct_url_only',
    recommendedAccessLevel: 'direct_url_only',
    launchpadVisible: true,
    advancedHubVisible: false,
    directUrlAllowed: true,
    exposureStage: 'design',
    exposureDecision: 'hold',
    exposureReason: 'Preview non-essential. Keep hidden direct until Center Launchpad is ready.',
    targetContainer: 'launchpad',
    rollbackPlan: 'No sidebar entry to revert. Remove from launchpad if needed.',
    userImpact: 'Very low — preview page only for navigation structure reference.',
    maturity: 'preview',
    owner: 'navigation',
  },
  {
    id: 'dry-run-plan-preview',
    name: 'Dry-run Plan Preview',
    kind: 'runtime_registry',
    route: '/dry-run-plan-preview',
    status: 'hidden_direct',
    risk: 'low',
    readiness: 'preview_ready',
    exposureRecommendation: 'keep_hidden_direct',
    visibleInSidebar: false,
    allowedNow: true,
    safetyBoundary: ['readonly', 'no_dry_run_execution', 'no_db_write', 'no_external_control', 'no_stage_c'],
    allowedActions: ['view_dry_run_plans', 'view_plan_modes', 'view_plan_gates'],
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'control_external_tools', 'execute_dry_run', 'call_external_api', 'release'],
    requiredBeforeExposure: ['readonly_only', 'no_dry_run_implementation'],
    releaseGate: [],
    displayOrder: 7,
    group: 'navigation',
    sidebarState: 'hidden_direct',
    operationalMode: 'readonly',
    readinessScore: 80,
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true },
    statusBadges: ['未入菜单', '当前可开放', 'preview_ready'],
    description: '只读 Dry-run 计划预览。展示所有 dry-run 计划、模式、门禁和风险状态。未入左侧菜单。hidden direct route。',
    notes: 'Dry-run Plan Preview — 未入左侧菜单。hidden direct route。只读预览。不运行 dry-run。不写 DB。不启用 Stage C。',
    accessLevel: 'direct_url_only',
    recommendedAccessLevel: 'direct_url_only',
    launchpadVisible: true,
    advancedHubVisible: true,
    directUrlAllowed: true,
    exposureStage: 'design',
    exposureDecision: 'hold',
    exposureReason: 'Dry-run Plan Preview is design-only. Keep hidden direct until dry-run plan preview is validated and human approval is given.',
    targetContainer: 'launchpad',
    rollbackPlan: 'No sidebar entry to revert. Remove from launchpad if needed.',
    userImpact: 'Low — preview page for dry-run plan planning. No real dry-run execution.',
    maturity: 'preview',
    owner: 'governance',
  },
  {
    id: 'audit-log-preview',
    name: 'Audit Log Preview',
    kind: 'runtime_registry',
    route: '/audit-log-preview',
    status: 'hidden_direct',
    risk: 'medium',
    readiness: 'preview_ready',
    exposureRecommendation: 'keep_hidden_direct',
    visibleInSidebar: false,
    allowedNow: true,
    safetyBoundary: ['readonly', 'no_audit_write', 'no_db_write', 'no_external_control', 'no_stage_c'],
    allowedActions: ['view_audit_events', 'view_event_sources', 'view_traceability'],
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'control_external_tools', 'write_audit_log', 'call_external_api', 'release'],
    requiredBeforeExposure: ['readonly_only', 'no_audit_implementation'],
    releaseGate: [],
    displayOrder: 8,
    group: 'navigation',
    sidebarState: 'hidden_direct',
    operationalMode: 'readonly',
    readinessScore: 80,
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true },
    statusBadges: ['未入菜单', '当前可开放', 'preview_ready'],
    description: '只读审计日志预览。展示所有审计事件模型、来源、保留类和可追溯性。未入左侧菜单。hidden direct route。',
    notes: 'Audit Log Preview — 未入左侧菜单。hidden direct route。只读预览。不写审计库。不写 DB。不启用 Stage C。',
    accessLevel: 'direct_url_only',
    recommendedAccessLevel: 'direct_url_only',
    launchpadVisible: true,
    advancedHubVisible: true,
    directUrlAllowed: true,
    exposureStage: 'design',
    exposureDecision: 'hold',
    exposureReason: 'Audit Log Preview is design-only. Keep hidden direct until audit log preview is validated and human approval is given.',
    targetContainer: 'launchpad',
    rollbackPlan: 'No sidebar entry to revert. Remove from launchpad if needed.',
    userImpact: 'Low — preview page for audit event model planning. No real audit logging.',
    maturity: 'preview',
    owner: 'governance',
  },
  {
    id: 'runtime-registry-preview',
    name: 'Runtime Registry Preview',
    kind: 'runtime_registry',
    route: '/runtime-registry-preview',
    status: 'hidden_direct',
    risk: 'low',
    readiness: 'preview_ready',
    exposureRecommendation: 'keep_hidden_direct',
    visibleInSidebar: false,
    allowedNow: true,
    safetyBoundary: ['readonly', 'no_runtime_execution', 'no_db_write', 'no_external_control', 'no_stage_c'],
    allowedActions: ['view_runtime_registry', 'view_target_capabilities', 'view_gate_model'],
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'control_external_tools', 'execute_runtime', 'call_external_api', 'release'],
    requiredBeforeExposure: ['readonly_only', 'no_runtime_implementation'],
    releaseGate: [],
    displayOrder: 6,
    group: 'navigation',
    sidebarState: 'hidden_direct',
    operationalMode: 'readonly',
    readinessScore: 80,
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true },
    statusBadges: ['未入菜单', '当前可开放', 'preview_ready'],
    description: '只读运行时注册表预览。展示连接器运行时目标、动作等级、门禁和风险状态。未入左侧菜单。hidden direct route。',
    notes: 'Runtime Registry Preview — 未入左侧菜单。hidden direct route。只读预览。不运行外部工具。不写 DB。不启用 Stage C。',
    accessLevel: 'direct_url_only',
    recommendedAccessLevel: 'direct_url_only',
    launchpadVisible: true,
    advancedHubVisible: true,
    directUrlAllowed: true,
    exposureStage: 'design',
    exposureDecision: 'hold',
    exposureReason: 'Runtime Registry Preview is design-only. Keep hidden direct until runtime preview is validated and human approval is given.',
    targetContainer: 'launchpad',
    rollbackPlan: 'No sidebar entry to revert. Remove from launchpad if needed.',
    userImpact: 'Low — preview page for runtime capability planning. No real runtime execution.',
    maturity: 'preview',
    owner: 'governance',
  },
  {
    id: 'governance-state-machine-preview',
    name: 'Governance State Machine Preview',
    kind: 'governance_state_machine',
    route: '/governance-state-machine-preview',
    status: 'hidden_direct',
    risk: 'low',
    readiness: 'preview_ready',
    exposureRecommendation: 'keep_hidden_direct',
    visibleInSidebar: false,
    allowedNow: true,
    safetyBoundary: ['readonly', 'no_state_transition', 'no_db_write', 'no_external_control', 'no_stage_c'],
    allowedActions: ['view_governance_states', 'view_transitions', 'view_gate_model', 'view_risk_board'],
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'control_external_tools', 'execute_state_transition', 'process_approval', 'call_external_api', 'release'],
    requiredBeforeExposure: ['readonly_only', 'no_governance_execution'],
    releaseGate: [],
    displayOrder: 9,
    group: 'navigation',
    sidebarState: 'hidden_direct',
    operationalMode: 'readonly',
    readinessScore: 80,
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true },
    statusBadges: ['未入菜单', '当前可开放', 'preview_ready'],
    description: '只读治理状态机预览。展示 7 个状态、18 个迁移、门禁模型、风险面板和验证摘要。未入左侧菜单。hidden direct route。',
    notes: 'Governance State Machine Preview — 未入左侧菜单。hidden direct route。只读预览。不迁移状态。不处理审批。不写 DB。不启用 Stage C。',
    accessLevel: 'direct_url_only',
    recommendedAccessLevel: 'direct_url_only',
    launchpadVisible: true,
    advancedHubVisible: true,
    directUrlAllowed: true,
    exposureStage: 'design',
    exposureDecision: 'hold',
    exposureReason: 'Governance State Machine Preview is design-only. Keep hidden direct until governance state machine is validated and human approval is given.',
    targetContainer: 'launchpad',
    rollbackPlan: 'No sidebar entry to revert. Remove from launchpad if needed.',
    userImpact: 'Low — preview page for governance state machine model planning. No real state transitions.',
    maturity: 'preview',
    owner: 'governance',
  },
  {
    id: 'human-approval-workflow-preview',
    name: 'Human Approval Workflow Preview',
    kind: 'human_approval',
    route: '/human-approval-workflow-preview',
    status: 'hidden_direct',
    risk: 'medium',
    readiness: 'preview_ready',
    exposureRecommendation: 'keep_hidden_direct',
    visibleInSidebar: false,
    allowedNow: true,
    safetyBoundary: ['readonly', 'no_approval_queue', 'no_candidate_processing', 'no_db_write', 'no_external_control', 'no_stage_c'],
    allowedActions: ['view_approval_workflow', 'view_approval_states', 'view_decisions', 'view_evidence_rollback'],
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'control_external_tools', 'create_approval_queue', 'process_candidate', 'execute_action', 'call_external_api', 'release'],
    requiredBeforeExposure: ['readonly_only', 'no_approval_implementation'],
    releaseGate: [],
    displayOrder: 10,
    group: 'navigation',
    sidebarState: 'hidden_direct',
    operationalMode: 'readonly',
    readinessScore: 80,
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true },
    statusBadges: ['未入菜单', '当前可开放', 'preview_ready'],
    description: '只读人工审批流程预览。展示 20 个审批工作流项目、状态面板、请求类型、决策矩阵、证据/回滚面板和验证摘要。未入左侧菜单。hidden direct route。',
    notes: 'Human Approval Workflow Preview — 未入左侧菜单。hidden direct route。只读预览。不创建审批队列。不处理 candidate。不写 DB。不启用 Stage C。',
    accessLevel: 'direct_url_only',
    recommendedAccessLevel: 'direct_url_only',
    launchpadVisible: true,
    advancedHubVisible: true,
    directUrlAllowed: true,
    exposureStage: 'design',
    exposureDecision: 'hold',
    exposureReason: 'Human Approval Workflow Preview is design-only. Keep hidden direct until human approval workflow is validated and human approval is given.',
    targetContainer: 'launchpad',
    rollbackPlan: 'No sidebar entry to revert. Remove from launchpad if needed.',
    userImpact: 'Low — preview page for human approval workflow model planning. No real approval processing.',
    maturity: 'preview',
    owner: 'governance',
  },
  {
    id: 'evidence-schema-preview',
    name: 'Evidence Schema Preview',
    kind: 'evidence_schema',
    route: '/evidence-schema-preview',
    status: 'hidden_direct',
    risk: 'medium',
    readiness: 'preview_ready',
    exposureRecommendation: 'keep_hidden_direct',
    visibleInSidebar: false,
    allowedNow: true,
    safetyBoundary: ['readonly', 'no_evidence_capture', 'no_secret_storage', 'no_db_write', 'no_external_control', 'no_stage_c'],
    allowedActions: ['view_evidence_schema', 'view_evidence_types', 'view_sources', 'view_sensitivity_retention', 'view_redaction_policy', 'view_attestation'],
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'control_external_tools', 'capture_evidence', 'save_evidence', 'store_secret', 'call_external_api', 'release'],
    requiredBeforeExposure: ['readonly_only', 'no_evidence_implementation'],
    releaseGate: [],
    displayOrder: 11,
    group: 'navigation',
    sidebarState: 'hidden_direct',
    operationalMode: 'readonly',
    readinessScore: 80,
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true },
    statusBadges: ['未入菜单', '当前可开放', 'preview_ready'],
    description: '只读证据模型预览。展示 23 个证据 schema 项目、证据类型面板、来源矩阵、敏感度/保留策略、脱敏策略、证明面板和验证摘要。未入左侧菜单。hidden direct route。',
    notes: 'Evidence Schema Preview — 未入左侧菜单。hidden direct route。只读预览。不采集证据。不保存 secret。不写 evidence store。不写 DB。不启用 Stage C。',
    accessLevel: 'direct_url_only',
    recommendedAccessLevel: 'direct_url_only',
    launchpadVisible: true,
    advancedHubVisible: true,
    directUrlAllowed: true,
    exposureStage: 'design',
    exposureDecision: 'hold',
    exposureReason: 'Evidence Schema Preview is design-only. Keep hidden direct until evidence schema is validated and human approval is given.',
    targetContainer: 'launchpad',
    rollbackPlan: 'No sidebar entry to revert. Remove from launchpad if needed.',
    userImpact: 'Low — preview page for evidence schema model planning. No evidence capture or secret storage.',
    maturity: 'preview',
    owner: 'governance',
  },
  {
    id: 'rollback-preview',
    name: 'Rollback Preview',
    kind: 'rollback',
    route: '/rollback-preview',
    status: 'hidden_direct',
    risk: 'medium',
    readiness: 'preview_ready',
    exposureRecommendation: 'keep_hidden_direct',
    visibleInSidebar: false,
    allowedNow: true,
    safetyBoundary: ['readonly', 'no_rollback_execution', 'no_file_restore', 'no_git_mutation', 'no_db_write', 'no_external_control', 'no_stage_c'],
    allowedActions: ['view_rollback_risk', 'view_idempotency', 'view_preconditions', 'view_evidence_requirements', 'view_blocked_rollback'],
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'control_external_tools', 'execute_rollback', 'restore_file', 'git_reset', 'git_revert', 'git_tag', 'git_release', 'call_external_api', 'release'],
    requiredBeforeExposure: ['readonly_only', 'no_rollback_implementation'],
    releaseGate: [],
    displayOrder: 12,
    group: 'navigation',
    sidebarState: 'hidden_direct',
    operationalMode: 'readonly',
    readinessScore: 80,
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true },
    statusBadges: ['未入菜单', '当前可开放', 'preview_ready'],
    description: '只读回滚风险评估预览。展示 22 个回滚注册表项目、回滚目标面板、幂等性检查、前置条件、证据需求、阻断回滚面板和验证摘要。未入左侧菜单。hidden direct route。',
    notes: 'Rollback Preview — 未入左侧菜单。hidden direct route。只读预览。不执行回滚。不恢复文件。不执行 Git reset/revert/tag/release。不写 DB。不启用 Stage C。',
    accessLevel: 'direct_url_only',
    recommendedAccessLevel: 'direct_url_only',
    launchpadVisible: true,
    advancedHubVisible: true,
    directUrlAllowed: true,
    exposureStage: 'design',
    exposureDecision: 'hold',
    exposureReason: 'Rollback Preview is design-only. Keep hidden direct until rollback risk assessment is validated and human approval is given.',
    targetContainer: 'launchpad',
    rollbackPlan: 'No sidebar entry to revert. Remove from launchpad if needed.',
    userImpact: 'Low — preview page for rollback risk assessment planning. No rollback execution or file restore.',
    maturity: 'preview',
    owner: 'governance',
  },
  {
    id: 'governance-console-risk-dashboard-preview',
    name: 'Governance Console Risk Dashboard Preview',
    kind: 'governance',
    route: '/governance-console-risk-dashboard-preview',
    status: 'hidden_direct',
    risk: 'low',
    readiness: 'preview_ready',
    exposureRecommendation: 'keep_hidden_direct',
    visibleInSidebar: false,
    allowedNow: true,
    safetyBoundary: ['readonly', 'no_risk_execution', 'no_gate_control', 'no_db_write', 'no_external_control', 'no_stage_c'],
    allowedActions: ['view_risk_dashboard', 'view_risk_aggregation', 'view_risk_categories'],
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'control_external_tools', 'execute_gate', 'mutate_registry', 'release'],
    requiredBeforeExposure: ['readonly_only', 'no_risk_implementation'],
    releaseGate: [],
    displayOrder: 14,
    group: 'navigation',
    sidebarState: 'hidden_direct',
    operationalMode: 'readonly',
    readinessScore: 85,
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true, noRegistryMutation: true },
    statusBadges: ['未入菜单', '当前可开放', 'preview_ready'],
    description: '只读风险面板预览。从6个来源聚合风险：权限、运行时、dry-run、审计、治理、审批、证据、回滚。未入左侧菜单。hidden direct route。',
    notes: 'Risk Dashboard Preview — 未入左侧菜单。hidden direct route。只读风险聚合。不执行门控。不写 DB。不启用 Stage C。',
    accessLevel: 'direct_url_only',
    recommendedAccessLevel: 'direct_url_only',
    launchpadVisible: true,
    advancedHubVisible: true,
    directUrlAllowed: true,
    exposureStage: 'design',
    exposureDecision: 'hold',
    exposureReason: 'Governance Console Risk Dashboard Preview is readonly. Keep hidden direct until human decision after v7.29 Final Seal.',
    targetContainer: 'launchpad',
    rollbackPlan: 'No sidebar entry to revert. Remove from launchpad if needed.',
    userImpact: 'Low — preview page for risk dashboard aggregation. No risk execution or gate control.',
    maturity: 'preview',
    owner: 'governance',
  },
  {
    id: 'governance-console-decision-panel-preview',
    name: 'Governance Console Decision Panel Preview',
    kind: 'governance',
    route: '/governance-console-decision-panel-preview',
    status: 'hidden_direct',
    risk: 'low',
    readiness: 'preview_ready',
    exposureRecommendation: 'keep_hidden_direct',
    visibleInSidebar: false,
    allowedNow: true,
    safetyBoundary: ['readonly', 'no_decision_execution', 'no_db_write', 'no_external_control', 'no_stage_c'],
    allowedActions: ['view_decision_panel', 'view_decision_types', 'view_decision_details'],
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'control_external_tools', 'approve', 'reject', 'execute_action', 'mutate_registry', 'release'],
    requiredBeforeExposure: ['readonly_only', 'no_decision_implementation'],
    releaseGate: [],
    displayOrder: 15,
    group: 'navigation',
    sidebarState: 'hidden_direct',
    operationalMode: 'readonly',
    readinessScore: 85,
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true, noRegistryMutation: true },
    statusBadges: ['未入菜单', '当前可开放', 'preview_ready'],
    description: '只读决策面板预览。展示14种决策类型，包括继续预览、人工审批、阻断等。未入左侧菜单。hidden direct route。',
    notes: 'Decision Panel Preview — 未入左侧菜单。hidden direct route。只读决策展示。不执行审批/拒绝。不写 DB。不启用 Stage C。',
    accessLevel: 'direct_url_only',
    recommendedAccessLevel: 'direct_url_only',
    launchpadVisible: true,
    advancedHubVisible: true,
    directUrlAllowed: true,
    exposureStage: 'design',
    exposureDecision: 'hold',
    exposureReason: 'Governance Console Decision Panel Preview is readonly. Keep hidden direct until human decision after v7.29 Final Seal.',
    targetContainer: 'launchpad',
    rollbackPlan: 'No sidebar entry to revert. Remove from launchpad if needed.',
    userImpact: 'Low — preview page for decision panel display. No decision execution.',
    maturity: 'preview',
    owner: 'governance',
  },
  {
    id: 'governance-console-report-pack-preview',
    name: 'Governance Console Report Pack Preview',
    kind: 'governance',
    route: '/governance-console-report-pack-preview',
    status: 'hidden_direct',
    risk: 'low',
    readiness: 'preview_ready',
    exposureRecommendation: 'keep_hidden_direct',
    visibleInSidebar: false,
    allowedNow: true,
    safetyBoundary: ['readonly', 'no_report_export', 'no_report_storage', 'no_db_write', 'no_external_control', 'no_stage_c'],
    allowedActions: ['view_report_pack', 'view_report_sections', 'view_report_fields'],
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'control_external_tools', 'export_report', 'store_report', 'mutate_registry', 'release'],
    requiredBeforeExposure: ['readonly_only', 'no_report_implementation'],
    releaseGate: [],
    displayOrder: 16,
    group: 'navigation',
    sidebarState: 'hidden_direct',
    operationalMode: 'readonly',
    readinessScore: 85,
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true, noRegistryMutation: true },
    statusBadges: ['未入菜单', '当前可开放', 'preview_ready'],
    description: '只读报告包预览。定义11个报告章节及字段、来源注册表和禁用字段。未入左侧菜单。hidden direct route。',
    notes: 'Report Pack Preview — 未入左侧菜单。hidden direct route。只读报告定义。不生成真实文件。不存储报告。不写 DB。不启用 Stage C。',
    accessLevel: 'direct_url_only',
    recommendedAccessLevel: 'direct_url_only',
    launchpadVisible: true,
    advancedHubVisible: true,
    directUrlAllowed: true,
    exposureStage: 'design',
    exposureDecision: 'hold',
    exposureReason: 'Governance Console Report Pack Preview is readonly. Keep hidden direct until human decision after v7.29 Final Seal.',
    targetContainer: 'launchpad',
    rollbackPlan: 'No sidebar entry to revert. Remove from launchpad if needed.',
    userImpact: 'Low — preview page for report pack definition. No real export or storage.',
    maturity: 'preview',
    owner: 'governance',
  },
  {
    id: 'governance-console-preview',
    name: 'Governance Console Preview',
    kind: 'governance',
    route: '/governance-console-preview',
    status: 'hidden_direct',
    risk: 'low',
    readiness: 'preview_ready',
    exposureRecommendation: 'keep_hidden_direct',
    visibleInSidebar: false,
    allowedNow: true,
    safetyBoundary: ['readonly', 'no_registry_mutation', 'no_execution', 'no_db_write', 'no_external_control', 'no_stage_c'],
    allowedActions: ['view_console_overview', 'view_registry_chain', 'view_risk_aggregation', 'view_decision_panel', 'view_traceability', 'view_validator_summary'],
    blockedActions: ['mutate_registry', 'execute_action', 'write_database', 'control_external_tools', 'enable_stage_c', 'approve', 'reject', 'rollback', 'modify_sidebar'],
    requiredBeforeExposure: ['readonly_only', 'no_console_implementation'],
    releaseGate: [],
    displayOrder: 13,
    group: 'navigation',
    sidebarState: 'hidden_direct',
    operationalMode: 'readonly',
    readinessScore: 85,
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true, noRegistryMutation: true },
    statusBadges: ['未入菜单', '当前可开放', 'preview_ready'],
    description: '治理总控台只读聚合预览。展示权限注册表、运行时、dry-run、审计、状态机、审批、证据、回滚的整体状态，风险聚合、决策面板和验证摘要。未入左侧菜单。hidden direct route。',
    notes: 'Governance Console Preview — 未入左侧菜单。hidden direct route。只读聚合。不改变 registry。不执行 action。不写 DB。不控制外部工具。不启用 Stage C。',
    accessLevel: 'direct_url_only',
    recommendedAccessLevel: 'direct_url_only',
    launchpadVisible: true,
    advancedHubVisible: true,
    directUrlAllowed: true,
    exposureStage: 'design',
    exposureDecision: 'hold',
    exposureReason: 'Governance Console Preview is readonly aggregation. Keep hidden direct until human decision after v7.29 Final Seal.',
    targetContainer: 'launchpad',
    rollbackPlan: 'No sidebar entry to revert. Remove from launchpad if needed.',
    userImpact: 'Low — preview page for governance console aggregation. No registry mutation or execution.',
    maturity: 'preview',
    owner: 'governance',
  },
  {
    id: 'runtime-readonly-status-api-preview',
    name: 'Runtime Readonly Status API Preview',
    kind: 'runtime_registry',
    route: '/runtime-readonly-status-api-preview',
    status: 'hidden_direct',
    risk: 'medium',
    readiness: 'preview_ready',
    exposureRecommendation: 'keep_hidden_direct',
    visibleInSidebar: false,
    allowedNow: true,
    safetyBoundary: ['readonly', 'get_only', 'no_db_write', 'no_external_control', 'no_stage_c'],
    allowedActions: ['view_contract_catalog', 'view_schema_board', 'view_mock_responses', 'view_gate_model', 'view_error_model', 'view_validator_summary', 'view_backend_skeleton'],
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'control_external_tools', 'implement_post_endpoint', 'deploy_mock_server', 'call_external_api', 'release'],
    requiredBeforeExposure: ['readonly_only', 'get_only', 'no_post', 'no_db_write'],
    releaseGate: [],
    displayOrder: 17,
    group: 'navigation',
    sidebarState: 'hidden_direct',
    operationalMode: 'readonly',
    readinessScore: 80,
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true },
    statusBadges: ['未入菜单', '当前可开放', 'preview_ready'],
    description: '只读 Runtime Status API 契约预览。展示 12 个 endpoint catalog、schema board、mock response board、gate model、error model 和 validator summary。未入左侧菜单。hidden direct route。不实现 backend endpoint。',
    notes: 'Runtime Readonly Status API Preview — 未入左侧菜单。hidden direct route。只读契约预览。不新增 endpoint。不接后端。不写 DB。不启用 Stage C。',
    accessLevel: 'direct_url_only',
    recommendedAccessLevel: 'direct_url_only',
    launchpadVisible: true,
    advancedHubVisible: true,
    directUrlAllowed: true,
    exposureStage: 'design',
    exposureDecision: 'hold',
    exposureReason: 'Runtime Readonly Status API Preview is readonly contract preview. Keep hidden direct until v7.30 Final Seal.',
    targetContainer: 'launchpad',
    rollbackPlan: 'No sidebar entry to revert. Remove from launchpad if needed.',
    userImpact: 'Low — preview page for runtime API contract browsing. No real endpoint implementation.',
    maturity: 'preview',
    owner: 'governance',
  },
  {
    id: 'runtime-dry-run-contract-preview',
    name: 'Runtime Dry-run Contract Preview',
    kind: 'runtime_registry',
    route: '/runtime-dry-run-contract-preview',
    status: 'hidden_direct',
    risk: 'medium',
    readiness: 'preview_ready',
    exposureRecommendation: 'keep_hidden_direct',
    visibleInSidebar: false,
    allowedNow: true,
    safetyBoundary: ['readonly', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'no_stage_c'],
    allowedActions: ['view_dry_run_contract', 'view_request_response_spec', 'view_gate_spec', 'view_evidence_spec', 'view_audit_spec', 'view_rollback_spec', 'view_validator_summary'],
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'control_external_tools', 'implement_endpoint', 'execute_dry_run', 'call_external_api', 'release'],
    requiredBeforeExposure: ['readonly_only', 'no_backend_implementation'],
    releaseGate: [],
    displayOrder: 18,
    group: 'navigation',
    sidebarState: 'hidden_direct',
    operationalMode: 'readonly',
    readinessScore: 80,
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true },
    statusBadges: ['未入菜单', '当前可开放', 'preview_ready'],
    description: '只读 Runtime Dry-run 契约预览。展示 18 个 dry-run 契约项（request/response/gate/evidence/audit/rollback）。未入左侧菜单。hidden direct route。不执行 dry-run。',
    notes: 'Runtime Dry-run Contract Preview — 未入左侧菜单。hidden direct route。只读契约预览。不执行 dry-run。不写 DB。不启用 Stage C。',
    accessLevel: 'direct_url_only',
    recommendedAccessLevel: 'direct_url_only',
    launchpadVisible: true,
    advancedHubVisible: true,
    directUrlAllowed: true,
    exposureStage: 'design',
    exposureDecision: 'hold',
    exposureReason: 'Runtime Dry-run Contract Preview is readonly contract preview. Keep hidden direct until v7.30 Final Seal.',
    targetContainer: 'launchpad',
    rollbackPlan: 'No sidebar entry to revert. Remove from launchpad if needed.',
    userImpact: 'Low — preview page for dry-run contract browsing. Does not execute dry-run.',
    maturity: 'preview',
    owner: 'governance',
  },
  {
    id: 'runtime-audit-store-contract-preview',
    name: 'Runtime Audit Store Contract Preview',
    kind: 'runtime_registry',
    route: '/runtime-audit-store-contract-preview',
    status: 'hidden_direct',
    risk: 'medium',
    readiness: 'preview_ready',
    exposureRecommendation: 'keep_hidden_direct',
    visibleInSidebar: false,
    allowedNow: true,
    safetyBoundary: ['readonly', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'no_stage_c'],
    allowedActions: ['view_audit_store_contract', 'view_event_schema', 'view_retention_policy', 'view_redaction_policy', 'view_write_policy', 'view_validator_summary'],
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'control_external_tools', 'implement_endpoint', 'create_audit_store', 'call_external_api', 'release'],
    requiredBeforeExposure: ['readonly_only', 'no_backend_implementation'],
    releaseGate: [],
    displayOrder: 19,
    group: 'navigation',
    sidebarState: 'hidden_direct',
    operationalMode: 'readonly',
    readinessScore: 80,
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true },
    statusBadges: ['未入菜单', '当前可开放', 'preview_ready'],
    description: '只读 Runtime Audit Store 契约预览。展示 16 个审计存储契约项（schema/retention/redaction/write policy）。未入左侧菜单。hidden direct route。不创建 store。',
    notes: 'Runtime Audit Store Contract Preview — 未入左侧菜单。hidden direct route。只读契约预览。不创建 store。不写 DB。不启用 Stage C。',
    accessLevel: 'direct_url_only',
    recommendedAccessLevel: 'direct_url_only',
    launchpadVisible: true,
    advancedHubVisible: true,
    directUrlAllowed: true,
    exposureStage: 'design',
    exposureDecision: 'hold',
    exposureReason: 'Runtime Audit Store Contract Preview is readonly contract preview. Keep hidden direct until v7.30 Final Seal.',
    targetContainer: 'launchpad',
    rollbackPlan: 'No sidebar entry to revert. Remove from launchpad if needed.',
    userImpact: 'Low — preview page for audit store contract browsing. Does not create store.',
    maturity: 'preview',
    owner: 'governance',
  },
  {
    id: 'stage-c-preenable-review-preview',
    name: 'Stage C Pre-Enable Human Review Pack',
    kind: 'runtime_registry',
    route: '/stage-c-preenable-review-preview',
    status: 'hidden_direct',
    risk: 'medium',
    readiness: 'preview_ready',
    exposureRecommendation: 'keep_hidden_direct',
    visibleInSidebar: false,
    allowedNow: true,
    safetyBoundary: ['readonly', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'no_stage_c'],
    allowedActions: ['view_stage_c_review_pack', 'view_prerequisites', 'view_requirements_checklist', 'view_blocker_summary', 'view_validator_summary'],
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'control_external_tools', 'implement_endpoint', 'activate_stage_c', 'call_external_api', 'release'],
    requiredBeforeExposure: ['readonly_only', 'no_backend_implementation'],
    releaseGate: [],
    displayOrder: 20,
    group: 'navigation',
    sidebarState: 'hidden_direct',
    operationalMode: 'readonly',
    readinessScore: 80,
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true },
    statusBadges: ['未入菜单', '当前可开放', 'preview_ready'],
    description: '只读 Stage C Pre-Enable Human Review Pack。展示 18 个预启用审核项（11 个审核区域）。未入左侧菜单。hidden direct route。不启用 Stage C。',
    notes: 'Stage C Pre-Enable Human Review Pack — 未入左侧菜单。hidden direct route。只读审核清单。不启用 Stage C。不写 DB。',
    accessLevel: 'direct_url_only',
    recommendedAccessLevel: 'direct_url_only',
    launchpadVisible: true,
    advancedHubVisible: true,
    directUrlAllowed: true,
    exposureStage: 'design',
    exposureDecision: 'hold',
    exposureReason: 'Stage C Pre-Enable Human Review Pack is readonly review pack. Keep hidden direct. Does NOT enable Stage C.',
    targetContainer: 'launchpad',
    rollbackPlan: 'No sidebar entry to revert. Remove from launchpad if needed.',
    userImpact: 'Low — preview page for Stage C pre-enable review checklist. Does not enable Stage C.',
    maturity: 'preview',
    owner: 'governance',
  },
  {
    id: 'operator-console-registry-preview',
    name: 'Operator Console Registry Preview',
    kind: 'runtime_registry',
    route: '/operator-console-registry-preview',
    status: 'hidden_direct',
    risk: 'medium',
    readiness: 'preview_ready',
    exposureRecommendation: 'keep_hidden_direct',
    visibleInSidebar: false,
    allowedNow: true,
    safetyBoundary: ['readonly', 'no_execute', 'no_db_write', 'no_external_control', 'no_stage_c'],
    allowedActions: ['view_registry', 'view_validator', 'view_boundary_cards', 'view_seal_baseline'],
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'control_external_tools', 'call_external_api', 'implement_post_endpoint', 'release'],
    requiredBeforeExposure: ['readonly_only', 'no_post', 'no_db_write', 'validator_pass', 'registry_complete'],
    releaseGate: [],
    displayOrder: 999,
    group: 'governance',
    sidebarState: 'hidden_direct',
    operationalMode: 'readonly',
    readinessScore: 95,
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true },
    statusBadges: ['未入菜单', '当前可开放', 'preview_ready'],
    description: 'Operator Console Registry Preview — 20 个只读 registry 条目，覆盖 system/runtime/governance/approval/permission/evidence/audit/rollback/risk/boundary/operator/docs 领域。未入左侧菜单。hidden direct route。',
    notes: 'Operator Console Registry Preview — P1 readonly registry preview。20 items，全部 readonly/actionAllowed=false/mutationAllowed=false。不入 sidebar。不启用 Stage C。不写 DB。不控制外部工具。',
    accessLevel: 'direct_url_only',
    recommendedAccessLevel: 'direct_url_only',
    launchpadVisible: true,
    advancedHubVisible: true,
    directUrlAllowed: true,
    exposureStage: 'design',
    exposureDecision: 'hold',
    exposureReason: 'Operator Console Registry Preview — P1 readonly registry preview. Keep hidden direct. Not in sidebar.',
    targetContainer: 'launchpad',
    rollbackPlan: 'No sidebar entry to revert. Remove route from App.tsx if needed.',
    userImpact: 'Low — readonly registry preview page. Shows 20 registry items with validator. No action, no mutation, no POST.',
    maturity: 'preview',
    owner: 'governance',
  },
  {
    id: 'operator-console-readonly-preview',
    name: 'Operator Console Readonly UI Preview',
    kind: 'governance',
    route: '/operator-console-readonly-preview',
    status: 'hidden_direct',
    risk: 'medium',
    readiness: 'preview_ready',
    exposureRecommendation: 'keep_hidden_direct',
    visibleInSidebar: false,
    allowedNow: true,
    safetyBoundary: ['readonly', 'no_execute', 'no_db_write', 'no_external_control', 'no_stage_c'],
    allowedActions: ['view_readonly_ui_preview', 'view_validation_summary', 'view_safety_boundaries', 'view_registry_coverage'],
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'control_external_tools', 'call_external_api', 'implement_post_endpoint', 'execute_action', 'release'],
    requiredBeforeExposure: ['readonly_only', 'no_post', 'no_db_write', 'validator_pass', 'registry_complete'],
    releaseGate: [],
    displayOrder: 999,
    group: 'governance',
    sidebarState: 'hidden_direct',
    operationalMode: 'readonly',
    readinessScore: 90,
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true },
    statusBadges: ['未入菜单', '当前可开放', 'preview_ready'],
    description: 'Operator Console Readonly UI Preview — v7.33.0-P2 readonly UI preview for operator decision support. 7 UI sections: seal baseline, system readiness, safety boundary strip, smoke evidence, risk matrix, registry coverage, next step panel. 未入左侧菜单。hidden direct route。',
    notes: 'Operator Console Readonly UI Preview — P2 readonly UI preview。基于 P1 registry。不入 sidebar。不启用 Stage C。不写 DB。不控制外部工具。',
    accessLevel: 'direct_url_only',
    recommendedAccessLevel: 'direct_url_only',
    launchpadVisible: true,
    advancedHubVisible: true,
    directUrlAllowed: true,
    exposureStage: 'design',
    exposureDecision: 'hold',
    exposureReason: 'Operator Console Readonly UI Preview — P2 readonly UI preview. Keep hidden direct. Not in sidebar.',
    targetContainer: 'launchpad',
    rollbackPlan: 'No sidebar entry to revert. Remove route from App.tsx if needed.',
    userImpact: 'Low — readonly UI preview page. Shows 7 UI sections with validator, safety boundaries, and risk matrix. No action, no mutation, no POST.',
    maturity: 'preview',
    owner: 'governance',
  },
  {
    id: 'operator-checklist-evidence-preview',
    name: 'Operator Checklist + Evidence Linkage Preview',
    kind: 'governance',
    route: '/operator-checklist-evidence-preview',
    status: 'hidden_direct',
    risk: 'medium',
    readiness: 'preview_ready',
    exposureRecommendation: 'keep_hidden_direct',
    visibleInSidebar: false,
    allowedNow: true,
    safetyBoundary: ['readonly', 'no_execute', 'no_evidence_write', 'no_db_write', 'no_external_control', 'no_stage_c'],
    allowedActions: ['view_checklist', 'view_evidence_linkage', 'view_validation_summary', 'view_safety_boundaries'],
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'control_external_tools', 'call_external_api', 'capture_evidence', 'write_evidence_store', 'write_audit_store', 'execute_rollback', 'release'],
    requiredBeforeExposure: ['readonly_only', 'no_post', 'no_db_write', 'no_evidence_write', 'validator_pass', 'checklist_complete'],
    releaseGate: [],
    displayOrder: 999,
    group: 'governance',
    sidebarState: 'hidden_direct',
    operationalMode: 'readonly',
    readinessScore: 85,
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true },
    statusBadges: ['未入菜单', '当前可开放', 'preview_ready'],
    description: 'Operator Checklist + Evidence Linkage Preview — v7.33.0-P3 readonly checklist (24 items) and evidence linkage (15 links) preview. 10 UI sections. 未入左侧菜单。hidden direct route。',
    notes: 'Operator Checklist + Evidence Linkage Preview — P3 readonly preview。24 checklist items, 15 evidence links。不入 sidebar。不启用 Stage C。不写 evidence store。不写 DB。',
    accessLevel: 'direct_url_only',
    recommendedAccessLevel: 'direct_url_only',
    launchpadVisible: true,
    advancedHubVisible: true,
    directUrlAllowed: true,
    exposureStage: 'design',
    exposureDecision: 'hold',
    exposureReason: 'Operator Checklist + Evidence Linkage Preview — P3 readonly preview. Keep hidden direct. Not in sidebar.',
    targetContainer: 'launchpad',
    rollbackPlan: 'No sidebar entry to revert. Remove route from App.tsx if needed.',
    userImpact: 'Low — readonly checklist + evidence linkage preview page. Shows 24 checklist items and 15 evidence links. No action, no evidence capture, no mutation, no POST.',
    maturity: 'preview',
    owner: 'governance',
  },
  {
    id: 'operator-console-seal-candidate-preview',
    name: 'Operator Console Seal Candidate Preview',
    kind: 'governance',
    route: '/operator-console-seal-candidate-preview',
    status: 'hidden_direct',
    risk: 'low',
    readiness: 'ready',
    exposureRecommendation: 'keep_hidden_direct',
    visibleInSidebar: false,
    allowedNow: true,
    safetyBoundary: ['readonly', 'no_execute', 'no_db_write', 'no_external_control', 'no_stage_c'],
    allowedActions: ['view_seal_readiness', 'view_seal_candidate'],
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'control_external_tools', 'call_external_api', 'release', 'tag_release', 'execute_rollback', 'execute_restart', 'write_evidence_store', 'write_audit_store'],
    requiredBeforeExposure: ['readonly_only', 'no_post', 'no_db_write', 'no_external_control', 'validator_pass', 'seal_candidate_complete'],
    releaseGate: [],
    displayOrder: 999,
    group: 'governance',
    sidebarState: 'hidden_direct',
    operationalMode: 'readonly',
    readinessScore: 90,
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true },
    statusBadges: ['未入菜单', '当前可开放', 'seal_candidate'],
    description: 'Operator Console Seal Candidate Preview — v7.33.0-P4 seal candidate overview. 24 seal readiness items, 18 validator checks. 10 UI sections. 未入左侧菜单。hidden direct route。',
    notes: 'Operator Console Seal Candidate Preview — P4 seal candidate。24 seal readiness items, 18 validator checks。不入 sidebar。不启用 Stage C。不是最终封板。不 tag/release。',
    accessLevel: 'direct_url_only',
    recommendedAccessLevel: 'direct_url_only',
    launchpadVisible: true,
    advancedHubVisible: true,
    directUrlAllowed: true,
    exposureStage: 'design',
    exposureDecision: 'hold',
    exposureReason: 'Operator Console Seal Candidate Preview — P4 seal candidate. Keep hidden direct. Not in sidebar. Not a final seal.',
    targetContainer: 'launchpad',
    rollbackPlan: 'No sidebar entry to revert. Remove route from App.tsx if needed.',
    userImpact: 'Low — readonly seal candidate preview page. Shows 24 seal readiness items, validator results, safety boundaries. No action, no mutation, no POST, no tag/release.',
    maturity: 'preview',
    owner: 'governance',
  },
];

export function getCenterAccessItemCount(): number {
  return CENTER_ACCESS_REGISTRY.length;
}

export function getCenterAccessVisibleItems(): CenterAccessItem[] {
  return CENTER_ACCESS_REGISTRY.filter(item => item.visibleInSidebar);
}

export function getCenterAccessHiddenItems(): CenterAccessItem[] {
  return CENTER_ACCESS_REGISTRY.filter(item => !item.visibleInSidebar);
}

export function getCenterAccessBlockedItems(): CenterAccessItem[] {
  return CENTER_ACCESS_REGISTRY.filter(item => item.status === 'blocked');
}

export function getCenterAccessByKind(kind: CenterAccessKind): CenterAccessItem[] {
  return CENTER_ACCESS_REGISTRY.filter(item => item.kind === kind);
}

export function getCenterAccessByReadiness(readiness: CenterAccessReadiness): CenterAccessItem[] {
  return CENTER_ACCESS_REGISTRY.filter(item => item.readiness === readiness);
}

export function getCenterAccessSidebarCandidates(): CenterAccessItem[] {
  return CENTER_ACCESS_REGISTRY.filter(item => item.exposureRecommendation === 'consider_sidebar_later' || item.exposureRecommendation === 'keep_sidebar');
}

export function getCenterAccessBlockedOrHoldReviewItems(): CenterAccessItem[] {
  return CENTER_ACCESS_REGISTRY.filter(item => item.readiness === 'blocked' || item.readiness === 'hold_review');
}

export function getCenterAccessFinalReadinessSummary(): {
  total: number; ready: number; previewReady: number; holdReview: number; blocked: number;
} {
  return {
    total: CENTER_ACCESS_REGISTRY.length,
    ready: CENTER_ACCESS_REGISTRY.filter(i => i.readiness === 'ready').length,
    previewReady: CENTER_ACCESS_REGISTRY.filter(i => i.readiness === 'preview_ready').length,
    holdReview: CENTER_ACCESS_REGISTRY.filter(i => i.readiness === 'hold_review').length,
    blocked: CENTER_ACCESS_REGISTRY.filter(i => i.readiness === 'blocked').length,
  };
}

export function getCenterAccessQualityGateSummary(): { total: number; passedAll: number; failedAny: number } {
  const passedAll = CENTER_ACCESS_REGISTRY.filter(i => Object.values(i.qualityGate).every(v => v === true)).length;
  return { total: CENTER_ACCESS_REGISTRY.length, passedAll, failedAny: CENTER_ACCESS_REGISTRY.length - passedAll };
}

export function getCenterAccessBySidebarState(sidebarState: CenterAccessSidebarState): CenterAccessItem[] {
  return CENTER_ACCESS_REGISTRY.filter(i => i.sidebarState === sidebarState);
}

export function getCenterAccessByOperationalMode(operationalMode: CenterAccessOperationalMode): CenterAccessItem[] {
  return CENTER_ACCESS_REGISTRY.filter(i => i.operationalMode === operationalMode);
}

export function getCenterAccessVisibleSidebarItems(): CenterAccessItem[] {
  return CENTER_ACCESS_REGISTRY.filter(i => i.visibleInSidebar);
}

export function getCenterAccessHiddenDirectItems(): CenterAccessItem[] {
  return CENTER_ACCESS_REGISTRY.filter(i => !i.visibleInSidebar);
}

export function getCenterAccessSidebarVisibleCount(): number {
  return CENTER_ACCESS_REGISTRY.filter(i => i.visibleInSidebar).length;
}

export function getCenterAccessHiddenDirectCount(): number {
  return CENTER_ACCESS_REGISTRY.filter(i => !i.visibleInSidebar).length;
}

export function getCenterAccessConnectorStatusSummary(): {
  connectorVisible: boolean; connectorAllowedNow: boolean; connectorReadiness: string;
} {
  const connector = CENTER_ACCESS_REGISTRY.find(i => i.kind === 'connector');
  return {
    connectorVisible: connector?.visibleInSidebar ?? false,
    connectorAllowedNow: connector?.allowedNow ?? false,
    connectorReadiness: connector?.readiness ?? 'unknown',
  };
}

export function getCenterAccessSummary(): {
  total: number;
  byAccessLevel: Record<string, number>;
  byRecommendedAccessLevel: Record<string, number>;
  sidebarVisible: number;
  launchpadVisible: number;
  advancedHubVisible: number;
  directUrlAllowed: number;
  deferred: number;
  highRiskPrimaryNav: number;
} {
  const byAccessLevel: Record<string, number> = {};
  const byRecommendedAccessLevel: Record<string, number> = {};
  for (const c of CENTER_ACCESS_REGISTRY) {
    byAccessLevel[c.accessLevel] = (byAccessLevel[c.accessLevel] || 0) + 1;
    byRecommendedAccessLevel[c.recommendedAccessLevel] = (byRecommendedAccessLevel[c.recommendedAccessLevel] || 0) + 1;
  }
  return {
    total: CENTER_ACCESS_REGISTRY.length,
    byAccessLevel,
    byRecommendedAccessLevel,
    sidebarVisible: CENTER_ACCESS_REGISTRY.filter(i => i.visibleInSidebar).length,
    launchpadVisible: CENTER_ACCESS_REGISTRY.filter(i => i.launchpadVisible).length,
    advancedHubVisible: CENTER_ACCESS_REGISTRY.filter(i => i.advancedHubVisible).length,
    directUrlAllowed: CENTER_ACCESS_REGISTRY.filter(i => i.directUrlAllowed).length,
    deferred: CENTER_ACCESS_REGISTRY.filter(i => i.recommendedAccessLevel === 'deferred' || i.exposureDecision === 'deferred').length,
    highRiskPrimaryNav: CENTER_ACCESS_REGISTRY.filter(i => i.accessLevel === 'primary_nav' && i.risk === 'high').length,
  };
}

export function getCenterAccessByAccessLevel(level: AccessLevel): CenterAccessItem[] {
  return CENTER_ACCESS_REGISTRY.filter(i => i.accessLevel === level);
}

export function getCenterAccessByRecommendedAccessLevel(level: AccessLevel): CenterAccessItem[] {
  return CENTER_ACCESS_REGISTRY.filter(i => i.recommendedAccessLevel === level);
}

export function getCenterAccessLaunchpadVisible(): CenterAccessItem[] {
  return CENTER_ACCESS_REGISTRY.filter(i => i.launchpadVisible);
}

export function getCenterAccessAdvancedHubVisible(): CenterAccessItem[] {
  return CENTER_ACCESS_REGISTRY.filter(i => i.advancedHubVisible);
}

export function getCenterAccessByExposureDecision(decision: ExposureDecision): CenterAccessItem[] {
  return CENTER_ACCESS_REGISTRY.filter(i => i.exposureDecision === decision);
}

export function getCenterAccessHighRiskPrimaryNavCount(): number {
  return CENTER_ACCESS_REGISTRY.filter(i => i.accessLevel === 'primary_nav' && i.risk === 'high').length;
}

export function getCenterAccessStageCPrimaryNavCount(): number {
  return CENTER_ACCESS_REGISTRY.filter(i => i.accessLevel === 'primary_nav' && i.blockedActions.includes('enable_stage_c')).length;
}

export interface CenterAccessValidationIssue {
  centerId: string;
  field: string;
  severity: 'blocking' | 'warning' | 'info';
  message: string;
}

export function validateCenterAccess(): CenterAccessValidationIssue[] {
  const issues: CenterAccessValidationIssue[] = [];
  for (const c of CENTER_ACCESS_REGISTRY) {
    if (c.accessLevel === 'primary_nav' && c.risk === 'high') {
      issues.push({ centerId: c.id, field: 'accessLevel', severity: 'blocking', message: 'High risk center must not have primary_nav access level.' });
    }
    if (c.recommendedAccessLevel === 'primary_nav' && c.risk === 'high') {
      issues.push({ centerId: c.id, field: 'recommendedAccessLevel', severity: 'blocking', message: 'High risk center must not recommend primary_nav.' });
    }
    if (c.accessLevel === 'deferred' && c.visibleInSidebar) {
      issues.push({ centerId: c.id, field: 'visibleInSidebar', severity: 'blocking', message: 'Deferred center must not be visible in sidebar.' });
    }
    if (c.accessLevel === 'direct_url_only' && c.visibleInSidebar) {
      issues.push({ centerId: c.id, field: 'visibleInSidebar', severity: 'warning', message: 'direct_url_only center should not be visible in sidebar.' });
    }
    if (c.accessLevel === 'primary_nav' && !c.visibleInSidebar) {
      issues.push({ centerId: c.id, field: 'visibleInSidebar', severity: 'warning', message: 'primary_nav center should be visible in sidebar.' });
    }
    if (c.launchpadVisible && c.visibleInSidebar) {
      issues.push({ centerId: c.id, field: 'launchpadVisible', severity: 'info', message: 'Center is both in sidebar and launchpad — verify if this is intentional.' });
    }
    if (!c.exposureReason) {
      issues.push({ centerId: c.id, field: 'exposureReason', severity: 'blocking', message: 'exposureReason must be defined.' });
    }
    if (!c.rollbackPlan) {
      issues.push({ centerId: c.id, field: 'rollbackPlan', severity: 'warning', message: 'rollbackPlan should be defined.' });
    }
    if (!c.userImpact) {
      issues.push({ centerId: c.id, field: 'userImpact', severity: 'info', message: 'userImpact should be documented.' });
    }
    // Verify sidebar state consistency with layout
    if (c.id === 'advanced-mode-readonly' || c.id === 'connector-center-readonly') {
      if (!c.visibleInSidebar) {
        issues.push({ centerId: c.id, field: 'visibleInSidebar', severity: 'blocking', message: `${c.id} should be visible in sidebar per Layout.tsx.` });
      }
    }
    if (c.id === 'runtime-registry-preview' && c.visibleInSidebar) {
      issues.push({ centerId: c.id, field: 'visibleInSidebar', severity: 'blocking', message: 'runtime-registry-preview should NOT be visible in sidebar.' });
    }
    if (c.id === 'governance-state-machine-preview' && c.visibleInSidebar) {
      issues.push({ centerId: c.id, field: 'visibleInSidebar', severity: 'blocking', message: 'governance-state-machine-preview should NOT be visible in sidebar.' });
    }
    if (c.id === 'human-approval-workflow-preview' && c.visibleInSidebar) {
      issues.push({ centerId: c.id, field: 'visibleInSidebar', severity: 'blocking', message: 'human-approval-workflow-preview should NOT be visible in sidebar.' });
    }
    if (c.id === 'evidence-schema-preview' && c.visibleInSidebar) {
      issues.push({ centerId: c.id, field: 'visibleInSidebar', severity: 'blocking', message: 'evidence-schema-preview should NOT be visible in sidebar.' });
    }
    if (c.id === 'rollback-preview' && c.visibleInSidebar) {
      issues.push({ centerId: c.id, field: 'visibleInSidebar', severity: 'blocking', message: 'rollback-preview should NOT be visible in sidebar.' });
    }
    if (c.id === 'governance-console-preview' && c.visibleInSidebar) {
      issues.push({ centerId: c.id, field: 'visibleInSidebar', severity: 'blocking', message: 'governance-console-preview should NOT be visible in sidebar.' });
    }
    if (c.id === 'governance-console-risk-dashboard-preview' && c.visibleInSidebar) {
      issues.push({ centerId: c.id, field: 'visibleInSidebar', severity: 'blocking', message: 'governance-console-risk-dashboard-preview should NOT be visible in sidebar.' });
    }
    if (c.id === 'governance-console-decision-panel-preview' && c.visibleInSidebar) {
      issues.push({ centerId: c.id, field: 'visibleInSidebar', severity: 'blocking', message: 'governance-console-decision-panel-preview should NOT be visible in sidebar.' });
    }
    if (c.id === 'governance-console-report-pack-preview' && c.visibleInSidebar) {
      issues.push({ centerId: c.id, field: 'visibleInSidebar', severity: 'blocking', message: 'governance-console-report-pack-preview should NOT be visible in sidebar.' });
    }
    if (c.id === 'dry-run-plan-preview' && c.visibleInSidebar) {
      issues.push({ centerId: c.id, field: 'visibleInSidebar', severity: 'blocking', message: 'dry-run-plan-preview should NOT be visible in sidebar.' });
    }
    if (c.id === 'audit-log-preview' && c.visibleInSidebar) {
      issues.push({ centerId: c.id, field: 'visibleInSidebar', severity: 'blocking', message: 'audit-log-preview should NOT be visible in sidebar.' });
    }
    if (c.id === 'runtime-dry-run-contract-preview' && c.visibleInSidebar) {
      issues.push({ centerId: c.id, field: 'visibleInSidebar', severity: 'blocking', message: 'runtime-dry-run-contract-preview should NOT be visible in sidebar.' });
    }
    if (c.id === 'runtime-audit-store-contract-preview' && c.visibleInSidebar) {
      issues.push({ centerId: c.id, field: 'visibleInSidebar', severity: 'blocking', message: 'runtime-audit-store-contract-preview should NOT be visible in sidebar.' });
    }
    if (c.id === 'stage-c-preenable-review-preview' && c.visibleInSidebar) {
      issues.push({ centerId: c.id, field: 'visibleInSidebar', severity: 'blocking', message: 'stage-c-preenable-review-preview should NOT be visible in sidebar.' });
    }
    if (c.id === 'operator-console-registry-preview' && c.visibleInSidebar) {
      issues.push({ centerId: c.id, field: 'visibleInSidebar', severity: 'blocking', message: 'operator-console-registry-preview should NOT be visible in sidebar.' });
    }
    if (c.id === 'lab-center-readonly' || c.id === 'governance-center' || c.id === 'navigation-preview-readonly') {
      if (c.visibleInSidebar) {
        issues.push({ centerId: c.id, field: 'visibleInSidebar', severity: 'blocking', message: `${c.id} should NOT be visible in sidebar per current policy.` });
      }
    }
  }
  return issues;
}
