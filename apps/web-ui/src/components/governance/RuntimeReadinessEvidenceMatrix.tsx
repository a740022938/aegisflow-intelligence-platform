import React from 'react';
import { RUNTIME_READINESS_EVIDENCE_TYPES } from './governanceDesignSpec';

export default function RuntimeReadinessEvidenceMatrix() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Runtime Readiness Evidence Matrix — <strong>{RUNTIME_READINESS_EVIDENCE_TYPES.length}</strong> evidence types. Baseline evidence is available but <strong>not activation ready</strong>. All runtime evidence is <strong>not available</strong>. No evidence is persisted. No evidence is uploaded or exported.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
        <thead>
          <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Evidence Type</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Availability</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Persistence</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime Effect</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required For Go/No-Go</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {RUNTIME_READINESS_EVIDENCE_TYPES.map(e => (
            <tr key={e.evidenceType} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '4px 7px', fontWeight: 500 }}>{e.evidenceType}</td>
              <td style={{ padding: '4px 7px', color: e.currentAvailability.startsWith('available') ? '#8B5CF6' : '#6B7280' }}>{e.currentAvailability}</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#6B7280' }}>{e.persistence}</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#6B7280' }}>{e.runtimeEffect}</td>
              <td style={{ padding: '4px 7px', color: e.requiredForGoNoGo === 'blocking' ? '#EF4444' : '#F97316' }}>{e.requiredForGoNoGo}</td>
              <td style={{ padding: '4px 7px', color: '#F97316' }}>{e.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        No evidence is saved, uploaded, exported, or persisted. All entries are design-only future requirements.
      </div>
    </div>
  );
}
