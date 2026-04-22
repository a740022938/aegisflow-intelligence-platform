// ============================================================
// draftStorage.ts — Workflow Composer 本地草稿持久化
// ============================================================
import type { WorkflowDraft } from './workflowSchema';
import { NODE_REGISTRY, type NodeType } from './workflowSchema';

const STORAGE_KEY = 'wf_composer_drafts';
const RECOVERY_KEY = 'wf_composer_recovery';
const SCHEMA_VERSION = 2;

const LEGACY_NODE_TYPE_MAP: Record<string, string> = {
  dataset_loader: 'dataset-loader',
  video_source: 'video-source',
  frame_extract: 'frame-extract',
  frame_clean: 'frame-clean',
  dataset_register: 'dataset-register',
  dataset_split: 'dataset-split',
  train_model: 'train-model',
  evaluate_model: 'evaluate-model',
  archive_model: 'archive-model',
  dataset_snapshot: 'dataset-snapshot',
  dataset_stats: 'dataset-stats',
  compare_baseline: 'compare-baseline',
  badcase_mine: 'badcase-mine',
  export_model: 'export-model',
  release_validate: 'release-validate',
  hardcase_feedback: 'hardcase-feedback',
  retrain_trigger: 'retrain-trigger',
  yolo_detect: 'yolo-detect',
  sam_segment: 'sam-segment',
  classifier_verify: 'classifier-verify',
  tracker_run: 'tracker',
  eval_report: 'eval-report',
  output_archive: 'output-archive',
};

function normalizeNodeType(raw: any): string {
  const t = String(raw || '').trim();
  if (!t) return 'reroute';
  if (LEGACY_NODE_TYPE_MAP[t]) return LEGACY_NODE_TYPE_MAP[t];
  if (LEGACY_NODE_TYPE_MAP[t.toLowerCase()]) return LEGACY_NODE_TYPE_MAP[t.toLowerCase()];
  return t;
}

function hydrateParamsWithDefaults(nodeType: string, rawParams: any): Record<string, unknown> {
  const params = rawParams && typeof rawParams === 'object' ? { ...rawParams } : {};
  const cfg = (NODE_REGISTRY as Record<string, any>)[nodeType as NodeType];
  if (!cfg || !Array.isArray(cfg.params)) return params;
  for (const p of cfg.params) {
    const cur = params[p.key];
    const missing = cur === undefined || cur === null || cur === '';
    if (!missing) continue;
    const dv = p.default !== undefined ? p.default : p.defaultValue;
    if (dv !== undefined) params[p.key] = dv;
  }
  return params;
}

function migrateDraft(input: any): WorkflowDraft {
  const base = newDraft();
  const draft = { ...base, ...(input || {}) } as WorkflowDraft & { schemaVersion?: number };
  const schemaVersion = Number((input as any)?.schemaVersion || 1);

  draft.nodes = Array.isArray((input as any)?.nodes) ? (input as any).nodes.map((n: any) => ({
    ...(function () {
      const mappedType = normalizeNodeType(n?.type);
      return {
        id: String(n?.id || `node_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`),
        type: mappedType as any,
        label: String(n?.label || 'Untitled'),
        position: n?.position && Number.isFinite(n.position.x) && Number.isFinite(n.position.y) ? n.position : { x: 0, y: 0 },
        size: n?.size && Number.isFinite(n.size.width) && Number.isFinite(n.size.height)
          ? { width: Math.max(220, Number(n.size.width)), height: Math.max(74, Number(n.size.height)) }
          : { width: 260, height: 180 },
        collapsed: !!n?.collapsed,
        params: hydrateParamsWithDefaults(mappedType, n?.params),
        executable: typeof n?.executable === 'boolean' ? n.executable : true,
        frozenHint: n?.frozenHint ? String(n.frozenHint) : undefined,
      };
    })(),
  })) : [];

  draft.edges = Array.isArray((input as any)?.edges) ? (input as any).edges.map((e: any) => ({
    id: String(e?.id || `edge_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`),
    source: String(e?.source || ''),
    target: String(e?.target || ''),
    sourceHandle: e?.sourceHandle ? String(e.sourceHandle) : undefined,
    targetHandle: e?.targetHandle ? String(e.targetHandle) : undefined,
  })).filter((e: any) => e.source && e.target) : [];

  draft.params = draft.params && typeof draft.params === 'object' ? draft.params : {};
  draft.version = draft.version || '0.1.0';
  draft.status = (draft.status as any) || 'draft';
  (draft as any).schemaVersion = SCHEMA_VERSION;
  if (!draft.created_at) draft.created_at = new Date().toISOString();
  draft.updated_at = new Date().toISOString();

  if (schemaVersion < 2) {
    draft.nodes = draft.nodes.map((n: any) => ({ ...n, size: n.size || { width: 260, height: 180 } }));
  }
  return draft;
}

export function saveDraft(draft: WorkflowDraft): void {
  const drafts = listDrafts();
  const idx = drafts.findIndex(d => d.id === draft.id);
  const updated = migrateDraft({ ...draft, updated_at: new Date().toISOString() });
  if (idx >= 0) { drafts[idx] = updated; } else { drafts.push(updated); }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

export function saveRecoveryDraft(draft: WorkflowDraft): void {
  try {
    const updated = migrateDraft({ ...draft, updated_at: new Date().toISOString() });
    localStorage.setItem(RECOVERY_KEY, JSON.stringify(updated));
  } catch {}
}

export function loadRecoveryDraft(): WorkflowDraft | null {
  try {
    const raw = localStorage.getItem(RECOVERY_KEY);
    if (!raw) return null;
    return migrateDraft(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function clearRecoveryDraft(): void {
  try { localStorage.removeItem(RECOVERY_KEY); } catch {}
}

export function listDrafts(): WorkflowDraft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // 兼容：过滤掉结构不合法的草稿，防止旧格式导致崩溃
    return parsed
      .filter((d: any) => d && typeof d === 'object' && d.id && Array.isArray(d.nodes))
      .map((d: any) => migrateDraft(d));
  } catch {
    // 损坏的 localStorage 数据，清除并返回空
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    return [];
  }
}

export function loadDraft(id: string): WorkflowDraft | null {
  try {
    const draft = listDrafts().find(d => d.id === id);
    if (!draft) return null;
    return migrateDraft(draft);
  } catch {
    return null;
  }
}

export function deleteDraft(id: string): void {
  const drafts = listDrafts().filter(d => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

export function newDraft(): WorkflowDraft {
  return {
    id: `draft_${Date.now()}`,
    name: '未命名流程',
    version: '0.1.0',
    description: '',
    nodes: [],
    edges: [],
    params: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'draft',
    ...( { schemaVersion: SCHEMA_VERSION } as any ),
  };
}
