import { loadConfig } from '../config.js';
import { ensureAipDirs, PATHS, getProjectPackagePath } from '../paths.js';
import { spawnDetached, writePidFile, waitForPort, waitForHealth, isPortInUse } from '../process.js';
import { checkHealth } from '../health.js';
import { log, ok, warn, fail, info } from '../logger.js';
import fs from 'node:fs';
import path from 'node:path';

export async function runStart() {
  ensureAipDirs();
  const config = loadConfig();

  if (!config.home) {
    log('Home not set. Run: aip config set home <path>');
    return;
  }

  if (!fs.existsSync(config.home)) {
    fail(`Home directory not found: ${config.home}`);
    return;
  }

  const pkgPath = getProjectPackagePath(config.home);
  if (!fs.existsSync(pkgPath)) {
    fail(`package.json not found in ${config.home}`);
    return;
  }

  let apiOnline = false;
  let webOnline = false;

  if (isPortInUse(config.apiPort)) {
    warn(`API already online on port ${config.apiPort}`);
    apiOnline = true;
  } else {
    info(`Starting API on port ${config.apiPort}...`);
    const apiResult = await spawnDetached('pnpm', ['run', 'dev:api'], config.home, PATHS.apiLogFile);
    if (apiResult.ok && apiResult.pid) {
      writePidFile(PATHS.apiPidFile, apiResult.pid);
      info(`API spawned (pid ${apiResult.pid})`);
    } else {
      fail(`Failed to start API: ${apiResult.error || 'unknown error'}`);
    }
  }

  if (isPortInUse(config.webPort)) {
    warn(`Web already online on port ${config.webPort}`);
    webOnline = true;
  } else {
    info(`Starting Web on port ${config.webPort}...`);
    const webResult = await spawnDetached('pnpm', ['run', 'dev:web'], config.home, PATHS.webLogFile);
    if (webResult.ok && webResult.pid) {
      writePidFile(PATHS.webPidFile, webResult.pid);
      info(`Web spawned (pid ${webResult.pid})`);
    } else {
      fail(`Failed to start Web: ${webResult.error || 'unknown error'}`);
    }
  }

  if (!apiOnline) {
    info('Waiting for API port...');
    apiOnline = await waitForPort(config.apiPort, 30000);
    if (apiOnline) {
      ok('API port responding');
      info('Waiting for API health...');
      const healthy = await waitForHealth(config.apiHealthUrl, 30000);
      if (!healthy) {
        warn('API health check failed (may still be starting)');
      }
    } else {
      warn(`API did not become available on port ${config.apiPort} within 30s`);
    }
  }

  if (!webOnline) {
    info('Waiting for Web port...');
    webOnline = await waitForPort(config.webPort, 30000);
    if (webOnline) {
      ok('Web port responding');
    } else {
      warn(`Web did not become available on port ${config.webPort} within 30s`);
    }
  }

  let dbStatus = 'unknown';
  if (apiOnline) {
    const health = await checkHealth(config.apiHealthUrl);
    dbStatus = health.ok ? (health.db === 'ok' ? 'ok' : health.db) : 'unknown';
  }

  log('');
  log('AIP Gateway online');
  log(`API     http://${config.host}:${config.apiPort}    ${apiOnline ? 'online' : 'offline'}`);
  log(`Web     http://${config.host}:${config.webPort}    ${webOnline ? 'online' : 'offline'}`);
  log(`DB      ${dbStatus}`);
  log('Version 7.1.0');
}
