import React from 'react';
import PageShell from '../components/ui/PageShell';
import { STAGE_C_FIRST_SLICE_REGISTRY } from '../registry/stage-c-first-slice-registry';
import { validateFirstSlice } from '../registry/stage-c-first-slice-validator';
import { STAGE_C_AUDIT_EVENT_SCHEMAS } from '../registry/stage-c-audit-event-schema';

const s: Record<string, React.CSSProperties> = {
  section: { marginBottom: 24, padding: 20, background: 'var(--bg-card, #1a1a2e)', borderRadius: 8, border: '1px solid var(--border-color, #2a2a4a)' },
  header: { fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary, #e0e0e0)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, marginBottom: 12 },
  card: { padding: '12px 16px', background: 'var(--bg-item, #16213e)', borderRadius: 6, border: '1px solid var(--border-color, #2a2a4a)' },
  label: { fontSize: 11, color: 'var(--text-secondary, #8892b0)', textTransform: 'uppercase', marginBottom: 4 },
  value: { fontSize: 15, fontWeight: 700, color: 'var(--text-primary, #e0e0e0)' },
};

const badge = (color: string): React.CSSProperties => ({ padding: '2px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: color, color: '#fff', display: 'inline-block' });

const scopeColor = (scope: string) => {
  switch (scope) {
    case 'readonly': return '#42a5f5';
    case 'ui_shell': return '#ffa726';
    case 'schema_only': return '#66bb6a';
    case 'blocked': return '#ef5350';
    default: return '#757575';
  }
};

const toggleBg = (enabled: boolean): React.CSSProperties => ({
  width: 48, height: 24, borderRadius: 12, background: enabled ? '#66bb6a' : '#555',
  position: 'relative', cursor: 'not-allowed', opacity: 0.5, display: 'inline-block',
});

const toggleDot: React.CSSProperties = {
  width: 20, height: 20, borderRadius: '50%', background: '#fff',
  position: 'absolute', top: 2, left: 2, transition: 'left 0.2s',
};

const StageCFirstSliceImplementationPreview: React.FC = () => {
  const reg = STAGE_C_FIRST_SLICE_REGISTRY;
  const val = validateFirstSlice();
  const auditSchemas = STAGE_C_AUDIT_EVENT_SCHEMAS;
  const categories = [...new Set(reg.map(i => i.category))].sort();
  const scopeItems = (scope: string) => reg.filter(i => i.implementationScope === scope);

  return (
    <PageShell title="Stage C Minimal First Slice Preview" subtitle="v7.39 · Minimal implementation shell · Readonly preview · Stage C remains disabled" safetyBoundary="readonly" safetyText="只读 first slice · 不入 sidebar · 不执行 enablement">
      <div style={{ ...s.section, border: '1px solid #42a5f5' }}>
        <div style={{ ...s.header, color: '#ef5350' }}>1. Authorization & Safety Status</div>
        <div style={{ marginBottom: 12, padding: 12, background: '#16213e', borderRadius: 4, border: '2px solid #ffa726' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#ffa726' }}>Stage C is still disabled. This preview cannot enable Stage C.</div>
          <div style={{ fontSize: 12, color: '#8892b0', marginTop: 4 }}>Feature flag is default off and not mutable from this UI. Kill switch shell is not executable from this UI.</div>
        </div>
        <div style={s.grid}>
          <div style={s.card}><div style={s.label}>Authorization</div><div style={{ ...s.value, color: '#66bb6a', fontSize: 13 }}>GRANTED_FOR_FIRST_SLICE_IMPLEMENTATION_REVIEW</div></div>
          <div style={s.card}><div style={s.label}>Registry Items</div><div style={s.value}>{reg.length}</div></div>
          <div style={s.card}><div style={s.label}>Categories</div><div style={{ ...s.value, fontSize: 13 }}>{categories.join(', ')}</div></div>
          <div style={s.card}><div style={s.label}>Validator</div><div style={{ ...s.value, color: val.pass ? '#66bb6a' : '#ef5350' }}>{val.pass ? 'PASS' : 'FAIL'}</div></div>
          <div style={s.card}><div style={s.label}>Blocking</div><div style={{ ...s.value, color: val.blocking === 0 ? '#66bb6a' : '#ef5350' }}>{val.blocking}</div></div>
          <div style={s.card}><div style={s.label}>Stage C</div><div style={{ ...s.value, color: '#ef5350' }}>DISABLED</div></div>
        </div>
      </div>

      <div style={{ ...s.section, border: '1px solid #42a5f5' }}>
        <div style={{ ...s.header, color: '#42a5f5' }}>2. Stage C Status API Result</div>
        <div style={{ padding: 16, background: '#0d1b2a', borderRadius: 4, fontFamily: 'monospace', fontSize: 12, color: '#66bb6a', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {JSON.stringify({
            ok: true,
            contractVersion: 'v7.39.first-slice',
            readonly: true,
            stageCEnabled: false,
            canEnableStageC: false,
            authorizationState: 'GRANTED_FOR_FIRST_SLICE_IMPLEMENTATION_REVIEW',
            featureFlag: { name: 'stage_c_enablement', defaultState: 'off', currentState: 'off', mutableFromUi: false },
            killSwitch: { available: true, executableFromUi: false, state: 'not_triggered' },
            safetyBoundary: { postRuntimeAllowed: false, dbWriteAllowed: false, executorAllowed: false, externalControlAllowed: false, connectorActionAllowed: false },
            audit: { schemaDefined: true, persistentWriteEnabled: false, externalUploadEnabled: false },
            implementationStatus: 'first_slice_shell',
            allowedMethods: ['GET'],
            blockedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],
          }, null, 2)}
        </div>
      </div>

      <div style={{ ...s.section, border: '1px solid #66bb6a' }}>
        <div style={{ ...s.header, color: '#66bb6a' }}>3. Feature Flag Preview</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#e0e0e0' }}>stage_c_enablement:</div>
          <div style={toggleBg(false)}><div style={{ ...toggleDot }} /></div>
          <div style={{ fontSize: 13, color: '#ef5350', fontWeight: 600 }}>OFF (default)</div>
          <div style={{ fontSize: 11, color: '#8892b0' }}>Not mutable from UI</div>
        </div>
        <div style={{ fontSize: 12, color: '#8892b0', padding: '8px 12px', background: '#16213e', borderRadius: 4 }}>
          Feature flag is read-only in this preview. defaultState=off, currentState=off, mutableFromUi=false.
          No click handler or mutation endpoint is connected. This UI cannot change the feature flag state.
        </div>
      </div>

      <div style={{ ...s.section, border: '1px solid #ef5350' }}>
        <div style={{ ...s.header, color: '#ef5350' }}>4. Kill Switch Shell</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#e0e0e0' }}>emergency_stage_c_disable:</div>
          <div style={toggleBg(false)}><div style={{ ...toggleDot }} /></div>
          <div style={{ fontSize: 13, color: '#66bb6a', fontWeight: 600 }}>INACTIVE</div>
          <div style={{ fontSize: 11, color: '#8892b0' }}>Not executable from UI</div>
        </div>
        <div style={{ fontSize: 12, color: '#8892b0', padding: '8px 12px', background: '#16213e', borderRadius: 4 }}>
          Kill switch UI shell is displayed to show readiness state. executableFromUi=false.
          No click handler, no POST, no mutation. This UI cannot trigger the kill switch.
        </div>
      </div>

      <div style={{ ...s.section, border: '1px solid #66bb6a' }}>
        <div style={{ ...s.header, color: '#66bb6a' }}>5. Audit Event Schema Preview</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          {auditSchemas.map(schema => (
            <div key={schema.eventId} style={{ padding: '8px 12px', background: '#16213e', borderRadius: 4, border: '1px solid #2a2a4a', fontSize: 12, color: '#e0e0e0' }}>
              <span style={{ color: '#42a5f5', fontFamily: 'monospace' }}>{schema.eventId}</span>
              <span style={{ color: '#8892b0', marginLeft: 8 }}>{schema.summary}</span>
              <span style={{ color: '#757575', marginLeft: 8, fontSize: 11 }}>(preview only, no persistent write)</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: '#8892b0', padding: '8px 12px', background: '#16213e', borderRadius: 4 }}>
          Audit schema defined. persistentWriteEnabled=false, externalUploadEnabled=false.
          No audit events are written to persistent store or uploaded externally.
        </div>
      </div>

      <div style={{ ...s.section, border: '1px solid #42a5f5' }}>
        <div style={{ ...s.header, color: '#42a5f5' }}>6. Safety Boundary</div>
        <div style={s.grid}>
          {[
            { label: 'POST Runtime', allowed: false, color: '#ef5350' },
            { label: 'DB Write', allowed: false, color: '#ef5350' },
            { label: 'Executor', allowed: false, color: '#ef5350' },
            { label: 'External Control', allowed: false, color: '#ef5350' },
            { label: 'Connector Action', allowed: false, color: '#ef5350' },
          ].map(item => (
            <div key={item.label} style={s.card}>
              <div style={s.label}>{item.label}</div>
              <div style={{ ...s.value, color: item.color }}>{item.allowed ? 'ALLOWED' : 'BLOCKED'}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...s.section, border: '1px solid #66bb6a' }}>
        <div style={{ ...s.header, color: '#66bb6a' }}>7. Registry Summary</div>
        <div style={s.grid}>
          {categories.map(cat => {
            const items = reg.filter(i => i.category === cat);
            return (
              <div key={cat} style={s.card}>
                <div style={s.label}>{cat}</div>
                <div style={s.value}>{items.length}</div>
                <div style={{ fontSize: 10, color: '#8892b0', marginTop: 4 }}>{items.map(i => i.implementationScope).join(', ')}</div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: '#8892b0' }}>Total: {reg.length} items across {categories.length} categories</div>
      </div>

      <div style={{ ...s.section, border: '1px solid #42a5f5' }}>
        <div style={{ ...s.header, color: '#42a5f5' }}>8. Validator Summary</div>
        <div style={{ fontSize: 13, color: val.pass ? '#66bb6a' : '#ef5350', fontWeight: 700, marginBottom: 8 }}>
          Validator: {val.pass ? 'PASS' : 'FAIL'} · Blocking: {val.blocking} · Warning: {val.warning} · Info: {val.info}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {val.checks.slice(0, 10).map(check => (
            <div key={check.id} style={{ padding: '4px 8px', background: '#16213e', borderRadius: 4, fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: check.pass ? '#66bb6a' : '#ef5350', fontWeight: 700 }}>{check.pass ? '✓' : '✗'}</span>
              <span style={{ color: check.level === 'blocking' ? '#ef5350' : check.level === 'warning' ? '#ffa726' : '#42a5f5', fontWeight: 600 }}>[{check.level}]</span>
              <span style={{ color: '#e0e0e0' }}>{check.message}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...s.section, border: '1px solid #ef5350' }}>
        <div style={{ ...s.header, color: '#ef5350' }}>9. Forbidden Actions</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            'Enable Stage C',
            'POST runtime execution',
            'DB write',
            'Executor',
            'External control',
            'Connector action',
            'Rollback execution',
            'Tag/release',
            'Sidebar exposure',
            'Fake authorization',
            'Authorization auto-approval',
            'Feature flag mutation from UI',
            'Kill switch execution from UI',
            'Persistent audit write',
            'External audit upload',
          ].map(action => (
            <div key={action} style={{ padding: '6px 12px', background: '#16213e', borderRadius: 4, fontSize: 12, color: '#ef5350', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>⊘</span>
              <span>{action}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...s.section, border: '1px solid #42a5f5' }}>
        <div style={{ ...s.header, color: '#42a5f5' }}>10. Next Step</div>
        <div style={{ padding: 12, background: '#16213e', borderRadius: 4, fontSize: 13, color: '#e0e0e0', lineHeight: 1.6 }}>
          <div>v7.39 Minimal Stage C First Slice Implementation Pack is complete.</div>
          <div style={{ marginTop: 8 }}>Authorization state: <span style={{ color: '#66bb6a', fontWeight: 700 }}>GRANTED_FOR_FIRST_SLICE_IMPLEMENTATION_REVIEW</span></div>
          <div style={{ marginTop: 4 }}>Stage C: <span style={{ color: '#ef5350', fontWeight: 700 }}>DISABLED</span></div>
          <div style={{ marginTop: 8, color: '#8892b0' }}>Next suggested step: v7.39-P1 First Slice Live Smoke + Seal Recheck.</div>
          <div style={{ color: '#8892b0' }}>Stage C must remain disabled until explicit human owner authorization for enablement.</div>
        </div>
      </div>
    </PageShell>
  );
};

export default StageCFirstSliceImplementationPreview;
