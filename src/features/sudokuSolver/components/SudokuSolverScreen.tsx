import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Clock, Delete, Lock, Search, Trash2 } from "lucide-react";
import {
  SudokuBoard,
  type Difficulty,
  type SudokuBoardState,
} from "../../../components/game/SudokuBoard";
import { SudokuKeypad } from "../../../components/game/SudokuKeypad";
import { useTranslation } from "../../../i18n/useTranslation";

export interface SudokuSolverScreenProps {
  navigatorPop: () => void;
  darkMode?: boolean;
}

const EMPTY_SOLUTION_GRID: number[][] = [];

const createEmptyGrid = (): number[][] =>
  Array.from({ length: 9 }, () => Array<number>(9).fill(0));

/**
 * Checks rows, columns, and 3x3 boxes for duplicate non-zero digits and returns
 * stringified `"r,c"` coordinates for every conflicting cell.
 */
function validateGrid(grid: number[][]): Set<string> {
  const conflicts = new Set<string>();

  // Row duplicates
  for (let r = 0; r < 9; r++) {
    const seen = new Map<number, Array<{ r: number; c: number }>>();
    for (let c = 0; c < 9; c++) {
      const val = grid[r][c];
      if (val === 0) continue;
      const list = seen.get(val) ?? [];
      list.push({ r, c });
      seen.set(val, list);
    }
    seen.forEach((coords) => {
      if (coords.length > 1) {
        coords.forEach(({ r: cr, c: cc }) => conflicts.add(`${cr},${cc}`));
      }
    });
  }

  // Column duplicates
  for (let c = 0; c < 9; c++) {
    const seen = new Map<number, Array<{ r: number; c: number }>>();
    for (let r = 0; r < 9; r++) {
      const val = grid[r][c];
      if (val === 0) continue;
      const list = seen.get(val) ?? [];
      list.push({ r, c });
      seen.set(val, list);
    }
    seen.forEach((coords) => {
      if (coords.length > 1) {
        coords.forEach(({ r: cr, c: cc }) => conflicts.add(`${cr},${cc}`));
      }
    });
  }

  // 3x3 Box duplicates
  for (let boxRow = 0; boxRow < 9; boxRow += 3) {
    for (let boxCol = 0; boxCol < 9; boxCol += 3) {
      const seen = new Map<number, Array<{ r: number; c: number }>>();
      for (let dr = 0; dr < 3; dr++) {
        for (let dc = 0; dc < 3; dc++) {
          const r = boxRow + dr;
          const c = boxCol + dc;
          const val = grid[r][c];
          if (val === 0) continue;
          const list = seen.get(val) ?? [];
          list.push({ r, c });
          seen.set(val, list);
        }
      }
      seen.forEach((coords) => {
        if (coords.length > 1) {
          coords.forEach(({ r: cr, c: cc }) => conflicts.add(`${cr},${cc}`));
        }
      });
    }
  }

  return conflicts;
}

