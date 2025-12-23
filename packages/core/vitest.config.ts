import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  test: {
    globals: true,
    browser: {
      enabled: true,
      provider: playwright({launchOptions: {
          devtools: true,
          slowMo: 150,
        },}),

      instances: [
        {
          browser: 'chromium',
          headless: !process.env.DEBUG,
          viewport: {
              width: 1280,
              height: 720,
            },
        },
      ],

    },
    include: ['src/**/*_test.ts', 'src/**/*.test.ts'],
    env: {
      CI: process.env.CI || '',
    },
  },
});
