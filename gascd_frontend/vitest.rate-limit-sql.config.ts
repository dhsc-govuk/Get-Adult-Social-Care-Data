import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['__tests__/rate-limit/*.integration.ts'],
    environment: 'node',
    testTimeout: 30000,
    hookTimeout: 30000,
    fileParallelism: false,
  },
});
