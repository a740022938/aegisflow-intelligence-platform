import React, { ReactNode } from 'react';

export interface PageSubtitleProps {
  children: ReactNode;
  className?: string;
}

export default function PageSubtitle({ children, className = '' }: PageSubtitleProps) {
  return <div className={`ui-page-subtitle ${className}`}>{children}</div>;
}
