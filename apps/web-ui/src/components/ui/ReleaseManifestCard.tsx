// v4.9.0 — Release Manifest Card
import React from 'react';
import { Link } from 'react-router-dom';

interface ManifestEntry {
  type: string;
  id: string;
}

interface Props {
  release: {
    id: string;
    release_name: string;
    release_version: string;
    status: string;
    sealed_by: string;
    sealed_at: string;
    release_manifest_json?: any;
    release_notes?: string;
    source_evaluation_id?: string;
    source_model_id?: string;
    approval_id?: string;
    approval_status?: string;
    package_present?: number;
    backup_verified?: number;
  } | null;
  compact?: boolean;
}

const TYPE_PATH: Record<string, string> = {
  evaluation: '/evaluations',
  artifact: '/artifacts',
  model: '/models',
  approval: '/approvals',
  experiment: '/training',
  dataset: '/datasets',
};

const CHECK_ITEMS = [
  { key: 'artifact', label: 'Source Artifact', icon: '📦' },
  { key: 'evaluation', label: 'Source Evaluation', icon: '📊' },
  { key: 'model', label: 'Source Model', icon: '🧠' },
  { key: 'approval', label: 'Approval Record', icon: '✅' },
  { key: 'metrics', label: 'Metrics Snapshot', icon: '📈' },
  { key: 'manifest', label: 'Release Manifest', icon: '📋' },
  { key: 'notes', label: 'Release Notes', icon: '📝' },
  { key: 'package', label: 'Package Present', icon: '📦' },
];

export default function ReleaseManifestCard({ release, compact = false }: Props) {
  if (!release) {
    return <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>未封存 — 暂无发布材料包</div>;
  }

  const manifest = release.release_manifest_json || {};
  const lineage: ManifestEntry[] = manifest.lineage || [];
  const metricsObj = manifest.metrics_snapshot || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{
          padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 700,
          background: '#10B98118', color: '#10B981', border: '1.5px solid #10B981',
        }}>🔒 Sealed</span>
        <span style={{ fontSize: 14, fontWeight: 700 }}>{release.release_name}</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>v{release.release_version}</span>
      </div>

      {/* Material checklist */}
      {!compact && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          {CHECK_ITEMS.map(item => {
            let present = false;
            if (item.key === 'artifact') present = !!manifest.artifact?.id;
            else if (item.key === 'evaluation') present = !!release.source_evaluation_id;
            else if (item.key === 'model') present = !!manifest.source_model_id;
            else if (item.key === 'approval') present = !!release.approval_id;
            else if (item.key === 'metrics') present = Object.keys(metricsObj).length > 0;
            else if (item.key === 'manifest') present = !!release.release_manifest_json;
            else if (item.key === 'notes') present = !!(release.release_notes && release.release_notes.trim());
            else if (item.key === 'package') present = !!release.package_present;
            return (
              <div key={item.key} style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: present ? '#10B981' : '#9CA3AF', fontWeight: 700 }}>{present ? '✓' : '—'}</span>
                <span style={{ color: present ? 'var(--text-main)' : 'var(--text-muted)' }}>{item.icon} {item.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Lineage chain */}
      {lineage.length > 0 && (
        <div style={{ display: 'flex', gap: 0, alignItems: 'center', flexWrap: 'wrap' }}>
          {lineage.map((node, idx) => {
            const path = TYPE_PATH[node.type] || '/';
            return (
              <React.Fragment key={node.id + idx}>
                <Link to={{ pathname: path, search: `?highlight=${node.id}` }} style={{
                  fontSize: 10, padding: '2px 6px', borderRadius: 4, textDecoration: 'none',
                  background: 'var(--bg-app)', color: 'var(--primary)', border: '1px solid var(--border)',
                }}>{node.type}: {node.id.slice(0, 8)}...</Link>
                {idx < lineage.length - 1 && <span style={{ margin: '0 2px', color: 'var(--text-muted)', fontSize: 10 }}>→</span>}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Sealed info */}
      <div style={{ fontSize: 10, color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 4 }}>
        Sealed by {release.sealed_by || 'system'} at {release.sealed_at ? new Date(release.sealed_at).toLocaleString() : '—'}
        {release.backup_verified ? ' · ✅ Backup verified' : ' · ⏳ Backup pending'}
      </div>
    </div>
  );
}
