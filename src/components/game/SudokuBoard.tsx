import React, { useState, useEffect } from "react";
import { RefreshCw, Play } from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";

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

export interface CompletionPulse {
  type: "row" | "col" | "box" | "combo" | "structures" | "holy_grail";
  row?: number;
  col?: number;
  boxIndex?: number;
  hasRow?: boolean;
  hasCol?: boolean;
  hasBox?: boolean;
  timestamp: number;
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
  gameSessionKey?: string | number;
  completionPulse?: CompletionPulse | null;
  isVictory?: boolean;
}

// Module-level cache tracking completed board reveal animations per game session
const revealedSessionKeys = new Set<string | number>();

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
  onCellClick,
  gameSessionKey,
  completionPulse,
  isVictory
}) => {
  const { t } = useTranslation();
  const [isRevealing, setIsRevealing] = useState<boolean>(false);

  const isUnrevealed = Boolean(gameSessionKey && !revealedSessionKeys.has(gameSessionKey));

  useEffect(() => {
    if (!gameSessionKey) {
      setIsRevealing(false);
      return;
    }
    if (revealedSessionKeys.has(gameSessionKey)) {
      setIsRevealing(false);
      return;
    }
    // Startup 150ms Snappy Pause: allow pristine board to visibly settle before wave & audio commence
    const startTimer = setTimeout(() => {
      setIsRevealing(true);
    }, 150);

    const finishTimer = setTimeout(() => {
      revealedSessionKeys.add(gameSessionKey);
      setIsRevealing(false);
    }, 150 + 850);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(finishTimer);
    };
  }, [gameSessionKey]);

  if (!boardState) {
    return (
      <div className="w-full max-w-[420px] aspect-square flex flex-col items-center justify-center bg-white/95 dark:bg-[#121212] backdrop-blur-md rounded-2xl shadow-xl border border-stone-200/50 dark:border-zinc-800 p-8 my-auto select-none">
        <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md flex items-center justify-center bg-[#121212] mb-3">
          <img src="/logo.png" alt="Sudoku Sync" className="w-full h-full object-cover select-none" />
        </div>
        <span className="font-sans text-sm font-black tracking-wider text-stone-800 dark:text-zinc-100 uppercase">
          Sudoku Sync
        </span>
        <span 
          className="text-[11px] font-semibold text-stone-400 dark:text-zinc-500 font-sans uppercase mt-1"
          style={{ letterSpacing: "0.22em" }}
        >
          By Mologic
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

  const pauseButtonTheme = darkMode ? (
    currentDiff === "EASY" ? "text-emerald-400" :
    currentDiff === "MEDIUM" ? "text-amber-400" :
    currentDiff === "HARD" ? "text-purple-400" :
    "text-rose-400"
  ) : (
    currentDiff === "EASY" ? "text-[#065F46]" :
    currentDiff === "MEDIUM" ? "text-[#854D0E]" :
    currentDiff === "HARD" ? "text-[#6B21A8]" :
    "text-[#9D174D]"
  );

  const isVictoryActive = Boolean(isVictory !== undefined ? isVictory : (boardState?.isGameOver && !boardState.currentMistakesCount && solutionGrid?.length && !solutionGrid.some((row, rIdx) => row.some((val, cIdx) => boardState.grid[rIdx][cIdx].value !== val))));

  const [isVictoryWaveActive, setIsVictoryWaveActive] = useState<boolean>(false);
  const [isClearingHighlights, setIsClearingHighlights] = useState<boolean>(false);

  useEffect(() => {
    if (isVictoryActive) {
      setIsVictoryWaveActive(true);
      setIsClearingHighlights(true);
      // Inward wave finishes after outer-to-inner stagger (180ms stagger + 450ms animation = 630ms -> 650ms)
      const waveTimer = setTimeout(() => {
        setIsVictoryWaveActive(false);
      }, 650);
      // 2-Second Suppression Hold: guarantees highlights stay completely invisible throughout post-wave pause
      const holdTimer = setTimeout(() => {
        setIsClearingHighlights(false);
      }, 2000);
      return () => {
        clearTimeout(waveTimer);
        clearTimeout(holdTimer);
      };
    } else {
      setIsVictoryWaveActive(false);
      setIsClearingHighlights(false);
    }
  }, [isVictoryActive]);

  return (
    <div 
      className={`relative w-full aspect-square grid grid-cols-9 p-0 overflow-hidden box-border rounded-xl sudoku-board transition-colors duration-200 ${darkMode ? "bg-zinc-900 border-[2.4px]" : "bg-white border-[2.4px]"} ${darkMode ? (currentDiff === "EASY" ? "border-[#0b6b52]" : currentDiff === "MEDIUM" ? "border-[#7c3207]" : currentDiff === "HARD" ? "border-[#4c1d95]" : "border-[#881337]") : (currentDiff === "EASY" ? "border-[#065f46]/55" : currentDiff === "MEDIUM" ? "border-[#854d0e]/55" : currentDiff === "HARD" ? "border-[#6b21a8]/55" : "border-[#9d174d]/55")}`}
      style={{ 
        boxShadow: darkMode ? "0 4px 20px rgba(0,0,0,0.6)" : "0 4px 20px rgba(43,108,176,0.03)",
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
      }}
    >
      <style>{`
        @keyframes inkWaveSheenLight {
          0% {
            background-color: transparent;
            opacity: 0;
            transform: translateZ(0);
          }
          45% {
            background-color: ${diffTheme.activeCell.light};
            opacity: 0.70;
            transform: translateZ(0);
          }
          100% {
            background-color: transparent;
            opacity: 0;
            transform: translateZ(0);
          }
        }
        @keyframes inkWaveSheenDark {
          0% {
            background-color: transparent;
            opacity: 0;
            transform: translateZ(0);
          }
          45% {
            background-color: ${diffTheme.activeCell.dark};
            opacity: 0.70;
            transform: translateZ(0);
          }
          100% {
            background-color: transparent;
            opacity: 0;
            transform: translateZ(0);
          }
        }
        @keyframes inkDigitFadeIn {
          0% {
            opacity: 0;
            transform: translateZ(0);
          }
          100% {
            opacity: 1;
            transform: translateZ(0);
          }
        }
      `}</style>
      {/* MINIMALIST PAUSE SCREEN OVERLAY */}
      {isTimerPaused && !boardState.isGameOver && (
        <div 
          onClick={() => {
            playClickSound();
            onResumeSession();
          }}
          className={`absolute inset-0 ${
            darkMode ? "bg-zinc-950/75 text-zinc-100" : "bg-[#FDFBF7]/75 text-stone-900"
          } backdrop-blur-[8px] z-45 flex items-center justify-center cursor-pointer select-none overflow-hidden rounded-[inherit]`}
          style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
          title={t("resumeGameTitle")}
        >
          <div
            className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full flex items-center justify-center transition-all duration-200 border-none cursor-pointer active:scale-95 group hover:scale-105 ${
              darkMode 
                ? `bg-zinc-900/90 ${pauseButtonTheme} hover:bg-zinc-800` 
                : `bg-white/90 ${pauseButtonTheme} hover:bg-white`
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

          if (isClearingHighlights) {
            // Radial wave wash-away deselection: smoothly transition to neutral background
            if (darkMode) {
              cellBgClass = "bg-zinc-900";
            } else {
              cellBgStyle = {
                backgroundColor: diffTheme.crosshair.light,
              };
            }
          } else if (isSelected && isMistake) {
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
            cellBgClass = darkMode ? "text-white animate-pulse" : "text-stone-900 animate-pulse";
          } else if (isIdenticalValue) {
            cellBgStyle = {
              backgroundColor: darkMode ? diffTheme.identical.dark : diffTheme.identical.light,
            };
            if (darkMode) cellBgClass = "text-white";
          } else if (isHighlightedSibling) {
            cellBgStyle = {
              backgroundColor: darkMode ? diffTheme.crosshair.dark : diffTheme.crosshair.light,
            };
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
            borderClasses += ` border-r-[2.4px] ${heavyBorderR}`;
          } else if (c === 8) {
            borderClasses += " border-r-0";
          } else {
            borderClasses += ` border-r-[1.5px] ${lightBorderR}`;
          }

          if (r === 2 || r === 5) {
            borderClasses += ` border-b-[2.4px] ${heavyBorderB}`;
          } else if (r === 8) {
            borderClasses += " border-b-0";
          } else {
            borderClasses += ` border-b-[1.5px] ${lightBorderB}`;
          }

          const hasNotesSet = cell.notes instanceof Set ? cell.notes : new Set(cell.notes || []);

          // Continuous radial micro-staggering from center (4,4)
          const dist = Math.hypot(r - 4, c - 4);
          const ringIndex = Math.max(Math.abs(r - 4), Math.abs(c - 4));
          // Grand Victory (Strictly Inward: Outermost Ring 4 at 0ms, Innermost Center Ring 0 at 180ms)
          const victoryDelayMs = (4 - ringIndex) * 45;
          const washDelayMs = (4 - ringIndex) * 45;
          // Starting Reveal (Inside-Out: Center at 0ms, Corners at ~215ms)
          const cellDelayMs = Math.round(dist * 38);
          // Peak Saturation Digit Emergence: offset to hit peak color saturation at 45% of 480ms (~216ms -> 210ms)
          const digitRevealDelay = cellDelayMs + 210;
          let isPulseActive = false;
          let pulseAnimation = "";
          let pulseDelayMs = 0;

          if (cell && cell.value !== 0 && cell.value !== null && completionPulse && (Date.now() - completionPulse.timestamp < 1150)) {
            const sheenAnim = darkMode 
              ? "inkWaveSheenDark 450ms cubic-bezier(0.25, 1, 0.5, 1) forwards" 
              : "inkWaveSheenLight 450ms cubic-bezier(0.25, 1, 0.5, 1) forwards";

            const currentCellBox = Math.floor(r / 3) * 3 + Math.floor(c / 3);
            const targetRow = completionPulse.row ?? 4;
            const targetCol = completionPulse.col ?? 4;
            const targetBox = completionPulse.boxIndex ?? (Math.floor(targetRow / 3) * 3 + Math.floor(targetCol / 3));

            const isRowMatch = (completionPulse.type === "row" || Boolean(completionPulse.hasRow)) && targetRow === r;
            const isColMatch = (completionPulse.type === "col" || Boolean(completionPulse.hasCol)) && targetCol === c;
            const isBoxMatch = (completionPulse.type === "box" || Boolean(completionPulse.hasBox)) && currentCellBox === targetBox;

            if (completionPulse.type === "holy_grail") {
              // Strict 3-Way Holy Grail: Animate strictly the completed Row, Column, AND 3x3 Box
              if (targetRow === r || targetCol === c || currentCellBox === targetBox) {
                isPulseActive = true;
                pulseAnimation = sheenAnim;
                pulseDelayMs = Math.round(Math.hypot(r - targetRow, c - targetCol) * 35);
              }
            } else if (isRowMatch || isColMatch || isBoxMatch) {
              // Strict single or multi-structure isolation: ZERO cross-bleed into uncompleted sectors!
              isPulseActive = true;
              pulseAnimation = sheenAnim;
              if (isRowMatch) {
                pulseDelayMs = Math.abs(c - targetCol) * 35;
              } else if (isColMatch) {
                pulseDelayMs = Math.abs(r - targetRow) * 35;
              } else {
                const boxCenterR = Math.floor(r / 3) * 3 + 1;
                const boxCenterC = Math.floor(c / 3) * 3 + 1;
                pulseDelayMs = Math.round(Math.hypot(r - boxCenterR, c - boxCenterC) * 38);
              }
            } else if (completionPulse.type === "combo") {
              const inSameRow = r === targetRow;
              const inSameCol = c === targetCol;
              const inSameBox = currentCellBox === targetBox;
              if (inSameRow || inSameCol || inSameBox) {
                isPulseActive = true;
                pulseAnimation = sheenAnim;
                pulseDelayMs = Math.round(Math.hypot(r - targetRow, c - targetCol) * 40);
              }
            }
          }

          const isSheenOverlayActive = Boolean(isPulseActive || (isVictoryWaveActive && cell && cell.value !== 0) || isRevealing);
          let overlayAnimation = "";
          let overlayDelayMs = 0;

          if (isPulseActive) {
            overlayAnimation = pulseAnimation;
            overlayDelayMs = pulseDelayMs;
          } else if (isVictoryWaveActive && cell && cell.value !== 0) {
            overlayAnimation = darkMode 
              ? "inkWaveSheenDark 450ms cubic-bezier(0.25, 1, 0.5, 1) forwards" 
              : "inkWaveSheenLight 450ms cubic-bezier(0.25, 1, 0.5, 1) forwards";
            overlayDelayMs = victoryDelayMs;
          } else if (isRevealing) {
            overlayAnimation = darkMode 
              ? "inkWaveSheenDark 450ms cubic-bezier(0.25, 1, 0.5, 1) forwards" 
              : "inkWaveSheenLight 450ms cubic-bezier(0.25, 1, 0.5, 1) forwards";
            overlayDelayMs = cellDelayMs;
          }

          return (
            <div
              key={`${gameSessionKey || 's'}-${r}-${c}`}
              onClick={() => onCellClick(r, c)}
              style={{
                ...cellBgStyle,
                transition: isClearingHighlights 
                  ? "background-color 250ms ease-out var(--wash-delay, 0ms), opacity 250ms ease-out var(--wash-delay, 0ms)" 
                  : "background-color 200ms ease-out",
                transform: "translateZ(0)",
                willChange: isClearingHighlights ? "background-color, opacity" : undefined,
                ["--ring-index" as any]: ringIndex,
                ["--wash-delay" as any]: `${washDelayMs}ms`
              }}
              className={`cell aspect-square relative cursor-pointer select-none ${cellBgClass} ${borderClasses} p-0 overflow-visible flex items-center justify-center`}
            >
              {/* Isolated Sheen Wave Overlay (Zero State & Style Collision) */}
              {isSheenOverlayActive && (
                <div 
                  className="absolute inset-0 pointer-events-none rounded-[inherit] z-1"
                  style={{
                    animation: overlayAnimation,
                    animationDelay: "var(--reveal-delay, 0ms)",
                    transform: "translateZ(0)",
                    willChange: "opacity",
                    ["--reveal-delay" as any]: `${overlayDelayMs}ms`
                  }}
                />
              )}
              {cell.value !== 0 ? (
                <div 
                  className={`absolute inset-0 z-2 flex items-center justify-center text-center select-none ${
                    cell.isOriginalClue 
                      ? (darkMode 
                          ? ((isSelected || isIdenticalValue) ? "text-[#F8FAFC] font-sans font-extrabold" : "text-[#F8FAFC] font-sans font-normal")
                          : "text-stone-900 font-sans font-normal")
                      : isMistake
                        ? (darkMode ? "text-rose-300 handwriting font-black animate-pulse" : "text-rose-700 handwriting font-black animate-pulse")
                        : (darkMode 
                            ? ((isSelected || isIdenticalValue) ? "text-[#38bdf8] handwriting font-extrabold" : "text-[#38bdf8] handwriting font-normal")
                            : "text-[#2B6CB0] handwriting font-normal")
                  }`}
                  style={{
                    fontSize: cell.isOriginalClue 
                      ? "clamp(22px, min(7.5vw, 6.5vh), 42px)" 
                      : "clamp(26px, min(9.5vw, 8.5vh), 50px)",
                    opacity: isUnrevealed ? 0 : 1,
                    animation: isRevealing ? "inkDigitFadeIn 220ms ease-out var(--digit-delay, 0ms) forwards" : undefined,
                    transform: "translateZ(0)",
                    willChange: isRevealing ? "opacity" : undefined,
                    ["--digit-delay" as any]: `${digitRevealDelay}ms`
                  }}
                >
                  {cell.value}
                </div>
              ) : (
                /* High-legibility candidate note digits */
                <div 
                  className="absolute inset-0 z-2 grid grid-cols-3 grid-rows-3 p-0.5 leading-none select-none pointer-events-none"
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
