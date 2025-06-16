/**
 * Root Vitest Configuration
 * Shared configuration for all packages
 */

import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: true,
    include: [
      'packages/**/*.{test,spec}.{ts,tsx}',
      'apps/web/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: [
      'node_modules',
      'dist',
      'build',
      '.next',
      '.expo',
      'apps/mobile/**/*',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules',
        'dist',
        'build',
        '.next',
        '.expo',
        '**/*.d.ts',
        '**/*.config.{ts,js}',
        '**/types.ts',
        '**/constants.ts',
        '**/__tests__/**',
        '**/__mocks__/**',
        '**/test-utils/**',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@starter-template/ui': resolve(__dirname, './packages/ui/src'),
      '@starter-template/shared': resolve(__dirname, './packages/shared/src'),
      '@starter-template/database': resolve(__dirname, './packages/database/src'),
      'test-utils': resolve(__dirname, './test-utils'),
    },
  },
  define: {
    global: 'globalThis',
  },
});