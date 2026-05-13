import type { FastifyInstance } from 'fastify';
import { logBridgeReport } from './report.js';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import { generateComfyGraph } from './engine.js';

const COMFYUI_BASE_DEFAULT = 'http://127.0.0.1:8188';
const COMFYUI_BASE = process.env.COMFYUI_BASE_URL || COMFYUI_BASE_DEFAULT;
const COMFYUI_ENABLED = (process.env.COMFYUI_ENABLED ?? 'true').toLowerCase() === 'true';
const OUTPUT_DIR = process.env.COMFYUI_OUTPUT_DIR || '';

function isLocalRequest(request: any): boolean {
  // Accept only localhost/127.0.0.1/::1 for security
  const ip = (request?.ip || '').toString();
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
}

async function checkComfyOnline(): Promise<boolean> {
  const bases = [COMFYUI_BASE, COMFYUI_BASE_DEFAULT];
  for (const base of bases) {
    try {
      const url = base.endsWith('/') ? base.slice(0, -1) : base;
      // Try common health endpoints
      const endpoints = ['/health', '/healthz', '/api/health', '/ping'];
      for (const ep of endpoints) {
        try {
          const res = await fetch(url + ep, { method: 'GET', timeout: 3000 } as any);
          if (res && res.ok) return true;
        } catch { /* ignore */ }
      }
      // If health endpoints fail, attempt a lightweight fetch to root
      try {
        const res = await fetch(url, { method: 'GET', timeout: 3000 } as any);
        if (res && res.ok) return true;
      } catch { /* ignore */ }
    } catch { /* ignore */ }
  }
  return false;
}

export function registerComfyRoutes(app: FastifyInstance) {
  // Health endpoint (public)
  app.get('/api/comfy/health', async (request: any, reply: any) => {
    if (!COMFYUI_ENABLED) {
      reply.send({ ok: true, online: false, disabled: true });
      // Log report for visibility
      logBridgeReport('ComfyUI health', { online: false, reason: 'disabled' });
      return;
    }
    const online = await checkComfyOnline();
    logBridgeReport('ComfyUI health', { online, base: COMFYUI_BASE });
    reply.send({ ok: true, online });
  });

  // Generate endpoint
  app.post('/api/comfy/generate', async (request: any, reply: any) => {
    if (!COMFYUI_ENABLED) {
      reply.code(503).send({ ok: false, error: 'comfyui_disabled' });
      return;
    }
    if (!isLocalRequest(request)) {
      reply.code(403).send({ ok: false, error: 'forbidden' });
      return;
    }

    const body = request.body || {};
    const prompt = String(body.prompt || '').trim();
    if (!prompt) return reply.code(400).send({ ok: false, error: 'prompt_required' });

    const width = Number(body.width) || 1024;
    const height = Number(body.height) || 1024;
    const steps = Number(body.steps) || 20;
    const seed = Number(body.seed) ?? -1;
    const workflow = String(body.workflow ?? 'default');

    // Build a minimal ComfyUI graph object for txt2img-like flow
    const graphObject2 = {
      version: 1,
      nodes: [
        {
          id: 'node1',
          type: 'txt2img',
          data: {
            prompt,
            negative_prompt: String(body.negativePrompt ?? ''),
            width,
            height,
            steps,
            seed
          }
        }
      ],
      edges: []
    };
    const result = await generateComfyGraph(graphObject2, COMFYUI_BASE, 'aip-comfy-bridge');
    logBridgeReport('ComfyUI generate result', {
      actualComfyUrl: result?.urlUsed ?? (COMFYUI_BASE + '/prompt'),
      requestBody: body,
      method: 'POST',
      responseStatus: result?.status,
      responseText: (result?.text || '').slice(0, 1000),
      stack: (result as any)?.stack ?? ''
    });
    if (result?.ok && result?.prompt_id) {
      reply.send({ ok: true, prompt_id: result.prompt_id });
    } else {
      reply.code(502).send({ ok: false, error: 'comfyui_generate_failed', detail: result?.text || 'unknown' });
    }
  });

  // History endpoint
  app.get('/api/comfy/history/:promptId', async (request: any, reply: any) => {
    if (!isLocalRequest(request)) {
      reply.code(403).send({ ok: false, error: 'forbidden' });
      return;
    }
    const promptId = String(request.params?.promptId || '');
    const images: Array<{ path: string; url?: string }> = [];
    // Local OUTPUT_DIR lookup
    if (OUTPUT_DIR) {
      try {
        const dir = path.resolve(OUTPUT_DIR);
        if (fs.existsSync(dir) && fs.lstatSync(dir).isDirectory()) {
          const files = fs.readdirSync(dir);
          for (const f of files) {
            if (!f) continue;
            if (f.startsWith(promptId)) {
              const full = path.join(dir, f);
              if (fs.statSync(full).isFile()) {
                images.push({ path: full, url: pathToFileURL(full).href });
              }
            }
          }
        }
      } catch { /* ignore local read errors */ }
    }

    // Remote history fetch (best effort)
    try {
      const endpoints = [
        '/api/v1/history/' + promptId,
        '/history/' + promptId,
        '/api/history?prompt_id=' + promptId,
      ];
      for (const ep of endpoints) {
        try {
          const url = (COMFYUI_BASE.endsWith('/') ? COMFYUI_BASE.slice(0, -1) : COMFYUI_BASE) + ep;
          const res = await fetch(url, { method: 'GET' } as any);
          if (res.ok) {
            const json = await res.json();
            const arr = json?.images || json?.history || json?.results || [];
            if (Array.isArray(arr) && arr.length > 0) {
              for (const item of arr) {
                const p = item?.path || item?.file || '';
                const url = item?.url || (p ? pathToFileURL(p).href : undefined);
                if (p) images.push({ path: p, url });
              }
              break;
            }
          }
        } catch { /* ignore and continue */ }
      }
    } catch { /* ignore */ }

    logBridgeReport('ComfyUI history fetch', { promptId, hits: images.length });
    reply.send({ ok: true, prompt_id: promptId, images });
  });
}
