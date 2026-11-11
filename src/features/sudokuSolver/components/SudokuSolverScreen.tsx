import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Delete,
  Loader2,
  Lock,
  Pencil,
  Play,
  Search,
  Sparkles,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import {
  SudokuBoard,
  type Difficulty,
  type SudokuBoardState,
  type SudokuBoardTheme,
} from "../../../components/game/SudokuBoard";
import { SudokuKeypad } from "../../../components/game/SudokuKeypad";
import { useTranslation } from "../../../i18n/useTranslation";
import { solveCustomBoard, validateCustomGrid } from "../services/solverEngine";
import {
  countGridClues,
  formatCustomHistoryDate,
  formatCustomHistoryDifficulty,
  getCustomGameHistory,
  normalizeCustomGrid,
  saveCustomGameToHistory,
  type CustomPuzzleHistoryRecord,
} from "../services/customHistoryService";

export interface SudokuSolverScreenProps {
  navigatorPop: () => void;
  darkMode?: boolean;
  uid?: string | null;
  onPlayCustomPuzzle?: (
    grid: number[][],
    difficulty: string,
    solution?: number[][],
    customHistoryId?: string
  ) => void;
}

const CUSTOM_DRAFT_STORAGE_KEY = "sudoku_custom_draft";
const EMPTY_SOLUTION_GRID: number[][] = [];

const createEmptyGrid = (): number[][] =>
  Array.from({ length: 9 }, () => Array<number>(9).fill(0));

const isGridCompletelyEmpty = (grid: number[][]): boolean => {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if ((grid[r]?.[c] ?? 0) !== 0) return false;
    }
  }
  return true;
};

const buildGridSignature = (grid: number[][]): string =>
  grid.map((row) => row.join("")).join("");

