import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  StatusBadge,
  PageHeader,
  SectionCard,
  EmptyState,
  InfoTable,
  VisionSurfaceStrip,
  ReleaseReadinessCard,
  EntityLinkChips,
  LineagePanel,
  ReleaseManifestCard,
  ReleaseNotesPanel,
} from '../components/ui';
import WorkspaceGrid from '../layout/WorkspaceGrid';
import { clearLayout, loadLayout, saveLayout, type LayoutConfig } from '../layout/layoutStorage';
import '../components/ui/shared.css';
import './Models.css';

interface Model {
  model_id: string;
  name: string;
  version: string;
  source_experiment_id: string | null;
  checkpoint_path: string | null;
  export_path: string | null;
  release_note: string | null;
  created_at: string;
  // v4.8.0 promotion fields
  promotion_status?: string;
  source_artifact_id?: string;
  promotion_comment?: string;
  // v4.9.0 seal fields
  sealed_at?: string;
  sealed_by?: string;
  release_id?: string;
}

interface ModelDetail extends Model {
  source_experiment?: { id: string; name: string; status: string } | null;
  artifacts?: any[];
  deployments?: any[];
  evaluations?: any[];
  execution_metadata?: Record<string, any>;
  metrics?: Record<string, any>;
  report_paths?: Record<string, any>;
  stats?: {
    artifact_count: number;
    deployment_count: number;
    evaluation_count: number;
  };
}

type DetailTab = 'overview' | 'artifacts' | 'packages' | 'deployments' | 'evaluations' | 'raw';

// Workspace layout key
const LAYOUT_KEY = 'models-detail';

// Default layouts for detail workspace cards
const DEFAULT_LAYOUTS: LayoutConfig = {
  lg: [
    { i: 'identity', x: 0, y: 0, w: 6, h: 5, minW: 4, minH: 4 },
    { i: 'source_lineage', x: 6, y: 0, w: 6, h: 6, minW: 4, minH: 4 },
    { i: 'package_export', x: 0, y: 5, w: 6, h: 5, minW: 4, minH: 4 },
    { i: 'release_candidate', x: 6, y: 6, w: 6, h: 8, minW: 4, minH: 5 },
    { i: 'artifact_report', x: 0, y: 10, w: 6, h: 6, minW: 4, minH: 4 },
    { i: 'release_governance', x: 6, y: 14, w: 6, h: 6, minW: 4, minH: 4 },
    { i: 'source_entity', x: 0, y: 16, w: 6, h: 4, minW: 4, minH: 3 },
    { i: 'produces_downstream', x: 6, y: 20, w: 6, h: 4, minW: 4, minH: 3 },
    { i: 'vision_surface', x: 0, y: 20, w: 12, h: 5, minW: 6, minH: 4 },
    { i: 'related_evaluations', x: 0, y: 25, w: 6, h: 4, minW: 4, minH: 3 },
    { i: 'basic_info', x: 6, y: 24, w: 6, h: 5, minW: 4, minH: 4 },
    { i: 'execution_metadata', x: 0, y: 29, w: 6, h: 5, minW: 4, minH: 4 },
    { i: 'metrics', x: 6, y: 29, w: 6, h: 5, minW: 4, minH: 4 },
    { i: 'report_paths', x: 0, y: 34, w: 6, h: 6, minW: 4, minH: 4 },
    { i: 'snapshot_paths', x: 6, y: 34, w: 6, h: 5, minW: 4, minH: 4 },
    { i: 'path_info', x: 0, y: 40, w: 6, h: 4, minW: 4, minH: 3 },
    { i: 'stats', x: 6, y: 39, w: 6, h: 5, minW: 4, minH: 3 },
  ],
  md: [
    { i: 'identity', x: 0, y: 0, w: 4, h: 5, minW: 3, minH: 4 },
    { i: 'source_lineage', x: 4, y: 0, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'package_export', x: 0, y: 5, w: 4, h: 5, minW: 3, minH: 4 },
    { i: 'release_candidate', x: 4, y: 6, w: 4, h: 8, minW: 3, minH: 5 },
    { i: 'artifact_report', x: 0, y: 10, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'release_governance', x: 4, y: 14, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'source_entity', x: 0, y: 16, w: 4, h: 4, minW: 3, minH: 3 },
    { i: 'produces_downstream', x: 4, y: 20, w: 4, h: 4, minW: 3, minH: 3 },
    { i: 'vision_surface', x: 0, y: 20, w: 8, h: 5, minW: 4, minH: 4 },
    { i: 'related_evaluations', x: 0, y: 25, w: 4, h: 4, minW: 3, minH: 3 },
    { i: 'basic_info', x: 4, y: 24, w: 4, h: 5, minW: 3, minH: 4 },
    { i: 'execution_metadata', x: 0, y: 29, w: 4, h: 5, minW: 3, minH: 4 },
    { i: 'metrics', x: 4, y: 29, w: 4, h: 5, minW: 3, minH: 4 },
    { i: 'report_paths', x: 0, y: 34, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'snapshot_paths', x: 4, y: 34, w: 4, h: 5, minW: 3, minH: 4 },
    { i: 'path_info', x: 0, y: 40, w: 4, h: 4, minW: 3, minH: 3 },
    { i: 'stats', x: 4, y: 39, w: 4, h: 5, minW: 3, minH: 3 },
  ],
  sm: [
    { i: 'identity', x: 0, y: 0, w: 1, h: 5, minW: 1, minH: 4 },
    { i: 'source_lineage', x: 0, y: 5, w: 1, h: 6, minW: 1, minH: 4 },
    { i: 'package_export', x: 0, y: 11, w: 1, h: 5, minW: 1, minH: 4 },
    { i: 'release_candidate', x: 0, y: 16, w: 1, h: 8, minW: 1, minH: 5 },
    { i: 'artifact_report', x: 0, y: 24, w: 1, h: 6, minW: 1, minH: 4 },
    { i: 'release_governance', x: 0, y: 30, w: 1, h: 6, minW: 1, minH: 4 },
    { i: 'source_entity', x: 0, y: 36, w: 1, h: 4, minW: 1, minH: 3 },
    { i: 'produces_downstream', x: 0, y: 40, w: 1, h: 4, minW: 1, minH: 3 },
    { i: 'vision_surface', x: 0, y: 44, w: 1, h: 5, minW: 1, minH: 4 },
    { i: 'related_evaluations', x: 0, y: 49, w: 1, h: 4, minW: 1, minH: 3 },
    { i: 'basic_info', x: 0, y: 53, w: 1, h: 5, minW: 1, minH: 4 },
    { i: 'execution_metadata', x: 0, y: 58, w: 1, h: 5, minW: 1, minH: 4 },
    { i: 'metrics', x: 0, y: 63, w: 1, h: 5, minW: 1, minH: 4 },
    { i: 'report_paths', x: 0, y: 68, w: 1, h: 6, minW: 1, minH: 4 },
    { i: 'snapshot_paths', x: 0, y: 74, w: 1, h: 5, minW: 1, minH: 4 },
    { i: 'path_info', x: 0, y: 79, w: 1, h: 4, minW: 1, minH: 3 },
    { i: 'stats', x: 0, y: 83, w: 1, h: 5, minW: 1, minH: 3 },
  ],
};

