import { runStop } from './stop.js';
import { runStart } from './start.js';
import { log } from '../logger.js';

export async function runRestart() {
  log('Restarting AIP...');
  await runStop();
  await runStart();
}
