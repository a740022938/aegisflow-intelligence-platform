import React from 'react';
import { EVALUATION_RESULT_CONTRACT_ROWS } from './governanceDesignSpec';

export default function EvaluationResultContractReview() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.2)', color: 'var(--text-secondary)' }}>
        Evaluation Result Contract Review — <strong>{EVALUATION_RESULT_CONTRACT_ROWS.length}</strong> result fields. All design-only. No evaluator decision output in this task.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(20,184,166,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Result Field</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Purpose</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Shape Status</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Implementation</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime Effect</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Write Effect</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Requirement</th>
            </tr>
          </thead>
          <tbody>
            {EVALUATION_RESULT_CONTRACT_ROWS.map(r => (
              <tr key={r.resultField} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.resultField}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{r.futurePurpose}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: r.shapeStatus === 'design-only' ? '#8B5CF6' : 'var(--text-muted)', fontWeight: r.shapeStatus === 'design-only' ? 600 : 400 }}>{r.shapeStatus}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#EF4444' }}>{r.currentImplementation}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.runtimeEffect}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.writeEffect}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.futureRequirement}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(20,184,166,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All {EVALUATION_RESULT_CONTRACT_ROWS.length} result fields are design-only. No evaluator decision output in this task.
      </div>
    </div>
  );
}
