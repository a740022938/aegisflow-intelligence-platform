import React from 'react';
import { AUTHORIZATION_ENDPOINT_BOUNDARY_ROWS } from './governanceDesignSpec';

export default function AuthorizationEndpointBoundaryDesign() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontWeight: 600, fontSize: 9 }}>
        Authorization Endpoint Boundary Design — {AUTHORIZATION_ENDPOINT_BOUNDARY_ROWS.length} future endpoints. All are not implemented. No handler, no route, no API client mutation in this task.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(239,68,68,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Endpoint</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Method</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Purpose</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Status</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Handler Status</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Write Impact</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>DB Dependency</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Auth Requirement</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Risk Class</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required Validation</th>
            </tr>
          </thead>
          <tbody>
            {AUTHORIZATION_ENDPOINT_BOUNDARY_ROWS.map(r => (
              <tr key={r.futureEndpoint} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.futureEndpoint}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{r.method}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{r.futurePurpose}</td>
                <td style={{ padding: '3px 6px', color: '#EF4444' }}>{r.currentStatus}</td>
                <td style={{ padding: '3px 6px', color: '#EF4444' }}>{r.handlerStatus}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.writeImpact}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.dbDependency}</td>
                <td style={{ padding: '3px 6px', color: '#F97316' }}>{r.authRequirement}</td>
                <td style={{ padding: '3px 6px', color: r.riskClass === 'critical' ? '#EF4444' : r.riskClass === 'high' ? '#F97316' : 'var(--text-muted)', fontWeight: 600 }}>{r.riskClass}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.requiredValidation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All endpoints are not implemented. No handler, no route, no API client mutation in this task.
      </div>
    </div>
  );
}
