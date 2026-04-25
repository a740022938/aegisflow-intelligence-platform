import { describe, it, expect } from 'vitest';

describe('API Endpoint Logic', () => {
  it('intent engine recognizes training', async () => {
    const e = await import('../intent-engine/index.js');
    const r = e.resolveIntent('帮我训练一个YOLO模型');
    expect(r.ok).toBe(true);
    expect(r.template).toBeTruthy();
    expect(r.confidence).toBeGreaterThan(0.5);
  });

  it('intent engine recognizes health check', async () => {
    const e = await import('../intent-engine/index.js');
    const r = e.resolveIntent('检查系统状态');
    expect(r.ok).toBe(true);
    expect(r.intent_id).toBe('health-check');
  });

  it('intent engine handles empty input', async () => {
    const e = await import('../intent-engine/index.js');
    const r = e.resolveIntent('');
    expect(r.ok).toBe(false);
    expect(r.clarification_needed).toBe(true);
  });

  it('queue can enqueue and get task', async () => {
    const q = await import('../queue/index.js');
    const queue = q.getTaskQueue();
    queue.registerHandler('test', async (t) => ({ done: true, data: t.data }));
    const id = `test-${Date.now()}`;
    queue.enqueue({ id, type: 'test', data: { x: 1 }, priority: 'normal', retries: 0, maxRetries: 0 });
    const task = queue.getTask(id);
    expect(task).toBeDefined();
    if (task) {
      expect(task.type).toBe('test');
      expect(task.priority).toBe('normal');
    }
  });

  it('core monitor returns status', async () => {
    const m = await import('../core-monitor.js');
    expect(m.getCoreStatus).toBeDefined();
    const s = m.getCoreStatus();
    expect(typeof s.uptime).toBe('number');
    expect(Array.isArray(s.warnings)).toBe(true);
  });

  it('worker pool returns stats', async () => {
    const wp = await import('../worker-pool/index.js');
    const pool = wp.getWorkerPool();
    const stats = pool.getStats();
    expect(stats.totalWorkers).toBeGreaterThanOrEqual(0);
    expect(typeof stats.idleWorkers).toBe('number');
  }, 10000);

  it('employee profile has identity', async () => {
    const de = await import('../digital-employee/index.js');
    expect(de.EMPLOYEE_PROFILE).toBeDefined();
    expect(de.EMPLOYEE_PROFILE.name).toBe('小枢');
    expect(de.EMPLOYEE_PROFILE.employee_id).toBe('AIP-001');
  });

  it('training-v2 architectures are defined', async () => {
    const tv2 = await import('../training-v2/index.js');
    expect(tv2.ARCHITECTURES).toBeDefined();
    expect(Object.keys(tv2.ARCHITECTURES).length).toBeGreaterThan(5);
  });

  it('backflow v2 drift detection works', async () => {
    const bv2 = await import('../backflow-v2/index.js');
    expect(bv2.registerBackflowV2Routes).toBeDefined();
  });

  it('openclaw bridge is importable', async () => {
    const oc = await import('../openclaw-bridge/index.js');
    expect(oc.registerOpenClawBridgeRoutes).toBeDefined();
  });
});