const formatElapsedShort = (seconds: number): string => {
  const clean = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(clean / 60);
  const secs = clean % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

interface CustomHistoryModalProps {
  isOpen: boolean;
  darkMode: boolean;
  uid: string | null;
  onClose: () => void;
  onSelectRecord: (record: CustomPuzzleHistoryRecord) => void;
}

const CustomHistoryModal: React.FC<CustomHistoryModalProps> = ({
  isOpen,
  darkMode,
  uid,
  onClose,
  onSelectRecord,
}) => {
  const { t } = useTranslation();
  const [records, setRecords] = useState<CustomPuzzleHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;
    setIsLoading(true);
    getCustomGameHistory(uid)
      .then((items) => {
        if (!isCancelled) {
          setRecords(items);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, uid]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  const modalContent = (
    <div
      id="custom-history-modal-backdrop"
      className="fixed inset-0 z-[10000] overflow-y-auto flex justify-center p-3.5 sm:p-4 pt-[calc(76px+env(safe-area-inset-top,0px))] pb-4 sm:pb-6 bg-black/55 backdrop-blur-sm select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-history-modal-title"
      onClick={onClose}
    >
      <div
        id="custom-history-modal-card"
        className={`w-full max-w-md max-h-[82dvh] flex flex-col overflow-hidden my-auto rounded-3xl border-0 p-4 sm:p-5 transition-colors ${
          darkMode
            ? "bg-[#18181b] text-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
            : "bg-[#FDFBF7] text-[#1C1917] shadow-[0_20px_50px_rgba(55,48,163,0.12)]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3.5 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 rounded-2xl border-0 flex items-center justify-center shrink-0 ${
                darkMode
                  ? "bg-indigo-950/70 text-[#c7d2fe]"
                  : "bg-[#EEF2FF] text-[#3730A3]"
              }`}
            >
              <Clock className="w-4 h-4 stroke-[2.3]" />
            </div>
            <div className="min-w-0">
              <h2
                id="custom-history-modal-title"
                className="font-sans font-black text-sm sm:text-base leading-tight truncate"
              >
                Custom History
              </h2>
              <p className="font-sans text-[11px] font-semibold opacity-65 truncate">
                {uid ? "Synced to Google Account • Last 100" : "Saved on Device • Last 10"}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="custom-history-close-btn"
            onClick={onClose}
            aria-label={t("closeBtn") || "Close"}
            className={`w-8 h-8 rounded-2xl border-0 flex items-center justify-center shrink-0 cursor-pointer transition-transform active:scale-95 ${
              darkMode
                ? "bg-[#222225] hover:bg-[#2c2c30] text-zinc-300"
                : "bg-[#F4EFE6] hover:bg-[#EAE3D5] text-stone-600"
            }`}
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Scrollable History List */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-2.5 pr-0.5">
          {isLoading ? (
            <div className="py-10 flex flex-col items-center justify-center gap-2.5 text-center opacity-75">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="font-sans text-xs font-bold">
                Loading custom puzzles...
              </span>
            </div>
          ) : records.length === 0 ? (
            <div
              id="custom-history-empty-state"
              className={`rounded-2xl border-0 p-6 flex flex-col items-center justify-center gap-3 text-center ${
                darkMode
                  ? "bg-[#222225] text-zinc-300"
                  : "bg-[#F4EFE6]/85 text-stone-600"
              }`}
            >
              <div
                className={`w-11 h-11 rounded-2xl border-0 flex items-center justify-center ${
                  darkMode
                    ? "bg-indigo-950/60 text-indigo-300"
                    : "bg-[#EEF2FF] text-[#4338CA]"
                }`}
              >
                <Sparkles className="w-5 h-5 stroke-[2.1]" />
              </div>
              <p className="font-sans text-xs sm:text-sm font-bold leading-relaxed max-w-[260px]">
                No custom puzzles yet. Import one to get started.
              </p>
            </div>
          ) : (
            records.map((record) => {
              const clues = countGridClues(record.grid);
              const diffLabel = formatCustomHistoryDifficulty(record.difficulty);
              const dateLabel = formatCustomHistoryDate(record.date);
              return (
                <button
                  key={record.id}
                  type="button"
                  onClick={() => onSelectRecord(record)}
                  className={`w-full text-left rounded-2xl border-0 p-3.5 flex flex-col gap-2 cursor-pointer transition-all duration-150 active:scale-[0.99] ${
                    darkMode
                      ? "bg-[#222225] hover:bg-[#2a2a30] text-zinc-100 shadow-[0_4px_14px_rgba(0,0,0,0.3)]"
                      : "bg-white hover:bg-[#EEF2FF]/65 text-stone-800 shadow-[0_4px_14px_rgba(55,48,163,0.05)]"
                  }`}
                >
                  <p className="font-sans font-extrabold text-xs sm:text-sm leading-snug text-stone-800 dark:text-zinc-100 truncate">
                    {`Newspaper Puzzle • ${diffLabel} • ${dateLabel}`}
                  </p>

                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-500 dark:text-zinc-400">
                      <span
                        className={`px-2 py-0.5 rounded-full ${
                          darkMode
                            ? "bg-zinc-800 text-zinc-300"
                            : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {clues} clues
                      </span>
                      {typeof record.timeTaken === "number" && record.timeTaken > 0 && (
                        <span
                          className={`px-2 py-0.5 rounded-full font-mono tabular-nums ${
                            darkMode
                              ? "bg-zinc-800 text-emerald-300"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {formatElapsedShort(record.timeTaken)}
                        </span>
                      )}
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                        record.isAutoSolved
                          ? "bg-[#CCFBF1] text-[#115E59] dark:bg-teal-950/75 dark:text-teal-200"
                          : "bg-[#E0E7FF] text-[#3730A3] dark:bg-indigo-950/75 dark:text-indigo-200"
                      }`}
                    >
                      {record.isAutoSolved ? (
                        <Zap className="w-3 h-3 stroke-[2.3] shrink-0" />
                      ) : (
                        <Play className="w-3 h-3 stroke-[2.3] fill-current shrink-0" />
                      )}
                      <span>
                        {record.isAutoSolved ? "Auto-Solved" : "Played in Arena"}
                      </span>
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export const SudokuSolverScreen: React.FC<SudokuSolverScreenProps> = ({
  navigatorPop,
  darkMode,
  uid = null,
  onPlayCustomPuzzle,
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
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [solvedGrid, setSolvedGrid] = useState<number[][] | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [solverBanner, setSolverBanner] = useState<{
    type: "error" | "info" | "success";
    message: string;
  } | null>(null);

  const hasHydratedDraftRef = useRef<boolean>(false);
  const lastSavedAutoSolveSigRef = useRef<string | null>(null);
  const noopSound = useCallback(() => {}, []);

  // Hydrate persisted newspaper draft on initial mount
  useEffect(() => {
    try {
      const rawDraft = localStorage.getItem(CUSTOM_DRAFT_STORAGE_KEY);
      if (rawDraft) {
        const parsed = normalizeCustomGrid(JSON.parse(rawDraft));
        if (parsed && !isGridCompletelyEmpty(parsed)) {
          setSolverGrid(parsed);
          setConflictCells(validateCustomGrid(parsed));
        }
      }
    } catch {
      // Ignore corrupt draft cache cleanly
    } finally {
      hasHydratedDraftRef.current = true;
    }
  }, []);

  // Persist non-empty draft on every clue change
  useEffect(() => {
    if (!hasHydratedDraftRef.current) return;
    try {
      if (!isGridCompletelyEmpty(solverGrid)) {
        localStorage.setItem(CUSTOM_DRAFT_STORAGE_KEY, JSON.stringify(solverGrid));
      } else {
        localStorage.removeItem(CUSTOM_DRAFT_STORAGE_KEY);
      }
    } catch {
      // Ignore storage quota issues cleanly
    }
  }, [solverGrid]);

  useEffect(() => {
    if (!solverBanner) return;
    const timer = window.setTimeout(() => {
      setSolverBanner(null);
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [solverBanner]);

  const clueCount = useMemo(() => {
    let total = 0;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (solverGrid[r][c] !== 0) total++;
      }
    }
    return total;
  }, [solverGrid]);

  const computedTheme: SudokuBoardTheme = useMemo(() => {
    if (clueCount >= 41) return "easy";
    if (clueCount >= 33) return "medium";
    if (clueCount >= 27) return "hard";
    return "expert";
  }, [clueCount]);

  const difficultyMeta = useMemo<{
    difficultyText: string;
    colorClass: string;
    boardDifficulty: Difficulty;
  }>(() => {
    if (clueCount < 17) {
      return {
        difficultyText: "Min 17 clues needed",
        colorClass: "text-amber-500",
        boardDifficulty: "EXPERT",
      };
    }
    if (clueCount >= 41) {
      return {
        difficultyText: "Easy",
        colorClass: "text-emerald-500",
        boardDifficulty: "EASY",
      };
    }
    if (clueCount >= 33) {
      return {
        difficultyText: "Medium",
        colorClass: "text-cyan-500",
        boardDifficulty: "MEDIUM",
      };
    }
    if (clueCount >= 27) {
      return {
        difficultyText: "Hard",
        colorClass: "text-amber-500",
        boardDifficulty: "HARD",
      };
    }
    return {
      difficultyText: "Expert",
      colorClass: "text-rose-500",
      boardDifficulty: "EXPERT",
    };
  }, [clueCount]);

  const applyCellValue = useCallback(
    (num: number) => {
      if (isLocked || !selectedCell) return;
      lastSavedAutoSolveSigRef.current = null;
      const { r, c } = selectedCell;
      setSolverGrid((prev) => {
        const nextGrid = prev.map((row) => [...row]);
        nextGrid[r][c] = num;
        setConflictCells(validateCustomGrid(nextGrid));
        return nextGrid;
      });
    },
    [isLocked, selectedCell]
  );

  const handleClearGrid = useCallback(() => {
    if (isLocked) return;
    lastSavedAutoSolveSigRef.current = null;
    setSolverGrid(createEmptyGrid());
    setConflictCells(new Set());
    setSelectedCell(null);
    setSolvedGrid(null);
    setSolverBanner(null);
    try {
      localStorage.removeItem(CUSTOM_DRAFT_STORAGE_KEY);
    } catch {
      // Ignore storage error
    }
  }, [isLocked]);

  const handleErase = useCallback(() => {
    applyCellValue(0);
  }, [applyCellValue]);

  const handleCellClick = useCallback((r: number, c: number) => {
    setSelectedCell({ r, c });
  }, []);

  const handleLockAndPlay = useCallback(() => {
    if (clueCount < 17 || conflictCells.size > 0) return;
    setSelectedCell(null);
    setSolvedGrid(null);
    setSolverBanner(null);
    setIsLocked(true);
  }, [clueCount, conflictCells.size]);

  const handleEditClues = useCallback(() => {
    setIsLocked(false);
    setSolvedGrid(null);
    setSolverBanner(null);
  }, []);

  const handleAutoSolve = useCallback(() => {
    setSelectedCell(null);
    const result = solveCustomBoard(solverGrid);
    if (result.status === "unsolvable" || !result.solution) {
      setSolvedGrid(null);
      setSolverBanner({
        type: "error",
        message: "This puzzle has no valid solution. Tap Edit Clues to double-check your numbers.",
      });
      return;
    }
    setSolvedGrid(result.solution);
    const sig = buildGridSignature(solverGrid);
    if (lastSavedAutoSolveSigRef.current !== sig) {
      lastSavedAutoSolveSigRef.current = sig;
      const now = Date.now();
      void saveCustomGameToHistory(uid ?? null, {
        id: `custom_${now}_${Math.random().toString(36).slice(2, 6)}`,
        date: new Date(now).toISOString(),
        grid: solverGrid.map((row) => [...row]),
        difficulty: difficultyMeta.difficultyText,
        isAutoSolved: true,
        createdAtMs: now,
      });
    }
    if (result.status === "multiple") {
      setSolverBanner({
        type: "info",
        message: "Auto-solved! Note: this clue set allows multiple valid solutions.",
      });
    } else {
      setSolverBanner({
        type: "success",
        message: "Solved cleanly with a unique Sudoku solution.",
      });
    }
  }, [solverGrid, uid, difficultyMeta.difficultyText]);

  const handlePlayPuzzle = useCallback(() => {
    const verifiedSolution = solvedGrid ?? solveCustomBoard(solverGrid).solution;
    if (!verifiedSolution) {
      setSolverBanner({
        type: "error",
        message: "Cannot start: no valid solution exists for these clues. Tap Edit Clues to fix.",
      });
      return;
    }
    setSolverBanner(null);
    try {
      localStorage.removeItem(CUSTOM_DRAFT_STORAGE_KEY);
    } catch {
      // Ignore storage error
    }
    const now = Date.now();
    const customRecordId = `custom_${now}_${Math.random().toString(36).slice(2, 6)}`;
    void saveCustomGameToHistory(uid ?? null, {
      id: customRecordId,
      date: new Date(now).toISOString(),
      grid: solverGrid.map((row) => [...row]),
      difficulty: difficultyMeta.difficultyText,
      isAutoSolved: false,
      createdAtMs: now,
    });
    onPlayCustomPuzzle?.(
      solverGrid.map((row) => [...row]),
      difficultyMeta.boardDifficulty,
      verifiedSolution.map((row) => [...row]),
      customRecordId
    );
  }, [solvedGrid, solverGrid, uid, difficultyMeta.difficultyText, difficultyMeta.boardDifficulty, onPlayCustomPuzzle]);

  const handleSelectHistoryRecord = useCallback((record: CustomPuzzleHistoryRecord) => {
    const nextGrid = record.grid.map((row) => [...row]);
    lastSavedAutoSolveSigRef.current = null;
    setSolverGrid(nextGrid);
    setConflictCells(validateCustomGrid(nextGrid));
    setSelectedCell(null);
    setSolvedGrid(null);
    setIsLocked(false);
    setIsHistoryOpen(false);
    setSolverBanner({
      type: "info",
      message: "Loaded saved puzzle. Tap Lock & Play to solve or enter the arena.",
    });
  }, []);

  // Desktop keyboard support for fast newspaper clue entry (blocked while Locked or History modal open)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell || isHistoryOpen) return;
      if (e.key === "ArrowUp") {
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
      } else if (isLocked) {
        return;
      } else if (e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        applyCellValue(Number(e.key));
      } else if (e.key === "0" || e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        applyCellValue(0);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isLocked, isHistoryOpen, selectedCell, applyCellValue]);

  const boardState = useMemo<SudokuBoardState>(
    () => ({
      grid: solverGrid.map((row, rIdx) =>
        row.map((clueVal, cIdx) => {
          const isClue = clueVal !== 0;
          const autoVal =
            isLocked && !isClue && solvedGrid ? (solvedGrid[rIdx]?.[cIdx] ?? 0) : 0;
          return {
            value: isClue ? clueVal : autoVal,
            isOriginalClue: isClue,
            isGiven: isClue,
            isAutoSolved: !isClue && autoVal !== 0,
            notes: [],
          };
        })
      ),
      selectedRow: selectedCell?.r ?? null,
      selectedCol: selectedCell?.c ?? null,
      difficulty: difficultyMeta.boardDifficulty,
      hintsCount: 0,
      isGameOver: false,
    }),
    [solverGrid, isLocked, solvedGrid, selectedCell, difficultyMeta.boardDifficulty]
  );

  const activeBoardValue =
    selectedCell ? (boardState.grid[selectedCell.r]?.[selectedCell.c]?.value ?? 0) : 0;
  const selectedCellValue = activeBoardValue !== 0 ? activeBoardValue : null;

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
            {isLocked && (
              <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#E0E7FF] text-[#3730A3] dark:bg-indigo-950/80 dark:text-indigo-200 shrink-0">
                <Lock className="w-2.5 h-2.5 stroke-[2.5]" />
                <span>Locked</span>
              </span>
            )}
          </div>

          <button
            type="button"
            id="solver-history-btn"
            onClick={() => setIsHistoryOpen(true)}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-0 outline-none text-xs font-bold cursor-pointer active:scale-95 transition-all duration-150 bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#3730A3] dark:bg-indigo-950/60 dark:hover:bg-indigo-900/75 dark:text-[#c7d2fe] shadow-[0_2px_8px_rgba(55,48,163,0.06)]"
          >
            <Clock className="w-3.5 h-3.5 stroke-[2.2] shrink-0" />
            <span>History</span>
          </button>
        </div>
      </div>

      {/* Main Solver Grid & Control Deck */}
      <main className="flex-1 min-h-0 w-full overflow-y-auto overscroll-contain flex flex-col items-center justify-start lg:justify-center px-3 sm:px-6 pt-3 pb-[clamp(24px,6vh,48px)]">
        {/* Clean Pastel Solver Toast / Status Banner */}
        {solverBanner && (
          <div
            id="solver-status-toast"
            role="status"
            className={`w-full max-w-3xl mx-auto mb-3 px-4 py-2.5 rounded-2xl border-0 flex items-center gap-2.5 text-xs sm:text-sm font-bold shadow-[0_6px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_6px_20px_rgba(0,0,0,0.4)] transition-all duration-200 ${
              solverBanner.type === "error"
                ? "bg-[#FFE4E6] text-[#9D174D] dark:bg-rose-950/80 dark:text-rose-200"
                : solverBanner.type === "success"
                  ? "bg-[#D1FAE5] text-[#065F46] dark:bg-emerald-950/80 dark:text-emerald-200"
                  : "bg-[#E0F2FE] text-[#0369A1] dark:bg-sky-950/80 dark:text-sky-200"
            }`}
          >
            {solverBanner.type === "error" ? (
              <AlertCircle className="w-4 h-4 shrink-0 stroke-[2.3]" />
            ) : solverBanner.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 stroke-[2.3]" />
            ) : (
              <Sparkles className="w-4 h-4 shrink-0 stroke-[2.3]" />
            )}
            <span className="leading-snug">{solverBanner.message}</span>
          </div>
        )}

        <div className="w-full max-w-3xl mx-auto flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-4 lg:gap-7 my-auto">
          {/* 9x9 Puzzle Input Grid */}
          <div className="w-full max-w-[min(92vw,420px)] lg:w-[440px] lg:max-w-[440px] shrink-0 flex items-center justify-center p-0.5 rounded-2xl">
            <SudokuBoard
              id="solver-sudoku-board"
              boardState={boardState}
              difficulty={difficultyMeta.boardDifficulty}
              theme={computedTheme}
              solutionGrid={solvedGrid ?? EMPTY_SOLUTION_GRID}
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

          {/* Control Deck: Setup Phase vs Locked Action Phase */}
          <div
            id="solver-control-deck"
            className="w-full max-w-[min(92vw,420px)] lg:w-[280px] shrink-0 flex flex-col justify-between gap-3"
          >
            {!isLocked ? (
              <>
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
                    theme={computedTheme}
                  />
                </div>

                {/* Bottom Row: Lock & Play CTA */}
                <button
                  type="button"
                  id="solver-lock-play-btn"
                  disabled={isLockDisabled}
                  onClick={handleLockAndPlay}
                  className={`w-full h-12 px-4 rounded-2xl border-0 outline-none flex items-center justify-center gap-2 text-sm font-black tracking-wide transition-all duration-150 shrink-0 ${
                    isLockDisabled
                      ? "bg-stone-200/80 text-stone-400 dark:bg-zinc-800/70 dark:text-zinc-500 cursor-not-allowed opacity-65 shadow-none"
                      : "bg-[#E0E7FF] hover:bg-[#C7D2FE] text-[#3730A3] dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:text-white cursor-pointer active:scale-[0.98] shadow-[0_8px_22px_rgba(55,48,163,0.12)] dark:shadow-[0_8px_22px_rgba(79,70,229,0.3)]"
                  }`}
                >
                  <Lock className="w-4 h-4 stroke-[2.4] shrink-0" />
                  <span>Lock &amp; Play</span>
                </button>
              </>
            ) : (
              /* Locked Action Deck */
              <div
                id="solver-locked-action-deck"
                className="w-full flex flex-col justify-center gap-3 p-4 rounded-3xl border-0 bg-white/90 dark:bg-zinc-900/90 shadow-[0_8px_28px_rgba(55,48,163,0.07)] dark:shadow-[0_8px_28px_rgba(0,0,0,0.45)] my-auto"
              >
                <div className="text-center px-1 pb-1">
                  <p className="font-sans text-xs font-extrabold uppercase tracking-wider text-stone-700 dark:text-zinc-200">
                    Clues Locked ({clueCount})
                  </p>
                  <p className="font-sans text-[11px] font-medium text-stone-500 dark:text-zinc-400 mt-0.5 leading-snug">
                    Reveal the complete grid or launch into timed play mode.
                  </p>
                </div>

                {/* 1. Edit Clues */}
                <button
                  type="button"
                  id="solver-edit-clues-btn"
                  onClick={handleEditClues}
                  className="w-full h-12 px-4 rounded-2xl border-0 outline-none flex items-center justify-center gap-2.5 text-sm font-bold tracking-wide cursor-pointer active:scale-[0.98] transition-all duration-150 bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#3730A3] dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-stone-100 shadow-[0_4px_14px_rgba(55,48,163,0.06)] dark:shadow-[0_4px_14px_rgba(0,0,0,0.3)]"
                >
                  <Pencil className="w-4 h-4 stroke-[2.2] shrink-0" />
                  <span>Edit Clues</span>
                </button>

                {/* 2. Auto-Solve */}
                <button
                  type="button"
                  id="solver-auto-solve-btn"
                  onClick={handleAutoSolve}
                  className="w-full h-12 px-4 rounded-2xl border-0 outline-none flex items-center justify-center gap-2.5 text-sm font-bold tracking-wide cursor-pointer active:scale-[0.98] transition-all duration-150 bg-[#CCFBF1] hover:bg-[#99F6E4] text-[#115E59] dark:bg-teal-950/75 dark:hover:bg-teal-900/85 dark:text-teal-200 shadow-[0_6px_18px_rgba(17,94,89,0.08)] dark:shadow-[0_6px_18px_rgba(0,0,0,0.35)]"
                >
                  <Zap className="w-4 h-4 stroke-[2.3] shrink-0" />
                  <span>Auto-Solve</span>
                </button>

                {/* 3. Play Puzzle */}
                <button
                  type="button"
                  id="solver-play-puzzle-btn"
                  onClick={handlePlayPuzzle}
                  className="w-full h-12 px-4 rounded-2xl border-0 outline-none flex items-center justify-center gap-2.5 text-sm font-black tracking-wide cursor-pointer active:scale-[0.98] transition-all duration-150 bg-[#E0E7FF] hover:bg-[#C7D2FE] text-[#3730A3] dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:text-white shadow-[0_8px_22px_rgba(55,48,163,0.14)] dark:shadow-[0_8px_22px_rgba(79,70,229,0.35)]"
                >
                  <Play className="w-4 h-4 stroke-[2.4] fill-current shrink-0" />
                  <span>Play Puzzle</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <CustomHistoryModal
        isOpen={isHistoryOpen}
        darkMode={isDarkMode}
        uid={uid ?? null}
        onClose={() => setIsHistoryOpen(false)}
        onSelectRecord={handleSelectHistoryRecord}
      />
    </div>
  );
};
