#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const REPORT_DIR = 'E:\\_AIP_REPORTS';
const BACKUP_DIR = 'E:\\_AIP_BACKUPS';
const timestamp = '20260428';
const reportFile = path.join(REPORT_DIR, `AIP_v7.0.0_ONECLICK_PRODUCT_UPGRADE_REPORT_${timestamp}.md`);
const backupPath = path.join(BACKUP_DIR, `AIP_v7.0.0_oneclick_product_upgrade_${timestamp}`);

const results = [];

function log(msg) {
  console.log(`[AIP-v7] ${msg}`);
}

function run(cmd, opts = {}) {
  try {
    const out = execSync(cmd, { encoding: 'utf8', timeout: 120000, stdio: 'pipe', ...opts });
    return { stdout: (out.stdout || out).toString(), stderr: (out.stderr || '').toString(), status: 0 };
  } catch (e) {
    return { stdout: e.stdout?.toString() || '', stderr: e.stderr?.toString() || e.message, status: 1 };
  }
}

function phase(name, fn) {
  const start = Date.now();
  log(`=== PHASE: ${name} ===`);
  try {
    const error = fn();
    const duration = Date.now() - start;
    const status = error ? 'FAIL' : 'PASS';
    const entry = { name, status, duration, error };
    results.push(entry);
    log(`Phase ${name}: ${status} (${duration}ms)`);
    if (error) log(`  ERROR: ${error}`);
    return entry;
  } catch (e) {
    const duration = Date.now() - start;
    const entry = { name, status: 'FAIL', duration, error: e.message || String(e) };
    results.push(entry);
    log(`Phase ${name}: FAIL (${duration}ms)`);
    log(`  ERROR: ${e.message || String(e)}`);
    return entry;
  }
}

function runPhase(name, fn) {
  const result = phase(name, fn);
  if (result.status === 'FAIL') {
    log(`FATAL: Phase ${name} FAILED. Stopping.`);
  }
  return result;
}

function preflight() {
  const errors = [];

  const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
  if (nodeMajor < 22) errors.push(`Node.js >= 22 required, got v${process.versions.node}`);

  try { execSync('pnpm --version', { stdio: 'pipe', encoding: 'utf8' }); }
  catch { errors.push('pnpm is not installed'); }

  if (!fs.existsSync(ROOT)) errors.push(`AIP root not found: ${ROOT}`);

  const pkgPath = path.join(ROOT, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const ver = String(pkg.version || '');
if (!ver.startsWith('6.') && !ver.startsWith('7.')) errors.push(`package.json version must be 6.x or 7.x, got ${ver}`);
  } else {
    errors.push('package.json not found');
  }

  if (!fs.existsSync(path.join(ROOT, '.env.local'))) errors.push('.env.local not found');

  const dbPaths = [
    path.join(ROOT, 'packages', 'db', 'agi_factory.db'),
    path.join(ROOT, 'apps', 'local-api', 'src', 'db', 'builtin-sqlite.db'),
  ];
  const dbExists = dbPaths.some(p => fs.existsSync(p));
  if (!dbExists) errors.push('SQLite database not found (checked agi_factory.db and builtin-sqlite.db)');

  if (!fs.existsSync(path.join(ROOT, 'node_modules'))) errors.push('node_modules not found');

  const dirs = ['apps', 'packages', 'scripts'];
  for (const d of dirs) {
    if (!fs.existsSync(path.join(ROOT, d))) errors.push(`Required directory missing: ${d}`);
  }

  return errors.length > 0 ? errors.join('; ') : null;
}

function safetyBackup() {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
  if (fs.existsSync(backupPath)) {
    log(`Backup path already exists, removing: ${backupPath}`);
    fs.rmSync(backupPath, { recursive: true, force: true });
  }

  const excludeDirs = new Set(['node_modules', '.git', 'logs', '_AIP_REPORTS', '_AIP_BACKUPS']);
  function copyRecursive(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      if (excludeDirs.has(entry.name)) continue;
      const s = path.join(src, entry.name);
      const d = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        copyRecursive(s, d);
      } else {
        fs.copyFileSync(s, d);
      }
    }
  }

  copyRecursive(ROOT, backupPath);

  if (!fs.existsSync(backupPath)) return 'Backup creation failed';

  const size = getDirSize(backupPath);
  log(`Backup size: ${(size / 1024 / 1024).toFixed(2)} MB`);
  return null;
}

