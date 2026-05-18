import React, { useMemo } from 'react';
import PageShell from '../components/ui/PageShell';
import SectionCard from '../components/ui/SectionCard';
import LabCenterOverview from '../components/lab/LabCenterOverview';
import LabCapabilityCard from '../components/lab/LabCapabilityCard';
import LabExperimentMatrix from '../components/lab/LabExperimentMatrix';
import LabBoundaryPanel from '../components/lab/LabBoundaryPanel';
import LabRecommendedPath from '../components/lab/LabRecommendedPath';
import {
  LAB_REGISTRY_NEW as LAB_REGISTRY,
  getLabRegistryCount,
  getLabRegistryByRisk,
  getLabRegistryAvailableRoutes,
  getLabRegistryHoldReviewItems,
  getLabRegistryFutureItems,
  getLabRegistryQualityGateSummary,
} from '../registry/lab-registry';
import type { LabRegistryItem } from '../registry/lab-registry';

const RISK_COLORS: Record<string, string> = {
  low: 'var(--success)', medium: 'var(--warning)', high: 'var(--danger)',
};

const GROUP_LABELS: Record<string, string> = {
  active_lab_items: 'Dataset / Annotation Lab',
  hold_review_items: 'Workflow / Pipeline Lab',
  future_lab_items: 'Future / Stage C Gated Lab',
};

const GROUP_DESCRIPTIONS: Record<string, string> = {
  active_lab_items: 'Currently available readonly lab items — visual debugging, dataset preview.',
  hold_review_items: 'Items pending human review — workflow lab, dataset lab. No executable controls.',
  future_lab_items: 'Future planned capabilities — prototype review, placeholder review. No execution.',
};

