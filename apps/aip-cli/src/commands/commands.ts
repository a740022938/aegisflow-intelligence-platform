import { COMMAND_CATALOG } from '../commandCatalog.js';

const CATEGORY_ORDER = [
  'Quick Start',
  'Service Control',
  'Diagnostics',
  'Config',
  'Gateway & ML',
  'Repair',
  'Utilities',
  'OpenAIP v8',
];

function matches(item: (typeof COMMAND_CATALOG)[number], query: string) {
  if (!query) return true;
  const text = [
    item.id,
    item.command,
    item.category,
    item.risk,
    item.summary,
    item.example,
    ...(item.aliases || []),
  ].join(' ').toLowerCase();
  return text.includes(query.toLowerCase());
}

export async function runCommands(query = '') {
  const selected = COMMAND_CATALOG.filter((item) => matches(item, query));
  console.log('');
  console.log('AIP Command Catalog');
  console.log('===================');
  console.log(`Mode: readonly help only. No services are started, stopped, or restarted.`);
  if (query) console.log(`Filter: ${query}`);
  console.log('');

  for (const category of CATEGORY_ORDER) {
    const items = selected.filter((item) => item.category === category);
    if (!items.length) continue;
    console.log(category);
    console.log('-'.repeat(category.length));
    for (const item of items) {
      console.log(`  [${item.risk}]`.padEnd(10) + `${item.command.padEnd(42)} ${item.summary}`);
    }
    console.log('');
  }

  if (!selected.length) {
    console.log('No commands matched the filter.');
    console.log('');
  }

  console.log('Use "aip help <command>" for details, or "aip ml" for the long machine-local manual.');
}
