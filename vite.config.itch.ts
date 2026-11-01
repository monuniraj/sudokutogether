import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'itch-relative-paths',
        transformIndexHtml(html) {
          // Ensure static favicons, manifest, and logos in <head> resolve relatively for iframe subpaths
          return html
            .replace(/href="\/(favicon|logo|apple-touch-icon|manifest)/g, 'href="./$1')
            .replace(/src="\/(favicon|logo)/g, 'src="./$1');
        },
      },
    ],
    build: {
      outDir: 'dist-itch',
      emptyOutDir: true,
      sourcemap: false,
      chunkSizeWarningLimit: 2000,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      headers: {
        "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      },
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        ignored: ['**/android/**', '**/scratch/**'],
      },
    },
  };
});

