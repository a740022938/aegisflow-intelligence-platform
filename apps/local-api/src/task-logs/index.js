"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTaskLogs = getTaskLogs;
exports.createTaskLog = createTaskLog;
exports.getTaskLogStats = getTaskLogStats;
const uuid_1 = require("uuid");
const builtin_sqlite_js_1 = require("../db/builtin-sqlite.js");
/**
 * 获取任务的所有日志
 */
function getTaskLogs(taskId, options) {
    try {
        const db = (0, builtin_sqlite_js_1.getDatabase)();
        // 先检查任务是否存在
        const taskExists = db
            .prepare('SELECT id FROM tasks WHERE id = ?')
            .get(taskId);
        if (!taskExists) {
            return {
                ok: false,
                logs: [],
                count: 0,
                task_id: taskId,
                error: `Task with id ${taskId} not found`,
            };
        }
        // 设置排序方向
        const order = options?.order || 'asc';
        const orderClause = order === 'desc' ? 'DESC' : 'ASC';
        // 获取日志列表，按created_at排序
        const logs = db
            .prepare(`SELECT * FROM task_logs WHERE task_id = ? ORDER BY created_at ${orderClause}`)
            .all(taskId);
        return {
            ok: true,
            logs,
            count: logs.length,
            task_id: taskId,
            options: options,
        };
    }
    catch (error) {
        return {
            ok: false,
            logs: [],
            count: 0,
            task_id: taskId,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
/**
 * 为任务创建新日志
 */
function createTaskLog(taskId, data) {
    try {
        const db = (0, builtin_sqlite_js_1.getDatabase)();
        // 检查任务是否存在
        const taskExists = db
            .prepare('SELECT id FROM tasks WHERE id = ?')
            .get(taskId);
        if (!taskExists) {
            return {
                ok: false,
                error: `Task with id ${taskId} not found`,
            };
        }
        // 验证必要字段
        if (!data.level || typeof data.level !== 'string') {
            return {
                ok: false,
                error: 'level is required and must be a string',
            };
        }
        if (!data.message || typeof data.message !== 'string') {
            return {
                ok: false,
                error: 'message is required and must be a string',
            };
        }
        // 验证level值是否合法
        const validLevels = ['info', 'warn', 'error', 'debug'];
        if (!validLevels.includes(data.level)) {
            return {
                ok: false,
                error: `Invalid level: ${data.level}. Valid levels are: ${validLevels.join(', ')}`,
            };
        }
        // 如果提供了step_id，检查步骤是否存在且属于指定任务
        if (data.step_id !== undefined && data.step_id !== null) {
            const stepExists = db
                .prepare('SELECT id FROM task_steps WHERE id = ? AND task_id = ?')
                .get(data.step_id, taskId);
            if (!stepExists) {
                return {
                    ok: false,
                    error: `Step with id ${data.step_id} not found for task ${taskId}`,
                };
            }
        }
        // 生成日志ID和时间戳
        const id = (0, uuid_1.v4)();
        const createdAt = new Date().toISOString();
        // 创建日志对象
        const log = {
            id,
            task_id: taskId,
            step_id: data.step_id !== undefined ? data.step_id : null,
            level: data.level,
            message: data.message,
            created_at: createdAt,
        };
        // 插入数据库
        const stmt = db.prepare(`
      INSERT INTO task_logs (id, task_id, step_id, level, message, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        stmt.run(log.id, log.task_id, log.step_id, log.level, log.message, log.created_at);
        return {
            ok: true,
            log,
        };
    }
    catch (error) {
        return {
            ok: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
/**
 * 获取任务日志统计
 */
function getTaskLogStats(taskId) {
    try {
        const db = (0, builtin_sqlite_js_1.getDatabase)();
        // 检查任务是否存在
        const taskExists = db
            .prepare('SELECT id FROM tasks WHERE id = ?')
            .get(taskId);
        if (!taskExists) {
            return {
                ok: false,
                total: 0,
                byLevel: {},
                error: `Task with id ${taskId} not found`,
            };
        }
        // 获取总日志数
        const totalResult = db
            .prepare('SELECT COUNT(*) as count FROM task_logs WHERE task_id = ?')
            .get(taskId);
        // 按级别统计
        const levelStats = db
            .prepare('SELECT level, COUNT(*) as count FROM task_logs WHERE task_id = ? GROUP BY level')
            .all(taskId);
        const byLevel = {};
        levelStats.forEach(stat => {
            byLevel[stat.level] = stat.count;
        });
        return {
            ok: true,
            total: totalResult.count,
            byLevel,
        };
    }
    catch (error) {
        return {
            ok: false,
            total: 0,
            byLevel: {},
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
// 默认导出
exports.default = {
    getTaskLogs,
    createTaskLog,
    getTaskLogStats,
};
