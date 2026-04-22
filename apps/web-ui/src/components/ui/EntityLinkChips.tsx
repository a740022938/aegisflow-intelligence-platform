// v4.6.0 — Entity Link Chips: small clickable tags for related objects
import React from 'react';
import { Link } from 'react-router-dom';

export interface EntityChip {
  type: 'task' | 'workflow_job' | 'evaluation' | 'model' | 'artifact' | 'dataset' | 'approval' | 'audit' | 'deployment' | 'run';
  id: string;
  label: string;
  status?: string;
}

interface Props {
  entities: EntityChip[];
  label?: string; // section label like "Source" or "Produces"
  max?: number;
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  task: { bg: '#6366F118', text: '#6366F1' },
  workflow_job: { bg: '#0EA5E918', text: '#0EA5E9' },
  evaluation: { bg: '#10B98118', text: '#10B981' },
  model: { bg: '#8B5CF618', text: '#8B5CF6' },
  artifact: { bg: '#F59E0B18', text: '#F59E0B' },
  dataset: { bg: '#14B8A618', text: '#14B8A6' },
  approval: { bg: '#EF444418', text: '#EF4444' },
  audit: { bg: '#6B728018', text: '#6B7280' },
  deployment: { bg: '#0EA5E918', text: '#0EA5E9' },
  run: { bg: '#6366F118', text: '#6366F1' },
};

const TYPE_PATH: Record<string, string> = {
  task: '/tasks',
  workflow_job: '/workflow-jobs',
  evaluation: '/evaluations',
  model: '/models',
  artifact: '/artifacts',
  dataset: '/datasets',
  approval: '/approvals',
  audit: '/audit',
  deployment: '/deployments',
  run: '/runs',
};

function StatusDot({ status }: { status?: string }) {
  const colors: Record<string, string> = {
    completed: '#10B981', success: '#10B981', ready: '#10B981', healthy: '#10B981',
    running: '#3B82F6', pending: '#F59E0B', queued: '#F59E0B',
    failed: '#EF4444', error: '#EF4444',
    cancelled: '#9CA3AF', archived: '#9CA3AF',
  };
  const c = colors[status?.toLowerCase() || ''] || '#9CA3AF';
  return (
    <span style={{
      display: 'inline-block',
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: c,
      marginLeft: 4,
    }} />
  );
}

function EntityChip({ entity }: { entity: EntityChip }) {
  const colors = TYPE_COLORS[entity.type] || { bg: '#6B728018', text: '#6B7280' };
  const path = TYPE_PATH[entity.type] || '/' + entity.type + 's';

  return (
    <Link
      to={{ pathname: path, search: `?highlight=${entity.id}` }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 500,
        background: colors.bg,
        color: colors.text,
        textDecoration: 'none',
        border: '1px solid ' + colors.text + '30',
        transition: 'all 0.15s',
        maxWidth: 160,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
      title={`${entity.type}: ${entity.label}`}
    >
      {entity.label}
      {entity.status && <StatusDot status={entity.status} />}
    </Link>
  );
}

export default function EntityLinkChips({ entities, label, max = 8 }: Props) {
  if (!entities || entities.length === 0) {
    return (
      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>—</div>
    );
  }

  const shown = entities.slice(0, max);
  const overflow = entities.length - max;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
      {label && (
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginRight: 2 }}>{label}:</span>
      )}
      {shown.map((e, i) => (
        <EntityChip key={(e.id || '') + i} entity={e} />
      ))}
      {overflow > 0 && (
        <span style={{ fontSize: 10, color: 'var(--text-muted)', padding: '2px 6px' }}>+{overflow}</span>
      )}
    </div>
  );
}
