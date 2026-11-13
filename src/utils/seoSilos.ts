import {
  SEO_LANGUAGES,
  SEO_UI_STRINGS,
  LOCALIZED_SEO_SILOS,
  type SeoLanguage,
  type SeoDifficulty,
  type SeoLanguageMeta,
  type SeoUiStrings,
  type LocalizedSiloContent,
} from "./seoTranslations";

export {
  SEO_LANGUAGES,
  SEO_UI_STRINGS,
  LOCALIZED_SEO_SILOS,
  type SeoLanguage,
  type SeoDifficulty,
  type SeoLanguageMeta,
  type SeoUiStrings,
  type LocalizedSiloContent,
};

export interface DifficultySiloConfig extends LocalizedSiloContent {
  language: SeoLanguage;
  htmlLang: string;
  difficulty: SeoDifficulty;
  slug: "easy" | "medium" | "hard" | "expert";
  path: string;
  canonicalUrl: string;
  clueCount: number;
  emptyCells: number;
}

export interface ParsedSeoPath {
  language: SeoLanguage;
  difficulty: SeoDifficulty;
  hasExplicitLanguage: boolean;
  hasExplicitDifficulty: boolean;
}

export const SEO_SITE_ORIGIN = "https://sudokusync.com";

export const SEO_SILO_ORDER: readonly SeoDifficulty[] = [
  "EASY",
  "MEDIUM",
  "HARD",
  "EXPERT",
];

const DIFFICULTY_SPECS: Record<
  SeoDifficulty,
  { slug: "easy" | "medium" | "hard" | "expert"; clueCount: number; emptyCells: number }
> = {
  EASY: { slug: "easy", clueCount: 51, emptyCells: 30 },
  MEDIUM: { slug: "medium", clueCount: 39, emptyCells: 42 },
  HARD: { slug: "hard", clueCount: 30, emptyCells: 51 },
  EXPERT: { slug: "expert", clueCount: 25, emptyCells: 56 },
};

const LANGUAGE_META_BY_CODE: Record<SeoLanguage, SeoLanguageMeta> = SEO_LANGUAGES.reduce(
  (acc, item) => {
    acc[item.code] = item;
    return acc;
  },
  {} as Record<SeoLanguage, SeoLanguageMeta>
);

export function normalizeSeoLanguage(raw?: string | null): SeoLanguage | null {
  if (!raw) return null;
  const cleaned = raw.trim().toLowerCase();
  if (cleaned === "en") return "en";
  if (cleaned === "hi") return "hi";
  if (cleaned === "de") return "de";
  if (cleaned === "ja") return "ja";
  if (cleaned === "ko") return "ko";
  if (cleaned === "es") return "es";
  if (cleaned === "fr") return "fr";
  if (cleaned === "it") return "it";
  if (cleaned === "pt-br" || cleaned === "pt") return "pt-BR";
  return null;
}

export function normalizeSeoDifficulty(raw?: string | null): SeoDifficulty | null {
  if (!raw) return null;
  const cleaned = raw.trim().toLowerCase();
  if (cleaned === "easy") return "EASY";
  if (cleaned === "medium") return "MEDIUM";
  if (cleaned === "hard") return "HARD";
  if (cleaned === "expert") return "EXPERT";
  return null;
}

export function getLanguageUrlSlug(lang: SeoLanguage = "en"): string {
  return (LANGUAGE_META_BY_CODE[lang] || LANGUAGE_META_BY_CODE.en).urlSlug;
}

export function getLanguageHtmlLang(lang: SeoLanguage = "en"): string {
  return (LANGUAGE_META_BY_CODE[lang] || LANGUAGE_META_BY_CODE.en).htmlLang;
}

export function getSeoPath(lang: SeoLanguage = "en", difficulty: SeoDifficulty = "EASY"): string {
  const safeLang = LANGUAGE_META_BY_CODE[lang] ? lang : "en";
  const spec = DIFFICULTY_SPECS[difficulty] || DIFFICULTY_SPECS.EASY;
  return `/${getLanguageUrlSlug(safeLang)}/${spec.slug}`;
}

export function getSeoCanonicalUrl(
  lang: SeoLanguage = "en",
  difficulty: SeoDifficulty = "EASY"
): string {
  return `${SEO_SITE_ORIGIN}${getSeoPath(lang, difficulty)}`;
}

export function getSeoUiStrings(lang: SeoLanguage = "en"): SeoUiStrings {
  return SEO_UI_STRINGS[lang] || SEO_UI_STRINGS.en;
}

