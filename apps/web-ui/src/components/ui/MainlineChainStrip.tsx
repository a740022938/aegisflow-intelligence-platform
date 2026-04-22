// v4.6.0 — Mainline Chain Strip: Task → Workflow → Evaluation → Model → Artifact → Approval
// Shows the full provenance chain as a horizontal clickable strip
import React from 'react';
import { Link } from 'react-router-dom';

export interface ChainNode {
  type: 'task' | 'workflow_job' | 'evaluation' | 'model' | 'artifact' | 'approval' | 'audit';
  id: string;
  label: string;
  status?: string;
  url?: string;
}

interface Props {
  chain: ChainNode[];
  current?: string; // id of the currently selected node
  compact?: boolean;
}

const NODE_ICONS: Record<string, string> = {
  task: '📋',
  workflow_job: '⚙',
  evaluation: '✅',
  model: '🧠',
  artifact: '📦',
  approval: '👍',
  audit: '📊',
  dataset: '📁',
};

const NODE_COLORS: Record<string, string> = {
  task: '#6366F1',
  workflow_job: '#0EA5E9',
  evaluation: '#10B981',
  model: '#8B5CF6',
  artifact: '#F59E0B',
  approval: '#EF4444',
  audit: '#6B7280',
  dataset: '#14B8A6',
};

const TYPE_LABELS: Record<string, string> = {
  task: 'Task',
  workflow_job: 'Workflow',
  evaluation: 'Evaluation',
  model: 'Model',
  artifact: 'Artifact',
  approval: 'Approval',
  audit: 'Audit',
  dataset: 'Dataset',
};

function NodeItem({ node, isActive, compact }: { node: ChainNode; isActive: boolean; compact: boolean }) {
  const color = NODE_COLORS[node.type] || '#6B7280';
  const label = compact ? node.label : TYPE_LABELS[node.type] || node.type;

  if (node.url) {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: compact ? '2px 8px' : '3px 10px',
        borderRadius: 9999,
        fontSize: compact ? 11 : 12,
        fontWeight: isActive ? 700 : 500,
        background: isActive ? color : color + '18',
        color: isActive ? '#fff' : color,
        textDecoration: 'none',
        transition: 'all 0.15s',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}>
        <span>{NODE_ICONS[node.type] || '•'}</span>
        <span>{label}</span>
      </span>
    );
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: compact ? '2px 8px' : '3px 10px',
      borderRadius: 9999,
      fontSize: compact ? 11 : 12,
      fontWeight: isActive ? 700 : 400,
      background: isActive ? color : color + '12',
      color: isActive ? '#fff' : color + '99',
      whiteSpace: 'nowrap',
    }}>
      <span>{NODE_ICONS[node.type] || '•'}</span>
      <span>{label}</span>
    </span>
  );
}

export default function MainlineChainStrip({ chain, current, compact = false }: Props) {
  if (!chain || chain.length === 0) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      flexWrap: 'wrap',
      padding: '6px 0',
    }}>
      {chain.map((node, i) => (
        <React.Fragment key={node.id + '-' + i}>
          {i > 0 && (
            <span style={{ color: 'var(--text-muted)', fontSize: 11, userSelect: 'none' }}>→</span>
          )}
          <NodeItem node={node} isActive={node.id === current} compact={compact} />
        </React.Fragment>
      ))}
    </div>
  );
}
