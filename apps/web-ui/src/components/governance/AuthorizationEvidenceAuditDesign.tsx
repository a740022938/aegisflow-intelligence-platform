import React from 'react';
import { AUTHORIZATION_EVIDENCE_TYPES } from './governanceDesignSpec';

export default function AuthorizationEvidenceAuditDesign() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Authorization Evidence / Audit Design — <strong>{AUTHORIZATION_EVIDENCE_TYPES.length}</strong> evidence types. All are <strong>design-only</strong>. No evidence is stored, uploaded, or persisted.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Evidence</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Purpose</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Status</th>
          </tr>
        </thead>
        <tbody>
          {AUTHORIZATION_EVIDENCE_TYPES.map(e => (
            <tr key={e.evidence} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '5px 8px', fontWeight: 500 }}>{e.evidence}</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-secondary)' }}>{e.purpose}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#8B5CF6' }}>{e.currentStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All evidence types are design-only. No evidence is written, uploaded, exported, or persisted. No audit trail storage exists.
      </div>
    </div>
  );
}
