import fs from 'node:fs';
import path from 'node:path';

function load(fileName: string): any[] {
  const p1 = path.resolve(process.cwd(), 'docs', 'product', 'examples', fileName);
  const p2 = path.resolve('E:\\AIP', 'docs', 'product', 'examples', fileName);
  const target = fs.existsSync(p1) ? p1 : p2;
  return JSON.parse(fs.readFileSync(target, 'utf8'));
}

export async function runTask(sub?: string) {
  const items = load('tasks.example.json');
  const total = items.length;
  const draft = items.filter((i: any) => i.lifecycle === 'draft').length;
  const pendingReview = items.filter((i: any) => i.lifecycle === 'pending_review').length;
  const blocked = items.filter((i: any) => i.lifecycle === 'blocked').length;
  const critical = items.filter((i: any) => i.risk === 'critical').length;
  const humanAuth = items.filter((i: any) => i.humanAuthorizationRequired).length;

  console.log('');
  console.log('OpenAIP v8 Task Center');
  console.log('======================');
  console.log(`Command: aip task${sub ? ` ${sub}` : ''}`);
  console.log(`Source: example/static readonly registry`);
  console.log(`Total task archetypes: ${total}`);
  console.log(`  Draft:        ${draft}`);
  console.log(`  Pending review: ${pendingReview}`);
  console.log(`  Blocked:      ${blocked}`);
  console.log(`  Critical risk: ${critical}`);
  console.log(`  Human auth:   ${humanAuth}`);
  console.log('');
  console.log('Safety: no mutation, no runtime action, no agent dispatch, Gate CLOSED, Stage C disabled');
  console.log('');

  if (sub === 'list') {
    console.log('Task Archetype List:');
    console.log('--------------------');
    for (const t of items) {
      const evidence = t.requiredEvidence && t.requiredEvidence.length > 0 ? t.requiredEvidence.slice(0, 2).join(', ') : '—';
      console.log(`  ${(t.title || t.name || '—').padEnd(38)} lifecycle=${(t.lifecycle || '—').padEnd(16)} risk=${(t.risk || '—').padEnd(8)} review=${(t.reviewState || '—').padEnd(16)} evidence=${evidence}`);
    }
    console.log('');
    console.log(`Total: ${total} task archetypes`);
    console.log('');
    console.log('Execution and agent dispatch is blocked for all tasks. Gate CLOSED. Stage C disabled.');
    console.log('Use "aip v8 status" for overall v8 foundation status.');
  } else if (sub === 'status') {
    console.log('Task Summary:');
    console.log('-------------');
    for (const t of items) {
      console.log(`  ${(t.title || t.name || '—').padEnd(38)} intent=${(t.intent || '—').padEnd(22)} phase=${(t.phase || '—').padEnd(4)} lifecycle=${(t.lifecycle || '—').padEnd(16)} risk=${(t.risk || '—').padEnd(8)} agent=${t.recommendedAgent || '—'}`);
    }
    console.log('');
    console.log(`Total: ${total} task archetypes`);
    console.log('');
    console.log('All tasks are readonly. No agent dispatch. No execution.');
  } else {
    console.log('Subcommands:');
    console.log('  list     List all task archetypes with lifecycle, risk, review state, and evidence');
    console.log('  status   Show per-task details including intent, phase, and recommended agent');
    console.log('');
    console.log('All output is readonly/static. No task execution. No agent dispatch.');
  }
}
