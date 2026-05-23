import fs from 'node:fs';

const files = {
  agents: 'docs/product/examples/agents.example.json',
  providers: 'docs/product/examples/providers.example.json',
  integrations: 'docs/product/examples/integrations.example.json',
  apps: 'docs/product/examples/local-apps.example.json',
  capabilities: 'docs/product/examples/capabilities.example.json',
  policies: 'docs/product/examples/policies.example.json',
};

function load(path) {
  const raw = fs.readFileSync(path, 'utf8');
  const arr = JSON.parse(raw);
  if (!Array.isArray(arr)) throw new Error(`${path}: must be array`);
  return arr;
}

const agents = load(files.agents);
const providers = load(files.providers);
const integrations = load(files.integrations);
const apps = load(files.apps);
const capabilities = load(files.capabilities);
const policies = load(files.policies);

const permissionSet = new Set(['L0','L1','L2','L3','L4','L5']);
const lifecycleSet = new Set(['planned','registered','enabled','paused','disabled','quarantined']);

function checkPermissionAndLifecycle(items, path, lifecycleRequired = true) {
  for (const item of items) {
    if (item.permissionLevel && !permissionSet.has(item.permissionLevel)) throw new Error(`${path}: invalid permissionLevel ${item.permissionLevel}`);
    if (lifecycleRequired && item.lifecycle && !lifecycleSet.has(item.lifecycle)) throw new Error(`${path}: invalid lifecycle ${item.lifecycle}`);
  }
}

checkPermissionAndLifecycle(agents, files.agents);
checkPermissionAndLifecycle(providers, files.providers);
checkPermissionAndLifecycle(integrations, files.integrations);
checkPermissionAndLifecycle(apps, files.apps);
checkPermissionAndLifecycle(capabilities, files.capabilities, false);

if (!agents.some(a => a.name === 'OpenClaw' && a.firstClass === true && a.optional === true)) {
  throw new Error('agents: OpenClaw optional first-class entry missing');
}
if (!apps.some(a => a.name === 'OpenAxiom' && a.kind === 'local_app')) {
  throw new Error('apps: OpenAxiom must be local_app');
}
if (!providers.some(p => p.name === 'Ollama')) {
  throw new Error('providers: Ollama missing');
}
if (!providers.some(p => p.name === 'LM Studio')) {
  throw new Error('providers: LM Studio missing');
}
if (!integrations.some(i => i.name === 'GitHub' && i.kind === 'code_host')) {
  throw new Error('integrations: GitHub code_host missing');
}
if (!policies.some(p => p.gateOpen === false && p.stageCEnabled === false)) {
  throw new Error('policies: gateOpen/stageCEnabled baseline missing');
}
if (!capabilities.some(c => c.gateRequired === true && c.stageCRequired === true)) {
  throw new Error('capabilities: gate/stageC protected capability missing');
}

console.log('OpenAIP v8 registry examples semantic validation passed');
