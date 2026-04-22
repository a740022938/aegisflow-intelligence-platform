import fs from 'node:fs';
import path from 'node:path';

function findPackageJson(startDir: string): string | null {
  let current = path.resolve(startDir);
  let nearest: string | null = null;
  while (true) {
    const candidate = path.join(current, 'package.json');
    if (fs.existsSync(candidate)) {
      nearest = nearest || candidate;
      try {
        const parsed = JSON.parse(fs.readFileSync(candidate, 'utf8')) as { name?: string };
        if (parsed.name === 'agi-model-factory') return candidate;
      } catch {}
    }
    const parent = path.dirname(current);
    if (parent === current) return nearest;
    current = parent;
  }
}

function readVersion(): string {
  const pkgPath = findPackageJson(process.cwd());
  if (!pkgPath) return '0.0.0';
  try {
    const raw = fs.readFileSync(pkgPath, 'utf8');
    const parsed = JSON.parse(raw) as { version?: string };
    return String(parsed.version || '0.0.0');
  } catch {
    return '0.0.0';
  }
}

export const APP_VERSION = readVersion();
