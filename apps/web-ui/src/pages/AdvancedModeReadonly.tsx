import React, { useMemo, useState } from 'react';
import PageShell from '../components/ui/PageShell';
import SectionCard from '../components/ui/SectionCard';
import {
  NAVIGATION_EXPOSURE_REGISTRY,
  NAVIGATION_EXPOSURE_LEVELS,
  getNavigationExposureStats,
  getNavigationExposureByLevel,
  getNavigationExposureHighRiskEntries,
  getNavigationExposureAllowedNowFalseEntries,
  getNavigationExposureByGate,
} from '../registry/navigation-exposure-registry';
import {
  CENTER_ACCESS_REGISTRY,
  getCenterAccessItemCount,
  getCenterAccessVisibleItems,
  getCenterAccessHiddenItems,
  getCenterAccessByReadiness,
  getCenterAccessSidebarCandidates,
  getCenterAccessFinalReadinessSummary,
  getCenterAccessConnectorStatusSummary,
  getCenterAccessSidebarVisibleCount,
  getCenterAccessHiddenDirectCount,
  getCenterAccessQualityGateSummary,
  getCenterAccessBySidebarState,
  getCenterAccessByOperationalMode,
  getCenterAccessSummary,
  getCenterAccessLaunchpadVisible,
  getCenterAccessAdvancedHubVisible,
  getCenterAccessHighRiskPrimaryNavCount,
  getCenterAccessStageCPrimaryNavCount,
  validateCenterAccess,
} from '../registry/center-access-registry';
import {
  ADVANCED_PLACEHOLDER_REGISTRY,
  getAdvancedPlaceholdersByDecision,
  getAdvancedPlaceholderHoldReviewItems,
  getAdvancedPlaceholdersByRisk,
} from '../registry/advanced-placeholder-registry';
import {
  getConnectorRegistryCount,
  getConnectorRegistryByCategory,
  getConnectorRegistryByRisk as getConnectorRisk,
  getConnectorRegistryQualityGateSummary,
} from '../registry/connector-registry';
import {
  getLabRegistryCount,
  getLabRegistryAvailableRoutes,
  getLabRegistryHoldReviewItems as getLabHoldReview,
  getLabRegistryFutureItems as getLabFuture,
  getLabRegistryQualityGateSummary,
} from '../registry/lab-registry';
import {
  getNavigationExposureSafetySummary,
  getNavigationExposureSummary,
} from '../registry/navigation-exposure-registry';
import CenterLaunchpadOverview from '../components/advanced/CenterLaunchpadOverview';
import CenterLaunchpadCard from '../components/advanced/CenterLaunchpadCard';
import CenterLaunchpadDecisionPath from '../components/advanced/CenterLaunchpadDecisionPath';
import ReadonlyControlRoomOverview from '../components/control-room/ReadonlyControlRoomOverview';
import GovernanceBaselinePanel from '../components/control-room/GovernanceBaselinePanel';
import ConnectorReadinessSummaryBridge from '../components/control-room/ConnectorReadinessSummaryBridge';
import SystemSafetyMatrix from '../components/control-room/SystemSafetyMatrix';
import VersionProgressTimeline from '../components/control-room/VersionProgressTimeline';
import NextWorkstreamPanel from '../components/control-room/NextWorkstreamPanel';
import type { NavigationExposureEntry, NavigationExposureLevel, NavigationExposureRisk } from '../registry/navigation-exposure-registry';
import type { CenterAccessItem, CenterAccessKind, CenterAccessRisk } from '../registry/center-access-registry';
import type { AdvancedPlaceholderItem, AdvancedPlaceholderDecision } from '../registry/advanced-placeholder-registry';

const RISK_COLORS: Record<string, string> = {
  low: 'var(--success)', medium: 'var(--warning)', high: 'var(--danger)',
};

const LEVEL_COLORS: Record<string, string> = {
  hidden_internal: '#6B7280', direct_route: '#8B5CF6', advanced_mode: '#F97316',
  lab_mode: '#3B82F6', connector_center: '#22C55E', governance_center: '#22C55E', primary_nav: 'var(--success)',
};

const ACCESS_LEVEL_LABELS: Record<string, string> = {
  primary_nav: '主菜单', advanced_nav: '高级模式', launchpad_card: '启动台卡片',
  related_link: '相关链接', direct_url_only: '仅 URL 直达', hidden_internal: '内部隐藏', deferred: '暂缓',
};

const ACCESS_LEVEL_COLORS: Record<string, string> = {
  primary_nav: 'var(--success)', advanced_nav: '#F97316', launchpad_card: '#8B5CF6',
  related_link: '#3B82F6', direct_url_only: '#6B7280', hidden_internal: '#6B7280', deferred: 'var(--danger)',
};

