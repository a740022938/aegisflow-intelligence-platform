import React, { useMemo } from 'react';
import PageShell from '../components/ui/PageShell';
import SectionCard from '../components/ui/SectionCard';
import { GOVERNANCE_REGISTRY } from '../registry/governance-registry';
import { validateGovernanceRegistry, getGovernanceRegistrySummary } from '../registry/governance-registry-validator';
import type { GovernanceModuleDefinition, GovernanceStatus, GovernanceRiskLevel, SafetyBoundaryTag } from '../registry/governance-registry';
import type { GovernanceRegistryIssue } from '../registry/governance-registry-validator';

// ── Constants ──
const VALIDATOR_EXPECTED = { modules: 13, gates: 12, blocking: 0, warning: 0 };
const STATUS_COLORS: Record<string, string> = {
  pass: 'var(--success)', warning: 'var(--warning)', blocked: 'var(--danger)',
  pending_review: 'var(--secondary)', approval_required: '#F97316', dry_run_only: '#8B5CF6',
  disabled: '#6B7280', deferred: '#6B7280', unknown: 'var(--text-muted)',
};
const RISK_COLORS: Record<string, string> = { low: 'var(--success)', medium: 'var(--warning)', high: 'var(--danger)', critical: '#7C3AED' };
const TAG_COLORS: Record<string, string> = {
  readonly: 'var(--secondary)', dry_run: '#8B5CF6', approval_required: 'var(--warning)',
  external_write_blocked: 'var(--danger)', dangerous_action_blocked: 'var(--danger)',
};

function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11,
      fontWeight: 600, color: '#fff', background: color || 'var(--text-muted)',
      lineHeight: '16px', whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '3px 0', fontSize: 11, borderBottom: '1px solid var(--border)' }}>
      <span style={{ width: 130, flexShrink: 0, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

function ModuleCard({ mod }: { mod: GovernanceModuleDefinition }) {
  const [expanded, setExpanded] = React.useState(false);
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{mod.displayName}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 1 }}>{mod.moduleId}</div>
        </div>
        <div style={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Badge label={mod.status} color={STATUS_COLORS[mod.status]} />
          <Badge label={mod.riskLevel} color={RISK_COLORS[mod.riskLevel]} />
          <Badge label={mod.maturity} color={mod.maturity === 'stable' ? 'var(--success)' : mod.maturity === 'preview' ? 'var(--warning)' : mod.maturity === 'lab' ? 'var(--secondary)' : '#8B5CF6'} />
        </div>
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6 }}>{mod.description}</div>
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 6 }}>
        {mod.safetyBoundaryTags.map(t => <Badge key={t} label={t} color={TAG_COLORS[t]} />)}
        <Badge label={mod.ownerCenter} color="var(--text-muted)" />
        <Badge label={mod.category} color="var(--secondary)" />
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>
        {mod.currentEntry !== '—' ? `入口: ${mod.currentEntry}` : '无独立入口'}
        {mod.dryRunSupport && ' · dry-run'}{mod.approvalRequired && ' · 需审批'}{mod.writesExternalSystem && ' · 外写'}
      </div>
      <button type="button" onClick={() => setExpanded(!expanded)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: 'var(--secondary)', padding: 0, fontFamily: 'inherit' }}>
        {expanded ? '收起 ▲' : '展开 ▼'}
      </button>
      {expanded && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
          <DetailRow label="relatedRoutes" value={mod.relatedRoutes.join(', ') || '—'} />
          <DetailRow label="dryRun" value={mod.dryRunSupport ? '✅' : '❌'} />
          <DetailRow label="approvalRequired" value={mod.approvalRequired ? '✅' : '❌'} />
          <DetailRow label="writesDB" value={mod.writesDatabase ? '⚠️ YES' : '❌'} />
          <DetailRow label="writesExternal" value={mod.writesExternalSystem ? '✅' : '❌'} />
          <DetailRow label="migrationStage" value={String(mod.migrationStage)} />
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', marginTop: 6, marginBottom: 2 }}>禁止操作</div>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {mod.actionPolicy.forbiddenActions.slice(0, 8).map(a => <Badge key={a} label={a} color="var(--danger)" />)}
            {mod.actionPolicy.forbiddenActions.length > 8 && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{mod.actionPolicy.forbiddenActions.length - 8}</span>}
          </div>
          {mod.notes && <DetailRow label="备注" value={mod.notes} />}
        </div>
      )}
    </div>
  );
}

