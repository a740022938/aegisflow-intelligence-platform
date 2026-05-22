import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';

function runCli(args, cwd = 'C:\\Users\\74002') {
  return execSync(`node E:\\AIP\\apps\\aip-cli\\dist\\index.js ${args}`, { cwd, encoding: 'utf8' });
}

function runNode(script) {
  return execSync(`node ${script}`, { cwd: 'E:\\AIP', encoding: 'utf8' });
}

test('status lines no stale track', async () => {
  const mod = await import('../dist/banner.js');
  assert.equal(mod.renderStatusLines('7.62.0').join('\n').includes('v7.48 Local RC Candidate'), false);
});

test('v8 list/status commands show readonly source and classify entities', () => {
  const checks = [
    ['agents list', /OpenClaw/, /Source: example\/static readonly registry/],
    ['providers list', /Ollama/, /Source: example\/static readonly registry/],
    ['integrations list', /GitHub/, /Source: example\/static readonly registry/],
    ['apps list', /OpenAxiom/, /kind=local_app/],
    ['runtime status', /gateOpen=false/, /stageCEnabled=false/],
  ];
  for (const [cmd, p1, p2] of checks) {
    const out = runCli(cmd);
    assert.match(out, p1);
    assert.match(out, p2);
    assert.match(out, /readonly foundation stub/);
  }
});

test('validators for examples and index pass', () => {
  assert.match(runNode('scripts/validate-v8-registry-examples.mjs'), /semantic validation passed/);
  assert.match(runNode('scripts/validate-v8-foundation-index.mjs'), /index validation passed/);
});
