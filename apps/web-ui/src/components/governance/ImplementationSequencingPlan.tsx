import React from 'react';
import { IMPLEMENTATION_SEQUENCE_ROWS } from './governanceDesignSpec';

export default function ImplementationSequencingPlan() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.2)', color: 'var(--text-secondary)' }}>
        All implementations are future. No implementation action has been executed.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(251,146,60,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Seq</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Implementation Package</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Depends On</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Unlocks</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Status</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required Validation</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Go/No-Go</th>
            </tr>
          </thead>
          <tbody>
            {IMPLEMENTATION_SEQUENCE_ROWS.map(s => (
              <tr key={s.sequence} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, textAlign: 'center' }}>{s.sequence}</td>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{s.implementationPackage}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{s.dependsOn}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{s.unlocks}</td>
                <td style={{ padding: '3px 6px', color: '#F97316' }}>{s.currentStatus}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{s.requiredValidation}</td>
                <td style={{ padding: '3px 6px', color: '#EF4444', fontWeight: 600 }}>{s.goNoGoStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(251,146,60,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All sequences are No-Go. No implementation package has been started.
      </div>
    </div>
  );
}
