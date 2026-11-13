import React from "react";
import {
  Brain,
  Calendar,
  Flame,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useTranslation } from "../../../i18n/useTranslation";
import {
  getDailyArticleCopy,
  type DailyRichText,
} from "../../../utils/dailyArticleTranslations";

interface DailySEOArticleProps {
  darkMode: boolean;
  onNavigateSolver?: () => void;
  onNavigateRules?: () => void;
}

function renderDailyRichText(segments: DailyRichText): React.ReactNode {
  return segments.map((seg, idx) => {
    if (seg.code) {
      return <code key={idx}>{seg.text}</code>;
    }
    if (seg.strong) {
      return <strong key={idx}>{seg.text}</strong>;
    }
    return <React.Fragment key={idx}>{seg.text}</React.Fragment>;
  });
}

/**
 * Semantic HTML ("Iceberg") content below the Daily Challenge screen.
 * Preserves borderless, shadowless pastel surfaces, Dark Mode support,
 * and localized copy (`en` / Hinglish `hi`).
 */
export const DailySEOArticle: React.FC<DailySEOArticleProps> = ({
  darkMode,
  onNavigateSolver,
  onNavigateRules,
}) => {
  const { language } = useTranslation();
  const copy = getDailyArticleCopy(language);

  const handleSolverClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!onNavigateSolver) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onNavigateSolver();
  };

  const handleRulesClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!onNavigateRules) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onNavigateRules();
  };

  const cardSurface = darkMode
    ? "bg-zinc-900/60 text-zinc-200"
    : "bg-white/85 text-slate-700";

  const mutedText = darkMode ? "text-zinc-400" : "text-slate-600";
  const headingText = darkMode ? "text-zinc-100" : "text-slate-800";

  const tierSurfaceClasses = [
    darkMode ? "bg-[#064e3b]/35" : "bg-[#D1FAE5]/65",
    darkMode ? "bg-[#713f12]/35" : "bg-[#FEF3C7]/75",
    darkMode ? "bg-[#3b0764]/40" : "bg-[#F3E8FF]/80",
    darkMode ? "bg-[#4c0519]/45" : "bg-[#FFE4E6]/80",
  ] as const;

  const whatIsDotClasses = [
    darkMode ? "bg-indigo-400" : "bg-indigo-500",
    darkMode ? "bg-teal-400" : "bg-teal-500",
  ] as const;

  return (
    <article
      id="daily-challenge-seo-article"
      aria-label={copy.articleAriaLabel}
      className="w-full max-w-3xl mx-auto mt-8 sm:mt-10 pb-12 px-1 sm:px-0 space-y-6 select-text"
    >
      {/* 1. What is the Daily Sudoku Challenge? */}
      <section className={`rounded-3xl p-6 sm:p-8 border-0 shadow-none ${cardSurface}`}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              darkMode ? "bg-[#312e81]/70 text-[#c7d2fe]" : "bg-[#E0E7FF] text-[#3730A3]"
            }`}
          >
            <Calendar className="w-5 h-5" />
          </div>
          <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${headingText}`}>
            {copy.whatIsHeading}
          </h2>
        </div>

        <div className="space-y-3.5 text-sm sm:text-[15px] leading-relaxed">
          <p>{renderDailyRichText(copy.whatIsP1)}</p>
          <p>{renderDailyRichText(copy.whatIsP2)}</p>
          <ul className="space-y-2.5 pt-1">
            {copy.whatIsBullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span
                  className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                    whatIsDotClasses[idx] ?? whatIsDotClasses[0]
                  }`}
                />
                <span>{renderDailyRichText(bullet)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 2. Weekly Difficulty Scaling */}
      <section className={`rounded-3xl p-6 sm:p-8 border-0 shadow-none ${cardSurface}`}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              darkMode ? "bg-[#3b0764]/70 text-[#e9d5ff]" : "bg-[#F3E8FF] text-[#6B21A8]"
            }`}
          >
            <TrendingUp className="w-5 h-5" />
          </div>
          <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${headingText}`}>
            {copy.scalingHeading}
          </h2>
        </div>

        <p className="text-sm sm:text-[15px] leading-relaxed mb-5">
          {renderDailyRichText(copy.scalingIntro)}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {copy.scalingTiers.map((tier, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-4 sm:p-5 border-0 shadow-none ${
                tierSurfaceClasses[idx] ?? tierSurfaceClasses[0]
              }`}
            >
              <h3 className={`text-sm sm:text-base font-bold mb-1.5 ${headingText}`}>
                {tier.title}
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${mutedText}`}>
                {renderDailyRichText(tier.body)}
              </p>
            </div>
          ))}
        </div>

        <div
          className={`mt-4 rounded-2xl p-4 sm:p-5 border-0 shadow-none flex items-start gap-3 ${
            darkMode ? "bg-zinc-800/75" : "bg-[#F4EFE6]/90"
          }`}
        >
          <Sparkles
            className={`w-5 h-5 shrink-0 mt-0.5 ${
              darkMode ? "text-amber-300" : "text-amber-700"
            }`}
          />
          <div>
            <h3 className={`text-sm sm:text-base font-bold mb-1 ${headingText}`}>
              {copy.sundayMasterCard.title}
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${mutedText}`}>
              {renderDailyRichText(copy.sundayMasterCard.body)}
            </p>
          </div>
        </div>

        <p className="mt-5 text-sm sm:text-[15px] leading-relaxed">
          {copy.crossLinkPrefix}
          <a
            href="/solver"
            onClick={handleSolverClick}
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
          >
            {copy.crossLinkLabel}
          </a>
          {copy.crossLinkSuffix}
        </p>

        <p className="mt-3 text-sm sm:text-[15px] leading-relaxed">
          {copy.crossLinkRulesPrefix}
          <a
            href="/rules"
            onClick={handleRulesClick}
            className="inline-block rounded-md px-0.5 text-purple-700 dark:text-purple-300 hover:underline font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          >
            {copy.crossLinkRulesLabel}
          </a>
          {copy.crossLinkRulesSuffix}
        </p>
      </section>

      {/* 3. Building a Streak & Brain Training */}
      <section className={`rounded-3xl p-6 sm:p-8 border-0 shadow-none ${cardSurface}`}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              darkMode ? "bg-[#064e3b]/70 text-[#a7f3d0]" : "bg-[#CCFBF1] text-[#0F766E]"
            }`}
          >
            <Brain className="w-5 h-5" />
          </div>
          <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${headingText}`}>
            {copy.streakHeading}
          </h2>
        </div>

        <div className="space-y-3.5 text-sm sm:text-[15px] leading-relaxed">
          <p>{renderDailyRichText(copy.streakP1)}</p>
          <p>{renderDailyRichText(copy.streakP2)}</p>
          <ul className="space-y-2.5 pt-1">
            <li className="flex items-start gap-2.5">
              <Flame
                className={`w-4 h-4 shrink-0 mt-1 ${
                  darkMode ? "text-amber-400" : "text-amber-600"
                }`}
              />
              <span>{renderDailyRichText(copy.streakBullets[0])}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <ShieldCheck
                className={`w-4 h-4 shrink-0 mt-1 ${
                  darkMode ? "text-teal-400" : "text-teal-600"
                }`}
              />
              <span>{renderDailyRichText(copy.streakBullets[1])}</span>
            </li>
          </ul>
        </div>
      </section>

      {/* 3.5 Desktop Speed-Solving Keyboard Guide */}
      <section
        aria-labelledby="daily-keyboard-heading"
        className={`rounded-3xl p-6 sm:p-8 border-0 shadow-none ${
          darkMode ? "bg-[#0c4a6e]/30 text-sky-50" : "bg-[#F0F9FF]/90 text-slate-800"
        }`}
      >
        <h2
          id="daily-keyboard-heading"
          className={`text-xl sm:text-2xl font-black tracking-tight mb-3 ${headingText}`}
        >
          {copy.keyboardHeading}
        </h2>

        <p className="text-sm sm:text-[15px] leading-relaxed mb-5">
          {renderDailyRichText(copy.keyboardIntro)}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {copy.keyboardShortcuts.map((item, idx) => {
            const tileClasses = darkMode
              ? [
                  "bg-[#1e1b4b]/55 text-indigo-100",
                  "bg-[#4c0519]/45 text-rose-100",
                  "bg-[#451a03]/45 text-amber-100",
                  "bg-[#064e3b]/40 text-emerald-100",
                  "bg-[#3b0764]/45 text-purple-100",
                  "bg-[#0c4a6e]/45 text-sky-100",
                ]
              : [
                  "bg-[#EEF2FF]/90 text-[#312E81]",
                  "bg-[#FFE4E6]/75 text-[#881337]",
                  "bg-[#FEF3C7]/80 text-[#713F12]",
                  "bg-[#D1FAE5]/70 text-[#065F46]",
                  "bg-[#F3E8FF]/85 text-[#581C87]",
                  "bg-[#E0F2FE]/85 text-[#0C4A6E]",
                ];
            return (
              <div
                key={idx}
                className={`rounded-2xl p-4 border-0 shadow-[0_4px_16px_rgba(0,0,0,0.02)] ${tileClasses[idx % tileClasses.length]}`}
              >
                <kbd
                  className={`inline-flex items-center px-2.5 py-1 rounded-xl border-0 font-mono text-[11px] font-bold shadow-[0_2px_8px_rgba(15,23,42,0.05)] ${
                    darkMode ? "bg-black/35 text-white" : "bg-white/90 text-slate-800"
                  }`}
                >
                  {item.keys}
                </kbd>
                <h3 className="mt-2.5 text-sm font-extrabold">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed opacity-90">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Daily Challenge FAQs */}
      <section className={`rounded-3xl p-6 sm:p-8 border-0 shadow-none ${cardSurface}`}>
        <div className="flex items-center gap-3 mb-5">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              darkMode ? "bg-[#4c0519]/70 text-[#fecdd3]" : "bg-[#FFE4E6] text-[#9D174D]"
            }`}
          >
            <HelpCircle className="w-5 h-5" />
          </div>
          <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${headingText}`}>
            {copy.faqHeading}
          </h2>
        </div>

        <div className="space-y-4">
          {copy.faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-4 sm:p-5 border-0 shadow-none ${
                darkMode ? "bg-zinc-800/70" : "bg-[#F4EFE6]/85"
              }`}
            >
              <h3 className={`text-sm sm:text-base font-bold mb-1.5 ${headingText}`}>
                {faq.q}
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${mutedText}`}>
                {renderDailyRichText(faq.a)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
};

export default DailySEOArticle;
