import { describe, it, expect } from 'vitest';

describe('Runtime Readonly Status Contract', () => {
  it('should export registerReadonlyStatusRoutes function', async () => {
    const mod = await import('../runtime/readonly-status.js');
    expect(mod.registerReadonlyStatusRoutes).toBeDefined();
    expect(typeof mod.registerReadonlyStatusRoutes).toBe('function');
  });
});

describe('Runtime Readonly Status Data Contracts', () => {
  it('status should have readonly_skeleton mode', async () => {
    const mod = await import('../runtime/readonly-status.js');
    const fastify = { get: (_path: string, _handler: any) => {} };
    const responses: Record<string, any> = {};
    const capturingApp = {
      get: (path: string, handler: any) => {
        responses[path] = handler;
      },
    };
    mod.registerReadonlyStatusRoutes(capturingApp as any);

    const statusResponse = await responses['/api/runtime/status']();
    expect(statusResponse.ok).toBe(true);
    expect(statusResponse.mode).toBe('readonly_skeleton');
    expect(statusResponse.implementationStatus).toBe('skeleton');
    expect(statusResponse.runtimeImplemented).toBe(false);
    expect(statusResponse.stageCEnabled).toBe(false);
    expect(statusResponse.dbWriteEnabled).toBe(false);
    expect(statusResponse.externalControlEnabled).toBe(false);
    expect(statusResponse.postEndpointsEnabled).toBe(false);
    expect(statusResponse.version).toBe('v7.31.0-P1');
  });

  it('readiness should have readonly_skeleton_ready and canExecuteRuntime=false', async () => {
    const mod = await import('../runtime/readonly-status.js');
    const responses: Record<string, any> = {};
    const capturingApp = { get: (path: string, handler: any) => { responses[path] = handler; } };
    mod.registerReadonlyStatusRoutes(capturingApp as any);

    const readinessResponse = await responses['/api/runtime/readiness']();
    expect(readinessResponse.ok).toBe(true);
    expect(readinessResponse.readiness).toBe('readonly_skeleton_ready');
    expect(readinessResponse.canExecuteRuntime).toBe(false);
    expect(readinessResponse.canWriteDb).toBe(false);
    expect(readinessResponse.canControlExternalTools).toBe(false);
    expect(readinessResponse.canEnableStageC).toBe(false);
    expect(readinessResponse.blockedCapabilities).toContain('db_write');
    expect(readinessResponse.blockedCapabilities).toContain('stage_c_enable');
    expect(readinessResponse.blockedCapabilities).toContain('external_control');
  });

  it('gates should have all pass with stage_c_disabled', async () => {
    const mod = await import('../runtime/readonly-status.js');
    const responses: Record<string, any> = {};
    const capturingApp = { get: (path: string, handler: any) => { responses[path] = handler; } };
    mod.registerReadonlyStatusRoutes(capturingApp as any);

    const gatesResponse = await responses['/api/runtime/gates']();
    expect(gatesResponse.ok).toBe(true);
    expect(gatesResponse.gates).toHaveLength(5);
    const stageCGate = gatesResponse.gates.find((g: any) => g.id === 'stage_c_disabled');
    expect(stageCGate).toBeDefined();
    expect(stageCGate.status).toBe('pass');
    const postGate = gatesResponse.gates.find((g: any) => g.id === 'post_endpoints_blocked');
    expect(postGate).toBeDefined();
    expect(postGate.status).toBe('pass');
  });

  it('blockers should have 4 blocked blockers', async () => {
    const mod = await import('../runtime/readonly-status.js');
    const responses: Record<string, any> = {};
    const capturingApp = { get: (path: string, handler: any) => { responses[path] = handler; } };
    mod.registerReadonlyStatusRoutes(capturingApp as any);

    const blockersResponse = await responses['/api/runtime/blockers']();
    expect(blockersResponse.ok).toBe(true);
    expect(blockersResponse.blockers).toHaveLength(4);
    const stageCBlocker = blockersResponse.blockers.find((b: any) => b.id === 'stage_c_disabled');
    expect(stageCBlocker).toBeDefined();
    expect(stageCBlocker.severity).toBe('critical');
    expect(stageCBlocker.blocked).toBe(true);
  });

  it('all 4 endpoints should be registered under /api/runtime/', async () => {
    const mod = await import('../runtime/readonly-status.js');
    const registeredPaths: string[] = [];
    const capturingApp = { get: (path: string, _handler: any) => { registeredPaths.push(path); } };
    mod.registerReadonlyStatusRoutes(capturingApp as any);

    expect(registeredPaths).toContain('/api/runtime/status');
    expect(registeredPaths).toContain('/api/runtime/readiness');
    expect(registeredPaths).toContain('/api/runtime/gates');
    expect(registeredPaths).toContain('/api/runtime/blockers');
    expect(registeredPaths).toHaveLength(4);
  });
});
