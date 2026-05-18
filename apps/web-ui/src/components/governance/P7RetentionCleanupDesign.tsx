import React from 'react';
import { RETENTION_CLEANUP_POLICY_AREAS } from './governanceDesignSpec';

export default function P7RetentionCleanupDesign() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.2)', color: 'var(--text-secondary)' }}>
        Data Retention / Cleanup Design Review — <strong>{RETENTION_CLEANUP_POLICY_AREAS.length}</strong> policy areas. All implementations are 'none'. No retention job, cleanup job, or DB write in this task.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
          <thead>
            <tr style={{ background: 'rgba(20,184,166,0.04)' }}>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Policy Area</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Purpose</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Implementation</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Retention Job</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Cleanup Job</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>DB Write</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Risk Note</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Validation</th>
            </tr>
          </thead>
          <tbody>
            {RETENTION_CLEANUP_POLICY_AREAS.map(r => (
              <tr key={r.policyArea} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '5px 8px', fontWeight: 500, whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: 9 }}>{r.policyArea}</td>
                <td style={{ padding: '5px 8px', color: 'var(--text-secondary)' }}>{r.futurePurpose}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>{r.currentImplementation}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>{r.retentionJob}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>{r.cleanupJob}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>{r.dbWrite}</td>
                <td style={{ padding: '5px 8px', color: '#EF4444' }}>{r.riskNote}</td>
                <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{r.futureValidation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(20,184,166,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All implementations are 'none'. No retention job, cleanup job, or DB write in this design review task.
      </div>
    </div>
  );
}
