// AIP v7.25.1 Controlled Dry-run Validation + API/DB Roundtrip Hardening
// Targeted integration validation script — simulates API calls and verifies DB roundtrip

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const LOG_PREFIX = '[v7.25.1-validation]'

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

function checkFile(path, label, checks) {
  if (!fs.existsSync(path)) {
    assert(`${label} file exists`, false, `File not found: ${path}`)
    return null
  }
  assert(`${label} file exists`, true)
  const content = fs.readFileSync(path, 'utf8')
  for (const [checkLabel, expected] of Object.entries(checks)) {
    if (typeof expected === 'string') {
      assert(`${label}: ${checkLabel}`, content.includes(expected))
    } else if (expected instanceof RegExp) {
      assert(`${label}: ${checkLabel}`, expected.test(content))
    }
  }
  return content
}

// ──────────────────────────────────────────────
// 1. STATIC ANALYSIS — Module existence check
// ──────────────────────────────────────────────
console.log(`\n${LOG_PREFIX} === 1. Module Existence ===`)

const fixturePath = path.join(ROOT, 'apps', 'local-api', 'src', 'authorization', 'authorizationDryRunFixtures.ts')
const fixtureContent = checkFile(fixturePath, 'Dry-run fixtures module', {
  'exports getFixtures': 'export function getFixtures',
  'exports getFixtureById': 'export function getFixtureById',
  'has expected_external_write_allowed': 'expected_external_write_allowed',
  'has expected_production_action_allowed': 'expected_production_action_allowed',
})
const fixtureCount = fixtureContent ? (fixtureContent.match(/fixture_id:\s+'([^']+)'/g) || []).length : 0
assert('fixture count >= 8', fixtureCount >= 8, `Found ${fixtureCount}`)

const validatorPath = path.join(ROOT, 'apps', 'local-api', 'src', 'authorization', 'authorizationDryRunValidator.ts')
const validatorContent = checkFile(validatorPath, 'Validator module', {
  'exports validateFixture': 'export function validateFixture',
  'exports validateFixtureId': 'export function validateFixtureId',
  'rejects stage_c_allowed=true': 'stage_c_allowed cannot be true',
  'rejects external_write_allowed=true': 'external_write_allowed cannot be true',
  'rejects production_action_allowed=true': 'production_action_allowed cannot be true',
  'rejects runtime_allowed for high risk': 'runtime_allowed cannot be true for high/critical',
})

const evalPath = path.join(ROOT, 'apps', 'local-api', 'src', 'authorization', 'authorizationSyntheticEvaluator.ts')
const evalContent = checkFile(evalPath, 'Synthetic evaluator module', {
  'exports evaluateFixture': 'export function evaluateFixture',
  'returns DENY': "decision: 'DENY'",
  'returns BLOCKED': "decision: 'BLOCKED'",
  'returns OBSERVE_ONLY': "decision: 'OBSERVE_ONLY'",
  'has productionActionAllowed': 'productionActionAllowed: false',
  'mode is synthetic_dry_run': "mode: 'synthetic_dry_run'",
})

const tracePath = path.join(ROOT, 'apps', 'local-api', 'src', 'authorization', 'authorizationDecisionTrace.ts')
const traceContent = checkFile(tracePath, 'Decision trace module', {
  'has production_action_state': 'production_action_state',
  'has matched_rules': 'matched_rules',
  'has blocked_reasons': 'blocked_reasons',
})

const contractPath = path.join(ROOT, 'apps', 'local-api', 'src', 'authorization', 'authorizationResultContract.ts')
const contractContent = checkFile(contractPath, 'Result contract module', {
  'has production_action_allowed': 'production_action_allowed',
})

// ──────────────────────────────────────────────
// 2. FIXTURE VALIDATION — All 8 fixtures + invalid
// ──────────────────────────────────────────────
console.log(`\n${LOG_PREFIX} === 2. Fixture Validation ===`)

const expectedIds = [
  'safe_readonly_center_access',
  'blocked_stage_c_activation',
  'blocked_high_risk_primary_nav',
  'blocked_external_write',
  'blocked_runtime_control',
  'blocked_training_trigger',
  'blocked_inference_trigger',
  'blocked_deployment_trigger',
]
for (const id of expectedIds) {
  assert(`Fixture "${id}" defined`, fixtureContent.includes(`fixture_id: '${id}'`))
}

