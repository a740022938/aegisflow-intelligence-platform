import React, { useState, useEffect, useCallback, useRef } from 'react';
import { apiService, Experiment } from '../services/api';
import type { TrainingConfig, TrainingRun, TrainingCheckpoint } from '../services/api';
import {
  StatusBadge, PageHeader, SidebarListPanel, DetailPanel,
  EmptyState, InfoTable,
} from '../components/ui';
import '../components/ui/shared.css';
import './Training.css';

function fmt(s?: string | null) {
  if (!s) return '—';
  try { return new Date(s).toLocaleString('zh-CN'); } catch { return s; }
}

// ── Experiment list item ───────────────────────────────────────────────────────
function ExpListItem({ exp, selectedId, onClick }: { exp: Experiment; selectedId: string | null; onClick: () => void }) {
  return (
    <div className={`exp-item${selectedId === exp.id ? ' selected' : ''}`} onClick={onClick}>
      <div className="exp-item-row">
        <span className="exp-item-name">{exp.name || exp.experiment_code}</span>
        <StatusBadge s={exp.status} />
      </div>
      <div className="exp-item-meta">{exp.experiment_code} · {fmt(exp.created_at)}</div>
    </div>
  );
}

// ── Training Run list item ─────────────────────────────────────────────────────
function RunListItem({ run, selectedId, onClick }: { run: TrainingRun; selectedId: string | null; onClick: () => void }) {
  const loss = run.summary_json?.best_loss;
  return (
    <div className={`exp-item${selectedId === run.id ? ' selected' : ''}`} onClick={onClick}>
      <div className="exp-item-row">
        <span className="exp-item-name">{run.name}</span>
        <StatusBadge s={run.status} />
      </div>
      <div className="exp-item-row" style={{ marginTop: 3 }}>
        <span className="exp-item-meta">{run.model_name || '—'}</span>
        {loss != null && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)' }}>{Number(loss).toFixed(4)}</span>}
      </div>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────
export default function Training() {
  // ── Experiments state (stable: selectedId = string, detailData = fresh object) ──
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  // selectedId: 始终是 string | null，与 experiments[] 中任何对象引用无关
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // detailData: 详情 API 的完整响应，fetch 后直接替换，null = 从未加载
  const [detailData, setDetailData] = useState<any>(null);
  // pageLoading: 列表加载中（遮盖左栏）
  const [pageLoading, setPageLoading] = useState(false);
  // detailLoading: 首次加载详情（遮盖右栏）
  const [detailLoading, setDetailLoading] = useState(false);
  // refreshing: 后台静默刷新（不遮盖右栏，只显示小指示器）
  const [refreshing, setRefreshing] = useState(false);
  // 轮询 interval ref（running 态 2s interval，停止时清空）
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // requestId：递增整数，过期请求拒绝更新 state
  const reqIdRef = useRef(0);

  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [formError, setFormError] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ experiment_code: '', name: '', dataset_id: '', template_code: 'train_eval_basic', command_text: '', work_dir: '', output_dir: '', notes: '', config_json: '{}', metrics_json: '{}' });
  const [newError, setNewError] = useState('');
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);
  const [tab, setTab] = useState('overview');

  // ── Training Runtime state ─────────────────────────────────────────────────
  const [view, setView] = useState<'experiments' | 'runtime'>('experiments');
  const [rtTab, setRtTab] = useState<'configs' | 'runs' | 'checkpoints' | 'artifacts'>('runs');
  const [rtSummary, setRtSummary] = useState<any>(null);
  const [rtConfigs, setRtConfigs] = useState<TrainingConfig[]>([]);
  const [rtRuns, setRtRuns] = useState<TrainingRun[]>([]);
  const [rtCheckpoints, setRtCheckpoints] = useState<TrainingCheckpoint[]>([]);
  const [rtArtifacts, setRtArtifacts] = useState<any[]>([]);
  const [rtLoading, setRtLoading] = useState(false);
  const [rtRunDetail, setRtRunDetail] = useState<any>(null);
  const [rtRunTab, setRtRunTab] = useState<'overview' | 'checkpoints' | 'raw'>('overview');
  const [rtShowNewCfg, setRtShowNewCfg] = useState(false);
  const [rtShowNewRun, setRtShowNewRun] = useState(false);
  const [rtNewCfg, setRtNewCfg] = useState({ config_code: '', name: '', model_name: 'resnet50', description: '' });
  const [rtNewCfgError, setRtNewCfgError] = useState('');
  const [rtNewRun, setRtNewRun] = useState({ name: '', model_name: 'resnet50', epochs: 3, steps_per_epoch: 5, delay_per_step: 300 });
  const [rtNewRunError, setRtNewRunError] = useState('');
  const [rtCreating, setRtCreating] = useState(false);

  // ── Stable state builders ────────────────────────────────────────────────
  const currentExp = detailData?.experiment as Experiment | undefined;

  function buildEditForm(e: Experiment) {
    return {
      experiment_code: e.experiment_code ?? '', name: e.name ?? '', status: e.status ?? 'draft',
      dataset_id: e.dataset_id ?? '', template_code: e.template_code ?? '',
      command_text: e.command_text ?? '', work_dir: e.work_dir ?? '',
      output_dir: e.output_dir ?? '', checkpoint_path: e.checkpoint_path ?? '',
      report_path: e.report_path ?? '', notes: e.notes ?? '',
      config_json: typeof e.config_json === 'string' ? e.config_json : JSON.stringify(e.config_json ?? {}, null, 2),
      metrics_json: typeof e.metrics_json === 'string' ? e.metrics_json : JSON.stringify(e.metrics_json ?? {}, null, 2),
    };
  }

  // ── Stop polling ────────────────────────────────────────────────────────
  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  // ── Start polling: only for running items, every 2s ────────────────────
  const startPollingIfRunning = useCallback((expId: string) => {
    const exp = experiments.find(e => e.id === expId);
    if (!exp || !['running', 'queued', 'pending'].includes(exp.status)) { stopPolling(); return; }
    stopPolling();
    pollRef.current = setInterval(async () => {
      setRefreshing(true);
      const myReqId = ++reqIdRef.current;
      try {
        const r = await apiService.getExperiment(expId);
        if (r.ok && reqIdRef.current === myReqId) {
          setDetailData(r);
          setEditForm(buildEditForm(r.experiment));
          // 若状态不再是 running，停止轮询
          if (!['running', 'queued', 'pending'].includes(r.experiment.status)) { stopPolling(); }
        }
      } catch {}
      setRefreshing(false);
    }, 2000);
  }, [experiments, stopPolling]);

  // ── Load list ───────────────────────────────────────────────────────────
  const loadExperiments = useCallback(async () => {
    setPageLoading(true);
    try {
      const r = await apiService.getExperiments({
        keyword: keyword || undefined,
        status: statusFilter || undefined,
      });
      if (r.ok) {
        setExperiments(r.experiments || []);
        // Auto-select first item if nothing selected yet
        const exps = r.experiments || [];
        if (exps.length > 0 && !selectedId) {
          setSelectedId(exps[0].id);
        }
      }
    } finally { setPageLoading(false); }
  }, [keyword, statusFilter]); // selectedId intentionally excluded to avoid stale closure

  useEffect(() => { loadExperiments(); }, [loadExperiments]);

  // ── Load detail (only when selectedId changes) ──────────────────────────
  const loadDetail = useCallback(async (expId: string) => {
    const myReqId = ++reqIdRef.current;
    // 首次加载遮盖右栏
    if (!detailData || detailData?.experiment?.id !== expId) {
      setDetailLoading(true);
    }
    try {
      const r = await apiService.getExperiment(expId);
      if (r.ok && reqIdRef.current === myReqId) {
        setDetailData(r);
        setEditForm(buildEditForm(r.experiment));
        setDetailLoading(false);
        // 根据状态决定是否轮询
        startPollingIfRunning(expId);
      }
    } catch (e: any) {
      if (reqIdRef.current === myReqId) { setDetailLoading(false); }
    }
  }, [detailData, startPollingIfRunning]);

  // 选中项 id 变化时加载详情
  useEffect(() => {
    if (selectedId) { loadDetail(selectedId); }
    else { setDetailData(null); setEditForm({}); stopPolling(); }
  }, [selectedId, loadDetail, stopPolling]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSelect = (e: Experiment) => {
    if (e.id === selectedId) return; // 无变化不触发
    stopPolling();
    setSelectedId(e.id);
    setEditing(false); setFormError(''); setJsonError(''); setTab('overview');
    // detailLoading 和 detailData 的清理由 useEffect [selectedId] 处理
  };

  const handleSave = async () => {
    if (!selectedId) return;
    setFormError(''); setJsonError('');
    try { JSON.parse(editForm.config_json); } catch { setJsonError('config_json 格式非法'); return; }
    try { JSON.parse(editForm.metrics_json); } catch { setJsonError('metrics_json 格式非法'); return; }
    setSaving(true);
    try {
      const r = await apiService.updateExperiment(selectedId, { ...editForm });
      if (r.ok) { setEditing(false); await loadDetail(selectedId); await loadExperiments(); }
      else { setFormError(r.error || '保存失败'); }
    } finally { setSaving(false); }
  };

  const handleStart = async () => {
    if (!selectedId) return;
    setStarting(true);
    try {
      const r = await apiService.startExperiment(selectedId);
      if (r.ok) { await loadDetail(selectedId); await loadExperiments(); setTab('task'); }
      else { alert('启动失败: ' + (r.error || '未知错误')); }
    } finally { setStarting(false); }
  };

  const handleRetry = async () => {
    if (!selectedId) return;
    setStarting(true);
    try {
      const r = await apiService.retryExperiment(selectedId);
      if (r.ok) { await loadDetail(selectedId); await loadExperiments(); setTab('task'); }
      else { alert('重试失败: ' + (r.error || '未知错误')); }
    } finally { setStarting(false); }
  };

  const handleCreate = async () => {
    setNewError('');
    if (!newForm.experiment_code.trim()) { setNewError('experiment_code 不能为空'); return; }
    if (!newForm.name.trim()) { setNewError('name 不能为空'); return; }
    try { JSON.parse(newForm.config_json); } catch { setNewError('config_json 格式非法'); return; }
    try { JSON.parse(newForm.metrics_json); } catch { setNewError('metrics_json 格式非法'); return; }
    setSaving(true);
    try {
      const r = await apiService.createExperiment({ ...newForm });
      if (r.ok && r.experiment) {
        setShowNew(false);
        setNewForm({ experiment_code: '', name: '', dataset_id: '', template_code: 'train_eval_basic', command_text: '', work_dir: '', output_dir: '', notes: '', config_json: '{}', metrics_json: '{}' });
        await loadExperiments();
        // 创建后直接用 id 选中（不走对象引用）
        setSelectedId(r.experiment.id);
      } else { setNewError(r.error || '创建失败'); }
    } finally { setSaving(false); }
  };

  const canRetry = currentExp && ['failed', 'cancelled'].includes(currentExp.status);

  // ── Training Runtime loaders ─────────────────────────────────────────────
  const rtLoadAll = useCallback(async () => {
    setRtLoading(true);
    try {
      const [sumR, cfgR, runR] = await Promise.all([apiService.getTrainingSummary(), apiService.listTrainingConfigs(), apiService.listTrainingRuns()]);
      if (sumR.ok) setRtSummary(sumR);
      if (cfgR.ok) setRtConfigs(cfgR.configs || []);
      if (runR.ok) setRtRuns(runR.runs || []);
    } finally { setRtLoading(false); }
  }, []);

  const loadRtRunDetail = useCallback(async (id: string) => {
    setRtLoading(true);
    try {
      const [runR, ckR] = await Promise.all([apiService.getTrainingRun(id), apiService.listCheckpoints({ run_id: id })]);
      if (runR.ok) setRtRunDetail({ ...runR, checkpoints: ckR.ok ? (ckR.checkpoints || []) : [] });
    } finally { setRtLoading(false); }
  }, []);

  useEffect(() => { if (view === 'runtime') rtLoadAll(); }, [view, rtLoadAll]);

  // ── Training Runtime handlers ─────────────────────────────────────────────
  const handleCreateRtConfig = async () => {
    setRtNewCfgError('');
    if (!rtNewCfg.config_code.trim()) { setRtNewCfgError('config_code 不能为空'); return; }
    if (!rtNewCfg.name.trim()) { setRtNewCfgError('name 不能为空'); return; }
    setRtCreating(true);
    try { const r = await apiService.createTrainingConfig(rtNewCfg); if (r.ok) { setRtShowNewCfg(false); setRtNewCfg({ config_code: '', name: '', model_name: 'resnet50', description: '' }); await rtLoadAll(); } else { setRtNewCfgError(r.error || '创建失败'); } }
    finally { setRtCreating(false); }
  };

  const handleCreateRtRun = async () => {
    setRtNewRunError('');
    if (!rtNewRun.name.trim()) { setRtNewRunError('name 不能为空'); return; }
    setRtCreating(true);
    try { const r = await apiService.createTrainingRun({ name: rtNewRun.name, model_name: rtNewRun.model_name, config_json: { epochs: rtNewRun.epochs, steps_per_epoch: rtNewRun.steps_per_epoch, delay_per_step: rtNewRun.delay_per_step } }); if (r.ok) { setRtShowNewRun(false); setRtNewRun({ name: '', model_name: 'resnet50', epochs: 3, steps_per_epoch: 5, delay_per_step: 300 }); await rtLoadAll(); } else { setRtNewRunError(r.error || '创建失败'); } }
    finally { setRtCreating(false); }
  };

  const handleRtRunSelect = async (run: TrainingRun) => { setRtRunDetail(null); await loadRtRunDetail(run.id); setRtRunTab('overview'); };

  const rtSwitchTab = async (t: typeof rtTab) => {
    setRtTab(t);
    if (t === 'configs') { const r = await apiService.listTrainingConfigs(); if (r.ok) setRtConfigs(r.configs || []); }
    if (t === 'runs') { const r = await apiService.listTrainingRuns(); if (r.ok) setRtRuns(r.runs || []); }
    if (t === 'checkpoints') { const r = await apiService.listCheckpoints({}); if (r.ok) setRtCheckpoints(r.checkpoints || []); }
    if (t === 'artifacts') { const r = await apiService.getArtifacts({ source_type: 'training' }); if (r.ok) setRtArtifacts(r.artifacts || []); }
  };

  // ── Render: Experiments ───────────────────────────────────────────────
  function renderExperiments() {
    // 用于渲染的 Experiment 对象：优先用 detailData（最新），其次从 experiments[] 查找
    const exp = currentExp || experiments.find(e => e.id === selectedId);
    const metricsObj = (() => {
      if (!exp) return {} as Record<string, any>;
      if (exp.metrics_json && typeof exp.metrics_json === 'object') return exp.metrics_json as Record<string, any>;
      if (typeof exp.metrics_json === 'string') {
        try { return JSON.parse(exp.metrics_json) as Record<string, any>; } catch { return {}; }
      }
      return {};
    })();
    const artifactIndex = (metricsObj?.artifact_index && typeof metricsObj.artifact_index === 'object')
      ? metricsObj.artifact_index
      : {};
    const evalIndex = (metricsObj?.eval_index && typeof metricsObj.eval_index === 'object')
      ? metricsObj.eval_index
      : {};

    return (
      <SidebarListPanel
        leftWidth={360}
        left={
          <>
            <div className="ui-sidebar-header">
              <span className="ui-sidebar-title">Experiments</span>
              <button className="ui-btn ui-btn-primary ui-btn-sm" onClick={() => setShowNew(true)}>+ New</button>
            </div>
            <div className="ui-search-bar">
              <input className="ui-input ui-search-input" placeholder="Search..." value={keyword} onChange={e => setKeyword(e.target.value)} />
              <select className="ui-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                {['draft','queued','running','completed','failed','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="ui-sidebar-body">
              {pageLoading && <EmptyState message="Loading..." />}
              {!pageLoading && experiments.length === 0 && <EmptyState icon="🔬" message="No experiments" />}
              {!pageLoading && experiments.map(e => (
                <ExpListItem key={e.id} exp={e} selectedId={selectedId} onClick={() => handleSelect(e)} />
              ))}
            </div>
          </>
        }
        right={
          // 首次加载：detailLoading=true，遮盖右栏显示 Loading
          detailLoading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EmptyState icon="⏳" message="加载详情..." />
            </div>
          ) : exp ? (
            <DetailPanel
              title={exp.name || exp.experiment_code}
              status={exp.status}
              tabs={[{ key: 'overview', label: 'Overview' }, { key: 'task', label: 'Task' }]}
              activeTab={tab}
              onTabChange={t => setTab(t)}
              actions={
                <>
                  {/* 后台刷新小指示器：refreshing=true 时显示，不遮盖内容 */}
                  {refreshing && (
                    <span style={{ fontSize: 11, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', animation: 'spin 1s linear infinite', opacity: 0.7 }} />
                      同步中
                    </span>
                  )}
                  {exp.status === 'draft' && <button className="ui-btn ui-btn-primary ui-btn-sm" onClick={handleStart} disabled={starting}>{starting ? 'Starting...' : 'Start'}</button>}
                  {canRetry && <button className="ui-btn ui-btn-outline ui-btn-sm" onClick={handleRetry} disabled={starting}>{starting ? '重试中...' : 'Retry'}</button>}
                  <button className="ui-btn ui-btn-ghost ui-btn-sm" onClick={() => setEditing(v => !v)}>{editing ? 'Cancel' : 'Edit'}</button>
                </>
              }
            >
              {formError && <div className="ui-flash ui-flash-err">{formError}</div>}
              {jsonError && <div className="ui-flash ui-flash-err">{jsonError}</div>}
              {tab === 'overview' && (
                <>
                  <InfoTable rows={[
                    { label: 'id', value: <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{exp.id}</code> },
                    { label: 'experiment_code', value: exp.experiment_code },
                    { label: 'name', value: editing ? <input className="ui-input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /> : exp.name },
                    { label: 'status', value: editing ? <select className="ui-select" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>{['draft','queued','running','completed','failed','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}</select> : <StatusBadge s={exp.status} /> },
                    { label: 'dataset_id', value: exp.dataset_id || '—' },
                    { label: 'template_code', value: exp.template_code || '—' },
                    { label: 'output_dir', value: exp.output_dir || '未产出' },
                    { label: 'checkpoint_path', value: exp.checkpoint_path || '暂无检查点' },
                    { label: 'created_at', value: fmt(exp.created_at) },
                    { label: 'started_at', value: fmt(exp.started_at) },
                    { label: 'finished_at', value: fmt(exp.finished_at) },
                    { label: 'config_json', value: <pre className="json-pre" style={{ maxHeight: 160 }}>{typeof exp.config_json === 'string' ? exp.config_json : JSON.stringify(exp.config_json, null, 2)}</pre> },
                    { label: 'metrics_json', value: <pre className="json-pre" style={{ maxHeight: 120 }}>{typeof exp.metrics_json === 'string' ? exp.metrics_json : JSON.stringify(exp.metrics_json, null, 2)}</pre> },
                    ...(editing ? [{ label: '', value: <button className="ui-btn ui-btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button> }] : []),
                  ]} />

                  {/* v3.5.0: Execution Metadata */}
                  {(exp as any).execution_mode && (
                    <InfoTable rows={[
                      { label: 'execution_mode', value: (exp as any).execution_mode || '—' },
                      { label: 'preflight_status', value: (exp as any).preflight_status || '—' },
                      { label: 'final_device', value: (exp as any).final_device || '—' },
                      { label: 'resume_used', value: (exp as any).resume_used ? '是' : '否' },
                      { label: 'config_snapshot', value: (exp as any).config_snapshot_path || '—' },
                      { label: 'env_snapshot', value: (exp as any).env_snapshot_path || '—' },
                    ]} />
                  )}

                  {/* v3.4.0 / v3.5.0: Report Paths */}
                  {(exp as any).report_path && (
                    <InfoTable rows={[
                      { label: 'report_path', value: <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{(exp as any).report_path || '暂无报告'}</span> },
                      { label: 'eval_manifest_path', value: <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{(exp as any).eval_manifest_path || '待生成'}</span> },
                      { label: 'badcases', value: <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{(exp as any).badcases_manifest_path}</span> },
                      { label: 'hardcases', value: <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{(exp as any).hardcases_manifest_path}</span> },
                    ]} />
                  )}

                  {/* v6.5.x/F5: Artifact/Eval index quick view */}
                  {(artifactIndex.run_dir || artifactIndex.best_pt || artifactIndex.last_pt || evalIndex.evaluation_id) && (
                    <InfoTable rows={[
                      { label: 'artifact.run_dir', value: artifactIndex.run_dir || '未产出' },
                      { label: 'artifact.best_pt', value: artifactIndex.best_pt || '未产出' },
                      { label: 'artifact.last_pt', value: artifactIndex.last_pt || '未产出' },
                      { label: 'eval.evaluation_id', value: evalIndex.evaluation_id || '暂无记录' },
                      { label: 'eval.report_path', value: evalIndex.report_path || '暂无报告' },
                      { label: 'eval.eval_manifest_path', value: evalIndex.eval_manifest_path || '待生成' },
                    ]} />
                  )}
                </>
              )}
              {tab === 'task' && (
                <InfoTable rows={[
                  { label: 'task_id', value: <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{detailData?.run?.id ?? '—'}</code> },
                  { label: 'status', value: <StatusBadge s={detailData?.run?.status ?? '—'} /> },
                  { label: 'created_at', value: fmt(detailData?.run?.created_at) },
                  { label: 'started_at', value: fmt(detailData?.run?.started_at) },
                  { label: 'finished_at', value: fmt(detailData?.run?.finished_at) },
                  { label: 'error_message', value: detailData?.run?.error_message ? <span style={{ color: 'var(--danger)', fontSize: 12 }}>{detailData.run.error_message}</span> : '—' },
                ]} />
              )}
            </DetailPanel>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EmptyState icon="👈" message="从左侧选择一个 Experiment" />
            </div>
          )
        }
      />
    );
  }

  // ── Render: Training Runtime ─────────────────────────────────────────────
  function renderRuntime() {
    return (
      <SidebarListPanel
        leftWidth={340}
        left={
          <>
            {rtSummary && (
              <div className="rt-summary" style={{ display: 'flex', gap: 10, padding: '8px 14px', borderBottom: '1px solid var(--border-light)', fontSize: 12, flexShrink: 0, flexWrap: 'wrap' }}>
                <span className="rt-summary-item">Total <b>{rtSummary.total}</b></span>
                <span className="rt-summary-item rt-running">Running <b>{rtSummary.running}</b></span>
                <span className="rt-summary-item rt-done">Done <b>{rtSummary.completed}</b></span>
                <span className="rt-summary-item rt-failed">Failed <b>{rtSummary.failed}</b></span>
                <span className="rt-summary-item">Configs <b>{rtSummary.config_count}</b></span>
                <span className="rt-summary-item">Checkpts <b>{rtSummary.checkpoint_count}</b></span>
              </div>
            )}
            {/* Sub-tabs */}
            <div style={{ display: 'flex', gap: 4, padding: '6px 10px', borderBottom: '1px solid var(--border-light)', flexShrink: 0 }}>
              {(['configs', 'runs', 'checkpoints', 'artifacts'] as const).map(t => (
                <button key={t} className={`rt-sub-tab${rtTab === t ? ' active' : ''}`} onClick={() => rtSwitchTab(t)}>
                  {t === 'configs' ? 'Configs' : t === 'runs' ? 'Runs' : t === 'checkpoints' ? 'Checkpts' : 'Arts'}
                </button>
              ))}
            </div>
            {/* List header */}
            <div className="ui-sidebar-header">
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
                {rtTab === 'configs' && `${rtConfigs.length} configs`}
                {rtTab === 'runs' && `${rtRuns.length} runs`}
                {rtTab === 'checkpoints' && `${rtCheckpoints.length} checkpoints`}
                {rtTab === 'artifacts' && `${rtArtifacts.length} artifacts`}
              </span>
              {(rtTab === 'configs' || rtTab === 'runs') && (
                <button className="ui-btn ui-btn-primary ui-btn-sm" onClick={() => rtTab === 'configs' ? setRtShowNewCfg(true) : setRtShowNewRun(true)}>
                  + {rtTab === 'configs' ? 'New Config' : 'New Run'}
                </button>
              )}
            </div>
            {/* List */}
            <div className="ui-sidebar-body">
              {rtLoading && <EmptyState message="Loading..." />}

              {rtTab === 'configs' && !rtLoading && (rtConfigs.length === 0 ? <EmptyState icon="⚙" message="No configs" /> :
                rtConfigs.map(cfg => (
                  <div key={cfg.id} className="exp-item" style={{ padding: '9px 14px' }}>
                    <div className="exp-item-name">{cfg.name}</div>
                    <div className="exp-item-meta">{cfg.config_code} · {cfg.model_name}</div>
                  </div>
                ))
              )}

              {rtTab === 'runs' && !rtLoading && (rtRuns.length === 0 ? <EmptyState icon="🏃" message="No runs" /> :
                rtRuns.map(rn => <RunListItem key={rn.id} run={rn} selectedId={rtRunDetail?.run?.id} onClick={() => handleRtRunSelect(rn)} />)
              )}

              {rtTab === 'checkpoints' && !rtLoading && (rtCheckpoints.length === 0 ? <EmptyState icon="💾" message="No checkpoints" /> :
                rtCheckpoints.map(ck => (
                  <div key={ck.id} className={`ck-row${ck.is_best ? ' ck-row-best' : ''}`}>
                    <div className="ck-row-top">
                      <span style={{ fontSize: 12, fontWeight: ck.is_best ? 700 : 400 }}>
                        {ck.is_best ? '★ ' : ''}Epoch {ck.epoch} · Step {ck.step}
                        <span className="ck-loss">{ck.metrics_json?.loss != null ? Number(ck.metrics_json.loss).toFixed(4) : '—'}</span>
                      </span>
                      {ck.is_latest && <span style={{ fontSize: 11, color: 'var(--info)' }}>latest</span>}
                    </div>
                    <div className="ck-meta">{ck.run_id?.slice(0, 8)} · {fmt(ck.created_at)}</div>
                  </div>
                ))
              )}

              {rtTab === 'artifacts' && !rtLoading && (rtArtifacts.length === 0 ? <EmptyState icon="📦" message="No artifacts" /> :
                rtArtifacts.map(a => (
                  <div key={a.id} className="exp-item">
                    <div className="exp-item-name">{a.name}</div>
                    <div className="exp-item-row" style={{ marginTop: 3 }}>
                      <StatusBadge s={a.status} />
                      <span className="exp-item-meta">{a.artifact_type || '—'}</span>
                      {a.file_size_bytes && <span className="exp-item-meta">{(a.file_size_bytes / 1024 / 1024).toFixed(1)} MB</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        }
        right={
          rtRunDetail ? (
            <DetailPanel
              title={rtRunDetail.run?.name}
              status={rtRunDetail.run?.status}
              tabs={[
                { key: 'overview', label: 'Overview' },
                { key: 'checkpoints', label: `Checkpts (${rtRunDetail.checkpoints?.length ?? 0})` },
                { key: 'raw', label: 'Raw' },
              ]}
              activeTab={rtRunTab}
              onTabChange={t => setRtRunTab(t as any)}
              actions={
                <>
                  <button className="ui-btn ui-btn-primary ui-btn-sm" onClick={() => setRtShowNewRun(true)}>+ New Run</button>
                  <button className="ui-btn ui-btn-ghost ui-btn-sm" onClick={() => rtRunDetail.run && loadRtRunDetail(rtRunDetail.run.id)}>Refresh</button>
                </>
              }
            >
              <div style={{ display: 'flex', gap: 16, padding: '8px 0', fontSize: 12, borderBottom: '1px solid var(--border-light)', marginBottom: 12, flexWrap: 'wrap' }}>
                <span>Best Loss: <b>{rtRunDetail.run?.summary_json?.best_loss != null ? Number(rtRunDetail.run.summary_json.best_loss).toFixed(4) : '—'}</b></span>
                <span>Epochs: <b>{rtRunDetail.run?.summary_json?.total_epochs ?? '—'}</b></span>
                <span>Steps: <b>{rtRunDetail.run?.summary_json?.total_steps ?? '—'}</b></span>
                <span>Checkpts: <b>{rtRunDetail.checkpoints?.length ?? 0}</b></span>
                <span>Error: <b style={{ color: rtRunDetail.run?.error_message ? 'var(--danger)' : 'var(--success)' }}>{rtRunDetail.run?.error_message ? 'Yes' : 'None'}</b></span>
              </div>

              {rtRunTab === 'overview' && (
                <InfoTable rows={[
                  { label: 'id', value: <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{rtRunDetail.run?.id}</code> },
                  { label: 'model_name', value: rtRunDetail.run?.model_name || '—' },
                  { label: 'status', value: <StatusBadge s={rtRunDetail.run?.status} /> },
                  { label: 'source_type', value: <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{rtRunDetail.run?.source_type}</code> },
                  { label: 'best_loss', value: rtRunDetail.run?.summary_json?.best_loss ?? '—' },
                  { label: 'artifact_id', value: rtRunDetail.run?.summary_json?.artifact_id ? <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{rtRunDetail.run.summary_json.artifact_id}</code> : '—' },
                  { label: 'artifact_name', value: rtRunDetail.run?.summary_json?.artifact_name || '—' },
                  { label: 'error_message', value: rtRunDetail.run?.error_message ? <span style={{ color: 'var(--danger)', fontSize: 12 }}>{rtRunDetail.run.error_message}</span> : '—' },
                  { label: 'created_at', value: fmt(rtRunDetail.run?.created_at) },
                  { label: 'started_at', value: fmt(rtRunDetail.run?.started_at) },
                  { label: 'finished_at', value: fmt(rtRunDetail.run?.finished_at) },
                ]} />
              )}

              {rtRunTab === 'checkpoints' && (
                rtRunDetail.checkpoints?.length === 0 ? <EmptyState icon="💾" message="No checkpoints" /> : (
                  <div className="ui-table-wrap">
                    <table className="ui-table">
                      <thead><tr><th>Epoch</th><th>Step</th><th>Loss</th><th>Accuracy</th><th>Best ★</th><th>Latest ✓</th><th>Path</th><th>Created</th></tr></thead>
                      <tbody>
                        {rtRunDetail.checkpoints.map((ck: any) => (
                          <tr key={ck.id} style={{ background: ck.is_best ? 'var(--success-light)' : undefined }}>
                            <td style={{ fontWeight: ck.is_best ? 700 : 400 }}>{ck.epoch}</td>
                            <td>{ck.step}</td>
                            <td>{ck.metrics_json?.loss != null ? Number(ck.metrics_json.loss).toFixed(4) : '—'}</td>
                            <td>{ck.metrics_json?.accuracy != null ? (Number(ck.metrics_json.accuracy) * 100).toFixed(1) + '%' : '—'}</td>
                            <td>{ck.is_best ? <span style={{ color: 'var(--success)', fontWeight: 700 }}>★ BEST</span> : '—'}</td>
                            <td>{ck.is_latest ? '✓' : '—'}</td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{ck.checkpoint_path || '—'}</td>
                            <td style={{ fontSize: 11 }}>{fmt(ck.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}

              {rtRunTab === 'raw' && (
                <pre className="json-pre" style={{ maxHeight: 600 }}>{JSON.stringify(rtRunDetail, null, 2)}</pre>
              )}
            </DetailPanel>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EmptyState icon="👈" message="从左侧选择一条 Run 查看详情" />
            </div>
          )
        }
      />
    );
  }

  // ── Modals ──────────────────────────────────────────────────────────────
  function NewExpModal() {
    return showNew ? (
      <div className="modal-overlay" onClick={() => setShowNew(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <span className="modal-title">New Experiment</span>
            <button className="modal-close" onClick={() => setShowNew(false)}>×</button>
          </div>
          <div className="modal-body">
            {newError && <div className="ui-flash ui-flash-err">{newError}</div>}
            {[['experiment_code','Code *'],['name','Name *'],['dataset_id','Dataset ID'],['template_code','Template'],['work_dir','Work Dir'],['output_dir','Output Dir']].map(([k, label]) => (
              <div key={k} className="form-group">
                <label className="form-label">{label as string}</label>
                <input className="form-input" value={(newForm as any)[k]} onChange={e => setNewForm({...newForm, [k as string]: e.target.value})} />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">config_json</label>
              <textarea className="form-input form-textarea" rows={3} value={newForm.config_json} onChange={e => setNewForm({...newForm, config_json: e.target.value})} style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
            </div>
            <div className="form-group">
              <label className="form-label">metrics_json</label>
              <textarea className="form-input form-textarea" rows={2} value={newForm.metrics_json} onChange={e => setNewForm({...newForm, metrics_json: e.target.value})} style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
            </div>
            <div className="form-group">
              <label className="form-label">notes</label>
              <textarea className="form-input form-textarea" rows={2} value={newForm.notes} onChange={e => setNewForm({...newForm, notes: e.target.value})} />
            </div>
          </div>
          <div className="modal-footer">
            <button className="ui-btn ui-btn-ghost" onClick={() => setShowNew(false)}>Cancel</button>
            <button className="ui-btn ui-btn-primary" onClick={handleCreate} disabled={saving}>{saving ? 'Creating...' : 'Create'}</button>
          </div>
        </div>
      </div>
    ) : null;
  }

  function RtConfigModal() {
    return rtShowNewCfg ? (
      <div className="modal-overlay" onClick={() => setRtShowNewCfg(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header"><span className="modal-title">New Training Config</span><button className="modal-close" onClick={() => setRtShowNewCfg(false)}>×</button></div>
          <div className="modal-body">
            {rtNewCfgError && <div className="ui-flash ui-flash-err">{rtNewCfgError}</div>}
            {[['config_code','Code *'],['name','Name *'],['model_name','Model'],['description','Description']].map(([k, label]) => (
              <div key={k} className="form-group">
                <label className="form-label">{label as string}</label>
                <input className="form-input" value={(rtNewCfg as any)[k]} onChange={e => setRtNewCfg({...rtNewCfg, [k as string]: e.target.value})} />
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button className="ui-btn ui-btn-ghost" onClick={() => setRtShowNewCfg(false)}>Cancel</button>
            <button className="ui-btn ui-btn-primary" onClick={handleCreateRtConfig} disabled={rtCreating}>{rtCreating ? 'Creating...' : 'Create'}</button>
          </div>
        </div>
      </div>
    ) : null;
  }

  function RtRunModal() {
    return rtShowNewRun ? (
      <div className="modal-overlay" onClick={() => setRtShowNewRun(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header"><span className="modal-title">New Training Run</span><button className="modal-close" onClick={() => setRtShowNewRun(false)}>×</button></div>
          <div className="modal-body">
            {rtNewRunError && <div className="ui-flash ui-flash-err">{rtNewRunError}</div>}
            <div className="form-group"><label className="form-label">Run Name *</label><input className="form-input" value={rtNewRun.name} onChange={e => setRtNewRun({...rtNewRun, name: e.target.value})} placeholder="e.g. resnet50-run-1" /></div>
            <div className="form-group"><label className="form-label">Model</label><input className="form-input" value={rtNewRun.model_name} onChange={e => setRtNewRun({...rtNewRun, model_name: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Epochs</label><input className="form-input" type="number" value={rtNewRun.epochs} onChange={e => setRtNewRun({...rtNewRun, epochs: Number(e.target.value)})} min={1} max={100} /></div>
            <div className="form-group"><label className="form-label">Steps/Epoch</label><input className="form-input" type="number" value={rtNewRun.steps_per_epoch} onChange={e => setRtNewRun({...rtNewRun, steps_per_epoch: Number(e.target.value)})} min={1} /></div>
            <div className="form-group"><label className="form-label">Delay/Step (ms)</label><input className="form-input" type="number" value={rtNewRun.delay_per_step} onChange={e => setRtNewRun({...rtNewRun, delay_per_step: Number(e.target.value)})} min={0} /></div>
          </div>
          <div className="modal-footer">
            <button className="ui-btn ui-btn-ghost" onClick={() => setRtShowNewRun(false)}>Cancel</button>
            <button className="ui-btn ui-btn-primary" onClick={handleCreateRtRun} disabled={rtCreating}>{rtCreating ? 'Starting...' : 'Start Run'}</button>
          </div>
        </div>
      </div>
    ) : null;
  }

  // ── Main layout ────────────────────────────────────────────────────────
  const viewBtn = (target: 'experiments' | 'runtime', label: string) => (
    <button
      onClick={() => setView(target)}
      style={{
        padding: '6px 14px', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer',
        fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-sans)',
        background: view === target ? 'var(--primary)' : 'var(--bg-app)',
        color: view === target ? '#fff' : 'var(--text-secondary)',
        transition: 'background var(--t-fast)',
      }}
    >{label}</button>
  );

  return (
    <div className="page-root">
      <PageHeader
        title={view === 'experiments' ? 'Training' : 'Training Runtime'}
        subtitle={view === 'experiments' ? 'Experiments' : 'Training Runtime · Configs & Runs'}
        actions={<div style={{ display: 'flex', gap: 6 }}>{viewBtn('experiments', 'Experiments')}{viewBtn('runtime', 'Training Runtime')}</div>}
      />
      <div style={{ flex: 1, overflow: 'auto' }}>
        {view === 'experiments' ? renderExperiments() : renderRuntime()}
      </div>
      <NewExpModal />
      <RtConfigModal />
      <RtRunModal />
    </div>
  );
}
