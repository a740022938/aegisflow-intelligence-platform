// Handoff Pack Registry — v7.45 release handoff registry
// Readonly handoff tracking. Does not execute operations or modify state.

export interface HandoffPackEntry {
  id: string;
  title: string;
  source: string;
  readiness: 'ready' | 'pending' | 'blocked';
  completeness: 'complete' | 'partial' | 'missing';
  gateStatus: 'pass' | 'fail' | 'not_applicable';
  note: string;
}

export const HANDOFF_PACK_REGISTRY: HandoffPackEntry[] = [
  {
    id: 'ho-release-readiness',
    title: 'Release Readiness Checklist',
    source: 'AIP_V7_45_RELEASE_READINESS_CHECKLIST.md',
    readiness: 'ready',
    completeness: 'complete',
    gateStatus: 'pass',
    note: '24-point checklist. All items verified pass.',
  },
  {
    id: 'ho-operator-guide',
    title: 'Operator Guide',
    source: 'AIP_V7_45_OPERATOR_GUIDE.md',
    readiness: 'ready',
    completeness: 'complete',
    gateStatus: 'pass',
    note: 'Full operator guide with Stage C disabled constraints.',
  },
  {
    id: 'ho-operator-quickstart',
    title: 'Operator Quickstart',
    source: 'AIP_V7_45_OPERATOR_QUICKSTART.md',
    readiness: 'ready',
    completeness: 'complete',
    gateStatus: 'pass',
    note: 'Quickstart from PS C:\\Users\\74002>.',
  },
  {
    id: 'ho-command-center',
    title: 'Command Center Reference',
    source: 'AIP_V7_45_COMMAND_CENTER_REFERENCE.md',
    readiness: 'ready',
    completeness: 'complete',
    gateStatus: 'pass',
    note: 'CLI and web route reference.',
  },
  {
    id: 'ho-safe-status',
    title: 'Safe Status Reference',
    source: 'AIP_V7_45_SAFE_STATUS_REFERENCE.md',
    readiness: 'ready',
    completeness: 'complete',
    gateStatus: 'pass',
    note: 'Safe-status field guide.',
  },
  {
    id: 'ho-restore-point-pack',
    title: 'Restore Point Pack',
    source: 'AIP_V7_45_LOCAL_RESTORE_POINT_PACK_PLAN.md',
    readiness: 'ready',
    completeness: 'complete',
    gateStatus: 'pass',
    note: '10 items: design, policy, safety. All specified.',
  },
  {
    id: 'ho-install-guide',
    title: 'Install and Run Guide',
    source: 'AIP_V7_45_INSTALL_AND_RUN_GUIDE.md',
    readiness: 'ready',
    completeness: 'complete',
    gateStatus: 'pass',
    note: 'Install and run instructions.',
  },
  {
    id: 'ho-recovery-guide',
    title: 'Recovery and Restore Guide',
    source: 'AIP_V7_45_RECOVERY_AND_RESTORE_GUIDE.md',
    readiness: 'ready',
    completeness: 'complete',
    gateStatus: 'pass',
    note: 'Recovery procedures.',
  },
  {
    id: 'ho-stage-c-safety',
    title: 'Stage C Safety Notice',
    source: 'AIP_V7_45_STAGE_C_SAFETY_NOTICE.md',
    readiness: 'ready',
    completeness: 'complete',
    gateStatus: 'pass',
    note: 'Stage C disabled. Do not enable without authorization.',
  },
  {
    id: 'ho-evidence-matrix',
    title: 'Release Evidence Matrix',
    source: 'release-evidence-matrix.ts',
    readiness: 'ready',
    completeness: 'complete',
    gateStatus: 'pass',
    note: '12 evidence entries. All pass.',
  },
  {
    id: 'ho-handoff-checker',
    title: 'Handoff Checker',
    source: 'handoff-pack-checker.ts',
    readiness: 'ready',
    completeness: 'complete',
    gateStatus: 'pass',
    note: 'Readiness, completeness, safety, gate checks.',
  },
];

export function getHandoffPackRegistry(): HandoffPackEntry[] {
  return HANDOFF_PACK_REGISTRY;
}

export function getHandoffPackSummary() {
  const items = HANDOFF_PACK_REGISTRY;
  return {
    total: items.length,
    ready: items.filter(i => i.readiness === 'ready').length,
    complete: items.filter(i => i.completeness === 'complete').length,
    gatePass: items.filter(i => i.gateStatus === 'pass').length,
  };
}
