import React from "react";
import { RotateCcw, Trash2, Pencil, Lightbulb } from "lucide-react";
import { triggerHapticTap } from "../../utils/haptics";

export interface SudokuKeypadProps {
  boardState: {
    grid: Array<Array<{ value: number; [key: string]: any }>>;
    isGameOver?: boolean;
    maxHintsLimit?: number;
    hintsCount: number;
    [key: string]: any;
  } | null;
  historyLength: number;
  pencilMode: boolean;
  onTogglePencilMode: () => void;
  onUndo: () => void;
  onErase: () => void;
  onHint: () => void;
  hintInventory: number;
  onNumberSelect: (num: number) => void;
  lockedNum: number | null;
  isNumberFirstInputMode: boolean;
  showRemainingNumbers: boolean;
  visualizingBacktrack?: boolean;
  darkMode: boolean;
  playClickSound: () => void;
  vibrations?: boolean;
}

export const SudokuKeypad: React.FC<SudokuKeypadProps> = React.memo(({
  boardState,
  historyLength,
  pencilMode,
  onTogglePencilMode,
  onUndo,
  onErase,
  onHint,
  hintInventory,
  onNumberSelect,
  lockedNum,
  isNumberFirstInputMode,
  showRemainingNumbers,
  visualizingBacktrack,
  darkMode,
  playClickSound,
  vibrations
}) => {
  const isGameOver = boardState?.isGameOver ?? false;

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
      <div className="shrink-0 w-full flex flex-col mt-1 px-0.5 overflow-visible" id="game-utility-buttons-deck">
        <div className="grid grid-cols-4 gap-2 lg:gap-2 xl:gap-2.5 relative z-10 w-full overflow-visible">
          
          {/* UNDO BUTTON */}
          <button
            onClick={() => {
              playClickSound();
              triggerHapticTap(vibrations ?? true);
              onUndo();
            }}
            disabled={!boardState || isGameOver || historyLength === 0}
            className={`aspect-[1.12/1] lg:aspect-auto lg:min-h-[52px] xl:min-h-[56px] w-full p-2 transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed select-none rounded-[16px] lg:rounded-2xl flex flex-col items-center justify-center gap-0.5 lg:gap-1 active:scale-95 active:shadow-none border-none shadow-md ${
              darkMode 
                ? "bg-zinc-900 border border-sky-950 hover:bg-zinc-850 text-[#38BDF8] active:bg-zinc-800" 
                : "bg-[#E0F2FE] hover:bg-[#bae6fd] active:bg-[#C0E8FF] text-[#0369A1] shadow-[0_8px_16px_rgba(3,105,161,0.06),_0_2px_4px_rgba(0,0,0,0.02)]"
            }`}
          >
            <RotateCcw className={`w-[16px] h-[16px] lg:w-[18px] lg:h-[18px] xl:w-[20px] xl:h-[20px] stroke-[2.5] ${darkMode ? "text-[#38BDF8]" : "text-[#0369A1]"}`} />
            <span className="text-[9px] lg:text-[11px] xl:text-xs font-sans font-extrabold tracking-wider uppercase leading-none mt-1 lg:mt-0">
              Undo
            </span>
          </button>

          {/* ERASE BUTTON */}
          <button
            onClick={() => {
              playClickSound();
              triggerHapticTap(vibrations ?? true);
              onErase();
            }}
            disabled={!boardState || isGameOver}
            className={`aspect-[1.12/1] lg:aspect-auto lg:min-h-[52px] xl:min-h-[56px] w-full p-2 transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed select-none rounded-[16px] lg:rounded-2xl flex flex-col items-center justify-center gap-0.5 lg:gap-1 active:scale-95 active:shadow-none border-none shadow-md ${
              darkMode 
                ? "bg-zinc-900 border border-pink-950 hover:bg-zinc-850 text-[#F472B6] active:bg-zinc-800" 
                : "bg-[#FCE7F3] hover:bg-[#FBCFE8] active:bg-[#F9A8D4] text-[#9D174D] shadow-[0_8px_16px_rgba(157,23,77,0.06),_0_2px_4px_rgba(0,0,0,0.02)]"
            }`}
          >
            <Trash2 className={`w-[16px] h-[16px] lg:w-[18px] lg:h-[18px] xl:w-[20px] xl:h-[20px] ${darkMode ? "text-[#F472B6]" : "text-[#9D174D]"}`} />
            <span className="text-[9px] lg:text-[11px] xl:text-xs font-sans font-extrabold tracking-wider uppercase leading-none mt-1 lg:mt-0">
              Erase
            </span>
          </button>

          {/* NOTES ON/OFF BUTTON */}
          <button
            onClick={() => {
              playClickSound();
              triggerHapticTap(vibrations ?? true);
              onTogglePencilMode();
            }}
            disabled={!boardState || isGameOver}
            className={`aspect-[1.12/1] lg:aspect-auto lg:min-h-[52px] xl:min-h-[56px] w-full p-2 transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed select-none rounded-[16px] lg:rounded-2xl flex flex-col items-center justify-center gap-0.5 lg:gap-1 active:scale-95 active:shadow-none border-none shadow-md ${
              darkMode 
                ? (pencilMode 
                    ? "bg-[#713f12] hover:bg-[#854d0e] active:bg-[#854d0e] text-[#facc15] font-black border border-yellow-950" 
                    : "bg-zinc-900 hover:bg-zinc-850 active:bg-zinc-800 text-[#C084FC] border border-purple-950")
                : (pencilMode 
                    ? "bg-[#FFF99D] hover:bg-[#FEF08A] active:bg-[#FDE047] text-[#854D0E] font-black shadow-[0_8px_16px_rgba(133,77,14,0.12),_0_2px_4px_rgba(0,0,0,0.02)]" 
                    : "bg-[#F3E8FF] hover:bg-[#E9D5FF] active:bg-[#D8B4FE] text-[#6B21A8] shadow-[0_8px_16px_rgba(107,33,168,0.06),_0_2px_4px_rgba(0,0,0,0.02)]")
            }`}
          >
            <Pencil className="w-[16px] h-[16px] lg:w-[18px] lg:h-[18px] xl:w-[20px] xl:h-[20px]" />
            <span className="text-[9px] lg:text-[11px] xl:text-xs font-sans font-extrabold tracking-wider uppercase leading-none mt-1 lg:mt-0">
              Notes {pencilMode ? "ON" : "OFF"}
            </span>
          </button>

          {/* HINT BUTTON */}
          <button
            onClick={() => {
              playClickSound();
              triggerHapticTap(vibrations ?? true);
              onHint();
            }}
            disabled={!boardState || isGameOver}
            className={`aspect-[1.12/1] lg:aspect-auto lg:min-h-[52px] xl:min-h-[56px] w-full p-2 transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed select-none rounded-[16px] lg:rounded-2xl flex flex-col items-center justify-center gap-0.5 lg:gap-1 active:scale-95 active:shadow-none border-none shadow-md ${
              darkMode 
                ? "bg-zinc-900 border border-emerald-950 hover:bg-zinc-850 text-[#34D399] active:bg-[#135236]" 
                : "bg-[#E6F4EA] hover:bg-[#D1FAE5] text-[#135236] shadow-[0_8px_16px_rgba(19,82,54,0.06),_0_2px_4px_rgba(0,0,0,0.02)]"
            }`}
          >
            <div className="relative pointer-events-none flex items-center justify-center">
              <Lightbulb className={`w-[16px] h-[16px] lg:w-[18px] lg:h-[18px] xl:w-[20px] xl:h-[20px] ${darkMode ? "text-[#34D399]" : "text-[#135236]"}`} />
              <span className={`absolute -top-1.5 -right-2 text-[7px] lg:text-[8px] font-mono font-black rounded-full h-3.5 w-3.5 lg:h-4 lg:w-4 border flex items-center justify-center shadow-sm ${
                darkMode ? "bg-[#FBCFE8] text-[#831843] border-[#FBCFE8]" : "bg-[#FCE7F3] text-[#9D174D] border-white"
              }`}>
                {effectiveHintCount}
              </span>
            </div>
            <span className="text-[9px] lg:text-[11px] xl:text-xs font-sans font-extrabold tracking-wider uppercase leading-none mt-1 lg:mt-0">
              Hint
            </span>
          </button>
        </div>
      </div>

      {/* 2. NUMBER PAD: 1-9 */}
      <div className="shrink-0 w-full mt-1 lg:mt-0 pb-0.5 overflow-visible px-1 sm:px-0" id="game-number-pad-deck">
        <div className="grid grid-cols-9 lg:grid-cols-3 gap-1 sm:gap-1.5 lg:gap-2.5 xl:gap-3 w-full select-none overflow-visible">
          {Array.from({ length: 9 }).map((_, i) => {
            const num = i + 1;
            const isLocked = isNumberFirstInputMode && (lockedNum === num);
            const remainingCount = remainingCounts[num] ?? 0;

            return (
              <button
                key={num}
                onClick={() => {
                  playClickSound();
                  triggerHapticTap(vibrations ?? true);
                  onNumberSelect(num);
                }}
                disabled={!boardState || isGameOver || visualizingBacktrack || remainingCount <= 0}
                className={`aspect-[1/1.55] lg:aspect-[1/1.25] w-full relative flex items-center justify-center font-sans font-normal cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none transition-all rounded-xl lg:rounded-2xl border-none hover:translate-y-[-1px] active:scale-95 active:shadow-none shadow-md ${
                  isLocked 
                    ? (darkMode 
                        ? "bg-[#713f12] text-[#facc15] active:bg-[#854d0e] border border-yellow-950" 
                        : "bg-[#FFF99D] text-[#854D0E] active:bg-[#FDE047] shadow-[0_8px_16px_rgba(133,77,14,0.12),_0_2px_4px_rgba(0,0,0,0.02)]")
                    : (darkMode 
                        ? "bg-[#1E1E26] text-sky-450 hover:bg-[#252530] border border-zinc-805 shadow-[0_4px_10px_rgba(0,0,0,0.4)]" 
                        : "bg-white/95 text-[#2B6CB0] hover:bg-white active:bg-stone-250 shadow-[0_8px_16px_rgba(43,108,176,0.08),_0_2px_4px_rgba(0,0,0,0.02)]")
                }`}
              >
                <div className="flex flex-col items-center justify-center absolute inset-0">
                  <span 
                    className="leading-none flex items-center justify-center font-bold text-2xl lg:text-3xl"
                  >
                    {num}
                  </span>
                  {showRemainingNumbers && (
                    <span className={`text-[9px] lg:text-xs xl:text-sm font-mono leading-none mt-1 lg:mt-1.5 font-semibold text-slate-500 dark:text-slate-400 ${remainingCount <= 0 ? "opacity-35" : "opacity-90"}`}>
                      {remainingCount > 0 ? remainingCount : "✓"}
                    </span>
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
