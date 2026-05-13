import type { FastifyInstance } from 'fastify';
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { getDatabase } from '../db/builtin-sqlite.js';

// ─── Config ───────────────────────────────────────────────────────────────

function getOpenAxiomHome(): string | null {
  const env = process.env.OPENAXIOM_HOME;
  if (env && existsSync(env)) return env;

  // Default fallback: repo-relative path
  const repoRoot = process.env.AIP_REPO_ROOT || resolve(process.cwd(), '..');
  const defaultPath = resolve(repoRoot, 'Axiom', 'tools', 'openaxiom');
  if (existsSync(defaultPath)) return defaultPath;

  return null;
}

function getOpenAxiomPython(): string {
  return process.env.OPENAXIOM_PYTHON || 'python';
}

function getCliPath(home: string): string | null {
  const cli = resolve(home, 'adapter', 'aip_readonly_cli.py');
  return existsSync(cli) ? cli : null;
}

// ─── Status check ─────────────────────────────────────────────────────────

function getStatus() {
  const home = getOpenAxiomHome();
  const python = getOpenAxiomPython();
  const cliPath = home ? getCliPath(home) : null;

  return {
    configured: home !== null,
    home: home || null,
    python,
    pythonExists: true, // assume; caller can override
    cliExists: cliPath !== null,
    apiVersion: 'readonly',
    mode: 'readonly',
    issues: home === null
      ? ['OPENAXIOM_HOME not configured']
      : cliPath === null
        ? ['aip_readonly_cli.py not found at ' + resolve(home, 'adapter')]
        : [],
  };
}

// ─── CLI invocation ───────────────────────────────────────────────────────

function runCli(command: string, args: Record<string, string>, timeoutMs: number): Promise<any> {
  return new Promise((resolvePromise, rejectPromise) => {
    const home = getOpenAxiomHome();
    if (!home) {
      return resolvePromise({
        ok: false, source: 'openaxiom', mode: 'readonly',
        command, result: null,
        error: { code: 'NOT_CONFIGURED', message: 'OPENAXIOM_HOME is not configured', detail: '' },
      });
    }

    const cliPath = getCliPath(home);
    if (!cliPath) {
      return resolvePromise({
        ok: false, source: 'openaxiom', mode: 'readonly',
        command, result: null,
        error: { code: 'CLI_NOT_FOUND', message: 'aip_readonly_cli.py not found', detail: '' },
      });
    }

    const python = getOpenAxiomPython();
    const cliArgs = [cliPath, command];
    for (const [key, value] of Object.entries(args)) {
      if (value) {
        cliArgs.push(`--${key.replace(/_/g, '-')}`, value);
      }
    }

    const child = execFile(python, cliArgs, {
      cwd: resolve(home),
      timeout: timeoutMs,
      maxBuffer: 10 * 1024 * 1024,
      windowsHide: true,
    }, (err, stdout, stderr) => {
      if (err) {
        const isTimeout = (err as any).killed || (err.message && err.message.includes('timeout'));
        return resolvePromise({
          ok: false, source: 'openaxiom', mode: 'readonly',
          command, result: null,
          error: {
            code: isTimeout ? 'TIMEOUT' : 'CLI_ERROR',
            message: isTimeout ? `Command timed out after ${timeoutMs}ms` : err.message,
            detail: stderr || '',
          },
        });
      }

      try {
        const parsed = JSON.parse(stdout);
        return resolvePromise({
          ok: parsed.ok ?? false,
          source: 'openaxiom',
          mode: 'readonly',
          command,
          result: parsed.data || null,
          error: parsed.error ? { code: 'CLI_FAILED', message: parsed.error, detail: '' } : null,
        });
      } catch {
        return resolvePromise({
          ok: false, source: 'openaxiom', mode: 'readonly',
          command, result: null,
          error: { code: 'INVALID_JSON', message: 'CLI output is not valid JSON', detail: stdout.slice(0, 500) },
        });
      }
    });
  });
}

// ─── Routes ───────────────────────────────────────────────────────────────

const COMMAND_TIMEOUTS: Record<string, number> = {
  project_scan: 30_000,
  label_health_check: 60_000,
  yolo_dry_run: 60_000,
};

