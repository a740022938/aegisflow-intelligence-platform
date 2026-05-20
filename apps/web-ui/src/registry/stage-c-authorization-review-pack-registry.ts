// Stage C Authorization Review Pack Registry — readonly preview of authorization requirements
// Does not accept authorization, mutate state, or enable Stage C.

export interface AuthorizationReviewPackItem {
  id: string;
  title: string;
  required: boolean;
  satisfied: boolean;
  readonly: true;
  description: string;
  operatorNote: string;
  forbiddenAction: string;
}

export const AUTHORIZATION_REVIEW_PACK_REGISTRY: AuthorizationReviewPackItem[] = [
  {
    id: 'auth-human-authorization-text',
    title: 'Required Human Authorization Text',
    required: true,
    satisfied: false,
    readonly: true,
    description: 'A clear, unambiguous written authorization from a human operator must exist before Stage C can be enabled.',
    operatorNote: 'Authorization must be in writing. Verbal or implied authorization is not valid.',
    forbiddenAction: 'Do not accept self-declared authorization or authorization inferred from prior conversations.',
  },
  {
    id: 'auth-scope-of-authorization',
    title: 'Scope of Authorization',
    required: true,
    satisfied: false,
    readonly: true,
    description: 'The authorization must explicitly state which operations are permitted and for how long.',
    operatorNote: 'Scope must be specific: what is allowed, what is excluded, and the time boundary.',
    forbiddenAction: 'Do not exceed the explicitly stated scope of authorization.',
  },
  {
    id: 'auth-expiration-timebox',
    title: 'Expiration / Timebox',
    required: true,
    satisfied: false,
    readonly: true,
    description: 'Authorization must include a clear expiration time or timebox after which it becomes invalid.',
    operatorNote: 'Timebox must be reasonable and bounded. Unlimited authorization is not permitted.',
    forbiddenAction: 'Do not accept authorization without a defined expiration.',
  },
  {
    id: 'auth-allowed-operations',
    title: 'Allowed Operations',
    required: true,
    satisfied: false,
    readonly: true,
    description: 'The authorization must list the specific operations that are permitted.',
    operatorNote: 'Default: no operations are permitted. Each must be explicitly authorized.',
    forbiddenAction: 'Do not perform operations outside the explicitly authorized list.',
  },
  {
    id: 'auth-forbidden-operations',
    title: 'Forbidden Operations',
    required: true,
    satisfied: false,
    readonly: true,
    description: 'The authorization must list operations that are explicitly forbidden.',
    operatorNote: 'Forbidden operations override allowed operations in case of conflict.',
    forbiddenAction: 'Do not perform any operation listed as forbidden, even if authorized.',
  },
  {
    id: 'auth-required-prechecks',
    title: 'Required Pre-checks',
    required: true,
    satisfied: false,
    readonly: true,
    description: 'Pre-checks must pass before authorization can be considered valid.',
    operatorNote: 'Pre-checks include: working tree clean, validation pass, safety boundary intact.',
    forbiddenAction: 'Do not proceed without completing all required pre-checks.',
  },
  {
    id: 'auth-required-smoke-tests',
    title: 'Required Smoke Tests',
    required: true,
    satisfied: false,
    readonly: true,
    description: 'Current smoke tests must pass before authorization can be acted upon.',
    operatorNote: 'Smoke tests: health, auth, tasks, queue, worker, circuit, workflow, plugin, db-diagnostics.',
    forbiddenAction: 'Do not skip smoke testing before acting on authorization.',
  },
  {
    id: 'auth-required-rollback-plan',
    title: 'Required Rollback Plan',
    required: true,
    satisfied: false,
    readonly: true,
    description: 'A rollback plan must exist before any Stage C operations can be executed.',
    operatorNote: 'The rollback plan must cover how to revert if Stage C causes issues.',
    forbiddenAction: 'Do not execute Stage C operations without a documented rollback plan.',
  },
  {
    id: 'auth-required-receipt',
    title: 'Required Receipt',
    required: true,
    satisfied: false,
    readonly: true,
    description: 'A receipt must be generated documenting the authorization and all actions taken.',
    operatorNote: 'Receipt format: phase, pre-HEAD, new commit, push, files, validation, safety, verdict.',
    forbiddenAction: 'Do not skip receipt generation for any authorized operation.',
  },
  {
    id: 'auth-no-go-conditions',
    title: 'No-go Conditions',
    required: true,
    satisfied: false,
    readonly: true,
    description: 'No-go conditions that block authorization must be enumerated and verified absent.',
    operatorNote: 'No-go: dirty worktree, validation failure, missing auth, safety violation, sidebar exposure, unverified smoke.',
    forbiddenAction: 'Do not override no-go conditions without explicit human override for each.',
  },
  {
    id: 'auth-fake-authorization-detection',
    title: 'Fake Authorization Detection',
    required: true,
    satisfied: false,
    readonly: true,
    description: 'Rules to detect and reject fake or implied authorization.',
    operatorNote: 'Fake auth includes: self-declaration, inference from chat, task packs as auth, preview as auth, "user said continue".',
    forbiddenAction: 'Do not accept any form of fake authorization. Each must be rejected.',
  },
  {
    id: 'auth-final-human-confirmation',
    title: 'Final Human Confirmation Required',
    required: true,
    satisfied: false,
    readonly: true,
    description: 'A final explicit human confirmation is required before any Stage C enablement action.',
    operatorNote: 'This is a separate step from initial authorization. It confirms readiness at enablement time.',
    forbiddenAction: 'Do not enable Stage C without receiving this final confirmation.',
  },
];

export function getAuthorizationReviewPackRegistry(): AuthorizationReviewPackItem[] {
  return AUTHORIZATION_REVIEW_PACK_REGISTRY;
}

export function getAuthorizationReviewPackSummary() {
  const items = AUTHORIZATION_REVIEW_PACK_REGISTRY;
  return {
    total: items.length,
    required: items.filter(i => i.required).length,
    satisfied: items.filter(i => i.satisfied).length,
    unsatisfied: items.filter(i => i.required && !i.satisfied).length,
  };
}
