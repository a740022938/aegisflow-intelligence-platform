import type { SyntheticDecision } from './authorizationSyntheticEvaluator.js'
import type { AuthorizationDryRunFixture } from './authorizationDryRunFixtures.js'

export const TRACE_SCHEMA_VERSION = '1.0.0'

export interface DecisionTrace {
  trace_id: string
  trace_schema_version: string
  fixture_id: string
  input_summary: string
  matched_rules: string[]
  blocked_reasons: string[]
  stage_c_state: string
  runtime_state: string
  external_write_state: string
  production_action_state: string
  result: SyntheticDecision
  created_at: string
}

function nowIso(): string {
  return new Date().toISOString()
}

function hashInput(fixture: AuthorizationDryRunFixture): string {
  const raw = `${fixture.fixture_id}|${fixture.actor}|${fixture.actor_role}|${fixture.requested_scope}|${fixture.requested_action}`
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    const chr = raw.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0
  }
  return `trace_${Math.abs(hash).toString(16).padStart(8, '0')}`
}

export function buildTrace(fixture: AuthorizationDryRunFixture, decision: SyntheticDecision): DecisionTrace {
  const rules: string[] = []
  const blocked: string[] = []

  if (fixture.risk_level === 'critical') {
    rules.push('deny_by_default_critical_action')
    blocked.push(`critical risk action: ${fixture.requested_action}`)
  }
  if (fixture.risk_level === 'high') {
    rules.push('deny_by_default_high_risk')
    blocked.push(`high risk action: ${fixture.requested_action}`)
  }
  if (fixture.requested_scope === 'external_system' || decision.externalWriteAllowed === false) {
    rules.push('deny_external_write')
    blocked.push('external writes disabled by policy')
  }
  if (decision.stageCAllowed === false) {
    rules.push('stage_c_disabled')
    blocked.push('Stage C disabled — runtime controls not available')
  }
  if (decision.runtimeAllowed === false) {
    rules.push('production_runtime_blocked')
    blocked.push('Production runtime implementation is blocked by policy')
  }
  if (decision.productionActionAllowed === false) {
    rules.push('production_action_blocked')
    blocked.push('Production action not allowed — synthetic dry-run mode')
  }

  rules.push('deny_by_default')

  if (blocked.length === 0) {
    blocked.push('No blocking rules matched — safe readonly')
  }

  return {
    trace_id: hashInput(fixture),
    trace_schema_version: TRACE_SCHEMA_VERSION,
    fixture_id: fixture.fixture_id,
    input_summary: `${fixture.actor_role}@${fixture.requested_scope}:${fixture.requested_action}`,
    matched_rules: [...new Set(rules)],
    blocked_reasons: [...new Set(blocked)],
    stage_c_state: decision.stageCAllowed ? 'allowed' : 'disabled',
    runtime_state: decision.runtimeAllowed ? 'allowed' : 'blocked',
    external_write_state: decision.externalWriteAllowed ? 'allowed' : 'blocked',
    production_action_state: decision.productionActionAllowed ? 'allowed' : 'blocked',
    result: decision,
    created_at: nowIso(),
  }
}
