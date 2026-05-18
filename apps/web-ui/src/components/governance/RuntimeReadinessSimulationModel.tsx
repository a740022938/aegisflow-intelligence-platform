import React from 'react';
import { RUNTIME_READINESS_SIMULATION_AREAS } from './governanceDesignSpec';

export default function RuntimeReadinessSimulationModel() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Runtime Readiness Simulation Model — <strong>{RUNTIME_READINESS_SIMULATION_AREAS.length}</strong> areas. Simulation only — no runtime simulator exists. All scores are 0%. No runtime state is read.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
        <thead>
          <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Readiness Area</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Simulated Score</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current State</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required Future Validation</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime Dependency</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Activation Impact</th>
          </tr>
        </thead>
        <tbody>
          {RUNTIME_READINESS_SIMULATION_AREAS.map(a => (
            <tr key={a.readinessArea} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '4px 7px', fontWeight: 500 }}>{a.readinessArea}</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#EF4444', fontWeight: 700 }}>{a.simulatedScore}</td>
              <td style={{ padding: '4px 7px', color: '#F97316' }}>{a.currentState}</td>
              <td style={{ padding: '4px 7px', color: 'var(--text-secondary)' }}>{a.requiredFutureValidation}</td>
              <td style={{ padding: '4px 7px', color: 'var(--text-muted)' }}>{a.runtimeDependency}</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: a.activationImpact === 'blocking' ? '#EF4444' : '#F97316', fontWeight: 600 }}>{a.activationImpact}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Simulation only — no runtime simulator exists. No runtime state is read. No API is called. All scores are design-only planning scores.
      </div>
    </div>
  );
}
