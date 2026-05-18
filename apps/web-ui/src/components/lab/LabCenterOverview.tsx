import React, { useMemo } from 'react';
import {
  getLabRegistryCount,
  getLabRegistryAvailableRoutes,
  getLabRegistryHoldReviewItems,
  getLabRegistryFutureItems,
  getLabRegistryByRisk,
  getLabRegistryQualityGateSummary,
} from '../../registry/lab-registry';

export default function LabCenterOverview() {
  const total = useMemo(() => getLabRegistryCount(), []);
  const availableRoutes = useMemo(() => getLabRegistryAvailableRoutes(), []);
  const holdReview = useMemo(() => getLabRegistryHoldReviewItems(), []);
  const future = useMemo(() => getLabRegistryFutureItems(), []);
  const lowRisk = useMemo(() => getLabRegistryByRisk('low'), []);
  const mediumRisk = useMemo(() => getLabRegistryByRisk('medium'), []);
  const highRisk = useMemo(() => getLabRegistryByRisk('high'), []);
  const quality = useMemo(() => getLabRegistryQualityGateSummary(), []);

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Lab Center</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Readonly experiment and capability overview</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 12 }}>
        {[
          { label: 'Lab posture', value: 'readonly', color: 'var(--success)' },
          { label: 'Executable experiments', value: '0', color: 'var(--success)' },
          { label: 'Training jobs', value: '0', color: 'var(--success)' },
          { label: 'External writes', value: '0', color: 'var(--success)' },
          { label: 'Stage C controls', value: 'disabled', color: 'var(--success)' },
          { label: 'Recommended mode', value: 'Manual verification only', color: 'var(--warning)' },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>{k.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 8 }}>
        {[
          { label: 'Total lab items', value: String(total), color: 'var(--primary)' },
          { label: 'Available', value: String(availableRoutes.length), color: 'var(--success)' },
          { label: 'Hold review', value: String(holdReview.length), color: 'var(--warning)' },
          { label: 'Future', value: String(future.length), color: '#6B7280' },
          { label: 'Low risk', value: String(lowRisk.length), color: 'var(--success)' },
          { label: 'Medium risk', value: String(mediumRisk.length), color: 'var(--warning)' },
          { label: 'High risk', value: String(highRisk.length), color: 'var(--danger)' },
          { label: 'Quality all pass', value: String(quality.passedAll), color: 'var(--success)' },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 8, color: 'var(--text-muted)', marginBottom: 1 }}>{k.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
