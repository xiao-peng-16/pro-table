import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import VueSetupExtend from 'vite-plugin-vue-setup-extend'
import UnoCss from 'unocss/vite'

export default defineConfig({
  plugins: [
    vue(),
    UnoCss(),
    VueSetupExtend(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      "@": "/src", // 配置@指向src目录
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080/xiaopeng',
        changeOrigin: true,
        rewrite: (path) => {
            return path.replace(/\/api/, '')
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
  }
})
