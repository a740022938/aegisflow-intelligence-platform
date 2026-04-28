import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import * as runs from '../runs/index.js';
import { getDatabase } from '../db/builtin-sqlite.js';
import {
  createWorkflowJob,
  runWorkflowJob,
  getWorkflowJobById,
  getJobFailureReport,
} from '../workflow/index.js';

const routeSchema = z.object({
  prompt: z.string().min(1, 'prompt is required'),
  task_type: z.string().default('general'),
  risk_level: z.enum(['low', 'medium', 'high']).default('low'),
  tool_required: z.boolean().default(false),
  handoff_to_openclaw: z.boolean().optional(),
  confidence_threshold: z.number().min(0).max(1).default(0.72),
});

const produceSchema = z.object({
  intent_type: z.enum(['dataset_pipeline', 'train_eval_archive', 'full_production']),
  source_path: z.string().optional(),
  dataset_id: z.string().optional(),
  experiment_id: z.string().optional(),
  template_version: z.string().default('v1'),
  model_id: z.string().default('auto_from_train_output'),
  risk_level: z.enum(['low', 'medium', 'high']).default('low'),
  approved: z.boolean().default(false),
  dry_run_first: z.boolean().default(true),
  auto_retry_once: z.boolean().default(true),
});

function nowIso() {
  return new Date().toISOString();
}

function writeAudit(action: string, target: string, result: 'success' | 'failed' | 'partial', detail: Record<string, any>) {
  try {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at)
      VALUES (?, 'brain_router', ?, ?, ?, ?, ?)
    `).run(crypto.randomUUID(), action, target, result, JSON.stringify(detail || {}), nowIso());
  } catch (err) {
    console.error('[brain-router] Audit write failed:', err?.message);
  }
}

function enforceWriteGuard(sourcePath?: string) {
  if (!sourcePath) return { ok: true as const };
  const workspaceRoot = (process.env.AIP_WORKSPACE_ROOT || process.env.AIP_REPO_ROOT || '').replace(/\\/g, '/').toLowerCase();
  const normalized = sourcePath.replace(/\\/g, '/').toLowerCase();
  if (workspaceRoot && !normalized.startsWith(workspaceRoot)) {
    return { ok: false as const, error: 'source_path not allowed by production write guard' };
  }
  return { ok: true as const };
}

function buildDatasetPipeline(input: z.infer<typeof produceSchema>) {
  const dataRoot = process.env.AGI_FACTORY_ROOT || process.env.AIP_REPO_ROOT || '';
  const sourcePath = String(input.source_path || (dataRoot ? `${dataRoot}/outputs/test_video.mp4` : '/data/outputs/test_video.mp4'));
  const datasetId = String(input.dataset_id || `auto_ds_${Date.now()}`);
  const experimentId = String(input.experiment_id || `auto_exp_${Date.now()}`);
  return {
    name: `BrainProduce:dataset:${datasetId}`,
    steps: [
      { step_order: 1, step_key: 'video_source', params: { source_path: sourcePath, source_type: 'video' } },
      { step_order: 2, step_key: 'frame_extract', params: { sample_fps: 1 } },
      { step_order: 3, step_key: 'frame_clean', params: { dedup_threshold: 0.95 } },
      { step_order: 4, step_key: 'dataset_register', params: { dataset_name: datasetId } },
      { step_order: 5, step_key: 'dataset_split', params: { train_ratio: 0.8, val_ratio: 0.1, test_ratio: 0.1 } },
    ],
    input: {
      source_path: sourcePath,
      dataset_id: datasetId,
      experiment_id: experimentId,
      template_version: input.template_version,
    },
  };
}

function buildTrainEvalPipeline(input: z.infer<typeof produceSchema>) {
  const datasetId = String(input.dataset_id || 'acc1_ds');
  const experimentId = String(input.experiment_id || `auto_train_exp_${Date.now()}`);
  return {
    name: `BrainProduce:train:${experimentId}`,
    steps: [
      {
        step_order: 1,
        step_key: 'train_model',
        params: {
          model: 'yolov8n.pt',
          imgsz: 640,
          epochs: 1,
          batch: 4,
          model_variant: 'yolov8n',
          experiment_id: experimentId,
          dataset_id: datasetId,
          template_version: input.template_version,
          model_id: input.model_id,
        },
      },
      {
        step_order: 2,
        step_key: 'evaluate_model',
        params: {
          experiment_id: experimentId,
          dataset_id: datasetId,
          model_id: input.model_id,
          evaluation_type: 'classification',
        },
      },
      { step_order: 3, step_key: 'archive_model', params: { model_id: input.model_id, artifact_name: 'brain_produce_archive' } },
    ],
    input: {
      experiment_id: experimentId,
      dataset_id: datasetId,
      template_version: input.template_version,
      model_id: input.model_id,
      task_type: 'vision_detect',
      model_family: 'yolo',
    },
  };
}

async function callDryRun(payload: { steps: any[]; input: Record<string, any> }) {
  try {
    const base = process.env.LOCAL_API_BASE || 'http://127.0.0.1:8787';
    const resp = await fetch(`${base}/api/workflow-templates/dry-run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        execution_mode: 'dry-run',
        payload: { steps: payload.steps, input: payload.input },
      }),
    });
    const data = await resp.json() as any;
    return { ok: !!data?.ok, data };
  } catch (err: any) {
    return { ok: false, data: { ok: false, error: String(err?.message || err) } };
  }
}

