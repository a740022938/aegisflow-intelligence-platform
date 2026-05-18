import React from 'react';
import { IMPLEMENTATION_GO_NO_GO_CHECKS } from './governanceDesignSpec';

export default function ImplementationGoNoGoGate() {
  const goCount = IMPLEMENTATION_GO_NO_GO_CHECKS.filter(c => c.goDecision > 0).length;
  const noGoCount = IMPLEMENTATION_GO_NO_GO_CHECKS.filter(c => c.noGoDecision > 0).length;
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontWeight: 700, fontSize: 9 }}>
        Overall Implementation Decision = No-Go for activation. Implementation package planning may continue. No runtime package may execute in this task.
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
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required For Activation</th>
            </tr>
          </thead>
          <tbody>
            {IMPLEMENTATION_GO_NO_GO_CHECKS.map(c => (
              <tr key={c.check} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{c.check}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{c.purpose}</td>
                <td style={{ padding: '3px 6px', color: '#F97316' }}>{c.currentState}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: c.goDecision > 0 ? '#22C55E' : '#EF4444', fontWeight: 700 }}>{c.goDecision}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: c.noGoDecision > 0 ? '#EF4444' : '#22C55E', fontWeight: 700 }}>{c.noGoDecision}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{c.requiredForActivation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 4, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', fontSize: 10, color: '#EF4444', textAlign: 'center' }}>
        <div style={{ fontWeight: 700 }}>Activation Go = {goCount}</div>
        <div style={{ fontWeight: 700 }}>Activation No-Go = {noGoCount}</div>
        <div style={{ color: '#22C55E', fontWeight: 700 }}>Implementation Planning Allowed = true</div>
        <div style={{ color: '#EF4444', fontWeight: 700 }}>Runtime Execution Allowed = false</div>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All checks are No-Go. Implementation planning is allowed. Runtime execution is not allowed.
      </div>
    </div>
  );
}
