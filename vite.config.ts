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
import { GUIDE_PATHS, GUIDE_SLUGS, GUIDES_TRANSLATIONS } from './src/utils/guidesTranslations';
import { getRulesArticleCopy } from './src/utils/rulesArticleTranslations';
import { getSolverArticleCopy } from './src/utils/solverArticleTranslations';
import { getDailyArticleCopy } from './src/utils/dailyArticleTranslations';
import { LEGAL_DOCUMENT_CONTENT } from './src/i18n/legalDocumentContent';

interface StaticStandaloneRoute {
  route: string;
  title: string;
  description: string;
  canonicalUrl: string;
  h1: string;
  noscriptMainHtml: string;
}

function escapeHtml(val: string): string {
  return val
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function joinSegments(segments: readonly { text: string }[]): string {
  return segments.map((s) => s.text).join('');
}

function stripAdsenseScriptTag(html: string): string {
  return html.replace(
    /\s*<script[^>]*src="[^"]*adsbygoogle\.js[^"]*"[^>]*>\s*<\/script>/gi,
    ''
  );
}

function buildHreflangTags(difficulty: DifficultySiloConfig['difficulty']): string {
  const links = SEO_LANGUAGES.map((langMeta) => {
    const href = escapeHtml(getSeoCanonicalUrl(langMeta.code, difficulty));
    return `  <link rel="alternate" hreflang="${escapeHtml(langMeta.htmlLang)}" href="${href}" />`;
  });
  const xDefaultHref = escapeHtml(getSeoCanonicalUrl('en', difficulty));
  links.push(`  <link rel="alternate" hreflang="x-default" href="${xDefaultHref}" />`);
  return links.join('\n');
}

function applyMetadataToHtmlShell(
  rootHtml: string,
  params: {
    htmlLang: string;
    title: string;
    description: string;
    canonicalUrl: string;
    extraCanonicalHeadTags?: string;
    noscriptInnerHtml: string;
  }
): string {
  const safeTitle = escapeHtml(params.title);
  const safeDesc = escapeHtml(params.description);
  const safeCanonical = escapeHtml(params.canonicalUrl);
  const safeHtmlLang = escapeHtml(params.htmlLang);
  const canonicalReplacement = params.extraCanonicalHeadTags
    ? `<link rel="canonical" href="${safeCanonical}" />\n${params.extraCanonicalHeadTags}`
    : `<link rel="canonical" href="${safeCanonical}" />`;

  return rootHtml
    .replace(/<html\s+lang="[^"]*"/i, `<html lang="${safeHtmlLang}"`)
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, canonicalReplacement)
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
    .replace(/<noscript>[\s\S]*?<\/noscript>/i, `<noscript>\n    ${params.noscriptInnerHtml}\n  </noscript>`);
}

function renderStaticShellHtml(
  rootHtml: string,
  config: DifficultySiloConfig,
  overrideCanonicalUrl?: string
): string {
  const effectiveCanonical = overrideCanonicalUrl || config.canonicalUrl;
  const siloHtml = applyMetadataToHtmlShell(rootHtml, {
    htmlLang: config.htmlLang,
    title: config.title,
    description: config.description,
    canonicalUrl: effectiveCanonical,
    extraCanonicalHeadTags: buildHreflangTags(config.difficulty),
    noscriptInnerHtml: buildStaticNoscriptHtml(config, config.language),
  });

  if (
    !siloHtml.includes(`lang="${escapeHtml(config.htmlLang)}"`) ||
    !siloHtml.includes(effectiveCanonical) ||
    !siloHtml.includes(escapeHtml(config.h1))
  ) {
    throw new Error(`[SEO-Silo] Failed to inject localized metadata/noscript for ${config.path}`);
  }

  return siloHtml;
}

