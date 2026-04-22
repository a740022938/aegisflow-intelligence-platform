/**
 * F10: Vision Bus - 视觉能力总线预留接口
 *
 * 为 YOLO / SAM / 分类器 / Tracker 的后续组合预留统一接入位。
 * 不实装任何实际推理逻辑，仅提供：
 * 1. 视觉能力目录（catalog）- 发现已注册的视觉管线
 * 2. 视觉中间结果查询 - 查询 sam_handoffs / sam_segmentations / classifier_verifications / tracker_runs
 *
 * F10 约束：
 * - 只做接口预留，不实装 SAM/分类器/Tracker
 * - 不修改已有 step executor
 * 
 * M6 更新：catalog 发现层已插件化，支持从 PluginManager 动态查询 vision 能力
 */

import { getDatabase } from '../db/builtin-sqlite.js';
import path from 'node:path';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

// M10: 启动期采用 discovery/registry/activation 分层，避免 disabled 进入激活路径
type PluginManager = any;
type PluginInfo = any;
const VISION_PLUGIN_DISCOVERY_ENABLED = true;

// ── Vision Pipeline Catalog ───────────────────────────────────────────────────

/** 视觉管线元数据 */
interface VisionPipelineEntry {
  id: string;
  label: string;
  description: string;
  /** 工作流 step_key 链 */
  workflow_steps: string[];
  /** 该管线产出的 artifacts 类型 */
  output_artifact_types: string[];
  /** 关联的中间结果表 */
  intermediate_tables: string[];
  /** 输入参数 */
  input_params: { key: string; description: string; required: boolean }[];
  /** 当前状态 */
  status: 'frozen' | 'active' | 'planned';
  /** frozen 原因（如有） */
  frozen_reason?: string;
}

/** 视觉能力目录 */
interface VisionCatalog {
  ok: boolean;
  version: string;
  pipelines: VisionPipelineEntry[];
  artifact_type_registry: {
    type: string;
    description: string;
    source_pipeline: string;
  }[];
  total_pipelines: number;
  active_pipelines: number;
  _meta?: {
    builtin_count: number;
    plugin_count: number;
    plugin_system_active: boolean;
    official_bridge_count?: number;
    planned_bridge_count?: number;
    official_bridges?: Array<{
      plugin_id: string;
      source_type: string;
      status: string;
      managed_by: string;
    }>;
  };
}

// ── Plugin Runtime State ─────────────────────────────────────────────────────

export interface VisionPluginRuntimeStatus {
  plugin_system_enabled: boolean;
  plugin_system_active: boolean;
  init_failed: boolean;
  error_reason: string | null;
  plugin_count: number;
  discovered_count: number;
  init_success_count: number;
  init_failed_count: number;
  init_run_id: string | null;
  init_attempted: boolean;
  init_completed_at: string | null;
}

export interface PersistedPluginRegistryRecord {
  plugin_id: string;
  plugin_name: string;
  version: string;
  capability: string;
  source: string;
  enabled: boolean;
  active: boolean;
  init_status: string;
  error_reason: string | null;
  discovered_at: string;
  initialized_at: string | null;
  updated_at: string;
  // V1 扩展字段（来自 plugin_registry 表，但与旧 type 有 gap）
  name?: string;
  risk_level?: string;
  category?: string;
  status?: string;
  execution_mode?: string;
  dry_run_supported?: boolean;
  requires_approval?: boolean;
  ui_node_type?: string;
  tags?: string;
  manifest_json?: string;
}

export interface VisionPluginInitSummary {
  id: string;
  init_status: string;
  plugin_system_enabled: boolean;
  plugin_system_active: boolean;
  discovered_count: number;
  success_count: number;
  failed_count: number;
  error_summary: string | null;
  started_at: string;
  finished_at: string;
  created_at: string;
}

export interface PersistedPluginEventRecord {
  id: string;
  plugin_id: string;
  plugin_name: string;
  action: 'enable' | 'disable';
  before_status: string;
  after_status: string;
  reason: string | null;
  created_at: string;
}

interface VisionPluginInitOptions {
  enabled?: boolean;
  pluginDir?: string;
  logLevel?: string;
}

export interface OfficialVisionBridgeRecord {
  plugin_id: string;
  display_name: string;
  capability: string;
  source_type: 'builtin_official' | 'planned_official' | 'official_plugin_shell';
  status: 'active' | 'frozen' | 'planned';
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  managed_by: string;
  enabled: boolean;
}

export interface VisionSamExecutionTrialStatus {
  execute_trial_global_enabled: boolean;
  execute_trial_vision_sam_enabled: boolean;
  circuit_open: boolean;
  consecutive_failures: number;
  last_failure_reason: string | null;
  last_executed_at: string | null;
  failure_threshold: number;
}

interface VisionPluginRuntimeState {
  plugin_system_enabled: boolean;
  plugin_system_active: boolean;
  init_attempted: boolean;
  init_failed: boolean;
  error_reason: string | null;
  plugin_count: number;
  discovered_count: number;
  init_success_count: number;
  init_failed_count: number;
  init_run_id: string | null;
  init_completed_at: string | null;
  plugin_manager: PluginManager | null;
  discovered_plugins: PluginInfo[];
  plugin_pipelines: VisionPipelineEntry[];
}

const visionPluginRuntimeState: VisionPluginRuntimeState = {
  plugin_system_enabled: VISION_PLUGIN_DISCOVERY_ENABLED,
  plugin_system_active: false,
  init_attempted: false,
  init_failed: false,
  error_reason: null,
  plugin_count: 0,
  discovered_count: 0,
  init_success_count: 0,
  init_failed_count: 0,
  init_run_id: null,
  init_completed_at: null,
  plugin_manager: null,
  discovered_plugins: [],
  plugin_pipelines: [],
};

let visionPluginInitPromise: Promise<void> | null = null;

function countPluginCandidates(pluginDir: string): number {
  try {
    const entries = readdirSync(pluginDir, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory()).length;
  } catch {
    return 0;
  }
}

const ALLOWED_CAPABILITIES = new Set([
  'report',
  'read',
  'compute',
  'notify',
  'transform',
  'export',
  'vision',
]);

