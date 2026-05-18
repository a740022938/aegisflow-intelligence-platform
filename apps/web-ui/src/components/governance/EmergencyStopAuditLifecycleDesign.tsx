import React from 'react';
import { EMERGENCY_STOP_AUDIT_LIFECYCLE_STAGES } from './governanceDesignSpec';

const C: Record<string, string> = {
  'design-only / no runtime effect': '#8B5CF6',
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

function StageCard({ stage, index }: { stage: { stage: string; purpose: string; status: string }; index: number }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '6px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.02)', border: '1px solid rgba(239,68,68,0.08)', marginBottom: 4, alignItems: 'center' }}>
      <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#EF4444', flexShrink: 0 }}>{index + 1}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 10, color: 'var(--text-primary)' }}>{stage.stage}</div>
        <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>{stage.purpose}</div>
      </div>
      <Badge label={stage.status} color={C[stage.status] || '#6B7280'} />
    </div>
  );
}

export default function EmergencyStopAuditLifecycleDesign() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 10, color: 'var(--text-secondary)' }}>
        Emergency Stop + Audit Lifecycle — all stages are <strong>design-only / no runtime effect</strong>. No real lifecycle engine, no state machine, no API calls.
      </div>

      <div style={{ marginBottom: 6, fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>
        Lifecycle Stages ({EMERGENCY_STOP_AUDIT_LIFECYCLE_STAGES.length})
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {EMERGENCY_STOP_AUDIT_LIFECYCLE_STAGES.map((s, i) => (
          <StageCard key={s.stage} stage={s} index={i} />
        ))}
      </div>
    </div>
  );
}
