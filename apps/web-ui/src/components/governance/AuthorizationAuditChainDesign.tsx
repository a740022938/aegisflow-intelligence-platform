import React from 'react';
import { AUTHORIZATION_AUDIT_CHAIN_STEPS } from './governanceDesignSpec';

export default function AuthorizationAuditChainDesign() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Authorization Audit Chain Design — <strong>{AUTHORIZATION_AUDIT_CHAIN_STEPS.length}</strong> steps. Audit persistence is <strong>disabled</strong>. Audit write = <strong>0</strong>. Audit export = <strong>0</strong>. No runtime effect.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Step</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Purpose</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Persist</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Write</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Export</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Requirement</th>
          </tr>
        </thead>
        <tbody>
          {AUTHORIZATION_AUDIT_CHAIN_STEPS.map(s => (
            <tr key={s.step} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '5px 8px', fontWeight: 500 }}>{s.step}</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-secondary)' }}>{s.purpose}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#8B5CF6' }}>design-only</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>disabled</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: 'var(--success)', fontWeight: 600 }}>0</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: 'var(--success)', fontWeight: 600 }}>0</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>none</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{s.futureRequirement}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
