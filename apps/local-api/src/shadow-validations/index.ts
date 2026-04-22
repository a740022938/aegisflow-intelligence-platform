import { z } from 'zod';
import { getDatabase } from '../db/builtin-sqlite.js';

function genId() { return crypto.randomUUID(); }
function nowStr() { return new Date().toISOString(); }
function pj(v: any) { return typeof v === 'string' ? v : JSON.stringify(v || {}); }

// C1: Shadow Validation Module
// Handles shadow comparison between candidate and baseline models

const CreateShadowValidationSchema = z.object({
  candidate_model_id: z.string().uuid(),
  baseline_model_id: z.string().uuid(),
  test_video_batch_id: z.string().uuid().optional(),
  config_json: z.string().default('{}'),
});

// GET /api/shadow-validations
export async function listShadowValidations(query: any) {
  const db = getDatabase();
  const { candidate_model_id, status, limit = 50 } = query;
  
  let sql = 'SELECT * FROM shadow_validations WHERE 1=1';
  const params: any[] = [];
  
  if (candidate_model_id) {
    sql += ' AND candidate_model_id = ?';
    params.push(candidate_model_id);
  }
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  
  sql += ' ORDER BY created_at DESC LIMIT ?';
  params.push(parseInt(limit));
  
  const rows = db.prepare(sql).all(...params);
  return { ok: true, shadow_validations: rows, total: rows.length };
}

// GET /api/shadow-validations/:id
export async function getShadowValidation(id: string) {
  const db = getDatabase();
  const sv = db.prepare('SELECT * FROM shadow_validations WHERE id = ?').get(id) as any;
  if (!sv) return { ok: false, error: `Shadow validation ${id} not found` };
  
  // Parse JSON fields
  return {
    ok: true,
    shadow_validation: {
      ...sv,
      candidate_metrics_json: sv.candidate_metrics_json ? JSON.parse(sv.candidate_metrics_json) : null,
      baseline_metrics_json: sv.baseline_metrics_json ? JSON.parse(sv.baseline_metrics_json) : null,
      compare_result_json: sv.compare_result_json ? JSON.parse(sv.compare_result_json) : null,
      badcases_json: sv.badcases_json ? JSON.parse(sv.badcases_json) : null,
    }
  };
}

// POST /api/shadow-validations
export async function createShadowValidation(body: any) {
  const db = getDatabase();
  const v = CreateShadowValidationSchema.safeParse(body);
  if (!v.success) return { ok: false, error: v.error.message };
  
  const d = v.data;
  const id = genId();
  const t = nowStr();
  
  db.prepare(`
    INSERT INTO shadow_validations (
      id, candidate_model_id, baseline_model_id, test_video_batch_id,
      status, config_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, 'pending', ?, ?, ?)
  `).run(id, d.candidate_model_id, d.baseline_model_id, d.test_video_batch_id || '', pj(d.config_json), t, t);
  
  // Update candidate model with shadow_validation_id
  db.prepare('UPDATE models SET shadow_validation_id = ?, updated_at = ? WHERE model_id = ?')
    .run(id, t, d.candidate_model_id);
  
  return { ok: true, shadow_validation: db.prepare('SELECT * FROM shadow_validations WHERE id = ?').get(id) };
}

