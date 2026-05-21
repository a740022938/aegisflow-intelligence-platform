// Operator Memory Bridge Registry — readonly registry of memory knowledge
// Does not mutate runtime memory, write to DB, or control external tools.

export interface MemoryBridgeItem {
  id: string;
  title: string;
  confidenceLevel: 'verified' | 'historical' | 'low' | 'reference';
  versionRange: string;
  readonly: true;
  summary: string;
  operatorNote: string;
}

export const OPERATOR_MEMORY_BRIDGE_REGISTRY: MemoryBridgeItem[] = [
  {
    id: 'mem-v7.62-release',
    title: 'OpenAIP v7.62.0 Released',
    confidenceLevel: 'verified',
    versionRange: 'v7.62',
    readonly: true,
    summary: 'OpenAIP v7.62.0 released as GitHub Release at tag v7.62.0 (commit e6be163). Final HEAD 451f8d0. Stage C disabled. Feature flag off. P1→P5 pipeline complete.',
    operatorNote: 'This is the first formal GitHub Release after the v7.5x–v7.6x hardening cycle. Next step: v7.63 maintenance/cleanup.',
  },
  {
    id: 'mem-current-baseline',
    title: 'Current Verified Baseline',
    confidenceLevel: 'verified',
    versionRange: 'v7.62',
    readonly: true,
    summary: 'OpenAIP v7.62.0 released at tag v7.62.0 (commit e6be163). HEAD 451f8d0. Stage C disabled. Feature flag off.',
    operatorNote: 'Use git log, git status, and gh release view to verify current baseline before any phase.',
  },
  {
    id: 'mem-v7.25-v7.40',
    title: 'v7.25–v7.40 Verified Sequence',
    confidenceLevel: 'verified',
    versionRange: 'v7.25–v7.40',
    readonly: true,
    summary: '15 verified phases from v7.25 through v7.40. All sealed with Stage C disabled.',
    operatorNote: 'Reference this sequence for established patterns and conventions.',
  },
  {
    id: 'mem-pre-v7.25',
    title: 'Pre-v7.25 Historical Confidence',
    confidenceLevel: 'historical',
    versionRange: 'v7.00–v7.24',
    readonly: true,
    summary: 'Pre-v7.25 phases have lower confidence due to less structured memory tracking.',
    operatorNote: 'Treat pre-v7.25 information as approximate. Verify against current codebase.',
  },
  {
    id: 'mem-v7.43-future',
    title: 'v7.43 Future Reference',
    confidenceLevel: 'reference',
    versionRange: 'v7.43',
    readonly: true,
    summary: 'v7.43 is a productization and authorization review preparation package. Stage C remains disabled.',
    operatorNote: 'Do not interpret v7.43 deliverables as Stage C enablement or authorization.',
  },
  {
    id: 'mem-desktop-packs',
    title: 'Desktop Task Packs',
    confidenceLevel: 'reference',
    versionRange: 'all',
    readonly: true,
    summary: 'Desktop task packs (E:\\_AIP_*) are intent/input evidence only. Not authoritative memory.',
    operatorNote: 'Desktop task packs document user intent. Do not treat as verified memory.',
  },
];

export function getOperatorMemoryBridgeRegistry(): MemoryBridgeItem[] {
  return OPERATOR_MEMORY_BRIDGE_REGISTRY;
}

export function getOperatorMemoryBridgeSummary() {
  const items = OPERATOR_MEMORY_BRIDGE_REGISTRY;
  return {
    total: items.length,
    verified: items.filter(i => i.confidenceLevel === 'verified').length,
    historical: items.filter(i => i.confidenceLevel === 'historical').length,
    low: items.filter(i => i.confidenceLevel === 'low').length,
    reference: items.filter(i => i.confidenceLevel === 'reference').length,
  };
}
