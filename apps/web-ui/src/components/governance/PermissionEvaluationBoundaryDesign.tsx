import React from 'react';
import { PERMISSION_EVALUATION_BOUNDARY_ROWS } from './governanceDesignSpec';

export default function PermissionEvaluationBoundaryDesign() {
  const getRiskClassColor = (riskClass: string) => {
    switch (riskClass) {
      case 'critical': return '#EF4444';
      case 'high': return '#F97316';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--text-secondary)' }}>
        Permission Evaluation Boundary Design — <strong>{PERMISSION_EVALUATION_BOUNDARY_ROWS.length}</strong> permissions. All current permissions are false. No evaluator, no role system, no permission enforcement in this task.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(239,68,68,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Permission</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Purpose</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Implementation</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Permission</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime Effect</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Write Effect</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Stage Gate</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Risk Class</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required Validation</th>
            </tr>
          </thead>
          <tbody>
            {PERMISSION_EVALUATION_BOUNDARY_ROWS.map(r => (
              <tr key={r.permission} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, fontFamily: 'monospace', fontSize: 9 }}>{r.permission}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{r.futurePurpose}</td>
                <td style={{ padding: '3px 6px', color: '#EF4444' }}>{r.currentImplementation}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: 'var(--success)', fontWeight: 600 }}>{r.currentPermission}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.runtimeEffect}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.writeEffect}</td>
                <td style={{ padding: '3px 6px', color: '#F97316' }}>{r.stageGate}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: getRiskClassColor(r.riskClass), fontWeight: 600 }}>{r.riskClass}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.requiredValidation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All current permissions are false. No evaluator, no role system, no permission enforcement in this task.
      </div>
    </div>
  );
}
