import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ENV_KEY = 'AIP_WORKSPACE_ROOT';

function findRepoRoot(): string {
  if (process.env.AIP_REPO_ROOT) return process.env.AIP_REPO_ROOT;
  const cwd = process.cwd();
  const candidates = [
    cwd,
    resolve(cwd, '..'),
    resolve(cwd, '../..'),
    resolve(__dirname, '..'),
    resolve(__dirname, '../..'),
    resolve(__dirname, '../../..'),
    resolve(__dirname, '../../../..'),
  ];
  for (const c of candidates) {
    if (existsSync(join(c, 'package.json')) && existsSync(join(c, 'workers', 'python-worker'))) return c;
  }
  return resolve(cwd, '../..');
}

function getWorkspaceRoot(): string {
  if (process.env[ENV_KEY]) return process.env[ENV_KEY];
  return join(findRepoRoot(), 'runtime');
}

function getRepoRoot(): string {
  return findRepoRoot();
}

function resolveWorkspacePath(...segments: string[]): string {
  return join(getWorkspaceRoot(), ...segments);
}

export {
  getWorkspaceRoot,
  getRepoRoot,
  resolveWorkspacePath,
  ENV_KEY,
};
