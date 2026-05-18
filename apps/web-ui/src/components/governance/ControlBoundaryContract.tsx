import React from 'react';
import { GATE_MATRIX_ROWS } from './governanceDesignSpec';
import { GATE_MATRIX_ROWS as GATES } from './governanceDesignSpec';

const C: Record<string, string> = {
  'design-only': '#8B5CF6', deferred: '#F97316', no: 'var(--success)', gated: 'var(--warning)',
};

export default function ControlBoundaryContract() {
  const items = [
    'No real approval action',
    'No reject action',
    'No execution action',
    'No DB mutation',
    'No external system write',
    'No Memory Hub candidate mutation',
    'No connector write',
    'No LAN_SHARE sync',
    'No lab execution',
    'No training trigger',
    'No inference trigger',
    'No deployment trigger',
    'No service restart / taskkill',
    'No tag / GitHub Release',
  ];

  return (
    <div>
      <div style={{ marginBottom: 8, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        This is a <strong>readonly control boundary contract</strong>. It defines what this governance layer will not do during Stage C design phase. Not a permission system — a design constraint.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 4 }}>
        {items.map(item => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 4, background: 'var(--bg-surface)', border: '1px solid var(--border)', fontSize: 11 }}>
            <span style={{ color: 'var(--success)', fontWeight: 700 }}>✅</span>
            <span style={{ color: 'var(--text-primary)' }}>{item}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(34,197,94,0.06)', fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Control boundary contract — design constraint only. No executable rules.
      </div>
    </div>
  );
}
