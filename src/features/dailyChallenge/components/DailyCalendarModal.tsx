/**
 * Interactive Daily Challenge Calendar & Archive Modal.
 *
 * Strict UI & Architecture compliance:
 * - True neutral charcoal dark palette (`#18181b` / `#222225` — zero bluish tint)
 *   and warm pastel ivory light palette (`#FDFBF7` / `#F4EFE6`).
 * - STRICT BORDERLESS & SHADOWLESS RULE: zero visible outline borders or drop shadows.
 * - Strictly Lucide React SVG vector icons (zero emojis).
 * - Mon-to-Sun 7-column calendar supporting:
 *   - Completed days (pastel Trophy badge + solved time -> opens Result/Review modal)
 *   - Today unplayed/active (accent highlight ring + difficulty tag -> launches puzzle)
 *   - Past missed days (Archive Play on master board without incrementing streaks)
 *   - Future days (muted, locked, unclickable)
 * - All user-facing strings wrapped with `t('daily.<key>', 'English Fallback')`.
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Lock,
  Trophy,
  X,
  XCircle,
} from "lucide-react";
import { useTranslation } from "../../../i18n/useTranslation";
import {
  formatDateKey,
  generateDailyPuzzle,
  getDailyDifficultyForDate,
} from "../services/dailyGenerator";
import { getDailyProgress, getDailyStats } from "../services/dailyStorage";
import type {
  DailyChallengeProgress,
  DailyDifficulty,
  DailyStats,
  DayRecord,
} from "../types/daily.types";

export interface DailyCalendarLaunchPayload {
  date: string;
  difficulty: DailyDifficulty;
  puzzle: number[][];
  solved: number[][];
  seed: number;
  savedProgress: DailyChallengeProgress | null;
  reviewOnly?: boolean;
  isArchive?: boolean;
}

export interface DailyCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called when selecting an unplayed/in-progress/archive day to launch on the master board */
  onLaunchDayPuzzle: (payload: DailyCalendarLaunchPayload) => void;
  /** Called when clicking a completed/failed past/present day to open DailyResultModal with Back button */
  onInspectDayResult: (payload: {
    date: string;
    record: DayRecord;
    stats: DailyStats;
  }) => void;
  uid?: string | null;
  darkMode?: boolean;
  /** Optional initial YYYY-MM-DD month anchor */
  initialDate?: string;
  /** Incremented externally when vault records update */
  refreshTrigger?: number;
}

