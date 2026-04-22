// Plugin Runtime - 插件管理器核心
// AGI Model Factory v6.0.0

import {
  PluginManifest,
  PluginInfo,
  PluginStatus,
  ValidationResult,
  RegisterResult,
  EnableDisableResult,
  ExecutionResult,
  ExecutionMode,
  ListOptions,
  PluginRuntimeOptions,
  validateManifest,
  applyRiskDefaults,
} from '@agi-factory/plugin-sdk';

import {
  PluginLoader,
  LoadedPlugin,
} from './Loader.js';

import {
  AuditInterceptor,
  createConsoleAuditLogger,
  AuditLogger,
  AuditInterceptorOptions,
} from './AuditInterceptor.js';

import { DbAuditLogger } from './DbAuditLogger.js';
import { getDbAdapter } from './DbAdapter.js';

import {
  PluginError,
  PluginNotFoundError,
  PluginAlreadyExistsError,
  PluginValidationError,
  PluginDisabledError,
  PluginExecutionError,
  PluginSystemDisabledError,
} from './errors.js';

/**
 * 已注册的插件记录
 */
interface RegisteredPlugin {
  manifest: PluginManifest;
  loaded: LoadedPlugin | null;
  enabled: boolean;
  registered_at: string;
  last_executed_at?: string;
  execution_count: number;
}

/**
 * v6.5.0 Phase 0 施工包5: 执行门禁检查结果
 */
interface ExecutionGateResult {
  allowed: boolean;
  reason?: string;
  gate_source?: 'system_disabled' | 'not_found' | 'disabled' | 'lifecycle_gate'
    | 'execution_mode_gate' | 'dry_run_gate' | 'trial_gate' | 'approved';
}

/**
 * 插件管理器 - Plugin Runtime 核心
 */
export class PluginManager {
  private plugins: Map<string, RegisteredPlugin> = new Map();
  private loader: PluginLoader;
  private audit: AuditInterceptor;
  private systemEnabled: boolean = true;
  private options: PluginRuntimeOptions;

  constructor(options: PluginRuntimeOptions = {}) {
    this.options = {
      enabled: true,
      pluginDir: './plugins/builtin',
      autoLoadBuiltin: true,
      logLevel: 'info',
      ...options,
    };

    // 如果明确禁用
    if (this.options.enabled === false) {
      this.systemEnabled = false;
    }

    // 初始化加载器
    this.loader = new PluginLoader(this.options.pluginDir || './plugins/builtin');

    // 初始化审计拦截器
    // Phase 0.5: 接入 DbAuditLogger
    const dbAdapter = getDbAdapter();
    const auditOptions: AuditInterceptorOptions = {
      dbAudit: dbAdapter ? new DbAuditLogger({
        db: dbAdapter,
        consoleFallback: true,
        bestEffort: true,
        logLevel: 'info',
      }) : undefined,
      consoleEnabled: true,
      bestEffort: true,
    };
    this.audit = new AuditInterceptor(auditOptions);

    // 如果启用，自动加载内置插件
    if (this.systemEnabled && this.options.autoLoadBuiltin) {
      this.loadBuiltinPlugins().catch((err) => {
        console.error('[PluginManager] Failed to auto-load builtin plugins:', err);
      });
    }
  }

  /**
   * 注册插件
   */
  async registerPlugin(manifest: PluginManifest): Promise<RegisterResult> {
    // 检查插件系统是否启用
    if (!this.systemEnabled) {
      return { success: false, error: 'Plugin system is disabled' };
    }

    // 验证 manifest
    const validation = validateManifest(manifest);
    if (!validation.valid) {
      return { success: false, error: `Validation failed: ${validation.errors?.join(', ')}` };
    }

    // 检查是否已存在
    if (this.plugins.has(manifest.plugin_id)) {
      return { success: false, error: `Plugin already exists: ${manifest.plugin_id}` };
    }

    // 应用风险默认值
    const processedManifest = applyRiskDefaults(manifest);

    // 注册
    const registered: RegisteredPlugin = {
      manifest: processedManifest,
      loaded: null,
      enabled: processedManifest.enabled ?? true,
      registered_at: new Date().toISOString(),
      execution_count: 0,
    };

    this.plugins.set(manifest.plugin_id, registered);

    // 审计
    await this.audit.onPluginRegistered(
      manifest.plugin_id,
      manifest.name,
      manifest.risk_level
    );

    return { success: true, plugin_id: manifest.plugin_id };
  }

