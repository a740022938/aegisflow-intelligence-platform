import React from 'react';
import { BLOCKER_RESOLUTION_ITEMS } from './governanceDesignSpec';

const C: Record<string, string> = {
  future: '#8B5CF6',
};

export default function StageCBlockerResolutionPlan() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 10, color: 'var(--text-secondary)' }}>
        Stage C Blocker Resolution Plan — <strong>{BLOCKER_RESOLUTION_ITEMS.length}</strong> blockers. All blockers have a planned resolution package. All target status is <strong>future</strong>. No blocker has been resolved.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ background: 'rgba(239,68,68,0.04)' }}>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Blocker</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Resolution Package</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required Deliverable</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required Validation</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Dependency</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Target Status</th>
          </tr>
        </thead>
        <tbody>
          {BLOCKER_RESOLUTION_ITEMS.map(b => (
            <tr key={b.blocker} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '5px 8px', fontWeight: 500 }}>{b.blocker}</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-secondary)' }}>{b.resolutionPackage}</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{b.requiredDeliverable}</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{b.requiredValidation}</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{b.dependency}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}>
                <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600, color: '#fff', background: C[b.targetStatus] || '#6B7280', lineHeight: '16px', whiteSpace: 'nowrap' }}>{b.targetStatus}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
