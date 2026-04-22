import React, { ReactNode } from 'react';

export interface StatItem {
  label: string;
  value: number | string;
  /** Accent color for left border strip */
  color?: string;
  onClick?: () => void;
  extra?: ReactNode;
}

export interface StatsGridProps {
  items: StatItem[];
  columns?: 2 | 3 | 4 | 6;
  className?: string;
}

export default function StatsGrid({ items, columns = 3, className = '' }: StatsGridProps) {
  return (
    <div
      className={`ui-stats-grid ${className}`}
      style={{ ['--columns' as string]: columns }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          className="ui-stat-item"
          style={item.color ? { borderLeftColor: item.color, borderLeftWidth: '3px', borderLeftStyle: 'solid' } : {}}
          onClick={item.onClick}
        >
          <div className="ui-stat-label">{item.label}</div>
          <div className="ui-stat-value">{item.value ?? '—'}</div>
          {item.extra && <div className="ui-stat-sub">{item.extra}</div>}
        </div>
      ))}
    </div>
  );
}
