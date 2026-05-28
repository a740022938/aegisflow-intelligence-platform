import React, { useEffect, useState, useCallback } from 'react';
import { PageShell, SectionCard, StatusBadge, EmptyState, StatsGrid } from '../components/ui';

interface MonitoredModel {
  model_id: string; name: string; architecture: string; status: string;
  metrics: Record<string, number>; created_at: string;
}

interface MetricPoint {
  id: string; deployment_id: string; metric_type: string; metric_name: string;
  metric_value: number; threshold: number; drift_detected: number;
  sample_count: number; recorded_at: string;
}

async function get<T = any>(url: string): Promise<T> { const r = await fetch(url); return r.json(); }
async function post<T = any>(url: string): Promise<T> { const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } }); return r.json(); }

export default function ModelMonitorPage() {
  const [models, setModels] = useState<MonitoredModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [metrics, setMetrics] = useState<MetricPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadModels = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await get<{ ok: boolean; models: MonitoredModel[] }>('/api/model-monitor/models');
      if (res.ok) { setModels(res.models || []); if (!selectedModel && res.models?.length) setSelectedModel(res.models[0].model_id); }
      else setError(res.error || 'Failed');
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  const loadMetrics = useCallback(async (id: string) => {
    if (!id) return;
    setError('');
    try {
      const res = await get<{ ok: boolean; metrics: MetricPoint[] }>(`/api/model-monitor/models/${id}/metrics?limit=50`);
      if (res.ok) setMetrics(res.metrics || []);
    } catch (e: any) { setError(e.message); }
  }, []);

  useEffect(() => { loadModels(); }, [loadModels]);
  useEffect(() => { loadMetrics(selectedModel); }, [selectedModel, loadMetrics]);

  const refreshModel = async (id: string) => {
    await post(`/api/model-monitor/models/${id}/refresh`);
    loadMetrics(id);
  };

  const currentModel = models.find(m => m.model_id === selectedModel);
  const driftCount = metrics.filter(m => m.drift_detected).length;
  const hasDrift = driftCount > 0;
  const recentValues = metrics.slice(0, 20).reverse();

  const chartMax = Math.max(0.01, ...recentValues.map(m => m.metric_value));
  const chartWidth = 520;
  const chartHeight = 140;
  const pad = 16;

  return (
    <PageShell title="模型监控" subtitle="监控生产模型质量、漂移检测、自动告警" maturity="lab">
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Select Model:</span>
        <select className="ui-select" value={selectedModel} onChange={e => setSelectedModel(e.target.value)} style={{ minWidth: 220 }}>
          <option value="">--</option>
          {models.map(m => <option key={m.model_id} value={m.model_id}>{m.name} ({m.architecture})</option>)}
        </select>
        {selectedModel && (
          <button className="ui-btn ui-btn-primary" style={{ fontSize: 12 }} onClick={() => refreshModel(selectedModel)}>
            Refresh Metrics
          </button>
        )}
      </div>

      {error && (
        <div style={{ padding: '10px 16px', background: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: 8, color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>{error}</div>
      )}

      {currentModel && (
        <StatsGrid items={[
          { label: '模型名称', value: currentModel.name },
          { label: '架构', value: currentModel.architecture, color: 'var(--primary)' },
          { label: '漂移状态', value: hasDrift ? '漂移中' : '正常', color: hasDrift ? 'var(--danger)' : 'var(--success)' },
          { label: '漂移次数', value: driftCount, color: driftCount > 0 ? 'var(--warning)' : undefined },
        ]} />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        {/* Key Metrics Panel */}
        <SectionCard title="关键指标">
          {!currentModel ? <EmptyState title="请选择一个模型" /> : !currentModel.metrics || Object.keys(currentModel.metrics).length === 0 ? (
            <EmptyState title="暂无指标" description="该模型暂无监控指标。" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {Object.entries(currentModel.metrics).map(([k, v]) => (
                <div key={k} style={{ padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{k}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>{typeof v === 'number' ? v.toFixed(4) : String(v)}</div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Drift Detection Status */}
        <SectionCard title="漂移检测">
          {loading ? <EmptyState title="加载中..." /> : metrics.length === 0 ? (
            <EmptyState title="暂无数据" description="尚未记录任何监控指标。" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 12, height: 12, borderRadius: '50%',
                  background: hasDrift ? 'var(--danger)' : 'var(--success)',
                  boxShadow: `0 0 8px ${hasDrift ? 'var(--danger-glow)' : 'var(--success-glow)'}`,
                }} />
                <span style={{ fontWeight: 600, fontSize: 14, color: hasDrift ? 'var(--danger)' : 'var(--success)' }}>
                  {hasDrift ? `${driftCount} 个指标发生漂移` : '所有指标正常'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 200, overflow: 'auto' }}>
                {recentValues.slice(-10).map((m, i) => (
                  <div key={m.id || i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 8px', background: m.drift_detected ? 'var(--danger-light)' : 'transparent', borderRadius: 4 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{m.metric_name}</span>
                    <span style={{ color: m.drift_detected ? 'var(--danger)' : 'var(--text-primary)', fontWeight: 600 }}>{m.metric_value.toFixed(4)}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{new Date(m.recorded_at).toLocaleTimeString('zh-CN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Time-series Chart */}
      {recentValues.length > 0 && (
        <SectionCard title="时间序列 — 指标趋势" style={{ marginTop: 16 }}>
          <svg width={chartWidth + pad * 2} height={chartHeight + pad * 2} style={{ display: 'block' }}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(pct => {
              const y = pad + chartHeight - (chartHeight * pct);
              return (
                <g key={pct}>
                  <line x1={pad} y1={y} x2={pad + chartWidth} y2={y} stroke="var(--border)" strokeWidth="0.5" />
                  <text x={pad - 4} y={y + 3} textAnchor="end" fill="var(--text-muted)" fontSize="9">
                    {(chartMax * pct).toFixed(2)}
                  </text>
                </g>
              );
            })}
            {/* Data line */}
            {recentValues.length > 1 && (
              <polyline
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2"
                points={recentValues.map((m, i) => {
                  const x = pad + (i / Math.max(recentValues.length - 1, 1)) * chartWidth;
                  const y = pad + chartHeight - (m.metric_value / chartMax) * chartHeight;
                  return `${x},${y}`;
                }).join(' ')}
              />
            )}
            {/* Data dots */}
            {recentValues.map((m, i) => {
              const x = pad + (i / Math.max(recentValues.length - 1, 1)) * chartWidth;
              const y = pad + chartHeight - (m.metric_value / chartMax) * chartHeight;
              return (
                <circle key={i} cx={x} cy={y} r={3}
                  fill={m.drift_detected ? 'var(--danger)' : 'var(--primary)'}
                  stroke="var(--bg-surface)" strokeWidth="1" />
              );
            })}
          </svg>
        </SectionCard>
      )}
    </PageShell>
  );
}
