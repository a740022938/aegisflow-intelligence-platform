// Menu parity checker — compares Layout snapshot against MENU_REGISTRY
// NOT used for rendering. Layout.tsx remains the source of truth.

import SNAPSHOT, { getLayoutSnapshotPaths, getLayoutSnapshotLabelKeys } from './layout-menu-snapshot';
import { MENU_REGISTRY } from './menu-registry';
import type { MenuRegistryItem } from './menu-registry';

// ── Governance decision types (mirrored from P1g/P1h) ──
type GovernanceAction = 'KEEP' | 'RENAME' | 'MERGE' | 'MOVE_TO_LAB' | 'MOVE_TO_CONNECTOR_CENTER' | 'HIDE' | 'ARCHIVE_CANDIDATE';

interface GovernanceDecision {
  action: GovernanceAction;
  futureTargetGroup?: string;
}

const ALLOWED_ACTIONS: GovernanceAction[] = ['KEEP', 'RENAME', 'MERGE', 'MOVE_TO_LAB', 'MOVE_TO_CONNECTOR_CENTER', 'HIDE', 'ARCHIVE_CANDIDATE'];

// Governance decisions from P1g-normalize
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
  'connector-center-readonly': { action: 'KEEP' },
  'advanced-mode-readonly': { action: 'KEEP' },
  'openaip-v8-command-center-preview': { action: 'KEEP' },
  'openaip-v8-agent-center-preview': { action: 'KEEP' },
  'openaip-v8-task-center-preview': { action: 'KEEP' },
  'openaip-v8-audit-center-preview': { action: 'KEEP' },
  'openaip-v8-policy-capability-center-preview': { action: 'KEEP' },
  'openaip-v8-execution-gateway-preview': { action: 'KEEP' },
  'openaip-v8-provider-manager-preview': { action: 'KEEP' },
  'openaip-v8-integration-center-preview': { action: 'KEEP' },
  'openaip-v8-local-apps-center-preview': { action: 'KEEP' },
  'openaip-v8-memory-knowledge-center-preview': { action: 'KEEP' },
};

// ── Types ──

export type MismatchSeverity = 'blocking' | 'warning' | 'info';

export interface MenuParityMismatch {
  severity: MismatchSeverity;
  type: string;
  section?: string;
  path?: string;
  field?: string;
  layoutValue?: string;
  registryValue?: string;
  message: string;
}

export interface MenuParityResult {
  overallStatus: 'pass' | 'warning' | 'fail';
  snapshotSectionCount: number;
  snapshotItemCount: number;
  registrySectionCount: number;
  registryItemCount: number;
  blockingCount: number;
  warningCount: number;
  infoCount: number;
  mismatches: MenuParityMismatch[];
  governanceChecks: {
    moveToGovernanceCount: number;
    costRoutingAction: string;
    totalDecisions: number;
  };
}

// ── Helper: find registry item by path ──

function findRegistryItem(path: string): { sectionIndex: number; item: MenuRegistryItem } | null {
  for (let si = 0; si < MENU_REGISTRY.length; si++) {
    for (const item of MENU_REGISTRY[si].items) {
      if (item.path === path) return { sectionIndex: si, item };
    }
  }
  return null;
}

function allRegistryPaths(): string[] {
  return MENU_REGISTRY.flatMap(s => s.items.map(i => i.path));
}

function allRegistryLabelKeys(): string[] {
  return MENU_REGISTRY.flatMap(s => s.items.map(i => i.labelKey || ''));
}

// ── Main parity check ──

