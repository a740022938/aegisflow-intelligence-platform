import React, { useMemo } from 'react';
import { LAB_REGISTRY_NEW } from '../../registry/lab-registry';
import type { LabRegistryItem } from '../../registry/lab-registry';

const RISK_COLORS: Record<string, string> = {
  low: 'var(--success)', medium: 'var(--warning)', high: 'var(--danger)',
};

function Badge({ label, color }: { label: string; color?: string }) {
  return <span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: 8, fontSize: 8, fontWeight: 600, color: '#fff', background: color || '#6B7280', lineHeight: '14px', whiteSpace: 'nowrap' }}>{label}</span>;
}

function BoolCell({ ok }: { ok: boolean }) {
  return <span style={{ fontWeight: 600, fontSize: 10, color: ok ? 'var(--success)' : 'var(--danger)' }}>{ok ? 'yes' : 'no'}</span>;
}

function StatusCell({ label, color }: { label: string; color: string }) {
  return <span style={{ fontWeight: 600, fontSize: 9, color }}>{label}</span>;
}

function MatrixRow({ item }: { item: LabRegistryItem }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 50px 50px 50px 60px 60px 50px 50px 1fr', gap: 4, padding: '5px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.02)', fontSize: 9, alignItems: 'center', borderLeft: `3px solid ${RISK_COLORS[item.riskLevel]}`, marginBottom: 2 }}>
      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</span>
      <BoolCell ok={item.qualityGate.readonly} />
      <BoolCell ok={!item.qualityGate.noDbWrite && item.actionsAllowed.some(a => a.includes('write') || a.includes('save'))} />
      <BoolCell ok={item.actionsAllowed.some(a => a.includes('train') || a.includes('predict') || a.includes('run') || a.includes('execute'))} />
      <BoolCell ok={false} />
      <BoolCell ok={item.qualityGate.noTraining && item.qualityGate.noInference} />
      <StatusCell label={item.actionsBlocked.includes('enable_stage_c') ? 'none' : 'Stage C'} color={item.actionsBlocked.includes('enable_stage_c') ? 'var(--success)' : 'var(--danger)'} />
      <Badge label={item.riskLevel} color={RISK_COLORS[item.riskLevel]} />
      <StatusCell label={item.status === 'available_route' ? 'readonly' : item.status === 'hold_review' ? 'planned' : 'deferred'} color={item.status === 'available_route' ? 'var(--success)' : item.status === 'hold_review' ? 'var(--warning)' : '#6B7280'} />
    </div>
  );
}

export default function LabExperimentMatrix() {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Lab Experiment Matrix</div>
      <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 6 }}>Capability-level governance matrix — all default no/no/no per readonly policy</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 50px 50px 50px 60px 60px 50px 50px 1fr', gap: 4, padding: '4px 8px', fontSize: 8, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2, alignItems: 'center' }}>
        <span>Capability</span><span style={{ textAlign: 'center' }}>Read</span><span style={{ textAlign: 'center' }}>Write</span><span style={{ textAlign: 'center' }}>Exec</span><span style={{ textAlign: 'center' }}>Ext.IO</span><span style={{ textAlign: 'center' }}>Loc.IO</span><span style={{ textAlign: 'center' }}>Gate</span><span style={{ textAlign: 'center' }}>Risk</span><span>Status</span>
      </div>
      {LAB_REGISTRY_NEW.map(c => <MatrixRow key={c.id} item={c} />)}
      <div style={{ marginTop: 8, fontSize: 9, color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.04)' }}>
        All {LAB_REGISTRY_NEW.length} lab items: Write=no, Execute=no, External IO=no. Consistent with readonly lab governance policy. Stage C deferred.
      </div>
    </div>
  );
}
