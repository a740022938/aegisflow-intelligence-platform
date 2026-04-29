import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, PageHeader, SectionCard, StatusBadge } from '../components/ui';
import WorkspaceGrid from '../layout/WorkspaceGrid';
import { clearLayout, loadLayout, saveLayout, type LayoutConfig } from '../layout/layoutStorage';
import { useResponsiveLayoutMode } from '../hooks/useResponsiveLayoutMode';
import '../components/ui/shared.css';
import './ModuleCenter.css';

type ModuleItem = {
  key: string;
  name: string;
  status: 'healthy' | 'degraded' | 'offline';
  score: number;
  summary: string;
  detail: string;
  to?: string;
};

type PluginLite = {
  plugin_id: string;
  name: string;
  version: string;
  status: string;
  enabled: boolean;
  capabilities: string[];
};

type AuditLite = {
  id: string;
  category: string;
  action: string;
  target: string;
  result: string;
  created_at: string;
};

type Snapshot = {
  healthOk: boolean;
  apiVersion: string;
  db: string;
  openclawEnabled: boolean;
  openclawOnline: string;
  openclawCircuit: string;
  pluginsTotal: number;
  pluginsActive: number;
  pluginsTrial: number;
  plugins: PluginLite[];
  workflowsRunning: number;
  workflowsTotal: number;
  routePolicies: number;
  runningTasks: number;
  pendingApprovals: number;
  healthyDeployments: number;
  auditRecent: AuditLite[];
};

const API_TIMEOUT_MS = 10000;
const LAYOUT_KEY = 'module-center';
const DEFAULT_LAYOUTS: LayoutConfig = {
  lg: [
    // 第一行：健康分 + 异常模块并排
    { i: 'health_score', x: 0, y: 0, w: 3, h: 4, minW: 2, minH: 3 },
    { i: 'issues', x: 3, y: 0, w: 9, h: 4, minW: 4, minH: 3 },
    // 第二行：模块清单（全宽，足够高度）
    { i: 'module_list', x: 0, y: 4, w: 12, h: 8, minW: 6, minH: 5 },
    // 第三行：工厂指标（紧凑）
    { i: 'factory_metrics', x: 0, y: 12, w: 12, h: 2, minW: 6, minH: 2 },
    // 第四行：操作 + 试运行插件并排
    { i: 'module_actions', x: 0, y: 14, w: 6, h: 5, minW: 4, minH: 4 },
    { i: 'trial_plugins', x: 6, y: 14, w: 6, h: 5, minW: 4, minH: 4 },
    // 第五行：审计流（全宽）
    { i: 'audit_feed', x: 0, y: 19, w: 12, h: 7, minW: 6, minH: 5 },
  ],
  md: [
    { i: 'health_score', x: 0, y: 0, w: 3, h: 4, minW: 2, minH: 3 },
    { i: 'issues', x: 3, y: 0, w: 5, h: 4, minW: 3, minH: 3 },
    { i: 'module_list', x: 0, y: 4, w: 8, h: 9, minW: 4, minH: 5 },
    { i: 'factory_metrics', x: 0, y: 13, w: 8, h: 2, minW: 4, minH: 2 },
    { i: 'module_actions', x: 0, y: 15, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'trial_plugins', x: 4, y: 15, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'audit_feed', x: 0, y: 21, w: 8, h: 7, minW: 4, minH: 5 },
  ],
  sm: [
    // 移动端：单列堆叠，适当增加高度避免挤压
    { i: 'health_score', x: 0, y: 0, w: 1, h: 4, minW: 1, minH: 3 },
    { i: 'issues', x: 0, y: 4, w: 1, h: 4, minW: 1, minH: 3 },
    { i: 'module_list', x: 0, y: 8, w: 1, h: 10, minW: 1, minH: 6 },
    { i: 'factory_metrics', x: 0, y: 18, w: 1, h: 3, minW: 1, minH: 2 },
    { i: 'module_actions', x: 0, y: 21, w: 1, h: 6, minW: 1, minH: 4 },
    { i: 'trial_plugins', x: 0, y: 27, w: 1, h: 6, minW: 1, minH: 4 },
    { i: 'audit_feed', x: 0, y: 33, w: 1, h: 8, minW: 1, minH: 5 },
  ],
};

