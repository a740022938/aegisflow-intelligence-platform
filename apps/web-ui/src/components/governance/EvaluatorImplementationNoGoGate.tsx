import React from 'react';
import { EVALUATOR_IMPLEMENTATION_NO_GO_CHECKS } from './governanceDesignSpec';

export default function EvaluatorImplementationNoGoGate() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(239,68,68,0.06)', border: '2px solid #EF4444', color: 'var(--text-secondary)' }}>
        Evaluator Implementation No-Go Gate — <strong>{EVALUATOR_IMPLEMENTATION_NO_GO_CHECKS.length}</strong> checks. All No-Go (1). All not started. No evaluator implementation permitted in this task.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(239,68,68,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Check</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Purpose</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current State</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Go Decision</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>No-Go Decision</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required for Activation</th>
            </tr>
          </thead>
          <tbody>
            {EVALUATOR_IMPLEMENTATION_NO_GO_CHECKS.map(r => (
              <tr key={r.check} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.check}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{r.purpose}</td>
                <td style={{ padding: '3px 6px', color: r.currentState === 'not started' ? '#6B7280' : 'var(--text-muted)', fontStyle: r.currentState === 'not started' ? 'italic' : 'normal' }}>{r.currentState}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: r.goDecision === 0 ? 'var(--danger)' : 'var(--text-muted)', fontWeight: 700 }}>{r.goDecision}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: r.noGoDecision === 1 ? 'var(--success)' : 'var(--text-muted)', fontWeight: 700 }}>{r.noGoDecision}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.requiredForActivation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All {EVALUATOR_IMPLEMENTATION_NO_GO_CHECKS.length} checks are No-Go (1). All not started. No evaluator implementation permitted in this task.
      </div>
    </div>
  );
}
