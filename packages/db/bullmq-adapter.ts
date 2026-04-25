/**
 * BullMQ/Redis 队列适配器 — 内存队列 → Redis 无痛切换
 *
 * 用法:
 *   import { getTaskQueue } from '../db/bullmq-adapter.js';
 *   当 REDIS_HOST 环境变量存在时自动使用 BullMQ，否则回退到内存队列
 *
 * 环境变量:
 *   REDIS_HOST=localhost
 *   REDIS_PORT=6379
 *   REDIS_PASSWORD=
 *   REDIS_TLS=false
 */

import { getTaskQueue as getMemoryQueue } from '../apps/local-api/src/queue/index.js';

let bullQueue: any = null;
let bullMode = false;

async function initBull() {
  const host = process.env.REDIS_HOST || '';
  if (!host) return;

  try {
    const { Queue, Worker, QueueEvents } = await import('bullmq');
    const IORedis = (await import('ioredis')).default;

    const connection = new IORedis({
      host,
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
      tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
    });

    bullQueue = new Queue('aip-tasks', { connection });
    bullMode = true;
    console.log('[queue] BullMQ/Redis mode enabled');
  } catch (err) {
    console.warn('[queue] BullMQ not available, falling back to in-memory:', err);
    bullMode = false;
  }
}

export function isBullMode(): boolean {
  return bullMode;
}

export async function getTaskQueueBull(): Promise<any> {
  if (!bullQueue) await initBull();
  if (!bullQueue) return getMemoryQueue();
  return {
    enqueue: (task: any) => bullQueue.add(task.type, task, {
      jobId: task.id,
      priority: task.priority === 'critical' ? 1 : task.priority === 'high' ? 2 : task.priority === 'normal' ? 3 : 4,
      attempts: task.maxRetries + 1 || 3,
      backoff: { type: 'exponential', delay: 1000 },
    }),
    getStats: async () => {
      const [waiting, active, completed, failed] = await Promise.all([
        bullQueue.getWaitingCount(), bullQueue.getActiveCount(),
        bullQueue.getCompletedCount(), bullQueue.getFailedCount(),
      ]);
      return { queued: waiting, active, completed, failed, total: waiting + active + completed + failed };
    },
    getQueue: () => bullQueue,
  };
}

export default { getTaskQueue: getTaskQueueBull, isBullMode };
