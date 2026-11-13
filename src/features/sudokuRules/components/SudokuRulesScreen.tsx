import React, { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Grid,
  HelpCircle,
  Keyboard,
  Layers,
  Pencil,
  Search,
  Sliders,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "../../../i18n/useTranslation";
import { getSeoPath } from "../../../utils/seoSilos";
import {
  getFocusableElements,
  handleRovingMenuArrowKey,
} from "../../../utils/keyboardControls";
import {
  getRulesArticleCopy,
  RulesQuickJumpTab,
} from "../../../utils/rulesArticleTranslations";
import {
  GridHousesDiagram,
  NakedHiddenPairsDiagram,
  PencilNotesDiagram,
  PointingPairsDiagram,
  XWingDiagram,
} from "./SudokuRuleDiagrams";

export interface SudokuRulesScreenProps {
  darkMode: boolean;
  onStartDifficulty: (difficulty: "EASY" | "MEDIUM" | "HARD" | "EXPERT") => void;
  onOpenDailyChallenge: () => void;
  onOpenSolver: () => void;
  onBackHome: () => void;
}

type LinkTokenKey =
  | "easyLink"
  | "mediumLink"
  | "hardLink"
  | "expertLink"
  | "dailyLink"
  | "solverLink";

const TOKEN_SPLIT_RE =
  /(\{\{(?:easyLink|mediumLink|hardLink|expertLink|dailyLink|solverLink)\}\})/g;

export const SudokuRulesScreen: React.FC<SudokuRulesScreenProps> = ({
  darkMode,
  onStartDifficulty,
  onOpenDailyChallenge,
  onOpenSolver,
  onBackHome,
}) => {
  const { t, language } = useTranslation();
  const copy = getRulesArticleCopy(language);
  const [activeTab, setActiveTab] = useState<RulesQuickJumpTab["id"]>("rules-basics");
  const quickJumpRef = useRef<HTMLDivElement | null>(null);

  const handleQuickJump = (id: RulesQuickJumpTab["id"]) => {
    setActiveTab(id);
    if (typeof document !== "undefined") {
      const target = document.getElementById(id);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleQuickJumpKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const items = getFocusableElements(quickJumpRef.current);
    handleRovingMenuArrowKey(e, items, "horizontal");
  };

  const renderContextualTemplate = (template: string) => {
    const parts = template.split(TOKEN_SPLIT_RE);
    return parts.map((part, idx) => {
      if (!part.startsWith("{{") || !part.endsWith("}}")) {
        return <React.Fragment key={idx}>{part}</React.Fragment>;
      }
      const key = part.slice(2, -2) as LinkTokenKey;
      const label = copy.contextualLinks.linkLabels[key];
      let href = "/daily-challenge";
      let pillCls = "";
      let onClickHandler = onOpenDailyChallenge;

      if (key === "easyLink") {
        href = getSeoPath(language, "EASY");
        onClickHandler = () => onStartDifficulty("EASY");
        pillCls = darkMode
          ? "bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30"
          : "bg-emerald-100/90 text-emerald-900 hover:bg-emerald-200/80";
      } else if (key === "mediumLink") {
        href = getSeoPath(language, "MEDIUM");
        onClickHandler = () => onStartDifficulty("MEDIUM");
        pillCls = darkMode
          ? "bg-amber-500/20 text-amber-200 hover:bg-amber-500/30"
          : "bg-amber-100/90 text-amber-900 hover:bg-amber-200/80";
      } else if (key === "hardLink") {
        href = getSeoPath(language, "HARD");
        onClickHandler = () => onStartDifficulty("HARD");
        pillCls = darkMode
          ? "bg-violet-500/20 text-violet-200 hover:bg-violet-500/30"
          : "bg-violet-100/90 text-violet-900 hover:bg-violet-200/80";
      } else if (key === "expertLink") {
        href = getSeoPath(language, "EXPERT");
        onClickHandler = () => onStartDifficulty("EXPERT");
        pillCls = darkMode
          ? "bg-rose-500/20 text-rose-200 hover:bg-rose-500/30"
          : "bg-rose-100/90 text-rose-900 hover:bg-rose-200/80";
      } else if (key === "dailyLink") {
        href = "/daily-challenge";
        onClickHandler = onOpenDailyChallenge;
        pillCls = darkMode
          ? "bg-sky-500/20 text-sky-200 hover:bg-sky-500/30"
          : "bg-sky-100/90 text-sky-900 hover:bg-sky-200/80";
      } else if (key === "solverLink") {
        href = "/solver";
        onClickHandler = onOpenSolver;
        pillCls = darkMode
          ? "bg-teal-500/20 text-teal-200 hover:bg-teal-500/30"
          : "bg-teal-100/90 text-teal-900 hover:bg-teal-200/80";
      }

      return (
        <a
          key={idx}
          href={href}
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
            e.preventDefault();
            onClickHandler();
          }}
          className={`inline-flex items-center gap-1 mx-0.5 px-2.5 py-0.5 rounded-full border-0 font-bold text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${pillCls}`}
        >
          <span>{label}</span>
          <ArrowUpRight className="w-3 h-3 shrink-0" />
        </a>
      );
    });
  };

  const sectionCardCls = darkMode
    ? "bg-zinc-900/85 text-zinc-100 shadow-[0_12px_34px_rgba(0,0,0,0.38)]"
    : "bg-white/95 text-stone-800 shadow-[0_12px_34px_rgba(15,23,42,0.05)]";

  const subCardCls = darkMode
    ? "bg-zinc-800/70 text-zinc-200 shadow-[0_6px_20px_rgba(0,0,0,0.24)]"
    : "bg-sky-50/65 text-stone-700 shadow-[0_6px_20px_rgba(14,116,144,0.05)]";

  const calloutPastelCls = darkMode
    ? "bg-indigo-500/15 text-indigo-100 shadow-[0_6px_22px_rgba(0,0,0,0.22)]"
    : "bg-indigo-50/85 text-indigo-950 shadow-[0_6px_22px_rgba(79,70,229,0.06)]";

  const diffBadgeCls = (diff: "EASY" | "MEDIUM" | "HARD" | "EXPERT") => {
    if (diff === "EASY") {
      return darkMode ? "bg-emerald-500/20 text-emerald-200" : "bg-emerald-100 text-emerald-900";
    }
    if (diff === "MEDIUM") {
      return darkMode ? "bg-amber-500/20 text-amber-200" : "bg-amber-100 text-amber-900";
    }
    if (diff === "HARD") {
      return darkMode ? "bg-violet-500/20 text-violet-200" : "bg-violet-100 text-violet-900";
    }
    return darkMode ? "bg-rose-500/20 text-rose-200" : "bg-rose-100 text-rose-900";
  };

  return (
    <div className="w-full h-full overflow-y-auto px-4 sm:px-6 pb-12 pt-[calc(84px+env(safe-area-inset-top,0px))] lg:pt-[92px]">
      <article className="max-w-4xl mx-auto space-y-6">
        {/* HERO HEADER */}
        <header
          className={`p-5 sm:p-8 rounded-3xl border-0 space-y-4 transition-colors ${
            darkMode
              ? "bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-indigo-950/50 text-zinc-100 shadow-[0_14px_38px_rgba(0,0,0,0.45)]"
              : "bg-gradient-to-br from-white via-sky-50/75 to-indigo-50/75 text-stone-800 shadow-[0_14px_38px_rgba(15,23,42,0.06)]"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-0 text-[11px] font-bold uppercase tracking-wider ${
                darkMode ? "bg-sky-500/20 text-sky-300" : "bg-sky-100 text-sky-900"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{copy.hero.badge}</span>
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full border-0 text-[11px] font-mono font-semibold ${
                darkMode ? "bg-zinc-800 text-zinc-300" : "bg-white/90 text-stone-600 shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
              }`}
            >
              {copy.hero.readingBadge}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-stone-900 dark:text-zinc-50">
              {copy.hero.title}
            </h1>
            <p className="text-sm sm:text-base leading-relaxed text-stone-600 dark:text-zinc-300">
              {copy.hero.subtitle}
            </p>
          </div>

          {/* QUICK-JUMP KEYBOARD-NAVIGABLE CATEGORY PILL BAR */}
          <nav aria-label={copy.hero.badge}>
            <div
              ref={quickJumpRef}
              onKeyDown={handleQuickJumpKeyDown}
              role="tablist"
              aria-label={copy.hero.badge}
              className="flex flex-wrap gap-2 pt-1"
            >
              {copy.quickJumpTabs.map((tab) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => handleQuickJump(tab.id)}
                    className={`px-3.5 py-2 rounded-2xl border-0 text-xs font-bold transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      isSelected
                        ? "bg-sky-500 text-white shadow-[0_6px_16px_rgba(14,165,233,0.28)]"
                        : darkMode
                          ? "bg-zinc-800/85 text-zinc-200 hover:bg-zinc-700/85"
                          : "bg-white/90 text-stone-700 hover:bg-sky-50 shadow-[0_3px_10px_rgba(15,23,42,0.05)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </nav>
        </header>

        {/* SECTION 1: GRID ANATOMY & CORE RULES */}
        <section
          id="rules-basics"
          className={`scroll-mt-28 p-5 sm:p-7 rounded-3xl border-0 space-y-5 ${sectionCardCls}`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                darkMode ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-800"
              }`}
            >
              <Grid className="w-4.5 h-4.5" />
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-zinc-100">
              {copy.basics.heading}
            </h2>
          </div>

          <p className="text-sm leading-relaxed text-stone-600 dark:text-zinc-300">
            {copy.basics.intro}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div className="grid grid-cols-1 gap-3">
              {copy.basics.coreRules.map((rule) => (
                <div key={rule.title} className={`p-4 rounded-2xl border-0 space-y-1 ${subCardCls}`}>
                  <h3 className="text-sm font-bold text-stone-800 dark:text-zinc-100">
                    {rule.title}
                  </h3>
                  <p className="text-xs leading-relaxed opacity-90">{rule.desc}</p>
                </div>
              ))}
            </div>

            <GridHousesDiagram labels={copy.diagramLabels} darkMode={darkMode} />
          </div>

          <div className={`p-4 rounded-2xl border-0 space-y-1.5 ${calloutPastelCls}`}>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider">
              {copy.basics.coordinatesTitle}
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed opacity-95">
              {copy.basics.coordinatesDesc}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-200">
              {copy.basics.difficultyScaleTitle}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {copy.basics.difficultyRows.map((row) => (
                <button
                  key={row.difficulty}
                  type="button"
                  onClick={() => onStartDifficulty(row.difficulty)}
                  className={`p-4 rounded-2xl border-0 text-left transition-all cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 space-y-1.5 ${
                    darkMode
                      ? "bg-zinc-800/75 hover:bg-zinc-800 shadow-[0_6px_18px_rgba(0,0,0,0.28)]"
                      : "bg-stone-50/90 hover:bg-sky-50/80 shadow-[0_6px_18px_rgba(15,23,42,0.05)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${diffBadgeCls(
                        row.difficulty
                      )}`}
                    >
                      {row.label}
                    </span>
                    <span className="text-xs font-mono font-semibold text-stone-500 dark:text-zinc-400">
                      {row.clues}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-stone-600 dark:text-zinc-300">
                    {row.logicSummary}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <p className={`p-3.5 rounded-2xl border-0 text-xs sm:text-sm leading-relaxed ${calloutPastelCls}`}>
            {renderContextualTemplate(copy.contextualLinks.beginnerCtaTemplate)}
          </p>
        </section>

        {/* SECTION 2: PENCIL MARKS & VERIFIED KEYBOARD SHORTCUTS */}
        <section
          id="rules-notes"
          className={`scroll-mt-28 p-5 sm:p-7 rounded-3xl border-0 space-y-5 ${sectionCardCls}`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                darkMode ? "bg-sky-500/20 text-sky-300" : "bg-sky-100 text-sky-800"
              }`}
            >
              <Pencil className="w-4.5 h-4.5" />
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-zinc-100">
              {copy.notes.heading}
            </h2>
          </div>

          <p className="text-sm leading-relaxed text-stone-600 dark:text-zinc-300">
            {copy.notes.intro}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <PencilNotesDiagram labels={copy.diagramLabels} darkMode={darkMode} />

            <div className={`p-4 sm:p-5 rounded-2xl border-0 space-y-3 ${subCardCls}`}>
              <h3 className="text-sm font-bold text-stone-800 dark:text-zinc-100">
                {copy.notes.workflowTitle}
              </h3>
              <ul className="space-y-2.5 text-xs leading-relaxed">
                {copy.notes.workflowSteps.map((step) => (
                  <li key={step} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-indigo-500 shrink-0" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-200">
                {copy.notes.shortcutsTitle}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {copy.notes.shortcuts.map((shortcut) => (
                <div
                  key={shortcut.keys}
                  className={`p-3.5 rounded-2xl border-0 flex flex-col gap-1.5 ${
                    darkMode
                      ? "bg-zinc-800/65 text-zinc-200 shadow-[0_4px_14px_rgba(0,0,0,0.22)]"
                      : "bg-stone-50/90 text-stone-700 shadow-[0_4px_14px_rgba(15,23,42,0.04)]"
                  }`}
                >
                  <kbd
                    className={`self-start px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold ${
                      darkMode ? "bg-zinc-900 text-sky-300" : "bg-white text-sky-900 shadow-[0_2px_6px_rgba(15,23,42,0.05)]"
                    }`}
                  >
                    {shortcut.keys}
                  </kbd>
                  <span className="text-xs leading-relaxed opacity-95">{shortcut.action}</span>
                </div>
              ))}
            </div>
          </div>

          <p className={`p-3.5 rounded-2xl border-0 text-xs sm:text-sm leading-relaxed ${calloutPastelCls}`}>
            {renderContextualTemplate(copy.contextualLinks.notesCtaTemplate)}
          </p>
        </section>

        {/* SECTION 3: BEGINNER & INTERMEDIATE STRATEGIES */}
        <section
          id="rules-strategies"
          className={`scroll-mt-28 p-5 sm:p-7 rounded-3xl border-0 space-y-5 ${sectionCardCls}`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                darkMode ? "bg-amber-500/20 text-amber-300" : "bg-amber-100 text-amber-800"
              }`}
            >
              <Layers className="w-4.5 h-4.5" />
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-zinc-100">
              {copy.strategies.heading}
            </h2>
          </div>

          <p className="text-sm leading-relaxed text-stone-600 dark:text-zinc-300">
            {copy.strategies.intro}
          </p>

          <div className="space-y-3">
            {copy.strategies.items.map((item) => (
              <div key={item.id} className={`p-4 sm:p-5 rounded-2xl border-0 space-y-2 ${subCardCls}`}>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-zinc-100">
                    {item.name}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      darkMode ? "bg-amber-500/20 text-amber-200" : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {item.levelBadge}
                  </span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed">{item.summary}</p>
                <p className="text-xs leading-relaxed opacity-90">{item.howToSpot}</p>
                <p
                  className={`p-2.5 rounded-xl text-xs font-mono leading-relaxed ${
                    darkMode ? "bg-zinc-900/65 text-sky-200" : "bg-white/90 text-sky-900 shadow-[0_2px_8px_rgba(14,116,144,0.05)]"
                  }`}
                >
                  {item.exampleNote}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NakedHiddenPairsDiagram labels={copy.diagramLabels} darkMode={darkMode} />
            <PointingPairsDiagram labels={copy.diagramLabels} darkMode={darkMode} />
          </div>

          <p className={`p-3.5 rounded-2xl border-0 text-xs sm:text-sm leading-relaxed ${calloutPastelCls}`}>
            {renderContextualTemplate(copy.contextualLinks.strategiesCtaTemplate)}
          </p>
        </section>

        {/* SECTION 4: ADVANCED EXPERT PATTERNS */}
        <section
          id="rules-advanced"
          className={`scroll-mt-28 p-5 sm:p-7 rounded-3xl border-0 space-y-5 ${sectionCardCls}`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                darkMode ? "bg-violet-500/20 text-violet-300" : "bg-violet-100 text-violet-800"
              }`}
            >
              <Sparkles className="w-4.5 h-4.5" />
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-zinc-100">
              {copy.advanced.heading}
            </h2>
          </div>

          <p className="text-sm leading-relaxed text-stone-600 dark:text-zinc-300">
            {copy.advanced.intro}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
            <div className="lg:col-span-3 space-y-3">
              {copy.advanced.items.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 rounded-2xl border-0 space-y-2 ${
                    darkMode
                      ? "bg-violet-500/10 text-zinc-200 shadow-[0_6px_20px_rgba(0,0,0,0.26)]"
                      : "bg-violet-50/70 text-stone-700 shadow-[0_6px_20px_rgba(124,58,237,0.06)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-zinc-100">
                      {item.name}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        darkMode ? "bg-violet-500/25 text-violet-200" : "bg-violet-100 text-violet-900"
                      }`}
                    >
                      {item.levelBadge}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed">{item.summary}</p>
                  <p className="text-xs leading-relaxed opacity-90">{item.howToSpot}</p>
                  <p
                    className={`p-2.5 rounded-xl text-xs font-mono leading-relaxed ${
                      darkMode ? "bg-zinc-900/70 text-violet-200" : "bg-white/90 text-violet-950 shadow-[0_2px_8px_rgba(124,58,237,0.06)]"
                    }`}
                  >
                    {item.exampleNote}
                  </p>
                </div>
              ))}
            </div>

            <div className="lg:col-span-2">
              <XWingDiagram labels={copy.diagramLabels} darkMode={darkMode} />
            </div>
          </div>

          <p className={`p-3.5 rounded-2xl border-0 text-xs sm:text-sm leading-relaxed ${calloutPastelCls}`}>
            {renderContextualTemplate(copy.contextualLinks.advancedCtaTemplate)}
          </p>
        </section>

        {/* SECTION 5: SMART ASSISTANTS GUIDE (ALL 7 SETTINGS) */}
        <section
          id="rules-assistants"
          className={`scroll-mt-28 p-5 sm:p-7 rounded-3xl border-0 space-y-5 ${sectionCardCls}`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                darkMode ? "bg-pink-500/20 text-pink-300" : "bg-pink-100 text-pink-800"
              }`}
            >
              <Sliders className="w-4.5 h-4.5" />
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-zinc-100">
              {copy.assistants.heading}
            </h2>
          </div>

          <p className="text-sm leading-relaxed text-stone-600 dark:text-zinc-300">
            {copy.assistants.intro}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {copy.assistants.items.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border-0 space-y-2 ${
                  darkMode
                    ? "bg-pink-950/25 text-pink-100 shadow-[0_6px_20px_rgba(0,0,0,0.24)]"
                    : "bg-pink-50/70 text-stone-700 shadow-[0_6px_20px_rgba(157,23,77,0.05)]"
                }`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-pink-100">
                    {item.name}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      darkMode ? "bg-pink-500/25 text-pink-200" : "bg-white text-pink-900 shadow-[0_2px_6px_rgba(157,23,77,0.06)]"
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>
                <p className="text-xs leading-relaxed">{item.description}</p>
                <p className="text-[11px] leading-relaxed opacity-85">{item.whenToUse}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: FAQS & BOTTOM NAVIGATION BAR */}
        <section
          id="rules-faq"
          className={`scroll-mt-28 p-5 sm:p-7 rounded-3xl border-0 space-y-5 ${sectionCardCls}`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                darkMode ? "bg-teal-500/20 text-teal-300" : "bg-teal-100 text-teal-800"
              }`}
            >
              <HelpCircle className="w-4.5 h-4.5" />
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-zinc-100">
              {copy.faq.heading}
            </h2>
          </div>

          <div className="space-y-3">
            {copy.faq.items.map((faq) => (
              <div key={faq.question} className={`p-4 rounded-2xl border-0 space-y-1.5 ${subCardCls}`}>
                <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100">
                  {faq.question}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed opacity-95">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBackHome}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border-0 text-xs font-bold transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                darkMode
                  ? "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 shadow-[0_4px_12px_rgba(0,0,0,0.24)]"
                  : "bg-sky-50 text-sky-900 hover:bg-sky-100 shadow-[0_4px_12px_rgba(14,116,144,0.07)]"
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t("home") || "Home"}</span>
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href="/daily-challenge"
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                  e.preventDefault();
                  onOpenDailyChallenge();
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border-0 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  darkMode
                    ? "bg-sky-500/20 text-sky-200 hover:bg-sky-500/30"
                    : "bg-sky-100 text-sky-900 hover:bg-sky-200/80 shadow-[0_4px_12px_rgba(14,165,233,0.1)]"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{copy.contextualLinks.linkLabels.dailyLink}</span>
              </a>

              <a
                href="/solver"
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                  e.preventDefault();
                  onOpenSolver();
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border-0 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  darkMode
                    ? "bg-teal-500/20 text-teal-200 hover:bg-teal-500/30"
                    : "bg-teal-100 text-teal-900 hover:bg-teal-200/80 shadow-[0_4px_12px_rgba(20,184,166,0.1)]"
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>{copy.contextualLinks.linkLabels.solverLink}</span>
              </a>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
};

