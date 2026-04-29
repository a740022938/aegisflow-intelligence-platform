import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { apiService, Artifact } from '../services/api';
import { StatusBadge, PageHeader, SectionCard, EmptyState, InfoTable, ReleaseReadinessCard, LineagePanel, ReleaseManifestCard, ReleaseNotesPanel } from '../components/ui';
import type { LineageNode } from '../components/ui/LineagePanel';
import ArtifactOverviewExtras from './ArtifactOverviewExtras';
import WorkspaceGrid from '../layout/WorkspaceGrid';
import { clearLayout, loadLayout, saveLayout, type LayoutConfig } from '../layout/layoutStorage';
import { useResponsiveLayoutMode } from '../hooks/useResponsiveLayoutMode';
import '../components/ui/shared.css';
import './Artifacts.css';

type ArtTab = 'overview' | 'tech' | 'relations' | 'metrics' | 'raw';

const STATUS_LABELS: Record<string, string> = {
  ready: '就绪', draft: '草稿', archived: '已归档',
  deleted: '已删除', failed: '失败',
};
const TYPE_LABELS: Record<string, string> = {
  model: '模型', checkpoint: '检查点', weights: '权重',
  tokenizer: '分词器', adapter: '适配器', embedding_index: 'Embedding 索引',
  config: '配置文件', report: '报告', other: '其他',
};
const SOURCE_LABELS: Record<string, string> = {
  training: '训练', evaluation: '评估', manual: '手工',
  imported: '导入', system: '系统',
};
const PROMO_LABELS: Record<string, string> = {
  draft: '草稿', candidate: '候选', approval_required: '待审批',
  approved: '已批准', rejected: '已拒绝', archived: '已归档',
  sealed: '已封存',
};
const PROMO_COLORS: Record<string, string> = {
  draft: '#9CA3AF', candidate: '#3B82F6', approval_required: '#F59E0B',
  approved: '#10B981', rejected: '#EF4444', archived: '#6B7280',
  sealed: '#8B5CF6',
};

// Workspace layout key
const LAYOUT_KEY = 'artifacts-detail';

// Default layouts for detail workspace cards
const DEFAULT_LAYOUTS: LayoutConfig = {
  lg: [
    { i: 'promo_readiness', x: 0, y: 0, w: 6, h: 6, minW: 4, minH: 4 },
    { i: 'mainline_chain', x: 6, y: 0, w: 6, h: 6, minW: 4, minH: 4 },
    { i: 'release_package', x: 0, y: 6, w: 6, h: 7, minW: 4, minH: 5 },
    { i: 'release_notes', x: 6, y: 6, w: 6, h: 7, minW: 4, minH: 5 },
    { i: 'full_lineage', x: 0, y: 13, w: 12, h: 6, minW: 6, minH: 4 },
  ],
  md: [
    { i: 'promo_readiness', x: 0, y: 0, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'mainline_chain', x: 4, y: 0, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'release_package', x: 0, y: 6, w: 4, h: 7, minW: 3, minH: 5 },
    { i: 'release_notes', x: 4, y: 6, w: 4, h: 7, minW: 3, minH: 5 },
    { i: 'full_lineage', x: 0, y: 13, w: 8, h: 6, minW: 4, minH: 4 },
  ],
  sm: [
    { i: 'promo_readiness', x: 0, y: 0, w: 1, h: 6, minW: 1, minH: 4 },
    { i: 'mainline_chain', x: 0, y: 6, w: 1, h: 6, minW: 1, minH: 4 },
    { i: 'release_package', x: 0, y: 12, w: 1, h: 8, minW: 1, minH: 5 },
    { i: 'release_notes', x: 0, y: 20, w: 1, h: 8, minW: 1, minH: 5 },
    { i: 'full_lineage', x: 0, y: 28, w: 1, h: 6, minW: 1, minH: 4 },
  ],
};

function formatBytes(bytes?: number | null) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

function fmt(s?: string | null) {
  if (!s) return '—';
  try { return new Date(s).toLocaleString('zh-CN'); } catch { return s; }
}

