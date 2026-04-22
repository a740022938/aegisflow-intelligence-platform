import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge, PageHeader, SectionCard, EmptyState, InfoTable } from '../components/ui';
import '../components/ui/shared.css';
import './Deployments.css';

// ── Local API ────────────────────────────────────────────────────────────────
const BASE = '';
const api = {
  list: async (params?: any) => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set('q', params.q);
    if (params?.status) qs.set('status', params.status);
    if (params?.deployment_type) qs.set('deployment_type', params.deployment_type);
    if (params?.runtime) qs.set('runtime', params.runtime);
    if (params?.artifact_id) qs.set('artifact_id', params.artifact_id);
    const r = await fetch(BASE + '/api/deployments' + (qs.toString() ? '?' + qs : ''));
    return r.json();
  },
  get: async (id: string) => { const r = await fetch(BASE + '/api/deployments/' + id); return r.json(); },
  create: async (data: any) => {
    const r = await fetch(BASE + '/api/deployments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return r.json();
  },
  update: async (id: string, data: any) => {
    const r = await fetch(BASE + '/api/deployments/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return r.json();
  },
  delete: async (id: string) => { const r = await fetch(BASE + '/api/deployments/' + id, { method: 'DELETE' }); return r.json(); },
  start: async (id: string) => { const r = await fetch(BASE + '/api/deployments/' + id + '/start', { method: 'POST' }); return r.json(); },
  stop: async (id: string) => { const r = await fetch(BASE + '/api/deployments/' + id + '/stop', { method: 'POST' }); return r.json(); },
  restart: async (id: string) => { const r = await fetch(BASE + '/api/deployments/' + id + '/restart', { method: 'POST' }); return r.json(); },
  fromArtifact: async (artifactId: string, extra?: any) => {
    const r = await fetch(BASE + '/api/deployments/from-artifact/' + artifactId, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(extra || {}) });
    return r.json();
  },
  logs: async (id: string, params?: { level?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.level) qs.set('level', params.level);
    if (params?.limit) qs.set('limit', String(params.limit || 100));
    const r = await fetch(BASE + '/api/deployments/' + id + '/logs' + (qs.toString() ? '?' + qs : ''));
    return r.json();
  },
  health: async (id: string) => { const r = await fetch(BASE + '/api/deployments/' + id + '/health'); return r.json(); },
  detail: async (id: string) => { const r = await fetch(BASE + '/api/deployments/' + id + '/detail'); return r.json(); },
  deployRevision: async (revisionId: string) => {
    const r = await fetch(BASE + '/api/deployment-revisions/' + revisionId + '/deploy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    return r.json();
  },
  rollbackTo: async (deploymentId: string, revisionId: string, reason?: string) => {
    const r = await fetch(BASE + '/api/rollback-points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deployment_id: deploymentId, target_revision_id: revisionId, reason: reason || 'Manual rollback from UI' }),
    });
    const data = await r.json();
    if (data.ok && data.rollback_point?.id) {
      const exec = await fetch(BASE + '/api/rollback-points/' + data.rollback_point.id + '/execute', { method: 'POST' });
      return exec.json();
    }
    return data;
  },
};

type DepTab = 'overview' | 'revisions' | 'runtime' | 'links' | 'config' | 'logs' | 'raw';

const STATUS_COLORS: Record<string, string> = {
  created: '#6b7280', deploying: '#f59e0b', running: '#10b981',
  stopped: '#64748b', failed: '#ef4444', archived: '#9ca3af', deleted: '#374151',
};
const HEALTH_COLORS: Record<string, string> = {
  unknown: '#9ca3af', healthy: '#10b981', unhealthy: '#ef4444', starting: '#f59e0b', stopped: '#64748b',
};
const DEPLOYMENT_TYPE_LABELS: Record<string, string> = {
  local_api: 'Local API', model_service: 'Model Service', batch_worker: 'Batch Worker',
  evaluation_runner: 'Evaluation Runner', custom: 'Custom',
};
const RUNTIME_LABELS: Record<string, string> = {
  mock: 'Mock', python: 'Python', fastapi: 'FastAPI', node: 'Node.js', custom: 'Custom',
};

