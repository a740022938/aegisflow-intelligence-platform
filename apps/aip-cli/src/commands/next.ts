import { execSync } from 'node:child_process';

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

export async function runNext() {
  console.log('');
  console.log('Recommended Next Step');
  console.log('=====================');
  console.log('');
  console.log('  v7.48-P3 Local RC Dry Run + Fresh Start Rehearsal');
  console.log('');
  console.log('  Steps:');
  console.log('    1. Verify pnpm install from clean state');
  console.log('    2. Verify pnpm run aip:cli:build');
  console.log('    3. Verify aip / aip where / aip safe-status');
  console.log('    4. Verify aip next / aip release-status');
  console.log('    5. Verify pnpm run typecheck');
  console.log('    6. Verify pnpm run build');
  console.log('    7. Verify restore remains plan-only');
  console.log('    8. Generate dry run evidence');
  console.log('');
  console.log('  Do NOT:');
  console.log('    - enable Stage C');
  console.log('    - toggle feature flag');
  console.log('    - create tag');
  console.log('    - create GitHub Release');
  console.log('    - execute restore');
  console.log('    - restart/taskkill services');
  console.log('');
  console.log('  This is a readonly command. No files were modified.');
}