function ArtListItem({ a, selected, onClick }: { a: Artifact; selected: boolean; onClick: () => void }) {
  return (
    <div className={`art-list-item${selected ? ' selected' : ''}`} onClick={onClick}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, alignItems: 'flex-start' }}>
        <span className="art-list-name">{a.name}</span>
        <StatusBadge s={a.status ? STATUS_LABELS[a.status] || a.status : '—'} />
      </div>
      <div className="art-list-sub">{a.artifact_type ? TYPE_LABELS[a.artifact_type] || a.artifact_type : '—'} · {a.source_type ? SOURCE_LABELS[a.source_type] || a.source_type : '—'} · {formatBytes(a.file_size_bytes)}</div>
      <div className="art-list-sub">{fmt(a.created_at)}</div>
    </div>
  );
}

export default function Artifacts() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSource, setFilterSource] = useState('');

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedArt, setSelectedArt] = useState<Artifact | null>(null);
  const [detailTab, setDetailTab] = useState<ArtTab>('overview');
  const [detailLoading, setDetailLoading] = useState(false);
  const [relatedEvals, setRelatedEvals] = useState<any[]>([]);
  const [relatedDeps, setRelatedDeps] = useState<any[]>([]);
  const [sourceTraining, setSourceTraining] = useState<any>(null);

  // Create/Edit form
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', artifact_type: 'model', source_type: 'manual',
    training_job_id: '', model_family: '', framework: '', format: '', version: '1.0',
    storage_path: '', file_size_bytes: 0, description: '',
  });
  const [formError, setFormError] = useState('');

  // Archive / Delete
  const [actionLoading, setActionLoading] = useState(false);

  // v4.8.0: Promotion
  const [promoReadiness, setPromoReadiness] = useState<any>(null);
  const [promoting, setPromoting] = useState(false);

  // v4.9.0: Release
  const [releaseData, setReleaseData] = useState<any>(null);
  const [sealing, setSealing] = useState(false);

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

  // ── Load list ──────────────────────────────────────────────────────────
  const fetchList = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params: any = { limit: 50 };
      if (q) params.q = q;
      if (filterStatus) params.status = filterStatus;
      if (filterType) params.artifact_type = filterType;
      if (filterSource) params.source_type = filterSource;
      const r = await apiService.getArtifacts(params);
      if (r.ok) { setArtifacts(r.artifacts); setTotal(r.total); }
      else setError(r.error || '加载失败');
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [q, filterStatus, filterType, filterSource]);

  useEffect(() => { fetchList(); }, [fetchList]);

  // ── Auto-select first ─────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && artifacts.length > 0 && !selectedId) {
      const saved = localStorage.getItem('agi_factory_art_sel');
      const id = (saved && artifacts.find(a => a.id === saved)) ? saved : artifacts[0].id;
      setSelectedId(id);
    }
  }, [loading, artifacts]);

  // ── Load detail ────────────────────────────────────────────────────────
  const fetchDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    try {
      const r = await apiService.getArtifact(id);
      if (r.ok) {
        setSelectedArt(r.artifact);
        setRelatedEvals(r.related_evaluations || []);
        setRelatedDeps(r.related_deployments || []);
        setSourceTraining(r.source_training || null);
      } else setError(r.error || '加载失败');
      // v4.8.0: fetch promotion readiness
      try {
        const pr = await apiService.getPromotionReadiness(id);
        if (pr.ok) setPromoReadiness(pr.readiness);
        else setPromoReadiness(null);
      } catch { setPromoReadiness(null); }
      // v4.9.0: fetch release data
      try {
        const rr = await apiService.getArtifactRelease(id);
        if (rr.ok) setReleaseData(rr.release);
        else setReleaseData(null);
      } catch { setReleaseData(null); }
    } catch (e: any) { setError(e.message); }
    finally { setDetailLoading(false); }
  }, []);

  useEffect(() => {
    if (selectedId) {
      localStorage.setItem('agi_factory_art_sel', selectedId);
      fetchDetail(selectedId);
    }
  }, [selectedId, fetchDetail]);

  const handleSelect = (id: string) => { setSelectedId(id); setDetailTab('overview'); setEditing(false); };

  // ── Create ────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!form.name.trim()) { setFormError('请填写名称'); return; }
    setCreating(true); setFormError('');
    try {
      const r = await apiService.createArtifact(form as any);
      if (r.ok && r.artifact) {
        setSuccess(`产物「${r.artifact.name}」创建成功`);
        setShowCreate(false);
        setForm({ name: '', artifact_type: 'model', source_type: 'manual', training_job_id: '', model_family: '', framework: '', format: '', version: '1.0', storage_path: '', file_size_bytes: 0, description: '' });
        await fetchList();
        setSelectedId(r.artifact.id);
      } else setFormError(r.error || '创建失败');
    } catch (e: any) { setFormError(e.message || '创建失败'); }
    finally { setCreating(false); }
  };

  // ── Archive ────────────────────────────────────────────────────────────
  const handleArchive = async () => {
    if (!selectedId) return;
    setActionLoading(true);
    try {
      const r = await apiService.archiveArtifact(selectedId);
      if (r.ok) { setSuccess('归档成功'); await fetchDetail(selectedId); await fetchList(); }
      else setError(r.error || '归档失败');
    } catch (e: any) { setError(e.message); }
    finally { setActionLoading(false); }
  };

  // v4.8.0: Promote to Candidate
  const handlePromote = async (requireApproval = true) => {
    if (!selectedId) return;
    setPromoting(true);
    try {
      const r = await apiService.promoteArtifact(selectedId, { require_approval: requireApproval });
      if (r.ok) {
        setSuccess(r.message || '晋升成功');
        await fetchDetail(selectedId);
        await fetchList();
      } else setError(r.error || '晋升失败');
    } catch (e: any) { setError(e.message); }
    finally { setPromoting(false); }
  };

  const handleApprovePromotion = async () => {
    if (!selectedId) return;
    setPromoting(true);
    try {
      const r = await apiService.approvePromotion(selectedId, { reviewed_by: 'operator' });
      if (r.ok) { setSuccess('审批通过'); await fetchDetail(selectedId); await fetchList(); }
      else setError(r.error || '审批失败');
    } catch (e: any) { setError(e.message); }
    finally { setPromoting(false); }
  };

  const handleRejectPromotion = async () => {
    if (!selectedId) return;
    setPromoting(true);
    try {
      const r = await apiService.rejectPromotion(selectedId, { reviewed_by: 'operator' });
      if (r.ok) { setSuccess('已拒绝'); await fetchDetail(selectedId); await fetchList(); }
      else setError(r.error || '拒绝失败');
    } catch (e: any) { setError(e.message); }
    finally { setPromoting(false); }
  };

  // v4.9.0: Seal Release
  const handleSealRelease = async () => {
    if (!selectedId || !selectedArt) return;
    setSealing(true);
    try {
      const r = await apiService.sealRelease(selectedId, {
        sealed_by: 'operator',
        release_name: `${selectedArt.name}-release`,
        release_version: selectedArt.version || '1.0.0',
      });
      if (r.ok) { setSuccess(`发布封存成功: ${r.release_name}`); await fetchDetail(selectedId); await fetchList(); }
      else setError(r.error || '封存失败');
    } catch (e: any) { setError(e.message); }
    finally { setSealing(false); }
  };

  // ── Delete ────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!selectedId) return;
    if (!confirm('确认删除产物「' + selectedArt?.name + '」？')) return;
    setActionLoading(true);
    try {
      const r = await apiService.deleteArtifact(selectedId);
      if (r.ok) { setSuccess('删除成功'); setSelectedId(null); setSelectedArt(null); await fetchList(); }
      else setError(r.error || '删除失败');
    } catch (e: any) { setError(e.message); }
    finally { setActionLoading(false); }
  };

  // ── Copy path ─────────────────────────────────────────────────────────
  const handleCopyPath = () => {
    if (selectedArt?.storage_path) {
      navigator.clipboard.writeText(selectedArt.storage_path)
        .then(() => setSuccess('路径已复制'))
        .catch(() => setError('复制失败'));
    }
  };

  // ── Tabs ───────────────────────────────────────────────────────────────
  const TABS: { key: ArtTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'tech', label: '技术信息' },
    { key: 'relations', label: `关联 (${relatedEvals.length + relatedDeps.length})` },
    { key: 'metrics', label: '指标' },
    { key: 'raw', label: 'Raw JSON' },
  ];

  const filtered = useMemo(() => {
    let res = [...artifacts];
    if (q.trim()) { const qq = q.toLowerCase(); res = res.filter(a => a.name.toLowerCase().includes(qq) || (a.artifact_type || '').toLowerCase().includes(qq)); }
    return res;
  }, [artifacts, q]);
  const readyCount = filtered.filter((a) => a.status === 'ready').length;
  const reportCount = filtered.filter((a) => a.artifact_type === 'report').length;
  const linkedCount = filtered.filter((a: any) => a.source_task_id || a.training_job_id || a.evaluation_id).length;

  // Workspace cards for detail panel (only when artifact selected and has data)
  const workspaceCards = useMemo(() => {
    if (!selectedArt) return [];
    const cards: { id: string; content: React.ReactNode }[] = [];

    // Promotion Readiness Card
    if (promoReadiness) {
      cards.push({
        id: 'promo_readiness',
        content: (
          <div style={{ height: '100%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 700,
                  background: (PROMO_COLORS[promoReadiness.promotion_status] || '#9CA3AF') + '18',
                  color: PROMO_COLORS[promoReadiness.promotion_status] || '#9CA3AF',
                  border: `1.5px solid ${PROMO_COLORS[promoReadiness.promotion_status] || '#9CA3AF'}`,
                }}>
                  {PROMO_LABELS[promoReadiness.promotion_status] || promoReadiness.promotion_status}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  就绪度 {promoReadiness.readiness_score}/{promoReadiness.readiness_max}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                <div style={{ fontSize: 11, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>来源评估</span>
                  <span style={{ fontWeight: 600, color: promoReadiness.has_evaluation ? '#10B981' : '#9CA3AF' }}>{promoReadiness.has_evaluation ? '✅' : '—'}</span>
                </div>
                <div style={{ fontSize: 11, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>指标快照</span>
                  <span style={{ fontWeight: 600, color: promoReadiness.has_metrics ? '#10B981' : '#9CA3AF' }}>{promoReadiness.has_metrics ? '✅' : '—'}</span>
                </div>
                <div style={{ fontSize: 11, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>模型系列</span>
                  <span style={{ fontWeight: 600, color: promoReadiness.has_model_family ? '#10B981' : '#9CA3AF' }}>{promoReadiness.has_model_family ? '✅' : '—'}</span>
                </div>
                <div style={{ fontSize: 11, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>格式标注</span>
                  <span style={{ fontWeight: 600, color: promoReadiness.has_format ? '#10B981' : '#9CA3AF' }}>{promoReadiness.has_format ? '✅' : '—'}</span>
                </div>
              </div>
              {promoReadiness.blocking_issues?.length > 0 && (
                <div style={{ fontSize: 11, color: '#EF4444', borderTop: '1px solid var(--border)', paddingTop: 4 }}>
                  阻塞项: {promoReadiness.blocking_issues.join('; ')}
                </div>
              )}
              <ReleaseReadinessCard data={{
                seal_status: promoReadiness.has_evaluation ? 'sealed' : 'none',
                backup_present: promoReadiness.has_report,
                report_present: promoReadiness.has_report,
                approval_required: promoReadiness.promotion_status === 'approval_required',
                approval_status: promoReadiness.promotion_status === 'approved' ? 'approved'
                  : promoReadiness.promotion_status === 'rejected' ? 'rejected'
                  : promoReadiness.promotion_status === 'approval_required' ? 'pending'
                  : 'not_required',
              }} compact />
            </div>
          </div>
        ),
      });
    }

    // Mainline Chain Card
    cards.push({
      id: 'mainline_chain',
      content: (
        <div style={{ height: '100%', overflowY: 'auto' }}>
          <LineagePanel chain={[
            ...(selectedArt.evaluation_id ? [{ type: 'evaluation' as const, id: selectedArt.evaluation_id, label: '来源评估', status: 'completed' }] : []),
            { type: 'artifact' as const, id: selectedArt.id, label: selectedArt.name, status: selectedArt.promotion_status || 'draft', active: true },
            ...(selectedArt.model_family ? [{ type: 'model' as const, id: selectedArt.model_family, label: selectedArt.model_family, status: selectedArt.promotion_status === 'approved' ? 'approved' : selectedArt.promotion_status === 'sealed' ? 'sealed' : 'draft' }] : []),
            ...(releaseData ? [{ type: 'approval' as const, id: releaseData.approval_id || 'latest', label: '审批', status: 'approved' }] : []),
          ]} />
        </div>
      ),
    });

    // Release Package Card (only when sealed)
    if (selectedArt.promotion_status === 'sealed' && releaseData) {
      cards.push({
        id: 'release_package',
        content: (
          <div style={{ height: '100%', overflowY: 'auto' }}>
            <ReleaseManifestCard release={releaseData} />
          </div>
        ),
      });

      cards.push({
        id: 'release_notes',
        content: (
          <div style={{ height: '100%', overflowY: 'auto' }}>
            <ReleaseNotesPanel
              releaseNotes={releaseData?.release_notes || ''}
              releaseName={releaseData?.release_name || selectedArt.name}
            />
          </div>
        ),
      });

      cards.push({
        id: 'full_lineage',
        content: (
          <div style={{ height: '100%', overflowY: 'auto' }}>
            <LineagePanel chain={[
              ...(selectedArt.evaluation_id ? [{ type: 'evaluation' as const, id: selectedArt.evaluation_id, label: '来源评估', status: 'completed' }] : []),
              { type: 'artifact' as const, id: selectedArt.id, label: selectedArt.name, status: 'approved' },
              { type: 'artifact' as const, id: selectedArt.id, label: '→ Candidate', status: 'candidate' },
              ...(releaseData?.approval_id ? [{ type: 'approval' as const, id: releaseData.approval_id, label: '审批通过', status: 'approved' }] : []),
              ...(releaseData?.model_id ? [{ type: 'model' as const, id: releaseData.model_id, label: '目标模型', status: 'sealed' }] : []),
              ...(releaseData?.id ? [{ type: 'artifact' as const, id: releaseData.id, label: '🔒 Sealed Release', status: 'sealed', active: true }] : []),
            ]} title="封存链路" />
          </div>
        ),
      });
    }

    return cards;
  }, [selectedArt, promoReadiness, releaseData]);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="page-root" ref={contentRef}>
      <PageHeader
        title="产物管理"
        subtitle={`${filtered.length} / ${total} 条`}
        summaryStrip={
          <div className="page-summary-strip">
            <div className="page-summary-item">
              <div className="page-summary-label">ready</div>
              <div className="page-summary-value">{readyCount}</div>
            </div>
            <div className="page-summary-item">
              <div className="page-summary-label">reports</div>
              <div className="page-summary-value">{reportCount}</div>
            </div>
            <div className="page-summary-item">
              <div className="page-summary-label">linked objects</div>
              <div className="page-summary-value">{linkedCount}</div>
            </div>
            <div className="page-summary-item">
              <div className="page-summary-label">selected source</div>
              <div className="page-summary-value" style={{ fontSize: 14 }}>
                {selectedArt?.source_type ? SOURCE_LABELS[selectedArt.source_type] || selectedArt.source_type : '暂无选择'}
              </div>
            </div>
          </div>
        }
        actions={
          <button className="ui-btn ui-btn-primary" onClick={() => setShowCreate(true)}>+ 新建产物</button>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 16, alignItems: 'start' }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <SectionCard title="筛选">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input className="ui-input" placeholder="搜索名称..." value={q} onChange={e => setQ(e.target.value)} />
              <div style={{ display: 'flex', gap: 8 }}>
                <select className="ui-select" style={{ flex: 1 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="">全部状态</option>{Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <select className="ui-select" style={{ flex: 1 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
                  <option value="">全部类型</option>{Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <select className="ui-select" value={filterSource} onChange={e => setFilterSource(e.target.value)}>
                <option value="">全部来源</option>{Object.entries(SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </SectionCard>

          <SectionCard title={`产物列表 (${filtered.length})`} actions={<button className="ui-btn ui-btn-ghost ui-btn-xs" onClick={fetchList}>↻</button>}>
            <div style={{ maxHeight: 540, overflowY: 'auto' }}>
              {loading && <EmptyState message="加载中..." />}
              {!loading && filtered.length === 0 && (
                <EmptyState
                  icon="📦"
                  title="无匹配产物"
                  description="调整筛选条件，或先创建一个 artifact 记录。"
                  primaryAction={<button className="ui-btn ui-btn-primary ui-btn-sm" onClick={() => setShowCreate(true)}>+ 新建产物</button>}
                />
              )}
              {!loading && filtered.map(a => <ArtListItem key={a.id} a={a} selected={selectedId === a.id} onClick={() => handleSelect(a.id)} />)}
            </div>
          </SectionCard>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {error && <div className="ui-flash ui-flash-err">{error} <button className="ui-btn ui-btn-ghost ui-btn-xs" style={{ marginLeft: 8 }} onClick={() => setError(null)}>×</button></div>}
          {success && <div className="ui-flash ui-flash-ok">{success} <button className="ui-btn ui-btn-ghost ui-btn-xs" style={{ marginLeft: 8 }} onClick={() => setSuccess(null)}>×</button></div>}

          {selectedArt ? (
            <>
              <SectionCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{selectedArt.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                      {selectedArt.artifact_type ? TYPE_LABELS[selectedArt.artifact_type] || selectedArt.artifact_type : '—'}
                      {' · '}
                      {selectedArt.source_type ? SOURCE_LABELS[selectedArt.source_type] || selectedArt.source_type : '—'}
                      {' · '}
                      {selectedArt.id}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button className="ui-btn ui-btn-ghost ui-btn-sm" onClick={() => fetchDetail(selectedArt.id)}>刷新</button>
                    {/* v4.8.0: Promotion actions */}
                    {selectedArt.promotion_status === 'draft' && (
                      <button className="ui-btn ui-btn-primary ui-btn-sm" onClick={() => handlePromote(true)} disabled={promoting}>{promoting ? '晋升中...' : '⬆ 晋升候选'}</button>
                    )}
                    {selectedArt.promotion_status === 'rejected' && (
                      <button className="ui-btn ui-btn-primary ui-btn-sm" onClick={() => handlePromote(true)} disabled={promoting}>{promoting ? '重新晋升...' : '⬆ 重新晋升'}</button>
                    )}
                    {selectedArt.promotion_status === 'approval_required' && (
                      <>
                        <button className="ui-btn ui-btn-primary ui-btn-sm" onClick={handleApprovePromotion} disabled={promoting}>{promoting ? '审批中...' : '✅ 批准'}</button>
                        <button className="ui-btn ui-btn-danger ui-btn-sm" onClick={handleRejectPromotion} disabled={promoting}>{promoting ? '拒绝中...' : '❌ 拒绝'}</button>
                      </>
                    )}
                    {selectedArt.promotion_status === 'approved' && (
                      <button className="ui-btn ui-btn-primary ui-btn-sm" onClick={handleSealRelease} disabled={sealing} style={{ background: '#8B5CF6' }}>{sealing ? '封存中...' : '🔒 封存发布'}</button>
                    )}
                    {selectedArt.status !== 'archived' && <button className="ui-btn ui-btn-outline ui-btn-sm" onClick={handleArchive} disabled={actionLoading}>{actionLoading ? '归档中...' : '归档'}</button>}
                    <button className="ui-btn ui-btn-danger ui-btn-sm" onClick={handleDelete} disabled={actionLoading}>{actionLoading ? '删除中...' : '删除'}</button>
                    <button className="ui-btn ui-btn-outline ui-btn-sm" onClick={handleCopyPath} disabled={!selectedArt.storage_path}>复制路径</button>
                    <button className="ui-btn ui-btn-ghost ui-btn-sm" onClick={() => { setSelectedId(null); setSelectedArt(null); }}>取消选中</button>
                  </div>
                </div>
              </SectionCard>

              <SectionCard>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 14 }}>
                  {TABS.map(t => (
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
                  <button className="ui-btn ui-btn-ghost ui-btn-xs" style={{ marginLeft: 4 }} onClick={() => { navigator.clipboard.writeText(JSON.stringify(selectedArt, null, 2)).then(() => setSuccess('JSON 已复制')).catch(() => setError('复制失败')); }}>Copy</button>
                </div>


                {/* v4.6.0 - Chain & Lineage */}
                {!detailLoading && selectedArt && (
                  <ArtifactOverviewExtras art={selectedArt} />
                )}

                {/* Workspace Grid for detail cards */}
                {workspaceCards.length > 0 && detailTab === 'overview' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingTop: 8, borderTop: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>详情工作台</div>
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
                    {loading && !selectedArt ? (
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

                {detailLoading && <EmptyState message="加载中..." icon="⏳" />}

                {!detailLoading && detailTab === 'overview' && !workspaceCards.length && (
                  <InfoTable rows={[
                    { label: 'ID', value: <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{selectedArt.id}</code> },
                    { label: '名称', value: selectedArt.name },
                    { label: '产物类型', value: TYPE_LABELS[selectedArt.artifact_type] || selectedArt.artifact_type || '未标注类型' },
                    { label: '来源', value: SOURCE_LABELS[selectedArt.source_type] || selectedArt.source_type || '未标注来源' },
                    { label: '状态', value: <StatusBadge s={selectedArt.status ? STATUS_LABELS[selectedArt.status] || selectedArt.status : '未标注状态'} /> },
                    { label: '晋升状态', value: <span style={{ color: PROMO_COLORS[selectedArt.promotion_status || 'draft'] || '#9CA3AF', fontWeight: 600 }}>{PROMO_LABELS[selectedArt.promotion_status || 'draft'] || selectedArt.promotion_status || '草稿'}</span> },
                    ...(selectedArt.sealed_at ? [{ label: '封存时间', value: fmt(selectedArt.sealed_at) }] : []),
                    ...(selectedArt.sealed_by ? [{ label: '封存人', value: selectedArt.sealed_by }] : []),
                    ...(selectedArt.release_id ? [{ label: '发布 ID', value: <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{selectedArt.release_id.slice(0, 16)}...</code> }] : []),
                    { label: '模型系列', value: selectedArt.model_family || '未绑定模型系列' },
                    { label: '框架', value: selectedArt.framework || '未标注框架' },
                    { label: '格式', value: selectedArt.format || '未标注格式' },
                    { label: '版本', value: selectedArt.version || '未标注版本' },
                    { label: '文件大小', value: formatBytes(selectedArt.file_size_bytes) },
                    { label: '描述', value: selectedArt.description || '暂无备注' },
                    { label: '创建时间', value: fmt(selectedArt.created_at) },
                    { label: '更新时间', value: fmt(selectedArt.updated_at) },
                  ]} />
                )}

                {!detailLoading && detailTab === 'tech' && (
                  <InfoTable rows={[
                    { label: '存储路径', value: <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, wordBreak: 'break-all' }}>{selectedArt.storage_path || '待生成存储路径'}</code> },
                    { label: 'Artifact ID', value: <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{selectedArt.id}</code> },
                    { label: 'Training Job ID', value: selectedArt.training_job_id ? <Link to="/training">{selectedArt.training_job_id}</Link> : '未关联训练任务' },
                    { label: 'Source Task ID', value: selectedArt.source_task_id ? <Link to="/tasks">{selectedArt.source_task_id}</Link> : '未关联来源任务' },
                    { label: 'Evaluation ID', value: selectedArt.evaluation_id ? <Link to="/evaluations">{selectedArt.evaluation_id}</Link> : '未关联评估' },
                    { label: 'Checkpoint ID', value: selectedArt.checkpoint_id ? <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{selectedArt.checkpoint_id}</code> : '无 checkpoint' },
                    { label: 'tags', value: Array.isArray(selectedArt.tags) ? selectedArt.tags.join(', ') : selectedArt.tags || '无标签' },
                  ]} />
                )}

                {!detailLoading && detailTab === 'relations' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {sourceTraining && (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>来源训练</div>
                        <InfoTable rows={[
                          { label: 'ID', value: <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{sourceTraining.id}</code> },
                          { label: '名称', value: sourceTraining.name || '—' },
                          { label: '状态', value: <StatusBadge s={sourceTraining.status || '—'} /> },
                          { label: '创建时间', value: fmt(sourceTraining.created_at) },
                        ]} />
                      </div>
                    )}
                    {relatedEvals.length > 0 && (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>关联评估（{relatedEvals.length}）</div>
                        <div className="ui-table-wrap">
                          <table className="ui-table">
                            <thead><tr><th>ID</th><th>名称</th><th>状态</th></tr></thead>
                            <tbody>{relatedEvals.map(e => <tr key={e.id}><td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{e.id.slice(0, 8)}...</td><td>{e.name}</td><td><StatusBadge s={e.status} /></td></tr>)}</tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    {relatedDeps.length > 0 && (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>关联部署（{relatedDeps.length}）</div>
                        <div className="ui-table-wrap">
                          <table className="ui-table">
                            <thead><tr><th>ID</th><th>名称</th><th>状态</th></tr></thead>
                            <tbody>{relatedDeps.map(d => <tr key={d.id}><td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{d.id.slice(0, 8)}...</td><td>{d.name}</td><td><StatusBadge s={d.status} /></td></tr>)}</tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    {!sourceTraining && relatedEvals.length === 0 && relatedDeps.length === 0 && <EmptyState icon="🔗" message="无关联信息" />}
                    <div className="inline-meta-list">
                      <Link className="linked-entity-chip" to="/tasks">Source Task</Link>
                      <Link className="linked-entity-chip" to="/models">Model</Link>
                      <Link className="linked-entity-chip" to="/evaluations">Evaluation</Link>
                      <Link className="linked-entity-chip" to="/deployments">Deployment</Link>
                    </div>
                  </div>
                )}

                {!detailLoading && detailTab === 'metrics' && (
                  <InfoTable rows={[
                    { label: 'file_size_bytes', value: formatBytes(selectedArt.file_size_bytes) },
                    { label: 'created_at', value: fmt(selectedArt.created_at) },
                    { label: 'updated_at', value: fmt(selectedArt.updated_at) },
                  ]} />
                )}

                {!detailLoading && detailTab === 'raw' && (
                  <pre className="json-pre">{JSON.stringify(selectedArt, null, 2)}</pre>
                )}
              </SectionCard>
            </>
          ) : (
            <SectionCard>
              <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 32, opacity: 0.4, marginBottom: 8 }}>📦</div>
                从左侧选择一个产物查看详情
              </div>
            </SectionCard>
          )}
        </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="art-modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="art-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div className="art-modal-title">新建产物</div>
              <button className="ui-btn ui-btn-ghost" onClick={() => setShowCreate(false)}>×</button>
            </div>
            {formError && <div className="ui-flash ui-flash-err" style={{ marginBottom: 12 }}>{formError}</div>}
            <div className="art-modal-row"><label className="art-modal-label">名称 *</label><input className="ui-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="产物名称" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="art-modal-row"><label className="art-modal-label">产物类型</label><select className="ui-select" value={form.artifact_type} onChange={e => setForm({...form, artifact_type: e.target.value})}>{Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
              <div className="art-modal-row"><label className="art-modal-label">来源</label><select className="ui-select" value={form.source_type} onChange={e => setForm({...form, source_type: e.target.value})}>{Object.entries(SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
              <div className="art-modal-row"><label className="art-modal-label">模型系列</label><input className="ui-input" value={form.model_family} onChange={e => setForm({...form, model_family: e.target.value})} /></div>
              <div className="art-modal-row"><label className="art-modal-label">框架</label><input className="ui-input" value={form.framework} onChange={e => setForm({...form, framework: e.target.value})} /></div>
              <div className="art-modal-row"><label className="art-modal-label">格式</label><input className="ui-input" value={form.format} onChange={e => setForm({...form, format: e.target.value})} /></div>
              <div className="art-modal-row"><label className="art-modal-label">版本</label><input className="ui-input" value={form.version} onChange={e => setForm({...form, version: e.target.value})} /></div>
            </div>
            <div className="art-modal-row"><label className="art-modal-label">存储路径</label><input className="ui-input" value={form.storage_path} onChange={e => setForm({...form, storage_path: e.target.value})} style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} /></div>
            <div className="art-modal-row"><label className="art-modal-label">描述</label><textarea className="ui-input" rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="ui-btn ui-btn-primary" style={{ flex: 1 }} onClick={handleCreate} disabled={creating}>{creating ? '创建中...' : '创建'}</button>
              <button className="ui-btn ui-btn-ghost" onClick={() => setShowCreate(false)}>取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
