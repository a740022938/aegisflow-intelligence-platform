import React from 'react';

const WORKSTREAMS = [
  {
    name: 'v7.22.0-P4 Lab Center Readonly UX',
    purpose: 'Lab Center readonly preview polish — similar to P2 Connector approach',
    risk: 'controlled',
    scope: 'UI-only / readonly / no sidebar',
    blocked: ['Stage C enablement', 'write DB', 'modify sidebar', 'add route'],
    why: 'Lab Center has launchpad preview data; UI polish aligns with P1/P2 methodology.',
  },
  {
    name: 'v7.22.0-P5 Governance Center Stage C Preview',
    purpose: 'Governance Center design review, Stage C deferred status documentation',
    risk: 'guarded',
    scope: 'Preview only / readonly / no Stage C enable',
    blocked: ['actual Stage C enablement', 'write DB', 'modify sidebar', 'process candidates'],
    why: 'Governance Center readiness is hold_review; Stage C remains deferred in all registries.',
  },
  {
    name: 'v7.22.0-P6 Navigation / Connector Closure Audit',
    purpose: 'Full closure audit for v7.22.0 series — connector + navigation baseline',
    risk: 'low',
    scope: 'Audit-only / static validation / no code changes',
    blocked: ['tag/release', 'version bump', 'Stage C enable'],
    why: 'After P4/P5, run full closure audit to confirm all validators pass.',
  },
];

const RISK_COLORS: Record<string, string> = {
  low: 'var(--success)', controlled: 'var(--warning)', guarded: 'var(--danger)', high: 'var(--danger)',
};

export default function NextWorkstreamPanel() {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Next Recommended Workstreams</div>
      <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 8 }}>Readonly suggestions — not auto-executed</div>
      {WORKSTREAMS.map((w, i) => (
        <div key={w.name} style={{ marginBottom: 8, padding: 10, borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderLeft: `3px solid ${RISK_COLORS[w.risk] || '#6B7280'}`, fontSize: 9, lineHeight: 1.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 10 }}>{i + 1}. {w.name}</span>
            <span style={{ padding: '1px 6px', borderRadius: 6, fontSize: 8, fontWeight: 600, color: '#fff', background: RISK_COLORS[w.risk] || '#6B7280' }}>{w.risk}</span>
          </div>
          <div style={{ color: 'var(--text-secondary)', marginBottom: 2 }}>{w.purpose}</div>
          <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>Scope: {w.scope}</div>
          <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginBottom: 2 }}>
            <span style={{ color: 'var(--text-muted)' }}>Blocked:</span>
            {w.blocked.map(b => (
              <span key={b} style={{ padding: '1px 6px', borderRadius: 4, fontSize: 8, color: 'var(--danger)', background: 'rgba(239,68,68,0.08)' }}>{b}</span>
            ))}
          </div>
          <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Why: {w.why}</div>
        </div>
      ))}
      <div style={{ padding: '6px 8px', borderRadius: 4, background: 'rgba(245,158,11,0.06)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <strong>Note:</strong> These are readonly suggestions. No workstream is auto-initiated. Stage C remains deferred across all candidates. All recommendations are preview-only.
      </div>
    </div>
  );
}
