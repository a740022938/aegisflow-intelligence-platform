// Navigation Exposure Registry — shadow data for access strategy
// SHADOW DATA ONLY. Not consumed by Layout, App, or any page component.
// Does not change runtime behavior. Does not modify navigation.
// Based on AIP v7.16.0-D1 Access Strategy / Navigation Exposure Spec.

export type NavigationExposureLevel =
  | 'hidden_internal'
  | 'direct_route'
  | 'advanced_mode'
  | 'lab_mode'
  | 'connector_center'
  | 'governance_center'
  | 'primary_nav';

export type NavigationExposureRisk = 'low' | 'medium' | 'high';

export type NavigationExposureRecommendation =
  | 'keep_hidden'
  | 'keep_direct_route'
  | 'move_to_advanced'
  | 'move_to_lab'
  | 'move_to_connector_center'
  | 'move_to_governance_center'
  | 'candidate_for_primary_nav'
  | 'do_not_expose';

export type NavigationExposureGate =
  | 'none'
  | 'advanced_mode'
  | 'lab_mode'
  | 'connector_center_enabled'
  | 'governance_center_enabled'
  | 'stage_c_disabled'
  | 'human_approval_required'
  | 'readonly_only'
  | 'feature_flag_required';

export interface NavigationExposureEntry {
  id: string;
  path: string;
  label: string;
  component?: string;
  currentExposure: NavigationExposureLevel;
  recommendedExposure: NavigationExposureLevel;
  recommendation: NavigationExposureRecommendation;
  risk: NavigationExposureRisk;
  gates: NavigationExposureGate[];
  reason: string;
  allowedNow: boolean;
  source: 'layout' | 'route' | 'menu_registry' | 'governance_registry' | 'report';
  notes?: string;
}

export const NAVIGATION_EXPOSURE_LEVELS: Record<NavigationExposureLevel, {
  label: string;
  description: string;
  defaultAllowed: boolean;
  requiresGate: boolean;
}> = {
  hidden_internal: {
    label: '内部隐藏',
    description: 'Hidden from all navigation, URL-direct only. Suitable for placeholder/system pages.',
    defaultAllowed: false,
    requiresGate: false,
  },
  direct_route: {
    label: '直达路由',
    description: 'URL-accessible and documented internally, but NOT in any sidebar menu.',
    defaultAllowed: true,
    requiresGate: false,
  },
  advanced_mode: {
    label: '高级模式',
    description: 'Only visible when Advanced Mode is enabled by the user.',
    defaultAllowed: false,
    requiresGate: true,
  },
  lab_mode: {
    label: '实验室',
    description: 'Visible under a Lab section in the sidebar when Lab mode is enabled.',
    defaultAllowed: false,
    requiresGate: true,
  },
  connector_center: {
    label: '连接器中心',
    description: 'Visible in Connector Center hub or submenu.',
    defaultAllowed: false,
    requiresGate: true,
  },
  governance_center: {
    label: '治理中心',
    description: 'Visible in Governance Center hub or submenu.',
    defaultAllowed: false,
    requiresGate: true,
  },
  primary_nav: {
    label: '主菜单',
    description: 'Standard left sidebar menu item visible to all authenticated users.',
    defaultAllowed: true,
    requiresGate: false,
  },
};

