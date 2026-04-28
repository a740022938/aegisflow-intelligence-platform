import { loadConfig } from '../config.js';
import { PATHS } from '../paths.js';
import { log, warn } from '../logger.js';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

function tailLines(filePath: string, count: number): string {
  if (!fs.existsSync(filePath)) return '';
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content) return '';
  const lines = content.split('\n');
  const tail = lines.slice(-count);
  return tail.join('\n');
}

function resolveLogPaths(service: 'api' | 'web' | 'gateway'): string[] {
  const config = loadConfig();
  const homeAipLogs = path.join(os.homedir(), 'aip', 'logs');
  const paths: string[] = [];

  if (service === 'api') paths.push(PATHS.apiLogFile);
  else if (service === 'web') paths.push(PATHS.webLogFile);
  else paths.push(PATHS.gatewayLogFile);

  if (config.home) {
    paths.push(path.join(config.home, 'logs', `${service}-stdout.log`));
    paths.push(path.join(config.home, `${service}.log`));
  }

  paths.push(path.join(homeAipLogs, `${service}.log`));

  return paths;
}

function findLogContent(service: 'api' | 'web' | 'gateway', lineCount: number): string {
  const paths = resolveLogPaths(service);
  for (const p of paths) {
    const content = tailLines(p, lineCount);
    if (content) return content;
  }
  return '';
}

export async function runLogs(type?: string) {
  if (!type) {
    log('--- API Logs (last 80 lines) ---');
    const apiContent = findLogContent('api', 80);
    if (apiContent) {
      log(apiContent);
    } else {
      log('No logs found');
    }

    log('');
    log('--- Web Logs (last 80 lines) ---');
    const webContent = findLogContent('web', 80);
    if (webContent) {
      log(webContent);
    } else {
      log('No logs found');
    }
    return;
  }

  switch (type) {
    case 'api': {
      log('--- API Logs ---');
      const content = findLogContent('api', 120);
      if (content) {
        log(content);
      } else {
        log('No logs found');
      }
      break;
    }
    case 'web': {
      log('--- Web Logs ---');
      const content = findLogContent('web', 120);
      if (content) {
        log(content);
      } else {
        log('No logs found');
      }
      break;
    }
    case 'gateway': {
      log('--- Gateway Logs ---');
      const content = findLogContent('gateway', 120);
      if (content) {
        log(content);
      } else {
        log('No logs found');
      }
      break;
    }
    default:
      warn(`Unknown log type: ${type}. Use api, web, or gateway.`);
      break;
  }
}
