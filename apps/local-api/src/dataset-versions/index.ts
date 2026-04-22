import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getDatabase } from '../db/builtin-sqlite.js';
import { randomUUID } from 'crypto';

const db = getDatabase();

// Validation schemas
const createDatasetVersionSchema = z.object({
  dataset_id: z.string().uuid(),
  version: z.string().min(1),
  task_type: z.enum(['detection', 'classification', 'segmentation']),
  label_format: z.enum(['yolo', 'coco', 'coco_person']),
  description: z.string().optional(),
  source_chain_json: z.string().optional(),
  quality_chain_json: z.string().optional(),
  governance_chain_json: z.string().optional(),
  sample_count: z.number().int().optional(),
  train_count: z.number().int().optional(),
  val_count: z.number().int().optional(),
  test_count: z.number().int().optional(),
  class_count: z.number().int().optional(),
  storage_path: z.string().optional(),
  created_by: z.string().optional(),
});

const updateDatasetVersionSchema = z.object({
  status: z.enum(['draft', 'pending_review', 'approved', 'rejected', 'active', 'deprecated']).optional(),
  description: z.string().optional(),
  source_chain_json: z.string().optional(),
  quality_chain_json: z.string().optional(),
  governance_chain_json: z.string().optional(),
  sample_count: z.number().int().optional(),
  train_count: z.number().int().optional(),
  val_count: z.number().int().optional(),
  test_count: z.number().int().optional(),
  class_count: z.number().int().optional(),
  storage_path: z.string().optional(),
  split_manifest_path: z.string().optional(),
  dataset_yaml_path: z.string().optional(),
});

const createBatchSchema = z.object({
  dataset_version_id: z.string().uuid(),
  batch_type: z.enum(['video', 'frame', 'yolo', 'classifier', 'sam', 'review']),
  batch_id: z.string(),
  batch_status: z.string().optional(),
  record_count: z.number().int().optional(),
});

const createNegativePoolSchema = z.object({
  dataset_version_id: z.string().uuid(),
  pool_version: z.string(),
  rejection_reason: z.enum(['classifier_reject', 'human_reject', 'quality_fail']),
  source_batch_type: z.string(),
  source_batch_id: z.string(),
  sample_identifier: z.string(),
  label_data: z.string().optional(),
  rejection_metadata: z.string().optional(),
});

const updateApprovalSchema = z.object({
  approval_status: z.enum(['pending', 'approved', 'rejected']),
  approver_id: z.string().optional(),
  approver_name: z.string().optional(),
  approval_comment: z.string().optional(),
  gate_level: z.enum(['evaluation_ready', 'artifact_ready', 'promotion_ready']).optional(),
  gate_checks_json: z.string().optional(),
});

// Helper to parse JSON fields
function parseJsonFields(row: any, fields: string[]) {
  const result = { ...row };
  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string') {
      try {
        result[field] = JSON.parse(result[field]);
      } catch {
        // Keep as string if parsing fails
      }
    }
  }
  return result;
}

