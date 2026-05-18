import React from 'react';

const STEPS = [
  { num: 1, text: 'Keep Governance Center readonly', desc: 'No real approval, reject, execution, mutation, or deployment controls.' },
  { num: 2, text: 'Stabilize governance metadata and audit reports', desc: 'Ensure registry reflects accurate status, risk, and boundaries.' },
  { num: 3, text: 'Keep Stage C disabled until explicit closure gate', desc: 'Stage C remains deferred across all governance areas.' },
  { num: 4, text: 'Require separate Stage C design package before any real controls', desc: 'Approval, mutation, execution, deployment require dedicated governance gate.' },
  { num: 5, text: 'Require final safety audit before approval / mutation / execution features', desc: 'No feature becomes executable without separate Stage C design + safety audit.' },
];

export default function DeferredControlPath() {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Deferred Control Path</div>
      <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 8 }}>Readonly guidance — not auto-executed</div>
      <div style={{ display: 'grid', gap: 4 }}>
        {STEPS.map(s => (
          <div key={s.num} style={{ display: 'flex', gap: 10, padding: '8px 10px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border)', fontSize: 9, lineHeight: 1.5 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', background: 'rgba(139,92,246,0.1)', color: '#8B5CF6', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{s.num}</div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.text}</div>
              <div style={{ color: 'var(--text-muted)' }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(245,158,11,0.06)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <strong>Note:</strong> This is a <u>readonly deferred control path</u>. No actions are auto-initiated. This is <strong>not an approval console</strong>. Real controls require separate Stage C design package. Current Governance Center is <strong>policy review only</strong>.
      </div>
    </div>
  );
}