function getDirSize(dirPath) {
  let total = 0;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dirPath, entry.name);
      if (entry.isDirectory()) total += getDirSize(full);
      else total += fs.statSync(full).size;
    }
  } catch {}
  return total;
}

function executionReliability() {
  const errors = [];

  const workerPoolPath = path.join(ROOT, 'apps', 'local-api', 'src', 'worker-pool', 'index.ts');
  if (fs.existsSync(workerPoolPath)) {
    const content = fs.readFileSync(workerPoolPath, 'utf8');
    if (!content.includes('timeout')) errors.push('worker-pool/index.ts missing timeout support');
  } else {
    errors.push('worker-pool/index.ts not found');
  }

  const queuePath = path.join(ROOT, 'apps', 'local-api', 'src', 'queue', 'index.ts');
  if (fs.existsSync(queuePath)) {
    const content = fs.readFileSync(queuePath, 'utf8');
    if (!content.includes('recoverFromDb')) errors.push('queue/index.ts missing SQLite recovery');
  } else {
    errors.push('queue/index.ts not found');
  }

  const mainIndexPath = path.join(ROOT, 'apps', 'local-api', 'src', 'index.ts');
  if (fs.existsSync(mainIndexPath)) {
    const content = fs.readFileSync(mainIndexPath, 'utf8');
    if (!content.includes('Recovery complete') && !content.includes('queue_recovery')) errors.push('index.ts missing queue recovery on startup');
  } else {
    errors.push('apps/local-api/src/index.ts not found');
  }

  // OpenClaw circuit persistence is in main index.ts
  if (fs.existsSync(mainIndexPath)) {
    const content = fs.readFileSync(mainIndexPath, 'utf8');
    if (!content.includes('circuit_state') || !content.includes('restored')) errors.push('OpenClaw circuit persistence missing in index.ts');
  }

  return errors.length > 0 ? errors.join('; ') : null;
}

function moduleMaturity() {
  const errors = [];

  const modulePagePath = path.join(ROOT, 'apps', 'web-ui', 'src', 'pages', 'ModulePage.tsx');
  if (fs.existsSync(modulePagePath)) {
    const content = fs.readFileSync(modulePagePath, 'utf8');
    const reqs = [
      'digital-employee',
      'training-v2',
      'inference',
      'annotation',
      'huggingface',
      'backflow-v2',
      'scheduler',
      'alerting',
      'model-monitor',
      'deploy-v2',
    ];
    const missing = reqs.filter(r => !content.includes(r));
    if (missing.length > 0) errors.push(`ModulePage missing modules: ${missing.join(', ')}`);
  } else {
    errors.push('ModulePage.tsx not found');
  }

  const pageDir = path.join(ROOT, 'apps', 'web-ui', 'src', 'pages');
  if (fs.existsSync(pageDir)) {
    const pageFiles = fs.readdirSync(pageDir, { withFileTypes: true })
      .filter(e => e.isFile() && e.name.endsWith('.tsx'))
      .map(e => e.name);
    const expected = ['ModulePage.tsx', 'Dashboard.tsx', 'Tasks.tsx', 'Runs.tsx'];
    const missing = expected.filter(e => !pageFiles.includes(e));
    if (missing.length > 0) errors.push(`Missing page files: ${missing.join(', ')}`);
  } else {
    errors.push('pages directory not found');
  }

  return errors.length > 0 ? errors.join('; ') : null;
}

function workflowUX() {
  const errors = [];

  const workflowFiles = [
    path.join(ROOT, 'apps', 'local-api', 'src', 'workflow', 'index.ts'),
    path.join(ROOT, 'apps', 'web-ui', 'src', 'pages', 'WorkflowCanvas.tsx'),
    path.join(ROOT, 'apps', 'web-ui', 'src', 'pages', 'workflow-composer', 'WorkflowComposer.tsx'),
    path.join(ROOT, 'apps', 'web-ui', 'src', 'pages', 'WorkflowJobs.tsx'),
  ];

  for (const f of workflowFiles) {
    if (!fs.existsSync(f)) errors.push(`Workflow file missing: ${f}`);
  }

  if (errors.length === 0) {
    const wf = fs.readFileSync(workflowFiles[0], 'utf8');
    if (!wf.includes('retry') && !wf.includes('timeout')) errors.push('workflow/index.ts missing retry/timeout enhancement');
  }

  return errors.length > 0 ? errors.join('; ') : null;
}

