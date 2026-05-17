import React, { useMemo } from 'react';
import PageShell from '../components/ui/PageShell';
import SectionCard from '../components/ui/SectionCard';
import {
  LAB_REGISTRY_NEW as LAB_REGISTRY,
  getLabRegistryCount,
  getLabRegistryByRisk,
  getLabRegistryAvailableRoutes,
  getLabRegistryHoldReviewItems,
  getLabRegistryFutureItems,
} from '../registry/lab-registry';
import type { LabRegistryItem, LabRiskLevel } from '../registry/lab-registry';

const RISK_COLORS: Record<LabRiskLevel, string> = {
  low: 'var(--success)',
  medium: 'var(--warning)',
  high: 'var(--danger)',
};

function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11,
      fontWeight: 600, color: '#fff', background: color || '#6B7280',
      lineHeight: '16px', whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

function KpiCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
      <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function LabCard({ item }: { item: LabRegistryItem }) {
  const isHighRisk = item.riskLevel === 'high';
  const isMediumRisk = item.riskLevel === 'medium';
  const isHoldReview = item.status === 'hold_review';
  const isFuture = item.status === 'future';
  return (
    <div style={{
      padding: 12, borderRadius: 8, background: 'var(--bg-surface)',
      border: `1px solid ${isHighRisk ? 'var(--danger)' : isMediumRisk ? 'var(--warning)' : 'var(--border)'}`,
      borderLeft: `3px solid ${RISK_COLORS[item.riskLevel]}`,
      fontSize: 11, marginBottom: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{item.name}</span>
        <Badge label={item.type} color="#6B7280" />
        <Badge label={item.status} color={item.status === 'available_route' ? 'var(--success)' : item.status === 'hold_review' ? 'var(--warning)' : '#6B7280'} />
        <Badge label={item.maturity} color="#6B7280" />
        <Badge label={item.riskLevel} color={RISK_COLORS[item.riskLevel]} />
        {(isHighRisk || isMediumRisk) && <Badge label="仅可只读评估，不允许直接执行" color="var(--danger)" />}
        {isHoldReview && <Badge label="等待人工复核" color="var(--warning)" />}
        {isFuture && <Badge label="未来规划" color="#6B7280" />}
      </div>

      <div style={{ marginBottom: 4 }}>
        <span style={{ color: 'var(--text-muted)', marginRight: 4 }}>能力:</span>
        {item.capabilities.map((c, i) => <Badge key={i} label={c} color="var(--secondary)" />)}
      </div>

      <div style={{ marginBottom: 4, color: 'var(--text-secondary)' }}>
        {item.currentRoute ? (
          <span>当前路由: <a href={item.currentRoute} style={{ color: 'var(--secondary)' }} onClick={e => { e.preventDefault(); }}>{item.currentRoute}</a></span>
        ) : (
          <span>当前路由: 未接入</span>
        )}
        {item.futureRoute && <span style={{ marginLeft: 8 }}>未来规划: {item.futureRoute}</span>}
      </div>

      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 4 }}>
        {item.safetyBoundary.map(s => <Badge key={s} label={s} color="#6B7280" />)}
      </div>

      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 4 }}>
        <span style={{ color: 'var(--text-muted)' }}>允许: </span>
        {item.actionsAllowed.map(a => <Badge key={a} label={a} color="var(--success)" />)}
        <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>禁止: </span>
        {item.actionsBlocked.map(a => <Badge key={a} label={a} color="var(--danger)" />)}
      </div>

      <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{item.notes}</div>
    </div>
  );
}

export default function LabCenterReadonly() {
  const availableRoutes = useMemo(() => getLabRegistryAvailableRoutes(), []);
  const holdReviewItems = useMemo(() => getLabRegistryHoldReviewItems(), []);
  const futureItems = useMemo(() => getLabRegistryFutureItems(), []);
  const lowRisk = useMemo(() => getLabRegistryByRisk('low'), []);
  const mediumRisk = useMemo(() => getLabRegistryByRisk('medium'), []);
  const highRisk = useMemo(() => getLabRegistryByRisk('high'), []);
  const total = useMemo(() => getLabRegistryCount(), []);

  return (
    <PageShell
      title="实验室中心"
      subtitle="只读查看 AIP 实验页、视觉调试、原型模块与本地 Lab 工具的状态和安全边界。"
      versionLabel="AIP v7.17.0-P3"
      maturity="preview"
      safetyBoundary="readonly"
      safetyText="只读预览 · 不写入数据集 · 不运行训练/推理 · 不保存 label"
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 20 }}>
        <KpiCard label="Lab 总数" value={String(total)} color="var(--primary)" />
        <KpiCard label="可用路由" value={String(availableRoutes.length)} color="var(--success)" />
        <KpiCard label="待复核" value={String(holdReviewItems.length)} color="var(--warning)" />
        <KpiCard label="未来" value={String(futureItems.length)} color="#6B7280" />
        <KpiCard label="低风险" value={String(lowRisk.length)} color="var(--success)" />
        <KpiCard label="中/高风险" value={String(mediumRisk.length + highRisk.length)} color="var(--danger)" />
      </div>

      <SectionCard title={`Active / Available Lab Items（${availableRoutes.length}）`} style={{ marginBottom: 20 }}>
        {availableRoutes.length > 0
          ? availableRoutes.map(item => <LabCard key={item.id} item={item} />)
          : <div style={{ padding: 12, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>暂无可用 Lab 路由</div>}
      </SectionCard>

      <SectionCard title={`Hold Review（${holdReviewItems.length}）`} style={{ marginBottom: 20 }}>
        <div style={{ padding: '6px 10px', marginBottom: 8, borderRadius: 4, background: 'rgba(245,158,11,0.08)', fontSize: 10, color: 'var(--warning)' }}>
          以下 Lab 项目等待人工复核边界。当前仅做展示。
        </div>
        {holdReviewItems.map(item => <LabCard key={item.id} item={item} />)}
      </SectionCard>

      <SectionCard title={`Future Lab Items（${futureItems.length}）`} style={{ marginBottom: 20 }}>
        {futureItems.map(item => <LabCard key={item.id} item={item} />)}
      </SectionCard>

      <SectionCard title={`Medium / High Risk Lab Items（${mediumRisk.length + highRisk.length}）`} style={{ marginBottom: 20, border: '1px solid var(--danger)' }}>
        <div style={{ padding: '6px 10px', marginBottom: 8, borderRadius: 4, background: 'rgba(239,68,68,0.08)', fontSize: 10, color: 'var(--danger)' }}>
          以下 Lab 项目具有中等或高风险。仅可只读评估，不允许直接执行。
        </div>
        {[...mediumRisk, ...highRisk].map(item => <LabCard key={item.id} item={item} />)}
      </SectionCard>

      <div style={{ marginTop: 24, padding: '14px 16px', borderRadius: 6, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7 }}>
        <strong>只读边界声明：</strong><br />
        本页面是<u>Lab Center 只读展示页面</u>。Lab Registry 是<u>只读元数据</u>。
        本页面不运行训练、不执行推理、不保存 label、不修改数据集、不覆盖模型、不启用 Stage C。
        actionsBlocked 列表为治理展示，不是权限系统。页面不会执行这些动作。
      </div>
    </PageShell>
  );
}
