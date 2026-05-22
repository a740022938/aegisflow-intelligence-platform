// OpenAIP v8 Center Registry — shared static data layer
// READONLY METADATA ONLY. Does not call real APIs, write to databases, or execute.

export type V8Lifecycle = 'registered' | 'enabled' | 'paused' | 'disabled' | 'quarantined' | 'draft' | 'running' | 'stopped' | 'error';
export type V8PermissionLevel = 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
export type V8RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface V8RegistryTruthFields {
  configured?: boolean;
  online?: boolean;
  authorized?: boolean;
  gateOpen?: boolean;
  stageCEnabled?: boolean;
}

export interface V8AgentEntry extends V8RegistryTruthFields {
  id: string;
  name: string;
  kind: 'agent';
  integrationKind: string;
  lifecycle: V8Lifecycle;
  permissionLevel: V8PermissionLevel;
}

export interface V8ProviderEntry extends V8RegistryTruthFields {
  id: string;
  name: string;
  kind: 'provider';
  lifecycle: V8Lifecycle;
  permissionLevel: V8PermissionLevel;
}

export interface V8IntegrationEntry extends V8RegistryTruthFields {
  id: string;
  name: string;
  kind: string;
  lifecycle: V8Lifecycle;
  permissionLevel: V8PermissionLevel;
}

export interface V8LocalAppEntry extends V8RegistryTruthFields {
  id: string;
  name: string;
  kind: string;
  subtype?: string;
  lifecycle: V8Lifecycle;
  permissionLevel: V8PermissionLevel;
}

export interface V8CapabilityEntry {
  id: string;
  kind: string;
  risk: V8RiskLevel;
  permissionLevel: V8PermissionLevel;
  requiresGate?: boolean;
  requiresStageC?: boolean;
}

export interface V8PolicyEntry {
  id: string;
  gateOpen: boolean;
  stageCEnabled: boolean;
  rule: string;
}

export interface V8TaskEntry {
  id: string;
  name: string;
  lifecycle: V8Lifecycle;
  permissionLevel: V8PermissionLevel;
  receiptRequired: boolean;
  reviewRequired: boolean;
}

export interface V8AuditEntry {
  id: string;
  type: string;
  phase: string;
  verdict: string;
  commit: string;
  timestamp: string;
}