const ALLOWED_RISK_LEVELS = new Set(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
const CORE_VERSION = process.env.AGI_CORE_VERSION || '6.5.0';
const EXECUTE_TRIAL_GLOBAL_ENABLED = process.env.PLUGIN_EXECUTE_TRIAL_ENABLED === 'true';
const EXECUTE_TRIAL_VISION_SAM_ENABLED = process.env.PLUGIN_EXECUTE_VISION_SAM_ENABLED === 'true';
const EXECUTE_TRIAL_FAILURE_THRESHOLD = Math.max(
  1,
  Number(process.env.PLUGIN_EXECUTE_TRIAL_FAILURE_THRESHOLD || 3)
);
const OFFICIAL_VISION_BRIDGES: OfficialVisionBridgeRecord[] = [
  {
    plugin_id: 'vision-yolo',
    display_name: 'Official Vision YOLO',
    capability: 'vision',
    source_type: 'builtin_official',
    status: 'frozen',
    risk_level: 'MEDIUM',
    managed_by: 'local-api-core',
    enabled: true,
  },
  {
    plugin_id: 'vision-sam',
    display_name: 'Official Vision SAM',
    capability: 'vision',
    source_type: 'official_plugin_shell',
    status: 'active',
    risk_level: 'MEDIUM',
    managed_by: 'local-api-core',
    enabled: true,
  },
  {
    plugin_id: 'vision-mahjong-classifier',
    display_name: 'Official Vision Mahjong Classifier',
    capability: 'vision',
    source_type: 'builtin_official',
    status: 'planned',
    risk_level: 'LOW',
    managed_by: 'local-api-core',
    enabled: true,
  },
  {
    plugin_id: 'vision-tracker',
    display_name: 'Official Vision Tracker',
    capability: 'vision',
    source_type: 'planned_official',
    status: 'planned',
    risk_level: 'MEDIUM',
    managed_by: 'local-api-core',
    enabled: false,
  },
  {
    plugin_id: 'vision-rule-engine',
    display_name: 'Official Vision Rule Engine',
    capability: 'vision',
    source_type: 'planned_official',
    status: 'planned',
    risk_level: 'MEDIUM',
    managed_by: 'local-api-core',
    enabled: false,
  },
  {
    plugin_id: 'vision-fusion',
    display_name: 'Official Vision Fusion',
    capability: 'vision',
    source_type: 'planned_official',
    status: 'planned',
    risk_level: 'MEDIUM',
    managed_by: 'local-api-core',
    enabled: false,
  },
];

const visionSamExecutionTrialState: {
  circuit_open: boolean;
  consecutive_failures: number;
  last_failure_reason: string | null;
  last_executed_at: string | null;
} = {
  circuit_open: false,
  consecutive_failures: 0,
  last_failure_reason: null,
  last_executed_at: null,
};

function compareSemver(a: string, b: string): number {
  const pa = a.split('.').map((v) => Number(v));
  const pb = b.split('.').map((v) => Number(v));
  for (let i = 0; i < 3; i += 1) {
    const va = Number.isFinite(pa[i]) ? pa[i] : 0;
    const vb = Number.isFinite(pb[i]) ? pb[i] : 0;
    if (va > vb) return 1;
    if (va < vb) return -1;
  }
  return 0;
}

function validateManifestSchema(manifest: any): string[] {
  const errors: string[] = [];
  if (!manifest || typeof manifest !== 'object') {
    return ['Manifest must be an object'];
  }
  if (!manifest.plugin_id || !/^[a-z0-9-]+$/.test(String(manifest.plugin_id))) {
    errors.push('plugin_id must match ^[a-z0-9-]+$');
  }
  if (!manifest.name || typeof manifest.name !== 'string') {
    errors.push('name is required and must be a string');
  }
  if (!manifest.version || !/^\d+\.\d+\.\d+$/.test(String(manifest.version))) {
    errors.push('version must be semver (x.y.z)');
  }
  if (!manifest.entry || typeof manifest.entry !== 'string') {
    errors.push('entry is required and must be a string');
  }
  if (!Array.isArray(manifest.capabilities) || manifest.capabilities.length === 0) {
    errors.push('capabilities must be a non-empty array');
  } else {
    for (const cap of manifest.capabilities) {
      if (!ALLOWED_CAPABILITIES.has(String(cap))) {
        errors.push(`invalid capability: ${cap}`);
      }
    }
  }
  if (!manifest.risk_level || !ALLOWED_RISK_LEVELS.has(String(manifest.risk_level))) {
    errors.push('risk_level must be one of LOW/MEDIUM/HIGH/CRITICAL');
  }
  if (manifest.permissions && !Array.isArray(manifest.permissions)) {
    errors.push('permissions must be an array when provided');
  }
  return errors;
}

function isValidSemver(v: unknown): boolean {
  return typeof v === 'string' && /^\d+\.\d+\.\d+$/.test(v);
}

function isPathInside(baseDir: string, targetPath: string): boolean {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(targetPath);
  const normalizedBase = resolvedBase.endsWith(path.sep) ? resolvedBase : `${resolvedBase}${path.sep}`;
  if (process.platform === 'win32') {
    const baseLower = normalizedBase.toLowerCase();
    const targetLower = resolvedTarget.toLowerCase();
    return targetLower === resolvedBase.toLowerCase() || targetLower.startsWith(baseLower);
  }
  return resolvedTarget === resolvedBase || resolvedTarget.startsWith(normalizedBase);
}

function runActivationPrecheck(plugin: PluginInfo): string | null {
  try {
    if (plugin?.__bridge_official === true) {
      if (plugin?.__source_type === 'builtin_official' || plugin?.__source_type === 'official_plugin_shell') {
        return null;
      }
      return 'planned bridge placeholder is not activation eligible';
    }
    const rootDir = typeof plugin?.__root_dir === 'string' ? plugin.__root_dir : '';
    const entry = typeof plugin?.__entry === 'string' ? plugin.__entry.trim() : '';
    const manifest = plugin?.__manifest || {};
    if (!rootDir || !entry) {
      return 'missing internal discovery metadata';
    }
    if (path.isAbsolute(entry)) {
      return 'entry must be relative path';
    }
    const entryFile = path.resolve(rootDir, entry);
    if (!isPathInside(rootDir, entryFile)) {
      return 'entry path escapes plugin root';
    }
    if (!existsSync(entryFile)) {
      return `entry file not found: ${entry}`;
    }
    if (!statSync(entryFile).isFile()) {
      return `entry is not a file: ${entry}`;
    }
    if (manifest.min_core_version !== undefined) {
      if (!isValidSemver(manifest.min_core_version)) {
        return 'min_core_version must be semver (x.y.z)';
      }
      if (compareSemver(CORE_VERSION, manifest.min_core_version) < 0) {
        return `core version ${CORE_VERSION} is lower than min_core_version ${manifest.min_core_version}`;
      }
    }
    if (manifest.max_core_version !== undefined) {
      if (!isValidSemver(manifest.max_core_version)) {
        return 'max_core_version must be semver (x.y.z)';
      }
      if (compareSemver(CORE_VERSION, manifest.max_core_version) > 0) {
        return `core version ${CORE_VERSION} is higher than max_core_version ${manifest.max_core_version}`;
      }
    }
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
}

function evaluateActivationCandidates(enabledPlugins: PluginInfo[]): {
  activationPlugins: PluginInfo[];
  precheckFailedPlugins: PluginInfo[];
} {
  const activationPlugins: PluginInfo[] = [];
  const precheckFailedPlugins: PluginInfo[] = [];
  for (const plugin of enabledPlugins) {
    const precheckError = runActivationPrecheck(plugin);
    const pluginWithState = {
      ...plugin,
      __activation_eligible: precheckError === null,
      __precheck_error: precheckError || '',
    };
    if (precheckError) {
      precheckFailedPlugins.push(pluginWithState);
      continue;
    }
    activationPlugins.push(pluginWithState);
  }
  return { activationPlugins, precheckFailedPlugins };
}

function buildOfficialBridgePlugin(bridge: OfficialVisionBridgeRecord): PluginInfo {
  const tags = [
    bridge.status,
    `managed_by:${bridge.managed_by}`,
    `source_type:${bridge.source_type}`,
  ];
  if (bridge.plugin_id === 'vision-yolo') {
    tags.push('step:yolo_detect', 'artifact:detection_result');
  } else if (bridge.plugin_id === 'vision-sam') {
    tags.push('step:sam_handoff', 'step:sam_segment', 'artifact:sam_handoff', 'artifact:sam_segmentation');
  } else if (bridge.plugin_id === 'vision-mahjong-classifier') {
    tags.push('step:classifier_verify', 'artifact:mahjong_classification_result', 'planned');
  } else if (bridge.plugin_id === 'vision-tracker') {
    tags.push('step:tracker_run', 'artifact:tracker_result', 'planned');
  } else if (bridge.plugin_id === 'vision-rule-engine') {
    tags.push('step:rule_engine', 'artifact:rule_result', 'planned');
  } else if (bridge.plugin_id === 'vision-fusion') {
    tags.push('step:yolo_detect', 'step:classifier_verify', 'artifact:mahjong_fusion_result', 'planned');
  }
  return {
    plugin_id: bridge.plugin_id,
    name: bridge.display_name,
    version: '1.0.0',
    capabilities: [bridge.capability],
    permissions: [],
    risk_level: bridge.risk_level,
    enabled: bridge.enabled,
    description: `Official bridge for ${bridge.display_name}`,
    tags,
    __bridge_official: true,
    __source_type: bridge.source_type,
    __managed_by: bridge.managed_by,
    __bridge_status: bridge.status,
    __activation_eligible: bridge.source_type === 'builtin_official' || bridge.source_type === 'official_plugin_shell',
    __precheck_error: '',
  } as PluginInfo;
}

function withOfficialVisionBridges(discoveredPlugins: PluginInfo[]): PluginInfo[] {
  const byId = new Map<string, PluginInfo>();
  for (const plugin of discoveredPlugins) {
    byId.set(String(plugin.plugin_id), plugin);
  }
  for (const bridge of OFFICIAL_VISION_BRIDGES) {
    if (!byId.has(bridge.plugin_id)) {
      byId.set(bridge.plugin_id, buildOfficialBridgePlugin(bridge));
    }
  }
  return Array.from(byId.values());
}

function parsePluginManifest(pluginPath: string): PluginInfo | null {
  try {
    const manifestPath = path.join(pluginPath, 'manifest.json');
    if (!existsSync(manifestPath)) {
      return null;
    }
    const manifestRaw = readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestRaw);
    const schemaErrors = validateManifestSchema(manifest);
    if (schemaErrors.length > 0) {
      console.warn(`[VisionBus] Manifest rejected at discovery (${pluginPath}): ${schemaErrors.join('; ')}`);
      return null;
    }

    const capabilities = Array.isArray(manifest.capabilities) ? manifest.capabilities : [];
    const permissions = Array.isArray(manifest.permissions) ? manifest.permissions : [];
    const tags = Array.isArray(manifest.tags) ? manifest.tags : [];

    return {
      plugin_id: String(manifest.plugin_id),
      name: String(manifest.name),
      version: String(manifest.version || ''),
      capabilities,
      permissions,
      risk_level: String(manifest.risk_level || 'LOW'),
      enabled: manifest.enabled !== false,
      author: manifest.author ? String(manifest.author) : undefined,
      description: manifest.description ? String(manifest.description) : undefined,
      tags,
      // M10/M11 internal metadata for precheck/activation; not exposed by API.
      __root_dir: pluginPath,
      __entry: String(manifest.entry),
      __manifest: manifest,
      __source_type: manifest.source_type ? String(manifest.source_type) : undefined,
      __managed_by: manifest.managed_by ? String(manifest.managed_by) : undefined,
    } as PluginInfo;
  } catch (err) {
    console.warn(`[VisionBus] Failed to parse plugin manifest: ${pluginPath}`, err);
    return null;
  }
}

function discoverPlugins(pluginDir: string): {
  discoveredPlugins: PluginInfo[];
  candidateCount: number;
} {
  const discoveredPlugins: PluginInfo[] = [];
  let candidateCount = 0;
  const entries = readdirSync(pluginDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    candidateCount += 1;
    const pluginPath = path.join(pluginDir, entry.name);
    const parsed = parsePluginManifest(pluginPath);
    if (parsed) {
      discoveredPlugins.push(parsed);
    }
  }
  return { discoveredPlugins, candidateCount };
}

function inferPluginSource(plugin: PluginInfo): string {
  if (typeof plugin?.__source_type === 'string' && plugin.__source_type.length > 0) {
    return plugin.__source_type;
  }
  const tags: string[] = Array.isArray(plugin?.tags) ? plugin.tags : [];
  if (tags.includes('builtin') || String(plugin?.plugin_id || '').startsWith('builtin-')) {
    return 'builtin';
  }
  return 'external';
}

function normalizeCapability(plugin: PluginInfo): string {
  if (!Array.isArray(plugin?.capabilities)) return '';
  return plugin.capabilities.join(',');
}

function toBool(v: unknown): boolean {
  return Number(v) === 1 || v === true;
}

function toNullableString(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v);
  return s.length > 0 ? s : null;
}

function mapRegistryRow(row: any): PersistedPluginRegistryRecord {
  return {
    plugin_id: row.plugin_id,
    plugin_name: row.plugin_name,
    version: row.version || '',
    capability: row.capability || '',
    source: row.source || 'builtin',
    enabled: toBool(row.enabled),
    active: toBool(row.active),
    init_status: row.init_status || 'pending',
    error_reason: toNullableString(row.error_reason),
    discovered_at: row.discovered_at || '',
    initialized_at: toNullableString(row.initialized_at),
    updated_at: row.updated_at || '',
  };
}

