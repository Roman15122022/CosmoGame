import { defineConfig } from 'vite';

const REPOSITORY_BASE = '/CosmoGame/';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? REPOSITORY_BASE : '/',
}));
