import React from 'react';
import PageShell from '../components/ui/PageShell';
import { STAGE_C_ENABLEMENT_PLANNING_REGISTRY } from '../registry/stage-c-enablement-planning-registry';
import { validateEnablementPlanning } from '../registry/stage-c-enablement-planning-validator';

const s: Record<string, React.CSSProperties> = {
  section: { marginBottom: 24, padding: 20, background: 'var(--bg-card, #1a1a2e)', borderRadius: 8, border: '1px solid var(--border-color, #2a2a4a)' },
  header: { fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary, #e0e0e0)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, marginBottom: 12 },
  card: { padding: '12px 16px', background: 'var(--bg-item, #16213e)', borderRadius: 6, border: '1px solid var(--border-color, #2a2a4a)' },
  label: { fontSize: 11, color: 'var(--text-secondary, #8892b0)', textTransform: 'uppercase', marginBottom: 4 },
  value: { fontSize: 15, fontWeight: 700, color: 'var(--text-primary, #e0e0e0)' },
};

const badge = (color: string): React.CSSProperties => ({ padding: '2px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: color, color: '#fff', display: 'inline-block' });

const impColor = (st: string) => {
  switch (st) {
    case 'placeholder': return '#ffa726';
    case 'planned': return '#42a5f5';
    case 'not_applicable': return '#757575';
    default: return '#757575';
  }
};

const StageCEnablementPlanningPreview: React.FC = () => {
  const reg = STAGE_C_ENABLEMENT_PLANNING_REGISTRY;
  const val = validateEnablementPlanning();
  const categories = [...new Set(reg.map(i => i.category))].sort();
  const placeholders = reg.filter(i => i.implementationStatus === 'placeholder');

  return (
    <PageShell title="Stage C Enablement Implementation Planning Preview" subtitle="v7.35.0-P3 · Planning only · No implementation · Stage C remains disabled" safetyBoundary="preview" safetyText="规划预览 · 不实施 · 不入 sidebar">
      <div style={{ ...s.section, border: '1px solid #ffa726' }}>
        <div style={{ ...s.header, color: '#ffa726' }}>1. Stage C Enablement Implementation Planning Preview</div>
        <div style={s.grid}>
          <div style={s.card}><div style={s.label}>Planning Items</div><div style={s.value}>{reg.length}</div></div>
          <div style={s.card}><div style={s.label}>Placeholder Only</div><div style={{ ...s.value, color: '#ffa726' }}>{placeholders.length}</div></div>
          <div style={s.card}><div style={s.label}>Implementation Allowed</div><div style={{ ...s.value, color: '#ef5350' }}>false</div></div>
          <div style={s.card}><div style={s.label}>Can Enable Stage C</div><div style={{ ...s.value, color: '#ef5350' }}>false</div></div>
          <div style={s.card}><div style={s.label}>Validator</div><div style={{ ...s.value, color: val.pass ? '#66bb6a' : '#ef5350' }}>{val.pass ? 'PASS' : 'FAIL'}</div></div>
          <div style={s.card}><div style={s.label}>Blocking</div><div style={{ ...s.value, color: val.blocking === 0 ? '#66bb6a' : '#ef5350' }}>{val.blocking}</div></div>
        </div>
        <div style={{ marginTop: 8, padding: 12, background: '#16213e', borderRadius: 4, border: '2px solid #ef5350' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#ef5350' }}>This is a planning preview only. No Stage C enablement is implemented.</div>
          <div style={{ fontSize: 12, color: '#ffa726', marginTop: 4 }}>No POST/DB/executor/external control is implemented. All future items are placeholders.</div>
        </div>
      </div>

      <div style={{ ...s.section, border: '1px solid #757575' }}>
        <div style={{ ...s.header, color: '#757575' }}>2. Planning Boundary</div>
        {reg.filter(i => i.category === 'implementation_boundary').map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badge(impColor(item.implementationStatus))}>{item.implementationStatus}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.summary}</div>
          </div>
        ))}
      </div>

      <div style={{ ...s.section, border: '1px solid #42a5f5' }}>
        <div style={{ ...s.header, color: '#42a5f5' }}>3. Future Implementation Map</div>
        {reg.filter(i => i.category === 'future_implementation').map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badge(impColor(item.implementationStatus))}>{item.implementationStatus}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.summary}</div>
          </div>
        ))}
        <div style={{ marginTop: 8, padding: 8, background: '#1a1a2e', borderRadius: 4, fontSize: 12, color: '#ffa726' }}>
          All {reg.filter(i => i.category === 'future_implementation').length} future implementation items are PLACEHOLDER only. Nothing is implemented.
        </div>
      </div>

      <div style={{ ...s.section, border: '1px solid #66bb6a' }}>
        <div style={{ ...s.header, color: '#66bb6a' }}>4. Required Feature Flags</div>
        {reg.filter(i => i.category === 'feature_flag').map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badge(impColor(item.implementationStatus))}>{item.implementationStatus}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.summary}</div>
          </div>
        ))}
      </div>

      <div style={{ ...s.section, border: '1px solid #ef5350' }}>
        <div style={{ ...s.header, color: '#ef5350' }}>5. Kill Switch Requirements</div>
        {reg.filter(i => i.category === 'kill_switch').map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badge(impColor(item.implementationStatus))}>{item.implementationStatus}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.summary}</div>
          </div>
        ))}
      </div>

      <div style={{ ...s.section, border: '1px solid #ffa726' }}>
        <div style={{ ...s.header, color: '#ffa726' }}>6. POST / DB / Executor Placeholder Warnings</div>
        <div style={{ padding: 12, background: '#16213e', borderRadius: 4, fontSize: 13, lineHeight: 2 }}>
          <div style={{ color: '#ef5350', fontWeight: 600 }}>These items are PLACEHOLDER only. Not implemented:</div>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>POST endpoint — placeholder</li>
            <li>DB migration — placeholder</li>
            <li>Executor design — placeholder</li>
            <li>Enablement API — placeholder</li>
            <li>Audit event design — placeholder</li>
            <li>Evidence capture design — placeholder</li>
          </ul>
          <div style={{ color: '#ffa726', marginTop: 8 }}>
            No runtime code exists. No backend endpoints exist. No database writes occur.
          </div>
        </div>
      </div>

      <div style={{ ...s.section, border: '1px solid #66bb6a' }}>
        <div style={{ ...s.header, color: '#66bb6a' }}>7. Test + Smoke Plan</div>
        {reg.filter(i => i.category === 'testing_smoke').map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badge(impColor(item.implementationStatus))}>{item.implementationStatus}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.summary}</div>
          </div>
        ))}
      </div>

      <div style={{ ...s.section, border: '1px solid #42a5f5' }}>
        <div style={{ ...s.header, color: '#42a5f5' }}>8. Rollback / Recovery Plan</div>
        {reg.filter(i => i.category === 'rollback_recovery').map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badge(impColor(item.implementationStatus))}>{item.implementationStatus}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.summary}</div>
          </div>
        ))}
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

      <div style={{ ...s.section, border: '1px solid #ffa726' }}>
        <div style={{ ...s.header, color: '#ffa726' }}>10. Next Step</div>
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>Review all {reg.length} planning items</li>
            <li>Verify all future implementation items remain placeholder</li>
            <li>Proceed to P4: Authorization Gate Seal Candidate</li>
            <li>Final seal recheck before any implementation</li>
          </ol>
        </div>
        <div style={{ marginTop: 12, padding: 12, background: '#1a1a2e', borderRadius: 4, border: '2px solid #ef5350' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#ef5350' }}>FINAL WARNING</div>
          <div style={{ fontSize: 12, color: '#ffa726', marginTop: 4, fontWeight: 600 }}>This is a planning preview only. No Stage C enablement is implemented.</div>
          <div style={{ fontSize: 12, color: '#ef5350', marginTop: 4, fontWeight: 600 }}>Stage C remains disabled.</div>
        </div>
      </div>
    </PageShell>
  );
};

export default StageCEnablementPlanningPreview;
