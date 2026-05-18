import React from 'react';
import { GO_NO_GO_DECISION_GATES } from './governanceDesignSpec';

export default function GoNoGoDecisionMatrix() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--text-secondary)' }}>
        Go / No-Go Decision Matrix — <strong>{GO_NO_GO_DECISION_GATES.length}</strong> decision gates. All gates are <strong>No-Go</strong>. Overall activation decision: <strong>No-Go</strong>. No runtime simulator exists.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
        <thead>
          <tr style={{ background: 'rgba(239,68,68,0.04)' }}>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Decision Gate</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Decision</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required Evidence</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Blocker</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Owner</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Activation Impact</th>
          </tr>
        </thead>
        <tbody>
          {GO_NO_GO_DECISION_GATES.map(g => (
            <tr key={g.decisionGate} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '4px 7px', fontWeight: 500 }}>{g.decisionGate}</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#EF4444', fontWeight: 700 }}>{g.currentDecision}</td>
              <td style={{ padding: '4px 7px', color: 'var(--text-secondary)' }}>{g.requiredEvidence}</td>
              <td style={{ padding: '4px 7px', color: '#F97316' }}>{g.currentBlocker}</td>
              <td style={{ padding: '4px 7px', color: 'var(--text-muted)' }}>{g.futureOwner}</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: g.activationImpact === 'blocking' ? '#EF4444' : '#F97316', fontWeight: 600 }}>{g.activationImpact}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 4, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', fontSize: 10, color: '#EF4444', fontWeight: 700, textAlign: 'center' }}>
        Overall Activation Decision: No-Go — {GO_NO_GO_DECISION_GATES.filter(g => g.currentDecision === 'No-Go').length} / {GO_NO_GO_DECISION_GATES.length} gates are No-Go. Stage C must not be enabled.
      </div>
    </div>
  );
}