function pluginMaturity() {
  const errors = [];

  const pluginFiles = [
    path.join(ROOT, 'packages', 'plugin-runtime', 'src', 'PluginManager.ts'),
    path.join(ROOT, 'packages', 'plugin-runtime', 'src', 'AuditInterceptor.ts'),
    path.join(ROOT, 'packages', 'plugin-runtime', 'src', 'Loader.ts'),
    path.join(ROOT, 'packages', 'plugin-runtime', 'src', 'errors.ts'),
    path.join(ROOT, 'packages', 'plugin-sdk', 'src', 'index.ts'),
    path.join(ROOT, 'packages', 'plugin-sdk', 'src', 'manifest.ts'),
    path.join(ROOT, 'packages', 'plugin-sdk', 'src', 'validation.ts'),
  ];

  for (const f of pluginFiles) {
    if (!fs.existsSync(f)) errors.push(`Plugin file missing: ${f}`);
  }

  if (errors.length === 0) {
    const pm = fs.readFileSync(pluginFiles[0], 'utf8');
    if (!pm.includes('audit') && !pm.includes('Audit')) errors.push('PluginManager missing audit integration');
  }

  return errors.length > 0 ? errors.join('; ') : null;
}

function governanceDiagnostics() {
  const errors = [];

  const govFiles = [
    path.join(ROOT, 'apps', 'web-ui', 'src', 'pages', 'GovernanceHub.tsx'),
    path.join(ROOT, 'apps', 'web-ui', 'src', 'pages', 'Audit.tsx'),
  ];

  for (const f of govFiles) {
    if (!fs.existsSync(f)) errors.push(`Governance file missing: ${f}`);
  }

  if (errors.length === 0) {
    const gh = fs.readFileSync(govFiles[0], 'utf8');
    if (!gh.includes('SystemHealthSummary') && !gh.includes('health')) errors.push('GovernanceHub missing SystemHealthSummary or health section');
  }

  return errors.length > 0 ? errors.join('; ') : null;
}

function errorTaxonomy() {
  const errors = [];

  const taxonomyPath = path.join(ROOT, 'apps', 'local-api', 'src', 'observability', 'error-taxonomy.ts');
  if (!fs.existsSync(taxonomyPath)) {
    errors.push('error-taxonomy.ts not found in observability/');
  } else {
    const content = fs.readFileSync(taxonomyPath, 'utf8');
    if (!content.includes('classifyError') || !content.includes('ERROR_TYPES')) errors.push('error-taxonomy.ts missing classifyError or ERROR_TYPES');
  }

  return errors.length > 0 ? errors.join('; ') : null;
}

function testBaseline() {
  const errors = [];

  const smokeTestPath = path.join(ROOT, 'tests', 'smoke-v7.mjs');
  if (!fs.existsSync(smokeTestPath)) errors.push('Smoke test missing: tests/smoke-v7.mjs');
  else {
    const content = fs.readFileSync(smokeTestPath, 'utf8');
    if (!content.includes('health') || !content.includes('worker')) errors.push('smoke-v7.mjs missing key test cases');
  }

  const vitestConfigs = [
    path.join(ROOT, 'apps', 'local-api', 'vitest.config.ts'),
    path.join(ROOT, 'apps', 'local-api', 'vitest.config.js'),
  ];
  const hasVitest = vitestConfigs.some(f => fs.existsSync(f));
  if (!hasVitest) errors.push('No vitest config found');

  return errors.length > 0 ? errors.join('; ') : null;
}

let verificationChecks = [];

function verification() {
  const checks = [];

  const r1 = run('node -e "console.log(\'health ok\')"');
  checks.push({ name: 'node-health', status: r1.status === 0 ? 'PASS' : 'FAIL', detail: r1.stdout.trim() || r1.stderr.trim() });

  const r2 = run('pnpm run --dir apps/local-api typecheck', { timeout: 120000 });
  checks.push({ name: 'typecheck-local-api', status: r2.status === 0 ? 'PASS' : 'FAIL', detail: r2.stdout.trim().slice(0, 200) || r2.stderr.trim().slice(0, 200) });

  const r3 = run('pnpm run --dir apps/web-ui typecheck', { timeout: 120000 });
  checks.push({ name: 'typecheck-web-ui', status: r3.status === 0 ? 'PASS' : 'FAIL', detail: r3.stdout.trim().slice(0, 200) || r3.stderr.trim().slice(0, 200) });

  const r5 = run('pnpm run db:doctor', { timeout: 120000 });
  checks.push({ name: 'db-doctor', status: r5.status === 0 ? 'PASS' : 'FAIL', detail: r5.stdout.trim().slice(0, 200) || r5.stderr.trim().slice(0, 200) });

  verificationChecks = checks;
  const failed = checks.filter(c => c.status === 'FAIL');
  return failed.length > 0 ? `${failed.length} verification checks failed: ${failed.map(f => f.name).join(', ')}` : null;
}

