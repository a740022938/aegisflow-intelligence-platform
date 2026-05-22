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
  console.log(`Command: aip audit${sub ? ` ${sub}` : ''}`);
  console.log('Center: Audit Center');
  console.log('Status: readonly foundation stub');
  console.log('Safety: no mutation, no runtime action, Gate CLOSED, Stage C disabled');
  console.log('Source: example/static readonly registry');
}

export async function runAudit(sub?: string) {
  const items = load('audit.example.json');
  if (sub === 'list') {
    header(sub);
    console.log(`Registry count: ${items.length} audit entries (openAipv8CenterData.ts mirrors this data)`);
    for (const it of items) {
      console.log(`- ${it.id} | type=${it.type} | phase=${it.phase} | verdict=${it.verdict} | commit=${it.commit}`);
    }
    return;
  }
  if (sub === 'status') {
    header(sub);
    console.log(`Registry count: ${items.length} audit entries`);
    console.log(`- total receipts: ${items.length}`);
    console.log(`- passed: ${items.filter((i: any) => i.verdict === 'passed').length}`);
    console.log(`- latest phase: ${items[items.length - 1]?.phase || 'none'}`);
    return;
  }
  header(sub);
  console.log(`Registry count: ${items.length} audit entries`);
  console.log('- planned subcommands: aip audit list, aip audit status (implemented readonly)');
}
