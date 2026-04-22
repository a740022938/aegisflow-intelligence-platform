import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.OPENCLAW_API_BASE || 'http://127.0.0.1:8787';
const outDir = path.resolve(process.cwd(), 'outputs', 'openclaw');
const outFile = path.join(outDir, 'dashboard_snapshot.json');

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) return { ok: false, status: res.status, error: `HTTP ${res.status}`, url };
  return await res.json();
}

async function main() {
  const [summary, recent] = await Promise.all([
    getJson(`${BASE}/api/dashboard/summary`),
    getJson(`${BASE}/api/dashboard/recent-activity?limit=20`),
  ]);

  const report = {
    ok: true,
    fetched_at: new Date().toISOString(),
    api_base: BASE,
    summary,
    recent_activity: recent?.activities || [],
    activity_count: Array.isArray(recent?.activities) ? recent.activities.length : 0,
  };

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2), 'utf-8');
  console.log(JSON.stringify({ ok: true, output: outFile, activity_count: report.activity_count }));
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: String(err?.message || err) }));
  process.exit(1);
});

