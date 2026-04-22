import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve(process.cwd(), 'outputs', 'openclaw');
const outFile = path.join(outDir, 'ops_report.json');

function readJsonSafe(file) {
  try {
    if (!fs.existsSync(file)) return null;
    const raw = fs.readFileSync(file, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function exists(file) {
  return fs.existsSync(file);
}

async function main() {
  const capability = readJsonSafe(path.join(outDir, 'capabilities.json'));
  const health = readJsonSafe(path.join(outDir, 'health_patrol.json'));
  const plugin = readJsonSafe(path.join(outDir, 'plugin_pool_scan.json'));
  const runs = readJsonSafe(path.join(outDir, 'run_queue_scan.json'));
  const dashboard = readJsonSafe(path.join(outDir, 'dashboard_snapshot.json'));

  const report = {
    ok: true,
    generated_at: new Date().toISOString(),
    inputs: {
      capabilities: exists(path.join(outDir, 'capabilities.json')),
      health_patrol: exists(path.join(outDir, 'health_patrol.json')),
      plugin_pool_scan: exists(path.join(outDir, 'plugin_pool_scan.json')),
      run_queue_scan: exists(path.join(outDir, 'run_queue_scan.json')),
      dashboard_snapshot: exists(path.join(outDir, 'dashboard_snapshot.json')),
    },
    summary: {
      service_version: health?.health?.version || capability?.summary?.version || 'unknown',
      health_status: health?.patrol?.overall_status || 'unknown',
      plugin_total: Number(plugin?.summary?.total || 0),
      plugin_failed: Number(plugin?.summary?.failed || 0),
      queued_runs: Number(runs?.count_by_status?.queued || 0),
      failed_runs: Number(runs?.count_by_status?.failed || 0),
      recent_activity_count: Number(dashboard?.activity_count || 0),
    },
    links: {
      capabilities: 'outputs/openclaw/capabilities.json',
      health_patrol: 'outputs/openclaw/health_patrol.json',
      plugin_pool_scan: 'outputs/openclaw/plugin_pool_scan.json',
      run_queue_scan: 'outputs/openclaw/run_queue_scan.json',
      dashboard_snapshot: 'outputs/openclaw/dashboard_snapshot.json',
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

