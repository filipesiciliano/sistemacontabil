import { defineConfig } from 'vitest/config';

/** Integration tests run against a real PostgreSQL started by Testcontainers (requires Docker). */
export default defineConfig({
  test: {
    include: ['test/integration/**/*.int.test.ts'],
    testTimeout: 120_000,
    hookTimeout: 180_000,
    fileParallelism: false,
  },
});
