import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const REPORTS_DIR = 'E:\\_AIP_REPORTS';

function ensureReportsDir() {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
}

function timestamp(): string {
  const now = new Date();
  const y = now.getFullYear();
  const M = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  return `${y}${M}${d}_${h}${m}${s}`;
}

function fmtNow(): string {
  return new Date().toISOString();
}

interface CheckItem {
  name: string;
  status: 'PASS' | 'WARN' | 'FAIL' | 'INFO';
  detail: string;
}

function runGit(args: string): string {
  try {
    return execSync(`git ${args}`, { encoding: 'utf8', stdio: 'pipe', cwd: 'E:\\AIP' }).trim();
  } catch {
    return '';
  }
}

async function performCheck(): Promise<CheckItem[]> {
  const items: CheckItem[] = [];

  items.push({ name: 'Git Branch', status: 'INFO', detail: runGit('branch --show-current') || 'unknown' });
  items.push({ name: 'Git HEAD', status: 'INFO', detail: runGit('rev-parse --short HEAD') || 'unknown' });

  const status = runGit('status --short');
  items.push({ name: 'Git Status', status: status ? 'WARN' : 'PASS', detail: status ? 'uncommitted changes' : 'clean' });

  const rootOk = fs.existsSync('E:\\AIP\\package.json');
  items.push({ name: 'Project Root', status: rootOk ? 'PASS' : 'FAIL', detail: rootOk ? 'E:\\AIP' : 'not found' });

  let aipOk = false;
  try {
    const ver = execSync('aip version', { encoding: 'utf8', stdio: 'pipe', windowsHide: true }).trim();
    aipOk = ver.length > 0;
  } catch {}
  items.push({ name: 'AIP CLI', status: aipOk ? 'PASS' : 'FAIL', detail: aipOk ? 'available' : 'not in PATH' });

  const pkgPath = 'E:\\AIP\\package.json';
  let scripts: string[] = [];
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      scripts = Object.keys(pkg.scripts || {});
    } catch {}
  }
  items.push({ name: 'npm Scripts', status: scripts.length > 0 ? 'PASS' : 'WARN', detail: `${scripts.length} scripts defined` });

  const docsDir = 'E:\\AIP\\docs\\product';
  const docsExist = fs.existsSync(docsDir);
  items.push({ name: 'Command Pack Docs', status: docsExist ? 'PASS' : 'WARN', detail: docsExist ? docsDir : 'not found' });

  const restorePointDir = 'E:\\_AIP_RESTORE_POINTS';
  const rpExists = fs.existsSync(restorePointDir);
  items.push({ name: 'Restore Points Dir', status: rpExists ? 'INFO' : 'INFO', detail: rpExists ? restorePointDir : 'not created yet' });

  let stageCOk = false;
  try {
    const res = await fetch('http://127.0.0.1:8787/api/stage-c/status', { signal: AbortSignal.timeout(3000) });
    stageCOk = res.ok;
  } catch {}
  items.push({ name: 'Stage C API', status: stageCOk ? 'PASS' : 'WARN', detail: stageCOk ? 'reachable (DISABLED)' : 'offline (expected if server not running)' });

  let ffOk = false;
  try {
    const res = await fetch('http://127.0.0.1:8787/api/runtime/status', { signal: AbortSignal.timeout(3000) });
    ffOk = res.ok;
  } catch {}
  items.push({ name: 'Feature Flag API', status: ffOk ? 'PASS' : 'WARN', detail: ffOk ? 'reachable (OFF)' : 'offline (expected if server not running)' });

  return items;
}

function generatePlanMd(items: CheckItem[]): string {
  const ts = timestamp();
  let md = `# AIP Repair Plan\n\n`;
  md += `**Generated**: ${fmtNow()}\n`;
  md += `**Project**: E:\\AIP\n`;
  md += `**Plan ID**: repair_${ts}\n\n`;
  md += `## Check Results\n\n`;
  md += `| Check | Status | Detail |\n`;
  md += `|---|---|---|\n`;
  for (const item of items) {
    md += `| ${item.name} | ${item.status} | ${item.detail} |\n`;
  }
  md += `\n## Summary\n\n`;
  const pass = items.filter(i => i.status === 'PASS').length;
  const warn = items.filter(i => i.status === 'WARN').length;
  const fail = items.filter(i => i.status === 'FAIL').length;
  md += `- PASS: ${pass}\n- WARN: ${warn}\n- FAIL: ${fail}\n\n`;
  md += `## Recommendation\n\n`;
  if (fail > 0) {
    md += `⚠️ ${fail} check(s) failed. Manual review recommended.\n`;
  } else if (warn > 0) {
    md += `ℹ️ ${warn} check(s) need attention.\n`;
  } else {
    md += `✅ All checks pass. System is healthy.\n`;
  }
  md += `\n---\n`;
  md += `*This is a plan-only report. No files were modified.*\n`;
  return md;
}

function generatePlanJson(items: CheckItem[]): string {
  const plan = {
    planId: `repair_${timestamp()}`,
    generatedAt: fmtNow(),
    project: 'E:\\AIP',
    checks: items,
    summary: {
      pass: items.filter(i => i.status === 'PASS').length,
      warn: items.filter(i => i.status === 'WARN').length,
      fail: items.filter(i => i.status === 'FAIL').length,
    },
    note: 'This is a plan-only report. No files were modified.',
  };
  return JSON.stringify(plan, null, 2);
}

