import React from 'react';
import { READINESS_CHECKLIST } from './governanceDesignSpec';

const C: Record<string, string> = {
  'ready-design-only': '#8B5CF6', 'not-implemented': '#6B7280', deferred: '#F97316', 'requires future package': '#EC4899',
};

function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, color: '#fff', background: color || '#6B7280', lineHeight: '16px', whiteSpace: 'nowrap' }}>{label}</span>
  );
}

export default function StageCReadinessChecklist() {
  return (
    <div>
      <div style={{ marginBottom: 8, fontSize: 11, color: 'var(--text-muted)' }}>
        Stage C readiness checklist — all items currently <strong>ready-design-only / not-implemented / deferred</strong>.
      </div>
      <div style={{ display: 'grid', gap: 4 }}>
        {READINESS_CHECKLIST.map(item => (
          <div key={item.item} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 4, background: 'var(--bg-surface)', border: '1px solid var(--border)', fontSize: 11 }}>
            <Badge label={item.status} color={C[item.status] || '#6B7280'} />
            <span style={{ flex: 1, color: 'var(--text-primary)' }}>{item.item}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{item.notes}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(245,158,11,0.04)', fontSize: 9, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Readiness checklist — design-only planning tool. No items are completed.
      </div>
    </div>
  );
}
