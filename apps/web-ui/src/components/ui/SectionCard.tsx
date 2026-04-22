import React, { ReactNode, CSSProperties } from 'react';

export interface SectionCardProps {
  title?: string;
  subtitle?: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  style?: CSSProperties;
}

export default function SectionCard({
  title,
  subtitle,
  description,
  meta,
  actions,
  children,
  footer,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  style,
}: SectionCardProps) {
  const hasHeader = Boolean(title || subtitle || description || meta || actions);

  return (
    <div className={`ui-section-card ${className}`} style={style}>
      {hasHeader && (
        <div className={`ui-section-header ${headerClassName}`}>
          <div className="ui-section-header-main">
            {title && <span className="ui-section-title">{title}</span>}
            {subtitle && <div className="ui-section-subtitle">{subtitle}</div>}
            {description && <div className="ui-section-description">{description}</div>}
            {meta && <div className="ui-section-meta">{meta}</div>}
          </div>
          {actions && <div className="ui-section-actions">{actions}</div>}
        </div>
      )}
      <div className={`ui-section-body ${bodyClassName}`}>{children}</div>
      {footer && <div className="ui-section-footer">{footer}</div>}
    </div>
  );
}
