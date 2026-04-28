import fs from 'node:fs';
import os from 'node:os';
import { PATHS, ensureAipDirs } from './paths.js';
import type { AipConfig } from './index.js';

export type { AipConfig };

const DEFAULT_CONFIG: AipConfig = {
  home: '',
  apiPort: 8787,
  webPort: 5173,
  host: '127.0.0.1',
  apiCommand: 'pnpm run dev:api',
  webCommand: 'pnpm run dev:web',
  webUrl: 'http://127.0.0.1:5173',
  apiHealthUrl: 'http://127.0.0.1:8787/api/health',
};

export function loadConfig(): AipConfig {
  ensureAipDirs();
  
  const envHome = process.env.AIP_HOME;
  
  if (fs.existsSync(PATHS.configFile)) {
    try {
      const raw = fs.readFileSync(PATHS.configFile, 'utf8');
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_CONFIG, ...parsed, home: envHome || parsed.home || '' };
    } catch {
      return { ...DEFAULT_CONFIG, home: envHome || '' };
    }
  }
  
  return { ...DEFAULT_CONFIG, home: envHome || '' };
}

export function saveConfig(config: AipConfig): void {
  ensureAipDirs();
  fs.writeFileSync(PATHS.configFile, JSON.stringify(config, null, 2), 'utf8');
}

export function initConfig(): AipConfig {
  ensureAipDirs();
  if (!fs.existsSync(PATHS.configFile)) {
    saveConfig(DEFAULT_CONFIG);
  }
  return loadConfig();
}
