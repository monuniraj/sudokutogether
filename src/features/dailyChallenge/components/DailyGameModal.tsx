/**
 * Isolated Daily Challenge Gameplay Modal (Milestone 4).
 *
 * Strict UI & Architecture compliance:
 * - Uses exclusively the isolated `useDailyChallenge` state & handlers.
 * - Pastel borderless, shadowless UI with smooth curved corners.
 * - Strictly Lucide React SVG vector icons (zero emojis).
 * - Automatically opens `DailyResultModal` upon transitioning to `COMPLETED` or `FAILED`.
 * - All user-facing strings wrapped with `t('daily.<key>', 'English Fallback')`.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Eraser,
  Pause,
  Pencil,
  Play,
  Trophy,
  X,
  XCircle,
} from "lucide-react";
import { useTranslation } from "../../../i18n/useTranslation";
import type { UseDailyChallengeReturn } from "../hooks/useDailyChallenge";
import type { DailyChallengeStatus, DailyDifficulty } from "../types/daily.types";
import { DailyResultModal } from "./DailyResultModal";

export interface DailyGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  daily: UseDailyChallengeReturn;
  darkMode?: boolean;
  initialShowResult?: boolean;
}

function formatDurationMMSS(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function getDifficultyPillStyle(
  difficulty: DailyDifficulty,
  darkMode: boolean
): string {
  switch (difficulty) {
    case "EASY":
      return darkMode
        ? "bg-[#064e3b] text-[#a7f3d0]"
        : "bg-[#D1FAE5] text-[#065F46]";
    case "MEDIUM":
      return darkMode
        ? "bg-[#78350f] text-[#fde68a]"
        : "bg-[#FEF3C7] text-[#92400E]";
    case "HARD":
      return darkMode
        ? "bg-[#4c1d95] text-[#ddd6fe]"
        : "bg-[#EDE9FE] text-[#5B21B6]";
    case "EXPERT":
      return darkMode
        ? "bg-[#881337] text-[#fecdd3]"
        : "bg-[#FFE4E6] text-[#9F1239]";
    case "MASTER":
      return darkMode
        ? "bg-[#312e81] text-[#c7d2fe]"
        : "bg-[#E0E7FF] text-[#3730A3]";
  }
}

export const DailyGameModal: React.FC<DailyGameModalProps> = ({
  isOpen,
  onClose,
  daily,
  darkMode = false,
  initialShowResult = false,
}) => {
  const { t } = useTranslation();
  const [notesMode, setNotesMode] = useState(false);
  const [showResultModal, setShowResultModal] = useState(initialShowResult);
  const prevStatusRef = useRef<DailyChallengeStatus>(daily.status);

  const td = useCallback(
    (key: string, fallback: string): string => {
      const val = (t as (k: string) => string)(key);
      if (!val || val === key || /^daily\./i.test(val)) {
        return fallback;
      }
      return val;
    },
    [t]
  );

  // Sync initialShowResult when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowResultModal(initialShowResult);
      prevStatusRef.current = daily.status;
    } else {
      setShowResultModal(false);
      setNotesMode(false);
    }
  }, [isOpen, initialShowResult]);

  // Automatically open DailyResultModal upon transition to COMPLETED or FAILED
  useEffect(() => {
    if (!isOpen) return;
    const prev = prevStatusRef.current;
    const curr = daily.status;
    if (
      prev !== curr &&
      (curr === "COMPLETED" || curr === "FAILED") &&
      (prev === "IN_PROGRESS" || prev === "NOT_STARTED")
    ) {
      setShowResultModal(true);
    }
    prevStatusRef.current = curr;
  }, [isOpen, daily.status]);

  // Safe close handler: pause active gameplay so timer never runs in background
  const handleCloseModal = useCallback(() => {
    if (daily.status === "IN_PROGRESS" && !daily.isPaused) {
      daily.togglePause();
    }
    setShowResultModal(false);
    onClose();
  }, [daily, onClose]);

  // Keyboard navigation and digit entry while DailyGameModal is active
  useEffect(() => {
    if (!isOpen || showResultModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleCloseModal();
        return;
      }

      if (e.key === "p" || e.key === "P") {
        if (daily.status === "IN_PROGRESS") {
          e.preventDefault();
          daily.togglePause();
        }
        return;
      }

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        setNotesMode((prev) => !prev);
        return;
      }

      const sel = daily.selectedCell;
      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) {
        e.preventDefault();
        const current = sel === null ? 40 : sel;
        const row = Math.floor(current / 9);
        const col = current % 9;
        let nextRow = row;
        let nextCol = col;
        if (e.key === "ArrowUp") nextRow = (row + 8) % 9;
        if (e.key === "ArrowDown") nextRow = (row + 1) % 9;
        if (e.key === "ArrowLeft") nextCol = (col + 8) % 9;
        if (e.key === "ArrowRight") nextCol = (col + 1) % 9;
        daily.selectCell(nextRow * 9 + nextCol);
        return;
      }

      if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        e.preventDefault();
        daily.eraseCell();
        return;
      }

      if (/^[1-9]$/.test(e.key)) {
        e.preventDefault();
        const digit = Number(e.key);
        if (notesMode || e.shiftKey) {
          daily.toggleNote(digit);
        } else {
          daily.setNumber(digit);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, showResultModal, daily, notesMode, handleCloseModal]);

  // Count placed digits 1..9 on the current board for keypad remaining indicators
  const digitCounts = useMemo(() => {
    const counts = Array<number>(10).fill(0);
    for (let i = 0; i < daily.board.length && i < 81; i++) {
      const code = daily.board.charCodeAt(i) - 48;
      if (code >= 1 && code <= 9) {
        counts[code] += 1;
      }
    }
    return counts;
  }, [daily.board]);

  if (!isOpen || typeof document === "undefined") return null;

  const isTerminal = daily.status === "COMPLETED" || daily.status === "FAILED";
  const selectedDigit =
    daily.selectedCell !== null ? daily.board[daily.selectedCell] : "0";
  const selectedRow =
    daily.selectedCell !== null ? Math.floor(daily.selectedCell / 9) : -1;
  const selectedCol =
    daily.selectedCell !== null ? daily.selectedCell % 9 : -1;
  const selectedBoxRow =
    selectedRow >= 0 ? Math.floor(selectedRow / 3) : -1;
  const selectedBoxCol =
    selectedCol >= 0 ? Math.floor(selectedCol / 3) : -1;

  const modalContent = (
    <>
      <div
        className="fixed inset-0 z-[120] flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/60 backdrop-blur-sm select-none overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="daily-game-modal-title"
        onClick={handleCloseModal}
      >
        <div
          className={`w-full max-w-lg rounded-3xl border-0 shadow-none p-3.5 sm:p-5 my-auto transition-colors ${
            darkMode
              ? "bg-[#0f172a] text-slate-100"
              : "bg-[#FAF9F6] text-slate-800"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Header Bar */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-9 h-9 rounded-2xl border-0 shadow-none flex items-center justify-center shrink-0 ${
                  darkMode
                    ? "bg-[#451a03] text-[#fde68a]"
                    : "bg-[#FEF3C7] text-[#92400E]"
                }`}
              >
                <Calendar className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2
                    id="daily-game-modal-title"
                    className="font-sans font-black text-sm sm:text-base leading-none truncate"
                  >
                    {td("daily.modalTitle", "Daily Challenge")}
                  </h2>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border-0 shadow-none ${getDifficultyPillStyle(
                      daily.difficulty,
                      darkMode
                    )}`}
                  >
                    {daily.difficulty}
                  </span>
                </div>
                <p className="font-mono text-[11px] font-semibold opacity-70 mt-1">
                  {daily.date}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {isTerminal && (
                <button
                  type="button"
                  onClick={() => setShowResultModal(true)}
                  className={`h-9 px-3 rounded-2xl border-0 shadow-none text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95 ${
                    daily.status === "COMPLETED"
                      ? darkMode
                        ? "bg-[#064e3b] text-[#a7f3d0]"
                        : "bg-[#D1FAE5] text-[#065F46]"
                      : darkMode
                        ? "bg-[#881337] text-[#fecdd3]"
                        : "bg-[#FFE4E6] text-[#9F1239]"
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 shrink-0" />
                  <span>{td("daily.resultsBtn", "Stats")}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCloseModal}
                aria-label={td("daily.closeBtn", "Close")}
                className={`w-9 h-9 rounded-2xl border-0 shadow-none flex items-center justify-center cursor-pointer transition-transform active:scale-95 ${
                  darkMode
                    ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                    : "bg-[#F1F5F9] hover:bg-[#E2E8F0] text-slate-600"
                }`}
              >
                <X className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>
          </div>

          {/* HUD Strip: Mistakes (X / 3) | Timer | Pause Button */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {/* Mistakes Counter */}
            <div
              className={`rounded-2xl border-0 shadow-none px-3 py-2 flex items-center justify-center gap-1.5 text-xs font-bold ${
                daily.mistakes >= 2
                  ? darkMode
                    ? "bg-[#881337]/60 text-[#fecdd3]"
                    : "bg-[#FFE4E6] text-[#9F1239]"
                  : darkMode
                    ? "bg-slate-800/90 text-slate-300"
                    : "bg-[#F1F5F9] text-slate-600"
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>
                {td("daily.mistakesShort", "Mistakes")}:{" "}
                <strong className="font-mono">{daily.mistakes} / 3</strong>
              </span>
            </div>

            {/* Timer */}
            <div
              className={`rounded-2xl border-0 shadow-none px-3 py-2 flex items-center justify-center gap-1.5 text-xs font-bold ${
                darkMode
                  ? "bg-[#0c4a6e]/60 text-[#bae6fd]"
                  : "bg-[#E0F2FE] text-[#0369A1]"
              }`}
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span className="font-mono text-sm font-black">
                {formatDurationMMSS(daily.elapsedTime)}
              </span>
            </div>

            {/* Pause / Resume Button */}
            <button
              type="button"
              disabled={isTerminal || daily.status === "NOT_STARTED"}
              onClick={daily.togglePause}
              className={`rounded-2xl border-0 shadow-none px-3 py-2 flex items-center justify-center gap-1.5 text-xs font-bold transition-transform active:scale-95 ${
                isTerminal || daily.status === "NOT_STARTED"
                  ? darkMode
                    ? "bg-slate-800/40 text-slate-600 cursor-not-allowed"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : daily.isPaused
                    ? darkMode
                      ? "bg-[#064e3b] text-[#a7f3d0] cursor-pointer"
                      : "bg-[#D1FAE5] text-[#065F46] cursor-pointer"
                    : darkMode
                      ? "bg-[#78350f]/70 hover:bg-[#78350f] text-[#fde68a] cursor-pointer"
                      : "bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] cursor-pointer"
              }`}
            >
              {daily.isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 shrink-0" />
                  <span>{td("daily.resumeBtn", "Resume")}</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 shrink-0" />
                  <span>{td("daily.pauseBtn", "Pause")}</span>
                </>
              )}
            </button>
          </div>

          {/* Terminal Status Banner (when reviewing board) */}
          {isTerminal && (
            <div
              className={`rounded-2xl border-0 shadow-none px-3.5 py-2 mb-3 flex items-center justify-between gap-2 text-xs font-bold ${
                daily.status === "COMPLETED"
                  ? darkMode
                    ? "bg-[#064e3b]/60 text-[#a7f3d0]"
                    : "bg-[#D1FAE5] text-[#065F46]"
                  : darkMode
                    ? "bg-[#881337]/60 text-[#fecdd3]"
                    : "bg-[#FFE4E6] text-[#9F1239]"
              }`}
            >
              <span className="inline-flex items-center gap-1.5 truncate">
                {daily.status === "COMPLETED" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 shrink-0" />
                )}
                <span className="truncate">
                  {daily.status === "COMPLETED"
                    ? td("daily.reviewCompletedBanner", "Puzzle Completed — Review Mode")
                    : td("daily.reviewFailedBanner", "Puzzle Failed — Review Mode")}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setShowResultModal(true)}
                className="underline font-black shrink-0 cursor-pointer"
              >
                {td("daily.viewSummaryLink", "View Summary")}
              </button>
            </div>
          )}

          {/* 9x9 Sudoku Grid */}
          <div className="relative w-full aspect-square max-w-[420px] mx-auto mb-3.5">
            <div
              className={`w-full h-full grid grid-cols-9 grid-rows-9 rounded-2xl overflow-hidden border-0 shadow-none ${
                darkMode ? "bg-slate-900" : "bg-white"
              }`}
              role="grid"
              aria-label={td("daily.gridAriaLabel", "Daily Sudoku Board")}
            >
              {Array.from({ length: 81 }, (_, idx) => {
                const row = Math.floor(idx / 9);
                const col = idx % 9;
                const boxRow = Math.floor(row / 3);
                const boxCol = Math.floor(col / 3);

                const cellChar = daily.board[idx] || "0";
                const isClue = daily.initialBoard[idx] !== "0";
                const isSelected = daily.selectedCell === idx;
                const isPeer =
                  !isSelected &&
                  selectedRow >= 0 &&
                  (row === selectedRow ||
                    col === selectedCol ||
                    (boxRow === selectedBoxRow && boxCol === selectedBoxCol));
                const isSameDigit =
                  !isSelected &&
                  selectedDigit !== "0" &&
                  cellChar === selectedDigit;
                const isAlternateBox = (boxRow + boxCol) % 2 === 1;

                const cellNotes = cellChar === "0" ? daily.notes[idx] || [] : [];

                // Internal 3x3 subgrid divider lines
                const rightBorder =
                  col === 2 || col === 5
                    ? darkMode
                      ? "border-r-2 border-slate-600"
                      : "border-r-2 border-slate-300"
                    : col < 8
                      ? darkMode
                        ? "border-r border-slate-800"
                        : "border-r border-slate-200/80"
                      : "";

                const bottomBorder =
                  row === 2 || row === 5
                    ? darkMode
                      ? "border-b-2 border-slate-600"
                      : "border-b-2 border-slate-300"
                    : row < 8
                      ? darkMode
                        ? "border-b border-slate-800"
                        : "border-b border-slate-200/80"
                      : "";

                let cellBgClass = "";
                if (isSelected) {
                  cellBgClass = darkMode
                    ? "bg-[#312e81]"
                    : "bg-[#C7D2FE]";
                } else if (isSameDigit) {
                  cellBgClass = darkMode
                    ? "bg-[#1e3a8a]/70"
                    : "bg-[#BAE6FD]/80";
                } else if (isPeer) {
                  cellBgClass = darkMode
                    ? "bg-slate-800/85"
                    : "bg-[#EEF2FF]/75";
                } else if (isAlternateBox) {
                  cellBgClass = darkMode
                    ? "bg-slate-900"
                    : "bg-[#F8FAFC]";
                } else {
                  cellBgClass = darkMode
                    ? "bg-slate-900/70"
                    : "bg-white";
                }

                const textColorClass = isClue
                  ? darkMode
                    ? "text-slate-100 font-black"
                    : "text-slate-900 font-black"
                  : darkMode
                    ? "text-[#7dd3fc] font-bold"
                    : "text-[#0284C7] font-bold";

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => daily.selectCell(idx)}
                    aria-label={`Row ${row + 1} Column ${col + 1}`}
                    className={`w-full h-full flex items-center justify-center p-0 outline-none transition-colors duration-75 cursor-pointer ${rightBorder} ${bottomBorder} ${cellBgClass}`}
                  >
                    {cellChar !== "0" ? (
                      <span
                        className={`font-sans text-base sm:text-xl leading-none ${textColorClass}`}
                      >
                        {cellChar}
                      </span>
                    ) : cellNotes.length > 0 ? (
                      <span className="w-full h-full grid grid-cols-3 grid-rows-3 p-[1px] pointer-events-none">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                          <span
                            key={n}
                            className={`flex items-center justify-center font-mono text-[8px] sm:text-[9px] leading-none ${
                              darkMode ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            {cellNotes.includes(n) ? n : ""}
                          </span>
                        ))}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* Anti-Cheat Pastel Pause Overlay */}
            {daily.isPaused && daily.status === "IN_PROGRESS" && (
              <div
                className={`absolute inset-0 rounded-2xl border-0 shadow-none flex flex-col items-center justify-center gap-3 p-6 text-center ${
                  darkMode
                    ? "bg-slate-900/95 text-slate-100"
                    : "bg-[#FAF9F6]/95 text-slate-800"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl border-0 shadow-none flex items-center justify-center ${
                    darkMode
                      ? "bg-[#78350f] text-[#fde68a]"
                      : "bg-[#FEF3C7] text-[#92400E]"
                  }`}
                >
                  <Pause className="w-6 h-6 stroke-[2.2]" />
                </div>
                <p className="font-sans font-black text-base">
                  {td("daily.pausedHeading", "Challenge Paused")}
                </p>
                <p className="text-xs font-semibold opacity-75 max-w-xs">
                  {td(
                    "daily.pausedSubtitle",
                    "Timer is paused. Resume whenever you are ready."
                  )}
                </p>
                <button
                  type="button"
                  onClick={daily.togglePause}
                  className={`mt-1 px-5 py-2.5 rounded-2xl border-0 shadow-none font-sans font-black text-sm flex items-center gap-2 cursor-pointer transition-transform active:scale-95 ${
                    darkMode
                      ? "bg-[#064e3b] text-[#a7f3d0]"
                      : "bg-[#D1FAE5] text-[#065F46]"
                  }`}
                >
                  <Play className="w-4 h-4 stroke-[2.4]" />
                  <span>{td("daily.resumeBtn", "Resume")}</span>
                </button>
              </div>
            )}
          </div>

          {/* Action Bar: Notes Toggle & Erase */}
          <div className="grid grid-cols-2 gap-2.5 mb-2.5">
            <button
              type="button"
              disabled={isTerminal || daily.isPaused}
              onClick={() => setNotesMode((prev) => !prev)}
              className={`py-2.5 px-3 rounded-2xl border-0 shadow-none font-sans font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.98] ${
                isTerminal || daily.isPaused
                  ? darkMode
                    ? "bg-slate-800/40 text-slate-600 cursor-not-allowed"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : notesMode
                    ? darkMode
                      ? "bg-[#4c1d95] text-[#ddd6fe] cursor-pointer"
                      : "bg-[#DDD6FE] text-[#5B21B6] cursor-pointer"
                    : darkMode
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                      : "bg-[#F1F5F9] hover:bg-[#E2E8F0] text-slate-700 cursor-pointer"
              }`}
            >
              <Pencil className="w-4 h-4 stroke-[2.2] shrink-0" />
              <span>
                {td("daily.notesBtn", "Notes")}:{" "}
                <strong>{notesMode ? "ON" : "OFF"}</strong>
              </span>
            </button>

            <button
              type="button"
              disabled={isTerminal || daily.isPaused}
              onClick={daily.eraseCell}
              className={`py-2.5 px-3 rounded-2xl border-0 shadow-none font-sans font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.98] ${
                isTerminal || daily.isPaused
                  ? darkMode
                    ? "bg-slate-800/40 text-slate-600 cursor-not-allowed"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : darkMode
                    ? "bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                    : "bg-[#F1F5F9] hover:bg-[#E2E8F0] text-slate-700 cursor-pointer"
              }`}
            >
              <Eraser className="w-4 h-4 stroke-[2.2] shrink-0" />
              <span>{td("daily.eraseBtn", "Erase")}</span>
            </button>
          </div>

          {/* 1–9 Number Pad */}
          <div className="grid grid-cols-9 gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
              const remaining = Math.max(0, 9 - digitCounts[num]);
              const isExhausted = remaining === 0;
              return (
                <button
                  key={num}
                  type="button"
                  disabled={isTerminal || daily.isPaused}
                  onClick={() => {
                    if (notesMode) {
                      daily.toggleNote(num);
                    } else {
                      daily.setNumber(num);
                    }
                  }}
                  className={`py-2.5 sm:py-3 rounded-2xl border-0 shadow-none flex flex-col items-center justify-center transition-transform active:scale-95 ${
                    isTerminal || daily.isPaused
                      ? darkMode
                        ? "bg-slate-800/40 text-slate-600 cursor-not-allowed"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : isExhausted
                        ? darkMode
                          ? "bg-slate-800/50 text-slate-500 cursor-pointer"
                          : "bg-[#F1F5F9]/70 text-slate-400 cursor-pointer"
                        : darkMode
                          ? "bg-[#1e293b] hover:bg-[#334155] text-slate-100 cursor-pointer"
                          : "bg-[#E0E7FF]/85 hover:bg-[#C7D2FE] text-[#312E81] cursor-pointer"
                  }`}
                >
                  <span className="font-sans font-black text-base sm:text-lg leading-none">
                    {num}
                  </span>
                  <span className="font-mono text-[9px] font-bold opacity-65 mt-0.5 leading-none">
                    {remaining}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Result & Stats Modal */}
      <DailyResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        onReviewBoard={() => setShowResultModal(false)}
        date={daily.date}
        difficulty={daily.difficulty}
        status={daily.status}
        elapsedTime={daily.elapsedTime}
        mistakes={daily.mistakes}
        stats={daily.stats}
        darkMode={darkMode}
      />
    </>
  );

  return createPortal(modalContent, document.body);
};
