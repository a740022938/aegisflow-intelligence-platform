import type { FastifyInstance } from 'fastify'
import * as db from '../../db/builtin-sqlite.js'
import {
  getFixtures,
  getFixtureById,
  validateFixture,
  evaluateFixture,
  buildTrace,
  buildResultContract,
} from '../../authorization/index.js'

const FEATURE_FLAGS = {
  AUTHORIZATION_FOUNDATION_ENABLED: true,
  AUTHORIZATION_RUNTIME_ENABLED: false,
  STAGE_C_ENABLED: false,
  AUTHORIZATION_EXTERNAL_WRITE_ENABLED: false,
}

function nowIso(): string {
  return new Date().toISOString()
}

export function registerAuthorizationRoutes(app: FastifyInstance) {
  app.get('/api/authorization/health', async (_request, reply) => {
    return {
      authorizationFoundation: 'available',
      stageC: 'disabled',
      runtimeImplementation: 'blocked',
      dryRunMode: 'synthetic_only',
      productionControls: 0,
      featureFlags: FEATURE_FLAGS,
    }
  })

  app.get('/api/authorization/schema', async (_request, reply) => {
    return {
      tables: [
        {
          name: 'authorization_requests',
          fields: ['id', 'request_type', 'requested_scope', 'requested_action', 'actor_id', 'actor_role', 'source', 'status', 'risk_level', 'payload_json', 'production_action_allowed', 'stage_c_allowed', 'created_at', 'updated_at'],
          safeDefaults: { production_action_allowed: false, stage_c_allowed: false, status: 'draft' },
        },
        {
          name: 'authorization_decisions',
          fields: ['id', 'request_id', 'decision', 'decision_mode', 'reason', 'policy_snapshot_json', 'runtime_allowed', 'stage_c_allowed', 'external_write_allowed', 'created_at'],
          safeDefaults: { decision: 'DENY', decision_mode: 'synthetic', runtime_allowed: false, stage_c_allowed: false, external_write_allowed: false },
        },
        {
          name: 'authorization_audit_events',
          fields: ['id', 'request_id', 'event_type', 'event_source', 'event_payload_json', 'write_mode', 'external_sink', 'created_at'],
          safeDefaults: { write_mode: 'internal_only', external_sink: 'disabled' },
        },
        {
          name: 'authorization_dry_run_results',
          fields: ['id', 'fixture_id', 'request_id', 'result', 'expected_result', 'matched', 'trace_json', 'synthetic_only', 'created_at'],
          safeDefaults: { synthetic_only: true },
        },
      ],
      runtimeFlags: {
        authorization_runtime_enabled: FEATURE_FLAGS.AUTHORIZATION_RUNTIME_ENABLED,
        stage_c_enabled: FEATURE_FLAGS.STAGE_C_ENABLED,
        external_write_enabled: FEATURE_FLAGS.AUTHORIZATION_EXTERNAL_WRITE_ENABLED,
      },
      stageCFlags: {
        stage_c_enabled: false,
        stage_c_activation_toggle_added: false,
        stage_c_activation_allowed: false,
      },
    }
  })

  app.post('/api/authorization/dry-run', async (request: any, reply) => {
    const body = request.body || {}
    const fixtureId = String(body.fixture_id || '').trim()

    if (!fixtureId) {
      const allFixtures = getFixtures()
      return {
        ok: true,
        mode: 'synthetic_only',
        note: 'No fixture_id provided — returning summary',
        fixtureCount: allFixtures.length,
        fixtures: allFixtures.map(f => ({
          fixture_id: f.fixture_id,
          actor_role: f.actor_role,
          requested_scope: f.requested_scope,
          requested_action: f.requested_action,
          risk_level: f.risk_level,
        })),
        featureFlags: FEATURE_FLAGS,
      }
    }

    const fixture = getFixtureById(fixtureId)
    if (!fixture) {
      return reply.code(404).send({
        ok: false,
        error: `FIXTURE_NOT_FOUND`,
        message: `Fixture "${fixtureId}" not found`,
        availableFixtures: getFixtures().map(f => f.fixture_id),
      })
    }

    const validation = validateFixture(fixture)
    if (!validation.valid) {
      return reply.code(400).send({
        ok: false,
        error: 'FIXTURE_VALIDATION_FAILED',
        message: `Fixture "${fixtureId}" validation failed`,
        errors: validation.errors,
        warnings: validation.warnings,
      })
    }

    if (!FEATURE_FLAGS.AUTHORIZATION_FOUNDATION_ENABLED) {
      return reply.code(503).send({
        ok: false,
        error: 'AUTHORIZATION_FOUNDATION_DISABLED',
        message: 'Authorization foundation is disabled',
      })
    }

    const decision = evaluateFixture(fixture)
    const trace = buildTrace(fixture, decision)
    const contract = buildResultContract(trace)

    try {
      const ddb = db.getDatabase()
      const requestId = `syn_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
      ddb.prepare(`
        INSERT INTO authorization_requests (id, request_type, requested_scope, requested_action, actor_id, actor_role, source, status, risk_level, payload_json, production_action_allowed, stage_c_allowed, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        requestId,
        'synthetic',
        fixture.requested_scope,
        fixture.requested_action,
        fixture.actor,
        fixture.actor_role,
        'dry_run',
        'dry_run',
        fixture.risk_level,
        JSON.stringify({ fixture_id: fixture.fixture_id }),
        decision.runtimeAllowed ? 1 : 0,
        decision.stageCAllowed ? 1 : 0,
        nowIso(),
        nowIso(),
      )

      const decisionId = `dec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
      ddb.prepare(`
        INSERT INTO authorization_decisions (id, request_id, decision, decision_mode, reason, policy_snapshot_json, runtime_allowed, stage_c_allowed, external_write_allowed, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        decisionId,
        requestId,
        decision.decision,
        'synthetic_dry_run',
        decision.reason,
        JSON.stringify({ mode: 'deny_by_default', foundation_enabled: true }),
        decision.runtimeAllowed ? 1 : 0,
        decision.stageCAllowed ? 1 : 0,
        decision.externalWriteAllowed ? 1 : 0,
        nowIso(),
      )

      ddb.prepare(`
        INSERT INTO authorization_dry_run_results (id, fixture_id, request_id, result, expected_result, matched, trace_json, synthetic_only, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        contract.id,
        fixture.fixture_id,
        requestId,
        decision.decision,
        fixture.expected_decision,
        decision.decision === fixture.expected_decision ? 1 : 0,
        JSON.stringify(trace),
        1,
        nowIso(),
      )

      ddb.prepare(`
        INSERT INTO authorization_audit_events (id, request_id, event_type, event_source, event_payload_json, write_mode, external_sink, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `aev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        requestId,
        'dry_run_executed',
        'authorization_api',
        JSON.stringify({ fixture_id: fixture.fixture_id, decision: decision.decision }),
        'internal_only',
        'disabled',
        nowIso(),
      )

      return {
        ok: true,
        result: contract,
        matched: decision.decision === fixture.expected_decision,
        expected: fixture.expected_decision,
        featureFlags: FEATURE_FLAGS,
      }
    } catch (err: any) {
      return reply.code(500).send({
        ok: false,
        error: 'DRY_RUN_WRITE_FAILED',
        message: String(err?.message || err),
        result: contract,
        matched: decision.decision === fixture.expected_decision,
        expected: fixture.expected_decision,
        featureFlags: FEATURE_FLAGS,
      })
    }
  })

  app.get('/api/authorization/dry-run/:id', async (request: any, reply) => {
    const id = request.params.id
    try {
      const ddb = db.getDatabase()
      const row = ddb.prepare(`SELECT * FROM authorization_dry_run_results WHERE id = ?`).get(id) as any
      if (!row) {
        return reply.code(404).send({ ok: false, error: 'DRY_RUN_RESULT_NOT_FOUND', message: `Dry-run result "${id}" not found` })
      }
      return {
        ok: true,
        result: {
          id: row.id,
          fixture_id: row.fixture_id,
          request_id: row.request_id,
          result: row.result,
          expected_result: row.expected_result,
          matched: !!row.matched,
          trace: (() => { try { return JSON.parse(row.trace_json) } catch { return row.trace_json } })(),
          synthetic_only: !!row.synthetic_only,
          created_at: row.created_at,
        },
      }
    } catch (err: any) {
      return reply.code(500).send({ ok: false, error: 'DRY_RUN_READ_FAILED', message: String(err?.message || err) })
    }
  })

  app.get('/api/authorization/audit/:requestId', async (request: any, reply) => {
    const requestId = request.params.requestId
    try {
      const ddb = db.getDatabase()
      const rows = ddb.prepare(`SELECT * FROM authorization_audit_events WHERE request_id = ? ORDER BY created_at DESC`).all(requestId) as any[]
      return {
        ok: true,
        events: rows.map((row: any) => ({
          id: row.id,
          request_id: row.request_id,
          event_type: row.event_type,
          event_source: row.event_source,
          event_payload: (() => { try { return JSON.parse(row.event_payload_json) } catch { return row.event_payload_json } })(),
          write_mode: row.write_mode,
          external_sink: row.external_sink,
          created_at: row.created_at,
        })),
        count: rows.length,
      }
    } catch (err: any) {
      return reply.code(500).send({ ok: false, error: 'AUDIT_READ_FAILED', message: String(err?.message || err) })
    }
  })
}
