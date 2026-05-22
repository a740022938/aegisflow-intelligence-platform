// OpenAIP v8 Center Registry — shared static data layer
// READONLY METADATA ONLY. Does not call real APIs, write to databases, or execute.

export type V8Lifecycle = 'planned' | 'registered' | 'enabled' | 'paused' | 'disabled' | 'quarantined' | 'draft' | 'running' | 'stopped' | 'error';
export type V8TaskLifecycle = 'draft' | 'ready_for_agent' | 'running_external' | 'receipt_pending' | 'pending_review' | 'accepted' | 'rejected' | 'blocked' | 'archived';
export type V8ReviewState = 'pending_review' | 'needs_evidence' | 'accepted' | 'rejected' | 'blocked' | 'archived';
export type V8PermissionLevel = 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
export type V8RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type V8DataSource = 'static_registry' | 'example_json' | 'future_integration';
export type V8AcceptanceState = 'accepted' | 'needs_evidence' | 'rejected' | 'blocked' | 'archived';
export type V8EvidenceLevel = 'none' | 'partial' | 'sufficient' | 'seal_grade';

export interface V8RegistryTruthFields {
  configured?: boolean;
  online?: boolean;
  authorized?: boolean;
  gateOpen?: boolean;
  stageCEnabled?: boolean;
}

export interface V8BaseEntry {
  dataSource?: V8DataSource;
  safetyNote?: string;
  blockedActions?: string[];
  futurePhase?: string;
}

export interface V8AgentEntry extends V8RegistryTruthFields, V8BaseEntry {
  id: string;
  name: string;
  kind: 'agent';
  integrationKind: string;
  lifecycle: V8Lifecycle;
  permissionLevel: V8PermissionLevel;
  status?: string;
  capabilities?: string[];
  risk?: V8RiskLevel;
  taskReadiness?: 'ready' | 'partial' | 'not_ready';
  auditReadiness?: 'ready' | 'partial' | 'not_ready';
  memoryAccess?: 'readonly' | 'scoped_write' | 'none';
  knowledgeAccess?: 'readonly' | 'none';
}

export interface V8ProviderEntry extends V8RegistryTruthFields, V8BaseEntry {
  id: string;
  name: string;
  kind: 'provider';
  providerKind: 'cloud_provider' | 'openai_compatible_provider' | 'local_model_server' | 'provider_proxy' | 'config_switcher_reference' | 'unknown_provider';
  configStatus: 'registered_example' | 'configured_example' | 'disabled_planned';
  selectionState: 'not_selected' | 'selected_readonly_preview';
  modelProfileExamples: string[];
  routingRole: string;
  costVisibility: 'none' | 'estimated' | 'planned';
  secretHandling: 'no_secret_display' | 'masked_reference_only';
  risk: V8RiskLevel;
  permissionRequired: V8PermissionLevel;
  allowedInPreview: boolean;
  readonly: boolean;
  lifecycle: V8Lifecycle;
  permissionLevel: V8PermissionLevel;
}

export interface V8IntegrationEntry extends V8RegistryTruthFields, V8BaseEntry {
  id: string;
  name: string;
  kind: string;
  lifecycle: V8Lifecycle;
  connectionMode: string;
  authState: 'none' | 'registered' | 'connected_readonly' | 'authorized_readonly';
  actionState: 'blocked' | 'readonly_only';
  relatedProviderId: string | null;
  relatedLocalAppId: string | null;
  relatedAgentId: string | null;
  risk: V8RiskLevel;
  permissionRequired: V8PermissionLevel;
  allowedInPreview: boolean;
  readonly: boolean;
  permissionLevel: V8PermissionLevel;
}

export interface V8LocalAppEntry extends V8RegistryTruthFields, V8BaseEntry {
  id: string;
  name: string;
  kind: string;
  subtype?: string;
  lifecycle: V8Lifecycle;
  permissionLevel: V8PermissionLevel;
}

export interface V8CapabilityEntry extends V8BaseEntry {
  id: string;
  name: string;
  category: string;
  kind: string;
  risk: V8RiskLevel;
  permissionLevel: V8PermissionLevel;
  approvalRequired: boolean;
  gateRequired: boolean;
  stageCRequired: boolean;
  auditRequired: boolean;
  allowedInPreview: boolean;
  blockedReason?: string;
  defaultPolicy: string;
  examples: string[];
  relatedCenters: string[];
}

export interface V8PolicyEntry extends V8BaseEntry {
  id: string;
  name: string;
  permissionLevel: V8PermissionLevel;
  scope: string;
  allowedCapabilities: string[];
  blockedCapabilities: string[];
  approvalRequired: boolean;
  gateRequired: boolean;
  stageCRequired: boolean;
  auditRequired: boolean;
  defaultState: string;
  appliesTo: string[];
  enforcementPhase: string;
  gateOpen: boolean;
  stageCEnabled: boolean;
  rule: string;
}

export interface V8TaskEntry extends V8BaseEntry {
  id: string;
  title: string;
  intent: string;
  phase: string;
  lifecycle: V8TaskLifecycle;
  risk: V8RiskLevel;
  recommendedAgent: string;
  permissionRequired: V8PermissionLevel;
  allowedActions: string[];
  requiredEvidence: string[];
  reviewState: V8ReviewState;
  receiptRequired: boolean;
  auditRequired: boolean;
  humanAuthorizationRequired: boolean;
}

export interface V8AuditEntry extends V8BaseEntry {
  id: string;
  title: string;
  taskType: string;
  relatedCenter: string;
  relatedTaskId?: string;
  relatedAgentId?: string;
  phase: string;
  verdict: string;
  commitHash: string;
  pushed: boolean;
  workingTreeClean: boolean;
  filesChangedSummary: string;
  verificationStatus: string;
  verificationCommands: string[];
  safetyStatus: string;
  safetyFindings: string[];
  runtimeChanged: boolean;
  servicesRestarted: boolean;
  dbWritten: boolean;
  gateOpened: boolean;
  stageCEnabled: boolean;
  releaseTagCreated: boolean;
  authGateChanged: boolean;
  connectorActionExecuted: boolean;
  humanAuthorizationNeeded: boolean;
  acceptanceState: V8AcceptanceState;
  evidenceLevel: V8EvidenceLevel;
  timestamp: string;
}

export interface V8MemoryKnowledgeEntry extends V8BaseEntry {
  id: string;
  source: string;
  accessMode: string;
  lifecycle: V8Lifecycle;
  permissionLevel: V8PermissionLevel;
}

export interface V8IntegrationProviderHandshakeRow {
  id: string;
  integrationId: string;
  providerOrCenter: string;
  relationship: string;
  currentPreviewState: string;
  blockedActions: string[];
  risk: V8RiskLevel;
  requiredPolicy: string;
  auditRequired: boolean;
  gateRequired: boolean;
  dataSource: V8DataSource;
  readonly: boolean;
}

export interface V8ConnectorMigrationEntry {
  id: string;
  legacyConnectorId: string;
  legacyConnectorName: string;
  v8Center: string;
  v8Mapping: string;
  migrationStatus: 'migrated' | 'in_progress' | 'planned' | 'blocked';
  notes: string;
}

// ── Agents Registry ──
// OpenClaw: agent + runtime gateway integration, optional but first-class
export const V8_AGENTS: V8AgentEntry[] = [
  {
    id: 'agent.openclaw', name: 'OpenClaw', kind: 'agent', integrationKind: 'runtime_service',
    lifecycle: 'enabled', permissionLevel: 'L2', status: 'online — no execution',
    configured: true, online: false, authorized: false, gateOpen: false, stageCEnabled: false,
    dataSource: 'static_registry', risk: 'high',
    safetyNote: 'Agent registered does not mean execution allowed. OpenClaw is optional but first-class.',
    blockedActions: ['agent execution', 'browser control', 'connector action', 'lifecycle mutation', 'permission level changes', 'agent launch/stop'],
    capabilities: ['runtime_observation', 'gateway_status', 'agent_registry_read'],
    taskReadiness: 'partial', auditReadiness: 'ready',
    memoryAccess: 'readonly', knowledgeAccess: 'readonly',
    futurePhase: 'Agent health dashboard, task-agent binding, gated execution'
  },
  {
    id: 'agent.claude-code', name: 'Claude Code', kind: 'agent', integrationKind: 'coding_agent',
    lifecycle: 'registered', permissionLevel: 'L3', status: 'registered — not executing',
    configured: true, online: true, authorized: true, gateOpen: false, stageCEnabled: false,
    dataSource: 'static_registry', risk: 'high',
    safetyNote: 'Authorized != gateOpen. Gate remains CLOSED. Claude Code is a coding agent, not a runtime executor.',
    blockedActions: ['agent execution', 'code push', 'release/tag', 'Gate operations', 'lifecycle mutation'],
    capabilities: ['read_repo', 'draft_patch', 'run_tests', 'code_generation', 'test_generation', 'review'],
    taskReadiness: 'partial', auditReadiness: 'partial',
    memoryAccess: 'readonly', knowledgeAccess: 'readonly',
    futurePhase: 'Task-agent binding, code review integration, permission escalation flow'
  },
  {
    id: 'agent.codex', name: 'Codex', kind: 'agent', integrationKind: 'coding_agent',
    lifecycle: 'registered', permissionLevel: 'L3', status: 'registered — not executing',
    configured: true, online: true, authorized: true, gateOpen: false, stageCEnabled: false,
    dataSource: 'static_registry', risk: 'medium',
    safetyNote: 'Authorized != gateOpen. Gate remains CLOSED. Codex is a coding agent.',
    blockedActions: ['agent execution', 'code push', 'release/tag', 'lifecycle mutation'],
    capabilities: ['code_generation', 'test_generation', 'review'],
    taskReadiness: 'partial', auditReadiness: 'partial',
    memoryAccess: 'readonly', knowledgeAccess: 'readonly',
    futurePhase: 'Code review integration, task-agent binding'
  },
  {
    id: 'agent.reviewer', name: 'Reviewer Agent', kind: 'agent', integrationKind: 'reviewer_agent',
    lifecycle: 'planned', permissionLevel: 'L2', status: 'planned — not yet registered',
    configured: false, online: false, authorized: false, gateOpen: false, stageCEnabled: false,
    dataSource: 'static_registry', risk: 'low',
    safetyNote: 'Reviewer Agent is planned. No operations available.',
    blockedActions: ['all agent operations'],
    capabilities: ['receipt_review', 'safety_check', 'diff_review'],
    taskReadiness: 'not_ready', auditReadiness: 'partial',
    memoryAccess: 'none', knowledgeAccess: 'readonly',
    futurePhase: 'Reviewer agent registration and capability activation'
  },
  {
    id: 'agent.future', name: 'Future Agent', kind: 'agent', integrationKind: 'unknown',
    lifecycle: 'disabled', permissionLevel: 'L0', status: 'disabled — placeholder',
    configured: false, online: false, authorized: false, gateOpen: false, stageCEnabled: false,
    dataSource: 'static_registry', risk: 'low',
    safetyNote: 'Placeholder entry. No operations available.',
    blockedActions: ['all agent operations'],
    capabilities: [],
    taskReadiness: 'not_ready', auditReadiness: 'not_ready',
    memoryAccess: 'none', knowledgeAccess: 'none',
    futurePhase: 'Agent registration and lifecycle UI'
  },
];

