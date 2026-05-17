// Governance Registry — static governance module definitions
// READONLY METADATA ONLY. Does not execute real operations,
// write to database, trigger external calls, or enable Stage C.

export type GovernanceModuleId =
  | 'cost-routing' | 'menu-governance' | 'registry-parity'
  | 'registry-render-preview' | 'menu-move-dry-run'
  | 'self-check-quality-gate' | 'release-readiness'
  | 'human-approval-gates' | 'feature-flag-review'
  | 'risk-audit' | 'assistant-center-boundary'
  | 'memory-hub-boundary' | 'connector-lab-boundary';

export type GovernanceModuleCategory =
  | 'routing' | 'menu' | 'integrity' | 'preview'
  | 'quality' | 'release' | 'approval' | 'flags'
  | 'audit' | 'boundary';

export type GovernanceStatus =
  | 'pass' | 'warning' | 'blocked' | 'pending_review'
  | 'approval_required' | 'dry_run_only' | 'disabled'
  | 'deferred' | 'unknown';

export type GovernanceRiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type GovernanceMaturity = 'stable' | 'preview' | 'lab' | 'external';
export type SafetyBoundaryTag = 'readonly' | 'dry_run' | 'approval_required' | 'external_write_blocked' | 'dangerous_action_blocked';
export type GovernanceOwnerCenter = 'governance' | 'connector' | 'lab' | 'standalone' | 'future';
export type IssueSeverity = 'blocking' | 'warning' | 'info';

export interface GovernanceActionPolicy {
  allowedActions: string[];
  forbiddenActions: string[];
}

export interface GovernanceGate {
  gateId: string;
  displayName: string;
  status: 'pass' | 'fail' | 'warn' | 'pending' | 'unknown' | 'deferred' | 'approval_required';
  source: string;
  blocking: boolean;
  lastKnownResult?: string;
  requiredBefore?: string[];
  failurePolicy: 'block' | 'warn' | 'info';
  notes?: string;
}

export interface GovernanceModuleDefinition {
  moduleId: GovernanceModuleId;
  displayName: string;
  category: GovernanceModuleCategory;
  description: string;
  currentEntry: string;
  relatedRoutes: string[];
  sourceArtifacts: string[];
  status: GovernanceStatus;
  maturity: GovernanceMaturity;
  riskLevel: GovernanceRiskLevel;
  safetyBoundaryTags: SafetyBoundaryTag[];
  ownerCenter: GovernanceOwnerCenter;
  actionPolicy: GovernanceActionPolicy;
  dryRunSupport: boolean;
  approvalRequired: boolean;
  writesExternalSystem: boolean;
  writesDatabase: boolean;
  migrationStage: number;
  gates?: GovernanceGate[];
  notes?: string;
}

