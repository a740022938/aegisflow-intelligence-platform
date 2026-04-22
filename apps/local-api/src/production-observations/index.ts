/**
 * D2: Production Observations & Badcase Reflux
 * 生产观察与坏例回流模块
 */

import { getDatabase } from '../db/builtin-sqlite.js';

// ── Helper ────────────────────────────────────────────────────────────────────
function genId()  { return crypto.randomUUID(); }
function nowStr() { return new Date().toISOString(); }
function pj(v: any) { return typeof v === 'string' ? v : JSON.stringify(v || {}); }
function parseJsonField(raw: any, _name: string) {
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  try { return JSON.parse(raw); } catch { return null; }
}

// ── Production Observations ───────────────────────────────────────────────────

/**
 * POST /api/production-observations - 记录生产观察数据
 */
export async function createProductionObservation(body: any) {
  const db = getDatabase();
  const id = genId();
  const ts = nowStr();
  
  const {
    model_id,
    observation_period_start,
    observation_period_end,
    inference_count = 0,
    ui_misdetect_count = 0,
    missed_detection_count = 0,
    classifier_reject_count = 0,
    review_pack_pressure = 0,
    badcase_count = 0,
    notes = '',
  } = body;
  
  if (!model_id) return { ok: false, error: 'model_id is required' };
  
  db.prepare(`
    INSERT INTO production_observations (
      id, model_id, observation_period_start, observation_period_end,
      inference_count, ui_misdetect_count, missed_detection_count,
      classifier_reject_count, review_pack_pressure, badcase_count,
      notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, model_id, observation_period_start || null, observation_period_end || null,
    inference_count, ui_misdetect_count, missed_detection_count,
    classifier_reject_count, review_pack_pressure, badcase_count,
    notes, ts, ts
  );
  
  return {
    ok: true,
    observation_id: id,
    model_id,
    created_at: ts,
  };
}

/**
 * GET /api/production-observations - 查询生产观察记录
 */
export async function getProductionObservations(query: any) {
  const db = getDatabase();
  const { model_id, limit = 20, offset = 0 } = query;
  
  let sql = 'SELECT * FROM production_observations WHERE 1=1';
  const params: any[] = [];
  
  if (model_id) {
    sql += ' AND model_id = ?';
    params.push(model_id);
  }
  
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));
  
  const rows = db.prepare(sql).all(...params);
  
  // Get summary stats
  let totalSql = 'SELECT COUNT(*) as total, SUM(inference_count) as total_inferences, SUM(badcase_count) as total_badcases FROM production_observations WHERE 1=1';
  const totalParams: any[] = [];
  if (model_id) {
    totalSql += ' AND model_id = ?';
    totalParams.push(model_id);
  }
  const totals = db.prepare(totalSql).get(...totalParams) as any;
  
  return {
    ok: true,
    observations: rows,
    total: totals?.total || 0,
    summary: {
      total_observations: totals?.total || 0,
      total_inferences: totals?.total_inferences || 0,
      total_badcases: totals?.total_badcases || 0,
    },
  };
}

/**
 * GET /api/production-observations/report - 生成生产观察报告
 */
export async function getProductionObservationReport(query: any) {
  const db = getDatabase();
  const { model_id } = query;
  
  if (!model_id) return { ok: false, error: 'model_id is required' };
  
  // Get all observations for this model
  const observations = db.prepare(
    'SELECT * FROM production_observations WHERE model_id = ? ORDER BY created_at DESC'
  ).all(model_id) as any[];
  
  if (!observations.length) {
    return {
      ok: true,
      report: {
        model_id,
        observation_count: 0,
        summary: {},
        recommendations: ['No production observations yet'],
        next_actions: [],
      },
    };
  }
  
  // Aggregate stats
  let total_inferences = 0;
  let total_ui_misdetect = 0;
  let total_missed_detection = 0;
  let total_classifier_reject = 0;
  let total_badcases = 0;
  let total_review_pressure = 0;
  
  for (const obs of observations) {
    total_inferences += obs.inference_count || 0;
    total_ui_misdetect += obs.ui_misdetect_count || 0;
    total_missed_detection += obs.missed_detection_count || 0;
    total_classifier_reject += obs.classifier_reject_count || 0;
    total_badcases += obs.badcase_count || 0;
    total_review_pressure += obs.review_pack_pressure || 0;
  }
  
  const avg_pressure = total_review_pressure / observations.length;
  const badcase_rate = total_inferences > 0 ? total_badcases / total_inferences : 0;
  const misdetect_rate = total_inferences > 0 ? total_ui_misdetect / total_inferences : 0;
  const missed_rate = total_inferences > 0 ? total_missed_detection / total_inferences : 0;
  
  // Determine recommendations
  const recommendations: string[] = [];
  const next_actions: string[] = [];
  
  if (badcase_rate > 0.05) {
    recommendations.push('⚠️ Badcase rate is high (>5%), consider triggering next retraining');
    next_actions.push('Prepare next_dataset_version with badcase samples');
  }
  
  if (misdetect_rate > 0.02) {
    recommendations.push('⚠️ UI misdetection rate is elevated (>2%)');
    next_actions.push('Review recent false positives');
  }
  
  if (missed_rate > 0.02) {
    recommendations.push('⚠️ Missed detection rate is elevated (>2%)');
    next_actions.push('Collect missed detection samples for retraining');
  }
  
  if (avg_pressure > 0.15) {
    recommendations.push('⚠️ Review pack pressure is high (>15%)');
    next_actions.push('Prioritize review pack processing');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('✅ Production model is stable, no immediate issues detected');
  }
  
  // Determine production stability
  const stability = badcase_rate < 0.01 ? 'stable' : badcase_rate < 0.05 ? 'acceptable' : 'degraded';
  
  // Find most common error type
  const errorCounts = {
    ui_misdetect: total_ui_misdetect,
    missed_detection: total_missed_detection,
    classifier_reject: total_classifier_reject,
  };
  const mostCommonError = Object.entries(errorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';
  
  return {
    ok: true,
    report: {
      model_id,
      observation_count: observations.length,
      observation_period: {
        start: observations[observations.length - 1]?.created_at,
        end: observations[0]?.created_at,
      },
      summary: {
        total_inferences,
        total_badcases,
        badcase_rate: +badcase_rate.toFixed(4),
        misdetect_rate: +misdetect_rate.toFixed(4),
        missed_rate: +missed_rate.toFixed(4),
        avg_review_pressure: +avg_pressure.toFixed(4),
        most_common_error: mostCommonError,
      },
      error_breakdown: {
        ui_misdetect: total_ui_misdetect,
        missed_detection: total_missed_detection,
        classifier_reject: total_classifier_reject,
      },
      production_stability: stability,
      recommendations,
      next_actions,
    },
  };
}

/**
 * GET /api/production-observations/badcases - 获取生产坏例列表
 */
export async function getProductionBadcases(query: any) {
  const db = getDatabase();
  const { model_id, badcase_type, severity, limit = 50 } = query;
  
  let sql = 'SELECT * FROM production_badcases WHERE 1=1';
  const params: any[] = [];
  
  if (model_id) {
    sql += ' AND model_id = ?';
    params.push(model_id);
  }
  if (badcase_type) {
    sql += ' AND badcase_type = ?';
    params.push(badcase_type);
  }
  if (severity) {
    sql += ' AND severity = ?';
    params.push(severity);
  }
  
  sql += ' ORDER BY created_at DESC LIMIT ?';
  params.push(Number(limit));
  
  const rows = db.prepare(sql).all(...params) as any[];
  
  // Parse metadata_json
  const badcases = rows.map(r => ({
    ...r,
    metadata: parseJsonField(r.metadata_json, 'metadata_json'),
  }));
  
  return { ok: true, badcases, total: badcases.length };
}

/**
 * GET /api/production-observations/badcases/buckets - 按类型分桶
 */
export async function getProductionBadcaseBuckets(query: any) {
  const db = getDatabase();
  const { model_id } = query;
  
  const types = ['ui_misdetect', 'missed_detection', 'classifier_conflict', 'sam_failure', 'review_pressure'];
  const buckets: any = {};
  
  for (const type of types) {
    let sql = `SELECT COUNT(*) as count, 
      SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_count,
      SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium_count,
      SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low_count
      FROM production_badcases WHERE badcase_type = ?`;
    const params: any[] = [type];
    
    if (model_id) {
      sql += ' AND model_id = ?';
      params.push(model_id);
    }
    
    const row = db.prepare(sql).get(...params) as any;
    buckets[type] = {
      count: row?.count || 0,
      critical_count: row?.critical_count || 0,
      medium_count: row?.medium_count || 0,
      low_count: row?.low_count || 0,
    };
  }
  
  return { ok: true, buckets, total: Object.values(buckets).reduce((s: number, b: any) => s + b.count, 0) };
}

// ── Badcase Management ───────────────────────────────────────────────────────

/**
 * POST /api/badcases - 写入生产坏例
 */
export async function createProductionBadcase(body: any) {
  const db = getDatabase();
  const id = genId();
  const ts = nowStr();
  
  const {
    model_id,
    observation_id,
    badcase_type,
    frame_id,
    severity = 'medium',
    description = '',
    metadata = {},
  } = body;
  
  if (!model_id || !badcase_type) {
    return { ok: false, error: 'model_id and badcase_type are required' };
  }
  
  db.prepare(`
    INSERT INTO production_badcases (
      id, model_id, observation_id, badcase_type, frame_id,
      severity, description, metadata_json, status,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, model_id, observation_id || null, badcase_type, frame_id || null,
    severity, description, pj(metadata), 'pending',
    ts, ts
  );
  
  return { ok: true, badcase_id: id, model_id, badcase_type, severity, created_at: ts };
}

/**
 * POST /api/badcases/:id/to-negative-pool - 将坏例写入 negative_pool
 */
export async function badcaseToNegativePool(badcaseId: string, body: any) {
  const db = getDatabase();
  
  const badcase = db.prepare('SELECT * FROM production_badcases WHERE id = ?').get(badcaseId) as any;
  if (!badcase) return { ok: false, error: `Badcase ${badcaseId} not found` };
  
  const {
    dataset_version_id,
    frame_id = badcase.frame_id,
    rejection_reason = badcase.badcase_type,
    severity = badcase.severity,
    metadata = {},
  } = body;
  
  if (!dataset_version_id) return { ok: false, error: 'dataset_version_id is required' };
  
  const id = genId();
  const ts = nowStr();
  
  // Use actual negative_pools table columns
  db.prepare(`
    INSERT INTO negative_pools (
      id, dataset_version_id, pool_version, source_batch_type, source_batch_id,
      sample_identifier, rejection_reason, badcase_type,
      source_image_id, source_box_json,
      rejection_metadata, reused_count,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, dataset_version_id, 'v1', 'production_badcase', badcaseId,
    frame_id, rejection_reason, badcase.badcase_type,
    frame_id, null,
    pj({ original_badcase_id: badcaseId, severity }),
    0,
    ts
  );
  
  // Update badcase status
  db.prepare('UPDATE production_badcases SET status = ?, updated_at = ? WHERE id = ?')
    .run('refluxed_to_negative_pool', ts, badcaseId);
  
  return { ok: true, negative_pool_id: id, badcase_id: badcaseId, dataset_version_id, created_at: ts };
}

/**
 * POST /api/badcases/:id/to-review-pack - 将坏例写入 review_pack
 */
export async function badcaseToReviewPack(badcaseId: string, body: any) {
  const db = getDatabase();
  
  const badcase = db.prepare('SELECT * FROM production_badcases WHERE id = ?').get(badcaseId) as any;
  if (!badcase) return { ok: false, error: `Badcase ${badcaseId} not found` };
  
  const { dataset_version_id, review_pack_id } = body;
  
  if (!dataset_version_id && !review_pack_id) {
    return { ok: false, error: 'dataset_version_id or review_pack_id is required' };
  }
  
  const ts = nowStr();
  
  // Use existing review pack or create new one
  let rpId = review_pack_id;
  if (!rpId) {
    rpId = genId();
    db.prepare(`
      INSERT INTO review_packs (
        id, dataset_version_id, pack_type, total_samples, reviewed_samples,
        approved_samples, rejected_samples, status, reviewer_assignee,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(rpId, dataset_version_id, 'production_badcase', 0, 0, 0, 0, 'pending', '', ts, ts);
  }
  
  // Add badcase to review pack via review_pack_items table
  const rpiId = genId();
  db.prepare(`
    INSERT INTO review_pack_items (
      id, review_pack_id, badcase_id, frame_id, badcase_type,
      severity, description, metadata_json, review_decision,
      reviewer_notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    rpiId,
    rpId,
    badcaseId,
    badcase.frame_id || null,
    badcase.badcase_type,
    badcase.severity,
    badcase.description || `Production badcase: ${badcase.badcase_type}`,
    pj({ original_badcase_id: badcaseId }),
    'pending',
    '',
    ts, ts
  );
  
  // Update review pack sample count
  if (review_pack_id) {
    const rp = db.prepare('SELECT * FROM review_packs WHERE id = ?').get(review_pack_id) as any;
    if (rp) {
      db.prepare('UPDATE review_packs SET total_samples = ?, updated_at = ? WHERE id = ?')
        .run((rp.total_samples || 0) + 1, ts, review_pack_id);
    }
  }
  
  // Update badcase status
  db.prepare('UPDATE production_badcases SET status = ?, updated_at = ? WHERE id = ?')
    .run('refluxed_to_review_pack', ts, badcaseId);
  
  return { ok: true, badcase_id: badcaseId, review_pack_id: rpId, review_pack_item_id: rpiId, created_at: ts };
}

/**
 * GET /api/badcases/next-retrain-candidates - 下轮训练候选
 */
export async function getNextRetrainCandidates(query: any) {
  const db = getDatabase();
  const { model_id, dataset_version_id } = query;
  
  // Get negative_pool entries for retraining
  let npSql = 'SELECT * FROM negative_pools WHERE rejection_reason IS NOT NULL';
  const npParams: any[] = [];
  if (dataset_version_id) {
    npSql += ' AND dataset_version_id = ?';
    npParams.push(dataset_version_id);
  }
  npSql += ' ORDER BY created_at DESC LIMIT 100';
  
  const negativeEntries = db.prepare(npSql).all(...npParams) as any[];
  
  // Get review_pack entries for retraining
  let rpSql = 'SELECT * FROM review_packs WHERE status = ?';
  const rpParams: any[] = ['approved'];
  
  if (dataset_version_id) {
    rpSql += ' AND dataset_version_id = ?';
    rpParams.push(dataset_version_id);
  }
  rpSql += ' ORDER BY created_at DESC LIMIT 20';
  
  const approvedReviews = db.prepare(rpSql).all(...rpParams) as any[];
  
  // Get production_badcases for retraining (only critical/medium severity)
  let pbSql = 'SELECT * FROM production_badcases WHERE status = ? AND severity IN (?, ?)';
  const pbParams: any[] = ['pending', 'critical', 'medium'];
  
  if (model_id) {
    pbSql += ' AND model_id = ?';
    pbParams.push(model_id);
  }
  if (dataset_version_id) {
    // Link via classifier_verifications
  }
  pbSql += ' ORDER BY created_at DESC LIMIT 100';
  
  const productionBadcases = db.prepare(pbSql).all(...pbParams) as any[];
  
  // Categorize by priority
  const retrainCandidates = {
    high_priority: {
      description: 'Critical badcases and missed detections',
      count: productionBadcases.filter((b: any) => b.severity === 'critical' || b.badcase_type === 'missed_detection').length,
      sources: productionBadcases.filter((b: any) => b.severity === 'critical' || b.badcase_type === 'missed_detection'),
    },
    medium_priority: {
      description: 'Medium severity badcases',
      count: productionBadcases.filter((b: any) => b.severity === 'medium' && b.badcase_type !== 'missed_detection').length,
      sources: productionBadcases.filter((b: any) => b.severity === 'medium' && b.badcase_type !== 'missed_detection'),
    },
    negative_pool_candidates: {
      description: 'Negative pool entries for data augmentation',
      count: negativeEntries.length,
      sources: negativeEntries,
    },
    approved_reviews: {
      description: 'Approved review pack samples',
      count: approvedReviews.length,
      sources: approvedReviews,
    },
  };
  
  const totalCandidates = 
    retrainCandidates.high_priority.count +
    retrainCandidates.medium_priority.count +
    retrainCandidates.negative_pool_candidates.count +
    retrainCandidates.approved_reviews.count;
  
  return {
    ok: true,
    total_candidates: totalCandidates,
    dataset_version_id: dataset_version_id || null,
    candidates: retrainCandidates,
    recommendations: totalCandidates > 20 
      ? ['✅ Sufficient candidates for next retraining cycle']
      : ['⚠️ Low candidate count, continue production monitoring'],
  };
}

// ── Route Registration ────────────────────────────────────────────────────────
export async function registerProductionObservationRoutes(app: any) {
  
  // Production observations
  app.post('/api/production-observations', async (req, reply) => {
    const r = await createProductionObservation(req.body || {});
    return r.ok ? r : reply.status(400).send(r);
  });
  
  app.get('/api/production-observations', async (req, reply) => {
    const r = await getProductionObservations(req.query || {});
    return r.ok ? r : reply.status(404).send(r);
  });
  
  app.get('/api/production-observations/report', async (req, reply) => {
    const r = await getProductionObservationReport(req.query || {});
    return r.ok ? r : reply.status(400).send(r);
  });
  
  app.get('/api/production-observations/badcases', async (req, reply) => {
    const r = await getProductionBadcases(req.query || {});
    return r.ok ? r : reply.status(404).send(r);
  });
  
  app.get('/api/production-observations/badcases/buckets', async (req, reply) => {
    const r = await getProductionBadcaseBuckets(req.query || {});
    return r.ok ? r : reply.status(404).send(r);
  });
  
  // Badcase management
  app.post('/api/badcases', async (req, reply) => {
    const r = await createProductionBadcase(req.body || {});
    return r.ok ? r : reply.status(400).send(r);
  });
  
  app.post('/api/badcases/:id/to-negative-pool', async (req, reply) => {
    const r = await badcaseToNegativePool(req.params.id, req.body || {});
    return r.ok ? r : reply.status(400).send(r);
  });
  
  app.post('/api/badcases/:id/to-review-pack', async (req, reply) => {
    const r = await badcaseToReviewPack(req.params.id, req.body || {});
    return r.ok ? r : reply.status(400).send(r);
  });
  
  app.get('/api/badcases/next-retrain-candidates', async (req, reply) => {
    const r = await getNextRetrainCandidates(req.query || {});
    return r.ok ? r : reply.status(404).send(r);
  });
  
  console.log('✅ Production observation routes registered (D2)');
}
