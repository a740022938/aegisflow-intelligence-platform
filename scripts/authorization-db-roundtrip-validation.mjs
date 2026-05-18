// AIP v7.25.1 DB Roundtrip Validation Script
// Validates authorization tables: consistency, idempotency, deterministic readback

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const LOG_PREFIX = '[v7.25.1-db-roundtrip]'

let passed = 0
let failed = 0
const failures = []

function assert(label, condition, detail = '') {
  if (condition) {
    passed++
    console.log(`  ✅ ${label}`)
  } else {
    failed++
    const msg = `❌ ${label}${detail ? ` — ${detail}` : ''}`
    failures.push(msg)
    console.log(`  ${msg}`)
  }
}

// ── Verify DB exists with 4 authorization tables ──
console.log(`\n${LOG_PREFIX} Checking DB schema in agi_factory.db...`)

const dbPath = path.join(ROOT, 'packages', 'db', 'agi_factory.db')
assert('DB file exists', fs.existsSync(dbPath))

let tablesInDb = []
try {
  const { DatabaseSync } = await import('node:sqlite')
  const db = new DatabaseSync(dbPath)
  const rows = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'authorization_%' ORDER BY name`).all()
  tablesInDb = rows.map(r => r.name)

  assert('authorization_requests table exists', tablesInDb.includes('authorization_requests'), `Found: ${tablesInDb.join(', ')}`)
  assert('authorization_decisions table exists', tablesInDb.includes('authorization_decisions'))
  assert('authorization_audit_events table exists', tablesInDb.includes('authorization_audit_events'))
  assert('authorization_dry_run_results table exists', tablesInDb.includes('authorization_dry_run_results'))
  assert('Exactly 4 authorization tables', tablesInDb.length === 4, `Found ${tablesInDb.length}`)

  // Check column structure and safe defaults
  for (const table of tablesInDb) {
    const cols = db.prepare(`PRAGMA table_info(${table})`).all()
    assert(`Table ${table} has columns`, cols.length > 0, `${cols.length} columns`)

    if (table === 'authorization_requests') {
      assert(`${table}: production_action_allowed defaults to 0`, cols.some(c => c.name === 'production_action_allowed' && c.dflt_value === '0'))
      assert(`${table}: stage_c_allowed defaults to 0`, cols.some(c => c.name === 'stage_c_allowed' && c.dflt_value === '0'))
      assert(`${table}: status defaults to draft`, cols.some(c => c.name === 'status' && c.dflt_value?.includes('draft')))
      assert(`${table}: request_type defaults to synthetic`, cols.some(c => c.name === 'request_type' && c.dflt_value?.includes('synthetic')))
    }
    if (table === 'authorization_decisions') {
      assert(`${table}: decision defaults to DENY`, cols.some(c => c.name === 'decision' && c.dflt_value?.includes('DENY')))
      assert(`${table}: decision_mode defaults to synthetic`, cols.some(c => c.name === 'decision_mode' && c.dflt_value?.includes('synthetic')))
      assert(`${table}: runtime_allowed defaults to 0`, cols.some(c => c.name === 'runtime_allowed' && c.dflt_value === '0'))
      assert(`${table}: stage_c_allowed defaults to 0`, cols.some(c => c.name === 'stage_c_allowed' && c.dflt_value === '0'))
      assert(`${table}: external_write_allowed defaults to 0`, cols.some(c => c.name === 'external_write_allowed' && c.dflt_value === '0'))
    }
    if (table === 'authorization_audit_events') {
      assert(`${table}: write_mode defaults to internal_only`, cols.some(c => c.name === 'write_mode' && c.dflt_value?.includes('internal_only')))
      assert(`${table}: external_sink defaults to disabled`, cols.some(c => c.name === 'external_sink' && c.dflt_value?.includes('disabled')))
    }
    if (table === 'authorization_dry_run_results') {
      assert(`${table}: synthetic_only defaults to 1`, cols.some(c => c.name === 'synthetic_only' && (c.dflt_value === '1' || c.dflt_value === 1)))
    }
  }

  // ── DB consistency roundtrip (all 8 fixtures) ──
  console.log(`\n${LOG_PREFIX} DB consistency roundtrip (8 fixtures)...`)

  const now = new Date().toISOString()
  const fixtureIds = [
    'safe_readonly_center_access',
    'blocked_stage_c_activation',
    'blocked_high_risk_primary_nav',
    'blocked_external_write',
    'blocked_runtime_control',
    'blocked_training_trigger',
    'blocked_inference_trigger',
    'blocked_deployment_trigger',
  ]

  for (const fixtureId of fixtureIds) {
    const ts = Date.now()
    const reqId = `rt_${fixtureId}_${ts}`

    // 1. INSERT request
    db.prepare(`
      INSERT INTO authorization_requests (id, request_type, requested_scope, requested_action, actor_id, actor_role, source, status, risk_level, payload_json, production_action_allowed, stage_c_allowed, created_at, updated_at)
      VALUES (?, 'synthetic', 'test_scope', 'test_action', 'test_actor', 'test_role', 'dry_run', 'dry_run', 'medium', ?, 0, 0, ?, ?)
    `).run(reqId, JSON.stringify({ fixture_id: fixtureId }), now, now)

    // 2. INSERT decision (linked to request)
    const decId = `dec_${fixtureId}_${ts}`
    db.prepare(`
      INSERT INTO authorization_decisions (id, request_id, decision, decision_mode, reason, policy_snapshot_json, runtime_allowed, stage_c_allowed, external_write_allowed, created_at)
      VALUES (?, ?, 'DENY', 'synthetic_dry_run', 'Test roundtrip', '{}', 0, 0, 0, ?)
    `).run(decId, reqId, now)

    // 3. INSERT audit event (linked to request)
    const auditId = `aev_${fixtureId}_${ts}`
    db.prepare(`
      INSERT INTO authorization_audit_events (id, request_id, event_type, event_source, event_payload_json, write_mode, external_sink, created_at)
      VALUES (?, ?, 'dry_run_executed', 'validation_script', ?, 'internal_only', 'disabled', ?)
    `).run(auditId, reqId, JSON.stringify({ fixture_id: fixtureId, roundtrip: true }), now)

    // 4. INSERT dry_run_result (linked to request + fixture)
    const drId = `dr_${fixtureId}_${ts}`
    db.prepare(`
      INSERT INTO authorization_dry_run_results (id, fixture_id, request_id, result, expected_result, matched, trace_json, synthetic_only, created_at)
      VALUES (?, ?, ?, 'DENY', 'DENY', 1, '{}', 1, ?)
    `).run(drId, fixtureId, reqId, now)

    // ── Readback consistency checks ──
    const request = db.prepare(`SELECT * FROM authorization_requests WHERE id = ?`).get(reqId)
    assert(`Request ${fixtureId}: created and readable`, !!request)
    assert(`Request ${fixtureId}: production_action_allowed=0`, request.production_action_allowed === 0)
    assert(`Request ${fixtureId}: stage_c_allowed=0`, request.stage_c_allowed === 0)
    assert(`Request ${fixtureId}: status=dry_run`, request.status === 'dry_run')
    assert(`Request ${fixtureId}: created_at is populated`, !!request.created_at)

    const decision = db.prepare(`SELECT * FROM authorization_decisions WHERE id = ?`).get(decId)
    assert(`Decision ${fixtureId}: created and readable`, !!decision)
    assert(`Decision ${fixtureId}: request_id matches`, decision.request_id === reqId, `${decision.request_id} !== ${reqId}`)
    assert(`Decision ${fixtureId}: runtime_allowed=0`, decision.runtime_allowed === 0)
    assert(`Decision ${fixtureId}: stage_c_allowed=0`, decision.stage_c_allowed === 0)
    assert(`Decision ${fixtureId}: external_write_allowed=0`, decision.external_write_allowed === 0)
    assert(`Decision ${fixtureId}: decision=DENY`, decision.decision === 'DENY')
    assert(`Decision ${fixtureId}: created_at is populated`, !!decision.created_at)

    // ── Cross-table consistency: decision FK to request ──
    const reqFromDec = db.prepare(`SELECT id FROM authorization_requests WHERE id = ?`).get(decision.request_id)
    assert(`Consistency ${fixtureId}: decision.request_id points to existing request`, !!reqFromDec)

    const audit = db.prepare(`SELECT * FROM authorization_audit_events WHERE id = ?`).get(auditId)
    assert(`Audit ${fixtureId}: created and readable`, !!audit)
    assert(`Audit ${fixtureId}: request_id matches request`, audit.request_id === reqId)
    assert(`Audit ${fixtureId}: write_mode=internal_only`, audit.write_mode === 'internal_only')
    assert(`Audit ${fixtureId}: external_sink=disabled`, audit.external_sink === 'disabled')
    assert(`Audit ${fixtureId}: created_at is populated`, !!audit.created_at)

    const reqFromAudit = db.prepare(`SELECT id FROM authorization_requests WHERE id = ?`).get(audit.request_id)
    assert(`Consistency ${fixtureId}: audit.request_id points to existing request`, !!reqFromAudit)

    const result = db.prepare(`SELECT * FROM authorization_dry_run_results WHERE id = ?`).get(drId)
    assert(`Result ${fixtureId}: created and readable`, !!result)
    assert(`Result ${fixtureId}: request_id matches request`, result.request_id === reqId)
    assert(`Result ${fixtureId}: fixture_id matches fixtureId`, result.fixture_id === fixtureId)
    assert(`Result ${fixtureId}: synthetic_only=1`, result.synthetic_only === 1)
    assert(`Result ${fixtureId}: created_at is populated`, !!result.created_at)

    const reqFromResult = db.prepare(`SELECT id FROM authorization_requests WHERE id = ?`).get(result.request_id)
    assert(`Consistency ${fixtureId}: result.request_id points to existing request`, !!reqFromResult)

    // ── Deterministic readback: re-read gives same data ──
    const request2 = db.prepare(`SELECT * FROM authorization_requests WHERE id = ?`).get(reqId)
    assert(`Deterministic ${fixtureId}: request re-read is identical`, JSON.stringify(request) === JSON.stringify(request2))

    const decision2 = db.prepare(`SELECT * FROM authorization_decisions WHERE id = ?`).get(decId)
    assert(`Deterministic ${fixtureId}: decision re-read is identical`, JSON.stringify(decision) === JSON.stringify(decision2))

    // ── Clean up ──
    db.prepare(`DELETE FROM authorization_dry_run_results WHERE id = ?`).run(drId)
    db.prepare(`DELETE FROM authorization_audit_events WHERE id = ?`).run(auditId)
    db.prepare(`DELETE FROM authorization_decisions WHERE id = ?`).run(decId)
    db.prepare(`DELETE FROM authorization_requests WHERE id = ?`).run(reqId)
  }

  // ── Idempotency test: same fixture creates multiple results ──
  console.log(`\n${LOG_PREFIX} Idempotency test (same fixture, multiple results)...`)

  const idemReqId = `idem_req_${Date.now()}`
  db.prepare(`
    INSERT INTO authorization_requests (id, request_type, requested_scope, requested_action, actor_id, actor_role, source, status, risk_level, payload_json, production_action_allowed, stage_c_allowed, created_at, updated_at)
    VALUES (?, 'synthetic', 'idem_scope', 'idem_action', 'idem_actor', 'idem_role', 'dry_run', 'dry_run', 'low', '{}', 0, 0, ?, ?)
  `).run(idemReqId, now, now)

  const idemFixture = 'safe_readonly_center_access'
  const idemResultIds = []
  for (let i = 0; i < 3; i++) {
    const drId = `idem_dr_${i}_${Date.now()}`
    db.prepare(`
      INSERT INTO authorization_dry_run_results (id, fixture_id, request_id, result, expected_result, matched, trace_json, synthetic_only, created_at)
      VALUES (?, ?, ?, 'OBSERVE_ONLY', 'OBSERVE_ONLY', 1, '{}', 1, ?)
    `).run(drId, idemFixture, idemReqId, now)
    idemResultIds.push(drId)
  }

  for (const drId of idemResultIds) {
    const r = db.prepare(`SELECT * FROM authorization_dry_run_results WHERE id = ?`).get(drId)
    assert(`Idempotency: result ${drId} exists`, !!r)
    assert(`Idempotency: result fixture_id matches`, r.fixture_id === idemFixture)
    assert(`Idempotency: result request_id matches`, r.request_id === idemReqId)
    assert(`Idempotency: result synthetic_only=1`, r.synthetic_only === 1)
    assert(`Idempotency: result created_at populated`, !!r.created_at)
  }

  const allIdemResults = db.prepare(`SELECT * FROM authorization_dry_run_results WHERE request_id = ?`).all(idemReqId)
  assert(`Idempotency: ${idemResultIds.length} results found for same request`, allIdemResults.length === 3, `Found ${allIdemResults.length}`)

  const allIdemByFixture = db.prepare(`SELECT * FROM authorization_dry_run_results WHERE fixture_id = ?`).all(idemFixture)
  assert(`Idempotency: >= ${idemResultIds.length} results for same fixture`, allIdemByFixture.length >= 3, `Found ${allIdemByFixture.length}`)

  for (const drId of idemResultIds) {
    db.prepare(`DELETE FROM authorization_dry_run_results WHERE id = ?`).run(drId)
  }
  db.prepare(`DELETE FROM authorization_requests WHERE id = ?`).run(idemReqId)

  // ── Boundary: DEFAULT values are used when columns omitted ──
  console.log(`\n${LOG_PREFIX} Default value boundary checks...`)

  const defReqId = `def_req_${Date.now()}`
  db.prepare(`
    INSERT INTO authorization_requests (id, created_at, updated_at)
    VALUES (?, ?, ?)
  `).run(defReqId, now, now)

  const defReq = db.prepare(`SELECT * FROM authorization_requests WHERE id = ?`).get(defReqId)
  assert(`Default: request_type defaults to synthetic`, defReq.request_type === 'synthetic')
  assert(`Default: status defaults to draft`, defReq.status === 'draft')
  assert(`Default: risk_level defaults to medium`, defReq.risk_level === 'medium')
  assert(`Default: production_action_allowed defaults to 0`, defReq.production_action_allowed === 0)
  assert(`Default: stage_c_allowed defaults to 0`, defReq.stage_c_allowed === 0)
  assert(`Default: payload_json defaults to {}`, defReq.payload_json === '{}')
  db.prepare(`DELETE FROM authorization_requests WHERE id = ?`).run(defReqId)

  const defDecId = `def_dec_${Date.now()}`
  db.prepare(`
    INSERT INTO authorization_decisions (id, request_id, created_at)
    VALUES (?, ?, ?)
  `).run(defDecId, idemReqId, now)

  const defDec = db.prepare(`SELECT * FROM authorization_decisions WHERE id = ?`).get(defDecId)
  assert(`Default: decision defaults to DENY`, defDec.decision === 'DENY')
  assert(`Default: runtime_allowed defaults to 0`, defDec.runtime_allowed === 0)
  assert(`Default: stage_c_allowed defaults to 0`, defDec.stage_c_allowed === 0)
  assert(`Default: external_write_allowed defaults to 0`, defDec.external_write_allowed === 0)
  db.prepare(`DELETE FROM authorization_decisions WHERE id = ?`).run(defDecId)

  db.close()
} catch (err) {
  assert('DB roundtrip initial connection', false, `Error: ${err.message}`)
  console.error(err)
}

// Verify migration file exists
const migDir = path.join(ROOT, 'packages', 'db', 'migrations-core')
const migFiles = fs.readdirSync(migDir).filter(f => f.includes('authorization_foundation'))
assert('Migration file exists for authorization foundation', migFiles.length >= 1, `Found: ${migFiles.join(', ')}`)

// ── Summary ──
console.log(`\n${'='.repeat(60)}`)
console.log(`${LOG_PREFIX} DB Roundtrip Validation Results`)
console.log(`${'='.repeat(60)}`)
console.log(`Passed: ${passed}`)
console.log(`Failed: ${failed}`)
console.log(`Total:  ${passed + failed}`)
console.log(`\nIdempotency policy: Strategy A — same fixture can create multiple results, each with unique id, all synthetic_only, no production side effect`)

if (failures.length > 0) {
  console.log(`\nFailures:`)
  for (const f of failures) {
    console.log(`  ${f}`)
  }
  process.exit(1)
} else {
  console.log(`\n✅ All DB roundtrip checks passed.`)
  process.exit(0)
}