export function registerOpenAxiomBridgeRoutes(app: FastifyInstance) {
  // GET /api/openaxiom/status
  app.get('/api/openaxiom/status', async (_request, _reply) => {
    const status = getStatus();
    return {
      ok: status.configured,
      source: 'openaxiom',
      mode: 'readonly',
      ...status,
    };
  });

  // POST /api/openaxiom/project-scan
  app.post('/api/openaxiom/project-scan', async (request: any, reply: any) => {
    const { projectPath } = request.body || {};
    if (!projectPath || typeof projectPath !== 'string') {
      return reply.code(400).send({
        ok: false, source: 'openaxiom', mode: 'readonly',
        command: 'project_scan', result: null,
        error: { code: 'INVALID_PARAMS', message: 'projectPath is required', detail: '' },
      });
    }
    return await runCli('project_scan', { project_path: projectPath }, COMMAND_TIMEOUTS.project_scan);
  });

  // POST /api/openaxiom/label-health-check
  app.post('/api/openaxiom/label-health-check', async (request: any, reply: any) => {
    const { imagesDir, labelsDir } = request.body || {};
    if (!imagesDir || !labelsDir) {
      return reply.code(400).send({
        ok: false, source: 'openaxiom', mode: 'readonly',
        command: 'label_health_check', result: null,
        error: { code: 'INVALID_PARAMS', message: 'imagesDir and labelsDir are required', detail: '' },
      });
    }
    return await runCli('label_health_check', { images_dir: imagesDir, labels_dir: labelsDir }, COMMAND_TIMEOUTS.label_health_check);
  });

  // POST /api/openaxiom/yolo-dry-run
  app.post('/api/openaxiom/yolo-dry-run', async (request: any, reply: any) => {
    const { imagesDir, labelsDir } = request.body || {};
    if (!imagesDir || !labelsDir) {
      return reply.code(400).send({
        ok: false, source: 'openaxiom', mode: 'readonly',
        command: 'yolo_dry_run', result: null,
        error: { code: 'INVALID_PARAMS', message: 'imagesDir and labelsDir are required', detail: '' },
      });
    }
    return await runCli('yolo_dry_run', { images_dir: imagesDir, labels_dir: labelsDir }, COMMAND_TIMEOUTS.yolo_dry_run);
  });

  // POST /api/openaxiom/diagnostic-summary
  app.post('/api/openaxiom/diagnostic-summary', async (request: any, reply: any) => {
    const { projectPath, imagesDir, labelsDir } = request.body || {};
    if (!projectPath || !imagesDir || !labelsDir) {
      return reply.code(400).send({
        ok: false, source: 'openaxiom', mode: 'readonly',
        command: 'diagnostic_summary', result: null,
        error: { code: 'INVALID_PARAMS', message: 'projectPath, imagesDir, labelsDir are required', detail: '' },
      });
    }

    const [psResult, hcResult, ydResult] = await Promise.all([
      runCli('project_scan', { project_path: projectPath }, COMMAND_TIMEOUTS.project_scan),
      runCli('label_health_check', { images_dir: imagesDir, labels_dir: labelsDir }, COMMAND_TIMEOUTS.label_health_check),
      runCli('yolo_dry_run', { images_dir: imagesDir, labels_dir: labelsDir }, COMMAND_TIMEOUTS.yolo_dry_run),
    ]);

    const psData = psResult.result;
    const hcData = hcResult.result;
    const ydData = ydResult.result;

    const imageCount = psData?.image_count ?? ydData?.image_count ?? 0;
    const labelCount = hcData?.label_count ?? ydData?.label_count ?? 0;
    const matchedCount = ydData?.matched_count ?? 0;
    const zeroByteCount = hcData?.zero_byte_count ?? 0;
    const badFormatCount = hcData?.bad_format_count ?? 0;
    const badCoordCount = hcData?.bad_coord_count ?? 0;
    const badClassCount = hcData?.bad_class_count ?? 0;
    const imagesWithoutLabelsCount = ydData?.images_without_labels?.length ?? 0;
    const labelsWithoutImagesCount = ydData?.labels_without_images?.length ?? 0;
    const totalBoxes = ydData?.total_boxes ?? 0;

    let riskLevel: string;
    const issues: string[] = [];
    if (zeroByteCount > 0) issues.push(`${zeroByteCount} 个 0 字节 label`);
    if (badFormatCount > 0) issues.push(`${badFormatCount} 个格式错误`);
    if (badCoordCount > 0) issues.push(`${badCoordCount} 个坐标越界`);
    if (badClassCount > 0) issues.push(`${badClassCount} 个 class_id 错误`);
    if (imagesWithoutLabelsCount > 0) issues.push(`${imagesWithoutLabelsCount} 张图片无对应 label`);
    if (labelsWithoutImagesCount > 0) issues.push(`${labelsWithoutImagesCount} 个 label 无对应图片`);

    if (zeroByteCount > 0 || badFormatCount > 5 || badCoordCount > 5) {
      riskLevel = 'high';
    } else if (issues.length > 0) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'low';
    }

    const recommendations: string[] = [];
    if (zeroByteCount > 0) recommendations.push('修复或删除 0 字节 label 文件后重试');
    if (badFormatCount > 0) recommendations.push('修正格式错误的 label 行，确保每行恰好 5 列');
    if (badCoordCount > 0) recommendations.push('修正越界的 bbox 坐标，确保 cx/cy/w/h 在 [0,1] 范围内');
    if (badClassCount > 0) recommendations.push('修正负数的 class_id，确保 class_id 为非负整数');
    if (imagesWithoutLabelsCount > 0) recommendations.push(`为 ${imagesWithoutLabelsCount} 张缺少 label 的图片补充标注`);
    if (labelsWithoutImagesCount > 0) recommendations.push(`清理 ${labelsWithoutImagesCount} 个无对应图片的 label 文件`);
    if (recommendations.length === 0) recommendations.push('数据集状态良好，无需修复');

    const ok = psResult.ok && !(zeroByteCount > 0 || badFormatCount > 0);

    const summaryData = {
      projectOk: psResult.ok ?? false,
      imageCount,
      labelCount,
      matchedCount,
      zeroByteCount,
      badFormatCount,
      badCoordCount,
      badClassCount,
      imagesWithoutLabelsCount,
      labelsWithoutImagesCount,
      totalBoxes,
      riskLevel,
      recommendations,
      issues,
    };
    const rawData = {
      projectScan: psData,
      labelHealthCheck: hcData,
      yoloDryRun: ydData,
    };

    const response = {
      ok,
      source: 'openaxiom',
      mode: 'readonly',
      summary: summaryData,
      raw: rawData,
      error: null,
    };

    // Auto-save if save=true query param
    if ((request.query as any)?.save === 'true') {
      const runId = saveDiagnosticRun({
        projectPath,
        imagesDir,
        labelsDir,
        result: ok ? 'success' : 'failed',
        riskLevel,
        imageCount,
        labelCount,
        matchedCount,
        zeroByteCount,
        badFormatCount,
        badCoordCount,
        badClassCount,
        imagesWithoutLabelsCount,
        labelsWithoutImagesCount,
        totalBoxes,
        recommendations,
        summaryData,
        rawData,
      });
      (response as any).runId = runId;
    }

    return response;
  });
}

