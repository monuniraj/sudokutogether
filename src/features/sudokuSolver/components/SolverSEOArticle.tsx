import React from "react";
import { useTranslation } from "../../../i18n/useTranslation";
import {
  getSolverArticleCopy,
  type RichText,
} from "../../../utils/solverArticleTranslations";

interface SolverSEOArticleProps {
  onNavigateDailyChallenge?: () => void;
  onNavigateRules?: () => void;
}

const renderRichText = (segments: RichText) =>
  segments.map((seg, idx) =>
    seg.strong ? <strong key={idx}>{seg.text}</strong> : <React.Fragment key={idx}>{seg.text}</React.Fragment>
  );

export const SolverSEOArticle: React.FC<SolverSEOArticleProps> = ({
  onNavigateDailyChallenge,
  onNavigateRules,
}) => {
  const { language } = useTranslation();
  const copy = getSolverArticleCopy(language);

  const handleDailyChallengeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!onNavigateDailyChallenge) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onNavigateDailyChallenge();
  };

  const handleRulesClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!onNavigateRules) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onNavigateRules();
  };

  const techniqueCardStyles = [
    "rounded-2xl border-0 shadow-none p-5 bg-[#F3E8FF] text-[#581C87] dark:bg-[#2e1065]/60 dark:text-[#e9d5ff]",
    "rounded-2xl border-0 shadow-none p-5 bg-[#CCFBF1] text-[#115E59] dark:bg-teal-950/60 dark:text-teal-200",
    "rounded-2xl border-0 shadow-none p-5 bg-[#EEF2FF] text-[#3730A3] dark:bg-indigo-950/60 dark:text-indigo-200",
    "rounded-2xl border-0 shadow-none p-5 bg-[#FEF3C7] text-[#92400E] dark:bg-[#451a03]/60 dark:text-amber-200",
  ] as const;

  return (
    <article
      id="solver-seo-article"
      aria-labelledby="solver-guide-heading"
      aria-label={copy.articleAriaLabel}
      className="w-full max-w-3xl mx-auto mt-10 sm:mt-14 pb-10 flex flex-col gap-8 font-sans select-text text-stone-700 dark:text-zinc-300"
    >
      {/* Overview Header Card */}
      <section className="rounded-3xl border-0 shadow-none bg-white/85 dark:bg-zinc-900/60 p-6 sm:p-8">
        <h2
          id="solver-guide-heading"
          className="text-xl sm:text-2xl font-black tracking-tight text-stone-800 dark:text-zinc-100"
        >
          {copy.overviewHeading}
        </h2>
        <p className="mt-3 text-sm leading-relaxed">{renderRichText(copy.overviewP1)}</p>
        <p className="mt-3 text-sm leading-relaxed">{renderRichText(copy.overviewP2)}</p>
      </section>

      {/* Section 1: Step-by-Step How-To Guide */}
      <section
        aria-labelledby="solver-howto-heading"
        className="rounded-3xl border-0 shadow-none bg-white/85 dark:bg-zinc-900/60 p-6 sm:p-8"
      >
        <h2
          id="solver-howto-heading"
          className="text-lg sm:text-xl font-black tracking-tight text-stone-800 dark:text-zinc-100"
        >
          {copy.howToHeading}
        </h2>
        <p className="mt-2.5 text-sm leading-relaxed">{renderRichText(copy.howToIntro)}</p>

        <ul className="mt-4 space-y-3 text-sm leading-relaxed list-disc pl-5 marker:text-indigo-500 dark:marker:text-indigo-300">
          {copy.howToSteps.map((step, idx) => (
            <li key={idx}>{renderRichText(step)}</li>
          ))}
        </ul>
      </section>

      {/* Section 2: Supported Advanced Techniques */}
      <section aria-labelledby="solver-techniques-heading" className="flex flex-col gap-4">
        <div className="px-1">
          <h2
            id="solver-techniques-heading"
            className="text-lg sm:text-xl font-black tracking-tight text-stone-800 dark:text-zinc-100"
          >
            {copy.techniquesHeading}
          </h2>
          <p className="mt-2 text-sm leading-relaxed">{renderRichText(copy.techniquesIntro)}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {copy.techniqueCards.map((card, idx) => (
            <div key={idx} className={techniqueCardStyles[idx]}>
              <h3 className="text-sm font-black uppercase tracking-wide">{card.title}</h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed opacity-90">
                {renderRichText(card.body)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Why Use a Solver */}
      <section aria-labelledby="solver-why-heading" className="flex flex-col gap-4">
        <div className="px-1">
          <h2
            id="solver-why-heading"
            className="text-lg sm:text-xl font-black tracking-tight text-stone-800 dark:text-zinc-100"
          >
            {copy.whyHeading}
          </h2>
          <p className="mt-2 text-sm leading-relaxed">{renderRichText(copy.whyIntro)}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border-0 shadow-none p-5 bg-[#D1FAE5] text-[#065F46] dark:bg-[#022c22]/60 dark:text-[#d1fae5]">
            <h3 className="text-sm font-black uppercase tracking-wide">{copy.beginnersTitle}</h3>
            <ul className="mt-2.5 space-y-2 text-xs sm:text-sm leading-relaxed list-disc pl-4">
              {copy.beginnersItems.map((item, idx) => (
                <li key={idx}>{renderRichText(item)}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border-0 shadow-none p-5 bg-[#FFE4E6] text-[#9D174D] dark:bg-[#4c0519]/60 dark:text-[#fecdd3]">
            <h3 className="text-sm font-black uppercase tracking-wide">{copy.expertsTitle}</h3>
            <ul className="mt-2.5 space-y-2 text-xs sm:text-sm leading-relaxed list-disc pl-4">
              {copy.expertsItems.map((item, idx) => (
                <li key={idx}>{renderRichText(item)}</li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-2 px-1 text-sm leading-relaxed">
          {copy.crossLinkPrefix}
          <a
            href="/daily-challenge"
            onClick={handleDailyChallengeClick}
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
          >
            {copy.crossLinkLabel}
          </a>
          {copy.crossLinkSuffix}
        </p>

        <p className="mt-1 px-1 text-sm leading-relaxed">
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

      {/* Section 3.5: Desktop Keyboard Workflow */}
      <section
        aria-labelledby="solver-keyboard-heading"
        className="rounded-3xl border-0 shadow-[0_6px_24px_rgba(0,0,0,0.02)] bg-sky-50/90 dark:bg-sky-950/30 p-6 sm:p-8"
      >
        <h2
          id="solver-keyboard-heading"
          className="text-lg sm:text-xl font-black tracking-tight text-sky-950 dark:text-sky-100"
        >
          {copy.keyboardHeading}
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-zinc-300">
          {renderRichText(copy.keyboardIntro)}
        </p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {copy.keyboardCards.map((card, idx) => {
            const tileTones = [
              "bg-indigo-50/90 dark:bg-indigo-950/45 text-indigo-950 dark:text-indigo-100",
              "bg-rose-50/90 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100",
              "bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100",
              "bg-violet-50/90 dark:bg-violet-950/45 text-violet-950 dark:text-violet-100",
            ];
            return (
              <div
                key={idx}
                className={`rounded-2xl border-0 shadow-[0_4px_16px_rgba(0,0,0,0.02)] p-4 ${tileTones[idx % tileTones.length]}`}
              >
                <kbd className="inline-flex items-center px-2.5 py-1 rounded-xl border-0 bg-white/90 dark:bg-black/35 text-slate-800 dark:text-zinc-100 font-mono text-[11px] font-bold shadow-[0_2px_8px_rgba(15,23,42,0.05)]">
                  {card.keys}
                </kbd>
                <h3 className="mt-2.5 text-sm font-extrabold">
                  {card.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed opacity-90">
                  {card.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 4: FAQs */}
      <section
        aria-labelledby="solver-faq-heading"
        className="rounded-3xl border-0 shadow-none bg-white/85 dark:bg-zinc-900/60 p-6 sm:p-8"
      >
        <h2
          id="solver-faq-heading"
          className="text-lg sm:text-xl font-black tracking-tight text-stone-800 dark:text-zinc-100"
        >
          {copy.faqHeading}
        </h2>

        <div className="mt-5 space-y-5">
          {copy.faqs.map((faq, idx) => (
            <div key={idx}>
              <h3 className="text-sm sm:text-base font-extrabold text-stone-800 dark:text-zinc-100">
                {faq.q}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed">{renderRichText(faq.a)}</p>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
};
