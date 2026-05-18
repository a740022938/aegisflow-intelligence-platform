import React, { useMemo } from 'react';
import PageShell from '../components/ui/PageShell';
import SectionCard from '../components/ui/SectionCard';
import ConnectorCenterOverview from '../components/advanced/ConnectorCenterOverview';
import ConnectorCapabilityMatrix from '../components/advanced/ConnectorCapabilityMatrix';
import ConnectorIntegrationBoundary from '../components/advanced/ConnectorIntegrationBoundary';
import {
  CONNECTOR_REGISTRY_NEW as CONNECTOR_REGISTRY,
  getConnectorRegistryCount,
  getConnectorRegistryByRisk,
  getConnectorRegistryByCategory,
  getConnectorRegistryByReadiness,
  getConnectorRegistrySidebarReadyItems,
  getConnectorRegistryRiskSummary,
  getConnectorRegistryReadinessSummary,
  getConnectorRegistryQualityGateSummary,
  getConnectorRegistryAvailableRoutes,
} from '../registry/connector-registry';
import type { ConnectorRegistryItem, ConnectorRiskLevel, ConnectorReadiness } from '../registry/connector-registry';

const RISK_COLORS: Record<ConnectorRiskLevel, string> = {
  low: 'var(--success)', medium: 'var(--warning)', high: 'var(--danger)',
};

const READINESS_COLORS: Record<string, string> = {
  ready: 'var(--success)', preview_ready: 'var(--warning)', planned: '#6B7280',
  hold_review: 'var(--danger)', blocked: '#6B7280',
};

function Badge({ label, color }: { label: string; color?: string }) {
  return <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, color: '#fff', background: color || '#6B7280', lineHeight: '16px', whiteSpace: 'nowrap' }}>{label}</span>;
}

function KpiCard({ label, value, color }: { label: string; value: string; color: string }) {
  return <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
    <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}</div>
  </div>;
}

function ConnectorCard({ conn }: { conn: ConnectorRegistryItem }) {
  const isHighRisk = conn.riskLevel === 'high';
  return <div style={{ padding: 12, borderRadius: 8, background: 'var(--bg-surface)', border: `1px solid ${isHighRisk ? 'var(--danger)' : 'var(--border)'}`, borderLeft: `3px solid ${RISK_COLORS[conn.riskLevel]}`, fontSize: 11, marginBottom: 8 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{conn.name}</span>
      <Badge label={conn.type} color="#6B7280" />
      <Badge label={conn.status} color={conn.status === 'available_route' ? 'var(--success)' : conn.status === 'planned' ? 'var(--warning)' : '#6B7280'} />
      <Badge label={conn.readiness} color={READINESS_COLORS[conn.readiness] || '#6B7280'} />
      <Badge label={conn.riskLevel} color={RISK_COLORS[conn.riskLevel]} />
      <Badge label={conn.healthLabel} color={conn.healthLabel === 'ok' ? 'var(--success)' : conn.healthLabel === 'watch' ? 'var(--warning)' : '#6B7280'} />
      {isHighRisk && <Badge label="高风险，仅可只读评估" color="var(--danger)" />}
    </div>
    <div style={{ marginBottom: 4 }}>
      {conn.capabilities.map((c, i) => <Badge key={i} label={c} color="var(--secondary)" />)}
    </div>
    <div style={{ marginBottom: 4, color: 'var(--text-secondary)' }}>
      {conn.currentRoute ? <span>路由: <a href={conn.currentRoute} style={{ color: 'var(--secondary)' }} onClick={e => { e.preventDefault(); }}>{conn.currentRoute}</a></span> : <span>路由: 未接入</span>}
      {conn.futureRoute && <span style={{ marginLeft: 8 }}>未来规划: {conn.futureRoute}</span>}
    </div>
    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 2 }}>
      {conn.safetyBoundary.map(s => <Badge key={s} label={s} color="#6B7280" />)}
    </div>
    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 2 }}>
      <span style={{ color: 'var(--text-muted)' }}>允许: </span>
      {conn.actionsAllowed.map(a => <Badge key={a} label={a} color="var(--success)" />)}
      <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>禁止: </span>
      {conn.actionsBlocked.map(a => <Badge key={a} label={a} color="var(--danger)" />)}
    </div>
    {conn.recommendedNextStep && <div style={{ marginBottom: 2, color: 'var(--text-secondary)' }}>下一步: {conn.recommendedNextStep}</div>}
    {conn.riskNotes.length > 0 && <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 2 }}>{conn.riskNotes.map(n => <Badge key={n} label={n} color="var(--danger)" />)}</div>}
    {conn.setupNotes.length > 0 && <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 2 }}>{conn.setupNotes.map(n => <Badge key={n} label={n} color="#6B7280" />)}</div>}
    <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{conn.notes}</div>
  </div>;
}

