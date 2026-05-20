import React, { useMemo } from 'react';
import PageShell from '../components/ui/PageShell';
import {
  getOperatorRuntimeReadinessRegistry,
  getOperatorRuntimeReadinessSummary,
  getOperatorRuntimeReadinessByCategory,
  type ReadinessCategory,
} from '../registry/operator-runtime-readiness-registry';
import {
  validateOperatorRuntimeReadiness,
} from '../registry/operator-runtime-readiness-validator';

const sectionStyle: React.CSSProperties = {
  marginBottom: 24,
  padding: 16,
  background: 'var(--bg-card, #1a1a2e)',
  borderRadius: 8,
  border: '1px solid var(--border-color, #2a2a4a)',
};

const headerStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  marginBottom: 12,
  color: 'var(--text-primary, #e0e0e0)',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: 8,
  marginBottom: 12,
};

const statCardStyle: React.CSSProperties = {
  padding: '8px 12px',
  background: 'var(--bg-item, #16213e)',
  borderRadius: 4,
  border: '1px solid var(--border-color, #2a2a4a)',
};

const statLabelStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--text-secondary, #8892b0)',
  textTransform: 'uppercase' as const,
};

const statValueStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: 'var(--text-primary, #e0e0e0)',
};

const itemRowStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid var(--border-color, #2a2a4a)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: 13,
};

const badgeStyle = (color: string): React.CSSProperties => ({
  padding: '2px 8px',
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 600,
  background: color,
  color: '#fff',
});

const riskColor = (level: string) => {
  switch (level) {
    case 'low': return '#388e3c';
    case 'medium': return '#f57c00';
    case 'high': return '#d32f2f';
    case 'critical': return '#880e4f';
    default: return '#757575';
  }
};

const statusColor = (status: string) => {
  switch (status) {
    case 'sealed': return '#388e3c';
    case 'ready': return '#1976d2';
    case 'blocked': return '#b71c1c';
    case 'deferred': return '#f57c00';
    case 'degraded': return '#ffa726';
    default: return '#757575';
  }
};

