import fs from 'node:fs';
import path from 'node:path';

function loadIntegrations() {
  const p1 = path.resolve(process.cwd(), 'docs', 'product', 'examples', 'integrations.example.json');
  const p2 = path.resolve('E:\\AIP', 'docs', 'product', 'examples', 'integrations.example.json');
  return JSON.parse(fs.readFileSync(fs.existsSync(p1) ? p1 : p2, 'utf8')) as any[];
}

const HANDSHAKE_ROWS = [
  'OpenClaw Gateway -> Provider Manager | no live routing | blocked execution/browser/provider call',
  'Claude Proxy Bridge -> Claude/Anthropic | static reference | blocked API/config/secret',
  'CC Switch-like Bridge -> Provider Profiles | dry-run concept | blocked config mutation',
  'Hugging Face -> Provider/Knowledge/Data | static reference | blocked downloads/API calls',
  'GitHub -> Code Host/Task/Audit | local git evidence only | blocked release/tag/workflow/API',
  'Memory Hub Bridge -> Memory + Knowledge Center | readonly bridge | blocked memory write',
];

export async function runIntegrations(sub?: string) {
  const entries = loadIntegrations();
  const blocked = entries.filter(e => e.actionState === 'blocked').length;
  const relatedProviders = new Set(entries.map(e => e.relatedProviderId).filter(Boolean)).size;
  const relatedLocalApps = new Set(entries.map(e => e.relatedLocalAppId).filter(Boolean)).size;
  const relatedAgents = new Set(entries.map(e => e.relatedAgentId).filter(Boolean)).size;

  console.log('');
  console.log('OpenAIP v8 Foundation Command');
  console.log(`Command: aip integrations${sub ? ` ${sub}` : ''}`);
  console.log('Center: Integration Center');
  console.log('Status: readonly integration MVP command');
  console.log('Safety: no runtime action, no connector action, no external call, Gate CLOSED, Stage C disabled');
  console.log('Source: readonly static/example registry');
  console.log(`Integration count: ${entries.length}`);
  console.log(`Action-blocked: ${blocked} | Related providers: ${relatedProviders} | Related local apps: ${relatedLocalApps} | Related agents: ${relatedAgents}`);

  if (sub === 'list') {
    for (const it of entries) {
      console.log(`- ${it.name} | kind=${it.kind} | mode=${it.connectionMode} | auth=${it.authState} | action=${it.actionState} | readonly=${it.readonly}`);
    }
    console.log(`Total: ${entries.length}`);
    return;
  }

  if (sub === 'matrix') {
    console.log('Integration ↔ Provider Handshake Matrix (readonly concept)');
    for (const row of HANDSHAKE_ROWS) console.log(`- ${row}`);
    console.log(`Rows: ${HANDSHAKE_ROWS.length}`);
    return;
  }

  console.log('- supported subcommands: aip integrations list | aip integrations matrix');
}
