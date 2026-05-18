import React from 'react';
import { DENY_BY_DEFAULT_RULES } from './governanceDesignSpec';

export default function DenyByDefaultPolicyDesign() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Deny-by-default Policy Design — <strong>{DENY_BY_DEFAULT_RULES.length}</strong> rules. All future runtime authorization must deny by default unless scope, evidence, role, risk, expiry, revocation, and audit requirements pass. Current build has <strong>no runtime evaluator</strong> and therefore no approval/deny action is executable.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
        <thead>
          <tr style={{ background: 'rgba(239,68,68,0.04)' }}>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Condition</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Decision</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Behavior</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Risk If Ignored</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {DENY_BY_DEFAULT_RULES.map(r => (
            <tr key={r.condition} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '4px 7px', fontWeight: 500, fontFamily: 'monospace', fontSize: 9 }}>{r.condition}</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#EF4444', fontWeight: 600 }}>{r.futureDecision}</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#6B7280' }}>{r.currentBehavior}</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#6B7280' }}>none</td>
              <td style={{ padding: '4px 7px', color: 'var(--text-muted)' }}>{r.riskIfIgnored}</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#F97316' }}>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Deny-by-default is a future policy design. No runtime evaluator exists. No approval/deny action is executable in the current build.
      </div>
    </div>
  );
}
