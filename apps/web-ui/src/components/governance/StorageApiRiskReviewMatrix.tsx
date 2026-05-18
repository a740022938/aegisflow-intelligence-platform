import React from 'react';
import { STORAGE_API_RISK_ROWS } from './governanceDesignSpec';

export default function StorageApiRiskReviewMatrix() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', color: 'var(--text-secondary)' }}>
        All active risks = 0. Current exposure = none / design-only. Status = safe / future mitigation required.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(34,197,94,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Risk</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Exposure</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Active Risk</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Guardrail</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Mitigation</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {STORAGE_API_RISK_ROWS.map(r => (
              <tr key={r.risk} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.risk}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{r.currentExposure}</td>
                <td style={{ padding: '3px 6px', color: '#22C55E', fontWeight: 600 }}>{r.activeRisk}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{r.guardrail}</td>
                <td style={{ padding: '3px 6px', color: '#F97316' }}>{r.futureMitigation}</td>
                <td style={{ padding: '3px 6px', color: '#22C55E', fontWeight: 600 }}>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(34,197,94,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        No active risk. All storage and API risks are design-only.
      </div>
    </div>
  );
}
