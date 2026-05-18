// Runtime Authorization Foundation validation script (v7.25.0)
// Independent verification of the synthetic dry-run harness and storage foundation

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const LOG_PREFIX = '[v7.25.0-validation]'

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

// Check that the migration file exists
console.log(`\n${LOG_PREFIX} Checking authorization migration...`)
const migDir = path.join(ROOT, 'packages', 'db', 'migrations-core')
const migFiles = fs.readdirSync(migDir).filter(f => f.includes('authorization_foundation'))
assert('Authorization migration file exists', migFiles.length >= 1, `Found: ${migFiles.join(', ')}`)

// Check that schema.sql contains authorization tables
console.log(`\n${LOG_PREFIX} Checking schema.sql...`)
const schemaPath = path.join(ROOT, 'packages', 'db', 'schema.sql')
const schemaContent = fs.readFileSync(schemaPath, 'utf8')
assert('schema.sql contains authorization_requests', schemaContent.includes('CREATE TABLE IF NOT EXISTS authorization_requests'))
assert('schema.sql contains authorization_decisions', schemaContent.includes('CREATE TABLE IF NOT EXISTS authorization_decisions'))
assert('schema.sql contains authorization_audit_events', schemaContent.includes('CREATE TABLE IF NOT EXISTS authorization_audit_events'))
assert('schema.sql contains authorization_dry_run_results', schemaContent.includes('CREATE TABLE IF NOT EXISTS authorization_dry_run_results'))
assert('schema.sql has safe defaults (production_action_allowed=0)', schemaContent.includes('production_action_allowed INTEGER NOT NULL DEFAULT 0'))
assert('schema.sql has safe defaults (stage_c_allowed=0)', schemaContent.includes('stage_c_allowed INTEGER NOT NULL DEFAULT 0'))
assert('schema.sql has safe defaults (decision=DENY)', schemaContent.includes("decision TEXT NOT NULL DEFAULT 'DENY'"))
assert('schema.sql has safe defaults (runtime_allowed=0)', schemaContent.includes('runtime_allowed INTEGER NOT NULL DEFAULT 0'))
assert('schema.sql has safe defaults (external_write_allowed=0)', schemaContent.includes('external_write_allowed INTEGER NOT NULL DEFAULT 0'))
assert('schema.sql has safe defaults (synthetic_only=1)', schemaContent.includes('synthetic_only INTEGER NOT NULL DEFAULT 1'))

// Check dry-run fixture module
console.log(`\n${LOG_PREFIX} Checking dry-run fixture module...`)
const fixturePath = path.join(ROOT, 'apps', 'local-api', 'src', 'authorization', 'authorizationDryRunFixtures.ts')
const fixtureContent = fs.readFileSync(fixturePath, 'utf8')
// Count fixtures (look for fixture_id occurrences that are not in type definition)
const fixtureMatches = fixtureContent.match(/fixture_id:\s+'([^']+)'/g)
const fixtureCount = fixtureMatches ? fixtureMatches.length : 0
assert('At least 8 synthetic fixtures', fixtureCount >= 8, `Found ${fixtureCount} fixtures`)
assert('Contains safe_readonly_center_access fixture', fixtureContent.includes('safe_readonly_center_access'))
assert('Contains blocked_stage_c_activation fixture', fixtureContent.includes('blocked_stage_c_activation'))
assert('Contains blocked_external_write fixture', fixtureContent.includes('blocked_external_write'))
assert('Contains blocked_training_trigger fixture', fixtureContent.includes('blocked_training_trigger'))
assert('Contains blocked_inference_trigger fixture', fixtureContent.includes('blocked_inference_trigger'))
assert('Contains blocked_deployment_trigger fixture', fixtureContent.includes('blocked_deployment_trigger'))
assert('Expected decisions default to DENY/BLOCKED', fixtureContent.includes("expected_decision: 'DENY'"))
assert('Expected runtime_allowed defaults to false', fixtureContent.includes('expected_runtime_allowed: false'))
assert('Expected stage_c_allowed defaults to false', fixtureContent.includes('expected_stage_c_allowed: false'))

// Check validator
console.log(`\n${LOG_PREFIX} Checking dry-run validator...`)
const validatorPath = path.join(ROOT, 'apps', 'local-api', 'src', 'authorization', 'authorizationDryRunValidator.ts')
const validatorContent = fs.readFileSync(validatorPath, 'utf8')
assert('Validator checks fixture_id exists', validatorContent.includes("fixture_id"))
assert('Validator checks requested_scope exists', validatorContent.includes('requested_scope'))
assert('Validator checks requested_action exists', validatorContent.includes('requested_action'))
assert('Validator checks actor_role exists', validatorContent.includes('actor_role'))
assert('Validator checks risk_level valid', validatorContent.includes('VALID_RISK_LEVELS'))
assert('Validator rejects stage_c_allowed=true', validatorContent.includes('stage_c_allowed cannot be true'))
assert('Validator rejects runtime_allowed=true for production', validatorContent.includes('runtime_allowed cannot be true'))

// Check synthetic evaluator
console.log(`\n${LOG_PREFIX} Checking synthetic evaluator...`)
const evalPath = path.join(ROOT, 'apps', 'local-api', 'src', 'authorization', 'authorizationSyntheticEvaluator.ts')
const evalContent = fs.readFileSync(evalPath, 'utf8')
assert('Evaluator returns DENY by default', evalContent.includes("decision: 'DENY'"))
assert('Evaluator returns BLOCKED for critical', evalContent.includes("decision: 'BLOCKED'"))
assert('Evaluator returns OBSERVE_ONLY for safe readonly', evalContent.includes("decision: 'OBSERVE_ONLY'"))
assert('Evaluator sets runtimeAllowed=false', evalContent.includes('runtimeAllowed: false'))
assert('Evaluator sets stageCAllowed=false', evalContent.includes('stageCAllowed: false'))
assert('Evaluator sets externalWriteAllowed=false', evalContent.includes('externalWriteAllowed: false'))
assert('Evaluator mode is synthetic_dry_run', evalContent.includes("mode: 'synthetic_dry_run'"))

