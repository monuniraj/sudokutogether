import React from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Calculator,
  Calendar,
  CheckCircle2,
  Clock,
  HelpCircle,
  Info,
  Lightbulb,
  Play,
  Sparkles,
  Users,
} from "lucide-react";
import { HOME_NAV_LABELS, useTranslation } from "../../../i18n/useTranslation";
import type { Language } from "../../../i18n/translations";
import {
  GUIDE_PATHS,
  GUIDE_SLUGS,
  getGuideCopy,
  type GuideSlug,
} from "../../../utils/guidesTranslations";

export interface GuideArticleScreenProps {
  slug: GuideSlug;
  darkMode: boolean;
  language?: Language;
  onStartDifficulty: (difficulty: "EASY" | "MEDIUM" | "HARD" | "EXPERT") => void;
  onOpenDailyChallenge: () => void;
  onOpenSolver: () => void;
  onOpenMultiplayer: () => void;
  onNavigateRoute: (path: string) => void;
  onBackHome: () => void;
}

const SLUG_HERO_META: Record<
  GuideSlug,
  {
    lightCard: string;
    darkCard: string;
    lightBadge: string;
    darkBadge: string;
  }
> = {
  "multiplayer-sudoku": {
    lightCard: "bg-[#FAF5FF] text-[#3B0764] shadow-[0_14px_38px_rgba(107,33,168,0.06)]",
    darkCard: "bg-[#2e1065]/45 text-purple-100 shadow-[0_14px_38px_rgba(0,0,0,0.42)]",
    lightBadge: "bg-[#EDE9FE] text-[#5B21B6]",
    darkBadge: "bg-purple-800/70 text-purple-100",
  },
  "beginner-sudoku": {
    lightCard: "bg-[#ECFDF5] text-[#064E3B] shadow-[0_14px_38px_rgba(5,150,105,0.06)]",
    darkCard: "bg-[#022c22]/55 text-emerald-100 shadow-[0_14px_38px_rgba(0,0,0,0.42)]",
    lightBadge: "bg-[#D1FAE5] text-[#065F46]",
    darkBadge: "bg-emerald-800/70 text-emerald-100",
  },
  "advanced-patterns": {
    lightCard: "bg-[#F0F9FF] text-[#0C4A6E] shadow-[0_14px_38px_rgba(3,105,161,0.06)]",
    darkCard: "bg-[#0c4a6e]/35 text-sky-100 shadow-[0_14px_38px_rgba(0,0,0,0.42)]",
    lightBadge: "bg-[#E0F2FE] text-[#0369A1]",
    darkBadge: "bg-sky-800/70 text-sky-100",
  },
};

