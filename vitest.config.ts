/// <reference types="vitest" />
import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, './src/core'),
      '@objects': path.resolve(__dirname, './src/objects'),
      '@physics': path.resolve(__dirname, './src/physics'),
      '@ui': path.resolve(__dirname, './src/ui'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
});