// v4.8.0 — Lineage Panel: cross-entity chain visualization
import React from 'react';
import { Link } from 'react-router-dom';

export interface LineageNode {
  type: 'evaluation' | 'artifact' | 'model' | 'approval' | 'audit' | 'experiment' | 'dataset' | 'workflow_job';
  id: string;
  label: string;
  status?: string;
  active?: boolean;
}

interface Props {
  chain: LineageNode[];
  title?: string;
}

const TYPE_META: Record<string, { icon: string; bg: string; text: string; path: string }> = {
  evaluation:     { icon: '📊', bg: '#10B98118', text: '#10B981', path: '/evaluations' },
  artifact:       { icon: '📦', bg: '#F59E0B18', text: '#F59E0B', path: '/artifacts' },
  model:          { icon: '🧠', bg: '#8B5CF618', text: '#8B5CF6', path: '/models' },
  approval:       { icon: '✅', bg: '#EF444418', text: '#EF4444', path: '/approvals' },
  audit:          { icon: '📋', bg: '#6B728018', text: '#6B7280', path: '/audit' },
  experiment:     { icon: '🔬', bg: '#6366F118', text: '#6366F1', path: '/training' },
  dataset:        { icon: '💾', bg: '#14B8A618', text: '#14B8A6', path: '/datasets' },
  workflow_job:   { icon: '⚡', bg: '#0EA5E918', text: '#0EA5E9', path: '/workflow-jobs' },
};

const STATUS_COLORS: Record<string, string> = {
  completed: '#10B981', success: '#10B981', ready: '#10B981', approved: '#10B981',
  running: '#3B82F6', pending: '#F59E0B', candidate: '#3B82F6', draft: '#9CA3AF',
  failed: '#EF4444', rejected: '#EF4444', error: '#EF4444',
  approval_required: '#F59E0B', archived: '#9CA3AF',
};

export default function LineagePanel({ chain, title = '主线路径' }: Props) {
  if (!chain || chain.length === 0) {
    return <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>无链路信息</div>;
  }

  return (
    <div style={{ padding: '8px 0' }}>
      {title && <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>{title}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap' }}>
        {chain.map((node, idx) => {
          const meta = TYPE_META[node.type] || TYPE_META.audit;
          const isActive = node.active;
          const borderColor = isActive ? meta.text : 'var(--border)';
          return (
            <React.Fragment key={node.id + idx}>
              <Link
                to={{ pathname: meta.path, search: `?highlight=${node.id}` }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 11,
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? meta.bg : 'var(--bg-app)',
                  color: isActive ? meta.text : 'var(--text-secondary)',
                  border: `1.5px solid ${borderColor}`,
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
                title={`${node.type}: ${node.id}`}
              >
                <span>{meta.icon}</span>
                <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>{node.label}</span>
                {node.status && (
                  <span style={{
                    display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                    background: STATUS_COLORS[node.status] || '#9CA3AF',
                  }} />
                )}
              </Link>
              {idx < chain.length - 1 && (
                <span style={{ margin: '0 3px', color: 'var(--text-muted)', fontSize: 14 }}>→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
