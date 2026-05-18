import React from 'react';
import { DEPLOYMENT_EVIDENCE_TYPES } from './governanceDesignSpec';

export default function DeploymentEvidenceMatrix() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', fontSize: 10, color: 'var(--text-secondary)' }}>
        Deployment Evidence / Release Plan Matrix — all evidence types are <strong>readonly / design-only</strong>. No runtime effect. No real evidence is collected or persisted.
      </div>

      <div style={{ marginBottom: 6, fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>
        Deployment Evidence Types ({DEPLOYMENT_EVIDENCE_TYPES.length})
      </div>

      <div style={{ display: 'grid', gap: 2, fontSize: 9, overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2.5fr 1.5fr', gap: 8, padding: '5px 8px', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>
          <span>Evidence</span><span>Purpose</span><span>Status</span>
        </div>
        {DEPLOYMENT_EVIDENCE_TYPES.map(e => (
          <div key={e.evidence} style={{
            display: 'grid', gridTemplateColumns: '1.5fr 2.5fr 1.5fr', gap: 8,
            padding: '5px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.02)', alignItems: 'center',
          }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{e.evidence}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{e.purpose}</span>
            <span style={{ color: '#8B5CF6' }}>{e.status}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <strong>约束：</strong>不创建真实 release note 文件。不执行真实 release。不上传 artifact。不写 DB。不新增真实状态机。
      </div>
    </div>
  );
}
