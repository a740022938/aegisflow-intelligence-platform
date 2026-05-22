import test from 'node:test';
import assert from 'node:assert/strict';

test('resolver prefers AIP_HOME when valid', async () => {
  const old = process.env.AIP_HOME;
  process.env.AIP_HOME = 'E:\\AIP';
  const mod = await import('../dist/projectRoot.js');
  const r = mod.resolveProjectRoot('C:\\Users\\74002');
  assert.equal(r.source, 'env');
  assert.equal(r.projectRoot, 'E:\\AIP');
  process.env.AIP_HOME = old;
});

test('resolver can use marker fallback', async () => {
  const old = process.env.AIP_HOME;
  delete process.env.AIP_HOME;
  const mod = await import('../dist/projectRoot.js');
  const r = mod.resolveProjectRoot('C:\\Users\\74002');
  assert.ok(['marker', 'upward-search', 'config', 'cwd-fallback', 'env'].includes(r.source));
  process.env.AIP_HOME = old;
});

test('status lines no longer contain stale v7.48 track', async () => {
  const mod = await import('../dist/banner.js');
  const lines = mod.renderStatusLines('7.62.0').join('\n');
  assert.equal(lines.includes('v7.48 Local RC Candidate'), false);
});

test('v8 stubs are exported', async () => {
  const cmds = await Promise.all([
    import('../dist/commands/runtime.js'),
    import('../dist/commands/agents.js'),
    import('../dist/commands/integrations.js'),
    import('../dist/commands/providers.js'),
    import('../dist/commands/apps.js'),
  ]);
  assert.equal(typeof cmds[0].runRuntime, 'function');
  assert.equal(typeof cmds[1].runAgents, 'function');
  assert.equal(typeof cmds[2].runIntegrations, 'function');
  assert.equal(typeof cmds[3].runProviders, 'function');
  assert.equal(typeof cmds[4].runApps, 'function');
});