// ── Providers Registry ──
// CC Switch-like: provider/config switcher ecosystem reference, not execution engine
export const V8_PROVIDERS: V8ProviderEntry[] = [
  { id: 'provider.claude-anthropic', name: 'Claude / Anthropic', kind: 'provider', providerKind: 'cloud_provider', lifecycle: 'registered', configStatus: 'registered_example', selectionState: 'not_selected', modelProfileExamples: ['claude-opus', 'claude-sonnet'], routingRole: 'high-quality coding and long-context reasoning profile', costVisibility: 'estimated', secretHandling: 'no_secret_display', risk: 'medium', permissionLevel: 'L2', permissionRequired: 'L2', configured: false, online: false, authorized: false, gateOpen: false, stageCEnabled: false, allowedInPreview: true, readonly: true, dataSource: 'static_registry', safetyNote: 'Registered != configured with secrets != selected for execution.', blockedActions: ['provider switching', 'provider config write', 'model calls', 'secret read/print'] },
  { id: 'provider.openai-compatible', name: 'OpenAI-compatible', kind: 'provider', providerKind: 'openai_compatible_provider', lifecycle: 'registered', configStatus: 'registered_example', selectionState: 'not_selected', modelProfileExamples: ['gpt-4o-compatible', 'reasoning-compatible'], routingRole: 'standardized API shape for multi-provider fallback', costVisibility: 'estimated', secretHandling: 'no_secret_display', risk: 'medium', permissionLevel: 'L2', permissionRequired: 'L2', configured: false, online: false, authorized: false, gateOpen: false, stageCEnabled: false, allowedInPreview: true, readonly: true, dataSource: 'example_json', safetyNote: 'OpenAI-compatible profile is reference-only in preview.', blockedActions: ['provider switching', 'provider config write', 'model calls', 'secret read/print'] },
  { id: 'provider.deepseek', name: 'DeepSeek', kind: 'provider', providerKind: 'cloud_provider', lifecycle: 'registered', configStatus: 'registered_example', selectionState: 'not_selected', modelProfileExamples: ['deepseek-v4-pro', 'deepseek-v4-flash'], routingRole: 'cost-aware coding/reasoning fallback profile', costVisibility: 'estimated', secretHandling: 'no_secret_display', risk: 'medium', permissionLevel: 'L2', permissionRequired: 'L2', configured: false, online: false, authorized: false, gateOpen: false, stageCEnabled: false, allowedInPreview: true, readonly: true, dataSource: 'static_registry', safetyNote: 'Configured example does not enable live routing.', blockedActions: ['provider switching', 'provider config write', 'model calls', 'secret read/print'] },
  { id: 'provider.ollama', name: 'Ollama', kind: 'provider', providerKind: 'local_model_server', lifecycle: 'registered', configStatus: 'configured_example', selectionState: 'not_selected', modelProfileExamples: ['gemma4:e4b', 'qwen-local'], routingRole: 'local offline serving profile', costVisibility: 'planned', secretHandling: 'masked_reference_only', risk: 'medium', permissionLevel: 'L1', permissionRequired: 'L1', configured: true, online: false, authorized: false, gateOpen: false, stageCEnabled: false, allowedInPreview: true, readonly: true, dataSource: 'static_registry', safetyNote: 'Configured local server != launched by OpenAIP.', blockedActions: ['local app launch', 'provider switching', 'provider config write', 'model calls'] },
  { id: 'provider.lmstudio', name: 'LM Studio', kind: 'provider', providerKind: 'local_model_server', lifecycle: 'registered', configStatus: 'configured_example', selectionState: 'not_selected', modelProfileExamples: ['lmstudio-local-chat', 'lmstudio-local-code'], routingRole: 'desktop local model host profile', costVisibility: 'planned', secretHandling: 'masked_reference_only', risk: 'medium', permissionLevel: 'L1', permissionRequired: 'L1', configured: true, online: false, authorized: false, gateOpen: false, stageCEnabled: false, allowedInPreview: true, readonly: true, dataSource: 'static_registry', safetyNote: 'Configured local server != launched by OpenAIP.', blockedActions: ['local app launch', 'provider switching', 'provider config write', 'model calls'] },
  { id: 'provider.claude-proxy', name: 'Claude Proxy', kind: 'provider', providerKind: 'provider_proxy', lifecycle: 'registered', configStatus: 'registered_example', selectionState: 'not_selected', modelProfileExamples: ['proxy-claude-sonnet', 'proxy-claude-opus'], routingRole: 'proxy-compatible traffic normalization reference', costVisibility: 'planned', secretHandling: 'masked_reference_only', risk: 'high', permissionLevel: 'L3', permissionRequired: 'L3', configured: false, online: false, authorized: false, gateOpen: false, stageCEnabled: false, allowedInPreview: true, readonly: true, dataSource: 'example_json', safetyNote: 'Proxy concept shown only; no live proxy call in preview.', blockedActions: ['proxy launch', 'provider switching', 'provider config write', 'model calls', 'secret read/print'] },
  { id: 'provider.cc-switch', name: 'CC Switch-like Provider Switcher', kind: 'provider', providerKind: 'config_switcher_reference', lifecycle: 'registered', configStatus: 'registered_example', selectionState: 'not_selected', modelProfileExamples: ['provider preset matrix', 'router preset matrix'], routingRole: 'provider/config/preset/router ecosystem reference', costVisibility: 'planned', secretHandling: 'masked_reference_only', risk: 'high', permissionLevel: 'L3', permissionRequired: 'L3', configured: true, online: false, authorized: false, gateOpen: false, stageCEnabled: false, allowedInPreview: true, readonly: true, dataSource: 'static_registry', safetyNote: 'CC Switch-like switching is dry-run reference only.', blockedActions: ['provider switching', 'cc-switch config write', 'provider config write', 'model calls'] },
  { id: 'provider.future-placeholder', name: 'Future Provider Placeholder', kind: 'provider', providerKind: 'unknown_provider', lifecycle: 'disabled', configStatus: 'disabled_planned', selectionState: 'not_selected', modelProfileExamples: ['planned-profile'], routingRole: 'future adapter placeholder', costVisibility: 'none', secretHandling: 'no_secret_display', risk: 'low', permissionLevel: 'L0', permissionRequired: 'L0', configured: false, online: false, authorized: false, gateOpen: false, stageCEnabled: false, allowedInPreview: false, readonly: true, dataSource: 'future_integration', safetyNote: 'Disabled placeholder. No permissions in preview.', blockedActions: ['all provider operations'] },
];

