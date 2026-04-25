import { getDatabase } from '../db/builtin-sqlite.js';
import fs from 'node:fs';
import path from 'node:path';

interface IntentPattern {
  id: string;
  keywords: string[];
  keywords_weighted: Record<string, number>;
  exclude_keywords: string[];
  template: string;
  params: Record<string, any>;
  base_confidence: number;
  description: string;
}

interface IntentResult {
  ok: boolean;
  intent_id: string;
  template: string;
  params: Record<string, any>;
  confidence: number;
  matched_keywords: string[];
  excluded_keywords: string[];
  user_message: string;
  clarification_needed: boolean;
  clarification_question?: string;
  alternatives?: Array<{ template: string; confidence: number; description: string }>;
  source: 'exact' | 'fuzzy' | 'partial' | 'llm_fallback';
}

interface IntentContext {
  last_intent_id: string | null;
  last_template: string | null;
  last_job_id: string | null;
  last_confidence: number;
  session_id: string;
  history: Array<{
    intent_id: string;
    template: string;
    user_input: string;
    confidence: number;
    timestamp: string;
  }>;
}

const SESSION_TTL = 30 * 60 * 1000;
const CLARIFICATION_THRESHOLD = 0.45;
const AUTO_EXECUTE_THRESHOLD = 0.7;
const FUZZY_THRESHOLD = 0.6;

let sessionContext: IntentContext = {
  last_intent_id: null, last_template: null, last_job_id: null,
  last_confidence: 0, session_id: crypto.randomUUID(), history: [],
};