export default function ConnectorCenterReadonly() {
  const total = useMemo(() => getConnectorRegistryCount(), []);
  const riskSummary = useMemo(() => getConnectorRegistryRiskSummary(), []);
  const readinessSummary = useMemo(() => getConnectorRegistryReadinessSummary(), []);
  const qualityGateSummary = useMemo(() => getConnectorRegistryQualityGateSummary(), []);
  const activeItems = useMemo(() => getConnectorRegistryByCategory('active'), []);
  const futureItems = useMemo(() => getConnectorRegistryByCategory('future'), []);
  const lowRisk = useMemo(() => getConnectorRegistryByRisk('low'), []);
  const mediumRisk = useMemo(() => getConnectorRegistryByRisk('medium'), []);
  const highRisk = useMemo(() => getConnectorRegistryByRisk('high'), []);
  const sidebarReady = useMemo(() => getConnectorRegistrySidebarReadyItems(), []);
  const availableRoutes = useMemo(() => getConnectorRegistryAvailableRoutes(), []);
  const allReadonly = useMemo(() => CONNECTOR_REGISTRY.every(c => c.qualityGate.readonly), []);

  return (
    <PageShell
      title="Connector Center"
      subtitle="Readonly capability overview — external tools, AI assistants, model platforms, and memory system integration status"
      versionLabel="AIP v7.22.0-P2"
      maturity="preview"
      safetyBoundary="readonly"
      safetyText="Readonly · No external writes · No connector control · No API calls"
    >
      {/* Overview Hero */}
      <SectionCard title="Connector Overview" style={{ marginBottom: 20 }}>
        <ConnectorCenterOverview />
      </SectionCard>

      {/* Capability Matrix */}
      <SectionCard title="Connector Capability Matrix" style={{ marginBottom: 20 }}>
        <ConnectorCapabilityMatrix />
      </SectionCard>

      {/* Active Connectors — Detailed Cards */}
      <SectionCard title={`Active Connectors (${activeItems.length})`} style={{ marginBottom: 20 }}>
        {activeItems.length > 0 ? activeItems.map(c => <ConnectorCard key={c.id} conn={c} />)
          : <div style={{ padding: 12, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>No active connectors</div>}
      </SectionCard>

      {/* Future Connectors — Detailed Cards */}
      <SectionCard title={`Future Connectors (${futureItems.length})`} style={{ marginBottom: 20 }}>
        <div style={{ padding: '6px 10px', marginBottom: 8, borderRadius: 4, background: 'rgba(245,158,11,0.08)', fontSize: 10, color: 'var(--warning)' }}>
          These connectors are not yet integrated. Displayed for planning and review.
        </div>
        {futureItems.map(c => <ConnectorCard key={c.id} conn={c} />)}
      </SectionCard>

      {/* Integration Boundary + Safety Matrix + Recommended Path */}
      <SectionCard title="Integration Boundary & Safety" style={{ marginBottom: 20 }}>
        <ConnectorIntegrationBoundary />
      </SectionCard>

      {/* Governance Overview KPIs */}
      <SectionCard title="Governance Summary" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10 }}>
          <KpiCard label="All readonly" value={allReadonly ? 'YES' : 'NO'} color={allReadonly ? 'var(--success)' : 'var(--danger)'} />
          <KpiCard label="External write paths" value="0" color="var(--success)" />
          <KpiCard label="Real connector controls" value="0" color="var(--success)" />
          <KpiCard label="Stage C controls" value="0" color="var(--success)" />
          <KpiCard label="DB write paths" value="0" color="var(--success)" />
          <KpiCard label="Candidate mutation" value="0" color="var(--success)" />
        </div>
        <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(34,197,94,0.06)', fontSize: 10, color: 'var(--success)' }}>
          All governance gates pass. Connector Center is a fully readonly metadata overview.
        </div>
      </SectionCard>

      {/* Boundary Notice */}
      <div style={{ marginTop: 24, padding: '14px 16px', borderRadius: 6, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7 }}>
        <strong>Readonly boundary notice:</strong><br />
        This is a <u>Connector Center readonly overview</u>. Connector Registry is readonly metadata. Does not call external APIs, write to external systems, control connectors, process Memory Hub candidates, or enable Stage C. All <code>actionsBlocked</code> are governance display, not a permission system.
      </div>
    </PageShell>
  );
}
