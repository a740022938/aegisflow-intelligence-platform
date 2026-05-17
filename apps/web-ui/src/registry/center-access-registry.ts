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

export interface CenterAccessItem {
  id: string;
  name: string;
  kind: CenterAccessKind;
  route: string;
  status: CenterAccessStatus;
  risk: CenterAccessRisk;
  visibleInSidebar: boolean;
  allowedNow: boolean;
  safetyBoundary: string[];
  allowedActions: string[];
  blockedActions: string[];
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
    visibleInSidebar: true,
    allowedNow: true,
    safetyBoundary: ['readonly', 'no_execute', 'no_stage_c'],
    allowedActions: ['view_status', 'view_report', 'view_related_route'],
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'release'],
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
    visibleInSidebar: false,
    allowedNow: false,
    safetyBoundary: ['readonly', 'no_external_write', 'no_connector_control', 'no_api_call'],
    allowedActions: ['view_status', 'view_report', 'view_related_route'],
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'control_external_tools', 'call_external_api', 'release'],
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
    visibleInSidebar: false,
    allowedNow: false,
    safetyBoundary: ['readonly', 'no_training', 'no_inference', 'no_label_save', 'no_dataset_write'],
    allowedActions: ['view_status', 'view_notes', 'generate_task_package'],
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'train_model', 'run_inference', 'save_labels', 'overwrite_dataset', 'release'],
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
    visibleInSidebar: false,
    allowedNow: false,
    safetyBoundary: ['readonly', 'no_database_write', 'no_menu_move', 'no_candidate_processing', 'no_stage_c'],
    allowedActions: ['view_status', 'view_report', 'view_risk', 'view_quality_gate', 'view_related_route'],
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'approve_candidate', 'reject_candidate', 'archive_candidate', 'sync_lan_share', 'publish_release', 'create_tag', 'force_push'],
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
    visibleInSidebar: false,
    allowedNow: false,
    safetyBoundary: ['readonly', 'no_menu_move', 'no_sidebar_change'],
    allowedActions: ['view_status', 'view_report'],
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'move_menu', 'release'],
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
