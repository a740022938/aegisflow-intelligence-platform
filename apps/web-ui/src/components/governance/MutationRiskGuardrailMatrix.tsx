import React from 'react';
import { MUTATION_GUARDRAIL_MATRIX } from './governanceDesignSpec';

const C: Record<string, string> = {
  safe: 'var(--success)', 'design-only': '#8B5CF6', deferred: '#F97316',
};

function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, color: '#fff', background: color || '#6B7280', lineHeight: '16px', whiteSpace: 'nowrap' }}>{label}</span>
  );
}

export default function MutationRiskGuardrailMatrix() {
  return (
    <div>
      <div style={{ marginBottom: 8, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        Mutation risk guardrail matrix — all risks are currently <strong>safe</strong> with <strong>no active exposure</strong>. No DB mutation, memory candidate mutation, connector write, LAN sync, dataset mutation, navigation mutation, release mutation, or service mutation is possible.
      </div>
      <div style={{ display: 'grid', gap: 2, fontSize: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '160px 100px 80px 1fr 60px', gap: 8, padding: '5px 8px', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>
          <span>Risk</span><span>Exposure</span><span>Risk#</span><span>Guardrail</span><span>Status</span>
        </div>
        {MUTATION_GUARDRAIL_MATRIX.map(r => (
          <div key={r.risk} style={{ display: 'grid', gridTemplateColumns: '160px 100px 80px 1fr 60px', gap: 8, padding: '5px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.02)', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.risk}</span>
            <span style={{ color: r.currentExposure === 'none' ? 'var(--success)' : 'var(--danger)' }}>{r.currentExposure}</span>
            <span style={{ color: r.activeRisk === 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{r.activeRisk}</span>
            <span style={{ color: 'var(--text-muted)' }}>{r.guardrail}</span>
            <span style={{ textAlign: 'right' }}><Badge label={r.status} color={C[r.status] || '#6B7280'} /></span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(34,197,94,0.04)', fontSize: 9, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All 8 risk items: safe / no exposure / guardrails in place. No active risk.
      </div>
    </div>
  );
}
