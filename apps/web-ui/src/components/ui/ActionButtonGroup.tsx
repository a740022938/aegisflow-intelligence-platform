import React from 'react';

export interface ActionItem {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  disabled?: boolean;
}

export interface ActionButtonGroupProps {
  actions: ActionItem[];
  size?: 'sm' | 'md';
  className?: string;
}

const VARIANT_COLORS: Record<NonNullable<ActionItem['variant']>, { bg: string; color: string; border?: string }> = {
  default:  { bg: '#f3f4f6', color: '#374151' },
  primary:  { bg: '#dbeafe', color: '#1d4ed8' },
  danger:   { bg: '#fee2e2', color: '#991b1b' },
  success:  { bg: '#d1fae5', color: '#065f46' },
  warning:  { bg: '#fef3c7', color: '#92400e' },
};

export default function ActionButtonGroup({ actions, size = 'sm', className = '' }: ActionButtonGroupProps) {
  return (
    <div className={`action-group ${className}`} style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
      {actions.map((action, i) => {
        const v = action.variant || 'default';
        const colors = VARIANT_COLORS[v];
        const padding = size === 'sm' ? '3px 8px' : '5px 12px';
        const fontSize = size === 'sm' ? '11px' : '13px';
        return (
          <button
            key={i}
            onClick={action.onClick}
            disabled={action.disabled}
            style={{
              padding,
              borderRadius: '4px',
              border: 'none',
              background: colors.bg,
              color: colors.color,
              fontSize,
              fontWeight: 700,
              cursor: action.disabled ? 'not-allowed' : 'pointer',
              opacity: action.disabled ? 0.5 : 1,
              fontFamily: 'var(--font-sans)',
            }}
          >
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
