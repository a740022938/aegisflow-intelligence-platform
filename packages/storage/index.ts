import fs from 'node:fs';
import path from 'node:path';

export const STORAGE_ROOTS = ['checksums', 'releases', 'staging'] as const;

export function getStorageRoot(sub?: string): string {
  const base = path.resolve(import.meta.dirname || __dirname, '.');
  return sub ? path.join(base, sub) : base;
}

export function ensureStorageDirs(): void {
  for (const dir of STORAGE_ROOTS) {
    const p = getStorageRoot(dir);
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
  }
}

export function listStorageDir(sub: string): string[] {
  const p = getStorageRoot(sub);
  if (!fs.existsSync(p)) return [];
  return fs.readdirSync(p);
}

export default { getStorageRoot, ensureStorageDirs, listStorageDir, STORAGE_ROOTS };

