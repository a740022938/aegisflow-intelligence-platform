// Menu render preview — builds a preview tree from MENU_REGISTRY
// Used ONLY for Stage B preview. NOT used for Layout rendering.

import SNAPSHOT from './layout-menu-snapshot';
import { MENU_REGISTRY } from './menu-registry';
import { runMenuParityCheck } from './menu-parity-checker';
import type { MenuRegistryItem } from './menu-registry';
import type { MismatchSeverity } from './menu-parity-checker';

// ── Governance decision data (mirrored from menu-parity-checker) ──
type GovernanceAction = 'KEEP' | 'RENAME' | 'MERGE' | 'MOVE_TO_LAB' | 'MOVE_TO_CONNECTOR_CENTER' | 'HIDE' | 'ARCHIVE_CANDIDATE';

interface GovernanceDecision {
  action: GovernanceAction;
  futureTargetGroup?: string;
}

const GOVERNANCE: Record<string, GovernanceDecision> = {
  dashboard: { action: 'KEEP' },
  'factory-status': { action: 'KEEP' },
  'assistant-center': { action: 'KEEP' },
  datasets: { action: 'KEEP' },
  training: { action: 'KEEP' },
  runs: { action: 'KEEP' },
  templates: { action: 'KEEP' },
  models: { action: 'KEEP' },
  artifacts: { action: 'KEEP' },
  evaluations: { action: 'KEEP' },
  deployments: { action: 'KEEP' },
  'workflow-jobs': { action: 'KEEP' },
  'workflow-composer': { action: 'KEEP' },
  'workflow-canvas': { action: 'KEEP' },
  'module-center': { action: 'KEEP' },
  'plugin-pool': { action: 'KEEP' },
  tasks: { action: 'KEEP' },
  'cost-routing': { action: 'KEEP', futureTargetGroup: 'governance' },
  'openaxiom-readonly': { action: 'MOVE_TO_CONNECTOR_CENTER', futureTargetGroup: 'connector' },
  'memory-hub-readonly': { action: 'MOVE_TO_CONNECTOR_CENTER', futureTargetGroup: 'connector' },
  'digital-employee': { action: 'MOVE_TO_LAB', futureTargetGroup: 'lab' },
  'training-v2': { action: 'MOVE_TO_LAB', futureTargetGroup: 'lab' },
  hpo: { action: 'MOVE_TO_LAB', futureTargetGroup: 'lab' },
  distill: { action: 'MOVE_TO_LAB', futureTargetGroup: 'lab' },
  'model-merge': { action: 'MOVE_TO_LAB', futureTargetGroup: 'lab' },
  inference: { action: 'MOVE_TO_LAB', futureTargetGroup: 'lab' },
  annotation: { action: 'MOVE_TO_LAB', futureTargetGroup: 'lab' },
  huggingface: { action: 'MOVE_TO_LAB', futureTargetGroup: 'lab' },
  'backflow-v2': { action: 'MOVE_TO_LAB', futureTargetGroup: 'lab' },
  scheduler: { action: 'MOVE_TO_LAB', futureTargetGroup: 'lab' },
  alerting: { action: 'MOVE_TO_LAB', futureTargetGroup: 'lab' },
  'model-monitor': { action: 'MOVE_TO_LAB', futureTargetGroup: 'lab' },
  'deploy-v2': { action: 'MOVE_TO_LAB', futureTargetGroup: 'lab' },
  'mahjong-debug': { action: 'KEEP' },
  approvals: { action: 'KEEP' },
  'governance-hub': { action: 'KEEP' },
  audit: { action: 'KEEP' },
  feedback: { action: 'KEEP' },
  'knowledge-center': { action: 'KEEP' },
  'standard-output': { action: 'KEEP' },
};

// ── Types ──

export interface RenderPreviewItem {
  path: string;
  labelKey: string;
  icon: string;
  maturity: string;
  riskLevel: string;
  pageType: string;
  action?: GovernanceAction;
  futureTargetGroup?: string;
  snapshotMatch: boolean;
}

export interface RenderPreviewSection {
  sectionId: string;
  labelKey: string;
  collapsedByDefault?: boolean;
  items: RenderPreviewItem[];
}

export interface RenderPreviewSummary {
  sectionCount: number;
  itemCount: number;
  snapshotSectionCount: number;
  snapshotItemCount: number;
  pathMatchCount: number;
  pathMismatchCount: number;
  iconMatchCount: number;
  iconMismatchCount: number;
  labelKeyMatchCount: number;
  labelKeyMismatchCount: number;
}

