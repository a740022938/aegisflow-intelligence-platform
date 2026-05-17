// Menu move dry-run — simulates future menu structure based on governance decisions
// NOT used for Layout rendering. Readonly simulation only.

import { MENU_REGISTRY } from './menu-registry';
import type { MenuRegistryItem } from './menu-registry';

// ── Governance decision data (mirrored from parity checker) ──
type GovernanceAction = 'KEEP' | 'RENAME' | 'MERGE' | 'MOVE_TO_LAB' | 'MOVE_TO_CONNECTOR_CENTER' | 'HIDE' | 'ARCHIVE_CANDIDATE';
const ALLOWED_ACTIONS: GovernanceAction[] = ['KEEP', 'RENAME', 'MERGE', 'MOVE_TO_LAB', 'MOVE_TO_CONNECTOR_CENTER', 'HIDE', 'ARCHIVE_CANDIDATE'];

interface GovernanceDecision { action: GovernanceAction; futureTargetGroup?: string; }

const GOVERNANCE: Record<string, GovernanceDecision> = {
  dashboard: { action: 'KEEP' }, 'factory-status': { action: 'KEEP' }, 'assistant-center': { action: 'KEEP' },
  datasets: { action: 'KEEP' }, training: { action: 'KEEP' }, runs: { action: 'KEEP' }, templates: { action: 'KEEP' },
  models: { action: 'KEEP' }, artifacts: { action: 'KEEP' }, evaluations: { action: 'KEEP' }, deployments: { action: 'KEEP' },
  'workflow-jobs': { action: 'KEEP' }, 'workflow-composer': { action: 'KEEP' }, 'workflow-canvas': { action: 'KEEP' },
  'module-center': { action: 'KEEP' }, 'plugin-pool': { action: 'KEEP' }, tasks: { action: 'KEEP' },
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
  approvals: { action: 'KEEP' }, 'governance-hub': { action: 'KEEP' }, audit: { action: 'KEEP' }, feedback: { action: 'KEEP' },
  'knowledge-center': { action: 'KEEP' }, 'standard-output': { action: 'KEEP' },
};

// ── Types ──

export interface MenuMoveDryRunItem {
  id: string;
  labelKey: string;
  path: string;
  icon: string;
  action: GovernanceAction;
  futureTargetGroup?: string;
  currentSection: string;
  simulatedSection: string;
  simulatedPath: string;
  isMoved: boolean;
  isNew: boolean;
  note: string;
}

export interface MenuMoveDryRunSection {
  sectionId: string;
  label: string;
  isCurrent: boolean;
  items: MenuMoveDryRunItem[];
}

export interface MenuMoveDryRunSummary {
  currentSections: number;
  currentItems: number;
  dryRunSections: number;
  dryRunVisibleItems: number;
  keepCount: number;
  moveToLabCount: number;
  moveToConnectorCount: number;
  hideCount: number;
  archiveCount: number;
  moveToGovernanceCount: number;
  costRoutingAction: string;
}

export interface MenuMoveDryRunValidation {
  pass: boolean;
  checks: Array<{ name: string; status: 'pass' | 'fail' | 'warn'; detail: string }>;
}

export interface MoveImpact {
  id: string;
  displayName: string;
  currentSection: string;
  currentPath: string;
  action: GovernanceAction;
  simulatedTargetSection: string;
  note: string;
  userImpact: string;
  rollback: string;
  riskLevel: 'low' | 'medium' | 'high';
}

// ── Build dry-run menu ──

