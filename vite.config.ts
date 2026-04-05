import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { px2viewport } from '@mistjs/vite-plugin-px2viewport';
import ElementPlus from 'unplugin-element-plus/vite';

const version = process.env.npm_package_version ?? '0.0.0';

// https://vitejs.dev/config/ 
export default defineConfig({
  base: './',
  plugins: [
    px2viewport({
      viewportWidth: 1360,
      unitPrecision: 10
    }),
    vue(),
    ElementPlus({})
  ],
  css: {
    preprocessorOptions: {
      scss: {},
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
              time: new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }),
              type: 'vite',

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
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('element-plus') || id.includes('pinia')) {
              return 'framework';
            }
            if (id.includes('lodash-es') || id.includes('crypto-js')) {
              return 'utils';
            }
            if (id.includes('howler') || id.includes('video.js')) {
              return 'media';
            }
          }
          return undefined;
        }
      }
    }
  }
}
);
