import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService, Run, RunStep, RunLog } from '../services/api';
import { StatusBadge, PageHeader, SectionCard, EmptyState, InfoTable, MainlineChainStrip, EntityLinkChips } from '../components/ui';
import WorkspaceGrid from '../layout/WorkspaceGrid';
import { clearLayout, loadLayout, saveLayout, type LayoutConfig } from '../layout/layoutStorage';
import '../components/ui/shared.css';
import './Runs.css';

type RunTab = 'overview' | 'steps' | 'logs' | 'artifacts' | 'raw';

const STATUS_COLORS: Record<string, string> = {
  queued: '#6b7280', running: '#3b82f6', success: '#10b981',
  failed: '#ef4444', cancelled: '#9ca3af', paused: '#f59e0b',
};
const STATUS_LABELS: Record<string, string> = {
  queued: '排队中', running: '执行中', success: '成功',
  failed: '失败', cancelled: '已取消', paused: '暂停',
};
const SOURCE_LABELS: Record<string, string> = {
  manual: '手动', task: '任务', training: '训练',
  evaluation: '评估', deployment: '部署', template: '模板',
};
const EXECUTOR_LABELS: Record<string, string> = {
  mock: 'Mock', local: 'Local', script: 'Script', openclaw: 'OpenClaw',
};

// Workspace layout key
const LAYOUT_KEY = 'runs-detail';

// Default layouts for detail workspace cards
const DEFAULT_LAYOUTS: LayoutConfig = {
  lg: [
    { i: 'run_identity', x: 0, y: 0, w: 6, h: 5, minW: 4, minH: 4 },
    { i: 'run_status', x: 6, y: 0, w: 6, h: 5, minW: 4, minH: 4 },
    { i: 'source_info', x: 0, y: 5, w: 6, h: 5, minW: 4, minH: 4 },
    { i: 'executor_info', x: 6, y: 5, w: 6, h: 5, minW: 4, minH: 4 },
    { i: 'time_info', x: 0, y: 10, w: 6, h: 5, minW: 4, minH: 4 },
    { i: 'workspace_notes', x: 6, y: 10, w: 6, h: 5, minW: 4, minH: 4 },
    { i: 'error_recovery', x: 0, y: 15, w: 6, h: 4, minW: 4, minH: 3 },
    { i: 'related_objects', x: 6, y: 15, w: 6, h: 4, minW: 4, minH: 3 },
    { i: 'mainline_chain', x: 0, y: 19, w: 12, h: 5, minW: 6, minH: 4 },
  ],
  md: [
    { i: 'run_identity', x: 0, y: 0, w: 4, h: 5, minW: 3, minH: 4 },
    { i: 'run_status', x: 4, y: 0, w: 4, h: 5, minW: 3, minH: 4 },
    { i: 'source_info', x: 0, y: 5, w: 4, h: 5, minW: 3, minH: 4 },
    { i: 'executor_info', x: 4, y: 5, w: 4, h: 5, minW: 3, minH: 4 },
    { i: 'time_info', x: 0, y: 10, w: 4, h: 5, minW: 3, minH: 4 },
    { i: 'workspace_notes', x: 4, y: 10, w: 4, h: 5, minW: 3, minH: 4 },
    { i: 'error_recovery', x: 0, y: 15, w: 4, h: 4, minW: 3, minH: 3 },
    { i: 'related_objects', x: 4, y: 15, w: 4, h: 4, minW: 3, minH: 3 },
    { i: 'mainline_chain', x: 0, y: 19, w: 8, h: 5, minW: 4, minH: 4 },
  ],
  sm: [
    { i: 'run_identity', x: 0, y: 0, w: 1, h: 5, minW: 1, minH: 4 },
    { i: 'run_status', x: 0, y: 5, w: 1, h: 5, minW: 1, minH: 4 },
    { i: 'source_info', x: 0, y: 10, w: 1, h: 5, minW: 1, minH: 4 },
    { i: 'executor_info', x: 0, y: 15, w: 1, h: 5, minW: 1, minH: 4 },
    { i: 'time_info', x: 0, y: 20, w: 1, h: 5, minW: 1, minH: 4 },
    { i: 'workspace_notes', x: 0, y: 25, w: 1, h: 5, minW: 1, minH: 4 },
    { i: 'error_recovery', x: 0, y: 30, w: 1, h: 4, minW: 1, minH: 3 },
    { i: 'related_objects', x: 0, y: 34, w: 1, h: 4, minW: 1, minH: 3 },
    { i: 'mainline_chain', x: 0, y: 38, w: 1, h: 5, minW: 1, minH: 4 },
  ],
};

