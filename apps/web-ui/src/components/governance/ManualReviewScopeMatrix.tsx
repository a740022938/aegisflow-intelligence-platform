import React from 'react';
import { MANUAL_REVIEW_SCOPE_ROWS } from './governanceDesignSpec';

export default function ManualReviewScopeMatrix() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Manual Review Scope Matrix — <strong>{MANUAL_REVIEW_SCOPE_ROWS.length}</strong> scopes. All scopes are <strong>design-only</strong>. No review availability, no decision authority, no runtime control. Stage C deferred.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
        <thead>
          <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Scope</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Review Future</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Review Availability</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Decision Authority</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Permission</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Write</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Gate</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {MANUAL_REVIEW_SCOPE_ROWS.map(r => (
            <tr key={r.scope} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '4px 7px', fontWeight: 500 }}>{r.scope}</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#F97316' }}>future</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#8B5CF6' }}>{r.currentReviewAvailability}</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#6B7280' }}>{r.currentDecisionAuthority}</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#6B7280' }}>{r.currentPermission}</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#6B7280' }}>0</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#6B7280' }}>disabled</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#F97316' }}>Stage C deferred</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#8B5CF6' }}>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
