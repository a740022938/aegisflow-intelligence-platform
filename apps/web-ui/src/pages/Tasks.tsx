import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { apiService, Task, CreateTaskRequest, TaskStep, TaskLog, TaskSummary } from '../services/api';
import {
  StatusBadge,
  PageHeader,
  SectionCard,
  EmptyState,
  InfoTable,
  VisionSurfaceStrip,
  MainlineChainStrip,
  EntityLinkChips,
} from '../components/ui';
import WorkspaceGrid from '../layout/WorkspaceGrid';
import { clearLayout, loadLayout, saveLayout, type LayoutConfig } from '../layout/layoutStorage';
import '../components/ui/shared.css';
import './Tasks.css';

type DetailTab = 'overview' | 'steps' | 'logs' | 'raw';

const TASK_TEMPLATES = [
  { id: 'custom', name: '自定义', template: { title: '', description: '' } },
  { id: 'test-general', name: '通用测试任务', template: { title: '通用测试任务', description: '用于通用功能测试' } },
  { id: 'test-loop', name: '执行闭环测试', template: { title: '执行闭环测试任务', description: '用于测试任务执行闭环流程' } },
  { id: 'test-logs', name: '日志观察任务', template: { title: '日志观察测试', description: '用于观察任务日志输出' } },
  { id: 'test-api', name: 'API 联调检查', template: { title: 'API 联调检查', description: '用于 API 接口联调测试' } },
  { id: 'test-ui', name: 'UI 冒烟测试', template: { title: 'UI 冒烟测试', description: '用于前端 UI 冒烟测试' } },
];
const SELECTED_TASK_KEY = 'agi_factory_selected_task_id';
const LAST_TEMPLATE_KEY = 'agi_factory_last_task_template';

const STATUS_LABELS: Record<string, string> = {
  pending: '待执行', queued: '排队中', running: '执行中',
  completed: '已完成', success: '成功', failed: '失败', cancelled: '已取消',
};

// Workspace layout key
const LAYOUT_KEY = 'tasks-detail';

// Default layouts for detail workspace cards
const DEFAULT_LAYOUTS: LayoutConfig = {
  lg: [
    { i: 'task_summary', x: 0, y: 0, w: 6, h: 5, minW: 4, minH: 4 },
    { i: 'current_execution', x: 6, y: 0, w: 6, h: 6, minW: 4, minH: 4 },
    { i: 'pipeline_links', x: 0, y: 5, w: 6, h: 4, minW: 4, minH: 3 },
    { i: 'vision_surface', x: 6, y: 6, w: 6, h: 5, minW: 4, minH: 4 },
    { i: 'errors_recovery', x: 0, y: 9, w: 6, h: 5, minW: 4, minH: 4 },
    { i: 'related_outputs', x: 6, y: 11, w: 6, h: 5, minW: 4, minH: 4 },
    { i: 'mainline_chain', x: 0, y: 14, w: 12, h: 5, minW: 6, minH: 4 },
    { i: 'related_objects', x: 0, y: 19, w: 12, h: 4, minW: 6, minH: 3 },
  ],
  md: [
    { i: 'task_summary', x: 0, y: 0, w: 4, h: 5, minW: 3, minH: 4 },
    { i: 'current_execution', x: 4, y: 0, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'pipeline_links', x: 0, y: 5, w: 4, h: 4, minW: 3, minH: 3 },
    { i: 'vision_surface', x: 4, y: 6, w: 4, h: 5, minW: 3, minH: 4 },
    { i: 'errors_recovery', x: 0, y: 9, w: 4, h: 5, minW: 3, minH: 4 },
    { i: 'related_outputs', x: 4, y: 11, w: 4, h: 5, minW: 3, minH: 4 },
    { i: 'mainline_chain', x: 0, y: 14, w: 8, h: 5, minW: 4, minH: 4 },
    { i: 'related_objects', x: 0, y: 19, w: 8, h: 4, minW: 4, minH: 3 },
  ],
  sm: [
    { i: 'task_summary', x: 0, y: 0, w: 1, h: 5, minW: 1, minH: 4 },
    { i: 'current_execution', x: 0, y: 5, w: 1, h: 6, minW: 1, minH: 4 },
    { i: 'pipeline_links', x: 0, y: 11, w: 1, h: 4, minW: 1, minH: 3 },
    { i: 'vision_surface', x: 0, y: 15, w: 1, h: 5, minW: 1, minH: 4 },
    { i: 'errors_recovery', x: 0, y: 20, w: 1, h: 5, minW: 1, minH: 4 },
    { i: 'related_outputs', x: 0, y: 25, w: 1, h: 5, minW: 1, minH: 4 },
    { i: 'mainline_chain', x: 0, y: 30, w: 1, h: 5, minW: 1, minH: 4 },
    { i: 'related_objects', x: 0, y: 35, w: 1, h: 4, minW: 1, minH: 3 },
  ],
};

