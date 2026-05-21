import { readFileSync } from 'node:fs';

const files = [
  'apps/web-ui/src/pages/Dashboard.tsx',
  'apps/web-ui/src/pages/GovernanceHub.tsx',
  'apps/web-ui/src/pages/CostRouting.tsx',
  'apps/web-ui/src/pages/Feedback.tsx',
  'apps/web-ui/src/pages/Outputs.tsx',
  'apps/web-ui/src/pages/AdvancedModeReadonly.tsx',
  'apps/web-ui/src/pages/Knowledge.tsx',
  'apps/web-ui/src/pages/ModuleCenter.tsx',
  'apps/web-ui/src/pages/Models.tsx',
  'apps/web-ui/src/pages/PluginPool.tsx',
  'apps/web-ui/src/pages/FactoryStatus.tsx',
  'apps/web-ui/src/components/ui/HealthPatrolPanel.tsx',
  'apps/web-ui/src/components/ui/ReleaseGovernancePanel.tsx',
  'apps/web-ui/src/components/ui/RollbackReadinessBadge.tsx',
  'apps/web-ui/src/pages/ConnectorCenterReadonly.tsx',
];

const forbidden = [
  /v7\.55\.0/,
  /(?<!v)7\.55\.0/,
  /v7\.25\.2 controlled dry-run validation/,
  /Cost Routing v7\.12\.3 UX Sanity/,
  /自动回流 v1（v6\.3\.0）/,
  /v6\.10 知识中心收口/,
  /layoutMode:\s*\{/,
  /contentWidth:\s*\{/,
  /icon="\\u26A0\\uFE0F"/,
  />UNKNOWN</,
  /\|\|\s*'UNKNOWN'/,
  /\?\s*'UNKNOWN'/,
  /toast\(err\?\.message \|\| '保存失败'/,
  /setLoadError\(d\?\.error \|\|/,
  /setError\(e\?\.message \|\| '加载失败'\)/,
];

const failures = [];
for (const file of files) {
  const content = readFileSync(file, 'utf8');
  for (const pattern of forbidden) {
    if (pattern.test(content)) {
      failures.push(`${file}: ${pattern}`);
    }
  }
}

if (failures.length) {
  throw new Error(`UI polish sweep regressions:\n${failures.join('\n')}`);
}

console.log('PASS v7.63-P3 UI polish sweep checks');
