import React from 'react';
import { DEPLOYMENT_REQUEST_FIELDS } from './governanceDesignSpec';

export default function DeploymentRequestModel() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', fontSize: 10, color: 'var(--text-secondary)' }}>
        Deployment Request Model — all fields are <strong>not persisted</strong>, <strong>design-only</strong>, <strong>no runtime effect</strong>. No deployment path, no release path. Stage C deferred.
      </div>

      <div style={{ marginBottom: 6, fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>
        Deployment Request Fields ({DEPLOYMENT_REQUEST_FIELDS.length})
      </div>

      <div style={{ display: 'grid', gap: 2, fontSize: 9, overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2.5fr 1fr 1.2fr', gap: 8, padding: '5px 8px', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>
          <span>Field</span><span>Purpose</span><span>Status</span><span>Persisted</span>
        </div>
        {DEPLOYMENT_REQUEST_FIELDS.map(f => (
          <div key={f.field} style={{
            display: 'grid', gridTemplateColumns: '1.5fr 2.5fr 1fr 1.2fr', gap: 8,
            padding: '5px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.02)', alignItems: 'center',
          }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{f.field}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{f.purpose}</span>
            <span style={{ color: '#8B5CF6' }}>{f.status}</span>
            <span style={{ color: 'var(--text-muted)' }}>{f.persisted}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <strong>约束：</strong>不新增真实 DB schema。不新增 migration。不新增 API endpoint。不写入任何数据。不创建真实 deployment request。
      </div>
    </div>
  );
}
