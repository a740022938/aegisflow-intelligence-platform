import { execSync } from 'node:child_process';
import fs from 'node:fs';

function runGit(args: string): string {
  try {
    return execSync(`git ${args}`, { encoding: 'utf8', stdio: 'pipe', cwd: process.cwd() }).trim();
  } catch {
    return 'unknown';
  }
}

export async function runWhere() {
  const branch = runGit('branch --show-current');
  const head = runGit('rev-parse --short HEAD');
  const status = runGit('status --short');
  const workingTree = status ? 'DIRTY' : 'CLEAN';

  console.log('');
  console.log('AIP Where');
  console.log('=========');
  console.log('');
  console.log(`  AIP Home:       ${process.cwd()}`);
  console.log(`  Branch:         ${branch}`);
  console.log(`  HEAD:           ${head}`);
  console.log(`  Working Tree:   ${workingTree}`);
  console.log(`  Reports:        E:\\_AIP_REPORTS`);
  console.log(`  Receipts:       E:\\_AIP_RECEIPTS`);
  console.log(`  Restore Points: E:\\_AIP_RESTORE_POINTS`);
  console.log('');
  console.log('  This is a readonly command. No files were modified.');
}