export async function runRepairCheck() {
  const items = await performCheck();
  console.log('');
  console.log('AIP Repair Check');
  console.log('================');
  console.log('');
  for (const item of items) {
    const icon = item.status === 'PASS' ? '[PASS]' : item.status === 'WARN' ? '[WARN]' : item.status === 'FAIL' ? '[FAIL]' : '[INFO]';
    console.log(`${icon.padEnd(8)} ${item.name.padEnd(22)} ${item.detail}`);
  }
  const pass = items.filter(i => i.status === 'PASS').length;
  const warn = items.filter(i => i.status === 'WARN').length;
  const fail = items.filter(i => i.status === 'FAIL').length;
  console.log('');
  console.log(`PASS: ${pass}  WARN: ${warn}  FAIL: ${fail}`);
}

export async function runRepairPlan() {
  ensureReportsDir();
  const items = await performCheck();
  const ts = timestamp();
  const mdContent = generatePlanMd(items);
  const jsonContent = generatePlanJson(items);

  const mdPath = path.join(REPORTS_DIR, `AIP_repair_plan_${ts}.md`);
  const jsonPath = path.join(REPORTS_DIR, `AIP_repair_plan_${ts}.json`);

  fs.writeFileSync(mdPath, mdContent, 'utf8');
  fs.writeFileSync(jsonPath, jsonContent, 'utf8');

  console.log('');
  console.log('AIP Repair Plan Generated');
  console.log('=========================');
  console.log('');
  console.log(`  Plan ID: repair_${ts}`);
  for (const item of items) {
    const icon = item.status === 'PASS' ? '[PASS]' : item.status === 'WARN' ? '[WARN]' : item.status === 'FAIL' ? '[FAIL]' : '[INFO]';
    console.log(`${icon.padEnd(8)} ${item.name.padEnd(22)} ${item.detail}`);
  }
  const pass = items.filter(i => i.status === 'PASS').length;
  const warn = items.filter(i => i.status === 'WARN').length;
  const fail = items.filter(i => i.status === 'FAIL').length;
  console.log('');
  console.log(`PASS: ${pass}  WARN: ${warn}  FAIL: ${fail}`);
  console.log('');
  console.log(`  Report (MD):   ${mdPath}`);
  console.log(`  Report (JSON): ${jsonPath}`);
  console.log('');
  console.log('  This is a plan-only report. No files were modified.');
}

export async function runRepairCommandPackPlan() {
  console.log('');
  console.log('AIP Command Pack Plan');
  console.log('=====================');
  console.log('');
  console.log('  This is a plan-only command pack analysis.');
  console.log('  No files will be modified.');
  console.log('');
  console.log('  Available command packs:');
  console.log('    1. AIP_COMMAND_PACK_FULL_POWERSHELL.md');
  console.log('    2. AIP_V7_41_TOTAL_CONSTRUCTION_BLUEPRINT.md');
  console.log('  ');
  console.log('  To view: docs/product/ directory');
}

export async function runRepairRestorePoint() {
  console.log('');
  console.log('Available Restore Points');
  console.log('========================');
  console.log('');
  const logOutput = runGit('log --oneline -10');
  if (logOutput) {
    const lines = logOutput.split('\n');
    for (const line of lines) {
      console.log(`  ${line}`);
    }
  } else {
    console.log('  No git history available.');
  }
  console.log('');
  console.log('  Restore point folder:');
  const rpDir = 'E:\\_AIP_RESTORE_POINTS';
  if (fs.existsSync(rpDir)) {
    const files = fs.readdirSync(rpDir);
    if (files.length > 0) {
      for (const f of files) {
        console.log(`    ${rpDir}\\${f}`);
      }
    } else {
      console.log(`    ${rpDir} (empty)`);
    }
  } else {
    console.log(`    ${rpDir} (not created)`);
  }
}

export async function runRepairSourcePlan() {
  console.log('');
  console.log('AIP Source Restore Plan');
  console.log('=======================');
  console.log('');
  console.log('  WARNING: Source restore is HIGH RISK.');
  console.log('  This is a PLAN-ONLY operation.');
  console.log('');
  console.log('  Current state:');
  console.log(`    Branch: ${runGit('branch --show-current') || 'unknown'}`);
  console.log(`    HEAD:   ${runGit('rev-parse --short HEAD') || 'unknown'}`);
  console.log('');
  console.log('  To restore, you would need:');
  console.log('    1. Human owner authorization');
  console.log('    2. aip seal status verification');
  console.log('    3. Report generation before restore');
  console.log('');
  console.log('  No files were modified. No restore was executed.');
}

export async function runRepair(sub?: string, args?: string[]) {
  if (sub === 'check') {
    await runRepairCheck();
  } else if (sub === 'plan') {
    await runRepairPlan();
  } else if (sub === 'command-pack') {
    if (args?.includes('--plan')) {
      await runRepairCommandPackPlan();
    } else {
      console.log('Usage: aip repair command-pack --plan');
    }
  } else if (sub === 'restore-point') {
    await runRepairRestorePoint();
  } else if (sub === 'source') {
    if (args?.includes('--plan')) {
      await runRepairSourcePlan();
    } else {
      console.log('Usage: aip repair source --plan');
    }
  } else {
    await runRepairPlan();
  }
}