// ── Integrations Registry ──
// GitHub = code_host / integration
// Memory Hub = memory_provider
// Knowledge Base = knowledge_provider
export const V8_INTEGRATIONS: V8IntegrationEntry[] = [
  { id: 'integration.openclaw-gateway', name: 'OpenClaw Gateway', kind: 'agent_runtime_gateway', lifecycle: 'registered', connectionMode: 'WebSocket local gateway concept', authState: 'registered', actionState: 'blocked', relatedProviderId: 'provider.cc-switch', relatedLocalAppId: null, relatedAgentId: 'agent.openclaw', risk: 'high', permissionLevel: 'L3', permissionRequired: 'L3', configured: true, online: false, authorized: false, gateOpen: false, stageCEnabled: false, allowedInPreview: true, readonly: true, dataSource: 'static_registry', safetyNote: 'OpenClaw online != Gate open. No gateway/browser call in preview.', blockedActions: ['connector actions', 'execution', 'browser control', 'provider calls'] },
  { id: 'integration.github', name: 'GitHub', kind: 'code_host', lifecycle: 'enabled', connectionMode: 'remote git/API concept', authState: 'authorized_readonly', actionState: 'blocked', relatedProviderId: null, relatedLocalAppId: null, relatedAgentId: 'agent.codex', risk: 'high', permissionLevel: 'L2', permissionRequired: 'L2', configured: true, online: true, authorized: true, gateOpen: false, stageCEnabled: false, allowedInPreview: true, readonly: true, dataSource: 'static_registry', safetyNote: 'Connected/authorized does not allow push/release/workflow dispatch in preview.', blockedActions: ['connector actions', 'push', 'release/tag', 'workflow dispatch', 'external API calls'] },
  { id: 'integration.huggingface', name: 'Hugging Face', kind: 'model_registry', lifecycle: 'registered', connectionMode: 'external service concept', authState: 'registered', actionState: 'blocked', relatedProviderId: 'provider.openai-compatible', relatedLocalAppId: null, relatedAgentId: null, risk: 'medium', permissionLevel: 'L2', permissionRequired: 'L2', configured: false, online: false, authorized: false, gateOpen: false, stageCEnabled: false, allowedInPreview: true, readonly: true, dataSource: 'example_json', safetyNote: 'Registry/data source reference only; no API/download calls in preview.', blockedActions: ['connector actions', 'external API calls', 'downloads', 'provider calls'] },
  { id: 'integration.webhook-external', name: 'Webhook / External API', kind: 'webhook', lifecycle: 'registered', connectionMode: 'HTTP outbound concept', authState: 'none', actionState: 'blocked', relatedProviderId: null, relatedLocalAppId: null, relatedAgentId: null, risk: 'high', permissionLevel: 'L3', permissionRequired: 'L3', configured: false, online: false, authorized: false, gateOpen: false, stageCEnabled: false, allowedInPreview: true, readonly: true, dataSource: 'static_registry', safetyNote: 'No webhook/API calls in preview.', blockedActions: ['connector actions', 'send webhook', 'external API calls', 'config writes'] },
  { id: 'integration.claude-proxy-bridge', name: 'Claude Proxy Bridge', kind: 'provider_proxy', lifecycle: 'registered', connectionMode: 'local proxy bridge concept', authState: 'registered', actionState: 'blocked', relatedProviderId: 'provider.claude-proxy', relatedLocalAppId: null, relatedAgentId: null, risk: 'high', permissionLevel: 'L3', permissionRequired: 'L3', configured: false, online: false, authorized: false, gateOpen: false, stageCEnabled: false, allowedInPreview: true, readonly: true, dataSource: 'example_json', safetyNote: 'Proxy bridge is reference-only; no secret read and no routing mutation.', blockedActions: ['connector actions', 'proxy launch', 'provider calls', 'config writes'] },
  { id: 'integration.cc-switch-bridge', name: 'CC Switch-like Config Bridge', kind: 'provider_config_switcher_reference', lifecycle: 'registered', connectionMode: 'config ecosystem reference', authState: 'registered', actionState: 'blocked', relatedProviderId: 'provider.cc-switch', relatedLocalAppId: null, relatedAgentId: null, risk: 'high', permissionLevel: 'L3', permissionRequired: 'L3', configured: true, online: false, authorized: false, gateOpen: false, stageCEnabled: false, allowedInPreview: true, readonly: true, dataSource: 'static_registry', safetyNote: 'Bridge exists != switching allowed. No config mutation in preview.', blockedActions: ['connector actions', 'switch provider', 'config writes', 'provider calls'] },
  { id: 'integration.memoryhub-bridge', name: 'Memory Hub Bridge', kind: 'memory_provider_bridge', lifecycle: 'registered', connectionMode: 'local memory/report registry concept', authState: 'connected_readonly', actionState: 'readonly_only', relatedProviderId: null, relatedLocalAppId: null, relatedAgentId: 'agent.openclaw', risk: 'high', permissionLevel: 'L2', permissionRequired: 'L2', configured: true, online: false, authorized: false, gateOpen: false, stageCEnabled: false, allowedInPreview: true, readonly: true, dataSource: 'static_registry', safetyNote: 'Readonly bridge only. Memory writes remain blocked.', blockedActions: ['memory writes', 'connector actions', 'config writes'] },
  { id: 'integration.future-placeholder', name: 'Future Integration Placeholder', kind: 'unknown_integration', lifecycle: 'disabled', connectionMode: 'planned', authState: 'none', actionState: 'blocked', relatedProviderId: null, relatedLocalAppId: null, relatedAgentId: null, risk: 'low', permissionLevel: 'L0', permissionRequired: 'L0', configured: false, online: false, authorized: false, gateOpen: false, stageCEnabled: false, allowedInPreview: false, readonly: true, dataSource: 'future_integration', safetyNote: 'Disabled placeholder, no permissions.', blockedActions: ['all integration operations'] },
];

// ── Local Apps Registry ──
// OpenAxiom: local_app / UI Lab / Vision Tool, not primary provider
// ComfyUI: local_app / workflow_engine
// YOLO/SAM: local tools / vision pipeline
export const V8_LOCAL_APPS: V8LocalAppEntry[] = [
  { id: 'app.openaxiom', name: 'OpenAxiom', kind: 'local_app', subtype: 'ui_lab_vision_tool', lifecycle: 'registered', permissionLevel: 'L1', configured: true, online: false, authorized: false, gateOpen: false, stageCEnabled: false, dataSource: 'static_registry', safetyNote: 'OpenAxiom is a local_app / UI Lab / Vision Tool, not a primary model provider.', blockedActions: ['app launch', 'app stop/restart', 'app configuration write', 'model execution'] },
  { id: 'app.comfyui', name: 'ComfyUI', kind: 'workflow_engine', lifecycle: 'registered', permissionLevel: 'L1', configured: true, online: false, authorized: false, gateOpen: false, stageCEnabled: false, dataSource: 'static_registry', safetyNote: 'ComfyUI is a local_app / workflow_engine.', blockedActions: ['app launch', 'workflow execution'], futurePhase: 'App launch/stop controls (gated)' },
  { id: 'app.ollama', name: 'Ollama (Local LLM)', kind: 'local_app', lifecycle: 'registered', permissionLevel: 'L1', configured: true, online: false, authorized: false, gateOpen: false, stageCEnabled: false, dataSource: 'static_registry', safetyNote: 'Local LLM, not a primary provider for routing.', blockedActions: ['app launch', 'model execution'], futurePhase: 'App launch/stop controls (gated)' },
  { id: 'app.lmstudio', name: 'LM Studio (Local LLM)', kind: 'local_app', lifecycle: 'registered', permissionLevel: 'L1', configured: true, online: false, authorized: false, gateOpen: false, stageCEnabled: false, dataSource: 'static_registry', safetyNote: 'Local LLM, registered but not currently online.', blockedActions: ['app launch', 'model execution'], futurePhase: 'Local app registry management' },
  { id: 'app.yolo', name: 'YOLO / SAM Vision Tools', kind: 'local_app', subtype: 'vision_tool', lifecycle: 'registered', permissionLevel: 'L1', configured: false, online: false, authorized: false, gateOpen: false, stageCEnabled: false, dataSource: 'static_registry', safetyNote: 'Local tools / vision pipeline. Not configured.', blockedActions: ['app launch', 'vision processing execution'], futurePhase: 'Local app registry management' },
  { id: 'app.python-workers', name: 'Python Workers', kind: 'local_app', lifecycle: 'disabled', permissionLevel: 'L0', configured: false, online: false, authorized: false, gateOpen: false, stageCEnabled: false, dataSource: 'static_registry', safetyNote: 'Placeholder. Disabled in this preview.', blockedActions: ['all local app operations'], futurePhase: 'Custom work process management' },
];

