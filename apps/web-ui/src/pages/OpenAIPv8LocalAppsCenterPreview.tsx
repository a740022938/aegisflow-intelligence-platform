import OpenAIPv8ReadonlyCenterPreview from './OpenAIPv8ReadonlyCenterPreview';
import { V8_LOCAL_APPS, V8_LOCAL_APP_RELATION_MATRIX, getV8LocalAppSummary } from '../registry/openAipv8CenterData';
const s = getV8LocalAppSummary();
const config = {
  centerKey: 'localApps' as const,
  title: 'OpenAIP v8 Local Apps Center Preview',
  subtitle: 'Readonly Preview · Gate CLOSED · Stage C disabled',
  purpose: 'Registry-backed local apps inventory and relationship matrix without launch/control.',
  role: 'Local app classification, safety boundary, and center relations',
  sections: [
    { title: 'Local Apps Summary Strip', items: [
      `Total local apps/tools: ${s.total}`,
      `Local model servers: ${s.localModelServers}`,
      `Workflow engines: ${s.workflowEngines}`,
      `Vision tools: ${s.visionTools}`,
      `Local runtime services: ${s.runtimeServices}`,
      `Launch blocked: ${s.launchBlocked}`,
      `Config write blocked: ${s.configWriteBlocked}`,
      `Execution blocked: ${s.executionBlocked}`
    ]},
    { title: 'OpenAxiom Positioning', items: [
      'OpenAxiom is a Local App / UI Lab / Vision Tool',
      'Not an agent',
      'Not a primary model provider',
      'Not launched by this preview',
      'Future launch/control requires explicit policy + approval + audit'
    ]},
    { title: 'Local Runtime Safety', items: [
      'No local app launch', 'No process start/stop/restart', 'No local app API calls', 'No model calls',
      'No workflow execution', 'No training', 'No file writes', 'No config writes', 'No Gate opening', 'No Stage C enablement'
    ]}
  ],
  registryTables: [
    { title: `Local Apps Matrix (${V8_LOCAL_APPS.length} entries)`, columns: [
      { label: 'Name', key: 'name' }, { label: 'Kind/Category', key: 'kind' }, { label: 'Configured', key: 'configuredState' },
      { label: 'Installed', key: 'installedState' }, { label: 'Running', key: 'runningState' }, { label: 'Launch', key: 'launchState' },
      { label: 'Connection', key: 'connectionMode' }, { label: 'Provider', key: 'relatedProviderId' }, { label: 'Integration', key: 'relatedIntegrationId' },
      { label: 'Risk', key: 'risk' }, { label: 'Permission', key: 'permissionRequired' }, { label: 'Allowed', key: 'allowedInPreview' }, { label: 'Blocked Actions', key: 'blockedActions' }
    ], rows: V8_LOCAL_APPS.map(a => ({ ...a, relatedCapabilityIds: (a.relatedCapabilityIds || []).join(', '), blockedActions: (a.blockedActions || []).join(', '), relatedProviderId: a.relatedProviderId || '-', relatedIntegrationId: a.relatedIntegrationId || '-' })) },
    { title: `Local Apps ↔ Provider/Integration Matrix (${V8_LOCAL_APP_RELATION_MATRIX.length} rows)`, columns: [
      { label: 'Local App', key: 'localAppId' }, { label: 'Related Center', key: 'relatedCenter' }, { label: 'Relationship', key: 'relationship' },
      { label: 'Preview State', key: 'currentPreviewState' }, { label: 'Blocked Actions', key: 'blockedActions' }, { label: 'Risk', key: 'risk' },
      { label: 'Policy', key: 'requiredPolicy' }, { label: 'Audit', key: 'auditRequired' }, { label: 'Gate', key: 'gateRequired' }
    ], rows: V8_LOCAL_APP_RELATION_MATRIX.map(r => ({ ...r, blockedActions: r.blockedActions.join(', ') })) }
  ],
  keyRules: ['registered != installed', 'installed != running', 'configured != launch allowed', 'running != authorized', 'launch/control requires policy + approval + audit'],
  notAllowed: ['No local app launch', 'No local app API calls', 'No config writes', 'No runtime mutation'],
  futurePhases: ['Gated launch controls', 'Runtime health dashboard', 'Policy-driven app orchestration'],
  sampleData: [{ label: 'Legacy migration reference', value: '/connector-center-readonly' }],
  relatedCenters: [
    { title: 'Integration Center', route: '/openaip-v8-integration-center-preview' },
    { title: 'Provider Manager', route: '/openaip-v8-provider-manager-preview' },
    { title: 'Memory + Knowledge Center', route: '/openaip-v8-memory-knowledge-center-preview' },
    { title: 'Policy Capability Center', route: '/openaip-v8-policy-capability-center-preview' },
    { title: 'Execution Gateway', route: '/openaip-v8-execution-gateway-preview' },
    { title: 'Command Center', route: '/openaip-v8-command-center-preview' },
    { title: 'Legacy Connector Center', route: '/connector-center-readonly' }
  ],
  backLink: '/openaip-v8-command-center-preview'
};
export default function OpenAIPv8LocalAppsCenterPreview() { return <OpenAIPv8ReadonlyCenterPreview config={config} />; }

