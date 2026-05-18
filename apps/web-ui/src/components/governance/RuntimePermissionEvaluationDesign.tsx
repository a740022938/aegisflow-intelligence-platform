import React from 'react';
import { RUNTIME_PERMISSION_EVALUATION_STEPS } from './governanceDesignSpec';

export default function RuntimePermissionEvaluationDesign() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Runtime Permission Evaluation Design — <strong>{RUNTIME_PERMISSION_EVALUATION_STEPS.length}</strong> steps. Evaluation engine is <strong>not implemented</strong>. Default result is <strong>deny</strong>. No runtime availability.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Step</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Purpose</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Default</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Engine</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Requirement</th>
          </tr>
        </thead>
        <tbody>
          {RUNTIME_PERMISSION_EVALUATION_STEPS.map(s => (
            <tr key={s.step} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '5px 8px', fontWeight: 500, fontFamily: 'monospace', fontSize: 9 }}>{s.step}</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-secondary)' }}>{s.purpose}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#8B5CF6' }}>design-only</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>none</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: 'var(--danger)', fontWeight: 600 }}>{s.defaultResult}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>not implemented</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{s.futureRequirement}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Default action = <strong>deny</strong>. Evaluation engine = <strong>not implemented</strong>. Runtime authorization = <strong>false</strong>. Permission writes = <strong>0</strong>. No permission evaluator is active.
      </div>
    </div>
  );
}
