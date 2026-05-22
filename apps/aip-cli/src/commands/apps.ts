import fs from 'node:fs';
import path from 'node:path';
function load() { const p1 = path.resolve(process.cwd(), 'docs', 'product', 'examples', 'local-apps.example.json'); const p2 = path.resolve('E:\\AIP', 'docs', 'product', 'examples', 'local-apps.example.json'); return JSON.parse(fs.readFileSync(fs.existsSync(p1) ? p1 : p2, 'utf8')) as any[]; }
export async function runApps(sub?: string) {
  const entries = load();
  console.log(''); console.log('OpenAIP v8 Foundation Command'); console.log(`Command: aip apps${sub ? ` ${sub}` : ''}`); console.log('Center: Local Apps Center'); console.log('Status: readonly foundation stub'); console.log('Safety: no mutation, no runtime action, Gate CLOSED, Stage C disabled'); console.log('Source: example/static readonly registry');
  console.log(`Registry count: ${entries.length} local apps (openAipv8CenterData.ts mirrors this data)`);
  if (sub === 'list') { for (const it of load()) console.log(`- ${it.name} | kind=${it.kind} | lifecycle=${it.lifecycle} | permission=${it.permissionLevel}`); console.log(`Total: ${entries.length}`); } else { console.log('- planned subcommand: aip apps list (implemented readonly)'); }
}
