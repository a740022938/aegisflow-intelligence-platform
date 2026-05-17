import React, { useMemo } from 'react';
import PageShell from '../components/ui/PageShell';
import SectionCard from '../components/ui/SectionCard';
import { buildMenuMoveDryRun, getMenuMoveDryRunSummary, getMoveImpacts, validateMenuMoveDryRun } from '../registry/menu-move-dry-run';

const ACTION_COLORS: Record<string, string> = {
  KEEP: 'var(--success)', MOVE_TO_LAB: 'var(--warning)', MOVE_TO_CONNECTOR_CENTER: 'var(--secondary)',
  HIDE: 'var(--danger)', ARCHIVE_CANDIDATE: 'var(--text-muted)', MOVE_TO_GOVERNANCE: 'var(--danger)',
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

function renderTree(items: Array<{ id: string; labelKey: string; path: string; icon: string; action: string; futureTargetGroup?: string; isMoved?: boolean; isNew?: boolean; note?: string }>, showActions = true) {
  return (
    <div style={{ fontSize: 12, fontFamily: 'monospace', lineHeight: 1.8 }}>
      {items.map((item, idx) => (
        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0 2px 12px', color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--text-muted)', width: 12 }}>├</span>
          <Badge label={item.icon} color="var(--secondary)" />
          <span style={{ color: 'var(--text-primary)' }}>{item.labelKey}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{item.path}</span>
          {showActions && item.action !== 'KEEP' && (
            <Badge label={item.action} color={ACTION_COLORS[item.action]} />
          )}
          {item.futureTargetGroup && (
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>→ {item.futureTargetGroup}</span>
          )}
          {item.note && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>({item.note})</span>}
        </div>
      ))}
    </div>
  );
}

