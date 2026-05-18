import React from 'react';
import { SCHEMA_IMPLEMENTATION_PHASES } from './governanceDesignSpec';

export default function P7SchemaImplementationPlan() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Schema Implementation Plan Review — <strong>{SCHEMA_IMPLEMENTATION_PHASES.length}</strong> phases. All phases are review-only. No DB schema, no migration, no write path in this task.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
          <thead>
            <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Phase</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Purpose</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Status</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>DB Impact</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Migration Impact</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Write Impact</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Dependency</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required Validation</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Go/No-Go Status</th>
            </tr>
          </thead>
          <tbody>
            {SCHEMA_IMPLEMENTATION_PHASES.map(r => (
              <tr key={r.phase} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '5px 8px', fontWeight: 500, whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: 9 }}>{r.phase}</td>
                <td style={{ padding: '5px 8px', color: 'var(--text-secondary)' }}>{r.futurePurpose}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', color: '#8B5CF6' }}>{r.currentStatus}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>{r.dbImpact}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>{r.migrationImpact}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>{r.writeImpact}</td>
                <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{r.dependency}</td>
                <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{r.requiredValidation}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 600, color: r.goNoGoStatus === 'No-Go' ? '#EF4444' : 'var(--success)' }}>{r.goNoGoStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All phases are review-only schemas. No DB migration, no write path, no schema implementation in this design review task.
      </div>
    </div>
  );
}
