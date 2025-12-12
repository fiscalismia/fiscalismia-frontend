import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as dotenv from 'dotenv';
dotenv.config();

// timezone for HMR logging
process.env.TZ = 'Europe/Berlin';

const FRONTEND_PORT = Number(process.env.FRONTEND_PORT) || 3003;
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(
      process.env.VITE_BUILD_VERSION ? `${process.env.VITE_BUILD_VERSION}` : 'local-development'
    ),
    __BACKEND_PORT__: JSON.stringify(process.env.VITE_BACKEND_PORT ? `${process.env.VITE_BACKEND_PORT}` : 3002),
    __BACKEND_PROTOCOL__: JSON.stringify(
      process.env.VITE_BACKEND_PROTOCOL ? `${process.env.VITE_BACKEND_PROTOCOL}` : 'http'
    ),
    __BACKEND_DOMAIN__: JSON.stringify(
      process.env.VITE_BACKEND_DOMAIN ? `${process.env.VITE_BACKEND_DOMAIN}` : 'localhost'
    )
  },
  server: {
    watch: {
      usePolling: true // Add this line if you're running on a network filesystem or Docker and Hot Module Replace is not working
    },
    host: true,
    port: FRONTEND_PORT
  },
  build: {
    outDir: 'dist', // Output directory for production build
    sourcemap: false, // Disable source maps in production (prevents source code exposure)
    minify: 'esbuild', // Fast minification using esbuild (default for Vite)
    target: 'es2015', // Browser compatibility target (supports 95%+ of users)
    cssCodeSplit: true // Split CSS into separate files per component (better caching)
  }
});