// ── Build render preview tree from MENU_REGISTRY ──

export function buildRegistryRenderPreview(): RenderPreviewSection[] {
  return MENU_REGISTRY.map(section => ({
    sectionId: section.id,
    labelKey: section.labelKey || section.label,
    collapsedByDefault: section.collapsedByDefault,
    items: section.items.map(item => {
      const g = GOVERNANCE[item.id];
      const snapItem = findSnapshotItem(item.path);
      return {
        path: item.path,
        labelKey: item.labelKey || item.label,
        icon: item.icon || '',
        maturity: item.maturity,
        riskLevel: item.riskLevel,
        pageType: item.pageType,
        action: g?.action,
        futureTargetGroup: g?.futureTargetGroup,
        snapshotMatch: snapItem !== null,
      };
    }),
  }));
}

function findSnapshotItem(path: string) {
  for (const s of SNAPSHOT) {
    for (const i of s.items) {
      if (i.path === path) return i;
    }
  }
  return null;
}

// ── Compare render preview with Layout snapshot ──

export function compareRenderPreviewWithLayoutSnapshot(): RenderPreviewSummary {
  const preview = buildRegistryRenderPreview();
  let pathMatch = 0;
  let pathMismatch = 0;
  let iconMatch = 0;
  let iconMismatch = 0;
  let labelKeyMatch = 0;
  let labelKeyMismatch = 0;

  for (const sec of preview) {
    const snapSec = SNAPSHOT.find(s => s.sectionId === sec.sectionId);
    if (!snapSec) continue;
    for (let i = 0; i < Math.min(sec.items.length, snapSec.items.length); i++) {
      const pi = sec.items[i];
      const si = snapSec.items[i];

      if (pi.path === si.path) pathMatch++; else pathMismatch++;
      if (pi.icon === si.icon) iconMatch++; else iconMismatch++;
      if (pi.labelKey === si.labelKey) labelKeyMatch++; else labelKeyMismatch++;
    }
  }

  return {
    sectionCount: preview.length,
    itemCount: preview.reduce((s, sec) => s + sec.items.length, 0),
    snapshotSectionCount: SNAPSHOT.length,
    snapshotItemCount: SNAPSHOT.reduce((s, sec) => s + sec.items.length, 0),
    pathMatchCount: pathMatch,
    pathMismatchCount: pathMismatch,
    iconMatchCount: iconMatch,
    iconMismatchCount: iconMismatch,
    labelKeyMatchCount: labelKeyMatch,
    labelKeyMismatchCount: labelKeyMismatch,
  };
}

export function getRegistryRenderPreviewSummary(): string {
  const parity = runMenuParityCheck();
  const preview = buildRegistryRenderPreview();
  const comparison = compareRenderPreviewWithLayoutSnapshot();
  return [
    `=== Registry Render Preview Summary ===`,
    `Layout snapshot: ${comparison.snapshotSectionCount}s / ${comparison.snapshotItemCount}i`,
    `MENU_REGISTRY: ${parity.registrySectionCount}s / ${parity.registryItemCount}i`,
    `Render preview: ${comparison.sectionCount}s / ${comparison.itemCount}i`,
    `Parity overall: ${parity.overallStatus}`,
    `  Blocking: ${parity.blockingCount}  Warning: ${parity.warningCount}  Info: ${parity.infoCount}`,
    `Comparison:`,
    `  Path match: ${comparison.pathMatchCount}  Path mismatch: ${comparison.pathMismatchCount}`,
    `  Icon match: ${comparison.iconMatchCount}  Icon mismatch: ${comparison.iconMismatchCount}`,
    `  labelKey match: ${comparison.labelKeyMatchCount}  labelKey mismatch: ${comparison.labelKeyMismatchCount}`,
    `Governance:`,
    `  MOVE_TO_LAB: ${Object.values(GOVERNANCE).filter(g => g.action === 'MOVE_TO_LAB').length}`,
    `  MOVE_TO_CONNECTOR_CENTER: ${Object.values(GOVERNANCE).filter(g => g.action === 'MOVE_TO_CONNECTOR_CENTER').length}`,
    `  MOVE_TO_GOVERNANCE: ${Object.values(GOVERNANCE).filter(g => g.action === ('MOVE_TO_GOVERNANCE' as any)).length}`,
    `  cost-routing: ${GOVERNANCE['cost-routing']?.action}`,
  ].join('\n');
}
