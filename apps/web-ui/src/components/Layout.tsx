import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import './Layout.css';
import { type Lang, translations, getStoredLang, setStoredLang } from '../i18n';
import { APP_VERSION } from '../constants/appVersion';
import { APP_META } from '../constants/appMeta';
import { loadSidebarWidth, saveSidebarWidth } from '../layout/layoutStorage';

// ── SVG Icons ────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 16 }: { name: string; size?: number }) => {
  const s = size;
  const icons: Record<string, React.ReactNode> = {
    dashboard: <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>,
    factory:    <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><path d="M1 14h14v-5l-4 2V7L7 9V5L1 7v7z"/><rect x="2" y="2" width="4" height="2" rx="0.6"/></svg>,
    tasks:      <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><rect x="2" y="2" width="12" height="2" rx="1"/><rect x="2" y="7" width="8" height="2" rx="1"/><rect x="2" y="12" width="10" height="2" rx="1"/></svg>,
    template:   <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="14" height="2.5" rx="1"/><rect x="1" y="6" width="5" height="8" rx="1"/><rect x="7.5" y="6" width="7.5" height="3.5" rx="1"/><rect x="7.5" y="11" width="7.5" height="3.5" rx="1"/></svg>,
    dataset:    <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><ellipse cx="8" cy="3" rx="7" ry="2.5"/><path d="M1 3v5c0 1.38 3.13 2.5 7 2.5s7-1.12 7-2.5V3"/><path d="M1 8v5c0 1.38 3.13 2.5 7 2.5s7-1.12 7-2.5V8"/></svg>,
    training:   <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="6.5"/><path d="M8 4v4l3 1.5" stroke="#24384C" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>,
    run:        <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><polygon points="4,2 14,8 4,14"/></svg>,
    artifact:   <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><path d="M8 1L14 5v6L8 15 2 11V5L8 1z"/><path d="M8 1v14M2 5l6 4 6-4" stroke="#24384C" strokeWidth="1" fill="none"/></svg>,
    eval:       <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/><rect x="1" y="1" width="14" height="14" rx="2"/></svg>,
    deploy:     <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><path d="M2 11L8 4l6 7H2z"/><rect x="5" y="9" width="6" height="5" rx="1"/></svg>,
    workflow:   <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><circle cx="4" cy="4" r="2.5"/><circle cx="12" cy="4" r="2.5"/><circle cx="4" cy="12" r="2.5"/><circle cx="12" cy="12" r="2.5"/><line x1="6" y1="4" x2="10" y2="4" stroke="currentColor" strokeWidth="1.2"/><line x1="4" y1="6" x2="4" y2="10" stroke="currentColor" strokeWidth="1.2"/><line x1="12" y1="6" x2="12" y2="10" stroke="currentColor" strokeWidth="1.2"/><line x1="6" y1="12" x2="10" y2="12" stroke="currentColor" strokeWidth="1.2"/></svg>,
    approval:   <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><path d="M2 8l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>,
    feedback:   <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="6"/><path d="M5 8h6M8 5v6" stroke="#24384C" strokeWidth="1.2" fill="none"/></svg>,
    route:      <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><circle cx="3.5" cy="3.5" r="2"/><circle cx="12.5" cy="8" r="2"/><circle cx="3.5" cy="12.5" r="2"/><path d="M5.2 4.4L10.8 7.1M5.2 11.6L10.8 8.9" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>,
    modules:    <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.1"/><rect x="9" y="1.5" width="5.5" height="5.5" rx="1.1"/><rect x="1.5" y="9" width="5.5" height="5.5" rx="1.1"/><rect x="9" y="9" width="5.5" height="5.5" rx="1.1"/></svg>,
    audit:      <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="2" width="10" height="12" rx="1.5"/><path d="M5 5h6M5 8h6M5 11h4" stroke="#24384C" strokeWidth="1.1" fill="none" strokeLinecap="round"/></svg>,
    knowledge:  <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><path d="M2 3.5A2.5 2.5 0 0 1 4.5 1H14v12H4.5A2.5 2.5 0 0 0 2 15V3.5z"/><path d="M4.5 1A2.5 2.5 0 0 0 2 3.5V15" stroke="#24384C" strokeWidth="1.1" fill="none"/></svg>,
    output:     <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><path d="M3 1h7l3 3v11H3z"/><path d="M10 1v3h3M5 8h6M5 11h6" stroke="#24384C" strokeWidth="1.1" fill="none" strokeLinecap="round"/></svg>,
    api:        <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><rect x="2" y="3" width="12" height="2" rx="1"/><rect x="2" y="7" width="9" height="2" rx="1"/><rect x="2" y="11" width="6" height="2" rx="1"/></svg>,
    composer:   <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="3" r="2"/><circle cx="13" cy="8" r="2"/><circle cx="3" cy="13" r="2"/><path d="M5 3h4l3 5-3 5H5l-2-5 2-5z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" fill="none"/></svg>,
    brain:      <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><path d="M8 1C4.5 1 2 3 2 6c0 2 1 3 2 4l1 4h6l1-4c1-1 2-2 2-4 0-3-2.5-5-6-5z"/><circle cx="5.5" cy="6" r="1.2"/><circle cx="10.5" cy="6" r="1.2"/><path d="M6 8.5c0 0 1 1 2 1s2-1 2-1" stroke="#24384C" strokeWidth="1.2" fill="none"/></svg>,
    clock:      <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.5V8l3 2" stroke="#24384C" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>,
    bell:       <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><path d="M8 1C6 1 4.5 2.5 4.5 5v2c0 1-.5 2-1.5 3h10c-1-1-1.5-2-1.5-3V5c0-2.5-1.5-4-3.5-4z"/><path d="M6 12c0 1.1.9 2 2 2s2-.9 2-2" stroke="#24384C" strokeWidth="1.2" fill="none"/></svg>,
    settings:   <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2.5M8 12.5V15M1 8h2.5M12.5 8H15M3 3l2 2M11 11l2 2M3 13l2-2M11 5l2-2" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>,
    merge:      <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><circle cx="4" cy="4" r="2.5"/><circle cx="4" cy="12" r="2.5"/><circle cx="12" cy="8" r="2.5"/><path d="M4 6.5v3M5.5 4.5l5 2.5M5.5 11.5l5-2.5" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>,
    database:   <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><ellipse cx="8" cy="4" rx="6" ry="2.5"/><path d="M2 4v4c0 1.38 2.68 2.5 6 2.5s6-1.12 6-2.5V4M2 8v4c0 1.38 2.68 2.5 6 2.5s6-1.12 6-2.5V8" stroke="#24384C" strokeWidth="1" fill="none"/></svg>,
    label:      <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><rect x="2" y="3" width="12" height="10" rx="2"/><circle cx="6" cy="6" r="1.5"/><path d="M6 10l3-3 3 3" stroke="#24384C" strokeWidth="1.2" fill="none"/></svg>,
  };
  return <span style={{ display: 'flex', alignItems: 'center' }}>{icons[name] || icons.tasks}</span>;
};

