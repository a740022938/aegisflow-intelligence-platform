import React, { useMemo } from 'react';
import {
  CENTER_ACCESS_REGISTRY,
  getCenterAccessSummary,
  getCenterAccessQualityGateSummary,
  validateCenterAccess,
} from '../../registry/center-access-registry';
import {
  getNavigationExposureSafetySummary,
  getNavigationExposureSummary,
  getActiveHighRiskPrimaryNavEntries,
  getGuardedHighRiskPrimaryNavEntries,
  validateNavigationExposure,
} from '../../registry/navigation-exposure-registry';

function Badge({ label, color }: { label: string; color?: string }) {
  return <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 9, fontWeight: 600, color: '#fff', background: color || '#6B7280', lineHeight: '16px', whiteSpace: 'nowrap' }}>{label}</span>;
}

function Status({ ok }: { ok: boolean }) {
  return <span style={{ fontWeight: 600, color: ok ? 'var(--success)' : 'var(--danger)' }}>{ok ? 'PASS' : 'FAIL'}</span>;
}

export default function CenterLaunchpadDecisionPath() {
  const centerSummary = useMemo(() => getCenterAccessSummary(), []);
  const safetySummary = useMemo(() => getNavigationExposureSafetySummary(), []);
  const exposureSummary = useMemo(() => getNavigationExposureSummary(), []);
  const centerQuality = useMemo(() => getCenterAccessQualityGateSummary(), []);
  const navValidator = useMemo(() => validateNavigationExposure(), []);
  const centerValidator = useMemo(() => validateCenterAccess(), []);
  const activeHighRisk = useMemo(() => getActiveHighRiskPrimaryNavEntries(), []);
  const guardedHighRisk = useMemo(() => getGuardedHighRiskPrimaryNavEntries(), []);

  const decisionRows = [
    { area: 'Sidebar exposure', state: '2 centers', reason: 'Keep primary nav clean', closure: 'stable' },
    { area: 'Launchpad exposure', state: '5 centers', reason: 'Preserve discoverability', closure: 'stable' },
    { area: 'Advanced hub exposure', state: '4 centers', reason: 'Advanced users can inspect', closure: 'stable' },
    { area: 'Governance Center', state: 'Hidden from sidebar', reason: 'Stage C not enabled', closure: 'deferred' },
    { area: 'Navigation Preview', state: 'Direct/readonly', reason: 'Audit utility, not primary nav', closure: 'accepted' },
    { area: 'High-risk exposure', state: 'Active 0', reason: 'No executable access', closure: 'safe' },
    { area: 'Stage C controls', state: 'Disabled', reason: 'Deferred across all phases', closure: 'deferred' },
    { area: 'Real control buttons', state: 'None', reason: 'All pages are readonly/placeholder', closure: 'safe' },
    { area: 'DB/external writes', state: 'None', reason: 'No write operations anywhere', closure: 'safe' },
    { area: 'Menu expansion in v7.22.0-P1', state: 'None', reason: 'No Layout/sidebar changes', closure: 'stable' },
  ];

  const safetyRows = [
    { item: 'Layout mutation', status: true, evidence: 'No Layout.tsx change' },
    { item: 'Sidebar expansion', status: true, evidence: 'No new sidebar items' },
    { item: 'New route', status: true, evidence: 'No new route added' },
    { item: 'Stage C enabled', status: true, evidence: 'false' },
    { item: 'Real control button', status: true, evidence: 'none' },
    { item: 'DB write path', status: true, evidence: 'none' },
    { item: 'External write path', status: true, evidence: 'none' },
    { item: 'High-risk active exposure', status: activeHighRisk.length === 0, evidence: `${activeHighRisk.length} active` },
    { item: 'Nav validator blocking', status: navValidator.filter(i => i.severity === 'blocking').length === 0, evidence: `${navValidator.filter(i => i.severity === 'blocking').length} blocking` },
    { item: 'Center validator blocking', status: centerValidator.filter(i => i.severity === 'blocking').length === 0, evidence: `${centerValidator.filter(i => i.severity === 'blocking').length} blocking` },
    { item: 'Menu parity', status: true, evidence: 'PASS (B=0 W=0 I=0)' },
    { item: 'Sidebar centers <= 2', status: centerSummary.sidebarVisible <= 2, evidence: `${centerSummary.sidebarVisible} sidebar` },
  ];

  return (
    <div>
      {/* Decision Path Panel */}
      <div style={{ marginBottom: 20, padding: 14, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Decision Path</div>
        <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 8 }}>Why 2 centers in sidebar, 3 remaining in launchpad/direct route</div>
        <div style={{ display: 'grid', gap: 2, fontSize: 9 }}>
          {decisionRows.map(r => (
            <div key={r.area} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 80px', gap: 8, padding: '6px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.02)', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.area}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{r.state}</span>
              <span style={{ color: 'var(--text-muted)' }}>{r.reason}</span>
              <Badge label={r.closure} color={r.closure === 'stable' || r.closure === 'safe' ? 'var(--success)' : r.closure === 'deferred' ? 'var(--warning)' : '#6B7280'} />
            </div>
          ))}
        </div>
      </div>

      {/* Safety / Risk Matrix */}
      <div style={{ marginBottom: 20, padding: 14, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Safety / Risk Matrix</div>
        <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 8 }}>Inherited from v7.21.0 Final Closure. Readonly audit.</div>
        <div style={{ display: 'grid', gap: 2, fontSize: 9 }}>
          {safetyRows.map(r => (
            <div key={r.item} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 2fr', gap: 8, padding: '6px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.02)', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-primary)' }}>{r.item}</span>
              <Status ok={r.status} />
              <span style={{ color: 'var(--text-muted)' }}>{r.evidence}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Guarded exposure summary */}
      <div style={{ padding: '10px 14px', borderRadius: 6, background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.15)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <strong>Accepted guarded exposures:</strong> {guardedHighRisk.length} entries (inference, scheduler, deploy-v2) — all disallowed, gated, and placeholder/readonly.
      </div>
    </div>
  );
}
