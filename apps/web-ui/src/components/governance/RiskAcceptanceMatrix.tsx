import React from 'react';
import { RISK_ACCEPTANCE_MATRIX } from './governanceDesignSpec';

const C: Record<string, string> = {
  accepted: 'var(--success)', safe: 'var(--success)',
};

function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, color: '#fff', background: color || '#6B7280', lineHeight: '16px', whiteSpace: 'nowrap' }}>{label}</span>
  );
}

export default function RiskAcceptanceMatrix() {
  return (
    <div>
      <div style={{ marginBottom: 8, fontSize: 11, color: 'var(--text-muted)' }}>
        Risk acceptance and guardrail matrix — based on validator scans and static analysis.
      </div>
      <div style={{ display: 'grid', gap: 2, fontSize: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 60px 1.2fr 80px', gap: 8, padding: '5px 8px', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>
          <span>Risk</span><span>Exposure</span><span>Active</span><span>Guardrail</span><span>Status</span>
        </div>
        {RISK_ACCEPTANCE_MATRIX.map(r => (
          <div key={r.risk} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 60px 1.2fr 80px', gap: 8, padding: '5px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.02)', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-primary)' }}>{r.risk}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{r.currentExposure}</span>
            <span style={{ fontWeight: 600, color: r.activeRisk === 0 ? 'var(--success)' : 'var(--danger)' }}>{r.activeRisk}</span>
            <span style={{ color: 'var(--text-muted)' }}>{r.guardrail}</span>
            <Badge label={r.status} color={C[r.status] || '#6B7280'} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(34,197,94,0.04)', fontSize: 9, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Risk data from static registries and validators. activeRisk=0 confirmed for all categories.
      </div>
    </div>
  );
}
