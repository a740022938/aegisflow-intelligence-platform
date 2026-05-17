// Center Access Registry — static definitions for center access hub
// READONLY METADATA ONLY. Does not change navigation, enable features,
// or execute real operations.

export type CenterAccessKind =
  | 'advanced'
  | 'connector'
  | 'lab'
  | 'governance'
  | 'navigation_preview';

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
  description: string;
  notes: string;
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
    description: '只读门控页面。当前是唯一已入左侧菜单的高级入口。展示导航曝光建议和中心访问信息。',
    notes: 'Advanced Mode Preview — 已入左侧菜单。只读。不启用 Stage C。',
  },
  {
    id: 'connector-center-readonly',
    name: 'Connector Center',
    kind: 'connector',
    route: '/connector-center-readonly',
    status: 'hidden_direct',
    risk: 'low',
    readiness: 'preview_ready',
    exposureRecommendation: 'consider_sidebar_later',
    visibleInSidebar: false,
    allowedNow: false,
    safetyBoundary: ['readonly', 'no_external_write', 'no_connector_control', 'no_api_call'],
    allowedActions: ['view_status', 'view_report', 'view_related_route'],
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'control_external_tools', 'call_external_api', 'release'],
    requiredBeforeExposure: ['no_real_connector_control', 'readonly_badge', 'manual_review'],
    releaseGate: ['connector_center_enabled_flag', 'no_write_verification'],
    description: '只读连接器中心。展示 OpenAxiom、Memory Hub、Hugging Face 等外部工具状态。未入左侧菜单。',
    notes: 'Connector Center — 未入左侧菜单。hidden direct route。不接真实控制。',
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
    description: '只读实验室中心。展示 Mahjong Debug 等实验工具状态。未入左侧菜单。',
    notes: 'Lab Center — 未入左侧菜单。hidden direct route。不运行训练/推理/标注。',
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
    description: '只读治理中心。展示 13 个治理模块、12 个门禁、风险边界。Stage C deferred。未入左侧菜单。',
    notes: 'Governance Center — 未入左侧菜单。readonly。Stage C deferred。不处理 candidate。',
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
    description: '只读导航预览。展示未来 Connector/Lab/Governance/Advanced 分组结构。未入左侧菜单。',
    notes: 'Navigation Preview — 未入左侧菜单。hidden direct route。不改变真实菜单。',
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
