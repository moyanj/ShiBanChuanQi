import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { px2viewport } from '@mistjs/vite-plugin-px2viewport';

// 从package.json获取版本号
const version = require('./package.json').version;

// https://vitejs.dev/config/ 
export default defineConfig({
  base: './',
  plugins: [
    px2viewport({
      viewportWidth: 1360,
      unitPrecision: 10
    }),
    vue()
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      },
    }
  },
  esbuild:{
    drop: ['debugger']
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
        chunkFileNames: "assets/lib/[name]-[hash].js",
        entryFileNames: "assets/main-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
        manualChunks: {
          "framework": ["vue", "element-plus", "pinia"],  // 框架
          "utils": ["lodash-es", "crypto-js"],
          "media": ["howler", "video.js"]
      }
    }
  }
}
}
);