# Migrations Core

This directory is the single source of truth for SQLite schema migrations in Community Edition.

## Naming

- File pattern: `YYYYMMDD_HHMMSS_description.sql` (UTC)
- Use lowercase snake case in `description`.

## Order

- Files are executed in lexical order.
- Keep migrations idempotent (`IF NOT EXISTS`, safe `ALTER` patterns).

## Integrity

- On apply, each migration file is recorded in `schema_migrations`.
- Runner stores SHA-256 checksum.
- If a file with the same name changes later, startup/init will fail with checksum mismatch.

## Commands

- Initialize / apply migrations: `pnpm run db:init`
- Create new migration file: `pnpm run db:migrate:new -- your_change_name`
- Strict health check: `pnpm run db:doctor:strict`

## Notes

- `archive/` keeps old baseline snapshots for traceability.
- Do not edit applied migration files. Add a new migration instead.

