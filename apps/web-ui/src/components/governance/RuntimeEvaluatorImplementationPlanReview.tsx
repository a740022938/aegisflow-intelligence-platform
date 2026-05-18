import React from 'react';
import { EVALUATOR_IMPLEMENTATION_PHASES } from './governanceDesignSpec';

export default function RuntimeEvaluatorImplementationPlanReview() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--text-secondary)' }}>
        Runtime Evaluator Implementation Plan Review — <strong>{EVALUATOR_IMPLEMENTATION_PHASES.length}</strong> phases. All phases are review-only, No-Go. No runtime evaluator, no permission evaluator in this task.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(16,185,129,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Phase</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Purpose</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Status</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime Impact</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>DB Impact</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>API Impact</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Dependency</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required Validation</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Go/No-Go Status</th>
            </tr>
          </thead>
          <tbody>
            {EVALUATOR_IMPLEMENTATION_PHASES.map(r => (
              <tr key={r.phase} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.phase}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{r.futurePurpose}</td>
                <td style={{ padding: '3px 6px', color: '#F97316' }}>{r.currentStatus}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.runtimeImpact}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.dbImpact}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.apiImpact}</td>
                <td style={{ padding: '3px 6px', color: '#F97316' }}>{r.dependency}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.requiredValidation}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#EF4444', fontWeight: 600 }}>{r.goNoGoStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(16,185,129,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All {EVALUATOR_IMPLEMENTATION_PHASES.length} phases are review-only. No runtime evaluator, no permission evaluator in this task.
      </div>
    </div>
  );
}
