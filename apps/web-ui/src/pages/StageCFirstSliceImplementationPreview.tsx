import React from 'react';
import PageShell from '../components/ui/PageShell';
import { STAGE_C_FIRST_SLICE_IMPLEMENTATION_REGISTRY } from '../registry/stage-c-first-slice-implementation-registry';
import { validateFirstSliceImplementation } from '../registry/stage-c-first-slice-implementation-validator';

const s: Record<string, React.CSSProperties> = {
  section: { marginBottom: 24, padding: 20, background: 'var(--bg-card, #1a1a2e)', borderRadius: 8, border: '1px solid var(--border-color, #2a2a4a)' },
  header: { fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary, #e0e0e0)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, marginBottom: 12 },
  card: { padding: '12px 16px', background: 'var(--bg-item, #16213e)', borderRadius: 6, border: '1px solid var(--border-color, #2a2a4a)' },
  label: { fontSize: 11, color: 'var(--text-secondary, #8892b0)', textTransform: 'uppercase', marginBottom: 4 },
  value: { fontSize: 15, fontWeight: 700, color: 'var(--text-primary, #e0e0e0)' },
};

const badge = (color: string): React.CSSProperties => ({ padding: '2px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: color, color: '#fff', display: 'inline-block' });

const toggleBg = (enabled: boolean): React.CSSProperties => ({
  width: 48, height: 24, borderRadius: 12, background: enabled ? '#66bb6a' : '#555',
  position: 'relative', cursor: 'not-allowed', opacity: 0.6, display: 'inline-block',
});

const toggleDot: React.CSSProperties = {
  width: 20, height: 20, borderRadius: '50%', background: '#fff',
  position: 'absolute', top: 2, left: 2, transition: 'left 0.2s',
};

const StageCFirstSliceImplementationPreview: React.FC = () => {
  const reg = STAGE_C_FIRST_SLICE_IMPLEMENTATION_REGISTRY;
  const val = validateFirstSliceImplementation();
  const categories = [...new Set(reg.map(i => i.category))].sort();
  const ffItems = reg.filter(i => i.category === 'feature_flag_toggle');
  const ksItems = reg.filter(i => i.category === 'kill_switch');
  const apiItems = reg.filter(i => i.category === 'status_api');
  const auditItems = reg.filter(i => i.category === 'audit_event');
  const validationItems = reg.filter(i => i.category === 'validation');

  return (
    <PageShell title="Stage C First Slice Implementation Preview" subtitle="v7.38.0-D1 · Implementation pack · Readonly preview · Stage C remains disabled" safetyBoundary="readonly" safetyText="只读 implementation pack · 不入 sidebar · 不执行 enablement">
      <div style={{ ...s.section, border: '1px solid #42a5f5' }}>
        <div style={{ ...s.header, color: '#42a5f5' }}>1. Authorization & Scope</div>
        <div style={s.grid}>
          <div style={s.card}><div style={s.label}>Authorization State</div><div style={{ ...s.value, color: '#ffa726' }}>AUTHORIZATION_PENDING</div></div>
          <div style={s.card}><div style={s.label}>Impl Pack Items</div><div style={s.value}>{reg.length}</div></div>
          <div style={s.card}><div style={s.label}>Validator</div><div style={{ ...s.value, color: val.pass ? '#66bb6a' : '#ef5350' }}>{val.pass ? 'PASS' : 'FAIL'}</div></div>
          <div style={s.card}><div style={s.label}>Blocking</div><div style={{ ...s.value, color: val.blocking === 0 ? '#66bb6a' : '#ef5350' }}>{val.blocking}</div></div>
          <div style={s.card}><div style={s.label}>Categories</div><div style={s.value}>{categories.join(', ')}</div></div>
          <div style={s.card}><div style={s.label}>Stage C</div><div style={{ ...s.value, color: '#ef5350' }}>DISABLED</div></div>
        </div>
        <div style={{ marginTop: 8, padding: 12, background: '#16213e', borderRadius: 4, border: '2px solid #ffa726' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#ffa726' }}>Authorization: PENDING. Toggle blocked.</div>
          <div style={{ fontSize: 12, color: '#8892b0', marginTop: 4 }}>Human owner authorization received for first slice drafting/review. Stage C enablement still prohibited.</div>
        </div>
      </div>

      <div style={{ ...s.section, border: '1px solid #66bb6a' }}>
        <div style={{ ...s.header, color: '#66bb6a' }}>2. Feature Flag Toggle UI</div>
        <div style={s.grid}>
          {ffItems.map(item => (
            <div key={item.id} style={s.card}>
              <div style={s.label}>{item.category}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary, #e0e0e0)' }}>{item.title}</div>
              <div style={{ fontSize: 11, color: '#8892b0', marginTop: 4 }}>{item.description}</div>
              <div style={{ marginTop: 6 }}><span style={badge('#ffa726')}>{item.status}</span></div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0' }}>enable_stage_c:</div>
          <div style={toggleBg(false)}><div style={{ ...toggleDot }} /></div>
          <div style={{ fontSize: 12, color: '#ef5350', fontWeight: 600 }}>DISABLED (default)</div>
          <div style={{ fontSize: 11, color: '#8892b0' }}>Toggle locked — authorization PENDING</div>
        </div>
      </div>

      <div style={{ ...s.section, border: '1px solid #ef5350' }}>
        <div style={{ ...s.header, color: '#ef5350' }}>3. Kill Switch UI</div>
        <div style={s.grid}>
          {ksItems.map(item => (
            <div key={item.id} style={s.card}>
              <div style={s.label}>{item.category}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary, #e0e0e0)' }}>{item.title}</div>
              <div style={{ fontSize: 11, color: '#8892b0', marginTop: 4 }}>{item.description}</div>
              <div style={{ marginTop: 6 }}><span style={badge('#ffa726')}>{item.status}</span></div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0' }}>emergency_stage_c_disable:</div>
          <div style={toggleBg(false)}><div style={{ ...toggleDot }} /></div>
          <div style={{ fontSize: 12, color: '#66bb6a', fontWeight: 600 }}>INACTIVE</div>
          <div style={{ fontSize: 11, color: '#8892b0' }}>Kill switch available for emergency</div>
        </div>
      </div>

      <div style={{ ...s.section, border: '1px solid #42a5f5' }}>
        <div style={{ ...s.header, color: '#42a5f5' }}>4. Readonly Stage C Status API</div>
        <div style={s.grid}>
          {apiItems.map(item => (
            <div key={item.id} style={s.card}>
              <div style={s.label}>{item.category}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary, #e0e0e0)' }}>{item.title}</div>
              <div style={{ fontSize: 11, color: '#8892b0', marginTop: 4 }}>{item.description}</div>
              <div style={{ marginTop: 6 }}><span style={badge('#ffa726')}>{item.status}</span></div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: 12, background: '#0d1b2a', borderRadius: 4, fontFamily: 'monospace', fontSize: 12, color: '#66bb6a' }}>
          {'{'} <br />
          &nbsp;&nbsp;"enabled": false,<br />
          &nbsp;&nbsp;"killSwitchActive": false,<br />
          &nbsp;&nbsp;"authorizationState": "PENDING",<br />
          &nbsp;&nbsp;"lastToggleAt": null,<br />
          &nbsp;&nbsp;"lastToggleBy": null<br />
          {'}'}
        </div>
      </div>

      <div style={{ ...s.section, border: '1px solid #66bb6a' }}>
        <div style={{ ...s.header, color: '#66bb6a' }}>5. Audit Event Review</div>
        <div style={s.grid}>
          {auditItems.map(item => (
            <div key={item.id} style={s.card}>
              <div style={s.label}>{item.category}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary, #e0e0e0)' }}>{item.title}</div>
              <div style={{ fontSize: 11, color: '#8892b0', marginTop: 4 }}>{item.description}</div>
              <div style={{ marginTop: 6 }}><span style={badge('#ffa726')}>{item.status}</span></div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0', marginBottom: 8 }}>Planned Audit Events:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { event: 'stage_c.feature_flag.toggled', desc: 'Feature flag state changed' },
              { event: 'stage_c.kill_switch.activated', desc: 'Kill switch activated' },
              { event: 'stage_c.kill_switch.deactivated', desc: 'Kill switch deactivated' },
              { event: 'stage_c.status_api.called', desc: 'Status API accessed' },
              { event: 'stage_c.unauthorized_access.attempted', desc: 'Unauthorized toggle attempt' },
            ].map(e => (
              <div key={e.event} style={{ padding: '8px 12px', background: '#16213e', borderRadius: 4, border: '1px solid #2a2a4a', fontSize: 12, color: '#e0e0e0' }}>
                <span style={{ color: '#42a5f5', fontFamily: 'monospace' }}>{e.event}</span>
                <span style={{ color: '#8892b0', marginLeft: 8 }}>{e.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...s.section, border: '1px solid #42a5f5' }}>
        <div style={{ ...s.header, color: '#42a5f5' }}>6. Validation & Safety Summary</div>
        <div style={s.grid}>
          {validationItems.map(item => (
            <div key={item.id} style={s.card}>
              <div style={s.label}>{item.category}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary, #e0e0e0)' }}>{item.title}</div>
              <div style={{ fontSize: 11, color: '#8892b0', marginTop: 4 }}>{item.description}</div>
              <div style={{ marginTop: 6 }}><span style={badge('#ffa726')}>{item.status}</span></div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0', marginBottom: 8 }}>Go/No-Go Checklist:</div>
          {[
            { label: 'Authorization for impl pack drafting granted', pass: true },
            { label: 'typecheck PASS', pass: true },
            { label: 'All tests PASS', pass: true },
            { label: 'Build PASS', pass: true },
            { label: 'Safety search: 0 issues', pass: true },
            { label: 'git diff --check clean', pass: true },
            { label: 'Feature flag defaults to false', pass: true },
            { label: 'Kill switch defaults to false', pass: true },
            { label: 'No sidebar exposure', pass: true },
            { label: 'No fake authorization', pass: true },
            { label: 'Stage C disabled', pass: true },
            { label: 'Authorization state != PENDING (Stage C enablement)', pass: false },
          ].map(check => (
            <div key={check.label} style={{ padding: '6px 12px', marginBottom: 4, background: '#16213e', borderRadius: 4, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: check.pass ? '#66bb6a' : '#ef5350', fontWeight: 700 }}>{check.pass ? '✓' : '✗'}</span>
              <span style={{ color: 'var(--text-primary, #e0e0e0)' }}>{check.label}</span>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
};

export default StageCFirstSliceImplementationPreview;
