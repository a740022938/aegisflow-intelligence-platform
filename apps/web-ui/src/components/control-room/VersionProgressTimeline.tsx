import React from 'react';

const VERSIONS = [
  { tag: 'v7.21.0-D1', label: 'Access Strategy Design', status: 'completed' },
  { tag: 'v7.21.0-P1', label: 'Center Access Registry Polish', status: 'completed' },
  { tag: 'v7.21.0-P2', label: 'Advanced Mode Launchpad Section', status: 'completed' },
  { tag: 'v7.21.0-P4', label: 'Access Level Matrix UI Polish', status: 'completed' },
  { tag: 'v7.21.0-P4a', label: 'Advanced Launchpad UI Completion', status: 'completed' },
  { tag: 'v7.21.0-P5', label: 'Navigation Exposure Audit', status: 'completed' },
  { tag: 'v7.21.0-P5a', label: 'Pre-Closure Consistency Fix', status: 'completed' },
  { tag: 'v7.21.0-P5b', label: 'Final Closure / Validator Reclass', status: 'completed' },
  { tag: 'v7.22.0-P1', label: 'Center Launchpad UX', status: 'completed' },
  { tag: 'v7.22.0-P2', label: 'Connector Center Detail Polish', status: 'completed' },
  { tag: 'v7.22.0-P3', label: 'Readonly Control Room', status: 'current' },
];

const STATUS_COLORS: Record<string, string> = {
  completed: 'var(--success)',
  current: '#8B5CF6',
  planned: '#6B7280',
};

export default function VersionProgressTimeline() {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Version Progress / Closure Timeline</div>
      <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 8 }}>Static version history — readonly. No tag or release.</div>
      <div style={{ display: 'grid', gap: 2, fontSize: 9 }}>
        {VERSIONS.map((v, i) => (
          <div key={v.tag} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 80px', gap: 8, padding: '5px 8px', borderRadius: 4, background: v.status === 'current' ? 'rgba(139,92,246,0.06)' : 'rgba(255,255,255,0.02)', borderLeft: v.status === 'current' ? '3px solid #8B5CF6' : '3px solid transparent', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: v.status === 'current' ? '#8B5CF6' : 'var(--text-primary)' }}>{v.tag}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{v.label}</span>
            <span style={{ fontWeight: 600, color: STATUS_COLORS[v.status], textAlign: 'right' }}>{v.status}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, fontSize: 9, color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.02)' }}>
        No git tag or GitHub Release was created for any phase. All version labels are static metadata.
      </div>
    </div>
  );
}
