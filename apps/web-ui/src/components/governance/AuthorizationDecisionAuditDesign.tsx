import React from 'react';
import { AUTHORIZATION_DECISION_AUDIT_ITEMS } from './governanceDesignSpec';

export default function AuthorizationDecisionAuditDesign() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Authorization Decision Audit Design — <strong>{AUTHORIZATION_DECISION_AUDIT_ITEMS.length}</strong> items. All items are <strong>design-only</strong>. No audit persistence, no audit write, no audit export, no integrity marker runtime. Stage C deferred.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
        <thead>
          <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Item</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Purpose</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Audit Persistence</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Audit Write</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Export</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Integrity</th>
            <th style={{ padding: '5px 7px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future</th>
          </tr>
        </thead>
        <tbody>
          {AUTHORIZATION_DECISION_AUDIT_ITEMS.map(i => (
            <tr key={i.item} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '4px 7px', fontWeight: 500, fontFamily: 'monospace', fontSize: 9 }}>{i.item}</td>
              <td style={{ padding: '4px 7px', color: 'var(--text-secondary)' }}>{i.purpose}</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#8B5CF6' }}>design-only</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#6B7280' }}>disabled</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: 'var(--success)', fontWeight: 600 }}>0</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#6B7280' }}>0</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#F97316' }}>future</td>
              <td style={{ padding: '4px 7px', textAlign: 'center', color: '#6B7280' }}>none</td>
              <td style={{ padding: '4px 7px', color: 'var(--text-muted)' }}>{i.futureRequirement}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        No audit record written. No evidence saved. No upload/export. No real hash computed. No DB/API added.
      </div>
    </div>
  );
}
