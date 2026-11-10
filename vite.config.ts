import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import {
  SEO_LANGUAGES,
  SEO_SILO_ORDER,
  SEO_SITE_ORIGIN,
  type DifficultySiloConfig,
  getLocalizedSeoSilo,
  getSeoCanonicalUrl,
  buildStaticNoscriptHtml,
} from './src/utils/seoSilos';

function escapeHtmlAttr(val: string): string {
  return val
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildHreflangTags(difficulty: DifficultySiloConfig['difficulty']): string {
  const links = SEO_LANGUAGES.map((langMeta) => {
    const href = escapeHtmlAttr(getSeoCanonicalUrl(langMeta.code, difficulty));
    return `  <link rel="alternate" hreflang="${escapeHtmlAttr(langMeta.htmlLang)}" href="${href}" />`;
  });
  const xDefaultHref = escapeHtmlAttr(getSeoCanonicalUrl('en', difficulty));
  links.push(`  <link rel="alternate" hreflang="x-default" href="${xDefaultHref}" />`);
  return links.join('\n');
}

function renderStaticShellHtml(
  rootHtml: string,
  config: DifficultySiloConfig,
  overrideCanonicalUrl?: string
): string {
  const safeTitle = escapeHtmlAttr(config.title);
  const safeDesc = escapeHtmlAttr(config.description);
  const effectiveCanonical = overrideCanonicalUrl || config.canonicalUrl;
  const safeCanonical = escapeHtmlAttr(effectiveCanonical);
  const safeHtmlLang = escapeHtmlAttr(config.htmlLang);
  const hreflangTags = buildHreflangTags(config.difficulty);
  const noscriptBlock = `<noscript>\n    ${buildStaticNoscriptHtml(config, config.language)}\n  </noscript>`;

  const siloHtml = rootHtml
    .replace(/<html\s+lang="[^"]*"/i, `<html lang="${safeHtmlLang}"`)
    .replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
      `<link rel="canonical" href="${safeCanonical}" />\n${hreflangTags}`
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

  if (
    !siloHtml.includes(`lang="${safeHtmlLang}"`) ||
    !siloHtml.includes(effectiveCanonical) ||
    !siloHtml.includes(config.h1.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'))
  ) {
    throw new Error(`[SEO-Silo] Failed to inject localized metadata/noscript for ${config.path}`);
  }

  return siloHtml;
}

function seoSiloStaticShellPlugin(): Plugin {
  return {
    name: 'seo-silo-static-shells',
    closeBundle() {
      const outDir = path.resolve(__dirname, 'dist');
      const rootHtmlPath = path.join(outDir, 'index.html');
      if (!fs.existsSync(rootHtmlPath)) return;

      const rootHtml = fs.readFileSync(rootHtmlPath, 'utf8');
      let emittedMultilangCount = 0;

      // 1. Emit 36 multilingual static shells (9 languages × 4 difficulties)
      for (const langMeta of SEO_LANGUAGES) {
        for (const level of SEO_SILO_ORDER) {
          const config = getLocalizedSeoSilo(level, langMeta.code);
          const siloHtml = renderStaticShellHtml(rootHtml, config);
          const siloDir = path.join(outDir, langMeta.urlSlug, config.slug);
          fs.mkdirSync(siloDir, { recursive: true });
          fs.writeFileSync(path.join(siloDir, 'index.html'), siloHtml, 'utf8');
          emittedMultilangCount++;
        }
      }

      // 2. Preserve legacy root difficulty shells (/easy, /medium, /hard, /expert) pointing canonical to /en/{diff}
      for (const level of SEO_SILO_ORDER) {
        const config = getLocalizedSeoSilo(level, 'en');
        const aliasHtml = renderStaticShellHtml(rootHtml, config, config.canonicalUrl);
        const aliasDir = path.join(outDir, config.slug);
        fs.mkdirSync(aliasDir, { recursive: true });
        fs.writeFileSync(path.join(aliasDir, 'index.html'), aliasHtml, 'utf8');
      }

      console.log(
        `[SEO-Silo] Emitted ${emittedMultilangCount} multilingual static shells (9 languages × 4 difficulties) + ${SEO_SILO_ORDER.length} root aliases`
      );
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
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        ignored: ['**/android/**', '**/scratch/**'],
      },
    },
  };
});
