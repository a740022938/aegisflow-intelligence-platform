import React from 'react';
import { AUTHORIZATION_FAILURE_FALLBACK_ROWS } from './governanceDesignSpec';

const C: Record<string, string> = {
  'blocked — future package required': '#F97316',
  'blocked — Stage C deferred': '#6B7280',
};

export default function AuthorizationFailureFallbackMatrix() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--text-secondary)' }}>
        Authorization Failure / Fallback Matrix — <strong>{AUTHORIZATION_FAILURE_FALLBACK_ROWS.length}</strong> failure cases. Current behavior is <strong>design-only deny / no runtime</strong>. All cases are <strong>blocked — future package required</strong>.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ background: 'rgba(239,68,68,0.04)' }}>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Failure Case</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Response</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Behavior</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Risk If Ignored</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {AUTHORIZATION_FAILURE_FALLBACK_ROWS.map(r => (
            <tr key={r.failureCase} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '5px 8px', fontWeight: 500 }}>{r.failureCase}</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-secondary)' }}>{r.futureResponse}</td>
              <td style={{ padding: '5px 8px', color: '#6B7280' }}>{r.currentBehavior}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>none</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{r.riskIfIgnored}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}>
                <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600, color: '#fff', background: C[r.status] || '#6B7280', lineHeight: '16px', whiteSpace: 'nowrap' }}>{r.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
