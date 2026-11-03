import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import type { DatabaseSchema } from './database-schema.js';

/**
 * Keeps PostgreSQL `numeric` as string (the driver default), stated explicitly so nobody switches
 * it to parseFloat: money must never pass through a JS number.
 */
pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value) => value);

export interface DatabaseConfig {
  readonly connectionString: string;
  readonly maxConnections: number;
}

export function createDatabase(config: DatabaseConfig): Kysely<DatabaseSchema> {
  return new Kysely<DatabaseSchema>({
    dialect: new PostgresDialect({
      pool: new pg.Pool({ connectionString: config.connectionString, max: config.maxConnections }),
    }),
  });
}
