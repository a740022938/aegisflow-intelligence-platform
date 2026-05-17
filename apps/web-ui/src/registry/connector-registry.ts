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

// ── Backward-compatible types for existing ConnectorCenter.tsx ──

export type ConnectorStatus = 'online' | 'warning' | 'offline' | 'unknown' | 'disabled' | 'not_configured';

export type SafetyBoundaryTag = 'readonly' | 'dry_run' | 'approval_required' | 'external_write_blocked' | 'dangerous_action_blocked';

export interface ConnectorActionPolicy {
  allowedActions: string[];
  forbiddenActions: string[];
}

export interface ConnectorHealthSignal {
  label: string;
  value: string | number | boolean;
  status: 'pass' | 'warn' | 'fail' | 'unknown';
}

export interface ConnectorMigrationPlan {
  stage: number;
  description: string;
}

export interface ConnectorDefinition {
  id: string;
  displayName: string;
  category: string;
  description: string;
  currentEntry: string;
  relatedRoutes: string[];
  sourceArtifacts: string[];
  status: ConnectorStatus;
  maturity: string;
  riskLevel: ConnectorRiskLevel;
  safetyBoundaryTags: SafetyBoundaryTag[];
  defaultMode: string;
  dataSource: string;
  targetEntry: string;
  migrationPlan: ConnectorMigrationPlan;
  actionPolicy: ConnectorActionPolicy;
  healthSignals: ConnectorHealthSignal[];
  notes: string;
  nextMilestone?: string;
  configKeys: string[];
  forbiddenActions: string[];
}

export interface ConnectorStatsResult {
  total: number;
  byStatus: Record<string, number>;
  highRiskCount: number;
  readonlyCount: number;
  migrationPendingCount: number;
}

export const CONNECTOR_REGISTRY: ConnectorDefinition[] = [];

export function getConnectorStats(): ConnectorStatsResult {
  return {
    total: 0, byStatus: { online: 0, warning: 0, offline: 0, unknown: 0, disabled: 0, not_configured: 0 },
    highRiskCount: 0, readonlyCount: 0, migrationPendingCount: 0,
  };
}
