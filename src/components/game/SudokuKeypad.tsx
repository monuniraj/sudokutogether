import React from "react";
import { RotateCcw, Trash2, Pencil, Lightbulb, Check, Zap } from "lucide-react";
import { triggerHapticTap } from "../../utils/haptics";
import { useTranslation } from "../../i18n/useTranslation";

export interface SudokuKeypadProps {
  boardState: {
    grid: Array<Array<{ value: number; [key: string]: any }>>;
    isGameOver?: boolean;
    maxHintsLimit?: number;
    hintsCount: number;
    difficulty?: string;
    [key: string]: any;
  } | null;
  difficulty?: string;
  historyLength: number;
  pencilMode: boolean;
  onTogglePencilMode: () => void;
  onUndo: () => void;
  onErase: () => void;
  onHint: () => void;
  hintInventory: number;
  onNumberSelect: (num: number) => void;
  lockedNum: number | null;
  activeKeypadNum?: number | null;
  isNumberFirstInputMode: boolean;
  onToggleNumberFirstMode?: () => void;
  showRemainingNumbers: boolean;
  visualizingBacktrack?: boolean;
  darkMode: boolean;
  playClickSound: () => void;
  playEraseSound?: () => void;
  vibrations?: boolean;
}

export const SudokuKeypad: React.FC<SudokuKeypadProps> = React.memo(({
  boardState,
  difficulty,
  historyLength,
  pencilMode,
  onTogglePencilMode,
  onUndo,
  onErase,
  onHint,
  hintInventory,
  onNumberSelect,
  lockedNum,
  activeKeypadNum,
  isNumberFirstInputMode,
  onToggleNumberFirstMode,
  showRemainingNumbers,
  visualizingBacktrack,
  darkMode,
  playClickSound,
  playEraseSound,
  vibrations = true
}) => {
  const { t } = useTranslation();
  const isGameOver = boardState?.isGameOver ?? false;

  const currentDiff = (((difficulty || boardState?.difficulty) ?? "MEDIUM").toUpperCase());
  const activeKeypadTheme = darkMode ? (
    currentDiff === "EASY" ? "bg-[#0e8365] text-white font-black active:bg-[#0e8365] border border-emerald-500/70 shadow-[0_8px_16px_rgba(0,0,0,0.4)]" :
    currentDiff === "MEDIUM" ? "bg-[#713f12] text-[#fef08a] active:bg-[#713f12] border border-yellow-800 shadow-[0_8px_16px_rgba(0,0,0,0.4)]" :
    currentDiff === "HARD" ? "bg-[#581db8] text-white font-black active:bg-[#581db8] border border-purple-500/70 shadow-[0_8px_16px_rgba(0,0,0,0.4)]" :
    "bg-[#881337] text-[#fecdd3] active:bg-[#881337] border border-rose-800 shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
  ) : (
    currentDiff === "EASY" ? "bg-[#86EFAC] text-[#065F46] active:bg-[#86EFAC] border border-emerald-400 shadow-[0_8px_16px_rgba(6,95,70,0.12),_0_2px_4px_rgba(0,0,0,0.02)]" :
    currentDiff === "MEDIUM" ? "bg-[#FCD34D] text-[#78350F] font-black active:bg-[#FCD34D] border border-amber-500 shadow-[0_8px_16px_rgba(133,77,14,0.16),_0_2px_4px_rgba(0,0,0,0.02)]" :
    currentDiff === "HARD" ? "bg-[#D8B4FE] text-[#6B21A8] active:bg-[#D8B4FE] border border-purple-400 shadow-[0_8px_16px_rgba(107,33,168,0.12),_0_2px_4px_rgba(0,0,0,0.02)]" :
    "bg-[#F9A8D4] text-[#9D174D] active:bg-[#F9A8D4] border border-rose-400 shadow-[0_8px_16px_rgba(157,23,77,0.12),_0_2px_4px_rgba(0,0,0,0.02)]"
  );

  // Remaining count per digit 1..9
  const remainingCounts: Record<number, number> = {};
  for (let num = 1; num <= 9; num++) {
    let count = 0;
    if (boardState) {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (boardState.grid[r][c].value === num) {
            count++;
          }
        }
      }
    }
    remainingCounts[num] = 9 - count;
  }

  const effectiveHintCount = boardState && boardState.maxHintsLimit !== undefined
    ? Math.max(0, boardState.maxHintsLimit - boardState.hintsCount)
    : hintInventory;

  return (
    <>
      {/* 1. UTILITY BUTTONS: Undo, Erase, Notes, Hint */}
      <div className="shrink-0 w-full flex flex-col px-0.5 overflow-visible" id="game-utility-buttons-deck">
        <div className="grid grid-cols-4 gap-2 w-full relative z-10 overflow-visible">
          
          {/* UNDO BUTTON */}
          <button
            onClick={() => {
              playClickSound();
              triggerHapticTap(vibrations);
              onUndo();
            }}
            disabled={!boardState || isGameOver || historyLength === 0}
            className={`aspect-[1.12/1] lg:aspect-auto lg:h-[52px] w-full relative transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed select-none rounded-[16px] lg:rounded-2xl active:scale-95 active:shadow-none border-none shadow-md ${
              darkMode 
                ? "bg-zinc-900 border border-sky-950 hover:bg-zinc-850 text-[#38BDF8] active:bg-zinc-800" 
                : "bg-[#E0F2FE] hover:bg-[#bae6fd] active:bg-[#C0E8FF] text-[#0369A1] shadow-[0_8px_16px_rgba(3,105,161,0.06),_0_2px_4px_rgba(0,0,0,0.02)]"
            }`}
            style={{ containerType: 'size' }}
          >
            {/* Outer 10% Symmetrical Safe-Zone */}
            <div className="absolute inset-0 p-[10%] flex flex-col items-center justify-between select-none pointer-events-none">
              {/* Core 80% Area */}
              <div className="w-full h-full flex flex-col items-center justify-between overflow-visible leading-none">
                {/* Icon Track: ~58% of Core Height */}
                <div className="h-[58%] w-full flex items-center justify-center overflow-visible shrink-0">
                  <RotateCcw className="h-full w-auto max-h-[34cqmin] max-w-[34cqmin] aspect-square stroke-[2] select-none text-inherit shrink-0" />
                </div>

                {/* Micro-Gap: ~8% */}
                <div className="h-[8%] shrink-0" aria-hidden="true" />

                {/* Label Track: ~34% of Core Height */}
                <div className="h-[34%] w-full flex items-center justify-center overflow-visible shrink-0">
                  <span className="text-[clamp(9px,17cqmin,12px)] font-medium tracking-tight leading-none text-center truncate max-w-full select-none px-0.5">
                    {t("undo")}
                  </span>
                </div>
              </div>
            </div>
          </button>

          {/* ERASE BUTTON */}
          <button
            onClick={() => {
              if (playEraseSound) {
                playEraseSound();
              } else {
                playClickSound();
              }
              triggerHapticTap(vibrations);
              onErase();
            }}
            disabled={!boardState || isGameOver}
            className={`aspect-[1.12/1] lg:aspect-auto lg:h-[52px] w-full relative transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed select-none rounded-[16px] lg:rounded-2xl active:scale-95 active:shadow-none border-none shadow-md ${
              darkMode 
                ? "bg-zinc-900 border border-pink-950 hover:bg-zinc-850 text-[#F472B6] active:bg-zinc-800" 
                : "bg-[#FCE7F3] hover:bg-[#FBCFE8] active:bg-[#F9A8D4] text-[#9D174D] shadow-[0_8px_16px_rgba(157,23,77,0.06),_0_2px_4px_rgba(0,0,0,0.02)]"
            }`}
            style={{ containerType: 'size' }}
          >
            {/* Outer 10% Symmetrical Safe-Zone */}
            <div className="absolute inset-0 p-[10%] flex flex-col items-center justify-between select-none pointer-events-none">
              {/* Core 80% Area */}
              <div className="w-full h-full flex flex-col items-center justify-between overflow-visible leading-none">
                {/* Icon Track: ~58% of Core Height */}
                <div className="h-[58%] w-full flex items-center justify-center overflow-visible shrink-0">
                  <Trash2 className="h-full w-auto max-h-[34cqmin] max-w-[34cqmin] aspect-square stroke-[2] select-none text-inherit shrink-0" />
                </div>

                {/* Micro-Gap: ~8% */}
                <div className="h-[8%] shrink-0" aria-hidden="true" />

                {/* Label Track: ~34% of Core Height */}
                <div className="h-[34%] w-full flex items-center justify-center overflow-visible shrink-0">
                  <span className="text-[clamp(9px,17cqmin,12px)] font-medium tracking-tight leading-none text-center truncate max-w-full select-none px-0.5">
                    {t("erase")}
                  </span>
                </div>
              </div>
            </div>
          </button>

          {/* NOTES ON/OFF BUTTON */}
          <button
            onClick={() => {
              playClickSound();
              triggerHapticTap(vibrations);
              onTogglePencilMode();
            }}
            disabled={!boardState || isGameOver}
            className={`aspect-[1.12/1] lg:aspect-auto lg:h-[52px] w-full relative transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed select-none rounded-[16px] lg:rounded-2xl active:scale-95 active:shadow-none border-none shadow-md ${
              darkMode 
                ? (pencilMode 
                    ? "bg-[#713f12] hover:bg-[#854d0e] active:bg-[#854d0e] text-[#facc15] font-black border border-yellow-950" 
                    : "bg-zinc-900 hover:bg-zinc-850 active:bg-zinc-800 text-[#C084FC] border border-purple-950")
                : (pencilMode 
                    ? "bg-[#FFF99D] hover:bg-[#FEF08A] active:bg-[#FDE047] text-[#854D0E] font-black shadow-[0_8px_16px_rgba(133,77,14,0.12),_0_2px_4px_rgba(0,0,0,0.02)]" 
                    : "bg-[#F3E8FF] hover:bg-[#E9D5FF] active:bg-[#D8B4FE] text-[#6B21A8] shadow-[0_8px_16px_rgba(107,33,168,0.06),_0_2px_4px_rgba(0,0,0,0.02)]")
            }`}
            style={{ containerType: 'size' }}
          >
            {/* Outer 10% Symmetrical Safe-Zone */}
            <div className="absolute inset-0 p-[10%] flex flex-col items-center justify-between select-none pointer-events-none">
              {/* Core 80% Area */}
              <div className="w-full h-full flex flex-col items-center justify-between overflow-visible leading-none">
                {/* Icon Track: ~58% of Core Height */}
                <div className="h-[58%] w-full flex items-center justify-center overflow-visible shrink-0">
                  <Pencil className="h-full w-auto max-h-[34cqmin] max-w-[34cqmin] aspect-square stroke-[2] select-none text-inherit shrink-0" />
                </div>

                {/* Micro-Gap: ~8% */}
                <div className="h-[8%] shrink-0" aria-hidden="true" />

                {/* Label Track: ~34% of Core Height */}
                <div className="h-[34%] w-full flex items-center justify-center overflow-visible shrink-0">
                  <span className="text-[clamp(9px,17cqmin,12px)] font-medium tracking-tight leading-none text-center truncate max-w-full select-none px-0.5">
                    {pencilMode ? t("notesOn") : t("notesOff")}
                  </span>
                </div>
              </div>
            </div>
          </button>

          {/* HINT BUTTON */}
          <button
            onClick={() => {
              playClickSound();
              triggerHapticTap(vibrations);
              onHint();
            }}
            disabled={!boardState || isGameOver}
            className={`aspect-[1.12/1] lg:aspect-auto lg:h-[52px] w-full relative transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed select-none rounded-[16px] lg:rounded-2xl active:scale-95 active:shadow-none border-none shadow-md ${
              darkMode 
                ? "bg-zinc-900 border border-emerald-950 hover:bg-zinc-850 text-[#34D399] active:bg-[#135236]" 
                : "bg-[#E6F4EA] hover:bg-[#D1FAE5] text-[#135236] shadow-[0_8px_16px_rgba(19,82,54,0.06),_0_2px_4px_rgba(0,0,0,0.02)]"
            }`}
            style={{ containerType: 'size' }}
          >
            {/* Outer 10% Symmetrical Safe-Zone */}
            <div className="absolute inset-0 p-[10%] flex flex-col items-center justify-between select-none pointer-events-none">
              {/* Core 80% Area */}
              <div className="w-full h-full flex flex-col items-center justify-between overflow-visible leading-none">
                {/* Icon Track: ~58% of Core Height with Hint Badge */}
                <div className="h-[58%] w-full flex items-center justify-center overflow-visible shrink-0">
                  <div className="relative flex items-center justify-center h-full aspect-square max-h-[34cqmin] max-w-[34cqmin] shrink-0">
                    <Lightbulb className="h-full w-auto aspect-square stroke-[2] select-none text-inherit shrink-0" />
                    <span className={`absolute -top-1 -right-1.5 text-[8px] sm:text-[9px] font-mono font-black rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border flex items-center justify-center shadow-sm select-none ${
                      darkMode ? "bg-[#FBCFE8] text-[#831843] border-[#FBCFE8]" : "bg-[#FCE7F3] text-[#9D174D] border-white"
                    }`}>
                      {effectiveHintCount}
                    </span>
                  </div>
                </div>

                {/* Micro-Gap: ~8% */}
                <div className="h-[8%] shrink-0" aria-hidden="true" />

                {/* Label Track: ~34% of Core Height */}
                <div className="h-[34%] w-full flex items-center justify-center overflow-visible shrink-0">
                  <span className="text-[clamp(9px,17cqmin,12px)] font-medium tracking-tight leading-none text-center truncate max-w-full select-none px-0.5">
                    {t("hint")}
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 2. NUMBER PAD: 1-9 */}
      <div className="shrink-0 w-full mt-1 lg:mt-0 pb-0.5 overflow-visible px-1 sm:px-0" id="game-number-pad-deck">
        <div className="grid grid-cols-9 lg:grid-cols-3 gap-1 sm:gap-1.5 lg:gap-2 xl:gap-2.5 w-full select-none overflow-visible">
          {Array.from({ length: 9 }).map((_, i) => {
            const num = i + 1;
            const isSelected = isGameOver 
              ? (activeKeypadNum === num || lockedNum === num)
              : ((isNumberFirstInputMode && lockedNum === num) || (!isNumberFirstInputMode && activeKeypadNum === num));
            const remainingCount = remainingCounts[num] ?? 0;

            return (
              <button
                key={num}
                onClick={() => {
                  playClickSound();
                  triggerHapticTap(vibrations);
                  onNumberSelect(num);
                }}
                disabled={!boardState || visualizingBacktrack || (!isGameOver && remainingCount <= 0)}
                className={`aspect-[1/1.55] lg:aspect-[1/1.02] w-full relative flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none transition-all rounded-xl lg:rounded-2xl border-none hover:translate-y-[-1px] active:scale-95 active:shadow-none shadow-md ${
                  isSelected 
                    ? activeKeypadTheme
                    : (darkMode 
                        ? "bg-zinc-900 text-sky-450 hover:bg-zinc-850 border border-zinc-805 shadow-[0_4px_10px_rgba(0,0,0,0.4)]" 
                        : "bg-white/95 text-[#2B6CB0] hover:bg-white active:bg-stone-250 shadow-[0_8px_16px_rgba(43,108,176,0.08),_0_2px_4px_rgba(0,0,0,0.02)]")
                }`}
              >
                {/* Symmetrically Padded Outer Stage (10% Top, 10% Bottom, 4% Sides) */}
                <div 
                  className="absolute inset-0 flex flex-col items-center justify-between select-none pointer-events-none pt-[10%] pb-[10%] px-[4%]"
                  style={{ containerType: 'size' }}
                >
                  {showRemainingNumbers ? (
                    <>
                      {/* 1. Primary Digit Track: Exactly 53.6% of outer button height (67% of 80% budget) */}
                      <div 
                        className="h-[67%] w-full flex items-center justify-center overflow-visible"
                        style={{ fontSize: 'clamp(34px, 58cqh, 60px)' }}
                      >
                        <span className="handwriting font-normal text-[1em] leading-[0.8] select-none flex items-center justify-center translate-y-[3%]">
                          {num}
                        </span>
                      </div>

                      {/* 2. Inter-Digit Middle Gap: Exactly 5% dedicated vertical gap spacer (6.25% of 80% budget) */}
                      <div className="h-[6.25%] shrink-0" aria-hidden="true" />

                      {/* 3. Sub-Count Track: Exactly 21.4% of outer button height (26.75% of 80% budget, 40% scale) */}
                      <div 
                        className="h-[26.75%] w-full flex items-center justify-center overflow-visible"
                        style={{ fontSize: 'clamp(34px, 58cqh, 60px)' }}
                      >
                        <span className={`text-[0.40em] font-mono font-black leading-none select-none flex items-center justify-center -translate-y-[2%] ${
                          isSelected 
                            ? (darkMode && (currentDiff === "EASY" || currentDiff === "HARD")
                                ? "text-white/95"
                                : !darkMode && currentDiff === "MEDIUM"
                                  ? "text-[#78350F]"
                                  : "text-stone-900 dark:text-white")
                            : "text-stone-400 dark:text-zinc-500"
                        } ${remainingCount <= 0 ? "opacity-35" : "opacity-90"}`}>
                          {remainingCount > 0 ? remainingCount : <Check className="w-[0.45em] h-[0.45em] stroke-[3]" />}
                        </span>
                      </div>
                    </>
                  ) : (
                    /* When completed or remaining counts disabled: 80% area for centered single digit */
                    <div 
                      className="h-full w-full flex items-center justify-center overflow-visible"
                      style={{ fontSize: 'clamp(44px, 76cqh, 78px)' }}
                    >
                      <span className="handwriting font-normal text-[1em] leading-[0.8] select-none flex items-center justify-center">
                        {num}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
});

SudokuKeypad.displayName = "SudokuKeypad";
