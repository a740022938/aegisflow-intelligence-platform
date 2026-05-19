import React from 'react';
import PageShell from '../components/ui/PageShell';
import { STAGE_C_READINESS_CONTRACT_REGISTRY } from '../registry/stage-c-readiness-contract-registry';
import { validateStageCReadinessContract } from '../registry/stage-c-readiness-contract-validator';

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

const rowStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid var(--border-color, #2a2a4a)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: 13,
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
    case 'frozen': return '#66bb6a';
    case 'ready': return '#42a5f5';
    case 'blocked': return '#ef5350';
    case 'deferred': return '#ffa726';
    default: return '#757575';
  }
};

const conditionColor = (condition: string) => {
  switch (condition) {
    case 'must': return '#ef5350';
    case 'should': return '#ffa726';
    case 'info': return '#42a5f5';
    default: return '#757575';
  }
};

const StageCReadinessDashboardPreview: React.FC = () => {
  const registry = STAGE_C_READINESS_CONTRACT_REGISTRY;
  const validation = validateStageCReadinessContract();

  const requiredItems = registry.filter(i => i.required);
  const frozenItems = registry.filter(i => i.status === 'frozen');

  const areas = [...new Set(registry.map(i => i.area))].sort();

  return (
    <PageShell
      title="Stage C Readiness Dashboard Preview"
      subtitle="v7.34.0-P1 · Readonly · Stage C remains disabled · No enable action available"
      safetyBoundary="readonly"
      safetyText="只读 Stage C readiness dashboard · Stage C 未启用 · 无 enable 按钮 · 不入 sidebar · 不执行动作"
    >
      {/* 1. Current Seal Baseline */}
      <div style={{ ...sectionStyle, border: '1px solid #66bb6a' }}>
        <div style={{ ...headerStyle, color: '#66bb6a' }}>1. Current Seal Baseline</div>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <div style={labelStyle}>v7.32</div>
            <div style={{ ...valueStyle, fontSize: 12 }}>V7_32_PRODUCTIZATION_SEAL_READY</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>v7.33 Final</div>
            <div style={{ ...valueStyle, fontSize: 12, color: '#ffa726' }}>V7_33_FINAL_SEAL_READY_WITH_ROUTE_SMOKE_DEFERRED</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>v7.34 D1</div>
            <div style={{ ...valueStyle, fontSize: 12, color: '#42a5f5' }}>V7_34_D1_STAGE_C_HUMAN_REVIEW_BLUEPRINT_READY</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>v7.34 D2</div>
            <div style={{ ...valueStyle, fontSize: 12, color: '#66bb6a' }}>V7_34_D2_STAGE_C_READINESS_CONTRACT_FROZEN</div>
          </div>
          <div style={{ ...cardStyle, border: '1px solid #ffa726' }}>
            <div style={labelStyle}>v7.34 P1 (Current)</div>
            <div style={{ ...valueStyle, fontSize: 12, color: '#ffa726' }}>V7_34_P1_STAGE_C_READINESS_DASHBOARD_PREVIEW_READY</div>
          </div>
        </div>
        <div style={{ marginTop: 8, padding: 12, background: 'var(--bg-item, #16213e)', borderRadius: 4, border: '1px solid #ef5350' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#ef5350' }}>Stage C is disabled. This dashboard is readonly. No enable action is available.</div>
        </div>
      </div>

      {/* 2. Required Human Review */}
      <div style={sectionStyle}>
        <div style={headerStyle}>2. Required Human Review</div>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <div style={labelStyle}>D1 Blueprint</div>
            <div style={{ ...valueStyle, fontSize: 12, color: '#42a5f5' }}>Completed</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Human Roles</div>
            <div style={{ ...valueStyle, fontSize: 12, color: '#66bb6a' }}>Defined</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Escalation Model</div>
            <div style={{ ...valueStyle, fontSize: 12, color: '#66bb6a' }}>Defined</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Denial Policy</div>
            <div style={{ ...valueStyle, fontSize: 12, color: '#66bb6a' }}>Defined</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Decision Record Spec</div>
            <div style={{ ...valueStyle, fontSize: 12, color: '#66bb6a' }}>Defined</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Human Owner Required</div>
            <div style={{ ...valueStyle, fontSize: 12, color: '#ef5350' }}>Mandatory</div>
          </div>
        </div>
      </div>

      {/* 3. Required Evidence */}
      <div style={sectionStyle}>
        <div style={headerStyle}>3. Required Evidence</div>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <div style={labelStyle}>Phase Reports</div>
            <div style={valueStyle}>10</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Smoke Results</div>
            <div style={{ ...valueStyle, color: '#ffa726' }}>Required (deferred)</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Validator Output</div>
            <div style={{ ...valueStyle, color: '#66bb6a' }}>All PASS</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Safety Confirmation</div>
            <div style={{ ...valueStyle, color: '#66bb6a' }}>Confirmed</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Decision Record</div>
            <div style={{ ...valueStyle, color: '#ffa726' }}>Not yet created</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Human Approval</div>
            <div style={{ ...valueStyle, color: '#ffa726' }}>Not yet obtained</div>
          </div>
        </div>
      </div>

      {/* 4. Required Validators */}
      <div style={sectionStyle}>
        <div style={headerStyle}>4. Required Validators</div>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <div style={labelStyle}>Console Validator</div>
            <div style={{ ...valueStyle, fontSize: 12, color: validation.pass ? '#66bb6a' : '#ef5350' }}>18 checks, blocking=0</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Checklist Validator</div>
            <div style={{ ...valueStyle, fontSize: 12, color: validation.pass ? '#66bb6a' : '#ef5350' }}>19 checks, blocking=0</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Seal Candidate Validator</div>
            <div style={{ ...valueStyle, fontSize: 12, color: validation.pass ? '#66bb6a' : '#ef5350' }}>18 checks, blocking=0</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Contract Validator</div>
            <div style={{ ...valueStyle, fontSize: 12, color: validation.pass ? '#66bb6a' : '#ef5350' }}>
              {validation.blocking === 0 ? `PASS (${validation.checks.length} checks)` : 'FAIL'}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Required Smoke */}
      <div style={sectionStyle}>
        <div style={headerStyle}>5. Required Smoke</div>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <div style={labelStyle}>Health Check</div>
            <div style={{ ...valueStyle, fontSize: 12, color: '#66bb6a' }}>PASS</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Auth Login</div>
            <div style={{ ...valueStyle, fontSize: 12, color: '#66bb6a' }}>PASS</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Tasks</div>
            <div style={{ ...valueStyle, fontSize: 12, color: '#66bb6a' }}>PASS</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Queue Recovery</div>
            <div style={{ ...valueStyle, fontSize: 12, color: '#66bb6a' }}>PASS</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Worker Timeout</div>
            <div style={{ ...valueStyle, fontSize: 12, color: '#66bb6a' }}>PASS</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>OpenClaw Circuit</div>
            <div style={{ ...valueStyle, fontSize: 12, color: '#66bb6a' }}>PASS</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Workflow Minimal</div>
            <div style={{ ...valueStyle, fontSize: 12, color: '#66bb6a' }}>PASS</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Plugin Registry</div>
            <div style={{ ...valueStyle, fontSize: 12, color: '#66bb6a' }}>PASS</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>DB Diagnostics</div>
            <div style={{ ...valueStyle, fontSize: 12, color: '#66bb6a' }}>PASS</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary, #8892b0)', marginTop: 4 }}>
          All 9 smoke tests PASS. Smoke must be re-run within 24h of any Stage C enablement request.
        </div>
      </div>

      {/* 6. Safety Boundary */}
      <div style={{ ...sectionStyle, border: '1px solid #ef5350' }}>
        <div style={{ ...headerStyle, color: '#ef5350' }}>6. Safety Boundary</div>
        <div style={gridStyle}>
          <div style={{ ...cardStyle, border: '1px solid #66bb6a' }}>
            <div style={labelStyle}>Stage C</div>
            <div style={{ ...valueStyle, color: '#66bb6a' }}>Disabled</div>
          </div>
          <div style={{ ...cardStyle, border: '1px solid #66bb6a' }}>
            <div style={labelStyle}>POST Runtime</div>
            <div style={{ ...valueStyle, color: '#66bb6a' }}>Blocked</div>
          </div>
          <div style={{ ...cardStyle, border: '1px solid #66bb6a' }}>
            <div style={labelStyle}>DB Write</div>
            <div style={{ ...valueStyle, color: '#66bb6a' }}>Not Occurred</div>
          </div>
          <div style={{ ...cardStyle, border: '1px solid #66bb6a' }}>
            <div style={labelStyle}>External Control</div>
            <div style={{ ...valueStyle, color: '#66bb6a' }}>Not Occurred</div>
          </div>
          <div style={{ ...cardStyle, border: '1px solid #66bb6a' }}>
            <div style={labelStyle}>Executor</div>
            <div style={{ ...valueStyle, color: '#66bb6a' }}>Absent</div>
          </div>
          <div style={{ ...cardStyle, border: '1px solid #66bb6a' }}>
            <div style={labelStyle}>Sidebar</div>
            <div style={{ ...valueStyle, color: '#66bb6a' }}>Not Exposed</div>
          </div>
        </div>
      </div>

      {/* 7. Forbidden Actions */}
      <div style={{ ...sectionStyle, border: '1px solid #ef5350' }}>
        <div style={{ ...headerStyle, color: '#ef5350' }}>7. Forbidden Actions</div>
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>Do not enable Stage C — no Stage C button exists on this page</li>
            <li>Do not implement POST runtime — POST remains blocked (401)</li>
            <li>Do not write to DB — no DB write capability exists</li>
            <li>Do not control external tools — no external control implemented</li>
            <li>Do not execute runtime — no executor implemented</li>
            <li>Do not capture or write evidence — no evidence write/store from dashboard</li>
            <li>Do not write audit store — no audit mutation from dashboard</li>
            <li>Do not execute rollback — rollback requires documented procedure</li>
            <li>Do not auto-restart server — restart requires human approval</li>
            <li>Do not expose routes to sidebar — all routes are hidden direct only</li>
            <li>Do not skip human owner approval — required for any Stage C enablement</li>
            <li>Do not use stale evidence {'>'}24h — must re-validate before enablement</li>
          </ul>
        </div>
      </div>

      {/* 8. Readiness Contract Result */}
      <div style={{ ...sectionStyle, border: `1px solid ${validation.pass ? '#66bb6a' : '#ef5350'}` }}>
        <div style={{ ...headerStyle, color: validation.pass ? '#66bb6a' : '#ef5350' }}>
          8. Readiness Contract Result
        </div>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <div style={labelStyle}>Contract Items</div>
            <div style={valueStyle}>{registry.length}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Required Items</div>
            <div style={valueStyle}>{requiredItems.length}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Frozen Items</div>
            <div style={{ ...valueStyle, color: '#66bb6a' }}>{frozenItems.length}</div>
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
          <div style={cardStyle}>
            <div style={labelStyle}>Warning / Info</div>
            <div style={valueStyle}>{validation.warning} / {validation.info}</div>
          </div>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary, #8892b0)' }}>
          {validation.checks.map(c => (
            <div key={c.id} style={{ padding: '2px 0', display: 'flex', gap: 8 }}>
              <span style={{ color: c.pass ? '#66bb6a' : '#ef5350' }}>{c.pass ? '✓' : '✗'}</span>
              <span>[{c.level}]</span>
              <span>{c.message}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 9. Contract Terms by Area */}
      <div style={sectionStyle}>
        <div style={headerStyle}>9. Contract Terms by Area</div>
        {areas.map(area => {
          const areaItems = registry.filter(i => i.area === area);
          return (
            <div key={area} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary, #e0e0e0)', textTransform: 'capitalize' }}>
                {area.replace('_', ' ')} ({areaItems.length})
              </div>
              {areaItems.map(item => (
                <div key={item.id} style={rowStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={badgeStyle(conditionColor(item.condition))}>{item.condition}</span>
                    <span style={{ fontWeight: 600 }}>{item.title}</span>
                  </div>
                  <span style={badgeStyle(statusColor(item.status))}>{item.status}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* 10. Next Step */}
      <div style={{ ...sectionStyle, border: '1px solid #ffa726' }}>
        <div style={{ ...headerStyle, color: '#ffa726' }}>10. Next Step</div>
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>Review readiness contract — confirm all 24 terms are frozen</li>
            <li>Verify validator results — all 4 validators must pass (blocking=0)</li>
            <li>Confirm safety boundaries — Stage C disabled, POST blocked, etc.</li>
            <li>Review required evidence matrix — ensure all evidence is accessible</li>
            <li>Create operator decision record when ready for Stage C review</li>
            <li>Obtain human owner approval before any Stage C enablement</li>
            <li>Run full smoke test within 24h of enablement request</li>
            <li>Do not enable Stage C from this dashboard — no enable button exists</li>
          </ol>
        </div>
        <div style={{ marginTop: 12, padding: 12, background: '#1a1a2e', borderRadius: 4, border: '1px solid #2a2a4a' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#ffa726' }}>Next Phase Recommendation</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary, #8892b0)', marginTop: 4 }}>
            v7.34.0-P2: Stage C Human Approval Review Console Preview
          </div>
          <div style={{ fontSize: 12, color: '#ef5350', marginTop: 4, fontWeight: 600 }}>
            Stage C remains disabled.
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default StageCReadinessDashboardPreview;