function fmt(s?: string) { if (!s) return '—'; try { return new Date(s).toLocaleString('zh-CN'); } catch { return s; } }
function timeAgo(s?: string) { if (!s) return '—'; try { const diff = Date.now() - new Date(s).getTime(); if (diff < 60000) return 'just now'; if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago'; if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago'; return Math.floor(diff / 86400000) + 'd ago'; } catch { return s; } }

function HealthDot({ status }: { status: string }) {
  if (status === 'healthy') return <span className="dep-badge-running" title="Healthy" />;
  if (status === 'unhealthy') return <span className="dep-badge-unhealthy" title="Unhealthy" />;
  return <span className="dep-badge-unknown" title={status} />;
}

function DepListItem({ d, selected, onClick }: { d: any; selected: boolean; onClick: () => void }) {
  const sourceModel = d.model_name || d.model_id || d.artifact_name || '未绑定模型';
  const recentEvent = d.last_event || d.last_message || d.updated_at || '暂无事件';
  return (
    <div className={`dep-list-item${selected ? ' selected' : ''}`} onClick={onClick}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="dep-list-name">{d.name}</div>
        <div className="dep-list-sub">{d.host}:{d.port} · {DEPLOYMENT_TYPE_LABELS[d.deployment_type] || d.deployment_type}</div>
        <div className="dep-list-sub">{sourceModel} · {timeAgo(recentEvent)}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: STATUS_COLORS[d.status] || '#6b7280' }}>{d.status}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <HealthDot status={d.health_status} />
          <span className="dep-health-latency">{d.health_status}</span>
        </div>
      </div>
    </div>
  );
}