export const GuideArticleScreen: React.FC<GuideArticleScreenProps> = ({
  slug,
  darkMode,
  language: languageProp,
  onStartDifficulty,
  onOpenDailyChallenge,
  onOpenSolver,
  onOpenMultiplayer,
  onNavigateRoute,
  onBackHome,
}) => {
  const { language: hookLanguage } = useTranslation();
  const language = languageProp || hookLanguage;
  const copy = getGuideCopy(language, slug);
  const heroPalette = SLUG_HERO_META[slug];

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string
  ) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    e.preventDefault();
    onNavigateRoute(path);
  };

  const renderHeroIcon = () => {
    if (slug === "multiplayer-sudoku") {
      return <Users className="w-3.5 h-3.5 shrink-0" />;
    }
    if (slug === "beginner-sudoku") {
      return <BookOpen className="w-3.5 h-3.5 shrink-0" />;
    }
    return <Sparkles className="w-3.5 h-3.5 shrink-0" />;
  };

  const siblingGuides = GUIDE_SLUGS.filter((candidate) => candidate !== slug).map(
    (candidate) => ({
      slug: candidate,
      href: GUIDE_PATHS[candidate],
      label:
        candidate === "multiplayer-sudoku"
          ? copy.linkLabels.multiplayerGuide
          : candidate === "beginner-sudoku"
            ? copy.linkLabels.beginnerGuide
            : copy.linkLabels.advancedGuide,
    })
  );

  const surfaceCardCls = darkMode
    ? "bg-zinc-900/90 text-zinc-100 shadow-[0_10px_32px_rgba(0,0,0,0.36)]"
    : "bg-white/95 text-stone-800 shadow-[0_10px_32px_rgba(15,23,42,0.05)]";

  return (
    <main className="w-full h-full overflow-y-auto px-4 sm:px-6 pb-12 pt-[calc(84px+env(safe-area-inset-top,0px))] lg:pt-[92px] select-text">
      <article className="max-w-3xl mx-auto space-y-5">
        {/* Hero Header */}
        <header
          className={`p-6 sm:p-8 rounded-3xl border-0 space-y-3 transition-colors ${
            darkMode ? heroPalette.darkCard : heroPalette.lightCard
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-0 text-xs font-bold tracking-wide uppercase ${
                darkMode ? heroPalette.darkBadge : heroPalette.lightBadge
              }`}
            >
              {renderHeroIcon()}
              <span>{copy.badge}</span>
            </span>

            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-0 text-xs font-semibold ${
                darkMode
                  ? "bg-black/25 text-zinc-200"
                  : "bg-white/80 text-stone-700 shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
              }`}
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>{copy.readTimeLabel}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            {copy.title}
          </h1>
          <p className="text-sm sm:text-base leading-relaxed opacity-90">
            {copy.subtitle}
          </p>
        </header>

        {/* Structured Editorial Sections */}
        <div className="space-y-4">
          {copy.sections.map((section, idx) => (
            <section
              key={section.heading}
              className={`p-5 sm:p-6 rounded-3xl border-0 space-y-3 transition-colors ${surfaceCardCls}`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-7 h-7 rounded-xl border-0 flex items-center justify-center text-xs font-black shrink-0 ${
                    darkMode
                      ? "bg-sky-500/20 text-sky-300"
                      : "bg-sky-50 text-sky-800 shadow-[0_2px_6px_rgba(14,116,144,0.06)]"
                  }`}
                >
                  {idx + 1}
                </span>
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-stone-900 dark:text-zinc-50">
                  {section.heading}
                </h2>
              </div>

              <div className="space-y-2.5 text-sm leading-relaxed text-stone-700 dark:text-zinc-300">
                {section.paragraphs.map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}
              </div>

              {section.bullets && section.bullets.length > 0 && (
                <ul className="space-y-2 pt-1">
                  {section.bullets.map((bullet, bIdx) => (
                    <li
                      key={bIdx}
                      className={`flex items-start gap-2.5 p-3 rounded-2xl border-0 text-xs sm:text-sm leading-relaxed list-none ${
                        darkMode
                          ? "bg-zinc-800/75 text-zinc-200"
                          : "bg-stone-50/90 text-stone-700 shadow-[0_2px_10px_rgba(15,23,42,0.03)]"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* Pro Tip Highlight Card */}
        <aside
          className={`p-5 sm:p-6 rounded-3xl border-0 space-y-2 ${
            darkMode
              ? "bg-amber-500/12 text-amber-100 shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
              : "bg-amber-50/90 text-amber-950 shadow-[0_10px_30px_rgba(217,119,6,0.07)]"
          }`}
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-300" />
            <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide">
              {copy.proTipTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed opacity-95">
            {copy.proTipBody}
          </p>
        </aside>

        {/* Direct Practice CTAs */}
        <section
          className={`p-5 sm:p-6 rounded-3xl border-0 space-y-4 ${surfaceCardCls}`}
        >
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-extrabold tracking-tight text-stone-900 dark:text-zinc-50">
              {copy.practiceTitle}
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {(
              [
                {
                  diff: "EASY" as const,
                  label: copy.practiceLabels.easy,
                  cls: darkMode
                    ? "bg-emerald-900/50 hover:bg-emerald-800/70 text-emerald-200"
                    : "bg-[#D1FAE5] hover:bg-[#A7F3D0] text-[#065F46] shadow-[0_4px_12px_rgba(5,150,105,0.08)]",
                },
                {
                  diff: "MEDIUM" as const,
                  label: copy.practiceLabels.medium,
                  cls: darkMode
                    ? "bg-amber-900/50 hover:bg-amber-800/70 text-amber-200"
                    : "bg-[#FEF08A]/85 hover:bg-[#FDE047]/85 text-[#854D0E] shadow-[0_4px_12px_rgba(217,119,6,0.08)]",
                },
                {
                  diff: "HARD" as const,
                  label: copy.practiceLabels.hard,
                  cls: darkMode
                    ? "bg-purple-900/50 hover:bg-purple-800/70 text-purple-200"
                    : "bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#6B21A8] shadow-[0_4px_12px_rgba(124,58,237,0.08)]",
                },
                {
                  diff: "EXPERT" as const,
                  label: copy.practiceLabels.expert,
                  cls: darkMode
                    ? "bg-rose-900/50 hover:bg-rose-800/70 text-rose-200"
                    : "bg-[#FFE4E6] hover:bg-[#FECDD3] text-[#9D174D] shadow-[0_4px_12px_rgba(225,29,72,0.08)]",
                },
              ] as const
            ).map((btn) => (
              <button
                key={btn.diff}
                type="button"
                onClick={() => onStartDifficulty(btn.diff)}
                className={`px-3 py-2.5 rounded-2xl border-0 text-xs font-bold transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${btn.cls}`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={onOpenDailyChallenge}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border-0 text-xs font-bold transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                darkMode
                  ? "bg-indigo-900/55 hover:bg-indigo-800/70 text-indigo-200"
                  : "bg-[#E0E7FF] hover:bg-[#C7D2FE] text-[#3730A3] shadow-[0_4px_12px_rgba(79,70,229,0.08)]"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>{copy.practiceLabels.daily}</span>
            </button>

            <button
              type="button"
              onClick={onOpenMultiplayer}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border-0 text-xs font-bold transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
                darkMode
                  ? "bg-purple-900/55 hover:bg-purple-800/70 text-purple-200"
                  : "bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#6B21A8] shadow-[0_4px_12px_rgba(107,33,168,0.08)]"
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>{copy.practiceLabels.multiplayer}</span>
            </button>

            <button
              type="button"
              onClick={onOpenSolver}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border-0 text-xs font-bold transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                darkMode
                  ? "bg-teal-900/55 hover:bg-teal-800/70 text-teal-200"
                  : "bg-[#CCFBF1] hover:bg-[#99F6E4] text-[#115E59] shadow-[0_4px_12px_rgba(13,148,136,0.08)]"
              }`}
            >
              <Calculator className="w-3.5 h-3.5 shrink-0" />
              <span>{copy.linkLabels.solver}</span>
            </button>
          </div>
        </section>

        {/* FAQs */}
        <section
          className={`p-5 sm:p-6 rounded-3xl border-0 space-y-3 ${surfaceCardCls}`}
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 shrink-0 text-sky-600 dark:text-sky-400" />
            <h2 className="text-base font-extrabold tracking-tight text-stone-900 dark:text-zinc-50">
              {copy.faqTitle}
            </h2>
          </div>

          <div className="space-y-2.5">
            {copy.faqs.map((item) => (
              <div
                key={item.question}
                className={`p-4 rounded-2xl border-0 space-y-1.5 ${
                  darkMode
                    ? "bg-zinc-800/70 text-zinc-200"
                    : "bg-sky-50/75 text-stone-800 shadow-[0_2px_10px_rgba(14,116,144,0.04)]"
                }`}
              >
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-zinc-100">
                  {item.question}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-stone-600 dark:text-zinc-300">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Contextual Internal Cross-Links */}
        <nav
          aria-label={copy.relatedLinksTitle}
          className={`p-5 sm:p-6 rounded-3xl border-0 space-y-3 ${
            darkMode
              ? "bg-zinc-900/90 text-zinc-200 shadow-[0_10px_32px_rgba(0,0,0,0.36)]"
              : "bg-sky-50/65 text-stone-800 shadow-[0_10px_32px_rgba(14,116,144,0.05)]"
          }`}
        >
          <h2 className="text-sm sm:text-base font-extrabold tracking-tight">
            {copy.relatedLinksTitle}
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-stone-600 dark:text-zinc-300">
            {copy.crossLinkIntro}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <a
              href="/rules"
              onClick={(e) => handleLinkClick(e, "/rules")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-0 text-xs font-semibold no-underline transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
                darkMode
                  ? "bg-purple-500/20 text-purple-200 hover:bg-purple-500/30"
                  : "bg-white text-[#6B21A8] hover:bg-purple-50 shadow-[0_2px_8px_rgba(107,33,168,0.08)]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>{copy.linkLabels.rules}</span>
              <ArrowUpRight className="w-3 h-3 shrink-0 opacity-75" />
            </a>

            {siblingGuides.map((sib) => (
              <a
                key={sib.slug}
                href={sib.href}
                onClick={(e) => handleLinkClick(e, sib.href)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-0 text-xs font-semibold no-underline transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                  darkMode
                    ? "bg-sky-500/20 text-sky-200 hover:bg-sky-500/30"
                    : "bg-white text-[#0369A1] hover:bg-sky-100/70 shadow-[0_2px_8px_rgba(3,105,161,0.08)]"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>{sib.label}</span>
                <ArrowUpRight className="w-3 h-3 shrink-0 opacity-75" />
              </a>
            ))}

            <a
              href="/daily-challenge"
              onClick={(e) => handleLinkClick(e, "/daily-challenge")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-0 text-xs font-semibold no-underline transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                darkMode
                  ? "bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30"
                  : "bg-white text-[#4338CA] hover:bg-indigo-50 shadow-[0_2px_8px_rgba(79,70,229,0.08)]"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>{copy.linkLabels.daily}</span>
            </a>

            <a
              href="/solver"
              onClick={(e) => handleLinkClick(e, "/solver")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-0 text-xs font-semibold no-underline transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                darkMode
                  ? "bg-teal-500/20 text-teal-200 hover:bg-teal-500/30"
                  : "bg-white text-[#0F766E] hover:bg-teal-50 shadow-[0_2px_8px_rgba(13,148,136,0.08)]"
              }`}
            >
              <Calculator className="w-3.5 h-3.5 shrink-0" />
              <span>{copy.linkLabels.solver}</span>
            </a>

            <a
              href="/about"
              onClick={(e) => handleLinkClick(e, "/about")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-0 text-xs font-semibold no-underline transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                darkMode
                  ? "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                  : "bg-white text-stone-700 hover:bg-stone-100 shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
              }`}
            >
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>{copy.linkLabels.about}</span>
            </a>
          </div>
        </nav>

        {/* Bottom Back Strip */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
          <button
            type="button"
            onClick={onBackHome}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border-0 text-xs font-bold transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
              darkMode
                ? "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 shadow-[0_4px_12px_rgba(0,0,0,0.24)]"
                : "bg-sky-50 text-sky-900 hover:bg-sky-100 shadow-[0_4px_12px_rgba(14,116,144,0.07)]"
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{HOME_NAV_LABELS[language] || HOME_NAV_LABELS.en}</span>
          </button>

          <span className="text-[11px] font-mono text-stone-400 dark:text-stone-500">
            SudokuSync • v1.0.3
          </span>
        </div>
      </article>
    </main>
  );
};

