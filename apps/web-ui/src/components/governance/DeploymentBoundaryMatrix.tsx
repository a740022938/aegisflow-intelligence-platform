import React from 'react';
import { DEPLOYMENT_BOUNDARY_ROWS } from './governanceDesignSpec';

const C: Record<string, string> = {
  'design-only': '#8B5CF6', disabled: '#6B7280',
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

export default function DeploymentBoundaryMatrix() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', fontSize: 10, color: 'var(--text-secondary)' }}>
        Deployment Boundary Matrix — all Deploy/Release/Tag/Push are <strong>no</strong>. External IO is none or gated. Stage C deferred for all areas.
      </div>

      <div style={{ display: 'grid', gap: 2, fontSize: 9, overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 70px 50px 60px 50px 50px 1fr 1.2fr 70px', gap: 6, padding: '5px 8px', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)', minWidth: 750 }}>
          <span>Area</span><span>Mode</span><span>Deploy</span><span>Release</span><span>Tag</span><span>Push</span><span>Ext.IO</span><span>Stage Gate</span><span>Status</span>
        </div>
        {DEPLOYMENT_BOUNDARY_ROWS.map(r => (
          <div key={r.area} style={{
            display: 'grid', gridTemplateColumns: '1.2fr 70px 50px 60px 50px 50px 1fr 1.2fr 70px', gap: 6,
            padding: '5px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.02)', alignItems: 'center', minWidth: 750,
            borderLeft: `3px solid ${C[r.status] || 'var(--border)'}`,
          }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.area}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{r.currentMode}</span>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>{r.deploy}</span>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>{r.release}</span>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>{r.tag}</span>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>{r.push}</span>
            <span style={{ color: r.externalIO === 'none' ? 'var(--success)' : 'var(--warning)' }}>{r.externalIO}</span>
            <span style={{ color: 'var(--warning)' }}>{r.stageGate}</span>
            <Badge label={r.status} color={C[r.status] || '#6B7280'} />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        所有区域的 Deploy/Release/Tag/Push 均为 <strong>no</strong>。无真实部署/发布/打 tag/推送路径。Stage C deferred。无真实按钮。
      </div>
    </div>
  );
}
