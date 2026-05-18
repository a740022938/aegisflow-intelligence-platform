import React from 'react';
import { AUTHORIZATION_PERSISTENCE_DESIGN_FIELDS } from './governanceDesignSpec';

export default function AuthorizationPersistenceDesignSpec() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Authorization Persistence Design Spec — <strong>{AUTHORIZATION_PERSISTENCE_DESIGN_FIELDS.length}</strong> fields. All fields are <strong>design-only</strong>. No persistence, no DB schema, no migration, no API endpoint. Stage C deferred.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
          <thead>
            <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Field</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Purpose</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Persist</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>DB</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Migration</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>API</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Write</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Gate</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future</th>
            </tr>
          </thead>
          <tbody>
            {AUTHORIZATION_PERSISTENCE_DESIGN_FIELDS.map(f => (
              <tr key={f.fieldName} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: 8 }}>{f.fieldName}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{f.purpose}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#8B5CF6' }}>design-only</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#6B7280' }}>disabled</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#6B7280' }}>not implemented</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#6B7280' }}>not implemented</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#6B7280' }}>not implemented</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#6B7280' }}>disabled</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#F97316' }}>Stage C deferred</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{f.futureRequirement}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All fields are design-only. No DB schema, no migration, no API endpoint, no persistence write. Stage C deferred.
      </div>
    </div>
  );
}
