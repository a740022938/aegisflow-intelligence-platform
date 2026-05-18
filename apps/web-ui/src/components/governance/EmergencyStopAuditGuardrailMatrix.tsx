import React from 'react';
import { EMERGENCY_STOP_AUDIT_GUARDRAIL_MATRIX } from './governanceDesignSpec';

const C: Record<string, string> = {
  safe: 'var(--success)', none: '#6B7280', '0': 'var(--success)',
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

export default function EmergencyStopAuditGuardrailMatrix() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 10, color: 'var(--text-secondary)' }}>
        Emergency Stop + Audit Guardrail Matrix — all risks have <strong>active risk = 0</strong>. All guardrails are <strong>safe</strong>. No emergency stop or audit evidence path has active risk.
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ background: 'rgba(239,68,68,0.04)' }}>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Risk</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Exposure</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Active Risk</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Guardrail</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {EMERGENCY_STOP_AUDIT_GUARDRAIL_MATRIX.map(r => (
            <tr key={r.risk} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '5px 8px', fontWeight: 500 }}>{r.risk}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={r.currentExposure} color={C[r.currentExposure] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={r.activeRisk} color={C[r.activeRisk] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{r.guardrail}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={r.status} color={C[r.status] || '#6B7280'} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