function mapInitSummaryRow(row: any): VisionPluginInitSummary {
  return {
    id: row.id,
    init_status: row.init_status,
    plugin_system_enabled: toBool(row.plugin_system_enabled),
    plugin_system_active: toBool(row.plugin_system_active),
    discovered_count: Number(row.discovered_count || 0),
    success_count: Number(row.success_count || 0),
    failed_count: Number(row.failed_count || 0),
    error_summary: toNullableString(row.error_summary),
    started_at: row.started_at,
    finished_at: row.finished_at,
    created_at: row.created_at,
  };
}

function mapPluginEventRow(row: any): PersistedPluginEventRecord {
  return {
    id: row.id,
    plugin_id: row.plugin_id,
    plugin_name: row.plugin_name,
    action: row.action,
    before_status: row.before_status,
    after_status: row.after_status,
    reason: toNullableString(row.reason),
    created_at: row.created_at,
  };
}

function getPersistedEnabledOverrides(): Map<string, boolean> {
  const overrides = new Map<string, boolean>();
  try {
    const db = getDatabase();
    const rows = db.prepare(`SELECT plugin_id, enabled FROM plugin_registry`).all() as any[];
    for (const row of rows) {
      overrides.set(String(row.plugin_id), toBool(row.enabled));
    }
  } catch {
    // ignore: table may not be ready in first run
  }
  return overrides;
}

function applyEnabledOverrides(plugins: PluginInfo[], overrides: Map<string, boolean>): PluginInfo[] {
  return plugins.map((plugin) => {
    const pluginId = String(plugin?.plugin_id || '');
    if (!overrides.has(pluginId)) {
      return plugin;
    }
    return {
      ...plugin,
      enabled: overrides.get(pluginId) === true,
    };
  });
}

function writePluginStartupAudit(detail: {
  init_run_id: string;
  init_status: 'success' | 'failed' | 'skipped';
  discovered_count: number;
  success_count: number;
  failed_count: number;
  error_summary: string | null;
}): void {
  try {
    const db = getDatabase();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      randomUUID(),
      'plugin',
      'plugin_startup_discovery',
      'plugin-system',
      detail.init_status === 'failed' ? 'error' : 'success',
      JSON.stringify(detail),
      now
    );
  } catch (err) {
    console.error('[VisionBus] Failed to write plugin startup audit:', err);
  }
}

