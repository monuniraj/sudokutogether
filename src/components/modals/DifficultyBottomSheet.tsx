import React, { useEffect } from "react";
import { Timer, X } from "lucide-react";
import {
  DIFFICULTY_GRID_THEMES,
  NOTE_BADGE_TEXT,
  type Difficulty,
} from "../game/SudokuBoard";
import { useTranslation } from "../../i18n/useTranslation";

export interface DifficultyBottomSheetProps {
  isOpen: boolean;
  darkMode: boolean;
  bestTimes: Record<Difficulty, number>;
  onSelectDifficulty: (difficulty: Difficulty) => void;
  onClose: () => void;
  formatTimer: (seconds: number) => string;
}

const DIFFICULTY_LEVELS: readonly Difficulty[] = [
  "EASY",
  "MEDIUM",
  "HARD",
  "EXPERT",
];

export const DifficultyBottomSheet: React.FC<DifficultyBottomSheetProps> = ({
  isOpen,
  darkMode,
  bestTimes,
  onSelectDifficulty,
  onClose,
  formatTimer,
}) => {
  const { t } = useTranslation();
  const modeKey = darkMode ? "dark" : "light";

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      id="difficulty-bottom-sheet-root"
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-[10002] flex flex-col justify-end items-center select-none ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Dimmed Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/35 backdrop-blur-[2px] transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Bottom Sheet Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("selectDifficulty")}
        id="difficulty-bottom-sheet-panel"
        className={`relative z-[10003] w-full max-w-md rounded-t-[28px] sm:rounded-[28px] sm:mb-4 px-5 pt-3.5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] border-none transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
          isOpen ? "translate-y-0" : "translate-y-full"
        } ${
          darkMode
            ? "bg-[#18181b] text-stone-100 shadow-[0_-12px_45px_rgba(0,0,0,0.55)]"
            : "bg-[#FDFBF7] text-stone-850 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]"
        }`}
      >
        {/* Subtle Drag Handle Pill */}
        <div className="w-10 h-1 rounded-full mx-auto mb-3.5 bg-stone-300/80 dark:bg-zinc-700/80 pointer-events-none" />

        {/* Sheet Header */}
        <div className="flex items-center justify-between gap-3 mb-4 px-0.5">
          <span
            className={`font-mono text-xs font-black uppercase tracking-wider truncate ${
              darkMode ? "text-zinc-300" : "text-stone-700"
            }`}
          >
            {t("selectDifficulty")}
          </span>
          <button
            type="button"
            tabIndex={isOpen ? 0 : -1}
            onClick={onClose}
            aria-label={t("closeTooltip")}
            title={t("closeTooltip")}
            className={`w-8 h-8 rounded-full border-none outline-none flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-95 shrink-0 ${
              darkMode
                ? "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300"
                : "bg-stone-200/60 hover:bg-stone-200 text-stone-600"
            }`}
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* 4 Luxury Minimal Vertical Cards (Strictly Title + Personal Best) */}
        <div className="flex flex-col gap-2.5">
          {DIFFICULTY_LEVELS.map((lvl) => {
            const themeSurface = DIFFICULTY_GRID_THEMES[lvl].crosshair[modeKey];
            const pillSurface = DIFFICULTY_GRID_THEMES[lvl].activeCell[modeKey];
            const themeText = NOTE_BADGE_TEXT[lvl][modeKey];
            const bestSecs = bestTimes[lvl] || 0;

            return (
              <button
                key={lvl}
                type="button"
                tabIndex={isOpen ? 0 : -1}
                id={`difficulty-sheet-card-${lvl.toLowerCase()}`}
                onClick={() => onSelectDifficulty(lvl)}
                style={{
                  backgroundColor: themeSurface,
                  color: themeText,
                  border: "none",
                }}
                className="w-full py-4 px-5 rounded-2xl border-none outline-none flex items-center justify-between gap-3 transition-transform duration-150 cursor-pointer active:scale-[0.98] shadow-[0_4px_14px_rgba(0,0,0,0.03)] dark:shadow-[0_6px_18px_rgba(0,0,0,0.28)]"
              >
                <span className="font-sans font-black text-base sm:text-lg uppercase tracking-wider leading-none truncate">
                  {t(lvl.toLowerCase() as "easy" | "medium" | "hard" | "expert")}
                </span>

                <span
                  style={{
                    backgroundColor: pillSurface,
                    color: themeText,
                  }}
                  className="px-3 py-1.5 rounded-xl font-mono text-xs font-bold tracking-wide inline-flex items-center gap-1.5 shrink-0 shadow-[0_2px_6px_rgba(0,0,0,0.04)]"
                >
                  <Timer className="w-3.5 h-3.5 stroke-[2.3] shrink-0 opacity-85" />
                  <span className="uppercase opacity-85">{t("bestLabel")}</span>
                  <span className="font-black tabular-nums">
                    {bestSecs > 0 ? formatTimer(bestSecs) : "--:--"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