export function runMenuParityCheck(): MenuParityResult {
  const mismatches: MenuParityMismatch[] = [];
  const snapshotPaths = getLayoutSnapshotPaths();
  const registryPaths = allRegistryPaths();

  // Section count
  if (SNAPSHOT.length !== MENU_REGISTRY.length) {
    mismatches.push({
      severity: 'blocking',
      type: 'section_count',
      message: `Section count: snapshot=${SNAPSHOT.length}, registry=${MENU_REGISTRY.length}`,
    });
  }

  // Item count
  const snapshotItems = SNAPSHOT.reduce((s, sec) => s + sec.items.length, 0);
  const registryItems = MENU_REGISTRY.reduce((s, sec) => s + sec.items.length, 0);
  if (snapshotItems !== registryItems) {
    mismatches.push({
      severity: 'blocking',
      type: 'item_count',
      message: `Item count: snapshot=${snapshotItems}, registry=${registryItems}`,
    });
  }

  // Section order
  for (let i = 0; i < Math.min(SNAPSHOT.length, MENU_REGISTRY.length); i++) {
    if (SNAPSHOT[i].sectionId !== MENU_REGISTRY[i].id) {
      mismatches.push({
        severity: 'warning',
        type: 'section_order',
        section: SNAPSHOT[i].sectionId,
        field: 'sectionId',
        layoutValue: SNAPSHOT[i].sectionId,
        registryValue: MENU_REGISTRY[i].id,
        message: `Section at index ${i}: snapshot="${SNAPSHOT[i].sectionId}", registry="${MENU_REGISTRY[i].id}"`,
      });
    }
  }

  // Section labelKey
  for (let i = 0; i < Math.min(SNAPSHOT.length, MENU_REGISTRY.length); i++) {
    const snapKey = SNAPSHOT[i].sectionLabelKey;
    const regKey = MENU_REGISTRY[i].labelKey || '';
    if (snapKey !== regKey) {
      mismatches.push({
        severity: 'warning',
        type: 'section_labelKey',
        section: SNAPSHOT[i].sectionId,
        field: 'labelKey',
        layoutValue: snapKey,
        registryValue: regKey,
        message: `Section "${SNAPSHOT[i].sectionId}" labelKey: snapshot="${snapKey}", registry="${regKey}"`,
      });
    }
  }

  // Per-item parity — iterate snapshot order
  for (let si = 0; si < SNAPSHOT.length; si++) {
    const snapSection = SNAPSHOT[si];
    for (let ii = 0; ii < snapSection.items.length; ii++) {
      const snapItem = snapSection.items[ii];
      const regFound = findRegistryItem(snapItem.path);

      // Missing from registry
      if (!regFound) {
        mismatches.push({
          severity: 'blocking',
          type: 'missing_registry_item',
          section: snapSection.sectionId,
          path: snapItem.path,
          message: `Path "${snapItem.path}" exists in Layout but not in MENU_REGISTRY`,
        });
        continue;
      }

      const regItem = regFound.item;

      // Item order within section
      const regSection = MENU_REGISTRY[si];
      if (regSection && regSection.items[ii] && regSection.items[ii].path !== snapItem.path) {
        mismatches.push({
          severity: 'warning',
          type: 'item_order',
          section: snapSection.sectionId,
          path: snapItem.path,
          layoutValue: `index ${ii}`,
          registryValue: `path ${regSection.items[ii]?.path}`,
          message: `Item order differs in section "${snapSection.sectionId}" at index ${ii}`,
        });
      }

      // Path
      if (regItem.path !== snapItem.path) {
        mismatches.push({
          severity: 'blocking',
          type: 'path_mismatch',
          section: snapSection.sectionId,
          path: snapItem.path,
          layoutValue: snapItem.path,
          registryValue: regItem.path,
          message: `Path mismatch for "${snapItem.path}"`,
        });
      }

      // Icon
      if ((regItem.icon || '') !== snapItem.icon) {
        mismatches.push({
          severity: 'warning',
          type: 'icon_mismatch',
          section: snapSection.sectionId,
          path: snapItem.path,
          field: 'icon',
          layoutValue: snapItem.icon,
          registryValue: regItem.icon || '',
          message: `Icon: snapshot="${snapItem.icon}", registry="${regItem.icon || ''}"`,
        });
      }

      // labelKey
      if ((regItem.labelKey || '') !== snapItem.labelKey) {
        mismatches.push({
          severity: 'warning',
          type: 'labelKey_mismatch',
          section: snapSection.sectionId,
          path: snapItem.path,
          field: 'labelKey',
          layoutValue: snapItem.labelKey,
          registryValue: regItem.labelKey || '',
          message: `labelKey: snapshot="${snapItem.labelKey}", registry="${regItem.labelKey || ''}"`,
        });
      }
    }
  }

  // Extra items in registry (not in snapshot)
  for (const rp of registryPaths) {
    if (!snapshotPaths.includes(rp)) {
      mismatches.push({
        severity: 'blocking',
        type: 'extra_registry_item',
        path: rp,
        message: `Path "${rp}" exists in MENU_REGISTRY but not in Layout snapshot`,
      });
    }
  }

  // Duplicate paths
  const snapPathSet = new Set(snapshotPaths);
  if (snapPathSet.size !== snapshotPaths.length) {
    mismatches.push({
      severity: 'warning',
      type: 'duplicate_path',
      message: `Layout snapshot has ${snapshotPaths.length - snapPathSet.size} duplicate paths`,
    });
  }
  const regPathSet = new Set(registryPaths);
  if (regPathSet.size !== registryPaths.length) {
    mismatches.push({
      severity: 'warning',
      type: 'duplicate_path',
      message: `MENU_REGISTRY has ${registryPaths.length - regPathSet.size} duplicate paths`,
    });
  }

  // Duplicate labelKeys
  const snapLabelKeys = getLayoutSnapshotLabelKeys();
  const snapLabelSet = new Set(snapLabelKeys);
  if (snapLabelSet.size !== snapLabelKeys.length) {
    mismatches.push({
      severity: 'info',
      type: 'duplicate_labelKey',
      message: `Layout snapshot has ${snapLabelKeys.length - snapLabelSet.size} duplicate labelKeys`,
    });
  }
  const regLabelKeys = allRegistryLabelKeys();
  const regLabelSet = new Set(regLabelKeys);
  if (regLabelSet.size !== regLabelKeys.length) {
    mismatches.push({
      severity: 'info',
      type: 'duplicate_labelKey',
      message: `MENU_REGISTRY has ${regLabelKeys.length - regLabelSet.size} duplicate labelKeys`,
    });
  }

  // ── Governance checks ──
  const registryIds = MENU_REGISTRY.flatMap(s => s.items.map(i => i.id));
  const governanceIds = Object.keys(GOVERNANCE);
  const missingGovernance = registryIds.filter(id => !GOVERNANCE[id]);
  const extraGovernance = governanceIds.filter(id => !registryIds.includes(id));
  if (missingGovernance.length > 0) {
    mismatches.push({
      severity: 'blocking',
      type: 'missing_governance',
      message: `Registry items without governance decision: ${missingGovernance.join(', ')}`,
    });
  }
  if (extraGovernance.length > 0) {
    mismatches.push({
      severity: 'info',
      type: 'extra_governance',
      message: `Governance decisions for non-registry items: ${extraGovernance.join(', ')}`,
    });
  }

  // All governance actions valid
  for (const [id, g] of Object.entries(GOVERNANCE)) {
    if (!ALLOWED_ACTIONS.includes(g.action)) {
      mismatches.push({
        severity: 'blocking',
        type: 'invalid_action',
        path: id,
        message: `Governance action "${g.action}" for "${id}" is not in allowed enum`,
      });
    }
  }

  const moveToGovernanceCount = governanceIds.filter(id => GOVERNANCE[id].action === ('MOVE_TO_GOVERNANCE' as any)).length;

  return {
    overallStatus: mismatches.some(m => m.severity === 'blocking') ? 'fail'
      : mismatches.some(m => m.severity === 'warning') ? 'warning' : 'pass',
    snapshotSectionCount: SNAPSHOT.length,
    snapshotItemCount: snapshotItems,
    registrySectionCount: MENU_REGISTRY.length,
    registryItemCount: registryItems,
    blockingCount: mismatches.filter(m => m.severity === 'blocking').length,
    warningCount: mismatches.filter(m => m.severity === 'warning').length,
    infoCount: mismatches.filter(m => m.severity === 'info').length,
    mismatches,
    governanceChecks: {
      moveToGovernanceCount,
      costRoutingAction: GOVERNANCE['cost-routing']?.action || 'MISSING',
      totalDecisions: governanceIds.length,
    },
  };
}

export function getMenuParitySummary(): string {
  const result = runMenuParityCheck();
  const lines = [
    `Parity: ${result.overallStatus.toUpperCase()}`,
    `  Snapshot: ${result.snapshotSectionCount}s / ${result.snapshotItemCount}i`,
    `  Registry: ${result.registrySectionCount}s / ${result.registryItemCount}i`,
    `  Blocking: ${result.blockingCount}  Warning: ${result.warningCount}  Info: ${result.infoCount}`,
    `  MOVE_TO_GOVERNANCE: ${result.governanceChecks.moveToGovernanceCount}`,
    `  cost-routing: ${result.governanceChecks.costRoutingAction}`,
  ];
  return lines.join('\n');
}

// Re-export snapshot helpers for convenience
export { getLayoutSnapshotSectionCount, getLayoutSnapshotItemCount, getLayoutSnapshotPaths } from './layout-menu-snapshot';