// ── Capabilities Registry ──
export const V8_CAPABILITIES: V8CapabilityEntry[] = [
  {
    id: 'cap.read.repo', name: 'Read Repository', category: 'read', kind: 'read_repo',
    risk: 'low', permissionLevel: 'L1', defaultPolicy: 'allowed for readonly agents',
    approvalRequired: false, gateRequired: false, stageCRequired: false, auditRequired: false,
    allowedInPreview: true, blockedReason: undefined,
    examples: ['git diff', 'git log', 'read file content'],
    relatedCenters: ['Agent Center'],
    dataSource: 'static_registry', safetyNote: 'Readonly repo access — no file writes.',
  },
  {
    id: 'cap.draft.patch', name: 'Draft Patch', category: 'write', kind: 'draft_patch',
    risk: 'medium', permissionLevel: 'L3', defaultPolicy: 'draft only, no apply',
    approvalRequired: false, gateRequired: false, stageCRequired: false, auditRequired: true,
    allowedInPreview: true, blockedReason: undefined,
    examples: ['draft code changes', 'create patch file'],
    relatedCenters: ['Agent Center', 'Task Center'],
    dataSource: 'static_registry', safetyNote: 'Draft only — applying patches requires approval.',
  },
  {
    id: 'cap.edit.files', name: 'Edit Files', category: 'write', kind: 'edit_files',
    risk: 'high', permissionLevel: 'L4', defaultPolicy: 'approval required',
    approvalRequired: true, gateRequired: false, stageCRequired: false, auditRequired: true,
    allowedInPreview: false, blockedReason: 'Requires L4 permission and human approval',
    examples: ['modify source files', 'apply patch'],
    relatedCenters: ['Agent Center', 'Execution Gateway'],
    dataSource: 'static_registry', safetyNote: 'File edits require human approval. Not allowed in preview.',
  },
  {
    id: 'cap.run.tests', name: 'Run Tests', category: 'execute', kind: 'run_tests',
    risk: 'medium', permissionLevel: 'L2', defaultPolicy: 'approval or safe context required',
    approvalRequired: true, gateRequired: false, stageCRequired: false, auditRequired: true,
    allowedInPreview: false, blockedReason: 'Requires approval in this preview',
    examples: ['npm test', 'node --test', 'pytest'],
    relatedCenters: ['Task Center'],
    dataSource: 'static_registry', safetyNote: 'Running tests requires approval in preview.',
  },
  {
    id: 'cap.model.call', name: 'Call Model', category: 'execute', kind: 'call_model',
    risk: 'medium', permissionLevel: 'L2', defaultPolicy: 'provider policy required',
    approvalRequired: false, gateRequired: false, stageCRequired: false, auditRequired: true,
    allowedInPreview: false, blockedReason: 'Model calls blocked in preview — no provider routing enabled',
    examples: ['LLM inference', 'API call to model provider'],
    relatedCenters: ['Provider Manager'],
    dataSource: 'static_registry', safetyNote: 'Model calls require provider policy in preview.',
  },
  {
    id: 'cap.memory.write', name: 'Write Memory', category: 'write', kind: 'memory_write',
    risk: 'high', permissionLevel: 'L3', defaultPolicy: 'scoped_write_draft only',
    approvalRequired: true, gateRequired: true, stageCRequired: true, auditRequired: true,
    allowedInPreview: false, blockedReason: 'Memory write requires Gate open + Stage C enabled',
    examples: ['store agent memory', 'write knowledge entry'],
    relatedCenters: ['Memory + Knowledge Center', 'Execution Gateway'],
    dataSource: 'static_registry', safetyNote: 'Memory write requires Gate open + Stage C enabled.',
  },
  {
    id: 'cap.launch.local-app', name: 'Launch Local App', category: 'launch', kind: 'launch_local_app',
    risk: 'high', permissionLevel: 'L4', defaultPolicy: 'blocked in preview',
    approvalRequired: true, gateRequired: false, stageCRequired: false, auditRequired: true,
    allowedInPreview: false, blockedReason: 'Local app launch blocked in preview — requires human approval',
    examples: ['start OpenAxiom', 'start ComfyUI', 'start Ollama'],
    relatedCenters: ['Local Apps Center'],
    dataSource: 'static_registry', safetyNote: 'Launching local apps requires human approval in preview.',
  },
  {
    id: 'cap.execute.command', name: 'Execute Command', category: 'execute', kind: 'execute_command',
    risk: 'critical', permissionLevel: 'L5', defaultPolicy: 'blocked',
    approvalRequired: true, gateRequired: true, stageCRequired: true, auditRequired: true,
    allowedInPreview: false, blockedReason: 'Command execution requires Gate open + Stage C enabled + human authorization',
    examples: ['shell command', 'process execution'],
    relatedCenters: ['Execution Gateway', 'Command Center'],
    dataSource: 'static_registry', safetyNote: 'Command execution requires Gate open + Stage C enabled.',
  },
  {
    id: 'cap.release.tag', name: 'Create Release/Tag', category: 'release', kind: 'release_tag',
    risk: 'critical', permissionLevel: 'L5', defaultPolicy: 'blocked',
    approvalRequired: true, gateRequired: false, stageCRequired: false, auditRequired: true,
    allowedInPreview: false, blockedReason: 'Release/tag creation blocked in preview — requires human authorization',
    examples: ['git tag v1.0', 'npm version patch', 'create release'],
    relatedCenters: ['Command Center'],
    dataSource: 'static_registry', safetyNote: 'Release/tag creation blocked in preview.',
  },
  {
    id: 'cap.gate.open', name: 'Open Gate', category: 'gate', kind: 'open_gate',
    risk: 'critical', permissionLevel: 'L5', defaultPolicy: 'blocked — human authorization required',
    approvalRequired: true, gateRequired: false, stageCRequired: false, auditRequired: true,
    allowedInPreview: false, blockedReason: 'Gate opening blocked in preview — requires human authorization + audit',
    examples: ['enable Gate', 'open master switch'],
    relatedCenters: ['Execution Gateway'],
    dataSource: 'static_registry', safetyNote: 'Gate opening blocked in preview. Requires human authorization form.',
  },
  {
    id: 'cap.connector.action', name: 'Connector Action', category: 'execute', kind: 'connector_action',
    risk: 'high', permissionLevel: 'L4', defaultPolicy: 'blocked — integration policy + Gate required',
    approvalRequired: true, gateRequired: true, stageCRequired: false, auditRequired: true,
    allowedInPreview: false, blockedReason: 'Connector action requires integration policy + Gate + audit',
    examples: ['call external API', 'webhook execution', 'service integration action'],
    relatedCenters: ['Integration Center', 'Execution Gateway'],
    dataSource: 'static_registry', safetyNote: 'Connector action blocked in preview. No external call.',
  },
  {
    id: 'cap.enable.stage-c', name: 'Enable Stage C', category: 'gate', kind: 'enable_stage_c',
    risk: 'critical', permissionLevel: 'L5', defaultPolicy: 'blocked — separate authorization required',
    approvalRequired: true, gateRequired: false, stageCRequired: false, auditRequired: true,
    allowedInPreview: false, blockedReason: 'Stage C enablement blocked in preview — requires separate authorization process + audit',
    examples: ['enable Stage C capability', 'activate advanced execution'],
    relatedCenters: ['Execution Gateway'],
    dataSource: 'static_registry', safetyNote: 'Stage C enablement blocked in preview. Requires separate authorization.',
  },
];

// ── Policies Registry ──
export const V8_POLICIES: V8PolicyEntry[] = [
  {
    id: 'policy.readonly-observer', name: 'Read-only Observer Policy', permissionLevel: 'L1', scope: 'all readonly agents',
    allowedCapabilities: ['cap.read.repo', 'cap.agent.list', 'cap.memory.read', 'cap.connector.route', 'cap.runtime.status'],
    blockedCapabilities: ['cap.draft.patch', 'cap.edit.files', 'cap.run.tests', 'cap.model.call', 'cap.memory.write', 'cap.launch.local-app', 'cap.execute.command', 'cap.release.tag', 'cap.gate.open', 'cap.runtime.execute', 'cap.agent.configure', 'cap.connector.execute'],
    approvalRequired: false, gateRequired: false, stageCRequired: false, auditRequired: false,
    defaultState: 'active', appliesTo: ['L1 agents', 'readonly reviewers'], enforcementPhase: 'runtime',
    gateOpen: false, stageCEnabled: false, rule: 'readonly observer — no write/execute/launch',
    dataSource: 'static_registry', safetyNote: 'Readonly Observer Policy — blocks all write/execute/launch.',
  },
  {
    id: 'policy.suggest-planner', name: 'Suggest-only Planner Policy', permissionLevel: 'L2', scope: 'planning agents',
    allowedCapabilities: ['cap.read.repo', 'cap.agent.list', 'cap.memory.read', 'cap.connector.route', 'cap.draft.patch'],
    blockedCapabilities: ['cap.edit.files', 'cap.run.tests', 'cap.model.call', 'cap.memory.write', 'cap.launch.local-app', 'cap.execute.command', 'cap.release.tag', 'cap.gate.open', 'cap.runtime.execute', 'cap.agent.configure', 'cap.connector.execute'],
    approvalRequired: false, gateRequired: false, stageCRequired: false, auditRequired: false,
    defaultState: 'active', appliesTo: ['L2 agents', 'planner agents'], enforcementPhase: 'runtime',
    gateOpen: false, stageCEnabled: false, rule: 'suggest/plan only — no direct modification',
    dataSource: 'static_registry', safetyNote: 'Suggest-only Planner Policy — blocks applying changes.',
  },
  {
    id: 'policy.draft-worker', name: 'Draft Worker Policy', permissionLevel: 'L3', scope: 'coding agents (draft)',
    allowedCapabilities: ['cap.read.repo', 'cap.agent.list', 'cap.memory.read', 'cap.connector.route', 'cap.draft.patch', 'cap.model.call'],
    blockedCapabilities: ['cap.edit.files', 'cap.run.tests', 'cap.memory.write', 'cap.launch.local-app', 'cap.execute.command', 'cap.release.tag', 'cap.gate.open', 'cap.runtime.execute', 'cap.agent.configure', 'cap.connector.execute'],
    approvalRequired: false, gateRequired: false, stageCRequired: false, auditRequired: true,
    defaultState: 'active', appliesTo: ['L3 agents', 'Claude Code', 'Codex'], enforcementPhase: 'runtime',
    gateOpen: false, stageCEnabled: false, rule: 'draft patch/task pack — blocks high-risk changes without review',
    dataSource: 'static_registry', safetyNote: 'Draft Worker Policy — blocking high-risk changes without review.',
  },
  {
    id: 'policy.apply-approval', name: 'Apply with Approval Policy', permissionLevel: 'L4', scope: 'approved agents',
    allowedCapabilities: ['cap.read.repo', 'cap.agent.list', 'cap.memory.read', 'cap.connector.route', 'cap.draft.patch', 'cap.edit.files', 'cap.run.tests', 'cap.model.call'],
    blockedCapabilities: ['cap.memory.write', 'cap.launch.local-app', 'cap.execute.command', 'cap.release.tag', 'cap.gate.open', 'cap.runtime.execute', 'cap.agent.configure', 'cap.connector.execute'],
    approvalRequired: true, gateRequired: false, stageCRequired: false, auditRequired: true,
    defaultState: 'active (dormant — no L4 agents registered)', appliesTo: ['L4 agents', 'human-approved execution'], enforcementPhase: 'runtime',
    gateOpen: false, stageCEnabled: false, rule: 'safe apply after human review — blocks Gate/Stage C/release unless separately authorized',
    dataSource: 'static_registry', safetyNote: 'Apply with Approval Policy — Gate/Stage C/release still blocked.',
  },
  {
    id: 'policy.gated-execution', name: 'Gated Execution Policy', permissionLevel: 'L5', scope: 'future high-risk execution',
    allowedCapabilities: ['cap.read.repo', 'cap.agent.list', 'cap.memory.read', 'cap.connector.route', 'cap.draft.patch', 'cap.edit.files', 'cap.run.tests', 'cap.model.call', 'cap.execute.command'],
    blockedCapabilities: ['cap.memory.write', 'cap.launch.local-app', 'cap.release.tag', 'cap.gate.open', 'cap.runtime.execute', 'cap.agent.configure', 'cap.connector.execute'],
    approvalRequired: true, gateRequired: true, stageCRequired: true, auditRequired: true,
    defaultState: 'blocked in current preview', appliesTo: ['L5 agents', 'future runtime'], enforcementPhase: 'gate',
    gateOpen: false, stageCEnabled: false, rule: 'requires Gate + human approval + audit receipt — blocked in preview',
    dataSource: 'static_registry', safetyNote: 'Gated Execution Policy — blocked in current preview.',
  },
  {
    id: 'policy.memory-draft', name: 'Memory Write Draft Policy', permissionLevel: 'L3', scope: 'memory agents',
    allowedCapabilities: ['cap.memory.read'],
    blockedCapabilities: ['cap.memory.write', 'cap.draft.patch', 'cap.edit.files', 'cap.run.tests', 'cap.model.call', 'cap.launch.local-app', 'cap.execute.command', 'cap.release.tag', 'cap.gate.open', 'cap.read.repo', 'cap.agent.list', 'cap.connector.route', 'cap.runtime.execute', 'cap.agent.configure', 'cap.connector.execute'],
    approvalRequired: true, gateRequired: true, stageCRequired: true, auditRequired: true,
    defaultState: 'active (scoped_write_draft only)', appliesTo: ['memory agents', 'knowledge workers'], enforcementPhase: 'runtime',
    gateOpen: false, stageCEnabled: false, rule: 'scoped_write_draft only — blocks direct full memory write',
    dataSource: 'static_registry', safetyNote: 'Memory Write Draft Policy — blocking full memory writes.',
  },
  {
    id: 'policy.release-boundary', name: 'Release Boundary Policy', permissionLevel: 'L0', scope: 'all agents',
    allowedCapabilities: [],
    blockedCapabilities: ['cap.release.tag', 'cap.gate.open', 'cap.execute.command', 'cap.runtime.execute', 'cap.agent.configure', 'cap.connector.execute'],
    approvalRequired: true, gateRequired: false, stageCRequired: false, auditRequired: true,
    defaultState: 'active', appliesTo: ['all agents', 'all users'], enforcementPhase: 'runtime',
    gateOpen: false, stageCEnabled: false, rule: 'blocks tag/release/restore unless explicit authorization',
    dataSource: 'static_registry', safetyNote: 'Release Boundary Policy — all releases blocked in preview.',
  },
];