async function executeWorkflow(payload: { name: string; steps: any[]; input: Record<string, any> }, autoRetryOnce: boolean) {
  const created = createWorkflowJob({
    name: payload.name,
    steps: payload.steps,
    input: payload.input,
  });
  if (!created?.ok || !created?.job?.id) {
    return { ok: false, error: created?.error || 'create_workflow_job_failed' };
  }
  const jobId = String(created.job.id);
  await runWorkflowJob(jobId);
  let current = getWorkflowJobById(jobId);
  if (!current.ok || !current.job) return { ok: false, error: current.error || 'workflow_job_not_found' };
  if (current.job.status === 'completed') return { ok: true, job: current.job, job_id: jobId, retried: false };

  if (autoRetryOnce && current.job.status === 'failed') {
    const report = getJobFailureReport(jobId);
    writeAudit('brain_produce_retry_once', jobId, 'partial', { report });
    await runWorkflowJob(jobId);
    current = getWorkflowJobById(jobId);
    if (!current.ok || !current.job) return { ok: false, error: current.error || 'workflow_job_not_found_after_retry' };
    return { ok: current.job.status === 'completed', job: current.job, job_id: jobId, retried: true };
  }
  return { ok: false, job: current.job, job_id: jobId, retried: false };
}

function summarizeJob(job: any) {
  const refs = job?.output_summary_json?.envelope_summary?.refs || {};
  const stepEnvelopes = job?.output_summary_json?.step_envelopes || [];
  const evalStep = stepEnvelopes.find((s: any) => s?.step_key === 'evaluate_model');
  return {
    job_id: job?.id,
    status: job?.status,
    dataset_id: refs.dataset_id || '',
    model_id: refs.model_id || '',
    metrics: evalStep?.output?.metrics || {},
  };
}

async function dispatchToOpenClaw(input: z.infer<typeof routeSchema>, reason: string) {
  const runResult = runs.createRun({
    name: `BrainRoute:${input.task_type}`,
    source_type: 'manual',
    trigger_mode: 'api',
    executor_type: 'openclaw',
    priority: 5,
    config_json: {
      allow_write: false,
      actions: [
        {
          type: 'auto_intent',
          intent: input.prompt,
          route_from: 'brain_router',
          route_reason: reason,
        },
      ],
      brain_router: {
        task_type: input.task_type,
        risk_level: input.risk_level,
        tool_required: input.tool_required,
      },
    },
  });

  if (!runResult?.ok || !runResult.run?.id) {
    return {
      ok: false,
      error: runResult?.error || 'failed_to_create_openclaw_run',
    };
  }

  const runId = String(runResult.run.id);
  const startResult = await runs.startRun(runId);
  return {
    ok: true,
    run_id: runId,
    run_code: runResult.run.run_code,
    start: startResult,
  };
}

