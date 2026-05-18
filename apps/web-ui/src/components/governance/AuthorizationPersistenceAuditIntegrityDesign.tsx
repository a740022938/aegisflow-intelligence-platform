import React from 'react';
import { AUTHORIZATION_PERSISTENCE_AUDIT_INTEGRITY_ITEMS } from './governanceDesignSpec';

export default function AuthorizationPersistenceAuditIntegrityDesign() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Persistence Audit / Integrity Design — <strong>{AUTHORIZATION_PERSISTENCE_AUDIT_INTEGRITY_ITEMS.length}</strong> items. All items are <strong>design-only</strong>. No hash computed, no audit write, no integrity runtime. Export/upload disabled.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Item</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Purpose</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Hash</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Audit Write</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Integrity</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Export</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future</th>
          </tr>
        </thead>
        <tbody>
          {AUTHORIZATION_PERSISTENCE_AUDIT_INTEGRITY_ITEMS.map(i => (
            <tr key={i.item} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '5px 8px', fontWeight: 500, fontFamily: 'monospace', fontSize: 9 }}>{i.item}</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-secondary)' }}>{i.purpose}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#8B5CF6' }}>design-only</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>none</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: 'var(--success)', fontWeight: 600 }}>0</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>none</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>disabled</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{i.futureRequirement}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
