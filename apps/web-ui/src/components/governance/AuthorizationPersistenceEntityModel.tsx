import React from 'react';
import { AUTHORIZATION_PERSISTENCE_ENTITY_MODELS } from './governanceDesignSpec';

export default function AuthorizationPersistenceEntityModel() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Persistence Entity Model — <strong>{AUTHORIZATION_PERSISTENCE_ENTITY_MODELS.length}</strong> entities. All entities have <strong>none</strong> current implementation. No schema, no storage, no write/read paths. Stage C deferred.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Entity</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Purpose</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Implementation</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Schema</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Storage</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Write</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Read</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Dep</th>
          </tr>
        </thead>
        <tbody>
          {AUTHORIZATION_PERSISTENCE_ENTITY_MODELS.map(e => (
            <tr key={e.entityName} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '5px 8px', fontWeight: 500, fontFamily: 'monospace', fontSize: 9 }}>{e.entityName}</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-secondary)' }}>{e.futurePurpose}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>none</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>not implemented</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>disabled</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>none</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>none</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{e.futureDependency}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
