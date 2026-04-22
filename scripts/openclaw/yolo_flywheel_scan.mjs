import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.OPENCLAW_API_BASE || 'http://127.0.0.1:8787';
const outDir = path.resolve(process.cwd(), 'outputs', 'openclaw');
const outFile = path.join(outDir, 'yolo_flywheel_scan.json');

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) return { ok: false, status: res.status, error: `HTTP ${res.status}`, url };
  return await res.json();
}

function safeList(v, key) {
  if (Array.isArray(v?.[key])) return v[key];
  return [];
}

async function main() {
  const [datasets, trainingRuns, evaluations, models, workflows, outputs] = await Promise.all([
    getJson(`${BASE}/api/datasets?limit=50`),
    getJson(`${BASE}/api/training/runs?limit=50`),
    getJson(`${BASE}/api/evaluations?limit=50`),
    getJson(`${BASE}/api/models?limit=50`),
    getJson(`${BASE}/api/workflow-jobs?limit=50`),
    getJson(`${BASE}/api/outputs/list?limit=50`),
  ]);

  const dsList = safeList(datasets, 'datasets');
  const trList = safeList(trainingRuns, 'runs');
  const evList = safeList(evaluations, 'evaluations');
  const mdList = safeList(models, 'models');
  const wfList = safeList(workflows, 'jobs');
  const outList = safeList(outputs, 'files');

  const summary = {
    datasets: dsList.length,
    training_runs: trList.length,
    evaluations: evList.length,
    models: mdList.length,
    workflow_jobs: wfList.length,
    output_files: outList.length,
    running_training: trList.filter((r) => String(r?.status || '') === 'running').length,
    failed_evaluations: evList.filter((r) => String(r?.status || '') === 'failed').length,
  };

  const report = {
    ok: true,
    fetched_at: new Date().toISOString(),
    api_base: BASE,
    summary,
    datasets: dsList.slice(0, 20),
    training_runs: trList.slice(0, 20),
    evaluations: evList.slice(0, 20),
    models: mdList.slice(0, 20),
    workflow_jobs: wfList.slice(0, 20),
    output_files: outList.slice(0, 20),
  };

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2), 'utf-8');
  console.log(JSON.stringify({ ok: true, output: outFile, summary }));
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: String(err?.message || err) }));
  process.exit(1);
});

