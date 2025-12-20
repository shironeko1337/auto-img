import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

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
})
