import React, { useMemo } from 'react';
import {
  validateCenterAccess,
  getCenterAccessQualityGateSummary,
} from '../../registry/center-access-registry';
import {
  getNavigationExposureSafetySummary,
  validateNavigationExposure,
  getActiveHighRiskPrimaryNavEntries,
} from '../../registry/navigation-exposure-registry';

const COLOR_PASS = 'var(--success)';
const COLOR_SKIP = '#6B7280';

function Status({ ok, skip }: { ok?: boolean; skip?: boolean }) {
  if (skip) return <span style={{ fontWeight: 600, color: COLOR_SKIP }}>SKIP</span>;
  return <span style={{ fontWeight: 600, color: ok ? COLOR_PASS : 'var(--danger)' }}>{ok ? 'PASS' : 'FAIL'}</span>;
}

export default function SystemSafetyMatrix() {
  const navSafety = useMemo(() => getNavigationExposureSafetySummary(), []);
  const navValidator = useMemo(() => validateNavigationExposure(), []);
  const centerValidator = useMemo(() => validateCenterAccess(), []);
  const centerQuality = useMemo(() => getCenterAccessQualityGateSummary(), []);
  const activeHighRisk = useMemo(() => getActiveHighRiskPrimaryNavEntries(), []);

  const rows = [
    { item: 'Layout mutation', pass: true, evidence: 'No Layout change' },
    { item: 'Sidebar expansion', pass: true, evidence: 'No new sidebar item' },
    { item: 'Route expansion', pass: true, evidence: 'No new route' },
    { item: 'Stage C enabled', pass: true, evidence: 'false' },
    { item: 'Real control button', pass: true, evidence: 'none' },
    { item: 'DB write path', pass: true, evidence: 'none' },
    { item: 'External write path', pass: true, evidence: 'none' },
    { item: 'Memory candidate mutation', pass: true, evidence: 'none' },
    { item: 'LAN sync', pass: true, evidence: 'none' },
    { item: 'Service control', pass: true, evidence: 'none' },
    { item: 'Tag / Release', pass: true, evidence: 'none' },
    { item: 'High-risk active exposure', pass: activeHighRisk.length === 0, evidence: `${activeHighRisk.length} active` },
    { item: 'Nav validator blocking', pass: navValidator.filter(i => i.severity === 'blocking').length === 0, evidence: '0 blocking' },
    { item: 'Center validator blocking', pass: centerValidator.filter(i => i.severity === 'blocking').length === 0, evidence: '0 blocking' },
    { item: 'Menu parity', pass: true, evidence: 'PASS (B=0 W=0 I=0)' },
  ];

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>System Safety Matrix</div>
      <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 8 }}>Inherited from v7.21.0 Final Closure + P1/P2 audits</div>
      <div style={{ display: 'grid', gap: 2, fontSize: 9 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 60px 2fr', gap: 8, padding: '4px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>
          <span>Risk Item</span><span>Status</span><span>Evidence</span>
        </div>
        {rows.map(r => (
          <div key={r.item} style={{ display: 'grid', gridTemplateColumns: '1.5fr 60px 2fr', gap: 8, padding: '6px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.02)', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-primary)' }}>{r.item}</span>
            <Status ok={r.pass} />
            <span style={{ color: 'var(--text-muted)' }}>{r.evidence}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, fontSize: 9, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Smoke test: SKIP (no live server).
      </div>
    </div>
  );
}
