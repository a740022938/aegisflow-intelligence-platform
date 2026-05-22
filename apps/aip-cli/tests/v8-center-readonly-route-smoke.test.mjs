import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const PAGES_DIR = 'E:\\AIP\\apps\\web-ui\\src\\pages';
const APP_TSX = 'E:\\AIP\\apps\\web-ui\\src\\App.tsx';
const LAYOUT_TSX = 'E:\\AIP\\apps\\web-ui\\src\\components\\Layout.tsx';

const V8_ROUTES = [
  '/openaip-v8-command-center-preview',
  '/openaip-v8-agent-center-preview',
  '/openaip-v8-task-center-preview',
  '/openaip-v8-provider-manager-preview',
  '/openaip-v8-integration-center-preview',
  '/openaip-v8-local-apps-center-preview',
  '/openaip-v8-memory-knowledge-center-preview',
  '/openaip-v8-policy-capability-center-preview',
  '/openaip-v8-audit-center-preview',
  '/openaip-v8-execution-gateway-preview',
];

const V8_PAGE_FILES = [
  'OpenAIPv8CommandCenterPreview.tsx',
  'OpenAIPv8AgentCenterPreview.tsx',
  'OpenAIPv8TaskCenterPreview.tsx',
  'OpenAIPv8ProviderManagerPreview.tsx',
  'OpenAIPv8IntegrationCenterPreview.tsx',
  'OpenAIPv8LocalAppsCenterPreview.tsx',
  'OpenAIPv8MemoryKnowledgeCenterPreview.tsx',
  'OpenAIPv8PolicyCapabilityCenterPreview.tsx',
  'OpenAIPv8AuditCenterPreview.tsx',
  'OpenAIPv8ExecutionGatewayPreview.tsx',
];

const FORBIDDEN_ACTION_LABELS = [
  'Enable Gate',
  'Enable Stage C',
  'Write config',
];

test('all 10 v8 route strings exist in App.tsx', () => {
  const appContent = fs.readFileSync(APP_TSX, 'utf8');
  // App.tsx uses relative route paths without leading /
  for (const route of V8_ROUTES) {
    const relative = route.replace(/^\//, '');
    assert.ok(appContent.includes(relative), `Route ${route} not found in App.tsx`);
  }
});

test('all 10 v8 page files exist in pages directory', () => {
  for (const file of V8_PAGE_FILES) {
    const filePath = path.join(PAGES_DIR, file);
    assert.ok(fs.existsSync(filePath), `Page file ${file} not found`);
  }
});

test('no v8 routes are exposed in sidebar Layout.tsx', () => {
  const layoutContent = fs.readFileSync(LAYOUT_TSX, 'utf8');
  for (const route of V8_ROUTES) {
    assert.equal(layoutContent.includes(route), false, `Route ${route} found in Layout.tsx sidebar`);
  }
});

test('command center links to all 9 center pages', () => {
  const ccContent = fs.readFileSync(path.join(PAGES_DIR, 'OpenAIPv8CommandCenterPreview.tsx'), 'utf8');
  const linkedRoutes = V8_ROUTES.filter(r => r !== '/openaip-v8-command-center-preview');
  for (const route of linkedRoutes) {
    assert.ok(ccContent.includes(route), `Command Center missing link to ${route}`);
  }
});

test('safety strings exist in shared component', () => {
  const sharedContent = fs.readFileSync(path.join(PAGES_DIR, 'OpenAIPv8ReadonlyCenterPreview.tsx'), 'utf8');
  const safetyStrings = ['Readonly', 'No runtime mutation', 'Gate CLOSED', 'Stage C disabled'];
  for (const s of safetyStrings) {
    assert.ok(sharedContent.includes(s), `Shared component missing safety string "${s}"`);
  }
});



test('forbidden action labels absent from v8 pages', () => {
  for (const file of V8_PAGE_FILES) {
    const content = fs.readFileSync(path.join(PAGES_DIR, file), 'utf8');
    for (const label of FORBIDDEN_ACTION_LABELS) {
      const inSafetySection = content.includes(label) && (content.includes('Not allowed') || content.includes('notAllowed'));
      if (!inSafetySection) {
        assert.equal(content.includes(label), false, `${file} contains forbidden label "${label}" outside safety section`);
      }
    }
  }
});

test('no Launch/Restart/Restore/Release as action labels outside safety descriptions', () => {
  const riskyLabels = ['Launch', 'Restart', 'Restore', 'Release'];
  for (const file of V8_PAGE_FILES) {
    if (file === 'OpenAIPv8ReadonlyCenterPreview.tsx') continue;
    const content = fs.readFileSync(path.join(PAGES_DIR, file), 'utf8');
    for (const label of riskyLabels) {
      const inSafetySection = content.includes(label) && (content.includes('Not allowed') || content.includes('notAllowed'));
      if (!inSafetySection) {
        assert.equal(
          content.includes(label),
          false,
          `${file} contains "${label}" outside safety section`
        );
      }
    }
  }
});

test('old Connector Center routes still exist', () => {
  const appContent = fs.readFileSync(APP_TSX, 'utf8');
  assert.ok(appContent.includes('connector-center'), 'connector-center route missing from App.tsx');
  assert.ok(appContent.includes('connector-center-readonly'), 'connector-center-readonly route missing from App.tsx');
});

test('v8 pages use registry-backed data', () => {
  for (const file of V8_PAGE_FILES) {
    if (file === 'OpenAIPv8CommandCenterPreview.tsx') {
      const content = fs.readFileSync(path.join(PAGES_DIR, file), 'utf8');
      assert.ok(content.includes('getV8RegistryCounts'), `${file} missing registry import`);
      continue;
    }
    if (file === 'OpenAIPv8ReadonlyCenterPreview.tsx') continue;
    const content = fs.readFileSync(path.join(PAGES_DIR, file), 'utf8');
    assert.ok(content.includes('openAipv8CenterData'), `${file} missing registry data import`);
  }
});

test('integration center shows migration bridge', () => {
  const icContent = fs.readFileSync(path.join(PAGES_DIR, 'OpenAIPv8IntegrationCenterPreview.tsx'), 'utf8');
  assert.ok(icContent.includes('V8_CONNECTOR_MIGRATIONS'));
  assert.ok(icContent.includes('Migration Bridge'));
  assert.ok(icContent.includes('legacyConnectorName'));
});
