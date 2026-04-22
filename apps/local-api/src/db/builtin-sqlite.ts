import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';

// 数据库文件路径 - 支持环境变量覆盖，否则使用相对路径
// 优先级: SQLITE_DB_PATH > 相对路径
function getDbPath(): string {
  if (process.env.SQLITE_DB_PATH) {
    return path.resolve(process.env.SQLITE_DB_PATH);
  }
  // 基于模块目录定位，避免受 process.cwd() 影响
  // src/db/builtin-sqlite.ts -> repo/packages/db/agi_factory.db
  return path.resolve(__dirname, '../../../../packages/db/agi_factory.db');
}

const dbPath = getDbPath();

// 数据库实例
let dbInstance: DatabaseSync | null = null;

/**
 * 获取数据库实例
 */
export function getDatabase(): DatabaseSync {
  if (!dbInstance) {
    console.log(`📊 连接数据库: ${dbPath}`);

    // 检查数据库文件是否存在，不存在则自动创建
    if (!fs.existsSync(dbPath)) {
      console.log(`📝 数据库文件不存在，自动创建...`);
      // 确保目录存在
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      // 创建空文件，表结构会在下面自动创建
      fs.writeFileSync(dbPath, '');
    }

    // 打开数据库连接
    dbInstance = new DatabaseSync(dbPath, { readOnly: false });

    // 启用WAL模式（如果支持）
    try {
      dbInstance.exec('PRAGMA journal_mode = WAL;');
    } catch (error) {
      // 忽略WAL设置错误
    }

// 确保 datasets 表有必要的列 - 逐个添加
    const requiredColumns = [
      { name: 'dataset_code', type: 'TEXT' },
      { name: 'version', type: "TEXT DEFAULT 'v1'" },
      { name: 'status', type: "TEXT DEFAULT 'draft'" },
      { name: 'dataset_type', type: "TEXT DEFAULT 'other'" },
      { name: 'storage_path', type: "TEXT DEFAULT ''" },
      { name: 'label_format', type: "TEXT" },
      { name: 'sample_count', type: 'INTEGER DEFAULT 0' },
      { name: 'train_count', type: 'INTEGER DEFAULT 0' },
      { name: 'val_count', type: 'INTEGER DEFAULT 0' },
      { name: 'test_count', type: 'INTEGER DEFAULT 0' },
      { name: 'description', type: "TEXT DEFAULT ''" },
      { name: 'tags_json', type: "TEXT DEFAULT '[]'" },
      { name: 'meta_json', type: "TEXT DEFAULT '{}'" },
      { name: 'source_task_id', type: 'TEXT' },
      { name: 'source_template_code', type: 'TEXT' },
      { name: 'updated_at', type: 'TEXT' },
    ];

    // 先添加 id 列
    try {
      dbInstance.exec('ALTER TABLE datasets ADD COLUMN id TEXT');
    } catch (e) {}

    // 然后逐个添加其他列
    for (const col of requiredColumns) {
      try {
        dbInstance.exec(`ALTER TABLE datasets ADD COLUMN ${col.name} ${col.type}`);
      } catch (e) {
        // 列可能已存在，忽略错误
      }
    }
    console.log('✅ datasets 表列已确保存在');

    // 确保 experiments 表有必要的列
    const experimentColumns = [
      { name: 'id', type: 'TEXT' },
      { name: 'experiment_code', type: 'TEXT' },
      { name: 'name', type: 'TEXT' },
      { name: 'status', type: "TEXT DEFAULT 'draft'" },
      { name: 'dataset_id', type: 'TEXT' },
      { name: 'dataset_code', type: 'TEXT' },
      { name: 'dataset_version', type: 'TEXT' },
      { name: 'template_id', type: 'TEXT' },
      { name: 'template_code', type: 'TEXT' },
      { name: 'task_id', type: 'TEXT' },
      { name: 'config_json', type: "TEXT DEFAULT '{}'" },
      { name: 'metrics_json', type: "TEXT DEFAULT '{}'" },
      { name: 'command_text', type: 'TEXT' },
      { name: 'work_dir', type: 'TEXT' },
      { name: 'output_dir', type: 'TEXT' },
      { name: 'checkpoint_path', type: 'TEXT' },
      { name: 'report_path', type: 'TEXT' },
      { name: 'notes', type: 'TEXT' },
      { name: 'created_at', type: 'TEXT' },
      { name: 'updated_at', type: 'TEXT' },
      { name: 'started_at', type: 'TEXT' },
      { name: 'finished_at', type: 'TEXT' },
      // v3.3.0: Execution strictness & persistence
      { name: 'execution_mode', type: "TEXT DEFAULT ''" },
      { name: 'preflight_status', type: "TEXT DEFAULT ''" },
      { name: 'config_snapshot_path', type: "TEXT DEFAULT ''" },
      { name: 'env_snapshot_path', type: "TEXT DEFAULT ''" },
      { name: 'resume_used', type: "INTEGER DEFAULT 0" },
      { name: 'final_device', type: "TEXT DEFAULT ''" },
      // v3.4.0: Evaluation reporting
      { name: 'report_path', type: "TEXT DEFAULT ''" },
      { name: 'eval_manifest_path', type: "TEXT DEFAULT ''" },
      { name: 'badcases_manifest_path', type: "TEXT DEFAULT ''" },
      { name: 'hardcases_manifest_path', type: "TEXT DEFAULT ''" },
    ];

    for (const col of experimentColumns) {
      try {
        dbInstance.exec(`ALTER TABLE experiments ADD COLUMN ${col.name} ${col.type}`);
      } catch (e) {}
    }
    console.log('✅ experiments 表列已确保存在');

    // 确保 evaluation 相关表存在
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS evaluations (
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
        finished_at TEXT,
        experiment_id TEXT DEFAULT '',
        artifact_id TEXT DEFAULT ''
      );
    `); } catch (e) {}
    console.log('✅ evaluations 表已确保存在');

    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS evaluation_steps (
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
      );
    `); } catch (e) {}
    console.log('✅ evaluation_steps 表已确保存在');

    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS evaluation_logs (
        id TEXT PRIMARY KEY,
        evaluation_id TEXT NOT NULL,
        level TEXT NOT NULL DEFAULT 'info',
        message TEXT NOT NULL,
        created_at TEXT
      );
    `); } catch (e) {}
    console.log('✅ evaluation_logs 表已确保存在');

    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS evaluation_metrics (
        id TEXT PRIMARY KEY,
        evaluation_id TEXT NOT NULL,
        metric_key TEXT NOT NULL,
        metric_value TEXT NOT NULL,
        metric_text TEXT DEFAULT '',
        created_at TEXT
      );
    `); } catch (e) {}
    console.log('✅ evaluation_metrics 表已确保存在');

    // 确保 artifacts 表存在
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS artifacts (
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
      );
    `); } catch (e) {}
    console.log('✅ artifacts 表已确保存在');
    // 确保 deployments 表存在
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS deployments (
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
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('deployments 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_deployments_artifact ON deployments(artifact_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_deployments_training ON deployments(training_job_id)'); } catch(e) {}
    console.log('✅ deployments 表已确保存在');

    // 确保 deployment_logs 表存在
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS deployment_logs (
        id TEXT PRIMARY KEY,
        deployment_id TEXT NOT NULL,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('deployment_logs 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_deplogs_deployment ON deployment_logs(deployment_id)'); } catch(e) {}
    console.log('✅ deployment_logs 表已确保存在');

    // ── runs 表 ──────────────────────────────────────────────────────────────
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS runs (
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
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('runs 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_runs_status ON runs(status)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_runs_source ON runs(source_type, source_id)'); } catch(e) {}
    console.log('✅ runs 表已确保存在');

    // ── run_steps 表 ──────────────────────────────────────────────────────────
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS run_steps (
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
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('run_steps 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_runsteps_run ON run_steps(run_id)'); } catch(e) {}
    console.log('✅ run_steps 表已确保存在');

    // ── run_logs 表 ───────────────────────────────────────────────────────────
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS run_logs (
        id TEXT PRIMARY KEY,
        run_id TEXT NOT NULL,
        step_id TEXT DEFAULT '',
        log_level TEXT NOT NULL DEFAULT 'info',
        message TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('run_logs 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_runlogs_run ON run_logs(run_id)'); } catch(e) {}
    console.log('✅ run_logs 表已确保存在');

    // ── run_artifacts 表 ─────────────────────────────────────────────────────
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS run_artifacts (
        id TEXT PRIMARY KEY,
        run_id TEXT NOT NULL,
        artifact_id TEXT DEFAULT '',
        relation_type TEXT DEFAULT 'output'
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('run_artifacts 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_runartifacts_run ON run_artifacts(run_id)'); } catch(e) {}
    console.log('✅ run_artifacts 表已确保存在');

    // ── dataset_pipeline_configs 表 ──────────────────────────────────────────
    // 可复用的数据集处理 pipeline 配置模板
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS dataset_pipeline_configs (
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
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('dataset_pipeline_configs 建表错误:', e.message); }
    console.log('✅ dataset_pipeline_configs 表已确保存在');

    // ── dataset_pipeline_runs 表 ─────────────────────────────────────────────
    // 数据集导入/清洗/split 的执行记录，直接挂 runs 体系
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS dataset_pipeline_runs (
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
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('dataset_pipeline_runs 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_dpr_run ON dataset_pipeline_runs(run_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_dpr_dataset ON dataset_pipeline_runs(dataset_id)'); } catch(e) {}
    console.log('✅ dataset_pipeline_runs 表已确保存在');

    // ── dataset_splits 表 ────────────────────────────────────────────────────
    // 数据集 split manifest，记录 train/val/test split 结果
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS dataset_splits (
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
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('dataset_splits 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_ds_pipeline ON dataset_splits(dataset_pipeline_run_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_ds_dataset ON dataset_splits(dataset_id)'); } catch(e) {}
    console.log('✅ dataset_splits 表已确保存在');

    // ── training_configs 表 ──────────────────────────────────────────────────
    // 可复用的训练参数模板
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS training_configs (
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
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('training_configs 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_training_configs_code ON training_configs(config_code)'); } catch(e) {}
    console.log('✅ training_configs 表已确保存在');

    // ── training_checkpoints 表 ──────────────────────────────────────────────
    // 训练 checkpoint 记录，直接挂 runs 体系
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS training_checkpoints (
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
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('training_checkpoints 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_tc_run ON training_checkpoints(run_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_tc_epoch ON training_checkpoints(epoch)'); } catch(e) {}
    console.log('✅ training_checkpoints 表已确保存在');

    // 确保 model_packages 表存在
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS model_packages (
        id TEXT PRIMARY KEY,
        model_id TEXT NOT NULL,
        package_name TEXT NOT NULL,
        package_version TEXT NOT NULL DEFAULT '1.0.0',
        status TEXT NOT NULL DEFAULT 'draft',
        artifact_ids_json TEXT DEFAULT '[]',
        manifest_json TEXT DEFAULT '{}',
        release_note TEXT DEFAULT '',
        storage_path TEXT DEFAULT '',
        file_size_bytes INTEGER DEFAULT 0,
        checksum TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('model_packages 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_mp_model ON model_packages(model_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_mp_status ON model_packages(status)'); } catch(e) {}
    console.log('✅ model_packages 表已确保存在');

    // 确保 model_package_artifacts 表存在
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS model_package_artifacts (
        id TEXT PRIMARY KEY,
        package_id TEXT NOT NULL,
        artifact_id TEXT NOT NULL,
        artifact_role TEXT DEFAULT 'primary',
        relative_path TEXT DEFAULT '',
        checksum TEXT DEFAULT '',
        file_size_bytes INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('model_package_artifacts 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_mpa_package ON model_package_artifacts(package_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_mpa_artifact ON model_package_artifacts(artifact_id)'); } catch(e) {}
    console.log('✅ model_package_artifacts 表已确保存在');

    // 确保 deployment_targets 表存在
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS deployment_targets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        target_type TEXT NOT NULL DEFAULT 'server',
        host TEXT NOT NULL,
        port INTEGER DEFAULT 80,
        base_url TEXT DEFAULT '',
        region TEXT DEFAULT '',
        environment TEXT DEFAULT 'development',
        credentials_json TEXT DEFAULT '{}',
        config_json TEXT DEFAULT '{}',
        status TEXT DEFAULT 'active',
        last_health_check_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('deployment_targets 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_dt_status ON deployment_targets(status)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_dt_type ON deployment_targets(target_type)'); } catch(e) {}
    console.log('✅ deployment_targets 表已确保存在');

    // 确保 deployment_revisions 表存在
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS deployment_revisions (
        id TEXT PRIMARY KEY,
        deployment_id TEXT NOT NULL,
        package_id TEXT,
        artifact_id TEXT,
        revision_number INTEGER NOT NULL DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'pending',
        config_snapshot_json TEXT DEFAULT '{}',
        deployed_at TEXT,
        health_status TEXT DEFAULT 'unknown',
        notes TEXT DEFAULT '',
        created_at TEXT NOT NULL
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('deployment_revisions 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_dr_deployment ON deployment_revisions(deployment_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_dr_package ON deployment_revisions(package_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_dr_status ON deployment_revisions(status)'); } catch(e) {}
    console.log('✅ deployment_revisions 表已确保存在');

    // ── task_steps 表（兼容历史 task steps API） ───────────────────────────────
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS task_steps (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        step_name TEXT NOT NULL,
        step_type TEXT DEFAULT '',
        step_index INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        started_at TEXT,
        finished_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `); } catch(e) { if (!(e as Error).message.includes('already exists')) console.error('task_steps 建表错误:', (e as Error).message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_task_steps_task ON task_steps(task_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_task_steps_task_idx ON task_steps(task_id, step_index)'); } catch(e) {}
    console.log('✅ task_steps 表已确保存在');

    // ── task_logs 表（兼容历史 task logs API） ────────────────────────────────
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS task_logs (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        step_id TEXT,
        level TEXT NOT NULL DEFAULT 'info',
        message TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `); } catch(e) { if (!(e as Error).message.includes('already exists')) console.error('task_logs 建表错误:', (e as Error).message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_task_logs_task ON task_logs(task_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_task_logs_task_time ON task_logs(task_id, created_at)'); } catch(e) {}
    console.log('✅ task_logs 表已确保存在');

    // ── templates 表 (workflow 模板) ────────────────────────────────────────────
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        category TEXT,
        version TEXT NOT NULL DEFAULT '1.0.0',
        status TEXT NOT NULL DEFAULT 'active',
        description TEXT,
        definition_json TEXT,
        input_schema_json TEXT,
        default_input_json TEXT,
        workflow_steps_json TEXT,
        is_builtin INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('templates 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_templates_code ON templates(code)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category)'); } catch(e) {}
    console.log('✅ templates 表已确保存在');

    // ── workflow_jobs 表 ───────────────────────────────────────────────────────
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS workflow_jobs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        template_id TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        current_step_index INTEGER DEFAULT 0,
        input_json TEXT,
        output_summary_json TEXT,
        error_message TEXT,
        -- v4.3.0: Pipeline controls
        execution_scope TEXT DEFAULT 'full',      -- full | partial | range
        start_step TEXT DEFAULT '',
        end_step TEXT DEFAULT '',
        skip_steps_json TEXT DEFAULT '[]',
        resume_pointer TEXT DEFAULT '',
        resumed_by TEXT DEFAULT '',
        resumed_at TEXT DEFAULT '',
        control_version INTEGER DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        finished_at TEXT
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('workflow_jobs 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_wj_status ON workflow_jobs(status)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_wj_template ON workflow_jobs(template_id)'); } catch(e) {}
    console.log('✅ workflow_jobs 表已确保存在');

    // ── job_steps 表 ───────────────────────────────────────────────────────────
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS job_steps (
        id TEXT PRIMARY KEY,
        job_id TEXT NOT NULL,
        step_order INTEGER NOT NULL,
        step_key TEXT NOT NULL,
        step_name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        input_json TEXT,
        output_json TEXT,
        error_message TEXT,
        started_at TEXT,
        finished_at TEXT,
        duration_ms INTEGER,
        retry_count INTEGER DEFAULT 0,
        -- v4.3.0: Step controls
        last_error_summary TEXT DEFAULT '',
        resumable INTEGER DEFAULT 1,
        can_retry INTEGER DEFAULT 1,
        resumed_from_step TEXT DEFAULT '',
        resumed_at TEXT DEFAULT '',
        skipped_reason TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY(job_id) REFERENCES workflow_jobs(id)
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('job_steps 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_js_job ON job_steps(job_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_js_status ON job_steps(status)'); } catch(e) {}
    console.log('✅ job_steps 表已确保存在');

    // ── job_logs 表 ────────────────────────────────────────────────────────────
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS job_logs (
        id TEXT PRIMARY KEY,
        job_id TEXT NOT NULL,
        step_id TEXT,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(job_id) REFERENCES workflow_jobs(id)
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('job_logs 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_jl_job ON job_logs(job_id)'); } catch(e) {}
    console.log('✅ job_logs 表已确保存在');

    // ── audit_logs 表 ──────────────────────────────────────────────────────────
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        action TEXT NOT NULL,
        target TEXT NOT NULL,
        result TEXT NOT NULL,
        detail_json TEXT,
        created_at TEXT NOT NULL
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('audit_logs 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_al_category ON audit_logs(category)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_al_action ON audit_logs(action)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_al_target ON audit_logs(target)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_al_created ON audit_logs(created_at)'); } catch(e) {}
    console.log('✅ audit_logs 表已确保存在');

    // ── task_reflections 表 (Phase 1A) ────────────────────────────────────────
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS task_reflections (
        id TEXT PRIMARY KEY,
        job_id TEXT NOT NULL,
        template_id TEXT DEFAULT '',
        status TEXT NOT NULL,
        what_failed TEXT DEFAULT '',
        what_worked TEXT DEFAULT '',
        root_cause TEXT DEFAULT '',
        wrong_assumption TEXT DEFAULT '',
        fix_applied TEXT DEFAULT '',
        evidence_json TEXT DEFAULT '{}',
        next_time_rule_draft TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('task_reflections 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_tr_job ON task_reflections(job_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_tr_template ON task_reflections(template_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_tr_created ON task_reflections(created_at)'); } catch(e) {}
    console.log('✅ task_reflections 表已确保存在 (Phase 1A)');

    // ── failure_signatures 表 (Phase 1A) ──────────────────────────────────────
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS failure_signatures (
        id TEXT PRIMARY KEY,
        signature_hash TEXT NOT NULL UNIQUE,
        step_key TEXT NOT NULL,
        error_type TEXT NOT NULL,
        message_fingerprint TEXT DEFAULT '',
        context_json TEXT DEFAULT '{}',
        hit_count INTEGER NOT NULL DEFAULT 1,
        first_seen_at TEXT NOT NULL,
        last_seen_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('failure_signatures 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_fs_step ON failure_signatures(step_key)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_fs_error_type ON failure_signatures(error_type)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_fs_last_seen ON failure_signatures(last_seen_at)'); } catch(e) {}
    console.log('✅ failure_signatures 表已确保存在 (Phase 1A)');

    // ── error_patterns 表 (Phase 2) ───────────────────────────────────────────
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS error_patterns (
        id TEXT PRIMARY KEY,
        pattern_name TEXT NOT NULL,
        step_key TEXT NOT NULL,
        error_type TEXT NOT NULL,
        message_fingerprint TEXT DEFAULT '',
        root_cause_class TEXT DEFAULT 'execution_error',
        recommended_actions_json TEXT DEFAULT '[]',
        latest_evidence_json TEXT DEFAULT '{}',
        hit_count INTEGER NOT NULL DEFAULT 0,
        last_seen_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('error_patterns 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_ep_step ON error_patterns(step_key)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_ep_error_type ON error_patterns(error_type)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_ep_last_seen ON error_patterns(last_seen_at)'); } catch(e) {}
    try { dbInstance.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_ep_cluster ON error_patterns(step_key, error_type, message_fingerprint)'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE error_patterns ADD COLUMN assistant_backflow_json TEXT NOT NULL DEFAULT \"{}\"'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE error_patterns ADD COLUMN assistant_adopted_count INTEGER NOT NULL DEFAULT 0'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE error_patterns ADD COLUMN assistant_rejected_count INTEGER NOT NULL DEFAULT 0'); } catch(e) {}
    console.log('✅ error_patterns 表已确保存在 (Phase 2)');

    // ── learned_rules 表 (Phase 3) ───────────────────────────────────────────
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS learned_rules (
        id TEXT PRIMARY KEY,
        rule_code TEXT NOT NULL UNIQUE,
        scope TEXT NOT NULL,
        trigger_json TEXT NOT NULL DEFAULT '{}',
        action_json TEXT NOT NULL DEFAULT '{}',
        mode TEXT NOT NULL DEFAULT 'suggest',
        approval_required INTEGER NOT NULL DEFAULT 0,
        enabled INTEGER NOT NULL DEFAULT 1,
        confidence REAL NOT NULL DEFAULT 0.0,
        version INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('learned_rules 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_lr_scope ON learned_rules(scope)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_lr_enabled ON learned_rules(enabled)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_lr_mode ON learned_rules(mode)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_lr_confidence ON learned_rules(confidence)'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE learned_rules ADD COLUMN status TEXT NOT NULL DEFAULT \"active\"'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE learned_rules ADD COLUMN quality_score REAL NOT NULL DEFAULT 0'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE learned_rules ADD COLUMN candidate_level TEXT NOT NULL DEFAULT \"none\"'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE learned_rules ADD COLUMN last_evaluated_at TEXT DEFAULT \"\"'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE learned_rules ADD COLUMN promotion_requested_at TEXT DEFAULT \"\"'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE learned_rules ADD COLUMN promotion_reviewed_at TEXT DEFAULT \"\"'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE learned_rules ADD COLUMN promotion_reviewed_by TEXT DEFAULT \"\"'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE learned_rules ADD COLUMN last_matched_at TEXT DEFAULT \"\"'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_lr_status ON learned_rules(status)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_lr_candidate ON learned_rules(candidate_level)'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE learned_rules ADD COLUMN assistant_evidence_json TEXT NOT NULL DEFAULT \"{}\"'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE learned_rules ADD COLUMN assistant_adoption_rate REAL NOT NULL DEFAULT 0'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE learned_rules ADD COLUMN cloud_helpful INTEGER NOT NULL DEFAULT 0'); } catch(e) {}
    console.log('✅ learned_rules 表已确保存在 (Phase 3)');

    // ── rule_feedback 表 (Phase 4) ───────────────────────────────────────────
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS rule_feedback (
        id TEXT PRIMARY KEY,
        rule_id TEXT NOT NULL,
        job_id TEXT DEFAULT '',
        step_id TEXT DEFAULT '',
        feedback_type TEXT NOT NULL,
        comment TEXT DEFAULT '',
        created_by TEXT DEFAULT 'operator',
        created_at TEXT NOT NULL
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('rule_feedback 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_rf_rule ON rule_feedback(rule_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_rf_type ON rule_feedback(feedback_type)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_rf_created ON rule_feedback(created_at)'); } catch(e) {}
    console.log('✅ rule_feedback 表已确保存在 (Phase 4)');

    // ── plugin_registry 表 (M8) ──────────────────────────────────────────────
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS plugin_registry (
        plugin_id TEXT PRIMARY KEY,
        plugin_name TEXT NOT NULL,
        version TEXT DEFAULT '',
        capability TEXT DEFAULT '',
        source TEXT NOT NULL DEFAULT 'builtin',
        enabled INTEGER NOT NULL DEFAULT 0,
        active INTEGER NOT NULL DEFAULT 0,
        init_status TEXT NOT NULL DEFAULT 'pending',
        error_reason TEXT DEFAULT '',
        discovered_at TEXT NOT NULL,
        initialized_at TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('plugin_registry 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_pr_source ON plugin_registry(source)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_pr_init_status ON plugin_registry(init_status)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_pr_active ON plugin_registry(active)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_pr_updated ON plugin_registry(updated_at)'); } catch(e) {}
    console.log('✅ plugin_registry 表已确保存在 (M8)');

    // ── plugin_init_runs 表 (M8) ─────────────────────────────────────────────
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS plugin_init_runs (
        id TEXT PRIMARY KEY,
        init_status TEXT NOT NULL,
        plugin_system_enabled INTEGER NOT NULL DEFAULT 1,
        plugin_system_active INTEGER NOT NULL DEFAULT 0,
        discovered_count INTEGER NOT NULL DEFAULT 0,
        success_count INTEGER NOT NULL DEFAULT 0,
        failed_count INTEGER NOT NULL DEFAULT 0,
        error_summary TEXT DEFAULT '',
        started_at TEXT NOT NULL,
        finished_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('plugin_init_runs 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_pir_created ON plugin_init_runs(created_at)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_pir_status ON plugin_init_runs(init_status)'); } catch(e) {}
    console.log('✅ plugin_init_runs 表已确保存在 (M8)');

    // ── plugin_events 表 (M9) ────────────────────────────────────────────────
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS plugin_events (
        id TEXT PRIMARY KEY,
        plugin_id TEXT NOT NULL,
        plugin_name TEXT NOT NULL,
        action TEXT NOT NULL,
        before_status TEXT NOT NULL,
        after_status TEXT NOT NULL,
        reason TEXT DEFAULT '',
        created_at TEXT NOT NULL
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('plugin_events 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_pe_plugin ON plugin_events(plugin_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_pe_action ON plugin_events(action)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_pe_created ON plugin_events(created_at)'); } catch(e) {}
    console.log('✅ plugin_events 表已确保存在 (M9)');

    // ── knowledge_entries 表 (v6.1.0) ─────────────────────────────────────────
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS knowledge_entries (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'general_note',
        source_type TEXT DEFAULT 'general',
        source_id TEXT DEFAULT '',
        summary TEXT DEFAULT '',
        problem TEXT DEFAULT '',
        resolution TEXT DEFAULT '',
        conclusion TEXT DEFAULT '',
        recommendation TEXT DEFAULT '',
        tags_json TEXT DEFAULT '[]',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('knowledge_entries 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_ke_category ON knowledge_entries(category)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_ke_source ON knowledge_entries(source_type, source_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_ke_created ON knowledge_entries(created_at)'); } catch(e) {}
    console.log('✅ knowledge_entries 表已确保存在');

    // ── knowledge_links 表 (v6.1.0) ─────────────────────────────────────────
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS knowledge_links (
        id TEXT PRIMARY KEY,
        knowledge_id TEXT NOT NULL,
        target_type TEXT NOT NULL,
        target_id TEXT NOT NULL,
        relation_type TEXT NOT NULL DEFAULT 'relates_to',
        created_at TEXT NOT NULL
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('knowledge_links 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_kl_kid ON knowledge_links(knowledge_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_kl_target ON knowledge_links(target_type, target_id)'); } catch(e) {}
    console.log('✅ knowledge_links 表已确保存在');

    // ── feedback_batches 表 (v6.3.0) ──────────────────────────────────────
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS feedback_batches (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        source_type TEXT NOT NULL DEFAULT 'evaluation',
        source_id TEXT DEFAULT '',
        trigger_type TEXT NOT NULL DEFAULT 'failed_case',
        status TEXT NOT NULL DEFAULT 'draft',
        item_count INTEGER DEFAULT 0,
        notes TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('feedback_batches 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_fb_trigger ON feedback_batches(trigger_type)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_fb_status ON feedback_batches(status)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_fb_source ON feedback_batches(source_type, source_id)'); } catch(e) {}
    console.log('✅ feedback_batches 表已确保存在 (v6.3.0)');

    // ── feedback_items 表 (v6.3.0) ────────────────────────────────────────
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS feedback_items (
        id TEXT PRIMARY KEY,
        batch_id TEXT NOT NULL,
        file_path TEXT DEFAULT '',
        label_json TEXT DEFAULT '{}',
        reason TEXT DEFAULT '',
        confidence REAL DEFAULT 0,
        source_task_id TEXT DEFAULT '',
        source_model_id TEXT DEFAULT '',
        source_dataset_id TEXT DEFAULT '',
        predicted_label TEXT DEFAULT '',
        ground_truth TEXT DEFAULT '',
        status TEXT NOT NULL DEFAULT 'pending',
        reviewed_at TEXT DEFAULT '',
        reviewed_by TEXT DEFAULT '',
        created_at TEXT NOT NULL
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('feedback_items 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_fi_batch ON feedback_items(batch_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_fi_status ON feedback_items(status)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_fi_model ON feedback_items(source_model_id)'); } catch(e) {}
    console.log('✅ feedback_items 表已确保存在 (v6.3.0)');

    // ── route_policies 表 (v6.4.0) ────────────────────────────────────────
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS route_policies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        task_type TEXT NOT NULL,
        route_type TEXT NOT NULL,
        priority INTEGER NOT NULL DEFAULT 100,
        status TEXT NOT NULL DEFAULT 'active',
        reason_template TEXT DEFAULT '',
        metadata_json TEXT DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('route_policies 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_rp_task_type ON route_policies(task_type)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_rp_route_type ON route_policies(route_type)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_rp_status ON route_policies(status)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_rp_priority ON route_policies(priority)'); } catch(e) {}
    console.log('✅ route_policies 表已确保存在 (v6.4.0)');

    // ── route_decisions 表 (v6.4.0) ───────────────────────────────────────
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS route_decisions (
        id TEXT PRIMARY KEY,
        task_id TEXT DEFAULT '',
        task_type TEXT NOT NULL,
        policy_id TEXT DEFAULT '',
        route_type TEXT NOT NULL,
        route_reason TEXT NOT NULL,
        input_json TEXT DEFAULT '{}',
        created_at TEXT NOT NULL
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('route_decisions 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_rd_task_type ON route_decisions(task_type)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_rd_route_type ON route_decisions(route_type)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_rd_created ON route_decisions(created_at)'); } catch(e) {}
    console.log('✅ route_decisions 表已确保存在 (v6.4.0)');

    // ── incidents 表 (Phase B.1) ────────────────────────────────────────────
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        source_type TEXT NOT NULL,
        source_id TEXT NOT NULL,
        severity TEXT NOT NULL DEFAULT 'medium',
        status TEXT NOT NULL DEFAULT 'open',
        assignee TEXT NOT NULL DEFAULT '',
        summary TEXT NOT NULL DEFAULT '',
        probable_cause TEXT NOT NULL DEFAULT '',
        resolution_summary TEXT NOT NULL DEFAULT '',
        playbook_id TEXT NOT NULL DEFAULT '',
        playbook_code TEXT NOT NULL DEFAULT '',
        playbook_match_reason TEXT NOT NULL DEFAULT '',
        playbook_run_status TEXT NOT NULL DEFAULT 'not_started',
        playbook_step_completed INTEGER NOT NULL DEFAULT 0,
        playbook_step_total INTEGER NOT NULL DEFAULT 0,
        assistant_diagnosis_summary TEXT NOT NULL DEFAULT '',
        assistant_probable_cause TEXT NOT NULL DEFAULT '',
        assistant_recommended_actions_json TEXT NOT NULL DEFAULT '[]',
        assistant_confidence REAL NOT NULL DEFAULT 0,
        assistant_risk_level TEXT NOT NULL DEFAULT '',
        assistant_manual_confirmation_required INTEGER NOT NULL DEFAULT 0,
        assistant_last_request_id TEXT NOT NULL DEFAULT '',
        assistant_last_status TEXT NOT NULL DEFAULT '',
        recommended_actions_json TEXT NOT NULL DEFAULT '[]',
        evidence_refs_json TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('incidents 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_inc_source ON incidents(source_type, source_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_inc_severity ON incidents(severity)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_inc_status ON incidents(status)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_inc_assignee ON incidents(assignee)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_inc_updated ON incidents(updated_at)'); } catch(e) {}
    try {
      const incidentCols = dbInstance.prepare('PRAGMA table_info(incidents)').all() as any[];
      const colSet = new Set(incidentCols.map((c: any) => String(c.name || '')));
      if (!colSet.has('assignee')) dbInstance.exec(`ALTER TABLE incidents ADD COLUMN assignee TEXT NOT NULL DEFAULT ''`);
      if (!colSet.has('resolution_summary')) dbInstance.exec(`ALTER TABLE incidents ADD COLUMN resolution_summary TEXT NOT NULL DEFAULT ''`);
      if (!colSet.has('playbook_id')) dbInstance.exec(`ALTER TABLE incidents ADD COLUMN playbook_id TEXT NOT NULL DEFAULT ''`);
      if (!colSet.has('playbook_code')) dbInstance.exec(`ALTER TABLE incidents ADD COLUMN playbook_code TEXT NOT NULL DEFAULT ''`);
      if (!colSet.has('playbook_match_reason')) dbInstance.exec(`ALTER TABLE incidents ADD COLUMN playbook_match_reason TEXT NOT NULL DEFAULT ''`);
      if (!colSet.has('playbook_run_status')) dbInstance.exec(`ALTER TABLE incidents ADD COLUMN playbook_run_status TEXT NOT NULL DEFAULT 'not_started'`);
      if (!colSet.has('playbook_step_completed')) dbInstance.exec(`ALTER TABLE incidents ADD COLUMN playbook_step_completed INTEGER NOT NULL DEFAULT 0`);
      if (!colSet.has('playbook_step_total')) dbInstance.exec(`ALTER TABLE incidents ADD COLUMN playbook_step_total INTEGER NOT NULL DEFAULT 0`);
      if (!colSet.has('assistant_diagnosis_summary')) dbInstance.exec(`ALTER TABLE incidents ADD COLUMN assistant_diagnosis_summary TEXT NOT NULL DEFAULT ''`);
      if (!colSet.has('assistant_probable_cause')) dbInstance.exec(`ALTER TABLE incidents ADD COLUMN assistant_probable_cause TEXT NOT NULL DEFAULT ''`);
      if (!colSet.has('assistant_recommended_actions_json')) dbInstance.exec(`ALTER TABLE incidents ADD COLUMN assistant_recommended_actions_json TEXT NOT NULL DEFAULT '[]'`);
      if (!colSet.has('assistant_confidence')) dbInstance.exec(`ALTER TABLE incidents ADD COLUMN assistant_confidence REAL NOT NULL DEFAULT 0`);
      if (!colSet.has('assistant_risk_level')) dbInstance.exec(`ALTER TABLE incidents ADD COLUMN assistant_risk_level TEXT NOT NULL DEFAULT ''`);
      if (!colSet.has('assistant_manual_confirmation_required')) dbInstance.exec(`ALTER TABLE incidents ADD COLUMN assistant_manual_confirmation_required INTEGER NOT NULL DEFAULT 0`);
      if (!colSet.has('assistant_last_request_id')) dbInstance.exec(`ALTER TABLE incidents ADD COLUMN assistant_last_request_id TEXT NOT NULL DEFAULT ''`);
      if (!colSet.has('assistant_last_status')) dbInstance.exec(`ALTER TABLE incidents ADD COLUMN assistant_last_status TEXT NOT NULL DEFAULT ''`);
    } catch(e) { if (!e.message.includes('duplicate column')) console.error('incidents 列迁移错误:', e.message); }
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS incident_actions (
        id TEXT PRIMARY KEY,
        incident_id TEXT NOT NULL,
        action_type TEXT NOT NULL,
        from_status TEXT NOT NULL DEFAULT '',
        to_status TEXT NOT NULL DEFAULT '',
        comment TEXT NOT NULL DEFAULT '',
        actor TEXT NOT NULL DEFAULT 'system',
        meta_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('incident_actions 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_ia_incident ON incident_actions(incident_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_ia_action ON incident_actions(action_type)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_ia_created ON incident_actions(created_at)'); } catch(e) {}
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS assistant_diagnostic_requests (
        id TEXT PRIMARY KEY,
        incident_id TEXT NOT NULL,
        job_id TEXT NOT NULL DEFAULT '',
        source_type TEXT NOT NULL DEFAULT '',
        severity TEXT NOT NULL DEFAULT '',
        probable_cause TEXT NOT NULL DEFAULT '',
        summary TEXT NOT NULL DEFAULT '',
        evidence_refs_json TEXT NOT NULL DEFAULT '{}',
        request_payload_json TEXT NOT NULL DEFAULT '{}',
        status TEXT NOT NULL DEFAULT 'pending',
        response_summary TEXT NOT NULL DEFAULT '',
        response_json TEXT NOT NULL DEFAULT '{}',
        adoption_status TEXT NOT NULL DEFAULT '',
        adoption_note TEXT NOT NULL DEFAULT '',
        gate_decision TEXT NOT NULL DEFAULT '',
        gate_reason TEXT NOT NULL DEFAULT '',
        reuse_hit INTEGER NOT NULL DEFAULT 0,
        reuse_hint_json TEXT NOT NULL DEFAULT '{}',
        manual_confirmation_required INTEGER NOT NULL DEFAULT 0,
        manual_confirmation_status TEXT NOT NULL DEFAULT '',
        manual_confirmation_actor TEXT NOT NULL DEFAULT '',
        manual_confirmation_note TEXT NOT NULL DEFAULT '',
        response_time_ms INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('assistant_diagnostic_requests 建表错误:', e.message); }
    try {
      const adrCols = dbInstance.prepare('PRAGMA table_info(assistant_diagnostic_requests)').all() as any[];
      const adrColSet = new Set(adrCols.map((c: any) => String(c.name || '')));
      if (!adrColSet.has('gate_decision')) dbInstance.exec(`ALTER TABLE assistant_diagnostic_requests ADD COLUMN gate_decision TEXT NOT NULL DEFAULT ''`);
      if (!adrColSet.has('gate_reason')) dbInstance.exec(`ALTER TABLE assistant_diagnostic_requests ADD COLUMN gate_reason TEXT NOT NULL DEFAULT ''`);
      if (!adrColSet.has('reuse_hit')) dbInstance.exec(`ALTER TABLE assistant_diagnostic_requests ADD COLUMN reuse_hit INTEGER NOT NULL DEFAULT 0`);
      if (!adrColSet.has('reuse_hint_json')) dbInstance.exec(`ALTER TABLE assistant_diagnostic_requests ADD COLUMN reuse_hint_json TEXT NOT NULL DEFAULT '{}'`);
      if (!adrColSet.has('manual_confirmation_required')) dbInstance.exec(`ALTER TABLE assistant_diagnostic_requests ADD COLUMN manual_confirmation_required INTEGER NOT NULL DEFAULT 0`);
      if (!adrColSet.has('manual_confirmation_status')) dbInstance.exec(`ALTER TABLE assistant_diagnostic_requests ADD COLUMN manual_confirmation_status TEXT NOT NULL DEFAULT ''`);
      if (!adrColSet.has('manual_confirmation_actor')) dbInstance.exec(`ALTER TABLE assistant_diagnostic_requests ADD COLUMN manual_confirmation_actor TEXT NOT NULL DEFAULT ''`);
      if (!adrColSet.has('manual_confirmation_note')) dbInstance.exec(`ALTER TABLE assistant_diagnostic_requests ADD COLUMN manual_confirmation_note TEXT NOT NULL DEFAULT ''`);
      if (!adrColSet.has('response_time_ms')) dbInstance.exec(`ALTER TABLE assistant_diagnostic_requests ADD COLUMN response_time_ms INTEGER NOT NULL DEFAULT 0`);
      if (!adrColSet.has('pattern_backflow_id')) dbInstance.exec(`ALTER TABLE assistant_diagnostic_requests ADD COLUMN pattern_backflow_id TEXT NOT NULL DEFAULT ''`);
      if (!adrColSet.has('rule_backflow_id')) dbInstance.exec(`ALTER TABLE assistant_diagnostic_requests ADD COLUMN rule_backflow_id TEXT NOT NULL DEFAULT ''`);
      if (!adrColSet.has('playbook_backflow_id')) dbInstance.exec(`ALTER TABLE assistant_diagnostic_requests ADD COLUMN playbook_backflow_id TEXT NOT NULL DEFAULT ''`);
      if (!adrColSet.has('gate_policy_hint_json')) dbInstance.exec(`ALTER TABLE assistant_diagnostic_requests ADD COLUMN gate_policy_hint_json TEXT NOT NULL DEFAULT '{}'`);
    } catch(e) { if (!String((e as any)?.message || '').includes('duplicate column')) console.error('assistant_diagnostic_requests 列迁移错误:', (e as any)?.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_adr_incident ON assistant_diagnostic_requests(incident_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_adr_status ON assistant_diagnostic_requests(status)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_adr_created ON assistant_diagnostic_requests(created_at)'); } catch(e) {}
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS incident_playbooks (
        id TEXT PRIMARY KEY,
        playbook_code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        applies_to_source_type TEXT NOT NULL DEFAULT '',
        applies_to_severity TEXT NOT NULL DEFAULT '*',
        applies_to_pattern TEXT NOT NULL DEFAULT '',
        summary TEXT NOT NULL DEFAULT '',
        precheck_json TEXT NOT NULL DEFAULT '[]',
        steps_json TEXT NOT NULL DEFAULT '[]',
        risk_notes_json TEXT NOT NULL DEFAULT '[]',
        rollback_notes_json TEXT NOT NULL DEFAULT '[]',
        acceptance_json TEXT NOT NULL DEFAULT '[]',
        enabled INTEGER NOT NULL DEFAULT 1,
        version INTEGER NOT NULL DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'active',
        quality_score REAL NOT NULL DEFAULT 0,
        effectiveness_score REAL NOT NULL DEFAULT 0,
        last_evaluated_at TEXT NOT NULL DEFAULT '',
        needs_revision INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('incident_playbooks 建表错误:', e.message); }
    try { dbInstance.exec('ALTER TABLE incident_playbooks ADD COLUMN status TEXT NOT NULL DEFAULT \"active\"'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE incident_playbooks ADD COLUMN quality_score REAL NOT NULL DEFAULT 0'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE incident_playbooks ADD COLUMN effectiveness_score REAL NOT NULL DEFAULT 0'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE incident_playbooks ADD COLUMN last_evaluated_at TEXT NOT NULL DEFAULT \"\"'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE incident_playbooks ADD COLUMN needs_revision INTEGER NOT NULL DEFAULT 0'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE incident_playbooks ADD COLUMN assistant_playbook_evidence_json TEXT NOT NULL DEFAULT \"{}\"'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE incident_playbooks ADD COLUMN playbook_improvement_hint TEXT NOT NULL DEFAULT \"\"'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE incident_playbooks ADD COLUMN playbook_needs_revision_assistant_hint INTEGER NOT NULL DEFAULT 0'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_ipb_source ON incident_playbooks(applies_to_source_type)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_ipb_enabled ON incident_playbooks(enabled)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_ipb_needs_revision ON incident_playbooks(needs_revision)'); } catch(e) {}
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS incident_playbook_runs (
        id TEXT PRIMARY KEY,
        incident_id TEXT NOT NULL,
        playbook_id TEXT NOT NULL,
        playbook_code TEXT NOT NULL,
        run_status TEXT NOT NULL DEFAULT 'not_started',
        current_step_index INTEGER NOT NULL DEFAULT 0,
        total_steps INTEGER NOT NULL DEFAULT 0,
        started_at TEXT NOT NULL DEFAULT '',
        completed_at TEXT NOT NULL DEFAULT '',
        aborted_at TEXT NOT NULL DEFAULT '',
        result_note TEXT NOT NULL DEFAULT '',
        review_summary_json TEXT NOT NULL DEFAULT '{}',
        backflow_json TEXT NOT NULL DEFAULT '{}',
        actor TEXT NOT NULL DEFAULT 'system',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('incident_playbook_runs 建表错误:', e.message); }
    try { dbInstance.exec('ALTER TABLE incident_playbook_runs ADD COLUMN review_summary_json TEXT NOT NULL DEFAULT \"{}\"'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE incident_playbook_runs ADD COLUMN backflow_json TEXT NOT NULL DEFAULT \"{}\"'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_ipr_incident ON incident_playbook_runs(incident_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_ipr_status ON incident_playbook_runs(run_status)'); } catch(e) {}
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS incident_playbook_steps (
        id TEXT PRIMARY KEY,
        run_id TEXT NOT NULL,
        incident_id TEXT NOT NULL,
        playbook_id TEXT NOT NULL,
        step_index INTEGER NOT NULL,
        action_type TEXT NOT NULL DEFAULT 'step_note',
        action_note TEXT NOT NULL DEFAULT '',
        actor TEXT NOT NULL DEFAULT 'system',
        created_at TEXT NOT NULL
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('incident_playbook_steps 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_ips_run ON incident_playbook_steps(run_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_ips_incident ON incident_playbook_steps(incident_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_ips_step ON incident_playbook_steps(step_index)'); } catch(e) {}
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS playbook_feedback (
        id TEXT PRIMARY KEY,
        playbook_id TEXT NOT NULL,
        incident_id TEXT NOT NULL,
        run_id TEXT NOT NULL,
        feedback_type TEXT NOT NULL,
        comment TEXT NOT NULL DEFAULT '',
        created_by TEXT NOT NULL DEFAULT 'operator',
        created_at TEXT NOT NULL
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('playbook_feedback 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_pbf_playbook ON playbook_feedback(playbook_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_pbf_feedback_type ON playbook_feedback(feedback_type)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_pbf_created ON playbook_feedback(created_at)'); } catch(e) {}

    try {
      const now = new Date().toISOString();
      const playbooks = [
        {
          id: 'ipb_workflow_failure_v1',
          playbook_code: 'PB-WF-FAILURE-V1',
          name: 'Workflow Failure 标准处置',
          applies_to_source_type: 'workflow_failure',
          summary: '定位失败步骤、确认输入上下文、执行重试与恢复判断。',
          precheck: ['确认 job_id 可追踪', '确认失败 step 与错误消息', '确认是否有审批/依赖阻塞'],
          steps: ['查看 trace 与错误根因', '修正输入或依赖配置', '执行节点重试并观察状态', '记录结论并关闭事件'],
          risk: ['重复重试可能放大队列拥塞', '错误配置回写可能影响其他任务'],
          rollback: ['撤回本次配置变更', '将事件状态回退为 open 并升级人工排查'],
          acceptance: ['任务恢复运行或失败原因明确', 'incident 留有 resolution summary'],
        },
        {
          id: 'ipb_rule_blocked_v1',
          playbook_code: 'PB-RULE-BLOCKED-V1',
          name: 'Rule Blocked 排查处置',
          applies_to_source_type: 'rule_blocked',
          summary: '确认阻断规则与触发输入，必要时降级策略。',
          precheck: ['确认 rule target', '确认近24h阻断次数', '确认是否影响主链'],
          steps: ['检查 rule_blocked 审计细节', '判断阈值是否过严', '补充备注并执行降级/忽略策略', '复核阻断是否下降'],
          risk: ['过度放宽规则导致风险放行'],
          rollback: ['恢复原规则阈值', '标记本次处置为 aborted 并升级'],
          acceptance: ['阻断原因明确且风险可控', '后续阻断频次下降'],
        },
        {
          id: 'ipb_ops_health_v1',
          playbook_code: 'PB-OPS-HEALTH-V1',
          name: 'Ops Health 异常诊断',
          applies_to_source_type: 'ops_health_anomaly',
          summary: '围绕失败任务与待审批积压执行诊断。',
          precheck: ['读取 health snapshot', '确认 failed_jobs_24h', '确认 pending_approvals'],
          steps: ['定位失败任务TopN', '清理/处理积压审批', '观察健康指标回落', '输出诊断结论'],
          risk: ['批量操作可能误处理正常审批'],
          rollback: ['恢复被误操作项', '回退事件状态并继续观察'],
          acceptance: ['健康指标回稳或已形成明确根因'],
        },
        {
          id: 'ipb_feedback_risk_v1',
          playbook_code: 'PB-FEEDBACK-RISK-V1',
          name: 'Feedback 风险信号核查',
          applies_to_source_type: 'feedback_risk_signal',
          summary: '核查反馈批次状态、关联模型与评估。',
          precheck: ['确认 feedback_id 与状态', '确认关联模型版本', '确认近期评估波动'],
          steps: ['读取 feedback notes 与样本特征', '核对模型/评估关联', '判定是否需要升级风险', '形成处置结论'],
          risk: ['误判风险级别导致响应过度或不足'],
          rollback: ['撤销错误标注结论', '恢复事件为 in_progress 继续核查'],
          acceptance: ['核查结论可复现且已留痕'],
        },
      ];
      const stmt = dbInstance.prepare(`
        INSERT OR IGNORE INTO incident_playbooks
        (id, playbook_code, name, applies_to_source_type, applies_to_severity, applies_to_pattern, summary, precheck_json, steps_json, risk_notes_json, rollback_notes_json, acceptance_json, enabled, version, created_at, updated_at)
        VALUES (?, ?, ?, ?, '*', '', ?, ?, ?, ?, ?, ?, 1, 1, ?, ?)
      `);
      for (const p of playbooks) {
        stmt.run(
          p.id,
          p.playbook_code,
          p.name,
          p.applies_to_source_type,
          p.summary,
          JSON.stringify(p.precheck),
          JSON.stringify(p.steps),
          JSON.stringify(p.risk),
          JSON.stringify(p.rollback),
          JSON.stringify(p.acceptance),
          now,
          now,
        );
      }
    } catch(e) { console.error('incident_playbooks seed 错误:', e.message); }
    console.log('✅ incidents 表已确保存在 (Phase B.1)');

    // ── v6.4.0: 默认路由策略 seed（仅保留主策略）─────────────────────────────
    try {
      const now = new Date().toISOString();
      dbInstance.prepare(`
        INSERT OR IGNORE INTO route_policies
        (id, name, task_type, route_type, priority, status, reason_template, metadata_json, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'active', ?, '{}', ?, ?)
      `).run(
        'rp-v640-data-prep-default',
        'Default Data Prep Route',
        'data_prep',
        'cloud_high_capability',
        300,
        'task_type={task_type}; route={route_type}; policy={policy_id}; rule={rule_kind}',
        now,
        now
      );
      dbInstance.prepare(`
        INSERT OR IGNORE INTO route_policies
        (id, name, task_type, route_type, priority, status, reason_template, metadata_json, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'active', ?, '{}', ?, ?)
      `).run(
        'rp-v640-evaluation-default',
        'Default Evaluation Route',
        'evaluation',
        'cloud_high_capability',
        200,
        'task_type={task_type}; route={route_type}; policy={policy_id}; rule={rule_kind}',
        now,
        now
      );
      dbInstance.prepare(`
        INSERT OR IGNORE INTO route_policies
        (id, name, task_type, route_type, priority, status, reason_template, metadata_json, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'active', ?, '{}', ?, ?)
      `).run(
        'rp-v640-cloud-high-capability-default',
        'Default Cloud High Capability Route',
        'training',
        'cloud_high_capability',
        400,
        'task_type={task_type}; route={route_type}; policy={policy_id}; rule={rule_kind}',
        now,
        now
      );
      dbInstance.prepare(`
        INSERT OR IGNORE INTO route_policies
        (id, name, task_type, route_type, priority, status, reason_template, metadata_json, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'active', ?, '{}', ?, ?)
      `).run(
        'rp-v640-default-fallback',
        'Default Fallback Route',
        '*',
        'cloud_high_capability',
        50,
        'task_type={task_type}; route={route_type}; policy={policy_id}; rule={rule_kind}',
        now,
        now
      );
    } catch(e) {
      console.error('route_policies seed 失败:', (e as any)?.message || e);
    }

    // ── approvals 表 ───────────────────────────────────────────────────────────
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS approvals (
        id TEXT PRIMARY KEY,
        task_id TEXT DEFAULT '',
        action TEXT DEFAULT 'request',
        resource_type TEXT NOT NULL DEFAULT 'workflow_job',
        resource_id TEXT NOT NULL DEFAULT '',
        step_id TEXT,
        step_name TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        policy_type TEXT DEFAULT 'manual',
        timeout_seconds INTEGER DEFAULT 0,
        expires_at TEXT,
        requested_by TEXT DEFAULT 'system',
        reviewed_by TEXT,
        reviewed_at TEXT,
        comment TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('approvals 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_appr_resource ON approvals(resource_type, resource_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_appr_status ON approvals(status)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_appr_step ON approvals(step_id)'); } catch(e) {}
    console.log('✅ approvals 表已确保存在');

    // ── v2.1.0: approvals 表迁移 ─────────────────────────────────────────────
    // approvals 表已存在（schema.sql 建的空壳），需要升级列
    const approvalNewColumns = [
      { name: 'resource_type', type: "TEXT NOT NULL DEFAULT 'workflow_job'" },
      { name: 'resource_id', type: 'TEXT NOT NULL DEFAULT \'\'' },
      { name: 'step_id', type: 'TEXT' },
      { name: 'step_name', type: 'TEXT' },
      { name: 'requested_by', type: "TEXT DEFAULT 'system'" },
      { name: 'reviewed_by', type: 'TEXT' },
      { name: 'reviewed_at', type: 'TEXT' },
      { name: 'updated_at', type: 'TEXT' },
    ];
    for (const col of approvalNewColumns) {
      try {
        dbInstance.exec(`ALTER TABLE approvals ADD COLUMN ${col.name} ${col.type}`);
      } catch (e) {
        // 列可能已存在，忽略错误
      }
    }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_approvals_resource ON approvals(resource_type, resource_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_approvals_step ON approvals(step_id)'); } catch(e) {}
    console.log('✅ approvals 表已升级 (v2.1.0)');

    // ── v2.1.0 Pack 2: approvals 表策略列迁移 ─────────────────────────────
    const approvalPolicyColumns = [
      { name: 'policy_type', type: "TEXT DEFAULT 'manual'" },
      { name: 'timeout_seconds', type: 'INTEGER DEFAULT 0' },
      { name: 'expires_at', type: 'TEXT' },
    ];
    for (const col of approvalPolicyColumns) {
      try {
        dbInstance.exec(`ALTER TABLE approvals ADD COLUMN ${col.name} ${col.type}`);
      } catch (e) {
        // Column may already exist
      }
    }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_approvals_policy ON approvals(policy_type)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_approvals_expires ON approvals(expires_at)'); } catch(e) {}
    console.log('✅ approvals 表已升级策略列 (v2.1.0 pack 2)');

    // 确保 rollback_points 表存在
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS rollback_points (
        id TEXT PRIMARY KEY,
        deployment_id TEXT NOT NULL,
        from_revision_id TEXT NOT NULL,
        to_revision_id TEXT NOT NULL,
        reason TEXT DEFAULT '',
        status TEXT NOT NULL DEFAULT 'pending',
        rolled_back_at TEXT,
        created_at TEXT NOT NULL
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('rollback_points 建表错误:', e.message); }

    // ── v2.8.0: Training Lineage Tables ─────────────────────────────────
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS models (
        model_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        version TEXT,
        source_experiment_id TEXT,
        latest_evaluation_id TEXT,
        task_type TEXT DEFAULT '',
        model_family TEXT DEFAULT '',
        artifact_path TEXT DEFAULT '',
        created_at TEXT,
        updated_at TEXT
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('models table error:', e.message); }
    console.log('✅ models 表已确保存在');

    // B2: Add missing columns to models table for real evaluation promotion
    try { dbInstance.exec('ALTER TABLE models ADD COLUMN source_artifact_id TEXT'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE models ADD COLUMN status TEXT DEFAULT \'draft\''); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE models ADD COLUMN promotion_status TEXT DEFAULT \'pending\''); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE models ADD COLUMN release_note_json TEXT'); } catch(e) {}
    console.log('✅ models 表 B2 列已升级 (Real Evaluation & Promotion)');

    // C1: Add columns for candidate promotion and shadow validation
    try { dbInstance.exec('ALTER TABLE models ADD COLUMN approved_by TEXT'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE models ADD COLUMN approved_at TEXT'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE models ADD COLUMN approval_note TEXT'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE models ADD COLUMN shadow_validation_id TEXT'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE models ADD COLUMN shadow_compare_report_json TEXT'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE models ADD COLUMN rollback_target_id TEXT'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE models ADD COLUMN last_production_model_id TEXT'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE models ADD COLUMN production_gate_status TEXT DEFAULT \'pending\''); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE models ADD COLUMN production_gate_checks_json TEXT'); } catch(e) {}
    console.log('✅ models 表 C1 列已升级 (Candidate Promotion & Shadow Validation)');

    // C1: shadow_validations 表
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS shadow_validations (
        id TEXT PRIMARY KEY,
        candidate_model_id TEXT,
        baseline_model_id TEXT,
        test_video_batch_id TEXT,
        status TEXT DEFAULT 'pending',
        candidate_metrics_json TEXT,
        baseline_metrics_json TEXT,
        compare_result_json TEXT,
        false_positive_diff INTEGER,
        false_negative_diff INTEGER,
        classifier_reject_diff INTEGER,
        review_pack_pressure_diff REAL,
        badcases_json TEXT,
        recommendation TEXT,
        created_at TEXT,
        updated_at TEXT
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('shadow_validations table error:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_sv_candidate ON shadow_validations(candidate_model_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_sv_baseline ON shadow_validations(baseline_model_id)'); } catch(e) {}
    console.log('✅ shadow_validations 表已确保存在 (C1)');
    
    // C1: Add missing columns to shadow_validations
    try { dbInstance.exec('ALTER TABLE shadow_validations ADD COLUMN config_json TEXT'); } catch(e) {}
    console.log('✅ shadow_validations 表 C1 列已升级');

    // v3.6.0: patch_sets 表 — hardcase feedback loop
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS patch_sets (
        patch_set_id TEXT PRIMARY KEY,
        name TEXT,
        patch_type TEXT NOT NULL DEFAULT 'badcases',
        status TEXT NOT NULL DEFAULT 'draft',
        source_experiment_id TEXT,
        source_model_id TEXT,
        source_evaluation_id TEXT,
        source_dataset_id TEXT,
        source_dataset_version TEXT,
        manifest_path TEXT DEFAULT '',
        sample_count INTEGER DEFAULT 0,
        created_at TEXT,
        updated_at TEXT
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('patch_sets table error:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_ps_experiment ON patch_sets(source_experiment_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_ps_model ON patch_sets(source_model_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_ps_dataset ON patch_sets(source_dataset_id)'); } catch(e) {}
    console.log('✅ patch_sets 表已确保存在 (v3.6.0)');

    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS experiments (
        id TEXT PRIMARY KEY,
        experiment_code TEXT,
        name TEXT,
        dataset_id TEXT,
        status TEXT DEFAULT 'pending',
        task_type TEXT DEFAULT '',
        model_family TEXT DEFAULT '',
        params_snapshot_json TEXT DEFAULT '{}',
        created_at TEXT,
        updated_at TEXT
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('experiments table error:', e.message); }
    console.log('✅ experiments 表已确保存在');

    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS datasets (
        id TEXT PRIMARY KEY,
        dataset_code TEXT,
        name TEXT,
        version TEXT,
        status TEXT DEFAULT 'active',
        task_type TEXT DEFAULT '',
        dataset_format TEXT DEFAULT '',
        class_count INTEGER DEFAULT 0,
        label_map_json TEXT DEFAULT '{}',
        created_at TEXT,
        updated_at TEXT
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('datasets table error:', e.message); }
    console.log('✅ datasets 表已确保存在');
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_rp_deployment ON rollback_points(deployment_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_rp_status ON rollback_points(status)'); } catch(e) {}
    console.log('✅ rollback_points 表已确保存在');

    // v3.7.0: sam_handoffs 表 — YOLO to SAM handoff foundation
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS sam_handoffs (
        handoff_id TEXT PRIMARY KEY,
        name TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        source_experiment_id TEXT,
        source_model_id TEXT,
        source_dataset_id TEXT,
        source_dataset_version TEXT,
        manifest_path TEXT DEFAULT '',
        roi_count INTEGER DEFAULT 0,
        prompt_count INTEGER DEFAULT 0,
        prompt_type TEXT DEFAULT 'box',
        total_detections INTEGER DEFAULT 0,
        avg_confidence REAL DEFAULT 0,
        unique_classes INTEGER DEFAULT 0,
        created_at TEXT,
        updated_at TEXT
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('sam_handoffs table error:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_sh_experiment ON sam_handoffs(source_experiment_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_sh_model ON sam_handoffs(source_model_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_sh_dataset ON sam_handoffs(source_dataset_id)'); } catch(e) {}
    console.log('✅ sam_handoffs 表已确保存在 (v3.7.0)');

    // v3.8.0: sam_segmentations 表 — SAM segmentation artifacts
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS sam_segmentations (
        segmentation_id TEXT PRIMARY KEY,
        name TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        source_handoff_id TEXT,
        source_experiment_id TEXT,
        source_model_id TEXT,
        source_dataset_id TEXT,
        manifest_path TEXT DEFAULT '',
        model_type TEXT DEFAULT 'vit_b',
        checkpoint_path TEXT DEFAULT '',
        prompt_count INTEGER DEFAULT 0,
        mask_count INTEGER DEFAULT 0,
        avg_mask_score REAL DEFAULT 0,
        avg_coverage REAL DEFAULT 0,
        total_infer_time_s REAL DEFAULT 0,
        created_at TEXT,
        updated_at TEXT
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('sam_segmentations table error:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_ss_handoff ON sam_segmentations(source_handoff_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_ss_experiment ON sam_segmentations(source_experiment_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_ss_model ON sam_segmentations(source_model_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_ss_status ON sam_segmentations(status)'); } catch(e) {}
    console.log('✅ sam_segmentations 表已确保存在 (v3.8.0)');

    // v3.9.0: classifier_verifications 表 — SAM crop classification/verification
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS classifier_verifications (
        verification_id TEXT PRIMARY KEY,
        name TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        source_segmentation_id TEXT,
        source_handoff_id TEXT,
        source_experiment_id TEXT,
        source_model_id TEXT,
        source_dataset_id TEXT,
        manifest_path TEXT DEFAULT '',
        model_type TEXT DEFAULT 'resnet18',
        classifier_model_path TEXT DEFAULT '',
        execution_mode TEXT DEFAULT 'real',
        total_items INTEGER DEFAULT 0,
        accepted_count INTEGER DEFAULT 0,
        rejected_count INTEGER DEFAULT 0,
        uncertain_count INTEGER DEFAULT 0,
        avg_confidence REAL DEFAULT 0,
        avg_infer_time_s REAL DEFAULT 0,
        created_at TEXT,
        updated_at TEXT
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('classifier_verifications table error:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_cv_segmentation ON classifier_verifications(source_segmentation_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_cv_handoff ON classifier_verifications(source_handoff_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_cv_experiment ON classifier_verifications(source_experiment_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_cv_status ON classifier_verifications(status)'); } catch(e) {}
    console.log('✅ classifier_verifications 表已确保存在 (v3.9.0)');

    // ─────────────────────────────────────────────────────────────────
    // v3.9.x 补丁：classifier_verifications 新增 3 个字段（幂等）
    // artifact_id       — 关联 artifacts 表（classifier_result artifact）
    // total_infer_time_s — 总推理耗时（秒），与 avg_infer_time_s 互补
    // error_message     — runner 失败时记录错误摘要
    // ─────────────────────────────────────────────────────────────────
    try {
      dbInstance.exec('ALTER TABLE classifier_verifications ADD COLUMN artifact_id TEXT DEFAULT ""');
    } catch(e) {
      if (!e.message.includes('duplicate column name') && !e.message.includes('already exists')) {
        console.warn('[classifier/v3.9.x] artifact_id column:', e.message);
      }
    }
    try {
      dbInstance.exec('ALTER TABLE classifier_verifications ADD COLUMN total_infer_time_s REAL DEFAULT 0');
    } catch(e) {
      if (!e.message.includes('duplicate column name') && !e.message.includes('already exists')) {
        console.warn('[classifier/v3.9.x] total_infer_time_s column:', e.message);
      }
    }
    try {
      dbInstance.exec('ALTER TABLE classifier_verifications ADD COLUMN error_message TEXT DEFAULT ""');
    } catch(e) {
      if (!e.message.includes('duplicate column name') && !e.message.includes('already exists')) {
        console.warn('[classifier/v3.9.x] error_message column:', e.message);
      }
    }
    try {
      dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_cv_artifact ON classifier_verifications(artifact_id)');
    } catch(e) {}
    console.log('✅ classifier_verifications v3.9.x patch done — 3 fields added (idempotent)');

    // v4.0.0: tracker_runs 表 — IoU-based multi-object tracking
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS tracker_runs (
        tracker_run_id TEXT PRIMARY KEY,
        name TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        source_verification_id TEXT,
        source_segmentation_id TEXT,
        source_handoff_id TEXT,
        source_experiment_id TEXT,
        source_model_id TEXT,
        source_dataset_id TEXT,
        manifest_path TEXT DEFAULT '',
        total_tracks INTEGER DEFAULT 0,
        total_frames INTEGER DEFAULT 0,
        avg_track_length REAL DEFAULT 0,
        active_count INTEGER DEFAULT 0,
        ended_count INTEGER DEFAULT 0,
        iou_threshold REAL DEFAULT 0.3,
        dist_threshold REAL DEFAULT 80.0,
        tracking_config_json TEXT DEFAULT '',
        created_at TEXT,
        updated_at TEXT
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('tracker_runs table error:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_tr_verification ON tracker_runs(source_verification_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_tr_segmentation ON tracker_runs(source_segmentation_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_tr_experiment ON tracker_runs(source_experiment_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_tr_status ON tracker_runs(status)'); } catch(e) {}
    console.log('✅ tracker_runs 表已确保存在 (v4.0.0)');

    // v4.1.0: rule_engine_runs 表 — consistency guardrails
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS rule_engine_runs (
        rule_run_id TEXT PRIMARY KEY,
        name TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        source_tracker_run_id TEXT,
        source_verification_id TEXT,
        source_segmentation_id TEXT,
        source_handoff_id TEXT,
        source_experiment_id TEXT,
        source_model_id TEXT,
        source_dataset_id TEXT,
        manifest_path TEXT DEFAULT '',
        total_decisions INTEGER DEFAULT 0,
        affected_tracks INTEGER DEFAULT 0,
        unstable_class_count INTEGER DEFAULT 0,
        low_confidence_count INTEGER DEFAULT 0,
        transient_count INTEGER DEFAULT 0,
        conflict_count INTEGER DEFAULT 0,
        ended_resolved_count INTEGER DEFAULT 0,
        rule_config_json TEXT DEFAULT '',
        created_at TEXT,
        updated_at TEXT
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('rule_engine_runs table error:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_re_tr ON rule_engine_runs(source_tracker_run_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_re_exp ON rule_engine_runs(source_experiment_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_re_status ON rule_engine_runs(status)'); } catch(e) {}
    console.log('✅ rule_engine_runs 表已确保存在 (v4.1.0)');

    // ── v2.3.0: workflow_jobs 运行控制列迁移 ──────────────────────────────────
    const wjCols = [
      { name: 'blocked_reason',  type: 'TEXT' },
      { name: 'last_error',      type: 'TEXT' },
      { name: 'resumed_at',      type: 'TEXT' },
      { name: 'resumed_by',      type: 'TEXT' },
      { name: 'cancelled_at',    type: 'TEXT' },
      { name: 'cancelled_by',    type: 'TEXT' },
      { name: 'retried_at',      type: 'TEXT' },
      { name: 'retried_by',      type: 'TEXT' },
    ];
    const existingWj = dbInstance.prepare('PRAGMA table_info(workflow_jobs)').all() as any[];
    const existingWjNames = new Set(existingWj.map((c: any) => c.name));
    for (const col of wjCols) {
      if (!existingWjNames.has(col.name)) {
        try { dbInstance.exec(`ALTER TABLE workflow_jobs ADD COLUMN ${col.name} ${col.type}`); } catch(e) {}
      }
    }
    console.log('✅ workflow_jobs 表已升级 (v2.3.0)');

    // ── v2.4.0: workflow_jobs 可靠性护栏列迁移 ──────────────────────────────────
    const wjCols240 = [
      { name: 'retry_count',          type: 'INTEGER DEFAULT 0' },
      { name: 'retry_limit',          type: 'INTEGER DEFAULT 3' },
      { name: 'cancel_requested_at',  type: 'TEXT' },
      { name: 'cancel_requested_by',  type: 'TEXT' },
      { name: 'reconciled_at',        type: 'TEXT' },
      { name: 'reconciled_by',        type: 'TEXT' },
    ];
    const existingWj2 = dbInstance.prepare('PRAGMA table_info(workflow_jobs)').all() as any[];
    const existingWjNames2 = new Set(existingWj2.map((c: any) => c.name));
    for (const col of wjCols240) {
      if (!existingWjNames2.has(col.name.split(' ')[0])) {
        try { dbInstance.exec(`ALTER TABLE workflow_jobs ADD COLUMN ${col.name} ${col.type}`); } catch(e) {}
      }
    }
    console.log('✅ workflow_jobs 表已升级 (v2.4.0)');

    // ═══ v4.8.0: Promotion Gate — incremental column additions ═══
    const v480ArtifactCols = [
      { name: 'promotion_status', type: "TEXT NOT NULL DEFAULT 'draft'" },
      { name: 'promotion_comment', type: "TEXT DEFAULT ''" },
      { name: 'approved_by', type: "TEXT DEFAULT ''" },
      { name: 'approved_at', type: "TEXT DEFAULT ''" },
    ];
    for (const col of v480ArtifactCols) {
      try { dbInstance.exec(`ALTER TABLE artifacts ADD COLUMN ${col.name} ${col.type}`); } catch(e) {}
    }
    const v480ModelCols = [
      { name: 'promotion_status', type: "TEXT NOT NULL DEFAULT 'draft'" },
      { name: 'source_artifact_id', type: "TEXT DEFAULT ''" },
      { name: 'promotion_comment', type: "TEXT DEFAULT ''" },
    ];
    for (const col of v480ModelCols) {
      try { dbInstance.exec(`ALTER TABLE models ADD COLUMN ${col.name} ${col.type}`); } catch(e) {}
    }
    console.log('✅ v4.8.0 promotion columns ensured');

    // ═══ v4.9.0: Release Package & Seal Manifest ═══
    // Create releases table
    dbInstance.exec(`CREATE TABLE IF NOT EXISTS releases (
      id TEXT PRIMARY KEY,
      artifact_id TEXT NOT NULL,
      model_id TEXT DEFAULT '',
      release_name TEXT NOT NULL,
      release_version TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'sealed',
      sealed_by TEXT DEFAULT '',
      sealed_at TEXT NOT NULL,
      release_notes TEXT DEFAULT '',
      release_manifest_json TEXT DEFAULT '{}',
      source_evaluation_id TEXT DEFAULT '',
      source_experiment_id TEXT DEFAULT '',
      source_dataset_id TEXT DEFAULT '',
      metrics_snapshot_json TEXT DEFAULT '{}',
      approval_id TEXT DEFAULT '',
      approval_status TEXT DEFAULT '',
      package_present INTEGER DEFAULT 0,
      backup_verified INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`);

    // Add seal/release fields to artifacts
    const v490ArtifactCols = [
      { name: 'sealed_at', type: "TEXT DEFAULT ''" },
      { name: 'sealed_by', type: "TEXT DEFAULT ''" },
      { name: 'release_id', type: "TEXT DEFAULT ''" },
    ];
    for (const col of v490ArtifactCols) {
      try { dbInstance.exec(`ALTER TABLE artifacts ADD COLUMN ${col.name} ${col.type}`); } catch(e) {}
    }

    // Add seal/release fields to models
    const v490ModelCols = [
      { name: 'sealed_at', type: "TEXT DEFAULT ''" },
      { name: 'sealed_by', type: "TEXT DEFAULT ''" },
      { name: 'release_id', type: "TEXT DEFAULT ''" },
    ];
    for (const col of v490ModelCols) {
      try { dbInstance.exec(`ALTER TABLE models ADD COLUMN ${col.name} ${col.type}`); } catch(e) {}
    }
    console.log('✅ v4.9.0 release/seal columns ensured');

    // ═══ v5.0.0: Gate Checks ═══
    dbInstance.exec(`CREATE TABLE IF NOT EXISTS gate_checks (
      id TEXT PRIMARY KEY,
      gate_name TEXT NOT NULL,
      stage_name TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      status TEXT NOT NULL,
      check_results_json TEXT NOT NULL DEFAULT '[]',
      fail_reasons_json TEXT DEFAULT '[]',
      pass_result TEXT DEFAULT '',
      audit_record TEXT DEFAULT '',
      blocking_status TEXT DEFAULT '',
      checked_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`);

    // Add gate_status to evaluations
    try { dbInstance.exec(`ALTER TABLE evaluations ADD COLUMN gate_status TEXT DEFAULT ''`); } catch(e) {}
    // Add gate_status to artifacts (if not exists from promotion)
    try { dbInstance.exec(`ALTER TABLE artifacts ADD COLUMN gate_status TEXT DEFAULT ''`); } catch(e) {}
    // Add gate_status to models
    try { dbInstance.exec(`ALTER TABLE models ADD COLUMN gate_status TEXT DEFAULT ''`); } catch(e) {}

    // Recovery logs table
    dbInstance.exec(`CREATE TABLE IF NOT EXISTS recovery_logs (
      id TEXT PRIMARY KEY,
      recovery_type TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      status TEXT NOT NULL,
      source_backup TEXT DEFAULT '',
      source_release TEXT DEFAULT '',
      verification_json TEXT DEFAULT '{}',
      notes TEXT DEFAULT '',
      performed_by TEXT DEFAULT '',
      performed_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`);

    console.log('✅ v5.0.0 gate_checks + recovery_logs ensured');

    // ═══ F2: Dataset Version Tables (Phase-A) ═══
    // dataset_versions - 核心版本管理表
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS dataset_versions (
        id TEXT PRIMARY KEY,
        dataset_id TEXT NOT NULL,
        version TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        task_type TEXT NOT NULL,
        label_format TEXT NOT NULL,
        source_chain_json TEXT DEFAULT '{}',
        quality_chain_json TEXT DEFAULT '{}',
        governance_chain_json TEXT DEFAULT '{}',
        sample_count INTEGER DEFAULT 0,
        train_count INTEGER DEFAULT 0,
        val_count INTEGER DEFAULT 0,
        test_count INTEGER DEFAULT 0,
        class_count INTEGER DEFAULT 0,
        storage_path TEXT DEFAULT '',
        split_manifest_path TEXT DEFAULT '',
        dataset_yaml_path TEXT DEFAULT '',
        description TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        created_by TEXT DEFAULT '',
        FOREIGN KEY(dataset_id) REFERENCES datasets(id)
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('dataset_versions 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_dv_dataset ON dataset_versions(dataset_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_dv_status ON dataset_versions(status)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_dv_version ON dataset_versions(version)'); } catch(e) {}
    console.log('✅ dataset_versions 表已确保存在 (F2)');

    // F2: dataset_versions 列迁移（幂等）
    const datasetVersionCols = [
      { name: 'task_type', type: "TEXT DEFAULT 'detection'" },
      { name: 'label_format', type: "TEXT DEFAULT 'yolo'" },
      { name: 'source_chain_json', type: "TEXT DEFAULT '{}'" },
      { name: 'quality_chain_json', type: "TEXT DEFAULT '{}'" },
      { name: 'governance_chain_json', type: "TEXT DEFAULT '{}'" },
      { name: 'sample_count', type: 'INTEGER DEFAULT 0' },
      { name: 'train_count', type: 'INTEGER DEFAULT 0' },
      { name: 'val_count', type: 'INTEGER DEFAULT 0' },
      { name: 'test_count', type: 'INTEGER DEFAULT 0' },
      { name: 'class_count', type: 'INTEGER DEFAULT 0' },
      { name: 'storage_path', type: "TEXT DEFAULT ''" },
      { name: 'split_manifest_path', type: "TEXT DEFAULT ''" },
      { name: 'dataset_yaml_path', type: "TEXT DEFAULT ''" },
      { name: 'description', type: "TEXT DEFAULT ''" },
      { name: 'created_by', type: "TEXT DEFAULT ''" },
    ];
    for (const col of datasetVersionCols) {
      try { dbInstance.exec(`ALTER TABLE dataset_versions ADD COLUMN ${col.name} ${col.type}`); } catch(e) {}
    }
    console.log('✅ dataset_versions 列已升级 (F2)');

    // dataset_version_batches - 批次关联表
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS dataset_version_batches (
        id TEXT PRIMARY KEY,
        dataset_version_id TEXT NOT NULL,
        batch_type TEXT NOT NULL,
        batch_id TEXT NOT NULL,
        batch_status TEXT DEFAULT '',
        record_count INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY(dataset_version_id) REFERENCES dataset_versions(id)
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('dataset_version_batches 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_dvb_version ON dataset_version_batches(dataset_version_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_dvb_type ON dataset_version_batches(batch_type)'); } catch(e) {}
    console.log('✅ dataset_version_batches 表已确保存在 (F2)');

    // negative_pools - 负样本池表
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS negative_pools (
        id TEXT PRIMARY KEY,
        dataset_version_id TEXT NOT NULL,
        pool_version TEXT NOT NULL,
        rejection_reason TEXT DEFAULT '',
        source_batch_type TEXT DEFAULT '',
        source_batch_id TEXT DEFAULT '',
        sample_identifier TEXT NOT NULL,
        label_data TEXT DEFAULT '{}',
        rejection_metadata TEXT DEFAULT '{}',
        reused_count INTEGER DEFAULT 0,
        last_reused_at TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY(dataset_version_id) REFERENCES dataset_versions(id)
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('negative_pools 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_np_version ON negative_pools(pool_version)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_np_reason ON negative_pools(rejection_reason)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_np_sample ON negative_pools(sample_identifier)'); } catch(e) {}
    console.log('✅ negative_pools 表已确保存在 (F2)');

    // dataset_version_approvals - 治理审批表
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS dataset_version_approvals (
        id TEXT PRIMARY KEY,
        dataset_version_id TEXT NOT NULL,
        approval_status TEXT NOT NULL DEFAULT 'pending',
        approver_id TEXT DEFAULT '',
        approver_name TEXT DEFAULT '',
        approval_comment TEXT DEFAULT '',
        gate_level TEXT DEFAULT '',
        gate_checks_json TEXT DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY(dataset_version_id) REFERENCES dataset_versions(id)
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('dataset_version_approvals 建表错误:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_dva_version ON dataset_version_approvals(dataset_version_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_dva_status ON dataset_version_approvals(approval_status)'); } catch(e) {}
    console.log('✅ dataset_version_approvals 表已确保存在 (F2)');

    // ═══ F3: YOLO Training Closure Columns (Phase-A) ═══
    // runs 表扩展字段
    const runsF3Cols = [
      { name: 'dataset_version_id', type: "TEXT DEFAULT ''" },
      { name: 'execution_mode', type: "TEXT DEFAULT 'standard'" },
      { name: 'yolo_config_json', type: "TEXT DEFAULT '{}'" },
      { name: 'env_snapshot_json', type: "TEXT DEFAULT '{}'" },
      { name: 'exit_code', type: 'INTEGER DEFAULT 0' },
      { name: 'tenant_id', type: "TEXT DEFAULT ''" },
      { name: 'project_id', type: "TEXT DEFAULT ''" },
      { name: 'run_group', type: "TEXT DEFAULT ''" },
    ];
    for (const col of runsF3Cols) {
      try { dbInstance.exec(`ALTER TABLE runs ADD COLUMN ${col.name} ${col.type}`); } catch(e) {}
    }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_runs_dataset_version ON runs(dataset_version_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_runs_scope ON runs(tenant_id, project_id, run_group)'); } catch(e) {}
    console.log('✅ runs 表 F3 列已升级 (YOLO Training)');

    // ═══ F4: Evaluation & Archive Columns (Phase-A) ═══
    // evaluations 表扩展字段
    const evaluationsF4Cols = [
      { name: 'artifact_id', type: "TEXT DEFAULT ''" },
      { name: 'dataset_version_id', type: "TEXT DEFAULT ''" },
      { name: 'execution_mode', type: "TEXT DEFAULT 'standard'" },
      { name: 'yolo_eval_config_json', type: "TEXT DEFAULT '{}'" },
      { name: 'env_snapshot_json', type: "TEXT DEFAULT '{}'" },
      { name: 'exit_code', type: 'INTEGER DEFAULT 0' },
      { name: 'evaluation_report_json', type: "TEXT DEFAULT '{}'" },
      { name: 'promote_gate_status', type: "TEXT DEFAULT 'pending'" },
      { name: 'promote_gate_checks_json', type: "TEXT DEFAULT '{}'" },
    ];
    for (const col of evaluationsF4Cols) {
      try { dbInstance.exec(`ALTER TABLE evaluations ADD COLUMN ${col.name} ${col.type}`); } catch(e) {}
    }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_eval_artifact ON evaluations(artifact_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_eval_dataset_version ON evaluations(dataset_version_id)'); } catch(e) {}
    console.log('✅ evaluations 表 F4 列已升级 (Evaluation & Archive)');

    // models 表扩展字段
    const modelsF4Cols = [
      { name: 'evaluation_id', type: "TEXT DEFAULT ''" },
      { name: 'artifact_id', type: "TEXT DEFAULT ''" },
      { name: 'dataset_version_id', type: "TEXT DEFAULT ''" },
      { name: 'training_run_id', type: "TEXT DEFAULT ''" },
      { name: 'promotion_status', type: "TEXT DEFAULT 'draft'" },
      { name: 'release_note_json', type: "TEXT DEFAULT '{}'" },
    ];
    for (const col of modelsF4Cols) {
      try { dbInstance.exec(`ALTER TABLE models ADD COLUMN ${col.name} ${col.type}`); } catch(e) {}
    }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_model_evaluation ON models(evaluation_id)'); } catch(e) {}
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_model_artifact ON models(artifact_id)'); } catch(e) {}
    console.log('✅ models 表 F4 列已升级 (Evaluation & Archive)');

    // ═══ B1: Real Data Chain Tables ═══════════════════════════════════════
    // B1: video_batches 表 - 视频批次管理
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS video_batches (
        id TEXT PRIMARY KEY,
        batch_code TEXT NOT NULL,
        source_type TEXT DEFAULT 'upload',
        source_url TEXT,
        total_frames INTEGER,
        duration_seconds INTEGER,
        resolution TEXT,
        fps REAL,
        status TEXT DEFAULT 'pending',
        metadata_json TEXT,
        created_at TEXT,
        updated_at TEXT
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('video_batches table error:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_video_batch_status ON video_batches(status)'); } catch(e) {}
    console.log('✅ video_batches 表已确保存在 (B1)');

    // B1: frame_extractions 表 - 抽帧批次
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS frame_extractions (
        id TEXT PRIMARY KEY,
        video_batch_id TEXT,
        extraction_config_json TEXT,
        total_frames INTEGER,
        output_path TEXT,
        status TEXT DEFAULT 'pending',
        created_at TEXT,
        updated_at TEXT
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('frame_extractions table error:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_frame_extraction_video ON frame_extractions(video_batch_id)'); } catch(e) {}
    console.log('✅ frame_extractions 表已确保存在 (B1)');

    // E2: frame_cleanings 表 - 帧清洗记录
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS frame_cleanings (
        id TEXT PRIMARY KEY,
        frame_extraction_id TEXT,
        cleaned_output_dir TEXT,
        raw_count INTEGER,
        cleaned_count INTEGER,
        dropped_count INTEGER,
        cleaning_config_json TEXT,
        created_at TEXT,
        updated_at TEXT
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('frame_cleanings table error:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_frame_cleaning_fe ON frame_cleanings(frame_extraction_id)'); } catch(e) {}
    console.log('✅ frame_cleanings 表已确保存在 (E2)');

    // B1: yolo_annotations 表 - YOLO 粗框标注
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS yolo_annotations (
        id TEXT PRIMARY KEY,
        frame_extraction_id TEXT,
        model_id TEXT,
        annotation_data_json TEXT,
        total_boxes INTEGER,
        status TEXT DEFAULT 'pending',
        created_at TEXT,
        updated_at TEXT
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('yolo_annotations table error:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_yolo_annotation_frame ON yolo_annotations(frame_extraction_id)'); } catch(e) {}
    console.log('✅ yolo_annotations 表已确保存在 (B1)');

    // B1: review_packs 表 - 人工复核包
    try { dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS review_packs (
        id TEXT PRIMARY KEY,
        dataset_version_id TEXT,
        pack_type TEXT DEFAULT 'human_review',
        total_samples INTEGER,
        reviewed_samples INTEGER DEFAULT 0,
        approved_samples INTEGER DEFAULT 0,
        rejected_samples INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        reviewer_assignee TEXT,
        created_at TEXT,
        updated_at TEXT
      )
    `); } catch(e) { if (!e.message.includes('already exists')) console.error('review_packs table error:', e.message); }
    try { dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_review_pack_dataset ON review_packs(dataset_version_id)'); } catch(e) {}
    console.log('✅ review_packs 表已确保存在 (B1)');

    // B1: 扩展现有表字段
    // classifier_verifications 表扩展
    try { dbInstance.exec('ALTER TABLE classifier_verifications ADD COLUMN yolo_annotation_id TEXT'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE classifier_verifications ADD COLUMN rejection_reason TEXT'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE classifier_verifications ADD COLUMN confidence REAL'); } catch(e) {}
    console.log('✅ classifier_verifications 表已扩展 (B1)');

    // sam_segmentations 表扩展
    try { dbInstance.exec('ALTER TABLE sam_segmentations ADD COLUMN classifier_verification_id TEXT'); } catch(e) {}
    console.log('✅ sam_segmentations 表已扩展 (B1)');

    // negative_pools 表扩展
    try { dbInstance.exec('ALTER TABLE negative_pools ADD COLUMN badcase_type TEXT'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE negative_pools ADD COLUMN source_image_id TEXT'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE negative_pools ADD COLUMN source_box_json TEXT'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE negative_pools ADD COLUMN reviewed_by TEXT'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE negative_pools ADD COLUMN reviewed_at TEXT'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE negative_pools ADD COLUMN reuse_count INTEGER DEFAULT 0'); } catch(e) {}
    try { dbInstance.exec('ALTER TABLE negative_pools ADD COLUMN last_reused_at TEXT'); } catch(e) {}
    console.log('✅ negative_pools 表已扩展 (B1)');

    // ── D2: Production Observations Table ────────────────────────────────────
    try {
      dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS production_observations (
          id TEXT PRIMARY KEY,
          model_id TEXT,
          observation_period_start TEXT,
          observation_period_end TEXT,
          inference_count INTEGER DEFAULT 0,
          ui_misdetect_count INTEGER DEFAULT 0,
          missed_detection_count INTEGER DEFAULT 0,
          classifier_reject_count INTEGER DEFAULT 0,
          review_pack_pressure REAL DEFAULT 0,
          badcase_count INTEGER DEFAULT 0,
          notes TEXT,
          created_at TEXT,
          updated_at TEXT
        )
      `);
      console.log('✅ production_observations 表已确保存在 (D2)');
    } catch(e) { console.log('⚠️ production_observations 表创建失败:', e); }

    // ── D2: Production Badcases Table ────────────────────────────────────────
    try {
      dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS production_badcases (
          id TEXT PRIMARY KEY,
          model_id TEXT,
          observation_id TEXT,
          badcase_type TEXT,
          frame_id TEXT,
          severity TEXT,
          description TEXT,
          metadata_json TEXT,
          status TEXT DEFAULT 'pending',
          created_at TEXT,
          updated_at TEXT
        )
      `);
      console.log('✅ production_badcases 表已确保存在 (D2)');
    } catch(e) { console.log('⚠️ production_badcases 表创建失败:', e); }

    // ── D2: Review Pack Items Table ──────────────────────────────────────────
    try {
      dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS review_pack_items (
          id TEXT PRIMARY KEY,
          review_pack_id TEXT,
          badcase_id TEXT,
          frame_id TEXT,
          badcase_type TEXT,
          severity TEXT,
          description TEXT,
          metadata_json TEXT,
          review_decision TEXT,
          reviewer_notes TEXT,
          created_at TEXT,
          updated_at TEXT
        )
      `);
      console.log('✅ review_pack_items 表已确保存在 (D2)');
    } catch(e) { console.log('⚠️ review_pack_items 表创建失败:', e); }

    console.log('✅ 数据库连接成功 (使用 node:sqlite)');
  }
  return dbInstance;
}

/**
 * 测试数据库连接
 */
export function testConnection(): {
  ok: boolean;
  db: string;
  connected: boolean;
  tables?: string[];
  error?: string;
} {
  try {
    const db = getDatabase();

    // 执行简单查询测试连接
    const tablesResult = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    const tables = tablesResult.map((row: any) => row.name);

    return {
      ok: true,
      db: 'sqlite',
      connected: true,
      tables,
    };
  } catch (error) {
    return {
      ok: false,
      db: 'sqlite',
      connected: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 执行SQL查询
 */
export function query(sql: string, params: any[] = []): any[] {
  const db = getDatabase();
  const stmt = db.prepare(sql);
  return params.length > 0 ? stmt.all(...params) : stmt.all();
}

/**
 * 执行SQL语句（INSERT/UPDATE/DELETE）
 */
export function run(sql: string, params: any[] = []): { changes: number; lastInsertRowid: number } {
  const db = getDatabase();
  const stmt = db.prepare(sql);
  const result = params.length > 0 ? stmt.run(...params) : stmt.run();
  return {
    changes: Number(result.changes),
    lastInsertRowid: Number(result.lastInsertRowid),
  };
}

/**
 * 关闭数据库连接
 */
export function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    console.log('🔒 数据库连接已关闭');
  }
}

// 默认导出
export default {
  getDatabase,
  testConnection,
  query,
  run,
  closeDatabase,
};