// ── Tasks Registry ──
// Task Center: human-fatigue reducer — task packs, receipts, review queue
export const V8_TASKS: V8TaskEntry[] = [
  {
    id: 'task.architecture-planning', title: 'Architecture / Product Planning Task',
    intent: 'plan/blueprint', phase: 'P1', lifecycle: 'draft', risk: 'low',
    recommendedAgent: 'Planner / Reviewer Agent', permissionRequired: 'L2',
    allowedActions: ['readonly review', 'suggestion draft'],
    requiredEvidence: ['plan document', 'risk assessment', 'safety review'],
    reviewState: 'pending_review', receiptRequired: true, auditRequired: false,
    humanAuthorizationRequired: false,
    dataSource: 'static_registry',
    safetyNote: 'Planning task — no code changes, no execution. Readonly/suggest only.',
    blockedActions: ['code changes', 'execution', 'release', 'config mutation'],
    futurePhase: 'Task pack generation from center state'
  },
  {
    id: 'task.cli-readonly-improvement', title: 'CLI Readonly Improvement Task',
    intent: 'CLI readonly polish', phase: 'P2', lifecycle: 'draft', risk: 'medium',
    recommendedAgent: 'Claude Code / Codex', permissionRequired: 'L3',
    allowedActions: ['draft code changes (safe readonly)', 'test addition', 'doc update'],
    requiredEvidence: ['test results', 'diff review', 'safety grep result'],
    reviewState: 'needs_evidence', receiptRequired: true, auditRequired: true,
    humanAuthorizationRequired: false,
    dataSource: 'static_registry',
    safetyNote: 'CLI readonly improvement — no DB writes, no Gate, no Stage C.',
    blockedActions: ['release', 'DB write', 'Gate operations', 'Stage C enablement'],
    futurePhase: 'Task-agent binding, automated evidence gathering'
  },
  {
    id: 'task.ui-readonly-preview', title: 'UI Readonly Preview Task',
    intent: 'hidden readonly UI page', phase: 'P2', lifecycle: 'draft', risk: 'medium',
    recommendedAgent: 'Claude Code / Codex + Reviewer Agent', permissionRequired: 'L3',
    allowedActions: ['draft UI code (hidden readonly)', 'test addition', 'visual QA'],
    requiredEvidence: ['before/after screenshots', 'route inventory', 'sidebar check', 'safety grep'],
    reviewState: 'pending_review', receiptRequired: true, auditRequired: true,
    humanAuthorizationRequired: true,
    dataSource: 'static_registry',
    safetyNote: 'UI readonly preview — no execution buttons, no sidebar exposure without approval.',
    blockedActions: ['execution buttons', 'sidebar exposure unless approved', 'config write', 'DB change'],
    futurePhase: 'UI component library, reusable preview patterns'
  },
  {
    id: 'task.receipt-review', title: 'Receipt Review Task',
    intent: 'verify receipt evidence', phase: 'P3', lifecycle: 'pending_review', risk: 'low',
    recommendedAgent: 'Reviewer Agent', permissionRequired: 'L2',
    allowedActions: ['readonly review', 'evidence validation', 'status suggest'],
    requiredEvidence: ['receipt document', 'evidence chain', 'commit verification'],
    reviewState: 'pending_review', receiptRequired: true, auditRequired: true,
    humanAuthorizationRequired: false,
    dataSource: 'static_registry',
    safetyNote: 'Receipt review — no code changes, no execution. Human review required for acceptance.',
    blockedActions: ['code changes', 'execution', 'auto-acceptance'],
    futurePhase: 'Automated evidence validation pipeline'
  },
  {
    id: 'task.high-risk-execution', title: 'High-Risk Execution Task Placeholder',
    intent: 'future gated execution', phase: 'P5', lifecycle: 'blocked', risk: 'critical',
    recommendedAgent: 'none until policy', permissionRequired: 'L5',
    allowedActions: [],
    requiredEvidence: ['human authorization form', 'Gate open confirmation', 'Stage C enablement record', 'audit trail'],
    reviewState: 'blocked', receiptRequired: true, auditRequired: true,
    humanAuthorizationRequired: true,
    dataSource: 'static_registry',
    safetyNote: 'High-risk execution — blocked in preview. Requires Gate open + Stage C enabled + human authorization.',
    blockedActions: ['all execution', 'Gate opening in preview', 'Stage C enablement in preview', 'config mutation'],
    futurePhase: 'Gated execution with human approval workflow'
  },
];