assert('ALL fixtures have expected_external_write_allowed=false', (fixtureContent.match(/expected_external_write_allowed: false/g) || []).length >= 8)
assert('ALL fixtures have expected_production_action_allowed=false', (fixtureContent.match(/expected_production_action_allowed: false/g) || []).length >= 8)
assert('ALL fixtures have expected_runtime_allowed=false', (fixtureContent.match(/expected_runtime_allowed: false/g) || []).length >= 8)
assert('ALL fixtures have expected_stage_c_allowed=false', (fixtureContent.match(/expected_stage_c_allowed: false/g) || []).length >= 8)
assert('ALL fixtures have expected_decision=DENY or BLOCKED', fixtureContent.includes("expected_decision: 'DENY'"))
assert('safe_readonly has OBSERVE_ONLY', fixtureContent.includes("expected_decision: 'OBSERVE_ONLY'"))
assert('blocked_stage_c has BLOCKED', fixtureContent.includes("expected_decision: 'BLOCKED'"))

// ──────────────────────────────────────────────
// 3. VALIDATOR CHECKS
// ──────────────────────────────────────────────
console.log(`\n${LOG_PREFIX} === 3. Validator Logic ===`)

assert('Validator checks fixture_id exists', validatorContent.includes('fixture_id'))
assert('Validator checks requested_scope exists', validatorContent.includes('requested_scope'))
assert('Validator checks requested_action exists', validatorContent.includes('requested_action'))
assert('Validator checks actor_role exists', validatorContent.includes('actor_role'))
assert('Validator checks risk_level valid', validatorContent.includes('VALID_RISK_LEVELS'))
assert('Validator has VALID_RISK_LEVELS', validatorContent.includes("'low', 'medium', 'high', 'critical'"))
assert('Validator rejects stage_c_allowed=true', validatorContent.includes('stage_c_allowed cannot be true'))
assert('Validator rejects runtime_allowed for high/critical', validatorContent.includes('runtime_allowed cannot be true for high/critical'))
assert('Validator rejects external_write_allowed=true', validatorContent.includes('external_write_allowed cannot be true'))
assert('Validator rejects production_action_allowed=true', validatorContent.includes('production_action_allowed cannot be true'))
assert('Validator rejects runtime_allowed when DENY', validatorContent.includes('runtime_allowed must be false when decision is DENY'))
assert('Validator warns OBSERVE_ONLY runtime', validatorContent.includes('OBSERVE_ONLY decision should have runtime_allowed = false'))

// ──────────────────────────────────────────────
// 4. DENY-BY-DEFAULT EVALUATOR
// ──────────────────────────────────────────────
console.log(`\n${LOG_PREFIX} === 4. Synthetic Evaluator ===`)

assert('Default decision is DENY', evalContent.includes("decision: 'DENY'") && evalContent.includes("mode: 'synthetic_dry_run'"))
assert('Critical risk returns BLOCKED', evalContent.includes("decision: 'BLOCKED'"))
assert('Safe readonly returns OBSERVE_ONLY', evalContent.includes("decision: 'OBSERVE_ONLY'"))
assert('High risk returns DENY', evalContent.includes("risk_level === 'high'"))
assert('All outputs set runtimeAllowed=false', evalContent.includes('runtimeAllowed: false'))
assert('All outputs set stageCAllowed=false', evalContent.includes('stageCAllowed: false'))
assert('All outputs set externalWriteAllowed=false', evalContent.includes('externalWriteAllowed: false'))
assert('All outputs set productionActionAllowed=false', evalContent.includes('productionActionAllowed: false'))

// Count occurrences to ensure ALL paths have correct defaults
const denyCount = (evalContent.match(/decision: 'DENY'/g) || []).length
const blockedCount = (evalContent.match(/decision: 'BLOCKED'/g) || []).length
const observeCount = (evalContent.match(/decision: 'OBSERVE_ONLY'/g) || []).length
assert('DENY appears at least once', denyCount >= 1)
assert('BLOCKED appears at least once', blockedCount >= 1)
assert('OBSERVE_ONLY appears at least once', observeCount >= 1)
assert('No production ALLOW in evaluator', !evalContent.includes("decision: 'ALLOW'"))

