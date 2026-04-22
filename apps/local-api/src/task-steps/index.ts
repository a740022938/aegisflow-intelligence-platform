import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../db/builtin-sqlite.js';

// 步骤接口定义
export interface TaskStep {
  id: string;
  task_id: string;
  step_index: number;
  step_name: string;
  step_type: string | null;
  status: string;
  input_json: string | null;
  output_json: string | null;
  started_at: string | null;
  finished_at: string | null;
}

export interface CreateStepRequest {
  step_name: string;
  step_type?: string;
  step_index: number;
}

export interface CreateStepResponse {
  ok: boolean;
  step?: TaskStep;
  error?: string;
}

export interface GetStepsResponse {
  ok: boolean;
  steps: TaskStep[];
  count: number;
  error?: string;
}

export interface UpdateStepStatusRequest {
  status: string;
}

export interface UpdateStepStatusResponse {
  ok: boolean;
  step?: TaskStep;
  error?: string;
}

/**
 * 获取任务的所有步骤
 */
export function getTaskSteps(taskId: string): GetStepsResponse {
  try {
    const db = getDatabase();
    
    // 先检查任务是否存在
    const taskExists = db
      .prepare('SELECT id FROM tasks WHERE id = ?')
      .get(taskId) as { id: string } | undefined;
    
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
      .all(taskId) as unknown as TaskStep[];
    
    return {
      ok: true,
      steps,
      count: steps.length,
    };
  } catch (error) {
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
export function createTaskStep(taskId: string, data: CreateStepRequest): CreateStepResponse {
  try {
    const db = getDatabase();
    
    // 检查任务是否存在
    const taskExists = db
      .prepare('SELECT id FROM tasks WHERE id = ?')
      .get(taskId) as { id: string } | undefined;
    
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
      .get(taskId, data.step_index) as { id: string } | undefined;
    
    if (existingStep) {
      return {
        ok: false,
        error: `Step with index ${data.step_index} already exists for this task`,
      };
    }
    
    // 生成步骤ID
    const id = uuidv4();
    
    // 默认值
    const step: TaskStep = {
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
    
    stmt.run(
      step.id,
      step.task_id,
      step.step_index,
      step.step_name,
      step.step_type,
      step.status,
      step.input_json,
      step.output_json,
      step.started_at,
      step.finished_at
    );
    
    return {
      ok: true,
      step,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 更新步骤状态
 */
export function updateStepStatus(
  taskId: string,
  stepId: string,
  status: string
): UpdateStepStatusResponse {
  try {
    const db = getDatabase();
    
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
      .get(stepId, taskId) as unknown as TaskStep | undefined;
    
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
    } else if ((status === 'completed' || status === 'failed') && !finishedAt) {
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
      .get(stepId) as unknown as TaskStep;
    
    return {
      ok: true,
      step: updatedStep,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 获取步骤详情
 */
export function getStepById(taskId: string, stepId: string): UpdateStepStatusResponse {
  try {
    const db = getDatabase();
    
    const step = db
      .prepare('SELECT * FROM task_steps WHERE id = ? AND task_id = ?')
      .get(stepId, taskId) as unknown as TaskStep | undefined;
    
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
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// 默认导出
export default {
  getTaskSteps,
  createTaskStep,
  updateStepStatus,
  getStepById,
};