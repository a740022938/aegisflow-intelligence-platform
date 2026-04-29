import React, { useEffect, useMemo, useState } from 'react';
import { useResponsiveLayoutMode } from '../hooks/useResponsiveLayoutMode';
import { useNavigate } from 'react-router-dom';
import '../components/ui/shared.css';
import './Dashboard.css';
import { type Lang, translations, getStoredLang } from '../i18n';
import { APP_VERSION } from '../constants/appVersion';
import { APP_META } from '../constants/appMeta';
import { roleClass } from '../theme/colorRoles';
import WorkspaceGrid from '../layout/WorkspaceGrid';
import { clearLayout, saveLayout, type LayoutConfig } from '../layout/layoutStorage';
import { PageHeader } from '../components/ui';

// Plugin Status 类型定义
interface Plugin {
  plugin_name: string;
  plugin_type: string;
  enabled: boolean;
  status: 'online' | 'offline' | 'error' | 'unknown';
  health?: 'healthy' | 'degraded' | 'unhealthy';
  last_active_at?: string;
  last_error?: string;
}

type OpenClawSwitchResponse = {
  ok: boolean;
  token_configured?: boolean;
  message?: string;
  switch?: {
    enabled: boolean;
    status_text: string;
    updated_at: string;
    updated_by: string;
  };
  status?: {
    online_status: 'online' | 'offline';
    execution_status: 'idle' | 'executing';
    running_count: number;
    queued_count: number;
    last_action: null | {
      run_id: string;
      run_code: string;
      run_name: string;
      status: string;
      at: string;
    };
    last_error: null | {
      run_id: string;
      run_code: string;
      run_name: string;
      message: string;
      at: string;
    };
    circuit_status: string;
  };
};

const LAYOUT_KEY = 'dashboard';

// 优化后的默认布局 - 解决挤压/出界问题
const DEFAULT_LAYOUTS: LayoutConfig = {
  lg: [
    // 第一行：OpenClaw 总览（全宽）
    { i: 'openclaw', x: 0, y: 0, w: 12, h: 5, minW: 6, minH: 4 },
    // 第二行：工厂状态 + 运行任务 + 活跃工作流 + 等待审批（4列等分）
    { i: 'factory_status', x: 0, y: 5, w: 3, h: 4, minW: 2, minH: 3 },
    { i: 'running_tasks', x: 3, y: 5, w: 3, h: 4, minW: 2, minH: 3 },
    { i: 'active_workflow', x: 6, y: 5, w: 3, h: 4, minW: 2, minH: 3 },
    { i: 'pending', x: 9, y: 5, w: 3, h: 4, minW: 2, minH: 3 },
    // 第三行：插件状态（宽卡片）+ 路由健康
    { i: 'plugin_status', x: 0, y: 9, w: 9, h: 5, minW: 6, minH: 4 },
    { i: 'route_health', x: 9, y: 9, w: 3, h: 5, minW: 2, minH: 3 },
    // 第四行：最近活动（宽）+ 系统统计
    { i: 'recent_activity', x: 0, y: 14, w: 8, h: 8, minW: 4, minH: 5 },
    { i: 'system_stats', x: 8, y: 14, w: 4, h: 8, minW: 3, minH: 5 },
    // 第五行：快捷入口（全宽）
    { i: 'quick_access', x: 0, y: 22, w: 12, h: 10, minW: 6, minH: 6 },
  ],
  md: [
    { i: 'openclaw', x: 0, y: 0, w: 8, h: 5, minW: 6, minH: 4 },
    { i: 'factory_status', x: 0, y: 5, w: 2, h: 4, minW: 2, minH: 3 },
    { i: 'running_tasks', x: 2, y: 5, w: 2, h: 4, minW: 2, minH: 3 },
    { i: 'active_workflow', x: 4, y: 5, w: 2, h: 4, minW: 2, minH: 3 },
    { i: 'pending', x: 6, y: 5, w: 2, h: 4, minW: 2, minH: 3 },
    { i: 'plugin_status', x: 0, y: 9, w: 6, h: 5, minW: 4, minH: 4 },
    { i: 'route_health', x: 6, y: 9, w: 2, h: 5, minW: 2, minH: 3 },
    { i: 'recent_activity', x: 0, y: 14, w: 5, h: 8, minW: 4, minH: 5 },
    { i: 'system_stats', x: 5, y: 14, w: 3, h: 8, minW: 3, minH: 5 },
    { i: 'quick_access', x: 0, y: 22, w: 8, h: 12, minW: 6, minH: 6 },
  ],
  sm: [
    // 移动端：单列堆叠
    { i: 'openclaw', x: 0, y: 0, w: 1, h: 6, minW: 1, minH: 5 },
    { i: 'factory_status', x: 0, y: 6, w: 1, h: 4, minW: 1, minH: 3 },
    { i: 'running_tasks', x: 0, y: 10, w: 1, h: 4, minW: 1, minH: 3 },
    { i: 'active_workflow', x: 0, y: 14, w: 1, h: 4, minW: 1, minH: 3 },
    { i: 'pending', x: 0, y: 18, w: 1, h: 4, minW: 1, minH: 3 },
    { i: 'plugin_status', x: 0, y: 22, w: 1, h: 6, minW: 1, minH: 5 },
    { i: 'route_health', x: 0, y: 28, w: 1, h: 4, minW: 1, minH: 3 },
    { i: 'recent_activity', x: 0, y: 32, w: 1, h: 8, minW: 1, minH: 6 },
    { i: 'system_stats', x: 0, y: 40, w: 1, h: 8, minW: 1, minH: 6 },
    { i: 'quick_access', x: 0, y: 48, w: 1, h: 14, minW: 1, minH: 8 },
  ],
};

