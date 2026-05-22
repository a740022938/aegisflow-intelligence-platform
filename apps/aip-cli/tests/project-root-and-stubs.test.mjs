import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';

function runCli(args, cwd = 'C:\\Users\\74002') {
  return execSync(`node E:\\AIP\\apps\\aip-cli\\dist\\index.js ${args}`, { cwd, encoding: 'utf8' });
}

test('resolver prefers AIP_HOME when valid', async () => {
  const old = process.env.AIP_HOME;
  process.env.AIP_HOME = 'E:\\AIP';
  const mod = await import('../dist/projectRoot.js');
  const r = mod.resolveProjectRoot('C:\\Users\\74002');
  assert.equal(r.source, 'env');
  assert.equal(r.projectRoot, 'E:\\AIP');
  process.env.AIP_HOME = old;
});

test('status lines no stale track', async () => {
  const mod = await import('../dist/banner.js');
  assert.equal(mod.renderStatusLines('7.62.0').join('\n').includes('v7.48 Local RC Candidate'), false);
});

test('five v8 commands show readonly contract', () => {
  for (const c of ['runtime', 'agents', 'integrations', 'providers', 'apps']) {
    const out = runCli(c);
    assert.match(out, /OpenAIP v8 Foundation Command/);
    assert.match(out, /Status: readonly foundation stub/);
    assert.match(out, /Safety: no mutation, no runtime action, Gate CLOSED, Stage C disabled/);
    assert.match(out, /not implemented/);
  }
});

test('help for five v8 commands does not claim implemented features', () => {
  for (const c of ['runtime', 'agents', 'integrations', 'providers', 'apps']) {
    const out = runCli(`help ${c}`);
    assert.match(out, /readonly|只读|not implemented|foundation/i);
  }
});
