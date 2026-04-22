import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.OPENCLAW_API_BASE || 'http://127.0.0.1:8787';
const outDir = path.resolve(process.cwd(), 'outputs', 'openclaw');
const outFile = path.join(outDir, 'health_patrol.json');

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) return { ok: false, status: res.status, error: `HTTP ${res.status}`, url };
  return await res.json();
}

async function main() {
  const [health, patrol] = await Promise.all([
    getJson(`${BASE}/api/health`),
    getJson(`${BASE}/api/health/patrol`),
  ]);

  const report = {
    ok: true,
    fetched_at: new Date().toISOString(),
    api_base: BASE,
    health,
    patrol,
    summary: {
      service_ok: !!health?.ok,
      patrol_ok: !!patrol?.ok,
      version: health?.version || 'unknown',
      overall_status: patrol?.overall_status || 'unknown',
    },
  };

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2), 'utf-8');
  console.log(JSON.stringify({ ok: true, output: outFile, summary: report.summary }));
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: String(err?.message || err) }));
  process.exit(1);
});

