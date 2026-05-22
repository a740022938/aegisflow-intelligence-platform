import OpenAIPv8ReadonlyCenterPreview from './OpenAIPv8ReadonlyCenterPreview';

const config = {
  title: 'Audit Center',
  subtitle: '审计链与凭证管理',
  purpose: '记录所有操作的回执、报告和证据，形成不可篡改的审计链。',
  sections: [
    {
      title: 'Audit Trail Contents',
      items: [
        'Reports — 阶段报告',
        'Receipts — 操作回执',
        'Evidence — 验证证据',
        'Commit/push status — 提交状态追踪',
        'Verification trail — 验证链'
      ]
    },
    {
      title: 'Receipt States',
      items: [
        'pending — 等待生成',
        'draft — 草稿',
        'verified — 已验证',
        'archived — 已归档'
      ]
    },
    {
      title: 'What This Center Will Manage',
      items: [
        '自动生成操作回执',
        '证据链收集与验证',
        '合规审计报告',
        '安全状态摘要'
      ]
    }
  ],
  keyRules: [
    'No all-done receipt without evidence.',
    'Every receipt must link to a commit or verification result.',
    'Audit trail is append-only; no deletion.',
    'Safety summary must accompany every phase receipt.'
  ],
  notAllowed: [
    'No audit DB write in this preview',
    'No receipt mutation',
    'No evidence store write',
    'No audit trail purge'
  ],
  futurePhases: [
    'Automatic receipt generation on phase completion',
    'Evidence collection and validation',
    'Compliance report generation',
    'Safety summary dashboard'
  ],
  sampleData: [
    { label: 'P1A Receipt', value: 'passed | abc123' },
    { label: 'P1B Receipt', value: 'passed | def456' },
    { label: 'P1C Receipt', value: 'passed | 789abc' }
  ],
  backLink: '/openaip-v8-command-center-preview',
  backLabel: 'Back to Command Center'
};

export default function OpenAIPv8AuditCenterPreview() {
  return <OpenAIPv8ReadonlyCenterPreview config={config} />;
}
