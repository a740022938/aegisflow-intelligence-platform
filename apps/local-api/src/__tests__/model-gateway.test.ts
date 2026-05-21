import { describe, it, expect, vi } from 'vitest';

describe('ModelGateway readonly status contract', () => {
  async function captureResponses() {
    const mod = await import('../model-gateway/index.js');
    const responses: Record<string, any> = {};
    const postPaths: string[] = [];
    const capturingApp: any = {
      get: (path: string, handler: any) => { responses[path] = handler; },
      post: (path: string) => { postPaths.push(path); },
    };
    mod.registerModelGatewayRoutes(capturingApp);
    return { responses, postPaths };
  }

  it('registers only the readonly GET status endpoint', async () => {
    const { responses, postPaths } = await captureResponses();
    expect(responses).toHaveProperty('/api/model-gateway/status');
    expect(Object.keys(responses)).toHaveLength(1);
    expect(postPaths).toHaveLength(0);
  });

  it('sets no-store cache headers', async () => {
    const { responses } = await captureResponses();
    const reply = { header: vi.fn().mockReturnThis() };
    await responses['/api/model-gateway/status']({}, reply);
    expect(reply.header).toHaveBeenCalledWith('Cache-Control', 'no-store');
  });

  it('does not expose raw secrets or command lines', async () => {
    const mod = await import('../model-gateway/index.js');
    const result = await mod.buildModelGatewayStatus();
    const resultStr = JSON.stringify(result).toLowerCase();
    expect(result.execution.canStartService).toBe(false);
    expect(result.execution.canKillProcess).toBe(false);
    expect(result.authRequired).toBe(true);
    expect(result.publicSafe).toBe(false);
    expect(resultStr).not.toContain('commandline');
    expect(resultStr).not.toContain('deepseek_api_key');
    expect(resultStr).not.toContain('authorization');
    expect(resultStr).not.toContain('password');
    expect(resultStr).not.toContain('privatekey');
    expect(resultStr).not.toMatch(/sk-[a-z0-9_-]{8,}/i);
  });
});
