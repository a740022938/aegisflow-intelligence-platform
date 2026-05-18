import type { DecisionTrace } from './authorizationDecisionTrace.js'

export const RESULT_SCHEMA_VERSION = '1.0.0'

export interface ResultContract {
  id: string
  result_schema_version: string
  fixture_id: string
  decision: string
  mode: string
  runtime_allowed: boolean
  stage_c_allowed: boolean
  external_write_allowed: boolean
  production_action_allowed: boolean
  reason: string
  trace: DecisionTrace
  created_at: string
}

function nowIso(): string {
  return new Date().toISOString()
}

function generateId(): string {
  return `dr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function buildResultContract(trace: DecisionTrace): ResultContract {
  return {
    id: generateId(),
    result_schema_version: RESULT_SCHEMA_VERSION,
    fixture_id: trace.fixture_id,
    decision: trace.result.decision,
    mode: trace.result.mode,
    runtime_allowed: trace.result.runtimeAllowed,
    stage_c_allowed: trace.result.stageCAllowed,
    external_write_allowed: trace.result.externalWriteAllowed,
    production_action_allowed: trace.result.productionActionAllowed,
    reason: trace.result.reason,
    trace,
    created_at: nowIso(),
  }
}
