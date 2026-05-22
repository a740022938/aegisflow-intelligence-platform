import OpenAIPv8ReadonlyCenterPreview from './OpenAIPv8ReadonlyCenterPreview';
import { V8_INTEGRATIONS, V8_CONNECTOR_MIGRATIONS, getV8IntegrationSummary, getV8ConnectorMigrationSummary } from '../registry/openAipv8CenterData';

const s = getV8IntegrationSummary();
const ms = getV8ConnectorMigrationSummary();
const config = {
  title: 'Integration Center',
  subtitle: '外部服务绑定与桥接管理',
  purpose: '管理外部工具和服务的集成，包括 OpenClaw、GitHub、Webhook 等。包含 Connector Center 迁移桥接。',
  role: 'External service registry, integration lifecycle, and legacy connector migration bridge',
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
      title: 'Registry Summary',
      items: [
        `Total integrations: ${s.total}`,
        `Enabled: ${s.enabled}`,
        `Registered: ${s.registered}`,
      ]
    },
    {
      title: 'Connector → v8 Migration Bridge',
      items: [
        `Total migration entries: ${ms.total}`,
        `Migrated: ${ms.migrated}`,
        `In progress: ${ms.inProgress}`,
        `Planned: ${ms.planned}`,
        'Legacy Connector Center is being absorbed into v8 Integration Center.',
        'ConnectorCenterReadonly page shows migration banner linking here.',
      ]
    }
  ],
  registryTables: [
    {
      title: `Integration Registry (${V8_INTEGRATIONS.length} entries)`,
      columns: [
        { label: 'Name', key: 'name' },
        { label: 'Kind', key: 'kind' },
        { label: 'Lifecycle', key: 'lifecycle' },
        { label: 'Permission', key: 'permissionLevel' },
      ],
      rows: V8_INTEGRATIONS.map(i => ({ name: i.name, kind: i.kind, lifecycle: i.lifecycle, permissionLevel: i.permissionLevel }))
    },
    {
      title: `Connector → v8 Migration Registry (${V8_CONNECTOR_MIGRATIONS.length} entries)`,
      columns: [
        { label: 'Legacy Connector', key: 'legacyConnectorName' },
        { label: 'v8 Center', key: 'v8Center' },
        { label: 'Mapping', key: 'v8Mapping' },
        { label: 'Status', key: 'migrationStatus' },
      ],
      rows: V8_CONNECTOR_MIGRATIONS.map(m => ({ legacyConnectorName: m.legacyConnectorName, v8Center: m.v8Center, v8Mapping: m.v8Mapping, migrationStatus: m.migrationStatus }))
    }
  ],
  keyRules: [
    'Integration online does not mean connector action allowed.',
    'Integration enabled does not mean execution authorized.',
    'Connector actions require Gate open and Stage C enabled.',
    'Legacy Connector Center is read-only; use v8 Integration Center for new integrations.'
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
  relatedCenters: [
    { title: 'Provider Manager', route: '/openaip-v8-provider-manager-preview' },
    { title: 'Local Apps Center', route: '/openaip-v8-local-apps-center-preview' },
    { title: 'Memory + Knowledge Center', route: '/openaip-v8-memory-knowledge-center-preview' },
  ],
  backLink: '/openaip-v8-command-center-preview'
};

export default function OpenAIPv8IntegrationCenterPreview() {
  return <OpenAIPv8ReadonlyCenterPreview config={config} />;
}
