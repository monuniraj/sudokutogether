import React, { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { ChevronRight, Gamepad2, Grid3X3, Layers, Sparkles, Timer, Users } from "lucide-react";
import { MO_LOGIC_WEB_GAMES } from "../../utils/moLogicWebGames";
import type { CompliancePageType } from "../../components/legal/ComplianceScreen";

export interface BlockSyncWebGuideProps {
  darkMode: boolean;
  onNavigateHome: () => void;
  onNavigateLegal: (page: CompliancePageType) => void;
  onNavigateWebPath: (path: string) => void;
  onScrollToBoard: () => void;
}

const BLOCKS_FAQ_ITEMS: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: "How is Block Sync different from ordinary falling-block games?",
    a: "Block Sync gives you full deliberation with zero gravity rush in Classic mode. You drag three polyomino shapes per tray onto a calm 9×9 grid and score by completing full rows, full columns, or highlighted 3×3 Sudoku-style boxes.",
  },
  {
    q: "What triggers Combo Multipliers in Block Sync?",
    a: "Clearing two or more structures with a single piece placement—such as completing a row and a 3×3 box simultaneously—or chaining clears across consecutive placements boosts your combo multiplier for substantially higher scores.",
  },
  {
    q: "How do Time Rush (2m / 3m / 5m) and Classic multiplayer rooms work?",
    a: "In a shared Mo Logic multiplayer room, Classic mode lets every participant play at their own pace with optional Undo, while Time Rush sets a synchronized countdown (2, 3, 5, or 10 minutes) using the exact same seeded block tray order for fair head-to-head ranking.",
  },
  {
    q: "Can players switch between Block Sync and Sudoku Sync using the same lobby?",
    a: "Yes. Mo Logic uses a unified cross-game multiplayer system: 6-digit Room Codes, optional PIN protection, Recent Players, Friends lists, and ?room= invite links connect both Block Sync and Sudoku Sync from one shared lobby.",
  },
  {
    q: "Do I lose my Solo Block Sync board when I join a multiplayer room?",
    a: "No. Solo progress and each multiplayer room session are stored separately in isolated drawers, so you can pause a solo Classic board, compete in a friend's room, and resume your solo run later without losing score.",
  },
  {
    q: "Can I undo mistakes or check room standings later?",
    a: "Solo runs always keep a one-step Undo button below the tray. In multiplayer rooms, the host chooses whether Undo is allowed, and room standings remain accessible asynchronously for up to 7 days so opponents can submit and compare scores cleanly.",
  },
];

const BLOCKS_FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: BLOCKS_FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

const FAQ_SCRIPT_ID = "block-sync-faq-jsonld";

