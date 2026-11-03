/**
 * Kysely table typings. Tables are added by each module's migrations.
 * Money and rates are stored as `numeric` and read as strings, then converted to Decimal at the
 * repository boundary; they are never read as JS numbers.
 */
export type DatabaseSchema = Record<string, never>;
