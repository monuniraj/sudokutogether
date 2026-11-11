import React from "react";
import { ArrowLeft, Search } from "lucide-react";
import { useTranslation } from "../../../i18n/useTranslation";

export interface SudokuSolverScreenProps {
  navigatorPop: () => void;
}

export const SudokuSolverScreen: React.FC<SudokuSolverScreenProps> = ({
  navigatorPop,
}) => {
  const { t } = useTranslation();

  return (
    <div
      id="sudoku-solver-screen"
      className="h-[100dvh] max-h-full flex-1 min-h-0 w-full flex flex-col overflow-hidden select-none pt-[calc(70px+env(safe-area-inset-top,0px))] bg-slate-50 dark:bg-[#121212] text-stone-800 dark:text-stone-100 transition-colors duration-200"
    >
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 shrink-0 w-full px-3 sm:px-6 pt-2 sm:pt-3">
        <div className="max-w-3xl mx-auto rounded-2xl border-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-[0_6px_22px_rgba(55,48,163,0.06)] dark:shadow-[0_6px_22px_rgba(0,0,0,0.4)] px-3.5 py-3 sm:px-5 sm:py-3.5 flex items-center gap-3">
          <button
            type="button"
            id="solver-header-back-btn"
            onClick={navigatorPop}
            aria-label={t("back") || "Back"}
            title={t("back") || "Back"}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-0 outline-none shrink-0 flex items-center justify-center cursor-pointer active:scale-95 transition-all duration-150 bg-[#E0E7FF] hover:bg-[#C7D2FE] text-[#3730A3] dark:bg-indigo-950/70 dark:hover:bg-indigo-900/80 dark:text-[#c7d2fe] shadow-[0_2px_10px_rgba(55,48,163,0.08)]"
          >
            <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
          </button>

          <div className="min-w-0 flex-1 flex flex-col">
            <h1 className="font-sans font-black text-base sm:text-lg tracking-tight text-stone-800 dark:text-stone-100 truncate leading-tight">
              {t("sudokuSolverLabel")}
            </h1>
            <p className="font-sans font-medium text-[11px] sm:text-xs text-stone-500 dark:text-zinc-400 mt-0.5 leading-snug">
              Enter numbers from a newspaper to play or auto-solve.
            </p>
          </div>

          <div className="w-9 h-9 rounded-2xl border-0 shrink-0 flex items-center justify-center bg-[#EEF2FF] text-[#4338CA] dark:bg-indigo-950/60 dark:text-[#c7d2fe]">
            <Search className="w-4 h-4 stroke-[2.2]" />
          </div>
        </div>
      </header>

      {/* Solver Canvas Placeholder */}
      <main className="flex-1 min-h-0 w-full overflow-y-auto overscroll-contain flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md rounded-3xl border-0 bg-white/90 dark:bg-zinc-900/85 shadow-[0_12px_36px_rgba(55,48,163,0.06)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.45)] p-8 sm:p-10 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl border-0 flex items-center justify-center bg-[#E0E7FF] text-[#3730A3] dark:bg-indigo-950/70 dark:text-[#c7d2fe] shadow-[0_4px_14px_rgba(55,48,163,0.08)]">
            <Search className="w-5 h-5 stroke-[2.2]" />
          </div>
          <p className="font-sans font-bold text-base sm:text-lg text-stone-700 dark:text-stone-200 tracking-tight">
            Solver Canvas Goes Here
          </p>
        </div>
      </main>
    </div>
  );
};