// ── Nav item ────────────────────────────────────────────────────────────────
function NavItem({ to, icon, label }: { to: string; icon: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
    >
      <span className="nav-icon"><Icon name={icon} /></span>
      <span className="nav-label">{label}</span>
    </NavLink>
  );
}

// ── AppShell ────────────────────────────────────────────────────────────────
function AppShell() {
  const navigate = useNavigate();
  const [apiOk, setApiOk] = useState<boolean | null>(null);
  const [apiVersion, setApiVersion] = useState<string>('…');
  const [healthData, setHealthData] = useState<any>(null);
  const [panel, setPanel] = useState<'about' | 'system' | 'help' | null>(null);
  const [systemData, setSystemData] = useState<any>(null);
  const [lang, setLang] = useState<Lang>(() => getStoredLang());
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('agi_factory_site_theme');
    return saved === 'light' ? 'light' : 'dark';
  });
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => loadSidebarWidth(288));
  const dragState = useRef<{ active: boolean; startX: number; startWidth: number }>({ active: false, startX: 0, startWidth: 288 });

  // ── 侧边栏分组折叠 ──
  const DEFAULT_COLLAPSED = ['governance', 'intelligence', 'automation', 'systemAdmin', 'knowledge', 'output'];
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set(DEFAULT_COLLAPSED));
  const toggleSection = useCallback((key: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  useEffect(() => {
    const check = async () => {
      try {
        const r = await fetch('/api/health');
        const d = await r.json();
        setApiOk(d.ok ?? false);
        setHealthData(d || null);
        if (d.version) setApiVersion(d.version);
      } catch { setApiOk(false); }
    };
    check();
    const t = setInterval(check, 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setStoredLang(lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('agi_factory_site_theme', theme);
  }, [theme]);

  const t = translations[lang];
  const text = {
    subtitle: lang === 'zh' ? APP_META.consoleLabelZh : APP_META.consoleLabelEn,
    home: lang === 'zh' ? '首页' : 'Home',
    about: lang === 'zh' ? '关于' : 'About',
    systems: lang === 'zh' ? '系统' : 'Systems',
    help: lang === 'zh' ? '帮助' : 'Help',
    wechat: 'WeChat',
    langSwitch: lang === 'zh' ? 'EN' : '中',
    themeSwitch: theme === 'dark' ? (lang === 'zh' ? '浅色' : 'Light') : (lang === 'zh' ? '深色' : 'Dark'),
    apiStatusPending: lang === 'zh' ? '检测中…' : 'Checking…',
    apiStatusOk: lang === 'zh' ? 'API 正常' : 'API Online',
    apiStatusBad: lang === 'zh' ? 'API 异常' : 'API Offline',
  };
  const displayVersion = apiVersion && apiVersion !== '…' ? apiVersion : APP_VERSION;
  const openExternal = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    saveSidebarWidth(sidebarWidth);
  }, [sidebarWidth]);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      if (!dragState.current.active) return;
      const delta = event.clientX - dragState.current.startX;
      const next = Math.max(220, Math.min(460, dragState.current.startWidth + delta));
      setSidebarWidth(next);
    };
    const onUp = () => {
      dragState.current.active = false;
      document.body.classList.remove('layout-resizing');
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const openSystemPanel = async () => {
    try {
      const [health, summary, openclaw] = await Promise.all([
        fetch('/api/health').then((r) => r.json()).catch(() => null),
        fetch('/api/dashboard/summary').then((r) => r.json()).catch(() => null),
        fetch('/api/openclaw/master-switch').then((r) => r.json()).catch(() => null),
      ]);
      setSystemData({ health, summary, openclaw });
    } catch {
      setSystemData(null);
    }
    setPanel('system');
  };

  return (
    <div className={`app-shell theme-${theme}`}>
      {/* ── Topbar ── */}
      <header className="topbar">
        <div className="topbar-brand">
          <div className="topbar-logo">AG</div>
          <div>
          <div className="topbar-title">{APP_META.appName}</div>
          <div className="topbar-subtitle">{text.subtitle}</div>
          </div>
        </div>
        <nav className="topbar-nav">
          <button
            type="button"
            className="topbar-nav-link topbar-nav-btn"
            onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            {text.home}
          </button>
          <button type="button" className="topbar-nav-link topbar-nav-btn" onClick={() => setPanel('about')}>
            {text.about}
          </button>
          <button type="button" className="topbar-nav-link topbar-nav-btn" onClick={openSystemPanel}>
            {text.systems}
          </button>
          <button type="button" className="topbar-nav-link topbar-nav-btn" onClick={() => setPanel('help')}>
            {text.help}
          </button>
        </nav>
        <div className="topbar-right">
          <button className="topbar-action" onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}>{text.langSwitch}</button>
          <button className="topbar-action" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{text.themeSwitch}</button>
          <span className="topbar-wechat">{text.wechat}: {APP_META.wechatId}</span>
          <div className="topbar-status">
            <span className={`topbar-status-dot ${apiOk === true ? 'ok' : apiOk === false ? 'err' : 'warn'}`} />
            {apiOk === null ? text.apiStatusPending : apiOk ? text.apiStatusOk : text.apiStatusBad}
          </div>
        </div>
      </header>

      {/* ── Main row ── */}
      <div className="main-row">
        {/* ── Sidebar ── */}
        <nav className="sidebar" style={{ width: sidebarWidth }}>
          <div className="sidebar-scroll">
            {/* ── 概览 ── */}
            <div className="nav-section">
              <div className="nav-section-label" onClick={() => toggleSection('overview')}>
                {t.nav.overview}
                <span className="nav-section-arrow">{collapsed.has('overview') ? '▸' : '▾'}</span>
              </div>
              {!collapsed.has('overview') && (<>
                <NavItem to="/" icon="dashboard" label={t.nav.dashboard} />
                <NavItem to="/factory-status" icon="factory" label={t.nav.factoryStatus} />
              </>)}
            </div>

            {/* ── 数据与训练 ── */}
            <div className="nav-section">
              <div className="nav-section-label" onClick={() => toggleSection('dataAndTraining')}>
                {t.nav.dataAndTraining}
                <span className="nav-section-arrow">{collapsed.has('dataAndTraining') ? '▸' : '▾'}</span>
              </div>
              {!collapsed.has('dataAndTraining') && (<>
                <NavItem to="/datasets" icon="dataset" label={t.nav.datasets} />
                <NavItem to="/training" icon="training" label={t.nav.trainingCenter} />
                <NavItem to="/runs" icon="run" label={t.nav.runCenter} />
                <NavItem to="/templates" icon="template" label={t.nav.templates} />
              </>)}
            </div>

            {/* ── 模型与发布 ── */}
            <div className="nav-section">
              <div className="nav-section-label" onClick={() => toggleSection('modelAndRelease')}>
                {t.nav.modelAndRelease}
                <span className="nav-section-arrow">{collapsed.has('modelAndRelease') ? '▸' : '▾'}</span>
              </div>
              {!collapsed.has('modelAndRelease') && (<>
                <NavItem to="/models" icon="artifact" label={t.nav.modelMgmt} />
                <NavItem to="/artifacts" icon="artifact" label={t.nav.artifacts} />
                <NavItem to="/evaluations" icon="eval" label={t.nav.evalCenter} />
                <NavItem to="/deployments" icon="deploy" label={t.nav.deployCenter} />
              </>)}
            </div>

            {/* ── 流程与编排 ── */}
            <div className="nav-section">
              <div className="nav-section-label" onClick={() => toggleSection('workflowAndComposer')}>
                {t.nav.workflowAndComposer}
                <span className="nav-section-arrow">{collapsed.has('workflowAndComposer') ? '▸' : '▾'}</span>
              </div>
              {!collapsed.has('workflowAndComposer') && (<>
                <NavItem to="/workflow-jobs" icon="workflow" label={t.nav.workflow} />
                <NavItem to="/workflow-composer" icon="composer" label={t.nav.workflowComposer} />
                <NavItem to="/workflow-canvas" icon="workflow" label={t.nav.workflowCanvas} />
              </>)}
            </div>

            {/* ── 能力与模块 ── */}
            <div className="nav-section">
              <div className="nav-section-label" onClick={() => toggleSection('capabilities')}>
                {t.nav.capabilities}
                <span className="nav-section-arrow">{collapsed.has('capabilities') ? '▸' : '▾'}</span>
              </div>
              {!collapsed.has('capabilities') && (<>
                <NavItem to="/module-center" icon="modules" label={t.nav.moduleCenter} />
                <NavItem to="/plugin-pool" icon="api" label={t.nav.pluginPool} />
                <NavItem to="/tasks" icon="tasks" label={t.nav.taskOrchestration} />
                <NavItem to="/cost-routing" icon="route" label={t.nav.costRouting} />
              </>)}
            </div>

            {/* ── 智能增强 ── */}
            <div className="nav-section">
              <div className="nav-section-label" onClick={() => toggleSection('intelligence')}>
                {t.nav.intelligence}
                <span className="nav-section-arrow">{collapsed.has('intelligence') ? '▸' : '▾'}</span>
              </div>
              {!collapsed.has('intelligence') && (<>
                <NavItem to="/digital-employee" icon="brain" label={t.nav.digitalEmployee} />
                <NavItem to="/training-v2" icon="training" label={t.nav.trainingV2} />
                <NavItem to="/hpo" icon="run" label={t.nav.hpo} />
                <NavItem to="/distill" icon="eval" label={t.nav.distill} />
                <NavItem to="/model-merge" icon="merge" label={t.nav.modelMerge} />
                <NavItem to="/inference" icon="run" label={t.nav.inference} />
                <NavItem to="/annotation" icon="label" label={t.nav.annotation} />
                <NavItem to="/huggingface" icon="api" label={t.nav.huggingface} />
              </>)}
            </div>

            {/* ── 自动化 ── */}
            <div className="nav-section">
              <div className="nav-section-label" onClick={() => toggleSection('automation')}>
                {t.nav.automation}
                <span className="nav-section-arrow">{collapsed.has('automation') ? '▸' : '▾'}</span>
              </div>
              {!collapsed.has('automation') && (<>
                <NavItem to="/backflow-v2" icon="feedback" label={t.nav.backflowV2} />
                <NavItem to="/scheduler" icon="clock" label={t.nav.scheduler} />
                <NavItem to="/alerting" icon="bell" label={t.nav.alerting} />
                <NavItem to="/model-monitor" icon="eval" label={t.nav.modelMonitor} />
                <NavItem to="/deploy-v2" icon="deploy" label={t.nav.deployV2} />
              </>)}
            </div>

            {/* ── 系统管理 ── */}
            <div className="nav-section">
              <div className="nav-section-label" onClick={() => toggleSection('systemAdmin')}>
                {t.nav.systemAdmin}
                <span className="nav-section-arrow">{collapsed.has('systemAdmin') ? '▸' : '▾'}</span>
              </div>
              {!collapsed.has('systemAdmin') && (<>
                <NavItem to="/workspace" icon="modules" label={t.nav.workspace} />
                <NavItem to="/cost-tracker" icon="route" label={t.nav.costTracker} />
                <NavItem to="/storage-v2" icon="database" label={t.nav.storageV2} />
                <NavItem to="/system-status" icon="factory" label={t.nav.systemStatus} />
                <NavItem to="/api-docs" icon="api" label={t.nav.apiDocs} />
              </>)}
            </div>

            {/* ── 治理与回流 ── */}
            <div className="nav-section">
              <div className="nav-section-label" onClick={() => toggleSection('governance')}>
                {t.nav.governance}
                <span className="nav-section-arrow">{collapsed.has('governance') ? '▸' : '▾'}</span>
              </div>
              {!collapsed.has('governance') && (<>
                <NavItem to="/approvals" icon="approval" label={t.nav.approvals} />
                <NavItem to="/governance-hub" icon="audit" label={t.nav.governanceHub} />
                <NavItem to="/audit" icon="audit" label={t.nav.audit} />
                <NavItem to="/feedback" icon="feedback" label={t.nav.feedback} />
              </>)}
            </div>

            {/* ── 知识 ── */}
            <div className="nav-section">
              <div className="nav-section-label" onClick={() => toggleSection('knowledge')}>
                {t.nav.knowledge}
                <span className="nav-section-arrow">{collapsed.has('knowledge') ? '▸' : '▾'}</span>
              </div>
              {!collapsed.has('knowledge') && (<>
                <NavItem to="/knowledge" icon="knowledge" label={t.nav.knowledgeCenter} />
              </>)}
            </div>

            {/* ── 输出 ── */}
            <div className="nav-section">
              <div className="nav-section-label" onClick={() => toggleSection('output')}>
                {t.nav.output}
                <span className="nav-section-arrow">{collapsed.has('output') ? '▸' : '▾'}</span>
              </div>
              {!collapsed.has('output') && (<>
                <NavItem to="/outputs" icon="output" label={t.nav.standardOutput} />
              </>)}
            </div>
          </div>
          <div className="sidebar-footer">
            <div className="sidebar-footer-text">v{displayVersion} · {APP_META.appName}</div>
          </div>
        </nav>
        <div
          className="sidebar-resizer"
          title="拖拽调整侧栏宽度"
          onMouseDown={(event) => {
            dragState.current = { active: true, startX: event.clientX, startWidth: sidebarWidth };
            document.body.classList.add('layout-resizing');
            event.preventDefault();
          }}
        />

        {/* ── Content ── */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>

      {panel && (
        <div className="topbar-modal-backdrop" onClick={() => setPanel(null)}>
          <div className="topbar-modal" onClick={(e) => e.stopPropagation()}>
            <div className="topbar-modal-header">
              <div className="topbar-modal-title">
                {panel === 'about' ? (lang === 'zh' ? `关于 ${APP_META.appName}` : `About ${APP_META.appName}`) :
                 panel === 'system' ? (lang === 'zh' ? '系统详情' : 'System Details') :
                 (lang === 'zh' ? '帮助与支持' : 'Help & Support')}
              </div>
              <button className="topbar-modal-close" onClick={() => setPanel(null)}>×</button>
            </div>
            <div className="topbar-modal-body">
              {panel === 'about' && (
                <div className="topbar-modal-grid">
                  <div className="topbar-kv"><span>{lang === 'zh' ? '界面版本' : 'UI Version'}</span><strong>v{displayVersion}</strong></div>
                  <div className="topbar-kv"><span>{lang === 'zh' ? '版本形态' : 'Edition'}</span><strong>{APP_META.edition}</strong></div>
                  <div className="topbar-kv"><span>{lang === 'zh' ? 'API状态' : 'API Status'}</span><strong>{apiOk ? (lang === 'zh' ? '正常' : 'Online') : (lang === 'zh' ? '异常' : 'Offline')}</strong></div>
                  <div className="topbar-kv"><span>{lang === 'zh' ? '服务版本' : 'Service Version'}</span><strong>{healthData?.version || '—'}</strong></div>
                  <div className="topbar-kv"><span>{lang === 'zh' ? '数据库' : 'Database'}</span><strong>{healthData?.database || '—'}</strong></div>
                  <div className="topbar-kv"><span>{lang === 'zh' ? '运行时长' : 'Uptime'}</span><strong>{healthData?.uptime ? `${Math.floor(Number(healthData.uptime) / 60)}m` : '—'}</strong></div>
                  <div className="topbar-kv"><span>{lang === 'zh' ? '工作流总数' : 'Workflows'}</span><strong>{healthData?.workflows?.total ?? '—'}</strong></div>
                </div>
              )}
              {panel === 'system' && (
                <div className="topbar-modal-grid">
                  <div className="topbar-kv"><span>API</span><strong>{systemData?.health?.ok ? (lang === 'zh' ? '健康' : 'Healthy') : (lang === 'zh' ? '异常' : 'Error')}</strong></div>
                  <div className="topbar-kv"><span>OpenClaw</span><strong>{systemData?.openclaw?.enabled ? (lang === 'zh' ? '已开启' : 'Enabled') : (lang === 'zh' ? '已关闭' : 'Disabled')}</strong></div>
                  <div className="topbar-kv"><span>{lang === 'zh' ? '在线状态' : 'Online Status'}</span><strong>{systemData?.openclaw?.online_status || '—'}</strong></div>
                  <div className="topbar-kv"><span>{lang === 'zh' ? '熔断状态' : 'Circuit'}</span><strong>{systemData?.openclaw?.circuit_state || '—'}</strong></div>
                  <div className="topbar-kv"><span>{lang === 'zh' ? '运行任务' : 'Running Tasks'}</span><strong>{systemData?.summary?.running_tasks ?? '—'}</strong></div>
                  <div className="topbar-kv"><span>{lang === 'zh' ? '运行实验' : 'Running Experiments'}</span><strong>{systemData?.summary?.running_experiments ?? '—'}</strong></div>
                </div>
              )}
              {panel === 'help' && (
                <div className="topbar-help">
                  <p>{lang === 'zh' ? '常用入口：' : 'Quick links:'}</p>
                  <div className="topbar-help-actions">
                    <button className="topbar-help-btn" onClick={() => { setPanel(null); navigate('/factory-status'); }}>{lang === 'zh' ? '工厂状态' : 'Factory Status'}</button>
                    <button className="topbar-help-btn" onClick={() => { setPanel(null); navigate('/audit'); }}>{lang === 'zh' ? '审计日志' : 'Audit Logs'}</button>
                    <button className="topbar-help-btn" onClick={() => { setPanel(null); navigate('/outputs'); }}>{lang === 'zh' ? '标准输出' : 'Outputs'}</button>
                    <button className="topbar-help-btn" onClick={() => openExternal(APP_META.githubRepoUrl)}>GitHub</button>
                    <button className="topbar-help-btn" onClick={() => openExternal(APP_META.releaseUrl)}>Release</button>
                    <button className="topbar-help-btn" onClick={() => openExternal(APP_META.onboardingDocUrl)}>{lang === 'zh' ? '新手上手' : 'Onboarding'}</button>
                  </div>
                  <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: 12 }}>
                    {lang === 'zh'
                      ? '社区版不包含私有资产、私有验证材料和真实凭据；高级集成需自行配置。'
                      : 'Community Edition excludes private assets, private validation artifacts, and real credentials; advanced integrations require your own setup.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppShell;