const BUILTIN_PATTERNS: IntentPattern[] = [
  {
    id: 'full-flywheel', base_confidence: 0.92,
    keywords: ['全链路', '完整流程', '完整飞轮', 'full flywheel', '从头到尾', '一条龙'],
    keywords_weighted: { '飞轮': 0.6, '完整': 0.4, '全链路': 0.5, 'full': 0.3, 'flywheel': 0.4 },
    exclude_keywords: ['只抽帧', 'only extract', '只看'],
    template: 'tpl-minimal-full-chain-flywheel',
    params: {}, description: '视频→抽帧→清洗→数据集→切分→训练→评估→归档 全流程',
  },
  {
    id: 'dataset-flywheel', base_confidence: 0.88,
    keywords: ['现有数据集', '已有数据', '加载数据集', 'dataset flywheel', '用数据集', 'data train'],
    keywords_weighted: { '数据集': 0.5, '加载': 0.3, '已有': 0.3, 'data': 0.2, 'dataset': 0.3 },
    exclude_keywords: ['新视频', 'new video', '抽帧'],
    template: 'tpl-existing-dataset-flywheel',
    params: {}, description: '已有数据集→切分→训练→评估→归档',
  },
  {
    id: 'front-chain-light', base_confidence: 0.85,
    keywords: ['抽帧', '提取帧', '视频处理', '拆帧', 'frame extract', '视频转图片', '取帧'],
    keywords_weighted: { '抽帧': 0.6, '视频': 0.3, '帧': 0.4, 'frame': 0.3, 'extract': 0.3 },
    exclude_keywords: ['训练', 'train', '评估', 'eval'],
    template: 'tpl-front-chain-light',
    params: {}, description: '视频源→抽帧→清洗→注册数据集→切分',
  },
  {
    id: 'train-yolo', base_confidence: 0.9,
    keywords: ['训练', 'train', 'yolo', '模型训练', '训练模型', '跑训练', '开始训练', 'train model', '训练yolo'],
    keywords_weighted: { '训练': 0.5, 'train': 0.4, 'yolo': 0.3, '模型': 0.2 },
    exclude_keywords: ['评估', '抽帧'], template: 'train-only',
    params: { model: 'yolov8n.pt', epochs: 100, imgsz: 640 },
    description: '仅训练 (100 epochs, YOLOv8n)',
  },
  {
    id: 'train-yolo-fast', base_confidence: 0.85,
    keywords: ['快速训练', '试跑', '测试训练', '小跑', 'few epochs', '快速跑', '试试训练'],
    keywords_weighted: { '快速': 0.3, '试': 0.3, '测试': 0.2, 'few': 0.2 },
    exclude_keywords: [], template: 'train-only',
    params: { model: 'yolov8n.pt', epochs: 5, imgsz: 320 },
    description: '快速试跑 (5 epochs, 低分辨率)',
  },
  {
    id: 'evaluate-model', base_confidence: 0.85,
    keywords: ['评估', 'evaluate', '评测', '测模型', '验证', 'validation', 'val', '测试模型'],
    keywords_weighted: { '评估': 0.5, 'evaluate': 0.4, '验证': 0.3, 'val': 0.2 },
    exclude_keywords: ['训练'], template: 'evaluate-only',
    params: {}, description: '加载模型→评估→报告',
  },
  {
    id: 'deploy-model', base_confidence: 0.8,
    keywords: ['部署', '发布', '上线', 'deploy', 'release', '推到生产', 'go live'],
    keywords_weighted: { '部署': 0.5, 'deploy': 0.4, '发布': 0.3 },
    exclude_keywords: [], template: 'evaluate-only',
    params: { deploy_mode: true }, description: '评估通过后部署模型',
  },
  {
    id: 'health-check', base_confidence: 0.95,
    keywords: ['健康', '体检', '巡检', '检查', 'health', 'check', '诊断', '系统状态', '啥情况'],
    keywords_weighted: { '健康': 0.5, '检查': 0.3, 'health': 0.4, '状态': 0.2 },
    exclude_keywords: [], template: '',
    params: { run_patrol: true }, description: 'AIP 系统健康巡检',
  },
  {
    id: 'sam-segment', base_confidence: 0.82,
    keywords: ['sam', '分割', 'segment', '语义分割', '抠图', 'mask'],
    keywords_weighted: { 'sam': 0.5, '分割': 0.4, 'segment': 0.3, '抠图': 0.3 },
    exclude_keywords: [], template: '',
    params: { run_sam: true }, description: 'SAM 语义分割',
  },
  {
    id: 'view-data', base_confidence: 0.8,
    keywords: ['查看数据', '看看', '数据', '数据集', '样本', '图片', '标注', 'label', '浏览数据'],
    keywords_weighted: { '看': 0.3, '数据': 0.4, '数据集': 0.3, '浏览': 0.2 },
    exclude_keywords: ['训练', '处理'], template: '',
    params: { view_data: true }, description: '查看数据集和标注',
  },
  {
    id: 'report', base_confidence: 0.85,
    keywords: ['报告', '报表', '汇总', '总结', '总览', 'report', '总结一下', '这段时间'],
    keywords_weighted: { '报告': 0.5, 'report': 0.4, '总结': 0.3 },
    exclude_keywords: [], template: '',
    params: { run_report: true }, description: '生成运维/训练报告',
  },
  {
    id: 'batch-infer', base_confidence: 0.78,
    keywords: ['推理', 'infer', '预测', '跑一下', '识别', 'detect', '检测'],
    keywords_weighted: { '推理': 0.4, 'infer': 0.3, '检测': 0.3, '识别': 0.3, 'detect': 0.3 },
    exclude_keywords: ['训练'], template: '',
    params: { run_inference: true }, description: '用已有模型跑推理/检测',
  },
  {
    id: 'help', base_confidence: 0.98,
    keywords: ['帮助', 'help', '你能', '怎么办', '怎么用', '功能', '有哪些', '会什么', '说明'],
    keywords_weighted: { '帮助': 0.5, 'help': 0.4, '什么': 0.2, '功能': 0.3 },
    exclude_keywords: [], template: '',
    params: { show_help: true }, description: '显示 AIP 能力说明',
  },
  {
    id: 'stop-cancel', base_confidence: 0.9,
    keywords: ['停止', '取消', '停', 'cancel', 'stop', '别跑了', '中断', '终止', '不干了'],
    keywords_weighted: { '停': 0.5, '取消': 0.4, 'cancel': 0.3, 'stop': 0.3 },
    exclude_keywords: [], template: '',
    params: { command: 'cancel' }, description: '取消正在运行的任务',
  },
  {
    id: 'pause-job', base_confidence: 0.85,
    keywords: ['暂停', 'pause', '歇会', '停一下', '先停'],
    keywords_weighted: { '暂停': 0.5, 'pause': 0.3 },
    exclude_keywords: [], template: '',
    params: { command: 'pause' }, description: '暂停任务',
  },
  {
    id: 'resume-job', base_confidence: 0.85,
    keywords: ['恢复', 'resume', '继续', '重新跑', '接着跑'],
    keywords_weighted: { '恢复': 0.5, 'resume': 0.3, '继续': 0.3 },
    exclude_keywords: [], template: '',
    params: { command: 'resume' }, description: '恢复暂停的任务',
  },
];

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
  return dp[m][n];
}

