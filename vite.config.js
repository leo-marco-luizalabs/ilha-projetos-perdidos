import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/ilha-projetos-perdidos/' : '/', // Base path apenas para produção
  build: {
    outDir: 'dist' // GitHub Pages espera dist/
  }
}))