function formatDurationMMSS(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function getShortDifficultyLabel(difficulty: DailyDifficulty): string {
  switch (difficulty) {
    case "EASY":
      return "EASY";
    case "MEDIUM":
      return "MED";
    case "HARD":
      return "HARD";
    case "EXPERT":
      return "EXP";
    case "MASTER":
      return "MSTR";
  }
}

export const DailyCalendarModal: React.FC<DailyCalendarModalProps> = ({
  isOpen,
  onClose,
  onLaunchDayPuzzle,
  onInspectDayResult,
  uid,
  darkMode = false,
  initialDate,
  refreshTrigger = 0,
}) => {
  const { t, language } = useTranslation();
  const todayKey = useMemo(() => formatDateKey(new Date()), []);

  const [viewYear, setViewYear] = useState<number>(() => {
    const base = initialDate || todayKey;
    return Number(base.slice(0, 4)) || new Date().getFullYear();
  });
  const [viewMonthIndex, setViewMonthIndex] = useState<number>(() => {
    const base = initialDate || todayKey;
    const m = Number(base.slice(5, 7));
    return m >= 1 && m <= 12 ? m - 1 : new Date().getMonth();
  });

  // Sync viewed month when reopened with a different initialDate
  useEffect(() => {
    if (!isOpen) return;
    const base = initialDate || todayKey;
    const y = Number(base.slice(0, 4));
    const m = Number(base.slice(5, 7));
    if (Number.isInteger(y) && Number.isInteger(m) && m >= 1 && m <= 12) {
      setViewYear(y);
      setViewMonthIndex(m - 1);
    }
  }, [isOpen, initialDate, todayKey]);

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

  // Close cleanly on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [isOpen, onClose]);

  const stats: DailyStats = useMemo(
    () => getDailyStats(uid, todayKey),
    [uid, todayKey, isOpen, refreshTrigger]
  );

  const monthTitle = useMemo(() => {
    try {
      const d = new Date(Date.UTC(viewYear, viewMonthIndex, 15));
      return new Intl.DateTimeFormat(language || "en", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(d);
    } catch {
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      return `${monthNames[viewMonthIndex] || ""} ${viewYear}`;
    }
  }, [viewYear, viewMonthIndex, language]);

  const weekdayHeaders = useMemo(
    () => [
      td("daily.weekdayMon", "Mon"),
      td("daily.weekdayTue", "Tue"),
      td("daily.weekdayWed", "Wed"),
      td("daily.weekdayThu", "Thu"),
      td("daily.weekdayFri", "Fri"),
      td("daily.weekdaySat", "Sat"),
      td("daily.weekdaySun", "Sun"),
    ],
    [td]
  );

  const calendarCells = useMemo(() => {
    const firstUtc = new Date(Date.UTC(viewYear, viewMonthIndex, 1));
    // Convert UTC Sunday-first (0..6) -> Monday-first offset (0=Mon .. 6=Sun)
    const leadingBlanks = (firstUtc.getUTCDay() + 6) % 7;
    const daysInMonth = new Date(Date.UTC(viewYear, viewMonthIndex + 1, 0)).getUTCDate();

    const items: Array<{ day: number; dateKey: string } | null> = [];
    for (let i = 0; i < leadingBlanks; i++) {
      items.push(null);
    }
    const mm = String(viewMonthIndex + 1).padStart(2, "0");
    for (let d = 1; d <= daysInMonth; d++) {
      const dd = String(d).padStart(2, "0");
      items.push({ day: d, dateKey: `${viewYear}-${mm}-${dd}` });
    }
    return items;
  }, [viewYear, viewMonthIndex]);

  const handlePrevMonth = useCallback(() => {
    setViewMonthIndex((prev) => {
      if (prev === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setViewMonthIndex((prev) => {
      if (prev === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  const handleCellClick = useCallback(
    (dateKey: string) => {
      if (dateKey > todayKey) return; // Future days locked

      const existingRecord = stats.recordsByDate[dateKey];
      if (
        existingRecord &&
        (existingRecord.status === "COMPLETED" ||
          existingRecord.status === "FAILED")
      ) {
        onInspectDayResult({
          date: dateKey,
          record: existingRecord,
          stats,
        });
        return;
      }

      const generated = generateDailyPuzzle(dateKey);
      const savedProgress = getDailyProgress(dateKey, uid);
      onLaunchDayPuzzle({
        date: generated.date,
        difficulty: generated.difficulty,
        puzzle: generated.puzzle,
        solved: generated.solved,
        seed: generated.seed,
        savedProgress,
        reviewOnly: false,
        isArchive: dateKey < todayKey,
      });
    },
    [todayKey, stats, onInspectDayResult, uid, onLaunchDayPuzzle]
  );

  if (!isOpen || typeof document === "undefined") return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[10000] overflow-y-auto flex justify-center p-3.5 sm:p-4 pt-[calc(76px+env(safe-area-inset-top,0px))] pb-4 sm:pb-6 bg-black/65 backdrop-blur-sm select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="daily-calendar-modal-title"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md max-h-[85dvh] overflow-y-auto my-auto rounded-3xl border-0 shadow-none p-4 sm:p-5 transition-colors ${
          darkMode
            ? "bg-[#18181b] text-zinc-100"
            : "bg-[#FDFBF7] text-[#1C1917]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-9 h-9 rounded-2xl border-0 shadow-none flex items-center justify-center shrink-0 ${
                darkMode
                  ? "bg-[#451a03] text-[#fde68a]"
                  : "bg-[#FEF3C7] text-[#92400E]"
              }`}
            >
              <Calendar className="w-4 h-4 stroke-[2.3]" />
            </div>
            <div className="min-w-0">
              <h2
                id="daily-calendar-modal-title"
                className="font-sans font-black text-sm sm:text-base leading-tight truncate"
              >
                {td("daily.calendarTitle", "Daily Challenge Calendar")}
              </h2>
              <p className="font-sans text-[11px] font-semibold opacity-65 truncate">
                {td("daily.calendarSubtitle", "Select any past day for Archive Play")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={td("daily.closeBtn", "Close")}
            className={`w-8 h-8 rounded-2xl border-0 shadow-none flex items-center justify-center shrink-0 cursor-pointer transition-transform active:scale-95 ${
              darkMode
                ? "bg-[#222225] hover:bg-[#2c2c30] text-zinc-300"
                : "bg-[#F4EFE6] hover:bg-[#EAE3D5] text-stone-600"
            }`}
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Career Summary Strip: Total Solved & Longest Streak */}
        <div className="grid grid-cols-2 gap-2 mb-3.5">
          <div
            className={`rounded-2xl border-0 shadow-none px-3 py-2 flex items-center justify-between ${
              darkMode
                ? "bg-[#222225] text-zinc-100"
                : "bg-[#F4EFE6] text-[#1C1917]"
            }`}
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-bold">
              <Trophy
                className={`w-3.5 h-3.5 shrink-0 ${
                  darkMode ? "text-emerald-400" : "text-[#065F46]"
                }`}
              />
              <span className={darkMode ? "text-zinc-300" : "text-stone-700"}>
                {td("daily.totalSolvedLabel", "Total Solved")}
              </span>
            </span>
            <span className="font-mono font-black text-base">
              {stats.totalCompleted}
            </span>
          </div>

          <div
            className={`rounded-2xl border-0 shadow-none px-3 py-2 flex items-center justify-between ${
              darkMode
                ? "bg-[#222225] text-zinc-100"
                : "bg-[#F4EFE6] text-[#1C1917]"
            }`}
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-bold">
              <Flame
                className={`w-3.5 h-3.5 shrink-0 ${
                  darkMode ? "text-amber-400" : "text-[#92400E]"
                }`}
              />
              <span className={darkMode ? "text-zinc-300" : "text-stone-700"}>
                {td("daily.longestStreakShort", "Best Streak")}
              </span>
            </span>
            <span className="font-mono font-black text-base">
              {stats.longestStreak}
            </span>
          </div>
        </div>

        {/* Month Navigation Selector */}
        <div
          className={`w-full rounded-2xl border-0 shadow-none px-2 py-1.5 mb-2.5 flex items-center justify-between ${
            darkMode
              ? "bg-[#222225] text-zinc-100"
              : "bg-[#F4EFE6] text-[#1C1917]"
          }`}
        >
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label={td("daily.prevMonthBtn", "Previous Month")}
            className={`w-8 h-8 rounded-xl border-0 shadow-none flex items-center justify-center cursor-pointer transition-colors active:scale-95 ${
              darkMode
                ? "hover:bg-[#2c2c30] text-zinc-200"
                : "hover:bg-[#EAE3D5] text-stone-700"
            }`}
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.4]" />
          </button>

          <span className="font-sans font-black text-sm tracking-tight capitalize">
            {monthTitle}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            aria-label={td("daily.nextMonthBtn", "Next Month")}
            className={`w-8 h-8 rounded-xl border-0 shadow-none flex items-center justify-center cursor-pointer transition-colors active:scale-95 ${
              darkMode
                ? "hover:bg-[#2c2c30] text-zinc-200"
                : "hover:bg-[#EAE3D5] text-stone-700"
            }`}
          >
            <ChevronRight className="w-4 h-4 stroke-[2.4]" />
          </button>
        </div>

        {/* 7-Column Weekday Headers (Mon -> Sun) */}
        <div className="grid grid-cols-7 gap-1.5 mb-1.5 px-0.5">
          {weekdayHeaders.map((label, idx) => (
            <div
              key={idx}
              className={`text-center font-sans text-[10px] font-bold uppercase tracking-wider ${
                darkMode ? "text-zinc-400" : "text-stone-700"
              }`}
            >
              {label}
            </div>
          ))}
        </div>

        {/* 7-Column Month Grid */}
        <div className="grid grid-cols-7 gap-1.5 mb-3">
          {calendarCells.map((cell, idx) => {
            if (!cell) {
              return <div key={`blank-${idx}`} className="h-[52px]" />;
            }

            const { day, dateKey } = cell;
            const isFuture = dateKey > todayKey;
            const isToday = dateKey === todayKey;
            const record = stats.recordsByDate[dateKey];
            const progress = getDailyProgress(dateKey, uid);
            const dayDifficulty = getDailyDifficultyForDate(dateKey);

            const isCompleted = record?.status === "COMPLETED";
            const isFailed = record?.status === "FAILED";
            const isInProgress =
              !isCompleted && !isFailed && progress?.status === "IN_PROGRESS";

            const todayRingClasses =
              isToday && !isFuture
                ? darkMode
                  ? "ring-2 ring-[#F59E0B] ring-offset-2 ring-offset-zinc-900"
                  : "ring-2 ring-[#D97706] ring-offset-2 ring-offset-[#FDFBF7]"
                : "";

            let tileClasses = "";
            if (isFuture) {
              tileClasses = darkMode
                ? "bg-[#1e1e21]/50 text-zinc-600 cursor-not-allowed"
                : "bg-[#F4EFE6]/45 text-stone-400 cursor-not-allowed";
            } else if (isCompleted) {
              tileClasses = darkMode
                ? "bg-[#022c22]/85 hover:bg-[#064e3b] text-[#a7f3d0] cursor-pointer"
                : "bg-[#D1FAE5] hover:bg-[#A7F3D0] text-[#065F46] cursor-pointer";
            } else if (isFailed) {
              tileClasses = darkMode
                ? "bg-[#4c0519]/75 hover:bg-[#881337] text-[#fecdd3] cursor-pointer"
                : "bg-[#FFE4E6] hover:bg-[#FECDD3] text-[#9F1239] cursor-pointer";
            } else if (isInProgress) {
              tileClasses = darkMode
                ? "bg-[#0c4a6e]/50 hover:bg-[#0c4a6e]/70 text-[#bae6fd] cursor-pointer"
                : "bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1] cursor-pointer";
            } else if (isToday) {
              tileClasses = darkMode
                ? "bg-[#78350F]/40 hover:bg-[#78350F]/55 text-[#FEF3C7] cursor-pointer"
                : "bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#78350F] cursor-pointer";
            } else {
              tileClasses = darkMode
                ? "bg-[#222225] hover:bg-[#2c2c30] text-zinc-300 cursor-pointer"
                : "bg-[#F4EFE6] hover:bg-[#EAE3D5] text-stone-700 cursor-pointer";
            }

            return (
              <button
                key={dateKey}
                type="button"
                disabled={isFuture}
                onClick={() => handleCellClick(dateKey)}
                aria-label={`${dateKey}${isCompleted ? " completed" : isToday ? " today" : ""}`}
                className={`h-[52px] rounded-xl border-0 shadow-none p-1 flex flex-col items-center justify-between transition-transform active:scale-95 ${tileClasses} ${todayRingClasses}`}
              >
                <span className="font-mono text-xs font-black leading-none mt-0.5">
                  {day}
                </span>

                {isFuture ? (
                  <Lock className="w-2.5 h-2.5 opacity-45 mb-0.5" />
                ) : isCompleted ? (
                  <div className="flex flex-col items-center leading-none gap-0.5">
                    <Trophy className="w-2.5 h-2.5 shrink-0 stroke-[2.4]" />
                    <span className="font-mono text-[8.5px] font-bold tracking-tighter">
                      {formatDurationMMSS(record.timeSeconds)}
                    </span>
                  </div>
                ) : isFailed ? (
                  <div className="flex flex-col items-center leading-none gap-0.5">
                    <XCircle className="w-2.5 h-2.5 shrink-0 stroke-[2.4]" />
                    <span className="font-mono text-[8px] font-bold uppercase">
                      {td("daily.failedShort", "3/3")}
                    </span>
                  </div>
                ) : isInProgress ? (
                  <div className="flex flex-col items-center leading-none gap-0.5">
                    <Clock
                      className={`w-2.5 h-2.5 shrink-0 stroke-[2.4] ${
                        darkMode ? "text-sky-400" : "text-[#0369A1]"
                      }`}
                    />
                    <span className="font-mono text-[10px] font-bold">
                      {formatDurationMMSS(progress.elapsedSeconds)}
                    </span>
                  </div>
                ) : isToday ? (
                  <span className="font-mono text-[9px] font-black uppercase tracking-tight mb-0.5">
                    {getShortDifficultyLabel(dayDifficulty)}
                  </span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-35 mb-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Legend & Archive Rule Note */}
        <div
          className={`w-full rounded-2xl border-0 shadow-none px-3 py-2 flex flex-col gap-1.5 text-[10px] font-semibold ${
            darkMode
              ? "bg-[#222225] text-zinc-300"
              : "bg-[#F4EFE6] text-stone-700"
          }`}
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Trophy
                className={`w-3 h-3 shrink-0 ${
                  darkMode ? "text-emerald-400" : "text-[#065F46]"
                }`}
              />
              <span>{td("daily.legendCompleted", "Completed")}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span
                className={`w-2.5 h-2.5 rounded-full inline-block ${
                  darkMode
                    ? "bg-[#78350F]/70 ring-2 ring-[#F59E0B]"
                    : "bg-[#FEF3C7] ring-2 ring-[#D97706]"
                }`}
              />
              <span>{td("daily.legendToday", "Today")}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock
                className={`w-3 h-3 shrink-0 ${
                  darkMode ? "text-sky-400" : "text-[#0369A1]"
                }`}
              />
              <span>{td("daily.legendInProgress", "In Progress")}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full inline-block ${
                  darkMode ? "bg-zinc-400" : "bg-stone-500"
                }`}
              />
              <span>{td("daily.legendArchive", "Archive")}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Lock
                className={`w-3 h-3 shrink-0 ${
                  darkMode ? "text-zinc-500" : "text-stone-500"
                }`}
              />
              <span>{td("daily.legendLocked", "Locked")}</span>
            </span>
          </div>
          <p className={`leading-snug ${darkMode ? "text-zinc-400" : "text-stone-600"}`}>
            {td(
              "daily.archiveStreakNote",
              "Past archive puzzles save your solve time but do not increment active streaks."
            )}
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
