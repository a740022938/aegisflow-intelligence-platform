import React, { ReactNode } from 'react';
import StatusBadge from './StatusBadge';

export interface DetailTab { key: string; label: string; }

export interface DetailPanelProps {
  title: string | ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  status?: string;
  statusColor?: string;
  badges?: ReactNode;
  tabs: DetailTab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  empty?: ReactNode;
  className?: string;
}

export default function DetailPanel({
  title,
  subtitle,
  meta,
  status,
  statusColor,
  badges,
  tabs,
  activeTab,
  onTabChange,
  actions,
  footer,
  children,
  empty,
  className = '',
}: DetailPanelProps) {
  if (empty !== undefined && !children) return <>{empty}</>;

  return (
    <div className={`ui-detail-panel ${className}`}>
      {/* Header */}
      <div className="ui-detail-header">
        <div className="ui-detail-title-wrap">
          <div className="ui-detail-title-row">
            <span className="ui-detail-title">{title}</span>
            {status && <StatusBadge s={status} color={statusColor} />}
            {badges}
          </div>
          {subtitle && <div className="ui-detail-subtitle">{subtitle}</div>}
          {meta && <div className="ui-detail-meta">{meta}</div>}
        </div>
        {actions && <div className="ui-detail-actions">{actions}</div>}
      </div>
      {/* Tabs */}
      {tabs.length > 0 && (
        <div className="ui-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`ui-tab${activeTab === tab.key ? ' active' : ''}`}
              onClick={() => onTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
      {/* Content */}
      <div className="ui-detail-content">{children}</div>
      {footer && <div className="ui-detail-footer">{footer}</div>}
    </div>
  );
}
