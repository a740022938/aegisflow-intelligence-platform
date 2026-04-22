"use strict";
// Plugin Runtime - 错误定义
// AGI Model Factory v6.0.0
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginRiskLevelError = exports.PluginSystemDisabledError = exports.PluginExecutionError = exports.PluginDisabledError = exports.PluginValidationError = exports.PluginAlreadyExistsError = exports.PluginNotFoundError = exports.PluginError = void 0;
class PluginError extends Error {
    code;
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'PluginError';
    }
}
exports.PluginError = PluginError;
class PluginNotFoundError extends PluginError {
    constructor(pluginId) {
        super(`Plugin not found: ${pluginId}`, 'PLUGIN_NOT_FOUND');
        this.name = 'PluginNotFoundError';
    }
}
exports.PluginNotFoundError = PluginNotFoundError;
class PluginAlreadyExistsError extends PluginError {
    constructor(pluginId) {
        super(`Plugin already exists: ${pluginId}`, 'PLUGIN_ALREADY_EXISTS');
        this.name = 'PluginAlreadyExistsError';
    }
}
exports.PluginAlreadyExistsError = PluginAlreadyExistsError;
class PluginValidationError extends PluginError {
    constructor(message) {
        super(message, 'PLUGIN_VALIDATION_ERROR');
        this.name = 'PluginValidationError';
    }
}
exports.PluginValidationError = PluginValidationError;
class PluginDisabledError extends PluginError {
    constructor(pluginId) {
        super(`Plugin is disabled: ${pluginId}`, 'PLUGIN_DISABLED');
        this.name = 'PluginDisabledError';
    }
}
exports.PluginDisabledError = PluginDisabledError;
class PluginExecutionError extends PluginError {
    constructor(pluginId, action, error) {
        super(`Plugin execution failed: ${pluginId}/${action} - ${error}`, 'PLUGIN_EXECUTION_ERROR');
        this.name = 'PluginExecutionError';
    }
}
exports.PluginExecutionError = PluginExecutionError;
class PluginSystemDisabledError extends PluginError {
    constructor() {
        super('Plugin system is disabled', 'PLUGIN_SYSTEM_DISABLED');
        this.name = 'PluginSystemDisabledError';
    }
}
exports.PluginSystemDisabledError = PluginSystemDisabledError;
class PluginRiskLevelError extends PluginError {
    constructor(pluginId, riskLevel) {
        super(`Plugin ${pluginId} has high risk level: ${riskLevel}`, 'PLUGIN_RISK_LEVEL_ERROR');
        this.name = 'PluginRiskLevelError';
    }
}
exports.PluginRiskLevelError = PluginRiskLevelError;
