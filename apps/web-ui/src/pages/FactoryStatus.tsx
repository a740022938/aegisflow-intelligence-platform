// v5.2.0 — Factory Status Page with Root Cause Traceability (Workbench Layout 版)
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge, PageHeader, SectionCard, EmptyState, LineagePanel, DrilldownPanel, TimelinePanel, IncidentDetail, ReleaseGovernancePanel, ReleaseComparePanel, RollbackReadinessBadge, HealthPatrolPanel, VerificationSummaryPanel, TrendSummaryPanel, RiskSignalBadge } from '../components/ui';
import '../components/ui/shared.css';
import './FactoryStatus.css';
import { roleClass } from '../theme/colorRoles';
import WorkspaceGrid from '../layout/WorkspaceGrid';
import { clearLayout, clearAllLayouts, loadLayout, saveLayout, type LayoutConfig } from '../layout/layoutStorage';

const API = '/api';
const LAYOUT_KEY = 'factory-status';

function fmtTs(iso: string): string {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString('zh-CN'); } catch { return iso; }
}

function fmtSize(bytes: number): string {
  if (bytes > 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes > 1_000) return `${(bytes / 1_000).toFixed(1)} KB`;
  return `${bytes} bytes`;
}

const TIME_RANGES = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7天' },
  { value: '30d', label: '30天' },
];

const VERSION_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'v5', label: 'v5' },
  { value: 'v4', label: 'v4' },
];

const GATE_LABELS: Record<string, string> = {
  evaluation_ready: '评估就绪', artifact_ready: '产物就绪',
  promotion_ready: '晋升就绪', release_ready: '发布就绪', seal_ready: '封存就绪',
};

const STATUS_COLORS: Record<string, string> = {
  passed: '#10B981', blocked: '#F59E0B', failed: '#EF4444', pending: '#3B82F6',
};