function GateBadge({ gate }: { gate: any }) {
  const color = gate.status === 'pass' ? 'var(--success)' : gate.status === 'fail' ? 'var(--danger)' : gate.status === 'warn' ? 'var(--warning)' : 'var(--text-muted)';
  return (
    <div style={{ padding: '6px 10px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border)', fontSize: 11 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{gate.displayName}</span>
        <Badge label={gate.status} color={color} />
        {gate.blocking && <span style={{ fontSize: 9, color: 'var(--danger)' }}>BLOCKING</span>}
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{gate.source}</div>
      {gate.lastKnownResult && <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{gate.lastKnownResult}</div>}
      {gate.failurePolicy && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>failure: {gate.failurePolicy}</div>}
    </div>
  );
}

export default function GovernanceCenter() {
  const summary = useMemo(() => getGovernanceRegistrySummary(), []);
  const validator = useMemo(() => validateGovernanceRegistry(), []);

  const allGates = useMemo(() => {
    return GOVERNANCE_REGISTRY.flatMap(m => m.gates || []);
  }, []);

  const selfCheck = useMemo(() => {
    const checks: Array<{ name: string; status: 'pass' | 'fail'; detail: string }> = [];
    checks.push({ name: `Module count === ${VALIDATOR_EXPECTED.modules}`, status: GOVERNANCE_REGISTRY.length === VALIDATOR_EXPECTED.modules ? 'pass' : 'fail', detail: String(GOVERNANCE_REGISTRY.length) });
    checks.push({ name: `Gate count >= ${VALIDATOR_EXPECTED.gates}`, status: allGates.length >= VALIDATOR_EXPECTED.gates ? 'pass' : 'fail', detail: String(allGates.length) });
    checks.push({ name: 'Validator overall === pass', status: validator.pass ? 'pass' : 'fail', detail: validator.pass ? 'pass' : 'fail' });
    checks.push({ name: 'Blocking issues === 0', status: validator.blockingCount === 0 ? 'pass' : 'fail', detail: String(validator.blockingCount) });
    checks.push({ name: 'Warning issues === 0', status: validator.warningCount === 0 ? 'pass' : 'fail', detail: String(validator.warningCount) });

    const statusSum = Object.values(summary.byStatus).reduce((a: number, b: number) => a + b, 0);
    checks.push({ name: 'byStatus subtotal === total', status: statusSum === summary.totalModules ? 'pass' : 'fail', detail: `${statusSum} vs ${summary.totalModules}` });

    const cr = GOVERNANCE_REGISTRY.find(m => m.moduleId === 'cost-routing');
    checks.push({ name: 'cost-routing currentEntry === /cost-routing', status: cr?.currentEntry === '/cost-routing' ? 'pass' : 'fail', detail: cr?.currentEntry || 'MISSING' });

    const stageCGate = allGates.find(g => g.gateId === 'stage_c_gate');
    checks.push({ name: 'stage_c_gate status !== pass', status: stageCGate && stageCGate.status !== 'pass' ? 'pass' : 'fail', detail: stageCGate?.status || 'MISSING' });

    const writesDB = GOVERNANCE_REGISTRY.filter(m => m.writesDatabase);
    checks.push({ name: 'No module writesDatabase === true', status: writesDB.length === 0 ? 'pass' : 'fail', detail: writesDB.map(m => m.moduleId).join(', ') || '0' });

    return { pass: checks.every(c => c.status === 'pass'), checks };
  }, [summary, validator, allGates]);

  return (
    <PageShell
      title="治理中心"
      subtitle="AIP v7.15.0-P2 Governance Center Readonly Shell"
      versionLabel="AIP v7.15.0-P2"
      maturity="preview"
      safetyBoundary="readonly"
      safetyText="只读治理中心 · 不写数据库 · 不移动菜单 · 不启用 Stage C · 不处理 Memory Hub candidate · 不发 GitHub Release · 不执行外部写入 · 不做自动修复"
    >
      {/* Self-check */}
      {!selfCheck.pass && (
        <div style={{ padding: '10px 16px', marginBottom: 16, borderRadius: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger)', fontSize: 12 }}>
          <strong>自检失败：</strong>
          {selfCheck.checks.filter(c => c.status === 'fail').map((c, i) => <div key={i}>❌ {c.name}: {c.detail}</div>)}
        </div>
      )}
      {selfCheck.pass && (
        <div style={{ padding: '8px 16px', marginBottom: 16, borderRadius: 6, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: 'var(--success)', fontSize: 12 }}>
          ✅ 自检通过 — {selfCheck.checks.length} 项检查全部 pass
        </div>
      )}

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 20 }}>
        {[
          ['Modules', String(summary.totalModules), 'var(--primary)'],
          ['Gates', String(allGates.length), 'var(--secondary)'],
          ['Validator', validator.pass ? 'PASS' : 'FAIL', validator.pass ? 'var(--success)' : 'var(--danger)'],
          ['Blocking', String(validator.blockingCount), validator.blockingCount > 0 ? 'var(--danger)' : 'var(--success)'],
          ['Warning', String(validator.warningCount), validator.warningCount > 0 ? 'var(--warning)' : 'var(--success)'],
          ['Info', String(validator.infoCount), 'var(--text-muted)'],
          ['ApprovalReq', String(summary.approvalRequiredCount), 'var(--warning)'],
          ['HighRisk', String(summary.byRiskLevel['high'] || 0), 'var(--danger)'],
          ['ExtWriteBlock', String(summary.externalWriteBlockedCount), 'var(--danger)'],
          ['DangerBlock', String(summary.dangerousActionBlockedCount), 'var(--danger)'],
        ].map(([label, value, color]) => (
          <div key={String(label)} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Governance Modules */}
      <SectionCard title="治理模块" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 12 }}>
          {GOVERNANCE_REGISTRY.map(m => <ModuleCard key={m.moduleId} mod={m} />)}
        </div>
      </SectionCard>

      {/* Gates Panel */}
      <SectionCard title="治理门禁" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
          {allGates.map(g => <GateBadge key={g.gateId} gate={g} />)}
        </div>
      </SectionCard>

      {/* Validator Issues */}
      <SectionCard title="Validator Issues" style={{ marginBottom: 20 }}>
        {validator.issues.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11 }}>
            {validator.issues.map((issue, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                <Badge label={issue.severity} color={issue.severity === 'blocking' ? 'var(--danger)' : issue.severity === 'warning' ? 'var(--warning)' : 'var(--text-muted)'} />
                <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--text-muted)' }}>{issue.moduleId || '—'}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{issue.field || ''}</span>
                <span style={{ color: 'var(--text-primary)' }}>{issue.message}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: 12, textAlign: 'center', color: 'var(--success)', fontSize: 12 }}>✅ 无 issues</div>
        )}
      </SectionCard>

      {/* Forbidden Actions Matrix */}
      <SectionCard title="禁止操作矩阵" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {Array.from(new Set(GOVERNANCE_REGISTRY.flatMap(m => m.actionPolicy.forbiddenActions))).sort().map(a => (
            <Badge key={a} label={a} color="var(--danger)" />
          ))}
        </div>
      </SectionCard>

      {/* Related Routes */}
      <SectionCard title="相关页面" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
          <div>Governance Center 当前只是聚合入口，不移动这些页面，不加入左侧菜单，不改变原页面。</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            {['/cost-routing', '/menu-governance-preview', '/registry-render-preview', '/menu-move-dry-run', '/connector-center', '/lab-center'].map(p => (
              <Badge key={p} label={p} color="var(--secondary)" />
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Stage C Notice */}
      <SectionCard title="Stage C 说明">
        <div style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <p><strong>Stage C（Feature-flagged Layout Rendering）尚未开始。</strong></p>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>stage_c_gate status: <Badge label="deferred" color="#6B7280" /></li>
            <li>本页面没有启用 Stage C 的按钮</li>
            <li>本页面不会改变 Layout</li>
            <li>本页面不会改变左侧菜单</li>
          </ul>
        </div>
      </SectionCard>

      {/* Safety footer */}
      <div style={{ marginTop: 24, padding: '12px 16px', borderRadius: 6, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <strong>安全边界：</strong>
        Governance Center 是只读中枢。Governance Registry 是只读元数据。本页面不会写 DB、不会执行外部调用、不会处理 Memory Hub candidate、不会发布 GitHub Release、不会启用 Stage C、不会移动菜单、不会修改 Layout。
      </div>
    </PageShell>
  );
}
