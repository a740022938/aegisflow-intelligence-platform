import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';

// 数据库文件路径 - 指向 packages/db/agi_factory.db
const dbPath = path.resolve(process.cwd(), '../../packages/db/agi_factory.db');

// 创建SQLite连接
let sqlite: Database.Database | null = null;
let db: ReturnType<typeof drizzle> | null = null;

/**
 * 初始化数据库连接
 */
export function initDatabase() {
  try {
    console.log(`📊 连接数据库: ${dbPath}`);
    
    // 打开数据库连接
    sqlite = new Database(dbPath, {
      verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
    });
    
    // 创建Drizzle实例
    db = drizzle(sqlite);
    
    console.log('✅ 数据库连接成功');
    return db;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    throw error;
  }
}

/**
 * 获取数据库实例
 */
export function getDatabase() {
  if (!db) {
    throw new Error('数据库未初始化，请先调用 initDatabase()');
  }
  return db;
}

/**
 * 获取原始SQLite连接
 */
export function getSqlite() {
  if (!sqlite) {
    throw new Error('SQLite连接未初始化');
  }
  return sqlite;
}

/**
 * 测试数据库连接
 */
export async function testConnection(): Promise<{
  ok: boolean;
  db: string;
  connected: boolean;
  tables?: string[];
  error?: string;
}> {
  try {
    if (!sqlite) {
      initDatabase();
    }
    
    // 执行简单查询测试连接
    const tables = sqlite!
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
 * 关闭数据库连接
 */
export function closeDatabase() {
  if (sqlite) {
    sqlite.close();
    sqlite = null;
    db = null;
    console.log('🔒 数据库连接已关闭');
  }
}

// 默认导出数据库实例
export default {
  initDatabase,
  getDatabase,
  getSqlite,
  testConnection,
  closeDatabase,
};
