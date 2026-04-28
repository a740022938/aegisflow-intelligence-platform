import { checkHealth } from '../health.js';
import { loadConfig } from '../config.js';
import { log } from '../logger.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function getCliVersion(): string {
  try {
    const cliPkgPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'package.json');
    if (fs.existsSync(cliPkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(cliPkgPath, 'utf8'));
      return pkg.version || 'unknown';
    }
  } catch {}
  return 'unknown';
}

export async function runVersion() {
  const config = loadConfig();
  const cliVersion = getCliVersion();

  if (config.home) {
    try {
      const health = await checkHealth(config.apiHealthUrl);
      if (health.ok) {
        log(`AIP CLI   ${cliVersion}`);
        log(`AIP Core  ${health.version}`);
        return;
      }
    } catch {}
  }

  let coreVersion = 'unknown';

  if (config.home) {
    const pkgPath = path.join(config.home, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        coreVersion = pkg.version || 'unknown';
      } catch {}
    }
  }

  log(`AIP CLI   ${cliVersion}`);
  log(`AIP Core  ${coreVersion}`);
}
