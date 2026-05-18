import React from 'react';
import { MUTATION_DIFF_MATRIX } from './governanceDesignSpec';

const C: Record<string, string> = {
  'design-only': '#8B5CF6', deferred: '#F97316', disabled: '#6B7280', no: 'var(--success)',
  preview: 'var(--warning)', readonly: 'var(--success)',
};

export default function MutationDiffImpactMatrix() {
  return (
    <div>
      <div style={{ marginBottom: 8, fontSize: 11, color: 'var(--text-muted)' }}>
        Mutation diff/impact matrix — all areas are <strong>design-only / deferred / disabled</strong>. No diff, impact, write, execute, or external IO actions are enabled.
      </div>
      <div style={{ display: 'grid', gap: 2, fontSize: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 80px 90px 90px 60px 60px 80px 80px', gap: 6, padding: '5px 8px', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>
          <span>Area</span><span>Mode</span><span>Diff</span><span>Impact</span><span>Write</span><span>Exec</span><span>Ext.IO</span><span>Status</span>
        </div>
        {MUTATION_DIFF_MATRIX.map(r => (
          <div key={r.area} style={{ display: 'grid', gridTemplateColumns: '1.2fr 80px 90px 90px 60px 60px 80px 80px', gap: 6, padding: '5px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.02)', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.area}</span>
            <span style={{ color: C[r.currentMode] || 'var(--text-secondary)' }}>{r.currentMode}</span>
            <span style={{ color: 'var(--text-muted)' }}>{r.diffRequired}</span>
            <span style={{ color: 'var(--text-muted)' }}>{r.impactRequired}</span>
            <span style={{ color: 'var(--success)' }}>{r.write}</span>
            <span style={{ color: 'var(--success)' }}>{r.execute}</span>
            <span style={{ color: r.externalIO === 'gated' ? 'var(--warning)' : 'var(--success)' }}>{r.externalIO}</span>
            <span style={{ color: C[r.status] || 'var(--text-muted)' }}>{r.status}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(34,197,94,0.04)', fontSize: 9, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Diff/Impact = required future. Write/Execute = no. External IO = gated for external areas. All deferred.
      </div>
    </div>
  );
}
