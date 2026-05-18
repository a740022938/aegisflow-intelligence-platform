import React from 'react';
import { MIGRATION_BOUNDARY_ITEMS } from './governanceDesignSpec';

export default function P7MigrationBoundaryDesign() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--text-secondary)' }}>
        Migration Boundary Design — <strong>{MIGRATION_BOUNDARY_ITEMS.length}</strong> boundary items. All actions are blocked. No migration file generation, execution, or rollback permitted in this task.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
          <thead>
            <tr style={{ background: 'rgba(245,158,11,0.04)' }}>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Boundary Item</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current State</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Blocked Action</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Package</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required Preflight</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Risk If Violated</th>
            </tr>
          </thead>
          <tbody>
            {MIGRATION_BOUNDARY_ITEMS.map(r => (
              <tr key={r.boundaryItem} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '5px 8px', fontWeight: 500, whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: 9 }}>{r.boundaryItem}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>{r.currentState}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 700, color: r.blockedAction === 'true' ? '#EF4444' : 'var(--success)' }}>{r.blockedAction}</td>
                <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{r.futurePackage}</td>
                <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{r.requiredPreflight}</td>
                <td style={{ padding: '5px 8px', color: '#EF4444' }}>{r.riskIfViolated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(245,158,11,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All actions are blocked. No migration file generation, execution, or rollback permitted in this design review task.
      </div>
    </div>
  );
}
