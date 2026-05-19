import React from 'react';
import PageShell from '../components/ui/PageShell';
import {
  OPERATOR_CONSOLE_SEAL_CANDIDATE_REGISTRY,
  type OperatorConsoleSealCandidateArea,
} from '../registry/operator-console-seal-candidate-registry';
import {
  validateOperatorConsoleSealCandidate,
} from '../registry/operator-console-seal-candidate-validator';

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
    case 'sealed': return '#66bb6a';
    case 'ready': return '#42a5f5';
    case 'blocked': return '#ef5350';
    case 'deferred': return '#ffa726';
    case 'not_applicable': return '#757575';
    default: return '#757575';
  }
};

const OperatorConsoleSealCandidatePreview: React.FC = () => {
  const registry = OPERATOR_CONSOLE_SEAL_CANDIDATE_REGISTRY;
  const validation = validateOperatorConsoleSealCandidate();

  const areas = [...new Set(registry.map(i => i.area))].sort() as OperatorConsoleSealCandidateArea[];
  const requiredItems = registry.filter(i => i.requiredForSeal);
  const sealedItems = registry.filter(i => i.status === 'sealed');
  const readyItems = registry.filter(i => i.status === 'ready');

  return (
    <PageShell
      title="Operator Console Seal Candidate Preview"
      subtitle="v7.33.0-P4 · Readonly seal candidate overview · Not a final seal · Not Stage C · Not a release"
      safetyBoundary="readonly"
      safetyText="只读 seal candidate 预览 · 不执行动作 · 不启用 Stage C · 不入 sidebar · 不 tag/release"
    >
      {/* 1. Seal Chain */}
      <div style={{ ...sectionStyle, border: '1px solid #66bb6a' }}>
        <div style={{ ...headerStyle, color: '#66bb6a' }}>1. Seal Chain</div>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <div style={labelStyle}>v7.32 P2</div>
            <div style={{ ...valueStyle, fontSize: 12 }}>V7_32_PRODUCTIZATION_SEAL_READY</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>v7.33 D1</div>
            <div style={{ ...valueStyle, fontSize: 12 }}>V7_33_D1_OPERATOR_CONSOLE_BLUEPRINT_READY</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>v7.33 P1</div>
            <div style={{ ...valueStyle, fontSize: 12 }}>V7_33_P1_OPERATOR_CONSOLE_REGISTRY_PREVIEW_READY</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>v7.33 P2</div>
            <div style={{ ...valueStyle, fontSize: 12 }}>V7_33_P2_OPERATOR_CONSOLE_READONLY_UI_PREVIEW_READY</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>v7.33 P3</div>
            <div style={{ ...valueStyle, fontSize: 12 }}>V7_33_P3_OPERATOR_CHECKLIST_EVIDENCE_LINKAGE_PREVIEW_READY</div>
          </div>
          <div style={{ ...cardStyle, border: '1px solid #ffa726' }}>
            <div style={labelStyle}>v7.33 P4 (Current)</div>
            <div style={{ ...valueStyle, fontSize: 12, color: '#ffa726' }}>V7_33_P4_OPERATOR_CONSOLE_SEAL_CANDIDATE_READY</div>
          </div>
        </div>
      </div>

      {/* 2. Candidate Readiness Summary */}
      <div style={sectionStyle}>
        <div style={headerStyle}>2. Candidate Readiness Summary</div>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <div style={labelStyle}>Total Items</div>
            <div style={valueStyle}>{registry.length}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Required for Seal</div>
            <div style={valueStyle}>{requiredItems.length}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Sealed</div>
            <div style={{ ...valueStyle, color: '#66bb6a' }}>{sealedItems.length}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Ready</div>
            <div style={{ ...valueStyle, color: '#42a5f5' }}>{readyItems.length}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Deferred</div>
            <div style={{ ...valueStyle, color: '#ffa726' }}>{registry.filter(i => i.status === 'deferred').length}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Validator</div>
            <div style={{ ...valueStyle, color: validation.pass ? '#66bb6a' : '#ef5350' }}>
              {validation.pass ? 'PASS' : 'FAIL'}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary, #8892b0)', marginTop: 8 }}>
          Areas: {areas.join(', ')}
        </div>
      </div>

      {/* 3. Required-for-Seal Matrix */}
      <div style={{ ...sectionStyle, border: '1px solid #42a5f5' }}>
        <div style={{ ...headerStyle, color: '#42a5f5' }}>3. Required-for-Seal Matrix</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary, #8892b0)', marginBottom: 12 }}>
          {requiredItems.length} items required for seal. All must be sealed or ready.
        </div>
        {requiredItems.map(item => (
          <div key={item.id} style={rowStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={{ fontSize: 11, color: 'var(--text-secondary, #8892b0)' }}>({item.area})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={badgeStyle(statusColor(item.status))}>{item.status}</span>
              {item.linkedPreviewRoute && (
                <a href={item.linkedPreviewRoute} style={{ fontSize: 11, color: '#42a5f5', textDecoration: 'none' }}>
                  preview
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 4. Evidence Coverage */}
      <div style={sectionStyle}>
        <div style={headerStyle}>4. Evidence Coverage</div>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <div style={labelStyle}>Items with Evidence</div>
            <div style={valueStyle}>{registry.filter(i => i.evidenceRef).length}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Items with Linked Doc</div>
            <div style={valueStyle}>{registry.filter(i => i.linkedDoc).length}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Items with Route</div>
            <div style={valueStyle}>{registry.filter(i => i.linkedPreviewRoute).length}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Phases Covered</div>
            <div style={valueStyle}>D1, P1, P2, P3, P4</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary, #8892b0)', marginTop: 4 }}>
          Evidence references cover v7.32 baseline, D1 blueprint, P1 registry, P2 UI, P3 checklist/evidence, and P4 seal candidate.
        </div>
      </div>

      {/* 5. Safety Boundary Confirmation */}
      <div style={{ ...sectionStyle, border: '1px solid #ef5350' }}>
        <div style={{ ...headerStyle, color: '#ef5350' }}>5. Safety Boundary Confirmation</div>
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
          <div style={{ ...cardStyle, border: '1px solid #66bb6a' }}>
            <div style={labelStyle}>Evidence Write</div>
            <div style={{ ...valueStyle, color: '#66bb6a' }}>Not Occurred</div>
          </div>
          <div style={{ ...cardStyle, border: '1px solid #66bb6a' }}>
            <div style={labelStyle}>Audit Write</div>
            <div style={{ ...valueStyle, color: '#66bb6a' }}>Not Occurred</div>
          </div>
        </div>
      </div>

      {/* 6. Hidden Route / Sidebar Boundary */}
      <div style={sectionStyle}>
        <div style={headerStyle}>6. Hidden Route / Sidebar Boundary</div>
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li><strong>Route:</strong> <code>/operator-console-seal-candidate-preview</code></li>
            <li><strong>Type:</strong> Hidden direct (not in sidebar, not in primary nav)</li>
            <li><strong>Center Access:</strong> hidden_direct, visibleInSidebar=false</li>
            <li><strong>Navigation Exposure:</strong> direct_route, keep_direct_route recommendation</li>
            <li><strong>Sidebar:</strong> No entries in menu-registry or Layout</li>
            <li><strong>P1 route:</strong> <code>/operator-console-registry-preview</code> (hidden direct)</li>
            <li><strong>P2 route:</strong> <code>/operator-console-readonly-preview</code> (hidden direct)</li>
            <li><strong>P3 route:</strong> <code>/operator-checklist-evidence-preview</code> (hidden direct)</li>
          </ul>
        </div>
      </div>

      {/* 7. Validator Summary */}
      <div style={{ ...sectionStyle, border: `1px solid ${validation.pass ? '#66bb6a' : '#ef5350'}` }}>
        <div style={{ ...headerStyle, color: validation.pass ? '#66bb6a' : '#ef5350' }}>
          7. Validator Summary
        </div>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <div style={labelStyle}>Status</div>
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
            <div style={labelStyle}>Warning</div>
            <div style={{ ...valueStyle, color: validation.warning === 0 ? '#66bb6a' : '#ffa726' }}>
              {validation.warning}
            </div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Info</div>
            <div style={valueStyle}>{validation.info}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Total Checks</div>
            <div style={valueStyle}>{validation.checks.length}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Verdict</div>
            <div style={{ ...valueStyle, fontSize: 11, color: '#ffa726' }}>Seal Candidate</div>
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

      {/* 8. Forbidden Actions */}
      <div style={{ ...sectionStyle, border: '1px solid #ef5350' }}>
        <div style={{ ...headerStyle, color: '#ef5350' }}>8. Forbidden Actions</div>
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>Do not enable Stage C — no Stage C button exists on any operator console page</li>
            <li>Do not implement POST runtime — POST remains blocked (401)</li>
            <li>Do not write to DB — no DB write capability exists</li>
            <li>Do not control external tools — no external control implemented</li>
            <li>Do not execute runtime — no executor implemented</li>
            <li>Do not capture or write evidence — no evidence write/store from console</li>
            <li>Do not write audit store — no audit mutation from console</li>
            <li>Do not execute rollback — rollback requires documented procedure</li>
            <li>Do not auto-restart server — restart requires human approval</li>
            <li>Do not create tag or release from P4 — defer to Final Seal Recheck</li>
            <li>Do not expose routes to sidebar — all routes are hidden direct only</li>
            <li>Do not add action buttons, submit forms, or mutation UI — console is readonly</li>
            <li>Do not treat P4 as final seal — P4 is a seal candidate only</li>
          </ul>
        </div>
      </div>

      {/* 9. V7.33 Phase Coverage */}
      <div style={sectionStyle}>
        <div style={headerStyle}>9. V7.33 Phase Coverage</div>
        <div style={gridStyle}>
          <div style={{ ...cardStyle, border: '1px solid #42a5f5' }}>
            <div style={labelStyle}>D1 Blueprint</div>
            <div style={{ ...valueStyle, fontSize: 12, color: '#42a5f5' }}>8 design docs</div>
          </div>
          <div style={{ ...cardStyle, border: '1px solid #66bb6a' }}>
            <div style={labelStyle}>P1 Registry</div>
            <div style={{ ...valueStyle, fontSize: 12, color: '#66bb6a' }}>20 items, validator pass</div>
          </div>
          <div style={{ ...cardStyle, border: '1px solid #ffa726' }}>
            <div style={labelStyle}>P2 Readonly UI</div>
            <div style={{ ...valueStyle, fontSize: 12, color: '#ffa726' }}>8 sections, hidden route</div>
          </div>
          <div style={{ ...cardStyle, border: '1px solid #ab47bc' }}>
            <div style={labelStyle}>P3 Checklist + Evidence</div>
            <div style={{ ...valueStyle, fontSize: 12, color: '#ab47bc' }}>24 items, 15 links, validator pass</div>
          </div>
          <div style={{ ...cardStyle, border: '1px solid #ff7043' }}>
            <div style={labelStyle}>P4 Seal Candidate</div>
            <div style={{ ...valueStyle, fontSize: 12, color: '#ff7043' }}>24 items, validator pass</div>
          </div>
        </div>
      </div>

      {/* 10. Final Seal Recheck Next Step */}
      <div style={{ ...sectionStyle, border: '1px solid #ffa726' }}>
        <div style={{ ...headerStyle, color: '#ffa726' }}>10. Final Seal Recheck Next Step</div>
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>Review seal candidate registry — confirm all 24 items are accurate</li>
            <li>Review required-for-seal matrix — acknowledge each required item status</li>
            <li>Confirm validator result: blocking=0, pass=true</li>
            <li>Verify safety boundaries: Stage C disabled, POST blocked, DB not written, external control not occurred, executor absent</li>
            <li>Confirm hidden-direct boundary: no sidebar, no primary nav, no menu-registry entry</li>
            <li>Verify evidence coverage: reports and receipts for D1/P1/P2/P3/P4</li>
            <li>Run full validation: typecheck, tests, build, safety search</li>
          </ol>
        </div>
        <div style={{ marginTop: 12, padding: 12, background: '#1a1a2e', borderRadius: 4, border: '1px solid #2a2a4a' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#ffa726' }}>Next Phase Recommendation</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary, #8892b0)', marginTop: 4 }}>
            v7.33.0 Final Seal Recheck
          </div>
          <div style={{ fontSize: 12, color: '#ef5350', marginTop: 4, fontWeight: 600 }}>
            Still do not enter Stage C.
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default OperatorConsoleSealCandidatePreview;
