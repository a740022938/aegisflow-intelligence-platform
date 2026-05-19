import { describe, it, expect, vi } from 'vitest';

describe('Runtime Readonly Status Contract', () => {
  it('should export registerReadonlyStatusRoutes function', async () => {
    const mod = await import('../runtime/readonly-status.js');
    expect(mod.registerReadonlyStatusRoutes).toBeDefined();
    expect(typeof mod.registerReadonlyStatusRoutes).toBe('function');
  });
});

describe('Runtime Readonly Status Data Contracts', () => {
  async function captureResponses() {
    const mod = await import('../runtime/readonly-status.js');
    const responses: Record<string, any> = {};
    const headers: Record<string, Record<string, string>> = {};
    const capturingApp: any = {
      get: (path: string, handler: any) => {
        responses[path] = handler;
      },
    };
    mod.registerReadonlyStatusRoutes(capturingApp);
    return { responses };
  }

  async function callEndpoint(endpoint: string) {
    const { responses } = await captureResponses();
    const reply = {
      header: vi.fn().mockReturnThis(),
    };
    const result = await responses[endpoint]({}, reply);
    return { result, reply };
  }

  it('status should have readonly_skeleton mode', async () => {
    const { result } = await callEndpoint('/api/runtime/status');
    expect(result.ok).toBe(true);
    expect(result.mode).toBe('readonly_skeleton');
    expect(result.implementationStatus).toBe('skeleton');
    expect(result.runtimeImplemented).toBe(false);
    expect(result.stageCEnabled).toBe(false);
    expect(result.dbWriteEnabled).toBe(false);
    expect(result.externalControlEnabled).toBe(false);
    expect(result.postEndpointsEnabled).toBe(false);
    expect(result.readonly).toBe(true);
    expect(result.contractVersion).toBe('v7.31.0-P1');
    expect(result.version).toBe('v7.31.0-P1');
  });

  it('status should have allowedMethods and blockedMethods', async () => {
    const { result } = await callEndpoint('/api/runtime/status');
    expect(result.allowedMethods).toContain('GET');
    expect(result.blockedMethods).toContain('POST');
    expect(result.blockedMethods).toContain('PUT');
    expect(result.blockedMethods).toContain('PATCH');
    expect(result.blockedMethods).toContain('DELETE');
    expect(result.source).toBe('static_contract_summary');
  });

  it('readiness should have readonly_skeleton_ready and canExecuteRuntime=false', async () => {
    const { result } = await callEndpoint('/api/runtime/readiness');
    expect(result.ok).toBe(true);
    expect(result.readiness).toBe('readonly_skeleton_ready');
    expect(result.readonly).toBe(true);
    expect(result.contractVersion).toBe('v7.31.0-P1');
    expect(result.canExecuteRuntime).toBe(false);
    expect(result.canWriteDb).toBe(false);
    expect(result.canControlExternalTools).toBe(false);
    expect(result.canEnableStageC).toBe(false);
    expect(result.blockedCapabilities).toContain('db_write');
    expect(result.blockedCapabilities).toContain('stage_c_enable');
    expect(result.blockedCapabilities).toContain('external_control');
    expect(result.blockedCapabilities).toContain('post_runtime_execute');
  });

  it('gates should have all pass with stage_c_disabled', async () => {
    const { result } = await callEndpoint('/api/runtime/gates');
    expect(result.ok).toBe(true);
    expect(result.readonly).toBe(true);
    expect(result.contractVersion).toBe('v7.31.0-P1');
    expect(result.gates.length).toBeGreaterThanOrEqual(5);
    const stageCGate = result.gates.find((g: any) => g.id === 'stage_c_disabled');
    expect(stageCGate).toBeDefined();
    expect(stageCGate.status).toBe('pass');
    const postGate = result.gates.find((g: any) => g.id === 'no_post');
    expect(postGate).toBeDefined();
    expect(postGate.status).toBe('pass');
    const getGate = result.gates.find((g: any) => g.id === 'get_only');
    expect(getGate).toBeDefined();
    expect(getGate.status).toBe('pass');
    const noDbGate = result.gates.find((g: any) => g.id === 'no_db_write');
    expect(noDbGate).toBeDefined();
    expect(noDbGate.status).toBe('pass');
  });

  it('blockers should have 4 blocked blockers', async () => {
    const { result } = await callEndpoint('/api/runtime/blockers');
    expect(result.ok).toBe(true);
    expect(result.readonly).toBe(true);
    expect(result.contractVersion).toBe('v7.31.0-P1');
    expect(result.blockers).toHaveLength(4);
    const stageCBlocker = result.blockers.find((b: any) => b.id === 'stage_c_disabled');
    expect(stageCBlocker).toBeDefined();
    expect(stageCBlocker.severity).toBe('critical');
    expect(stageCBlocker.blocked).toBe(true);
  });

  it('all 4 endpoints should be registered under /api/runtime/', async () => {
    const { responses } = await captureResponses();
    expect(responses).toHaveProperty('/api/runtime/status');
    expect(responses).toHaveProperty('/api/runtime/readiness');
    expect(responses).toHaveProperty('/api/runtime/gates');
    expect(responses).toHaveProperty('/api/runtime/blockers');
    expect(Object.keys(responses)).toHaveLength(4);
  });
});

