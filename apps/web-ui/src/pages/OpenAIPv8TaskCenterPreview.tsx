import OpenAIPv8ReadonlyCenterPreview from './OpenAIPv8ReadonlyCenterPreview';
import { V8_TASKS, getV8TaskSummary } from '../registry/openAipv8CenterData';

const s = getV8TaskSummary();
const config = {
  title: 'Task Center',
  subtitle: '任务包生成与回执管理',
  purpose: '生成任务包、管理回执接收、减少人工复制粘贴的重复劳动。',
  role: 'Task pack generation, receipt intake, review queue, and human-fatigue reduction pipeline',
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
      title: 'Registry Summary',
      items: [
        `Total tasks: ${s.total}`,
        `Draft: ${s.draft}`,
        `Receipt required: ${s.receiptRequired}`,
        `Review required: ${s.reviewRequired}`,
      ]
    }
  ],
  registryTables: [
    {
      title: `Task Registry (${V8_TASKS.length} entries)`,
      columns: [
        { label: 'Name', key: 'name' },
        { label: 'Lifecycle', key: 'lifecycle' },
        { label: 'Permission', key: 'permissionLevel' },
        { label: 'Receipt', key: 'receiptRequired' },
        { label: 'Review', key: 'reviewRequired' },
      ],
      rows: V8_TASKS.map(t => ({ name: t.name, lifecycle: t.lifecycle, permissionLevel: t.permissionLevel, receiptRequired: t.receiptRequired, reviewRequired: t.reviewRequired }))
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
  relatedCenters: [
    { title: 'Audit Center', route: '/openaip-v8-audit-center-preview' },
    { title: 'Agent Center', route: '/openaip-v8-agent-center-preview' },
  ],
  backLink: '/openaip-v8-command-center-preview'
};

export default function OpenAIPv8TaskCenterPreview() {
  return <OpenAIPv8ReadonlyCenterPreview config={config} />;
}
