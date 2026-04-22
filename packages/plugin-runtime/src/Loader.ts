// Plugin Runtime - 插件加载器
// AGI Model Factory v6.0.0

import * as fs from 'fs';
import * as path from 'path';
import { PluginManifest, ValidationResult, validateManifest, applyRiskDefaults } from '@agi-factory/plugin-sdk';

export interface LoadedPlugin {
  manifest: PluginManifest;
  module: any;
  rootDir: string;
}

/**
 * 插件加载器 - 负责从文件系统加载插件
 */
export class PluginLoader {
  private pluginDir: string;

  constructor(pluginDir: string) {
    this.pluginDir = pluginDir;
  }

  /**
   * 加载指定目录的插件
   */
  async loadPlugin(pluginPath: string): Promise<LoadedPlugin | null> {
    try {
      const manifestPath = path.join(pluginPath, 'manifest.json');
      
      // 检查 manifest.json 是否存在
      if (!fs.existsSync(manifestPath)) {
        console.warn(`[PluginLoader] manifest.json not found in ${pluginPath}`);
        return null;
      }

      // 读取 manifest
      const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
      const manifest: PluginManifest = JSON.parse(manifestContent);

      // 验证 manifest
      const validation = validateManifest(manifest);
      if (!validation.valid) {
        console.warn(`[PluginLoader] Invalid manifest in ${pluginPath}:`, validation.errors);
        return null;
      }

      // 应用风险默认值
      const processedManifest = applyRiskDefaults(manifest);

      // 加载入口模块
      const entryPath = path.resolve(pluginPath, manifest.entry);
      let module: any;

      if (fs.existsSync(entryPath)) {
        // 动态加载模块
        try {
          // 尝试作为 CommonJS 模块加载
          module = require(entryPath);
          // 如果是 default export，取 default
          if (module && module.default) {
            module = module.default;
          }
        } catch (loadError) {
          console.warn(`[PluginLoader] Failed to load entry ${entryPath}:`, loadError);
          module = null;
        }
      } else {
        console.warn(`[PluginLoader] Entry file not found: ${entryPath}`);
        module = null;
      }

      return {
        manifest: processedManifest,
        module,
        rootDir: pluginPath,
      };
    } catch (error) {
      console.error(`[PluginLoader] Error loading plugin from ${pluginPath}:`, error);
      return null;
    }
  }

  /**
   * 加载内置插件目录下的所有插件
   */
  async loadBuiltinPlugins(): Promise<LoadedPlugin[]> {
    const plugins: LoadedPlugin[] = [];

    // 检查目录是否存在
    if (!fs.existsSync(this.pluginDir)) {
      console.log(`[PluginLoader] Plugin directory does not exist: ${this.pluginDir}`);
      return plugins;
    }

    // 读取目录
    const entries = fs.readdirSync(this.pluginDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const pluginPath = path.join(this.pluginDir, entry.name);
        const loaded = await this.loadPlugin(pluginPath);
        if (loaded) {
          plugins.push(loaded);
        }
      }
    }

    return plugins;
  }

  /**
   * 获取插件目录
   */
  getPluginDir(): string {
    return this.pluginDir;
  }

  /**
   * 设置插件目录
   */
  setPluginDir(dir: string): void {
    this.pluginDir = dir;
  }
}
