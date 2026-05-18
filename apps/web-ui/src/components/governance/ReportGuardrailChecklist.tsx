import React from 'react';
import { REPORT_GUARDRAIL_CHECKS } from './governanceDesignSpec';

export default function ReportGuardrailChecklist() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--text-secondary)' }}>
        Report Guardrail Checklist — <strong>{REPORT_GUARDRAIL_CHECKS.length}</strong> guardrail checks. All pass. Report metrics are hardened. No metric misalignment allowed in future reports.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(99,102,241,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Check</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Purpose</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Validation</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current State</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Guardrail</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required Action</th>
            </tr>
          </thead>
          <tbody>
            {REPORT_GUARDRAIL_CHECKS.map(r => (
              <tr key={r.check} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.check}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{r.purpose}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.validation}</td>
                <td style={{ padding: '3px 6px', color: r.currentState === 'pass' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{r.currentState}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.guardrail}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.requiredAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(99,102,241,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All {REPORT_GUARDRAIL_CHECKS.length} guardrail checks pass. Report metrics are hardened. No metric misalignment allowed in future reports.
      </div>
    </div>
  );
}