// POST /api/shadow-validations/:id/execute
export async function executeShadowValidation(id: string) {
  const db = getDatabase();
  const sv = db.prepare('SELECT * FROM shadow_validations WHERE id = ?').get(id) as any;
  if (!sv) return { ok: false, error: `Shadow validation ${id} not found` };
  if (sv.status === 'running') return { ok: false, error: 'Shadow validation is already running' };
  
  const t = nowStr();
  db.prepare('UPDATE shadow_validations SET status = ?, updated_at = ? WHERE id = ?')
    .run('running', t, id);
  
  // Get candidate and baseline models
  const candidate = db.prepare('SELECT * FROM models WHERE model_id = ?').get(sv.candidate_model_id) as any;
  const baseline = db.prepare('SELECT * FROM models WHERE model_id = ?').get(sv.baseline_model_id) as any;
  
  // Get their evaluations
  const candidateEval = candidate?.latest_evaluation_id 
    ? db.prepare('SELECT * FROM evaluations WHERE id = ?').get(candidate.latest_evaluation_id) as any
    : null;
  const baselineEval = baseline?.latest_evaluation_id
    ? db.prepare('SELECT * FROM evaluations WHERE id = ?').get(baseline.latest_evaluation_id) as any
    : null;
  
  // Parse metrics
  const candidateMetrics = candidateEval?.result_summary_json 
    ? JSON.parse(candidateEval.result_summary_json).metrics_summary || {}
    : {};
  const baselineMetrics = baselineEval?.result_summary_json
    ? JSON.parse(baselineEval.result_summary_json).metrics_summary || {}
    : {};
  
  // Simulate shadow comparison (in real implementation, this would run inference on test batch)
  // For now, compare evaluation metrics with some simulated differences
  const compareResult = {
    summary: {
      candidate_model_id: sv.candidate_model_id,
      baseline_model_id: sv.baseline_model_id,
      test_samples: 1000, // Simulated
      status: 'pending'
    },
    metrics_comparison: {
      mAP50: {
        candidate: candidateMetrics.mAP50 || 0.85,
        baseline: baselineMetrics.mAP50 || 0.82,
        diff: (candidateMetrics.mAP50 || 0.85) - (baselineMetrics.mAP50 || 0.82),
        passed: (candidateMetrics.mAP50 || 0.85) >= (baselineMetrics.mAP50 || 0.82) - 0.02 // Allow 2% regression
      },
      precision: {
        candidate: candidateMetrics.precision || 0.85,
        baseline: baselineMetrics.precision || 0.88,
        diff: (candidateMetrics.precision || 0.85) - (baselineMetrics.precision || 0.88),
        passed: (candidateMetrics.precision || 0.85) >= (baselineMetrics.precision || 0.88) - 0.05
      },
      recall: {
        candidate: candidateMetrics.recall || 0.80,
        baseline: baselineMetrics.recall || 0.75,
        diff: (candidateMetrics.recall || 0.80) - (baselineMetrics.recall || 0.75),
        passed: (candidateMetrics.recall || 0.80) >= (baselineMetrics.recall || 0.75) - 0.03
      }
    },
    quality_comparison: {
      false_positives: { candidate: 50, baseline: 60, diff: -10 },
      false_negatives: { candidate: 30, baseline: 40, diff: -10 },
      classifier_rejects: { candidate: 20, baseline: 25, diff: -5 },
      review_pack_pressure: { candidate: 0.15, baseline: 0.18, diff: -0.03 }
    }
  };
  
  // Determine overall status
  const allMetricsPassed = Object.values(compareResult.metrics_comparison).every((m: any) => m.passed);
  const status = allMetricsPassed ? 'completed' : 'failed';
  compareResult.summary.status = allMetricsPassed ? 'passed' : 'failed';
  
  // Generate badcases (simulated)
  const badcases = allMetricsPassed ? [
    { sample_id: 'frame_001', type: 'false_positive', severity: 'low', description: 'Minor over-detection on edge case' }
  ] : [
    { sample_id: 'frame_001', type: 'false_positive', severity: 'high', description: 'Significant regression in precision' },
    { sample_id: 'frame_002', type: 'false_negative', severity: 'medium', description: 'Missed detection in low light' }
  ];
  
  const recommendation = allMetricsPassed ? 'APPROVE' : 'REJECT';
  
  // Update shadow validation record
  db.prepare(`
    UPDATE shadow_validations SET
      status = ?,
      candidate_metrics_json = ?,
      baseline_metrics_json = ?,
      compare_result_json = ?,
      false_positive_diff = ?,
      false_negative_diff = ?,
      classifier_reject_diff = ?,
      review_pack_pressure_diff = ?,
      badcases_json = ?,
      recommendation = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    status,
    pj(candidateMetrics),
    pj(baselineMetrics),
    pj(compareResult),
    compareResult.quality_comparison.false_positives.diff,
    compareResult.quality_comparison.false_negatives.diff,
    compareResult.quality_comparison.classifier_rejects.diff,
    compareResult.quality_comparison.review_pack_pressure.diff,
    pj(badcases),
    recommendation,
    nowStr(),
    id
  );
  
  // Update model with shadow compare report
  db.prepare('UPDATE models SET shadow_compare_report_json = ?, updated_at = ? WHERE model_id = ?')
    .run(pj(compareResult), nowStr(), sv.candidate_model_id);
  
  return { ok: true, shadow_validation_id: id, status, recommendation, compare_result: compareResult };
}

// GET /api/shadow-validations/:id/report
export async function getShadowValidationReport(id: string) {
  const result = await getShadowValidation(id);
  if (!result.ok) return result;
  
  const db = getDatabase();
  const sv = result.shadow_validation;
  
  // Get model info
  const candidate = db.prepare('SELECT name, model_id FROM models WHERE model_id = ?').get(sv.candidate_model_id) as any;
  const baseline = db.prepare('SELECT name, model_id FROM models WHERE model_id = ?').get(sv.baseline_model_id) as any;
  
  return {
    ok: true,
    report: {
      shadow_validation_id: id,
      candidate_model: candidate,
      baseline_model: baseline,
      status: sv.status,
      recommendation: sv.recommendation,
      metrics_comparison: sv.compare_result_json?.metrics_comparison,
      quality_comparison: sv.compare_result_json?.quality_comparison,
      badcases: sv.badcases_json,
      generated_at: sv.updated_at
    }
  };
}

// POST /api/shadow-validations/:id/reflux-badcases
export async function refluxBadcases(id: string, body: any) {
  const db = getDatabase();
  const sv = db.prepare('SELECT * FROM shadow_validations WHERE id = ?').get(id) as any;
  if (!sv) return { ok: false, error: `Shadow validation ${id} not found` };
  
  const badcases = sv.badcases_json ? JSON.parse(sv.badcases_json) : [];
  if (!badcases.length) return { ok: false, error: 'No badcases to reflux' };
  
  const datasetVersionId = body.dataset_version_id || '';
  const createdIds: string[] = [];
  
  for (const badcase of badcases) {
    const negativePoolId = genId();
    db.prepare(`
      INSERT INTO negative_pools (
        id, dataset_version_id, pool_version, rejection_reason,
        source_batch_type, source_batch_id, sample_identifier,
        label_data, rejection_metadata, badcase_type,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      negativePoolId,
      datasetVersionId,
      'v1_shadow_validation',
      badcase.type === 'false_positive' ? 'false_positive_shadow' : 'false_negative_shadow',
      'shadow_validation',
      id,
      badcase.sample_id,
      pj({ severity: badcase.severity }),
      pj({ shadow_validation_id: id, description: badcase.description }),
      badcase.type,
      nowStr()
    );
    createdIds.push(negativePoolId);
  }
  
  // Audit log
  db.prepare(`
    INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at)
    VALUES (?, 'model', 'badcases_refluxed', ?, 'success', ?, ?)
  `).run(genId(), sv.candidate_model_id, pj({ shadow_validation_id: id, count: createdIds.length, negative_pool_ids: createdIds }), nowStr());
  
  return { ok: true, refluxed_count: createdIds.length, negative_pool_ids: createdIds };
}

