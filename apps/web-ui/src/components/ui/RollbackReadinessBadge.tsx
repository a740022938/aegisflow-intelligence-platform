// v5.3.0 — Rollback Readiness Badge (回滚就绪徽章)
import React, { useState, useEffect } from 'react';

interface Props {
  releaseId?: string;
  showDetail?: boolean;
}

export default function RollbackReadinessBadge({ releaseId, showDetail = false }: Props) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (releaseId) params.set('release_id', releaseId);
    
    fetch(`/api/release/rollback-readiness?${params}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [releaseId]);

  if (loading) return <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>检查回滚状态...</span>;

  const { status, checks, recommendation, last_drill } = data || {};
  
  const statusColor = 
    status === 'ready' ? '#10B981' :
    status === 'caution' ? '#F59E0B' :
    status === 'blocked' ? '#EF4444' : 'var(--text-muted)';

  const statusLabel = 
    status === 'ready' ? '✅ READY' :
    status === 'caution' ? '⚠️ CAUTION' :
    status === 'blocked' ? '⛔ BLOCKED' : '❓ UNKNOWN';

  return (
    <div style={{ display: 'inline-block' }}>
      {/* Badge */}
      <button
        onClick={() => showDetail && setExpanded(!expanded)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 16,
          background: statusColor + '18',
          border: `1.5px solid ${statusColor}`,
          color: statusColor,
          fontSize: 11, fontWeight: 700,
          cursor: showDetail ? 'pointer' : 'default',
        }}
      >
        <span>↩️</span>
        <span>{statusLabel}</span>
      </button>

      {/* Detail popup */}
      {showDetail && expanded && (
        <div style={{
          position: 'absolute', right: 0, top: '100%', marginTop: 8,
          width: 280, padding: 12, zIndex: 100,
          background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
            回滚判断详情
          </div>

          {/* Checks */}
          {checks?.map((c: any, i: number) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 10, padding: '4px 0',
              borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ color: c.passed ? '#10B981' : '#EF4444' }}>
                {c.passed ? '✓' : '✗'} {c.name}
              </span>
              <span style={{ color: 'var(--text-muted)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {c.detail}
              </span>
            </div>
          ))}

          {/* Last drill */}
          {last_drill && (
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>
              最近演练: {last_drill.performed_at} ({last_drill.status})
            </div>
          )}

          {/* Recommendation */}
          {recommendation && (
            <div style={{
              fontSize: 10, marginTop: 8, padding: '6px 8px',
              background: statusColor + '08', borderRadius: 4,
              color: statusColor,
            }}>
              💡 {recommendation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
