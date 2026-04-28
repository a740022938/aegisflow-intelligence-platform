import { loadConfig } from '../config.js';
import { ensureAipDirs, PATHS, getProjectPackagePath } from '../paths.js';
import { isPortInUse } from '../process.js';
import { checkHealth } from '../health.js';
import { log } from '../logger.js';
import fs from 'node:fs';
import { execSync } from 'node:child_process';

type CheckResult = { ok: boolean; detail: string; level?: 'PASS' | 'WARN' | 'FAIL' };

function printCheck(label: string, result: CheckResult) {
  const level = result.level || (result.ok ? 'PASS' : 'FAIL');
  const icon = level === 'PASS' ? '[PASS]' : level === 'WARN' ? '[WARN]' : '[FAIL]';
  log(`${icon.padEnd(8)} ${label.padEnd(22)} ${result.detail}`);
}

export async function runDoctor() {
  ensureAipDirs();
  const config = loadConfig();

  log('AIP Doctor v7.1.0');
  log('');

  printCheck('~/.aip exists', {
    ok: fs.existsSync(PATHS.aipDir),
    detail: fs.existsSync(PATHS.aipDir) ? PATHS.aipDir : 'not found',
  });

  printCheck('config.json', {
    ok: fs.existsSync(PATHS.configFile),
    detail: fs.existsSync(PATHS.configFile) ? 'exists' : 'not found',
  });

  const homeOk = !!config.home && fs.existsSync(config.home);
  printCheck('config.home', {
    ok: homeOk,
    detail: config.home || '(not set)',
    level: config.home ? (homeOk ? 'PASS' : 'FAIL') : 'FAIL',
  });

  const pkgExists = config.home ? fs.existsSync(getProjectPackagePath(config.home)) : false;
  printCheck('package.json in home', {
    ok: pkgExists,
    detail: !config.home ? 'config.home not set' : (pkgExists ? 'found' : 'not found'),
    level: !config.home ? 'FAIL' : (pkgExists ? 'PASS' : 'FAIL'),
  });

  printCheck('node available', {
    ok: true,
    detail: process.version,
  });

  let pnpmOk = false;
  let pnpmDetail = 'not found';
  try {
    const ver = execSync('pnpm --version', { encoding: 'utf8', stdio: 'pipe' }).trim();
    pnpmOk = true;
    pnpmDetail = `v${ver}`;
  } catch {}
  printCheck('pnpm available', {
    ok: pnpmOk,
    detail: pnpmDetail,
    level: pnpmOk ? 'PASS' : 'FAIL',
  });

  const apiPortInUse = isPortInUse(config.apiPort);
  printCheck(`apiPort ${config.apiPort}`, {
    ok: !apiPortInUse,
    detail: apiPortInUse ? 'in use' : 'free',
    level: apiPortInUse ? 'WARN' : 'PASS',
  });

  const webPortInUse = isPortInUse(config.webPort);
  printCheck(`webPort ${config.webPort}`, {
    ok: !webPortInUse,
    detail: webPortInUse ? 'in use' : 'free',
    level: webPortInUse ? 'WARN' : 'PASS',
  });

  let healthOk = false;
  let healthDetail = 'offline';
  try {
    const health = await checkHealth(config.apiHealthUrl);
    healthOk = health.ok;
    healthDetail = health.ok ? `online (${health.version})` : 'offline';
  } catch {}
  printCheck('API health', {
    ok: healthOk,
    detail: healthDetail,
    level: healthOk ? 'PASS' : 'WARN',
  });

  let logsWritable = false;
  try {
    fs.accessSync(PATHS.logsDir, fs.constants.W_OK);
    logsWritable = true;
  } catch {}
  printCheck('logs dir writable', {
    ok: logsWritable,
    detail: logsWritable ? PATHS.logsDir : 'not writable',
    level: logsWritable ? 'PASS' : 'FAIL',
  });

  let runtimeWritable = false;
  try {
    fs.accessSync(PATHS.runtimeDir, fs.constants.W_OK);
    runtimeWritable = true;
  } catch {}
  printCheck('runtime dir writable', {
    ok: runtimeWritable,
    detail: runtimeWritable ? PATHS.runtimeDir : 'not writable',
    level: runtimeWritable ? 'PASS' : 'FAIL',
  });

  log('');
  log('Doctor check complete.');
}