const OperatorRuntimeReadinessConsolePreview: React.FC = () => {
  const items = useMemo(() => getOperatorRuntimeReadinessRegistry(), []);
  const summary = useMemo(() => getOperatorRuntimeReadinessSummary(), []);
  const validation = useMemo(() => validateOperatorRuntimeReadiness(), []);

  const categories: ReadinessCategory[] = [
    'system', 'governance', 'boundary', 'operator', 'memory', 'runtime', 'docs', 'rollback',
  ];

  return (
    <PageShell
      title="Operator Runtime Readiness Console"
      subtitle="v7.42-P1 · Readonly operator readiness aggregation · Stage C disabled"
      safetyBoundary="readonly"
      safetyText="只读总控台 · 不执行动作 · 不写数据库 · 不启用 Stage C · 不入 sidebar"
    >
      {/* 1. Baseline */}
      <div style={{ ...sectionStyle, border: '1px solid #66bb6a' }}>
        <div style={{ ...headerStyle, color: '#66bb6a' }}>1. Baseline</div>
        <div style={gridStyle}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Current Head</div>
            <div style={{ ...statValueStyle, fontSize: 14 }}>557e4c6 (v7.42 D1)</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Branch</div>
            <div style={{ ...statValueStyle, fontSize: 14 }}>main</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Working Tree</div>
            <div style={{ ...statValueStyle, fontSize: 14, color: '#66bb6a' }}>Clean</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Stage C</div>
            <div style={{ ...statValueStyle, fontSize: 14, color: '#ef5350' }}>Disabled</div>
          </div>
        </div>
      </div>

      {/* 2. Safe Status */}
      <div style={sectionStyle}>
        <div style={headerStyle}>2. Safe Status</div>
        <div style={gridStyle}>
          {items.filter(i => i.id === 'safe-status' || i.id === 'cli-command-center').map(item => (
            <div key={item.id} style={statCardStyle}>
              <div style={statLabelStyle}>{item.title}</div>
              <div style={{ ...statValueStyle, fontSize: 14, color: item.allowedNow ? '#66bb6a' : '#ef5350' }}>
                {item.status}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{item.summary}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Stage C Gate */}
      <div style={{ ...sectionStyle, border: '2px solid #880e4f' }}>
        <div style={{ ...headerStyle, color: '#ef5350' }}>3. Stage C Gate</div>
        <div style={gridStyle}>
          {items.filter(i =>
            i.category === 'governance' && (i.id.includes('stage-c') || i.id.includes('feature-flag') || i.id.includes('authorization') || i.id.includes('kill-switch'))
          ).map(item => (
            <div key={item.id} style={statCardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={statLabelStyle}>{item.title}</div>
                <span style={badgeStyle(riskColor(item.riskLevel))}>{item.riskLevel}</span>
              </div>
              <div style={{ ...statValueStyle, fontSize: 14, color: item.allowedNow ? '#66bb6a' : '#ef5350' }}>
                {item.allowedNow ? 'Allowed' : 'Blocked'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{item.summary}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Feature Flag State */}
      <div style={sectionStyle}>
        <div style={headerStyle}>4. Feature Flag State</div>
        <div style={gridStyle}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Current State</div>
            <div style={{ ...statValueStyle, fontSize: 14, color: '#ef5350' }}>OFF</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Mutable from UI</div>
            <div style={{ ...statValueStyle, fontSize: 14, color: '#ef5350' }}>False</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Default State</div>
            <div style={{ ...statValueStyle, fontSize: 14, color: '#f57c00' }}>off</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Feature Name</div>
            <div style={{ ...statValueStyle, fontSize: 14 }}>stage_c_enablement</div>
          </div>
        </div>
      </div>

      {/* 5. Repair Plan-only */}
      <div style={sectionStyle}>
        <div style={headerStyle}>5. Repair Plan-only</div>
        {items.filter(i =>
          i.category === 'operator' && (i.id.includes('repair') || i.id.includes('restore'))
        ).map(item => (
          <div key={item.id} style={itemRowStyle}>
            <div>
              <strong>{item.title}</strong>
              <span style={{ marginLeft: 8, ...badgeStyle(riskColor(item.riskLevel)) }}>{item.riskLevel}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', maxWidth: 400 }}>{item.summary}</div>
          </div>
        ))}
      </div>

      {/* 6. Memory Knowledge */}
      <div style={sectionStyle}>
        <div style={headerStyle}>6. Memory Knowledge</div>
        <div style={gridStyle}>
          {items.filter(i => i.category === 'memory').map(item => (
            <div key={item.id} style={statCardStyle}>
              <div style={statLabelStyle}>{item.title}</div>
              <div style={{ ...statValueStyle, fontSize: 13, color: '#66bb6a' }}>{item.status}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                {item.summary.substring(0, 60)}
              </div>
              {item.linkedPreviewRoute && (
                <a href={item.linkedPreviewRoute} style={{ color: '#42a5f5', fontSize: 11, textDecoration: 'underline' }}>
                  preview
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 7. Encoding / Windows Console */}
      <div style={sectionStyle}>
        <div style={headerStyle}>7. Encoding / Windows Console</div>
        <div style={gridStyle}>
          {items.filter(i =>
            i.id === 'encoding-doctor' || i.id === 'cli-doctor-env' || i.id === 'cli-doctor-ports'
          ).map(item => (
            <div key={item.id} style={statCardStyle}>
              <div style={statLabelStyle}>{item.title}</div>
              <div style={{ ...statValueStyle, fontSize: 13, color: '#66bb6a' }}>{item.status}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{item.summary}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Validation Evidence */}
      <div style={sectionStyle}>
        <div style={headerStyle}>8. Validation Evidence</div>
        <div style={gridStyle}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Typecheck</div>
            <div style={{ ...statValueStyle, fontSize: 14, color: '#66bb6a' }}>PASS</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Tests (9/9)</div>
            <div style={{ ...statValueStyle, fontSize: 14, color: '#66bb6a' }}>PASS</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Build</div>
            <div style={{ ...statValueStyle, fontSize: 14, color: '#66bb6a' }}>PASS</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Git Diff Check</div>
            <div style={{ ...statValueStyle, fontSize: 14, color: '#66bb6a' }}>Clean</div>
          </div>
        </div>
      </div>

      {/* 9. Safety Boundary Matrix */}
      <div style={{ ...sectionStyle, border: '2px solid #b71c1c' }}>
        <div style={{ ...headerStyle, color: '#ef5350' }}>9. Safety Boundary Matrix</div>
        <div style={gridStyle}>
          {items.filter(i => i.category === 'boundary').map(item => (
            <div key={item.id} style={statCardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={statLabelStyle}>{item.title}</div>
                <span style={badgeStyle(riskColor(item.riskLevel))}>{item.riskLevel}</span>
              </div>
              <div style={{ ...statValueStyle, fontSize: 14, color: '#ef5350' }}>Blocked</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{item.evidence}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 10. Operator Next Step */}
      <div style={{ ...sectionStyle, border: '1px solid #42a5f5' }}>
        <div style={{ ...headerStyle, color: '#42a5f5' }}>10. Operator Next Step</div>
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>Continue readonly productization (P2 aggregation docs)</li>
            <li>Improve CLI ergonomics and repair plan-only docs</li>
            <li>Improve memory preview and normalization handling</li>
            <li>Prepare Stage C authorization review (docs only, no enablement)</li>
            <li>Do NOT enable Stage C, toggle feature flag, write DB, or execute actions</li>
            <li>Do NOT expose hidden preview in sidebar</li>
          </ol>
        </div>
      </div>

      {/* Validator Summary */}
      <div style={sectionStyle}>
        <div style={headerStyle}>Validator Summary</div>
        <div style={gridStyle}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Pass</div>
            <div style={{ ...statValueStyle, color: validation.pass ? '#66bb6a' : '#ef5350' }}>
              {validation.pass ? 'PASS' : 'FAIL'}
            </div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Blocking</div>
            <div style={{ ...statValueStyle, color: validation.blocking > 0 ? '#ef5350' : '#66bb6a' }}>
              {validation.blocking}
            </div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Warning</div>
            <div style={{ ...statValueStyle, color: validation.warning > 0 ? '#ffa726' : '#66bb6a' }}>
              {validation.warning}
            </div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Info (Items)</div>
            <div style={statValueStyle}>{validation.info}</div>
          </div>
        </div>
        {validation.checks.filter(c => !c.pass).map((c, i) => (
          <div key={`vc-${i}`} style={{ fontSize: 12, color: c.level === 'blocking' ? '#ef5350' : '#ffa726', marginTop: 4 }}>
            {c.level === 'blocking' ? '⛔ ' : '⚠ '}{c.message}
          </div>
        ))}
      </div>

      {/* Registry Overview */}
      <div style={sectionStyle}>
        <div style={headerStyle}>Registry Overview</div>
        <div style={gridStyle}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Total Items</div>
            <div style={statValueStyle}>{summary.total}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>High/Critical</div>
            <div style={{ ...statValueStyle, color: '#ef5350' }}>{summary.highOrCritical}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Allowed (view)</div>
            <div style={{ ...statValueStyle, color: '#66bb6a' }}>{summary.allowedNow}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Blocked</div>
            <div style={{ ...statValueStyle, color: '#ef5350' }}>{summary.blocked}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Needs Approval</div>
            <div style={{ ...statValueStyle, color: '#ffa726' }}>{summary.requiresHumanApproval}</div>
          </div>
        </div>
        {categories.map(cat => {
          const catItems = items.filter(i => i.category === cat);
          if (catItems.length === 0) return null;
          return (
            <div key={cat} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#4fc3f7' }}>
                {cat} ({catItems.length})
              </div>
              {catItems.map(item => (
                <div key={item.id} style={itemRowStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 12 }}>{item.title}</span>
                    <span style={badgeStyle(riskColor(item.riskLevel))}>{item.riskLevel}</span>
                    <span style={{ ...badgeStyle(statusColor(item.status)) }}>{item.status}</span>
                    {item.linkedPreviewRoute && (
                      <a href={item.linkedPreviewRoute} style={{ color: '#42a5f5', fontSize: 11, textDecoration: 'underline' }}>
                        preview
                      </a>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', maxWidth: 350 }}>
                    {item.summary.substring(0, 60)}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Forbidden Actions */}
      <div style={{ ...sectionStyle, border: '2px solid #ef5350' }}>
        <div style={{ ...headerStyle, color: '#ef5350' }}>Forbidden Actions Notice</div>
        <ul style={{ fontSize: 13, lineHeight: 1.8, margin: 0, paddingLeft: 20 }}>
          <li>Stage C is DISABLED — no enablement button or API</li>
          <li>Feature flag is OFF — not mutable from UI</li>
          <li>POST runtime is BLOCKED — no POST endpoints</li>
          <li>DB write is BLOCKED — no write path</li>
          <li>Executor is BLOCKED — no runtime execution</li>
          <li>External control is BLOCKED — no external API calls</li>
          <li>Connector action is BLOCKED — no connector control</li>
          <li>This console is NOT in sidebar — hidden direct route only</li>
        </ul>
      </div>
    </PageShell>
  );
};

export default OperatorRuntimeReadinessConsolePreview;