export default function Deployments() {
  const [deployments, setDeployments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [filter, setFilter] = useState({ q: '', status: '', deployment_type: '', runtime: '' });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [tab, setTab] = useState<DepTab>('overview');
  const [detailLoading, setDetailLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [depRelations, setDepRelations] = useState<any>({ artifact: null, evaluation: null, training: null });

  // Revisions state
  const [revisions, setRevisions] = useState<any[]>([]);
  const [currentRevision, setCurrentRevision] = useState<any>(null);
  const [revisionsLoading, setRevisionsLoading] = useState(false);
  const [rollbackHistory, setRollbackHistory] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showFromArtifact, setShowFromArtifact] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  const [form, setForm] = useState({
    name: '', deployment_type: 'local_api', runtime: 'mock',
    host: 'localhost', port: '', entrypoint: '', model_path: '', notes: '',
  });
  const [fromArtId, setFromArtId] = useState('');
  const [formError, setFormError] = useState('');

  // ── Load list ───────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (filter.q) params.q = filter.q;
      if (filter.status) params.status = filter.status;
      if (filter.deployment_type) params.deployment_type = filter.deployment_type;
      if (filter.runtime) params.runtime = filter.runtime;
      const res = await api.list(params);
      if (res.ok) setDeployments(res.deployments || []);
      else setError(res.error || '加载失败');
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  // ── Auto-select first ──────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && deployments.length > 0 && !selectedId) {
      const saved = localStorage.getItem('agi_factory_dep_sel');
      const id = (saved && deployments.find(d => d.id === saved)) ? saved : deployments[0].id;
      setSelectedId(id);
    }
  }, [loading, deployments]);

  // ── Load detail ────────────────────────────────────────────────────────
  const loadDetail = useCallback(async (d: any) => {
    setDetailLoading(true);
    try {
      const [detailRes, logsRes, healthRes] = await Promise.all([
        api.get(d.id),
        api.logs(d.id, { limit: 50 }),
        api.health(d.id),
      ]);
      if (detailRes.ok) {
        setSelected(detailRes.deployment);
        // Also fetch detail for relations
        const detailFull = await api.detail(d.id);
        if (detailFull.ok) {
          setDepRelations({
            artifact: detailFull.related_artifact || null,
            evaluation: detailFull.related_evaluation || null,
            training: detailFull.related_training || null,
          });
        }

        // Fetch revisions
        setRevisionsLoading(true);
        try {
          const revRes = await fetch(`/api/deployments/${d.id}/revision-timeline`);
          const revData = await revRes.json();
          if (revData.ok) {
            setRevisions(revData.timeline || []);
            setCurrentRevision(revData.current_revision);
          }

          const rbRes = await fetch(`/api/deployments/${d.id}/rollback-history`);
          const rbData = await rbRes.json();
          if (rbData.ok) {
            setRollbackHistory(rbData.history || []);
          }
        } catch (e) {
          console.error('Failed to fetch revisions:', e);
        } finally {
          setRevisionsLoading(false);
        }
        setEditForm(detailRes.deployment || {});
      }
      if (logsRes.ok) setLogs(logsRes.logs || []);
      if (healthRes.ok) setHealth(healthRes);
      else setHealth(null);
    } catch (e: any) { setError(e.message); }
    finally { setDetailLoading(false); }
  }, []);

  useEffect(() => {
    if (selectedId) {
      localStorage.setItem('agi_factory_dep_sel', selectedId);
      const d = deployments.find(d => d.id === selectedId);
      if (d) loadDetail(d);
    }
  }, [selectedId, loadDetail, deployments]);

  const handleSelect = (d: any) => { setSelectedId(d.id); setTab('overview'); };

  // ── Actions ────────────────────────────────────────────────────────────
  const handleAction = async (action: 'start' | 'stop' | 'restart' | 'delete' | 'refresh', id: string) => {
    setActionLoading(id + action);
    try {
      let res;
      if (action === 'refresh') { await load(); if (selected) loadDetail(selected); return; }
      if (action === 'start') res = await api.start(id);
      else if (action === 'stop') res = await api.stop(id);
      else if (action === 'restart') res = await api.restart(id);
      else if (action === 'delete') {
        if (!confirm('确认删除？')) return;
        res = await api.delete(id);
      } else return;

      if (res?.ok) {
        setSuccess(`操作成功: ${action}`);
        await load();
        if (selected?.id === id) {
          const r2 = await api.get(id);
          if (r2.ok) loadDetail(r2.deployment);
          else { setSelectedId(null); setSelected(null); }
        }
      } else setError(res?.error || '操作失败');
    } catch (e: any) { setError(e.message); }
    finally { setActionLoading(null); }
  };

  const handleUpdate = async () => {
    if (!selected) return;
    const res = await api.update(selected.id, editForm);
    if (res.ok) { setSuccess('保存成功'); await load(); loadDetail(res.deployment); }
    else setError(res.error || '保存失败');
  };

  const handleCreate = async () => {
    if (!form.name.trim()) { setFormError('请填写名称'); return; }
    setFormError('');
    const data = { ...form, port: form.port ? Number(form.port) : undefined };
    const res = await api.create(data);
    if (res.ok && res.deployment) {
      setSuccess(`部署「${res.deployment.name}」创建成功`);
      setShowCreate(false);
      setForm({ name: '', deployment_type: 'local_api', runtime: 'mock', host: 'localhost', port: '', entrypoint: '', model_path: '', notes: '' });
      await load();
      setSelectedId(res.deployment.id);
    } else setFormError(res.error || '创建失败');
  };

  const handleFromArtifact = async () => {
    if (!fromArtId.trim()) { setFormError('请输入 Artifact ID'); return; }
    const res = await api.fromArtifact(fromArtId.trim());
    if (res.ok && res.deployment) {
      setSuccess('从 Artifact 创建部署成功');
      setShowFromArtifact(false);
      setFromArtId('');
      await load();
      setSelectedId(res.deployment.id);
    } else setFormError(res.error || '创建失败');
  };

  const handleDeployRevision = async (revisionId: string) => {
    if (!confirm('确认部署此版本？')) return;
    setActionLoading('deploy-' + revisionId);
    try {
      const res = await api.deployRevision(revisionId);
      if (res.ok) {
        setSuccess('版本部署成功');
        if (selectedId) {
          const d = deployments.find(d => d.id === selectedId);
          if (d) loadDetail(d);
        }
        await load();
      } else setError(res.error || '部署失败');
    } catch (e: any) { setError(e.message); }
    finally { setActionLoading(null); }
  };

  const handleRollbackTo = async (revisionId: string, revisionNumber: number) => {
    const reason = prompt('请输入回滚原因（可选）：');
    if (reason === null) return;
    setActionLoading('rollback-' + revisionId);
    try {
      const res = await api.rollbackTo(selectedId, revisionId, reason || 'UI rollback');
      if (res.ok) {
        setSuccess(`已回滚到版本 #${revisionNumber}`);
        if (selectedId) {
          const d = deployments.find(d => d.id === selectedId);
          if (d) loadDetail(d);
        }
        await load();
      } else setError(res.error || '回滚失败');
    } catch (e: any) { setError(e.message); }
    finally { setActionLoading(null); }
  };

  const runningCount = deployments.filter(d => d.status === 'running').length;
  const healthyCount = deployments.filter(d => d.health_status === 'healthy').length;
  const failedCount = deployments.filter(d => d.status === 'failed').length;
  const idleCount = deployments.filter(d => ['stopped', 'created'].includes(d.status)).length;
  const linkedModels = new Set(
    deployments
      .map((d) => d.model_id || d.model_name || d.artifact_id || d.artifact_name)
      .filter(Boolean)
  ).size;
  const lastRollout = deployments
    .map((d) => d.updated_at || d.created_at)
    .filter(Boolean)
    .sort()
    .pop();

  const TABS: { key: DepTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'revisions', label: `Revisions (${revisions.length})` },
    { key: 'runtime', label: 'Runtime' },
    { key: 'links', label: '关联' },
    { key: 'config', label: 'Config' },
    { key: 'logs', label: `Logs (${logs.length})` },
    { key: 'raw', label: 'Raw JSON' },
  ];

  return (
    <div className="page-root">
      <PageHeader
        title="部署管理"
        subtitle={`${deployments.length} 个部署 · ${runningCount} 运行中 · ${healthyCount} 健康`}
        summaryStrip={
          <div className="page-summary-strip">
            <div className="page-summary-item">
              <div className="page-summary-label">total deployments</div>
              <div className="page-summary-value">{deployments.length}</div>
            </div>
            <div className="page-summary-item">
              <div className="page-summary-label">active / idle / failed</div>
              <div className="page-summary-value" style={{ fontSize: 15 }}>
                {runningCount} / {idleCount} / {failedCount}
              </div>
            </div>
            <div className="page-summary-item">
              <div className="page-summary-label">last rollout</div>
              <div className="page-summary-value" style={{ fontSize: 14 }}>
                {lastRollout ? fmt(lastRollout) : '暂无部署事件'}
              </div>
            </div>
            <div className="page-summary-item">
              <div className="page-summary-label">linked models</div>
              <div className="page-summary-value">{linkedModels}</div>
            </div>
          </div>
        }
        actions={
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="ui-btn ui-btn-outline" onClick={() => setShowFromArtifact(true)}>+ From Artifact</button>
            <button className="ui-btn ui-btn-primary" onClick={() => setShowCreate(true)}>+ 新建部署</button>
          </div>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }} className="dep-root">
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 16, alignItems: 'start' }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {/* Stats */}
          <SectionCard>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { label: 'Total', value: deployments.length, color: 'var(--text-main)' },
                { label: 'Running', value: runningCount, color: 'var(--success)' },
                { label: 'Healthy', value: healthyCount, color: 'var(--info)' },
                { label: 'Failed', value: failedCount, color: 'var(--danger)' },
                { label: 'Stopped', value: deployments.filter(d => d.status === 'stopped').length, color: 'var(--text-muted)' },
                { label: 'Deploying', value: deployments.filter(d => d.status === 'deploying').length, color: 'var(--warning)' },
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
              <input className="ui-input" placeholder="搜索名称 / artifact..." value={filter.q} onChange={e => setFilter(f => ({ ...f, q: e.target.value }))} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <select className="ui-select" value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
                  <option value="">全部状态</option>{['created','deploying','running','stopped','failed','archived'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select className="ui-select" value={filter.deployment_type} onChange={e => setFilter(f => ({ ...f, deployment_type: e.target.value }))}>
                  <option value="">全部类型</option>{Object.entries(DEPLOYMENT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
          </SectionCard>

          {/* List */}
          <SectionCard title={`部署列表 (${deployments.length})`} actions={<button className="ui-btn ui-btn-ghost ui-btn-xs" onClick={load}>↻</button>}>
            <div style={{ maxHeight: 420, overflowY: 'auto' }}>
              {loading && <EmptyState message="加载中..." />}
              {!loading && deployments.length === 0 && (
                <EmptyState
                  icon="🚀"
                  title="部署中心暂无记录"
                  description="可以从 Artifact 快速创建部署，或手动创建一个部署对象。"
                  primaryAction={<button className="ui-btn ui-btn-primary ui-btn-sm" onClick={() => setShowCreate(true)}>新建部署</button>}
                  secondaryAction={<button className="ui-btn ui-btn-outline ui-btn-sm" onClick={() => setShowFromArtifact(true)}>From Artifact</button>}
                />
              )}
              {!loading && deployments.map(d => <DepListItem key={d.id} d={d} selected={selectedId === d.id} onClick={() => handleSelect(d)} />)}
            </div>
          </SectionCard>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {error && <div className="ui-flash ui-flash-err">{error} <button className="ui-btn ui-btn-ghost ui-btn-xs" style={{ marginLeft: 8 }} onClick={() => setError(null)}>×</button></div>}
          {success && <div className="ui-flash ui-flash-ok">{success} <button className="ui-btn ui-btn-ghost ui-btn-xs" style={{ marginLeft: 8 }} onClick={() => setSuccess(null)}>×</button></div>}

          {selected ? (
            <>
              {/* Header */}
              <SectionCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{selected.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                      {selected.id} · {DEPLOYMENT_TYPE_LABELS[selected.deployment_type]} · {RUNTIME_LABELS[selected.runtime]}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button className="ui-btn ui-btn-ghost ui-btn-sm" onClick={() => handleAction('refresh', selected.id)}>刷新</button>
                    {selected.status !== 'running' && <button className="ui-btn ui-btn-success ui-btn-sm" onClick={() => handleAction('start', selected.id)} disabled={!!actionLoading}>{actionLoading ? '...' : 'Start'}</button>}
                    {selected.status === 'running' && <button className="ui-btn ui-btn-warning ui-btn-sm" onClick={() => handleAction('stop', selected.id)} disabled={!!actionLoading}>{actionLoading ? '...' : 'Stop'}</button>}
                    <button className="ui-btn ui-btn-outline ui-btn-sm" onClick={() => handleAction('restart', selected.id)} disabled={!!actionLoading}>Restart</button>
                    <button className="ui-btn ui-btn-danger ui-btn-sm" onClick={() => handleAction('delete', selected.id)} disabled={!!actionLoading}>{actionLoading ? '...' : 'Delete'}</button>
                    <button className="ui-btn ui-btn-ghost ui-btn-sm" onClick={() => { setSelectedId(null); setSelected(null); }}>取消选中</button>
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
                    {health && (
                      <div style={{ display: 'flex', gap: 12, padding: '8px 12px', background: health.is_healthy ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', borderRadius: 'var(--radius-md)', marginBottom: 14, fontSize: 13 }}>
                        <span><b>Health:</b> <span style={{ color: health.is_healthy ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>{health.is_healthy ? '✓ Healthy' : '✗ Unhealthy'}</span></span>
                        <span><b>Latency:</b> {health.latency_ms}ms</span>
                        <span><b>Last:</b> {fmt(health.last_check)}</span>
                        <span><b>URL:</b> <a href={health.base_url} target="_blank" rel="noopener" style={{ color: 'var(--primary)' }}>{health.base_url || '—'}</a></span>
                      </div>
                    )}
                    <InfoTable rows={[
                      { label: 'ID', value: <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{selected.id}</code> },
                      { label: '名称', value: selected.name },
                      { label: '状态', value: <StatusBadge s={selected.status} /> },
                      { label: '健康状态', value: <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><HealthDot status={selected.health_status} />{selected.health_status}</span> },
                      { label: '部署类型', value: DEPLOYMENT_TYPE_LABELS[selected.deployment_type] || selected.deployment_type },
                      { label: '运行时', value: RUNTIME_LABELS[selected.runtime] || selected.runtime },
                      { label: 'Artifact', value: selected.artifact_name || selected.artifact_id || '—' },
                      { label: 'Base URL', value: selected.base_url ? <a href={selected.base_url} target="_blank" rel="noopener">{selected.base_url}</a> : '—' },
                      { label: 'Entrypoint', value: selected.entrypoint || '—' },
                      { label: 'Model Path', value: <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{selected.model_path || '—'}</code> },
                      { label: 'Notes', value: selected.notes || '—' },
                      { label: '创建时间', value: fmt(selected.created_at) },
                      { label: '更新时间', value: fmt(selected.updated_at) },
                    ]} />
                  </>
                )}

                {!detailLoading && tab === 'runtime' && (
                  <InfoTable rows={[
                    { label: 'Host', value: selected.host },
                    { label: 'Port', value: selected.port || '—' },
                    { label: 'Runtime', value: RUNTIME_LABELS[selected.runtime] || selected.runtime },
                    { label: 'Started At', value: fmt(selected.started_at) },
                    { label: 'Stopped At', value: fmt(selected.stopped_at) },
                    { label: 'Last Health Check', value: fmt(selected.last_health_check_at) },
                    { label: '健康状态', value: <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><HealthDot status={selected.health_status} />{selected.health_status}</span> },
                    ...(health ? [
                      { label: 'Latency', value: health.latency_ms + 'ms' },
                      { label: 'Base URL', value: health.base_url ? <a href={health.base_url} target="_blank" rel="noopener">{health.base_url}</a> : '—' },
                    ] : []),
                  ]} />
                )}

                {!detailLoading && tab === 'links' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <InfoTable rows={[
                      {
                        label: 'Linked Model',
                        value: selected.model_id || selected.model_name
                          ? <Link to="/models">{selected.model_name || selected.model_id}</Link>
                          : '未绑定模型',
                      },
                      {
                        label: 'Package / Artifact',
                        value: depRelations.artifact
                          ? <Link to="/artifacts">{depRelations.artifact.name || depRelations.artifact.id}</Link>
                          : (selected.artifact_id ? <Link to="/artifacts">{selected.artifact_id}</Link> : '未绑定产物'),
                      },
                      {
                        label: 'Runtime Environment',
                        value: `${RUNTIME_LABELS[selected.runtime] || selected.runtime} @ ${selected.host || 'localhost'}:${selected.port || '自动分配'}`,
                      },
                      {
                        label: 'Evaluation',
                        value: depRelations.evaluation
                          ? <Link to="/evaluations">{depRelations.evaluation.title || depRelations.evaluation.id}</Link>
                          : (selected.evaluation_id ? <Link to="/evaluations">{selected.evaluation_id}</Link> : '暂无评估关联'),
                      },
                    ]} />
                    <div className="inline-meta-list">
                      <Link className="linked-entity-chip" to="/models">Models</Link>
                      <Link className="linked-entity-chip" to="/artifacts">Artifacts</Link>
                      <Link className="linked-entity-chip" to="/evaluations">Evaluations</Link>
                    </div>
                  </div>
                )}

                {!detailLoading && tab === 'config' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="form-group"><label className="form-label">名称</label><input className="form-input" value={editForm.name ?? selected.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Notes</label><textarea className="form-input" rows={3} value={editForm.notes ?? selected.notes ?? ''} onChange={e => setEditForm({...editForm, notes: e.target.value})} /></div>
                    <button className="ui-btn ui-btn-primary" onClick={handleUpdate}>Save Changes</button>
                  </div>
                )}

                {!detailLoading && tab === 'logs' && (
                  <>
                    <div style={{ marginBottom: 10 }}>
                      <button className="ui-btn ui-btn-outline ui-btn-sm" onClick={async () => { const r = await api.logs(selected.id, { limit: 100 }); if (r.ok) setLogs(r.logs || []); }}>刷新</button>
                    </div>
                    {logs.length === 0 ? <EmptyState icon="📋" message="暂无日志" /> : (
                      <div className="dep-logs">
                        {logs.map(l => (
                          <div key={l.id} className={`dep-log-line ${l.level}`}>
                            <span className="dep-log-time">{fmt(l.created_at)}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: l.level === 'error' ? 'var(--danger)' : l.level === 'warn' ? 'var(--warning)' : 'var(--text-muted)', minWidth: 50 }}>[{l.level}]</span>
                            <span style={{ fontSize: 13, color: 'var(--text-main)', flex: 1 }}>{l.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {!detailLoading && tab === 'revisions' && (
                  <>
                    {revisionsLoading ? (
                      <EmptyState message="加载中..." icon="⏳" />
                    ) : (
                      <>
                        {/* Current Revision */}
                        {currentRevision && (
                          <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(16,185,129,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16,185,129,0.2)' }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)', marginBottom: 6 }}>✓ Current Revision</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <span style={{ fontWeight: 700 }}>#{currentRevision.revision_number}</span>
                                {currentRevision.package_name && <span style={{ marginLeft: 8, color: 'var(--text-muted)' }}>← {currentRevision.package_name}</span>}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                {fmt(currentRevision.deployed_at || currentRevision.created_at)}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Timeline */}
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Revision Timeline</div>
                        {revisions.length === 0 ? (
                          <EmptyState message="暂无版本记录" />
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {revisions.map((rev: any) => (
                              <div key={rev.id} style={{
                                padding: '10px 14px',
                                background: rev.status === 'current' ? 'rgba(16,185,129,0.06)' : 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-md)',
                                border: rev.status === 'current' ? '1px solid rgba(16,185,129,0.15)' : '1px solid var(--border)',
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>#{rev.revision_number}</span>
                                    <span style={{
                                      padding: '2px 8px',
                                      borderRadius: 4,
                                      fontSize: 11,
                                      fontWeight: 600,
                                      background: rev.status === 'current' ? 'var(--success)' : rev.status === 'superseded' ? 'var(--text-muted)' : 'var(--warning)',
                                      color: '#fff',
                                    }}>{rev.status}</span>
                                    {rev.package_name && (
                                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>📦 {rev.package_name}</span>
                                    )}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {rev.status === 'superseded' && (
                                      <button
                                        className="ui-btn ui-btn-outline ui-btn-sm"
                                        onClick={() => handleDeployRevision(rev.id)}
                                        disabled={actionLoading === 'deploy-' + rev.id}
                                      >
                                        {actionLoading === 'deploy-' + rev.id ? '...' : '▶ Deploy'}
                                      </button>
                                    )}
                                    {rev.status === 'current' && (
                                      <button
                                        className="ui-btn ui-btn-warning ui-btn-sm"
                                        onClick={() => {
                                          // Find previous revision to rollback to
                                          const prev = revisions.find((r: any) => r.revision_number === rev.revision_number - 1);
                                          if (prev) handleRollbackTo(prev.id, prev.revision_number);
                                          else setError('无更早版本可回滚');
                                        }}
                                        disabled={actionLoading === 'rollback-' + rev.id || revisions.length <= 1}
                                      >
                                        ↩ Rollback
                                      </button>
                                    )}
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                      {fmt(rev.deployed_at || rev.created_at)}
                                    </span>
                                  </div>
                                </div>
                                {rev.notes && (
                                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>{rev.notes}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Rollback History */}
                        {rollbackHistory.length > 0 && (
                          <>
                            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 20, marginBottom: 10 }}>Rollback History</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {rollbackHistory.map((rb: any) => (
                                <div key={rb.id} style={{
                                  padding: '10px 14px',
                                  background: 'var(--bg-secondary)',
                                  borderRadius: 'var(--radius-md)',
                                  border: '1px solid var(--border)',
                                  fontSize: 12,
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>#{rb.from_revision_number} → #{rb.to_revision_number}</span>
                                    <span style={{ color: rb.status === 'completed' ? 'var(--success)' : 'var(--warning)', fontWeight: 600 }}>{rb.status}</span>
                                  </div>
                                  {rb.reason && <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>{rb.reason}</div>}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </>
                )}

                {!detailLoading && tab === 'raw' && (
                  <pre className="json-pre">{JSON.stringify(selected, null, 2)}</pre>
                )}
              </SectionCard>
            </>
          ) : (
            <SectionCard>
              <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 32, opacity: 0.4, marginBottom: 8 }}>🚀</div>
                从左侧选择一个部署查看详情
              </div>
            </SectionCard>
          )}
        </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="dep-modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="dep-modal" onClick={e => e.stopPropagation()} onKeyDown={e => e.key === 'Escape' && setShowCreate(false)}>
            <div className="dep-modal-header">
              <div className="dep-modal-title">新建部署</div>
              <button className="dep-modal-close" onClick={() => setShowCreate(false)} title="关闭 (Esc)">×</button>
            </div>
            <div className="dep-modal-body">
              {formError && <div className="ui-flash ui-flash-err" style={{ marginBottom: 12 }}>{formError}</div>}
              <form id="create-deployment-form" onSubmit={e => { e.preventDefault(); handleCreate(); }}>
                <div className="dep-form-section">
                  <div className="dep-form-section-title">基础配置</div>
                  <div className="dep-modal-row">
                    <label className="dep-modal-label required">名称</label>
                    <input className="ui-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="My Model Service" autoFocus />
                  </div>
                  <div className="dep-form-grid">
                    <div className="dep-modal-row" style={{ marginBottom: 0 }}>
                      <label className="dep-modal-label">类型</label>
                      <select className="ui-select" value={form.deployment_type} onChange={e => setForm({...form, deployment_type: e.target.value})}>
                        {Object.entries(DEPLOYMENT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div className="dep-modal-row" style={{ marginBottom: 0 }}>
                      <label className="dep-modal-label">运行时</label>
                      <select className="ui-select" value={form.runtime} onChange={e => setForm({...form, runtime: e.target.value})}>
                        {Object.entries(RUNTIME_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="dep-form-section">
                  <div className="dep-form-section-title">网络配置</div>
                  <div className="dep-form-grid">
                    <div className="dep-modal-row" style={{ marginBottom: 0 }}>
                      <label className="dep-modal-label">Host</label>
                      <input className="ui-input" value={form.host} onChange={e => setForm({...form, host: e.target.value})} placeholder="localhost" />
                    </div>
                    <div className="dep-modal-row" style={{ marginBottom: 0 }}>
                      <label className="dep-modal-label">Port</label>
                      <input className="ui-input" type="number" value={form.port} onChange={e => setForm({...form, port: e.target.value})} placeholder="自动分配" />
                    </div>
                  </div>
                </div>
                <div className="dep-form-section">
                  <div className="dep-form-section-title">运行配置</div>
                  <div className="dep-modal-row">
                    <label className="dep-modal-label">Entrypoint</label>
                    <input className="ui-input" value={form.entrypoint} onChange={e => setForm({...form, entrypoint: e.target.value})} placeholder="python server.py" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
                  </div>
                  <div className="dep-modal-row">
                    <label className="dep-modal-label">Model Path</label>
                    <input className="ui-input" value={form.model_path} onChange={e => setForm({...form, model_path: e.target.value})} placeholder="/models/bert-base" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
                  </div>
                  <div className="dep-modal-row">
                    <label className="dep-modal-label">Notes</label>
                    <textarea className="ui-input" rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="部署说明（可选）" />
                  </div>
                </div>
              </form>
            </div>
            <div className="dep-modal-footer">
              <button type="button" className="ui-btn ui-btn-ghost" onClick={() => setShowCreate(false)}>取消</button>
              <button type="submit" form="create-deployment-form" className="ui-btn ui-btn-primary">创建部署</button>
            </div>
          </div>
        </div>
      )}

      {/* From Artifact Modal */}
      {showFromArtifact && (
        <div className="dep-modal-overlay" onClick={() => setShowFromArtifact(false)}>
          <div className="dep-modal" style={{ width: 540 }} onClick={e => e.stopPropagation()} onKeyDown={e => e.key === 'Escape' && setShowFromArtifact(false)}>
            <div className="dep-modal-header">
              <div className="dep-modal-title">从 Artifact 创建部署</div>
              <button className="dep-modal-close" onClick={() => setShowFromArtifact(false)} title="关闭 (Esc)">×</button>
            </div>
            <div className="dep-modal-body">
              {formError && <div className="ui-flash ui-flash-err" style={{ marginBottom: 12 }}>{formError}</div>}
              <div className="dep-modal-row">
                <label className="dep-modal-label required">Artifact ID</label>
                <input 
                  className="ui-input" 
                  value={fromArtId} 
                  onChange={e => setFromArtId(e.target.value)} 
                  placeholder="abc-123-def-..." 
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} 
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleFromArtifact()}
                />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '10px 12px', background: 'var(--bg-app)', borderRadius: 8 }}>
                💡 输入 Artifact ID 后，名称、模型路径和训练 Job ID 会自动从 Artifact 填充。
              </div>
            </div>
            <div className="dep-modal-footer">
              <button className="ui-btn ui-btn-ghost" onClick={() => setShowFromArtifact(false)}>取消</button>
              <button className="ui-btn ui-btn-primary" onClick={handleFromArtifact}>创建部署</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
