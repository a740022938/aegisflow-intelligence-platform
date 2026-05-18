import React from 'react';
import { API_CONTRACT_ROWS } from './governanceDesignSpec';

export default function ApiRequestResponseContractReview() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.2)', color: '#14B8A6', fontWeight: 600, fontSize: 9 }}>
        API Request/Response Contract Review — {API_CONTRACT_ROWS.length} contract items. All request/response shapes are design-only. No implementation in this task.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(20,184,166,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Contract Item</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Purpose</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Request Shape</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Response Shape</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Validation Status</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Implementation</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Risk Note</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Requirement</th>
            </tr>
          </thead>
          <tbody>
            {API_CONTRACT_ROWS.map(r => (
              <tr key={r.contractItem} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.contractItem}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{r.futurePurpose}</td>
                <td style={{ padding: '3px 6px', color: '#8B5CF6' }}>{r.requestShapeStatus}</td>
                <td style={{ padding: '3px 6px', color: '#8B5CF6' }}>{r.responseShapeStatus}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.validationStatus}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.currentImplementation}</td>
                <td style={{ padding: '3px 6px', color: '#F97316' }}>{r.riskNote}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.futureRequirement}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(20,184,166,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All request/response shapes are design-only. No implementation in this task.
      </div>
    </div>
  );
}