// 优化后的默认布局 - 解决挤压/出界问题
const DEFAULT_LAYOUTS: LayoutConfig = {
  lg: [
    // 第一行：主线健康度（左）+ 主线阶段状态（中）+ 封板备份（右）
    { i: 'mainline_health', x: 0, y: 0, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'stage_status', x: 4, y: 0, w: 5, h: 6, minW: 4, minH: 4 },
    { i: 'seal_backup', x: 9, y: 0, w: 3, h: 6, minW: 2, minH: 4 },
    // 第二行：阻塞 Gate（左）+ 最近失败任务（中）+ 恢复演练（右）
    { i: 'blocked_gates', x: 0, y: 6, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'recent_failures', x: 4, y: 6, w: 5, h: 8, minW: 4, minH: 5 },
    { i: 'recovery_drill', x: 9, y: 6, w: 3, h: 5, minW: 2, minH: 4 },
    // 第三行：失败原因聚合（左）+ 最近发布（中）+ 备份记录（右）
    { i: 'failure_reasons', x: 0, y: 12, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'recent_releases', x: 4, y: 14, w: 5, h: 5, minW: 3, minH: 3 },
    { i: 'backup_records', x: 9, y: 11, w: 3, h: 5, minW: 2, minH: 4 },
    // 第四行：快速操作（左）+ 健康巡检（中）+ 发布治理（右）
    { i: 'quick_actions', x: 0, y: 18, w: 4, h: 5, minW: 3, minH: 3 },
    { i: 'health_patrol', x: 4, y: 19, w: 5, h: 6, minW: 3, minH: 4 },
    { i: 'release_governance', x: 9, y: 16, w: 3, h: 6, minW: 2, minH: 4 },
  ],
  md: [
    { i: 'mainline_health', x: 0, y: 0, w: 3, h: 6, minW: 2, minH: 4 },
    { i: 'stage_status', x: 3, y: 0, w: 3, h: 6, minW: 3, minH: 4 },
    { i: 'seal_backup', x: 6, y: 0, w: 2, h: 6, minW: 2, minH: 4 },
    { i: 'blocked_gates', x: 0, y: 6, w: 3, h: 6, minW: 2, minH: 4 },
    { i: 'recent_failures', x: 3, y: 6, w: 5, h: 8, minW: 4, minH: 5 },
    { i: 'recovery_drill', x: 0, y: 12, w: 3, h: 5, minW: 2, minH: 4 },
    { i: 'failure_reasons', x: 0, y: 17, w: 3, h: 6, minW: 2, minH: 4 },
    { i: 'recent_releases', x: 3, y: 14, w: 5, h: 5, minW: 3, minH: 3 },
    { i: 'backup_records', x: 3, y: 19, w: 5, h: 5, minW: 3, minH: 4 },
    { i: 'quick_actions', x: 0, y: 23, w: 3, h: 5, minW: 2, minH: 3 },
    { i: 'health_patrol', x: 3, y: 24, w: 5, h: 6, minW: 3, minH: 4 },
    { i: 'release_governance', x: 0, y: 28, w: 3, h: 6, minW: 2, minH: 4 },
  ],
  sm: [
    // 移动端：单列堆叠
    { i: 'mainline_health', x: 0, y: 0, w: 1, h: 6, minW: 1, minH: 4 },
    { i: 'stage_status', x: 0, y: 6, w: 1, h: 6, minW: 1, minH: 4 },
    { i: 'seal_backup', x: 0, y: 12, w: 1, h: 6, minW: 1, minH: 4 },
    { i: 'blocked_gates', x: 0, y: 18, w: 1, h: 6, minW: 1, minH: 4 },
    { i: 'recent_failures', x: 0, y: 24, w: 1, h: 8, minW: 1, minH: 5 },
    { i: 'recovery_drill', x: 0, y: 32, w: 1, h: 5, minW: 1, minH: 4 },
    { i: 'failure_reasons', x: 0, y: 37, w: 1, h: 6, minW: 1, minH: 4 },
    { i: 'recent_releases', x: 0, y: 43, w: 1, h: 5, minW: 1, minH: 3 },
    { i: 'backup_records', x: 0, y: 48, w: 1, h: 5, minW: 1, minH: 4 },
    { i: 'quick_actions', x: 0, y: 53, w: 1, h: 5, minW: 1, minH: 3 },
    { i: 'health_patrol', x: 0, y: 58, w: 1, h: 6, minW: 1, minH: 4 },
    { i: 'release_governance', x: 0, y: 64, w: 1, h: 6, minW: 1, minH: 4 },
  ],
};