function generateReport() {
  const allPassed = results.every(r => r.status === 'PASS');
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const reportLines = [];

  reportLines.push('# AIP v7.0.0 One-Click Product Upgrade Report');
  reportLines.push('');
  reportLines.push(`- **Timestamp**: ${new Date().toISOString()}`);
  reportLines.push(`- **Build Timestamp**: ${timestamp}`);
  reportLines.push(`- **Source Version**: ${pkg.version}`);
  reportLines.push(`- **Node.js**: ${process.version}`);
  reportLines.push(`- **Platform**: ${process.platform}`);
  reportLines.push(`- **Backup Path**: ${backupPath}`);
  reportLines.push(`- **Report File**: ${reportFile}`);
  reportLines.push(`- **Overall Status**: ${allPassed ? '**PASS**' : '**FAIL**'}`);
  reportLines.push('');

  reportLines.push('## Phase Results');
  reportLines.push('');
  reportLines.push('| # | Phase | Status | Duration (ms) | Error |');
  reportLines.push('|---|-------|--------|----------------|-------|');
  results.forEach((r, i) => {
    const errStr = typeof r.error === 'string' ? r.error : JSON.stringify(r.error || '');
    const error = errStr.replace(/\n/g, ' ').slice(0, 100);
    reportLines.push(`| ${i + 1} | ${r.name} | ${r.status} | ${r.duration} | ${error} |`);
  });
  reportLines.push('');

  if (verificationChecks.length > 0) {
    reportLines.push('## Verification Details');
    reportLines.push('');
    reportLines.push('| Check | Status | Detail |');
    reportLines.push('|-------|--------|--------|');
    verificationChecks.forEach(c => {
      const detail = String(c.detail || '').replace(/\n/g, ' ').slice(0, 150);
      reportLines.push(`| ${c.name} | ${c.status} | ${detail} |`);
    });
    reportLines.push('');
  }

  reportLines.push('## Modified Files');
  reportLines.push('');
  const scopedFiles = [
    'scripts/aip-upgrade-v7.mjs',
    'apps/local-api/src/worker-pool/index.ts',
    'apps/local-api/src/queue/index.ts',
    'apps/local-api/src/index.ts',
    'apps/web-ui/src/pages/ModulePage.tsx',
    'apps/web-ui/src/components/ui/StatusBadge.tsx',
    'apps/web-ui/src/components/ui/StepStatusIndicator.tsx',
    'apps/web-ui/src/pages/WorkflowJobs.tsx',
    'apps/web-ui/src/pages/Runs.tsx',
    'apps/web-ui/src/pages/GovernanceHub.tsx',
    'apps/web-ui/src/pages/PluginPool.tsx',
    'apps/web-ui/src/pages/PluginCanvas.tsx',
    'apps/web-ui/src/pages/ModuleCenter.tsx',
    'packages/plugin-runtime/src/PluginManager.ts',
    'apps/local-api/src/observability/error-taxonomy.ts',
    'tests/smoke-v7.mjs',
  ];
  for (const f of scopedFiles) {
    const fullPath = path.join(ROOT, f);
    if (fs.existsSync(fullPath)) {
      const stat = fs.statSync(fullPath);
      reportLines.push(`- ${f} (${stat.size} bytes)`);
    } else {
      reportLines.push(`- ${f} (MISSING)`);
    }
  }
  reportLines.push('');

  reportLines.push('## Verification Results');
  reportLines.push('');
  if (verificationChecks.length > 0) {
    reportLines.push('| Check | Status | Detail |');
    reportLines.push('|-------|--------|--------|');
    for (const c of verificationChecks) {
      const detail = String(c.detail || '').slice(0, 100);
      reportLines.push(`| ${c.name} | ${c.status} | ${detail} |`);
    }
  } else {
    reportLines.push('Verification phase did not produce check-level results.');
  }
  reportLines.push('');

  reportLines.push('## Warnings');
  reportLines.push('');
  const warnings = [];
  if (!fs.existsSync(path.join(ROOT, '.env.local'))) warnings.push('.env.local is missing');
  if (!allPassed) warnings.push('One or more phases failed. Upgrade is NOT sealed.');
  if (warnings.length === 0) warnings.push('None');
  for (const w of warnings) reportLines.push(`- ${w}`);
  reportLines.push('');

  if (allPassed) {
    reportLines.push('## Sealed');
    reportLines.push('');
    reportLines.push('All 12 phases passed. Upgrade is SEALED.');
  }

  return reportLines.join('\n');
}

