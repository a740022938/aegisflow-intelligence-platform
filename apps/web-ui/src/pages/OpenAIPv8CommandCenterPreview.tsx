import React from 'react';
import { Link } from 'react-router-dom';
import { getV8RegistryCounts, getV8ConnectorMigrationSummary, getV8ExecutionBoundarySummary } from '../registry/openAipv8CenterData';
import { getOpenAipv8Copy, type OpenAipv8CenterKey } from './openAipv8Copy';

const shellStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0b1220 0%, #111827 50%, #0f172a 100%)',
  color: '#e5e7eb',
  padding: '24px'
};
const panelStyle: React.CSSProperties = {
  maxWidth: 1200, margin: '0 auto', border: '1px solid #374151',
  borderRadius: 12, background: 'rgba(15, 23, 42, 0.88)', padding: 20
};
const gridStyle: React.CSSProperties = {
  display: 'grid', gap: 12,
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginTop: 16
};
const cardStyle: React.CSSProperties = {
  border: '1px solid #334155', borderRadius: 10, background: '#0b1220', padding: 14
};
const badgeStyle: React.CSSProperties = {
  display: 'inline-block', padding: '2px 8px', borderRadius: 4,
  fontSize: 11, fontWeight: 600, marginRight: 6, marginBottom: 4
};

const counts = getV8RegistryCounts();
const ms = getV8ConnectorMigrationSummary();

interface CenterDef { key: OpenAipv8CenterKey; route: string; tag: string; }

const centers: CenterDef[] = [
  { key: 'agent', route: '/openaip-v8-agent-center-preview', tag: 'readonly' },
  { key: 'task', route: '/openaip-v8-task-center-preview', tag: 'draft' },
  { key: 'provider', route: '/openaip-v8-provider-manager-preview', tag: 'readonly' },
  { key: 'integration', route: '/openaip-v8-integration-center-preview', tag: 'readonly' },
  { key: 'localApps', route: '/openaip-v8-local-apps-center-preview', tag: 'readonly' },
  { key: 'memory', route: '/openaip-v8-memory-knowledge-center-preview', tag: 'readonly' },
  { key: 'policy', route: '/openaip-v8-policy-capability-center-preview', tag: 'readonly' },
  { key: 'audit', route: '/openaip-v8-audit-center-preview', tag: 'readonly' },
  { key: 'execution', route: '/openaip-v8-execution-gateway-preview', tag: 'closed' },
];

const registryColors: Record<string, string> = {
  agents: '#3b82f6', providers: '#22c55e', integrations: '#f97316',
  localApps: '#a855f7', capabilities: '#ec4899', policies: '#eab308',
  tasks: '#06b6d4', audits: '#ef4444', memoryKnowledge: '#14b8a6',
  connectorMigrations: '#8b5cf6', executionBoundaries: '#ef4444',
};

const registryCountKeys = ['agents', 'providers', 'integrations', 'localApps', 'capabilities', 'policies', 'tasks', 'audits', 'memoryKnowledge', 'connectorMigrations', 'executionBoundaries'] as const;

const countMap: Record<OpenAipv8CenterKey, number | string> = {
  agent: counts.agents,
  task: counts.tasks,
  provider: counts.providers,
  integration: counts.integrations,
  localApps: counts.localApps,
  memory: counts.memoryKnowledge,
  policy: `${counts.policies} policies, ${counts.capabilities} caps`,
  audit: counts.audits,
  execution: `${getV8ExecutionBoundarySummary().blocked}/${getV8ExecutionBoundarySummary().total} blocked`,
  command: 0,
};

function SafetyBadge({ text }: { text: string }) {
  const color = text === 'closed' ? '#ef4444' : text === 'draft' ? '#f59e0b' : '#3b82f6';
  return <span style={{ ...badgeStyle, background: color, color: '#fff' }}>{text.toUpperCase()}</span>;
}

