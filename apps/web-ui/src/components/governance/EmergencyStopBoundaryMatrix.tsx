import React from 'react';
import { EMERGENCY_STOP_BOUNDARY_ROWS } from './governanceDesignSpec';

const C: Record<string, string> = {
  no: 'var(--success)', yes: 'var(--danger)', 'n/a': '#6B7280',
  readonly: '#8B5CF6', disabled: '#6B7280', 'design-only': '#8B5CF6',
  gated: '#F97316', 'local gated': '#F97316',
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

export default function EmergencyStopBoundaryMatrix() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 10, color: 'var(--text-secondary)' }}>
        Emergency Stop Boundary Matrix — all areas have <strong>stop/pause/kill/restart/disable = no</strong>. No emergency stop boundary has real control capabilities. Stage C is <strong>deferred</strong> for all areas.
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ background: 'rgba(239,68,68,0.04)' }}>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Boundary Area</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Mode</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Stop</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Pause</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Kill</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Restart</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Disable</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Service IO</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Stage Gate</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {EMERGENCY_STOP_BOUNDARY_ROWS.map(r => (
            <tr key={r.boundaryArea} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '5px 8px', fontWeight: 500 }}>{r.boundaryArea}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={r.currentMode} color={C[r.currentMode] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={r.stop} color={C[r.stop] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={r.pause} color={C[r.pause] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={r.kill} color={C[r.kill] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={r.restart} color={C[r.restart] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={r.disable} color={C[r.disable] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={r.serviceIO} color={C[r.serviceIO] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={r.stageGate} color={C[r.stageGate] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={r.status} color={C[r.status] || '#6B7280'} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