export const NAVIGATION_EXPOSURE_REGISTRY: NavigationExposureEntry[] = [
  // ── 概览 (3 items, from Layout) ──
  {
    id: 'dashboard',
    path: '/',
    label: 'Dashboard',
    component: 'Dashboard',
    currentExposure: 'primary_nav',
    recommendedExposure: 'primary_nav',
    recommendation: 'candidate_for_primary_nav',
    risk: 'low',
    gates: ['none'],
    reason: 'Home page, stable, no write operations.',
    allowedNow: true,
    source: 'layout',
  },
  {
    id: 'factory-status',
    path: '/factory-status',
    label: 'Factory Status',
    component: 'FactoryStatus',
    currentExposure: 'primary_nav',
    recommendedExposure: 'primary_nav',
    recommendation: 'candidate_for_primary_nav',
    risk: 'low',
    gates: ['none'],
    reason: 'Production monitoring page, stable.',
    allowedNow: true,
    source: 'layout',
  },
  {
    id: 'assistant-center',
    path: '/assistant-center',
    label: 'Assistant Center',
    component: 'AssistantCenter',
    currentExposure: 'primary_nav',
    recommendedExposure: 'primary_nav',
    recommendation: 'candidate_for_primary_nav',
    risk: 'low',
    gates: ['none'],
    reason: 'AI assistant runtime page, PageShell preview.',
    allowedNow: true,
    source: 'layout',
  },

  // ── 数据与训练 (4 items, from Layout) ──
  {
    id: 'datasets',
    path: '/datasets',
    label: 'Datasets',
    component: 'Datasets',
    currentExposure: 'primary_nav',
    recommendedExposure: 'primary_nav',
    recommendation: 'candidate_for_primary_nav',
    risk: 'low',
    gates: ['none'],
    reason: 'Dataset management, stable.',
    allowedNow: true,
    source: 'layout',
  },
  {
    id: 'training',
    path: '/training',
    label: 'Training Center',
    component: 'Training',
    currentExposure: 'primary_nav',
    recommendedExposure: 'primary_nav',
    recommendation: 'candidate_for_primary_nav',
    risk: 'medium',
    gates: ['none'],
    reason: 'Training execution, stable.',
    allowedNow: true,
    source: 'layout',
  },
  {
    id: 'runs',
    path: '/runs',
    label: 'Run Center',
    component: 'Runs',
    currentExposure: 'primary_nav',
    recommendedExposure: 'primary_nav',
    recommendation: 'candidate_for_primary_nav',
    risk: 'medium',
    gates: ['none'],
    reason: 'Run management, stable.',
    allowedNow: true,
    source: 'layout',
  },
  {
    id: 'templates',
    path: '/templates',
    label: 'Templates',
    component: 'Templates',
    currentExposure: 'primary_nav',
    recommendedExposure: 'primary_nav',
    recommendation: 'candidate_for_primary_nav',
    risk: 'low',
    gates: ['none'],
    reason: 'Template library, stable.',
    allowedNow: true,
    source: 'layout',
  },

  // ── 模型与发布 (4 items, from Layout) ──
  {
    id: 'models',
    path: '/models',
    label: 'Model Management',
    component: 'Models',
    currentExposure: 'primary_nav',
    recommendedExposure: 'primary_nav',
    recommendation: 'candidate_for_primary_nav',
    risk: 'medium',
    gates: ['none'],
    reason: 'Model registry, stable.',
    allowedNow: true,
    source: 'layout',
  },
  {
    id: 'artifacts',
    path: '/artifacts',
    label: 'Artifacts',
    component: 'Artifacts',
    currentExposure: 'primary_nav',
    recommendedExposure: 'primary_nav',
    recommendation: 'candidate_for_primary_nav',
    risk: 'low',
    gates: ['none'],
    reason: 'Artifact storage, stable.',
    allowedNow: true,
    source: 'layout',
  },
  {
    id: 'evaluations',
    path: '/evaluations',
    label: 'Evaluation Center',
    component: 'Evaluations',
    currentExposure: 'primary_nav',
    recommendedExposure: 'primary_nav',
    recommendation: 'candidate_for_primary_nav',
    risk: 'low',
    gates: ['none'],
    reason: 'Evaluation results, stable.',
    allowedNow: true,
    source: 'layout',
  },
  {
    id: 'deployments',
    path: '/deployments',
    label: 'Deployment Center',
    component: 'Deployments',
    currentExposure: 'primary_nav',
    recommendedExposure: 'primary_nav',
    recommendation: 'candidate_for_primary_nav',
    risk: 'medium',
    gates: ['none'],
    reason: 'Deployment management, stable.',
    allowedNow: true,
    source: 'layout',
  },

  // ── 流程与编排 (3 items, from Layout) ──
  {
    id: 'workflow-jobs',
    path: '/workflow-jobs',
    label: 'Workflow Jobs',
    component: 'WorkflowJobs',
    currentExposure: 'primary_nav',
    recommendedExposure: 'primary_nav',
    recommendation: 'candidate_for_primary_nav',
    risk: 'medium',
    gates: ['none'],
    reason: 'Workflow job management, stable.',
    allowedNow: true,
    source: 'layout',
  },
  {
    id: 'workflow-composer',
    path: '/workflow-composer',
    label: 'Workflow Composer',
    component: 'WorkflowComposer',
    currentExposure: 'primary_nav',
    recommendedExposure: 'primary_nav',
    recommendation: 'candidate_for_primary_nav',
    risk: 'medium',
    gates: ['none'],
    reason: 'Visual workflow editor, stable.',
    allowedNow: true,
    source: 'layout',
  },
  {
    id: 'workflow-canvas',
    path: '/workflow-canvas',
    label: 'Workflow Canvas',
    component: 'WorkflowCanvas',
    currentExposure: 'primary_nav',
    recommendedExposure: 'primary_nav',
    recommendation: 'candidate_for_primary_nav',
    risk: 'medium',
    gates: ['none'],
    reason: 'Workflow canvas rendering, stable.',
    allowedNow: true,
    source: 'layout',
  },

  // ── 能力与模块 (7 items, from Layout) ──
  {
    id: 'module-center',
    path: '/module-center',
    label: 'Module Center',
    component: 'ModuleCenter',
    currentExposure: 'primary_nav',
    recommendedExposure: 'primary_nav',
    recommendation: 'candidate_for_primary_nav',
    risk: 'low',
    gates: ['none'],
    reason: 'Module management hub, stable.',
    allowedNow: true,
    source: 'layout',
  },
  {
    id: 'plugin-pool',
    path: '/plugin-pool',
    label: 'Plugin Pool',
    component: 'PluginPool',
    currentExposure: 'primary_nav',
    recommendedExposure: 'primary_nav',
    recommendation: 'candidate_for_primary_nav',
    risk: 'low',
    gates: ['none'],
    reason: 'Plugin registry, stable.',
    allowedNow: true,
    source: 'layout',
  },
  {
    id: 'tasks',
    path: '/tasks',
    label: 'Task Orchestration',
    component: 'Tasks',
    currentExposure: 'primary_nav',
    recommendedExposure: 'primary_nav',
    recommendation: 'candidate_for_primary_nav',
    risk: 'medium',
    gates: ['none'],
    reason: 'Task orchestration, stable.',
    allowedNow: true,
    source: 'layout',
  },
  {
    id: 'cost-routing',
    path: '/cost-routing',
    label: 'Cost Routing',
    component: 'CostRouting',
    currentExposure: 'primary_nav',
    recommendedExposure: 'governance_center',
    recommendation: 'move_to_governance_center',
    risk: 'medium',
    gates: ['readonly_only', 'governance_center_enabled'],
    reason: 'Governance-oriented page. Currently under 能力与模块, recommended to move to Governance Center section.',
    allowedNow: true,
    source: 'layout',
    notes: 'P1a PageShell migrated. v7.12.3 UX hotfix. KEEP — not moved to governance section yet.',
  },
  {
    id: 'openaxiom-readonly',
    path: '/openaxiom-readonly',
    label: 'OpenAxiom Readonly',
    component: 'OpenAxiomReadonly',
    currentExposure: 'primary_nav',
    recommendedExposure: 'connector_center',
    recommendation: 'move_to_connector_center',
    risk: 'low',
    gates: ['readonly_only', 'connector_center_enabled'],
    reason: 'External tool readonly page. Fits in Connector Center.',
    allowedNow: true,
    source: 'layout',
    notes: 'P1b PageShell migrated. External tool readonly page.',
  },
  {
    id: 'memory-hub',
    path: '/memory-hub',
    label: 'Memory Hub',
    component: 'MemoryHubReadonly',
    currentExposure: 'primary_nav',
    recommendedExposure: 'connector_center',
    recommendation: 'move_to_connector_center',
    risk: 'low',
    gates: ['readonly_only', 'connector_center_enabled'],
    reason: 'External tool readonly page. Fits in Connector Center.',
    allowedNow: true,
    source: 'layout',
    notes: 'P1b PageShell migrated. External tool readonly page.',
  },

  // ── 智能增强 (8 items, from Layout) ──
  {
    id: 'digital-employee',
    path: '/digital-employee',
    label: 'Digital Employee',
    component: 'ModulePage',
    currentExposure: 'primary_nav',
    recommendedExposure: 'advanced_mode',
    recommendation: 'move_to_advanced',
    risk: 'medium',
    gates: ['advanced_mode'],
    reason: 'Placeholder page. Should be gated behind Advanced Mode until feature is mature.',
    allowedNow: true,
    source: 'layout',
  },
  {
    id: 'training-v2',
    path: '/training-v2',
    label: 'Training V2',
    component: 'ModulePage',
    currentExposure: 'primary_nav',
    recommendedExposure: 'advanced_mode',
    recommendation: 'move_to_advanced',
    risk: 'medium',
    gates: ['advanced_mode'],
    reason: 'Placeholder page. Gate behind Advanced Mode.',
    allowedNow: true,
    source: 'layout',
  },
  {
    id: 'hpo',
    path: '/hpo',
    label: 'HPO',
    component: 'ModulePage',
    currentExposure: 'primary_nav',
    recommendedExposure: 'advanced_mode',
    recommendation: 'move_to_advanced',
    risk: 'low',
    gates: ['advanced_mode'],
    reason: 'Placeholder page. Gate behind Advanced Mode.',
    allowedNow: true,
    source: 'layout',
  },
  {
    id: 'distill',
    path: '/distill',
    label: 'Distill',
    component: 'ModulePage',
    currentExposure: 'primary_nav',
    recommendedExposure: 'advanced_mode',
    recommendation: 'move_to_advanced',
    risk: 'low',
    gates: ['advanced_mode'],
    reason: 'Placeholder page. Gate behind Advanced Mode.',
    allowedNow: true,
    source: 'layout',
  },
  {
    id: 'model-merge',
    path: '/model-merge',
    label: 'Model Merge',
    component: 'ModulePage',
    currentExposure: 'primary_nav',
    recommendedExposure: 'advanced_mode',
    recommendation: 'move_to_advanced',
    risk: 'medium',
    gates: ['advanced_mode'],
    reason: 'Placeholder page. Gate behind Advanced Mode.',
    allowedNow: true,
    source: 'layout',
  },
  {
    id: 'inference',
    path: '/inference',
    label: 'Inference',
    component: 'ModulePage',
    currentExposure: 'primary_nav',
    recommendedExposure: 'advanced_mode',
    recommendation: 'move_to_advanced',
    risk: 'high',
    gates: ['advanced_mode', 'human_approval_required', 'readonly_only'],
    reason: 'Model inference could trigger real compute. Must stay gated behind Advanced Mode and readonly.',
    allowedNow: false,
    source: 'layout',
  },
  {
    id: 'annotation',
    path: '/annotation',
    label: 'Annotation',
    component: 'ModulePage',
    currentExposure: 'primary_nav',
    recommendedExposure: 'advanced_mode',
    recommendation: 'move_to_advanced',
    risk: 'low',
    gates: ['advanced_mode'],
    reason: 'Placeholder page. Gate behind Advanced Mode.',
    allowedNow: true,
    source: 'layout',
  },
  {
    id: 'huggingface',
    path: '/huggingface',
    label: 'HuggingFace',
    component: 'ModulePage',
    currentExposure: 'primary_nav',
    recommendedExposure: 'advanced_mode',
    recommendation: 'move_to_advanced',
    risk: 'low',
    gates: ['advanced_mode'],
    reason: 'Placeholder page. Gate behind Advanced Mode.',
    allowedNow: true,
    source: 'layout',
  },

  // ── 自动化 (5 items, from Layout) ──
  {
    id: 'backflow-v2',
    path: '/backflow-v2',
    label: 'Backflow V2',
    component: 'ModulePage',
    currentExposure: 'primary_nav',
    recommendedExposure: 'advanced_mode',
    recommendation: 'move_to_advanced',
    risk: 'medium',
    gates: ['advanced_mode'],
    reason: 'Placeholder page. Gate behind Advanced Mode.',
    allowedNow: true,
    source: 'layout',
  },
  {
    id: 'scheduler',
    path: '/scheduler',
    label: 'Scheduler',
    component: 'ModulePage',
    currentExposure: 'primary_nav',
    recommendedExposure: 'advanced_mode',
    recommendation: 'move_to_advanced',
    risk: 'high',
    gates: ['advanced_mode', 'human_approval_required'],
    reason: 'Scheduler could trigger automated execution. Must stay gated.',
    allowedNow: false,
    source: 'layout',
  },
  {
    id: 'alerting',
    path: '/alerting',
    label: 'Alerting',
    component: 'ModulePage',
    currentExposure: 'primary_nav',
    recommendedExposure: 'advanced_mode',
    recommendation: 'move_to_advanced',
    risk: 'medium',
    gates: ['advanced_mode'],
    reason: 'Placeholder page. Gate behind Advanced Mode.',
    allowedNow: true,
    source: 'layout',
  },
  {
    id: 'model-monitor',
    path: '/model-monitor',
    label: 'Model Monitor',
    component: 'ModulePage',
    currentExposure: 'primary_nav',
    recommendedExposure: 'advanced_mode',
    recommendation: 'move_to_advanced',
    risk: 'medium',
    gates: ['advanced_mode'],
    reason: 'Placeholder page. Gate behind Advanced Mode.',
    allowedNow: true,
    source: 'layout',
  },
  {
    id: 'deploy-v2',
    path: '/deploy-v2',
    label: 'Deploy V2',
    component: 'ModulePage',
    currentExposure: 'primary_nav',
    recommendedExposure: 'advanced_mode',
    recommendation: 'move_to_advanced',
    risk: 'high',
    gates: ['advanced_mode', 'human_approval_required', 'readonly_only'],
    reason: 'Deploy action could trigger production deployment. Must stay gated.',
    allowedNow: false,
    source: 'layout',
  },

  // ── 视觉实验室 / Lab (1 item, from Layout) ──
  {
    id: 'mahjong-debug',
    path: '/vision-lab/mahjong-debug',
    label: 'Mahjong Debug',
    component: 'MahjongDebug',
    currentExposure: 'primary_nav',
    recommendedExposure: 'lab_mode',
    recommendation: 'move_to_lab',
    risk: 'medium',
    gates: ['lab_mode'],
    reason: 'Debug tool, not for general use. Move to Lab section.',
    allowedNow: true,
    source: 'layout',
  },

  // ── 治理与回流 (4 items, from Layout) ──
  {
    id: 'approvals',
    path: '/approvals',
    label: 'Approvals',
    component: 'Approvals',
    currentExposure: 'primary_nav',
    recommendedExposure: 'primary_nav',
    recommendation: 'candidate_for_primary_nav',
    risk: 'medium',
    gates: ['none'],
    reason: 'Approval management, stable. Keep in governance section.',
    allowedNow: true,
    source: 'layout',
  },
  {
    id: 'governance-hub',
    path: '/governance-hub',
    label: 'Governance Hub',
    component: 'GovernanceHub',
    currentExposure: 'primary_nav',
    recommendedExposure: 'primary_nav',
    recommendation: 'candidate_for_primary_nav',
    risk: 'low',
    gates: ['none'],
    reason: 'Governance hub, stable.',
    allowedNow: true,
    source: 'layout',
  },
  {
    id: 'audit',
    path: '/audit',
    label: 'Audit',
    component: 'Audit',
    currentExposure: 'primary_nav',
    recommendedExposure: 'primary_nav',
    recommendation: 'candidate_for_primary_nav',
    risk: 'low',
    gates: ['none'],
    reason: 'Audit log viewer, stable.',
    allowedNow: true,
    source: 'layout',
  },
  {
    id: 'feedback',
    path: '/feedback',
    label: 'Feedback',
    component: 'Feedback',
    currentExposure: 'primary_nav',
    recommendedExposure: 'primary_nav',
    recommendation: 'candidate_for_primary_nav',
    risk: 'low',
    gates: ['none'],
    reason: 'User feedback page, stable.',
    allowedNow: true,
    source: 'layout',
  },

  // ── 知识 / 输出 (2 items, from Layout) ──
  {
    id: 'knowledge',
    path: '/knowledge',
    label: 'Knowledge Center',
    component: 'Knowledge',
    currentExposure: 'primary_nav',
    recommendedExposure: 'primary_nav',
    recommendation: 'candidate_for_primary_nav',
    risk: 'low',
    gates: ['none'],
    reason: 'Knowledge base, stable.',
    allowedNow: true,
    source: 'layout',
  },
  {
    id: 'outputs',
    path: '/outputs',
    label: 'Standard Output',
    component: 'Outputs',
    currentExposure: 'primary_nav',
    recommendedExposure: 'primary_nav',
    recommendation: 'candidate_for_primary_nav',
    risk: 'low',
    gates: ['none'],
    reason: 'Output viewer, stable.',
    allowedNow: true,
    source: 'layout',
  },

  // ── 隐藏 / 未入菜单 route (from App.tsx) ──

  // Connector Center hub
  {
    id: 'connector-center',
    path: '/connector-center',
    label: 'Connector Center',
    component: 'ConnectorCenter',
    currentExposure: 'direct_route',
    recommendedExposure: 'connector_center',
    recommendation: 'move_to_connector_center',
    risk: 'low',
    gates: ['readonly_only', 'connector_center_enabled'],
    reason: 'Readonly shell for external tool connectors. Safe to expose behind feature flag.',
    allowedNow: false,
    source: 'route',
  },

  // Lab Center hub
  {
    id: 'lab-center',
    path: '/lab-center',
    label: 'Lab Center',
    component: 'LabCenter',
    currentExposure: 'direct_route',
    recommendedExposure: 'lab_mode',
    recommendation: 'move_to_lab',
    risk: 'low',
    gates: ['readonly_only', 'lab_mode'],
    reason: 'Readonly shell for experimental features. Safe to expose behind feature flag.',
    allowedNow: false,
    source: 'route',
  },

  // Governance Center hub
  {
    id: 'governance-center',
    path: '/governance-center',
    label: 'Governance Center',
    component: 'GovernanceCenter',
    currentExposure: 'direct_route',
    recommendedExposure: 'governance_center',
    recommendation: 'move_to_governance_center',
    risk: 'medium',
    gates: ['readonly_only', 'governance_center_enabled', 'stage_c_disabled'],
    reason: 'Readonly governance dashboard. Not added to left menu. Stage C deferred. No real execution buttons. No Stage C enable button. Recommended to expose via governance_center_enabled flag when feature is ready.',
    allowedNow: false,
    source: 'route',
    notes: 'currentExposure=direct_route. Not in left menu. Governance Center is a readonly metadata hub with 13 modules, 12 gates, validator=pass, stage_c_gate=deferred.',
  },

  // Governance sub-pages (URL-only, not in menu)
  {
    id: 'menu-governance-preview',
    path: '/menu-governance-preview',
    label: 'Menu Governance Preview',
    component: 'MenuGovernancePreview',
    currentExposure: 'direct_route',
    recommendedExposure: 'governance_center',
    recommendation: 'move_to_governance_center',
    risk: 'low',
    gates: ['readonly_only', 'governance_center_enabled'],
    reason: 'Readonly menu governance decision table. Part of Governance Center ecosystem.',
    allowedNow: false,
    source: 'route',
  },
  {
    id: 'registry-render-preview',
    path: '/registry-render-preview',
    label: 'Registry Render Preview',
    component: 'RegistryRenderPreview',
    currentExposure: 'direct_route',
    recommendedExposure: 'governance_center',
    recommendation: 'move_to_governance_center',
    risk: 'low',
    gates: ['readonly_only', 'governance_center_enabled'],
    reason: 'Readonly registry render preview. Part of Governance Center ecosystem.',
    allowedNow: false,
    source: 'route',
  },
  {
    id: 'menu-move-dry-run',
    path: '/menu-move-dry-run',
    label: 'Menu Move Dry-Run',
    component: 'MenuMoveDryRun',
    currentExposure: 'direct_route',
    recommendedExposure: 'governance_center',
    recommendation: 'move_to_governance_center',
    risk: 'medium',
    gates: ['readonly_only', 'governance_center_enabled', 'stage_c_disabled'],
    reason: 'Dry-run only. No real menu moves. Part of Governance Center ecosystem.',
    allowedNow: false,
    source: 'route',
  },

  // 隐 module placeholder routes (not in nav, from App.tsx)
  {
    id: 'workspace',
    path: '/workspace',
    label: 'Workspace',
    component: 'ModulePage',
    currentExposure: 'hidden_internal',
    recommendedExposure: 'hidden_internal',
    recommendation: 'keep_hidden',
    risk: 'low',
    gates: ['none'],
    reason: 'Placeholder page not in navigation. No reason to expose yet.',
    allowedNow: false,
    source: 'route',
  },
  {
    id: 'cost-tracker',
    path: '/cost-tracker',
    label: 'Cost Tracker',
    component: 'ModulePage',
    currentExposure: 'hidden_internal',
    recommendedExposure: 'hidden_internal',
    recommendation: 'keep_hidden',
    risk: 'low',
    gates: ['none'],
    reason: 'Placeholder page not in navigation. No reason to expose yet.',
    allowedNow: false,
    source: 'route',
  },
  {
    id: 'storage-v2',
    path: '/storage-v2',
    label: 'Storage V2',
    component: 'ModulePage',
    currentExposure: 'hidden_internal',
    recommendedExposure: 'hidden_internal',
    recommendation: 'keep_hidden',
    risk: 'low',
    gates: ['none'],
    reason: 'Placeholder page not in navigation. No reason to expose yet.',
    allowedNow: false,
    source: 'route',
  },
  {
    id: 'system-status',
    path: '/system-status',
    label: 'System Status',
    component: 'ModulePage',
    currentExposure: 'hidden_internal',
    recommendedExposure: 'hidden_internal',
    recommendation: 'keep_hidden',
    risk: 'low',
    gates: ['none'],
    reason: 'Placeholder page not in navigation. No reason to expose yet.',
    allowedNow: false,
    source: 'route',
  },
  {
    id: 'api-docs',
    path: '/api-docs',
    label: 'API Docs',
    component: 'ModulePage',
    currentExposure: 'hidden_internal',
    recommendedExposure: 'hidden_internal',
    recommendation: 'keep_hidden',
    risk: 'low',
    gates: ['none'],
    reason: 'Placeholder page not in navigation. External reference.',
    allowedNow: false,
    source: 'route',
  },
];

