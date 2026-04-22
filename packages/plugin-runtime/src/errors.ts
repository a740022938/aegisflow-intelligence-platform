// Plugin Runtime - 错误定义
// AGI Model Factory v6.0.0

export class PluginError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'PluginError';
  }
}

export class PluginNotFoundError extends PluginError {
  constructor(pluginId: string) {
    super(`Plugin not found: ${pluginId}`, 'PLUGIN_NOT_FOUND');
    this.name = 'PluginNotFoundError';
  }
}

export class PluginAlreadyExistsError extends PluginError {
  constructor(pluginId: string) {
    super(`Plugin already exists: ${pluginId}`, 'PLUGIN_ALREADY_EXISTS');
    this.name = 'PluginAlreadyExistsError';
  }
}

export class PluginValidationError extends PluginError {
  constructor(message: string) {
    super(message, 'PLUGIN_VALIDATION_ERROR');
    this.name = 'PluginValidationError';
  }
}

export class PluginDisabledError extends PluginError {
  constructor(pluginId: string) {
    super(`Plugin is disabled: ${pluginId}`, 'PLUGIN_DISABLED');
    this.name = 'PluginDisabledError';
  }
}

export class PluginExecutionError extends PluginError {
  constructor(pluginId: string, action: string, error: string) {
    super(`Plugin execution failed: ${pluginId}/${action} - ${error}`, 'PLUGIN_EXECUTION_ERROR');
    this.name = 'PluginExecutionError';
  }
}

export class PluginSystemDisabledError extends PluginError {
  constructor() {
    super('Plugin system is disabled', 'PLUGIN_SYSTEM_DISABLED');
    this.name = 'PluginSystemDisabledError';
  }
}

export class PluginRiskLevelError extends PluginError {
  constructor(pluginId: string, riskLevel: string) {
    super(`Plugin ${pluginId} has high risk level: ${riskLevel}`, 'PLUGIN_RISK_LEVEL_ERROR');
    this.name = 'PluginRiskLevelError';
  }
}
