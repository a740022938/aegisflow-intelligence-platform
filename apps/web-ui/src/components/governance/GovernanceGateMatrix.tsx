import React, { useMemo } from 'react';
import { GOVERNANCE_REGISTRY } from '../../registry/governance-registry';

const RISK_COLORS: Record<string, string> = {
  low: 'var(--success)', medium: 'var(--warning)', high: 'var(--danger)', critical: '#7C3AED',
};

const GOVERNANCE_AREAS = [
  {
    area: 'Center access',
    items: ['cost-routing', 'menu-governance', 'registry-parity'],
    currentMode: 'readonly', approval: false, write: false, execute: false, extIO: false,
    stageGate: 'none', risk: 'low', status: 'stable',
  },
  {
    area: 'Navigation exposure',
    items: ['registry-render-preview', 'menu-move-dry-run'],
    currentMode: 'readonly', approval: false, write: false, execute: false, extIO: false,
    stageGate: 'none', risk: 'low', status: 'stable',
  },
  {
    area: 'Memory candidate',
    items: ['memory-hub-boundary'],
    currentMode: 'preview', approval: false, write: false, execute: false, extIO: false,
    stageGate: 'Stage C deferred', risk: 'medium', status: 'deferred',
  },
  {
    area: 'Connector write',
    items: ['connector-lab-boundary'],
    currentMode: 'preview', approval: false, write: false, execute: false, extIO: false,
    stageGate: 'Stage C deferred', risk: 'medium', status: 'deferred',
  },
  {
    area: 'Lab execution',
    items: ['connector-lab-boundary'],
    currentMode: 'preview', approval: false, write: false, execute: false, extIO: false,
    stageGate: 'Stage C deferred', risk: 'medium', status: 'deferred',
  },
  {
    area: 'Deployment',
    items: ['release-readiness'],
    currentMode: 'disabled', approval: false, write: false, execute: false, extIO: false,
    stageGate: 'Stage C deferred', risk: 'high', status: 'disabled',
  },
  {
    area: 'Release / tag',
    items: ['release-readiness', 'self-check-quality-gate'],
    currentMode: 'disabled', approval: false, write: false, execute: false, extIO: false,
    stageGate: 'Manual only', risk: 'high', status: 'disabled',
  },
  {
    area: 'Service control',
    items: ['assistant-center-boundary', 'memory-hub-boundary'],
    currentMode: 'disabled', approval: false, write: false, execute: false, extIO: false,
    stageGate: 'Stage C deferred', risk: 'high', status: 'disabled',
  },
];

function BoolCell({ ok }: { ok: boolean }) {
  return <span style={{ fontWeight: 600, fontSize: 10, color: ok ? 'var(--danger)' : 'var(--success)' }}>{ok ? 'yes' : 'no'}</span>;
}

function StatusBadge({ label, color }: { label: string; color?: string }) {
  return <span style={{ fontWeight: 600, fontSize: 9, color: color || 'var(--text-muted)' }}>{label}</span>;
}

export default function GovernanceGateMatrix() {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Governance Gate Matrix</div>
      <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 6 }}>Governance area-level matrix — all approval/write/execute default no/no/no</div>
      <div style={{ display: 'grid', gap: 2, fontSize: 9, overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 60px 50px 50px 50px 60px 90px 60px 60px', gap: 4, padding: '4px 8px', color: 'var(--text-muted)', fontWeight: 600, alignItems: 'center', minWidth: 600 }}>
          <span>Governance Area</span><span>Mode</span><span>Approval</span><span>Write</span><span>Execute</span><span>Ext.IO</span><span>Stage Gate</span><span>Risk</span><span>Status</span>
        </div>
        {GOVERNANCE_AREAS.map(a => (
          <div key={a.area} style={{ display: 'grid', gridTemplateColumns: '1.3fr 60px 50px 50px 50px 60px 90px 60px 60px', gap: 4, padding: '5px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.02)', alignItems: 'center', minWidth: 600 }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.area}</span>
            <StatusBadge label={a.currentMode} color={a.currentMode === 'readonly' ? 'var(--success)' : a.currentMode === 'preview' ? 'var(--warning)' : '#6B7280'} />
            <BoolCell ok={a.approval} />
            <BoolCell ok={a.write} />
            <BoolCell ok={a.execute} />
            <BoolCell ok={a.extIO} />
            <StatusBadge label={a.stageGate} color={a.stageGate === 'none' ? 'var(--success)' : a.stageGate === 'Manual only' ? '#8B5CF6' : 'var(--warning)'} />
            <StatusBadge label={a.risk} color={RISK_COLORS[a.risk]} />
            <StatusBadge label={a.status} color={a.status === 'stable' ? 'var(--success)' : a.status === 'deferred' ? 'var(--warning)' : '#6B7280'} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, fontSize: 9, color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.04)' }}>
        All {GOVERNANCE_AREAS.length} governance areas: Approval=no, Write=no, Execute=no, External IO=no. Stage C deferred across gated areas. Consistent with readonly governance policy.
      </div>
    </div>
  );
}