describe('Runtime Readonly Status Security', () => {
  it('no POST routes should be registered', async () => {
    const mod = await import('../runtime/readonly-status.js');
    const postPaths: string[] = [];
    const capturingApp: any = {
      get: () => {},
      post: (path: string, _handler: any) => { postPaths.push(path); },
    };
    mod.registerReadonlyStatusRoutes(capturingApp);
    expect(postPaths).toHaveLength(0);
  });

  it('status response should not contain secret-like fields', async () => {
    const mod = await import('../runtime/readonly-status.js');
    const responses: Record<string, any> = {};
    const capturingApp: any = {
      get: (path: string, handler: any) => { responses[path] = handler; },
    };
    mod.registerReadonlyStatusRoutes(capturingApp);
    const reply = { header: vi.fn().mockReturnThis() };
    const result = await responses['/api/runtime/status']({}, reply);
    const resultStr = JSON.stringify(result);
    expect(resultStr).not.toContain('token');
    expect(resultStr).not.toContain('apiKey');
    expect(resultStr).not.toContain('password');
    expect(resultStr).not.toContain('privateKey');
    expect(resultStr).not.toContain('credential');
  });

  it('readiness response should not contain secret-like fields', async () => {
    const mod = await import('../runtime/readonly-status.js');
    const responses: Record<string, any> = {};
    const capturingApp: any = {
      get: (path: string, handler: any) => { responses[path] = handler; },
    };
    mod.registerReadonlyStatusRoutes(capturingApp);
    const reply = { header: vi.fn().mockReturnThis() };
    const result = await responses['/api/runtime/readiness']({}, reply);
    const resultStr = JSON.stringify(result);
    expect(resultStr).not.toContain('token');
    expect(resultStr).not.toContain('apiKey');
    expect(resultStr).not.toContain('password');
    expect(resultStr).not.toContain('privateKey');
    expect(resultStr).not.toContain('credential');
  });

  it('gates response should not contain secret-like fields', async () => {
    const mod = await import('../runtime/readonly-status.js');
    const responses: Record<string, any> = {};
    const capturingApp: any = {
      get: (path: string, handler: any) => { responses[path] = handler; },
    };
    mod.registerReadonlyStatusRoutes(capturingApp);
    const reply = { header: vi.fn().mockReturnThis() };
    const result = await responses['/api/runtime/gates']({}, reply);
    const resultStr = JSON.stringify(result);
    expect(resultStr).not.toContain('token');
    expect(resultStr).not.toContain('apiKey');
    expect(resultStr).not.toContain('password');
    expect(resultStr).not.toContain('privateKey');
    expect(resultStr).not.toContain('credential');
  });

  it('blockers response should not contain secret-like fields', async () => {
    const mod = await import('../runtime/readonly-status.js');
    const responses: Record<string, any> = {};
    const capturingApp: any = {
      get: (path: string, handler: any) => { responses[path] = handler; },
    };
    mod.registerReadonlyStatusRoutes(capturingApp);
    const reply = { header: vi.fn().mockReturnThis() };
    const result = await responses['/api/runtime/blockers']({}, reply);
    const resultStr = JSON.stringify(result);
    expect(resultStr).not.toContain('token');
    expect(resultStr).not.toContain('apiKey');
    expect(resultStr).not.toContain('password');
    expect(resultStr).not.toContain('privateKey');
    expect(resultStr).not.toContain('credential');
  });
});

describe('Runtime Readonly Status Headers', () => {
  it('status should set Cache-Control: no-store header', async () => {
    const mod = await import('../runtime/readonly-status.js');
    const responses: Record<string, any> = {};
    const capturingApp: any = {
      get: (path: string, handler: any) => { responses[path] = handler; },
    };
    mod.registerReadonlyStatusRoutes(capturingApp);
    const reply = { header: vi.fn().mockReturnThis() };
    await responses['/api/runtime/status']({}, reply);
    expect(reply.header).toHaveBeenCalledWith('Cache-Control', 'no-store');
  });

  it('readiness should set Cache-Control: no-store header', async () => {
    const mod = await import('../runtime/readonly-status.js');
    const responses: Record<string, any> = {};
    const capturingApp: any = {
      get: (path: string, handler: any) => { responses[path] = handler; },
    };
    mod.registerReadonlyStatusRoutes(capturingApp);
    const reply = { header: vi.fn().mockReturnThis() };
    await responses['/api/runtime/readiness']({}, reply);
    expect(reply.header).toHaveBeenCalledWith('Cache-Control', 'no-store');
  });

  it('gates should set Cache-Control: no-store header', async () => {
    const mod = await import('../runtime/readonly-status.js');
    const responses: Record<string, any> = {};
    const capturingApp: any = {
      get: (path: string, handler: any) => { responses[path] = handler; },
    };
    mod.registerReadonlyStatusRoutes(capturingApp);
    const reply = { header: vi.fn().mockReturnThis() };
    await responses['/api/runtime/gates']({}, reply);
    expect(reply.header).toHaveBeenCalledWith('Cache-Control', 'no-store');
  });

  it('blockers should set Cache-Control: no-store header', async () => {
    const mod = await import('../runtime/readonly-status.js');
    const responses: Record<string, any> = {};
    const capturingApp: any = {
      get: (path: string, handler: any) => { responses[path] = handler; },
    };
    mod.registerReadonlyStatusRoutes(capturingApp);
    const reply = { header: vi.fn().mockReturnThis() };
    await responses['/api/runtime/blockers']({}, reply);
    expect(reply.header).toHaveBeenCalledWith('Cache-Control', 'no-store');
  });
});
