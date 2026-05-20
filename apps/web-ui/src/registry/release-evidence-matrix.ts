// Release Evidence Matrix — v7.45 release readiness evidence
// Readonly evidence log. Does not execute operations or modify state.

export interface ReleaseEvidenceEntry {
  id: string;
  category: 'version' | 'validation' | 'safety' | 'restore_point' | 'gate_review' | 'artifact' | 'seal';
  label: string;
  status: 'pass' | 'fail' | 'pending' | 'na';
  detail: string;
  evidence: string;
}

export const RELEASE_EVIDENCE_MATRIX: ReleaseEvidenceEntry[] = [
  {
    id: 'ev-version',
    category: 'version',
    label: 'Version Tag',
    status: 'pass',
    detail: 'v7.45 — main branch',
    evidence: 'git log --oneline -1',
  },
  {
    id: 'ev-health',
    category: 'validation',
    label: 'API Health Check',
    status: 'pass',
    detail: 'PASS — health check returns ok',
    evidence: 'Invoke-RestMethod http://127.0.0.1:8787/api/health',
  },
  {
    id: 'ev-typecheck',
    category: 'validation',
    label: 'TypeScript Typecheck',
    status: 'pass',
    detail: 'PASS — local-api + web-ui tsc --noEmit',
    evidence: 'npm run typecheck',
  },
  {
    id: 'ev-test',
    category: 'validation',
    label: 'Test Suite',
    status: 'pass',
    detail: 'PASS — all tests pass',
    evidence: 'npm test',
  },
  {
    id: 'ev-build',
    category: 'validation',
    label: 'Build',
    status: 'pass',
    detail: 'PASS — web-ui build completes',
    evidence: 'npm run build',
  },
  {
    id: 'ev-stage-c',
    category: 'safety',
    label: 'Stage C Disabled',
    status: 'pass',
    detail: 'stageCEnabled: false, featureFlag: off',
    evidence: 'Invoke-RestMethod http://127.0.0.1:8787/api/stage-c/status',
  },
  {
    id: 'ev-post-blocked',
    category: 'safety',
    label: 'POST Blocked',
    status: 'pass',
    detail: 'POST to /api/stage-c/status returns 404',
    evidence: 'Invoke-RestMethod -Method Post ...  # Expect 404',
  },
  {
    id: 'ev-restore-point',
    category: 'restore_point',
    label: 'Restore Point Pack',
    status: 'pass',
    detail: '10 items: 3 design, 3 policy, 4 safety. All specified.',
    evidence: 'getRestorePointPackSummary()',
  },
  {
    id: 'ev-restore-point-validator',
    category: 'restore_point',
    label: 'Restore Point Validator',
    status: 'pass',
    detail: 'PASS — all required items present, all readonly, all have safety notes',
    evidence: 'validateRestorePointPack()',
  },
  {
    id: 'ev-gate-checklist',
    category: 'gate_review',
    label: 'Gate Checklist',
    status: 'pass',
    detail: 'All 24 pre-release checklist items pass',
    evidence: 'AIP_V7_45_RELEASE_READINESS_CHECKLIST.md',
  },
  {
    id: 'ev-docs',
    category: 'artifact',
    label: 'Documentation',
    status: 'pass',
    detail: '17 product docs in docs/product/',
    evidence: 'ls docs/product/AIP_V7_45_*.md',
  },
  {
    id: 'ev-seal',
    category: 'seal',
    label: 'Seal Signoff',
    status: 'pass',
    detail: 'Final seal recheck: PASS — all evidence verified',
    evidence: 'aip safe-status (v7.45 P5)',
  },
];

export function getReleaseEvidenceMatrix(): ReleaseEvidenceEntry[] {
  return RELEASE_EVIDENCE_MATRIX;
}

export function getReleaseEvidenceSummary() {
  const items = RELEASE_EVIDENCE_MATRIX;
  return {
    total: items.length,
    pass: items.filter(i => i.status === 'pass').length,
    fail: items.filter(i => i.status === 'fail').length,
    pending: items.filter(i => i.status === 'pending').length,
    na: items.filter(i => i.status === 'na').length,
  };
}
