import React from 'react';
import { AUTHORIZATION_RETENTION_EXPIRY_FIELDS } from './governanceDesignSpec';

export default function AuthorizationRetentionExpiryStorageDesign() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Retention / Expiry / Revocation Storage Design — <strong>{AUTHORIZATION_RETENTION_EXPIRY_FIELDS.length}</strong> fields. All fields are <strong>design-only</strong>. No expiry scheduler, no revocation action, no retention job. Stage C deferred.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Field</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Purpose</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Gate</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Blocked Actions</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Requirement</th>
          </tr>
        </thead>
        <tbody>
          {AUTHORIZATION_RETENTION_EXPIRY_FIELDS.map(f => (
            <tr key={f.fieldName} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '5px 8px', fontWeight: 500, fontFamily: 'monospace', fontSize: 9 }}>{f.fieldName}</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-secondary)' }}>{f.purpose}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#8B5CF6' }}>design-only</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#F97316' }}>Stage C deferred</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{f.blockedActions}</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{f.futureRequirement}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
