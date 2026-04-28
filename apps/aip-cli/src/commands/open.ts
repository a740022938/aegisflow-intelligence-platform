import { loadConfig } from '../config.js';
import { execSync } from 'node:child_process';
import os from 'node:os';
import { log, warn } from '../logger.js';

export async function runOpen() {
  const config = loadConfig();
  const url = config.webUrl;

  log(`Opening ${url}...`);

  try {
    if (os.platform() === 'win32') {
      execSync(`start "" "${url}"`, { stdio: 'ignore', windowsHide: true });
    } else if (os.platform() === 'darwin') {
      execSync(`open "${url}"`, { stdio: 'ignore' });
    } else {
      execSync(`xdg-open "${url}"`, { stdio: 'ignore' });
    }
  } catch (e: any) {
    warn(`Could not open browser: ${e.message}`);
  }
}
