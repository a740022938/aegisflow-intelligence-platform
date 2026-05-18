import React from 'react';
import { GATE_COVERAGE_OVERVIEW } from './governanceDesignSpec';

const C: Record<string, string> = {
  'design-only': '#8B5CF6', 'complete-design': '#8B5CF6', disabled: '#6B7280',
  none: 'var(--success)', '0': 'var(--success)', 'Stage C deferred': '#F97316',
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

export default function GateCoverageOverview() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', fontSize: 10, color: 'var(--text-secondary)' }}>
        Gate Coverage Overview — <strong>{GATE_COVERAGE_OVERVIEW.length} gates</strong> covered across P3–P8. All gates are <strong>design-only</strong>. No runtime control model has been implemented. Stage C remains <strong>disabled</strong>.
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Gate</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Covered By</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Mode</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Controls</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Write Path</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Stage Gate</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Coverage</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Remaining Blocker</th>
          </tr>
        </thead>
        <tbody>
          {GATE_COVERAGE_OVERVIEW.map(g => (
            <tr key={g.gate} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '5px 8px', fontWeight: 500 }}>{g.gate}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={g.coveredBy} color="#8B5CF6" /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={g.currentMode} color={C[g.currentMode] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={g.runtimeEffect} color={C[g.runtimeEffect] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={g.realControls} color={C[g.realControls] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={g.writePath} color={C[g.writePath] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={g.stageGate} color={C[g.stageGate] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={g.coverageStatus} color={C[g.coverageStatus] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', color: 'var(--danger)', fontSize: 9 }}>{g.remainingBlocker}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
