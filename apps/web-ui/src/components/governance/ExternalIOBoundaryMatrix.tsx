import React from 'react';
import { EXTERNAL_IO_BOUNDARY_ROWS } from './governanceDesignSpec';

const C: Record<string, string> = {
  stable: 'var(--success)', 'design-only': '#8B5CF6', deferred: '#F97316', planned: 'var(--warning)', disabled: '#6B7280',
};

function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 10,
      fontWeight: 600, color: '#fff', background: color || '#6B7280',
      lineHeight: '16px', whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

export default function ExternalIOBoundaryMatrix() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', fontSize: 10, color: 'var(--text-secondary)' }}>
        External IO Boundary Matrix — all Write/Sync/Upload/Deploy are <strong>no</strong>. External IO is either none, gated, or readonly. Stage C is deferred for all connectors requiring external IO.
      </div>

      <div style={{ display: 'grid', gap: 2, fontSize: 9, overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 60px 50px 50px 60px 60px 1.2fr 1.2fr 70px', gap: 6, padding: '5px 8px', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)', minWidth: 800 }}>
          <span>Connector</span><span>Read</span><span>Write</span><span>Sync</span><span>Upload</span><span>Deploy</span><span>Ext.IO</span><span>Stage Gate</span><span>Status</span>
        </div>
        {EXTERNAL_IO_BOUNDARY_ROWS.map(r => (
          <div key={r.connector} style={{
            display: 'grid', gridTemplateColumns: '1.2fr 60px 50px 50px 60px 60px 1.2fr 1.2fr 70px', gap: 6,
            padding: '5px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.02)', alignItems: 'center', minWidth: 800,
            borderLeft: `3px solid ${C[r.status] || 'var(--border)'}`,
          }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.connector}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{r.read}</span>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>{r.write}</span>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>{r.sync}</span>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>{r.upload}</span>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>{r.deploy}</span>
            <span style={{ color: r.externalIO === 'none' ? 'var(--success)' : 'var(--warning)' }}>{r.externalIO}</span>
            <span style={{ color: 'var(--warning)' }}>{r.stageGate}</span>
            <Badge label={r.status} color={C[r.status] || '#6B7280'} />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        所有 10 个 connector 的 Write/Sync/Upload/Deploy 均为 <strong>no</strong>。无真实外部 IO 路径。Stage C deferred。无真实按钮。
      </div>
    </div>
  );
}
