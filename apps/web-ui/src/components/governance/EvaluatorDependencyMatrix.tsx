import React from 'react';
import { EVALUATOR_DEPENDENCY_ROWS } from './governanceDesignSpec';

export default function EvaluatorDependencyMatrix() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Evaluator Dependency Matrix — <strong>{EVALUATOR_DEPENDENCY_ROWS.length}</strong> dependencies. All runtime availability = none. All dependencies are blocking. No evaluator runtime in this task.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Dependency</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Needed By Evaluator</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Status</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime Availability</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Blocking Status</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Package</th>
            </tr>
          </thead>
          <tbody>
            {EVALUATOR_DEPENDENCY_ROWS.map(r => (
              <tr key={r.dependency} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.dependency}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{r.neededByEvaluator}</td>
                <td style={{ padding: '3px 6px', color: '#F97316' }}>{r.currentStatus}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#6B7280', fontWeight: 600 }}>{r.runtimeAvailability}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#EF4444', fontWeight: 600 }}>{r.blockingStatus}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.futurePackage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All runtime availability = none. All dependencies are blocking. No evaluator runtime in this task.
      </div>
    </div>
  );
}
