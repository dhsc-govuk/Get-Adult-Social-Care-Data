import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    include: ['**/?(*.)+(test).[jt]s?(x)'],
    environment: 'jsdom',
    globals: true,
    setupFiles: 'vitest.setup.ts',
    css: true,
    snapshotSerializers: [],
    testTimeout: 10000,
    coverage: {
      reporter: ['html', 'text-summary'],
      include: ['app/**/*.{js,ts,tsx}', 'src/**/*.{js,ts,tsx}'],
      exclude: [
        '*.d.ts',
        '.next/**/*',
        'mock/**/*',
        'instrumentation.*',
        '*.config.ts',
        '**/*.types.ts',
        '/app/\\(protected\\)/help/',
        '/src/data/types/govuk-frontend.d.ts',
        '/src/data/types/govuk-frontend.d.ts',
        '/src/utils/axe.ts',
      ],
    },
  },
});
