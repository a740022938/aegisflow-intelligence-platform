import { FastifyInstance } from 'fastify';
import {
  getDatabase,
  getDbDiagnostics,
  getLastDbGovernanceReport,
  getSqlMigrationState,
} from '../db/builtin-sqlite.js';
import { listCoreIndexSpecs, runDbMaintenance } from '../db/governance.js';

type MaintenanceMode = 'checkpoint' | 'optimize' | 'full';

function normalizeMaintenanceMode(value: unknown): MaintenanceMode {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === 'checkpoint') return 'checkpoint';
  if (raw === 'optimize') return 'optimize';
  return 'full';
}

export async function registerSystemRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/system/database/diagnostics', async () => {
    const diagnostics = getDbDiagnostics();
    const lastGovernance = getLastDbGovernanceReport();

    return {
      ok: true,
      diagnostics,
      governance: lastGovernance,
    };
  });

  app.get('/api/system/database/schema-drift', async () => {
    const diagnostics = getDbDiagnostics();
    return {
      ok: true,
      expected_indexes: listCoreIndexSpecs(),
      missing_indexes: diagnostics.missing_indexes,
      missing_count: diagnostics.missing_indexes.length,
    };
  });

  app.get('/api/system/database/migrations', async () => {
    const state = getSqlMigrationState();
    return {
      ok: true,
      migrations: state,
    };
  });

  app.post('/api/system/database/maintenance', async (request: any, reply: any) => {
    try {
      const mode = normalizeMaintenanceMode(request?.body?.mode);
      const db = getDatabase();
      const result = runDbMaintenance(db, mode);
      const diagnostics = getDbDiagnostics();
      return {
        ok: true,
        result,
        diagnostics,
      };
    } catch (error) {
      return reply.code(500).send({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });
}
