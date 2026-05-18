import type { AuthorizationDryRunFixture } from './authorizationDryRunFixtures.js'

export interface DryRunValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

const VALID_RISK_LEVELS = ['low', 'medium', 'high', 'critical']

export function validateFixture(fixture: AuthorizationDryRunFixture): DryRunValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!fixture.fixture_id) {
    errors.push('fixture_id is required')
  }

  if (!fixture.requested_scope) {
    errors.push('requested_scope is required')
  }

  if (!fixture.requested_action) {
    errors.push('requested_action is required')
  }

  if (!fixture.actor_role) {
    errors.push('actor_role is required')
  }

  if (!VALID_RISK_LEVELS.includes(fixture.risk_level)) {
    errors.push(`risk_level must be one of: ${VALID_RISK_LEVELS.join(', ')}`)
  }

  if (fixture.expected_stage_c_allowed !== false) {
    errors.push('stage_c_allowed cannot be true in synthetic dry-run mode')
  }

  if (fixture.risk_level === 'high' || fixture.risk_level === 'critical') {
    if (fixture.expected_runtime_allowed !== false) {
      errors.push('runtime_allowed cannot be true for high/critical risk production actions')
    }
  }

  if (fixture.expected_decision === 'DENY' && fixture.expected_runtime_allowed !== false) {
    errors.push('runtime_allowed must be false when decision is DENY')
  }

  if (fixture.expected_decision === 'OBSERVE_ONLY' && fixture.expected_runtime_allowed !== false) {
    warnings.push('OBSERVE_ONLY decision should have runtime_allowed = false')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}
