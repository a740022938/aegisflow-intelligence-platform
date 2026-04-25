import { EventEmitter } from 'node:events';

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

  constructor(options: Partial<QueueOptions> = {}) {
    super();
    this.options = { ...DEFAULT_OPTIONS, ...options };
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
    this.processNext();
    return entry.id;
  }

  cancel(taskId: string): boolean {
    const idx = this.queue.findIndex(t => t.id === taskId && t.status === 'queued');
    if (idx === -1) return false;
    this.queue[idx].status = 'cancelled';
    this.queue.splice(idx, 1);
    this.emit('cancelled', taskId);
    return true;
  }

  getTask(taskId: string): QueueTask | undefined {
    return this.queue.find(t => t.id === taskId);
  }

  listTasks(status?: string): QueueTask[] {
    return status ? this.queue.filter(t => t.status === status) : [...this.queue];
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
  return getTaskQueue();
}

export type { TaskHandler };
export default { getTaskQueue, initQueue };
