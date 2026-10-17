import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [vue()],
  build: {
    target: 'es2020',
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue', /\.css$/],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        assetFileNames: '[name][extname]',
      },
    },
  },
});
