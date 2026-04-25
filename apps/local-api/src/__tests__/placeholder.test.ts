import { describe, it, expect } from 'vitest';

describe('AIP Local API Modules', () => {
  it('should have version info', async () => {
    const v = await import('../version.js');
    expect(v.APP_VERSION).toBeDefined();
    expect(typeof v.APP_VERSION).toBe('string');
  });

  it('should have queue module', async () => {
    const q = await import('../queue/index.js');
    expect(q.getTaskQueue).toBeDefined();
    const queue = q.getTaskQueue();
    expect(queue.getStats).toBeDefined();
    const stats = queue.getStats();
    expect(typeof stats.queued).toBe('number');
  });

  it('should have worker pool module', async () => {
    const wp = await import('../worker-pool/index.js');
    expect(wp.getWorkerPool).toBeDefined();
    const pool = wp.getWorkerPool();
    expect(pool.getStats).toBeDefined();
  });

  it('should have observability module', async () => {
    const obs = await import('../observability/index.js');
    expect(obs.metrics).toBeDefined();
    expect(obs.formatMetrics).toBeDefined();
    const metricsOutput = obs.formatMetrics();
    expect(typeof metricsOutput).toBe('string');
    expect(metricsOutput.length).toBeGreaterThan(0);
  });

  it('should have python runner module', async () => {
    const runner = await import('../python-runner.js');
    expect(runner.resolveRepoRoot).toBeDefined();
    expect(runner.resolveWorkerPath).toBeDefined();
    expect(runner.resolveRunDir).toBeDefined();
  });

  it('should have openclaw bridge module', async () => {
    const bridge = await import('../openclaw-bridge/index.js');
    expect(bridge.registerOpenClawBridgeRoutes).toBeDefined();
  });
});
