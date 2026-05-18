import React from 'react';
import { CONNECTOR_WRITE_LIFECYCLE_STAGES } from './governanceDesignSpec';

export default function ConnectorWriteLifecycleDesign() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', fontSize: 10, color: 'var(--text-secondary)' }}>
        Connector Write Lifecycle Design — all stages are <strong>design-only</strong> with <strong>no runtime effect</strong>. Stage C deferred. No state machine, API, or DB writes are active.
      </div>

      <div style={{ marginBottom: 6, fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>
        Connector Write Lifecycle Stages ({CONNECTOR_WRITE_LIFECYCLE_STAGES.length})
      </div>

      <div style={{ display: 'grid', gap: 2, fontSize: 9, overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2.5fr 1.8fr', gap: 8, padding: '5px 8px', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>
          <span>Stage</span><span>Purpose</span><span>Status</span>
        </div>
        {CONNECTOR_WRITE_LIFECYCLE_STAGES.map(s => (
          <div key={s.stage} style={{
            display: 'grid', gridTemplateColumns: '1.5fr 2.5fr 1.8fr', gap: 8,
            padding: '5px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.02)', alignItems: 'center',
          }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.stage}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{s.purpose}</span>
            <span style={{ color: '#8B5CF6' }}>{s.status}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <strong>约束：</strong>不写成真实流程引擎。不新增状态机。不调用 API。不写 DB。所有阶段均为设计规格参考。
      </div>
    </div>
  );
}
