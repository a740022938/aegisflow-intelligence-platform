import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/ui/PageShell';
import SectionCard from '../components/ui/SectionCard';
import { CONNECTOR_REGISTRY, getConnectorStats } from '../registry/connector-registry';
import type { ConnectorDefinition, ConnectorStatus, ConnectorRiskLevel, SafetyBoundaryTag } from '../registry/connector-registry';

const STATUS_COLORS: Record<ConnectorStatus, string> = {
  online: 'var(--success)', warning: 'var(--warning)', offline: 'var(--danger)',
  unknown: 'var(--text-muted)', disabled: '#6B7280', not_configured: '#6B7280',
};

const RISK_COLORS: Record<ConnectorRiskLevel, string> = {
  low: 'var(--success)', medium: 'var(--warning)', high: 'var(--danger)',
};

const TAG_COLORS: Record<SafetyBoundaryTag, string> = {
  readonly: 'var(--secondary)', dry_run: '#8B5CF6', approval_required: 'var(--warning)',
  external_write_blocked: 'var(--danger)', dangerous_action_blocked: 'var(--danger)',
};

const TAG_LABELS: Record<SafetyBoundaryTag, string> = {
  readonly: 'Read Only', dry_run: 'Dry Run', approval_required: '需确认',
  external_write_blocked: '禁止外部写入', dangerous_action_blocked: '禁止危险操作',
};

function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11,
      fontWeight: 600, color: '#fff', background: color || 'var(--text-muted)',
      lineHeight: '16px', whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

function StatusBadge({ status }: { status: ConnectorStatus }) {
  return <Badge label={status} color={STATUS_COLORS[status]} />;
}

function RiskBadge({ level }: { level: ConnectorRiskLevel }) {
  return <Badge label={level} color={RISK_COLORS[level]} />;
}

function SafetyTagBadge({ tag }: { tag: SafetyBoundaryTag }) {
  return <Badge label={TAG_LABELS[tag]} color={TAG_COLORS[tag]} />;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '4px 0', fontSize: 12, borderBottom: '1px solid var(--border)' }}>
      <span style={{ width: 140, flexShrink: 0, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

function ConnectorCard({ connector }: { connector: ConnectorDefinition }) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: 8, padding: 16,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{connector.displayName}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{connector.category} · {connector.currentEntry}</div>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <StatusBadge status={connector.status} />
          <RiskBadge level={connector.riskLevel} />
          <Badge label={connector.maturity} color={connector.maturity === 'stable' ? 'var(--success)' : connector.maturity === 'preview' ? 'var(--warning)' : connector.maturity === 'lab' ? 'var(--secondary)' : '#8B5CF6'} />
        </div>
      </div>

      {/* Description */}
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>
        {connector.description}
      </div>

      {/* Safety Tags */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
        {connector.safetyBoundaryTags.map(tag => <SafetyTagBadge key={tag} tag={tag} />)}
      </div>

      {/* Expand toggle */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', fontSize: 11,
          color: 'var(--secondary)', padding: 0, fontFamily: 'inherit',
        }}
      >
        {expanded ? '收起详情 ▲' : '查看详情 ▼'}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>基本信息</div>
          <DetailRow label="connectorId" value={connector.id} />
          <DetailRow label="默认模式" value={connector.defaultMode} />
          <DetailRow label="数据源" value={connector.dataSource} />
          <DetailRow label="目标入口" value={connector.targetEntry} />
          <DetailRow label="迁移阶段" value={`Stage ${connector.migrationPlan.stage}`} />

          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginTop: 10, marginBottom: 6 }}>允许操作</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
            {connector.actionPolicy.allowedActions.length > 0
              ? connector.actionPolicy.allowedActions.map(a => <Badge key={a} label={a} color="var(--success)" />)
              : <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>无</span>}
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>禁止操作</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
            {connector.actionPolicy.forbiddenActions.map(a => <Badge key={a} label={a} color="var(--danger)" />)}
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Health Signals</div>
          {connector.healthSignals.length > 0
            ? connector.healthSignals.map(hs => (
              <DetailRow key={hs.label} label={hs.label} value={`${String(hs.value)} [${hs.status}]`} />
            ))
            : <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>暂无</span>}

          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginTop: 10, marginBottom: 6 }}>备注</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{connector.notes}</div>
        </div>
      )}
    </div>
  );
}

