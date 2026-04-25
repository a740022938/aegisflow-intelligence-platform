import type { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/builtin-sqlite.js';

export function registerExperimentCompareRoutes(app: FastifyInstance) {
  const db = getDatabase();

  app.get('/api/experiments/compare', async (request: any, reply: any) => {
    const ids = request.query?.ids || '';
    const idList = ids.split(',').filter(Boolean);
    if (idList.length < 2) return reply.code(400).send({ ok: false, error: '至少选择 2 个实验进行对比, 用逗号分隔 ids 参数' });

    const experiments = idList.map((id: string) => {
      const exp = db.prepare('SELECT * FROM experiments WHERE id = ?').get(id.trim()) as any;
      if (!exp) return null;
      const evals = db.prepare("SELECT * FROM evaluations WHERE experiment_id = ? OR source_experiment_id = ? ORDER BY created_at DESC").all(id.trim(), id.trim());
      const metrics = evals.flatMap((e: any) => {
        if (e.metrics_json) { try { return [{ evaluation_id: e.id, ...JSON.parse(e.metrics_json) }]; } catch { } }
        return [];
      });
      const model = db.prepare('SELECT id, name, version FROM models WHERE source_experiment_id = ? ORDER BY created_at DESC LIMIT 1').get(id.trim()) as any;
      return { experiment: { id: exp.id, name: exp.name, status: exp.status, created_at: exp.created_at }, metrics, model };
    }).filter(Boolean);

    if (experiments.length < 2) return reply.code(400).send({ ok: false, error: '有效的实验不足 2 个' });

    const allMetrics = new Set<string>();
    experiments.forEach((e: any) => e.metrics?.forEach((m: any) => Object.keys(m).forEach(k => { if (k !== 'evaluation_id') allMetrics.add(k); })));

    return {
      ok: true,
      compare_count: experiments.length,
      metrics_available: [...allMetrics],
      experiments,
      recommendation: generateRecommendation(experiments),
    };
  });

  app.get('/api/experiments/summary', async (_request, reply) => {
    const exps = db.prepare(`
      SELECT e.id, e.name, e.status, e.created_at,
        (SELECT COUNT(*) FROM evaluations WHERE experiment_id = e.id) as eval_count,
        (SELECT name FROM models WHERE source_experiment_id = e.id ORDER BY created_at DESC LIMIT 1) as model_name
      FROM experiments e ORDER BY e.created_at DESC LIMIT 50
    `).all();
    return { ok: true, experiments: exps, count: exps.length };
  });
}

function generateRecommendation(experiments: any[]): string {
  const best = experiments.reduce((best: any, e: any) => {
    if (!e.metrics?.length) return best;
    const bestMetric = e.metrics.reduce((a: any, b: any) => (a.f1_score || a.mAP || 0) > (b.f1_score || b.mAP || 0) ? a : b);
    return (!best || (bestMetric.mAP || bestMetric.f1_score || 0) > (best.best?.mAP || best.best?.f1_score || 0))
      ? { experiment: e.experiment, best: bestMetric } : best;
  }, null);

  return best ? `推荐模型: ${best.experiment.name} (mAP=${best.best.mAP || 'N/A'}, F1=${best.best.f1_score || 'N/A'})` : '数据不足，无法推荐';
}
