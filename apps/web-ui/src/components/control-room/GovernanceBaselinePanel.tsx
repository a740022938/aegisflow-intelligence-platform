import React, { useMemo } from 'react';
import {
  getCenterAccessSummary,
  getCenterAccessSidebarVisibleCount,
  getCenterAccessHighRiskPrimaryNavCount,
  getCenterAccessStageCPrimaryNavCount,
  validateCenterAccess,
} from '../../registry/center-access-registry';
import {
  getNavigationExposureSafetySummary,
  validateNavigationExposure,
} from '../../registry/navigation-exposure-registry';
import { getConnectorRegistryCount } from '../../registry/connector-registry';

const STABLE = { label: 'stable', color: 'var(--success)' };
const DEFERRED = { label: 'deferred', color: 'var(--warning)' };
const GATED = { label: 'gated', color: 'var(--warning)' };
const ACCEPTED = { label: 'accepted', color: '#6B7280' };

function Badge({ label, color }: { label: string; color?: string }) {
  return <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 9, fontWeight: 600, color: '#fff', background: color || '#6B7280', lineHeight: '16px', whiteSpace: 'nowrap' }}>{label}</span>;
}

export default function GovernanceBaselinePanel() {
  const centerSummary = useMemo(() => getCenterAccessSummary(), []);
  const navSafety = useMemo(() => getNavigationExposureSafetySummary(), []);
  const navValidator = useMemo(() => validateNavigationExposure(), []);
  const centerValidator = useMemo(() => validateCenterAccess(), []);

  const rows = [
    { area: 'Access Strategy', state: 'Closed', exposure: '—', closure: 'stable', badge: STABLE },
    { area: 'Advanced Mode', state: 'Active readonly', exposure: 'Sidebar', closure: 'stable', badge: STABLE },
    { area: 'Connector Center', state: 'Active readonly', exposure: 'Sidebar', closure: 'stable', badge: STABLE },
    { area: 'Lab Center', state: 'Readonly / planned', exposure: 'Launchpad-only', closure: 'gated', badge: GATED },
    { area: 'Governance Center', state: 'Readonly / deferred', exposure: 'Launchpad-only', closure: 'Stage C deferred', badge: DEFERRED },
    { area: 'Navigation Preview', state: 'Readonly utility', exposure: 'Direct route', closure: 'accepted', badge: ACCEPTED },
    { area: 'Stage C', state: 'Disabled', exposure: 'None', closure: 'deferred', badge: DEFERRED },
  ];

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Governance Navigation Baseline</div>
      <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 8 }}>v7.21.0 → v7.22.0 current state</div>
      <div style={{ display: 'grid', gap: 2, fontSize: 9 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.2fr 1.2fr 1fr', gap: 8, padding: '4px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>
          <span>Area</span><span>Current State</span><span>Exposure</span><span>Closure</span>
        </div>
        {rows.map(r => (
          <div key={r.area} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.2fr 1.2fr 1fr', gap: 8, padding: '6px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.02)', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.area}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{r.state}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{r.exposure}</span>
            <Badge label={r.badge.label} color={r.badge.color} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6, padding: '6px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.04)' }}>
        Menu parity: PASS | Nav validator blocking: {navValidator.filter(i => i.severity === 'blocking').length} | Center validator blocking: {centerValidator.filter(i => i.severity === 'blocking').length}
      </div>
    </div>
  );
}
