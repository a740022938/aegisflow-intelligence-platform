"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTaskSteps = getTaskSteps;
exports.createTaskStep = createTaskStep;
exports.updateStepStatus = updateStepStatus;
exports.getStepById = getStepById;
const uuid_1 = require("uuid");
const builtin_sqlite_js_1 = require("../db/builtin-sqlite.js");
/**
 * 获取任务的所有步骤
 */
function getTaskSteps(taskId) {
    try {
        const db = (0, builtin_sqlite_js_1.getDatabase)();
        // 先检查任务是否存在
        const taskExists = db
            .prepare('SELECT id FROM tasks WHERE id = ?')
            .get(taskId);
        if (!taskExists) {
            return {
                ok: false,
                steps: [],
                count: 0,
                error: `Task with id ${taskId} not found`,
            };
        }
        // 获取步骤列表，按step_index升序排列
        const steps = db
            .prepare('SELECT * FROM task_steps WHERE task_id = ? ORDER BY step_index ASC')
            .all(taskId);
        return {
            ok: true,
            steps,
            count: steps.length,
        };
    }
    catch (error) {
        return {
            ok: false,
            steps: [],
            count: 0,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
/**
 * 为任务创建新步骤
 */
function createTaskStep(taskId, data) {
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
        if (!data.step_name || typeof data.step_name !== 'string') {
            return {
                ok: false,
                error: 'step_name is required and must be a string',
            };
        }
        if (data.step_index === undefined || typeof data.step_index !== 'number') {
            return {
                ok: false,
                error: 'step_index is required and must be a number',
            };
        }
        // 检查step_index是否已存在
        const existingStep = db
            .prepare('SELECT id FROM task_steps WHERE task_id = ? AND step_index = ?')
            .get(taskId, data.step_index);
        if (existingStep) {
            return {
                ok: false,
                error: `Step with index ${data.step_index} already exists for this task`,
            };
        }
        // 生成步骤ID
        const id = (0, uuid_1.v4)();
        // 默认值
        const step = {
            id,
            task_id: taskId,
            step_index: data.step_index,
            step_name: data.step_name,
            step_type: data.step_type || null,
            status: 'pending',
            input_json: null,
            output_json: null,
            started_at: null,
            finished_at: null,
        };
        // 插入数据库
        const stmt = db.prepare(`
      INSERT INTO task_steps (
        id, task_id, step_index, step_name, step_type, status,
        input_json, output_json, started_at, finished_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(step.id, step.task_id, step.step_index, step.step_name, step.step_type, step.status, step.input_json, step.output_json, step.started_at, step.finished_at);
        return {
            ok: true,
            step,
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
 * 更新步骤状态
 */
function updateStepStatus(taskId, stepId, status) {
    try {
        const db = (0, builtin_sqlite_js_1.getDatabase)();
        // 验证状态值是否合法
        const validStatuses = ['pending', 'running', 'completed', 'failed'];
        if (!validStatuses.includes(status)) {
            return {
                ok: false,
                error: `Invalid status: ${status}. Valid statuses are: ${validStatuses.join(', ')}`,
            };
        }
        // 检查步骤是否存在且属于指定任务
        const existingStep = db
            .prepare('SELECT * FROM task_steps WHERE id = ? AND task_id = ?')
            .get(stepId, taskId);
        if (!existingStep) {
            return {
                ok: false,
                error: `Step with id ${stepId} not found for task ${taskId}`,
            };
        }
        // 根据状态更新时间戳
        const now = new Date().toISOString();
        let startedAt = existingStep.started_at;
        let finishedAt = existingStep.finished_at;
        if (status === 'running' && !startedAt) {
            startedAt = now;
        }
        else if ((status === 'completed' || status === 'failed') && !finishedAt) {
            finishedAt = now;
        }
        // 更新数据库
        const stmt = db.prepare(`
      UPDATE task_steps 
      SET status = ?, started_at = ?, finished_at = ? 
      WHERE id = ? AND task_id = ?
    `);
        const result = stmt.run(status, startedAt, finishedAt, stepId, taskId);
        if (result.changes === 0) {
            return {
                ok: false,
                error: 'Failed to update step status',
            };
        }
        // 获取更新后的步骤
        const updatedStep = db
            .prepare('SELECT * FROM task_steps WHERE id = ?')
            .get(stepId);
        return {
            ok: true,
            step: updatedStep,
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
 * 获取步骤详情
 */
function getStepById(taskId, stepId) {
    try {
        const db = (0, builtin_sqlite_js_1.getDatabase)();
        const step = db
            .prepare('SELECT * FROM task_steps WHERE id = ? AND task_id = ?')
            .get(stepId, taskId);
        if (!step) {
            return {
                ok: false,
                error: `Step with id ${stepId} not found for task ${taskId}`,
            };
        }
        return {
            ok: true,
            step,
        };
    }
    catch (error) {
        return {
            ok: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
// 默认导出
exports.default = {
    getTaskSteps,
    createTaskStep,
    updateStepStatus,
    getStepById,
};
