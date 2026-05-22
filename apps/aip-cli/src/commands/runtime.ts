import fs from 'node:fs';
import path from 'node:path';

function loadJsonArray(fileName: string): any[] {
  const root = path.resolve(process.cwd(), 'docs', 'product', 'examples', fileName);
  const fallback = path.resolve('E:\\AIP', 'docs', 'product', 'examples', fileName);
  const target = fs.existsSync(root) ? root : fallback;
  return JSON.parse(fs.readFileSync(target, 'utf8'));
}

function printList(title: string, arr: any[]) {
  console.log('');
  console.log(`OpenAIP v8 Foundation Command`);
  console.log(`Command: ${title}`);
  console.log('Status: readonly foundation stub');
  console.log('Safety: no mutation, no runtime action, Gate CLOSED, Stage C disabled');
  console.log('Source: example/static readonly registry');
  for (const it of arr) {
    console.log(`- ${it.name ?? it.id} | kind=${it.kind} | lifecycle=${it.lifecycle ?? 'n/a'} | permission=${it.permissionLevel ?? 'n/a'}`);
  }
}

export async function runRuntime(sub?: string) {
  if (sub === 'status') {
    const policies = loadJsonArray('policies.example.json');
    const p = policies[0] || { gateOpen: false, stageCEnabled: false };
    console.log('');
    console.log('OpenAIP v8 Foundation Command');
    console.log('Command: aip runtime status');
    console.log('Center: Runtime Kernel');
    console.log('Status: readonly foundation stub');
    console.log('Safety: no mutation, no runtime action, Gate CLOSED, Stage C disabled');
    console.log('Source: example/static readonly registry');
    console.log(`- runtimeTruth=unknown | gateOpen=${p.gateOpen} | stageCEnabled=${p.stageCEnabled}`);
    return;
  }
  printList('aip runtime', [{ id: 'runtime.kernel', name: 'Runtime Kernel', kind: 'runtime_service', lifecycle: 'registered', permissionLevel: 'L1' }]);
}

export async function runAgents(sub?: string) {
  if (sub === 'list') return printList('aip agents list', loadJsonArray('agents.example.json'));
  printList('aip agents', [{ id: 'agents.center', name: 'Agent Center', kind: 'agent', lifecycle: 'registered', permissionLevel: 'L1' }]);
}

export async function runIntegrations(sub?: string) {
  if (sub === 'list') return printList('aip integrations list', loadJsonArray('integrations.example.json'));
  printList('aip integrations', [{ id: 'integrations.center', name: 'Integration Center', kind: 'internal_plugin', lifecycle: 'registered', permissionLevel: 'L1' }]);
}

export async function runProviders(sub?: string) {
  if (sub === 'list') return printList('aip providers list', loadJsonArray('providers.example.json'));
  printList('aip providers', [{ id: 'providers.manager', name: 'Provider Manager', kind: 'provider', lifecycle: 'registered', permissionLevel: 'L1' }]);
}

export async function runApps(sub?: string) {
  if (sub === 'list') return printList('aip apps list', loadJsonArray('local-apps.example.json'));
  printList('aip apps', [{ id: 'apps.center', name: 'Local Apps Center', kind: 'local_app', lifecycle: 'registered', permissionLevel: 'L1' }]);
}
