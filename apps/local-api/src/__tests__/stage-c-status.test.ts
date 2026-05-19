import { describe, it, expect, vi } from 'vitest';

describe('Stage C Status Contract', () => {
  it('should export registerStageCStatusRoutes function', async () => {
    const mod = await import('../stage-c/status.js');
    expect(mod.registerStageCStatusRoutes).toBeDefined();
    expect(typeof mod.registerStageCStatusRoutes).toBe('function');
  });
});

describe('Stage C Status Data Contracts', () => {
  async function captureResponses() {
    const mod = await import('../stage-c/status.js');
    const responses: Record<string, any> = {};
    const capturingApp: any = {
      get: (path: string, handler: any) => {
        responses[path] = handler;
      },
    };
    mod.registerStageCStatusRoutes(capturingApp);
    return { responses };
  }

  async function callEndpoint(endpoint: string) {
    const { responses } = await captureResponses();
    const reply = { header: vi.fn().mockReturnThis() };
    const result = await responses[endpoint]({}, reply);
    return { result, reply };
  }

  it('status should have readonly first_slice_shell mode', async () => {
    const { result } = await callEndpoint('/api/stage-c/status');
    expect(result.ok).toBe(true);
    expect(result.readonly).toBe(true);
    expect(result.stageCEnabled).toBe(false);
    expect(result.canEnableStageC).toBe(false);
    expect(result.authorizationState).toBe('GRANTED_FOR_FIRST_SLICE_IMPLEMENTATION_REVIEW');
    expect(result.contractVersion).toBe('v7.39.first-slice');
    expect(result.implementationStatus).toBe('first_slice_shell');
  });

  it('status should have feature flag with default off and not mutable', async () => {
    const { result } = await callEndpoint('/api/stage-c/status');
    expect(result.featureFlag).toBeDefined();
    expect(result.featureFlag.name).toBe('stage_c_enablement');
    expect(result.featureFlag.defaultState).toBe('off');
    expect(result.featureFlag.currentState).toBe('off');
    expect(result.featureFlag.mutableFromUi).toBe(false);
  });

  it('status should have kill switch not executable', async () => {
    const { result } = await callEndpoint('/api/stage-c/status');
    expect(result.killSwitch).toBeDefined();
    expect(result.killSwitch.available).toBe(true);
    expect(result.killSwitch.executableFromUi).toBe(false);
    expect(result.killSwitch.state).toBe('not_triggered');
  });

  it('status should have safety boundary with all forbidden', async () => {
    const { result } = await callEndpoint('/api/stage-c/status');
    expect(result.safetyBoundary).toBeDefined();
    expect(result.safetyBoundary.postRuntimeAllowed).toBe(false);
    expect(result.safetyBoundary.dbWriteAllowed).toBe(false);
    expect(result.safetyBoundary.executorAllowed).toBe(false);
    expect(result.safetyBoundary.externalControlAllowed).toBe(false);
    expect(result.safetyBoundary.connectorActionAllowed).toBe(false);
  });

  it('status should have audit schema defined but no persistent write', async () => {
    const { result } = await callEndpoint('/api/stage-c/status');
    expect(result.audit).toBeDefined();
    expect(result.audit.schemaDefined).toBe(true);
    expect(result.audit.persistentWriteEnabled).toBe(false);
    expect(result.audit.externalUploadEnabled).toBe(false);
  });

  it('status should have allowedMethods and blockedMethods', async () => {
    const { result } = await callEndpoint('/api/stage-c/status');
    expect(result.allowedMethods).toContain('GET');
    expect(result.blockedMethods).toContain('POST');
    expect(result.blockedMethods).toContain('PUT');
    expect(result.blockedMethods).toContain('PATCH');
    expect(result.blockedMethods).toContain('DELETE');
    expect(result.source).toBe('static_first_slice_contract');
  });
});

describe('Stage C Status Security', () => {
  it('no POST routes should be registered', async () => {
    const mod = await import('../stage-c/status.js');
    const postPaths: string[] = [];
    const capturingApp: any = {
      get: () => {},
      post: (path: string, _handler: any) => { postPaths.push(path); },
    };
    mod.registerStageCStatusRoutes(capturingApp);
    expect(postPaths).toHaveLength(0);
  });

  it('status response should not contain secret-like fields', async () => {
    const mod = await import('../stage-c/status.js');
    const responses: Record<string, any> = {};
    const capturingApp: any = {
      get: (path: string, handler: any) => { responses[path] = handler; },
    };
    mod.registerStageCStatusRoutes(capturingApp);
    const reply = { header: vi.fn().mockReturnThis() };
    const result = await responses['/api/stage-c/status']({}, reply);
    const resultStr = JSON.stringify(result);
    expect(resultStr).not.toContain('token');
    expect(resultStr).not.toContain('apiKey');
    expect(resultStr).not.toContain('password');
    expect(resultStr).not.toContain('privateKey');
    expect(resultStr).not.toContain('credential');
  });
});

describe('Stage C Status Headers', () => {
  it('status should set Cache-Control: no-store header', async () => {
    const mod = await import('../stage-c/status.js');
    const responses: Record<string, any> = {};
    const capturingApp: any = {
      get: (path: string, handler: any) => { responses[path] = handler; },
    };
    mod.registerStageCStatusRoutes(capturingApp);
    const reply = { header: vi.fn().mockReturnThis() };
    await responses['/api/stage-c/status']({}, reply);
    expect(reply.header).toHaveBeenCalledWith('Cache-Control', 'no-store');
  });
});
