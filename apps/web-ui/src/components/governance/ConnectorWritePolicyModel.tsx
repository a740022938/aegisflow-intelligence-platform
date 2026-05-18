import React from 'react';
import { CONNECTOR_POLICY_ENTRIES } from './governanceDesignSpec';

const C: Record<string, string> = {
  low: 'var(--success)', medium: 'var(--warning)', high: 'var(--danger)',
};

function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 10,
      fontWeight: 600, color: '#fff', background: color || '#6B7280',
      lineHeight: '16px', whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

export default function ConnectorWritePolicyModel() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', fontSize: 10, color: 'var(--text-secondary)' }}>
        Connector Write Policy Model is <strong>design-only</strong>. All connectors have <strong>no write permission</strong>. No external write path is active. Stage C is deferred for all connectors.
      </div>

      <div style={{ marginBottom: 6, fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>
        Connector Write Policy Entries ({CONNECTOR_POLICY_ENTRIES.length})
      </div>

      <div style={{ display: 'grid', gap: 2, fontSize: 9, overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 70px 1fr 70px 1.2fr 1.2fr 1.2fr', gap: 6, padding: '5px 8px', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)', minWidth: 900 }}>
          <span>Connector</span><span>Write Posture</span><span>Ext.IO Posture</span><span>Allowed Write</span><span>Future Gate</span><span>Risk</span><span>Blocked Actions</span><span>Audit Evidence</span><span>Rollback</span>
        </div>
        {CONNECTOR_POLICY_ENTRIES.map(e => (
          <div key={e.connectorName} style={{
            display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 70px 1fr 70px 1.2fr 1.2fr 1.2fr', gap: 6,
            padding: '5px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.02)', alignItems: 'center', minWidth: 900,
            borderLeft: `3px solid ${C[e.riskClass] || 'var(--border)'}`,
          }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{e.connectorName}</span>
            <span style={{ color: '#8B5CF6' }}>{e.currentWritePosture}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{e.externalIOPosture}</span>
            <span style={{ color: e.allowedWrite === 'no' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{e.allowedWrite}</span>
            <span style={{ color: 'var(--warning)' }}>{e.requiredFutureGate}</span>
            <Badge label={e.riskClass} color={C[e.riskClass] || '#6B7280'} />
            <span style={{ color: 'var(--danger)' }}>{e.blockedActions}</span>
            <span style={{ color: 'var(--text-muted)' }}>{e.auditEvidenceRequired}</span>
            <span style={{ color: 'var(--text-muted)' }}>{e.rollbackRequirement}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <strong>注意：</strong> 所有 connector 的 <code>allowedWrite = no</code>。没有任何 connector 具有真实写入能力。所有外部 IO 均被禁用或门控。Stage C deferred。
      </div>
    </div>
  );
}
