import OpenAIPv8ReadonlyCenterPreview from './OpenAIPv8ReadonlyCenterPreview';

const config = {
  title: 'Execution Gateway',
  subtitle: '执行网关 — 默认为关闭',
  purpose: '控制所有执行操作的网关，默认关闭。需要人工审批和多层安全验证才能开启。',
  sections: [
    {
      title: 'Gateway State',
      items: [
        'default: CLOSED — 默认关闭',
        'Gate CLOSED — 所有执行被阻止',
        'Stage C disabled — 高级执行能力禁用',
        'Dry-run first — 必须先模拟',
        'Human approval required — 需人工审批',
        'Audit receipt required — 需审计回执'
      ]
    },
    {
      title: 'Gate Opening Requirements',
      items: [
        'Human authorization from authorized operator',
        'Stage C pre-enable review',
        'Dry-run evidence collection',
        'Audit receipt generated',
        'Safety boundary confirmation'
      ]
    },
    {
      title: 'What This Center Will Monitor',
      items: [
        'Gate 开闭状态',
        'Stage C 启用状态',
        '执行请求队列',
        '审批流转状态',
        '安全边界合规性'
      ]
    }
  ],
  keyRules: [
    'Execution is a future gated capability, not available in this preview.',
    'Gate remains CLOSED. Stage C remains disabled.',
    'UI switch does not equal backend truth.',
    'Authorized does not equal gateOpen.',
    'Enabled does not equal execution.'
  ],
  notAllowed: [
    'No execution controls in this preview',
    'No Gate opening',
    'No Stage C enablement',
    'No execution request submission',
    'No approval workflow execution'
  ],
  futurePhases: [
    'Gate open/close controls (gated by human authorization)',
    'Stage C enablement workflow',
    'Execution request queue',
    'Approval dashboard',
    'Dry-run simulation console'
  ],
  sampleData: [
    { label: 'Gate State', value: 'CLOSED' },
    { label: 'Stage C State', value: 'disabled' },
    { label: 'Policy Rule', value: 'configured!=online && authorized!=gateOpen && enabled!=execution' }
  ],
  backLink: '/openaip-v8-command-center-preview',
  backLabel: 'Back to Command Center'
};

export default function OpenAIPv8ExecutionGatewayPreview() {
  return <OpenAIPv8ReadonlyCenterPreview config={config} />;
}