// ─── Audit History Helpers ─────────────────────────────────────────────

interface DiagnosticRunRecord {
  projectPath: string;
  imagesDir: string;
  labelsDir: string;
  result: 'success' | 'failed';
  riskLevel: string;
  imageCount: number;
  labelCount: number;
  matchedCount: number;
  zeroByteCount: number;
  badFormatCount: number;
  badCoordCount: number;
  badClassCount: number;
  imagesWithoutLabelsCount: number;
  labelsWithoutImagesCount: number;
  totalBoxes: number;
  recommendations: string[];
  summaryData: any;
  rawData: any;
}

function buildTaskCardMarkdown(run: DiagnosticRunRecord): string {
  const lines = [
    '## OpenAxiom 数据集只读检查任务卡片',
    '',
    `**项目路径**: ${run.projectPath || '-'}`,
    `**imagesDir**: ${run.imagesDir || '-'}`,
    `**labelsDir**: ${run.labelsDir || '-'}`,
    '',
    '| 指标 | 数值 |',
    '|------|------|',
    `| 图片数量 | ${run.imageCount} |`,
    `| label 数量 | ${run.labelCount} |`,
    `| 匹配数量 | ${run.matchedCount} |`,
    `| 0 字节 label 数 | ${run.zeroByteCount} |`,
    `| 格式异常数 | ${run.badFormatCount} |`,
    `| 坐标异常数 | ${run.badCoordCount} |`,
    `| class_id 异常数 | ${run.badClassCount} |`,
    `| 有图无标数量 | ${run.imagesWithoutLabelsCount} |`,
    `| 有标无图数量 | ${run.labelsWithoutImagesCount} |`,
    `| 总 bbox 数 | ${run.totalBoxes} |`,
    `| 风险等级 | ${run.riskLevel || 'unknown'} |`,
    '',
    '### 建议动作',
    ...(run.recommendations || []).map((x: string) => `- ${x}`),
    '',
    '---',
    '*此任务卡片由 OpenAxiom 只读检查生成。实际数据修改需由用户确认后手动执行。*',
    '*当前模式: OpenAxiom 只读检查 — 不会写入 label / 不会保存 / 不会恢复 / 不会批量覆盖*',
  ];
  return lines.join('\n');
}

function saveDiagnosticRun(run: DiagnosticRunRecord): string {
  const db = getDatabase();
  const id = randomUUID();
  const now = new Date().toISOString();
  const taskCardMd = buildTaskCardMarkdown(run);

  const detail = JSON.stringify({
    summary: run.summaryData,
    raw: run.rawData,
    riskLevel: run.riskLevel,
    taskCardMarkdown: taskCardMd,
    recommendations: run.recommendations,
  });

  db.prepare(`
    INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at)
    VALUES (?, 'openaxiom', 'diagnostic_summary', ?, ?, ?, ?)
  `).run(id, run.projectPath, run.result, detail, now);

  return id;
}

function parseRunDetail(row: any): any {
  if (!row) return null;
  let detail: any = {};
  try { detail = JSON.parse(row.detail_json || '{}'); } catch { /* ignore */ }
  return {
    id: row.id,
    createdAt: row.created_at,
    projectPath: row.target || '',
    result: row.result || 'failed',
    riskLevel: detail.riskLevel || 'unknown',
    taskCardMarkdown: detail.taskCardMarkdown || '',
    summary: detail.summary || null,
    raw: detail.raw || null,
    recommendations: detail.recommendations || [],
  };
}

// ─── Stats API ─────────────────────────────────────────────────────────────

function safeParseDetail(detailJson: string): any {
  try { return JSON.parse(detailJson || '{}'); } catch { return {}; }
}

function tryGet(arr: any[], idx: number, def: number = 0): number {
  try { const v = arr[idx]; return (v !== null && v !== undefined) ? Number(v) : def; } catch { return def; }
}

// ─── Audit History Routes ─────────────────────────────────────────────────

