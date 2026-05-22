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
  console.log(`Command: aip task${sub ? ` ${sub}` : ''}`);
  console.log('Center: Task Center');
  console.log('Status: readonly foundation stub');
  console.log('Safety: no mutation, no runtime action, Gate CLOSED, Stage C disabled');
  console.log('Source: example/static readonly registry');
}

export async function runTask(sub?: string) {
  const items = load('tasks.example.json');
  if (sub === 'list') {
    header(sub);
    console.log(`Registry count: ${items.length} tasks (openAipv8CenterData.ts mirrors this data)`);
    for (const it of items) {
      console.log(`- ${it.name} | lifecycle=${it.lifecycle} | permission=${it.permissionLevel} | receipt=${it.receiptRequired} | review=${it.reviewRequired}`);
    }
    return;
  }
  if (sub === 'status') {
    header(sub);
    console.log(`Registry count: ${items.length} tasks`);
    console.log(`- draft items: ${items.filter((i: any) => i.lifecycle === 'draft').length}`);
    console.log(`- receipt required: ${items.filter((i: any) => i.receiptRequired).length}`);
    console.log(`- review required: ${items.filter((i: any) => i.reviewRequired).length}`);
    return;
  }
  header(sub);
  console.log(`Registry count: ${items.length} tasks`);
  console.log('- planned subcommands: aip task list, aip task status (implemented readonly)');
}
