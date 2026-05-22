import OpenAIPv8ReadonlyCenterPreview from './OpenAIPv8ReadonlyCenterPreview';

const config = {
  title: 'Task Center',
  subtitle: '任务包生成与回执管理',
  purpose: '生成任务包、管理回执接收、减少人工复制粘贴的重复劳动。',
  sections: [
    {
      title: 'Task Pack Generator',
      items: [
        '从中心配置自动生成任务包',
        'Agent assignment draft',
        'Receipt intake pipeline',
        'Review queue for human approval'
      ]
    },
    {
      title: 'Task States',
      items: [
        'pending_review — 待人工审核',
        'accepted — 已接受',
        'rejected — 已拒绝',
        'needs_evidence — 需要补充凭证',
        'blocked — 阻塞',
        'archived — 已归档'
      ]
    },
    {
      title: 'Human Fatigue Reduction',
      items: [
        '自动生成标准回执模板',
        '批量任务状态追踪',
        '证据链自动关联',
        '减少手动复制粘贴'
      ]
    }
  ],
  keyRules: [
    'Task generated does not mean execution authorized.',
    'Receipt required before execution acceptance.',
    'Review queue requires human approval for execution tasks.',
    'No all-done receipt without evidence.'
  ],
  notAllowed: [
    'No task execution in this preview',
    'No receipt write',
    'No review queue mutation',
    'No agent assignment execution'
  ],
  futurePhases: [
    'Task pack generation from center state',
    'Receipt intake with validation',
    'Review queue dashboard',
    'Human fatigue analytics'
  ],
  sampleData: [
    { label: 'Task Pack Registry', value: 'draft | L1 | receipt=true' },
    { label: 'Receipt Intake Pipeline', value: 'draft | L1 | review=true' },
    { label: 'Human Review Queue', value: 'draft | L2 | receipt=true' }
  ],
  backLink: '/openaip-v8-command-center-preview',
  backLabel: 'Back to Command Center'
};

export default function OpenAIPv8TaskCenterPreview() {
  return <OpenAIPv8ReadonlyCenterPreview config={config} />;
}
