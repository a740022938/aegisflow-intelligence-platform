"use strict";
// Plugin Runtime - 审计拦截器
// 施工包 2: 审计入库升级
// AGI Model Factory v6.5.0
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditInterceptor = void 0;
exports.createConsoleAuditLogger = createConsoleAuditLogger;
/**
 * 审计拦截器 - 拦截所有插件操作并记录
 *
 * 施工包 2 升级:
 * - 旧接口: console.log 输出
 * - 新接口: DbAuditLogger 数据库写入
 * - 兼容: 保留 console 降级，DB 优先
 * - Best-effort: DB 写入失败不阻断主流程
 */
class AuditInterceptor {
    logger; // 旧日志器（兼容）
    dbAudit; // 新数据库审计
    consoleEnabled; // 是否保留 console
    bestEffort; // DB 失败是否不抛错
    enabled = true;
    constructor(loggerOrOptions, legacyLogger) {
        // 兼容旧构造函数签名
        if ('log' in loggerOrOptions) {
            // 旧签名: AuditInterceptor(logger)
            this.logger = loggerOrOptions;
            this.dbAudit = null;
            this.consoleEnabled = true;
            this.bestEffort = true;
        }
        else {
            // 新签名: AuditInterceptor(options)
            const options = loggerOrOptions;
            this.dbAudit = options.dbAudit || null;
            this.consoleEnabled = options.consoleEnabled ?? true;
            this.bestEffort = options.bestEffort ?? true;
            this.logger = legacyLogger || createConsoleAuditLogger();
        }
    }
    /**
     * 记录插件发现
     */
    async onPluginDiscovered(pluginId, source) {
        if (!this.enabled)
            return;
        // DB 审计
        if (this.dbAudit) {
            try {
                await this.dbAudit.logDiscover(pluginId, source);
            }
            catch (e) {
                this.handleDbError(e);
            }
        }
        // Console 降级
        if (this.consoleEnabled) {
            await this.logger.log('plugin', 'PLUGIN_DISCOVERED', pluginId, 'success', { source });
        }
    }
    /**
     * 记录插件注册事件
     */
    async onPluginRegistered(pluginId, pluginName, riskLevel, lifecycleStatus) {
        if (!this.enabled)
            return;
        // DB 审计
        if (this.dbAudit) {
            try {
                await this.dbAudit.logRegister(pluginId, pluginName, '1.0.0', riskLevel, lifecycleStatus || 'active');
            }
            catch (e) {
                this.handleDbError(e);
            }
        }
        // Console 降级
        if (this.consoleEnabled) {
            await this.logger.log('plugin', 'PLUGIN_REGISTERED', pluginId, 'success', {
                plugin_name: pluginName,
                risk_level: riskLevel,
                lifecycle_status: lifecycleStatus,
            });
        }
    }
    /**
     * 记录插件启用事件
     */
    async onPluginEnabled(pluginId, pluginName, actor) {
        if (!this.enabled)
            return;
        // DB 审计
        if (this.dbAudit) {
            try {
                await this.dbAudit.logEnable(pluginId, pluginName, actor);
            }
            catch (e) {
                this.handleDbError(e);
            }
        }
        // Console 降级
        if (this.consoleEnabled) {
            await this.logger.log('plugin', 'PLUGIN_ENABLED', pluginId, 'success', {
                plugin_name: pluginName,
                actor,
            });
        }
    }
    /**
     * 记录插件禁用事件
     */
    async onPluginDisabled(pluginId, pluginName, actor) {
        if (!this.enabled)
            return;
        // DB 审计
        if (this.dbAudit) {
            try {
                await this.dbAudit.logDisable(pluginId, pluginName, actor);
            }
            catch (e) {
                this.handleDbError(e);
            }
        }
        // Console 降级
        if (this.consoleEnabled) {
            await this.logger.log('plugin', 'PLUGIN_DISABLED', pluginId, 'success', {
                plugin_name: pluginName,
                actor,
            });
        }
    }
    /**
     * 记录状态变更事件
     */
    async onPluginStatusChanged(pluginId, fromStatus, toStatus, reason) {
        if (!this.enabled)
            return;
        // DB 审计
        if (this.dbAudit) {
            try {
                await this.dbAudit.logStatusChange(pluginId, fromStatus, toStatus, reason);
            }
            catch (e) {
                this.handleDbError(e);
            }
        }
        // Console 降级
        if (this.consoleEnabled) {
            await this.logger.log('plugin', 'PLUGIN_STATUS_CHANGED', pluginId, 'success', {
                from_status: fromStatus,
                to_status: toStatus,
                reason,
            });
        }
    }
    /**
     * 记录插件执行事件
     */
    async onPluginExecuted(pluginId, action, params, result, durationMs, executionMode, dryRun) {
        if (!this.enabled)
            return;
        // DB 审计
        if (this.dbAudit) {
            try {
                await this.dbAudit.logExecuteSuccess(pluginId, action, result, durationMs, dryRun ?? false);
            }
            catch (e) {
                this.handleDbError(e);
            }
        }
        // Console 降级
        if (this.consoleEnabled) {
            await this.logger.log('plugin', 'PLUGIN_EXECUTED', pluginId, 'success', {
                action,
                params,
                duration_ms: durationMs,
                result_preview: typeof result === 'string' ? result.substring(0, 100) : result,
                execution_mode: executionMode,
                dry_run: dryRun,
            });
        }
    }
    /**
     * 记录插件执行被拦截事件
     */
    async onPluginExecutionBlocked(pluginId, action, reason, executionMode) {
        if (!this.enabled)
            return;
        // DB 审计
        if (this.dbAudit) {
            try {
                await this.dbAudit.logExecuteBlocked(pluginId, action, reason, executionMode || 'readonly');
            }
            catch (e) {
                this.handleDbError(e);
            }
        }
        // Console 降级
        if (this.consoleEnabled) {
            await this.logger.log('plugin', 'PLUGIN_EXECUTION_BLOCKED', pluginId, 'blocked', {
                action,
                reason,
                execution_mode: executionMode,
            });
        }
    }
    /**
     * 记录插件失败事件
     */
    async onPluginFailed(pluginId, action, error, durationMs) {
        if (!this.enabled)
            return;
        // DB 审计
        if (this.dbAudit) {
            try {
                await this.dbAudit.logExecuteFailed(pluginId, action, new Error(error), durationMs || 0);
            }
            catch (e) {
                this.handleDbError(e);
            }
        }
        // Console 降级
        if (this.consoleEnabled) {
            await this.logger.log('plugin', 'PLUGIN_FAILED', pluginId, 'error', {
                action,
                error,
                duration_ms: durationMs,
            });
        }
    }
    /**
     * 记录回滚事件
     */
    async onPluginRollback(pluginId, action, reason, originalStatus) {
        if (!this.enabled)
            return;
        // DB 审计
        if (this.dbAudit) {
            try {
                await this.dbAudit.logRollback(pluginId, action, reason, originalStatus || 'pending');
            }
            catch (e) {
                this.handleDbError(e);
            }
        }
        // Console 降级
        if (this.consoleEnabled) {
            await this.logger.log('plugin', 'PLUGIN_ROLLBACK', pluginId, 'rolled_back', {
                action,
                reason,
                original_status: originalStatus,
            });
        }
    }
    /**
     * 记录插件加载事件
     */
    async onPluginLoaded(pluginId, pluginName) {
        if (!this.enabled)
            return;
        // DB 审计 (用 discover 语义)
        if (this.dbAudit) {
            try {
                await this.dbAudit.logDiscover(pluginId, 'builtin_load', { plugin_name: pluginName });
            }
            catch (e) {
                this.handleDbError(e);
            }
        }
        // Console 降级
        if (this.consoleEnabled) {
            await this.logger.log('plugin', 'PLUGIN_LOADED', pluginId, 'success', {
                plugin_name: pluginName,
            });
        }
    }
    /**
     * 记录插件卸载事件
     */
    async onPluginUnloaded(pluginId, pluginName) {
        if (!this.enabled)
            return;
        // Console 降级
        if (this.consoleEnabled) {
            await this.logger.log('plugin', 'PLUGIN_UNLOADED', pluginId, 'success', {
                plugin_name: pluginName,
            });
        }
    }
    /**
     * 处理 DB 写入错误
     */
    handleDbError(error) {
        if (this.bestEffort) {
            console.warn('[AuditInterceptor] DB audit write failed (best-effort, continuing):', error?.message || error);
        }
        else {
            throw error;
        }
    }
    /**
     * 启用/禁用审计
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    /**
     * 设置 DB 审计写入器
     */
    setDbAudit(dbAudit) {
        this.dbAudit = dbAudit;
    }
}
exports.AuditInterceptor = AuditInterceptor;
/**
 * 创建内置审计日志器（使用 console.log）
 * 保留为降级选项
 */
function createConsoleAuditLogger(prefix = '[Audit]') {
    return {
        async log(category, action, target, result, detail) {
            const timestamp = new Date().toISOString();
            const logLine = `${timestamp} ${prefix} [${category}] ${action} ${target} -> ${result}`;
            if (detail) {
                console.log(logLine, detail);
            }
            else {
                console.log(logLine);
            }
        },
    };
}
