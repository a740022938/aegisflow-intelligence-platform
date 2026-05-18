import React from 'react';
import { EVALUATOR_IO_CONTRACT_ROWS } from './governanceDesignSpec';

export default function EvaluatorInputOutputContractReview() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.2)', color: 'var(--text-secondary)' }}>
        Evaluator Input/Output Contract Review — <strong>{EVALUATOR_IO_CONTRACT_ROWS.length}</strong> contract items. All shapes are design-only. No runtime evaluator, no input/output processing in this task.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(20,184,166,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Contract Item</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Purpose</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Shape Status</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Implementation</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime Effect</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Write Effect</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Risk Note</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Requirement</th>
            </tr>
          </thead>
          <tbody>
            {EVALUATOR_IO_CONTRACT_ROWS.map(r => (
              <tr key={r.contractItem} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.contractItem}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{r.futurePurpose}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#8B5CF6', fontWeight: 600 }}>{r.shapeStatus}</td>
                <td style={{ padding: '3px 6px', color: '#EF4444' }}>{r.currentImplementation}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.runtimeEffect}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.writeEffect}</td>
                <td style={{ padding: '3px 6px', color: '#F97316' }}>{r.riskNote}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.futureRequirement}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(20,184,166,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All shapes are design-only. No runtime evaluator, no input/output processing in this task.
      </div>
    </div>
  );
}