function buildStandaloneMainHtml(opts: {
  badge?: string;
  h1: string;
  lead: string;
  sections: Array<{ heading: string; paragraphs?: string[]; bullets?: string[] }>;
}): string {
  const sectionsHtml = opts.sections
    .map((sec) => {
      const pHtml = (sec.paragraphs || []).map((p) => `<p>${escapeHtml(p)}</p>`).join('\n      ');
      const bHtml =
        sec.bullets && sec.bullets.length > 0
          ? `<ul>\n        ${sec.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('\n        ')}\n      </ul>`
          : '';
      return `<h2>${escapeHtml(sec.heading)}</h2>\n      ${pHtml}${bHtml ? `\n      ${bHtml}` : ''}`;
    })
    .join('\n      ');

  return `
    <main style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 2rem; max-width: 820px; margin: 0 auto; line-height: 1.65; color: #1e1e1e; background-color: #fdfbf7;">
      ${opts.badge ? `<p style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #0369a1;">${escapeHtml(opts.badge)}</p>` : ''}
      <h1>${escapeHtml(opts.h1)}</h1>
      <p>${escapeHtml(opts.lead)}</p>
      ${sectionsHtml}
      <nav aria-label="SudokuSync Academy and Tools" style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; display: flex; flex-wrap: wrap; gap: 0.75rem;">
        <a href="/" style="color: #0369a1; text-decoration: underline;">Play SudokuSync</a>
        <a href="/en/easy" style="color: #0369a1; text-decoration: underline;">Easy Sudoku (51 Clues)</a>
        <a href="/rules" style="color: #0369a1; text-decoration: underline;">Sudoku Rules &amp; Strategies</a>
        <a href="/guides/multiplayer-sudoku" style="color: #0369a1; text-decoration: underline;">Multiplayer Guide</a>
        <a href="/guides/beginner-sudoku" style="color: #0369a1; text-decoration: underline;">Beginner Guide</a>
        <a href="/guides/advanced-patterns" style="color: #0369a1; text-decoration: underline;">Advanced Patterns</a>
        <a href="/daily-challenge" style="color: #0369a1; text-decoration: underline;">Daily Challenge</a>
        <a href="/solver" style="color: #0369a1; text-decoration: underline;">Sudoku Solver</a>
      </nav>
      <footer style="margin-top: 1.25rem; display: flex; flex-wrap: wrap; gap: 1rem; align-items: center;">
        <a href="/about" style="color: #0369a1; text-decoration: underline;">About Us</a>
        <a href="/contact" style="color: #0369a1; text-decoration: underline;">Contact Us</a>
        <a href="/privacy" style="color: #0369a1; text-decoration: underline;">Privacy Policy</a>
        <a href="/terms" style="color: #0369a1; text-decoration: underline;">Terms of Service</a>
        <span style="opacity: 0.8; font-family: monospace; font-size: 11px;">© 2026 SudokuSync (Mo Logic). All rights reserved.</span>
      </footer>
    </main>
  `.trim();
}

function buildStandaloneRoutes(): StaticStandaloneRoute[] {
  const rulesCopy = getRulesArticleCopy('en');
  const solverCopy = getSolverArticleCopy('en');
  const dailyCopy = getDailyArticleCopy('en');
  const legalCopy = LEGAL_DOCUMENT_CONTENT.en;

  const routes: StaticStandaloneRoute[] = [
    {
      route: 'rules',
      title: 'Sudoku Rules, Strategies & Smart Assistants Guide | Sudoku Sync',
      description:
        'Learn classic 9x9 Sudoku rules, Pencil Notes workflow, X-Wing & Y-Wing elimination techniques with SVG diagrams, keyboard shortcuts, and all 7 Sudoku Sync Smart Assistants.',
      canonicalUrl: `${SEO_SITE_ORIGIN}/rules`,
      h1: rulesCopy.hero.title,
      noscriptMainHtml: buildStandaloneMainHtml({
        badge: rulesCopy.hero.badge,
        h1: rulesCopy.hero.title,
        lead: rulesCopy.hero.subtitle,
        sections: [
          {
            heading: rulesCopy.basics.heading,
            paragraphs: [rulesCopy.basics.intro, rulesCopy.basics.coordinatesDesc],
            bullets: [
              ...rulesCopy.basics.coreRules.map((r) => `${r.title}: ${r.desc}`),
              ...rulesCopy.basics.difficultyRows.map(
                (d) => `${d.label} (${d.clues}): ${d.logicSummary}`
              ),
            ],
          },
          {
            heading: rulesCopy.notes.heading,
            paragraphs: [rulesCopy.notes.intro],
            bullets: [
              ...rulesCopy.notes.workflowSteps,
              ...rulesCopy.notes.shortcuts.map((s) => `${s.keys}: ${s.action}`),
            ],
          },
          {
            heading: `${rulesCopy.strategies.heading} & ${rulesCopy.advanced.heading}`,
            paragraphs: [rulesCopy.strategies.intro, rulesCopy.advanced.intro],
            bullets: [
              ...rulesCopy.strategies.items.map((item) => `${item.name}: ${item.summary}`),
              ...rulesCopy.advanced.items.map((item) => `${item.name}: ${item.summary}`),
            ],
          },
          {
            heading: rulesCopy.assistants.heading,
            paragraphs: [rulesCopy.assistants.intro],
            bullets: rulesCopy.assistants.items.map(
              (a) => `${a.name} (${a.badge}): ${a.description}`
            ),
          },
        ],
      }),
    },
    {
      route: 'solver',
      title: 'Free Online Sudoku Solver & Logic Diagnostics | Sudoku Sync',
      description:
        'Solve, verify, and diagnose any 9x9 Sudoku puzzle instantly. Features real-time conflict detection, uniqueness verification, and advanced logic support including Skyscrapers and 2-String Kites.',
      canonicalUrl: `${SEO_SITE_ORIGIN}/solver`,
      h1: 'Sudoku Solver & Custom 9x9 Board Validator',
      noscriptMainHtml: buildStandaloneMainHtml({
        badge: 'Bitmask MRV Logic Solver',
        h1: 'Sudoku Solver & Custom 9x9 Board Validator',
        lead: joinSegments(solverCopy.overviewP1),
        sections: [
          {
            heading: solverCopy.howToHeading,
            paragraphs: [joinSegments(solverCopy.howToIntro)],
            bullets: solverCopy.howToSteps.map((step) => joinSegments(step)),
          },
          {
            heading: solverCopy.techniquesHeading,
            paragraphs: [joinSegments(solverCopy.techniquesIntro)],
            bullets: solverCopy.techniqueCards.map(
              (card) => `${card.title}: ${joinSegments(card.body)}`
            ),
          },
        ],
      }),
    },
    {
      route: 'daily-challenge',
      title: 'Daily Sudoku Challenge — Synchronized Global Puzzle & Archive | Sudoku Sync',
      description:
        "Play today's synchronized Daily Sudoku Challenge seeded deterministically with Mulberry32. Track streaks, tackle Monday–Sunday difficulties, and explore the Monthly Archive.",
      canonicalUrl: `${SEO_SITE_ORIGIN}/daily-challenge`,
      h1: 'Daily Sudoku Challenge & Monthly Calendar Archive',
      noscriptMainHtml: buildStandaloneMainHtml({
        badge: 'Deterministic Daily Seed (Mulberry32)',
        h1: 'Daily Sudoku Challenge & Monthly Calendar Archive',
        lead: joinSegments(dailyCopy.whatIsP1),
        sections: [
          {
            heading: dailyCopy.whatIsHeading,
            paragraphs: [joinSegments(dailyCopy.whatIsP2)],
            bullets: dailyCopy.whatIsBullets.map((b) => joinSegments(b)),
          },
          {
            heading: dailyCopy.scalingHeading,
            paragraphs: [joinSegments(dailyCopy.scalingIntro)],
            bullets: [
              ...dailyCopy.scalingTiers.map((t) => `${t.title}: ${joinSegments(t.body)}`),
              `${dailyCopy.sundayMasterCard.title}: ${joinSegments(dailyCopy.sundayMasterCard.body)}`,
            ],
          },
          {
            heading: dailyCopy.streakHeading,
            paragraphs: [joinSegments(dailyCopy.streakP1), joinSegments(dailyCopy.streakP2)],
            bullets: dailyCopy.streakBullets.map((b) => joinSegments(b)),
          },
        ],
      }),
    },
  ];

  for (const slug of GUIDE_SLUGS) {
    const guideCopy = GUIDES_TRANSLATIONS.en[slug];
    const cleanRoute = GUIDE_PATHS[slug].replace(/^\/+/, '');
    routes.push({
      route: cleanRoute,
      title: `${guideCopy.metaTitle} | Sudoku Sync`,
      description: guideCopy.metaDescription,
      canonicalUrl: `${SEO_SITE_ORIGIN}${GUIDE_PATHS[slug]}`,
      h1: guideCopy.title,
      noscriptMainHtml: buildStandaloneMainHtml({
        badge: guideCopy.badge,
        h1: guideCopy.title,
        lead: guideCopy.subtitle,
        sections: [
          ...guideCopy.sections.map((sec) => ({
            heading: sec.heading,
            paragraphs: sec.paragraphs,
            bullets: sec.bullets,
          })),
          {
            heading: guideCopy.proTipTitle,
            paragraphs: [guideCopy.proTipBody],
          },
          {
            heading: guideCopy.faqTitle,
            bullets: guideCopy.faqs.map((faq) => `${faq.question} — ${faq.answer}`),
          },
        ],
      }),
    });
  }

  routes.push(
    {
      route: 'about',
      title: 'About SudokuSync — Real-Time Social Sudoku',
      description:
        'Learn about SudokuSync by Mo Logic, classic 9x9 Sudoku across 51/39/30/25 clue tiers, Same-Board Live & Asynchronous Multiplayer, and 7 Smart Assistants.',
      canonicalUrl: `${SEO_SITE_ORIGIN}/about`,
      h1: 'About SudokuSync (Published by Mo Logic)',
      noscriptMainHtml: buildStandaloneMainHtml({
        badge: `${legalCopy.about.publisherBadge} | Version 1.0.3`,
        h1: 'About SudokuSync (Published by Mo Logic)',
        lead: legalCopy.about.publisherText,
        sections: [
          {
            heading: legalCopy.about.engineHeader,
            paragraphs: [legalCopy.about.engineIntro],
            bullets: legalCopy.about.difficultySpecs.map(
              (spec) => `${spec.label} (${spec.cluesBadge}): ${spec.summary}`
            ),
          },
          {
            heading: legalCopy.about.multiplayerHeader,
            paragraphs: [legalCopy.about.multiplayerText, legalCopy.about.assistantsText],
          },
        ],
      }),
    },
    {
      route: 'contact',
      title: 'Contact & Support — SudokuSync',
      description:
        'Contact the SudokuSync and Mo Logic team at sudokutogethermode@gmail.com for player support, bug reports, Google UMP consent, or account and data deletion inquiries.',
      canonicalUrl: `${SEO_SITE_ORIGIN}/contact`,
      h1: 'Contact SudokuSync & Player Support',
      noscriptMainHtml: buildStandaloneMainHtml({
        badge: legalCopy.metaLine,
        h1: 'Contact SudokuSync & Player Support',
        lead: 'Reach Mo Logic at sudokutogethermode@gmail.com for bug reports, privacy or Google UMP ad consent requests, and account or cloud data deletion.',
        sections: [
          {
            heading: legalCopy.contactComposer.sectionLabel,
            paragraphs: [legalCopy.contactComposer.helperText],
            bullets: [
              `Support Email: sudokutogethermode@gmail.com (${legalCopy.terms.s8TurnaroundValue})`,
              `${legalCopy.contactComposer.topics.bug.label}: ${legalCopy.contactComposer.topics.bug.subject}`,
              `${legalCopy.contactComposer.topics.privacy.label}: ${legalCopy.contactComposer.topics.privacy.subject}`,
              `${legalCopy.contactComposer.topics.deletion.label}: ${legalCopy.contactComposer.topics.deletion.subject}`,
            ],
          },
        ],
      }),
    },
    {
      route: 'privacy',
      title: 'Privacy Policy (v1.0.3) — SudokuSync',
      description:
        'Privacy Policy for SudokuSync covering Firebase Authentication, Cloud Firestore, FCM, Google AdSense, Google AdMob SDK, AAID controls, and Google UMP Consent.',
      canonicalUrl: `${SEO_SITE_ORIGIN}/privacy`,
      h1: `${legalCopy.privacy.title} (Version 1.0.3)`,
      noscriptMainHtml: buildStandaloneMainHtml({
        badge: legalCopy.metaLine,
        h1: `${legalCopy.privacy.title} (Version 1.0.3)`,
        lead: legalCopy.privacy.intro,
        sections: [
          {
            heading: legalCopy.privacy.s1Header,
            paragraphs: [legalCopy.privacy.s1Intro],
            bullets: [
              `${legalCopy.privacy.s1LocalStorage.label} ${legalCopy.privacy.s1LocalStorage.text}`,
              `${legalCopy.privacy.s1Firestore.label} ${legalCopy.privacy.s1Firestore.intro}`,
              `${legalCopy.privacy.s1Auth.label} ${legalCopy.privacy.s1Auth.text}`,
              `${legalCopy.privacy.s1ServerLogs.label} ${legalCopy.privacy.s1ServerLogs.text}`,
            ],
          },
          {
            heading: legalCopy.privacy.s2Header,
            paragraphs: [legalCopy.privacy.s2P1, legalCopy.privacy.s2P2],
            bullets: [
              `${legalCopy.privacy.s2AndroidAaid.label} ${legalCopy.privacy.s2AndroidAaid.text}`,
              ...legalCopy.privacy.s2Portals.map((p) => `${p.name}: ${p.url}`),
            ],
          },
          {
            heading: legalCopy.privacy.s3Header,
            paragraphs: [legalCopy.privacy.s3Intro, legalCopy.privacy.s4Text, legalCopy.privacy.s5Text],
          },
        ],
      }),
    },
    {
      route: 'terms',
      title: 'Terms of Service (v1.0.3) — SudokuSync',
      description:
        'Terms of Service, Fair Play policy, Google AdSense & AdMob guidelines, and cloud sync rules for SudokuSync.',
      canonicalUrl: `${SEO_SITE_ORIGIN}/terms`,
      h1: `${legalCopy.terms.title} (Version 1.0.3)`,
      noscriptMainHtml: buildStandaloneMainHtml({
        badge: legalCopy.metaLine,
        h1: `${legalCopy.terms.title} (Version 1.0.3)`,
        lead: legalCopy.terms.intro,
        sections: [
          {
            heading: legalCopy.terms.s1Header,
            paragraphs: [legalCopy.terms.s1Text],
          },
          {
            heading: legalCopy.terms.s2Header,
            paragraphs: [legalCopy.terms.s2Intro],
            bullets: legalCopy.terms.s2Bullets.map((b) => `${b.label} ${b.text}`),
          },
          {
            heading: legalCopy.terms.s3Header,
            paragraphs: [legalCopy.terms.s3Intro],
            bullets: legalCopy.terms.s3Bullets.map((b) => `${b.label} ${b.text}`),
          },
          {
            heading: legalCopy.terms.s5Header,
            paragraphs: [legalCopy.terms.s5Text, legalCopy.terms.s6Text, legalCopy.terms.s7Text],
          },
        ],
      }),
    }
  );

  return routes;
}

function renderStandaloneShellHtml(rootHtml: string, page: StaticStandaloneRoute): string {
  const renderedHtml = applyMetadataToHtmlShell(rootHtml, {
    htmlLang: 'en',
    title: page.title,
    description: page.description,
    canonicalUrl: page.canonicalUrl,
    noscriptInnerHtml: page.noscriptMainHtml,
  });

  if (
    !renderedHtml.includes(page.canonicalUrl) ||
    !renderedHtml.includes('<main ') ||
    !renderedHtml.includes(`<h1>${escapeHtml(page.h1)}</h1>`)
  ) {
    throw new Error(`[SEO-Standalone] Failed to render static shell for /${page.route}`);
  }

  return renderedHtml;
}

function seoSiloStaticShellPlugin(isCapacitorBuild: boolean): Plugin {
  return {
    name: 'seo-silo-static-shells',
    transformIndexHtml(html) {
      return isCapacitorBuild ? stripAdsenseScriptTag(html) : html;
    },
    closeBundle() {
      const outDir = path.resolve(__dirname, 'dist');
      const rootHtmlPath = path.join(outDir, 'index.html');
      if (!fs.existsSync(rootHtmlPath)) return;

      const rootHtml = isCapacitorBuild
        ? stripAdsenseScriptTag(fs.readFileSync(rootHtmlPath, 'utf8'))
        : fs.readFileSync(rootHtmlPath, 'utf8');

      if (isCapacitorBuild) {
        fs.writeFileSync(rootHtmlPath, rootHtml, 'utf8');
      }

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

      // 3. Emit dedicated static shells for standalone content, guide & legal routes
      const standaloneRoutes = buildStandaloneRoutes();
      for (const page of standaloneRoutes) {
        const pageHtml = renderStandaloneShellHtml(rootHtml, page);
        const pageDir = path.join(outDir, ...page.route.split('/'));
        fs.mkdirSync(pageDir, { recursive: true });
        fs.writeFileSync(path.join(pageDir, 'index.html'), pageHtml, 'utf8');
      }

      console.log(
        `[SEO-Silo] Emitted ${emittedMultilangCount} multilingual shells + ${SEO_SILO_ORDER.length} root aliases + ${standaloneRoutes.length} standalone route shells (capacitor=${isCapacitorBuild})`
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true' || mode === 'capacitor';
  return {
    base: '/',
    plugins: [react(), tailwindcss(), seoSiloStaticShellPlugin(isCapacitorBuild)],
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
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        ignored: ['**/android/**', '**/scratch/**'],
      },
    },
  };
});
