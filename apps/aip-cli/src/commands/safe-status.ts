import { execSync } from 'node:child_process';
import fs from 'node:fs';

function runGit(args: string): string {
  try {
    return execSync(`git ${args}`, { encoding: 'utf8', stdio: 'pipe', cwd: 'E:\\AIP' }).trim();
  } catch {
    return 'unknown';
  }
}

async function checkStageCApi(): Promise<{ ok: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch('http://127.0.0.1:8787/api/stage-c/status', { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const data = await res.json();
    return { ok: true, data };
  } catch (e: any) {
    return { ok: false, error: e.message || String(e) };
  }
}

export async function runSafeStatus() {
  const status = runGit('status --short');
  const workingTree = status ? 'DIRTY' : 'CLEAN';

  console.log('');
  console.log('AIP Safe Status');
  console.log('===============');
  console.log('');

  const api = await checkStageCApi();

  if (api.ok && api.data) {
    const d = api.data;
    console.log(`  Stage C:             ${d.stageCEnabled === false ? 'DISABLED' : 'ENABLED'}`);
    console.log(`  Feature Flag:        ${d.featureFlag?.currentState || 'OFF'}`);
    console.log(`  POST Runtime:        ${d.safetyBoundary?.postRuntimeAllowed ? 'ALLOWED' : 'BLOCKED'}`);
    console.log(`  DB Write:            ${d.safetyBoundary?.dbWriteAllowed ? 'ALLOWED' : 'BLOCKED'}`);
    console.log(`  Executor:            ${d.safetyBoundary?.executorAllowed ? 'ALLOWED' : 'ABSENT'}`);
    console.log(`  External Control:    ${d.safetyBoundary?.externalControlAllowed ? 'ALLOWED' : 'BLOCKED'}`);
    console.log(`  Connector Action:    ${d.safetyBoundary?.connectorActionAllowed ? 'ALLOWED' : 'BLOCKED'}`);
    console.log(`  Source:              ${d.source || 'unknown'}`);
    console.log(`  API Version:         ${d.contractVersion || 'unknown'}`);
  } else {
    console.log('  Runtime API: unavailable (server may be offline)');
    console.log('  Using static evidence:');
    console.log('  Stage C:             DISABLED (by policy)');
    console.log('  Feature Flag:        OFF (by policy)');
    console.log('  POST Runtime:        BLOCKED (by policy)');
    console.log('  DB Write:            BLOCKED (by policy)');
    console.log('  Executor:            ABSENT (by policy)');
    console.log('  External Control:    BLOCKED (by policy)');
    console.log('  Connector Action:    BLOCKED (by policy)');
    if (api.error) {
      console.log(`  API Error:           ${api.error}`);
    }
  }

  console.log(`  Repair:              PLAN-ONLY`);
  console.log(`  Memory:              READONLY`);
  console.log(`  Authorization:       PREVIEW-ONLY`);
  console.log(`  Sidebar Exposure:    NONE`);
  console.log(`  Working Tree:        ${workingTree}`);
  console.log('');
  console.log('  This is a readonly command. No files were modified.');
}