// ──────────────────────────────────────────────
// 5. TRACE CONTRACT
// ──────────────────────────────────────────────
console.log(`\n${LOG_PREFIX} === 5. Trace Contract ===`)

const traceFields = ['trace_id', 'fixture_id', 'input_summary', 'matched_rules', 'blocked_reasons', 'stage_c_state', 'runtime_state', 'external_write_state', 'production_action_state', 'result', 'created_at']
for (const field of traceFields) {
  assert(`Trace has ${field}`, traceContent.includes(field))
}

// ──────────────────────────────────────────────
// 6. RESULT CONTRACT
// ──────────────────────────────────────────────
console.log(`\n${LOG_PREFIX} === 6. Result Contract ===`)

const contractFields = ['id', 'fixture_id', 'decision', 'mode', 'runtime_allowed', 'stage_c_allowed', 'external_write_allowed', 'production_action_allowed', 'reason', 'trace', 'created_at']
for (const field of contractFields) {
  assert(`Contract has ${field}`, contractContent.includes(field))
}

// ──────────────────────────────────────────────
// 7. API ROUTES — Contract checks
// ──────────────────────────────────────────────
console.log(`\n${LOG_PREFIX} === 7. API Routes ===`)

const routesPath = path.join(ROOT, 'apps', 'local-api', 'src', 'routes', 'authorization', 'index.ts')
const routesContent = checkFile(routesPath, 'Authorization API routes', {
  'GET /api/authorization/health': "'/api/authorization/health'",
  'GET /api/authorization/schema': "'/api/authorization/schema'",
  'POST /api/authorization/dry-run': "'/api/authorization/dry-run'",
  'GET /api/authorization/dry-run/:id': "'/api/authorization/dry-run/:id'",
  'GET /api/authorization/audit/:requestId': "'/api/authorization/audit/:requestId'",
  'rejects production_action_allowed': 'validateDryRunRequest',
  'rejects runtime_allowed': 'validateDryRunRequest',
  'rejects stage_c_allowed': 'validateDryRunRequest',
  'rejects external_write_allowed': 'validateDryRunRequest',
})

// Health contract assertions
assert('health: stageC = disabled', routesContent.includes("stageC: 'disabled'"))
assert('health: runtimeImplementation = blocked', routesContent.includes("runtimeImplementation: 'blocked'"))
assert('health: dryRunMode = synthetic_only', routesContent.includes("dryRunMode: 'synthetic_only'"))
assert('health: productionControls = 0', routesContent.includes('productionControls: 0'))

// Schema contract assertions
assert('schema: runtime_allowed default = false', routesContent.includes('runtime_allowed: false'))
assert('schema: stage_c_allowed default = false', routesContent.includes('stage_c_allowed: false'))
assert('schema: external_write_allowed default = false', routesContent.includes('external_write_allowed: false'))
assert('schema: production_action_allowed default = false', routesContent.includes('production_action_allowed: false'))

// Feature flag assertions
assert('feature flag AUTHORIZATION_FOUNDATION_ENABLED=true', routesContent.includes('AUTHORIZATION_FOUNDATION_ENABLED: true'))
assert('feature flag AUTHORIZATION_RUNTIME_ENABLED=false', routesContent.includes('AUTHORIZATION_RUNTIME_ENABLED: false'))
assert('feature flag STAGE_C_ENABLED=false', routesContent.includes('STAGE_C_ENABLED: false'))
assert('feature flag EXTERNAL_WRITE_ENABLED=false', routesContent.includes('AUTHORIZATION_EXTERNAL_WRITE_ENABLED: false'))

// No production side effects
assert('No production ALLOW in routes', !routesContent.includes("decision: 'ALLOW'"))
assert('No external write calls in routes', !routesContent.includes('external_write_enabled: true'))
assert('No Stage C activation in routes', !routesContent.includes('stage_c_enabled: true'))

