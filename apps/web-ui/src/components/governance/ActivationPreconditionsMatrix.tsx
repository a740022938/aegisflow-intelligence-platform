import React from 'react';
import { ACTIVATION_PRECONDITIONS } from './governanceDesignSpec';

const C: Record<string, string> = {
  blocking: 'var(--danger)', delaying: '#F97316',
  'not implemented': '#6B7280', 'not finalized': '#F97316', 'not completed': '#F97316', 'not validated': '#F97316',
  'not completed/completed': '#F97316',
};

export default function ActivationPreconditionsMatrix() {
  const blockingCount = ACTIVATION_PRECONDITIONS.filter(p => p.activationImpact === 'blocking').length;
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 10, color: 'var(--text-secondary)' }}>
        Activation Preconditions Matrix — <strong>{ACTIVATION_PRECONDITIONS.length}</strong> preconditions. <strong>{blockingCount} blocking</strong>. Stage C <strong>cannot be enabled</strong>.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ background: 'rgba(239,68,68,0.04)' }}>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Precondition</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Category</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current State</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required Implementation</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Validation</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Risk If Skipped</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Impact</th>
          </tr>
        </thead>
        <tbody>
          {ACTIVATION_PRECONDITIONS.map(p => (
            <tr key={p.precondition} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '5px 8px', fontWeight: 500 }}>{p.precondition}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}>
                <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600, color: '#fff', background: '#8B5CF6', lineHeight: '16px', whiteSpace: 'nowrap' }}>{p.category}</span>
              </td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}>
                <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600, color: '#fff', background: C[p.currentState] || '#6B7280', lineHeight: '16px', whiteSpace: 'nowrap' }}>{p.currentState}</span>
              </td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{p.requiredImplementation}</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{p.validationMethod}</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{p.riskIfSkipped}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}>
                <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600, color: '#fff', background: C[p.activationImpact] || '#6B7280', lineHeight: '16px', whiteSpace: 'nowrap' }}>{p.activationImpact}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
