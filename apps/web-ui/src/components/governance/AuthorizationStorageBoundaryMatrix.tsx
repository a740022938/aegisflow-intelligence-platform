import React from 'react';
import { AUTHORIZATION_STORAGE_BOUNDARY_ROWS } from './governanceDesignSpec';

export default function AuthorizationStorageBoundaryMatrix() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Storage Boundary Matrix — <strong>{AUTHORIZATION_STORAGE_BOUNDARY_ROWS.length}</strong> storage areas. All areas are <strong>design-only</strong>. No DB schema, no migration, no write/read paths, no external sink. Stage C deferred.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Storage Area</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Mode</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>DB</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Migration</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Write</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Read</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Ext Sink</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Gate</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {AUTHORIZATION_STORAGE_BOUNDARY_ROWS.map(r => (
            <tr key={r.storageArea} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '5px 8px', fontWeight: 500 }}>{r.storageArea}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#8B5CF6' }}>{r.currentMode}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>{r.dbSchema}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>{r.migration}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>{r.writePath}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>{r.readPath}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>{r.externalSink}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#F97316' }}>{r.stageGate}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#8B5CF6' }}>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