export default function ConnectorCenter() {
  const stats = useMemo(() => getConnectorStats(), []);

  return (
    <PageShell
      title="连接器中心（旧）"
      subtitle="AIP v7.14.0-P2 Legacy Connector Center Readonly Shell"
      versionLabel="AIP v7.14.0-P2"
      maturity="preview"
      safetyBoundary="readonly"
      safetyText="只读壳子 · 不执行外部写入 · 不 taskkill · 不重启外部服务 · 不处理 Memory Hub candidate · 不修改 OpenAxiom label · 不发 GitHub Release"
    >
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 20 }}>
        {[
          ['Total', String(stats.total), 'var(--primary)'],
          ['Online', String(stats.byStatus['online'] || 0), 'var(--success)'],
          ['Warning', String(stats.byStatus['warning'] || 0), 'var(--warning)'],
          ['Offline', String(stats.byStatus['offline'] || 0), 'var(--danger)'],
          ['Unknown', String((stats.byStatus['unknown'] || 0) + (stats.byStatus['disabled'] || 0) + (stats.byStatus['not_configured'] || 0)), 'var(--text-muted)'],
          ['High Risk', String(stats.highRiskCount), 'var(--danger)'],
          ['Readonly', String(stats.readonlyCount), 'var(--secondary)'],
          ['Migration Pending', String(stats.migrationPendingCount), 'var(--warning)'],
        ].map(([label, value, color]) => (
          <div key={String(label)} style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '12px 14px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Migration Bridge Banner */}
      <SectionCard title="Legacy Connector Center → v8 Migration Bridge" style={{ border: '1px solid #8B5CF6', background: 'rgba(139,92,246,0.06)', marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: '#8B5CF6', color: '#fff' }}>MIGRATION BRIDGE</span>
          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: '#475569', color: '#fff' }}>LEGACY V7 READONLY VIEW</span>
          <span style={{ fontSize: 12, color: '#c4b5fd' }}>Legacy Connector Centers → v8 Integration Center / Provider Manager</span>
        </div>
        <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.7 }}>
          <p style={{ margin: '0 0 6px' }}>
            This legacy Connector Center is a <strong>v7 readonly view</strong>.
            OpenAIP v8 consolidates external tools under Integration Center, Local Apps Center, and Provider Manager.
            This page remains a compatibility overview and does not change connector behavior.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 6 }}>
            <Link to="/openaip-v8-integration-center-preview" style={{ fontSize: 12, color: '#8B5CF6', textDecoration: 'underline', fontWeight: 600 }}>v8 Integration Center →</Link>
            <Link to="/openaip-v8-provider-manager-preview" style={{ fontSize: 12, color: '#93c5fd', textDecoration: 'underline' }}>v8 Provider Manager</Link>
            <Link to="/openaip-v8-local-apps-center-preview" style={{ fontSize: 12, color: '#93c5fd', textDecoration: 'underline' }}>v8 Local Apps Center</Link>
            <Link to="/openaip-v8-command-center-preview" style={{ fontSize: 12, color: '#93c5fd', textDecoration: 'underline' }}>v8 Command Center</Link>
          </div>
        </div>
      </SectionCard>

      {/* Connector Cards Grid */}
      <SectionCard title="连接器列表">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 12 }}>
          {CONNECTOR_REGISTRY.map(c => <ConnectorCard key={c.id} connector={c} />)}
        </div>
      </SectionCard>

      {/* Migration Notice */}
      <SectionCard title="迁移状态说明" style={{ marginTop: 20 }}>
        <div style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <p>
          <strong>当前状态：</strong>OpenAxiomReadonly 和 MemoryHubReadonly 仍保留原左侧菜单入口。
            本轮 Connector Center 是 <strong>旧入口 duplicate readonly view</strong>，不移动任何菜单。
          </p>
          <p>
            <strong>迁移计划：</strong>Connector Center 后续施工将逐步：
          </p>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>Stage 0→1：当前只读壳子</li>
            <li>Stage 2：接入真实 health 探测</li>
            <li>Stage 3：原入口保留 + Connector Center duplicate view</li>
            <li>Stage 4：菜单移动 dry-run</li>
            <li>Stage 5+：feature flag 正式移动（保留回滚）</li>
          </ul>
          <p style={{ marginTop: 8 }}>
            所有真实菜单移动必须经过 dry-run 和 feature flag。
            不会自动隐藏或删除任何入口。
          </p>
        </div>
      </SectionCard>

      {/* Safety Boundary Disclaimer */}
      <div style={{ marginTop: 24, padding: '12px 16px', borderRadius: 6, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <strong>安全边界：</strong>
        本页面为<u>只读壳子</u>，不执行外部系统写入，不 taskkill，不重启外部服务，不处理 Memory Hub candidate，不修改 OpenAxiom label，不发 GitHub Release。
        所有数据为静态 mock / metadata，不做真实外部探测。
      </div>
    </PageShell>
  );
}