// E1: Generate retrain bundle
export async function generateRetrainBundle(id: string, body: any) {
  const db = getDatabase();
  const dv = db.prepare('SELECT * FROM dataset_versions WHERE id = ?').get(id) as any;
  if (!dv) return { ok: false, error: `Dataset version ${id} not found` };
  
  const bundleId = crypto.randomUUID();
  const now = new Date().toISOString();
  
  // Parse source chain to get reflux info
  const sourceChain = dv.source_chain_json ? JSON.parse(dv.source_chain_json) : {};
  
  // Determine training config based on sample count
  const sampleCount = dv.sample_count || 0;
  const epochs = body.epochs || (sampleCount > 100 ? 30 : 50);
  const batchSize = body.batch_size || (sampleCount > 50 ? 8 : 4);
  
  // Evaluate trigger conditions
  const triggerConditions = {
    badcase_rate_threshold: { threshold: 0.05, actual: sourceChain.badcase_rate || 0, passed: (sourceChain.badcase_rate || 0) > 0.05 },
    critical_samples_threshold: { threshold: 5, actual: sourceChain.critical_samples || 0, passed: (sourceChain.critical_samples || 0) >= 5 },
    total_candidates_threshold: { threshold: 10, actual: sampleCount, passed: sampleCount >= 10 },
  };
  
  const triggerConditionMet = triggerConditions.total_candidates_threshold.passed;
  
  // Get negative pool entries
  const npEntries = db.prepare(
    'SELECT COUNT(*) as cnt FROM negative_pools WHERE dataset_version_id = ?'
  ).get(id) as any;
  
  // Get review pack entries
  const rpItems = db.prepare(
    'SELECT COUNT(*) as cnt FROM review_pack_items WHERE review_pack_id IN (SELECT id FROM review_packs WHERE dataset_version_id = ?)'
  ).get(id) as any;
  
  // Get production badcases
  const pbItems = db.prepare(
    'SELECT COUNT(*) as cnt FROM production_badcases WHERE model_id = ? AND status = ?'
  ).get(sourceChain.production_model || '', 'pending') as any;
  
  const bundle = {
    bundle_id: bundleId,
    dataset_version_id: id,
    dataset_version: dv.version,
    parent_dataset_version_id: sourceChain.parent || null,
    reflux_sources: {
      production_badcases: pbItems?.cnt || 0,
      negative_pool: npEntries?.cnt || 0,
      review_pack: rpItems?.cnt || 0,
    },
    training_samples: {
      from_parent: dv.train_count || 0,
      from_badcases: pbItems?.cnt || 0,
      total: (dv.train_count || 0) + (pbItems?.cnt || 0),
    },
    negative_samples: npEntries?.cnt || 0,
    training_config: {
      epochs,
      batch_size: batchSize,
      recommended_epochs: 50,
      recommended_batch_size: 4,
    },
    trigger_conditions: triggerConditions,
    trigger_condition_met: triggerConditionMet,
    trigger_reason: triggerConditionMet 
      ? 'total_candidates exceeded threshold (>=10)' 
      : 'below trigger threshold',
    recommended_action: triggerConditionMet 
      ? 'ready_for_retraining' 
      : 'continue_production_monitoring',
    created_at: now,
  };
  
  // Store bundle metadata in dataset_versions metadata or as a separate record
  return { ok: true, bundle };
}