// ═══ C2: Badcase Bucketing & Remediation ═════════════════════════════════════

// GET /api/shadow-validations/:id/badcases/buckets
export async function getBadcaseBuckets(id: string) {
  const db = getDatabase();
  const sv = db.prepare('SELECT * FROM shadow_validations WHERE id = ?').get(id) as any;
  if (!sv) return { ok: false, error: `Shadow validation ${id} not found` };
  
  const badcases = sv.badcases_json ? JSON.parse(sv.badcases_json) : [];
  
  // Define buckets
  const buckets: any = {
    ui_misdetect: { count: 0, samples: [], description: 'UI框位置偏移/大小错误' },
    missed_detection: { count: 0, samples: [], description: '漏检目标' },
    classifier_conflict: { count: 0, samples: [], description: '类别判断错误' },
    sam_failure: { count: 0, samples: [], description: 'SAM分割质量差' },
    review_pressure: { count: 0, samples: [], description: '人工复核压力大' }
  };
  
  // Categorize badcases
  for (const badcase of badcases) {
    const sampleId = badcase.sample_id;
    
    // Simple heuristics for bucketing (in real implementation, this would use more sophisticated analysis)
    if (badcase.type === 'false_negative') {
      buckets.missed_detection.count++;
      buckets.missed_detection.samples.push(sampleId);
    } else if (badcase.type === 'false_positive') {
      if (badcase.severity === 'high') {
        buckets.ui_misdetect.count++;
        buckets.ui_misdetect.samples.push(sampleId);
      } else {
        buckets.review_pressure.count++;
        buckets.review_pressure.samples.push(sampleId);
      }
    }
  }
  
  // Determine remediation actions
  const remediationActions: any = {
    negative_pool: [],
    review_pack: [],
    retrain_candidates: []
  };
  
  for (const badcase of badcases) {
    remediationActions.negative_pool.push(badcase.sample_id);
    if (badcase.severity === 'high' || badcase.severity === 'critical') {
      remediationActions.review_pack.push(badcase.sample_id);
    }
    if (badcase.type === 'false_negative') {
      remediationActions.retrain_candidates.push(badcase.sample_id);
    }
  }
  
  return {
    ok: true,
    shadow_validation_id: id,
    total_badcases: badcases.length,
    buckets,
    remediation_actions: remediationActions
  };
}

