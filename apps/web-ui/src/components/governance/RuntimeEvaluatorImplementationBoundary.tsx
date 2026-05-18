import React from 'react';
import { RUNTIME_EVALUATOR_STAGES } from './governanceDesignSpec';

export default function RuntimeEvaluatorImplementationBoundary() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontWeight: 600, fontSize: 9 }}>
        No evaluator has been implemented. No permission runtime has been added. No API has been called.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(239,68,68,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Evaluator Stage</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Purpose</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Implementation</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime Effect</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Write Path</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required Dependency</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Risk If Implemented Early</th>
            </tr>
          </thead>
          <tbody>
            {RUNTIME_EVALUATOR_STAGES.map(s => (
              <tr key={s.evaluatorStage} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{s.evaluatorStage}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{s.futurePurpose}</td>
                <td style={{ padding: '3px 6px', color: '#EF4444' }}>{s.currentImplementation}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{s.runtimeEffect}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{s.writePath}</td>
                <td style={{ padding: '3px 6px', color: '#F97316' }}>{s.requiredDependency}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{s.riskIfImplementedEarly}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All evaluator stages are not implemented. No runtime effect.
      </div>
    </div>
  );
}
