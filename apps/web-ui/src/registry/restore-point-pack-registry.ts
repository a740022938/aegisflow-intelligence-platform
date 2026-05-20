// Restore Point Pack Registry — readonly registry for restore point pack
// Does not execute file operations, modify state, or capture secrets.

export interface RestorePointPackItem {
  id: string;
  title: string;
  section: 'design' | 'policy' | 'safety';
  readonly: true;
  description: string;
  status: 'specified' | 'pending' | 'plan-only';
  safetyNote: string;
}

export const RESTORE_POINT_PACK_REGISTRY: RestorePointPackItem[] = [
  {
    id: 'rp-directory-structure',
    title: 'Directory Structure',
    section: 'design',
    readonly: true,
    description: 'E:\\_AIP_RESTORE_POINTS\\AIP_v7.45_<commit>_<YYYYMMDD>\\ with manifest, hash, policy, exclusions, readme.',
    status: 'specified',
    safetyNote: 'Plan-only. No directory created during v7.45.',
  },
  {
    id: 'rp-manifest-format',
    title: 'Manifest Format',
    section: 'design',
    readonly: true,
    description: 'source-manifest.json with version, commit, date, files (path+sha256+size), excluded, totals.',
    status: 'specified',
    safetyNote: 'JSON format. No file scanning during v7.45.',
  },
  {
    id: 'rp-hash-format',
    title: 'Hash File Format',
    section: 'design',
    readonly: true,
    description: 'source-sha256.txt with one SHA256 hash per line using binary mode (* prefix).',
    status: 'specified',
    safetyNote: 'SHA256 verification required before any restore.',
  },
  {
    id: 'rp-exclusion-list',
    title: 'Exclusion List',
    section: 'policy',
    readonly: true,
    description: 'Excludes .env, node_modules/, dist/, build/, .cache/, logs, *.db, secrets, IDE files.',
    status: 'specified',
    safetyNote: 'Secrets must never be captured in restore point.',
  },
  {
    id: 'rp-validation-requirements',
    title: 'Validation Requirements',
    section: 'policy',
    readonly: true,
    description: '9 pre-restore validations (manifest, hash, clean tree, backup, confirmation, receipt).',
    status: 'specified',
    safetyNote: 'All validations must pass before restore is allowed.',
  },
  {
    id: 'rp-pre-restore-checks',
    title: 'Pre-Restore Checks',
    section: 'safety',
    readonly: true,
    description: 'Restore point exists, manifest valid, hashes match, working tree clean, backup current, human confirmation.',
    status: 'specified',
    safetyNote: 'Any failed check blocks restore. No automatic retry.',
  },
  {
    id: 'rp-post-restore-checks',
    title: 'Post-Restore Checks',
    section: 'safety',
    readonly: true,
    description: 'SHA256 re-verify, git status, typecheck, tests, build must all pass.',
    status: 'specified',
    safetyNote: 'Post-restore failure requires rollback to backup.',
  },
  {
    id: 'rp-source-restore-blocked',
    title: 'Source Restore Blocked',
    section: 'safety',
    readonly: true,
    description: 'Source restore is blocked unless explicitly authorized by human operator.',
    status: 'specified',
    safetyNote: 'Source restore remains blocked throughout v7.45.',
  },
  {
    id: 'rp-full-restore-forbidden',
    title: 'Full Restore Forbidden',
    section: 'safety',
    readonly: true,
    description: 'Full restore is forbidden by default. Requires separate human authorization.',
    status: 'specified',
    safetyNote: 'Full restore forbidden throughout v7.45.',
  },
  {
    id: 'rp-receipt-required',
    title: 'Receipt Required After Restore',
    section: 'safety',
    readonly: true,
    description: 'A receipt must be generated documenting any restore operation.',
    status: 'specified',
    safetyNote: 'Documentation mandatory. No receipt = no restore.',
  },
];

export function getRestorePointPackRegistry(): RestorePointPackItem[] {
  return RESTORE_POINT_PACK_REGISTRY;
}

export function getRestorePointPackSummary() {
  const items = RESTORE_POINT_PACK_REGISTRY;
  return {
    total: items.length,
    design: items.filter(i => i.section === 'design').length,
    policy: items.filter(i => i.section === 'policy').length,
    safety: items.filter(i => i.section === 'safety').length,
  };
}
