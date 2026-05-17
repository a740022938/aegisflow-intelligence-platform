// Connector Registry — static connector definitions
// READONLY METADATA ONLY. Does not call real APIs, write to databases,
// or execute external tool operations.

export type ConnectorType =
  | 'external_tool'
  | 'ai_assistant'
  | 'model_platform'
  | 'memory_system'
  | 'labeling_tool'
  | 'workflow_tool'
  | 'future_connector';

export type ConnectorMaturity = 'stable' | 'preview' | 'lab' | 'external' | 'future';
export type ConnectorRiskLevel = 'low' | 'medium' | 'high';
export type ConnectorRegistryStatus = 'available_route' | 'planned' | 'external_only' | 'unknown';
export type ConnectorCategory = 'active' | 'future' | 'hold_review';
export type ConnectorReadiness = 'ready' | 'preview_ready' | 'planned' | 'hold_review' | 'blocked';
export type ConnectorExposure = 'sidebar' | 'advanced_hub' | 'hidden_direct' | 'future';
export type ConnectorHealthLabel = 'ok' | 'watch' | 'unknown' | 'blocked';
export type ConnectorSafetyStatus = 'safe' | 'watch' | 'risky' | 'blocked';
export type ConnectorReviewStatus = 'passed' | 'preview_ok' | 'hold_review' | 'future_review';

export interface ConnectorQualityGate {
  readonly: boolean;
  noDbWrite: boolean;
  noExternalControl: boolean;
  noStageC: boolean;
  noDangerousActions: boolean;
}

export interface ConnectorRegistryItem {
  id: string;
  name: string;
  type: ConnectorType;
  status: ConnectorRegistryStatus;
  maturity: ConnectorMaturity;
  riskLevel: ConnectorRiskLevel;
  currentRoute?: string;
  futureRoute?: string;
  capabilities: string[];
  safetyBoundary: string[];
  actionsAllowed: string[];
  actionsBlocked: string[];
  dataSource: 'static_registry' | 'existing_page' | 'future_integration';
  category: ConnectorCategory;
  readiness: ConnectorReadiness;
  exposure: ConnectorExposure;
  healthLabel: ConnectorHealthLabel;
  recommendedNextStep: string;
  riskNotes: string[];
  setupNotes: string[];
  evidence: string[];
  qualityGate: ConnectorQualityGate;
  displayGroup: string;
  safetyStatus: ConnectorSafetyStatus;
  reviewStatus: ConnectorReviewStatus;
  notes: string;
}

