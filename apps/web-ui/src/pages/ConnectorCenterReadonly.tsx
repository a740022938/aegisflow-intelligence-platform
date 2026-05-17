import React, { useMemo } from 'react';
import PageShell from '../components/ui/PageShell';
import SectionCard from '../components/ui/SectionCard';
import {
  CONNECTOR_REGISTRY_NEW as CONNECTOR_REGISTRY,
  getConnectorRegistryCount,
  getConnectorRegistryByRisk,
  getConnectorRegistryByCategory,
  getConnectorRegistryByReadiness,
  getConnectorRegistrySidebarReadyItems,
  getConnectorRegistryRiskSummary,
  getConnectorRegistryReadinessSummary,
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
  const activeItems = useMemo(() => getConnectorRegistryByCategory('active'), []);
  const futureItems = useMemo(() => getConnectorRegistryByCategory('future'), []);
  const lowRisk = useMemo(() => getConnectorRegistryByRisk('low'), []);
  const mediumRisk = useMemo(() => getConnectorRegistryByRisk('medium'), []);
  const highRisk = useMemo(() => getConnectorRegistryByRisk('high'), []);
  const sidebarReady = useMemo(() => getConnectorRegistrySidebarReadyItems(), []);

  const readinessGroups = [
    { key: 'ready' as ConnectorReadiness, label: 'Ready' },
    { key: 'preview_ready' as ConnectorReadiness, label: 'Preview Ready' },
    { key: 'planned' as ConnectorReadiness, label: 'Planned' },
    { key: 'hold_review' as ConnectorReadiness, label: 'Hold Review' },
    { key: 'blocked' as ConnectorReadiness, label: 'Blocked' },
  ];

  return (
    <PageShell
      title="连接器中心"
      subtitle="只读查看 AIP 外部工具、助手、模型平台与数据系统的接入状态和风险边界。"
      versionLabel="AIP v7.20.0-P1"
      maturity="preview"
      safetyBoundary="readonly"
      safetyText="只读预览 · 不写入外部系统 · 不执行连接器动作"
    >
      {/* A. Connector Overview Dashboard */}
      <SectionCard title="Connector Overview Dashboard" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 10, marginBottom: 12 }}>
          <KpiCard label="总数" value={String(total)} color="var(--primary)" />
          <KpiCard label="Active" value={String(activeItems.length)} color="var(--success)" />
          <KpiCard label="Future" value={String(futureItems.length)} color="var(--warning)" />
          <KpiCard label="低风险" value={String(riskSummary.low)} color="var(--success)" />
          <KpiCard label="中风险" value={String(riskSummary.medium)} color="var(--warning)" />
          <KpiCard label="高风险" value={String(riskSummary.high)} color="var(--danger)" />
          <KpiCard label="已曝光" value={String(sidebarReady.length)} color="var(--success)" />
        </div>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {CONNECTOR_REGISTRY.map(c => <Badge key={c.id} label={`${c.name}: ${c.readiness}`} color={READINESS_COLORS[c.readiness] || '#6B7280'} />)}
        </div>
      </SectionCard>

      {/* B. Connector Readiness Matrix */}
      <SectionCard title="Connector Readiness Matrix" style={{ marginBottom: 20 }}>
        {readinessGroups.map(group => {
          const items = CONNECTOR_REGISTRY.filter(c => c.readiness === group.key);
          if (items.length === 0) return null;
          return <div key={group.key} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>{group.label}（{items.length}）</div>
            {items.map(c => <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 4, background: 'var(--bg-surface)', border: `1px solid ${READINESS_COLORS[group.key]}`, fontSize: 10, marginBottom: 2 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</span>
              <Badge label={c.riskLevel} color={RISK_COLORS[c.riskLevel]} />
              <Badge label={c.healthLabel} color={c.healthLabel === 'ok' ? 'var(--success)' : '#6B7280'} />
              <span style={{ color: 'var(--text-muted)' }}>{c.recommendedNextStep}</span>
            </div>)}
          </div>;
        })}
      </SectionCard>

      {/* C. Connector Risk Board */}
      <SectionCard title="Connector Risk Board" style={{ marginBottom: 20, border: '1px solid var(--danger)' }}>
        {[
          { label: 'Low Risk', items: lowRisk, color: 'var(--success)' },
          { label: 'Medium Risk', items: mediumRisk, color: 'var(--warning)' },
          { label: 'High Risk', items: highRisk, color: 'var(--danger)' },
        ].map(group => group.items.length > 0 ? <div key={group.label} style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: group.color, marginBottom: 4 }}>{group.label}（{group.items.length}）</div>
          {group.items.map(c => <div key={c.id} style={{ padding: '4px 8px', borderRadius: 4, background: 'var(--bg-surface)', border: `1px solid ${group.color}`, fontSize: 10, marginBottom: 2 }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</span>
            {c.riskNotes.map(n => <Badge key={n} label={n} color="var(--danger)" />)}
          </div>)}
        </div> : null)}
      </SectionCard>

      {/* D. Active Connectors */}
      <SectionCard title={`Active Connectors（${activeItems.length}）`} style={{ marginBottom: 20 }}>
        {activeItems.length > 0 ? activeItems.map(c => <ConnectorCard key={c.id} conn={c} />)
          : <div style={{ padding: 12, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>暂无</div>}
      </SectionCard>

      {/* E. Future Connectors */}
      <SectionCard title={`Future Connectors（${futureItems.length}）`} style={{ marginBottom: 20 }}>
        <div style={{ padding: '6px 10px', marginBottom: 8, borderRadius: 4, background: 'rgba(245,158,11,0.08)', fontSize: 10, color: 'var(--warning)' }}>
          以下连接器尚未接入真实控制。当前仅做规划展示。
        </div>
        {futureItems.map(c => <ConnectorCard key={c.id} conn={c} />)}
      </SectionCard>

      {/* F. Next Actions Preview */}
      <SectionCard title="Next Actions Preview" style={{ marginBottom: 20 }}>
        {CONNECTOR_REGISTRY.map(c => <div key={c.id} style={{ padding: '6px 10px', borderRadius: 4, background: 'var(--bg-surface)', border: '1px solid var(--border)', fontSize: 10, marginBottom: 4 }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</span>: <span style={{ color: 'var(--text-secondary)' }}>{c.recommendedNextStep}</span>
        </div>)}
      </SectionCard>

      {/* G. Safety Boundary Summary */}
      <SectionCard title="安全边界声明" style={{ marginBottom: 20, border: '1px solid var(--warning)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, fontSize: 11 }}>
          {[
            ['不控制外部工具', '✅'],
            ['不写配置', '✅'],
            ['不调用外部 API', '✅'],
            ['不显示 token / API key', '✅'],
            ['不写数据库', '✅'],
            ['不启用 Stage C', '✅'],
          ].map(([label, value]) => <div key={String(label)} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 4, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
            <span style={{ fontWeight: 600, color: 'var(--success)' }}>{value}</span>
          </div>)}
        </div>
      </SectionCard>

      {/* Boundary Notice */}
      <div style={{ marginTop: 24, padding: '14px 16px', borderRadius: 6, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7 }}>
        <strong>只读边界声明：</strong><br />
        本页面是<u>Connector Center 只读展示页面</u>。Connector Registry 是<u>只读元数据</u>。
        本页面不调用外部 API、不写入外部系统、不控制连接器、不处理 Memory Hub candidate、不启用 Stage C。
        所有 actionsBlocked 为治理展示，不是权限系统。页面不会执行这些动作。
      </div>
    </PageShell>
  );
}
