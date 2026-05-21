import React, { ReactNode } from 'react';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  retryLabel?: string;
  onRetry?: () => void;
  children?: ReactNode;
  className?: string;
}

export default function ErrorState({
  title = 'An error occurred',
  description,
  icon = '❌',
  retryLabel = 'Retry',
  onRetry,
  children,
  className = '',
}: ErrorStateProps) {
  return (
    <div className={`ui-empty-state ${className}`} style={{ gap: 8 }}>
      <div className="ui-empty-icon" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
        {icon}
      </div>
      <div className="ui-empty-title" style={{ color: 'var(--danger)' }}>
        {title}
      </div>
      {description && <div className="ui-empty-desc">{description}</div>}
      {children}
      {onRetry && (
        <div className="ui-empty-actions">
          <button className="ui-btn ui-btn-primary" type="button" onClick={onRetry}>
            {retryLabel}
          </button>
        </div>
      )}
    </div>
  );
}
