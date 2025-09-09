import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Nome do seu repositório
  build: {
    outDir: 'dist' // GitHub Pages espera dist/
  }
})
