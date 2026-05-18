import React from 'react';
import { MUTATION_ROLLBACK_CONTRACT } from './governanceDesignSpec';

const C: Record<string, string> = {
  'design-only': '#8B5CF6', deferred: '#F97316', disabled: '#6B7280',
};

function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, color: '#fff', background: color || '#6B7280', lineHeight: '16px', whiteSpace: 'nowrap' }}>{label}</span>
  );
}

export default function MutationRollbackContract() {
  return (
    <div>
      <div style={{ marginBottom: 8, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        Mutation rollback contract spec — design-only. No real restore point is created. No git reset, revert, DB rollback, or service restart is executed.
      </div>
      <div style={{ display: 'grid', gap: 4, fontSize: 10 }}>
        {MUTATION_ROLLBACK_CONTRACT.map(f => (
          <div key={f.field} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 80px', gap: 8, padding: '6px 10px', borderRadius: 4, background: 'var(--bg-surface)', border: '1px solid var(--border)', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{f.field}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{f.purpose}</span>
            <span style={{ textAlign: 'right' }}><Badge label={f.status} color={C[f.status] || '#6B7280'} /></span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(245,158,11,0.04)', fontSize: 9, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Rollback contract specification — design constraint. No automated rollback capability.
      </div>
    </div>
  );
}
