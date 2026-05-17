import React, { useMemo } from 'react';
import PageShell from '../components/ui/PageShell';
import SectionCard from '../components/ui/SectionCard';
import StatusBadge from '../components/ui/StatusBadge';
import { MENU_REGISTRY } from '../registry/menu-registry';
import type { MenuRegistryItem } from '../registry/menu-registry';

// ── Governance action enum — DO NOT introduce MOVE_TO_GOVERNANCE here ──
type GovernanceAction = 'KEEP' | 'RENAME' | 'MERGE' | 'MOVE_TO_LAB' | 'MOVE_TO_CONNECTOR_CENTER' | 'HIDE' | 'ARCHIVE_CANDIDATE';

interface GovernanceDecision {
  action: GovernanceAction;
  futureTargetGroup?: string;
  reason?: string;
}

const ALLOWED_ACTIONS: GovernanceAction[] = ['KEEP', 'RENAME', 'MERGE', 'MOVE_TO_LAB', 'MOVE_TO_CONNECTOR_CENTER', 'HIDE', 'ARCHIVE_CANDIDATE'];

// ── Governance decisions — one entry per MENU_REGISTRY item id ──
const GOVERNANCE: Record<string, GovernanceDecision> = {
  // overview
  dashboard: { action: 'KEEP' },
  'factory-status': { action: 'KEEP' },
  'assistant-center': { action: 'KEEP', reason: 'P1d PageShell migrated, consider stable after v7.13.0' },

  // data-and-training
  datasets: { action: 'KEEP' },
  training: { action: 'KEEP' },
  runs: { action: 'KEEP' },
  templates: { action: 'KEEP' },

  // model-and-release
  models: { action: 'KEEP' },
  artifacts: { action: 'KEEP' },
  evaluations: { action: 'KEEP' },
  deployments: { action: 'KEEP' },

  // workflow-and-composer
  'workflow-jobs': { action: 'KEEP' },
  'workflow-composer': { action: 'KEEP' },
  'workflow-canvas': { action: 'KEEP' },

  // capabilities
  'module-center': { action: 'KEEP' },
  'plugin-pool': { action: 'KEEP' },
  tasks: { action: 'KEEP' },
  'cost-routing': { action: 'KEEP', futureTargetGroup: 'governance', reason: '未来建议归入"治理与回流"分组，当前保持不动' },
  'openaxiom-readonly': { action: 'MOVE_TO_CONNECTOR_CENTER', futureTargetGroup: 'connector', reason: '外部工具只读页，建议移至连接器分组' },
  'memory-hub-readonly': { action: 'MOVE_TO_CONNECTOR_CENTER', futureTargetGroup: 'connector', reason: '外部数据只读页，建议移至连接器分组' },

  // intelligence
  'digital-employee': { action: 'MOVE_TO_LAB', futureTargetGroup: 'lab', reason: 'ModulePage 占位页' },
  'training-v2': { action: 'MOVE_TO_LAB', futureTargetGroup: 'lab', reason: 'ModulePage 占位页，v7.14 候选升级' },
  hpo: { action: 'MOVE_TO_LAB', futureTargetGroup: 'lab', reason: 'ModulePage 占位页' },
  distill: { action: 'MOVE_TO_LAB', futureTargetGroup: 'lab', reason: 'ModulePage 占位页' },
  'model-merge': { action: 'MOVE_TO_LAB', futureTargetGroup: 'lab', reason: 'ModulePage 占位页' },
  inference: { action: 'MOVE_TO_LAB', futureTargetGroup: 'lab', reason: 'ModulePage 占位页' },
  annotation: { action: 'MOVE_TO_LAB', futureTargetGroup: 'lab', reason: 'ModulePage 占位页' },
  huggingface: { action: 'MOVE_TO_LAB', futureTargetGroup: 'lab', reason: 'ModulePage 占位页' },

  // automation
  'backflow-v2': { action: 'MOVE_TO_LAB', futureTargetGroup: 'lab', reason: 'ModulePage 占位页' },
  scheduler: { action: 'MOVE_TO_LAB', futureTargetGroup: 'lab', reason: 'ModulePage 占位页' },
  alerting: { action: 'MOVE_TO_LAB', futureTargetGroup: 'lab', reason: 'ModulePage 占位页' },
  'model-monitor': { action: 'MOVE_TO_LAB', futureTargetGroup: 'lab', reason: 'ModulePage 占位页' },
  'deploy-v2': { action: 'MOVE_TO_LAB', futureTargetGroup: 'lab', reason: 'ModulePage 占位页，发布操作风险高' },

  // vision-lab
  'mahjong-debug': { action: 'KEEP', reason: '调试工具页，归属于视觉实验室' },

  // governance
  approvals: { action: 'KEEP' },
  'governance-hub': { action: 'KEEP' },
  audit: { action: 'KEEP' },
  feedback: { action: 'KEEP' },

  // knowledge
  'knowledge-center': { action: 'KEEP' },

  // output
  'standard-output': { action: 'KEEP' },
};