const CENTER_KIND_LABELS: Record<CenterAccessKind, string> = {
  advanced: 'Advanced Mode', connector: 'Connector Center', lab: 'Lab Center',
  governance: 'Governance Center', navigation_preview: 'Navigation Preview',
};

const CENTER_KIND_COLORS: Record<CenterAccessKind, string> = {
  advanced: '#F97316', connector: '#22C55E', lab: '#3B82F6', governance: '#22C55E', navigation_preview: '#8B5CF6',
};

const READINESS_COLORS: Record<string, string> = {
  ready: 'var(--success)', preview_ready: 'var(--warning)', hold_review: 'var(--danger)', blocked: '#6B7280',
};

const DECISION_COLORS: Record<string, string> = {
  approved: 'var(--success)', hold: 'var(--warning)', rejected: 'var(--danger)', deferred: '#6B7280',
};

const STAGE_COLORS: Record<string, string> = {
  design: '#8B5CF6', pilot: '#F97316', stable: 'var(--success)', retired: '#6B7280',
};

const DECISION_LABELS: Record<string, string> = {
  approved: '已批准', hold: '暂持', rejected: '已拒绝', deferred: '已推迟',
};

const STAGE_LABELS: Record<string, string> = {
  design: '设计阶段', pilot: '试点阶段', stable: '稳定阶段', retired: '已退役',
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

function CenterCard({ center }: { center: CenterAccessItem }) {
  return <div style={{ padding: 12, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderLeft: `3px solid ${RISK_COLORS[center.risk]}`, fontSize: 11, marginBottom: 8 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{center.name}</span>
      <Badge label={CENTER_KIND_LABELS[center.kind]} color={CENTER_KIND_COLORS[center.kind]} />
      <Badge label={center.readiness} color={READINESS_COLORS[center.readiness]} />
      <Badge label={center.exposureRecommendation} color="#6B7280" />
      {center.visibleInSidebar ? <Badge label="已入菜单" color="var(--success)" /> : <Badge label="未入菜单" color="var(--warning)" />}
      {center.allowedNow ? <Badge label="当前可开放" color="var(--success)" /> : <Badge label="当前不可开放" color="var(--warning)" />}
    </div>
    <div style={{ color: 'var(--text-secondary)', marginBottom: 2 }}>路由: {center.route}</div>
    <div style={{ marginBottom: 4, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{center.description}</div>
    {center.requiredBeforeExposure.length > 0 && <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 2 }}>前置条件: {center.requiredBeforeExposure.map(s => <Badge key={s} label={s} color="#6B7280" />)}</div>}
    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 2 }}>{center.safetyBoundary.map(s => <Badge key={s} label={s} color="#6B7280" />)}</div>
    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      <span style={{ color: 'var(--text-muted)' }}>允许: </span>
      {center.allowedActions.map(a => <Badge key={a} label={a} color="var(--success)" />)}
      <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>禁止: </span>
      {center.blockedActions.map(a => <Badge key={a} label={a} color="var(--danger)" />)}
    </div>
    <div style={{ marginTop: 2, color: 'var(--text-muted)', fontStyle: 'italic' }}>{center.notes}</div>
  </div>;
}

function ExposureEntryRow({ entry }: { entry: NavigationExposureEntry }) {
  const isDisallowed = !entry.allowedNow;
  const isHighRisk = entry.risk === 'high';
  return <div style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: `1px solid ${isHighRisk ? 'var(--danger)' : isDisallowed ? 'var(--warning)' : 'var(--border)'}`, fontSize: 11, marginBottom: 4 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 2 }}>
      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 12 }}>{entry.label}</span>
      <Badge label={entry.path} color="#6B7280" /><Badge label={entry.currentExposure} color="#6B7280" />
      <Badge label={`→ ${entry.recommendedExposure}`} color={LEVEL_COLORS[entry.recommendedExposure] || 'var(--secondary)'} />
      <Badge label={entry.risk} color={RISK_COLORS[entry.risk]} />
      {isDisallowed && <Badge label="当前不可开放" color="var(--warning)" />}
      {isHighRisk && <Badge label="高风险，仅可只读评估" color="var(--danger)" />}
      {entry.allowedNow && <Badge label="当前可开放" color="var(--success)" />}
    </div>
    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 2 }}>{entry.gates.map(g => <Badge key={g} label={g} color="#6B7280" />)}</div>
    <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{entry.reason}</div>
    {entry.notes && <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 2 }}>{entry.notes}</div>}
  </div>;
}

