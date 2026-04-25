import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

function resolveRepoRoot(): string {
  if (process.env.AIP_REPO_ROOT) return process.env.AIP_REPO_ROOT;
  const candidates = [
    process.cwd(),
    resolve(process.cwd(), '..'),
    resolve(process.cwd(), '../..'),
    resolve(__dirname, '..'),
    resolve(__dirname, '../..'),
    resolve(__dirname, '../../..'),
    resolve(__dirname, '../../../..'),
  ];
  for (const c of candidates) {
    if (existsSync(join(c, 'workers', 'python-worker'))) return c;
  }
  return resolve(process.cwd(), '../..');
}

function resolveDataRoot(): string {
  if (process.env.AGI_FACTORY_ROOT) return process.env.AGI_FACTORY_ROOT;
  return resolveRepoRoot();
}

function resolveWorkerPath(scriptName: string): string {
  return join(resolveRepoRoot(), 'workers', 'python-worker', scriptName);
}

function resolveRunDir(kind: string, id: string): string {
  const safeId = (id || '').replace(/[^a-zA-Z0-9]/g, '');
  return join(resolveDataRoot(), 'runs', kind, `${kind}_${safeId}`);
}

function resolveCheckpoint(name: string): string {
  const customPath = process.env[`AIP_CHECKPOINT_${name.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`];
  if (customPath) return customPath;
  return join(resolveDataRoot(), 'checkpoints', name);
}

function resolveDatasetDir(datasetId: string): string {
  return join(resolveDataRoot(), 'datasets', datasetId);
}

function resolveOutputsDir(sub?: string): string {
  const base = join(resolveDataRoot(), 'outputs');
  return sub ? join(base, sub) : base;
}

export {
  resolveRepoRoot,
  resolveDataRoot,
  resolveWorkerPath,
  resolveRunDir,
  resolveCheckpoint,
  resolveDatasetDir,
  resolveOutputsDir,
};
