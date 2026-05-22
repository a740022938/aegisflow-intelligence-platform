import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/ui/PageShell';
import SectionCard from '../components/ui/SectionCard';
import SectionCardSub from '../components/ui/SectionCard';
import StatusBadge from '../components/ui/StatusBadge';
import StatsGrid from '../components/ui/StatsGrid';
import StatusStrip from '../components/ui/StatusStrip';
import type { StatItem } from '../components/ui/StatsGrid';
import type { StatusStripItem } from '../components/ui/StatusStrip';
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

function Tag({ label, color }: { label: string; color?: string }) {
  return <span className="ui-tag" style={color ? { color: '#fff', background: color } : undefined}>{label}</span>;
}

function ConnectorCard({ conn }: { conn: ConnectorRegistryItem }) {
  const isHighRisk = conn.riskLevel === 'high';
  return (
    <SectionCard style={{ marginBottom: 8, borderLeft: `3px solid ${RISK_COLORS[conn.riskLevel]}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{conn.name}</span>
        <Tag label={conn.type} />
        <StatusBadge s={conn.status === 'available_route' ? 'ready' : conn.status === 'planned' ? 'pending' : 'draft'} />
        <Tag label={conn.readiness} color={READINESS_COLORS[conn.readiness]} />
        <Tag label={conn.riskLevel} color={RISK_COLORS[conn.riskLevel]} />
        <Tag label={conn.healthLabel} color={conn.healthLabel === 'ok' ? 'var(--success)' : conn.healthLabel === 'watch' ? 'var(--warning)' : '#6B7280'} />
        {isHighRisk && <Tag label="高风险，仅可只读评估" color="var(--danger)" />}
      </div>
      <div style={{ marginBottom: 4 }}>
        {conn.capabilities.map((c, i) => <Tag key={i} label={c} color="var(--secondary)" />)}
      </div>
      <div style={{ marginBottom: 4, color: 'var(--text-secondary)' }}>
        {conn.currentRoute ? <span>路由: <a href={conn.currentRoute} style={{ color: 'var(--secondary)' }} onClick={e => { e.preventDefault(); }}>{conn.currentRoute}</a></span> : <span>路由: 未接入</span>}
        {conn.futureRoute && <span style={{ marginLeft: 8 }}>未来规划: {conn.futureRoute}</span>}
      </div>
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 2 }}>
        {conn.safetyBoundary.map(s => <Tag key={s} label={s} />)}
      </div>
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 2 }}>
        <span style={{ color: 'var(--text-muted)' }}>允许: </span>
        {conn.actionsAllowed.map(a => <Tag key={a} label={a} color="var(--success)" />)}
        <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>禁止能力（未启用）: </span>
        {conn.actionsBlocked.map(a => <Tag key={a} label={a} color="var(--danger)" />)}
      </div>
      {conn.recommendedNextStep && <div style={{ marginBottom: 2, color: 'var(--text-secondary)' }}>下一步: {conn.recommendedNextStep}</div>}
      {conn.riskNotes.length > 0 && <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 2 }}>{conn.riskNotes.map(n => <Tag key={n} label={n} color="var(--danger)" />)}</div>}
      {conn.setupNotes.length > 0 && <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 2 }}>{conn.setupNotes.map(n => <Tag key={n} label={n} />)}</div>}
      <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{conn.notes}</div>
    </SectionCard>
  );
}

function SummaryStatCard({ statItems }: { statItems: StatItem[] }) {
  return <StatsGrid items={statItems} columns={statItems.length > 4 ? 6 : 3} />;
}

function buildStats(items: Array<{ label: string; value: number | string; color: string }>): StatItem[] {
  return items.map(i => ({ label: i.label, value: i.value, color: i.color }));
}

function PreviewLink({ to, label, color }: { to: string; label: string; color: string }) {
  return (
    <Link
      to={to}
      style={{ fontSize: 11, color, textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: `1px solid ${color}4D` }}
    >
      {label}
    </Link>
  );
}

function PreviewFooter({ color, text }: { color: string; text: string }) {
  return (
    <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: `${color}0F`, fontSize: 10, color, textAlign: 'center' }}>
      {text}
    </div>
  );
}

const READONLY_FOOTER_TEXT = '只读预览 · 不控制外部工具 · 不写数据库 · 不启用 Stage C';

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

  const stripItems: StatusStripItem[] = [
    { label: 'Total connectors', value: String(total) },
    { label: 'Active', value: String(activeItems.length) },
    { label: 'Future', value: String(futureItems.length) },
    { label: 'Sidebar ready', value: String(sidebarReady.length) },
    { label: 'Available routes', value: String(availableRoutes.length) },
  ];

  return (
    <PageShell
      title="Connector Center"
      subtitle="Readonly capability overview — external tools, AI assistants, model platforms, and memory system integration status"
      versionLabel="AIP v7.62.0 · Connector Center Preview"
      maturity="preview"
      safetyBoundary="readonly"
      safetyText="Readonly · No external writes · No connector control · No API calls"
    >
      <StatusStrip items={stripItems} />

      {/* Migration Bridge Banner */}
      <SectionCard title="Connector → v8 Integration Center Migration" style={{ marginTop: 16, border: '1px solid #8B5CF6', background: 'rgba(139,92,246,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: '#8B5CF6', color: '#fff' }}>MIGRATION BRIDGE</span>
          <span style={{ fontSize: 12, color: '#c4b5fd' }}>Connector Center → v8 Integration Center</span>
        </div>
        <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.7 }}>
          <p style={{ margin: '0 0 6px' }}>
            This page is the <strong>legacy Connector Center</strong>. New integration development is on the v8 track.
          </p>
          <p style={{ margin: '0 0 6px' }}>
            The <strong>v8 Integration Center</strong> absorbs connector management with registry-backed data,
            integration lifecycle management, and a full migration registry from legacy connectors.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
            <Link
              to="/openaip-v8-integration-center-preview"
              style={{ fontSize: 12, color: '#8B5CF6', textDecoration: 'underline', fontWeight: 600 }}
            >
              Open v8 Integration Center →
            </Link>
            <Link
              to="/openaip-v8-command-center-preview"
              style={{ fontSize: 12, color: '#93c5fd', textDecoration: 'underline' }}
            >
              v8 Command Center
            </Link>
          </div>
        </div>
      </SectionCard>

      {/* Overview Hero */}
      <SectionCard title="Connector Overview" style={{ marginTop: 16 }}>
        <ConnectorCenterOverview />
      </SectionCard>

      {/* Capability Matrix */}
      <SectionCard title="Connector Capability Matrix">
        <ConnectorCapabilityMatrix />
      </SectionCard>

      {/* Active Connectors — Detailed Cards */}
      <SectionCard title={`Active Connectors (${activeItems.length})`}>
        {activeItems.length > 0 ? activeItems.map(c => <ConnectorCard key={c.id} conn={c} />)
          : <div className="ui-empty-desc">No active connectors</div>}
      </SectionCard>

      {/* Future Connectors — Detailed Cards */}
      <SectionCard title={`Future Connectors (${futureItems.length})`}>
        <div className="ui-tag ui-tag-warning" style={{ marginBottom: 8 }}>
          These connectors are not yet integrated. Displayed for planning and review.
        </div>
        {futureItems.length > 0
          ? futureItems.map(c => <ConnectorCard key={c.id} conn={c} />)
          : <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No future connectors registered.</div>}
      </SectionCard>

      {/* Integration Boundary + Safety Matrix + Recommended Path */}
      <SectionCard title="Integration Boundary & Safety">
        <ConnectorIntegrationBoundary />
      </SectionCard>

      {/* Governance Overview KPIs */}
      <SectionCard title="Governance Summary">
        <StatsGrid
          columns={6}
          items={buildStats([
            { label: 'All readonly', value: allReadonly ? 'YES' : 'NO', color: allReadonly ? 'var(--success)' : 'var(--danger)' },
            { label: 'External write paths', value: '0', color: 'var(--success)' },
            { label: 'Real connector controls', value: '0', color: 'var(--success)' },
            { label: 'Stage C controls', value: '0', color: 'var(--success)' },
            { label: 'DB write paths', value: '0', color: 'var(--success)' },
            { label: 'Candidate mutation', value: '0', color: 'var(--success)' },
          ])}
        />
        <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(34,197,94,0.06)', fontSize: 10, color: 'var(--success)' }}>
          All governance gates pass. Connector Center is a fully readonly metadata overview.
        </div>
      </SectionCard>

      {/* Runtime Registry Preview Snapshot */}
      <SectionCard title="Runtime Registry Preview Snapshot" style={{ border: '1px solid #8B5CF6' }}>
        {(() => {
          const s = getRuntimeRegistrySummary();
          return (
            <>
              <StatsGrid
                columns={6}
                items={buildStats([
                  { label: '总目标', value: s.total, color: '#8B5CF6' },
                  { label: '当前允许', value: s.allowedNow, color: 'var(--success)' },
                  { label: '已拦截', value: s.blocked, color: 'var(--danger)' },
                  { label: '需 Stage C', value: s.requiresStageC, color: 'var(--danger)' },
                  { label: '需人工批准', value: s.requiresHumanApproval, color: 'var(--warning)' },
                  { label: '外部写入', value: s.externalWrite, color: 'var(--danger)' },
                ])}
              />
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                <PreviewLink to="/runtime-registry-preview" label="打开完整 Runtime Registry 预览" color="#8B5CF6" />
              </div>
            </>
          );
        })()}
        <PreviewFooter color="#8B5CF6" text={`Runtime Registry — ${READONLY_FOOTER_TEXT}`} />
      </SectionCard>

      {/* Dry-run Plan Preview Snapshot */}
      <SectionCard title="Dry-run 计划预览快照" style={{ border: '1px solid #3B82F6' }}>
        {(() => {
          const ds = getDryRunPlanSummary();
          return (
            <>
              <StatsGrid
                columns={6}
                items={buildStats([
                  { label: '总计划', value: ds.total, color: '#3B82F6' },
                  { label: '当前允许', value: ds.allowedNow, color: 'var(--success)' },
                  { label: '已拦截', value: ds.blocked, color: 'var(--danger)' },
                  { label: '高/严重风险', value: ds.highOrCritical, color: '#DC2626' },
                  { label: '需 Stage C', value: ds.requiresStageC, color: '#DC2626' },
                ])}
              />
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                <PreviewLink to="/dry-run-plan-preview" label="打开完整 Dry-run 计划预览" color="#3B82F6" />
              </div>
            </>
          );
        })()}
        <PreviewFooter color="#3B82F6" text={`Dry-run Plan — ${READONLY_FOOTER_TEXT}`} />
      </SectionCard>

      {/* Audit Log Preview Snapshot */}
      <SectionCard title="审计日志预览快照" style={{ border: '1px solid #DC2626' }}>
        {(() => {
          const as = getAuditLogPreviewSummary();
          return (
            <>
              <StatsGrid
                columns={6}
                items={buildStats([
                  { label: '总事件', value: as.total, color: '#DC2626' },
                  { label: '当前允许', value: as.allowedNow, color: 'var(--success)' },
                  { label: '已阻断', value: as.blocked, color: 'var(--danger)' },
                  { label: '高/严重风险', value: as.highOrCritical, color: '#DC2626' },
                  { label: '需 DB 写', value: as.requiresDbWrite, color: '#8B5CF6' },
                ])}
              />
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                <PreviewLink to="/audit-log-preview" label="打开完整审计日志预览" color="#DC2626" />
              </div>
            </>
          );
        })()}
        <PreviewFooter color="#DC2626" text={`Audit Log — ${READONLY_FOOTER_TEXT}`} />
      </SectionCard>

      {/* Governance Gate Summary */}
      <SectionCard title="治理门禁摘要" style={{ border: '1px solid #8B5CF6' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
          治理状态机定义了 7 个状态和 18 个迁移，所有需要外部控制、DB 写入或 Stage C 的迁移均被阻断。
          当前版本为只读预览，不执行任何迁移。
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <PreviewLink to="/governance-state-machine-preview" label="打开治理状态机预览" color="#8B5CF6" />
        </div>
        <PreviewFooter color="#8B5CF6" text="Governance Gate — 只读门禁预览 · 不迁移状态 · 不处理审批 · 不写数据库 · 不启用 Stage C" />
      </SectionCard>

      {/* Rollback Readiness Summary */}
      <SectionCard title="回滚准备度摘要" style={{ border: '1px solid #F97316' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
          Rollback registry 定义了连接器回滚的准备度模型。当前版本为 blocked_irreversible — 不执行回滚，不控制外部工具。
          相关 rollback 项: connector-center-preview-rollback, external-tool-control-rollback-blocked
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <PreviewLink to="/rollback-preview" label="打开回滚预览" color="#F97316" />
        </div>
        <PreviewFooter color="#F97316" text="Rollback — 只读回滚风险评估 · 不执行回滚 · 不控制外部工具 · 不写数据库 · 不启用 Stage C" />
      </SectionCard>

      {/* Evidence Readiness Summary */}
      <SectionCard title="证据准备度摘要" style={{ border: '1px solid #22C55E' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
          证据 schema 定义了连接器 readiness snapshot 的结构、脱敏策略和门禁条件。
          当前版本为只读模型，不采集证据，不写 evidence store。
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <PreviewLink to="/evidence-schema-preview" label="打开证据模型预览" color="#22C55E" />
        </div>
        <PreviewFooter color="#22C55E" text="Evidence Schema — 只读证据模型预览 · 不采集证据 · 不保存 secret · 不写数据库 · 不启用 Stage C" />
      </SectionCard>

      {/* Human Approval Gate Summary */}
      <SectionCard title="人工审批门禁摘要" style={{ border: '1px solid #EC4899' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
          人工审批流程定义了 20 个审批工作流项目，所有执行、审批、candidate 处理和 Stage C 相关项目均被阻断。
          当前版本为只读预览，不创建审批队列，不处理 candidate。
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <PreviewLink to="/human-approval-workflow-preview" label="打开人工审批流程预览" color="#EC4899" />
        </div>
        <PreviewFooter color="#EC4899" text="Human Approval Gate — 只读门禁预览 · 不创建审批队列 · 不处理 candidate · 不写数据库 · 不启用 Stage C" />
      </SectionCard>

      {/* Boundary Notice */}
      <div className="ui-card" style={{ marginTop: 16, padding: '14px 16px', fontSize: 11, lineHeight: 1.7 }}>
        <strong>Readonly boundary notice:</strong><br />
        This is a <u>Connector Center readonly overview</u>. Connector Registry is readonly metadata. Does not call external APIs, write to external systems, control connectors, process Memory Hub candidates, or enable Stage C. All <code>actionsBlocked</code> labels are prohibited capabilities, not enabled permissions.
      </div>

      {/* Governance Console Traceability */}
      <div className="ui-card" style={{ marginTop: 16, padding: '10px 14px', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
        - Governance Console: Aggregated registry chain available at <PreviewLink to="/governance-console-preview" label="/governance-console-preview" color="#22C55E" />
        <br />
        - P1 Runtime Readonly Status API: API contract v1.freeze with 12 endpoints defined — <PreviewLink to="/runtime-readonly-status-api-preview" label="view contract" color="#22C55E" />
        <br />
        - P2 Runtime Dry-run Contract: 18-item dry-run contract — <PreviewLink to="/runtime-dry-run-contract-preview" label="view contract" color="#22C55E" />
        <br />
        - P3 Runtime Audit Store Contract: 16-item audit store contract — <PreviewLink to="/runtime-audit-store-contract-preview" label="view contract" color="#22C55E" />
        <br />
        - P4 Stage C Pre-Enable Human Review Pack: 18-area pre-enable review checklist — <PreviewLink to="/stage-c-preenable-review-preview" label="view pack" color="#22C55E" />
        <span style={{ color: 'var(--text-muted)', fontSize: 10 }}> (hidden direct, readonly, not in sidebar, does NOT enable Stage C)</span>
      </div>
    </PageShell>
  );
}
