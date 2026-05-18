import React from 'react';
import { GATE_MATRIX_ROWS } from './governanceDesignSpec';

const C: Record<string, string> = {
  'design-only': '#8B5CF6', deferred: '#F97316', no: 'var(--success)', gated: 'var(--warning)',
};

export default function GovernanceLifecycleMatrix() {
  return (
    <div>
      <div style={{ marginBottom: 8, fontSize: 11, color: 'var(--text-muted)' }}>
        Governance lifecycle stages — all currently <strong>readonly / design-only / no runtime effect</strong>.
      </div>
      <div style={{ display: 'grid', gap: 4, fontSize: 10 }}>
        {[
          { stage: 'Draft', purpose: '初始构思', capability: 'readonly/design-only', futureReq: '可编辑 draft', risk: '无运行时影响' },
          { stage: 'Review', purpose: '设计审查', capability: 'readonly/design-only', futureReq: '人工 review 流程', risk: '需独立评审人' },
          { stage: 'Evidence Attached', purpose: '附加审计证据', capability: 'readonly/design-only', futureReq: '证据上传与验证', risk: '证据完整性待定义' },
          { stage: 'Dry-run Verified', purpose: '模拟执行验证', capability: 'readonly/design-only', futureReq: 'dry-run 执行引擎', risk: '需 Dry-run 沙箱环境' },
          { stage: 'Approval Pending', purpose: '等待人工审批', capability: 'readonly/design-only', futureReq: '审批通知+超时机制', risk: '超时需回退' },
          { stage: 'Execution Deferred', purpose: '执行延后', capability: 'readonly/design-only', futureReq: '条件检查+自动触发', risk: '条件变更风险' },
          { stage: 'Audit Recorded', purpose: '操作已记录', capability: 'readonly/design-only', futureReq: '审计追踪查询', risk: '日志不可篡改' },
          { stage: 'Closed', purpose: '操作已完成', capability: 'readonly/design-only', futureReq: '归档策略', risk: '关闭后不可重新打开' },
        ].map(r => (
          <div key={r.stage} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1.2fr 1.2fr 1fr', gap: 6, padding: '5px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.02)', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.stage}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{r.purpose}</span>
            <span style={{ color: '#8B5CF6' }}>{r.capability}</span>
            <span style={{ color: 'var(--text-muted)' }}>{r.futureReq}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 9 }}>{r.risk}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.04)', fontSize: 9, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Design-only lifecycle specification. Not a real state machine. No runtime engine.
      </div>
    </div>
  );
}
