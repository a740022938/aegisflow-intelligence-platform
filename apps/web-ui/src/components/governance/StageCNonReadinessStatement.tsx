import React from 'react';

export default function StageCNonReadinessStatement() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '10px 14px', borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '2px solid rgba(239,68,68,0.3)', fontSize: 10, color: 'var(--text-primary)', lineHeight: 1.8 }}>
        <strong style={{ color: '#EF4444', fontSize: 12 }}>Stage C Activation Non-Readiness Statement</strong>
        <br /><br />
        Stage C remains <strong style={{ color: '#EF4444' }}>disabled</strong>.
        <br /><br />
        P1–P8 establish <strong>design coverage only</strong>. No runtime control model, persistence model, dry-run engine, external write sandbox, emergency stop runtime, or audit evidence persistence has been implemented.
        <br /><br />
        The following critical capabilities are <strong>not implemented</strong>:
        <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
          <li>Runtime authorization model</li>
          <li>Persistent governance state</li>
          <li>Approval / rejection storage</li>
          <li>Audit evidence persistence</li>
          <li>Rollback execution path</li>
          <li>Dry-run simulation engine</li>
          <li>External write sandbox</li>
          <li>Emergency stop runtime</li>
        </ul>
        <strong style={{ color: '#F97316' }}>Stage C activation requires a separate future activation package and final safety audit.</strong>
        <br /><br />
        <em style={{ color: 'var(--text-muted)' }}>
          This statement is part of the P9 Gate Coverage Closure Audit. It does not indicate readiness to enable Stage C. No activation is recommended at this time.
        </em>
      </div>
    </div>
  );
}
