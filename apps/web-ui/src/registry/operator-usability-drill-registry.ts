// Operator Usability Drill Registry — readonly registry of usability drill scenarios
// Does not execute actions, modify state, or control external tools.

export interface UsabilityDrillScenario {
  id: string;
  scenarioNumber: number;
  title: string;
  trigger: string;
  action: string;
  expectedResult: string;
  readonly: true;
  status: 'verified' | 'deferred';
  confidence: 'high' | 'medium' | 'low';
  safetyNote: string;
}

export const OPERATOR_USABILITY_DRILL_REGISTRY: UsabilityDrillScenario[] = [
  {
    id: 'drill-repair-plan',
    scenarioNumber: 1,
    title: 'Repair Plan Drill',
    trigger: 'User suspects command pack is corrupted',
    action: 'Run aip repair plan to generate a JSON+MD repair report',
    expectedResult: 'Repair plan generated without modifying any files.',
    readonly: true,
    status: 'verified',
    confidence: 'high',
    safetyNote: 'Plan-only. No file modification. Source restore blocked. Full restore forbidden.',
  },
  {
    id: 'drill-memory-baseline',
    scenarioNumber: 2,
    title: 'Memory Baseline Drill',
    trigger: 'User forgets current progress',
    action: 'Open Memory Baseline Status section in Operator Console',
    expectedResult: 'Current baseline, v7.25–v7.40 sequence, pre-v7.25 confidence shown.',
    readonly: true,
    status: 'verified',
    confidence: 'high',
    safetyNote: 'Memory items are readonly. No runtime mutation.',
  },
  {
    id: 'drill-auth-review',
    scenarioNumber: 3,
    title: 'Authorization Review Drill',
    trigger: 'User wants to enable Stage C',
    action: 'Open Stage C Authorization Review Pack',
    expectedResult: '12 authorization requirements shown, all Not Satisfied. Fake auth rules displayed.',
    readonly: true,
    status: 'verified',
    confidence: 'high',
    safetyNote: 'Preview only. No authorization accepted. Stage C remains disabled.',
  },
  {
    id: 'drill-decision-workflow',
    scenarioNumber: 4,
    title: 'Decision Workflow Drill',
    trigger: 'User wants to continue building',
    action: 'Evaluate Operator Decision Workflow',
    expectedResult: 'Decision state and recommendation provided. e.g., BLOCKED_NEEDS_AUTHORIZATION.',
    readonly: true,
    status: 'verified',
    confidence: 'high',
    safetyNote: 'Judgment only. No execution or state change.',
  },
  {
    id: 'drill-receipt',
    scenarioNumber: 5,
    title: 'Receipt Template Drill',
    trigger: 'User needs to document phase completion',
    action: 'Use receipt template',
    expectedResult: 'Standard receipt format with phase, HEAD, files, validation, safety, verdict.',
    readonly: true,
    status: 'verified',
    confidence: 'high',
    safetyNote: 'Documentation only. No state modification.',
  },
];

export function getOperatorUsabilityDrillRegistry(): UsabilityDrillScenario[] {
  return OPERATOR_USABILITY_DRILL_REGISTRY;
}

export function getOperatorUsabilityDrillSummary() {
  const items = OPERATOR_USABILITY_DRILL_REGISTRY;
  return {
    total: items.length,
    verified: items.filter(i => i.status === 'verified').length,
    deferred: items.filter(i => i.status === 'deferred').length,
    highConfidence: items.filter(i => i.confidence === 'high').length,
  };
}
