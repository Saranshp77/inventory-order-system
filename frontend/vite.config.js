import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite is the build tool / dev server for the React app.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // allow access from the network (and Docker)
  },
})
