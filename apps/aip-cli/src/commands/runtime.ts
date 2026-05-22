import fs from 'node:fs';
import path from 'node:path';

function load(fileName: string): any[] {
  const p1 = path.resolve(process.cwd(), 'docs', 'product', 'examples', fileName);
  const p2 = path.resolve('E:\\AIP', 'docs', 'product', 'examples', fileName);
  const target = fs.existsSync(p1) ? p1 : p2;
  return JSON.parse(fs.readFileSync(target, 'utf8'));
}

function printList(title: string, arr: any[]) {
  console.log('');
  console.log('OpenAIP v8 Foundation Command');
  console.log(`Command: ${title}`);
  console.log('Status: readonly foundation stub');
  console.log('Safety: no mutation, no runtime action, Gate CLOSED, Stage C disabled');
  console.log('Source: example/static readonly registry');
  const allEntries = load('agents.example.json').concat(load('providers.example.json')).concat(load('integrations.example.json')).concat(load('local-apps.example.json'));
  console.log(`Registry count: ${allEntries.length} total runtime entries (openAipv8CenterData.ts mirrors this data)`);
  for (const it of arr) {
    console.log(`- ${it.name ?? it.id} | kind=${it.kind} | lifecycle=${it.lifecycle ?? 'n/a'} | permission=${it.permissionLevel ?? 'n/a'}`);
  }
}

export async function runRuntime(sub?: string) {
  if (sub === 'status') {
    const policies = load('policies.example.json');
    const p = policies[0] || { gateOpen: false, stageCEnabled: false };
    const allEntries = load('agents.example.json').concat(load('providers.example.json')).concat(load('integrations.example.json')).concat(load('local-apps.example.json'));
    console.log('');
    console.log('OpenAIP v8 Foundation Command');
    console.log('Command: aip runtime status');
    console.log('Center: Runtime Kernel');
    console.log('Status: readonly foundation stub');
    console.log('Safety: no mutation, no runtime action, Gate CLOSED, Stage C disabled');
    console.log('Source: example/static readonly registry');
    console.log(`- runtimeTruth=unknown | gateOpen=${p.gateOpen} | stageCEnabled=${p.stageCEnabled}`);
    console.log(`- total runtime entries: ${allEntries.length}`);
    return;
  }
  if (sub === 'list') {
    const items = load('agents.example.json').concat(load('providers.example.json')).concat(load('integrations.example.json')).concat(load('local-apps.example.json'));
    printList('aip runtime list', items);
    return;
  }
  printList('aip runtime', [{ id: 'runtime.kernel', name: 'Runtime Kernel', kind: 'runtime_service', lifecycle: 'registered', permissionLevel: 'L1' }]);
}
