import React from 'react';
import { RUNTIME_DRY_RUN_BOUNDARY_ROWS } from './governanceDesignSpec';

export default function RuntimeDryRunBoundaryDesign() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)', color: 'var(--text-secondary)' }}>
        Runtime Dry-run Boundary Design — <strong>{RUNTIME_DRY_RUN_BOUNDARY_ROWS.length}</strong> dry-run areas. All not implemented. No dry-run engine, no fixture loader, no result reporting in this task.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(6,182,212,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Dry-run Area</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Purpose</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Implementation</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime Effect</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Write Effect</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Dependency</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Blocker</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required Package</th>
            </tr>
          </thead>
          <tbody>
            {RUNTIME_DRY_RUN_BOUNDARY_ROWS.map(r => (
              <tr key={r.dryRunArea} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.dryRunArea}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{r.futurePurpose}</td>
                <td style={{ padding: '3px 6px', color: r.currentImplementation === 'not implemented' ? '#EF4444' : 'var(--text-muted)', fontWeight: r.currentImplementation === 'not implemented' ? 600 : 400 }}>{r.currentImplementation}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.runtimeEffect}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.writeEffect}</td>
                <td style={{ padding: '3px 6px', color: '#F97316' }}>{r.dependency}</td>
                <td style={{ padding: '3px 6px', color: '#EF4444' }}>{r.blocker}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.requiredPackage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(6,182,212,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All {RUNTIME_DRY_RUN_BOUNDARY_ROWS.length} dry-run areas not implemented. No dry-run engine, no fixture loader, no result reporting in this task.
      </div>
    </div>
  );
}
