import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const API = process.env.AIP_API || 'http://127.0.0.1:8787';
const root = path.resolve(import.meta.dirname, '..');
const localApiRequire = createRequire(path.join(root, 'apps/local-api/package.json'));
const Fastify = localApiRequire('fastify');

let passed = 0;
let failed = 0;
let skipped = 0;
let authToken = '';

class SkipError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SkipError';
  }
}

async function check(name, fn) {
  try {
    await fn();
    console.log(`PASS: ${name}`);
    passed++;
  } catch (err) {
    if (err instanceof SkipError) {
      console.log(`SKIP: ${name} - ${err.message}`);
      skipped++;
      return;
    }
    console.error(`FAIL: ${name} - ${err?.message || err}`);
    failed++;
  }
}

async function login() {
  if (authToken) return authToken;
  const username = process.env.AIP_SMOKE_USERNAME || 'admin';
  const password = process.env.AIP_SMOKE_PASSWORD;
  if (!password) {
    throw new SkipError('AIP_SMOKE_PASSWORD is not set');
  }
  const response = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) throw new Error(`login HTTP ${response.status}`);
  const data = await response.json();
  if (!data?.token) throw new Error('login token missing');
  authToken = data.token;
  return authToken;
}

async function fetchJson(pathname) {
  const token = await login();
  const response = await fetch(`${API}${pathname}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`${pathname} HTTP ${response.status}`);
  return response.json();
}

async function makeAssistantApp() {
  const routeModule = await import('../apps/local-api/src/routes/assistant-center/index.ts');
  const registerAssistantCenterRoutes = routeModule.registerAssistantCenterRoutes || routeModule.default?.registerAssistantCenterRoutes;
  if (typeof registerAssistantCenterRoutes !== 'function') {
    throw new Error('registerAssistantCenterRoutes export missing');
  }
  const app = Fastify({ logger: false });
  registerAssistantCenterRoutes(app);
  await app.ready();
  return app;
}

function assertSourceContains(file, checks) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  for (const expected of checks) {
    if (!text.includes(expected)) {
      throw new Error(`${file} missing marker: ${expected}`);
    }
  }
}

async function main() {
  console.log('=== AIP v7.3.0-rc2 Boundary Smoke ===\n');

  const assistant = await makeAssistantApp();

  await check('assistant-center status', async () => {
    const r = await assistant.inject({ method: 'GET', url: '/api/assistant-center/status' });
    if (r.statusCode !== 200) throw new Error(`HTTP ${r.statusCode}`);
    const data = r.json();
    if (!data.ok || !Array.isArray(data.items)) throw new Error('invalid status payload');
  });

  await check('assistant-center full-check', async () => {
    const r = await assistant.inject({ method: 'POST', url: '/api/assistant-center/full-check', payload: {} });
    if (r.statusCode !== 200) throw new Error(`HTTP ${r.statusCode}`);
    const data = r.json();
    if (!data.ok) throw new Error(`full-check not ok`);
    // Check if high risk source is ONLY claude-proxy → known external dependency, not release blocker
    const highChecks = (data.checks || []).filter(c => c.riskLevel === 'high');
    const coreHigh = highChecks.filter(c => c.id !== 'claude-proxy');
    if (coreHigh.length > 0) throw new Error(`core high-risk: ${coreHigh.map(c => c.id).join(', ')}`);
    if (highChecks.length > 0) {
      console.log(`  WARN: external high-risk (non-blocking): ${highChecks.map(c => c.id).join(', ')}`);
    }
  });

  await check('assistant-center tools', async () => {
    const r = await assistant.inject({ method: 'GET', url: '/api/assistant-center/tools' });
    if (r.statusCode !== 200) throw new Error(`HTTP ${r.statusCode}`);
    const data = r.json();
    if (!data.ok || !data.items?.some((item) => item.id === 'npm')) throw new Error('npm tool row missing');
  });

  await check('assistant-center reports', async () => {
    const r = await assistant.inject({ method: 'GET', url: '/api/assistant-center/reports?limit=3' });
    if (r.statusCode !== 200) throw new Error(`HTTP ${r.statusCode}`);
    const data = r.json();
    if (!data.ok || !Array.isArray(data.items)) throw new Error('invalid reports payload');
  });

  await check('assistant-center task-package', async () => {
    const r = await assistant.inject({
      method: 'POST',
      url: '/api/assistant-center/task-package',
      payload: { taskType: 'aip-readonly-audit' },
    });
    if (r.statusCode !== 200) throw new Error(`HTTP ${r.statusCode}`);
    const data = r.json();
    if (!data.ok || !data.text?.includes('AIP')) throw new Error('invalid task package payload');
  });

  await check('assistant-center safety-boundary', async () => {
    const r = await assistant.inject({ method: 'GET', url: '/api/assistant-center/safety-boundary' });
    if (r.statusCode !== 200) throw new Error(`HTTP ${r.statusCode}`);
    const data = r.json();
    if (!data.ok || !Array.isArray(data.items)) throw new Error('invalid safety-boundary payload');
  });

  await check('assistant-center version', async () => {
    const r = await assistant.inject({ method: 'GET', url: '/api/assistant-center/version' });
    if (r.statusCode !== 200) throw new Error(`HTTP ${r.statusCode}`);
    const data = r.json();
    if (!data.ok || !data.version) throw new Error('invalid version payload');
  });

  await assistant.close();

  await check('data-chain frame-extractions GET', async () => {
    const data = await fetchJson('/api/frame-extractions?limit=1');
    if (!data.ok || !Array.isArray(data.frame_extractions)) throw new Error('invalid frame-extractions payload');
  });

  await check('data-chain yolo-annotations GET', async () => {
    const data = await fetchJson('/api/yolo-annotations?limit=1');
    if (!data.ok || !Array.isArray(data.yolo_annotations)) throw new Error('invalid yolo-annotations payload');
  });

  await check('data-chain sam-segmentations GET', async () => {
    const data = await fetchJson('/api/sam-segmentations?limit=1');
    if (!data.ok || !Array.isArray(data.sam_segmentations)) throw new Error('invalid sam-segmentations payload');
  });

  await check('real-execution boundary markers', async () => {
    assertSourceContains('apps/local-api/src/workflow/index.ts', [
      'Explicit mock simulation is required',
      "status: simulated ? 'simulated' : 'completed'",
      'mockCheckpoint',
      'mockArtifact',
    ]);
    assertSourceContains('apps/local-api/src/training/index.ts', [
      'explicit mock simulation is required',
      "'simulated'",
      'mockArtifact',
      'mockCheckpoint',
    ]);
  });

  console.log(`\n=== Results: ${passed} passed, ${failed} failed, ${skipped} skipped ===`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Smoke test fatal error:', err);
  process.exit(1);
});