function fmt(s?: string | null) {
  if (!s) return '暂无记录';
  try { return new Date(s).toLocaleString('zh-CN'); } catch { return s; }
}

function safeText(v: any, fallback = '暂无记录') {
  if (v === undefined || v === null || v === '') return fallback;
  return String(v);
}

function short(v: any) {
  const s = safeText(v, '');
  if (!s) return '';
  return s.length > 16 ? `${s.slice(0, 8)}...${s.slice(-4)}` : s;
}

function ModelListItem({ model, selected, onClick }: { model: Model; selected: boolean; onClick: () => void }) {
  const lineage = model.source_experiment_id ? `来源实验 ${model.source_experiment_id.slice(0, 8)}` : '未绑定来源实验';
  const packageHint = model.export_path ? '已导出' : model.checkpoint_path ? '仅检查点' : '未产出';
  return (
    <div className={`model-list-item${selected ? ' selected' : ''}`} onClick={onClick}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
        <span className="model-list-name">{model.name}</span>
        <span className="model-version-badge">{model.version}</span>
      </div>
      <div className="model-list-sub">{lineage}</div>
      <div className="model-list-sub">{packageHint} · {fmt(model.created_at)}</div>
    </div>
  );
}

export default function Models() {
  const [models, setModels] = useState<Model[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [q, setQ] = useState('');

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelDetail | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>('overview');
  const [detailLoading, setDetailLoading] = useState(false);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: '',
    version: '1.0.0',
    source_experiment_id: '',
    checkpoint_path: '',
    export_path: '',
    release_note: '',
  });
  const [formError, setFormError] = useState('');

  // Delete
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Packages for selected model
  const [modelPackages, setModelPackages] = useState<any[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [showCreatePackage, setShowCreatePackage] = useState(false);
  const [creatingPackage, setCreatingPackage] = useState(false);
  const [packageForm, setPackageForm] = useState({
    package_name: '',
    package_version: '1.0.0',
    artifact_ids: [] as string[],
    release_note: '',
  });
  const [packageFormError, setPackageFormError] = useState('');

  // v3.5.0: Compare state
  const [showCompare, setShowCompare] = useState(false);
  const [compareWith, setCompareWith] = useState('');
  const [compareResult, setCompareResult] = useState<any>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState('');

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

  // Fetch list
  const fetchModels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      const resp = await fetch(`/api/models?${params}`);
      const data = await resp.json();
      if (data.ok) {
        setModels(data.models);
        setTotal(data.total);
      } else {
        setError(data.error || 'Failed to fetch models');
      }
    } catch (e: any) {
      setError(e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  // Fetch detail
  const fetchDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    try {
      const resp = await fetch(`/api/models/${id}/detail`);
      const data = await resp.json();
      if (data.ok) {
        const base = data.model || {};
        const merged: ModelDetail = {
          model_id: base.model_id || id,
          name: base.name || '未命名模型',
          version: base.version || '0.0.0',
          source_experiment_id: base.source_experiment_id || null,
          checkpoint_path: base.checkpoint_path || base.artifact_path || null,
          export_path: base.export_path || base.artifact_path || null,
          release_note: base.release_note || null,
          created_at: base.created_at || '',
          source_experiment: data.source_experiment || null,
          artifacts: data.artifacts || [],
          deployments: data.deployments || [],
          evaluations: data.evaluations || [],
          stats: data.stats || {
            artifact_count: (data.artifacts || []).length,
            deployment_count: (data.deployments || []).length,
            evaluation_count: (data.evaluations || []).length,
          },
          ...(data.metrics ? { metrics: data.metrics } : {}),
          ...(data.report_paths ? { report_paths: data.report_paths } : {}),
          ...(data.execution_metadata ? { execution_metadata: data.execution_metadata } : {}),
          ...(data.compare_available !== undefined ? { compare_available: data.compare_available } : {}),
          ...(data.patch_sets ? { patch_sets: data.patch_sets } : {}),
          ...(data.sam_handoffs ? { sam_handoffs: data.sam_handoffs } : {}),
          ...(data.sam_segmentations ? { sam_segmentations: data.sam_segmentations } : {}),
          ...(data.classifier_verifications ? { classifier_verifications: data.classifier_verifications } : {}),
          ...(data.tracker_runs ? { tracker_runs: data.tracker_runs } : {}),
          ...(data.rule_engine_runs ? { rule_engine_runs: data.rule_engine_runs } : {}),
        } as any;
        setSelectedModel(merged);
      }
    } catch (e) {
      console.error('Failed to fetch detail:', e);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetchDetail(selectedId);
      fetchModelPackages(selectedId);
    } else {
      setSelectedModel(null);
      setModelPackages([]);
    }
  }, [selectedId, fetchDetail]);

  // Fetch packages for model
  const fetchModelPackages = useCallback(async (modelId: string) => {
    setPackagesLoading(true);
    try {
      const resp = await fetch(`/api/packages?model_id=${modelId}`);
      const data = await resp.json();
      if (data.ok) {
        setModelPackages(data.packages);
      }
    } catch (e) {
      console.error('Failed to fetch packages:', e);
    } finally {
      setPackagesLoading(false);
    }
  }, []);

  // Create
  const handleCreate = async () => {
    if (!form.name.trim()) {
      setFormError('名称不能为空');
      return;
    }
    setCreating(true);
    setFormError('');
    try {
      const resp = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await resp.json();
      if (data.ok) {
        setSuccess('模型创建成功');
        setShowCreate(false);
        setForm({ name: '', version: '1.0.0', source_experiment_id: '', checkpoint_path: '', export_path: '', release_note: '' });
        fetchModels();
        setSelectedId(data.model.model_id);
      } else {
        setFormError(data.error || '创建失败');
      }
    } catch (e: any) {
      setFormError(e.message || '网络错误');
    } finally {
      setCreating(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!selectedId) return;
    setDeleting(true);
    try {
      const resp = await fetch(`/api/models/${selectedId}`, { method: 'DELETE' });
      const data = await resp.json();
      if (data.ok) {
        setSuccess('模型已删除');
        setShowDelete(false);
        setSelectedId(null);
        fetchModels();
      } else {
        setError(data.error || '删除失败');
      }
    } catch (e: any) {
      setError(e.message || '网络错误');
    } finally {
      setDeleting(false);
    }
  };

  // Clear messages
  useEffect(() => {
    if (success) setTimeout(() => setSuccess(null), 3000);
    if (error) setTimeout(() => setError(null), 5000);
  }, [success, error]);

  // Create Package
  const handleCreatePackage = async () => {
    if (!selectedId || !packageForm.package_name.trim()) {
      setPackageFormError('包名称不能为空');
      return;
    }
    setCreatingPackage(true);
    setPackageFormError('');
    try {
      const resp = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_id: selectedId,
          ...packageForm,
        }),
      });
      const data = await resp.json();
      if (data.ok) {
        setSuccess('Package 创建成功');
        setShowCreatePackage(false);
        setPackageForm({ package_name: '', package_version: '1.0.0', artifact_ids: [], release_note: '' });
        fetchModelPackages(selectedId);
      } else {
        setPackageFormError(data.error || '创建失败');
      }
    } catch (e: any) {
      setPackageFormError(e.message || '网络错误');
    } finally {
      setCreatingPackage(false);
    }
  };

  // Build Package
  const handleBuildPackage = async (packageId: string) => {
    try {
      const resp = await fetch(`/api/packages/${packageId}/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      const data = await resp.json();
      if (data.ok) {
        setSuccess('Package 构建成功');
        if (selectedId) fetchModelPackages(selectedId);
      } else {
        setError(data.error || '构建失败');
      }
    } catch (e: any) {
      setError(e.message || '网络错误');
    }
  };

  // Publish Package
  const handlePublishPackage = async (packageId: string) => {
    try {
      const resp = await fetch(`/api/packages/${packageId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      const data = await resp.json();
      if (data.ok) {
        setSuccess('Package 发布成功');
        if (selectedId) fetchModelPackages(selectedId);
      } else {
        setError(data.error || '发布失败');
      }
    } catch (e: any) {
      setError(e.message || '网络错误');
    }
  };

  const releasedCount = models.filter((m) => !!m.export_path).length;
  const draftCount = models.filter((m) => !m.export_path).length;
  const visionCapableCount = models.filter((m) => !!m.checkpoint_path || !!m.source_experiment_id).length;
  const withArtifactCount = models.filter((m) => !!m.export_path || !!m.checkpoint_path).length;

  const visionItems = [
    {
      key: 'detect',
      label: 'detect',
      status: (selectedModel as any)?.source_experiment ? 'ready' : '未接入',
      summary: (selectedModel as any)?.source_experiment
        ? `detector ${safeText((selectedModel as any)?.source_experiment?.name, '来源实验')}`
        : '未接入检测来源',
      links: [{ label: 'Task', to: '/tasks' }],
    },
    {
      key: 'handoff',
      label: 'handoff',
      status: (selectedModel as any)?.sam_handoffs?.length ? 'ready' : '未接入',
      summary: (selectedModel as any)?.sam_handoffs?.length
        ? `handoff ${safeText(short((selectedModel as any).sam_handoffs?.[0]?.handoff_id), '可用')}`
        : '未产出交接件',
      links: [{ label: 'Artifact', to: '/artifacts' }],
    },
    {
      key: 'segment',
      label: 'segment',
      status: (selectedModel as any)?.sam_segmentations?.length ? 'ready' : '未接入',
      summary: (selectedModel as any)?.sam_segmentations?.length
        ? `segment ${safeText(short((selectedModel as any).sam_segmentations?.[0]?.segmentation_id), '可用')}`
        : '未产出分割结果',
      links: [{ label: 'Artifact', to: '/artifacts' }],
    },
    {
      key: 'verify',
      label: 'verify',
      status: (selectedModel as any)?.classifier_verifications?.length ? 'ready' : '未接入',
      summary: (selectedModel as any)?.classifier_verifications?.length
        ? `verify ${safeText(short((selectedModel as any).classifier_verifications?.[0]?.verification_id), '可用')}`
        : '未产出校验结果',
      links: [{ label: 'Evaluations', to: '/evaluations' }],
    },
    {
      key: 'track',
      label: 'track',
      status: (selectedModel as any)?.tracker_runs?.length ? 'ready' : '未接入',
      summary: (selectedModel as any)?.tracker_runs?.length
        ? `track ${safeText(short((selectedModel as any).tracker_runs?.[0]?.tracker_run_id), '可用')}`
        : '未产出时序结果',
      links: [{ label: 'Runs', to: '/runs' }],
    },
    {
      key: 'rules',
      label: 'rules',
      status: (selectedModel as any)?.rule_engine_runs?.length ? 'ready' : '未接入',
      summary: (selectedModel as any)?.rule_engine_runs?.length
        ? `rules ${safeText(short((selectedModel as any).rule_engine_runs?.[0]?.rule_run_id), '可用')}`
        : '未产出规则结果',
      links: [{ label: 'Workflow', to: '/workflow-jobs' }],
    },
  ];

  // Workspace cards for Overview tab
  const workspaceCards = useMemo(() => {
    if (!selectedModel) return [];
    const cards: { id: string; content: React.ReactNode }[] = [];

    cards.push({
      id: 'identity',
      content: (
        <InfoTable
          rows={[
            ['模型名称', selectedModel.name],
            ['版本', selectedModel.version],
            ['模型 ID', selectedModel.model_id],
            ['创建时间', fmt(selectedModel.created_at)],
          ]}
        />
      ),
    });

    cards.push({
      id: 'source_lineage',
      content: (
        <>
          <div className="entity-lineage-block">
            <div className="entity-lineage-item">
              <div className="entity-lineage-label">Source Experiment</div>
              <div className="entity-lineage-value">
                {selectedModel.source_experiment?.name || '未绑定来源实验'}
              </div>
            </div>
            <div className="entity-lineage-item">
              <div className="entity-lineage-label">Template</div>
              <div className="entity-lineage-value">
                {safeText((selectedModel as any)?.template_code, '暂无模板信息')}
              </div>
            </div>
            <div className="entity-lineage-item">
              <div className="entity-lineage-label">Source Task</div>
              <div className="entity-lineage-value">
                {safeText((selectedModel as any)?.source_task_id, '未绑定来源任务')}
              </div>
            </div>
          </div>
          <div className="inline-meta-list" style={{ marginTop: 10 }}>
            <Link className="linked-entity-chip" to="/training">Experiments</Link>
            <Link className="linked-entity-chip" to="/tasks">Tasks</Link>
            <Link className="linked-entity-chip" to="/workflow-jobs">Workflow Jobs</Link>
          </div>
        </>
      ),
    });

    cards.push({
      id: 'package_export',
      content: (
        <InfoTable
          rows={[
            ['检查点路径', selectedModel.checkpoint_path || '暂无检查点'],
            ['导出路径', selectedModel.export_path || '未导出'],
            ['Package 数', modelPackages.length ? String(modelPackages.length) : '暂无 package'],
            ['发布说明', selectedModel.release_note || '无发布说明'],
          ]}
        />
      ),
    });

    cards.push({
      id: 'release_candidate',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{
              padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 700,
              background: ({ draft: '#9CA3AF18', candidate: '#3B82F618', approval_required: '#F59E0B18', approved: '#10B98118', rejected: '#EF444418', sealed: '#8B5CF618' } as any)[selectedModel.promotion_status || 'draft'] || '#9CA3AF18',
              color: ({ draft: '#9CA3AF', candidate: '#3B82F6', approval_required: '#F59E0B', approved: '#10B981', rejected: '#EF4444', sealed: '#8B5CF6' } as any)[selectedModel.promotion_status || 'draft'] || '#9CA3AF',
              border: '1.5px solid ' + (({ draft: '#9CA3AF', candidate: '#3B82F6', approval_required: '#F59E0B', approved: '#10B981', rejected: '#EF4444', sealed: '#8B5CF6' } as any)[selectedModel.promotion_status || 'draft'] || '#9CA3AF'),
            }}>
              {({ draft: '草稿', candidate: '候选发布', approval_required: '待审批', approved: '已批准发布', rejected: '已拒绝', sealed: '🔒 已封存发布' } as any)[selectedModel.promotion_status || 'draft'] || '草稿'}
            </span>
            {selectedModel.source_artifact_id && (
              <Link to={{ pathname: '/artifacts', search: `?highlight=${selectedModel.source_artifact_id}` }} style={{
                fontSize: 11, color: '#F59E0B', textDecoration: 'none', fontWeight: 600,
              }}>
                📦 来自 Artifact {selectedModel.source_artifact_id.slice(0, 8)}...
              </Link>
            )}
          </div>
          <InfoTable rows={[
            ['晋升状态', ({ draft: '草稿', candidate: '候选发布', approval_required: '待审批', approved: '已批准', rejected: '已拒绝', sealed: '已封存发布' } as any)[selectedModel.promotion_status || 'draft'] || '草稿'],
            ['来源 Artifact', selectedModel.source_artifact_id ? <Link to="/artifacts" style={{ color: 'var(--primary)', textDecoration: 'none' }}>{selectedModel.source_artifact_id.slice(0, 12)}...</Link> : '未关联'],
            ['晋升备注', selectedModel.promotion_comment || '无'],
            ['最新评估', (selectedModel as any).latest_evaluation_id ? <Link to="/evaluations" style={{ color: 'var(--primary)', textDecoration: 'none' }}>{(selectedModel as any).latest_evaluation_id.slice(0, 12)}...</Link> : '暂无评估'],
            ...(selectedModel.sealed_at ? [
              ['封存时间', selectedModel.sealed_at ? new Date(selectedModel.sealed_at).toLocaleString() : '—'],
              ['封存人', selectedModel.sealed_by || '—'],
              ['发布 ID', selectedModel.release_id ? <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{selectedModel.release_id.slice(0, 16)}...</code> : '—'],
            ] as any[] : []),
          ]} />
          <LineagePanel chain={[
            ...(selectedModel.source_experiment_id ? [{ type: 'experiment' as const, id: selectedModel.source_experiment_id, label: '来源实验', status: 'completed' }] : []),
            ...(selectedModel.source_artifact_id ? [{ type: 'artifact' as const, id: selectedModel.source_artifact_id, label: '来源 Artifact', status: 'ready' }] : []),
            { type: 'model' as const, id: selectedModel.model_id, label: selectedModel.name, status: selectedModel.promotion_status || 'draft', active: true },
            ...(selectedModel.promotion_status === 'approved' || selectedModel.promotion_status === 'sealed' ? [{ type: 'approval' as const, id: 'latest', label: '已审批', status: 'approved' }] : []),
            ...(selectedModel.promotion_status === 'sealed' ? [{ type: 'artifact' as const, id: selectedModel.release_id || 'release', label: '🔒 Sealed Release', status: 'sealed' }] : []),
          ]} title="晋升链路" />
        </div>
      ),
    });

    cards.push({
      id: 'artifact_report',
      content: (
        <>
          <InfoTable
            rows={[
              ['关联产物', selectedModel.artifacts?.length ? String(selectedModel.artifacts.length) : '未产出产物'],
              ['关联评估', selectedModel.evaluations?.length ? String(selectedModel.evaluations.length) : '暂无评估记录'],
              ['metrics.json', (selectedModel as any)?.report_paths?.report_path || '暂无报告'],
              ['eval_manifest_path', (selectedModel as any)?.report_paths?.eval_manifest_path || '待生成'],
              ['badcases_manifest', (selectedModel as any)?.report_paths?.badcases_manifest_path || '暂无记录'],
              ['hardcases_manifest', (selectedModel as any)?.report_paths?.hardcases_manifest_path || '暂无记录'],
            ]}
          />
          <div className="inline-meta-list" style={{ marginTop: 10 }}>
            <Link className="linked-entity-chip" to="/artifacts">Artifacts</Link>
            <Link className="linked-entity-chip" to="/evaluations">Evaluations</Link>
            <Link className="linked-entity-chip" to="/deployments">Deployments</Link>
          </div>
        </>
      ),
    });

    cards.push({
      id: 'release_governance',
      content: (
        <>
          <ReleaseReadinessCard
            data={{
              seal_status: (selectedModel as any).seal_status || 'none',
              backup_present: !!(selectedModel as any).backup_path,
              report_present: !!((selectedModel as any)?.report_paths?.report_path),
              approval_required: (selectedModel as any).requires_approval === true,
              approval_status: (selectedModel as any).approval_status || 'none',
              last_backup_at: (selectedModel as any).last_backup_at,
              last_report_at: (selectedModel as any).last_report_at,
            }}
          />
          {(selectedModel as any).approval_status === 'approved' && (
            <div style={{ marginTop: 8, fontSize: 11, color: '#10B981' }}>
              ✅ 已通过审批，可进入发布流程
            </div>
          )}
        </>
      ),
    });

    cards.push({
      id: 'source_entity',
      content: (
        <EntityLinkChips
          label="来源对象"
          entities={[
            ...((selectedModel as any).source_task_id ? [{ type: 'task' as const, id: (selectedModel as any).source_task_id, label: ((selectedModel as any).source_task_id as string).slice(0, 12) + '…', status: undefined }] : []),
            ...((selectedModel as any).source_experiment_id ? [{ type: 'workflow_job' as const, id: (selectedModel as any).source_experiment_id, label: ((selectedModel as any).source_experiment_id as string).slice(0, 12) + '…', status: undefined }] : []),
            ...((selectedModel as any).source_evaluation_id ? [{ type: 'evaluation' as const, id: (selectedModel as any).source_evaluation_id, label: ((selectedModel as any).source_evaluation_id as string).slice(0, 12) + '…', status: undefined }] : []),
          ]}
        />
      ),
    });

    cards.push({
      id: 'produces_downstream',
      content: (
        <EntityLinkChips
          label="产出对象"
          entities={[
            ...((selectedModel.artifacts?.length || 0) > 0 ? [{ type: 'artifact' as const, id: String((selectedModel as any).model_id), label: `${selectedModel.artifacts!.length} 个产物`, status: 'ready' }] : []),
            ...((selectedModel.evaluations?.length || 0) > 0 ? [{ type: 'evaluation' as const, id: String((selectedModel as any).model_id), label: `${selectedModel.evaluations!.length} 次评估`, status: 'completed' }] : []),
          ]}
        />
      ),
    });

    cards.push({
      id: 'vision_surface',
      content: <VisionSurfaceStrip items={visionItems as any} />,
    });

    cards.push({
      id: 'related_evaluations',
      content: (
        <div className="inline-meta-list">
          <Link className="linked-entity-chip" to="/evaluations">查看全部评估</Link>
          <Link className="linked-entity-chip" to="/training">查看实验训练</Link>
          <Link className="linked-entity-chip" to="/runs">查看运行记录</Link>
        </div>
      ),
    });

    cards.push({
      id: 'basic_info',
      content: (
        <InfoTable
          rows={[
            ['名称', selectedModel.name],
            ['版本', selectedModel.version],
            ['创建时间', fmt(selectedModel.created_at)],
            ['来源实验', selectedModel.source_experiment?.name || '未绑定来源实验'],
          ]}
        />
      ),
    });

    if (selectedModel.execution_metadata) {
      cards.push({
        id: 'execution_metadata',
        content: (
          <InfoTable
            rows={[
              ['执行模式', selectedModel.execution_metadata.execution_mode || '—'],
              ['Preflight 状态', selectedModel.execution_metadata.preflight_status || '—'],
              ['运行设备', selectedModel.execution_metadata.final_device || '—'],
              ['恢复训练', selectedModel.execution_metadata.resume_used ? '是' : '否'],
            ]}
          />
        ),
      });
    }

    if (selectedModel.metrics && Object.keys(selectedModel.metrics).length > 0) {
      cards.push({
        id: 'metrics',
        content: (
          <InfoTable
            rows={[
              ['Precision', selectedModel.metrics.precision !== undefined ? selectedModel.metrics.precision.toFixed(4) : '—'],
              ['Recall', selectedModel.metrics.recall !== undefined ? selectedModel.metrics.recall.toFixed(4) : '—'],
              ['mAP@0.5', selectedModel.metrics.map50 !== undefined ? selectedModel.metrics.map50.toFixed(4) : '—'],
              ['mAP@0.5:0.95', selectedModel.metrics.map50_95 !== undefined ? selectedModel.metrics.map50_95.toFixed(4) : selectedModel.metrics.map !== undefined ? selectedModel.metrics.map.toFixed(4) : '—'],
            ]}
          />
        ),
      });
    }

    if (selectedModel.report_paths) {
      cards.push({
        id: 'report_paths',
        content: (
          <InfoTable
            rows={[
              ['metrics.json', selectedModel.report_paths.report_path || '暂无报告'],
              ['eval_manifest_path', selectedModel.report_paths.eval_manifest_path || '待生成'],
              ['badcases_manifest', selectedModel.report_paths.badcases_manifest_path || '暂无记录'],
              ['hardcases_manifest', selectedModel.report_paths.hardcases_manifest_path || '暂无记录'],
            ]}
          />
        ),
      });
    }

    if (selectedModel.execution_metadata?.config_snapshot_path) {
      cards.push({
        id: 'snapshot_paths',
        content: (
          <InfoTable
            rows={[
              ['配置快照', selectedModel.execution_metadata.config_snapshot_path || '—'],
              ['环境快照', selectedModel.execution_metadata.env_snapshot_path || '—'],
            ]}
          />
        ),
      });
    }

    cards.push({
      id: 'path_info',
      content: (
        <InfoTable
          rows={[
            ['检查点路径', selectedModel.checkpoint_path || '—'],
            ['导出路径', selectedModel.export_path || '—'],
          ]}
        />
      ),
    });

    cards.push({
      id: 'stats',
      content: (
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{selectedModel.stats?.artifact_count || 0}</div>
            <div className="stat-label">产物</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{selectedModel.stats?.deployment_count || 0}</div>
            <div className="stat-label">部署</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{selectedModel.stats?.evaluation_count || 0}</div>
            <div className="stat-label">评估</div>
          </div>
        </div>
      ),
    });

    return cards;
  }, [selectedModel, modelPackages, visionItems]);

  return (
    <div className="page-root">
      <PageHeader
        title="模型管理"
        subtitle={`共 ${total} 个模型`}
        summaryStrip={
          <div className="page-summary-strip">
            <div className="page-summary-item">
              <div className="page-summary-label">全部</div>
              <div className="page-summary-value">{total}</div>
            </div>
            <div className="page-summary-item">
              <div className="page-summary-label">发布</div>
              <div className="page-summary-value">{releasedCount}</div>
            </div>
            <div className="page-summary-item">
              <div className="page-summary-label">草稿</div>
              <div className="page-summary-value">{draftCount}</div>
            </div>
            <div className="page-summary-item">
              <div className="page-summary-label">具备视觉能力</div>
              <div className="page-summary-value">{visionCapableCount}</div>
            </div>
            <div className="page-summary-item">
              <div className="page-summary-label">带有产物</div>
              <div className="page-summary-value">{withArtifactCount}</div>
            </div>
          </div>
        }
      />

      {success && <div className="toast-success">{success}</div>}
      {error && <div className="toast-error">{error}</div>}

      {/* Filter Bar */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="搜索模型名称或版本..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="filter-input"
        />
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          + 新建模型
        </button>
      </div>

      {/* Main Content */}
      <div className="two-col-layout">
        {/* Left: List */}
        <div className="sidebar-panel">
          {loading ? (
            <div className="loading-state">加载中...</div>
          ) : models.length === 0 ? (
            <EmptyState
              title="暂无模型记录"
              description="创建首个模型后，可在此查看 lineage、package、artifact 与评估状态。"
              primaryAction={<button className="ui-btn ui-btn-primary ui-btn-sm" onClick={() => setShowCreate(true)}>+ 新建模型</button>}
            />
          ) : (
            <div className="list-scroll">
              {models.map((m) => (
                <ModelListItem
                  key={m.model_id}
                  model={m}
                  selected={selectedId === m.model_id}
                  onClick={() => setSelectedId(m.model_id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Detail */}
        <div className="detail-panel">
          {!selectedId ? (
            <EmptyState
              title="请选择模型"
              description="右侧将展示 Identity、Lineage、Package、Artifact、Vision Surface 与关联评估。"
            />
          ) : detailLoading ? (
            <div className="loading-state">加载详情...</div>
          ) : selectedModel ? (
            <>
              {/* Header */}
              <div className="detail-header">
                <div>
                  <h2 className="detail-title">{selectedModel.name}</h2>
                  <div className="detail-subtitle">
                    v{selectedModel.version} · {selectedModel.model_id}
                  </div>
                </div>
                <div className="detail-actions">
                  <button className="ui-btn ui-btn-ghost ui-btn-sm" onClick={() => setShowDelete(true)}>
                    删除（危险）
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="detail-tabs">
                {(['overview', 'artifacts', 'packages', 'deployments', 'evaluations', 'raw'] as DetailTab[]).map((t) => (
                  <button
                    key={t}
                    className={`detail-tab${detailTab === t ? ' active' : ''}`}
                    onClick={() => setDetailTab(t)}
                  >
                    {t === 'overview' ? '概览' : t === 'artifacts' ? '产物' : t === 'packages' ? 'Packages' : t === 'deployments' ? '部署' : t === 'evaluations' ? '评估' : '原始数据'}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="detail-content">
                {detailTab === 'overview' && (
                  <>
                    {/* Workspace Grid for cards */}
                    {workspaceCards.length > 0 && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>模型概览工作台</div>
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

                    {selectedModel.release_note && (
                      <SectionCard title="Release Note">
                        <div style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{selectedModel.release_note}</div>
                      </SectionCard>
                    )}
                  </>
                )}

                {detailTab === 'artifacts' && (
                  <>
                    <SectionCard title="关联产物">
                      {selectedModel.artifacts && selectedModel.artifacts.length > 0 ? (
                        <div className="artifact-list">
                          {selectedModel.artifacts.map((art) => (
                            <div key={art.artifact_id || art.id} className="artifact-item">
                              <div className="artifact-name">{art.name || art.artifact_id || art.id}</div>
                              <div className="artifact-path">{art.path || art.storage_path || '—'}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState message="暂无关联产物" />
                      )}
                    </SectionCard>
                    <SectionCard title="产物统计">
                      <div className="stats-grid">
                        <div className="stat-item">
                          <div className="stat-value">{selectedModel.stats?.artifact_count || 0}</div>
                          <div className="stat-label">产物</div>
                        </div>
                      </div>
                    </SectionCard>
                  </>
                )}

                {detailTab === 'packages' && (
                  <>
                    <SectionCard
                      title="Packages"
                      actions={
                        <button className="ui-btn ui-btn-primary ui-btn-sm" onClick={() => setShowCreatePackage(true)}>
                          + 新建 Package
                        </button>
                      }
                    >
                      {packagesLoading ? (
                        <div className="loading-state">加载中...</div>
                      ) : modelPackages.length > 0 ? (
                        <div className="package-list">
                          {modelPackages.map((pkg) => (
                            <div key={pkg.package_id || pkg.id} className="package-item">
                              <div className="package-header">
                                <span className="package-name">{pkg.package_name || pkg.name}</span>
                                <span className="package-version">v{pkg.package_version || pkg.version}</span>
                              </div>
                              <div className="package-status">
                                状态: <StatusBadge s={pkg.status || 'draft'} />
                              </div>
                              <div className="package-actions">
                                {pkg.status === 'draft' && (
                                  <button className="ui-btn ui-btn-secondary ui-btn-xs" onClick={() => handleBuildPackage(pkg.package_id || pkg.id)}>
                                    构建
                                  </button>
                                )}
                                {pkg.status === 'built' && (
                                  <button className="ui-btn ui-btn-primary ui-btn-xs" onClick={() => handlePublishPackage(pkg.package_id || pkg.id)}>
                                    发布
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState message="暂无 Packages" />
                      )}
                    </SectionCard>
                  </>
                )}

                {detailTab === 'deployments' && (
                  <SectionCard title="关联部署">
                    {selectedModel.deployments && selectedModel.deployments.length > 0 ? (
                      <div className="deployment-list">
                        {selectedModel.deployments.map((dep) => (
                          <div key={dep.deployment_id || dep.id} className="deployment-item">
                            <div className="deployment-name">{dep.name || dep.deployment_id || dep.id}</div>
                            <div className="deployment-status">
                              状态: <StatusBadge s={dep.status} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState message="暂无关联部署" />
                    )}
                  </SectionCard>
                )}

                {detailTab === 'evaluations' && (
                  <SectionCard title="关联评估">
                    {selectedModel.evaluations && selectedModel.evaluations.length > 0 ? (
                      <div className="evaluation-list">
                        {selectedModel.evaluations.map((ev) => (
                          <div key={ev.evaluation_id || ev.id} className="evaluation-item">
                            <div className="evaluation-name">{ev.name || ev.evaluation_id || ev.id}</div>
                            <div className="evaluation-status">
                              状态: <StatusBadge s={ev.status} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState message="暂无关联评估" />
                    )}
                  </SectionCard>
                )}

                {detailTab === 'raw' && (
                  <SectionCard title="原始数据">
                    <pre className="json-pre">{JSON.stringify(selectedModel, null, 2)}</pre>
                  </SectionCard>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>新建模型</h3>
              <button className="modal-close" onClick={() => setShowCreate(false)}>×</button>
            </div>
            <div className="modal-body">
              {formError && <div className="form-error">{formError}</div>}
              <div className="form-group">
                <label>模型名称 *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="输入模型名称"
                />
              </div>
              <div className="form-group">
                <label>版本</label>
                <input
                  type="text"
                  value={form.version}
                  onChange={(e) => setForm({ ...form, version: e.target.value })}
                  placeholder="1.0.0"
                />
              </div>
              <div className="form-group">
                <label>来源实验 ID</label>
                <input
                  type="text"
                  value={form.source_experiment_id}
                  onChange={(e) => setForm({ ...form, source_experiment_id: e.target.value })}
                  placeholder="关联的实验 ID"
                />
              </div>
              <div className="form-group">
                <label>检查点路径</label>
                <input
                  type="text"
                  value={form.checkpoint_path}
                  onChange={(e) => setForm({ ...form, checkpoint_path: e.target.value })}
                  placeholder="模型检查点路径"
                />
              </div>
              <div className="form-group">
                <label>导出路径</label>
                <input
                  type="text"
                  value={form.export_path}
                  onChange={(e) => setForm({ ...form, export_path: e.target.value })}
                  placeholder="模型导出路径"
                />
              </div>
              <div className="form-group">
                <label>发布说明</label>
                <textarea
                  value={form.release_note}
                  onChange={(e) => setForm({ ...form, release_note: e.target.value })}
                  placeholder="输入发布说明"
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreate(false)}>取消</button>
              <button className="btn-primary" onClick={handleCreate} disabled={creating}>
                {creating ? '创建中...' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDelete && (
        <div className="modal-overlay" onClick={() => setShowDelete(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>确认删除</h3>
              <button className="modal-close" onClick={() => setShowDelete(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>确定要删除模型 <strong>{selectedModel?.name}</strong> 吗？此操作不可撤销。</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDelete(false)}>取消</button>
              <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Package Modal */}
      {showCreatePackage && (
        <div className="modal-overlay" onClick={() => setShowCreatePackage(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>新建 Package</h3>
              <button className="modal-close" onClick={() => setShowCreatePackage(false)}>×</button>
            </div>
            <div className="modal-body">
              {packageFormError && <div className="form-error">{packageFormError}</div>}
              <div className="form-group">
                <label>Package 名称 *</label>
                <input
                  type="text"
                  value={packageForm.package_name}
                  onChange={(e) => setPackageForm({ ...packageForm, package_name: e.target.value })}
                  placeholder="输入 Package 名称"
                />
              </div>
              <div className="form-group">
                <label>版本</label>
                <input
                  type="text"
                  value={packageForm.package_version}
                  onChange={(e) => setPackageForm({ ...packageForm, package_version: e.target.value })}
                  placeholder="1.0.0"
                />
              </div>
              <div className="form-group">
                <label>发布说明</label>
                <textarea
                  value={packageForm.release_note}
                  onChange={(e) => setPackageForm({ ...packageForm, release_note: e.target.value })}
                  placeholder="输入发布说明"
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreatePackage(false)}>取消</button>
              <button className="btn-primary" onClick={handleCreatePackage} disabled={creatingPackage}>
                {creatingPackage ? '创建中...' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
