import React from 'react';
import PageShell from '../components/ui/PageShell';
import { STAGE_C_HUMAN_APPROVAL_REVIEW_REGISTRY } from '../registry/stage-c-human-approval-review-registry';
import { validateHumanApprovalReview } from '../registry/stage-c-human-approval-review-validator';

const sectionStyle: React.CSSProperties = {
  marginBottom: 24,
  padding: 20,
  background: 'var(--bg-card, #1a1a2e)',
  borderRadius: 8,
  border: '1px solid var(--border-color, #2a2a4a)',
};

const headerStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  marginBottom: 16,
  color: 'var(--text-primary, #e0e0e0)',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: 10,
  marginBottom: 12,
};

const cardStyle: React.CSSProperties = {
  padding: '12px 16px',
  background: 'var(--bg-item, #16213e)',
  borderRadius: 6,
  border: '1px solid var(--border-color, #2a2a4a)',
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--text-secondary, #8892b0)',
  textTransform: 'uppercase',
  marginBottom: 4,
};

const valueStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: 'var(--text-primary, #e0e0e0)',
};

const badgeStyle = (color: string): React.CSSProperties => ({
  padding: '2px 10px',
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 600,
  background: color,
  color: '#fff',
  display: 'inline-block',
});

const statusColor = (status: string) => {
  switch (status) {
    case 'ready': return '#66bb6a';
    case 'deferred': return '#ffa726';
    case 'blocked': return '#ef5350';
    default: return '#757575';
  }
};

