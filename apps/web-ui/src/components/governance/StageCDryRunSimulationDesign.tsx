import React from 'react';
import { DRY_RUN_SIMULATION_AREAS } from './governanceDesignSpec';

export default function StageCDryRunSimulationDesign() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Stage C Dry-run Simulation Design — <strong>{DRY_RUN_SIMULATION_AREAS.length}</strong> areas. Dry-run simulation is <strong>design-only</strong>. No dry-run engine exists. No preflight is executed. No runtime state is read. No DB or external system is touched.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
        <thead>
          <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Dry-run Area</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Purpose</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Implementation</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime Effect</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Write Path</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required Future Validation</th>
          </tr>
        </thead>
        <tbody>
          {DRY_RUN_SIMULATION_AREAS.map(d => (
            <tr key={d.dryRunArea} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '4px 7px', fontWeight: 500 }}>{d.dryRunArea}</td>
              <td style={{ padding: '4px 7px', color: 'var(--text-secondary)' }}>{d.futurePurpose}</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#6B7280' }}>{d.currentImplementation}</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#6B7280' }}>{d.runtimeEffect}</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#6B7280' }}>{d.writePath}</td>
              <td style={{ padding: '4px 7px', color: 'var(--text-muted)' }}>{d.requiredFutureValidation}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Dry-run simulation is design-only. No dry-run engine exists. No preflight is executed. No runtime state is read. No DB or external system is touched.
      </div>
    </div>
  );
}
