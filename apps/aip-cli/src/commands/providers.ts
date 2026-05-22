import fs from 'node:fs';
import path from 'node:path';
function load() { const p1 = path.resolve(process.cwd(), 'docs', 'product', 'examples', 'providers.example.json'); const p2 = path.resolve('E:\\AIP', 'docs', 'product', 'examples', 'providers.example.json'); return JSON.parse(fs.readFileSync(fs.existsSync(p1) ? p1 : p2, 'utf8')) as any[]; }

export async function runProviders(sub?: string) {
  const entries = load();
  const cloud = entries.filter(e => ['cloud_provider', 'openai_compatible_provider'].includes(e.providerKind)).length;
  const local = entries.filter(e => e.providerKind === 'local_model_server').length;
  const proxySwitcher = entries.filter(e => ['provider_proxy', 'config_switcher_reference'].includes(e.providerKind)).length;
  const disabled = entries.filter(e => e.lifecycle === 'disabled').length;
  const blockedConfigWrite = entries.filter(e => (e.blockedActions || []).includes('provider config write')).length;
  const blockedModelCall = entries.filter(e => (e.blockedActions || []).includes('model calls')).length;

  console.log('');
  console.log('OpenAIP v8 Foundation Command');
  console.log(`Command: aip providers${sub ? ` ${sub}` : ''}`);
  console.log('Center: Provider Manager');
  console.log('Status: readonly provider MVP command');
  console.log('Safety: no mutation, no runtime action, Gate CLOSED, Stage C disabled');
  console.log('Source: readonly static/example registry');
  console.log(`Registry count: ${entries.length} providers`);
  console.log(`Cloud: ${cloud} | Local: ${local} | Proxy/Switcher: ${proxySwitcher} | Disabled: ${disabled}`);
  console.log(`Config-write blocked: ${blockedConfigWrite} | Model-call blocked: ${blockedModelCall}`);
  console.log('Secret safety: no API keys shown; no token/JWT output');

  if (sub === 'list') {
    for (const it of entries) {
      console.log(`- ${it.name} | kind=${it.providerKind} | lifecycle=${it.lifecycle} | config=${it.configStatus} | selection=${it.selectionState} | readonly=${it.readonly}`);
    }
    console.log(`Total: ${entries.length}`);
    return;
  }

  console.log('- supported subcommand: aip providers list');
}
