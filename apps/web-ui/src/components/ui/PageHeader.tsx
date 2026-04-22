import React, { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  prefix?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  summaryStrip?: ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  prefix,
  actions,
  meta,
  summaryStrip,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`ui-page-header-wrap ${className}`}>
      <div className="ui-page-header">
        <div className="ui-page-header-left">
          {prefix && <div className="ui-page-prefix">{prefix}</div>}
          <h2 className="ui-page-title">{title}</h2>
          {subtitle && <div className="ui-page-subtitle">{subtitle}</div>}
          {meta && <div className="ui-page-meta">{meta}</div>}
        </div>
        {actions && <div className="ui-page-actions">{actions}</div>}
      </div>
      {summaryStrip && <div className="ui-page-summary-strip">{summaryStrip}</div>}
    </div>
  );
}
