import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function getCliVersion(): string {
  try {
    const cliPkgPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'package.json');
    if (fs.existsSync(cliPkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(cliPkgPath, 'utf8'));
      return pkg.version || 'unknown';
    }
  } catch {}
  return 'unknown';
}