export const SudokuSolverScreen: React.FC<SudokuSolverScreenProps> = ({
  navigatorPop,
  darkMode,
}) => {
  const { t } = useTranslation();
  const isDarkMode =
    darkMode ??
    (typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark"));

  const [solverGrid, setSolverGrid] = useState<number[][]>(() => createEmptyGrid());
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(
    null
  );
  const [conflictCells, setConflictCells] = useState<Set<string>>(() => new Set());

  const noopSound = useCallback(() => {}, []);

  const clueCount = useMemo(() => {
    let total = 0;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (solverGrid[r][c] !== 0) total++;
      }
    }
    return total;
  }, [solverGrid]);

  const difficultyMeta = useMemo<{
    difficultyText: string;
    colorClass: string;
    boardDifficulty: Difficulty;
  }>(() => {
    if (clueCount < 17) {
      return {
        difficultyText: "Min 17 clues needed",
        colorClass: "text-amber-500",
        boardDifficulty: "MEDIUM",
      };
    }
    if (clueCount <= 24) {
      return {
        difficultyText: "Expert",
        colorClass: "text-rose-500",
        boardDifficulty: "EXPERT",
      };
    }
    if (clueCount <= 29) {
      return {
        difficultyText: "Hard",
        colorClass: "text-amber-500",
        boardDifficulty: "HARD",
      };
    }
    if (clueCount <= 35) {
      return {
        difficultyText: "Medium",
        colorClass: "text-cyan-500",
        boardDifficulty: "MEDIUM",
      };
    }
    return {
      difficultyText: "Easy",
      colorClass: "text-emerald-500",
      boardDifficulty: "EASY",
    };
  }, [clueCount]);

  const applyCellValue = useCallback(
    (num: number) => {
      if (!selectedCell) return;
      const { r, c } = selectedCell;
      setSolverGrid((prev) => {
        const nextGrid = prev.map((row) => [...row]);
        nextGrid[r][c] = num;
        setConflictCells(validateGrid(nextGrid));
        return nextGrid;
      });
    },
    [selectedCell]
  );

  const handleClearGrid = useCallback(() => {
    setSolverGrid(createEmptyGrid());
    setConflictCells(new Set());
    setSelectedCell(null);
  }, []);

  const handleErase = useCallback(() => {
    applyCellValue(0);
  }, [applyCellValue]);

  const handleCellClick = useCallback((r: number, c: number) => {
    setSelectedCell({ r, c });
  }, []);

  // Desktop keyboard support for fast newspaper clue entry
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;
      if (e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        applyCellValue(Number(e.key));
      } else if (e.key === "0" || e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        applyCellValue(0);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedCell((prev) =>
          prev ? { r: (prev.r + 8) % 9, c: prev.c } : { r: 0, c: 0 }
        );
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedCell((prev) =>
          prev ? { r: (prev.r + 1) % 9, c: prev.c } : { r: 0, c: 0 }
        );
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedCell((prev) =>
          prev ? { r: prev.r, c: (prev.c + 8) % 9 } : { r: 0, c: 0 }
        );
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setSelectedCell((prev) =>
          prev ? { r: prev.r, c: (prev.c + 1) % 9 } : { r: 0, c: 0 }
        );
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedCell, applyCellValue]);

  const boardState = useMemo<SudokuBoardState>(
    () => ({
      grid: solverGrid.map((row) =>
        row.map((cellValue) => ({
          value: cellValue,
          isOriginalClue: cellValue !== 0,
          isGiven: cellValue !== 0,
          notes: [],
        }))
      ),
      selectedRow: selectedCell?.r ?? null,
      selectedCol: selectedCell?.c ?? null,
      difficulty: difficultyMeta.boardDifficulty,
      hintsCount: 0,
      isGameOver: false,
    }),
    [solverGrid, selectedCell, difficultyMeta.boardDifficulty]
  );

  const selectedCellValue =
    selectedCell && solverGrid[selectedCell.r]?.[selectedCell.c] !== 0
      ? solverGrid[selectedCell.r][selectedCell.c]
      : null;

  const isLockDisabled = clueCount < 17 || conflictCells.size > 0;

  return (
    <div
      id="sudoku-solver-screen"
      className="h-[100dvh] max-h-full flex-1 min-h-0 w-full flex flex-col overflow-hidden select-none pt-[calc(70px+env(safe-area-inset-top,0px))] bg-slate-50 dark:bg-[#121212] text-stone-800 dark:text-stone-100 transition-colors duration-200"
    >
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 shrink-0 w-full px-3 sm:px-6 pt-2 sm:pt-3">
        <div className="max-w-3xl mx-auto rounded-2xl border-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-[0_6px_22px_rgba(55,48,163,0.06)] dark:shadow-[0_6px_22px_rgba(0,0,0,0.4)] px-3.5 py-2.5 sm:px-5 sm:py-3 flex items-center gap-3">
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

      {/* Solver Status Sub-Bar */}
      <div className="shrink-0 w-full px-3 sm:px-6 pt-2">
        <div
          id="solver-status-subbar"
          className="max-w-3xl mx-auto flex items-center justify-between gap-2 px-4 py-2 rounded-2xl border-0 bg-white/85 dark:bg-zinc-900/85 shadow-[0_4px_16px_rgba(55,48,163,0.05)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.35)]"
        >
          <div className="min-w-0 flex items-center gap-1.5 font-sans text-xs sm:text-sm font-bold text-stone-600 dark:text-zinc-300 truncate">
            <span className="tabular-nums shrink-0">
              Clues: {clueCount} / 81
            </span>
            <span className="opacity-45 shrink-0">•</span>
            <span className={`truncate font-extrabold ${difficultyMeta.colorClass}`}>
              {difficultyMeta.difficultyText}
            </span>
          </div>

          <button
            type="button"
            id="solver-history-btn"
            onClick={() => alert(t("comingSoonMessage"))}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-0 outline-none text-xs font-bold cursor-pointer active:scale-95 transition-all duration-150 bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#3730A3] dark:bg-indigo-950/60 dark:hover:bg-indigo-900/75 dark:text-[#c7d2fe] shadow-[0_2px_8px_rgba(55,48,163,0.06)]"
          >
            <Clock className="w-3.5 h-3.5 stroke-[2.2] shrink-0" />
            <span>History</span>
          </button>
        </div>
      </div>

      {/* Main Solver Grid & Control Deck */}
      <main className="flex-1 min-h-0 w-full overflow-y-auto overscroll-contain flex flex-col items-center justify-start lg:justify-center px-3 sm:px-6 pt-3 pb-[clamp(24px,6vh,48px)]">
        <div className="w-full max-w-3xl mx-auto flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-4 lg:gap-7 my-auto">
          {/* 9x9 Puzzle Input Grid */}
          <div className="w-full max-w-[min(92vw,420px)] lg:w-[440px] lg:max-w-[440px] shrink-0 flex items-center justify-center p-0.5 rounded-2xl">
            <SudokuBoard
              id="solver-sudoku-board"
              boardState={boardState}
              difficulty={difficultyMeta.boardDifficulty}
              solutionGrid={EMPTY_SOLUTION_GRID}
              isTimerPaused={false}
              onResumeSession={noopSound}
              highlightAreas={true}
              highlightIdentical={true}
              isNumberFirstInputMode={false}
              lockedNum={null}
              activeKeypadNum={selectedCellValue}
              darkMode={isDarkMode}
              playClickSound={noopSound}
              onCellClick={handleCellClick}
              errorCells={conflictCells}
            />
          </div>

          {/* Control Deck */}
          <div
            id="solver-control-deck"
            className="w-full max-w-[min(92vw,420px)] lg:w-[280px] shrink-0 flex flex-col justify-between gap-3"
          >
            {/* Top Row: Clear Grid & Erase */}
            <div className="grid grid-cols-2 gap-2.5 w-full shrink-0">
              <button
                type="button"
                id="solver-clear-grid-btn"
                onClick={handleClearGrid}
                disabled={clueCount === 0 && !selectedCell}
                className="h-11 px-3 rounded-2xl border-0 outline-none flex items-center justify-center gap-2 text-xs font-bold tracking-wide cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-150 bg-[#FFE4E6] hover:bg-[#FECDD3] text-[#9D174D] dark:bg-rose-950/60 dark:hover:bg-rose-900/70 dark:text-rose-200 shadow-[0_6px_16px_rgba(157,23,77,0.06)] dark:shadow-[0_6px_16px_rgba(0,0,0,0.35)]"
              >
                <Trash2 className="w-4 h-4 stroke-[2.2] shrink-0" />
                <span>Clear Grid</span>
              </button>

              <button
                type="button"
                id="solver-erase-cell-btn"
                onClick={handleErase}
                disabled={!selectedCell || selectedCellValue === null}
                className="h-11 px-3 rounded-2xl border-0 outline-none flex items-center justify-center gap-2 text-xs font-bold tracking-wide cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-150 bg-[#FCE7F3] hover:bg-[#FBCFE8] text-[#9D174D] dark:bg-pink-950/60 dark:hover:bg-pink-900/70 dark:text-pink-200 shadow-[0_6px_16px_rgba(157,23,77,0.06)] dark:shadow-[0_6px_16px_rgba(0,0,0,0.35)]"
              >
                <Delete className="w-4 h-4 stroke-[2.2] shrink-0" />
                <span>Erase</span>
              </button>
            </div>

            {/* Middle Row: 1-9 Keypad Only */}
            <div className="w-full shrink-0">
              <SudokuKeypad
                boardState={boardState}
                difficulty={difficultyMeta.boardDifficulty}
                historyLength={0}
                pencilMode={false}
                onTogglePencilMode={noopSound}
                onUndo={noopSound}
                onErase={handleErase}
                onHint={noopSound}
                hintInventory={0}
                isChallengeMode={true}
                onNumberSelect={applyCellValue}
                lockedNum={null}
                activeKeypadNum={selectedCellValue}
                isNumberFirstInputMode={false}
                showRemainingNumbers={false}
                darkMode={isDarkMode}
                playClickSound={noopSound}
                hideUtilityDeck={true}
              />
            </div>

            {/* Bottom Row: Lock & Play CTA */}
            <button
              type="button"
              id="solver-lock-play-btn"
              disabled={isLockDisabled}
              onClick={() => alert("Will lock and switch to Play Mode")}
              className={`w-full h-12 px-4 rounded-2xl border-0 outline-none flex items-center justify-center gap-2 text-sm font-black tracking-wide transition-all duration-150 shrink-0 ${
                isLockDisabled
                  ? "bg-stone-200/80 text-stone-400 dark:bg-zinc-800/70 dark:text-zinc-500 cursor-not-allowed opacity-65 shadow-none"
                  : "bg-[#E0E7FF] hover:bg-[#C7D2FE] text-[#3730A3] dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:text-white cursor-pointer active:scale-[0.98] shadow-[0_8px_22px_rgba(55,48,163,0.12)] dark:shadow-[0_8px_22px_rgba(79,70,229,0.3)]"
              }`}
            >
              <Lock className="w-4 h-4 stroke-[2.4] shrink-0" />
              <span>Lock &amp; Play</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
