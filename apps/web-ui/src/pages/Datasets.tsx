import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiService, Dataset, Task } from '../services/api';
import {
  StatusBadge, PageHeader, SectionCard, EmptyState,
  InfoTable, MainlineChainStrip, EntityLinkChips,
} from '../components/ui';
import WorkspaceGrid from '../layout/WorkspaceGrid';
import { clearLayout, loadLayout, saveLayout, type LayoutConfig } from '../layout/layoutStorage';
import '../components/ui/shared.css';
import './Datasets.css';

type DetailTab = 'overview' | 'versions' | 'source_task' | 'pipeline' | 'splits' | 'raw';

const DATASET_TYPES  = ['image','text','audio','video','tabular','other'];
const LABEL_FORMATS  = ['coco','yolo','pascal_voc','json','csv','other'];
const DATASET_STATUSES = ['draft','active','archived'];

// Workspace layout key
const LAYOUT_KEY = 'datasets-detail';

// Default layouts for detail workspace cards
const DEFAULT_LAYOUTS: LayoutConfig = {
  lg: [
    { i: 'identity', x: 0, y: 0, w: 6, h: 5, minW: 4, minH: 4 },
    { i: 'type_status', x: 6, y: 0, w: 6, h: 5, minW: 4, minH: 4 },
    { i: 'sample_stats', x: 0, y: 5, w: 6, h: 5, minW: 4, minH: 4 },
    { i: 'path_info', x: 6, y: 5, w: 6, h: 5, minW: 4, minH: 4 },
    { i: 'time_info', x: 0, y: 10, w: 6, h: 4, minW: 4, minH: 3 },
    { i: 'description', x: 6, y: 10, w: 6, h: 4, minW: 4, minH: 3 },
    { i: 'mainline_chain', x: 0, y: 14, w: 12, h: 5, minW: 6, minH: 4 },
    { i: 'related_objects', x: 0, y: 19, w: 12, h: 4, minW: 6, minH: 3 },
  ],
  md: [
    { i: 'identity', x: 0, y: 0, w: 4, h: 5, minW: 3, minH: 4 },
    { i: 'type_status', x: 4, y: 0, w: 4, h: 5, minW: 3, minH: 4 },
    { i: 'sample_stats', x: 0, y: 5, w: 4, h: 5, minW: 3, minH: 4 },
    { i: 'path_info', x: 4, y: 5, w: 4, h: 5, minW: 3, minH: 4 },
    { i: 'time_info', x: 0, y: 10, w: 4, h: 4, minW: 3, minH: 3 },
    { i: 'description', x: 4, y: 10, w: 4, h: 4, minW: 3, minH: 3 },
    { i: 'mainline_chain', x: 0, y: 14, w: 8, h: 5, minW: 4, minH: 4 },
    { i: 'related_objects', x: 0, y: 19, w: 8, h: 4, minW: 4, minH: 3 },
  ],
  sm: [
    { i: 'identity', x: 0, y: 0, w: 1, h: 5, minW: 1, minH: 4 },
    { i: 'type_status', x: 0, y: 5, w: 1, h: 5, minW: 1, minH: 4 },
    { i: 'sample_stats', x: 0, y: 10, w: 1, h: 5, minW: 1, minH: 4 },
    { i: 'path_info', x: 0, y: 15, w: 1, h: 5, minW: 1, minH: 4 },
    { i: 'time_info', x: 0, y: 20, w: 1, h: 4, minW: 1, minH: 3 },
    { i: 'description', x: 0, y: 24, w: 1, h: 4, minW: 1, minH: 3 },
    { i: 'mainline_chain', x: 0, y: 28, w: 1, h: 5, minW: 1, minH: 4 },
    { i: 'related_objects', x: 0, y: 33, w: 1, h: 4, minW: 1, minH: 3 },
  ],
};

function fmt(s: string) { try { return new Date(s).toLocaleString('zh-CN'); } catch { return s; } }

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  draft:   { label: '草稿', cls: 'pending' },
  active:  { label: '已启用', cls: 'completed' },
  archived:{ label: '已归档', cls: 'cancelled' },
};

