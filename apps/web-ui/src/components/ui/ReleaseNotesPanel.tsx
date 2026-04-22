// v4.9.0 — Release Notes Panel
import React, { useState } from 'react';

interface Props {
  releaseNotes: string;
  releaseName: string;
  compact?: boolean;
}

export default function ReleaseNotesPanel({ releaseNotes, releaseName, compact = false }: Props) {
  const [expanded, setExpanded] = useState(!compact);
  if (!releaseNotes || !releaseNotes.trim()) {
    return <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>暂无发布说明</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>📝 Release Notes</span>
        <button className="ui-btn ui-btn-ghost ui-btn-xs" onClick={() => setExpanded(!expanded)}>
          {expanded ? '收起' : '展开'}
        </button>
      </div>
      {expanded && (
        <pre style={{
          fontSize: 11, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
          padding: 10, maxHeight: 300, overflowY: 'auto', fontFamily: 'var(--font-sans)',
        }}>
          {releaseNotes}
        </pre>
      )}
      {!expanded && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxHeight: 20 }}>
          {releaseNotes.split('\n')[0]}
        </div>
      )}
    </div>
  );
}