export function buildMenuMoveDryRun(): { current: MenuMoveDryRunSection[]; simulated: MenuMoveDryRunSection[] } {
  const current: MenuMoveDryRunSection[] = [];
  const simulated: MenuMoveDryRunSection[] = [];
  const labItems: MenuMoveDryRunItem[] = [];
  const connectorItems: MenuMoveDryRunItem[] = [];
  const keepInCapabilities: MenuMoveDryRunItem[] = [];

  // Build current tree and classify items
  for (const section of MENU_REGISTRY) {
    const secItems: MenuMoveDryRunItem[] = [];
    for (const item of section.items) {
      const g = GOVERNANCE[item.id];
      const action = g?.action || 'KEEP';
      const drItem: MenuMoveDryRunItem = {
        id: item.id,
        labelKey: item.labelKey || item.label,
        path: item.path,
        icon: item.icon || '',
        action,
        futureTargetGroup: g?.futureTargetGroup,
        currentSection: section.label,
        simulatedSection: section.label,
        simulatedPath: item.path,
        isMoved: false,
        isNew: false,
        note: '',
      };

      // Classify by action
      if (action === 'MOVE_TO_LAB') {
        drItem.simulatedSection = '实验室中心';
        drItem.isMoved = true;
        drItem.note = '收编至 Lab Center';
        labItems.push(drItem);
      } else if (action === 'MOVE_TO_CONNECTOR_CENTER') {
        drItem.simulatedSection = '连接器中心';
        drItem.isMoved = true;
        drItem.note = '迁入 Connector Center';
        connectorItems.push(drItem);
      } else if (action === 'KEEP' && section.id === 'capabilities' && item.id === 'cost-routing') {
        drItem.note = '当前 KEEP，未来建议归入治理与回流';
        keepInCapabilities.push(drItem);
      }

      secItems.push(drItem);
    }
    if (secItems.length > 0) {
      current.push({ sectionId: section.id, label: section.label, isCurrent: true, items: secItems });
    }
  }

  // Build simulated tree: start with current, then reorganize
  // Copy all KEEP items to simulated, skipping sections that will be replaced
  const intelligenceAutomationIds = new Set(['intelligence', 'automation']);
  for (const section of MENU_REGISTRY) {
    if (intelligenceAutomationIds.has(section.id)) continue; // replaced by Lab

    const simItems: MenuMoveDryRunItem[] = [];
    for (const item of section.items) {
      const g = GOVERNANCE[item.id];
      const action = g?.action || 'KEEP';
      if (action === 'MOVE_TO_LAB' || action === 'MOVE_TO_CONNECTOR_CENTER') continue;

      simItems.push({
        id: item.id, labelKey: item.labelKey || item.label, path: item.path, icon: item.icon || '',
        action, futureTargetGroup: g?.futureTargetGroup,
        currentSection: section.label, simulatedSection: section.label, simulatedPath: item.path,
        isMoved: false, isNew: false,
        note: item.id === 'cost-routing' ? '当前 KEEP，未来建议归入治理与回流' : '',
      });
    }
    if (simItems.length > 0) {
      simulated.push({ sectionId: section.id, label: section.label, isCurrent: false, items: simItems });
    }
  }

  // Add Connector Center section (simulated)
  if (connectorItems.length > 0) {
    simulated.push({ sectionId: 'connector-center', label: '连接器中心', isCurrent: false, items: connectorItems });
  }

  // Add Lab Center section (simulated)
  if (labItems.length > 0) {
    simulated.push({ sectionId: 'lab-center', label: '实验室中心', isCurrent: false, items: labItems });
  }

  return { current, simulated };
}

export function getMenuMoveDryRunSummary(): MenuMoveDryRunSummary {
  const { current, simulated } = buildMenuMoveDryRun();
  let keep = 0, lab = 0, conn = 0, hide = 0, archive = 0, moveGov = 0;
  let crAction = '';

  for (const sec of current) {
    for (const item of sec.items) {
      if (item.action === 'KEEP') keep++;
      if (item.action === 'MOVE_TO_LAB') lab++;
      if (item.action === 'MOVE_TO_CONNECTOR_CENTER') conn++;
      if (item.action === 'HIDE') hide++;
      if (item.action === 'ARCHIVE_CANDIDATE') archive++;
      if (item.action === ('MOVE_TO_GOVERNANCE' as any)) moveGov++;
      if (item.id === 'cost-routing') crAction = item.action;
    }
  }

  const simVisible = simulated.reduce((s, sec) => s + sec.items.length, 0);
  const simSections = simulated.length;

  return {
    currentSections: current.length, currentItems: current.reduce((s, sec) => s + sec.items.length, 0),
    dryRunSections: simSections, dryRunVisibleItems: simVisible,
    keepCount: keep, moveToLabCount: lab, moveToConnectorCount: conn,
    hideCount: hide, archiveCount: archive, moveToGovernanceCount: moveGov, costRoutingAction: crAction,
  };
}

