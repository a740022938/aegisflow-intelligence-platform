// v5.4.0 — Verification Summary Panel (验证摘要面板)
import React, { useState, useEffect } from 'react';

interface Props {
  compact?: boolean;
}

export default function VerificationSummaryPanel({ compact }: Props) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/health/verification')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>加载验证摘要...</div>;

  const { last_regression, last_recovery_drill, gate_summary, backup_health, seal_health } = data || {};

  if (compact) {
    return (
      <div style={{ display: 'flex', gap: 12, fontSize: 10 }}>
        <span style={{ color: last_regression?.status === 'passed' ? '#10B981' : '#EF4444' }}>
          Reg: {last_regression?.status || '—'}
        </span>
        <span style={{ color: last_recovery_drill?.status === 'success' ? '#10B981' : '#EF4444' }}>
          Drill: {last_recovery_drill?.status || '—'}
        </span>
        <span>Gate: {gate_summary?.passed}/{gate_summary?.total}</span>
      </div>
    );
  }

  return (
    <div style={{ padding: 12, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>🔍 持续验证摘要</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 11 }}>
        <div style={{ padding: 8, background: 'var(--bg-app)', borderRadius: 6 }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>最近 Regression</div>
          <div style={{ fontWeight: 600, color: last_regression?.status === 'passed' ? '#10B981' : '#EF4444' }}>
            {last_regression?.status || '无记录'}
          </div>
          {last_regression?.timestamp && (
            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>
              {new Date(last_regression.timestamp).toLocaleDateString('zh-CN')}
            </div>
          )}
        </div>
        <div style={{ padding: 8, background: 'var(--bg-app)', borderRadius: 6 }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>最近 Recovery Drill</div>
          <div style={{ fontWeight: 600, color: last_recovery_drill?.status === 'success' ? '#10B981' : '#EF4444' }}>
            {last_recovery_drill?.status || '无记录'}
          </div>
          {last_recovery_drill?.performed_at && (
            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>
              {new Date(last_recovery_drill.performed_at).toLocaleDateString('zh-CN')}
            </div>
          )}
        </div>
        <div style={{ padding: 8, background: 'var(--bg-app)', borderRadius: 6 }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>Gate 通过情况</div>
          <div style={{ fontWeight: 600 }}>
            {gate_summary?.passed || 0} / {gate_summary?.total || 0}
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>
            阻塞: {gate_summary?.blocked || 0}
          </div>
        </div>
        <div style={{ padding: 8, background: 'var(--bg-app)', borderRadius: 6 }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>备份状态</div>
          <div style={{ fontWeight: 600, color: backup_health === 'verified' ? '#10B981' : '#EF4444' }}>
            {backup_health === 'verified' ? '✓ 已验证' : '✗ 未验证'}
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>
            封板: {seal_health === 'present' ? '存在' : '缺失'}
          </div>
        </div>
      </div>
    </div>
  );
}
