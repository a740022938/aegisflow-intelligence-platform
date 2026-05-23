export type AgentLifecycle = 'planned' | 'registered' | 'enabled' | 'paused' | 'disabled' | 'quarantined';
export type PermissionLevel = 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
export type IntegrationKind = 'agent' | 'provider' | 'local_app' | 'workflow_engine' | 'memory_provider' | 'knowledge_provider' | 'code_host' | 'runtime_service' | 'internal_plugin' | 'coding_agent' | 'unknown';
export type CapabilityRisk = 'low' | 'medium' | 'high' | 'critical';
export type RuntimeTruthState = 'unknown' | 'offline' | 'online' | 'degraded';
export type GateState = 'closed' | 'open';
export type StageCState = 'disabled' | 'enabled';

export interface RegistryTruthFields {
  configured?: boolean;
  online?: boolean;
  authorized?: boolean;
  gateOpen?: boolean;
  stageCEnabled?: boolean;
}

export interface AgentRegistryEntry extends RegistryTruthFields {
  id: string;
  name: string;
  kind: 'agent';
  integrationKind?: IntegrationKind;
  lifecycle: AgentLifecycle;
  permissionLevel: PermissionLevel;
}
export interface ProviderRegistryEntry extends RegistryTruthFields {
  id: string;
  name: string;
  kind: 'provider';
  lifecycle: AgentLifecycle;
  permissionLevel: PermissionLevel;
}
export interface IntegrationRegistryEntry extends RegistryTruthFields {
  id: string;
  name: string;
  kind: IntegrationKind;
  lifecycle: AgentLifecycle;
  permissionLevel: PermissionLevel;
}
export interface LocalAppRegistryEntry extends RegistryTruthFields {
  id: string;
  name: string;
  kind: 'local_app' | 'workflow_engine';
  lifecycle: AgentLifecycle;
  permissionLevel: PermissionLevel;
}
export interface CapabilityRegistryEntry {
  id: string;
  kind: string;
  risk: CapabilityRisk;
  permissionLevel: PermissionLevel;
  gateRequired?: boolean;
  stageCRequired?: boolean;
}
export interface PolicyRegistryEntry {
  id: string;
  gateOpen: boolean;
  stageCEnabled: boolean;
  rule: string;
}

export function validateTruthSeparation(t: RegistryTruthFields): string[] {
  const problems: string[] = [];
  if (t.gateOpen === true && t.authorized !== true) problems.push('gateOpen requires authorized=true');
  if (t.stageCEnabled === true && t.gateOpen !== true) problems.push('stageCEnabled requires gateOpen=true');
  return problems;
}