const StageCHumanApprovalReviewPreview: React.FC = () => {
  const registry = STAGE_C_HUMAN_APPROVAL_REVIEW_REGISTRY;
  const validation = validateHumanApprovalReview();

  const requiredItems = registry.filter(i => i.required);
  const readyItems = registry.filter(i => i.status === 'ready');
  const areas = [...new Set(registry.map(i => i.area))].sort();

  return (
    <PageShell
      title="Stage C Human Approval Review Console Preview"
      subtitle="v7.34.0-P2 · Readonly · No approve/deny capability · No enable action available"
      safetyBoundary="readonly"
      safetyText="只读 human approval review console · 无批准/拒绝能力 · 无 enable 按钮 · 不入 sidebar · 不执行动作"
    >
      {/* 1. Human Approval Boundary */}
      <div style={{ ...sectionStyle, border: '1px solid #42a5f5' }}>
        <div style={{ ...headerStyle, color: '#42a5f5' }}>1. Human Approval Boundary</div>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <div style={labelStyle}>Review Items</div>
            <div style={valueStyle}>{registry.length}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Required Items</div>
            <div style={valueStyle}>{requiredItems.length}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Ready Items</div>
            <div style={{ ...valueStyle, color: '#66bb6a' }}>{readyItems.length}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Can Approve</div>
            <div style={{ ...valueStyle, color: '#ef5350' }}>false</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Can Deny</div>
            <div style={{ ...valueStyle, color: '#ef5350' }}>false</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Can Enable Stage C</div>
            <div style={{ ...valueStyle, color: '#ef5350' }}>false</div>
          </div>
        </div>
        <div style={{ marginTop: 8, padding: 12, background: '#16213e', borderRadius: 4, border: '1px solid #ef5350' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#ef5350' }}>
            Stage C is disabled. No approve/deny capability exists. This console is readonly.
          </div>
        </div>
      </div>

      {/* 2. Role Responsibilities */}
      <div style={sectionStyle}>
        <div style={headerStyle}>2. Role Responsibilities</div>
        {registry.filter(i => i.area === 'role_boundary').map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badgeStyle(statusColor(item.status))}>{item.status}</span>
            </div>
            <div style={{ color: 'var(--text-secondary, #8892b0)', marginTop: 4 }}>{item.description}</div>
          </div>
        ))}
      </div>

      {/* 3. Second Confirmation */}
      <div style={{ ...sectionStyle, border: '1px solid #ffa726' }}>
        <div style={{ ...headerStyle, color: '#ffa726' }}>3. Second Confirmation Requirement</div>
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <p>Human owner must provide <strong>two separate confirmations</strong> before Stage C enablement:</p>
          <ol style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li><strong>Initial approval</strong> — review evidence, validators, smoke, and risk assessment</li>
            <li><strong>Second confirmation</strong> — re-confirm after 24h cooldown period</li>
          </ol>
          <p style={{ color: '#ef5350' }}>
            Single-click or single-action cannot enable Stage C. Assistant cannot provide either confirmation.
          </p>
        </div>
      </div>

      {/* 4. Denial / Blocker Policy */}
      <div style={sectionStyle}>
        <div style={headerStyle}>4. Denial / Blocker Policy</div>
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <p>Automatic blockers that prevent enablement:</p>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>Missing required evidence</li>
            <li>Stale smoke tests ({'>'}24h)</li>
            <li>Validator failures (blocking &gt; 0)</li>
            <li>Unresolved rollback/recovery documentation</li>
            <li>Missing human owner approval</li>
          </ul>
          <p>Denial requires documented reason in decision record. Escalation to senior human owner available.</p>
        </div>
      </div>

      {/* 5. Required Evidence */}
      <div style={sectionStyle}>
        <div style={headerStyle}>5. Required Evidence</div>
        {registry.filter(i => i.area === 'evidence').map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badgeStyle(statusColor(item.status))}>{item.status}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.evidenceRef}</div>
          </div>
        ))}
      </div>

      {/* 6. Safety Boundary */}
      <div style={{ ...sectionStyle, border: '1px solid #66bb6a' }}>
        <div style={{ ...headerStyle, color: '#66bb6a' }}>6. Safety Boundary</div>
        <ul style={{ fontSize: 13, lineHeight: 2, paddingLeft: 20 }}>
          <li>No DB write — all registries enforce readonly</li>
          <li>No POST action — no runtime endpoint implemented</li>
          <li>No executor — no execution capability</li>
          <li>No external control — no tool/connector actions</li>
          <li>No sidebar exposure — hidden direct only</li>
          <li>No approve/deny capability — readonly console</li>
          <li>No enable button or enable action</li>
        </ul>
      </div>

      {/* 7. Validator Summary */}
      <div style={{ ...sectionStyle, border: `1px solid ${validation.pass ? '#66bb6a' : '#ef5350'}` }}>
        <div style={{ ...headerStyle, color: validation.pass ? '#66bb6a' : '#ef5350' }}>
          7. Validator Summary
        </div>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <div style={labelStyle}>Result</div>
            <div style={{ ...valueStyle, color: validation.pass ? '#66bb6a' : '#ef5350' }}>
              {validation.pass ? 'PASS' : 'FAIL'}
            </div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Blocking</div>
            <div style={{ ...valueStyle, color: validation.blocking === 0 ? '#66bb6a' : '#ef5350' }}>
              {validation.blocking}
            </div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Warning / Info</div>
            <div style={valueStyle}>{validation.warning} / {validation.info}</div>
          </div>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary, #8892b0)' }}>
          {validation.checks.map(c => (
            <div key={c.id} style={{ padding: '2px 0', display: 'flex', gap: 8 }}>
              <span style={{ color: c.pass ? '#66bb6a' : '#ef5350' }}>{c.pass ? '\u2713' : '\u2717'}</span>
              <span>[{c.level}]</span>
              <span>{c.message}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Forbidden Actions */}
      <div style={{ ...sectionStyle, border: '1px solid #ef5350' }}>
        <div style={{ ...headerStyle, color: '#ef5350' }}>8. Forbidden Actions</div>
        <ul style={{ fontSize: 13, lineHeight: 2, paddingLeft: 20 }}>
          <li>Do not enable Stage C — no enable capability exists</li>
          <li>Do not implement approve/deny — console is readonly</li>
          <li>Do not implement POST runtime endpoint</li>
          <li>Do not write to DB — no DB write capability exists</li>
          <li>Do not execute runtime — no executor implemented</li>
          <li>Do not control external tools — no connector action</li>
          <li>Do not expose to sidebar — all routes are hidden direct</li>
          <li>Do not skip human owner approval — required for Stage C</li>
          <li>Do not bypass second confirmation — two separate approvals needed</li>
          <li>Do not create decision record on behalf of human owner</li>
        </ul>
      </div>

      {/* 9. Approval Gate Items */}
      <div style={sectionStyle}>
        <div style={headerStyle}>9. Approval Gate Items</div>
        {registry.filter(i => i.area === 'approval_gate').map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badgeStyle(statusColor(item.status))}>{item.status}</span>
            </div>
            <div style={{ color: 'var(--text-secondary, #8892b0)', marginTop: 4 }}>{item.description}</div>
          </div>
        ))}
      </div>

      {/* 10. Next Step: P3 Evidence Readiness Drill Preview */}
      <div style={{ ...sectionStyle, border: '1px solid #ffa726' }}>
        <div style={{ ...headerStyle, color: '#ffa726' }}>10. Next Step</div>
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>Review human approval boundary — confirm no approve/deny capability</li>
            <li>Verify role responsibilities — all roles are documented and bounded</li>
            <li>Confirm second confirmation requirement — two approvals needed</li>
            <li>Review denial/blocker policy — automatic blockers defined</li>
            <li>Verify validator results — all 18 checks must pass</li>
            <li>Confirm safety boundaries — no POST, DB, executor, sidebar</li>
            <li>Create human owner decision record when ready for enablement review</li>
            <li>Do not enable Stage C from this console — no enable button exists</li>
          </ol>
        </div>
        <div style={{ marginTop: 12, padding: 12, background: '#1a1a2e', borderRadius: 4, border: '1px solid #2a2a4a' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#ffa726' }}>Next Phase Recommendation</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary, #8892b0)', marginTop: 4 }}>
            v7.34.0-P3: Stage C Evidence Readiness Drill Preview
          </div>
          <div style={{ fontSize: 12, color: '#ef5350', marginTop: 4, fontWeight: 600 }}>
            Stage C remains disabled.
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default StageCHumanApprovalReviewPreview;
