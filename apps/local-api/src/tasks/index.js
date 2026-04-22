"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTasks = getAllTasks;
exports.getTasksAdvanced = getTasksAdvanced;
exports.getTasksByStatus = getTasksByStatus;
exports.updateTaskStatus = updateTaskStatus;
exports.updateTask = updateTask;
exports.getTaskById = getTaskById;
exports.createTask = createTask;
exports.cloneTaskForRetry = cloneTaskForRetry;
exports.getTaskCount = getTaskCount;
const uuid_1 = require("uuid");
const builtin_sqlite_js_1 = require("../db/builtin-sqlite.js");
let schemaEnsured = false;
const VALID_TASK_STATUSES = ['pending', 'queued', 'running', 'completed', 'success', 'failed', 'cancelled'];
function ensureTaskColumns() {
    if (schemaEnsured) {
        return;
    }
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const columns = db.prepare('PRAGMA table_info(tasks)').all();
    const columnSet = new Set(columns.map(col => col.name));
    const migrationStatements = [];
    if (!columnSet.has('started_at'))
        migrationStatements.push('ALTER TABLE tasks ADD COLUMN started_at TEXT');
    if (!columnSet.has('finished_at'))
        migrationStatements.push('ALTER TABLE tasks ADD COLUMN finished_at TEXT');
    if (!columnSet.has('source_task_id'))
        migrationStatements.push('ALTER TABLE tasks ADD COLUMN source_task_id TEXT');
    if (!columnSet.has('template_code'))
        migrationStatements.push('ALTER TABLE tasks ADD COLUMN template_code TEXT');
    if (!columnSet.has('template_version'))
        migrationStatements.push('ALTER TABLE tasks ADD COLUMN template_version TEXT');
    if (!columnSet.has('input_payload'))
        migrationStatements.push('ALTER TABLE tasks ADD COLUMN input_payload TEXT');
    if (!columnSet.has('output_summary'))
        migrationStatements.push('ALTER TABLE tasks ADD COLUMN output_summary TEXT');
    if (!columnSet.has('error_message'))
        migrationStatements.push('ALTER TABLE tasks ADD COLUMN error_message TEXT');
    migrationStatements.forEach(sql => db.exec(sql));
    schemaEnsured = true;
}
function normalizeTask(task) {
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
function getAllTasks() {
    try {
        ensureTaskColumns();
        const db = (0, builtin_sqlite_js_1.getDatabase)();
        const rows = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
        const tasks = rows.map(normalizeTask);
        return { ok: true, tasks, count: tasks.length };
    }
    catch (error) {
        return { ok: false, tasks: [], count: 0, error: error instanceof Error ? error.message : String(error) };
    }
}
function getTasksAdvanced(filter, options) {
    try {
        ensureTaskColumns();
        const db = (0, builtin_sqlite_js_1.getDatabase)();
        const whereConditions = [];
        const params = [];
        if (filter) {
            if (filter.status) {
                whereConditions.push('status = ?');
                params.push(filter.status);
            }
            if (filter.owner !== undefined) {
                if (filter.owner === null || filter.owner === '') {
                    whereConditions.push('owner IS NULL');
                }
                else {
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
        const countResult = db.prepare(countQuery).get(...params);
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
        const rows = db.prepare(query).all(...pageParams);
        const tasks = rows.map(normalizeTask);
        let pageInfo = {};
        if (options) {
            const page = Math.max(1, options.page || 1);
            const limit = Math.max(1, Math.min(options.limit || 20, 100));
            const pages = Math.ceil(total / limit);
            pageInfo = { page, limit, pages };
        }
        return { ok: true, tasks, count: tasks.length, total, ...pageInfo, filter, options };
    }
    catch (error) {
        return { ok: false, tasks: [], count: 0, total: 0, error: error instanceof Error ? error.message : String(error) };
    }
}
function getTasksByStatus(status) {
    return getTasksAdvanced(status ? { status } : undefined);
}
function updateTaskStatus(id, status) {
    if (!VALID_TASK_STATUSES.includes(status)) {
        return { ok: false, error: `Invalid status: ${status}. Valid statuses are: ${VALID_TASK_STATUSES.join(', ')}` };
    }
    return updateTask(id, { status });
}
function updateTask(id, data) {
    try {
        ensureTaskColumns();
        const db = (0, builtin_sqlite_js_1.getDatabase)();
        const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
        if (!existingTask) {
            return { ok: false, error: `Task with id ${id} not found` };
        }
        if (data.status !== undefined && !VALID_TASK_STATUSES.includes(data.status)) {
            return { ok: false, error: `Invalid status: ${data.status}. Valid statuses are: ${VALID_TASK_STATUSES.join(', ')}` };
        }
        const updateFields = [];
        const params = [];
        const setNullableText = (field) => {
            if (data[field] !== undefined) {
                updateFields.push(`${String(field)} = ?`);
                params.push(data[field]);
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
        const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
        return { ok: true, task: normalizeTask(updatedTask) };
    }
    catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
}
function getTaskById(id) {
    try {
        ensureTaskColumns();
        const db = (0, builtin_sqlite_js_1.getDatabase)();
        const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
        if (!task) {
            return { ok: false, error: `Task with id ${id} not found` };
        }
        return { ok: true, task: normalizeTask(task) };
    }
    catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
}
function createTask(data) {
    try {
        ensureTaskColumns();
        const db = (0, builtin_sqlite_js_1.getDatabase)();
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const task = {
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
    `).run(task.id, task.title, task.description, task.status, task.template_id, task.owner, task.created_at, task.updated_at, task.started_at, task.finished_at, task.source_task_id, task.template_code, task.template_version, task.input_payload, task.output_summary, task.error_message);
        return { ok: true, task };
    }
    catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
}
function cloneTaskForRetry(sourceTaskId) {
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
function getTaskCount() {
    try {
        ensureTaskColumns();
        const db = (0, builtin_sqlite_js_1.getDatabase)();
        const result = db.prepare('SELECT COUNT(*) as count FROM tasks').get();
        return result.count;
    }
    catch {
        return 0;
    }
}
exports.default = {
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
