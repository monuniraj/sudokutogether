import React from "react";
import { RefreshCw, Play } from "lucide-react";

export type Difficulty = "EASY" | "MEDIUM" | "HARD" | "EXPERT";

export const DIFFICULTY_GRID_THEMES: Record<Difficulty, {
  activeCell: { light: string; dark: string };
  crosshair: { light: string; dark: string };
  paintCrosshair: { light: string; dark: string };
  identical: { light: string; dark: string };
}> = {
  EASY: {
    activeCell: { light: "#86EFAC", dark: "#0e8365" },
    crosshair: { light: "rgba(34, 197, 94, 0.12)", dark: "#051f18" },
    paintCrosshair: { light: "rgba(34, 197, 94, 0.12)", dark: "#051f18" },
    identical: { light: "#86EFAC", dark: "#0e8365" },
  },
  MEDIUM: {
    activeCell: { light: "#FCD34D", dark: "#713f12" },
    crosshair: { light: "rgba(234, 179, 8, 0.12)", dark: "#1f1403" },
    paintCrosshair: { light: "rgba(234, 179, 8, 0.12)", dark: "#1f1403" },
    identical: { light: "#FCD34D", dark: "#713f12" },
  },
  HARD: {
    activeCell: { light: "#D8B4FE", dark: "#581db8" },
    crosshair: { light: "rgba(168, 85, 247, 0.12)", dark: "#160c2b" },
    paintCrosshair: { light: "rgba(168, 85, 247, 0.12)", dark: "#160c2b" },
    identical: { light: "#D8B4FE", dark: "#581db8" },
  },
  EXPERT: {
    activeCell: { light: "#F9A8D4", dark: "#881337" },
    crosshair: { light: "rgba(244, 63, 94, 0.12)", dark: "#210811" },
    paintCrosshair: { light: "rgba(244, 63, 94, 0.12)", dark: "#210811" },
    identical: { light: "#F9A8D4", dark: "#881337" },
  },
};

export interface SudokuCellData {
  value: number;
  isOriginalClue: boolean;
  notes: Set<number> | number[];
  [key: string]: any;
}

export interface SudokuBoardState {
  grid: SudokuCellData[][];
  selectedRow: number | null;
  selectedCol: number | null;
  difficulty?: string;
  isGameOver?: boolean;
  [key: string]: any;
}

export interface SudokuBoardProps {
  boardState: SudokuBoardState | null;
  difficulty: Difficulty;
  solutionGrid: number[][];
  isTimerPaused: boolean;
  onResumeSession: () => void;
  visualizingBacktrack?: boolean;
  highlightAreas: boolean;
  highlightIdentical: boolean;
  isNumberFirstInputMode: boolean;
  lockedNum: number | null;
  activeKeypadNum?: number | null;
  darkMode: boolean;
  playClickSound: () => void;
  onCellClick: (r: number, c: number) => void;
}

