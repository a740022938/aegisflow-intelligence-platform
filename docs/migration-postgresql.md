# PostgreSQL 迁移方案

## 动机

当前使用 SQLite (node:sqlite)，有以下限制：
- 单写者模型，多 Python Worker 并发写时串行阻塞
- 无连接池，每次查询创建新 statement
- 无行级锁，批量写入冲突时回滚整个事务
- 不支持网络访问，无法用于分布式部署

## 迁移步骤

### 1. 安装依赖

```bash
pnpm add @neondatabase/serverless  # or pg + drizzle-orm/pg-core
pnpm add -D @types/pg
```

### 2. 创建 PostgreSQL 连接模块

新建 `packages/db/pg-client.ts`:

```typescript
import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = pool;
```

### 3. 数据库初始化

```bash
# 导出 SQLite 数据
node scripts/migrate-to-pg.js --export

# 在 PostgreSQL 中创建表
psql $DATABASE_URL < packages/db/schema-pg.sql

# 导入数据
node scripts/migrate-to-pg.js --import
```

### 4. 迁移 Drizzle ORM 配置

将 `drizzle-orm/sqlite` 替换为 `drizzle-orm/pg-core`:

```typescript
// 之前: import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
// 之后: import { pgTable, text, integer } from 'drizzle-orm/pg-core';
```

### 5. 环境变量

```env
DATABASE_URL=postgresql://user:password@localhost:5432/agi_factory
```

### 6. 连接池配置

```env
PG_POOL_MIN=2
PG_POOL_MAX=10
PG_IDLE_TIMEOUT=30000
```

## 回滚方案

保留 `packages/db/agi_factory.db` 作为 fallback。
切换环境变量 `DATABASE_URL` 为空即可回退到 SQLite。