function fmt(s?: string | null) {
  if (!s) return '—';
  try { return new Date(s).toLocaleString('zh-CN'); } catch { return s; }
}
function truncId(id?: string) { return id ? (id.length > 16 ? id.slice(0, 8) + '…' : id) : '—'; }

function formatDuration(durationMs?: number) {
  if (!durationMs) return '—';
  const sec = Math.floor(durationMs / 1000);
  const min = Math.floor(sec / 60);
  const remSec = sec % 60;
  const hour = Math.floor(min / 60);
  const remMin = min % 60;
  if (hour > 0) return `${hour}h ${remMin}m ${remSec}s`;
  if (min > 0) return `${min}m ${remSec}s`;
  return `${remSec}s`;
}

function parseMaybeJson(v?: string | null) {
  if (!v) return {};
  try {
    return JSON.parse(v);
  } catch {
    return {};
  }
}

function visionItemsFromTaskSteps(steps: TaskStep[]) {
  const find = (tokens: string[]) =>
    steps.find((s) => tokens.some((t) => String(s.step_name || '').toLowerCase().includes(t) || String(s.step_type || '').toLowerCase().includes(t)));
  const map = [
    { key: 'detect', label: 'detect', step: find(['detect', 'yolo']) },
    { key: 'handoff', label: 'handoff', step: find(['handoff']) },
    { key: 'segment', label: 'segment', step: find(['segment', 'sam']) },
    { key: 'verify', label: 'verify', step: find(['verify', 'classifier']) },
    { key: 'track', label: 'track', step: find(['track']) },
    { key: 'rules', label: 'rules', step: find(['rule']) },
  ] as const;

  return map.map((row) => ({
    key: row.key,
    label: row.label,
    status: row.step?.status || '未接入',
    summary: row.step
      ? `${row.step.step_name || row.step.step_type || '步骤已绑定'} · ${row.step.status}`
      : '未接入 / 未产出',
    links: row.step
      ? [
          { label: 'Workflow', to: '/workflow-jobs' },
          { label: 'Run', to: '/runs' },
        ]
      : [],
  }));
}

function TaskListItem({ task, selected, onClick }: { task: Task; selected: boolean; onClick: () => void }) {
  return (
    <div className={`tsk-list-item${selected ? ' selected' : ''}`} onClick={onClick}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, alignItems: 'flex-start' }}>
        <span className="tsk-list-name">{task.title}</span>
        <StatusBadge s={STATUS_LABELS[task.status] || task.status} />
      </div>
      <div className="tsk-list-sub">{truncId(task.id)} · {fmt(task.created_at)}</div>
    </div>
  );
}