async function fetchJsonWithTimeout(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function statusScore(status: ModuleItem['status']) {
  if (status === 'healthy') return 100;
  if (status === 'degraded') return 60;
  return 20;
}

function fmtTime(v: string) {
  if (!v) return '—';
  try {
    return new Date(v).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

export default function ModuleCenter() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [busyKey, setBusyKey] = useState('');
  const [sectionLoading, setSectionLoading] = useState<Record<string, boolean>>({ health: true, openclaw: true, pool: true, jobs: true, routes: true, audit: true, summary: true });
  const [unauthorized, setUnauthorized] = useState(false);
  const { contentRef, contentWidth, canUseLayoutEditor, shouldUseLayoutEditor, layoutEdit, setLayoutEdit, toggleEdit, layoutMode } = useResponsiveLayoutMode();
  const [layouts, setLayouts] = useState<LayoutConfig>(() => loadLayout(LAYOUT_KEY) || DEFAULT_LAYOUTS);

  const refresh = useCallback(async () => {
    setLoading(true);
    setErr('');
    setUnauthorized(false);
    setSectionLoading({ health: true, openclaw: true, pool: true, jobs: true, routes: true, audit: true, summary: true });
    try {
      const results = await Promise.allSettled([
        fetchJsonWithTimeout('/api/health').catch(() => null),
        fetchJsonWithTimeout('/api/openclaw/master-switch').catch(() => null),
        fetchJsonWithTimeout('/api/plugins/pool').catch(() => null),
        fetchJsonWithTimeout('/api/workflow-jobs?limit=100&offset=0').catch(() => null),
        fetchJsonWithTimeout('/api/route-policies?limit=200').catch(() => null),
        fetchJsonWithTimeout('/api/audit/recent?limit=20&hours=24').catch(() => null),
        fetchJsonWithTimeout('/api/dashboard/summary').catch(() => null),
      ]);

      const safe = (r: PromiseSettledResult<any>) => r.status === 'fulfilled' ? r.value : null;
      const checkAuth = (v: any) => { if (v?._unauthorized) setUnauthorized(true); };

      const health: any = safe(results[0]); checkAuth(health);
      setSectionLoading(prev => ({ ...prev, health: false }));
      const oc: any = safe(results[1]); checkAuth(oc);
      setSectionLoading(prev => ({ ...prev, openclaw: false }));
      const pool: any = safe(results[2]); checkAuth(pool);
      setSectionLoading(prev => ({ ...prev, pool: false }));
      const jobs: any = safe(results[3]); checkAuth(jobs);
      setSectionLoading(prev => ({ ...prev, jobs: false }));
      const routes: any = safe(results[4]); checkAuth(routes);
      setSectionLoading(prev => ({ ...prev, routes: false }));
      const audits: any = safe(results[5]); checkAuth(audits);
      setSectionLoading(prev => ({ ...prev, audit: false }));
      const summary: any = safe(results[6]); checkAuth(summary);
      setSectionLoading(prev => ({ ...prev, summary: false }));

      const plugins = Array.isArray(pool?.plugins) ? pool.plugins : [];
      const jobsList = Array.isArray(jobs?.jobs) ? jobs.jobs : [];
      const policies = Array.isArray(routes?.items) ? routes.items : Array.isArray(routes?.policies) ? routes.policies : [];
      const auditRecent = Array.isArray(audits?.data) ? audits.data : [];

      setSnapshot({
        healthOk: !!health?.ok,
        apiVersion: String(health?.version || '—'),
        db: String(health?.database || 'unknown'),
        openclawEnabled: !!oc?.switch?.enabled || !!oc?.enabled,
        openclawOnline: String(oc?.status?.online_status || oc?.online_status || 'offline'),
        openclawCircuit: String(oc?.status?.circuit_status || oc?.circuit_state || 'unknown'),
        pluginsTotal: plugins.length,
        pluginsActive: plugins.filter((p: any) => p.status === 'active').length,
        pluginsTrial: plugins.filter((p: any) => p.status === 'trial').length,
        plugins: plugins.map((p: any) => ({ plugin_id: p.plugin_id, name: p.name, version: p.version || '0.0.0', status: p.status, enabled: !!p.enabled, capabilities: Array.isArray(p.capabilities) ? p.capabilities : [] })),
        workflowsRunning: jobsList.filter((j: any) => j.status === 'running').length,
        workflowsTotal: jobsList.length,
        routePolicies: policies.length,
        runningTasks: Number(summary?.running_tasks || 0),
        pendingApprovals: Number(summary?.pending_approvals || 0),
        healthyDeployments: Number(summary?.healthy_deployments || 0),
        auditRecent: auditRecent.map((a: any) => ({
          id: String(a.id || ''),
          category: String(a.category || 'system'),
          action: String(a.action || 'unknown'),
          target: String(a.target || ''),
          result: String(a.result || ''),
          created_at: String(a.created_at || ''),
        })),
      });
    } catch (e: any) {
      setErr(String(e?.message || e));
      if (!snapshot) setSnapshot(null);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 30000);
    return () => clearInterval(t);
  }, [refresh]);

  useEffect(() => {
    if (layoutEdit && canUseLayoutEditor) saveLayout(LAYOUT_KEY, layouts);
  }, [layouts, layoutEdit, canUseLayoutEditor]);

  const toggleOpenClaw = useCallback(async () => {
    if (!snapshot) return;
    const next = !snapshot.openclawEnabled;
    setBusyKey('openclaw');
    try {
      await fetch('/api/openclaw/master-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: next, reason: `模块中心手动${next ? '开启' : '关闭'}`, actor: 'module_center' }),
      });
      await refresh();
    } finally {
      setBusyKey('');
    }
  }, [snapshot, refresh]);

  const reconcileWorkflow = useCallback(async () => {
    setBusyKey('workflow-reconcile');
    try {
      await fetch('/api/workflow-jobs/reconcile-stale', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      await refresh();
    } finally {
      setBusyKey('');
    }
  }, [refresh]);

  const enablePlugin = useCallback(async (pluginId: string) => {
    setBusyKey(`plugin-${pluginId}`);
    try {
      await fetch(`/api/plugins/${pluginId}/enable`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      await refresh();
    } finally {
      setBusyKey('');
    }
  }, [refresh]);

  const enablePluginsBatch = useCallback(async () => {
    if (!snapshot) return;
    const target = snapshot.plugins.filter((p) => p.status === 'active' && !p.enabled).map((p) => p.plugin_id);
    if (target.length === 0) return;
    setBusyKey('plugin-batch');
    try {
      for (const pluginId of target) {
        await fetch(`/api/plugins/${pluginId}/enable`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      }
      await refresh();
    } finally {
      setBusyKey('');
    }
  }, [snapshot, refresh]);

  const exportSnapshot = useCallback(() => {
    if (!snapshot) return;
    const payload = {
      exported_at: new Date().toISOString(),
      source: 'module_center',
      snapshot,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `module_center_snapshot_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [snapshot]);

  const modules = useMemo<ModuleItem[]>(() => {
    if (!snapshot) return [];

    const apiStatus: ModuleItem['status'] = snapshot.healthOk ? 'healthy' : 'offline';
    const openclawStatus: ModuleItem['status'] = !snapshot.openclawEnabled
      ? 'degraded'
      : snapshot.openclawOnline === 'online'
        ? 'healthy'
        : 'offline';
    const pluginStatus: ModuleItem['status'] = snapshot.pluginsTotal === 0
      ? 'degraded'
      : snapshot.pluginsTrial > 0
        ? 'degraded'
        : 'healthy';
    const workflowStatus: ModuleItem['status'] = snapshot.workflowsTotal === 0
      ? 'degraded'
      : 'healthy';
    const routeStatus: ModuleItem['status'] = snapshot.routePolicies > 0 ? 'healthy' : 'degraded';

    return [
      {
        key: 'api',
        name: 'API与数据库',
        status: apiStatus,
        score: statusScore(apiStatus),
        summary: `v${snapshot.apiVersion} · DB ${snapshot.db}`,
        detail: snapshot.healthOk ? '基础服务可用' : '健康检查失败或不可达',
      },
      {
        key: 'openclaw',
        name: 'OpenClaw执行层',
        status: openclawStatus,
        score: statusScore(openclawStatus),
        summary: `${snapshot.openclawEnabled ? '总闸开启' : '总闸关闭'} · ${snapshot.openclawOnline}`,
        detail: `熔断状态: ${snapshot.openclawCircuit}`,
      },
      {
        key: 'plugins',
        name: '插件系统',
        status: pluginStatus,
        score: statusScore(pluginStatus),
        summary: `${snapshot.pluginsActive}/${snapshot.pluginsTotal} active · trial ${snapshot.pluginsTrial}`,
        detail: snapshot.pluginsTrial > 0 ? '存在试运行插件，执行受限' : '插件状态正常',
        to: '/plugin-pool',
      },
      {
        key: 'workflow',
        name: '工作流系统',
        status: workflowStatus,
        score: statusScore(workflowStatus),
        summary: `running ${snapshot.workflowsRunning} · total ${snapshot.workflowsTotal}`,
        detail: snapshot.workflowsTotal === 0 ? '尚无任务数据' : '工作流队列可用',
        to: '/workflow-jobs',
      },
      {
        key: 'route',
        name: '路由策略',
        status: routeStatus,
        score: statusScore(routeStatus),
        summary: `${snapshot.routePolicies} policies`,
        detail: snapshot.routePolicies > 0 ? '策略已配置' : '建议至少配置一条路由策略',
        to: '/cost-routing',
      },
    ];
  }, [snapshot]);

  const overallScore = useMemo(() => {
    if (modules.length === 0) return 0;
    return Math.round(modules.reduce((sum, m) => sum + m.score, 0) / modules.length);
  }, [modules]);

  const issues = useMemo(() => modules.filter((m) => m.status !== 'healthy'), [modules]);

  const trialPlugins = useMemo(() => {
    if (!snapshot) return [];
    return snapshot.plugins.filter((p) => p.status === 'trial').slice(0, 5);
  }, [snapshot]);

  const cards = useMemo(() => ([
    {
      id: 'health_score',
      content: (
        <SectionCard title="总健康分" description="按模块状态加权">
          {sectionLoading.health && !snapshot ? (
            <div className="module-score-wrap"><div className="module-score-sub" style={{ color: 'var(--text-muted)' }}>Loading...</div></div>
          ) : (
          <div className="module-score-wrap">
            <div className="module-score-value">{overallScore}</div>
            <div className="module-score-sub">{'\u002F'} 100</div>
          </div>
          )}
        </SectionCard>
      ),
    },
    {
      id: 'issues',
      content: (
        <SectionCard title="异常模块" description="需要优先处理">
          {issues.length === 0 ? (
            <div className="module-ok">全部健康</div>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {issues.map((m) => (
                <div key={m.key} className="module-issue-item">
                  <StatusBadge s={m.status === 'offline' ? 'failed' : 'pending'} />
                  <span style={{ fontWeight: 600 }}>{m.name}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>{m.detail}</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      ),
    },
    {
      id: 'module_list',
      content: (
        <SectionCard title={`模块清单 (${modules.length})`}>
          <div className="module-grid">
            {modules.map((m) => (
              <div key={m.key} className="module-card">
                <div className="module-card-head">
                  <div style={{ fontWeight: 700 }}>{m.name}</div>
                  <StatusBadge s={m.status === 'healthy' ? 'completed' : m.status === 'degraded' ? 'pending' : 'failed'} />
                </div>
                <div className="module-card-summary">{m.summary}</div>
                <div className="module-card-detail">{m.detail}</div>
                <div className="module-card-foot">
                  <span className="module-card-score">健康分 {m.score}</span>
                  {m.to ? (
                    <Link to={m.to} className="ui-btn ui-btn-outline ui-btn-xs" style={{ textDecoration: 'none' }}>
                      进入
                    </Link>
                  ) : (
                    <span className="module-card-static">核心内核</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      ),
    },
    {
      id: 'factory_metrics',
      content: (
        <SectionCard
          title="对齐指标（工厂口径）"
          description={sectionLoading.summary && snapshot?.runningTasks == null ? (
            <span style={{ color: 'var(--text-muted)' }}>加载工厂指标中...</span>
          ) : (
            <span style={{ color: 'var(--text-secondary)' }}>
              与 Dashboard / Factory Status 一致 · 运行任务
              <strong style={{ color: 'var(--text-primary)', margin: '0 8px 0 4px' }}>{snapshot?.runningTasks ?? 0}</strong>
              待审批
              <strong style={{ color: 'var(--text-primary)', margin: '0 8px 0 4px' }}>{snapshot?.pendingApprovals ?? 0}</strong>
              健康部署
              <strong style={{ color: 'var(--text-primary)', margin: '0 0 0 4px' }}>{snapshot?.healthyDeployments ?? 0}</strong>
            </span>
          )}
          bodyClassName="module-section-body module-section-body-metrics"
        />
      ),
    },
    {
      id: 'module_actions',
      content: (
        <SectionCard title="模块操作" description="常用维护动作" bodyClassName="module-section-body module-section-body-actions">
          <div className="module-actions">
            <button className={`ui-btn ui-btn-sm ${snapshot?.openclawEnabled ? 'ui-btn-outline' : 'ui-btn-success'}`} onClick={toggleOpenClaw} disabled={busyKey === 'openclaw'}>
              {busyKey === 'openclaw' ? '处理中...' : snapshot?.openclawEnabled ? '关闭 OpenClaw 总闸' : '开启 OpenClaw 总闸'}
            </button>
            <button className="ui-btn ui-btn-outline ui-btn-sm" onClick={reconcileWorkflow} disabled={busyKey === 'workflow-reconcile'}>
              {busyKey === 'workflow-reconcile' ? '处理中...' : '修复僵尸工作流'}
            </button>
            <button className="ui-btn ui-btn-outline ui-btn-sm" onClick={enablePluginsBatch} disabled={busyKey === 'plugin-batch'}>
              {busyKey === 'plugin-batch' ? '处理中...' : '批量启用可启用插件'}
            </button>
            <button className="ui-btn ui-btn-outline ui-btn-sm" onClick={exportSnapshot}>
              导出模块快照(JSON)
            </button>
            <Link to="/plugin-canvas" className="ui-btn ui-btn-outline ui-btn-sm" style={{ textDecoration: 'none' }}>打开插件画布</Link>
          </div>
        </SectionCard>
      ),
    },
    {
      id: 'trial_plugins',
      content: (
        <SectionCard title="试运行插件快速处理" description="优先处理阻塞插件" bodyClassName="module-section-body module-section-body-trial">
          {trialPlugins.length === 0 ? (
            <div className="module-ok">无试运行插件</div>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {trialPlugins.map((p) => (
                <div key={p.plugin_id} className="module-issue-item" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <StatusBadge s="pending" />
                  <span style={{ fontWeight: 600, fontSize: 12 }}>{p.name}</span>
                  <code style={{ fontSize: 10, color: 'var(--text-muted)' }}>v{p.version}</code>
                  {p.capabilities?.slice(0, 2).map(c => (
                    <span key={c} style={{ padding: '0 5px', borderRadius: 8, fontSize: 9, fontWeight: 600, background: '#eff6ff', color: '#1d4ed8' }}>{c}</span>
                  ))}
                  <button className="ui-btn ui-btn-outline ui-btn-xs" style={{ marginLeft: 'auto' }} onClick={() => enablePlugin(p.plugin_id)} disabled={busyKey === `plugin-${p.plugin_id}`}>
                    {busyKey === `plugin-${p.plugin_id}` ? '处理中...' : '尝试启用'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      ),
    },
    {
      id: 'audit_feed',
      content: (
        <SectionCard title="最近审计流（24h）" description="统一观察关键变更">
          {sectionLoading.audit && !snapshot?.auditRecent?.length ? (
            <EmptyState icon="⏳" message="加载审计记录中..." />
          ) : !snapshot?.auditRecent?.length ? (
            <EmptyState icon="📭" message="暂无审计记录" />
          ) : (
            <div className="module-audit-list">
              {snapshot.auditRecent.slice(0, 20).map((a) => (
                <div key={a.id || `${a.created_at}-${a.action}`} className="module-audit-item">
                  <div className="module-audit-meta">
                    <span className="module-audit-cat">{a.category || 'system'}</span>
                    <span className="module-audit-action">{a.action}</span>
                    <span className="module-audit-time">{fmtTime(a.created_at)}</span>
                  </div>
                  <div className="module-audit-target">{a.target || '—'}</div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      ),
    },
  ]), [
    overallScore, issues, modules, snapshot, toggleOpenClaw, busyKey, reconcileWorkflow, enablePluginsBatch, exportSnapshot, trialPlugins, enablePlugin, sectionLoading,
  ]);

  return (
    <div className="page-root module-center-page" ref={contentRef}>
      <PageHeader
        title="模块中心"
        subtitle="统一模块状态、健康评分、控制与审计"
        actions={(
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className={`ui-btn ui-btn-sm ${layoutEdit ? 'ui-btn-warning' : 'ui-btn-outline'}`}
              onClick={toggleEdit}
              disabled={!canUseLayoutEditor}
              title={!canUseLayoutEditor ? '请在大屏宽度下编辑布局' : ''}
            >
              {layoutEdit ? '退出布局编辑' : '布局编辑'}
            </button>
            <button
              className="ui-btn ui-btn-outline ui-btn-sm"
              onClick={() => {
                clearLayout(LAYOUT_KEY);
                setLayouts(DEFAULT_LAYOUTS);
              }}
            >
              重置布局
            </button>
            <Link to="/factory-status" className="ui-btn ui-btn-ghost ui-btn-sm" style={{ textDecoration: 'none' }}>工厂状态</Link>
            <button className="ui-btn ui-btn-primary ui-btn-sm" onClick={refresh} disabled={loading}>刷新</button>
          </div>
        )}
      />

      {unauthorized && (
        <SectionCard title="身份认证" style={{ marginBottom: 16 }}>
          <div className="module-issue-item" style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#991b1b', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>当前身份信息已过期或不可用</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>部分数据未返回，请刷新页面或重新认证。以下显示缓存/默认值。</div>
            </div>
          </div>
        </SectionCard>
      )}
      {loading && !snapshot ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
      ) : err ? (
        <SectionCard title="模块中心加载失败">
          <EmptyState icon="⚠️" title="请求失败" description={err} />
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
            <button className="ui-btn ui-btn-primary ui-btn-sm" onClick={refresh}>重试</button>
          </div>
        </SectionCard>
      ) : shouldUseLayoutEditor ? (
        <div>
          <div style={{ padding: '4px 8px', fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: 4, marginBottom: 8, display: 'inline-block' }}>
            layoutMode: {layoutMode} · contentWidth: {Math.round(contentWidth)}px
          </div>
          <WorkspaceGrid editable={layoutEdit} layouts={layouts} cards={cards} onChange={setLayouts} />
        </div>
      ) : (
        <div>
          <div style={{ padding: '4px 8px', fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: 4, marginBottom: 8, display: 'inline-block' }}>
            layoutMode: {layoutMode} · contentWidth: {Math.round(contentWidth)}px
          </div>
          <div className="responsive-card-grid">
            {cards.map((c: any) => (
              <div key={c.id} style={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
                {c.content}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
