import React, { useMemo } from 'react';
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
  getNavigationExposureAdvancedCandidates,
} from '../registry/navigation-exposure-registry';
import {
  CENTER_ACCESS_REGISTRY,
  getCenterAccessItemCount,
  getCenterAccessVisibleItems,
  getCenterAccessHiddenItems,
  getCenterAccessByKind,
} from '../registry/center-access-registry';
import type { NavigationExposureEntry, NavigationExposureLevel, NavigationExposureRisk } from '../registry/navigation-exposure-registry';
import type { CenterAccessItem, CenterAccessKind, CenterAccessRisk } from '../registry/center-access-registry';

const RISK_COLORS: Record<string, string> = {
  low: 'var(--success)',
  medium: 'var(--warning)',
  high: 'var(--danger)',
};

const LEVEL_COLORS: Record<string, string> = {
  hidden_internal: '#6B7280',
  direct_route: '#8B5CF6',
  advanced_mode: '#F97316',
  lab_mode: '#3B82F6',
  connector_center: '#22C55E',
  governance_center: '#22C55E',
  primary_nav: 'var(--success)',
};

const CENTER_KIND_LABELS: Record<CenterAccessKind, string> = {
  advanced: 'Advanced Mode',
  connector: 'Connector Center',
  lab: 'Lab Center',
  governance: 'Governance Center',
  navigation_preview: 'Navigation Preview',
};

const CENTER_KIND_COLORS: Record<CenterAccessKind, string> = {
  advanced: '#F97316',
  connector: '#22C55E',
  lab: '#3B82F6',
  governance: '#22C55E',
  navigation_preview: '#8B5CF6',
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

function CenterCard({ center }: { center: CenterAccessItem }) {
  return (
    <div style={{
      padding: 12, borderRadius: 8, background: 'var(--bg-surface)',
      border: '1px solid var(--border)', borderLeft: `3px solid ${RISK_COLORS[center.risk]}`,
      fontSize: 11, marginBottom: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{center.name}</span>
        <Badge label={CENTER_KIND_LABELS[center.kind]} color={CENTER_KIND_COLORS[center.kind]} />
        <Badge label={center.status} color={center.status === 'available_route' ? 'var(--success)' : '#6B7280'} />
        <Badge label={center.risk} color={RISK_COLORS[center.risk]} />
        {center.visibleInSidebar ? <Badge label="已入菜单" color="var(--success)" /> : <Badge label="未入菜单" color="var(--warning)" />}
        {center.allowedNow ? <Badge label="当前可开放" color="var(--success)" /> : <Badge label="当前不可开放" color="var(--warning)" />}
      </div>
      <div style={{ color: 'var(--text-secondary)', marginBottom: 2 }}>路由: {center.route}</div>
      <div style={{ marginBottom: 4, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{center.description}</div>
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 2 }}>
        {center.safetyBoundary.map(s => <Badge key={s} label={s} color="#6B7280" />)}
      </div>
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--text-muted)' }}>允许: </span>
        {center.allowedActions.map(a => <Badge key={a} label={a} color="var(--success)" />)}
        <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>禁止: </span>
        {center.blockedActions.map(a => <Badge key={a} label={a} color="var(--danger)" />)}
      </div>
      <div style={{ marginTop: 2, color: 'var(--text-muted)', fontStyle: 'italic' }}>{center.notes}</div>
    </div>
  );
}

function ExposureEntryRow({ entry }: { entry: NavigationExposureEntry }) {
  const isDisallowed = !entry.allowedNow;
  const isHighRisk = entry.risk === 'high';
  return (
    <div style={{
      padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)',
      border: `1px solid ${isHighRisk ? 'var(--danger)' : isDisallowed ? 'var(--warning)' : 'var(--border)'}`,
      fontSize: 11, marginBottom: 4,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 2 }}>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 12 }}>{entry.label}</span>
        <Badge label={entry.path} color="#6B7280" />
        <Badge label={entry.currentExposure} color="#6B7280" />
        <Badge label={`→ ${entry.recommendedExposure}`} color={LEVEL_COLORS[entry.recommendedExposure] || 'var(--secondary)'} />
        <Badge label={entry.risk} color={RISK_COLORS[entry.risk]} />
        {isDisallowed && <Badge label="当前不可开放" color="var(--warning)" />}
        {isHighRisk && <Badge label="高风险，仅可只读评估" color="var(--danger)" />}
        {entry.allowedNow && <Badge label="当前可开放" color="var(--success)" />}
      </div>
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 2 }}>
        {entry.gates.map(g => <Badge key={g} label={g} color="#6B7280" />)}
      </div>
      <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{entry.reason}</div>
      {entry.notes && <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 2 }}>{entry.notes}</div>}
    </div>
  );
}

