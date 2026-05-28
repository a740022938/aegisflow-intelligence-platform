import React, { useEffect, useState, useCallback } from 'react';
import { PageShell, SectionCard, StatusBadge, EmptyState, StatsGrid } from '../components/ui';

interface Iteration {
  id: string; name: string; dataset_id: string; model_id: string;
  status: string; params: any; metrics: any; log_output?: string;
  created_at: string; updated_at: string;
}

interface Feedback {
  id: string; iteration_id: string; type: string; comment: string; created_at: string;
}

interface Dataset { id: string; name: string; }
interface Model { id: string; name: string; }

const API = '/api/flywheel/iterations';

async function get<T = any>(url: string): Promise<T> {
  const res = await fetch(url);
  return res.json();
}

async function post<T = any>(url: string, body?: any): Promise<T> {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
  return res.json();
}

export default function IterativeFlywheelPage() {
  const [iterations, setIterations] = useState<Iteration[]>([]);
  const [selected, setSelected] = useState<Iteration | null>(null);
  const [feedbackItems, setFeedbackItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalFeedback, setModalFeedback] = useState(false);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [models, setModels] = useState<Model[]>([]);

  // Form state
  const [name, setName] = useState('');
  const [datasetId, setDatasetId] = useState('');
  const [modelId, setModelId] = useState('');
  const [paramsJson, setParamsJson] = useState('{"epochs": 100, "lr": 0.01}');
  const [fbComment, setFbComment] = useState('');
  const [fbType, setFbType] = useState('comment');

  const loadList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await get<{ ok: boolean; iterations: Iteration[] }>(API);
      if (res.ok) setIterations(res.iterations || []);
      else setError('Failed to load iterations');
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    setError('');
    try {
      const res = await get<{ ok: boolean; iteration: Iteration; feedback: Feedback[] }>(`${API}/${id}`);
      if (res.ok) { setSelected(res.iteration); setFeedbackItems(res.feedback || []); }
      else setError('Iteration not found');
    } catch (e: any) { setError(e.message); }
  }, []);

  const loadDatasetsModels = useCallback(async () => {
    try {
      const [ds, md] = await Promise.all([
        fetch('/api/datasets?limit=50').then(r => r.json()),
        fetch('/api/models?limit=50').then(r => r.json()),
      ]);
      setDatasets(ds?.datasets || ds?.data || []);
      setModels(md?.models || md?.data || []);
    } catch { /* */ }
  }, []);

  useEffect(() => { loadList(); loadDatasetsModels(); }, [loadList, loadDatasetsModels]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    let params = {};
    try { params = JSON.parse(paramsJson); } catch { return setError('Invalid params JSON'); }
    const res = await post(`${API}`, { name, dataset_id: datasetId, model_id: modelId, params });
    if (res.ok) { setShowModal(false); setName(''); setDatasetId(''); setModelId(''); setParamsJson('{"epochs": 100, "lr": 0.01}'); loadList(); }
    else setError(res.error || 'Failed to create');
  };

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const res = await post(`${API}/${selected.id}/feedback`, { type: fbType, comment: fbComment });
    if (res.ok) { setFbComment(''); setModalFeedback(false); loadDetail(selected.id); }
    else setError(res.error || 'Failed to add feedback');
  };

  const statusColor = (s: string) => s === 'completed' ? 'var(--success)' : s === 'running' ? 'var(--primary)' : s === 'failed' ? 'var(--danger)' : 'var(--text-muted)';

  const runningCount = iterations.filter(i => i.status === 'running').length;
  const completedCount = iterations.filter(i => i.status === 'completed').length;
  const failedCount = iterations.filter(i => i.status === 'failed').length;

  return (
    <PageShell title="迭代飞轮" subtitle="标注 → 训练 → 评估 → 反馈 闭环" maturity="lab">
      <StatsGrid items={[
        { label: '总迭代', value: iterations.length },
        { label: '运行中', value: runningCount, color: 'var(--primary)' },
        { label: '已完成', value: completedCount, color: 'var(--success)' },
        { label: '失败', value: failedCount, color: 'var(--danger)' },
      ]} />

      <div style={{ marginBottom: 16 }}>
        <button className="ui-btn ui-btn-primary" onClick={() => { setShowModal(true); loadDatasetsModels(); }} style={{ padding: '10px 24px', fontSize: 14, fontWeight: 600 }}>
          Start New Iteration
        </button>
      </div>

      {error && (
        <div style={{ padding: '10px 16px', background: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: 8, color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 16 }}>
        {/* Left: Iteration List */}
        <SectionCard title="迭代列表">
          {loading ? <EmptyState title="加载中..." /> : iterations.length === 0 ? (
            <EmptyState title="暂无迭代" description='点击 "Start New Iteration" 开始第一个迭代。' />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 560, overflow: 'auto' }}>
              {iterations.map((it) => (
                <button
                  key={it.id}
                  onClick={() => { loadDetail(it.id); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left', background: selected?.id === it.id ? 'var(--bg-elevated)' : 'transparent',
                    border: selected?.id === it.id ? '1px solid var(--primary)' : '1px solid transparent',
                    borderRadius: 8, padding: '10px 12px', cursor: 'pointer', color: 'inherit',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{it.name}</span>
                    <StatusBadge s={it.status} size="xs" />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {new Date(it.created_at).toLocaleDateString('zh-CN')}
                    {it.metrics && typeof it.metrics === 'object' && Object.keys(it.metrics).length > 0 && (
                      <span style={{ marginLeft: 8, color: 'var(--primary)' }}>
                        mAP: {it.metrics.mAP ?? it.metrics.mAP50 ?? '--'}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Right: Detail */}
        <SectionCard title={selected ? selected.name : '迭代详情'}>
          {!selected ? (
            <EmptyState title="请选择一个迭代" description="从左侧列表选择一个迭代查看详情、指标和反馈。" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Status & Metrics Bar */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Status:</span>
                <StatusBadge s={selected.status} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>
                  {new Date(selected.created_at).toLocaleString('zh-CN')}
                </span>
              </div>

              {/* Metrics */}
              {selected.metrics && typeof selected.metrics === 'object' && Object.keys(selected.metrics).length > 0 && (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {Object.entries(selected.metrics).map(([k, v]) => (
                    <div key={k} style={{
                      flex: '1 1 0', minWidth: 100, padding: '12px 16px',
                      background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border)',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{k}</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>
                        {typeof v === 'number' ? v.toFixed(3) : String(v)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Metrics bar visualization */}
              {selected.metrics && typeof selected.metrics === 'object' && (selected.metrics.mAP || selected.metrics.mAP50) && (
                <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                  {['mAP', 'mAP50', 'precision', 'recall'].filter(k => selected.metrics[k] !== undefined).map(k => (
                    <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 80, fontSize: 12, color: 'var(--text-secondary)', textAlign: 'right' }}>{k}</span>
                      <div style={{ flex: 1, height: 8, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(Number(selected.metrics[k]) * 100, 100)}%`, height: '100%',
                          background: `linear-gradient(90deg, var(--primary), var(--secondary))`,
                          borderRadius: 4, transition: 'width 0.5s ease',
                        }} />
                      </div>
                      <span style={{ width: 50, fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>
                        {(Number(selected.metrics[k])).toFixed(3)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Params / Config */}
              {selected.params && typeof selected.params === 'object' && Object.keys(selected.params).length > 0 && (
                <div style={{ padding: 10, background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Params</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {JSON.stringify(selected.params, null, 2)}
                  </div>
                </div>
              )}

              {/* Log output */}
              {selected.log_output && (
                <div style={{ padding: 10, background: '#0a0a0a', borderRadius: 8, border: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', maxHeight: 160, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                  {selected.log_output}
                </div>
              )}

              {/* Feedback Section */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Human Feedback ({feedbackItems.length})</span>
                  <button className="ui-btn ui-btn-primary" style={{ fontSize: 12, padding: '4px 12px' }} onClick={() => setModalFeedback(true)}>
                    Add Feedback
                  </button>
                </div>
                {feedbackItems.length === 0 ? (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>暂无反馈</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {feedbackItems.map((fb) => (
                      <div key={fb.id} style={{ padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 6, border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>{fb.type}</span>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{new Date(fb.created_at).toLocaleString('zh-CN')}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{fb.comment}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      {/* New Iteration Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: 12, padding: 24, width: 480, maxWidth: '90vw', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Start New Iteration</div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input className="ui-input" value={name} onChange={e => setName(e.target.value)} placeholder="Iteration name" required />
              <select className="ui-select" value={datasetId} onChange={e => setDatasetId(e.target.value)}>
                <option value="">Select Dataset</option>
                {datasets.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <select className="ui-select" value={modelId} onChange={e => setModelId(e.target.value)}>
                <option value="">Select Model</option>
                {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <textarea className="ui-input" value={paramsJson} onChange={e => setParamsJson(e.target.value)} rows={3} style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="ui-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="ui-btn ui-btn-primary">Start</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {modalFeedback && selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setModalFeedback(false)}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: 12, padding: 24, width: 420, maxWidth: '90vw', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Add Feedback</div>
            <form onSubmit={handleFeedback} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <select className="ui-select" value={fbType} onChange={e => setFbType(e.target.value)}>
                <option value="comment">Comment</option>
                <option value="bug">Bug Report</option>
                <option value="improvement">Improvement</option>
                <option value="approval">Approval</option>
              </select>
              <textarea className="ui-input" value={fbComment} onChange={e => setFbComment(e.target.value)} placeholder="Feedback comment..." rows={3} required />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="ui-btn" onClick={() => setModalFeedback(false)}>Cancel</button>
                <button type="submit" className="ui-btn ui-btn-primary">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
}
