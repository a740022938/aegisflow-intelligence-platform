import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../db/builtin-sqlite.js';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  template_id: string | null;
  template_code?: string | null;
  template_version?: string | null;
  owner: string | null;
  created_at: string;
  updated_at: string;
  started_at?: string | null;
  finished_at?: string | null;
  source_task_id?: string | null;
  input_payload?: string | null;
  output_summary?: string | null;
  error_message?: string | null;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
}

export interface CreateTaskResponse {
  ok: boolean;
  task?: Task;
  error?: string;
}

export interface GetTasksResponse {
  ok: boolean;
  tasks: Task[];
  count: number;
  error?: string;
}

export interface GetTaskResponse {
  ok: boolean;
  task?: Task;
  error?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string | null;
  owner?: string | null;
  status?: string;
  started_at?: string | null;
  finished_at?: string | null;
  source_task_id?: string | null;
  template_id?: string | null;
  template_code?: string | null;
  template_version?: string | null;
  input_payload?: string | null;
  output_summary?: string | null;
  error_message?: string | null;
}

export interface UpdateTaskResponse {
  ok: boolean;
  task?: Task;
  error?: string;
}

export interface GetTasksFilter {
  status?: string;
  owner?: string;
  created_after?: string;
  created_before?: string;
}

export interface GetTasksOptions {
  sort?: string;
  order?: string;
  page?: number;
  limit?: number;
}

export interface GetTasksFilteredResponse {
  ok: boolean;
  tasks: Task[];
  count: number;
  total: number;
  page?: number;
  limit?: number;
  pages?: number;
  filter?: GetTasksFilter;
  options?: GetTasksOptions;
  error?: string;
}

let schemaEnsured = false;
const VALID_TASK_STATUSES = ['pending', 'queued', 'running', 'completed', 'success', 'failed', 'cancelled'];

