"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = exports.settings = exports.auditLogs = exports.approvals = exports.models = exports.experimentMetrics = exports.experiments = exports.datasetVersions = exports.datasets = exports.taskLogs = exports.taskSteps = exports.tasks = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
// 任务表
exports.tasks = (0, sqlite_core_1.sqliteTable)('tasks', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    title: (0, sqlite_core_1.text)('title').notNull(),
    description: (0, sqlite_core_1.text)('description'),
    status: (0, sqlite_core_1.text)('status').notNull().default('pending'), // pending, running, completed, failed
    priority: (0, sqlite_core_1.integer)('priority').default(1),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).notNull(),
    completedAt: (0, sqlite_core_1.integer)('completed_at', { mode: 'timestamp' }),
    metadata: (0, sqlite_core_1.text)('metadata', { mode: 'json' }), // JSON存储额外数据
});
// 任务步骤表
exports.taskSteps = (0, sqlite_core_1.sqliteTable)('task_steps', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    taskId: (0, sqlite_core_1.text)('task_id').notNull().references(() => exports.tasks.id),
    stepIndex: (0, sqlite_core_1.integer)('step_index').notNull(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    status: (0, sqlite_core_1.text)('status').notNull().default('pending'),
    startedAt: (0, sqlite_core_1.integer)('started_at', { mode: 'timestamp' }),
    completedAt: (0, sqlite_core_1.integer)('completed_at', { mode: 'timestamp' }),
    result: (0, sqlite_core_1.text)('result', { mode: 'json' }),
    error: (0, sqlite_core_1.text)('error'),
});
// 任务日志表
exports.taskLogs = (0, sqlite_core_1.sqliteTable)('task_logs', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    taskId: (0, sqlite_core_1.text)('task_id').notNull(),
    stepId: (0, sqlite_core_1.text)('step_id'),
    level: (0, sqlite_core_1.text)('level').notNull(), // info, warn, error, debug
    message: (0, sqlite_core_1.text)('message').notNull(),
    timestamp: (0, sqlite_core_1.integer)('timestamp', { mode: 'timestamp' }).notNull(),
    metadata: (0, sqlite_core_1.text)('metadata', { mode: 'json' }),
});
// 数据集表
exports.datasets = (0, sqlite_core_1.sqliteTable)('datasets', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    description: (0, sqlite_core_1.text)('description'),
    type: (0, sqlite_core_1.text)('type').notNull(), // text, image, audio, video, multimodal
    size: (0, sqlite_core_1.integer)('size'), // 数据项数量
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).notNull(),
    metadata: (0, sqlite_core_1.text)('metadata', { mode: 'json' }),
});
// 数据集版本表
exports.datasetVersions = (0, sqlite_core_1.sqliteTable)('dataset_versions', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    datasetId: (0, sqlite_core_1.text)('dataset_id').notNull().references(() => exports.datasets.id),
    version: (0, sqlite_core_1.integer)('version').notNull(),
    path: (0, sqlite_core_1.text)('path').notNull(), // 数据存储路径
    sizeBytes: (0, sqlite_core_1.integer)('size_bytes'),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull(),
    checksum: (0, sqlite_core_1.text)('checksum'),
});
// 实验表
exports.experiments = (0, sqlite_core_1.sqliteTable)('experiments', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    description: (0, sqlite_core_1.text)('description'),
    modelId: (0, sqlite_core_1.text)('model_id'),
    datasetVersionId: (0, sqlite_core_1.text)('dataset_version_id'),
    status: (0, sqlite_core_1.text)('status').notNull().default('pending'),
    startedAt: (0, sqlite_core_1.integer)('started_at', { mode: 'timestamp' }).notNull(),
    completedAt: (0, sqlite_core_1.integer)('completed_at', { mode: 'timestamp' }),
    hyperparameters: (0, sqlite_core_1.text)('hyperparameters', { mode: 'json' }),
    metadata: (0, sqlite_core_1.text)('metadata', { mode: 'json' }),
});
// 实验指标表
exports.experimentMetrics = (0, sqlite_core_1.sqliteTable)('experiment_metrics', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    experimentId: (0, sqlite_core_1.text)('experiment_id').notNull().references(() => exports.experiments.id),
    epoch: (0, sqlite_core_1.integer)('epoch'),
    step: (0, sqlite_core_1.integer)('step'),
    metricName: (0, sqlite_core_1.text)('metric_name').notNull(),
    metricValue: (0, sqlite_core_1.real)('metric_value').notNull(),
    timestamp: (0, sqlite_core_1.integer)('timestamp', { mode: 'timestamp' }).notNull(),
});
// 模型表
exports.models = (0, sqlite_core_1.sqliteTable)('models', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    description: (0, sqlite_core_1.text)('description'),
    type: (0, sqlite_core_1.text)('type').notNull(), // classification, generation, embedding, etc.
    framework: (0, sqlite_core_1.text)('framework'), // pytorch, tensorflow, onnx, etc.
    path: (0, sqlite_core_1.text)('path').notNull(), // 模型文件路径
    sizeBytes: (0, sqlite_core_1.integer)('size_bytes'),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull(),
    metadata: (0, sqlite_core_1.text)('metadata', { mode: 'json' }),
});
// 审批表
exports.approvals = (0, sqlite_core_1.sqliteTable)('approvals', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    resourceType: (0, sqlite_core_1.text)('resource_type').notNull(), // task, experiment, model, etc.
    resourceId: (0, sqlite_core_1.text)('resource_id').notNull(),
    action: (0, sqlite_core_1.text)('action').notNull(), // create, update, delete, execute
    status: (0, sqlite_core_1.text)('status').notNull().default('pending'), // pending, approved, rejected
    requestedBy: (0, sqlite_core_1.text)('requested_by'),
    requestedAt: (0, sqlite_core_1.integer)('requested_at', { mode: 'timestamp' }).notNull(),
    reviewedBy: (0, sqlite_core_1.text)('reviewed_by'),
    reviewedAt: (0, sqlite_core_1.integer)('reviewed_at', { mode: 'timestamp' }),
    comments: (0, sqlite_core_1.text)('comments'),
});
// 审计日志表
exports.auditLogs = (0, sqlite_core_1.sqliteTable)('audit_logs', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    userId: (0, sqlite_core_1.text)('user_id'),
    action: (0, sqlite_core_1.text)('action').notNull(),
    resourceType: (0, sqlite_core_1.text)('resource_type').notNull(),
    resourceId: (0, sqlite_core_1.text)('resource_id'),
    details: (0, sqlite_core_1.text)('details', { mode: 'json' }),
    ipAddress: (0, sqlite_core_1.text)('ip_address'),
    userAgent: (0, sqlite_core_1.text)('user_agent'),
    timestamp: (0, sqlite_core_1.integer)('timestamp', { mode: 'timestamp' }).notNull(),
});
// 设置表
exports.settings = (0, sqlite_core_1.sqliteTable)('settings', {
    key: (0, sqlite_core_1.text)('key').primaryKey(),
    value: (0, sqlite_core_1.text)('value', { mode: 'json' }).notNull(),
    description: (0, sqlite_core_1.text)('description'),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).notNull(),
});
// 导出所有表
exports.schema = {
    tasks: exports.tasks,
    taskSteps: exports.taskSteps,
    taskLogs: exports.taskLogs,
    datasets: exports.datasets,
    datasetVersions: exports.datasetVersions,
    experiments: exports.experiments,
    experimentMetrics: exports.experimentMetrics,
    models: exports.models,
    approvals: exports.approvals,
    auditLogs: exports.auditLogs,
    settings: exports.settings,
};
