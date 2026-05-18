import React from 'react';
import { SCHEMA_CHANGE_RISK_ROWS } from './governanceDesignSpec';

export default function P7SchemaChangeRiskMatrix() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Schema Change Risk Matrix — <strong>{SCHEMA_CHANGE_RISK_ROWS.length}</strong> risks. Active risk = 0. All guardrails are safe because no schema/migration/DB implementation exists.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
          <thead>
            <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Risk</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Exposure</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Active Risk</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Guardrail</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Mitigation</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {SCHEMA_CHANGE_RISK_ROWS.map(r => (
              <tr key={r.risk} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '5px 8px', fontWeight: 500, whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: 9 }}>{r.risk}</td>
                <td style={{ padding: '5px 8px', color: 'var(--text-secondary)' }}>{r.currentExposure}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', color: 'var(--success)', fontWeight: 600 }}>{r.activeRisk}</td>
                <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{r.guardrail}</td>
                <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{r.futureMitigation}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 600, color: r.status.startsWith('safe') ? 'var(--success)' : '#8B5CF6' }}>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Active risk = 0. All guardrails are safe. No schema, migration, or DB implementation exists in this design review task.
      </div>
    </div>
  );
}
