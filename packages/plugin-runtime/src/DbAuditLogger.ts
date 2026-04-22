// Plugin Runtime - 数据库审计写入器
// 施工包 2: 审计入库
// AGI Model Factory v6.5.0

import {
  PluginAuditLogEntry,
  PluginAuditAction,
  PluginAuditEventType,
  PluginAuditStatus,
  PluginLifecycleStatus,
  ExecutionMode,
  RiskLevel,
} from '@agi-factory/plugin-sdk';

/**
 * 数据库连接接口（简化）
 * 实际项目中应使用应用的数据库连接池
 */
export interface DatabaseConnection {
  run(sql: string, params?: any[]): Promise<{ lastID?: number; changes?: number }>;
  get(sql: string, params?: any[]): Promise<any>;
  all(sql: string, params?: any[]): Promise<any[]>;
}

/**
 * 审计写入配置
 */
export interface DbAuditLoggerOptions {
  db: DatabaseConnection;
  consoleFallback?: boolean;      // DB 失败时是否降级到 console
  bestEffort?: boolean;           // 是否 best-effort 模式（不抛错）
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * 生成唯一 ID
 */
function generateAuditId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * 生成请求追踪 ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 安全序列化（处理循环引用）
 */
function safeSerialize(obj: any, maxLength: number = 4000): string {
  try {
    const str = JSON.stringify(obj);
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
  } catch (e) {
    return '[Serialization Error]';
  }
}

/**
 * 脱敏处理
 */
function sanitizeInput(input: any): any {
  if (!input || typeof input !== 'object') return input;
  
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
  const sanitized = { ...input };
  
  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
      sanitized[key] = '***REDACTED***';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeInput(sanitized[key]);
    }
  }
  
  return sanitized;
}

/**
 * 数据库审计写入器
 * 
 * 设计原则:
 * 1. Best-effort: 写入失败不阻断主流程
 * 2. Fallback: DB 失败可降级到 console
 * 3. 异步: 所有写入都是异步，不阻塞
 * 4. 脱敏: 自动处理敏感字段
 */
export class DbAuditLogger {
  private db: DatabaseConnection;
  private consoleFallback: boolean;
  private bestEffort: boolean;
  private logLevel: string;

  constructor(options: DbAuditLoggerOptions) {
    this.db = options.db;
    this.consoleFallback = options.consoleFallback ?? true;
    this.bestEffort = options.bestEffort ?? true;
    this.logLevel = options.logLevel ?? 'info';
  }

  /**
   * 核心写入方法
   */
  async write(entry: Partial<PluginAuditLogEntry>): Promise<void> {
    const fullEntry: PluginAuditLogEntry = {
      audit_id: entry.audit_id || generateAuditId(),
      plugin_id: entry.plugin_id!,
      plugin_name: entry.plugin_name,
      plugin_version: entry.plugin_version,
      action: entry.action!,
      event_type: entry.event_type!,
      status: entry.status!,
      result_code: entry.result_code,
      actor: entry.actor || 'system',
      request_id: entry.request_id || generateRequestId(),
      trace_id: entry.trace_id,
      session_id: entry.session_id,
      input_summary: entry.input_summary,
      output_summary: entry.output_summary,
      error_type: entry.error_type,
      error_message: entry.error_message,
      error_stack: entry.error_stack,
      execution_mode: entry.execution_mode,
      dry_run: entry.dry_run ?? false,
      plugin_status: entry.plugin_status,
      risk_level: entry.risk_level,
      duration_ms: entry.duration_ms,
      memory_usage_kb: entry.memory_usage_kb,
      client_ip: entry.client_ip,
      user_agent: entry.user_agent,
      metadata_json: entry.metadata_json,
      created_at: entry.created_at || new Date().toISOString(),
    };

    try {
      await this.insertToDb(fullEntry);
      
      if (this.logLevel === 'debug') {
        console.log(`[DbAudit] ${fullEntry.action} ${fullEntry.plugin_id} -> ${fullEntry.status}`);
      }
    } catch (error: any) {
      if (this.consoleFallback) {
        console.warn(`[DbAudit] DB write failed, falling back to console:`, error.message);
        this.writeToConsole(fullEntry);
      }
      
      if (!this.bestEffort) {
        throw error;
      }
    }
  }

