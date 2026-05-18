import React from 'react';

const STEPS = [
  { num: 1, text: 'Keep Lab Center readonly', desc: 'No executable lab controls, no training, no inference.' },
  { num: 2, text: 'Stabilize lab capability metadata', desc: 'Ensure registry reflects accurate readiness and safety boundaries.' },
  { num: 3, text: 'Add manual verification reports', desc: 'Lab items remain report-only — no automatic execution.' },
  { num: 4, text: 'Keep experiments report-only until governance gate', desc: 'No experiment becomes executable without Stage C governance.' },
  { num: 5, text: 'Defer executable lab controls to Stage C', desc: 'Real training, inference, dataset write require separate governance gate.' },
];

export default function LabRecommendedPath() {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Recommended Lab Path</div>
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
        <strong>Note:</strong> This is a <u>readonly recommended path</u>. No actions are auto-initiated. Real experiment execution requires Stage C governance gate. Current Lab Center is <strong>not an experiment execution console</strong>.
      </div>
    </div>
  );
}
