import React, { useMemo } from 'react';
import { getGovernanceRegistrySummary, validateGovernanceRegistry } from '../../registry/governance-registry-validator';
import { GOVERNANCE_REGISTRY } from '../../registry/governance-registry';

export default function GovernanceCenterOverview() {
  const summary = useMemo(() => getGovernanceRegistrySummary(), []);
  const validator = useMemo(() => validateGovernanceRegistry(), []);
  const allGates = useMemo(() => GOVERNANCE_REGISTRY.flatMap(m => m.gates || []), []);

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Governance Center</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Readonly Stage C governance preview</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 12 }}>
        {[
          { label: 'Governance posture', value: 'readonly preview', color: 'var(--success)' },
          { label: 'Stage C', value: 'deferred', color: 'var(--warning)' },
          { label: 'Approval controls', value: '0', color: 'var(--success)' },
          { label: 'Execution controls', value: '0', color: 'var(--success)' },
          { label: 'Mutation paths', value: '0', color: 'var(--success)' },
          { label: 'External writes', value: '0', color: 'var(--success)' },
          { label: 'Recommended mode', value: 'Policy review only', color: 'var(--warning)' },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>{k.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 8 }}>
        {[
          { label: 'Modules', value: String(summary.totalModules), color: 'var(--primary)' },
          { label: 'Gates', value: String(allGates.length), color: 'var(--secondary)' },
          { label: 'Validator', value: validator.pass ? 'PASS' : 'FAIL', color: validator.pass ? 'var(--success)' : 'var(--danger)' },
          { label: 'Blocking', value: String(validator.blockingCount), color: validator.blockingCount > 0 ? 'var(--danger)' : 'var(--success)' },
          { label: 'Warning', value: String(validator.warningCount), color: validator.warningCount > 0 ? 'var(--warning)' : 'var(--success)' },
          { label: 'High risk', value: String(summary.byRiskLevel['high'] || 0), color: 'var(--danger)' },
          { label: 'Approval req', value: String(summary.approvalRequiredCount), color: '#F97316' },
          { label: 'Ext write blocked', value: String(summary.externalWriteBlockedCount), color: 'var(--danger)' },
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
