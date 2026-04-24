const MANIFEST = require('./manifest.json');

async function execute(action, params = {}) {
  switch (action) {
    case 'get_status':
    case 'status':
      return {
        plugin_id: MANIFEST.plugin_id,
        status: 'ready',
        execution_mode: MANIFEST.execution_mode,
        managed_by: MANIFEST.managed_by || 'local-api-core',
        note: 'This shell exposes planning and status metadata. Runtime SAM execution is delegated to local-api workflow executors.',
      };
    case 'plan_segment':
    case 'dry_run':
      return {
        plugin_id: MANIFEST.plugin_id,
        dry_run: true,
        image_id: params.image_id || null,
        detection_box_count: Array.isArray(params.detection_boxes) ? params.detection_boxes.length : 0,
        planned_steps: ['sam_handoff', 'sam_segment', 'artifact_register'],
        side_effects: [],
      };
    case 'ping':
      return { ok: true, plugin_id: MANIFEST.plugin_id, timestamp: new Date().toISOString() };
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

module.exports = { manifest: MANIFEST, execute };
