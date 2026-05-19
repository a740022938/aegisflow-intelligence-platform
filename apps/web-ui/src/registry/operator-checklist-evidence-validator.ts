// Operator Checklist + Evidence Linkage Validator — pure validation checks
// Does not modify state, call APIs, or write to databases.

import { OPERATOR_CHECKLIST, type OperatorChecklistItem } from './operator-checklist-registry';
import { OPERATOR_EVIDENCE_LINKAGE, type OperatorEvidenceLinkageItem } from './operator-evidence-linkage-registry';

export interface OperatorChecklistEvidenceValidationCheck {
  id: string;
  level: 'blocking' | 'warning' | 'info';
  pass: boolean;
  message: string;
}

export interface OperatorChecklistEvidenceValidationResult {
  pass: boolean;
  blocking: number;
  warning: number;
  info: number;
  checks: OperatorChecklistEvidenceValidationCheck[];
}

const FORBIDDEN_ACTION_WORDS = ['run', 'execute', 'restart', 'enable'];

export function validateOperatorChecklistEvidence(): OperatorChecklistEvidenceValidationResult {
  const checks: OperatorChecklistEvidenceValidationCheck[] = [];
  const checklist = OPERATOR_CHECKLIST;
  const evidence = OPERATOR_EVIDENCE_LINKAGE;

  // 1. Checklist non-empty
  checks.push({
    id: 'checklist-non-empty',
    level: 'blocking',
    pass: checklist.length > 0,
    message: checklist.length > 0
      ? `Checklist has ${checklist.length} items`
      : 'Checklist is empty',
  });

  // 2. Checklist id unique
  const checkIds = checklist.map(i => i.id);
  const dupCheckIds = checkIds.filter((id, idx) => checkIds.indexOf(id) !== idx);
  checks.push({
    id: 'checklist-id-unique',
    level: 'blocking',
    pass: dupCheckIds.length === 0,
    message: dupCheckIds.length === 0
      ? 'All checklist ids are unique'
      : `Duplicate checklist ids: ${dupCheckIds.join(', ')}`,
  });

  // 3. Evidence linkage non-empty
  checks.push({
    id: 'evidence-non-empty',
    level: 'blocking',
    pass: evidence.length > 0,
    message: evidence.length > 0
      ? `Evidence linkage has ${evidence.length} items`
      : 'Evidence linkage is empty',
  });

  // 4. Evidence id unique
  const evIds = evidence.map(i => i.id);
  const dupEvIds = evIds.filter((id, idx) => evIds.indexOf(id) !== idx);
  checks.push({
    id: 'evidence-id-unique',
    level: 'blocking',
    pass: dupEvIds.length === 0,
    message: dupEvIds.length === 0
      ? 'All evidence ids are unique'
      : `Duplicate evidence ids: ${dupEvIds.join(', ')}`,
  });

  // 5. All checklist items readonly=true
  const checkNotReadonly = checklist.filter(i => i.readonly !== true);
  checks.push({
    id: 'checklist-all-readonly',
    level: 'blocking',
    pass: checkNotReadonly.length === 0,
    message: checkNotReadonly.length === 0
      ? 'All checklist items are readonly'
      : `Non-readonly checklist items: ${checkNotReadonly.map(i => i.id).join(', ')}`,
  });

  // 6. All evidence items readonly=true
  const evNotReadonly = evidence.filter(i => i.readonly !== true);
  checks.push({
    id: 'evidence-all-readonly',
    level: 'blocking',
    pass: evNotReadonly.length === 0,
    message: evNotReadonly.length === 0
      ? 'All evidence items are readonly'
      : `Non-readonly evidence items: ${evNotReadonly.map(i => i.id).join(', ')}`,
  });

  // 7. Required checklist items have evidenceRef
  const requiredNoRef = checklist.filter(i => i.required && !i.evidenceRef);
  checks.push({
    id: 'required-has-evidence-ref',
    level: 'blocking',
    pass: requiredNoRef.length === 0,
    message: requiredNoRef.length === 0
      ? 'All required checklist items have evidenceRef'
      : `Required items missing evidenceRef: ${requiredNoRef.map(i => i.id).join(', ')}`,
  });

  // 8. Evidence path not empty
  const evNoPath = evidence.filter(i => !i.path);
  checks.push({
    id: 'evidence-path-not-empty',
    level: 'blocking',
    pass: evNoPath.length === 0,
    message: evNoPath.length === 0
      ? 'All evidence items have path'
      : `Evidence items missing path: ${evNoPath.map(i => i.id).join(', ')}`,
  });

  // 9. ForbiddenAction not empty
  const checkNoForbid = checklist.filter(i => !i.forbiddenAction);
  const evNoForbid = evidence.filter(i => !i.forbiddenAction);
  checks.push({
    id: 'forbidden-action-not-empty',
    level: 'blocking',
    pass: checkNoForbid.length === 0 && evNoForbid.length === 0,
    message: checkNoForbid.length === 0 && evNoForbid.length === 0
      ? 'All items have forbiddenAction'
      : `Missing forbiddenAction: checklist=${checkNoForbid.map(i => i.id).join(',')} evidence=${evNoForbid.map(i => i.id).join(',')}`,
  });

  // 10. Stage C item must have status=pass, not actionable
  const stageCItem = checklist.find(i => i.id === 'stage-c-disabled');
  checks.push({
    id: 'stage-c-status-pass-disabled',
    level: 'blocking',
    pass: stageCItem ? stageCItem.status === 'pass' : false,
    message: stageCItem
      ? `Stage C item status: ${stageCItem.status}`
      : 'Stage C item not found in checklist',
  });

  // 11. POST item must have status=pass, not actionable
  const postItem = checklist.find(i => i.id === 'post-blocked');
  checks.push({
    id: 'post-status-pass-blocked',
    level: 'blocking',
    pass: postItem ? postItem.status === 'pass' : false,
    message: postItem
      ? `POST item status: ${postItem.status}`
      : 'POST item not found in checklist',
  });

  // 12. DB write item status
  const dbItem = checklist.find(i => i.id === 'db-write-not-occurred');
  checks.push({
    id: 'db-write-status-pass',
    level: 'blocking',
    pass: dbItem ? dbItem.status === 'pass' : false,
    message: dbItem
      ? `DB write item status: ${dbItem.status}`
      : 'DB write item not found in checklist',
  });

  // 13. External control item status
  const extItem = checklist.find(i => i.id === 'external-control-not-occurred');
  checks.push({
    id: 'external-control-status-pass',
    level: 'blocking',
    pass: extItem ? extItem.status === 'pass' : false,
    message: extItem
      ? `External control item status: ${extItem.status}`
      : 'External control item not found in checklist',
  });

  // 14. Executor item status
  const execItem = checklist.find(i => i.id === 'executor-absent');
  checks.push({
    id: 'executor-status-pass',
    level: 'blocking',
    pass: execItem ? execItem.status === 'pass' : false,
    message: execItem
      ? `Executor item status: ${execItem.status}`
      : 'Executor item not found in checklist',
  });

  // 15. No forbidden action words in operatorInterpretation
  const dangerousInterpretations = checklist.filter(i =>
    FORBIDDEN_ACTION_WORDS.some(w => i.operatorInterpretation.toLowerCase().includes(w))
  );
  checks.push({
    id: 'no-action-words-in-interpretation',
    level: 'warning',
    pass: dangerousInterpretations.length === 0,
    message: dangerousInterpretations.length === 0
      ? 'No forbidden action words in operatorInterpretation'
      : `Items with action words in interpretation: ${dangerousInterpretations.map(i => i.id).join(', ')}`,
  });

  // 16. Source of truth items cover report and receipt
  const sourceOfTruth = evidence.filter(i => i.sourceOfTruth);
  const hasReportSource = sourceOfTruth.some(i => i.evidenceType === 'report');
  const hasReceiptSource = sourceOfTruth.some(i => i.evidenceType === 'receipt');
  checks.push({
    id: 'source-of-truth-covers-report-receipt',
    level: 'info',
    pass: hasReportSource && hasReceiptSource,
    message: hasReportSource && hasReceiptSource
      ? 'Source of truth items cover both report and receipt types'
      : `Missing source of truth: report=${hasReportSource} receipt=${hasReceiptSource}`,
  });

  // 17. Summary info
  checks.push({
    id: 'registry-size-summary',
    level: 'info',
    pass: true,
    message: `Checklist: ${checklist.length} items, Evidence: ${evidence.length} items`,
  });

  // 18. Category coverage
  const categories = [...new Set(checklist.map(i => i.category))].sort();
  checks.push({
    id: 'category-coverage',
    level: 'info',
    pass: true,
    message: `Categories: ${categories.join(', ')}`,
  });

  // 19. Evidence type coverage
  const evTypes = [...new Set(evidence.map(i => i.evidenceType))].sort();
  checks.push({
    id: 'evidence-type-coverage',
    level: 'info',
    pass: true,
    message: `Evidence types: ${evTypes.join(', ')}`,
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
