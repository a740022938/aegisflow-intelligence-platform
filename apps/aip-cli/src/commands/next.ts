import { execSync } from 'node:child_process';

function runGit(args: string): string {
  try {
    return execSync(`git ${args}`, { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch {
    return 'unavailable';
  }
}

export async function runNext() {
  console.log('');
  console.log('Recommended Next Step');
  console.log('=====================');
  console.log('');
  console.log('  OpenAIP v8 Next Phase:');
  console.log('    P2-P5 Readonly Command Center Expansion');
  console.log('');
  console.log('  Completed:');
  console.log('    ✓ P1A-P1E CLI Identity + Foundation Docs');
  console.log('    ✓ Phase E Hidden Command Center Preview UI');
  console.log('    ✓ P2A-P5B CLI readonly commands (agents/providers/integrations/apps/runtime/task/audit/policy)');
  console.log('');
  console.log('  Suggested:');
  console.log('    1. Run aip task list / aip audit list / aip policy list');
  console.log('    2. Run pnpm run typecheck && pnpm run build');
  console.log('    3. Run the CLI tests');
  console.log('    4. Verify Page: /openaip-v8-command-center-preview');
  console.log('');
  console.log('  Do NOT:');
  console.log('    - enable Stage C');
  console.log('    - toggle feature flag');
  console.log('    - create tag or release');
  console.log('    - execute restore');
  console.log('    - restart/taskkill services');
  console.log('    - modify Auth/Gate implementation');
  console.log('    - write DB or migrate');
  console.log('');
  console.log('  This is a readonly command. No files were modified.');
}