export const GOVERNANCE_REGISTRY: GovernanceModuleDefinition[] = [
  // ── 1. Cost Routing ──
  {
    moduleId: 'cost-routing',
    displayName: 'Cost Routing / 成本路由',
    category: 'routing',
    description: '路由策略管理、成本估算、决策洞察、优化建议。当前为 KEEP，未来建议归入治理与回流。',
    currentEntry: '/cost-routing',
    relatedRoutes: ['/cost-routing', '/menu-governance-preview', '/registry-render-preview'],
    sourceArtifacts: ['apps/web-ui/src/pages/CostRouting.tsx', 'apps/web-ui/src/registry/menu-registry.ts'],
    status: 'dry_run_only',
    maturity: 'stable',
    riskLevel: 'medium',
    safetyBoundaryTags: ['readonly', 'dry_run', 'approval_required'],
    ownerCenter: 'governance',
    actionPolicy: {
      allowedActions: ['view_status', 'view_report', 'view_dry_run', 'view_risk', 'view_quality_gate', 'view_related_route', 'export_readonly_summary'],
      forbiddenActions: ['write_database', 'modify_layout', 'move_real_menu', 'approve_candidate', 'reject_candidate', 'archive_candidate', 'sync_lan_share', 'taskkill', 'restart_service', 'publish_release', 'create_tag', 'force_push', 'modify_external_project', 'enable_stage_c', 'execute_training', 'execute_model_inference'],
    },
    dryRunSupport: true,
    approvalRequired: true,
    writesExternalSystem: false,
    writesDatabase: false,
    migrationStage: 0,
    gates: [
      { gateId: 'code_quality_gate', displayName: 'Code Quality', status: 'pass', source: 'npm run lint', blocking: true, failurePolicy: 'block' },
      { gateId: 'typecheck_gate', displayName: 'TypeCheck', status: 'pass', source: 'npm run typecheck', blocking: true, failurePolicy: 'block' },
      { gateId: 'build_gate', displayName: 'Build', status: 'pass', source: 'npm run build', blocking: true, failurePolicy: 'block' },
      { gateId: 'secret_scan_gate', displayName: 'Secret Scan', status: 'pass', source: 'npm run secret:scan', blocking: true, failurePolicy: 'block' },
    ],
    notes: 'P1a PageShell migrated. v7.12.3 UX hotfix. KEEP — not moved to governance section yet.',
  },

  // ── 2. Menu Governance ──
  {
    moduleId: 'menu-governance',
    displayName: 'Menu Governance / 菜单治理',
    category: 'menu',
    description: '40 项菜单治理决策表、KEEP/MOVE_TO_LAB/MOVE_TO_CONNECTOR_CENTER 分类、治理自检。',
    currentEntry: '/menu-governance-preview',
    relatedRoutes: ['/menu-governance-preview', '/registry-render-preview', '/menu-move-dry-run'],
    sourceArtifacts: ['apps/web-ui/src/pages/MenuGovernancePreview.tsx', 'apps/web-ui/src/registry/menu-registry.ts', 'apps/web-ui/src/registry/menu-parity-checker.ts'],
    status: 'pass',
    maturity: 'preview',
    riskLevel: 'low',
    safetyBoundaryTags: ['readonly'],
    ownerCenter: 'governance',
    actionPolicy: {
      allowedActions: ['view_status', 'view_report', 'view_risk', 'view_quality_gate', 'view_related_route', 'export_readonly_summary'],
      forbiddenActions: ['write_database', 'modify_layout', 'move_real_menu', 'hide_real_menu', 'delete_menu', 'approve_candidate', 'taskkill', 'restart_service', 'publish_release', 'enable_stage_c'],
    },
    dryRunSupport: false,
    approvalRequired: false,
    writesExternalSystem: false,
    writesDatabase: false,
    migrationStage: 0,
    notes: 'P1h created. 40 items / 11 sections. Parity pass.',
  },

  // ── 3. Registry Parity ──
  {
    moduleId: 'registry-parity',
    displayName: 'Registry Parity / Registry 校验',
    category: 'integrity',
    description: 'MENU_REGISTRY 与 Layout snapshot 的只读 parity check。验证 section count / item count / path / labelKey / icon 一致性。',
    currentEntry: '/registry-render-preview',
    relatedRoutes: ['/registry-render-preview', '/menu-governance-preview'],
    sourceArtifacts: ['apps/web-ui/src/registry/menu-parity-checker.ts', 'apps/web-ui/src/registry/layout-menu-snapshot.ts', 'apps/web-ui/src/registry/menu-registry.ts'],
    status: 'pass',
    maturity: 'preview',
    riskLevel: 'low',
    safetyBoundaryTags: ['readonly'],
    ownerCenter: 'governance',
    actionPolicy: {
      allowedActions: ['view_status', 'view_report', 'view_related_route'],
      forbiddenActions: ['write_database', 'modify_layout', 'move_real_menu', 'hide_real_menu', 'delete_menu', 'enable_stage_c'],
    },
    dryRunSupport: false,
    approvalRequired: false,
    writesExternalSystem: false,
    writesDatabase: false,
    migrationStage: 0,
    gates: [
      { gateId: 'menu_parity_gate', displayName: 'Menu Parity', status: 'pass', source: 'menu-parity-checker.ts', blocking: true, lastKnownResult: '0 blocking / 0 warning / 0 info', requiredBefore: [], failurePolicy: 'block', notes: 'MENU_REGISTRY vs Layout snapshot parity. All checks pass.' },
    ],
    notes: 'P1 created. Parity pass: 0 blocking / 0 warning / 0 info.',
  },

  // ── 4. Registry Render Preview ──
  {
    moduleId: 'registry-render-preview',
    displayName: 'Render Preview / 渲染预览',
    category: 'preview',
    description: 'MENU_REGISTRY 的只读渲染预览。展示当前 Layout snapshot 与 registry render tree 的 side-by-side 对比。',
    currentEntry: '/registry-render-preview',
    relatedRoutes: ['/registry-render-preview', '/menu-governance-preview', '/menu-move-dry-run'],
    sourceArtifacts: ['apps/web-ui/src/pages/RegistryRenderPreview.tsx', 'apps/web-ui/src/registry/menu-render-preview.ts', 'apps/web-ui/src/registry/menu-registry.ts'],
    status: 'pass',
    maturity: 'preview',
    riskLevel: 'low',
    safetyBoundaryTags: ['readonly'],
    ownerCenter: 'governance',
    actionPolicy: {
      allowedActions: ['view_status', 'view_report', 'view_related_route'],
      forbiddenActions: ['write_database', 'modify_layout', 'move_real_menu', 'hide_real_menu', 'delete_menu', 'enable_stage_c'],
    },
    dryRunSupport: false,
    approvalRequired: false,
    writesExternalSystem: false,
    writesDatabase: false,
    migrationStage: 0,
    gates: [
      { gateId: 'render_preview_gate', displayName: 'Render Preview', status: 'pass', source: 'menu-render-preview.ts', blocking: true, lastKnownResult: '0 mismatch', requiredBefore: ['menu_parity_gate'], failurePolicy: 'block', notes: 'Layout snapshot matches registry render tree. No mismatch.' },
    ],
    notes: 'P4 created. Stage B complete. Layout snapshot matches registry render (0 mismatch).',
  },

  // ── 5. Menu Move Dry-Run ──
  {
    moduleId: 'menu-move-dry-run',
    displayName: 'Menu Move Dry-Run / 菜单移动模拟',
    category: 'preview',
    description: '基于 P1g governance decisions 的菜单移动只读模拟。展示 Connector Center / Lab Center 模拟入口和 KEEP 项的最终分布。',
    currentEntry: '/menu-move-dry-run',
    relatedRoutes: ['/menu-move-dry-run', '/menu-governance-preview', '/registry-render-preview', '/connector-center', '/lab-center'],
    sourceArtifacts: ['apps/web-ui/src/pages/MenuMoveDryRun.tsx', 'apps/web-ui/src/registry/menu-move-dry-run.ts', 'apps/web-ui/src/registry/menu-registry.ts'],
    status: 'pass',
    maturity: 'preview',
    riskLevel: 'medium',
    safetyBoundaryTags: ['readonly', 'dry_run', 'approval_required'],
    ownerCenter: 'governance',
    actionPolicy: {
      allowedActions: ['view_status', 'view_report', 'view_dry_run', 'view_risk', 'view_related_route'],
      forbiddenActions: ['write_database', 'modify_layout', 'move_real_menu', 'hide_real_menu', 'delete_menu', 'enable_stage_c', 'publish_release'],
    },
    dryRunSupport: true,
    approvalRequired: true,
    writesExternalSystem: false,
    writesDatabase: false,
    migrationStage: 0,
    gates: [
      { gateId: 'menu_move_dry_run_gate', displayName: 'Menu Move Dry-Run', status: 'pass', source: 'menu-move-dry-run.ts', blocking: true, lastKnownResult: '12/12 checks pass', requiredBefore: ['render_preview_gate'], failurePolicy: 'block', notes: 'Dry-run validated: MOVE_TO_LAB=13, MOVE_TO_CONNECTOR=2, MOVE_TO_GOVERNANCE=0.' },
    ],
    notes: 'P5 created. Dry-run validated: 12/12 checks pass. MOVE_TO_LAB=13, MOVE_TO_CONNECTOR=2, MOVE_TO_GOVERNANCE=0.',
  },

  // ── 6. Self-Check / Quality Gate ──
  {
    moduleId: 'self-check-quality-gate',
    displayName: 'Quality Gates / 质量门禁',
    category: 'quality',
    description: 'AIP 质量门禁聚合：lint / typecheck / build / smoke / db doctor / secret scan。所有门禁通过后允许施工。',
    currentEntry: '/cost-routing',
    relatedRoutes: ['/cost-routing', '/menu-governance-preview'],
    sourceArtifacts: ['apps/web-ui/src/pages/CostRouting.tsx'],
    status: 'pass',
    maturity: 'stable',
    riskLevel: 'low',
    safetyBoundaryTags: ['readonly'],
    ownerCenter: 'governance',
    actionPolicy: {
      allowedActions: ['view_status', 'view_report', 'view_quality_gate', 'view_related_route'],
      forbiddenActions: ['write_database', 'modify_layout', 'move_real_menu', 'taskkill', 'restart_service', 'enable_stage_c'],
    },
    dryRunSupport: false,
    approvalRequired: false,
    writesExternalSystem: false,
    writesDatabase: false,
    migrationStage: 0,
    gates: [
      { gateId: 'smoke_gate', displayName: 'Smoke Test', status: 'pass', source: 'npm run test:smoke', blocking: true, lastKnownResult: 'pass (manual)', requiredBefore: ['code_quality_gate', 'typecheck_gate', 'build_gate'], failurePolicy: 'block', notes: 'Smoke test validates basic rendering and routing. Not automated in CI yet.' },
      { gateId: 'db_doctor_gate', displayName: 'DB Doctor', status: 'pass', source: 'npm run db:doctor', blocking: false, lastKnownResult: 'pass (manual)', requiredBefore: ['build_gate'], failurePolicy: 'warn', notes: 'Database health check. Non-blocking but warns on failure.' },
    ],
    notes: 'Gate info sourced from CostRouting console dashboard.',
  },

  // ── 7. Release Readiness ──
  {
    moduleId: 'release-readiness',
    displayName: 'Release Readiness / 发布准备度',
    category: 'release',
    description: 'GitHub 发布准备度检查。只读展示 repo / branch / HEAD / release gate 状态。不执行发布。',
    currentEntry: '/cost-routing',
    relatedRoutes: ['/cost-routing', '/menu-move-dry-run'],
    sourceArtifacts: ['apps/web-ui/src/pages/CostRouting.tsx'],
    status: 'dry_run_only',
    maturity: 'stable',
    riskLevel: 'high',
    safetyBoundaryTags: ['readonly', 'dry_run', 'approval_required', 'dangerous_action_blocked'],
    ownerCenter: 'governance',
    actionPolicy: {
      allowedActions: ['view_status', 'view_report', 'view_dry_run', 'view_risk'],
      forbiddenActions: ['write_database', 'modify_layout', 'publish_release', 'create_tag', 'force_push', 'modify_external_project', 'enable_stage_c', 'taskkill'],
    },
    dryRunSupport: true,
    approvalRequired: true,
    writesExternalSystem: true,
    writesDatabase: false,
    migrationStage: 0,
    gates: [
      { gateId: 'release_readiness_gate', displayName: 'Release Readiness', status: 'pass', source: 'GitHub release gate check', blocking: true, lastKnownResult: 'All release gates pass', requiredBefore: ['code_quality_gate', 'typecheck_gate', 'build_gate', 'secret_scan_gate', 'human_approval_gate'], failurePolicy: 'block', notes: 'Release readiness gate. Display only — no real release triggered from Governance Center.' },
    ],
    notes: 'High risk. All release actions forbidden. Dry-run only. Connector Center reference.',
  },

  // ── 8. Human Approval Gates ──
  {
    moduleId: 'human-approval-gates',
    displayName: 'Approval Gates / 审批门禁',
    category: 'approval',
    description: '需要人工确认的治理门禁列表。展示哪些动作需要审批、是否已授权、授权人。',
    currentEntry: '/approvals',
    relatedRoutes: ['/approvals', '/cost-routing'],
    sourceArtifacts: [],
    status: 'approval_required',
    maturity: 'stable',
    riskLevel: 'medium',
    safetyBoundaryTags: ['readonly', 'approval_required'],
    ownerCenter: 'governance',
    actionPolicy: {
      allowedActions: ['view_status', 'view_report', 'view_risk', 'view_related_route'],
      forbiddenActions: ['write_database', 'modify_layout', 'move_real_menu', 'hide_real_menu', 'delete_menu', 'approve_candidate', 'reject_candidate', 'archive_candidate', 'taskkill', 'restart_service', 'publish_release', 'enable_stage_c'],
    },
    dryRunSupport: false,
    approvalRequired: true,
    writesExternalSystem: false,
    writesDatabase: false,
    migrationStage: 0,
    gates: [
      { gateId: 'human_approval_gate', displayName: 'Human Approval', status: 'approval_required', source: '/approvals page', blocking: true, lastKnownResult: 'Pending human approval', requiredBefore: [], failurePolicy: 'block', notes: 'Display only. No auto-approve from Governance Center. All approvals require human action via /approvals page.' },
    ],
    notes: 'Approval gates display only. No real approve/reject execution from Governance Center.',
  },

  // ── 9. Feature Flag Review ──
  {
    moduleId: 'feature-flag-review',
    displayName: 'Feature Flags / 功能开关',
    category: 'flags',
    description: '治理 feature flag 审核状态。当前所有 flag 默认为 false，不允许用户误开。',
    currentEntry: '—',
    relatedRoutes: ['/menu-move-dry-run', '/registry-render-preview'],
    sourceArtifacts: [],
    status: 'deferred',
    maturity: 'preview',
    riskLevel: 'medium',
    safetyBoundaryTags: ['readonly', 'approval_required', 'dangerous_action_blocked'],
    ownerCenter: 'future',
    actionPolicy: {
      allowedActions: ['view_status', 'view_related_route'],
      forbiddenActions: ['write_database', 'modify_layout', 'move_real_menu', 'enable_stage_c', 'publish_release', 'taskkill'],
    },
    dryRunSupport: false,
    approvalRequired: false,
    writesExternalSystem: false,
    writesDatabase: false,
    migrationStage: 0,
    gates: [
      { gateId: 'stage_c_gate', displayName: 'Stage C Gate', status: 'deferred', source: 'governance-registry.ts', blocking: true, lastKnownResult: 'deferred', requiredBefore: ['release_readiness_gate', 'human_approval_gate', 'menu_move_dry_run_gate'], failurePolicy: 'block', notes: 'Stage C (Feature-flagged Layout Rendering) has not started. Must not auto-enable. Requires independent design review and human sign-off. Current page must not provide enable button.' },
    ],
    notes: 'All flags default false. Stage C flag must remain deferred until separate design review.',
  },

  // ── 10. Risk Audit ──
  {
    moduleId: 'risk-audit',
    displayName: 'Risk Audit / 风险审计',
    category: 'audit',
    description: '审计日志、风险边界检查、安全操作记录。只读查看。',
    currentEntry: '/audit',
    relatedRoutes: ['/audit', '/menu-governance-preview'],
    sourceArtifacts: [],
    status: 'pass',
    maturity: 'stable',
    riskLevel: 'low',
    safetyBoundaryTags: ['readonly'],
    ownerCenter: 'governance',
    actionPolicy: {
      allowedActions: ['view_status', 'view_report', 'view_risk', 'view_related_route', 'export_readonly_summary'],
      forbiddenActions: ['write_database', 'modify_layout', 'move_real_menu', 'hide_real_menu', 'delete_menu', 'taskkill', 'restart_service', 'enable_stage_c'],
    },
    dryRunSupport: false,
    approvalRequired: false,
    writesExternalSystem: false,
    writesDatabase: false,
    migrationStage: 0,
    notes: 'References /audit page. Readonly view only.',
  },

  // ── 11. Assistant Center Boundary ──
  {
    moduleId: 'assistant-center-boundary',
    displayName: 'Assistant Center / 助手中心',
    category: 'boundary',
    description: 'AI 助手运行态对话与执行中心。Governance Center 仅做边界观察，不管理 Assistant Center 内部操作。',
    currentEntry: '/assistant-center',
    relatedRoutes: ['/assistant-center'],
    sourceArtifacts: ['apps/web-ui/src/pages/AssistantCenter.tsx'],
    status: 'pass',
    maturity: 'preview',
    riskLevel: 'low',
    safetyBoundaryTags: ['readonly'],
    ownerCenter: 'connector',
    actionPolicy: {
      allowedActions: ['view_status', 'view_report', 'view_related_route'],
      forbiddenActions: ['write_database', 'modify_layout', 'move_real_menu', 'approve_candidate', 'reject_candidate', 'archive_candidate', 'taskkill', 'restart_service', 'enable_stage_c'],
    },
    dryRunSupport: false,
    approvalRequired: false,
    writesExternalSystem: false,
    writesDatabase: false,
    migrationStage: 0,
    notes: 'Observation only. Managed by AssistantCenter standalone page.',
  },

  // ── 12. Memory Hub Boundary ──
  {
    moduleId: 'memory-hub-boundary',
    displayName: 'Memory Hub',
    category: 'boundary',
    description: 'Memory Hub 记忆存储、候选管理。Governance Center 仅做边界观察，不管理 candidate 操作。',
    currentEntry: '/memory-hub',
    relatedRoutes: ['/memory-hub', '/connector-center'],
    sourceArtifacts: ['apps/web-ui/src/pages/MemoryHubReadonly.tsx', 'apps/web-ui/src/registry/connector-registry.ts'],
    status: 'pass',
    maturity: 'external',
    riskLevel: 'low',
    safetyBoundaryTags: ['readonly', 'external_write_blocked'],
    ownerCenter: 'connector',
    actionPolicy: {
      allowedActions: ['view_status', 'view_report', 'view_related_route'],
      forbiddenActions: ['write_database', 'modify_layout', 'move_real_menu', 'approve_candidate', 'reject_candidate', 'archive_candidate', 'sync_lan_share', 'taskkill', 'restart_service', 'enable_stage_c'],
    },
    dryRunSupport: false,
    approvalRequired: false,
    writesExternalSystem: true,
    writesDatabase: false,
    migrationStage: 0,
    notes: 'Observation only. Managed by MemoryHubReadonly standalone page.',
  },

  // ── 13. Connector + Lab Centers Boundary ──
  {
    moduleId: 'connector-lab-boundary',
    displayName: 'Connector + Lab Centers',
    category: 'boundary',
    description: 'Connector Center（外部连接器）和 Lab Center（实验功能）的治理边界观察。不属于 Governance Center 直接管理范围。',
    currentEntry: '/connector-center',
    relatedRoutes: ['/connector-center', '/lab-center'],
    sourceArtifacts: ['apps/web-ui/src/pages/ConnectorCenter.tsx', 'apps/web-ui/src/pages/LabCenter.tsx', 'apps/web-ui/src/registry/connector-registry.ts', 'apps/web-ui/src/registry/lab-registry.ts'],
    status: 'pass',
    maturity: 'preview',
    riskLevel: 'low',
    safetyBoundaryTags: ['readonly'],
    ownerCenter: 'standalone',
    actionPolicy: {
      allowedActions: ['view_status', 'view_report', 'view_related_route'],
      forbiddenActions: ['write_database', 'modify_layout', 'move_real_menu', 'hide_real_menu', 'delete_menu', 'taskkill', 'restart_service', 'enable_stage_c', 'publish_release'],
    },
    dryRunSupport: false,
    approvalRequired: false,
    writesExternalSystem: false,
    writesDatabase: false,
    migrationStage: 0,
    notes: 'Observation only. Connector Center and Lab Center are standalone readonly shells.',
  },
];
