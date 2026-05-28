import React, { useEffect, useState, useCallback } from 'react';
import { PageShell, SectionCard, StatusBadge, EmptyState, StatsGrid } from '../components/ui';

interface HPORun {
  id: string; name: string; method: string; target_metric: string;
  status: string; best_value: number; best_params: Record<string, number>;
  param_space: Array<{ name: string; type: string; min?: number; max?: number; step?: number; values?: any[] }>;
  created_at: string;
}

interface Trial {
  id: string; run_id: string; trial_index: number;
  params: Record<string, number>; result_value: number; status: string;
}

const API = '/api/hpo';

async function get<T = any>(url: string): Promise<T> { const r = await fetch(url); return r.json(); }
async function post<T = any>(url: string, body?: any): Promise<T> {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
  return r.json();
}

export default function HPOPage() {
  const [runs, setRuns] = useState<HPORun[]>([]);
  const [selectedRun, setSelectedRun] = useState<HPORun | null>(null);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [method, setMethod] = useState('random');
  const [targetMetric, setTargetMetric] = useState('mAP');
  const [paramSpaceJson, setParamSpaceJson] = useState('[\n  {"name": "lr", "type": "float", "min": 0.0001, "max": 0.1, "step": 0.001},\n  {"name": "epochs", "type": "int", "min": 10, "max": 200, "step": 10},\n  {"name": "batch_size", "type": "choice", "values": [8, 16, 32, 64]}\n]');

  const loadRuns = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await get<{ ok: boolean; runs: HPORun[] }>(`${API}/runs`);
      if (res.ok) setRuns(res.runs || []);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  const loadRunDetail = useCallback(async (id: string) => {
    setError('');
    try {
      const res = await get<{ ok: boolean; run: HPORun; trials: Trial[] }>(`${API}/runs/${id}`);
      if (res.ok) { setSelectedRun(res.run); setTrials(res.trials || []); }
    } catch (e: any) { setError(e.message); }
  }, []);

  useEffect(() => { loadRuns(); }, [loadRuns]);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    let ps = [];
    try { ps = JSON.parse(paramSpaceJson); } catch { return setError('Invalid param_space JSON'); }
    const res = await post(`${API}/run`, { name, method, target_metric: targetMetric, param_space: ps });
    if (res.ok) { setShowForm(false); setName(''); loadRuns(); if (res.run?.id) loadRunDetail(res.run.id); }
    else setError(res.error || 'Failed');
  };

  const convergenceData = trials.map((t, i) => ({ x: i, y: t.result_value }));

  return (
    <PageShell title="超参优化" subtitle="Grid / Random / Bayesian 搜索" maturity="lab">
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <button className="ui-btn ui-btn-primary" onClick={() => setShowForm(true)}>New HPO Run</button>
      </div>

      {error && (
        <div style={{ padding: '10px 16px', background: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: 8, color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>{error}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16 }}>
        <SectionCard title="搜索任务列表">
          {loading ? <EmptyState title="加载中..." /> : runs.length === 0 ? <EmptyState title="暂无搜索任务" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 500, overflow: 'auto' }}>
              {runs.map(r => (
                <button key={r.id}
                  onClick={() => loadRunDetail(r.id)}
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
                    {r.method} · {r.target_metric} · best: {r.best_value?.toFixed(3) ?? '--'}
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
                { label: '目标指标', value: selectedRun.target_metric },
                { label: '最佳值', value: selectedRun.best_value?.toFixed(4) ?? '--', color: 'var(--success)' },
                { label: '试验数', value: trials.length },
              ]} />

              {selectedRun.best_params && Object.keys(selectedRun.best_params).length > 0 && (
                <SectionCard title="最佳参数">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {Object.entries(selectedRun.best_params).map(([k, v]) => (
                      <div key={k} style={{ padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 6, border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{k}</span>
                        <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Trial Results Table */}
              <SectionCard title="试验结果">
                {trials.length === 0 ? <EmptyState title="暂无试验数据" /> : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          <th style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500 }}>#</th>
                          {Object.keys(trials[0]?.params || {}).map(k => (
                            <th key={k} style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500 }}>{k}</th>
                          ))}
                          <th style={{ padding: '6px 10px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 500 }}>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trials.map((t, i) => {
                          const isBest = selectedRun.best_value != null && t.result_value === selectedRun.best_value;
                          return (
                            <tr key={t.id} style={{ borderBottom: '1px solid var(--border)', background: isBest ? 'var(--primary-light)' : undefined }}>
                              <td style={{ padding: '6px 10px', color: 'var(--text-secondary)' }}>{t.trial_index}</td>
                              {Object.entries(t.params).map(([k, v]) => (
                                <td key={k} style={{ padding: '6px 10px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{String(v)}</td>
                              ))}
                              <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 700, color: isBest ? 'var(--success)' : 'var(--text-primary)' }}>
                                {t.result_value?.toFixed(4)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </SectionCard>

              {/* Convergence Plot */}
              {convergenceData.length > 0 && (
                <SectionCard title="收敛曲线">
                  <ConvergenceChart data={convergenceData} />
                </SectionCard>
              )}
            </>
          ) : (
            <SectionCard title="任务详情">
              <EmptyState title="请选择搜索任务" description="从左侧列表选择一个任务查看详情。" />
            </SectionCard>
          )}
        </div>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowForm(false)}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: 12, padding: 24, width: 520, maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>New HPO Run</div>
            <form onSubmit={handleRun} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input className="ui-input" value={name} onChange={e => setName(e.target.value)} placeholder="Run name" required />
              <select className="ui-select" value={method} onChange={e => setMethod(e.target.value)}>
                <option value="random">Random Search</option>
                <option value="grid">Grid Search</option>
                <option value="bayesian">Bayesian</option>
              </select>
              <input className="ui-input" value={targetMetric} onChange={e => setTargetMetric(e.target.value)} placeholder="Target metric (e.g. mAP)" />
              <textarea className="ui-input" value={paramSpaceJson} onChange={e => setParamSpaceJson(e.target.value)} rows={8} style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }} />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="ui-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="ui-btn ui-btn-primary">Start HPO</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
}

function ConvergenceChart({ data }: { data: Array<{ x: number; y: number }> }) {
  const w = 480; const h = 150; const pad = 20;
  const maxY = Math.max(...data.map(d => d.y), 0.01);
  const minY = Math.min(...data.map(d => d.y), 0);
  const range = maxY - minY || 1;
  return (
    <svg width={w + pad * 2} height={h + pad * 2} style={{ display: 'block' }}>
      {data.length > 1 && (
        <polyline fill="none" stroke="var(--primary)" strokeWidth="2"
          points={data.map((d, i) => `${pad + (i / (data.length - 1)) * w},${pad + h - ((d.y - minY) / range) * h}`).join(' ')} />
      )}
      {data.map((d, i) => {
        const x = pad + (data.length > 1 ? (i / (data.length - 1)) * w : w / 2);
        const y = pad + h - ((d.y - minY) / range) * h;
        return <circle key={i} cx={x} cy={y} r={3} fill="var(--primary)" stroke="var(--bg-surface)" strokeWidth="1" />;
      })}
    </svg>
  );
}
