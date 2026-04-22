import { z } from 'zod';
import { getDatabase } from '../db/builtin-sqlite.js';

function generateId() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

function parseJsonField(val: string | undefined | null, fieldName: string) {
  if (!val) return {};
  try {
    return JSON.parse(val);
  } catch {
    return {};
  }
}

// ═══ F5: Sample Task Management ═════════════════════════════════════════════

const createSampleTaskSchema = z.object({
  name: z.string().min(1, 'name is required'),
  dataset_version_id: z.string().optional(),
  training_config: z.any().optional(),
  eval_config: z.any().optional(),
  promote_gate: z.any().optional(),
});

// In-memory store for sample tasks (simplified for F5)
const sampleTasks = new Map<string, any>();

// ── Create Sample Task ──────────────────────────────────────────────────────
export async function createSampleTask(body: any) {
  const db = getDatabase();
  const validation = createSampleTaskSchema.safeParse(body);
  if (!validation.success) {
    return { ok: false, error: validation.error.message };
  }
  const data = validation.data;
  const id = generateId();

  // Get or use existing dataset_version
  let datasetVersionId = data.dataset_version_id;
  if (!datasetVersionId) {
    // Use the F2 test dataset version
    const dv = db.prepare("SELECT id FROM dataset_versions WHERE version = 'v1_f2_test_001' LIMIT 1").get() as any;
    if (dv) datasetVersionId = dv.id;
  }

  if (!datasetVersionId) {
    return { ok: false, error: 'No dataset_version found or provided' };
  }

  const datasetVersion = db.prepare('SELECT * FROM dataset_versions WHERE id = ?').get(datasetVersionId) as any;
  if (!datasetVersion) {
    return { ok: false, error: `Dataset version not found: ${datasetVersionId}` };
  }

  // Create sample task record
  const sampleTask = {
    id,
    name: data.name,
    created_at: now(),
    updated_at: now(),
    stages: {
      dataset_version: {
        id: datasetVersionId,
        name: datasetVersion.version,
        status: datasetVersion.governance_status,
        ready: datasetVersion.governance_status === 'approved',
      },
      training_run: { id: null, name: null, status: 'waiting', ready: false },
      artifact: { id: null, name: null, status: 'waiting', ready: false },
      evaluation: { id: null, name: null, status: 'waiting', ready: false },
      model: { id: null, name: null, status: 'waiting', ready: false },
    },
    lineage: {
      dataset_version_id: datasetVersionId,
      training_run_id: null,
      artifact_id: null,
      evaluation_id: null,
      model_id: null,
    },
    config: {
      training: data.training_config || {},
      eval: data.eval_config || {},
      promote_gate: data.promote_gate || {},
    },
  };

  sampleTasks.set(id, sampleTask);

  return {
    ok: true,
    sample_task: sampleTask,
  };
}

// ── Get Sample Task ─────────────────────────────────────────────────────────
export async function getSampleTask(id: string) {
  const db = getDatabase();
  const sampleTask = sampleTasks.get(id);
  if (!sampleTask) {
    return { ok: false, error: `Sample task not found: ${id}` };
  }

  // Enrich with actual data from database
  const enriched = await enrichSampleTask(db, sampleTask);

  return {
    ok: true,
    sample_task: enriched,
  };
}

