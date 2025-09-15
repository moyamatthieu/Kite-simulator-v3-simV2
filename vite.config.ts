
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@': './src',
      '@core': './src/core',
      '@objects': './src/objects',
      '@physics': './src/physics',
      '@ui': './src/ui',
      '@utils': './src/utils',
      '@factories': './src/factories',
      '@types': './src/types',
    },
  },
  server: {
    port: 5173,
    open: true,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'esnext',
    rollupOptions: {
      input: {
        main: 'index.html',
      },
      output: {
        manualChunks: {
          three: ['three'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['three'],
  },
});
