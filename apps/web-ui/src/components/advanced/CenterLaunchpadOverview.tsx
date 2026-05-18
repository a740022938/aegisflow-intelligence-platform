import React, { useMemo } from 'react';
import {
  getCenterAccessSummary,
  validateCenterAccess,
} from '../../registry/center-access-registry';
import {
  getNavigationExposureSafetySummary,
} from '../../registry/navigation-exposure-registry';

const KPI_COLORS: Record<string, string> = {
  sidebar: 'var(--success)',
  launchpad: '#8B5CF6',
  advanced: '#F97316',
  risk: 'var(--success)',
  validator: 'var(--success)',
};

export default function CenterLaunchpadOverview() {
  const centerSummary = useMemo(() => getCenterAccessSummary(), []);
  const safetySummary = useMemo(() => getNavigationExposureSafetySummary(), []);
  const validatorIssues = useMemo(() => validateCenterAccess(), []);
  const blocking = validatorIssues.filter(i => i.severity === 'blocking').length;
  const warning = validatorIssues.filter(i => i.severity === 'warning').length;

  const kpis = [
    { label: 'Sidebar centers', value: String(centerSummary.sidebarVisible), color: KPI_COLORS.sidebar, key: 'sidebar' },
    { label: 'Launchpad centers', value: String(centerSummary.launchpadVisible), color: KPI_COLORS.launchpad, key: 'launchpad' },
    { label: 'Advanced hub centers', value: String(centerSummary.advancedHubVisible), color: KPI_COLORS.advanced, key: 'advanced' },
    { label: 'Active high-risk', value: String(safetySummary.highRiskPrimaryNavActive), color: safetySummary.highRiskPrimaryNavActive > 0 ? 'var(--danger)' : 'var(--success)', key: 'risk' },
    { label: 'Validator B/W', value: `${blocking}/${warning}`, color: blocking > 0 ? 'var(--danger)' : 'var(--success)', key: 'validator' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Center Launchpad</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Stable governance-navigation baseline</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
          {kpis.map(k => (
            <div key={k.key} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>{k.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 6, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        <div style={{ fontWeight: 600, marginBottom: 4, color: '#8B5CF6', fontSize: 11 }}>Navigation boundary</div>
        Only <strong>Advanced Mode</strong> and <strong>Connector Center</strong> are exposed in sidebar. Lab Center, Governance Center and Navigation Preview remain direct/launchpad-only. No Stage C controls are enabled.
      </div>

      <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border)', fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, fontSize: 11 }}>Recommended path (readonly guidance)</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            '1. Review center access',
            '2. Use launchpad cards',
            '3. Inspect connector readiness',
            '4. Keep governance hidden until Stage C',
          ].map(s => (
            <span key={s} style={{ padding: '4px 10px', borderRadius: 12, background: 'rgba(139,92,246,0.08)', color: '#8B5CF6', fontWeight: 500, whiteSpace: 'nowrap', cursor: 'default' }}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
