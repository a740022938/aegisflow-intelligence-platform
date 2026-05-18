import React from 'react';
import { API_AUTH_BOUNDARY_ROWS } from './governanceDesignSpec';

export default function ApiAuthPermissionBoundaryDesign() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B', fontWeight: 600, fontSize: 9 }}>
        API Auth/Permission Boundary Design — {API_AUTH_BOUNDARY_ROWS.length} actors. All current access is none. No auth middleware, no permission enforcement in this task.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(245,158,11,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Actor</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future API Access</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current API Access</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Permission Enforcement</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Write Permission</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Decision Permission</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Stage Gate</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {API_AUTH_BOUNDARY_ROWS.map(r => (
              <tr key={r.actor} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.actor}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{r.futureApiAccess}</td>
                <td style={{ padding: '3px 6px', color: '#6B7280' }}>{r.currentApiAccess}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.permissionEnforcement}</td>
                <td style={{ padding: '3px 6px', color: 'var(--success)' }}>{r.writePermission}</td>
                <td style={{ padding: '3px 6px', color: 'var(--success)' }}>{r.decisionPermission}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.stageGate}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(245,158,11,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All current access is none. No auth middleware, no permission enforcement in this task.
      </div>
    </div>
  );
}
