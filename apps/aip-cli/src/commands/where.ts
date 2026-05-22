import { resolveProjectRoot, getGitSummary } from '../projectRoot.js';
import { PATHS } from '../paths.js';

export async function runWhere() {
  const resolved = resolveProjectRoot();
  const git = getGitSummary(resolved.projectRoot);

  console.log('');
  console.log('AIP Where');
  console.log('=========');
  console.log('');
  console.log(`  Current Dir:           ${process.cwd()}`);
  console.log(`  Project Root:          ${resolved.projectRoot}`);
  console.log(`  Root Source:           ${resolved.source}`);
  console.log(`  Root Exists:           ${resolved.exists ? 'yes' : 'no'}`);
  console.log(`  Config File:           ${PATHS.configFile}`);
  if (resolved.markerPath) console.log(`  Marker File:           ${resolved.markerPath}`);
  console.log(`  Git Available:         ${resolved.gitAvailable ? 'yes' : 'no'}`);
  console.log(`  Git Branch:            ${git.branch}`);
  console.log(`  Git HEAD:              ${git.head}`);
  console.log(`  Git Status Summary:    ${git.status === 'unknown' ? 'unknown' : (git.status ? 'DIRTY' : 'CLEAN')}`);
  console.log('');
  console.log('  This is a readonly command. No files were modified.');
}
