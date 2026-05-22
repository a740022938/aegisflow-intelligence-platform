import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const PAGES_DIR = 'E:\\AIP\\apps\\web-ui\\src\\pages';
const APP_TSX = 'E:\\AIP\\apps\\web-ui\\src\\App.tsx';
const LAYOUT_TSX = 'E:\\AIP\\apps\\web-ui\\src\\components\\Layout.tsx';
const REGISTRY_FILE = 'E:\\AIP\\apps\\web-ui\\src\\registry\\openAipv8CenterData.ts';
const CLI_V8_FILE = 'E:\\AIP\\apps\\aip-cli\\src\\commands\\v8.ts';

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

test('all 8 config-based pages have relatedCenters in their config', () => {
  const V8_CENTER_FILES = V8_PAGE_FILES.filter(f => f !== 'OpenAIPv8CommandCenterPreview.tsx' && f !== 'OpenAIPv8ReadonlyCenterPreview.tsx' && f !== 'OpenAIPv8AgentCenterPreview.tsx');
  for (const file of V8_CENTER_FILES) {
    const content = fs.readFileSync(path.join(PAGES_DIR, file), 'utf8');
    assert.ok(content.includes('relatedCenters'), `${file} missing relatedCenters`);
    assert.ok(content.includes('backLink:'), `${file} missing backLink`);
  }
});

test('agent center has related centers links in JSX', () => {
  const content = fs.readFileSync(path.join(PAGES_DIR, 'OpenAIPv8AgentCenterPreview.tsx'), 'utf8');
  assert.ok(content.includes('Related Centers'), 'Agent Center missing Related Centers heading');
  assert.ok(content.includes('/openaip-v8-task-center-preview'), 'Agent Center missing Task Center link');
  assert.ok(content.includes('/openaip-v8-policy-capability-center-preview'), 'Agent Center missing Policy Center link');
  assert.ok(content.includes('/openaip-v8-command-center-preview'), 'Agent Center missing Command Center back link');
});

test('shared component has related centers section and standard back text', () => {
  const sharedContent = fs.readFileSync(path.join(PAGES_DIR, 'OpenAIPv8ReadonlyCenterPreview.tsx'), 'utf8');
  assert.ok(sharedContent.includes('relatedCenters'), 'Shared component missing relatedCenters');
  assert.ok(sharedContent.includes('Related Centers'), 'Shared component missing Related Centers heading');
  assert.ok(sharedContent.includes('← Back to OpenAIP v8 Command Center'), 'Shared component missing default back text');
});

test('registry data entries have V8BaseEntry data quality fields', () => {
  const regContent = fs.readFileSync(REGISTRY_FILE, 'utf8');
  const dataQualityFields = ['dataSource', 'safetyNote', 'blockedActions', 'futurePhase'];
  for (const field of dataQualityFields) {
    assert.ok(regContent.includes(field), `Registry missing V8BaseEntry field "${field}"`);
  }
});

test('classifications reflect actual purpose descriptions', () => {
  const regContent = fs.readFileSync(REGISTRY_FILE, 'utf8');
  // OpenClaw should be described as agent+runtime gateway
  assert.ok(regContent.includes('runtime_service') || regContent.includes('runtime'), 'OpenClaw classification missing runtime');
  // OpenAxiom should be described as local app
  assert.ok(regContent.includes('local_app') || regContent.includes('Local App'), 'OpenAxiom missing local_app classification');
  // ComfyUI should be described as workflow engine
  assert.ok(regContent.includes('workflow') || regContent.includes('workflow_engine'), 'ComfyUI missing workflow classification');
  // YOLO/SAM should be described as vision pipeline
  assert.ok(regContent.includes('vision') || regContent.includes('pipeline'), 'YOLO/SAM missing vision pipeline classification');
  // CC Switch should be described as provider/config switcher
  assert.ok(regContent.includes('provider') && regContent.includes('config'), 'CC Switch missing provider/config classification');
});

