import React from 'react';
import { STORAGE_VALIDATION_CHECKS } from './governanceDesignSpec';

export default function P7StorageValidationPlan() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)', color: 'var(--text-secondary)' }}>
        Storage Validation Plan — <strong>{STORAGE_VALIDATION_CHECKS.length}</strong> validation checks. Most are 'not available (future)'. Baseline validations (secret scan, build/typecheck/lint) are available now.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
          <thead>
            <tr style={{ background: 'rgba(6,182,212,0.04)' }}>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Validation Check</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Availability</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Requirement</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime Effect</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Write Effect</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {STORAGE_VALIDATION_CHECKS.map(r => (
              <tr key={r.validationCheck} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '5px 8px', fontWeight: 500, whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: 9 }}>{r.validationCheck}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', color: r.currentAvailability === 'available now' ? 'var(--success)' : '#F97316', fontWeight: 600 }}>{r.currentAvailability}</td>
                <td style={{ padding: '5px 8px', color: 'var(--text-secondary)' }}>{r.futureRequirement}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>{r.runtimeEffect}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>{r.writeEffect}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', color: 'var(--text-muted)' }}>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(6,182,212,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Most validation checks are 'not available (future)'. Secret scan, build/typecheck/lint are available now. No write or runtime effect in this task.
      </div>
    </div>
  );
}
