import OpenAIPv8ReadonlyCenterPreview from './OpenAIPv8ReadonlyCenterPreview';
import { V8_AGENTS, getV8AgentCenterSummary } from '../registry/openAipv8CenterData';

const s = getV8AgentCenterSummary();
const config = {
  title: 'Agent Center',
  subtitle: 'AI Agent 生命周期管理',
  purpose: '管理 AI Agent 的注册、生命周期和权限等级，是 OpenAIP v8 的主线中心。',
  role: 'Agent registry, lifecycle states, and L0-L5 permission levels',
  sections: [
    {
      title: 'Agent Lifecycle',
      items: [
        'enabled — Agent 已启用并可执行',
        'paused — Agent 暂停，保留状态',
        'disabled — Agent 禁用，不可操作',
        'quarantined — Agent 隔离，需审查'
      ]
    },
    {
      title: 'Permission Levels',
      items: [
        'L0 — 无权限',
        'L1 — 只读观察',
        'L2 — 只读 + 回执',
        'L3 — 受限执行',
        'L4 — 授权执行',
        'L5 — 完全控制'
      ]
    },
    {
      title: 'Registry Summary',
      items: [
        `Total agents: ${s.total}`,
        `Enabled: ${s.enabled}`,
        `Configured: ${s.configured}`,
        `Online: ${s.online}`,
        `Authorized: ${s.authorized}`,
        `Gate open: ${s.gateOpen}`,
      ]
    }
  ],
  registryTables: [
    {
      title: `Agent Registry (${V8_AGENTS.length} entries)`,
      columns: [
        { label: 'Name', key: 'name' },
        { label: 'Kind', key: 'integrationKind' },
        { label: 'Lifecycle', key: 'lifecycle' },
        { label: 'Permission', key: 'permissionLevel' },
        { label: 'Online', key: 'online' },
        { label: 'Authorized', key: 'authorized' },
      ],
      rows: V8_AGENTS.map(a => ({ name: a.name, integrationKind: a.integrationKind, lifecycle: a.lifecycle, permissionLevel: a.permissionLevel, online: a.online, authorized: a.authorized }))
    }
  ],
  keyRules: [
    'Agent registered does not mean execution allowed.',
    'Enabled != execution without Gate open.',
    'Authorized != gateOpen.',
    'Permission level is a maximum ceiling, not an automatic grant.'
  ],
  notAllowed: [
    'No agent execution in this preview',
    'No lifecycle mutation',
    'No permission level changes',
    'No agent launch or stop'
  ],
  futurePhases: [
    'Agent registration and lifecycle UI',
    'Permission level assignment with audit trail',
    'Agent health dashboard',
    'Task-agent binding'
  ],
  sampleData: [
    { label: 'OpenClaw', value: 'enabled | L1 | runtime_service' },
    { label: 'Codex', value: 'registered | L1 | coding_agent' },
    { label: 'Future Agent', value: 'placeholder | L0 | pending' }
  ],
  relatedCenters: [
    { title: 'Task Center', route: '/openaip-v8-task-center-preview' },
    { title: 'Policy Router + Capability Center', route: '/openaip-v8-policy-capability-center-preview' },
  ],
  backLink: '/openaip-v8-command-center-preview'
};

export default function OpenAIPv8AgentCenterPreview() {
  return <OpenAIPv8ReadonlyCenterPreview config={config} />;
}