function persistPluginStartupResult(payload: {
  init_run_id: string;
  init_status: 'success' | 'failed' | 'skipped';
  plugin_system_enabled: boolean;
  plugin_system_active: boolean;
  discovered_count: number;
  success_count: number;
  failed_count: number;
  error_summary: string | null;
  started_at: string;
  finished_at: string;
  plugins: PluginInfo[];
}): void {
  const now = new Date().toISOString();
  try {
    const db = getDatabase();
    db.prepare(`UPDATE plugin_registry SET active = 0, updated_at = ?`).run(now);
    if (payload.init_status === 'success') {
      db.prepare(`
        UPDATE plugin_registry
        SET init_status = 'success',
            error_reason = '',
            initialized_at = ?,
            updated_at = ?
      `).run(payload.finished_at, now);
    }

    const upsertRegistry = db.prepare(`
      INSERT INTO plugin_registry (
        plugin_id, plugin_name, version, capability, source, enabled, active,
        init_status, error_reason, discovered_at, initialized_at, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(plugin_id) DO UPDATE SET
        plugin_name = excluded.plugin_name,
        version = excluded.version,
        capability = excluded.capability,
        source = excluded.source,
        enabled = excluded.enabled,
        active = excluded.active,
        init_status = excluded.init_status,
        error_reason = excluded.error_reason,
        discovered_at = excluded.discovered_at,
        initialized_at = excluded.initialized_at,
        updated_at = excluded.updated_at
    `);

    for (const plugin of payload.plugins) {
      const pluginEnabled = plugin.enabled !== false;
      const activationEligible = plugin.__activation_eligible === true;
      const precheckError = String(plugin.__precheck_error || '');
      const pluginInitStatus =
        payload.init_status === 'success'
          ? (!pluginEnabled
            ? 'disabled'
            : (activationEligible ? 'success' : 'precheck_failed'))
          : payload.init_status;
      const pluginErrorReason = payload.init_status === 'success'
        ? precheckError
        : (payload.error_summary || '');
      upsertRegistry.run(
        String(plugin.plugin_id || ''),
        String(plugin.name || plugin.plugin_id || 'unknown-plugin'),
        String(plugin.version || ''),
        normalizeCapability(plugin),
        inferPluginSource(plugin),
        pluginEnabled ? 1 : 0,
        payload.plugin_system_active && pluginEnabled && activationEligible ? 1 : 0,
        pluginInitStatus,
        pluginErrorReason,
        payload.finished_at,
        payload.finished_at,
        now,
        now
      );
    }

    // 若初始化失败/跳过，现有记录标记为非激活，保留历史基础信息。
    if (payload.init_status !== 'success') {
      db.prepare(`
        UPDATE plugin_registry
        SET active = 0,
            init_status = ?,
            error_reason = ?,
            initialized_at = ?,
            updated_at = ?
      `).run(payload.init_status, payload.error_summary || '', payload.finished_at, now);
    }

    db.prepare(`
      INSERT INTO plugin_init_runs (
        id, init_status, plugin_system_enabled, plugin_system_active,
        discovered_count, success_count, failed_count, error_summary,
        started_at, finished_at, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      payload.init_run_id,
      payload.init_status,
      payload.plugin_system_enabled ? 1 : 0,
      payload.plugin_system_active ? 1 : 0,
      payload.discovered_count,
      payload.success_count,
      payload.failed_count,
      payload.error_summary || '',
      payload.started_at,
      payload.finished_at,
      now
    );
  } catch (err) {
    console.error('[VisionBus] Failed to persist plugin startup result:', err);
  }

  writePluginStartupAudit({
    init_run_id: payload.init_run_id,
    init_status: payload.init_status,
    discovered_count: payload.discovered_count,
    success_count: payload.success_count,
    failed_count: payload.failed_count,
    error_summary: payload.error_summary,
  });
}

export function listPersistedPluginRegistry(): PersistedPluginRegistryRecord[] {
  try {
    const db = getDatabase();
    const rows = db.prepare(`
      SELECT plugin_id, plugin_name, version, capability, source, enabled, active,
             init_status, error_reason, discovered_at, initialized_at, updated_at
      FROM plugin_registry
      ORDER BY plugin_name ASC, plugin_id ASC
    `).all() as any[];
    return rows.map(mapRegistryRow);
  } catch (err) {
    console.error('[VisionBus] Failed to list persisted plugin registry:', err);
    return [];
  }
}

export function getPersistedPluginRegistry(pluginId: string): PersistedPluginRegistryRecord | null {
  try {
    const db = getDatabase();
    const row = db.prepare(`
      SELECT plugin_id, plugin_name, version, capability, source, enabled, active,
             init_status, error_reason, discovered_at, initialized_at, updated_at
      FROM plugin_registry
      WHERE plugin_id = ?
      LIMIT 1
    `).get(pluginId) as any;
    return row ? mapRegistryRow(row) : null;
  } catch (err) {
    console.error('[VisionBus] Failed to get persisted plugin registry:', err);
    return null;
  }
}

export function getLatestPluginInitSummary(): VisionPluginInitSummary | null {
  try {
    const db = getDatabase();
    const row = db.prepare(`
      SELECT id, init_status, plugin_system_enabled, plugin_system_active,
             discovered_count, success_count, failed_count, error_summary,
             started_at, finished_at, created_at
      FROM plugin_init_runs
      ORDER BY created_at DESC
      LIMIT 1
    `).get() as any;
    return row ? mapInitSummaryRow(row) : null;
  } catch (err) {
    console.error('[VisionBus] Failed to get latest plugin init summary:', err);
    return null;
  }
}

export function getOfficialVisionBridgeStatus(): Array<OfficialVisionBridgeRecord & {
  enabled_effective: boolean;
  active: boolean;
  init_status: string;
  error_reason: string | null;
}> {
  const registryMap = new Map<string, PersistedPluginRegistryRecord>();
  for (const row of listPersistedPluginRegistry()) {
    registryMap.set(row.plugin_id, row);
  }
  return OFFICIAL_VISION_BRIDGES.map((bridge) => {
    const persisted = registryMap.get(bridge.plugin_id);
    return {
      ...bridge,
      enabled_effective: persisted ? persisted.enabled : bridge.enabled,
      active: persisted ? persisted.active : false,
      init_status: persisted ? persisted.init_status : 'pending',
      error_reason: persisted ? persisted.error_reason : null,
    };
  });
}

export function getVisionSamExecutionTrialStatus(): VisionSamExecutionTrialStatus {
  return {
    execute_trial_global_enabled: EXECUTE_TRIAL_GLOBAL_ENABLED,
    execute_trial_vision_sam_enabled: EXECUTE_TRIAL_VISION_SAM_ENABLED,
    circuit_open: visionSamExecutionTrialState.circuit_open,
    consecutive_failures: visionSamExecutionTrialState.consecutive_failures,
    last_failure_reason: visionSamExecutionTrialState.last_failure_reason,
    last_executed_at: visionSamExecutionTrialState.last_executed_at,
    failure_threshold: EXECUTE_TRIAL_FAILURE_THRESHOLD,
  };
}

function writeVisionSamExecutionAudit(detail: {
  actor: string;
  request_id: string | null;
  result: 'success' | 'error';
  reason: string | null;
  error_type: string | null;
  gate_reason: string | null;
  rollback_source: string | null;
  circuit_state_before: boolean;
  circuit_state_after: boolean;
  dry_run_flag: boolean;
  switch_state_snapshot: {
    execute_trial_global_enabled: boolean;
    execute_trial_vision_sam_enabled: boolean;
    failure_threshold: number;
  };
  trial_scope: string;
  actor_type: string;
  execution_mode: string;
  input_summary: string;
  output_summary: string;
  duration_ms: number;
}): void {
  try {
    const db = getDatabase();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      randomUUID(),
      'plugin_execute_trial',
      'vision_sam_execute_trial',
      'vision-sam',
      detail.result,
      JSON.stringify(detail),
      now
    );
  } catch (err) {
    console.error('[VisionBus] Failed to write vision-sam execution audit:', err);
  }
}

function resolveActorType(actor: string): string {
  if (!actor || actor === 'unknown') return 'unknown';
  if (/^\d+\.\d+\.\d+\.\d+$/.test(actor) || actor === '::1' || actor.includes(':')) {
    return 'ip';
  }
  return 'operator';
}

function resolveErrorType(reason: string | null): string | null {
  if (!reason) return null;
  if (reason.includes('global switch is disabled')) return 'switch_global_disabled';
  if (reason.includes('trial switch is disabled')) return 'switch_capability_disabled';
  if (reason.includes('circuit is open')) return 'circuit_open';
  if (reason.includes('only allows dry_run=true')) return 'dry_run_invalid';
  if (reason.includes('missing internal discovery metadata')) return 'input_summary_abnormal';
  return 'system_error';
}

function resolveGateReason(reason: string | null): string | null {
  if (!reason) return null;
  if (reason.includes('switch')) return 'gate_switch';
  if (reason.includes('circuit')) return 'gate_circuit';
  if (reason.includes('dry_run')) return 'gate_dry_run';
  return 'gate_runtime';
}

function summarizePayload(payload: any): string {
  try {
    const normalized = {
      handoff_id: payload?.handoff_id || null,
      experiment_id: payload?.experiment_id || null,
      model_id: payload?.model_id || null,
      dataset_id: payload?.dataset_id || null,
      dry_run: payload?.dry_run === true,
    };
    return JSON.stringify(normalized);
  } catch {
    return '{"invalid_payload":true}';
  }
}

function summarizeTrialOutput(output: any): string {
  try {
    return JSON.stringify(output);
  } catch {
    return '{"invalid_output":true}';
  }
}

function markVisionSamTrialFailure(reason: string): void {
  visionSamExecutionTrialState.consecutive_failures += 1;
  visionSamExecutionTrialState.last_failure_reason = reason;
  if (visionSamExecutionTrialState.consecutive_failures >= EXECUTE_TRIAL_FAILURE_THRESHOLD) {
    visionSamExecutionTrialState.circuit_open = true;
  }
}

function markVisionSamTrialSuccess(): void {
  visionSamExecutionTrialState.consecutive_failures = 0;
  visionSamExecutionTrialState.last_failure_reason = null;
  visionSamExecutionTrialState.last_executed_at = new Date().toISOString();
}

export function triggerVisionSamExecutionTrialRollback(
  reason?: string,
  context?: { actor?: string; rollback_source?: string; request_id?: string | null }
): VisionSamExecutionTrialStatus {
  const before = visionSamExecutionTrialState.circuit_open;
  visionSamExecutionTrialState.circuit_open = true;
  visionSamExecutionTrialState.last_failure_reason = reason || 'manual_rollback';
  const status = getVisionSamExecutionTrialStatus();
  const actor = context?.actor || 'system';
  const rollbackSource = context?.rollback_source || 'manual';
  writeVisionSamExecutionAudit({
    actor,
    request_id: context?.request_id || null,
    result: 'error',
    reason: reason || 'manual_rollback',
    error_type: 'rollback_triggered',
    gate_reason: 'gate_manual_rollback',
    rollback_source: rollbackSource,
    circuit_state_before: before,
    circuit_state_after: status.circuit_open,
    dry_run_flag: false,
    switch_state_snapshot: {
      execute_trial_global_enabled: status.execute_trial_global_enabled,
      execute_trial_vision_sam_enabled: status.execute_trial_vision_sam_enabled,
      failure_threshold: status.failure_threshold,
    },
    trial_scope: 'vision-sam-only-dry-run',
    actor_type: resolveActorType(actor),
    execution_mode: 'vision-sam-trial-rollback',
    input_summary: summarizeTrialOutput({ rollback_reason: reason || 'manual_rollback' }),
    output_summary: summarizeTrialOutput({ ok: true, circuit_open: status.circuit_open }),
    duration_ms: 0,
  });
  return status;
}

export function executeVisionSamTrial(payload: any, context: {
  actor: string;
  request_id: string | null;
}): {
  ok: boolean;
  error?: string;
  trial_status: VisionSamExecutionTrialStatus;
  output?: any;
} {
  const startedAt = Date.now();
  const inputSummary = summarizePayload(payload);
  const dryRunFlag = payload?.dry_run === true;
  const actor = context.actor || 'unknown';
  const actorType = resolveActorType(actor);
  const requestId = context.request_id || null;

  const failAndAudit = (reason: string, output?: any) => {
    const before = visionSamExecutionTrialState.circuit_open;
    markVisionSamTrialFailure(reason);
    const trialStatus = getVisionSamExecutionTrialStatus();
    const errorType = resolveErrorType(reason);
    const gateReason = resolveGateReason(reason);
    writeVisionSamExecutionAudit({
      actor,
      request_id: requestId,
      result: 'error',
      reason,
      error_type: errorType,
      gate_reason: gateReason,
      rollback_source: null,
      circuit_state_before: before,
      circuit_state_after: trialStatus.circuit_open,
      dry_run_flag: dryRunFlag,
      switch_state_snapshot: {
        execute_trial_global_enabled: trialStatus.execute_trial_global_enabled,
        execute_trial_vision_sam_enabled: trialStatus.execute_trial_vision_sam_enabled,
        failure_threshold: trialStatus.failure_threshold,
      },
      trial_scope: 'vision-sam-only-dry-run',
      actor_type: actorType,
      execution_mode: 'vision-sam-trial-dry-run',
      input_summary: inputSummary,
      output_summary: summarizeTrialOutput(output || { ok: false, error: reason }),
      duration_ms: Math.max(0, Date.now() - startedAt),
    });
    return { ok: false, error: reason, trial_status: trialStatus, output };
  };

  if (!EXECUTE_TRIAL_GLOBAL_ENABLED) {
    return failAndAudit('execute trial global switch is disabled');
  }
  if (!EXECUTE_TRIAL_VISION_SAM_ENABLED) {
    return failAndAudit('vision-sam execute trial switch is disabled');
  }
  if (visionSamExecutionTrialState.circuit_open) {
    return failAndAudit('vision-sam execute circuit is open');
  }
  if (payload?.dry_run !== true) {
    return failAndAudit('vision-sam execute trial only allows dry_run=true');
  }

  try {
    const db = getDatabase();
    const handoffCount = payload?.handoff_id
      ? Number((db.prepare(`SELECT COUNT(*) as c FROM sam_handoffs WHERE id = ?`).get(String(payload.handoff_id)) as any)?.c || 0)
      : 0;
    const segmentationCount = payload?.experiment_id
      ? Number((db.prepare(`SELECT COUNT(*) as c FROM sam_segmentations WHERE source_experiment_id = ?`).get(String(payload.experiment_id)) as any)?.c || 0)
      : 0;

    const output = {
      execution_mode: 'vision-sam-trial-dry-run',
      handoff_count: handoffCount,
      segmentation_count: segmentationCount,
      note: 'trial mode does not run inference',
    };
    markVisionSamTrialSuccess();
    const trialStatus = getVisionSamExecutionTrialStatus();
    writeVisionSamExecutionAudit({
      actor,
      request_id: requestId,
      result: 'success',
      reason: null,
      error_type: null,
      gate_reason: null,
      rollback_source: null,
      circuit_state_before: false,
      circuit_state_after: trialStatus.circuit_open,
      dry_run_flag: dryRunFlag,
      switch_state_snapshot: {
        execute_trial_global_enabled: trialStatus.execute_trial_global_enabled,
        execute_trial_vision_sam_enabled: trialStatus.execute_trial_vision_sam_enabled,
        failure_threshold: trialStatus.failure_threshold,
      },
      trial_scope: 'vision-sam-only-dry-run',
      actor_type: actorType,
      execution_mode: 'vision-sam-trial-dry-run',
      input_summary: inputSummary,
      output_summary: summarizeTrialOutput(output),
      duration_ms: Math.max(0, Date.now() - startedAt),
    });
    return { ok: true, output, trial_status: trialStatus };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    return failAndAudit(reason);
  }
}

function refreshRuntimeCatalogFromRegistry(): void {
  if (!visionPluginRuntimeState.plugin_system_active) {
    rebuildVisionCatalogCache();
    return;
  }

  try {
    const enabledOverrides = getPersistedEnabledOverrides();
    const allPlugins = applyEnabledOverrides(
      visionPluginRuntimeState.discovered_plugins,
      enabledOverrides
    );
    const enabledPlugins = allPlugins.filter((plugin) => plugin.enabled !== false);
    const precheck = evaluateActivationCandidates(enabledPlugins);
    const activationPlugins = precheck.activationPlugins;
    const runtimePlugins = allPlugins.map((plugin) => {
      const active = activationPlugins.find((item) => item.plugin_id === plugin.plugin_id);
      const failed = precheck.precheckFailedPlugins.find((item) => item.plugin_id === plugin.plugin_id);
      if (active) return active;
      if (failed) return failed;
      return { ...plugin, __activation_eligible: false, __precheck_error: '' };
    });
    const visionPlugins = activationPlugins.filter(
      (plugin) => Array.isArray(plugin.capabilities) && plugin.capabilities.includes('vision')
    );
    const pluginPipelines: VisionPipelineEntry[] = [];
    for (const plugin of visionPlugins) {
      const entry = pluginToPipelineEntry(plugin);
      if (entry) {
        pluginPipelines.push(entry);
      }
    }
    visionPluginRuntimeState.discovered_plugins = runtimePlugins;
    visionPluginRuntimeState.plugin_pipelines = pluginPipelines;
    visionPluginRuntimeState.plugin_count = pluginPipelines.length;
    visionPluginRuntimeState.discovered_count = allPlugins.length;
    visionPluginRuntimeState.init_success_count = activationPlugins.length;
    visionPluginRuntimeState.init_failed_count = precheck.precheckFailedPlugins.length;
  } catch (err) {
    console.error('[VisionBus] Failed to refresh runtime catalog from registry:', err);
  }

  rebuildVisionCatalogCache();
}

function writePluginControlAudit(detail: {
  plugin_id: string;
  plugin_name: string;
  action: 'enable' | 'disable';
  before_status: string;
  after_status: string;
  reason: string | null;
}): void {
  try {
    const db = getDatabase();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      randomUUID(),
      'plugin',
      detail.action === 'enable' ? 'plugin_enabled' : 'plugin_disabled',
      detail.plugin_id,
      'success',
      JSON.stringify(detail),
      now
    );
  } catch (err) {
    console.error('[VisionBus] Failed to write plugin control audit:', err);
  }
}

export function setPersistedPluginEnabled(
  pluginId: string,
  enabled: boolean,
  reason?: string
): { ok: boolean; error?: string; plugin?: PersistedPluginRegistryRecord; event?: PersistedPluginEventRecord } {
  try {
    const db = getDatabase();
    const existing = db.prepare(`
      SELECT plugin_id, plugin_name, version, capability, source, enabled, active,
             init_status, error_reason, discovered_at, initialized_at, updated_at
      FROM plugin_registry
      WHERE plugin_id = ?
      LIMIT 1
    `).get(pluginId) as any;

    if (!existing) {
      return { ok: false, error: `Plugin not found: ${pluginId}` };
    }

    const now = new Date().toISOString();
    const beforeEnabled = toBool(existing.enabled);
    const beforeStatus = beforeEnabled ? 'enabled' : 'disabled';
    const afterStatus = enabled ? 'enabled' : 'disabled';
    const safeReason = (reason || '').trim();
    const action: 'enable' | 'disable' = enabled ? 'enable' : 'disable';

    db.prepare(`
      UPDATE plugin_registry
      SET enabled = ?,
          active = ?,
          updated_at = ?,
          error_reason = CASE
            WHEN ? = 1 THEN ''
            ELSE COALESCE(error_reason, '')
          END
      WHERE plugin_id = ?
    `).run(
      enabled ? 1 : 0,
      enabled && visionPluginRuntimeState.plugin_system_active ? 1 : 0,
      now,
      enabled ? 1 : 0,
      pluginId
    );

    const eventId = randomUUID();
    db.prepare(`
      INSERT INTO plugin_events (
        id, plugin_id, plugin_name, action, before_status, after_status, reason, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      eventId,
      existing.plugin_id,
      existing.plugin_name,
      action,
      beforeStatus,
      afterStatus,
      safeReason,
      now
    );

    const event: PersistedPluginEventRecord = {
      id: eventId,
      plugin_id: existing.plugin_id,
      plugin_name: existing.plugin_name,
      action,
      before_status: beforeStatus,
      after_status: afterStatus,
      reason: safeReason || null,
      created_at: now,
    };

    writePluginControlAudit({
      plugin_id: existing.plugin_id,
      plugin_name: existing.plugin_name,
      action,
      before_status: beforeStatus,
      after_status: afterStatus,
      reason: safeReason || null,
    });

    refreshRuntimeCatalogFromRegistry();

    const updated = getPersistedPluginRegistry(pluginId);
    if (!updated) {
      return { ok: false, error: `Plugin status update failed: ${pluginId}` };
    }

    return { ok: true, plugin: updated, event };
  } catch (err) {
    console.error('[VisionBus] Failed to set persisted plugin enabled state:', err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export function listPluginEvents(pluginId?: string, limit: number = 50): PersistedPluginEventRecord[] {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 50, 200));
  try {
    const db = getDatabase();
    const rows = pluginId
      ? db.prepare(`
          SELECT id, plugin_id, plugin_name, action, before_status, after_status, reason, created_at
          FROM plugin_events
          WHERE plugin_id = ?
          ORDER BY created_at DESC
          LIMIT ?
        `).all(pluginId, safeLimit)
      : db.prepare(`
          SELECT id, plugin_id, plugin_name, action, before_status, after_status, reason, created_at
          FROM plugin_events
          ORDER BY created_at DESC
          LIMIT ?
        `).all(safeLimit);
    return (rows as any[]).map(mapPluginEventRow);
  } catch (err) {
    console.error('[VisionBus] Failed to list plugin events:', err);
    return [];
  }
}

export function getVisionPluginRuntimeStatus(): VisionPluginRuntimeStatus {
  return {
    plugin_system_enabled: visionPluginRuntimeState.plugin_system_enabled,
    plugin_system_active: visionPluginRuntimeState.plugin_system_active,
    init_failed: visionPluginRuntimeState.init_failed,
    error_reason: visionPluginRuntimeState.error_reason,
    plugin_count: visionPluginRuntimeState.plugin_count,
    discovered_count: visionPluginRuntimeState.discovered_count,
    init_success_count: visionPluginRuntimeState.init_success_count,
    init_failed_count: visionPluginRuntimeState.init_failed_count,
    init_run_id: visionPluginRuntimeState.init_run_id,
    init_attempted: visionPluginRuntimeState.init_attempted,
    init_completed_at: visionPluginRuntimeState.init_completed_at,
  };
}

export function getVisionPluginManagerFromCache(): PluginManager | null {
  return visionPluginRuntimeState.plugin_manager;
}

function markInitFailure(err: unknown): void {
  const reason = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  visionPluginRuntimeState.plugin_system_active = false;
  visionPluginRuntimeState.init_failed = true;
  visionPluginRuntimeState.error_reason = reason;
  visionPluginRuntimeState.plugin_count = 0;
  visionPluginRuntimeState.discovered_count = 0;
  visionPluginRuntimeState.init_success_count = 0;
  visionPluginRuntimeState.plugin_manager = null;
  visionPluginRuntimeState.discovered_plugins = [];
  visionPluginRuntimeState.plugin_pipelines = [];
  visionPluginRuntimeState.init_completed_at = new Date().toISOString();
}

export async function initializeVisionPluginSystemAtStartup(
  options: VisionPluginInitOptions = {}
): Promise<VisionPluginRuntimeStatus> {
  const enabled = options.enabled ?? VISION_PLUGIN_DISCOVERY_ENABLED;
  visionPluginRuntimeState.plugin_system_enabled = enabled;

  // 熔断：只允许启动期初始化一次；失败后不重试。
  if (visionPluginRuntimeState.init_attempted) {
    if (visionPluginInitPromise) {
      await visionPluginInitPromise;
    }
    return getVisionPluginRuntimeStatus();
  }

  visionPluginRuntimeState.init_attempted = true;
  const initRunId = randomUUID();
  visionPluginRuntimeState.init_run_id = initRunId;
  const initStartedAt = new Date().toISOString();
  const resolvedPluginDir =
    typeof options.pluginDir === 'string' && options.pluginDir.length > 0
      ? options.pluginDir
      : path.resolve(process.cwd(), '../../plugins/builtin');
  const candidateCount = countPluginCandidates(resolvedPluginDir);

  if (!enabled) {
    visionPluginRuntimeState.plugin_system_active = false;
    visionPluginRuntimeState.init_failed = false;
    visionPluginRuntimeState.error_reason = null;
    visionPluginRuntimeState.plugin_count = 0;
    visionPluginRuntimeState.discovered_count = 0;
    visionPluginRuntimeState.init_success_count = 0;
    visionPluginRuntimeState.init_failed_count = 0;
    visionPluginRuntimeState.plugin_manager = null;
    visionPluginRuntimeState.discovered_plugins = [];
    visionPluginRuntimeState.plugin_pipelines = [];
    visionPluginRuntimeState.init_completed_at = new Date().toISOString();
    rebuildVisionCatalogCache();
    persistPluginStartupResult({
      init_run_id: initRunId,
      init_status: 'skipped',
      plugin_system_enabled: false,
      plugin_system_active: false,
      discovered_count: 0,
      success_count: 0,
      failed_count: 0,
      error_summary: null,
      started_at: initStartedAt,
      finished_at: visionPluginRuntimeState.init_completed_at,
      plugins: [],
    });
    return getVisionPluginRuntimeStatus();
  }

  visionPluginInitPromise = (async () => {
    let allPlugins: PluginInfo[] = [];
    try {
      if (!existsSync(resolvedPluginDir)) {
        throw new Error(`Plugin directory not found: ${resolvedPluginDir}`);
      }

      const discovery = discoverPlugins(resolvedPluginDir);
      const rawPlugins = withOfficialVisionBridges(discovery.discoveredPlugins);
      const enabledOverrides = getPersistedEnabledOverrides();
      allPlugins = applyEnabledOverrides(rawPlugins, enabledOverrides);
      const enabledPlugins = allPlugins.filter((plugin) => plugin.enabled !== false);
      const precheck = evaluateActivationCandidates(enabledPlugins);
      const activationPlugins = precheck.activationPlugins;
      const runtimePlugins = allPlugins.map((plugin) => {
        const active = activationPlugins.find((item) => item.plugin_id === plugin.plugin_id);
        const failed = precheck.precheckFailedPlugins.find((item) => item.plugin_id === plugin.plugin_id);
        if (active) return active;
        if (failed) return failed;
        return { ...plugin, __activation_eligible: false, __precheck_error: '' };
      });
      const visionPlugins = activationPlugins.filter(
        (plugin) => Array.isArray(plugin.capabilities) && plugin.capabilities.includes('vision')
      );
      const pluginPipelines: VisionPipelineEntry[] = [];
      for (const plugin of visionPlugins) {
        const entry = pluginToPipelineEntry(plugin);
        if (entry) {
          pluginPipelines.push(entry);
        }
      }

      // M10: 仅 enabled 插件进入 activate 路径，disabled 只保留 discovery/registry 信息。
      visionPluginRuntimeState.plugin_manager = null;
      visionPluginRuntimeState.discovered_plugins = runtimePlugins;
      visionPluginRuntimeState.plugin_pipelines = pluginPipelines;
      visionPluginRuntimeState.plugin_count = pluginPipelines.length;
      visionPluginRuntimeState.discovered_count = allPlugins.length;
      visionPluginRuntimeState.init_success_count = activationPlugins.length;
      visionPluginRuntimeState.init_failed_count =
        Math.max(0, discovery.candidateCount - allPlugins.length) + precheck.precheckFailedPlugins.length;
      visionPluginRuntimeState.plugin_system_active = true;
      visionPluginRuntimeState.init_failed = false;
      visionPluginRuntimeState.error_reason = null;
      visionPluginRuntimeState.init_completed_at = new Date().toISOString();
      const precheckErrors = precheck.precheckFailedPlugins.map((plugin) => {
        return `${plugin.plugin_id}: ${String(plugin.__precheck_error || 'unknown precheck error')}`;
      });
      const initSummaryError =
        precheckErrors.length > 0
          ? `precheck_failed(${precheckErrors.length}) ${precheckErrors.join(' | ')}`
          : null;
      persistPluginStartupResult({
        init_run_id: initRunId,
        init_status: 'success',
        plugin_system_enabled: true,
        plugin_system_active: true,
        discovered_count: allPlugins.length,
        success_count: visionPluginRuntimeState.init_success_count,
        failed_count: visionPluginRuntimeState.init_failed_count,
        error_summary: initSummaryError,
        started_at: initStartedAt,
        finished_at: visionPluginRuntimeState.init_completed_at,
        plugins: runtimePlugins,
      });
    } catch (err) {
      console.error('[VisionBus] Startup plugin initialization failed:', err);
      markInitFailure(err);
      visionPluginRuntimeState.init_failed_count = candidateCount > 0 ? candidateCount : 1;
      persistPluginStartupResult({
        init_run_id: initRunId,
        init_status: 'failed',
        plugin_system_enabled: true,
        plugin_system_active: false,
        discovered_count: 0,
        success_count: 0,
        failed_count: visionPluginRuntimeState.init_failed_count,
        error_summary: visionPluginRuntimeState.error_reason,
        started_at: initStartedAt,
        finished_at: visionPluginRuntimeState.init_completed_at || new Date().toISOString(),
        plugins: [],
      });
    } finally {
      rebuildVisionCatalogCache();
      visionPluginInitPromise = null;
    }
  })();

  await visionPluginInitPromise;
  return getVisionPluginRuntimeStatus();
}

/** 将 PluginInfo 转换为 VisionPipelineEntry */
function pluginToPipelineEntry(plugin: PluginInfo): VisionPipelineEntry | null {
  // 只处理有 vision 能力的插件
  if (!plugin.capabilities.includes('vision')) {
    return null;
  }

  // 从插件标签或描述中解析状态
  const status = plugin.tags?.includes('frozen') ? 'frozen' :
                 plugin.tags?.includes('planned') ? 'planned' : 'active';

  // 从插件标签中解析 workflow_steps
  const workflowSteps = plugin.tags?.filter(t => t.startsWith('step:'))
    .map(t => t.replace('step:', '')) || [];

  // 从插件标签中解析 output_artifact_types
  const artifactTypes = plugin.tags?.filter(t => t.startsWith('artifact:'))
    .map(t => t.replace('artifact:', '')) || [];

  // 从插件标签中解析 intermediate_tables
  const tables = plugin.tags?.filter(t => t.startsWith('table:'))
    .map(t => t.replace('table:', '')) || [];

  return {
    id: plugin.plugin_id,
    label: plugin.name,
    description: plugin.description || `Vision plugin: ${plugin.plugin_id}`,
    workflow_steps: workflowSteps.length > 0 ? workflowSteps : [plugin.plugin_id],
    output_artifact_types: artifactTypes,
    intermediate_tables: tables,
    input_params: [], // 插件不提供详细参数定义，由各自文档说明
    status: status as 'frozen' | 'active' | 'planned',
    frozen_reason: status === 'frozen' ? 'Plugin marked as frozen' : undefined,
  };
}

/** 内置视觉管线定义（作为 fallback，保持向后兼容） */
const BUILTIN_PIPELINES: VisionPipelineEntry[] = [
  {
    id: 'yolo_detect',
    label: 'YOLO 检测',
    description: '使用 YOLO 模型对图像/视频进行目标检测，输出检测框坐标、类别和置信度',
    workflow_steps: ['yolo_detect'],
    output_artifact_types: ['detection_result'],
    intermediate_tables: [],
    input_params: [
      { key: 'experiment_id', description: '关联实验 ID', required: true },
      { key: 'dataset_id', description: '数据集 ID', required: true },
    ],
    status: 'frozen',
    frozen_reason: 'legacy-yolo-frozen — YOLO 训练路径已冻结，需启用 ENABLE_LEGACY_YOLO=true 或等待 Phase-B 解冻',
  },
  {
    id: 'sam_handoff',
    label: 'SAM 提示交接',
    description: '使用 SAM（Segment Anything Model）接收 YOLO 检测结果作为 ROI 提示，执行图像分割并输出 mask 和边界点列表',
    workflow_steps: ['sam_handoff'],
    output_artifact_types: ['sam_handoff'],
    intermediate_tables: ['sam_handoffs'],
    input_params: [
      { key: 'experiment_id', description: '关联实验 ID', required: true },
      { key: 'model_id', description: 'SAM 模型 ID', required: true },
      { key: 'dataset_id', description: '数据集 ID', required: true },
      { key: 'run_id', description: '关联检测运行 ID（可选，来源于 yolo_detect）', required: false },
    ],
    status: 'active',
    frozen_reason: 'v3.7.0 解冻 — executor 已升级（eval record → dataset_yaml → real labels），step 03 + step 05 完成',
  },
  {
    id: 'sam_segment',
    label: 'SAM 分割',
    description: '使用 SAM 对 SAM handoff 中的 ROI 提示区域执行精确分割，输出高质量 mask 和覆盖率统计',
    workflow_steps: ['sam_segment'],
    output_artifact_types: ['sam_segmentation'],
    intermediate_tables: ['sam_segmentations'],
    input_params: [
      { key: 'handoff_id', description: 'SAM handoff 记录 ID', required: true },
      { key: 'experiment_id', description: '关联实验 ID', required: true },
      { key: 'model_id', description: 'SAM 模型 ID', required: true },
      { key: 'dataset_id', description: '数据集 ID', required: true },
    ],
    status: 'active',
    frozen_reason: 'v3.8.0 解冻 — executor 已升级（handoff manifest → SAM runner → real masks），step 04 + step 06 完成',
  },
  {
    id: 'classifier_verification',
    label: '分类器验证',
    description: '对 SAM 分割结果中的目标进行分类验证，统计 accept/reject/uncertain 比例和平均置信度',
    workflow_steps: ['classifier_verification'],
    output_artifact_types: ['classifier_result'],
    intermediate_tables: ['classifier_verifications'],
    input_params: [
      { key: 'segmentation_id', description: '分割记录 ID', required: true },
      { key: 'classifier_model_path', description: '分类器模型路径（可选，默认 torchvision 预训练权重）', required: false },
    ],
    status: 'active',
  },
  {
    id: 'tracker_run',
    label: '多目标跟踪',
    description: '基于 YOLO 检测或 SAM 分割结果执行多目标跟踪（MOT），输出 track_id 序列、轨迹长度和活跃状态',
    workflow_steps: ['tracker_run'],
    output_artifact_types: ['tracker_result'],
    intermediate_tables: ['tracker_runs'],
    input_params: [
      { key: 'verification_id', description: '分类验证记录 ID', required: false },
      { key: 'iou_threshold', description: 'IoU 匹配阈值（默认 0.3）', required: false },
      { key: 'dist_threshold', description: '距离匹配阈值像素（默认 80.0）', required: false },
    ],
    status: 'frozen',
    frozen_reason: '待 YOLO 检测实装后接入',
  },
  {
    id: 'rule_engine',
    label: '规则引擎',
    description: '基于 tracker_run 结果执行时序规则推理，识别目标进入/离开/冲突等事件',
    workflow_steps: ['rule_engine'],
    output_artifact_types: ['rule_result'],
    intermediate_tables: ['rule_engine_runs'],
    input_params: [
      { key: 'tracker_run_id', description: '跟踪记录 ID', required: true },
    ],
    status: 'frozen',
    frozen_reason: '待 tracker_run 实装后接入',
  },
  // ── T1: 麻将专用识别模块管线注册（planned，仅预留，不实装） ──
  {
    id: 'mahjong_detect',
    label: '麻将检测',
    description: '麻将场景专用 YOLO 检测管线，复用 yolo_detect step_key，execution_mode=mahjong_detect',
    workflow_steps: ['yolo_detect'],
    output_artifact_types: ['mahjong_detection_result'],
    intermediate_tables: [],
    input_params: [
      { key: 'experiment_id', description: '关联实验 ID', required: true },
      { key: 'dataset_id', description: '麻将数据集 ID', required: true },
    ],
    status: 'planned',
    frozen_reason: 'T1 接口预留 — 等待 YOLO 解冻 + 麻将数据集就绪',
  },
  {
    id: 'mahjong_classify',
    label: '麻将分类',
    description: '麻将牌面分类管线，复用 classifier_verify step_key，execution_mode=mahjong_classify，支持 34 类牌面判别',
    workflow_steps: ['classifier_verify'],
    output_artifact_types: ['mahjong_classification_result'],
    intermediate_tables: ['classifier_verifications'],
    input_params: [
      { key: 'segmentation_id', description: '分割记录 ID', required: true },
      { key: 'classifier_model_path', description: '麻将分类模型路径', required: false },
    ],
    status: 'planned',
    frozen_reason: 'T1 接口预留 — 等待麻将分类模型训练完成',
  },
  {
    id: 'mahjong_fusion',
    label: '麻将联合识别',
    description: '麻将检测 + 分类联合推理管线：mahjong_detect → mahjong_classify → 置信度融合，输出统一识别结果',
    workflow_steps: ['yolo_detect', 'classifier_verify'],
    output_artifact_types: ['mahjong_detection_result', 'mahjong_classification_result', 'mahjong_fusion_result'],
    intermediate_tables: ['classifier_verifications'],
    input_params: [
      { key: 'experiment_id', description: '关联实验 ID', required: true },
      { key: 'dataset_id', description: '麻将数据集 ID', required: true },
      { key: 'classifier_model_path', description: '麻将分类模型路径（可选）', required: false },
    ],
    status: 'planned',
    frozen_reason: 'T1 接口预留 — 等待 T1→T3 全部完成后联调',
  },
];

const BASE_ARTIFACT_REGISTRY: { type: string; description: string; source_pipeline: string }[] = [
  { type: 'checkpoint', description: '训练权重检查点', source_pipeline: 'training' },
  { type: 'report', description: '评估/分析报告', source_pipeline: 'evaluate_model' },
  { type: 'detection_result', description: 'YOLO 检测结果（检测框 + 类别 + 置信度）', source_pipeline: 'yolo_detect' },
  { type: 'sam_handoff', description: 'SAM 分割 ROI 提示交接（边界点 + ROI + mask 种子）', source_pipeline: 'sam_handoff' },
  { type: 'sam_segmentation', description: 'SAM 分割结果（高质量 mask + 覆盖率 + 置信度）', source_pipeline: 'sam_segment' },
  { type: 'classifier_result', description: '分类验证结果（accept/reject/uncertain + 置信度）', source_pipeline: 'classifier_verification' },
  { type: 'tracker_result', description: '多目标跟踪结果（track_id + 轨迹 + 活跃状态）', source_pipeline: 'tracker_run' },
  { type: 'rule_result', description: '规则推理结果（事件 + 受影响轨迹 + 冲突标记）', source_pipeline: 'rule_engine' },
  // ── T1: 麻将专用 artifact 类型预留 ──
  { type: 'mahjong_detection_result', description: '麻将检测结果（牌面检测框 + 类别 + 置信度）', source_pipeline: 'mahjong_detect' },
  { type: 'mahjong_classification_result', description: '麻将分类结果（34 类牌面判别 + 置信度）', source_pipeline: 'mahjong_classify' },
  { type: 'mahjong_fusion_result', description: '麻将联合识别结果（检测 + 分类融合 + 最终置信度）', source_pipeline: 'mahjong_fusion' },
];

function buildVisionCatalog(pluginPipelines: VisionPipelineEntry[]): VisionCatalog {
  const builtinPipelines = new Map<string, VisionPipelineEntry>();
  for (const p of BUILTIN_PIPELINES) {
    builtinPipelines.set(p.id, p);
  }

  // 插件优先（插件可覆盖内置定义）
  const mergedPipelines = new Map<string, VisionPipelineEntry>(builtinPipelines);
  for (const pluginPipeline of pluginPipelines) {
    mergedPipelines.set(pluginPipeline.id, pluginPipeline);
  }

  const pipelines = Array.from(mergedPipelines.values());
  const activeCount = pipelines.filter((p) => p.status === 'active').length;

  const pluginArtifactTypes = new Map<string, { type: string; description: string; source_pipeline: string }>();
  for (const p of pluginPipelines) {
    for (const artifactType of p.output_artifact_types) {
      if (!pluginArtifactTypes.has(artifactType)) {
        pluginArtifactTypes.set(artifactType, {
          type: artifactType,
          description: `${artifactType} (from plugin)`,
          source_pipeline: p.id,
        });
      }
    }
  }

  const bridgeIds = new Set(OFFICIAL_VISION_BRIDGES.map((item) => item.plugin_id));
  const plannedBridgeIds = new Set(
    OFFICIAL_VISION_BRIDGES.filter((item) => item.source_type === 'planned_official').map((item) => item.plugin_id)
  );
  const officialBridgeCount = pluginPipelines.filter((item) => bridgeIds.has(item.id)).length;
  const plannedBridgeCount = pluginPipelines.filter((item) => plannedBridgeIds.has(item.id)).length;

  return {
    ok: true,
    version: '1.3.0-m13',
    pipelines,
    artifact_type_registry: [
      ...BASE_ARTIFACT_REGISTRY,
      ...Array.from(pluginArtifactTypes.values()),
    ],
    total_pipelines: pipelines.length,
    active_pipelines: activeCount,
    _meta: {
      builtin_count: builtinPipelines.size,
      plugin_count: pluginPipelines.length,
      plugin_system_active: visionPluginRuntimeState.plugin_system_active,
      official_bridge_count: officialBridgeCount,
      planned_bridge_count: plannedBridgeCount,
      official_bridges: OFFICIAL_VISION_BRIDGES.map((bridge) => ({
        plugin_id: bridge.plugin_id,
        source_type: bridge.source_type,
        status: bridge.status,
        managed_by: bridge.managed_by,
      })),
    },
  };
}

let visionCatalogCache: VisionCatalog = buildVisionCatalog([]);

function rebuildVisionCatalogCache(): void {
  visionCatalogCache = buildVisionCatalog(visionPluginRuntimeState.plugin_pipelines);
}

/** F10: Vision Bus Catalog — 统一发现接口（M6 插件化版本）
 * 
 * 合并内置管线 + 插件发现的 vision 能力
 * 插件可以覆盖内置管线的定义（插件优先）
 */
export async function getVisionCatalog(): Promise<VisionCatalog> {
  return visionCatalogCache;
}

// ── Vision Intermediate Results Query ─────────────────────────────────────────

/** F10: Query SAM handoffs */
export function getVisionSamHandoffs(query: {
  status?: string;
  experiment_id?: string;
  limit?: number;
  offset?: number;
}) {
  const db = getDatabase();
  const limit = Math.min(parseInt(String(query.limit)) || 20, 200);
  const offset = parseInt(String(query.offset)) || 0;

  let sql = 'SELECT * FROM sam_handoffs WHERE 1=1';
  const params: any[] = [];
  if (query.status) { sql += ' AND status = ?'; params.push(query.status); }
  if (query.experiment_id) { sql += ' AND source_experiment_id = ?'; params.push(query.experiment_id); }
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const rows = db.prepare(sql).all(...params);
  const countSql = sql.replace(/LIMIT.*OFFSET.*/, '').replace('SELECT *', 'SELECT COUNT(*)');
  const total = (db.prepare(countSql).get(...params.slice(0, -2)) as any)?.n || rows.length;

  return { ok: true, handoffs: rows, total, limit, offset };
}

/** F10: Query SAM segmentations */
export function getVisionSamSegmentations(query: {
  status?: string;
  experiment_id?: string;
  limit?: number;
  offset?: number;
}) {
  const db = getDatabase();
  const limit = Math.min(parseInt(String(query.limit)) || 20, 200);
  const offset = parseInt(String(query.offset)) || 0;

  let sql = 'SELECT * FROM sam_segmentations WHERE 1=1';
  const params: any[] = [];
  if (query.status) { sql += ' AND status = ?'; params.push(query.status); }
  if (query.experiment_id) { sql += ' AND source_experiment_id = ?'; params.push(query.experiment_id); }
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const rows = db.prepare(sql).all(...params);

  return { ok: true, segmentations: rows, total: rows.length, limit, offset };
}

/** F10: Query classifier verifications */
export function getVisionClassifierVerifications(query: {
  segmentation_id?: string;
  handoff_id?: string;
  experiment_id?: string;
  status?: string;
  decision?: string;   // v3.9.x: accepted | rejected | uncertain
  limit?: number;
  offset?: number;
}) {
  const db = getDatabase();
  const limit = Math.min(parseInt(String(query.limit)) || 20, 200);
  const offset = parseInt(String(query.offset)) || 0;

  let sql = 'SELECT * FROM classifier_verifications WHERE 1=1';
  const params: any[] = [];
  if (query.segmentation_id) { sql += ' AND source_segmentation_id = ?'; params.push(query.segmentation_id); }
  if (query.handoff_id)      { sql += ' AND source_handoff_id = ?';        params.push(query.handoff_id); }
  if (query.experiment_id)   { sql += ' AND source_experiment_id = ?';     params.push(query.experiment_id); }
  if (query.status)          { sql += ' AND status = ?';                   params.push(query.status); }
  // v3.9.x decision 筛选
  if (query.decision === 'accepted')   { sql += ' AND accepted_count > 0'; }
  if (query.decision === 'rejected')   { sql += ' AND rejected_count > 0'; }
  if (query.decision === 'uncertain')  { sql += ' AND uncertain_count > 0'; }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const rows = db.prepare(sql).all(...params);

  return { ok: true, verifications: rows, total: rows.length, limit, offset };
}

/** F10: Query tracker runs */
export function getVisionTrackerRuns(query: {
  status?: string;
  experiment_id?: string;
  limit?: number;
  offset?: number;
}) {
  const db = getDatabase();
  const limit = Math.min(parseInt(String(query.limit)) || 20, 200);
  const offset = parseInt(String(query.offset)) || 0;

  let sql = 'SELECT * FROM tracker_runs WHERE 1=1';
  const params: any[] = [];
  if (query.status) { sql += ' AND status = ?'; params.push(query.status); }
  if (query.experiment_id) { sql += ' AND source_experiment_id = ?'; params.push(query.experiment_id); }
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const rows = db.prepare(sql).all(...params);

  return { ok: true, tracker_runs: rows, total: rows.length, limit, offset };
}

/** F10: Query rule engine runs */
export function getVisionRuleEngineRuns(query: {
  status?: string;
  experiment_id?: string;
  limit?: number;
  offset?: number;
}) {
  const db = getDatabase();
  const limit = Math.min(parseInt(String(query.limit)) || 20, 200);
  const offset = parseInt(String(query.offset)) || 0;

  let sql = 'SELECT * FROM rule_engine_runs WHERE 1=1';
  const params: any[] = [];
  if (query.status) { sql += ' AND status = ?'; params.push(query.status); }
  if (query.experiment_id) { sql += ' AND source_experiment_id = ?'; params.push(query.experiment_id); }
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const rows = db.prepare(sql).all(...params);

  return { ok: true, rule_engine_runs: rows, total: rows.length, limit, offset };
}

// ══ v6.5.0 Phase 0: Plugin Registry API 配套函数 ═══════════════════════════
// 施工包 3: 审计查询 + Catalog 视图

export interface PluginAuditLogRecord {
  audit_id: string;
  plugin_id: string;
  plugin_name?: string;
  plugin_version?: string;
  action: string;
  event_type: string;
  status: string;
  result_code?: string;
  actor?: string;
  request_id?: string;
  input_summary?: string;
  output_summary?: string;
  error_type?: string;
  error_message?: string;
  execution_mode?: string;
  dry_run?: number;
  plugin_status?: string;
  risk_level?: string;
  duration_ms?: number;
  created_at: string;
}

export interface PluginAuditStats {
  total_audits: number;
  by_action: Record<string, number>;
  by_event_type: Record<string, number>;
  by_status: Record<string, number>;
  recent_24h: number;
  recent_blocked: number;
  recent_failed: number;
  top_blocked_plugins: Array<{ plugin_id: string; count: number }>;
  top_failed_plugins: Array<{ plugin_id: string; count: number }>;
}

export interface PluginCatalogEntry {
  plugin_id: string;
  name: string;
  category?: string;
  status: string;
  execution_mode?: string;
  risk_level: string;
  enabled: boolean;
  ui_node_type?: string;
  tags?: string[];
  version?: string;
  description?: string;
  author?: string;
  registered_at?: string;
  last_executed_at?: string;
  execution_count?: number;
  dry_run_supported?: boolean;
  execution_gate?: string;
  canvas_ready?: boolean;
}

/**
 * 查询插件审计日志
 */
export function listPluginAuditLogs(options: {
  plugin_id?: string;
  action?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): PluginAuditLogRecord[] {
  const safeLimit = Math.max(1, Math.min(Number(options.limit) || 50, 200));
  const safeOffset = Math.max(0, Number(options.offset) || 0);

  try {
    const db = getDatabase();
    let sql = `
      SELECT
        audit_id, plugin_id, plugin_name, plugin_version,
        action, event_type, status, result_code,
        actor, request_id,
        input_summary, output_summary,
        error_type, error_message,
        execution_mode, dry_run, plugin_status, risk_level,
        duration_ms, created_at
      FROM plugin_audit_logs
      WHERE 1=1
    `;
    const params: any[] = [];

    if (options.plugin_id) {
      sql += ' AND plugin_id = ?';
      params.push(options.plugin_id);
    }
    if (options.action) {
      sql += ' AND action = ?';
      params.push(options.action);
    }
    if (options.status) {
      sql += ' AND status = ?';
      params.push(options.status);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(safeLimit, safeOffset);

    const rows = db.prepare(sql).all(...params) as any[];
    return rows.map((row) => ({
      audit_id: String(row.audit_id),
      plugin_id: String(row.plugin_id),
      plugin_name: row.plugin_name || undefined,
      plugin_version: row.plugin_version || undefined,
      action: String(row.action),
      event_type: String(row.event_type),
      status: String(row.status),
      result_code: row.result_code || undefined,
      actor: row.actor || undefined,
      request_id: row.request_id || undefined,
      input_summary: row.input_summary || undefined,
      output_summary: row.output_summary || undefined,
      error_type: row.error_type || undefined,
      error_message: row.error_message || undefined,
      execution_mode: row.execution_mode || undefined,
      dry_run: row.dry_run || undefined,
      plugin_status: row.plugin_status || undefined,
      risk_level: row.risk_level || undefined,
      duration_ms: row.duration_ms || undefined,
      created_at: String(row.created_at),
    }));
  } catch (err) {
    if ((err as any).message?.includes('no such table')) {
      return [];
    }
    console.error('[VisionBus] Failed to list plugin audit logs:', err);
    return [];
  }
}

/**
 * 获取插件审计统计
 */
export function getPluginAuditStats(): PluginAuditStats {
  const defaultStats: PluginAuditStats = {
    total_audits: 0,
    by_action: {},
    by_event_type: {},
    by_status: {},
    recent_24h: 0,
    recent_blocked: 0,
    recent_failed: 0,
    top_blocked_plugins: [],
    top_failed_plugins: [],
  };

  try {
    const db = getDatabase();

    const tableCheck = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='plugin_audit_logs'
    `).get();
    if (!tableCheck) {
      return defaultStats;
    }

    const totalRow = db.prepare('SELECT COUNT(*) as total FROM plugin_audit_logs').get() as any;
    const total_audits = totalRow?.total || 0;

    const actionRows = db.prepare(`
      SELECT action, COUNT(*) as count FROM plugin_audit_logs GROUP BY action
    `).all() as any[];
    const by_action: Record<string, number> = {};
    for (const row of actionRows) by_action[row.action] = row.count;

    const eventTypeRows = db.prepare(`
      SELECT event_type, COUNT(*) as count FROM plugin_audit_logs GROUP BY event_type
    `).all() as any[];
    const by_event_type: Record<string, number> = {};
    for (const row of eventTypeRows) by_event_type[row.event_type] = row.count;

    const statusRows = db.prepare(`
      SELECT status, COUNT(*) as count FROM plugin_audit_logs GROUP BY status
    `).all() as any[];
    const by_status: Record<string, number> = {};
    for (const row of statusRows) by_status[row.status] = row.count;

    const recent24hRow = db.prepare(`
      SELECT COUNT(*) as count FROM plugin_audit_logs
      WHERE created_at >= datetime('now', '-1 day')
    `).get() as any;
    const recent_24h = recent24hRow?.count || 0;

    const blockedRow = db.prepare(`
      SELECT COUNT(*) as count FROM plugin_audit_logs
      WHERE status = 'blocked' AND created_at >= datetime('now', '-1 day')
    `).get() as any;
    const recent_blocked = blockedRow?.count || 0;

    const failedRow = db.prepare(`
      SELECT COUNT(*) as count FROM plugin_audit_logs
      WHERE status = 'failed' AND created_at >= datetime('now', '-1 day')
    `).get() as any;
    const recent_failed = failedRow?.count || 0;

    const topBlockedRows = db.prepare(`
      SELECT plugin_id, COUNT(*) as count FROM plugin_audit_logs
      WHERE status = 'blocked' AND created_at >= datetime('now', '-7 days')
      GROUP BY plugin_id ORDER BY count DESC LIMIT 5
    `).all() as any[];
    const top_blocked_plugins = topBlockedRows.map((r) => ({ plugin_id: String(r.plugin_id), count: Number(r.count) }));

    const topFailedRows = db.prepare(`
      SELECT plugin_id, COUNT(*) as count FROM plugin_audit_logs
      WHERE status = 'failed' AND created_at >= datetime('now', '-7 days')
      GROUP BY plugin_id ORDER BY count DESC LIMIT 5
    `).all() as any[];
    const top_failed_plugins = topFailedRows.map((r) => ({ plugin_id: String(r.plugin_id), count: Number(r.count) }));

    return { total_audits, by_action, by_event_type, by_status, recent_24h, recent_blocked, recent_failed, top_blocked_plugins, top_failed_plugins };
  } catch (err) {
    console.error('[VisionBus] Failed to get plugin audit stats:', err);
    return defaultStats;
  }
}

/**
 * 获取插件目录（Catalog）视图
 */
export function getPluginCatalog(): PluginCatalogEntry[] {
  try {
    const db = getDatabase();
    const rows = db.prepare(`
      SELECT
        plugin_id, name, category, status as lifecycle_status,
        execution_mode, risk_level, enabled, ui_node_type, tags,
        version, description, author,
        created_at as registered_at,
        updated_at,
        dry_run_supported,
        requires_approval
      FROM plugin_registry
      ORDER BY status, plugin_id
    `).all() as any[];

    return rows.map((row) => ({
      plugin_id: String(row.plugin_id),
      name: String(row.name),
      category: row.category || undefined,
      status: String(row.lifecycle_status || row.status || 'active'),
      execution_mode: row.execution_mode || undefined,
      risk_level: String(row.risk_level),
      enabled: toBool(row.enabled),
      ui_node_type: row.ui_node_type || undefined,
      tags: row.tags ? JSON.parse(row.tags) : undefined,
      version: row.version || undefined,
      description: row.description || undefined,
      author: row.author || undefined,
      registered_at: row.registered_at || undefined,
      dry_run_supported: row.dry_run_supported ? toBool(row.dry_run_supported) : false,
      execution_gate: row.execution_mode || undefined,
      canvas_ready: Boolean(
        row.ui_node_type &&
        ['source', 'transform', 'sink', 'control'].includes(row.ui_node_type) &&
        row.lifecycle_status &&
        !['frozen', 'planned', 'residual'].includes(row.lifecycle_status)
      ),
    }));
  } catch (err) {
    console.error('[VisionBus] Failed to get plugin catalog:', err);
    return [];
  }
}

/**
 * 获取单个插件的审计摘要
 */
export function getPluginAuditSummary(pluginId: string): {
  total: number;
  success: number;
  failed: number;
  blocked: number;
  last_audit_at?: string;
  last_execution_at?: string;
} {
  try {
    const db = getDatabase();
    const row = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked,
        MAX(created_at) as last_audit_at
      FROM plugin_audit_logs
      WHERE plugin_id = ?
    `).get(pluginId) as any;

    const lastExec = db.prepare(`
      SELECT MAX(created_at) as last_execution_at
      FROM plugin_audit_logs
      WHERE plugin_id = ? AND action IN ('execute_success', 'execute_failed', 'execute_attempt')
    `).get(pluginId) as any;

    return {
      total: Number(row?.total || 0),
      success: Number(row?.success || 0),
      failed: Number(row?.failed || 0),
      blocked: Number(row?.blocked || 0),
      last_audit_at: row?.last_audit_at || undefined,
      last_execution_at: lastExec?.last_execution_at || undefined,
    };
  } catch (err) {
    return { total: 0, success: 0, failed: 0, blocked: 0 };
  }
}