function fuzzyKeywordMatch(input: string, keyword: string): number {
  const lower = input.toLowerCase();
  const kw = keyword.toLowerCase();
  if (lower.includes(kw)) return 1;
  const words = lower.split(/\s+/);
  for (const word of words) {
    if (word.length < 2) continue;
    if (word === kw) return 1;
    if (word.includes(kw) || kw.includes(word)) return 0.9;
    const dist = levenshtein(word, kw);
    if (dist <= 1 && word.length >= kw.length) return 0.85;
    if (dist / Math.max(word.length, kw.length) < 0.25) return 0.7;
  }
  return 0;
}

function loadUserPatterns(): IntentPattern[] {
  const userPath = path.resolve(process.cwd(), '../../scripts/openclaw/intent_rules.user.json');
  try {
    if (fs.existsSync(userPath)) {
      const raw = JSON.parse(fs.readFileSync(userPath, 'utf-8'));
      const patterns = Array.isArray(raw) ? raw : raw.rules || [];
      return patterns.map((p: any, i: number) => ({
        id: p.id || `user_rule_${i}`,
        keywords: p.keywords || p.keywords_any || [],
        keywords_weighted: p.keywords_weighted || Object.fromEntries((p.keywords || p.keywords_any || []).map((k: string) => [k, 0.3])),
        exclude_keywords: p.exclude_keywords || [],
        template: p.template || '',
        params: p.params || {},
        base_confidence: p.base_confidence || p.confidence || 0.7,
        description: p.description || `User rule: ${p.id || i}`,
      }));
    }
  } catch { }
  return [];
}

function logIntent(db: any, userInput: string, result: IntentResult) {
  try {
    db.prepare(`
      INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at)
      VALUES (?, 'intent_engine', 'resolve_intent', ?, ?, ?, ?)
    `).run(
      crypto.randomUUID(), result.intent_id, result.confidence > AUTO_EXECUTE_THRESHOLD ? 'success' : 'partial',
      JSON.stringify({ user_input: userInput, intent: result.intent_id, template: result.template, confidence: result.confidence, matched: result.matched_keywords }),
      new Date().toISOString(),
    );
  } catch { }
}