// ── Audit Registry ──
// Each entry represents a sealed receipt archetype with full evidence fields.
// All entries are readonly. No audit DB writes in this preview.
export const V8_AUDITS: V8AuditEntry[] = [
  {
    id: 'audit.cli-identity-foundation',
    title: 'CLI Identity Foundation Receipt',
    taskType: 'CLI identity',
    relatedCenter: 'Command Center',
    relatedAgentId: 'agent.claude-code',
    phase: 'P1',
    verdict: 'passed',
    commitHash: '9842495',
    pushed: true,
    workingTreeClean: true,
    filesChangedSummary: '23 files modified, 1 created — registry data, CLI v8 commands, page files',
    verificationStatus: 'passed',
    verificationCommands: ['tsc --noEmit', 'npm test', 'npm run build', 'git diff --check'],
    safetyStatus: 'passed',
    safetyFindings: ['No Gate/Stage C enabled', 'No DB writes', 'No runtime mutation'],
    runtimeChanged: false,
    servicesRestarted: false,
    dbWritten: false,
    gateOpened: false,
    stageCEnabled: false,
    releaseTagCreated: false,
    authGateChanged: false,
    connectorActionExecuted: false,
    humanAuthorizationNeeded: false,
    acceptanceState: 'accepted',
    evidenceLevel: 'seal_grade',
    dataSource: 'static_registry',
    safetyNote: 'CLI identity foundation — commit pushed, working tree clean, all verifications passed.',
    timestamp: '2026-05-22T00:00:00Z',
  },
  {
    id: 'audit.agent-center-mvp',
    title: 'Agent Center MVP Receipt',
    taskType: 'UI readonly MVP',
    relatedCenter: 'Agent Center',
    relatedAgentId: 'agent.claude-code',
    phase: 'P2',
    verdict: 'passed',
    commitHash: '1d8b92d',
    pushed: true,
    workingTreeClean: true,
    filesChangedSummary: '5 agents in registry, standalone MVP page, CLI agents command, 14 tests added',
    verificationStatus: 'passed',
    verificationCommands: ['tsc --noEmit', 'npm test (43/43)', 'npm run build', 'git diff --check', 'safety grep'],
    safetyStatus: 'passed',
    safetyFindings: ['No Gate/Stage C enabled', 'No execution buttons', 'Sidebar not exposed'],
    runtimeChanged: false,
    servicesRestarted: false,
    dbWritten: false,
    gateOpened: false,
    stageCEnabled: false,
    releaseTagCreated: false,
    authGateChanged: false,
    connectorActionExecuted: false,
    humanAuthorizationNeeded: false,
    acceptanceState: 'accepted',
    evidenceLevel: 'seal_grade',
    dataSource: 'static_registry',
    safetyNote: 'Agent Center MVP — commit pushed, working tree clean, all verifications passed.',
    timestamp: '2026-05-22T06:00:00Z',
  },
  {
    id: 'audit.task-center-mvp',
    title: 'Task Center MVP Receipt',
    taskType: 'UI readonly MVP + task/receipt scaffolding',
    relatedCenter: 'Task Center',
    relatedAgentId: 'agent.claude-code',
    phase: 'P3',
    verdict: 'passed',
    commitHash: '2f2baa8',
    pushed: true,
    workingTreeClean: true,
    filesChangedSummary: '5 task archetypes, standalone MVP page, CLI task command, 15 tests added, V8TaskLifecycle type',
    verificationStatus: 'passed',
    verificationCommands: ['tsc --noEmit', 'npm test (43/43)', 'npm run build', 'git diff --check', 'safety grep'],
    safetyStatus: 'passed',
    safetyFindings: ['No Gate/Stage C enabled', 'No task execution', 'No agent dispatch', 'Sidebar not exposed'],
    runtimeChanged: false,
    servicesRestarted: false,
    dbWritten: false,
    gateOpened: false,
    stageCEnabled: false,
    releaseTagCreated: false,
    authGateChanged: false,
    connectorActionExecuted: false,
    humanAuthorizationNeeded: false,
    acceptanceState: 'accepted',
    evidenceLevel: 'seal_grade',
    dataSource: 'static_registry',
    safetyNote: 'Task Center MVP — commit pushed, working tree clean, all verifications passed.',
    timestamp: '2026-05-23T00:00:00Z',
  },
  {
    id: 'audit.incomplete-receipt-example',
    title: 'Incomplete Receipt Example',
    taskType: 'unknown',
    relatedCenter: 'Task Center',
    verdict: 'needs_evidence',
    commitHash: 'unknown',
    pushed: false,
    workingTreeClean: false,
    filesChangedSummary: 'No file change record provided',
    verificationStatus: 'unknown',
    verificationCommands: [],
    safetyStatus: 'unknown',
    safetyFindings: [],
    runtimeChanged: false,
    servicesRestarted: false,
    dbWritten: false,
    gateOpened: false,
    stageCEnabled: false,
    releaseTagCreated: false,
    authGateChanged: false,
    connectorActionExecuted: false,
    humanAuthorizationNeeded: false,
    acceptanceState: 'needs_evidence',
    evidenceLevel: 'none',
    dataSource: 'example_json',
    safetyNote: 'Incomplete receipt — missing commit hash, no verification results, no safety summary. "All done" without evidence is rejected.',
    phase: 'P0',
    timestamp: '2026-05-20T00:00:00Z',
  },
  {
    id: 'audit.high-risk-deferred',
    title: 'High-Risk Execution Deferred',
    taskType: 'execution/gate/auth/db',
    relatedCenter: 'Execution Gateway',
    relatedTaskId: 'task.high-risk-execution',
    phase: 'P5',
    verdict: 'blocked',
    commitHash: 'none',
    pushed: false,
    workingTreeClean: true,
    filesChangedSummary: 'Plan-only — no code changes',
    verificationStatus: 'not_applicable',
    verificationCommands: [],
    safetyStatus: 'blocked',
    safetyFindings: ['Requires Gate open', 'Requires Stage C enabled', 'Requires human authorization form'],
    runtimeChanged: false,
    servicesRestarted: false,
    dbWritten: false,
    gateOpened: false,
    stageCEnabled: false,
    releaseTagCreated: false,
    authGateChanged: false,
    connectorActionExecuted: false,
    humanAuthorizationNeeded: true,
    acceptanceState: 'blocked',
    evidenceLevel: 'none',
    dataSource: 'static_registry',
    safetyNote: 'High-risk execution deferred — blocked in preview. Requires Gate open + Stage C enabled + human authorization.',
    timestamp: '2026-05-23T12:00:00Z',
  },
];

// ── Memory + Knowledge Registry ──
export const V8_MEMORY_KNOWLEDGE: V8MemoryKnowledgeEntry[] = [
  { id: 'mem.knowledge.docs', source: 'docs', accessMode: 'readonly', lifecycle: 'enabled', permissionLevel: 'L1', dataSource: 'static_registry', safetyNote: 'Readonly access — no content extraction.' },
  { id: 'mem.knowledge.reports', source: 'reports', accessMode: 'readonly', lifecycle: 'enabled', permissionLevel: 'L1', dataSource: 'static_registry', safetyNote: 'Readonly access — no content extraction.' },
  { id: 'mem.knowledge.receipts', source: 'receipts', accessMode: 'readonly', lifecycle: 'enabled', permissionLevel: 'L1', dataSource: 'static_registry', safetyNote: 'Readonly access — no receipt mutation.' },
  { id: 'mem.knowledge.repo', source: 'repo', accessMode: 'readonly', lifecycle: 'enabled', permissionLevel: 'L1', dataSource: 'static_registry', safetyNote: 'Readonly access — no repo writes.' },
  { id: 'mem.knowledge.datasets', source: 'datasets', accessMode: 'readonly', lifecycle: 'registered', permissionLevel: 'L1', dataSource: 'static_registry', safetyNote: 'Registered but not yet indexed.' },
  { id: 'mem.knowledge.local-files', source: 'local files', accessMode: 'readonly', lifecycle: 'registered', permissionLevel: 'L1', dataSource: 'static_registry', safetyNote: 'Registered but not yet indexed.' },
  { id: 'mem.access.readonly', source: 'memory-access', accessMode: 'readonly', lifecycle: 'enabled', permissionLevel: 'L1', dataSource: 'static_registry', safetyNote: 'Readonly mode is the default safe mode. Memory write blocked.' },
  { id: 'mem.access.scoped-write', source: 'memory-access', accessMode: 'scoped_write_draft', lifecycle: 'disabled', permissionLevel: 'L2', dataSource: 'static_registry', safetyNote: 'Scoped write mode defined but DISABLED in this preview.', blockedActions: ['memory write', 'knowledge source mutation', 'content extraction', 'policy changes'] },
];


export const V8_INTEGRATION_PROVIDER_HANDSHAKE_MATRIX: V8IntegrationProviderHandshakeRow[] = [
  { id: 'handshake.openclaw-provider-manager', integrationId: 'integration.openclaw-gateway', providerOrCenter: 'Provider Manager', relationship: 'runtime gateway may route through provider profiles in future', currentPreviewState: 'no live routing', blockedActions: ['execution', 'browser control', 'provider calls'], risk: 'high', requiredPolicy: 'policy.gated-execution', auditRequired: true, gateRequired: true, dataSource: 'static_registry', readonly: true },
  { id: 'handshake.claude-proxy-claude', integrationId: 'integration.claude-proxy-bridge', providerOrCenter: 'Claude / Anthropic', relationship: 'proxy-provider bridge for profile compatibility', currentPreviewState: 'static reference only', blockedActions: ['API calls', 'config writes', 'secret reads'], risk: 'high', requiredPolicy: 'policy.apply-approval', auditRequired: true, gateRequired: false, dataSource: 'example_json', readonly: true },
  { id: 'handshake.ccswitch-profiles', integrationId: 'integration.cc-switch-bridge', providerOrCenter: 'Provider Profiles', relationship: 'config switcher reference across provider presets', currentPreviewState: 'dry-run concept', blockedActions: ['provider switching', 'config mutation'], risk: 'high', requiredPolicy: 'policy.apply-approval', auditRequired: true, gateRequired: false, dataSource: 'static_registry', readonly: true },
  { id: 'handshake.hf-provider-knowledge', integrationId: 'integration.huggingface', providerOrCenter: 'Provider/Knowledge/Data', relationship: 'model registry and dataset source linkage', currentPreviewState: 'static reference only', blockedActions: ['downloads', 'API calls'], risk: 'medium', requiredPolicy: 'policy.readonly-observer', auditRequired: true, gateRequired: false, dataSource: 'example_json', readonly: true },
  { id: 'handshake.github-codehost-audit', integrationId: 'integration.github', providerOrCenter: 'Code Host / Task / Audit', relationship: 'code host evidence and future workflow integration', currentPreviewState: 'local git evidence only', blockedActions: ['release/tag', 'workflow dispatch', 'API calls'], risk: 'high', requiredPolicy: 'policy.release-boundary', auditRequired: true, gateRequired: false, dataSource: 'static_registry', readonly: true },
  { id: 'handshake.memoryhub-memorycenter', integrationId: 'integration.memoryhub-bridge', providerOrCenter: 'Memory + Knowledge Center', relationship: 'memory provider bridge with readonly report indexing', currentPreviewState: 'readonly bridge concept', blockedActions: ['memory writes', 'connector actions'], risk: 'high', requiredPolicy: 'policy.memory-draft', auditRequired: true, gateRequired: true, dataSource: 'static_registry', readonly: true },
];

