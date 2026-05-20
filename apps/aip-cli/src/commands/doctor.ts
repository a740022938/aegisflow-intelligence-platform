import { loadConfig } from '../config.js';
import { ensureAipDirs, PATHS, getProjectPackagePath } from '../paths.js';
import { isPortInUse } from '../process.js';
import { checkHealth } from '../health.js';
import { log } from '../logger.js';
import { getCliVersion } from '../version.js';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import os from 'node:os';

type CheckResult = { ok: boolean; detail: string; level?: 'PASS' | 'WARN' | 'FAIL' };

function printCheck(label: string, result: CheckResult) {
  const level = result.level || (result.ok ? 'PASS' : 'FAIL');
  const icon = level === 'PASS' ? '[PASS]' : level === 'WARN' ? '[WARN]' : '[FAIL]';
  log(`${icon.padEnd(8)} ${label.padEnd(22)} ${result.detail}`);
}

function detectShell(): string {
  const shellEnv = process.env.SHELL || '';
  if (shellEnv.includes('powershell') || shellEnv.includes('pwsh')) return 'PowerShell';
  if (shellEnv.includes('bash')) return 'Bash';
  if (shellEnv.includes('cmd')) return 'CMD';
  if (process.platform === 'win32') {
    const parent = execSync('powershell -Command "$Host.Name"', { encoding: 'utf8', stdio: 'pipe', windowsHide: true }).trim();
    if (parent) return parent;
    return 'PowerShell';
  }
  return shellEnv || 'unknown';
}

function detectCodePage(): number {
  try {
    if (process.platform === 'win32') {
      const out = execSync('chcp', { encoding: 'utf8', stdio: 'pipe', windowsHide: true }).trim();
      const match = out.match(/(\d+)/);
      if (match) return parseInt(match[1], 10);
    }
  } catch {}
  return -1;
}

function detectColorSupport(): boolean {
  if (process.env.NO_COLOR) return false;
  const term = process.env.TERM || '';
  if (term.includes('color') || term.includes('xterm')) return true;
  if (process.platform === 'win32') {
    try {
      const ver = execSync('powershell -Command "$Host.UI.RawUI.ForegroundColor"', { encoding: 'utf8', stdio: 'pipe', windowsHide: true }).trim();
      return ver.length > 0;
    } catch {}
  }
  return false;
}

function detectUnicodeSupport(): boolean {
  try {
    const buf = Buffer.from('\u4e2d\u6587', 'utf8');
    return buf.length === 6;
  } catch {
    return false;
  }
}

function detectLanguage(): string {
  return process.env.LANG || process.env.LANGUAGE || (process.platform === 'win32' ? (process.env.PSModulePath ? 'zh-CN' : 'en-US') : 'en-US');
}

function isPlainMode(): boolean {
  return process.argv.includes('--plain') || process.argv.includes('--no-color');
}

function isAsciiMode(): boolean {
  return process.argv.includes('--ascii');
}

export async function runDoctorEncoding() {
  const shell = detectShell();
  const codepage = detectCodePage();
  const colorSupported = detectColorSupport();
  const unicodeSupported = detectUnicodeSupport();
  const language = detectLanguage();
  const plain = isPlainMode() || isAsciiMode();

  log('');
  log(plain ? 'AIP Encoding Doctor' : '\x1b[36m\x1b[1mAIP Encoding Doctor\x1b[0m');
  log('');
  log(plain ? 'Terminal:' : '\x1b[1mTerminal:\x1b[0m');
  log(`  Shell: ${shell}`);
  log(`  CodePage: ${codepage > 0 ? `${codepage} ${codepage === 65001 ? 'UTF-8' : codepage === 936 ? 'GBK' : ''}` : 'unknown'}`);
  log(`  Color: ${colorSupported ? 'supported' : 'not supported'}`);
  log(`  Unicode: ${unicodeSupported ? 'supported' : 'not supported'}`);
  log(`  Language: ${language}`);
  log('');

  const pass = codepage === 65001 && colorSupported && unicodeSupported;
  if (pass) {
    log(plain ? 'PASS - 当前终端适合显示中文和彩色输出。' : '\x1b[32mPASS - 当前终端适合显示中文和彩色输出。\x1b[0m');
  } else {
    log(plain ? 'WARN - 当前终端存在显示问题。' : '\x1b[33mWARN - 当前终端存在显示问题。\x1b[0m');
  }
  log('');
  log(plain ? 'If garbled:' : '\x1b[90mIf garbled:\x1b[0m');
  log(`  1. Try: chcp 65001`);
  log(`  2. Try: aip --plain`);
  log(`  3. Try: aip --ascii`);
  log(`  4. Use Windows Terminal + Cascadia Mono / Microsoft YaHei Mono`);
}

export async function runDoctor(sub?: string) {
  const plain = isPlainMode() || isAsciiMode();

  if (sub === 'encoding') {
    await runDoctorEncoding();
    return;
  }

  if (sub === 'env') {
    log('');
    log(plain ? 'AIP Doctor - Environment' : '\x1b[36m\x1b[1mAIP Doctor - Environment\x1b[0m');
    log('');
    log(`  Node:    ${process.version}`);
    let npmVer = 'not found';
    try { npmVer = execSync('npm --version', { encoding: 'utf8', stdio: 'pipe' }).trim(); } catch {}
    log(`  npm:     v${npmVer}`);
    let pythonVer = 'not found';
    try { pythonVer = execSync('python --version', { encoding: 'utf8', stdio: 'pipe' }).trim(); } catch {}
    log(`  Python:  ${pythonVer}`);
    let gitVer = 'not found';
    try { gitVer = execSync('git --version', { encoding: 'utf8', stdio: 'pipe' }).trim(); } catch {}
    log(`  Git:     ${gitVer}`);
    log(`  OS:      ${os.platform()} ${os.release()}`);
    log(`  Arch:    ${os.arch()}`);
    return;
  }

  if (sub === 'ports') {
    const config = loadConfig();
    log('');
    log(plain ? 'AIP Doctor - Ports' : '\x1b[36m\x1b[1mAIP Doctor - Ports\x1b[0m');
    log('');
    const apiInUse = isPortInUse(config.apiPort);
    log(`  Port ${config.apiPort} (API):     ${apiInUse ? '\x1b[33min use\x1b[0m' : '\x1b[32mfree\x1b[0m'}`);
    const webInUse = isPortInUse(config.webPort);
    log(`  Port ${config.webPort} (Web):     ${webInUse ? '\x1b[33min use\x1b[0m' : '\x1b[32mfree\x1b[0m'}`);
    return;
  }

  if (sub === 'stage-c') {
    log('');
    log(plain ? 'AIP Doctor - Stage C' : '\x1b[36m\x1b[1mAIP Doctor - Stage C\x1b[0m');
    log('');
    log(plain ? '  Stage C: DISABLED' : '  Stage C: \x1b[33mDISABLED\x1b[0m');
    log(plain ? '  Feature Flag: OFF' : '  Feature Flag: \x1b[33mOFF\x1b[0m');
    log(plain ? '  POST runtime: NOT IMPLEMENTED' : '  POST runtime: \x1b[32mNOT IMPLEMENTED\x1b[0m');
    log(plain ? '  Status: SAFE' : '  Status: \x1b[32mSAFE\x1b[0m');
    return;
  }

  ensureAipDirs();
  const config = loadConfig();

  log(`AIP Doctor v${getCliVersion()}`);
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
