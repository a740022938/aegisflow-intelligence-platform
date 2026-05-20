// Operator Repair Bridge Registry — readonly registry of repair capabilities
// All repair commands are plan-only by default. No file modification from registry.

export interface RepairBridgeItem {
  id: string;
  command: string;
  title: string;
  planOnly: boolean;
  sourceRestoreAllowed: boolean;
  fullRestoreAllowed: boolean;
  status: 'ready' | 'blocked';
  readonly: true;
  summary: string;
  safetyAnnotation: string;
}

export const OPERATOR_REPAIR_BRIDGE_REGISTRY: RepairBridgeItem[] = [
  {
    id: 'repair-default',
    command: 'aip repair',
    title: 'Repair (default)',
    planOnly: true,
    sourceRestoreAllowed: false,
    fullRestoreAllowed: false,
    status: 'ready',
    readonly: true,
    summary: 'Default repair mode — generates plan without modifying files.',
    safetyAnnotation: 'Plan-only by default. No file modification.',
  },
  {
    id: 'repair-check',
    command: 'aip repair check',
    title: 'Repair Check',
    planOnly: true,
    sourceRestoreAllowed: false,
    fullRestoreAllowed: false,
    status: 'ready',
    readonly: true,
    summary: 'Checks repair readiness without executing any changes.',
    safetyAnnotation: 'Readonly diagnostic — no side effects.',
  },
  {
    id: 'repair-plan',
    command: 'aip repair plan',
    title: 'Repair Plan',
    planOnly: true,
    sourceRestoreAllowed: false,
    fullRestoreAllowed: false,
    status: 'ready',
    readonly: true,
    summary: 'Generates a detailed repair plan as JSON+MD report.',
    safetyAnnotation: 'Plan-only — output is documentation, not execution.',
  },
  {
    id: 'repair-command-pack',
    command: 'aip repair command-pack',
    title: 'Repair Command Pack',
    planOnly: true,
    sourceRestoreAllowed: false,
    fullRestoreAllowed: false,
    status: 'ready',
    readonly: true,
    summary: 'Assembles a command pack from repair plan.',
    safetyAnnotation: 'Generates command list only. No automatic execution.',
  },
  {
    id: 'repair-restore-point',
    command: 'aip repair restore-point',
    title: 'Repair Restore Point',
    planOnly: true,
    sourceRestoreAllowed: false,
    fullRestoreAllowed: false,
    status: 'ready',
    readonly: true,
    summary: 'View-only restore point listing. No creation or application.',
    safetyAnnotation: 'View-only. Restore point creation requires separate authorization.',
  },
];

export function getOperatorRepairBridgeRegistry(): RepairBridgeItem[] {
  return OPERATOR_REPAIR_BRIDGE_REGISTRY;
}

export function getOperatorRepairBridgeSummary() {
  const items = OPERATOR_REPAIR_BRIDGE_REGISTRY;
  return {
    total: items.length,
    planOnly: items.filter(i => i.planOnly).length,
    sourceRestoreBlocked: items.filter(i => !i.sourceRestoreAllowed).length,
    fullRestoreBlocked: items.filter(i => !i.fullRestoreAllowed).length,
  };
}
