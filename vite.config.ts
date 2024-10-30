import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// 从package.json获取版本号
const version = require('./package.json').version;

// https://vitejs.dev/config/ 
export default defineConfig({
  base: './',
  plugins: [
    vue()
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
    chunkSizeWarningLimit: 1024,
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
        chunkFileNames: "assets/lib-[name].js",
        entryFileNames: "assets/main.js",
        manualChunks(id) {
          if (['pinia', 'video.js', 'crypto-js', 'howler'].some(lib => id.includes(lib))) {
            return 'vendor';
          }
        
          if (['element-plus', 'lodash-es', 'vue'].some(lib => id.includes(lib))) {
            return 'big';
          }

      }
    }
  }
}
}
);