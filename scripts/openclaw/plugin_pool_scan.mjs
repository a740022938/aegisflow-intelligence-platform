import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.OPENCLAW_API_BASE || 'http://127.0.0.1:8787';
const outDir = path.resolve(process.cwd(), 'outputs', 'openclaw');
const outFile = path.join(outDir, 'plugin_pool_scan.json');

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) return { ok: false, status: res.status, error: `HTTP ${res.status}`, url };
  return await res.json();
}

async function main() {
  const pool = await getJson(`${BASE}/api/plugins/pool`);
  const plugins = Array.isArray(pool?.plugins) ? pool.plugins : [];
  const summary = {
    total: plugins.length,
    enabled: plugins.filter((p) => !!p.enabled).length,
    failed: plugins.filter((p) => Number(p.failed_count || 0) > 0).length,
    blocked: plugins.filter((p) => Number(p.blocked_count || 0) > 0).length,
  };

  const report = {
    ok: true,
    fetched_at: new Date().toISOString(),
    api_base: BASE,
    pool,
    summary,
  };

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2), 'utf-8');
  console.log(JSON.stringify({ ok: true, output: outFile, summary }));
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: String(err?.message || err) }));
  process.exit(1);
});

