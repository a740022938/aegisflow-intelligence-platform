import React from 'react';
import { AUTHORIZATION_DECISION_STATES } from './governanceDesignSpec';

export default function AuthorizationDecisionStateModel() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Authorization Decision State Model — <strong>{AUTHORIZATION_DECISION_STATES.length}</strong> states. All states are <strong>design-only</strong>. No runtime availability, no persistence. Stage C deferred.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>State</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Purpose</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Allowed Transition</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Persist</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Blocked Actions</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Requirement</th>
          </tr>
        </thead>
        <tbody>
          {AUTHORIZATION_DECISION_STATES.map(s => (
            <tr key={s.state} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '5px 8px', fontWeight: 500, fontFamily: 'monospace' }}>{s.state}</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-secondary)' }}>{s.purpose}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>none</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{s.allowedTransition}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>disabled</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{s.blockedActions}</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{s.futureRequirement}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
