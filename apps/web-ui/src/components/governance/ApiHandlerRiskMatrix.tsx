import React from 'react';
import { API_HANDLER_RISK_ROWS } from './governanceDesignSpec';

export default function ApiHandlerRiskMatrix() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: '#8B5CF6', fontWeight: 600, fontSize: 9 }}>
        API Handler Risk Matrix — {API_HANDLER_RISK_ROWS.length} risks. Active risk = 0. All safe because no endpoints, handlers, or routes exist.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Risk</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Exposure</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Active Risk</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Handler Guardrail</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Mitigation</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {API_HANDLER_RISK_ROWS.map(r => (
              <tr key={r.risk} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.risk}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{r.currentExposure}</td>
                <td style={{ padding: '3px 6px', color: 'var(--success)', fontWeight: 600 }}>{r.activeRisk}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.handlerGuardrail}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.futureMitigation}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Active risk = 0 across all risks. No endpoints, handlers, or routes exist. Safe.
      </div>
    </div>
  );
}
