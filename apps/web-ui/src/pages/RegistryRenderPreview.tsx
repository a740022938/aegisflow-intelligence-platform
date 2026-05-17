import React, { useMemo } from 'react';
import PageShell from '../components/ui/PageShell';
import SectionCard from '../components/ui/SectionCard';
import { buildRegistryRenderPreview, compareRenderPreviewWithLayoutSnapshot } from '../registry/menu-render-preview';
import { runMenuParityCheck } from '../registry/menu-parity-checker';
import SNAPSHOT from '../registry/layout-menu-snapshot';

const SEVERITY_COLORS: Record<string, string> = {
  blocking: 'var(--danger)', warning: 'var(--warning)', info: 'var(--text-muted)',
};

const MAT_COLORS: Record<string, string> = {
  pass: 'var(--success)', fail: 'var(--danger)', warn: 'var(--warning)',
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

function renderTree(sections: ReturnType<typeof buildRegistryRenderPreview> | typeof SNAPSHOT, isRegistry: boolean) {
  return (
    <div style={{ fontSize: 12, fontFamily: 'monospace', lineHeight: 1.8 }}>
      {sections.map(sec => (
        <div key={sec.sectionId} style={{ marginBottom: 8 }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', padding: '4px 0' }}>
            {isRegistry ? (sec as any).labelKey : (sec as any).sectionLabelKey}
            {' '}
            <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: 10 }}>
              ({isRegistry ? (sec as any).sectionId : (sec as any).sectionId})
            </span>
          </div>
          {sec.items.map((item: any, idx: number) => (
            <div key={idx} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '2px 0 2px 16px', color: 'var(--text-secondary)',
            }}>
              <span style={{ color: 'var(--text-muted)', width: 12 }}>├</span>
              <Badge label={item.icon || '?'} color="var(--secondary)" />
              <span style={{ color: 'var(--text-primary)' }}>{isRegistry ? item.labelKey : item.labelKey}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{item.path}</span>
              {isRegistry && (
                <>
                  <Badge label={item.maturity} color={item.maturity === 'stable' ? 'var(--success)' : item.maturity === 'preview' ? 'var(--warning)' : item.maturity === 'lab' ? 'var(--secondary)' : '#8B5CF6'} />
                  {item.action && item.action !== 'KEEP' && (
                    <Badge label={item.action} color={item.action === 'MOVE_TO_LAB' ? 'var(--warning)' : item.action === 'MOVE_TO_CONNECTOR_CENTER' ? 'var(--secondary)' : 'var(--danger)'} />
                  )}
                  {item.futureTargetGroup && (
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      → {item.futureTargetGroup}
                    </span>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function RegistryRenderPreview() {
  const parity = useMemo(() => runMenuParityCheck(), []);
  const preview = useMemo(() => buildRegistryRenderPreview(), []);
  const comparison = useMemo(() => compareRenderPreviewWithLayoutSnapshot(), []);

  const governanceStats = useMemo(() => {
    // Count from parity checker's embedded GOVERNANCE data
    const previewData = buildRegistryRenderPreview();
    let moveToLab = 0, moveToConnector = 0, moveToGov = 0;
    let costRoutingAction = '';
    for (const sec of previewData) {
      for (const item of sec.items) {
        if (item.action === 'MOVE_TO_LAB') moveToLab++;
        if (item.action === 'MOVE_TO_CONNECTOR_CENTER') moveToConnector++;
        if (item.action === ('MOVE_TO_GOVERNANCE' as any)) moveToGov++;
        if (item.path === '/cost-routing') costRoutingAction = item.action || '';
      }
    }
    return { moveToLab, moveToConnector, moveToGov, costRoutingAction };
  }, []);

  return (
    <PageShell
      title="Registry 渲染预览"
      subtitle="AIP v7.14.0-P4 Registry Render Preview / Stage B"
      versionLabel="AIP v7.14.0-P4"
      maturity="preview"
      safetyBoundary="readonly"
      safetyText="只读预览 · 不接管 Layout · 不改变左侧菜单 · 不移动/隐藏/删除菜单 · 不写数据库 · 不启用 feature flag"
    >
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10, marginBottom: 20 }}>
        {[
          ['Layout Sections', String(comparison.snapshotSectionCount), 'var(--primary)'],
          ['Layout Items', String(comparison.snapshotItemCount), 'var(--primary)'],
          ['Registry Sections', String(parity.registrySectionCount), 'var(--secondary)'],
          ['Registry Items', String(parity.registryItemCount), 'var(--secondary)'],
          ['Preview Sections', String(comparison.sectionCount), 'var(--primary)'],
          ['Preview Items', String(comparison.itemCount), 'var(--primary)'],
          ['Overall', parity.overallStatus.toUpperCase(),
            parity.overallStatus === 'pass' ? 'var(--success)' : parity.overallStatus === 'warning' ? 'var(--warning)' : 'var(--danger)'],
          ['Blocking', String(parity.blockingCount), parity.blockingCount > 0 ? 'var(--danger)' : 'var(--success)'],
          ['Warning', String(parity.warningCount), parity.warningCount > 0 ? 'var(--warning)' : 'var(--success)'],
          ['Path Match', `${comparison.pathMatchCount}/${comparison.pathMatchCount + comparison.pathMismatchCount}`, 'var(--success)'],
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

      {/* Current Layout Snapshot Tree */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <SectionCard title="当前 Layout Snapshot">
          {renderTree(SNAPSHOT, false)}
        </SectionCard>

        <SectionCard title="Registry Render Preview">
          {renderTree(preview as any, true)}
        </SectionCard>
      </div>

      {/* Diff / Mismatch Table */}
      <SectionCard title="Mismatch / Diff 详情" style={{ marginBottom: 20 }}>
        {parity.mismatches.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={thStyle}>Severity</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Section</th>
                  <th style={thStyle}>Path</th>
                  <th style={thStyle}>Layout</th>
                  <th style={thStyle}>Registry</th>
                  <th style={thStyle}>Message</th>
                </tr>
              </thead>
              <tbody>
                {parity.mismatches.map((m, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={tdStyle}><Badge label={m.severity} color={SEVERITY_COLORS[m.severity]} /></td>
                    <td style={tdStyle}>{m.type}</td>
                    <td style={tdStyle}>{m.section || '—'}</td>
                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 10 }}>{m.path || '—'}</td>
                    <td style={tdStyle}>{m.layoutValue || '—'}</td>
                    <td style={tdStyle}>{m.registryValue || '—'}</td>
                    <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: 10, maxWidth: 250 }}>{m.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: 16, textAlign: 'center', color: 'var(--success)', fontSize: 13 }}>
            ✅ 完全一致 — registry render preview matches current layout snapshot (0 blocking / 0 warning / 0 info)
          </div>
        )}
      </SectionCard>

      {/* Governance Metadata Notice */}
      <SectionCard title="治理元数据说明（不参与渲染）" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <p>以下治理数据仅作为注解展示，<strong>不参与本轮真实渲染</strong>：</p>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li>MOVE_TO_LAB = {governanceStats.moveToLab}（13）— 只是治理建议，不改变当前分组</li>
            <li>MOVE_TO_CONNECTOR_CENTER = {governanceStats.moveToConnector}（2）— 只是治理建议，不改变当前分组</li>
            <li>MOVE_TO_GOVERNANCE = {governanceStats.moveToGov}（应为 0）</li>
            <li>cost-routing action = {governanceStats.costRoutingAction || 'N/A'}（应为 KEEP），futureTargetGroup = governance</li>
            <li>futureTargetGroup 初期只作为提示，不作为真实分组</li>
            <li>hidden / disabled 初期不生效</li>
          </ul>
        </div>
      </SectionCard>

      {/* Next Stage Notice */}
      <SectionCard title="后续阶段说明">
        <div style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li><strong>当前：Stage B</strong> — Registry Render Preview（已就绪）</li>
            <li><strong>尚未开始：Stage C</strong> — Feature-flagged Layout Rendering</li>
            <li><strong>尚未开始：</strong>Menu Move Dry-Run</li>
            <li>所有真实菜单移动必须另开任务，经过 dry-run 和 feature flag</li>
          </ul>
        </div>
      </SectionCard>

      {/* Safety Boundary */}
      <div style={{ marginTop: 24, padding: '12px 16px', borderRadius: 6, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <strong>重要边界：</strong>
        Layout.tsx 仍是真实菜单来源。MENU_REGISTRY 仍未接管真实菜单。本页面是 registry render preview，不会改变左侧菜单，不会移动/隐藏/删除菜单，不会启用 feature flag，不会写数据库。
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
