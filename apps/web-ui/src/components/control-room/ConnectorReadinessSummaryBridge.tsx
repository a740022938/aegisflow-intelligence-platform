import React, { useMemo } from 'react';
import {
  getConnectorRegistryCount,
  getConnectorRegistryByCategory,
  getConnectorRegistryByRisk,
  getConnectorRegistryRiskSummary,
} from '../../registry/connector-registry';

export default function ConnectorReadinessSummaryBridge() {
  const total = useMemo(() => getConnectorRegistryCount(), []);
  const active = useMemo(() => getConnectorRegistryByCategory('active'), []);
  const future = useMemo(() => getConnectorRegistryByCategory('future'), []);
  const riskSummary = useMemo(() => getConnectorRegistryRiskSummary(), []);
  const highRisk = useMemo(() => getConnectorRegistryByRisk('high'), []);

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Connector Readiness Summary</div>
      <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 8 }}>P2 connector center overview — abstracted</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8, marginBottom: 10 }}>
        {[
          { label: 'Total', value: String(total), color: 'var(--primary)' },
          { label: 'Active', value: String(active.length), color: 'var(--success)' },
          { label: 'Future', value: String(future.length), color: 'var(--warning)' },
          { label: 'Low risk', value: String(riskSummary.low), color: 'var(--success)' },
          { label: 'High risk', value: String(highRisk.length), color: highRisk.length > 0 ? 'var(--danger)' : 'var(--success)' },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 8, color: 'var(--text-muted)', marginBottom: 1 }}>{k.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6, padding: '6px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.04)' }}>
        Connector Center = <strong>readonly</strong> overview. External write paths = <strong>0</strong>. Real connector controls = <strong>0</strong>. Stage C connector controls = <strong>0</strong>.
        Recommended next step: keep connector metadata baseline stable.
      </div>
    </div>
  );
}
