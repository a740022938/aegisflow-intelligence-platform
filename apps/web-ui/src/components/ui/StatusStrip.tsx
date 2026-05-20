import React from 'react';
import StatusBadge from './StatusBadge';

export interface StatusStripItem {
  label: string;
  value: string;
  color?: string;
  status?: string;
}

export interface StatusStripProps {
  items: StatusStripItem[];
  className?: string;
}

export default function StatusStrip({ items, className = '' }: StatusStripProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className={`ui-status-strip ${className}`}>
      {items.map((item, i) => (
        <div key={i} className="ui-status-strip-item">
          <span className="ui-status-strip-label">{item.label}</span>
          {item.status ? (
            <StatusBadge s={item.status} />
          ) : (
            <span className="ui-status-strip-value" style={item.color ? { color: item.color } : undefined}>
              {item.value}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
