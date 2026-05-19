import React from 'react';
import PageShell from '../components/ui/PageShell';
import { STAGE_C_PREENABLE_SEAL_CANDIDATE_REGISTRY } from '../registry/stage-c-preenable-seal-candidate-registry';
import { validatePreEnableSealCandidate } from '../registry/stage-c-preenable-seal-candidate-validator';

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
    case 'confirmed': return '#66bb6a';
    case 'deferred': return '#ffa726';
    case 'not_applicable': return '#757575';
    default: return '#757575';
  }
};

const StageCPreenableSealCandidatePreview: React.FC = () => {
  const registry = STAGE_C_PREENABLE_SEAL_CANDIDATE_REGISTRY;
  const validation = validatePreEnableSealCandidate();

  const requiredItems = registry.filter(i => i.requiredForPreEnable);
  const confirmedItems = registry.filter(i => i.status === 'confirmed');
  const deferredItems = registry.filter(i => i.status === 'deferred');
  const areas = [...new Set(registry.map(i => i.area))].sort();

  return (
    <PageShell
      title="Stage C Pre-Enable Seal Candidate Preview"
      subtitle="v7.34.0-P4 · Readonly · Stage C is still disabled · No enable action available"
      safetyBoundary="readonly"
      safetyText="只读 pre-enable seal candidate · Stage C 未启用 · 无 enable 按钮 · 不入 sidebar · 不执行动作 · 不是启用"
    >
      {/* 1. Pre-Enable Seal Chain */}
      <div style={{ ...sectionStyle, border: '1px solid #42a5f5' }}>
        <div style={{ ...headerStyle, color: '#42a5f5' }}>1. Pre-Enable Seal Chain</div>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <div style={labelStyle}>Seal Items</div>
            <div style={valueStyle}>{registry.length}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Required for Pre-Enable</div>
            <div style={valueStyle}>{requiredItems.length}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Confirmed</div>
            <div style={{ ...valueStyle, color: '#66bb6a' }}>{confirmedItems.length}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Deferred</div>
            <div style={{ ...valueStyle, color: deferredItems.length === 0 ? '#66bb6a' : '#ffa726' }}>
              {deferredItems.length}
            </div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Can Enable Stage C</div>
            <div style={{ ...valueStyle, color: '#ef5350' }}>false</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Action Allowed</div>
            <div style={{ ...valueStyle, color: '#ef5350' }}>false</div>
          </div>
        </div>
        <div style={{ marginTop: 8, padding: 12, background: '#16213e', borderRadius: 4, border: '1px solid #ef5350' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#ef5350' }}>
            Stage C is still disabled. This is not an enablement page. No enable action is available.
          </div>
        </div>
      </div>

      {/* 2. Required-for-PreEnable Matrix */}
      <div style={{ ...sectionStyle, border: '1px solid #66bb6a' }}>
        <div style={{ ...headerStyle, color: '#66bb6a' }}>2. Required-for-PreEnable Matrix</div>
        {requiredItems.map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badgeStyle(statusColor(item.status))}>{item.status}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.evidenceRef}</div>
          </div>
        ))}
      </div>

      {/* 3. Human Approval Gate */}
      <div style={{ ...sectionStyle, border: '1px solid #ffa726' }}>
        <div style={{ ...headerStyle, color: '#ffa726' }}>3. Human Approval Gate</div>
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <p>Pre-enable seal requires the following human approval gates:</p>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>Human owner approval required — <strong>confirmed</strong></li>
            <li>Second confirmation required — <strong>confirmed</strong></li>
            <li>Denial policy exists — <strong>confirmed</strong></li>
            <li>Decision record spec exists — <strong>confirmed</strong></li>
          </ul>
          <p style={{ color: '#ef5350' }}>
            This page cannot approve, deny, or enable Stage C. All gates are requirements only.
          </p>
        </div>
      </div>

      {/* 4. Evidence Readiness */}
      <div style={sectionStyle}>
        <div style={headerStyle}>4. Evidence Readiness</div>
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

      {/* 5. Validator Readiness */}
      <div style={sectionStyle}>
        <div style={headerStyle}>5. Validator Readiness</div>
        {registry.filter(i => i.area === 'validator').map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badgeStyle(statusColor(item.status))}>{item.status}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.evidenceRef}</div>
          </div>
        ))}
      </div>

      {/* 6. Smoke Readiness */}
      <div style={sectionStyle}>
        <div style={headerStyle}>6. Smoke Readiness</div>
        {registry.filter(i => i.area === 'smoke').map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badgeStyle(statusColor(item.status))}>{item.status}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.evidenceRef}</div>
          </div>
        ))}
      </div>

      {/* 7. Rollback/Recovery Readiness */}
      <div style={{ ...sectionStyle, border: '1px solid #ffa726' }}>
        <div style={{ ...headerStyle, color: '#ffa726' }}>7. Rollback / Recovery Readiness</div>
        {registry.filter(i => i.area === 'rollback_recovery').map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badgeStyle(statusColor(item.status))}>{item.status}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.evidenceRef}</div>
          </div>
        ))}
      </div>

      {/* 8. Safety Boundary */}
      <div style={{ ...sectionStyle, border: '1px solid #66bb6a' }}>
        <div style={{ ...headerStyle, color: '#66bb6a' }}>8. Safety Boundary</div>
        <ul style={{ fontSize: 13, lineHeight: 2, paddingLeft: 20 }}>
          <li>Stage C disabled — confirmed across all registries</li>
          <li>POST blocked — no runtime endpoint implemented</li>
          <li>DB write not occurred — all registries enforce readonly</li>
          <li>External control not occurred — no tool/connector actions</li>
          <li>Executor absent — no execution capability</li>
          <li>Connector action absent — all connectors readonly</li>
          <li>Sidebar boundary confirmed — hidden direct only</li>
          <li>Tag/release not performed — commit-only</li>
        </ul>
      </div>

      {/* 9. Forbidden Actions */}
      <div style={{ ...sectionStyle, border: '1px solid #ef5350' }}>
        <div style={{ ...headerStyle, color: '#ef5350' }}>9. Forbidden Actions</div>
        <ul style={{ fontSize: 13, lineHeight: 2, paddingLeft: 20 }}>
          <li>Do not enable Stage C — no enable capability exists</li>
          <li>Do not implement POST runtime endpoint</li>
          <li>Do not write to DB — no DB write capability exists</li>
          <li>Do not execute runtime — no executor implemented</li>
          <li>Do not control external tools — no connector action</li>
          <li>Do not expose to sidebar — all routes are hidden direct</li>
          <li>Do not create git tag or GitHub Release</li>
          <li>Do not skip human owner approval</li>
          <li>Do not bypass second confirmation</li>
          <li>Do not treat seal candidate as final enablement</li>
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

      {/* 11. Items by Area */}
      <div style={sectionStyle}>
        <div style={headerStyle}>11. Items by Area</div>
        {areas.map(area => {
          const areaItems = registry.filter(i => i.area === area);
          return (
            <div key={area} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary, #e0e0e0)', textTransform: 'capitalize' }}>
                {area.replace('_', ' ')} ({areaItems.length})
              </div>
              {areaItems.map(item => (
                <div key={item.id} style={{ padding: '6px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.title}</span>
                  <span style={badgeStyle(statusColor(item.status))}>{item.status}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* 12. Next Step: v7.34 Final Seal Recheck */}
      <div style={{ ...sectionStyle, border: '1px solid #ffa726' }}>
        <div style={{ ...headerStyle, color: '#ffa726' }}>12. Next Step</div>
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>Review pre-enable seal chain — confirm all 29 items</li>
            <li>Verify required-for-pre-enable matrix — all items confirmed</li>
            <li>Confirm human approval gates — all requirements documented</li>
            <li>Check evidence readiness — all required evidence exists</li>
            <li>Verify validator results — all checks must pass (blocking=0)</li>
            <li>Confirm safety boundaries — Stage C disabled, POST blocked, etc.</li>
            <li>Create v7.34 Final Seal Recheck doc</li>
            <li>Do not enable Stage C from this page — no enable button exists</li>
          </ol>
        </div>
        <div style={{ marginTop: 12, padding: 12, background: '#1a1a2e', borderRadius: 4, border: '1px solid #2a2a4a' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#ffa726' }}>Next Phase Recommendation</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary, #8892b0)', marginTop: 4 }}>
            v7.34.0 Final Seal Recheck
          </div>
          <div style={{ fontSize: 12, color: '#ef5350', marginTop: 4, fontWeight: 600 }}>
            Stage C remains disabled. Pre-enable seal candidate is not final enablement.
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default StageCPreenableSealCandidatePreview;
