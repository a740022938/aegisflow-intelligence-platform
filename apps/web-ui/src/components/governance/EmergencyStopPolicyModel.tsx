import React from 'react';
import { EMERGENCY_STOP_POLICY_ITEMS } from './governanceDesignSpec';

const C: Record<string, string> = {
  'not active': '#6B7280', disabled: '#6B7280', none: 'var(--success)',
  'Stage C deferred': '#F97316',
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

export default function EmergencyStopPolicyModel() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 10, color: 'var(--text-secondary)' }}>
        Emergency Stop Policy Model is <strong>design-only / not active</strong>. No emergency stop policy is enforced at runtime. All policies are <strong>Stage C deferred</strong>. Current status: <strong>readonly policy model</strong> — no runtime effect.
      </div>

      <div style={{ marginBottom: 6, fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>
        Emergency Stop Policy Items ({EMERGENCY_STOP_POLICY_ITEMS.length})
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ background: 'rgba(239,68,68,0.04)' }}>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Policy</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Purpose</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Service Ctrl</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Stage Gate</th>
          </tr>
        </thead>
        <tbody>
          {EMERGENCY_STOP_POLICY_ITEMS.map(p => (
            <tr key={p.policy} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '5px 8px', fontWeight: 500 }}>{p.policy}</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{p.purpose}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={p.status} color={C[p.status] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={p.runtimeEffect} color={C[p.runtimeEffect] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={p.serviceControl} color={C[p.serviceControl] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={p.stageGate} color={C[p.stageGate] || '#6B7280'} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