export default function OpenAIPv8CommandCenterPreview(): React.JSX.Element {
  const copy = getOpenAipv8Copy('command');
  return (
    <div style={shellStyle}>
      <div style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28 }}>{copy.title}</h1>
            <p style={{ marginTop: 8, color: '#93c5fd', fontSize: 14 }}>{copy.subtitle} · {copy.tagline}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ ...badgeStyle, background: '#dc2626', color: '#fff' }}>{copy.globalSafetyBadges[2]}</span>
            <span style={{ ...badgeStyle, background: '#7c3aed', color: '#fff' }}>{copy.globalSafetyBadges[3]}</span>
          </div>
        </div>

        <div style={{ ...cardStyle, marginTop: 12, borderLeft: '3px solid #f59e0b' }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
            {copy.globalSafetyBadges.map((badge) => (
              <span key={badge} style={{ ...badgeStyle, background: '#1e293b', color: '#9ca3af', border: '1px solid #374151' }}>{badge}</span>
            ))}
            {copy.extendedSafetyItems.slice(5).map((item) => (
              <span key={item} style={{ ...badgeStyle, background: '#1e293b', color: '#9ca3af', border: '1px solid #374151' }}>{item}</span>
            ))}
          </div>
          <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{copy.safetyPreamble}</p>
        </div>

        <div style={{ ...cardStyle, marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          {registryCountKeys.map((key, idx) => {
            const v = counts[key];
            return (
              <div key={key} style={{ textAlign: 'center', minWidth: 90 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: registryColors[key] }}>{v}</div>
                <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{copy.registryLabels[idx]}</div>
              </div>
            );
          })}
        </div>

        <div style={{ ...cardStyle, marginTop: 8, borderLeft: '3px solid #8b5cf6' }}>
          <h3 style={{ margin: 0, fontSize: 12, color: '#8b5cf6', marginBottom: 6 }}>{copy.migrationStatusLabels.heading}</h3>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: '#22c55e' }}>{copy.migrationStatusLabels.migrated}: {ms.migrated}</span>
            <span style={{ fontSize: 11, color: '#f97316' }}>{copy.migrationStatusLabels.inProgress}: {ms.inProgress}</span>
            <span style={{ fontSize: 11, color: '#eab308' }}>{copy.migrationStatusLabels.planned}: {ms.planned}</span>
            <span style={{ fontSize: 11, color: '#6b7280' }}>{copy.migrationStatusLabels.total}: {ms.total}</span>
            <span style={{ fontSize: 11, color: '#6b7280' }}>{copy.migrationStatusLabels.legacy}</span>
          </div>
        </div>

        <div style={gridStyle}>
          {centers.map((center) => {
            const c = getOpenAipv8Copy(center.key, copy.lang);
            return (
              <Link key={center.key} to={center.route} style={{ textDecoration: 'none', color: 'inherit' }}>
                <section style={cardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <SafetyBadge text={center.tag} />
                    <h2 style={{ margin: 0, fontSize: 15 }}>{c.title}</h2>
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>{c.centerRole}</div>
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: '#cbd5e1', lineHeight: 1.8 }}>
                    {c.centerItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p style={{ margin: '10px 0 0', fontSize: 11, color: '#6b7280', fontStyle: 'italic' }}>
                    {c.noActionBadges.join(' · ')}
                  </p>
                  <div style={{ marginTop: 6, fontSize: 18, fontWeight: 700, color: '#93c5fd', textAlign: 'right' }}>
                    {countMap[center.key]}
                  </div>
                </section>
              </Link>
            );
          })}
        </div>

        <div style={{ ...cardStyle, marginTop: 16, borderLeft: '3px solid #22c55e' }}>
          <h3 style={{ margin: 0, fontSize: 13, color: '#22c55e', marginBottom: 6 }}>{copy.nextPhase.heading}</h3>
          <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.7 }}>
            {copy.nextPhase.items.map((item, idx) => (
              <p key={idx} style={{ margin: '0 0 4px' }}>{item}</p>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 20, padding: 12, border: '1px solid #374151', borderRadius: 8, background: 'rgba(0,0,0,0.3)' }}>
          <p style={{ margin: 0, fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
            OpenAIP v8 · {copy.title} · {copy.globalSafetyBadges.join(' · ')}
          </p>
        </div>
      </div>
    </div>
  );
}
