import type { AuthorizationDryRunFixture } from './authorizationDryRunFixtures.js'
import { getFixtureById } from './authorizationDryRunFixtures.js'

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

  if (fixture.expected_external_write_allowed !== false) {
    errors.push('external_write_allowed cannot be true in synthetic dry-run mode')
  }

  if (fixture.expected_production_action_allowed !== false) {
    errors.push('production_action_allowed cannot be true in synthetic dry-run mode')
  }

  if (fixture.expected_decision === 'DENY' && fixture.expected_runtime_allowed !== false) {
    errors.push('runtime_allowed must be false when decision is DENY')
  }

  if (fixture.expected_decision === 'DENY' && fixture.expected_production_action_allowed !== false) {
    errors.push('production_action_allowed must be false when decision is DENY')
  }

  if (fixture.expected_decision === 'OBSERVE_ONLY' && fixture.expected_runtime_allowed !== false) {
    warnings.push('OBSERVE_ONLY decision should have runtime_allowed = false')
  }

  if (fixture.expected_decision === 'OBSERVE_ONLY' && fixture.expected_production_action_allowed !== false) {
    warnings.push('OBSERVE_ONLY decision should have production_action_allowed = false')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

export function validateFixtureId(fixtureId: string): boolean {
  const fixture = getFixtureById(fixtureId)
  return fixture !== undefined
}

// ── Body-level request validation ──
export interface DryRunRequestValidation {
  valid: boolean
  error: string | null
  field: string | null
  reason: string | null
}

export function validateDryRunRequest(body: Record<string, unknown>): DryRunRequestValidation {
  const fixtureId = String(body.fixture_id || '').trim()
  const requestedScope = String(body.requested_scope || '').trim()
  const requestedAction = String(body.requested_action || '').trim()
  const actorRole = String(body.actor_role || '').trim()
  const riskLevel = String(body.risk_level || '').trim()
  const stageCAllowed = body.stage_c_allowed === true
  const runtimeAllowed = body.runtime_allowed === true
  const externalWriteAllowed = body.external_write_allowed === true
  const productionActionAllowed = body.production_action_allowed === true

  const FORBIDDEN_ACTIONS = ['enable_stage_c', 'runtime_allow', 'external_write', 'training_trigger', 'inference_trigger', 'deployment_trigger']

  if (!fixtureId) {
    return { valid: false, error: 'AUTHORIZATION_DRY_RUN_REJECTED', field: 'fixture_id', reason: 'fixture_id is required' }
  }
  if (!getFixtureById(fixtureId)) {
    return { valid: false, error: 'AUTHORIZATION_DRY_RUN_REJECTED', field: 'fixture_id', reason: `fixture_id "${fixtureId}" does not exist` }
  }
  if (fixtureId && requestedScope === '') {
    return { valid: false, error: 'AUTHORIZATION_DRY_RUN_REJECTED', field: 'requested_scope', reason: 'requested_scope is required' }
  }
  if (fixtureId && requestedAction === '') {
    return { valid: false, error: 'AUTHORIZATION_DRY_RUN_REJECTED', field: 'requested_action', reason: 'requested_action is required' }
  }
  if (fixtureId && actorRole === '') {
    return { valid: false, error: 'AUTHORIZATION_DRY_RUN_REJECTED', field: 'actor_role', reason: 'actor_role is required' }
  }
  if (fixtureId && !['low', 'medium', 'high', 'critical'].includes(riskLevel)) {
    return { valid: false, error: 'AUTHORIZATION_DRY_RUN_REJECTED', field: 'risk_level', reason: `risk_level must be one of: low, medium, high, critical` }
  }
  if (stageCAllowed) {
    return { valid: false, error: 'STAGE_C_REJECTED', field: 'stage_c_allowed', reason: 'Stage C action not allowed — Stage C is disabled' }
  }
  if (runtimeAllowed) {
    return { valid: false, error: 'RUNTIME_ACTION_REJECTED', field: 'runtime_allowed', reason: 'Runtime action not allowed — production runtime implementation is blocked' }
  }
  if (externalWriteAllowed) {
    return { valid: false, error: 'EXTERNAL_WRITE_REJECTED', field: 'external_write_allowed', reason: 'External write not allowed — external writes are disabled' }
  }
  if (productionActionAllowed) {
    return { valid: false, error: 'PRODUCTION_ACTION_REJECTED', field: 'production_action_allowed', reason: 'Production action not allowed — authorization foundation only supports synthetic dry-run mode' }
  }
  if (FORBIDDEN_ACTIONS.includes(requestedAction)) {
    return { valid: false, error: 'AUTHORIZATION_DRY_RUN_REJECTED', field: 'requested_action', reason: `Action "${requestedAction}" is not allowed in synthetic dry-run mode` }
  }

  return { valid: true, error: null, field: null, reason: null }
}
