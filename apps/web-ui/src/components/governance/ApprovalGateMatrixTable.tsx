import React from 'react';
import { APPROVAL_GATE_MATRIX } from './governanceDesignSpec';

const C: Record<string, string> = {
  'design-only': '#8B5CF6', deferred: '#F97316', disabled: '#6B7280', no: 'var(--success)', preview: 'var(--warning)', readonly: 'var(--success)',
};

export default function ApprovalGateMatrixTable() {
  return (
    <div>
      <div style={{ marginBottom: 8, fontSize: 11, color: 'var(--text-muted)' }}>
        Approval gate matrix — all areas are <strong>design-only / deferred / disabled</strong>. No approval or reject actions are enabled.
      </div>
      <div style={{ display: 'grid', gap: 2, fontSize: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 80px 70px 70px 60px 70px 1fr 80px', gap: 6, padding: '5px 8px', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>
          <span>Area</span><span>Mode</span><span>Approve</span><span>Reject</span><span>Write</span><span>Execute</span><span>Evidence</span><span>Status</span>
        </div>
        {APPROVAL_GATE_MATRIX.map(r => (
          <div key={r.area} style={{ display: 'grid', gridTemplateColumns: '1.2fr 80px 70px 70px 60px 70px 1fr 80px', gap: 6, padding: '5px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.02)', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.area}</span>
            <span style={{ color: C[r.currentMode] || 'var(--text-secondary)' }}>{r.currentMode}</span>
            <span style={{ color: r.approval === 'no' ? 'var(--success)' : 'var(--warning)' }}>{r.approval}</span>
            <span style={{ color: r.reject === 'no' ? 'var(--success)' : 'var(--warning)' }}>{r.reject}</span>
            <span style={{ color: 'var(--success)' }}>{r.write}</span>
            <span style={{ color: 'var(--success)' }}>{r.execute}</span>
            <span style={{ color: 'var(--text-muted)' }}>{r.evidence}</span>
            <span style={{ color: C[r.status] || 'var(--text-muted)' }}>{r.status}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(34,197,94,0.04)', fontSize: 9, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Approval/Reject = no or deferred. Write/Execute = no. Stage C all deferred.
      </div>
    </div>
  );
}