export default function MenuMoveDryRun() {
  const dryRun = useMemo(() => buildMenuMoveDryRun(), []);
  const summary = useMemo(() => getMenuMoveDryRunSummary(), []);
  const impacts = useMemo(() => getMoveImpacts(), []);
  const validation = useMemo(() => validateMenuMoveDryRun(), []);

  return (
    <PageShell
      title="菜单移动 Dry-Run"
      subtitle="AIP v7.14.0-P5 Menu Move Dry-Run — 只读模拟，不执行真实移动"
      versionLabel="AIP v7.14.0-P5"
      maturity="preview"
      safetyBoundary="readonly"
      safetyText="只读 dry-run · 不修改 Layout · 不改变左侧菜单 · 不真实移动/隐藏/删除菜单 · 不写数据库 · 不启用 feature flag"
    >
      {/* Validation banner */}
      {!validation.pass && (
        <div style={{ padding: '12px 16px', marginBottom: 16, borderRadius: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger)', fontSize: 13 }}>
          <strong>校验失败：</strong>
          <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
            {validation.checks.filter(c => c.status !== 'pass').map((c, i) => <li key={i}>{c.name}: {c.detail}</li>)}
          </ul>
        </div>
      )}
      {validation.pass && (
        <div style={{ padding: '8px 16px', marginBottom: 16, borderRadius: 6, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: 'var(--success)', fontSize: 12 }}>
          ✅ Dry-run 校验全部通过 — {validation.checks.length} 项检查均 pass
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 20 }}>
        {[
          ['Current Sections', String(summary.currentSections), 'var(--primary)'],
          ['Current Items', String(summary.currentItems), 'var(--primary)'],
          ['Dry-Run Sections', String(summary.dryRunSections), 'var(--secondary)'],
          ['Dry-Run Visible', String(summary.dryRunVisibleItems), 'var(--secondary)'],
          ['KEEP', String(summary.keepCount), 'var(--success)'],
          ['→ Lab', String(summary.moveToLabCount), 'var(--warning)'],
          ['→ Connector', String(summary.moveToConnectorCount), 'var(--secondary)'],
          ['→ Governance', String(summary.moveToGovernanceCount), summary.moveToGovernanceCount > 0 ? 'var(--danger)' : 'var(--success)'],
          ['HIDE', String(summary.hideCount), 'var(--text-muted)'],
          ['ARCHIVE', String(summary.archiveCount), 'var(--text-muted)'],
        ].map(([label, value, color]) => (
          <div key={String(label)} style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '10px 12px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Side-by-side menu trees */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <SectionCard title="当前菜单结构 (Current)">
          {dryRun.current.map(sec => (
            <div key={sec.sectionId} style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-primary)', padding: '4px 0' }}>{sec.label}</div>
              {renderTree(sec.items, true)}
            </div>
          ))}
        </SectionCard>

        <SectionCard title="模拟未来结构 (Dry-Run)">
          {dryRun.simulated.map(sec => (
            <div key={sec.sectionId} style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-primary)', padding: '4px 0' }}>
                {sec.label}
                {sec.sectionId === 'connector-center' && <Badge label="NEW" color="var(--secondary)" />}
                {sec.sectionId === 'lab-center' && <Badge label="NEW" color="var(--warning)" />}
              </div>
              {renderTree(sec.items, true)}
            </div>
          ))}
        </SectionCard>
      </div>

      {/* Move Impact Table */}
      <SectionCard title="Move Impact 详情" style={{ marginBottom: 20 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Current Section</th>
                <th style={thStyle}>Current Path</th>
                <th style={thStyle}>Action</th>
                <th style={thStyle}>Target Section</th>
                <th style={thStyle}>User Impact</th>
                <th style={thStyle}>Rollback</th>
                <th style={thStyle}>Risk</th>
              </tr>
            </thead>
            <tbody>
              {impacts.map(imp => (
                <tr key={imp.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={tdStyle}>{imp.id}</td>
                  <td style={tdStyle}>{imp.currentSection}</td>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 10 }}>{imp.currentPath}</td>
                  <td style={tdStyle}><Badge label={imp.action} color={ACTION_COLORS[imp.action]} /></td>
                  <td style={tdStyle}>{imp.simulatedTargetSection}</td>
                  <td style={{ ...tdStyle, fontSize: 10, color: 'var(--text-muted)' }}>{imp.userImpact}</td>
                  <td style={{ ...tdStyle, fontSize: 10, color: 'var(--text-muted)' }}>{imp.rollback}</td>
                  <td style={tdStyle}><Badge label={imp.riskLevel} color={imp.riskLevel === 'high' ? 'var(--danger)' : imp.riskLevel === 'medium' ? 'var(--warning)' : 'var(--success)'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Validation Detail */}
      <SectionCard title="Dry-Run 校验详情" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
          {validation.checks.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ color: c.status === 'pass' ? 'var(--success)' : c.status === 'warn' ? 'var(--warning)' : 'var(--danger)', fontWeight: 600 }}>
                {c.status === 'pass' ? '✅' : c.status === 'warn' ? '⚠️' : '❌'}
              </span>
              <span style={{ color: 'var(--text-primary)' }}>{c.name}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{c.detail}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Next Stage Notice */}
      <SectionCard title="后续阶段说明">
        <div style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li><strong>P5 只是 dry-run</strong> — 不执行任何真实菜单移动</li>
            <li>真正移动菜单需要 <strong>Stage C Feature-flagged Layout Rendering</strong> + 用户拍板</li>
            <li>所有移动必须可回滚（feature flag / git revert）</li>
            <li>原入口在 Stage 6 之前不会被隐藏</li>
            <li>Connector Center 和 Lab Center 页面已是 readonly shell，但尚未加入左侧菜单</li>
          </ul>
        </div>
      </SectionCard>

      {/* Safety boundary */}
      <div style={{ marginTop: 24, padding: '12px 16px', borderRadius: 6, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <strong>重要边界：</strong>
        Layout.tsx 仍是真实菜单来源。MENU_REGISTRY 仍未接管真实菜单。本页面只是 Menu Move Dry-Run，不会改变左侧菜单，不会移动/隐藏/删除任何菜单，不会启用 feature flag，不会写数据库。
      </div>
    </PageShell>
  );
}

const thStyle: React.CSSProperties = { padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 11, whiteSpace: 'nowrap', background: 'var(--bg-surface)' };
const tdStyle: React.CSSProperties = { padding: '6px 10px', color: 'var(--text-primary)' };
