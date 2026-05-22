import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { PATHS } from './paths.js';

type RootSource = 'env' | 'config' | 'marker' | 'upward-search' | 'cwd-fallback';

export interface RootResolution {
  projectRoot: string;
  source: RootSource;
  envPath?: string;
  configPath?: string;
  markerPath?: string;
  exists: boolean;
  gitAvailable: boolean;
}

function isValidDir(p?: string): p is string {
  return !!p && fs.existsSync(p) && fs.statSync(p).isDirectory();
}

function gitAvailable(cwd: string): boolean {
  try {
    execSync('git rev-parse --is-inside-work-tree', { cwd, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function readConfigHome(): string | undefined {
  try {
    if (!fs.existsSync(PATHS.configFile)) return undefined;
    const raw = fs.readFileSync(PATHS.configFile, 'utf8');
    const parsed = JSON.parse(raw) as { home?: string };
    return typeof parsed.home === 'string' ? parsed.home : undefined;
  } catch {
    return undefined;
  }
}

function resolveByMarker(): { root?: string; markerPath?: string } {
  const markerPath = 'E:\\AIP_PROJECT_ROOT.marker';
  if (!fs.existsSync(markerPath)) return {};
  try {
    const content = fs.readFileSync(markerPath, 'utf8');
    const match = content.match(/^AIP_PROJECT_ROOT=(.+)$/m);
    const root = match?.[1]?.trim();
    if (root) return { root, markerPath };
  } catch {
    // ignore parse failures and fallback
  }
  return { root: 'E:\\AIP', markerPath };
}

function resolveByUpwardSearch(start = process.cwd()): string | undefined {
  let dir = path.resolve(start);
  while (true) {
    const packageJson = path.join(dir, 'package.json');
    const gitDir = path.join(dir, '.git');
    if (fs.existsSync(packageJson) && fs.existsSync(gitDir)) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return undefined;
}

export function resolveProjectRoot(start = process.cwd()): RootResolution {
  const envPath = process.env.AIP_HOME;
  if (isValidDir(envPath)) {
    return { projectRoot: path.resolve(envPath), source: 'env', envPath, exists: true, gitAvailable: gitAvailable(envPath) };
  }

  const configHome = readConfigHome();
  if (isValidDir(configHome)) {
    return { projectRoot: path.resolve(configHome), source: 'config', configPath: PATHS.configFile, exists: true, gitAvailable: gitAvailable(configHome) };
  }

  const marker = resolveByMarker();
  if (isValidDir(marker.root)) {
    return {
      projectRoot: path.resolve(marker.root as string),
      source: 'marker',
      markerPath: marker.markerPath,
      exists: true,
      gitAvailable: gitAvailable(marker.root as string),
    };
  }

  const upward = resolveByUpwardSearch(start);
  if (upward) {
    return { projectRoot: upward, source: 'upward-search', exists: true, gitAvailable: gitAvailable(upward) };
  }

  const cwd = path.resolve(start);
  return { projectRoot: cwd, source: 'cwd-fallback', exists: fs.existsSync(cwd), gitAvailable: gitAvailable(cwd) };
}

export function getGitSummary(cwd: string): { branch: string; head: string; status: string } {
  try {
    const branch = execSync('git branch --show-current', { cwd, encoding: 'utf8', stdio: 'pipe' }).trim();
    const head = execSync('git rev-parse --short HEAD', { cwd, encoding: 'utf8', stdio: 'pipe' }).trim();
    const status = execSync('git status --short', { cwd, encoding: 'utf8', stdio: 'pipe' }).trim();
    return { branch: branch || 'detached', head: head || 'unknown', status };
  } catch {
    return { branch: 'unavailable', head: 'unknown', status: 'unknown' };
  }
}
