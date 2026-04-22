// Plugin SDK - 工具函数
// AGI Model Factory v6.0.0

import { PluginManifest, Capability, RiskLevel } from './types.js';

/**
 * 生成插件 ID
 */
export function generatePluginId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * 解析插件包名
 */
export function parsePluginPackage(name: string): { scope?: string; name: string; version?: string } {
  const match = name.match(/^(@[^/]+)\/([^@]+)(?:@(.+))?$/);
  if (match) {
    return { scope: match[1], name: match[2], version: match[3] };
  }
  const simpleMatch = name.match(/^([^@]+)(?:@(.+))?$/);
  return { name: simpleMatch?.[1] || name, version: simpleMatch?.[2] };
}

/**
 * 比较版本号
 */
export function compareVersion(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);
  
  for (let i = 0; i < 3; i++) {
    const partA = partsA[i] || 0;
    const partB = partsB[i] || 0;
    if (partA > partB) return 1;
    if (partA < partB) return -1;
  }
  return 0;
}

/**
 * 检查插件是否支持指定能力
 */
export function hasCapability(manifest: PluginManifest, capability: Capability): boolean {
  return manifest.capabilities.includes(capability);
}

/**
 * 检查插件是否低于指定风险级别
 */
export function isBelowRiskThreshold(manifest: PluginManifest, threshold: RiskLevel): boolean {
  const weights: Record<RiskLevel, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  return weights[manifest.risk_level] <= weights[threshold];
}

/**
 * 获取插件摘要
 */
export function getPluginSummary(manifest: PluginManifest): string {
  return `[${manifest.plugin_id}] ${manifest.name} v${manifest.version} (${manifest.risk_level})`;
}

/**
 * 安全加载 JSON 文件
 */
export async function safeLoadJson<T>(filePath: string): Promise<T | null> {
  try {
    const fs = await import('fs');
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    return null;
  }
}

/**
 * 延迟执行
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 创建唯一 ID
 */
export function createUniqueId(prefix?: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
}

/**
 * 合并配置（深度合并）
 */
export function mergeConfig<T extends object>(base: T, override: Partial<T>): T {
  const result = { ...base };
  for (const key in override) {
    const baseValue = base[key];
    const overrideValue = override[key];
    if (
      typeof baseValue === 'object' &&
      typeof overrideValue === 'object' &&
      baseValue !== null &&
      overrideValue !== null &&
      !Array.isArray(baseValue) &&
      !Array.isArray(overrideValue)
    ) {
      result[key] = mergeConfig(baseValue as any, overrideValue as any);
    } else {
      result[key] = overrideValue as any;
    }
  }
  return result;
}

/**
 * 格式化持续时间
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

/**
 * 创建日志前缀
 */
export function createLogPrefix(pluginId: string): string {
  const now = new Date().toISOString().substring(11, 23);
  return `[${now}] [Plugin:${pluginId}]`;
}
