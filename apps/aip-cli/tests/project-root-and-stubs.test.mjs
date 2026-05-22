import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

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
    ['runtime list', /OpenClaw/, /Ollama/],
    ['task list', /Task Pack Registry/, /lifecycle=draft/],
    ['task status', /draft items/, /receipt required/],
    ['audit list', /P1A/, /verdict=passed/],
    ['audit status', /total receipts/, /latest phase/],
    ['policy list', /gateOpen=false/, /cap\.runtime\.status/],
    ['policy status', /gateOpen/, /stageCEnabled/],
  ];
  for (const [cmd, p1, p2] of checks) {
    const out = runCli(cmd);
    assert.match(out, p1);
    assert.match(out, p2);
    assert.match(out, /readonly foundation stub/);
  }
});

test('v8 centers command lists all hidden readonly routes', () => {
  const out = runCli('v8 centers');
  assert.match(out, /openaip-v8-command-center-preview/);
  assert.match(out, /openaip-v8-agent-center-preview/);
  assert.match(out, /openaip-v8-task-center-preview/);
  assert.match(out, /openaip-v8-provider-manager-preview/);
  assert.match(out, /openaip-v8-integration-center-preview/);
  assert.match(out, /openaip-v8-local-apps-center-preview/);
  assert.match(out, /openaip-v8-memory-knowledge-center-preview/);
  assert.match(out, /openaip-v8-policy-capability-center-preview/);
  assert.match(out, /openaip-v8-audit-center-preview/);
  assert.match(out, /openaip-v8-execution-gateway-preview/);
  assert.match(out, /hidden\/direct, readonly, Gate CLOSED/);
});

test('v8 status command shows foundation summary', () => {
  const out = runCli('v8 status');
  assert.match(out, /Gate.*CLOSED/);
  assert.match(out, /Stage C.*DISABLED/);
  assert.match(out, /Runtime Mutation.*NONE/);
  assert.match(out, /DB Write.*NONE/);
});

test('validators for examples and index pass', () => {
  assert.match(runNode('scripts/validate-v8-registry-examples.mjs'), /semantic validation passed/);
  assert.match(runNode('scripts/validate-v8-foundation-index.mjs'), /index validation passed/);
});

test('all 10 v8 center routes exist in App.tsx', () => {
  const appContent = fs.readFileSync('E:\\AIP\\apps\\web-ui\\src\\App.tsx', 'utf8');
  const routes = [
    'openaip-v8-command-center-preview',
    'openaip-v8-agent-center-preview',
    'openaip-v8-task-center-preview',
    'openaip-v8-provider-manager-preview',
    'openaip-v8-integration-center-preview',
    'openaip-v8-local-apps-center-preview',
    'openaip-v8-memory-knowledge-center-preview',
    'openaip-v8-policy-capability-center-preview',
    'openaip-v8-audit-center-preview',
    'openaip-v8-execution-gateway-preview',
  ];
  for (const route of routes) {
    assert.ok(appContent.includes(route), `Route ${route} not found in App.tsx`);
  }
});

test('no v8 route exposed in sidebar', () => {
  const layoutContent = fs.readFileSync('E:\\AIP\\apps\\web-ui\\src\\components\\Layout.tsx', 'utf8');
  const v8RoutesInSidebar = [
    'openaip-v8-command-center-preview',
    'openaip-v8-agent-center-preview',
    'openaip-v8-task-center-preview',
    'openaip-v8-provider-manager-preview',
    'openaip-v8-integration-center-preview',
    'openaip-v8-local-apps-center-preview',
    'openaip-v8-memory-knowledge-center-preview',
    'openaip-v8-policy-capability-center-preview',
    'openaip-v8-audit-center-preview',
    'openaip-v8-execution-gateway-preview',
  ];
  for (const route of v8RoutesInSidebar) {
    assert.equal(layoutContent.includes(route), false, `Route ${route} found in Layout.tsx sidebar`);
  }
});

test('center pages contain required safety phrases', () => {
  const pagesDir = 'E:\\AIP\\apps\\web-ui\\src\\pages';
  const centerFiles = fs.readdirSync(pagesDir).filter(f => f.startsWith('OpenAIPv8') && f.endsWith('.tsx'));
  for (const file of centerFiles) {
    const content = fs.readFileSync(path.join(pagesDir, file), 'utf8');
    if (file === 'OpenAIPv8ReadonlyCenterPreview.tsx') {
      assert.ok(content.includes('Readonly Preview'), `${file} missing Readonly Preview`);
      assert.ok(content.includes('Gate CLOSED'), `${file} missing Gate CLOSED`);
      assert.ok(content.includes('Stage C disabled'), `${file} missing Stage C disabled`);
      assert.ok(content.includes('No runtime mutation'), `${file} missing No runtime mutation`);
    } else {
      assert.ok(content.includes('ReadonlyCenterPreview') || content.includes('readonly'), `${file} missing readonly reference`);
    }
  }
});

test('no risky button labels in v8 center pages', () => {
  const pagesDir = 'E:\\AIP\\apps\\web-ui\\src\\pages';
  const riskyPatterns = ['Execute', 'Launch', 'Enable Gate', 'Enable Stage C', 'Release', 'Restore', 'Restart', 'Write config'];
  const centerFiles = fs.readdirSync(pagesDir).filter(f => f.startsWith('OpenAIPv8') && f.endsWith('.tsx') && f !== 'OpenAIPv8ReadonlyCenterPreview.tsx');
  for (const file of centerFiles) {
    const content = fs.readFileSync(path.join(pagesDir, file), 'utf8');
    for (const pattern of riskyPatterns) {
      const inSafetySection = content.includes(pattern) && (content.includes('Not allowed') || content.includes('notAllowed'));
      if (!inSafetySection) {
        assert.equal(content.includes(pattern), false, `${file} contains risky text "${pattern}" outside safety section`);
      }
    }
  }
});
