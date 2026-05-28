import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { createRequire } from 'node:module';

const root = path.resolve(import.meta.dirname, '..');
const localApiRequire = createRequire(path.join(root, 'apps/local-api/package.json'));
const Fastify = localApiRequire('fastify');

async function makeAssistantApp() {
  const routeModule = await import('../apps/local-api/src/routes/assistant-center/index.ts');
  const registerAssistantCenterRoutes = routeModule.registerAssistantCenterRoutes || routeModule.default?.registerAssistantCenterRoutes;
  assert.equal(typeof registerAssistantCenterRoutes, 'function');
  const app = Fastify({ logger: false });
  registerAssistantCenterRoutes(app);
  await app.ready();
  return app;
}

test('assistant-center full-check contract mode separates route checks from live runtime readiness', async () => {
  const app = await makeAssistantApp();
  try {
    const response = await app.inject({
      method: 'POST',
      url: '/api/assistant-center/full-check',
      payload: { probeMode: 'contract' },
    });
    assert.equal(response.statusCode, 200);
    const data = response.json();
    assert.equal(data.ok, true);
    assert.equal(data.probeMode, 'contract');

    const coreLiveIds = new Set(['aip-api', 'aip-web', 'openclaw']);
    const coreHigh = (data.checks || []).filter((item) => coreLiveIds.has(item.id) && item.riskLevel === 'high');
    assert.deepEqual(coreHigh.map((item) => item.id), []);
    assert.match(data.warnings.join('\n'), /contract mode/i);
  } finally {
    await app.close();
  }
});
