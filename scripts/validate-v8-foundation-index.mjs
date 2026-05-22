import fs from 'node:fs';

const indexPath = 'docs/product/OPENAIP_V8_FOUNDATION_INDEX.md';
const required = [
  'OPENAIP_V8_PRODUCT_CONSTITUTION.md',
  'OPENAIP_V8_ANTI_REWORK_ARCHITECTURE.md',
  'OPENAIP_V8_AGENT_CONTROL_PLANE_ARCHITECTURE.md',
  'OPENAIP_V8_SAFETY_POLICY_CONSTITUTION.md',
  'OPENAIP_V8_V7_TO_V8_MIGRATION_STRATEGY.md',
  'OPENAIP_V8_REGISTRY_AND_CONFIG_CONTRACT.md',
  'OPENAIP_V8_AGENT_PROVIDER_INTEGRATION_TAXONOMY.md',
  'OPENAIP_V8_CENTERS_AND_KERNELS_FOUNDATION.md',
  'OPENAIP_V8_NEXT_12_PHASES_ROADMAP.md',
  'OPENAIP_V8_PRODUCT_POLISH_AND_RISK_BACKLOG.md',
];

const index = fs.readFileSync(indexPath, 'utf8');
for (const name of required) {
  if (!index.includes(name)) throw new Error(`index missing link: ${name}`);
  if (!fs.existsSync(`docs/product/${name}`)) throw new Error(`missing file: docs/product/${name}`);
}

console.log('OpenAIP v8 foundation index validation passed');
