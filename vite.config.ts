import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig(
  {
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
          manualChunks: {
            'lib': ['vue', 'pinia', 'vue3-persist-storages'],
            'element-plus': ['element-plus'],
          }
        }
      }
    }
  })
