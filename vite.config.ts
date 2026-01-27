import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/web-ifc-three/node_modules/web-ifc/web-ifc.wasm',
          dest: 'assets'
        },
        {
          src: 'node_modules/web-ifc-three/node_modules/web-ifc/web-ifc-mt.wasm',
          dest: 'assets'
        },
        {
          src: 'node_modules/occt-import-js/dist/occt-import-js.wasm',
          dest: 'assets'
        },
        {
          src: 'node_modules/occt-import-js/dist/occt-import-js-worker.js',
          dest: 'assets'
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
