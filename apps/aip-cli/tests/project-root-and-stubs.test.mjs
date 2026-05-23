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
    ['providers list', /Ollama/, /Registry count: \d+ providers/],
    ['integrations list', /GitHub/, /Integration count: \d+/],
    ['apps list', /OpenAxiom/, /category=local_app/],
    ['runtime status', /gateOpen=false/, /stageCEnabled=false/],
    ['runtime list', /OpenClaw/, /Ollama/],
    ['task list', /Task Archetype List/, /lifecycle=draft/],
    ['task status', /Task Summary/, /All tasks are readonly/],
    ['audit list', /audit\.cli-identity-foundation/, /state=accepted/],
    ['audit status', /Total audit entries/, /Audit Summary/],
    ['policy list', /Gate CLOSED/, /policy\.gated-execution/],
    ['policy status', /Gate CLOSED/, /Stage C disabled/],
  ];
  for (const [cmd, p1, p2] of checks) {
    const out = runCli(cmd);
    assert.match(out, p1);
    assert.match(out, p2);
    assert.match(out, /readonly (registry|static\/example registry)|example\/static readonly registry/);
  }
});

test('v8 list/status commands show registry counts', () => {
  const countChecks = [
    ['agents list', /Total agents: \d+/],
    ['providers list', /Registry count: \d+ providers/],
    ['integrations list', /Integration count: \d+/],
    ['apps list', /Local apps count: \d+/],
    ['runtime status', /total runtime entries/],
    ['runtime list', /Registry count: \d+ total runtime entries/],
    ['task list', /Total task archetypes: \d+/],
    ['task status', /Total task archetypes: \d+/],
    ['audit list', /Total audit entries: \d+/],
    ['audit status', /Total audit entries: \d+/],
    ['policy list', /Total policies: \d+/],
    ['policy status', /Total policies: \d+/],
  ];
  for (const [cmd, pattern] of countChecks) {
    const out = runCli(cmd);
    assert.match(out, pattern, `${cmd} should show registry-backed count`);
  }
});

test('v8 centers command lists all hidden readonly routes with registry data note', () => {
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
  assert.match(out, /registry-backed/);
  assert.match(out, /Migration bridge banner/);
});