function ensureTaskColumns() {
  if (schemaEnsured) {
    return;
  }

  const db = getDatabase();

  // v4.4.1: Create tasks table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      template_id TEXT,
      template_code TEXT,
      template_version TEXT,
      owner TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      started_at TEXT,
      finished_at TEXT,
      source_task_id TEXT,
      input_payload TEXT,
      output_summary TEXT,
      error_message TEXT
    )
  `);

  const columns = db.prepare('PRAGMA table_info(tasks)').all() as Array<{ name: string }>;
  const columnSet = new Set(columns.map(col => col.name));
  const migrationStatements: string[] = [];

  if (!columnSet.has('started_at')) migrationStatements.push('ALTER TABLE tasks ADD COLUMN started_at TEXT');
  if (!columnSet.has('finished_at')) migrationStatements.push('ALTER TABLE tasks ADD COLUMN finished_at TEXT');
  if (!columnSet.has('source_task_id')) migrationStatements.push('ALTER TABLE tasks ADD COLUMN source_task_id TEXT');
  if (!columnSet.has('template_code')) migrationStatements.push('ALTER TABLE tasks ADD COLUMN template_code TEXT');
  if (!columnSet.has('template_version')) migrationStatements.push('ALTER TABLE tasks ADD COLUMN template_version TEXT');
  if (!columnSet.has('input_payload')) migrationStatements.push('ALTER TABLE tasks ADD COLUMN input_payload TEXT');
  if (!columnSet.has('output_summary')) migrationStatements.push('ALTER TABLE tasks ADD COLUMN output_summary TEXT');
  if (!columnSet.has('error_message')) migrationStatements.push('ALTER TABLE tasks ADD COLUMN error_message TEXT');

  migrationStatements.forEach(sql => { try { db.exec(sql); } catch {} });
  schemaEnsured = true;
}

function normalizeTask(task: any): Task {
  return {
    ...task,
    started_at: task.started_at ?? null,
    finished_at: task.finished_at ?? null,
    source_task_id: task.source_task_id ?? null,
    template_code: task.template_code ?? null,
    template_version: task.template_version ?? null,
    input_payload: task.input_payload ?? null,
    output_summary: task.output_summary ?? null,
    error_message: task.error_message ?? null
  };
}

export function getAllTasks(): GetTasksResponse {
  try {
    ensureTaskColumns();
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all() as unknown as Task[];
    const tasks = rows.map(normalizeTask);
    return { ok: true, tasks, count: tasks.length };
  } catch (error) {
    return { ok: false, tasks: [], count: 0, error: error instanceof Error ? error.message : String(error) };
  }
}

export function getTasksAdvanced(filter?: GetTasksFilter, options?: GetTasksOptions): GetTasksFilteredResponse {
  try {
    ensureTaskColumns();
    const db = getDatabase();

    const whereConditions: string[] = [];
    const params: any[] = [];

    if (filter) {
      if (filter.status) {
        whereConditions.push('status = ?');
        params.push(filter.status);
      }
      if (filter.owner !== undefined) {
        if (filter.owner === null || filter.owner === '') {
          whereConditions.push('owner IS NULL');
        } else {
          whereConditions.push('owner = ?');
          params.push(filter.owner);
        }
      }
      if (filter.created_after) {
        whereConditions.push('created_at >= ?');
        params.push(filter.created_after);
      }
      if (filter.created_before) {
        whereConditions.push('created_at <= ?');
        params.push(filter.created_before);
      }
    }

    const whereClause = whereConditions.length > 0 ? ` WHERE ${whereConditions.join(' AND ')}` : '';
    const countQuery = `SELECT COUNT(*) as total FROM tasks${whereClause}`;
    const countResult = db.prepare(countQuery).get(...params) as { total: number };
    const total = countResult.total;

    let orderBy = 'created_at DESC';
    if (options) {
      const sortField = options.sort || 'created_at';
      const sortOrder = (options.order || 'desc').toUpperCase();
      const validSortFields = ['created_at', 'updated_at', 'title', 'status', 'started_at', 'finished_at'];
      if (!validSortFields.includes(sortField)) {
        return { ok: false, tasks: [], count: 0, total: 0, error: `Invalid sort field: ${sortField}. Valid fields are: ${validSortFields.join(', ')}` };
      }
      if (sortOrder !== 'ASC' && sortOrder !== 'DESC') {
        return { ok: false, tasks: [], count: 0, total: 0, error: `Invalid sort order: ${options.order}. Valid orders are: asc, desc` };
      }
      orderBy = `${sortField} ${sortOrder}`;
    }

    let limitClause = '';
    const pageParams = [...params];
    if (options) {
      const page = Math.max(1, options.page || 1);
      const limit = Math.max(1, Math.min(options.limit || 20, 100));
      const offset = (page - 1) * limit;
      limitClause = ' LIMIT ? OFFSET ?';
      pageParams.push(limit, offset);
    }

    const query = `SELECT * FROM tasks${whereClause} ORDER BY ${orderBy}${limitClause}`;
    const rows = db.prepare(query).all(...pageParams) as unknown as Task[];
    const tasks = rows.map(normalizeTask);

    let pageInfo = {};
    if (options) {
      const page = Math.max(1, options.page || 1);
      const limit = Math.max(1, Math.min(options.limit || 20, 100));
      const pages = Math.ceil(total / limit);
      pageInfo = { page, limit, pages };
    }

    return { ok: true, tasks, count: tasks.length, total, ...pageInfo, filter, options };
  } catch (error) {
    return { ok: false, tasks: [], count: 0, total: 0, error: error instanceof Error ? error.message : String(error) };
  }
}

export function getTasksByStatus(status?: string): GetTasksFilteredResponse {
  return getTasksAdvanced(status ? { status } : undefined);
}

export function updateTaskStatus(id: string, status: string): UpdateTaskResponse {
  if (!VALID_TASK_STATUSES.includes(status)) {
    return { ok: false, error: `Invalid status: ${status}. Valid statuses are: ${VALID_TASK_STATUSES.join(', ')}` };
  }
  return updateTask(id, { status });
}

export function updateTask(id: string, data: UpdateTaskRequest): UpdateTaskResponse {
  try {
    ensureTaskColumns();
    const db = getDatabase();
    const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as unknown as Task | undefined;
    if (!existingTask) {
      return { ok: false, error: `Task with id ${id} not found` };
    }

    if (data.status !== undefined && !VALID_TASK_STATUSES.includes(data.status)) {
      return { ok: false, error: `Invalid status: ${data.status}. Valid statuses are: ${VALID_TASK_STATUSES.join(', ')}` };
    }

    const updateFields: string[] = [];
    const params: any[] = [];

    const setNullableText = (field: keyof UpdateTaskRequest) => {
      if (data[field] !== undefined) {
        updateFields.push(`${String(field)} = ?`);
        params.push(data[field] as any);
      }
    };

    if (data.title !== undefined) {
      if (typeof data.title !== 'string' || data.title.trim() === '') {
        return { ok: false, error: 'Title must be a non-empty string' };
      }
      updateFields.push('title = ?');
      params.push(data.title.trim());
    }

    if (data.description !== undefined) {
      if (data.description !== null && typeof data.description !== 'string') {
        return { ok: false, error: 'Description must be a string or null' };
      }
      updateFields.push('description = ?');
      params.push(data.description);
    }

    if (data.owner !== undefined) {
      if (data.owner !== null && typeof data.owner !== 'string') {
        return { ok: false, error: 'Owner must be a string or null' };
      }
      updateFields.push('owner = ?');
      params.push(data.owner);
    }

    if (data.status !== undefined) {
      updateFields.push('status = ?');
      params.push(data.status);
    }

    setNullableText('started_at');
    setNullableText('finished_at');
    setNullableText('source_task_id');
    setNullableText('template_id');
    setNullableText('template_code');
    setNullableText('template_version');
    setNullableText('input_payload');
    setNullableText('output_summary');
    setNullableText('error_message');

    if (updateFields.length === 0) {
      return { ok: false, error: 'No fields to update. Provide at least one field.' };
    }

    const updatedAt = new Date().toISOString();
    updateFields.push('updated_at = ?');
    params.push(updatedAt);
    params.push(id);

    const updateQuery = `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`;
    const result = db.prepare(updateQuery).run(...params);
    if (result.changes === 0) {
      return { ok: false, error: 'Failed to update task' };
    }

    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as unknown as Task;
    return { ok: true, task: normalizeTask(updatedTask) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export function getTaskById(id: string): GetTaskResponse {
  try {
    ensureTaskColumns();
    const db = getDatabase();
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as unknown as Task | undefined;
    if (!task) {
      return { ok: false, error: `Task with id ${id} not found` };
    }
    return { ok: true, task: normalizeTask(task) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export function createTask(data: CreateTaskRequest): CreateTaskResponse {
  try {
    ensureTaskColumns();
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();
    const task: Task = {
      id,
      title: data.title,
      description: data.description || null,
      status: 'pending',
      template_id: null,
      template_code: null,
      template_version: null,
      owner: null,
      created_at: now,
      updated_at: now,
      started_at: null,
      finished_at: null,
      source_task_id: null,
      input_payload: null,
      output_summary: null,
      error_message: null
    };

    db.prepare(`
      INSERT INTO tasks (
        id, title, description, status, template_id, owner, created_at, updated_at,
        started_at, finished_at, source_task_id, template_code, template_version, input_payload, output_summary, error_message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      task.id,
      task.title,
      task.description,
      task.status,
      task.template_id,
      task.owner,
      task.created_at,
      task.updated_at,
      task.started_at,
      task.finished_at,
      task.source_task_id,
      task.template_code,
      task.template_version,
      task.input_payload,
      task.output_summary,
      task.error_message
    );

    return { ok: true, task };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export function cloneTaskForRetry(sourceTaskId: string): CreateTaskResponse {
  const source = getTaskById(sourceTaskId);
  if (!source.ok || !source.task) {
    return { ok: false, error: source.error || 'Source task not found' };
  }

  const created = createTask({
    title: `${source.task.title}（重试）`,
    description: source.task.description || ''
  });

  if (!created.ok || !created.task) {
    return created;
  }

  const patch = updateTask(created.task.id, {
    source_task_id: source.task.id,
    template_id: source.task.template_id || null,
    template_code: source.task.template_code || null,
    template_version: source.task.template_version || null,
    input_payload: source.task.input_payload || null
  });

  if (!patch.ok) {
    return { ok: false, error: patch.error || 'Failed to initialize retry task' };
  }

  return { ok: true, task: patch.task };
}

export function getTaskCount(): number {
  try {
    ensureTaskColumns();
    const db = getDatabase();
    const result = db.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number };
    return result.count;
  } catch {
    return 0;
  }
}

export default {
  getAllTasks,
  getTasksByStatus,
  getTasksAdvanced,
  getTaskById,
  createTask,
  cloneTaskForRetry,
  updateTaskStatus,
  updateTask,
  getTaskCount
};