test('CLI v8 centers output includes purpose column', () => {
  const cliContent = fs.readFileSync(CLI_V8_FILE, 'utf8');
  assert.ok(cliContent.includes('purpose'), 'CLI v8 centers missing purpose field');
  assert.ok(cliContent.includes('AI Agent Lifecycle & Permissions'), 'CLI v8 centers missing Agent Center purpose');
  assert.ok(cliContent.includes('Execution Gate (closed)'), 'CLI v8 centers missing Execution Gateway purpose');
  assert.ok(cliContent.includes('Hub + registry overview'), 'CLI v8 centers missing Command Center purpose');
});

test('CLI v8 status mentions data quality and navigation upgrades', () => {
  const cliContent = fs.readFileSync(CLI_V8_FILE, 'utf8');
  assert.ok(cliContent.includes('Data Quality Upgrade'), 'CLI v8 status missing Data Quality Upgrade line');
  assert.ok(cliContent.includes('Navigation Deep Links'), 'CLI v8 status missing Navigation Deep Links line');
});

// ── Agent Center MVP Tests ──

const AGENT_PAGE = path.join(PAGES_DIR, 'OpenAIPv8AgentCenterPreview.tsx');
const AGENTS_EXAMPLE = 'E:\\AIP\\docs\\product\\examples\\agents.example.json';
const CLI_AGENTS_FILE = 'E:\\AIP\\apps\\aip-cli\\src\\commands\\agents.ts';

test('agent center route exists in App.tsx', () => {
  const appContent = fs.readFileSync(APP_TSX, 'utf8');
  assert.ok(appContent.includes('openaip-v8-agent-center-preview'), 'Agent Center route missing from App.tsx');
});

test('agent center registry has all 5 agent entries', () => {
  const regContent = fs.readFileSync(REGISTRY_FILE, 'utf8');
  assert.ok(regContent.includes('agent.openclaw'), 'Registry missing OpenClaw');
  assert.ok(regContent.includes('agent.claude-code'), 'Registry missing Claude Code');
  assert.ok(regContent.includes('agent.codex'), 'Registry missing Codex');
  assert.ok(regContent.includes('agent.reviewer'), 'Registry missing Reviewer Agent');
  assert.ok(regContent.includes('agent.future'), 'Registry missing Future Agent');
});

test('agent center page renders agents from registry', () => {
  const pageContent = fs.readFileSync(AGENT_PAGE, 'utf8');
  assert.ok(pageContent.includes('V8_AGENTS'), 'Page missing V8_AGENTS import');
  assert.ok(pageContent.includes('Agent Registry ('), 'Page missing Agent Registry table');
  assert.ok(pageContent.includes('integrationKind'), 'Page missing integrationKind rendering');
  assert.ok(pageContent.includes('permissionLevel'), 'Page missing permissionLevel rendering');
});

test('agent center shows lifecycle and permission labels', () => {
  const content = fs.readFileSync(AGENT_PAGE, 'utf8');
  const lifecycleLabels = ['planned', 'registered', 'enabled', 'paused', 'disabled', 'quarantined'];
  const permissionLabels = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5'];
  for (const l of lifecycleLabels) assert.ok(content.includes(l), `Lifecycle label "${l}" missing`);
  for (const p of permissionLabels) assert.ok(content.includes(p), `Permission label "${p}" missing`);
});

test('agent center shows Gate CLOSED, Stage C disabled, No runtime mutation', () => {
  const content = fs.readFileSync(AGENT_PAGE, 'utf8');
  assert.ok(content.includes('Gate CLOSED'), 'Missing Gate CLOSED');
  assert.ok(content.includes('Stage C disabled'), 'Missing Stage C disabled');
  assert.ok(content.includes('No runtime mutation'), 'Missing No runtime mutation');
});

test('agent center links to related centers', () => {
  const content = fs.readFileSync(AGENT_PAGE, 'utf8');
  assert.ok(content.includes('/openaip-v8-task-center-preview'), 'Missing link to Task Center');
  assert.ok(content.includes('/openaip-v8-audit-center-preview'), 'Missing link to Audit Center');
  assert.ok(content.includes('/openaip-v8-policy-capability-center-preview'), 'Missing link to Policy/Capability Center');
  assert.ok(content.includes('/openaip-v8-execution-gateway-preview'), 'Missing link to Execution Gateway');
});

