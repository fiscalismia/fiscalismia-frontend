import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// timezone for HMR logging
process.env.TZ = 'Europe/Berlin';

const FRONTEND_PORT = 3001;
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.VITE_BUILD_VERSION ? `${process.env.VITE_BUILD_VERSION}` : '0.9.local'),
    __ENVIRONMENT__: JSON.stringify(process.env.VITE_ENVIRONMENT ? `${process.env.VITE_ENVIRONMENT}` : 'development')
  },
  server: {
    watch: {
      usePolling: true // Add this line if you're running on a network filesystem or Docker and Hot Module Replace is not working
    },
    host: '127.0.0.1',
    port: FRONTEND_PORT
  },
  optimizeDeps: {
    force: true,
    include: ['react', 'react-dom']
  },
  build: {
    rollupOptions: {
      output: {
        // Chunk splitting strategy
        manualChunks: (id) => {
          // 1. Core React Vendor (cached almost forever)
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react-router-dom') ||
            id.includes('@mui') ||
            id.includes('@emotion')
          ) {
            return 'core-vendor';
          }

          // 2. Data Grid (AG Grid)
          // Heavy specific library, should be its own chunk so it doesn't block the main UI load if not needed immediately.
          if (id.includes('@ag-grid-community') || id.includes('ag-grid-react')) {
            return 'ag-grid-vendor';
          }

          // 3. Charting (Chart.js & wrappers)
          if (id.includes('chart.js') || id.includes('react-chartjs-2') || id.includes('chartjs-plugin')) {
            return 'charting-vendor';
          }

          // 4. Icons (FontAwesome)
          if (id.includes('@fortawesome')) {
            return 'icons-vendor';
          }

          // 5. Utilities (Axios, jwt-decode, etc.)
          // Grouping small utils prevents having 100 tiny HTTP requests.
          if (id.includes('axios') || id.includes('jwt-decode') || id.includes('cors')) {
            return 'utils-vendor';
          }
        },

        // Asset naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    outDir: 'dist', // Output directory for production build
    sourcemap: false, // Disable source maps in production (prevents source code exposure)
    minify: 'esbuild', // Fast minification using esbuild (default for Vite)
    target: 'esnext', // Browser compatibility target (supports 95%+ of users)
    chunkSizeWarningLimit: 1000, // increases chunk size warning threshold
    cssCodeSplit: true // Split CSS into separate files per component (better caching)
  }
});
