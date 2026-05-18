import React from 'react';

const DEFERRED_AREAS = [
  { area: 'Candidate approval', status: 'deferred', desc: 'Memory Hub candidate approval/rejection not available' },
  { area: 'Memory mutation', status: 'deferred', desc: 'Memory candidate processing not available' },
  { area: 'External connector write', status: 'deferred', desc: 'Connector write operations not available' },
  { area: 'LAN sync', status: 'deferred', desc: 'LAN_SHARE synchronization not available' },
  { area: 'Lab execution', status: 'deferred', desc: 'Lab experiment execution not available' },
  { area: 'Deployment action', status: 'deferred', desc: 'Deployment operations not available' },
  { area: 'Service control', status: 'deferred', desc: 'Taskkill / restart service not available' },
  { area: 'Release operation', status: 'deferred', desc: 'GitHub Release / tag creation not available' },
];

export default function StageCPreviewPanel() {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Stage C Preview Panel</div>
      <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 8 }}>Stage C is not enabled. This page only describes future governance boundaries.</div>
      <div style={{ padding: '10px 12px', marginBottom: 10, borderRadius: 6, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', fontSize: 10, color: 'var(--warning)', lineHeight: 1.6 }}>
        <strong>Stage C is not enabled.</strong> No executable approval, mutation, deployment, sync or service-control action is available.
      </div>
      <div style={{ display: 'grid', gap: 2, fontSize: 9 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 80px 2fr', gap: 8, padding: '4px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>
          <span>Governance Area</span><span>Status</span><span>Description</span>
        </div>
        {DEFERRED_AREAS.map(a => (
          <div key={a.area} style={{ display: 'grid', gridTemplateColumns: '1.5fr 80px 2fr', gap: 8, padding: '6px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.02)', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-primary)' }}>{a.area}</span>
            <span style={{ fontWeight: 600, color: 'var(--warning)' }}>{a.status}</span>
            <span style={{ color: 'var(--text-muted)' }}>{a.desc}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(245,158,11,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        All Stage C deferred areas are <strong>readonly descriptions</strong>. No clickable operation buttons present. No real approval, rejection, mutation, deployment, sync, or service control.
      </div>
    </div>
  );
}
