import React from 'react';
import { API_VALIDATION_CHECKS } from './governanceDesignSpec';

export default function ApiValidationPlan() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', color: '#6366F1', fontWeight: 600, fontSize: 9 }}>
        API Validation Plan — {API_VALIDATION_CHECKS.length} validation checks. Baseline checks (route registration, handler no-op, secret scan, build) are available now. Future checks are not available.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(99,102,241,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Validation Check</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Availability</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Requirement</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime Effect</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Write Effect</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {API_VALIDATION_CHECKS.map(r => (
              <tr key={r.validationCheck} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.validationCheck}</td>
                <td style={{ padding: '3px 6px', color: r.currentAvailability === 'available now' ? 'var(--success)' : '#F97316', fontWeight: 600 }}>{r.currentAvailability}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.futureRequirement}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.runtimeEffect}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.writeEffect}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(99,102,241,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Baseline checks are available now. Future checks are not available. All runtime/write effects are none.
      </div>
    </div>
  );
}
