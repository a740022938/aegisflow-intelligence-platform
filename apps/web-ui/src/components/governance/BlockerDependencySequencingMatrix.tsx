import React from 'react';
import { BLOCKER_DEPENDENCY_SEQUENCES } from './governanceDesignSpec';

export default function BlockerDependencySequencingMatrix() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Blocker Dependency Sequencing Matrix — <strong>{BLOCKER_DEPENDENCY_SEQUENCES.length}</strong> dependencies. All blockers are <strong>future / not implemented / design-only</strong>. No blocker has been resolved.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
        <thead>
          <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Seq</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Blocker</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Depends On</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Unlocks</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Status</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Risk Note</th>
          </tr>
        </thead>
        <tbody>
          {BLOCKER_DEPENDENCY_SEQUENCES.map(d => (
            <tr key={d.sequence} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '4px 7px', textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>{d.sequence}</td>
              <td style={{ padding: '4px 7px', fontWeight: 500 }}>{d.blocker}</td>
              <td style={{ padding: '4px 7px', color: 'var(--text-secondary)' }}>{d.dependsOn}</td>
              <td style={{ padding: '4px 7px', color: 'var(--text-secondary)' }}>{d.unlocks}</td>
              <td style={{ padding: '4px 7px', color: '#F97316' }}>{d.currentStatus}</td>
              <td style={{ padding: '4px 7px', color: 'var(--text-muted)' }}>{d.riskNote}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All {BLOCKER_DEPENDENCY_SEQUENCES.length} dependencies are future / not implemented / design-only. Sequencing is a design-only roadmap.
      </div>
    </div>
  );
}
