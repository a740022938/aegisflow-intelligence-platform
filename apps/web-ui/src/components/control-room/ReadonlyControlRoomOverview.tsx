import React, { useMemo } from 'react';
import {
  getCenterAccessSummary,
  validateCenterAccess,
} from '../../registry/center-access-registry';
import {
  getNavigationExposureSafetySummary,
  getNavigationExposureSummary,
  getActiveHighRiskPrimaryNavEntries,
} from '../../registry/navigation-exposure-registry';
import {
  getConnectorRegistryCount,
  getConnectorRegistryByCategory,
} from '../../registry/connector-registry';

export default function ReadonlyControlRoomOverview() {
  const centerSummary = useMemo(() => getCenterAccessSummary(), []);
  const safetySummary = useMemo(() => getNavigationExposureSafetySummary(), []);
  const exposureSummary = useMemo(() => getNavigationExposureSummary(), []);
  const connectorTotal = useMemo(() => getConnectorRegistryCount(), []);
  const connectorActive = useMemo(() => getConnectorRegistryByCategory('active'), []);
  const validatorIssues = useMemo(() => validateCenterAccess(), []);
  const blocking = validatorIssues.filter(i => i.severity === 'blocking').length;
  const activeHighRisk = useMemo(() => getActiveHighRiskPrimaryNavEntries(), []);

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Readonly Control Room</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Governance-safe system overview</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
        {[
          { label: 'Navigation baseline', value: 'stable', color: 'var(--success)' },
          { label: 'Sidebar centers', value: String(centerSummary.sidebarVisible), color: 'var(--success)' },
          { label: 'Launchpad centers', value: String(centerSummary.launchpadVisible), color: '#8B5CF6' },
          { label: 'Connector Center', value: 'readonly', color: 'var(--success)' },
          { label: 'Stage C', value: 'deferred', color: 'var(--warning)' },
          { label: 'Active high-risk', value: String(activeHighRisk.length), color: activeHighRisk.length > 0 ? 'var(--danger)' : 'var(--success)' },
          { label: 'Real control buttons', value: '0', color: 'var(--success)' },
          { label: 'External writes', value: '0', color: 'var(--success)' },
          { label: 'Validator B', value: String(blocking), color: blocking > 0 ? 'var(--danger)' : 'var(--success)' },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>{k.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
