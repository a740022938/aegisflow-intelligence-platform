import React from 'react';
import { DECISION_CONFLICT_OVERRIDE_ROWS } from './governanceDesignSpec';

export default function DecisionConflictOverrideBoundaryMatrix() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Decision Conflict / Override Boundary Matrix — <strong>{DECISION_CONFLICT_OVERRIDE_ROWS.length}</strong> conflict cases. All cases are <strong>design-only</strong>. Override not allowed now. No admin bypass. No conflict resolution logic implemented.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
        <thead>
          <tr style={{ background: 'rgba(239,68,68,0.04)' }}>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Conflict Case</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Handling</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Handling</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Override Now</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Gate</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {DECISION_CONFLICT_OVERRIDE_ROWS.map(r => (
            <tr key={r.conflictCase} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '4px 7px', fontWeight: 500 }}>{r.conflictCase}</td>
              <td style={{ padding: '4px 7px', color: 'var(--text-secondary)' }}>{r.futureHandling}</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#6B7280' }}>{r.currentHandling}</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#6B7280', fontWeight: 600 }}>{r.overrideAllowedNow}</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#6B7280' }}>none</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#F97316' }}>Stage C deferred</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#8B5CF6' }}>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        No override button exists. No admin bypass. No conflict resolution logic implemented. All cases are design-only.
      </div>
    </div>
  );
}