// ── Enrich Sample Task with Database Data ───────────────────────────────────
async function enrichSampleTask(db: any, sampleTask: any) {
  const { lineage, stages } = sampleTask;

  // 1. Dataset Version (already have)
  if (lineage.dataset_version_id && !stages.dataset_version.ready) {
    const dv = db.prepare('SELECT * FROM dataset_versions WHERE id = ?').get(lineage.dataset_version_id) as any;
    if (dv) {
      stages.dataset_version = {
        id: dv.id,
        name: dv.version,
        status: dv.governance_status,
        ready: dv.governance_status === 'approved',
      };
    }
  }

  // 2. Training Run - look for runs with this dataset_version_id
  if (lineage.dataset_version_id) {
    const run = db.prepare('SELECT * FROM runs WHERE dataset_version_id = ? ORDER BY created_at DESC LIMIT 1').get(lineage.dataset_version_id) as any;
    if (run) {
      lineage.training_run_id = run.id;
      stages.training_run = {
        id: run.id,
        name: run.name,
        status: run.status,
        execution_mode: run.execution_mode,
        metrics: parseJsonField(run.summary_json, 'summary_json').best_mAP50 ? { best_mAP50: parseJsonField(run.summary_json, 'summary_json').best_mAP50 } : {},
        ready: run.status === 'success',
      };
    }
  }

  // 3. Artifact - look for artifacts linked to training_run
  if (lineage.training_run_id) {
    const artifact = db.prepare('SELECT * FROM artifacts WHERE training_job_id = ? ORDER BY created_at DESC LIMIT 1').get(lineage.training_run_id) as any;
    if (artifact) {
      lineage.artifact_id = artifact.id;
      stages.artifact = {
        id: artifact.id,
        name: artifact.name,
        status: 'ready',
        path: artifact.path,
        ready: true,
      };
    }
  }

  // 4. Evaluation - look for evaluations with this artifact_id
  if (lineage.artifact_id) {
    const evaluation = db.prepare('SELECT * FROM evaluations WHERE artifact_id = ? ORDER BY created_at DESC LIMIT 1').get(lineage.artifact_id) as any;
    if (evaluation) {
      lineage.evaluation_id = evaluation.id;
      const report = parseJsonField(evaluation.evaluation_report_json, 'evaluation_report_json');
      stages.evaluation = {
        id: evaluation.id,
        name: evaluation.name,
        status: evaluation.status,
        metrics: report.summary || {},
        promote_gate: {
          status: evaluation.promote_gate_status,
          checks: parseJsonField(evaluation.promote_gate_checks_json, 'promote_gate_checks_json'),
        },
        ready: evaluation.status === 'completed',
      };
    }
  }

  // 5. Model - look for models with this evaluation_id
  if (lineage.evaluation_id) {
    const model = db.prepare('SELECT * FROM models WHERE latest_evaluation_id = ? ORDER BY created_at DESC LIMIT 1').get(lineage.evaluation_id) as any;
    if (model) {
      lineage.model_id = model.model_id;
      stages.model = {
        id: model.model_id,
        name: model.name,
        status: model.promotion_status || 'draft',
        ready: true,
      };
    }
  }

  // Calculate overall status
  const stageList = Object.values(stages);
  const completedStages = stageList.filter((s: any) => s.ready).length;
  const totalStages = stageList.length;

  let overallStatus = 'pending';
  if (completedStages === totalStages) {
    overallStatus = 'completed';
  } else if (completedStages > 0) {
    overallStatus = 'running';
  }

  return {
    ...sampleTask,
    stages,
    lineage,
    overall_status: overallStatus,
    completed_stages: completedStages,
    total_stages: totalStages,
  };
}

// ── List Sample Tasks ───────────────────────────────────────────────────────
export async function listSampleTasks() {
  const tasks = Array.from(sampleTasks.values()).map(st => ({
    id: st.id,
    name: st.name,
    created_at: st.created_at,
    overall_status: 'unknown', // Would need enrichment
  }));

  return {
    ok: true,
    sample_tasks: tasks,
    total: tasks.length,
  };
}

// ═══ F5: Lineage Query ══════════════════════════════════════════════════════

export async function getLineage(modelId: string) {
  const db = getDatabase();

  // Get model
  const model = db.prepare('SELECT * FROM models WHERE model_id = ?').get(modelId) as any;
  if (!model) {
    return { ok: false, error: `Model not found: ${modelId}` };
  }

  // Get evaluation
  let evaluation: any = null;
  if (model.latest_evaluation_id) {
    evaluation = db.prepare('SELECT * FROM evaluations WHERE id = ?').get(model.latest_evaluation_id) as any;
  }

  // Get artifact
  let artifact: any = null;
  if (evaluation?.artifact_id) {
    artifact = db.prepare('SELECT * FROM artifacts WHERE id = ?').get(evaluation.artifact_id) as any;
  } else if (model.source_artifact_id) {
    artifact = db.prepare('SELECT * FROM artifacts WHERE id = ?').get(model.source_artifact_id) as any;
  }

  // Get training run
  let trainingRun: any = null;
  if (artifact?.training_job_id) {
    trainingRun = db.prepare('SELECT * FROM runs WHERE id = ?').get(artifact.training_job_id) as any;
  }

  // Get dataset_version
  let datasetVersion: any = null;
  if (trainingRun?.dataset_version_id) {
    datasetVersion = db.prepare('SELECT * FROM dataset_versions WHERE id = ?').get(trainingRun.dataset_version_id) as any;
  } else if (evaluation?.dataset_version_id) {
    datasetVersion = db.prepare('SELECT * FROM dataset_versions WHERE id = ?').get(evaluation.dataset_version_id) as any;
  }

  // Build chain
  const chain: any[] = [];
  if (datasetVersion) {
    chain.push({ type: 'dataset_version', id: datasetVersion.id, name: datasetVersion.version });
  }
  if (trainingRun) {
    chain.push({ type: 'training_run', id: trainingRun.id, name: trainingRun.name });
  }
  if (artifact) {
    chain.push({ type: 'artifact', id: artifact.id, name: artifact.name });
  }
  if (evaluation) {
    chain.push({ type: 'evaluation', id: evaluation.id, name: evaluation.name });
  }
  chain.push({ type: 'model', id: model.model_id, name: model.name });

  return {
    ok: true,
    lineage: {
      model: model ? {
        id: model.model_id,
        name: model.name,
        promotion_status: model.promotion_status || 'draft',
        created_at: model.created_at,
      } : null,
      evaluation: evaluation ? {
        id: evaluation.id,
        name: evaluation.name,
        metrics: parseJsonField(evaluation.evaluation_report_json, 'evaluation_report_json').summary || {},
        promote_gate: {
          status: evaluation.promote_gate_status,
          checks: parseJsonField(evaluation.promote_gate_checks_json, 'promote_gate_checks_json'),
        },
      } : null,
      artifact: artifact ? {
        id: artifact.id,
        name: artifact.name,
        path: artifact.path,
      } : null,
      training_run: trainingRun ? {
        id: trainingRun.id,
        name: trainingRun.name,
        execution_mode: trainingRun.execution_mode,
        epochs: parseJsonField(trainingRun.yolo_config_json, 'yolo_config_json').epochs,
        best_mAP50: parseJsonField(trainingRun.summary_json, 'summary_json').best_mAP50,
      } : null,
      dataset_version: datasetVersion ? {
        id: datasetVersion.id,
        version: datasetVersion.version,
        governance_status: datasetVersion.governance_status,
      } : null,
    },
    chain,
  };
}

