"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabase = getDatabase;
exports.testConnection = testConnection;
exports.query = query;
exports.run = run;
exports.closeDatabase = closeDatabase;
const node_sqlite_1 = require("node:sqlite");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
// 获取数据库文件路径
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
// 数据库文件路径 - 支持环境变量覆盖，否则使用相对路径
// 优先级: SQLITE_DB_PATH > 相对路径
function getDbPath() {
    if (process.env.SQLITE_DB_PATH) {
        return path_1.default.resolve(process.env.SQLITE_DB_PATH);
    }
    // 从 apps/local-api/src/db 到 repo/packages/db
    return path_1.default.resolve(__dirname, '../../../../packages/db/agi_factory.db');
}
const dbPath = getDbPath();
// 数据库实例
let dbInstance = null;
/**
 * 获取数据库实例
 */
function getDatabase() {
    if (!dbInstance) {
        console.log(`📊 连接数据库: ${dbPath}`);
        // 检查数据库文件是否存在，不存在则自动创建
        if (!fs_1.default.existsSync(dbPath)) {
            console.log(`📝 数据库文件不存在，自动创建...`);
            // 确保目录存在
            const dbDir = path_1.default.dirname(dbPath);
            if (!fs_1.default.existsSync(dbDir)) {
                fs_1.default.mkdirSync(dbDir, { recursive: true });
            }
            // 创建空文件，表结构会在下面自动创建
            fs_1.default.writeFileSync(dbPath, '');
        }
        // 打开数据库连接
        dbInstance = new node_sqlite_1.DatabaseSync(dbPath, { readonly: false });
        // 启用WAL模式（如果支持）
        try {
            dbInstance.exec('PRAGMA journal_mode = WAL;');
        }
        catch (error) {
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
        }
        catch (e) { }
        // 然后逐个添加其他列
        for (const col of requiredColumns) {
            try {
                dbInstance.exec(`ALTER TABLE datasets ADD COLUMN ${col.name} ${col.type}`);
            }
            catch (e) {
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
        ];
        for (const col of experimentColumns) {
            try {
                dbInstance.exec(`ALTER TABLE experiments ADD COLUMN ${col.name} ${col.type}`);
            }
            catch (e) { }
        }
        console.log('✅ experiments 表列已确保存在');
        // 确保 evaluation 相关表存在
        try {
            dbInstance.exec(`
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
        finished_at TEXT
      );
    `);
        }
        catch (e) { }
        console.log('✅ evaluations 表已确保存在');
        try {
            dbInstance.exec(`
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
    `);
        }
        catch (e) { }
        console.log('✅ evaluation_steps 表已确保存在');
        try {
            dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS evaluation_logs (
        id TEXT PRIMARY KEY,
        evaluation_id TEXT NOT NULL,
        level TEXT NOT NULL DEFAULT 'info',
        message TEXT NOT NULL,
        created_at TEXT
      );
    `);
        }
        catch (e) { }
        console.log('✅ evaluation_logs 表已确保存在');
        try {
            dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS evaluation_metrics (
        id TEXT PRIMARY KEY,
        evaluation_id TEXT NOT NULL,
        metric_key TEXT NOT NULL,
        metric_value TEXT NOT NULL,
        metric_text TEXT DEFAULT '',
        created_at TEXT
      );
    `);
        }
        catch (e) { }
        console.log('✅ evaluation_metrics 表已确保存在');
        // 确保 artifacts 表存在
        try {
            dbInstance.exec(`
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
    `);
        }
        catch (e) { }
        console.log('✅ artifacts 表已确保存在');
        // 确保 deployments 表存在
        try {
            dbInstance.exec(`
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
    `);
        }
        catch (e) {
            if (!e.message.includes('already exists'))
                console.error('deployments 建表错误:', e.message);
        }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status)');
        }
        catch (e) { }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_deployments_artifact ON deployments(artifact_id)');
        }
        catch (e) { }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_deployments_training ON deployments(training_job_id)');
        }
        catch (e) { }
        console.log('✅ deployments 表已确保存在');
        // 确保 deployment_logs 表存在
        try {
            dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS deployment_logs (
        id TEXT PRIMARY KEY,
        deployment_id TEXT NOT NULL,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);
        }
        catch (e) {
            if (!e.message.includes('already exists'))
                console.error('deployment_logs 建表错误:', e.message);
        }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_deplogs_deployment ON deployment_logs(deployment_id)');
        }
        catch (e) { }
        console.log('✅ deployment_logs 表已确保存在');
        // ── runs 表 ──────────────────────────────────────────────────────────────
        try {
            dbInstance.exec(`
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
    `);
        }
        catch (e) {
            if (!e.message.includes('already exists'))
                console.error('runs 建表错误:', e.message);
        }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_runs_status ON runs(status)');
        }
        catch (e) { }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_runs_source ON runs(source_type, source_id)');
        }
        catch (e) { }
        console.log('✅ runs 表已确保存在');
        // ── run_steps 表 ──────────────────────────────────────────────────────────
        try {
            dbInstance.exec(`
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
    `);
        }
        catch (e) {
            if (!e.message.includes('already exists'))
                console.error('run_steps 建表错误:', e.message);
        }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_runsteps_run ON run_steps(run_id)');
        }
        catch (e) { }
        console.log('✅ run_steps 表已确保存在');
        // ── run_logs 表 ───────────────────────────────────────────────────────────
        try {
            dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS run_logs (
        id TEXT PRIMARY KEY,
        run_id TEXT NOT NULL,
        step_id TEXT DEFAULT '',
        log_level TEXT NOT NULL DEFAULT 'info',
        message TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);
        }
        catch (e) {
            if (!e.message.includes('already exists'))
                console.error('run_logs 建表错误:', e.message);
        }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_runlogs_run ON run_logs(run_id)');
        }
        catch (e) { }
        console.log('✅ run_logs 表已确保存在');
        // ── run_artifacts 表 ─────────────────────────────────────────────────────
        try {
            dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS run_artifacts (
        id TEXT PRIMARY KEY,
        run_id TEXT NOT NULL,
        artifact_id TEXT DEFAULT '',
        relation_type TEXT DEFAULT 'output'
      )
    `);
        }
        catch (e) {
            if (!e.message.includes('already exists'))
                console.error('run_artifacts 建表错误:', e.message);
        }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_runartifacts_run ON run_artifacts(run_id)');
        }
        catch (e) { }
        console.log('✅ run_artifacts 表已确保存在');
        // ── dataset_pipeline_configs 表 ──────────────────────────────────────────
        // 可复用的数据集处理 pipeline 配置模板
        try {
            dbInstance.exec(`
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
    `);
        }
        catch (e) {
            if (!e.message.includes('already exists'))
                console.error('dataset_pipeline_configs 建表错误:', e.message);
        }
        console.log('✅ dataset_pipeline_configs 表已确保存在');
        // ── dataset_pipeline_runs 表 ─────────────────────────────────────────────
        // 数据集导入/清洗/split 的执行记录，直接挂 runs 体系
        try {
            dbInstance.exec(`
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
    `);
        }
        catch (e) {
            if (!e.message.includes('already exists'))
                console.error('dataset_pipeline_runs 建表错误:', e.message);
        }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_dpr_run ON dataset_pipeline_runs(run_id)');
        }
        catch (e) { }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_dpr_dataset ON dataset_pipeline_runs(dataset_id)');
        }
        catch (e) { }
        console.log('✅ dataset_pipeline_runs 表已确保存在');
        // ── dataset_splits 表 ────────────────────────────────────────────────────
        // 数据集 split manifest，记录 train/val/test split 结果
        try {
            dbInstance.exec(`
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
    `);
        }
        catch (e) {
            if (!e.message.includes('already exists'))
                console.error('dataset_splits 建表错误:', e.message);
        }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_ds_pipeline ON dataset_splits(dataset_pipeline_run_id)');
        }
        catch (e) { }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_ds_dataset ON dataset_splits(dataset_id)');
        }
        catch (e) { }
        console.log('✅ dataset_splits 表已确保存在');
        // ── training_configs 表 ──────────────────────────────────────────────────
        // 可复用的训练参数模板
        try {
            dbInstance.exec(`
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
    `);
        }
        catch (e) {
            if (!e.message.includes('already exists'))
                console.error('training_configs 建表错误:', e.message);
        }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_training_configs_code ON training_configs(config_code)');
        }
        catch (e) { }
        console.log('✅ training_configs 表已确保存在');
        // ── training_checkpoints 表 ──────────────────────────────────────────────
        // 训练 checkpoint 记录，直接挂 runs 体系
        try {
            dbInstance.exec(`
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
    `);
        }
        catch (e) {
            if (!e.message.includes('already exists'))
                console.error('training_checkpoints 建表错误:', e.message);
        }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_tc_run ON training_checkpoints(run_id)');
        }
        catch (e) { }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_tc_epoch ON training_checkpoints(epoch)');
        }
        catch (e) { }
        console.log('✅ training_checkpoints 表已确保存在');
        // 确保 model_packages 表存在
        try {
            dbInstance.exec(`
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
    `);
        }
        catch (e) {
            if (!e.message.includes('already exists'))
                console.error('model_packages 建表错误:', e.message);
        }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_mp_model ON model_packages(model_id)');
        }
        catch (e) { }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_mp_status ON model_packages(status)');
        }
        catch (e) { }
        console.log('✅ model_packages 表已确保存在');
        // 确保 model_package_artifacts 表存在
        try {
            dbInstance.exec(`
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
    `);
        }
        catch (e) {
            if (!e.message.includes('already exists'))
                console.error('model_package_artifacts 建表错误:', e.message);
        }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_mpa_package ON model_package_artifacts(package_id)');
        }
        catch (e) { }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_mpa_artifact ON model_package_artifacts(artifact_id)');
        }
        catch (e) { }
        console.log('✅ model_package_artifacts 表已确保存在');
        // 确保 deployment_targets 表存在
        try {
            dbInstance.exec(`
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
    `);
        }
        catch (e) {
            if (!e.message.includes('already exists'))
                console.error('deployment_targets 建表错误:', e.message);
        }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_dt_status ON deployment_targets(status)');
        }
        catch (e) { }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_dt_type ON deployment_targets(target_type)');
        }
        catch (e) { }
        console.log('✅ deployment_targets 表已确保存在');
        // 确保 deployment_revisions 表存在
        try {
            dbInstance.exec(`
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
    `);
        }
        catch (e) {
            if (!e.message.includes('already exists'))
                console.error('deployment_revisions 建表错误:', e.message);
        }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_dr_deployment ON deployment_revisions(deployment_id)');
        }
        catch (e) { }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_dr_package ON deployment_revisions(package_id)');
        }
        catch (e) { }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_dr_status ON deployment_revisions(status)');
        }
        catch (e) { }
        console.log('✅ deployment_revisions 表已确保存在');
        // ── templates 表 (workflow 模板) ────────────────────────────────────────────
        try {
            dbInstance.exec(`
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
    `);
        }
        catch (e) {
            if (!e.message.includes('already exists'))
                console.error('templates 建表错误:', e.message);
        }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_templates_code ON templates(code)');
        }
        catch (e) { }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category)');
        }
        catch (e) { }
        console.log('✅ templates 表已确保存在');
        // ── workflow_jobs 表 ───────────────────────────────────────────────────────
        try {
            dbInstance.exec(`
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
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        finished_at TEXT
      )
    `);
        }
        catch (e) {
            if (!e.message.includes('already exists'))
                console.error('workflow_jobs 建表错误:', e.message);
        }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_wj_status ON workflow_jobs(status)');
        }
        catch (e) { }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_wj_template ON workflow_jobs(template_id)');
        }
        catch (e) { }
        console.log('✅ workflow_jobs 表已确保存在');
        // ── job_steps 表 ───────────────────────────────────────────────────────────
        try {
            dbInstance.exec(`
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
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY(job_id) REFERENCES workflow_jobs(id)
      )
    `);
        }
        catch (e) {
            if (!e.message.includes('already exists'))
                console.error('job_steps 建表错误:', e.message);
        }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_js_job ON job_steps(job_id)');
        }
        catch (e) { }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_js_status ON job_steps(status)');
        }
        catch (e) { }
        console.log('✅ job_steps 表已确保存在');
        // ── job_logs 表 ────────────────────────────────────────────────────────────
        try {
            dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS job_logs (
        id TEXT PRIMARY KEY,
        job_id TEXT NOT NULL,
        step_id TEXT,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(job_id) REFERENCES workflow_jobs(id)
      )
    `);
        }
        catch (e) {
            if (!e.message.includes('already exists'))
                console.error('job_logs 建表错误:', e.message);
        }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_jl_job ON job_logs(job_id)');
        }
        catch (e) { }
        console.log('✅ job_logs 表已确保存在');
        // ── audit_logs 表 ──────────────────────────────────────────────────────────
        try {
            dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        action TEXT NOT NULL,
        target TEXT NOT NULL,
        result TEXT NOT NULL,
        detail_json TEXT,
        created_at TEXT NOT NULL
      )
    `);
        }
        catch (e) {
            if (!e.message.includes('already exists'))
                console.error('audit_logs 建表错误:', e.message);
        }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_al_category ON audit_logs(category)');
        }
        catch (e) { }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_al_action ON audit_logs(action)');
        }
        catch (e) { }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_al_target ON audit_logs(target)');
        }
        catch (e) { }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_al_created ON audit_logs(created_at)');
        }
        catch (e) { }
        console.log('✅ audit_logs 表已确保存在');
        // ── approvals 表 ───────────────────────────────────────────────────────────
        try {
            dbInstance.exec(`
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
    `);
        }
        catch (e) {
            if (!e.message.includes('already exists'))
                console.error('approvals 建表错误:', e.message);
        }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_appr_resource ON approvals(resource_type, resource_id)');
        }
        catch (e) { }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_appr_status ON approvals(status)');
        }
        catch (e) { }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_appr_step ON approvals(step_id)');
        }
        catch (e) { }
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
            }
            catch (e) {
                // 列可能已存在，忽略错误
            }
        }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_approvals_resource ON approvals(resource_type, resource_id)');
        }
        catch (e) { }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status)');
        }
        catch (e) { }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_approvals_step ON approvals(step_id)');
        }
        catch (e) { }
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
            }
            catch (e) {
                // Column may already exist
            }
        }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_approvals_policy ON approvals(policy_type)');
        }
        catch (e) { }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_approvals_expires ON approvals(expires_at)');
        }
        catch (e) { }
        console.log('✅ approvals 表已升级策略列 (v2.1.0 pack 2)');
        // 确保 rollback_points 表存在
        try {
            dbInstance.exec(`
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
    `);
        }
        catch (e) {
            if (!e.message.includes('already exists'))
                console.error('rollback_points 建表错误:', e.message);
        }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_rp_deployment ON rollback_points(deployment_id)');
        }
        catch (e) { }
        try {
            dbInstance.exec('CREATE INDEX IF NOT EXISTS idx_rp_status ON rollback_points(status)');
        }
        catch (e) { }
        console.log('✅ rollback_points 表已确保存在');
        // ── v2.3.0: workflow_jobs 运行控制列迁移 ──────────────────────────────────
        const wjCols = [
            { name: 'blocked_reason', type: 'TEXT' },
            { name: 'last_error', type: 'TEXT' },
            { name: 'resumed_at', type: 'TEXT' },
            { name: 'resumed_by', type: 'TEXT' },
            { name: 'cancelled_at', type: 'TEXT' },
            { name: 'cancelled_by', type: 'TEXT' },
            { name: 'retried_at', type: 'TEXT' },
            { name: 'retried_by', type: 'TEXT' },
        ];
        const existingWj = dbInstance.prepare('PRAGMA table_info(workflow_jobs)').all();
        const existingWjNames = new Set(existingWj.map((c) => c.name));
        for (const col of wjCols) {
            if (!existingWjNames.has(col.name)) {
                try {
                    dbInstance.exec(`ALTER TABLE workflow_jobs ADD COLUMN ${col.name} ${col.type}`);
                }
                catch (e) { }
            }
        }
        console.log('✅ workflow_jobs 表已升级 (v2.3.0)');
        // ── v2.4.0: workflow_jobs 可靠性护栏列迁移 ──────────────────────────────────
        const wjCols240 = [
            { name: 'retry_count', type: 'INTEGER DEFAULT 0' },
            { name: 'retry_limit', type: 'INTEGER DEFAULT 3' },
            { name: 'cancel_requested_at', type: 'TEXT' },
            { name: 'cancel_requested_by', type: 'TEXT' },
            { name: 'reconciled_at', type: 'TEXT' },
            { name: 'reconciled_by', type: 'TEXT' },
        ];
        const existingWj2 = dbInstance.prepare('PRAGMA table_info(workflow_jobs)').all();
        const existingWjNames2 = new Set(existingWj2.map((c) => c.name));
        for (const col of wjCols240) {
            if (!existingWjNames2.has(col.name.split(' ')[0])) {
                try {
                    dbInstance.exec(`ALTER TABLE workflow_jobs ADD COLUMN ${col.name} ${col.type}`);
                }
                catch (e) { }
            }
        }
        console.log('✅ workflow_jobs 表已升级 (v2.4.0)');
        console.log('✅ 数据库连接成功 (使用 node:sqlite)');
    }
    return dbInstance;
}
/**
 * 测试数据库连接
 */
function testConnection() {
    try {
        const db = getDatabase();
        // 执行简单查询测试连接
        const tablesResult = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
        const tables = tablesResult.map((row) => row.name);
        return {
            ok: true,
            db: 'sqlite',
            connected: true,
            tables,
        };
    }
    catch (error) {
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
function query(sql, params = []) {
    const db = getDatabase();
    const stmt = db.prepare(sql);
    return params.length > 0 ? stmt.all(...params) : stmt.all();
}
/**
 * 执行SQL语句（INSERT/UPDATE/DELETE）
 */
function run(sql, params = []) {
    const db = getDatabase();
    const stmt = db.prepare(sql);
    const result = params.length > 0 ? stmt.run(...params) : stmt.run();
    return {
        changes: result.changes,
        lastInsertRowid: result.lastInsertRowid,
    };
}
/**
 * 关闭数据库连接
 */
function closeDatabase() {
    if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
        console.log('🔒 数据库连接已关闭');
    }
}
// 默认导出
exports.default = {
    getDatabase,
    testConnection,
    query,
    run,
    closeDatabase,
};
