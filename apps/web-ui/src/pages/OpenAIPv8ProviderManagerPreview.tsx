import OpenAIPv8ReadonlyCenterPreview from './OpenAIPv8ReadonlyCenterPreview';

const config = {
  title: 'Provider Manager',
  subtitle: '模型提供商路由与配置管理',
  purpose: '吸收 CC Switch 的提供商配置/路由优势，统一管理模型提供商。',
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
      title: 'What This Center Will Manage',
      items: [
        'Provider 注册与配置',
        '路由策略与切换',
        'Dry-run 模式验证',
        '成本与用量追踪'
      ]
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
