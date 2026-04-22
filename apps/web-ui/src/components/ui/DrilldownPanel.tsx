// v5.1.0 — Drilldown Panel (generic)
import React, { useState } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  loading?: boolean;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  compact?: boolean;
  height?: string;
}

export default function DrilldownPanel({ title, subtitle, loading, children, actions, compact, height }: Props) {
  const [expanded, setExpanded] = useState(!compact);

  return (
    <div style={{
      border: '1.5px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      background: 'var(--bg-surface)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 14px', cursor: 'pointer', userSelect: 'none',
          borderBottom: expanded ? '1px solid var(--border)' : 'none',
          background: 'var(--bg-app)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {loading ? (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>加载中...</span>
          ) : (
            <span style={{ fontSize: 16 }}>{expanded ? '▼' : '▶'}</span>
          )}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{title}</div>
            {subtitle && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{subtitle}</div>}
          </div>
        </div>
        {actions && <div style={{ display: 'flex', gap: 6 }}>{actions}</div>}
      </div>

      {/* Body */}
      {expanded && (
        <div style={{
          padding: '12px 14px', maxHeight: height || 'none',
          overflowY: height ? 'auto' : 'visible',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: 12 }}>
              加载中...
            </div>
          ) : children}
        </div>
      )}
    </div>
  );
}