export function getNavigationExposureEntryCount(): number {
  return NAVIGATION_EXPOSURE_REGISTRY.length;
}

export function getNavigationExposureByLevel(level: NavigationExposureLevel): NavigationExposureEntry[] {
  return NAVIGATION_EXPOSURE_REGISTRY.filter(entry => entry.recommendedExposure === level);
}

export function getNavigationExposureHighRiskEntries(): NavigationExposureEntry[] {
  return NAVIGATION_EXPOSURE_REGISTRY.filter(entry => entry.risk === 'high');
}

export function getNavigationExposureBySource(source: string): NavigationExposureEntry[] {
  return NAVIGATION_EXPOSURE_REGISTRY.filter(entry => entry.source === source);
}

export function getNavigationExposureByGate(gate: NavigationExposureGate): NavigationExposureEntry[] {
  return NAVIGATION_EXPOSURE_REGISTRY.filter(entry => entry.gates.includes(gate));
}

export function getAllowedNowEntries(): NavigationExposureEntry[] {
  return NAVIGATION_EXPOSURE_REGISTRY.filter(entry => entry.allowedNow);
}

export function getDisallowedEntries(): NavigationExposureEntry[] {
  return NAVIGATION_EXPOSURE_REGISTRY.filter(entry => !entry.allowedNow);
}

