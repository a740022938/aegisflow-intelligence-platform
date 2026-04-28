import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export interface ProcessResult {
  pid: number;
  ok: boolean;
  error?: string;
}

export function killByPid(pid: number): boolean {
  try {
    if (os.platform() === 'win32') {
      execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'pipe', windowsHide: true });
    } else {
      process.kill(pid, 'SIGTERM');
    }
    return true;
  } catch {
    return false;
  }
}

export function killByPidFile(pidFile: string): boolean {
  if (!fs.existsSync(pidFile)) return false;
  try {
    const pid = parseInt(fs.readFileSync(pidFile, 'utf8').trim(), 10);
    if (!pid || isNaN(pid)) return false;
    const killed = killByPid(pid);
    if (killed) {
      try { fs.unlinkSync(pidFile); } catch {}
    }
    return killed;
  } catch {
    return false;
  }
}

export function writePidFile(file: string, pid: number) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, String(pid), 'utf8');
}

export function readPidFile(file: string): number | null {
  if (!fs.existsSync(file)) return null;
  try {
    const pid = parseInt(fs.readFileSync(file, 'utf8').trim(), 10);
    return pid && !isNaN(pid) ? pid : null;
  } catch {
    return null;
  }
}

export function isPortInUse(port: number): boolean {
  try {
    if (os.platform() === 'win32') {
      const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: 'pipe', windowsHide: true }).trim();
      return result.split(/\r?\n/).some(line => line.includes(`:${port}`) && /\bLISTENING\b/.test(line));
    } else {
      const result = execSync(`lsof -i :${port} -t`, { encoding: 'utf8', stdio: 'pipe' }).trim();
      return result.length > 0;
    }
  } catch {
    return false;
  }
}

export function isProcessAlive(pid: number): boolean {
  try {
    if (os.platform() === 'win32') {
      execSync(`tasklist /FI "PID eq ${pid}"`, { stdio: 'pipe', windowsHide: true });
      return true;
    } else {
      process.kill(pid, 0);
      return true;
    }
  } catch {
    return false;
  }
}

export function spawnDetached(command: string, args: string[], cwd: string, logFile: string): Promise<ProcessResult> {
  return new Promise((resolve) => {
    try {
      const logDir = path.dirname(logFile);
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      
      const out = fs.openSync(logFile, 'a');
      const err = fs.openSync(logFile, 'a');
      
      const child = spawn(command, args, {
        cwd,
        detached: true,
        stdio: ['ignore', out, err],
        shell: true,
        windowsHide: true,
      });
      
      child.on('error', (err) => {
        resolve({ pid: 0, ok: false, error: err.message });
      });
      
      if (child.pid) {
        child.unref();
        resolve({ pid: child.pid, ok: true });
      } else {
        resolve({ pid: 0, ok: false, error: 'Failed to spawn process' });
      }
    } catch (e: any) {
      resolve({ pid: 0, ok: false, error: e.message });
    }
  });
}

export function waitForPort(port: number, timeoutMs: number = 30000): Promise<boolean> {
  const start = Date.now();
  return new Promise((resolve) => {
    const check = () => {
      if (isPortInUse(port)) return resolve(true);
      if (Date.now() - start > timeoutMs) return resolve(false);
      setTimeout(check, 500);
    };
    check();
  });
}

export async function waitForHealth(url: string, timeoutMs: number = 30000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return true;
    } catch {}
    await new Promise(r => setTimeout(r, 1000));
  }
  return false;
}
