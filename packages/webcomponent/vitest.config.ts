import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Enable globals like describe, it, expect
    globals: true,

    // Use browser environment for web component testing
    environment: 'jsdom',

    // Test file patterns
    include: ['test/**/*.test.ts', 'test/**/*.spec.ts'],

    // Setup files to run before tests
    setupFiles: ['./test/setup.ts'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
      ],
    },
  },
});
