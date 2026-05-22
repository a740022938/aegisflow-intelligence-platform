import fs from 'node:fs';

const files = [
  'docs/product/examples/agents.example.json',
  'docs/product/examples/providers.example.json',
  'docs/product/examples/integrations.example.json',
  'docs/product/examples/local-apps.example.json',
  'docs/product/examples/capabilities.example.json',
  'docs/product/examples/policies.example.json',
];

for (const f of files) {
  const raw = fs.readFileSync(f, 'utf8');
  const arr = JSON.parse(raw);
  if (!Array.isArray(arr)) throw new Error(`${f}: must be array`);
}
console.log('OpenAIP v8 registry examples validation passed');