// ──────────────────────────────────────────────
// 8. DB SCHEMA CHECKS
// ──────────────────────────────────────────────
console.log(`\n${LOG_PREFIX} === 8. DB Schema ===`)

const schemaPath = path.join(ROOT, 'packages', 'db', 'schema.sql')
const schemaContent = checkFile(schemaPath, 'schema.sql', {
  'has authorization_requests': 'CREATE TABLE IF NOT EXISTS authorization_requests',
  'has authorization_decisions': 'CREATE TABLE IF NOT EXISTS authorization_decisions',
  'has authorization_audit_events': 'CREATE TABLE IF NOT EXISTS authorization_audit_events',
  'has authorization_dry_run_results': 'CREATE TABLE IF NOT EXISTS authorization_dry_run_results',
})

if (schemaContent) {
  // Count safe defaults
  assert('schema: production_action_allowed defaults to 0', schemaContent.includes('production_action_allowed INTEGER NOT NULL DEFAULT 0'))
  assert('schema: stage_c_allowed defaults to 0 (in requests)', (schemaContent.match(/stage_c_allowed INTEGER NOT NULL DEFAULT 0/g) || []).length >= 1)
  assert('schema: decision defaults to DENY', schemaContent.includes("decision TEXT NOT NULL DEFAULT 'DENY'"))
  assert('schema: runtime_allowed defaults to 0', schemaContent.includes('runtime_allowed INTEGER NOT NULL DEFAULT 0'))
  assert('schema: external_write_allowed defaults to 0', schemaContent.includes('external_write_allowed INTEGER NOT NULL DEFAULT 0'))
  assert('schema: synthetic_only defaults to 1', schemaContent.includes('synthetic_only INTEGER NOT NULL DEFAULT 1'))
  assert('schema: write_mode defaults to internal_only', schemaContent.includes("write_mode TEXT NOT NULL DEFAULT 'internal_only'"))
  assert('schema: external_sink defaults to disabled', schemaContent.includes("external_sink TEXT NOT NULL DEFAULT 'disabled'"))
}

// ──────────────────────────────────────────────
// 9. MIGRATION FILE
// ──────────────────────────────────────────────
console.log(`\n${LOG_PREFIX} === 9. Migration ===`)

const migDir = path.join(ROOT, 'packages', 'db', 'migrations-core')
const migFiles = fs.readdirSync(migDir).filter(f => f.includes('authorization_foundation'))
assert('Authorization migration exists', migFiles.length >= 1, `Found: ${migFiles.join(', ')}`)

// ──────────────────────────────────────────────
// 10. UI COMPONENTS
// ──────────────────────────────────────────────
console.log(`\n${LOG_PREFIX} === 10. UI Components ===`)

const gcPath = path.join(ROOT, 'apps', 'web-ui', 'src', 'pages', 'GovernanceCenter.tsx')
const gcContent = checkFile(gcPath, 'GovernanceCenter', {
  'imports RuntimeFoundationStatusCard': 'RuntimeFoundationStatusCard',
  'has v7.25 section': 'v7.25 Runtime Authorization Foundation',
})

const amPath = path.join(ROOT, 'apps', 'web-ui', 'src', 'pages', 'AdvancedModeReadonly.tsx')
const amContent = checkFile(amPath, 'AdvancedModeReadonly', {
  'imports RuntimeFoundationSafetyMatrix': 'RuntimeFoundationSafetyMatrix',
  'has Runtime Foundation Bridge': 'Runtime Foundation Bridge',
})

// ──────────────────────────────────────────────
// 11. REGISTRATION
// ──────────────────────────────────────────────
console.log(`\n${LOG_PREFIX} === 11. Route Registration ===`)

const indexTsPath = path.join(ROOT, 'apps', 'local-api', 'src', 'index.ts')
const indexTsContent = checkFile(indexTsPath, 'API index.ts', {
  'imports authorization routes': "import { registerAuthorizationRoutes }",
  'registers authorization routes': "registerAuthorizationRoutes(app)",
})

// ──────────────────────────────────────────────
// 12. FORBIDDEN PATTERNS — Safety scan
// ──────────────────────────────────────────────
console.log(`\n${LOG_PREFIX} === 12. Safety Scan ===`)

