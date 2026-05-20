import { execSync } from 'node:child_process';
import { getCliVersion } from '../version.js';

function runGit(args: string): string {
  try {
    return execSync(`git ${args}`, { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch {
    return 'unavailable';
  }
}

function getTagStatus(): string {
  const tags = runGit('tag --points-at HEAD');
  return tags ? tags : 'NOT CREATED';
}

export async function runReleaseStatus() {
  const ver = getCliVersion();
  const branch = runGit('branch --show-current');
  const head = runGit('rev-parse --short HEAD');
  const tagStatus = getTagStatus();

  console.log('');
  console.log('Release Status');
  console.log('==============');
  console.log('');
  console.log(`  CLI Version:       ${ver}`);
  console.log(`  Track:             v7.48 Local RC Candidate`);
  console.log(`  Git Branch:        ${branch}`);
  console.log(`  Git HEAD:          ${head}`);
  console.log(`  Tag at HEAD:       ${tagStatus}`);
  console.log(`  GitHub Release:    NOT CREATED`);
  console.log(`  Stage C:           DISABLED`);
  console.log(`  Feature Flag:      OFF`);
  console.log(`  Restore Mode:      PLAN-ONLY`);
  console.log(`  Release Type:      Local RC Candidate (not a GitHub Release)`);
  console.log('');
  console.log('  Deferred Items:');
  console.log('    - .env.local: doc-only (no credential rotation)');
  console.log('    - PowerShell codepage 936: out of scope');
  console.log('    - Full sidebar migration: post-v7.47');
  console.log('');
  console.log('  Tag/Release Policy:');
  console.log('    No tag or GitHub Release may be created during v7.48.');
  console.log('    See AIP_V7_48_RELEASE_BOUNDARY_POLICY.md for details.');
  console.log('');
  console.log('  This is a readonly command. No files were modified.');
}
