import type { FastifyInstance, FastifyReply } from 'fastify';
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const HTTP_TIMEOUT_MS = 2500;
const COMMAND_TIMEOUT_MS = 4000;
const CLAUDE_PROXY_URL = process.env.AIP_CLAUDE_PROXY_URL || 'http://127.0.0.1:15721';
const AIP_GATEWAY_URL = process.env.AIP_GATEWAY_URL || 'http://127.0.0.1:15722';
const OLLAMA_URL = process.env.AIP_OLLAMA_URL || 'http://127.0.0.1:11434';
const LEGACY_PROXY_SCRIPT = process.env.AIP_LEGACY_PROXY_SCRIPT || '';
const AIP_GATEWAY_SCRIPT = process.env.AIP_GATEWAY_SCRIPT || '';
const AIP_GATEWAY_STARTER = process.env.AIP_GATEWAY_STARTER || '';

type ProbeResult = {
  ok: boolean;
  statusCode?: number;
  data?: any;
  error?: string;
};

type ProcessProbe = {
  pid: number;
  name: string;
  matchedScript: string;
};

type FileProbe = {
  path: string;
  exists: boolean;
  size: number | null;
  updated_at: string | null;
};

function addReadonlyHeaders(reply: FastifyReply): void {
  reply.header('Cache-Control', 'no-store');
}

async function httpJson(url: string, timeoutMs = HTTP_TIMEOUT_MS): Promise<ProbeResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    const text = await response.text();
    let data: any = text;
    try {
      data = JSON.parse(text);
    } catch {
      // Non-JSON responses are still useful for readonly diagnostics.
    }
    return { ok: response.ok, statusCode: response.status, data };
  } catch (err: any) {
    return { ok: false, error: err?.name === 'AbortError' ? 'timeout' : String(err?.message || err) };
  } finally {
    clearTimeout(timer);
  }
}

async function postJson(url: string, body: any, timeoutMs = HTTP_TIMEOUT_MS): Promise<ProbeResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await response.text();
    let data: any = text;
    try {
      data = JSON.parse(text);
    } catch {
      // Keep raw text for diagnostics.
    }
    return { ok: response.ok, statusCode: response.status, data };
  } catch (err: any) {
    return { ok: false, error: err?.name === 'AbortError' ? 'timeout' : String(err?.message || err) };
  } finally {
    clearTimeout(timer);
  }
}

async function ollamaTags() {
  const probe = await httpJson(`${OLLAMA_URL}/api/tags`);
  const models = Array.isArray(probe.data?.models)
    ? probe.data.models.map((item: any) => ({
        name: item.name || item.model,
        model: item.model || item.name,
        size: item.size ?? null,
        parameter_size: item.details?.parameter_size || '',
        quantization_level: item.details?.quantization_level || '',
      }))
    : [];
  return { ...probe, models };
}

async function processCommandLine(scriptPath: string): Promise<ProcessProbe[]> {
  const scriptName = scriptPath.split(/[\\/]/).pop() || scriptPath;
  try {
    const { stdout } = await execFileAsync(
      'powershell.exe',
      [
        '-NoProfile',
        '-Command',
        `Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -like '*${scriptName}*' } | Select-Object ProcessId,Name,CommandLine | ConvertTo-Json -Depth 3`,
      ],
      { timeout: COMMAND_TIMEOUT_MS, windowsHide: true, maxBuffer: 256 * 1024 }
    );
    if (!stdout.trim()) return [];
    const parsed = JSON.parse(stdout);
    return (Array.isArray(parsed) ? parsed : [parsed]).map((item: any) => ({
      pid: item.ProcessId,
      name: item.Name,
      matchedScript: scriptName,
    }));
  } catch {
    return [];
  }
}

function fileState(path: string): FileProbe {
  try {
    const stat = fs.statSync(path);
    return {
      path,
      exists: true,
      size: stat.size,
      updated_at: stat.mtime.toISOString(),
    };
  } catch {
    return {
      path,
      exists: false,
      size: null,
      updated_at: null,
    };
  }
}

function statusFromProbe(probe: ProbeResult) {
  if (probe.ok) return 'online';
  if (probe.error === 'timeout') return 'timeout';
  return 'offline';
}

