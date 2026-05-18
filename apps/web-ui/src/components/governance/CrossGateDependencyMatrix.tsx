import React from 'react';
import { CROSS_GATE_DEPENDENCIES } from './governanceDesignSpec';

const C: Record<string, string> = {
  'design-only': '#8B5CF6', none: 'var(--success)',
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

export default function CrossGateDependencyMatrix() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', fontSize: 10, color: 'var(--text-secondary)' }}>
        Cross-Gate Dependency Matrix — all dependencies are <strong>design-only</strong>. No runtime dependency chain has been implemented. All dependencies require future activation packages.
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Source Gate</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Dependent Gate(s)</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Dependency Reason</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Mode</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Requirement</th>
          </tr>
        </thead>
        <tbody>
          {CROSS_GATE_DEPENDENCIES.map(d => (
            <tr key={d.sourceGate} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '5px 8px', fontWeight: 500 }}>{d.sourceGate}</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{d.dependentGate}</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{d.dependencyReason}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={d.currentMode} color={C[d.currentMode] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={d.runtimeEffect} color={C[d.runtimeEffect] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', color: 'var(--danger)', fontSize: 9 }}>{d.futureRequirement}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
