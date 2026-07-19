import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    visualizer({
      filename: 'stats.html',
    }),
    visualizer({
      template: 'raw-data',
      filename: 'stats.json'
    })
  ]
})
