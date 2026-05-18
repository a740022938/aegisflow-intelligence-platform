import React from 'react';
import { AUTHORIZATION_SCOPE_BOUNDARY_ROWS } from './governanceDesignSpec';

export default function AuthorizationScopeBoundaryMatrix() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Authorization Scope Boundary Matrix — <strong>{AUTHORIZATION_SCOPE_BOUNDARY_ROWS.length}</strong> scopes. All scopes are <strong>design-only</strong>. No current permission, no runtime control, no write path. Stage C deferred.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Scope</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Mode</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Auth Required</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Permission</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Write Path</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Gate</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {AUTHORIZATION_SCOPE_BOUNDARY_ROWS.map(r => (
            <tr key={r.scope} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '5px 8px', fontWeight: 500 }}>{r.scope}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: r.currentMode === 'readonly' ? 'var(--success)' : '#6B7280' }}>{r.currentMode}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: r.authorizationRequiredFuture === 'yes' ? '#F97316' : 'var(--success)' }}>{r.authorizationRequiredFuture}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: 'var(--success)', fontWeight: 600 }}>{r.currentPermission}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: 'var(--success)', fontWeight: 600 }}>{r.runtimeControl}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>{r.writePath}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#F97316' }}>{r.stageGate}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#8B5CF6' }}>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