function EntryGroup({ title, entries }: { title: string; entries: NavigationExposureEntry[] }) {
  if (entries.length === 0) {
    return (
      <SectionCard title={title} style={{ marginBottom: 16 }}>
        <div style={{ padding: 12, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>暂无条目</div>
      </SectionCard>
    );
  }
  return (
    <SectionCard title={`${title}（${entries.length}）`} style={{ marginBottom: 16 }}>
      {entries.map(e => <ExposureEntryRow key={e.id} entry={e} />)}
    </SectionCard>
  );
}

export default function AdvancedModeReadonly() {
  const stats = useMemo(() => getNavigationExposureStats(), []);
  const centerItems = useMemo(() => CENTER_ACCESS_REGISTRY, []);

  const advancedCandidates = useMemo(() => getNavigationExposureByLevel('advanced_mode'), []);
  const governanceCandidates = useMemo(() => getNavigationExposureByLevel('governance_center'), []);
  const connectorCandidates = useMemo(() => getNavigationExposureByLevel('connector_center'), []);
  const labCandidates = useMemo(() => getNavigationExposureByLevel('lab_mode'), []);
  const hiddenCandidates = useMemo(() => getNavigationExposureByLevel('hidden_internal'), []);
  const highRiskEntries = useMemo(() => getNavigationExposureHighRiskEntries(), []);
  const disallowedEntries = useMemo(() => getNavigationExposureAllowedNowFalseEntries(), []);
  const readonlyGated = useMemo(() => getNavigationExposureByGate('readonly_only'), []);
  const stageCGated = useMemo(() => getNavigationExposureByGate('stage_c_disabled'), []);

  const advancedPlaceholders = useMemo(() => getNavigationExposureAdvancedCandidates(), []);

  return (
    <PageShell
      title="高级模式入口总控"
      subtitle="只读查看中心入口、隐藏路由与 Advanced placeholder 的曝光状态；本页面不启用高级模式，不改变导航。"
      versionLabel="AIP v7.18.0-P1"
      maturity="preview"
      safetyBoundary="readonly"
      safetyText="只读总控 · 不改变菜单 · 不启用 Stage C · 不执行高风险动作"
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

      {/* Exposure Level Summary */}
      <SectionCard title="曝光等级分布" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {Object.entries(NAVIGATION_EXPOSURE_LEVELS).map(([key, meta]) => {
            const count = stats.byRecommendedLevel[key] || 0;
            return (
              <div key={key} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6,
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: LEVEL_COLORS[key] || '#6B7280', minWidth: 24 }}>{count}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{meta.label}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{key}</div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Risk Summary */}
      <SectionCard title="风险分布" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {Object.entries(stats.byRisk).map(([risk, count]) => (
            <div key={risk} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6,
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: RISK_COLORS[risk] || '#6B7280', minWidth: 24 }}>{count}</span>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{risk}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Center Access Console ── */}
      <SectionCard title={`中心访问控制台（${centerItems.length}）`} style={{ marginBottom: 20, border: '1px solid var(--secondary)' }}>
        <div style={{ padding: '6px 10px', marginBottom: 8, borderRadius: 4, background: 'rgba(139,92,246,0.08)', fontSize: 10, color: '#8B5CF6' }}>
          以下为当前所有中心入口的状态总览。仅 Advanced Mode Preview 已入左侧菜单，其余为隐藏直达路由。
        </div>
        {centerItems.map(c => <CenterCard key={c.id} center={c} />)}
      </SectionCard>

      {/* ── Governance Center Strategy Notice ── */}
      <SectionCard title="治理中心（Governance Center）策略" style={{ marginBottom: 20, border: '1px solid var(--warning)' }}>
        <div style={{ fontSize: 11, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <p><strong>当前状态：</strong>未加入左侧菜单 · URL 直达 · Stage C deferred</p>
          <p><strong>允许现在开放：</strong>否</p>
          <p><strong>门控条件：</strong>readonly_only、governance_center_enabled、stage_c_disabled</p>
          <p><strong>Stage C 状态：</strong>deferred — 本页面不启用 Stage C，不提供启用按钮</p>
          <p><strong>安全边界：</strong>只读治理面板，不写数据库，不移动菜单，不处理 candidate，不发布 Release</p>
        </div>
      </SectionCard>

      {/* ── Advanced Placeholder Triage ── */}
      <SectionCard title={`Advanced Placeholder Triage（${advancedPlaceholders.length}）`} style={{ marginBottom: 20 }}>
        <div style={{ padding: '6px 10px', marginBottom: 8, borderRadius: 4, background: 'rgba(249,115,22,0.08)', fontSize: 10, color: '#F97316' }}>
          以下为建议归入 Advanced Mode 的占位页面。不是 Lab，不是 Connector，不是 Governance。Advanced-only 且需门控。
        </div>
        {advancedPlaceholders.length > 0 ? (
          <div>
            {advancedPlaceholders.map(e => (
              <div key={e.id} style={{
                padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)',
                border: '1px solid var(--border)', fontSize: 11, marginBottom: 4,
                borderLeft: `3px solid ${RISK_COLORS[e.risk]}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 2 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 12 }}>{e.label}</span>
                  <Badge label={e.path} color="#6B7280" />
                  <Badge label={e.risk} color={RISK_COLORS[e.risk]} />
                  <Badge label="Advanced-only" color="#F97316" />
                  {e.risk === 'high' && <Badge label="HOLD_REVIEW" color="var(--danger)" />}
                </div>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{e.reason}</div>
                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 2 }}>
                  {e.gates.map(g => <Badge key={g} label={g} color="#6B7280" />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: 12, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>暂无 Advanced placeholder 候选</div>
        )}
      </SectionCard>

      {/* ── Safety Summary ── */}
      <SectionCard title="安全边界摘要" style={{ marginBottom: 20, border: '1px solid var(--warning)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, fontSize: 11 }}>
          {[
            ['Stage C', '未启用', 'var(--success)'],
            ['Governance Center 入菜单', '否', 'var(--success)'],
            ['Connector Center 入菜单', '否', 'var(--success)'],
            ['Lab Center 入菜单', '否', 'var(--success)'],
            ['Navigation Preview 入菜单', '否', 'var(--success)'],
            ['高风险 entry → primary_nav', '0', 'var(--success)'],
            ['高风险 entry → allowedNow=true', '0', 'var(--success)'],
            ['真实执行按钮', '无', 'var(--success)'],
          ].map(([label, value, color]) => (
            <div key={String(label)} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 4, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
              <span style={{ fontWeight: 600, color }}>{value}</span>
            </div>
          ))}
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
        {highRiskEntries.length > 0 ? (
          <div>
            <div style={{ padding: '6px 10px', marginBottom: 8, borderRadius: 4, background: 'rgba(239,68,68,0.08)', fontSize: 10, color: 'var(--danger)' }}>
              以下高风险条目不可直接开放。需要人工审批和只读门控。
            </div>
            {highRiskEntries.map(e => <ExposureEntryRow key={e.id} entry={e} />)}
          </div>
        ) : (
          <div style={{ padding: 12, textAlign: 'center', color: 'var(--success)', fontSize: 12 }}>✅ 无高风险条目</div>
        )}
      </SectionCard>

      {/* Stage C gated */}
      <SectionCard title={`Stage C 相关门控条目（${stageCGated.length}）`} style={{ marginBottom: 20 }}>
        <div style={{ padding: '6px 10px', marginBottom: 8, borderRadius: 4, background: 'rgba(245,158,11,0.08)', fontSize: 10, color: 'var(--warning)' }}>
          Stage C 尚未开始。以下条目包含 stage_c_disabled 门控，表示需要 Stage C 完成后才能开放。
        </div>
        {stageCGated.map(e => <ExposureEntryRow key={e.id} entry={e} />)}
      </SectionCard>

      {/* Only Readonly gated */}
      <SectionCard title={`仅只读门控条目（${readonlyGated.length}）`} style={{ marginBottom: 20 }}>
        {readonlyGated.map(e => <ExposureEntryRow key={e.id} entry={e} />)}
      </SectionCard>

      {/* Boundary Notice */}
      <div style={{ marginTop: 24, padding: '14px 16px', borderRadius: 6, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7 }}>
        <strong>只读边界声明：</strong><br />
        本页面是<u>高级模式入口总控页面</u>。Center Access Registry 是<u>只读元数据</u>。
        本页面不启用高级模式、不改变左侧菜单、不启用 Stage C、不执行高风险动作、不写数据库。
        所有 allowedNow=false 的条目仅做只读展示，不可在此页面开放。
      </div>
    </PageShell>
  );
}