  /**
   * 验证 Manifest
   */
  validatePluginManifest(manifest: any): ValidationResult {
    return validateManifest(manifest);
  }

  /**
   * 启用插件
   */
  async enablePlugin(pluginId: string): Promise<EnableDisableResult> {
    if (!this.systemEnabled) {
      return { success: false, error: 'Plugin system is disabled' };
    }

    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return { success: false, error: `Plugin not found: ${pluginId}` };
    }

    // HIGH/CRITICAL 需要确认
    if (plugin.manifest.risk_level === 'HIGH' || plugin.manifest.risk_level === 'CRITICAL') {
      console.warn(`[PluginManager] Enabling HIGH/CRITICAL risk plugin: ${pluginId}`);
    }

    plugin.enabled = true;
    plugin.manifest.enabled = true;

    // 审计
    await this.audit.onPluginEnabled(pluginId, plugin.manifest.name);

    return { success: true, plugin_id: pluginId };
  }

  /**
   * 禁用插件
   */
  async disablePlugin(pluginId: string): Promise<EnableDisableResult> {
    if (!this.systemEnabled) {
      return { success: false, error: 'Plugin system is disabled' };
    }

    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return { success: false, error: `Plugin not found: ${pluginId}` };
    }

    plugin.enabled = false;
    plugin.manifest.enabled = false;

    // 审计
    await this.audit.onPluginDisabled(pluginId, plugin.manifest.name);

    return { success: true, plugin_id: pluginId };
  }

  /**
   * 列出所有插件
   */
  listPlugins(options?: ListOptions): PluginInfo[] {
    let plugins = Array.from(this.plugins.values());

    // 过滤
    if (options?.enabled !== undefined) {
      plugins = plugins.filter((p) => p.enabled === options.enabled);
    }
    if (options?.capability) {
      plugins = plugins.filter((p) => p.manifest.capabilities.includes(options.capability!));
    }
    if (options?.risk_level) {
      plugins = plugins.filter((p) => p.manifest.risk_level === options.risk_level);
    }
    if (options?.search) {
      const search = options.search.toLowerCase();
      plugins = plugins.filter(
        (p) =>
          p.manifest.name.toLowerCase().includes(search) ||
          p.manifest.plugin_id.toLowerCase().includes(search)
      );
    }

    return plugins.map((p) => ({
      plugin_id: p.manifest.plugin_id,
      name: p.manifest.name,
      version: p.manifest.version,
      capabilities: p.manifest.capabilities,
      permissions: p.manifest.permissions || [],
      risk_level: p.manifest.risk_level,
      enabled: p.enabled,
      author: p.manifest.author,
      description: p.manifest.description,
      tags: p.manifest.tags,
      registered_at: p.registered_at,
      last_executed_at: p.last_executed_at,
      execution_count: p.execution_count,
      // V1 新增字段 (从 manifest 中获取，旧插件默认值)
      category: (p.manifest as any).category || 'legacy/unknown',
      status: (p.manifest as any).status || 'active' as any,
      execution_mode: (p.manifest as any).execution_mode || 'readonly' as any,
      requires_approval: (p.manifest as any).requires_approval ?? false,
      dry_run_supported: (p.manifest as any).dry_run_supported ?? false,
      ui_node_type: (p.manifest as any).ui_node_type,
      allowed_upstream: (p.manifest as any).allowed_upstream,
      allowed_downstream: (p.manifest as any).allowed_downstream,
      input_schema: (p.manifest as any).input_schema,
      output_schema: (p.manifest as any).output_schema,
      icon: (p.manifest as any).icon,
      color: (p.manifest as any).color,
      documentation_url: (p.manifest as any).documentation_url,
    }));
  }

  /**
   * 加载内置插件
   */
  async loadBuiltinPlugins(): Promise<void> {
    const loaded = await this.loader.loadBuiltinPlugins();

    for (const plugin of loaded) {
      // 注册插件（如果不存在）
      if (!this.plugins.has(plugin.manifest.plugin_id)) {
        const registered: RegisteredPlugin = {
          manifest: plugin.manifest,
          loaded: plugin,
          enabled: plugin.manifest.enabled ?? true,
          registered_at: new Date().toISOString(),
          execution_count: 0,
        };
        this.plugins.set(plugin.manifest.plugin_id, registered);

        // 审计
        await this.audit.onPluginLoaded(plugin.manifest.plugin_id, plugin.manifest.name);
        await this.audit.onPluginRegistered(
          plugin.manifest.plugin_id,
          plugin.manifest.name,
          plugin.manifest.risk_level
        );
      }
    }
  }

  // ===================================================================
  // v6.5.0 Phase 0 - 施工包5: 执行门禁加固
  // ===================================================================

  /**
   * 检查插件执行门禁
   * 
   * 执行门禁矩阵：
   * ┌────────────────┬────────┬──────────────┬──────────┬─────────────┐
   * │ status         │ enabled│ execution_   │ dry_run  │ 可执行？    │
   * │                │        │ mode         │          │             │
   * ├────────────────┼────────┼──────────────┼──────────┼─────────────┤
   * │ active         │ 1      │ readonly     │ any      │ YES ✅       │
   * │ active         │ 1      │ readonly     │ -        │ YES ✅       │
   * │ active         │ 0      │ any          │ -        │ NO ❌        │
   * │ active         │ 1      │ resource_*   │ -        │ NO ❌        │
   * │ active         │ 1      │ side_effect  │ -        │ NO ❌        │
   * │ trial          │ 1      │ readonly     │ true     │ YES ✅       │
   * │ trial          │ 1      │ resource_*   │ true     │ YES ✅       │
   * │ trial          │ 1      │ any          │ false/   │ NO ❌        │
   * │                │        │              │ absent   │             │
   * │ frozen         │ any    │ any          │ any      │ NO ❌        │
   * │ planned        │ any    │ any          │ any      │ NO ❌        │
   * │ residual       │ any    │ any          │ any      │ NO ❌        │
   * └────────────────┴────────┴──────────────┴──────────┴─────────────┘
   */
  checkPluginExecutionGate(
    pluginId: string,
    options?: { dry_run?: boolean; execution_options?: Record<string, any> }
  ): ExecutionGateResult {
    // 系统未启用
    if (!this.systemEnabled) {
      return {
        allowed: false,
        reason: 'Plugin system is disabled',
        gate_source: 'system_disabled',
      };
    }

    // 插件不存在
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return {
        allowed: false,
        reason: `Plugin not found: ${pluginId}`,
        gate_source: 'not_found',
      };
    }

    // enabled=0 禁止执行
    if (!plugin.enabled) {
      return {
        allowed: false,
        reason: `Plugin is disabled: ${pluginId}`,
        gate_source: 'disabled',
      };
    }

    // ===== 生命周期门禁 =====
    const status: string = (plugin.manifest as any).status || 'active';
    const executionMode: string = (plugin.manifest as any).execution_mode || 'readonly';
    const dryRun: boolean = options?.dry_run === true;

    if (['frozen', 'planned', 'residual'].includes(status)) {
      return {
        allowed: false,
        reason: `Plugin lifecycle status '${status}' prohibits execution: ${pluginId}`,
        gate_source: 'lifecycle_gate',
      };
    }

    // ===== execution_mode 门禁 =====
    // readonly: 仅 active + enabled 可执行（demo-plugin）
    if (executionMode === 'readonly') {
      if (status === 'active' || status === 'trial') {
        return { allowed: true, gate_source: 'approved' };
      }
      return {
        allowed: false,
        reason: `execution_mode=readonly but status=${status}: ${pluginId}`,
        gate_source: 'execution_mode_gate',
      };
    }

    // resource_intensive: trial 必须 dry_run=true，其他禁止
    if (executionMode === 'resource_intensive') {
      if (status === 'trial') {
        if (dryRun) {
          return { allowed: true, gate_source: 'approved' };
        }
        return {
          allowed: false,
          reason: `Plugin '${pluginId}' (trial) requires dry_run=true to execute, but dry_run was false/absent`,
          gate_source: 'dry_run_gate',
        };
      }
      if (status === 'active') {
        // active + resource_intensive: 默认禁止，除非未来明确白名单
        return {
          allowed: false,
          reason: `Plugin '${pluginId}' (active, execution_mode=resource_intensive) is not yet authorized for full execution`,
          gate_source: 'execution_mode_gate',
        };
      }
    }

    // side_effect: 默认禁止
    if (executionMode === 'side_effect') {
      return {
        allowed: false,
        reason: `Plugin '${pluginId}' (execution_mode=side_effect) is prohibited from execution`,
        gate_source: 'execution_mode_gate',
      };
    }

    // 默认：禁止
    return {
      allowed: false,
      reason: `Unknown execution context for plugin '${pluginId}': status=${status}, mode=${executionMode}`,
      gate_source: 'execution_mode_gate',
    };
  }

  /**
   * 执行插件（带强制门禁）
   */
  async executePlugin(pluginId: string, action: string, params?: any): Promise<ExecutionResult> {
    const startTime = Date.now();
    const dryRun = params?.dry_run === true;
    const rawExecutionMode = (params as any)?.execution_mode ||
      ((this.plugins.get(pluginId)?.manifest as any)?.execution_mode || 'readonly');
    const executionMode: ExecutionMode = rawExecutionMode as ExecutionMode;

    // ===== 前置：写入 execute_attempt 审计（不阻断）=====
    await this.audit.onPluginExecuted(
      pluginId, action, params,
      { success: false, _stub: true },
      0,
      executionMode,
      dryRun
    ).catch(() => { /* best-effort */ });

    // ===== 执行门禁检查 =====
    const gate = this.checkPluginExecutionGate(pluginId, { dry_run: dryRun });

    if (!gate.allowed) {
      // 写入 execute_blocked 审计
      await this.audit.onPluginExecutionBlocked(
        pluginId,
        action,
        gate.reason || 'Execution gate denied',
        executionMode as any
      ).catch(() => { /* best-effort */ });

      return {
        success: false,
        plugin_id: pluginId,
        action,
        error: gate.reason,
        gate_source: gate.gate_source,
        executed_at: new Date().toISOString(),
        duration_ms: 0,
        _gate_blocked: true,
      };
    }

    // ===== 门禁通过，实际执行 =====
    try {
      let result: any;
      if (this.plugins.get(pluginId)?.loaded?.module?.execute) {
        result = await this.plugins.get(pluginId)!.loaded!.module!.execute(action, params);
      } else {
        result = { message: 'Plugin executed (no custom handler)', action, params };
      }

      const durationMs = Date.now() - startTime;

      // 更新执行统计
      const plugin = this.plugins.get(pluginId)!;
      plugin.last_executed_at = new Date().toISOString();
      plugin.execution_count++;

      // 审计：execute_success
      await this.audit.onPluginExecuted(
        pluginId, action, params, result, durationMs,
        executionMode as any, dryRun
      );

      return {
        success: true,
        plugin_id: pluginId,
        action,
        result,
        executed_at: new Date().toISOString(),
        duration_ms: durationMs,
      };
    } catch (error: any) {
      const durationMs = Date.now() - startTime;

      // 审计：execute_failed
      await this.audit.onPluginFailed(pluginId, action, error.message, durationMs);

      return {
        success: false,
        plugin_id: pluginId,
        action,
        error: error.message,
        executed_at: new Date().toISOString(),
        duration_ms: durationMs,
      };
    }
  }

  /**
   * 获取插件状态
   */
  getPluginStatus(pluginId: string): PluginStatus | null {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return null;
    }

    return {
      plugin_id: pluginId,
      enabled: plugin.enabled,
      registered: true,
      loaded: plugin.loaded !== null,
    };
  }

  /**
   * 启用/禁用插件系统
   */
  setPluginSystemEnabled(enabled: boolean): void {
    this.systemEnabled = enabled;
    this.audit.setEnabled(enabled);
    console.log(`[PluginManager] Plugin system ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * 获取插件系统状态
   */
  isPluginSystemEnabled(): boolean {
    return this.systemEnabled;
  }

  /**
   * 获取插件数量统计
   */
  getStats(): { total: number; enabled: number; disabled: number } {
    const plugins = Array.from(this.plugins.values());
    return {
      total: plugins.length,
      enabled: plugins.filter((p) => p.enabled).length,
      disabled: plugins.filter((p) => !p.enabled).length,
    };
  }
}
