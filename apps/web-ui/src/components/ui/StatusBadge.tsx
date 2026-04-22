import React from 'react';

export interface StatusBadgeProps {
  s: string;
  color?: string;
  tone?: 'solid' | 'soft' | 'outline';
  size?: 'xs' | 'sm' | 'md';
  emptyText?: string;
  className?: string;
}

// 状态映射到 CSS 变量
const STATUS_MAP: Record<string, { color: string; bg: string }> = {
  // 成功类
  completed: { color: 'var(--success)', bg: 'var(--success-light)' },
  success: { color: 'var(--success)', bg: 'var(--success-light)' },
  ready: { color: 'var(--success)', bg: 'var(--success-light)' },
  healthy: { color: 'var(--success)', bg: 'var(--success-light)' },
  
  // 运行中类
  running: { color: 'var(--primary)', bg: 'var(--primary-light)' },
  processing: { color: 'var(--primary)', bg: 'var(--primary-light)' },
  deploying: { color: 'var(--primary)', bg: 'var(--primary-light)' },
  
  // 警告类
  pending: { color: 'var(--warning)', bg: 'var(--warning-light)' },
  queued: { color: 'var(--warning)', bg: 'var(--warning-light)' },
  
  // 危险类
  failed: { color: 'var(--danger)', bg: 'var(--danger-light)' },
  error: { color: 'var(--danger)', bg: 'var(--danger-light)' },
  unhealthy: { color: 'var(--danger)', bg: 'var(--danger-light)' },
  
  // 默认/中性类
  draft: { color: 'var(--text-muted)', bg: 'var(--bg-elevated)' },
  cancelled: { color: 'var(--text-muted)', bg: 'var(--bg-elevated)' },
  stopped: { color: 'var(--text-muted)', bg: 'var(--bg-elevated)' },
  archived: { color: 'var(--text-muted)', bg: 'var(--bg-elevated)' },
  created: { color: 'var(--text-muted)', bg: 'var(--bg-elevated)' },
  deleted: { color: 'var(--text-muted)', bg: 'var(--bg-elevated)' },
};

export { STATUS_MAP as STATUS_COLORS };

export default function StatusBadge({
  s,
  color,
  tone = 'soft',
  size = 'sm',
  emptyText = '暂无状态',
  className = '',
}: StatusBadgeProps) {
  const key = (s || '').toLowerCase();
  const mapped = STATUS_MAP[key] || { color: 'var(--text-muted)', bg: 'var(--bg-elevated)' };
  const fg = color || mapped.color;
  const softBg = mapped.bg;
  const text = s || emptyText;

  const style =
    tone === 'solid'
      ? { color: '#fff', background: fg, borderColor: fg }
      : tone === 'outline'
        ? { color: fg, background: 'transparent', borderColor: fg }
        : { color: fg, background: softBg, borderColor: softBg };

  return (
    <span
      className={`ui-status-badge ui-status-badge-${size} ui-status-badge-${tone} ${className}`}
      style={style}
    >
      {text}
    </span>
  );
}
