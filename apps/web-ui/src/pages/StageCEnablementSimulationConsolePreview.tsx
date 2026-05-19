import React from 'react';
import PageShell from '../components/ui/PageShell';
import { STAGE_C_SAFETY_HARNESS_CONTRACT_REGISTRY } from '../registry/stage-c-safety-harness-contract-registry';
import { validateSafetyHarnessContract } from '../registry/stage-c-safety-harness-contract-validator';

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
    case 'required': return '#42a5f5';
    case 'pending': return '#ffa726';
    case 'forbidden': return '#ef5350';
    case 'not_applicable': return '#757575';
    default: return '#757575';
  }
};

const catColor = (cat: string) => {
  switch (cat) {
    case 'authorization': return '#ffa726';
    case 'feature_flag': return '#42a5f5';
    case 'kill_switch': return '#ef5350';
    case 'api_boundary': return '#ef5350';
    case 'audit': return '#66bb6a';
    case 'rollback': return '#42a5f5';
    case 'validation': return '#66bb6a';
    case 'safety': return '#66bb6a';
    case 'forbidden_action': return '#ef5350';
    default: return '#757575';
  }
};

const StageCEnablementSimulationConsolePreview: React.FC = () => {
  const reg = STAGE_C_SAFETY_HARNESS_CONTRACT_REGISTRY;
  const val = validateSafetyHarnessContract();
  const categories = [...new Set(reg.map(i => i.category))].sort();

  return (
    <PageShell title="Stage C Enablement Simulation Console Preview" subtitle="v7.36.0-P1 · Simulation only · Not executed · Stage C remains disabled" safetyBoundary="readonly" safetyText="只读 simulation · 不入 sidebar · 不执行 enablement">
      <div style={{ ...s.section, border: '1px solid #ffa726' }}>
        <div style={{ ...s.header, color: '#ffa726' }}>1. Stage C Enablement Simulation Console Preview</div>
        <div style={s.grid}>
          <div style={s.card}><div style={s.label}>Harness Items</div><div style={s.value}>{reg.length}</div></div>
          <div style={s.card}><div style={s.label}>Can Enable Stage C</div><div style={{ ...s.value, color: '#ef5350' }}>false</div></div>
          <div style={s.card}><div style={s.label}>Validator</div><div style={{ ...s.value, color: val.pass ? '#66bb6a' : '#ef5350' }}>{val.pass ? 'PASS' : 'FAIL'}</div></div>
          <div style={s.card}><div style={s.label}>Blocking</div><div style={{ ...s.value, color: val.blocking === 0 ? '#66bb6a' : '#ef5350' }}>{val.blocking}</div></div>
        </div>
        <div style={{ marginTop: 8, padding: 12, background: '#16213e', borderRadius: 4, border: '2px solid #ef5350' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#ef5350' }}>This is a readonly simulation preview. No Stage C enablement is available.</div>
          <div style={{ fontSize: 12, color: '#ffa726', marginTop: 4, fontWeight: 600 }}>No POST/DB/executor/external control is implemented. Authorization is still pending.</div>
          <div style={{ fontSize: 12, color: '#ef5350', marginTop: 4 }}>Simulation result: NOT EXECUTED.</div>
        </div>
      </div>

      <div style={{ ...s.section, border: '1px solid #ffa726' }}>
        <div style={{ ...s.header, color: '#ffa726' }}>2. Authorization State</div>
        <div style={{ padding: 12, background: '#16213e', borderRadius: 4, fontSize: 13, border: '1px solid #ffa726' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
            <span style={{ fontWeight: 600 }}>Current State</span>
            <span style={badge('#ffa726')}>AUTHORIZATION_PENDING</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
            <span style={{ fontWeight: 600 }}>Human Owner</span>
            <span style={{ ...badge('#ffa726'), background: '#ffa726' }}>NOT NOTIFIED</span>
          </div>
          <div style={{ color: '#8892b0', marginTop: 8 }}>
            No real human owner authorization artifact has been provided. Stage C cannot be enabled.
          </div>
        </div>
      </div>

      <div style={{ ...s.section, border: '1px solid #66bb6a' }}>
        <div style={{ ...s.header, color: '#66bb6a' }}>3. Blueprint Baseline</div>
        <div style={s.grid}>
          <div style={s.card}><div style={s.label}>D1 Blueprint</div><div style={{ ...s.value, fontSize: 12, color: '#ffa726' }}>Blueprint ready with authorization pending</div></div>
          <div style={s.card}><div style={s.label}>D2 Harness</div><div style={{ ...s.value, fontSize: 12, color: '#ffa726' }}>{reg.length} items, contract frozen</div></div>
          <div style={s.card}><div style={s.label}>Stage C</div><div style={{ ...s.value, color: '#ef5350' }}>DISABLED</div></div>
          <div style={s.card}><div style={s.label}>Route</div><div style={s.value}>Hidden direct</div></div>
        </div>
      </div>

      <div style={{ ...s.section, border: '1px solid #42a5f5' }}>
        <div style={{ ...s.header, color: '#42a5f5' }}>4. Safety Harness Contract</div>
        {categories.map(cat => {
          const catItems = reg.filter(i => i.category === cat);
          return (
            <div key={cat} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary, #e0e0e0)', textTransform: 'capitalize' }}>
                {cat.replace(/_/g, ' ')} ({catItems.length})
              </div>
              {catItems.slice(0, 3).map(item => (
                <div key={item.id} style={{ padding: '4px 8px', fontSize: 12, display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color, #2a2a4a)' }}>
                  <span>{item.title}</span>
                  <span style={badge(statusColor(item.status))}>{item.status}</span>
                </div>
              ))}
              {catItems.length > 3 && <div style={{ fontSize: 11, color: '#8892b0', padding: '2px 8px' }}>...{catItems.length - 3} more</div>}
            </div>
          );
        })}
      </div>

      <div style={{ ...s.section, border: '1px solid #42a5f5' }}>
        <div style={{ ...s.header, color: '#42a5f5' }}>5. Gate Sequence Preview</div>
        <div style={{ fontSize: 13, lineHeight: 2, padding: 12, background: '#16213e', borderRadius: 4 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0' }}>
            <span style={badge('#ffa726')}>GATE 1</span>
            <span>Human Authorization → PENDING (blocked)</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0' }}>
            <span style={badge('#757575')}>GATE 2</span>
            <span>Feature Flag Enable → wait on GATE 1</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0' }}>
            <span style={badge('#757575')}>GATE 3</span>
            <span>Kill Switch Check → wait on GATE 1</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0' }}>
            <span style={badge('#757575')}>GATE 4</span>
            <span>Rollback Plan Verified → wait on GATE 1</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0' }}>
            <span style={badge('#757575')}>GATE 5</span>
            <span>Dry-Run Execution → wait on GATE 1</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0' }}>
            <span style={badge('#757575')}>GATE 6</span>
            <span>Canary Enablement → wait on GATE 1</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0' }}>
            <span style={badge('#757575')}>GATE 7</span>
            <span>Full Enablement → wait on GATE 1</span>
          </div>
          <div style={{ marginTop: 8, padding: 8, background: '#1a1a2e', borderRadius: 4, fontSize: 12, color: '#ef5350' }}>
            All gates blocked by GATE 1: Authorization PENDING.
          </div>
        </div>
      </div>

      <div style={{ ...s.section, border: '1px solid #42a5f5' }}>
        <div style={{ ...s.header, color: '#42a5f5' }}>6. Feature Flag Gate</div>
        {reg.filter(i => i.category === 'feature_flag').map(item => (
          <div key={item.id} style={{ padding: '6px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badge(statusColor(item.status))}>{item.status}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.summary}</div>
          </div>
        ))}
      </div>

      <div style={{ ...s.section, border: '1px solid #ef5350' }}>
        <div style={{ ...s.header, color: '#ef5350' }}>7. Kill Switch Gate</div>
        {reg.filter(i => i.category === 'kill_switch').map(item => (
          <div key={item.id} style={{ padding: '6px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badge(statusColor(item.status))}>{item.status}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.summary}</div>
          </div>
        ))}
      </div>

      <div style={{ ...s.section, border: '1px solid #66bb6a' }}>
        <div style={{ ...s.header, color: '#66bb6a' }}>8. Audit / Evidence Gate</div>
        {reg.filter(i => i.category === 'audit').map(item => (
          <div key={item.id} style={{ padding: '6px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badge(statusColor(item.status))}>{item.status}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.summary}</div>
          </div>
        ))}
      </div>

      <div style={{ ...s.section, border: '1px solid #42a5f5' }}>
        <div style={{ ...s.header, color: '#42a5f5' }}>9. Rollback / Recovery Gate</div>
        {reg.filter(i => i.category === 'rollback').map(item => (
          <div key={item.id} style={{ padding: '6px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badge(statusColor(item.status))}>{item.status}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.summary}</div>
          </div>
        ))}
      </div>

      <div style={{ ...s.section, border: '1px solid #66bb6a' }}>
        <div style={{ ...s.header, color: '#66bb6a' }}>10. Validation / Smoke Gate</div>
        {reg.filter(i => i.category === 'validation').map(item => (
          <div key={item.id} style={{ padding: '6px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badge(statusColor(item.status))}>{item.status}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.summary}</div>
          </div>
        ))}
      </div>

      <div style={{ ...s.section, border: '1px solid #ef5350' }}>
        <div style={{ ...s.header, color: '#ef5350' }}>11. Forbidden Actions</div>
        {reg.filter(i => i.category === 'forbidden_action').map(item => (
          <div key={item.id} style={{ padding: '6px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badge(statusColor(item.status))}>{item.status}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.summary}</div>
          </div>
        ))}
      </div>

      <div style={{ ...s.section, border: `1px solid ${val.pass ? '#66bb6a' : '#ef5350'}` }}>
        <div style={{ ...s.header, color: val.pass ? '#66bb6a' : '#ef5350' }}>12. Validator Summary</div>
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
        <div style={{ ...s.header, color: '#ffa726' }}>13. Simulation Result</div>
        <div style={{ padding: 12, background: '#16213e', borderRadius: 4, fontSize: 13, border: '2px solid #ffa726' }}>
          <div style={{ fontWeight: 700, color: '#ffa726', fontSize: 16, marginBottom: 8 }}>Simulation: NOT EXECUTED</div>
          <div style={{ color: '#8892b0', lineHeight: 1.8 }}>
            This is a readonly simulation preview. No enablement has been executed.<br />
            No POST endpoint was called. No DB write occurred. No executor ran.<br />
            No feature flag was toggled. No kill switch was triggered.<br />
            All gates are blocked by authorization PENDING state.
          </div>
          <div style={{ color: '#ef5350', marginTop: 8, fontWeight: 600 }}>
            Stage C remains disabled. Authorization is PENDING.
          </div>
        </div>
      </div>

      <div style={{ ...s.section, border: '1px solid #ffa726' }}>
        <div style={{ ...s.header, color: '#ffa726' }}>14. Next Step</div>
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>Await human owner authorization (currently PENDING)</li>
            <li>Continue to P2/P3/P4 + Final Enablement Safety Acceleration</li>
            <li>Only after authorization: proceed to v7.37 implementation phase</li>
          </ol>
        </div>
        <div style={{ marginTop: 12, padding: 12, background: '#1a1a2e', borderRadius: 4, border: '2px solid #ef5350' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#ef5350' }}>FINAL WARNING</div>
          <div style={{ fontSize: 12, color: '#ffa726', marginTop: 4, fontWeight: 600 }}>This is a simulation preview. No Stage C enablement has occurred.</div>
          <div style={{ fontSize: 12, color: '#ef5350', marginTop: 4, fontWeight: 600 }}>Stage C remains disabled. Authorization is PENDING.</div>
        </div>
      </div>
    </PageShell>
  );
};

export default StageCEnablementSimulationConsolePreview;
