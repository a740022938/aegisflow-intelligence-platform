import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getDatabase } from '../db/builtin-sqlite.js';
import { randomUUID } from 'crypto';
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import os from 'os';

const db = getDatabase();

// ─── B3: classifier_results table ─────────────────────────────────────────
const _ensureClassifierResultsTable = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS classifier_results (
      id                    TEXT    PRIMARY KEY,
      yolo_annotation_id    TEXT,
      frame_batch_id       TEXT,
      video_batch_id       TEXT,
      crop_path            TEXT,
      crop_x1              INTEGER,
      crop_y1              INTEGER,
      crop_x2              INTEGER,
      crop_y2              INTEGER,
      yolo_original_class  TEXT,
      yolo_original_conf  REAL,
      classifier_model_path TEXT   DEFAULT 'E:/mahjong_vision_strongest',
      model_type           TEXT   DEFAULT 'ViT-B/16',
      execution_mode       TEXT   DEFAULT 'real',
      predicted_class_id  INTEGER,
      predicted_label      TEXT,
      confidence           REAL,
      is_accepted          INTEGER DEFAULT 0,
      rejection_reason     TEXT,
      top5_json            TEXT,
      infer_time_ms        INTEGER,
      dataset_version_id   TEXT,
      created_at          TEXT   DEFAULT (datetime('now'))
    )
  `);
};
_ensureClassifierResultsTable();

// Validation schemas - matching actual DB schema
const createVideoBatchSchema = z.object({
  batch_code: z.string().min(1),
  source_type: z.enum(['upload', 'stream', 'api', 'sync']).optional(),
  source_url: z.string().optional(),
  total_frames: z.number().int().min(0).optional(),
  duration_seconds: z.number().min(0).optional(),
  resolution: z.string().optional(),
  fps: z.number().min(0).optional(),
  metadata_json: z.string().optional(),
});

const updateVideoBatchSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'archived']).optional(),
  total_frames: z.number().int().min(0).optional(),
  duration_seconds: z.number().min(0).optional(),
  resolution: z.string().optional(),
  fps: z.number().min(0).optional(),
  metadata_json: z.string().optional(),
});

const createFrameExtractionSchema = z.object({
  video_batch_id: z.string().uuid(),
  extraction_config_json: z.string().optional(),
  total_frames: z.number().int().min(0).optional(),
  output_path: z.string().optional(),
});

const updateFrameExtractionSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
  total_frames: z.number().int().min(0).optional(),
  output_path: z.string().optional(),
  extraction_config_json: z.string().optional(),
});

const createYoloAnnotationSchema = z.object({
  frame_extraction_id: z.string().uuid(),
  model_id: z.string().optional(),
  annotation_data_json: z.string().min(1), // Array of detections
  total_boxes: z.number().int().min(0).optional(),
});

const updateYoloAnnotationSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'filtered', 'approved']).optional(),
  annotation_data_json: z.string().optional(),
  model_id: z.string().optional(),
  total_boxes: z.number().int().min(0).optional(),
});

const createReviewPackSchema = z.object({
  dataset_version_id: z.string().uuid().optional(),
  pack_type: z.enum(['human_review', 'yolo_filter', 'classifier_filter', 'sam_refinement', 'final_review']).optional(),
  total_samples: z.number().int().min(0).optional(),
  reviewer_assignee: z.string().optional(),
});

const updateReviewPackSchema = z.object({
  status: z.enum(['pending', 'assigned', 'in_progress', 'completed', 'rejected']).optional(),
  total_samples: z.number().int().min(0).optional(),
  reviewed_samples: z.number().int().min(0).optional(),
  approved_samples: z.number().int().min(0).optional(),
  rejected_samples: z.number().int().min(0).optional(),
  reviewer_assignee: z.string().optional(),
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

export async function registerDataChainRoutes(app: FastifyInstance) {
  // ═══════════════════════════════════════════════════════════════════════
  // Video Batches CRUD
  // ═══════════════════════════════════════════════════════════════════════

  // List video batches
  app.get('/api/video-batches', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { status, source_type, limit = '50', offset = '0' } = req.query as any;
      
      let sql = 'SELECT * FROM video_batches WHERE 1=1';
      const params: any[] = [];
      
      if (status) {
        sql += ' AND status = ?';
        params.push(status);
      }
      if (source_type) {
        sql += ' AND source_type = ?';
        params.push(source_type);
      }
      
      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));
      
      const rows = db.prepare(sql).all(...params);
      return { ok: true, video_batches: rows.map((r: any) => parseJsonFields(r, ['metadata_json'])), count: rows.length };
    } catch (error) {
      return reply.status(500).send({ ok: false, error: String(error) });
    }
  });

  // Get single video batch
  app.get('/api/video-batches/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as { id: string };
      const row = db.prepare('SELECT * FROM video_batches WHERE id = ?').get(id);
      if (!row) {
        return reply.status(404).send({ ok: false, error: 'Video batch not found' });
      }
      return { ok: true, video_batch: parseJsonFields(row, ['metadata_json']) };
    } catch (error) {
      return reply.status(500).send({ ok: false, error: String(error) });
    }
  });

  // Create video batch
  app.post('/api/video-batches', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = createVideoBatchSchema.parse(req.body);
      const id = randomUUID();
      const now = new Date().toISOString();
      
      db.prepare(`
        INSERT INTO video_batches (
          id, batch_code, source_type, source_url, total_frames, duration_seconds,
          resolution, fps, status, metadata_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, body.batch_code, body.source_type || 'upload', body.source_url || '',
        body.total_frames || 0, body.duration_seconds || 0, body.resolution || '',
        body.fps || 0, 'pending', body.metadata_json || '{}', now, now
      );
      
      const row = db.prepare('SELECT * FROM video_batches WHERE id = ?').get(id);
      return { ok: true, video_batch: parseJsonFields(row, ['metadata_json']) };
    } catch (error) {
      return reply.status(400).send({ ok: false, error: String(error) });
    }
  });

  // Update video batch
  app.patch('/api/video-batches/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as { id: string };
      const body = updateVideoBatchSchema.parse(req.body);
      const now = new Date().toISOString();
      
      const sets: string[] = ['updated_at = ?'];
      const params: any[] = [now];
      
      if (body.status !== undefined) { sets.push('status = ?'); params.push(body.status); }
      if (body.total_frames !== undefined) { sets.push('total_frames = ?'); params.push(body.total_frames); }
      if (body.duration_seconds !== undefined) { sets.push('duration_seconds = ?'); params.push(body.duration_seconds); }
      if (body.resolution !== undefined) { sets.push('resolution = ?'); params.push(body.resolution); }
      if (body.fps !== undefined) { sets.push('fps = ?'); params.push(body.fps); }
      if (body.metadata_json !== undefined) { sets.push('metadata_json = ?'); params.push(body.metadata_json); }
      
      params.push(id);
      db.prepare(`UPDATE video_batches SET ${sets.join(', ')} WHERE id = ?`).run(...params);
      
      const row = db.prepare('SELECT * FROM video_batches WHERE id = ?').get(id);
      if (!row) {
        return reply.status(404).send({ ok: false, error: 'Video batch not found' });
      }
      return { ok: true, video_batch: parseJsonFields(row, ['metadata_json']) };
    } catch (error) {
      return reply.status(400).send({ ok: false, error: String(error) });
    }
  });

  // Delete video batch
  app.delete('/api/video-batches/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as { id: string };
      const result = db.prepare('DELETE FROM video_batches WHERE id = ?').run(id);
      if (result.changes === 0) {
        return reply.status(404).send({ ok: false, error: 'Video batch not found' });
      }
      return { ok: true, message: 'Video batch deleted' };
    } catch (error) {
      return reply.status(500).send({ ok: false, error: String(error) });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Frame Extractions CRUD
  // ═══════════════════════════════════════════════════════════════════════

  // List frame extractions
  app.get('/api/frame-extractions', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { video_batch_id, status, limit = '50', offset = '0' } = req.query as any;
      
      let sql = 'SELECT * FROM frame_extractions WHERE 1=1';
      const params: any[] = [];
      
      if (video_batch_id) {
        sql += ' AND video_batch_id = ?';
        params.push(video_batch_id);
      }
      if (status) {
        sql += ' AND status = ?';
        params.push(status);
      }
      
      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));
      
      const rows = db.prepare(sql).all(...params);
      return { ok: true, frame_extractions: rows.map((r: any) => parseJsonFields(r, ['extraction_config_json'])), count: rows.length };
    } catch (error) {
      return reply.status(500).send({ ok: false, error: String(error) });
    }
  });

  // Get single frame extraction
  app.get('/api/frame-extractions/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as { id: string };
      const row = db.prepare('SELECT * FROM frame_extractions WHERE id = ?').get(id);
      if (!row) {
        return reply.status(404).send({ ok: false, error: 'Frame extraction not found' });
      }
      return { ok: true, frame_extraction: parseJsonFields(row, ['extraction_config_json']) };
    } catch (error) {
      return reply.status(500).send({ ok: false, error: String(error) });
    }
  });

  // Create frame extraction
  app.post('/api/frame-extractions', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = createFrameExtractionSchema.parse(req.body);
      const id = randomUUID();
      const now = new Date().toISOString();
      
      db.prepare(`
        INSERT INTO frame_extractions (
          id, video_batch_id, extraction_config_json, total_frames, output_path, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, body.video_batch_id, body.extraction_config_json || '{}', body.total_frames || 0,
        body.output_path || '', 'pending', now, now
      );
      
      const row = db.prepare('SELECT * FROM frame_extractions WHERE id = ?').get(id);
      return { ok: true, frame_extraction: parseJsonFields(row, ['extraction_config_json']) };
    } catch (error) {
      return reply.status(400).send({ ok: false, error: String(error) });
    }
  });

  // Update frame extraction
  app.patch('/api/frame-extractions/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as { id: string };
      const body = updateFrameExtractionSchema.parse(req.body);
      const now = new Date().toISOString();
      
      const sets: string[] = ['updated_at = ?'];
      const params: any[] = [now];
      
      if (body.status !== undefined) { sets.push('status = ?'); params.push(body.status); }
      if (body.total_frames !== undefined) { sets.push('total_frames = ?'); params.push(body.total_frames); }
      if (body.output_path !== undefined) { sets.push('output_path = ?'); params.push(body.output_path); }
      if (body.extraction_config_json !== undefined) { sets.push('extraction_config_json = ?'); params.push(body.extraction_config_json); }
      
      params.push(id);
      db.prepare(`UPDATE frame_extractions SET ${sets.join(', ')} WHERE id = ?`).run(...params);
      
      const row = db.prepare('SELECT * FROM frame_extractions WHERE id = ?').get(id);
      if (!row) {
        return reply.status(404).send({ ok: false, error: 'Frame extraction not found' });
      }
      return { ok: true, frame_extraction: parseJsonFields(row, ['extraction_config_json']) };
    } catch (error) {
      return reply.status(400).send({ ok: false, error: String(error) });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════
  // YOLO Annotations CRUD
  // ═══════════════════════════════════════════════════════════════════════

  // List YOLO annotations
  app.get('/api/yolo-annotations', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { frame_extraction_id, status, limit = '50', offset = '0' } = req.query as any;
      
      let sql = 'SELECT * FROM yolo_annotations WHERE 1=1';
      const params: any[] = [];
      
      if (frame_extraction_id) {
        sql += ' AND frame_extraction_id = ?';
        params.push(frame_extraction_id);
      }
      if (status) {
        sql += ' AND status = ?';
        params.push(status);
      }
      
      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));
      
      const rows = db.prepare(sql).all(...params);
      return { ok: true, yolo_annotations: rows.map((r: any) => parseJsonFields(r, ['annotation_data_json'])), count: rows.length };
    } catch (error) {
      return reply.status(500).send({ ok: false, error: String(error) });
    }
  });

  // Get single YOLO annotation
  app.get('/api/yolo-annotations/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as { id: string };
      const row = db.prepare('SELECT * FROM yolo_annotations WHERE id = ?').get(id);
      if (!row) {
        return reply.status(404).send({ ok: false, error: 'YOLO annotation not found' });
      }
      return { ok: true, yolo_annotation: parseJsonFields(row, ['annotation_data_json']) };
    } catch (error) {
      return reply.status(500).send({ ok: false, error: String(error) });
    }
  });

  // Create YOLO annotation
  app.post('/api/yolo-annotations', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = createYoloAnnotationSchema.parse(req.body);
      const id = randomUUID();
      const now = new Date().toISOString();
      
      // Parse to count boxes
      let totalBoxes = body.total_boxes || 0;
      if (!totalBoxes && body.annotation_data_json) {
        try {
          const data = JSON.parse(body.annotation_data_json);
          totalBoxes = Array.isArray(data) ? data.length : 0;
        } catch {}
      }
      
      db.prepare(`
        INSERT INTO yolo_annotations (
          id, frame_extraction_id, model_id, annotation_data_json, total_boxes, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, body.frame_extraction_id, body.model_id || '', body.annotation_data_json,
        totalBoxes, 'completed', now, now
      );
      
      const row = db.prepare('SELECT * FROM yolo_annotations WHERE id = ?').get(id);
      return { ok: true, yolo_annotation: parseJsonFields(row, ['annotation_data_json']) };
    } catch (error) {
      return reply.status(400).send({ ok: false, error: String(error) });
    }
  });

  // Update YOLO annotation
  app.patch('/api/yolo-annotations/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as { id: string };
      const body = updateYoloAnnotationSchema.parse(req.body);
      const now = new Date().toISOString();
      
      const sets: string[] = ['updated_at = ?'];
      const params: any[] = [now];
      
      if (body.status !== undefined) { sets.push('status = ?'); params.push(body.status); }
      if (body.annotation_data_json !== undefined) { sets.push('annotation_data_json = ?'); params.push(body.annotation_data_json); }
      if (body.model_id !== undefined) { sets.push('model_id = ?'); params.push(body.model_id); }
      if (body.total_boxes !== undefined) { sets.push('total_boxes = ?'); params.push(body.total_boxes); }
      
      params.push(id);
      db.prepare(`UPDATE yolo_annotations SET ${sets.join(', ')} WHERE id = ?`).run(...params);
      
      const row = db.prepare('SELECT * FROM yolo_annotations WHERE id = ?').get(id);
      if (!row) {
        return reply.status(404).send({ ok: false, error: 'YOLO annotation not found' });
      }
      return { ok: true, yolo_annotation: parseJsonFields(row, ['annotation_data_json']) };
    } catch (error) {
      return reply.status(400).send({ ok: false, error: String(error) });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Review Packs CRUD
  // ═══════════════════════════════════════════════════════════════════════

  // List review packs
  app.get('/api/review-packs', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { dataset_version_id, status, reviewer_assignee, limit = '50', offset = '0' } = req.query as any;
      
      let sql = 'SELECT * FROM review_packs WHERE 1=1';
      const params: any[] = [];
      
      if (dataset_version_id) {
        sql += ' AND dataset_version_id = ?';
        params.push(dataset_version_id);
      }
      if (status) {
        sql += ' AND status = ?';
        params.push(status);
      }
      if (reviewer_assignee) {
        sql += ' AND reviewer_assignee = ?';
        params.push(reviewer_assignee);
      }
      
      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));
      
      const rows = db.prepare(sql).all(...params);
      return { ok: true, review_packs: rows, count: rows.length };
    } catch (error) {
      return reply.status(500).send({ ok: false, error: String(error) });
    }
  });

  // Get single review pack
  app.get('/api/review-packs/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as { id: string };
      const row = db.prepare('SELECT * FROM review_packs WHERE id = ?').get(id);
      if (!row) {
        return reply.status(404).send({ ok: false, error: 'Review pack not found' });
      }
      return { ok: true, review_pack: row };
    } catch (error) {
      return reply.status(500).send({ ok: false, error: String(error) });
    }
  });

  // Create review pack
  app.post('/api/review-packs', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = createReviewPackSchema.parse(req.body);
      const id = randomUUID();
      const now = new Date().toISOString();
      
      db.prepare(`
        INSERT INTO review_packs (
          id, dataset_version_id, pack_type, total_samples, reviewed_samples, approved_samples, rejected_samples,
          status, reviewer_assignee, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, body.dataset_version_id || '', body.pack_type || 'human_review', body.total_samples || 0,
        0, 0, 0, 'pending', body.reviewer_assignee || '', now, now
      );
      
      const row = db.prepare('SELECT * FROM review_packs WHERE id = ?').get(id);
      return { ok: true, review_pack: row };
    } catch (error) {
      return reply.status(400).send({ ok: false, error: String(error) });
    }
  });

  // Update review pack
  app.patch('/api/review-packs/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as { id: string };
      const body = updateReviewPackSchema.parse(req.body);
      const now = new Date().toISOString();
      
      const sets: string[] = ['updated_at = ?'];
      const params: any[] = [now];
      
      if (body.status !== undefined) { sets.push('status = ?'); params.push(body.status); }
      if (body.total_samples !== undefined) { sets.push('total_samples = ?'); params.push(body.total_samples); }
      if (body.reviewed_samples !== undefined) { sets.push('reviewed_samples = ?'); params.push(body.reviewed_samples); }
      if (body.approved_samples !== undefined) { sets.push('approved_samples = ?'); params.push(body.approved_samples); }
      if (body.rejected_samples !== undefined) { sets.push('rejected_samples = ?'); params.push(body.rejected_samples); }
      if (body.reviewer_assignee !== undefined) { sets.push('reviewer_assignee = ?'); params.push(body.reviewer_assignee); }
      
      params.push(id);
      db.prepare(`UPDATE review_packs SET ${sets.join(', ')} WHERE id = ?`).run(...params);
      
      const row = db.prepare('SELECT * FROM review_packs WHERE id = ?').get(id);
      if (!row) {
        return reply.status(404).send({ ok: false, error: 'Review pack not found' });
      }
      return { ok: true, review_pack: row };
    } catch (error) {
      return reply.status(400).send({ ok: false, error: String(error) });
    }
  });

  // Assign review pack
  app.patch('/api/review-packs/:id/assign', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as { id: string };
      const { reviewer_assignee } = req.body as { reviewer_assignee: string };
      const now = new Date().toISOString();
      
      db.prepare('UPDATE review_packs SET reviewer_assignee = ?, status = ?, updated_at = ? WHERE id = ?')
        .run(reviewer_assignee, 'assigned', now, id);
      
      const row = db.prepare('SELECT * FROM review_packs WHERE id = ?').get(id);
      if (!row) {
        return reply.status(404).send({ ok: false, error: 'Review pack not found' });
      }
      return { ok: true, review_pack: row };
    } catch (error) {
      return reply.status(500).send({ ok: false, error: String(error) });
    }
  });

  // Complete review pack
  app.patch('/api/review-packs/:id/complete', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as { id: string };
      const { reviewed_samples, approved_samples, rejected_samples } = req.body as { reviewed_samples: number; approved_samples: number; rejected_samples: number };
      const now = new Date().toISOString();
      
      db.prepare('UPDATE review_packs SET reviewed_samples = ?, approved_samples = ?, rejected_samples = ?, status = ?, updated_at = ? WHERE id = ?')
        .run(reviewed_samples, approved_samples, rejected_samples, 'completed', now, id);
      
      const row = db.prepare('SELECT * FROM review_packs WHERE id = ?').get(id);
      if (!row) {
        return reply.status(404).send({ ok: false, error: 'Review pack not found' });
      }
      return { ok: true, review_pack: row };
    } catch (error) {
      return reply.status(500).send({ ok: false, error: String(error) });
    }
  });

  // ── B3: mahjong_vision classifier ──────────────────────────────────────────
  // POST /api/classifier-results  — classify a YOLO crop with mahjong_vision ViT
  app.post('/api/classifier-results', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = req.body as {
        yolo_annotation_id?: string;
        frame_batch_id?: string;
        video_batch_id?: string;
        crop_path?: string;
        crop_x1?: number; crop_y1?: number; crop_x2?: number; crop_y2?: number;
        yolo_original_class?: string;
        yolo_original_conf?: number;
        dataset_version_id?: string;
        image_base64?: string;
        confidence_threshold?: number;
      };

      const now = new Date().toISOString();
      const startMs = Date.now();

      // Run ViT classification via temp script file (avoids ENAMETOOLONG on Windows)
      let vitResult: any = { predicted_class_id: null, predicted_label: 'unknown', confidence: 0, is_accepted: 0, rejection_reason: 'no_image', top5_json: '[]', infer_time_ms: 0 };

      if (body.image_base64 || body.crop_path) {
        try {
          const tmpDir = os.tmpdir();
          const scriptPath = `${tmpDir}\\mv_classifier_${Date.now()}.py`.replace(/\//g, '\\');

          // Build script
          let script: string;
          if (body.image_base64) {
            script = `
import sys, base64, json, io
sys.path.insert(0, r'E:\\AGI_Factory\\apps\\local-api\\src')
from PIL import Image
from mahjong_vision_classifier import classify_crop, get_model
model, processor = get_model()
img_bytes = base64.b64decode('${body.image_base64}')
img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
threshold = ${body.confidence_threshold ?? 0.10}
r = classify_crop(img, confidence_threshold=threshold)
print(json.dumps({'predicted_class_id': r.class_id, 'predicted_label': r.label, 'confidence': r.confidence, 'is_accepted': 1 if r.is_accepted else 0, 'rejection_reason': r.rejection_reason or '', 'top5_json': json.dumps(r.top5)}))
`;
          } else {
            script = `
import sys, json
sys.path.insert(0, r'E:\\AGI_Factory\\apps\\local-api\\src')
from PIL import Image
from mahjong_vision_classifier import classify_crop, get_model
model, processor = get_model()
img = Image.open(r'${(body.crop_path || '').replace(/\\/g, '\\\\')}').convert('RGB')
threshold = ${body.confidence_threshold ?? 0.10}
r = classify_crop(img, confidence_threshold=threshold)
print(json.dumps({'predicted_class_id': r.class_id, 'predicted_label': r.label, 'confidence': r.confidence, 'is_accepted': 1 if r.is_accepted else 0, 'rejection_reason': r.rejection_reason or '', 'top5_json': json.dumps(r.top5)}))
`;
          }

          writeFileSync(scriptPath, script, 'utf-8');
          const pyOut = execSync(`python "${scriptPath}"`, { timeout: 30000, encoding: 'utf-8', stdio: ['pipe','pipe','pipe'] });
          try { unlinkSync(scriptPath); } catch(_){}
          // Parse last non-empty line as JSON (model loading messages may precede it)
          const lines = pyOut.trim().split('\n').filter(l => l.trim().startsWith('{'));
          const jsonLine = lines[lines.length - 1] || '{}';
          const parsed = JSON.parse(jsonLine);
          parsed.infer_time_ms = Date.now() - startMs;
          vitResult = parsed;
        } catch (pyErr) {
          vitResult.rejection_reason = `python_error:${String(pyErr).substring(0, 150)}`;
        }
      }

      const id = randomUUID();
      const row = {
        id: id,
        yolo_annotation_id: body.yolo_annotation_id || null,
        frame_batch_id: body.frame_batch_id || null,
        video_batch_id: body.video_batch_id || null,
        crop_path: body.crop_path || null,
        crop_x1: body.crop_x1 || null,
        crop_y1: body.crop_y1 || null,
        crop_x2: body.crop_x2 || null,
        crop_y2: body.crop_y2 || null,
        yolo_original_class: body.yolo_original_class || null,
        yolo_original_conf: body.yolo_original_conf || null,
        predicted_class_id: vitResult.predicted_class_id,
        predicted_label: vitResult.predicted_label,
        confidence: vitResult.confidence,
        is_accepted: vitResult.is_accepted,
        rejection_reason: vitResult.rejection_reason,
        top5_json: vitResult.top5_json,
        infer_time_ms: vitResult.infer_time_ms,
        dataset_version_id: body.dataset_version_id || null,
        created_at: now,
      };

      db.prepare(`
        INSERT INTO classifier_results (id, yolo_annotation_id, frame_batch_id, video_batch_id, crop_path,
          crop_x1, crop_y1, crop_x2, crop_y2, yolo_original_class, yolo_original_conf,
          predicted_class_id, predicted_label, confidence, is_accepted, rejection_reason,
          top5_json, infer_time_ms, dataset_version_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        row.id, row.yolo_annotation_id, row.frame_batch_id, row.video_batch_id, row.crop_path,
        row.crop_x1, row.crop_y1, row.crop_x2, row.crop_y2, row.yolo_original_class, row.yolo_original_conf,
        row.predicted_class_id, row.predicted_label, row.confidence, row.is_accepted, row.rejection_reason,
        row.top5_json, row.infer_time_ms, row.dataset_version_id, row.created_at
      );

      return { ok: true, classifier_result: row, model_info: { path: 'E:/mahjong_vision_strongest', model_type: 'ViT-B/16', classes: 34 } };
    } catch (error) {
      return reply.status(500).send({ ok: false, error: String(error) });
    }
  });

  // GET /api/classifier-results  — list classifier results
  app.get('/api/classifier-results', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const q = req.query as { yolo_annotation_id?: string; is_accepted?: string; limit?: string; dataset_version_id?: string };
      let sql = 'SELECT * FROM classifier_results WHERE 1=1';
      const params: any[] = [];
      if (q.yolo_annotation_id) { sql += ' AND yolo_annotation_id = ?'; params.push(q.yolo_annotation_id); }
      if (q.is_accepted !== undefined) { sql += ' AND is_accepted = ?'; params.push(q.is_accepted === 'true' ? 1 : 0); }
      if (q.dataset_version_id) { sql += ' AND dataset_version_id = ?'; params.push(q.dataset_version_id); }
      sql += ' ORDER BY created_at DESC LIMIT ?';
      params.push(parseInt(q.limit || '50'));
      const rows = db.prepare(sql).all(...params);
      const total = (db.prepare('SELECT COUNT(*) as cnt FROM classifier_results').get() as any).cnt;
      return { ok: true, total, results: rows };
    } catch (error) {
      return reply.status(500).send({ ok: false, error: String(error) });
    }
  });

  // GET /api/classifier-results/:id
  app.get('/api/classifier-results/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as { id: string };
      const row = db.prepare('SELECT * FROM classifier_results WHERE id = ?').get(id);
      if (!row) return reply.status(404).send({ ok: false, error: 'Not found' });
      return { ok: true, classifier_result: row };
    } catch (error) {
      return reply.status(500).send({ ok: false, error: String(error) });
    }
  });
}
