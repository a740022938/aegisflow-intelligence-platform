// Plugin SDK - 类型定义
// AGI Model Factory v6.5.0 - Phase 0: Manifest V1

/**
 * 风险级别
 */
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/**
 * 插件能力
 */
export type Capability = 'report' | 'read' | 'compute' | 'notify' | 'transform' | 'export' | 'vision';

/**
 * 插件生命周期状态 (V1 新增)
 */
export type PluginLifecycleStatus = 'active' | 'gated' | 'trial' | 'frozen' | 'planned' | 'residual';

/**
 * 执行模式 (V1 新增)
 */
export type ExecutionMode = 'readonly' | 'side_effect' | 'resource_intensive';

/**
 * 画布节点类型 (V1 新增)
 */
export type UINodeType = 'source' | 'transform' | 'sink' | 'control';

/**
 * JSON Schema 类型 (V1 新增)
 */
export type JSONSchema = object;

/**
 * 插件清单接口 (V1 扩展)
 * 
 * 字段分层：
 * - Layer 0: 已有字段 (保持不变)
 * - Layer 1: 治理必需字段 (所有插件必填)
 * - Layer 2: 画布节点字段 (画布节点必填，非画布可选)
 * - Layer 3: UI 展示增强字段 (全部可选)
 */
export interface PluginManifest {
  // ========== Layer 0: 已有字段 (保持不变) ==========
  plugin_id: string;
  name: string;
  version: string;
  entry: string;
  capabilities: Capability[];
  permissions?: string[];
  risk_level: RiskLevel;
  config_schema?: object;
  enabled?: boolean;
  author?: string;
  description?: string;
  tags?: string[];

  // ========== Layer 1: 治理必需字段 (V1 新增) ==========
  /** 分类，格式: ${domain}/${subdomain}，如 "vision/segment" */
  category: string;
  /** 生命周期状态 */
  status: PluginLifecycleStatus;
  /** 执行模式 */
  execution_mode: ExecutionMode;
  /** 是否需要审批 (HIGH/CRITICAL 自动为 true) */
  requires_approval: boolean;
  /** 是否支持 dry_run */
  dry_run_supported: boolean;

  // ========== Layer 2: 画布节点字段 (V1 新增) ==========
  /** 画布节点类型 (非 planned 状态必填) */
  ui_node_type?: UINodeType;
  /** 允许的上游插件分类列表，空数组=无限制 */
  allowed_upstream?: string[];
  /** 允许的下游插件分类列表，空数组=无限制 */
  allowed_downstream?: string[];
  /** 输入参数 JSON Schema */
  input_schema?: JSONSchema;
  /** 输出结果 JSON Schema */
  output_schema?: JSONSchema;

  // ========== Layer 3: UI 展示增强字段 (V1 新增) ==========
  /** 图标标识 */
  icon?: string;
  /** 主题色 */
  color?: string;
  /** 文档链接 */
  documentation_url?: string;
}

/**
 * 插件清单 V0 (兼容旧插件)
 * @deprecated 请迁移到 PluginManifest
 */
export interface PluginManifestV0 {
  plugin_id: string;
  name: string;
  version: string;
  entry: string;
  capabilities: Capability[];
  permissions?: string[];
  risk_level: RiskLevel;
  config_schema?: object;
  enabled?: boolean;
  author?: string;
  description?: string;
  tags?: string[];
}

/**
 * 插件信息（运行时）(V1 扩展)
 */
export interface PluginInfo {
  plugin_id: string;
  name: string;
  version: string;
  capabilities: Capability[];
  permissions: string[];
  risk_level: RiskLevel;
  enabled: boolean;
  author?: string;
  description?: string;
  tags?: string[];
  registered_at?: string;
  last_executed_at?: string;
  execution_count?: number;

  // ========== V1 新增字段 ==========
  category: string;
  status: PluginLifecycleStatus;
  execution_mode: ExecutionMode;
  requires_approval: boolean;
  dry_run_supported: boolean;
  ui_node_type?: UINodeType;
  allowed_upstream?: string[];
  allowed_downstream?: string[];
  input_schema?: JSONSchema;
  output_schema?: JSONSchema;
  icon?: string;
  color?: string;
  documentation_url?: string;
}

/**
 * 插件注册表记录 (V1 新增)
 * 对应数据库 plugin_registry 表
 */
export interface PluginRegistryRecord {
  id?: number;
  plugin_id: string;
  name: string;
  version: string;

  // Layer 1: 治理字段
  category: string;
  status: PluginLifecycleStatus;
  execution_mode: ExecutionMode;
  requires_approval: boolean;
  dry_run_supported: boolean;

  // Layer 2: 画布字段
  ui_node_type?: UINodeType;
  allowed_upstream?: string[];
  allowed_downstream?: string[];
  input_schema?: JSONSchema;
  output_schema?: JSONSchema;

  // Layer 3: UI 字段
  icon?: string;
  color?: string;
  documentation_url?: string;

  // Layer 0: 基础字段
  entry: string;
  capabilities: Capability[];
  permissions?: string[];
  risk_level: RiskLevel;
  config_schema?: object;
  enabled: boolean;
  author?: string;
  description?: string;
  tags?: string[];

  // 元数据
  manifest_json: string;
  created_at: string;
  updated_at: string;
  created_by?: string;

