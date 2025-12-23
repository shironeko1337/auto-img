import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Tell Vue to treat auto-img as a custom element
          isCustomElement: (tag) => tag === 'auto-img'
        }
      }
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['vue', 'autoimg'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
    sourcemap: 'hidden', // Generates sourcemap files but doesn't reference them in the bundle
    minify: 'esbuild', // Minify for production
  },
})