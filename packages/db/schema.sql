CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  template_id TEXT,
  owner TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS task_steps (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  step_index INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  step_type TEXT,
  status TEXT NOT NULL,
  input_json TEXT,
  output_json TEXT,
  started_at TEXT,
  finished_at TEXT,
  FOREIGN KEY(task_id) REFERENCES tasks(id)
);

CREATE TABLE IF NOT EXISTS task_logs (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  step_id TEXT,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(task_id) REFERENCES tasks(id)
);

CREATE TABLE IF NOT EXISTS datasets (
  dataset_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  current_version TEXT,
  source_path TEXT,
  label_format TEXT,
  notes TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dataset_versions (
  id TEXT PRIMARY KEY,
  dataset_id TEXT NOT NULL,
  version TEXT NOT NULL,
  raw_path TEXT,
  clean_path TEXT,
  labels_path TEXT,
  split_manifest_path TEXT,
  sample_count INTEGER,
  created_at TEXT NOT NULL,
  FOREIGN KEY(dataset_id) REFERENCES datasets(dataset_id)
);

CREATE TABLE IF NOT EXISTS experiments (
  experiment_id TEXT PRIMARY KEY,
  task_id TEXT,
  dataset_version_id TEXT,
  config_path TEXT,
  train_entry TEXT,
  run_dir TEXT,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS experiment_metrics (
  id TEXT PRIMARY KEY,
  experiment_id TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(experiment_id) REFERENCES experiments(experiment_id)
);

CREATE TABLE IF NOT EXISTS models (
  model_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  source_experiment_id TEXT,
  checkpoint_path TEXT,
  export_path TEXT,
  release_note TEXT,
  created_at TEXT NOT NULL
);

-- v2.1.0: approvals table (upgraded from legacy 7-column shell)
CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY,
  -- legacy columns (kept for backward compat)
  task_id TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL DEFAULT '',
  approver TEXT,
  -- v2.1.0 columns (primary association)
  resource_type TEXT NOT NULL DEFAULT 'workflow_job',
  resource_id TEXT NOT NULL DEFAULT '',
  step_id TEXT,
  step_name TEXT,
  -- status & actor
  status TEXT NOT NULL DEFAULT 'pending',
  requested_by TEXT DEFAULT 'system',
  reviewed_by TEXT,
  reviewed_at TEXT,
  comment TEXT,
  -- v2.1.0 pack 2: policy engine
  policy_type TEXT NOT NULL DEFAULT 'manual',
  timeout_seconds INTEGER DEFAULT 0,
  expires_at TEXT,
  -- timestamps
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT,
  result TEXT,
  detail_json TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- ============================================
-- Plugin Registry V1 (Phase 0)
-- ============================================

CREATE TABLE IF NOT EXISTS plugin_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plugin_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'gated', 'trial', 'frozen', 'planned', 'residual')),
  execution_mode TEXT NOT NULL CHECK (execution_mode IN ('readonly', 'side_effect', 'resource_intensive')),
  requires_approval INTEGER NOT NULL DEFAULT 0,
  dry_run_supported INTEGER NOT NULL DEFAULT 0,
  ui_node_type TEXT CHECK (ui_node_type IN ('source', 'transform', 'sink', 'control')),
  allowed_upstream TEXT,
  allowed_downstream TEXT,
  input_schema TEXT,
  output_schema TEXT,
  icon TEXT,
  color TEXT,
  documentation_url TEXT,
  entry TEXT NOT NULL,
  capabilities TEXT NOT NULL,
  permissions TEXT,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  config_schema TEXT,
  enabled INTEGER NOT NULL DEFAULT 1,
  author TEXT,
  description TEXT,
  tags TEXT,
  manifest_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by TEXT,
  status_changed_at TEXT,
  status_changed_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_plugin_registry_status ON plugin_registry(status);
CREATE INDEX IF NOT EXISTS idx_plugin_registry_category ON plugin_registry(category);
CREATE INDEX IF NOT EXISTS idx_plugin_registry_enabled ON plugin_registry(enabled);
CREATE INDEX IF NOT EXISTS idx_plugin_registry_risk_level ON plugin_registry(risk_level);

CREATE TABLE IF NOT EXISTS plugin_status_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plugin_id TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT NOT NULL,
  reason TEXT,
  operator TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (plugin_id) REFERENCES plugin_registry(plugin_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_status_history_plugin_id ON plugin_status_history(plugin_id);
