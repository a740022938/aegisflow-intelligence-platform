import Database from 'better-sqlite3';
import path from 'path';

// 数据库文件路径 - 指向 packages/db/agi_factory.db
const dbPath = path.resolve(process.cwd(), '../../packages/db/agi_factory.db');

// 延迟导入better-sqlite3，避免启动时立即加载
let sqlite: typeof Database | null = null;
let dbInstance: Database.Database | null = null;

/**
 * 获取数据库实例（延迟加载）
 */
export function getDatabase(): Database.Database {
  if (!dbInstance) {
    // 动态导入，避免启动时立即加载原生模块
    const betterSqlite3 = require('better-sqlite3');
    sqlite = betterSqlite3;
    
    console.log(`📊 连接数据库: ${dbPath}`);
    dbInstance = new betterSqlite3(dbPath, {
      verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
    });
    
    // 启用WAL模式提高性能
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
    
    console.log('✅ 数据库连接成功');
  }
  return dbInstance;
}

/**
 * 测试数据库连接
 */
export function testConnection(): {
  ok: boolean;
  db: string;
  connected: boolean;
  tables?: string[];
  error?: string;
} {
  try {
    const db = getDatabase();
    
    // 执行简单查询测试连接
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map((row: any) => row.name);
    
    return {
      ok: true,
      db: 'sqlite',
      connected: true,
      tables,
    };
  } catch (error) {
    return {
      ok: false,
      db: 'sqlite',
      connected: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 执行SQL查询
 */
export function query(sql: string, params: any[] = []): any[] {
  const db = getDatabase();
  const stmt = db.prepare(sql);
  return params.length > 0 ? stmt.all(...params) : stmt.all();
}

/**
 * 执行SQL语句（INSERT/UPDATE/DELETE）
 */
export function run(sql: string, params: any[] = []): { changes: number; lastInsertRowid: number } {
  const db = getDatabase();
  const stmt = db.prepare(sql);
  const result = params.length > 0 ? stmt.run(...params) : stmt.run();
  return {
    changes: result.changes,
    lastInsertRowid: Number(result.lastInsertRowid),
  };
}

/**
 * 关闭数据库连接
 */
export function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    sqlite = null;
    console.log('🔒 数据库连接已关闭');
  }
}

// 默认导出
export default {
  getDatabase,
  testConnection,
  query,
  run,
  closeDatabase,
};
