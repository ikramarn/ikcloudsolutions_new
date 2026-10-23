import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const root = path.dirname(fileURLToPath(import.meta.url));

const shared = {
  resolve: {
    alias: {
      '@': path.resolve(root, 'src'),
      // The real package throws unless the react-server condition is active; next build still uses it.
      'server-only': path.resolve(root, 'tests/stubs/server-only.ts'),
    },
  },
  test: {
    globals: true,
    env: { NEXT_PUBLIC_SITE_URL: 'https://example.test' },
  },
};

export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        extends: true,
        resolve: shared.resolve,
        test: {
          ...shared.test,
          name: 'unit',
          environment: 'node',
          include: ['tests/unit/**/*.test.ts'],
        },
      },
      {
        extends: true,
        resolve: shared.resolve,
        test: {
          ...shared.test,
          name: 'components',
          environment: 'jsdom',
          include: ['tests/components/**/*.test.tsx'],
          setupFiles: ['tests/setup.ts'],
        },
      },
    ],
  },
});
