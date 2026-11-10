import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import {
  SEO_SILO_MAP,
  SEO_SILO_ORDER,
  SEO_SITE_ORIGIN,
  buildStaticNoscriptHtml,
} from './src/utils/seoSilos';

function escapeHtmlAttr(val: string): string {
  return val
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function seoSiloStaticShellPlugin(): Plugin {
  return {
    name: 'seo-silo-static-shells',
    closeBundle() {
      const outDir = path.resolve(__dirname, 'dist');
      const rootHtmlPath = path.join(outDir, 'index.html');
      if (!fs.existsSync(rootHtmlPath)) return;

      const rootHtml = fs.readFileSync(rootHtmlPath, 'utf8');

      for (const level of SEO_SILO_ORDER) {
        const config = SEO_SILO_MAP[level];
        const safeTitle = escapeHtmlAttr(config.title);
        const safeDesc = escapeHtmlAttr(config.description);
        const safeCanonical = escapeHtmlAttr(config.canonicalUrl);
        const noscriptBlock = `<noscript>\n    ${buildStaticNoscriptHtml(config)}\n  </noscript>`;

        let siloHtml = rootHtml
          .replace(
            /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
            `<link rel="canonical" href="${safeCanonical}" />`
          )
          .replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`)
          .replace(
            /<meta\s+name="description"[\s\S]*?content="[^"]*"\s*\/?>/i,
            `<meta name="description"\n    content="${safeDesc}">`
          )
          .replace(
            /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
            `<meta property="og:title" content="${safeTitle}" />`
          )
          .replace(
            /<meta\s+property="og:description"[\s\S]*?content="[^"]*"\s*\/?>/i,
            `<meta property="og:description"\n    content="${safeDesc}" />`
          )
          .replace(
            /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
            `<meta property="og:url" content="${safeCanonical}" />`
          )
          .replace(
            /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
            `<meta property="og:image" content="${SEO_SITE_ORIGIN}/logo.png" />`
          )
          .replace(
            /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
            `<meta name="twitter:title" content="${safeTitle}" />`
          )
          .replace(
            /<meta\s+name="twitter:description"[\s\S]*?content="[^"]*"\s*\/?>/i,
            `<meta name="twitter:description"\n    content="${safeDesc}" />`
          )
          .replace(
            /href="\.\/(favicon[^"]*|logo[^"]*|apple-touch-icon[^"]*|manifest\.json)"/gi,
            'href="/$1"'
          )
          .replace(/<noscript>[\s\S]*?<\/noscript>/i, noscriptBlock);

        if (!siloHtml.includes(config.canonicalUrl) || !siloHtml.includes(config.h1)) {
          throw new Error(`[SEO-Silo] Failed to inject metadata/noscript for ${config.path}`);
        }

        const siloDir = path.join(outDir, config.slug);
        fs.mkdirSync(siloDir, { recursive: true });
        fs.writeFileSync(path.join(siloDir, 'index.html'), siloHtml, 'utf8');
        console.log(`[SEO-Silo] Emitted static shell: dist/${config.slug}/index.html`);
      }
    },
  };
}

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [react(), tailwindcss(), seoSiloStaticShellPlugin()],
    build: {
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
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        ignored: ['**/android/**', '**/scratch/**'],
      },
    },
  };
});
