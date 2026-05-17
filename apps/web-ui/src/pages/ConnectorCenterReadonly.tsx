import React, { useMemo } from 'react';
import PageShell from '../components/ui/PageShell';
import SectionCard from '../components/ui/SectionCard';
import {
  CONNECTOR_REGISTRY_NEW as CONNECTOR_REGISTRY,
  getConnectorRegistryCount,
  getConnectorRegistryByRisk,
  getConnectorRegistryAvailableRoutes,
  getConnectorRegistryFutureConnectors,
} from '../registry/connector-registry';
import type { ConnectorRegistryItem, ConnectorRiskLevel } from '../registry/connector-registry';

const RISK_COLORS: Record<ConnectorRiskLevel, string> = {
  low: 'var(--success)',
  medium: 'var(--warning)',
  high: 'var(--danger)',
};

function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11,
      fontWeight: 600, color: '#fff', background: color || '#6B7280',
      lineHeight: '16px', whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

function KpiCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
      <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function ConnectorCard({ conn }: { conn: ConnectorRegistryItem }) {
  const isHighRisk = conn.riskLevel === 'high';
  const isFuture = conn.status === 'planned' || conn.status === 'external_only';
  return (
    <div style={{
      padding: 12, borderRadius: 8, background: 'var(--bg-surface)',
      border: `1px solid ${isHighRisk ? 'var(--danger)' : 'var(--border)'}`,
      borderLeft: `3px solid ${RISK_COLORS[conn.riskLevel]}`,
      fontSize: 11, marginBottom: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{conn.name}</span>
        <Badge label={conn.type} color="#6B7280" />
        <Badge label={conn.status} color={conn.status === 'available_route' ? 'var(--success)' : conn.status === 'planned' ? 'var(--warning)' : '#6B7280'} />
        <Badge label={conn.maturity} color="#6B7280" />
        <Badge label={conn.riskLevel} color={RISK_COLORS[conn.riskLevel]} />
        {isHighRisk && <Badge label="高风险，仅可只读评估" color="var(--danger)" />}
        {isFuture && <Badge label="当前未接入真实控制" color="var(--warning)" />}
      </div>

      {/* Capabilities */}
      <div style={{ marginBottom: 4 }}>
        <span style={{ color: 'var(--text-muted)', marginRight: 4 }}>能力:</span>
        {conn.capabilities.map((c, i) => <Badge key={i} label={c} color="var(--secondary)" />)}
      </div>

      {/* Routes */}
      <div style={{ marginBottom: 4, color: 'var(--text-secondary)' }}>
        {conn.currentRoute ? (
          <span>当前路由: <a href={conn.currentRoute} style={{ color: 'var(--secondary)' }} onClick={e => { e.preventDefault(); /* link handled by router */ }}>{conn.currentRoute}</a></span>
        ) : (
          <span>当前路由: 未接入</span>
        )}
        {conn.futureRoute && <span style={{ marginLeft: 8 }}>未来规划: {conn.futureRoute}</span>}
      </div>

      {/* Safety */}
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 4 }}>
        {conn.safetyBoundary.map(s => <Badge key={s} label={s} color="#6B7280" />)}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 4 }}>
        <span style={{ color: 'var(--text-muted)' }}>允许: </span>
        {conn.actionsAllowed.map(a => <Badge key={a} label={a} color="var(--success)" />)}
        <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>禁止: </span>
        {conn.actionsBlocked.map(a => <Badge key={a} label={a} color="var(--danger)" />)}
      </div>

      <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{conn.notes}</div>
    </div>
  );
}

export default function ConnectorCenterReadonly() {
  const availableRoutes = useMemo(() => getConnectorRegistryAvailableRoutes(), []);
  const futureConnectors = useMemo(() => getConnectorRegistryFutureConnectors(), []);
  const lowRisk = useMemo(() => getConnectorRegistryByRisk('low'), []);
  const mediumRisk = useMemo(() => getConnectorRegistryByRisk('medium'), []);
  const highRisk = useMemo(() => getConnectorRegistryByRisk('high'), []);
  const total = useMemo(() => getConnectorRegistryCount(), []);

  return (
    <PageShell
      title="连接器中心"
      subtitle="只读查看 AIP 外部工具、助手、模型平台与数据系统的接入状态和风险边界。"
      versionLabel="AIP v7.17.0-P2"
      maturity="preview"
      safetyBoundary="readonly"
      safetyText="只读预览 · 不写入外部系统 · 不执行连接器动作"
    >
      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 20 }}>
        <KpiCard label="Connector 总数" value={String(total)} color="var(--primary)" />
        <KpiCard label="可用路由" value={String(availableRoutes.length)} color="var(--success)" />
        <KpiCard label="规划中" value={String(futureConnectors.length)} color="var(--warning)" />
        <KpiCard label="低风险" value={String(lowRisk.length)} color="var(--success)" />
        <KpiCard label="中风险" value={String(mediumRisk.length)} color="var(--warning)" />
        <KpiCard label="高风险" value={String(highRisk.length)} color="var(--danger)" />
      </div>

      {/* Active / Available Routes */}
      <SectionCard title={`Active / Available Routes（${availableRoutes.length}）`} style={{ marginBottom: 20 }}>
        {availableRoutes.length > 0 ? (
          availableRoutes.map(c => <ConnectorCard key={c.id} conn={c} />)
        ) : (
          <div style={{ padding: 12, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>暂无可用连接器路由</div>
        )}
      </SectionCard>

      {/* Planned / Future */}
      <SectionCard title={`Planned / Future Connectors（${futureConnectors.length}）`} style={{ marginBottom: 20 }}>
        <div style={{ padding: '6px 10px', marginBottom: 8, borderRadius: 4, background: 'rgba(245,158,11,0.08)', fontSize: 10, color: 'var(--warning)' }}>
          以下连接器尚未接入真实控制。当前仅做规划展示。
        </div>
        {futureConnectors.map(c => <ConnectorCard key={c.id} conn={c} />)}
      </SectionCard>

      {/* Medium / High Risk */}
      <SectionCard title={`Medium / High Risk Connectors（${mediumRisk.length + highRisk.length}）`} style={{ marginBottom: 20, border: '1px solid var(--danger)' }}>
        {[...mediumRisk, ...highRisk].map(c => <ConnectorCard key={c.id} conn={c} />)}
      </SectionCard>

      {/* Boundary Notice */}
      <div style={{ marginTop: 24, padding: '14px 16px', borderRadius: 6, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7 }}>
        <strong>只读边界声明：</strong><br />
        本页面是<u>Connector Center 只读展示页面</u>。Connector Registry 是<u>只读元数据</u>。
        本页面不调用外部 API、不写入外部系统、不控制连接器、不处理 Memory Hub candidate、不启用 Stage C。
        actionsBlocked 列表为治理展示，不是权限系统。页面不会执行这些动作。
      </div>
    </PageShell>
  );
}
