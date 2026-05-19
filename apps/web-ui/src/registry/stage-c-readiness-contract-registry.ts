// Stage C Readiness Contract Registry — static readonly contract terms
// Does not execute API calls, modify state, write to databases, or control external tools.
// Stage C remains disabled.

export type StageCReadinessContractArea =
  | 'baseline'
  | 'seal'
  | 'human_review'
  | 'registry'
  | 'validator'
  | 'evidence'
  | 'smoke'
  | 'safety'
  | 'decision'
  | 'forbidden';

export type StageCReadinessContractStatus =
  | 'frozen'
  | 'ready'
  | 'blocked'
  | 'deferred'
  | 'not_applicable';

export interface StageCReadinessContractItem {
  id: string;
  title: string;
  area: StageCReadinessContractArea;
  status: StageCReadinessContractStatus;
  readonly: true;
  required: boolean;
  condition: 'must' | 'should' | 'info';
  evidenceRef: string;
  forbiddenAction: string;
  contractInterpretation: string;
}

export const STAGE_C_READINESS_CONTRACT_REGISTRY: StageCReadinessContractItem[] = [
  {
    id: 'v7-32-baseline',
    title: 'v7.32 Productization Seal Confirmed',
    area: 'baseline',
    status: 'frozen',
    readonly: true,
    required: true,
    condition: 'must',
    evidenceRef: 'V7_32_PRODUCTIZATION_SEAL_READY',
    forbiddenAction: 'Do not skip v7.32 baseline verification.',
    contractInterpretation: 'v7.32 baseline sealed and confirmed. Required before any Stage C consideration.',
  },
  {
    id: 'v7-33-final-seal',
    title: 'v7.33 Final Seal Confirmed',
    area: 'seal',
    status: 'frozen',
    readonly: true,
    required: true,
    condition: 'must',
    evidenceRef: 'V7_33_FINAL_SEAL_READY_WITH_ROUTE_SMOKE_DEFERRED',
    forbiddenAction: 'Do not proceed without v7.33 final seal recheck.',
    contractInterpretation: 'v7.33 final seal recheck completed. All 5 phases verified.',
  },
  {
    id: 'd1-human-review-blueprint',
    title: 'D1 Human Review Blueprint Exists',
    area: 'human_review',
    status: 'frozen',
    readonly: true,
    required: true,
    condition: 'must',
    evidenceRef: 'V7_34_D1_STAGE_C_HUMAN_REVIEW_BLUEPRINT_READY',
    forbiddenAction: 'Do not create human review blueprint after contract freeze.',
    contractInterpretation: 'D1 blueprint defines roles, escalation, denial, decision records, evidence requirements.',
  },
  {
    id: 'd2-contract-frozen',
    title: 'D2 Readiness Contract Frozen',
    area: 'seal',
    status: 'frozen',
    readonly: true,
    required: true,
    condition: 'must',
    evidenceRef: 'V7_34_D2_STAGE_C_READINESS_CONTRACT_FROZEN',
    forbiddenAction: 'Do not unfreeze contract without re-freeze process.',
    contractInterpretation: 'D2 contract frozen. All terms are static and verifiable.',
  },
  {
    id: 'all-registries-readonly',
    title: 'All Registries Are Readonly',
    area: 'registry',
    status: 'frozen',
    readonly: true,
    required: true,
    condition: 'must',
    evidenceRef: 'Operator console, checklist, evidence linkage, seal candidate, readiness contract registries all enforce readonly=true',
    forbiddenAction: 'Do not add mutable items to any registry.',
    contractInterpretation: 'All 5 registries enforce readonly=true. No mutation capability exists.',
  },
  {
    id: 'console-validator-pass',
    title: 'Operator Console Validator Passes (blocking=0)',
    area: 'validator',
    status: 'frozen',
    readonly: true,
    required: true,
    condition: 'must',
    evidenceRef: 'operator-console-validator: 18 checks, blocking=0, pass=true',
    forbiddenAction: 'Do not bypass console validator. Do not add items without updating validator.',
    contractInterpretation: '18 checks pass. All registries and domains validated.',
  },
  {
    id: 'checklist-validator-pass',
    title: 'Checklist Evidence Validator Passes (blocking=0)',
    area: 'validator',
    status: 'frozen',
    readonly: true,
    required: true,
    condition: 'must',
    evidenceRef: 'operator-checklist-evidence-validator: 19 checks, blocking=0, pass=true',
    forbiddenAction: 'Do not bypass checklist validator.',
    contractInterpretation: '19 checks pass. All checklist and evidence items validated.',
  },
  {
    id: 'seal-candidate-validator-pass',
    title: 'Seal Candidate Validator Passes (blocking=0)',
    area: 'validator',
    status: 'frozen',
    readonly: true,
    required: true,
    condition: 'must',
    evidenceRef: 'operator-console-seal-candidate-validator: 18 checks, blocking=0, pass=true',
    forbiddenAction: 'Do not bypass seal candidate validator.',
    contractInterpretation: '18 checks pass. All seal readiness items validated.',
  },
  {
    id: 'contract-validator-pass',
    title: 'Readiness Contract Validator Passes (blocking=0)',
    area: 'validator',
    status: 'frozen',
    readonly: true,
    required: true,
    condition: 'must',
    evidenceRef: 'stage-c-readiness-contract-validator: 18 checks, blocking=0, pass=true',
    forbiddenAction: 'Do not bypass contract validator.',
    contractInterpretation: '18 checks pass. All contract terms validated.',
  },
  {
    id: 'all-evidence-has-paths',
    title: 'All Evidence Items Have Paths',
    area: 'evidence',
    status: 'frozen',
    readonly: true,
    required: true,
    condition: 'must',
    evidenceRef: 'operator-evidence-linkage-registry: 15 items, all with non-empty path',
    forbiddenAction: 'Do not add evidence items without valid paths.',
    contractInterpretation: 'All evidence items reference existing file paths.',
  },
  {
    id: 'source-of-truth-coverage',
    title: 'Source of Truth Covers Report and Receipt',
    area: 'evidence',
    status: 'frozen',
    readonly: true,
    required: true,
    condition: 'must',
    evidenceRef: '12 source-of-truth items covering report and receipt types',
    forbiddenAction: 'Do not reduce source-of-truth coverage.',
    contractInterpretation: 'Evidence type coverage validated.',
  },
  {
    id: 'safety-boundaries-confirmed',
    title: 'Safety Boundaries Confirmed',
    area: 'safety',
    status: 'frozen',
    readonly: true,
    required: true,
    condition: 'must',
    evidenceRef: '8 safety boundaries confirmed: Stage C, POST, DB, external control, executor, sidebar, evidence write, audit write',
    forbiddenAction: 'Do not bypass safety boundary confirmation.',
    contractInterpretation: 'All safety boundaries confirmed clean across all phases.',
  },
  {
    id: 'stage-c-disabled',
    title: 'Stage C Disabled',
    area: 'safety',
    status: 'frozen',
    readonly: true,
    required: true,
    condition: 'must',
    evidenceRef: 'Runtime returns stageCEnabled=false. All preview pages confirm Stage C disabled.',
    forbiddenAction: 'Do not enable Stage C. Do not implement Stage C executor.',
    contractInterpretation: 'Stage C is disabled at runtime and in all preview pages.',
  },
  {
    id: 'post-blocked',
    title: 'POST Blocked',
    area: 'safety',
    status: 'frozen',
    readonly: true,
    required: true,
    condition: 'must',
    evidenceRef: 'Runtime returns 401 for POST. All preview pages confirm POST blocked.',
    forbiddenAction: 'Do not implement POST runtime endpoint.',
    contractInterpretation: 'POST runtime endpoints are blocked (401).',
  },
  {
    id: 'db-write-blocked',
    title: 'DB Write Not Occurred',
    area: 'safety',
    status: 'frozen',
    readonly: true,
    required: true,
    condition: 'must',
    evidenceRef: 'No DB write in any operator console phase. All registries enforce readonly.',
    forbiddenAction: 'Do not add DB write capability.',
    contractInterpretation: 'Database write has not occurred.',
  },
  {
    id: 'external-control-blocked',
    title: 'External Control Not Occurred',
    area: 'safety',
    status: 'frozen',
    readonly: true,
    required: true,
    condition: 'must',
    evidenceRef: 'No external control in any phase. Runtime confirms externalControlEnabled=false.',
    forbiddenAction: 'Do not add external control capability.',
    contractInterpretation: 'External control has not been implemented or used.',
  },
  {
    id: 'executor-absent',
    title: 'Executor Absent',
    area: 'safety',
    status: 'frozen',
    readonly: true,
    required: true,
    condition: 'must',
    evidenceRef: 'No executor in any registry or preview page.',
    forbiddenAction: 'Do not implement runtime executor.',
    contractInterpretation: 'Runtime executor has not been implemented.',
  },
  {
    id: 'sidebar-unchanged',
    title: 'Sidebar Unchanged',
    area: 'safety',
    status: 'frozen',
    readonly: true,
    required: true,
    condition: 'must',
    evidenceRef: 'menu-registry.ts unchanged. No operator console entry in sidebar.',
    forbiddenAction: 'Do not add hidden previews to sidebar.',
    contractInterpretation: 'Sidebar configuration has not been modified.',
  },
  {
    id: 'human-restart-policy',
    title: 'Human Restart Policy Exists',
    area: 'human_review',
    status: 'frozen',
    readonly: true,
    required: true,
    condition: 'must',
    evidenceRef: 'Restart checklist doc exists. Human restart policy documented.',
    forbiddenAction: 'Do not implement auto-restart.',
    contractInterpretation: 'Server restart requires human approval and smoke checklist.',
  },
  {
    id: 'rollback-docs-exist',
    title: 'Rollback Documentation Exists',
    area: 'human_review',
    status: 'frozen',
    readonly: true,
    required: true,
    condition: 'must',
    evidenceRef: 'Rollback panel spec doc exists.',
    forbiddenAction: 'Do not execute rollback without documented procedure.',
    contractInterpretation: 'Rollback procedure is documented.',
  },
  {
    id: 'decision-record-spec',
    title: 'Decision Record Spec Exists',
    area: 'decision',
    status: 'frozen',
    readonly: true,
    required: true,
    condition: 'must',
    evidenceRef: 'AIP_STAGE_C_OPERATOR_DECISION_RECORD_SPEC.md exists.',
    forbiddenAction: 'Do not bypass decision record requirement.',
    contractInterpretation: 'Operator decision record format is defined.',
  },
  {
    id: 'evidence-requirements-doc',
    title: 'Evidence Requirements Doc Exists',
    area: 'evidence',
    status: 'frozen',
    readonly: true,
    required: true,
    condition: 'must',
    evidenceRef: 'AIP_STAGE_C_PRE_ENABLE_EVIDENCE_REQUIREMENTS.md exists.',
    forbiddenAction: 'Do not skip evidence collection before enablement.',
    contractInterpretation: 'Evidence requirements are documented.',
  },
  {
    id: 'denial-policy-exists',
    title: 'Denial Policy Exists',
    area: 'decision',
    status: 'frozen',
    readonly: true,
    required: true,
    condition: 'must',
    evidenceRef: 'AIP_STAGE_C_DENIAL_AND_BLOCKER_POLICY.md exists.',
    forbiddenAction: 'Do not override automatic denial without policy change.',
    contractInterpretation: 'Denial policy defines automatic denial triggers.',
  },
  {
    id: 'escalation-model-exists',
    title: 'Escalation Model Exists',
    area: 'human_review',
    status: 'frozen',
    readonly: true,
    required: true,
    condition: 'must',
    evidenceRef: 'AIP_STAGE_C_APPROVAL_ESCALATION_MODEL.md exists.',
    forbiddenAction: 'Do not bypass escalation process.',
    contractInterpretation: 'Approval escalation model is defined.',
  },
];

export function getContractItemCount(): number {
  return STAGE_C_READINESS_CONTRACT_REGISTRY.length;
}

export function getContractItemsByArea(area: StageCReadinessContractArea): StageCReadinessContractItem[] {
  return STAGE_C_READINESS_CONTRACT_REGISTRY.filter(i => i.area === area);
}

export function getRequiredContractItems(): StageCReadinessContractItem[] {
  return STAGE_C_READINESS_CONTRACT_REGISTRY.filter(i => i.required);
}
