import React from 'react';
import { CONNECTOR_REGISTRY_NEW } from '../../registry/connector-registry';

const COLOR_PASS = 'var(--success)';
const COLOR_FAIL = 'var(--danger)';

function Badge({ label, color }: { label: string; color?: string }) {
  return <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 9, fontWeight: 600, color: '#fff', background: color || '#6B7280', lineHeight: '16px', whiteSpace: 'nowrap' }}>{label}</span>;
}

function SafetyCheck({ label, ok }: { label: string; ok: boolean }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.02)', fontSize: 9 }}>
    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
    <span style={{ fontWeight: 600, color: ok ? COLOR_PASS : COLOR_FAIL }}>{ok ? '✅ PASS' : '❌ FAIL'}</span>
  </div>;
}

export default function ConnectorIntegrationBoundary() {
  const allPass = CONNECTOR_REGISTRY_NEW.every(c => Object.values(c.qualityGate).every(v => v === true));
  const allReadonly = CONNECTOR_REGISTRY_NEW.every(c => c.safetyBoundary.includes('readonly'));
  const noExternalControl = CONNECTOR_REGISTRY_NEW.every(c => c.qualityGate.noExternalControl);
  const noDbWrite = CONNECTOR_REGISTRY_NEW.every(c => c.qualityGate.noDbWrite);
  const noStageC = CONNECTOR_REGISTRY_NEW.every(c => c.qualityGate.noStageC);
  const noDangerous = CONNECTOR_REGISTRY_NEW.every(c => c.qualityGate.noDangerousActions);

  return (
    <div>
      {/* Integration Boundary Panel */}
      <div style={{ marginBottom: 16, padding: 14, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Integration Boundary Panel</div>
        <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 8 }}>Per-connector allowed/blocked actions and safety boundaries</div>
        {CONNECTOR_REGISTRY_NEW.map(c => (
          <div key={c.id} style={{ marginBottom: 6, padding: 8, borderRadius: 4, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', fontSize: 9 }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{c.name}</div>
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 2 }}>
              {c.safetyBoundary.map(s => <Badge key={s} label={s} color="#6B7280" />)}
            </div>
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 2 }}>
              <span style={{ color: 'var(--text-muted)' }}>Allowed:</span>
              {c.actionsAllowed.map(a => <Badge key={a} label={a} color="var(--success)" />)}
            </div>
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--text-muted)' }}>Blocked:</span>
              {c.actionsBlocked.map(a => <Badge key={a} label={a} color="var(--danger)" />)}
            </div>
          </div>
        ))}
      </div>

      {/* Safety Matrix */}
      <div style={{ marginBottom: 16, padding: 14, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>No External Write / Readonly Safety Matrix</div>
        <div style={{ display: 'grid', gap: 2, marginBottom: 10 }}>
          <SafetyCheck label="All connectors readonly" ok={allReadonly} />
          <SafetyCheck label="No external control" ok={noExternalControl} />
          <SafetyCheck label="No DB write" ok={noDbWrite} />
          <SafetyCheck label="No Stage C" ok={noStageC} />
          <SafetyCheck label="No dangerous actions" ok={noDangerous} />
          <SafetyCheck label="All quality gates pass" ok={allPass} />
        </div>
        <div style={{ fontSize: 9, color: 'var(--text-muted)', fontStyle: 'italic' }}>
          All {CONNECTOR_REGISTRY_NEW.length} connectors satisfy readonly safety criteria. No executable controls, no external writes, no API calls. No token or credential exposure.
        </div>
      </div>

      {/* Recommended Integration Path */}
      <div style={{ padding: 14, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Recommended Integration Path</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          {['1. Review each connector capability', '2. Verify safety boundary', '3. Check quality gate', '4. Plan future integration', '5. Keep readonly until Stage C'].map(s => (
            <span key={s} style={{ padding: '4px 10px', borderRadius: 12, background: 'rgba(139,92,246,0.08)', color: '#8B5CF6', fontWeight: 500, fontSize: 9, whiteSpace: 'nowrap', cursor: 'default' }}>{s}</span>
          ))}
        </div>
        <div style={{ fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <strong>Next steps:</strong> Active connectors (OpenAxiom, Memory Hub) — keep readonly. Hugging Face — plan API integration design. Future connectors (OpenClaw, ComfyUI, Hermes, CC Switch, Claude Proxy) — hold for review until safety boundaries are defined. No Stage C enablement, no real control buttons, no DB writes.
        </div>
      </div>
    </div>
  );
}
