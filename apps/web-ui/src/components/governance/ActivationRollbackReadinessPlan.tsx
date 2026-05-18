import React from 'react';
import { ACTIVATION_ROLLBACK_READINESS_ITEMS } from './governanceDesignSpec';

export default function ActivationRollbackReadinessPlan() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--text-secondary)' }}>
        Activation Rollback Readiness Plan — <strong>{ACTIVATION_ROLLBACK_READINESS_ITEMS.length}</strong> plan items. All items are <strong>design-only — not implemented</strong>. No rollback action is available. No disable button exists.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
        <thead>
          <tr style={{ background: 'rgba(239,68,68,0.04)' }}>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Plan Item</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Status</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required Future Deliverable</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime Dependency</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Blocked Action</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Risk Note</th>
          </tr>
        </thead>
        <tbody>
          {ACTIVATION_ROLLBACK_READINESS_ITEMS.map(p => (
            <tr key={p.planItem} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '4px 7px', fontWeight: 500 }}>{p.planItem}</td>
              <td style={{ padding: '4px 7px', color: '#EF4444' }}>{p.currentStatus}</td>
              <td style={{ padding: '4px 7px', color: 'var(--text-secondary)' }}>{p.requiredFutureDeliverable}</td>
              <td style={{ padding: '4px 7px', color: 'var(--text-muted)' }}>{p.runtimeDependency}</td>
              <td style={{ padding: '4px 7px', color: '#EF4444' }}>{p.blockedAction}</td>
              <td style={{ padding: '4px 7px', color: 'var(--text-muted)' }}>{p.riskNote}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All items are design-only — not implemented. No rollback action is available. No disable button exists. No git reset/revert. No service operation.
      </div>
    </div>
  );
}