// ── Column definitions for the governance table ──
interface TableRow {
  seq: number;
  section: string;
  id: string;
  labelKey: string;
  path: string;
  pageType: string;
  maturity: string;
  riskLevel: string;
  action: GovernanceAction;
  futureTargetGroup?: string;
  reason?: string;
}

// ── Self-check result ──
interface SelfCheck {
  pass: boolean;
  registryCount: number;
  decisionCount: number;
  eachHasDecision: boolean;
  allActionsValid: boolean;
  moveToGovernanceCount: number;
  costRoutingAction: string;
  costRoutingValid: boolean;
  errors: string[];
}

function runSelfCheck(): SelfCheck {
  const errors: string[] = [];
  const allItems: MenuRegistryItem[] = MENU_REGISTRY.flatMap(s => s.items);
  const registryCount = allItems.length;
  const decisionKeys = Object.keys(GOVERNANCE);
  const decisionCount = decisionKeys.length;

  // Count mismatch
  if (registryCount !== 40) errors.push(`Registry item count ${registryCount} !== 40`);

  // Each registry item has a decision
  const missingDecision = allItems.filter(item => !GOVERNANCE[item.id]);
  const eachHasDecision = missingDecision.length === 0;
  if (!eachHasDecision) errors.push(`Missing governance decisions for: ${missingDecision.map(i => i.id).join(', ')}`);

  // Extra decisions for non-existent items
  const extraDecisions = decisionKeys.filter(id => !allItems.some(item => item.id === id));
  if (extraDecisions.length > 0) errors.push(`Extra decisions for non-registry items: ${extraDecisions.join(', ')}`);

  // All actions valid
  const invalidActions = decisionKeys.filter(id => !ALLOWED_ACTIONS.includes(GOVERNANCE[id].action));
  const allActionsValid = invalidActions.length === 0;
  if (!allActionsValid) errors.push(`Invalid actions: ${invalidActions.map(id => `${id}=${GOVERNANCE[id].action}`).join(', ')}`);

  // MOVE_TO_GOVERNANCE count
  const moveToGovernanceCount = decisionKeys.filter(id => GOVERNANCE[id].action === ('MOVE_TO_GOVERNANCE' as any)).length;
  if (moveToGovernanceCount > 0) errors.push(`MOVE_TO_GOVERNANCE count = ${moveToGovernanceCount}, expected 0`);

  // cost-routing
  const cr = GOVERNANCE['cost-routing'];
  const costRoutingValid = cr && cr.action === 'KEEP';
  if (!costRoutingValid) errors.push(`cost-routing action = ${cr?.action}, expected KEEP`);

  return {
    pass: errors.length === 0,
    registryCount, decisionCount, eachHasDecision,
    allActionsValid, moveToGovernanceCount,
    costRoutingAction: cr?.action || 'MISSING',
    costRoutingValid,
    errors,
  };
}

