import React from 'react'

export default function RuntimeFoundationSafetyMatrix() {
  const items = [
    { label: 'Runtime Foundation', status: 'Started', color: '#8B5CF6' },
    { label: 'Storage', status: 'Minimal schema implemented', color: '#22C55E' },
    { label: 'API', status: 'Guarded skeleton', color: '#22C55E' },
    { label: 'Dry-run', status: 'Synthetic only', color: '#8B5CF6' },
    { label: 'Runtime Production', status: 'Blocked', color: '#EF4444' },
    { label: 'Stage C', status: 'Disabled', color: '#6B7280' },
    { label: 'Real Controls', status: '0', color: '#22C55E' },
  ]

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Advanced Mode Runtime Foundation Summary</div>
      {items.map(item => (
        <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.02)', marginBottom: 2, fontSize: 10 }}>
          <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
          <span style={{ fontWeight: 600, color: item.color }}>{item.status}</span>
        </div>
      ))}
    </div>
  )
}
