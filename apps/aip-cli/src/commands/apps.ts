import fs from 'node:fs';
import path from 'node:path';
function load() { const p1 = path.resolve(process.cwd(), 'docs', 'product', 'examples', 'local-apps.example.json'); const p2 = path.resolve('E:\\AIP', 'docs', 'product', 'examples', 'local-apps.example.json'); return JSON.parse(fs.readFileSync(fs.existsSync(p1) ? p1 : p2, 'utf8')) as any[]; }
export async function runApps(sub?: string) {
  const entries = load();
  const localModelServers = entries.filter(e => e.category === 'local_model_server').length;
  const workflowEngines = entries.filter(e => e.category === 'workflow_engine').length;
  const visionTools = entries.filter(e => e.category === 'local_vision_pipeline_tool').length;
  const blocked = entries.filter(e => e.launchState === 'blocked').length;
  console.log(''); console.log('OpenAIP v8 Foundation Command'); console.log(`Command: aip apps${sub ? ` ${sub}` : ''}`); console.log('Center: Local Apps Center'); console.log('Status: readonly local apps MVP command'); console.log('Safety: no runtime action, no app launch, no local API call, Gate CLOSED, Stage C disabled'); console.log('Source: readonly static/example registry');
  console.log(`Local apps count: ${entries.length}`); console.log(`Local model servers: ${localModelServers} | Workflow engines: ${workflowEngines} | Vision tools: ${visionTools} | Launch blocked: ${blocked}`);
  if (sub === 'list') { for (const it of entries) console.log(`- ${it.name} | category=${it.category} | configured=${it.configuredState} | running=${it.runningState} | launch=${it.launchState} | readonly=${it.readonly}`); console.log(`Total: ${entries.length}`); return; }
  console.log('- supported subcommand: aip apps list');
}
