import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { PageShell, SectionCard, EmptyState, StatsGrid } from '../components/ui';

interface CostRecord {
  id: string; type: string; description: string; amount: number;
  currency: string; created_at: string;
}

interface CostSummary {
  total: number; period: string;
  by_type: Array<{ type: string; total: number; count: number }>;
  monthly: Array<{ month: string; type: string; total: number }>;
}

const API = '/api/costs';

async function get<T = any>(url: string): Promise<T> { const r = await fetch(url); return r.json(); }
async function post<T = any>(url: string, body?: any): Promise<T> {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
  return r.json();
}

const TYPE_COLORS: Record<string, string> = {
  gpu: 'var(--data-cyan)', training: 'var(--primary)', storage: 'var(--data-purple)',
  inference: 'var(--secondary)', labeling: 'var(--data-orange)', other: 'var(--text-muted)',
};

export default function CostTrackerPage() {
  const [records, setRecords] = useState<CostRecord[]>([]);
  const [summary, setSummary] = useState<CostSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState('gpu');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('CNY');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [recRes, sumRes] = await Promise.all([
        get<{ ok: boolean; records: CostRecord[] }>(API),
        get<{ ok: boolean; total: number; period: string; by_type: CostSummary['by_type']; monthly: CostSummary['monthly'] }>(`${API}/summary?period=month`),
      ]);
      if (recRes.ok) setRecords(recRes.records || []);
      if (sumRes.ok) setSummary({ total: sumRes.total, period: sumRes.period, by_type: sumRes.by_type || [], monthly: sumRes.monthly || [] });
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await post(API, { type, description: desc, amount: parseFloat(amount), currency });
    if (res.ok) { setShowModal(false); setDesc(''); setAmount(''); load(); }
    else setError(res.error || 'Failed');
  };

  const monthlyByType = useMemo(() => {
    const map = new Map<string, Record<string, number>>();
    for (const m of (summary?.monthly || [])) {
      if (!map.has(m.month)) map.set(m.month, {});
      map.get(m.month)![m.type] = (map.get(m.month)![m.type] || 0) + m.total;
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
  }, [summary]);

  const allTypes = useMemo(() => {
    const s = new Set<string>();
    (summary?.monthly || []).forEach(m => s.add(m.type));
    return Array.from(s);
  }, [summary]);

  const barChartWidth = 520;
  const barChartHeight = 160;
  const barPad = 36;
  const barMax = useMemo(() => Math.max(1, ...monthlyByType.flatMap(([, v]) => Object.values(v))), [monthlyByType]);

  return (
    <PageShell title="成本追踪" subtitle="GPU / 训练 / 推理 费用分析" maturity="lab">
      {error && (
        <div style={{ padding: '10px 16px', background: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: 8, color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>{error}</div>
      )}

      <StatsGrid items={[
        { label: '本月总费用', value: `¥${(summary?.total || 0).toFixed(2)}` },
        ...(summary?.by_type || []).map(t => ({ label: t.type, value: `¥${t.total.toFixed(2)}`, color: TYPE_COLORS[t.type] })),
      ]} />

      <div style={{ margin: '16px 0' }}>
        <button className="ui-btn ui-btn-primary" onClick={() => setShowModal(true)}>Add Record</button>
      </div>

      {/* Monthly bar chart */}
      {monthlyByType.length > 0 && (
        <SectionCard title="月度费用分布" style={{ marginBottom: 16 }}>
          <svg width={barChartWidth + barPad * 2} height={barChartHeight + barPad * 2} style={{ display: 'block' }}>
            {monthlyByType.map(([month, byType], mi) => {
              const barW = (barChartWidth / monthlyByType.length) * 0.7;
              const gap = barChartWidth / monthlyByType.length;
              const entries = Object.entries(byType);
              let yOff = barChartHeight;
              return entries.map(([tp, val], ti) => {
                const h = (val / barMax) * barChartHeight;
                yOff -= h;
                const bar = (
                  <rect key={`${mi}-${ti}`}
                    x={barPad + mi * gap + (gap - barW) / 2}
                    y={barPad + yOff}
                    width={barW}
                    height={Math.max(1, h)}
                    fill={TYPE_COLORS[tp] || TYPE_COLORS.other}
                    rx="2" />
                );
                if (ti === entries.length - 1) {
                  return (
                    <g key={`${mi}-${ti}`}>
                      {bar}
                      <text x={barPad + mi * gap + gap / 2} y={barPad + barChartHeight + 16} textAnchor="middle" fill="var(--text-muted)" fontSize="9">{month}</text>
                    </g>
                  );
                }
                return bar;
              }).flat();
            })}
          </svg>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
            {allTypes.map(tp => (
              <span key={tp} style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: TYPE_COLORS[tp], display: 'inline-block' }} />
                {tp}
              </span>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Records Table */}
      <SectionCard title={`费用记录 (${records.length})`}>
        {loading ? <EmptyState title="加载中..." /> : records.length === 0 ? (
          <EmptyState title="暂无记录" description='点击 "Add Record" 添加第一条费用记录。' />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>类型</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>描述</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>金额</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>货币</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>时间</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ color: TYPE_COLORS[r.type] || 'var(--text-secondary)', fontWeight: 600 }}>{r.type}</span>
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{r.description}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {r.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-muted)' }}>{r.currency}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(r.created_at).toLocaleDateString('zh-CN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Add Record Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: 12, padding: 24, width: 420, maxWidth: '90vw', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Add Cost Record</div>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <select className="ui-select" value={type} onChange={e => setType(e.target.value)}>
                {['gpu', 'training', 'storage', 'inference', 'labeling', 'other'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input className="ui-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" required />
              <input className="ui-input" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" required />
              <select className="ui-select" value={currency} onChange={e => setCurrency(e.target.value)}>
                {['CNY', 'USD', 'EUR'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="ui-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="ui-btn ui-btn-primary">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
}