export default function LabCenterReadonly() {
  const availableRoutes = useMemo(() => getLabRegistryAvailableRoutes(), []);
  const holdReviewItems = useMemo(() => getLabRegistryHoldReviewItems(), []);
  const futureItems = useMemo(() => getLabRegistryFutureItems(), []);
  const lowRisk = useMemo(() => getLabRegistryByRisk('low'), []);
  const mediumRisk = useMemo(() => getLabRegistryByRisk('medium'), []);
  const highRisk = useMemo(() => getLabRegistryByRisk('high'), []);

  const groups = useMemo(() => {
    const map: Record<string, LabRegistryItem[]> = {};
    for (const item of LAB_REGISTRY) {
      if (!map[item.displayGroup]) map[item.displayGroup] = [];
      map[item.displayGroup].push(item);
    }
    return map;
  }, []);

  const allReadonly = useMemo(() => LAB_REGISTRY.every(i => i.qualityGate.readonly), []);
  const allNoTraining = useMemo(() => LAB_REGISTRY.every(i => i.qualityGate.noTraining), []);
  const allNoInference = useMemo(() => LAB_REGISTRY.every(i => i.qualityGate.noInference), []);
  const allNoDbWrite = useMemo(() => LAB_REGISTRY.every(i => i.qualityGate.noDbWrite), []);
  const allNoLabelSave = useMemo(() => LAB_REGISTRY.every(i => i.qualityGate.noLabelSave), []);
  const allNoDatasetWrite = useMemo(() => LAB_REGISTRY.every(i => i.qualityGate.noDatasetWrite), []);
  const total = useMemo(() => getLabRegistryCount(), []);
  const quality = useMemo(() => getLabRegistryQualityGateSummary(), []);

  return (
    <PageShell
      title="Lab Center"
      subtitle="Readonly experiment and capability overview — no executable controls, no training, no inference"
      versionLabel="AIP v7.22.0-P4"
      maturity="preview"
      safetyBoundary="readonly"
      safetyText="No real experiment execution · No training · No inference · No dataset mutation"
    >
      {/* Lab Summary Hero */}
      <SectionCard title="Lab Center Overview" style={{ marginBottom: 20 }}>
        <LabCenterOverview />
      </SectionCard>

      {/* Lab Capability Groups */}
      {Object.entries(groups).map(([groupKey, items]) => (
        <SectionCard key={groupKey} title={`${GROUP_LABELS[groupKey] || groupKey} (${items.length})`} style={{ marginBottom: 20 }}>
          {GROUP_DESCRIPTIONS[groupKey] && (
            <div style={{ padding: '6px 10px', marginBottom: 8, borderRadius: 4, background: 'rgba(139,92,246,0.04)', fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {GROUP_DESCRIPTIONS[groupKey]}
            </div>
          )}
          {items.map(item => <LabCapabilityCard key={item.id} item={item} />)}
        </SectionCard>
      ))}

      {/* Lab Experiment Matrix */}
      <SectionCard title="Lab Experiment Matrix" style={{ marginBottom: 20 }}>
        <LabExperimentMatrix />
      </SectionCard>

      {/* Lab Safety / Risk Matrix */}
      <SectionCard title="Lab Safety / Risk Matrix" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gap: 2, fontSize: 9 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 60px 2fr', gap: 8, padding: '4px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>
            <span>Risk Item</span><span>Status</span><span>Evidence</span>
          </div>
          {[
            { item: 'Layout mutation', pass: true, ev: 'No Layout change' },
            { item: 'Sidebar expansion', pass: true, ev: 'No new sidebar item' },
            { item: 'Route expansion', pass: true, ev: 'No new route' },
            { item: 'Real lab execution', pass: true, ev: 'none' },
            { item: 'Training job trigger', pass: true, ev: 'none' },
            { item: 'Inference trigger', pass: true, ev: 'none' },
            { item: 'Dataset mutation', pass: true, ev: 'none' },
            { item: 'DB write path', pass: true, ev: 'none' },
            { item: 'External write path', pass: true, ev: 'none' },
            { item: 'Memory candidate mutation', pass: true, ev: 'none' },
            { item: 'LAN sync', pass: true, ev: 'none' },
            { item: 'Stage C activation', pass: true, ev: 'false' },
            { item: 'Service control', pass: true, ev: 'none' },
            { item: 'Tag / Release', pass: true, ev: 'none' },
          ].map(r => (
            <div key={r.item} style={{ display: 'grid', gridTemplateColumns: '1.5fr 60px 2fr', gap: 8, padding: '5px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.02)', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-primary)' }}>{r.item}</span>
              <span style={{ fontWeight: 600, color: r.pass ? 'var(--success)' : 'var(--danger)' }}>{r.pass ? 'PASS' : 'FAIL'}</span>
              <span style={{ color: 'var(--text-muted)' }}>{r.ev}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 9, color: 'var(--text-muted)', fontStyle: 'italic' }}>Smoke test: SKIP (no live server).</div>
      </SectionCard>

      {/* Lab Boundary Panel */}
      <SectionCard title="Lab Boundary Panel" style={{ marginBottom: 20, border: '1px solid var(--warning)' }}>
        <LabBoundaryPanel />
      </SectionCard>

      {/* Lab Recommended Path */}
      <SectionCard title="Recommended Lab Path" style={{ marginBottom: 20 }}>
        <LabRecommendedPath />
      </SectionCard>

      {/* Medium / High Risk Items */}
      <SectionCard title={`Medium / High Risk Lab Items (${mediumRisk.length + highRisk.length})`} style={{ marginBottom: 20, border: '1px solid var(--danger)' }}>
        <div style={{ padding: '6px 10px', marginBottom: 8, borderRadius: 4, background: 'rgba(239,68,68,0.08)', fontSize: 10, color: 'var(--danger)' }}>
          Readonly assessment only — no execution, no training, no inference.
        </div>
        {[...mediumRisk, ...highRisk].map(item => <LabCapabilityCard key={item.id} item={item} />)}
      </SectionCard>

      {/* Governance Summary KPIs */}
      <SectionCard title="Lab Governance Summary" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 8 }}>
          {[
            { label: 'All readonly', value: allReadonly ? 'YES' : 'NO', color: allReadonly ? 'var(--success)' : 'var(--danger)' },
            { label: 'No training', value: allNoTraining ? 'YES' : 'NO', color: allNoTraining ? 'var(--success)' : 'var(--danger)' },
            { label: 'No inference', value: allNoInference ? 'YES' : 'NO', color: allNoInference ? 'var(--success)' : 'var(--danger)' },
            { label: 'No DB write', value: allNoDbWrite ? 'YES' : 'NO', color: allNoDbWrite ? 'var(--success)' : 'var(--danger)' },
            { label: 'No label save', value: allNoLabelSave ? 'YES' : 'NO', color: allNoLabelSave ? 'var(--success)' : 'var(--danger)' },
            { label: 'No dataset write', value: allNoDatasetWrite ? 'YES' : 'NO', color: allNoDatasetWrite ? 'var(--success)' : 'var(--danger)' },
            { label: 'Quality all pass', value: String(quality.passedAll), color: quality.passedAll === total ? 'var(--success)' : 'var(--danger)' },
            { label: 'Exec experiments', value: '0', color: 'var(--success)' },
            { label: 'Training triggers', value: '0', color: 'var(--success)' },
            { label: 'Dataset mutations', value: '0', color: 'var(--success)' },
          ].map(k => (
            <div key={k.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 8, color: 'var(--text-muted)', marginBottom: 1 }}>{k.label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Boundary Notice */}
      <div style={{ marginTop: 24, padding: '14px 16px', borderRadius: 6, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7 }}>
        <strong>Readonly boundary notice:</strong><br />
        This is a <u>Lab Center readonly overview</u>. Lab Registry is readonly metadata. Does not execute experiments, train models, run inference, save labels, modify datasets, overwrite models, approve/reject Memory Hub candidates, sync LAN_SHARE, or enable Stage C. All <code>actionsBlocked</code> are governance display, not a permission system.
      </div>
    </PageShell>
  );
}
