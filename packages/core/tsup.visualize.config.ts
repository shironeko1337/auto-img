import { defineConfig } from 'tsup';

export default defineConfig([
  // visualize_roi.ts (with special define)
  {
    entry: ['src/visualize_roi.ts'],
    format: ['iife'],
    outDir: 'dist',
    outExtension: () => ({ js: '.bundle.js' }),
    platform: 'browser',
    target: 'es2020',
    minify: false,
    dts: false,
    esbuildOptions(options) {
      options.define = {
        'import.meta.url': 'document.location.href'
      };
    },
  },
  // visualize_upscale.ts
  {
    entry: ['src/visualize_upscale.ts'],
    format: ['iife'],
    outDir: 'dist',
    outExtension: () => ({ js: '.bundle.js' }),
    platform: 'browser',
    target: 'es2020',
    minify: false,
    dts: false,
  },
]);
