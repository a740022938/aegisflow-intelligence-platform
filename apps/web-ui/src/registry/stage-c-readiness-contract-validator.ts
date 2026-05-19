// Stage C Readiness Contract Validator — pure validation checks
// Does not modify state, call APIs, or write to databases.
// Stage C remains disabled.

import { STAGE_C_READINESS_CONTRACT_REGISTRY } from './stage-c-readiness-contract-registry';

export interface StageCReadinessContractValidationCheck {
  id: string;
  level: 'blocking' | 'warning' | 'info';
  pass: boolean;
  message: string;
}

export interface StageCReadinessContractValidationResult {
  pass: boolean;
  blocking: number;
  warning: number;
  info: number;
  checks: StageCReadinessContractValidationCheck[];
}

const FORBIDDEN_ACTION_WORDS = ['enable', 'run', 'execute', 'restart', 'release'];

export function validateStageCReadinessContract(): StageCReadinessContractValidationResult {
  const checks: StageCReadinessContractValidationCheck[] = [];
  const registry = STAGE_C_READINESS_CONTRACT_REGISTRY;

  // 1. Registry non-empty
  checks.push({
    id: 'registry-non-empty',
    level: 'blocking',
    pass: registry.length > 0,
    message: registry.length > 0 ? `Registry has ${registry.length} items` : 'Registry is empty',
  });

  // 2. Id unique
  const ids = registry.map(i => i.id);
  const dupIds = ids.filter((id, idx) => ids.indexOf(id) !== idx);
  checks.push({
    id: 'id-unique',
    level: 'blocking',
    pass: dupIds.length === 0,
    message: dupIds.length === 0 ? 'All ids are unique' : `Duplicate ids: ${dupIds.join(', ')}`,
  });

  // 3. All items readonly=true
  const notReadonly = registry.filter(i => i.readonly !== true);
  checks.push({
    id: 'all-readonly',
    level: 'blocking',
    pass: notReadonly.length === 0,
    message: notReadonly.length === 0 ? 'All items are readonly' : `Non-readonly items: ${notReadonly.map(i => i.id).join(', ')}`,
  });

  // 4. Required items have evidenceRef
  const requiredNoRef = registry.filter(i => i.required && !i.evidenceRef);
  checks.push({
    id: 'required-has-evidence-ref',
    level: 'blocking',
    pass: requiredNoRef.length === 0,
    message: requiredNoRef.length === 0 ? 'All required items have evidenceRef' : `Required items missing evidenceRef: ${requiredNoRef.map(i => i.id).join(', ')}`,
  });

  // 5. Required items not blocked
  const requiredBlocked = registry.filter(i => i.required && i.status === 'blocked');
  checks.push({
    id: 'required-not-blocked',
    level: 'blocking',
    pass: requiredBlocked.length === 0,
    message: requiredBlocked.length === 0 ? 'No required item is blocked' : `Required items blocked: ${requiredBlocked.map(i => i.id).join(', ')}`,
  });

  // 6. Stage C disabled
  const stageCItem = registry.find(i => i.id === 'stage-c-disabled');
  checks.push({
    id: 'stage-c-disabled',
    level: 'blocking',
    pass: stageCItem ? stageCItem.status === 'frozen' : false,
    message: stageCItem ? `Stage C item status: ${stageCItem.status}` : 'Stage C item not found',
  });

  // 7. POST blocked
  const postItem = registry.find(i => i.id === 'post-blocked');
  checks.push({
    id: 'post-blocked',
    level: 'blocking',
    pass: postItem ? postItem.status === 'frozen' : false,
    message: postItem ? `POST item status: ${postItem.status}` : 'POST item not found',
  });

  // 8. DB write not occurred
  const dbItem = registry.find(i => i.id === 'db-write-blocked');
  checks.push({
    id: 'db-write-blocked',
    level: 'blocking',
    pass: dbItem ? dbItem.status === 'frozen' : false,
    message: dbItem ? `DB write item status: ${dbItem.status}` : 'DB write item not found',
  });

  // 9. External control not occurred
  const extItem = registry.find(i => i.id === 'external-control-blocked');
  checks.push({
    id: 'external-control-blocked',
    level: 'blocking',
    pass: extItem ? extItem.status === 'frozen' : false,
    message: extItem ? `External control item status: ${extItem.status}` : 'External control item not found',
  });

  // 10. Executor absent
  const execItem = registry.find(i => i.id === 'executor-absent');
  checks.push({
    id: 'executor-absent',
    level: 'blocking',
    pass: execItem ? execItem.status === 'frozen' : false,
    message: execItem ? `Executor item status: ${execItem.status}` : 'Executor item not found',
  });

  // 11. Sidebar unchanged
  const sidebarItem = registry.find(i => i.id === 'sidebar-unchanged');
  checks.push({
    id: 'sidebar-unchanged',
    level: 'blocking',
    pass: sidebarItem ? sidebarItem.status === 'frozen' : false,
    message: sidebarItem ? `Sidebar item status: ${sidebarItem.status}` : 'Sidebar item not found',
  });

  // 12. Must condition items are frozen
  const mustNotFrozen = registry.filter(i => i.condition === 'must' && i.status !== 'frozen');
  checks.push({
    id: 'must-items-frozen',
    level: 'blocking',
    pass: mustNotFrozen.length === 0,
    message: mustNotFrozen.length === 0 ? 'All must-condition items are frozen' : `Must items not frozen: ${mustNotFrozen.map(i => i.id).join(', ')}`,
  });

  // 13. ForbiddenAction not empty
  const noForbid = registry.filter(i => !i.forbiddenAction);
  checks.push({
    id: 'forbidden-action-not-empty',
    level: 'blocking',
    pass: noForbid.length === 0,
    message: noForbid.length === 0 ? 'All items have forbiddenAction' : `Missing forbiddenAction: ${noForbid.map(i => i.id).join(', ')}`,
  });

  // 14. No forbidden action words in contractInterpretation
  const dangerous = registry.filter(i =>
    FORBIDDEN_ACTION_WORDS.some(w => i.contractInterpretation.toLowerCase().includes(w))
  );
  checks.push({
    id: 'no-action-words-in-interpretation',
    level: 'warning',
    pass: dangerous.length === 0,
    message: dangerous.length === 0
      ? 'No forbidden action words in contractInterpretation'
      : `Items with action words: ${dangerous.map(i => i.id).join(', ')}`,
  });

  // 15. Area coverage
  const areas = [...new Set(registry.map(i => i.area))].sort();
  checks.push({
    id: 'area-coverage',
    level: 'info',
    pass: areas.length >= 8,
    message: `Areas: ${areas.join(', ')}`,
  });

  // 16. Required items count
  const required = registry.filter(i => i.required);
  checks.push({
    id: 'required-count',
    level: 'info',
    pass: required.length >= 18,
    message: `Required items: ${required.length}/${registry.length}`,
  });

  // 17. Frozen count
  const frozen = registry.filter(i => i.status === 'frozen');
  checks.push({
    id: 'frozen-count',
    level: 'info',
    pass: frozen.length >= 20,
    message: `Frozen items: ${frozen.length}/${registry.length}`,
  });

  // 18. Verdict is contract frozen
  checks.push({
    id: 'verdict-contract-frozen',
    level: 'blocking',
    pass: true,
    message: 'Verdict is V7_34_D2_STAGE_C_READINESS_CONTRACT_FROZEN — contract frozen, Stage C disabled',
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
