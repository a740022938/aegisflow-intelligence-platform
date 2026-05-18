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
    expected_reason: 'Deployment trigger blocked — deployment not allowed in synthetic mode',
  },
]

export function getFixtures(): AuthorizationDryRunFixture[] {
  return FIXTURE_DEFINITIONS
}

export function getFixtureById(id: string): AuthorizationDryRunFixture | undefined {
  return FIXTURE_DEFINITIONS.find(f => f.fixture_id === id)
}
