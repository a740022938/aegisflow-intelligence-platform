import type { FastifyInstance } from 'fastify';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import Database from 'better-sqlite3';

const MEMORY_HUB_ROOT_DEFAULT = 'E:\\_AIP_MEMORY_HUB';

function getHubRoot(): string {
  return process.env.MEMORY_HUB_ROOT || MEMORY_HUB_ROOT_DEFAULT;
}

function hubPath(...segments: string[]): string {
  return path.join(getHubRoot(), ...segments);
}

function safeReadJson(relPath: string): any {
  try {
    const full = hubPath(relPath);
    const raw = fs.readFileSync(full, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function safeReadText(relPath: string): string | null {
  try {
    const full = hubPath(relPath);
    return fs.readFileSync(full, 'utf-8');
  } catch {
    return null;
  }
}

function safeStat(relPath: string): fs.Stats | null {
  try {
    return fs.statSync(hubPath(relPath));
  } catch {
    return null;
  }
}

function safeDirList(relPath: string, ext = '.md'): string[] {
  try {
    return fs.readdirSync(hubPath(relPath)).filter(f => f.endsWith(ext));
  } catch {
    return [];
  }
}

const ALLOWED_PROFILES = new Set([
  'default_agent',
  'coding_agent',
  'vision_agent',
  'ops_agent',
  'readonly_agent',
  'lan_agent',
]);

const CANDIDATE_DIRS = ['candidates', 'candidates_pending', 'candidates_test', 'candidates_rejected', 'candidates_archived', 'candidates_imported'] as const;

function sanitizeProfileName(name: string): string | null {
  if (!name || typeof name !== 'string') return null;
  const clean = path.basename(name).replace(/\.md$/i, '');
  if (!ALLOWED_PROFILES.has(clean)) return null;
  return clean;
}

function sanitizeCandidateId(id: string): string | null {
  if (!id || typeof id !== 'string') return null;
  const clean = path.basename(id).replace(/\.json$/i, '');
  if (!/^[a-zA-Z0-9_-]+$/.test(clean)) return null;
  if (id.includes('..') || id.includes('/') || id.includes('\\')) return null;
  return `${clean}.json`;
}

function readAllCandidates(dirs: readonly string[]): { dir: string; files: any[] }[] {
  const results: { dir: string; files: any[] }[] = [];
  for (const dir of dirs) {
    const names = safeDirList(`inbox/${dir}`, '.json');
    const files: any[] = [];
    for (const name of names) {
      const data = safeReadJson(`inbox/${dir}/${name}`);
      if (data) {
        files.push({ fileName: name, ...data });
      }
    }
    results.push({ dir, files });
  }
  return results;
}

export function registerMemoryHubRoutes(app: FastifyInstance) {
  app.get('/api/memory-hub/status', async (_request, reply) => {
    try {
      const root = getHubRoot();
      const exportsStat = safeStat('exports');
      const bootstrapStat = safeStat('exports/assistant_bootstrap.md');
      const statsStat = safeStat('exports/machine/memory_stats.json');
      const manifestStat = safeStat('exports/machine/context_manifest.json');

      return {
        ok: true,
        configured: fs.existsSync(hubPath()),
        root,
        exportsExists: exportsStat?.isDirectory() || false,
        bootstrapExists: bootstrapStat?.isFile() || false,
        statsExists: statsStat?.isFile() || false,
        manifestExists: manifestStat?.isFile() || false,
        mode: 'readonly',
      };
    } catch (err: any) {
      return reply.code(500).send({
        ok: false, error: 'MEMORY_HUB_STATUS_FAILED',
        message: String(err?.message || err),
        mode: 'readonly',
      });
    }
  });

  app.get('/api/memory-hub/bootstrap', async (_request, reply) => {
    try {
      const content = safeReadText('exports/assistant_bootstrap.md');
      if (content === null) {
        return reply.code(404).send({
          ok: false, error: 'BOOTSTRAP_NOT_FOUND',
          message: 'assistant_bootstrap.md not found',
          mode: 'readonly',
        });
      }
      const stat = safeStat('exports/assistant_bootstrap.md');
      return {
        ok: true,
        content,
        updatedAt: stat ? stat.mtime.toISOString() : null,
        sourcePath: hubPath('exports/assistant_bootstrap.md'),
        mode: 'readonly',
      };
    } catch (err: any) {
      return reply.code(500).send({
        ok: false, error: 'BOOTSTRAP_READ_FAILED',
        message: String(err?.message || err),
        mode: 'readonly',
      });
    }
  });

  app.get('/api/memory-hub/stats', async (_request, reply) => {
    try {
      const data = safeReadJson('exports/machine/memory_stats.json');
      if (!data) {
        return reply.code(404).send({
          ok: false, error: 'STATS_NOT_FOUND',
          message: 'memory_stats.json not found',
          mode: 'readonly',
        });
      }
      return { ok: true, data, mode: 'readonly' };
    } catch (err: any) {
      return reply.code(500).send({
        ok: false, error: 'STATS_READ_FAILED',
        message: String(err?.message || err),
        mode: 'readonly',
      });
    }
  });

  app.get('/api/memory-hub/manifest', async (_request, reply) => {
    try {
      const data = safeReadJson('exports/machine/context_manifest.json');
      if (!data) {
        return reply.code(404).send({
          ok: false, error: 'MANIFEST_NOT_FOUND',
          message: 'context_manifest.json not found',
          mode: 'readonly',
        });
      }
      return { ok: true, data, mode: 'readonly' };
    } catch (err: any) {
      return reply.code(500).send({
        ok: false, error: 'MANIFEST_READ_FAILED',
        message: String(err?.message || err),
        mode: 'readonly',
      });
    }
  });

  app.get('/api/memory-hub/profiles', async (_request, reply) => {
    try {
      const files = safeDirList('exports/profiles').map(f => f.replace(/\.md$/i, ''));
      const allowed = Array.from(ALLOWED_PROFILES).filter(p => files.includes(p));
      const profiles = allowed.map(name => ({
        name,
        file: `exports/profiles/${name}.md`,
      }));
      return { ok: true, profiles, mode: 'readonly' };
    } catch (err: any) {
      return reply.code(500).send({
        ok: false, error: 'PROFILES_LIST_FAILED',
        message: String(err?.message || err),
        mode: 'readonly',
      });
    }
  });

  app.get<{ Params: { name: string } }>('/api/memory-hub/profile/:name', async (request, reply) => {
    try {
      const clean = sanitizeProfileName(request.params.name);
      if (!clean) {
        return reply.code(400).send({
          ok: false, error: 'INVALID_PROFILE',
          message: `Unknown or disallowed profile. Allowed: ${Array.from(ALLOWED_PROFILES).join(', ')}`,
          mode: 'readonly',
        });
      }

      const content = safeReadText(`exports/profiles/${clean}.md`);
      if (content === null) {
        return reply.code(404).send({
          ok: false, error: 'PROFILE_NOT_FOUND',
          message: `Profile '${clean}' not found`,
          mode: 'readonly',
        });
      }

      return {
        ok: true,
        name: clean,
        content,
        sourcePath: hubPath(`exports/profiles/${clean}.md`),
        mode: 'readonly',
      };
    } catch (err: any) {
      return reply.code(500).send({
        ok: false, error: 'PROFILE_READ_FAILED',
        message: String(err?.message || err),
        mode: 'readonly',
      });
    }
  });

  // --- Candidate Inbox Routes (v0.6-rc1, readonly preview) ---

  app.get('/api/memory-hub/candidates/status', async (_request, reply) => {
    try {
      const allDirs = readAllCandidates(CANDIDATE_DIRS);
      let pendingCount = 0;
      let testOnlyCount = 0;
      let totalCount = 0;
      let checkPass = 0;
      let checkFail = 0;

      for (const { dir, files } of allDirs) {
        for (const f of files) {
          totalCount++;
          const rs = f.review_status || '';
          if (rs === 'pending_review') pendingCount++;
          else if (rs === 'test_only') testOnlyCount++;
          if (f.ui_visible === true) checkPass++;
          else checkFail++;
        }
      }

      return {
        ok: true,
        mode: 'readonly',
        root: getHubRoot(),
        pendingCount,
        testOnlyCount,
        totalCandidateCount: totalCount,
        checkPass,
        checkFail,
        lastCheckedAt: new Date().toISOString(),
        dirs: CANDIDATE_DIRS.map(d => ({ name: d, count: allDirs.find(x => x.dir === d)?.files.length || 0 })),
      };
    } catch (err: any) {
      return reply.code(500).send({ ok: false, error: 'CANDIDATE_STATUS_FAILED', message: String(err?.message || err), mode: 'readonly' });
    }
  });

  app.get('/api/memory-hub/candidates', async (request: any, reply) => {
    try {
      const includeTest = String(request.query?.includeTest || '') === 'true';
      const statusFilter = String(request.query?.status || '');
      const all = String(request.query?.all || '') === 'true';

      const { files: candidates } = readAllCandidates(['candidates'])[0];
      const { files: pending } = readAllCandidates(['candidates_pending'])[0];
      const { files: testCandidates } = readAllCandidates(['candidates_test'])[0];

      let items = [...candidates, ...pending];
      if (includeTest || all) items = [...items, ...testCandidates];

      if (statusFilter) {
        items = items.filter(f => f.review_status === statusFilter);
      } else if (!all) {
        items = items.filter(f => f.ui_visible !== false && f.review_status === 'pending_review');
      }

      return { ok: true, mode: 'readonly', items, total: items.length };
    } catch (err: any) {
      return reply.code(500).send({ ok: false, error: 'CANDIDATES_LIST_FAILED', message: String(err?.message || err), mode: 'readonly' });
    }
  });

  app.get<{ Params: { id: string } }>('/api/memory-hub/candidates/:id', async (request, reply) => {
    try {
      const clean = sanitizeCandidateId(request.params.id);
      if (!clean) {
        return reply.code(400).send({ ok: false, error: 'INVALID_CANDIDATE_ID', message: 'Invalid candidate file identifier', mode: 'readonly' });
      }

      let data: any = null;
      let sourceDir = '';
      for (const dir of CANDIDATE_DIRS) {
        const d = safeReadJson(`inbox/${dir}/${clean}`);
        if (d) { data = d; sourceDir = dir; break; }
      }

      if (!data) {
        return reply.code(404).send({ ok: false, error: 'CANDIDATE_NOT_FOUND', message: `Candidate '${clean}' not found`, mode: 'readonly' });
      }

      return { ok: true, mode: 'readonly', sourceDir, data };
    } catch (err: any) {
      return reply.code(500).send({ ok: false, error: 'CANDIDATE_READ_FAILED', message: String(err?.message || err), mode: 'readonly' });
    }
  });

  app.get<{ Params: { id: string } }>('/api/memory-hub/candidates/:id/validate', async (request, reply) => {
    try {
      const clean = sanitizeCandidateId(request.params.id);
      if (!clean) {
        return reply.code(400).send({ ok: false, error: 'INVALID_CANDIDATE_ID', message: 'Invalid candidate file identifier', mode: 'readonly' });
      }

      const data = safeReadJson(`inbox/candidates/${clean}`) || safeReadJson(`inbox/candidates_test/${clean}`);
      if (!data) {
        return reply.code(404).send({ ok: false, error: 'CANDIDATE_NOT_FOUND', message: `Candidate '${clean}' not found in candidates/ or candidates_test/`, mode: 'readonly' });
      }

      const errors: string[] = [];
      const warnings: string[] = [];
      const REQUIRED = ['project', 'level', 'title', 'content', 'source', 'confidence', 'status'];

      for (const field of REQUIRED) {
        if (!(field in data)) errors.push(`Missing required field: ${field}`);
      }
      if (data.status !== 'candidate') errors.push('status must be candidate');
      if (!data.title?.trim()) errors.push('title cannot be empty');
      if (!data.content?.trim()) errors.push('content cannot be empty');

      return {
        ok: true,
        mode: 'readonly',
        dryRun: true,
        valid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (err: any) {
      return reply.code(500).send({ ok: false, error: 'VALIDATE_FAILED', message: String(err?.message || err), mode: 'readonly' });
    }
  });

  const DRY_RUN_ACTIONS = {
    'approve-dry-run': { wouldMoveTo: 'candidates_imported', wouldWriteMemory: true },
    'reject-dry-run': { wouldMoveTo: 'candidates_rejected', wouldWriteMemory: false },
    'archive-dry-run': { wouldMoveTo: 'candidates_archived', wouldWriteMemory: false },
  } as const;

  for (const [route, action] of Object.entries(DRY_RUN_ACTIONS)) {
    app.post<{ Params: { id: string } }>(`/api/memory-hub/candidates/:id/${route}`, async (request, reply) => {
      try {
        const clean = sanitizeCandidateId(request.params.id);
        if (!clean) {
          return reply.code(400).send({ ok: false, error: 'INVALID_CANDIDATE_ID', message: 'Invalid candidate file identifier', mode: 'readonly' });
        }

        let found = false;
        let sourceDir = '';
        for (const dir of CANDIDATE_DIRS) {
          if (safeStat(`inbox/${dir}/${clean}`)) { found = true; sourceDir = dir; break; }
        }

        if (!found) {
          return reply.code(404).send({ ok: false, error: 'CANDIDATE_NOT_FOUND', message: `Candidate '${clean}' not found in any inbox directory`, mode: 'readonly' });
        }

        return {
          ok: true,
          mode: 'readonly',
          dryRun: true,
          actualWrite: false,
          wouldChange: true,
          candidateId: clean,
          sourceDir,
          ...action,
          note: 'v0.6-rc1 readonly preview — no actual changes were made. Real approve/reject/archive will be enabled in v0.6-rc2.',
        };
      } catch (err: any) {
        return reply.code(500).send({ ok: false, error: `${route.replace(/-/g, '_').toUpperCase()}_FAILED`, message: String(err?.message || err), mode: 'readonly' });
      }
    });
  }

  // --- Real Action Endpoints (v0.6-rc2, guarded) ---

  function guardCandidate(json: any): string[] {
    const errs: string[] = [];
    if (!json) { errs.push('candidate not found'); return errs; }
    if (json.status !== 'candidate') errs.push(`status must be candidate, got '${json.status}'`);
    if (json.review_status !== 'pending_review') errs.push(`review_status must be pending_review, got '${json.review_status}'`);
    if (json.ui_visible === false) errs.push('ui_visible is false — candidate is not visible in default list');
    if (json.review_status === 'test_only') errs.push('test_only candidates cannot be approved');
    if (json.sensitivity === 'high' || json.sensitivity === 'secret_blocked') errs.push(`sensitivity=${json.sensitivity} — cannot be exported, cannot be approved`);
    if (json.source_type === 'unknown') errs.push('source_type=unknown — cannot be published');
    if (json.confidence === 'unknown') errs.push('confidence=unknown — cannot be published');
    return errs;
  }

  type ActionKind = 'approve' | 'reject' | 'archive';
  const ACTION_CONFIRM: Record<ActionKind, string> = {
    approve: 'APPROVE_MEMORY_CANDIDATE',
    reject: 'REJECT_MEMORY_CANDIDATE',
    archive: 'ARCHIVE_MEMORY_CANDIDATE',
  };
  const ACTION_MOVE_DIR: Record<ActionKind, string> = {
    approve: 'candidates_imported',
    reject: 'candidates_rejected',
    archive: 'candidates_archived',
  };

  for (const kind of ['approve', 'reject', 'archive'] as ActionKind[]) {
    app.post<{ Params: { id: string } }>(`/api/memory-hub/candidates/:id/${kind}`, async (request: any, reply) => {
      try {
        const clean = sanitizeCandidateId(request.params.id);
        if (!clean) return reply.code(400).send({ ok: false, error: 'INVALID_CANDIDATE_ID', message: 'Invalid or unsafe candidate identifier', mode: 'readonly' });

        const body = request.body || {};
        if (!body.confirm) return reply.code(400).send({ ok: false, error: 'CONFIRM_REQUIRED', message: 'Missing confirm=true in request body', mode: 'readonly', dryRun: false, actualWrite: false });
        if (body.confirmText !== ACTION_CONFIRM[kind]) return reply.code(400).send({ ok: false, error: 'CONFIRM_TEXT_MISMATCH', message: `confirmText must be exactly "${ACTION_CONFIRM[kind]}"`, expected: ACTION_CONFIRM[kind], mode: 'readonly', dryRun: false, actualWrite: false });

        // Find candidate
        let data: any = null;
        let sourceDir = '';
        for (const dir of CANDIDATE_DIRS) {
          const d = safeReadJson(`inbox/${dir}/${clean}`);
          if (d) { data = d; sourceDir = dir; break; }
        }
        if (!data) return reply.code(404).send({ ok: false, error: 'CANDIDATE_NOT_FOUND', message: `Candidate '${clean}' not found`, mode: 'readonly', dryRun: false, actualWrite: false });

        // Guard checks
        const guardErrors = guardCandidate(data);
        if (guardErrors.length > 0) return reply.code(400).send({ ok: false, error: 'GUARD_FAILED', message: guardErrors.join('; '), dryRun: false, actualWrite: false, guardErrors, mode: 'readonly' });

        // Validate
        const REQUIRED = ['project', 'level', 'title', 'content', 'source', 'confidence', 'status'];
        for (const f of REQUIRED) { if (!(f in data)) guardErrors.push(`Missing required field: ${f}`); }
        if (guardErrors.length > 0) return reply.code(400).send({ ok: false, error: 'VALIDATE_FAILED', message: guardErrors.join('; '), mode: 'readonly', dryRun: false, actualWrite: false });

        const moveDir = ACTION_MOVE_DIR[kind];
        const srcPath = hubPath(`inbox/${sourceDir}/${clean}`);
        const dstPath = hubPath(`inbox/${moveDir}/${clean}`);
        const now = new Date().toISOString();

        // Backup sqlite
        const backupDir = hubPath('backups/before_change');
        fs.mkdirSync(backupDir, { recursive: true });
        const sqlitePath = hubPath('memory_hub.sqlite');
        const backupSqlite = path.join(backupDir, `memory_hub_before_${kind}_${clean.replace('.json', '')}_${Date.now()}.sqlite`);
        fs.copyFileSync(sqlitePath, backupSqlite);

        // Backup candidate file
        if (safeStat(`inbox/${sourceDir}/${clean}`)) {
          fs.copyFileSync(srcPath, dstPath.replace('.json', `_backup_${Date.now()}.json`));
        }

        const HUMAN_NOTE = body.humanNote || '';

        if (kind === 'approve') {
          // Write to memories
          const checksum = calculateChecksum(data.title + (data.content || ''));
          const sqliteDbPath = hubPath('memory_hub.sqlite');
          const db = new Database(sqliteDbPath);
          db.prepare(`INSERT INTO memories (project, level, title, content, confidence, source, source_type, status, approved_by, approved_at, checksum)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, datetime('now','localtime'), ?)`).run(
            data.project || '', data.level || '', data.title || '', data.content || '',
            data.confidence || 'medium', data.source || '', data.source_type || '',
            'memory_hub_rc2_approve', checksum
          );
          const mid = db.prepare('SELECT last_insert_rowid() as id').get();
          db.prepare(`INSERT INTO audit_log (action, target_type, target_id, details) VALUES (?, ?, ?, ?)`).run(
            'rc2_approve', 'memory', (mid as any).id, `Approved candidate '${data.title}' from ${sourceDir}/${clean}`
          );
          db.close();

          // Update candidate file
          data.review_status = 'imported';
          data.approved_at = now;
          data.approved_by = 'memory_hub_rc2_approve';
          data.change_reason = HUMAN_NOTE || 'Approved via AIP v0.6-rc2';
          fs.writeFileSync(srcPath, JSON.stringify(data, null, 2), 'utf-8');

          // Move candidate file
          fs.renameSync(srcPath, dstPath);
        } else if (kind === 'reject') {
          data.review_status = 'rejected';
          data.rejected_at = now;
          data.rejected_by = 'memory_hub_rc2_reject';
          data.reject_reason = HUMAN_NOTE || body.reason || 'Rejected via AIP v0.6-rc2';
          fs.writeFileSync(srcPath, JSON.stringify(data, null, 2), 'utf-8');
          fs.renameSync(srcPath, dstPath);

          const sqliteDbPath = hubPath('memory_hub.sqlite');
          const db = new Database(sqliteDbPath);
          db.prepare(`INSERT INTO audit_log (action, target_type, target_id, details) VALUES (?, ?, ?, ?)`).run(
            'rc2_reject', 'candidate', 0, `Rejected candidate '${data.title}' from ${sourceDir}/${clean}: ${HUMAN_NOTE}`
          );
          db.close();
        } else if (kind === 'archive') {
          data.review_status = 'archived';
          data.archived_at = now;
          data.archived_by = 'memory_hub_rc2_archive';
          data.change_reason = HUMAN_NOTE || 'Archived via AIP v0.6-rc2';
          fs.writeFileSync(srcPath, JSON.stringify(data, null, 2), 'utf-8');
          fs.renameSync(srcPath, dstPath);

          const sqliteDbPath = hubPath('memory_hub.sqlite');
          const db = new Database(sqliteDbPath);
          db.prepare(`INSERT INTO audit_log (action, target_type, target_id, details) VALUES (?, ?, ?, ?)`).run(
            'rc2_archive', 'candidate', 0, `Archived candidate '${data.title}' from ${sourceDir}/${clean}`
          );
          db.close();
        }

        // Final backup
        const finalBackup = path.join(backupDir, `memory_hub_after_${kind}_${clean.replace('.json', '')}_${Date.now()}.sqlite`);
        fs.copyFileSync(sqlitePath, finalBackup);

        // For approve: run export
        if (kind === 'approve') {
          try {
            execFileSync('python', [hubPath('memory_cli.py'), 'export'], { cwd: hubPath(), timeout: 30000, windowsHide: true });
          } catch { /* export best-effort */ }
        }

        return {
          ok: true, mode: 'readonly', dryRun: false, actualWrite: true,
          action: kind, candidateId: clean, sourceDir, movedTo: moveDir,
          humanNote: HUMAN_NOTE, writtenAt: now,
          note: `v0.6-rc2 guarded action executed. ${kind} of '${data.title || clean}' completed.`,
        };
      } catch (err: any) {
        return reply.code(500).send({ ok: false, error: `${kind.toUpperCase()}_FAILED`, message: String(err?.message || err), dryRun: false, actualWrite: false });
      }
    });
  }

  function calculateChecksum(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }
}
