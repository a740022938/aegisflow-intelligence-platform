import React from 'react';
import { EXECUTION_REQUEST_FIELDS } from './governanceDesignSpec';

export default function ExecutionRequestModel() {
  return (
    <div>
      <div style={{ marginBottom: 8, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        Execution request model — all fields are <strong>not persisted / design-only / no execution path / Stage C deferred</strong>.
      </div>
      <div style={{ display: 'grid', gap: 4, fontSize: 10 }}>
        {EXECUTION_REQUEST_FIELDS.map(f => (
          <div key={f.field} style={{ display: 'grid', gridTemplateColumns: '130px 1.5fr 90px 100px', gap: 8, padding: '6px 10px', borderRadius: 4, background: 'var(--bg-surface)', border: '1px solid var(--border)', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{f.field}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{f.purpose}</span>
            <span style={{ color: '#8B5CF6', textAlign: 'center' }}>{f.status}</span>
            <span style={{ color: 'var(--text-muted)', textAlign: 'right' }}>{f.persisted}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.04)', fontSize: 9, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Execution request model specification — not persisted. No DB schema, no API endpoint, no execution path. Stage C deferred.
      </div>
    </div>
  );
}
