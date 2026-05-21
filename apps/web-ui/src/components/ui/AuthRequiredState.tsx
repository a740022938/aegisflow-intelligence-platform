import React, { ReactNode } from 'react';

export interface AuthRequiredStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  steps?: string[];
  action?: ReactNode;
  className?: string;
}

export default function AuthRequiredState({
  title = 'Authentication required',
  description = 'This feature requires valid credentials to access.',
  icon = '🔒',
  steps,
  action,
  className = '',
}: AuthRequiredStateProps) {
  return (
    <div className={`ui-empty-state ${className}`} style={{ gap: 8 }}>
      <div className="ui-empty-icon" style={{ borderColor: 'var(--warning)', color: 'var(--warning)' }}>
        {icon}
      </div>
      <div className="ui-empty-title" style={{ color: 'var(--warning)' }}>
        {title}
      </div>
      <div className="ui-empty-desc">{description}</div>
      {steps && steps.length > 0 && (
        <div style={{ textAlign: 'left', maxWidth: 400, marginTop: 8 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '4px 0', borderBottom: i < steps.length - 1 ? '1px solid var(--border)' : 'none' }}>
              {i + 1}. {step}
            </div>
          ))}
        </div>
      )}
      {action && <div className="ui-empty-actions">{action}</div>}
    </div>
  );
}
