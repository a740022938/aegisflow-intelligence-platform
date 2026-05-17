import React from 'react';
import PageHeader from './PageHeader';
import SafetyBoundaryBar from './SafetyBoundaryBar';
import type { SafetyBoundaryMode } from './SafetyBoundaryBar';

export interface PageShellProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  versionLabel?: string;
  maturity?: 'stable' | 'preview' | 'lab' | 'external' | 'archived';
  safetyBoundary?: SafetyBoundaryMode;
  safetyText?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

const MATURITY_META: Record<string, { label: string; color: string }> = {
  stable: { label: 'Stable', color: 'var(--success)' },
  preview: { label: 'Preview', color: 'var(--warning)' },
  lab: { label: 'Lab', color: 'var(--secondary)' },
  external: { label: 'External', color: '#8B5CF6' },
  archived: { label: 'Archived', color: 'var(--text-muted)' },
};

export default function PageShell({
  title,
  subtitle,
  eyebrow,
  versionLabel,
  maturity,
  safetyBoundary,
  safetyText,
  actions,
  children,
}: PageShellProps) {
  const maturityMeta = maturity ? MATURITY_META[maturity] : null;

  return (
    <div className="page-shell-root">
      <PageHeader
        title={title}
        subtitle={subtitle}
        prefix={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {eyebrow && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {eyebrow}
              </span>
            )}
            {versionLabel && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {versionLabel}
              </span>
            )}
            {maturityMeta && (
              <span
                style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#fff',
                  background: maturityMeta.color,
                  lineHeight: '16px',
                }}
              >
                {maturityMeta.label}
              </span>
            )}
          </div>
        }
        actions={actions}
      />
      {safetyBoundary && (
        <SafetyBoundaryBar mode={safetyBoundary} text={safetyText} />
      )}
      <div className="page-shell-content">
        {children}
      </div>
    </div>
  );
}
