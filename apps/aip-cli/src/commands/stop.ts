import { loadConfig } from '../config.js';
import { ensureAipDirs, PATHS } from '../paths.js';
import { killByPidFile, killByPid } from '../process.js';
import { log, ok } from '../logger.js';
import fs from 'node:fs';
import os from 'node:os';
import { execSync } from 'node:child_process';

function killByPort(port: number): boolean {
  try {
    if (os.platform() === 'win32') {
      const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: 'pipe', windowsHide: true }).trim();
      const lines = result.split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parseInt(parts[parts.length - 1], 10);
        if (pid && !isNaN(pid)) {
          killByPid(pid);
        }
      }
      return true;
    } else {
      const result = execSync(`lsof -i :${port} -t`, { encoding: 'utf8', stdio: 'pipe' }).trim();
      if (result) {
        const pids = result.split('\n');
        for (const p of pids) {
          const pid = parseInt(p.trim(), 10);
          if (pid && !isNaN(pid)) {
            killByPid(pid);
          }
        }
        return true;
      }
      return false;
    }
  } catch {
    return false;
  }
}

function cleanupPidFile(pidFile: string) {
  try {
    if (fs.existsSync(pidFile)) fs.unlinkSync(pidFile);
  } catch {}
}

export async function runStop() {
  ensureAipDirs();
  const config = loadConfig();
  let stopped = false;

  const apiKilled = killByPidFile(PATHS.apiPidFile);
  if (apiKilled) {
    ok('API stopped');
    stopped = true;
  }
  killByPort(config.apiPort);

  const webKilled = killByPidFile(PATHS.webPidFile);
  if (webKilled) {
    ok('Web stopped');
    stopped = true;
  }
  killByPort(config.webPort);

  ok('Port cleanup complete');

  const gatewayKilled = killByPidFile(PATHS.gatewayPidFile);
  if (gatewayKilled) {
    ok('Gateway stopped');
    stopped = true;
  }

  cleanupPidFile(PATHS.apiPidFile);
  cleanupPidFile(PATHS.webPidFile);
  cleanupPidFile(PATHS.gatewayPidFile);

  if (stopped) {
    log('AIP services stopped');
  } else {
    log('No AIP services were running');
  }
}
