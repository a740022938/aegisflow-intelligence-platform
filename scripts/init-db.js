#!/usr/bin/env node
/**
 * Initialize SQLite database
 * Creates all tables defined in apps/local-api/src/db/builtin-sqlite.ts
 * 
 * Run: node scripts/init-db.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DB_PATH = path.join(ROOT, 'packages', 'db', 'agi_factory.db');

// Check Node version - node:sqlite requires Node 22+
const major = parseInt(process.versions.node.split('.')[0], 10);
if (major < 22) {
  console.error('❌ 需要 Node.js v22+ (node:sqlite)');
  console.error(`   当前版本: v${process.versions.node}`);
  process.exit(1);
}

// Dynamic import for node:sqlite (ESM only in Node 22+)
async function init() {
  console.log('🗄️  初始化数据库...');
  console.log(`   路径: ${DB_PATH}`);
  
  // Ensure directory exists
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  // Import node:sqlite
  const { DatabaseSync } = await import('node:sqlite');
  
  // Open/create database
  const db = new DatabaseSync(DB_PATH);
  
  // Enable WAL mode
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  
  console.log('📝 创建表...');
  
  // All tables from builtin-sqlite.ts
  const tables = [
    // evaluations
    `CREATE TABLE IF NOT EXISTS evaluations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      evaluation_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      model_name TEXT DEFAULT '',
      artifact_name TEXT DEFAULT '',
      dataset_name TEXT DEFAULT '',
      dataset_id TEXT DEFAULT '',
      training_job_id TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      config_json TEXT DEFAULT '{}',
      result_summary_json TEXT DEFAULT '{}',
      error_message TEXT DEFAULT '',
      created_at TEXT,
      updated_at TEXT,
      started_at TEXT,
      finished_at TEXT
    )`,
    
    // evaluation_steps
    `CREATE TABLE IF NOT EXISTS evaluation_steps (
      id TEXT PRIMARY KEY,
      evaluation_id TEXT NOT NULL,
      step_order INTEGER NOT NULL,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      message TEXT DEFAULT '',
      started_at TEXT,
      finished_at TEXT,
      created_at TEXT,
      updated_at TEXT
    )`,
    
    // evaluation_logs
    `CREATE TABLE IF NOT EXISTS evaluation_logs (
      id TEXT PRIMARY KEY,
      evaluation_id TEXT NOT NULL,
      level TEXT NOT NULL DEFAULT 'info',
      message TEXT NOT NULL,
      created_at TEXT
    )`,
    
    // evaluation_metrics
    `CREATE TABLE IF NOT EXISTS evaluation_metrics (
      id TEXT PRIMARY KEY,
      evaluation_id TEXT NOT NULL,
      metric_key TEXT NOT NULL,
      metric_value TEXT NOT NULL,
      metric_text TEXT DEFAULT '',
      created_at TEXT
    )`,
    
    // artifacts
    `CREATE TABLE IF NOT EXISTS artifacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      artifact_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ready',
      source_type TEXT NOT NULL DEFAULT 'manual',
      training_job_id TEXT DEFAULT '',
      evaluation_id TEXT DEFAULT '',
      dataset_id TEXT DEFAULT '',
      parent_artifact_id TEXT DEFAULT '',
      model_family TEXT DEFAULT '',
      framework TEXT DEFAULT '',
      format TEXT DEFAULT '',
      version TEXT DEFAULT '',
      path TEXT DEFAULT '',
      file_size_bytes INTEGER,
      metadata_json TEXT DEFAULT '{}',
      metrics_snapshot_json TEXT DEFAULT '{}',
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    
    // deployments
    `CREATE TABLE IF NOT EXISTS deployments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      deployment_type TEXT NOT NULL,
      runtime TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'created',
      artifact_id TEXT,
      artifact_name TEXT,
      training_job_id TEXT,
      evaluation_id TEXT,
      host TEXT,
      port INTEGER,
      base_url TEXT,
      entrypoint TEXT,
      model_path TEXT,
      config_json TEXT,
      health_status TEXT DEFAULT 'unknown',
      last_health_check_at TEXT,
      started_at TEXT,
      stopped_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      notes TEXT
    )`,
    
    // deployment_logs
    `CREATE TABLE IF NOT EXISTS deployment_logs (
      id TEXT PRIMARY KEY,
      deployment_id TEXT NOT NULL,
      level TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`,
    
    // runs
    `CREATE TABLE IF NOT EXISTS runs (
      id TEXT PRIMARY KEY,
      run_code TEXT NOT NULL,
      name TEXT NOT NULL,
      source_type TEXT NOT NULL DEFAULT 'manual',
      source_id TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'queued',
      priority INTEGER DEFAULT 5,
      trigger_mode TEXT DEFAULT 'manual',
      executor_type TEXT DEFAULT 'mock',
      workspace_path TEXT DEFAULT '',
      config_json TEXT DEFAULT '{}',
      summary_json TEXT DEFAULT '{}',
      error_message TEXT DEFAULT '',
      started_at TEXT,
      finished_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    
    // run_steps
    `CREATE TABLE IF NOT EXISTS run_steps (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL,
      step_key TEXT NOT NULL,
      step_name TEXT NOT NULL,
      step_order INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      started_at TEXT,
      finished_at TEXT,
      duration_ms INTEGER DEFAULT 0,
      input_json TEXT DEFAULT '{}',
      output_json TEXT DEFAULT '{}',
      error_message TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    
    // run_logs
    `CREATE TABLE IF NOT EXISTS run_logs (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL,
      step_id TEXT DEFAULT '',
      log_level TEXT NOT NULL DEFAULT 'info',
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`,
    
    // run_artifacts
    `CREATE TABLE IF NOT EXISTS run_artifacts (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL,
      artifact_id TEXT DEFAULT '',
      relation_type TEXT DEFAULT 'output'
    )`,
    
    // experiments
    `CREATE TABLE IF NOT EXISTS experiments (
      id TEXT PRIMARY KEY,
      experiment_code TEXT,
      name TEXT,
      status TEXT DEFAULT 'draft',
      dataset_id TEXT,
      dataset_code TEXT,
      dataset_version TEXT,
      template_id TEXT,
      template_code TEXT,
      task_id TEXT,
      config_json TEXT DEFAULT '{}',
      metrics_json TEXT DEFAULT '{}',
      command_text TEXT,
      work_dir TEXT,
      output_dir TEXT,
      checkpoint_path TEXT,
      report_path TEXT,
      notes TEXT,
      created_at TEXT,
      updated_at TEXT,
      started_at TEXT,
      finished_at TEXT
    )`,
    
    // datasets
    `CREATE TABLE IF NOT EXISTS datasets (
      dataset_id TEXT PRIMARY KEY,
      id TEXT,
      dataset_code TEXT,
      name TEXT NOT NULL,
      version TEXT DEFAULT 'v1',
      status TEXT DEFAULT 'draft',
      dataset_type TEXT DEFAULT 'other',
      storage_path TEXT DEFAULT '',
      label_format TEXT,
      sample_count INTEGER DEFAULT 0,
      train_count INTEGER DEFAULT 0,
      val_count INTEGER DEFAULT 0,
      test_count INTEGER DEFAULT 0,
      description TEXT DEFAULT '',
      tags_json TEXT DEFAULT '[]',
      meta_json TEXT DEFAULT '{}',
      source_task_id TEXT,
      source_template_code TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT
    )`,
    
    // templates
    `CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      template_type TEXT NOT NULL,
      steps_json TEXT DEFAULT '[]',
      params_json TEXT DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    
    // tasks
    `CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      priority INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      completed_at TEXT,
      metadata TEXT
    )`,
    
    // task_steps
    `CREATE TABLE IF NOT EXISTS task_steps (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      step_index INTEGER NOT NULL,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      started_at TEXT,
      completed_at TEXT,
      result TEXT,
      error TEXT
    )`,
    
    // task_logs
    `CREATE TABLE IF NOT EXISTS task_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id TEXT NOT NULL,
      step_id TEXT,
      level TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      metadata TEXT
    )`,
    
    // dataset_pipeline_configs
    `CREATE TABLE IF NOT EXISTS dataset_pipeline_configs (
      id TEXT PRIMARY KEY,
      config_code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      pipeline_type TEXT NOT NULL,
      steps_json TEXT DEFAULT '[]',
      default_params_json TEXT DEFAULT '{}',
      env_vars_json TEXT DEFAULT '{}',
      is_builtin INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    
    // dataset_pipeline_runs
    `CREATE TABLE IF NOT EXISTS dataset_pipeline_runs (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL UNIQUE,
      dataset_id TEXT NOT NULL,
      pipeline_config_id TEXT,
      pipeline_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued',
      config_json TEXT DEFAULT '{}',
      input_sample_count INTEGER DEFAULT 0,
      output_sample_count INTEGER DEFAULT 0,
      error_message TEXT DEFAULT '',
      started_at TEXT,
      finished_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    
    // dataset_splits
    `CREATE TABLE IF NOT EXISTS dataset_splits (
      id TEXT PRIMARY KEY,
      dataset_pipeline_run_id TEXT,
      dataset_id TEXT NOT NULL,
      split_name TEXT NOT NULL,
      sample_count INTEGER DEFAULT 0,
      file_path TEXT DEFAULT '',
      record_count INTEGER DEFAULT 0,
      checksum TEXT DEFAULT '',
      config_json TEXT DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    
    // training_configs
    `CREATE TABLE IF NOT EXISTS training_configs (
      id TEXT PRIMARY KEY,
      config_code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      model_name TEXT DEFAULT '',
      dataset_id TEXT DEFAULT '',
      config_json TEXT DEFAULT '{}',
      params_json TEXT DEFAULT '{}',
      resource_json TEXT DEFAULT '{}',
      is_builtin INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    
    // training_checkpoints
    `CREATE TABLE IF NOT EXISTS training_checkpoints (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL,
      step INTEGER DEFAULT 0,
      epoch INTEGER DEFAULT 0,
      checkpoint_path TEXT DEFAULT '',
      metrics_json TEXT DEFAULT '{}',
      is_best INTEGER DEFAULT 0,
      is_latest INTEGER DEFAULT 1,
      file_size_bytes INTEGER,
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    
    // models
    `CREATE TABLE IF NOT EXISTS models (
      model_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      version TEXT NOT NULL,
      source_experiment_id TEXT,
      checkpoint_path TEXT,
      export_path TEXT,
      release_note TEXT,
      created_at TEXT NOT NULL
    )`,
    
    // approvals
    `CREATE TABLE IF NOT EXISTS approvals (
      id TEXT PRIMARY KEY,
      resource_type TEXT NOT NULL,
      resource_id TEXT NOT NULL,
      action TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      requested_by TEXT,
      requested_at TEXT NOT NULL,
      reviewed_by TEXT,
      reviewed_at TEXT,
      comments TEXT
    )`,
    
    // audit_logs
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      action TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      timestamp TEXT NOT NULL
    )`,
    
    // settings
    `CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      description TEXT,
      updated_at TEXT NOT NULL
    )`,
  ];
  
  // Create tables
  for (const sql of tables) {
    db.exec(sql);
  }
  
  // Create indexes
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status)',
    'CREATE INDEX IF NOT EXISTS idx_deployments_artifact ON deployments(artifact_id)',
    'CREATE INDEX IF NOT EXISTS idx_runs_status ON runs(status)',
    'CREATE INDEX IF NOT EXISTS idx_runs_source ON runs(source_type, source_id)',
    'CREATE INDEX IF NOT EXISTS idx_runsteps_run ON run_steps(run_id)',
    'CREATE INDEX IF NOT EXISTS idx_runlogs_run ON run_logs(run_id)',
    'CREATE INDEX IF NOT EXISTS idx_runartifacts_run ON run_artifacts(run_id)',
    'CREATE INDEX IF NOT EXISTS idx_dpr_run ON dataset_pipeline_runs(run_id)',
    'CREATE INDEX IF NOT EXISTS idx_dpr_dataset ON dataset_pipeline_runs(dataset_id)',
    'CREATE INDEX IF NOT EXISTS idx_ds_pipeline ON dataset_splits(dataset_pipeline_run_id)',
    'CREATE INDEX IF NOT EXISTS idx_ds_dataset ON dataset_splits(dataset_id)',
    'CREATE INDEX IF NOT EXISTS idx_training_configs_code ON training_configs(config_code)',
    'CREATE INDEX IF NOT EXISTS idx_tc_run ON training_checkpoints(run_id)',
    'CREATE INDEX IF NOT EXISTS idx_tc_epoch ON training_checkpoints(epoch)',
    'CREATE INDEX IF NOT EXISTS idx_deplogs_deployment ON deployment_logs(deployment_id)',
  ];
  
  for (const sql of indexes) {
    db.exec(sql);
  }
  
  // Verify
  const result = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
  
  console.log(`\n✅ 数据库初始化完成`);
  console.log(`   表数量: ${result.length}`);
  console.log(`   表列表: ${result.map(r => r.name).join(', ')}`);
  
  db.close();
}

init().catch(err => {
  console.error('❌ 初始化失败:', err.message);
  process.exit(1);
});
