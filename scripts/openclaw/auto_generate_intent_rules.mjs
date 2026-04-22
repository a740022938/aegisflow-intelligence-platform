import fs from 'node:fs';
import path from 'node:path';

function resolveScriptDir() {
  const candidates = [
    path.resolve(process.cwd(), 'scripts', 'openclaw'),
    path.resolve(process.cwd(), '..', '..', 'scripts', 'openclaw'),
    path.resolve(process.cwd(), '..', '..', '..', 'scripts', 'openclaw'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function tokenizeKey(key) {
  return key
    .toLowerCase()
    .split(/[_-]+/)
    .filter((x) => x && x.length >= 3);
}

function buildRuleFromScriptKey(key) {
  const keywords = Array.from(new Set(tokenizeKey(key)));
  return {
    id: `auto-${key}`,
    keywords_any: keywords,
    actions: [
      { type: 'run_script', script_key: key },
    ],
  };
}

function main() {
  const scriptDir = resolveScriptDir();
  if (!scriptDir) {
    console.error(JSON.stringify({ ok: false, error: 'script_dir_not_found' }));
    process.exit(1);
  }
  const outFile = path.join(scriptDir, 'intent_rules.auto.json');
  if (!fs.existsSync(scriptDir)) {
    console.error(JSON.stringify({ ok: false, error: 'script_dir_not_found', script_dir: scriptDir }));
    process.exit(1);
  }
  const files = fs.readdirSync(scriptDir);
  const keys = files
    .filter((f) => f.endsWith('.mjs'))
    .map((f) => f.replace(/\.mjs$/, ''))
    .filter((k) => !['auto_generate_intent_rules'].includes(k));

  const rules = keys.map(buildRuleFromScriptKey);
  const autoCfg = {
    version: '1.0.0',
    generated_at: new Date().toISOString(),
    source: 'auto_generate_intent_rules.mjs',
    rules,
  };

  fs.writeFileSync(outFile, JSON.stringify(autoCfg, null, 2), 'utf-8');
  console.log(JSON.stringify({ ok: true, output: outFile, script_dir: scriptDir, script_count: keys.length, rule_count: rules.length }));
}

main();