export async function buildModelGatewayStatus() {
  const [legacyHealth, sidecarHealth, sidecarModels, sidecarTokens, ollama, legacyProcesses, sidecarProcesses] = await Promise.all([
    httpJson(`${CLAUDE_PROXY_URL}/health`),
    httpJson(`${AIP_GATEWAY_URL}/health`),
    httpJson(`${AIP_GATEWAY_URL}/v1/models`),
    postJson(`${AIP_GATEWAY_URL}/v1/messages/count_tokens`, {
      model: 'ollama-gemma4-e4b',
      messages: [{ role: 'user', content: 'ping' }],
    }),
    ollamaTags(),
    processCommandLine(LEGACY_PROXY_SCRIPT),
    processCommandLine(AIP_GATEWAY_SCRIPT),
  ]);

  const ollamaModels = ollama.models || [];
  const hasE4B = ollamaModels.some((item: any) => String(item.name || item.model || '').toLowerCase() === 'gemma4:e4b');
  const sidecarRoutes = Array.isArray(sidecarHealth.data?.routes) ? sidecarHealth.data.routes : [];

  return {
    ok: true,
    mode: 'readonly',
    contractVersion: 'v7.64.0-P1',
    authRequired: true,
    publicSafe: false,
    capability: 'local_model_readiness_dashboard',
    execution: {
      canStartService: false,
      canStopService: false,
      canRestartService: false,
      canKillProcess: false,
      canSwitchProvider: false,
      canWriteDb: false,
      canRunInference: false,
    },
    updated_at: new Date().toISOString(),
    endpoints: {
      legacyClaudeProxy: {
        name: 'Claude DeepSeek Proxy',
        url: CLAUDE_PROXY_URL,
        status: statusFromProbe(legacyHealth),
        health: legacyHealth.data || null,
        processCount: legacyProcesses.length,
        processes: legacyProcesses,
        script: fileState(LEGACY_PROXY_SCRIPT),
      },
      aipModelGateway: {
        name: 'AIP Model Gateway Sidecar',
        url: AIP_GATEWAY_URL,
        status: statusFromProbe(sidecarHealth),
        health: sidecarHealth.data || null,
        modelListStatus: statusFromProbe(sidecarModels),
        countTokensStatus: statusFromProbe(sidecarTokens),
        countTokensProbeReadonly: true,
        models: Array.isArray(sidecarModels.data?.data) ? sidecarModels.data.data : [],
        processCount: sidecarProcesses.length,
        processes: sidecarProcesses,
        script: fileState(AIP_GATEWAY_SCRIPT),
        starter: fileState(AIP_GATEWAY_STARTER),
      },
      ollama: {
        name: 'Ollama',
        url: OLLAMA_URL,
        status: statusFromProbe(ollama),
        hasE4B,
        models: ollamaModels,
      },
      deepseek: {
        name: 'DeepSeek',
        keyConfiguredForAipGateway: Boolean(process.env.DEEPSEEK_API_KEY),
        status: process.env.DEEPSEEK_API_KEY ? 'configured' : 'key_missing_for_sidecar',
      },
    },
    routePolicy: sidecarRoutes.length
      ? sidecarRoutes
      : [
          { clientModel: 'ollama-gemma4-e4b', provider: 'ollama', targetModel: 'gemma4:e4b' },
          { clientModel: 'claude-sonnet-* / claude-haiku-*', provider: 'deepseek', targetModel: 'deepseek-v4-flash' },
          { clientModel: 'claude-opus-*', provider: 'deepseek', targetModel: 'deepseek-v4-pro' },
        ],
    safety: {
      legacyProxyUntouched: true,
      readonlyApi: true,
      secretRedaction: true,
      notes: [
        'AIP status API only probes local endpoints and files.',
        'Process probes return only PID, process name, and matched script name; raw command lines are not exposed.',
        'It does not start, stop, or replace the current Claude proxy.',
        'DeepSeek API keys are never returned by this endpoint.',
      ],
    },
  };
}

export function registerModelGatewayRoutes(app: FastifyInstance) {
  app.get('/api/model-gateway/status', async (_request, reply) => {
    addReadonlyHeaders(reply);
    return buildModelGatewayStatus();
  });
}
