import React from 'react';
import PageShell from '../components/ui/PageShell';
import { STAGE_C_AUTHORIZATION_CONTRACT_REGISTRY } from '../registry/stage-c-authorization-contract-registry';
import { validateAuthorizationContract } from '../registry/stage-c-authorization-contract-validator';

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
    case 'required': return '#42a5f5';
    case 'ready': return '#66bb6a';
    case 'blocked': return '#ef5350';
    case 'forbidden': return '#ef5350';
    case 'not_applicable': return '#757575';
    default: return '#757575';
  }
};

const categoryColor = (cat: string) => {
  switch (cat) {
    case 'authorization': return '#42a5f5';
    case 'required_field': return '#ffa726';
    case 'evidence': return '#66bb6a';
    case 'blocker': return '#ef5350';
    case 'safety': return '#66bb6a';
    case 'forbidden_automation': return '#ef5350';
    default: return '#757575';
  }
};

const StageCAuthorizationReviewConsolePreview: React.FC = () => {
  const registry = STAGE_C_AUTHORIZATION_CONTRACT_REGISTRY;
  const validation = validateAuthorizationContract();

  const requiredItems = registry.filter(i => i.requiredForAuthorization);
  const categories = [...new Set(registry.map(i => i.category))].sort();

  return (
    <PageShell
      title="Stage C Authorization Review Console Preview"
      subtitle="v7.35.0-P1 · Readonly · No authorize/enable capability · Stage C remains disabled"
      safetyBoundary="readonly"
      safetyText="只读 authorization review console · 无授权/启用能力 · 不入 sidebar · 不执行动作"
    >
      {/* 1. Header & Status */}
      <div style={{ ...sectionStyle, border: '1px solid #42a5f5' }}>
        <div style={{ ...headerStyle, color: '#42a5f5' }}>1. Stage C Authorization Review Console</div>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <div style={labelStyle}>Contract Items</div>
            <div style={valueStyle}>{registry.length}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Required for Auth</div>
            <div style={valueStyle}>{requiredItems.length}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Can Authorize</div>
            <div style={{ ...valueStyle, color: '#ef5350' }}>false</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Can Enable Stage C</div>
            <div style={{ ...valueStyle, color: '#ef5350' }}>false</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Validator</div>
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
        </div>
        <div style={{ marginTop: 8, padding: 12, background: '#16213e', borderRadius: 4, border: '1px solid #ef5350' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#ef5350' }}>
            Stage C remains disabled. This page cannot authorize Stage C. This page cannot enable Stage C.
          </div>
          <div style={{ fontSize: 12, color: '#ffa726', marginTop: 4 }}>
            Human authorization must be provided outside this preview and committed as an explicit reviewed artifact in a later task.
          </div>
        </div>
      </div>

      {/* 2. Current Seal Baseline */}
      <div style={{ ...sectionStyle, border: '1px solid #66bb6a' }}>
        <div style={{ ...headerStyle, color: '#66bb6a' }}>2. Current Seal Baseline</div>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <div style={labelStyle}>v7.34 Final</div>
            <div style={{ ...valueStyle, fontSize: 12, color: '#ffa726' }}>V7_34_FINAL_SEAL_READY_WITH_ROUTE_SMOKE_DEFERRED</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>v7.35 D1 Current</div>
            <div style={{ ...valueStyle, fontSize: 12, color: '#42a5f5' }}>V7_35_D1_STAGE_C_HUMAN_AUTHORIZATION_PACKAGE_READY</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>v7.35 D2 Current</div>
            <div style={{ ...valueStyle, fontSize: 12, color: '#66bb6a' }}>V7_35_D2_STAGE_C_AUTHORIZATION_CONTRACT_FROZEN</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>v7.35 P1 Current</div>
            <div style={{ ...valueStyle, fontSize: 12, color: '#ffa726' }}>V7_35_P1_STAGE_C_AUTHORIZATION_REVIEW_CONSOLE_PREVIEW_READY</div>
          </div>
        </div>
      </div>

      {/* 3. Human Authorization Requirement */}
      <div style={{ ...sectionStyle, border: '1px solid #ffa726' }}>
        <div style={{ ...headerStyle, color: '#ffa726' }}>3. Human Authorization Requirement</div>
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <p>Human owner must provide <strong>explicit written authorization</strong> before Stage C enablement planning can proceed.</p>
          <p>Authorization requires:</p>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>Named human owner as signer</li>
            <li>Strict template from authorization text spec</li>
            <li>Timestamp, scope, and signature</li>
            <li>Acknowledgment of all forbidden actions and readiness contracts</li>
          </ul>
          <p style={{ color: '#ef5350' }}>
            This page cannot authorize Stage C. Human authorization must be committed as a separate reviewed artifact.
          </p>
        </div>
      </div>

      {/* 4. Required Authorization Text */}
      <div style={sectionStyle}>
        <div style={headerStyle}>4. Required Authorization Text</div>
        <div style={{ fontSize: 13, lineHeight: 1.8, padding: 12, background: '#16213e', borderRadius: 4, border: '1px solid #2a2a4a', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`I, [human owner name], confirm that I have read and understood:

1. v7.34 Final Seal Recheck
2. Stage C Readiness Contract v1 (24 terms)
3. Forbidden Actions Contract (19 items)
4. Human Review Policy
5. Evidence Requirements
6. Rollback/Recovery Policy
7. Authorization Blocker Checklist (all blockers resolved)

I authorize the next phase: Stage C Enablement Implementation Planning.

This authorization does NOT immediately enable Stage C.
Stage C remains disabled until a separate enablement task.`}
        </div>
      </div>

      {/* 5. Required Fields Matrix */}
      <div style={sectionStyle}>
        <div style={headerStyle}>5. Required Fields Matrix</div>
        {registry.filter(i => i.category === 'required_field').map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badgeStyle(statusColor(item.status))}>{item.status}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.summary}</div>
          </div>
        ))}
      </div>

      {/* 6. Blocker Checklist */}
      <div style={{ ...sectionStyle, border: '1px solid #ef5350' }}>
        <div style={{ ...headerStyle, color: '#ef5350' }}>6. Blocker Checklist</div>
        {registry.filter(i => i.category === 'blocker').map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badgeStyle(statusColor(item.status))}>{item.status}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.summary}</div>
          </div>
        ))}
      </div>

      {/* 7. Evidence Requirements */}
      <div style={sectionStyle}>
        <div style={headerStyle}>7. Evidence Requirements</div>
        {registry.filter(i => i.category === 'evidence').map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badgeStyle(statusColor(item.status))}>{item.status}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.evidenceRef}</div>
          </div>
        ))}
      </div>

      {/* 8. Forbidden Automation Contract */}
      <div style={{ ...sectionStyle, border: '1px solid #ef5350' }}>
        <div style={{ ...headerStyle, color: '#ef5350' }}>8. Forbidden Automation Contract</div>
        {registry.filter(i => i.category === 'forbidden_automation').map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badgeStyle(statusColor(item.status))}>{item.status}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.summary}</div>
          </div>
        ))}
      </div>

      {/* 9. Safety Boundary */}
      <div style={{ ...sectionStyle, border: '1px solid #66bb6a' }}>
        <div style={{ ...headerStyle, color: '#66bb6a' }}>9. Safety Boundary</div>
        <ul style={{ fontSize: 13, lineHeight: 2, paddingLeft: 20 }}>
          <li>Stage C disabled — no enable capability</li>
          <li>No authorize capability — canAuthorize=false on all items</li>
          <li>No approve/deny mutation</li>
          <li>No authorization auto-approval</li>
          <li>No POST runtime</li>
          <li>No DB write</li>
          <li>No executor</li>
          <li>No external control</li>
          <li>No connector action</li>
          <li>No sidebar exposure — hidden direct only</li>
          <li>No tag/release</li>
          <li>No evidence/audit write</li>
          <li>No AI-generated fake authorization</li>
        </ul>
      </div>

      {/* 10. Validator Summary */}
      <div style={{ ...sectionStyle, border: `1px solid ${validation.pass ? '#66bb6a' : '#ef5350'}` }}>
        <div style={{ ...headerStyle, color: validation.pass ? '#66bb6a' : '#ef5350' }}>
          10. Validator Summary
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

      {/* 11. Contract Items by Category */}
      <div style={sectionStyle}>
        <div style={headerStyle}>11. Contract Items by Category</div>
        {categories.map(cat => {
          const catItems = registry.filter(i => i.category === cat);
          return (
            <div key={cat} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary, #e0e0e0)', textTransform: 'capitalize' }}>
                {cat.replace('_', ' ')} ({catItems.length})
              </div>
              {catItems.map(item => (
                <div key={item.id} style={{ padding: '6px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.title}</span>
                  <span style={badgeStyle(statusColor(item.status))}>{item.status}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* 12. Human Owner Next Step + Final Warning */}
      <div style={{ ...sectionStyle, border: '1px solid #ffa726' }}>
        <div style={{ ...headerStyle, color: '#ffa726' }}>12. Human Owner Next Step</div>
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>Review all 28 authorization contract terms</li>
            <li>Verify all blockers are resolved (blocking=0)</li>
            <li>Prepare authorization text using the required template</li>
            <li>Wait 24h cooldown period</li>
            <li>Provide final confirmation with signature</li>
            <li>Commit authorization as a separate reviewed artifact</li>
            <li>Proceed to Stage C Enablement Implementation Planning</li>
          </ol>
        </div>
        <div style={{ marginTop: 12, padding: 12, background: '#1a1a2e', borderRadius: 4, border: '2px solid #ef5350' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#ef5350' }}>FINAL WARNING</div>
          <div style={{ fontSize: 12, color: '#ffa726', marginTop: 4, fontWeight: 600 }}>
            Authorization is NOT execution.
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary, #8892b0)', marginTop: 4 }}>
            This page cannot authorize Stage C. Human authorization must be provided outside this preview and committed as an explicit reviewed artifact in a later task.
          </div>
          <div style={{ fontSize: 12, color: '#ef5350', marginTop: 4, fontWeight: 600 }}>
            Stage C remains disabled.
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default StageCAuthorizationReviewConsolePreview;