export async function registerDatasetVersionRoutes(app: FastifyInstance) {
  // ═══════════════════════════════════════════════════════════════════════
  // Dataset Versions CRUD
  // ═══════════════════════════════════════════════════════════════════════

  // List dataset versions
  app.get('/api/dataset-versions', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { dataset_id, status, limit = '50', offset = '0' } = req.query as any;
      
      let sql = 'SELECT * FROM dataset_versions WHERE 1=1';
      const params: any[] = [];
      
      if (dataset_id) {
        sql += ' AND dataset_id = ?';
        params.push(dataset_id);
      }
      if (status) {
        sql += ' AND status = ?';
        params.push(status);
      }
      
      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));
      
      const rows = db.prepare(sql).all(...params);
      const versions = rows.map((row: any) => 
        parseJsonFields(row, ['source_chain_json', 'quality_chain_json', 'governance_chain_json'])
      );
      
      return { ok: true, versions, count: versions.length };
    } catch (error) {
      return reply.status(500).send({ ok: false, error: String(error) });
    }
  });

  // Get single dataset version
  app.get('/api/dataset-versions/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as { id: string };
      const row = db.prepare('SELECT * FROM dataset_versions WHERE id = ?').get(id) as any;
      
      if (!row) {
        return reply.status(404).send({ ok: false, error: 'Dataset version not found' });
      }
      
      // Get associated batches
      const batches = db.prepare('SELECT * FROM dataset_version_batches WHERE dataset_version_id = ?').all(id);
      
      // Get negative pool count
      const negCount = db.prepare('SELECT COUNT(*) as count FROM negative_pools WHERE dataset_version_id = ?').get(id) as any;
      
      // Get approval status
      const approval = db.prepare('SELECT * FROM dataset_version_approvals WHERE dataset_version_id = ?').get(id);
      
      const version = parseJsonFields(row, ['source_chain_json', 'quality_chain_json', 'governance_chain_json']);
      
      return { 
        ok: true, 
        version,
        batches,
        negative_pool_count: negCount?.count || 0,
        approval,
      };
    } catch (error) {
      return reply.status(500).send({ ok: false, error: String(error) });
    }
  });

  // Create dataset version
  app.post('/api/dataset-versions', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = createDatasetVersionSchema.parse(req.body);
      const id = randomUUID();
      const now = new Date().toISOString();
      
      db.prepare(`
        INSERT INTO dataset_versions (
          id, dataset_id, version, status, task_type, label_format,
          source_chain_json, quality_chain_json, governance_chain_json,
          sample_count, train_count, val_count, test_count, class_count,
          storage_path, description, created_at, updated_at, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        data.dataset_id,
        data.version,
        'draft',
        data.task_type,
        data.label_format,
        data.source_chain_json || '{}',
        data.quality_chain_json || '{}',
        data.governance_chain_json || '{}',
        data.sample_count || 0,
        data.train_count || 0,
        data.val_count || 0,
        data.test_count || 0,
        data.class_count || 0,
        data.storage_path || '',
        data.description || '',
        now,
        now,
        data.created_by || ''
      );
      
      // Create initial approval record
      db.prepare(`
        INSERT INTO dataset_version_approvals (
          id, dataset_version_id, approval_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?)
      `).run(randomUUID(), id, 'pending', now, now);
      
      const row = db.prepare('SELECT * FROM dataset_versions WHERE id = ?').get(id);
      return { ok: true, version: row };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ ok: false, error: error.errors });
      }
      return reply.status(500).send({ ok: false, error: String(error) });
    }
  });

  // Update dataset version
  app.patch('/api/dataset-versions/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as { id: string };
      const data = updateDatasetVersionSchema.parse(req.body);
      const now = new Date().toISOString();
      
      const updates: string[] = [];
      const values: any[] = [];
      
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      }
      
      if (updates.length === 0) {
        return reply.status(400).send({ ok: false, error: 'No fields to update' });
      }
      
      updates.push('updated_at = ?');
      values.push(now);
      values.push(id);
      
      db.prepare(`UPDATE dataset_versions SET ${updates.join(', ')} WHERE id = ?`).run(...values);
      
      const row = db.prepare('SELECT * FROM dataset_versions WHERE id = ?').get(id);
      return { ok: true, version: parseJsonFields(row, ['source_chain_json', 'quality_chain_json', 'governance_chain_json']) };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ ok: false, error: error.errors });
      }
      return reply.status(500).send({ ok: false, error: String(error) });
    }
  });

  // Delete dataset version
  app.delete('/api/dataset-versions/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as { id: string };
      
      // Delete related records first
      db.prepare('DELETE FROM dataset_version_batches WHERE dataset_version_id = ?').run(id);
      db.prepare('DELETE FROM negative_pools WHERE dataset_version_id = ?').run(id);
      db.prepare('DELETE FROM dataset_version_approvals WHERE dataset_version_id = ?').run(id);
      
      // Delete the version
      const result = db.prepare('DELETE FROM dataset_versions WHERE id = ?').run(id);
      
      if (result.changes === 0) {
        return reply.status(404).send({ ok: false, error: 'Dataset version not found' });
      }
      
      return { ok: true, message: 'Dataset version deleted' };
    } catch (error) {
      return reply.status(500).send({ ok: false, error: String(error) });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Batch Linkage
  // ═══════════════════════════════════════════════════════════════════════

  // Add batch to dataset version
  app.post('/api/dataset-versions/:id/batches', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as { id: string };
      const body = (req.body && typeof req.body === 'object') ? req.body as Record<string, any> : {};
      const data = createBatchSchema.parse({ ...body, dataset_version_id: id });
      const batchId = randomUUID();
      const now = new Date().toISOString();
      
      db.prepare(`
        INSERT INTO dataset_version_batches (
          id, dataset_version_id, batch_type, batch_id, batch_status, record_count, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(batchId, data.dataset_version_id, data.batch_type, data.batch_id, data.batch_status || '', data.record_count || 0, now);
      
      const row = db.prepare('SELECT * FROM dataset_version_batches WHERE id = ?').get(batchId);
      return { ok: true, batch: row };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ ok: false, error: error.errors });
      }
      return reply.status(500).send({ ok: false, error: String(error) });
    }
  });

  // List batches for dataset version
  app.get('/api/dataset-versions/:id/batches', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as { id: string };
      const rows = db.prepare('SELECT * FROM dataset_version_batches WHERE dataset_version_id = ? ORDER BY created_at').all(id);
      return { ok: true, batches: rows, count: rows.length };
    } catch (error) {
      return reply.status(500).send({ ok: false, error: String(error) });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Negative Pool
  // ═══════════════════════════════════════════════════════════════════════

  // Add negative pool entry
  app.post('/api/dataset-versions/:id/negative-pools', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as { id: string };
      const body = (req.body && typeof req.body === 'object') ? req.body as Record<string, any> : {};
      const data = createNegativePoolSchema.parse({ ...body, dataset_version_id: id });
      const poolId = randomUUID();
      const now = new Date().toISOString();
      
      db.prepare(`
        INSERT INTO negative_pools (
          id, dataset_version_id, pool_version, rejection_reason, source_batch_type,
          source_batch_id, sample_identifier, label_data, rejection_metadata, reused_count, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
      `).run(
        poolId,
        data.dataset_version_id,
        data.pool_version,
        data.rejection_reason,
        data.source_batch_type,
        data.source_batch_id,
        data.sample_identifier,
        data.label_data || '{}',
        data.rejection_metadata || '{}',
        now
      );
      
      const row = db.prepare('SELECT * FROM negative_pools WHERE id = ?').get(poolId);
      return { ok: true, negative_pool: row };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ ok: false, error: error.errors });
      }
      return reply.status(500).send({ ok: false, error: String(error) });
    }
  });

  // List negative pools for dataset version
  app.get('/api/dataset-versions/:id/negative-pools', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as { id: string };
      const { rejection_reason } = req.query as any;
      
      let sql = 'SELECT * FROM negative_pools WHERE dataset_version_id = ?';
      const params: any[] = [id];
      
      if (rejection_reason) {
        sql += ' AND rejection_reason = ?';
        params.push(rejection_reason);
      }
      
      sql += ' ORDER BY created_at DESC';
      
      const rows = db.prepare(sql).all(...params);
      return { ok: true, negative_pools: rows, count: rows.length };
    } catch (error) {
      return reply.status(500).send({ ok: false, error: String(error) });
    }
  });

  // Mark negative pool as reused
  app.patch('/api/negative-pools/:id/reuse', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as { id: string };
      const now = new Date().toISOString();
      
      db.prepare('UPDATE negative_pools SET reused_count = reused_count + 1, last_reused_at = ? WHERE id = ?').run(now, id);
      
      const row = db.prepare('SELECT * FROM negative_pools WHERE id = ?').get(id);
      if (!row) {
        return reply.status(404).send({ ok: false, error: 'Negative pool entry not found' });
      }
      
      return { ok: true, negative_pool: row };
    } catch (error) {
      return reply.status(500).send({ ok: false, error: String(error) });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Approval / Governance
  // ═══════════════════════════════════════════════════════════════════════

  // Get approval status
  app.get('/api/dataset-versions/:id/approval', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as { id: string };
      const row = db.prepare('SELECT * FROM dataset_version_approvals WHERE dataset_version_id = ?').get(id);
      
      if (!row) {
        return reply.status(404).send({ ok: false, error: 'Approval record not found' });
      }
      
      return { ok: true, approval: parseJsonFields(row, ['gate_checks_json']) };
    } catch (error) {
      return reply.status(500).send({ ok: false, error: String(error) });
    }
  });

  // Update approval status
  app.patch('/api/dataset-versions/:id/approval', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as { id: string };
      const data = updateApprovalSchema.parse(req.body);
      const now = new Date().toISOString();
      
      const updates: string[] = [];
      const values: any[] = [];
      
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      }
      
      if (updates.length === 0) {
        return reply.status(400).send({ ok: false, error: 'No fields to update' });
      }
      
      updates.push('updated_at = ?');
      values.push(now);
      values.push(id);
      
      db.prepare(`UPDATE dataset_version_approvals SET ${updates.join(', ')} WHERE dataset_version_id = ?`).run(...values);
      
      // If approved, update dataset_version status
      if (data.approval_status === 'approved') {
        db.prepare('UPDATE dataset_versions SET status = ? WHERE id = ?').run('approved', id);
      } else if (data.approval_status === 'rejected') {
        db.prepare('UPDATE dataset_versions SET status = ? WHERE id = ?').run('rejected', id);
      }
      
      const row = db.prepare('SELECT * FROM dataset_version_approvals WHERE dataset_version_id = ?').get(id);
      return { ok: true, approval: parseJsonFields(row, ['gate_checks_json']) };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ ok: false, error: error.errors });
      }
      return reply.status(500).send({ ok: false, error: String(error) });
    }
  });

  // E1: Generate retrain bundle
  app.post('/api/dataset-versions/:id/retrain-bundle', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as { id: string };
      const body = (req.body && typeof req.body === 'object') ? req.body : {};
      const r = await generateRetrainBundle(id, body);
      return r.ok ? r : reply.status(400).send(r);
    } catch (error) {
      return reply.status(500).send({ ok: false, error: String(error) });
    }
  });
}
