import React from 'react';
import { EVALUATOR_DECISION_TRACE_ROWS } from './governanceDesignSpec';

export default function EvaluatorDecisionTraceDesign() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--text-secondary)' }}>
        Evaluator Decision Trace Design — <strong>{EVALUATOR_DECISION_TRACE_ROWS.length}</strong> trace steps. All design-only. No trace logging, no decision output in this task.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(99,102,241,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Trace Step</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Purpose</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Input Contract</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Output Contract</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Status</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime Effect</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Write Effect</th>
            </tr>
          </thead>
          <tbody>
            {EVALUATOR_DECISION_TRACE_ROWS.map(r => (
              <tr key={r.traceStep} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.traceStep}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{r.futurePurpose}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.inputContract}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.outputContract}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: r.currentStatus === 'design-only' ? '#8B5CF6' : 'var(--text-muted)', fontWeight: r.currentStatus === 'design-only' ? 600 : 400 }}>{r.currentStatus}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.runtimeEffect}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.writeEffect}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(99,102,241,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All {EVALUATOR_DECISION_TRACE_ROWS.length} trace steps are design-only. No trace logging, no decision output in this task.
      </div>
    </div>
  );
}