export const CONNECTOR_REGISTRY_NEW: ConnectorRegistryItem[] = [
  // ── Active / Available Routes ──
  {
    id: 'openaxiom',
    name: 'OpenAxiom',
    type: 'labeling_tool',
    status: 'available_route',
    maturity: 'external',
    riskLevel: 'low',
    currentRoute: '/openaxiom-readonly',
    capabilities: ['标注数据查看', '标注状态检查', '只读审计'],
    safetyBoundary: ['readonly', 'no_label_write', 'no_save_restore_train'],
    actionsAllowed: ['view_status', 'view_report', 'view_related_route'],
    actionsBlocked: ['write_database', 'modify_label', 'save_restore', 'train_model', 'taskkill', 'enable_stage_c'],
    dataSource: 'existing_page',
    category: 'active',
    readiness: 'preview_ready',
    exposure: 'sidebar',
    healthLabel: 'ok',
    recommendedNextStep: 'Keep readonly. Monitor label access patterns.',
    riskNotes: [],
    setupNotes: ['P1b 已接入 PageShell'],
    evidence: ['apps/web-ui/src/pages/OpenAxiomReadonly.tsx'],
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true },
    displayGroup: 'active_connectors',
    safetyStatus: 'safe',
    reviewStatus: 'preview_ok',
    notes: 'OpenAxiom 标注平台只读页。P1b PageShell migrated. 外部工具只读页，建议移至 connector 分组。',
  },
  {
    id: 'memory-hub',
    name: 'Memory Hub',
    type: 'memory_system',
    status: 'available_route',
    maturity: 'external',
    riskLevel: 'low',
    currentRoute: '/memory-hub',
    capabilities: ['记忆存储查看', '候选管理状态', '只读审计'],
    safetyBoundary: ['readonly', 'no_sqlite_write', 'no_candidate_processing', 'no_lan_sync'],
    actionsAllowed: ['view_status', 'view_report', 'view_related_route'],
    actionsBlocked: ['write_database', 'modify_layout', 'approve_candidate', 'reject_candidate', 'archive_candidate', 'sync_lan_share', 'taskkill', 'restart_service', 'enable_stage_c'],
    dataSource: 'existing_page',
    category: 'active',
    readiness: 'preview_ready',
    exposure: 'sidebar',
    healthLabel: 'ok',
    recommendedNextStep: 'Keep readonly. Monitor memory access patterns.',
    riskNotes: [],
    setupNotes: ['P1b 已接入 PageShell'],
    evidence: ['apps/web-ui/src/pages/MemoryHubReadonly.tsx'],
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true },
    displayGroup: 'active_connectors',
    safetyStatus: 'safe',
    reviewStatus: 'preview_ok',
    notes: 'Memory Hub 记忆存储只读页。P1b PageShell migrated. 外部工具只读页，建议移至 connector 分组。',
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    type: 'model_platform',
    status: 'external_only',
    maturity: 'future',
    riskLevel: 'medium',
    capabilities: ['模型浏览', '模型下载状态', 'HuggingFace 集成参考'],
    safetyBoundary: ['no_api_call', 'no_token_display', 'no_model_upload', 'readonly'],
    actionsAllowed: ['view_status', 'view_related_route'],
    actionsBlocked: ['write_database', 'modify_layout', 'publish_release', 'create_tag', 'enable_stage_c', 'upload_model', 'call_api', 'display_token'],
    dataSource: 'future_integration',
    category: 'active',
    readiness: 'planned',
    exposure: 'advanced_hub',
    healthLabel: 'unknown',
    recommendedNextStep: 'Plan HuggingFace API integration design. Do not expose token fields.',
    riskNotes: ['External API integration risk', 'Token display risk'],
    setupNotes: ['当前为 ModulePage 占位页', '需对接 HuggingFace API'],
    evidence: ['apps/web-ui/src/pages/ModulePage.tsx (huggingface route)'],
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true },
    displayGroup: 'active_connectors',
    safetyStatus: 'safe',
    reviewStatus: 'future_review',
    notes: 'HuggingFace 模型平台候选。当前为 ModulePage 占位页，尚未对接 HuggingFace API。未来 Connector Center 候选。',
  },

  // ── Future Connectors ──
  {
    id: 'openclaw',
    name: 'OpenClaw',
    type: 'ai_assistant',
    status: 'planned',
    maturity: 'future',
    riskLevel: 'high',
    capabilities: ['AI 助手调度', '任务生成', 'Sidecar 桥接'],
    safetyBoundary: ['no_control', 'no_write_config', 'no_run_workflow', 'readonly_planning'],
    actionsAllowed: ['view_status', 'generate_task_package', 'view_notes'],
    actionsBlocked: ['control', 'write_config', 'run_workflow', 'modify_external_system', 'taskkill', 'restart_service', 'enable_stage_c', 'write_database'],
    dataSource: 'future_integration',
    category: 'future',
    readiness: 'hold_review',
    exposure: 'future',
    healthLabel: 'unknown',
    recommendedNextStep: 'Hold for review. Define OpenClaw safety boundary before any integration.',
    riskNotes: ['High risk — AI assistant scheduling', 'Could trigger automated task execution'],
    setupNotes: ['需定义 OpenClaw 桥接安全边界'],
    evidence: [],
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true },
    displayGroup: 'future_connectors',
    safetyStatus: 'risky',
    reviewStatus: 'hold_review',
    notes: 'OpenClaw AI 助手。未来 Connector 候选。当前不接真实控制。',
  },
  {
    id: 'comfyui',
    name: 'ComfyUI',
    type: 'workflow_tool',
    status: 'planned',
    maturity: 'future',
    riskLevel: 'high',
    capabilities: ['工作流执行状态', 'ComfyUI 节点查看'],
    safetyBoundary: ['no_control', 'no_launch', 'no_submit_queue', 'readonly'],
    actionsAllowed: ['view_status', 'view_notes'],
    actionsBlocked: ['control', 'launch', 'submit_queue', 'generate_images', 'write_config', 'modify_external_system', 'taskkill', 'enable_stage_c'],
    dataSource: 'future_integration',
    category: 'future',
    readiness: 'hold_review',
    exposure: 'future',
    healthLabel: 'unknown',
    recommendedNextStep: 'Hold for review. Define ComfyUI safety boundary before any integration.',
    riskNotes: ['High risk — workflow execution', 'Could launch image generation pipelines'],
    setupNotes: ['需定义 ComfyUI 安全边界'],
    evidence: [],
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true },
    displayGroup: 'future_connectors',
    safetyStatus: 'risky',
    reviewStatus: 'hold_review',
    notes: 'ComfyUI 工作流工具。未来 Connector 候选。当前不接真实控制。',
  },
  {
    id: 'hermes',
    name: 'Hermes',
    type: 'ai_assistant',
    status: 'planned',
    maturity: 'future',
    riskLevel: 'medium',
    capabilities: ['消息传递', 'AI 助手桥接'],
    safetyBoundary: ['no_control', 'readonly'],
    actionsAllowed: ['view_status', 'view_notes'],
    actionsBlocked: ['control', 'write_config', 'modify_external_system', 'taskkill', 'enable_stage_c', 'write_database'],
    dataSource: 'future_integration',
    category: 'future',
    readiness: 'planned',
    exposure: 'future',
    healthLabel: 'unknown',
    recommendedNextStep: 'Plan Hermes integration design.',
    riskNotes: ['Medium risk — message bridge exposed'],
    setupNotes: ['需设计 Hermes 集成方案'],
    evidence: [],
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true },
    displayGroup: 'future_connectors',
    safetyStatus: 'safe',
    reviewStatus: 'future_review',
    notes: 'Hermes AI 助手桥接。未来 Connector 候选。',
  },
  {
    id: 'cc-switch',
    name: 'CC Switch',
    type: 'external_tool',
    status: 'planned',
    maturity: 'future',
    riskLevel: 'medium',
    capabilities: ['CC Switch 状态查看'],
    safetyBoundary: ['no_control', 'readonly'],
    actionsAllowed: ['view_status', 'view_notes'],
    actionsBlocked: ['control', 'write_config', 'modify_external_system', 'taskkill', 'enable_stage_c', 'write_database'],
    dataSource: 'future_integration',
    category: 'future',
    readiness: 'planned',
    exposure: 'future',
    healthLabel: 'unknown',
    recommendedNextStep: 'Plan CC Switch integration design.',
    riskNotes: ['Medium risk — external switch control'],
    setupNotes: ['需设计 CC Switch 集成方案'],
    evidence: [],
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true },
    displayGroup: 'future_connectors',
    safetyStatus: 'safe',
    reviewStatus: 'future_review',
    notes: 'CC Switch 外部连接器。未来 Connector 候选。',
  },
  {
    id: 'claude-proxy',
    name: 'Claude Proxy',
    type: 'ai_assistant',
    status: 'planned',
    maturity: 'future',
    riskLevel: 'medium',
    capabilities: ['Claude API 代理', '推理调用参考'],
    safetyBoundary: ['no_api_call', 'no_token_display', 'readonly'],
    actionsAllowed: ['view_status', 'view_notes'],
    actionsBlocked: ['call_api', 'display_token', 'modify_external_system', 'taskkill', 'enable_stage_c', 'write_database'],
    dataSource: 'future_integration',
    category: 'future',
    readiness: 'planned',
    exposure: 'future',
    healthLabel: 'unknown',
    recommendedNextStep: 'Plan Claude Proxy integration design. Do not expose token fields.',
    riskNotes: ['Medium risk — API proxy access', 'Token/key management risk'],
    setupNotes: ['需配置 Claude API key (不存储在 registry)', '需设计代理安全边界'],
    evidence: [],
    qualityGate: { readonly: true, noDbWrite: true, noExternalControl: true, noStageC: true, noDangerousActions: true },
    displayGroup: 'future_connectors',
    safetyStatus: 'safe',
    reviewStatus: 'future_review',
    notes: 'Claude/DeepSeek 代理连接器。未来 Connector 候选。',
  },
];

