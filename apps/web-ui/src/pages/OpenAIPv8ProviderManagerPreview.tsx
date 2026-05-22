import OpenAIPv8ReadonlyCenterPreview from './OpenAIPv8ReadonlyCenterPreview';
import { V8_PROVIDERS, getV8ProviderSummary } from '../registry/openAipv8CenterData';

const s = getV8ProviderSummary();
const config = {
  title: 'Provider Manager',
  subtitle: '模型提供商路由与配置管理',
  purpose: '吸收 CC Switch 的提供商配置/路由优势，统一管理模型提供商。',
  role: 'Model provider registry, dry-run routing, and cost/usage visibility concepts',
  sections: [
    {
      title: 'CC Switch-like Strengths',
      items: [
        'Provider profiles — 每个提供商独立配置',
        'Config switching — 在提供商间切换',
        'Dry-run routing — 先模拟再切换',
        'Cost/usage visibility — 用量与费用可视化'
      ]
    },
    {
      title: 'Provider Registry',
      items: [
        'Claude / OpenAI-compatible / DeepSeek',
        'Ollama (local)',
        'LM Studio (local)',
        'Future: 更多 provider adapters'
      ]
    },
    {
      title: 'Registry Summary',
      items: [
        `Total providers: ${s.total}`,
        `Enabled: ${s.enabled}`,
        `Configured: ${s.configured}`,
        `Online: ${s.online}`,
        `Authorized: ${s.authorized}`,
      ]
    }
  ],
  registryTables: [
    {
      title: `Provider Registry (${V8_PROVIDERS.length} entries)`,
      columns: [
        { label: 'Name', key: 'name' },
        { label: 'Lifecycle', key: 'lifecycle' },
        { label: 'Permission', key: 'permissionLevel' },
        { label: 'Online', key: 'online' },
        { label: 'Authorized', key: 'authorized' },
      ],
      rows: V8_PROVIDERS.map(p => ({ name: p.name, lifecycle: p.lifecycle, permissionLevel: p.permissionLevel, online: p.online, authorized: p.authorized }))
    }
  ],
  keyRules: [
    'Provider configured does not mean provider selected for execution.',
    'Config switched in dry-run only — no live routing change.',
    'Provider online status is advisory, not execution guarantee.'
  ],
  notAllowed: [
    'No provider switching in this preview',
    'No config mutation',
    'No live routing changes',
    'No provider execution'
  ],
  futurePhases: [
    'Provider profile management UI',
    'Dry-run routing simulation',
    'Cost/usage analytics',
    'Multi-provider failover'
  ],
  sampleData: [
    { label: 'CC Switch-like Router', value: 'registered | L2 | online=true' },
    { label: 'Ollama', value: 'enabled | L1 | online=false' },
    { label: 'LM Studio', value: 'registered | L1 | online=false' }
  ],
  backLink: '/openaip-v8-command-center-preview',
  backLabel: 'Back to Command Center'
};

export default function OpenAIPv8ProviderManagerPreview() {
  return <OpenAIPv8ReadonlyCenterPreview config={config} />;
}
