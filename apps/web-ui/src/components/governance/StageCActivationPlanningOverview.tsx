import React from 'react';
import { STAGE_C_ACTIVATION_PLANNING } from './governanceDesignSpec';

const C: Record<string, string> = {
  disabled: '#6B7280', 'not implemented': '#6B7280', '0': '#6B7280', 'design-only / planning review': '#8B5CF6',
};

export default function StageCActivationPlanningOverview() {
  const blockingCount = STAGE_C_ACTIVATION_PLANNING.filter(e => e.currentStatus.includes('not implemented') || e.currentStatus.includes('disabled')).length;
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Stage C Activation Planning Overview — <strong>{blockingCount} blocked</strong> areas. Stage C <strong>cannot be enabled</strong>. This is a planning-only design review.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Planning Area</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Status</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Detail</th>
          </tr>
        </thead>
        <tbody>
          {STAGE_C_ACTIVATION_PLANNING.map(e => (
            <tr key={e.area} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '5px 8px', fontWeight: 500 }}>{e.area}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}>
                <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600, color: '#fff', background: C[e.currentStatus.split(' ')[0]] || '#6B7280', lineHeight: '16px', whiteSpace: 'nowrap' }}>{e.currentStatus.split(' (')[0]}</span>
              </td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{e.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