export interface V8MemoryKnowledgeEntry {
  id: string;
  source: string;
  accessMode: string;
  lifecycle: V8Lifecycle;
  permissionLevel: V8PermissionLevel;
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
export const V8_AGENTS: V8AgentEntry[] = [
  { id: 'agent.openclaw', name: 'OpenClaw', kind: 'agent', integrationKind: 'runtime_service', lifecycle: 'enabled', permissionLevel: 'L1', configured: true, online: false, authorized: false, gateOpen: false, stageCEnabled: false },
  { id: 'agent.codex', name: 'Codex', kind: 'agent', integrationKind: 'coding_agent', lifecycle: 'registered', permissionLevel: 'L1', configured: true, online: true, authorized: true, gateOpen: false, stageCEnabled: false },
  { id: 'agent.future', name: 'Future Agent', kind: 'agent', integrationKind: 'pending', lifecycle: 'disabled', permissionLevel: 'L0', configured: false, online: false, authorized: false, gateOpen: false, stageCEnabled: false },
];

// ── Providers Registry ──
export const V8_PROVIDERS: V8ProviderEntry[] = [
  { id: 'provider.cc-switch', name: 'CC Switch-like Provider Router', kind: 'provider', lifecycle: 'registered', permissionLevel: 'L2', configured: true, online: true, authorized: true, gateOpen: false, stageCEnabled: false },
  { id: 'provider.ollama', name: 'Ollama', kind: 'provider', lifecycle: 'enabled', permissionLevel: 'L1', configured: true, online: false, authorized: false, gateOpen: false, stageCEnabled: false },
  { id: 'provider.lmstudio', name: 'LM Studio', kind: 'provider', lifecycle: 'registered', permissionLevel: 'L1', configured: true, online: false, authorized: false, gateOpen: false, stageCEnabled: false },
  { id: 'provider.claude', name: 'Claude (OpenAI-compatible)', kind: 'provider', lifecycle: 'registered', permissionLevel: 'L1', configured: false, online: false, authorized: false, gateOpen: false, stageCEnabled: false },
  { id: 'provider.deepseek', name: 'DeepSeek', kind: 'provider', lifecycle: 'registered', permissionLevel: 'L1', configured: false, online: false, authorized: false, gateOpen: false, stageCEnabled: false },
];

// ── Integrations Registry ──
export const V8_INTEGRATIONS: V8IntegrationEntry[] = [
  { id: 'integration.github', name: 'GitHub', kind: 'code_host', lifecycle: 'enabled', permissionLevel: 'L1', configured: true, online: true, authorized: true, gateOpen: false, stageCEnabled: false },
  { id: 'integration.memoryhub', name: 'Memory Hub', kind: 'memory_provider', lifecycle: 'registered', permissionLevel: 'L1', configured: true, online: false, authorized: false, gateOpen: false, stageCEnabled: false },
  { id: 'integration.knowledgebase', name: 'Knowledge Base', kind: 'knowledge_provider', lifecycle: 'registered', permissionLevel: 'L1', configured: true, online: false, authorized: false, gateOpen: false, stageCEnabled: false },
  { id: 'integration.webhook', name: 'Webhook Bridge', kind: 'webhook', lifecycle: 'registered', permissionLevel: 'L1', configured: false, online: false, authorized: false, gateOpen: false, stageCEnabled: false },
];

// ── Local Apps Registry ──
export const V8_LOCAL_APPS: V8LocalAppEntry[] = [
  { id: 'app.openaxiom', name: 'OpenAxiom', kind: 'local_app', subtype: 'ui_lab_vision_tool', lifecycle: 'registered', permissionLevel: 'L1', configured: true, online: false, authorized: false, gateOpen: false, stageCEnabled: false },
  { id: 'app.comfyui', name: 'ComfyUI', kind: 'workflow_engine', lifecycle: 'registered', permissionLevel: 'L1', configured: true, online: false, authorized: false, gateOpen: false, stageCEnabled: false },
  { id: 'app.ollama', name: 'Ollama (Local LLM)', kind: 'local_app', lifecycle: 'registered', permissionLevel: 'L1', configured: true, online: false, authorized: false, gateOpen: false, stageCEnabled: false },
  { id: 'app.lmstudio', name: 'LM Studio (Local LLM)', kind: 'local_app', lifecycle: 'registered', permissionLevel: 'L1', configured: true, online: false, authorized: false, gateOpen: false, stageCEnabled: false },
  { id: 'app.yolo', name: 'YOLO / SAM Vision Tools', kind: 'local_app', subtype: 'vision_tool', lifecycle: 'registered', permissionLevel: 'L1', configured: false, online: false, authorized: false, gateOpen: false, stageCEnabled: false },
  { id: 'app.python-workers', name: 'Python Workers', kind: 'local_app', lifecycle: 'disabled', permissionLevel: 'L0', configured: false, online: false, authorized: false, gateOpen: false, stageCEnabled: false },
];

// ── Capabilities Registry ──
export const V8_CAPABILITIES: V8CapabilityEntry[] = [
  { id: 'cap.runtime.status', kind: 'runtime_status', risk: 'low', permissionLevel: 'L1', requiresGate: false },
  { id: 'cap.runtime.execute', kind: 'runtime_execute', risk: 'critical', permissionLevel: 'L5', requiresGate: true, requiresStageC: true },
  { id: 'cap.agent.list', kind: 'agent_list', risk: 'low', permissionLevel: 'L1', requiresGate: false },
  { id: 'cap.agent.configure', kind: 'agent_configure', risk: 'high', permissionLevel: 'L3', requiresGate: true },
  { id: 'cap.memory.read', kind: 'memory_read', risk: 'low', permissionLevel: 'L1', requiresGate: false },
  { id: 'cap.memory.write', kind: 'memory_write', risk: 'high', permissionLevel: 'L3', requiresGate: true, requiresStageC: true },
  { id: 'cap.connector.route', kind: 'connector_route', risk: 'medium', permissionLevel: 'L2', requiresGate: false },
  { id: 'cap.connector.execute', kind: 'connector_execute', risk: 'critical', permissionLevel: 'L5', requiresGate: true, requiresStageC: true },
];

// ── Policies Registry ──
export const V8_POLICIES: V8PolicyEntry[] = [
  { id: 'policy.default', gateOpen: false, stageCEnabled: false, rule: 'configured!=online && authorized!=gateOpen && enabled!=execution' },
  { id: 'policy.gate', gateOpen: false, stageCEnabled: false, rule: 'gate remains CLOSED in preview; requires human authorization to open' },
  { id: 'policy.stage-c', gateOpen: false, stageCEnabled: false, rule: 'Stage C remains disabled; requires pre-enable review to enable' },
];

// ── Tasks Registry ──
export const V8_TASKS: V8TaskEntry[] = [
  { id: 'task.registry', name: 'Task Pack Registry', lifecycle: 'draft', permissionLevel: 'L1', receiptRequired: true, reviewRequired: false },
  { id: 'task.receipt.intake', name: 'Receipt Intake Pipeline', lifecycle: 'draft', permissionLevel: 'L1', receiptRequired: false, reviewRequired: true },
  { id: 'task.review', name: 'Human Review Queue', lifecycle: 'draft', permissionLevel: 'L2', receiptRequired: true, reviewRequired: false },
];

// ── Audit Registry ──
export const V8_AUDITS: V8AuditEntry[] = [
  { id: 'audit.receipt.001', type: 'receipt', phase: 'P1A', verdict: 'passed', commit: 'abc123', timestamp: '2026-05-21T00:00:00Z' },
  { id: 'audit.receipt.002', type: 'receipt', phase: 'P1B', verdict: 'passed', commit: 'def456', timestamp: '2026-05-21T06:00:00Z' },
  { id: 'audit.receipt.003', type: 'receipt', phase: 'P1C', verdict: 'passed', commit: '789abc', timestamp: '2026-05-21T12:00:00Z' },
  { id: 'audit.receipt.004', type: 'receipt', phase: 'P2A', verdict: 'passed', commit: 'ghi012', timestamp: '2026-05-22T00:00:00Z' },
  { id: 'audit.receipt.005', type: 'receipt', phase: 'P2B', verdict: 'passed', commit: 'jkl345', timestamp: '2026-05-22T06:00:00Z' },
];

// ── Memory + Knowledge Registry ──
export const V8_MEMORY_KNOWLEDGE: V8MemoryKnowledgeEntry[] = [
  { id: 'mem.knowledge.docs', source: 'docs', accessMode: 'readonly', lifecycle: 'enabled', permissionLevel: 'L1' },
  { id: 'mem.knowledge.reports', source: 'reports', accessMode: 'readonly', lifecycle: 'enabled', permissionLevel: 'L1' },
  { id: 'mem.knowledge.receipts', source: 'receipts', accessMode: 'readonly', lifecycle: 'enabled', permissionLevel: 'L1' },
  { id: 'mem.knowledge.repo', source: 'repo', accessMode: 'readonly', lifecycle: 'enabled', permissionLevel: 'L1' },
  { id: 'mem.knowledge.datasets', source: 'datasets', accessMode: 'readonly', lifecycle: 'registered', permissionLevel: 'L1' },
  { id: 'mem.knowledge.local-files', source: 'local files', accessMode: 'readonly', lifecycle: 'registered', permissionLevel: 'L1' },
  { id: 'mem.access.readonly', source: 'memory-access', accessMode: 'readonly', lifecycle: 'enabled', permissionLevel: 'L1' },
  { id: 'mem.access.scoped-write', source: 'memory-access', accessMode: 'scoped_write_draft', lifecycle: 'disabled', permissionLevel: 'L2' },
];

// ── Connector → v8 Migration Registry ──
export const V8_CONNECTOR_MIGRATIONS: V8ConnectorMigrationEntry[] = [
  { id: 'migration.openaxiom', legacyConnectorId: 'openaxiom', legacyConnectorName: 'OpenAxiom', v8Center: 'Local Apps Center', v8Mapping: 'app.openaxiom', migrationStatus: 'migrated', notes: 'Legacy connector page exists as OpenAxiomReadonly; v8 Local Apps Center entry registered.' },
  { id: 'migration.memoryhub', legacyConnectorId: 'memory-hub', legacyConnectorName: 'Memory Hub', v8Center: 'Memory + Knowledge Center', v8Mapping: 'integration.memoryhub', migrationStatus: 'migrated', notes: 'Legacy Memory Hub readonly page exists; v8 Integration Center and Memory Knowledge Center both reference it.' },
  { id: 'migration.labcenter', legacyConnectorId: 'lab-center', legacyConnectorName: 'Lab Center', v8Center: 'Local Apps Center', v8Mapping: 'app.comfyui', migrationStatus: 'migrated', notes: 'Lab Center components mapped to v8 Local Apps Center.' },
  { id: 'migration.assistantcenter', legacyConnectorId: 'assistant-center', legacyConnectorName: 'Assistant Center', v8Center: 'Agent Center', v8Mapping: 'agent.*', migrationStatus: 'planned', notes: 'Assistant Center has no direct v8 mapping yet; Agent Center will absorb it.' },
  { id: 'migration.governancehub', legacyConnectorId: 'governance-hub', legacyConnectorName: 'Governance Hub', v8Center: 'Policy Router + Capability Center', v8Mapping: 'cap.*, policy.*', migrationStatus: 'planned', notes: 'Governance Hub legacy page; v8 Policy/Capability Center covers governance rules.' },
  { id: 'migration.connectorcenter', legacyConnectorId: 'connector-center', legacyConnectorName: 'Connector Center', v8Center: 'Integration Center', v8Mapping: 'integration.*, connector.*', migrationStatus: 'in_progress', notes: 'Connector Center is the primary legacy page; Integration Center is the v8 successor. Migration bridge added to Connector Center.' },
  { id: 'migration.modelgateway', legacyConnectorId: 'model-gateway', legacyConnectorName: 'Model Gateway', v8Center: 'Provider Manager', v8Mapping: 'provider.*', migrationStatus: 'planned', notes: 'Model Gateway legacy page exists; Provider Manager is the v8 successor.' },
];

// ── Summary helpers ──

export function getV8AgentCenterSummary() {
  const all = V8_AGENTS;
  return { total: all.length, enabled: all.filter(a => a.lifecycle === 'enabled').length, registered: all.filter(a => a.lifecycle === 'registered').length, disabled: all.filter(a => a.lifecycle === 'disabled').length, configured: all.filter(a => a.configured).length, online: all.filter(a => a.online).length, authorized: all.filter(a => a.authorized).length, gateOpen: all.filter(a => a.gateOpen).length };
}

export function getV8ProviderSummary() {
  const all = V8_PROVIDERS;
  return { total: all.length, enabled: all.filter(p => p.lifecycle === 'enabled').length, registered: all.filter(p => p.lifecycle === 'registered').length, configured: all.filter(p => p.configured).length, online: all.filter(p => p.online).length, authorized: all.filter(p => p.authorized).length };
}

export function getV8IntegrationSummary() {
  const all = V8_INTEGRATIONS;
  return { total: all.length, enabled: all.filter(i => i.lifecycle === 'enabled').length, registered: all.filter(i => i.lifecycle === 'registered').length };
}

export function getV8LocalAppSummary() {
  const all = V8_LOCAL_APPS;
  return { total: all.length, registered: all.filter(a => a.lifecycle === 'registered').length, enabled: all.filter(a => a.lifecycle === 'enabled').length, disabled: all.filter(a => a.lifecycle === 'disabled').length };
}

export function getV8CapabilitySummary() {
  const all = V8_CAPABILITIES;
  return { total: all.length, low: all.filter(c => c.risk === 'low').length, medium: all.filter(c => c.risk === 'medium').length, high: all.filter(c => c.risk === 'high').length, critical: all.filter(c => c.risk === 'critical').length, requiresGate: all.filter(c => c.requiresGate).length, requiresStageC: all.filter(c => c.requiresStageC).length };
}

export function getV8PolicySummary() {
  const all = V8_POLICIES;
  return { total: all.length, gateClosed: all.filter(p => !p.gateOpen).length, stageCDisabled: all.filter(p => !p.stageCEnabled).length };
}

export function getV8TaskSummary() {
  const all = V8_TASKS;
  return { total: all.length, draft: all.filter(t => t.lifecycle === 'draft').length, receiptRequired: all.filter(t => t.receiptRequired).length, reviewRequired: all.filter(t => t.reviewRequired).length };
}

export function getV8AuditSummary() {
  const all = V8_AUDITS;
  return { total: all.length, passed: all.filter(a => a.verdict === 'passed').length, latestPhase: all[all.length - 1]?.phase || 'none' };
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
  };
}