export function registerBrainRouterRoutes(app: FastifyInstance) {
  app.post('/api/ai/brain/route', async (request: any, reply: any) => {
    const result: any = await routeBrainRequest(request.body ?? {});
    if (!result.ok && result.error === 'invalid_request') {
      reply.code(400);
      return result;
    }
    if (!result.ok) {
      reply.code(500);
      return result;
    }
    return result;
  });

  app.post('/api/ai/brain/produce', async (request: any, reply: any) => {
    const parsed = produceSchema.safeParse(request.body ?? {});
    if (!parsed.success) return reply.code(400).send({ ok: false, error: 'invalid_request', details: parsed.error.flatten() });

    const input = parsed.data;
    if (input.risk_level === 'high' && !input.approved) {
      return reply.code(403).send({ ok: false, error: 'approval_required_for_high_risk', message: 'Set approved=true for high-risk production actions.' });
    }
    const guard = enforceWriteGuard(input.source_path);
    if (!guard.ok) return reply.code(403).send({ ok: false, error: guard.error });

    const datasetPayload = buildDatasetPipeline(input);
    const trainPayload = buildTrainEvalPipeline({
      ...input,
      dataset_id: input.dataset_id || datasetPayload.input.dataset_id,
      experiment_id: input.experiment_id || datasetPayload.input.experiment_id,
    });

    const executeOne = async (payload: { name: string; steps: any[]; input: Record<string, any> }) => {
      const dryRun = input.dry_run_first ? await callDryRun(payload) : { ok: true, data: { ok: true } };
      if (!dryRun.ok) {
        return { ok: false, stage: 'dry_run', error: dryRun.data?.error || 'dry_run_failed', dry_run: dryRun.data };
      }
      const realRun = await executeWorkflow(payload, input.auto_retry_once);
      if (!realRun.ok) {
        return {
          ok: false,
          stage: 'real_run',
          error: 'workflow_execution_failed',
          workflow_job_id: realRun.job_id || '',
          summary: realRun.job ? summarizeJob(realRun.job) : undefined,
        };
      }
      return {
        ok: true,
        workflow_job_id: realRun.job_id,
        retried: realRun.retried,
        summary: summarizeJob(realRun.job),
      };
    };

    if (input.intent_type === 'dataset_pipeline') {
      const one = await executeOne(datasetPayload);
      const result = { ok: !!one.ok, intent_type: input.intent_type, result: one };
      writeAudit('brain_produce_dataset_pipeline', String(one.workflow_job_id || ''), one.ok ? 'success' : 'failed', result);
      return result;
    }
    if (input.intent_type === 'train_eval_archive') {
      const one = await executeOne(trainPayload);
      const result = { ok: !!one.ok, intent_type: input.intent_type, result: one };
      writeAudit('brain_produce_train_eval_archive', String(one.workflow_job_id || ''), one.ok ? 'success' : 'failed', result);
      return result;
    }

    const first = await executeOne(datasetPayload);
    if (!first.ok) {
      const result = { ok: false, intent_type: input.intent_type, stage: 'dataset_pipeline', result: first };
      writeAudit('brain_produce_full_production', String(first.workflow_job_id || ''), 'failed', result);
      return result;
    }
    const secondInput = {
      ...input,
      dataset_id: first.summary?.dataset_id || trainPayload.input.dataset_id,
      experiment_id: trainPayload.input.experiment_id,
    };
    const secondPayload = buildTrainEvalPipeline(secondInput);
    const second = await executeOne(secondPayload);
    const combined = {
      ok: !!second.ok,
      intent_type: input.intent_type,
      dataset_stage: first,
      train_stage: second,
      final: second.ok ? second.summary : {},
    };
    writeAudit('brain_produce_full_production', String(second.workflow_job_id || ''), second.ok ? 'success' : 'failed', combined);
    return combined;
  });
}

async function routeBrainRequest(input: any) {
  const parsed = routeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'invalid_request',
      details: parsed.error.flatten(),
    };
  }

  const startedAt = Date.now();

  // P0-D: 添加 degraded 降级逻辑
  // 如果 OpenClaw 调用失败（超时或错误），进入 degraded 模式，不阻塞主链
  let resp: any;
  try {
    resp = await Promise.race([
      dispatchToOpenClaw(input, 'default_route'),
      new Promise<any>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
    ]);
  } catch (err: any) {
    // Degraded mode: 本地模型/OpenClaw 不可用，返回 degraded 而不是硬失败
    const degradedResult = {
      ok: true,
      mode: 'degraded',
      brain_used: 'none',
      route_reason: 'local_unavailable',
      degraded: true,
      degraded_reason: err.message || 'openclaw_timeout_or_error',
      message: '本地执行层不可用，已降级处理。主链不阻塞。',
      latency_ms: Date.now() - startedAt,
    };
    writeAudit('brain_route_degraded', 'brain_router', 'partial', degradedResult);
    return degradedResult;
  }

  if (!resp.ok) {
    writeAudit('brain_route_failed', 'brain_router', 'failed', {
      error: resp.error,
    });
    return {
      ok: false,
      error: resp.error || 'openclaw_failed',
    };
  }

  const result = {
    ok: true,
    brain_used: 'openclaw',
    route_reason: 'default_to_openclaw',
    escalated: false,
    latency_ms: Date.now() - startedAt,
    run_id: resp.run_id,
    run_code: resp.run_code,
  };
  writeAudit('brain_route', String(resp.run_id || ''), 'success', result);
  return result;
}
