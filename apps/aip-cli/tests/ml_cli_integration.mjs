import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execP = promisify(exec);

async function run() {
  const cliDir = 'E:\\AIP\\apps\\aip-cli';
  console.log('=== Building aip-cli (tsc) ===');
  try {
    await execP('npm --prefix ' + cliDir + ' run build', { stdio: 'inherit' });
  } catch (e) {
    console.warn('Build failed or skipped (tsc not installed in environment).');
  }

  console.log('=== Running aip ml ===');
  try {
    const { stdout, stderr } = await execP('node dist/index.js ml', { cwd: cliDir });
    console.log('OUTPUT:\n' + stdout);
    if (stderr?.length) {
      console.error('STDERR:\n' + stderr);
    }
  } catch (e) {
    console.error('Failed to run aip ml:', e);
  }
}

run();
