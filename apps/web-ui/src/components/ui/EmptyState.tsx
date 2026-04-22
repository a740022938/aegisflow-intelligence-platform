import React, { ReactNode } from 'react';

export interface EmptyStateProps {
  message?: string;
  title?: string;
  description?: string;
  icon?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  message,
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
  action,
  className = '',
}: EmptyStateProps) {
  const resolvedTitle = title || message || '暂无内容';
  const resolvedDescription = description || '';

  return (
    <div className={`ui-empty-state ${className}`}>
      {icon && <div className="ui-empty-icon">{icon}</div>}
      <div className="ui-empty-title">{resolvedTitle}</div>
      {resolvedDescription && <div className="ui-empty-desc">{resolvedDescription}</div>}
      {(primaryAction || secondaryAction || action) && (
        <div className="ui-empty-actions">
          {action}
          {primaryAction}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
