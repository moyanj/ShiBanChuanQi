import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// 从package.json获取版本号
const version = require('./package.json').version;

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
      plugins: [
        {
          name: 'make_build_info.json',
          generateBundle() {
            const build_info = {
              version: version,
              timestamp: Date.now(),
              time: new Date().toLocaleString(),
              type: 'vite'
            }
            this.emitFile({
              type: 'asset',
              fileName: 'build_info.json',
              source: JSON.stringify(build_info, null, 2)
            });
          }
        }
      ],
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