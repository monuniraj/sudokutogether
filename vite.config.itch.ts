import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
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
        closeBundle() {
          const outDir = path.resolve(__dirname, 'dist-itch');
          if (!fs.existsSync(outDir)) return;

          const processDirectory = (dir: string) => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
              const fullPath = path.join(dir, entry.name);
              if (entry.isDirectory()) {
                processDirectory(fullPath);
              } else if (/\.(html|js|css)$/.test(entry.name)) {
                let content = fs.readFileSync(fullPath, 'utf8');
                let modified = false;

                // Safely replace standalone string literal '/logo.png' without corrupting full URLs
                if (content.includes('"/logo.png"') || content.includes("'/logo.png'")) {
                  content = content
                    .replace(/"\/logo\.png"/g, '"./logo.png"')
                    .replace(/'\/logo\.png'/g, "'./logo.png'");
                  modified = true;
                }

                if (modified) {
                  fs.writeFileSync(fullPath, content, 'utf8');
                  console.log(`[ItchPlugin] Successfully normalized /logo.png -> ./logo.png in ${entry.name}`);
                }
              }
            }
          };

          processDirectory(outDir);
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