  /**
   * 插入数据库
   */
  private async insertToDb(entry: PluginAuditLogEntry): Promise<void> {
    const sql = `
      INSERT INTO plugin_audit_logs (
        audit_id, plugin_id, plugin_name, plugin_version,
        action, event_type, status, result_code,
        actor, request_id, trace_id, session_id,
        input_summary, output_summary,
        error_type, error_message, error_stack,
        execution_mode, dry_run, plugin_status, risk_level,
        duration_ms, memory_usage_kb,
        client_ip, user_agent, metadata_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      entry.audit_id,
      entry.plugin_id,
      entry.plugin_name || null,
      entry.plugin_version || null,
      entry.action,
      entry.event_type,
      entry.status,
      entry.result_code || null,
      entry.actor,
      entry.request_id,
      entry.trace_id || null,
      entry.session_id || null,
      entry.input_summary || null,
      entry.output_summary || null,
      entry.error_type || null,
      entry.error_message || null,
      entry.error_stack || null,
      entry.execution_mode || null,
      entry.dry_run ? 1 : 0,
      entry.plugin_status || null,
      entry.risk_level || null,
      entry.duration_ms || null,
      entry.memory_usage_kb || null,
      entry.client_ip || null,
      entry.user_agent || null,
      entry.metadata_json || null,
      entry.created_at,
    ];

    await this.db.run(sql, params);
  }

  /**
   * Console 降级输出
   */
  private writeToConsole(entry: PluginAuditLogEntry): void {
    console.log(`[Audit] ${entry.created_at} [${entry.event_type}] ${entry.action} ${entry.plugin_id} -> ${entry.status}`, {
      request_id: entry.request_id,
      actor: entry.actor,
      error_message: entry.error_message,
    });
  }

  // ========== 便捷方法 ==========

  /**
   * 记录插件发现
   */
  async logDiscover(
    pluginId: string,
    source: string,
    metadata?: any
  ): Promise<void> {
    await this.write({
      plugin_id: pluginId,
      action: 'discover',
      event_type: 'lifecycle',
      status: 'success',
      actor: 'system',
      metadata_json: safeSerialize({ source, ...metadata }),
    });
  }

  /**
   * 记录插件注册
   */
  async logRegister(
    pluginId: string,
    pluginName: string,
    version: string,
    riskLevel: RiskLevel,
    status: PluginLifecycleStatus
  ): Promise<void> {
    await this.write({
      plugin_id: pluginId,
      plugin_name: pluginName,
      plugin_version: version,
      action: 'register',
      event_type: 'lifecycle',
      status: 'success',
      actor: 'system',
      risk_level: riskLevel,
      plugin_status: status,
    });
  }

  /**
   * 记录插件启用
   */
  async logEnable(
    pluginId: string,
    pluginName: string,
    actor: string = 'system'
  ): Promise<void> {
    await this.write({
      plugin_id: pluginId,
      plugin_name: pluginName,
      action: 'enable',
      event_type: 'lifecycle',
      status: 'success',
      actor,
    });
  }

  /**
   * 记录插件禁用
   */
  async logDisable(
    pluginId: string,
    pluginName: string,
    actor: string = 'system'
  ): Promise<void> {
    await this.write({
      plugin_id: pluginId,
      plugin_name: pluginName,
      action: 'disable',
      event_type: 'lifecycle',
      status: 'success',
      actor,
    });
  }

  /**
   * 记录状态变更
   */
  async logStatusChange(
    pluginId: string,
    fromStatus: PluginLifecycleStatus,
    toStatus: PluginLifecycleStatus,
    reason?: string
  ): Promise<void> {
    await this.write({
      plugin_id: pluginId,
      action: 'status_change',
      event_type: 'lifecycle',
      status: 'success',
      actor: 'system',
      plugin_status: toStatus,
      metadata_json: safeSerialize({ from_status: fromStatus, to_status: toStatus, reason }),
    });
  }

  /**
   * 记录执行尝试
   */
  async logExecuteAttempt(
    pluginId: string,
    action: string,
    params: any,
    executionMode: ExecutionMode,
    dryRun: boolean
  ): Promise<void> {
    await this.write({
      plugin_id: pluginId,
      action: 'execute_attempt',
      event_type: 'execution',
      status: 'pending',
      actor: 'system',
      input_summary: safeSerialize(sanitizeInput(params)),
      execution_mode: executionMode,
      dry_run: dryRun,
    });
  }

  /**
   * 记录执行被拦截
   */
  async logExecuteBlocked(
    pluginId: string,
    action: string,
    reason: string,
    executionMode: ExecutionMode
  ): Promise<void> {
    await this.write({
      plugin_id: pluginId,
      action: 'execute_blocked',
      event_type: 'gate',
      status: 'blocked',
      actor: 'system',
      error_message: reason,
      execution_mode: executionMode,
    });
  }

  /**
   * 记录执行成功
   */
  async logExecuteSuccess(
    pluginId: string,
    action: string,
    result: any,
    durationMs: number,
    dryRun: boolean
  ): Promise<void> {
    await this.write({
      plugin_id: pluginId,
      action: 'execute_success',
      event_type: 'execution',
      status: 'success',
      actor: 'system',
      output_summary: safeSerialize(result),
      duration_ms: durationMs,
      dry_run: dryRun,
    });
  }

  /**
   * 记录执行失败
   */
  async logExecuteFailed(
    pluginId: string,
    action: string,
    error: Error,
    durationMs: number
  ): Promise<void> {
    await this.write({
      plugin_id: pluginId,
      action: 'execute_failed',
      event_type: 'execution',
      status: 'failed',
      actor: 'system',
      error_type: error.constructor.name,
      error_message: error.message,
      error_stack: error.stack?.substring(0, 2000),
      duration_ms: durationMs,
    });
  }

  /**
   * 记录回滚
   */
  async logRollback(
    pluginId: string,
    action: string,
    reason: string,
    originalStatus: PluginAuditStatus
  ): Promise<void> {
    await this.write({
      plugin_id: pluginId,
      action: 'rollback',
      event_type: 'execution',
      status: 'rolled_back',
      actor: 'system',
      error_message: reason,
      metadata_json: safeSerialize({ original_status: originalStatus }),
    });
  }
}

/**
 * 创建数据库审计写入器
 */
export function createDbAuditLogger(options: DbAuditLoggerOptions): DbAuditLogger {
  return new DbAuditLogger(options);
}
