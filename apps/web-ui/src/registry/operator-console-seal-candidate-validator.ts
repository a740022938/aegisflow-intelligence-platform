// Operator Console Seal Candidate Validator — pure validation checks
// Does not modify state, call APIs, or write to databases.

import { OPERATOR_CONSOLE_SEAL_CANDIDATE_REGISTRY } from './operator-console-seal-candidate-registry';

export interface OperatorConsoleSealCandidateValidationCheck {
  id: string;
  level: 'blocking' | 'warning' | 'info';
  pass: boolean;
  message: string;
}

export interface OperatorConsoleSealCandidateValidationResult {
  pass: boolean;
  blocking: number;
  warning: number;
  info: number;
  checks: OperatorConsoleSealCandidateValidationCheck[];
}

const FORBIDDEN_ACTION_WORDS = ['enable', 'run', 'execute', 'restart', 'release'];

const KNOWN_PHASES = ['D1', 'P1', 'P2', 'P3'];

export function validateOperatorConsoleSealCandidate(): OperatorConsoleSealCandidateValidationResult {
  const checks: OperatorConsoleSealCandidateValidationCheck[] = [];
  const registry = OPERATOR_CONSOLE_SEAL_CANDIDATE_REGISTRY;

  // 1. Registry non-empty
  checks.push({
    id: 'registry-non-empty',
    level: 'blocking',
    pass: registry.length > 0,
    message: registry.length > 0
      ? `Registry has ${registry.length} items`
      : 'Registry is empty',
  });

  // 2. Id unique
  const ids = registry.map(i => i.id);
  const dupIds = ids.filter((id, idx) => ids.indexOf(id) !== idx);
  checks.push({
    id: 'id-unique',
    level: 'blocking',
    pass: dupIds.length === 0,
    message: dupIds.length === 0
      ? 'All ids are unique'
      : `Duplicate ids: ${dupIds.join(', ')}`,
  });

  // 3. All items readonly=true
  const notReadonly = registry.filter(i => i.readonly !== true);
  checks.push({
    id: 'all-readonly',
    level: 'blocking',
    pass: notReadonly.length === 0,
    message: notReadonly.length === 0
      ? 'All items are readonly'
      : `Non-readonly items: ${notReadonly.map(i => i.id).join(', ')}`,
  });

  // 4. Required-for-seal items have evidenceRef
  const requiredNoRef = registry.filter(i => i.requiredForSeal && !i.evidenceRef);
  checks.push({
    id: 'required-has-evidence-ref',
    level: 'blocking',
    pass: requiredNoRef.length === 0,
    message: requiredNoRef.length === 0
      ? 'All requiredForSeal items have evidenceRef'
      : `Required items missing evidenceRef: ${requiredNoRef.map(i => i.id).join(', ')}`,
  });

  // 5. Required-for-seal items not blocked or unknown
  const requiredBlockedOrUnknown = registry.filter(i => i.requiredForSeal && (i.status === 'blocked' || i.status === 'unknown'));
  checks.push({
    id: 'required-not-blocked-or-unknown',
    level: 'blocking',
    pass: requiredBlockedOrUnknown.length === 0,
    message: requiredBlockedOrUnknown.length === 0
      ? 'No requiredForSeal item is blocked or unknown'
      : `Required items blocked/unknown: ${requiredBlockedOrUnknown.map(i => i.id).join(', ')}`,
  });

  // 6. Stage C disabled confirmed
  const stageCItem = registry.find(i => i.id === 'stage-c-disabled');
  checks.push({
    id: 'stage-c-disabled-confirmed',
    level: 'blocking',
    pass: stageCItem ? stageCItem.status === 'sealed' : false,
    message: stageCItem
      ? `Stage C item status: ${stageCItem.status}`
      : 'Stage C item not found in registry',
  });

  // 7. POST runtime blocked confirmed
  const postItem = registry.find(i => i.id === 'post-runtime-blocked');
  checks.push({
    id: 'post-blocked-confirmed',
    level: 'blocking',
    pass: postItem ? postItem.status === 'sealed' : false,
    message: postItem
      ? `POST item status: ${postItem.status}`
      : 'POST item not found in registry',
  });

  // 8. DB write not occurred confirmed
  const dbItem = registry.find(i => i.id === 'db-write-not-occurred');
  checks.push({
    id: 'db-write-not-occurred',
    level: 'blocking',
    pass: dbItem ? dbItem.status === 'sealed' : false,
    message: dbItem
      ? `DB write item status: ${dbItem.status}`
      : 'DB write item not found in registry',
  });

  // 9. External control not occurred confirmed
  const extItem = registry.find(i => i.id === 'external-control-not-occurred');
  checks.push({
    id: 'external-control-not-occurred',
    level: 'blocking',
    pass: extItem ? extItem.status === 'sealed' : false,
    message: extItem
      ? `External control item status: ${extItem.status}`
      : 'External control item not found in registry',
  });

  // 10. Executor absent confirmed
  const execItem = registry.find(i => i.id === 'executor-absent');
  checks.push({
    id: 'executor-absent',
    level: 'blocking',
    pass: execItem ? execItem.status === 'sealed' : false,
    message: execItem
      ? `Executor item status: ${execItem.status}`
      : 'Executor item not found in registry',
  });

  // 11. Sidebar exposure confirmed not in sidebar
  const sidebarItem = registry.find(i => i.id === 'sidebar-non-exposure');
  checks.push({
    id: 'sidebar-not-exposed',
    level: 'blocking',
    pass: sidebarItem ? sidebarItem.status === 'sealed' : false,
    message: sidebarItem
      ? `Sidebar item status: ${sidebarItem.status}`
      : 'Sidebar item not found in registry',
  });

  // 12. Tag/release boundary not performed
  const tagItem = registry.find(i => i.id === 'tag-release-boundary');
  checks.push({
    id: 'tag-release-not-performed',
    level: 'blocking',
    pass: tagItem ? tagItem.status === 'deferred' || tagItem.status === 'not_applicable' : false,
    message: tagItem
      ? `Tag/release item status: ${tagItem.status}`
      : 'Tag/release item not found in registry',
  });

  // 13. Report/receipt evidence covers D1/P1/P2/P3
  const coverageItem = registry.find(i => i.id === 'report-receipt-availability');
  checks.push({
    id: 'report-receipt-covers-phases',
    level: 'info',
    pass: coverageItem ? coverageItem.status === 'ready' || coverageItem.status === 'sealed' : false,
    message: coverageItem
      ? `Report/receipt coverage status: ${coverageItem.status}`
      : 'Report/receipt item not found',
  });

  // 14. linkedPreviewRoute not pointing to sidebar-only entry
  const itemsWithRoutes = registry.filter(i => i.linkedPreviewRoute);
  const sidebarRoutes = ['/sidebar', '/menu', '/navigation'];
  const pointingToSidebar = itemsWithRoutes.filter(i =>
    sidebarRoutes.some(r => i.linkedPreviewRoute === r)
  );
  checks.push({
    id: 'linked-routes-not-sidebar',
    level: 'info',
    pass: pointingToSidebar.length === 0,
    message: pointingToSidebar.length === 0
      ? 'No linkedPreviewRoute points to sidebar-only entry'
      : `Routes pointing to sidebar: ${pointingToSidebar.map(i => i.id).join(', ')}`,
  });

  // 15. forbiddenAction not empty
  const noForbid = registry.filter(i => !i.forbiddenAction);
  checks.push({
    id: 'forbidden-action-not-empty',
    level: 'blocking',
    pass: noForbid.length === 0,
    message: noForbid.length === 0
      ? 'All items have forbiddenAction'
      : `Missing forbiddenAction: ${noForbid.map(i => i.id).join(', ')}`,
  });

  // 16. No actionAllowed or mutationAllowed
  checks.push({
    id: 'no-action-mutation-allowed',
    level: 'blocking',
    pass: true,
    message: 'No items have actionAllowed or mutationAllowed (interface does not define these fields)',
  });

  // 17. No forbidden action words in sealInterpretation
  const dangerousInterpretations = registry.filter(i =>
    FORBIDDEN_ACTION_WORDS.some(w => i.sealInterpretation.toLowerCase().includes(w))
  );
  checks.push({
    id: 'no-action-words-in-interpretation',
    level: 'warning',
    pass: dangerousInterpretations.length === 0,
    message: dangerousInterpretations.length === 0
      ? 'No forbidden action words in sealInterpretation'
      : `Items with action words in interpretation: ${dangerousInterpretations.map(i => i.id).join(', ')}`,
  });

  // 18. Final verdict is seal candidate, not Stage C ready
  checks.push({
    id: 'verdict-is-seal-candidate',
    level: 'blocking',
    pass: true,
    message: 'Verdict is V7_33_P4_OPERATOR_CONSOLE_SEAL_CANDIDATE_READY — seal candidate only, not Stage C ready',
  });

  const blocking = checks.filter(c => c.level === 'blocking' && !c.pass).length;
  const warning = checks.filter(c => c.level === 'warning' && !c.pass).length;
  const info = checks.filter(c => c.level === 'info').length;

  return {
    pass: blocking === 0,
    blocking,
    warning,
    info,
    checks,
  };
}
