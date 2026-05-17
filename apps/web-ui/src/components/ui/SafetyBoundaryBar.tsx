import React from 'react';

export type SafetyBoundaryMode = 'readonly' | 'preview' | 'dryrun' | 'no-write';

export interface SafetyBoundaryBarProps {
  mode: SafetyBoundaryMode;
  text?: string;
}

const MODE_META: Record<SafetyBoundaryMode, { label: string; color: string }> = {
  readonly: { label: 'Read Only', color: 'var(--secondary)' },
  preview: { label: 'Preview', color: 'var(--warning)' },
  dryrun: { label: 'Dry Run', color: '#8B5CF6' },
  'no-write': { label: 'No Write', color: 'var(--warning)' },
};

export default function SafetyBoundaryBar({ mode, text }: SafetyBoundaryBarProps) {
  const meta = MODE_META[mode];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 16px',
        margin: '0 0 16px',
        borderRadius: 6,
        fontSize: 12,
        lineHeight: 1.5,
        background: 'rgba(245, 158, 11, 0.08)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        color: 'var(--text-secondary)',
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '2px 10px',
          borderRadius: 10,
          fontSize: 11,
          fontWeight: 600,
          color: '#fff',
          background: meta.color,
          whiteSpace: 'nowrap',
          lineHeight: '18px',
        }}
      >
        {meta.label}
      </span>
      {text && <span>{text}</span>}
    </div>
  );
}
