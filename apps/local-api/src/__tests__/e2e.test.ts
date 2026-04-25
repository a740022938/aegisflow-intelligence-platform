import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDatabase } from '../db/builtin-sqlite.js';
import { getTaskQueue } from '../queue/index.js';
import { getWorkerPool } from '../worker-pool/index.js';

// Simple e2e tests for core module integration
// These verify the basic flow without starting a full HTTP server

describe('E2E: Core Module Integration', () => {
  beforeAll(() => {
    // Initialize modules
    getDatabase();
    getTaskQueue();
  });

  it('health: database responds', () => {
    const db = getDatabase();
    const result = db.prepare('SELECT 1 as v').get() as any;
    expect(result?.v).toBe(1);
  });

  it('health: queue responds', () => {
    const q = getTaskQueue();
    const stats = q.getStats();
    expect(typeof stats.queued).toBe('number');
    expect(typeof stats.completed).toBe('number');
  });

  it('health: worker pool responds', () => {
    const wp = getWorkerPool();
    const stats = wp.getStats();
    expect(typeof stats.totalWorkers).toBe('number');
    expect(typeof stats.idleWorkers).toBe('number');
  });

  it('flow: enqueue → process task', async () => {
    const q = getTaskQueue();
    const taskId = `test-${Date.now()}`;

    q.registerHandler('test-action', async (task) => {
      return { processed: true, input: task.data };
    });

    q.enqueue({
      id: taskId, type: 'test-action', data: { value: 42 },
      priority: 'normal', retries: 0, maxRetries: 1,
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    const task = q.getTask(taskId);
    expect(task).toBeDefined();
  });

  it('flow: intent engine resolves known intent', async () => {
    const engine = await import('../intent-engine/index.js');
    const result = engine.resolveIntent('训练YOLO模型');
    expect(result.ok).toBe(true);
    expect(result.template).toBeTruthy();
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it('flow: intent engine handles gibberish gracefully', async () => {
    const engine = await import('../intent-engine/index.js');
    const result = engine.resolveIntent('ajsdhflkajshdflkjasdhf');
    expect(result.clarification_needed).toBe(true);
    expect(result.confidence).toBe(0);
  });
});