export default function FactoryStatus() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [versionPrefix, setVersionPrefix] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Drilldown state
  const [gateDrilldown, setGateDrilldown] = useState<any[] | null>(null);
  const [gateDrillLoading, setGateDrillLoading] = useState(false);
  const [failureDrilldown, setFailureDrilldown] = useState<any[] | null>(null);
  const [failureDrillLoading, setFailureDrillLoading] = useState(false);
  const [activeStepKey, setActiveStepKey] = useState<string | null>(null);
  const [backupExpanded, setBackupExpanded] = useState(false);

  // v5.2.0: Incident & Timeline
  const [incident, setIncident] = useState<any>(null);
  const [incidentLoading, setIncidentLoading] = useState(false);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showIncident, setShowIncident] = useState(false);

  // v7.2.1: content-based width detection to handle sidebar-offset cases
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [contentWidth, setContentWidth] = useState<number>(1200);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width;
      if (width && width > 0) setContentWidth(width);
    });
    observer.observe(el);
    setContentWidth(el.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);

  const canUseLayoutEditor = contentWidth >= 1200; // react-grid-layout only when user clicks edit AND screen is wide enough
  const [layoutEdit, setLayoutEdit] = useState(false);
  const shouldUseLayoutEditor = layoutEdit && canUseLayoutEditor;

  // Default: CSS Grid, never reads saved layout. Only loads saved layout when user enters edit mode.
  const [layouts, setLayouts] = useState<LayoutConfig>(DEFAULT_LAYOUTS);

  // When user clicks edit AND screen is wide enough: load saved layout
  useEffect(() => {
    if (layoutEdit && canUseLayoutEditor) {
      const saved = loadLayout(LAYOUT_KEY);
      if (saved) setLayouts(saved);
    }
  }, [layoutEdit, canUseLayoutEditor]);

  // Auto-exit edit mode when content shrinks below 1200px
  useEffect(() => {
    if (!canUseLayoutEditor && layoutEdit) setLayoutEdit(false);
  }, [canUseLayoutEditor, layoutEdit]);

  // 布局持久化 — only save when in edit mode
  useEffect(() => {
    if (layoutEdit && canUseLayoutEditor) saveLayout(LAYOUT_KEY, layouts);
  }, [layouts, layoutEdit, canUseLayoutEditor]);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setGateDrilldown(null); setFailureDrilldown(null); setIncident(null); setTimeline([]); setShowTimeline(false); setShowIncident(false);
    try {
      const params = new URLSearchParams({ time_range: timeRange });
      if (versionPrefix) params.set('version_prefix', versionPrefix);
      if (activeOnly) params.set('active_only', 'true');
      const r = await fetch(`${API}/factory/status?${params}`);
      const d = await r.json();
      setStatus(d);
    } catch {}
    setLoading(false);
  }, [timeRange, versionPrefix, activeOnly]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  // ── Gate Drilldown ────────────────────────────────────────────────────────
  const openGateDrilldown = async (gateName: string) => {
    setGateDrillLoading(true);
    try {
      const r = await fetch(`${API}/gates/drilldown?gate_name=${gateName}&status=blocked&time_range=${timeRange}`);
      const d = await r.json();
      setGateDrilldown(d.ok ? d.gates : []);
    } catch { setGateDrilldown([]); }
    setGateDrillLoading(false);
  };

  // ── Failure Drilldown ─────────────────────────────────────────────────────
  const openFailureDrilldown = async (stepKey?: string) => {
    setFailureDrillLoading(true);
    setActiveStepKey(stepKey || null);
    try {
      const url = stepKey
        ? `${API}/factory/failures?time_range=${timeRange}&step_key=${encodeURIComponent(stepKey)}`
        : `${API}/factory/failures?time_range=${timeRange}`;
      const r = await fetch(url);
      const d = await r.json();
      setFailureDrilldown(d.ok ? d.failures : []);
    } catch { setFailureDrilldown([]); }
    setFailureDrillLoading(false);
  };

  // ── v5.2.0: Incident Drilldown ──────────────────────────────────────────────
  const openIncident = async (jobId: string, type: 'failure' | 'gate_block' = 'failure') => {
    setIncidentLoading(true);
    setShowIncident(true);
    try {
      const r = await fetch(`${API}/incident?id=${jobId}&type=${type}`);
      const d = await r.json();
      setIncident(d.ok ? d.incident : null);
    } catch { setIncident(null); }
    setIncidentLoading(false);
  };

  const openTimeline = async (jobId?: string, gateCheckId?: string) => {
    setTimelineLoading(true);
    setShowTimeline(true);
    try {
      const url = jobId
        ? `${API}/timeline?job_id=${jobId}&limit=50`
        : `${API}/timeline?gate_check_id=${gateCheckId}&limit=50`;
      const r = await fetch(url);
      const d = await r.json();
      setTimeline(d.ok ? d.events : []);
    } catch { setTimeline([]); }
    setTimelineLoading(false);
  };

  const { mainline_health, stage_counts, blocked_gates, recent_failures,
    failure_reasons, recent_releases, recent_backups, recent_recoveries,
    real_backup, stage_by_status } = status || {};

  // 卡片内容定义
  const cards = useMemo(() => {
    if (!status) return [];
    return [
      {
        id: 'mainline_health',
        content: (
          <SectionCard className={`role-card ${roleClass('exec')}`} title="主线健康度" description={`${timeRange} 视图`}>
            <div className="factory-stack">
              {[
                { label: 'Evaluations', count: mainline_health?.evaluations || 0, tone: 'green', path: '/evaluations' },
                { label: 'Artifacts', count: mainline_health?.artifacts || 0, tone: 'amber', path: '/artifacts' },
                { label: '已晋升', count: mainline_health?.promotions_passed || 0, tone: 'blue', path: '/artifacts' },
                { label: 'Releases', count: mainline_health?.releases || 0, tone: 'purple', path: '/artifacts' },
              ].map((s) => (
                <Link key={s.label} to={s.path} className="factory-inline-link">
                  <span className="factory-inline-label">{s.label}</span>
                  <span className={`factory-inline-count tone-${s.tone}`}>{s.count}</span>
                </Link>
              ))}
              <div className="factory-divider-top">
                {[
                  { label: '阻塞 Gate', count: mainline_health?.blocked_gates || 0, warn: true, path: '#' },
                  { label: '挂起审批', count: mainline_health?.pending_approvals || 0, warn: true, path: '/approvals' },
                  { label: `${timeRange} 失败`, count: mainline_health?.recent_failures_24h || 0, warn: true, path: '#' },
                ].map((s) => (
                  <Link key={s.label} to={s.path} className="factory-inline-link">
                    <span className="factory-inline-label">{s.label}</span>
                    <span className={`factory-inline-count ${s.warn && s.count > 0 ? 'tone-red' : 'tone-green'}`}>{s.count}</span>
                  </Link>
                ))}
              </div>
            </div>
          </SectionCard>
        ),
      },
      {
        id: 'stage_status',
        content: (
          <SectionCard className={`role-card ${roleClass('train')}`} title="主线阶段状态" description={`${timeRange} 视图`}>
            <div className="factory-stage-flow">
              {[
                { label: 'Evaluations', count: stage_counts?.evaluations || 0, path: '/evaluations', tone: 'green' },
                { label: 'Artifacts', count: stage_counts?.artifacts || 0, path: '/artifacts', tone: 'amber' },
                { label: 'Promotions', count: mainline_health?.promotions_passed || 0, path: '/artifacts', tone: 'blue' },
                { label: 'Releases', count: stage_counts?.releases || 0, path: '/artifacts', tone: 'purple' },
              ].map((s, i) => (
                <React.Fragment key={s.label}>
                  <Link to={s.path} className={`factory-stage-card tone-${s.tone}`}>
                    <div className={`factory-stage-count tone-${s.tone}`}>{s.count}</div>
                    <div className={`factory-stage-label tone-${s.tone}`}>{s.label}</div>
                  </Link>
                  {i < 3 && <span className="factory-stage-arrow">→</span>}
                </React.Fragment>
              ))}
            </div>
          </SectionCard>
        ),
      },
      {
        id: 'seal_backup',
        content: real_backup ? (
          <SectionCard className={`role-card ${roleClass('gov')}`} title="封板备份" description="当前封板产物">
            <div className="factory-list-drill">
              <div className="factory-seal-tag" title={real_backup.seal_tag}>🔒 {real_backup.seal_tag}</div>
              {backupExpanded ? (
                <>
                  <div className="factory-backup-item">
                    <div className="factory-backup-label">DB 快照</div>
                    <div className="factory-backup-value mono" title={real_backup.db_snapshot_path}>{real_backup.db_snapshot_path.split('\\').pop()}</div>
                  </div>
                  <div className="factory-backup-item">
                    <div className="factory-backup-label">SHA256</div>
                    <code className="factory-backup-value mono">{real_backup.db_sha256.slice(0, 20)}...</code>
                  </div>
                  <div className="factory-backup-item">
                    <div className="factory-backup-label">大小</div>
                    <div>{fmtSize(real_backup.db_size_bytes)}</div>
                  </div>
                  <div className="factory-backup-item">
                    <div className="factory-backup-label">Manifest</div>
                    <div className="factory-backup-value" title={real_backup.seal_manifest_path}>{real_backup.seal_manifest_path.split('\\').pop()}</div>
                  </div>
                  <div className="factory-backup-item">
                    <div className="factory-backup-label">ZIP</div>
                    <div className="factory-backup-value" title={real_backup.zip_path}>{real_backup.zip_path.split('\\').pop()}</div>
                  </div>
                  <div className="factory-backup-cmd">
                    恢复命令
                    <div className="factory-backup-value mono">
                      {real_backup.recovery_commands.db_restore.split('"')[1]?.split('\\').pop() || '见文档'}
                    </div>
                  </div>
                </>
              ) : (
                <div className="factory-muted-sm">
                  DB: {fmtSize(real_backup.db_size_bytes)} · SHA: {real_backup.db_sha256.slice(0, 8)}...
                </div>
              )}
              <button className="ui-btn ui-btn-ghost ui-btn-xs" onClick={() => setBackupExpanded(!backupExpanded)}>
                {backupExpanded ? '收起' : '展开详情'}
              </button>
              <Link to="/audit" className="factory-audit-link center">📋 查看审计</Link>
            </div>
          </SectionCard>
        ) : (
          <SectionCard className={`role-card ${roleClass('gov')}`} title="封板备份" description="当前封板产物">
            <div className="factory-muted-sm">暂无封板备份</div>
          </SectionCard>
        ),
      },
      {
        id: 'blocked_gates',
        content: (
          <SectionCard className={`role-card ${roleClass('risk')}`} title={`阻塞 Gate (${timeRange})`} description="点击查看详情">
            {!Array.isArray(blocked_gates) || blocked_gates.length === 0 ? (
              <div className="factory-empty-ok">✅ 无阻塞</div>
            ) : (
              <div className="factory-list-compact">
                {blocked_gates.map((g: any) => (
                  <div key={g.gate_name}
                    onClick={() => openGateDrilldown(g.gate_name)}
                    className="factory-click-item">
                    <span className="factory-click-label warn">{GATE_LABELS[g.gate_name] || g.gate_name}</span>
                    <span className="factory-click-value warn">{g.c}</span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        ),
      },
      {
        id: 'recent_failures',
        content: (
          <SectionCard className={`role-card ${roleClass('risk')}`} title={`最近失败任务 (${timeRange})`} description="点击行查看根因详情">
            {!Array.isArray(recent_failures) || recent_failures.length === 0 ? (
              <div className="factory-empty-ok">✅ 无失败</div>
            ) : (
              <div className="factory-list-compact">
                {recent_failures.slice(0, 8).map((f: any) => (
                  <div key={f.id} onClick={() => openIncident(f.id, 'failure')} className="factory-failure-row">
                    <div className="factory-failure-head">
                      <span className="factory-failure-name">{f.name}</span>
                      <span className="factory-muted">{fmtTs(f.updated_at)}</span>
                    </div>
                    {f.error_message && <div className="factory-ellipsis-error">{f.error_message.slice(0, 120)}</div>}
                  </div>
                ))}
                <Link to="/audit" className="factory-audit-link">→ 查看审计日志</Link>
              </div>
            )}
          </SectionCard>
        ),
      },
      {
        id: 'recovery_drill',
        content: (
          <SectionCard className={`role-card ${roleClass('gov')}`} title="恢复演练" description="最近演练记录">
            {!Array.isArray(recent_recoveries) || recent_recoveries.length === 0 ? (
              <div className="factory-muted-sm">暂无演练记录</div>
            ) : (
              <div className="factory-list-compact">
                {recent_recoveries.map((r: any) => (
                  <div key={r.id} className="factory-recovery-row">
                    <div className="factory-recovery-head">
                      <span className={r.status === 'success' ? 'factory-status-success' : 'factory-status-danger'}>
                        {r.recovery_type === 'drill' ? '🔧 演练' : '↩️ 回滚'}
                      </span>
                      <span className="factory-drill-time">{fmtTs(r.performed_at)}</span>
                    </div>
                    <div className="factory-meta-xxs">ID: {r.id.slice(0, 12)}...</div>
                    <div className="factory-meta-xxs text-secondary">{r.status === 'success' ? '✅ 成功' : '❌ 失败'}</div>
                  </div>
                ))}
                <Link to="/audit" className="factory-audit-link center">📋 审计</Link>
              </div>
            )}
          </SectionCard>
        ),
      },
      {
        id: 'failure_reasons',
        content: (
          <SectionCard className={`role-card ${roleClass('risk')}`} title={`失败原因聚合 (${timeRange})`} description="点击查看任务">
            {!Array.isArray(failure_reasons) || failure_reasons.length === 0 ? (
              <div className="factory-empty-ok">✅ 无失败</div>
            ) : (
              <div className="factory-list-tight">
                {failure_reasons.map((f: any) => (
                  <div key={f.step_key}
                    onClick={() => openFailureDrilldown(f.step_key)}
                    className="factory-click-item">
                    <span className="factory-click-step">{f.step_key || 'unknown'}</span>
                    <span className="factory-click-mini">{f.c}</span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        ),
      },
      {
        id: 'recent_releases',
        content: (
          <SectionCard className={`role-card ${roleClass('gov')}`} title="最近发布" description={`${timeRange} 内`}>
            {!Array.isArray(recent_releases) || recent_releases.length === 0 ? (
              <div className="factory-muted-sm">暂无发布</div>
            ) : (
              <div className="factory-list-compact">
                {recent_releases.map((r: any) => (
                  <div key={r.id} className="factory-release-row">
                    <div>
                      <span className="factory-release-name">{r.release_name}</span>
                      <span className="factory-release-by">{r.sealed_by}</span>
                    </div>
                    <span className="factory-drill-time">{fmtTs(r.sealed_at)}</span>
                  </div>
                ))}
                <Link to="/audit" className="factory-audit-link">→ 查看审计</Link>
              </div>
            )}
          </SectionCard>
        ),
      },
      {
        id: 'backup_records',
        content: (
          <SectionCard className={`role-card ${roleClass('data')}`} title="备份记录" description={`${timeRange} 内`}>
            {!Array.isArray(recent_backups) || recent_backups.length === 0 ? (
              <div className="factory-empty-warn">⚠️ 无备份记录</div>
            ) : (
              <div className="factory-list-compact">
                {recent_backups.map((b: any) => (
                  <div key={b.id} className="factory-backup-row">
                    <span className="factory-status-success">💾</span>
                    <span className="factory-backup-row-main">{b.result || b.action}</span>
                    <span className="factory-backup-row-time">{fmtTs(b.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        ),
      },
      {
        id: 'quick_actions',
        content: (
          <SectionCard className={`role-card ${roleClass('gov')}`} title="快速操作">
            <div className="factory-quick-grid">
              {[
                { to: '/artifacts', label: '📦', desc: '产物' },
                { to: '/approvals', label: '✅', desc: '审批' },
                { to: '/audit', label: '📋', desc: '审计' },
                { to: '/evaluations', label: '📊', desc: '评估' },
              ].map(a => (
                <Link key={a.to} to={a.to} className="factory-quick-item">
                  <span className="factory-quick-icon">{a.label}</span>
                  <span className="factory-quick-text">{a.desc}</span>
                </Link>
              ))}
            </div>
          </SectionCard>
        ),
      },
      {
        id: 'health_patrol',
        content: (
          <SectionCard className={`role-card ${roleClass('risk')}`} title="健康巡检" description="Health Patrol">
            <HealthPatrolPanel timeRange={timeRange} />
          </SectionCard>
        ),
      },
      {
        id: 'release_governance',
        content: (
          <SectionCard className={`role-card ${roleClass('gov')}`} title="发布治理" description="Stable / Candidate / Rollback">
            <ReleaseGovernancePanel timeRange={timeRange} versionPrefix={versionPrefix} />
          </SectionCard>
        ),
      },
    ];
  }, [status, timeRange, mainline_health, stage_counts, blocked_gates, recent_failures, failure_reasons, recent_releases, recent_backups, recent_recoveries, real_backup, backupExpanded, openGateDrilldown, openFailureDrilldown, openIncident]);

  if (!status) return <div className="factory-status-loading">加载中...</div>;

  return (
    <div className="page-root factory-status-page" ref={contentRef}>
      <PageHeader
        title="工厂运行态"
        subtitle={`Production Readiness Dashboard · ${timeRange === '24h' ? '24小时' : timeRange === '7d' ? '7天' : '30天'}`}
        actions={
          <div className="factory-status-actions">
            {/* Version Prefix Filter */}
            <select className="factory-status-select-sm" value={versionPrefix} onChange={e => setVersionPrefix(e.target.value)}>
              {VERSION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {/* Active Only Toggle */}
            <button className={`factory-status-toggle-btn ${activeOnly ? 'active' : ''}`} onClick={() => setActiveOnly(!activeOnly)}>
              {activeOnly ? '仅活跃' : '全部'}
            </button>
            {/* Time Range Filter */}
            <div className="factory-status-time-range">
              {TIME_RANGES.map(tr => (
                <button key={tr.value}
                  onClick={() => setTimeRange(tr.value as any)}
                  className={`factory-status-time-btn ${timeRange === tr.value ? 'active' : ''}`}
                >{tr.label}</button>
              ))}
            </div>
            <button className="ui-btn ui-btn-ghost ui-btn-sm" onClick={fetchStatus} disabled={loading}>
              {loading ? '...' : '↻'}
            </button>
            <button
              className={`ui-btn ui-btn-sm ${layoutEdit ? 'ui-btn-warning' : 'ui-btn-outline'}`}
              onClick={() => setLayoutEdit((v) => !v)}
              disabled={!canUseLayoutEditor}
              title={!canUseLayoutEditor ? '请在大屏宽度下编辑布局' : ''}
            >
              {layoutEdit ? '退出布局编辑' : '布局编辑'}
            </button>
            <button
              className="ui-btn ui-btn-outline ui-btn-sm"
              onClick={() => {
                clearAllLayouts();
                setLayouts(DEFAULT_LAYOUTS);
              }}
            >
              重置布局
            </button>
          </div>
        }
      />

      {loading && !status ? (
        <div className="factory-status-loading">加载中...</div>
      ) : shouldUseLayoutEditor ? (
        <div>
          <div style={{ padding: '4px 8px', fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: 4, marginBottom: 8, display: 'inline-block' }}>
            layoutMode: react-grid-edit · contentWidth: {Math.round(contentWidth)}px
          </div>
          <WorkspaceGrid
            editable={layoutEdit}
            layouts={layouts}
            cards={cards}
            onChange={setLayouts}
          />
        </div>
      ) : (
        <div>
          <div style={{ padding: '4px 8px', fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: 4, marginBottom: 8, display: 'inline-block' }}>
            layoutMode: css-grid · contentWidth: {Math.round(contentWidth)}px
          </div>
          <div className="factory-status-responsive-grid">
            {cards.map(c => (
              <div key={c.id} className="factory-status-grid-cell">
                {c.content}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drilldown Panels - 浮动覆盖层 */}
      {gateDrilldown !== null && (
        <DrilldownPanel
          title="Gate 阻塞详情"
          subtitle={`${timeRange} 内阻塞记录 · ${gateDrilldown.length} 条`}
          loading={gateDrillLoading}
          actions={<button className="ui-btn ui-btn-ghost ui-btn-xs" onClick={() => setGateDrilldown(null)}>关闭</button>}
        >
          <div className="factory-list-drill">
            {gateDrilldown.length === 0 ? (
              <div className="factory-drill-empty">无阻塞记录</div>
            ) : gateDrilldown.map((g: any) => (
              <div key={g.id} className="factory-drill-card">
                <div className="factory-drill-head">
                  <span className="factory-drill-title">{GATE_LABELS[g.gate_name] || g.gate_name}</span>
                  <span className="factory-drill-time">{fmtTs(g.checked_at)}</span>
                </div>
                <div className="factory-drill-meta">
                  <span className="factory-drill-meta-label">实体: </span>
                  <code className="factory-drill-code">{g.entity_id?.slice(0, 12)}...</code>
                </div>
                {g.fail_reasons?.length > 0 && (
                  <div className="factory-drill-danger">✗ {g.fail_reasons.join('; ')}</div>
                )}
                <div className="factory-drill-foot">
                  <Link to="/audit" className="factory-audit-link xs">📋 审计</Link>
                </div>
              </div>
            ))}
          </div>
        </DrilldownPanel>
      )}

      {failureDrilldown !== null && (
        <DrilldownPanel
          title="失败任务详情"
          subtitle={`${activeStepKey ? `step: ${activeStepKey}` : '全部失败'} · ${failureDrilldown.length} 条`}
          loading={failureDrillLoading}
          actions={<button className="ui-btn ui-btn-ghost ui-btn-xs" onClick={() => setFailureDrilldown(null)}>关闭</button>}
        >
          <div className="factory-list-drill">
            {failureDrilldown.length === 0 ? (
              <div className="factory-drill-empty">无失败记录</div>
            ) : failureDrilldown.map((f: any) => (
              <div key={f.id} className="factory-drill-card">
                <div className="factory-drill-head">
                  <span className="factory-failure-name">{f.name}</span>
                  <span className="factory-muted">{fmtTs(f.updated_at)}</span>
                </div>
                {f.step_key && <div className="factory-step-line">步骤: {f.step_key}</div>}
                {f.experiment_id && <div className="factory-exp-line">实验: {f.experiment_id.slice(0, 12)}...</div>}
                {f.error_message && (
                  <div className="factory-error-box">
                    {f.error_message}
                  </div>
                )}
                <div className="factory-links-row">
                  <Link to="/audit" className="factory-audit-link xs">📋 审计</Link>
                  <Link to="/workflow-jobs" className="factory-audit-link xs">⚙️ 工作流</Link>
                </div>
              </div>
            ))}
          </div>
        </DrilldownPanel>
      )}

      {showIncident && (
        <DrilldownPanel
          title="故障详情"
          subtitle={incident?.incident_type || '加载中'}
          loading={incidentLoading}
          actions={<button className="ui-btn ui-btn-ghost ui-btn-xs" onClick={() => { setShowIncident(false); setIncident(null); }}>关闭</button>}
        >
          {incident ? (
            <IncidentDetail
              incident={incident}
              onTimelineClick={() => openTimeline(incident.root_entity_id)}
              onAuditClick={() => setShowIncident(false)}
              onClose={() => { setShowIncident(false); setIncident(null); }}
            />
          ) : (
            <div className="factory-empty-panel">无数据</div>
          )}
        </DrilldownPanel>
      )}

      {showTimeline && (
        <DrilldownPanel
          title="根因时间线"
          subtitle={`${timeline.length} 个事件`}
          loading={timelineLoading}
          actions={<button className="ui-btn ui-btn-ghost ui-btn-xs" onClick={() => { setShowTimeline(false); setTimeline([]); }}>关闭</button>}
        >
          <TimelinePanel events={timeline} loading={timelineLoading} maxHeight="300px" />
        </DrilldownPanel>
      )}
    </div>
  );
}
