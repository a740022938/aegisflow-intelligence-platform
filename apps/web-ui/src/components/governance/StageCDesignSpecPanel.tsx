import React from 'react';
import { STAGE_C_DESIGN_MODULES } from './governanceDesignSpec';

const C: Record<string, string> = {
  'deferred / design-only': '#8B5CF6', disabled: '#6B7280', none: 'var(--success)',
};

function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, color: '#fff', background: color || '#6B7280', lineHeight: '16px', whiteSpace: 'nowrap' }}>{label}</span>
  );
}

export default function StageCDesignSpecPanel() {
  return (
    <div>
      <div style={{ padding: '8px 12px', marginBottom: 10, borderRadius: 4, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        <strong>Stage C is not enabled.</strong> This is a design specification only. No approval, mutation, execution, deployment, sync, or service-control action is available.
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {STAGE_C_DESIGN_MODULES.map(m => (
          <div key={m.moduleName} style={{ padding: '10px 14px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderLeft: '3px solid #8B5CF6', fontSize: 11 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 12 }}>{m.moduleName}</span>
              <Badge label={m.currentStatus} color={C[m.currentStatus] || '#6B7280'} />
            </div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{m.purpose}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 10, color: 'var(--text-muted)' }}>
              <span>Runtime: <strong style={{ color: '#6B7280' }}>{m.runtimeControl}</strong></span>
              <span>Write: <strong style={{ color: 'var(--success)' }}>{m.writePermission}</strong></span>
              <span>Future gate: {m.requiredFutureGate}</span>
              <span>Blocked until: {m.blockedUntil}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(245,158,11,0.06)', fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Stage C design specification — no runtime controls enabled. All modules are deferred.
      </div>
    </div>
  );
}