function LogLine({ log }: { log: TaskLog }) {
  const lvlColors: Record<string, string> = { error: '#f48771', warn: '#cca700', info: '#569cd6', debug: '#808080' };
  const lvlClass: Record<string, string> = { error: 'error', warn: 'warn', info: 'info', debug: 'debug' };
  return (
    <div className="tsk-log-line">
      <span className="tsk-log-time">{fmt(log.created_at)}</span>
      <span className={`tsk-log-level ${lvlClass[log.level] || 'debug'}`}>[{log.level.toUpperCase()}]</span>
      <span className="tsk-log-msg">{log.message}</span>
    </div>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskSteps, setTaskSteps] = useState<TaskStep[]>([]);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
  const [taskSummary, setTaskSummary] = useState<TaskSummary | null>(null);
  const [taskRawJson, setTaskRawJson] = useState('');
  const [detailError, setDetailError] = useState<string | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>('overview');
  const [detailLoading, setDetailLoading] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

  // Polling
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // New task form
  const [newTask, setNewTask] = useState<CreateTaskRequest>({ title: '', description: '' });
  const [creatingTask, setCreatingTask] = useState(false);
  const [createMode, setCreateMode] = useState<'create' | 'create_execute' | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('custom');

  // Actions
  const [executingTasks, setExecutingTasks] = useState<Set<string>>(new Set());
  const [cancellingTask, setCancellingTask] = useState(false);
  const [retryingTask, setRetryingTask] = useState(false);

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

  // ── Load list ────────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params: any = { limit: 50 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery.trim()) params.q = searchQuery;
      const res = await apiService.getTasks(params);
      if (res.ok) { setTasks(res.tasks); setTotalTasks(res.total); }
      else setError(res.error || '加载失败');
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [statusFilter, searchQuery]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ── Auto-select first ──────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && tasks.length > 0 && !selectedTaskId) {
      const saved = localStorage.getItem(SELECTED_TASK_KEY);
      const id = (saved && tasks.find(t => t.id === saved)) ? saved : tasks[0].id;
      setSelectedTaskId(id);
    }
  }, [loading, tasks]);

  // ── Load detail ─────────────────────────────────────────────────────────
  const fetchTaskDetail = useCallback(async (taskId: string) => {
    setDetailLoading(true); setDetailError(null);
    try {
      const res = await apiService.getTaskDetail(taskId);
      if (res.ok) {
        setSelectedTask(res.task);
        setTaskSteps(res.steps || []);
        setTaskLogs(res.logs || []);
        setTaskSummary(res.summary || null);
        setTaskRawJson(JSON.stringify(res.task, null, 2));
        setLastRefreshTime(new Date());
      } else setDetailError(res.error || '加载失败');
    } catch (e: any) { setDetailError(e.message); }
    finally { setDetailLoading(false); }
  }, []);

  useEffect(() => {
    if (selectedTaskId) {
      localStorage.setItem(SELECTED_TASK_KEY, selectedTaskId);
      fetchTaskDetail(selectedTaskId);
    }
  }, [selectedTaskId, fetchTaskDetail]);

  // ── Polling ─────────────────────────────────────────────────────────────
  const startPolling = useCallback((taskId: string, status?: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    const intervalMs = status === 'running' ? 2000 : 7000;
    pollingRef.current = setInterval(() => { fetchTaskDetail(taskId); }, intervalMs);
  }, [fetchTaskDetail]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
  }, []);

  useEffect(() => {
    if (selectedTask) {
      if (['running', 'pending', 'queued'].includes(selectedTask.status)) {
        startPolling(selectedTask.id, selectedTask.status);
      } else {
        stopPolling();
      }
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [selectedTask, startPolling, stopPolling]);

  // Auto-scroll logs
  useEffect(() => {
    if (activeDetailTab === 'logs' && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [taskLogs, activeDetailTab]);

  // ── Template ────────────────────────────────────────────────────────────
  useEffect(() => {
    const savedTemplateId = localStorage.getItem(LAST_TEMPLATE_KEY);
    const matched = TASK_TEMPLATES.find(t => t.id === savedTemplateId);
    if (matched) {
      setSelectedTemplate(matched.id);
      if (matched.id === 'custom') setNewTask({ title: '', description: '' });
      else setNewTask({ ...matched.template });
    }
  }, []);

  const applyTemplate = (templateId: string) => {
    const t = TASK_TEMPLATES.find(x => x.id === templateId) || TASK_TEMPLATES[0];
    setSelectedTemplate(t.id);
    localStorage.setItem(LAST_TEMPLATE_KEY, t.id);
    if (t.id === 'custom') setNewTask({ title: '', description: '' });
    else setNewTask({ ...t.template });
  };

  // ── Stats ───────────────────────────────────────────────────────────────
  const statusCounts = useMemo(() => {
    const c = { all: tasks.length, pending: 0, running: 0, completed: 0, failed: 0, cancelled: 0 };
    tasks.forEach(t => { if (c[t.status] !== undefined) c[t.status]++; });
    return c;
  }, [tasks]);

  const selectedTaskInput = useMemo(() => parseMaybeJson(selectedTask?.input_payload), [selectedTask?.input_payload]);
  const workflowJobId = (selectedTask as any)?.workflow_job_id || selectedTaskInput?.workflow_job_id || selectedTaskInput?.job_id || null;
  const relatedModel = (selectedTask as any)?.model_id || selectedTaskInput?.model_id || null;
  const relatedDataset = (selectedTask as any)?.dataset_id || selectedTaskInput?.dataset_id || null;
  const relatedArtifact = (selectedTask as any)?.artifact_id || selectedTaskInput?.artifact_id || null;
  const visionItems = useMemo(() => visionItemsFromTaskSteps(taskSteps), [taskSteps]);

  const handleSelect = (id: string) => { setSelectedTaskId(id); setActiveDetailTab('overview'); setDetailError(null); };
  const handleClear = () => { setSelectedTaskId(null); setSelectedTask(null); stopPolling(); };

  // ── Create ──────────────────────────────────────────────────────────────
  const handleCreateTask = async () => {
    if (!newTask.title.trim()) { setError('请填写标题'); return; }
    setCreatingTask(true); setCreateMode('create'); setError(null); setSuccess(null);
    try {
      const res = await apiService.createTask(newTask);
      if (res.ok && res.task) {
        setSuccess(`任务「${res.task.title}」创建成功`);
        setNewTask({ title: '', description: '' });
        await fetchTasks();
        setSelectedTaskId(res.task.id);
      } else setError(res.error || '创建失败');
    } catch (e: any) { setError(e.message); }
    finally { setCreatingTask(false); }
  };

  const handleCreateAndExecute = async () => {
    if (!newTask.title.trim()) { setError('请填写标题'); return; }
    setCreatingTask(true); setCreateMode('create_execute'); setError(null); setSuccess(null);
    try {
      const cr = await apiService.createTask(newTask);
      if (!cr.ok || !cr.task) throw new Error(cr.error || '创建失败');
      const taskId = cr.task.id;
      const er = await apiService.executeTask(taskId);
      if (er.ok) {
        setSuccess(`任务「${cr.task.title}」创建并执行成功`);
        setNewTask({ title: '', description: '' });
        await fetchTasks();
        setSelectedTaskId(taskId);
      } else setError(er.error || '执行失败');
    } catch (e: any) { setError(e.message || '创建并执行失败'); }
    finally { setCreatingTask(false); }
  };

  // ── Actions ────────────────────────────────────────────────────────────
  const handleExecute = async (taskId: string) => {
    setExecutingTasks(prev => new Set(prev).add(taskId));
    try {
      const res = await apiService.executeTask(taskId);
      if (res.ok) { setSuccess('任务开始执行'); await fetchTaskDetail(taskId); }
      else setError(res.error || '执行失败');
    } catch (e: any) { setError(e.message); }
    finally { setExecutingTasks(prev => { const s = new Set(prev); s.delete(taskId); return s; }); }
  };

  const handleCancel = async (taskId: string) => {
    if (!confirm('确认取消任务？')) return;
    setCancellingTask(true);
    try {
      const res = await apiService.cancelTask(taskId);
      if (res.ok) { setSuccess('任务已取消'); await fetchTaskDetail(taskId); }
      else setError(res.error || '取消失败');
    } catch (e: any) { setError(e.message); }
    finally { setCancellingTask(false); }
  };

  const handleRetry = async (taskId: string) => {
    setRetryingTask(true);
    try {
      const res = await apiService.retryTask(taskId);
      if (res.ok) { setSuccess('任务重试成功'); await fetchTaskDetail(taskId); }
      else setError(res.error || '重试失败');
    } catch (e: any) { setError(e.message); }
    finally { setRetryingTask(false); }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(selectedTask, null, 2)).then(() => setSuccess('JSON 已复制')).catch(() => setError('复制失败'));
  };

  // ── Tabs ───────────────────────────────────────────────────────────────
  const TABS: { key: DetailTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'steps', label: `Steps (${taskSteps.length})` },
    { key: 'logs', label: `Logs (${taskLogs.length})` },
    { key: 'raw', label: 'Raw JSON' },
  ];

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter(t => t.title.toLowerCase().includes(q));
  }, [tasks, searchQuery]);

  const needsPolling = (status: string) => ['running', 'pending', 'queued'].includes(status);

  // Workspace cards for Overview tab
  const workspaceCards = useMemo(() => {
    if (!selectedTask) return [];
    return [
      {
        id: 'task_summary',
        content: (
          <InfoTable rows={[
            { label: '任务状态', value: STATUS_LABELS[selectedTask.status] || selectedTask.status },
            { label: '来源模板', value: selectedTask.template ? `${selectedTask.template.name} (${selectedTask.template.code} / v${selectedTask.template.version})` : selectedTask.template_code ? `${selectedTask.template_code} / v${selectedTask.template_version || '-'}` : '手动创建' },
            { label: '来源任务 ID', value: selectedTask.source_task_id || '未绑定来源任务' },
            { label: '关联 Workflow Job', value: workflowJobId ? <Link to="/workflow-jobs">查看 Workflow Jobs</Link> : '未绑定 Workflow Job' },
          ]} />
        ),
      },
      {
        id: 'current_execution',
        content: (
          <InfoTable rows={[
            { label: '当前步骤', value: taskSummary?.current_step_name || '待调度' },
            { label: '创建时间', value: fmt(selectedTask.created_at) },
            { label: '开始时间', value: selectedTask.started_at ? fmt(selectedTask.started_at) : '尚未开始' },
            { label: '结束时间', value: selectedTask.finished_at ? fmt(selectedTask.finished_at) : '尚未结束' },
            { label: '运行时长', value: formatDuration(taskSummary?.duration_ms || selectedTask.duration_ms) },
            { label: '进度', value: `${taskSummary?.progress_pct ?? 0}%` },
          ]} />
        ),
      },
      {
        id: 'pipeline_links',
        content: (
          <div className="inline-meta-list">
            <Link className="linked-entity-chip" to="/workflow-jobs">Workflow Jobs</Link>
            <Link className="linked-entity-chip" to="/models">Models</Link>
            <Link className="linked-entity-chip" to="/datasets">Datasets</Link>
            <Link className="linked-entity-chip" to="/artifacts">Artifacts</Link>
          </div>
        ),
      },
      {
        id: 'vision_surface',
        content: <VisionSurfaceStrip items={visionItems as any} />,
      },
      {
        id: 'errors_recovery',
        content: (
          <InfoTable rows={[
            { label: '错误摘要', value: selectedTask.error_message || '暂无错误摘要' },
            { label: '下一步入口', value: workflowJobId ? <Link to="/workflow-jobs">前往 Workflow Jobs 处理</Link> : '先执行任务或绑定 workflow' },
            { label: '恢复建议', value: selectedTask.status === 'failed' ? '检查失败步骤后重试；必要时取消并重建。' : '当前状态无需恢复动作' },
          ]} />
        ),
      },
      {
        id: 'related_outputs',
        content: (
          <InfoTable rows={[
            { label: '输出摘要', value: selectedTask.output_summary || '暂无输出摘要' },
            { label: 'Model', value: relatedModel ? <Link to="/models">{String(relatedModel)}</Link> : '未绑定模型' },
            { label: 'Dataset', value: relatedDataset ? <Link to="/datasets">{String(relatedDataset)}</Link> : '未绑定数据集' },
            { label: 'Artifact', value: relatedArtifact ? <Link to="/artifacts">{String(relatedArtifact)}</Link> : '未产出产物' },
          ]} />
        ),
      },
      {
        id: 'mainline_chain',
        content: (
          <MainlineChainStrip
            compact
            current={selectedTask.id}
            chain={[
              { type: 'task', id: selectedTask.id, label: selectedTask.title || selectedTask.name || '当前任务', status: selectedTask.status },
              ...(workflowJobId ? [{ type: 'workflow_job' as const, id: workflowJobId, label: '执行Workflow' }] : []),
              ...(relatedModel ? [{ type: 'model' as const, id: String(relatedModel), label: '产出Model' }] : []),
              ...(relatedDataset ? [{ type: 'dataset' as const, id: String(relatedDataset), label: '产出Dataset' }] : []),
              ...(relatedArtifact ? [{ type: 'artifact' as const, id: String(relatedArtifact), label: '产出Artifact' }] : []),
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
              ...(workflowJobId ? [{ type: 'workflow_job' as const, id: workflowJobId, label: 'Workflow Job', status: undefined }] : []),
              ...(relatedModel ? [{ type: 'model' as const, id: String(relatedModel), label: 'Model', status: undefined }] : []),
              ...(relatedDataset ? [{ type: 'dataset' as const, id: String(relatedDataset), label: 'Dataset', status: undefined }] : []),
              ...(relatedArtifact ? [{ type: 'artifact' as const, id: String(relatedArtifact), label: 'Artifact', status: undefined }] : []),
            ]}
          />
        ),
      },
    ];
  }, [selectedTask, taskSummary, workflowJobId, relatedModel, relatedDataset, relatedArtifact, visionItems]);

  return (
    <div className="tsk-root">
      <PageHeader
        title="任务中心"
        subtitle={`${filtered.length} / ${totalTasks} 条 · ${statusCounts.running} 执行中`}
        summaryStrip={
          <div className="page-summary-strip">
            <div className="page-summary-item">
              <div className="page-summary-label">running</div>
              <div className="page-summary-value">{statusCounts.running}</div>
            </div>
            <div className="page-summary-item">
              <div className="page-summary-label">pending</div>
              <div className="page-summary-value">{statusCounts.pending}</div>
            </div>
            <div className="page-summary-item">
              <div className="page-summary-label">failed</div>
              <div className="page-summary-value">{statusCounts.failed}</div>
            </div>
            <div className="page-summary-item">
              <div className="page-summary-label">selected workflow</div>
              <div className="page-summary-value" style={{ fontSize: 14 }}>
                {workflowJobId || '暂无绑定'}
              </div>
            </div>
          </div>
        }
        actions={
          <button className="ui-btn ui-btn-primary" onClick={fetchTasks} disabled={loading}>
            {loading ? '加载中...' : '刷新列表'}
          </button>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        <div className="tsk-root">
        {/* Left */}
        <div className="tsk-left">
          {/* Stats */}
          <SectionCard>
            <div className="tsk-pills">
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <button
                  key={k}
                  className={`tsk-pill${statusFilter === k ? ' active' : ''}`}
                  onClick={() => setStatusFilter(k)}
                >{v} {statusCounts[k] ?? 0}</button>
              ))}
            </div>
          </SectionCard>

          {/* Search */}
          <SectionCard>
            <input
              className="ui-input"
              placeholder="搜索任务标题..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </SectionCard>

          {/* Create */}
          <SectionCard title="创建新任务">
            <div className="tsk-template-pills" style={{ marginBottom: 14 }}>
              {TASK_TEMPLATES.map(t => (
                <button
                  key={t.id}
                  className={`tsk-template-pill${selectedTemplate === t.id ? ' selected' : ''}`}
                  onClick={() => applyTemplate(t.id)}
                >{t.name}</button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5, display: 'block' }}>标题 *</label>
                <input className="ui-input" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} placeholder="请输入任务标题" disabled={creatingTask} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5, display: 'block' }}>描述</label>
                <textarea className="ui-input" rows={2} value={newTask.description || ''} onChange={e => setNewTask({ ...newTask, description: e.target.value })} placeholder="可选" disabled={creatingTask} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="ui-btn ui-btn-primary" style={{ flex: 1 }} onClick={handleCreateTask} disabled={creatingTask || !newTask.title.trim()}>
                  {creatingTask && createMode === 'create' ? '创建中...' : '创建任务'}
                </button>
                <button className="ui-btn ui-btn-success" style={{ flex: 1 }} onClick={handleCreateAndExecute} disabled={creatingTask || !newTask.title.trim()}>
                  {creatingTask && createMode === 'create_execute' ? '创建并执行...' : '创建并执行'}
                </button>
              </div>
            </div>
          </SectionCard>

          {/* List */}
          <SectionCard title={`任务列表 (${filtered.length})`}>
            <div style={{ maxHeight: 380, overflowY: 'auto' }}>
              {loading && <EmptyState message="加载中..." />}
              {!loading && filtered.length === 0 && <EmptyState icon="📋" message={searchQuery ? '无匹配任务' : '暂无任务'} />}
              {!loading && filtered.map(t => <TaskListItem key={t.id} task={t} selected={selectedTaskId === t.id} onClick={() => handleSelect(t.id)} />)}
            </div>
          </SectionCard>
        </div>

        {/* Right */}
        <div className="tsk-right">
          {error && <div className="ui-flash ui-flash-err">{error} <button className="ui-btn ui-btn-ghost ui-btn-xs" style={{ marginLeft: 8 }} onClick={() => setError(null)}>×</button></div>}
          {success && <div className="ui-flash ui-flash-ok">{success} <button className="ui-btn ui-btn-ghost ui-btn-xs" style={{ marginLeft: 8 }} onClick={() => setSuccess(null)}>×</button></div>}

          {selectedTask ? (
            <>
              {/* Summary card */}
              <SectionCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 16, fontWeight: 700 }}>{selectedTask.title}</span>
                      <StatusBadge s={STATUS_LABELS[selectedTask.status] || selectedTask.status} />
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>ID: {truncId(selectedTask.id)}</div>
                    {['running', 'pending', 'queued'].includes(selectedTask.status) && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ height: 6, background: 'var(--border-light)', borderRadius: 999 }}>
                          <div style={{ width: `${taskSummary?.progress_pct ?? 0}%`, height: 6, background: 'var(--primary)', borderRadius: 999, transition: 'width 0.3s' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                          <span>进度 {taskSummary?.progress_pct ?? 0}%</span>
                          <span>当前: {taskSummary?.current_step_name || '—'}</span>
                          <span>运行时长: {formatDuration(taskSummary?.duration_ms || selectedTask.duration_ms)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button className="ui-btn ui-btn-ghost ui-btn-sm" onClick={() => fetchTaskDetail(selectedTask.id)} disabled={detailLoading}>刷新</button>
                    {['pending', 'queued', 'completed', 'success', 'failed', 'cancelled'].includes(selectedTask.status) && (
                      <button className="ui-btn ui-btn-success ui-btn-sm" onClick={() => handleExecute(selectedTask.id)} disabled={executingTasks.has(selectedTask.id)}>
                        {executingTasks.has(selectedTask.id) ? '执行中...' : 'Execute'}
                      </button>
                    )}
                    {['running', 'pending', 'queued'].includes(selectedTask.status) && (
                      <button className="ui-btn ui-btn-danger ui-btn-sm" onClick={() => handleCancel(selectedTask.id)} disabled={cancellingTask}>
                        {cancellingTask ? '取消中...' : 'Cancel'}
                      </button>
                    )}
                    {['failed', 'cancelled'].includes(selectedTask.status) && (
                      <button className="ui-btn ui-btn-outline ui-btn-sm" onClick={() => handleRetry(selectedTask.id)} disabled={retryingTask}>
                        {retryingTask ? '重试中...' : 'Retry'}
                      </button>
                    )}
                    <button className="ui-btn ui-btn-ghost ui-btn-sm" onClick={handleCopyJson}>Copy JSON</button>
                    <button className="ui-btn ui-btn-ghost ui-btn-sm" onClick={handleClear}>取消选中</button>
                  </div>
                </div>
                <div className="inline-meta-list" style={{ marginTop: 8 }}>
                  {workflowJobId ? (
                    <Link className="linked-entity-chip" to="/workflow-jobs">
                      Workflow Job: {String(workflowJobId).slice(0, 12)}
                    </Link>
                  ) : (
                    <span className="linked-entity-chip">Workflow Job: 未绑定</span>
                  )}
                  {relatedModel ? (
                    <Link className="linked-entity-chip" to="/models">
                      Model: {String(relatedModel).slice(0, 10)}
                    </Link>
                  ) : (
                    <span className="linked-entity-chip">Model: 未绑定</span>
                  )}
                  {relatedDataset ? (
                    <Link className="linked-entity-chip" to="/datasets">
                      Dataset: {String(relatedDataset).slice(0, 10)}
                    </Link>
                  ) : (
                    <span className="linked-entity-chip">Dataset: 未绑定</span>
                  )}
                  {relatedArtifact ? (
                    <Link className="linked-entity-chip" to="/artifacts">
                      Artifact: {String(relatedArtifact).slice(0, 10)}
                    </Link>
                  ) : (
                    <span className="linked-entity-chip">Artifact: 未产出</span>
                  )}
                </div>
                {lastRefreshTime && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, textAlign: 'right' }}>最后刷新：{lastRefreshTime.toLocaleTimeString()}{needsPolling(selectedTask.status) ? ' · 自动轮询中' : ''}</div>}
              </SectionCard>

              {/* Tabs */}
              <SectionCard>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 14 }}>
                  {TABS.map(t => (
                    <button
                      key={t.key}
                      onClick={() => setActiveDetailTab(t.key)}
                      style={{
                        padding: '5px 14px', border: 'none', borderRadius: 'var(--radius-md)',
                        cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-sans)',
                        background: activeDetailTab === t.key ? 'var(--primary)' : 'var(--bg-app)',
                        color: activeDetailTab === t.key ? '#fff' : 'var(--text-secondary)',
                        transition: 'background var(--t-fast)',
                      }}
                    >{t.label}</button>
                  ))}
                </div>

                {detailLoading && <EmptyState message="加载中..." icon="⏳" />}

                {!detailLoading && detailError && (
                  <div className="ui-flash ui-flash-err">{detailError} <button className="ui-btn ui-btn-ghost ui-btn-xs" onClick={() => selectedTaskId && fetchTaskDetail(selectedTaskId)}>重试</button></div>
                )}

                {!detailLoading && !detailError && activeDetailTab === 'overview' && (
                  <>
                    {selectedTask.error_message && (
                      <div className="ui-flash ui-flash-err" style={{ marginBottom: 14 }}>错误：{selectedTask.error_message}</div>
                    )}
                    {/* Workspace Grid for cards */}
                    {workspaceCards.length > 0 && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>任务概览工作台</div>
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

                {!detailLoading && !detailError && activeDetailTab === 'steps' && (
                  taskSteps.length === 0 ? <EmptyState icon="⚙" message="暂无步骤，请先执行任务" /> : (
                    <div className="ui-table-wrap">
                      <table className="ui-table">
                        <thead><tr><th>#</th><th>步骤名称</th><th>类型</th><th>状态</th><th>开始</th><th>结束</th></tr></thead>
                        <tbody>{taskSteps.sort((a, b) => (a.step_index ?? 0) - (b.step_index ?? 0)).map(step => (
                          <tr key={step.id}>
                            <td>{step.step_index ?? 0}</td>
                            <td>{step.step_name || '—'}</td>
                            <td>{step.step_type || '—'}</td>
                            <td><StatusBadge s={STATUS_LABELS[step.status] || step.status} /></td>
                            <td>{fmt(step.started_at)}</td>
                            <td>{fmt(step.finished_at)}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  )
                )}

                {!detailLoading && !detailError && activeDetailTab === 'logs' && (
                  taskLogs.length === 0 ? <EmptyState icon="📋" message="暂无日志" /> : (
                    <div className="tsk-log-viewer" ref={logsContainerRef}>
                      {taskLogs.map(log => <LogLine key={log.id} log={log} />)}
                    </div>
                  )
                )}

                {!detailLoading && !detailError && activeDetailTab === 'raw' && (
                  taskRawJson ? <pre className="json-pre">{taskRawJson}</pre> : <EmptyState icon="📄" message="暂无 JSON 数据" />
                )}
              </SectionCard>
            </>
          ) : (
            <SectionCard>
              <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 32, opacity: 0.4, marginBottom: 8 }}>📋</div>
                从左侧选择一个任务查看详情
              </div>
            </SectionCard>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
