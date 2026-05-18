import React, { useMemo } from 'react';
import { CONNECTOR_REGISTRY_NEW } from '../../registry/connector-registry';
import type { ConnectorRegistryItem } from '../../registry/connector-registry';

const RISK_COLORS: Record<string, string> = {
  low: 'var(--success)', medium: 'var(--warning)', high: 'var(--danger)',
};
const READINESS_COLORS: Record<string, string> = {
  ready: 'var(--success)', preview_ready: 'var(--warning)', planned: '#6B7280',
  hold_review: 'var(--danger)', blocked: '#6B7280',
};
const SAFETY_COLORS: Record<string, string> = {
  safe: 'var(--success)', watch: 'var(--warning)', risky: 'var(--danger)', blocked: '#6B7280',
};
const REVIEW_COLORS: Record<string, string> = {
  passed: 'var(--success)', preview_ok: 'var(--warning)', hold_review: 'var(--danger)', future_review: '#6B7280',
};
const EXPOSURE_LABELS: Record<string, string> = {
  sidebar: 'Sidebar', advanced_hub: 'Advanced hub', hidden_direct: 'Hidden direct', future: 'Future',
};

function Badge({ label, color }: { label: string; color?: string }) {
  return <span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: 8, fontSize: 8, fontWeight: 600, color: '#fff', background: color || '#6B7280', lineHeight: '14px', whiteSpace: 'nowrap' }}>{label}</span>;
}

function BoolIcon({ val }: { val: boolean }) {
  return <span style={{ fontWeight: 700, fontSize: 10, color: val ? 'var(--success)' : 'var(--danger)' }}>{val ? '✅' : '❌'}</span>;
}

function ConnectorRow({ conn }: { conn: ConnectorRegistryItem }) {
  const canRead = conn.actionsAllowed.some(a => a.startsWith('view_'));
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1.8fr 36px 36px 36px 36px 36px 60px 60px 60px 1fr', gap: 2, padding: '6px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.02)', fontSize: 9, alignItems: 'center', borderLeft: `3px solid ${RISK_COLORS[conn.riskLevel]}`, marginBottom: 2 }}>
      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{conn.name}</span>
      <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>{conn.capabilities.map((c, i) => <Badge key={i} label={c} color="var(--secondary)" />)}</div>
      <BoolIcon val={canRead} />
      <BoolIcon val={!conn.qualityGate.noDbWrite} />
      <BoolIcon val={!conn.qualityGate.noExternalControl} />
      <BoolIcon val={!conn.qualityGate.noDangerousActions} />
      <BoolIcon val={!conn.qualityGate.noStageC} />
      <Badge label={conn.riskLevel} color={RISK_COLORS[conn.riskLevel]} />
      <Badge label={conn.readiness} color={READINESS_COLORS[conn.readiness]} />
      <Badge label={conn.safetyStatus} color={SAFETY_COLORS[conn.safetyStatus]} />
      <span style={{ color: 'var(--text-muted)' }}>{conn.recommendedNextStep}</span>
    </div>
  );
}

export default function ConnectorCapabilityMatrix() {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Capability Matrix</div>
      <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 6 }}>Connector capabilities, I/O gates, risk, readiness, safety, and review status</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1.8fr 36px 36px 36px 36px 36px 60px 60px 60px 1fr', gap: 2, padding: '4px 8px', fontSize: 8, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2, alignItems: 'center' }}>
        <span>Connector</span><span>Capabilities</span><span style={{ textAlign: 'center' }} title="Can read">Read</span><span style={{ textAlign: 'center' }} title="Can write">Write</span><span style={{ textAlign: 'center' }} title="External I/O">Ext.IO</span><span style={{ textAlign: 'center' }} title="Local I/O">Loc.IO</span><span style={{ textAlign: 'center' }} title="Stage C gate">Stage</span><span>Risk</span><span>Ready</span><span>Safety</span><span>Next Step</span>
      </div>
      {CONNECTOR_REGISTRY_NEW.map(c => <ConnectorRow key={c.id} conn={c} />)}
      <div style={{ marginTop: 8, fontSize: 9, color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.04)' }}>
        All 8 connectors: Read=✅, Write=❌, External IO=❌, Local IO=❌, Stage=❌. Consistent with "no external write, no Stage C" governance policy.
      </div>
    </div>
  );
}
