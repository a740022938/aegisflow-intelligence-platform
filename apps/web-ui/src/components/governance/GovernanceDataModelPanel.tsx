import React from 'react';
import { GOVERNANCE_DATA_MODELS } from './governanceDesignSpec';

const C: Record<string, string> = {
  'design-only': '#8B5CF6', deferred: '#F97316', disabled: '#6B7280', none: 'var(--success)',
};

function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, color: '#fff', background: color || '#6B7280', lineHeight: '16px', whiteSpace: 'nowrap' }}>{label}</span>
  );
}

export default function GovernanceDataModelPanel() {
  return (
    <div>
      <div style={{ marginBottom: 8, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        以下为未来 Stage C 治理数据模型的只读设计规格。所有模型均为 <strong>design-only</strong>，无运行时效果，无写入路径。
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {GOVERNANCE_DATA_MODELS.map(m => (
          <div key={m.modelName} style={{ padding: '10px 14px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderLeft: '3px solid #8B5CF6', fontSize: 11 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 12 }}>{m.modelName}</span>
              <Badge label={m.status} color={C[m.status] || '#6B7280'} />
              <Badge label={m.stageGate} color="#F97316" />
            </div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{m.purpose}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 10, color: 'var(--text-muted)' }}>
              <span>Write: <strong style={{ color: C[m.writePath] }}>{m.writePath}</strong></span>
              <span>Runtime: <strong style={{ color: C[m.runtimeEffect] }}>{m.runtimeEffect}</strong></span>
              <span>Evidence: {m.requiredEvidence.join(', ')}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Design-only data model specification. No DB schema, no migration, no API endpoint, no write path.
      </div>
    </div>
  );
}
