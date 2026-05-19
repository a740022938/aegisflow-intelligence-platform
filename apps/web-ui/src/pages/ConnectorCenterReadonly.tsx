import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/ui/PageShell';
import SectionCard from '../components/ui/SectionCard';
import ConnectorCenterOverview from '../components/advanced/ConnectorCenterOverview';
import ConnectorCapabilityMatrix from '../components/advanced/ConnectorCapabilityMatrix';
import ConnectorIntegrationBoundary from '../components/advanced/ConnectorIntegrationBoundary';
import { getRuntimeRegistrySummary } from '../registry/runtime-registry';
import { getDryRunPlanSummary } from '../registry/dry-run-plan-registry';
import { getAuditLogPreviewSummary } from '../registry/audit-log-registry';
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
      versionLabel="AIP v7.25.2 · Connector Center Preview"
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
        {futureItems.length > 0
          ? futureItems.map(c => <ConnectorCard key={c.id} conn={c} />)
          : <div style={{ padding: 12, fontSize: 10, color: 'var(--text-muted)' }}>No future connectors registered.</div>}
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

      {/* Runtime Registry Preview Snapshot */}
      <SectionCard title="Runtime Registry Preview Snapshot" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        {(() => {
          const summary = getRuntimeRegistrySummary();
          return (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8, marginBottom: 12 }}>
                <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#8B5CF6' }}>{summary.total}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>总目标</div>
                </div>
                <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--success)' }}>{summary.allowedNow}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>当前允许</div>
                </div>
                <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--danger)' }}>{summary.blocked}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>已拦截</div>
                </div>
                <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--danger)' }}>{summary.requiresStageC}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>需 Stage C</div>
                </div>
                <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--warning)' }}>{summary.requiresHumanApproval}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>需人工批准</div>
                </div>
                <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--danger)' }}>{summary.externalWrite}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>外部写入</div>
                </div>
              </div>
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Link to="/runtime-registry-preview" style={{ fontSize: 11, color: '#8B5CF6', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(139,92,246,0.3)' }}>
                  打开完整 Runtime Registry 预览
                </Link>
              </div>
            </>
          );
        })()}
        <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', fontSize: 10, color: '#8B5CF6', textAlign: 'center' }}>
          Runtime Registry — 只读预览 · 不控制外部工具 · 不写数据库 · 不启用 Stage C
        </div>
      </SectionCard>

      {/* Dry-run Plan Preview Snapshot */}
      <SectionCard title="Dry-run 计划预览快照" style={{ marginBottom: 20, border: '1px solid #3B82F6' }}>
        {(() => {
          const ds = getDryRunPlanSummary();
          return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8, marginBottom: 12 }}>
              <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#3B82F6' }}>{ds.total}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>总计划</div>
              </div>
              <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--success)' }}>{ds.allowedNow}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>当前允许</div>
              </div>
              <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--danger)' }}>{ds.blocked}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>已拦截</div>
              </div>
              <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#DC2626' }}>{ds.highOrCritical}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>高/严重风险</div>
              </div>
              <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#DC2626' }}>{ds.requiresStageC}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>需 Stage C</div>
              </div>
            </div>
          );
        })()}
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/dry-run-plan-preview" style={{ fontSize: 11, color: '#3B82F6', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(59,130,246,0.3)' }}>
            打开完整 Dry-run 计划预览
          </Link>
        </div>
        <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(59,130,246,0.06)', fontSize: 10, color: '#3B82F6', textAlign: 'center' }}>
          Dry-run Plan — 只读预览 · 不控制外部工具 · 不写数据库 · 不启用 Stage C
        </div>
      </SectionCard>

      {/* Audit Log Preview Snapshot */}
      <SectionCard title="审计日志预览快照" style={{ marginBottom: 20, border: '1px solid #DC2626' }}>
        {(() => {
          const as = getAuditLogPreviewSummary();
          return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8, marginBottom: 12 }}>
              <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#DC2626' }}>{as.total}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>总事件</div>
              </div>
              <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--success)' }}>{as.allowedNow}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>当前允许</div>
              </div>
              <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--danger)' }}>{as.blocked}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>已阻断</div>
              </div>
              <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#DC2626' }}>{as.highOrCritical}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>高/严重风险</div>
              </div>
              <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#8B5CF6' }}>{as.requiresDbWrite}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>需 DB 写</div>
              </div>
            </div>
          );
        })()}
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/audit-log-preview" style={{ fontSize: 11, color: '#DC2626', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(220,38,38,0.3)' }}>
            打开完整审计日志预览
          </Link>
        </div>
        <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(220,38,38,0.06)', fontSize: 10, color: '#DC2626', textAlign: 'center' }}>
          Audit Log — 只读预览 · 不控制外部工具 · 不写数据库 · 不启用 Stage C
        </div>
      </SectionCard>

      {/* Governance Gate Summary */}
      <SectionCard title="治理门禁摘要" style={{ marginBottom: 16, border: '1px solid #8B5CF6' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
          治理状态机定义了 7 个状态和 18 个迁移，所有需要外部控制、DB 写入或 Stage C 的迁移均被阻断。
          当前版本为只读预览，不执行任何迁移。
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/governance-state-machine-preview" style={{ fontSize: 11, color: '#8B5CF6', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(139,92,246,0.3)' }}>
            打开治理状态机预览
          </Link>
        </div>
        <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', fontSize: 10, color: '#8B5CF6', textAlign: 'center' }}>
          Governance Gate — 只读门禁预览 · 不迁移状态 · 不处理审批 · 不写数据库 · 不启用 Stage C
        </div>
      </SectionCard>

      {/* Rollback Readiness Summary */}
      <SectionCard title="回滚准备度摘要" style={{ marginBottom: 16, border: '1px solid #F97316' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
          Rollback registry 定义了连接器回滚的准备度模型。当前版本为 blocked_irreversible — 不执行回滚，不控制外部工具。
          相关 rollback 项: connector-center-preview-rollback, external-tool-control-rollback-blocked
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/rollback-preview" style={{ fontSize: 11, color: '#F97316', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(249,115,22,0.3)' }}>
            打开回滚预览
          </Link>
        </div>
        <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(249,115,22,0.06)', fontSize: 10, color: '#F97316', textAlign: 'center' }}>
          Rollback — 只读回滚风险评估 · 不执行回滚 · 不控制外部工具 · 不写数据库 · 不启用 Stage C
        </div>
      </SectionCard>

      {/* Evidence Readiness Summary */}
      <SectionCard title="证据准备度摘要" style={{ marginBottom: 16, border: '1px solid #22C55E' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
          证据 schema 定义了连接器 readiness snapshot 的结构、脱敏策略和门禁条件。
          当前版本为只读模型，不采集证据，不写 evidence store。
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/evidence-schema-preview" style={{ fontSize: 11, color: '#22C55E', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(34,197,94,0.3)' }}>
            打开证据模型预览
          </Link>
        </div>
        <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(34,197,94,0.06)', fontSize: 10, color: '#22C55E', textAlign: 'center' }}>
          Evidence Schema — 只读证据模型预览 · 不采集证据 · 不保存 secret · 不写数据库 · 不启用 Stage C
        </div>
      </SectionCard>

      {/* Human Approval Gate Summary */}
      <SectionCard title="人工审批门禁摘要" style={{ marginBottom: 16, border: '1px solid #EC4899' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
          人工审批流程定义了 20 个审批工作流项目，所有执行、审批、candidate 处理和 Stage C 相关项目均被阻断。
          当前版本为只读预览，不创建审批队列，不处理 candidate。
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/human-approval-workflow-preview" style={{ fontSize: 11, color: '#EC4899', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(236,72,153,0.3)' }}>
            打开人工审批流程预览
          </Link>
        </div>
        <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(236,72,153,0.06)', fontSize: 10, color: '#EC4899', textAlign: 'center' }}>
          Human Approval Gate — 只读门禁预览 · 不创建审批队列 · 不处理 candidate · 不写数据库 · 不启用 Stage C
        </div>
      </SectionCard>

      {/* Boundary Notice */}
      <div style={{ marginTop: 24, padding: '14px 16px', borderRadius: 6, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7 }}>
        <strong>Readonly boundary notice:</strong><br />
        This is a <u>Connector Center readonly overview</u>. Connector Registry is readonly metadata. Does not call external APIs, write to external systems, control connectors, process Memory Hub candidates, or enable Stage C. All <code>actionsBlocked</code> are governance display, not a permission system.
      </div>

      {/* Governance Console Traceability */}
      <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 6, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', fontSize: 11, color: 'var(--text-secondary)' }}>
        - Governance Console: Aggregated registry chain available at <a href="/governance-console-preview" style={{ color: '#22C55E' }}>/governance-console-preview</a> (hidden direct, readonly, not in sidebar)
        <br />
        - P1 Runtime Readonly Status API: API contract v1.freeze with 12 endpoints defined — <a href="/runtime-readonly-status-api-preview" style={{ color: '#22C55E' }}>view contract</a> (hidden direct, readonly, not in sidebar)
        <br />
        - P2 Runtime Dry-run Contract: 18-item dry-run contract (request/response/gate/evidence/audit/rollback) — <a href="/runtime-dry-run-contract-preview" style={{ color: '#22C55E' }}>view contract</a> (hidden direct, readonly, not in sidebar)
        <br />
        - P3 Runtime Audit Store Contract: 16-item audit store contract (schema/retention/redaction/write policy) — <a href="/runtime-audit-store-contract-preview" style={{ color: '#22C55E' }}>view contract</a> (hidden direct, readonly, not in sidebar)
        <br />
        - P4 Stage C Pre-Enable Human Review Pack: 18-area pre-enable review checklist — <a href="/stage-c-preenable-review-preview" style={{ color: '#22C55E' }}>view pack</a> (hidden direct, readonly, not in sidebar, does NOT enable Stage C)
      </div>
    </PageShell>
  );
}
