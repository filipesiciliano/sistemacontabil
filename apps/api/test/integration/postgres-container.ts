import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';

/**
 * PostgreSQL major version must match Aurora's ([PENDING DECISION] in docs/02).
 * Override with POSTGRES_TEST_IMAGE when Docker Hub is unreachable (e.g. a registry mirror).
 */
export const POSTGRES_IMAGE = process.env['POSTGRES_TEST_IMAGE'] ?? 'postgres:16-alpine';

export function startPostgres(): Promise<StartedPostgreSqlContainer> {
  return new PostgreSqlContainer(POSTGRES_IMAGE).start();
}
