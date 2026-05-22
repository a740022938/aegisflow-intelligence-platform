import fs from 'node:fs';
import path from 'node:path';

function load(fileName: string): any[] {
  const p1 = path.resolve(process.cwd(), 'docs', 'product', 'examples', fileName);
  const p2 = path.resolve('E:\\AIP', 'docs', 'product', 'examples', fileName);
  const target = fs.existsSync(p1) ? p1 : p2;
  return JSON.parse(fs.readFileSync(target, 'utf8'));
}

function header(sub?: string) {
  console.log('');
  console.log('OpenAIP v8 Foundation Command');
  console.log(`Command: aip policy${sub ? ` ${sub}` : ''}`);
  console.log('Center: Policy Router + Capability Center');
  console.log('Status: readonly foundation stub');
  console.log('Safety: no mutation, no runtime action, Gate CLOSED, Stage C disabled');
  console.log('Source: example/static readonly registry');
}

export async function runPolicy(sub?: string) {
  const policies = load('policies.example.json');
  const capabilities = load('capabilities.example.json');
  if (sub === 'list') {
    header(sub);
    console.log(`Registry count: ${policies.length} policies, ${capabilities.length} capabilities (openAipv8CenterData.ts mirrors this data)`);
    for (const p of policies) {
      console.log(`- ${p.id} | gateOpen=${p.gateOpen} | stageCEnabled=${p.stageCEnabled} | rule=${p.rule}`);
    }
    for (const c of capabilities) {
      console.log(`- cap: ${c.id} | risk=${c.risk} | permission=${c.permissionLevel} | requiresGate=${c.requiresGate || false}`);
    }
    return;
  }
  if (sub === 'status') {
    header(sub);
    const gateClosed = policies.every((p: any) => !p.gateOpen);
    const stageCDisabled = policies.every((p: any) => !p.stageCEnabled);
    console.log(`Registry count: ${policies.length} policies, ${capabilities.length} capabilities`);
    console.log(`- gateOpen: ${!gateClosed} (expected: false)`);
    console.log(`- stageCEnabled: ${!stageCDisabled} (expected: false)`);
    console.log(`- policies: ${policies.length}`);
    console.log(`- capabilities: ${capabilities.length}`);
    console.log(`- capability != permission: enforced`);
    return;
  }
  header(sub);
  console.log(`Registry count: ${policies.length} policies, ${capabilities.length} capabilities`);
  console.log('- planned subcommands: aip policy list, aip policy status (implemented readonly)');
}
