import React from 'react';
import { APPROVAL_EVIDENCE_TYPES } from './governanceDesignSpec';

const C: Record<string, string> = {
  'design-only': '#8B5CF6', deferred: '#F97316',
};

function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, color: '#fff', background: color || '#6B7280', lineHeight: '16px', whiteSpace: 'nowrap' }}>{label}</span>
  );
}

export default function ApprovalEvidenceModel() {
  return (
    <div>
      <div style={{ marginBottom: 8, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        Approval evidence types — all currently <strong>readonly / design-only / no runtime effect</strong>. No real evidence is read, uploaded, or persisted.
      </div>
      <div style={{ display: 'grid', gap: 4 }}>
        {APPROVAL_EVIDENCE_TYPES.map(e => (
          <div key={e.evidence} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 4, background: 'var(--bg-surface)', border: '1px solid var(--border)', fontSize: 11 }}>
            <Badge label={e.status} color={C[e.status] || '#6B7280'} />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', minWidth: 130 }}>{e.evidence}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: 10 }}>{e.purpose}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.04)', fontSize: 9, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Design-only evidence model specification. No real evidence loaded, uploaded, or stored.
      </div>
    </div>
  );
}