// POST /api/shadow-validations/:id/badcases/to-review-pack
export async function badcasesToReviewPack(id: string, body: any) {
  const db = getDatabase();
  const sv = db.prepare('SELECT * FROM shadow_validations WHERE id = ?').get(id) as any;
  if (!sv) return { ok: false, error: `Shadow validation ${id} not found` };
  
  const badcases = sv.badcases_json ? JSON.parse(sv.badcases_json) : [];
  if (!badcases.length) return { ok: false, error: 'No badcases to process' };
  
  const datasetVersionId = body.dataset_version_id || '';
  const reviewPackId = genId();
  const t = nowStr();
  
  // Create review pack (matching actual review_packs schema)
  db.prepare(`
    INSERT INTO review_packs (
      id, dataset_version_id, pack_type, total_samples, reviewed_samples, approved_samples, rejected_samples,
      status, reviewer_assignee, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    reviewPackId,
    datasetVersionId,
    'shadow_validation_badcase',
    badcases.length,
    0, 0, 0,
    'pending',
    '',
    t, t
  );
  
  return {
    ok: true,
    review_pack_id: reviewPackId,
    dataset_version_id: datasetVersionId,
    badcase_count: badcases.length,
    status: 'pending'
  };
}

// POST /api/shadow-validations/:id/revalidate
export async function revalidateShadowValidation(id: string, body: any) {
  const db = getDatabase();
  const sv = db.prepare('SELECT * FROM shadow_validations WHERE id = ?').get(id) as any;
  if (!sv) return { ok: false, error: `Shadow validation ${id} not found` };
  
  // Store previous results for comparison
  const previousResult = {
    status: sv.status,
    recommendation: sv.recommendation,
    candidate_metrics: sv.candidate_metrics_json ? JSON.parse(sv.candidate_metrics_json) : null,
    baseline_metrics: sv.baseline_metrics_json ? JSON.parse(sv.baseline_metrics_json) : null,
    compare_result: sv.compare_result_json ? JSON.parse(sv.compare_result_json) : null
  };
  
  // Re-execute shadow validation (this simulates revalidation with improved model)
  // In real implementation, this would use a new model version
  const revalidationResult = await executeShadowValidation(id);
  
  if (!revalidationResult.ok) {
    return revalidationResult;
  }
  
  // Get updated results
  const updatedSv = db.prepare('SELECT * FROM shadow_validations WHERE id = ?').get(id) as any;
  
  const afterResult = {
    status: updatedSv.status,
    recommendation: updatedSv.recommendation,
    candidate_metrics: updatedSv.candidate_metrics_json ? JSON.parse(updatedSv.candidate_metrics_json) : null,
    baseline_metrics: updatedSv.baseline_metrics_json ? JSON.parse(updatedSv.baseline_metrics_json) : null,
    compare_result: updatedSv.compare_result_json ? JSON.parse(updatedSv.compare_result_json) : null
  };
  
  // Calculate improvement
  const improvement: any = {};
  if (previousResult.candidate_metrics && afterResult.candidate_metrics) {
    for (const [key, value] of Object.entries(previousResult.candidate_metrics)) {
      const beforeVal = value as number;
      const afterVal = afterResult.candidate_metrics[key] as number;
      if (typeof beforeVal === 'number' && typeof afterVal === 'number') {
        improvement[key] = +(afterVal - beforeVal).toFixed(4);
      }
    }
  }
  
  return {
    ok: true,
    shadow_validation_id: id,
    before: previousResult,
    after: afterResult,
    improvement,
    conclusion: afterResult.status === 'completed' && afterResult.recommendation === 'APPROVE' 
      ? 'ready_for_production' 
      : 'still_blocked'
  };
}
