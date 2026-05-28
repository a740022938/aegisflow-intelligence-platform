import React, { useMemo } from 'react';
import PageShell from '../components/ui/PageShell';
import SectionCard from '../components/ui/SectionCard';
import {
  NAVIGATION_EXPOSURE_REGISTRY,
  NAVIGATION_EXPOSURE_LEVELS,
  getNavigationExposureGroupedByRecommendedLevel,
  getNavigationExposureStats,
} from '../registry/navigation-exposure-registry';
import type { NavigationExposureEntry, NavigationExposureRisk } from '../registry/navigation-exposure-registry';

const RISK_COLORS: Record<NavigationExposureRisk, string> = {
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

const GROUP_LABELS: Record<string, string> = {
  primary_nav: 'Primary Nav 主菜单候选',
  advanced_mode: 'Advanced Mode 高级模式候选',
  connector_center: 'Connector Center 连接器中心候选',
  lab_mode: 'Lab Mode 实验室候选',
  governance_center: 'Governance Center 治理中心候选',
  hidden_internal: '保持隐藏 / 不开放',
};

const GROUP_DESCRIPTIONS: Record<string, string> = {
  primary_nav: '当前已在左侧菜单中的正式页面。保持现有曝光状态。',
  advanced_mode: '当前在主菜单中但建议归入高级模式的页面。需要 Advanced Mode 门控。',
  connector_center: '建议归入连接器中心的外部工具只读页面。需要 connector_center_enabled 门控。',
  lab_mode: '建议归入实验室分组的调试/实验工具页面。需要 lab_mode 门控。',
  governance_center: '建议归入治理中心的只读治理页面。需要 governance_center_enabled 门控，Stage C deferred。',
  hidden_internal: '建议继续隐藏的内部占位页面。不加入导航。',
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

function EntryRow({ entry }: { entry: NavigationExposureEntry }) {
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
        {isHighRisk && <Badge label="高风险，只读评估，不允许直接曝光" color="var(--danger)" />}
        {entry.allowedNow && <Badge label="当前可开放" color="var(--success)" />}
      </div>
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 2 }}>
        {entry.gates.map(g => <Badge key={g} label={g} color="#6B7280" />)}
      </div>
      <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{entry.reason}</div>
    </div>
  );
}

function GroupSection({ levelKey, entries }: { levelKey: string; entries: NavigationExposureEntry[] }) {
  if (entries.length === 0) return null;
  const label = GROUP_LABELS[levelKey] || levelKey;
  const desc = GROUP_DESCRIPTIONS[levelKey] || '';
  return (
    <SectionCard title={`${label}（${entries.length}）`} style={{ marginBottom: 16 }}>
      {desc && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>{desc}</div>}
      {entries.map(e => <EntryRow key={e.id} entry={e} />)}
    </SectionCard>
  );
}

