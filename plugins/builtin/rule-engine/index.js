const MANIFEST = require('./manifest.json');

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function getPath(obj, path) {
  return String(path || '').split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

function compare(actual, operator, expected) {
  switch (operator) {
    case 'exists':
      return actual !== undefined && actual !== null && actual !== '';
    case 'missing':
      return actual === undefined || actual === null || actual === '';
    case 'eq':
      return actual === expected;
    case 'ne':
      return actual !== expected;
    case 'gt':
      return Number(actual) > Number(expected);
    case 'gte':
      return Number(actual) >= Number(expected);
    case 'lt':
      return Number(actual) < Number(expected);
    case 'lte':
      return Number(actual) <= Number(expected);
    case 'in':
      return Array.isArray(expected) && expected.includes(actual);
    case 'nin':
      return Array.isArray(expected) && !expected.includes(actual);
    case 'contains':
      return Array.isArray(actual) ? actual.includes(expected) : String(actual || '').includes(String(expected));
    case 'regex':
      return new RegExp(String(expected)).test(String(actual || ''));
    default:
      throw new Error(`Unsupported operator: ${operator}`);
  }
}

function evaluateCondition(facts, condition) {
  const field = condition.field || condition.path;
  const operator = condition.op || condition.operator || 'eq';
  const actual = getPath(facts, field);
  const passed = compare(actual, operator, condition.value);
  return {
    field,
    operator,
    expected: condition.value,
    actual,
    passed,
  };
}

function evaluateRule(facts, rule) {
  const when = rule.when || {};
  const all = asArray(when.all || rule.all);
  const any = asArray(when.any || rule.any);
  const none = asArray(when.none || rule.none);
  const allTrace = all.map((condition) => evaluateCondition(facts, condition));
  const anyTrace = any.map((condition) => evaluateCondition(facts, condition));
  const noneTrace = none.map((condition) => evaluateCondition(facts, condition));

  const allPassed = allTrace.every((item) => item.passed);
  const anyPassed = anyTrace.length === 0 || anyTrace.some((item) => item.passed);
  const nonePassed = noneTrace.every((item) => !item.passed);
  const matched = allPassed && anyPassed && nonePassed;

  return {
    rule_id: String(rule.id || rule.rule_id || rule.name || 'unnamed_rule'),
    name: rule.name || rule.id || 'Unnamed rule',
    priority: Number(rule.priority || 0),
    matched,
    then: rule.then || {},
    trace: {
      all: allTrace,
      any: anyTrace,
      none: noneTrace,
    },
  };
}

function validateRules(rules) {
  const errors = [];
  const warnings = [];
  asArray(rules).forEach((rule, index) => {
    const id = rule.id || rule.rule_id || rule.name || `rule_${index + 1}`;
    const when = rule.when || {};
    if (!Array.isArray(when.all || rule.all) && !Array.isArray(when.any || rule.any) && !Array.isArray(when.none || rule.none)) {
      errors.push(`${id}: rule must define when.all, when.any, or when.none`);
    }
    for (const condition of asArray(when.all || rule.all).concat(asArray(when.any || rule.any), asArray(when.none || rule.none))) {
      if (!condition.field && !condition.path) errors.push(`${id}: condition is missing field/path`);
      if (!condition.op && !condition.operator) warnings.push(`${id}: condition uses default operator eq`);
    }
    if (!rule.then) warnings.push(`${id}: rule has no then payload`);
  });
  return { valid: errors.length === 0, errors, warnings };
}

function evaluateRules(params = {}) {
  const facts = params.facts || {};
  const rules = asArray(params.rules || params.rule_pack?.rules);
  const validation = validateRules(rules);
  if (!validation.valid && params.strict !== false) {
    return {
      valid: false,
      decision: params.default_decision || 'needs_review',
      matched_rules: [],
      trace: [],
      errors: validation.errors,
      warnings: validation.warnings,
    };
  }

  const trace = rules.map((rule) => evaluateRule(facts, rule));
  const matched = trace
    .filter((item) => item.matched)
    .sort((a, b) => b.priority - a.priority);
  const winner = matched[0];
  return {
    valid: validation.valid,
    decision: winner?.then?.decision || winner?.then?.status || params.default_decision || 'pass',
    matched_rules: matched.map((item) => ({
      rule_id: item.rule_id,
      name: item.name,
      priority: item.priority,
      decision: item.then?.decision || item.then?.status,
      message: item.then?.message,
      tags: item.then?.tags || [],
    })),
    trace,
    errors: validation.errors,
    warnings: validation.warnings,
  };
}

async function execute(action, params = {}) {
  switch (action) {
    case 'evaluate_rules':
    case 'evaluate':
      return evaluateRules(params);
    case 'validate_rule_pack':
      return validateRules(params.rules || params.rule_pack?.rules || []);
    case 'ping':
      return { ok: true, plugin_id: MANIFEST.plugin_id, timestamp: new Date().toISOString() };
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

module.exports = { manifest: MANIFEST, execute };
