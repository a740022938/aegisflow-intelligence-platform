import React, { useMemo } from 'react';
import PageShell from '../components/ui/PageShell';
import {
  getAuthorizationReviewPackRegistry,
  getAuthorizationReviewPackSummary,
} from '../registry/stage-c-authorization-review-pack-registry';
import {
  validateAuthorizationReviewPack,
} from '../registry/stage-c-authorization-review-pack-validator';

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
  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
  gap: 8,
  marginBottom: 12,
};

const cardStyle: React.CSSProperties = {
  padding: '8px 12px',
  background: 'var(--bg-item, #16213e)',
  borderRadius: 4,
  border: '1px solid var(--border-color, #2a2a4a)',
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--text-secondary, #8892b0)',
  textTransform: 'uppercase',
};

const valueStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: 'var(--text-primary, #e0e0e0)',
};

const StageCAuthorizationReviewPackPreview: React.FC = () => {
  const items = useMemo(() => getAuthorizationReviewPackRegistry(), []);
  const summary = useMemo(() => getAuthorizationReviewPackSummary(), []);
  const validation = useMemo(() => validateAuthorizationReviewPack(), []);

  return (
    <PageShell
      title="Stage C Authorization Review Pack"
      subtitle="v7.43-P3 · Readonly authorization review preview · Stage C disabled"
      safetyBoundary="readonly"
      safetyText="只读授权审查 · 不接受授权 · 不启用 Stage C · 不入 sidebar"
    >
      {/* Overview */}
      <div style={{ ...sectionStyle, border: '1px solid #880e4f' }}>
        <div style={{ ...headerStyle, color: '#ef5350' }}>Authorization Review Pack Overview</div>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <div style={labelStyle}>Total Items</div>
            <div style={valueStyle}>{summary.total}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Required</div>
            <div style={{ ...valueStyle, color: '#f57c00' }}>{summary.required}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Satisfied</div>
            <div style={{ ...valueStyle, color: summary.satisfied > 0 ? '#66bb6a' : '#f57c00' }}>
              {summary.satisfied}
            </div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Unsatisfied</div>
            <div style={{ ...valueStyle, color: summary.unsatisfied > 0 ? '#ef5350' : '#66bb6a' }}>
              {summary.unsatisfied}
            </div>
          </div>
        </div>
      </div>

      {/* Authorization Items */}
      <div style={sectionStyle}>
        <div style={headerStyle}>Authorization Requirements</div>
        {items.map(item => (
          <div key={item.id} style={{
            ...cardStyle,
            marginBottom: 8,
            border: item.required && !item.satisfied ? '1px solid #f57c00' : '1px solid var(--border-color, #2a2a4a)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <strong style={{ fontSize: 14, color: '#e0e0e0' }}>{item.title}</strong>
              <span style={{
                padding: '2px 6px',
                borderRadius: 3,
                fontSize: 10,
                fontWeight: 600,
                background: item.required ? '#f57c00' : '#757575',
                color: '#fff',
              }}>
                {item.required ? 'Required' : 'Optional'}
              </span>
              <span style={{
                padding: '2px 6px',
                borderRadius: 3,
                fontSize: 10,
                fontWeight: 600,
                background: item.satisfied ? '#388e3c' : '#b71c1c',
                color: '#fff',
              }}>
                {item.satisfied ? 'Satisfied' : 'Not Satisfied'}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#b0bec5', marginBottom: 4 }}>{item.description}</div>
            <div style={{ fontSize: 11, color: '#ffa726' }}>
              <strong>Operator note:</strong> {item.operatorNote}
            </div>
            <div style={{ fontSize: 11, color: '#ef5350' }}>
              <strong>Forbidden:</strong> {item.forbiddenAction}
            </div>
          </div>
        ))}
      </div>

      {/* Fake Authorization Rules */}
      <div style={{ ...sectionStyle, border: '2px solid #b71c1c' }}>
        <div style={{ ...headerStyle, color: '#ef5350' }}>Fake Authorization Detection Rules</div>
        <ul style={{ fontSize: 13, lineHeight: 1.8, margin: 0, paddingLeft: 20 }}>
          <li>Self-declared authorization by any automated agent — <strong>REJECTED</strong></li>
          <li>Authorization inferred from prior conversations — <strong>REJECTED</strong></li>
          <li>Task pack contents interpreted as authorization — <strong>REJECTED</strong></li>
          <li>Preview or &quot;ready&quot; status interpreted as authorization — <strong>REJECTED</strong></li>
          <li>&quot;User said continue&quot; without explicit Stage C enablement authorization — <strong>REJECTED</strong></li>
        </ul>
      </div>

      {/* Validator */}
      <div style={sectionStyle}>
        <div style={headerStyle}>Validator Summary</div>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <div style={labelStyle}>Pass</div>
            <div style={{ ...valueStyle, color: validation.pass ? '#66bb6a' : '#ef5350' }}>
              {validation.pass ? 'PASS' : 'FAIL'}
            </div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Blocking</div>
            <div style={{ ...valueStyle, color: validation.blocking > 0 ? '#ef5350' : '#66bb6a' }}>
              {validation.blocking}
            </div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Warning</div>
            <div style={{ ...valueStyle, color: validation.warning > 0 ? '#ffa726' : '#66bb6a' }}>
              {validation.warning}
            </div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Checks</div>
            <div style={valueStyle}>{validation.total}</div>
          </div>
        </div>
        {validation.checks.filter(c => !c.pass).map((c, i) => (
          <div key={`vc-${i}`} style={{
            fontSize: 12,
            color: c.level === 'blocking' ? '#ef5350' : '#ffa726',
            marginTop: 4,
          }}>
            {c.level === 'blocking' ? '⛔ ' : '⚠ '}{c.message}
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div style={{ ...sectionStyle, border: '2px solid #880e4f' }}>
        <div style={{ ...headerStyle, color: '#ef5350' }}>Critical Notice</div>
        <div style={{ fontSize: 13, lineHeight: 1.8 }}>
          <p><strong>This is a READONLY PREVIEW.</strong> No authorization is granted or implied by the existence of this page.</p>
          <p>Stage C remains <strong>DISABLED</strong>. The feature flag is <strong>OFF</strong>.</p>
          <p>This page does NOT:</p>
          <ul>
            <li>Accept or store authorization</li>
            <li>Enable Stage C</li>
            <li>Toggle the feature flag</li>
            <li>Execute any runtime operation</li>
            <li>Write to the database</li>
          </ul>
          <p>This page is <strong>NOT</strong> in the sidebar. It is accessible only via direct route.</p>
        </div>
      </div>
    </PageShell>
  );
};

export default StageCAuthorizationReviewPackPreview;
