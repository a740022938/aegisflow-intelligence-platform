import React from 'react';
import { EXECUTION_BOUNDARY_ITEMS } from './governanceDesignSpec';

const C: Record<string, string> = {
  'design-only': '#8B5CF6',
};

function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, color: '#fff', background: color || '#6B7280', lineHeight: '16px', whiteSpace: 'nowrap' }}>{label}</span>
  );
}

export default function ExecutionBoundaryMatrix() {
  return (
    <div>
      <div style={{ marginBottom: 8, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        Execution boundary matrix — all items are <strong>design-only / no runtime effect</strong>. No real execution, run, start, stop, service control, deployment, connector write, LAN sync, lab execution, training, inference, DB write, external write, Memory Hub mutation, or tag/release is possible.
      </div>
      <div style={{ display: 'grid', gap: 4, fontSize: 10 }}>
        {EXECUTION_BOUNDARY_ITEMS.map(b => (
          <div key={b.item} style={{ display: 'grid', gridTemplateColumns: '200px 1fr 80px', gap: 8, padding: '6px 10px', borderRadius: 4, background: 'var(--bg-surface)', border: '1px solid var(--border)', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.item}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{b.purpose}</span>
            <span style={{ textAlign: 'right' }}><Badge label={b.status} color={C[b.status] || '#6B7280'} /></span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(34,197,94,0.04)', fontSize: 9, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All 14 boundary items are design-only. No real execution or control actions available.
      </div>
    </div>
  );
}
