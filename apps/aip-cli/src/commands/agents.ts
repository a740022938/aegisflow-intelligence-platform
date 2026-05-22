import fs from 'node:fs';
import path from 'node:path';

function load() {
  const p1 = path.resolve(process.cwd(), 'docs', 'product', 'examples', 'agents.example.json');
  const p2 = path.resolve('E:\\AIP', 'docs', 'product', 'examples', 'agents.example.json');
  return JSON.parse(fs.readFileSync(fs.existsSync(p1) ? p1 : p2, 'utf8')) as any[];
}

export async function runAgents(sub?: string) {
  const entries = load();
  const total = entries.length;
  const enabled = entries.filter((a: any) => a.lifecycle === 'enabled').length;
  const registered = entries.filter((a: any) => a.lifecycle === 'registered').length;
  const planned = entries.filter((a: any) => a.lifecycle === 'planned').length;
  const disabled = entries.filter((a: any) => a.lifecycle === 'disabled').length;
  const highRisk = entries.filter((a: any) => a.risk === 'high').length;
  const blockedFromExec = entries.filter((a: any) => a.lifecycle !== 'disabled').length;

  console.log('');
  console.log('OpenAIP v8 Agent Center');
  console.log('=======================');
  console.log(`Command: aip agents${sub ? ` ${sub}` : ''}`);
  console.log(`Source: example/static readonly registry`);
  console.log(`Total agents: ${total}`);
  console.log(`  Enabled:     ${enabled}`);
  console.log(`  Registered:  ${registered}`);
  console.log(`  Planned:     ${planned}`);
  console.log(`  Disabled:    ${disabled}`);
  console.log(`  High risk:   ${highRisk}`);
  console.log(`  Execution blocked: ${blockedFromExec} (all agents, Gate CLOSED)`);
  console.log('');
  console.log('Safety: no mutation, no runtime action, Gate CLOSED, Stage C disabled');
  console.log('');

  if (sub === 'list' || sub === 'status') {
    console.log('Agent List:');
    console.log('-----------');
    for (const a of load()) {
      const caps = a.capabilities && a.capabilities.length > 0 ? a.capabilities.slice(0, 3).join(', ') : '—';
      console.log(`  ${a.name.padEnd(22)} lifecycle=${(a.lifecycle || '—').padEnd(12)} permission=${(a.permissionLevel || '—').padEnd(4)} risk=${(a.risk || '—').padEnd(8)} caps=${caps}`);
    }
    console.log('');
    console.log(`Total: ${total} agents`);
    console.log('');
    console.log('Execution is blocked for all agents. Gate CLOSED. Stage C disabled.');
    console.log('Use "aip v8 status" for overall v8 foundation status.');
  } else {
    console.log('Subcommands:');
    console.log('  list     List all agents with lifecycle, permission, risk, and capabilities');
    console.log('  status   Same as list (alias)');
    console.log('');
    console.log('All output is readonly/static. No agent execution.');
  }
}
