import React from 'react';
import { IMPLEMENTATION_PACKAGE_EXECUTION_SEQUENCE } from './governanceDesignSpec';

export default function ImplementationPackageExecutionSequencingPlan() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--text-secondary)' }}>
        Implementation Package Execution Sequencing Plan — <strong>{IMPLEMENTATION_PACKAGE_EXECUTION_SEQUENCE.length}</strong> packages. All blocked — No-Go. No execution package has been started. Recommended next = resolve blockers before execution.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(245,158,11,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Sequence Order</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Package Name</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Dependency</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Readiness</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Execution Status</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Blocker</th>
            </tr>
          </thead>
          <tbody>
            {IMPLEMENTATION_PACKAGE_EXECUTION_SEQUENCE.map(r => (
              <tr key={r.sequenceOrder} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.sequenceOrder}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{r.packageName}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.dependency}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.currentReadiness}</td>
                <td style={{ padding: '3px 6px', color: r.executionStatus && r.executionStatus.includes('blocked') ? '#EF4444' : 'var(--text-muted)' }}>{r.executionStatus}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#EF4444', fontWeight: 600 }}>{r.blocker}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(245,158,11,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All {IMPLEMENTATION_PACKAGE_EXECUTION_SEQUENCE.length} packages are blocked — No-Go. No execution package has been started. Recommended next = resolve blockers before execution.
      </div>
    </div>
  );
}