export function getMoveImpacts(): MoveImpact[] {
  const impacts: MoveImpact[] = [];
  for (const section of MENU_REGISTRY) {
    for (const item of section.items) {
      const g = GOVERNANCE[item.id];
      const action = g?.action || 'KEEP';
      if (action === 'KEEP') continue;
      impacts.push({
        id: item.id, displayName: item.label,
        currentSection: section.label, currentPath: item.path,
        action,
        simulatedTargetSection: g?.futureTargetGroup === 'connector' ? '连接器中心' : '实验室中心',
        note: g?.futureTargetGroup ? `归入${g.futureTargetGroup === 'connector' ? 'Connector' : 'Lab'} Center` : '',
        userImpact: '导航路径变化，原入口保留至 Stage 6',
        rollback: 'feature flag 关闭 / git revert',
        riskLevel: item.riskLevel === 'high' ? 'high' : 'medium',
      });
    }
  }
  return impacts;
}

export function validateMenuMoveDryRun(): MenuMoveDryRunValidation {
  const { current } = buildMenuMoveDryRun();
  const summary = getMenuMoveDryRunSummary();
  const checks: Array<{ name: string; status: 'pass' | 'fail' | 'warn'; detail: string }> = [];

  checks.push({ name: 'Current item count === 40', status: summary.currentItems === 40 ? 'pass' : 'fail', detail: `${summary.currentItems}` });
  checks.push({ name: 'Governance decision count === 40', status: Object.keys(GOVERNANCE).length === 40 ? 'pass' : 'fail', detail: `${Object.keys(GOVERNANCE).length}` });
  checks.push({ name: 'MOVE_TO_LAB === 13', status: summary.moveToLabCount === 13 ? 'pass' : 'fail', detail: `${summary.moveToLabCount}` });
  checks.push({ name: 'MOVE_TO_CONNECTOR_CENTER === 2', status: summary.moveToConnectorCount === 2 ? 'pass' : 'fail', detail: `${summary.moveToConnectorCount}` });
  checks.push({ name: 'MOVE_TO_GOVERNANCE === 0', status: summary.moveToGovernanceCount === 0 ? 'pass' : 'fail', detail: `${summary.moveToGovernanceCount}` });
  checks.push({ name: 'cost-routing === KEEP', status: summary.costRoutingAction === 'KEEP' ? 'pass' : 'fail', detail: `${summary.costRoutingAction}` });
  checks.push({ name: 'HIDE count === 0', status: summary.hideCount === 0 ? 'pass' : 'fail', detail: `${summary.hideCount}` });
  checks.push({ name: 'ARCHIVE count === 0', status: summary.archiveCount === 0 ? 'pass' : 'fail', detail: `${summary.archiveCount}` });

  // Check specific items
  const allItems = current.flatMap(s => s.items);
  const oa = allItems.find(i => i.id === 'openaxiom-readonly');
  const mh = allItems.find(i => i.id === 'memory-hub-readonly');
  checks.push({
    name: 'OpenAxiomReadonly target === Connector Center',
    status: oa?.futureTargetGroup === 'connector' ? 'pass' : 'fail',
    detail: oa?.futureTargetGroup || 'MISSING',
  });
  checks.push({
    name: 'MemoryHubReadonly target === Connector Center',
    status: mh?.futureTargetGroup === 'connector' ? 'pass' : 'fail',
    detail: mh?.futureTargetGroup || 'MISSING',
  });

  // Action enum validity
  const invalidActions = allItems.filter(i => !ALLOWED_ACTIONS.includes(i.action));
  checks.push({ name: 'All actions valid', status: invalidActions.length === 0 ? 'pass' : 'fail', detail: `${invalidActions.length} invalid` });

  return {
    pass: checks.every(c => c.status === 'pass'),
    checks,
  };
}
