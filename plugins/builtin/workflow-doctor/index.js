const MANIFEST = require('./manifest.json');

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function textOf(value) {
  return String(value || '').toLowerCase();
}

function nodeId(node, index) {
  return String(node.id || node.node_id || node.key || `node_${index + 1}`);
}

function nodeType(node) {
  return String(node.type || node.node_type || node.kind || node.step_type || node.task_type || 'unknown');
}

function nodeLabel(node, index) {
  return String(node.label || node.name || node.title || nodeType(node) || nodeId(node, index));
}

function getNodeParams(node) {
  return node.params || node.config || node.input || node.data?.params || node.data?.config || {};
}

function getRequiredParams(node) {
  const explicit = node.required_params || node.data?.required_params;
  if (Array.isArray(explicit)) return explicit;
  const schemaRequired = node.input_schema?.required || node.data?.input_schema?.required;
  return Array.isArray(schemaRequired) ? schemaRequired : [];
}

function issue(severity, code, message, extra = {}) {
  return {
    severity,
    code,
    message,
    ...extra,
  };
}

function normalizeGraph(params) {
  const workflow = params.workflow || params.definition || params;
  const nodes = asArray(params.nodes || workflow.nodes || workflow.workflow_nodes || workflow.steps);
  const edges = asArray(params.edges || workflow.edges || workflow.workflow_edges || workflow.links);
  return { workflow, nodes, edges };
}

function edgeSource(edge) {
  return String(edge.source || edge.from || edge.source_id || edge.from_node_id || '');
}

function edgeTarget(edge) {
  return String(edge.target || edge.to || edge.target_id || edge.to_node_id || '');
}

function detectCycles(nodeIds, edges) {
  const graph = new Map(nodeIds.map((id) => [id, []]));
  for (const edge of edges) {
    const source = edgeSource(edge);
    const target = edgeTarget(edge);
    if (graph.has(source) && graph.has(target)) {
      graph.get(source).push(target);
    }
  }

  const visiting = new Set();
  const visited = new Set();
  const cycles = [];

  function dfs(id, path) {
    if (visiting.has(id)) {
      const start = path.indexOf(id);
      cycles.push(path.slice(start).concat(id));
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const next of graph.get(id) || []) {
      dfs(next, path.concat(next));
    }
    visiting.delete(id);
    visited.add(id);
  }

  for (const id of nodeIds) {
    dfs(id, [id]);
  }
  return cycles;
}

function inspectWorkflow(params = {}) {
  const { nodes, edges } = normalizeGraph(params);
  const requireCostRouting = params.require_cost_routing !== false;
  const requireFeedbackBackflow = params.require_feedback_backflow !== false;
  const issues = [];
  const suggestions = [];

  if (nodes.length === 0) {
    issues.push(issue('error', 'workflow.empty', 'Workflow has no nodes.'));
  }

  const seen = new Map();
  const ids = [];
  nodes.forEach((node, index) => {
    const id = nodeId(node, index);
    ids.push(id);
    if (seen.has(id)) {
      issues.push(issue('error', 'node.duplicate_id', `Duplicate node id: ${id}`, { node_id: id }));
    }
    seen.set(id, node);

    if (!node.id && !node.node_id && !node.key) {
      issues.push(issue('warning', 'node.synthetic_id', `Node "${nodeLabel(node, index)}" has no stable id.`, { node_id: id }));
    }
    if (nodeType(node) === 'unknown') {
      issues.push(issue('warning', 'node.missing_type', `Node "${nodeLabel(node, index)}" has no type.`, { node_id: id }));
    }

    const paramsObj = getNodeParams(node);
    for (const key of getRequiredParams(node)) {
      if (paramsObj[key] === undefined || paramsObj[key] === null || paramsObj[key] === '') {
        issues.push(issue('error', 'node.missing_required_param', `Node "${nodeLabel(node, index)}" is missing required param "${key}".`, {
          node_id: id,
          param: key,
        }));
      }
    }
  });

  const idSet = new Set(ids);
  const incoming = new Map(ids.map((id) => [id, 0]));
  const outgoing = new Map(ids.map((id) => [id, 0]));

  edges.forEach((edge, index) => {
    const source = edgeSource(edge);
    const target = edgeTarget(edge);
    if (!source || !target) {
      issues.push(issue('error', 'edge.missing_endpoint', `Edge ${index + 1} is missing source or target.`, { edge_index: index }));
      return;
    }
    if (!idSet.has(source)) {
      issues.push(issue('error', 'edge.dangling_source', `Edge ${index + 1} source does not exist: ${source}`, { edge_index: index, source }));
    }
    if (!idSet.has(target)) {
      issues.push(issue('error', 'edge.dangling_target', `Edge ${index + 1} target does not exist: ${target}`, { edge_index: index, target }));
    }
    if (idSet.has(source)) outgoing.set(source, (outgoing.get(source) || 0) + 1);
    if (idSet.has(target)) incoming.set(target, (incoming.get(target) || 0) + 1);
  });

  if (nodes.length > 1) {
    for (const id of ids) {
      if ((incoming.get(id) || 0) === 0 && (outgoing.get(id) || 0) === 0) {
        issues.push(issue('warning', 'node.orphan', `Node is isolated: ${id}`, { node_id: id }));
      }
    }
  }

  for (const cycle of detectCycles(ids, edges)) {
    issues.push(issue('error', 'graph.cycle', `Workflow contains a directed cycle: ${cycle.join(' -> ')}`, { cycle }));
  }

  const searchable = nodes.map((node, index) => `${nodeType(node)} ${nodeLabel(node, index)} ${JSON.stringify(node)}`).join('\n').toLowerCase();
  if (requireCostRouting && !/(cost|routing|route_policy|brain_router|router)/.test(searchable)) {
    issues.push(issue('warning', 'routing.missing_cost_router', 'No cost-routing or route-policy node was detected.'));
    suggestions.push('Add a cost-routing decision point before expensive model or workflow execution.');
  }
  if (requireFeedbackBackflow && !/(feedback|backflow|badcase|回流)/.test(searchable)) {
    issues.push(issue('warning', 'feedback.missing_backflow', 'No feedback/backflow node was detected.'));
    suggestions.push('Add a feedback backflow step to close the observe -> improve loop.');
  }

  const counts = issues.reduce((acc, item) => {
    acc[item.severity] = (acc[item.severity] || 0) + 1;
    return acc;
  }, {});
  const score = Math.max(0, 100 - (counts.error || 0) * 15 - (counts.warning || 0) * 5 - (counts.info || 0));
  const status = (counts.error || 0) > 0 ? 'fail' : (counts.warning || 0) > 0 ? 'warn' : 'pass';

  return {
    status,
    score,
    issues,
    suggestions,
    summary: {
      node_count: nodes.length,
      edge_count: edges.length,
      error_count: counts.error || 0,
      warning_count: counts.warning || 0,
      info_count: counts.info || 0,
    },
  };
}

async function execute(action, params = {}) {
  switch (action) {
    case 'inspect_workflow':
    case 'inspect_canvas':
    case 'doctor':
      return inspectWorkflow(params);
    case 'ping':
      return { ok: true, plugin_id: MANIFEST.plugin_id, timestamp: new Date().toISOString() };
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

module.exports = { manifest: MANIFEST, execute };