function StatusChip({ status }: { status: string }) {
  const m = STATUS_MAP[status] || { label: status, cls: '' };
  return <StatusBadge s={m.label} />;
}

function DsListItem({ ds, selected, onClick }: { ds: Dataset; selected: boolean; onClick: () => void }) {
  return (
    <div className={`ds-list-card${selected ? ' selected' : ''}`} onClick={onClick}>
      <div className="ds-list-card-row">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ds-list-card-name">{ds.name}</div>
          <div className="ds-list-card-sub">{ds.dataset_code} / {ds.version}</div>
        </div>
        <StatusChip status={ds.status} />
      </div>
    </div>
  );
}

export default function Datasets() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [labelFilter, setLabelFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDs, setSelectedDs] = useState<Dataset | null>(null);
  const [versions, setVersions] = useState<Dataset[]>([]);
  const [relatedTask, setRelatedTask] = useState<Task | null>(null);
  const [pipelineRuns, setPipelineRuns] = useState<any[]>([]);
  const [splits, setSplits] = useState<any[]>([]);
  const [rawJson, setRawJson] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<DetailTab>('overview');
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showVersion, setShowVersion] = useState(false);
  const [newVerInput, setNewVerInput] = useState('');
  const [showPipeline, setShowPipeline] = useState(false);
  const [pipelineType, setPipelineType] = useState<'import'|'split'|'clean'|'full'>('split');
  const [pipelineLoading, setPipelineLoading] = useState(false);

  const [newForm, setNewForm] = useState({
    dataset_code: '', name: '', version: 'v1.0', status: 'draft',
    dataset_type: 'image', label_format: 'json', storage_path: '',
    description: '', sample_count: 0,
    tags_json: '[]', meta_json: '{}',
  });

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

  // ── Fetch list ────────────────────────────────────────────────────────────
  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { limit: 50 };
      if (typeFilter !== 'all')    params.dataset_type = typeFilter;
      if (statusFilter !== 'all')  params.status = statusFilter;
      if (labelFilter !== 'all')   params.label_format = labelFilter;
      const r = await apiService.getDatasets(params);
      if (r.ok) { setDatasets(r.datasets); setTotal(r.total); }
      else setError(r.error || '加载失败');
    } catch(e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [typeFilter, statusFilter, labelFilter]);

  useEffect(() => { fetchList(); }, [fetchList]);

  // ── Auto-select first dataset ─────────────────────────────────────────────
  useEffect(() => {
    if (!loading && datasets.length > 0 && !selectedId) {
      const saved = localStorage.getItem('agi_factory_ds_sel');
      const id = (saved && datasets.find(d => d.id === saved)) ? saved : datasets[0].id;
      setSelectedId(id);
    }
  }, [loading, datasets]);

  // ── Fetch detail ─────────────────────────────────────────────────────────
  const fetchDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    try {
      const r = await apiService.getDataset(id);
      if (r.ok) {
        setSelectedDs(r.dataset);
        setEditForm(r.dataset);
        setVersions(r.versions || []);
        setRawJson(JSON.stringify(r, null, 2));
        if (r.dataset?.source_task_id) {
          try { const tr = await apiService.getTask(r.dataset.source_task_id); setRelatedTask(tr.ok ? tr.task : null); } catch { setRelatedTask(null); }
        } else setRelatedTask(null);
        setPipelineLoading(true);
        try {
          const [pr, sp] = await Promise.all([apiService.listPipelineRuns({ dataset_id: id }), apiService.listSplits({ dataset_id: id })]);
          setPipelineRuns(pr.pipeline_runs || []);
          setSplits(sp.splits || []);
        } catch { setPipelineRuns([]); setSplits([]); }
        finally { setPipelineLoading(false); }
      } else setError(r.error || '加载失败');
    } catch(e: any) { setError(e.message); }
    finally { setDetailLoading(false); }
  }, []);

  useEffect(() => {
    if (selectedId) {
      localStorage.setItem('agi_factory_ds_sel', selectedId);
      fetchDetail(selectedId);
    }
  }, [selectedId, fetchDetail]);

  const handleSelect = (id: string) => { setSelectedId(id); setDetailTab('overview'); };

  const handleCreate = async () => {
    if (!newForm.dataset_code.trim() || !newForm.name.trim()) { setError('请填写数据集编码和名称'); return; }
    setCreating(true); setError(null);
    try {
      const r = await apiService.createDataset(newForm);
      if (r.ok && r.dataset) {
        setSuccessMsg(`数据集「${r.dataset.name}」创建成功`);
        setShowCreate(false);
        setNewForm({ dataset_code: '', name: '', version: 'v1.0', status: 'draft', dataset_type: 'image', label_format: 'json', storage_path: '', description: '', sample_count: 0, tags_json: '[]', meta_json: '{}' });
        await fetchList();
        setSelectedId(r.dataset.id);
      } else setError(r.error || '创建失败');
    } catch(e: any) { setError(e.message); }
    finally { setCreating(false); }
  };

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true); setError(null);
    try {
      const r = await apiService.updateDataset(selectedId, editForm);
      if (r.ok && r.dataset) { setSelectedDs(r.dataset); setEditForm(r.dataset); setSuccessMsg('保存成功'); await fetchList(); }
      else setError(r.error || '保存失败');
    } catch(e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleNewVersion = async () => {
    if (!selectedId || !newVerInput.trim()) { setError('请输入版本号'); return; }
    setSaving(true); setError(null);
    try {
      const r = await apiService.createDatasetNewVersion(selectedId, newVerInput);
      if (r.ok && r.dataset) { setSuccessMsg(`版本 ${newVerInput} 创建成功`); setShowVersion(false); setNewVerInput(''); await fetchDetail(selectedId); await fetchList(); }
      else setError(r.error || '创建失败');
    } catch(e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handlePipeline = async () => {
    if (!selectedId) return;
    setPipelineLoading(true); setError(null);
    try {
      const r = await apiService.createPipelineRun({ name: selectedDs?.name + ' - ' + pipelineType, dataset_id: selectedId, pipeline_type: pipelineType });
      if (r.ok) { setSuccessMsg(`Pipeline ${r.pipeline_run.pipeline_type} started`); setShowPipeline(false); await fetchDetail(selectedId); }
      else setError(r.error || '启动失败');
    } catch(e: any) { setError(e.message); }
    finally { setPipelineLoading(false); }
  };

  const filtered = useMemo(() => {
    let res = [...datasets];
    if (search.trim()) { const q = search.toLowerCase(); res = res.filter(d => d.name.toLowerCase().includes(q) || d.dataset_code.toLowerCase().includes(q) || (d.description || '').toLowerCase().includes(q)); }
    return res.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }, [datasets, search]);

  // Workspace cards for Overview tab
  const workspaceCards = useMemo(() => {
    if (!selectedDs) return [];
    return [
      {
        id: 'identity',
        content: (
          <div className="form-group">
            <label className="form-label">数据集编码</label>
            <input className="form-input" value={editForm.dataset_code || ''} onChange={e => setEditForm({...editForm, dataset_code: e.target.value})} />
          </div>
        ),
      },
      {
        id: 'type_status',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="form-group">
              <label className="form-label">数据集类型</label>
              <select className="ui-select" value={editForm.dataset_type || ''} onChange={e => setEditForm({...editForm, dataset_type: e.target.value})}>
                {DATASET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">状态</label>
              <select className="ui-select" value={editForm.status || ''} onChange={e => setEditForm({...editForm, status: e.target.value as any})}>
                {DATASET_STATUSES.map(s => <option key={s} value={s}>{STATUS_MAP[s]?.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">标注格式</label>
              <select className="ui-select" value={editForm.label_format || ''} onChange={e => setEditForm({...editForm, label_format: e.target.value})}>
                {LABEL_FORMATS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        ),
      },
      {
        id: 'sample_stats',
        content: (
          <InfoTable rows={[
            { label: '样本总数', value: `${editForm.sample_count ?? selectedDs.sample_count} 条` },
            { label: '训练集', value: `${selectedDs.train_count} 条` },
            { label: '验证集', value: `${selectedDs.val_count} 条` },
            { label: '测试集', value: `${selectedDs.test_count} 条` },
          ]} />
        ),
      },
      {
        id: 'path_info',
        content: (
          <InfoTable rows={[
            { label: '存储路径', value: <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{selectedDs.storage_path || '—'}</code> },
            { label: '版本', value: selectedDs.version },
          ]} />
        ),
      },
      {
        id: 'time_info',
        content: (
          <InfoTable rows={[
            { label: '创建时间', value: fmt(selectedDs.created_at) },
            { label: '更新时间', value: fmt(selectedDs.updated_at) },
          ]} />
        ),
      },
      {
        id: 'description',
        content: (
          <div className="form-group" style={{ height: '100%' }}>
            <label className="form-label">描述</label>
            <textarea className="form-input" rows={3} value={editForm.description ?? selectedDs.description} onChange={e => setEditForm({...editForm, description: e.target.value})} style={{ height: 'calc(100% - 24px)' }} />
          </div>
        ),
      },
      {
        id: 'mainline_chain',
        content: (
          <MainlineChainStrip
            compact
            current={selectedDs.id}
            chain={[
              ...(selectedDs.source_task_id ? [{ type: 'task' as const, id: selectedDs.source_task_id, label: '来源Task' }] : []),
              ...((selectedDs as any).pipeline_run_id ? [{ type: 'workflow_job' as const, id: (selectedDs as any).pipeline_run_id, label: 'Pipeline Run' }] : []),
              { type: 'dataset' as const, id: selectedDs.id, label: selectedDs.name, status: selectedDs.status },
              ...((selectedDs as any).related_model_id ? [{ type: 'model' as const, id: (selectedDs as any).related_model_id, label: '关联Model' }] : []),
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
              ...(selectedDs.source_task_id ? [{ type: 'task' as const, id: selectedDs.source_task_id, label: selectedDs.source_task_id.slice(0, 10) + '…', status: undefined }] : []),
              ...((selectedDs as any).pipeline_run_id ? [{ type: 'workflow_job' as const, id: (selectedDs as any).pipeline_run_id, label: 'Pipeline Run', status: undefined }] : []),
              ...((selectedDs as any).related_model_id ? [{ type: 'model' as const, id: (selectedDs as any).related_model_id, label: 'Model', status: undefined }] : []),
            ]}
          />
        ),
      },
    ];
  }, [selectedDs, editForm]);

  // ── Tabs for detail ──────────────────────────────────────────────────────
  const DETAIL_TABS: { key: DetailTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'versions', label: `Versions (${versions.length})` },
    { key: 'source_task', label: 'Source Task' },
    { key: 'pipeline', label: `Pipeline (${pipelineRuns.length})` },
    { key: 'splits', label: `Splits (${splits.length})` },
    { key: 'raw', label: 'Raw JSON' },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="page-root">
      <PageHeader
        title="数据集"
        subtitle={`${filtered.length} / ${total} 条`}
        actions={
          <button className="ui-btn ui-btn-primary" onClick={() => setShowCreate(true)}>+ 新建数据集</button>
        }
      />

      <div className="ds-root" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 16, alignItems: 'start' }}>
        {/* ── Left panel ── */}
        <div className="ds-left" style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {/* Filters */}
          <SectionCard title="筛选" actions={<button className="ui-btn ui-btn-ghost ui-btn-xs" onClick={fetchList}>↻</button>}>
            <div className="ds-filter-row">
              <select className="ui-select" style={{ width: 'auto', minWidth: 100 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="all">全部类型</option>{DATASET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select className="ui-select" style={{ width: 'auto', minWidth: 90 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">全部状态</option>{DATASET_STATUSES.map(s => <option key={s} value={s}>{STATUS_MAP[s]?.label}</option>)}
              </select>
              <select className="ui-select" style={{ width: 'auto', minWidth: 90 }} value={labelFilter} onChange={e => setLabelFilter(e.target.value)}>
                <option value="all">全部标注</option>{LABEL_FORMATS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <input className="ui-input" placeholder="按名称/编码搜索..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginTop: 8 }} />
          </SectionCard>

          {/* Dataset list */}
          <SectionCard title={`数据集列表 (${filtered.length})`}>
            <div style={{ maxHeight: 480, overflowY: 'auto' }}>
              {loading && <EmptyState message="加载中..." />}
              {!loading && filtered.length === 0 && <EmptyState icon="📁" message="无匹配数据集" />}
              {!loading && filtered.map(ds => (
                <DsListItem key={ds.id} ds={ds} selected={selectedId === ds.id} onClick={() => handleSelect(ds.id)} />
              ))}
            </div>
          </SectionCard>
        </div>

        {/* ── Right panel ── */}
        <div className="ds-right" style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {error && <div className="ui-flash ui-flash-err">{error} <button className="ui-btn ui-btn-ghost ui-btn-xs" style={{ marginLeft: 8 }} onClick={() => setError(null)}>×</button></div>}
          {successMsg && <div className="ui-flash ui-flash-ok">{successMsg} <button className="ui-btn ui-btn-ghost ui-btn-xs" style={{ marginLeft: 8 }} onClick={() => setSuccessMsg(null)}>×</button></div>}

          {selectedDs ? (
            <>
              {/* Detail header */}
              <SectionCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>{selectedDs.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                      {selectedDs.id} · {selectedDs.dataset_code} / {selectedDs.version}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button className="ui-btn ui-btn-ghost ui-btn-sm" onClick={() => fetchDetail(selectedDs.id)}>刷新</button>
                    <button className="ui-btn ui-btn-success ui-btn-sm" onClick={handleSave} disabled={saving}>{saving ? '保存中...' : '保存'}</button>
                    <button className="ui-btn ui-btn-outline ui-btn-sm" onClick={() => setShowVersion(true)}>新版本</button>
                    <button className="ui-btn ui-btn-outline ui-btn-sm" onClick={() => navigator.clipboard.writeText(rawJson).then(() => setSuccessMsg('JSON 已复制')).catch(() => setError('复制失败'))}>复制 JSON</button>
                    <button className="ui-btn ui-btn-outline ui-btn-sm" onClick={() => { setSelectedId(null); setSelectedDs(null); }}>取消选中</button>
                  </div>
                </div>
              </SectionCard>

              {/* Tabs */}
              <SectionCard>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 14 }}>
                  {DETAIL_TABS.map(t => (
                    <button
                      key={t.key}
                      onClick={() => setDetailTab(t.key)}
                      style={{
                        padding: '5px 14px', border: 'none', borderRadius: 'var(--radius-md)',
                        cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-sans)',
                        background: detailTab === t.key ? 'var(--primary)' : 'var(--bg-app)',
                        color: detailTab === t.key ? '#fff' : 'var(--text-secondary)',
                        transition: 'background var(--t-fast)',
                      }}
                    >{t.label}</button>
                  ))}
                </div>

                {detailLoading && <EmptyState message="加载中..." icon="⏳" />}

                {!detailLoading && detailTab === 'overview' && (
                  <>
                    {/* Workspace Grid for cards */}
                    {workspaceCards.length > 0 && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>数据集概览工作台</div>
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

                {!detailLoading && detailTab === 'versions' && (
                  <div className="ui-table-wrap">
                    <table className="ui-table">
                      <thead><tr><th>版本</th><th>状态</th><th>样本数</th><th>更新时间</th></tr></thead>
                      <tbody>
                        {[selectedDs, ...versions].sort((a, b) => b.version.localeCompare(a.version)).map(v => (
                          <tr key={v.id} style={{ background: v.id === selectedDs.id ? 'var(--primary-light)' : undefined }}>
                            <td>{v.version} {v.id === selectedDs.id ? '(当前)' : ''}</td>
                            <td><StatusChip status={v.status} /></td>
                            <td>{v.sample_count}</td>
                            <td>{fmt(v.updated_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {!detailLoading && detailTab === 'source_task' && (
                  selectedDs.source_task_id ? (
                    <InfoTable rows={[
                      { label: '来源任务 ID', value: <Link to="/tasks">{selectedDs.source_task_id}</Link> },
                      { label: '来源模板', value: selectedDs.source_template_code || '—' },
                      ...(relatedTask ? [
                        { label: '任务标题', value: <Link to="/tasks">{relatedTask.title}</Link> },
                        { label: '任务状态', value: <StatusChip status={relatedTask.status} /> },
                      ] : []),
                      { label: 'Pipeline 入口', value: <Link to="/runs">查看 Pipeline Runs</Link> },
                    ]} />
                  ) : <EmptyState icon="🔗" message="无来源任务" />
                )}

                {!detailLoading && detailTab === 'pipeline' && (
                  <>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                      {(['import','clean','split','full'] as const).map(t => (
                        <button key={t} className={`ui-btn ui-btn-sm ${pipelineType === t ? 'ui-btn-primary' : 'ui-btn-outline'}`} onClick={() => setPipelineType(t)}>{t}</button>
                      ))}
                      <button className="ui-btn ui-btn-success ui-btn-sm" onClick={handlePipeline} disabled={pipelineLoading}>{pipelineLoading ? '启动中...' : 'Start Pipeline'}</button>
                    </div>
                    <div className="inline-meta-list" style={{ marginBottom: 10 }}>
                      <Link className="linked-entity-chip" to="/tasks">Source Task</Link>
                      <Link className="linked-entity-chip" to="/workflow-jobs">Workflow Jobs</Link>
                      <Link className="linked-entity-chip" to="/runs">Pipeline Runs</Link>
                    </div>
                    {pipelineRuns.length === 0 ? <EmptyState icon="⚙" message="No pipeline runs" /> : (
                      <div className="ui-table-wrap">
                        <table className="ui-table">
                          <thead><tr><th>Name</th><th>Type</th><th>Status</th><th>Created</th></tr></thead>
                          <tbody>{pipelineRuns.map(pr => (
                            <tr key={pr.id}><td>{pr.name}</td><td>{pr.pipeline_type}</td><td><StatusChip status={pr.status} /></td><td>{fmt(pr.created_at)}</td></tr>
                          ))}</tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}

                {!detailLoading && detailTab === 'splits' && (
                  splits.length === 0 ? <EmptyState icon="📊" message="No splits" /> : (
                    <div className="ui-table-wrap">
                      <table className="ui-table">
                        <thead><tr><th>Split</th><th>Count</th><th>Ratio</th></tr></thead>
                        <tbody>{splits.map(sp => (
                          <tr key={sp.id}><td>{sp.split_name}</td><td>{sp.sample_count}</td><td>{sp.ratio != null ? (Number(sp.ratio) * 100).toFixed(1) + '%' : '—'}</td></tr>
                        ))}</tbody>
                      </table>
                    </div>
                  )
                )}

                {!detailLoading && detailTab === 'raw' && (
                  <pre className="json-pre">{rawJson || '—'}</pre>
                )}
              </SectionCard>
            </>
          ) : (
            <SectionCard>
              <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 32, opacity: 0.4, marginBottom: 8 }}>👈</div>
                从左侧选择一个数据集查看详情
              </div>
            </SectionCard>
          )}
        </div>
        </div>
      </div>

      {/* ── Create Modal ── */}
      {showCreate && (
        <div className="ds-modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="ds-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div className="ds-modal-title">创建新数据集</div>
              <button className="ui-btn ui-btn-ghost" onClick={() => setShowCreate(false)}>×</button>
            </div>
            {error && <div className="ui-flash ui-flash-err" style={{ marginBottom: 12 }}>{error}</div>}
            <div className="ds-modal-row"><label className="ds-modal-label">数据集编码 *</label><input className="ui-input" value={newForm.dataset_code} onChange={e => setNewForm({...newForm, dataset_code: e.target.value})} placeholder="如: DS-001" /></div>
            <div className="ds-modal-row"><label className="ds-modal-label">名称 *</label><input className="ui-input" value={newForm.name} onChange={e => setNewForm({...newForm, name: e.target.value})} placeholder="数据集名称" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="ds-modal-row"><label className="ds-modal-label">版本</label><input className="ui-input" value={newForm.version} onChange={e => setNewForm({...newForm, version: e.target.value})} /></div>
              <div className="ds-modal-row"><label className="ds-modal-label">数据集类型</label><select className="ui-select" value={newForm.dataset_type} onChange={e => setNewForm({...newForm, dataset_type: e.target.value})}>{DATASET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            </div>
            <div className="ds-modal-row"><label className="ds-modal-label">标注格式</label><select className="ui-select" value={newForm.label_format} onChange={e => setNewForm({...newForm, label_format: e.target.value})}>{LABEL_FORMATS.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
            <div className="ds-modal-row"><label className="ds-modal-label">描述</label><textarea className="ui-input" rows={2} value={newForm.description} onChange={e => setNewForm({...newForm, description: e.target.value})} /></div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="ui-btn ui-btn-primary" style={{ flex: 1 }} onClick={handleCreate} disabled={creating}>{creating ? '创建中...' : '创建'}</button>
              <button className="ui-btn ui-btn-ghost" onClick={() => setShowCreate(false)}>取消</button>
            </div>
          </div>
        </div>
      )}

      {/* ── New Version Modal ── */}
      {showVersion && (
        <div className="ds-modal-overlay" onClick={() => setShowVersion(false)}>
          <div className="ds-modal" style={{ width: 400 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div className="ds-modal-title">创建新版本</div>
              <button className="ui-btn ui-btn-ghost" onClick={() => setShowVersion(false)}>×</button>
            </div>
            <div className="ds-modal-row"><label className="ds-modal-label">新版本号</label><input className="ui-input" value={newVerInput} onChange={e => setNewVerInput(e.target.value)} placeholder="如: v2.0" /></div>
            <div className="ds-modal-row"><label className="ds-modal-label">当前版本</label><div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{selectedDs?.version}</div></div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="ui-btn ui-btn-primary" style={{ flex: 1 }} onClick={handleNewVersion} disabled={saving}>{saving ? '创建中...' : '创建'}</button>
              <button className="ui-btn ui-btn-ghost" onClick={() => setShowVersion(false)}>取消</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Pipeline Modal ── */}
      {showPipeline && (
        <div className="ds-modal-overlay" onClick={() => setShowPipeline(false)}>
          <div className="ds-modal" style={{ width: 440 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div className="ds-modal-title">Run Pipeline</div>
              <button className="ui-btn ui-btn-ghost" onClick={() => setShowPipeline(false)}>×</button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Pipeline Type</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['import','clean','split','full'] as const).map(t => (
                  <button key={t} className={`ui-btn ui-btn-sm ${pipelineType === t ? 'ui-btn-primary' : 'ui-btn-outline'}`} onClick={() => setPipelineType(t)} style={{ flex: 1 }}>{t}</button>
                ))}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                {pipelineType === 'import' && 'Import raw data into dataset'}
                {pipelineType === 'clean' && 'Clean, dedup, and normalize dataset'}
                {pipelineType === 'split' && 'Split into train/val/test sets'}
                {pipelineType === 'full' && 'Full pipeline: import + clean + split'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="ui-btn ui-btn-primary" style={{ flex: 1 }} onClick={handlePipeline} disabled={pipelineLoading}>{pipelineLoading ? '启动中...' : '启动'}</button>
              <button className="ui-btn ui-btn-ghost" onClick={() => setShowPipeline(false)}>取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
