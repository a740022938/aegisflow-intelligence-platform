import React from 'react';
import { DECISION_EVIDENCE_REQUIREMENT_ROWS } from './governanceDesignSpec';

export default function DecisionEvidenceRequirementMatrix() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Decision Evidence Requirement Matrix — <strong>{DECISION_EVIDENCE_REQUIREMENT_ROWS.length}</strong> evidence types. All types are <strong>design-only</strong>. No persistence, no upload/export, no runtime effect. Future requirement.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
        <thead>
          <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Evidence</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Purpose</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Availability</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Persistence</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Upload/Export</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required For</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {DECISION_EVIDENCE_REQUIREMENT_ROWS.map(r => (
            <tr key={r.evidenceType} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '4px 7px', fontWeight: 500 }}>{r.evidenceType}</td>
              <td style={{ padding: '4px 7px', color: 'var(--text-secondary)' }}>{r.futurePurpose}</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#8B5CF6' }}>{r.currentAvailability}</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#6B7280' }}>disabled</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#6B7280' }}>disabled</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#6B7280' }}>none</td>
              <td style={{ padding: '4px 7px', color: 'var(--text-muted)' }}>{r.requiredFor}</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#F97316' }}>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        No real external evidence is read, saved, uploaded, or exported. All entries are design-only future requirements.
      </div>
    </div>
  );
}