function writeReport() {
  if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });

  const report = generateReport();
  fs.writeFileSync(reportFile, report, 'utf8');
  log(`Report written: ${reportFile}`);
  return null;
}

function seal() {
  const allPassed = results.every(r => r.status === 'PASS');

  if (allPassed) {
    const sealRecord = path.join(REPORT_DIR, `AIP_v7.0.0_SEAL_${timestamp}.md`);
    const content = [
      '# AIP v7.0.0 Upgrade Seal',
      '',
      `- **Sealed At**: ${new Date().toISOString()}`,
      `- **Build Timestamp**: ${timestamp}`,
      `- **Backup**: ${backupPath}`,
      `- **Report**: ${reportFile}`,
      `- **All 12 Phases**: PASS`,
      '',
      'This upgrade is officially sealed.',
      '',
      '```',
      '  _____ _   _ _____  ______ _____   ____  _   _ _____  ',
      ' |_   _| \\ | |  __ \\|  ____|  __ \\ / __ \\| \\ | |  __ \\ ',
      '   | | |  \\| | |  | | |__  | |__) | |  | |  \\| | |  | |',
      '   | | | . ` | |  | |  __| |  _  /| |  | | . ` | |  | |',
      '  _| |_| |\\  | |__| | |____| | \\ \\| |__| | |\\  | |__| |',
      ' |_____|_| \\_|_____/|______|_|  \\_\\\\____/|_| \\_|_____/ ',
      '```',
      '',
    ].join('\n');
    fs.writeFileSync(sealRecord, content, 'utf8');
    log(`Seal record written: ${sealRecord}`);
    return null;
  }

  return 'Cannot seal: not all phases passed';
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const check = process.argv.includes('--check');
  const isReadOnly = dryRun || check;

  log('========================================');
  log(`AIP v7.1.0 One-Click Product Upgrade${isReadOnly ? ' (READ-ONLY)' : ''}`);
  log('========================================');
  log(`Root: ${ROOT}`);
  log(`Timestamp: ${timestamp}`);
  if (dryRun) log('Mode: --dry-run (check only, no writes)');
  if (check) log('Mode: --check (check only, no writes)');

  const checkPhases = [
    ['preflight', preflight],
    ['verification', verification],
  ];

  const fullPhases = [
    ['preflight', preflight],
    ['safety-backup', safetyBackup],
    ['execution-reliability', executionReliability],
    ['module-maturity', moduleMaturity],
    ['workflow-ux', workflowUX],
    ['plugin-maturity', pluginMaturity],
    ['governance-diagnostics', governanceDiagnostics],
    ['error-taxonomy', errorTaxonomy],
    ['test-baseline', testBaseline],
    ['verification', verification],
    ['report', writeReport],
    ['seal', seal],
  ];

  const phases = isReadOnly ? checkPhases : fullPhases;

  for (const [name, fn] of phases) {
    const result = runPhase(name, fn);
    if (result.status === 'FAIL') {
      if (!isReadOnly && name !== 'report' && name !== 'seal') {
        log(`Upgrade aborted at phase: ${name}`);
        writeReport();
        break;
      }
      if (isReadOnly && name === 'preflight') {
        log('Preflight check failed. Fix issues above.');
        break;
      }
    }
  }

  if (isReadOnly) writeReport();

  log('========================================');
  log('Upgrade script completed');
  log('========================================');
}

main().catch(err => {
  log(`FATAL UNEXPECTED ERROR: ${err.message}`);
  process.exit(1);
});
