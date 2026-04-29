import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { apiService, Evaluation, CreateEvaluationRequest } from '../services/api';
import {
  StatusBadge, PageHeader, StatsGrid, ToolbarRow,
  SidebarListPanel, DetailPanel, EmptyState, ActionButtonGroup, InfoTable, SectionCard, MainlineChainStrip, EntityLinkChips,
} from '../components/ui';
import WorkspaceGrid from '../layout/WorkspaceGrid';
import { clearLayout, loadLayout, saveLayout, type LayoutConfig } from '../layout/layoutStorage';
import { useResponsiveLayoutMode } from '../hooks/useResponsiveLayoutMode';
import '../components/ui/shared.css';
import './Evaluations.css';

// ── Types ──────────────────────────────────────────────────────────────────────
type EvalStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
type EvalType = 'classification' | 'detection' | 'generation' | 'ranking' | 'custom';

const STATUS_LABELS: Record<EvalStatus, string> = {
  pending: '待执行', running: '运行中', completed: '已完成',
  failed: '失败', cancelled: '已取消',
};
const TYPE_LABELS: Record<EvalType, string> = {
  classification: '分类', detection: '检测', generation: '生成',
  ranking: '排序', custom: '自定义',
};
const STATUS_COLOR_MAP: Record<string, string> = {
  pending: '#f59e0b', running: '#3b82f6', completed: '#22c55e',
  failed: '#ef4444', cancelled: '#6b7280',
};

// Workspace layout key
const LAYOUT_KEY = 'evaluations-detail';

