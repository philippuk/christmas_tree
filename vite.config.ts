import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 'base' must be './' for GitHub Pages to load assets correctly from a subdirectory
  base: './', 
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})