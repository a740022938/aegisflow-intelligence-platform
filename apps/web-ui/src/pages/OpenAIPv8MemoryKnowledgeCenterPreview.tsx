import OpenAIPv8ReadonlyCenterPreview from './OpenAIPv8ReadonlyCenterPreview';
import { V8_MEMORY_KNOWLEDGE, getV8MemoryKnowledgeSummary } from '../registry/openAipv8CenterData';

const s = getV8MemoryKnowledgeSummary();
const config = {
  title: 'Memory + Knowledge Center',
  subtitle: '长期项目大脑与知识源管理',
  purpose: '管理内存访问策略和知识源注册，是项目的长期记忆和知识中枢。',
  sections: [
    {
      title: 'Memory Access Modes',
      items: [
        'none — 无内存访问',
        'readonly — 只读访问',
        'scoped_write_draft — 限定范围草稿写入',
        'full_write_prohibited_by_default — 默认禁止完全写入'
      ]
    },
    {
      title: 'Knowledge Source Registry',
      items: [
        'docs — 文档',
        'reports — 报告',
        'receipts — 回执',
        'repo — 代码仓库',
        'datasets — 数据集',
        'local files — 本地文件'
      ]
    },
    {
      title: 'Registry Summary',
      items: [
        `Total entries: ${s.total}`,
        `Readonly access: ${s.readonly}`,
        `Scoped write (disabled): ${s.scopedWrite}`,
        `Enabled: ${s.enabled}`,
      ]
    }
  ],
  registryTables: [
    {
      title: `Memory + Knowledge Registry (${V8_MEMORY_KNOWLEDGE.length} entries)`,
      columns: [
        { label: 'Source', key: 'source' },
        { label: 'Access Mode', key: 'accessMode' },
        { label: 'Lifecycle', key: 'lifecycle' },
        { label: 'Permission', key: 'permissionLevel' },
      ],
      rows: V8_MEMORY_KNOWLEDGE.map(m => ({ source: m.source, accessMode: m.accessMode, lifecycle: m.lifecycle, permissionLevel: m.permissionLevel }))
    }
  ],
  keyRules: [
    'Memory write requires explicit policy and review.',
    'Readonly access is the default safe mode.',
    'Knowledge source registration does not authorize content extraction.',
    'Receipt indexing is append-only.'
  ],
  notAllowed: [
    'No memory write in this preview',
    'No knowledge source mutation',
    'No content extraction',
    'No policy changes'
  ],
  futurePhases: [
    'Memory access policy UI',
    'Knowledge source management',
    'Receipt/report search and indexing',
    'Retrieval-augmented generation (RAG) pipeline'
  ],
  sampleData: [
    { label: 'Memory Access', value: 'readonly (default) | scoped_write_draft (restricted)' },
    { label: 'Knowledge Sources', value: 'docs, reports, receipts, repo, datasets, local files' },
    { label: 'Indexing State', value: 'append-only, no deletion in preview' }
  ],
  backLink: '/openaip-v8-command-center-preview',
  backLabel: 'Back to Command Center'
};

export default function OpenAIPv8MemoryKnowledgeCenterPreview() {
  return <OpenAIPv8ReadonlyCenterPreview config={config} />;
}
