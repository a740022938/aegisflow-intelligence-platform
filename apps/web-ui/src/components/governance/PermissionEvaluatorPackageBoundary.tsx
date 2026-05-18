import React from 'react';
import { PERMISSION_EVALUATOR_PACKAGE_BOUNDARY_ROWS } from './governanceDesignSpec';

export default function PermissionEvaluatorPackageBoundary() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--text-secondary)' }}>
        Permission Evaluator Package Boundary — <strong>{PERMISSION_EVALUATOR_PACKAGE_BOUNDARY_ROWS.length}</strong> boundary items. All actions blocked. No permission evaluator runtime, no deny chain, no dry-run execution in this task.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(239,68,68,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Boundary Item</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current State</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Blocked Action</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Package</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required Preflight</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Risk if Violated</th>
            </tr>
          </thead>
          <tbody>
            {PERMISSION_EVALUATOR_PACKAGE_BOUNDARY_ROWS.map(r => (
              <tr key={r.boundaryItem} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.boundaryItem}</td>
                <td style={{ padding: '3px 6px', color: '#EF4444' }}>{r.currentState}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: r.blockedAction === 'true' ? '#EF4444' : 'var(--text-muted)', fontWeight: r.blockedAction === 'true' ? 700 : 400 }}>{r.blockedAction}</td>
                <td style={{ padding: '3px 6px', color: '#F97316' }}>{r.futurePackage}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.requiredPreflight}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.riskIfViolated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All {PERMISSION_EVALUATOR_PACKAGE_BOUNDARY_ROWS.length} boundary items have actions blocked. No permission evaluator runtime, no deny chain, no dry-run execution in this task.
      </div>
    </div>
  );
}
