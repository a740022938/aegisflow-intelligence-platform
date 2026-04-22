"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = initDatabase;
exports.getDatabase = getDatabase;
exports.getSqlite = getSqlite;
exports.testConnection = testConnection;
exports.closeDatabase = closeDatabase;
const better_sqlite3_1 = require("drizzle-orm/better-sqlite3");
const better_sqlite3_2 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
// 获取数据库文件路径
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
// 数据库文件路径 - 指向 packages/db/agi_factory.db
const dbPath = path_1.default.resolve(__dirname, '../../../packages/db/agi_factory.db');
// 创建SQLite连接
let sqlite = null;
let db = null;
/**
 * 初始化数据库连接
 */
function initDatabase() {
    try {
        console.log(`📊 连接数据库: ${dbPath}`);
        // 打开数据库连接
        sqlite = new better_sqlite3_2.default(dbPath, {
            verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
        });
        // 创建Drizzle实例
        db = (0, better_sqlite3_1.drizzle)(sqlite);
        console.log('✅ 数据库连接成功');
        return db;
    }
    catch (error) {
        console.error('❌ 数据库连接失败:', error);
        throw error;
    }
}
/**
 * 获取数据库实例
 */
function getDatabase() {
    if (!db) {
        throw new Error('数据库未初始化，请先调用 initDatabase()');
    }
    return db;
}
/**
 * 获取原始SQLite连接
 */
function getSqlite() {
    if (!sqlite) {
        throw new Error('SQLite连接未初始化');
    }
    return sqlite;
}
/**
 * 测试数据库连接
 */
async function testConnection() {
    try {
        if (!sqlite) {
            initDatabase();
        }
        // 执行简单查询测试连接
        const tables = sqlite
            .prepare("SELECT name FROM sqlite_master WHERE type='table'")
            .all()
            .map((row) => row.name);
        return {
            ok: true,
            db: 'sqlite',
            connected: true,
            tables,
        };
    }
    catch (error) {
        return {
            ok: false,
            db: 'sqlite',
            connected: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
/**
 * 关闭数据库连接
 */
function closeDatabase() {
    if (sqlite) {
        sqlite.close();
        sqlite = null;
        db = null;
        console.log('🔒 数据库连接已关闭');
    }
}
// 默认导出数据库实例
exports.default = {
    initDatabase,
    getDatabase,
    getSqlite,
    testConnection,
    closeDatabase,
};
