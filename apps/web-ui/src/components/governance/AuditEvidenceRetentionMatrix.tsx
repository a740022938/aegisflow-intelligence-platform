import React from 'react';
import { AUDIT_EVIDENCE_RETENTION_ROWS } from './governanceDesignSpec';

const C: Record<string, string> = {
  no: 'var(--success)', yes: 'var(--danger)', future: '#F97316',
  readonly: '#8B5CF6', disabled: '#6B7280', 'design-only': '#8B5CF6',
  deferred: '#6B7280',
};

function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 10,
      fontWeight: 600, color: '#fff', background: color || '#6B7280',
      lineHeight: '16px', whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

export default function AuditEvidenceRetentionMatrix() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', fontSize: 10, color: 'var(--text-secondary)' }}>
        Audit Evidence Model / Retention Matrix — all evidence types have <strong>persist/upload/export = no</strong>. Hash, retention, and integrity are all <strong>future</strong>. No evidence is persisted, uploaded, or exported at runtime.
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ background: 'rgba(59,130,246,0.04)' }}>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Evidence Type</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Mode</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Persist</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Upload</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Export</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Hash</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Retention</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Integrity</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {AUDIT_EVIDENCE_RETENTION_ROWS.map(r => (
            <tr key={r.evidenceType} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '5px 8px', fontWeight: 500 }}>{r.evidenceType}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={r.currentMode} color={C[r.currentMode] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={r.persist} color={C[r.persist] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={r.upload} color={C[r.upload] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={r.export} color={C[r.export] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={r.hash} color={C[r.hash] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={r.retention} color={C[r.retention] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={r.integrity} color={C[r.integrity] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={r.status} color={C[r.status] || '#6B7280'} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
