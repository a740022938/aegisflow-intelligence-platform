// v5.0.0 — Gate Status Card
import React from 'react';

interface CheckResult {
  check: string;
  passed: boolean;
  reason?: string;
}

interface Props {
  gate: {
    gate_name: string;
    stage_name: string;
    entity_id: string;
    status: 'passed' | 'blocked' | 'pending' | 'failed';
    check_results?: CheckResult[];
    fail_reasons?: string[];
    blocking_status?: string;
    checked_at: string;
  } | null;
  compact?: boolean;
}

const GATE_LABELS: Record<string, string> = {
  evaluation_ready: '评估就绪',
  artifact_ready: '产物就绪',
  promotion_ready: '晋升就绪',
  release_ready: '发布就绪',
  seal_ready: '封存就绪',
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  passed: { bg: '#10B98118', text: '#10B981', border: '#10B981' },
  blocked: { bg: '#F59E0B18', text: '#F59E0B', border: '#F59E0B' },
  pending: { bg: '#3B82F618', text: '#3B82F6', border: '#3B82F6' },
  failed: { bg: '#EF444418', text: '#EF4444', border: '#EF4444' },
};

export default function GateStatusCard({ gate, compact = false }: Props) {
  if (!gate) {
    return (
      <div style={{ padding: '8px 12px', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>未检查</span>
      </div>
    );
  }

  const colors = STATUS_COLORS[gate.status] || STATUS_COLORS.pending;

  return (
    <div style={{
      padding: compact ? '8px 12px' : '12px 16px',
      background: 'var(--bg-surface)',
      borderRadius: 'var(--radius-md)',
      border: `1.5px solid ${colors.border}`,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: compact ? 0 : 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
            background: colors.bg, color: colors.text,
          }}>
            {gate.status === 'passed' ? '✅' : gate.status === 'blocked' ? '🚫' : '⏳'} {gate.status.toUpperCase()}
          </span>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{GATE_LABELS[gate.gate_name] || gate.gate_name}</span>
        </div>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          {gate.entity_id.slice(0, 8)}...
        </span>
      </div>

      {/* Check results */}
      {!compact && gate.check_results && gate.check_results.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginTop: 8 }}>
          {gate.check_results.map((c, i) => (
            <div key={i} style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: c.passed ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                {c.passed ? '✓' : '✗'}
              </span>
              <span style={{ color: c.passed ? 'var(--text-main)' : '#EF4444' }}>
                {c.check.replace(/_/g, ' ')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Fail reasons */}
      {!compact && gate.fail_reasons && gate.fail_reasons.length > 0 && (
        <div style={{ marginTop: 8, padding: '6px 8px', background: '#EF444408', borderRadius: 4, fontSize: 11, color: '#EF4444' }}>
          {gate.fail_reasons.join('; ')}
        </div>
      )}

      {/* Timestamp */}
      {!compact && (
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>
          检查于 {new Date(gate.checked_at).toLocaleString()}
        </div>
      )}
    </div>
  );
}