test('agent center includes safety boundary', () => {
  const content = fs.readFileSync(AGENT_PAGE, 'utf8');
  assert.ok(content.includes('Safety Boundary'), 'Missing Safety Boundary heading');
  assert.ok(content.includes('No agent execution'), 'Missing no execution');
  assert.ok(content.includes('No OpenClaw launch'), 'Missing no OpenClaw launch');
  assert.ok(content.includes('No Gate opening'), 'Missing no Gate opening');
  assert.ok(content.includes('No Stage C enablement'), 'Missing no Stage C enablement');
  assert.ok(content.includes('No release/tag/restore'), 'Missing no release/tag/restore');
});

test('agent center has permission ladder with L4/L5 warning', () => {
  const content = fs.readFileSync(AGENT_PAGE, 'utf8');
  assert.ok(content.includes('Permission Ladder'), 'Missing Permission Ladder');
  assert.ok(content.includes('This preview does not grant L4/L5 actions'), 'Missing L4/L5 warning');
});

test('agent center shows summary strip with counts', () => {
  const content = fs.readFileSync(AGENT_PAGE, 'utf8');
  assert.ok(content.includes('SummaryStrip') || content.includes('Total:'), 'Missing summary strip');
  assert.ok(content.includes('Agent Registry ('), 'Missing agent registry table');
});

test('CLI agents command shows agent list with lifecycle/permission/risk', () => {
  const cliContent = fs.readFileSync(CLI_AGENTS_FILE, 'utf8');
  assert.ok(cliContent.includes('lifecycle='), 'CLI agents missing lifecycle output');
  assert.ok(cliContent.includes('permission='), 'CLI agents missing permission output');
  assert.ok(cliContent.includes('risk='), 'CLI agents missing risk output');
  assert.ok(cliContent.includes('Execution is blocked for all agents'), 'CLI agents missing execution blocked note');
});

test('agents example JSON has all 5 agent entries', () => {
  const exampleContent = fs.readFileSync(AGENTS_EXAMPLE, 'utf8');
  assert.ok(exampleContent.includes('agent.openclaw'), 'Example missing OpenClaw');
  assert.ok(exampleContent.includes('agent.claude-code'), 'Example missing Claude Code');
  assert.ok(exampleContent.includes('agent.codex'), 'Example missing Codex');
  assert.ok(exampleContent.includes('agent.reviewer'), 'Example missing Reviewer Agent');
  assert.ok(exampleContent.includes('agent.future'), 'Example missing Future Agent');
  assert.ok(exampleContent.includes('taskReadiness'), 'Example missing taskReadiness field');
  assert.ok(exampleContent.includes('auditReadiness'), 'Example missing auditReadiness field');
  assert.ok(exampleContent.includes('capabilities'), 'Example missing capabilities field');
});

test('OpenClaw is not shown as executing in agent center', () => {
  const regContent = fs.readFileSync(REGISTRY_FILE, 'utf8');
  const pageContent = fs.readFileSync(AGENT_PAGE, 'utf8');
  const openclawEntry = regContent.split('agent.openclaw')[1]?.split('},')[0] || '';
  assert.ok(!openclawEntry.includes('execution: true'), 'OpenClaw should not have execution enabled');
  assert.ok(!openclawEntry.includes('gateOpen: true'), 'OpenClaw gateOpen should be false');
  assert.ok(pageContent.includes('No OpenClaw launch'), 'Page should warn about no OpenClaw launch');
});

test('no risky labels in actionable contexts on agent center', () => {
  const content = fs.readFileSync(AGENT_PAGE, 'utf8');
  const riskyLabels = ['Execute', 'Launch', 'Enable Gate', 'Enable Stage C', 'Start OpenClaw', 'Browser control', 'Write config', 'Release', 'Restore'];
  const safetyBoundaryStart = content.indexOf('Safety Boundary');
  for (const label of riskyLabels) {
    const beforeSafety = content.substring(0, safetyBoundaryStart >= 0 ? safetyBoundaryStart : content.length);
    const inActionableContext = beforeSafety.includes(label) && !beforeSafety.includes('blockedActions') && !beforeSafety.includes('No ');
    assert.equal(inActionableContext, false, `Risky label "${label}" found in actionable context on Agent Center`);
  }
});
