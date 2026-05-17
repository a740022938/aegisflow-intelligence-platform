import React, { useMemo } from 'react';
import PageShell from '../components/ui/PageShell';
import SectionCard from '../components/ui/SectionCard';
import { LAB_REGISTRY, getLabStats } from '../registry/lab-registry';
import type { LabItemDefinition, LabStatus, LabRiskLevel, LabCategory, SafetyBoundaryTag } from '../registry/lab-registry';

const STATUS_COLORS: Record<LabStatus, string> = {
  active: 'var(--secondary)', preview: 'var(--warning)', placeholder: '#6B7280',
  needs_spec: 'var(--danger)', blocked: 'var(--warning)', deprecated: '#6B7280',
  archive_candidate: '#6B7280', promotion_candidate: 'var(--success)',
};

const RISK_COLORS: Record<LabRiskLevel, string> = {
  low: 'var(--success)', medium: 'var(--warning)', high: 'var(--danger)',
};

const CATEGORY_COLORS: Record<LabCategory, string> = {
  intelligence: 'var(--secondary)', automation: 'var(--warning)', experiment: '#8B5CF6', other: 'var(--text-muted)',
};

const TAG_COLORS: Record<SafetyBoundaryTag, string> = {
  readonly: 'var(--secondary)', dry_run: '#8B5CF6', approval_required: 'var(--warning)',
  external_write_blocked: 'var(--danger)', dangerous_action_blocked: 'var(--danger)',
};

const TAG_LABELS: Record<SafetyBoundaryTag, string> = {
  readonly: 'Read Only', dry_run: 'Dry Run', approval_required: '需确认',
  external_write_blocked: '禁止外部写入', dangerous_action_blocked: '禁止危险操作',
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
    <div style={{ display: 'flex', gap: 8, padding: '4px 0', fontSize: 12, borderBottom: '1px solid var(--border)' }}>
      <span style={{ width: 140, flexShrink: 0, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

function LabCard({ item }: { item: LabItemDefinition }) {
  const [expanded, setExpanded] = React.useState(false);
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{item.displayName}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            <Badge label={item.category} color={CATEGORY_COLORS[item.category]} /> {item.currentGroup} · {item.path}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <Badge label={item.status} color={STATUS_COLORS[item.status]} />
          <Badge label={item.maturity} color="var(--secondary)" />
          <Badge label={item.riskLevel} color={RISK_COLORS[item.riskLevel]} />
        </div>
      </div>

      <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 6 }}>{item.description}</div>

      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{item.reasonForLab}</div>

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
        {item.safetyBoundaryTags.map(tag => (
          <Badge key={tag} label={TAG_LABELS[tag]} color={TAG_COLORS[tag]} />
        ))}
      </div>

      <button type="button" onClick={() => setExpanded(!expanded)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--secondary)', padding: 0, fontFamily: 'inherit' }}>
        {expanded ? '收起详情 ▲' : '查看详情 ▼'}
      </button>

      {expanded && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
          <DetailRow label="labelKey" value={item.labelKey} />
          <DetailRow label="迁移阶段" value={`Stage ${item.migrationStage}`} />

          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginTop: 8, marginBottom: 4 }}>允许操作</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
            {item.actionPolicy.allowedActions.map(a => <Badge key={a} label={a} color="var(--success)" />)}
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>禁止操作</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
            {item.actionPolicy.forbiddenActions.map(a => <Badge key={a} label={a} color="var(--danger)" />)}
          </div>

          {item.promotionCriteria && (
            <>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)', marginBottom: 4 }}>晋级条件</div>
              <ul style={{ margin: '4px 0 8px', paddingLeft: 20, fontSize: 11, color: 'var(--text-secondary)' }}>
                {item.promotionCriteria.prerequisites.map((p, i) => <li key={i}>{p}</li>)}
                {item.promotionCriteria.estimatedMilestone && <li style={{ color: 'var(--text-muted)' }}>预计里程碑: {item.promotionCriteria.estimatedMilestone}</li>}
              </ul>
            </>
          )}

          {item.archiveCriteria && (
            <>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--danger)', marginBottom: 4 }}>归档条件</div>
              <ul style={{ margin: '4px 0 8px', paddingLeft: 20, fontSize: 11, color: 'var(--text-secondary)' }}>
                {item.archiveCriteria.triggers.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </>
          )}

          <DetailRow label="备注" value={item.notes} />
        </div>
      )}
    </div>
  );
}

