import { loadConfig } from '../config.js';
import { readPidFile, isProcessAlive, isPortInUse } from '../process.js';
import { PATHS } from '../paths.js';
import { checkHealth } from '../health.js';
import { log } from '../logger.js';

export async function runStatus() {
  const config = loadConfig();

  const apiPid = readPidFile(PATHS.apiPidFile);
  const webPid = readPidFile(PATHS.webPidFile);
  const apiAlive = apiPid ? isProcessAlive(apiPid) : false;
  const webAlive = webPid ? isProcessAlive(webPid) : false;
  const apiPortActive = isPortInUse(config.apiPort);
  const webPortActive = isPortInUse(config.webPort);

  let healthStatus = 'offline';
  let dbStatus = 'unknown';
  try {
    const health = await checkHealth(config.apiHealthUrl);
    healthStatus = health.ok ? 'online' : 'offline';
    dbStatus = health.ok ? (health.db === 'ok' ? 'ok' : health.db) : 'unknown';
  } catch {
    healthStatus = 'offline';
  }

  log('');
  log('AIP Status');
  log(`Config   ${config.home || '(not set)'}`);
  log(`API PID  ${apiPid ?? 'none'} (${apiAlive ? 'running' : 'stopped'})`);
  log(`Web PID  ${webPid ?? 'none'} (${webAlive ? 'running' : 'stopped'})`);
  log(`API Port ${config.apiPort} (${apiPortActive ? 'in use' : 'free'})`);
  log(`Web Port ${config.webPort} (${webPortActive ? 'in use' : 'free'})`);
  log(`Health   ${healthStatus}`);
  log(`DB       ${dbStatus}`);
  log('Version  7.1.0');
  log(`Logs     ${PATHS.logsDir}`);
}