// ── Connector → v8 Migration Registry ──
export const V8_CONNECTOR_MIGRATIONS: V8ConnectorMigrationEntry[] = [
  { id: 'migration.openaxiom', legacyConnectorId: 'openaxiom', legacyConnectorName: 'OpenAxiom', v8Center: 'Local Apps Center', v8Mapping: 'app.openaxiom', migrationStatus: 'migrated', notes: 'Legacy connector page exists as OpenAxiomReadonly; v8 Local Apps Center entry registered. OpenAxiom classified as local_app / UI Lab / Vision Tool.' },
  { id: 'migration.memoryhub', legacyConnectorId: 'memory-hub', legacyConnectorName: 'Memory Hub', v8Center: 'Memory + Knowledge Center', v8Mapping: 'integration.memoryhub', migrationStatus: 'migrated', notes: 'Legacy Memory Hub readonly page exists; v8 Integration Center and Memory Knowledge Center both reference it. Classified as memory_provider.' },
  { id: 'migration.labcenter', legacyConnectorId: 'lab-center', legacyConnectorName: 'Lab Center', v8Center: 'Local Apps Center', v8Mapping: 'app.comfyui', migrationStatus: 'migrated', notes: 'Lab Center components mapped to v8 Local Apps Center. ComfyUI classified as workflow_engine.' },
  { id: 'migration.assistantcenter', legacyConnectorId: 'assistant-center', legacyConnectorName: 'Assistant Center', v8Center: 'Agent Center', v8Mapping: 'agent.*', migrationStatus: 'planned', notes: 'Assistant Center has no direct v8 mapping yet; Agent Center will absorb it.' },
  { id: 'migration.governancehub', legacyConnectorId: 'governance-hub', legacyConnectorName: 'Governance Hub', v8Center: 'Policy Router + Capability Center', v8Mapping: 'cap.*, policy.*', migrationStatus: 'planned', notes: 'Governance Hub legacy page; v8 Policy/Capability Center covers governance rules.' },
  { id: 'migration.connectorcenter', legacyConnectorId: 'connector-center', legacyConnectorName: 'Connector Center', v8Center: 'Integration Center', v8Mapping: 'integration.*, connector.*', migrationStatus: 'in_progress', notes: 'Connector Center is the primary legacy page; Integration Center is the v8 successor. Migration bridge added to Connector Center.' },
  { id: 'migration.modelgateway', legacyConnectorId: 'model-gateway', legacyConnectorName: 'Model Gateway', v8Center: 'Provider Manager', v8Mapping: 'provider.*', migrationStatus: 'planned', notes: 'Model Gateway legacy page exists; Provider Manager is the v8 successor. Classified as provider/config switcher, not execution engine.' },
];

// ── Execution Boundary Registry ──
// Execution Gateway data layer — all readonly, no execution, no Gate/Stage C enablement.
// These entries document WHY execution is blocked and WHAT future conditions are required.
export interface V8ExecutionBoundaryEntry {
  id: string;
  name: string;
  capabilityId: string;
  category: string;
  currentState: string;
  risk: V8RiskLevel;
  requiredPermissionLevel: V8PermissionLevel;
  gateRequired: boolean;
  stageCRequired: boolean;
  humanAuthorizationRequired: boolean;
  auditRequired: boolean;
  dryRunRequired: boolean;
  blockedReason: string;
  allowedInPreview: boolean;
  requiredEvidence: string[];
  relatedPolicies: string[];
  relatedCenters: string[];
  dataSource: V8DataSource;
  readonly: boolean;
  futurePhase: string;
}

export const V8_EXECUTION_BOUNDARIES: V8ExecutionBoundaryEntry[] = [
  {
    id: 'exec-boundary.command',
    name: 'Command Execution',
    capabilityId: 'cap.execute.command',
    category: 'execute',
    currentState: 'blocked',
    risk: 'critical',
    requiredPermissionLevel: 'L5',
    gateRequired: true,
    stageCRequired: true,
    humanAuthorizationRequired: true,
    auditRequired: true,
    dryRunRequired: true,
    blockedReason: 'Command execution requires Gate open + Stage C enabled + L5 permission + human authorization + dry-run + audit receipt',
    allowedInPreview: false,
    requiredEvidence: ['human authorization form', 'Gate open confirmation', 'Stage C enablement record', 'dry-run results', 'audit trail'],
    relatedPolicies: ['policy.gated-execution', 'policy.release-boundary'],
    relatedCenters: ['Command Center'],
    dataSource: 'static_registry',
    readonly: true,
    futurePhase: 'Gated command execution with human approval workflow'
  },
  {
    id: 'exec-boundary.connector',
    name: 'Connector Action',
    capabilityId: 'cap.connector.action',
    category: 'execute',
    currentState: 'blocked',
    risk: 'high',
    requiredPermissionLevel: 'L4',
    gateRequired: true,
    stageCRequired: false,
    humanAuthorizationRequired: true,
    auditRequired: true,
    dryRunRequired: true,
    blockedReason: 'Connector action requires integration policy + Gate + audit — no external call in preview',
    allowedInPreview: false,
    requiredEvidence: ['integration policy', 'Gate open confirmation', 'audit receipt', 'dry-run evidence'],
    relatedPolicies: ['policy.apply-approval', 'policy.gated-execution'],
    relatedCenters: ['Integration Center'],
    dataSource: 'static_registry',
    readonly: true,
    futurePhase: 'Connector action execution with integration policy enforcement'
  },
  {
    id: 'exec-boundary.local-app',
    name: 'Local App Launch',
    capabilityId: 'cap.launch.local-app',
    category: 'launch',
    currentState: 'blocked',
    risk: 'high',
    requiredPermissionLevel: 'L4',
    gateRequired: false,
    stageCRequired: false,
    humanAuthorizationRequired: true,
    auditRequired: true,
    dryRunRequired: false,
    blockedReason: 'Local app launch blocked in preview — requires human approval + audit receipt',
    allowedInPreview: false,
    requiredEvidence: ['human approval', 'audit receipt', 'local app policy confirmation'],
    relatedPolicies: ['policy.apply-approval'],
    relatedCenters: ['Local Apps Center'],
    dataSource: 'static_registry',
    readonly: true,
    futurePhase: 'Local app launch with approval workflow'
  },
  {
    id: 'exec-boundary.memory-write',
    name: 'Memory Write',
    capabilityId: 'cap.memory.write',
    category: 'write',
    currentState: 'blocked except scoped_write_draft',
    risk: 'high',
    requiredPermissionLevel: 'L3',
    gateRequired: true,
    stageCRequired: true,
    humanAuthorizationRequired: true,
    auditRequired: true,
    dryRunRequired: true,
    blockedReason: 'Memory write requires Gate open + Stage C enabled + memory policy + review + audit',
    allowedInPreview: false,
    requiredEvidence: ['memory policy', 'Gate open confirmation', 'Stage C enablement record', 'review acceptance', 'audit trail'],
    relatedPolicies: ['policy.memory-draft', 'policy.gated-execution'],
    relatedCenters: ['Memory + Knowledge Center'],
    dataSource: 'static_registry',
    readonly: true,
    futurePhase: 'Scoped memory write with review pipeline'
  },
  {
    id: 'exec-boundary.file-apply',
    name: 'File Apply / Patch Apply',
    capabilityId: 'cap.edit.files',
    category: 'write',
    currentState: 'approval required — blocked in preview',
    risk: 'high',
    requiredPermissionLevel: 'L4',
    gateRequired: false,
    stageCRequired: false,
    humanAuthorizationRequired: true,
    auditRequired: true,
    dryRunRequired: true,
    blockedReason: 'File edits require L4 permission + human approval + audit — no write in preview',
    allowedInPreview: false,
    requiredEvidence: ['human approval', 'dry-run diff', 'review acceptance', 'audit receipt'],
    relatedPolicies: ['policy.apply-approval'],
    relatedCenters: ['Agent Center', 'Task Center'],
    dataSource: 'static_registry',
    readonly: true,
    futurePhase: 'File apply with approval + dry-run pipeline'
  },
  {
    id: 'exec-boundary.release-tag',
    name: 'Release / Tag / Restore',
    capabilityId: 'cap.release.tag',
    category: 'release',
    currentState: 'blocked',
    risk: 'critical',
    requiredPermissionLevel: 'L5',
    gateRequired: false,
    stageCRequired: false,
    humanAuthorizationRequired: true,
    auditRequired: true,
    dryRunRequired: true,
    blockedReason: 'Release/tag/restore blocked in preview — requires explicit human authorization + audit',
    allowedInPreview: false,
    requiredEvidence: ['human authorization form', 'release policy confirmation', 'dry-run plan', 'audit trail'],
    relatedPolicies: ['policy.release-boundary'],
    relatedCenters: ['Command Center'],
    dataSource: 'static_registry',
    readonly: true,
    futurePhase: 'Release/tag/restore with human authorization workflow'
  },
  {
    id: 'exec-boundary.gate-open',
    name: 'Gate Opening',
    capabilityId: 'cap.gate.open',
    category: 'gate',
    currentState: 'blocked',
    risk: 'critical',
    requiredPermissionLevel: 'L5',
    gateRequired: false,
    stageCRequired: false,
    humanAuthorizationRequired: true,
    auditRequired: true,
    dryRunRequired: false,
    blockedReason: 'Gate opening blocked in preview — requires explicit human authorization + backend truth + audit',
    allowedInPreview: false,
    requiredEvidence: ['human authorization form', 'safety boundary confirmation', 'audit trail'],
    relatedPolicies: ['policy.gated-execution', 'policy.release-boundary'],
    relatedCenters: [],
    dataSource: 'static_registry',
    readonly: true,
    futurePhase: 'Gate open/close controls (gated by human authorization)'
  },
  {
    id: 'exec-boundary.stage-c-enable',
    name: 'Stage C Enablement',
    capabilityId: 'cap.enable.stage-c',
    category: 'gate',
    currentState: 'blocked',
    risk: 'critical',
    requiredPermissionLevel: 'L5',
    gateRequired: false,
    stageCRequired: false,
    humanAuthorizationRequired: true,
    auditRequired: true,
    dryRunRequired: true,
    blockedReason: 'Stage C enablement blocked in preview — requires separate authorization process + audit',
    allowedInPreview: false,
    requiredEvidence: ['human authorization form', 'pre-enable review', 'safety boundary confirmation', 'audit trail'],
    relatedPolicies: ['policy.gated-execution'],
    relatedCenters: [],
    dataSource: 'static_registry',
    readonly: true,
    futurePhase: 'Stage C enablement workflow with pre-enable review'
  },
];

