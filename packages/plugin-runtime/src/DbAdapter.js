"use strict";
// Plugin Runtime - 数据库适配器
// Phase 0.5: 审计接线补完
// AGI Model Factory v6.5.0
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseSyncAdapter = void 0;
exports.getDbAdapter = getDbAdapter;
exports.setDbAdapter = setDbAdapter;
/**
 * 将 Node.js DatabaseSync 适配为 DatabaseConnection 接口
 *
 * DatabaseSync 是同步 API，这里包装为异步以匹配 DbAuditLogger 期望的接口
 */
class DatabaseSyncAdapter {
    db;
    constructor(db) {
        this.db = db;
    }
    async run(sql, params) {
        try {
            const stmt = this.db.prepare(sql);
            const result = params ? stmt.run(...params) : stmt.run();
            return {
                lastID: result.lastInsertRowid,
                changes: result.changes,
            };
        }
        catch (e) {
            console.error('[DbAdapter] run error:', e);
            throw e;
        }
    }
    async get(sql, params) {
        try {
            const stmt = this.db.prepare(sql);
            return params ? stmt.get(...params) : stmt.get();
        }
        catch (e) {
            console.error('[DbAdapter] get error:', e);
            throw e;
        }
    }
    async all(sql, params) {
        try {
            const stmt = this.db.prepare(sql);
            return params ? stmt.all(...params) : stmt.all();
        }
        catch (e) {
            console.error('[DbAdapter] all error:', e);
            throw e;
        }
    }
}
exports.DatabaseSyncAdapter = DatabaseSyncAdapter;
/**
 * 从应用获取数据库适配器
 *
 * 这个函数会被 PluginManager 调用来获取 DB 连接
 */
let dbAdapter = null;
function getDbAdapter() {
    return dbAdapter;
}
function setDbAdapter(db) {
    dbAdapter = new DatabaseSyncAdapter(db);
}
