import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

type ParsedTable = {
  tableName: string;
  columnDefinitions: string[];
};

type ColumnAction = {
  table: string;
  column: string;
  status: 'applied' | 'exists' | 'table_missing' | 'unsupported' | 'failed';
  error?: string;
};

export type SchemaReconcileReport = {
  total_tables: number;
  total_columns: number;
  applied: number;
  exists: number;
  table_missing: number;
  unsupported: number;
  failed: number;
  actions: ColumnAction[];
};

function quoteIdentifier(name: string) {
  return `"${name.replace(/"/g, '""')}"`;
}

function normalizeIdentifier(raw: string) {
  let name = raw.trim();
  if (
    (name.startsWith('"') && name.endsWith('"')) ||
    (name.startsWith("'") && name.endsWith("'")) ||
    (name.startsWith('`') && name.endsWith('`')) ||
    (name.startsWith('[') && name.endsWith(']'))
  ) {
    name = name.slice(1, -1);
  }
  return name;
}

function splitTopLevelByComma(input: string) {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (ch === '(') depth += 1;
    else if (ch === ')') depth = Math.max(0, depth - 1);
    else if (ch === ',' && depth === 0) {
      parts.push(input.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(input.slice(start));
  return parts.map(part => part.trim()).filter(Boolean);
}

function stripSqlComments(input: string) {
  return input
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/--.*$/gm, ' ');
}

function parseCreateTableStatements(sql: string): ParsedTable[] {
  const results: ParsedTable[] = [];
  const marker = /CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+/gi;
  let match: RegExpExecArray | null;

  while ((match = marker.exec(sql)) !== null) {
    let i = marker.lastIndex;
    while (i < sql.length && /\s/.test(sql[i])) i += 1;

    const tableStart = i;
    while (i < sql.length && !/\s|\(/.test(sql[i])) i += 1;
    const tableRaw = sql.slice(tableStart, i);
    const tableName = normalizeIdentifier(tableRaw);

    while (i < sql.length && sql[i] !== '(') i += 1;
    if (i >= sql.length || sql[i] !== '(') continue;

    const bodyStart = i + 1;
    let depth = 1;
    i += 1;
    while (i < sql.length && depth > 0) {
      if (sql[i] === '(') depth += 1;
      else if (sql[i] === ')') depth -= 1;
      i += 1;
    }
    if (depth !== 0) continue;

    const body = stripSqlComments(sql.slice(bodyStart, i - 1));
    const columnDefinitions = splitTopLevelByComma(body).filter(part => {
      const upper = part.trim().toUpperCase();
      return !(
        upper.startsWith('PRIMARY KEY') ||
        upper.startsWith('FOREIGN KEY') ||
        upper.startsWith('UNIQUE') ||
        upper.startsWith('CONSTRAINT') ||
        upper.startsWith('CHECK')
      );
    });

    results.push({
      tableName,
      columnDefinitions,
    });
  }

  return results;
}

function tableExists(db: DatabaseSync, tableName: string) {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ? LIMIT 1")
    .get(tableName) as Record<string, unknown> | undefined;
  return !!row?.name;
}

function existingColumns(db: DatabaseSync, tableName: string) {
  const rows = db
    .prepare(`PRAGMA table_info(${quoteIdentifier(tableName)})`)
    .all() as Array<{ name?: string }>;
  return new Set(rows.map(row => String(row.name || '')));
}

function columnNameFromDefinition(definition: string) {
  const firstToken = definition.trim().split(/\s+/)[0] || '';
  return normalizeIdentifier(firstToken);
}

function columnDefinitionIsUnsupported(definition: string) {
  const upper = definition.toUpperCase();
  return upper.includes(' PRIMARY KEY') || upper.includes(' UNIQUE');
}

function listMigrationSqlFiles(migrationDir: string) {
  if (!fs.existsSync(migrationDir)) return [];
  return fs
    .readdirSync(migrationDir, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith('.sql'))
    .map(entry => path.join(migrationDir, entry.name))
    .sort((a, b) => a.localeCompare(b));
}

function expectedTablesFromMigrations(migrationDir: string) {
  const files = listMigrationSqlFiles(migrationDir);
  const map = new Map<string, string[]>();

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const parsed = parseCreateTableStatements(content);
    for (const item of parsed) {
      map.set(item.tableName, item.columnDefinitions);
    }
  }

  return map;
}

export function reconcileSchemaColumns(
  db: DatabaseSync,
  migrationDir: string,
): SchemaReconcileReport {
  const expected = expectedTablesFromMigrations(migrationDir);
  const actions: ColumnAction[] = [];
  let totalColumns = 0;

  for (const [tableName, definitions] of expected.entries()) {
    totalColumns += definitions.length;
    if (!tableExists(db, tableName)) {
      for (const definition of definitions) {
        actions.push({
          table: tableName,
          column: columnNameFromDefinition(definition),
          status: 'table_missing',
        });
      }
      continue;
    }

    const existing = existingColumns(db, tableName);
    for (const definition of definitions) {
      const columnName = columnNameFromDefinition(definition);
      if (!columnName) continue;

      if (existing.has(columnName)) {
        actions.push({
          table: tableName,
          column: columnName,
          status: 'exists',
        });
        continue;
      }

      if (columnDefinitionIsUnsupported(definition)) {
        actions.push({
          table: tableName,
          column: columnName,
          status: 'unsupported',
        });
        continue;
      }

      try {
        db.exec(
          `ALTER TABLE ${quoteIdentifier(tableName)} ADD COLUMN ${definition}`,
        );
        actions.push({
          table: tableName,
          column: columnName,
          status: 'applied',
        });
      } catch (error) {
        actions.push({
          table: tableName,
          column: columnName,
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  return {
    total_tables: expected.size,
    total_columns: totalColumns,
    applied: actions.filter(a => a.status === 'applied').length,
    exists: actions.filter(a => a.status === 'exists').length,
    table_missing: actions.filter(a => a.status === 'table_missing').length,
    unsupported: actions.filter(a => a.status === 'unsupported').length,
    failed: actions.filter(a => a.status === 'failed').length,
    actions,
  };
}
