import { DatabaseSync } from 'node:sqlite';

function now() { return new Date().toISOString(); }

const args = process.argv.slice(2);
let datasetVersionId = '';
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--dataset-version-id') {
    datasetVersionId = String(args[i + 1] || '');
    i += 1;
  }
}

if (!datasetVersionId) {
  console.log(JSON.stringify({ ok: false, error: 'dataset_version_id is required', checked_at: now() }));
  process.exit(0);
}

const dbPath = 'E:\\AGI_Factory\\repo\\packages\\db\\agi_factory.db';

try {
  const db = new DatabaseSync(dbPath, { readOnly: true });
  const row = db.prepare(`
    SELECT id, dataset_id, version, status, sample_count, train_count, val_count, test_count, updated_at
    FROM dataset_versions
    WHERE id = ?
    LIMIT 1
  `).get(datasetVersionId);
  db.close();

  if (!row) {
    console.log(JSON.stringify({ ok: false, error: 'dataset_version_not_found', dataset_version_id: datasetVersionId, checked_at: now() }));
    process.exit(0);
  }

  console.log(JSON.stringify({ ok: true, dataset_version: row, checked_at: now() }));
} catch (error) {
  console.log(JSON.stringify({ ok: false, error: String(error?.message || error), dataset_version_id: datasetVersionId, checked_at: now() }));
}