const ago = (s?: string | null, lang: Lang = 'zh') => {
  if (!s) return translations[lang].time.justNow;
  const d = Date.now() - new Date(s).getTime();
  if (d < 60000) return translations[lang].time.justNow;
  if (d < 3600000) return Math.floor(d / 60000) + translations[lang].time.minutesAgo;
  if (d < 86400000) return Math.floor(d / 3600000) + translations[lang].time.hoursAgo;
  return Math.floor(d / 86400000) + translations[lang].time.daysAgo;
};

// Dashboard 组件 - 工厂驾驶舱（Workbench Layout 版）

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiVersion, setApiVersion] = useState<string>('');
  const [lang, setLang] = useState<Lang>(() => getStoredLang());
  const [openclaw, setOpenclaw] = useState<OpenClawSwitchResponse | null>(null);
  const [switchBusy, setSwitchBusy] = useState(false);
  
  // 布局状态
  const { contentRef, contentWidth, canUseLayoutEditor, shouldUseLayoutEditor, layoutEdit, setLayoutEdit, toggleEdit, layoutMode } = useResponsiveLayoutMode();
  const [layouts, setLayouts] = useState<LayoutConfig>(DEFAULT_LAYOUTS);

  // 监听语言变化
  useEffect(() => {
    const handleStorage = () => {
      const newLang = getStoredLang();
      if (newLang !== lang) setLang(newLang);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [lang]);

  // 布局持久化 (only persist when in edit mode with sufficient width)
  useEffect(() => {
    if (layoutEdit && canUseLayoutEditor) saveLayout(LAYOUT_KEY, layouts);
  }, [layouts, layoutEdit, canUseLayoutEditor]);

  const t = translations[lang];
  const td = t.dashboard;
  const openExternal = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sum, act, plug] = await Promise.all([
        fetch('/api/dashboard/summary').then((r) => r.json()),
        fetch('/api/dashboard/recent-activity?limit=10').then((r) => r.json()),
        fetch('/api/plugins/status').then((r) => r.json()).catch(() => ({ ok: false })),
      ]);
      const health = await fetch('/api/health').then((r) => r.json()).catch(() => null);
      if (sum?.ok) setSummary(sum);
      if (act?.ok) setActivities(act.activities || []);
      if (plug?.ok) setPlugins(plug.plugins || []);
      if (health?.version) setApiVersion(String(health.version));
      const oc = await fetch('/api/openclaw/master-switch').then((r) => r.json()).catch(() => null);
      if (oc?.ok) setOpenclaw(oc);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const timer = setInterval(fetchAll, 30000);
    return () => clearInterval(timer);
  }, []);

  const s = summary || {};
  const ocSwitch = openclaw?.switch;
  const ocStatus = openclaw?.status;
  const openclawEnabled = !!(openclaw as any)?.enabled || !!ocSwitch?.enabled;
  const displayVersion = apiVersion || APP_VERSION;

  const toggleOpenClawSwitch = async () => {
    if (!ocSwitch || switchBusy) return;
    const nextEnabled = !ocSwitch.enabled;
    setSwitchBusy(true);
    try {
      const reason = nextEnabled ? '首页总闸手动开启' : '首页总闸手动关闭';
      const res = await fetch('/api/openclaw/master-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextEnabled, reason, actor: 'dashboard_user' }),
      }).then((r) => r.json());
      if (res?.ok) {
        const refresh = await fetch('/api/openclaw/master-switch').then((r) => r.json()).catch(() => null);
        if (refresh?.ok) setOpenclaw(refresh);
      } else {
        window.alert(res?.error || 'OpenClaw 总闸更新失败');
      }
    } catch (e: any) {
      window.alert(e?.message || 'OpenClaw 总闸更新失败');
    } finally {
      setSwitchBusy(false);
    }
  };

  // Plugin 统计
  const pluginStats = {
    total: plugins.length,
    enabled: plugins.filter(p => p.enabled).length,
    online: plugins.filter(p => p.status === 'online').length,
    error: plugins.filter(p => p.status === 'error').length,
    offline: plugins.filter(p => p.status === 'offline').length,
    recent: plugins
      .filter(p => p.last_active_at)
      .sort((a, b) => new Date(b.last_active_at!).getTime() - new Date(a.last_active_at!).getTime())
      .slice(0, 3),
  };

  // 活跃模块判断
  const isActive = (key: string) => {
    switch (key) {
      case 'tasks': return (s.running_tasks || 0) > 0;
      case 'training': return (s.running_experiments || 0) > 0;
      case 'workflow': return activities.some(a => a.type === 'workflow');
      case 'deployments': return (s.healthy_deployments || 0) > 0;
      default: return false;
    }
  };

  // 卡片内容定义
  const cards = useMemo(() => {
    const cardList = [
      {
        id: 'openclaw',
        content: (
          <div className={`dash-openclaw-card role-card ${roleClass(openclawEnabled ? 'exec' : 'risk')} ${openclawEnabled ? 'enabled' : 'disabled'}`}>
            <div className="dash-openclaw-header">
              <div>
                <div className="dash-openclaw-title role-title">OpenClaw 总闸</div>
                <div className="dash-openclaw-subtitle">
                  {openclawEnabled ? '开启' : '关闭'} · {openclaw?.message || '执行层状态'}
                </div>
              </div>
              <button
                type="button"
                className={`dash-openclaw-switch ${openclawEnabled ? 'on' : 'off'} ${switchBusy ? 'busy' : ''}`}
                onClick={toggleOpenClawSwitch}
                disabled={switchBusy}
                aria-label="OpenClaw 总闸"
              >
                <span className="dash-openclaw-switch-knob" />
              </button>
            </div>
            {!openclawEnabled && (
              <div className="dash-openclaw-banner">OpenClaw 执行层已关闭</div>
            )}
            {openclaw && openclaw.token_configured === false && (
              <div className="dash-openclaw-banner">OpenClaw 心跳令牌未配置（已兼容运行，建议尽快配置）</div>
            )}
        <div className="dash-openclaw-metrics">
          <div className="dash-openclaw-metric"><span>{t.dashboard.online}</span><strong>{openclaw?.status?.online_status === 'online' ? t.dashboard.online : t.dashboard.offline}</strong></div>
          <div className="dash-openclaw-metric"><span>{t.dashboard.execution}</span><strong>{ocStatus?.execution_status === 'executing' ? (lang === 'zh' ? '执行中' : 'Executing') : (lang === 'zh' ? '空闲' : 'Idle')}</strong></div>
          <div className="dash-openclaw-metric"><span>{t.dashboard.lastAction}</span><strong>{(openclaw as any)?.last_action ? `${(openclaw as any).last_action.run_name || (openclaw as any).last_action.run_code}` : (ocStatus?.last_action ? `${ocStatus.last_action.run_name || ocStatus.last_action.run_code}` : '—')}</strong></div>
          <div className="dash-openclaw-metric"><span>{t.dashboard.lastError}</span><strong>{(openclaw as any)?.last_error?.message || ocStatus?.last_error?.message || '—'}</strong></div>
          <div className="dash-openclaw-metric"><span>{t.dashboard.circuitState || (lang === 'zh' ? '熔断状态' : 'Circuit State')}</span><strong>{(((openclaw as any)?.circuit_state) === 'triggered') ? (lang === 'zh' ? '已触发' : 'Triggered') : (ocStatus?.circuit_status || (lang === 'zh' ? '正常' : 'Normal'))}</strong></div>
        </div>
          </div>
        ),
      },
      {
        id: 'factory_status',
        content: (
          <div className={`dash-instrument-card dash-instrument-primary role-card ${roleClass('exec')}`}>
            <div className="dash-instrument-header">
              <span className="dash-instrument-icon">🏭</span>
              <span className="dash-instrument-label">{td.factoryStatus}</span>
              <span className={`dash-status-dot ${s.running_tasks > 0 ? 'active' : 'idle'}`} />
            </div>
            <div className="dash-instrument-value">
              {s.running_tasks > 0 ? (lang === 'zh' ? '运行中' : 'Running') : (lang === 'zh' ? '待机' : 'Standby')}
            </div>
            <div className="dash-instrument-meta">
              {s.running_tasks || 0} {lang === 'zh' ? '个活跃任务' : 'active tasks'}
            </div>
          </div>
        ),
      },
      {
        id: 'running_tasks',
        content: (
          <div className={`dash-instrument-card role-card ${roleClass('exec')}`}>
            <div className="dash-instrument-header">
              <span className="dash-instrument-icon">📋</span>
              <span className="dash-instrument-label">{td.runningTasks}</span>
            </div>
            <div className="dash-instrument-value">{s.running_tasks || 0}</div>
            <div className="dash-instrument-meta">
              / {s.tasks_total || 0} {lang === 'zh' ? '总任务' : 'total'}
            </div>
          </div>
        ),
      },
      {
        id: 'active_workflow',
        content: (
          <div className={`dash-instrument-card role-card ${roleClass('exec')}`}>
            <div className="dash-instrument-header">
              <span className="dash-instrument-icon">⚡</span>
              <span className="dash-instrument-label">{td.activeWorkflows}</span>
            </div>
            <div className="dash-instrument-value">
              {activities.filter(a => a.type === 'workflow').length || 0}
            </div>
            <div className="dash-instrument-meta">{lang === 'zh' ? '活跃节点' : 'active nodes'}</div>
          </div>
        ),
      },
      {
        id: 'pending',
        content: (
          <div className={`dash-instrument-card role-card ${roleClass('gov')}`}>
            <div className="dash-instrument-header">
              <span className="dash-instrument-icon">⏳</span>
              <span className="dash-instrument-label">{td.pendingApprovals}</span>
            </div>
            <div className="dash-instrument-value">{s.pending_approvals || 0}</div>
            <div className="dash-instrument-meta">{lang === 'zh' ? '待处理' : 'pending'}</div>
          </div>
        ),
      },
      {
        id: 'plugin_status',
        content: (
          <div className={`dash-instrument-card dash-instrument-wide role-card ${roleClass('knowledge')}`}>
            <div className="dash-instrument-header">
              <span className="dash-instrument-icon">🔌</span>
              <span className="dash-instrument-label">{td.pluginStatus}</span>
              {pluginStats.error > 0 && (
                <span className="dash-badge dash-badge-error">{pluginStats.error} {lang === 'zh' ? '异常' : 'err'}</span>
              )}
            </div>
            <div className="dash-plugin-stats">
              <div className="dash-plugin-stat">
                <span className="dash-plugin-stat-value">{pluginStats.total}</span>
                <span className="dash-plugin-stat-label">{td.registered}</span>
              </div>
              <div className="dash-plugin-stat">
                <span className="dash-plugin-stat-value">{pluginStats.enabled}</span>
                <span className="dash-plugin-stat-label">{td.enabled}</span>
              </div>
              <div className="dash-plugin-stat">
                <span className="dash-plugin-stat-value">{pluginStats.online}</span>
                <span className="dash-plugin-stat-label">{td.online}</span>
              </div>
              <div className="dash-plugin-stat">
                <span className="dash-plugin-stat-value">{pluginStats.error}</span>
                <span className="dash-plugin-stat-label">{td.abnormal}</span>
              </div>
              <div className="dash-plugin-stat">
                <span className="dash-plugin-stat-value">{pluginStats.offline}</span>
                <span className="dash-plugin-stat-label">{td.offline}</span>
              </div>
            </div>
            {pluginStats.recent.length > 0 && (
              <div className="dash-plugin-recent">
                <span className="dash-plugin-recent-label">{td.recentlyActive}:</span>
                {pluginStats.recent.map(p => (
                  <span key={p.plugin_name} className="dash-plugin-chip">
                    {p.plugin_name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'route_health',
        content: (
          <div className={`dash-instrument-card role-card ${roleClass('gov')}`}>
            <div className="dash-instrument-header">
              <span className="dash-instrument-icon">💰</span>
              <span className="dash-instrument-label">{td.routeHealth}</span>
            </div>
            <div className="dash-instrument-value">
              {s.healthy_deployments > 0 ? (lang === 'zh' ? '正常' : 'OK') : '—'}
            </div>
            <div className="dash-instrument-meta">
              {s.healthy_deployments || 0} {lang === 'zh' ? '健康部署' : 'healthy'}
            </div>
          </div>
        ),
      },
      {
        id: 'recent_activity',
        content: (
          <div className={`dash-motion-card role-card ${roleClass('data')}`}>
            <div className="dash-motion-card-header">
              <span>{td.recentActivity}</span>
              <span className="dash-motion-count">{activities.length}</span>
              <span className="dash-live-indicator" style={{ marginLeft: 'auto' }}>
                <span className="dash-live-dot" />
                {td.live}
              </span>
            </div>
            <div className="dash-activity-list">
              {activities.slice(0, 8).map((a: any, idx: number) => (
                <div key={`${a.id || idx}-${idx}`} className="dash-activity-item">
                  <div className="dash-activity-type">{a.type || 'system'}</div>
                  <div className="dash-activity-name">{a.entity_name || a.target || '—'}</div>
                  <div className="dash-activity-action">{a.action || 'updated'}</div>
                  <div className="dash-activity-time">{ago(a.created_at, lang)}</div>
                </div>
              ))}
              {activities.length === 0 && (
                <div className="dash-activity-empty">{lang === 'zh' ? '暂无活动' : 'No activity'}</div>
              )}
            </div>
          </div>
        ),
      },
      {
        id: 'system_stats',
        content: (
          <div className={`dash-motion-card role-card ${roleClass('train')}`}>
            <div className="dash-motion-card-header">
              <span>{td.systemStats}</span>
            </div>
            <div className="dash-stats-grid">
              <div className="dash-stat-item" onClick={() => navigate('/datasets')}>
                <span className="dash-stat-value">{s.datasets_total || 0}</span>
                <span className="dash-stat-label">{t.nav.datasets}</span>
              </div>
              <div className="dash-stat-item" onClick={() => navigate('/training')}>
                <span className="dash-stat-value">{s.experiments_total || 0}</span>
                <span className="dash-stat-label">{lang === 'zh' ? '训练' : 'Train'}</span>
              </div>
              <div className="dash-stat-item" onClick={() => navigate('/evaluations')}>
                <span className="dash-stat-value">{s.evaluations_total || 0}</span>
                <span className="dash-stat-label">{lang === 'zh' ? '评估' : 'Eval'}</span>
              </div>
              <div className="dash-stat-item" onClick={() => navigate('/artifacts')}>
                <span className="dash-stat-value">{s.artifacts_total || 0}</span>
                <span className="dash-stat-label">{lang === 'zh' ? '产物' : 'Arts'}</span>
              </div>
              <div className="dash-stat-item" onClick={() => navigate('/deployments')}>
                <span className="dash-stat-value">{s.deployments_total || 0}</span>
                <span className="dash-stat-label">{lang === 'zh' ? '部署' : 'Deploy'}</span>
              </div>
              <div className="dash-stat-item" onClick={() => navigate('/models')}>
                <span className="dash-stat-value">{s.models_total || 0}</span>
                <span className="dash-stat-label">模型</span>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'quick_access',
        content: (
          <div className={`dash-modules-panel-inner role-card ${roleClass('gov')}`}>
            <h3 className={`dash-section-title role-title ${roleClass('gov')}`}>{td.quickAccess}</h3>
            <div className="dash-community-onboarding">
              <div className="dash-community-onboarding-head">
                <div className="dash-community-onboarding-title">
                  {APP_META.appNameZh} · {APP_META.appAbbr} · {APP_META.edition}
                </div>
                <div className="dash-community-onboarding-version">v{displayVersion}</div>
              </div>
              <div className="dash-community-onboarding-actions">
                <button className="ui-btn ui-btn-outline ui-btn-sm" onClick={() => openExternal(APP_META.githubRepoUrl)}>GitHub</button>
                <button className="ui-btn ui-btn-outline ui-btn-sm" onClick={() => openExternal(APP_META.releaseUrl)}>Release</button>
                <button className="ui-btn ui-btn-outline ui-btn-sm" onClick={() => openExternal(APP_META.onboardingDocUrl)}>{lang === 'zh' ? '第一次如何开始' : 'First Run Guide'}</button>
                <button className="ui-btn ui-btn-outline ui-btn-sm" onClick={() => navigate('/workflow-composer')}>{lang === 'zh' ? '打开编排器' : 'Open Composer'}</button>
              </div>
              <div className="dash-community-onboarding-grid">
                <div className="dash-community-card">
                  <div className="dash-community-card-title">{lang === 'zh' ? '推荐首跑模板' : 'Recommended First Templates'}</div>
                  <div className="dash-community-card-item">`front-chain-light.json`</div>
                  <div className="dash-community-card-item">`minimal-full-chain-flywheel.json`</div>
                </div>
                <div className="dash-community-card">
                  <div className="dash-community-card-title">{lang === 'zh' ? '社区版边界' : 'Community Boundary'}</div>
                  <div className="dash-community-card-item">{lang === 'zh' ? '包含：工作流编排、治理中枢、API+Web 最小基线' : 'Includes: composer, governance hub, API+Web baseline'}</div>
                  <div className="dash-community-card-item">{lang === 'zh' ? '不包含：私有资产/私有验证材料/真实凭据' : 'Excludes: private assets, private validation artifacts, real secrets'}</div>
                </div>
              </div>
            </div>
            <div className="dash-module-groups">
              <div className="dash-module-group">
                <h4 className={`dash-module-group-title role-title ${roleClass('exec')}`}>{td.execution}</h4>
                <div className="dash-module-grid">
                  <div className={`dash-module-card role-card ${roleClass('exec')} ${isActive('tasks') ? 'active' : ''}`} onClick={() => navigate('/tasks')}>
                    <div className="dash-module-icon">📋</div>
                    <div className="dash-module-info">
                      <div className="dash-module-name">{t.nav.taskOrchestration}</div>
                      <div className="dash-module-desc">{lang === 'zh' ? '任务编排与执行' : 'Task orchestration'}</div>
                    </div>
                    {isActive('tasks') && <span className="dash-module-pulse" />}
                  </div>
                  <div className={`dash-module-card role-card ${roleClass('exec')} ${isActive('workflow') ? 'active' : ''}`} onClick={() => navigate('/workflow-jobs')}>
                    <div className="dash-module-icon">⚡</div>
                    <div className="dash-module-info">
                      <div className="dash-module-name">{t.nav.workflow}</div>
                      <div className="dash-module-desc">{lang === 'zh' ? '流程自动化' : 'Workflow automation'}</div>
                    </div>
                    {isActive('workflow') && <span className="dash-module-pulse" />}
                  </div>
                  <div className={`dash-module-card role-card ${roleClass('knowledge')}`} onClick={() => navigate('/outputs')}>
                    <div className="dash-module-icon">📤</div>
                    <div className="dash-module-info">
                      <div className="dash-module-name">{t.nav.standardOutput}</div>
                      <div className="dash-module-desc">{lang === 'zh' ? '产物输出管理' : 'Output management'}</div>
                    </div>
                  </div>
                  <div className={`dash-module-card role-card ${roleClass('gov')}`} onClick={() => navigate('/factory-status')}>
                    <div className="dash-module-icon">🏭</div>
                    <div className="dash-module-info">
                      <div className="dash-module-name">{t.nav.factoryStatus}</div>
                      <div className="dash-module-desc">{lang === 'zh' ? '工厂状态监控' : 'Factory monitoring'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="dash-module-group">
                <h4 className={`dash-module-group-title role-title ${roleClass('train')}`}>{td.dataTraining}</h4>
                <div className="dash-module-grid">
                  <div className={`dash-module-card role-card ${roleClass('data')}`} onClick={() => navigate('/datasets')}>
                    <div className="dash-module-icon">🗃️</div>
                    <div className="dash-module-info">
                      <div className="dash-module-name">{t.nav.datasets}</div>
                      <div className="dash-module-desc">{lang === 'zh' ? '数据资产管理' : 'Data assets'}</div>
                    </div>
                  </div>
                  <div className={`dash-module-card role-card ${roleClass('train')} ${isActive('training') ? 'active' : ''}`} onClick={() => navigate('/training')}>
                    <div className="dash-module-icon">🧠</div>
                    <div className="dash-module-info">
                      <div className="dash-module-name">{t.nav.trainingCenter}</div>
                      <div className="dash-module-desc">{lang === 'zh' ? '模型训练管理' : 'Training management'}</div>
                    </div>
                    {isActive('training') && <span className="dash-module-pulse" />}
                  </div>
                  <div className={`dash-module-card role-card ${roleClass('train')}`} onClick={() => navigate('/evaluations')}>
                    <div className="dash-module-icon">📊</div>
                    <div className="dash-module-info">
                      <div className="dash-module-name">{t.nav.evalCenter}</div>
                      <div className="dash-module-desc">{lang === 'zh' ? '模型评估分析' : 'Model evaluation'}</div>
                    </div>
                  </div>
                  <div className={`dash-module-card role-card ${roleClass('train')}`} onClick={() => navigate('/models')}>
                    <div className="dash-module-icon">📦</div>
                    <div className="dash-module-info">
                      <div className="dash-module-name">{t.nav.modelMgmt}</div>
                      <div className="dash-module-desc">{lang === 'zh' ? '模型版本管理' : 'Model versioning'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="dash-module-group">
                <h4 className={`dash-module-group-title role-title ${roleClass('gov')}`}>{td.governance}</h4>
                <div className="dash-module-grid">
                  <div className={`dash-module-card role-card ${roleClass('gov')}`} onClick={() => navigate('/approvals')}>
                    <div className="dash-module-icon">✅</div>
                    <div className="dash-module-info">
                      <div className="dash-module-name">{t.nav.approvals}</div>
                      <div className="dash-module-desc">{lang === 'zh' ? '审批流程管理' : 'Approval workflow'}</div>
                    </div>
                  </div>
                  <div className={`dash-module-card role-card ${roleClass('gov')}`} onClick={() => navigate('/audit')}>
                    <div className="dash-module-icon">📜</div>
                    <div className="dash-module-info">
                      <div className="dash-module-name">{t.nav.audit}</div>
                      <div className="dash-module-desc">{lang === 'zh' ? '操作审计日志' : 'Audit logs'}</div>
                    </div>
                  </div>
                  <div className={`dash-module-card role-card ${roleClass('gov')}`} onClick={() => navigate('/cost-routing')}>
                    <div className="dash-module-icon">💰</div>
                    <div className="dash-module-info">
                      <div className="dash-module-name">{t.nav.costRouting}</div>
                      <div className="dash-module-desc">{lang === 'zh' ? '成本路由配置' : 'Cost routing'}</div>
                    </div>
                  </div>
                  <div className={`dash-module-card role-card ${roleClass('gov')} ${isActive('deployments') ? 'active' : ''}`} onClick={() => navigate('/deployments')}>
                    <div className="dash-module-icon">🚀</div>
                    <div className="dash-module-info">
                      <div className="dash-module-name">{t.nav.deployCenter}</div>
                      <div className="dash-module-desc">{lang === 'zh' ? '模型部署管理' : 'Deployment mgmt'}</div>
                    </div>
                    {isActive('deployments') && <span className="dash-module-pulse" />}
                  </div>
                </div>
              </div>

              <div className="dash-module-group">
                <h4 className={`dash-module-group-title role-title ${roleClass('knowledge')}`}>{td.intelligence}</h4>
                <div className="dash-module-grid">
                  <div className={`dash-module-card role-card ${roleClass('knowledge')}`} onClick={() => navigate('/feedback')}>
                    <div className="dash-module-icon">💬</div>
                    <div className="dash-module-info">
                      <div className="dash-module-name">{t.nav.feedback}</div>
                      <div className="dash-module-desc">{lang === 'zh' ? '反馈收集处理' : 'Feedback handling'}</div>
                    </div>
                  </div>
                  <div className={`dash-module-card role-card ${roleClass('knowledge')}`} onClick={() => navigate('/knowledge')}>
                    <div className="dash-module-icon">📚</div>
                    <div className="dash-module-info">
                      <div className="dash-module-name">{t.nav.knowledgeCenter}</div>
                      <div className="dash-module-desc">{lang === 'zh' ? '知识库管理' : 'Knowledge base'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ),
      },
    ];
    return cardList;
  }, [s, activities, plugins, lang, t, td, openclaw, openclawEnabled, ocStatus, switchBusy, toggleOpenClawSwitch, navigate, isActive, pluginStats]);

  return (
    <div className="page-root dashboard-page" ref={contentRef}>
      <PageHeader
        title={APP_META.appName}
        subtitle={td.title}
        actions={(
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="dash-version">v{displayVersion}</span>
            <button className="dash-refresh-btn" onClick={fetchAll} disabled={loading}>
              {loading ? '⟳' : '↻'}
            </button>
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
          </div>
        )}
      />

      {loading && !summary ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
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
              <div key={c.id} className="factory-status-grid-cell" style={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
                {c.content}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
