import { loadConfig } from '../config.js';
import { checkHealth } from '../health.js';
import { log, fail } from '../logger.js';

export async function runHealth() {
  const config = loadConfig();
  const result = await checkHealth(config.apiHealthUrl);

  if (!result.ok) {
    log('API offline. Run: aip start');
    return;
  }

  log(`Status    ${result.ok ? 'healthy' : 'unhealthy'}`);
  log(`Version   ${result.version}`);
  log(`DB        ${result.db}`);
  log(`Time      ${new Date().toISOString()}`);
}
