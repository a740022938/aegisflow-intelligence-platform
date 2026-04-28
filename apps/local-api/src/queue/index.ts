import { EventEmitter } from 'node:events';
import * as db from '../db/builtin-sqlite.js';

export type TaskPriority = 'critical' | 'high' | 'normal' | 'low';

export interface QueueTask<T = any> {
  id: string;
  type: string;
  data: T;
  priority: TaskPriority;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  retries: number;
  maxRetries: number;
  createdAt: number;
  startedAt?: number;
  finishedAt?: number;
  error?: string;
  result?: any;
}

interface QueueOptions {
  concurrency: number;
  retryDelay: number;
}

const DEFAULT_OPTIONS: QueueOptions = {
  concurrency: 4,
  retryDelay: 1000,
};

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
};

type TaskHandler = (task: QueueTask) => Promise<any>;

class TaskQueue extends EventEmitter {
  private queue: QueueTask[] = [];
  private handlers = new Map<string, TaskHandler>();
  private activeCount = 0;
  private options: QueueOptions;
  private completedCount = 0;
  private failedCount = 0;
  private processing = false;
  private recoveredCount = 0;

  constructor(options: Partial<QueueOptions> = {}) {
    super();
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.ensureQueueTable();
  }

  registerHandler(type: string, handler: TaskHandler) {
    this.handlers.set(type, handler);
  }

  getStats() {
    return {
      queued: this.queue.filter(t => t.status === 'queued').length,
      active: this.activeCount,
      completed: this.completedCount,
      failed: this.failedCount,
      total: this.queue.length + this.completedCount + this.failedCount,
      recovered: this.recoveredCount,
    };
  }

  enqueue(task: Omit<QueueTask, 'status' | 'createdAt'>): string {
    const entry: QueueTask = {
      ...task,
      status: 'queued',
      createdAt: Date.now(),
    };
    this.queue.push(entry);
    this.queue.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    this.emit('enqueued', entry);
    this.persistTask(entry);
    this.processNext();
    return entry.id;
  }

  cancel(taskId: string): boolean {
    const idx = this.queue.findIndex(t => t.id === taskId && t.status === 'queued');
    if (idx === -1) return false;
    this.queue[idx].status = 'cancelled';
    this.queue.splice(idx, 1);
    this.emit('cancelled', taskId);
    this.removeTaskFromDb(taskId);
    return true;
  }

  getTask(taskId: string): QueueTask | undefined {
    return this.queue.find(t => t.id === taskId);
  }

  listTasks(status?: string): QueueTask[] {
    return status ? this.queue.filter(t => t.status === status) : [...this.queue];
  }

  private ensureQueueTable() {
    try {
      const dbInstance = db.getDatabase();
      dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS queue_tasks (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          data_json TEXT NOT NULL DEFAULT '{}',
          priority TEXT NOT NULL DEFAULT 'normal',
          status TEXT NOT NULL DEFAULT 'queued',
          retries INTEGER NOT NULL DEFAULT 0,
          maxRetries INTEGER NOT NULL DEFAULT 3,
          created_at INTEGER NOT NULL,
          started_at INTEGER,
          finished_at INTEGER,
          error TEXT,
          result_json TEXT
        )
      `);
    } catch (err) {
      console.error('[queue] Failed to ensure queue table:', err);
    }
  }

  private persistTask(task: QueueTask) {
    try {
      const dbInstance = db.getDatabase();
      dbInstance.prepare(`
        INSERT INTO queue_tasks (id, type, data_json, priority, status, retries, maxRetries, created_at, started_at, finished_at, error, result_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        task.id,
        task.type,
        JSON.stringify(task.data || {}),
        task.priority,
        task.status,
        task.retries,
        task.maxRetries,
        task.createdAt,
        task.startedAt || null,
        task.finishedAt || null,
        task.error || null,
        task.result ? JSON.stringify(task.result) : null,
      );
    } catch (err) {
      console.error('[queue] Failed to persist task:', err);
    }
  }

  private removeTaskFromDb(taskId: string) {
    try {
      const dbInstance = db.getDatabase();
      dbInstance.prepare(`DELETE FROM queue_tasks WHERE id = ?`).run(taskId);
    } catch (err) {
      console.error('[queue] Failed to remove task from DB:', err);
    }
  }

  recoverFromDb() {
    try {
      const dbInstance = db.getDatabase();
      const rows = dbInstance.prepare(`SELECT * FROM queue_tasks WHERE status IN ('queued', 'running')`).all() as any[];
      for (const row of rows) {
        const task: QueueTask = {
          id: row.id,
          type: row.type,
          data: (() => { try { return JSON.parse(row.data_json || '{}'); } catch { return {}; } })(),
          priority: row.priority || 'normal',
          status: 'queued',
          retries: row.retries || 0,
          maxRetries: row.maxRetries || 3,
          createdAt: row.created_at,
          startedAt: undefined,
          finishedAt: undefined,
          error: undefined,
          result: undefined,
        };
        this.queue.push(task);
        this.recoveredCount++;
      }
      this.queue.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
      console.log(`[queue] Recovered ${this.recoveredCount} tasks from DB`);
    } catch (err) {
      console.error('[queue] Failed to recover tasks from DB:', err);
    }
  }

  private async processNext() {
    if (this.processing) return;
    this.processing = true;

    while (this.activeCount < this.options.concurrency) {
      const idx = this.queue.findIndex(t => t.status === 'queued');
      if (idx === -1) break;

      const task = this.queue[idx];
      task.status = 'running';
      task.startedAt = Date.now();
      this.activeCount++;
      this.emit('started', task);

      const handler = this.handlers.get(task.type);

      if (!handler) {
        task.status = 'failed';
        task.error = `No handler registered for task type: ${task.type}`;
        task.finishedAt = Date.now();
        this.activeCount--;
        this.failedCount++;
        this.emit('failed', task);
        continue;
      }

      this.executeTask(task, handler);
    }

    this.processing = false;
  }

  private async executeTask(task: QueueTask, handler: TaskHandler) {
    try {
      const result = await handler(task);
      task.status = 'completed';
      task.result = result;
      task.finishedAt = Date.now();
      this.activeCount--;
      this.completedCount++;
      this.emit('completed', task);
      this.removeTaskFromDb(task.id);
    } catch (err: any) {
      task.error = err.message || String(err);
      task.finishedAt = Date.now();

      if (task.retries < task.maxRetries) {
        task.retries++;
        task.status = 'queued';
        task.startedAt = undefined;
        task.finishedAt = undefined;
        this.activeCount--;
        setTimeout(() => {
          this.queue.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
          this.emit('retry', task);
          this.processNext();
        }, this.options.retryDelay * task.retries);
      } else {
        task.status = 'failed';
        this.activeCount--;
        this.failedCount++;
        this.emit('failed', task);
        this.removeTaskFromDb(task.id);
      }
    }

    this.processNext();
  }
}

let queueInstance: TaskQueue | null = null;

export function getTaskQueue(): TaskQueue {
  if (!queueInstance) {
    queueInstance = new TaskQueue({
      concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '4', 10),
    });
  }
  return queueInstance;
}

export function initQueue() {
  const queue = getTaskQueue();
  queue.recoverFromDb();
  return queue;
}

export type { TaskHandler };
export default { getTaskQueue, initQueue };
