import type { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/builtin-sqlite.js';

export function registerModelLineageRoutes(app: FastifyInstance) {
  const db = getDatabase();

  app.get('/api/models/:id/lineage', async (request: any, reply: any) => {
    const { id } = request.params;
    const model = db.prepare('SELECT model_id as id, name, version, created_at, source_experiment_id, artifact_path, metrics_snapshot_json FROM models WHERE model_id = ?').get(id) as any;
    if (!model) return reply.code(404).send({ ok: false, error: 'model not found' });

    const lineage: any = { model, parents: [] as any[], children: [] as any[], distill: [] as any[], merges: [] as any[] };

    // Find parents (what was this model trained from?)
    const trainFrom = db.prepare('SELECT source_job_id, source_dataset_id FROM storage_models WHERE id = ?').all(id);
    lineage.parents = trainFrom;

    // Find children (what models were derived from this one?)
    const distillFrom = db.prepare("SELECT id, name, student_architecture FROM training_v2_distill_jobs WHERE teacher_model_id = ? AND status = 'completed'").all(id);
    lineage.distill = distillFrom;

    const mergedFrom = db.prepare("SELECT id, name, model_ids FROM training_v2_merge_jobs WHERE model_ids LIKE ? AND status = 'completed'").all(`%${id}%`);
    lineage.merges = mergedFrom;

    // Find training job detail
    const exp = db.prepare('SELECT * FROM experiments WHERE id = ?').get(model.source_experiment_id || '') as any;
    if (exp) lineage.experiment = { id: exp.id, name: exp.name, status: exp.status };

    // Find deployment history
    const deployments = db.prepare('SELECT * FROM deploy_endpoints WHERE model_id = ?').all(id);
    lineage.deployments = deployments;

    return { ok: true, id, lineage };
  });

  app.get('/api/models/registry', async (request: any, reply: any) => {
    const limit = Math.min(Number(request.query?.limit || 50), 200);
    const rows = db.prepare(`
      SELECT m.model_id as id, m.name, m.version, m.created_at,
        (SELECT COUNT(*) FROM training_v2_distill_jobs WHERE teacher_model_id = m.model_id) as distill_count,
        (SELECT COUNT(*) FROM deploy_endpoints WHERE model_id = m.model_id) as deploy_count
      FROM models m WHERE m.status = 'ready' OR m.status = 'published'
      ORDER BY m.created_at DESC LIMIT ?
    `).all(limit);
    return { ok: true, registry: rows, count: rows.length };
  });
}
