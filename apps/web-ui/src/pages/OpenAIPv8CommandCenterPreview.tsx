import React from 'react';
import { Link } from 'react-router-dom';
import { getV8RegistryCounts, getV8ConnectorMigrationSummary, getV8ExecutionBoundarySummary } from '../registry/openAipv8CenterData';

const shellStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0b1220 0%, #111827 50%, #0f172a 100%)',
  color: '#e5e7eb',
  padding: '24px'
};

const panelStyle: React.CSSProperties = {
  maxWidth: 1200,
  margin: '0 auto',
  border: '1px solid #374151',
  borderRadius: 12,
  background: 'rgba(15, 23, 42, 0.88)',
  padding: 20
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gap: 12,
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  marginTop: 16
};

const cardStyle: React.CSSProperties = {
  border: '1px solid #334155',
  borderRadius: 10,
  background: '#0b1220',
  padding: 14
};

const badgeStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 600,
  marginRight: 6,
  marginBottom: 4
};

const safetyItems = [
  'Preview only',
  'Read-only',
  'No runtime mutation',
  'Gate CLOSED',
  'Stage C disabled',
  'Config != permission',
  'Enabled != execution',
  'Authorized != gateOpen',
  'Capability != permission',
  'UI switch != backend truth'
];

const counts = getV8RegistryCounts();
const ms = getV8ConnectorMigrationSummary();

interface CenterDef {
  title: string;
  route: string;
  tag: string;
  role: string;
  items: string[];
  safetyNote: string;
  count: number | string;
}

const centers: CenterDef[] = [
  {
    title: 'Agent Center',
    route: '/openaip-v8-agent-center-preview',
    tag: 'readonly',
    role: 'AI Agent Lifecycle & Permissions',
    items: ['AI agents lifecycle: enabled / paused / disabled / quarantined', 'Permission levels L0-L5', 'Task/audit linkage'],
    safetyNote: 'No agent launch, no lifecycle mutation',
    count: counts.agents
  },
  {
    title: 'Task Center',
    route: '/openaip-v8-task-center-preview',
    tag: 'draft',
    role: 'Task Pack & Receipt Pipeline',
    items: ['Task pack generation', 'Receipt intake pipeline', 'Review queue', 'Human-fatigue reduction'],
    safetyNote: 'No task execution, no write',
    count: counts.tasks
  },
  {
    title: 'Provider Manager',
    route: '/openaip-v8-provider-manager-preview',
    tag: 'readonly',
    role: 'Model Provider Routing',
    items: ['CC Switch-like provider/config/router', 'Provider registry', 'Readonly/dry-run first'],
    safetyNote: 'No provider action, dry-run only',
    count: counts.providers
  },
  {
    title: 'Integration Center',
    route: '/openaip-v8-integration-center-preview',
    tag: 'readonly',
    role: 'External Service Binding',
    items: ['OpenClaw', 'GitHub', 'Webhooks/external services', 'Connector → v8 migration bridge'],
    safetyNote: 'No connector action in preview',
    count: counts.integrations
  },
  {
    title: 'Local Apps Center',
    route: '/openaip-v8-local-apps-center-preview',
    tag: 'readonly',
    role: 'Local Micro App Runtime',
    items: ['OpenAxiom as Local App / UI Lab / Vision Tool', 'ComfyUI', 'Ollama / LM Studio', 'YOLO / SAM tools'],
    safetyNote: 'No app launch in preview',
    count: counts.localApps
  },
  {
    title: 'Memory + Knowledge Center',
    route: '/openaip-v8-memory-knowledge-center-preview',
    tag: 'readonly',
    role: 'Long-term Memory & Knowledge',
    items: ['Memory access policy', 'Knowledge source registry', 'Receipt/report indexing'],
    safetyNote: 'No memory write in preview',
    count: counts.memoryKnowledge
  },
  {
    title: 'Policy Router + Capability Center',
    route: '/openaip-v8-policy-capability-center-preview',
    tag: 'readonly',
    role: 'Policy & Capability Governance',
    items: ['Capability != permission', 'Permission levels', 'Policy-before-buttons'],
    safetyNote: 'No policy mutation',
    count: `${counts.policies} policies, ${counts.capabilities} caps`
  },
  {
    title: 'Audit Center',
    route: '/openaip-v8-audit-center-preview',
    tag: 'readonly',
    role: 'Audit Trail & Evidence',
    items: ['Receipts', 'Reports', 'Evidence', 'Commit/push/verification trail'],
    safetyNote: 'Readonly audit trail',
    count: counts.audits
  },
  {
    title: 'Execution Gateway',
    route: '/openaip-v8-execution-gateway-preview',
    tag: 'closed',
    role: 'Execution Gate (closed)',
    items: ['Default closed', 'Gate CLOSED', 'Stage C disabled', 'Dry-run/approval required before future execution', `${getV8ExecutionBoundarySummary().total} execution boundary entries`],
    safetyNote: 'Gate remains closed',
    count: `${getV8ExecutionBoundarySummary().blocked}/${getV8ExecutionBoundarySummary().total} blocked`
  }
];

function SafetyBadge({ text }: { text: string }) {
  const color = text === 'closed' ? '#ef4444' : text === 'draft' ? '#f59e0b' : '#3b82f6';
  return <span style={{ ...badgeStyle, background: color, color: '#fff' }}>{text.toUpperCase()}</span>;
}