export const BlockSyncWebGuide: React.FC<BlockSyncWebGuideProps> = ({
  darkMode,
  onNavigateHome,
  onNavigateLegal,
  onNavigateWebPath,
  onScrollToBoard,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    if (Capacitor.isNativePlatform() || typeof document === "undefined") return;
    let scriptEl = document.getElementById(FAQ_SCRIPT_ID) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement("script");
      scriptEl.id = FAQ_SCRIPT_ID;
      scriptEl.type = "application/ld+json";
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(BLOCKS_FAQ_JSON_LD);

    return () => {
      const existing = document.getElementById(FAQ_SCRIPT_ID);
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }
    };
  }, []);

  if (Capacitor.isNativePlatform()) {
    return null;
  }

  const otherGames = MO_LOGIC_WEB_GAMES.filter((game) => game.id !== "blocks");

  const cardSurface = darkMode
    ? "bg-[#1A232E]/90 text-slate-100 shadow-[0_8px_28px_rgba(0,0,0,0.28)]"
    : "bg-white/90 text-[#243746] shadow-[0_8px_28px_rgba(30,41,59,0.04)]";

  const mutedText = darkMode ? "text-slate-300" : "text-[#465C70]";

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    handler: () => void
  ) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    handler();
  };

  return (
    <section
      id="block-sync-web-editorial-guide"
      aria-label="Block Sync Strategy Guide and FAQs"
      className={`w-full border-t transition-colors duration-300 ${
        darkMode
          ? "bg-[#121820] text-slate-100 border-slate-800/70"
          : "bg-[#EDF5FB] text-[#243746] border-[#D6E6F2]"
      }`}
    >
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 flex flex-col gap-8 select-text">
        {/* Intro Header Card */}
        <article className={`p-6 sm:p-8 rounded-3xl border-0 ${cardSurface}`}>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                darkMode ? "bg-[#0EA5E9]/20 text-[#7DD3FC]" : "bg-[#E0F2FE] text-[#0369A1]"
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5 shrink-0" />
              Mo Logic Studio Guide
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold ${
                darkMode ? "bg-slate-800 text-slate-300" : "bg-[#F4F8FB] text-[#465C70]"
              }`}
            >
              Classic &amp; Time Rush
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-tight mb-3">
            Block Sync — Calm 9×9 Block Puzzle &amp; Seeded Multiplayer Strategy
          </h1>
          <p className={`text-sm leading-relaxed mb-5 ${mutedText}`}>
            Block Sync blends tactile polyomino placement with classic 9×9 Sudoku geometry. Rather than racing falling shapes, every turn deals three deliberate pieces into your tray. Read the open board, plan two or three placements ahead, trigger sweeping row, column, and 3×3 box clears, and climb global or room standings without clutter or distractions.
          </p>

          <button
            type="button"
            onClick={onScrollToBoard}
            className={`px-6 py-3 rounded-2xl border-0 font-bold text-xs sm:text-sm uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98] ${
              darkMode
                ? "bg-[#0EA5E9] hover:bg-[#38BDF8] text-slate-950 shadow-[0_6px_18px_rgba(14,165,233,0.25)]"
                : "bg-[#2B8CEE] hover:bg-[#1E7AD8] text-white shadow-[0_6px_18px_rgba(43,140,238,0.22)]"
            }`}
          >
            <span>Back to Live 9×9 Board</span>
          </button>
        </article>

        {/* Three Core Strategy Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pillar 1 */}
          <article className={`p-6 rounded-3xl border-0 flex flex-col gap-3 ${cardSurface}`}>
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                darkMode ? "bg-sky-500/20 text-sky-300" : "bg-[#E0F2FE] text-[#0369A1]"
              }`}
            >
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-tight">
              1. How Block Sync Works: Rows, Columns &amp; 3×3 Boxes
            </h2>
            <p className={`text-xs sm:text-sm leading-relaxed ${mutedText}`}>
              Drag pieces from the bottom three-slot tray anywhere onto empty pockets on the 9×9 grid. Unlike basic line-clear boards, Block Sync highlights nine checkerboard 3×3 zones. Completing any 9-cell row, 9-cell column, or full 3×3 box vanishes those tiles cleanly and opens vital breathing room for the remaining tray pieces.
            </p>
          </article>

          {/* Pillar 2 */}
          <article className={`p-6 rounded-3xl border-0 flex flex-col gap-3 ${cardSurface}`}>
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                darkMode ? "bg-amber-500/20 text-amber-300" : "bg-[#FEF3C7] text-[#B45309]"
              }`}
            >
              <Timer className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-tight">
              2. Classic vs. Time Rush (2m / 3m / 5m) Strategy
            </h2>
            <p className={`text-xs sm:text-sm leading-relaxed ${mutedText}`}>
              Keep the center 3×3 pocket cluster as open as possible so oversized 3×3 squares or 5-cell bars never get locked out (avoiding dead trays). When clearing multiple zones at once—such as finishing a corner 3×3 box and a vertical column together—your Combo Multiplier climbs sharply. In Time Rush rooms, lock fast 2-zone combos instead of hunting risky multi-turn setups.
            </p>
          </article>

          {/* Pillar 3 */}
          <article className={`p-6 rounded-3xl border-0 flex flex-col gap-3 ${cardSurface}`}>
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                darkMode ? "bg-emerald-500/20 text-emerald-300" : "bg-[#D1FAE5] text-[#065F46]"
              }`}
            >
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-tight">
              3. Unified Cross-Game Multiplayer by Mo Logic
            </h2>
            <p className={`text-xs sm:text-sm leading-relaxed ${mutedText}`}>
              Challenge friends on the exact same deterministically seeded piece sequence using 6-digit Room Codes, optional PIN protection, or direct invite links. Rooms stay open asynchronously for 7 days so every participant plays cleanly on their own clock, and players can switch seamlessly between Block Sync and Sudoku Sync from the same Mo Logic lobby.
            </p>
          </article>
        </div>

        {/* Scalable "More Games by Mo Logic" Hub */}
        {otherGames.length > 0 && (
          <section
            id="blocks-more-games-hub"
            aria-label="More Games by Mo Logic"
            className={`p-6 rounded-3xl border-0 ${cardSurface}`}
          >
            <div className="flex items-center gap-2.5 mb-4">
              <Gamepad2
                className={`w-5 h-5 shrink-0 ${
                  darkMode ? "text-[#38BDF8]" : "text-[#2B8CEE]"
                }`}
              />
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wide">
                More Games by Mo Logic
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {otherGames.map((game) => (
                <a
                  key={game.id}
                  href={game.path}
                  onClick={(e) =>
                    handleLinkClick(e, () =>
                      game.path === "/" ? onNavigateHome() : onNavigateWebPath(game.path)
                    )
                  }
                  className={`p-4 rounded-2xl border-0 no-underline flex flex-col justify-between gap-2 transition-all hover:-translate-y-0.5 ${
                    darkMode
                      ? "bg-slate-800/75 hover:bg-slate-800 text-slate-100"
                      : "bg-[#F4F8FB] hover:bg-[#E4F0FA] text-[#1E3A5F]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-black text-sm tracking-tight">{game.name}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        darkMode ? "bg-[#0EA5E9]/20 text-[#7DD3FC]" : "bg-white text-[#0369A1]"
                      }`}
                    >
                      {game.badge}
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed ${mutedText}`}>{game.shortTagline}</p>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Frequently Asked Questions */}
        <section
          id="blocks-web-faq-section"
          aria-label="Block Sync Frequently Asked Questions"
          className={`p-6 sm:p-8 rounded-3xl border-0 ${cardSurface}`}
        >
          <div className="flex items-center gap-2.5 mb-4">
            <Sparkles
              className={`w-5 h-5 shrink-0 ${darkMode ? "text-[#38BDF8]" : "text-[#2B8CEE]"}`}
            />
            <h2 className="text-base sm:text-xl font-black uppercase tracking-tight">
              Block Sync Frequently Asked Questions
            </h2>
          </div>

          <div className="flex flex-col divide-y divide-slate-200/60 dark:divide-slate-800/70">
            {BLOCKS_FAQ_ITEMS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={faq.q} className="py-3 first:pt-1 last:pb-1">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-3 text-left font-bold text-xs sm:text-sm py-1.5 bg-transparent border-none cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform duration-150 ${
                        isOpen ? "rotate-90" : "rotate-0"
                      }`}
                    />
                  </button>
                  <p
                    className={`mt-1.5 text-xs sm:text-sm leading-relaxed ${mutedText} ${
                      isOpen ? "block" : "sr-only"
                    }`}
                  >
                    {faq.a}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Cross-Game + Legal Footer */}
        <footer
          className={`w-full pt-6 border-t border-dashed flex flex-col items-center gap-3 text-center text-xs ${
            darkMode
              ? "border-slate-800 text-slate-400"
              : "border-[#C7DCEB] text-[#4E6478]"
          }`}
        >
          <nav aria-label="Mo Logic Games and Legal Links" className="flex flex-wrap justify-center gap-x-5 gap-y-2 font-semibold">
            <a
              href="/"
              onClick={(e) => handleLinkClick(e, onNavigateHome)}
              className="hover:underline text-sky-600 dark:text-sky-400"
            >
              Play Sudoku Sync
            </a>
            <a
              href="/about"
              onClick={(e) => handleLinkClick(e, () => onNavigateLegal("about"))}
              className="hover:underline"
            >
              About Us
            </a>
            <a
              href="/contact"
              onClick={(e) => handleLinkClick(e, () => onNavigateLegal("contact"))}
              className="hover:underline"
            >
              Contact Us
            </a>
            <a
              href="/privacy"
              onClick={(e) => handleLinkClick(e, () => onNavigateLegal("privacy"))}
              className="hover:underline"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              onClick={(e) => handleLinkClick(e, () => onNavigateLegal("terms"))}
              className="hover:underline"
            >
              Terms of Service
            </a>
          </nav>
          <span className="font-mono text-[11px] opacity-80">
            © 2026 Mo Logic · Block Sync &amp; SudokuSync. All rights reserved.
          </span>
        </footer>
      </div>
    </section>
  );
};
