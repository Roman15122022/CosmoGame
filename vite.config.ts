import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

const REPOSITORY_BASE = '/CosmoGame/';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? REPOSITORY_BASE : '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@game': fileURLToPath(new URL('./src/game', import.meta.url)),
      '@core': fileURLToPath(new URL('./src/game/core', import.meta.url)),
      '@data': fileURLToPath(new URL('./src/game/data', import.meta.url)),
      '@entities': fileURLToPath(new URL('./src/game/entities', import.meta.url)),
      '@ui': fileURLToPath(new URL('./src/game/ui', import.meta.url)),
    },
  },
}));
