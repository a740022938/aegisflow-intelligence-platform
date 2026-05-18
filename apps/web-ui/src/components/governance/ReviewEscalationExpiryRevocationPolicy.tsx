import React from 'react';
import { REVIEW_ESCALATION_EXPIRY_REVOCATION_FIELDS } from './governanceDesignSpec';

export default function ReviewEscalationExpiryRevocationPolicy() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Review Escalation / Expiry / Revocation Policy — <strong>{REVIEW_ESCALATION_EXPIRY_REVOCATION_FIELDS.length}</strong> fields. All fields are <strong>design-only</strong>. No runtime effect, no persisted decision, no revocation action, no expiry scheduler. Stage C deferred.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
        <thead>
          <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Field</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Purpose</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Persistence</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Write</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Gate</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future</th>
          </tr>
        </thead>
        <tbody>
          {REVIEW_ESCALATION_EXPIRY_REVOCATION_FIELDS.map(f => (
            <tr key={f.fieldName} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '4px 7px', fontWeight: 500, fontFamily: 'monospace', fontSize: 9 }}>{f.fieldName}</td>
              <td style={{ padding: '4px 7px', color: 'var(--text-secondary)' }}>{f.purpose}</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#8B5CF6' }}>design-only</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#6B7280' }}>none</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#6B7280' }}>disabled</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#6B7280' }}>none</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#F97316' }}>Stage C deferred</td>
              <td style={{ padding: '4px 7px', color: 'var(--text-muted)' }}>{f.futureRequirement}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        No escalation/expiry/revocation scheduler implemented. No persisted decision. No revocation action. Stage C deferred.
      </div>
    </div>
  );
}