export default function NavigationPreviewReadonly() {
  const stats = useMemo(() => getNavigationExposureStats(), []);
  const grouped = useMemo(() => getNavigationExposureGroupedByRecommendedLevel(), []);

  const order = ['primary_nav', 'advanced_mode', 'connector_center', 'lab_mode', 'governance_center', 'hidden_internal'] as const;

  const highRiskEntries = useMemo(
    () => NAVIGATION_EXPOSURE_REGISTRY.filter(e => e.risk === 'high'),
    [],
  );

  const disallowedEntries = useMemo(
    () => NAVIGATION_EXPOSURE_REGISTRY.filter(e => !e.allowedNow),
    [],
  );

  return (
    <PageShell
      title="导航预览中心"
      subtitle="只读预览未来 Advanced / Connector / Lab / Governance 分组结构；本页面不改变真实左侧菜单。"
      versionLabel="AIP v8.0.0 · Navigation Preview"
      maturity="preview"
      safetyBoundary="readonly"
      safetyText="只读预览 · 不改变菜单 · 不启用 Stage C · 不执行菜单移动"
    >
      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 20 }}>
        <KpiCard label="总条目" value={String(stats.total)} color="var(--primary)" />
        <KpiCard label="Advanced" value={String((stats.byRecommendedLevel['advanced_mode'] || 0))} color="#F97316" />
        <KpiCard label="Connector" value={String((stats.byRecommendedLevel['connector_center'] || 0))} color="#22C55E" />
        <KpiCard label="Lab" value={String((stats.byRecommendedLevel['lab_mode'] || 0))} color="#3B82F6" />
        <KpiCard label="Governance" value={String((stats.byRecommendedLevel['governance_center'] || 0))} color="#22C55E" />
        <KpiCard label="Primary Nav" value={String((stats.byRecommendedLevel['primary_nav'] || 0))} color="var(--success)" />
        <KpiCard label="未开放" value={String(stats.allowedNowFalseCount)} color="var(--warning)" />
        <KpiCard label="高风险" value={String(stats.highRiskCount)} color="var(--danger)" />
      </div>

      {/* Groups */}
      {order.map(key => {
        const entries = grouped[key];
        if (!entries || entries.length === 0) return null;
        return <GroupSection key={key} levelKey={key} entries={entries} />;
      })}

      {/* High Risk */}
      <SectionCard title={`高风险条目 — 只读评估，不允许直接曝光（${highRiskEntries.length}）`} style={{ marginBottom: 20, border: '1px solid var(--danger)' }}>
        {highRiskEntries.length > 0 ? (
          <div>
            <div style={{ padding: '6px 10px', marginBottom: 8, borderRadius: 4, background: 'rgba(239,68,68,0.08)', fontSize: 10, color: 'var(--danger)' }}>
              以下高风险条目不可直接开放。需要人工审批、只读门控和 feature flag。
            </div>
            {highRiskEntries.map(e => <EntryRow key={e.id} entry={e} />)}
          </div>
        ) : (
          <div style={{ padding: 12, textAlign: 'center', color: 'var(--success)', fontSize: 12 }}>✅ 无高风险条目</div>
        )}
      </SectionCard>

      {/* AllowedNow = false */}
      <SectionCard title={`当前不可开放的条目（${disallowedEntries.length}）`} style={{ marginBottom: 20 }}>
        <div style={{ padding: '6px 10px', marginBottom: 8, borderRadius: 4, background: 'rgba(245,158,11,0.08)', fontSize: 10, color: 'var(--warning)' }}>
          以下条目当前不可公开访问或加入导航。需要满足门控条件后才能逐步开放。
        </div>
        {disallowedEntries.map(e => <EntryRow key={e.id} entry={e} />)}
      </SectionCard>

      {/* Governance Center Status */}
      <SectionCard title="治理中心（Governance Center）当前策略" style={{ marginBottom: 20, border: '1px solid var(--warning)' }}>
        <div style={{ fontSize: 11, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li><strong>左侧菜单：</strong>未加入</li>
            <li><strong>allowedNow：</strong>false</li>
            <li><strong>门控条件：</strong>readonly_only、governance_center_enabled、stage_c_disabled</li>
            <li><strong>Stage C：</strong>deferred / disabled — 本页面不启用 Stage C</li>
            <li><strong>真实执行按钮：</strong>无</li>
            <li><strong>Stage C 启用按钮：</strong>无</li>
          </ul>
        </div>
      </SectionCard>

      {/* Boundary Notice */}
      <div style={{ marginTop: 24, padding: '14px 16px', borderRadius: 6, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7 }}>
        <strong>只读边界声明：</strong><br />
        本页面是<u>导航预览只读页面</u>，基于 Navigation Exposure Registry 影子数据。
        本页面<u>不改变真实左侧菜单</u>、不启用 Advanced Mode、不启用 Stage C、不执行菜单移动、不写数据库。
        预览分组仅为推荐结构，实际导航以 Layout.tsx 为准。
      </div>
    </PageShell>
  );
}
