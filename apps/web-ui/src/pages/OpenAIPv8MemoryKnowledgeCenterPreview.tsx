import OpenAIPv8ReadonlyCenterPreview from './OpenAIPv8ReadonlyCenterPreview';
import { V8_MEMORY_KNOWLEDGE, V8_MEMORY_KNOWLEDGE_RELATIONS, getV8MemoryKnowledgeSummary } from '../registry/openAipv8CenterData';
const s = getV8MemoryKnowledgeSummary();
const config = {
  title: 'OpenAIP v8 Memory + Knowledge Center Preview',
  subtitle: 'Readonly Preview · Gate CLOSED · Stage C disabled',
  purpose: 'Long-term project intelligence registry with readonly memory/knowledge relations.',
  role: 'Memory access policy, knowledge source registry, and pitfalls/evidence governance',
  sections: [
    { title: 'Memory/Knowledge Summary Strip', items: [
      `Total sources: ${s.total}`, `Memory sources: ${s.memorySources}`, `Knowledge sources: ${s.knowledgeSources}`,
      `Receipt/report sources: ${V8_MEMORY_KNOWLEDGE.filter(x => x.kind === 'receipt_index' || x.kind === 'report_index').length}`,
      `Indexing blocked: ${s.indexingBlocked}`, `Write blocked: ${s.writeBlocked}`, `External-call blocked: ${s.externalCallBlocked}`, `Readonly count: ${s.readonly}`
    ]},
    { title: 'Memory Access Modes', items: ['none','readonly','scoped_write_draft','full_write_prohibited_by_default','This preview does not write memory.'] },
    { title: 'Knowledge Source Registry', items: ['docs','reports','receipts','repo/git','datasets','local files','external knowledge sources','This preview does not run indexing jobs or external knowledge calls.'] },
    { title: 'Known Pitfalls', items: ['stale runtime','false ON UI','cwd root bug','hardcoded version','config=permission','enabled=execution','all-done without evidence','overlarge task packs','user fatigue'] }
  ],
  registryTables: [
    { title: `Memory/Knowledge Source Matrix (${V8_MEMORY_KNOWLEDGE.length} entries)`, columns: [
      { label: 'Name', key: 'name' }, { label: 'Kind', key: 'kind' }, { label: 'Source Type', key: 'sourceType' },
      { label: 'Access', key: 'accessMode' }, { label: 'Write', key: 'writeState' }, { label: 'Indexing', key: 'indexingState' },
      { label: 'Related Centers', key: 'relatedCenters' }, { label: 'Risk', key: 'risk' }, { label: 'Permission', key: 'permissionRequired' },
      { label: 'Allowed', key: 'allowedInPreview' }, { label: 'Blocked Actions', key: 'blockedActions' }
    ], rows: V8_MEMORY_KNOWLEDGE.map(m => ({ ...m, relatedCenters: m.relatedCenters.join(', '), blockedActions: (m.blockedActions || []).join(', ') })) },
    { title: `Relation Matrix (${V8_MEMORY_KNOWLEDGE_RELATIONS.length} rows)`, columns: [
      { label: 'Source', key: 'sourceId' }, { label: 'Related Center', key: 'relatedCenter' }, { label: 'Relationship', key: 'relationship' },
      { label: 'Preview State', key: 'currentPreviewState' }, { label: 'Blocked Actions', key: 'blockedActions' }, { label: 'Risk', key: 'risk' },
      { label: 'Policy', key: 'requiredPolicy' }, { label: 'Audit', key: 'auditRequired' }
    ], rows: V8_MEMORY_KNOWLEDGE_RELATIONS.map(r => ({ ...r, blockedActions: r.blockedActions.join(', ') })) }
  ],
  keyRules: ['memory visible != memory writable','knowledge source registered != indexed','indexed concept != indexing job executed','no memory write in preview'],
  notAllowed: ['No memory write','No vector DB write','No indexing job','No external knowledge call','No DB write','No config write','No Gate opening','No Stage C enablement'],
  futurePhases: ['Gated memory write pipeline','knowledge indexing orchestration','cross-center evidence retrieval'],
  sampleData: [{ label: 'Safety', value: 'No runtime mutation' }],
  relatedCenters: [
    { title: 'Task Center', route: '/openaip-v8-task-center-preview' },
    { title: 'Audit Center', route: '/openaip-v8-audit-center-preview' },
    { title: 'Policy Capability Center', route: '/openaip-v8-policy-capability-center-preview' },
    { title: 'Local Apps Center', route: '/openaip-v8-local-apps-center-preview' },
    { title: 'Provider Manager', route: '/openaip-v8-provider-manager-preview' },
    { title: 'Execution Gateway', route: '/openaip-v8-execution-gateway-preview' },
    { title: 'Command Center', route: '/openaip-v8-command-center-preview' }
  ],
  backLink: '/openaip-v8-command-center-preview'
};
export default function OpenAIPv8MemoryKnowledgeCenterPreview() { return <OpenAIPv8ReadonlyCenterPreview config={config} />; }
