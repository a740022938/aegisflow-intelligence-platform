import React from 'react';
import { EVALUATOR_FAILURE_FALLBACK_ROWS } from './governanceDesignSpec';

export default function EvaluatorFailureFallbackDesign() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)', color: 'var(--text-secondary)' }}>
        Evaluator Failure/Fallback Design — <strong>{EVALUATOR_FAILURE_FALLBACK_ROWS.length}</strong> failure cases. All current behaviors are design-only. No evaluator runtime in this task.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(6,182,212,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Failure Case</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Fallback</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Behavior</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime Effect</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Write Effect</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {EVALUATOR_FAILURE_FALLBACK_ROWS.map(r => (
              <tr key={r.failureCase} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, fontFamily: 'monospace', fontSize: 9 }}>{r.failureCase}</td>
                <td style={{ padding: '3px 6px', color: '#EF4444', fontWeight: 600 }}>{r.futureFallback}</td>
                <td style={{ padding: '3px 6px', color: '#6B7280' }}>{r.currentBehavior}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: 'var(--text-muted)' }}>{r.runtimeEffect}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: 'var(--text-muted)' }}>{r.writeEffect}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#F97316' }}>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(6,182,212,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All current behaviors are design-only. No evaluator runtime in this task.
      </div>
    </div>
  );
}
