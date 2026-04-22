import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core';

// 任务表
export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('pending'), // pending, running, completed, failed
  priority: integer('priority').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  metadata: text('metadata', { mode: 'json' }), // JSON存储额外数据
});

// 任务步骤表
export const taskSteps = sqliteTable('task_steps', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull().references(() => tasks.id),
  stepIndex: integer('step_index').notNull(),
  name: text('name').notNull(),
  status: text('status').notNull().default('pending'),
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  result: text('result', { mode: 'json' }),
  error: text('error'),
});

// 任务日志表
export const taskLogs = sqliteTable('task_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskId: text('task_id').notNull(),
  stepId: text('step_id'),
  level: text('level').notNull(), // info, warn, error, debug
  message: text('message').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  metadata: text('metadata', { mode: 'json' }),
});

// 数据集表
export const datasets = sqliteTable('datasets', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // text, image, audio, video, multimodal
  size: integer('size'), // 数据项数量
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  metadata: text('metadata', { mode: 'json' }),
});

// 数据集版本表
export const datasetVersions = sqliteTable('dataset_versions', {
  id: text('id').primaryKey(),
  datasetId: text('dataset_id').notNull().references(() => datasets.id),
  version: integer('version').notNull(),
  path: text('path').notNull(), // 数据存储路径
  sizeBytes: integer('size_bytes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  checksum: text('checksum'),
});

// 实验表
export const experiments = sqliteTable('experiments', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  modelId: text('model_id'),
  datasetVersionId: text('dataset_version_id'),
  status: text('status').notNull().default('pending'),
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  hyperparameters: text('hyperparameters', { mode: 'json' }),
  metadata: text('metadata', { mode: 'json' }),
});

// 实验指标表
export const experimentMetrics = sqliteTable('experiment_metrics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  experimentId: text('experiment_id').notNull().references(() => experiments.id),
  epoch: integer('epoch'),
  step: integer('step'),
  metricName: text('metric_name').notNull(),
  metricValue: real('metric_value').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

// 模型表
export const models = sqliteTable('models', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // classification, generation, embedding, etc.
  framework: text('framework'), // pytorch, tensorflow, onnx, etc.
  path: text('path').notNull(), // 模型文件路径
  sizeBytes: integer('size_bytes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  metadata: text('metadata', { mode: 'json' }),
});

// 审批表
export const approvals = sqliteTable('approvals', {
  id: text('id').primaryKey(),
  resourceType: text('resource_type').notNull(), // task, experiment, model, etc.
  resourceId: text('resource_id').notNull(),
  action: text('action').notNull(), // create, update, delete, execute
  status: text('status').notNull().default('pending'), // pending, approved, rejected
  requestedBy: text('requested_by'),
  requestedAt: integer('requested_at', { mode: 'timestamp' }).notNull(),
  reviewedBy: text('reviewed_by'),
  reviewedAt: integer('reviewed_at', { mode: 'timestamp' }),
  comments: text('comments'),
});

// 审计日志表
export const auditLogs = sqliteTable('audit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id'),
  action: text('action').notNull(),
  resourceType: text('resource_type').notNull(),
  resourceId: text('resource_id'),
  details: text('details', { mode: 'json' }),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

// 设置表
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value', { mode: 'json' }).notNull(),
  description: text('description'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// 导出所有表
export const schema = {
  tasks,
  taskSteps,
  taskLogs,
  datasets,
  datasetVersions,
  experiments,
  experimentMetrics,
  models,
  approvals,
  auditLogs,
  settings,
};

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export type Dataset = typeof datasets.$inferSelect;
export type NewDataset = typeof datasets.$inferInsert;

export type Experiment = typeof experiments.$inferSelect;
export type NewExperiment = typeof experiments.$inferInsert;

export type Model = typeof models.$inferSelect;
export type NewModel = typeof models.$inferInsert;