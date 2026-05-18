export interface AuthorizationDryRunFixture {
  fixture_id: string
  actor: string
  actor_role: string
  requested_scope: string
  requested_action: string
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  expected_decision: 'DENY' | 'BLOCKED' | 'OBSERVE_ONLY'
  expected_runtime_allowed: boolean
  expected_stage_c_allowed: boolean
  expected_external_write_allowed: boolean
  expected_production_action_allowed: boolean
  expected_reason: string
}

const FIXTURE_DEFINITIONS: AuthorizationDryRunFixture[] = [
  {
    fixture_id: 'safe_readonly_center_access',
    actor: 'operator',
    actor_role: 'viewer',
    requested_scope: 'governance_center',
    requested_action: 'view',
    risk_level: 'low',
    expected_decision: 'OBSERVE_ONLY',
    expected_runtime_allowed: false,
    expected_stage_c_allowed: false,
    expected_external_write_allowed: false,
    expected_production_action_allowed: false,
    expected_reason: 'Safe readonly center access — observe only',
  },
  {
    fixture_id: 'blocked_stage_c_activation',
    actor: 'admin',
    actor_role: 'administrator',
    requested_scope: 'system',
    requested_action: 'enable_stage_c',
    risk_level: 'critical',
    expected_decision: 'BLOCKED',
    expected_runtime_allowed: false,
    expected_stage_c_allowed: false,
    expected_external_write_allowed: false,
    expected_production_action_allowed: false,
    expected_reason: 'Stage C activation is blocked — Stage C disabled by policy',
  },
  {
    fixture_id: 'blocked_high_risk_primary_nav',
    actor: 'admin',
    actor_role: 'administrator',
    requested_scope: 'sidebar',
    requested_action: 'modify_layout',
    risk_level: 'high',
    expected_decision: 'DENY',
    expected_runtime_allowed: false,
    expected_stage_c_allowed: false,
    expected_external_write_allowed: false,
    expected_production_action_allowed: false,
    expected_reason: 'High risk primary nav modification — blocked by default deny policy',
  },
  {
    fixture_id: 'blocked_external_write',
    actor: 'service',
    actor_role: 'service_account',
    requested_scope: 'external_system',
    requested_action: 'write',
    risk_level: 'critical',
    expected_decision: 'DENY',
    expected_runtime_allowed: false,
    expected_stage_c_allowed: false,
    expected_external_write_allowed: false,
    expected_production_action_allowed: false,
    expected_reason: 'External write blocked — external writes are disabled',
  },
  {
    fixture_id: 'blocked_runtime_control',
    actor: 'admin',
    actor_role: 'administrator',
    requested_scope: 'runtime',
    requested_action: 'execute',
    risk_level: 'high',
    expected_decision: 'DENY',
    expected_runtime_allowed: false,
    expected_stage_c_allowed: false,
    expected_external_write_allowed: false,
    expected_production_action_allowed: false,
    expected_reason: 'Runtime control blocked — production runtime implementation is blocked',
  },
  {
    fixture_id: 'blocked_training_trigger',
    actor: 'operator',
    actor_role: 'engineer',
    requested_scope: 'training',
    requested_action: 'start_training',
    risk_level: 'high',
    expected_decision: 'DENY',
    expected_runtime_allowed: false,
    expected_stage_c_allowed: false,
    expected_external_write_allowed: false,
    expected_production_action_allowed: false,
    expected_reason: 'Training trigger blocked — training not allowed in synthetic mode',
  },
  {
    fixture_id: 'blocked_inference_trigger',
    actor: 'operator',
    actor_role: 'engineer',
    requested_scope: 'inference',
    requested_action: 'run_inference',
    risk_level: 'high',
    expected_decision: 'DENY',
    expected_runtime_allowed: false,
    expected_stage_c_allowed: false,
    expected_external_write_allowed: false,
    expected_production_action_allowed: false,
    expected_reason: 'Inference trigger blocked — inference not allowed in synthetic mode',
  },
  {
    fixture_id: 'blocked_deployment_trigger',
    actor: 'admin',
    actor_role: 'administrator',
    requested_scope: 'deployment',
    requested_action: 'deploy',
    risk_level: 'critical',
    expected_decision: 'DENY',
    expected_runtime_allowed: false,
    expected_stage_c_allowed: false,
    expected_external_write_allowed: false,
    expected_production_action_allowed: false,
    expected_reason: 'Deployment trigger blocked — deployment not allowed in synthetic mode',
  },
]

