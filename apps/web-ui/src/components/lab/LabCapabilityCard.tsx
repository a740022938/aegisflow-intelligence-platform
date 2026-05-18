import React from 'react';
import type { LabRegistryItem } from '../../registry/lab-registry';

const RISK_COLORS: Record<string, string> = {
  low: 'var(--success)', medium: 'var(--warning)', high: 'var(--danger)',
};

const POSTURE_LABELS: Record<string, { label: string; color: string }> = {
  available_route: { label: 'readonly', color: 'var(--success)' },
  hold_review: { label: 'manual-only', color: 'var(--warning)' },
  planned: { label: 'planned', color: '#6B7280' },
  future: { label: 'disabled', color: '#6B7280' },
};

const READINESS_LABELS: Record<string, { label: string; color: string }> = {
  prototype: { label: 'draft', color: '#6B7280' },
  preview: { label: 'draft', color: '#6B7280' },
  lab: { label: 'stable', color: 'var(--success)' },
  hold_review: { label: 'blocked', color: 'var(--warning)' },
  future: { label: 'deferred', color: '#6B7280' },
};

function Badge({ label, color }: { label: string; color?: string }) {
  return <span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: 8, fontSize: 8, fontWeight: 600, color: '#fff', background: color || '#6B7280', lineHeight: '14px', whiteSpace: 'nowrap' }}>{label}</span>;
}

export default function LabCapabilityCard({ item }: { item: LabRegistryItem }) {
  const posture = POSTURE_LABELS[item.status] || { label: 'gated', color: '#6B7280' };
  const readiness = READINESS_LABELS[item.maturity] || { label: 'planned', color: '#6B7280' };
  const isHigh = item.riskLevel === 'high';

  return (
    <div style={{
      padding: 10, borderRadius: 6, background: 'var(--bg-surface)',
      border: `1px solid ${isHigh ? 'var(--danger)' : 'var(--border)'}`,
      borderLeft: `3px solid ${RISK_COLORS[item.riskLevel]}`,
      fontSize: 9, marginBottom: 6, lineHeight: 1.6,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 11 }}>{item.name}</span>
        <Badge label={item.type} color="#6B7280" />
        <Badge label={posture.label} color={posture.color} />
        <Badge label={`readiness: ${readiness.label}`} color={readiness.color} />
        <Badge label={item.riskLevel} color={RISK_COLORS[item.riskLevel]} />
        {isHigh && <Badge label="high-gated" color="var(--danger)" />}
      </div>
      <div style={{ marginBottom: 2 }}>
        {item.capabilities.map((c, i) => <Badge key={i} label={c} color="var(--secondary)" />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 4, marginBottom: 2 }}>
        <div><span style={{ color: 'var(--text-muted)' }}>exec:</span> <span style={{ fontWeight: 600, color: 'var(--success)' }}>none</span></div>
        <div><span style={{ color: 'var(--text-muted)' }}>data:</span> <span style={{ fontWeight: 600, color: 'var(--success)' }}>no live IO</span></div>
        <div><span style={{ color: 'var(--text-muted)' }}>write:</span> <span style={{ fontWeight: 600, color: 'var(--success)' }}>{item.actionsAllowed.some(a => a.includes('write') || a.includes('save') || a.includes('overwrite')) ? 'disabled' : 'none'}</span></div>
        <div><span style={{ color: 'var(--text-muted)' }}>gate:</span> <span style={{ fontWeight: 600, color: item.actionsBlocked.includes('enable_stage_c') ? 'var(--success)' : 'var(--danger)' }}>{item.actionsBlocked.includes('enable_stage_c') ? 'none' : 'Stage C'}</span></div>
      </div>
      <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginBottom: 2 }}>
        {item.safetyBoundary.map(s => <Badge key={s} label={s} color="#6B7280" />)}
      </div>
      <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{item.notes}</div>
    </div>
  );
}
