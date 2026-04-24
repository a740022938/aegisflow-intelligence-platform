const MANIFEST = require('./manifest.json');

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function line(value) {
  if (value === undefined || value === null || value === '') return '-';
  if (typeof value === 'object') return `\`${JSON.stringify(value)}\``;
  return String(value);
}

function listBlock(items) {
  const rows = asArray(items);
  if (rows.length === 0) return '- None\n';
  return rows.map((item) => `- ${line(item)}`).join('\n') + '\n';
}

function objectBlock(obj) {
  if (!obj || typeof obj !== 'object') return '- None\n';
  const entries = Object.entries(obj);
  if (entries.length === 0) return '- None\n';
  return entries.map(([key, value]) => `- ${key}: ${line(value)}`).join('\n') + '\n';
}

function renderSections(sections) {
  return asArray(sections)
    .map((section) => {
      const title = section.title || section.name || 'Section';
      if (section.markdown) return `## ${title}\n\n${section.markdown}\n`;
      if (section.items) return `## ${title}\n\n${listBlock(section.items)}`;
      if (section.data) return `## ${title}\n\n${objectBlock(section.data)}`;
      return `## ${title}\n\n${line(section.content || section.summary)}\n`;
    })
    .join('\n');
}

function generateReport(params = {}) {
  const generatedAt = new Date().toISOString();
  const title = params.title || 'AIP Report';
  const report = {
    title,
    generated_at: generatedAt,
    summary: params.summary || {},
    sections: asArray(params.sections),
    evidence: asArray(params.evidence),
    risks: asArray(params.risks),
    next_steps: asArray(params.next_steps),
  };

  const markdown = [
    `# ${title}`,
    '',
    `Generated at: ${generatedAt}`,
    '',
    '## Summary',
    '',
    objectBlock(report.summary),
    renderSections(report.sections),
    '## Evidence',
    '',
    listBlock(report.evidence),
    '## Risks',
    '',
    listBlock(report.risks),
    '## Next Steps',
    '',
    listBlock(report.next_steps),
  ].join('\n');

  return {
    markdown,
    json: report,
    generated_at: generatedAt,
  };
}

function sealSummary(params = {}) {
  return generateReport({
    title: params.title || 'Release Seal Summary',
    summary: {
      status: params.status || 'sealed',
      branch: params.branch || 'main',
      commit: params.commit || params.head || 'unknown',
      tag: params.tag || 'not_provided',
      repository: params.repository || params.remote || 'not_provided',
    },
    sections: [
      { title: 'Scope', items: asArray(params.scope) },
      { title: 'Verification', items: asArray(params.verification || params.checks) },
    ],
    evidence: params.evidence,
    risks: params.risks,
    next_steps: params.next_steps,
  });
}

function workflowReport(params = {}) {
  const doctor = params.doctor_result || params.workflow_doctor || {};
  const badcases = params.badcase_result || params.badcases || {};
  const rules = params.rule_result || params.rules || {};
  return generateReport({
    title: params.title || 'Workflow Quality Report',
    summary: {
      workflow_status: doctor.status || 'unknown',
      workflow_score: doctor.score ?? 'unknown',
      badcase_count: badcases.summary?.badcase_count ?? asArray(badcases.feedback_items).length,
      rule_decision: rules.decision || 'unknown',
    },
    sections: [
      { title: 'Workflow Doctor Issues', items: asArray(doctor.issues).map((item) => `${item.severity || 'info'} ${item.code || ''}: ${item.message || JSON.stringify(item)}`) },
      { title: 'Badcase Candidates', items: asArray(badcases.feedback_items).map((item) => `${item.severity}: ${item.source_id} ${asArray(item.reason_codes).join(',')}`) },
      { title: 'Rule Matches', items: asArray(rules.matched_rules).map((item) => `${item.rule_id}: ${item.decision || item.message || 'matched'}`) },
    ],
    evidence: params.evidence,
    risks: params.risks,
    next_steps: params.next_steps,
  });
}

async function execute(action, params = {}) {
  switch (action) {
    case 'generate_report':
    case 'generate':
      return generateReport(params);
    case 'seal_summary':
      return sealSummary(params);
    case 'workflow_report':
      return workflowReport(params);
    case 'ping':
      return { ok: true, plugin_id: MANIFEST.plugin_id, timestamp: new Date().toISOString() };
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

module.exports = { manifest: MANIFEST, execute };
