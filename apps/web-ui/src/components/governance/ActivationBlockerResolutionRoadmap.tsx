import React from 'react';
import { ACTIVATION_BLOCKER_ROADMAP_ITEMS } from './governanceDesignSpec';

export default function ActivationBlockerResolutionRoadmap() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--text-secondary)' }}>
        Activation Blocker Resolution Roadmap — <strong>{ACTIVATION_BLOCKER_ROADMAP_ITEMS.length}</strong> blockers. All blockers are <strong>not resolved</strong>. No resolution action has been executed. Stage C remains deferred.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(239,68,68,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Blocker</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Category</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current State</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Resolution Package</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Deliverable</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Validation</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Dependency</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Risk If Skipped</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {ACTIVATION_BLOCKER_ROADMAP_ITEMS.map(b => (
              <tr key={b.blocker} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{b.blocker}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{b.category}</td>
                <td style={{ padding: '3px 6px', color: '#EF4444' }}>{b.currentState}</td>
                <td style={{ padding: '3px 6px', color: '#F97316' }}>{b.resolutionPackage}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{b.requiredDeliverable}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{b.requiredValidation}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{b.dependency}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{b.riskIfSkipped}</td>
                <td style={{ padding: '3px 6px', color: '#EF4444', whiteSpace: 'nowrap' }}>{b.currentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All {ACTIVATION_BLOCKER_ROADMAP_ITEMS.length} blockers are not resolved. No resolution action has been executed. This is a design-only roadmap. No runtime effect.
      </div>
    </div>
  );
}
