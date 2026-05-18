import React from 'react'

const STATUS_MAP: Record<string, string> = {
  implemented: '#22C55E',
  started: '#8B5CF6',
  blocked: '#EF4444',
  disabled: '#6B7280',
  synthetic_only: '#8B5CF6',
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 10,
      fontWeight: 600, color: '#fff', background: STATUS_MAP[label] || '#6B7280',
      lineHeight: '16px', whiteSpace: 'nowrap',
    }}>{label}</span>
  )
}

export default function RuntimeFoundationStatusCard() {
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: 8, padding: 14, fontSize: 11, marginBottom: 12,
    }}>
      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 8 }}>
        v7.25 Runtime Foundation
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[
          ['Storage Schema', 'implemented'],
          ['Authorization API', 'Guarded Skeleton'],
          ['Synthetic Dry-run', 'synthetic_only'],
          ['Production Runtime Evaluator', 'blocked'],
          ['Permission Evaluator', 'blocked'],
          ['Stage C', 'disabled'],
          ['Real Controls', '0'],
          ['External Writes', '0'],
        ].map(([label, value]) => (
          <div key={String(label)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
            <StatusBadge label={String(value)} />
          </div>
        ))}
      </div>
    </div>
  )
}
