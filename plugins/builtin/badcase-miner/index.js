const MANIFEST = require('./manifest.json');

const DEFAULT_THRESHOLDS = {
  min_confidence: 0.6,
  min_quality_score: 0.7,
  max_latency_ms: 30000,
  max_error_rate: 0.0,
};

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function numberOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function pickId(record, index) {
  return String(record.id || record.sample_id || record.item_id || record.task_id || record.run_id || `sample_${index + 1}`);
}

function severityFromReasons(reasons) {
  if (reasons.includes('execution_failed') || reasons.includes('label_mismatch')) return 'high';
  if (reasons.includes('low_quality') || reasons.includes('low_confidence')) return 'medium';
  return 'low';
}

function inspectRecord(record, thresholds) {
  const reasons = [];
  const confidence = numberOrNull(record.confidence ?? record.score ?? record.probability);
  const quality = numberOrNull(record.quality_score ?? record.metric_score ?? record.f1 ?? record.accuracy);
  const latency = numberOrNull(record.latency_ms ?? record.duration_ms);
  const status = String(record.status || record.result || '').toLowerCase();

  if (['failed', 'error', 'timeout', 'cancelled'].includes(status) || record.error || record.error_message) {
    reasons.push('execution_failed');
  }
  if (confidence !== null && confidence < thresholds.min_confidence) {
    reasons.push('low_confidence');
  }
  if (quality !== null && quality < thresholds.min_quality_score) {
    reasons.push('low_quality');
  }
  if (latency !== null && latency > thresholds.max_latency_ms) {
    reasons.push('slow_case');
  }
  if (record.expected !== undefined && record.actual !== undefined && record.expected !== record.actual) {
    reasons.push('label_mismatch');
  }
  if (record.false_positive === true) {
    reasons.push('false_positive');
  }
  if (record.false_negative === true) {
    reasons.push('false_negative');
  }
  return reasons;
}

function recommendedAction(reasons) {
  if (reasons.includes('label_mismatch')) return 'send_to_label_review';
  if (reasons.includes('execution_failed')) return 'inspect_executor_and_retry';
  if (reasons.includes('low_confidence') || reasons.includes('low_quality')) return 'add_to_retrain_candidate_pool';
  if (reasons.includes('slow_case')) return 'profile_runtime_or_route_to_cheaper_model';
  return 'review_manually';
}

function mineBadcases(params = {}) {
  const thresholds = { ...DEFAULT_THRESHOLDS, ...(params.thresholds || {}) };
  const records = asArray(params.records || params.results || params.evaluations || params.items);
  const source = params.source || params.source_type || 'plugin_input';
  const now = new Date().toISOString();

  const feedbackItems = [];
  records.forEach((record, index) => {
    const reasons = inspectRecord(record, thresholds);
    if (reasons.length === 0) return;
    const sourceId = pickId(record, index);
    feedbackItems.push({
      id: `badcase_${String(feedbackItems.length + 1).padStart(4, '0')}`,
      source,
      source_id: sourceId,
      title: `Badcase candidate: ${sourceId}`,
      reason_codes: reasons,
      severity: severityFromReasons(reasons),
      recommended_action: recommendedAction(reasons),
      payload: record,
      created_at: now,
    });
  });

  const byReason = {};
  const bySeverity = {};
  for (const item of feedbackItems) {
    bySeverity[item.severity] = (bySeverity[item.severity] || 0) + 1;
    for (const reason of item.reason_codes) {
      byReason[reason] = (byReason[reason] || 0) + 1;
    }
  }

  const recommendedActions = Array.from(new Set(feedbackItems.map((item) => item.recommended_action)));
  return {
    feedback_items: feedbackItems,
    summary: {
      source,
      scanned_count: records.length,
      badcase_count: feedbackItems.length,
      thresholds,
      by_reason: byReason,
      by_severity: bySeverity,
    },
    recommended_actions: recommendedActions,
  };
}

function scoreSample(params = {}) {
  const thresholds = { ...DEFAULT_THRESHOLDS, ...(params.thresholds || {}) };
  const record = params.record || params.sample || params;
  const reasons = inspectRecord(record, thresholds);
  return {
    is_badcase: reasons.length > 0,
    reason_codes: reasons,
    severity: reasons.length ? severityFromReasons(reasons) : 'none',
    recommended_action: reasons.length ? recommendedAction(reasons) : 'none',
  };
}

async function execute(action, params = {}) {
  switch (action) {
    case 'mine_badcases':
    case 'mine':
      return mineBadcases(params);
    case 'score_sample':
      return scoreSample(params);
    case 'ping':
      return { ok: true, plugin_id: MANIFEST.plugin_id, timestamp: new Date().toISOString() };
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

module.exports = { manifest: MANIFEST, execute };
