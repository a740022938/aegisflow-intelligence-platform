import React from 'react';
import { DEPLOYMENT_DESIGN_FIELDS } from './governanceDesignSpec';

const C: Record<string, string> = {
  'design-only': '#8B5CF6', disabled: '#6B7280', none: 'var(--success)',
  'Stage C deferred': '#F97316',
};

function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 10,
      fontWeight: 600, color: '#fff', background: color || '#6B7280',
      lineHeight: '16px', whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '3px 0', fontSize: 10, borderBottom: '1px solid var(--border)' }}>
      <span style={{ width: 130, flexShrink: 0, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

export default function DeploymentGateDesignSpec() {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', fontSize: 10, color: 'var(--text-secondary)' }}>
        Deployment Gate is <strong>design-only</strong>. Stage C is <strong>not enabled</strong>. No deployment, release, tag, push, upload, sync, service-control or external write action is available. Current status: <strong>readonly design spec</strong> — no runtime effect.
      </div>

      <div style={{ marginBottom: 6, fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>
        Deployment Gate Design Fields ({DEPLOYMENT_DESIGN_FIELDS.length})
      </div>

      {DEPLOYMENT_DESIGN_FIELDS.map(f => (
        <div key={f.fieldName} style={{
          padding: '8px 10px', marginBottom: 4, borderRadius: 6,
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderLeft: '3px solid #8B5CF6',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: 11, color: 'var(--text-primary)' }}>{f.fieldName}</span>
            <Badge label={f.status} color={C[f.status] || '#6B7280'} />
            <Badge label="deployment disabled" color="var(--danger)" />
            <Badge label="release disabled" color="var(--danger)" />
            <Badge label={f.stageGate} color={C[f.stageGate] || '#6B7280'} />
          </div>
          <DetailRow label="purpose" value={f.purpose} />
          <DetailRow label="current status" value={f.status} />
          <DetailRow label="runtime effect" value={f.runtimeEffect} />
          <DetailRow label="deployment permission" value={f.deploymentPermission} />
          <DetailRow label="release permission" value={f.releasePermission} />
          <DetailRow label="external write path" value={f.externalWritePath} />
          <DetailRow label="stage gate" value={f.stageGate} />
          <DetailRow label="blocked actions" value={<Badge label={f.blockedActions} color="var(--danger)" />} />
          <DetailRow label="future requirement" value={f.futureRequirement} />
        </div>
      ))}

      <button type="button" onClick={() => setExpanded(!expanded)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: 'var(--secondary)', padding: '4px 0', fontFamily: 'inherit' }}>
        {expanded ? '收起说明 ▲' : '展开设计说明 ▼'}
      </button>

      {expanded && (
        <div style={{ marginTop: 6, padding: '8px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.7 }}>
          <strong>Deployment Gate Design Spec 说明：</strong><br />
          • 当前 Deployment Gate 处于纯设计阶段（design-only），未启用任何运行时能力。<br />
          • 所有字段均为只读规格定义，不产生任何部署、发布、打 tag、推送等实际效果。<br />
          • Stage C 尚未启用，所有门禁均处于 deferred 状态。<br />
          • 禁止的操作包括：部署、发布、打 tag、推送、上传等所有具有副作用的操作。<br />
          • 未来需求：需要人工提交部署请求、构建验证、发布计划、审批门禁关联、回滚计划等。<br />
          • 当前暴露风险：无（active risk = 0，deployment path = disabled）。
        </div>
      )}
    </div>
  );
}