function buildRows(): TableRow[] {
  const rows: TableRow[] = [];
  let seq = 0;
  for (const section of MENU_REGISTRY) {
    for (const item of section.items) {
      seq++;
      const g = GOVERNANCE[item.id];
      rows.push({
        seq,
        section: section.label,
        id: item.id,
        labelKey: item.labelKey || item.label,
        path: item.path,
        pageType: item.pageType,
        maturity: item.maturity,
        riskLevel: item.riskLevel,
        action: g?.action || 'KEEP',
        futureTargetGroup: g?.futureTargetGroup,
        reason: g?.reason,
      });
    }
  }
  return rows;
}

// ── Helpers ──
const ACTION_LABELS: Record<GovernanceAction, string> = {
  KEEP: '保持当前', RENAME: '重命名', MERGE: '合并', MOVE_TO_LAB: '移至实验室',
  MOVE_TO_CONNECTOR_CENTER: '移至连接器', HIDE: '隐藏', ARCHIVE_CANDIDATE: '归档候选',
};

const ACTION_COLORS: Record<GovernanceAction, string> = {
  KEEP: 'var(--success)', RENAME: 'var(--secondary)', MERGE: '#8B5CF6',
  MOVE_TO_LAB: 'var(--warning)', MOVE_TO_CONNECTOR_CENTER: 'var(--secondary)',
  HIDE: 'var(--text-muted)', ARCHIVE_CANDIDATE: 'var(--danger)',
};

const RISK_COLORS: Record<string, string> = { low: 'var(--success)', medium: 'var(--warning)', high: 'var(--danger)' };
const MATURITY_COLORS: Record<string, string> = { stable: 'var(--success)', preview: 'var(--warning)', lab: 'var(--secondary)', external: '#8B5CF6', archived: 'var(--text-muted)' };

// ── Simple Badge ──
function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11,
      fontWeight: 600, color: '#fff', background: color || 'var(--text-muted)',
      lineHeight: '16px', whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

function ActionBadge({ action }: { action: GovernanceAction }) {
  return <Badge label={ACTION_LABELS[action]} color={ACTION_COLORS[action]} />;
}

function RiskBadge({ level }: { level: string }) {
  return <Badge label={level} color={RISK_COLORS[level] || 'var(--text-muted)'} />;
}

function MaturityBadge({ level }: { level: string }) {
  return <Badge label={level} color={MATURITY_COLORS[level] || 'var(--text-muted)'} />;
}

// ── Filter state ──
type FilterKey = 'all' | GovernanceAction;

function uniqueSorted<T>(arr: T[]): T[] {
  return [...new Set(arr)].sort();
}

