import React from 'react';
import { IMPLEMENTATION_PACKAGE_EXECUTION_AREAS } from './governanceDesignSpec';

export default function ImplementationPackageExecutionBoundaryReview() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(100,116,139,0.06)', border: '1px solid rgba(100,116,139,0.2)', color: 'var(--text-secondary)' }}>
        Implementation Package Execution Boundary Review — <strong>{IMPLEMENTATION_PACKAGE_EXECUTION_AREAS.length}</strong> areas. All review-only, No-Go. No runtime execution, no evaluator runtime, no dry-run engine, no permission function in this task.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(100,116,139,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Area</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Purpose</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current State</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime Effect</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Write Effect</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Execution Impact</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required Preflight</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Blocker</th>
            </tr>
          </thead>
          <tbody>
            {IMPLEMENTATION_PACKAGE_EXECUTION_AREAS.map(r => (
              <tr key={r.area} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.area}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{r.futurePurpose}</td>
                <td style={{ padding: '3px 6px', color: '#8B5CF6' }}>{r.currentState}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.runtimeEffect}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.writeEffect}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.executionImpact}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.requiredPreflight}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#EF4444', fontWeight: 600 }}>{r.blocker}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(100,116,139,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All {IMPLEMENTATION_PACKAGE_EXECUTION_AREAS.length} areas are review-only, No-Go. No runtime execution, no evaluator runtime, no dry-run engine, no permission function in this task.
      </div>
    </div>
  );
}
