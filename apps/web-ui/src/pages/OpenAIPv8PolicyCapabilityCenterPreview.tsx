import OpenAIPv8ReadonlyCenterPreview from './OpenAIPv8ReadonlyCenterPreview';
import { V8_POLICIES, V8_CAPABILITIES, getV8PolicySummary, getV8CapabilitySummary } from '../registry/openAipv8CenterData';

const ps = getV8PolicySummary();
const cs = getV8CapabilitySummary();
const config = {
  title: 'Policy Router + Capability Center',
  subtitle: '策略路由与能力管理',
  purpose: '能力不等于权限，政策先于按钮。管理风险等级和权限映射。',
  role: 'Policy registry, capability catalog with risk levels, and L0-L5 permission mapping',
  sections: [
    {
      title: 'Capability vs Permission',
      items: [
        'Capability — 能力：系统能做什么',
        'Permission — 权限：当前上下文允许做什么',
        'capability != permission — 两者独立的',
        'A capability can be visible and still blocked.'
      ]
    },
    {
      title: 'Risk Levels',
      items: [
        'low — 低风险，只读操作',
        'medium — 中风险，需确认',
        'high — 高风险，需审批',
        'critical — 严重风险，Gate + Stage C 均需开启'
      ]
    },
    {
      title: 'L0-L5 Permission Mapping',
      items: [
        'L0: 无权限，仅可查看公开信息',
        'L1: 只读，可查看配置和状态',
        'L2: 只读 + 生成回执',
        'L3: 受限执行，需审批',
        'L4: 授权执行，可执行已授权操作',
        'L5: 完全控制'
      ]
    },
    {
      title: 'Registry Summary',
      items: [
        `Policies: ${ps.total} (${ps.gateClosed} gate closed, ${ps.stageCDisabled} Stage C disabled)`,
        `Capabilities: ${cs.total} (low=${cs.low}, medium=${cs.medium}, high=${cs.high}, critical=${cs.critical})`,
        `Capabilities requiring Gate: ${cs.requiresGate}`,
        `Capabilities requiring Stage C: ${cs.requiresStageC}`,
      ]
    }
  ],
  registryTables: [
    {
      title: `Policy Registry (${V8_POLICIES.length} entries)`,
      columns: [
        { label: 'ID', key: 'id' },
        { label: 'Gate Open', key: 'gateOpen' },
        { label: 'Stage C', key: 'stageCEnabled' },
        { label: 'Rule', key: 'rule' },
      ],
      rows: V8_POLICIES.map(p => ({ id: p.id, gateOpen: p.gateOpen, stageCEnabled: p.stageCEnabled, rule: p.rule }))
    },
    {
      title: `Capability Registry (${V8_CAPABILITIES.length} entries)`,
      columns: [
        { label: 'ID', key: 'id' },
        { label: 'Risk', key: 'risk' },
        { label: 'Permission', key: 'permissionLevel' },
        { label: 'Requires Gate', key: 'requiresGate' },
        { label: 'Requires Stage C', key: 'requiresStageC' },
      ],
      rows: V8_CAPABILITIES.map(c => ({ id: c.id, risk: c.risk, permissionLevel: c.permissionLevel, requiresGate: c.requiresGate, requiresStageC: c.requiresStageC }))
    }
  ],
  keyRules: [
    'A capability can be visible and still blocked.',
    'Permission level is a ceiling, not a grant.',
    'Policy-before-buttons: check policy before showing action UI.',
    'Dry-run-first: simulate before actual execution.',
    'Config != permission. Enabled != execution.'
  ],
  notAllowed: [
    'No policy mutation in this preview',
    'No capability level changes',
    'No risk level reclassification',
    'No permission grant'
  ],
  futurePhases: [
    'Policy rule editor (readonly review first)',
    'Capability catalog with risk classification',
    'Permission level visualizer',
    'Dry-run simulation console'
  ],
  sampleData: [
    { label: 'policy.default', value: 'gateOpen=false | stageCEnabled=false' },
    { label: 'cap.runtime.status', value: 'risk=low | L1 | requiresGate=false' },
    { label: 'cap.runtime.execute', value: 'risk=critical | L5 | requiresGate=true | requiresStageC=true' }
  ],
  relatedCenters: [
    { title: 'Agent Center', route: '/openaip-v8-agent-center-preview' },
    { title: 'Execution Gateway', route: '/openaip-v8-execution-gateway-preview' },
  ],
  backLink: '/openaip-v8-command-center-preview'
};

export default function OpenAIPv8PolicyCapabilityCenterPreview() {
  return <OpenAIPv8ReadonlyCenterPreview config={config} />;
}
