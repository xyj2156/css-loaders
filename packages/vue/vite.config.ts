import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueLoading',
      fileName: 'vue-loading',
    },
    rollupOptions: {
      external: ['vue', '@xyj2156/css-loading'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
});
