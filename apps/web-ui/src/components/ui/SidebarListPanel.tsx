import React, { ReactNode } from 'react';

export interface SidebarListPanelProps {
  left: ReactNode;
  right: ReactNode;
  leftWidth?: number;
  className?: string;
}

export default function SidebarListPanel({ left, right, leftWidth = 360, className = '' }: SidebarListPanelProps) {
  return (
    <div className={`ui-split-layout ${className}`}>
      <div className="ui-split-sidebar" style={{ width: leftWidth, minWidth: leftWidth }}>
        {left}
      </div>
      <div className="ui-split-content">
        {right}
      </div>
    </div>
  );
}
