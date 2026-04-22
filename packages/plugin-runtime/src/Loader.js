"use strict";
// Plugin Runtime - 插件加载器
// AGI Model Factory v6.0.0
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginLoader = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const plugin_sdk_1 = require("@agi-factory/plugin-sdk");
/**
 * 插件加载器 - 负责从文件系统加载插件
 */
class PluginLoader {
    pluginDir;
    constructor(pluginDir) {
        this.pluginDir = pluginDir;
    }
    /**
     * 加载指定目录的插件
     */
    async loadPlugin(pluginPath) {
        try {
            const manifestPath = path.join(pluginPath, 'manifest.json');
            // 检查 manifest.json 是否存在
            if (!fs.existsSync(manifestPath)) {
                console.warn(`[PluginLoader] manifest.json not found in ${pluginPath}`);
                return null;
            }
            // 读取 manifest
            const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
            const manifest = JSON.parse(manifestContent);
            // 验证 manifest
            const validation = (0, plugin_sdk_1.validateManifest)(manifest);
            if (!validation.valid) {
                console.warn(`[PluginLoader] Invalid manifest in ${pluginPath}:`, validation.errors);
                return null;
            }
            // 应用风险默认值
            const processedManifest = (0, plugin_sdk_1.applyRiskDefaults)(manifest);
            // 加载入口模块
            const entryPath = path.resolve(pluginPath, manifest.entry);
            let module;
            if (fs.existsSync(entryPath)) {
                // 动态加载模块
                try {
                    // 尝试作为 CommonJS 模块加载
                    module = require(entryPath);
                    // 如果是 default export，取 default
                    if (module && module.default) {
                        module = module.default;
                    }
                }
                catch (loadError) {
                    console.warn(`[PluginLoader] Failed to load entry ${entryPath}:`, loadError);
                    module = null;
                }
            }
            else {
                console.warn(`[PluginLoader] Entry file not found: ${entryPath}`);
                module = null;
            }
            return {
                manifest: processedManifest,
                module,
                rootDir: pluginPath,
            };
        }
        catch (error) {
            console.error(`[PluginLoader] Error loading plugin from ${pluginPath}:`, error);
            return null;
        }
    }
    /**
     * 加载内置插件目录下的所有插件
     */
    async loadBuiltinPlugins() {
        const plugins = [];
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
    getPluginDir() {
        return this.pluginDir;
    }
    /**
     * 设置插件目录
     */
    setPluginDir(dir) {
        this.pluginDir = dir;
    }
}
exports.PluginLoader = PluginLoader;
