import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../db/builtin-sqlite.js';

// 日志接口定义
export interface TaskLog {
  id: string;
  task_id: string;
  step_id: string | null;
  level: string;
  message: string;
  created_at: string;
}

export interface CreateLogRequest {
  step_id?: string | null;
  level: string;
  message: string;
}

export interface CreateLogResponse {
  ok: boolean;
  log?: TaskLog;
  error?: string;
}

export interface GetLogsOptions {
  order?: 'asc' | 'desc';
}

export interface GetLogsResponse {
  ok: boolean;
  logs: TaskLog[];
  count: number;
  task_id: string;
  options?: GetLogsOptions;
  error?: string;
}

/**
 * 获取任务的所有日志
 */
export function getTaskLogs(taskId: string, options?: GetLogsOptions): GetLogsResponse {
  try {
    const db = getDatabase();
    
    // 先检查任务是否存在
    const taskExists = db
      .prepare('SELECT id FROM tasks WHERE id = ?')
      .get(taskId) as { id: string } | undefined;
    
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
      .all(taskId) as unknown as TaskLog[];
    
    return {
      ok: true,
      logs,
      count: logs.length,
      task_id: taskId,
      options: options,
    };
  } catch (error) {
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
export function createTaskLog(taskId: string, data: CreateLogRequest): CreateLogResponse {
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
        .get(data.step_id, taskId) as { id: string } | undefined;
      
      if (!stepExists) {
        return {
          ok: false,
          error: `Step with id ${data.step_id} not found for task ${taskId}`,
        };
      }
    }
    
    // 生成日志ID和时间戳
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    
    // 创建日志对象
    const log: TaskLog = {
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
    
    stmt.run(
      log.id,
      log.task_id,
      log.step_id,
      log.level,
      log.message,
      log.created_at
    );
    
    return {
      ok: true,
      log,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 获取任务日志统计
 */
export function getTaskLogStats(taskId: string): {
  ok: boolean;
  total: number;
  byLevel: Record<string, number>;
  error?: string;
} {
  try {
    const db = getDatabase();
    
    // 检查任务是否存在
    const taskExists = db
      .prepare('SELECT id FROM tasks WHERE id = ?')
      .get(taskId) as { id: string } | undefined;
    
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
      .get(taskId) as { count: number };
    
    // 按级别统计
    const levelStats = db
      .prepare('SELECT level, COUNT(*) as count FROM task_logs WHERE task_id = ? GROUP BY level')
      .all(taskId) as Array<{ level: string; count: number }>;
    
    const byLevel: Record<string, number> = {};
    levelStats.forEach(stat => {
      byLevel[stat.level] = stat.count;
    });
    
    return {
      ok: true,
      total: totalResult.count,
      byLevel,
    };
  } catch (error) {
    return {
      ok: false,
      total: 0,
      byLevel: {},
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// 默认导出
export default {
  getTaskLogs,
  createTaskLog,
  getTaskLogStats,
};