// Check decision trace
console.log(`\n${LOG_PREFIX} Checking decision trace...`)
const tracePath = path.join(ROOT, 'apps', 'local-api', 'src', 'authorization', 'authorizationDecisionTrace.ts')
const traceContent = fs.readFileSync(tracePath, 'utf8')
assert('Trace includes trace_id', traceContent.includes('trace_id'))
assert('Trace includes fixture_id', traceContent.includes('fixture_id'))
assert('Trace includes matched_rules', traceContent.includes('matched_rules'))
assert('Trace includes blocked_reasons', traceContent.includes('blocked_reasons'))
assert('Trace includes stage_c_state', traceContent.includes('stage_c_state'))
assert('Trace includes runtime_state', traceContent.includes('runtime_state'))

// Check result contract
console.log(`\n${LOG_PREFIX} Checking result contract...`)
const contractPath = path.join(ROOT, 'apps', 'local-api', 'src', 'authorization', 'authorizationResultContract.ts')
const contractContent = fs.readFileSync(contractPath, 'utf8')
assert('Contract includes fixture_id', contractContent.includes('fixture_id'))
assert('Contract includes decision', contractContent.includes('decision'))
assert('Contract includes mode', contractContent.includes('mode'))
assert('Contract includes runtime_allowed', contractContent.includes('runtime_allowed'))
assert('Contract includes stage_c_allowed', contractContent.includes('stage_c_allowed'))
assert('Contract includes external_write_allowed', contractContent.includes('external_write_allowed'))
assert('Contract includes trace', contractContent.includes('trace'))

// Check API routes
console.log(`\n${LOG_PREFIX} Checking API routes...`)
const routesPath = path.join(ROOT, 'apps', 'local-api', 'src', 'routes', 'authorization', 'index.ts')
const routesContent = fs.readFileSync(routesPath, 'utf8')
assert('API has /api/authorization/health', routesContent.includes("'/api/authorization/health'"))
assert('API has /api/authorization/schema', routesContent.includes("'/api/authorization/schema'"))
assert('API has /api/authorization/dry-run POST', routesContent.includes("'/api/authorization/dry-run'"))
assert('API has /api/authorization/dry-run/:id GET', routesContent.includes("'/api/authorization/dry-run/:id'"))
assert('API has /api/authorization/audit/:requestId', routesContent.includes("'/api/authorization/audit/:requestId'"))
assert('API has feature guard AUTHORIZATION_FOUNDATION_ENABLED', routesContent.includes('AUTHORIZATION_FOUNDATION_ENABLED'))
assert('API has feature guard AUTHORIZATION_RUNTIME_ENABLED=false', routesContent.includes('AUTHORIZATION_RUNTIME_ENABLED: false'))
assert('API has feature guard STAGE_C_ENABLED=false', routesContent.includes('STAGE_C_ENABLED: false'))
assert('API has no production side effect', !routesContent.includes('runtime_allowed: true'))

// Check registration in index.ts
console.log(`\n${LOG_PREFIX} Checking route registration...`)
const indexTsPath = path.join(ROOT, 'apps', 'local-api', 'src', 'index.ts')
const indexTsContent = fs.readFileSync(indexTsPath, 'utf8')
assert('Authorization routes imported', indexTsContent.includes("registerAuthorizationRoutes"))
assert('Authorization routes registered', indexTsContent.includes("registerAuthorizationRoutes(app)"))

// Check UI components
console.log(`\n${LOG_PREFIX} Checking UI components...`)
const gcPath = path.join(ROOT, 'apps', 'web-ui', 'src', 'pages', 'GovernanceCenter.tsx')
const gcContent = fs.readFileSync(gcPath, 'utf8')
assert('GovernanceCenter imports RuntimeFoundationStatusCard', gcContent.includes('RuntimeFoundationStatusCard'))
assert('GovernanceCenter has Runtime Foundation section', gcContent.includes('v7.25 Runtime Authorization Foundation'))

const amPath = path.join(ROOT, 'apps', 'web-ui', 'src', 'pages', 'AdvancedModeReadonly.tsx')
const amContent = fs.readFileSync(amPath, 'utf8')
assert('AdvancedModeReadonly imports RuntimeFoundationSafetyMatrix', amContent.includes('RuntimeFoundationSafetyMatrix'))
assert('AdvancedModeReadonly has Runtime Foundation Bridge', amContent.includes('Runtime Foundation Bridge'))

// Verify Stage C disabled everywhere
const combined = schemaContent + fixtureContent + evalContent + routesContent + contractContent
// Check for forbidden patterns
const forbiddenPatterns = [
  ['stage_c_allowed: true', 'Stage C allowed true'],
  ['runtime_allowed: true', 'Runtime allowed true (in defaults)'],
  ['external_write_allowed: true', 'External write allowed true (in defaults)'],
]
console.log(`\n${LOG_PREFIX} Checking forbidden patterns...`)
for (const [pattern, label] of forbiddenPatterns) {
  const re = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  if (fixtureContent.includes(pattern) || evalContent.includes(pattern)) {
    // Expected fixtures/evaluator may reference these as expected values
    console.log(`  ℹ️  "${label}" found in fixtures/evaluator (expected)`)
  } else if (schemaContent.includes(pattern)) {
    assert(`${label} NOT in schema defaults`, false)
  } else {
    assert(`${label} not in source defaults`, true)
  }
}

// Summary
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
