import React from 'react';
import { SCHEMA_ROLLBACK_PLANNING_ITEMS } from './governanceDesignSpec';

export default function P7SchemaRollbackPlanning() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)', color: 'var(--text-secondary)' }}>
        Schema Rollback Planning Design — <strong>{SCHEMA_ROLLBACK_PLANNING_ITEMS.length}</strong> rollback items. All are design-only. All actions are blocked. No rollback execution permitted in this task.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
          <thead>
            <tr style={{ background: 'rgba(244,63,94,0.04)' }}>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Rollback Item</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Status</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Purpose</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime Effect</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>DB Effect</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Blocked Action</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required Future Validation</th>
            </tr>
          </thead>
          <tbody>
            {SCHEMA_ROLLBACK_PLANNING_ITEMS.map(r => (
              <tr key={r.rollbackItem} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '5px 8px', fontWeight: 500, whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: 9 }}>{r.rollbackItem}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', color: '#8B5CF6' }}>{r.currentStatus}</td>
                <td style={{ padding: '5px 8px', color: 'var(--text-secondary)' }}>{r.futurePurpose}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>{r.runtimeEffect}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>{r.dbEffect}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 700, color: r.blockedAction === 'true' ? '#EF4444' : 'var(--success)' }}>{r.blockedAction}</td>
                <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{r.requiredFutureValidation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(244,63,94,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All items are design-only. All actions are blocked. No rollback execution permitted in this design review task.
      </div>
    </div>
  );
}
