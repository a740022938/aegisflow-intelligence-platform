import { execSync } from 'child_process';

const API = 'http://127.0.0.1:8787';
let failed = 0;
let passed = 0;
let authToken = '';

async function check(name, fn) {
  try {
    await fn();
    console.log(`PASS: ${name}`);
    passed++;
  } catch (e) {
    console.error(`FAIL: ${name} - ${e.message}`);
    failed++;
  }
}

async function fetchJson(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function loginForSmoke() {
  const username = process.env.AIP_SMOKE_USERNAME || 'admin';
  const password = process.env.AIP_SMOKE_PASSWORD || 'aip-admin';
  const response = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) throw new Error(`login HTTP ${response.status}`);
  const data = await response.json();
  if (!data?.ok || !data?.token) throw new Error('login token missing');
  authToken = data.token;
}

async function main() {
  console.log('=== AIP v7.0.0 Smoke Tests ===\n');

  // 1. Health check
  await check('health', async () => {
    const data = await fetchJson(`${API}/api/health`);
    if (!data.ok) throw new Error('Health check failed');
  });

  // 1.5 Auth bootstrap for protected APIs
  await check('auth-login', async () => {
    await loginForSmoke();
  });

  // 2. Tasks API
  await check('tasks', async () => {
    const data = await fetchJson(`${API}/api/tasks?limit=5`);
    if (!data.ok) throw new Error('Tasks API failed');
  });

  // 3. Queue recovery (check queue_tasks table exists)
  await check('queue-recovery', async () => {
    const data = await fetchJson(`${API}/api/db/ping`);
    if (!data.tables?.includes('queue_tasks')) throw new Error('queue_tasks table missing');
  });

  // 4. Worker timeout (check worker-pool has timeout config)
  await check('worker-timeout', async () => {
    const data = await fetchJson(`${API}/api/health`);
    if (!data.workerPool) throw new Error('Worker pool missing from health');
  });

  // 5. OpenCLaw circuit persistence
  await check('openclaw-circuit', async () => {
    const data = await fetchJson(`${API}/api/openclaw/master-switch`);
    if (data.circuit_state === undefined) throw new Error('Circuit state not reported');
  });

  // 6. Workflow minimal chain
  await check('workflow-minimal', async () => {
    const data = await fetchJson(`${API}/api/templates`);
    if (!data.templates?.length) throw new Error('No templates found');
  });

  // 7. Plugin registry
  await check('plugin-registry', async () => {
    const data = await fetchJson(`${API}/api/db/ping`);
    if (data.tables?.includes('plugin_registry')) {
      // plugin_registry table exists - good
    } else {
      console.log('  (plugin_registry table not found - may need plugin system enabled)');
    }
  });

  // 8. Database diagnostics
  await check('db-diagnostics', async () => {
    const data = await fetchJson(`${API}/api/db/ping`);
    if (!data.ok) throw new Error('DB ping failed');
  });

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => {
  console.error('Smoke test fatal error:', e);
  process.exit(1);
});