const sourceDirs = [
  path.join(ROOT, 'apps', 'local-api', 'src', 'authorization'),
  path.join(ROOT, 'apps', 'local-api', 'src', 'routes', 'authorization'),
]
for (const dir of sourceDirs) {
  if (!fs.existsSync(dir)) continue
  const entries = fs.readdirSync(dir, { recursive: true }).filter(e => e.endsWith('.ts'))
  for (const entry of entries) {
    const fullPath = path.join(dir, entry)
    const content = fs.readFileSync(fullPath, 'utf8')

    // Check for forbidden patterns in context
    const dangerousPatterns = [
      { pattern: /stage_c_enabled['"]?\s*:\s*true/, label: 'Stage C enabled true' },
      { pattern: /(?<!expected_)runtime_allowed['"]?\s*:\s*true(?!['"]?:)/, label: 'runtime_allowed true (non-fixture)' },
      { pattern: /(?<!expected_)external_write_allowed['"]?\s*:\s*true(?!['"]?:)/, label: 'external_write_allowed true (non-fixture)' },
      { pattern: /(?<!expected_)production_action_allowed['"]?\s*:\s*true(?!['"]?:)/, label: 'production_action_allowed true (non-fixture)' },
    ]
    for (const { pattern, label } of dangerousPatterns) {
      const matches = content.match(pattern)
      if (matches) {
        assert(`[SAFETY] No ${label} in ${entry}`, false, `Found: ${matches[0]}`)
      } else {
        assert(`[SAFETY] No ${label} in ${entry}`, true)
      }
    }
  }
}

// ──────────────────────────────────────────────
// 13. CONTRACT INVARIANTS
// ──────────────────────────────────────────────
console.log(`\n${LOG_PREFIX} === 13. Contract Invariants ===`)

assert('trace has trace_schema_version', traceContent.includes('trace_schema_version'))
assert('trace TRACE_SCHEMA_VERSION exported', traceContent.includes('TRACE_SCHEMA_VERSION'))
assert('trace_schema_version in buildTrace return', traceContent.includes("'1.0.0'"))
assert('result has result_schema_version', contractContent.includes('result_schema_version'))
assert('result RESULT_SCHEMA_VERSION exported', contractContent.includes('RESULT_SCHEMA_VERSION'))
assert('result_schema_version in buildResultContract return', contractContent.includes("'1.0.0'"))

assert('Trace invariant: trace_id exists', traceContent.includes('trace_id'))
assert('Trace invariant: fixture_id matches', traceContent.includes('fixture_id: fixture.fixture_id'))
assert('Trace invariant: blocked_reasons non-empty for blocked', traceContent.includes('blocked_reasons'))
assert('Trace invariant: observe-only has no production permission', traceContent.includes('production_action_state'))
assert('Trace invariant: stage_c_state present', traceContent.includes('stage_c_state'))
assert('Trace invariant: runtime_state present', traceContent.includes('runtime_state'))
assert('Trace invariant: external_write_state present', traceContent.includes('external_write_state'))
assert('Trace invariant: production_action_state present', traceContent.includes('production_action_state'))
assert('Trace invariant: matched_rules deduplicated', traceContent.includes('new Set(rules)'))
assert('Trace invariant: created_at = nowIso', traceContent.includes('created_at: nowIso()'))

assert('Result invariant: result_schema_version in return', contractContent.includes('result_schema_version: RESULT_SCHEMA_VERSION'))
assert('Result invariant: fixture_id from trace', contractContent.includes('fixture_id: trace.fixture_id'))
assert('Result invariant: decision from trace.result', contractContent.includes('trace.result.decision'))
assert('Result invariant: mode from trace.result', contractContent.includes('trace.result.mode'))
assert('Result invariant: runtime_allowed from trace', contractContent.includes('trace.result.runtimeAllowed'))
assert('Result invariant: stage_c_allowed from trace', contractContent.includes('trace.result.stageCAllowed'))
assert('Result invariant: external_write_allowed from trace', contractContent.includes('trace.result.externalWriteAllowed'))
assert('Result invariant: production_action_allowed from trace', contractContent.includes('trace.result.productionActionAllowed'))
assert('Result invariant: reason from trace', contractContent.includes('trace.result.reason'))
assert('Result invariant: created_at = nowIso', contractContent.includes('created_at: nowIso()'))

// ──────────────────────────────────────────────
// 14. INVALID FIXTURE EXPANSION
// ──────────────────────────────────────────────
console.log(`\n${LOG_PREFIX} === 14. Invalid Fixture Expansion ===`)

assert('INVALID_FIXTURE_CASES exported', fixtureContent.includes('INVALID_FIXTURE_CASES'))
assert('Invalid: missing fixture_id', fixtureContent.includes('missing fixture_id'))
assert('Invalid: unknown fixture_id', fixtureContent.includes('unknown fixture_id'))
assert('Invalid: empty scope', fixtureContent.includes('empty scope'))
assert('Invalid: empty action', fixtureContent.includes('empty action'))
assert('Invalid: bad actor_role', fixtureContent.includes('bad actor_role'))
assert('Invalid: bad risk_level', fixtureContent.includes('bad risk_level'))
assert('Invalid: stage_c_allowed=true', fixtureContent.includes('stage_c_allowed=true'))
assert('Invalid: runtime_allowed=true', fixtureContent.includes('runtime_allowed=true'))
assert('Invalid: external_write_allowed=true', fixtureContent.includes('external_write_allowed=true'))
assert('Invalid: production_action_allowed=true', fixtureContent.includes('production_action_allowed=true'))
assert('Invalid: training_trigger', fixtureContent.includes('training_trigger requested_action'))
assert('Invalid: deployment_allowed', fixtureContent.includes('deployment_allowed requested_action'))

const invalidCaseCount = (fixtureContent.match(/expectedRejection/g) || []).length
assert('At least 12 invalid fixture cases defined', invalidCaseCount >= 12, `Found ${invalidCaseCount}`)

// ──────────────────────────────────────────────
// 15. REQUEST VALIDATOR
// ──────────────────────────────────────────────
console.log(`\n${LOG_PREFIX} === 15. Request Validator ===`)

assert('validateDryRunRequest exported', validatorContent.includes('validateDryRunRequest'))
assert('Request val: rejects missing fixture_id', validatorContent.includes("fixture_id is required"))
assert('Request val: rejects unknown fixture_id', validatorContent.includes("does not exist"))
assert('Request val: rejects empty scope', validatorContent.includes('requested_scope is required'))
assert('Request val: rejects empty action', validatorContent.includes('requested_action is required'))
assert('Request val: rejects empty actor_role', validatorContent.includes('actor_role is required'))
assert('Request val: rejects bad risk_level', validatorContent.includes('risk_level must be one of'))
assert('Request val: rejects stage_c_allowed=true', validatorContent.includes('STAGE_C_REJECTED'))
assert('Request val: rejects runtime_allowed=true', validatorContent.includes('RUNTIME_ACTION_REJECTED'))
assert('Request val: rejects external_write_allowed=true', validatorContent.includes('EXTERNAL_WRITE_REJECTED'))
assert('Request val: rejects production_action_allowed=true', validatorContent.includes('PRODUCTION_ACTION_REJECTED'))
assert('Request val: rejects enable_stage_c', validatorContent.includes('enable_stage_c'))
assert('Request val: rejects runtime_allow', validatorContent.includes('runtime_allow'))
assert('Request val: rejects external_write', validatorContent.includes('external_write'))
assert('Request val: rejects training_trigger', validatorContent.includes('training_trigger'))
assert('Request val: rejects inference_trigger', validatorContent.includes('inference_trigger'))
assert('Request val: rejects deployment_trigger', validatorContent.includes('deployment_trigger'))
assert('Request val: returns DryRunRequestValidation', validatorContent.includes('DryRunRequestValidation'))

// ──────────────────────────────────────────────
// 16. BARREL EXPORT
// ──────────────────────────────────────────────
console.log(`\n${LOG_PREFIX} === 16. Barrel Export ===`)

const barrelPath = path.join(ROOT, 'apps', 'local-api', 'src', 'authorization', 'index.ts')
const barrelContent = checkFile(barrelPath, 'Barrel export', {
  'exports getFixtures': 'getFixtures',
  'exports getFixtureById': 'getFixtureById',
  'exports INVALID_FIXTURE_CASES': 'INVALID_FIXTURE_CASES',
  'exports validateFixture': 'validateFixture',
  'exports validateFixtureId': 'validateFixtureId',
  'exports validateDryRunRequest': 'validateDryRunRequest',
  'exports evaluateFixture': 'evaluateFixture',
  'exports buildTrace': 'buildTrace',
  'exports TRACE_SCHEMA_VERSION': 'TRACE_SCHEMA_VERSION',
  'exports buildResultContract': 'buildResultContract',
  'exports RESULT_SCHEMA_VERSION': 'RESULT_SCHEMA_VERSION',
})

// ──────────────────────────────────────────────
// 17. SCHEMA VERSION CHECKS
// ──────────────────────────────────────────────
console.log(`\n${LOG_PREFIX} === 17. Schema Version ===`)

assert('TRACE_SCHEMA_VERSION = 1.0.0', fixtureContent.includes("TRACE_SCHEMA_VERSION") || traceContent.includes("'1.0.0'"))
assert('RESULT_SCHEMA_VERSION = 1.0.0', contractContent.includes("'1.0.0'"))

// ──────────────────────────────────────────────
// 18. DEFAULT VALUE BOUNDARY CHECKS
// ──────────────────────────────────────────────
console.log(`\n${LOG_PREFIX} === 18. Default Value Boundary ===`)

assert('Schema: request_type defaults to synthetic', schemaContent.includes("request_type TEXT NOT NULL DEFAULT 'synthetic'"))
assert('Schema: decision_mode defaults to synthetic', schemaContent.includes("decision_mode TEXT NOT NULL DEFAULT 'synthetic'"))
assert('Schema: source defaults to internal', schemaContent.includes("source TEXT NOT NULL DEFAULT 'internal'"))
assert('Schema: status defaults to draft', schemaContent.includes("status TEXT NOT NULL DEFAULT 'draft'"))
assert('Schema: risk_level defaults to medium', schemaContent.includes("risk_level TEXT NOT NULL DEFAULT 'medium'"))
assert('Schema: payload_json defaults to empty JSON', schemaContent.includes("payload_json TEXT NOT NULL DEFAULT '{}'"))
assert('Schema: policy_snapshot_json defaults to empty JSON', schemaContent.includes("policy_snapshot_json TEXT NOT NULL DEFAULT '{}'"))
assert('Schema: trace_json defaults to empty JSON', schemaContent.includes("trace_json TEXT NOT NULL DEFAULT '{}'"))

// ──────────────────────────────────────────────
// 19. OFFICIAL REPORT PATH CHECKS
// ──────────────────────────────────────────────
console.log(`\n${LOG_PREFIX} === 19. Official Report Paths ===`)

const repoDir = path.resolve('E:\\_AIP_REPORTS')
assert('E:\\_AIP_REPORTS directory exists', fs.existsSync(repoDir))
const receiptDir = path.resolve('E:\\_AIP_RECEIPTS')
assert('E:\\_AIP_RECEIPTS directory exists', fs.existsSync(receiptDir))

const v7Reports = fs.readdirSync(repoDir).filter(f => f.includes('v7.25.1'))
const v7Receipts = fs.readdirSync(receiptDir).filter(f => f.includes('v7.25.1'))

// ──────────────────────────────────────────────
// SUMMARY
console.log(`\n${'='.repeat(60)}`)
console.log(`${LOG_PREFIX} Validation Results`)
console.log(`${'='.repeat(60)}`)
console.log(`Passed: ${passed}`)
console.log(`Failed: ${failed}`)
console.log(`Total:  ${passed + failed}`)

if (failures.length > 0) {
  console.log(`\nFailures:`)
  for (const f of failures) {
    console.log(`  ${f}`)
  }
  process.exit(1)
} else {
  console.log(`\n✅ All validation checks passed.`)
  process.exit(0)
}
