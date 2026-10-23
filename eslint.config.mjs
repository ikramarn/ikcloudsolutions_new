import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier/flat';

const config = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettierConfig,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { args: 'after-used', argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/_unverified-content*'],
              message:
                'src/data/_unverified-content.ts holds removed claims and must never be imported.',
            },
          ],
        },
      ],
    },
  },
  {
    // E2E specs must use the per-execution clientIp fixture from ./helpers.
    files: ['tests/e2e/**/*.{ts,tsx}'],
    ignores: ['tests/e2e/helpers.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/_unverified-content*'],
              message:
                'src/data/_unverified-content.ts holds removed claims and must never be imported.',
            },
          ],
          paths: [
            {
              name: '@playwright/test',
              message:
                "Import { test, expect } from './helpers' so each test gets its own clientIp.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'coverage/**',
    'legacy/**',
    'playwright-report/**',
    'test-results/**',
    '.worktrees/**',
    'node_modules/**',
    'next-env.d.ts',
  ]),
]);

export default config;
