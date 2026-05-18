import React from 'react';
import { AUTHORIZATION_PERSISTENCE_GUARDRAIL_ROWS } from './governanceDesignSpec';

export default function AuthorizationPersistenceRiskGuardrailMatrix() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Persistence Risk Guardrail Matrix — <strong>{AUTHORIZATION_PERSISTENCE_GUARDRAIL_ROWS.length}</strong> risks. Active risk = <strong>0</strong>. All guardrails are safe or design-only.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Risk</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Exposure</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Active Risk</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Guardrail</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {AUTHORIZATION_PERSISTENCE_GUARDRAIL_ROWS.map(r => (
            <tr key={r.risk} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '5px 8px', fontWeight: 500 }}>{r.risk}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>{r.currentExposure}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: 'var(--success)', fontWeight: 600 }}>{r.activeRisk}</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{r.guardrail}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: r.status === 'safe' ? 'var(--success)' : '#8B5CF6' }}>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.15)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Active risk = 0 because no persistence implementation exists. All risks are design-only or safe. Future implementation must address each guardrail.
      </div>
    </div>
  );
}
