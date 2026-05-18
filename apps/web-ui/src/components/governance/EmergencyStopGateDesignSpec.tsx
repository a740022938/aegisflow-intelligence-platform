import React from 'react';
import { EMERGENCY_STOP_DESIGN_FIELDS } from './governanceDesignSpec';

const C: Record<string, string> = {
  'design-only': '#8B5CF6', disabled: '#6B7280', none: 'var(--success)',
  'Stage C deferred': '#F97316',
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

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '3px 0', fontSize: 10, borderBottom: '1px solid var(--border)' }}>
      <span style={{ width: 130, flexShrink: 0, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

export default function EmergencyStopGateDesignSpec() {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 10, color: 'var(--text-secondary)' }}>
        Emergency Stop Gate is <strong>design-only</strong>. Stage C is <strong>not enabled</strong>. No stop, pause, kill, taskkill, restart, disable, shutdown, rollback, deployment or service-control action is available. Current status: <strong>readonly design spec</strong> — no runtime effect.
      </div>

      <div style={{ marginBottom: 6, fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>
        Emergency Stop Gate Design Fields ({EMERGENCY_STOP_DESIGN_FIELDS.length})
      </div>

      {EMERGENCY_STOP_DESIGN_FIELDS.slice(0, expanded ? undefined : 3).map(f => (
        <div key={f.field} style={{ marginBottom: 6, padding: 6, borderRadius: 4, background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.1)' }}>
          <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>{f.field}</div>
          <DetailRow label="Purpose" value={f.purpose} />
          <DetailRow label="Status" value={<Badge label={f.status} color={C[f.status] || '#6B7280'} />} />
          <DetailRow label="Runtime effect" value={<Badge label={f.runtimeEffect} color={C[f.runtimeEffect] || '#6B7280'} />} />
          <DetailRow label="Stop permission" value={<Badge label={f.stopPermission} color={C[f.stopPermission] || '#6B7280'} />} />
          <DetailRow label="Service control" value={<Badge label={f.serviceControl} color={C[f.serviceControl] || '#6B7280'} />} />
          <DetailRow label="Taskkill path" value={<Badge label={f.taskkillPath} color={C[f.taskkillPath] || '#6B7280'} />} />
          <DetailRow label="Stage gate" value={<Badge label={f.stageGate} color={C[f.stageGate] || '#6B7280'} />} />
          <DetailRow label="Blocked actions" value={<span style={{ color: 'var(--danger)' }}>{f.blockedActions}</span>} />
          <DetailRow label="Future requirement" value={f.futureRequirement} />
        </div>
      ))}

      {EMERGENCY_STOP_DESIGN_FIELDS.length > 3 && (
        <button onClick={() => setExpanded(!expanded)} style={{ marginTop: 4, padding: '4px 12px', fontSize: 10, cursor: 'pointer', border: '1px solid var(--border)', borderRadius: 4, background: 'transparent', color: 'var(--text-secondary)' }}>
          {expanded ? 'Show less' : `Show all ${EMERGENCY_STOP_DESIGN_FIELDS.length} fields`}
        </button>
      )}
    </div>
  );
}
