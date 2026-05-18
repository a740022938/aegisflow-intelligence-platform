import React from 'react';
import { MUTATION_DESIGN_FIELDS, MUTATION_EVIDENCE_TYPES, MUTATION_LIFECYCLE_STAGES } from './governanceDesignSpec';

const C: Record<string, string> = {
  'design-only': '#8B5CF6', deferred: '#F97316', disabled: '#6B7280', none: 'var(--success)',
};

function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, color: '#fff', background: color || '#6B7280', lineHeight: '16px', whiteSpace: 'nowrap' }}>{label}</span>
  );
}

export default function MutationGateDesignSpec() {
  return (
    <div>
      <div style={{ padding: '8px 12px', marginBottom: 10, borderRadius: 4, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        <strong>Mutation Gate is design-only.</strong> Stage C is not enabled. No mutation, write, save, delete, sync, execute, deploy, or service-control action is available.
      </div>

      <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
        {MUTATION_DESIGN_FIELDS.map(f => (
          <div key={f.fieldName} style={{ padding: '10px 14px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderLeft: '3px solid #8B5CF6', fontSize: 11 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 12 }}>{f.fieldName}</span>
              <Badge label={f.status} color={C[f.status] || '#6B7280'} />
              <Badge label={f.stageGate} color="#F97316" />
            </div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{f.purpose}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 10, color: 'var(--text-muted)' }}>
              <span>Runtime: <strong style={{ color: '#6B7280' }}>{f.runtimeEffect}</strong></span>
              <span>Write: <strong style={{ color: 'var(--success)' }}>{f.writePath}</strong></span>
              <span>Future: {f.futureRequirement}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, color: '#8B5CF6', marginBottom: 8 }}>Mutation Evidence Types</div>
      <div style={{ display: 'grid', gap: 4, marginBottom: 16 }}>
        {MUTATION_EVIDENCE_TYPES.map(e => (
          <div key={e.evidence} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 4, background: 'var(--bg-surface)', border: '1px solid var(--border)', fontSize: 11 }}>
            <Badge label={e.status} color={C[e.status] || '#6B7280'} />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', minWidth: 130 }}>{e.evidence}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: 10 }}>{e.purpose}</span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, color: '#8B5CF6', marginBottom: 8 }}>Mutation Lifecycle Stages</div>
      <div style={{ display: 'grid', gap: 4, marginBottom: 8 }}>
        {MUTATION_LIFECYCLE_STAGES.map(s => (
          <div key={s.stage} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 4, background: 'var(--bg-surface)', border: '1px solid var(--border)', fontSize: 11 }}>
            <Badge label={s.status} color={C[s.status] || '#6B7280'} />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', minWidth: 160 }}>{s.stage}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: 10 }}>{s.purpose}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(245,158,11,0.06)', fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Mutation Gate design specification — no runtime controls enabled. All fields are design-only. Evidence and lifecycle stages are speculative.
      </div>
    </div>
  );
}
