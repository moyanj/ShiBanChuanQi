import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/ 
export default defineConfig({
  base: './',
  plugins: [
    vue(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      },
    }
  },
  build: {
    outDir: 'html',
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 分割 utils.ts 为单独的 chunk
          if (id.includes('utils.ts')) {
            return 'utils';
          }
          // 分割指定的库文件
          if (['vue', 'pinia', 'vue3-persist-storages', 'element-plus'].some(lib => id.includes(lib))) {
            return 'lib';
          }
        }
      }
    }
  }
});