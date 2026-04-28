import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

function aipDir() { return path.join(os.homedir(), '.aip'); }
function ensureDir(p: string) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

export const PATHS = {
  aipDir: aipDir(),
  configFile: path.join(aipDir(), 'config.json'),
  runtimeDir: path.join(aipDir(), 'runtime'),
  logsDir: path.join(aipDir(), 'logs'),
  cacheDir: path.join(aipDir(), 'cache'),
  apiPidFile: path.join(aipDir(), 'runtime', 'api.pid'),
  webPidFile: path.join(aipDir(), 'runtime', 'web.pid'),
  gatewayPidFile: path.join(aipDir(), 'runtime', 'gateway.pid'),
  stateFile: path.join(aipDir(), 'runtime', 'state.json'),
  apiLogFile: path.join(aipDir(), 'logs', 'api.log'),
  webLogFile: path.join(aipDir(), 'logs', 'web.log'),
  gatewayLogFile: path.join(aipDir(), 'logs', 'gateway.log'),
};

export function ensureAipDirs() {
  ensureDir(PATHS.aipDir);
  ensureDir(PATHS.runtimeDir);
  ensureDir(PATHS.logsDir);
  ensureDir(PATHS.cacheDir);
}

export function getProjectPackagePath(home: string) {
  return path.join(home, 'package.json');
}