test('v8 status command shows foundation summary with registry data', () => {
  const out = runCli('v8 status');
  assert.match(out, /Gate.*CLOSED/);
  assert.match(out, /Stage C.*DISABLED/);
  assert.match(out, /Runtime Mutation.*NONE/);
  assert.match(out, /DB Write.*NONE/);
  assert.match(out, /Registry Data Layer.*COMPLETE/);
  assert.match(out, /Connector.*v8 Migration.*COMPLETE/);
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

test('only command center v8 route is exposed in sidebar', () => {
  const layoutContent = fs.readFileSync('E:\\AIP\\apps\\web-ui\\src\\components\\Layout.tsx', 'utf8');
  const allowedSidebarRoute = 'openaip-v8-command-center-preview';
  assert.ok(layoutContent.includes(allowedSidebarRoute), 'Command Center route missing from Layout.tsx sidebar');
  const hiddenV8Routes = [
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
  for (const route of hiddenV8Routes) {
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
      assert.ok(content.includes('ReadonlyCenterPreview') || /readonly/i.test(content), `${file} missing readonly reference`);
    }
  }
});

test('no executable controls in v8 center pages', () => {
  const pagesDir = 'E:\\AIP\\apps\\web-ui\\src\\pages';
  const centerFiles = fs.readdirSync(pagesDir).filter(f => f.startsWith('OpenAIPv8') && f.endsWith('.tsx') && f !== 'OpenAIPv8ReadonlyCenterPreview.tsx');
  for (const file of centerFiles) {
    const content = fs.readFileSync(path.join(pagesDir, file), 'utf8');
    assert.equal(content.includes('<button'), false, `${file} contains a button control`);
    assert.equal(content.includes('role="button"'), false, `${file} contains a button role`);
    assert.equal(content.includes('onClick'), false, `${file} contains an onClick handler`);
    assert.equal(content.includes('Enable Gate'), false, `${file} contains Enable Gate action text`);
    assert.equal(content.includes('Enable Stage C'), false, `${file} contains Enable Stage C action text`);
    assert.equal(content.includes('Write config'), false, `${file} contains Write config action text`);
  }
});

test('center pages import registry data', () => {
  const pagesDir = 'E:\\AIP\\apps\\web-ui\\src\\pages';
  const centerFiles = fs.readdirSync(pagesDir).filter(f => f.startsWith('OpenAIPv8') && f.endsWith('.tsx') && f !== 'OpenAIPv8ReadonlyCenterPreview.tsx');
  for (const file of centerFiles) {
    const content = fs.readFileSync(path.join(pagesDir, file), 'utf8');
    assert.ok(content.includes('openAipv8CenterData'), `${file} should import from openAipv8CenterData`);
    assert.ok(content.includes('V8_') || content.includes('getV8'), `${file} should use V8 registry data`);
  }
});

test('openAipv8CenterData.ts has all required registries', () => {
  const data = fs.readFileSync('E:\\AIP\\apps\\web-ui\\src\\registry\\openAipv8CenterData.ts', 'utf8');
  assert.ok(data.includes('V8_AGENTS'));
  assert.ok(data.includes('V8_PROVIDERS'));
  assert.ok(data.includes('V8_INTEGRATIONS'));
  assert.ok(data.includes('V8_LOCAL_APPS'));
  assert.ok(data.includes('V8_CAPABILITIES'));
  assert.ok(data.includes('V8_POLICIES'));
  assert.ok(data.includes('V8_TASKS'));
  assert.ok(data.includes('V8_AUDITS'));
  assert.ok(data.includes('V8_MEMORY_KNOWLEDGE'));
  assert.ok(data.includes('V8_CONNECTOR_MIGRATIONS'));
  assert.ok(data.includes('getV8RegistryCounts'));
  assert.ok(data.includes('getV8ConnectorMigrationSummary'));
});

test('ConnectorCenter pages have migration bridge', () => {
  const readonlyContent = fs.readFileSync('E:\\AIP\\apps\\web-ui\\src\\pages\\ConnectorCenterReadonly.tsx', 'utf8');
  const legacyContent = fs.readFileSync('E:\\AIP\\apps\\web-ui\\src\\pages\\ConnectorCenter.tsx', 'utf8');
  assert.ok(readonlyContent.includes('MIGRATION BRIDGE'), 'ConnectorCenterReadonly missing migration bridge');
  assert.ok(legacyContent.includes('MIGRATION BRIDGE'), 'ConnectorCenter missing migration bridge');
  assert.ok(readonlyContent.includes('v8 Integration Center'));
  assert.ok(legacyContent.includes('v8 Integration Center'));
});

test('Command Center shows registry-backed counts', () => {
  const commandCenterContent = fs.readFileSync('E:\\AIP\\apps\\web-ui\\src\\pages\\OpenAIPv8CommandCenterPreview.tsx', 'utf8');
  assert.ok(commandCenterContent.includes('getV8RegistryCounts'));
  assert.ok(commandCenterContent.includes('getV8ConnectorMigrationSummary'));
  assert.ok(commandCenterContent.includes('Connector Migration'));
});

test('Shared component supports registryTables', () => {
  const sharedContent = fs.readFileSync('E:\\AIP\\apps\\web-ui\\src\\pages\\OpenAIPv8ReadonlyCenterPreview.tsx', 'utf8');
  assert.ok(sharedContent.includes('registryTables'));
  assert.ok(sharedContent.includes('RegistryTableColumn'));
  assert.ok(sharedContent.includes('RegistryTableRow'));
});
