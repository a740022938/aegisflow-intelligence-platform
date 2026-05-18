import React from 'react';
import { EVALUATOR_PACKAGE_DEPENDENCY_ROWS } from './governanceDesignSpec';

export default function EvaluatorPackageDependencyReview() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Evaluator Package Dependency Review — <strong>{EVALUATOR_PACKAGE_DEPENDENCY_ROWS.length}</strong> package dependencies. All are blocking. All availability = none. No evaluator runtime integration in this task.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Source Package</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Depends On</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Dependency Type</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Status</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Availability</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Blocking Status</th>
            </tr>
          </thead>
          <tbody>
            {EVALUATOR_PACKAGE_DEPENDENCY_ROWS.map(r => (
              <tr key={r.sourcePackage} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.sourcePackage}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{r.dependsOn}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.dependencyType}</td>
                <td style={{ padding: '3px 6px', color: '#F97316' }}>{r.currentStatus}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: r.availability === 'none' ? '#6B7280' : 'var(--text-muted)', fontStyle: r.availability === 'none' ? 'italic' : 'normal' }}>{r.availability}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: r.blockingStatus.includes('blocking') ? '#EF4444' : 'var(--text-muted)', fontWeight: r.blockingStatus.includes('blocking') ? 700 : 400 }}>{r.blockingStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All {EVALUATOR_PACKAGE_DEPENDENCY_ROWS.length} package dependencies are blocking. All availability = none. No evaluator runtime integration in this task.
      </div>
    </div>
  );
}
