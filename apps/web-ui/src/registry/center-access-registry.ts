// Center Access Registry — static definitions for center access hub
// READONLY METADATA ONLY. Does not change navigation, enable features,
// or execute real operations.

export type CenterAccessKind =
  | 'advanced'
  | 'connector'
  | 'lab'
  | 'governance'
  | 'navigation_preview'
  | 'runtime_registry';

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
    if (c.id === 'dry-run-plan-preview' && c.visibleInSidebar) {
      issues.push({ centerId: c.id, field: 'visibleInSidebar', severity: 'blocking', message: 'dry-run-plan-preview should NOT be visible in sidebar.' });
    }
    if (c.id === 'lab-center-readonly' || c.id === 'governance-center' || c.id === 'navigation-preview-readonly') {
      if (c.visibleInSidebar) {
        issues.push({ centerId: c.id, field: 'visibleInSidebar', severity: 'blocking', message: `${c.id} should NOT be visible in sidebar per current policy.` });
      }
    }
  }
  return issues;
}
