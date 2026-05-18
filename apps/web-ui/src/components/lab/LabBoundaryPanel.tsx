import React from 'react';

const BOUNDARY_ITEMS = [
  'No real experiment execution',
  'No model training',
  'No inference execution',
  'No dataset mutation',
  'No DB mutation',
  'No external system write',
  'No Memory Hub candidate approval / rejection',
  'No LAN_SHARE sync',
  'No service restart / taskkill',
  'No Stage C activation',
  'No GitHub Release / tag',
];

export default function LabBoundaryPanel() {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Lab Boundary Panel</div>
      <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 8 }}>This page will NOT do the following:</div>
      <div style={{ display: 'grid', gap: 2, fontSize: 9 }}>
        {BOUNDARY_ITEMS.map(item => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.02)' }}>
            <span style={{ fontWeight: 700, color: 'var(--danger)', fontSize: 11 }}>⊘</span>
            <span style={{ color: 'var(--text-secondary)' }}>{item}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(245,158,11,0.08)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        This is a <strong>readonly boundary notice</strong>. No real operation buttons or CTA present. All lab items are governance-safe display only.
      </div>
    </div>
  );
}