export function resolveIntent(userInput: string, contextOverrides?: Partial<IntentContext>): IntentResult {
  const input = userInput.trim();
  if (!input) return { ok: false, intent_id: 'empty', template: '', params: {}, confidence: 0, matched_keywords: [], excluded_keywords: [], user_message: input, clarification_needed: true, clarification_question: '你想让我做什么？', source: 'exact' };

  const db = getDatabase();
  const allPatterns = [...BUILTIN_PATTERNS, ...loadUserPatterns()];
  const matches: Array<{ pattern: IntentPattern; score: number; matched_kws: string[]; excluded_kws: string[] }> = [];

  for (const pattern of allPatterns) {
    let score = 0;
    const matched_kws: string[] = [];
    const excluded_kws: string[] = [];

    for (const kw of pattern.keywords) {
      const sim = fuzzyKeywordMatch(input, kw);
      if (sim > 0) {
        const weight = pattern.keywords_weighted[kw] || 0.3;
        score += sim * weight;
        matched_kws.push(kw);
      }
    }

    for (const ek of pattern.exclude_keywords) {
      if (fuzzyKeywordMatch(input, ek) > 0.7) {
        score -= 0.5;
        excluded_kws.push(ek);
      }
    }

    if (matched_kws.length > 0 || excluded_kws.length > 0) {
      const normalizedScore = Math.min(pattern.base_confidence * (score + 0.1), 0.99);
      matches.push({ pattern, score: normalizedScore, matched_kws, excluded_kws });
    }
  }

  matches.sort((a, b) => b.score - a.score);

  if (matches.length === 0) {
    const result: IntentResult = {
      ok: true, intent_id: 'unknown', template: '', params: {}, confidence: 0,
      matched_keywords: [], excluded_keywords: [], user_message: input,
      clarification_needed: true,
      clarification_question: `我不太确定你想做什么。你可以说具体点，比如：\n  • "训练 YOLO 模型"\n  • "检查系统状态"\n  • "跑全链路飞轮"`,
      source: 'partial',
    };
    logIntent(db, input, result);
    return result;
  }

  const best = matches[0];
  const alternatives = matches.slice(1, 4).map(m => ({
    template: m.pattern.template, confidence: Math.round(m.score * 100) / 100,
    description: m.pattern.description,
  }));

  const clarification_needed = best.score < AUTO_EXECUTE_THRESHOLD;
  let clarification_question: string | undefined;

  if (clarification_needed && best.score >= CLARIFICATION_THRESHOLD) {
    clarification_question = `你是指「${best.pattern.description}」吗？(置信度 ${Math.round(best.score * 100)}%)`;
    if (alternatives.length > 0) {
      clarification_question += `\n或者：${alternatives.map(a => `「${a.description}」`).join('、')}？`;
    }
  } else if (clarification_needed) {
    clarification_question = `没太明白你的意思。你想做哪类操作？\n  • 训练/评估模型\n  • 处理视频数据\n  • 查看系统状态\n  • 控制任务 (暂停/恢复/取消)`;
  }

  const source: IntentResult['source'] = best.matched_kws.some(k => input.toLowerCase().includes(k.toLowerCase())) ? 'exact' : 'fuzzy';

  const result: IntentResult = {
    ok: true, intent_id: best.pattern.id, template: best.pattern.template,
    params: { ...best.pattern.params },
    confidence: Math.round(best.score * 100) / 100,
    matched_keywords: best.matched_kws, excluded_keywords: best.excluded_kws,
    user_message: input,
    clarification_needed,
    clarification_question,
    alternatives: alternatives.length > 0 ? alternatives : undefined,
    source,
  };

  sessionContext.last_intent_id = best.pattern.id;
  sessionContext.last_template = best.pattern.template;
  sessionContext.last_confidence = best.score;
  sessionContext.history.push({
    intent_id: best.pattern.id, template: best.pattern.template,
    user_input: input, confidence: best.score, timestamp: new Date().toISOString(),
  });
  if (sessionContext.history.length > 20) sessionContext.history.shift();

  logIntent(db, input, result);
  return result;
}

export function getContext(): IntentContext {
  return { ...sessionContext };
}

export function resetContext() {
  sessionContext = {
    last_intent_id: null, last_template: null, last_job_id: null,
    last_confidence: 0, session_id: crypto.randomUUID(), history: [],
  };
}

export function setContextJob(jobId: string) {
  sessionContext.last_job_id = jobId;
}

export function getPatterns(): { builtin: IntentPattern[]; user: IntentPattern[] } {
  return { builtin: BUILTIN_PATTERNS, user: loadUserPatterns() };
}

export { BUILTIN_PATTERNS, AUTO_EXECUTE_THRESHOLD, CLARIFICATION_THRESHOLD };
export type { IntentPattern, IntentResult, IntentContext };
