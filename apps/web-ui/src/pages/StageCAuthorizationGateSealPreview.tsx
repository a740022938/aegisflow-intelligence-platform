import React from 'react';
import PageShell from '../components/ui/PageShell';
import { STAGE_C_AUTHORIZATION_GATE_SEAL_REGISTRY } from '../registry/stage-c-authorization-gate-seal-registry';
import { validateAuthorizationGateSeal } from '../registry/stage-c-authorization-gate-seal-validator';

const s: Record<string, React.CSSProperties> = {
  section: { marginBottom: 24, padding: 20, background: 'var(--bg-card, #1a1a2e)', borderRadius: 8, border: '1px solid var(--border-color, #2a2a4a)' },
  header: { fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary, #e0e0e0)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, marginBottom: 12 },
  card: { padding: '12px 16px', background: 'var(--bg-item, #16213e)', borderRadius: 6, border: '1px solid var(--border-color, #2a2a4a)' },
  label: { fontSize: 11, color: 'var(--text-secondary, #8892b0)', textTransform: 'uppercase', marginBottom: 4 },
  value: { fontSize: 15, fontWeight: 700, color: 'var(--text-primary, #e0e0e0)' },
};

const badge = (color: string): React.CSSProperties => ({ padding: '2px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: color, color: '#fff', display: 'inline-block' });

const authColor = (st: string) => {
  switch (st) {
    case 'pending': return '#ffa726';
    case 'provided_for_review': return '#42a5f5';
    case 'blocked': return '#ef5350';
    default: return '#757575';
  }
};

const StageCAuthorizationGateSealPreview: React.FC = () => {
  const reg = STAGE_C_AUTHORIZATION_GATE_SEAL_REGISTRY;
  const val = validateAuthorizationGateSeal();
  const categories = [...new Set(reg.map(i => i.category))].sort();
  const pendingCount = reg.filter(i => i.authorizationState === 'pending').length;
  const blockedCount = reg.filter(i => i.authorizationState === 'blocked').length;

  return (
    <PageShell title="Stage C Authorization Gate Seal Candidate Preview" subtitle="v7.35.0-P4 · Gate seal candidate · AUTHORIZATION_PENDING · Stage C remains disabled" safetyBoundary="readonly" safetyText="闸门封板候选 · 不入 sidebar · 无授权批准能力">
      <div style={{ ...s.section, border: '1px solid #42a5f5' }}>
        <div style={{ ...s.header, color: '#42a5f5' }}>1. Stage C Authorization Gate Seal Candidate</div>
        <div style={s.grid}>
          <div style={s.card}><div style={s.label}>Seal Items</div><div style={s.value}>{reg.length}</div></div>
          <div style={s.card}><div style={s.label}>Required for Gate</div><div style={s.value}>{reg.filter(i => i.requiredForGateSeal).length}</div></div>
          <div style={s.card}><div style={s.label}>Pending</div><div style={{ ...s.value, color: '#ffa726' }}>{pendingCount}</div></div>
          <div style={s.card}><div style={s.label}>Blocked</div><div style={{ ...s.value, color: '#ef5350' }}>{blockedCount}</div></div>
          <div style={s.card}><div style={s.label}>Auth State</div><div style={{ ...s.value, color: '#ffa726' }}>PENDING</div></div>
          <div style={s.card}><div style={s.label}>Can Enable Stage C</div><div style={{ ...s.value, color: '#ef5350' }}>false</div></div>
          <div style={s.card}><div style={s.label}>Validator</div><div style={{ ...s.value, color: val.pass ? '#66bb6a' : '#ef5350' }}>{val.pass ? 'PASS' : 'FAIL'}</div></div>
          <div style={s.card}><div style={s.label}>Blocking</div><div style={{ ...s.value, color: val.blocking === 0 ? '#66bb6a' : '#ef5350' }}>{val.blocking}</div></div>
        </div>
        <div style={{ marginTop: 8, padding: 12, background: '#16213e', borderRadius: 4, border: '2px solid #ef5350' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#ef5350' }}>Authorization Gate Seal Candidate — Stage C remains disabled.</div>
          <div style={{ fontSize: 12, color: '#ffa726', marginTop: 4, fontWeight: 600 }}>Authorization state: PENDING. No real human authorization provided.</div>
          <div style={{ fontSize: 12, color: '#8892b0', marginTop: 4 }}>This gate seal does not authorize or enable Stage C.</div>
        </div>
      </div>

      <div style={{ ...s.section, border: '1px solid #66bb6a' }}>
        <div style={{ ...s.header, color: '#66bb6a' }}>2. Authorization Gate Seal Chain</div>
        {reg.filter(i => i.category === 'seal_baseline').map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badge(authColor(item.authorizationState))}>{item.authorizationState}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.summary}</div>
          </div>
        ))}
      </div>

      <div style={{ ...s.section, border: '1px solid #ffa726' }}>
        <div style={{ ...s.header, color: '#ffa726' }}>3. Authorization Layer</div>
        {reg.filter(i => i.category === 'authorization_layer').map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badge(authColor(item.authorizationState))}>{item.authorizationState}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.summary}</div>
          </div>
        ))}
      </div>

      <div style={{ ...s.section, border: '1px solid #66bb6a' }}>
        <div style={{ ...s.header, color: '#66bb6a' }}>4. Required-for-Gate Matrix</div>
        {reg.filter(i => i.category === 'required_for_gate').map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badge(authColor(item.authorizationState))}>{item.authorizationState}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.summary}</div>
          </div>
        ))}
      </div>

      <div style={{ ...s.section }}>
        <div style={s.header}>5. Authorization State</div>
        <div style={{ padding: 12, background: '#16213e', borderRadius: 4, fontSize: 13, lineHeight: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
            <span style={{ fontWeight: 600 }}>Current State</span>
            <span style={badge('#ffa726')}>AUTHORIZATION_PENDING</span>
          </div>
          <div style={{ color: '#8892b0' }}>No real human owner authorization text has been provided. Cannot proceed to enablement.</div>
        </div>
      </div>

      <div style={{ ...s.section, border: '1px solid #ef5350' }}>
        <div style={{ ...s.header, color: '#ef5350' }}>6. Blocker Matrix</div>
        {reg.filter(i => i.category === 'blocker_matrix').map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badge(authColor(item.authorizationState))}>{item.authorizationState}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.summary}</div>
          </div>
        ))}
      </div>

      <div style={{ ...s.section, border: '1px solid #66bb6a' }}>
        <div style={{ ...s.header, color: '#66bb6a' }}>7. Evidence Matrix</div>
        {reg.filter(i => i.category === 'evidence_matrix').map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badge(authColor(item.authorizationState))}>{item.authorizationState}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.evidenceRef}</div>
          </div>
        ))}
      </div>

      <div style={{ ...s.section, border: '1px solid #66bb6a' }}>
        <div style={{ ...s.header, color: '#66bb6a' }}>8. Safety Boundary</div>
        {reg.filter(i => i.category === 'safety_boundary').map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badge(authColor(item.authorizationState))}>{item.authorizationState}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.summary}</div>
          </div>
        ))}
      </div>

      <div style={{ ...s.section, border: `1px solid ${val.pass ? '#66bb6a' : '#ef5350'}` }}>
        <div style={{ ...s.header, color: val.pass ? '#66bb6a' : '#ef5350' }}>9. Validator Summary</div>
        {reg.filter(i => i.category === 'validator_status').map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badge(authColor(item.authorizationState))}>{item.authorizationState}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.summary}</div>
          </div>
        ))}
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

      <div style={{ ...s.section }}>
        <div style={s.header}>10. Items by Category</div>
        {categories.map(cat => {
          const catItems = reg.filter(i => i.category === cat);
          return (
            <div key={cat} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary, #e0e0e0)', textTransform: 'capitalize' }}>{cat.replace(/_/g, ' ')} ({catItems.length})</div>
              {catItems.map(item => (
                <div key={item.id} style={{ padding: '6px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.title}</span>
                  <span style={badge(authColor(item.authorizationState))}>{item.authorizationState}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div style={{ ...s.section, border: '1px solid #ffa726' }}>
        <div style={{ ...s.header, color: '#ffa726' }}>11. Next Step</div>
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>Review all {reg.length} gate seal items</li>
            <li>Verify authorization state: PENDING (no real human auth text)</li>
            <li>Proceed to v7.35 Final Seal Recheck</li>
            <li>After final seal, prepare v7.36-D1 implementation blueprint</li>
            <li>Await human owner authorization before any enablement</li>
          </ol>
        </div>
        <div style={{ marginTop: 12, padding: 12, background: '#1a1a2e', borderRadius: 4, border: '2px solid #ef5350' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#ef5350' }}>FINAL WARNING</div>
          <div style={{ fontSize: 12, color: '#ffa726', marginTop: 4, fontWeight: 600 }}>Authorization Gate Seal does NOT authorize or enable Stage C.</div>
          <div style={{ fontSize: 12, color: '#ffa726', marginTop: 4, fontWeight: 600 }}>Gate seal is a candidate. Authorization is PENDING.</div>
          <div style={{ fontSize: 12, color: '#ef5350', marginTop: 4, fontWeight: 600 }}>Stage C remains disabled.</div>
        </div>
      </div>
    </PageShell>
  );
};

export default StageCAuthorizationGateSealPreview;
