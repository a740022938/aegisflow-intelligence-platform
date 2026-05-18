import React from 'react';
import { RUNTIME_AUTHORIZATION_FIELDS } from './governanceDesignSpec';

export default function RuntimeAuthorizationDesignSpec() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Runtime Authorization Design Fields — <strong>{RUNTIME_AUTHORIZATION_FIELDS.length}</strong> fields. All fields are <strong>design-only</strong>. No persistence, no runtime effect, no approval dependency. Stage C deferred.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
          <thead>
            <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Field</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Purpose</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Persistence</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Approval</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Stage Gate</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Blocked Actions</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Requirement</th>
            </tr>
          </thead>
          <tbody>
            {RUNTIME_AUTHORIZATION_FIELDS.map(f => (
              <tr key={f.fieldName} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{f.fieldName}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{f.purpose}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#8B5CF6' }}>design-only</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#6B7280' }}>none</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#6B7280' }}>disabled</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#6B7280' }}>future</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#F97316' }}>Stage C deferred</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{f.blockedActions}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{f.futureRequirement}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All fields are design-only. No runtime implementation, no DB writes, no approval/reject flow, no evidence persistence. Stage C deferred.
      </div>
    </div>
  );
}