export function getRouteAccessRecommendation(path: string): NavigationExposureEntry | undefined {
  return NAVIGATION_EXPOSURE_REGISTRY.find(entry => entry.path === path);
}

export function getNavigationExposureAllowedNowFalseEntries(): NavigationExposureEntry[] {
  return NAVIGATION_EXPOSURE_REGISTRY.filter(entry => !entry.allowedNow);
}

export function getNavigationExposureStats(): {
  total: number;
  byRecommendedLevel: Record<string, number>;
  byRisk: Record<string, number>;
  highRiskCount: number;
  allowedNowFalseCount: number;
} {
  const byRecommendedLevel: Record<string, number> = {};
  const byRisk: Record<string, number> = {};
  for (const entry of NAVIGATION_EXPOSURE_REGISTRY) {
    byRecommendedLevel[entry.recommendedExposure] = (byRecommendedLevel[entry.recommendedExposure] || 0) + 1;
    byRisk[entry.risk] = (byRisk[entry.risk] || 0) + 1;
  }
  return {
    total: NAVIGATION_EXPOSURE_REGISTRY.length,
    byRecommendedLevel,
    byRisk,
    highRiskCount: NAVIGATION_EXPOSURE_REGISTRY.filter(e => e.risk === 'high').length,
    allowedNowFalseCount: NAVIGATION_EXPOSURE_REGISTRY.filter(e => !e.allowedNow).length,
  };
}
