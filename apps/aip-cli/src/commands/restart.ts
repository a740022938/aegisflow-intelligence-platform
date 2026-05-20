import { runStop } from './stop.js';
import { runStart } from './start.js';
import * as readline from 'node:readline';

function ask(msg: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(`${msg} (yes/no): `, answer => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'yes');
    });
  });
}

export async function runRestart() {
  const confirmed = await ask('WARNING: Restarting AIP will stop all services. Are you sure?');
  if (!confirmed) {
    console.log('Restart cancelled.');
    return;
  }
  console.log('Restarting AIP...');
  await runStop();
  await runStart();
}