// ═══ F5: Dashboard ══════════════════════════════════════════════════════════

export async function getDashboard() {
  const db = getDatabase();

  // Get counts
  const datasetVersionCount = (db.prepare('SELECT COUNT(*) as count FROM dataset_versions').get() as any).count;
  const trainingRunCount = (db.prepare('SELECT COUNT(*) as count FROM runs WHERE execution_mode = ?').get('yolo') as any).count;
  const artifactCount = (db.prepare('SELECT COUNT(*) as count FROM artifacts').get() as any).count;
  const evaluationCount = (db.prepare('SELECT COUNT(*) as count FROM evaluations WHERE execution_mode = ?').get('yolo_eval') as any).count;
  const modelCount = (db.prepare('SELECT COUNT(*) as count FROM models').get() as any).count;

  // Get latest evaluation metrics
  const latestEval = db.prepare('SELECT * FROM evaluations WHERE execution_mode = ? ORDER BY created_at DESC LIMIT 1').get('yolo_eval') as any;
  let latestMetrics = {};
  if (latestEval) {
    latestMetrics = parseJsonField(latestEval.evaluation_report_json, 'evaluation_report_json').summary || {};
  }

  // Get promote gate stats
  const passedCount = (db.prepare("SELECT COUNT(*) as count FROM evaluations WHERE promote_gate_status = 'passed'").get() as any).count;
  const totalCount = (db.prepare("SELECT COUNT(*) as count FROM evaluations WHERE promote_gate_status != ''").get() as any).count;

  return {
    ok: true,
    dashboard: {
      summary: {
        dataset_versions: datasetVersionCount,
        yolo_training_runs: trainingRunCount,
        artifacts: artifactCount,
        yolo_evaluations: evaluationCount,
        models: modelCount,
      },
      latest_metrics: latestMetrics,
      promote_gate_stats: {
        passed: passedCount,
        total: totalCount,
        pass_rate: totalCount > 0 ? `${((passedCount / totalCount) * 100).toFixed(1)}%` : 'N/A',
      },
      sample_tasks: {
        total: sampleTasks.size,
        tasks: Array.from(sampleTasks.values()).map(st => ({
          id: st.id,
          name: st.name,
          created_at: st.created_at,
        })),
      },
    },
  };
}

// ═══ F5: Release Note Generation ════════════════════════════════════════════

export async function generateReleaseNote(modelId: string) {
  const lineageResult = await getLineage(modelId);
  if (!lineageResult.ok) {
    return lineageResult;
  }

  const { lineage } = lineageResult;

  const releaseNote = {
    version: 'v1.0.0-sample',
    title: 'YOLO Mahjong Detection - Minimal Flywheel Sample',
    description: 'Phase-A 最小飞轮样板任务，用于链路验证和演示',
    created_at: now(),
    data_quality: {
      type: 'sample/mock',
      note: '指标来自模拟训练/评估，仅供链路验证，不作为生产级参考',
    },
    lineage: {
      dataset_version: lineage.dataset_version,
      training_run: lineage.training_run,
      artifact: lineage.artifact,
      evaluation: lineage.evaluation,
      model: {
        ...lineage.model,
        note: 'Auto-promoted via promote gate (passed)',
      },
    },
    capabilities: [
      '34-class mahjong tile detection',
      'YOLOv8n architecture',
      '640x640 input resolution',
    ],
    limitations: [
      'Sample data only - not production grade',
      'Mock training/evaluation',
      'Candidate status - requires manual promotion to production',
    ],
  };

  return {
    ok: true,
    release_note: releaseNote,
  };
}
