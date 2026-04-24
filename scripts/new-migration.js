#!/usr/bin/env node
/**
 * Create a new SQL migration file in migrations-core.
 *
 * Usage:
 *   node scripts/new-migration.js add_user_profile_table
 *   pnpm run db:migrate:new -- add_user_profile_table
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const migrationsDir = process.env.AIP_DB_MIGRATIONS_DIR
  ? path.resolve(process.env.AIP_DB_MIGRATIONS_DIR)
  : path.join(root, 'packages', 'db', 'migrations-core');

function toUtcStamp(date = new Date()) {
  const y = String(date.getUTCFullYear());
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mm = String(date.getUTCMinutes()).padStart(2, '0');
  const ss = String(date.getUTCSeconds()).padStart(2, '0');
  return `${y}${m}${d}_${hh}${mm}${ss}`;
}

function normalizeName(raw) {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80);
}

function main() {
  const argName = process.argv.slice(2).join(' ').trim();
  const normalized = normalizeName(argName);
  if (!normalized) {
    console.error('❌ 需要迁移名，例如: pnpm run db:migrate:new -- add_user_profile_table');
    process.exit(1);
  }

  fs.mkdirSync(migrationsDir, { recursive: true });
  const id = `${toUtcStamp()}_${normalized}.sql`;
  const filePath = path.join(migrationsDir, id);
  if (fs.existsSync(filePath)) {
    console.error(`❌ 迁移文件已存在: ${filePath}`);
    process.exit(1);
  }

  const template = [
    `-- Migration: ${normalized}`,
    `-- Created at (UTC): ${new Date().toISOString()}`,
    '',
    '-- Write idempotent SQL below.',
    '-- Example:',
    '-- CREATE TABLE IF NOT EXISTS your_table (...);',
    '',
  ].join('\n');

  fs.writeFileSync(filePath, template, 'utf8');
  console.log(`✅ created migration: ${filePath}`);
}

main();

