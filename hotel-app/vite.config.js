import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // (Tùy chọn) Cố định cổng chạy web là 5173 cho ổn định
  }
})