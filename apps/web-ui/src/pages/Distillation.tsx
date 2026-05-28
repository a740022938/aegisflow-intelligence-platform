import React, { useEffect, useState, useCallback } from 'react';
import { PageShell, SectionCard, StatusBadge, EmptyState, StatsGrid } from '../components/ui';

interface DistillRun {
  id: string; name: string; teacher_model_id: string; student_model_arch: string;
  temperature: number; alpha: number; status: string;
  loss_history: number[]; created_at: string;
}

interface Model { id: string; name: string; architecture: string; }

const API = '/api/distill';

async function get<T = any>(url: string): Promise<T> { const r = await fetch(url); return r.json(); }
async function post<T = any>(url: string, body?: any): Promise<T> {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
  return r.json();
}

export default function DistillationPage() {
  const [runs, setRuns] = useState<DistillRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<DistillRun | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [models, setModels] = useState<Model[]>([]);

  // Form
  const [name, setName] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [studentArch, setStudentArch] = useState('yolov8n');
  const [temperature, setTemperature] = useState('3.0');
  const [alpha, setAlpha] = useState('0.5');

  const loadRuns = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await get<{ ok: boolean; runs: DistillRun[] }>(`${API}/runs`);
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
      const res = await get<{ ok: boolean; run: DistillRun }>(`${API}/runs/${id}`);
      if (res.ok) setSelectedRun(res.run);
    } catch (e: any) { setError(e.message); }
  };

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await post(`${API}/run`, { name, teacher_model_id: teacherId, student_model_arch: studentArch, temperature: parseFloat(temperature), alpha: parseFloat(alpha) });
    if (res.ok) { setShowForm(false); setName(''); setTeacherId(''); loadRuns(); if (res.run?.id) loadDetail(res.run.id); }
    else setError(res.error || 'Failed');
  };

  return (
    <PageShell title="知识蒸馏" subtitle="Teacher → Student 神经网络知识迁移" maturity="lab">
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <button className="ui-btn ui-btn-primary" onClick={() => { setShowForm(true); loadModels(); }}>New Distillation Run</button>
      </div>

      {error && (
        <div style={{ padding: '10px 16px', background: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: 8, color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>{error}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
        <SectionCard title="蒸馏任务">
          {loading ? <EmptyState title="加载中..." /> : runs.length === 0 ? <EmptyState title="暂无蒸馏任务" /> : (
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
                    {r.teacher_model_id.slice(0, 8)} → {r.student_model_arch}
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
                { label: 'Teacher', value: selectedRun.teacher_model_id.slice(0, 12) + '...', color: 'var(--data-purple)' },
                { label: 'Student', value: selectedRun.student_model_arch, color: 'var(--primary)' },
                { label: '温度', value: selectedRun.temperature },
                { label: 'Alpha', value: selectedRun.alpha },
                { label: '状态', value: selectedRun.status },
              ]} />

              {selectedRun.loss_history && selectedRun.loss_history.length > 0 && (
                <SectionCard title="Loss Curve">
                  <LossChart data={selectedRun.loss_history} />
                </SectionCard>
              )}

              <SectionCard title="运行信息">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                  <div>创建时间: {new Date(selectedRun.created_at).toLocaleString('zh-CN')}</div>
                  <div>温度: {selectedRun.temperature}</div>
                  <div>Alpha: {selectedRun.alpha}</div>
                  <div>最终 Loss: {selectedRun.loss_history?.length ? selectedRun.loss_history[selectedRun.loss_history.length - 1].toFixed(4) : '--'}</div>
                </div>
              </SectionCard>
            </>
          ) : (
            <SectionCard title="蒸馏详情">
              <EmptyState title="选择蒸馏任务" description="从左侧列表选择一个蒸馏任务查看详情。" />
            </SectionCard>
          )}
        </div>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowForm(false)}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: 12, padding: 24, width: 480, maxWidth: '90vw', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>New Distillation Run</div>
            <form onSubmit={handleRun} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input className="ui-input" value={name} onChange={e => setName(e.target.value)} placeholder="Run name" required />
              <select className="ui-select" value={teacherId} onChange={e => setTeacherId(e.target.value)} required>
                <option value="">Select Teacher Model</option>
                {models.map(m => <option key={m.id} value={m.id}>{m.name} ({m.architecture})</option>)}
              </select>
              <select className="ui-select" value={studentArch} onChange={e => setStudentArch(e.target.value)}>
                <option value="yolov8n">YOLOv8 Nano</option>
                <option value="yolov8s">YOLOv8 Small</option>
                <option value="yolov8m">YOLOv8 Medium</option>
                <option value="resnet18">ResNet-18</option>
                <option value="mobilenet_v3">MobileNet v3</option>
              </select>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Temperature</label>
                  <input className="ui-input" type="number" step="0.5" min="1" max="10" value={temperature} onChange={e => setTemperature(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Alpha</label>
                  <input className="ui-input" type="number" step="0.05" min="0" max="1" value={alpha} onChange={e => setAlpha(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="ui-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="ui-btn ui-btn-primary">Start Distillation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
}

function LossChart({ data }: { data: number[] }) {
  const w = 480; const h = 150; const pad = 20;
  const maxY = Math.max(...data, 0.01);
  const minY = Math.min(...data, 0);
  const range = maxY - minY || 1;
  return (
    <svg width={w + pad * 2} height={h + pad * 2} style={{ display: 'block' }}>
      {data.length > 1 && (
        <polyline fill="none" stroke="var(--danger)" strokeWidth="2"
          points={data.map((d, i) => `${pad + (i / (data.length - 1)) * w},${pad + ((maxY - d) / range) * h}`).join(' ')} />
      )}
      {data.map((d, i) => {
        const x = pad + (data.length > 1 ? (i / (data.length - 1)) * w : w / 2);
        const y = pad + ((maxY - d) / range) * h;
        return <circle key={i} cx={x} cy={y} r={2} fill="var(--danger)" stroke="var(--bg-surface)" strokeWidth="1" />;
      })}
      {/* Axis labels */}
      <text x={pad + w / 2} y={pad + h + 16} textAnchor="middle" fill="var(--text-muted)" fontSize="10">Step</text>
      <text x={pad + w / 2} y={pad - 6} textAnchor="middle" fill="var(--text-muted)" fontSize="10">Loss</text>
      <text x={pad + w - 4} y={pad - 4} textAnchor="end" fill="var(--text-muted)" fontSize="9">{maxY.toFixed(2)}</text>
    </svg>
  );
}
