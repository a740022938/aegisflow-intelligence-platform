import React, { ReactNode } from 'react';

export interface ToolbarRowProps {
  children: ReactNode;
  className?: string;
  left?: ReactNode;
  right?: ReactNode;
}

export default function ToolbarRow({ children, className = '', left, right }: ToolbarRowProps) {
  if (left || right) {
    return (
      <div className={`ui-toolbar ${className}`}>
        {left && <div className="ui-toolbar-left">{left}</div>}
        {right && <div className="ui-toolbar-right">{right}</div>}
      </div>
    );
  }
  return (
    <div className={`ui-toolbar ${className}`}>{children}</div>
  );
}
