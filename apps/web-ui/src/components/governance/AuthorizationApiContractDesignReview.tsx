import React from 'react';
import { FUTURE_API_ENDPOINTS } from './governanceDesignSpec';

export default function AuthorizationApiContractDesignReview() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontWeight: 600, fontSize: 9 }}>
        No API endpoint added in this task. No route added in this task. No write handler added in this task.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(239,68,68,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Endpoint</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Method</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Purpose</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Auth Requirement</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Write Impact</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Risk Class</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required Gate</th>
            </tr>
          </thead>
          <tbody>
            {FUTURE_API_ENDPOINTS.map(e => (
              <tr key={e.futureEndpoint} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{e.futureEndpoint}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{e.method}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{e.purpose}</td>
                <td style={{ padding: '3px 6px', color: '#EF4444' }}>{e.currentStatus}</td>
                <td style={{ padding: '3px 6px', color: '#F97316' }}>{e.authRequirement}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{e.writeImpact}</td>
                <td style={{ padding: '3px 6px', color: e.riskClass === 'critical' ? '#EF4444' : '#F97316', fontWeight: 600 }}>{e.riskClass}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{e.requiredFutureGate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All endpoints are not implemented. No API endpoint has been created.
      </div>
    </div>
  );
}