function fmt(s?: string | null) {
  if (!s) return '—';
  try { return new Date(s).toLocaleString('zh-CN'); } catch { return s; }
}

function RunListItem({ r, selected, onClick }: { r: Run; selected: boolean; onClick: () => void }) {
  return (
    <div className={`run-list-item${selected ? ' selected' : ''}`} onClick={onClick}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="run-list-name">{r.name}</div>
        <div className="run-list-sub">{r.source_type ? SOURCE_LABELS[r.source_type] || r.source_type : '—'} · {r.run_code} · {fmt(r.created_at)}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: STATUS_COLORS[r.status] || '#6b7280' }}>{STATUS_LABELS[r.status] || r.status}</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.executor_type ? EXECUTOR_LABELS[r.executor_type] || r.executor_type : '—'}</span>
      </div>
    </div>
  );
}

export default function Runs() {
  const navigate = useNavigate();
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [filter, setFilter] = useState({ q: '', status: '', source_type: '' });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);
  const [tab, setTab] = useState<RunTab>('overview');
  const [detailLoading, setDetailLoading] = useState(false);
  const [steps, setSteps] = useState<RunStep[]>([]);
  const [logs, setLogs] = useState<RunLog[]>([]);
  const [runArtifacts, setRunArtifacts] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState({
    name: '', source_type: 'manual' as string,
    executor_type: 'mock' as string,
    priority: 5, workspace_path: '', notes: '',
  });
  const [formError, setFormError] = useState('');

  // Workspace layout state
  const [layoutEdit, setLayoutEdit] = useState(false);
  const [layouts, setLayouts] = useState<LayoutConfig>(DEFAULT_LAYOUTS);

  // Load saved layout
  useEffect(() => {
    const saved = loadLayout(LAYOUT_KEY);
    if (saved) {
      setLayouts(saved);
    }
  }, []);

  // Save layout on change
  const handleLayoutChange = useCallback((next: LayoutConfig) => {
    setLayouts(next);
    saveLayout(LAYOUT_KEY, next);
  }, []);

  // Reset layout
  const handleResetLayout = useCallback(() => {
    setLayouts(DEFAULT_LAYOUTS);
    clearLayout(LAYOUT_KEY);
  }, []);

  // ── Load list ───────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params: any = { limit: 50 };
      if (filter.q) params.q = filter.q;
      if (filter.status) params.status = filter.status;
      if (filter.source_type) params.source_type = filter.source_type;
      const res = await apiService.getRuns(params);
      if (res.ok) setRuns(res.runs || []);
      else setError(res.error || '加载失败');
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  // ── Auto-select first ─────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && runs.length > 0 && !selectedId) {
      const saved = localStorage.getItem('agi_factory_run_sel');
      const id = (saved && runs.find(r => r.id === saved)) ? saved : runs[0].id;
      setSelectedId(id);
    }
  }, [loading, runs]);

  // ── Load detail ───────────────────────────────────────────────────────
  const loadDetail = useCallback(async (r: Run) => {
    setDetailLoading(true);
    try {
      const [runRes, stepsRes, logsRes, artsRes] = await Promise.all([
        apiService.getRun(r.id),
        apiService.getRunSteps(r.id),
        apiService.getRunLogs(r.id, { limit: 50 }),
        apiService.getRunArtifacts(r.id),
      ]);
      if (runRes.ok) setSelectedRun(runRes.run);
      if (stepsRes.ok) setSteps(stepsRes.steps || []);
      if (logsRes.ok) setLogs(logsRes.logs || []);
      if (artsRes.ok) setRunArtifacts(artsRes.artifacts || []);
    } catch (e: any) { setError(e.message); }
    finally { setDetailLoading(false); }
  }, []);

  useEffect(() => {
    if (selectedId) {
      localStorage.setItem('agi_factory_run_sel', selectedId);
      const r = runs.find(x => x.id === selectedId);
      if (r) loadDetail(r);
    }
  }, [selectedId, loadDetail, runs]);

  const handleSelect = (r: Run) => { setSelectedId(r.id); setTab('overview'); };

  // ── Actions ───────────────────────────────────────────────────────────
  const handleAction = async (action: 'start' | 'cancel' | 'retry' | 'refresh', id: string) => {
    setActionLoading(id + action);
    try {
      let res;
      if (action === 'refresh') { await load(); if (selectedRun) loadDetail(selectedRun); return; }
      if (action === 'start') res = await apiService.startRun(id);
      else if (action === 'cancel') res = await apiService.cancelRun(id);
      else if (action === 'retry') res = await apiService.retryRun(id);
      else return;

      if (res?.ok) {
        setSuccess(`操作成功: ${action}`);
        await load();
        if (selectedRun?.id === id) {
          const r2 = await apiService.getRun(id);
          if (r2.ok) loadDetail(r2.run);
        }
      } else setError(res?.error || '操作失败');
    } catch (e: any) { setError(e.message); }
    finally { setActionLoading(null); }
  };

  const handleCreate = async () => {
    if (!form.name.trim()) { setFormError('请填写名称'); return; }
    setFormError('');
    const res = await apiService.createRun({ name: form.name, source_type: form.source_type as any, executor_type: form.executor_type as any, priority: form.priority, workspace_path: form.workspace_path, notes: form.notes });
    if (res.ok && res.run) {
      setSuccess(`Run「${res.run.name}」创建成功`);
      setShowCreate(false);
      setForm({ name: '', source_type: 'manual', executor_type: 'mock', priority: 5, workspace_path: '', notes: '' });
      await load();
      setSelectedId(res.run.id);
    } else setFormError(res.error || '创建失败');
  };

  const runningCount = runs.filter(r => r.status === 'running').length;
  const successCount = runs.filter(r => r.status === 'success').length;
  const failedCount = runs.filter(r => r.status === 'failed').length;

  const TABS: { key: RunTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'steps', label: `Steps (${steps.length})` },
    { key: 'logs', label: `Logs (${logs.length})` },
    { key: 'artifacts', label: `Artifacts (${runArtifacts.length})` },
    { key: 'raw', label: 'Raw JSON' },
  ];

  // Workspace cards for Overview tab
  const workspaceCards = useMemo(() => {
    if (!selectedRun) return [];
    return [
      {
        id: 'run_identity',
        content: (
          <InfoTable rows={[
            { label: 'ID', value: <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{selectedRun.id}</code> },
            { label: '名称', value: selectedRun.name },
            { label: 'Run Code', value: selectedRun.run_code },
          ]} />
        ),
      },
      {
        id: 'run_status',
        content: (
          <InfoTable rows={[
            { label: '状态', value: <StatusBadge s={STATUS_LABELS[selectedRun.status] || selectedRun.status} /> },
            { label: '优先级', value: String(selectedRun.priority) },
          ]} />
        ),
      },
      {
        id: 'source_info',
        content: (
          <InfoTable rows={[
            { label: '来源', value: selectedRun.source_type ? SOURCE_LABELS[selectedRun.source_type] || selectedRun.source_type : '—' },
            { label: '来源 ID', value: selectedRun.source_id ? <Link to={`/${selectedRun.source_type}s`}>{selectedRun.source_id}</Link> : '—' },
          ]} />
        ),
      },
      {
        id: 'executor_info',
        content: (
          <InfoTable rows={[
            { label: '执行器', value: selectedRun.executor_type ? EXECUTOR_LABELS[selectedRun.executor_type] || selectedRun.executor_type : '—' },
            { label: '执行器类型', value: selectedRun.executor_type || '—' },
          ]} />
        ),
      },
      {
        id: 'time_info',
        content: (
          <InfoTable rows={[
            { label: '创建时间', value: fmt(selectedRun.created_at) },
            { label: '开始时间', value: fmt(selectedRun.started_at) },
            { label: '结束时间', value: fmt(selectedRun.finished_at) },
          ]} />
        ),
      },
      {
        id: 'workspace_notes',
        content: (
          <InfoTable rows={[
            { label: '工作区', value: <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{selectedRun.workspace_path || '—'}</code> },
            { label: 'Notes', value: selectedRun.notes || '—' },
          ]} />
        ),
      },
      {
        id: 'error_recovery',
        content: (
          <InfoTable rows={[
            { label: '错误信息', value: selectedRun.error_message || '—' },
            { label: '恢复建议', value: selectedRun.status === 'failed' ? '检查错误信息后重试；必要时取消并重建。' : '当前状态无需恢复动作' },
          ]} />
        ),
      },
      {
        id: 'related_objects',
        content: (
          <EntityLinkChips
            label="关联"
            entities={[
              ...(selectedRun.source_id ? [{ type: selectedRun.source_type as any, id: selectedRun.source_id, label: SOURCE_LABELS[selectedRun.source_type] || selectedRun.source_type, status: undefined }] : []),
              ...(runArtifacts.length > 0 ? [{ type: 'artifact' as const, id: 'artifacts', label: `${runArtifacts.length} 个产物`, status: 'ready' }] : []),
            ]}
          />
        ),
      },
      {
        id: 'mainline_chain',
        content: (
          <MainlineChainStrip
            compact
            current={selectedRun.id}
            chain={[
              ...(selectedRun.source_id ? [{ type: selectedRun.source_type as any, id: selectedRun.source_id, label: SOURCE_LABELS[selectedRun.source_type] || selectedRun.source_type }] : []),
              { type: 'run', id: selectedRun.id, label: selectedRun.name, status: selectedRun.status },
              ...(runArtifacts.length > 0 ? [{ type: 'artifact' as const, id: 'artifacts', label: `${runArtifacts.length} 个产物` }] : []),
            ]}
          />
        ),
      },
    ];
  }, [selectedRun, runArtifacts]);

  return (
    <div className="page-root">
      <PageHeader
        title="运行记录"
        subtitle={`${runs.length} 条 · ${runningCount} 运行中 · ${successCount} 成功 · ${failedCount} 失败`}
        actions={
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="ui-btn ui-btn-primary" onClick={() => setShowCreate(true)}>+ 新建 Run</button>
          </div>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        <div className="run-root">
        {/* Left */}
        <div className="run-left">
          {/* Stats */}
          <SectionCard>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { label: 'Total', value: runs.length, color: 'var(--text-main)' },
                { label: 'Running', value: runningCount, color: '#3b82f6' },
                { label: 'Success', value: successCount, color: 'var(--success)' },
                { label: 'Failed', value: failedCount, color: 'var(--danger)' },
                { label: 'Queued', value: runs.filter(r => r.status === 'queued').length, color: 'var(--text-muted)' },
                { label: 'Cancelled', value: runs.filter(r => r.status === 'cancelled').length, color: 'var(--text-muted)' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: '8px 4px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Filters */}
          <SectionCard title="筛选">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input className="ui-input" placeholder="搜索名称..." value={filter.q} onChange={e => setFilter(f => ({ ...f, q: e.target.value }))} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <select className="ui-select" value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
                  <option value="">全部状态</option>{Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <select className="ui-select" value={filter.source_type} onChange={e => setFilter(f => ({ ...f, source_type: e.target.value }))}>
                  <option value="">全部来源</option>{Object.entries(SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
          </SectionCard>

          {/* List */}
          <SectionCard title={`运行记录 (${runs.length})`} actions={<button className="ui-btn ui-btn-ghost ui-btn-xs" onClick={load}>↻</button>}>
            <div style={{ maxHeight: 420, overflowY: 'auto' }}>
              {loading && <EmptyState message="加载中..." />}
              {!loading && runs.length === 0 && <EmptyState icon="▶" message="无运行记录" />}
              {!loading && runs.map(r => <RunListItem key={r.id} r={r} selected={selectedId === r.id} onClick={() => handleSelect(r)} />)}
            </div>
          </SectionCard>
        </div>

        {/* Right */}
        <div className="run-right">
          {error && <div className="ui-flash ui-flash-err">{error} <button className="ui-btn ui-btn-ghost ui-btn-xs" style={{ marginLeft: 8 }} onClick={() => setError(null)}>×</button></div>}
          {success && <div className="ui-flash ui-flash-ok">{success} <button className="ui-btn ui-btn-ghost ui-btn-xs" style={{ marginLeft: 8 }} onClick={() => setSuccess(null)}>×</button></div>}

          {selectedRun ? (
            <>
              {/* Header */}
              <SectionCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{selectedRun.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                      {selectedRun.id} · {selectedRun.run_code} · {selectedRun.source_type ? SOURCE_LABELS[selectedRun.source_type] || selectedRun.source_type : '—'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button className="ui-btn ui-btn-ghost ui-btn-sm" onClick={() => handleAction('refresh', selectedRun.id)}>刷新</button>
                    {selectedRun.status !== 'running' && <button className="ui-btn ui-btn-success ui-btn-sm" onClick={() => handleAction('start', selectedRun.id)} disabled={!!actionLoading}>{actionLoading ? '...' : 'Start'}</button>}
                    {selectedRun.status === 'running' && <button className="ui-btn ui-btn-warning ui-btn-sm" onClick={() => handleAction('cancel', selectedRun.id)} disabled={!!actionLoading}>{actionLoading ? '...' : 'Cancel'}</button>}
                    {['failed', 'cancelled'].includes(selectedRun.status) && <button className="ui-btn ui-btn-outline ui-btn-sm" onClick={() => handleAction('retry', selectedRun.id)} disabled={!!actionLoading}>{actionLoading ? '...' : 'Retry'}</button>}
                    <button className="ui-btn ui-btn-ghost ui-btn-sm" onClick={() => { setSelectedId(null); setSelectedRun(null); }}>取消选中</button>
                  </div>
                </div>
              </SectionCard>

              {/* Tabs */}
              <SectionCard>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 14 }}>
                  {TABS.map(t => (
                    <button
                      key={t.key}
                      onClick={() => setTab(t.key)}
                      style={{
                        padding: '5px 14px', border: 'none', borderRadius: 'var(--radius-md)',
                        cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-sans)',
                        background: tab === t.key ? 'var(--primary)' : 'var(--bg-app)',
                        color: tab === t.key ? '#fff' : 'var(--text-secondary)',
                        transition: 'background var(--t-fast)',
                      }}
                    >{t.label}</button>
                  ))}
                </div>

                {detailLoading && <EmptyState message="加载中..." icon="⏳" />}

                {!detailLoading && tab === 'overview' && (
                  <>
                    {/* Workspace Grid for cards */}
                    {workspaceCards.length > 0 && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>运行概览工作台</div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => setLayoutEdit(v => !v)}
                              style={{
                                padding: '6px 14px', background: layoutEdit ? 'rgba(34,211,238,0.15)' : 'var(--bg-elevated)',
                                border: `1px solid ${layoutEdit ? 'rgba(34,211,238,0.5)' : 'var(--border-light)'}`,
                                borderRadius: '6px', cursor: 'pointer', fontSize: 12, color: layoutEdit ? '#22d3ee' : 'var(--text-main)',
                              }}
                            >
                              {layoutEdit ? '✓ 完成编辑' : '✎ 编辑布局'}
                            </button>
                            {layoutEdit && (
                              <button
                                onClick={handleResetLayout}
                                style={{
                                  padding: '6px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)',
                                  borderRadius: '6px', cursor: 'pointer', fontSize: 12, color: 'var(--text-main)',
                                }}
                              >
                                ⟲ 恢复默认
                              </button>
                            )}
                          </div>
                        </div>
                        <WorkspaceGrid
                          editable={layoutEdit}
                          layouts={layouts}
                          cards={workspaceCards}
                          onChange={handleLayoutChange}
                        />
                      </>
                    )}
                  </>
                )}

                {!detailLoading && tab === 'steps' && (
                  steps.length === 0 ? <EmptyState icon="⚙" message="暂无步骤" /> : (
                    <div className="ui-table-wrap">
                      <table className="ui-table">
                        <thead><tr><th>#</th><th>Key</th><th>名称</th><th>状态</th><th>时长</th><th>开始</th><th>结束</th></tr></thead>
                        <tbody>{steps.sort((a, b) => (a.step_order ?? 0) - (b.step_order ?? 0)).map(s => (
                          <tr key={s.id}>
                            <td>{s.step_order ?? 0}</td>
                            <td><code style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{s.step_key || '—'}</code></td>
                            <td>{s.step_name || '—'}</td>
                            <td><StatusBadge s={STATUS_LABELS[s.status] || s.status} /></td>
                            <td>{s.duration_ms ? `${s.duration_ms}ms` : '—'}</td>
                            <td>{fmt(s.started_at)}</td>
                            <td>{fmt(s.finished_at)}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  )
                )}

                {!detailLoading && tab === 'logs' && (
                  logs.length === 0 ? <EmptyState icon="📋" message="暂无日志" /> : (
                    <div style={{ maxHeight: 400, overflowY: 'auto', background: '#1a1a2e', borderRadius: 'var(--radius-md)', padding: 12, fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.6 }}>
                      {logs.map(l => (
                        <div key={l.id} style={{ marginBottom: 2, display: 'flex', gap: 8 }}>
                          <span style={{ color: '#6a9955', whiteSpace: 'nowrap' }}>{fmt(l.created_at)}</span>
                          <span style={{ color: l.level === 'error' ? '#f48771' : l.level === 'warn' ? '#cca700' : '#569cd6', fontWeight: 600, minWidth: 50 }}>[{l.level}]</span>
                          <span style={{ color: '#d4d4d4' }}>{l.message}</span>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {!detailLoading && tab === 'artifacts' && (
                  runArtifacts.length === 0 ? <EmptyState icon="📦" message="暂无产物" /> : (
                    <div className="ui-table-wrap">
                      <table className="ui-table">
                        <thead><tr><th>Artifact ID</th><th>名称</th><th>关系</th><th>创建时间</th></tr></thead>
                        <tbody>{runArtifacts.map(a => (
                          <tr key={a.id}>
                            <td><code style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{a.id?.slice(0, 12)}...</code></td>
                            <td>{a.artifact_name || a.artifact_id?.slice(0, 12) || '—'}</td>
                            <td>{a.relation_type || 'output'}</td>
                            <td>{fmt(a.created_at)}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  )
                )}

                {!detailLoading && tab === 'raw' && (
                  <pre className="json-pre">{JSON.stringify(selectedRun, null, 2)}</pre>
                )}
              </SectionCard>
            </>
          ) : (
            <SectionCard>
              <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 32, opacity: 0.4, marginBottom: 8 }}>▶</div>
                从左侧选择一条运行记录查看详情
              </div>
            </SectionCard>
          )}
        </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="run-modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="run-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div className="run-modal-title">新建 Run</div>
              <button className="ui-btn ui-btn-ghost" onClick={() => setShowCreate(false)}>×</button>
            </div>
            {formError && <div className="ui-flash ui-flash-err" style={{ marginBottom: 12 }}>{formError}</div>}
            <div className="run-modal-row"><label className="run-modal-label">名称 *</label><input className="ui-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="My Run" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="run-modal-row"><label className="run-modal-label">来源</label><select className="ui-select" value={form.source_type} onChange={e => setForm({...form, source_type: e.target.value})}>{Object.entries(SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
              <div className="run-modal-row"><label className="run-modal-label">执行器</label><select className="ui-select" value={form.executor_type} onChange={e => setForm({...form, executor_type: e.target.value})}>{Object.entries(EXECUTOR_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
              <div className="run-modal-row"><label className="run-modal-label">优先级</label><input className="ui-input" type="number" value={form.priority} onChange={e => setForm({...form, priority: Number(e.target.value)})} /></div>
              <div className="run-modal-row"><label className="run-modal-label">工作区</label><input className="ui-input" value={form.workspace_path} onChange={e => setForm({...form, workspace_path: e.target.value})} style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} /></div>
            </div>
            <div className="run-modal-row"><label className="run-modal-label">Notes</label><textarea className="ui-input" rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="ui-btn ui-btn-primary" style={{ flex: 1 }} onClick={handleCreate}>Create</button>
              <button className="ui-btn ui-btn-ghost" onClick={() => setShowCreate(false)}>取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
