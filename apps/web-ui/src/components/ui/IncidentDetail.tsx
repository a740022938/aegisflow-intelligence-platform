// v5.2.0 — Incident Detail (故障详情聚合面板)
import React from 'react';
import { Link } from 'react-router-dom';

interface Incident {
  id: string;
  incident_type: 'failure' | 'gate_block' | 'release_issue';
  root_entity_type: string;
  root_entity_id: string;
  root_cause_step?: string;
  root_cause_message?: string;
  related_job_id?: string;
  related_gate_check_id?: string;
  related_release_id?: string;
  error_message?: string;
  first_seen_at: string;
  last_seen_at: string;
  latest_status: string;
  timeline_url?: string;
  audit_url?: string;
}

interface Props {
  incident: Incident;
  onTimelineClick?: () => void;
  onAuditClick?: () => void;
  onClose?: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  failure: '任务失败',
  gate_block: 'Gate 阻塞',
  release_issue: '发布异常',
};

const TYPE_ICONS: Record<string, string> = {
  failure: '❌',
  gate_block: '🚧',
  release_issue: '⚠️',
};

const STATUS_COLORS: Record<string, string> = {
  failed: '#EF4444',
  blocked: '#F59E0B',
  running: '#3B82F6',
  completed: '#10B981',
};

function fmtTime(iso: string): string {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString('zh-CN'); } catch { return iso; }
}

export default function IncidentDetail({ incident, onTimelineClick, onAuditClick, onClose }: Props) {
  if (!incident) return null;

  const statusColor = STATUS_COLORS[incident.latest_status] || 'var(--text-muted)';

  return (
    <div style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 18 }}>{TYPE_ICONS[incident.incident_type] || '📌'}</span>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{TYPE_LABELS[incident.incident_type] || incident.incident_type}</span>
            <span style={{
              padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
              background: statusColor + '18', color: statusColor,
            }}>
              {incident.latest_status}
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID: {incident.id.slice(0, 12)}...</div>
        </div>
        {onClose && (
          <button className="ui-btn ui-btn-ghost ui-btn-xs" onClick={onClose}>✕ 关闭</button>
        )}
      </div>

      {/* Root entity */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>根因对象</div>
        <div style={{ fontSize: 12, fontWeight: 600 }}>
          {incident.root_entity_type}: <code style={{ fontFamily: 'var(--font-mono)' }}>{incident.root_entity_id.slice(0, 16)}...</code>
        </div>
      </div>

      {/* Root cause */}
      {incident.root_cause_step && (
        <div style={{ marginBottom: 12, padding: '8px 10px', background: '#EF444408', borderRadius: 4, border: '1px solid #EF444433' }}>
          <div style={{ fontSize: 10, color: '#EF4444', marginBottom: 2 }}>根因步骤</div>
          <div style={{ fontSize: 12, fontWeight: 600 }}>{incident.root_cause_step}</div>
          {incident.root_cause_message && (
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 4, whiteSpace: 'pre-wrap', maxHeight: 80, overflowY: 'auto' }}>
              {incident.root_cause_message}
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {incident.error_message && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>错误信息</div>
          <div style={{ fontSize: 10, padding: '6px 8px', background: 'var(--bg-app)', borderRadius: 4, whiteSpace: 'pre-wrap', maxHeight: 100, overflowY: 'auto' }}>
            {incident.error_message}
          </div>
        </div>
      )}

      {/* Time range */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>首次发现</div>
          <div style={{ fontSize: 11 }}>{fmtTime(incident.first_seen_at)}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>最后更新</div>
          <div style={{ fontSize: 11 }}>{fmtTime(incident.last_seen_at)}</div>
        </div>
      </div>

      {/* Related objects */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>关联对象</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {incident.related_job_id && (
            <Link to={`/workflow-jobs?highlight=${incident.related_job_id}`} style={{ fontSize: 10, padding: '2px 8px', background: 'var(--bg-app)', borderRadius: 4, textDecoration: 'none', color: 'var(--primary)' }}>
              ⚙️ Job
            </Link>
          )}
          {incident.related_gate_check_id && (
            <Link to="/factory-status" style={{ fontSize: 10, padding: '2px 8px', background: 'var(--bg-app)', borderRadius: 4, textDecoration: 'none', color: 'var(--primary)' }}>
              🚧 Gate
            </Link>
          )}
          {incident.related_release_id && (
            <Link to={`/artifacts?highlight=${incident.related_release_id}`} style={{ fontSize: 10, padding: '2px 8px', background: 'var(--bg-app)', borderRadius: 4, textDecoration: 'none', color: 'var(--primary)' }}>
              📦 Release
            </Link>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        {onTimelineClick && (
          <button className="ui-btn ui-btn-primary ui-btn-sm" onClick={onTimelineClick}>
            📈 时间线
          </button>
        )}
        {onAuditClick && (
          <button className="ui-btn ui-btn-outline ui-btn-sm" onClick={onAuditClick}>
            📋 审计
          </button>
        )}
        <Link to={incident.audit_url || '/audit'} className="ui-btn ui-btn-ghost ui-btn-sm" style={{ textDecoration: 'none' }}>
          → 审计页
        </Link>
      </div>
    </div>
  );
}
