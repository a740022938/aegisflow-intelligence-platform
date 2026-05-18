import React from 'react';
import { REVIEW_WORKFLOW_STAGES } from './governanceDesignSpec';

export default function ReviewWorkflowImplementationBoundary() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.2)', color: 'var(--text-secondary)' }}>
        No review workflow has been implemented. No approve/reject UI has been added. No state machine has been built. No DB writes.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(251,146,60,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Workflow Stage</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Purpose</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Implementation</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Decision Persistence</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime Effect</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Blocked Action</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Package</th>
            </tr>
          </thead>
          <tbody>
            {REVIEW_WORKFLOW_STAGES.map(s => (
              <tr key={s.workflowStage} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{s.workflowStage}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{s.futurePurpose}</td>
                <td style={{ padding: '3px 6px', color: '#EF4444' }}>{s.currentImplementation}</td>
                <td style={{ padding: '3px 6px', color: '#F97316' }}>{s.decisionPersistence}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{s.runtimeEffect}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{s.blockedAction}</td>
                <td style={{ padding: '3px 6px', color: '#F97316' }}>{s.futurePackage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(251,146,60,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All workflow stages are not implemented. No decision persistence.
      </div>
    </div>
  );
}
