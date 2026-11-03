import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { sql, type Kysely } from 'kysely';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createDatabase } from '../../src/platform/database/create-database.js';
import type { DatabaseSchema } from '../../src/platform/database/database-schema.js';
import { startPostgres } from './postgres-container.js';

describe('database (real PostgreSQL)', () => {
  let container: StartedPostgreSqlContainer | undefined;
  let db: Kysely<DatabaseSchema> | undefined;

  beforeAll(async () => {
    container = await startPostgres();
    db = createDatabase({ connectionString: container.getConnectionUri(), maxConnections: 2 });
  });

  afterAll(async () => {
    await db?.destroy();
    await container?.stop();
  });

  function database(): Kysely<DatabaseSchema> {
    if (db === undefined) throw new Error('Database not started');
    return db;
  }

  it('reads numeric values as exact strings, never as JS numbers', async () => {
    const result = await sql<{
      amount: unknown;
    }>`select 0.1::numeric + 0.2::numeric as amount`.execute(database());
    expect(result.rows[0]?.amount).toBe('0.3');
  });

  it.todo('isolates data between companies (row-level filtering by company grant)');
  it.todo('enforces the permissions of the four roles');
});
