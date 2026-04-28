/**
 * PluginPool — Workbench Layout Edition (Phase 2B Pilot)
 * - 可编辑工作台布局
 * - 卡片拖拽/缩放
 * - 布局自动保存
 * - 恢复默认布局
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, SectionCard, EmptyState } from '../components/ui';
import WorkspaceGrid from '../layout/WorkspaceGrid';
import { clearLayout, loadLayout, saveLayout, type LayoutConfig } from '../layout/layoutStorage';
import '../components/ui/shared.css';
import '../layout/workspace-grid.css';

// Layout key for localStorage
const LAYOUT_KEY = 'plugin_pool';

// Default optimized layouts (reduce squeeze/overflow)
const DEFAULT_LAYOUTS: LayoutConfig = {
  lg: [
    // 桌面端：12 列网格
    { i: 'stats_overview', x: 0, y: 0, w: 3, h: 4, minW: 2, minH: 3 },
    { i: 'trial_warning', x: 3, y: 0, w: 6, h: 4, minW: 3, minH: 3 },
    { i: 'quick_actions', x: 9, y: 0, w: 3, h: 4, minW: 2, minH: 3 },
    { i: 'active_plugins', x: 0, y: 4, w: 6, h: 8, minW: 4, minH: 5 },
    { i: 'trial_plugins', x: 6, y: 4, w: 3, h: 8, minW: 3, minH: 5 },
    { i: 'frozen_plugins', x: 9, y: 4, w: 3, h: 8, minW: 3, minH: 5 },
    { i: 'execution_stats', x: 0, y: 12, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'capability_breakdown', x: 4, y: 12, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'risk_distribution', x: 8, y: 12, w: 4, h: 6, minW: 3, minH: 4 },
  ],
  md: [
    // 平板端：8 列网格
    { i: 'stats_overview', x: 0, y: 0, w: 2, h: 4, minW: 2, minH: 3 },
    { i: 'trial_warning', x: 2, y: 0, w: 4, h: 4, minW: 3, minH: 3 },
    { i: 'quick_actions', x: 6, y: 0, w: 2, h: 4, minW: 2, minH: 3 },
    { i: 'active_plugins', x: 0, y: 4, w: 4, h: 8, minW: 3, minH: 5 },
    { i: 'trial_plugins', x: 4, y: 4, w: 2, h: 8, minW: 2, minH: 5 },
    { i: 'frozen_plugins', x: 6, y: 4, w: 2, h: 8, minW: 2, minH: 5 },
    { i: 'execution_stats', x: 0, y: 12, w: 3, h: 6, minW: 2, minH: 4 },
    { i: 'capability_breakdown', x: 3, y: 12, w: 3, h: 6, minW: 2, minH: 4 },
    { i: 'risk_distribution', x: 6, y: 12, w: 2, h: 6, minW: 2, minH: 4 },
  ],
  sm: [
    // 移动端：单列堆叠
    { i: 'stats_overview', x: 0, y: 0, w: 1, h: 4, minW: 1, minH: 3 },
    { i: 'trial_warning', x: 0, y: 4, w: 1, h: 4, minW: 1, minH: 3 },
    { i: 'quick_actions', x: 0, y: 8, w: 1, h: 4, minW: 1, minH: 3 },
    { i: 'active_plugins', x: 0, y: 12, w: 1, h: 8, minW: 1, minH: 5 },
    { i: 'trial_plugins', x: 0, y: 20, w: 1, h: 6, minW: 1, minH: 4 },
    { i: 'frozen_plugins', x: 0, y: 26, w: 1, h: 6, minW: 1, minH: 4 },
    { i: 'execution_stats', x: 0, y: 32, w: 1, h: 5, minW: 1, minH: 4 },
    { i: 'capability_breakdown', x: 0, y: 37, w: 1, h: 5, minW: 1, minH: 4 },
    { i: 'risk_distribution', x: 0, y: 42, w: 1, h: 5, minW: 1, minH: 4 },
  ],
};

type PluginItem = {
  plugin_id: string;
  name: string;
  version: string;
  capabilities: string[];
  risk_level: string;
  enabled: boolean;
  status: string;
  execution_mode: string;
  source: string;
  success_count: number;
  failed_count: number;
  blocked_count: number;
  last_executed_at: string | null;
  last_audit_at: string | null;
  description?: string;
  tags?: string[];
  init_status?: string;
  error_reason?: string;
};

const STATUS_LABEL: Record<string, string> = {
  active: '启用', trial: '试运行', frozen: '冻结',
  planned: '规划中', residual: '残留',
};

const CAPABILITY_COLORS: Record<string, { bg: string; color: string }> = {
  report: { bg: '#eff6ff', color: '#1d4ed8' },
  read: { bg: '#f0fdf4', color: '#15803d' },
  compute: { bg: '#fdf4ff', color: '#7e22ce' },
  notify: { bg: '#fff7ed', color: '#c2410c' },
  transform: { bg: '#fefce8', color: '#a16207' },
  export: { bg: '#ecfeff', color: '#0e7490' },
  vision: { bg: '#faf5ff', color: '#6b21a8' },
  default: { bg: '#f9fafb', color: '#4b5563' },
};

const RISK_COLORS: Record<string, { bg: string; color: string }> = {
  LOW: { bg: '#f0fdf4', color: '#15803d' },
  MEDIUM: { bg: '#fffbeb', color: '#b45309' },
  HIGH: { bg: '#fef2f2', color: '#dc2626' },
  CRITICAL: { bg: '#fef2f2', color: '#991b1b' },
};

function fmtTime(v?: string | null) {
  if (!v) return '—';
  try { return new Date(v).toLocaleString('zh-CN', { month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit' }); }
  catch { return '—'; }
}

function CapTag({ cap }: { cap: string }) {
  const s = CAPABILITY_COLORS[cap] || CAPABILITY_COLORS.default;
  return (
    <span style={{ display:'inline-block', padding:'1px 7px', borderRadius:12, fontSize:11,
      background:s.bg, color:s.color, fontWeight:600 }}>
      {cap}
    </span>
  );
}

function RiskBadge({ level }: { level: string }) {
  const s = RISK_COLORS[level] || RISK_COLORS.LOW;
  return (
    <span style={{ padding:'2px 8px', borderRadius:12, fontSize:11, fontWeight:700,
      background:s.bg, color:s.color }}>
      {level}
    </span>
  );
}

function StatusTag({ status }: { status: string }) {
  const tone: Record<string, { color: string; bg: string }> = {
    active: { color: 'var(--primary)', bg: 'var(--primary-light)' },
    trial: { color: 'var(--warning)', bg: 'var(--warning-light)' },
    frozen: { color: 'var(--text-muted)', bg: 'var(--bg-elevated)' },
    planned: { color: 'var(--text-muted)', bg: 'var(--bg-elevated)' },
    residual: { color: 'var(--text-muted)', bg: 'var(--bg-elevated)' },
  };
  const t = tone[status] || tone.residual;
  return (
    <span className="ui-status-badge" style={{ color: t.color, background: t.bg, borderColor: t.bg }}>
      {STATUS_LABEL[status] || '未知'}
    </span>
  );
}

export default function PluginPool() {
  const [items, setItems] = useState<PluginItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<PluginItem | null>(null);

  // Workbench layout state
  const [layoutEdit, setLayoutEdit] = useState(false);
  const [layouts, setLayouts] = useState<LayoutConfig>(() => loadLayout(LAYOUT_KEY) || DEFAULT_LAYOUTS);

  // Persist layout changes
  useEffect(() => {
    saveLayout(LAYOUT_KEY, layouts);
  }, [layouts]);

  const fetchPool = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const r = await fetch('/api/plugins/registry', { signal: controller.signal });
      const d = await r.json().catch(() => ({}));
      if (d?._unauthorized) {
        setItems([]);
        setLoadError('API requires authentication token. Configure OPENCLAW tokens or JWT.');
        return;
      }
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      if (!d?.ok) {
        throw new Error(d?.error || 'Plugin system not enabled');
      }
      setItems(Array.isArray(d?.items) ? d.items : []);
    } catch (err: any) {
      setLoadError(err?.name === 'AbortError' ? 'Request timeout' : `Load failed: ${String(err?.message || err)}`);
      setItems([]);
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPool(); }, [fetchPool]);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return items;
    return items.filter((p) =>
      (p.name||'').toLowerCase().includes(kw) ||
      (p.plugin_id||'').toLowerCase().includes(kw) ||
      (p.capabilities||[]).join(',').toLowerCase().includes(kw) ||
      (p.status||'').toLowerCase().includes(kw)
    );
  }, [items, q]);

  const togglePlugin = useCallback(async (p: PluginItem) => {
    if (p.status === 'frozen' || p.status === 'planned' || p.status === 'residual') return;
    setBusyId(p.plugin_id);
    try {
      const r = await fetch(`/api/plugins/${p.plugin_id}/${p.enabled ? 'disable' : 'enable'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
      });
      const d = await r.json().catch(() => ({}));
      if (d?._unauthorized) {
        setLoadError('Authentication required for plugin toggle');
        return;
      }
      if (!r.ok || d?.ok === false) {
        throw new Error(String(d?.error || `HTTP ${r.status}`));
      }
      fetchPool();
    } catch (err: any) {
      setLoadError(`Plugin action failed: ${String(err?.message || err)}`);
    } finally { setBusyId(''); }
  }, [fetchPool]);

  // Categorize plugins
  const activeItems = filtered.filter(p => p.status !== 'residual');
  const trialItems = activeItems.filter(p => p.status === 'trial');
  const frozenItems = activeItems.filter(p => p.status === 'frozen');
  const plannedItems = activeItems.filter(p => p.status === 'planned');
  const enabledItems = activeItems.filter(p => p.enabled);

  // Stats
  const stats = useMemo(() => ({
    total: activeItems.length,
    enabled: enabledItems.length,
    trial: trialItems.length,
    frozen: frozenItems.length,
    planned: plannedItems.length,
    success: activeItems.reduce((sum, p) => sum + (p.success_count || 0), 0),
    failed: activeItems.reduce((sum, p) => sum + (p.failed_count || 0), 0),
    blocked: activeItems.reduce((sum, p) => sum + (p.blocked_count || 0), 0),
  }), [activeItems, enabledItems, trialItems, frozenItems, plannedItems]);

  // Capability breakdown
  const capabilityStats = useMemo(() => {
    const counts: Record<string, number> = {};
    activeItems.forEach(p => {
      (p.capabilities || []).forEach(c => {
        counts[c] = (counts[c] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [activeItems]);

  // Risk distribution
  const riskStats = useMemo(() => {
    const counts: Record<string, number> = {};
    activeItems.forEach(p => {
      counts[p.risk_level] = (counts[p.risk_level] || 0) + 1;
    });
    return Object.entries(counts);
  }, [activeItems]);

  // Cards definition
  const cards = useMemo(() => [
    {
      id: 'stats_overview',
      content: (
        <SectionCard title="📊 统计概览" description={`${stats.total} 个插件`}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, padding: 8 }}>
            <StatBox label="已启用" value={stats.enabled} color="#10b981" />
            <StatBox label="试运行" value={stats.trial} color="#f59e0b" />
            <StatBox label="已冻结" value={stats.frozen} color="#6b7280" />
            <StatBox label="规划中" value={stats.planned} color="#9ca3af" />
          </div>
        </SectionCard>
      ),
    },
    {
      id: 'trial_warning',
      content: trialItems.length > 0 ? (
        <div style={{
          padding: '12px 16px', borderRadius: 10, height: '100%',
          background: '#fffbeb', border: '1px solid #fde68a',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, color: '#92400e' }}>
                {trialItems.length} 个试运行插件 — 执行被阻断
              </div>
              <div style={{ color: '#78350f', fontSize: 12, marginTop: 2 }}>
                {trialItems.map(p => p.name).join(', ')}
              </div>
            </div>
          </div>
          <Link to="/plugin-canvas" style={{ color: '#92400e', fontWeight: 600, fontSize: 12 }}>
            在 Canvas 中查看 →
          </Link>
        </div>
      ) : (
        <SectionCard title="✅ 试运行状态" description="无试运行插件">
          <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)' }}>
            所有插件均处于正常启用或冻结状态
          </div>
        </SectionCard>
      ),
    },
    {
      id: 'quick_actions',
      content: (
        <SectionCard title="⚡ 快捷操作">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 8 }}>
            <Link to="/plugin-canvas" className="ui-btn ui-btn-outline ui-btn-sm" style={{ textAlign: 'center', textDecoration: 'none' }}>
              🔌 打开 Canvas
            </Link>
            <button className="ui-btn ui-btn-primary ui-btn-sm" onClick={fetchPool} disabled={loading}>
              ↻ 刷新数据
            </button>
            <input
              className="ui-input"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="搜索插件..."
              style={{ fontSize: 12 }}
            />
          </div>
        </SectionCard>
      ),
    },
    {
      id: 'active_plugins',
      content: (
        <SectionCard title="🟢 启用插件" description={`${enabledItems.length} 个`}>
          <PluginList
            items={enabledItems}
            busyId={busyId}
            onToggle={togglePlugin}
            onSelect={setSelected}
            selectedId={selected?.plugin_id}
          />
        </SectionCard>
      ),
    },
    {
      id: 'trial_plugins',
      content: (
        <SectionCard title="🟡 试运行" description={`${trialItems.length} 个`}>
          <PluginList
            items={trialItems}
            busyId={busyId}
            onToggle={togglePlugin}
            onSelect={setSelected}
            selectedId={selected?.plugin_id}
            compact
          />
        </SectionCard>
      ),
    },
    {
      id: 'frozen_plugins',
      content: (
        <SectionCard title="🔵 冻结/规划" description={`${frozenItems.length + plannedItems.length} 个`}>
          <PluginList
            items={[...frozenItems, ...plannedItems]}
            busyId={busyId}
            onToggle={togglePlugin}
            onSelect={setSelected}
            selectedId={selected?.plugin_id}
            compact
          />
        </SectionCard>
      ),
    },
    {
      id: 'execution_stats',
      content: (
        <SectionCard title="📈 执行统计">
          <div style={{ padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#10b981', fontWeight: 600 }}>✓ 成功</span>
              <span>{stats.success}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#ef4444', fontWeight: 600 }}>✗ 失败</span>
              <span>{stats.failed}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#f59e0b', fontWeight: 600 }}>⊘ 阻断</span>
              <span>{stats.blocked}</span>
            </div>
          </div>
        </SectionCard>
      ),
    },
    {
      id: 'capability_breakdown',
      content: (
        <SectionCard title="🧩 能力分布">
          <div style={{ padding: 8, maxHeight: 200, overflowY: 'auto' }}>
            {capabilityStats.length === 0 ? (
              <EmptyState message="暂无数据" />
            ) : (
              capabilityStats.map(([cap, count]) => (
                <div key={cap} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                  <CapTag cap={cap} />
                  <span style={{ fontWeight: 600 }}>{count}</span>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      ),
    },
    {
      id: 'risk_distribution',
      content: (
        <SectionCard title="⚠️ 风险分布">
          <div style={{ padding: 12 }}>
            {riskStats.length === 0 ? (
              <EmptyState message="暂无数据" />
            ) : (
              riskStats.map(([risk, count]) => (
                <div key={risk} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <RiskBadge level={risk} />
                  <span style={{ fontWeight: 600 }}>{count}</span>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      ),
    },
  ], [stats, trialItems, enabledItems, frozenItems, plannedItems, capabilityStats, riskStats, q, loading, busyId, selected, togglePlugin, fetchPool]);

  if (loadError && items.length === 0) {
    return (
      <div className="page-root" style={{ padding: 40 }}>
        <EmptyState icon="\u26A0\uFE0F" title="Plugin Pool" description={loadError} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button className="ui-btn ui-btn-primary" onClick={fetchPool}>Retry</button>
        </div>
        {loadError.includes('authentication') && (
          <div style={{ maxWidth: 480, margin: '16px auto 0', padding: 12, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-secondary)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>How to enable:</div>
            <div>1. Login at POST /api/auth/login</div>
            <div>2. Or configure OPENCLAW_HEARTBEAT_TOKEN in .env.local</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-root" style={{ flex: 1, overflow: 'hidden' }}>
      <PageHeader
        title="Plugin Pool"
        subtitle={`${activeItems.length} plugins · 工作台布局`}
        actions={(
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              className={`ui-btn ui-btn-sm ${layoutEdit ? 'ui-btn-warning' : 'ui-btn-outline'}`}
              onClick={() => setLayoutEdit(v => !v)}
            >
              {layoutEdit ? '✓ 完成编辑' : '✏️ 编辑布局'}
            </button>
            <button
              className="ui-btn ui-btn-outline ui-btn-sm"
              onClick={() => {
                clearLayout(LAYOUT_KEY);
                setLayouts(DEFAULT_LAYOUTS);
              }}
            >
              ↺ 重置布局
            </button>
            <Link
              to="/plugin-canvas"
              className="ui-btn ui-btn-outline ui-btn-sm"
              style={{ textDecoration: 'none' }}
            >
              🔌 Canvas
            </Link>
          </div>
        )}
      />

      {loading && items.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <EmptyState message="加载中..." />
        </div>
      )}

      {loadError && !loading && items.length > 0 && (
        <div style={{ padding: '8px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, color: '#dc2626', fontSize: 12, marginBottom: 12 }}>
          {loadError}
          {loadError.includes('auth') && (<span> — <Link to="/audit" style={{ color: '#dc2626', fontWeight: 600 }}>Check audit logs</Link></span>)}
        </div>
      )}

      {!loading && !loadError && items.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <EmptyState message="暂无插件数据" />
          <button className="ui-btn ui-btn-outline" onClick={fetchPool} style={{ marginTop: 12 }}>刷新</button>
        </div>
      )}

      <WorkspaceGrid
        editable={layoutEdit}
        layouts={layouts}
        cards={cards}
        onChange={setLayouts}
      />

      {/* Detail Panel - floating, not part of grid */}
      {selected && (
        <PluginDetailPanel
          plugin={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

// ===== Sub-components =====

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      padding: 12, borderRadius: 8, textAlign: 'center',
      background: `${color}15`, border: `1px solid ${color}30`,
    }}>
      <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function PluginList({
  items,
  busyId,
  onToggle,
  onSelect,
  selectedId,
  compact = false,
}: {
  items: PluginItem[];
  busyId: string;
  onToggle: (p: PluginItem) => void;
  onSelect: (p: PluginItem) => void;
  selectedId?: string;
  compact?: boolean;
}) {
  if (items.length === 0) {
    return <EmptyState message="无插件" />;
  }

  return (
    <div style={{ maxHeight: compact ? 200 : 300, overflowY: 'auto', padding: 4 }}>
      {items.map(p => (
        <div
          key={p.plugin_id}
          onClick={() => onSelect(p)}
          style={{
            padding: compact ? 8 : 12,
            borderRadius: 8,
            marginBottom: 8,
            cursor: 'pointer',
            background: selectedId === p.plugin_id ? 'var(--primary-light)' : 'var(--bg-secondary)',
            border: `1px solid ${selectedId === p.plugin_id ? 'var(--primary)' : 'var(--border)'}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>
              {p.name}
              <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: 11, marginLeft: 6 }}>v{p.version}</span>
            </span>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <RiskBadge level={p.risk_level} />
              <StatusTag status={p.status} />
            </div>
          </div>
          {!compact && (
            <>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                {p.plugin_id}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                {(p.capabilities || []).slice(0, 3).map(c => <CapTag key={c} cap={c} />)}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginTop: 6 }}>
                {!p.enabled && p.error_reason && (
                  <div style={{ padding: '3px 7px', borderRadius: 6, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 10, width: '100%' }}>
                    ⛔ {p.error_reason}
                  </div>
                )}
                <Link
                  to={`/audit?filter=plugin:${p.plugin_id}`}
                  className="ui-btn ui-btn-ghost ui-btn-xs"
                  style={{ textDecoration: 'none', fontSize: 11 }}
                  onClick={e => e.stopPropagation()}
                >
                  📋 审计
                </Link>
              </div>
            </>
          )}
          {compact && !p.enabled && p.error_reason && (
            <div style={{ marginTop: 6, padding: '3px 7px', borderRadius: 6, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 10 }}>
              ⛔ {p.error_reason}
            </div>
          )}
          {p.status !== 'frozen' && p.status !== 'planned' && p.status !== 'residual' && (
            <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
              <button
                className={`ui-btn ui-btn-xs ${p.enabled ? 'ui-btn-outline' : 'ui-btn-success'}`}
                disabled={busyId === p.plugin_id || p.status === 'trial'}
                onClick={(e) => { e.stopPropagation(); onToggle(p); }}
                style={{ flex: 1 }}
              >
                {busyId === p.plugin_id ? '...' : p.enabled ? '禁用' : '启用'}
              </button>
              <Link
                to={`/audit?filter=plugin:${p.plugin_id}`}
                className="ui-btn ui-btn-ghost ui-btn-xs"
                style={{ textDecoration: 'none', fontSize: 11, flexShrink: 0 }}
                onClick={e => e.stopPropagation()}
              >
                📋 审计
              </Link>
            </div>
          )}
          {p.status === 'frozen' || p.status === 'planned' || p.status === 'residual' ? (
            <Link
              to={`/audit?filter=plugin:${p.plugin_id}`}
              className="ui-btn ui-btn-ghost ui-btn-xs"
              style={{ textDecoration: 'none', fontSize: 11, marginTop: 8, display: 'inline-block' }}
              onClick={e => e.stopPropagation()}
            >
              📋 审计
            </Link>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function PluginDetailPanel({ plugin, onClose }: { plugin: PluginItem; onClose: () => void }) {
  const [tab, setTab] = useState<'info' | 'audit'>('info');

  return (
    <div style={{
      position: 'fixed',
      top: 80,
      right: 20,
      width: 340,
      maxHeight: 'calc(100vh - 100px)',
      background: 'var(--bg-surface)',
      borderRadius: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      border: '1px solid var(--border)',
      zIndex: 100,
      overflow: 'hidden',
    }}>
      <SectionCard
        title={plugin.name}
        actions={(
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>
        )}
      >
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          {(['info', 'audit'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: tab === t ? 700 : 400,
                color: tab === t ? '#3b82f6' : 'var(--text-muted)',
                borderBottom: tab === t ? '2px solid #3b82f6' : '2px solid transparent',
              }}
            >
              {t === 'info' ? '📋 信息' : '📊 审计'}
            </button>
          ))}
        </div>

        <div style={{ padding: 12, overflowY: 'auto', maxHeight: 400 }}>
          {tab === 'info' ? (
            <div style={{ display: 'grid', gap: 10, fontSize: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <StatusTag status={plugin.status} />
                <RiskBadge level={plugin.risk_level} />
              </div>

              {plugin.status === 'trial' && (
                <div style={{ padding: 8, borderRadius: 8, background: '#fffbeb', border: '1px solid #fde68a' }}>
                  <div style={{ fontWeight: 700, color: '#92400e', fontSize: 11 }}>⚠️ 试运行模式</div>
                  <div style={{ color: '#78350f', fontSize: 11 }}>执行被阻断 · 仅支持 dry-run</div>
                </div>
              )}

              <InfoRow label="插件 ID" value={plugin.plugin_id} />
              <InfoRow label="版本" value={plugin.version} />
              <InfoRow label="来源" value={plugin.source} />
              <InfoRow label="执行模式" value={plugin.execution_mode || 'readonly'} />
              <InfoRow label="已启用" value={plugin.enabled ? '✅ 是' : '❌ 否'} />

              {plugin.description && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>描述</div>
                  <div>{plugin.description}</div>
                </div>
              )}

              {plugin.capabilities && plugin.capabilities.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>能力</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {plugin.capabilities.map(c => <CapTag key={c} cap={c} />)}
                  </div>
                </div>
              )}

              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>执行历史</div>
                <div style={{ display: 'grid', gap: 4 }}>
                  <InfoRow label="成功" value={String(plugin.success_count || 0)} valueColor="#10b981" />
                  <InfoRow label="失败" value={String(plugin.failed_count || 0)} valueColor="#ef4444" />
                  <InfoRow label="阻断" value={String(plugin.blocked_count || 0)} valueColor="#f59e0b" />
                </div>
              </div>

              {plugin.error_reason && (
                <div style={{ padding: '8px 10px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#dc2626', marginBottom: 2 }}>错误信息</div>
                  <div style={{ fontSize: 12, color: '#991b1b' }}>{plugin.error_reason}</div>
                </div>
              )}
              <Link to="/plugin-canvas" className="ui-btn ui-btn-outline ui-btn-sm" style={{ textAlign: 'center', textDecoration: 'none' }}>
                🔌 在 Canvas 中查看
              </Link>
              <Link to={`/audit?filter=plugin:${plugin.plugin_id}`} className="ui-btn ui-btn-outline ui-btn-sm" style={{ textAlign: 'center', textDecoration: 'none' }}>
                📋 审计条目
              </Link>
            </div>
          ) : (
            <AuditPanel pluginId={plugin.plugin_id} />
          )}
        </div>
      </SectionCard>
    </div>
  );
}

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 600, color: valueColor }}>{value}</span>
    </div>
  );
}

function AuditPanel({ pluginId }: { pluginId: string }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const r = await fetch(`/api/plugins/${pluginId}/audit-events?limit=50`);
        const d = await r.json().catch(() => ({}));
        if (r.ok && Array.isArray(d?.events)) {
          setLogs(d.events.slice(0, 50));
          return;
        }
      } catch {}
      try {
        const r2 = await fetch(`/api/plugins/${pluginId}/audit`);
        const d2 = await r2.json().catch(() => ({}));
        setLogs(Array.isArray(d2?.events) ? d2.events.slice(0, 50) : []);
      } catch {
        setLogs([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [pluginId]);

  if (loading) return <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>加载中...</div>;
  if (logs.length === 0) return <EmptyState message="暂无审计记录" />;

  const ACTION_COLORS: Record<string, string> = {
    discover: '#6b7280', register: '#3b82f6', execute_success: '#10b981',
    execute_failed: '#ef4444', execute_blocked: '#f59e0b', enable: '#10b981', disable: '#ef4444',
  };

  return (
    <div style={{ display: 'grid', gap: 4 }}>
      {logs.map((log: any, i: number) => (
        <div key={i} style={{
          padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)',
          background: 'var(--bg-secondary)', fontSize: 11,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              padding: '1px 6px', borderRadius: 10, fontWeight: 700, fontSize: 10,
              background: `${ACTION_COLORS[log.action] || '#6b7280'}20`,
              color: ACTION_COLORS[log.action] || '#6b7280',
            }}>
              {log.action}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>
              {fmtTime(log.created_at)}
            </span>
          </div>
          {(log.result || log.result_code || log.error_message) && (
            <div style={{ marginTop: 4, color: 'var(--text-muted)', fontSize: 10, fontFamily: 'monospace' }}>
              {String(log.result || log.result_code || log.error_message).substring(0, 80)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
