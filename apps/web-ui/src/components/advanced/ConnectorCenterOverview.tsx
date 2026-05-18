import React, { useMemo } from 'react';
import {
  CONNECTOR_REGISTRY_NEW,
  getConnectorRegistryCount,
  getConnectorRegistryByCategory,
  getConnectorRegistryByRisk,
  getConnectorRegistryRiskSummary,
  getConnectorRegistryReadinessSummary,
  getConnectorRegistrySidebarReadyItems,
} from '../../registry/connector-registry';

const RISK_COLORS: Record<string, string> = {
  low: 'var(--success)', medium: 'var(--warning)', high: 'var(--danger)',
};
const READINESS_COLORS: Record<string, string> = {
  ready: 'var(--success)', preview_ready: 'var(--warning)', planned: '#6B7280',
  hold_review: 'var(--danger)', blocked: '#6B7280',
};
const TYPE_LABELS: Record<string, string> = {
  external_tool: 'External Tool', ai_assistant: 'AI Assistant',
  model_platform: 'Model Platform', memory_system: 'Memory System',
  labeling_tool: 'Labeling Tool', workflow_tool: 'Workflow Tool', future_connector: 'Future',
};
const TYPE_COLORS: Record<string, string> = {
  external_tool: '#6B7280', ai_assistant: '#F97316', model_platform: '#22C55E',
  memory_system: '#8B5CF6', labeling_tool: '#3B82F6', workflow_tool: '#EF4444', future_connector: '#6B7280',
};

export default function ConnectorCenterOverview() {
  const total = useMemo(() => getConnectorRegistryCount(), []);
  const riskSummary = useMemo(() => getConnectorRegistryRiskSummary(), []);
  const readinessSummary = useMemo(() => getConnectorRegistryReadinessSummary(), []);
  const activeItems = useMemo(() => getConnectorRegistryByCategory('active'), []);
  const futureItems = useMemo(() => getConnectorRegistryByCategory('future'), []);
  const sidebarReady = useMemo(() => getConnectorRegistrySidebarReadyItems(), []);

  const typeBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of CONNECTOR_REGISTRY_NEW) {
      map[c.type] = (map[c.type] || 0) + 1;
    }
    return map;
  }, []);

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Connector Center</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Readonly capability overview — external tools, AI assistants, model platforms, and memory systems</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 14 }}>
        <KpiCard label="Total" value={String(total)} color="var(--primary)" />
        <KpiCard label="Active" value={String(activeItems.length)} color="var(--success)" />
        <KpiCard label="Future" value={String(futureItems.length)} color="var(--warning)" />
        <KpiCard label="Low risk" value={String(riskSummary.low)} color="var(--success)" />
        <KpiCard label="Medium risk" value={String(riskSummary.medium)} color="var(--warning)" />
        <KpiCard label="High risk" value={String(riskSummary.high)} color="var(--danger)" />
        <KpiCard label="Sidebar ready" value={String(sidebarReady.length)} color="var(--success)" />
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14, fontSize: 10 }}>
        {Object.entries(typeBreakdown).map(([type, count]) => (
          <span key={type} style={{ padding: '4px 10px', borderRadius: 12, background: `${TYPE_COLORS[type]}18`, color: TYPE_COLORS[type], fontWeight: 500 }}>{TYPE_LABELS[type] || type} {count}</span>
        ))}
        {Object.entries(readinessSummary).filter(([k]) => k !== 'total').filter(([, v]) => v > 0).map(([key, count]) => (
          <span key={key} style={{ padding: '4px 10px', borderRadius: 12, background: `${READINESS_COLORS[key]}18`, color: READINESS_COLORS[key], fontWeight: 500 }}>{key} {count}</span>
        ))}
      </div>
    </div>
  );
}

function KpiCard({ label, value, color }: { label: string; value: string; color: string }) {
  return <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
    <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}</div>
  </div>;
}
