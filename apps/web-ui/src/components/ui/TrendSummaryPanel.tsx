// v5.4.0 — Trend Summary Panel (趋势摘要面板)
import React, { useState, useEffect } from 'react';

interface Props {
  metric?: 'failures' | 'blocked_gates' | 'recovery';
}

export default function TrendSummaryPanel({ metric }: Props) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/health/trends')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>加载趋势...</div>;

  const { failures, blocked_gates, recovery_success_rate } = data || {};

  const metrics = [
    {
      label: '失败任务',
      data: failures,
      color: (failures?.['24h'] || 0) > 10 ? '#EF4444' : (failures?.['7d'] || 0) > 20 ? '#F59E0B' : '#10B981',
    },
    {
      label: '阻塞 Gate',
      data: blocked_gates,
      color: (blocked_gates?.['24h'] || 0) > 3 ? '#EF4444' : '#F59E0B',
    },
    {
      label: 'Recovery 成功率',
      data: { '24h': `${(recovery_success_rate * 100).toFixed(0)}%`, '7d': '', '30d': '' },
      color: recovery_success_rate >= 0.9 ? '#10B981' : '#F59E0B',
    },
  ];

  return (
    <div style={{ padding: 12, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>📈 趋势统计</div>
      <table style={{ width: '100%', fontSize: 10, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th style={{ textAlign: 'left', padding: '4px 8px' }}>指标</th>
            <th style={{ textAlign: 'center', padding: '4px 8px' }}>24h</th>
            <th style={{ textAlign: 'center', padding: '4px 8px' }}>7d</th>
            <th style={{ textAlign: 'center', padding: '4px 8px' }}>30d</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map(m => (
            <tr key={m.label} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '4px 8px', color: m.color, fontWeight: 600 }}>{m.label}</td>
              <td style={{ padding: '4px 8px', textAlign: 'center' }}>{m.data?.['24h'] ?? '—'}</td>
              <td style={{ padding: '4px 8px', textAlign: 'center' }}>{m.data?.['7d'] ?? '—'}</td>
              <td style={{ padding: '4px 8px', textAlign: 'center' }}>{m.data?.['30d'] ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
