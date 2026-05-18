import React, { useEffect, useState } from 'react'

interface DryRunHealth {
  authorizationFoundation: string
  stageC: string
  runtimeImplementation: string
  dryRunMode: string
  productionControls: number
}

export default function AuthorizationDryRunStatusCard() {
  const [health, setHealth] = useState<DryRunHealth | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/authorization/health')
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(err => setError(String(err)))
  }, [])

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: 8, padding: 14, fontSize: 11, marginBottom: 12,
    }}>
      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 8 }}>
        Authorization Dry-run Status
      </div>
      {error ? (
        <div style={{ color: 'var(--danger)', fontSize: 10 }}>Error: {error}</div>
      ) : health ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Foundation</span>
            <span style={{ fontWeight: 600, color: '#22C55E' }}>{health.authorizationFoundation}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Stage C</span>
            <span style={{ fontWeight: 600, color: '#6B7280' }}>{health.stageC}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Runtime Impl</span>
            <span style={{ fontWeight: 600, color: '#EF4444' }}>{health.runtimeImplementation}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Dry-run Mode</span>
            <span style={{ fontWeight: 600, color: '#8B5CF6' }}>{health.dryRunMode}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Production Controls</span>
            <span style={{ fontWeight: 600, color: '#22C55E' }}>{health.productionControls}</span>
          </div>
        </div>
      ) : (
        <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>Loading...</div>
      )}
    </div>
  )
}
