import OpenAIPv8ReadonlyCenterPreview from './OpenAIPv8ReadonlyCenterPreview';
import { V8_PROVIDERS, getV8ProviderSummary } from '../registry/openAipv8CenterData';

const s = getV8ProviderSummary();

const config = {
  centerKey: 'provider' as const,
  title: 'OpenAIP v8 Provider Manager Preview',
  subtitle: 'Readonly Preview · Gate CLOSED · Stage C disabled',
  purpose: 'Registry-backed provider ecosystem center for profiles, safety, and routing concepts without runtime mutation.',
  role: 'Provider profile matrix + safety boundary + conceptual routing preview',
  sections: [
    { title: 'Provider Summary Strip', items: [
      `Total providers/profiles: ${s.total}`,
      `Cloud providers: ${V8_PROVIDERS.filter(p => p.providerKind === 'cloud_provider' || p.providerKind === 'openai_compatible_provider').length}`,
      `Local model servers: ${V8_PROVIDERS.filter(p => p.providerKind === 'local_model_server').length}`,
      `Proxy/config switcher references: ${V8_PROVIDERS.filter(p => p.providerKind === 'provider_proxy' || p.providerKind === 'config_switcher_reference').length}`,
      `Disabled/planned: ${V8_PROVIDERS.filter(p => p.lifecycle === 'disabled').length}`,
      `Config-write blocked: ${V8_PROVIDERS.filter(p => p.blockedActions?.includes('provider config write')).length}`,
      `Model-call blocked: ${V8_PROVIDERS.filter(p => p.blockedActions?.includes('model calls')).length}`,
      `Secret-safe entries: ${V8_PROVIDERS.filter(p => p.secretHandling === 'no_secret_display' || p.secretHandling === 'masked_reference_only').length}`,
    ] },
    { title: 'CC Switch-like Strengths', items: [
      'Provider profiles', 'Model presets', 'Config switch dry-run', 'Router/failover concepts', 'Cost/usage visibility', 'Local proxy awareness',
      'This preview does not write CC Switch, Claude, Codex, OpenClaw, or provider configs.'
    ]},
    { title: 'Secret Safety', items: [
      'No API keys shown', 'No token/JWT output', 'No localStorage/sessionStorage secret write',
      'No provider config mutation', 'No live provider call'
    ]},
    { title: 'Provider Routing Preview', items: [
      'Task type', 'Risk', 'Cost', 'Privacy', 'Model capability', 'Human approval', 'Policy requirement',
      'Routing is conceptual/read-only in this preview.'
    ]}
  ],
  registryTables: [{
    title: `Provider Profile Matrix (${V8_PROVIDERS.length} entries)`,
    columns: [
      { label: 'Name', key: 'name' }, { label: 'Kind', key: 'providerKind' }, { label: 'Config', key: 'configStatus' },
      { label: 'Selection', key: 'selectionState' }, { label: 'Profiles', key: 'modelProfileExamples' }, { label: 'Routing', key: 'routingRole' },
      { label: 'Cost', key: 'costVisibility' }, { label: 'Secret', key: 'secretHandling' }, { label: 'Risk', key: 'risk' },
      { label: 'Permission', key: 'permissionRequired' }, { label: 'Allowed', key: 'allowedInPreview' }, { label: 'Blocked Actions', key: 'blockedActions' }
    ],
    rows: V8_PROVIDERS.map(p => ({ ...p, modelProfileExamples: p.modelProfileExamples.join(', '), blockedActions: (p.blockedActions || []).join(', ') }))
  }],
  keyRules: [
    'Provider registered != configured with secrets.',
    'Provider configured != selected.',
    'Provider selected != model call allowed.',
    'CC Switch-like switching is reference/dry-run only.',
    'Local provider configured != local app launch allowed.'
  ],
  notAllowed: [
    'No provider switching', 'No model calls', 'No API keys shown', 'No config write', 'No local app launch',
    'No Gate opening', 'No Stage C enablement', 'No release/tag/restore', 'No connector action'
  ],
  futurePhases: ['Provider profile management UI', 'Routing policy compiler', 'Cost/usage telemetry', 'Gated execution handshake'],
  sampleData: [
    { label: 'Readonly Preview', value: 'No runtime mutation' },
    { label: 'Gate', value: 'CLOSED' },
    { label: 'Stage C', value: 'disabled' }
  ],
  relatedCenters: [
    { title: 'Agent Center', route: '/openaip-v8-agent-center-preview' },
    { title: 'Task Center', route: '/openaip-v8-task-center-preview' },
    { title: 'Policy Capability Center', route: '/openaip-v8-policy-capability-center-preview' },
    { title: 'Audit Center', route: '/openaip-v8-audit-center-preview' },
    { title: 'Execution Gateway', route: '/openaip-v8-execution-gateway-preview' },
    { title: 'Command Center', route: '/openaip-v8-command-center-preview' },
  ],
  backLink: '/openaip-v8-command-center-preview'
};

export default function OpenAIPv8ProviderManagerPreview() {
  return <OpenAIPv8ReadonlyCenterPreview config={config} />;
}
