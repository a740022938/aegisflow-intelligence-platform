import React, { useEffect, useState, useCallback } from 'react';
import { PageShell, SectionCard, StatusBadge, EmptyState, StatsGrid } from '../components/ui';

interface MergeRun {
  id: string; name: string; method: string; status: string;
  source_model_ids: string[]; weights: number[];
  result_metrics: Record<string, number>; created_at: string;
}

interface Model { id: string; name: string; architecture: string; }

const API = '/api/merge';

async function get<T = any>(url: string): Promise<T> { const r = await fetch(url); return r.json(); }
async function post<T = any>(url: string, body?: any): Promise<T> {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
  return r.json();
}

export default function ModelMergePage() {
  const [runs, setRuns] = useState<MergeRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<MergeRun | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [models, setModels] = useState<Model[]>([]);

  // Form
  const [name, setName] = useState('');
  const [method, setMethod] = useState('LERP');
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);
  const [weightsStr, setWeightsStr] = useState('');

  const loadRuns = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await get<{ ok: boolean; runs: MergeRun[] }>(`${API}/runs`);
      if (res.ok) setRuns(res.runs || []);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  const loadModels = useCallback(async () => {
    try {
      const res = await fetch('/api/models?limit=50').then(r => r.json());
      setModels(res?.models || res?.data || []);
    } catch { /* */ }
  }, []);

  useEffect(() => { loadRuns(); loadModels(); }, [loadRuns, loadModels]);

  const loadDetail = async (id: string) => {
    setError('');
    try {
      const res = await get<{ ok: boolean; run: MergeRun }>(`${API}/runs/${id}`);
      if (res.ok) setSelectedRun(res.run);
    } catch (e: any) { setError(e.message); }
  };

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSourceIds.length < 2) return setError('Select at least 2 models');
    let weights: number[] = [];
    if (weightsStr.trim()) {
      try { weights = JSON.parse(weightsStr); } catch { return setError('Invalid weights JSON'); }
    } else {
      weights = selectedSourceIds.map(() => 1.0 / selectedSourceIds.length);
    }
    const res = await post(`${API}/run`, { name, method, source_model_ids: selectedSourceIds, weights });
    if (res.ok) { setShowForm(false); setName(''); setSelectedSourceIds([]); setWeightsStr(''); loadRuns(); if (res.run?.id) loadDetail(res.run.id); }
    else setError(res.error || 'Failed');
  };

  const toggleSource = (id: string) => {
    setSelectedSourceIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectedModels = models.filter(m => selectedSourceIds.includes(m.id));

  return (
    <PageShell title="模型合并" subtitle="LERP / SLERP / TIES 多模型融合" maturity="lab">
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <button className="ui-btn ui-btn-primary" onClick={() => { setShowForm(true); loadModels(); }}>New Merge Run</button>
      </div>

      {error && (
        <div style={{ padding: '10px 16px', background: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: 8, color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>{error}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
        <SectionCard title="合并任务">
          {loading ? <EmptyState title="加载中..." /> : runs.length === 0 ? <EmptyState title="暂无合并任务" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 500, overflow: 'auto' }}>
              {runs.map(r => (
                <button key={r.id}
                  onClick={() => loadDetail(r.id)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    background: selectedRun?.id === r.id ? 'var(--bg-elevated)' : 'transparent',
                    border: selectedRun?.id === r.id ? '1px solid var(--primary)' : '1px solid transparent',
                    borderRadius: 8, padding: '10px 12px', cursor: 'pointer', color: 'inherit',
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</span>
                    <StatusBadge s={r.status} size="xs" />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {r.method} · {r.source_model_ids?.length || 0} models
                    {r.result_metrics?.mAP ? ` · mAP: ${r.result_metrics.mAP.toFixed(3)}` : ''}
                  </div>
                </button>
              ))}
            </div>
          )}
        </SectionCard>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {selectedRun ? (
            <>
              <StatsGrid items={[
                { label: '方法', value: selectedRun.method, color: 'var(--primary)' },
                { label: '源模型数', value: selectedRun.source_model_ids?.length || 0 },
                { label: '状态', value: selectedRun.status },
                { label: '创建时间', value: new Date(selectedRun.created_at).toLocaleDateString('zh-CN') },
              ]} />

              {/* Result Metrics */}
              {selectedRun.result_metrics && Object.keys(selectedRun.result_metrics).length > 0 && (
                <SectionCard title="合并结果指标">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {Object.entries(selectedRun.result_metrics).map(([k, v]) => (
                      <div key={k} style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border)', textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{k}</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--success)' }}>{typeof v === 'number' ? v.toFixed(3) : String(v)}</div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Weights display */}
              {selectedRun.weights && selectedRun.weights.length > 0 && (
                <SectionCard title="合并权重">
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {selectedRun.weights.map((w, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'var(--bg-elevated)', borderRadius: 6, border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {selectedRun.source_model_ids[i]?.slice(0, 8)}...
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>{(w * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Source Models */}
              <SectionCard title="源模型">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {selectedRun.source_model_ids.map((mid, i) => {
                    const m = models.find(x => x.id === mid);
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 8px', background: 'var(--bg-elevated)', borderRadius: 4 }}>
                        <span style={{ color: 'var(--text-primary)' }}>{m?.name || mid}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{m?.architecture || ''}</span>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            </>
          ) : (
            <SectionCard title="合并详情">
              <EmptyState title="选择合并任务" description="从左侧列表选择一个合并任务查看详情。" />
            </SectionCard>
          )}
        </div>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowForm(false)}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: 12, padding: 24, width: 520, maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>New Model Merge</div>
            <form onSubmit={handleRun} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input className="ui-input" value={name} onChange={e => setName(e.target.value)} placeholder="Merge name" required />
              <select className="ui-select" value={method} onChange={e => setMethod(e.target.value)}>
                <option value="LERP">LERP (Linear)</option>
                <option value="SLERP">SLERP (Spherical)</option>
                <option value="TIES">TIES</option>
              </select>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Select Source Models (2+): {selectedSourceIds.length} selected</div>
                <div style={{ maxHeight: 200, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 4, border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
                  {models.map(m => (
                    <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, background: selectedSourceIds.includes(m.id) ? 'var(--primary-light)' : 'transparent', cursor: 'pointer', fontSize: 12 }}>
                      <input type="checkbox" checked={selectedSourceIds.includes(m.id)} onChange={() => toggleSource(m.id)} />
                      <span style={{ flex: 1, color: 'var(--text-primary)' }}>{m.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{m.architecture}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Weight Sliders */}
              {selectedModels.length >= 2 && (
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Weights (JSON array or auto-equal):</div>
                  <input className="ui-input" value={weightsStr} onChange={e => setWeightsStr(e.target.value)} placeholder={`[${selectedModels.map(() => (1.0 / selectedModels.length).toFixed(2)).join(', ')}]`} style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }} />
                  {selectedModels.map((m, i) => {
                    const defaultW = (1.0 / selectedModels.length * 100).toFixed(1);
                    return (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                        <div style={{ flex: 1, height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${defaultW}%`, height: '100%', background: 'var(--primary)', borderRadius: 3, opacity: 0.7 }} />
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, width: 36, textAlign: 'right' }}>{defaultW}%</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="ui-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="ui-btn ui-btn-primary" disabled={selectedSourceIds.length < 2}>Start Merge</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
}
