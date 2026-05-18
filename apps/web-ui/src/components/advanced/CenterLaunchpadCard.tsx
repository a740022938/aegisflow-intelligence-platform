import React, { useState } from 'react';
import type { CenterAccessItem } from '../../registry/center-access-registry';

const KIND_LABELS: Record<string, string> = {
  advanced: 'Advanced Mode', connector: 'Connector Center', lab: 'Lab Center',
  governance: 'Governance Center', navigation_preview: 'Navigation Preview',
};
const KIND_COLORS: Record<string, string> = {
  advanced: '#F97316', connector: '#22C55E', lab: '#3B82F6', governance: '#22C55E', navigation_preview: '#8B5CF6',
};
const RISK_COLORS: Record<string, string> = {
  low: 'var(--success)', medium: 'var(--warning)', high: 'var(--danger)',
};
const READINESS_COLORS: Record<string, string> = {
  ready: 'var(--success)', preview_ready: 'var(--warning)', hold_review: 'var(--danger)', blocked: '#6B7280',
};

function Badge({ label, color }: { label: string; color?: string }) {
  return <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600, color: '#fff', background: color || '#6B7280', lineHeight: '16px', whiteSpace: 'nowrap' }}>{label}</span>;
}

export default function CenterLaunchpadCard({ center }: { center: CenterAccessItem }) {
  const [expanded, setExpanded] = useState(false);
  const needsTransition = center.accessLevel !== center.recommendedAccessLevel;

  return (
    <div
      style={{
        padding: 14, borderRadius: 8, background: 'var(--bg-surface)',
        border: '1px solid var(--border)', borderLeft: `4px solid ${RISK_COLORS[center.risk]}`,
        fontSize: 10, marginBottom: 8, cursor: 'pointer',
      }}
      onClick={() => setExpanded(e => !e)}
    >
      {/* Layer 1: Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>{center.name}</span>
        <Badge label={KIND_LABELS[center.kind]} color={KIND_COLORS[center.kind]} />
        <Badge label={center.readiness} color={READINESS_COLORS[center.readiness]} />
        <Badge label={center.risk} color={RISK_COLORS[center.risk]} />
        <Badge label={center.operationalMode} color="#6B7280" />
      </div>

      {/* Layer 2: Exposure Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 9 }}>Current:</span>
        <Badge label={center.accessLevel} color="#6B7280" />
        {needsTransition && (
          <>
            <span style={{ color: 'var(--text-muted)', fontSize: 9 }}>→</span>
            <Badge label={center.recommendedAccessLevel} color="#F97316" />
            <span style={{ fontSize: 8, color: 'var(--warning)', fontStyle: 'italic' }}>transition pending</span>
          </>
        )}
      </div>

      {/* Layer 3: Availability Row */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
        {center.visibleInSidebar ? (
          <Badge label="Sidebar visible" color="var(--success)" />
        ) : (
          <Badge label="Sidebar hidden" color="var(--warning)" />
        )}
        {center.launchpadVisible && <Badge label="Launchpad visible" color="#8B5CF6" />}
        {center.advancedHubVisible && <Badge label="Advanced hub" color="#F97316" />}
        {center.directUrlAllowed && <Badge label="Direct route" color="#6B7280" />}
        {center.allowedNow ? (
          <Badge label="Allowed now" color="var(--success)" />
        ) : (
          <Badge label="Not allowed now" color="var(--warning)" />
        )}
      </div>

      {/* Layer 4: Governance Note (expandable) */}
      {expanded && (
        <div style={{ marginTop: 6, padding: 8, borderRadius: 4, background: 'rgba(0,0,0,0.08)', fontSize: 9, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <div style={{ marginBottom: 2, color: 'var(--text-muted)', fontSize: 8 }}>Governance note</div>
          <div style={{ marginBottom: 4 }}>{center.exposureReason}</div>
          {center.releaseGate.length > 0 && (
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 2 }}>
              <span style={{ color: 'var(--text-muted)' }}>Gates:</span>
              {center.releaseGate.map(g => <Badge key={g} label={g} color="#6B7280" />)}
            </div>
          )}
          <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Rollback: {center.rollbackPlan}</div>
        </div>
      )}

      {!expanded && (
        <div style={{ fontSize: 8, color: 'var(--text-muted)', marginTop: 2 }}>Click to expand governance note</div>
      )}
    </div>
  );
}