export function getConnectorRegistryCount(): number {
  return CONNECTOR_REGISTRY_NEW.length;
}

export function getConnectorRegistryByRisk(riskLevel: ConnectorRiskLevel): ConnectorRegistryItem[] {
  return CONNECTOR_REGISTRY_NEW.filter(c => c.riskLevel === riskLevel);
}

export function getConnectorRegistryAvailableRoutes(): ConnectorRegistryItem[] {
  return CONNECTOR_REGISTRY_NEW.filter(c => c.status === 'available_route');
}

export function getConnectorRegistryFutureConnectors(): ConnectorRegistryItem[] {
  return CONNECTOR_REGISTRY_NEW.filter(c => c.status === 'planned' || c.status === 'external_only' || c.status === 'unknown');
}

export function getConnectorRegistryByCategory(category: ConnectorCategory): ConnectorRegistryItem[] {
  return CONNECTOR_REGISTRY_NEW.filter(c => c.category === category);
}

export function getConnectorRegistryByReadiness(readiness: ConnectorReadiness): ConnectorRegistryItem[] {
  return CONNECTOR_REGISTRY_NEW.filter(c => c.readiness === readiness);
}

export function getConnectorRegistrySidebarReadyItems(): ConnectorRegistryItem[] {
  return CONNECTOR_REGISTRY_NEW.filter(c => c.exposure === 'sidebar' || c.exposure === 'advanced_hub');
}

