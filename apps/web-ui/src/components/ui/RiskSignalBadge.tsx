// v5.4.0 — Risk Signal Badge (风险信号徽章)
import React, { useState, useEffect } from 'react';

interface RiskItem {
  rule: string;
  status: 'ok' | 'caution' | 'warning' | 'blocked';
  detail: string;
}

interface Props {
  showDetail?: boolean;
  compact?: boolean;
}

const STATUS_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  healthy: { color: '#10B981', icon: '✅', label: 'HEALTHY' },
  caution: { color: '#F59E0B', icon: '⚠️', label: 'CAUTION' },
  warning: { color: '#F97316', icon: '🔶', label: 'WARNING' },
  blocked: { color: '#EF4444', icon: '⛔', label: 'BLOCKED' },
};

export default function RiskSignalBadge({ showDetail = false, compact = false }: Props) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch('/api/health/risks')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>检查风险...</span>;

  const { overall_status, risks, recommendation } = data || {};
  const config = STATUS_CONFIG[overall_status] || STATUS_CONFIG.healthy;

  if (compact) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '2px 8px', borderRadius: 12,
        background: config.color + '18',
        color: config.color, fontSize: 10, fontWeight: 600,
      }}>
        {config.icon} {config.label}
      </span>
    );
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Badge */}
      <button
        onClick={() => showDetail && setExpanded(!expanded)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 16px', borderRadius: 20,
          background: config.color + '18',
          border: `2px solid ${config.color}`,
          color: config.color,
          fontSize: 12, fontWeight: 700,
          cursor: showDetail ? 'pointer' : 'default',
        }}
      >
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </button>

      {/* Detail Popup */}
      {showDetail && expanded && (
        <div style={{
          position: 'absolute', right: 0, top: '100%', marginTop: 8,
          width: 300, padding: 12, zIndex: 100,
          background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
            ⚠️ 风险信号详情
          </div>

          {risks?.map((r: RiskItem, i: number) => {
            const rConfig = STATUS_CONFIG[r.status] || STATUS_CONFIG.healthy;
            return (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 10, padding: '4px 0',
                borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ color: rConfig.color }}>
                  {rConfig.icon} {r.rule}
                </span>
                <span style={{ color: 'var(--text-muted)', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {r.detail}
                </span>
              </div>
            );
          })}

          {recommendation && (
            <div style={{
              fontSize: 10, marginTop: 8, padding: '6px 8px',
              background: config.color + '08', borderRadius: 4,
              color: config.color,
            }}>
              💡 {recommendation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
