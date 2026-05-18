import React from 'react';
import { RUNTIME_DRY_RUN_FIXTURE_ROWS } from './governanceDesignSpec';

export default function RuntimeDryRunFixtureModel() {
  const getExpectedDecisionColor = (decision: string) => {
    if (decision.startsWith('deny')) return '#EF4444';
    if (decision.startsWith('allow')) return 'var(--success)';
    return 'var(--text-muted)';
  };

  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--text-secondary)' }}>
        Runtime Dry-run Fixture Model — <strong>{RUNTIME_DRY_RUN_FIXTURE_ROWS.length}</strong> fixtures. All design-only. No fixture loading, no dry-run execution in this task.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(245,158,11,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Fixture Name</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Purpose</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Input Shape</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Expected Decision</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Status</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime Effect</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Write Effect</th>
            </tr>
          </thead>
          <tbody>
            {RUNTIME_DRY_RUN_FIXTURE_ROWS.map(r => (
              <tr key={r.fixtureName} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.fixtureName}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{r.futurePurpose}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.inputShape}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: getExpectedDecisionColor(r.expectedDecision), fontWeight: 600 }}>{r.expectedDecision}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#8B5CF6' }}>{r.currentStatus}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.runtimeEffect}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.writeEffect}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(245,158,11,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All {RUNTIME_DRY_RUN_FIXTURE_ROWS.length} fixtures are design-only. No fixture loading, no dry-run execution in this task.
      </div>
    </div>
  );
}
