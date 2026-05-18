import React from 'react';
import { RUNTIME_CONTROL_PACKAGES } from './governanceDesignSpec';

export default function RuntimeControlPackageBoundary() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Runtime Control Package Boundary — <strong>{RUNTIME_CONTROL_PACKAGES.length}</strong> packages. All packages are <strong>not implemented</strong>. No runtime controls, no DB writes, no external writes, no service controls. All packages require future activation.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Package</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>DB Writes</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>External</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Service</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Stage Gate</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Blocked Actions</th>
          </tr>
        </thead>
        <tbody>
          {RUNTIME_CONTROL_PACKAGES.map(p => (
            <tr key={p.packageName} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '5px 8px', fontWeight: 500 }}>{p.packageName}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280', fontWeight: 600 }}>not implemented</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: 'var(--success)', fontWeight: 600 }}>0</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: 'var(--success)', fontWeight: 600 }}>0</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: 'var(--success)', fontWeight: 600 }}>0</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: 'var(--success)', fontWeight: 600 }}>0</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#F97316' }}>future activation package</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{p.blockedActions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