export const SudokuBoard: React.FC<SudokuBoardProps> = React.memo(({
  boardState,
  difficulty,
  solutionGrid,
  isTimerPaused,
  onResumeSession,
  visualizingBacktrack,
  highlightAreas,
  highlightIdentical,
  isNumberFirstInputMode,
  lockedNum,
  activeKeypadNum,
  darkMode,
  playClickSound,
  onCellClick
}) => {
  if (!boardState) {
    return (
      <div className="w-full max-w-[420px] aspect-square flex flex-col items-center justify-center bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-stone-200/50 dark:border-zinc-800 p-8 my-auto select-none">
        <RefreshCw className="w-10 h-10 animate-spin text-sky-500 mb-3" />
        <span className="font-mono text-sm font-black tracking-widest text-stone-800 dark:text-stone-100 uppercase">
          ENTERING MATCH...
        </span>
        <span className="text-xs text-stone-400 dark:text-zinc-500 font-mono mt-1">
          Synchronizing Sudoku arena
        </span>
      </div>
    );
  }

  const currentDiff = ((boardState.difficulty || difficulty).toUpperCase()) as Difficulty;
  const diffTheme = DIFFICULTY_GRID_THEMES[currentDiff] || DIFFICULTY_GRID_THEMES.EASY;

  const heavyBorderR = darkMode 
    ? (currentDiff === "EASY" ? "border-r-[#0b6b52]" : currentDiff === "MEDIUM" ? "border-r-[#7c3207]" : currentDiff === "HARD" ? "border-r-[#4c1d95]" : "border-r-[#881337]")
    : (currentDiff === "EASY" ? "border-r-[#065f46]/55" : currentDiff === "MEDIUM" ? "border-r-[#854d0e]/55" : currentDiff === "HARD" ? "border-r-[#6b21a8]/55" : "border-r-[#9d174d]/55");
  const heavyBorderB = darkMode 
    ? (currentDiff === "EASY" ? "border-b-[#0b6b52]" : currentDiff === "MEDIUM" ? "border-b-[#7c3207]" : currentDiff === "HARD" ? "border-b-[#4c1d95]" : "border-b-[#881337]")
    : (currentDiff === "EASY" ? "border-b-[#065f46]/55" : currentDiff === "MEDIUM" ? "border-b-[#854d0e]/55" : currentDiff === "HARD" ? "border-b-[#6b21a8]/55" : "border-b-[#9d174d]/55");

  const lightBorderR = darkMode
    ? (currentDiff === "EASY" ? "border-r-[#054031]" : currentDiff === "MEDIUM" ? "border-r-[#532004]" : currentDiff === "HARD" ? "border-r-[#31126b]" : "border-r-[#58061d]")
    : (currentDiff === "EASY" ? "border-r-[#065f46]/20" : currentDiff === "MEDIUM" ? "border-r-[#854d0e]/20" : currentDiff === "HARD" ? "border-r-[#6b21a8]/20" : "border-r-[#9d174d]/20");
    
  const lightBorderB = darkMode
    ? (currentDiff === "EASY" ? "border-b-[#054031]" : currentDiff === "MEDIUM" ? "border-b-[#532004]" : currentDiff === "HARD" ? "border-b-[#31126b]" : "border-b-[#58061d]")
    : (currentDiff === "EASY" ? "border-b-[#065f46]/20" : currentDiff === "MEDIUM" ? "border-b-[#854d0e]/20" : currentDiff === "HARD" ? "border-b-[#6b21a8]/20" : "border-b-[#9d174d]/20");

  // In Number-First mode with locked brush digit, apply ultra-soft crosshair background
  const isPaintModeActiveWithNumber = isNumberFirstInputMode && lockedNum !== null;
  const allowCrosshairs = highlightAreas;

  return (
    <div 
      className={`relative w-full aspect-square grid grid-cols-9 p-0 overflow-hidden box-border rounded-none sudoku-board transition-colors duration-200 ${darkMode ? "bg-zinc-900 border-[3px]" : "bg-white border-[3px]"} ${darkMode ? (currentDiff === "EASY" ? "border-[#0b6b52]" : currentDiff === "MEDIUM" ? "border-[#7c3207]" : currentDiff === "HARD" ? "border-[#4c1d95]" : "border-[#881337]") : (currentDiff === "EASY" ? "border-[#065f46]/55" : currentDiff === "MEDIUM" ? "border-[#854d0e]/55" : currentDiff === "HARD" ? "border-[#6b21a8]/55" : "border-[#9d174d]/55")}`}
      style={{ 
        boxShadow: darkMode ? "0 4px 20px rgba(0,0,0,0.6)" : "0 4px 20px rgba(43,108,176,0.03)",
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
      }}
    >
      {/* MINIMALIST PAUSE SCREEN OVERLAY */}
      {isTimerPaused && (
        <div 
          onClick={() => {
            playClickSound();
            onResumeSession();
          }}
          className={`absolute inset-0 ${
            darkMode ? "bg-zinc-950/75 text-zinc-100" : "bg-[#FDFBF7]/75 text-stone-900"
          } backdrop-blur-[8px] z-45 flex items-center justify-center cursor-pointer select-none transition-all duration-200 overflow-hidden rounded-[inherit]`}
          style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
          title="Resume Game"
        >
          <div
            className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full flex items-center justify-center transition-all duration-200 border-none cursor-pointer active:scale-95 group hover:scale-105 ${
              darkMode 
                ? "bg-zinc-900/90 text-emerald-400 hover:bg-zinc-800" 
                : "bg-white/90 text-emerald-700 hover:bg-white"
            }`}
            style={{ 
              boxShadow: darkMode ? "0 4px 16px rgba(0, 0, 0, 0.4)" : "0 4px 12px rgba(0, 0, 0, 0.06)",
              backdropFilter: "blur(8px)", 
              WebkitBackdropFilter: "blur(8px)" 
            }}
          >
            <Play className="w-8 h-8 sm:w-9 sm:h-9 fill-current translate-x-0.5 transition-transform duration-200 group-hover:scale-110" />
          </div>
        </div>
      )}
      
      {Array.from({ length: 9 }).map((_, r) =>
        Array.from({ length: 9 }).map((_, c) => {
          const cell = boardState.grid[r][c];
            
          const isMistake = cell.value !== 0 && 
            !cell.isOriginalClue && 
            solutionGrid[r] && 
            cell.value !== solutionGrid[r][c];

          const isSelected = boardState.selectedRow === r && boardState.selectedCol === c;
          
          let isHighlightedSibling = false;
          if (allowCrosshairs && boardState.selectedRow !== null && boardState.selectedCol !== null) {
            const isRowSibling = boardState.selectedRow === r;
            const isColSibling = boardState.selectedCol === c;
            const isBoxSibling = 
              Math.floor(boardState.selectedRow / 3) === Math.floor(r / 3) && 
              Math.floor(boardState.selectedCol / 3) === Math.floor(c / 3);
            isHighlightedSibling = (isRowSibling || isColSibling || isBoxSibling) && !isSelected;
          }

          const selectedCellValue = (boardState.selectedRow !== null && boardState.selectedCol !== null)
            ? boardState.grid[boardState.selectedRow][boardState.selectedCol].value
            : 0;

          const activeSelectedNumber = (isNumberFirstInputMode && lockedNum !== null)
            ? lockedNum
            : (activeKeypadNum !== undefined && activeKeypadNum !== null ? activeKeypadNum : selectedCellValue);

          const isIdenticalValue = highlightIdentical && 
            activeSelectedNumber !== 0 && 
            cell.value === activeSelectedNumber && 
            !isSelected;

          let cellBgClass = "";
          let cellBgStyle: React.CSSProperties = {};

          if (isSelected && isMistake) {
            // Distinct deep error highlight for active selected mistake cell
            if (darkMode) {
              cellBgStyle = { backgroundColor: "#881337" };
              cellBgClass = "text-white font-black animate-pulse";
            } else {
              cellBgStyle = { backgroundColor: "#fca5a5" };
              cellBgClass = "text-rose-950 font-black animate-pulse";
            }
          } else if (isMistake) {
            // Soft unselected mistake background
            if (darkMode) {
              cellBgClass = "bg-[#4c0519]/40 text-rose-400";
            } else {
              cellBgStyle = { backgroundColor: "#fee2e2" };
              cellBgClass = "text-rose-600";
            }
          } else if (isSelected) {
            cellBgStyle = {
              backgroundColor: darkMode ? diffTheme.activeCell.dark : diffTheme.activeCell.light,
            };
            cellBgClass = darkMode ? "text-white animate-pulse" : "animate-pulse";
          } else if (isIdenticalValue) {
            cellBgStyle = {
              backgroundColor: darkMode ? diffTheme.identical.dark : diffTheme.identical.light,
            };
            if (darkMode) cellBgClass = "text-white";
          } else if (isHighlightedSibling) {
            if (darkMode) {
              cellBgStyle = {
                backgroundColor: diffTheme.crosshair.dark,
              };
            } else {
              cellBgClass = "bg-white";
            }
          } else {
            if (darkMode) {
              cellBgClass = "bg-zinc-900";
            } else {
              cellBgStyle = {
                backgroundColor: diffTheme.crosshair.light,
              };
            }
          }

          let borderClasses = "";
          if (c === 2 || c === 5) {
            borderClasses += ` border-r-[3px] ${heavyBorderR}`;
          } else if (c === 8) {
            borderClasses += " border-r-0";
          } else {
            borderClasses += ` border-r-[1.5px] ${lightBorderR}`;
          }

          if (r === 2 || r === 5) {
            borderClasses += ` border-b-[3px] ${heavyBorderB}`;
          } else if (r === 8) {
            borderClasses += " border-b-0";
          } else {
            borderClasses += ` border-b-[1.5px] ${lightBorderB}`;
          }

          const hasNotesSet = cell.notes instanceof Set ? cell.notes : new Set(cell.notes || []);

          return (
            <div
              key={`${r}-${c}`}
              onClick={() => onCellClick(r, c)}
              style={cellBgStyle}
              className={`cell aspect-square relative cursor-pointer select-none ${cellBgClass} ${borderClasses} p-0 overflow-hidden flex items-center justify-center`}
            >
              {cell.value !== 0 ? (
                <div 
                  className={`absolute inset-0 flex items-center justify-center text-center select-none ${
                    cell.isOriginalClue 
                      ? (darkMode 
                          ? ((isSelected || isIdenticalValue) && (currentDiff === "EASY" || currentDiff === "HARD") ? "text-white font-sans font-extrabold" : "text-white font-sans font-normal")
                          : "text-stone-900 font-sans font-normal")
                      : isMistake
                        ? (darkMode ? "text-rose-300 handwriting font-black animate-pulse" : "text-rose-700 handwriting font-black animate-pulse")
                        : (darkMode 
                            ? ((isSelected || isIdenticalValue) && (currentDiff === "EASY" || currentDiff === "HARD") ? "text-white handwriting font-extrabold" : "text-[#38bdf8] handwriting font-normal")
                            : "text-[#2B6CB0] handwriting font-normal")
                  }`}
                  style={{
                    fontSize: cell.isOriginalClue 
                      ? "clamp(22px, min(7.5vw, 6.5vh), 42px)" 
                      : "clamp(26px, min(9.5vw, 8.5vh), 50px)"
                  }}
                >
                  {cell.value}
                </div>
              ) : (
                /* High-legibility candidate note digits */
                <div 
                  className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-0.5 leading-none select-none pointer-events-none"
                  style={{
                    fontSize: "clamp(10px, min(2.8vw, 2.4vh), 16px)",
                    lineHeight: 1
                  }}
                >
                  {Array.from({ length: 9 }).map((_, id) => {
                    const cand = id + 1;
                    const hasNote = hasNotesSet.has(cand);
                    return (
                      <div key={id} className={`w-full h-full flex items-center justify-center text-center ${
                        hasNote 
                          ? (darkMode ? "text-sky-300 font-black font-sans" : "text-blue-800 font-black font-sans") 
                          : "opacity-0"
                      }`}>
                        {cand}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
});

SudokuBoard.displayName = "SudokuBoard";