export function getConnectorRegistryRiskSummary(): { total: number; low: number; medium: number; high: number } {
  return {
    total: CONNECTOR_REGISTRY_NEW.length,
    low: CONNECTOR_REGISTRY_NEW.filter(c => c.riskLevel === 'low').length,
    medium: CONNECTOR_REGISTRY_NEW.filter(c => c.riskLevel === 'medium').length,
    high: CONNECTOR_REGISTRY_NEW.filter(c => c.riskLevel === 'high').length,
  };
}

export function getConnectorRegistryReadinessSummary(): { total: number; ready: number; previewReady: number; planned: number; holdReview: number; blocked: number } {
  return {
    total: CONNECTOR_REGISTRY_NEW.length,
    ready: CONNECTOR_REGISTRY_NEW.filter(c => c.readiness === 'ready').length,
    previewReady: CONNECTOR_REGISTRY_NEW.filter(c => c.readiness === 'preview_ready').length,
    planned: CONNECTOR_REGISTRY_NEW.filter(c => c.readiness === 'planned').length,
    holdReview: CONNECTOR_REGISTRY_NEW.filter(c => c.readiness === 'hold_review').length,
    blocked: CONNECTOR_REGISTRY_NEW.filter(c => c.readiness === 'blocked').length,
  };
}

export function getConnectorRegistryQualityGateSummary(): { total: number; passedAll: number; holdReview: number } {
  const passedAll = CONNECTOR_REGISTRY_NEW.filter(c => Object.values(c.qualityGate).every(v => v === true)).length;
  return { total: CONNECTOR_REGISTRY_NEW.length, passedAll, holdReview: CONNECTOR_REGISTRY_NEW.filter(c => c.reviewStatus === 'hold_review').length };
}

// ── Backward-compatible exports for existing ConnectorCenter.tsx ──
export type ConnectorStatus = 'online' | 'warning' | 'offline' | 'unknown' | 'disabled' | 'not_configured';
export type SafetyBoundaryTag = 'readonly' | 'dry_run' | 'approval_required' | 'external_write_blocked' | 'dangerous_action_blocked';
export interface ConnectorActionPolicy { allowedActions: string[]; forbiddenActions: string[] }
export interface ConnectorHealthSignal { label: string; value: string | number | boolean; status: 'pass' | 'warn' | 'fail' | 'unknown' }
export interface ConnectorMigrationPlan { stage: number; description: string }
export interface ConnectorDefinition {
  id: string; displayName: string; category: string; description: string; currentEntry: string;
  relatedRoutes: string[]; sourceArtifacts: string[]; status: ConnectorStatus; maturity: string;
  riskLevel: ConnectorRiskLevel; safetyBoundaryTags: SafetyBoundaryTag[]; defaultMode: string;
  dataSource: string; targetEntry: string; migrationPlan: ConnectorMigrationPlan;
  actionPolicy: ConnectorActionPolicy; healthSignals: ConnectorHealthSignal[]; notes: string;
  nextMilestone?: string; configKeys: string[]; forbiddenActions: string[];
}
export interface ConnectorStatsResult { total: number; byStatus: Record<string, number>; highRiskCount: number; readonlyCount: number; migrationPendingCount: number }
export const CONNECTOR_REGISTRY: ConnectorDefinition[] = [];
export function getConnectorStats(): ConnectorStatsResult {
  return { total: 0, byStatus: { online: 0, warning: 0, offline: 0, unknown: 0, disabled: 0, not_configured: 0 }, highRiskCount: 0, readonlyCount: 0, migrationPendingCount: 0 };
}
