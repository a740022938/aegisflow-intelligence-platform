import React from 'react';
import { AUTHORIZATION_RECORD_LIFECYCLE_STAGES } from './governanceDesignSpec';

export default function AuthorizationRecordLifecycleDesign() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Authorization Record Lifecycle Design — <strong>{AUTHORIZATION_RECORD_LIFECYCLE_STAGES.length}</strong> stages. All stages are <strong>design-only</strong>. No persistence, no runtime effect. Stage C deferred.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Stage</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Purpose</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Persist</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Gate</th>
          </tr>
        </thead>
        <tbody>
          {AUTHORIZATION_RECORD_LIFECYCLE_STAGES.map(s => (
            <tr key={s.stage} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '5px 8px', fontWeight: 500 }}>{s.stage}</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-secondary)' }}>{s.purpose}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#8B5CF6' }}>design-only</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>disabled</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>none</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#F97316' }}>Stage C deferred</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
