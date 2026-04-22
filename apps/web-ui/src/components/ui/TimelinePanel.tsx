// v5.2.0 — Timeline Panel (事件时间线)
import React from 'react';

interface TimelineEvent {
  timestamp: string;
  event_type: 'gate_check' | 'job_step' | 'audit' | 'release' | 'recovery';
  event_id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  summary: string;
  status?: string;
  error_message?: string;
  related_to?: Array<{ type: string; id: string }>;
}

interface Props {
  events: TimelineEvent[];
  loading?: boolean;
  onItemClick?: (event: TimelineEvent) => void;
  maxHeight?: string;
}

const EVENT_ICONS: Record<string, string> = {
  gate_check: '🚧',
  job_step: '⚙️',
  audit: '📋',
  release: '📦',
  recovery: '🔧',
};

const STATUS_COLORS: Record<string, string> = {
  passed: '#10B981',
  blocked: '#F59E0B',
  failed: '#EF4444',
  running: '#3B82F6',
  completed: '#10B981',
  success: '#10B981',
};

function fmtTime(iso: string): string {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString('zh-CN'); } catch { return iso; }
}

export default function TimelinePanel({ events, loading, onItemClick, maxHeight }: Props) {
  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>加载中...</div>;
  }

  if (!events || events.length === 0) {
    return <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>无事件记录</div>;
  }

  return (
    <div style={{ maxHeight: maxHeight || '400px', overflowY: 'auto', position: 'relative', paddingLeft: 20 }}>
      {/* Timeline line */}
      <div style={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 2, background: 'var(--border)' }} />

      {events.map((ev, i) => (
        <div key={ev.event_id || i} style={{ position: 'relative', marginBottom: 12, paddingLeft: 16 }}>
          {/* Dot */}
          <div style={{
            position: 'absolute', left: -20, top: 6,
            width: 10, height: 10, borderRadius: '50%',
            background: ev.status ? (STATUS_COLORS[ev.status] || 'var(--text-muted)') : 'var(--primary)',
            border: '2px solid var(--bg-surface)',
          }} />

          {/* Card */}
          <div
            onClick={() => onItemClick?.(ev)}
            style={{
              padding: '8px 12px',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              cursor: onItemClick ? 'pointer' : 'default',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12 }}>{EVENT_ICONS[ev.event_type] || '📌'}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ev.event_type.replace('_', ' ')}</span>
              </div>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{fmtTime(ev.timestamp)}</span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{ev.summary}</div>
            {ev.status && (
              <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3, background: (STATUS_COLORS[ev.status] || 'var(--text-muted)') + '18', color: STATUS_COLORS[ev.status] || 'var(--text-muted)' }}>
                {ev.status}
              </span>
            )}
            {ev.error_message && (
              <div style={{ fontSize: 10, color: '#EF4444', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {ev.error_message.slice(0, 100)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
