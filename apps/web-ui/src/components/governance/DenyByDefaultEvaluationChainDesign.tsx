import React from 'react';
import { DENY_BY_DEFAULT_CHAIN_ROWS } from './governanceDesignSpec';

export default function DenyByDefaultEvaluationChainDesign() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--text-secondary)' }}>
        Deny-by-default Evaluation Chain Design — <strong>{DENY_BY_DEFAULT_CHAIN_ROWS.length}</strong> conditions. All decisions = deny by default. No runtime evaluator exists, so no approval/deny action is executable. Stage C disabled is a hard deny.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(245,158,11,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Condition</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Decision</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Behavior</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime Effect</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Write Effect</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Risk if Skipped</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {DENY_BY_DEFAULT_CHAIN_ROWS.map(r => (
              <tr key={r.condition} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, fontFamily: 'monospace', fontSize: 9 }}>{r.condition}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#EF4444', fontWeight: 600 }}>{r.futureDecision}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#6B7280' }}>{r.currentBehavior}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: 'var(--text-muted)' }}>{r.runtimeEffect}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: 'var(--text-muted)' }}>{r.writeEffect}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.riskIfSkipped}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#F97316' }}>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(245,158,11,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All decisions = deny by default. No runtime evaluator exists. Stage C disabled is a hard deny.
      </div>
    </div>
  );
}