export function getRootSeoMeta(lang: SeoLanguage = "en"): {
  language: SeoLanguage;
  htmlLang: string;
  canonicalUrl: string;
  title: string;
  description: string;
} {
  const safeLang = LANGUAGE_META_BY_CODE[lang] ? lang : "en";
  const ui = getSeoUiStrings(safeLang);
  return {
    language: safeLang,
    htmlLang: getLanguageHtmlLang(safeLang),
    canonicalUrl: `${SEO_SITE_ORIGIN}/`,
    title: ui.rootTitle,
    description: ui.rootDescription,
  };
}

export const SEO_ROOT_META = {
  canonicalUrl: `${SEO_SITE_ORIGIN}/`,
  title: SEO_UI_STRINGS.en.rootTitle,
  description: SEO_UI_STRINGS.en.rootDescription,
} as const;

export function getLocalizedSeoSilo(
  difficulty: SeoDifficulty,
  lang: SeoLanguage = "en"
): DifficultySiloConfig {
  const safeLang = LANGUAGE_META_BY_CODE[lang] ? lang : "en";
  const safeDiff = DIFFICULTY_SPECS[difficulty] ? difficulty : "EASY";
  const spec = DIFFICULTY_SPECS[safeDiff];
  const content =
    (LOCALIZED_SEO_SILOS[safeLang] && LOCALIZED_SEO_SILOS[safeLang][safeDiff]) ||
    LOCALIZED_SEO_SILOS.en[safeDiff];

  return {
    ...content,
    language: safeLang,
    htmlLang: getLanguageHtmlLang(safeLang),
    difficulty: safeDiff,
    slug: spec.slug,
    clueCount: spec.clueCount,
    emptyCells: spec.emptyCells,
    path: getSeoPath(safeLang, safeDiff),
    canonicalUrl: getSeoCanonicalUrl(safeLang, safeDiff),
  };
}

export const SEO_SILO_MAP: Record<SeoDifficulty, DifficultySiloConfig> = {
  EASY: getLocalizedSeoSilo("EASY", "en"),
  MEDIUM: getLocalizedSeoSilo("MEDIUM", "en"),
  HARD: getLocalizedSeoSilo("HARD", "en"),
  EXPERT: getLocalizedSeoSilo("EXPERT", "en"),
};

/**
 * Parses `/[lang]/[diff]`, `/[diff]`, or `/[lang]` URL paths cleanly.
 * Always falls back to `{ language: "en", difficulty: "EASY" }` when segments are absent.
 */
export function parseDifficultyFromPath(pathname?: string | null): ParsedSeoPath {
  const fallback: ParsedSeoPath = {
    language: "en",
    difficulty: "EASY",
    hasExplicitLanguage: false,
    hasExplicitDifficulty: false,
  };
  if (!pathname) return fallback;

  const segments = pathname
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);

  if (segments.length > 0 && segments[segments.length - 1].toLowerCase() === "index.html") {
    segments.pop();
  }

  if (segments.length === 0) return fallback;

  const firstLang = normalizeSeoLanguage(segments[0]);
  if (firstLang) {
    const secondDiff = segments.length > 1 ? normalizeSeoDifficulty(segments[1]) : null;
    return {
      language: firstLang,
      difficulty: secondDiff || "EASY",
      hasExplicitLanguage: true,
      hasExplicitDifficulty: Boolean(secondDiff),
    };
  }

  const firstDiff = normalizeSeoDifficulty(segments[0]);
  if (firstDiff) {
    return {
      language: "en",
      difficulty: firstDiff,
      hasExplicitLanguage: false,
      hasExplicitDifficulty: true,
    };
  }

  return fallback;
}

export function getDifficultyPath(difficulty: SeoDifficulty, lang: SeoLanguage = "en"): string {
  return getSeoPath(lang, difficulty);
}

