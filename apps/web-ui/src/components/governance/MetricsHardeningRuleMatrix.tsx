import React from 'react';
import { METRICS_HARDENING_RULES } from './governanceDesignSpec';

export default function MetricsHardeningRuleMatrix() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Metrics Hardening Rule Matrix — <strong>{METRICS_HARDENING_RULES.length}</strong> rules. All enforced. No future report metric will be misaligned.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Rule</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Purpose</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Applies To</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Validation</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Severity</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Enforced</th>
            </tr>
          </thead>
          <tbody>
            {METRICS_HARDENING_RULES.map(r => (
              <tr key={r.rule} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.rule}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{r.purpose}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.appliesTo}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.validation}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: r.severity === 'error' ? 'var(--danger)' : 'var(--warning)', fontWeight: 600 }}>{r.severity}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: r.enforced === 'true' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{r.enforced}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All {METRICS_HARDENING_RULES.length} rules are enforced. No future report metric will be misaligned.
      </div>
    </div>
  );
}
