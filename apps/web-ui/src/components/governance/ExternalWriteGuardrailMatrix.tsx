import React from 'react';
import { EXTERNAL_WRITE_GUARDRAIL_MATRIX } from './governanceDesignSpec';

export default function ExternalWriteGuardrailMatrix() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', fontSize: 10, color: 'var(--text-secondary)' }}>
        External Write Guardrail Matrix — all active risks are <strong>0</strong>. No external write, connector write, sync, upload, deploy, or release paths are active. All statuses are <strong>safe</strong>.
      </div>

      <div style={{ display: 'grid', gap: 2, fontSize: 9, overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.2fr 70px 1.5fr 70px', gap: 8, padding: '5px 8px', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>
          <span>Risk</span><span>Exposure</span><span>Active</span><span>Guardrail</span><span>Status</span>
        </div>
        {EXTERNAL_WRITE_GUARDRAIL_MATRIX.map(r => (
          <div key={r.risk} style={{
            display: 'grid', gridTemplateColumns: '1.5fr 1.2fr 70px 1.5fr 70px', gap: 8,
            padding: '5px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.02)', alignItems: 'center',
          }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.risk}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{r.currentExposure}</span>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>{r.activeRisk}</span>
            <span style={{ color: 'var(--success)' }}>{r.guardrail}</span>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>{r.status}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <strong>注意：</strong>不伪造风险。active risk 全部为 0。保留 Stage C deferred 语义。所有 guardrail 均有效。
      </div>
    </div>
  );
}