export default function OpenAIPv8CommandCenterPreview(): React.JSX.Element {
  return (
    <div style={shellStyle}>
      <div style={panelStyle}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28 }}>OpenAIP v8 Command Center Preview</h1>
            <p style={{ marginTop: 8, color: '#93c5fd', fontSize: 14 }}>各路 AI 工具都是英雄，OpenAIP 是指挥中心。</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ ...badgeStyle, background: '#dc2626', color: '#fff' }}>GATE CLOSED</span>
            <span style={{ ...badgeStyle, background: '#7c3aed', color: '#fff' }}>STAGE C DISABLED</span>
          </div>
        </div>

        {/* Global Status Strip */}
        <div style={{ ...cardStyle, marginTop: 12, borderLeft: '3px solid #f59e0b' }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ ...badgeStyle, background: '#3b82f6', color: '#fff' }}>Readonly Foundation</span>
            <span style={{ ...badgeStyle, background: '#1e293b', color: '#fbbf24', border: '1px solid #fbbf24' }}>Gate CLOSED</span>
            <span style={{ ...badgeStyle, background: '#1e293b', color: '#fbbf24', border: '1px solid #fbbf24' }}>Stage C disabled</span>
            <span style={{ ...badgeStyle, background: '#1e293b', color: '#22c55e', border: '1px solid #22c55e' }}>No runtime mutation</span>
            <span style={{ ...badgeStyle, background: '#1e293b', color: '#93c5fd', border: '1px solid #93c5fd' }}>Registry-backed</span>
            {safetyItems.slice(5).map((item) => (
              <span key={item} style={{ ...badgeStyle, background: '#1e293b', color: '#9ca3af', border: '1px solid #374151' }}>{item}</span>
            ))}
          </div>
          <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>
            All safety boundaries are enforced. This preview does not mutate runtime, write to DB, open Gate, or enable Stage C.
          </p>
        </div>

        {/* Registry Counts Strip */}
        <div style={{ ...cardStyle, marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          {[
            { label: 'Agents', value: counts.agents, color: '#3b82f6' },
            { label: 'Providers', value: counts.providers, color: '#22c55e' },
            { label: 'Integrations', value: counts.integrations, color: '#f97316' },
            { label: 'Local Apps', value: counts.localApps, color: '#a855f7' },
            { label: 'Capabilities', value: counts.capabilities, color: '#ec4899' },
            { label: 'Policies', value: counts.policies, color: '#eab308' },
            { label: 'Tasks', value: counts.tasks, color: '#06b6d4' },
            { label: 'Audits', value: counts.audits, color: '#ef4444' },
            { label: 'Memory/Knowledge', value: counts.memoryKnowledge, color: '#14b8a6' },
            { label: 'Connector Migrations', value: counts.connectorMigrations, color: '#8b5cf6' },
            { label: 'Execution Boundaries', value: counts.executionBoundaries, color: '#ef4444' },
          ].map(item => (
            <div key={item.label} style={{ textAlign: 'center', minWidth: 90 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: item.color }}>{item.value}</div>
              <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Migration Status Strip */}
        <div style={{ ...cardStyle, marginTop: 8, borderLeft: '3px solid #8b5cf6' }}>
          <h3 style={{ margin: 0, fontSize: 12, color: '#8b5cf6', marginBottom: 6 }}>Connector → v8 Migration Status</h3>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: '#22c55e' }}>Migrated: {ms.migrated}</span>
            <span style={{ fontSize: 11, color: '#f97316' }}>In Progress: {ms.inProgress}</span>
            <span style={{ fontSize: 11, color: '#eab308' }}>Planned: {ms.planned}</span>
            <span style={{ fontSize: 11, color: '#6b7280' }}>Total: {ms.total}</span>
            <span style={{ fontSize: 11, color: '#6b7280' }}>
              Legacy: ConnectorCenter → Integration / Local Apps / Provider Manager
            </span>
          </div>
        </div>

        {/* Center Cards Grid */}
        <div style={gridStyle}>
          {centers.map((center) => (
            <Link key={center.title} to={center.route} style={{ textDecoration: 'none', color: 'inherit' }}>
              <section style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <SafetyBadge text={center.tag} />
                  <h2 style={{ margin: 0, fontSize: 15 }}>{center.title}</h2>
                </div>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>{center.role}</div>
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: '#cbd5e1', lineHeight: 1.8 }}>
                  {center.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p style={{ margin: '10px 0 0', fontSize: 11, color: '#6b7280', fontStyle: 'italic' }}>
                  {center.safetyNote}
                </p>
                <div style={{ marginTop: 6, fontSize: 18, fontWeight: 700, color: '#93c5fd', textAlign: 'right' }}>
                  {center.count}
                </div>
              </section>
            </Link>
          ))}
        </div>

        {/* Recommended Next Phase */}
        <div style={{ ...cardStyle, marginTop: 16, borderLeft: '3px solid #22c55e' }}>
          <h3 style={{ margin: 0, fontSize: 13, color: '#22c55e', marginBottom: 6 }}>Recommended Next Phase</h3>
          <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.7 }}>
            <p style={{ margin: '0 0 4px' }}><strong>Readonly route smoke</strong> — Verify all 10 v8 readonly routes load correctly.</p>
            <p style={{ margin: 0 }}><strong>No execution</strong> — All actions remain blocked. Gate stays CLOSED. Stage C stays disabled.</p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 20, padding: 12, border: '1px solid #374151', borderRadius: 8, background: 'rgba(0,0,0,0.3)' }}>
          <p style={{ margin: 0, fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
            OpenAIP v8 Command Center Preview · Read-only · No execution · Gate remains CLOSED · Stage C disabled · Registry-backed data
          </p>
        </div>
      </div>
    </div>
  );
}
