import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.OPENCLAW_API_BASE || 'http://127.0.0.1:8787';
const outDir = path.resolve(process.cwd(), 'outputs', 'openclaw');
const outFile = path.join(outDir, 'run_queue_scan.json');

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) return { ok: false, status: res.status, error: `HTTP ${res.status}`, url };
  return await res.json();
}

async function main() {
  const runsResp = await getJson(`${BASE}/api/runs?limit=100`);
  const runs = Array.isArray(runsResp?.runs) ? runsResp.runs : [];

  const countByStatus = {};
  for (const r of runs) {
    const s = String(r?.status || 'unknown');
    countByStatus[s] = Number(countByStatus[s] || 0) + 1;
  }

  const report = {
    ok: true,
    fetched_at: new Date().toISOString(),
    api_base: BASE,
    total: runs.length,
    count_by_status: countByStatus,
    openclaw_recent: runs.filter((r) => String(r?.executor_type || '') === 'openclaw').slice(0, 20),
  };

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2), 'utf-8');
  console.log(JSON.stringify({ ok: true, output: outFile, total: report.total, count_by_status: countByStatus }));
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: String(err?.message || err) }));
  process.exit(1);
});

