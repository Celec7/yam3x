import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@registry': fileURLToPath(new URL('../../registry', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    server: {
      deps: {
        inline: ['@material/material-color-utilities'],
      },
    },
    include: ['src/**/*.test.ts'],
  },
})
