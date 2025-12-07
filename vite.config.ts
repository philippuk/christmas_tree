import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures relative paths for assets, making it easier to deploy on subdirectories
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})