  // 状态追踪
  status_changed_at?: string;
  status_changed_reason?: string;
}

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

/**
 * 注册结果
 */
export interface RegisterResult {
  success: boolean;
  plugin_id?: string;
  error?: string;
}

/**
 * 启用/禁用结果
 */
export interface EnableDisableResult {
  success: boolean;
  plugin_id?: string;
  error?: string;
}

/**
 * 执行结果
 */
export interface ExecutionResult {
  success: boolean;
  plugin_id?: string;
  action?: string;
  result?: any;
  error?: string;
  executed_at?: string;
  duration_ms?: number;
  /** v6.5.0 Phase0 施工包5: 执行门禁来源 */
  gate_source?: 'system_disabled' | 'not_found' | 'disabled' | 'lifecycle_gate'
    | 'execution_mode_gate' | 'dry_run_gate' | 'trial_gate' | 'approved';
  /** v6.5.0 Phase0 施工包5: 是否被门禁拦截（执行未进行） */
  _gate_blocked?: boolean;
}

/**
 * 插件运行时选项
 */
export interface PluginRuntimeOptions {
  enabled?: boolean;
  pluginDir?: string;
  autoLoadBuiltin?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * 列表选项
 */
export interface ListOptions {
  enabled?: boolean;
  capability?: Capability;
  risk_level?: RiskLevel;
  search?: string;
}

/**
 * 插件状态
 */
export interface PluginStatus {
  plugin_id: string;
  enabled: boolean;
  registered: boolean;
  loaded: boolean;
  error?: string;
}

/**
 * 审计事件类型 (V1 扩展)
 */
export type AuditEventType =
  | 'PLUGIN_REGISTERED'
  | 'PLUGIN_ENABLED'
  | 'PLUGIN_DISABLED'
  | 'PLUGIN_STATUS_CHANGED'  // V1 新增
  | 'PLUGIN_EXECUTED'
  | 'PLUGIN_DRY_RUN'         // V1 新增
  | 'PLUGIN_FAILED'
  | 'PLUGIN_LOADED'
  | 'PLUGIN_UNLOADED'
  | 'PLUGIN_ROLLBACK';       // V1 新增

/**
 * 审计事件数据 (V1 扩展)
 */
export interface AuditEventData {
  plugin_id: string;
  plugin_name?: string;
  action?: string;
  params?: any;
  result?: any;
  error?: string;
  risk_level?: RiskLevel;
  
  // V1 新增
  plugin_status?: PluginLifecycleStatus;
  execution_mode?: ExecutionMode;
  dry_run?: boolean;
  duration_ms?: number;
  approval_id?: string;
}

/**
 * 插件接口（实现者需实现）
 */
export interface IPlugin {
  manifest: PluginManifest;
  execute(action: string, params?: any): Promise<any>;
  getStatus(): PluginStatus;
}

// ========== V1 新增：验证与工具函数类型 ==========

/**
 * Manifest 验证结果
 */
export interface ManifestValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 执行门禁结果 (V1 新增)
 */
export interface ExecutionGateResult {
  allowed: boolean;
  reason?: string;
  requires_approval?: boolean;
  approval_id?: string;
}

/**
 * dry_run 配置 (V1 新增)
 */
export interface DryRunConfig {
  simulate_execution: boolean;
  log_params: boolean;
  log_result_schema: boolean;
  max_simulation_time_ms: number;
}

// ========== V1 新增：审计事件类型 ==========

/**
 * 插件审计事件类型
 */
export type PluginAuditAction =
  | 'discover'      // 插件发现
  | 'register'      // 插件注册
  | 'enable'        // 插件启用
  | 'disable'       // 插件禁用
  | 'load'          // 插件加载
  | 'unload'        // 插件卸载
  | 'execute_attempt'   // 执行尝试
  | 'execute_blocked'   // 执行被拦截
  | 'execute_success'   // 执行成功
  | 'execute_failed'    // 执行失败
  | 'rollback'      // 执行回滚
  | 'status_change'; // 状态变更

/**
 * 插件审计事件分类
 */
export type PluginAuditEventType =
  | 'lifecycle'     // 生命周期事件
  | 'execution'     // 执行事件
  | 'gate'          // 门禁事件
  | 'system';       // 系统事件

/**
 * 插件审计事件状态
 */
export type PluginAuditStatus =
  | 'success'       // 成功
  | 'failed'        // 失败
  | 'blocked'       // 被拦截
  | 'pending'       // 待处理
  | 'rolled_back';  // 已回滚

/**
 * 插件审计日志条目 (对应数据库表)
 */
export interface PluginAuditLogEntry {
  audit_id: string;
  plugin_id: string;
  plugin_name?: string;
  plugin_version?: string;
  action: PluginAuditAction;
  event_type: PluginAuditEventType;
  status: PluginAuditStatus;
  result_code?: string;
  actor?: string;
  request_id?: string;
  trace_id?: string;
  session_id?: string;
  input_summary?: string;
  output_summary?: string;
  error_type?: string;
  error_message?: string;
  error_stack?: string;
  execution_mode?: ExecutionMode;
  dry_run?: boolean;
  plugin_status?: PluginLifecycleStatus;
  risk_level?: RiskLevel;
  duration_ms?: number;
  memory_usage_kb?: number;
  client_ip?: string;
  user_agent?: string;
  metadata_json?: string;
  created_at: string;
}