// Default layouts for detail workspace cards
const DEFAULT_LAYOUTS: LayoutConfig = {
  lg: [
    { i: 'summary', x: 0, y: 0, w: 6, h: 6, minW: 4, minH: 4 },
    { i: 'metrics_summary', x: 6, y: 0, w: 6, h: 6, minW: 4, minH: 4 },
    { i: 'linkage', x: 0, y: 6, w: 6, h: 6, minW: 4, minH: 4 },
    { i: 'report_entry', x: 6, y: 6, w: 6, h: 6, minW: 4, minH: 4 },
    { i: 'artifacts_exports', x: 0, y: 12, w: 6, h: 5, minW: 4, minH: 3 },
    { i: 'mainline_chain', x: 6, y: 12, w: 6, h: 5, minW: 4, minH: 3 },
    { i: 'related_objects', x: 0, y: 17, w: 12, h: 5, minW: 6, minH: 3 },
  ],
  md: [
    { i: 'summary', x: 0, y: 0, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'metrics_summary', x: 4, y: 0, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'linkage', x: 0, y: 6, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'report_entry', x: 4, y: 6, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'artifacts_exports', x: 0, y: 12, w: 4, h: 5, minW: 3, minH: 3 },
    { i: 'mainline_chain', x: 4, y: 12, w: 4, h: 5, minW: 3, minH: 3 },
    { i: 'related_objects', x: 0, y: 17, w: 8, h: 5, minW: 4, minH: 3 },
  ],
  sm: [
    { i: 'summary', x: 0, y: 0, w: 1, h: 6, minW: 1, minH: 4 },
    { i: 'metrics_summary', x: 0, y: 6, w: 1, h: 6, minW: 1, minH: 4 },
    { i: 'linkage', x: 0, y: 12, w: 1, h: 6, minW: 1, minH: 4 },
    { i: 'report_entry', x: 0, y: 18, w: 1, h: 6, minW: 1, minH: 4 },
    { i: 'artifacts_exports', x: 0, y: 24, w: 1, h: 5, minW: 1, minH: 3 },
    { i: 'mainline_chain', x: 0, y: 29, w: 1, h: 5, minW: 1, minH: 3 },
    { i: 'related_objects', x: 0, y: 34, w: 1, h: 5, minW: 1, minH: 3 },
  ],
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmt(ts?: string | null) {
  if (!ts) return '—';
  try { return new Date(ts).toLocaleString('zh-CN'); } catch { return ts; }
}
function dur(start?: string | null, end?: string | null) {
  if (!start) return '—';
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : Date.now();
  return Math.round((e - s) / 1000) + 's';
}

function metricSummaryLine(evaluation: any) {
  try {
    const summary =
      typeof evaluation?.result_summary_json === 'string'
        ? JSON.parse(evaluation.result_summary_json)
        : evaluation?.result_summary_json || {};
    const m = summary?.metrics_summary || {};
    if (m.accuracy != null) return `acc ${(Number(m.accuracy) * 100).toFixed(1)}%`;
    if (m.map50 != null) return `mAP50 ${Number(m.map50).toFixed(3)}`;
    if (m.f1 != null) return `F1 ${Number(m.f1).toFixed(3)}`;
  } catch {
    // ignore parse errors
  }
  return '指标待生成';
}

// ── MetricsReport sub-component ───────────────────────────────────────────────
function MetricsReport({ selected, metrics }: { selected: any; metrics: any[] }) {
  const summary = React.useMemo(() => {
    try {
      const raw = selected?.result_summary_json;
      return typeof raw === 'string' ? JSON.parse(raw || '{}') : (raw || {});
    } catch { return {}; }
  }, [selected?.result_summary_json]);

  const hasSummary = summary && Object.keys(summary).length > 0;
  const acc = hasSummary ? summary.metrics_summary?.accuracy : null;
  const accVal = acc != null ? Number(acc) : null;
  const accColor = accVal == null ? '#6b7280' : accVal >= 0.8 ? '#22c55e' : accVal >= 0.6 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {hasSummary && (
        <div style={{
          background: selected.status === 'completed' ? 'rgba(34,197,94,0.06)' : selected.status === 'failed' ? 'rgba(239,68,68,0.06)' : 'rgba(59,130,246,0.06)',
          border: `1px solid ${selected.status === 'completed' ? 'rgba(34,197,94,0.2)' : selected.status === 'failed' ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)'}`,
          borderRadius: 10, padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: accVal != null ? 10 : 0 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>
              {selected.status === 'completed' ? '✓ 评估完成' : selected.status === 'failed' ? '✗ 评估失败' : '⟳ 评估进行中'}
            </span>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              {summary.total_samples ? `${summary.total_samples} 样本` : ''}
              {summary.total_duration_ms ? ` · ${(summary.total_duration_ms / 1000).toFixed(1)}s` : ''}
            </span>
          </div>
          {accVal != null && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Accuracy</span>
                <span style={{ fontWeight: 700, color: accColor }}>{(accVal * 100).toFixed(1)}%</span>
              </div>
              <div style={{ height: 8, background: 'var(--color-border)', borderRadius: 999 }}>
                <div style={{ width: `${Math.min(100, accVal * 100)}%`, height: 8, background: accColor, borderRadius: 999 }} />
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
        {metrics.map(m => {
          const val = Number(m.metric_value);
          const isHigh = val >= 0.8;
          const isMid = val >= 0.6 && val < 0.8;
          const barColor = isHigh ? '#22c55e' : isMid ? '#f59e0b' : '#ef4444';
          const bgColor = isHigh ? 'rgba(34,197,94,0.06)' : isMid ? 'rgba(245,158,11,0.06)' : 'rgba(239,68,68,0.06)';
          return (
            <div key={m.id} style={{ background: bgColor, border: `1px solid ${barColor}33`, borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>{m.metric_key.toUpperCase()}</span>
                <span style={{ fontSize: 10, color: barColor, fontWeight: 700 }}>{isHigh ? '● High' : isMid ? '◐ Mid' : '○ Low'}</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: barColor }}>{m.metric_value}</div>
              {m.metric_text && <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 3 }}>{m.metric_text}</div>}
              {val >= 0 && val <= 1 && (
                <div style={{ height: 4, background: 'var(--color-border)', borderRadius: 999, marginTop: 8 }}>
                  <div style={{ width: `${val * 100}%`, height: 4, background: barColor, borderRadius: 999 }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {metrics.find(m => m.metric_key === 'f1') && (
        <div style={{ background: 'rgba(76,141,255,0.06)', border: '1px solid rgba(76,141,255,0.3)', borderRadius: 10, padding: '12px 16px' }}>
          <div style={{ fontSize: 12, color: '#4c8dff', fontWeight: 600, marginBottom: 4 }}>F1 Score — 分类综合指标</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#4c8dff' }}>{metrics.find(m => m.metric_key === 'f1')?.metric_value}</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>F1 = 2 × Precision × Recall / (Precision + Recall)</div>
        </div>
      )}
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function Evaluations() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [selected, setSelected] = useState<Evaluation | null>(null);
  const [keyword, setKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [detailTab, setDetailTab] = useState<'overview' | 'steps' | 'logs' | 'metrics' | 'lineage' | 'raw'>('overview');
  const [detail, setDetail] = useState<{ steps: any[]; logs: any[]; metrics: any[] }>({ steps: [], logs: [], metrics: [] });
  const [lineage, setLineage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [form, setForm] = useState<CreateEvaluationRequest>({
    name: '', evaluation_type: 'classification', model_name: '',
    artifact_name: '', dataset_name: '', notes: '',
  });

  // Workspace layout state
  const { contentRef, contentWidth, canUseLayoutEditor, shouldUseLayoutEditor, layoutEdit, setLayoutEdit, toggleEdit, layoutMode } = useResponsiveLayoutMode();
  const [layouts, setLayouts] = useState<LayoutConfig>(DEFAULT_LAYOUTS);

  // Load saved layout
  useEffect(() => {
    const saved = loadLayout(LAYOUT_KEY);
    if (saved) {
      setLayouts(saved);
    }
  }, []);

  // Save layout on change (only when in edit mode and meets threshold)
  useEffect(() => {
    if (layoutEdit && canUseLayoutEditor) saveLayout(LAYOUT_KEY, layouts);
  }, [layouts, layoutEdit, canUseLayoutEditor]);

  // ── Loaders ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.getEvaluations({
        keyword: keyword || undefined,
        status: filterStatus || undefined,
        evaluation_type: filterType || undefined,
      });
      if (res.ok) setEvaluations(res.evaluations || []);
    } finally { setLoading(false); }
  }, [keyword, filterStatus, filterType]);

  useEffect(() => { load(); }, [load]);

  // Poll running evaluations
  useEffect(() => {
    const running = evaluations.find(e => e.status === 'running');
    if (!running) return;
    const timer = setInterval(() => {
      apiService.getEvaluation(running.id).then(res => {
        if (res.ok) {
          setEvaluations(prev => prev.map(e => e.id === running.id ? res.evaluation : e));
          if (selected?.id === running.id) setSelected(res.evaluation);
        }
      });
    }, 3000);
    return () => clearInterval(timer);
  }, [evaluations, selected]);

  const loadDetail = async (id: string) => {
    const [stepsRes, logsRes, metricsRes, lineageRes] = await Promise.all([
      apiService.getEvaluationSteps(id),
      apiService.getEvaluationLogs(id),
      apiService.getEvaluationMetrics(id),
      apiService.getEvaluationLineage(id),
    ]);
    setDetail({
      steps: stepsRes.ok ? stepsRes.steps : [],
      logs: logsRes.ok ? logsRes.logs : [],
      metrics: metricsRes.ok ? metricsRes.metrics : [],
    });
    setLineage(lineageRes.ok ? lineageRes : null);
  };

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleSelect = async (e: Evaluation) => {
    setSelected(e); setDetailTab('overview');
    const res = await apiService.getEvaluation(e.id);
    if (res.ok) {
      setSelected(res.evaluation);
      setEvaluations(prev => prev.map(ev => ev.id === e.id ? res.evaluation : ev));
    }
    await loadDetail(e.id);
  };

  const handleCreate = async () => {
    if (!form.name.trim()) { alert('请输入评估名称'); return; }
    setActionLoading(true);
    try {
      const res = await apiService.createEvaluation(form);
      if (res.ok && res.evaluation) {
        await load(); setShowCreate(false);
        setForm({ name: '', evaluation_type: 'classification', model_name: '', artifact_name: '', dataset_name: '', notes: '' });
        await handleSelect(res.evaluation);
      } else { alert('创建失败: ' + (res.error || '未知错误')); }
    } finally { setActionLoading(false); }
  };

  const handleCreateAndExecute = async () => {
    if (!form.name.trim()) { alert('请输入评估名称'); return; }
    setActionLoading(true);
    try {
      const res = await apiService.createEvaluation(form);
      if (res.ok && res.evaluation) {
        await load(); setShowCreate(false);
        setForm({ name: '', evaluation_type: 'classification', model_name: '', artifact_name: '', dataset_name: '', notes: '' });
        const ev = res.evaluation;
        await handleSelect(ev);
        // execute
        const execRes = await apiService.executeEvaluation(ev.id);
        if (execRes.ok) await load();
      } else { alert('创建失败: ' + (res.error || '未知错误')); }
    } finally { setActionLoading(false); }
  };

  const handleExecute = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await apiService.executeEvaluation(id);
      if (res.ok) { await load(); }
      else { alert('执行失败: ' + (res.error || '未知错误')); }
    } finally { setActionLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除此评估？')) return;
    setActionLoading(true);
    try {
      const res = await apiService.deleteEvaluation(id);
      if (res.ok) { if (selected?.id === id) setSelected(null); await load(); }
      else { alert('删除失败: ' + (res.error || '未知错误')); }
    } finally { setActionLoading(false); }
  };

  // ── Derived stats ────────────────────────────────────────────────────────────
  const stats = {
    total: evaluations.length,
    running: evaluations.filter(e => e.status === 'running').length,
    completed: evaluations.filter(e => e.status === 'completed').length,
    failed: evaluations.filter(e => e.status === 'failed').length,
  };
  const reportReadyCount = evaluations.filter((e: any) => e.report_path || e.eval_manifest_path).length;
  const linkedDatasetCount = new Set(evaluations.map((e: any) => e.dataset_id || e.dataset_name).filter(Boolean)).size;

  // Workspace cards for Overview tab
  const workspaceCards = useMemo(() => {
    if (!selected) return [];
    return [
      {
        id: 'summary',
        content: (
          <InfoTable
            rows={[
              { label: '评估名称', value: selected.name },
              { label: '评估类型', value: TYPE_LABELS[selected.evaluation_type as EvalType] || selected.evaluation_type },
              { label: '状态', value: <StatusBadge s={selected.status} color={STATUS_COLOR_MAP[selected.status]} /> },
              { label: '耗时', value: dur(selected.started_at, selected.finished_at) },
              { label: '创建时间', value: fmt(selected.created_at) },
              { label: '备注', value: selected.notes || '暂无备注' },
            ]}
          />
        ),
      },
      {
        id: 'metrics_summary',
        content: (
          <InfoTable
            rows={[
              { label: '指标摘要', value: metricSummaryLine(selected) },
              { label: '步骤数', value: detail.steps.length ? String(detail.steps.length) : '暂无步骤记录' },
              { label: '日志数', value: detail.logs.length ? String(detail.logs.length) : '暂无日志记录' },
            ]}
          />
        ),
      },
      {
        id: 'linkage',
        content: (
          <InfoTable
            rows={[
              { label: '模型名称', value: selected.model_name ? <Link to="/models">{selected.model_name}</Link> : '未绑定模型' },
              { label: '数据集', value: selected.dataset_name ? <Link to="/datasets">{selected.dataset_name}</Link> : '未绑定数据集' },
              { label: '关联产物', value: selected.artifact_name ? <Link to={{ pathname: '/artifacts', search: `?highlight=${(selected as any).artifact_id || ''}` }}>{selected.artifact_name}</Link> : '未绑定产物' },
              { label: '训练任务', value: selected.training_job_id ? <Link to="/training">{selected.training_job_id}</Link> : '未绑定训练任务' },
            ]}
          />
        ),
      },
      {
        id: 'report_entry',
        content: (
          <InfoTable
            rows={[
              { label: 'metrics.json', value: (selected as any).report_path || '暂无报告' },
              { label: 'eval_manifest_path', value: (selected as any).eval_manifest_path || '待生成' },
              { label: 'badcases_manifest', value: (selected as any).badcases_manifest_path || '暂无记录' },
              { label: 'hardcases_manifest', value: (selected as any).hardcases_manifest_path || '暂无记录' },
              { label: '对比入口', value: <Link to="/models">前往模型页进行对比</Link> },
            ]}
          />
        ),
      },
      {
        id: 'artifacts_exports',
        content: (
          <InfoTable
            rows={[
              { label: '产物名称', value: selected.artifact_name || '未绑定产物' },
              { label: '导出状态', value: (selected as any).export_path ? '已导出' : '未导出' },
              { label: '结果摘要', value: selected.result_summary_json && Object.keys(selected.result_summary_json).length > 0 ? JSON.stringify(selected.result_summary_json, null, 2) : '暂无结果摘要' },
            ]}
          />
        ),
      },
      {
        id: 'mainline_chain',
        content: (
          <MainlineChainStrip
            compact
            current={selected.id}
            chain={[
              ...((selected as any).source_task_id ? [{ type: 'task' as const, id: (selected as any).source_task_id, label: '来源Task' }] : []),
              ...((selected as any).training_job_id ? [{ type: 'workflow_job' as const, id: (selected as any).training_job_id, label: '来源训练' }] : []),
              { type: 'evaluation' as const, id: selected.id, label: selected.name || '当前评估', status: selected.status },
              ...(selected.model_name ? [{ type: 'model' as const, id: String((selected as any).model_id || selected.id), label: '产出Model' }] : []),
              ...(selected.artifact_name ? [{ type: 'artifact' as const, id: String((selected as any).artifact_id || selected.id), label: '产出Artifact' }] : []),
            ]}
          />
        ),
      },
      {
        id: 'related_objects',
        content: (
          <EntityLinkChips
            label="关联"
            entities={[
              ...((selected as any).model_id ? [{ type: 'model' as const, id: String((selected as any).model_id), label: selected.model_name || 'Model', status: undefined }] : []),
              ...((selected as any).dataset_id ? [{ type: 'dataset' as const, id: String((selected as any).dataset_id), label: selected.dataset_name || 'Dataset', status: undefined }] : []),
              ...((selected as any).artifact_id ? [{ type: 'artifact' as const, id: String((selected as any).artifact_id), label: selected.artifact_name || 'Artifact', status: undefined }] : []),
              ...((selected as any).training_job_id ? [{ type: 'workflow_job' as const, id: String((selected as any).training_job_id), label: '训练任务', status: undefined }] : []),
            ]}
          />
        ),
      },
    ];
  }, [selected, detail.steps.length, detail.logs.length]);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="page-root" ref={contentRef}>
      <PageHeader
        title="评估中心"
        subtitle="运行历史与评估报告"
        summaryStrip={
          <div className="page-summary-strip">
            <div className="page-summary-item">
              <div className="page-summary-label">completed</div>
              <div className="page-summary-value">{stats.completed}</div>
            </div>
            <div className="page-summary-item">
              <div className="page-summary-label">report-ready</div>
              <div className="page-summary-value">{reportReadyCount}</div>
            </div>
            <div className="page-summary-item">
              <div className="page-summary-label">linked datasets</div>
              <div className="page-summary-value">{linkedDatasetCount}</div>
            </div>
            <div className="page-summary-item">
              <div className="page-summary-label">compare entry</div>
              <div className="page-summary-value" style={{ fontSize: 14 }}>已启用</div>
            </div>
          </div>
        }
        actions={
          <>
            <button className="ui-btn ui-btn-secondary" onClick={load} disabled={loading}>↻ 刷新</button>
            <Link className="ui-btn ui-btn-outline" to="/models">对比入口（模型）</Link>
            <button className="ui-btn ui-btn-primary" onClick={() => setShowCreate(true)}>+ 新建评估</button>
          </>
        }
      />

      <div style={{ padding: '16px 20px', flexShrink: 0, overflow: 'auto' }}>
        <StatsGrid
          items={[
            { label: '全部评估', value: stats.total },
            { label: '运行中', value: stats.running, color: '#3b82f6' },
            { label: '已完成', value: stats.completed, color: '#22c55e' },
            { label: '失败', value: stats.failed, color: '#ef4444' },
          ]}
          columns={4}
        />

        <ToolbarRow>
          <input
            className="ui-input"
            placeholder="搜索名称 / 模型 / 产物..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            style={{ flex: 1, minWidth: 180 }}
          />
          <select className="ui-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">全部状态</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select className="ui-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">全部类型</option>
            {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button className="ui-btn ui-btn-outline" onClick={() => { setKeyword(''); setFilterStatus(''); setFilterType(''); }}>清除</button>
        </ToolbarRow>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 20px 16px' }}>
        <SidebarListPanel
          leftWidth={360}
          left={
            <>
              {/* List header */}
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  {evaluations.length} 条评估
                </span>
              </div>
              {/* List */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {loading && evaluations.length === 0 && <EmptyState message="加载中..." />}
                {!loading && evaluations.length === 0 && (
                  <EmptyState icon="📋" message="暂无评估记录" />
                )}
                {evaluations.map(e => (
                  <div
                    key={e.id}
                    onClick={() => handleSelect(e)}
                    style={{
                      padding: '10px 14px',
                      borderBottom: '1px solid var(--color-border-light)',
                      cursor: 'pointer',
                      background: selected?.id === e.id ? 'var(--color-primary-light)' : undefined,
                      borderLeft: selected?.id === e.id ? '3px solid var(--color-primary)' : '3px solid transparent',
                      transition: 'background var(--transition-fast)',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>
                      {e.name}
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                      <StatusBadge s={e.status} color={STATUS_COLOR_MAP[e.status]} />
                      <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                        {TYPE_LABELS[e.evaluation_type as EvalType] || e.evaluation_type}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                        {metricSummaryLine(e)}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 3 }}>
                      {e.model_name || '未绑定模型'} · {e.dataset_name || '未绑定数据集'} · {fmt(e.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          }
          right={
            selected ? (
              <DetailPanel
                title={selected.name}
                status={selected.status}
                statusColor={STATUS_COLOR_MAP[selected.status]}
                tabs={[
                  { key: 'overview', label: '概览' },
                  { key: 'steps', label: `步骤 ${detail.steps.length > 0 ? `(${detail.steps.length})` : ''}` },
                  { key: 'logs', label: `日志 ${detail.logs.length > 0 ? `(${detail.logs.length})` : ''}` },
                  { key: 'metrics', label: `报告 ${detail.metrics.length > 0 ? `(${detail.metrics.length})` : ''}` },
                  { key: 'lineage', label: 'Lineage' },
                  { key: 'raw', label: '原始' },
                ]}
                activeTab={detailTab}
                onTabChange={t => setDetailTab(t as any)}
                actions={
                  <>
                    {selected.status === 'pending' && (
                      <button className="ui-btn ui-btn-primary ui-btn-sm" onClick={() => handleExecute(selected.id)} disabled={actionLoading}>▶ 执行</button>
                    )}
                    {(selected.status === 'completed' || selected.status === 'failed' || selected.status === 'cancelled') && (
                      <button className="ui-btn ui-btn-secondary ui-btn-sm" onClick={() => handleExecute(selected.id)} disabled={actionLoading}>↻ 重新执行</button>
                    )}
                    {selected.status !== 'running' && (
                      <button className="ui-btn ui-btn-danger ui-btn-sm" onClick={() => handleDelete(selected.id)} disabled={actionLoading}>删除</button>
                    )}
                  </>
                }
              >
                {/* ── Overview ─────────────────────────────────── */}
                {detailTab === 'overview' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Workspace Grid for cards */}
                    {workspaceCards.length > 0 && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>评估概览工作台</div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={toggleEdit}
                              disabled={!canUseLayoutEditor}
                              title={!canUseLayoutEditor ? '请在大屏宽度下编辑布局' : ''}
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
                                onClick={() => { setLayouts(DEFAULT_LAYOUTS); clearLayout(LAYOUT_KEY); }}
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
                        {loading && !selected ? (
                          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
                        ) : shouldUseLayoutEditor ? (
                          <div>
                            <div style={{ padding: '4px 8px', fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: 4, marginBottom: 8, display: 'inline-block' }}>
                              layoutMode: {layoutMode} · contentWidth: {Math.round(contentWidth)}px
                            </div>
                            <WorkspaceGrid editable={layoutEdit} layouts={layouts} cards={workspaceCards} onChange={setLayouts} />
                          </div>
                        ) : (
                          <div>
                            <div style={{ padding: '4px 8px', fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: 4, marginBottom: 8, display: 'inline-block' }}>
                              layoutMode: {layoutMode} · contentWidth: {Math.round(contentWidth)}px
                            </div>
                            <div className="responsive-card-grid">
                              {workspaceCards.map((c: any) => (
                                <div key={c.id} style={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
                                  {c.content}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {selected.error_message && (
                      <div className="ui-flash ui-flash-err">错误摘要：{selected.error_message}</div>
                    )}
                  </div>
                )}

                {/* ── Steps ─────────────────────────────────────── */}
                {detailTab === 'steps' && (
                  detail.steps.length === 0
                    ? <EmptyState icon="📝" message="暂无步骤记录" />
                    : <div className="ui-table-wrap">
                        <table className="ui-table">
                          <thead><tr><th>#</th><th>名称</th><th>消息</th><th>耗时</th><th>时间</th><th>状态</th></tr></thead>
                          <tbody>
                            {detail.steps.map((step, i) => (
                              <tr key={step.id}>
                                <td style={{ width: 32, textAlign: 'center', fontWeight: 700, color: 'var(--color-text-secondary)' }}>{i + 1}</td>
                                <td style={{ fontWeight: 600 }}>{step.name || step.id?.slice(0, 8)}</td>
                                <td style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{step.message || '—'}</td>
                                <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{dur(step.started_at, step.finished_at)}</td>
                                <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{fmt(step.started_at)}</td>
                                <td><StatusBadge s={step.status} color={STATUS_COLOR_MAP[step.status]} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                )}

                {/* ── Logs ──────────────────────────────────────── */}
                {detailTab === 'logs' && (
                  detail.logs.length === 0
                    ? <EmptyState icon="📋" message="暂无日志" />
                    : <div style={{ background: '#1a1a2e', borderRadius: 8, padding: '8px 12px', maxHeight: 400, overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                        {detail.logs.map(log => (
                          <div key={log.id} style={{ display: 'flex', gap: 8, padding: '3px 0', borderBottom: '1px solid #2a2a4e', color: '#e5e7eb' }}>
                            <span style={{ color: '#6b7280', whiteSpace: 'nowrap' }}>{fmt(log.created_at)}</span>
                            <span style={{
                              color: log.level === 'error' ? '#f87171' : log.level === 'warn' ? '#fbbf24' : '#60a5fa',
                              minWidth: 48, fontWeight: 600
                            }}>[{log.level}]</span>
                            <span style={{ flex: 1, wordBreak: 'break-all' }}>{log.message}</span>
                          </div>
                        ))}
                      </div>
                )}

                {/* ── Metrics / Reports ───────────────────────────── */}
                {detailTab === 'metrics' && (
                  detail.metrics.length === 0
                    ? <EmptyState icon="📊" message="暂无指标（请先执行评估）" />
                    : <MetricsReport selected={selected} metrics={detail.metrics} />
                )}

                {/* ── Lineage ───────────────────────────────────── */}
                {detailTab === 'lineage' && (
                  !lineage ? <EmptyState icon="🔗" message="加载溯源链路..." /> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {/* Chain visualization */}
                      {[
                        { label: 'Experiment', icon: '🔬', node: lineage.experiment, color: '#7c3aed' },
                        { label: 'Training Run', icon: '🏃', node: lineage.run, color: '#0891b2' },
                        { label: 'Artifact', icon: '📦', node: lineage.artifact, color: '#16a34a' },
                        { label: 'Evaluation', icon: '📊', node: lineage.evaluation, color: '#2563eb' },
                        { label: 'Deployments', icon: '🚀', node: lineage.deployments?.length > 0 ? { count: lineage.deployments.length } : null, color: '#ea580c' },
                      ].map(({ label, icon, node, color }, i, arr) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {i > 0 && <div style={{ width: 24, height: 2, background: node ? color + '66' : 'var(--border)', flexShrink: 0 }} />}
                          <div style={{
                            flex: 1, background: node ? `${color}11` : 'var(--bg-surface)',
                            border: `1px solid ${node ? color + '44' : 'var(--border-light)'}`,
                            borderRadius: 10, padding: '10px 14px',
                            display: 'flex', alignItems: 'center', gap: 10,
                          }}>
                            <span style={{ fontSize: 18 }}>{icon}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: node ? color : 'var(--text-muted)' }}>{label}</div>
                              {node ? (
                                label === 'Deployments' ? (
                                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                                    {node.count} 个部署实例 · <span style={{ color: 'var(--primary)', cursor: 'pointer' }}>查看详情</span>
                                  </div>
                                ) : (
                                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                                    {(node.name || node.run_code || node.id)?.slice(0, 32)} · <span style={{ color: 'var(--text-muted)' }}>{node.status || node.artifact_type || ''}</span>
                                  </div>
                                )
                              ) : (
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>— 无关联数据</div>
                              )}
                            </div>
                            {node && <StatusBadge s={node.status || 'linked'} color={color} />}
                          </div>
                          {i < arr.length - 1 && <div style={{ width: 24, height: 2, background: arr[i + 1]?.node ? (arr[i + 1] as any).color + '66' : 'var(--border)', flexShrink: 0 }} />}
                        </div>
                      ))}

                      {/* Related evaluations */}
                      {lineage.related_evaluations?.length > 0 && (
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
                            同产物其他评估 ({lineage.related_evaluations.length})
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {lineage.related_evaluations.slice(0, 5).map((ev: any) => (
                              <div key={ev.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
                                borderRadius: 8, cursor: 'pointer',
                              }}>
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 600 }}>{ev.name}</div>
                                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                    {TYPE_LABELS[ev.evaluation_type as EvalType] || ev.evaluation_type} · {fmt(ev.created_at)}
                                  </div>
                                </div>
                                <StatusBadge s={ev.status} color={STATUS_COLOR_MAP[ev.status]} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* No lineage data */}
                      {lineage.evaluation && !lineage.experiment && !lineage.run && !lineage.artifact && (
                        <EmptyState icon="🔗" message="暂无溯源链路（请关联 Experiment / Training / Artifact）" />
                      )}
                    </div>
                  )
                )}

                {/* ── Raw ──────────────────────────────────────── */}
                {detailTab === 'raw' && (
                  <div>
                    <pre className="ui-json" style={{ maxHeight: 500 }}>{JSON.stringify({ evaluation: selected, steps: detail.steps, logs: detail.logs, metrics: detail.metrics }, null, 2)}</pre>
                    <button className="ui-btn ui-btn-outline ui-btn-sm" onClick={() => navigator.clipboard?.writeText(JSON.stringify({ evaluation: selected, steps: detail.steps, logs: detail.logs, metrics: detail.metrics }, null, 2))}>复制 JSON</button>
                  </div>
                )}
              </DetailPanel>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EmptyState icon="👈" message="从左侧列表选择一项评估" />
              </div>
            )
          }
        />
      </div>

      {/* ── Create Modal ─────────────────────────────────────────────────────── */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>新建评估</h3>
              <button className="modal-close" onClick={() => setShowCreate(false)}>×</button>
            </div>
            <div className="modal-body">
              {[
                ['name', '评估名称 *', '例如: ResNet50 在 ImageNet 上的分类评估'],
                ['model_name', '模型名称', '例如: resnet50_v1'],
                ['artifact_name', '产物名称', '例如: output/exp_001/checkpoints/final'],
                ['dataset_name', '数据集名称', '例如: imagenet_val_2012'],
              ].map(([k, label, placeholder]) => (
                <div key={k} className="form-group">
                  <label>{label as string}</label>
                  <input
                    type="text"
                    value={(form as any)[k]}
                    onChange={e => setForm({ ...form, [k as string]: e.target.value })}
                    placeholder={placeholder as string}
                  />
                </div>
              ))}
              <div className="form-group">
                <label>评估类型</label>
                <select value={form.evaluation_type} onChange={e => setForm({ ...form, evaluation_type: e.target.value as EvalType })}>
                  {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v} ({k})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>备注</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreate(false)}>取消</button>
              <button className="btn-secondary" onClick={handleCreate} disabled={actionLoading}>仅保存</button>
              <button className="btn-primary" onClick={handleCreateAndExecute} disabled={actionLoading}>{actionLoading ? '处理中...' : '保存并执行'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
