param(
  [string]$DatasetRoot = 'E:\AGI_Factory\datasets\yolo-test-ds',
  [string]$DatabasePath = 'E:\AGI_Factory\repo\packages\db\agi_factory.db',
  [string]$DatasetCode = 'yolo_phasea_f2',
  [string]$DatasetName = 'YOLO Phase-A F2 Dataset',
  [string]$DatasetVersion = 'v1.0.0-f2'
)

$ErrorActionPreference = 'Stop'
if (!(Test-Path $DatasetRoot)) { throw "Dataset root not found: $DatasetRoot" }
if (!(Test-Path $DatabasePath)) { throw "DB not found: $DatabasePath" }

$trainImgs = @(Get-ChildItem -File (Join-Path $DatasetRoot 'images\\train') -ErrorAction SilentlyContinue)
$valImgs   = @(Get-ChildItem -File (Join-Path $DatasetRoot 'images\\val') -ErrorAction SilentlyContinue)
$testImgs  = @(Get-ChildItem -File (Join-Path $DatasetRoot 'images\\test') -ErrorAction SilentlyContinue)
$trainCnt = $trainImgs.Count
$valCnt = $valImgs.Count
$testCnt = $testImgs.Count
$totalCnt = $trainCnt + $valCnt + $testCnt

$yaml = @"
path: $DatasetRoot
train: images/train
val: images/val
test: images/test
nc: 2
names:
  0: person
  1: car
"@
Set-Content -Path (Join-Path $DatasetRoot 'dataset.yaml') -Value $yaml -Encoding UTF8
Set-Content -Path (Join-Path $DatasetRoot 'data.yaml') -Value $yaml -Encoding UTF8

$manifestPath = Join-Path $DatasetRoot 'split_manifest.json'
$manifest = [ordered]@{
  dataset_code = $DatasetCode
  dataset_name = $DatasetName
  dataset_version = $DatasetVersion
  root = $DatasetRoot
  splits = [ordered]@{
    train = [ordered]@{ count = $trainCnt; images = 'images/train'; labels = 'labels/train' }
    val   = [ordered]@{ count = $valCnt; images = 'images/val'; labels = 'labels/val' }
    test  = [ordered]@{ count = $testCnt; images = 'images/test'; labels = 'labels/test' }
  }
  generated_at = (Get-Date).ToString('s')
}
$manifest | ConvertTo-Json -Depth 8 | Set-Content -Path $manifestPath -Encoding UTF8

$tmpPy = Join-Path $env:TEMP ("yolo_f2_onboard_" + [Guid]::NewGuid().ToString('N') + '.py')
@"
import sqlite3, json, uuid, datetime

db_path = r'''$DatabasePath'''
dataset_root = r'''$DatasetRoot'''
dataset_code = r'''$DatasetCode'''
dataset_name = r'''$DatasetName'''
dataset_version = r'''$DatasetVersion'''
manifest_path = r'''$manifestPath'''
dataset_yaml_path = r'''$DatasetRoot\dataset.yaml'''
train_cnt = $trainCnt
val_cnt = $valCnt
test_cnt = $testCnt
total_cnt = $totalCnt

now = datetime.datetime.utcnow().isoformat() + 'Z'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute('''
CREATE TABLE IF NOT EXISTS dataset_versions (
  id TEXT PRIMARY KEY,
  dataset_id TEXT NOT NULL,
  version TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  split_manifest_path TEXT DEFAULT '',
  dataset_yaml_path TEXT DEFAULT '',
  summary_json TEXT DEFAULT '{}',
  created_at TEXT,
  updated_at TEXT
)
''')

cur.execute("SELECT id FROM datasets WHERE dataset_code=? ORDER BY created_at DESC LIMIT 1", (dataset_code,))
r = cur.fetchone()
if r:
    dataset_id = r[0]
    cur.execute('''
      UPDATE datasets SET
        name=?, version=?, status='active', dataset_type='detection', storage_path=?, label_format='yolo',
        sample_count=?, train_count=?, val_count=?, test_count=?,
        source_template_code='vision_detect_yolo_basic', updated_at=?
      WHERE id=?
    ''', (dataset_name, dataset_version, dataset_root, total_cnt, train_cnt, val_cnt, test_cnt, now, dataset_id))
else:
    dataset_id = str(uuid.uuid4())
    cur.execute('''
      INSERT INTO datasets (
        id, dataset_code, name, version, status, dataset_type, storage_path, label_format,
        sample_count, train_count, val_count, test_count, description,
        tags_json, meta_json, source_task_id, source_template_code, created_at, updated_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ''', (
      dataset_id, dataset_code, dataset_name, dataset_version, 'active', 'detection', dataset_root, 'yolo',
      total_cnt, train_cnt, val_cnt, test_cnt, 'YOLO F2 onboarded dataset',
      '[]', '{}', None, 'vision_detect_yolo_basic', now, now
    ))

cur.execute("SELECT id FROM dataset_versions WHERE dataset_id=? AND version=?", (dataset_id, dataset_version))
if not cur.fetchone():
    cur.execute('''
      INSERT INTO dataset_versions (id,dataset_id,version,status,split_manifest_path,dataset_yaml_path,summary_json,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?)
    ''', (
      str(uuid.uuid4()), dataset_id, dataset_version, 'active', manifest_path, dataset_yaml_path,
      json.dumps({'total': total_cnt, 'train': train_cnt, 'val': val_cnt, 'test': test_cnt}, ensure_ascii=False), now, now
    ))

for split_name, count, rel in [('train', train_cnt, 'images/train'), ('val', val_cnt, 'images/val'), ('test', test_cnt, 'images/test')]:
    cur.execute('''
      INSERT OR REPLACE INTO dataset_splits (id,dataset_pipeline_run_id,dataset_id,split_name,sample_count,file_path,record_count,checksum,config_json,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)
    ''', (
      f"{dataset_id}:{split_name}", None, dataset_id, split_name, int(count), rel, int(count), '', '{}', now, now
    ))

try:
    cur.execute('''
      INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at)
      VALUES (?, 'dataset', 'yolo_f2_onboard', ?, 'success', ?, ?)
    ''', (
      str(uuid.uuid4()), dataset_id,
      json.dumps({'dataset_code': dataset_code, 'version': dataset_version, 'split_manifest_path': manifest_path, 'dataset_yaml_path': dataset_yaml_path}, ensure_ascii=False),
      now
    ))
except Exception:
    pass

conn.commit()
print(json.dumps({'ok': True, 'dataset_id': dataset_id, 'dataset_code': dataset_code, 'version': dataset_version, 'counts': {'total': total_cnt, 'train': train_cnt, 'val': val_cnt, 'test': test_cnt}, 'manifest_path': manifest_path, 'dataset_yaml_path': dataset_yaml_path}, ensure_ascii=False))
conn.close()
"@ | Set-Content -Path $tmpPy -Encoding UTF8

python $tmpPy
Remove-Item $tmpPy -Force
