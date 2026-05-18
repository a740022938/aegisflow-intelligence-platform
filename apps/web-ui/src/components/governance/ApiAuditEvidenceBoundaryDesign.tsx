import React from 'react';
import { API_AUDIT_EVIDENCE_ROWS } from './governanceDesignSpec';

export default function ApiAuditEvidenceBoundaryDesign() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)', color: '#06B6D4', fontWeight: 600, fontSize: 9 }}>
        API Audit/Evidence Boundary Design — {API_AUDIT_EVIDENCE_ROWS.length} audit items. All implementations are none. No audit persistence, no export/upload in this task.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(6,182,212,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Audit Item</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Purpose</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Implementation</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Persistence</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Export/Upload</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Write Effect</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required Validation</th>
            </tr>
          </thead>
          <tbody>
            {API_AUDIT_EVIDENCE_ROWS.map(r => (
              <tr key={r.auditItem} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.auditItem}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{r.futurePurpose}</td>
                <td style={{ padding: '3px 6px', color: '#6B7280' }}>{r.currentImplementation}</td>
                <td style={{ padding: '3px 6px', color: '#6B7280' }}>{r.persistence}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.exportUpload}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.writeEffect}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.requiredValidation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(6,182,212,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All implementations are none. No audit persistence, no export/upload in this task.
      </div>
    </div>
  );
}