export default function LabCenter() {
  const stats = useMemo(() => getLabStats(), []);
  const [filterCategory, setFilterCategory] = React.useState<string>('all');

  const filtered = useMemo(() => {
    if (filterCategory === 'all') return LAB_REGISTRY;
    return LAB_REGISTRY.filter(i => i.category === filterCategory);
  }, [filterCategory]);

  return (
    <PageShell
      title="实验室中心"
      subtitle="AIP v7.14.0-P3 Lab Center Readonly Shell"
      versionLabel="AIP v7.14.0-P3"
      maturity="preview"
      safetyBoundary="readonly"
      safetyText="只读壳子 · 不执行真实实验任务 · 不训练模型 · 不写数据库 · 不写外部项目 · 不修改 OpenAxiom label · 不处理 Memory Hub candidate · 不发 Release"
    >
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10, marginBottom: 20 }}>
        {[
          ['Total', String(stats.total), 'var(--primary)'],
          ['Intelligence', String(stats.byCategory['intelligence'] || 0), 'var(--secondary)'],
          ['Automation', String(stats.byCategory['automation'] || 0), 'var(--warning)'],
          ['Placeholder', String(stats.placeholderCount), '#6B7280'],
          ['High Risk', String(stats.highRiskCount), 'var(--danger)'],
          ['Needs Spec', String(stats.needsSpecCount), stats.needsSpecCount > 0 ? 'var(--danger)' : 'var(--success)'],
          ['Promotion', String(stats.promotionCount), stats.promotionCount > 0 ? 'var(--success)' : 'var(--text-muted)'],
          ['Archive', String(stats.archiveCount), stats.archiveCount > 0 ? 'var(--danger)' : 'var(--text-muted)'],
        ].map(([label, value, color]) => (
          <div key={String(label)} style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '12px 14px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>分类：</span>
        {['all', 'intelligence', 'automation'].map(cat => (
          <button key={cat} type="button" onClick={() => setFilterCategory(cat)}
            style={{
              padding: '4px 14px', borderRadius: 14, fontSize: 12, cursor: 'pointer',
              background: filterCategory === cat ? 'var(--secondary)' : 'var(--bg-surface)',
              color: filterCategory === cat ? '#fff' : 'var(--text-secondary)',
              border: '1px solid var(--border)', fontFamily: 'inherit',
            }}>
            {cat === 'all' ? '全部' : cat === 'intelligence' ? '智能增强' : '自动化'}
          </button>
        ))}
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>显示 {filtered.length} / {LAB_REGISTRY.length} 项</span>
      </div>

      {/* Lab Item Cards */}
      <SectionCard title="Lab 项目列表">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 12 }}>
          {filtered.map(item => <LabCard key={item.id} item={item} />)}
        </div>
      </SectionCard>

      {/* Migration Notice */}
      <SectionCard title="迁移状态说明" style={{ marginTop: 20 }}>
        <div style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <p><strong>当前状态：</strong>13 个 Lab 候选项仍保留原左侧菜单入口（智能增强 / 自动化）。本轮 Lab Center 是 <strong>duplicate readonly view</strong>，不移动任何菜单。</p>
          <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
            <li><strong>placholder ≠ 删除</strong> — 占位页仍可访问，只是未实现独立功能</li>
            <li><strong>archive_candidate ≠ 立即删除</strong> — 归档候选需要观察期和人工确认</li>
            <li>后续菜单移动必须经过 dry-run 和 feature flag</li>
            <li>不会自动隐藏或删除任何入口</li>
          </ul>
        </div>
      </SectionCard>

      {/* Safety Boundary Disclaimer */}
      <div style={{ marginTop: 24, padding: '12px 16px', borderRadius: 6, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <strong>安全边界：</strong>
        本页面为<u>只读壳子</u>，不执行真实实验任务，不训练模型，不写数据库，不写外部项目，不修改 OpenAxiom label，不处理 Memory Hub candidate，不发 Release。所有数据为静态 metadata，不做真实外部探测。
      </div>
    </PageShell>
  );
}
