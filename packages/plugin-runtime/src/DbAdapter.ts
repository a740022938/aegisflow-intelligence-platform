// Plugin Runtime - 数据库适配器
// Phase 0.5: 审计接线补完
// AGI Model Factory v6.5.0

import { DatabaseSync } from 'node:sqlite';

/**
 * 数据库连接接口（与 DbAuditLogger 匹配）
 */
export interface DatabaseConnection {
  run(sql: string, params?: any[]): Promise<{ lastID?: number; changes?: number }>;
  get(sql: string, params?: any[]): Promise<any>;
  all(sql: string, params?: any[]): Promise<any[]>;
}

/**
 * 将 Node.js DatabaseSync 适配为 DatabaseConnection 接口
 * 
 * DatabaseSync 是同步 API，这里包装为异步以匹配 DbAuditLogger 期望的接口
 */
export class DatabaseSyncAdapter implements DatabaseConnection {
  private db: DatabaseSync;

  constructor(db: DatabaseSync) {
    this.db = db;
  }

  async run(sql: string, params?: any[]): Promise<{ lastID?: number; changes?: number }> {
    try {
      const stmt = this.db.prepare(sql);
      const result = params ? stmt.run(...params) : stmt.run();
      return {
        lastID: (result as any).lastInsertRowid,
        changes: (result as any).changes,
      };
    } catch (e) {
      console.error('[DbAdapter] run error:', e);
      throw e;
    }
  }

  async get(sql: string, params?: any[]): Promise<any> {
    try {
      const stmt = this.db.prepare(sql);
      return params ? stmt.get(...params) : stmt.get();
    } catch (e) {
      console.error('[DbAdapter] get error:', e);
      throw e;
    }
  }

  async all(sql: string, params?: any[]): Promise<any[]> {
    try {
      const stmt = this.db.prepare(sql);
      return params ? stmt.all(...params) : stmt.all();
    } catch (e) {
      console.error('[DbAdapter] all error:', e);
      throw e;
    }
  }
}

/**
 * 从应用获取数据库适配器
 * 
 * 这个函数会被 PluginManager 调用来获取 DB 连接
 */
let dbAdapter: DatabaseSyncAdapter | null = null;

export function getDbAdapter(): DatabaseSyncAdapter | null {
  return dbAdapter;
}

export function setDbAdapter(db: DatabaseSync): void {
  dbAdapter = new DatabaseSyncAdapter(db);
}
