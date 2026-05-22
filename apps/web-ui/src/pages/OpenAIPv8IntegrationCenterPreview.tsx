import OpenAIPv8ReadonlyCenterPreview from './OpenAIPv8ReadonlyCenterPreview';

const config = {
  title: 'Integration Center',
  subtitle: '外部服务绑定与桥接管理',
  purpose: '管理外部工具和服务的集成，包括 OpenClaw、GitHub、Webhook 等。',
  sections: [
    {
      title: 'Managed Integrations',
      items: [
        'OpenClaw — 一等公民集成',
        'GitHub — 代码仓库绑定',
        'Webhooks / External APIs — 外部服务桥接',
        'Runtime bridge — 运行时连接管理'
      ]
    },
    {
      title: 'Integration States',
      items: [
        'registered — 已注册',
        'enabled — 已启用',
        'paused — 暂停',
        'disabled — 禁用'
      ]
    },
    {
      title: 'What This Center Will Manage',
      items: [
        '外部服务注册与配置',
        '连接状态监控',
        '桥接策略管理',
        'Webhook 端点管理'
      ]
    }
  ],
  keyRules: [
    'Integration online does not mean connector action allowed.',
    'Integration enabled does not mean execution authorized.',
    'Connector actions require Gate open and Stage C enabled.'
  ],
  notAllowed: [
    'No connector actions in this preview',
    'No external service calls',
    'No webhook execution',
    'No integration mutation'
  ],
  futurePhases: [
    'Integration registry management',
    'Connection health dashboard',
    'Webhook configuration UI',
    'Runtime bridge status'
  ],
  sampleData: [
    { label: 'GitHub', value: 'enabled | L1 | code_host' },
    { label: 'Memory Hub', value: 'registered | L1 | memory_provider' },
    { label: 'Knowledge Base', value: 'registered | L1 | knowledge_provider' }
  ],
  backLink: '/openaip-v8-command-center-preview',
  backLabel: 'Back to Command Center'
};

export default function OpenAIPv8IntegrationCenterPreview() {
  return <OpenAIPv8ReadonlyCenterPreview config={config} />;
}
