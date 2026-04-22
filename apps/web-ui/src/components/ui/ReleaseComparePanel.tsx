// v5.3.0 — Release Compare Panel (版本对比面板)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  candidateId: string;
  stableId?: string;
  onClose?: () => void;
}

export default function ReleaseComparePanel({ candidateId, stableId, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams({ candidate_id: candidateId });
    if (stableId) params.set('stable_id', stableId);
    
    fetch(`/api/release/compare?${params}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [candidateId, stableId]);

  if (loading) return <div style={{ padding: 20, color: 'var(--text-muted)' }}>加载对比...</div>;

  const { candidate, stable, diff, ready_for_promotion, blockers } = data || {};

  return (
    <div style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>🔍 版本对比</span>
        {onClose && (
          <button className="ui-btn ui-btn-ghost ui-btn-xs" onClick={onClose}>✕ 关闭</button>
        )}
      </div>

      {/* Two-column compare */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Candidate */}
        <div style={{ padding: 12, background: '#F59E0B08', borderRadius: 8, border: '1px solid #F59E0B33' }}>
          <div style={{ fontSize: 11, color: '#F59E0B', fontWeight: 700, marginBottom: 8 }}>候选版</div>
          {candidate ? (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{candidate.release_name}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{candidate.release_version}</div>
            </div>
          ) : <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>无</div>}
        </div>

        {/* Stable */}
        <div style={{ padding: 12, background: '#8B5CF608', borderRadius: 8, border: '1px solid #8B5CF633' }}>
          <div style={{ fontSize: 11, color: '#8B5CF6', fontWeight: 700, marginBottom: 8 }}>稳定版</div>
          {stable ? (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{stable.release_name}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{stable.release_version}</div>
            </div>
          ) : <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>无</div>}
        </div>
      </div>

      {/* Diff table */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>差异对比</div>
        <table style={{ width: '100%', fontSize: 10, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '4px 8px' }}>维度</th>
              <th style={{ textAlign: 'center', padding: '4px 8px' }}>候选版</th>
              <th style={{ textAlign: 'center', padding: '4px 8px' }}>稳定版</th>
            </tr>
          </thead>
          <tbody>
            {diff && Object.entries(diff).map(([key, val]: [string, any]) => (
              <tr key={key} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '4px 8px', color: 'var(--text-muted)' }}>{key}</td>
                <td style={{ padding: '4px 8px', textAlign: 'center' }}>{val.candidate ?? '—'}</td>
                <td style={{ padding: '4px 8px', textAlign: 'center' }}>{val.stable ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Promotion status */}
      <div style={{ padding: 12, background: (ready_for_promotion ? '#10B981' : '#EF4444') + '08', borderRadius: 8, border: `1px solid ${(ready_for_promotion ? '#10B981' : '#EF4444') + '33'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: ready_for_promotion ? '#10B981' : '#EF4444' }}>
            {ready_for_promotion ? '✅ 可以晋升' : '⛔ 存在阻塞'}
          </span>
        </div>
        {blockers?.length > 0 && (
          <div style={{ marginTop: 8 }}>
            {blockers.map((b: string, i: number) => (
              <div key={i} style={{ fontSize: 10, color: '#EF4444', marginBottom: 2 }}>• {b}</div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <Link to={`/audit?category=release&release_id=${candidateId}`} className="ui-btn ui-btn-outline ui-btn-xs" style={{ textDecoration: 'none' }}>
          📋 审计日志
        </Link>
        <Link to="/factory-status" className="ui-btn ui-btn-ghost ui-btn-xs" style={{ textDecoration: 'none' }}>
          → 返回
        </Link>
      </div>
    </div>
  );
}
