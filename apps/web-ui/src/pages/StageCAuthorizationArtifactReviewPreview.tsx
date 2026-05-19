import React from 'react';
import PageShell from '../components/ui/PageShell';
import { STAGE_C_AUTHORIZATION_ARTIFACT_REVIEW_REGISTRY } from '../registry/stage-c-authorization-artifact-review-registry';
import { validateAuthorizationArtifactReview } from '../registry/stage-c-authorization-artifact-review-validator';

const s: Record<string, React.CSSProperties> = {
  section: { marginBottom: 24, padding: 20, background: 'var(--bg-card, #1a1a2e)', borderRadius: 8, border: '1px solid var(--border-color, #2a2a4a)' },
  header: { fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary, #e0e0e0)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, marginBottom: 12 },
  card: { padding: '12px 16px', background: 'var(--bg-item, #16213e)', borderRadius: 6, border: '1px solid var(--border-color, #2a2a4a)' },
  label: { fontSize: 11, color: 'var(--text-secondary, #8892b0)', textTransform: 'uppercase', marginBottom: 4 },
  value: { fontSize: 15, fontWeight: 700, color: 'var(--text-primary, #e0e0e0)' },
};

const badge = (color: string): React.CSSProperties => ({ padding: '2px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: color, color: '#fff', display: 'inline-block' });

const statusColor = (st: string) => {
  switch (st) {
    case 'ready': return '#66bb6a';
    case 'present': return '#42a5f5';
    case 'pending': return '#ffa726';
    case 'blocked': return '#ef5350';
    case 'forbidden': return '#ef5350';
    case 'not_applicable': return '#757575';
    default: return '#757575';
  }
};

const catColor = (cat: string) => {
  switch (cat) {
    case 'baseline': return '#66bb6a';
    case 'authorization_artifact': return '#42a5f5';
    case 'required_field': return '#ffa726';
    case 'evidence': return '#66bb6a';
    case 'blocker': return '#ef5350';
    case 'safety': return '#66bb6a';
    case 'human_review': return '#ffa726';
    case 'next_step': return '#757575';
    default: return '#757575';
  }
};

const StageCAuthorizationArtifactReviewPreview: React.FC = () => {
  const reg = STAGE_C_AUTHORIZATION_ARTIFACT_REVIEW_REGISTRY;
  const val = validateAuthorizationArtifactReview();
  const categories = [...new Set(reg.map(i => i.category))].sort();
  const pendingItems = reg.filter(i => i.status === 'pending');
  const authPending = reg.some(i => i.id === 'authorization-text-presence' && i.status === 'pending');

  return (
    <PageShell title="Stage C Authorization Artifact Review Preview" subtitle="v7.35.0-P2 · Readonly artifact review · AUTHORIZATION_PENDING · Stage C remains disabled" safetyBoundary="readonly" safetyText="只读 artifact review · 不入 sidebar · 不做授权批准">
      <div style={{ ...s.section, border: '1px solid #42a5f5' }}>
        <div style={{ ...s.header, color: '#42a5f5' }}>1. Stage C Authorization Artifact Review Preview</div>
        <div style={s.grid}>
          <div style={s.card}><div style={s.label}>Review Items</div><div style={s.value}>{reg.length}</div></div>
          <div style={s.card}><div style={s.label}>Required for Review</div><div style={s.value}>{reg.filter(i => i.requiredForHumanReview).length}</div></div>
          <div style={s.card}><div style={s.label}>Pending Items</div><div style={{ ...s.value, color: '#ffa726' }}>{pendingItems.length}</div></div>
          <div style={s.card}><div style={s.label}>Authorization State</div><div style={{ ...s.value, color: '#ffa726' }}>{authPending ? 'AUTHORIZATION_PENDING' : 'UNKNOWN'}</div></div>
          <div style={s.card}><div style={s.label}>Can Authorize</div><div style={{ ...s.value, color: '#ef5350' }}>false</div></div>
          <div style={s.card}><div style={s.label}>Can Enable Stage C</div><div style={{ ...s.value, color: '#ef5350' }}>false</div></div>
          <div style={s.card}><div style={s.label}>Validator</div><div style={{ ...s.value, color: val.pass ? '#66bb6a' : '#ef5350' }}>{val.pass ? 'PASS' : 'FAIL'}</div></div>
          <div style={s.card}><div style={s.label}>Blocking</div><div style={{ ...s.value, color: val.blocking === 0 ? '#66bb6a' : '#ef5350' }}>{val.blocking}</div></div>
        </div>
        <div style={{ marginTop: 8, padding: 12, background: '#16213e', borderRadius: 4, border: '2px solid #ef5350' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#ef5350' }}>This page cannot authorize Stage C. This page cannot enable Stage C.</div>
          <div style={{ fontSize: 12, color: '#ffa726', marginTop: 4, fontWeight: 600 }}>If explicit human owner authorization is absent, status remains AUTHORIZATION_PENDING.</div>
        </div>
      </div>

      <div style={{ ...s.section, border: '1px solid #66bb6a' }}>
        <div style={{ ...s.header, color: '#66bb6a' }}>2. Current Seal Baseline</div>
        {reg.filter(i => i.category === 'baseline').map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badge(statusColor(item.status))}>{item.status}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.summary}</div>
          </div>
        ))}
      </div>

      <div style={{ ...s.section, border: '1px solid #42a5f5' }}>
        <div style={{ ...s.header, color: '#42a5f5' }}>3. Authorization Artifact Coverage</div>
        {reg.filter(i => i.category === 'authorization_artifact').map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badge(statusColor(item.status))}>{item.status}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.summary}</div>
          </div>
        ))}
      </div>

      <div style={{ ...s.section, border: '1px solid #ffa726' }}>
        <div style={{ ...s.header, color: '#ffa726' }}>4. Required Fields Matrix</div>
        {reg.filter(i => i.category === 'required_field').map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badge(statusColor(item.status))}>{item.status}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.summary}</div>
          </div>
        ))}
        <div style={{ marginTop: 8, padding: 8, background: '#1a1a2e', borderRadius: 4, fontSize: 12, color: '#ffa726' }}>
          All 5 required fields are PENDING. No real human authorization artifact exists yet.
        </div>
      </div>

      <div style={{ ...s.section, border: '1px solid #66bb6a' }}>
        <div style={{ ...s.header, color: '#66bb6a' }}>5. Evidence Coverage</div>
        {reg.filter(i => i.category === 'evidence').map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badge(statusColor(item.status))}>{item.status}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.evidenceRef}</div>
          </div>
        ))}
      </div>

      <div style={{ ...s.section, border: '1px solid #ef5350' }}>
        <div style={{ ...s.header, color: '#ef5350' }}>6. Blocker Checklist</div>
        {reg.filter(i => i.category === 'blocker').map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badge(statusColor(item.status))}>{item.status}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.summary}</div>
          </div>
        ))}
      </div>

      <div style={{ ...s.section, border: '1px solid #ffa726' }}>
        <div style={{ ...s.header, color: '#ffa726' }}>7. Human Authorization Status</div>
        {reg.filter(i => i.category === 'human_review').map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badge(statusColor(item.status))}>{item.status}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.summary}</div>
          </div>
        ))}
        <div style={{ marginTop: 8, padding: 12, background: '#1a1a2e', borderRadius: 4, border: '1px solid #ffa726' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#ffa726' }}>Authorization State: AUTHORIZATION_PENDING</div>
          <div style={{ fontSize: 12, color: '#8892b0', marginTop: 4 }}>
            No real human owner authorization text has been provided. All required fields are in PENDING state. This preview does not generate, sign, or confirm authorization.
          </div>
        </div>
      </div>

      <div style={{ ...s.section, border: '1px solid #66bb6a' }}>
        <div style={{ ...s.header, color: '#66bb6a' }}>8. Safety Boundary</div>
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
          <li>No fake human authorization marked as complete</li>
        </ul>
      </div>

      <div style={{ ...s.section, border: `1px solid ${val.pass ? '#66bb6a' : '#ef5350'}` }}>
        <div style={{ ...s.header, color: val.pass ? '#66bb6a' : '#ef5350' }}>9. Validator Summary</div>
        <div style={s.grid}>
          <div style={s.card}><div style={s.label}>Result</div><div style={{ ...s.value, color: val.pass ? '#66bb6a' : '#ef5350' }}>{val.pass ? 'PASS' : 'FAIL'}</div></div>
          <div style={s.card}><div style={s.label}>Blocking</div><div style={{ ...s.value, color: val.blocking === 0 ? '#66bb6a' : '#ef5350' }}>{val.blocking}</div></div>
          <div style={s.card}><div style={s.label}>Warning / Info</div><div style={s.value}>{val.warning} / {val.info}</div></div>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary, #8892b0)' }}>
          {val.checks.map(c => (
            <div key={c.id} style={{ padding: '2px 0', display: 'flex', gap: 8 }}>
              <span style={{ color: c.pass ? '#66bb6a' : '#ef5350' }}>{c.pass ? '\u2713' : '\u2717'}</span>
              <span>[{c.level}]</span>
              <span>{c.message}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={s.section}>
        <div style={s.header}>10. Items by Category</div>
        {categories.map(cat => {
          const catItems = reg.filter(i => i.category === cat);
          return (
            <div key={cat} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary, #e0e0e0)', textTransform: 'capitalize' }}>{cat.replace(/_/g, ' ')} ({catItems.length})</div>
              {catItems.map(item => (
                <div key={item.id} style={{ padding: '6px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.title}</span>
                  <span style={badge(statusColor(item.status))}>{item.status}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div style={{ ...s.section, border: '1px solid #ffa726' }}>
        <div style={{ ...s.header, color: '#ffa726' }}>10. Next Step</div>
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>Review all 32 artifact review items</li>
            <li>Verify authorization state: AUTHORIZATION_PENDING (no real human auth text provided)</li>
            <li>Proceed to P3: Stage C Enablement Implementation Planning Preview</li>
            <li>Prepare P4: Authorization Gate Seal Candidate</li>
            <li>Await human owner authorization before any enablement</li>
          </ol>
        </div>
        <div style={{ marginTop: 12, padding: 12, background: '#1a1a2e', borderRadius: 4, border: '2px solid #ef5350' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#ef5350' }}>FINAL WARNING</div>
          <div style={{ fontSize: 12, color: '#ffa726', marginTop: 4, fontWeight: 600 }}>Authorization is NOT execution. Authorization to plan != authorization to execute.</div>
          <div style={{ fontSize: 12, color: '#ef5350', marginTop: 4, fontWeight: 600 }}>Stage C remains disabled. No enablement authorized by this review.</div>
        </div>
      </div>
    </PageShell>
  );
};

export default StageCAuthorizationArtifactReviewPreview;