// ── Invalid / malformed fixture definitions for validation testing ──
export const INVALID_FIXTURE_CASES: Array<{ label: string; fixture: Partial<AuthorizationDryRunFixture>; expectedRejection: string }> = [
  {
    label: 'missing fixture_id',
    fixture: { actor: 'admin', actor_role: 'admin', requested_scope: 'test', requested_action: 'test', risk_level: 'low' },
    expectedRejection: 'fixture_id is required',
  },
  {
    label: 'unknown fixture_id',
    fixture: { fixture_id: 'nonexistent_fixture', actor: 'admin', actor_role: 'admin', requested_scope: 'test', requested_action: 'test', risk_level: 'low' },
    expectedRejection: 'fixture_id does not exist',
  },
  {
    label: 'empty scope',
    fixture: { fixture_id: 'safe_readonly_center_access', actor: 'admin', actor_role: 'admin', requested_scope: '', requested_action: 'test', risk_level: 'low' },
    expectedRejection: 'requested_scope is required',
  },
  {
    label: 'empty action',
    fixture: { fixture_id: 'safe_readonly_center_access', actor: 'admin', actor_role: 'admin', requested_scope: 'test', requested_action: '', risk_level: 'low' },
    expectedRejection: 'requested_action is required',
  },
  {
    label: 'bad actor_role',
    fixture: { fixture_id: 'safe_readonly_center_access', actor: 'admin', actor_role: '', requested_scope: 'test', requested_action: 'test', risk_level: 'low' },
    expectedRejection: 'actor_role is required',
  },
  {
    label: 'bad risk_level',
    fixture: { fixture_id: 'safe_readonly_center_access', actor: 'admin', actor_role: 'admin', requested_scope: 'test', requested_action: 'test', risk_level: 'extreme' as any },
    expectedRejection: 'risk_level must be one of',
  },
  {
    label: 'stage_c_allowed=true',
    fixture: { fixture_id: 'blocked_stage_c_activation', actor: 'admin', actor_role: 'admin', requested_scope: 'test', requested_action: 'test', risk_level: 'low', expected_stage_c_allowed: true },
    expectedRejection: 'stage_c_allowed cannot be true',
  },
  {
    label: 'runtime_allowed=true',
    fixture: { fixture_id: 'blocked_runtime_control', actor: 'admin', actor_role: 'admin', requested_scope: 'test', requested_action: 'test', risk_level: 'low', expected_runtime_allowed: true },
    expectedRejection: 'runtime_allowed cannot be true for high/critical',
  },
  {
    label: 'external_write_allowed=true',
    fixture: { fixture_id: 'blocked_external_write', actor: 'admin', actor_role: 'admin', requested_scope: 'test', requested_action: 'test', risk_level: 'low', expected_external_write_allowed: true },
    expectedRejection: 'external_write_allowed cannot be true',
  },
  {
    label: 'production_action_allowed=true',
    fixture: { fixture_id: 'blocked_deployment_trigger', actor: 'admin', actor_role: 'admin', requested_scope: 'test', requested_action: 'test', risk_level: 'low', expected_production_action_allowed: true },
    expectedRejection: 'production_action_allowed cannot be true',
  },
  {
    label: 'training_trigger requested_action',
    fixture: { fixture_id: 'blocked_training_trigger', actor: 'admin', actor_role: 'admin', requested_scope: 'training', requested_action: 'start_training', risk_level: 'high', expected_runtime_allowed: false },
    expectedRejection: 'runtime_allowed must be false when decision is DENY',
  },
  {
    label: 'deployment_allowed requested_action',
    fixture: { fixture_id: 'blocked_deployment_trigger', actor: 'admin', actor_role: 'admin', requested_scope: 'deployment', requested_action: 'deploy', risk_level: 'critical', expected_runtime_allowed: true },
    expectedRejection: 'runtime_allowed must be false when decision is DENY',
  },
]

export function getFixtures(): AuthorizationDryRunFixture[] {
  return FIXTURE_DEFINITIONS
}

export function getFixtureById(id: string): AuthorizationDryRunFixture | undefined {
  return FIXTURE_DEFINITIONS.find(f => f.fixture_id === id)
}