export function registerOpenAxiomHistoryRoutes(app: FastifyInstance) {
  // POST /api/openaxiom/diagnostic-runs — save current diagnostic as audit
  app.post('/api/openaxiom/diagnostic-runs', async (request: any, reply: any) => {
    const { projectPath, imagesDir, labelsDir, summary, raw, riskLevel, recommendations } = request.body || {};
    if (!projectPath || !summary) {
      return reply.code(400).send({
        ok: false, error: { code: 'INVALID_PARAMS', message: 'projectPath and summary are required', detail: '' },
      });
    }

    const run: DiagnosticRunRecord = {
      projectPath,
      imagesDir: imagesDir || '',
      labelsDir: labelsDir || '',
      result: summary.projectOk ? 'success' : 'failed',
      riskLevel: riskLevel || summary.riskLevel || 'unknown',
      imageCount: summary.imageCount || 0,
      labelCount: summary.labelCount || 0,
      matchedCount: summary.matchedCount || 0,
      zeroByteCount: summary.zeroByteCount || 0,
      badFormatCount: summary.badFormatCount || 0,
      badCoordCount: summary.badCoordCount || 0,
      badClassCount: summary.badClassCount || 0,
      imagesWithoutLabelsCount: summary.imagesWithoutLabelsCount || 0,
      labelsWithoutImagesCount: summary.labelsWithoutImagesCount || 0,
      totalBoxes: summary.totalBoxes || 0,
      recommendations: recommendations || summary.recommendations || [],
      summaryData: summary,
      rawData: raw || null,
    };

    const runId = saveDiagnosticRun(run);
    return { ok: true, source: 'openaxiom', mode: 'readonly', runId };
  });

  // GET /api/openaxiom/diagnostic-runs — list historical runs
  app.get('/api/openaxiom/diagnostic-runs', async (request: any, reply: any) => {
    const db = getDatabase();
    const query = request.query || {};
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize, 10) || 20));
    const offset = (page - 1) * pageSize;
    const riskLevelFilter = query.riskLevel || '';
    const keyword = query.keyword || '';
    const startDate = query.startDate || '';
    const endDate = query.endDate || '';

    let where = "WHERE category = 'openaxiom' AND action = 'diagnostic_summary'";
    const params: any[] = [];

    if (riskLevelFilter) {
      where += ' AND detail_json LIKE ?';
      params.push(`%"riskLevel":"${riskLevelFilter}"%`);
    }
    if (keyword) {
      where += ' AND (target LIKE ? OR detail_json LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (startDate) {
      where += ' AND created_at >= ?';
      params.push(startDate);
    }
    if (endDate) {
      where += ' AND created_at <= ?';
      params.push(endDate);
    }

    const countRow = db.prepare(`SELECT COUNT(*) as cnt FROM audit_logs ${where}`).get(...params) as any;
    const total = countRow?.cnt || 0;

    const rows = db.prepare(
      `SELECT id, category, action, target, result, detail_json, created_at FROM audit_logs ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).all(...params, pageSize, offset) as any[];

    const items = rows.map((row: any) => {
      const detail = parseRunDetail(row);
      return {
        id: row.id,
        createdAt: row.created_at,
        projectPath: row.target,
        result: row.result,
        riskLevel: detail.riskLevel,
        imageCount: detail.summary?.imageCount ?? 0,
        labelCount: detail.summary?.labelCount ?? 0,
        zeroByteCount: detail.summary?.zeroByteCount ?? 0,
        badFormatCount: detail.summary?.badFormatCount ?? 0,
      };
    });

    return {
      ok: true, source: 'openaxiom', mode: 'readonly',
      items, total, page, pageSize, totalPages: Math.ceil(total / pageSize),
    };
  });

  // GET /api/openaxiom/diagnostic-runs/:id — get run detail
  app.get('/api/openaxiom/diagnostic-runs/:id', async (request: any, reply: any) => {
    const db = getDatabase();
    const row = db.prepare(
      `SELECT id, category, action, target, result, detail_json, created_at FROM audit_logs WHERE id = ?`
    ).get(request.params.id) as any;

    if (!row) {
      return reply.code(404).send({
        ok: false, error: { code: 'NOT_FOUND', message: 'Diagnostic run not found', detail: '' },
      });
    }

    const detail = parseRunDetail(row);
    return {
      ok: true, source: 'openaxiom', mode: 'readonly',
      id: row.id,
      createdAt: row.created_at,
      projectPath: row.target,
      result: row.result,
      ...detail,
    };
  });

  // POST /api/openaxiom/diagnostic-runs/:id/rerun — rerun a historical diagnostic
  app.post('/api/openaxiom/diagnostic-runs/:id/rerun', async (request: any, reply: any) => {
    const db = getDatabase();
    const row = db.prepare(
      `SELECT id, target, detail_json FROM audit_logs WHERE id = ? AND category = 'openaxiom'`
    ).get(request.params.id) as any;

    if (!row) {
      return reply.code(404).send({
        ok: false, error: { code: 'NOT_FOUND', message: 'Diagnostic run not found', detail: '' },
      });
    }

    let detail: any = {};
    try { detail = JSON.parse(row.detail_json || '{}'); } catch { /* ignore */ }
    const summary = detail.summary || {};
    const raw = detail.raw || {};

    // Extract paths from the stored record
    const imagesDir = raw?.projectScan?.images_dir || summary.imagesDir || '';
    const labelsDir = raw?.projectScan?.labels_dir || summary.labelsDir || '';
    const projectPath = row.target;

    // Re-run the diagnostic using existing CLI calls
    const [psResult, hcResult, ydResult] = await Promise.all([
      runCli('project_scan', { project_path: projectPath }, COMMAND_TIMEOUTS.project_scan),
      runCli('label_health_check', { images_dir: imagesDir, labels_dir: labelsDir }, COMMAND_TIMEOUTS.label_health_check),
      runCli('yolo_dry_run', { images_dir: imagesDir, labels_dir: labelsDir }, COMMAND_TIMEOUTS.yolo_dry_run),
    ]);

    const psData = psResult.result;
    const hcData = hcResult.result;
    const ydData = ydResult.result;

    const zeroByteCount = hcData?.zero_byte_count ?? 0;
    const badFormatCount = hcData?.bad_format_count ?? 0;
    const badCoordCount = hcData?.bad_coord_count ?? 0;
    const badClassCount = hcData?.bad_class_count ?? 0;
    const imagesWithoutLabelsCount = ydData?.images_without_labels?.length ?? 0;
    const labelsWithoutImagesCount = ydData?.labels_without_images?.length ?? 0;

    const newIssues: string[] = [];
    if (zeroByteCount > 0) newIssues.push(`${zeroByteCount} 个 0 字节 label`);
    if (badFormatCount > 0) newIssues.push(`${badFormatCount} 个格式错误`);
    if (badCoordCount > 0) newIssues.push(`${badCoordCount} 个坐标越界`);
    if (badClassCount > 0) newIssues.push(`${badClassCount} 个 class_id 错误`);
    if (imagesWithoutLabelsCount > 0) newIssues.push(`${imagesWithoutLabelsCount} 张图片无对应 label`);
    if (labelsWithoutImagesCount > 0) newIssues.push(`${labelsWithoutImagesCount} 个 label 无对应图片`);

    let riskLevel: string;
    if (zeroByteCount > 0 || badFormatCount > 5 || badCoordCount > 5) {
      riskLevel = 'high';
    } else if (newIssues.length > 0) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'low';
    }

    return {
      ok: psResult.ok && !(zeroByteCount > 0 || badFormatCount > 0),
      source: 'openaxiom',
      mode: 'readonly',
      rerunFrom: request.params.id,
      summary: {
        imageCount: psData?.image_count ?? 0,
        labelCount: hcData?.label_count ?? 0,
        matchedCount: ydData?.matched_count ?? 0,
        totalBoxes: ydData?.total_boxes ?? 0,
        zeroByteCount,
        badFormatCount,
        badCoordCount,
        badClassCount,
        imagesWithoutLabelsCount,
        labelsWithoutImagesCount,
        riskLevel,
        issues: newIssues,
      },
      raw: {
        projectScan: psData,
        labelHealthCheck: hcData,
        yoloDryRun: ydData,
      },
    };
  });

  // GET /api/openaxiom/diagnostic-stats — aggregate statistics
  app.get('/api/openaxiom/diagnostic-stats', async (request: any, reply: any) => {
    const db = getDatabase();
    const query = request.query || {};
    const days = Math.max(1, Math.min(365, parseInt(query.days, 10) || 30));
    const riskLevelFilter = query.riskLevel || '';
    const keyword = query.keyword || '';

    const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    let where = "WHERE category = 'openaxiom' AND action = 'diagnostic_summary' AND created_at >= ?";
    const params: any[] = [fromDate];

    if (riskLevelFilter) {
      where += ' AND detail_json LIKE ?';
      params.push(`%"riskLevel":"${riskLevelFilter}"%`);
    }
    if (keyword) {
      where += ' AND (target LIKE ? OR detail_json LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    let rows: any[];
    try {
      rows = db.prepare(
        `SELECT id, target, result, detail_json, created_at FROM audit_logs ${where} ORDER BY created_at DESC`
      ).all(...params) as any[];
    } catch (err: any) {
      return {
        ok: false, source: 'openaxiom', mode: 'readonly',
        error: { code: 'DB_ERROR', message: err.message, detail: '' },
      };
    }

    let totalRuns = 0, successRuns = 0, failedRuns = 0;
    let lowRiskCount = 0, mediumRiskCount = 0, highRiskCount = 0;
    let totalImages = 0, totalLabels = 0, totalBoxes = 0;
    let zeroByteTotal = 0, badFormatTotal = 0, badCoordTotal = 0, badClassTotal = 0;
    let imagesWithoutLabelsTotal = 0, labelsWithoutImagesTotal = 0;
    let latestRunAt: string | null = null;
    let parseErrors = 0;
    const issueMap: Record<string, { count: number; severity: string }> = {
      zero_byte_label: { count: 0, severity: 'high' },
      bad_format: { count: 0, severity: 'high' },
      bad_coord: { count: 0, severity: 'medium' },
      bad_class: { count: 0, severity: 'medium' },
      image_without_label: { count: 0, severity: 'medium' },
      label_without_image: { count: 0, severity: 'low' },
    };
    const highRiskRuns: any[] = [];

    for (const row of rows) {
      totalRuns++;
      if (row.result === 'success') successRuns++; else failedRuns++;

      if (!latestRunAt || (row.created_at > latestRunAt)) latestRunAt = row.created_at;

      const detail = safeParseDetail(row.detail_json);
      const summary = detail.summary || {};
      if (!summary || Object.keys(summary).length === 0) { parseErrors++; continue; }

      const rl = (summary.riskLevel || detail.riskLevel || '').toLowerCase();
      if (rl === 'high') highRiskCount++;
      else if (rl === 'medium') mediumRiskCount++;
      else lowRiskCount++;

      const ic = tryGet([summary.imageCount], 0);
      const lc = tryGet([summary.labelCount], 0);
      const tb = tryGet([summary.totalBoxes], 0);
      const zb = tryGet([summary.zeroByteCount], 0);
      const bf = tryGet([summary.badFormatCount], 0);
      const bc = tryGet([summary.badCoordCount], 0);
      const bcl = tryGet([summary.badClassCount], 0);
      const iwl = tryGet([summary.imagesWithoutLabelsCount], 0);
      const lwi = tryGet([summary.labelsWithoutImagesCount], 0);

      totalImages += ic; totalLabels += lc; totalBoxes += tb;
      zeroByteTotal += zb; badFormatTotal += bf; badCoordTotal += bc; badClassTotal += bcl;
      imagesWithoutLabelsTotal += iwl; labelsWithoutImagesTotal += lwi;

      if (zb > 0) issueMap.zero_byte_label.count += zb;
      if (bf > 0) issueMap.bad_format.count += bf;
      if (bc > 0) issueMap.bad_coord.count += bc;
      if (bcl > 0) issueMap.bad_class.count += bcl;
      if (iwl > 0) issueMap.image_without_label.count += iwl;
      if (lwi > 0) issueMap.label_without_image.count += lwi;

      if (rl === 'high' && highRiskRuns.length < 10) {
        highRiskRuns.push({
          id: row.id,
          createdAt: row.created_at,
          projectPath: row.target || '',
          imageCount: ic, labelCount: lc,
          zeroByteCount: zb, badFormatCount: bf, badCoordCount: bc,
          imagesWithoutLabelsCount: iwl,
        });
      }
    }

    const topIssues = Object.entries(issueMap)
      .filter(([, v]) => v.count > 0)
      .sort(([, a], [, b]) => b.count - a.count)
      .map(([type, v]) => ({ type, count: v.count, severity: v.severity }));

    return {
      ok: true, source: 'openaxiom', mode: 'readonly',
      range: {
        days,
        from: fromDate,
        to: new Date().toISOString(),
      },
      summary: {
        totalRuns, successRuns, failedRuns,
        lowRiskCount, mediumRiskCount, highRiskCount,
        latestRunAt,
        totalImages, totalLabels, totalBoxes,
        zeroByteTotal, badFormatTotal, badCoordTotal, badClassTotal,
        imagesWithoutLabelsTotal, labelsWithoutImagesTotal,
      },
      topIssues,
      recentHighRiskRuns: highRiskRuns,
      parseErrors,
      error: null,
    };
  });

  // ─── Governance Suggestions ─────────────────────────────────────────────────

  const SUGGESTION_RULES = [
    { type: 'zero_byte_label', severity: 'high', title: '处理 0 字节 label', action: '人工确认后从备份恢复或重新生成 label', check: (s: any) => (s.zeroByteCount || 0) > 0, count: (s: any) => s.zeroByteCount || 0 },
    { type: 'bad_format_label', severity: 'high', title: '修正格式错误 label', action: '修正格式错误的 label 行，确保每行恰好 5 列', check: (s: any) => (s.badFormatCount || 0) > 0, count: (s: any) => s.badFormatCount || 0 },
    { type: 'bad_coord_label', severity: 'high', title: '修正坐标越界 bbox', action: '修正越界的 bbox 坐标，确保 cx/cy/w/h 在 [0,1] 范围内，需要人工复核', check: (s: any) => (s.badCoordCount || 0) > 0, count: (s: any) => s.badCoordCount || 0 },
    { type: 'bad_class_id', severity: 'high', title: '修正 class_id 错误', action: '修正负数的 class_id，确保 class_id 为非负整数，需要人工确认类别映射表', check: (s: any) => (s.badClassCount || 0) > 0, count: (s: any) => s.badClassCount || 0 },
    { type: 'images_without_labels', severity: 'medium', title: '补充缺失 label', action: '为缺少 label 的图片补充标注，需要人工确认负样本策略', check: (s: any) => (s.imagesWithoutLabelsCount || 0) > 0, count: (s: any) => s.imagesWithoutLabelsCount || 0 },
    { type: 'labels_without_images', severity: 'medium', title: '清理孤立 label', action: '清理无对应图片的 label 文件，需要人工确认是否误删', check: (s: any) => (s.labelsWithoutImagesCount || 0) > 0, count: (s: any) => s.labelsWithoutImagesCount || 0 },
    { type: 'high_risk_dataset', severity: 'high', title: '高风险数据集诊断', action: '数据集存在高风险问题（0 字节 / 格式错误 / 坐标异常），建议优先处理', check: (s: any) => (s.riskLevel === 'high') || (s.highRiskCount || 0) > 0, count: (s: any) => 1 },
    { type: 'empty_labels', severity: 'low', title: '检查空 label 文件', action: '存在空 label 文件（无 bbox），需人工确认是正常负样本还是遗漏标注', check: (s: any) => (s.emptyLabelCount || 0) > 0, count: (s: any) => s.emptyLabelCount || 0 },
  ];

  function buildSuggestions(summary: any, runId?: string): any[] {
    const result: any[] = [];
    for (const rule of SUGGESTION_RULES) {
      if (rule.check(summary)) {
        result.push({
          id: `suggestion_${rule.type}_${randomUUID().slice(0, 8)}`,
          type: rule.type,
          severity: rule.severity,
          title: rule.title,
          description: `${rule.title}: 发现 ${rule.count(summary)} 个问题`,
          recommendedAction: rule.action,
          requiresHumanApproval: true,
          autoFixAllowed: false,
          count: rule.count(summary),
          relatedRunId: runId || '',
          relatedPaths: [],
        });
      }
    }
    return result;
  }

  app.post('/api/openaxiom/governance-suggestions', async (request: any, reply: any) => {
    const { runId, summary, raw, projectPath } = request.body || {};

    let effectiveSummary = summary;
    let effectiveRunId = runId;

    // If runId is provided, fetch from audit_logs
    if (runId && !summary) {
      const db = getDatabase();
      const row = db.prepare(`SELECT detail_json, target FROM audit_logs WHERE id = ? AND category = 'openaxiom'`).get(runId) as any;
      if (row) {
        try {
          const detail = JSON.parse(row.detail_json || '{}');
          effectiveSummary = detail.summary || {};
          effectiveRunId = runId;
        } catch { /* ignore */ }
      } else {
        return reply.code(404).send({
          ok: false, error: { code: 'NOT_FOUND', message: 'Diagnostic run not found', detail: '' },
        });
      }
    }

    if (!effectiveSummary || Object.keys(effectiveSummary).length === 0) {
      return reply.code(400).send({
        ok: false, error: { code: 'INVALID_PARAMS', message: 'summary or runId with valid data required', detail: '' },
      });
    }

    const suggestions = buildSuggestions(effectiveSummary, effectiveRunId);

    return {
      ok: true, source: 'openaxiom', mode: 'readonly_governance',
      projectPath: projectPath || '',
      runId: effectiveRunId,
      summary: effectiveSummary,
      suggestions,
      totalCount: suggestions.length,
      highCount: suggestions.filter((s: any) => s.severity === 'high').length,
      mediumCount: suggestions.filter((s: any) => s.severity === 'medium').length,
      lowCount: suggestions.filter((s: any) => s.severity === 'low').length,
      error: null,
    };
  });

  // ─── Governance Tasks CRUD ─────────────────────────────────────────────────

  app.post('/api/openaxiom/governance-tasks', async (request: any, reply: any) => {
    const { runId, suggestions, projectPath } = request.body || {};
    if (!suggestions || !Array.isArray(suggestions) || suggestions.length === 0) {
      return reply.code(400).send({
        ok: false, error: { code: 'INVALID_PARAMS', message: 'suggestions array is required', detail: '' },
      });
    }

    const db = getDatabase();
    const now = new Date().toISOString();
    const taskIds: string[] = [];

    for (const sug of suggestions) {
      const taskId = 'gt_' + randomUUID();
      const detail = JSON.stringify({
        severity: sug.severity,
        title: sug.title,
        description: sug.description,
        recommendedAction: sug.recommendedAction,
        requiresHumanApproval: true,
        autoFixAllowed: false,
        count: sug.count || 0,
        relatedRunId: runId || '',
        relatedPaths: sug.relatedPaths || [],
        source: 'openaxiom',
        mode: 'manual_review',
        taskType: sug.type,
      });

      db.prepare(`
        INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at)
        VALUES (?, 'openaxiom_task', ?, ?, 'open', ?, ?)
      `).run(taskId, sug.type, projectPath || '', detail, now);
      taskIds.push(taskId);
    }

    return { ok: true, source: 'openaxiom', mode: 'manual_review', taskIds, count: taskIds.length };
  });

  app.get('/api/openaxiom/governance-tasks', async (request: any, reply: any) => {
    const db = getDatabase();
    const query = request.query || {};
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize, 10) || 20));
    const offset = (page - 1) * pageSize;
    const status = query.status || '';
    const severity = query.severity || '';
    const taskType = query.type || '';
    const keyword = query.keyword || '';

    let where = "WHERE category = 'openaxiom_task'";
    const params: any[] = [];

    if (status) { where += ' AND result = ?'; params.push(status); }
    if (severity) { where += ' AND detail_json LIKE ?'; params.push(`%"severity":"${severity}"%`); }
    if (taskType) { where += ' AND action = ?'; params.push(taskType); }
    if (keyword) { where += ' AND (target LIKE ? OR detail_json LIKE ?)'; params.push(`%${keyword}%`, `%${keyword}%`); }

    const countRow = db.prepare(`SELECT COUNT(*) as cnt FROM audit_logs ${where}`).get(...params) as any;
    const total = countRow?.cnt || 0;

    const rows = db.prepare(
      `SELECT id, action, target, result, detail_json, created_at FROM audit_logs ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).all(...params, pageSize, offset) as any[];

    const items = rows.map((row: any) => {
      let detail: any = {};
      try { detail = JSON.parse(row.detail_json || '{}'); } catch { /* ignore */ }
      return {
        id: row.id,
        createdAt: row.created_at,
        type: row.action,
        projectPath: row.target || '',
        status: row.result || 'open',
        severity: detail.severity || 'low',
        title: detail.title || '',
        description: detail.description || '',
        count: detail.count || 0,
        relatedRunId: detail.relatedRunId || '',
      };
    });

    return { ok: true, source: 'openaxiom', mode: 'manual_review', items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  });

  app.get('/api/openaxiom/governance-tasks/:id', async (request: any, reply: any) => {
    const db = getDatabase();
    const row = db.prepare(`SELECT id, action, target, result, detail_json, created_at FROM audit_logs WHERE id = ? AND category = 'openaxiom_task'`).get(request.params.id) as any;
    if (!row) return reply.code(404).send({ ok: false, error: { code: 'NOT_FOUND', message: 'Task not found', detail: '' } });

    let detail: any = {};
    try { detail = JSON.parse(row.detail_json || '{}'); } catch { /* ignore */ }
    return {
      ok: true, source: 'openaxiom', mode: 'manual_review',
      id: row.id, createdAt: row.created_at, type: row.action,
      projectPath: row.target || '', status: row.result || 'open',
      severity: detail.severity || 'low', title: detail.title || '',
      description: detail.description || '', recommendedAction: detail.recommendedAction || '',
      requiresHumanApproval: true, autoFixAllowed: false,
      count: detail.count || 0, relatedRunId: detail.relatedRunId || '',
      relatedPaths: detail.relatedPaths || [],
    };
  });

  app.patch('/api/openaxiom/governance-tasks/:id', async (request: any, reply: any) => {
    const db = getDatabase();
    const { status } = request.body || {};
    const validStatuses = ['open', 'reviewing', 'resolved', 'ignored'];
    if (!status || !validStatuses.includes(status)) {
      return reply.code(400).send({ ok: false, error: { code: 'INVALID_STATUS', message: 'Status must be: ' + validStatuses.join(', '), detail: '' } });
    }
    const row = db.prepare(`SELECT id, detail_json FROM audit_logs WHERE id = ? AND category = 'openaxiom_task'`).get(request.params.id) as any;
    if (!row) return reply.code(404).send({ ok: false, error: { code: 'NOT_FOUND', message: 'Task not found', detail: '' } });

    let detail: any = {};
    try { detail = JSON.parse(row.detail_json || '{}'); } catch { /* ignore */ }
    detail.statusHistory = detail.statusHistory || [];
    detail.statusHistory.push({ from: row.result, to: status, at: new Date().toISOString() });

    db.prepare(`UPDATE audit_logs SET result = ?, detail_json = ? WHERE id = ?`)
      .run(status, JSON.stringify(detail), request.params.id);

    return { ok: true, source: 'openaxiom', mode: 'manual_review', id: request.params.id, status };
  });

  app.post('/api/openaxiom/governance-tasks/:id/rerun', async (request: any, reply: any) => {
    const db = getDatabase();
    const row = db.prepare(`SELECT id, target, detail_json FROM audit_logs WHERE id = ? AND category = 'openaxiom_task'`).get(request.params.id) as any;
    if (!row) return reply.code(404).send({ ok: false, error: { code: 'NOT_FOUND', message: 'Task not found', detail: '' } });

    const projectPath = row.target || '';
    let detail: any = {};
    try { detail = JSON.parse(row.detail_json || '{}'); } catch { /* ignore */ }

    // Attempt to find imagesDir/labelsDir from associated diagnostic run
    let imagesDir = '', labelsDir = '';
    if (detail.relatedRunId) {
      const runRow = db.prepare(`SELECT detail_json FROM audit_logs WHERE id = ? AND category = 'openaxiom'`).get(detail.relatedRunId) as any;
      if (runRow) {
        try {
          const runDetail = JSON.parse(runRow.detail_json || '{}');
          const raw = runDetail.raw || {};
          imagesDir = raw?.projectScan?.images_dir || '';
          labelsDir = raw?.projectScan?.labels_dir || '';
        } catch { /* ignore */ }
      }
    }

    if (!imagesDir || !labelsDir) {
      return { ok: false, source: 'openaxiom', error: { code: 'NO_PATHS', message: 'Cannot determine imagesDir/labelsDir from task or related run', detail: '' } };
    }

    const [psResult, hcResult, ydResult] = await Promise.all([
      runCli('project_scan', { project_path: projectPath }, 30_000),
      runCli('label_health_check', { images_dir: imagesDir, labels_dir: labelsDir }, 60_000),
      runCli('yolo_dry_run', { images_dir: imagesDir, labels_dir: labelsDir }, 60_000),
    ]);

    return {
      ok: psResult.ok, source: 'openaxiom', mode: 'readonly',
      rerunFrom: request.params.id,
      summary: {
        imageCount: psResult.result?.image_count ?? 0,
        labelCount: hcResult.result?.label_count ?? 0,
        matchedCount: ydResult.result?.matched_count ?? 0,
        zeroByteCount: hcResult.result?.zero_byte_count ?? 0,
        badFormatCount: hcResult.result?.bad_format_count ?? 0,
        badCoordCount: hcResult.result?.bad_coord_count ?? 0,
        badClassCount: hcResult.result?.bad_class_count ?? 0,
        issues: [
          ...(hcResult.result?.issues || []),
          ...(ydResult.result?.issues || []),
        ],
      },
    };
  });
}
