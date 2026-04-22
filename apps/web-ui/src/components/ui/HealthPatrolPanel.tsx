// v5.4.0 — Health Patrol Panel (健康巡检面板)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface RiskItem {
  rule: string;
  status: 'ok' | 'caution' | 'warning' | 'blocked';
  detail: string;
}

interface Props {
  timeRange?: string;
}

const STATUS_COLORS: Record<string, string> = {
  healthy: '#10B981',
  caution: '#F59E0B',
  warning: '#F97316',
  blocked: '#EF4444',
};

const STATUS_LABELS: Record<string, string> = {
  healthy: '✅ HEALTHY',
  caution: '⚠️ CAUTION',
  warning: '🔶 WARNING',
  blocked: '⛔ BLOCKED',
};

export default function HealthPatrolPanel({ timeRange }: Props) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/health/patrol`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [timeRange]);

  if (loading) return <div style={{ padding: 20, color: 'var(--text-muted)' }}>加载健康巡检...</div>;

  const { overall_status, verification, trends, risks, links } = data || {};

  const statusColor = STATUS_COLORS[overall_status] || 'var(--text-muted)';
  const statusLabel = STATUS_LABELS[overall_status] || 'UNKNOWN';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Overall Status Badge */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px 24px', borderRadius: 'var(--radius-lg)',
        background: statusColor + '18', border: `2px solid ${statusColor}`,
      }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: statusColor }}>
          🏥 {statusLabel}
        </span>
      </div>

      {/* Verification Summary */}
      <div style={{ padding: 12, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>🔍 验证摘要</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 10 }}>
          <div style={{ padding: '6px 8px', background: 'var(--bg-app)', borderRadius: 4 }}>
            <div style={{ color: 'var(--text-muted)' }}>最近 Regression</div>
            <div style={{ fontWeight: 600 }}>
              {verification?.last_regression?.status || '—'}
            </div>
          </div>
          <div style={{ padding: '6px 8px', background: 'var(--bg-app)', borderRadius: 4 }}>
            <div style={{ color: 'var(--text-muted)' }}>最近 Recovery Drill</div>
            <div style={{ fontWeight: 600 }}>
              {verification?.last_recovery_drill?.status || '—'}
            </div>
          </div>
          <div style={{ padding: '6px 8px', background: 'var(--bg-app)', borderRadius: 4 }}>
            <div style={{ color: 'var(--text-muted)' }}>Gate 通过率</div>
            <div style={{ fontWeight: 600 }}>
              {verification?.gate_summary?.passed || 0}/{verification?.gate_summary?.total || 0}
            </div>
          </div>
          <div style={{ padding: '6px 8px', background: 'var(--bg-app)', borderRadius: 4 }}>
            <div style={{ color: 'var(--text-muted)' }}>备份状态</div>
            <div style={{ fontWeight: 600, color: verification?.backup_health === 'verified' ? '#10B981' : '#EF4444' }}>
              {verification?.backup_health || '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Trends */}
      <div style={{ padding: 12, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>📈 趋势统计</div>
        <div style={{ fontSize: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>失败任务</span>
            <span>24h: {trends?.failures?.['24h'] || 0} | 7d: {trends?.failures?.['7d'] || 0} | 30d: {trends?.failures?.['30d'] || 0}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>阻塞 Gate</span>
            <span>24h: {trends?.blocked_gates?.['24h'] || 0} | 7d: {trends?.blocked_gates?.['7d'] || 0} | 30d: {trends?.blocked_gates?.['30d'] || 0}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Recovery 成功率</span>
            <span style={{ color: (trends?.recovery_success_rate || 1) >= 0.9 ? '#10B981' : '#F59E0B' }}>
              {((trends?.recovery_success_rate || 1) * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Risk Signals */}
      <div style={{ padding: 12, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>⚠️ 风险信号</div>
        {risks?.map((r: RiskItem, i: number) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 10, padding: '4px 0', borderBottom: '1px solid var(--border)',
          }}>
            <span style={{ 
              color: r.status === 'ok' ? '#10B981' : 
                     r.status === 'caution' ? '#F59E0B' : 
                     r.status === 'warning' ? '#F97316' : '#EF4444' 
            }}>
              {r.status === 'ok' ? '✓' : r.status === 'blocked' ? '⛔' : '⚠'} {r.rule}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>{r.detail}</span>
          </div>
        ))}
      </div>

      {/* Navigation Links */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
        {[
          { to: '/factory-status', label: '🏭 工厂状态' },
          { to: '/audit', label: '📋 审计日志' },
          { to: '/workflow-jobs', label: '⚙️ 任务列表' },
        ].map(link => (
          <Link key={link.to} to={link.to} 
            style={{ fontSize: 10, padding: '4px 10px', background: 'var(--bg-app)', borderRadius: 4, textDecoration: 'none', color: 'var(--primary)' }}>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