export function getV8ExecutionBoundarySummary() {
  const all = V8_EXECUTION_BOUNDARIES;
  return {
    total: all.length,
    blocked: all.filter(b => b.currentState.includes('blocked')).length,
    critical: all.filter(b => b.risk === 'critical').length,
    high: all.filter(b => b.risk === 'high').length,
    gateRequired: all.filter(b => b.gateRequired).length,
    stageCRequired: all.filter(b => b.stageCRequired).length,
    humanAuthRequired: all.filter(b => b.humanAuthorizationRequired).length,
    auditRequired: all.filter(b => b.auditRequired).length,
    dryRunRequired: all.filter(b => b.dryRunRequired).length,
    allowedInPreview: all.filter(b => b.allowedInPreview).length,
    blockedInPreview: all.filter(b => !b.allowedInPreview).length,
  };
}

// ── Summary helpers ──

export function getV8AgentCenterSummary() {
  const all = V8_AGENTS;
  return {
    total: all.length,
    enabled: all.filter(a => a.lifecycle === 'enabled').length,
    registered: all.filter(a => a.lifecycle === 'registered').length,
    planned: all.filter(a => a.lifecycle === 'planned').length,
    disabled: all.filter(a => a.lifecycle === 'disabled').length,
    configured: all.filter(a => a.configured).length,
    online: all.filter(a => a.online).length,
    authorized: all.filter(a => a.authorized).length,
    gateOpen: all.filter(a => a.gateOpen).length,
    executionBlocked: all.filter(a => a.lifecycle !== 'disabled').length,
    riskHigh: all.filter(a => a.risk === 'high').length,
    riskMedium: all.filter(a => a.risk === 'medium').length,
    riskLow: all.filter(a => a.risk === 'low').length,
    l0: all.filter(a => a.permissionLevel === 'L0').length,
    l1: all.filter(a => a.permissionLevel === 'L1').length,
    l2: all.filter(a => a.permissionLevel === 'L2').length,
    l3: all.filter(a => a.permissionLevel === 'L3').length,
    l4: all.filter(a => a.permissionLevel === 'L4').length,
    l5: all.filter(a => a.permissionLevel === 'L5').length,
    taskReady: all.filter(a => a.taskReadiness === 'ready').length,
    taskPartial: all.filter(a => a.taskReadiness === 'partial').length,
    taskNotReady: all.filter(a => a.taskReadiness === 'not_ready').length,
    auditReady: all.filter(a => a.auditReadiness === 'ready').length,
    auditPartial: all.filter(a => a.auditReadiness === 'partial').length,
    auditNotReady: all.filter(a => a.auditReadiness === 'not_ready').length,
  };
}

export function getV8ProviderSummary() {
  const all = V8_PROVIDERS;
  return { total: all.length, enabled: all.filter(p => p.lifecycle === 'enabled').length, registered: all.filter(p => p.lifecycle === 'registered').length, configured: all.filter(p => p.configured).length, online: all.filter(p => p.online).length, authorized: all.filter(p => p.authorized).length };
}

export function getV8IntegrationSummary() {
  const all = V8_INTEGRATIONS;
  return { total: all.length, enabled: all.filter(i => i.lifecycle === 'enabled').length, registered: all.filter(i => i.lifecycle === 'registered').length, blockedActions: all.filter(i => i.actionState === 'blocked').length, highOrCriticalRisk: all.filter(i => i.risk === 'high' || i.risk === 'critical').length, relatedProviders: new Set(all.map(i => i.relatedProviderId).filter(Boolean)).size, relatedLocalApps: new Set(all.map(i => i.relatedLocalAppId).filter(Boolean)).size, relatedAgents: new Set(all.map(i => i.relatedAgentId).filter(Boolean)).size, actionsAllowedInPreview: all.filter(i => i.allowedInPreview && i.actionState !== 'blocked').length };
}

export function getV8LocalAppSummary() {
  const all = V8_LOCAL_APPS;
  return { total: all.length, registered: all.filter(a => a.lifecycle === 'registered').length, enabled: all.filter(a => a.lifecycle === 'enabled').length, disabled: all.filter(a => a.lifecycle === 'disabled').length };
}

export function getV8CapabilitySummary() {
  const all = V8_CAPABILITIES;
  return {
    total: all.length,
    low: all.filter(c => c.risk === 'low').length,
    medium: all.filter(c => c.risk === 'medium').length,
    high: all.filter(c => c.risk === 'high').length,
    critical: all.filter(c => c.risk === 'critical').length,
    approvalRequired: all.filter(c => c.approvalRequired).length,
    gateRequired: all.filter(c => c.gateRequired).length,
    stageCRequired: all.filter(c => c.stageCRequired).length,
    auditRequired: all.filter(c => c.auditRequired).length,
    allowedInPreview: all.filter(c => c.allowedInPreview).length,
    blockedInPreview: all.filter(c => !c.allowedInPreview).length,
  };
}

export function getV8PolicySummary() {
  const all = V8_POLICIES;
  return {
    total: all.length,
    gateClosed: all.filter(p => !p.gateOpen).length,
    stageCDisabled: all.filter(p => !p.stageCEnabled).length,
    approvalRequired: all.filter(p => p.approvalRequired).length,
    gateRequired: all.filter(p => p.gateRequired).length,
    stageCRequired: all.filter(p => p.stageCRequired).length,
    auditRequired: all.filter(p => p.auditRequired).length,
    l0: all.filter(p => p.permissionLevel === 'L0').length,
    l1: all.filter(p => p.permissionLevel === 'L1').length,
    l2: all.filter(p => p.permissionLevel === 'L2').length,
    l3: all.filter(p => p.permissionLevel === 'L3').length,
    l4: all.filter(p => p.permissionLevel === 'L4').length,
    l5: all.filter(p => p.permissionLevel === 'L5').length,
  };
}

export function getV8TaskSummary() {
  const all = V8_TASKS;
  return {
    total: all.length,
    draft: all.filter(t => t.lifecycle === 'draft').length,
    pendingReview: all.filter(t => t.lifecycle === 'pending_review').length,
    blocked: all.filter(t => t.lifecycle === 'blocked').length,
    receiptRequired: all.filter(t => t.receiptRequired).length,
    auditRequired: all.filter(t => t.auditRequired).length,
    humanAuthRequired: all.filter(t => t.humanAuthorizationRequired).length,
    riskLow: all.filter(t => t.risk === 'low').length,
    riskMedium: all.filter(t => t.risk === 'medium').length,
    riskHigh: all.filter(t => t.risk === 'high').length,
    riskCritical: all.filter(t => t.risk === 'critical').length,
    reviewPending: all.filter(t => t.reviewState === 'pending_review').length,
    reviewNeedsEvidence: all.filter(t => t.reviewState === 'needs_evidence').length,
    reviewAccepted: all.filter(t => t.reviewState === 'accepted').length,
    reviewRejected: all.filter(t => t.reviewState === 'rejected').length,
    reviewBlocked: all.filter(t => t.reviewState === 'blocked').length,
  } as const;
}

export function getV8AuditSummary() {
  const all = V8_AUDITS;
  return {
    total: all.length,
    accepted: all.filter(a => a.acceptanceState === 'accepted').length,
    needsEvidence: all.filter(a => a.acceptanceState === 'needs_evidence').length,
    rejected: all.filter(a => a.acceptanceState === 'rejected').length,
    blocked: all.filter(a => a.acceptanceState === 'blocked').length,
    archived: all.filter(a => a.acceptanceState === 'archived').length,
    sealGrade: all.filter(a => a.evidenceLevel === 'seal_grade').length,
    sufficientEvidence: all.filter(a => a.evidenceLevel === 'sufficient').length,
    partialEvidence: all.filter(a => a.evidenceLevel === 'partial').length,
    noEvidence: all.filter(a => a.evidenceLevel === 'none').length,
    humanAuthNeeded: all.filter(a => a.humanAuthorizationNeeded).length,
    runtimeChanged: all.filter(a => a.runtimeChanged).length,
    servicesRestarted: all.filter(a => a.servicesRestarted).length,
    dbWritten: all.filter(a => a.dbWritten).length,
    gateOpened: all.filter(a => a.gateOpened).length,
    stageCEnabled: all.filter(a => a.stageCEnabled).length,
    releaseTagCreated: all.filter(a => a.releaseTagCreated).length,
    pushed: all.filter(a => a.pushed).length,
    workingTreeClean: all.filter(a => a.workingTreeClean).length,
    passed: all.filter(a => a.verdict === 'passed').length,
  };
}

export function getV8MemoryKnowledgeSummary() {
  const all = V8_MEMORY_KNOWLEDGE;
  return { total: all.length, enabled: all.filter(m => m.lifecycle === 'enabled').length, registered: all.filter(m => m.lifecycle === 'registered').length, disabled: all.filter(m => m.lifecycle === 'disabled').length, readonly: all.filter(m => m.accessMode === 'readonly').length, scopedWrite: all.filter(m => m.accessMode === 'scoped_write_draft').length };
}

export function getV8ConnectorMigrationSummary() {
  const all = V8_CONNECTOR_MIGRATIONS;
  return { total: all.length, migrated: all.filter(m => m.migrationStatus === 'migrated').length, inProgress: all.filter(m => m.migrationStatus === 'in_progress').length, planned: all.filter(m => m.migrationStatus === 'planned').length, blocked: all.filter(m => m.migrationStatus === 'blocked').length };
}

export function getV8RegistryCounts() {
  return {
    agents: getV8AgentCenterSummary().total,
    providers: getV8ProviderSummary().total,
    integrations: getV8IntegrationSummary().total,
    localApps: getV8LocalAppSummary().total,
    capabilities: getV8CapabilitySummary().total,
    policies: getV8PolicySummary().total,
    tasks: getV8TaskSummary().total,
    audits: getV8AuditSummary().total,
    memoryKnowledge: getV8MemoryKnowledgeSummary().total,
    connectorMigrations: getV8ConnectorMigrationSummary().total,
    executionBoundaries: getV8ExecutionBoundarySummary().total,
  };
}
