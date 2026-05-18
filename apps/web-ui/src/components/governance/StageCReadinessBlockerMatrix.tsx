import React from 'react';
import { STAGE_C_BLOCKER_MATRIX } from './governanceDesignSpec';

const C: Record<string, string> = {
  blocking: 'var(--danger)', delaying: '#F97316',
  'not implemented': '#6B7280', 'not finalized': '#F97316', 'not completed': '#F97316',
  'not validated': '#F97316',
};

function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 10,
      fontWeight: 600, color: '#fff', background: color || '#6B7280',
      lineHeight: '16px', whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

export default function StageCReadinessBlockerMatrix() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 10, color: 'var(--text-secondary)' }}>
        Stage C Readiness Blocker Matrix — <strong>{STAGE_C_BLOCKER_MATRIX.filter(b => b.activationImpact === 'blocking').length} blocking</strong> and <strong>{STAGE_C_BLOCKER_MATRIX.filter(b => b.activationImpact === 'delaying').length} delaying</strong> items remain. Stage C <strong>cannot be enabled</strong> until all blockers are resolved.
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ background: 'rgba(239,68,68,0.04)' }}>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Blocker</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Category</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current State</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required Future Work</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Risk If Ignored</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Impact</th>
          </tr>
        </thead>
        <tbody>
          {STAGE_C_BLOCKER_MATRIX.map(b => (
            <tr key={b.blocker} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '5px 8px', fontWeight: 500 }}>{b.blocker}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={b.category} color="#8B5CF6" /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={b.currentState} color={C[b.currentState] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{b.requiredFutureWork}</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{b.riskIfIgnored}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={b.activationImpact} color={C[b.activationImpact] || '#6B7280'} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
