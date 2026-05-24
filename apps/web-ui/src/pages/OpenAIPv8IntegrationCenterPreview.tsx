import OpenAIPv8ReadonlyCenterPreview from './OpenAIPv8ReadonlyCenterPreview';
import {
  V8_INTEGRATIONS,
  V8_INTEGRATION_PROVIDER_HANDSHAKE_MATRIX,
  V8_CONNECTOR_MIGRATIONS,
  getV8IntegrationSummary,
  getV8ConnectorMigrationSummary,
} from '../registry/openAipv8CenterData';

const s = getV8IntegrationSummary();
const ms = getV8ConnectorMigrationSummary();

const config = {
  centerKey: 'integration' as const,
  title: 'OpenAIP v8 Integration Center Preview',
  subtitle: 'Readonly Preview · Gate CLOSED · Stage C disabled',
  purpose: 'Registry-backed integration center with Integration ↔ Provider handshake matrix and migration bridge, without connector actions.',
  role: 'External integration governance, bridge classification, and readonly handshake planning',
  sections: [
    {
      title: 'Integration Summary Strip',
      items: [
        `Total integrations: ${s.total}`,
        `Registered/static: ${s.registered}`,
        `Blocked actions: ${s.blockedActions}`,
        `High/critical risk: ${s.highOrCriticalRisk}`,
        `Related providers: ${s.relatedProviders}`,
        `Related local apps: ${s.relatedLocalApps}`,
        `Related agents: ${s.relatedAgents}`,
        `Connector actions allowed in preview: ${s.actionsAllowedInPreview}`,
      ],
    },
    {
      title: 'Legacy Connector Migration Bridge',
      items: [
        'v7 Connector Center is readonly legacy surface.',
        'OpenAxiom -> Local Apps Center',
        'Memory Hub -> Memory + Knowledge Center',
        'Hugging Face -> Integration/Provider/Knowledge',
        'OpenClaw -> Agent/Integration/Execution Gateway boundary',
        'ComfyUI -> Local Apps/Workflow Engine',
        'CC Switch-like -> Provider Manager config switcher reference',
        'Claude Proxy -> Provider proxy/local service bridge',
      ],
    },
    {
      title: 'External Action Safety',
      items: [
        'No connector actions',
        'No webhook calls',
        'No GitHub API calls',
        'No Hugging Face calls',
        'No OpenClaw gateway calls',
        'No config write',
        'No provider calls',
        'No Gate opening',
        'No Stage C enablement',
      ],
    },
  ],
  registryTables: [
    {
      title: `Integration Matrix (${V8_INTEGRATIONS.length} entries)`,
      columns: [
        { label: 'Name', key: 'name' },
        { label: 'Kind', key: 'kind' },
        { label: 'Connection', key: 'connectionMode' },
        { label: 'Auth', key: 'authState' },
        { label: 'Action', key: 'actionState' },
        { label: 'Related Provider', key: 'relatedProviderId' },
        { label: 'Related Local App', key: 'relatedLocalAppId' },
        { label: 'Related Agent', key: 'relatedAgentId' },
        { label: 'Risk', key: 'risk' },
        { label: 'Permission', key: 'permissionRequired' },
        { label: 'Allowed', key: 'allowedInPreview' },
        { label: 'Blocked Actions', key: 'blockedActions' },
      ],
      rows: V8_INTEGRATIONS.map(i => ({ ...i, blockedActions: (i.blockedActions || []).join(', '), relatedProviderId: i.relatedProviderId || '-', relatedLocalAppId: i.relatedLocalAppId || '-', relatedAgentId: i.relatedAgentId || '-' })),
    },
    {
      title: `Integration ↔ Provider Handshake Matrix (${V8_INTEGRATION_PROVIDER_HANDSHAKE_MATRIX.length} rows)`,
      columns: [
        { label: 'Integration', key: 'integrationId' },
        { label: 'Provider/Center', key: 'providerOrCenter' },
        { label: 'Relationship', key: 'relationship' },
        { label: 'Preview State', key: 'currentPreviewState' },
        { label: 'Blocked Actions', key: 'blockedActions' },
        { label: 'Risk', key: 'risk' },
        { label: 'Policy', key: 'requiredPolicy' },
        { label: 'Audit', key: 'auditRequired' },
        { label: 'Gate', key: 'gateRequired' },
      ],
      rows: V8_INTEGRATION_PROVIDER_HANDSHAKE_MATRIX.map(r => ({ ...r, blockedActions: r.blockedActions.join(', ') })),
    },
    {
      title: `Legacy Connector Migration Bridge Mapping (${V8_CONNECTOR_MIGRATIONS.length} entries)`,
      columns: [
        { label: 'Legacy Connector', key: 'legacyConnectorName' },
        { label: 'v8 Center', key: 'v8Center' },
        { label: 'Mapping', key: 'v8Mapping' },
        { label: 'Status', key: 'migrationStatus' },
      ],
      rows: V8_CONNECTOR_MIGRATIONS.map(m => ({ legacyConnectorName: m.legacyConnectorName, v8Center: m.v8Center, v8Mapping: m.v8Mapping, migrationStatus: m.migrationStatus })),
    },
  ],
  keyRules: [
    'Integration registered != connected.',
    'Connected != authorized.',
    'Authorized != connector action allowed.',
    'Provider configured != integration connected.',
    'Bridge exists != execution allowed.',
    'No external calls in preview.',
  ],
  notAllowed: [
    'No connector actions',
    'No external calls',
    'No config writes',
    'No provider calls',
    'No runtime mutation',
  ],
  futurePhases: [
    'Handshake policy compiler',
    'Integration health dashboard',
    'Connector dry-run evaluator',
    'Gated action execution chain',
  ],
  sampleData: [
    { label: 'Migration entries', value: `${ms.total} (migrated ${ms.migrated})` },
    { label: 'Legacy route', value: '/connector-center-readonly' },
    { label: 'Handshake rows', value: `${V8_INTEGRATION_PROVIDER_HANDSHAKE_MATRIX.length}` },
  ],
  relatedCenters: [
    { title: 'Agent Center', route: '/openaip-v8-agent-center-preview' },
    { title: 'Provider Manager', route: '/openaip-v8-provider-manager-preview' },
    { title: 'Local Apps Center', route: '/openaip-v8-local-apps-center-preview' },
    { title: 'Policy Capability Center', route: '/openaip-v8-policy-capability-center-preview' },
    { title: 'Audit Center', route: '/openaip-v8-audit-center-preview' },
    { title: 'Execution Gateway', route: '/openaip-v8-execution-gateway-preview' },
    { title: 'Command Center', route: '/openaip-v8-command-center-preview' },
    { title: 'Legacy Connector Center', route: '/connector-center-readonly' },
  ],
  backLink: '/openaip-v8-command-center-preview',
};

export default function OpenAIPv8IntegrationCenterPreview() {
  return <OpenAIPv8ReadonlyCenterPreview config={config} />;
}

