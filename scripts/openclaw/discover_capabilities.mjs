import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.OPENCLAW_API_BASE || 'http://127.0.0.1:8787';
const outDir = path.resolve(process.cwd(), 'outputs', 'openclaw');
const outFile = path.join(outDir, 'capabilities.json');

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    return { ok: false, status: res.status, error: `HTTP ${res.status}`, url };
  }
  return await res.json();
}

async function main() {
  const [root, health, plugins, pluginPool, workflows] = await Promise.all([
    getJson(`${BASE}/`),
    getJson(`${BASE}/api/health`),
    getJson(`${BASE}/api/plugins/status`),
    getJson(`${BASE}/api/plugins/pool`),
    getJson(`${BASE}/api/workflow/pipelines`),
  ]);

  const report = {
    ok: true,
    fetched_at: new Date().toISOString(),
    api_base: BASE,
    summary: {
      service: health?.service || 'unknown',
      version: health?.version || 'unknown',
      plugin_system_enabled: !!plugins?.enabled,
      plugin_count: Number(pluginPool?.count || 0),
      workflow_pipeline_count: Array.isArray(workflows?.pipelines) ? workflows.pipelines.length : 0,
    },
    endpoints: root?.endpoints || [],
    plugins: pluginPool?.plugins || [],
    pipelines: workflows?.pipelines || [],
  };

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2), 'utf-8');
  console.log(JSON.stringify({ ok: true, output: outFile, summary: report.summary }));
}

main().catch((err) => {
  console.error(JSON.stringify({
    ok: false,
    error: String(err?.message || err),
  }));
  process.exit(1);
});