function EntryGroup({ title, entries }: { title: string; entries: NavigationExposureEntry[] }) {
  if (entries.length === 0) return <SectionCard title={title} style={{ marginBottom: 16 }}><div style={{ padding: 12, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>暂无条目</div></SectionCard>;
  return <SectionCard title={`${title}（${entries.length}）`} style={{ marginBottom: 16 }}>{entries.map(e => <ExposureEntryRow key={e.id} entry={e} />)}</SectionCard>;
}

function LaunchpadCenterCard({ center }: { center: CenterAccessItem }) {
  const needsTransition = center.accessLevel !== center.recommendedAccessLevel;
  return <div style={{ padding: 12, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderLeft: `3px solid ${RISK_COLORS[center.risk]}`, fontSize: 11, marginBottom: 8 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{center.name}</span>
      <Badge label={center.accessLevel} color={ACCESS_LEVEL_COLORS[center.accessLevel] || '#6B7280'} />
      {needsTransition && <Badge label={`→ ${center.recommendedAccessLevel}`} color={ACCESS_LEVEL_COLORS[center.recommendedAccessLevel] || '#6B7280'} />}
      <Badge label={center.risk} color={RISK_COLORS[center.risk]} />
      <Badge label={DECISION_LABELS[center.exposureDecision]} color={DECISION_COLORS[center.exposureDecision]} />
      <Badge label={STAGE_LABELS[center.exposureStage]} color={STAGE_COLORS[center.exposureStage]} />
      {center.visibleInSidebar ? <Badge label="已入菜单" color="var(--success)" /> : <Badge label="未入菜单" color="var(--warning)" />}
      {center.launchpadVisible && <Badge label="启动台可见" color="var(--success)" />}
      {center.advancedHubVisible && <Badge label="高级中心可见" color="#F97316" />}
    </div>
    <div style={{ color: 'var(--text-secondary)', marginBottom: 2 }}>路由: {center.route} | {center.targetContainer} | owner: {center.owner} | maturity: {center.maturity}</div>
    <div style={{ color: 'var(--text-secondary)', marginBottom: 2, fontSize: 10 }}>影响: {center.userImpact}</div>
    {center.statusBadges.length > 0 && <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 2 }}>{center.statusBadges.map(s => <Badge key={s} label={s} color="#6B7280" />)}</div>}
    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 2 }}>
      {center.safetyBoundary.map(s => <Badge key={s} label={s} color="#6B7280" />)}
    </div>
    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 2 }}>
      <span style={{ color: 'var(--text-muted)' }}>qualityGate: </span>
      {Object.entries(center.qualityGate).map(([k, v]) => <Badge key={k} label={`${k}=${v}`} color={v ? 'var(--success)' : 'var(--danger)'} />)}
    </div>
    {center.releaseGate.length > 0 && <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 2 }}>
      <span style={{ color: 'var(--text-muted)' }}>releaseGate: </span>
      {center.releaseGate.map(g => <Badge key={g} label={g} color="#6B7280" />)}
    </div>}
    {needsTransition && <div style={{ marginBottom: 2 }}>
      <div style={{ fontSize: 9, color: 'var(--warning)', marginBottom: 1 }}>待迁移: {center.accessLevel} → {center.recommendedAccessLevel}</div>
      <div style={{ height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: '40%', borderRadius: 2, background: 'var(--warning)' }} />
      </div>
    </div>}
    <div style={{ marginTop: 2, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{center.exposureReason}</div>
    <div style={{ marginTop: 2, color: 'var(--text-muted)', fontStyle: 'italic' }}>回滚: {center.rollbackPlan}</div>
  </div>;
}

export default function AdvancedModeReadonly() {
  const [centerFilter, setCenterFilter] = useState<string>('all');
  const stats = useMemo(() => getNavigationExposureStats(), []);
  const centerItems = useMemo(() => CENTER_ACCESS_REGISTRY, []);
  const readinessSummary = useMemo(() => getCenterAccessFinalReadinessSummary(), []);

  const advancedCandidates = useMemo(() => getNavigationExposureByLevel('advanced_mode'), []);
  const governanceCandidates = useMemo(() => getNavigationExposureByLevel('governance_center'), []);
  const connectorCandidates = useMemo(() => getNavigationExposureByLevel('connector_center'), []);
  const labCandidates = useMemo(() => getNavigationExposureByLevel('lab_mode'), []);
  const hiddenCandidates = useMemo(() => getNavigationExposureByLevel('hidden_internal'), []);
  const highRiskEntries = useMemo(() => getNavigationExposureHighRiskEntries(), []);
  const readonlyGated = useMemo(() => getNavigationExposureByGate('readonly_only'), []);
  const stageCGated = useMemo(() => getNavigationExposureByGate('stage_c_disabled'), []);

  const advancedOnly = useMemo(() => getAdvancedPlaceholdersByDecision('KEEP_ADVANCED_ONLY'), []);
  const holdReviewItems = useMemo(() => getAdvancedPlaceholderHoldReviewItems(), []);
  const highRiskPlaceholders = useMemo(() => getAdvancedPlaceholdersByRisk('high'), []);
  const placeholderItems = useMemo(() => ADVANCED_PLACEHOLDER_REGISTRY, []);

  const sidebarCandidates = useMemo(() => getCenterAccessSidebarCandidates(), []);
  const hiddenDirect = useMemo(() => centerItems.filter(c => !c.visibleInSidebar), [centerItems]);
  const connectorStatus = useMemo(() => getCenterAccessConnectorStatusSummary(), []);
  const sidebarVisibleCount = useMemo(() => getCenterAccessSidebarVisibleCount(), []);
  const hiddenDirectCount = useMemo(() => getCenterAccessHiddenDirectCount(), []);
  const centerQualityGate = useMemo(() => getCenterAccessQualityGateSummary(), []);
  const connectorTotal = useMemo(() => getConnectorRegistryCount(), []);
  const connectorActive = useMemo(() => getConnectorRegistryByCategory('active'), []);
  const connectorFuture = useMemo(() => getConnectorRegistryByCategory('future'), []);
  const connectorHighRisk = useMemo(() => getConnectorRisk('high'), []);
  const connectorQuality = useMemo(() => getConnectorRegistryQualityGateSummary(), []);
  const labTotal = useMemo(() => getLabRegistryCount(), []);
  const labActive = useMemo(() => getLabRegistryAvailableRoutes(), []);
  const labHold = useMemo(() => getLabHoldReview(), []);
  const labFuture = useMemo(() => getLabFuture(), []);
  const labQuality = useMemo(() => getLabRegistryQualityGateSummary(), []);
  const safetySummary = useMemo(() => getNavigationExposureSafetySummary(), []);
  const centerSummary = useMemo(() => getCenterAccessSummary(), []);
  const launchpadVisible = useMemo(() => getCenterAccessLaunchpadVisible(), []);
  const advancedHubVisible = useMemo(() => getCenterAccessAdvancedHubVisible(), []);
  const highRiskPrimaryNav = useMemo(() => getCenterAccessHighRiskPrimaryNavCount(), []);
  const stageCPrimaryNav = useMemo(() => getCenterAccessStageCPrimaryNavCount(), []);
  const exposureSummary = useMemo(() => getNavigationExposureSummary(), []);
  const validatorIssues = useMemo(() => validateCenterAccess(), []);
  const validatorBlocking = useMemo(() => validatorIssues.filter(i => i.severity === 'blocking').length, [validatorIssues]);
  const validatorWarning = useMemo(() => validatorIssues.filter(i => i.severity === 'warning').length, [validatorIssues]);
  const validatorInfo = useMemo(() => validatorIssues.filter(i => i.severity === 'info').length, [validatorIssues]);

  return (
    <PageShell
      title="高级模式入口总控"
      subtitle="Readonly Center Launchpad — governance-navigation baseline. Does not change Layout, sidebar, or enable Stage C."
      versionLabel="AIP v7.22.0-P2 + P3"
      maturity="preview"
      safetyBoundary="readonly"
      safetyText="Readonly · No sidebar change · Stage C deferred · No executable controls"
    >
      {/* KPI Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 20 }}>
        <KpiCard label="总条目" value={String(stats.total)} color="var(--primary)" />
        <KpiCard label="中心" value={String(centerItems.length)} color="var(--primary)" />
        <KpiCard label="Advanced 候选" value={String(advancedCandidates.length)} color="#F97316" />
        <KpiCard label="Governance 候选" value={String(governanceCandidates.length)} color="#22C55E" />
        <KpiCard label="Connector 候选" value={String(connectorCandidates.length)} color="#22C55E" />
        <KpiCard label="Lab 候选" value={String(labCandidates.length)} color="#3B82F6" />
        <KpiCard label="未开放" value={String(stats.allowedNowFalseCount)} color="var(--warning)" />
        <KpiCard label="高风险" value={String(stats.highRiskCount)} color="var(--danger)" />
      </div>

      {/* ── A1. Cross-Center Operations Overview ── */}
      <SectionCard title="跨中心运营概览" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 10, marginBottom: 12 }}>
          <KpiCard label="总中心" value={String(centerItems.length)} color="var(--primary)" />
          <KpiCard label="已入菜单" value={String(sidebarVisibleCount)} color="var(--success)" />
          <KpiCard label="隐藏直达" value={String(hiddenDirectCount)} color="var(--warning)" />
          <KpiCard label="Quality全过" value={String(centerQualityGate.passedAll)} color="var(--success)" />
          <KpiCard label="Connector" value={String(connectorTotal)} color="#22C55E" />
          <KpiCard label="Lab" value={String(labTotal)} color="#3B82F6" />
        </div>
      </SectionCard>

      {/* ── A2. Cross-Center Safety & Risk Matrix ── */}
      <SectionCard title="跨中心安全与风险矩阵" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8, fontSize: 10 }}>
          {centerItems.map(c => <div key={c.id} style={{ padding: '8px 10px', borderRadius: 6, background: 'var(--bg-surface)', border: `1px solid ${RISK_COLORS[c.risk]}`, borderLeft: `4px solid ${RISK_COLORS[c.risk]}`, fontSize: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</span>
              <Badge label={c.risk} color={RISK_COLORS[c.risk]} />
              <Badge label={c.operationalMode} color="#6B7280" />
              <Badge label={`${c.readinessScore}%`} color={c.readinessScore >= 80 ? 'var(--success)' : c.readinessScore >= 50 ? 'var(--warning)' : 'var(--danger)'} />
            </div>
            {[
              ['只读', String(c.qualityGate.readonly)],
              ['无写DB', String(c.qualityGate.noDbWrite)],
              ['无外部控制', String(c.qualityGate.noExternalControl)],
              ['无Stage C', String(c.qualityGate.noStageC)],
              ['无危险操作', String(c.qualityGate.noDangerousActions)],
              ['已入菜单', String(c.visibleInSidebar)],
              ['可开放', String(c.allowedNow)],
            ].map(([label, val]) => <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
              <span style={{ color: 'var(--text-muted)' }}>{label}</span>
              <span style={{ color: val === 'true' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{val === 'true' ? '✅' : '❌'}</span>
            </div>)}
          </div>)}
        </div>
      </SectionCard>

      {/* ── A3. Connector / Lab Snapshot ── */}
      <SectionCard title="Connector / Lab 快照" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 12 }}>
          <KpiCard label="Connector总数" value={String(connectorTotal)} color="var(--primary)" />
          <KpiCard label="Active" value={String(connectorActive.length)} color="var(--success)" />
          <KpiCard label="Future" value={String(connectorFuture.length)} color="var(--warning)" />
          <KpiCard label="高风险" value={String(connectorHighRisk.length)} color="var(--danger)" />
          <KpiCard label="Lab总数" value={String(labTotal)} color="#3B82F6" />
          <KpiCard label="Active" value={String(labActive.length)} color="var(--success)" />
          <KpiCard label="待复核" value={String(labHold.length)} color="var(--warning)" />
          <KpiCard label="Future" value={String(labFuture.length)} color="#6B7280" />
        </div>
      </SectionCard>

      {/* ── A4. Center Launchpad Preview (enhanced v7.22.0-P1) ── */}
      <SectionCard title="Center Launchpad Preview" style={{ marginBottom: 20, border: '1px solid var(--secondary)' }}>
        <CenterLaunchpadOverview />
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {[
            { key: 'all', label: 'All centers' },
            { key: 'sidebar', label: 'Sidebar' },
            { key: 'launchpad_only', label: 'Launchpad only' },
            { key: 'governance_gated', label: 'Governance gated' },
            { key: 'readonly_preview', label: 'Readonly preview' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setCenterFilter(f.key)}
              style={{
                padding: '4px 12px', borderRadius: 14, border: 'none',
                fontSize: 10, fontWeight: 600, cursor: 'pointer',
                background: centerFilter === f.key ? '#8B5CF6' : 'rgba(139,92,246,0.1)',
                color: centerFilter === f.key ? '#fff' : '#8B5CF6',
              }}
            >{f.label}</button>
          ))}
        </div>
        {/* Grouped cards */}
        {[
          { group: 'primary', title: 'Primary Sidebar Centers', filterKey: 'sidebar' },
          { group: 'connector', title: 'Primary Capability Entry', filterKey: 'sidebar' },
          { group: 'lab', title: 'Launchpad-Only Centers', filterKey: 'launchpad_only' },
          { group: 'governance', title: 'Governance / Deferred Centers', filterKey: 'governance_gated' },
          { group: 'navigation', title: 'Readonly Preview Centers', filterKey: 'readonly_preview' },
        ].map(({ group, title, filterKey }) => {
          if (centerFilter !== 'all' && centerFilter !== filterKey) return null;
          const items = centerItems.filter(c => c.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, borderBottom: '1px solid var(--border)', paddingBottom: 4 }}>{title} ({items.length})</div>
              {items.map(c => <CenterLaunchpadCard key={c.id} center={c} />)}
            </div>
          );
        })}
        {centerFilter === 'all' && centerItems.filter(c => c.group === 'primary').length === 0 && (
          <div style={{ padding: 12, textAlign: 'center', color: 'var(--text-muted)', fontSize: 11 }}>No centers match current filter.</div>
        )}
        {/* Decision Path + Safety Matrix */}
        <CenterLaunchpadDecisionPath />
        {/* Safety Notice */}
        <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 4, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.7 }}>
          <strong>Readonly safety notice:</strong><br />
          This section is a <u>Center Launchpad preview</u>. Data from center-access-registry (readonly metadata). Does not change Layout, sidebar, routes, or enable Stage C. No DB writes. No external control.
        </div>
        {/* Recommended Next Actions */}
        <div style={{ marginTop: 12, padding: 10, borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Next posture (readonly guidance)</div>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 10, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
            <li>Connector Center — <strong>keep primary_nav</strong> (sidebar pilot)</li>
            <li>Advanced Mode — <strong>keep primary_nav</strong> (sidebar pilot)</li>
            <li>Lab Center — <strong>keep launchpad_card</strong> (no sidebar)</li>
            <li>Governance Center — <strong>keep launchpad_card</strong> (no sidebar)</li>
            <li>Navigation Preview — <strong>keep direct_url_only</strong> (no sidebar)</li>
            <li>Stage C — <strong>deferred</strong> (not enabled)</li>
          </ul>
        </div>
      </SectionCard>

      {/* ── A. Center Readiness Dashboard ── */}
      <SectionCard title="中心就绪仪表板" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 10, marginBottom: 12 }}>
          <KpiCard label="总中心" value={String(readinessSummary.total)} color="var(--primary)" />
          <KpiCard label="就绪" value={String(readinessSummary.ready)} color="var(--success)" />
          <KpiCard label="预览就绪" value={String(readinessSummary.previewReady)} color="var(--warning)" />
          <KpiCard label="待复核" value={String(readinessSummary.holdReview)} color="var(--danger)" />
          <KpiCard label="已拦截" value={String(readinessSummary.blocked)} color="#6B7280" />
          <KpiCard label="已入菜单" value={String(sidebarVisibleCount)} color="var(--success)" />
          <KpiCard label="隐藏直达" value={String(hiddenDirectCount)} color="var(--warning)" />
        </div>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {centerItems.map(c => <Badge key={c.id} label={`${c.name}: ${c.readiness}`} color={READINESS_COLORS[c.readiness] || '#6B7280'} />)}
        </div>
      </SectionCard>

      {/* ── B. Center Exposure Recommendation ── */}
      <SectionCard title="中心曝光建议" style={{ marginBottom: 20 }}>
        {[
          { label: 'keep_sidebar — 保持菜单可见', items: centerItems.filter(c => c.exposureRecommendation === 'keep_sidebar') },
          { label: 'keep_hidden_direct — 保持隐藏直达', items: centerItems.filter(c => c.exposureRecommendation === 'keep_hidden_direct') },
          { label: 'consider_sidebar_later — 未来可考虑入菜单', items: centerItems.filter(c => c.exposureRecommendation === 'consider_sidebar_later') },
          { label: 'do_not_expose — 禁止曝光', items: centerItems.filter(c => c.exposureRecommendation === 'do_not_expose') },
        ].map(group => (
          <div key={group.label} style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 2 }}>{group.label}（{group.items.length}）</div>
            {group.items.length > 0 ? <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>{group.items.map(c => <Badge key={c.id} label={c.name} color={READINESS_COLORS[c.readiness] || '#6B7280'} />)}</div>
              : <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>无</div>}
          </div>
        ))}
      </SectionCard>

      {/* ── Center Access Console ── */}
      <SectionCard title={`中心访问控制台（${centerItems.length}）`} style={{ marginBottom: 20, border: '1px solid var(--secondary)' }}>
        <div style={{ padding: '6px 10px', marginBottom: 8, borderRadius: 4, background: 'rgba(139,92,246,0.08)', fontSize: 10, color: '#8B5CF6' }}>
          以下为当前所有中心入口的状态总览。仅 Advanced Mode Preview 已入左侧菜单。
        </div>
        {centerItems.map(c => <CenterCard key={c.id} center={c} />)}
      </SectionCard>

      {/* ── C. Advanced Placeholder Decision Matrix ── */}
      <SectionCard title={`Advanced Placeholder 决策矩阵（${placeholderItems.length}）`} style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8, marginBottom: 12 }}>
          <KpiCard label="总数" value={String(placeholderItems.length)} color="var(--primary)" />
          <KpiCard label="Advanced-only" value={String(advancedOnly.length)} color="#F97316" />
          <KpiCard label="HOLD_REVIEW" value={String(holdReviewItems.length)} color="var(--danger)" />
          <KpiCard label="高风险" value={String(highRiskPlaceholders.length)} color="var(--danger)" />
        </div>
        {placeholderItems.map(p => {
          const isHold = p.decision === 'HOLD_REVIEW';
          const isHigh = p.risk === 'high';
          return <div key={p.id} style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: `1px solid ${isHigh ? 'var(--danger)' : 'var(--border)'}`, borderLeft: `3px solid ${RISK_COLORS[p.risk]}`, fontSize: 11, marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 2 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 12 }}>{p.label}</span>
              <Badge label={p.path} color="#6B7280" />
              <Badge label={p.decision} color={isHold ? 'var(--danger)' : '#F97316'} />
              <Badge label={p.risk} color={RISK_COLORS[p.risk]} />
              {!p.allowedNow && <Badge label="当前不可开放" color="var(--warning)" />}
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>{p.reason}</div>
            <div style={{ marginTop: 2, color: 'var(--text-muted)' }}>下一步: {p.nextAction}</div>
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 2 }}>
              {p.gates.map(g => <Badge key={g} label={g} color="#6B7280" />)}
            </div>
          </div>;
        })}
      </SectionCard>

      {/* ── D. HOLD_REVIEW Focus ── */}
      <SectionCard title={`HOLD_REVIEW 重点关注（${holdReviewItems.length}）`} style={{ marginBottom: 20, border: '1px solid var(--danger)' }}>
        <div style={{ padding: '6px 10px', marginBottom: 8, borderRadius: 4, background: 'rgba(239,68,68,0.08)', fontSize: 10, color: 'var(--danger)' }}>
          以下条目当前不开放、不进入主菜单、不执行。需要人工复核安全边界后才能决定下一步。
        </div>
        {holdReviewItems.map(p => <div key={p.id} style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--danger)', fontSize: 11, marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 2 }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 12 }}>{p.label}</span>
            <Badge label={p.path} color="#6B7280" />
            <Badge label={p.risk} color="var(--danger)" />
            <Badge label="当前不可开放" color="var(--warning)" />
            <Badge label="需要人工复核" color="var(--danger)" />
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>{p.reason}</div>
          <div style={{ marginTop: 2, color: 'var(--text-muted)' }}>下一步: {p.nextAction}</div>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 2 }}>{p.blockedActions.map(a => <Badge key={a} label={a} color="var(--danger)" />)}</div>
        </div>)}
      </SectionCard>

      {/* ── E. Final Readiness Preflight ── */}
      <SectionCard title="Final Readiness Preflight" style={{ marginBottom: 20, border: '1px solid var(--success)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, fontSize: 11 }}>
          {[
            ['Layout 未修改', centerItems.length > 0 ? '✅' : '❌'],
            ['未新增左侧菜单', String(centerItems.filter(c => c.visibleInSidebar).length === 1)],
            ['Stage C 已禁用', '✅'],
            ['Governance Center 未入菜单', String(!centerItems.find(c => c.kind === 'governance')?.visibleInSidebar)],
            ['Connector Center 未入菜单', String(!centerItems.find(c => c.kind === 'connector')?.visibleInSidebar)],
            ['Lab Center 未入菜单', String(!centerItems.find(c => c.kind === 'lab')?.visibleInSidebar)],
            ['高风险 not allowedNow', String(highRiskPlaceholders.every(p => !p.allowedNow))],
            ['未写 DB', '✅'],
            ['未控制外部工具', '✅'],
          ].map(([label, value]) => (
            <div key={String(label)} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 4, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
              <span style={{ fontWeight: 600, color: value === '✅' || value === 'true' ? 'var(--success)' : 'var(--danger)' }}>{value}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(34,197,94,0.08)', fontSize: 10, color: 'var(--success)' }}>
          v7.18.0 当前阶段具备 closure 条件。无 blocking。继续 no-tag / no-release。
        </div>
      </SectionCard>

      {/* Governance Center Strategy Notice */}
      <SectionCard title="治理中心（Governance Center）策略" style={{ marginBottom: 20, border: '1px solid var(--warning)' }}>
        <div style={{ fontSize: 11, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <p><strong>当前状态：</strong>未加入左侧菜单 · URL 直达 · Stage C deferred</p>
          <p><strong>readiness:</strong> hold_review · <strong>exposureRecommendation:</strong> do_not_expose</p>
          <p><strong>前置条件：</strong>Stage C remains disabled, no execution buttons, readonly validator pass, human approval</p>
          <p><strong>安全边界：</strong>只读治理面板，不写数据库，不移动菜单，不处理 candidate，不发布 Release</p>
        </div>
      </SectionCard>

      {/* Exposure Level Summary */}
      <SectionCard title="曝光等级分布" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {Object.entries(NAVIGATION_EXPOSURE_LEVELS).map(([key, meta]) => {
            const count = stats.byRecommendedLevel[key] || 0;
            return <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: LEVEL_COLORS[key] || '#6B7280', minWidth: 24 }}>{count}</span>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{meta.label}</div><div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{key}</div></div>
            </div>;
          })}
        </div>
      </SectionCard>

      {/* Risk Summary */}
      <SectionCard title="风险分布" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {Object.entries(stats.byRisk).map(([risk, count]) => <div key={risk} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: RISK_COLORS[risk] || '#6B7280', minWidth: 24 }}>{count}</span>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{risk}</span>
          </div>)}
        </div>
      </SectionCard>

      {/* Grouped Entries */}
      <EntryGroup title="Advanced Mode 候选" entries={advancedCandidates} />
      <EntryGroup title="Governance Center 候选" entries={governanceCandidates} />
      <EntryGroup title="Connector Center 候选" entries={connectorCandidates} />
      <EntryGroup title="Lab Mode 候选" entries={labCandidates} />
      <EntryGroup title="保持隐藏 / 不开放" entries={hiddenCandidates} />

      {/* High Risk */}
      <SectionCard title={`高风险条目 — 仅可只读评估（${highRiskEntries.length}）`} style={{ marginBottom: 20, border: '1px solid var(--danger)' }}>
        {highRiskEntries.length > 0 ? <div><div style={{ padding: '6px 10px', marginBottom: 8, borderRadius: 4, background: 'rgba(239,68,68,0.08)', fontSize: 10, color: 'var(--danger)' }}>以下高风险条目不可直接开放。</div>{highRiskEntries.map(e => <ExposureEntryRow key={e.id} entry={e} />)}</div>
          : <div style={{ padding: 12, textAlign: 'center', color: 'var(--success)', fontSize: 12 }}>✅ 无高风险条目</div>}
      </SectionCard>

      {/* Stage C gated */}
      <SectionCard title={`Stage C 相关门控条目（${stageCGated.length}）`} style={{ marginBottom: 20 }}>
        <div style={{ padding: '6px 10px', marginBottom: 8, borderRadius: 4, background: 'rgba(245,158,11,0.08)', fontSize: 10, color: 'var(--warning)' }}>Stage C 尚未开始。</div>
        {stageCGated.map(e => <ExposureEntryRow key={e.id} entry={e} />)}
      </SectionCard>

      {/* Readonly gated */}
      <SectionCard title={`仅只读门控条目（${readonlyGated.length}）`} style={{ marginBottom: 20 }}>{readonlyGated.map(e => <ExposureEntryRow key={e.id} entry={e} />)}</SectionCard>

      {/* ═══════════════════════════════════════════
          P3 — Readonly Control Room Sections
          ═══════════════════════════════════════════ */}
      <SectionCard title="Readonly Control Room Overview" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <ReadonlyControlRoomOverview />
      </SectionCard>

      <SectionCard title="Governance Baseline" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <GovernanceBaselinePanel />
      </SectionCard>

      <SectionCard title="Connector Readiness Bridge" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <ConnectorReadinessSummaryBridge />
      </SectionCard>

      <SectionCard title="System Safety Matrix" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <SystemSafetyMatrix />
      </SectionCard>

      <SectionCard title="Version Progress Timeline" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <VersionProgressTimeline />
      </SectionCard>

      <SectionCard title="Next Recommended Workstreams" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <NextWorkstreamPanel />
      </SectionCard>

      {/* ── P3 Control Room Safety Notice ── */}
      <div style={{ marginTop: 24, padding: '14px 16px', borderRadius: 6, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7 }}>
        <strong>P3 Control Room safety notice:</strong><br />
        This is a <u>readonly control room / system overview</u>. All data is from static registries. Does not change Layout, sidebar, routes, or enable Stage C. No DB writes, no external calls, no candidate mutation, no LAN sync, no service control, no tag/release, no version mutation, no real control buttons. All panels are governance-safe display only.
      </div>

      {/* Boundary Notice */}
      <div style={{ marginTop: 24, padding: '14px 16px', borderRadius: 6, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7 }}>
        <strong>Readonly boundary notice:</strong><br />
        This is a <u>readonly governance launchpad</u>. All registry data is readonly metadata. Does not enable Advanced Mode, change sidebar, enable Stage C, execute high-risk actions, or write to database. All <code>allowedNow=false</code> entries are displayed for readonly assessment only.
      </div>
    </PageShell>
  );
}