export default function MenuGovernancePreview() {
  const [filterAction, setFilterAction] = React.useState<FilterKey>('all');
  const [filterRisk, setFilterRisk] = React.useState<string>('all');
  const [filterMaturity, setFilterMaturity] = React.useState<string>('all');

  const selfCheck = useMemo(() => runSelfCheck(), []);
  const rows = useMemo(() => buildRows(), []);

  const filtered = useMemo(() => {
    return rows.filter(r =>
      (filterAction === 'all' || r.action === filterAction) &&
      (filterRisk === 'all' || r.riskLevel === filterRisk) &&
      (filterMaturity === 'all' || r.maturity === filterMaturity)
    );
  }, [rows, filterAction, filterRisk, filterMaturity]);

  const actionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of rows) counts[r.action] = (counts[r.action] || 0) + 1;
    return counts;
  }, [rows]);

  const riskCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of rows) counts[r.riskLevel] = (counts[r.riskLevel] || 0) + 1;
    return counts;
  }, [rows]);

  const futureGroupCounts = useMemo(() => {
    const counts: Record<string, number> = { '保持当前': 0, '治理与回流': 0, '连接器': 0, '实验室': 0 };
    for (const r of rows) {
      if (!r.futureTargetGroup) counts['保持当前']++;
      else if (r.futureTargetGroup === 'governance') counts['治理与回流']++;
      else if (r.futureTargetGroup === 'connector') counts['连接器']++;
      else if (r.futureTargetGroup === 'lab') counts['实验室']++;
    }
    return counts;
  }, [rows]);

  const placeholderCount = rows.filter(r => r.pageType === 'placeholder').length;
  const highRiskCount = rows.filter(r => r.riskLevel === 'high').length;
  const noDecisionCount = rows.filter(r => !GOVERNANCE[r.id]).length;

  return (
    <PageShell
      title="菜单治理预览"
      subtitle="AIP v7.13.0-P1h Menu Governance Preview Page"
      versionLabel="AIP v7.13.0-P1h"
      maturity="preview"
      safetyBoundary="readonly"
      safetyText="只读预览 · 不修改 Layout · 不改变左侧菜单 · 不隐藏/删除/移动菜单 · 不写数据库 · 不发布 Release"
    >
      {/* Self-check warning */}
      {!selfCheck.pass && (
        <div style={{
          padding: '12px 16px', marginBottom: 16, borderRadius: 6,
          background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
          color: 'var(--danger)', fontSize: 13,
        }}>
          <strong>自检失败：</strong>
          <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
            {selfCheck.errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {selfCheck.pass && (
        <div style={{
          padding: '8px 16px', marginBottom: 16, borderRadius: 6,
          background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)',
          color: 'var(--success)', fontSize: 12,
        }}>
          ✅ 自检通过 — Registry {selfCheck.registryCount} 项 / 决策 {selfCheck.decisionCount} 项 / 全部 action 合法 / MOVE_TO_GOVERNANCE={selfCheck.moveToGovernanceCount} / cost-routing={selfCheck.costRoutingAction}
        </div>
      )}

      {/* ── 1. Overview Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          ['Registry 分组数', String(MENU_REGISTRY.length), 'var(--primary)'],
          ['Registry 菜单项', String(selfCheck.registryCount), 'var(--primary)'],
          ['决策项数', String(selfCheck.decisionCount), 'var(--secondary)'],
          ['Action 合法', selfCheck.allActionsValid ? '是' : '否', selfCheck.allActionsValid ? 'var(--success)' : 'var(--danger)'],
          ['MOVE_TO_GOVERNANCE', String(selfCheck.moveToGovernanceCount), 'var(--danger)'],
          ['High Risk', String(highRiskCount), 'var(--danger)'],
          ['Placeholder', String(placeholderCount), 'var(--warning)'],
          ['缺决策', String(noDecisionCount), noDecisionCount > 0 ? 'var(--danger)' : 'var(--success)'],
        ].map(([label, value, color]) => (
          <div key={String(label)} style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '14px 16px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* ── 2. Action Distribution ── */}
      <SectionCard title="Action分布" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ALLOWED_ACTIONS.map(action => (
            <div key={action} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 14px', borderRadius: 6,
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
            }}>
              <ActionBadge action={action} />
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                {actionCounts[action] || 0}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── 3. Risk Distribution ── */}
      <SectionCard title="风险分布" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {Object.entries(riskCounts).map(([level, count]) => (
            <div key={level} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 14px', borderRadius: 6,
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
            }}>
              <RiskBadge level={level} />
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{count}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── 4. Future Target Groups ── */}
      <SectionCard title="未来目标分组" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {Object.entries(futureGroupCounts).map(([group, count]) => (
            <div key={group} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 14px', borderRadius: 6,
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
            }}>
              <Badge label={group} color={group === '保持当前' ? 'var(--success)' : group === '治理与回流' ? '#8B5CF6' : group === '连接器' ? 'var(--secondary)' : 'var(--warning)'} />
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{count}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── 5. Governance Table ── */}
      <SectionCard title="菜单治理表" style={{ marginBottom: 20 }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>按 Action 筛选：</span>
          <select value={filterAction} onChange={e => setFilterAction(e.target.value as FilterKey)}
            style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 12 }}>
            <option value="all">全部</option>
            {ALLOWED_ACTIONS.map(a => <option key={a} value={a}>{ACTION_LABELS[a]}</option>)}
          </select>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>按风险筛选：</span>
          <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 12 }}>
            <option value="all">全部</option>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>按成熟度筛选：</span>
          <select value={filterMaturity} onChange={e => setFilterMaturity(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 12 }}>
            <option value="all">全部</option>
            <option value="stable">stable</option>
            <option value="preview">preview</option>
            <option value="lab">lab</option>
            <option value="external">external</option>
          </select>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>显示 {filtered.length} / {rows.length} 项</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={thStyle}>#</th>
                <th style={thStyle}>分组</th>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>path</th>
                <th style={thStyle}>类型</th>
                <th style={thStyle}>成熟度</th>
                <th style={thStyle}>风险</th>
                <th style={thStyle}>Action</th>
                <th style={thStyle}>目标分组</th>
                <th style={thStyle}>备注</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border)', verticalAlign: 'top' }}>
                  <td style={tdStyle}>{r.seq}</td>
                  <td style={tdStyle}>{r.section}</td>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 11 }}>{r.id}</td>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{r.path}</td>
                  <td style={tdStyle}><Badge label={r.pageType} color="var(--secondary)" /></td>
                  <td style={tdStyle}><MaturityBadge level={r.maturity} /></td>
                  <td style={tdStyle}><RiskBadge level={r.riskLevel} /></td>
                  <td style={tdStyle}><ActionBadge action={r.action} /></td>
                  <td style={tdStyle}>
                    {r.futureTargetGroup ? <Badge label={r.futureTargetGroup} color="var(--primary)" /> : <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>}
                  </td>
                  <td style={{ ...tdStyle, color: 'var(--text-secondary)', fontSize: 11, maxWidth: 200 }}>{r.reason || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── 6. 44 vs 40 Explanation ── */}
      <SectionCard title="44 vs 40 差异说明">
        <div style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <p><strong>问题：</strong>v7.13.0-preflight 证据快照报告左侧菜单为 <strong>44 项</strong>，但 P1f 源码提取确认为 <strong>40 项</strong>。</p>
          <p><strong>原因：</strong>preflight 报告统计的是 App.tsx 中注册的路由数量（含 <code>/dashboard</code> redirect 和 <code>*</code> catch-all），而非 Layout.tsx 中实际 <code>{'<NavItem>'}</code> 的数量。Layout.tsx 侧栏精确包含 40 个 <code>{'<NavItem>'}</code> 元素。</p>
          <p><strong>确认：</strong></p>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>P1f MENU_REGISTRY 以 Layout.tsx 源码为基准，确认 11 分组 / 40 项</li>
            <li>P1g / P1h 均以当前 Layout + MENU_REGISTRY 的 40 项为准</li>
            <li>不恢复旧 44 项计数</li>
            <li>不把 App.tsx route 数量等同于左侧菜单数量</li>
          </ul>
        </div>
      </SectionCard>

      {/* Safety boundary footer */}
      <div style={{ marginTop: 24, padding: '12px 16px', borderRadius: 6, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <strong>安全边界：</strong>
        本页面为<u>只读治理预览</u>，不修改 Layout.tsx，不改变左侧菜单，不隐藏/删除/移动任何菜单项，不写数据库，不发布 Release。所有治理动作为建议性，需 v7.14.0+ work order 实现。
      </div>
    </PageShell>
  );
}

const thStyle: React.CSSProperties = {
  padding: '8px 10px', textAlign: 'left', fontWeight: 600,
  color: 'var(--text-secondary)', fontSize: 11, whiteSpace: 'nowrap',
  background: 'var(--bg-surface)',
};

const tdStyle: React.CSSProperties = {
  padding: '6px 10px', color: 'var(--text-primary)',
};