export function getDifficultyCanonicalUrl(
  difficulty: SeoDifficulty,
  lang: SeoLanguage = "en"
): string {
  return getSeoCanonicalUrl(lang, difficulty);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildStaticNoscriptHtml(
  config: DifficultySiloConfig,
  lang?: SeoLanguage
): string {
  const activeLang = lang || config.language || "en";
  const localizedConfig = getLocalizedSeoSilo(config.difficulty, activeLang);
  const ui = getSeoUiStrings(activeLang);

  const techniquesHtml = localizedConfig.primaryTechniques
    .map((tech) => `<li>${escapeHtml(tech)}</li>`)
    .join("\n        ");
  const strategyHtml = localizedConfig.strategyParagraphs
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("\n      ");
  const tipsHtml = localizedConfig.tips
    .map((tip) => `<li>${escapeHtml(tip)}</li>`)
    .join("\n        ");
  const faqsHtml = localizedConfig.faqs
    .map(
      (faq) =>
        `<h3>${escapeHtml(faq.q)}</h3>\n      <p>${escapeHtml(faq.a)}</p>`
    )
    .join("\n      ");

  const siloNavLinks = SEO_SILO_ORDER.map((lvl) => {
    const item = getLocalizedSeoSilo(lvl, activeLang);
    return `<a href="${item.path}" style="color: #0369a1; text-decoration: underline;">${escapeHtml(item.crossLinkLabel)} (${item.clueCount})</a>`;
  }).join(" | ");

  const langNavLinks = SEO_LANGUAGES.map((langOpt) => {
    const langPath = getSeoPath(langOpt.code, localizedConfig.difficulty);
    return `<a href="${langPath}" hreflang="${escapeHtml(langOpt.htmlLang)}" style="color: #0369a1; text-decoration: underline;">${escapeHtml(langOpt.nativeName)}</a>`;
  }).join(" | ");

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 2rem; max-width: 820px; margin: 0 auto; line-height: 1.65; color: #1e1e1e; background-color: #fdfbf7;">
      <h1>${escapeHtml(localizedConfig.h1)}</h1>
      <p><strong>${escapeHtml(ui.gridSpecLabel)}:</strong> ${localizedConfig.clueCount} ${escapeHtml(ui.startingCluesWord)}, ${localizedConfig.emptyCells} ${escapeHtml(ui.emptyCellsWord)} &mdash; ${escapeHtml(localizedConfig.targetAudience)}.</p>
      <p>${escapeHtml(localizedConfig.leadSummary)}</p>
      <h2>${escapeHtml(localizedConfig.strategyHeading)}</h2>
      ${strategyHtml}
      <h2>${escapeHtml(ui.coreTechniquesTitle)}</h2>
      <ul>
        ${techniquesHtml}
      </ul>
      <h2>${escapeHtml(ui.quickChecklistTitle)}</h2>
      <ul>
        ${tipsHtml}
      </ul>
      <h2>${escapeHtml(localizedConfig.crossLinkLabel)} &mdash; ${escapeHtml(ui.faqSectionSuffix)}</h2>
      ${faqsHtml}
      <nav aria-label="${escapeHtml(ui.browseAllDifficultiesLabel)}" style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
        <strong>${escapeHtml(ui.browseAllDifficultiesLabel)}:</strong> ${siloNavLinks}
      </nav>
      <nav aria-label="${escapeHtml(ui.languageEditionsLabel)}" style="margin-top: 0.75rem; display: flex; flex-wrap: wrap; gap: 0.5rem;">
        <strong>${escapeHtml(ui.languageEditionsLabel)}:</strong> ${langNavLinks}
      </nav>
      <footer style="margin-top: 1.5rem; display: flex; flex-wrap: wrap; gap: 1rem; align-items: center;">
        <a href="/" style="color: #0369a1; text-decoration: underline;">${escapeHtml(ui.homeLinkLabel)}</a> |
        <a href="/rules" style="color: #0369a1; text-decoration: underline;">Sudoku Rules</a> |
        <a href="/daily-challenge" style="color: #0369a1; text-decoration: underline;">Daily Challenge</a> |
        <a href="/solver" style="color: #0369a1; text-decoration: underline;">Sudoku Solver</a> |
        <a href="/about" style="color: #0369a1; text-decoration: underline;">${escapeHtml(ui.aboutLinkLabel)}</a> |
        <a href="/contact" style="color: #0369a1; text-decoration: underline;">${escapeHtml(ui.contactLinkLabel)}</a> |
        <a href="/privacy" style="color: #0369a1; text-decoration: underline;">${escapeHtml(ui.privacyLinkLabel)}</a> |
        <a href="/terms" style="color: #0369a1; text-decoration: underline;">${escapeHtml(ui.termsLinkLabel)}</a>
        <span style="opacity: 0.8; font-family: monospace; font-size: 11px; margin-left: 0.5rem;">${escapeHtml(ui.allRightsReserved)}</span>
      </footer>
    </div>
  `.trim();
}
