import React from 'react';
import { APPROVAL_ROLLBACK_FIELDS } from './governanceDesignSpec';

export default function ApprovalRollbackPlan() {
  return (
    <div>
      <div style={{ marginBottom: 8, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        Approval rollback plan spec — design-only. No real restore point is created. No git reset, revert, DB rollback, or service restart is executed.
      </div>
      <div style={{ display: 'grid', gap: 4, fontSize: 10 }}>
        {APPROVAL_ROLLBACK_FIELDS.map(f => (
          <div key={f.field} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 80px', gap: 8, padding: '6px 10px', borderRadius: 4, background: 'var(--bg-surface)', border: '1px solid var(--border)', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{f.field}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{f.purpose}</span>
            <span style={{ color: '#8B5CF6', textAlign: 'right' }}>{f.status}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(245,158,11,0.04)', fontSize: 9, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Rollback plan specification — design constraint. No automated rollback capability.
      </div>
    </div>
  );
}
