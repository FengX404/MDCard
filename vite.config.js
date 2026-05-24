import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
  },
  server: {
    port: process.env.NODE_ENV === 'production' ? 3000 : 4000,
  },
});
